import { profiles } from '@stepcode/profiles'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { tokenize } from '../../src/lexer/index'
import { parse } from '../../src/parser/parse'
import { assertTreeInvariants } from '../helpers'

/** The pieces a StepCode program is made of, plus a few the parser must survive. */
const VOCABULARY = [
  'Proceso',
  'FinProceso',
  'SubProceso',
  'FinSubProceso',
  'Funcion',
  'FinFuncion',
  'Definir',
  'Como',
  'Entero',
  'Si',
  'Entonces',
  'Sino',
  'FinSi',
  'Segun',
  'Hacer',
  'De Otro Modo',
  'FinSegun',
  'Mientras',
  'FinMientras',
  'Repetir',
  'Hasta Que',
  'Para',
  'Hasta',
  'Con Paso',
  'FinPara',
  'Escribir',
  'Leer',
  'Retornar',
  'Romper',
  'a',
  'i',
  '1',
  '2.5',
  '"hola"',
  '<-',
  '=',
  '==',
  '+',
  '*',
  '^',
  'Y',
  'No',
  '(',
  ')',
  '[',
  ']',
  ',',
  ':',
  ';',
  '\n',
  '@',
  '$',
]

const tokenSoup = fc
  .array(fc.constantFrom(...VOCABULARY), { maxLength: 60 })
  .map((parts) => parts.join(' '))

describe('parse is total', () => {
  it('never throws on an arbitrary string', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 400 }), (source) => {
        expect(() => parse(source, { profile: profiles.es })).not.toThrow()
      }),
      { numRuns: 400 },
    )
  })

  it('never throws on an arbitrary unicode string', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'binary', maxLength: 200 }), (source) => {
        expect(() => parse(source, { profile: profiles.es })).not.toThrow()
      }),
      { numRuns: 200 },
    )
  })

  it('never throws on an arbitrary token soup, under either option set', () => {
    fc.assert(
      fc.property(tokenSoup, fc.boolean(), (source, strict) => {
        const profile = strict ? profiles.es : profiles.pseint
        expect(() => parse(source, { profile })).not.toThrow()
      }),
      { numRuns: 500 },
    )
  })

  it('keeps the tree invariants on an arbitrary token soup', () => {
    fc.assert(
      fc.property(tokenSoup, fc.boolean(), (source, strict) => {
        const profile = strict ? profiles.es : profiles.pseint
        assertTreeInvariants(parse(source, { profile }))
      }),
      { numRuns: 300 },
    )
  })
})

describe('tokenize is total and lossless', () => {
  it('always rebuilds its input', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 400 }), (source) => {
        const { tokens } = tokenize(source, profiles.es)
        expect(tokens.map((token) => token.text).join('')).toBe(source)
      }),
      { numRuns: 400 },
    )
  })

  it('always ends with exactly one eof token', () => {
    fc.assert(
      fc.property(tokenSoup, (source) => {
        const { tokens } = tokenize(source, profiles.es)
        expect(tokens.filter((token) => token.kind === 'eof')).toHaveLength(1)
        expect(tokens[tokens.length - 1]?.kind).toBe('eof')
      }),
      { numRuns: 200 },
    )
  })
})

describe('parse is deterministic', () => {
  it('returns equal results for the same input', () => {
    fc.assert(
      fc.property(tokenSoup, (source) => {
        const first = parse(source, { profile: profiles.es })
        const second = parse(source, { profile: profiles.es })
        expect(second.diagnostics).toEqual(first.diagnostics)
        expect(second.program).toEqual(first.program)
        expect(second.tokens).toEqual(first.tokens)
      }),
      { numRuns: 300 },
    )
  })
})
