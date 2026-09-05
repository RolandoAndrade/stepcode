import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { corpusPrograms, profileNamed } from '../helpers'

const programs = corpusPrograms()

describe('the conformance corpus under the default profile', () => {
  it('is not empty', () => {
    expect(programs.length).toBeGreaterThan(50)
  })

  for (const { file, source, profileName } of programs) {
    it(`${file} compiles with no errors`, () => {
      const { diagnostics } = compile(source, { profile: profileNamed(profileName) })
      const errors = diagnostics.filter((one) => one.severity === 'error')
      expect(
        errors.map((one) => `${one.code}@${source.slice(one.span.start, one.span.end)}`),
      ).toEqual([])
    })
  }
})
