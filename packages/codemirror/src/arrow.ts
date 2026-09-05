import { syntaxTree } from '@codemirror/language'
import type { EditorState, Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { ResolvedProfile } from '@stepcode/profiles'

const ARROW = '←'

/** The two nodes whose text is prose, where `<-` is just two characters (spec §4.3). */
const LITERAL_NODES = new Set(['String', 'Comment'])

function inLiteral(state: EditorState, at: number): boolean {
  let node = syntaxTree(state).resolveInner(at, -1)
  for (;;) {
    if (LITERAL_NODES.has(node.name)) return true
    const parent = node.parent
    if (parent === null) return false
    node = parent
  }
}

/**
 * Spec §5.11: typing the second character of `<-` writes `←` instead, so the document keeps the
 * spelling the profile prints while the keyboard keeps the one it can reach. Off for a profile
 * that does not spell the arrow, or that assigns with `=`.
 */
export function arrowInput(profile: ResolvedProfile): Extension {
  if (profile.options.assignWithEquals) return []
  if (!profile.operators.assign.includes(ARROW)) return []
  return EditorView.inputHandler.of((view, from, to, text) => {
    if (text !== '-' || from !== to || from === 0) return false
    if (view.state.sliceDoc(from - 1, from) !== '<') return false
    if (inLiteral(view.state, from)) return false
    view.dispatch({
      changes: { from: from - 1, to, insert: ARROW },
      selection: { anchor: from },
      userEvent: 'input.type',
      scrollIntoView: true,
    })
    return true
  })
}
