import { getIndentation } from '@codemirror/language'
import type { ResolvedProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { indentOnInputPatterns } from '../src/blocks'
import { en, es, stateFor } from './helpers'

/** The indentation CodeMirror computes for the line containing `marker`. */
function indentAt(source: string, marker: string, profile: ResolvedProfile = es): number | null {
  const state = stateFor(source, [], profile)
  const line = state.doc.lineAt(source.indexOf(marker))
  return getIndentation(state, line.from)
}

const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

describe('indentation', () => {
  it('indents the line after a block opener', () => {
    expect(indentAt(main('  Si 1 < 2 Entonces\n@\n  FinSi'), '@')).toBe(4)
    expect(indentAt('Proceso p\n@\nFinProceso', '@')).toBe(2)
  })

  it('dedents Sino, Sino Si and FinSi to the opener', () => {
    const source = main(
      '  Si 1 < 2 Entonces\n    Escribir 1;\nSino Si 2 < 3 Entonces\n    Escribir 2;\nSino\n    Escribir 3;\nFinSi',
    )
    expect(indentAt(source, 'Sino Si')).toBe(2)
    expect(indentAt(source, 'Sino\n')).toBe(2)
    expect(indentAt(source, 'FinSi')).toBe(2)
  })

  it('keeps a statement inside the body at one unit', () => {
    expect(indentAt(main('  Si 1 < 2 Entonces\n    Escribir 1;\n@\n  FinSi'), '@')).toBe(4)
  })

  it('nests', () => {
    const source = main(
      '  Mientras 1 < 2 Hacer\n    Si 2 < 3 Entonces\n@\n    FinSi\n  FinMientras',
    )
    expect(indentAt(source, '@')).toBe(6)
    expect(indentAt(source, 'FinSi')).toBe(4)
    expect(indentAt(source, 'FinMientras')).toBe(2)
  })

  it('handles multi-word closers and Para/Repetir', () => {
    expect(indentAt(main('  Repetir\n    Escribir 1;\nHasta Que 1 < 2'), 'Hasta Que')).toBe(2)
    expect(
      indentAt(main('  Definir i Como Entero;\n  Para i <- 1 Hasta 3 Hacer\n@\n  FinPara'), '@'),
    ).toBe(4)
    expect(
      indentAt(
        main('  Definir i Como Entero;\n  Para i <- 1 Hasta 3 Hacer\n    Escribir i;\nFinPara'),
        'FinPara',
      ),
    ).toBe(2)
  })

  it('indents a subprogram body and dedents its closer', () => {
    const source =
      'Funcion r <- doble(n Como Entero)\n@\nFinFuncion\nProceso p\n  Escribir doble(1);\nFinProceso'
    expect(indentAt(source, '@')).toBe(2)
    expect(indentAt(source, 'FinFuncion')).toBe(0)
  })

  it('Segun: case lines one unit, case bodies two, closer at the opener', () => {
    const source = main(
      '  Definir x Como Entero;\n  Segun x Hacer\n    1:\n      Escribir "uno";\n@\n2:\n      Escribir "dos";\nDe Otro Modo:\n#\n  FinSegun',
    )
    expect(indentAt(source, '@')).toBe(6)
    expect(indentAt(source, '2:')).toBe(4)
    expect(indentAt(source, 'De Otro Modo')).toBe(4)
    expect(indentAt(source, '#')).toBe(6)
    expect(indentAt(source, 'FinSegun')).toBe(2)
    expect(indentAt(main('  Definir x Como Entero;\n  Segun x Hacer\n@\n  FinSegun'), '@')).toBe(4)
  })

  it('works under en', () => {
    const source = 'Program p\n  If 1 < 2 Then\n@\nElse\n    Write 2;\n  EndIf\nEndProgram'
    expect(indentAt(source, '@', en)).toBe(4)
    expect(indentAt(source, 'Else', en)).toBe(2)
  })
})

describe('indentOnInputPatterns', () => {
  it('matches a dedent keyword typed at the start of a line, in any case', () => {
    const [keywords] = indentOnInputPatterns(es)
    expect(keywords?.test('  FinSi')).toBe(true)
    expect(keywords?.test('  finsi')).toBe(true)
    expect(keywords?.test('  Sino Si')).toBe(true)
    expect(keywords?.test('  Hasta Que')).toBe(true)
    expect(keywords?.test('  Si')).toBe(false)
    expect(keywords?.test('  FinSi x')).toBe(false)
  })

  it('matches a case line', () => {
    const [, caseLine] = indentOnInputPatterns(es)
    expect(caseLine?.test('    2:')).toBe(true)
    expect(caseLine?.test('    "a":')).toBe(true)
    expect(caseLine?.test('    Escribir a:')).toBe(true)
    expect(caseLine?.test('    :')).toBe(false)
  })

  it('is exposed as language data', () => {
    const state = stateFor('Proceso p\nFinProceso')
    expect(state.languageDataAt<RegExp>('indentOnInput', 0)).toHaveLength(2)
  })
})

/** The indentation of the empty line being typed at the end of `source`. */
function indentAtEnd(source: string, profile: ResolvedProfile = es): number | null {
  const state = stateFor(source, [], profile)
  return getIndentation(state, state.doc.length)
}

describe('indentation of the line being typed', () => {
  it('indents the body of a block whose closer is not typed yet', () => {
    expect(indentAtEnd('Proceso p\n')).toBe(2)
    expect(indentAtEnd('Proceso p\n  Si 1 < 2 Entonces\n')).toBe(4)
    expect(indentAtEnd('Proceso p\n  Mientras 1 < 2 Hacer\n')).toBe(4)
  })

  it('keeps a statement typed after another one in the same block', () => {
    expect(indentAtEnd('Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\n')).toBe(4)
  })

  it('nests', () => {
    expect(indentAtEnd('Proceso p\n  Mientras 1 < 2 Hacer\n    Si 1 < 2 Entonces\n')).toBe(6)
  })

  it('Segun: a case line at the switch body column, a case body one unit past its case', () => {
    expect(indentAtEnd('Proceso p\nSegun x Hacer\n')).toBe(2)
    expect(indentAtEnd('Proceso p\nSegun x Hacer\n  1:\n')).toBe(4)
  })

  it('returns to the enclosing block after a closer typed at the end of the document', () => {
    expect(indentAtEnd('Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\nFinSi')).toBe(2)
  })

  it('has nothing to indent to outside a block', () => {
    expect(indentAtEnd('// nota\n')).toBe(0)
  })
})

describe('a block error recovery cut short', () => {
  const cut = (rest: string): string =>
    `Proceso p\n  Repetir\n    Escribir 1;\n@\n${rest}\nFinProceso`

  it('keeps its closer at the opener column', () => {
    expect(indentAt(cut('Hasta Que 1 < 2'), 'Hasta Que')).toBe(2)
  })

  it('indents a following statement one unit past the opener', () => {
    expect(indentAt(cut('Escribir 2;'), 'Escribir 2;')).toBe(4)
  })
})

describe('a line under an opener recovery cut short', () => {
  // `Segun x Hacer` with no case yet: recovery ends the SwitchStmt at `Hacer`, so the line below
  // it is a MainBlock child and only the opener above it says where that line belongs.
  const cut = (indent: string): string =>
    `Proceso p\n${indent}Segun x Hacer\n@\n  FinSegun\nFinProceso`

  it('indents one unit past the opener, not past the block that contains it', () => {
    expect(indentAt(cut('      '), '@')).toBe(8)
    expect(indentAt(cut('  '), '@')).toBe(4)
  })

  it('still dedents a closer of the containing block to that block', () => {
    expect(
      indentAt('Proceso p\n  Mientras 1 < 2 Hacer\n    Escribir 1;\nFinProceso', 'FinProceso'),
    ).toBe(0)
  })
})
