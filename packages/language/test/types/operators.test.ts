import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import type { BinaryOp } from '../../src/ast/index'
import {
  accepts,
  BINARY_TABLE,
  checkBinary,
  checkUnary,
  comparable,
  operatorSpelling,
  UNARY_TABLE,
} from '../../src/types/operators'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'

describe('the operand classes', () => {
  it('accepts unknown everywhere', () => {
    expect(accepts('integer', UNKNOWN)).toBe(true)
    expect(accepts('boolean', UNKNOWN)).toBe(true)
  })

  it('never accepts an array', () => {
    expect(accepts('numeric', arrayOf('integer', 1))).toBe(false)
    expect(accepts('scalar', arrayOf('integer', 1))).toBe(false)
  })

  it('sorts the five scalars into their classes', () => {
    expect(accepts('numeric', INTEGER)).toBe(true)
    expect(accepts('numeric', REAL)).toBe(true)
    expect(accepts('integer', REAL)).toBe(false)
    expect(accepts('text', CHAR)).toBe(true)
    expect(accepts('text', INTEGER)).toBe(false)
    expect(accepts('boolean', BOOLEAN)).toBe(true)
    expect(accepts('scalar', BOOLEAN)).toBe(true)
  })
})

describe('binary operators (§4.3)', () => {
  const type = (op: BinaryOp, left = INTEGER, right = INTEGER) => checkBinary(op, left, right).type

  it('has a row for every operator the AST knows', () => {
    const ops: BinaryOp[] = [
      'plus',
      'minus',
      'times',
      'divide',
      'power',
      'div',
      'mod',
      'equal',
      'notEqual',
      'lt',
      'le',
      'gt',
      'ge',
      'and',
      'or',
    ]
    for (const op of ops) expect(BINARY_TABLE[op], op).toBeDefined()
  })

  it('keeps + - * integer when both sides are integer, and widens otherwise', () => {
    expect(type('plus')).toBe(INTEGER)
    expect(type('minus', INTEGER, REAL)).toBe(REAL)
    expect(type('times', REAL, INTEGER)).toBe(REAL)
    expect(type('times', REAL, REAL)).toBe(REAL)
  })

  it('concatenates text with +', () => {
    expect(type('plus', STRING, STRING)).toBe(STRING)
    expect(type('plus', CHAR, CHAR)).toBe(STRING)
    expect(type('plus', STRING, CHAR)).toBe(STRING)
  })

  it('always yields Real for / and ^', () => {
    expect(type('divide')).toBe(REAL)
    expect(type('power')).toBe(REAL)
  })

  it('takes and yields Entero for DIV and MOD', () => {
    expect(type('div')).toBe(INTEGER)
    expect(type('mod')).toBe(INTEGER)
    expect(checkBinary('div', INTEGER, REAL).error).toEqual({
      side: 'right',
      expected: 'integer',
      found: REAL,
      hint: 'divide',
    })
    expect(checkBinary('mod', REAL, INTEGER).error).toEqual({
      side: 'left',
      expected: 'integer',
      found: REAL,
      hint: 'trunc',
    })
  })

  it('offers toText when + mixes text and numbers, on whichever side is odd', () => {
    expect(checkBinary('plus', STRING, INTEGER).error).toEqual({
      side: 'right',
      expected: 'text',
      found: INTEGER,
      hint: 'toText',
    })
    expect(checkBinary('plus', INTEGER, STRING).error).toEqual({
      side: 'right',
      expected: 'numeric',
      found: STRING,
      hint: 'toText',
    })
  })

  it('reports on the left when nothing accepts the left operand', () => {
    expect(checkBinary('minus', BOOLEAN, INTEGER).error).toEqual({
      side: 'left',
      expected: 'numeric',
      found: BOOLEAN,
    })
  })

  it('yields Logico for the logical operators and rejects anything else', () => {
    expect(type('and', BOOLEAN, BOOLEAN)).toBe(BOOLEAN)
    expect(checkBinary('or', BOOLEAN, INTEGER).error?.expected).toBe('boolean')
  })

  it('orders numbers with numbers and text with text, never one with the other', () => {
    expect(type('lt', REAL, INTEGER)).toBe(BOOLEAN)
    expect(type('ge', STRING, CHAR)).toBe(BOOLEAN)
    expect(checkBinary('gt', STRING, INTEGER).error).toEqual({
      side: 'right',
      expected: 'text',
      found: INTEGER,
    })
    expect(checkBinary('le', BOOLEAN, BOOLEAN).error?.side).toBe('left')
  })

  it('absorbs unknown: no error, no type', () => {
    expect(checkBinary('plus', UNKNOWN, BOOLEAN)).toEqual({ type: UNKNOWN })
    expect(checkBinary('div', REAL, UNKNOWN)).toEqual({ type: UNKNOWN })
  })

  it('rejects an array operand', () => {
    expect(checkBinary('plus', arrayOf('integer', 1), INTEGER).error?.side).toBe('left')
  })
})

describe('comparability (§4.4)', () => {
  it('holds when either side is assignable to the other', () => {
    expect(comparable(CHAR, STRING)).toBe(true)
    expect(comparable(INTEGER, REAL)).toBe(true)
    expect(comparable(STRING, CHAR)).toBe(true)
    expect(comparable(BOOLEAN, BOOLEAN)).toBe(true)
  })

  it('does not hold across the number/text/boolean divide', () => {
    expect(comparable(BOOLEAN, INTEGER)).toBe(false)
    expect(comparable(STRING, INTEGER)).toBe(false)
  })

  it('types = and <> as Logico and names the left type as the expectation', () => {
    expect(checkBinary('equal', CHAR, STRING).type).toBe(BOOLEAN)
    expect(checkBinary('notEqual', INTEGER, REAL).type).toBe(BOOLEAN)
    expect(checkBinary('equal', BOOLEAN, INTEGER).error).toEqual({
      side: 'right',
      expected: BOOLEAN,
      found: INTEGER,
    })
  })
})

describe('unary operators', () => {
  it('keeps the operand type under - and +, and rejects non-numbers', () => {
    expect(UNARY_TABLE.minus.operand).toBe('numeric')
    expect(checkUnary('minus', REAL).type).toBe(REAL)
    expect(checkUnary('plus', INTEGER).type).toBe(INTEGER)
    expect(checkUnary('minus', STRING).error?.expected).toBe('numeric')
  })

  it('types NO as Logico over a Logico', () => {
    expect(checkUnary('not', BOOLEAN).type).toBe(BOOLEAN)
    expect(checkUnary('not', INTEGER).error?.found).toBe(INTEGER)
  })

  it('absorbs unknown', () => {
    expect(checkUnary('not', UNKNOWN)).toEqual({ type: UNKNOWN })
  })
})

describe('operatorSpelling', () => {
  it('finds symbolic operators and word operators alike, per profile', () => {
    expect(operatorSpelling('plus', profiles.es)).toBe('+')
    expect(operatorSpelling('divide', profiles.es)).toBe('/')
    expect(operatorSpelling('div', profiles.es)).toBe('DIV')
    expect(operatorSpelling('and', profiles.es)).toBe('Y')
    expect(operatorSpelling('and', profiles.en)).toBe('And')
    expect(operatorSpelling('not', profiles.en)).toBe('Not')
  })
})
