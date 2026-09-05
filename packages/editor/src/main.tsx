import { StrictMode } from 'react'
import { createRoot, type Root as ReactRoot } from 'react-dom/client'
import { App } from './App'
import { browserEnvironment } from './files/actions'
import { useUpdatePrompt } from './pwa/register'
import { UpdateToast } from './pwa/UpdateToast'
import { RuntimeHost } from './runtime/host'
import { loadFromLocation } from './share/onLoad'
import { StoreProvider } from './store/context'
import {
  applyDocument,
  applyPersisted,
  openDocumentStore,
  readDocument,
  readPersisted,
  type StorageLike,
  startDocumentPersisting,
  startPersisting,
} from './store/persist'
import { createEditorStore, type EditorStore } from './store/store'
import { applyTheme, watchSystemTheme } from './theme/theme'
import './index.css'

// One environment for the whole session: a new object on every render would reinstall the
// shortcuts and re-render the toolbar every time the update prompt changes.
const env = browserEnvironment()

function Root({ store }: { store: EditorStore }) {
  const { needRefresh, update } = useUpdatePrompt()
  return (
    <StoreProvider store={store}>
      <App env={env} />
      <UpdateToast needRefresh={needRefresh} update={update} />
    </StoreProvider>
  )
}

/**
 * Reading `localStorage` — the property itself, before any call — throws where the user agent
 * blocks storage: third-party cookies off, a sandboxed iframe, private browsing on some
 * platforms. The editor still runs there; it just does not remember anything.
 */
function storageOrNull(): StorageLike | null {
  try {
    return window.localStorage
  } catch (error) {
    console.warn('Storage is unavailable; settings will not be remembered', error)
    return null
  }
}

const roots = new Set<ReactRoot>()

/** Tests mount the real app through this module; they unmount it before their environment ends. */
export function unmountAll(): void {
  for (const root of roots) root.unmount()
  roots.clear()
}

function render(root: HTMLElement, store: EditorStore): void {
  const reactRoot = createRoot(root)
  roots.add(reactRoot)
  reactRoot.render(
    <StrictMode>
      <Root store={store} />
    </StrictMode>,
  )
}

/** Spec §7: settings, then the document, then the URL — persistence starts after all three. */
async function boot(): Promise<void> {
  const root = document.getElementById('root')
  if (!root) throw new Error('Missing #root element')
  const storage = storageOrNull()
  const persisted = storage === null ? null : readPersisted(storage)
  const store = createEditorStore(new RuntimeHost(), {
    applyTheme,
    initialTheme: persisted?.settings.appearance.theme ?? 'system',
  })
  if (persisted !== null) applyPersisted(store, persisted)
  watchSystemTheme((dark) => store.getState().setSystemDark(dark))
  const idb = openDocumentStore()
  const doc = await readDocument(idb)
  if (doc !== null) applyDocument(store, doc)
  await loadFromLocation(store)
  if (storage !== null) startPersisting(store, storage)
  startDocumentPersisting(store, idb)
  render(root, store)
}

boot().catch((error: unknown) => {
  // Whatever went wrong, an empty page is the one outcome the editor must never produce.
  console.warn('The editor could not restore its state; starting a fresh document', error)
  const root = document.getElementById('root')
  if (root !== null) render(root, createEditorStore(new RuntimeHost(), { applyTheme }))
})
