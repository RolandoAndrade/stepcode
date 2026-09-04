import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

/** Spec §8: class hooks with a minimal look; hosts restyle by class. */
export const stepcodeBaseTheme: Extension = EditorView.baseTheme({
  '.cm-gutter.cm-stepcode-breakpoints': { minWidth: '1.4em', cursor: 'pointer' },
  '.cm-stepcode-breakpoints .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.1em',
  },
  '.cm-stepcode-breakpoint, .cm-stepcode-breakpoint-spacer': {
    width: '0.7em',
    height: '0.7em',
    borderRadius: '50%',
  },
  '.cm-stepcode-breakpoint': {
    backgroundColor: '#d33',
  },
  '.cm-stepcode-current-line-marker': {
    width: '0',
    height: '0',
    borderTop: '0.4em solid transparent',
    borderBottom: '0.4em solid transparent',
    borderLeft: '0.6em solid #d9a400',
  },
  '&light .cm-stepcode-current-line': { backgroundColor: 'rgba(255, 220, 0, 0.25)' },
  '&dark .cm-stepcode-current-line': { backgroundColor: 'rgba(255, 220, 0, 0.15)' },
  '.cm-tooltip .cm-stepcode-hover, .cm-tooltip .cm-stepcode-signature': {
    padding: '0.3em 0.5em',
    fontFamily: 'monospace',
  },
  '.cm-stepcode-signature-active': { fontWeight: 'bold' },
  '&light .cm-matchingBracket, &dark .cm-matchingBracket': {
    backgroundColor: 'transparent',
    outline: '1px solid #4a8',
  },
  '&light .cm-nonmatchingBracket, &dark .cm-nonmatchingBracket': {
    backgroundColor: 'transparent',
    outline: '1px solid #c44',
  },
})
