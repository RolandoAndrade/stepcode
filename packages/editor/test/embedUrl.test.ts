import { describe, expect, it } from 'vitest'
import {
  DEFAULT_EMBED_HEIGHT,
  DEFAULT_EMBED_OPTIONS,
  embedSnippet,
  embedUrl,
  MIN_EMBED_HEIGHT,
  PREVIEW_MAX_HEIGHT,
} from '../src/share/embed'

const HASH = '#code=AAAA&profile=es&name=tarea.stepcode'
const BASE = 'https://stepcode.test/'

describe('embedUrl', () => {
  it('writes no query at all when every option is the default', () => {
    expect(embedUrl(HASH, DEFAULT_EMBED_OPTIONS, BASE)).toBe(`${BASE}embed${HASH}`)
  })

  it('writes only the options that differ from the defaults, as bare flags', () => {
    expect(embedUrl(HASH, { ...DEFAULT_EMBED_OPTIONS, readonly: true, autorun: true }, BASE)).toBe(
      `${BASE}embed?readonly&autorun${HASH}`,
    )
    expect(embedUrl(HASH, { ...DEFAULT_EMBED_OPTIONS, debug: true }, BASE)).toBe(
      `${BASE}embed?debug${HASH}`,
    )
    expect(embedUrl(HASH, { ...DEFAULT_EMBED_OPTIONS, showProfile: true }, BASE)).toBe(
      `${BASE}embed?showProfile${HASH}`,
    )
  })

  it('writes the theme only when it is not system', () => {
    expect(embedUrl(HASH, { ...DEFAULT_EMBED_OPTIONS, theme: 'dark' }, BASE)).toBe(
      `${BASE}embed?theme=dark${HASH}`,
    )
    expect(embedUrl(HASH, { ...DEFAULT_EMBED_OPTIONS, theme: 'system' }, BASE)).toBe(
      `${BASE}embed${HASH}`,
    )
  })

  it('keeps the flags in one fixed order', () => {
    const url = embedUrl(
      HASH,
      { readonly: true, autorun: true, debug: true, showProfile: true, theme: 'light' },
      BASE,
    )
    expect(url).toBe(`${BASE}embed?readonly&autorun&debug&showProfile&theme=light${HASH}`)
  })

  it('tolerates a base with or without its trailing slash', () => {
    expect(embedUrl(HASH, DEFAULT_EMBED_OPTIONS, 'https://stepcode.test')).toBe(
      `${BASE}embed${HASH}`,
    )
  })
})

describe('embedSnippet', () => {
  it('builds a full-width iframe with the chosen height', () => {
    const url = `${BASE}embed?readonly${HASH}`
    expect(embedSnippet(url, 480, 'tarea')).toBe(
      `<iframe src="${BASE}embed?readonly#code=AAAA&amp;profile=es&amp;name=tarea.stepcode" width="100%" height="480" style="border:0" loading="lazy" title="tarea"></iframe>`,
    )
  })

  it('escapes the ampersands and quotes that would break the attribute', () => {
    const snippet = embedSnippet(`${BASE}embed?readonly&autorun${HASH}`, 480, 'a "b" & <c>')
    expect(snippet).toContain('?readonly&amp;autorun')
    expect(snippet).toContain('title="a &quot;b&quot; &amp; &lt;c&gt;"')
    expect(snippet).not.toContain('title="a "b"')
  })

  it('never goes below the minimum height and rounds to whole pixels', () => {
    expect(embedSnippet(BASE, 10, 't')).toContain(`height="${MIN_EMBED_HEIGHT}"`)
    expect(embedSnippet(BASE, 480.6, 't')).toContain('height="481"')
  })

  it('agrees with the dialog defaults', () => {
    expect(DEFAULT_EMBED_HEIGHT).toBe(480)
    expect(MIN_EMBED_HEIGHT).toBe(200)
    expect(PREVIEW_MAX_HEIGHT).toBe(360)
  })
})
