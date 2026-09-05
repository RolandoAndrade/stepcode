import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parse } from '../../src/parser/parse'
import { sexpr } from '../helpers'

const dir = fileURLToPath(new URL('./programs', import.meta.url))

/**
 * Eight corpus programs whose *shape* is pinned, not just their diagnostic count: one per
 * construct family, so a silent change in what the parser builds shows up as a snapshot diff
 * instead of passing unnoticed. The snapshots live in a committed `__snapshots__` file
 * because these programs are generated and must not be edited by hand.
 */
const PROGRAMS = [
  'addition',
  'array-operations',
  'test-multiple-statements-in-case',
  'test-simple-repeat-until-statement',
  'test-for-statement-with-positive-step',
  'test-assignation-function-with-parameters',
  'test-while-statement-with-break',
  'test-basic-concatenation',
]

describe('the shape of a representative corpus program', () => {
  for (const name of PROGRAMS) {
    it(`${name} parses to a stable tree`, () => {
      const source = readFileSync(join(dir, `${name}.stepcode`), 'utf8')
      const result = parse(source, { profile: profiles.pseint })
      expect(result.diagnostics.filter((one) => one.severity === 'error')).toEqual([])
      expect(sexpr(result.program)).toMatchSnapshot()
    })
  }
})
