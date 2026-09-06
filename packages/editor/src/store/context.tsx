import { createContext, type ReactNode, useContext } from 'react'
import { useStore } from 'zustand'
import type { EditorStore, StoreState } from './store'

const StoreContext = createContext<EditorStore | null>(null)

export function StoreProvider({ store, children }: { store: EditorStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

/** The store itself, for imperative access (actions, `getState`, `subscribe`). */
export function useEditorStoreApi(): EditorStore {
  const store = useContext(StoreContext)
  if (store === null) throw new Error('useEditorStore needs a StoreProvider')
  return store
}

/** A slice of state; re-renders when the selected value changes. */
export function useEditorStore<T>(selector: (state: StoreState) => T): T {
  return useStore(useEditorStoreApi(), selector)
}
