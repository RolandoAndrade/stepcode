import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { runSidecar } from './helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('runSidecar (§8.1)', () => {
  it('surfaces a non-done outcome instead of masking it behind "unconsumed input(s)"', async () => {
    // Errors before reading anything, so every sidecar input is left unconsumed. The runtime
    // error is what a caller's `expect(outcome).toEqual({ kind: 'done' })` should see — not a
    // generic "unconsumed input(s)" Error that hides why the run actually stopped.
    const source = main('Definir a Como Entero;', 'a <- 0;', 'Escribir 1 / a;')
    const { outcome } = await runSidecar(
      source,
      profiles.es,
      { inputs: ['never read'], output: '' },
      'div-by-zero',
    )
    expect(outcome.kind).toBe('error')
    if (outcome.kind !== 'error') return
    expect(outcome.diagnostic.code).toBe('E4002')
  })

  it('still catches unconsumed inputs left over from a run that finished done', async () => {
    const source = main('Escribir "ok";')
    await expect(
      runSidecar(source, profiles.es, { inputs: ['stray'], output: 'ok\n' }, 'done-with-stray'),
    ).rejects.toThrow(/unconsumed input/)
  })
})
