import { describe, expect, it } from 'vitest'
import { grammars } from '../src/index'

// The committed JSON is the per-profile snapshot. Regenerate with
// `pnpm --filter @stepcode/textmate generate` and review the diff.
describe('grammars/*.json', () => {
  for (const grammar of grammars) {
    it(`${grammar.name}.json matches the generator`, async () => {
      await expect(`${JSON.stringify(grammar, null, 2)}\n`).toMatchFileSnapshot(
        `../grammars/${grammar.name}.json`,
      )
    })
  }
})
