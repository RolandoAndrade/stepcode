// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmbedApp, installEmbedShortcuts } from '../src/embed/EmbedApp'
import { createEmbedOptions } from '../src/embed/options'
import { DEFAULT_URL_OPTIONS, type UrlOptions } from '../src/share/urlOptions'
import { renderWithStore, storeWith } from './render'

const SOURCE = 'Proceso p\n  Escribir 1;\nFinProceso\n'

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
