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
    expect(screen.getByRole('status').textContent).toContain('Guardado')
    act(() => vi.advanceTimersByTime(4000))
    expect(store.getState().toasts).toEqual([])
    vi.useRealTimers()
  })
})
