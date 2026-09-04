import type { CompileResult } from '../compile'
import type { Diagnostic } from '../diagnostics/index'
import type { Frame } from './frame'
import { type InputRequest, type RunOptions, start } from './run'

export interface RunProgramOptions extends RunOptions {
  readonly io: {
    write(text: string): void
    clear?(): void
    /** Answers one input request; called again with `rejected` set when the text did not parse. */
    read(request: InputRequest): Promise<string>
  }
  /** Checked before every `continue` and after every `await`; an abort returns `aborted`. */
  readonly signal?: AbortSignal
  /** Default `setTimeout`. Tests pass a no-op. */
  readonly sleep?: (millis: number) => Promise<void>
  /** Statements per slice before yielding one macrotask to the host's event loop. */
  readonly budget?: number
}

export type RunOutcome =
  | { readonly kind: 'done' }
  | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: Frame[] }
  | { readonly kind: 'aborted' }

export const DEFAULT_BUDGET = 10_000

const timeout = (millis: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, millis)
  })

/**
 * §3.6: `start` plus a loop over `continue({ budget })`. A `budget` pause awaits one
 * macrotask so the host's event loop runs; an input request awaits `io.read`; a wait awaits
 * `sleep`. No breakpoints are set, so a `breakpoint` pause cannot occur. Never throws for an
 * abort; a program with errors throws from `start`, as a rejected promise.
 */
export async function runProgram(
  program: CompileResult,
  options: RunProgramOptions,
): Promise<RunOutcome> {
  const run = start(program, options)
  const sleep = options.sleep ?? timeout
  const budget = options.budget ?? DEFAULT_BUDGET
  const signal = options.signal
  const aborted = (): boolean => signal?.aborted === true
  for (;;) {
    if (aborted()) return { kind: 'aborted' }
    const result = run.continue({ budget })
    switch (result.kind) {
      case 'done':
        return { kind: 'done' }
      case 'error':
        return { kind: 'error', diagnostic: result.diagnostic, frames: result.frames }
      case 'paused':
        await timeout(0)
        break
      case 'input': {
        const request: InputRequest =
          result.rejected === undefined
            ? { line: result.line, target: result.target }
            : { line: result.line, target: result.target, rejected: result.rejected }
        const text = await options.io.read(request)
        if (aborted()) return { kind: 'aborted' }
        run.input(text)
        break
      }
      case 'wait':
        await sleep(result.millis)
        break
    }
  }
}
