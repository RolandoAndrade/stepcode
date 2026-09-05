// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileTopBar } from '../src/shell/mobile/MobileTopBar'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('MobileTopBar', () => {
  it('marks the active profile in the menu sheet', () => {
    const { store } = storeWith({ profileId: 'pseint' })
    renderWithStore(
      <TooltipProvider>
        <MobileTopBar env={env} />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Menú' }))
    expect(screen.getByRole('menuitemradio', { name: 'PSeInt' }).getAttribute('aria-checked')).toBe(
      'true',
    )
    expect(
      screen.getByRole('menuitemradio', { name: 'Español' }).getAttribute('aria-checked'),
    ).toBe('false')
  })
})
