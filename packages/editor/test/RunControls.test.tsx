// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { WorkerState } from '../src/runtime/protocol'
import { RunControls } from '../src/shell/RunControls'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

function visible(): string[] {
  return screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? '')
}

describe('RunControls', () => {
  it.each<[WorkerState, string[]]>([
    ['ready', ['Ejecutar', 'Depurar']],
    ['done', ['Ejecutar', 'Depurar']],
    ['error', ['Ejecutar', 'Depurar']],
    ['running', ['Pausar', 'Detener']],
    ['paused', ['Continuar', 'Paso', 'Entrar', 'Salir', 'Detener']],
    ['input', ['Detener']],
    ['waiting', ['Detener']],
  ])('in %s shows %j', (state, expected) => {
    const { store } = storeWith({ state })
    renderWithStore(
      <TooltipProvider>
        <RunControls />
      </TooltipProvider>,
      store,
    )
    expect(visible()).toEqual(expected)
  })

  it('colors the go actions green and the stop action red, compact too', () => {
    for (const compact of [false, true]) {
      const { store } = storeWith({ state: 'ready' })
      const { unmount } = renderWithStore(
        <TooltipProvider>
          <RunControls compact={compact} />
        </TooltipProvider>,
        store,
      )
      expect(screen.getByRole('button', { name: 'Ejecutar' }).className).toContain('text-success')
      if (!compact) {
        expect(screen.getByRole('button', { name: 'Depurar' }).className).toContain('text-success')
      }
      act(() => store.setState({ state: 'running' }))
      expect(screen.getByRole('button', { name: 'Detener' }).className).toContain('text-error')
      unmount()
    }
  })

  it('compact renders no placeholder spans, so the phone bar keeps no gap for hidden slots', () => {
    const { store } = storeWith({ state: 'ready' })
    const { container } = renderWithStore(
      <TooltipProvider>
        <RunControls compact />
      </TooltipProvider>,
      store,
    )
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(0)
  })

  it('keeps the placeholders on the desktop toolbar', () => {
    const { store } = storeWith({ state: 'ready' })
    const { container } = renderWithStore(
      <TooltipProvider>
        <RunControls />
      </TooltipProvider>,
      store,
    )
    expect(container.querySelectorAll('span[aria-hidden="true"]').length).toBeGreaterThan(0)
  })

  it('Depurar starts in step mode', () => {
    const { store, host } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <RunControls />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Depurar' }))
    expect(host.calls).toEqual(['start:step'])
  })

  it('Ejecutar starts in run mode', () => {
    const { store, host } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <RunControls />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(host.calls).toEqual(['start:run'])
  })

  it('keeps working after Depurar starts and the worker reports paused', () => {
    const { store, host } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <RunControls />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Depurar' }))
    act(() => {
      host.emit({ kind: 'state', state: 'paused' })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(host.calls).toEqual(['start:step', 'continue'])
  })

  it('shows Ejecutar enabled with errors but opens Problemas instead of running', () => {
    const { store, host } = storeWith({
      diagnostics: [{ from: 0, to: 1, severity: 'error', message: 'x' }],
    })
    renderWithStore(
      <TooltipProvider>
        <RunControls />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(host.calls).toEqual([])
    expect(store.getState().panelRequest?.id).toBe('problems')
  })
})
