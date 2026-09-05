// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
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
