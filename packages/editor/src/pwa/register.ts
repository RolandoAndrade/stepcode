import { useRegisterSW } from 'virtual:pwa-register/react'

/** Spec §10: `prompt` registration — the app decides when to reload. */
export function useUpdatePrompt(): { needRefresh: boolean; update: () => void } {
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  return { needRefresh: needRefresh[0], update: () => void updateServiceWorker(true) }
}
