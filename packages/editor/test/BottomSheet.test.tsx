// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BottomSheet, nextPosition } from '../src/shell/mobile/BottomSheet'

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
})
