import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf, typeOfExpr } from '../helpers'

describe('phase one: signatures', () => {
  it('hoists subprograms, so a call may precede the declaration', () => {
    const source = [
      'Proceso p',
      '  Escribir doble(2);',
      'FinProceso',
      'Funcion r Como Entero <- doble(n Como Entero)',
      '  r <- n * 2;',
      'FinFuncion',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'doble(2)')).toBe('Entero')
  })

  it('allows recursion', () => {
    const source = [
      'Funcion r Como Entero <- fact(n Como Entero)',
      '  Si n <= 1 Entonces',
      '    r <- 1;',
      '  SiNo',
      '    r <- n * fact(n - 1);',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir fact(5);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })

  it('reports a second subprogram of the same name, on the second', () => {
    const source = [
      'SubProceso f()',
      'FinSubProceso',
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3002'])
    // The second declaration carries it; `f()` also occurs in main, hence the offset search.
    const second = source.indexOf('f()', source.indexOf('f()') + 1)
    expect(report.diagnostics[0]).toBe(`E3002@${second}-${second + 1}`)
    expect(report.result.diagnostics[0]?.related?.length).toBe(1)
  })

  it('lists the program scope first, then one scope per body', () => {
    const source = ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  f();', 'FinProceso'].join(
      '\n',
    )
    const { result } = checkSource(source)
    expect(result.scopes.length).toBe(3)
    expect(result.scopes[0]?.kind).toBe('program')
    expect([...(result.scopes[0]?.symbols.keys() ?? [])]).toEqual(['f'])
  })

  it('keeps a subprogram from seeing main variables', () => {
    const source = [
      'SubProceso f()',
      '  Escribir total;',
      'FinSubProceso',
      'Proceso p',
      '  Definir total Como Entero;',
      '  total <- 1;',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3001'])
  })
})

describe('phase two: bodies are checked once', () => {
  it('reports a mistake in a body once, however many calls reach it', () => {
    const source = [
      'SubProceso f()',
      '  Escribir noExiste;',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3001'])
  })

  it('checks a subprogram nobody calls, in source order, at the end', () => {
    const source = [
      'SubProceso f()',
      '  Escribir noExiste;',
      'FinSubProceso',
      'Proceso p',
      '  Escribir 1;',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3001'])
    expect(report.texts).toEqual(['noExiste'])
  })

  it('checks the extra main blocks too', () => {
    // A second `Proceso` is E2011 from the parser and an `extraMains` entry here; the checker
    // still owes it a body scope and a check, so a mistake inside it is reported.
    const source = [
      'Proceso uno',
      '  Escribir 1;',
      'FinProceso',
      'Proceso dos',
      '  Escribir noExiste;',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, 'es', { allowParseErrors: true })
    expect(report.codes).toEqual(['E3001'])
    expect(report.texts).toEqual(['noExiste'])
    expect(report.result.scopes.length).toBe(3)
  })

  it('checks a subprogram written inside main exactly once', () => {
    // E2015 from the parser: the declaration stays a statement of main *and* is collected in
    // `Program.subprograms`. Phase one owns it; the statement arm skips it, so one diagnostic.
    const source = [
      'Proceso p',
      '  SubProceso f()',
      '    Escribir noExiste;',
      '  FinSubProceso',
      '  f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, 'es', { allowParseErrors: true })
    expect(report.codes).toEqual(['E3001'])
    expect(report.texts).toEqual(['noExiste'])
  })
})

describe('untyped parameters (§5.12)', () => {
  const pseint = 'pseint' as const

  it('fixes an untyped parameter from the first checked call', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n + 1',
      'FinSubProceso',
      'Proceso p',
      '  f(2)',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source, pseint)).toEqual([])
  })

  it('reports a later call that does not fit, pointing at the call that fixed it', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n + 1',
      'FinSubProceso',
      'Proceso p',
      '  f(2)',
      '  f("hola")',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, pseint)
    expect(report.codes).toEqual(['E3035'])
    expect(report.texts).toEqual(['"hola"'])
    expect(report.result.diagnostics[0]?.related?.[0]?.span.start).toBe(source.indexOf('f(2)'))
  })

  it('leaves a cycle unknown and says so on the parameter, once', () => {
    const source = [
      'SubProceso f(n)',
      '  g(n)',
      'FinSubProceso',
      'SubProceso g(m)',
      '  f(m)',
      'FinSubProceso',
      'Proceso p',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, pseint)
    expect(report.codes).toEqual(['E3015'])
    expect(report.texts).toEqual(['n'])
  })

  it('says nothing about the parameters of a subprogram nobody calls', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n',
      'FinSubProceso',
      'Proceso p',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source, pseint)).toEqual([])
  })

  it('takes the argument type, not a guess, into the body', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n + 1',
      'FinSubProceso',
      'Proceso p',
      '  f("hola")',
      'FinProceso',
    ].join('\n')
    // `n` is `Cadena`, so `n + 1` is the one mistake, inside the body.
    const report = checkSource(source, pseint)
    expect(report.codes).toEqual(['E3012'])
    expect(report.texts).toEqual(['1'])
  })
})

