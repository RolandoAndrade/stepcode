// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../src/App'
import { Toolbar } from '../src/components/Toolbar'
import { renderWithStore, storeWith } from './render'

describe('App', () => {
  it('renders the toolbar and the four panels', () => {
    const { store } = storeWith({})
    renderWithStore(<App />, store)
    expect(screen.getByText('StepCode')).toBeDefined()
    for (const name of ['Editor', 'Consola', 'Variables', 'Problemas']) {
      expect(screen.getByRole('region', { name })).toBeDefined()
    }
    expect(screen.getByRole('button', { name: 'Ejecutar' })).toBeDefined()
  })

  it('installs the keyboard shortcuts while mounted', () => {
    const { store, host } = storeWith({})
    const rendered = renderWithStore(<App />, store)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
    rendered.unmount()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
  })

  it('connects Problems to the editor', () => {
    const { store } = storeWith({
      source: 'Proceso p\n  Escribir x;\nFinProceso',
      diagnostics: [
        { from: 21, to: 22, severity: 'error', message: 'x undeclared', source: 'E3001' },
      ],
    })
    renderWithStore(<App />, store)
    const row = screen.getAllByRole('row')[0]
    if (row === undefined) throw new Error('no diagnostic row')
    row.click()
    const editor = screen.getByRole('region', { name: 'Editor' })
    expect(editor.querySelector('.cm-content')?.textContent).toContain('Escribir x;')
    expect(document.activeElement?.closest('.cm-editor')).not.toBeNull()
  })

  it('refuses to render a store consumer without a provider', () => {
    expect(() => render(<Toolbar />)).toThrow(/StoreProvider/)
  })
})
