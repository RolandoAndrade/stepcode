import type { ResolvedProfile } from '@stepcode/profiles'
import type { MainBlock } from '../ast/index'
import type { CompileResult } from '../compile'
import { createDiagnostic, type Diagnostic } from '../diagnostics/index'
import { LineMap } from '../source/index'
import { type Type, typeToString } from '../types/type'
import {
  type CallEvent,
  type Context,
  type Event,
  frameForCall,
  type InputEvent,
  lineOf,
  runFrame,
} from './evaluate'
import { bodyScopeOf, createFrame, type Frame, inspectFrames, type RuntimeFrame } from './frame'
import { parseInput } from './input'
import { fail, RuntimeError, type RuntimeValue } from './value'

export interface RunOptions {
  readonly profile: ResolvedProfile
  readonly io: { write(text: string): void; clear?(): void }
  /** Default `Math.random`; returns `[0, 1)`. A seeded generator makes a run reproducible. */
  readonly random?: () => number
  /** `stackDepth` default 1000 (§4.2). */
  readonly limits?: { readonly stackDepth?: number }
}

export type RunState = 'ready' | 'paused' | 'input' | 'waiting' | 'done' | 'error'

export type PauseReason = 'step' | 'breakpoint' | 'budget'

/** §3.3. `paused` is reported before the statement at `line` executes. */
export type StepResult =
  | {
      readonly kind: 'paused'
      readonly reason: PauseReason
      readonly line: number
      readonly frames: Frame[]
    }
  | {
      readonly kind: 'input'
      readonly line: number
      /** The scalar being read and its static type; `null` for `Esperar Tecla`. */
      readonly target: { readonly name: string; readonly type: Type } | null
      /** The E4004 of the previous `input()`, when it did not parse. */
      readonly rejected?: Diagnostic
    }
  | { readonly kind: 'wait'; readonly line: number; readonly millis: number }
  | { readonly kind: 'done' }
  | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: Frame[] }

export type InputRequest = Omit<Extract<StepResult, { kind: 'input' }>, 'kind'>

/** §3.2. A command that is not legal in the current state throws a plain `Error`. */
export interface Run {
  readonly state: RunState
  /** One statement; enters calls. */
  step(): StepResult
  /** One statement; calls run to completion. */
  stepOver(): StepResult
  /** Until the current frame returns. */
  stepOut(): StepResult
  /** Until a breakpoint, or `budget` statements have executed. */
  continue(opts?: { readonly budget?: number }): StepResult
  /** Only legal in state `input`. */
  input(text: string): void
  /** Replaces the set. Legal in every state. */
  setBreakpoints(lines: Iterable<number>): void
  /** Innermost first. Legal in every state. */
  inspect(): Frame[]
}

export const DEFAULT_STACK_DEPTH = 1000

/**
 * §3.1. Refuses a program with an error-severity diagnostic, so the evaluator never meets an
 * `ErrorStmt`, an `ErrorExpr`, a second main or a misplaced subprogram. Builds the main frame
 * and executes nothing.
 */
export function start(program: CompileResult, options: RunOptions): Run {
  const error = program.diagnostics.find((one) => one.severity === 'error')
  if (error !== undefined) throw new Error(`cannot start a program with errors: ${error.code}`)
  const main = program.ast.main
  if (main === null) throw new Error('cannot start a program without a main block')
  return new Controller(program, main, options)
}

type FrameGenerator = Generator<Event, RuntimeValue | undefined, unknown>

/** §3.4: whether a pause event ends the current command, given the depth now and the pauses passed. */
type StopRule = (depth: number, passed: number) => PauseReason | null

interface Pending {
  readonly event: InputEvent
  rejected?: Diagnostic
}

class Controller implements Run {
  state: RunState = 'ready'
  private readonly ctx: Context
  private readonly stackDepth: number
  /** Index 0 is main; depth is `frames.length`. One generator per frame, innermost last. */
  private readonly frames: RuntimeFrame[] = []
  private readonly generators: FrameGenerator[] = []
  private breakpoints: ReadonlySet<number> = new Set()
  private pending: Pending | null = null
  private failure: Extract<StepResult, { kind: 'error' }> | null = null
  /** What the innermost generator receives on its next `next()`: a call's returned value. */
  private resumeWith: RuntimeValue | undefined = undefined
  /** The innermost generator is suspended at a pause event (not at an input or a wait). */
  private atPause = false
  /** The run has not yet reached the pause before the first statement. */
  private primed = false

  constructor(program: CompileResult, main: MainBlock, options: RunOptions) {
    const profile = options.profile
    this.ctx = {
      program,
      profile,
      indexBase: profile.options.indexBase,
      io: options.io,
      random: options.random ?? Math.random,
      lines: new LineMap(program.source),
    }
    this.stackDepth = options.limits?.stackDepth ?? DEFAULT_STACK_DEPTH
    const first = main.body[0]
    const frame = createFrame(bodyScopeOf(program, main), lineOf(this.ctx, first ?? main))
    this.frames.push(frame)
    this.generators.push(runFrame(this.ctx, frame))
  }

  step(): StepResult {
    return this.command('step', () => 'step')
  }

  stepOver(): StepResult {
    const depth = this.frames.length
    return this.command('stepOver', (now) => (now <= depth ? 'step' : null))
  }

