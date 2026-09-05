// @vitest-environment happy-dom
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { allowRunWithWarnings, bootEmbed, forwardToasts, titleFor } from '../src/embed/boot'
import { EmbedApp, installEmbedShortcuts } from '../src/embed/EmbedApp'
import { createEmbedOptions } from '../src/embed/options'
import type { LoadFrom, LoadOutcome } from '../src/share/load'
import { DEFAULT_URL_OPTIONS, readUrlOptions, type UrlOptions } from '../src/share/urlOptions'
import type { EditorStore } from '../src/store/store'
import { renderWithStore, storeWith } from './render'

const WARNING = { from: 0, to: 1, severity: 'warning', source: 'W1001', message: 'w' } as const

/** Everything the frame's console holds, since the embed renders no toasts. */
const consoleText = (store: EditorStore): string => store.getState().output.chunks.join('')

const loaded = (from: LoadFrom, title: string): LoadOutcome => ({ kind: 'loaded', from, title })

const SOURCE = 'Proceso p\n  Escribir 1;\nFinProceso\n'
const EXAMPLE = { title: 'Hola mundo', source: SOURCE }

function mount(overrides: Partial<UrlOptions> = {}, title: string | null = null) {
  const { store, host } = storeWith({ source: SOURCE })
  const options = createEmbedOptions({ ...DEFAULT_URL_OPTIONS, ...overrides })
  if (title !== null) options.getState().setTitle(title)
  const rendered = renderWithStore(<EmbedApp options={options} />, store)
  return { store, host, options, rendered }
}

const labels = (): string[] =>
  screen.getAllByRole('button').map((button) => button.getAttribute('aria-label') ?? '')

describe('EmbedApp', () => {
  it('is one column: a top bar, the editor and the console, and nothing else', () => {
    mount()
    expect(screen.getByLabelText('Editor incrustado')).toBeTruthy()
    expect(screen.getByLabelText('Editor')).toBeTruthy()
    expect(screen.getByTestId('console-output')).toBeTruthy()
    expect(screen.queryByLabelText('Variables')).toBeNull()
    expect(screen.queryByLabelText('Nombre del archivo')).toBeNull()
    expect(screen.queryByLabelText('Menú')).toBeNull()
    expect(screen.queryByText('Listo')).toBeNull()
  })

  it('shows the title it was given and sets the document title', () => {
    mount({}, 'Tabla del 5')
    expect(screen.getByText('Tabla del 5')).toBeTruthy()
    expect(document.title).toBe('Tabla del 5')
  })

  it('falls back to the app name when there is no title', () => {
    mount()
    expect(document.title).toBe('StepCode')
  })

  it('offers Ejecutar only, until debug asks for the whole cluster', () => {
    mount()
    expect(labels()).toContain('Ejecutar')
    expect(labels()).not.toContain('Depurar')
    mount({ debug: true })
    expect(labels()).toContain('Depurar')
  })

  it('shows Variables beside the console only with debug', () => {
    mount({ debug: true })
    expect(screen.getByLabelText('Variables')).toBeTruthy()
  })

  it('locks the editor and shows the lock with readonly', () => {
    mount({ readonly: true })
    expect(screen.getByLabelText('Solo lectura')).toBeTruthy()
    expect(document.querySelector('.cm-content')?.getAttribute('contenteditable')).toBe('false')
  })

  it('names the profile only with showProfile', () => {
    mount()
    expect(screen.queryByText('Español')).toBeNull()
    mount({ showProfile: true })
    expect(screen.getByText('Español')).toBeTruthy()
  })

  it('reports the problem count and reveals the first problem when it is clicked', () => {
    const { store } = mount()
    act(() => {
      store.setState({
        diagnostics: [{ from: 12, to: 13, severity: 'error', source: 'E3001', message: 'x' }],
      })
    })
    const problems = screen.getByRole('button', { name: 'Problemas' })
    expect(problems.textContent).toContain('1')
    act(() => {
      fireEvent.click(problems)
    })
    expect(store.getState().state).toBe('ready')
  })

  it('offers a way out to the full editor', () => {
    mount()
    expect(labels()).toContain('Abrir en StepCode')
  })
})

describe('installEmbedShortcuts', () => {
  it('runs on F5 and stops on Shift+F5', () => {
    const { store, host } = storeWith({ source: SOURCE })
    const dispose = installEmbedShortcuts(store, false)
    fireEvent.keyDown(window, { key: 'F5' })
    expect(host.calls).toEqual(['start:run'])
    host.emit({ kind: 'state', state: 'running' })
    fireEvent.keyDown(window, { key: 'F5', shiftKey: true })
    expect(host.calls).toContain('stop')
    dispose()
  })

  it('ignores the stepping keys unless debug is on', () => {
    const { store, host } = storeWith({ source: SOURCE })
    const dispose = installEmbedShortcuts(store, false)
    host.emit({ kind: 'state', state: 'paused' })
    fireEvent.keyDown(window, { key: 'F10' })
    expect(host.calls).not.toContain('stepOver')
    dispose()

    const withDebug = installEmbedShortcuts(store, true)
    fireEvent.keyDown(window, { key: 'F10' })
    expect(host.calls).toContain('stepOver')
    withDebug()
  })

  it('never opens a file dialog or the settings', () => {
    const { store } = storeWith({ source: SOURCE })
    const dispose = installEmbedShortcuts(store, true)
    fireEvent.keyDown(window, { key: 's', ctrlKey: true })
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    expect(store.getState().dialog).toBeNull()
    dispose()
  })
})

