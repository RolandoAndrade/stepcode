import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../store/context'
import { nameWithExtension } from '../store/document'
import { stringsOf } from '../store/store'

/**
 * Spec §4.2: plain text until hovered or focused; Enter/blur commit, Escape reverts. The unsaved
 * mark is on the Save button, where the action that clears it is.
 */
export function Filename() {
  const strings = useEditorStore(stringsOf)
  const name = useEditorStore((s) => s.name)
  const setName = useEditorStore((s) => s.setName)
  const [draft, setDraft] = useState(name)
  useEffect(() => setDraft(name), [name])
  // Enter and Escape both call `blur()` synchronously, which fires the input's own onBlur
  // (commit) before React applies the state update they just queued. This flag makes that
  // blur-triggered commit a no-op: Enter already committed explicitly, and Escape's revert
  // must not be overwritten by a commit still reading the pre-revert draft.
  const skipNextCommitRef = useRef(false)
  const commit = (): void => {
    if (skipNextCommitRef.current) {
      skipNextCommitRef.current = false
      return
    }
    const next = nameWithExtension(draft)
    if (next === '') setDraft(name)
    else if (next !== name) setName(next)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
      skipNextCommitRef.current = true
      event.currentTarget.blur()
    }
    if (event.key === 'Escape') {
      setDraft(name)
      skipNextCommitRef.current = true
      event.currentTarget.blur()
    }
  }
  return (
    <span className="flex items-center gap-1 text-sm">
      <input
        aria-label={strings.toolbar.filename}
        value={draft}
        size={Math.min(32, Math.max(8, draft.length))}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className="rounded border border-transparent bg-transparent px-1 text-fg outline-none hover:border-border focus:border-accent"
      />
    </span>
  )
}
