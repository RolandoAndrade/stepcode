import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RuntimeHost } from '../runtime/host'
import { readUrlOptions } from '../share/urlOptions'
import { StoreProvider } from '../store/context'
import { createEditorStore, type EditorStore } from '../store/store'
import { applyTheme, watchSystemTheme } from '../theme/theme'
import { allowRunWithWarnings, bootEmbed, forwardToasts } from './boot'
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
  allowRunWithWarnings(store)
  const stopForwarding = forwardToasts(store)
  if (urlOptions.theme === 'system') {
    watchSystemTheme((dark) => store.getState().setSystemDark(dark))
  }
  const options = createEmbedOptions(urlOptions)
  // The query string stays: a reload of the frame must show the same program (spec §2.1).
  await bootEmbed(store, options, url)
  render(root, store, options)
  const disposeBridge = createBridge(store, bridgeIo())
  // `pagehide`, not `unload`: a frame put in the back/forward cache is torn down through it and
  // the host page must stop hearing from a bridge that is no longer alive.
  window.addEventListener(
    'pagehide',
    () => {
      disposeBridge()
      stopForwarding()
    },
    { once: true },
  )
}

boot().catch((error: unknown) => {
  // Spec §3.5: the frame never renders blank.
  console.warn('The embed could not load its program; starting empty', error)
  const root = document.getElementById('root')
  if (root === null) return
  const store = createEditorStore(new RuntimeHost(), { applyTheme, initialSource: '' })
  allowRunWithWarnings(store)
  render(root, store, createEmbedOptions(readUrlOptions(new URL(window.location.href))))
})
