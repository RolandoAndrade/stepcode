// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

  it('renders nothing while hidden', () => {
    const { store } = storeWith({})
    const { container } = renderWithStore(<SymbolBar view={null} visible={false} />, store)
    expect(container.textContent).toBe('')
  })
})
