import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { browserEnvironment } from './files/actions'
import { useUpdatePrompt } from './pwa/register'
import { UpdateToast } from './pwa/UpdateToast'
import { RuntimeHost } from './runtime/host'
import { applyShareFromLocation } from './share/onLoad'
import { StoreProvider } from './store/context'
import {
  applyDocument,
  applyPersisted,
  openDocumentStore,
  readDocument,
  readPersisted,
  startDocumentPersisting,
  startPersisting,
} from './store/persist'
import { createEditorStore, type EditorStore } from './store/store'
import { applyTheme, watchSystemTheme } from './theme/theme'
import './index.css'

function Root({ store }: { store: EditorStore }) {
  const { needRefresh, update } = useUpdatePrompt()
  return (
    <StoreProvider store={store}>
      <App env={browserEnvironment()} />
      <UpdateToast needRefresh={needRefresh} update={update} />
    </StoreProvider>
  )
}

/** Spec §7: settings, then the document, then a share link — persistence starts after all three. */
async function boot(): Promise<void> {
  const root = document.getElementById('root')
  if (!root) throw new Error('Missing #root element')
  const persisted = readPersisted(localStorage)
  const store = createEditorStore(new RuntimeHost(), {
    applyTheme,
    initialTheme: persisted?.settings.appearance.theme ?? 'system',
  })
  if (persisted !== null) applyPersisted(store, persisted)
  watchSystemTheme((dark) => store.getState().setSystemDark(dark))
  const idb = openDocumentStore()
  const doc = await readDocument(idb)
  if (doc !== null) applyDocument(store, doc)
  await applyShareFromLocation(store)
  startPersisting(store, localStorage)
  startDocumentPersisting(store, idb)
  createRoot(root).render(
    <StrictMode>
      <Root store={store} />
    </StrictMode>,
  )
}

void boot()
