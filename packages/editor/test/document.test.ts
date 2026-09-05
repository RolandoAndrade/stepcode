import { describe, expect, it } from 'vitest'
import { displayName, isDirty, nameWithExtension } from '../src/store/document'

describe('document', () => {
  it('is dirty when the text differs from the last saved text', () => {
    expect(isDirty({ source: 'a', savedSource: 'a' })).toBe(false)
    expect(isDirty({ source: 'a ', savedSource: 'a' })).toBe(true)
  })

  it('appends .stepcode when a name has no extension', () => {
    expect(nameWithExtension('hola')).toBe('hola.stepcode')
    expect(nameWithExtension('hola.psc')).toBe('hola.psc')
    expect(nameWithExtension('  ')).toBe('')
  })

  it('strips one known extension, case-insensitively, for display', () => {
    expect(displayName('hola.stepcode')).toBe('hola')
    expect(displayName('hola.PSC')).toBe('hola')
    expect(displayName('hola.txt')).toBe('hola')
    expect(displayName('hola.sc')).toBe('hola')
    expect(displayName('hola')).toBe('hola')
    expect(displayName('a.b.stepcode')).toBe('a.b')
    expect(displayName('archivo.md')).toBe('archivo.md')
  })
})
