// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ANIMATING_CLASS,
  ANIMATION_FALLBACK_MS,
  CollapseController,
  type GroupLike,
  type RootLike,
} from '../src/shell/dock/collapse'

type Listener = (event: { target: unknown }) => void
type FakeRoot = RootLike & { classes: Set<string>; listeners: number; listener?: Listener }

/** A `transitionend` from a grid slot; anything else must not end the animation. */
const VIEW_EVENT = { target: { classList: { contains: (token: string) => token === 'dv-view' } } }
const TAB_EVENT = { target: { classList: { contains: () => false } } }

function root(): FakeRoot {
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
    addEventListener(_type: 'transitionend', listener: Listener) {
      this.listeners += 1
      this.listener = listener
    },
    removeEventListener(_type: 'transitionend', _listener: Listener) {
      this.listeners -= 1
    },
  } as FakeRoot
}

function group(
  id: string,
  location: 'grid' | 'floating' = 'grid',
): GroupLike & { visibility: boolean[]; element: { inert: boolean } } {
  const visibility: boolean[] = []
  return {
    id,
    visibility,
    element: { inert: false },
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
    // A hidden group is a zero-sized box, so its tabs and buttons have to be taken out of reach.
    expect(bottom.element.inert).toBe(true)
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(false)
    expect(bottom.element.inert).toBe(false)
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

  it('drops a persisted id that names no grid group', () => {
    // `layout.collapsed` is plain strings: a stale blob must not hide a floating group.
    const floating = group('f', 'floating')
    const controller = new CollapseController(api([floating]), () => {})
    controller.restoreFrom(['f', 'missing'])
    expect(controller.collapsedIds()).toEqual([])
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
    expect(bottom.element.inert).toBe(true)
    expect(side.visibility).toEqual([true])
    expect(side.element.inert).toBe(false)
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
    const controller = new CollapseController(api([bottom]), () => {}, {
      root: dock,
      relayout: () => {},
    })
    controller.collapse('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(true)
    expect(dock.listeners).toBe(1)
    vi.advanceTimersByTime(ANIMATION_FALLBACK_MS)
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
  })

  it('unmarks the dock as soon as the grid reports a finished transition', () => {
    const dock = root()
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, {
      root: dock,
      relayout: () => {},
    })
    controller.expand('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    controller.collapse('bottom')
    // A tab's own colour transition bubbles to the root too; only a grid slot ends the slide.
    dock.listener?.(TAB_EVENT)
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(true)
    dock.listener?.(VIEW_EVENT)
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
    // The fallback timer was cleared with it, so nothing fires later.
    controller.expand('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(true)
    vi.advanceTimersByTime(ANIMATION_FALLBACK_MS)
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
  })

  it('leaves the dock alone while it builds or restores a layout', () => {
    // Mount and reset arrive at their geometry in one pass; only a user's collapse slides.
    const dock = root()
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, {
      root: dock,
      relayout: () => {},
    })
    controller.restoreFrom(['bottom'])
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
    controller.withoutAnimation(() => controller.expand('bottom'))
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    // The mute lasts exactly as long as the call.
    controller.collapse('bottom')
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(true)
  })

  it('makes dockview re-measure on every frame and once more at the end', () => {
    // `defaultRenderer="always"` positions each panel's overlay from its group's rect, read a
    // frame after the size event: mid-slide that rect is the old one, so the panels only follow
    // the animation if the dock is relaid out per frame — and the last pass has to run with the
    // mark already gone, when the geometry is final.
    const dock = root()
    const marked: boolean[] = []
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, {
      root: dock,
      relayout: () => marked.push(dock.classes.has(ANIMATING_CLASS)),
    })
    controller.collapse('bottom')
    vi.advanceTimersByTime(ANIMATION_FALLBACK_MS)
    expect(marked.length).toBeGreaterThan(1)
    expect(marked.slice(0, -1).every(Boolean)).toBe(true)
    expect(marked.at(-1)).toBe(false)
  })

  it('drops the mark and the timer when it is disposed mid-transition', () => {
    const dock = root()
    const bottom = group('bottom')
    const controller = new CollapseController(api([bottom]), () => {}, {
      root: dock,
      relayout: () => {},
    })
    controller.collapse('bottom')
    controller.dispose()
    expect(dock.classes.has(ANIMATING_CLASS)).toBe(false)
    expect(dock.listeners).toBe(0)
  })
})
