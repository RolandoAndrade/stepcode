import type { Expr } from '../../src/ast/index'
import { walk } from '../../src/ast/index'
import type { Diagnostic } from '../../src/diagnostics/index'
import {
  type CallEvent,
  type Context,
  type Event,
  evaluate,
  frameForCall,
  type Gen,
  type InputEvent,
  runFrame,
} from '../../src/interpreter/evaluate'
import { bodyScopeOf, createFrame, type RuntimeFrame, slotOf } from '../../src/interpreter/frame'
import { parseInput } from '../../src/interpreter/input'
import { RuntimeError, type RuntimeValue } from '../../src/interpreter/value'
import { LineMap } from '../../src/source/index'
import { compileEs, type ProfileName, profileNamed } from '../helpers'

type OnCall = (event: CallEvent) => RuntimeValue | undefined

const noCalls: OnCall = (event) => {
  throw new Error(`unexpected call of ${event.decl.name.text}`)
}

/**
 * Runs one generator to completion on the current JS stack. A `call` event is answered by
 * `onCall`; every other event is recorded and resumed with `undefined`. This is the driver the
 * expression and statement tests use before the controller exists (Task 7).
 */
export function drain<T>(gen: Gen<T>, onCall: OnCall = noCalls): { value: T; events: Event[] } {
  const events: Event[] = []
  let sent: unknown
  for (;;) {
    const result = gen.next(sent)
    if (result.done) return { value: result.value, events }
    const event = result.value
    events.push(event)
    sent = event.kind === 'call' ? onCall(event) : undefined
  }
}

export interface EvalOptions {
  /** Slot values to set on the main frame before evaluating, by variable name. */
  readonly values?: Readonly<Record<string, RuntimeValue>>
  readonly onCall?: OnCall
  readonly profileName?: ProfileName
  readonly random?: () => number
}

export interface EvalReport {
  readonly value: RuntimeValue
  readonly events: Event[]
  readonly output: string[]
  readonly frame: RuntimeFrame
}

/**
 * Compiles `source`, finds the one typed expression whose text is exactly `snippet`, and
 * evaluates it in a fresh main frame. The program supplies declarations and types; the test
 * supplies values through `options.values`.
 */
export function evalIn(source: string, snippet: string, options: EvalOptions = {}): EvalReport {
  const program = compileEs(source, options.profileName ?? 'es')
  const profile = profileNamed(options.profileName ?? 'es')
  const main = program.ast.main
  if (main === null) throw new Error('the program has no main block')
  const found: Expr[] = []
  walk(program.ast, {
    enter: (node) => {
      if (
        program.types.has(node as Expr) &&
        source.slice(node.span.start, node.span.end) === snippet
      ) {
        found.push(node as Expr)
      }
      return true
    },
  })
  const expr = found[0]
  if (found.length !== 1 || expr === undefined) {
    throw new Error(`"${snippet}" matches ${found.length} typed expressions, expected exactly 1`)
  }
  const output: string[] = []
  const ctx: Context = {
    program,
    profile,
    indexBase: profile.options.indexBase,
    io: { write: (text) => void output.push(text) },
    random: options.random ?? (() => 0.5),
    lines: new LineMap(source),
  }
  const frame = createFrame(bodyScopeOf(program, main), 1)
  for (const [name, value] of Object.entries(options.values ?? {})) {
    const symbol = frame.scope.symbols.get(
      profile.options.caseSensitive ? name : name.toLowerCase(),
    )
    if (symbol === undefined) throw new Error(`"${name}" is not declared in the fixture`)
    slotOf(frame, symbol).value = value
  }
  const { value, events } = drain(evaluate(ctx, frame, expr), options.onCall)
  return { value, events, output, frame }
}

/** The diagnostic a thunk fails with; a thunk that does not throw a `RuntimeError` is a test failure. */
export function runtimeErrorOf(fn: () => unknown): Diagnostic {
  try {
    fn()
  } catch (error) {
    if (error instanceof RuntimeError) return error.diagnostic
    throw error
  }
  throw new Error('expected a RuntimeError')
}

export interface RunMainOptions {
  readonly inputs?: readonly string[]
  readonly profileName?: ProfileName
  readonly random?: () => number
}

export interface RunMainReport {
  readonly output: string
  readonly error: Diagnostic | undefined
  readonly main: RuntimeFrame
  /** The line of every pause event, in order. */
  readonly pauses: number[]
  /** The millis of every wait event, in order. */
  readonly waits: number[]
  readonly cleared: number
}

/**
 * A miniature controller for the statement tests: runs main to the end, opening a frame per
 * call event and answering input events from `inputs`. A rejected or missing input throws a
 * plain `Error`, since these tests never exercise the rejection loop (that is Task 7's).
 */
export function runMain(source: string, options: RunMainOptions = {}): RunMainReport {
  const program = compileEs(source, options.profileName ?? 'es')
  const profile = profileNamed(options.profileName ?? 'es')
  const mainBlock = program.ast.main
  if (mainBlock === null) throw new Error('the program has no main block')
  let output = ''
  let cleared = 0
  const ctx: Context = {
    program,
    profile,
    indexBase: profile.options.indexBase,
    io: {
      write: (text) => {
        output += text
      },
      clear: () => {
        cleared++
      },
    },
    random: options.random ?? (() => 0.5),
    lines: new LineMap(source),
  }
  const main = createFrame(bodyScopeOf(program, mainBlock), 1)
  const frames: RuntimeFrame[] = [main]
  const stack: Gen<RuntimeValue | undefined>[] = [runFrame(ctx, main)]
  const pauses: number[] = []
  const waits: number[] = []
  const inputs = [...(options.inputs ?? [])]
  const answer = (event: InputEvent): void => {
    const text = inputs.shift()
    if (text === undefined) throw new Error('the program asked for more input than the test gave')
    if (event.target === null) return
    const parsed = parseInput(text, event.target.type, profile)
    if (!parsed.ok) throw new Error(`"${text}" was rejected for ${event.target.name}`)
    event.target.slot.value = parsed.value
  }
  let sent: RuntimeValue | undefined
  try {
    for (;;) {
      const gen = stack[stack.length - 1]
      if (gen === undefined) break
      const result = gen.next(sent)
      sent = undefined
      if (result.done) {
        stack.pop()
        frames.pop()
        if (stack.length === 0) break
        sent = result.value
        continue
      }
      const event = result.value
      switch (event.kind) {
        case 'pause':
          pauses.push(event.line)
          break
        case 'input':
          answer(event)
          break
        case 'wait':
          waits.push(event.millis)
          break
        case 'call': {
          const frame = frameForCall(ctx, event)
          frames.push(frame)
          stack.push(runFrame(ctx, frame))
          break
        }
      }
    }
    return { output, error: undefined, main, pauses, waits, cleared }
  } catch (error) {
    if (error instanceof RuntimeError) {
      return { output, error: error.diagnostic, main, pauses, waits, cleared }
    }
    throw error
  }
}
