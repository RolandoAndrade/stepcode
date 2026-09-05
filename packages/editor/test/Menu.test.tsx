// @vitest-environment happy-dom
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Menu, menuModel } from '../src/shell/Menu'
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
  async function open() {
    cleanup()
    const { store } = storeWith({})
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
    await open()
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Acerca de' }))
  })

  it('Vista items request panels; reset resets the layout', async () => {
    const store = await open()
    const vista = await screen.findByRole('menuitem', { name: 'Vista' })
    fireEvent.pointerMove(vista)
    fireEvent.keyDown(vista, { key: 'ArrowRight' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Problemas' }))
    expect(store.getState().panelRequest?.id).toBe('problems')
  })
})
