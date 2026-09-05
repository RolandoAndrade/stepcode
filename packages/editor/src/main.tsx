import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { RuntimeHost } from './runtime/host'
import { StoreProvider } from './store/context'
import { createEditorStore } from './store/store'
import { applyTheme, resolveInitialTheme } from './theme/theme'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Missing #root element')
}

// Spec §8.2: the theme is on the root before the first paint.
const initialTheme = resolveInitialTheme()
applyTheme(initialTheme)

// Spec §6: one host, one store, the store its only subscriber.
const store = createEditorStore(new RuntimeHost(), { applyTheme, initialTheme })

createRoot(root).render(
  <StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </StrictMode>,
)
