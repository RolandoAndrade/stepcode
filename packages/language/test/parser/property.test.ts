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

/** A well-formed program: a random statement tree wrapped in `Proceso … FinProceso`. */
const { statement } = fc.letrec<{ statement: string }>((tie) => ({
  statement: fc.oneof(
    { maxDepth: 3, depthSize: 'small' },
    fc.constantFrom(
      'a <- 1;',
      'b <- a + 2 * 3;',
      'Escribir a, "hola";',
      'Leer a;',
      'Definir c Como Entero;',
      'a <- Longitud("hola");',
      'Romper;',
    ),
    fc
      .array(tie('statement'), { minLength: 1, maxLength: 3 })
      .map((body) => `Si a > 1 Entonces\n${body.join('\n')}\nSino\nEscribir 0;\nFinSi`),
    fc
      .array(tie('statement'), { minLength: 1, maxLength: 3 })
      .map((body) => `Mientras a < 10 Hacer\n${body.join('\n')}\nFinMientras`),
    fc
      .array(tie('statement'), { minLength: 1, maxLength: 3 })
      .map((body) => `Para i <- 1 Hasta 3 Con Paso 1 Hacer\n${body.join('\n')}\nFinPara`),
    fc
      .array(tie('statement'), { minLength: 1, maxLength: 2 })
      .map((body) => `Segun a Hacer\n1:\n${body.join('\n')}\nDe Otro Modo:\nEscribir 9;\nFinSegun`),
  ),
}))

const program = fc
  .array(statement, { minLength: 1, maxLength: 6 })
  .map((body) => `Proceso p\n${body.join('\n')}\nFinProceso\n`)

type Mutation = { readonly kind: 'delete' | 'duplicate' | 'swap'; readonly at: number }

const mutation: fc.Arbitrary<Mutation> = fc.record({
  kind: fc.constantFrom('delete' as const, 'duplicate' as const, 'swap' as const),
  at: fc.nat(),
})

/** Applies single-token edits to a program: the mistakes a real editing session makes. */
function mutate(source: string, mutations: readonly Mutation[]): string {
  let texts = tokenize(source, profiles.es).tokens.map((token) => token.text)
  for (const one of mutations) {
    if (texts.length < 2) break
    const at = one.at % (texts.length - 1)
    if (one.kind === 'delete') texts = [...texts.slice(0, at), ...texts.slice(at + 1)]
    else if (one.kind === 'duplicate')
      texts = [...texts.slice(0, at), texts[at] as string, ...texts.slice(at)]
    else
      texts = [
        ...texts.slice(0, at),
        texts[at + 1] as string,
        texts[at] as string,
        ...texts.slice(at + 2),
      ]
  }
  return texts.join('')
}

describe('parse survives a mutated program', () => {
  it('never throws, finishes quickly, and keeps the tree invariants', () => {
    fc.assert(
      fc.property(program, fc.array(mutation, { minLength: 1, maxLength: 3 }), (source, edits) => {
        const mutated = mutate(source, edits)
        const started = Date.now()
        const result = parse(mutated, { profile: profiles.es })
        expect(Date.now() - started).toBeLessThan(1000)
        assertTreeInvariants(result)
      }),
      { numRuns: 200 },
    )
  })
})
