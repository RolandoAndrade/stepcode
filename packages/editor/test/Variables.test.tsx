// @vitest-environment happy-dom
import { screen, within } from '@testing-library/react'
import type { Frame } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { Variables } from '../src/panels/Variables'
import { renderWithStore, storeWith } from './render'

const inner: Frame = {
  name: 'doble',
  line: 2,
  variables: [
    { name: 'n', kind: 'parameter', type: { kind: 'scalar', name: 'integer' }, value: 4 },
    { name: 'r', kind: 'result', type: { kind: 'scalar', name: 'integer' }, value: undefined },
  ],
}

const outer: Frame = {
  name: 'p',
  line: 7,
  variables: [
    {
      name: 'xs',
      kind: 'variable',
      type: { kind: 'array', element: 'integer', rank: 1 },
      value: { element: 'integer', dims: [2], data: [1, 2] },
    },
  ],
}

describe('Variables', () => {
  it('shows the empty state while ready', () => {
    const { store } = storeWith({ state: 'ready', frames: [] })
    renderWithStore(<Variables />, store)
    expect(screen.getByText('Sin programa en ejecución')).toBeDefined()
  })

  it('lists frames innermost first with kind, type, and value columns', () => {
    const { store } = storeWith({ state: 'paused', frames: [inner, outer] })
    renderWithStore(<Variables />, store)
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(['doble · línea 2', 'p · línea 7'])
    const rows = screen
      .getAllByRole('row')
      .filter((row) => within(row).queryAllByRole('cell').length > 0)
    const cells = rows.map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    )
    expect(cells).toEqual([
      ['n', 'parámetro', 'Entero', '4'],
      ['r', 'resultado', 'Entero', '—'],
      ['xs', 'variable', 'Arreglo de Entero', '[1, 2]'],
    ])
  })

  it('keeps showing frames after done and follows the locale', () => {
    const { store } = storeWith({ state: 'done', frames: [outer], profileId: 'en' })
    renderWithStore(<Variables />, store)
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('p · line 7')
    expect(screen.getByText('Array of Integer')).toBeDefined()
  })
})
