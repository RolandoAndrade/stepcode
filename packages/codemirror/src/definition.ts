import type { EditorState } from '@codemirror/state'
import { type Command, EditorView, type KeyBinding } from '@codemirror/view'
import { symbolAt } from './symbols'

/** The start of the declaration of the name at `pos`, or null (spec §5.10). */
export function definitionAt(state: EditorState, pos: number): number | null {
  return symbolAt(state, pos, 0)?.symbol.declaredAt.span.start ?? null
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
