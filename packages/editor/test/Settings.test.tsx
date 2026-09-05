// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Settings } from '../src/dialogs/Settings/Settings'
import { renderWithStore, storeWith } from './render'

function open(section?: 'language' | 'editor' | 'execution' | 'appearance' | 'layout') {
  const { store } = storeWith({ dialog: 'settings' })
  renderWithStore(
    <Settings {...(section === undefined ? {} : { initialSection: section })} />,
    store,
  )
  return store
}

describe('Settings', () => {
  it('opens on the language section with a rail of five sections', () => {
    open()
    expect(screen.getByRole('dialog', { name: 'Ajustes' })).toBeDefined()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Lenguaje',
      'Editor',
      'Ejecución',
      'Apariencia',
      'Diseño',
    ])
    expect(screen.getByRole('radio', { name: /Español/ })).toBeDefined()
  })

  it('edits editor, execution, appearance and layout settings immediately', () => {
    const store = open('editor')
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Tamaño de letra' }), {
      target: { value: '16' },
    })
    expect(store.getState().settings.editor.fontSize).toBe(16)
    fireEvent.click(screen.getByRole('switch', { name: 'Ajustar líneas' }))
    expect(store.getState().settings.editor.wordWrap).toBe(true)
    fireEvent.click(screen.getByRole('tab', { name: 'Ejecución' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Limpiar la consola al ejecutar' }))
    expect(store.getState().settings.execution.clearConsoleOnRun).toBe(false)
    fireEvent.click(screen.getByRole('tab', { name: 'Apariencia' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Tema' }), { target: { value: 'dark' } })
    expect(store.getState().themePreference).toBe('dark')
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma de la interfaz' }), {
      target: { value: 'en' },
    })
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: 'Layout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset layout' }))
    expect(store.getState().layoutReset).toBe(1)
  })

  it('resets a section and closes on Escape', () => {
    const store = open('editor')
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Tamaño de letra' }), {
      target: { value: '18' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }))
    expect(store.getState().settings.editor.fontSize).toBe(14)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(store.getState().dialog).toBeNull()
  })

  it('switches profile and opens the builder', () => {
    const store = open()
    fireEvent.click(screen.getByRole('radio', { name: /English/ }))
    expect(store.getState().profileId).toBe('en')
    fireEvent.click(screen.getByRole('button', { name: 'Customize…' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDefined()
  })
})
