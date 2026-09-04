import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { profileNamed } from '../helpers'

const dir = fileURLToPath(new URL('./programs', import.meta.url))
const zeroBased = new Set(
  readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
    .split('\n')
    .filter((line) => line.length > 0),
)
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

describe('the conformance corpus under the default profile', () => {
  it('is not empty', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  for (const file of files) {
    it(`${file} compiles with no errors`, () => {
      const profile = profileNamed(zeroBased.has(file.replace('.stepcode', '')) ? 'es0' : 'es')
      const source = readFileSync(join(dir, file), 'utf8')
      const { diagnostics } = compile(source, { profile })
      const errors = diagnostics.filter((one) => one.severity === 'error')
      expect(
        errors.map((one) => `${one.code}@${source.slice(one.span.start, one.span.end)}`),
      ).toEqual([])
    })
  }
})
