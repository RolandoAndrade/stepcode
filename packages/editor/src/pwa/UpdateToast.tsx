import { useEditorStore } from '../store/context'
import { stringsOf } from '../store/store'

export function UpdateToast({ needRefresh, update }: { needRefresh: boolean; update: () => void }) {
  const strings = useEditorStore(stringsOf)
  if (!needRefresh) return null
  return (
    <output className="fixed right-4 bottom-8 z-modal flex items-center gap-3 rounded-md bg-surface-raised px-3 py-2 text-fg text-sm shadow-panel">
      {strings.pwa.updateAvailable}
      <button type="button" className="rounded bg-accent px-2 py-1 text-bg" onClick={update}>
        {strings.pwa.reload}
      </button>
    </output>
  )
}
