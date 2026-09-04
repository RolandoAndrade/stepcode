import { describe, expect, it } from 'vitest'
import { packageName, stringsFor } from '../src/index'

describe('@stepcode/codemirror', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/codemirror')
  })

  it('exports the string table', () => {
    expect(stringsFor('es').kinds.variable).toBe('variable')
  })
})
