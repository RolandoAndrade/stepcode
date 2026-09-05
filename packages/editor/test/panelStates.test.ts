import { describe, expect, it } from 'vitest'
import { HIDDEN_PANEL_STATES, panelStatesOf } from '../src/shell/dock/panelStates'

function api(groups: Record<string, { group: string; active: string }>) {
  return {
    getPanel: (id: string) => {
      const entry = groups[id]
      if (entry === undefined) return undefined
      return { group: { id: entry.group, activePanel: { id: entry.active } } }
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
    expect(states.editor).toEqual({ visible: true, active: true })
    expect(states.console).toEqual({ visible: false, active: false })
    expect(states.problems).toEqual({ visible: false, active: true })
    const shown = panelStatesOf(
      api({
        editor: { group: 'top', active: 'editor' },
        console: { group: 'bottom', active: 'problems' },
        problems: { group: 'bottom', active: 'problems' },
        variables: { group: 'bottom', active: 'problems' },
      }),
      () => false,
    )
    expect(shown.problems).toEqual({ visible: true, active: true })
    expect(shown.variables).toEqual({ visible: true, active: false })
  })

  it('reads a panel the layout does not hold as hidden', () => {
    expect(panelStatesOf(api({}), () => false)).toEqual(HIDDEN_PANEL_STATES)
  })
})
