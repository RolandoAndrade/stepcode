// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PanelActions } from '../src/panels/PanelActions'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const err: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }

describe('PanelActions', () => {
  it('console: clear', () => {
    const { store, host } = storeWith({})
    host.emit({ kind: 'output', chunks: ['x'] })
    renderWithStore(
      <TooltipProvider>
        <PanelActions panel="console" />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(store.getState().output.chunks).toEqual([])
    expect(screen.queryByRole('button', { name: 'Desplazamiento automático' })).toBeNull()
  })

  it('problems: the counts', () => {
    const { store } = storeWith({ diagnostics: [err] })
    renderWithStore(<PanelActions panel="problems" />, store)
    expect(screen.getByText('1 error, 0 advertencias')).toBeDefined()
  })

  it('editor and variables: nothing', () => {
    const { store } = storeWith({})
    const { container } = renderWithStore(<PanelActions panel="variables" />, store)
    expect(container.textContent).toBe('')
  })
})
