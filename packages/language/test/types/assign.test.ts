import { describe, expect, it } from 'vitest'
import { assignable, assignFailure } from '../../src/types/assign'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'
import { parseExpr } from '../helpers'

describe('assignability (§4.2)', () => {
  it('accepts the same type', () => {
    expect(assignable(INTEGER, INTEGER)).toBe(true)
    expect(assignable(arrayOf('real', 2), arrayOf('real', 2))).toBe(true)
  })

  it('accepts unknown in either position and reports nothing about it', () => {
    expect(assignable(INTEGER, UNKNOWN)).toBe(true)
    expect(assignable(UNKNOWN, arrayOf('char', 1))).toBe(true)
    expect(assignFailure(INTEGER, UNKNOWN)).toBeUndefined()
  })

  it('widens Entero to Real but never the reverse', () => {
    expect(assignable(REAL, INTEGER)).toBe(true)
    expect(assignFailure(INTEGER, REAL)).toEqual({
      code: 'E3010',
      hint: 'trunc',
      expected: INTEGER,
      found: REAL,
    })
  })

  it('offers the div hint when the Real came from a division', () => {
    const node = parseExpr('a / b')
    expect(assignFailure(INTEGER, REAL, node)?.hint).toBe('div')
    expect(assignFailure(INTEGER, REAL, parseExpr('a * b'))?.hint).toBe('trunc')
  })

  it('widens Caracter to Cadena but never the reverse', () => {
    expect(assignable(STRING, CHAR)).toBe(true)
    expect(assignFailure(CHAR, STRING)).toEqual({
      code: 'E3010',
      hint: 'index',
      expected: CHAR,
      found: STRING,
    })
  })

  it('fits a one-character string literal into a Caracter, and only the literal', () => {
    expect(assignable(CHAR, STRING, parseExpr("'M'"))).toBe(true)
    expect(assignable(CHAR, STRING, parseExpr('"M"'))).toBe(true)
    expect(assignable(CHAR, STRING, parseExpr('nombre'))).toBe(false)
  })

  it('reports the length when the literal is too long, or empty', () => {
    expect(assignFailure(CHAR, STRING, parseExpr('"Mar"'))).toEqual({
      code: 'E3011',
      expected: CHAR,
      found: STRING,
      length: 3,
    })
    expect(assignFailure(CHAR, STRING, parseExpr('""'))?.length).toBe(0)
  })

  it('offers toNumber for text into a number and toText for a value into text', () => {
    expect(assignFailure(INTEGER, STRING)?.hint).toBe('toNumber')
    expect(assignFailure(REAL, CHAR)?.hint).toBe('toNumber')
    expect(assignFailure(STRING, INTEGER)?.hint).toBe('toText')
    expect(assignFailure(STRING, BOOLEAN)?.hint).toBe('toText')
  })

  it('has no hint for a pair nothing sensible can be said about', () => {
    const failure = assignFailure(BOOLEAN, INTEGER)
    expect(failure?.code).toBe('E3010')
    expect(failure?.hint).toBeUndefined()
  })

  it('matches arrays on element and rank, and names which one differs', () => {
    expect(assignFailure(arrayOf('integer', 1), arrayOf('integer', 2))).toEqual({
      code: 'E3010',
      hint: 'rank',
      expected: arrayOf('integer', 1),
      found: arrayOf('integer', 2),
    })
    expect(assignFailure(arrayOf('integer', 1), arrayOf('real', 1))?.hint).toBe('element')
  })

  it('never widens an array element the way it widens a scalar', () => {
    expect(assignable(arrayOf('real', 1), arrayOf('integer', 1))).toBe(false)
  })

  it('separates a scalar from an array with E3009, in both directions', () => {
    expect(assignFailure(INTEGER, arrayOf('integer', 1))).toEqual({
      code: 'E3009',
      hint: 'array',
      expected: INTEGER,
      found: arrayOf('integer', 1),
    })
    expect(assignFailure(arrayOf('integer', 1), INTEGER)).toEqual({
      code: 'E3009',
      hint: 'scalar',
      expected: arrayOf('integer', 1),
      found: INTEGER,
    })
  })
})
