import { describe, expect, it } from 'vitest'
import {
  dropPlanFor,
  editorZoneFor,
  HIDDEN_PANEL_STATES,
  panelStatesOf,
  sidebarActionFor,
  zoneFor,
} from '../src/shell/dock/panelStates'

const rect = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
  width,
  height,
})

const EDITOR = rect(40, 40, 900, 500)

function api(
  groups: Record<string, { group: string; active: string; box?: ReturnType<typeof rect> }>,
) {
  return {
    getPanel: (id: string) => {
      const entry = groups[id]
      if (entry === undefined) return undefined
      return {
        group: {
          id: entry.group,
          activePanel: { id: entry.active },
          api: { location: { type: 'grid' as const } },
          element: { getBoundingClientRect: () => entry.box ?? EDITOR },
        },
      }
    },
  }
}

describe('panelStatesOf', () => {
  it('reads visibility from the collapsed groups and activity from each group itself', () => {
    const states = panelStatesOf(
      api({
        editor: { group: 'top', active: 'editor' },
        console: { group: 'bottom', active: 'problems' },
        problems: { group: 'bottom', active: 'problems' },
        variables: { group: 'bottom', active: 'problems' },
      }),
      (id) => id === 'bottom',
    )
    expect(states.editor).toMatchObject({ visible: true, active: true })
    expect(states.console).toMatchObject({ visible: false, active: false })
    expect(states.problems).toMatchObject({ visible: false, active: true })
    const shown = panelStatesOf(
      api({
        editor: { group: 'top', active: 'editor' },
        console: { group: 'bottom', active: 'problems' },
        problems: { group: 'bottom', active: 'problems' },
        variables: { group: 'bottom', active: 'problems' },
      }),
      () => false,
    )
    expect(shown.problems).toMatchObject({ visible: true, active: true })
    expect(shown.variables).toMatchObject({ visible: true, active: false })
  })

  it('reads a panel the layout does not hold as hidden', () => {
    expect(panelStatesOf(api({}), () => false)).toEqual(HIDDEN_PANEL_STATES)
  })
})

describe('sidebarActionFor', () => {
  const grid = (active: string) => ({
    api: { location: { type: 'grid' as const } },
    activePanel: { id: active },
  })

  it('shows a hidden group, hides one whose panel is already in front, activates otherwise', () => {
    expect(sidebarActionFor(grid('console'), 'console', true)).toBe('expand')
    expect(sidebarActionFor(grid('console'), 'console', false)).toBe('collapse')
    expect(sidebarActionFor(grid('problems'), 'console', false)).toBe('activate')
  })

  it('never collapses a floating or popped-out group', () => {
    // Spec §3.3 gives them no chevron, and `collapse()` refuses them: the click would be a
    // no-op that still marked the group manually collapsed for auto-expand.
    for (const type of ['floating', 'popout'] as const) {
      const group = { api: { location: { type } }, activePanel: { id: 'console' } }
      expect(sidebarActionFor(group, 'console', false)).toBe('activate')
    }
  })
})

describe('zoneFor', () => {
  // The layout the user built: editor top-left, Variables under it, Consola and Problemas
  // stacked in a column on the right.
  const DOCK = rect(0, 40, 1280, 736)
  const EDITOR_2X2 = rect(0, 40, 640, 500)
  const VARIABLES = rect(0, 540, 640, 236)
  const CONSOLA = rect(640, 40, 640, 360)
  const PROBLEMAS = rect(640, 400, 640, 376)

  it('names the strip and the half each group belongs to', () => {
    expect(zoneFor(EDITOR_2X2, CONSOLA, DOCK)).toBe('right-top')
    expect(zoneFor(EDITOR_2X2, PROBLEMAS, DOCK)).toBe('right-bottom')
    expect(zoneFor(EDITOR_2X2, VARIABLES, DOCK)).toBe('left-bottom')
    expect(editorZoneFor(DOCK, EDITOR_2X2)).toBe('left-top')
  })

  it('puts a group above the editor in the left top cluster', () => {
    expect(zoneFor(EDITOR, rect(40, 0, 900, 40), DOCK)).toBe('left-top')
    expect(zoneFor(EDITOR, rect(40, 540, 900, 200), DOCK)).toBe('left-bottom')
  })

  it('splits a group docked to the left of the editor by its own half of the dock', () => {
    // There is no left-left strip: a group beside the editor on either side takes a left cluster
    // unless it is on the right, and its half comes from its centre against the dock's.
    expect(zoneFor(rect(340, 40, 900, 700), rect(0, 40, 300, 300), DOCK)).toBe('left-top')
    expect(zoneFor(rect(340, 40, 900, 700), rect(0, 500, 300, 276), DOCK)).toBe('left-bottom')
  })

  it('keeps the zone it is given while nothing is measured', () => {
    // happy-dom reports zeros, so does a group dockview has not laid out yet — and so does a
    // collapsed group, which is a zero-height box parked at the top of the grid.
    const zero = rect(0, 0, 0, 0)
    const collapsed = rect(40, 40, 900, 0)
    expect(zoneFor(zero, zero, DOCK)).toBe('left-bottom')
    expect(zoneFor(EDITOR, zero, DOCK)).toBe('left-bottom')
    expect(zoneFor(EDITOR, collapsed, DOCK)).toBe('left-bottom')
    expect(zoneFor(EDITOR, collapsed, DOCK, 'right-top')).toBe('right-top')
    expect(zoneFor(EDITOR, zero, DOCK, 'left-top')).toBe('left-top')
  })
})

