import { describe, expect, it } from 'vitest'
import { resolveInitialPreference, watchSystemTheme } from '../src/theme/theme'

function fakeMatchMedia(initial: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  const list = {
    matches: initial,
    addEventListener: (_: 'change', fn: (e: { matches: boolean }) => void) => listeners.add(fn),
    removeEventListener: (_: 'change', fn: (e: { matches: boolean }) => void) =>
      listeners.delete(fn),
  }
  return {
    matchMedia: () => list,
    fire: (matches: boolean) => {
      for (const fn of listeners) fn({ matches })
    },
    listeners,
  }
}

describe('watchSystemTheme', () => {
  it('reports the current value and every change until stopped', () => {
    const media = fakeMatchMedia(true)
    const seen: boolean[] = []
    const stop = watchSystemTheme((dark) => seen.push(dark), media.matchMedia)
    media.fire(false)
    stop()
    media.fire(true)
    expect(seen).toEqual([true, false])
    expect(media.listeners.size).toBe(0)
  })

  it('does nothing without matchMedia', () => {
    const seen: boolean[] = []
    watchSystemTheme((dark) => seen.push(dark), undefined)()
    expect(seen).toEqual([false])
  })
})

describe('resolveInitialPreference', () => {
  it('keeps a stored preference and defaults to system', () => {
    expect(resolveInitialPreference('dark')).toBe('dark')
    expect(resolveInitialPreference(undefined)).toBe('system')
  })
})
