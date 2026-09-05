// @vitest-environment happy-dom
import {
  EditorSelection,
  EditorState,
  type Extension,
  type Transaction,
} from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { builtinProfiles, profiles, type ResolvedProfile, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { arrowInput } from '../src/arrow'
import { stepcode } from '../src/index'
import { stepcodeLanguage } from '../src/parser'

/** The es profile with `←` taken out of the assign spellings, as PSeInt itself spells it. */
const noArrow: ResolvedProfile = resolveProfile(
  { id: 'es-no-arrow', extends: 'es', operators: { assign: ['<-'] } },
  builtinProfiles,
)

const withEquals: ResolvedProfile = resolveProfile(
  { id: 'es-equals', extends: 'es', options: { assignWithEquals: true } },
  builtinProfiles,
)

interface Typed {
  readonly view: EditorView
  readonly transactions: readonly Transaction[]
}

/**
 * Types `text` at the cursor the way the browser does: the input handlers see it first and the
 * plain insertion only happens when none of them claims it.
 */
function type(doc: string, extensions: Extension, text = '-'): Typed {
  // Every `|` is a cursor; `[` and `]` around text make the main range a selection instead.
  const anchors: number[] = []
  let source = ''
  let selectionFrom: number | null = null
  let selectionTo: number | null = null
  for (const char of doc) {
    if (char === '|') anchors.push(source.length)
    else if (char === '[') selectionFrom = source.length
    else if (char === ']') selectionTo = source.length
    else source += char
  }
  const ranges =
    selectionFrom !== null && selectionTo !== null
      ? [EditorSelection.range(selectionFrom, selectionTo)]
      : anchors.map((at) => EditorSelection.cursor(at))
  const transactions: Transaction[] = []
  const view = new EditorView({
    state: EditorState.create({
      doc: source,
      selection: EditorSelection.create(ranges),
      extensions: [EditorState.allowMultipleSelections.of(true), extensions],
    }),
    dispatchTransactions: (trs, self) => {
      transactions.push(...trs)
      self.update(trs)
    },
  })
  const { from, to } = view.state.selection.main
  // What CodeMirror hands a handler as the default: one transaction covering every range.
  const insert = (): Transaction =>
    view.state.update({ ...view.state.replaceSelection(text), userEvent: 'input.type' })
  const handled = view.state
    .facet(EditorView.inputHandler)
    .some((handler) => handler(view, from, to, text, insert))
  if (!handled) view.dispatch(insert())
  return { view, transactions }
}

const es = (extensions: Extension): Extension => [stepcodeLanguage(profiles.es), extensions]

describe('arrowInput', () => {
  it('turns a typed `<-` into `←` under a profile that spells it', () => {
    const { view, transactions } = type('Escribir a<|', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('Escribir a←')
    expect(view.state.selection.main.head).toBe(view.state.doc.length)
    expect(transactions).toHaveLength(1)
    expect(transactions[0]?.isUserEvent('input.type')).toBe(true)
    view.destroy()
  })

  it('leaves `<-` alone inside a string', () => {
    const { view } = type('Escribir "a<|"', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('Escribir "a<-"')
    view.destroy()
  })

  it('leaves `<-` alone inside a comment', () => {
    const { view } = type('// a <|', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('// a <-')
    view.destroy()
  })

  it('does nothing under a profile whose assign spellings have no arrow', () => {
    const { view } = type('Escribir a<|', [stepcodeLanguage(noArrow), arrowInput(noArrow)])
    expect(view.state.doc.toString()).toBe('Escribir a<-')
    view.destroy()
  })

  it('does nothing under a profile that assigns with `=`', () => {
    const { view } = type('Escribir a<|', [stepcodeLanguage(withEquals), arrowInput(withEquals)])
    expect(view.state.doc.toString()).toBe('Escribir a<-')
    view.destroy()
  })

  it('needs a `<` right before the cursor', () => {
    const { view } = type('Escribir a |', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('Escribir a -')
    view.destroy()
  })

  it('leaves a non-empty selection to the default insertion', () => {
    const { view } = type('Escribir a<[bc]', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('Escribir a<-')
    view.destroy()
  })

  it('declines under more than one cursor, so no keystroke is swallowed', () => {
    // CodeMirror calls an input handler once, with the main range; the default insertion is what
    // reaches every other cursor. Claiming the keystroke here would drop the rest.
    const { view } = type('Escribir a< b<|  c<|', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('Escribir a< b<-  c<-')
    view.destroy()
  })

  it('leaves `<-` alone inside a string the line never closes', () => {
    const { view } = type('Escribir "a<|', es(arrowInput(profiles.es)))
    expect(view.state.doc.toString()).toBe('Escribir "a<-')
    view.destroy()
  })

  it('stands aside while an IME composition is in flight', () => {
    const doc = 'Escribir a<'
    const view = new EditorView({
      state: EditorState.create({
        doc,
        selection: { anchor: doc.length },
        extensions: es(arrowInput(profiles.es)),
      }),
    })
    // Rewriting text the IME still owns strands its pending composition.
    Object.defineProperty(view, 'composing', { get: () => true })
    const handled = view.state
      .facet(EditorView.inputHandler)
      .some((handler) =>
        handler(view, doc.length, doc.length, '-', () => view.state.update({ changes: [] })),
      )
    expect(handled).toBe(false)
    expect(view.state.doc.toString()).toBe(doc)
    view.destroy()
  })

  it('is one undo step: reverting the transaction leaves no arrow', () => {
    const { view, transactions } = type('Escribir a<|', es(arrowInput(profiles.es)))
    const only = transactions[0]
    if (only === undefined) throw new Error('no transaction was dispatched')
    const back = only.changes.invert(only.startState.doc)
    expect(view.state.doc.toString()).toBe('Escribir a←')
    expect(back.apply(view.state.doc).toString()).toBe('Escribir a<')
    view.destroy()
  })
})

describe('stepcode({ arrow })', () => {
  it('converts by default', () => {
    const { view } = type('Escribir a<|', stepcode({ profile: profiles.es }))
    expect(view.state.doc.toString()).toBe('Escribir a←')
    view.destroy()
  })

  it('does not convert when arrow is false', () => {
    const { view } = type('Escribir a<|', stepcode({ profile: profiles.es, arrow: false }))
    expect(view.state.doc.toString()).toBe('Escribir a<-')
    view.destroy()
  })
})
