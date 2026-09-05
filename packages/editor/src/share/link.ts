import { builtinProfiles } from '@stepcode/profiles'
import { customProfileOf, type EditorStore, stringsOf } from '../store/store'
import { fromBase64Url, toBase64Url } from './base64url'

export const SHARE_WARN_LENGTH = 8000

/** A short link can hide a very long program: the payload is bounded, the link is not. */
export const MAX_SHARE_BYTES = 5 * 1024 * 1024

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

/** Inflates `bytes`, giving up as soon as the result passes `limit` — never buffering past it. */
async function inflate(bytes: Uint8Array, limit: number): Promise<Uint8Array | null> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.byteLength
  }
  return out
}

/** Spec §8.5: `#code=<base64url(deflate-raw(utf8))>&profile=<id>`. */
export async function encodeShare(payload: SharePayload): Promise<string> {
  const bytes = new TextEncoder().encode(payload.source)
  const deflated = await pipe(bytes, new CompressionStream('deflate-raw'))
  return `#code=${toBase64Url(deflated)}&profile=${encodeURIComponent(payload.profileId)}`
}

export async function decodeShare(
  hash: string,
  maxBytes: number = MAX_SHARE_BYTES,
): Promise<SharePayload | null> {
  if (!hash.startsWith('#')) return null
  const params = new URLSearchParams(hash.slice(1))
  const code = params.get('code')
  if (code === null || code === '') return null
  try {
    const inflated = await inflate(fromBase64Url(code), maxBytes)
    if (inflated === null) return null
    const source = new TextDecoder('utf-8', { fatal: true }).decode(inflated)
    return { source, profileId: params.get('profile') ?? 'es' }
  } catch {
    return null
  }
}

export function shareUrl(
  hash: string,
  base: string = `${location.origin}${location.pathname}${location.search}`,
): string {
  return `${base}${hash}`
}

/**
 * Spec §8.5: a `#code=` hash wins over the stored document (through the usual unsaved prompt),
 * the hash is removed from the address bar, and a missing profile falls back to `es`.
 */
export async function applyShareHash(
  store: EditorStore,
  location: { readonly hash: string; readonly pathname?: string; readonly search?: string },
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
  // Only the hash goes: a query string the page was opened with is part of the address.
  const pathname = location.pathname ?? globalThis.location?.pathname ?? '/'
  const search = location.search ?? globalThis.location?.search ?? ''
  replaceState(`${pathname}${search}`)
  return true
}
