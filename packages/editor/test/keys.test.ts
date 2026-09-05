import { describe, expect, it } from 'vitest'
import { isMac, keyLabel } from '../src/ui/keys'

describe('keys', () => {
  it('detects macOS from the platform string', () => {
    expect(isMac('MacIntel')).toBe(true)
    expect(isMac('Win32')).toBe(false)
    expect(isMac(undefined)).toBe(false)
  })

  it('renders shortcuts per platform', () => {
    expect(keyLabel('Ctrl+S', false)).toBe('Ctrl+S')
    expect(keyLabel('Ctrl+S', true)).toBe('⌘S')
    expect(keyLabel('Ctrl+Shift+S', true)).toBe('⇧⌘S')
    expect(keyLabel('Shift+F5', true)).toBe('⇧F5')
    expect(keyLabel('F5', true)).toBe('F5')
    expect(keyLabel('Ctrl+,', false)).toBe('Ctrl+,')
  })
})
