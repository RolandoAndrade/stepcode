// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type PanelStates, Sidebar } from '../src/shell/Sidebar'
import type { PanelId } from '../src/store/layout'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const err: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warn: Diagnostic = { from: 0, to: 1, severity: 'warning', message: 'y' }

const HIDDEN: PanelStates = {
  editor: { visible: true, active: true },
  console: { visible: false, active: false },
  problems: { visible: false, active: false },
  variables: { visible: false, active: false },
}

function mount(states: PanelStates, partial = {}) {
  const onToggle = vi.fn<(id: PanelId) => void>()
  const { store } = storeWith(partial)
  renderWithStore(
    <TooltipProvider>
      <Sidebar states={states} onToggle={onToggle} />
    </TooltipProvider>,
    store,
  )
  return onToggle
}

describe('Sidebar', () => {
  it('offers one button per non-editor panel, in order, and reports clicks', () => {
    const onToggle = mount(HIDDEN)
    const names = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))
    expect(names).toEqual(['Consola', 'Problemas', 'Variables'])
    fireEvent.click(screen.getByRole('button', { name: 'Variables' }))
    expect(onToggle).toHaveBeenCalledWith('variables')
  })

  it('presses only the panel that is visible and active in its group', () => {
    mount({
      ...HIDDEN,
      console: { visible: true, active: true },
      problems: { visible: true, active: false },
    })
    expect(screen.getByRole('button', { name: 'Consola' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    // `IconButton` leaves the attribute off when the button is not pressed.
    expect(
      screen.getByRole('button', { name: 'Problemas' }).getAttribute('aria-pressed'),
    ).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Variables' }).getAttribute('aria-pressed'),
    ).toBeNull()
  })

  it('badges the problems button with the error count only', () => {
    mount(HIDDEN, { diagnostics: [err, err, warn] })
    expect(screen.getByText('2')).toBeDefined()
  })

  it('shows no badge when nothing is an error', () => {
    mount(HIDDEN, { diagnostics: [warn] })
    expect(screen.queryByText('1')).toBeNull()
    expect(screen.queryByText('0')).toBeNull()
  })
})
