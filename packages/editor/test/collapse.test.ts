import { describe, expect, it } from 'vitest'
import {
  COLLAPSED_VERTICAL_CLASS,
  CollapseController,
  collapseGroup,
  DEFAULT_GROUP_MIN,
  edgeOf,
  expandGroup,
  type GroupLike,
} from '../src/shell/dock/collapse'

function group(
  id: string,
  box: { x: number; y: number; width: number; height: number },
  location: 'grid' | 'floating' = 'grid',
): GroupLike & { constraints: unknown[]; sizes: unknown[]; classes: Set<string> } {
  const constraints: unknown[] = []
  const sizes: unknown[] = []
  const classes = new Set<string>()
  return {
    classes,
    id,
    constraints,
    sizes,
    api: {
      width: box.width,
      height: box.height,
      location: { type: location },
      setConstraints: (c) => constraints.push(c),
      setSize: (s) => sizes.push(s),
    },
    element: {
      classList: {
        add: (token: string) => {
          classes.add(token)
        },
        remove: (token: string) => {
          classes.delete(token)
        },
      },
      getBoundingClientRect: () => ({
        ...box,
        top: box.y,
        left: box.x,
        right: box.x + box.width,
        bottom: box.y + box.height,
      }),
    },
  }
}

const CONTAINER = { top: 0, left: 0, width: 1000, height: 600 }

describe('edgeOf', () => {
  it('names the edge a docked group sits on', () => {
    expect(edgeOf(group('a', { x: 0, y: 420, width: 1000, height: 180 }), CONTAINER)).toBe('bottom')
    expect(edgeOf(group('b', { x: 0, y: 0, width: 1000, height: 180 }), CONTAINER)).toBe('top')
    expect(edgeOf(group('c', { x: 700, y: 0, width: 300, height: 600 }), CONTAINER)).toBe('right')
    expect(edgeOf(group('d', { x: 0, y: 0, width: 300, height: 600 }), CONTAINER)).toBe('left')
  })

  it('measures the group against the container, not the viewport', () => {
    // The dock sits below the 40 px toolbar, so no group's viewport rect starts at y = 0.
    const offset = { top: 40, left: 12, width: 1000, height: 600 }
    expect(edgeOf(group('a', { x: 12, y: 40, width: 1000, height: 180 }), offset)).toBe('top')
    expect(edgeOf(group('b', { x: 12, y: 460, width: 1000, height: 180 }), offset)).toBe('bottom')
    expect(edgeOf(group('c', { x: 12, y: 40, width: 300, height: 600 }), offset)).toBe('left')
    expect(edgeOf(group('d', { x: 712, y: 40, width: 300, height: 600 }), offset)).toBe('right')
  })
})

describe('collapseGroup / expandGroup', () => {
  it('constrains the cross-axis size to the header and restores it', () => {
    const g = group('a', { x: 0, y: 420, width: 1000, height: 180 })
    const { restore } = collapseGroup(g, 'bottom', 28)
    expect(restore).toBe(180)
    // Both ends of the range: dockview clamps to the minimum when the minimum wins, so a
    // maximum alone leaves the group at its 120 px floor instead of the 28 px header.
    expect(g.constraints).toEqual([{ minimumHeight: 28, maximumHeight: 28 }])
    expect(g.sizes).toEqual([{ height: 28 }])
    expandGroup(g, 'bottom', restore, 120)
    expect(g.constraints.at(-1)).toEqual({
      minimumHeight: 120,
      maximumHeight: Number.POSITIVE_INFINITY,
    })
    expect(g.sizes.at(-1)).toEqual({ height: 180 })
    expect(g.classes.has(COLLAPSED_VERTICAL_CLASS)).toBe(false)
    const side = group('b', { x: 700, y: 0, width: 300, height: 600 })
    collapseGroup(side, 'right', 28)
    expect(side.constraints).toEqual([{ minimumWidth: 28, maximumWidth: 28 }])
    expandGroup(side, 'right', 300, 100)
    expect(side.constraints.at(-1)).toEqual({
      minimumWidth: 100,
      maximumWidth: Number.POSITIVE_INFINITY,
    })
  })

  it('marks a side group as a vertical strip and unmarks it on expand', () => {
    const side = group('b', { x: 700, y: 0, width: 300, height: 600 })
    collapseGroup(side, 'right', 28)
    expect(side.classes.has(COLLAPSED_VERTICAL_CLASS)).toBe(true)
    expandGroup(side, 'right', 300, 100)
    expect(side.classes.has(COLLAPSED_VERTICAL_CLASS)).toBe(false)
  })
})

