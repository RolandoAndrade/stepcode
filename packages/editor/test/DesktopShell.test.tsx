// @vitest-environment happy-dom
import { act, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import type { EditorHandle } from '../src/panels/Editor'
import { DesktopShell } from '../src/shell/DesktopShell'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

function mount(partial = {}) {
  const { store, host } = storeWith(partial)
  const editorRef = createRef<EditorHandle>()
  const rendered = renderWithStore(
    <TooltipProvider>
      <div style={{ width: 1000, height: 600 }}>
        <DesktopShell editorRef={editorRef} />
      </div>
    </TooltipProvider>,
    store,
  )
  return { store, host, editorRef, rendered }
}

/**
 * Dockview keeps every panel mounted (`defaultRenderer="always"`) but hides the ones that are not
 * in front, and a hidden element has no accessible name, so the panels are found by their
 * `aria-label` attribute rather than through `getByRole('region')`.
 */
function panelSection(label: string): Promise<HTMLElement> {
  return waitFor(() => {
    const found = document.querySelector<HTMLElement>(`section[aria-label="${label}"]`)
    expect(found).not.toBeNull()
    return found as HTMLElement
  })
}

describe('DesktopShell', () => {
  it('mounts the four panels in the default layout and saves it', async () => {
    const { store } = mount()
    for (const name of ['Editor', 'Consola', 'Problemas', 'Variables']) {
      expect(await panelSection(name)).toBeDefined()
    }
    await waitFor(() => expect(store.getState().layout.dockview).not.toBeNull())
    const json = store.getState().layout.dockview as { panels: Record<string, unknown> }
    expect(Object.keys(json.panels).sort()).toEqual(['console', 'editor', 'problems', 'variables'])
    expect(store.getState().layout.collapsed).toHaveLength(1)
  })

  it('expands the bottom group and activates the console when a run starts', async () => {
    const { store } = mount()
    await panelSection('Consola')
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    act(() => store.getState().run())
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    expect(screen.getByRole('tab', { name: 'Consola', selected: true })).toBeDefined()
  })

  it('honours a panel request and a reset', async () => {
    const { store } = mount()
    await panelSection('Problemas')
    act(() => store.getState().requestPanel('problems'))
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Problemas', selected: true })).toBeDefined(),
    )
    act(() => store.getState().resetLayout())
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    expect(screen.getByRole('tab', { name: 'Consola', selected: true })).toBeDefined()
  })

  it('restores a saved layout and discards an invalid one', async () => {
    const first = mount()
    await waitFor(() => expect(first.store.getState().layout.dockview).not.toBeNull())
    const saved = first.store.getState().layout
    first.rendered.unmount()
    const second = mount({ layout: { ...saved, collapsed: [] } })
    await panelSection('Consola')
    expect(second.store.getState().layout.collapsed).toEqual([])
    second.rendered.unmount()
    const third = mount({
      layout: { dockview: { grid: 'garbage' }, collapsed: [], sheet: 'collapsed' },
    })
    await panelSection('Consola')
    await waitFor(() => expect(third.store.getState().layout.collapsed).toHaveLength(1))
  })
})
