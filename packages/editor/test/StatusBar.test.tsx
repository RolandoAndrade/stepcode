// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { profileItems, StatusBar, statusText } from '../src/shell/StatusBar'
import { stringsFor } from '../src/strings'
import { renderWithStore, storeWith } from './render'

const err: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warn: Diagnostic = { from: 0, to: 1, severity: 'warning', message: 'w' }

describe('statusText', () => {
  const s = stringsFor('es')
  it('maps every state', () => {
    expect(statusText(s, 'ready', null, null)).toBe('Listo')
    expect(statusText(s, 'running', null, null)).toBe('Ejecutando…')
    expect(statusText(s, 'paused', 12, null)).toBe('En pausa en la línea 12')
    expect(statusText(s, 'input', 3, null)).toBe('Esperando entrada')
    expect(statusText(s, 'waiting', 3, null)).toBe('Esperando…')
    expect(statusText(s, 'done', null, null)).toBe('Terminado')
    expect(statusText(s, 'error', 7, { message: 'm', line: 7 })).toBe('Error en la línea 7')
  })
})

describe('StatusBar', () => {
  it('shows cursor, profile, problems and state as buttons', () => {
    const { store } = storeWith({ diagnostics: [err, err, warn] })
    store.getState().setCursor(12, 4)
    renderWithStore(<StatusBar />, store)
    expect(screen.getByRole('button', { name: /Ln 12, Col 4/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Español/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /✖ 2 ▲ 1/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Listo/ })).toBeDefined()
  })

  it('puts problems and the run state left, cursor and profile right', () => {
    const { store } = storeWith({ diagnostics: [err, warn] })
    store.getState().setCursor(12, 4)
    renderWithStore(<StatusBar />, store)
    const order = screen.getAllByRole('button').map((b) => b.textContent ?? '')
    expect(order[0]).toMatch(/✖ 1\s+▲ 1/)
    expect(order[1]).toMatch(/Listo/)
    expect(order[2]).toMatch(/Ln 12, Col 4/)
    expect(order[3]).toMatch(/Español/)
    expect(screen.getByRole('button', { name: /✖ 1 ▲ 1/ }).querySelector('svg')).not.toBeNull()
  })

  it('drops the problems icon when there is nothing to report', () => {
    const { store } = storeWith({})
    renderWithStore(<StatusBar />, store)
    expect(screen.getByRole('button', { name: /Sin problemas/ }).querySelector('svg')).toBeNull()
  })

  it('shows problems left and the profile right when compact', () => {
    const { store } = storeWith({ diagnostics: [err] })
    store.getState().setCursor(12, 4)
    renderWithStore(<StatusBar compact />, store)
    expect(screen.queryByRole('button', { name: /Ln 12, Col 4/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Listo/ })).toBeNull()
    const order = screen.getAllByRole('button').map((b) => b.textContent ?? '')
    expect(order[0]).toMatch(/✖ 1/)
    expect(order[1]).toMatch(/Español/)
  })

  it('paints itself accent while the program runs and warning while it is paused', () => {
    const { store } = storeWith({})
    const { container } = renderWithStore(<StatusBar />, store)
    const footer = (): Element => {
      const found = container.querySelector('footer')
      if (found === null) throw new Error('no status bar')
      return found
    }
    expect(footer().className).not.toContain('bg-accent-strong')
    expect(footer().className).not.toContain('bg-warning-strong')
    for (const state of ['running', 'input', 'waiting'] as const) {
      act(() => store.setState({ state }))
      // The -strong pair, not bg-accent: 12 px text on a plain accent fill misses 4.5:1.
      expect(footer().className, state).toContain('bg-accent-strong')
      expect(footer().className, state).toContain('text-on-accent')
    }
    act(() => store.setState({ state: 'paused' }))
    expect(footer().className).toContain('bg-warning-strong')
    expect(footer().className).toContain('text-on-warning')
    act(() => store.setState({ state: 'done' }))
    expect(footer().className).toContain('bg-surface')
  })

  it('drops the problems colors while running, where the accent band carries them', () => {
    const { store } = storeWith({ diagnostics: [err] })
    renderWithStore(<StatusBar />, store)
    expect(screen.getByRole('button', { name: /✖ 1/ }).className).toContain('text-error')
    act(() => store.setState({ state: 'running' }))
    expect(screen.getByRole('button', { name: /✖ 1/ }).className).not.toContain('text-error')
  })

  it('says no problems when clean and requests the Problems panel on click', () => {
    const { store } = storeWith({})
    renderWithStore(<StatusBar />, store)
    fireEvent.click(screen.getByRole('button', { name: /✓ Sin problemas/ }))
    expect(store.getState().panelRequest).toEqual({ id: 'problems', seq: 1 })
  })

  it('focuses the editor and the console through the callbacks', () => {
    const { store } = storeWith({ state: 'running' })
    const onFocusEditor = vi.fn()
    const onFocusConsole = vi.fn()
    renderWithStore(
      <StatusBar onFocusEditor={onFocusEditor} onFocusConsole={onFocusConsole} />,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: /Ln 1, Col 1/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ejecutando/ }))
    expect(onFocusEditor).toHaveBeenCalledOnce()
    expect(onFocusConsole).toHaveBeenCalledOnce()
    expect(store.getState().panelRequest).toEqual({ id: 'console', seq: 1 })
  })

  it('lists profiles in the popover and switches on selection', async () => {
    const { store } = storeWith({})
    store.getState().saveCustomProfile({ id: 'mio', extends: 'es' })
    renderWithStore(<StatusBar />, store)
    expect(profileItems(store.getState()).map((p) => p.id)).toEqual(['es', 'en', 'pseint', 'mio'])
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Español/ }))
    })
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'English' }))
    expect(store.getState().profileId).toBe('en')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /English/ }))
    })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Customize…' }))
    expect(store.getState().dialog).toBe('settings')
  })

  it('disables the profile picker while a program is live', () => {
    const { store } = storeWith({ state: 'running' })
    renderWithStore(<StatusBar />, store)
    expect((screen.getByRole('button', { name: /Español/ }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })
})
