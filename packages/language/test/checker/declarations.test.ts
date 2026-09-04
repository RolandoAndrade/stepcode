import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf, typeOfExpr } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('Definir (§5.1)', () => {
  it('declares every name of the statement with the written type', () => {
    // `B` (case-folded to the same symbol as `b`) reads it without adding a second `b` node,
    // so `typeOfExpr(source, 'b')` below still finds exactly one match.
    const source = main('Definir a, b Como Entero;', 'a <- 1;', 'b <- a;', 'Escribir B;')
    expect(checkCodes(source)).toEqual([])
    // `b` names one typed node: the assignment target. `a` names two — the target of the
    // first assignment and the value of the second.
    expect(typeOfExpr(source, 'b')).toBe('Entero')
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
      checkCodes(
        main(
          'Definir n Como Entero;',
          'n <- 5;',
          'Definir lista Como Entero[n];',
          'lista[1] <- 1;',
        ),
      ),
    ).toEqual(['E3023'])
  })

  it('reports a second declaration of the same name, pointing at the first', () => {
    const source = main('Definir a Como Entero;', 'Definir a Como Real;', 'a <- 1;', 'Escribir a;')
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
      '  Escribir f;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3004'])
  })

  it('reports a use above the declaration once, and never as a redeclaration', () => {
    // §3.2: names are declared in source order, so `z` does not exist yet at the `Escribir` —
    // but its `Definir` does, and that is E3003, not E3001. The recovery symbol the report
    // plants only silences repeats; the real declaration replaces it silently.
    const source = main(
      'Escribir z;',
      'Escribir z;',
      'Definir z Como Entero;',
      'z <- 1;',
      'Escribir z;',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3003'])
    expect(report.result.diagnostics[0]?.related?.[0]?.span.start).toBe(
      source.indexOf('z Como Entero'),
    )
  })

  // I2: the recovery symbol stands for the name at every use since the mistake was reported,
  // so a *write* above the declaration has to count as a write — or the one mistake cascades
  // into "read but never assigned" on top of the E3003 that already said it.
  it('counts a write above the declaration, so W3003 does not pile on', () => {
    expect(checkCodes(main('x <- 1;', 'Definir x Como Entero;', 'Escribir x;'))).toEqual(['E3003'])
    expect(checkCodes(main('Leer x;', 'Definir x Como Entero;', 'Escribir x;'))).toEqual(['E3003'])
  })

  // M10: a body scope has no blocks, so a `Definir` inside an `Si` declares for the whole
  // body — and a use above it is still a use above the declaration (§3.2).
  it('sees a Definir nested in an Si as a declaration below the use', () => {
    const source = main(
      'Escribir z;',
      'Si Verdadero Entonces',
      '  Definir z Como Entero;',
      '  z <- 1;',
      'FinSi',
    )
    expect(checkCodes(source)).toEqual(['E3003'])
  })

  it('keeps E3001 for a name no declaration below ever provides', () => {
    expect(
      checkCodes(main('Escribir noExiste;', 'Definir z Como Entero;', 'z <- 1;', 'Escribir z;')),
    ).toEqual(['E3001'])
  })
})

