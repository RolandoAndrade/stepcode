// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Filename } from '../src/shell/Filename'
import { renderWithStore, storeWith } from './render'

describe('Filename', () => {
  it('shows the name without its extension, commits on Enter, reverts on Escape and on empty', () => {
    const { store } = storeWith({})
    renderWithStore(<Filename />, store)
    const input = screen.getByRole('textbox', { name: 'Nombre del archivo' }) as HTMLInputElement
    expect(input.value).toBe('sin título')
    input.focus()
    fireEvent.change(input, { target: { value: 'hola' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(store.getState().name).toBe('hola.stepcode')
    expect(input.value).toBe('hola')
    input.focus()
    fireEvent.change(input, { target: { value: 'otro' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('hola')
    expect(store.getState().name).toBe('hola.stepcode')
    input.focus()
    fireEvent.change(input, { target: { value: '  ' } })
    fireEvent.blur(input)
    expect(store.getState().name).toBe('hola.stepcode')
    expect(input.value).toBe('hola')
  })

  it('renaming an opened document keeps its current extension', () => {
    const { store } = storeWith({ name: 'ejemplo.psc' })
    renderWithStore(<Filename />, store)
    const input = screen.getByRole('textbox', { name: 'Nombre del archivo' }) as HTMLInputElement
    expect(input.value).toBe('ejemplo')
    input.focus()
    fireEvent.change(input, { target: { value: 'hola' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(store.getState().name).toBe('hola.psc')
  })

  it('honors an explicit accepted extension typed in the field', () => {
    const { store } = storeWith({ name: 'ejemplo.psc' })
    renderWithStore(<Filename />, store)
    const input = screen.getByRole('textbox', { name: 'Nombre del archivo' }) as HTMLInputElement
    input.focus()
    fireEvent.change(input, { target: { value: 'hola.txt' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(store.getState().name).toBe('hola.txt')
  })

  it('leaves the unsaved mark to the Save button', () => {
    const { store } = storeWith({})
    renderWithStore(<Filename />, store)
    act(() => store.getState().setSource('x'))
    expect(screen.queryByText('●')).toBeNull()
  })
})
