// @vitest-environment happy-dom
// The preview iframe has a real `src`: without this, happy-dom fetches it over the network
// during `pnpm test`.
// @vitest-environment-options { "settings": { "disableIframePageLoading": true } }
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

const value = (element: HTMLElement): string => (element as HTMLTextAreaElement).value

async function openInsertar() {
  const { store } = storeWith({ dialog: 'share', name: 'tarea.stepcode' })
  const copied: string[] = []
  renderWithStore(
    <Share
      base="https://x.test/"
      origin="https://x.test/"
      clipboard={{ writeText: async (text) => void copied.push(text) }}
    />,
    store,
  )
  await waitFor(() =>
    expect(value(screen.getByLabelText('Enlace', { selector: 'input' }))).toContain('#code='),
  )
  act(() => {
    fireEvent.click(screen.getByRole('tab', { name: 'Insertar' }))
  })
  return { store, copied, snippet: () => value(screen.getByRole('textbox', { name: 'Insertar' })) }
}

describe('Share: the Insertar tab', () => {
  it('puts the document name in the hash so the embed can title itself', async () => {
    const { store } = storeWith({ dialog: 'share', name: 'tarea.stepcode' })
    renderWithStore(<Share base="https://x.test/" />, store)
    await waitFor(() =>
      expect(value(screen.getByLabelText('Enlace', { selector: 'input' }))).toContain('#code='),
    )
    const hash = value(screen.getByLabelText('Enlace', { selector: 'input' })).replace(
      'https://x.test/',
      '',
    )
    expect(await decodeShare(hash)).toMatchObject({ name: 'tarea.stepcode' })
  })

  it('builds a default snippet with no query and the default height', async () => {
    const { snippet } = await openInsertar()
    await waitFor(() => expect(snippet()).toContain('https://x.test/embed#code='))
    expect(snippet()).toContain('width="100%"')
    expect(snippet()).toContain('height="480"')
    expect(snippet()).toContain('title="tarea"')
    expect(snippet()).toContain('loading="lazy"')
  })

  it('writes each option into the URL as it is chosen', async () => {
    const { snippet } = await openInsertar()
    act(() => {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Solo lectura' }))
      fireEvent.click(screen.getByRole('checkbox', { name: 'Ejecutar al abrir' }))
      fireEvent.click(screen.getByRole('checkbox', { name: 'Depuración' }))
      fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar perfil' }))
    })
    await waitFor(() =>
      expect(snippet()).toContain('embed?readonly&amp;autorun&amp;debug&amp;showProfile#'),
    )
    act(() => {
      fireEvent.change(screen.getByLabelText('Tema'), { target: { value: 'dark' } })
    })
    await waitFor(() => expect(snippet()).toContain('&amp;theme=dark#'))
  })

  it('takes the height from the number field and keeps a floor', async () => {
    const { snippet } = await openInsertar()
    act(() => {
      fireEvent.change(screen.getByLabelText('Alto (px)'), { target: { value: '800' } })
    })
    await waitFor(() => expect(snippet()).toContain('height="800"'))
    act(() => {
      fireEvent.change(screen.getByLabelText('Alto (px)'), { target: { value: '10' } })
    })
    await waitFor(() => expect(snippet()).toContain('height="200"'))
  })

  it('keeps the last height while the field is empty', async () => {
    const { snippet } = await openInsertar()
    act(() => {
      fireEvent.change(screen.getByLabelText('Alto (px)'), { target: { value: '800' } })
    })
    await waitFor(() => expect(snippet()).toContain('height="800"'))
    act(() => {
      fireEvent.change(screen.getByLabelText('Alto (px)'), { target: { value: '' } })
    })
    await waitFor(() => expect(snippet()).toContain('height="800"'))
    expect(snippet()).not.toContain('height="0"')
  })

  it('previews the same URL, capped at 360 px', async () => {
    await openInsertar()
    act(() => {
      fireEvent.change(screen.getByLabelText('Alto (px)'), { target: { value: '800' } })
    })
    const frame = await waitFor(() => {
      const found = document.querySelector('iframe')
      if (found === null) throw new Error('no preview yet')
      return found
    })
    expect(frame.getAttribute('title')).toBe('Vista previa')
    expect(frame.getAttribute('height')).toBe('360')
    expect(frame.getAttribute('src') ?? '').toContain('https://x.test/embed#code=')
  })

  it('copies the snippet and the URL, each with its own confirmation', async () => {
    const { store, copied, snippet } = await openInsertar()
    await waitFor(() => expect(snippet()).toContain('<iframe'))
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }))
    })
    await waitFor(() => expect(copied[0]).toContain('<iframe'))
    await waitFor(() => expect(store.getState().toasts.at(-1)?.message).toBe('Código copiado'))
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar URL' }))
    })
    await waitFor(() => expect(copied[1]).toContain('https://x.test/embed'))
    expect(copied[1]).not.toContain('<iframe')
  })

  it('never previews an empty embed URL while the link is pending or failed', async () => {
    encodes.fail = true
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { store } = storeWith({ dialog: 'share', name: 'tarea.stepcode' })
    renderWithStore(<Share base="https://x.test/" origin="https://x.test/" />, store)
    act(() => {
      fireEvent.click(screen.getByRole('tab', { name: 'Insertar' }))
    })
    // Still pending, before the mocked encoder has even rejected: no iframe yet.
    expect(document.querySelector('iframe')).toBeNull()
    await waitFor(() => expect(encodes.count).toBe(1))
    // Let the rejection's `.catch` (and its `setHash('')`) settle before the test ends, so no
    // state update is left pending once the environment is torn down.
    await act(async () => {})
    // The encode failed, so the hash (and therefore the embed URL) never arrives.
    expect(document.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('img', { name: 'Vista previa' })).toBeDefined()
    warn.mockRestore()
  })

  it('switches tabs by keyboard, not just by clicking', async () => {
    const { store } = storeWith({ dialog: 'share', name: 'tarea.stepcode' })
    renderWithStore(<Share base="https://x.test/" origin="https://x.test/" />, store)
    const linkTab = screen.getByRole('tab', { name: 'Enlace' })
    act(() => linkTab.focus())
    act(() => {
      fireEvent.keyDown(linkTab, { key: 'ArrowRight', code: 'ArrowRight' })
    })
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Insertar' }).getAttribute('aria-selected')).toBe(
        'true',
      ),
    )
    expect(screen.getByRole('textbox', { name: 'Insertar' })).toBeDefined()
  })
})
