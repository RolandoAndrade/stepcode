import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

const MONO = 'ui-monospace, "Cascadia Code", "Fira Code", Menlo, Consolas, monospace'

/**
 * Spec §8.2. One theme for both modes: every color is a token. `EditorView.darkTheme` travels
 * in its own compartment (extensions.ts), so this spec never takes `{ dark }`. It overrides the
 * codemirror package's base theme classes (breakpoints, current line) with the app's tokens.
 */
export const EDITOR_THEME_SPEC: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  '&': { backgroundColor: 'var(--sc-bg)', color: 'var(--sc-fg)', height: '100%' },
  '.cm-scroller': { fontFamily: MONO, lineHeight: '1.5' },
  '.cm-content': { caretColor: 'var(--sc-caret)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--sc-caret)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground':
    { backgroundColor: 'var(--sc-selection)' },
  '.cm-content ::selection': { backgroundColor: 'var(--sc-selection)' },
  '.cm-activeLine': { backgroundColor: 'var(--sc-line)' },
  '.cm-gutters': {
    backgroundColor: 'var(--sc-surface)',
    color: 'var(--sc-fg-muted)',
    borderRight: '1px solid var(--sc-border)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'var(--sc-line)', color: 'var(--sc-fg)' },
  '.cm-stepcode-breakpoint': { backgroundColor: 'var(--sc-breakpoint)' },
  '.cm-stepcode-current-line': { backgroundColor: 'var(--sc-current-line)' },
  '.cm-stepcode-current-line-marker': { borderLeftColor: 'var(--sc-warning)' },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--sc-error)',
  },
  '.cm-lintRange-warning': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--sc-warning)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--sc-surface-raised)',
    color: 'var(--sc-fg)',
    border: '1px solid var(--sc-border)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--sc-selection)',
    color: 'var(--sc-fg)',
  },
  '.cm-matchingBracket': { outline: '1px solid var(--sc-success)', backgroundColor: 'transparent' },
  '.cm-nonmatchingBracket': {
    outline: '1px solid var(--sc-error)',
    backgroundColor: 'transparent',
  },
}

export const appEditorTheme: Extension = EditorView.theme(EDITOR_THEME_SPEC)
