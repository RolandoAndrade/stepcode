import { type RefObject, useEffect, useRef, useState } from 'react'
import type { FileEnvironment } from '../../files/actions'
import { Console } from '../../panels/Console'
import { Editor, type EditorHandle } from '../../panels/Editor'
import { PanelActions } from '../../panels/PanelActions'
import { Problems } from '../../panels/Problems'
import { Variables } from '../../panels/Variables'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import type { PanelId, SheetPosition } from '../../store/layout'
import { stringsOf } from '../../store/store'
import { autoExpandTarget } from '../autoExpand'
import { StatusBar } from '../StatusBar'
import { BottomSheet } from './BottomSheet'
import { MobileTopBar } from './MobileTopBar'
import { SymbolBar } from './SymbolBar'
import { useKeyboardVisible } from './viewport'

type SheetPanel = Exclude<PanelId, 'editor'>
const SHEET_PANELS: readonly SheetPanel[] = ['console', 'problems', 'variables']

/** Spec §9: column layout — top bar, editor, symbol bar, bottom sheet, status; no dock here. */
export function MobileShell({
  editorRef,
  env,
}: {
  editorRef: RefObject<EditorHandle | null>
  env: FileEnvironment
}) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const sheet = useEditorStore((s) => s.layout.sheet)
  const setSheet = useEditorStore((s) => s.setSheet)
  const [active, setActive] = useState<SheetPanel>('console')
  const [editorFocused, setEditorFocused] = useState(false)
  const keyboard = useKeyboardVisible(editorFocused)
  // A collapse the user performs during a run is remembered until the next run (spec §3.4),
  // the same rule the desktop shell applies to a collapsed dock group.
  const manuallyCollapsed = useRef(false)
  const editorBox = useRef<HTMLDivElement>(null)

  // `focusin`/`focusout` on the wrapper rather than React's onFocus/onBlur: the same bubbling
  // events, on an element that stays a plain container (no interactive role it does not have).
  useEffect(() => {
    const node = editorBox.current
    if (node === null) return
    const focus = (): void => setEditorFocused(true)
    const blur = (): void => setEditorFocused(false)
    node.addEventListener('focusin', focus)
    node.addEventListener('focusout', blur)
    return () => {
      node.removeEventListener('focusin', focus)
      node.removeEventListener('focusout', blur)
    }
  }, [])

  useEffect(() => {
    let previous = store.getState()
    return store.subscribe((next) => {
      // Every branch below writes the sheet position back through the store, which re-enters this
      // listener; move the cursor first so the re-entrant call sees no further transition.
      const before = previous
      previous = next
      const request = next.panelRequest
      if (request !== before.panelRequest && request !== null && request.id !== 'editor') {
        setActive(request.id)
        if (next.layout.sheet === 'collapsed') next.setSheet('half')
      }
      if (next.runSeq !== before.runSeq) manuallyCollapsed.current = false
      const event = autoExpandTarget(before, next, next.settings.layout.showConsoleOnRun)
      if (event !== null && event.panel !== 'editor' && !manuallyCollapsed.current) {
        setActive(event.panel)
        if (event.reason === 'input') next.setSheet('full')
        else if (next.layout.sheet === 'collapsed') next.setSheet('half')
      }
    })
  }, [store])

  const onPosition = (position: SheetPosition): void => {
    if (position === 'collapsed') manuallyCollapsed.current = true
    setSheet(position)
  }

  const page = (id: SheetPanel) => {
    switch (id) {
      case 'console':
        return <Console onReveal={(line) => editorRef.current?.revealLine(line)} />
      case 'problems':
        return <Problems onReveal={(from, to) => editorRef.current?.revealSpan(from, to)} />
      case 'variables':
        return <Variables />
    }
  }

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <MobileTopBar env={env} />
      <div ref={editorBox} className="min-h-0 flex-1">
        <Editor handleRef={editorRef} />
      </div>
      <SymbolBar view={editorRef.current?.view ?? null} visible={keyboard} />
      <BottomSheet
        position={sheet}
        onPosition={onPosition}
        tabs={SHEET_PANELS.map((id) => ({ id, label: strings.panels[id] }))}
        active={active}
        onActive={setActive}
        actions={<PanelActions panel={active} />}
        labels={{
          collapse: strings.dock.collapse,
          expand: strings.dock.expand,
          sheet: strings.mobile.sheet,
        }}
      >
        {page}
      </BottomSheet>
      <div className="[&>footer>button:first-child]:hidden">
        <StatusBar onFocusEditor={() => editorRef.current?.focus()} />
      </div>
    </div>
  )
}
