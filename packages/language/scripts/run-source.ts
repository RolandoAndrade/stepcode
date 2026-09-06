/**
 * The shared runner behind `extract-runs.ts` and `record-run.ts`: one program, one profile, a
 * fixed list of answers, an optional seed. It is what the corpus harness does in
 * `test/helpers.ts` (`runSidecar`), with the failure modes reported instead of thrown, so a
 * script can print them for the reviewer.
 */
import type { ResolvedProfile } from '@stepcode/profiles'
import { compile, type RunOutcome, runProgram } from '../src/index'
import { seeded } from '../test/helpers'

export type RunProblem =
  | { readonly kind: 'compile-error'; readonly codes: string[] }
  | { readonly kind: 'input-exhausted'; readonly requests: number }
  | { readonly kind: 'input-rejected'; readonly name: string; readonly text: string }

export interface RunReport {
  readonly outcome: RunOutcome | RunProblem
  readonly output: string
  /** How many input requests the program made before it ended. */
  readonly requests: number
}

/** `Azar(` / `Aleatorio(`: the program consumes `options.random`, so a run needs a seed. */
export function usesRandom(source: string): boolean {
  return /\b(?:Azar|Aleatorio)\s*\(/i.test(source)
}

/**
 * `repeat` answers every request with the last input — v1 tests written as
 * `resolve('1.5')` answered every request with one literal, and the extractor learns how
 * many answers that took from `requests`.
 */
export async function runSource(
  source: string,
  profile: ResolvedProfile,
  inputs: readonly string[],
  seed: number | undefined,
  repeat = false,
): Promise<RunReport> {
  const program = compile(source, { profile })
  const errors = program.diagnostics.filter((one) => one.severity === 'error')
  if (errors.length > 0) {
    return {
      outcome: { kind: 'compile-error', codes: errors.map((one) => one.code) },
      output: '',
      requests: 0,
    }
  }
  let output = ''
  let requests = 0
  // A holder, not a `let`: TypeScript does not see an assignment made inside `read`.
  const state: { problem: RunProblem | null } = { problem: null }
  const controller = new AbortController()
  const outcome = await runProgram(program, {
    profile,
    io: {
      write: (text) => {
        output += text
      },
      read: (request) => {
        if (request.rejected !== undefined) {
          state.problem = {
            kind: 'input-rejected',
            name: request.target?.name ?? 'key',
            text: String(request.rejected.data.text ?? ''),
          }
          controller.abort()
          return Promise.resolve('')
        }
        const text = repeat ? inputs[Math.min(requests, inputs.length - 1)] : inputs[requests]
        requests++
        if (text === undefined) {
          state.problem = { kind: 'input-exhausted', requests }
          controller.abort()
          return Promise.resolve('')
        }
        return Promise.resolve(text)
      },
    },
    sleep: () => Promise.resolve(),
    signal: controller.signal,
    ...(seed === undefined ? {} : { random: seeded(seed) }),
  })
  return { outcome: state.problem ?? outcome, output, requests }
}
