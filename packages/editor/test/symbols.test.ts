// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { insertSymbol, symbolKeys } from '../src/shell/mobile/symbols'

describe('symbolKeys', () => {
  it('starts with the assign operator and punctuation, then keywords and types', () => {
    const keys = symbolKeys(profiles.es).map((k) => k.label)
    expect(keys.slice(0, 9)).toEqual(['<-', '(', ')', '[', ']', ',', '"', ':', ';'])
    expect(keys).toContain('Si')
    expect(keys).toContain('FinSi')
    expect(keys).toContain('Entero')
    expect(keys.indexOf('Si')).toBeLessThan(keys.indexOf('Mientras'))
    expect(symbolKeys(profiles.en).map((k) => k.label)).toContain('If')
  })

  it('inserts keywords with a trailing space and punctuation without', () => {
    const view = new EditorView({ state: EditorState.create({ doc: 'a' }) })
    view.dispatch({ selection: { anchor: 1 } })
    const si = symbolKeys(profiles.es).find((k) => k.label === 'Si')
    insertSymbol(view, si?.insert ?? '')
    insertSymbol(view, '(')
    expect(view.state.doc.toString()).toBe('aSi (')
    view.destroy()
  })
})
