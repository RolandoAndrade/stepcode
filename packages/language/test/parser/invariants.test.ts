import { describe, expect, it } from 'vitest'
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
