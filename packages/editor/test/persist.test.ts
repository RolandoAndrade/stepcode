import 'fake-indexeddb/auto'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_LAYOUT } from '../src/store/layout'
import {
  applyDocument,
  applyPersisted,
  documentOf,
  migrate,
  openDocumentStore,
  persistedOf,
  readDocument,
  readPersisted,
  STORAGE_KEY,
  startDocumentPersisting,
  startPersisting,
  writeDocument,
  writePersisted,
} from '../src/store/persist'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

class MemoryStorage {
  readonly map = new Map<string, string>()
  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
}

describe('migrate', () => {
  const steps = [
    (previous: Record<string, unknown>) => ({ ...previous, version: 1, one: true }),
    (previous: Record<string, unknown>) => ({ ...previous, version: 2, two: true }),
  ]

  it('runs `migrations[n]` to go from version n to n + 1', () => {
    expect(migrate({ version: 0 }, steps, 2)).toEqual({ version: 2, one: true, two: true })
    expect(migrate({ version: 1 }, steps, 2)).toEqual({ version: 2, two: true })
    expect(migrate({ version: 2 }, steps, 2)).toEqual({ version: 2 })
  })

  it('refuses a version no step can upgrade', () => {
    expect(migrate({ version: 0 }, [], 1)).toBeNull()
    expect(migrate({ version: 'x' }, steps, 2)).toBeNull()
  })
})

describe('localStorage persistence', () => {
  it('round-trips settings, profile, custom profiles and layout', () => {
    const store = createEditorStore(new FakeHost())
    store.getState().saveCustomProfile({ id: 'mio', extends: 'es' })
    store.getState().setProfile('mio')
    store.getState().updateSettings('editor', { fontSize: 18 })
    store.getState().setDockLayout({ grid: { root: {} } }, ['g1'])
    store.getState().setSheet('half')
    const storage = new MemoryStorage()
    writePersisted(storage, persistedOf(store.getState()))
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as { version: number }
    expect(parsed.version).toBe(1)

    const again = createEditorStore(new FakeHost())
    const loaded = readPersisted(storage)
    expect(loaded).not.toBeNull()
    if (loaded !== null) applyPersisted(again, loaded)
    const s = again.getState()
    expect(s.profileId).toBe('mio')
    expect(s.customProfiles).toEqual([{ id: 'mio', extends: 'es' }])
    expect(s.settings.editor.fontSize).toBe(18)
    expect(s.layout).toEqual({ dockview: { grid: { root: {} } }, collapsed: ['g1'], sheet: 'half' })
    expect(s.themePreference).toBe('system')
  })

  it('falls back to null on garbage, wrong version or invalid shape, warning once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = new MemoryStorage()
    expect(readPersisted(storage)).toBeNull()
    storage.setItem(STORAGE_KEY, '{not json')
    expect(readPersisted(storage)).toBeNull()
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }))
    expect(readPersisted(storage)).toBeNull()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, settings: { profileId: 3 }, layout: DEFAULT_LAYOUT }),
    )
    expect(readPersisted(storage)).toBeNull()
    expect(warn).toHaveBeenCalledTimes(3)
    warn.mockRestore()
  })

  it('never throws when storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(readPersisted(broken)).toBeNull()
    expect(() =>
      writePersisted(broken, persistedOf(createEditorStore(new FakeHost()).getState())),
    ).not.toThrow()
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('debounces writes while the store changes', () => {
    vi.useFakeTimers()
    const store = createEditorStore(new FakeHost())
    const storage = new MemoryStorage()
    const stop = startPersisting(store, storage, { debounceMs: 250 })
    store.getState().updateSettings('editor', { fontSize: 15 })
    store.getState().updateSettings('editor', { fontSize: 16 })
    expect(storage.map.size).toBe(0)
    vi.advanceTimersByTime(250)
    expect(readPersisted(storage)?.settings.editor.fontSize).toBe(16)
    stop()
    store.getState().updateSettings('editor', { fontSize: 17 })
    vi.advanceTimersByTime(250)
    expect(readPersisted(storage)?.settings.editor.fontSize).toBe(16)
    vi.useRealTimers()
  })

  it('ignores source, cursor and runtime changes', () => {
    vi.useFakeTimers()
    const store = createEditorStore(new FakeHost())
    const storage = new MemoryStorage()
    startPersisting(store, storage, { debounceMs: 10 })
    store.getState().setSource('x')
    store.getState().setCursor(2, 2)
    vi.advanceTimersByTime(10)
    expect(storage.map.size).toBe(0)
    vi.useRealTimers()
  })
})

describe('IndexedDB document', () => {
  it('round-trips the current document', async () => {
    const store = createEditorStore(new FakeHost())
    store.getState().requestReplace({ name: 'a.stepcode', source: 'Proceso A\nFinProceso\n' })
    store.getState().setSource('Proceso A\n  Escribir 1;\nFinProceso\n')
    const idb = openDocumentStore()
    await writeDocument(idb, documentOf(store.getState()))
    const loaded = await readDocument(idb)
    expect(loaded?.name).toBe('a.stepcode')
    expect(loaded?.source).toContain('Escribir 1')
    expect(loaded?.savedSource).toBe('Proceso A\nFinProceso\n')
    const again = createEditorStore(new FakeHost())
    if (loaded !== null) applyDocument(again, loaded)
    expect(again.getState().name).toBe('a.stepcode')
    expect(again.getState().savedSource).toBe('Proceso A\nFinProceso\n')
  })

  it('persists on a debounce and survives a failing store', async () => {
    vi.useFakeTimers()
    const store = createEditorStore(new FakeHost())
    const writes: string[] = []
    const stop = startDocumentPersisting(store, openDocumentStore(), {
      debounceMs: 500,
      write: async (_idb, doc) => {
        writes.push(doc.source)
      },
    })
    store.getState().setSource('1')
    store.getState().setSource('12')
    await vi.advanceTimersByTimeAsync(500)
    expect(writes).toEqual(['12'])
    stop()
    vi.useRealTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const failing = startDocumentPersisting(store, openDocumentStore(), {
      debounceMs: 0,
      write: async () => {
        throw new Error('quota')
      },
    })
    store.getState().setSource('123')
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(warn).toHaveBeenCalled()
    failing()
    warn.mockRestore()
  })
})
