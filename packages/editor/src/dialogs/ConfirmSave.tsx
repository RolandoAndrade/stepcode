import * as Dialog from '@radix-ui/react-dialog'
import type { FileEnvironment } from '../files/actions'
import { saveFile } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { stringsOf } from '../store/store'

const BUTTON = 'h-8 rounded px-3 text-sm transition-colors duration-150'

/** Spec §8.1: Guardar / No guardar / Cancelar before a document is replaced. */
export function ConfirmSave({ env }: { env: FileEnvironment }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const open = useEditorStore((s) => s.dialog === 'confirmSave' && s.pendingReplace !== null)
  const name = useEditorStore((s) => s.name)
  // Spec §8.1: only a document that really reached a file may be replaced — a cancelled OS
  // dialog or a failed write leaves the question standing, with the program still in the editor.
  const save = async (): Promise<void> => {
    if (await saveFile(store, env)) store.getState().applyReplace()
  }
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && store.getState().cancelReplace()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-modal w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-4 text-fg shadow-panel">
          <Dialog.Title className="text-base font-semibold">
            {strings.confirmSave.title(name)}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">
            {strings.confirmSave.body}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className={`${BUTTON} hover:bg-surface-raised`}
              onClick={() => store.getState().cancelReplace()}
            >
              {strings.dialog.cancel}
            </button>
            <button
              type="button"
              className={`${BUTTON} hover:bg-surface-raised`}
              onClick={() => store.getState().applyReplace()}
            >
              {strings.confirmSave.discard}
            </button>
            <button
              type="button"
              className={`${BUTTON} bg-accent text-bg hover:opacity-90`}
              onClick={() => void save()}
            >
              {strings.confirmSave.save}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
