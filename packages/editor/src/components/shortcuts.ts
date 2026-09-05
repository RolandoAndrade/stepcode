import type { WorkerState } from '../runtime/protocol'
import { canEdit, type EditorStore, hasErrors } from '../store/store'

export type ShortcutAction =
  | 'runOrContinue'
  | 'stepOver'
  | 'stepInto'
  | 'stepOut'
  | 'pause'
  | 'stop'

export interface KeyLike {
  readonly key: string
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
}

/** Spec §7.5: F5 run/continue, Shift+F5 stop, F6 pause, F10 step over, F11 step into, Shift+F11 step out. */
export function shortcutFor(event: KeyLike): ShortcutAction | null {
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
  }
}

/** Runs the action when legal; returns whether it ran. */
export function performShortcut(store: EditorStore, action: ShortcutAction): boolean {
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
  }
}

/**
 * Window-level keydown. A bound key is always swallowed with `preventDefault` — so, for
 * example, browser F5 can never discard the unsaved document — regardless of whether the
 * action is legal right now; legality only decides whether the action runs (spec §7.5).
 */
export function installShortcuts(store: EditorStore, target: Window = window): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    const action = shortcutFor(event)
    if (action === null) return
    event.preventDefault()
    performShortcut(store, action)
  }
  target.addEventListener('keydown', onKeyDown)
  return () => {
    target.removeEventListener('keydown', onKeyDown)
  }
}
