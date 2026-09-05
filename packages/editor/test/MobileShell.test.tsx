// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { EditorHandle } from '../src/panels/Editor'
import { MobileShell } from '../src/shell/mobile/MobileShell'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('MobileShell', () => {
  it('renders top bar, editor, sheet and status; the sheet opens on run and on input', () => {
    const { store, host } = storeWith({})
    const editorRef = createRef<EditorHandle>()
    renderWithStore(
      <TooltipProvider>
        <MobileShell editorRef={editorRef} env={env} />
      </TooltipProvider>,
      store,
    )
    expect(screen.getByRole('region', { name: 'Editor' })).toBeDefined()
    expect(screen.getByRole('region', { name: 'Paneles' })).toBeDefined()
    expect(screen.queryByRole('region', { name: 'Consola' })).toBeNull()
    act(() => store.getState().run())
    expect(store.getState().layout.sheet).toBe('half')
    expect(screen.getByRole('region', { name: 'Consola' })).toBeDefined()
    act(() => {
      host.emit({ kind: 'state', state: 'input' })
      host.emit({ kind: 'input', line: 1, target: null })
    })
    expect(store.getState().layout.sheet).toBe('full')
    act(() => store.getState().requestPanel('variables'))
    expect(screen.getByRole('region', { name: 'Variables' })).toBeDefined()
  })

  it('keeps a collapse the user makes during a run until the next run', () => {
    const { store, host } = storeWith({})
    const editorRef = createRef<EditorHandle>()
    renderWithStore(
      <TooltipProvider>
        <MobileShell editorRef={editorRef} env={env} />
      </TooltipProvider>,
      store,
    )
    act(() => store.getState().run())
    expect(store.getState().layout.sheet).toBe('half')
    fireEvent.click(screen.getByRole('button', { name: 'Contraer' }))
    expect(store.getState().layout.sheet).toBe('collapsed')
    act(() => host.emit({ kind: 'paused', reason: 'step', line: 1, frames: [] }))
    expect(store.getState().layout.sheet).toBe('collapsed')
    act(() => store.getState().run())
    expect(store.getState().layout.sheet).toBe('half')
  })

  it('does not import dockview', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath, URL: NodeURL } = await import('node:url')
    const source = readFileSync(
      fileURLToPath(new NodeURL('../src/shell/mobile/MobileShell.tsx', import.meta.url)),
      'utf8',
    )
    expect(source).not.toContain('dockview')
  })
})
