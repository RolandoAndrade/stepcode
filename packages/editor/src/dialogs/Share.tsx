import { useEffect, useState } from 'react'
import { encodeShare, SHARE_WARN_LENGTH, shareUrl } from '../share/link'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { stringsOf } from '../store/store'
import { Dialog } from './Dialog'

interface Clipboard {
  writeText(text: string): Promise<void>
}

/** Spec §8.5: the current program encoded into a shareable, self-contained link. */
export function Share({ clipboard, base }: { clipboard?: Clipboard; base?: string }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const source = useEditorStore((s) => s.source)
  const profileId = useEditorStore((s) => s.profileId)
  const open = useEditorStore((s) => s.dialog === 'share')
  const [hash, setHash] = useState('')

  // The dialog host keeps this component mounted for the whole session; without the gate every
  // keystroke in the editor would deflate the whole program again.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    encodeShare({ source, profileId }).then((next) => {
      if (!cancelled) setHash(next)
    })
    return () => {
      cancelled = true
    }
  }, [open, source, profileId])

  const url = hash === '' ? '' : shareUrl(hash, base)

  const copy = async (): Promise<void> => {
    await (clipboard ?? navigator.clipboard).writeText(url)
    store.getState().notify(strings.share.copied)
  }

  return (
    <Dialog name="share" title={strings.share.title}>
      <input
        type="text"
        readOnly
        aria-label={strings.share.link}
        value={url}
        className="h-8 w-full rounded border border-border bg-surface-raised px-2 text-sm"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="h-8 rounded bg-accent px-3 text-sm text-bg hover:opacity-90"
        >
          {strings.share.copy}
        </button>
        <a href={url} target="_blank" rel="noreferrer" className="text-accent text-sm underline">
          {strings.share.open}
        </a>
      </div>
      <p className="mt-3 text-muted text-xs">{strings.share.note}</p>
      {url.length > SHARE_WARN_LENGTH ? (
        <p className="mt-2 text-warning text-xs">{strings.share.tooLong}</p>
      ) : null}
    </Dialog>
  )
}
