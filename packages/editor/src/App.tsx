import { lazy, Suspense, useEffect, useRef } from 'react'
import { DialogHost } from './dialogs/DialogHost'
import type { FileEnvironment } from './files/actions'
import type { EditorHandle } from './panels/Editor'
import { MobileShell } from './shell/mobile/MobileShell'
import { StatusBar } from './shell/StatusBar'
import { installShortcuts } from './shell/shortcuts'
import { Toolbar } from './shell/Toolbar'
import { useIsNarrow } from './shell/useIsNarrow'
import { useEditorStore, useEditorStoreApi } from './store/context'
import { displayName } from './store/document'
import { isDirty, stringsOf } from './store/store'
import { TooltipProvider } from './ui/Tooltip'

/**
 * Spec §9: dockview is a desktop-only dependency, so it must not sit in the chunk every phone
 * downloads. The shell arrives on its own chunk, the first time a wide viewport asks for it.
 */
const DesktopShell = lazy(async () => ({
  default: (await import('./shell/DesktopShell')).DesktopShell,
}))

/** Spec §2.1: toolbar, shell, status bar — the phone shell replaces all three below 768 px. */
export function App({ env, narrow }: { env: FileEnvironment; narrow?: boolean }) {
  const store = useEditorStoreApi()
  const detected = useIsNarrow()
  const isNarrow = narrow ?? detected
  const editor = useRef<EditorHandle | null>(null)
  const strings = useEditorStore(stringsOf)
  const name = useEditorStore((s) => s.name)
  const dirty = useEditorStore(isDirty)

  useEffect(() => installShortcuts(store, env), [store, env])
  useEffect(() => {
    document.title = strings.app.windowTitle(displayName(name), dirty)
  }, [strings, name, dirty])

  return (
    <TooltipProvider>
      {isNarrow ? (
        <MobileShell editorRef={editor} env={env} />
      ) : (
        <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] bg-bg text-fg">
          <Toolbar env={env} />
          <div className="min-h-0">
            <Suspense fallback={<div className="h-full bg-bg" />}>
              <DesktopShell editorRef={editor} />
            </Suspense>
          </div>
          <StatusBar onFocusEditor={() => editor.current?.focus()} />
        </div>
      )}
      <DialogHost env={env} />
    </TooltipProvider>
  )
}
