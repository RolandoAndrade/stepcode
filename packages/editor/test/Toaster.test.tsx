// @vitest-environment happy-dom
import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toaster } from '../src/dialogs/Toaster'
import { renderWithStore, storeWith } from './render'

describe('Toaster', () => {
  it('shows toasts and dismisses them after four seconds', () => {
    vi.useFakeTimers()
    const { store } = storeWith({})
    renderWithStore(<Toaster />, store)
    act(() => store.getState().notify('Guardado'))
    // Radix's own screen-reader announcer also ends up with `role="status"` after a double
    // requestAnimationFrame, so a plain (synchronous) text query — not a role query, and not an
    // async `findBy` whose polling needs real timers — is what stays unambiguous under fake timers.
    expect(screen.getByText('Guardado')).toBeDefined()
    act(() => vi.advanceTimersByTime(4000))
    expect(store.getState().toasts).toEqual([])
    expect(screen.queryByText('Guardado')).toBeNull()
    vi.useRealTimers()
  })
})
