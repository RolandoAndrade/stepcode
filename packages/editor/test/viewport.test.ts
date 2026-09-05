import { describe, expect, it } from 'vitest'
import { keyboardVisible } from '../src/shell/mobile/viewport'

describe('keyboardVisible', () => {
  it('uses the visual viewport gap when available, focus on coarse pointers otherwise', () => {
    expect(keyboardVisible(800, 450, true, true)).toBe(true)
    expect(keyboardVisible(800, 760, true, true)).toBe(false)
    expect(keyboardVisible(800, 450, true, false)).toBe(false)
    expect(keyboardVisible(800, undefined, true, true)).toBe(true)
    expect(keyboardVisible(800, undefined, true, false)).toBe(false)
    expect(keyboardVisible(800, undefined, false, true)).toBe(false)
  })
})
