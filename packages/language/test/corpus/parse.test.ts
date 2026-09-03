import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parse } from '../../src/parser/parse'
import { assertTreeInvariants } from '../helpers'

const dir = fileURLToPath(new URL('./programs', import.meta.url))
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

describe('the v1 conformance corpus', () => {
  it('is not empty', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it('lists the index-base-0 programs it extracted', () => {
    const listed = readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
      .split('\n')
      .filter((line) => line.length > 0)
    expect(listed.length).toBeGreaterThan(0)
    for (const slug of listed) expect(files).toContain(`${slug}.stepcode`)
  })

  for (const file of files) {
    describe(file, () => {
      const source = readFileSync(join(dir, file), 'utf8')
      const result = parse(source, { profile: profiles.pseint })

      it('parses with no errors', () => {
        expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')).toEqual(
          [],
        )
      })

      it('warns only about empty statements, if at all', () => {
        expect(
          [...new Set(result.diagnostics.map((diagnostic) => diagnostic.code))].filter(
            (code) => code !== 'W2001',
          ),
        ).toEqual([])
      })

      it('satisfies the tree invariants', () => {
        expect(() => assertTreeInvariants(result)).not.toThrow()
      })

      it('is lossless', () => {
        expect(result.tokens.map((token) => token.text).join('')).toBe(source)
      })

      it('has a main block', () => {
        expect(result.program.main).not.toBeNull()
      })

      it('is deterministic', () => {
        const again = parse(source, { profile: profiles.pseint })
        expect(again.diagnostics).toEqual(result.diagnostics)
        expect(again.program).toEqual(result.program)
      })
    })
  }
})
