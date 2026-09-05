import { describe, expect, it } from 'vitest'
import { DEFAULT_URL_OPTIONS, readUrlOptions } from '../src/share/urlOptions'

const read = (search: string) => readUrlOptions(new URL(`https://x.test/embed${search}`))

describe('readUrlOptions', () => {
  it('defaults everything on a bare URL', () => {
    expect(read('')).toEqual(DEFAULT_URL_OPTIONS)
    expect(DEFAULT_URL_OPTIONS).toEqual({
      example: null,
      src: null,
      profile: null,
      title: null,
      autorun: false,
      readonly: false,
      showProfile: false,
      debug: false,
      theme: 'system',
      lang: null,
    })
  })

  it('reads a flag as present, 1 or true, in any case', () => {
    expect(read('?autorun').autorun).toBe(true)
    expect(read('?autorun=').autorun).toBe(true)
    expect(read('?autorun=1').autorun).toBe(true)
    expect(read('?autorun=true').autorun).toBe(true)
    expect(read('?autorun=TRUE').autorun).toBe(true)
    expect(read('?autorun=0').autorun).toBe(false)
    expect(read('?autorun=false').autorun).toBe(false)
    expect(read('?autorun=sí').autorun).toBe(false)
  })

  it('reads every flag under its own name', () => {
    const all = read('?readonly&showProfile&debug&autorun')
    expect(all.readonly).toBe(true)
    expect(all.showProfile).toBe(true)
    expect(all.debug).toBe(true)
    expect(all.autorun).toBe(true)
  })

  it('takes builtin profile ids only', () => {
    expect(read('?profile=en').profile).toBe('en')
    expect(read('?profile=pseint').profile).toBe('pseint')
    expect(read('?profile=mi-perfil').profile).toBeNull()
    expect(read('?profile=').profile).toBeNull()
  })

  it('falls back silently on a bad theme or language', () => {
    expect(read('?theme=dark').theme).toBe('dark')
    expect(read('?theme=light').theme).toBe('light')
    expect(read('?theme=neon').theme).toBe('system')
    expect(read('?lang=en').lang).toBe('en')
    expect(read('?lang=fr').lang).toBeNull()
  })

  it('passes example, src and title through, decoded', () => {
    const options = read(
      '?example=ciclos/tabla&src=https%3A%2F%2Fx.test%2Fa.txt&title=Mi%20programa',
    )
    expect(options.example).toBe('ciclos/tabla')
    expect(options.src).toBe('https://x.test/a.txt')
    expect(options.title).toBe('Mi programa')
  })
})