describe('CollapseController', () => {
  function api(groups: GroupLike[]) {
    return {
      groups,
      getGroup: (id: string) => groups.find((g) => g.id === id),
      width: CONTAINER.width,
      height: CONTAINER.height,
    }
  }

  it('toggles, reports ids and restores from a saved list', () => {
    const bottom = group('bottom', { x: 0, y: 420, width: 1000, height: 180 })
    const changes: string[][] = []
    const controller = new CollapseController(api([bottom]), 28, (ids) => changes.push(ids))
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(true)
    expect(controller.collapsedIds()).toEqual(['bottom'])
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(false)
    expect(changes).toEqual([['bottom'], []])
    controller.restoreFrom(['bottom', 'missing'])
    expect(controller.collapsedIds()).toEqual(['bottom'])
    expect(bottom.sizes.at(-1)).toEqual({ height: 28 })
  })

  it('marks a left or right collapse through the controller too', () => {
    const side = group('side', { x: 700, y: 0, width: 300, height: 600 })
    const controller = new CollapseController(api([side]), 28, () => {})
    controller.toggle('side')
    expect(side.classes.has(COLLAPSED_VERTICAL_CLASS)).toBe(true)
    controller.toggle('side')
    expect(side.classes.has(COLLAPSED_VERTICAL_CLASS)).toBe(false)
  })

  it('gives the minimum back when it expands a group', () => {
    const bottom = group('bottom', { x: 0, y: 420, width: 1000, height: 180 })
    const controller = new CollapseController(api([bottom]), 28, () => {}, 120)
    controller.collapse('bottom')
    expect(bottom.constraints.at(-1)).toEqual({ minimumHeight: 28, maximumHeight: 28 })
    controller.expand('bottom')
    expect(bottom.constraints.at(-1)).toEqual({
      minimumHeight: 120,
      maximumHeight: Number.POSITIVE_INFINITY,
    })
  })

  it('frees the groups a restored layout does not list as collapsed', () => {
    // A layout saved while the bottom group was collapsed carries its 28 px constraints;
    // restoring it with an empty collapsed list must not leave the group frozen there.
    const bottom = group('bottom', { x: 0, y: 572, width: 1000, height: 28 })
    const controller = new CollapseController(api([bottom]), 28, () => {}, 120)
    controller.restoreFrom([])
    expect(controller.collapsedIds()).toEqual([])
    expect(bottom.constraints.at(-1)).toEqual({
      minimumHeight: 120,
      minimumWidth: DEFAULT_GROUP_MIN,
      maximumHeight: Number.POSITIVE_INFINITY,
      maximumWidth: Number.POSITIVE_INFINITY,
    })
  })

  it('refuses floating groups and expands idempotently', () => {
    const floating = group('f', { x: 10, y: 10, width: 300, height: 200 }, 'floating')
    const controller = new CollapseController(api([floating]), 28, () => {})
    controller.collapse('f')
    expect(controller.isCollapsed('f')).toBe(false)
    controller.expand('f')
    expect(floating.constraints).toEqual([])
  })

  it('remembers the restore size at collapse time, defaulting to 30 % when unknown', () => {
    const tiny = group('t', { x: 0, y: 572, width: 1000, height: 28 })
    const controller = new CollapseController(api([tiny]), 28, () => {})
    controller.collapse('t')
    controller.expand('t')
    expect(tiny.sizes.at(-1)).toEqual({ height: 180 })
  })
})
