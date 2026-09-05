// @vitest-environment happy-dom
import 'fake-indexeddb/auto'
import '@vitest/web-worker'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { until } from './helpers'

const rendered = (): number => document.getElementById('root')?.childElementCount ?? 0

beforeEach(() => {
  vi.resetModules()
  document.documentElement.lang = ''
  document.body.innerHTML = '<div id="root"></div>'
})

describe('the embed entry', () => {
  it('marks the document with the language the URL asked for', async () => {
    window.history.replaceState(null, '', '/embed?lang=en')
    await import('../src/embed/main')
    await until(() => rendered() > 0)
    expect(document.documentElement.lang).toBe('en')
  })

  it('marks the document as Spanish when the URL says nothing', async () => {
    window.history.replaceState(null, '', '/embed')
    await import('../src/embed/main')
    await until(() => rendered() > 0)
    expect(document.documentElement.lang).toBe('es')
  })

  it('still drains toasts to the console when the boot fails', async () => {
    window.history.replaceState(null, '', '/embed')
    const forwarded: unknown[] = []
    vi.doMock('../src/embed/boot', async (importOriginal) => {
      const actual = await importOriginal<typeof import('../src/embed/boot')>()
      return {
        ...actual,
        bootEmbed: () => Promise.reject(new Error('no program')),
        forwardToasts: (store: Parameters<typeof actual.forwardToasts>[0]) => {
          forwarded.push(store)
          return actual.forwardToasts(store)
        },
      }
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await import('../src/embed/main')
    await until(() => rendered() > 0)
    expect(warn).toHaveBeenCalled()
    expect(forwarded).toHaveLength(2)
    warn.mockRestore()
    vi.doUnmock('../src/embed/boot')
  })
})
