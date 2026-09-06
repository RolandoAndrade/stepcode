import { createStore, type StoreApi } from 'zustand/vanilla'
import type { UrlOptions } from '../share/urlOptions'

/**
 * Spec §3.1: the embed's chrome options, deliberately outside the editor store so the persisted
 * state schema does not change. `title` is filled in by the boot sequence once the program's
 * source is known (spec §3.3).
 */
export interface EmbedState {
  readonly readOnly: boolean
  readonly showProfile: boolean
  readonly debug: boolean
  readonly title: string | null
  setTitle(title: string | null): void
}

export type EmbedOptionsStore = StoreApi<EmbedState>

export function createEmbedOptions(options: UrlOptions): EmbedOptionsStore {
  return createStore<EmbedState>((set) => ({
    readOnly: options.readonly,
    showProfile: options.showProfile,
    debug: options.debug,
    title: options.title,
    setTitle: (title) => set({ title }),
  }))
}
