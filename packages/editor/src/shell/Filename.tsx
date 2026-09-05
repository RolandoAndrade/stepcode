import { type KeyboardEvent, useEffect, useState } from 'react'
import { useEditorStore } from '../store/context'
import { nameWithExtension } from '../store/document'
import { isDirty, stringsOf } from '../store/store'

/** Spec §4.2: plain text until hovered or focused; Enter/blur commit, Escape reverts. */
export function Filename() {
  const strings = useEditorStore(stringsOf)
  const name = useEditorStore((s) => s.name)
  const dirty = useEditorStore(isDirty)
  const setName = useEditorStore((s) => s.setName)
  const [draft, setDraft] = useState(name)
  useEffect(() => setDraft(name), [name])
  const commit = (): void => {
    const next = nameWithExtension(draft)
    if (next === '') setDraft(name)
    else if (next !== name) setName(next)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
      event.currentTarget.blur()
    }
    if (event.key === 'Escape') {
      setDraft(name)
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
      {dirty ? (
        <span aria-hidden="true" className="text-muted">
          ●
        </span>
      ) : null}
    </span>
  )
}
