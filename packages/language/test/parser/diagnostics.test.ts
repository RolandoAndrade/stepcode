import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES } from '../../src/diagnostics/index'
import { ast, diagnosticCodes, diagnosticReport, parseSource, sexpr } from '../helpers'

const untyped = resolveProfile(
  { id: 'untyped', extends: 'es', options: { typedParameters: false } },
  builtinProfiles,
)

/** One case per code: the source, the profile, and where the first diagnostic must land. */
const cases: {
  code: string
  source: string
  profile?: typeof profiles.es
  line: number
  column: number
  es: string
  en: string
}[] = [
  {
    code: 'E1001',
    source: 'Proceso p\n  a <- @;\nFinProceso',
    line: 2,
    column: 8,
    es: '@',
    en: '@',
  },
  {
    code: 'E1002',
    source: 'Proceso p\n  Escribir "hola;\nFinProceso',
    line: 2,
    column: 12,
    es: 'comilla',
    en: 'quote',
  },
  {
    code: 'E1003',
    source: 'Proceso p\n  a <- 10abc;\nFinProceso',
    line: 2,
    column: 8,
    es: '10abc',
    en: '10abc',
  },
  {
    code: 'E1006',
    source: 'Proceso p\n  Si a == b Entonces\n  FinSi\nFinProceso',
    line: 2,
    column: 8,
    es: '=',
    en: '=',
  },
  {
    code: 'E2001',
    source: 'Proceso p\n  Definir a Como Entero\n  a <- 1;\nFinProceso',
    line: 2,
    column: 24,
    es: ';',
    en: ';',
  },
  {
    code: 'E2002',
    source: 'Proceso p\n  a <- 1 ) 2;\nFinProceso',
    line: 2,
    column: 10,
    es: ')',
    en: ')',
  },
  {
    code: 'E2003',
    source: 'Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso',
    line: 2,
    column: 3,
    es: 'FinSi',
    en: 'EndIf',
  },
  {
    code: 'E2004',
    source: 'Proceso p\n  Si a\n  Escribir 1;\n  FinSi\nFinProceso',
    line: 3,
    column: 3,
    es: 'Entonces',
    en: 'Then',
  },
  {
    code: 'E2005',
    source: 'Proceso p\n  a <- (1 + 2;\nFinProceso',
    line: 2,
    column: 8,
    es: ')',
    en: ')',
  },
  {
    code: 'E2006',
    source: 'Proceso p\n  FinSi\nFinProceso',
    line: 2,
    column: 3,
    es: 'FinSi',
    en: 'EndIf',
  },
  {
    code: 'E2010',
    source: 'SubProceso f\nFinSubProceso\n',
    line: 3,
    column: 1,
    es: 'Proceso',
    en: 'Program',
  },
  {
    code: 'E2011',
    source: 'Proceso uno\nFinProceso\nProceso dos\nFinProceso',
    line: 3,
    column: 1,
    es: 'Proceso',
    en: 'Program',
  },
  {
    code: 'E2012',
    source: 'Escribir 1;\nProceso p\nFinProceso',
    line: 1,
    column: 1,
    es: 'Escribir',
    en: 'Escribir',
  },
  {
    code: 'E2013',
    source:
      'Proceso p\n  Segun a Hacer\n  De Otro Modo: Escribir 1;\n  De Otro Modo: Escribir 2;\n  FinSegun\nFinProceso',
    line: 4,
    column: 3,
    es: 'De Otro Modo',
    en: 'Otherwise',
  },
  {
    code: 'E2020',
    source: 'Proceso p\n  f(1) <- 2;\nFinProceso',
    line: 2,
    column: 3,
    es: 'llamada',
    en: 'call',
  },
  {
    code: 'E2021',
    source: 'SubProceso f(a)\nFinSubProceso\nProceso p\nFinProceso',
    line: 1,
    column: 14,
    es: 'a',
    en: 'a',
  },
  {
    code: 'E2022',
    source: 'SubProceso f(a Por Referencia Por Valor)\nFinSubProceso\nProceso p\nFinProceso',
    profile: untyped,
    line: 1,
    column: 31,
    es: 'Por Valor',
    en: 'ByValue',
  },
  {
    code: 'E2030',
    source: 'Proceso p\n  Escribir a < b < c;\nFinProceso',
    line: 2,
    column: 18,
    es: 'Y',
    en: 'And',
  },
  {
    code: 'E2031',
    source: 'Proceso p\n  Escribir Entero;\nFinProceso',
    line: 2,
    column: 12,
    es: 'Entero',
    en: 'Entero',
  },
  {
    code: 'E2032',
    source: `Proceso p\n  a <- ${'('.repeat(600)}1${')'.repeat(600)};\nFinProceso`,
    line: 2,
    column: 508,
    es: 'anidado',
    en: 'nested',
  },
  {
    code: 'W2001',
    source: 'Proceso p\n  a <- 1;;\nFinProceso',
    line: 2,
    column: 10,
    es: ';',
    en: ';',
  },
]

