import { describe, expect, it } from 'vitest'
import { SHORTCUTS, shortcutFor } from '../src/shell/shortcuts'

const key = (
  k: string,
  mods: Partial<{
    ctrl: boolean
    shift: boolean
    meta: boolean
    alt: boolean
    inEditor: boolean
  }> = {},
) => ({
  key: k,
  ctrlKey: mods.ctrl ?? false,
  shiftKey: mods.shift ?? false,
  metaKey: mods.meta ?? false,
  altKey: mods.alt ?? false,
  inEditor: mods.inEditor ?? false,
})

describe('shortcutFor (shell)', () => {
  it('keeps the 4a keys', () => {
    expect(shortcutFor(key('F5'))).toBe('runOrContinue')
    expect(shortcutFor(key('F5', { shift: true }))).toBe('stop')
    expect(shortcutFor(key('F11', { shift: true }))).toBe('stepOut')
  })

  it('adds the file and settings keys with Ctrl or ⌘', () => {
    expect(shortcutFor(key('o', { ctrl: true }))).toBe('open')
    expect(shortcutFor(key('s', { meta: true }))).toBe('save')
    expect(shortcutFor(key('S', { ctrl: true, shift: true }))).toBe('saveAs')
    expect(shortcutFor(key(',', { ctrl: true }))).toBe('settings')
    expect(shortcutFor(key('n', { ctrl: true }))).toBeNull()
    expect(shortcutFor(key('n', { ctrl: true, inEditor: true }))).toBe('new')
    expect(shortcutFor(key('s', { ctrl: true, alt: true }))).toBeNull()
  })

  it('labels every action', () => {
    expect(SHORTCUTS.save).toBe('Ctrl+S')
    expect(SHORTCUTS.saveAs).toBe('Ctrl+Shift+S')
    expect(SHORTCUTS.settings).toBe('Ctrl+,')
    expect(SHORTCUTS.runOrContinue).toBe('F5')
  })
})
