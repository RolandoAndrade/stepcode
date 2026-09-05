import { describe, expect, it } from 'vitest'
import {
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
  it('names the strip a group belongs to from where it sits around the editor', () => {
    expect(zoneFor(EDITOR, rect(960, 40, 300, 500))).toBe('right')
    expect(zoneFor(EDITOR, rect(40, 0, 900, 40))).toBe('left-top')
    expect(zoneFor(EDITOR, rect(40, 540, 900, 200))).toBe('left-bottom')
    // A group to the left of the editor joins the bottom cluster: there is no left-left strip.
    expect(zoneFor(EDITOR, rect(0, 40, 40, 500))).toBe('left-bottom')
  })

  it('falls back to the bottom cluster while nothing is measured', () => {
    // happy-dom reports zeros, and so does a group dockview has not laid out yet.
    const zero = rect(0, 0, 0, 0)
    expect(zoneFor(zero, zero)).toBe('left-bottom')
    expect(zoneFor(EDITOR, zero)).toBe('left-bottom')
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
    expect(states.console.zone).toBe('right')
    expect(states.problems.zone).toBe('left-top')
    expect(states.variables.zone).toBe('left-bottom')
  })
})
