import { type FileEnvironment, newDocument, openFile, saveFile } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { isDirty, stringsOf } from '../store/store'
import { FilePlus, FolderOpen, Save } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'
import { Filename } from './Filename'
import { Menu } from './Menu'
import { RunControls } from './RunControls'
import { SHORTCUTS } from './shortcuts'

/** Spec §4.1: menu, filename, file actions left; run cluster right; nothing in the middle. */
export function Toolbar({ env, compact = false }: { env: FileEnvironment; compact?: boolean }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const dirty = useEditorStore(isDirty)
  const running = useEditorStore((s) => s.state === 'running')
  return (
    <header className="relative flex h-10 items-center gap-2 border-b border-border bg-surface px-2 text-fg">
      <Menu env={env} />
      <Filename />
      {compact ? null : (
        <span className="flex items-center gap-1">
          <IconButton
            label={strings.toolbar.new}
            shortcut={SHORTCUTS.new}
            onClick={() => newDocument(store)}
          >
            <FilePlus />
          </IconButton>
          <IconButton
            label={strings.toolbar.open}
            shortcut={SHORTCUTS.open}
            onClick={() => void openFile(store, env)}
          >
            <FolderOpen />
          </IconButton>
          <IconButton
            label={dirty ? strings.toolbar.saveDirty : strings.toolbar.save}
            shortcut={SHORTCUTS.save}
            onClick={() => void saveFile(store, env)}
          >
            <span className="relative inline-flex">
              <Save />
              {dirty ? (
                <span
                  aria-hidden="true"
                  data-testid="unsaved-dot"
                  className="-top-0.5 -right-0.5 absolute h-1.5 w-1.5 rounded-full bg-accent"
                />
              ) : null}
            </span>
          </IconButton>
        </span>
      )}
      <span className="ml-auto" />
      <RunControls compact={compact} />
      {running ? (
        // Indeterminate on purpose: a program's remaining work is unknowable, so the stripe says
        // "still going", not "this far along". Under prefers-reduced-motion the global rule in
        // index.css stops the slide and leaves the bar solid.
        <div
          role="progressbar"
          aria-label={strings.status.running}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-accent"
        >
          <span aria-hidden="true" className="sc-stripe block h-full w-[30%] bg-bg/50" />
        </div>
      ) : null}
    </header>
  )
}
