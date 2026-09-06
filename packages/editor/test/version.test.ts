import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

// The About dialog shows the language version: the editor is private and never versioned,
// while `stepcode` is versioned by changesets on every release.
it('vite injects the stepcode language version, not the editor manifest version', () => {
  const config = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
  expect(config).toContain("new URL('../language/package.json', import.meta.url)")
  expect(config).not.toContain("new URL('./package.json', import.meta.url)")
})