describe('untyped results (§5.12)', () => {
  it('infers a function result from its first assignment', () => {
    const source = [
      'Funcion r <- doble(n)',
      '  r <- n * 2',
      'FinFuncion',
      'Proceso p',
      '  Escribir doble(3)',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual([])
    expect(typeOfExpr(source, 'doble(3)', 'pseint')).toBe('Entero')
  })

  it('infers a function result from its first Retornar', () => {
    const source = [
      'Funcion mayor(a Como Entero, b Como Entero)',
      '  Si a > b Entonces',
      '    Retornar a;',
      '  FinSi',
      '  Retornar b;',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'mayor(1, 2)')).toBe('Entero')
  })

  it('reports a return value that does not fit the declared result type', () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  Retornar "hola";',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3010'])
    expect(report.texts).toEqual(['"hola"'])
  })

  it('reports a return value outside a function', () => {
    const source = ['Proceso p', '  Retornar 1;', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual(['E3033'])
    const inProcedure = [
      'SubProceso f()',
      '  Retornar 1;',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(inProcedure)).toEqual(['E3033'])
  })

  it('allows a bare Retornar anywhere', () => {
    const source = ['Proceso p', '  Retornar;', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual([])
  })
})

describe('user calls (§5.11)', () => {
  const withF = (body: string, call: string): string =>
    [
      'SubProceso f(n Como Entero)',
      `  ${body}`,
      'FinSubProceso',
      'Proceso p',
      `  ${call}`,
      'FinProceso',
    ].join('\n')

  it('checks arity exactly', () => {
    expect(checkCodes(withF('Escribir n;', 'f();'))).toEqual(['E3034'])
    expect(checkCodes(withF('Escribir n;', 'f(1, 2);'))).toEqual(['E3034'])
    expect(checkCodes(withF('Escribir n;', 'f(1);'))).toEqual([])
  })

  it('checks each argument against its parameter, at the argument', () => {
    const source = withF('Escribir n;', 'f("hola");')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3035'])
    expect(report.diagnostics).toEqual([`E3035@${spanOf(source, '"hola"')}`])
  })

  it('records every resolved call', () => {
    const source = withF('Escribir n;', 'f(1);')
    const { result, program } = checkSource(source)
    const main = program.main
    const statement = main?.body[0]
    expect(statement?.kind).toBe('CallStmt')
    if (statement?.kind === 'CallStmt' && statement.call.kind === 'Call') {
      expect(result.calls.get(statement.call)?.name.name).toBe('f')
    }
  })

  it('refuses a procedure as a value and allows a function call as a statement', () => {
    expect(checkCodes(withF('Escribir n;', 'Escribir f(1);'))).toEqual(['E3020'])
    const source = [
      'Funcion r Como Entero <- f()',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })

  it('refuses a computed argument for a by-reference parameter', () => {
    const source = [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- 0;',
      '  f(a + 1);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3032'])
    const withVariable = source.replace('f(a + 1);', 'f(a);')
    expect(checkCodes(withVariable)).toEqual([])
  })

  it('reports a call to something that is not a subprogram', () => {
    const source = [
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- 1;',
      '  a(2);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3006'])
  })

  it('reports a call to a name that does not exist at all', () => {
    const source = ['Proceso p', '  noExiste(1);', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual(['E3001'])
  })

  it('keeps the argument positions of a parameter the parser could not name', () => {
    // `Como Entero` with no name in front: the first parameter has no symbol, but it still
    // holds position one, so `"hola"` must be checked against `n` and not against nothing.
    const source = [
      'SubProceso f(Como Entero, n Como Entero)',
      '  Escribir n;',
      'FinSubProceso',
      'Proceso p',
      '  f(1, "hola");',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, 'es', { allowParseErrors: true })
    expect(report.codes).toEqual(['E3035'])
    expect(report.texts).toEqual(['"hola"'])
  })

  it('gives a function call written as a statement its own type', () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'f()')).toBe('Entero')
  })

  it('passes an array to an array parameter and refuses a scalar', () => {
    const source = [
      'SubProceso f(a Como Entero[])',
      '  Escribir a[1];',
      'FinSubProceso',
      'Proceso p',
      '  Definir lista Como Entero[10];',
      '  f(lista);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    const scalarArgument = source.replace('f(lista);', 'f(1);')
    expect(checkCodes(scalarArgument)).toEqual(['E3009'])
  })
})
