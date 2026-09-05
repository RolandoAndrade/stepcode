import { describe, expect, it } from 'vitest'
import { packageName, profilesPackageName } from '../src/index'

describe('@stepcode/textmate', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/textmate')
  })

  it('resolves @stepcode/profiles from source through the workspace', () => {
    expect(profilesPackageName).toBe('@stepcode/profiles')
  })
})
