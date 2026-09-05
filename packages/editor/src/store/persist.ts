import { ProfileInputSchema } from '@stepcode/profiles'
import { createStore, get, set, type UseStore } from 'idb-keyval'
import * as z from 'zod'
import { DEFAULT_LAYOUT } from './layout'
import { SettingsSchema } from './settings'
import type { EditorStore, StoreState } from './store'

export const STORAGE_KEY = 'stepcode.editor'

export const PersistedSchema = z.strictObject({
  version: z.literal(1),
  settings: z.strictObject({
    profileId: z.string().min(1),
    customProfiles: z.array(ProfileInputSchema),
    ...SettingsSchema.shape,
  }),
  layout: z.strictObject({
    dockview: z.record(z.string(), z.unknown()).nullable(),
    collapsed: z.array(z.string()),
    sheet: z.enum(['collapsed', 'half', 'full']),
  }),
})

export type PersistedV1 = z.infer<typeof PersistedSchema>

export const CURRENT_VERSION = 1

/** `migrations[n]` upgrades a version-`n` document to `n + 1`. Empty for the first release. */
export const migrations: ReadonlyArray<
  (previous: Record<string, unknown>) => Record<string, unknown>
> = []

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** `steps[n]` upgrades version `n`; a version no step can lift is refused. */
export function migrate(
  raw: Record<string, unknown>,
  steps: ReadonlyArray<(previous: Record<string, unknown>) => Record<string, unknown>> = migrations,
  target: number = CURRENT_VERSION,
): Record<string, unknown> | null {
  let current = raw
  let version = typeof current.version === 'number' ? current.version : Number.NaN
  while (version < target) {
    const step = steps[version]
    if (step === undefined) return null
    current = step(current)
    version = typeof current.version === 'number' ? current.version : Number.NaN
  }
  return version === target ? current : null
}

/** Never throws (global constraint): garbage, unknown versions and storage errors all yield null. */
export function readPersisted(storage: StorageLike): PersistedV1 | null {
  try {
    const text = storage.getItem(STORAGE_KEY)
    if (text === null) return null
    const raw = JSON.parse(text) as unknown
    if (typeof raw !== 'object' || raw === null) throw new Error('not an object')
    const migrated = migrate(raw as Record<string, unknown>)
    if (migrated === null) throw new Error('unknown version')
    const parsed = PersistedSchema.safeParse(migrated)
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'invalid')
    return parsed.data
  } catch (error) {
    console.warn('stepcode: ignoring stored settings', error)
    return null
  }
}

export function writePersisted(storage: StorageLike, value: PersistedV1): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    console.warn('stepcode: could not store settings', error)
  }
}

export function persistedOf(state: StoreState): PersistedV1 {
  return {
    version: 1,
    settings: {
      profileId: state.profileId,
      customProfiles: [...state.customProfiles],
      ...state.settings,
    },
    layout: {
      dockview: state.layout.dockview,
      collapsed: [...state.layout.collapsed],
      sheet: state.layout.sheet,
    },
  }
}

export function applyPersisted(store: EditorStore, persisted: PersistedV1): void {
  const { profileId, customProfiles, ...settings } = persisted.settings
  store.setState({
    customProfiles,
    profileId,
    settings,
    layout: { ...DEFAULT_LAYOUT, ...persisted.layout },
  })
  store.getState().setThemePreference(settings.appearance.theme)
}

function persistedSlice(s: StoreState): readonly unknown[] {
  return [s.profileId, s.customProfiles, s.settings, s.layout]
}

export function startPersisting(
  store: EditorStore,
  storage: StorageLike,
  options: { debounceMs?: number } = {},
): () => void {
  const debounceMs = options.debounceMs ?? 250
  let timer: ReturnType<typeof setTimeout> | null = null
  const unsubscribe = store.subscribe((next, previous) => {
    const a = persistedSlice(next)
    const b = persistedSlice(previous)
    if (a.every((value, i) => value === b[i])) return
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      writePersisted(storage, persistedOf(store.getState()))
    }, debounceMs)
  })
  return () => {
    unsubscribe()
    if (timer !== null) clearTimeout(timer)
  }
}

// ---- IndexedDB document (spec §7.2) ----

export interface StoredDocument {
  readonly id: 'current'
  readonly name: string
  readonly source: string
  readonly profileId: string
  readonly savedSource: string | null
  readonly updatedAt: number
}

export type DocumentStore = UseStore

export function openDocumentStore(): DocumentStore {
  return createStore('stepcode', 'documents')
}

export function documentOf(state: StoreState, now: number = Date.now()): StoredDocument {
  return {
    id: 'current',
    name: state.name,
    source: state.source,
    profileId: state.profileId,
    savedSource: state.savedSource,
    updatedAt: now,
  }
}

export function applyDocument(store: EditorStore, doc: StoredDocument): void {
  store.setState({
    name: doc.name,
    source: doc.source,
    savedSource: doc.savedSource ?? doc.source,
    profileId: doc.profileId,
    handle: null,
  })
}

export async function readDocument(idb: DocumentStore): Promise<StoredDocument | null> {
  try {
    const value = await get<StoredDocument>('current', idb)
    return value ?? null
  } catch (error) {
    console.warn('stepcode: could not read the stored document', error)
    return null
  }
}

export async function writeDocument(idb: DocumentStore, doc: StoredDocument): Promise<void> {
  await set('current', doc, idb)
}

export function startDocumentPersisting(
  store: EditorStore,
  idb: DocumentStore,
  options: {
    debounceMs?: number
    write?: (idb: DocumentStore, doc: StoredDocument) => Promise<void>
  } = {},
): () => void {
  const debounceMs = options.debounceMs ?? 500
  const write = options.write ?? writeDocument
  let timer: ReturnType<typeof setTimeout> | null = null
  const unsubscribe = store.subscribe((next, previous) => {
    if (
      next.source === previous.source &&
      next.name === previous.name &&
      next.profileId === previous.profileId &&
      next.savedSource === previous.savedSource
    ) {
      return
    }
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      write(idb, documentOf(store.getState())).catch((error: unknown) => {
        console.warn('stepcode: could not store the document', error)
      })
    }, debounceMs)
  })
  return () => {
    unsubscribe()
    if (timer !== null) clearTimeout(timer)
  }
}
