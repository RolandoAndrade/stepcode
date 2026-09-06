import { describe, expect, it } from 'vitest'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING } from '../../src/types/type'
import { checkExprIn, spanOf } from '../helpers'

const vars = {
  n: INTEGER,
  x: REAL,
  s: STRING,
  c: CHAR,
  b: BOOLEAN,
  lista: arrayOf('integer', 1),
  tabla: arrayOf('real', 2),
}

const typeOfCase = (source: string): string => checkExprIn(source, { vars }).type
const codesOfCase = (source: string): string[] => checkExprIn(source, { vars }).codes

describe('literals and names', () => {
  it('types every literal form', () => {
    expect(typeOfCase('7')).toBe('Entero')
    expect(typeOfCase('2.5')).toBe('Real')
    expect(typeOfCase('"hola"')).toBe('Cadena')
    expect(typeOfCase("'M'")).toBe('Cadena')
    expect(typeOfCase('Verdadero')).toBe('Logico')
  })

  it('types a declared name from its symbol', () => {
    expect(typeOfCase('n')).toBe('Entero')
    expect(typeOfCase('lista')).toBe('Entero[]')
    expect(codesOfCase('n')).toEqual([])
  })

  it('reports an unknown name once, however many times it appears', () => {
    expect(checkExprIn('total + total + total', { vars }).codes).toEqual(['E3001'])
  })

  it('suggests a near miss and stays quiet when nothing is near', () => {
    const near = checkExprIn('lisat', { vars })
    expect(near.codes).toEqual(['E3001'])
    const far = checkExprIn('zzzzzzz', { vars })
    expect(far.codes).toEqual(['E3001'])
  })

  it('reports a name used above its declaration', () => {
    const report = checkExprIn('total + 1', { vars, declaredAfter: { total: INTEGER } })
    expect(report.codes).toEqual(['E3003'])
    expect(report.type).toBe('Entero')
  })

  it('types an unknown name as unknown, so nothing cascades', () => {
    expect(checkExprIn('total + "a"', { vars }).codes).toEqual(['E3001'])
    expect(checkExprIn('total + "a"', { vars }).type).toBe('?')
  })
})

describe('operators over real expressions', () => {
  it('widens and keeps the §4.3 result types', () => {
    expect(typeOfCase('n + n')).toBe('Entero')
    expect(typeOfCase('n + x')).toBe('Real')
    expect(typeOfCase('n / n')).toBe('Real')
    expect(typeOfCase('n ^ 2')).toBe('Real')
    expect(typeOfCase('n DIV 2')).toBe('Entero')
    expect(typeOfCase('s + c')).toBe('Cadena')
    expect(typeOfCase('n < x')).toBe('Logico')
    expect(typeOfCase('b Y Verdadero')).toBe('Logico')
    expect(typeOfCase('NO b')).toBe('Logico')
    expect(typeOfCase('-x')).toBe('Real')
  })

  it('reports the offending operand, at that operand', () => {
    const source = 'n + b'
    const report = checkExprIn(source, { vars })
    expect(report.diagnostics).toEqual([`E3012@${spanOf(source, 'b')}`])
  })

  it('reports a MOD over a Real once, on the Real', () => {
    const source = 'x MOD 2'
    expect(checkExprIn(source, { vars }).diagnostics).toEqual([`E3012@${spanOf(source, 'x')}`])
  })

  it('reports the whole comparison mismatch once', () => {
    expect(codesOfCase('s = n')).toEqual(['E3012'])
    expect(codesOfCase("c = 'M'")).toEqual([])
    expect(codesOfCase('n = x')).toEqual([])
  })

  it('reports a constant zero divisor for /, DIV and MOD', () => {
    expect(codesOfCase('n / 0')).toEqual(['E3025'])
    expect(codesOfCase('n DIV 0')).toEqual(['E3025'])
    expect(codesOfCase('n MOD (1 - 1)')).toEqual(['E3025'])
    expect(codesOfCase('n / x')).toEqual([])
  })

  it('says nothing about an operand that already failed', () => {
    expect(codesOfCase('(n + b) * 2')).toEqual(['E3012'])
  })
})

describe('indexing (§4.5)', () => {
  it('gives the element type for the right number of indices', () => {
    expect(typeOfCase('lista[1]')).toBe('Entero')
    expect(typeOfCase('tabla[1,2]')).toBe('Real')
  })

  it('gives a Caracter for a text indexed once', () => {
    expect(typeOfCase('s[1]')).toBe('Caracter')
    expect(codesOfCase('s[1]')).toEqual([])
  })

  it('reports the index count against the rank', () => {
    expect(codesOfCase('tabla[1]')).toEqual(['E3016'])
    expect(codesOfCase('lista[1,2]')).toEqual(['E3016'])
    expect(codesOfCase('s[1,2]')).toEqual(['E3016'])
  })

  it('reports an index that is not an integer, on the index', () => {
    const source = 'lista[x]'
    expect(checkExprIn(source, { vars }).diagnostics).toEqual([`E3017@${spanOf(source, 'x')}`])
    expect(codesOfCase('lista["a"]')).toEqual(['E3017'])
  })

  it('reports indexing something that is not an array or a text, once', () => {
    const source = 'n[1]'
    const report = checkExprIn(source, { vars })
    expect(report.diagnostics).toEqual([`E3009@${spanOf(source, 'n')}`])
    expect(report.type).toBe('?')
    expect(codesOfCase('c[1]')).toEqual(['E3009'])
  })

  it('still types the indices when the target failed, so they check once each', () => {
    expect(codesOfCase('n[b]')).toEqual(['E3009'])
  })
})

describe('builtin calls (§6)', () => {
  it('types every result shape', () => {
    expect(typeOfCase('Abs(n)')).toBe('Entero')
    expect(typeOfCase('Abs(x)')).toBe('Real')
    expect(typeOfCase('rc(n)')).toBe('Real')
    expect(typeOfCase('Trunc(x)')).toBe('Entero')
    expect(typeOfCase('Longitud(s)')).toBe('Entero')
    expect(typeOfCase('Mayusculas(c)')).toBe('Caracter')
    expect(typeOfCase('Subcadena(s, 1, 2)')).toBe('Cadena')
    expect(typeOfCase('Concatenar(s, c)')).toBe('Cadena')
    expect(typeOfCase('ConvertirANumero(s)')).toBe('Real')
    expect(typeOfCase('ConvertirATexto(b)')).toBe('Cadena')
  })

  it('treats a bare builtin as a zero-argument call', () => {
    expect(typeOfCase('PI')).toBe('Real')
    expect(codesOfCase('PI')).toEqual([])
    expect(codesOfCase('Longitud')).toEqual(['E3036'])
  })

  it('reports the wrong argument count once, and nothing about the types', () => {
    expect(codesOfCase('Subcadena(s, 1)')).toEqual(['E3036'])
    expect(codesOfCase('Longitud(s, 1)')).toEqual(['E3036'])
  })

  it('reports one bad argument at that argument', () => {
    const source = 'Longitud(b)'
    expect(checkExprIn(source, { vars }).diagnostics).toEqual([`E3037@${spanOf(source, 'b')}`])
    expect(codesOfCase('Subcadena(s, x, 2)')).toEqual(['E3037'])
    expect(codesOfCase('ConvertirATexto(lista)')).toEqual(['E3037'])
  })

  it('reports every bad argument of one call, and types the call unknown', () => {
    const report = checkExprIn('Subcadena(n, x, 2)', { vars })
    expect(report.codes).toEqual(['E3037', 'E3037'])
    expect(report.type).toBe('?')
  })
})
