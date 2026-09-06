// @vitest-environment happy-dom
import { ensureSyntaxTree, foldable, syntaxTree } from '@codemirror/language'
import { diagnosticCount, forceLinting, forEachDiagnostic } from '@codemirror/lint'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { ResolvedProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  breakpointLines,
  compileResultAt,
  debug,
  setCurrentLine,
  stepcode,
  toggleBreakpoint,
} from '../src/index'
import { en, es } from './helpers'

const program = 'Proceso p\n  Definir a Como Entero;\n  a <- 1;\n  Escribir a;\nFinProceso'
const unknownEs = 'Proceso p\n  Escribir noExiste;\nFinProceso'
const unknownEn = 'Program p\n  Write nope;\nEndProgram'

/**
 * Lints now, without the clock: `forceLinting` runs the one synchronous source immediately,
 * and its diagnostics are dispatched a microtask later — so poll the count, bounded.
 */
async function linted(view: EditorView): Promise<number> {
  const before = diagnosticCount(view.state)
  forceLinting(view)
  for (let round = 0; round < 50 && diagnosticCount(view.state) === before; round++) {
    await Promise.resolve()
  }
  return diagnosticCount(view.state)
}

/** Every lint message the bundle produces for a document. */
async function lintMessages(
  doc: string,
  options: { profile: ResolvedProfile; locale?: string },
): Promise<string[]> {
  const view = new EditorView({
    state: EditorState.create({ doc, extensions: stepcode(options) }),
    parent: document.body,
  })
  ensureSyntaxTree(view.state, view.state.doc.length, 1e9)
  await linted(view)
  const messages: string[] = []
  forEachDiagnostic(view.state, (diagnostic) => {
    messages.push(diagnostic.message)
  })
  view.destroy()
  return messages
}

describe('stepcode()', () => {
  it('mounts with every extension, parses, lints, folds and debugs', async () => {
    const view = new EditorView({
      state: EditorState.create({ doc: program, extensions: [stepcode({ profile: es }), debug()] }),
      parent: document.body,
    })
    ensureSyntaxTree(view.state, view.state.doc.length, 1e9)
    expect(syntaxTree(view.state).topNode.name).toBe('Program')
    expect(compileResultAt(view.state)?.diagnostics).toEqual([])
    expect(foldable(view.state, 0, view.state.doc.line(1).to)).not.toBeNull()

    // Rewriting the one read of `a` makes `b` undeclared (E3001) and leaves `a` unread (W3002).
    const from = program.indexOf('Escribir a') + 'Escribir '.length
    view.dispatch({ changes: { from, to: from + 1, insert: 'b' } })
    ensureSyntaxTree(view.state, view.state.doc.length, 1e9)
    expect(compileResultAt(view.state)?.diagnostics.map((d) => d.code)).toEqual(['W3002', 'E3001'])
    expect(await linted(view)).toBe(2)

    view.dispatch({ effects: [toggleBreakpoint.of({ line: 3 }), setCurrentLine.of(3)] })
    expect(breakpointLines(view.state)).toEqual([3])
    expect(view.dom.querySelector('.cm-stepcode-current-line')).not.toBeNull()
    view.destroy()
  })

  it('defaults the locale to the profile locale and accepts an override', async () => {
    expect(await lintMessages(unknownEs, { profile: es })).toEqual([
      expect.stringContaining('declarada'),
    ])
    expect(await lintMessages(unknownEn, { profile: en })).toEqual([
      expect.stringContaining('declared'),
    ])
    expect(await lintMessages(unknownEn, { profile: en, locale: 'es' })).toEqual([
      expect.stringContaining('declarada'),
    ])
  })

  it('does not bring a highlight style, a lint gutter or line numbers', () => {
    const view = new EditorView({
      state: EditorState.create({ doc: program, extensions: stepcode({ profile: es }) }),
      parent: document.body,
    })
    expect(view.dom.querySelector('.cm-lineNumbers')).toBeNull()
    expect(view.dom.querySelector('.cm-gutter-lint')).toBeNull()
    view.destroy()
  })

  it('reconfigures from one profile to another through a Compartment', () => {
    const compartment = new Compartment()
    const esSource = 'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\n  FinSi\nFinProceso'
    const view = new EditorView({
      state: EditorState.create({
        doc: esSource,
        extensions: [compartment.of(stepcode({ profile: es }))],
      }),
      parent: document.body,
    })
    ensureSyntaxTree(view.state, view.state.doc.length, 1e9)

    // Under `es`, "Si" lexes as the if-keyword.
    const esSiOffset = esSource.indexOf('Si')
    expect(syntaxTree(view.state).resolveInner(esSiOffset, 1).name).toBe('IfKeyword')

    const enSource =
      'Program p\n  Define Si As Integer;\n  If Si < 2 Then\n    Write Si;\n  EndIf\nEndProgram'
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: enSource },
      effects: compartment.reconfigure(stepcode({ profile: en })),
    })
    ensureSyntaxTree(view.state, view.state.doc.length, 1e9)

    // No `es` extension is left: "Si" is no longer the if-keyword — it is just an ordinary
    // identifier now — while "If", the `en` spelling, lexes as the if-keyword instead.
    const siOffset = enSource.indexOf('Si')
    const ifOffset = enSource.indexOf('If')
    expect(syntaxTree(view.state).resolveInner(siOffset, 1).name).toBe('VariableDefinition')
    expect(syntaxTree(view.state).resolveInner(ifOffset, 1).name).toBe('IfKeyword')
    expect(view.state.languageDataAt('commentTokens', 0)).toEqual([{ line: '//' }])
    view.destroy()
  })
})