describe('editorZoneFor', () => {
  const dock = rect(0, 40, 1280, 736)

  it('puts the editor on the side of the dock it is docked on', () => {
    expect(editorZoneFor(dock, rect(0, 40, 900, 736))).toBe('left-top')
    expect(editorZoneFor(dock, rect(700, 40, 580, 736))).toBe('right-top')
    // Nothing measured yet: keep whatever it had.
    expect(editorZoneFor(dock, rect(0, 0, 0, 0), 'right-bottom')).toBe('right-bottom')
  })
})

describe('panelStatesOf zones', () => {
  it('gives every panel the zone of its own group', () => {
    const states = panelStatesOf(
      api({
        editor: { group: 'main', active: 'editor', box: EDITOR },
        console: { group: 'side', active: 'console', box: rect(960, 40, 300, 500) },
        problems: { group: 'top', active: 'problems', box: rect(40, 0, 900, 40) },
        variables: { group: 'bottom', active: 'variables', box: rect(40, 540, 900, 200) },
      }),
      () => false,
    )
    expect(states.console.zone).toBe('right-top')
    expect(states.problems.zone).toBe('left-top')
    expect(states.variables.zone).toBe('left-bottom')
  })

  it('places the editor against the dock, not against itself', () => {
    const dock = rect(0, 40, 1280, 736)
    const right = panelStatesOf(
      api({ editor: { group: 'main', active: 'editor', box: rect(700, 40, 580, 736) } }),
      () => false,
      undefined,
      dock,
    )
    expect(right.editor.zone).toBe('right-top')
    const left = panelStatesOf(
      api({ editor: { group: 'main', active: 'editor', box: rect(0, 40, 900, 736) } }),
      () => false,
      undefined,
      dock,
    )
    expect(left.editor.zone).toBe('left-top')
  })

  it('keeps a panel on its own strip while its group is hidden', () => {
    // A collapsed group has no box, so the icon has to stay where the user last saw it.
    const docked = api({
      editor: { group: 'main', active: 'editor', box: EDITOR },
      console: { group: 'side', active: 'console', box: rect(960, 40, 300, 500) },
      problems: { group: 'side', active: 'console', box: rect(960, 40, 300, 500) },
      variables: { group: 'side', active: 'console', box: rect(960, 40, 300, 500) },
    })
    const shown = panelStatesOf(docked, () => false)
    const hidden = api({
      editor: { group: 'main', active: 'editor', box: EDITOR },
      console: { group: 'side', active: 'console', box: rect(960, 40, 300, 0) },
      problems: { group: 'side', active: 'console', box: rect(960, 40, 300, 0) },
      variables: { group: 'side', active: 'console', box: rect(960, 40, 300, 0) },
    })
    expect(panelStatesOf(hidden, () => true, shown).console).toEqual({
      visible: false,
      active: true,
      zone: 'right-top',
    })
  })
})

describe('dropPlanFor', () => {
  const beside = [
    { id: 'top-right', top: 40 },
    { id: 'bottom-right', top: 400 },
  ]

  it('docks the left clusters against the edges of the grid', () => {
    expect(dropPlanFor('left-top', beside)).toEqual({ position: 'top' })
    expect(dropPlanFor('left-bottom', beside)).toEqual({ position: 'bottom' })
  })

  it('splits the column already on the right, or opens one when there is none', () => {
    expect(dropPlanFor('right-top', beside)).toEqual({ position: 'top', groupId: 'top-right' })
    expect(dropPlanFor('right-bottom', beside)).toEqual({
      position: 'bottom',
      groupId: 'bottom-right',
    })
    expect(dropPlanFor('right-top', [])).toEqual({ position: 'right' })
    expect(dropPlanFor('right-bottom', [])).toEqual({ position: 'right' })
  })
})
