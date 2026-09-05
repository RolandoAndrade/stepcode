import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import { stringsOf } from '../../store/store'
import { X } from '../../ui/icons'
import { IconButton, TooltipProvider } from '../../ui/Tooltip'
import { Appearance } from './Appearance'
import { EditorSection } from './EditorSection'
import { Execution } from './Execution'
import { Language } from './Language'
import { Rail } from './Rail'

export type SettingsPage = 'language' | 'editor' | 'execution' | 'appearance'
const PAGES: readonly SettingsPage[] = ['language', 'editor', 'execution', 'appearance']

/** Spec §6: rail + one scrolling body; every control writes to the store immediately. */
export function Settings({ initialSection = 'language' }: { initialSection?: SettingsPage }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const open = useEditorStore((s) => s.dialog === 'settings')
  const [page, setPage] = useState<SettingsPage>(initialSection)
  const contentRef = useRef<HTMLDivElement>(null)
  const body = {
    language: <Language />,
    editor: <EditorSection />,
    execution: <Execution />,
    appearance: <Appearance />,
  }[page]
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && store.getState().closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal bg-overlay" />
        <Dialog.Content
          ref={contentRef}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            // The close button (the first focusable descendant) opens its tooltip as soon as
            // it is keyboard-focused, which then steals Escape from the dialog itself. Focus
            // the content wrapper instead, which is still inside the dialog for a11y purposes.
            event.preventDefault()
            contentRef.current?.focus()
          }}
          className="fixed inset-0 z-modal flex flex-col bg-surface text-fg sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(90vh,520px)] sm:w-[min(95vw,720px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-panel"
        >
          <TooltipProvider>
            <div className="flex h-10 items-center justify-between border-b border-border px-3">
              <Dialog.Title className="font-semibold text-sm">
                {strings.settings.title}
              </Dialog.Title>
              <Dialog.Description className="sr-only">{strings.settings.title}</Dialog.Description>
              <Dialog.Close asChild>
                <IconButton label={strings.dialog.close} onClick={() => {}}>
                  <X />
                </IconButton>
              </Dialog.Close>
            </div>
            <Rail pages={PAGES} value={page} onChange={setPage}>
              <div className="min-h-0 flex-1 overflow-auto p-4">{body}</div>
            </Rail>
          </TooltipProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
