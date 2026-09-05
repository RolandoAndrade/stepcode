// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmSave } from '../src/dialogs/ConfirmSave'
import { renderWithStore, storeWith } from './render'

function setup() {
  const { store } = storeWith({})
  store.getState().setSource('Proceso Cambiado\nFinProceso\n')
  store.getState().requestReplace({ name: 'otro.stepcode', source: 'x' })
  const download = vi.fn()
  const env = { pickers: {}, download, pickFallback: async () => null }
  renderWithStore(<ConfirmSave env={env} />, store)
  return { store, download }
}

describe('ConfirmSave', () => {
  it('shows the question for the current name with three choices', () => {
    setup()
    expect(
      screen.getByRole('dialog', { name: '¿Guardar los cambios de sin título.stepcode?' }),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'No guardar' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDefined()
  })

  it('discards, applying the parked draft', () => {
    const { store } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'No guardar' }))
    expect(store.getState().source).toBe('x')
    expect(store.getState().name).toBe('otro.stepcode')
  })

  it('cancels, keeping the current document', () => {
    const { store } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(store.getState().source).toBe('Proceso Cambiado\nFinProceso\n')
    expect(store.getState().dialog).toBeNull()
  })

  it('saves (download fallback) and then applies the draft', async () => {
    const { store, download } = setup()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    })
    expect(download).toHaveBeenCalledWith('sin título.stepcode', 'Proceso Cambiado\nFinProceso\n')
    expect(store.getState().source).toBe('x')
  })
})
