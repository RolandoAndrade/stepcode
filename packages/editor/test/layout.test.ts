import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT, PANEL_IDS } from '../src/store/layout'

describe('layout state', () => {
  it('starts with no dockview JSON, nothing collapsed and the sheet collapsed', () => {
    expect(DEFAULT_LAYOUT).toEqual({ dockview: null, collapsed: [], sheet: 'collapsed' })
    expect(PANEL_IDS).toEqual(['editor', 'console', 'problems', 'variables'])
  })
})
