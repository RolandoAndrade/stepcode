import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES, formatDiagnostic } from '../../src/diagnostics/index'
import { checkSource, type ProfileName } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

interface Case {
  readonly code: string
  /** A program that triggers the code exactly once. */
  readonly source: string
  /** The source text the diagnostic must cover. */
  readonly text: string
  /** A neighbouring program that must not trigger it. */
  readonly clean: string
  readonly profile?: ProfileName
}

const withF = (header: string, body: string, call: string): string =>
  [header, `  ${body}`, 'FinSubProceso', 'Proceso p', `  ${call}`, 'FinProceso'].join('\n')

const cases: Case[] = [
  {
    code: 'E3001',
    source: main('Escribir noExiste;'),
    text: 'noExiste',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'E3002',
    source: main('Definir a Como Entero;', 'Definir a Como Real;', 'a <- 1;', 'Escribir a;'),
    text: 'a',
    clean: main('Definir a, b Como Entero;', 'a <- 1;', 'b <- 2;', 'Escribir a, b;'),
  },
  {
    code: 'E3003',
    source: main('Escribir a;', 'Definir a Como Entero;', 'a <- 1;'),
    text: 'a',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'E3004',
    source: [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  Definir f Como Entero;',
      '  f <- 1;',
      '  Escribir f;',
      'FinProceso',
    ].join('\n'),
    text: 'f',
    clean: ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  f();', 'FinProceso'].join('\n'),
  },
  {
    code: 'E3005',
    source: ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  Escribir f;', 'FinProceso'].join(
      '\n',
    ),
    text: 'f',
    clean: ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  f();', 'FinProceso'].join('\n'),
  },
  {
    code: 'E3006',
    source: main('Definir a Como Entero;', 'a <- 1;', 'a(2);'),
    text: 'a',
    clean: [
      'SubProceso a(n Como Entero)',
      '  Escribir n;',
      'FinSubProceso',
      'Proceso p',
      '  a(2);',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E3007',
    source: main('Constante MAX <- 10;', 'MAX <- 11;'),
    text: 'MAX',
    clean: main('Constante MAX <- 10;', 'Escribir MAX;'),
  },
  {
    code: 'E3008',
    source: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  i <- 9;', 'FinPara'),
    text: 'i',
    clean: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
  },
  {
    code: 'E3009',
    source: main('Definir lista Como Entero[3];', 'Escribir lista;'),
    text: 'lista',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[1];'),
  },
  {
    // The value is the array, so E3009 names the value — not the target it did not fit.
    code: 'E3009',
    source: main('Definir n Como Entero;', 'Definir b Como Entero[3];', 'n <- b;', 'Escribir n;'),
    text: 'b',
    clean: main('Definir n Como Entero;', 'n <- 1;', 'Escribir n;'),
  },
  {
    code: 'E3009',
    source: [
      'Funcion r Como Entero <- f()',
      '  Definir b Como Entero[3];',
      '  Retornar b;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n'),
    text: 'b',
    clean: [
      'Funcion r Como Entero <- f()',
      '  Retornar 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E3009',
    source: main(
      'Definir i Como Entero;',
      'Definir b Como Entero[3];',
      'Para i <- b Hasta 3 Hacer',
      '  Escribir i;',
      'FinPara',
    ),
    text: 'b',
    clean: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
  },
  {
    // In argument position the mismatch is about the argument, so E3009 names the argument.
    code: 'E3009',
    source: withF(
      'SubProceso f(n Como Entero)',
      'Escribir n;',
      'Definir b Como Entero[3];\n  f(b);',
    ),
    text: 'b',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3010',
    source: main('Definir n Como Entero;', 'n <- 2.5;', 'Escribir n;'),
    text: '2.5',
    clean: main('Definir x Como Real;', 'x <- 2.5;', 'Escribir x;'),
  },
  {
    code: 'E3011',
    source: main('Definir c Como Caracter;', 'c <- "ab";', 'Escribir c;'),
    text: '"ab"',
    clean: main('Definir c Como Caracter;', 'c <- "a";', 'Escribir c;'),
  },
  {
    code: 'E3012',
    source: main('Escribir 1 + Verdadero;'),
    text: 'Verdadero',
    clean: main('Escribir 1 + 2;'),
  },
  {
    code: 'E3013',
    source: main('Definir s Como Cadena;', 's <- "ab";', "s[1] <- 'z';"),
    text: 's[1]',
    clean: main('Definir lista Como Entero[3];', 'lista[1] <- 9;', 'Escribir lista[1];'),
  },
  {
    code: 'E3014',
    source: main('Si 1 Entonces', '  Escribir 1;', 'FinSi'),
    text: '1',
    clean: main('Si Verdadero Entonces', '  Escribir 1;', 'FinSi'),
  },
  {
    code: 'E3015',
    profile: 'pseint',
    source: [
      'SubProceso f(n)',
      '  g(n)',
      'FinSubProceso',
      'SubProceso g(m)',
      '  f(m)',
      'FinSubProceso',
      // Nothing calls `f`, so nothing brings a type in: the cycle is all there is.
      'Proceso p',
      'FinProceso',
    ].join('\n'),
    text: 'n',
    clean: [
      'SubProceso f(n)',
      '  Escribir n',
      'FinSubProceso',
      'Proceso p',
      '  f(1)',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E3016',
    source: main('Definir lista Como Entero[3];', 'Escribir lista[1,2];'),
    text: 'lista[1,2]',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[1];'),
  },
  {
    code: 'E3017',
    source: main('Definir lista Como Entero[3];', 'Escribir lista[2.5];'),
    text: '2.5',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[2];'),
  },
  {
    code: 'E3020',
    source: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'Escribir f(1);'),
    text: 'f',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3021',
    source: main('Dimension lista[5];'),
    text: 'lista',
    clean: main('Definir lista Como Entero;', 'Dimension lista[5];', 'Escribir lista[1];'),
  },
  {
    code: 'E3022',
    source: main(
      'Definir lista Como Entero;',
      'Dimension lista[5];',
      'Dimension lista[5];',
      'Escribir lista[1];',
    ),
    text: 'lista',
    clean: main('Definir lista Como Entero;', 'Dimension lista[5];', 'Escribir lista[1];'),
  },
  {
    code: 'E3023',
    source: main('Definir lista Como Entero[0];', 'Escribir lista[1];'),
    text: '0',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[1];'),
  },
  {
    code: 'E3024',
    source: main('Definir n Como Entero;', 'n <- 1;', 'Constante MAX <- n;', 'Escribir MAX;'),
    text: 'n',
    clean: main('Constante MAX <- 10;', 'Escribir MAX;'),
  },
  {
    code: 'E3025',
    source: main('Escribir 1 / 0;'),
    text: '0',
    clean: main('Escribir 1 / 2;'),
  },
  {
    code: 'E3026',
    source: main('Definir x Como Real;', 'Para x <- 1 Hasta 3 Hacer', '  Escribir x;', 'FinPara'),
    text: 'x',
    clean: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
  },
  {
    code: 'E3027',
    source: main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 3 Con Paso 0 Hacer',
      '  Escribir i;',
      'FinPara',
    ),
    text: '0',
    clean: main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 3 Con Paso 2 Hacer',
      '  Escribir i;',
      'FinPara',
    ),
  },
  {
    code: 'E3028',
    source: main(
      'Definir x Como Real;',
      'x <- 1.5;',
      'Segun x Hacer',
      '  1:',
      '    Escribir 1;',
      'FinSegun',
    ),
    text: 'x',
    clean: main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      'FinSegun',
    ),
  },
  {
    code: 'E3029',
    source: main(
      'Definir n, m Como Entero;',
      'n <- 1;',
      'm <- 2;',
      'Segun n Hacer',
      '  m:',
      '    Escribir 1;',
      'FinSegun',
    ),
    text: 'm',
    clean: main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      'FinSegun',
    ),
  },
  {
    code: 'E3030',
    source: main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  1:',
      '    Escribir 2;',
      'FinSegun',
    ),
    text: '1',
    clean: main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  2:',
      '    Escribir 2;',
      'FinSegun',
    ),
  },
  {
    code: 'E3031',
    source: main('Romper;'),
    text: 'Romper;',
    clean: main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras'),
  },
  {
    code: 'E3032',
    source: [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  f(1 + 1);',
      'FinProceso',
    ].join('\n'),
    text: '1 + 1',
    clean: [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Definir a Como Entero;',
      '  f(a);',
      '  Escribir a;',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E3033',
    source: main('Retornar 1;'),
    text: 'Retornar 1;',
    clean: main('Retornar;'),
  },
  {
    code: 'E3034',
    source: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f();'),
    text: 'f()',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3035',
    source: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f("hola");'),
    text: '"hola"',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3036',
    source: main('Escribir Longitud;'),
    text: 'Longitud',
    clean: main('Escribir Longitud("hola");'),
  },
  {
    code: 'E3037',
    source: main('Escribir Longitud(1);'),
    text: '1',
    clean: main('Escribir Longitud("hola");'),
  },
  {
    // The v1 corpus took `Longitud` of an array; §6 gives the builtin a text parameter only,
    // which is why `test-length.stepcode` was withdrawn from the strict corpus.
    code: 'E3037',
    source: main('Definir lista Como Entero[3];', 'Escribir Longitud(lista);'),
    text: 'lista',
    clean: main('Definir s Como Cadena;', 's <- "hola";', 'Escribir Longitud(s);'),
  },
  {
    // The v1 corpus took `MOD` of two `Real`s; §4.3 gives `DIV` and `MOD` integer operands
    // only, which is why `test-basic-mod-operation-2.stepcode` was withdrawn.
    code: 'E3012',
    source: main('Definir p, q Como Real;', 'p <- 5.5;', 'q <- 4.5;', 'Escribir p MOD q;'),
    text: 'p',
    clean: main('Definir n, m Como Entero;', 'n <- 5;', 'm <- 4;', 'Escribir n MOD m;'),
  },
  {
    code: 'W3001',
    source: main('Mientras Verdadero Hacer', '  Romper;', '  Escribir 1;', 'FinMientras'),
    text: 'Escribir 1;',
    clean: main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras'),
  },
  {
    code: 'W3002',
    source: main('Definir a Como Entero;', 'a <- 1;'),
    text: 'a',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'W3003',
    source: main('Definir a Como Entero;', 'Escribir a;'),
    text: 'a',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'W3004',
    source: [
      'Funcion r Como Entero <- f()',
      '  Escribir 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n'),
    text: 'f',
    clean: [
      'Funcion r Como Entero <- f()',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n'),
  },
]

describe('every checker code has a case', () => {
  it('covers E3001–E3037 and W3001–W3004', () => {
    const covered = [...new Set(cases.map((entry) => entry.code))].sort()
    const expected = DIAGNOSTIC_CODES.filter(
      (code) => code.startsWith('E3') || code.startsWith('W3'),
    )
    expect(covered).toEqual([...expected].sort())
  })

  for (const entry of cases) {
    describe(entry.code, () => {
      it('is reported exactly once, over the right text', () => {
        const report = checkSource(entry.source, entry.profile ?? 'es')
        const hits = report.codes
          .map((code, index) => ({ code, text: report.texts[index] ?? '' }))
          .filter((one) => one.code === entry.code)
        expect(
          hits.length,
          `expected one ${entry.code}, got ${report.diagnostics.join(', ')}`,
        ).toBe(1)
        expect(hits[0]?.text).toBe(entry.text)
      })

      it('renders in es and en with no unfilled slot', () => {
        const report = checkSource(entry.source, entry.profile ?? 'es')
        const diagnostic = report.result.diagnostics.find((one) => one.code === entry.code)
        expect(diagnostic).toBeDefined()
        if (diagnostic === undefined) return
        const spanish = formatDiagnostic(diagnostic, 'es', report.profile)
        const english = formatDiagnostic(diagnostic, 'en', profiles.en)
        expect(spanish).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(english).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(spanish.length).toBeGreaterThan(0)
        expect(english).not.toBe(spanish)
      })

      // M11: the neighbour is the program that gets the same thing *right*, so it must be
      // clean of errors altogether — not merely free of this one code. A warning would be
      // allowed here, with a comment saying why; today none of them draws one.
      it('leaves the neighbouring program with no error at all', () => {
        const report = checkSource(entry.clean, entry.profile ?? 'es')
        expect(report.codes, report.diagnostics.join(', ')).not.toContain(entry.code)
        const errors = report.result.diagnostics.filter((one) => one.severity === 'error')
        expect(
          errors.map((one) => one.code),
          report.diagnostics.join(', '),
        ).toEqual([])
      })

      // C1: a slot no call site filled renders as a literal `{name}` in front of the reader.
      // Asserting it over *every* diagnostic each case emits, and not only over the one the
      // case is named for, is what makes a second unfilled path impossible to sneak in.
      it('renders every diagnostic it emits with no unfilled slot', () => {
        for (const source of [entry.source, entry.clean]) {
          const report = checkSource(source, entry.profile ?? 'es')
          for (const diagnostic of report.result.diagnostics) {
            const spanish = formatDiagnostic(diagnostic, 'es', report.profile)
            const english = formatDiagnostic(diagnostic, 'en', profiles.en)
            expect(spanish, `${diagnostic.code} in es`).not.toMatch(/\{[a-zA-Z$:]+\}/)
            expect(english, `${diagnostic.code} in en`).not.toMatch(/\{[a-zA-Z$:]+\}/)
          }
        }
      })
    })
  }
})

/**
 * C1/I1: E3009 says "«x» is a whole array". The name is the *array's*, wherever the array
 * turned up — the value of an assignment, a returned value, a `Para` bound, an argument — and
 * never the target it did not fit into or the callee it was passed to.
 */
describe('E3009 names the array itself', () => {
  const named = (source: string): string[] => {
    const report = checkSource(source)
    return report.result.diagnostics
      .filter((one) => one.code === 'E3009')
      .map((one) => formatDiagnostic(one, 'es', report.profile))
  }

  it('names the value of an assignment, not its target', () => {
    expect(
      named(main('Definir n Como Entero;', 'Definir b Como Entero[3];', 'n <- b;', 'Escribir n;')),
    ).toEqual(['«b» es un arreglo completo, y aquí hace falta un valor.'])
  })

  it('names the returned value', () => {
    const source = [
      'Funcion r Como Entero <- f()',
      '  Definir b Como Entero[3];',
      '  Retornar b;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(named(source)).toEqual(['«b» es un arreglo completo, y aquí hace falta un valor.'])
  })

  it('names a Para bound', () => {
    const source = main(
      'Definir i Como Entero;',
      'Definir b Como Entero[3];',
      'Para i <- b Hasta 3 Hacer',
      '  Escribir i;',
      'FinPara',
    )
    expect(named(source)).toEqual(['«b» es un arreglo completo, y aquí hace falta un valor.'])
  })

  // §7.2 of the interpreter spec: a call renders as its callee, so the array `f()` returned
  // is named after `f` instead of falling back to the nameless base template.
  it('names the function whose call returned the array', () => {
    const source = [
      'Funcion r Como Entero[3] <- f()',
      '  Definir b Como Entero[3];',
      '  b[1] <- 1;',
      '  Retornar b;',
      'FinFuncion',
      'Proceso p',
      '  Definir i Como Entero;',
      '  i <- f();',
      '  Escribir i;',
      'FinProceso',
    ].join('\n')
    expect(named(source)).toEqual(['«f» es un arreglo completo, y aquí hace falta un valor.'])
  })

  it('names the builtin whose result was indexed', () => {
    const source = main('Definir s Como Cadena;', 's <- "hola";', 'Escribir Longitud(s)[1];')
    expect(named(source)).toEqual(['«Longitud» no es un arreglo: no se puede indexar.'])
  })

  it('names the argument, not the callee', () => {
    const source = withF(
      'SubProceso f(n Como Entero)',
      'Escribir n;',
      'Definir b Como Entero[3];\n  f(b);',
    )
    expect(named(source)).toEqual(['«b» es un arreglo completo, y aquí hace falta un valor.'])
  })
})