describe('assignment (§5.4)', () => {
  it('accepts what fits and widens what widens', () => {
    expect(checkCodes(main('Definir x Como Real;', 'x <- 1;', 'Escribir x;'))).toEqual([])
    expect(checkCodes(main('Definir s Como Cadena;', "s <- 'a';", 'Escribir s;'))).toEqual([])
    expect(checkCodes(main('Definir c Como Caracter;', "c <- 'a';", 'Escribir c;'))).toEqual([])
    expect(checkCodes(main('Definir c Como Caracter;', 'c <- "a";', 'Escribir c;'))).toEqual([])
  })

  it('reports what does not fit, at the value', () => {
    const source = main('Definir n Como Entero;', 'n <- 2.5;', 'Escribir n;')
    expect(checkSource(source).diagnostics).toEqual([`E3010@${spanOf(source, '2.5')}`])
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('trunc')
  })

  it('offers the div hint when the value came from a division', () => {
    const source = main('Definir n Como Entero;', 'n <- 7 / 2;', 'Escribir n;')
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('div')
  })

  it('reports a literal too long for a Caracter', () => {
    const source = main('Definir c Como Caracter;', 'c <- "ab";', 'Escribir c;')
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
      'Escribir c;',
    )
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('index')
  })

  it('writes into one element of an array but never into a letter of a text', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'lista[1] <- 5;'))).toEqual([])
    const text = main('Definir s Como Cadena;', 's <- "ab";', "s[1] <- 'z';")
    expect(checkCodes(text)).toEqual(['E3013'])
  })

  it('refuses to assign a whole array or a subprogram name', () => {
    expect(
      checkCodes(main('Definir lista Como Entero[3];', 'lista <- 1;', 'Escribir lista[1];')),
    ).toEqual(['E3009'])
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

describe('Dimension (§5.2)', () => {
  it('turns a declared scalar into an array of that rank', () => {
    const source = main('Definir lista Como Entero;', 'Dimension lista[5];', 'lista[1] <- 2;')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'lista[1]')).toBe('Entero')
  })

  it('sizes an unsized array of the same rank', () => {
    const source = main(
      'Definir tabla Como Real[,];',
      'Dimension tabla[3,4];',
      'tabla[1,1] <- 0.5;',
    )
    expect(checkCodes(source)).toEqual([])
  })

  it('reports a name that was never declared', () => {
    const source = main('Dimension lista[5];')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3021'])
    expect(report.texts).toEqual(['lista'])
  })

  // M8: the recovery symbol an unresolved read plants is not a declaration (§3.2), so it
  // never becomes a dimensioned array — but the mistake it stands for was already reported,
  // and saying it again here would be one mistake, two diagnostics.
  it('says nothing more about a name only a recovery symbol stands for', () => {
    const source = main('Escribir lista[1];', 'Dimension lista[5];')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3001'])
    expect(report.texts).toEqual(['lista'])
  })

  it('leaves the declaration below to explain itself, once', () => {
    const read = main('Escribir x;', 'Dimension x[5];', 'Definir x Como Entero;')
    expect(checkCodes(read)).toEqual(['E3003'])
    const write = main('x[1] <- 1;', 'Dimension x[5];', 'Definir x Como Entero;')
    expect(checkCodes(write)).toEqual(['E3003'])
  })

  it('does not declare in pseint mode either', () => {
    const source = ['Proceso p', '  Dimension lista[5]', 'FinProceso'].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual(['E3021'])
  })

  it('refuses a second dimensioning', () => {
    const twice = main(
      'Definir lista Como Entero;',
      'Dimension lista[5];',
      'Dimension lista[5];',
      'Escribir lista[1];',
    )
    expect(checkSource(twice).result.diagnostics[0]?.data.hint).toBe('again')
    const sized = main('Definir lista Como Entero[5];', 'Dimension lista[5];', 'Escribir lista[1];')
    expect(checkSource(sized).result.diagnostics[0]?.data.hint).toBe('again')
  })

  it('refuses anything that is not a variable of this body', () => {
    const parameter = [
      'SubProceso f(n Como Entero)',
      '  Dimension n[5];',
      'FinSubProceso',
      'Proceso p',
      '  f(1);',
      'FinProceso',
    ].join('\n')
    expect(checkSource(parameter).result.diagnostics[0]?.data.hint).toBe('kind')
  })

  it('refuses a rank the declaration does not have', () => {
    const source = main(
      'Definir tabla Como Real[,];',
      'Dimension tabla[3];',
      'Escribir tabla[1,1];',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3022'])
    expect(report.result.diagnostics[0]?.data).toEqual({
      name: 'tabla',
      hint: 'rank',
      expected: 2,
      found: 1,
    })
  })

  it('checks its sizes the way Definir does', () => {
    expect(
      checkCodes(main('Definir lista Como Entero;', 'Dimension lista[0];', 'Escribir lista[1];')),
    ).toEqual(['E3023'])
  })
})

describe('Constante (§5.3)', () => {
  it('takes the folded value type when no type is written', () => {
    const source = main('Constante MAX <- 10;', 'Escribir MAX + 1;')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'MAX + 1')).toBe('Entero')
  })

  it('takes the written type, and checks the value against it', () => {
    expect(checkCodes(main('Constante MAX Como Real <- 10;', 'Escribir MAX;'))).toEqual([])
    const bad = main('Constante MAX Como Entero <- 2.5;', 'Escribir MAX;')
    expect(checkCodes(bad)).toEqual(['E3010'])
  })

  it('refuses a value that does not fold', () => {
    const source = main('Definir n Como Entero;', 'n <- 1;', 'Constante MAX <- n;', 'Escribir MAX;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3024'])
    expect(report.texts).toEqual(['n'])
  })

  // I3: the value did not fold because dividing by zero was already reported. Saying "this
  // has to be computable before running" on top of it is the same mistake, told twice.
  it('says nothing more when the value already failed on its own', () => {
    expect(checkCodes(main('Constante MAX <- 1 / 0;', 'Escribir MAX;'))).toEqual(['E3025'])
  })

  it('folds the value before the name exists', () => {
    const source = main('Constante A <- A;', 'Escribir A;')
    expect(checkCodes(source)).toEqual(['E3001'])
  })

  // M7: the second `Constante` is E3002 and keeps the first symbol — so it must keep the
  // first symbol's value too. `A` folding to 1 is what makes the second label a duplicate.
  it('keeps the first value when the name is declared twice', () => {
    const source = main(
      'Constante A <- 1;',
      'Constante A <- 2;',
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  A:',
      '    Escribir 2;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3002', 'E3030'])
  })

  it('is read-only: assignment and Leer are both refused', () => {
    expect(checkCodes(main('Constante MAX <- 10;', 'MAX <- 11;'))).toEqual(['E3007'])
    expect(checkCodes(main('Constante MAX <- 10;', 'Leer MAX;'))).toEqual(['E3007'])
  })

  it('refuses a constant by reference', () => {
    const source = [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Constante MAX <- 10;',
      '  f(MAX);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3032'])
  })

  it('clashes with a variable of the same name like any other declaration', () => {
    expect(
      checkCodes(
        main('Definir MAX Como Entero;', 'MAX <- 1;', 'Constante MAX <- 10;', 'Escribir MAX;'),
      ),
    ).toEqual(['E3002'])
  })
})

