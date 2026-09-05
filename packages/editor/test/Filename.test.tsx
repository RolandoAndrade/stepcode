// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Filename } from '../src/shell/Filename'
import { renderWithStore, storeWith } from './render'

describe('Filename', () => {
  it('shows the name, commits on Enter with the extension, reverts on Escape and on empty', () => {
    const { store } = storeWith({})
    renderWithStore(<Filename />, store)
    const input = screen.getByRole('textbox', { name: 'Nombre del archivo' }) as HTMLInputElement
    expect(input.value).toBe('sin título.stepcode')
    input.focus()
    fireEvent.change(input, { target: { value: 'hola' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(store.getState().name).toBe('hola.stepcode')
    input.focus()
    fireEvent.change(input, { target: { value: 'otro' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('hola.stepcode')
    expect(store.getState().name).toBe('hola.stepcode')
    input.focus()
    fireEvent.change(input, { target: { value: '  ' } })
    fireEvent.blur(input)
    expect(store.getState().name).toBe('hola.stepcode')
  })

  it('marks an unsaved document', () => {
    const { store } = storeWith({})
    renderWithStore(<Filename />, store)
    expect(screen.queryByText('●')).toBeNull()
    act(() => store.getState().setSource('x'))
    expect(screen.getByText('●')).toBeDefined()
  })
})
