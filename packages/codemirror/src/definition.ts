import type { EditorState } from '@codemirror/state'
import { type Command, EditorView, type KeyBinding } from '@codemirror/view'
import { symbolAt } from './symbols'

/** The start of the declaration of the name at `pos`, or null (spec §5.10). */
export function definitionAt(state: EditorState, pos: number): number | null {
  const found = symbolAt(state, pos, 0)
  // §5.10 resolves the name as §5.9 does, and §5.9 says nothing about a recovery symbol: it is
  // declared at the very use that named it (language spec §3.2), so jumping there would move
  // nowhere while reporting success — and a command that returns true swallows the key.
  if (found === null || found.symbol.recovered === true) return null
  return found.symbol.declaredAt.span.start
}

export const goToDefinition: Command = (view) => {
  const target = definitionAt(view.state, view.state.selection.main.head)
  if (target === null) return false
  view.dispatch({
    selection: { anchor: target },
    effects: EditorView.scrollIntoView(target, { y: 'center' }),
  })
  return true
}

/** F12 only; a mouse gesture is the host's choice (spec §5.10). */
export const stepcodeKeymap: readonly KeyBinding[] = [{ key: 'F12', run: goToDefinition }]
