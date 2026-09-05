// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { encodeShare } from '../src/share/link'
import { bootFromUrl, loadFromLocation } from '../src/share/onLoad'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const SOURCE = 'Proceso p\n  Escribir 1;\nFinProceso\n'

describe('loadFromLocation', () => {
  it('reads the address bar and reports what it loaded', async () => {
    window.history.replaceState(null, '', '/?example=ciclos/tabla')
    const store = createEditorStore(new FakeHost())
    const outcome = await loadFromLocation(store, {
      example: () => ({ title: 'Tabla del 5', source: SOURCE }),
    })
    expect(outcome).toEqual({ kind: 'loaded', from: 'example', title: 'Tabla del 5' })
    expect(store.getState().source).toBe(SOURCE)
  })

  it('removes a consumed hash and keeps the query string', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'es', name: 'a.stepcode' })
    window.history.replaceState(null, '', `/?keep=1${hash}`)
    const store = createEditorStore(new FakeHost())
    await loadFromLocation(store)
    expect(window.location.hash).toBe('')
    expect(window.location.search).toBe('?keep=1')
    expect(store.getState().name).toBe('a.stepcode')
  })

  it('reports a refused src without changing the document', async () => {
    window.history.replaceState(null, '', '/?src=https%3A%2F%2Fevil.test%2Fa.txt')
    const store = createEditorStore(new FakeHost())
    const before = store.getState().source
    expect(await loadFromLocation(store)).toEqual({ kind: 'failed', reason: 'refused' })
    expect(store.getState().source).toBe(before)
  })

  it('says nothing happened for a plain address', async () => {
    window.history.replaceState(null, '', '/')
    const store = createEditorStore(new FakeHost())
    expect(await loadFromLocation(store)).toEqual({ kind: 'none' })
  })
})

describe('bootFromUrl', () => {
  it('chooses the profile and the language before the program arrives', async () => {
    const store = createEditorStore(new FakeHost())
    const result = await bootFromUrl(
      store,
      new URL('https://stepcode.test/?profile=en&lang=en&example=ciclos/tabla&autorun'),
      { example: () => ({ title: 'Times table', source: SOURCE }) },
    )
    expect(store.getState().profileId).toBe('en')
    expect(store.getState().settings.appearance.uiLocale).toBe('en')
    expect(result.outcome).toEqual({ kind: 'loaded', from: 'example', title: 'Times table' })
    expect(result.options.autorun).toBe(true)
    expect(result.message).toBeNull()
  })

  it('phrases the failure in the language the address asked for', async () => {
    const store = createEditorStore(new FakeHost())
    const result = await bootFromUrl(
      store,
      new URL('https://stepcode.test/?lang=en&src=https%3A%2F%2Fevil.test%2Fa.txt'),
    )
    expect(result.outcome).toEqual({ kind: 'failed', reason: 'refused' })
    expect(result.message).toBe(
      'The program could not be loaded: the link is not from GitHub or Gist',
    )
  })

  it('phrases the failure in Spanish by default', async () => {
    const store = createEditorStore(new FakeHost())
    const result = await bootFromUrl(
      store,
      new URL('https://stepcode.test/?src=https%3A%2F%2Fevil.test%2Fa.txt'),
    )
    expect(result.message).toBe(
      'No se pudo cargar el programa: el enlace no es de GitHub ni de Gist',
    )
    expect(store.getState().toasts).toEqual([])
  })

  it('has nothing to say about a plain address', async () => {
    const store = createEditorStore(new FakeHost())
    const result = await bootFromUrl(store, new URL('https://stepcode.test/'))
    expect(result.outcome).toEqual({ kind: 'none' })
    expect(result.message).toBeNull()
  })
})
