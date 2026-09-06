// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toolbar } from '../src/shell/Toolbar'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('Toolbar (shell)', () => {
  it('has menu, filename, file actions on the left and the run cluster on the right', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <Toolbar env={env} />
      </TooltipProvider>,
      store,
    )
    const names = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))
    expect(names).toEqual(['Menú', 'Nuevo', 'Abrir…', 'Guardar', 'Ejecutar', 'Depurar'])
    expect(screen.getByRole('textbox', { name: 'Nombre del archivo' })).toBeDefined()
  })

  it('hides file actions when compact', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <Toolbar env={env} compact />
      </TooltipProvider>,
      store,
    )
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull()
  })

  it('badges Save while the document is dirty, and says so in its label', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <Toolbar env={env} />
      </TooltipProvider>,
      store,
    )
    const dot = (): Element | null => document.querySelector('[data-testid="unsaved-dot"]')
    expect(dot()).toBeNull()
    act(() => store.getState().setSource('x'))
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull()
    const save = screen.getByRole('button', { name: 'Guardar · cambios sin guardar' })
    expect(save.contains(dot())).toBe(true)
    expect(dot()?.getAttribute('aria-hidden')).toBe('true')
  })

  it('shows an indeterminate progress stripe only while a program runs', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <Toolbar env={env} />
      </TooltipProvider>,
      store,
    )
    expect(screen.queryByRole('progressbar')).toBeNull()
    act(() => store.setState({ state: 'running' }))
    const bar = screen.getByRole('progressbar', { name: 'Ejecutando…' })
    expect(bar.getAttribute('aria-valuenow')).toBeNull()
    act(() => store.setState({ state: 'paused' }))
    expect(screen.queryByRole('progressbar')).toBeNull()
    act(() => store.setState({ state: 'ready' }))
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('Nuevo replaces the document with the starter', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <Toolbar env={env} />
      </TooltipProvider>,
      store,
    )
    store.getState().setSource('')
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo' }))
    expect(store.getState().source).toContain('Proceso Hola')
  })
})
