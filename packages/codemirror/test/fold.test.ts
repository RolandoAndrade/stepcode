import { foldable } from '@codemirror/language'
import { describe, expect, it } from 'vitest'
import { stateFor } from './helpers'

/** The fold range of the line containing `marker`, as document text, or null. */
function foldOf(source: string, marker: string): string | null {
  const state = stateFor(source)
  const line = state.doc.lineAt(source.indexOf(marker))
  const range = foldable(state, line.from, line.to)
  return range === null ? null : source.slice(range.from, range.to)
}

const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

describe('folding', () => {
  it('folds a main block from the end of its first line to its closer', () => {
    expect(foldOf(main('  Escribir 1;'), 'Proceso')).toBe('\n  Escribir 1;\n')
  })

  it('folds Si to FinSi, keeping the closer visible', () => {
    const source = main('  Si 1 < 2 Entonces\n    Escribir 1;\n  Sino\n    Escribir 2;\n  FinSi')
    expect(foldOf(source, 'Si 1')).toBe('\n    Escribir 1;\n  Sino\n    Escribir 2;\n  ')
  })

  it('folds every other block kind', () => {
    expect(foldOf(main('  Mientras 1 < 2 Hacer\n    Escribir 1;\n  FinMientras'), 'Mientras')).toBe(
      '\n    Escribir 1;\n  ',
    )
    expect(
      foldOf(
        main('  Definir i Como Entero;\n  Para i <- 1 Hasta 3 Hacer\n    Escribir i;\n  FinPara'),
        'Para',
      ),
    ).toBe('\n    Escribir i;\n  ')
    expect(foldOf(main('  Repetir\n    Escribir 1;\n  Hasta Que 1 < 2'), 'Repetir')).toBe(
      '\n    Escribir 1;\n  ',
    )
    const source = [
      'Funcion r <- doble(n Como Entero)',
      '  r <- n * 2;',
      'FinFuncion',
      'Proceso p',
      '  Escribir doble(1);',
      'FinProceso',
    ].join('\n')
    expect(foldOf(source, 'Funcion')).toBe('\n  r <- n * 2;\n')
  })

  it('folds Segun and each case with a body', () => {
    const source = main(
      '  Definir x Como Entero;\n  Segun x Hacer\n    1:\n      Escribir "uno";\n    2:\n    De Otro Modo:\n      Escribir "otro";\n  FinSegun',
    )
    expect(foldOf(source, 'Segun')).toBe(
      '\n    1:\n      Escribir "uno";\n    2:\n    De Otro Modo:\n      Escribir "otro";\n  ',
    )
    expect(foldOf(source, '1:')).toBe('\n      Escribir "uno";')
    expect(foldOf(source, '2:')).toBeNull()
  })

  it('does not fold a single-line block', () => {
    expect(foldOf(main('  Si 1 < 2 Entonces Escribir 1; FinSi'), 'Si 1')).toBeNull()
  })

  it('folds an unclosed block to its end', () => {
    const source = 'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\nFinProceso'
    expect(foldOf(source, 'Si 1')).toBe('\n    Escribir 1;')
  })
})
