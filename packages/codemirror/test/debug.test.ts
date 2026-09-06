// @vitest-environment happy-dom
import { ChangeSet, EditorState, Text } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import {
  breakpointLines,
  breakpoints,
  breakpointsChanged,
  currentLine,
  currentLineOf,
  debug,
  mapLineStart,
  setBreakpoints,
  setCurrentLine,
  toggleBreakpoint,
  toggleOnMouseDown,
} from '../src/debug'
import { stepcodeBaseTheme } from '../src/theme'

const doc = 'uno\ndos\ntres\ncuatro'

const withDebug = (text = doc): EditorState =>
  EditorState.create({ doc: text, extensions: debug() })

/** Flattens a (possibly nested) extension array, mirroring how `EditorState` sees it. */
function flatten(extension: unknown): unknown[] {
  return Array.isArray(extension) ? extension.flatMap(flatten) : [extension]
}

describe('breakpoints', () => {
  it('toggles on and off by line, reported ascending', () => {
    let state = withDebug()
    state = state.update({ effects: toggleBreakpoint.of({ line: 3 }) }).state
    state = state.update({ effects: toggleBreakpoint.of({ line: 1 }) }).state
    expect(breakpointLines(state)).toEqual([1, 3])
    state = state.update({ effects: toggleBreakpoint.of({ line: 3 }) }).state
    expect(breakpointLines(state)).toEqual([1])
  })

  it('replaces the set, ignoring lines outside the document and duplicates', () => {
    const state = withDebug().update({ effects: setBreakpoints.of([4, 2, 2, 9, 0]) }).state
    expect(breakpointLines(state)).toEqual([2, 4])
  })

  it('follows its line through an insertion above and an edit on the line', () => {
    let state = withDebug().update({ effects: setBreakpoints.of([2]) }).state
    state = state.update({ changes: { from: 0, insert: 'cero\n' } }).state
    expect(breakpointLines(state)).toEqual([3])
    state = state.update({ changes: { from: state.doc.line(3).from, insert: 'x' } }).state
    expect(breakpointLines(state)).toEqual([3])
    state = state.update({ changes: { from: state.doc.line(3).to, insert: '\nnueva' } }).state
    expect(breakpointLines(state)).toEqual([3])
  })

  it('vanishes when its line is deleted, and collapses two markers on one line', () => {
    let state = withDebug().update({ effects: setBreakpoints.of([2, 3]) }).state
    const line2 = state.doc.line(2)
    state = state.update({ changes: { from: line2.from, to: line2.to + 1 } }).state
    expect(breakpointLines(state)).toEqual([2])
    let joined = withDebug().update({ effects: setBreakpoints.of([1, 2]) }).state
    joined = joined.update({
      changes: { from: joined.doc.line(1).to, to: joined.doc.line(2).from },
    }).state
    expect(breakpointLines(joined)).toEqual([1])
  })

  it('reports whether an update changed the set', () => {
    let changed = false
    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          debug(),
          EditorView.updateListener.of((update) => {
            changed = breakpointsChanged(update)
          }),
        ],
      }),
      parent: document.body,
    })
    view.dispatch({ effects: toggleBreakpoint.of({ line: 2 }) })
    expect(changed).toBe(true)
    view.dispatch({ selection: { anchor: 1 } })
    expect(changed).toBe(false)
    view.dispatch({ changes: { from: 0, insert: 'x' } })
    expect(changed).toBe(true)
    view.destroy()
  })

  it('reads as an empty list without the extension', () => {
    expect(breakpointLines(EditorState.create({ doc }))).toEqual([])
  })

  it('ignores a right-button mousedown, and toggles on a left-button one', () => {
    const view = new EditorView({ state: withDebug(), parent: document.body })
    const line = view.lineBlockAt(0)
    const rightButton = { button: 2 } as MouseEvent
    expect(toggleOnMouseDown(view, line, rightButton)).toBe(false)
    expect(breakpointLines(view.state)).toEqual([])
    const leftButton = { button: 0 } as MouseEvent
    expect(toggleOnMouseDown(view, line, leftButton)).toBe(true)
    expect(breakpointLines(view.state)).toEqual([1])
    view.destroy()
  })
})

