// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Problems } from '../src/panels/Problems'
import { renderWithStore, storeWith } from './render'

const SOURCE = ['Proceso p', '  Escribir x;', '  Definir a Como Entero;', 'FinProceso'].join('\n')

const diagnostics: Diagnostic[] = [
  { from: 34, to: 35, severity: 'warning', message: 'a never read', source: 'W3002' },
  { from: 21, to: 22, severity: 'error', message: 'x undeclared', source: 'E3001' },
  { from: 21, to: 22, severity: 'warning', message: 'also here', source: 'W9999' },
]

const d1: Diagnostic = {
  from: 0,
  to: 1,
  severity: 'error',
  message: 'a undeclared',
  source: 'E3001',
}
const d2: Diagnostic = {
  from: 3,
  to: 4,
  severity: 'warning',
  message: 'c never read',
  source: 'W3002',
}

describe('Problems', () => {
  it('shows the empty state', () => {
    const { store } = storeWith({ source: SOURCE, diagnostics: [] })
    renderWithStore(<Problems onReveal={() => {}} />, store)
    expect(screen.getByText('Sin problemas')).toBeDefined()
  })

  it('lists diagnostics by position, errors before warnings at the same offset, with line:col', () => {
    const { store } = storeWith({ source: SOURCE, diagnostics })
    renderWithStore(<Problems onReveal={() => {}} />, store)
    const rows = screen.getAllByRole('row')
    const texts = rows.map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    )
    expect(texts).toEqual([
      ['✖error', '2:12', 'x undeclared', 'E3001'],
      ['▲advertencia', '2:12', 'also here', 'W9999'],
      ['▲advertencia', '3:11', 'a never read', 'W3002'],
    ])
    expect(
      within(rows[0] as HTMLElement).getByText('error', { selector: '.sr-only' }),
    ).toBeDefined()
    expect(
      within(rows[1] as HTMLElement).getByText('advertencia', { selector: '.sr-only' }),
    ).toBeDefined()
    const glyphs = rows.map(
      (row) =>
        within(row).getAllByRole('cell')[0]?.querySelector('[aria-hidden="true"]')?.textContent,
    )
    expect(glyphs).toEqual(['✖', '▲', '▲'])
  })

  it('reveals the span in a real editor on click', () => {
    const view = new EditorView({
      parent: document.body,
      state: EditorState.create({ doc: SOURCE }),
    })
    const { store } = storeWith({ source: SOURCE, diagnostics })
    renderWithStore(
      <Problems
        onReveal={(from, to) => view.dispatch({ selection: { anchor: from, head: to } })}
      />,
      store,
    )
    fireEvent.click(screen.getByText('a never read'))
    expect(view.state.selection.main.from).toBe(34)
    expect(view.state.selection.main.to).toBe(35)
    view.destroy()
  })

  it('follows the locale', () => {
    const { store } = storeWith({ source: SOURCE, diagnostics: [], profileId: 'en' })
    renderWithStore(<Problems onReveal={() => {}} />, store)
    expect(screen.getByText('No problems')).toBeDefined()
  })

  it('navigates rows with the keyboard and reveals on Enter', () => {
    const { store } = storeWith({ source: 'ab\ncd', diagnostics: [d1, d2] })
    const reveals: [number, number][] = []
    renderWithStore(<Problems onReveal={(from, to) => reveals.push([from, to])} />, store)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
    rows[0]?.focus()
    fireEvent.keyDown(rows[0] as HTMLElement, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(rows[1])
    fireEvent.keyDown(rows[1] as HTMLElement, { key: 'Enter' })
    expect(reveals).toEqual([[d2.from, d2.to]])
  })

  it('shows the check and text when clean', () => {
    const { store } = storeWith({})
    renderWithStore(<Problems onReveal={() => {}} />, store)
    expect(screen.getByText('Sin problemas')).toBeDefined()
    expect(screen.queryByRole('row')).toBeNull()
  })
})
