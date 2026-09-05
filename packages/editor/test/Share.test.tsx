// @vitest-environment happy-dom
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Share } from '../src/dialogs/Share'
import { decodeShare } from '../src/share/link'
import { renderWithStore, storeWith } from './render'

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
