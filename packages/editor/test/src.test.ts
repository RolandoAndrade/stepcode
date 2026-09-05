import { describe, expect, it } from 'vitest'
import { acceptedSrc, fetchSrc, MAX_SRC_BYTES, SrcError } from '../src/share/src'

const at = (url: string): string | null => acceptedSrc(url)?.toString() ?? null

describe('acceptedSrc', () => {
  it('rewrites a GitHub blob URL to raw', () => {
    expect(at('https://github.com/ana/curso/blob/main/ejercicios/uno.stepcode')).toBe(
      'https://raw.githubusercontent.com/ana/curso/main/ejercicios/uno.stepcode',
    )
  })

  it('rewrites a Gist URL to its raw endpoint, with or without a file anchor', () => {
    expect(at('https://gist.github.com/ana/0123456789abcdef')).toBe(
      'https://gist.githubusercontent.com/ana/0123456789abcdef/raw',
    )
    expect(at('https://gist.github.com/ana/0123456789abcdef#file-uno-stepcode')).toBe(
      'https://gist.githubusercontent.com/ana/0123456789abcdef/raw',
    )
  })

  it('passes the raw hosts through unchanged', () => {
    expect(at('https://raw.githubusercontent.com/ana/curso/main/uno.stepcode')).toBe(
      'https://raw.githubusercontent.com/ana/curso/main/uno.stepcode',
    )
    expect(at('https://gist.githubusercontent.com/ana/0123456789abcdef/raw')).toBe(
      'https://gist.githubusercontent.com/ana/0123456789abcdef/raw',
    )
  })

  it('refuses http, other hosts and malformed URLs', () => {
    expect(at('http://raw.githubusercontent.com/ana/curso/main/uno.stepcode')).toBeNull()
    expect(at('https://example.com/uno.stepcode')).toBeNull()
    expect(at('https://github.com/ana/curso')).toBeNull()
    expect(at('https://gist.github.com/ana')).toBeNull()
    expect(at('not a url')).toBeNull()
    expect(at('')).toBeNull()
  })
})

const RAW = 'https://raw.githubusercontent.com/ana/curso/main/uno.stepcode'

function fakeFetch(response: Response): typeof fetch {
  return (async () => response) as unknown as typeof fetch
}

async function reasonOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise
  } catch (error) {
    return error instanceof SrcError ? error.reason : `not a SrcError: ${String(error)}`
  }
  return 'no error'
}

describe('fetchSrc', () => {
  it('returns the text of a text/plain 200', async () => {
    const response = new Response('Proceso p\nFinProceso\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
    expect(await fetchSrc(RAW, fakeFetch(response))).toBe('Proceso p\nFinProceso\n')
  })

  it('asks for plain text and fetches the rewritten URL', async () => {
    const seen: { url: string; accept: string | null }[] = []
    const impl = (async (input: string, init?: RequestInit) => {
      seen.push({ url: input, accept: new Headers(init?.headers).get('accept') })
      return new Response('x', { headers: { 'content-type': 'text/plain' } })
    }) as unknown as typeof fetch
    await fetchSrc('https://github.com/ana/curso/blob/main/uno.stepcode', impl)
    expect(seen).toEqual([
      {
        url: 'https://raw.githubusercontent.com/ana/curso/main/uno.stepcode',
        accept: 'text/plain',
      },
    ])
  })

  it('refuses a host it does not accept before fetching anything', async () => {
    let called = false
    const impl = (async () => {
      called = true
      return new Response('x')
    }) as unknown as typeof fetch
    expect(await reasonOf(fetchSrc('https://example.com/a.txt', impl))).toBe('refused')
    expect(called).toBe(false)
  })

  it('maps a bad status, a bad type, an oversized body and a network failure', async () => {
    expect(await reasonOf(fetchSrc(RAW, fakeFetch(new Response('', { status: 404 }))))).toBe(
      'status',
    )
    expect(
      await reasonOf(
        fetchSrc(
          RAW,
          fakeFetch(new Response('{}', { headers: { 'content-type': 'application/json' } })),
        ),
      ),
    ).toBe('type')
    expect(
      await reasonOf(
        fetchSrc(
          RAW,
          fakeFetch(new Response('x', { headers: { 'content-type': 'application/octet-stream' } })),
        ),
      ),
    ).toBe('type')
    const big = 'a'.repeat(MAX_SRC_BYTES + 1)
    expect(
      await reasonOf(
        fetchSrc(RAW, fakeFetch(new Response(big, { headers: { 'content-type': 'text/plain' } }))),
      ),
    ).toBe('size')
    const failing = (async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof fetch
    expect(await reasonOf(fetchSrc(RAW, failing))).toBe('network')
  })

  it('caps the payload at the same 5 MB the share decoder uses', () => {
    expect(MAX_SRC_BYTES).toBe(5 * 1024 * 1024)
  })
})
