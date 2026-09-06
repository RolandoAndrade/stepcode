import { profiles } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { starterProgram } from '../src/profiles/starter'
import { DEFAULT_SOURCE } from '../src/store/store'

describe('starterProgram', () => {
  it('is the es starter for es and a clean program for every builtin profile', () => {
    expect(starterProgram(profiles.es)).toBe(DEFAULT_SOURCE)
    for (const profile of [profiles.es, profiles.en, profiles.pseint]) {
      const source = starterProgram(profile)
      expect(source).toContain('Escribe tu programa aquí')
      expect(compile(source, { profile }).diagnostics).toEqual([])
    }
    expect(starterProgram(profiles.en)).toContain('Program Hola')
  })
})
