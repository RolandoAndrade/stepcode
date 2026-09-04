import type { Expr } from '../../src/ast/index'
import { walk } from '../../src/ast/index'
import type { Diagnostic } from '../../src/diagnostics/index'
import {
  type CallEvent,
  type Context,
  type Event,
  evaluate,
  type Gen,
} from '../../src/interpreter/evaluate'
import { bodyScopeOf, createFrame, type RuntimeFrame, slotOf } from '../../src/interpreter/frame'
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
