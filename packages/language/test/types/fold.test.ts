import { describe, expect, it } from 'vitest'
import type { Identifier } from '../../src/ast/index'
import { fold } from '../../src/types/fold'
import type { ConstValue } from '../../src/types/type'
import { parseExpr } from '../helpers'

const constants: Record<string, ConstValue> = {
  max: { type: 'integer', value: 10 },
  saludo: { type: 'string', value: 'hola' },
}

const lookup = (id: Identifier): ConstValue | undefined => constants[id.name]

const folded = (source: string): ConstValue | undefined => fold(parseExpr(source), lookup)

describe('constant folding (§4.6)', () => {
  it('folds every literal', () => {
    expect(folded('7')).toEqual({ type: 'integer', value: 7 })
    expect(folded('2.5')).toEqual({ type: 'real', value: 2.5 })
    expect(folded('"ab"')).toEqual({ type: 'string', value: 'ab' })
    expect(folded('Verdadero')).toEqual({ type: 'boolean', value: true })
  })

  it('folds a constant symbol and nothing else that is named', () => {
    expect(folded('max')).toEqual({ type: 'integer', value: 10 })
    expect(folded('otra')).toBeUndefined()
  })

  it('keeps integer arithmetic integer and widens as soon as a Real appears', () => {
    expect(folded('2 + 3 * 4')).toEqual({ type: 'integer', value: 14 })
    expect(folded('2 + 0.5')).toEqual({ type: 'real', value: 2.5 })
    expect(folded('max - 4')).toEqual({ type: 'integer', value: 6 })
  })

  it('makes / and ^ Real even when the answer is whole', () => {
    expect(folded('4 / 2')).toEqual({ type: 'real', value: 2 })
    expect(folded('2 ^ 3')).toEqual({ type: 'real', value: 8 })
  })

  it('keeps DIV and MOD integer and refuses a Real operand', () => {
    expect(folded('7 DIV 2')).toEqual({ type: 'integer', value: 3 })
    expect(folded('7 MOD 2')).toEqual({ type: 'integer', value: 1 })
    expect(folded('-7 DIV 2')).toEqual({ type: 'integer', value: -3 })
    expect(folded('7.0 DIV 2')).toBeUndefined()
  })

  it('refuses to fold a division by zero instead of inventing infinity', () => {
    expect(folded('1 / 0')).toBeUndefined()
    expect(folded('1 DIV 0')).toBeUndefined()
    expect(folded('1 MOD 0')).toBeUndefined()
  })

  it('folds text concatenation', () => {
    expect(folded('saludo + " mundo"')).toEqual({ type: 'string', value: 'hola mundo' })
    expect(folded('"a" + 1')).toBeUndefined()
  })

  it('folds comparisons and logic', () => {
    expect(folded('3 < 4')).toEqual({ type: 'boolean', value: true })
    expect(folded('"a" = "b"')).toEqual({ type: 'boolean', value: false })
    expect(folded('3 <> 3')).toEqual({ type: 'boolean', value: false })
    expect(folded('Verdadero Y Falso')).toEqual({ type: 'boolean', value: false })
    expect(folded('Verdadero O Falso')).toEqual({ type: 'boolean', value: true })
    expect(folded('NO Verdadero')).toEqual({ type: 'boolean', value: false })
    expect(folded('1 Y Verdadero')).toBeUndefined()
  })

  it('folds unary minus and keeps the operand type', () => {
    expect(folded('-max')).toEqual({ type: 'integer', value: -10 })
    expect(folded('-2.5')).toEqual({ type: 'real', value: -2.5 })
    expect(folded('-"a"')).toBeUndefined()
  })

  it('never folds a call, an index or a builtin', () => {
    expect(folded('Longitud("abc")')).toBeUndefined()
    expect(folded('f(1)')).toBeUndefined()
    expect(folded('a[1]')).toBeUndefined()
  })

  it('gives up rather than return a non-finite number', () => {
    expect(folded('9 ^ 9 ^ 9 ^ 9')).toBeUndefined()
  })
})
