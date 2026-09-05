import { describe, expect, it } from 'vitest'
import { isLegal, performShortcut, shortcutFor } from '../src/components/shortcuts'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const key = (k: string, shift = false) => ({
  key: k,
  shiftKey: shift,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
})

describe('shortcutFor', () => {
  it('maps the spec keys and nothing else', () => {
    expect(shortcutFor(key('F5'))).toBe('runOrContinue')
    expect(shortcutFor(key('F5', true))).toBe('stop')
    expect(shortcutFor(key('F6'))).toBe('pause')
    expect(shortcutFor(key('F10'))).toBe('stepOver')
    expect(shortcutFor(key('F11'))).toBe('stepInto')
    expect(shortcutFor(key('F11', true))).toBe('stepOut')
    expect(shortcutFor(key('F9'))).toBeNull()
    expect(shortcutFor({ ...key('F5'), ctrlKey: true })).toBeNull()
  })
})

describe('isLegal', () => {
  it('follows the store guards', () => {
    expect(isLegal('runOrContinue', 'ready', false)).toBe(true)
    expect(isLegal('runOrContinue', 'ready', true)).toBe(false)
    expect(isLegal('runOrContinue', 'paused', true)).toBe(true)
    expect(isLegal('runOrContinue', 'running', false)).toBe(false)
    expect(isLegal('stepInto', 'done', false)).toBe(true)
    expect(isLegal('stepInto', 'paused', false)).toBe(true)
    expect(isLegal('stepInto', 'input', false)).toBe(false)
    expect(isLegal('stepOver', 'paused', false)).toBe(true)
    expect(isLegal('stepOver', 'ready', false)).toBe(false)
    expect(isLegal('stepOut', 'paused', false)).toBe(true)
    expect(isLegal('pause', 'running', false)).toBe(true)
    expect(isLegal('pause', 'paused', false)).toBe(false)
    expect(isLegal('stop', 'ready', false)).toBe(false)
    expect(isLegal('stop', 'waiting', false)).toBe(true)
  })
})

describe('performShortcut', () => {
  it('calls the matching store action and reports whether it was legal', () => {
    const host = new FakeHost()
    const store = createEditorStore(host)
    expect(performShortcut(store, 'stepOver')).toBe(false)
    expect(performShortcut(store, 'runOrContinue')).toBe(true)
    expect(host.calls).toEqual(['start:run'])
    host.emit({ kind: 'state', state: 'paused' })
    expect(performShortcut(store, 'runOrContinue')).toBe(true)
    expect(performShortcut(store, 'stepInto')).toBe(true)
    expect(performShortcut(store, 'stepOver')).toBe(true)
    expect(performShortcut(store, 'stepOut')).toBe(true)
    expect(host.calls.slice(1)).toEqual(['continue', 'step', 'stepOver', 'stepOut'])
    host.emit({ kind: 'state', state: 'running' })
    expect(performShortcut(store, 'pause')).toBe(true)
    expect(performShortcut(store, 'stop')).toBe(true)
    expect(host.calls.slice(-2)).toEqual(['pause', 'stop'])
  })
})
