// @vitest-environment happy-dom
import { forceParsing, highlightingFor, syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { breakpointLines, stepcodeDiagnostics } from '@stepcode/codemirror'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  createExtensions,
  darkExtension,
  languageExtension,
  readOnlyExtension,
} from '../src/editor/extensions'
import { HIGHLIGHT_SPECS } from '../src/editor/highlight'
import { EDITOR_THEME_SPEC } from '../src/editor/theme'

const PROGRAM = [
  'Proceso p',
  '  Definir a Como Entero;',
  '  a <- 1;',
  '  Escribir a;',
  'FinProceso',
].join('\n')

function viewFor(doc = PROGRAM) {
  const { extensions, compartments } = createExtensions({
    profile: profiles.es,
    locale: 'es',
    readOnly: false,
    dark: false,
  })
  const view = new EditorView({
    parent: document.body,
    state: EditorState.create({ doc, extensions }),
  })
  forceParsing(view, view.state.doc.length, 1e9)
  return { view, compartments }
}

function values(spec: unknown): string[] {
  const out: string[] = []
  // `seen` is cycle safety only, not a semantic filter: Lezer's `Tag.set` contains the tag
  // itself, so a plain recursive walk over HIGHLIGHT_SPECS would revisit the same Tag forever
  // and overflow the stack. Skipping an already-visited object breaks that cycle without
  // changing which strings get collected from the plain data we actually care about.
  const seen = new Set<object>()
  const visit = (node: unknown): void => {
    if (typeof node === 'string') out.push(node)
    else if (Array.isArray(node)) node.forEach(visit)
    else if (node !== null && typeof node === 'object') {
      if (seen.has(node)) return
      seen.add(node)
      Object.values(node).forEach(visit)
    }
  }
  visit(spec)
  return out
}

/** Non-color CSS keywords a colorish-named property may legitimately hold instead of a token. */
const COLOR_KEYWORDS = new Set(['none', 'transparent', 'unset', 'inherit'])

describe('tokens only', () => {
  it('colors the highlight style and the editor theme through var(--sc-…)', () => {
    const colorish = /color|background|border|outline|decoration/i
    for (const spec of HIGHLIGHT_SPECS) {
      for (const [key, value] of Object.entries(spec)) {
        if (key === 'tag') continue
        if (colorish.test(key) || key === 'textDecoration') {
          if (COLOR_KEYWORDS.has(String(value))) continue
          expect(String(value)).toContain('var(--sc-')
        }
      }
    }
    for (const [selector, rules] of Object.entries(EDITOR_THEME_SPEC)) {
      for (const [property, value] of Object.entries(rules)) {
        if (colorish.test(property)) {
          if (COLOR_KEYWORDS.has(String(value))) continue
          expect(String(value), `${selector} ${property}`).toContain('var(--sc-')
        }
      }
    }
    for (const value of [...values(HIGHLIGHT_SPECS), ...values(EDITOR_THEME_SPEC)]) {
      expect(value).not.toMatch(/#[0-9a-fA-F]{3,6}\b|\brgba?\(/)
    }
  })

  it('clears the vendor lint squiggle so lint marks stay token-driven', () => {
    expect(EDITOR_THEME_SPEC['.cm-lintRange-error']?.backgroundImage).toBe('none')
    expect(EDITOR_THEME_SPEC['.cm-lintRange-warning']?.backgroundImage).toBe('none')
  })
})

describe('createExtensions', () => {
  it('installs line numbers, the lint gutter, the debug gutter, and the language', () => {
    const { view } = viewFor()
    expect(view.dom.querySelector('.cm-lineNumbers')).not.toBeNull()
    expect(view.dom.querySelector('.cm-gutter-lint')).not.toBeNull()
    expect(view.dom.querySelector('.cm-stepcode-breakpoints')).not.toBeNull()
    expect(syntaxTree(view.state).topNode.name).toBe('Program')
    expect(breakpointLines(view.state)).toEqual([])
    expect(stepcodeDiagnostics(view.state, { profile: profiles.es, locale: 'es' })).toEqual([])
    view.destroy()
  })

  it('assigns distinct classes to keywords, strings, builtins, and plain identifiers', () => {
    const { view } = viewFor()
    const classes = [
      t.controlKeyword,
      t.string,
      t.function(t.standard(t.variableName)),
      t.variableName,
    ].map((tag) => highlightingFor(view.state, [tag]))
    for (const cls of classes) expect(cls).not.toBeNull()
    expect(new Set(classes).size).toBe(4)
    expect(highlightingFor(view.state, [t.function(t.variableName)])).not.toBe(
      highlightingFor(view.state, [t.variableName]),
    )
    view.destroy()
  })

  it('toggles read-only and editable through the compartment', () => {
    const { view, compartments } = viewFor()
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
    expect(view.state.facet(EditorView.editable)).toBe(true)
    view.dispatch({ effects: compartments.readOnly.reconfigure(readOnlyExtension(true)) })
    expect(view.state.facet(EditorState.readOnly)).toBe(true)
    expect(view.state.facet(EditorView.editable)).toBe(false)
    view.destroy()
  })

  it('toggles the dark facet through the compartment', () => {
    const { view, compartments } = viewFor()
    expect(view.state.facet(EditorView.darkTheme)).toBe(false)
    view.dispatch({ effects: compartments.dark.reconfigure(darkExtension(true)) })
    expect(view.state.facet(EditorView.darkTheme)).toBe(true)
    view.destroy()
  })

  it('switches the language profile through the compartment', () => {
    const { view, compartments } = viewFor()
    view.dispatch({
      effects: compartments.language.reconfigure(languageExtension(profiles.en, 'en')),
    })
    forceParsing(view, view.state.doc.length, 1e9)
    const diagnostics = stepcodeDiagnostics(view.state, { profile: profiles.en, locale: 'en' })
    expect(diagnostics.length).toBeGreaterThan(0)
    view.destroy()
  })
})
