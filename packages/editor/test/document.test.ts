import { describe, expect, it } from 'vitest'
import { isDirty, nameWithExtension } from '../src/store/document'

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
})