  stepOut(): StepResult {
    const depth = this.frames.length
    return this.command('stepOut', (now) => (now < depth ? 'step' : null))
  }

  continue(opts: { readonly budget?: number } = {}): StepResult {
    const budget = opts.budget
    return this.command('continue', (_now, passed) =>
      budget !== undefined && passed >= budget ? 'budget' : null,
    )
  }

  input(text: string): void {
    const pending = this.pending
    if (this.state !== 'input' || pending === null) {
      throw new Error(`input is not legal in state ${this.state}`)
    }
    const target = pending.event.target
    if (target !== null) {
      const parsed = parseInput(text, target.type, this.ctx.profile)
      if (!parsed.ok) {
        pending.rejected = createDiagnostic('E4004', target.span, {
          name: target.name,
          type: typeToString(target.type, this.ctx.profile),
          text: parsed.text,
          hint: parsed.hint,
        })
        return
      }
      target.slot.value = parsed.value
    }
    this.pending = null
    this.state = 'paused'
    this.atPause = false
  }

  setBreakpoints(lines: Iterable<number>): void {
    this.breakpoints = new Set(lines)
  }

  inspect(): Frame[] {
    if (this.state === 'done') return []
    if (this.failure !== null) return this.failure.frames
    return inspectFrames(this.frames)
  }

  private innermost(): RuntimeFrame {
    const frame = this.frames[this.frames.length - 1]
    if (frame === undefined) throw new Error('the frame stack is empty')
    return frame
  }

  private command(name: string, rule: StopRule): StepResult {
    if (this.state === 'done' || this.state === 'error') {
      throw new Error(`${name} is not legal in state ${this.state}`)
    }
    if (this.state === 'input') return this.reportInput()
    try {
      return this.drive(rule)
    } catch (error) {
      if (!(error instanceof RuntimeError)) throw error
      this.failure = {
        kind: 'error',
        diagnostic: error.diagnostic,
        frames: inspectFrames(this.frames),
      }
      this.state = 'error'
      this.atPause = false
      return this.failure
    }
  }

  /**
   * §3.4, §3.5. Resumes the innermost generator and interprets events until one ends the
   * command. A pause point is counted when it is passed: resuming past the one the run is
   * sitting on counts, so `continue({ budget: 1 })` executes exactly one statement.
   */
  private drive(rule: StopRule): StepResult {
    let passed = 0
    if (!this.primed) {
      // The pause before the first statement is the position `ready` stands for (§3.1); it is
      // reached now, and passed like any other, so the first statement executes (§3.4).
      this.primed = true
      const first = this.advance()
      if (first === 'done') return this.finish()
      this.atPause = first.kind === 'pause'
    }
    if (this.atPause) passed++
    for (;;) {
      const event = this.advance()
      if (event === 'done') return this.finish()
      switch (event.kind) {
        case 'pause': {
          const reason = this.breakpoints.has(event.line)
            ? 'breakpoint'
            : rule(this.frames.length, passed)
          if (reason !== null) {
            this.state = 'paused'
            this.atPause = true
            return { kind: 'paused', reason, line: event.line, frames: this.inspect() }
          }
          passed++
          break
        }
        case 'input':
          this.state = 'input'
          this.atPause = false
          this.pending = { event }
          return this.reportInput()
        case 'wait':
          this.state = 'waiting'
          this.atPause = false
          return { kind: 'wait', line: this.innermost().line, millis: event.millis }
        case 'call':
          throw new Error('advance() consumes call events')
      }
    }
  }

  /**
   * Drives the innermost generator to its next event. A `call` event pushes the callee's
   * frame and generator and carries on; a finished generator pops its frame and hands its
   * value to the caller's generator. Only pause, input and wait events come out.
   */
  private advance(): Event | 'done' {
    for (;;) {
      const generator = this.generators[this.generators.length - 1]
      if (generator === undefined) return 'done'
      const result = generator.next(this.resumeWith)
      this.resumeWith = undefined
      if (result.done) {
        if (this.generators.length === 1) return 'done'
        this.generators.pop()
        this.frames.pop()
        this.resumeWith = result.value
        continue
      }
      const event = result.value
      if (event.kind === 'call') {
        this.enter(event)
        continue
      }
      if (event.kind === 'pause') this.innermost().line = event.line
      return event
    }
  }

  /** §5.5 steps 2 and 3: the depth limit, then the callee frame. */
  private enter(event: CallEvent): void {
    if (this.frames.length >= this.stackDepth) {
      fail('E4005', event.node.span, { name: event.node.callee.text, depth: this.stackDepth })
    }
    const frame = frameForCall(this.ctx, event)
    this.frames.push(frame)
    this.generators.push(runFrame(this.ctx, frame))
  }

  private finish(): StepResult {
    this.state = 'done'
    this.atPause = false
    return { kind: 'done' }
  }

  private reportInput(): StepResult {
    const pending = this.pending
    if (pending === null) throw new Error('no input request is pending')
    const target = pending.event.target
    const request = {
      kind: 'input' as const,
      line: this.innermost().line,
      target: target === null ? null : { name: target.name, type: target.type },
    }
    return pending.rejected === undefined ? request : { ...request, rejected: pending.rejected }
  }
}
