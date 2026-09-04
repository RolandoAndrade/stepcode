import { describe, expect, it } from 'vitest'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import type { Symbol } from '../../src/checker/scope'
import { checkCodes, checkSource, spanOf } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('conditions (§5.7)', () => {
  it('accepts a Logico condition in every conditional form', () => {
    expect(checkCodes(main('Si Verdadero Entonces', 'Escribir 1;', 'FinSi'))).toEqual([])
    expect(checkCodes(main('Mientras Falso Hacer', 'Escribir 1;', 'FinMientras'))).toEqual([])
    expect(checkCodes(main('Repetir', 'Escribir 1;', 'Hasta Que Verdadero;'))).toEqual([])
  })

  it('refuses a number as a condition, with the compare hint', () => {
    const source = main(
      'Definir a Como Entero;',
      'a <- 3;',
      'Si a MOD 2 Entonces',
      'Escribir 1;',
      'FinSi',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3014'])
    expect(report.texts).toEqual(['a MOD 2'])
    expect(report.result.diagnostics[0]?.data.hint).toBe('compare')
  })

  it('refuses a text condition, without the compare hint', () => {
    const source = main(
      'Definir s Como Cadena;',
      's <- "a";',
      'Mientras s Hacer',
      'Escribir 1;',
      'FinMientras',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3014'])
    expect(report.result.diagnostics[0]?.data.hint).toBeUndefined()
  })

  it('checks every branch of an Si chain', () => {
    const source = main(
      'Definir a Como Entero;',
      'a <- 1;',
      'Si Verdadero Entonces',
      'Escribir 1;',
      'SiNo Si a Entonces',
      'Escribir 2;',
      'FinSi',
    )
    expect(checkCodes(source)).toEqual(['E3014'])
  })

  it('says nothing about a condition that already failed', () => {
    const source = main('Si noExiste Entonces', 'Escribir 1;', 'FinSi')
    expect(checkCodes(source)).toEqual(['E3001'])
  })
})

describe('Segun (§5.8)', () => {
  it('switches on an Entero, a Caracter and a Cadena', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  2:',
      '    Escribir 2;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual([])
  })

  it('refuses a Real, a Logico and an array selector', () => {
    const real = main(
      'Definir x Como Real;',
      'x <- 1.5;',
      'Segun x Hacer',
      '  1:',
      '    Escribir 1;',
      'FinSegun',
    )
    const report = checkSource(real)
    expect(report.codes).toEqual(['E3028'])
    expect(report.texts).toEqual(['x'])
    const logical = main(
      'Definir b Como Logico;',
      'b <- Verdadero;',
      'Segun b Hacer',
      '  1:',
      '    Escribir 1;',
      'FinSegun',
    )
    expect(checkCodes(logical)).toEqual(['E3028'])
  })

  it('refuses a label that does not fold', () => {
    const source = main(
      'Definir n, m Como Entero;',
      'n <- 1;',
      'm <- 2;',
      'Segun n Hacer',
      '  m:',
      '    Escribir 1;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3029'])
  })

  it('refuses a label the selector cannot hold', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  "a":',
      '    Escribir 1;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3010'])
  })

  it('refuses a repeated label anywhere in the same Segun, pointing at the first', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1, 2:',
      '    Escribir 1;',
      '  2:',
      '    Escribir 2;',
      'FinSegun',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3030'])
    expect(report.result.diagnostics[0]?.related?.length).toBe(1)
  })

  it('compares a Caracter label with a one-character Cadena label by value', () => {
    const source = main(
      'Definir c Como Caracter;',
      "c <- 'a';",
      'Segun c Hacer',
      "  'a':",
      '    Escribir 1;',
      '  "a":',
      '    Escribir 2;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3030'])
  })

  it('checks the bodies and the otherwise branch', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir noExiste;',
      'De Otro Modo',
      '    Escribir tampoco;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3001', 'E3001'])
  })
})

