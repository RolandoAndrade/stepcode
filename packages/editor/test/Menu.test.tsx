// @vitest-environment happy-dom
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Menu, menuModel } from '../src/shell/Menu'
import type { EditorStore } from '../src/store/store'
import { stringsFor } from '../src/strings'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('menuModel', () => {
  it('lists the spec tree in order with separators and submenus', () => {
    const { store } = storeWith({})
    const model = menuModel(store, env, stringsFor('es'))
    expect(model.map((e) => (e.kind === 'separator' ? '—' : e.label))).toEqual([
      'Nuevo',
      'Abrir…',
      'Guardar',
      'Guardar como…',
      '—',
      'Ejemplos…',
      'Compartir…',
      '—',
      'Perfil',
      'Vista',
      '—',
      'Ajustes…',
      'Acerca de',
    ])
    const view = model.find((e) => e.kind === 'submenu' && e.label === 'Vista')
    expect(
      view?.kind === 'submenu' && view.items.map((i) => (i.kind === 'item' ? i.label : '—')),
    ).toEqual(['Consola', 'Problemas', 'Variables', '—', 'Restablecer diseño'])
  })
})

describe('Menu', () => {
  async function open(existing?: EditorStore) {
    cleanup()
    const store = existing ?? storeWith({}).store
    renderWithStore(
      <TooltipProvider>
        <Menu env={env} />
      </TooltipProvider>,
      store,
    )
    const trigger = screen.getByRole('button', { name: 'Menú' })
    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })
    return store
  }

  it('opens dialogs and dispatches actions', async () => {
    const store = await open()
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ajustes…' }))
    expect(store.getState().dialog).toBe('settings')
    await open(store)
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Acerca de' }))
    expect(store.getState().dialog).toBe('about')
  })

  it('Vista items request panels; reset resets the layout', async () => {
    const store = await open()
    const vista = await screen.findByRole('menuitem', { name: 'Vista' })
    fireEvent.pointerMove(vista)
    fireEvent.keyDown(vista, { key: 'ArrowRight' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Problemas' }))
    expect(store.getState().panelRequest?.id).toBe('problems')
    await open(store)
    const resetLayout = store.getState().layoutReset
    const vista2 = await screen.findByRole('menuitem', { name: 'Vista' })
    fireEvent.pointerMove(vista2)
    fireEvent.keyDown(vista2, { key: 'ArrowRight' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Restablecer diseño' }))
    expect(store.getState().layoutReset).toBe(resetLayout + 1)
  })

  it('stays current when the profile changes without changing the UI locale', async () => {
    const store = await open()
    const profile = await screen.findByRole('menuitem', { name: 'Perfil' })
    fireEvent.pointerMove(profile)
    fireEvent.keyDown(profile, { key: 'ArrowRight' })
    expect(
      (await screen.findByRole('menuitem', { name: 'Español' })).querySelector('svg'),
    ).not.toBeNull()
    expect(screen.getByRole('menuitem', { name: 'PSeInt' }).querySelector('svg')).toBeNull()
    // Same mount, no remount: the model must recompute on its own without a UI-locale change.
    act(() => store.getState().setProfile('pseint'))
    expect(screen.getByRole('menuitem', { name: 'PSeInt' }).querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('menuitem', { name: 'Español' }).querySelector('svg')).toBeNull()
  })
})
