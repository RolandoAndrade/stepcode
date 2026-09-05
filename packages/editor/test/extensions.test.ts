// @vitest-environment happy-dom
import { forceParsing, highlightingFor, syntaxTree } from '@codemirror/language'
import { setDiagnostics } from '@codemirror/lint'
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
  settingsExtension,
} from '../src/editor/extensions'
import { HIGHLIGHT_SPECS } from '../src/editor/highlight'
import { EDITOR_THEME_SPEC } from '../src/editor/theme'
import { DEFAULT_SETTINGS } from '../src/store/settings'

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
    settings: DEFAULT_SETTINGS.editor,
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
const COLOR_KEYWORDS = new Set(['none', 'transparent', 'unset', 'inherit', 'currentColor'])

/** Properties a colorish name catches that carry no color at all (`borderRadius`, `minWidth`). */
const COLORLESS = /radius|width|spacing|position|inset|collapse/i

/** `currentColor` is a color the rule inherits from a token set on the same element. */
const carriesAColor = (property: string, value: string): boolean =>
  !COLORLESS.test(property) && !COLOR_KEYWORDS.has(value) && !value.includes('currentColor')

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
        if (colorish.test(property) && carriesAColor(property, String(value))) {
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

describe('gutters', () => {
  const rule = (selector: string): Readonly<Record<string, unknown>> => {
    const found = EDITOR_THEME_SPEC[selector]
    if (found === undefined || typeof found === 'string') throw new Error(`no rule for ${selector}`)
    return found
  }

  it('reserves three digits for the line number and centers the fold chevron', () => {
    expect(rule('.cm-lineNumbers .cm-gutterElement').minWidth).toBe('3ch')
    expect(rule('.cm-foldGutter .cm-gutterElement').display).toBe('flex')
    expect(rule('.cm-foldGutter .cm-gutterElement').alignItems).toBe('center')
    expect(rule('.cm-foldGutter .cm-gutterElement').justifyContent).toBe('center')
  })

  it('narrows the lint gutter and paints its markers from the tokens', () => {
    expect(rule('.cm-gutter.cm-gutter-lint').minWidth).toBe('0.8em')
    expect(rule('.cm-gutter-lint .cm-gutterElement').padding).toBe('0 0.1em')
    expect(rule('.cm-gutter-lint .cm-lint-marker').width).toBe('0.6em')
    expect(rule('.cm-gutter-lint .cm-lint-marker').height).toBe('0.6em')
    expect(rule('.cm-gutter-lint .cm-lint-marker').content).toBe('none')
    expect(rule('.cm-gutter-lint .cm-lint-marker-error').color).toBe('var(--sc-error)')
    expect(rule('.cm-gutter-lint .cm-lint-marker-warning').color).toBe('var(--sc-warning)')
  })

  // The whole point of the rules above: `@codemirror/lint` paints its markers with
  // `content: url(<svg fill="#f87">)`, which is a replaced element — a background color would
  // never show and `::after` would never be generated. Only a mounted view proves the override
  // wins, so this test dispatches a real diagnostic and reads the cascade back.
  it('replaces the vendor lint SVG with a token-colored dot', () => {
    const { view } = viewFor()
    view.dispatch(
      setDiagnostics(view.state, [{ from: 0, to: 3, severity: 'error', message: 'boom' }]),
    )
    const marker = view.dom.querySelector('.cm-lint-marker-error')
    expect(marker).not.toBeNull()
    const style = getComputedStyle(marker as Element)
    expect(style.content).toBe('none')
    expect(style.borderRadius).toBe('50%')
    expect(style.backgroundColor).toBe('currentcolor')
    // 0.6em against the vendor's 1em, and round rather than a triangle or a squashed circle.
    expect(style.width).toBe(style.height)
    expect(Number.parseFloat(style.width)).toBeLessThan(14)
    view.destroy()
  })

  it('pulses the marker with a ring, and holds still under reduced motion', () => {
    expect(rule('.cm-gutter-lint .cm-lint-marker::after').animation).toContain('sc-lint-pulse')
    expect(EDITOR_THEME_SPEC['@keyframes sc-lint-pulse']).toBeDefined()
    const reduced = rule('@media (prefers-reduced-motion: reduce)')[
      '.cm-gutter-lint .cm-lint-marker::after'
    ]
    expect(reduced).toEqual({ animation: 'none' })
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

describe('settingsExtension', () => {
  it('applies tab size, wrapping, line numbers and font size', () => {
    const base = { ...DEFAULT_SETTINGS.editor, tabSize: 2 as const, wordWrap: true, fontSize: 18 }
    const state = EditorState.create({
      doc: 'x',
      extensions: settingsExtension(base, profiles.es, 'es'),
    })
    expect(state.tabSize).toBe(2)
    const view = new EditorView({ state })
    expect(view.contentDOM.classList.contains('cm-lineWrapping')).toBe(true)
    expect(view.dom.querySelector('.cm-gutters')).not.toBeNull()
    expect(view.dom.style.getPropertyValue('--sc-editor-font-size')).toBe('18px')
    view.destroy()
    const noNumbers = new EditorView({
      state: EditorState.create({
        doc: 'x',
        extensions: settingsExtension({ ...base, lineNumbers: false }, profiles.es, 'es'),
      }),
    })
    expect(noNumbers.dom.querySelector('.cm-lineNumbers')).toBeNull()
    noNumbers.destroy()
  })
})
