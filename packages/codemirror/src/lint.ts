import { syntaxTree } from '@codemirror/language'
import { type Diagnostic, linter } from '@codemirror/lint'
import type { EditorState, Extension } from '@codemirror/state'
import { formatDiagnostic, type Span } from 'stepcode'
import type { StepcodeOptions } from './options'
import { treeDataAt } from './parser'
import { stringsFor } from './strings'

/**
 * Spec §5.2: a zero-width span is widened one character to the right, or to the left at the
 * end of its line, so the squiggle is visible; an empty line or document stays empty.
 */
export function widen(state: EditorState, span: Span): { from: number; to: number } {
  if (span.end > span.start) return { from: span.start, to: span.end }
  const line = state.doc.lineAt(span.start)
  if (span.start < line.to) return { from: span.start, to: span.start + 1 }
  if (span.start > line.from) return { from: span.start - 1, to: span.start }
  return { from: span.start, to: span.start }
}

/** The tree's compile diagnostics as CodeMirror diagnostics; empty before the first parse. */
export function stepcodeDiagnostics(
  state: EditorState,
  options: StepcodeOptions,
): readonly Diagnostic[] {
  const data = treeDataAt(state)
  if (data === null) return []
  const strings = stringsFor(options.locale)
  return data.result.diagnostics.map((diagnostic) => {
    const { from, to } = widen(state, diagnostic.span)
    const base: Diagnostic = {
      from,
      to,
      severity: diagnostic.severity,
      source: diagnostic.code,
      message: formatDiagnostic(diagnostic, options.locale, options.profile),
    }
    const suggestion = diagnostic.data.suggestion
    if (typeof suggestion !== 'string') return base
    return {
      ...base,
      actions: [
        {
          name: strings.replaceWith(suggestion),
          apply: (view, actionFrom, actionTo) => {
            view.dispatch({ changes: { from: actionFrom, to: actionTo, insert: suggestion } })
          },
        },
      ],
    }
  })
}

/** Lint from the tree, re-run after every completed parse. */
export function stepcodeLint(options: StepcodeOptions): Extension {
  return linter((view) => stepcodeDiagnostics(view.state, options), {
    delay: 250,
    needsRefresh: (update) => syntaxTree(update.state) !== syntaxTree(update.startState),
  })
}
