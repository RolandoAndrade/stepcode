// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileTopBar } from '../src/shell/mobile/MobileTopBar'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('MobileTopBar', () => {
  it('shows the StepCode logo on the menu trigger', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <MobileTopBar env={env} />
      </TooltipProvider>,
      store,
    )
    const trigger = screen.getByRole('button', { name: 'Menú' })
    expect(trigger.querySelector('img')?.getAttribute('src')).toBe('/pwa-64x64.png')
  })

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
