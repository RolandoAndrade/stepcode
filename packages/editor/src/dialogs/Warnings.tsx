import { LineMap } from 'stepcode'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { stringsOf } from '../store/store'
import { Dialog } from './Dialog'

/** Spec §7.4: warn before running a program that still has warnings. */
export function Warnings() {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const source = useEditorStore((s) => s.source)
  const diagnostics = useEditorStore((s) => s.diagnostics)
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning')
  const lineMap = new LineMap(source)
  return (
    <Dialog name="warnings" title={strings.warnings.title} description={strings.warnings.body}>
      <ul className="mb-4 flex flex-col gap-1 text-sm">
        {warnings.map((warning) => (
          <li key={`${warning.from}-${warning.to}-${warning.message}`}>
            {strings.problems.line(lineMap.positionAt(warning.from).line)}: {warning.message}
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="h-8 rounded px-3 text-sm hover:bg-surface-raised"
          onClick={() => store.getState().closeDialog()}
        >
          {strings.dialog.cancel}
        </button>
        <button
          type="button"
          className="h-8 rounded bg-accent px-3 text-sm text-bg hover:opacity-90"
          onClick={() => store.getState().confirmRun()}
        >
          {strings.warnings.runAnyway}
        </button>
      </div>
    </Dialog>
  )
}
