import { ensureSyntaxTree, syntaxTree } from '@codemirror/language'
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
})
