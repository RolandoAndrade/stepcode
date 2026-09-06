// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SymbolBar } from '../src/shell/mobile/SymbolBar'
import { renderWithStore, storeWith } from './render'

describe('SymbolBar', () => {
  it('inserts the tapped symbol into the editor', () => {
    const { store } = storeWith({})
    const view = new EditorView({ state: EditorState.create({ doc: '' }) })
    renderWithStore(<SymbolBar view={view} visible />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Si' }))
    fireEvent.click(screen.getByRole('button', { name: '(' }))
    expect(view.state.doc.toString()).toBe('Si (')
    view.destroy()
  })

  it('keeps two keys that print the same label apart', () => {
    // A profile may spell the assignment with a character the punctuation row already carries.
    const { store } = storeWith({
      customProfiles: [{ id: 'dosp', extends: 'es', operators: { assign: [':'] } }],
      profileId: 'dosp',
    })
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = new EditorView({ state: EditorState.create({ doc: '' }) })
    renderWithStore(<SymbolBar view={view} visible />, store)
    expect(screen.getAllByRole('button', { name: ':' })).toHaveLength(2)
    expect(errors.mock.calls.map((call) => String(call[0])).join(' ')).not.toContain('same key')
    errors.mockRestore()
    view.destroy()
  })

  it('renders nothing while hidden', () => {
    const { store } = storeWith({})
    const { container } = renderWithStore(<SymbolBar view={null} visible={false} />, store)
    expect(container.textContent).toBe('')
  })
})
