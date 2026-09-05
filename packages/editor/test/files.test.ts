import { describe, expect, it, vi } from 'vitest'
import type { FileEnvironment } from '../src/files/actions'
import { newDocument, openFile, saveFile, saveFileAs } from '../src/files/actions'
import { isAbort, pickersFrom } from '../src/files/fsa'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

function fakeHandle(name: string, contents = '') {
  const written: string[] = []
  return {
    written,
    handle: {
      name,
      getFile: async () => ({ text: async () => contents }) as File,
      createWritable: async () => ({
        write: async (data: string) => {
          written.push(data)
        },
        close: async () => {},
      }),
    },
  }
}

function env(overrides: Partial<FileEnvironment> = {}): FileEnvironment {
  return { ...baseEnv(), ...overrides }
}

function baseEnv(): FileEnvironment {
  return {
    pickers: {},
    download: vi.fn<(name: string, text: string) => void>(),
    pickFallback: vi.fn(async () => null as File | null),
  }
}

describe('pickersFrom', () => {
  it('finds the File System Access API when present', () => {
    expect(pickersFrom({})).toEqual({})
    const open = async () => []
    const save = async () => fakeHandle('x').handle
    expect(
      Object.keys(pickersFrom({ showOpenFilePicker: open, showSaveFilePicker: save })),
    ).toEqual(['open', 'save'])
  })

  it('recognises an abort', () => {
    expect(isAbort(new DOMException('x', 'AbortError'))).toBe(true)
    expect(isAbort(new Error('x'))).toBe(false)
  })
})

describe('newDocument', () => {
  it('replaces with the starter in the active profile', () => {
    const store = createEditorStore(new FakeHost())
    store.getState().setProfile('en')
    newDocument(store)
    expect(store.getState().name).toBe('untitled.stepcode')
    expect(store.getState().source).toContain('Program Hola')
  })
})

describe('openFile', () => {
  it('uses the picker, keeps the handle and names the document', async () => {
    const store = createEditorStore(new FakeHost())
    const { handle } = fakeHandle('mi.stepcode', 'Proceso M\nFinProceso\n')
    await openFile(store, env({ pickers: { open: async () => [handle] } }))
    expect(store.getState().name).toBe('mi.stepcode')
    expect(store.getState().source).toBe('Proceso M\nFinProceso\n')
    expect(store.getState().handle).toBe(handle)
  })

  it('falls back to a file input without a picker', async () => {
    const store = createEditorStore(new FakeHost())
    const file = { name: 'otro.psc', text: async () => 'Proceso O\nFinProceso\n' } as File
    await openFile(store, env({ pickFallback: async () => file }))
    expect(store.getState().name).toBe('otro.psc')
    expect(store.getState().handle).toBeNull()
  })

  it('is silent on abort and toasts on failure', async () => {
    const store = createEditorStore(new FakeHost())
    await openFile(
      store,
      env({
        pickers: {
          open: async () => {
            throw new DOMException('x', 'AbortError')
          },
        },
      }),
    )
    expect(store.getState().toasts).toEqual([])
    await openFile(
      store,
      env({
        pickers: {
          open: async () => {
            throw new Error('boom')
          },
        },
      }),
    )
    expect(store.getState().toasts[0]?.message).toBe('No se pudo abrir el archivo')
  })
})

describe('saveFile / saveFileAs', () => {
  it('writes to the held handle and clears the dirty flag', async () => {
    const store = createEditorStore(new FakeHost())
    const { handle, written } = fakeHandle('mi.stepcode')
    store.getState().markSaved(store.getState().source, handle)
    store.getState().setSource('Proceso X\nFinProceso\n')
    await saveFile(store, env())
    expect(written).toEqual(['Proceso X\nFinProceso\n'])
    expect(store.getState().savedSource).toBe('Proceso X\nFinProceso\n')
    expect(store.getState().toasts.at(-1)?.message).toBe('Guardado')
  })

  it('behaves as save-as without a handle, and downloads without a picker', async () => {
    const store = createEditorStore(new FakeHost())
    store.getState().setSource('Proceso Y\nFinProceso\n')
    const { handle, written } = fakeHandle('nuevo.stepcode')
    const e = env({ pickers: { save: async () => handle } })
    await saveFile(store, e)
    expect(written).toEqual(['Proceso Y\nFinProceso\n'])
    expect(store.getState().name).toBe('nuevo.stepcode')
    expect(store.getState().handle).toBe(handle)

    const other = createEditorStore(new FakeHost())
    other.getState().setSource('Proceso Z\nFinProceso\n')
    const fallback = env()
    await saveFileAs(other, fallback)
    expect(fallback.download).toHaveBeenCalledWith('sin título.stepcode', 'Proceso Z\nFinProceso\n')
    expect(other.getState().savedSource).toBe('Proceso Z\nFinProceso\n')
    expect(other.getState().toasts.at(-1)?.message).toBe('Descargado')
  })

  it('is silent on abort and toasts on failure', async () => {
    const store = createEditorStore(new FakeHost())
    await saveFileAs(
      store,
      env({
        pickers: {
          save: async () => {
            throw new DOMException('x', 'AbortError')
          },
        },
      }),
    )
    expect(store.getState().toasts).toEqual([])
    await saveFileAs(
      store,
      env({
        pickers: {
          save: async () => {
            throw new Error('boom')
          },
        },
      }),
    )
    expect(store.getState().toasts[0]?.message).toBe('No se pudo guardar el archivo')
  })
})
