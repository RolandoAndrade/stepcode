import { builtinProfiles } from '@stepcode/profiles'
import { customProfileOf, type EditorStore, stringsOf } from '../store/store'
import { fromBase64Url, toBase64Url } from './base64url'

export const SHARE_WARN_LENGTH = 8000

export interface SharePayload {
  readonly source: string
  readonly profileId: string
}

async function pipe(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const response = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream))
  return new Uint8Array(await response.arrayBuffer())
}

/** Spec §8.5: `#code=<base64url(deflate-raw(utf8))>&profile=<id>`. */
export async function encodeShare(payload: SharePayload): Promise<string> {
  const bytes = new TextEncoder().encode(payload.source)
  const deflated = await pipe(bytes, new CompressionStream('deflate-raw'))
  return `#code=${toBase64Url(deflated)}&profile=${encodeURIComponent(payload.profileId)}`
}

export async function decodeShare(hash: string): Promise<SharePayload | null> {
  if (!hash.startsWith('#')) return null
  const params = new URLSearchParams(hash.slice(1))
  const code = params.get('code')
  if (code === null || code === '') return null
  try {
    const inflated = await pipe(fromBase64Url(code), new DecompressionStream('deflate-raw'))
    const source = new TextDecoder('utf-8', { fatal: true }).decode(inflated)
    return { source, profileId: params.get('profile') ?? 'es' }
  } catch {
    return null
  }
}

export function shareUrl(
  hash: string,
  base: string = `${location.origin}${location.pathname}`,
): string {
  return `${base}${hash}`
}

/**
 * Spec §8.5: a `#code=` hash wins over the stored document (through the usual unsaved prompt),
 * the hash is removed from the address bar, and a missing profile falls back to `es`.
 */
export async function applyShareHash(
  store: EditorStore,
  location: { readonly hash: string },
  replaceState: (url: string) => void,
): Promise<boolean> {
  const payload = await decodeShare(location.hash)
  if (payload === null) return false
  const s = store.getState()
  const known =
    builtinProfiles.has(payload.profileId) || customProfileOf(s, payload.profileId) !== undefined
  if (!known) s.notify(stringsOf(s).share.unknownProfile)
  s.requestReplace({
    name: stringsOf(s).app.shared,
    source: payload.source,
    profileId: known ? payload.profileId : 'es',
  })
  replaceState(globalThis.location?.pathname ?? '/')
  return true
}
