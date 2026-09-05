import { type EditorStore, stringsOf } from '../store/store'
import { type LoadDeps, type LoadOutcome, loadProgramFromUrl } from './load'
import { readUrlOptions, type UrlOptions } from './urlOptions'

/** `replaceState` throws in a sandboxed frame or on an opaque origin; the program still loads. */
function dropHash(url: string): void {
  try {
    window.history.replaceState(null, '', url)
  } catch (error) {
    console.warn('The share link could not be removed from the address bar', error)
  }
}

export interface BootFromUrlResult {
  readonly options: UrlOptions
  readonly outcome: LoadOutcome
  /** The phrased failure for the reader, or null when nothing failed. */
  readonly message: string | null
}

/**
 * Spec §2.3: the session's profile and UI language are chosen before the program arrives, so an
 * example is transposed — and every message is phrased — the way the URL asked for. Where the
 * failure goes (a toast on `/`, a console line on `/embed`) is the caller's decision, and so is
 * `autorun` and the address bar: this only reads the URL and loads.
 */
export async function bootFromUrl(
  store: EditorStore,
  url: URL,
  deps: Omit<LoadDeps, 'replaceState'> & { replaceState?: LoadDeps['replaceState'] } = {},
): Promise<BootFromUrlResult> {
  const options = readUrlOptions(url)
  if (options.profile !== null) store.getState().setProfile(options.profile)
  if (options.lang !== null) {
    store.getState().updateSettings('appearance', { uiLocale: options.lang })
  }
  // `exactOptionalPropertyTypes`: an explicit `replaceState: undefined` is not the same as no
  // `replaceState` at all, so the key is dropped rather than passed empty.
  const { replaceState, ...rest } = deps
  const loadDeps: LoadDeps = replaceState === undefined ? rest : { ...rest, replaceState }
  const outcome = await loadProgramFromUrl(store, url, loadDeps)
  if (outcome.kind !== 'failed') return { options, outcome, message: null }
  const strings = stringsOf(store.getState())
  return { options, outcome, message: strings.embed.loadFailed(strings.src[outcome.reason]) }
}

/** Spec §2.1: the whole URL contract, resolved against the address bar of `/`. */
export async function loadFromLocation(
  store: EditorStore,
  deps: Omit<LoadDeps, 'replaceState'> = {},
): Promise<LoadOutcome> {
  const { options, outcome, message } = await bootFromUrl(store, new URL(window.location.href), {
    ...deps,
    replaceState: dropHash,
  })
  if (message !== null) store.getState().notify(message)
  // Spec §2.3: `autorun` on `/` starts the loaded program; a parked replacement (the unsaved
  // prompt is open) is not this program, so it waits for the reader to answer.
  if (options.autorun && outcome.kind === 'loaded' && store.getState().pendingReplace === null) {
    store.getState().run()
  }
  return outcome
}
