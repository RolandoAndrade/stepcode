import { exampleSource, findExample } from '../examples/index'
import { displayName, nameWithExtension } from '../store/document'
import { type EditorStore, profileOf } from '../store/store'
import { applyShareHash } from './link'
import { fetchSrc, SrcError, type SrcReason } from './src'
import { readUrlOptions } from './urlOptions'

export type LoadReason = SrcReason | 'example' | 'hash'
export type LoadFrom = 'hash' | 'example' | 'src'

/** Spec §2.1: what the entry has to render — a program, nothing, or one reason. */
export type LoadOutcome =
  | { readonly kind: 'none' }
  | { readonly kind: 'loaded'; readonly from: LoadFrom; readonly title: string | null }
  | { readonly kind: 'failed'; readonly reason: LoadReason }

export interface LoadDeps {
  readonly example?: (
    id: string,
    store: EditorStore,
  ) => { readonly title: string; readonly source: string } | null
  readonly fetchImpl?: typeof fetch
  /** Where to leave the address bar once a `#code=` hash is consumed; a no-op by default. */
  readonly replaceState?: (url: string) => void
}

function defaultExample(
  id: string,
  store: EditorStore,
): { readonly title: string; readonly source: string } | null {
  const example = findExample(id)
  if (example === undefined) return null
  return { title: example.title, source: exampleSource(example, profileOf(store.getState())) }
}

function hasCode(hash: string): boolean {
  if (!hash.startsWith('#')) return false
  const code = new URLSearchParams(hash.slice(1)).get('code')
  return code !== null && code !== ''
}

/** The document name for `?example=<topic>/<slug>`, matching what the Ejemplos dialog uses. */
function exampleName(id: string): string {
  const slug = id.split('/').pop() ?? id
  return `${slug}.stepcode`
}

/** The document name for `?src=`: the file at the end of the address the teacher pasted. */
function srcName(pasted: string): string {
  let path = pasted
  try {
    path = new URL(pasted).pathname
  } catch {
    // A malformed URL never reaches here (fetchSrc refused it first), but the name must not throw.
  }
  const segments = path.split('/').filter((part) => part !== '' && part !== 'raw')
  const last = segments[segments.length - 1] ?? 'programa'
  let decoded = last
  try {
    decoded = decodeURIComponent(last)
  } catch {
    // A stray `%` (`100%.stepcode`) is not valid escaping; the program downloaded fine, so the
    // name is taken as written rather than failing the load.
  }
  return nameWithExtension(decoded)
}

/**
 * Spec §2.1: `#code=`, then `?example=`, then `?src=`; the first that yields a program wins and
 * a failed source falls through to the next. The caller phrases the reason (a toast on `/`, a
 * console line on `/embed`), so nothing here touches `strings`.
 */
export async function loadProgramFromUrl(
  store: EditorStore,
  url: URL,
  deps: LoadDeps = {},
): Promise<LoadOutcome> {
  const options = readUrlOptions(url)
  const failures: LoadReason[] = []

  if (hasCode(url.hash)) {
    const payload = await applyShareHash(store, url, deps.replaceState ?? (() => {}))
    if (payload !== null) return { kind: 'loaded', from: 'hash', title: payload.name ?? null }
    failures.push('hash')
  }

  if (options.example !== null) {
    const found = (deps.example ?? defaultExample)(options.example, store)
    if (found !== null) {
      store.getState().requestReplace({ name: exampleName(options.example), source: found.source })
      return { kind: 'loaded', from: 'example', title: found.title }
    }
    failures.push('example')
  }

  if (options.src !== null) {
    try {
      const text = await fetchSrc(options.src, deps.fetchImpl ?? fetch)
      const name = srcName(options.src)
      store.getState().requestReplace({ name, source: text })
      return { kind: 'loaded', from: 'src', title: displayName(name) }
    } catch (error) {
      failures.push(error instanceof SrcError ? error.reason : 'network')
    }
  }

  const first = failures[0]
  return first === undefined ? { kind: 'none' } : { kind: 'failed', reason: first }
}
