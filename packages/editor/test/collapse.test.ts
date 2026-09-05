import { describe, expect, it } from 'vitest'
import { CollapseController, type GroupLike } from '../src/shell/dock/collapse'

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
