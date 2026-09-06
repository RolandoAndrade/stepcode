import { describe, expect, it } from 'vitest'
import { childrenOf } from '../../src/ast/index'
import { assertTreeInvariants, parseSource } from '../helpers'

/**
 * Every reproducer the final whole-branch review found, plus the rest of the recovery paths
 * that build a node out of tokens nobody consumed. The tree contract must hold on all of them.
 */
const BROKEN: readonly string[] = [
  'Proceso p\n  x <- 1 + ;\nFinProceso',
  'Proceso p\n  x <- 1 +',
  'Proceso',
  'Proceso p',
  'Proceso p\n  Segun x Hacer\n  1):\n  Escribir 1;\n  FinSegun\nFinProceso',
  'Proceso p\n  Segun x Hacer\n  ):\n  Escribir 1;\n  FinSegun\nFinProceso',
  'Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso',
  'Proceso p\n  FinSi\nFinProceso',
  'Proceso p\n  Si a Entonces\n  Sino\n  Escribir 1;\n  Sino Si b Entonces\n  Escribir 2;\n  FinSi\nFinProceso',
  'Funcion <- f()\nFinFuncion\nProceso p\nFinProceso',
  'Proceso p\n  Definir a Como Entero[3,];\nFinProceso',
  'Proceso p\n  Definir a Como Entero[,3];\nFinProceso',
  'Proceso p\n  a <- 10abc;\nFinProceso',
  'Proceso p\n  Si a == b Entonces\n  FinSi\nFinProceso',
  'Proceso p\n  Escribir "hola;\n  Escribir 1;\nFinProceso',
  '',
  '   ',
  '\n\n',
  ')',
  '@ $ ~~',
  'Proceso p\n  Para Hasta 3 Hacer\n  FinPara\nFinProceso',
  'Proceso p\n  Para i Hasta 3 Hacer\n  FinPara\nFinProceso',
  'Proceso p\n  Definir , Como Entero;\nFinProceso',
  'Proceso p\n  Dimension a[;\nFinProceso',
  'Proceso p\n  a[1 <- 2;\nFinProceso',
  'Proceso p\n  Leer ;\nFinProceso',
  'Proceso p\n  Constante ;\nFinProceso',
  'Proceso p\n  Mientras Hacer\n  FinMientras\nFinProceso',
  'Proceso p\n  Repetir\n  Escribir 1;\nFinProceso',
  'Proceso p\n  Segun Hacer\n  FinSegun\nFinProceso',
  'Proceso p\n  Escribir a < b < c;\nFinProceso',
  'Proceso p\n  f(1) <- 2;\nFinProceso',
  'SubProceso f(a Por Referencia Por Valor)\nFinSubProceso',
  'Proceso uno\n  a <- 1;\nFinProceso\nProceso dos\n  b <- 2;\nFinProceso',
  'Escribir 1;\nProceso p\nFinProceso',
  'Proceso p\n  Definir a Como ;\nFinProceso',
  'Proceso p\n  a <- ;\n  b <- 2;\nFinProceso',
  'Proceso p\n  Esperar ;\nFinProceso',
  'Proceso p\n  Retornar ;\nFinProceso',
  'Proceso p\n  Segun x Hacer\n  De Otro Modo: Escribir 1;\n  De Otro Modo: Escribir 2;\n  FinSegun\nFinProceso',
  'Proceso p\n  a <- (1 + 2;\nFinProceso',
  'Proceso p\n  SubProceso f\n  FinSubProceso\n  a <- 1;\nFinProceso',
  'Proceso p\n  Escribir 1 2 3;\nFinProceso',
  'SubProceso f(Como Entero)\nFinSubProceso\nProceso p\nFinProceso',
  'SubProceso (\nProceso p\nFinProceso',
  'Proceso p\n  Si Hasta\nFinProceso',
  'Proceso Si Hasta',
  'Proceso p\n  Segun x Hacer\n  Caso :\n  FinSegun\nFinProceso',
  'Proceso p\n  Segun x Hacer\n  1,):\n  Escribir 1;\n  FinSegun\nFinProceso',
  'Proceso p\n  Segun x Hacer\n  f(a)):\n  Escribir 1;\n  FinSegun\nFinProceso',
]

const withCrlf = (source: string): string => source.replaceAll('\n', '\r\n')

describe('the tree contract holds on broken input', () => {
  it('covers at least thirty sources', () => {
    expect(BROKEN.length).toBeGreaterThanOrEqual(30)
  })

  for (const source of BROKEN) {
    const title = JSON.stringify(source.length > 60 ? `${source.slice(0, 60)}…` : source)
    it(`holds for ${title}`, () => {
      expect(() => assertTreeInvariants(parseSource(source))).not.toThrow()
    })

    it(`holds for ${title} with CRLF line endings`, () => {
      expect(() => assertTreeInvariants(parseSource(withCrlf(source)))).not.toThrow()
    })
  }
})

describe('a placeholder is zero-width', () => {
  it('carries an empty token range and a zero-width span after the last token consumed', () => {
    const source = 'Proceso p\n  Escribir 1 + ;\nFinProceso'
    const result = parseSource(source)
    const write = result.program.main?.body[0]
    const argument = write?.kind === 'WriteStmt' ? write.args[0] : undefined
    const broken = argument?.kind === 'Binary' ? argument.right : undefined
    expect(broken?.kind).toBe('ErrorExpr')
    const [first, last] = broken?.tokens ?? [0, 0]
    expect(first).toBe(last + 1)
    const plus = result.tokens[last]
    expect(plus?.text).toBe('+')
    expect(broken?.span).toEqual({ start: plus?.span.end, end: plus?.span.end })
  })

  it('leaves the terminator to the statement that consumed it', () => {
    const result = parseSource('Proceso p\n  Escribir 1 + ;\nFinProceso')
    const write = result.program.main?.body[0]
    const semicolon = result.tokens.findIndex((token) => token.text === ';')
    expect(write?.tokens[1]).toBe(semicolon)
  })

  it('does not share the opener with the block that consumed it', () => {
    const result = parseSource('Proceso')
    const name = result.program.main?.name
    expect(name?.missing).toBe(true)
    expect(name?.tokens[0]).toBe((name?.tokens[1] ?? 0) + 1)
    expect(name?.span).toEqual({ start: 7, end: 7 })
  })
})

describe('a subprogram inside a block stays where it was written', () => {
  it('is a statement of the block and the same object in Program.subprograms', () => {
    const result = parseSource(
      'Proceso p\n  a <- 1;\n  SubProceso f\n  FinSubProceso\n  b <- 2;\nFinProceso',
    )
    const body = result.program.main?.body ?? []
    const declaration = body.find((statement) => statement.kind === 'SubprogramDecl')
    expect(declaration).toBeDefined()
    expect(result.program.subprograms[0]).toBe(declaration)
    expect(childrenOf(result.program).map((node) => node.kind)).toEqual(['MainBlock'])
    expect(() => assertTreeInvariants(result)).not.toThrow()
  })
})
