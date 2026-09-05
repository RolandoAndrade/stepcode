// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installShortcuts } from '../src/components/shortcuts'
import { Toolbar } from '../src/components/Toolbar'
import type { WorkerState } from '../src/runtime/protocol'
import { renderWithStore, storeWith } from './render'

const errorDiagnostic: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warningDiagnostic: Diagnostic = { from: 0, to: 1, severity: 'warning', message: 'w' }

function buttons(): string[] {
  return screen
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label') ?? button.textContent ?? '')
    .filter((name) => name !== 'Tema oscuro' && name !== 'Tema claro')
}

describe('Toolbar controls', () => {
  it.each<[WorkerState, string[]]>([
    ['ready', ['Ejecutar', 'Paso']],
    ['done', ['Ejecutar', 'Paso']],
    ['error', ['Ejecutar', 'Paso']],
    ['running', ['Pausar', 'Detener']],
    ['paused', ['Continuar', 'Pasar por encima', 'Entrar', 'Salir', 'Detener']],
    ['input', ['Detener']],
    ['waiting', ['Detener']],
  ])('in %s shows %j', (state, expected) => {
    const { store } = storeWith({ state })
    renderWithStore(<Toolbar />, store)
    expect(buttons()).toEqual(expected)
  })

  it('disables Run and Step while an error diagnostic exists', () => {
    const { store } = storeWith({ diagnostics: [errorDiagnostic] })
    renderWithStore(<Toolbar />, store)
    expect((screen.getByRole('button', { name: 'Ejecutar' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    expect((screen.getByRole('button', { name: 'Paso' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('dispatches the store actions', () => {
    const { store, host } = storeWith({ state: 'paused' })
    renderWithStore(<Toolbar />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Pasar por encima' }))
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(host.calls).toEqual(['stepOver', 'step', 'stepOut', 'continue'])
    act(() => {
      host.emit({ kind: 'state', state: 'running' })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Detener' }))
    expect(host.calls.slice(-2)).toEqual(['pause', 'stop'])
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(host.calls.at(-1)).toBe('start:run')
  })

  it('shows the diagnostic badge and the state label', () => {
    const { store } = storeWith({
      state: 'paused',
      diagnostics: [errorDiagnostic, warningDiagnostic, warningDiagnostic],
    })
    renderWithStore(<Toolbar />, store)
    expect(screen.getByText('1 error')).toBeDefined()
    expect(screen.getByText('2 advertencias')).toBeDefined()
    expect(screen.getByText('En pausa')).toBeDefined()
  })

  it('switches the profile and the theme', () => {
    const { store } = storeWith({})
    renderWithStore(<Toolbar />, store)
    fireEvent.change(screen.getByLabelText('Perfil'), { target: { value: 'en' } })
    expect(store.getState().profileId).toBe('en')
    expect(screen.getByRole('button', { name: 'Run' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
    expect(store.getState().theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Light theme' })).toBeDefined()
  })

  it('locks the profile while a program is live', () => {
    const { store } = storeWith({ state: 'running' })
    renderWithStore(<Toolbar />, store)
    expect((screen.getByLabelText('Perfil') as HTMLSelectElement).disabled).toBe(true)
  })
})

describe('installShortcuts', () => {
  it('runs legal actions and prevents default', () => {
    const { store, host } = storeWith({})
    const uninstall = installShortcuts(store)
    const legal = new KeyboardEvent('keydown', { key: 'F5', cancelable: true })
    window.dispatchEvent(legal)
    expect(legal.defaultPrevented).toBe(true)
    expect(host.calls).toEqual(['start:run'])
    uninstall()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
  })

  it('swallows a bound key even when the action is illegal, so browser F10 never fires', () => {
    const { store, host } = storeWith({})
    installShortcuts(store)
    const illegal = new KeyboardEvent('keydown', { key: 'F10', cancelable: true })
    window.dispatchEvent(illegal)
    expect(illegal.defaultPrevented).toBe(true)
    expect(host.calls).toEqual([])
  })

  it('never swallows an unbound key', () => {
    const { store } = storeWith({})
    installShortcuts(store)
    const unbound = new KeyboardEvent('keydown', { key: 'F9', cancelable: true })
    window.dispatchEvent(unbound)
    expect(unbound.defaultPrevented).toBe(false)
  })
})
