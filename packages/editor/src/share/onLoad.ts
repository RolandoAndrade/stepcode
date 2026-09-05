import type { EditorStore } from '../store/store'
import { applyShareHash } from './link'

export function applyShareFromLocation(store: EditorStore): Promise<boolean> {
  return applyShareHash(store, window.location, (url) => window.history.replaceState(null, '', url))
}
