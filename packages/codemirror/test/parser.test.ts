import { ensureSyntaxTree, getIndentation, syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { compileResultAt, stepcodeLanguage, treeDataAt } from '../src/parser'
import { en, es, stateFor } from './helpers'

describe('stepcodeLanguage', () => {
  it('is one Language per profile object', () => {
    expect(stepcodeLanguage(es)).toBe(stepcodeLanguage(es))
    expect(stepcodeLanguage(es)).not.toBe(stepcodeLanguage(en))
    expect(stepcodeLanguage(es).name).toBe('stepcode')
  })

  it('parses the whole document into a Program tree carrying the compile result', () => {
    const state = stateFor('Proceso p\n  Escribir noExiste;\nFinProceso')
    const tree = syntaxTree(state)
    expect(tree.topNode.name).toBe('Program')
    expect(tree.length).toBe(state.doc.length)
    expect(compileResultAt(state)?.diagnostics.map((d) => d.code)).toEqual(['E3001'])
    expect(treeDataAt(state)?.identifiers.size).toBe(2)
  })

  it('reparses after an edit', () => {
    const source = 'Proceso p\n  Escribir noExiste;\nFinProceso'
    const state = stateFor(source)
    const from = source.indexOf('noExiste')
    const next = state.update({
      changes: { from, to: from + 'noExiste'.length, insert: '1' },
    }).state
    ensureSyntaxTree(next, next.doc.length, 1e9)
    expect(compileResultAt(next)?.diagnostics).toEqual([])
    expect(compileResultAt(next)?.source).toBe(next.doc.toString())
  })

  it('exposes the profile comment spelling as language data', () => {
    const state = stateFor('Proceso p\nFinProceso')
    expect(state.languageDataAt<{ line: string }>('commentTokens', 0)).toEqual([{ line: '//' }])
  })

  it('returns null before any parse', () => {
    expect(compileResultAt(EditorState.create({ doc: 'x' }))).toBeNull()
  })

  it('keeps two profiles apart when both are in use at once', () => {
    const stateEs = stateFor(
      'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\n  FinSi\nFinProceso',
      [],
      es,
    )
    const stateEn = stateFor(
      'Program p\n  If 1 < 2 Then\n    Write 1;\n  EndIf\nEndProgram',
      [],
      en,
    )

    // Each state carries its own tree with its own compile result.
    expect(syntaxTree(stateEs)).not.toBe(syntaxTree(stateEn))
    expect(treeDataAt(stateEs)).not.toBeNull()
    expect(treeDataAt(stateEn)).not.toBeNull()
    expect(compileResultAt(stateEs)?.diagnostics).toEqual([])
    expect(compileResultAt(stateEn)?.diagnostics).toEqual([])

    // Each profile's language data is its own (both happen to spell `//` the same way, but the
    // point is that each lookup resolves against its own state, not a stale shared one).
    expect(stateEs.languageDataAt<{ line: string }>('commentTokens', 0)).toEqual([{ line: '//' }])
    expect(stateEn.languageDataAt<{ line: string }>('commentTokens', 0)).toEqual([{ line: '//' }])

    // Indentation after "Si … Entonces" (es) and "If … Then" (en) both work, computed
    // independently under each state's own profile.
    const esBody = 'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\nFinSi\nFinProceso'
    const enBody = 'Program p\n  If 1 < 2 Then\n    Write 1;\nEndIf\nEndProgram'
    const esWithBody = stateFor(esBody, [], es)
    const enWithBody = stateFor(enBody, [], en)
    const esLine = esWithBody.doc.lineAt(esBody.indexOf('Escribir 1'))
    const enLine = enWithBody.doc.lineAt(enBody.indexOf('Write 1'))
    expect(getIndentation(esWithBody, esLine.from)).toBe(4)
    expect(getIndentation(enWithBody, enLine.from)).toBe(4)
  })
})
