// @vitest-environment happy-dom
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Share } from '../src/dialogs/Share'
import { decodeShare } from '../src/share/link'
import { renderWithStore, storeWith } from './render'

const encodes = vi.hoisted(() => ({ count: 0, fail: false }))

vi.mock('../src/share/link', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/share/link')>()
  return {
    ...actual,
    encodeShare: async (payload: Parameters<typeof actual.encodeShare>[0]) => {
      encodes.count += 1
      if (encodes.fail) throw new DOMException('Failed to read response body', 'AbortError')
      return actual.encodeShare(payload)
    },
  }
})

beforeEach(() => {
  encodes.count = 0
  encodes.fail = false
})

describe('Share', () => {
  it('shows the link, copies it and confirms', async () => {
    const { store } = storeWith({ dialog: 'share' })
    const copied: string[] = []
    renderWithStore(
      <Share
        clipboard={{
          writeText: async (t) => {
            copied.push(t)
          },
        }}
        base="https://x.test/"
      />,
      store,
    )
    const field = (await screen.findByRole('textbox', { name: 'Enlace' })) as HTMLInputElement
    await waitFor(() => expect(field.value).toContain('#code='))
    expect((await decodeShare(field.value.slice(field.value.indexOf('#'))))?.source).toBe(
      store.getState().source,
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    })
    expect(copied).toEqual([field.value])
    expect(store.getState().toasts.at(-1)?.message).toBe('Enlace copiado')
    expect(screen.getByRole('link', { name: 'Abrir en nueva pestaña' }).getAttribute('href')).toBe(
      field.value,
    )
  })

  it('deflates nothing while the dialog is closed', async () => {
    const { store } = storeWith({})
    renderWithStore(<Share base="https://x.test/" />, store)
    act(() => store.getState().setSource('Proceso B\nFinProceso\n'))
    await act(async () => {})
    expect(encodes.count).toBe(0)
    act(() => store.getState().openDialog('share'))
    await screen.findByRole('textbox', { name: 'Enlace' })
    await waitFor(() => expect(encodes.count).toBe(1))
  })

  it('leaves the link empty when the encode fails, without an unhandled rejection', async () => {
    encodes.fail = true
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { store } = storeWith({ dialog: 'share' })
    renderWithStore(<Share base="https://x.test/" />, store)
    const field = (await screen.findByRole('textbox', { name: 'Enlace' })) as HTMLInputElement
    await act(async () => {})
    expect(field.value).toBe('')
    expect(warn).toHaveBeenCalled()
    expect(store.getState().dialog).toBe('share')
    warn.mockRestore()
  })

  it('warns when the link is very long', async () => {
    const lines = Array.from({ length: 3000 }, (_, i) => `  Escribir '${(i * 7919) % 100003}';`)
    const { store } = storeWith({
      dialog: 'share',
      source: `Proceso A\n${lines.join('\n')}\nFinProceso\n`,
    })
    renderWithStore(<Share base="https://x.test/" />, store)
    expect(
      await screen.findByText('El enlace es muy largo; algunas aplicaciones lo recortan.'),
    ).toBeDefined()
  })
})