describe('every diagnostic code has a case', () => {
  it('covers the whole catalogue', () => {
    expect([...new Set(cases.map((entry) => entry.code))].sort()).toEqual(
      [...DIAGNOSTIC_CODES].sort(),
    )
  })

  for (const entry of cases) {
    it(`${entry.code} reports at the right place in both locales`, () => {
      const report = diagnosticReport(entry.source, entry.profile ?? profiles.es)
      const first = report.find((item) => item.code === entry.code)
      expect(first, `${entry.code} was not reported: ${JSON.stringify(report)}`).toBeDefined()
      expect({ line: first!.line, column: first!.column }).toEqual({
        line: entry.line,
        column: entry.column,
      })
      expect(first!.es).toContain(entry.es)
      expect(first!.en).toContain(entry.en)
      expect(first!.es).not.toMatch(/\{[a-zA-Z$:]+\}/)
      expect(first!.en).not.toMatch(/\{[a-zA-Z$:]+\}/)
    })
  }
})

describe('E2003 carries the opener line and a related span', () => {
  it('names the opener, the closer and the line', () => {
    const result = parseSource('Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso')
    const diagnostic = result.diagnostics.find((item) => item.code === 'E2003')
    expect(diagnostic?.data).toMatchObject({ opener: 'if', closer: 'endIf', openerLine: 2 })
    expect(diagnostic?.related).toHaveLength(1)
  })

  it('reports one E2003 per open block at end of file, innermost first', () => {
    const result = parseSource('Proceso p\n  Si a Entonces\n  Mientras b Hacer\n')
    expect(result.diagnostics.map((item) => item.code)).toEqual(['E2003', 'E2003', 'E2003'])
    expect(result.diagnostics.map((item) => item.data.closer)).toEqual([
      'endWhile',
      'endIf',
      'endProgram',
    ])
  })

  it('lets an outer closer close the outer block after the inner one is reported', () => {
    const result = parseSource('Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso')
    expect(result.diagnostics.map((item) => item.code)).toEqual(['E2003'])
    expect(sexpr(result.program)).toBe('(program (main p (if a (write (literal 1)))))')
  })

  it('reports the innermost of two mismatched levels and lets the outer closer close', () => {
    const source =
      'Proceso p\n  Si a Entonces\n  Para i <- 1 Hasta 3 Hacer\n  Escribir i;\n  FinSi\nFinProceso'
    const result = parseSource(source)
    expect(result.diagnostics).toHaveLength(1)
    const diagnostic = result.diagnostics[0]
    expect(diagnostic?.code).toBe('E2003')
    expect(diagnostic?.data).toMatchObject({ closer: 'endFor', opener: 'for', openerLine: 3 })
    expect(diagnostic?.related).toEqual([
      { span: { start: source.indexOf('FinSi'), end: source.indexOf('FinSi') + 'FinSi'.length } },
    ])
    expect(sexpr(result.program)).toBe(
      '(program (main p (if a (for i (literal 1) (literal 3) - (write i)))))',
    )
  })
})

describe('recovery: one mistake, one diagnostic, an intact AST', () => {
  it('a missing semicolon before a statement on the next line', () => {
    const source = 'Proceso p\n  a <- 1\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2001'])
    expect(ast(source)).toBe('(program (main p (assign a (literal 1)) (assign b (literal 2))))')
  })

  it('a garbled statement on one line, with the rest intact', () => {
    const source = 'Proceso p\n  a <- 1 )) 9;\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2002'])
    expect(ast(source)).toBe('(program (main p (error-stmt) (assign b (literal 2))))')
  })

  it('a bad statement start', () => {
    const source = 'Proceso p\n  Entonces;\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2002'])
    expect(ast(source)).toBe('(program (main p (error-stmt) (assign b (literal 2))))')
  })

  it('a missing FinSi', () => {
    const source = 'Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2003'])
  })

  it('a stray FinSi, dropped so the block keeps parsing', () => {
    const source = 'Proceso p\n  a <- 1;\n  FinSi\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2006'])
    expect(ast(source)).toBe('(program (main p (assign a (literal 1)) (assign b (literal 2))))')
  })

  it('a mismatched closer', () => {
    const source = 'Proceso p\n  Si a Entonces\n  Escribir 1;\n  FinMientras\nFinProceso'
    const codes = diagnosticCodes(source)
    expect(codes).toContain('E2006')
    expect(codes.filter((code) => code === 'E2003')).toHaveLength(1)
  })

  it('a statement outside Proceso', () => {
    const source = 'a <- 1;\nProceso p\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2012'])
    expect(ast(source)).toBe('(program (main p (assign b (literal 2))))')
  })

  it('a missing terminator right before a closer on the next line', () => {
    const source = 'Proceso p\n  Si a Entonces\n  Escribir 1\n  FinSi\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2001'])
    expect(ast(source)).toBe('(program (main p (if a (write (literal 1)))))')
  })

  it('a broken expression leaves the statement terminated', () => {
    const source = 'Proceso p\n  a <- ;\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2031'])
    expect(ast(source)).toBe('(program (main p (assign a (error-expr)) (assign b (literal 2))))')
  })
})

describe('diagnostic ordering and shape', () => {
  it('puts lexer diagnostics before parser ones', () => {
    const codes = diagnosticCodes('Proceso p\n  a <- @;\n  b <- ) ;\nFinProceso')
    expect(codes).toContain('E1001')
    const lastLexer = codes.reduce(
      (last, code, index) => (code.startsWith('E1') ? index : last),
      -1,
    )
    const firstParser = codes.findIndex((code) => code.startsWith('E2'))
    expect(lastLexer).toBeLessThan(firstParser)
  })

  it('is deterministic across runs', () => {
    const source = 'Proceso p\n  Si a\n  FinMientras\n'
    expect(parseSource(source).diagnostics).toEqual(parseSource(source).diagnostics)
  })
})
