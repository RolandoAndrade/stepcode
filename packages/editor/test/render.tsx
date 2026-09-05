import { type RenderResult, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { StoreProvider } from '../src/store/context'
import { createEditorStore, type EditorStore, type StoreState } from '../src/store/store'
import { FakeHost } from './fake-host'

export function storeWith(
  partial: Partial<StoreState> = {},
  host: FakeHost = new FakeHost(),
): { store: EditorStore; host: FakeHost } {
  const store = createEditorStore(host, { initialTheme: 'light' })
  store.setState(partial)
  return { store, host }
}

export function renderWithStore(ui: ReactElement, store: EditorStore): RenderResult {
  return render(<StoreProvider store={store}>{ui}</StoreProvider>)
}
