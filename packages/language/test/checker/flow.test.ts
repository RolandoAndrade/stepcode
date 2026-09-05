import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('W3001 unreachable code', () => {
  it('warns once, from the statement after the jump to the end of the list', () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  Retornar 1;',
      '  Escribir 2;',
      '  Escribir 3;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['W3001'])
    expect(report.texts).toEqual(['Escribir 2;\n  Escribir 3;'])
  })

  it('warns after Romper and after Continuar too', () => {
    const broken = main('Mientras Verdadero Hacer', '  Romper;', '  Escribir 1;', 'FinMientras')
    expect(checkCodes(broken)).toEqual(['W3001'])
    const continued = main(
      'Mientras Verdadero Hacer',
      '  Continuar;',
      '  Escribir 1;',
      'FinMientras',
    )
    expect(checkCodes(continued)).toEqual(['W3001'])
  })

  it('says nothing when the jump is the last statement of its list', () => {
    const source = main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras')
    expect(checkCodes(source)).toEqual([])
  })

  it('looks at each list separately, so a jump in a branch ends only that branch', () => {
    const source = main(
      'Si Verdadero Entonces',
      '  Mientras Verdadero Hacer',
      '    Romper;',
      '  FinMientras',
      'FinSi',
      'Escribir 1;',
    )
    expect(checkCodes(source)).toEqual([])
  })
})

describe('W3002 declared but never read', () => {
  it('warns at the declaration', () => {
    const source = main('Definir a Como Entero;', 'a <- 1;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['W3002'])
    const start = source.indexOf('a Como Entero')
    expect(report.diagnostics).toEqual([`W3002@${start}-${start + 1}`])
  })

  it('warns for a variable that is never touched at all', () => {
    expect(checkCodes(main('Definir a Como Entero;'))).toEqual(['W3002'])
  })

  it('exempts parameters, constants, counters and result variables', () => {
    const parameters = [
      'SubProceso f(n Como Entero)',
      '  Escribir 1;',
      'FinSubProceso',
      'Proceso p',
      '  f(1);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(parameters)).toEqual([])
    expect(checkCodes(main('Constante MAX <- 10;'))).toEqual([])
    const counter = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 3 Hacer',
      '  Escribir 1;',
      'FinPara',
    )
    expect(checkCodes(counter)).toEqual([])
    const result = [
      'Funcion r Como Entero <- f()',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(result)).toEqual([])
  })

  it('says nothing about a name that was already reported as undeclared', () => {
    expect(checkCodes(main('Escribir noExiste;'))).toEqual(['E3001'])
  })
})

describe('W3003 read but never assigned', () => {
  it('warns at the declaration of a variable that is only read', () => {
    const source = main('Definir a Como Entero;', 'Escribir a;')
    expect(checkCodes(source)).toEqual(['W3003'])
  })

  it('counts Leer, Para, assignment and a by-reference argument as giving a value', () => {
    expect(checkCodes(main('Definir a Como Entero;', 'Leer a;', 'Escribir a;'))).toEqual([])
    expect(
      checkCodes(
        main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
      ),
    ).toEqual([])
    const byRef = [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Definir a Como Entero;',
      '  f(a);',
      '  Escribir a;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(byRef)).toEqual([])
  })

  it('exempts arrays, which Dimension and a sized declaration initialize', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'Escribir lista[1];'))).toEqual([])
    expect(
      checkCodes(main('Definir lista Como Entero;', 'Dimension lista[3];', 'Escribir lista[1];')),
    ).toEqual([])
  })

  it('gives one warning per variable, never both', () => {
    expect(checkCodes(main('Definir a Como Entero;'))).toEqual(['W3002'])
  })
})

describe('W3004 function result never assigned', () => {
  it('warns at the function name', () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  Escribir 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['W3004'])
    expect(report.texts).toEqual(['f'])
  })

  it('is satisfied by an assignment or by a Retornar', () => {
    const assigned = [
      'Funcion r Como Entero <- f()',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(assigned)).toEqual([])
    const returned = [
      'Funcion f(): Entero',
      '  Retornar 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(returned)).toEqual([])
  })

  it('says nothing about a procedure', () => {
    const source = [
      'SubProceso f()',
      '  Escribir 1;',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })
})

describe('one mistake, one diagnostic — a failed use still counts as a read', () => {
  it('a use above its own declaration is E3003 alone, not also W3002', () => {
    const source = main('Escribir x;', 'Definir x Como Entero;', 'x <- 1;')
    expect(checkCodes(source)).toEqual(['E3003'])
  })

  it('calling a variable is E3006 alone, not also W3002', () => {
    const source = main('Definir x Como Entero;', 'x <- 1;', 'x(3);')
    expect(checkCodes(source)).toEqual(['E3006'])
  })

  it('using a subprogram as a variable is E3005 alone, not also a flow warning', () => {
    const source = [
      'SubProceso f()',
      '  Escribir 1;',
      'FinSubProceso',
      'Proceso p',
      '  Escribir f;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3005'])
  })

  it('using a procedure as a value is E3020 alone, not also a flow warning', () => {
    const source = [
      'SubProceso f()',
      '  Escribir 1;',
      'FinSubProceso',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3020'])
  })
})
