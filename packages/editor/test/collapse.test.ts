import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ANIMATING_CLASS,
  ANIMATION_FALLBACK_MS,
  CollapseController,
  type GroupLike,
  type RootLike,
} from '../src/shell/dock/collapse'

function root(): RootLike & { classes: Set<string>; listeners: number } {
  const classes = new Set<string>()
  return {
    classes,
    listeners: 0,
    classList: {
      add: (token: string) => {
        classes.add(token)
      },
      remove: (token: string) => {
        classes.delete(token)
      },
    },
    addEventListener(_type: 'transitionend', listener: () => void) {
      this.listeners += 1
      this.listener = listener
    },
    removeEventListener(_type: 'transitionend', _listener: () => void) {
      this.listeners -= 1
    },
  } as RootLike & { classes: Set<string>; listeners: number; listener?: () => void }
}

function group(
  id: string,
  location: 'grid' | 'floating' = 'grid',
): GroupLike & { visibility: boolean[] } {
  const visibility: boolean[] = []
  return {
    id,
    visibility,
    api: {
      location: { type: location },
      setVisible: (value: boolean) => visibility.push(value),
    },
  }
}

function api(groups: (GroupLike & { visibility: boolean[] })[]) {
  return { groups, getGroup: (id: string) => groups.find((g) => g.id === id) }
}

describe('CollapseController', () => {
  it('hides a group to collapse it and shows it again to expand it', () => {
    const bottom = group('bottom')
    const changes: string[][] = []
    const controller = new CollapseController(api([bottom]), (ids) => changes.push(ids))
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(true)
    expect(controller.collapsedIds()).toEqual(['bottom'])
    expect(bottom.visibility).toEqual([false])
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(false)
    // dockview caches the hidden view's size and clamps it back on show, so nothing to restore.
    expect(bottom.visibility).toEqual([false, true])
    expect(changes).toEqual([['bottom'], []])
  })

  it('ignores a second collapse, an expand of a visible group and an unknown id', () => {
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {})
    controller.collapse('bottom')
    controller.collapse('bottom')
    controller.expand('bottom')
    controller.expand('bottom')
    controller.collapse('missing')
    expect(bottom.visibility).toEqual([false, true])
  })

  it('refuses floating and popped-out groups', () => {
    // dockview would hide a floating group's overlay and only warn for a popout window, but
    // spec §3.3 gives neither a chevron: collapse is a grid-group feature.
    const floating = group('f', 'floating')
    const controller = new CollapseController(api([floating]), () => {})
    controller.collapse('f')
    expect(controller.isCollapsed('f')).toBe(false)
    expect(floating.visibility).toEqual([])
  })

  it('restores a saved list and shows every other grid group', () => {
    // A layout serialized while a group was hidden comes back hidden (dockview writes
    // `visible: false` into its JSON), so restoring an empty list has to show it again.
    const bottom = group('bottom')
    const side = group('side')
    const floating = group('f', 'floating')
    const controller = new CollapseController(api([bottom, side, floating]), () => {})
    controller.restoreFrom(['bottom', 'missing'])
    expect(controller.collapsedIds()).toEqual(['bottom'])
    expect(bottom.visibility).toEqual([false])
    expect(side.visibility).toEqual([true])
    expect(floating.visibility).toEqual([])
    controller.restoreFrom([])
    expect(controller.collapsedIds()).toEqual([])
    expect(bottom.visibility).toEqual([false, true])
  })

  it('forgets its collapsed set when disposed', () => {
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {})
    controller.collapse('bottom')
    controller.dispose()
    expect(controller.collapsedIds()).toEqual([])
  })
})

describe('CollapseController animation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('marks the dock while a group hides and unmarks it when the transition times out', () => {
    const dock = root()
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, dock)
    controller.collapse('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(true)
    expect(dock.listeners).toBe(1)
    vi.advanceTimersByTime(ANIMATION_FALLBACK_MS)
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
  })

  it('unmarks the dock as soon as the grid reports a finished transition', () => {
    const dock = root() as ReturnType<typeof root> & { listener?: () => void }
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, dock)
    controller.expand('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    controller.collapse('bottom')
    dock.listener?.()
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
    // The fallback timer was cleared with it, so nothing fires later.
    controller.expand('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(true)
    vi.advanceTimersByTime(ANIMATION_FALLBACK_MS)
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
  })

  it('drops the mark and the timer when it is disposed mid-transition', () => {
    const dock = root()
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, dock)
    controller.collapse('bottom')
    controller.dispose()
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
  })
})
