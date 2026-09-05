import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { type DialogName, stringsOf } from '../store/store'
import { X } from '../ui/icons'
import { IconButton, TooltipProvider } from '../ui/Tooltip'

/** One frame for every store-driven dialog: full screen on phones, centered card otherwise. */
export function Dialog({
  name,
  title,
  description,
  wide = false,
  children,
}: {
  name: DialogName
  title: string
  description?: string
  wide?: boolean
  children: ReactNode
}) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const open = useEditorStore((s) => s.dialog === name)
  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => !next && store.getState().closeDialog()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <RadixDialog.Content
          className={`fixed inset-0 z-50 flex flex-col bg-surface text-fg sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-panel ${wide ? 'sm:w-[min(95vw,760px)]' : 'sm:w-[min(90vw,440px)]'}`}
        >
          <TooltipProvider>
            <div className="flex h-10 items-center justify-between border-b border-border px-3">
              <RadixDialog.Title className="font-semibold text-sm">{title}</RadixDialog.Title>
              <RadixDialog.Close asChild>
                <IconButton label={strings.dialog.close} onClick={() => {}}>
                  <X />
                </IconButton>
              </RadixDialog.Close>
            </div>
          </TooltipProvider>
          <RadixDialog.Description
            className={description === undefined ? 'sr-only' : 'px-4 pt-3 text-muted text-sm'}
          >
            {description ?? title}
          </RadixDialog.Description>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
