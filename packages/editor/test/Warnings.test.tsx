// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Warnings } from '../src/dialogs/Warnings'
import { renderWithStore, storeWith } from './render'

describe('Warnings', () => {
  it('lists warnings and runs anyway', () => {
    const { store, host } = storeWith({
      dialog: 'warnings',
      diagnostics: [{ from: 0, to: 1, severity: 'warning', message: 'cuidado' }],
    })
    renderWithStore(<Warnings />, store)
    expect(screen.getByText(/cuidado/)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar igualmente' }))
    expect(host.calls).toEqual(['start:run'])
  })
})
