// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  buildInput,
  ProfileBuilder,
  slugify,
  textToSpellings,
  validateInput,
} from '../src/dialogs/Settings/ProfileBuilder'
import { renderWithStore, storeWith } from './render'

describe('builder helpers', () => {
  it('slugifies names and splits spellings', () => {
    expect(slugify('Mi Perfil Ñu')).toBe('mi-perfil-nu')
    expect(textToSpellings(' Escribir , Mostrar ,, ')).toEqual(['Escribir', 'Mostrar'])
    expect(textToSpellings('')).toEqual([])
  })

  it('builds an extending input with only the changed sections', () => {
    const input = buildInput({
      id: 'mio',
      base: 'es',
      keywords: { write: ['Di'] },
      types: {},
      operators: {},
      builtins: {},
      options: { indexBase: 0 },
    })
    expect(input).toEqual({
      id: 'mio',
      extends: 'es',
      keywords: { write: ['Di'] },
      options: { indexBase: 0 },
    })
  })

  it('validates through resolveProfile and rejects duplicates', () => {
    expect(validateInput({ id: 'mio', extends: 'es' }, []).ok).toBe(true)
    expect(validateInput({ id: 'mio', extends: 'es', keywords: { write: ['a;b'] } }, []).ok).toBe(
      false,
    )
    expect(validateInput({ id: 'es', extends: 'en' }, []).ok).toBe(false)
    expect(validateInput({ id: 'mio', extends: 'es' }, [{ id: 'mio', extends: 'en' }]).ok).toBe(
      false,
    )
  })
})

describe('ProfileBuilder', () => {
  it('previews live, saves a valid profile and activates it', async () => {
    const { store } = storeWith({})
    let done = 0
    renderWithStore(<ProfileBuilder base="es" onDone={() => done++} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), {
      target: { value: 'Mi Perfil' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'write' }), {
      target: { value: 'Di, Escribir' },
    })
    expect(screen.getByRole('region', { name: 'Vista previa' }).textContent).toContain('Di ')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))
    })
    expect(store.getState().customProfiles.map((p) => p.id)).toEqual(['mi-perfil'])
    expect(store.getState().profileId).toBe('mi-perfil')
    expect(done).toBe(1)
  })

  it('shows the resolver error and keeps Guardar disabled', () => {
    const { store } = storeWith({})
    renderWithStore(<ProfileBuilder base="es" onDone={() => {}} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'x' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'write' }), { target: { value: '1abc' } })
    expect(screen.getByRole('alert').textContent).toContain('Perfil inválido')
    expect(
      (screen.getByRole('button', { name: 'Guardar perfil' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('lets the author pick the base and re-reads the spellings from it', () => {
    const { store } = storeWith({})
    renderWithStore(<ProfileBuilder base="es" onDone={() => {}} />, store)
    const write = screen.getByRole('textbox', { name: 'write' }) as HTMLInputElement
    expect(write.value).toBe('Escribir, Mostrar, Imprimir')
    fireEvent.change(screen.getByRole('combobox', { name: 'Basado en' }), {
      target: { value: 'en' },
    })
    expect(write.value).toBe('Write, Print')
  })

  it('shows a spelling list exactly as it is typed, comma by comma', async () => {
    const { store } = storeWith({})
    renderWithStore(<ProfileBuilder base="es" onDone={() => {}} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Mio' } })
    const write = screen.getByRole('textbox', { name: 'write' }) as HTMLInputElement
    // A trailing comma is how a second spelling starts; it must survive the keystroke.
    fireEvent.change(write, { target: { value: 'Escribir,' } })
    expect(write.value).toBe('Escribir,')
    fireEvent.change(write, { target: { value: 'Escribir, Mostrar' } })
    expect(write.value).toBe('Escribir, Mostrar')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))
    })
    const saved = store.getState().customProfiles[0] as unknown as {
      keywords?: Record<string, readonly string[]>
    }
    expect(saved.keywords?.write).toEqual(['Escribir', 'Mostrar'])
  })

  it('diffs the spellings one by one, not as one joined string', async () => {
    const { store } = storeWith({})
    renderWithStore(<ProfileBuilder base="es" onDone={() => {}} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Mio' } })
    // "De Otro Modo" is one spelling; "De, Otro, Modo" is three.
    fireEvent.change(screen.getByRole('textbox', { name: 'otherwise' }), {
      target: { value: 'De, Otro, Modo' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))
    })
    const saved = store.getState().customProfiles[0] as unknown as {
      keywords?: Record<string, readonly string[]>
    }
    expect(saved.keywords?.otherwise).toEqual(['De', 'Otro', 'Modo'])
  })

  it('explains an unusable name instead of printing the sentinel', () => {
    const { store } = storeWith({})
    renderWithStore(<ProfileBuilder base="es" onDone={() => {}} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: '###' } })
    const alert = screen.getByRole('alert').textContent ?? ''
    expect(alert).toBe('Solo letras, números y guiones')
  })

  it('edits a profile that extends "en" without rebasing it onto the `base` prop', async () => {
    const editing = { id: 'mio2', extends: 'en', locale: 'en-GB', keywords: { write: ['Say'] } }
    const { store } = storeWith({ customProfiles: [editing] })
    // `base="es"` here is deliberately wrong: editing a custom profile must always rebase on
    // its own `extends`, never on whatever `base` the caller happened to pass.
    renderWithStore(<ProfileBuilder base="es" editing={editing} onDone={() => {}} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'write' }), { target: { value: 'Tell' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))
    })
    const saved = store.getState().customProfiles.find((p) => p.id === 'mio2')
    expect(saved).toEqual({
      id: 'mio2',
      extends: 'en',
      locale: 'en-GB',
      keywords: { write: ['Tell'] },
    })
  })
})