describe('allowRunWithWarnings', () => {
  it('turns off the warning prompt the frame has no dialog host to render', () => {
    const { store, host } = storeWith({ source: SOURCE, diagnostics: [WARNING] })
    store.getState().run()
    expect(store.getState().dialog).toBe('warnings')
    expect(host.starts).toHaveLength(0)

    store.setState({ dialog: null })
    allowRunWithWarnings(store)
    store.getState().run()
    expect(store.getState().dialog).toBeNull()
    expect(host.starts).toHaveLength(1)
  })
})

describe('forwardToasts', () => {
  it('moves every toast — waiting and later — to the console, and stops when disposed', () => {
    const { store } = storeWith({ source: '' })
    store.getState().notify('antes')
    const stop = forwardToasts(store)
    expect(consoleText(store)).toBe('antes\n')
    expect(store.getState().toasts).toEqual([])

    store.getState().notify('primero')
    store.getState().notify('segundo')
    expect(consoleText(store)).toBe('antes\nprimero\nsegundo\n')
    expect(store.getState().toasts).toEqual([])

    stop()
    store.getState().notify('después')
    expect(consoleText(store)).toBe('antes\nprimero\nsegundo\n')
  })
})

describe('titleFor', () => {
  it('prefers ?title=, then the hash name, then the example or file title', () => {
    expect(
      titleFor({ ...DEFAULT_URL_OPTIONS, title: 'Mío' }, loaded('hash', 'otro.stepcode')),
    ).toBe('Mío')
    expect(titleFor(DEFAULT_URL_OPTIONS, loaded('hash', 'tabla.stepcode'))).toBe('tabla')
    expect(titleFor(DEFAULT_URL_OPTIONS, loaded('example', 'Hola mundo'))).toBe('Hola mundo')
    expect(titleFor(DEFAULT_URL_OPTIONS, loaded('src', 'programa'))).toBe('programa')
    expect(titleFor(DEFAULT_URL_OPTIONS, { kind: 'none' })).toBeNull()
    expect(titleFor(DEFAULT_URL_OPTIONS, { kind: 'failed', reason: 'example' })).toBeNull()
  })
})

describe('bootEmbed', () => {
  const embedFor = (url: URL) => createEmbedOptions(readUrlOptions(url))

  it('titles the frame from the program and runs it when ?autorun loaded one', async () => {
    const { store, host } = storeWith({ source: '' })
    const url = new URL('https://stepcode.test/embed?autorun&example=saludo')
    const embed = embedFor(url)
    const outcome = await bootEmbed(store, embed, url, { example: () => EXAMPLE })
    expect(outcome.kind).toBe('loaded')
    expect(embed.getState().title).toBe('Hola mundo')
    expect(host.starts).toHaveLength(1)
  })

  it('writes the unknown profile and the failure to the console, and never autoruns', async () => {
    const { store, host } = storeWith({ source: '' })
    const url = new URL('https://stepcode.test/embed?autorun&profile=klingon&example=nada')
    const embed = embedFor(url)
    const outcome = await bootEmbed(store, embed, url, { example: () => null })
    expect(outcome).toEqual({ kind: 'failed', reason: 'example' })
    expect(consoleText(store)).toContain('El enlace usa un perfil que no existe aquí')
    expect(consoleText(store)).toContain('No se pudo cargar el programa: no existe ese ejemplo')
    expect(embed.getState().title).toBeNull()
    expect(host.starts).toHaveLength(0)
  })

  it('keeps the boot messages that ?autorun would otherwise clear', async () => {
    const { store, host } = storeWith({ source: '' })
    const url = new URL('https://stepcode.test/embed?autorun&profile=klingon&example=saludo')
    await bootEmbed(store, embedFor(url), url, { example: () => EXAMPLE })
    expect(host.starts).toHaveLength(1)
    expect(store.getState().settings.execution.clearConsoleOnRun).toBe(true)
    expect(consoleText(store)).toContain('El enlace usa un perfil que no existe aquí')
  })

  it('says nothing about the profile when the URL named a real one', async () => {
    const { store } = storeWith({ source: '' })
    const url = new URL('https://stepcode.test/embed?profile=pseint&example=saludo')
    await bootEmbed(store, embedFor(url), url, { example: () => EXAMPLE })
    expect(consoleText(store)).toBe('')
    expect(store.getState().profileId).toBe('pseint')
  })
})

describe('the way out to the full editor', () => {
  it('opens a share link for the program in a new tab', async () => {
    const opened: string[] = []
    const open = vi.spyOn(window, 'open').mockImplementation((url) => {
      opened.push(String(url))
      // A blocked pop-up answers null; the embed must not throw over it.
      return null
    })
    mount({}, 'Demo')
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Abrir en StepCode' }))
    })
    await waitFor(() => {
      expect(opened).toHaveLength(1)
    })
    expect(opened[0]).toContain('/#code=')
    expect(opened[0]).toContain('&profile=es')
    expect(opened[0]).toContain('&name=Demo.stepcode')
    open.mockRestore()
  })
})