describe('currentLine', () => {
  it('is set and cleared by the effect', () => {
    let state = withDebug().update({ effects: setCurrentLine.of(2) }).state
    expect(currentLineOf(state)).toBe(2)
    state = state.update({ effects: setCurrentLine.of(null) }).state
    expect(currentLineOf(state)).toBeNull()
    expect(currentLineOf(withDebug().update({ effects: setCurrentLine.of(99) }).state)).toBeNull()
  })

  it('maps through edits and clears when the line is deleted', () => {
    let state = withDebug().update({ effects: setCurrentLine.of(3) }).state
    state = state.update({ changes: { from: 0, insert: 'cero\n' } }).state
    expect(currentLineOf(state)).toBe(4)
    const line = state.doc.line(4)
    state = state.update({ changes: { from: line.from, to: line.to + 1 } }).state
    expect(currentLineOf(state)).toBeNull()
  })

  it('decorates the line and marks the gutter; the breakpoint marker renders too', () => {
    const view = new EditorView({
      state: EditorState.create({ doc, extensions: [debug(), stepcodeBaseTheme] }),
      parent: document.body,
    })
    view.dispatch({ effects: [setCurrentLine.of(2), toggleBreakpoint.of({ line: 3 })] })
    expect(view.dom.querySelectorAll('.cm-stepcode-current-line')).toHaveLength(1)
    expect(view.dom.querySelectorAll('.cm-stepcode-current-line-marker')).toHaveLength(1)
    expect(view.dom.querySelectorAll('.cm-stepcode-breakpoint')).toHaveLength(1)
    expect(view.dom.querySelector('.cm-stepcode-breakpoints')).not.toBeNull()
    view.destroy()
  })

  it('scrolls the line into view through a transaction extender', () => {
    const state = withDebug()
    const tr = state.update({ effects: setCurrentLine.of(3) })
    expect(tr.effects.length).toBe(2)
  })

  it('works alone, without breakpoints()', () => {
    const state = EditorState.create({ doc, extensions: currentLine() }).update({
      effects: setCurrentLine.of(1),
    }).state
    expect(currentLineOf(state)).toBe(1)
    expect(breakpointLines(state)).toEqual([])
    const only = EditorState.create({ doc, extensions: breakpoints() })
    expect(currentLineOf(only)).toBeNull()
  })
})

describe('debug() without stepcode()', () => {
  it('includes the base theme so its markers render standalone', () => {
    expect(flatten(breakpoints())).toContain(stepcodeBaseTheme)
    expect(flatten(currentLine())).toContain(stepcodeBaseTheme)

    const view = new EditorView({
      state: EditorState.create({ doc, extensions: debug() }),
      parent: document.body,
    })
    view.dispatch({ effects: [toggleBreakpoint.of({ line: 1 }), setCurrentLine.of(1)] })
    expect(view.dom.querySelector('.cm-stepcode-breakpoints')).not.toBeNull()
    expect(view.dom.querySelector('.cm-stepcode-breakpoint')).not.toBeNull()
    expect(view.dom.querySelector('.cm-stepcode-current-line')).not.toBeNull()
    view.destroy()
  })
})

describe('mapLineStart', () => {
  const text = Text.of(['a', '', 'ccc'])

  it('keeps a line whose content survives', () => {
    const changes = ChangeSet.of({ from: 0, insert: 'x' }, text.length)
    expect(mapLineStart(changes, text, 0)).toBe(0)
    expect(mapLineStart(changes, text, 3)).toBe(4)
  })

  it('drops a line whose content is entirely deleted', () => {
    const changes = ChangeSet.of({ from: 3, to: 6 }, text.length)
    expect(mapLineStart(changes, text, 3)).toBeNull()
  })

  it('drops an empty line whose break is deleted', () => {
    const changes = ChangeSet.of({ from: 2, to: 3 }, text.length)
    expect(mapLineStart(changes, text, 2)).toBeNull()
    expect(mapLineStart(ChangeSet.of({ from: 2, insert: 'b' }, text.length), text, 2)).toBe(2)
  })
})
