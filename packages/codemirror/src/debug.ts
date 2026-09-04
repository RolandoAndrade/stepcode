import {
  type ChangeDesc,
  EditorState,
  type Extension,
  MapMode,
  RangeSet,
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Text,
  type Transaction,
} from '@codemirror/state'
import { Decoration, EditorView, GutterMarker, gutter, type ViewUpdate } from '@codemirror/view'

export const toggleBreakpoint = StateEffect.define<{ readonly line: number }>()
export const setBreakpoints = StateEffect.define<readonly number[]>()
export const setCurrentLine = StateEffect.define<number | null>()

class BreakpointMarker extends GutterMarker {
  override toDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'cm-stepcode-breakpoint'
    return dom
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof BreakpointMarker
  }
}

class CurrentLineMarker extends GutterMarker {
  override toDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'cm-stepcode-current-line-marker'
    return dom
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof CurrentLineMarker
  }
}

/**
 * Sizes the gutter for a breakpoint dot without rendering one: the gutter keeps this marker's
 * DOM permanently mounted (hidden) for width measurement, so it must not share the
 * `.cm-stepcode-breakpoint` class or it would inflate any count of real markers.
 */
class SpacerMarker extends GutterMarker {
  override toDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'cm-stepcode-breakpoint-spacer'
    return dom
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof SpacerMarker
  }
}

const breakpointMarker = new BreakpointMarker()
const currentLineMarker = new CurrentLineMarker()
const spacerMarker = new SpacerMarker()

/**
 * Where the start of the line at `lineFrom` lands after `changes`, or null when the line is
 * gone: its whole content was deleted, or — for an empty line — its line break was.
 */
export function mapLineStart(changes: ChangeDesc, oldDoc: Text, lineFrom: number): number | null {
  const line = oldDoc.lineAt(lineFrom)
  if (line.length === 0) return changes.mapPos(line.from, -1, MapMode.TrackAfter)
  const from = changes.mapPos(line.from, -1)
  const to = changes.mapPos(line.to, 1)
  return from === to ? null : from
}

function markersAt(positions: readonly number[]): RangeSet<GutterMarker> {
  const builder = new RangeSetBuilder<GutterMarker>()
  let last = -1
  for (const pos of [...positions].sort((a, b) => a - b)) {
    if (pos === last) continue
    builder.add(pos, pos, breakpointMarker)
    last = pos
  }
  return builder.finish()
}

function positionsOf(set: RangeSet<GutterMarker>): number[] {
  const out: number[] = []
  for (const cursor = set.iter(); cursor.value !== null; cursor.next()) out.push(cursor.from)
  return out
}

function lineStart(state: EditorState, line: number): number | null {
  return line >= 1 && line <= state.doc.lines ? state.doc.line(line).from : null
}

function remap(set: RangeSet<GutterMarker>, tr: Transaction): RangeSet<GutterMarker> {
  const positions: number[] = []
  for (const pos of positionsOf(set)) {
    const mapped = mapLineStart(tr.changes, tr.startState.doc, pos)
    if (mapped !== null) positions.push(tr.state.doc.lineAt(mapped).from)
  }
  return markersAt(positions)
}

const breakpointField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(value, tr) {
    let set = tr.docChanged ? remap(value, tr) : value
    for (const effect of tr.effects) {
      if (effect.is(toggleBreakpoint)) {
        const from = lineStart(tr.state, effect.value.line)
        if (from === null) continue
        const positions = positionsOf(set)
        set = markersAt(
          positions.includes(from) ? positions.filter((pos) => pos !== from) : [...positions, from],
        )
      } else if (effect.is(setBreakpoints)) {
        set = markersAt(
          effect.value
            .map((line) => lineStart(tr.state, line))
            .filter((pos): pos is number => pos !== null),
        )
      }
    }
    return set
  },
})

const currentLineDecoration = Decoration.line({ class: 'cm-stepcode-current-line' })

/** The start offset of the current line, or null. */
const currentLineField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    let next = value
    if (next !== null && tr.docChanged) {
      const mapped = mapLineStart(tr.changes, tr.startState.doc, next)
      next = mapped === null ? null : tr.state.doc.lineAt(mapped).from
    }
    for (const effect of tr.effects) {
      if (effect.is(setCurrentLine)) {
        next = effect.value === null ? null : lineStart(tr.state, effect.value)
      }
    }
    return next
  },
  provide: (field) =>
    EditorView.decorations.from(field, (value) =>
      value === null ? Decoration.none : Decoration.set(currentLineDecoration.range(value)),
    ),
})

/** Spec §6.2: setting a line also scrolls it into view. */
const scrollToCurrentLine = EditorState.transactionExtender.of((tr) => {
  for (const effect of tr.effects) {
    if (!effect.is(setCurrentLine) || effect.value === null) continue
    const line = effect.value
    if (line < 1 || line > tr.newDoc.lines) continue
    return { effects: EditorView.scrollIntoView(tr.newDoc.line(line).from, { y: 'nearest' }) }
  }
  return null
})

/** One gutter for both: breakpoint markers and the current-line arrow (spec §6.1). */
const debugGutter = gutter({
  class: 'cm-stepcode-breakpoints',
  markers: (view) => view.state.field(breakpointField, false) ?? RangeSet.empty,
  lineMarker: (view, line) => {
    const current = view.state.field(currentLineField, false)
    return current !== undefined && current !== null && current === line.from
      ? currentLineMarker
      : null
  },
  lineMarkerChange: (update) =>
    update.startState.field(currentLineField, false) !==
    update.state.field(currentLineField, false),
  initialSpacer: () => spacerMarker,
  domEventHandlers: {
    mousedown(view, line) {
      view.dispatch({
        effects: toggleBreakpoint.of({ line: view.state.doc.lineAt(line.from).number }),
      })
      return true
    },
  },
})

export function breakpoints(): Extension {
  return [breakpointField, debugGutter]
}

export function currentLine(): Extension {
  return [currentLineField, scrollToCurrentLine, debugGutter]
}

export function debug(): Extension {
  return [breakpoints(), currentLine()]
}

/** 1-based, ascending; empty without the extension. */
export function breakpointLines(state: EditorState): number[] {
  const set = state.field(breakpointField, false)
  if (set === undefined) return []
  return positionsOf(set).map((pos) => state.doc.lineAt(pos).number)
}

/** True when the update changed the breakpoint set — the host's cue to resend it. */
export function breakpointsChanged(update: ViewUpdate): boolean {
  return (
    update.startState.field(breakpointField, false) !== update.state.field(breakpointField, false)
  )
}

/** 1-based, or null. */
export function currentLineOf(state: EditorState): number | null {
  const pos = state.field(currentLineField, false)
  return pos === undefined || pos === null ? null : state.doc.lineAt(pos).number
}
