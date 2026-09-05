import { describe, expect, it } from 'vitest'
import {
  applyDefaultLayout,
  DEFAULT_BOTTOM_FRACTION,
  DEFAULT_BOTTOM_MIN,
} from '../src/shell/dock/defaultLayout'

describe('applyDefaultLayout', () => {
  it('adds the editor alone and the three panels in one group below, locked editor', () => {
    const calls: unknown[] = []
    const groups: {
      id: string
      locked: unknown
      api: { setConstraints: (c: unknown) => void; setSize: (s: unknown) => void }
    }[] = []
    const api = {
      height: 600,
      addPanel: (options: { id: string; position?: unknown }) => {
        calls.push(options)
        const group = {
          id: `g-${groups.length}`,
          locked: false,
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
    const { bottomGroupId } = applyDefaultLayout(api as never)
    expect(calls[0]).toEqual({ id: 'editor', component: 'editor', tabComponent: 'tab' })
    expect(calls[1]).toMatchObject({
      id: 'console',
      position: { referencePanel: 'editor', direction: 'below' },
    })
    expect(calls[2]).toMatchObject({
      id: 'problems',
      position: { referencePanel: 'console', direction: 'within' },
    })
    expect(calls[3]).toMatchObject({
      id: 'variables',
      position: { referencePanel: 'console', direction: 'within' },
    })
    expect(groups[0]?.locked).toBe(true)
    expect(bottomGroupId).toBe('g-1')
    expect(calls).toContainEqual({ minimumHeight: DEFAULT_BOTTOM_MIN })
    expect(calls).toContainEqual({ height: 600 * DEFAULT_BOTTOM_FRACTION })
    expect(calls.at(-1)).toBe('active:console')
  })
})
