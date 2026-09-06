import { describe, expect, it } from 'vitest'
import { createEmbedOptions } from '../src/embed/options'
import { DEFAULT_URL_OPTIONS, readUrlOptions } from '../src/share/urlOptions'

describe('createEmbedOptions', () => {
  it('takes only the four fields the embed chrome reads', () => {
    const store = createEmbedOptions(
      readUrlOptions(new URL('https://x.test/embed?readonly&debug&title=Tarea')),
    )
    const state = store.getState()
    expect(state.readOnly).toBe(true)
    expect(state.debug).toBe(true)
    expect(state.showProfile).toBe(false)
    expect(state.title).toBe('Tarea')
  })

  it('defaults everything from a bare URL', () => {
    const state = createEmbedOptions(DEFAULT_URL_OPTIONS).getState()
    expect(state.readOnly).toBe(false)
    expect(state.showProfile).toBe(false)
    expect(state.debug).toBe(false)
    expect(state.title).toBeNull()
  })

  it('lets the boot sequence name the program once it is loaded', () => {
    const store = createEmbedOptions(DEFAULT_URL_OPTIONS)
    const seen: (string | null)[] = []
    store.subscribe((state) => seen.push(state.title))
    store.getState().setTitle('Tabla del 5')
    store.getState().setTitle(null)
    expect(seen).toEqual(['Tabla del 5', null])
    expect(store.getState().title).toBeNull()
  })
})
