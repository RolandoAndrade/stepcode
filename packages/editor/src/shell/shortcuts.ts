import type { FileEnvironment } from '../files/actions'
import { newDocument, openFile, saveFile, saveFileAs } from '../files/actions'
import type { WorkerState } from '../runtime/protocol'
import { canEdit, type EditorStore, hasErrors } from '../store/store'

export type ShortcutAction =
  | 'runOrContinue'
  | 'stepOver'
  | 'stepInto'
  | 'stepOut'
  | 'pause'
  | 'stop'
  | 'new'
  | 'open'
  | 'save'
  | 'saveAs'
  | 'settings'

export interface KeyLike {
  readonly key: string
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  /** Whether the event target is inside the code editor (Ctrl+N is intercepted only there). */
  readonly inEditor?: boolean
}

export const SHORTCUTS: Readonly<Record<ShortcutAction, string>> = {
  runOrContinue: 'F5',
  stepOver: 'F10',
  stepInto: 'F11',
  stepOut: 'Shift+F11',
  pause: 'F6',
  stop: 'Shift+F5',
  new: 'Ctrl+N',
  open: 'Ctrl+O',
  save: 'Ctrl+S',
  saveAs: 'Ctrl+Shift+S',
  settings: 'Ctrl+,',
}

/** Spec §7.5: F5 run/continue, Shift+F5 stop, F6 pause, F10 step over, F11 step into, Shift+F11 step out. */
export function shortcutFor(event: KeyLike): ShortcutAction | null {
  const primary = event.ctrlKey || event.metaKey
  if (primary && !event.altKey) {
    switch (event.key.toLowerCase()) {
      case 'n':
        return event.inEditor === true && !event.shiftKey ? 'new' : null
      case 'o':
        return event.shiftKey ? null : 'open'
      case 's':
        return event.shiftKey ? 'saveAs' : 'save'
      case ',':
        return 'settings'
      default:
        return null
    }
  }
  if (event.ctrlKey || event.altKey || event.metaKey) return null
  switch (event.key) {
    case 'F5':
      return event.shiftKey ? 'stop' : 'runOrContinue'
    case 'F6':
      return event.shiftKey ? null : 'pause'
    case 'F10':
      return event.shiftKey ? null : 'stepOver'
    case 'F11':
      return event.shiftKey ? 'stepOut' : 'stepInto'
    default:
      return null
  }
}

/** Mirrors the store's guards (spec §6) so a key is only swallowed when it does something. */
export function isLegal(action: ShortcutAction, state: WorkerState, errors: boolean): boolean {
  switch (action) {
    case 'runOrContinue':
      return state === 'paused' || (canEdit(state) && !errors)
    case 'stepInto':
      return state === 'paused' || (canEdit(state) && !errors)
    case 'stepOver':
    case 'stepOut':
      return state === 'paused'
    case 'pause':
      return state === 'running'
    case 'stop':
      return state !== 'ready'
    case 'new':
    case 'open':
    case 'save':
    case 'saveAs':
    case 'settings':
      return true
  }
}

/** Runs the action when legal; returns whether it ran. */
export function performShortcut(
  store: EditorStore,
  action: ShortcutAction,
  env: FileEnvironment,
): boolean {
  const s = store.getState()
  if (!isLegal(action, s.state, hasErrors(s))) return false
  switch (action) {
    case 'runOrContinue':
      if (s.state === 'paused') s.continue()
      else s.run()
      return true
    case 'stepInto':
      s.stepInto()
      return true
    case 'stepOver':
      s.stepOver()
      return true
    case 'stepOut':
      s.stepOut()
      return true
    case 'pause':
      s.pause()
      return true
    case 'stop':
      s.stop()
      return true
    case 'new':
      newDocument(store)
      return true
    case 'open':
      void openFile(store, env)
      return true
    case 'save':
      void saveFile(store, env)
      return true
    case 'saveAs':
      void saveFileAs(store, env)
      return true
    case 'settings':
      s.openDialog('settings')
      return true
  }
}

/**
 * Window-level keydown. A bound key is always swallowed with `preventDefault` — so, for
 * example, browser F5 can never discard the unsaved document — regardless of whether the
 * action is legal right now; legality only decides whether the action runs (spec §7.5).
 * Ctrl/⌘+N is swallowed only while the code editor has focus, so it never steals the
 * browser's own new-window shortcut elsewhere in the shell.
 */
export function installShortcuts(
  store: EditorStore,
  env: FileEnvironment,
  target: Window = window,
): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    const inEditor = Boolean((event.target as Element | null)?.closest?.('.cm-editor'))
    const action = shortcutFor({
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      inEditor,
    })
    if (action === null) return
    event.preventDefault()
    performShortcut(store, action, env)
  }
  target.addEventListener('keydown', onKeyDown)
  return () => {
    target.removeEventListener('keydown', onKeyDown)
  }
}
