// @vitest-environment happy-dom
import { forceParsing } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { currentLineOf, toggleBreakpoint } from '@stepcode/codemirror'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Editor, type EditorHandle } from '../src/panels/Editor'
import { renderWithStore, storeWith } from './render'

const BROKEN = ['Proceso p', '  Escribir x;', 'FinProceso'].join('\n')
const FINE = [
  'Proceso p',
  '  Definir a Como Entero;',
  '  a <- 1;',
  '  Escribir a;',
  'FinProceso',
].join('\n')

function mount(source: string) {
  const { store, host } = storeWith({ source })
  const ref = createRef<EditorHandle>()
  const rendered = renderWithStore(<Editor handleRef={ref} />, store)
  const handle = ref.current
  if (handle === null) throw new Error('the editor did not expose its handle')
  forceParsing(handle.view, handle.view.state.doc.length, 1e9)
  return { store, host, handle, view: handle.view, rendered }
}

describe('Editor', () => {
  it('shows the store source and pushes diagnostics once the tree is ready', () => {
    const { store, view } = mount(BROKEN)
    expect(view.state.doc.toString()).toBe(BROKEN)
    expect(store.getState().diagnostics.map((d) => d.source)).toEqual(['E3001'])
  })

  it('pushes edits to the store and re-lints after the next parse', () => {
    const { store, view } = mount(FINE)
    expect(store.getState().diagnostics).toEqual([])
    view.dispatch({ changes: { from: view.state.doc.length, insert: '\nEscribir z;' } })
    expect(store.getState().source).toBe(`${FINE}\nEscribir z;`)
    forceParsing(view, view.state.doc.length, 1e9)
    expect(store.getState().diagnostics.length).toBeGreaterThan(0)
  })

  it('forwards breakpoint changes to the store and the host', () => {
    const { store, host, view } = mount(FINE)
    view.dispatch({ effects: toggleBreakpoint.of({ line: 3 }) })
    expect(store.getState().breakpoints).toEqual([3])
    expect(host.calls).toContain('setBreakpoints:3')
    view.dispatch({ effects: toggleBreakpoint.of({ line: 3 }) })
    expect(store.getState().breakpoints).toEqual([])
  })

  it('moves the current-line marker when the store says so', () => {
    const { store, view } = mount(FINE)
    expect(currentLineOf(view.state)).toBeNull()
    store.setState({ currentLine: 3 })
    expect(currentLineOf(view.state)).toBe(3)
    store.setState({ currentLine: null })
    expect(currentLineOf(view.state)).toBeNull()
  })

  it('is read-only while a program is live', () => {
    const { host, view } = mount(FINE)
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
    host.emit({ kind: 'state', state: 'running' })
    expect(view.state.facet(EditorState.readOnly)).toBe(true)
    host.emit({ kind: 'state', state: 'paused' })
    expect(view.state.facet(EditorState.readOnly)).toBe(true)
    host.emit({ kind: 'state', state: 'done' })
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
  })

  it('switches the language when the profile changes', () => {
    const { store, view } = mount(FINE)
    store.getState().setProfile('en')
    forceParsing(view, view.state.doc.length, 1e9)
    expect(store.getState().diagnostics.length).toBeGreaterThan(0)
    store.getState().setProfile('es')
    forceParsing(view, view.state.doc.length, 1e9)
    expect(store.getState().diagnostics).toEqual([])
  })

  it('follows the theme through the dark facet', () => {
    const { store, view } = mount(FINE)
    expect(view.state.facet(EditorView.darkTheme)).toBe(false)
    store.getState().setThemePreference('dark')
    expect(view.state.facet(EditorView.darkTheme)).toBe(true)
  })

  it('reveals a span by selecting it', () => {
    const { handle, view } = mount(FINE)
    handle.revealSpan(12, 13)
    expect(view.state.selection.main.from).toBe(12)
    expect(view.state.selection.main.to).toBe(13)
  })

  it('destroys the view and clears the handle on unmount', () => {
    const { store } = storeWith({ source: FINE })
    const ref = createRef<EditorHandle>()
    const rendered = renderWithStore(<Editor handleRef={ref} />, store)
    const dom = ref.current?.view.dom
    rendered.unmount()
    expect(ref.current).toBeNull()
    expect(dom?.isConnected).toBe(false)
  })
})
