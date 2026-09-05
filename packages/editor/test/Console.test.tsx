// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Console } from '../src/panels/Console'
import { renderWithStore, storeWith } from './render'

const integer = { kind: 'scalar', name: 'integer' } as const

describe('Console', () => {
  it('joins chunks verbatim', () => {
    const { store } = storeWith({ output: { chunks: ['a', 'b\n', 'c'], dropped: 0 } })
    renderWithStore(<Console />, store)
    expect(screen.getByTestId('console-output').textContent).toBe('ab\nc')
  })

  it('shows the dropped marker first when chunks were dropped', () => {
    const { store } = storeWith({ output: { chunks: ['z'], dropped: 12 } })
    renderWithStore(<Console />, store)
    expect(screen.getByTestId('console-output').textContent).toBe('… 12 fragmentos descartados\nz')
  })

  it('prompts for a typed variable and submits on Enter', () => {
    const { store, host } = storeWith({
      state: 'input',
      pendingInput: { line: 3, target: { name: 'n', type: integer } },
    })
    renderWithStore(<Console />, store)
    const input = screen.getByLabelText('Leer n (Entero)')
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    expect(host.calls).toEqual(['input:42'])
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('prompts for a key and submits an empty answer on any key', () => {
    const { store, host } = storeWith({ state: 'input', pendingInput: { line: 3, target: null } })
    renderWithStore(<Console />, store)
    const input = screen.getByLabelText('Presiona una tecla')
    fireEvent.keyDown(input, { key: 'a' })
    expect(host.calls).toEqual(['input:'])
  })

  it('shows the rejection and keeps focus for the next answer', () => {
    const { store } = storeWith({
      state: 'input',
      pendingInput: { line: 3, target: { name: 'n', type: integer } },
    })
    renderWithStore(<Console />, store)
    act(() => {
      store.setState({
        pendingInput: {
          line: 3,
          target: { name: 'n', type: integer },
          rejected: 'no es un entero',
        },
      })
    })
    expect(screen.getByRole('alert').textContent).toBe('no es un entero')
    expect(document.activeElement).toBe(screen.getByLabelText('Leer n (Entero)'))
  })

  it('renders the prompt in the profile locale', () => {
    const { store } = storeWith({
      profileId: 'en',
      state: 'input',
      pendingInput: { line: 3, target: { name: 'n', type: integer } },
    })
    renderWithStore(<Console />, store)
    expect(screen.getByLabelText('Read n (Integer)')).toBeDefined()
  })

  it('shows the wait line while waiting and drops it afterwards', () => {
    const { store } = storeWith({ state: 'waiting', wait: { line: 2, millis: 500 } })
    renderWithStore(<Console />, store)
    expect(screen.getByText('Esperando 500 ms')).toBeDefined()
    act(() => {
      store.setState({ state: 'running', wait: null })
    })
    expect(screen.queryByText('Esperando 500 ms')).toBeNull()
  })

  it('shows a runtime error with its line and a see-line button', () => {
    const { store } = storeWith({
      state: 'error',
      error: { line: 4, message: 'división por cero' },
    })
    renderWithStore(<Console />, store)
    expect(screen.getByRole('alert').textContent).toBe('Línea 4: división por cero ver línea 4')
  })

  it('appends the finished line when done and a see-line button on error', () => {
    const { store, host } = storeWith({})
    const reveals: number[] = []
    renderWithStore(<Console onReveal={(line) => reveals.push(line)} />, store)
    act(() => {
      host.emit({ kind: 'state', state: 'done' })
      host.emit({ kind: 'done', frames: [] })
    })
    expect(screen.getByText('— Programa terminado —')).toBeDefined()
    act(() => {
      host.emit({ kind: 'state', state: 'error' })
      host.emit({
        kind: 'error',
        diagnostic: { code: 'E4001', severity: 'error', span: { start: 0, end: 1 }, data: {} },
        frames: [],
      })
    })
    fireEvent.click(screen.getByRole('button', { name: 'ver línea 1' }))
    expect(reveals).toEqual([1])
  })

  it('stops auto-scrolling when the store says so', () => {
    const { store, host } = storeWith({})
    renderWithStore(<Console />, store)
    const pre = screen.getByTestId('console-output')
    act(() => store.getState().setAutoScroll(false))
    act(() => host.emit({ kind: 'output', chunks: ['a\n'] }))
    expect(pre.scrollTop).toBe(0)
  })
})
