import { describe, expect, it, vi } from 'vitest'
import {
  applyShareHash,
  decodeShare,
  encodeShare,
  MAX_SHARE_BYTES,
  SHARE_WARN_LENGTH,
  shareUrl,
} from '../src/share/link'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const SOURCE = "Proceso A\n  Escribir 'ñandú';\nFinProceso\n"

describe('share links', () => {
  it('round-trips source and profile through #code=', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'es' })
    expect(hash).toMatch(/^#code=[A-Za-z0-9_-]+&profile=es$/)
    expect(await decodeShare(hash)).toEqual({ source: SOURCE, profileId: 'es' })
    expect(shareUrl(hash, 'https://x.test/')).toBe(`https://x.test/${hash}`)
  })

  it('compresses: 200 lines of code fit well under the warning threshold', async () => {
    const big = Array.from({ length: 200 }, (_, i) => `  Escribir 'línea ${i}';`).join('\n')
    const hash = await encodeShare({ source: `Proceso B\n${big}\nFinProceso\n`, profileId: 'es' })
    expect(hash.length).toBeLessThan(SHARE_WARN_LENGTH)
    expect(SHARE_WARN_LENGTH).toBe(8000)
  })

  it('returns null for missing, malformed or undecodable hashes', async () => {
    expect(await decodeShare('')).toBeNull()
    expect(await decodeShare('#foo=bar')).toBeNull()
    expect(await decodeShare('#code=***')).toBeNull()
    expect(await decodeShare('#code=AAAA')).toBeNull()
  })

  it('refuses a hash that inflates past the cap', async () => {
    // A short link can carry a decompression bomb; the payload is bounded, not the link.
    const hash = await encodeShare({ source: 'x'.repeat(200_000), profileId: 'es' })
    expect(hash.length).toBeLessThan(2000)
    expect(await decodeShare(hash, 1000)).toBeNull()
    expect((await decodeShare(hash))?.source.length).toBe(200_000)
    expect(MAX_SHARE_BYTES).toBe(5 * 1024 * 1024)
  })

  it('keeps the query string of the page it builds a link for', () => {
    vi.stubGlobal('location', {
      origin: 'https://x.test',
      pathname: '/editor/',
      search: '?ui=en',
    })
    expect(shareUrl('#code=abc')).toBe('https://x.test/editor/?ui=en#code=abc')
    vi.unstubAllGlobals()
  })

  it('defaults the profile to es when the hash has none', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'en' })
    const noProfile = hash.replace('&profile=en', '')
    expect((await decodeShare(noProfile))?.profileId).toBe('es')
  })
})

describe('applyShareHash', () => {
  it('replaces the document, names it, strips the hash and reports success', async () => {
    const store = createEditorStore(new FakeHost())
    const hash = await encodeShare({ source: SOURCE, profileId: 'en' })
    const replaced: string[] = []
    const applied = await applyShareHash(
      store,
      { hash, pathname: '/editor/', search: '?ui=en' },
      (url) => replaced.push(url),
    )
    expect(applied).not.toBeNull()
    expect(store.getState().source).toBe(SOURCE)
    expect(store.getState().profileId).toBe('en')
    expect(store.getState().name).toBe('compartido.stepcode')
    // The hash goes; everything else about the address stays.
    expect(replaced).toEqual(['/editor/?ui=en'])
  })

  it('falls back to es with a toast for an unknown profile', async () => {
    const store = createEditorStore(new FakeHost())
    const hash = await encodeShare({ source: SOURCE, profileId: 'nope' })
    await applyShareHash(store, { hash }, () => {})
    expect(store.getState().profileId).toBe('es')
    expect(store.getState().toasts[0]?.message).toContain('perfil')
  })

  it('does nothing without a code hash', async () => {
    const store = createEditorStore(new FakeHost())
    expect(await applyShareHash(store, { hash: '' }, () => {})).toBeNull()
    expect(await applyShareHash(store, { hash: '#code=***' }, () => {})).toBeNull()
  })
})

describe('the name in the hash', () => {
  it('writes and reads name=, url-encoded', async () => {
    const hash = await encodeShare({
      source: SOURCE,
      profileId: 'es',
      name: 'mi programa.stepcode',
    })
    expect(hash).toContain('&name=mi%20programa.stepcode')
    expect(await decodeShare(hash)).toEqual({
      source: SOURCE,
      profileId: 'es',
      name: 'mi programa.stepcode',
    })
  })

  it('omits the key entirely when there is no name', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'es' })
    expect(hash).not.toContain('name=')
    expect(await decodeShare(hash)).toEqual({ source: SOURCE, profileId: 'es' })
  })

  it('still decodes a 4b link that has no name', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'en', name: 'a.stepcode' })
    const old = hash.replace('&name=a.stepcode', '')
    expect(await decodeShare(old)).toEqual({ source: SOURCE, profileId: 'en' })
  })

  it('names the loaded document after the hash, and falls back to compartido', async () => {
    const named = await encodeShare({ source: SOURCE, profileId: 'es', name: 'tarea.stepcode' })
    const store = createEditorStore(new FakeHost())
    expect(await applyShareHash(store, { hash: named }, () => {})).toEqual({
      source: SOURCE,
      profileId: 'es',
      name: 'tarea.stepcode',
    })
    expect(store.getState().name).toBe('tarea.stepcode')

    const plain = await encodeShare({ source: SOURCE, profileId: 'es' })
    const other = createEditorStore(new FakeHost())
    await applyShareHash(other, { hash: plain }, () => {})
    expect(other.getState().name).toBe('compartido.stepcode')
  })
})