describe('Leer (§5.5)', () => {
  it('reads into a variable, a parameter and an array element', () => {
    expect(checkCodes(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))).toEqual([])
    expect(
      checkCodes(main('Definir lista Como Entero[3];', 'Leer lista[1];', 'Escribir lista[1];')),
    ).toEqual([])
  })

  it('reads any scalar type', () => {
    expect(
      checkCodes(
        main('Definir c Como Caracter;', 'Definir b Como Logico;', 'Leer c, b;', 'Escribir c, b;'),
      ),
    ).toEqual([])
  })

  it('refuses a whole array and a letter of a text', () => {
    expect(
      checkCodes(main('Definir lista Como Entero[3];', 'Leer lista;', 'Escribir lista[1];')),
    ).toEqual(['E3009'])
    const text = main('Definir s Como Cadena;', 's <- "ab";', 'Leer s[1];')
    expect(checkCodes(text)).toEqual(['E3013'])
  })

  // M10: the result variable is written like any other name, `Leer` included, and that write
  // is what keeps W3004 quiet (§9).
  it("reads into a function's result variable, and counts it as a write", () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  Leer r;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })

  it('never declares, not even in pseint mode', () => {
    expect(checkCodes(main('Leer total;'))).toEqual(['E3001'])
    const lenient = ['Proceso p', '  Leer total', 'FinProceso'].join('\n')
    expect(checkCodes(lenient, 'pseint')).toEqual(['E3001'])
  })

  it('counts as giving the variable a value', () => {
    expect(checkCodes(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))).toEqual([])
  })
})