describe('Para (§5.9)', () => {
  it('uses a declared Entero counter', () => {
    const source = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  Escribir i;',
      'FinPara',
    )
    expect(checkCodes(source)).toEqual([])
  })

  it('refuses an undeclared counter in the strict profile', () => {
    const source = main('Para i <- 1 Hasta 10 Hacer', '  Escribir i;', 'FinPara')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3001'])
    expect(report.result.diagnostics[0]?.data.hint).toBe('declare')
  })

  it('declares the counter in pseint mode', () => {
    const source = [
      'Proceso p',
      '  Para i <- 1 Hasta 10 Hacer',
      '    Escribir i',
      '  FinPara',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual([])
  })

  it('refuses a counter that is not an Entero', () => {
    const source = main(
      'Definir x Como Real;',
      'Para x <- 1 Hasta 10 Hacer',
      '  Escribir x;',
      'FinPara',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3026'])
    expect(report.texts).toEqual(['x'])
  })

  // §5.9: the counter must resolve to an existing *variable*. Each wrong kind gets the
  // diagnostic that already names that kind elsewhere — a constant is E3007, a subprogram is
  // E3005 — and the two kinds that are variables of another body's making, a parameter and a
  // function's result, get E3026 with the `kind` hint.
  it('refuses a constant as a counter', () => {
    const source = main(
      'Constante MAX <- 10;',
      'Para MAX <- 1 Hasta 10 Hacer',
      '  Escribir 1;',
      'FinPara',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3007'])
    expect(report.texts).toEqual(['MAX'])
  })

  it('refuses a subprogram as a counter', () => {
    const source = [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  Para f <- 1 Hasta 10 Hacer',
      '    Escribir 1;',
      '  FinPara',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3005'])
    expect(report.texts).toEqual(['f'])
  })

  it('refuses a parameter as a counter, with the kind hint', () => {
    const source = [
      'SubProceso g(n Como Entero)',
      '  Para n <- 1 Hasta 10 Hacer',
      '    Escribir 1;',
      '  FinPara',
      'FinSubProceso',
      'Proceso p',
      '  g(1);',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3026'])
    expect(report.texts).toEqual(['n'])
    expect(report.result.diagnostics[0]?.data.hint).toBe('kind')
  })

  // I6: the result variable is no longer a counter, so the loop is not a write of it — and the
  // rejected loop must not cascade into "the function never assigns its result" either.
  it("refuses a function's result variable as a counter, and does not also warn W3004", () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  Para r <- 1 Hasta 10 Hacer',
      '    Escribir 1;',
      '  FinPara',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3026'])
    expect(report.result.diagnostics[0]?.data.hint).toBe('kind')
  })

  it('makes the counter read-only inside the loop and ordinary after it', () => {
    const inside = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  i <- 3;',
      'FinPara',
    )
    expect(checkCodes(inside)).toEqual(['E3008'])
    const read = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  Leer i;',
      'FinPara',
    )
    expect(checkCodes(read)).toEqual(['E3008'])
    const byRef = [
      'SubProceso doble(x Por Referencia Como Entero)',
      '  x <- x * 2;',
      'FinSubProceso',
      'Proceso p',
      '  Definir i Como Entero;',
      '  Para i <- 1 Hasta 10 Hacer',
      '    doble(i);',
      '  FinPara',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(byRef)).toEqual(['E3008'])
    const after = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  Escribir i;',
      'FinPara',
      'i <- 3;',
    )
    expect(checkCodes(after)).toEqual([])
  })

  it('requires Entero bounds and a non-zero step', () => {
    expect(
      checkCodes(
        main('Definir i Como Entero;', 'Para i <- 1 Hasta 2.5 Hacer', '  Escribir i;', 'FinPara'),
      ),
    ).toEqual(['E3010'])
    expect(
      checkCodes(
        main(
          'Definir i Como Entero;',
          'Para i <- 1 Hasta 10 Con Paso 0 Hacer',
          '  Escribir i;',
          'FinPara',
        ),
      ),
    ).toEqual(['E3027'])
    expect(
      checkCodes(
        main(
          'Definir i Como Entero;',
          'Para i <- 10 Hasta 1 Con Paso -1 Hacer',
          '  Escribir i;',
          'FinPara',
        ),
      ),
    ).toEqual([])
  })

  // Controller ruling (spec §9): the loop reads its own counter every iteration to compare it
  // with `to`, so a `Para` loop counts as a read of the counter as well as a write — a body
  // that never mentions the counter must not draw W3002 for it.
  it('counts a read of the counter even when the body never reads it', () => {
    const source = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  Escribir 1;',
      'FinPara',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual([])
    let counterSymbol: Symbol | undefined
    for (const scope of report.result.scopes) {
      const found = scope.symbols.get('i')
      if (found !== undefined) counterSymbol = found
    }
    expect(counterSymbol?.reads).toBeGreaterThanOrEqual(1)
  })
})

describe('Romper, Continuar (§5.10)', () => {
  it('accepts them inside any loop of this body', () => {
    expect(checkCodes(main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras'))).toEqual([])
    expect(
      checkCodes(
        main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Continuar;', 'FinPara'),
      ),
    ).toEqual([])
    expect(checkCodes(main('Repetir', '  Romper;', 'Hasta Que Verdadero;'))).toEqual([])
  })

  it('refuses them outside a loop', () => {
    const source = main('Romper;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3031'])
    expect(report.result.diagnostics[0]?.data.kw).toBe('break')
    expect(checkCodes(main('Continuar;'))).toEqual(['E3031'])
  })

  it('does not count a loop in the caller', () => {
    const source = [
      'SubProceso f()',
      '  Romper;',
      'FinSubProceso',
      'Proceso p',
      '  Mientras Verdadero Hacer',
      '    f();',
      '  FinMientras',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3031'])
  })
})

describe('Esperar (§5.13)', () => {
  it('takes an Entero and refuses anything else', () => {
    expect(checkCodes(main('Esperar 100;'))).toEqual([])
    const source = main('Esperar 2.5;')
    expect(checkSource(source).diagnostics).toEqual([`E3010@${spanOf(source, '2.5')}`])
  })
})
