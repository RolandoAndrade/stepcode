import type { EditorView } from '@codemirror/view'
import { useEditorStore } from '../../store/context'
import { profileOf, stringsOf } from '../../store/store'
import { insertSymbol, symbolKeys } from './symbols'

/** Spec §9: one scrollable row of profile-derived keys above the on-screen keyboard. */
export function SymbolBar({ view, visible }: { view: EditorView | null; visible: boolean }) {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  if (!visible || view === null) return null
  return (
    <div
      role="toolbar"
      aria-label={strings.mobile.symbols}
      className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-border border-t bg-surface px-2"
    >
      {symbolKeys(profile).map((key) => (
        <button
          // By id, not by label: two keys may print the same label (an assignment spelled with
          // a punctuation mark).
          key={key.id}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => insertSymbol(view, key.insert)}
          className="h-8 shrink-0 rounded bg-surface-raised px-3 font-mono text-sm"
        >
          {key.label}
        </button>
      ))}
    </div>
  )
}
