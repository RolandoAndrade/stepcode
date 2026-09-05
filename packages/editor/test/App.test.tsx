// @vitest-environment happy-dom
import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../src/App'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('App', () => {
  it('renders the desktop shell with toolbar, status bar and the editor', async () => {
    const { store } = storeWith({})
    renderWithStore(<App env={env} narrow={false} />, store)
    expect(screen.getByRole('button', { name: 'Menú' })).toBeDefined()
    expect(await screen.findByRole('region', { name: 'Editor' })).toBeDefined()
    expect(screen.getByRole('button', { name: /Sin problemas/ })).toBeDefined()
    expect(document.title).toBe('sin título.stepcode · StepCode')
  })

  it('renders the phone shell when narrow', () => {
    const { store } = storeWith({})
    renderWithStore(<App env={env} narrow />, store)
    expect(screen.getByRole('region', { name: 'Paneles' })).toBeDefined()
  })

  it('keeps dockview out of the phone bundle by loading the desktop shell lazily', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath, URL: NodeURL } = await import('node:url')
    const source = readFileSync(
      fileURLToPath(new NodeURL('../src/App.tsx', import.meta.url)),
      'utf8',
    )
    // Spec §9: a static import would pull dockview into the entry chunk every phone loads.
    expect(source).not.toMatch(/import\s[^\n]*from '\.\/shell\/DesktopShell'/)
    expect(source).toContain("import('./shell/DesktopShell')")
  })

  it('installs shortcuts and updates the title when dirty', () => {
    const { store, host } = storeWith({})
    const rendered = renderWithStore(<App env={env} narrow={false} />, store)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
    act(() => {
      host.emit({ kind: 'state', state: 'done' })
      store.getState().setSource('x')
    })
    expect(document.title).toBe('● sin título.stepcode · StepCode')
    rendered.unmount()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
  })
})
