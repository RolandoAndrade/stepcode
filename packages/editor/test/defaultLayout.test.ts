import { describe, expect, it } from 'vitest'
import {
  applyDefaultLayout,
  DEFAULT_BOTTOM_FRACTION,
  DEFAULT_BOTTOM_MIN,
  PANEL_TITLES,
} from '../src/shell/dock/defaultLayout'
import { stringsFor } from '../src/strings'

const TITLES = PANEL_TITLES(stringsFor('es'))

describe('applyDefaultLayout', () => {
  it('adds the editor alone and the three panels in one group below, locked editor', () => {
    const calls: unknown[] = []
    const relayouts: string[] = []
    const groups: {
      id: string
      locked: unknown
      header: { hidden: boolean }
      api: { setConstraints: (c: unknown) => void; setSize: (s: unknown) => void }
    }[] = []
    const api = {
      height: 600,
      addPanel: (options: { id: string; position?: unknown }) => {
        calls.push(options)
        const id = `g-${groups.length}`
        const group = {
          id,
          locked: false,
          header: { hidden: false },
          relayout: () => {
            relayouts.push(id)
          },
          api: {
            setConstraints: (c: unknown) => calls.push(c),
            setSize: (s: unknown) => calls.push(s),
          },
        }
        groups.push(group)
        return {
          id: options.id,
          group,
          api: { setActive: () => calls.push(`active:${options.id}`) },
        }
      },
    }
    const { bottomGroupId } = applyDefaultLayout(api as never, TITLES)
    expect(calls[0]).toEqual({
      id: 'editor',
      component: 'editor',
      tabComponent: 'tab',
      title: 'Editor',
    })
    expect(calls[1]).toMatchObject({
      id: 'console',
      title: 'Consola',
      position: { referencePanel: 'editor', direction: 'below' },
    })
    expect(calls[2]).toMatchObject({
      id: 'problems',
      title: 'Problemas',
      position: { referencePanel: 'console', direction: 'within' },
    })
    expect(calls[3]).toMatchObject({
      id: 'variables',
      title: 'Variables',
      position: { referencePanel: 'console', direction: 'within' },
    })
    expect(groups[0]?.locked).toBe(true)
    // Spec §3.1: the editor group shows no tab strip at all.
    expect(groups[0]?.header.hidden).toBe(true)
    expect(groups[1]?.header.hidden).toBe(false)
    // Hiding the header only sets `display: none`; the group has to be relaid out to use the space.
    expect(relayouts).toEqual(['g-0'])
    expect(bottomGroupId).toBe('g-1')
    expect(calls).toContainEqual({ minimumHeight: DEFAULT_BOTTOM_MIN })
    expect(calls).toContainEqual({ height: 600 * DEFAULT_BOTTOM_FRACTION })
    expect(calls.at(-1)).toBe('active:console')
  })
})

describe('PANEL_TITLES', () => {
  it('titles every panel with the name the tab shows, in the active locale', () => {
    expect(TITLES).toEqual({
      editor: 'Editor',
      console: 'Consola',
      problems: 'Problemas',
      variables: 'Variables',
    })
    expect(PANEL_TITLES(stringsFor('en')).console).toBe('Console')
  })
})
