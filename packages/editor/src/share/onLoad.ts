import type { EditorStore } from '../store/store'
import { applyShareHash } from './link'

/** `replaceState` throws in a sandboxed frame or on an opaque origin; the program still loads. */
function dropHash(url: string): void {
  try {
    window.history.replaceState(null, '', url)
  } catch (error) {
    console.warn('The share link could not be removed from the address bar', error)
  }
}

export async function applyShareFromLocation(store: EditorStore): Promise<boolean> {
  return (await applyShareHash(store, window.location, dropHash)) !== null
}
