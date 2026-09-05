// @vitest-environment happy-dom
import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DialogHost } from '../src/dialogs/DialogHost'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('DialogHost', () => {
  it('renders whichever dialog the store names', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <DialogHost env={env} />
      </TooltipProvider>,
      store,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    for (const [name, title] of [
      ['settings', 'Ajustes'],
      ['examples', 'Ejemplos'],
      ['share', 'Compartir'],
      ['about', 'Acerca de'],
    ] as const) {
      act(() => store.getState().openDialog(name))
      expect(screen.getByRole('dialog', { name: title })).toBeDefined()
      act(() => store.getState().closeDialog())
    }
  })
})
