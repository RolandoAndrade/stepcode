import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  breakpointLines,
  breakpointsChanged,
  setBreakpoints,
  setCurrentLine,
  stepcodeDiagnostics,
} from '@stepcode/codemirror'
import { type RefObject, useEffect, useRef } from 'react'
import {
  createExtensions,
  darkExtension,
  readOnlyExtension,
  settingsExtension,
} from '../editor/extensions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { canEdit, localeOf, profileOf, stringsOf } from '../store/store'

/** Spec §7.1: what the rest of the app may do to the editor. */
export interface EditorHandle {
  readonly view: EditorView
  revealSpan(from: number, to: number): void
  focus(): void
  revealLine(line: number): void
}

export function Editor({ handleRef }: { handleRef?: RefObject<EditorHandle | null> }) {
  const store = useEditorStoreApi()
  const title = useEditorStore((s) => stringsOf(s).app.editor)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = container.current
    if (parent === null) return
    const initial = store.getState()
    let options = { profile: profileOf(initial), locale: localeOf(initial) }
    const { extensions, compartments } = createExtensions({
      ...options,
      readOnly: !canEdit(initial.state),
      dark: initial.theme === 'dark',
      settings: initial.settings.editor,
    })
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: initial.source,
        extensions: [
          extensions,
          EditorView.updateListener.of((update) => {
            const actions = store.getState()
            if (update.docChanged) actions.setSource(update.state.doc.toString())
            if (syntaxTree(update.state) !== syntaxTree(update.startState)) {
              actions.setDiagnostics(stepcodeDiagnostics(update.state, options))
            }
            if (breakpointsChanged(update)) actions.setBreakpoints(breakpointLines(update.state))
            if (update.selectionSet || update.docChanged) {
              const head = update.state.selection.main.head
              const line = update.state.doc.lineAt(head)
              actions.setCursor(line.number, head - line.from + 1)
            }
          }),
        ],
      }),
    })
    // The stepcode parser is a single-shot, non-incremental `Parser`, so a short document is
    // often fully parsed by the time `EditorState.create` returns — before any transaction
    // exists for the update listener above to observe a tree transition on. Push whatever the
    // initial tree already produced once, here, so the store's diagnostics reflect it too.
    store.getState().setDiagnostics(stepcodeDiagnostics(view.state, options))
    // A new view starts with an empty gutter, and the store outlives it: crossing the phone
    // breakpoint remounts the editor with the breakpoints the user set before the switch.
    if (initial.breakpoints.length > 0) {
      view.dispatch({ effects: setBreakpoints.of(initial.breakpoints) })
    }
    const handle: EditorHandle = {
      view,
      revealSpan: (from, to) => {
        view.dispatch({
          selection: { anchor: from, head: to },
          effects: EditorView.scrollIntoView(from, { y: 'center' }),
        })
        view.focus()
      },
      focus: () => view.focus(),
      revealLine: (line) => {
        const clamped = Math.min(Math.max(line, 1), view.state.doc.lines)
        const from = view.state.doc.line(clamped).from
        handle.revealSpan(from, from)
      },
    }
    if (handleRef !== undefined) handleRef.current = handle

    let previous = initial
    const unsubscribe = store.subscribe((next) => {
      if (next.currentLine !== previous.currentLine) {
        view.dispatch({ effects: setCurrentLine.of(next.currentLine) })
      }
      if (next.profileId !== previous.profileId) {
        options = { profile: profileOf(next), locale: localeOf(next) }
        view.dispatch({
          effects: compartments.settings.reconfigure(
            settingsExtension(next.settings.editor, options.profile, options.locale),
          ),
        })
      } else if (next.settings.editor !== previous.settings.editor) {
        view.dispatch({
          effects: compartments.settings.reconfigure(
            settingsExtension(next.settings.editor, options.profile, options.locale),
          ),
        })
      }
      if (canEdit(next.state) !== canEdit(previous.state)) {
        view.dispatch({
          effects: compartments.readOnly.reconfigure(readOnlyExtension(!canEdit(next.state))),
        })
      }
      if (next.theme !== previous.theme) {
        view.dispatch({
          effects: compartments.dark.reconfigure(darkExtension(next.theme === 'dark')),
        })
      }
      previous = next
    })

    return () => {
      unsubscribe()
      if (handleRef !== undefined) handleRef.current = null
      view.destroy()
    }
  }, [store, handleRef])

  return (
    <section aria-label={title} className="h-full min-h-0 overflow-hidden bg-bg">
      <div ref={container} className="h-full" />
    </section>
  )
}
