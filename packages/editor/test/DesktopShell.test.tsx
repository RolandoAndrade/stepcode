// @vitest-environment happy-dom
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
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

/** The editor group's tab strip, hidden by spec §3.1 and so unreachable through its role. */
function editorTab(): HTMLElement {
  const found = document.querySelector<HTMLElement>('.dv-tab[aria-label="Editor"]')
  expect(found).not.toBeNull()
  return found as HTMLElement
}

function editorHeader(): HTMLElement {
  const found = editorTab()
    .closest('.dv-groupview')
    ?.querySelector<HTMLElement>('.dv-tabs-and-actions-container')
  expect(found).toBeDefined()
  return found as HTMLElement
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

  it('expands the console for an input request even after a manual collapse', async () => {
    const { store, host } = mount()
    await panelSection('Consola')
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    act(() => store.getState().run())
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Contraer' }))
    })
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    // Spec §3.4: a program blocked on a prompt the user cannot see is unusable.
    act(() => host.emit({ kind: 'input', line: 2, target: null }))
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
  })

  it('leaves a manually collapsed group alone when a pause wants the variables', async () => {
    const { store, host } = mount()
    await panelSection('Consola')
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    act(() => store.getState().run())
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Contraer' }))
    })
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    act(() => host.emit({ kind: 'paused', reason: 'breakpoint', line: 2, frames: [] }))
    expect(store.getState().layout.collapsed).toHaveLength(1)
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

  it('hides the whole group when it collapses and shows it again on expand', async () => {
    // Spec §3.3: collapse is `setVisible(false)` on the grid view, not a header-sized strip.
    const { store } = mount()
    await panelSection('Consola')
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    // `.dv-view` is the grid slot dockview marks `visible`; `defaultRenderer="always"` moves the
    // panel body itself into an overlay outside the group, so the tab is what locates the group.
    const view = (): Element | null =>
      document.querySelector('.dv-tab[aria-label="Consola"]')?.closest('.dv-view') ?? null
    expect(view()?.classList.contains('visible')).toBe(false)
    act(() => store.getState().run())
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    expect(view()?.classList.contains('visible')).toBe(true)
  })

  it('hides the header of the editor group', async () => {
    // Spec §3.1: the editor group renders no tab strip, restored layouts included.
    const first = mount()
    await panelSection('Editor')
    await waitFor(() => expect(editorHeader().style.display).toBe('none'))
    expect(screen.queryByRole('tab', { name: 'Editor' })).toBeNull()
    await waitFor(() => expect(first.store.getState().layout.dockview).not.toBeNull())
    const saved = first.store.getState().layout
    first.rendered.unmount()
    mount({ layout: saved })
    await panelSection('Editor')
    await waitFor(() => expect(editorHeader().style.display).toBe('none'))
  })

  it('puts the panel icon on every tab', async () => {
    mount()
    await panelSection('Consola')
    for (const name of ['Consola', 'Problemas', 'Variables']) {
      const tab = screen.getByRole('tab', { name })
      expect(tab.querySelector('svg'), name).not.toBeNull()
    }
  })

  it('drives the bottom group from the sidebar', async () => {
    const { store, host } = mount()
    await panelSection('Problemas')
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    // Hidden: the button shows the group and puts its own panel in front.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Problemas' }))
    })
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    expect(screen.getByRole('tab', { name: 'Problemas', selected: true })).toBeDefined()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Problemas' }).getAttribute('aria-pressed')).toBe(
        'true',
      ),
    )
    // Visible but another tab in front: the button only activates its panel.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Variables' }))
    })
    expect(store.getState().layout.collapsed).toEqual([])
    expect(screen.getByRole('tab', { name: 'Variables', selected: true })).toBeDefined()
    // Visible and in front: the button hides the group, and that counts as a manual collapse.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Variables' }))
    })
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    act(() => host.emit({ kind: 'paused', reason: 'breakpoint', line: 2, frames: [] }))
    expect(store.getState().layout.collapsed).toHaveLength(1)
  })

  it('marks the dock root while a group is hiding', async () => {
    const { store } = mount()
    await panelSection('Consola')
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    const dock = document.querySelector('.sc-dock') as HTMLElement
    // Building the default layout is not an animation: the bottom group starts hidden.
    expect(dock.classList.contains('sc-animating')).toBe(false)
    act(() => store.getState().run())
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    expect(dock.classList.contains('sc-animating')).toBe(true)
  })

  it('refuses to drag the editor out of its locked group', async () => {
    mount()
    await panelSection('Editor')
    const tab = editorTab()
    const drag = new Event('dragstart', { bubbles: true, cancelable: true })
    tab.dispatchEvent(drag)
    expect(drag.defaultPrevented).toBe(true)
    const other = screen.getByRole('tab', { name: 'Problemas' })
    const allowed = new Event('dragstart', { bubbles: true, cancelable: true })
    other.dispatchEvent(allowed)
    expect(allowed.defaultPrevented).toBe(false)
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
