import { describe, expect, it } from 'vitest'
import { encodeShare } from '../src/share/link'
import { loadProgramFromUrl } from '../src/share/load'
import { createEditorStore, type EditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const SOURCE = 'Proceso p\n  Escribir 1;\nFinProceso\n'
const FETCHED = 'Proceso q\n  Escribir 2;\nFinProceso\n'
const RAW = 'https://raw.githubusercontent.com/ana/curso/main/tarea.stepcode'

function store(): EditorStore {
  return createEditorStore(new FakeHost())
}

const example = () => ({ title: 'Tabla del 5', source: SOURCE })

function textFetch(body: string): typeof fetch {
  return (async () =>
    new Response(body, { headers: { 'content-type': 'text/plain' } })) as unknown as typeof fetch
}

describe('loadProgramFromUrl', () => {
  it('does nothing when the URL names no program', async () => {
    const s = store()
    const before = s.getState().source
    expect(await loadProgramFromUrl(s, new URL('https://x.test/'))).toEqual({ kind: 'none' })
    expect(s.getState().source).toBe(before)
  })

  it('loads a #code= hash, keeps its name and strips the hash through replaceState', async () => {
    const s = store()
    const hash = await encodeShare({ source: SOURCE, profileId: 'en', name: 'tarea.stepcode' })
    const replaced: string[] = []
    const url = new URL(`https://x.test/${hash}`)
    const outcome = await loadProgramFromUrl(s, url, { replaceState: (to) => replaced.push(to) })
    expect(outcome).toEqual({ kind: 'loaded', from: 'hash', title: 'tarea.stepcode' })
    expect(s.getState().source).toBe(SOURCE)
    expect(s.getState().profileId).toBe('en')
    expect(replaced).toEqual(['/'])
  })

  it('leaves the address alone when no replaceState is given (the embed)', async () => {
    const s = store()
    const hash = await encodeShare({ source: SOURCE, profileId: 'es' })
    const outcome = await loadProgramFromUrl(s, new URL(`https://x.test/embed${hash}`))
    expect(outcome).toEqual({ kind: 'loaded', from: 'hash', title: null })
  })

  it('loads an example, names the document after its slug and reports its title', async () => {
    const s = store()
    const url = new URL('https://x.test/?example=ciclos/tabla')
    expect(await loadProgramFromUrl(s, url, { example })).toEqual({
      kind: 'loaded',
      from: 'example',
      title: 'Tabla del 5',
    })
    expect(s.getState().source).toBe(SOURCE)
    expect(s.getState().name).toBe('tabla.stepcode')
  })

  it('loads a src, names the document after the file and reports the name without extension', async () => {
    const s = store()
    const url = new URL(`https://x.test/?src=${encodeURIComponent(RAW)}`)
    expect(await loadProgramFromUrl(s, url, { fetchImpl: textFetch(FETCHED) })).toEqual({
      kind: 'loaded',
      from: 'src',
      title: 'tarea',
    })
    expect(s.getState().source).toBe(FETCHED)
    expect(s.getState().name).toBe('tarea.stepcode')
  })

  it('resolves the sources in order: hash beats example beats src', async () => {
    const s = store()
    const hash = await encodeShare({ source: SOURCE, profileId: 'es', name: 'del-hash.stepcode' })
    const url = new URL(
      `https://x.test/?example=ciclos/tabla&src=${encodeURIComponent(RAW)}${hash}`,
    )
    const outcome = await loadProgramFromUrl(s, url, {
      example,
      fetchImpl: textFetch(FETCHED),
    })
    expect(outcome).toEqual({ kind: 'loaded', from: 'hash', title: 'del-hash.stepcode' })
    expect(s.getState().name).toBe('del-hash.stepcode')
  })

  it('falls through from a broken hash to the example', async () => {
    const s = store()
    const url = new URL('https://x.test/?example=ciclos/tabla#code=***')
    expect(await loadProgramFromUrl(s, url, { example })).toEqual({
      kind: 'loaded',
      from: 'example',
      title: 'Tabla del 5',
    })
  })

  it('falls through from an unknown example to the src', async () => {
    const s = store()
    const url = new URL(`https://x.test/?example=nope/nope&src=${encodeURIComponent(RAW)}`)
    expect(
      await loadProgramFromUrl(s, url, { example: () => null, fetchImpl: textFetch(FETCHED) }),
    ).toEqual({ kind: 'loaded', from: 'src', title: 'tarea' })
  })

  it('reports the first failure when every source fails, and changes nothing', async () => {
    const s = store()
    const before = s.getState().source
    const url = new URL('https://x.test/?example=nope/nope&src=https%3A%2F%2Fevil.test%2Fa.txt')
    expect(await loadProgramFromUrl(s, url, { example: () => null })).toEqual({
      kind: 'failed',
      reason: 'example',
    })
    expect(s.getState().source).toBe(before)
  })

  it('reports the src reason when the src is the only source', async () => {
    const s = store()
    const url = new URL('https://x.test/?src=https%3A%2F%2Fevil.test%2Fa.txt')
    expect(await loadProgramFromUrl(s, url)).toEqual({ kind: 'failed', reason: 'refused' })
  })

  it('reports a damaged hash when the hash is the only source', async () => {
    const s = store()
    expect(await loadProgramFromUrl(s, new URL('https://x.test/#code=***'))).toEqual({
      kind: 'failed',
      reason: 'hash',
    })
  })

  it('resolves a real bundled example through the default dependency', async () => {
    const s = store()
    const url = new URL('https://x.test/?example=primeros-pasos/hola-mundo')
    expect(await loadProgramFromUrl(s, url)).toEqual({
      kind: 'loaded',
      from: 'example',
      title: 'Hola mundo',
    })
    expect(s.getState().name).toBe('hola-mundo.stepcode')
    expect(s.getState().source).toContain("Escribir 'Hola, mundo'")
  })
})
