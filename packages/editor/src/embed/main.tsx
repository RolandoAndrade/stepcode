import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RuntimeHost } from '../runtime/host'
import type { LoadOutcome } from '../share/load'
import { bootFromUrl } from '../share/onLoad'
import { readUrlOptions, type UrlOptions } from '../share/urlOptions'
import { StoreProvider } from '../store/context'
import { displayName } from '../store/document'
import { appendOutput } from '../store/output'
import { createEditorStore, type EditorStore } from '../store/store'
import { applyTheme, watchSystemTheme } from '../theme/theme'
import { type BridgeIo, createBridge, type Outbound } from './bridge'
import { EmbedApp } from './EmbedApp'
import { createEmbedOptions, type EmbedOptionsStore } from './options'
import '../index.css'

/** Spec §4: the parent gets everything; a frame opened on its own posts nowhere. */
function bridgeIo(): BridgeIo {
  return {
    post: (message: Outbound) => {
      if (window.parent !== window) window.parent.postMessage(message, '*')
    },
    listen: (handler) => {
      const onMessage = (event: MessageEvent): void => handler(event.data)
      window.addEventListener('message', onMessage)
      return () => window.removeEventListener('message', onMessage)
    },
  }
}

/** Spec §3.1: no Toaster in the frame, so every message is a console line. */
function note(store: EditorStore, text: string): void {
  store.setState((s) => ({ output: appendOutput(s.output, [`${text}\n`]) }))
}

/** Spec §3.3: `title=`, then the hash's name, then the example's title, then the file name. */
function titleFor(options: UrlOptions, outcome: LoadOutcome): string | null {
  if (options.title !== null) return options.title
  if (outcome.kind !== 'loaded' || outcome.title === null) return null
  return outcome.from === 'hash' ? displayName(outcome.title) : outcome.title
}

function render(root: HTMLElement, store: EditorStore, options: EmbedOptionsStore): void {
  createRoot(root).render(
    <StrictMode>
      <StoreProvider store={store}>
        <EmbedApp options={options} />
      </StoreProvider>
    </StrictMode>,
  )
}

async function boot(): Promise<void> {
  const root = document.getElementById('root')
  if (root === null) throw new Error('Missing #root element')
  const url = new URL(window.location.href)
  const urlOptions = readUrlOptions(url)
  // No localStorage, no IndexedDB, no service worker: the frame starts empty every time.
  const store = createEditorStore(new RuntimeHost(), {
    applyTheme,
    initialTheme: urlOptions.theme,
    initialSource: '',
  })
  if (urlOptions.theme === 'system') {
    watchSystemTheme((dark) => store.getState().setSystemDark(dark))
  }
  const options = createEmbedOptions(urlOptions)
  // The query string stays: a reload of the frame must show the same program (spec §2.1).
  // `bootFromUrl` applies `?profile=` and `?lang=` before loading, so the failure below is
  // already phrased in the locale the URL asked for.
  const { outcome, message } = await bootFromUrl(store, url)
  if (message !== null) note(store, message)
  options.getState().setTitle(titleFor(urlOptions, outcome))
  render(root, store, options)
  createBridge(store, bridgeIo())
  if (urlOptions.autorun && outcome.kind === 'loaded') store.getState().run()
}

boot().catch((error: unknown) => {
  // Spec §3.5: the frame never renders blank.
  console.warn('The embed could not load its program; starting empty', error)
  const root = document.getElementById('root')
  if (root === null) return
  const store = createEditorStore(new RuntimeHost(), { applyTheme, initialSource: '' })
  render(root, store, createEmbedOptions(readUrlOptions(new URL(window.location.href))))
})
