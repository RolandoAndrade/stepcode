// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UpdateToast } from '../src/pwa/UpdateToast'
import { StoreProvider } from '../src/store/context'
import { renderWithStore, storeWith } from './render'

describe('UpdateToast', () => {
  it('renders nothing until an update is waiting, then offers to reload', () => {
    const { store } = storeWith({})
    const update = vi.fn()
    const { rerender } = renderWithStore(<UpdateToast needRefresh={false} update={update} />, store)
    expect(screen.queryByRole('status')).toBeNull()
    rerender(
      <StoreProvider store={store}>
        <UpdateToast needRefresh update={update} />
      </StoreProvider>,
    )
    expect(screen.getByRole('status').textContent).toContain('Hay una versión nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }))
    expect(update).toHaveBeenCalledOnce()
  })
})

describe('vite config', () => {
  it('registers the PWA plugin with prompt updates and the version define', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath, URL: NodeURL } = await import('node:url')
    const config = readFileSync(
      fileURLToPath(new NodeURL('../vite.config.ts', import.meta.url)),
      'utf8',
    )
    expect(config).toContain("registerType: 'prompt'")
    expect(config).toContain('__APP_VERSION__')
    expect(config).toContain("display: 'standalone'")
    expect(config).toContain('maskable-icon-512x512.png')
  })
})
