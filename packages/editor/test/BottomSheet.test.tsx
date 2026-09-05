// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BottomSheet, nextPosition } from '../src/shell/mobile/BottomSheet'
import type { SheetPosition } from '../src/store/layout'
import { PANEL_ICONS } from '../src/ui/panelIcons'

describe('nextPosition', () => {
  it('cycles on tap and follows drag direction', () => {
    expect(nextPosition('collapsed', 'tap')).toBe('half')
    expect(nextPosition('half', 'tap')).toBe('full')
    expect(nextPosition('full', 'tap')).toBe('collapsed')
    expect(nextPosition('half', 'down')).toBe('collapsed')
    expect(nextPosition('half', 'up')).toBe('full')
    expect(nextPosition('collapsed', 'down')).toBe('collapsed')
  })
})

describe('BottomSheet', () => {
  it('renders tabs, switches pages and reports position changes', () => {
    const onPosition = vi.fn()
    const onActive = vi.fn()
    render(
      <BottomSheet
        position="half"
        onPosition={onPosition}
        tabs={[
          { id: 'console', label: 'Consola' },
          { id: 'problems', label: 'Problemas' },
        ]}
        active="console"
        onActive={onActive}
        actions={null}
        labels={{ collapse: 'Contraer', expand: 'Expandir', sheet: 'Paneles' }}
      >
        {(id) => <div>page {id}</div>}
      </BottomSheet>,
    )
    expect(screen.getByText('page console')).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: 'Problemas' }))
    expect(onActive).toHaveBeenCalledWith('problems')
    fireEvent.click(screen.getByRole('button', { name: 'Contraer' }))
    expect(onPosition).toHaveBeenCalledWith('collapsed')
    const handle = screen.getByRole('tablist').parentElement as HTMLElement
    fireEvent.pointerDown(handle, { clientY: 500, pointerId: 1 })
    fireEvent.pointerUp(handle, { clientY: 380, pointerId: 1 })
    expect(onPosition).toHaveBeenLastCalledWith('full')
  })

  it('draws the panel icon in front of the tab label', () => {
    render(
      <BottomSheet
        position="half"
        onPosition={vi.fn()}
        tabs={[
          { id: 'console', label: 'Consola', icon: PANEL_ICONS.console },
          { id: 'problems', label: 'Problemas', icon: PANEL_ICONS.problems },
        ]}
        active="console"
        onActive={vi.fn()}
        actions={null}
        labels={{ collapse: 'Contraer', expand: 'Expandir', sheet: 'Paneles' }}
      >
        {(id) => <div>page {id}</div>}
      </BottomSheet>,
    )
    for (const name of ['Consola', 'Problemas']) {
      expect(screen.getByRole('tab', { name }).querySelector('svg'), name).not.toBeNull()
    }
  })

  it('cycles the position when the handle is tapped', () => {
    const onPosition = vi.fn()
    const sheet = (position: SheetPosition) => (
      <BottomSheet
        position={position}
        onPosition={onPosition}
        tabs={[{ id: 'console', label: 'Consola' }]}
        active="console"
        onActive={vi.fn()}
        actions={null}
        labels={{ collapse: 'Contraer', expand: 'Expandir', sheet: 'Paneles' }}
      >
        {(id) => <div>page {id}</div>}
      </BottomSheet>
    )
    const tap = (): void => {
      const handle = screen.getByRole('tablist').parentElement as HTMLElement
      fireEvent.pointerDown(handle, { clientY: 300, pointerId: 1 })
      fireEvent.pointerUp(handle, { clientY: 302, pointerId: 1 })
    }
    const { rerender } = render(sheet('collapsed'))
    tap()
    expect(onPosition).toHaveBeenLastCalledWith('half')
    rerender(sheet('half'))
    tap()
    expect(onPosition).toHaveBeenLastCalledWith('full')
    rerender(sheet('full'))
    tap()
    expect(onPosition).toHaveBeenLastCalledWith('collapsed')
  })

  it('leaves a tap on a tab or the collapse button to that control', () => {
    const onPosition = vi.fn()
    const onActive = vi.fn()
    render(
      <BottomSheet
        position="half"
        onPosition={onPosition}
        tabs={[{ id: 'console', label: 'Consola' }]}
        active="console"
        onActive={onActive}
        actions={null}
        labels={{ collapse: 'Contraer', expand: 'Expandir', sheet: 'Paneles' }}
      >
        {(id) => <div>page {id}</div>}
      </BottomSheet>,
    )
    const tab = screen.getByRole('tab', { name: 'Consola' })
    fireEvent.pointerDown(tab, { clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(tab, { clientY: 300, pointerId: 1 })
    expect(onPosition).not.toHaveBeenCalled()
  })
})
