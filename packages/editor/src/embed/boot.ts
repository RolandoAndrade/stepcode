import type { HostApi } from '../runtime/host-api'
import type { LoadDeps, LoadOutcome } from '../share/load'
import { bootFromUrl } from '../share/onLoad'
import type { UrlOptions } from '../share/urlOptions'
import { displayName } from '../store/document'
import { appendOutput } from '../store/output'
import { createEditorStore, type EditorStore, stringsOf } from '../store/store'
import type { Theme } from '../theme/types'
import type { EmbedOptionsStore } from './options'

/** Spec §3.1: no Toaster in the frame, so every message is a console line. */
export function note(store: EditorStore, text: string): void {
  store.setState((s) => ({ output: appendOutput(s.output, [`${text}\n`]) }))
}

/**
 * Spec §3.1: code elsewhere — the share hash's unknown profile, for one — reports through
 * `notify`, and the frame renders no toasts at all. Every toast is drained to the console
 * instead, including any raised before this was installed.
 */
export function forwardToasts(store: EditorStore): () => void {
  let draining = false
  const drain = (): void => {
    // `note` and `dismissToast` both set state, which calls this subscriber again; the guard
    // keeps one loop in charge so no message is written twice.
    if (draining) return
    draining = true
    try {
      for (;;) {
        const toast = store.getState().toasts[0]
        if (toast === undefined) return
        note(store, toast.message)
        store.getState().dismissToast(toast.id)
      }
    } finally {
      draining = false
    }
  }
  drain()
  return store.subscribe((next, previous) => {
    if (next.toasts !== previous.toasts) drain()
  })
}

/**
 * Spec §3.5: `run()` parks on the warning prompt, and the frame has no dialog host to answer it —
 * so Ejecutar, F5 and the bridge would all go quiet. Nothing in the embed is persisted, so this
 * choice never reaches the reader's own settings.
 */
export function allowRunWithWarnings(store: EditorStore): void {
  store.getState().updateSettings('execution', { warnOnWarnings: false })
}

export interface EmbedThemeDeps {
  applyTheme(theme: Theme): void
  watchSystemTheme(onChange: (dark: boolean) => void): () => void
}

/**
 * Spec §2.4 and §8.2: the store's `applyTheme` is a change notification, so `?theme=light|dark`
 * would never reach the root element on its own; the frame paints the resolved theme once here
 * and only follows `prefers-color-scheme` while the URL asked for `system`. No localStorage, no
 * IndexedDB, no service worker either: the frame starts empty every time.
 */
export function createEmbedStore(
  host: HostApi,
  options: UrlOptions,
  deps: EmbedThemeDeps,
): EditorStore {
  const store = createEditorStore(host, {
    applyTheme: deps.applyTheme,
    initialTheme: options.theme,
    initialSource: '',
  })
  allowRunWithWarnings(store)
  deps.applyTheme(store.getState().theme)
  if (options.theme === 'system') {
    deps.watchSystemTheme((dark) => store.getState().setSystemDark(dark))
  }
  return store
}

/** Spec §3.3: `title=`, then the hash's name, then the example's title, then the file name. */
export function titleFor(options: UrlOptions, outcome: LoadOutcome): string | null {
  if (options.title !== null) return options.title
  if (outcome.kind !== 'loaded' || outcome.title === null) return null
  return outcome.from === 'hash' ? displayName(outcome.title) : outcome.title
}

/**
 * Spec §2.3 and §3.3: the URL's program, title and `autorun`, with every message the load
 * produced left in the console. `bootFromUrl` has already applied `?profile=` and `?lang=`, so
 * the lines below are phrased in the locale the URL asked for.
 */
export async function bootEmbed(
  store: EditorStore,
  embed: EmbedOptionsStore,
  url: URL,
  deps: LoadDeps = {},
): Promise<LoadOutcome> {
  const { options, outcome, message } = await bootFromUrl(store, url, deps)
  const asked = url.searchParams.get('profile')
  if (asked !== null && asked !== '' && options.profile === null) {
    note(store, stringsOf(store.getState()).share.unknownProfile)
  }
  if (message !== null) note(store, message)
  embed.getState().setTitle(titleFor(options, outcome))
  // Spec §2.3: `autorun` starts the program the URL brought, never an empty frame.
  if (options.autorun && outcome.kind === 'loaded') {
    // `clearConsoleOnRun` is on by default and would wipe what boot just wrote, which is the
    // frame's only channel for these messages (spec §3.1); they are put back above the run's
    // own output, which the worker has not produced yet.
    const notes = store.getState().output.chunks
    store.getState().run()
    if (notes.length > 0 && store.getState().output.chunks.length === 0) {
      store.setState((s) => ({ output: appendOutput(s.output, notes) }))
    }
  }
  return outcome
}
