import { describe, expect, it } from 'vitest'
import { languagePackageName, packageName } from '../src/index'

describe('@stepcode/codemirror', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/codemirror')
  })

  it('resolves stepcode from source through the workspace', () => {
    expect(languagePackageName).toBe('stepcode')
  })
})
