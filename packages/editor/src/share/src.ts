/** Spec §2.2: why a `?src=` did not produce a program. */
export type SrcReason = 'refused' | 'status' | 'type' | 'size' | 'network'

export class SrcError extends Error {
  readonly reason: SrcReason

  constructor(reason: SrcReason) {
    super(`src: ${reason}`)
    this.name = 'SrcError'
    this.reason = reason
  }
}

/** The share decoder's cap, so both program sources refuse the same size. */
export const MAX_SRC_BYTES = 5 * 1024 * 1024

const RAW_HOSTS: readonly string[] = ['raw.githubusercontent.com', 'gist.githubusercontent.com']
const BLOB = /^\/([^/]+)\/([^/]+)\/blob\/(.+)$/
const GIST = /^\/([^/]+)\/([0-9a-fA-F]+)\/?$/

/**
 * Spec §2.2: the URL to fetch, or `null` when the host is not accepted. Teachers paste what
 * they are looking at, so the browsing forms are rewritten to their raw ones.
 */
export function acceptedSrc(url: string): URL | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  if (RAW_HOSTS.includes(parsed.hostname)) {
    return new URL(`https://${parsed.hostname}${parsed.pathname}${parsed.search}`)
  }
  if (parsed.hostname === 'github.com') {
    const match = BLOB.exec(parsed.pathname)
    if (match === null) return null
    const [, user = '', repo = '', path = ''] = match
    return new URL(`https://raw.githubusercontent.com/${user}/${repo}/${path}`)
  }
  if (parsed.hostname === 'gist.github.com') {
    const match = GIST.exec(parsed.pathname)
    if (match === null) return null
    const [, user = '', id = ''] = match
    return new URL(`https://gist.githubusercontent.com/${user}/${id}/raw`)
  }
  return null
}

/** Spec §2.2: text only, from an accepted host, under the cap. Every failure is a `SrcError`. */
export async function fetchSrc(url: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const target = acceptedSrc(url)
  if (target === null) throw new SrcError('refused')
  let response: Response
  try {
    response = await fetchImpl(target.toString(), { headers: { Accept: 'text/plain' } })
  } catch {
    throw new SrcError('network')
  }
  if (!response.ok) throw new SrcError('status')
  const type = response.headers.get('content-type')
  if (type === null || !type.trim().toLowerCase().startsWith('text/')) throw new SrcError('type')
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_SRC_BYTES) throw new SrcError('size')
  let text: string
  try {
    text = await response.text()
  } catch {
    throw new SrcError('network')
  }
  // The header is advisory (and absent on a chunked response), so the body is measured too.
  if (new TextEncoder().encode(text).byteLength > MAX_SRC_BYTES) throw new SrcError('size')
  return text
}
