import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf, typeOfExpr } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('Definir (§5.1)', () => {
  it('declares every name of the statement with the written type', () => {
    const source = main('Definir a, b Como Entero;', 'a <- 1;', 'b <- a;')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'a')).toBe('Entero')
  })

  it('declares an unsized array of the written rank', () => {
    const source = main('Definir lista Como Entero[];', 'Escribir lista[1];')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'lista[1]')).toBe('Entero')
  })

  it('accepts a constant size and refuses one that is not a positive integer', () => {
    expect(checkCodes(main('Definir lista Como Entero[10];', 'lista[1] <- 1;'))).toEqual([])
    expect(checkCodes(main('Definir lista Como Entero[0];', 'lista[1] <- 1;'))).toEqual(['E3023'])
    expect(checkCodes(main('Definir lista Como Entero[2.5];', 'lista[1] <- 1;'))).toEqual(['E3023'])
    expect(
      checkCodes(main('Definir n Como Entero;', 'Definir lista Como Entero[n];', 'lista[1] <- 1;')),
    ).toEqual(['E3023'])
  })

  it('reports a second declaration of the same name, pointing at the first', () => {
    const source = main('Definir a Como Entero;', 'Definir a Como Real;', 'a <- 1;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3002'])
    expect(report.result.diagnostics[0]?.related?.[0]?.span.start).toBe(
      source.indexOf('a Como Entero'),
    )
  })

  it('names the parameter and the result variant of a redeclaration', () => {
    const parameter = [
      'SubProceso f(n Como Entero)',
      '  Definir n Como Entero;',
      'FinSubProceso',
      'Proceso p',
      '  f(1);',
      'FinProceso',
    ].join('\n')
    expect(checkSource(parameter).result.diagnostics[0]?.data.hint).toBe('parameter')
    const result = [
      'Funcion r Como Entero <- f()',
      '  Definir r Como Entero;',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkSource(result).result.diagnostics[0]?.data.hint).toBe('result')
  })

  it('reports a variable named like a subprogram', () => {
    const source = [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  Definir f Como Entero;',
      '  f <- 1;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3004'])
  })

  it('says nothing about a name the recovery of an unknown read had already planted', () => {
    // §3.2, one mistake one diagnostic: the recovery symbol only silences repeats of E3001,
    // so the real declaration replaces it instead of colliding with it.
    const source = main('Escribir z;', 'Definir z Como Entero;', 'z <- 1;')
    expect(checkCodes(source)).toEqual(['E3001'])
  })
})

describe('assignment (§5.4)', () => {
  it('accepts what fits and widens what widens', () => {
    expect(checkCodes(main('Definir x Como Real;', 'x <- 1;'))).toEqual([])
    expect(checkCodes(main('Definir s Como Cadena;', "s <- 'a';"))).toEqual([])
    expect(checkCodes(main('Definir c Como Caracter;', "c <- 'a';"))).toEqual([])
    expect(checkCodes(main('Definir c Como Caracter;', 'c <- "a";'))).toEqual([])
  })

  it('reports what does not fit, at the value', () => {
    const source = main('Definir n Como Entero;', 'n <- 2.5;')
    expect(checkSource(source).diagnostics).toEqual([`E3010@${spanOf(source, '2.5')}`])
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('trunc')
  })

  it('offers the div hint when the value came from a division', () => {
    const source = main('Definir n Como Entero;', 'n <- 7 / 2;')
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('div')
  })

  it('reports a literal too long for a Caracter', () => {
    const source = main('Definir c Como Caracter;', 'c <- "ab";')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3011'])
    expect(report.result.diagnostics[0]?.data.length).toBe(2)
  })

  it('reports a Cadena variable stored in a Caracter with the index hint', () => {
    const source = main(
      'Definir c Como Caracter;',
      'Definir s Como Cadena;',
      's <- "ab";',
      'c <- s;',
    )
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('index')
  })

  it('writes into one element of an array but never into a letter of a text', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'lista[1] <- 5;'))).toEqual([])
    const text = main('Definir s Como Cadena;', 's <- "ab";', "s[1] <- 'z';")
    expect(checkCodes(text)).toEqual(['E3013'])
  })

  it('refuses to assign a whole array or a subprogram name', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'lista <- 1;'))).toEqual(['E3009'])
    const subprogram = [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  f <- 1;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(subprogram)).toEqual(['E3005'])
  })

  it('reports an assignment to a name that was never declared', () => {
    expect(checkCodes(main('total <- 1;'))).toEqual(['E3001'])
  })

  it('declares on first assignment in pseint mode, with the value type', () => {
    const source = ['Proceso p', '  total <- 1', '  Escribir total + 1', 'FinProceso'].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual([])
    expect(typeOfExpr(source, 'total + 1', 'pseint')).toBe('Entero')
  })

  it('still refuses a read of an undeclared name in pseint mode', () => {
    const source = ['Proceso p', '  Escribir total', 'FinProceso'].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual(['E3001'])
  })
})

describe('Escribir (§5.6)', () => {
  it('takes any scalar', () => {
    expect(checkCodes(main('Escribir 1, "a", Verdadero;'))).toEqual([])
  })

  it('refuses a whole array', () => {
    const source = main('Definir lista Como Entero[3];', 'Escribir lista;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3009'])
    // The span covers the argument, not the statement.
    expect(report.texts).toEqual(['lista'])
  })
})
