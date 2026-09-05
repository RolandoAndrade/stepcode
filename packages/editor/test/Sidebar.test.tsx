// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PANEL_MIME, type PanelStates, Sidebar, type Zone } from '../src/shell/Sidebar'
import type { PanelId } from '../src/store/layout'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const err: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warn: Diagnostic = { from: 0, to: 1, severity: 'warning', message: 'y' }

const HIDDEN: PanelStates = {
  editor: { visible: true, active: true, zone: 'left-bottom' },
  console: { visible: false, active: false, zone: 'left-bottom' },
  problems: { visible: false, active: false, zone: 'left-bottom' },
  variables: { visible: false, active: false, zone: 'left-bottom' },
}

function mount(states: PanelStates, partial = {}) {
  const onToggle = vi.fn<(id: PanelId) => void>()
  const onMove = vi.fn<(id: PanelId, zone: Zone) => void>()
  const { store } = storeWith(partial)
  renderWithStore(
    <TooltipProvider>
      <Sidebar states={states} onToggle={onToggle} onMove={onMove} />
    </TooltipProvider>,
    store,
  )
  return { onToggle, onMove }
}

function zone(name: Zone): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-zone="${name}"]`)
}

function labelsIn(name: Zone): string[] {
  return [...(zone(name)?.querySelectorAll('button') ?? [])].map(
    (button) => button.getAttribute('aria-label') ?? '',
  )
}

/** A drag carrying a panel id, as the sidebar's own buttons start it. */
function transfer(id: string) {
  return { types: [PANEL_MIME], getData: (mime: string) => (mime === PANEL_MIME ? id : '') }
}

describe('Sidebar', () => {
  it('offers one button per non-editor panel, in order, and reports clicks', () => {
    const { onToggle } = mount(HIDDEN)
    const names = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))
    expect(names).toEqual(['Consola', 'Problemas', 'Variables'])
    fireEvent.click(screen.getByRole('button', { name: 'Variables' }))
    expect(onToggle).toHaveBeenCalledWith('variables')
  })

  it('presses only the panel that is visible and active in its group', () => {
    mount({
      ...HIDDEN,
      console: { visible: true, active: true, zone: 'left-bottom' },
      problems: { visible: true, active: false, zone: 'left-bottom' },
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

  it('puts each button in the cluster its group sits in, and only then opens the right strip', () => {
    mount(HIDDEN)
    expect(labelsIn('left-bottom')).toEqual(['Consola', 'Problemas', 'Variables'])
    expect(labelsIn('left-top')).toEqual([])
    expect(zone('right')).toBeNull()
    document.body.innerHTML = ''
    mount({
      ...HIDDEN,
      console: { visible: true, active: true, zone: 'right' },
      problems: { visible: false, active: false, zone: 'left-top' },
    })
    expect(labelsIn('right')).toEqual(['Consola'])
    expect(labelsIn('left-top')).toEqual(['Problemas'])
    expect(labelsIn('left-bottom')).toEqual(['Variables'])
  })

  it('moves a panel to the zone its icon is dropped on', () => {
    const { onMove } = mount(HIDDEN)
    const button = screen.getByRole('button', { name: 'Consola' })
    expect(button.getAttribute('draggable')).toBe('true')
    const data = new Map<string, string>()
    fireEvent.dragStart(button, {
      dataTransfer: { setData: (mime: string, value: string) => data.set(mime, value) },
    })
    expect(data.get(PANEL_MIME)).toBe('console')
    // Every zone offers itself while a drag is in flight, the right strip included.
    expect(zone('right')).not.toBeNull()
    const target = zone('left-top') as HTMLElement
    fireEvent.drop(target, { dataTransfer: transfer('console') })
    expect(onMove).toHaveBeenCalledWith('console', 'left-top')
  })

  it('ignores a drop that carries something else', () => {
    const { onMove } = mount(HIDDEN)
    fireEvent.drop(zone('left-bottom') as HTMLElement, {
      dataTransfer: { types: ['text/plain'], getData: () => 'rm -rf' },
    })
    expect(onMove).not.toHaveBeenCalled()
  })
})
