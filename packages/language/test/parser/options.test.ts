import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes } from '../helpers'

const withEquals = resolveProfile(
  { id: 'equals', extends: 'es', options: { assignWithEquals: true } },
  builtinProfiles,
)
const untyped = resolveProfile(
  { id: 'untyped', extends: 'es', options: { typedParameters: false } },
  builtinProfiles,
)

describe('requireSemicolons: false', () => {
  it('terminates statements on a line break', () => {
    const source = 'Proceso p\nDefinir a Como Entero\na <- 1\nEscribir a\nFinProceso'
    expect(diagnosticCodes(source, profiles.pseint)).toEqual([])
    expect(ast(source, profiles.pseint)).toBe(
      '(program (main p (define (a) (type integer)) (assign a (literal 1)) (write a)))',
    )
  })

  it('still accepts explicit semicolons', () => {
    expect(diagnosticCodes('Proceso p\na <- 1;\nFinProceso', profiles.pseint)).toEqual([])
  })

  it('accepts a statement running straight into a block closer', () => {
    expect(
      diagnosticCodes('Proceso p\nSi a Entonces\nEscribir 1\nFinSi\nFinProceso', profiles.pseint),
    ).toEqual([])
  })

  it('still reports garbage on the same line', () => {
    expect(diagnosticCodes('Proceso p\na <- 1 )\nFinProceso', profiles.pseint)).toEqual(['E2002'])
  })
})

describe('assignWithEquals', () => {
  it('accepts "=" as assignment and marks viaEquals', () => {
    expect(ast('Proceso p\na = 1;\nFinProceso', withEquals)).toBe(
      '(program (main p (assign= a (literal 1))))',
    )
  })

  it('still accepts the arrow', () => {
    expect(ast('Proceso p\na <- 1;\nFinProceso', withEquals)).toBe(
      '(program (main p (assign a (literal 1))))',
    )
  })

  it('keeps "=" as comparison inside an expression', () => {
    expect(ast('Proceso p\nEscribir a = 1;\nFinProceso', withEquals)).toBe(
      '(program (main p (write (binary equal a (literal 1)))))',
    )
  })
})

describe('typedParameters: false', () => {
  it('accepts a bare parameter', () => {
    expect(
      diagnosticCodes('SubProceso f(arreglo)\nFinSubProceso\nProceso p\nFinProceso', untyped),
    ).toEqual([])
  })
})

describe('caseSensitive', () => {
  it('folds identifier case by default', () => {
    expect(ast('Proceso p\nMiVar <- 1;\nFinProceso')).toBe(
      '(program (main p (assign mivar (literal 1))))',
    )
  })

  it('keeps identifier case when the option is on', () => {
    const strict = resolveProfile(
      { id: 'strict', extends: 'es', options: { caseSensitive: true } },
      builtinProfiles,
    )
    expect(ast('Proceso p\nMiVar <- 1;\nFinProceso', strict)).toBe(
      '(program (main p (assign MiVar (literal 1))))',
    )
  })
})
