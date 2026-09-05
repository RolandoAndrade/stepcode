import { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { Console } from '../panels/Console'
import { Editor, type EditorHandle } from '../panels/Editor'
import { Variables } from '../panels/Variables'
import { isLegal, type ShortcutAction, shortcutFor } from '../shell/shortcuts'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { type EditorStore, hasErrors, stringsOf } from '../store/store'
import { TooltipProvider } from '../ui/Tooltip'
import type { EmbedOptionsStore } from './options'
import { TopBar } from './TopBar'

const DEBUG_ACTIONS: ReadonlySet<ShortcutAction> = new Set(['stepOver', 'stepInto', 'stepOut'])
const FILE_ACTIONS: ReadonlySet<ShortcutAction> = new Set([
  'new',
  'open',
  'save',
  'saveAs',
  'settings',
])

/** Spec §3.4: F5 run/continue, Shift+F5 stop, F6 pause; the stepping keys only with `debug`. */
export function installEmbedShortcuts(
  store: EditorStore,
  debug: boolean,
  target: Window = window,
): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    const action = shortcutFor({
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    })
    // The embed has no files, no settings and — without `debug` — no debugger: those keys stay
    // the browser's.
    if (action === null || FILE_ACTIONS.has(action)) return
    if (!debug && DEBUG_ACTIONS.has(action)) return
    event.preventDefault()
    const s = store.getState()
    if (!isLegal(action, s.state, hasErrors(s))) return
    switch (action) {
      case 'runOrContinue':
        if (s.state === 'paused') s.continue()
        else s.run()
        return
      case 'stepInto':
        s.stepInto()
        return
      case 'stepOver':
        s.stepOver()
        return
      case 'stepOut':
        s.stepOut()
        return
      case 'pause':
        s.pause()
        return
      case 'stop':
        s.stop()
        return
      default:
        return
    }
  }
  target.addEventListener('keydown', onKeyDown)
  return () => {
    target.removeEventListener('keydown', onKeyDown)
  }
}

/** Below this frame height the console keeps its last line and its input row, nothing more. */
const TIGHT_HEIGHT = 240

/** Spec §3.2: top bar, editor, console — and Variables beside the console when `debug`. */
export function EmbedApp({ options }: { options: EmbedOptionsStore }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const readOnly = useStore(options, (s) => s.readOnly)
  const debug = useStore(options, (s) => s.debug)
  const title = useStore(options, (s) => s.title)
  const editor = useRef<EditorHandle | null>(null)
  const root = useRef<HTMLElement>(null)
  const [tight, setTight] = useState(false)

  useEffect(() => {
    document.title = title ?? strings.app.title
  }, [title, strings])

  useEffect(() => installEmbedShortcuts(store, debug), [store, debug])

  useEffect(() => {
    const element = root.current
    if (element === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setTight(element.clientHeight < TIGHT_HEIGHT))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const reveal = (line: number): void => editor.current?.revealLine(line)

  return (
    <TooltipProvider>
      <section
        ref={root}
        aria-label={strings.embed.title}
        className="flex h-full min-h-0 flex-col bg-bg text-fg"
      >
        <TopBar options={options} onReveal={reveal} />
        <div className="min-h-[120px] flex-1">
          <Editor handleRef={editor} readOnly={readOnly} />
        </div>
        <div
          className={`flex shrink-0 border-border border-t ${tight ? 'h-[72px]' : 'h-[35%] min-h-24'}`}
        >
          <div className="min-w-0 flex-1">
            <Console onReveal={reveal} />
          </div>
          {debug ? (
            <div className="w-2/5 border-border border-l">
              <Variables />
            </div>
          ) : null}
        </div>
      </section>
    </TooltipProvider>
  )
}
