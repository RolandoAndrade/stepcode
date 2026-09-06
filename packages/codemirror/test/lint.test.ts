// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { formatDiagnostic } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { stepcodeDiagnostics, stepcodeLint, widen } from '../src/lint'
import { compileResultAt } from '../src/parser'
import { corpusSources, en, es, stateFor } from './helpers'

const options = { profile: es, locale: 'es' }

describe('stepcodeDiagnostics', () => {
  const guides = corpusSources().filter((one) => one.source.startsWith('// expect: E'))

  it('has more than 20 error guides to check', () => {
    expect(guides.length).toBeGreaterThan(20)
  })

  it.each(guides.map((one) => [one.slug, one] as const))(
    '%s: one lint diagnostic per compile diagnostic, formatted per locale',
    (_slug, c) => {
      const state = stateFor(c.source, [], c.profile)
      const compiled = compileResultAt(state)
      const lint = stepcodeDiagnostics(state, options)
      expect(lint.map((d) => d.source)).toEqual(compiled?.diagnostics.map((d) => d.code))
      for (const [index, d] of lint.entries()) {
        const original = compiled?.diagnostics[index]
        expect(d.to).toBeGreaterThanOrEqual(d.from)
        expect(d.message).toBe(original === undefined ? '' : formatDiagnostic(original, 'es', es))
        expect(d.severity).toBe(original?.severity)
      }
    },
  )

  it('renders in the requested locale', () => {
    const state = stateFor('Proceso p\n  Escribir noExiste;\nFinProceso')
    const [d] = stepcodeDiagnostics(state, { profile: es, locale: 'en' })
    expect(d?.source).toBe('E3001')
    expect(d?.message).toMatch(/noExiste/)
    expect(d?.message).not.toMatch(/declarad/)
  })

  it('offers the checker suggestion as a replace action', () => {
    // "total" is declared but only ever misspelled as "totl", so the checker also reports it
    // unused (W3002); find the E3001 this test is about instead of assuming it sorts first.
    const source = 'Proceso p\n  Definir total Como Entero;\n  totl <- 1;\nFinProceso'
    const state = stateFor(source)
    const d = stepcodeDiagnostics(state, options).find((one) => one.source === 'E3001')
    expect(d?.actions?.map((a) => a.name)).toEqual(['Cambiar a «total»'])
    const view = new EditorView({ state })
    d?.actions?.[0]?.apply(view, d.from, d.to)
    expect(view.state.doc.toString()).toBe(source.replace('totl', 'total'))
    view.destroy()
  })

  it('returns nothing before a parse exists', () => {
    expect(stepcodeDiagnostics(EditorState.create({ doc: 'x' }), options)).toEqual([])
  })

  it('works under the en profile', () => {
    const state = stateFor('Program p\n  Write nope;\nEndProgram', [], en)
    expect(stepcodeDiagnostics(state, { profile: en, locale: 'en' }).map((d) => d.source)).toEqual([
      'E3001',
    ])
  })
})

describe('widen', () => {
  it('keeps a non-empty span', () => {
    const state = EditorState.create({ doc: 'abc\ndef' })
    expect(widen(state, { start: 1, end: 3 })).toEqual({ from: 1, to: 3 })
  })

  it('widens to the right inside a line', () => {
    const state = EditorState.create({ doc: 'abc\ndef' })
    expect(widen(state, { start: 1, end: 1 })).toEqual({ from: 1, to: 2 })
  })

  it('widens to the left at the end of a line', () => {
    const state = EditorState.create({ doc: 'abc\ndef' })
    expect(widen(state, { start: 3, end: 3 })).toEqual({ from: 2, to: 3 })
  })

  it('widens to the left at the end of the document', () => {
    const state = EditorState.create({ doc: 'abc' })
    expect(widen(state, { start: 3, end: 3 })).toEqual({ from: 2, to: 3 })
  })

  it('leaves an empty line or document alone', () => {
    expect(widen(EditorState.create({ doc: '' }), { start: 0, end: 0 })).toEqual({ from: 0, to: 0 })
    expect(widen(EditorState.create({ doc: 'a\n\nb' }), { start: 2, end: 2 })).toEqual({
      from: 2,
      to: 2,
    })
  })
})

describe('stepcodeLint', () => {
  it('is an extension a state accepts', () => {
    const state = EditorState.create({ doc: 'x', extensions: stepcodeLint(options) })
    expect(state.doc.toString()).toBe('x')
  })
})
