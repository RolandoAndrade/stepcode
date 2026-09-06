import { bracketMatching } from '@codemirror/language'
import type { Extension } from '@codemirror/state'

/**
 * Spec §5.5: the stock matcher. Keyword, parenthesis, and bracket pairs all come from the
 * `closedBy` / `openedBy` props on the leaves (spec §4.2); the `brackets` text config stays as
 * the fallback for text the tree does not type.
 */
export function stepcodeBlockMatching(): Extension {
  return bracketMatching({ brackets: '()[]' })
}
