// @vitest-environment happy-dom
import 'fake-indexeddb/auto'
import '@vitest/web-worker'
import { describe, expect, it, vi } from 'vitest'

describe('boot', () => {
  it('renders the app even when localStorage is blocked', async () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('The user agent blocked storage')
      },
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    document.body.innerHTML = '<div id="root"></div>'
    await import('../src/main')
    // `boot` awaits IndexedDB and the share decoder before it renders.
    for (let i = 0; i < 100 && document.getElementById('root')?.childElementCount === 0; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
    expect(document.getElementById('root')?.childElementCount).toBeGreaterThan(0)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
