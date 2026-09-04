import { matchBrackets } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { stepcodeBlockMatching } from '../src/matching'
import { MATCHING_PAIRS } from '../src/nodes'
import { es, stateFor } from './helpers'

const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

/** The text of the match found from the token starting (dir 1) or ending (dir -1) at `pos`. */
function matchText(
  source: string,
  pos: number,
  dir: 1 | -1,
): { end: string | null; matched: boolean } | null {
  const state = stateFor(source, stepcodeBlockMatching())
  const result = matchBrackets(state, pos, dir)
  if (result === null) return null
  return {
    end: result.end === undefined ? null : source.slice(result.end.from, result.end.to),
    matched: result.matched,
  }
}

describe('block matching', () => {
  const source = main(
    '  Si 1 < 2 Entonces\n    Si 2 < 3 Entonces\n      Escribir (1 + 2);\n    FinSi\n  FinSi',
  )

  it('matches Si forward to its own FinSi, skipping the nested pair', () => {
    const outer = source.indexOf('Si 1')
    expect(matchText(source, outer, 1)).toEqual({ end: 'FinSi', matched: true })
    const state = stateFor(source, stepcodeBlockMatching())
    const result = matchBrackets(state, outer, 1)
    expect(result?.end?.from).toBe(source.lastIndexOf('FinSi'))
  })

  it('matches FinSi backward to its Si', () => {
    const inner = source.indexOf('    FinSi') + '    FinSi'.length
    const state = stateFor(source, stepcodeBlockMatching())
    const result = matchBrackets(state, inner, -1)
    expect(result?.matched).toBe(true)
    expect(result?.end?.from).toBe(source.indexOf('Si 2'))
  })

  it('matches Proceso with FinProceso and Repetir with Hasta Que', () => {
    expect(matchText(source, 0, 1)).toEqual({ end: 'FinProceso', matched: true })
    const loop = main('  Repetir\n    Escribir 1;\n  Hasta Que 1 < 2')
    expect(matchText(loop, loop.indexOf('Repetir'), 1)).toEqual({ end: 'Hasta Que', matched: true })
  })

  it('reports an unclosed block as unmatched', () => {
    const open = 'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\nFinProceso'
    expect(matchText(open, open.indexOf('Si 1'), 1)?.matched).toBe(false)
  })

  it('still matches parentheses and brackets by text', () => {
    expect(matchText(source, source.indexOf('('), 1)).toEqual({ end: ')', matched: true })
    const arr = main('  Definir a Como Entero;\n  Dimension a[3];')
    expect(matchText(arr, arr.indexOf('['), 1)).toEqual({ end: ']', matched: true })
  })

  it('finds nothing on a plain keyword', () => {
    expect(matchText(source, source.indexOf('Entonces'), 1)).toBeNull()
  })

  it('is an extension a state accepts', () => {
    const state = EditorState.create({ doc: 'x', extensions: stepcodeBlockMatching() })
    expect(state.doc.length).toBe(1)
  })

  it('matches every opener/closer pair as siblings, in both directions, across all block forms', () => {
    const all = [
      'SubProceso s',
      'FinSubProceso',
      '',
      'Funcion f',
      'FinFuncion',
      '',
      'Proceso p',
      '  Si 1 < 2 Entonces',
      '    Segun 1 Hacer',
      '      1:',
      '        Escribir 1;',
      '    FinSegun',
      '  FinSi',
      '  Mientras 1 < 2 Hacer',
      '    Escribir 1;',
      '  FinMientras',
      '  Para i <- 1 Hasta 2 Con Paso 1 Hacer',
      '    Escribir 1;',
      '  FinPara',
      '  Repetir',
      '    Escribir 1;',
      '  Hasta Que 1 < 2',
      'FinProceso',
    ].join('\n')

    /** The first (or, reversed, the last) whole-word occurrence of `word` in `text`. */
    function findWord(text: string, word: string, last: boolean): { from: number; to: number } {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = [...text.matchAll(new RegExp(`\\b${escaped}\\b`, 'g'))]
      const match = last ? matches.at(-1) : matches[0]
      if (match === undefined || match.index === undefined) {
        throw new Error(`expected to find "${word}" in the test program`)
      }
      return { from: match.index, to: match.index + word.length }
    }

    for (const [openKey, closeKey] of MATCHING_PAIRS) {
      const openText = es.keywords[openKey][0]
      const closeText = es.keywords[closeKey][0]
      if (openText === undefined || closeText === undefined) {
        throw new Error(`missing es spelling for ${openKey}/${closeKey}`)
      }

      const opener = findWord(all, openText, false)
      const forward = matchText(all, opener.from, 1)
      expect(forward, `${openText} -> ${closeText} forward`).toEqual({
        end: closeText,
        matched: true,
      })

      const closer = findWord(all, closeText, true)
      const backward = matchText(all, closer.to, -1)
      expect(backward?.matched, `${closeText} -> ${openText} backward`).toBe(true)
      expect(backward?.end, `${closeText} -> ${openText} backward`).toBe(openText)
    }
  })
})
