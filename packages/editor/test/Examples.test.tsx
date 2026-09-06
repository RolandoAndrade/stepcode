// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Examples } from '../src/dialogs/Examples'
import { EXAMPLES } from '../src/examples/index'
import { renderWithStore, storeWith } from './render'

describe('Examples', () => {
  it('lists every example grouped by topic and filters by title', () => {
    const { store } = storeWith({ dialog: 'examples' })
    renderWithStore(<Examples />, store)
    expect(screen.getAllByRole('button', { name: /Abrir ejemplo/ })).toHaveLength(EXAMPLES.length)
    expect(screen.getByRole('heading', { name: 'Primeros pasos' })).toBeDefined()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar ejemplos' }), {
      target: { value: 'factorial' },
    })
    expect(screen.getAllByRole('button', { name: /Abrir ejemplo/ })).toHaveLength(1)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar ejemplos' }), {
      target: { value: 'zzz' },
    })
    expect(screen.getByText('Ningún ejemplo coincide')).toBeDefined()
  })

  it('loads an example in the active profile spelling and names the document', () => {
    const { store } = storeWith({ dialog: 'examples' })
    store.getState().setProfile('en')
    renderWithStore(<Examples />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Open example: Hola mundo' }))
    expect(store.getState().name).toBe('hola-mundo.stepcode')
    expect(store.getState().source).toContain('Program')
    expect(store.getState().dialog).toBeNull()
  })
})
