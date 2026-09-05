import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

const body = (statements: string) => `Proceso p\n${statements}\nFinProceso`
const main = (statements: string) => ast(body(statements))
const codes = (statements: string) => diagnosticCodes(body(statements))

describe('Si', () => {
  it('parses the plain form', () => {
    expect(main('Si a < b Entonces\nEscribir 1;\nFinSi')).toBe(
      '(program (main p (if (binary lt a b) (write (literal 1)))))',
    )
  })

  it('parses the else form', () => {
    expect(main('Si a < b Entonces\nEscribir 1;\nSino\nEscribir 2;\nFinSi')).toBe(
      '(program (main p (if (binary lt a b) (write (literal 1)) else (write (literal 2)))))',
    )
  })

  it('parses a chain of Sino Si branches', () => {
    expect(
      main('Si a Entonces\nEscribir 1;\nSino Si b Entonces\nEscribir 2;\nSino\nEscribir 3;\nFinSi'),
    ).toBe(
      '(program (main p (if a (write (literal 1)) elseif b (write (literal 2)) else (write (literal 3)))))',
    )
  })

  it('accepts the SiNo spelling variants of the corpus', () => {
    expect(codes('Si a Entonces\nEscribir 1;\nSiNo Si b Entonces\nEscribir 2;\nFinSi')).toEqual([])
  })

  it('nests', () => {
    expect(codes('Si a Entonces\nSi b Entonces\nEscribir 1;\nFinSi\nFinSi')).toEqual([])
  })

  it('reports E2004 for a missing Entonces and still parses the body', () => {
    const result = parseSource(body('Si a\nEscribir 1;\nFinSi'))
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2004'])
    expect(result.diagnostics[0]!.data.expected).toBe('then')
    expect(result.program.main?.body[0]?.kind).toBe('IfStmt')
  })

  it('takes no terminator after a block opener or closer', () => {
    expect(codes('Si a Entonces\nEscribir 1;\nFinSi')).toEqual([])
  })
})

describe('Mientras', () => {
  it('parses the loop', () => {
    expect(main('Mientras a < 5 Hacer\nEscribir a;\nFinMientras')).toBe(
      '(program (main p (while (binary lt a (literal 5)) (write a))))',
    )
  })

  it('reports E2004 for a missing Hacer', () => {
    expect(codes('Mientras a\nEscribir a;\nFinMientras')).toEqual(['E2004'])
  })
})

describe('Repetir', () => {
  it('closes with Hasta Que and records until', () => {
    const result = parseSource(body('Repetir\nEscribir a;\nHasta Que a > 5;'))
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.body[0]).toMatchObject({ kind: 'RepeatStmt', until: true })
    expect(ast(body('Repetir\nEscribir a;\nHasta Que a > 5;'))).toBe(
      '(program (main p (repeat (write a) until (binary gt a (literal 5)))))',
    )
  })

  it('closes with Mientras Que and records until as false', () => {
    const result = parseSource(body('Repetir\nEscribir a;\nMientras Que a <= 5;'))
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.body[0]).toMatchObject({ kind: 'RepeatStmt', until: false })
  })

  it('lets a Mientras statement inside the body keep working', () => {
    expect(codes('Repetir\nMientras a Hacer\nEscribir 1;\nFinMientras\nHasta Que b;')).toEqual([])
  })

  it('reports E2003 when neither closer arrives', () => {
    expect(codes('Repetir\nEscribir a;')).toContain('E2003')
  })
})

describe('Para', () => {
  it('parses without a step', () => {
    expect(main('Para i <- 1 Hasta 5 Hacer\nEscribir i;\nFinPara')).toBe(
      '(program (main p (for i (literal 1) (literal 5) - (write i))))',
    )
  })

  it('parses with a step, including a negative one', () => {
    expect(main('Para i <- 5 Hasta 1 Con Paso -2 Hacer\nEscribir i;\nFinPara')).toBe(
      '(program (main p (for i (literal 5) (literal 1) (unary minus (literal 2)) (write i))))',
    )
  })

  it('accepts any expression as bounds and step', () => {
    expect(codes('Para i <- 1 Hasta Longitud(s) Con Paso n Hacer\nFinPara')).toEqual([])
  })

  it('reports E2004 for a missing Hacer', () => {
    expect(codes('Para i <- 1 Hasta 5\nFinPara')).toEqual(['E2004'])
  })
})

describe('bodies are intact across nesting', () => {
  it('parses a loop inside a branch inside a loop', () => {
    const source = body(
      'Para i <- 1 Hasta 3 Hacer\nSi i MOD 2 = 0 Entonces\nMientras a Hacer\nRomper;\nFinMientras\nFinSi\nFinPara',
    )
    expect(diagnosticCodes(source)).toEqual([])
  })
})
