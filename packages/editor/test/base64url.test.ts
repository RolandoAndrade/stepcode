import { describe, expect, it } from 'vitest'
import { fromBase64Url, toBase64Url } from '../src/share/base64url'

describe('base64url', () => {
  it('round-trips bytes without padding or url-unsafe characters', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255, 62, 63])
    const text = toBase64Url(bytes)
    expect(text).not.toMatch(/[+/=]/)
    expect(fromBase64Url(text)).toEqual(bytes)
    expect(toBase64Url(new Uint8Array())).toBe('')
    expect(fromBase64Url('')).toEqual(new Uint8Array())
  })

  it('throws on invalid input', () => {
    expect(() => fromBase64Url('***')).toThrow()
  })
})
