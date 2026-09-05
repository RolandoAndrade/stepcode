// @vitest-environment happy-dom
import { act, screen, within } from '@testing-library/react'
import type { Frame } from 'stepcode'
import { describe, expect, it, vi } from 'vitest'
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

function frameWith(value: number): Frame {
  return {
    name: 'p',
    line: 1,
    variables: [{ name: 'a', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value }],
  }
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

  it('renders frames as open details and flashes changed values', () => {
    vi.useFakeTimers()
    const { store, host } = storeWith({ state: 'paused' })
    renderWithStore(<Variables />, store)
    act(() => host.emit({ kind: 'paused', reason: 'step', line: 2, frames: [frameWith(1)] }))
    expect(screen.getAllByRole('group')).toHaveLength(1)
    act(() => host.emit({ kind: 'paused', reason: 'step', line: 3, frames: [frameWith(2)] }))
    const cell = screen.getByText('2')
    expect(cell.getAttribute('data-changed')).toBe('true')
    act(() => vi.advanceTimersByTime(600))
    expect(cell.getAttribute('data-changed')).toBeNull()
    vi.useRealTimers()
  })

  it('asks to pause when a program runs without frames', () => {
    const { store } = storeWith({ state: 'running' })
    renderWithStore(<Variables />, store)
    expect(screen.getByText('Pausa el programa para ver las variables')).toBeDefined()
  })
})
