import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

const MONO = 'ui-monospace, "Cascadia Code", "Fira Code", Menlo, Consolas, monospace'

/**
 * Spec §8.2. One theme for both modes: every color is a token. `EditorView.darkTheme` travels
 * in its own compartment (extensions.ts), so this spec never takes `{ dark }`. It overrides the
 * codemirror package's base theme classes (breakpoints, current line) with the app's tokens.
 */
/** A style-mod spec: rules, plus the `@keyframes` and `@media` blocks that nest more rules. */
export interface EditorThemeSpec {
  readonly [key: string]: string | EditorThemeSpec
}

export const EDITOR_THEME_SPEC: Readonly<Record<string, EditorThemeSpec>> = {
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
  // Three digits fit without the gutter resizing under the editor as a program grows past
  // line 9, and the fold chevron sits on the middle of the line box instead of on its baseline.
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '3ch' },
  '.cm-foldGutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
  },
  '.cm-gutter.cm-stepcode-breakpoints': { minWidth: '1.2em' },
  // The lint gutter is a dot, not a badge: CodeMirror's 1.4em column with a 1em SVG marker is
  // wider than the numbers beside it.
  '.cm-gutter.cm-gutter-lint': { minWidth: '0.8em' },
  '.cm-gutter-lint .cm-gutterElement': {
    padding: '0 0.1em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '.cm-lint-marker': {
    position: 'relative',
    width: '0.6em',
    height: '0.6em',
    borderRadius: '50%',
    backgroundImage: 'none',
    backgroundColor: 'currentColor',
  },
  '.cm-lint-marker-error': { color: 'var(--sc-error)' },
  '.cm-lint-marker-warning': { color: 'var(--sc-warning)' },
  // A ring expanding out of the dot: a problem that appears while you type is easy to miss in
  // a narrow gutter otherwise.
  '.cm-lint-marker::after': {
    content: '""',
    position: 'absolute',
    inset: '0',
    borderRadius: '50%',
    border: '1px solid currentColor',
    animation: 'sc-lint-pulse 1.6s ease-out infinite',
  },
  '@keyframes sc-lint-pulse': {
    from: { transform: 'scale(1)', opacity: '0.6' },
    to: { transform: 'scale(2.4)', opacity: '0' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.cm-lint-marker::after': { animation: 'none' },
  },
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
