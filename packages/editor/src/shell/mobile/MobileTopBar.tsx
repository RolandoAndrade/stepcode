import * as RadixDialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import { useState } from 'react'
import type { FileEnvironment } from '../../files/actions'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import { hasErrors, stringsOf } from '../../store/store'
import { ArrowDownToDot, ArrowUpFromDot, Bug, Ellipsis, Hexagon, StepForward } from '../../ui/icons'
import { isMac, keyLabel } from '../../ui/keys'
import { IconButton } from '../../ui/Tooltip'
import { Filename } from '../Filename'
import { type MenuEntry, menuModel } from '../Menu'
import { RunControls } from '../RunControls'
import { SHORTCUTS } from '../shortcuts'

const SHEET_ITEM =
  'flex h-11 w-full items-center gap-2 rounded px-3 text-left text-fg text-sm hover:bg-surface-raised'

/** Spec §4.4 on the phone: the same menu model, flattened into a left sheet. */
function SheetEntries({ entries, onDone }: { entries: MenuEntry[]; onDone: () => void }) {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.kind === 'separator')
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the menu tree is static per locale
            <div key={`sep-${index}`} className="my-1 border-border border-t" />
          )
        if (entry.kind === 'submenu')
          return (
            <div key={entry.label}>
              <p className="px-3 pt-2 pb-1 text-muted text-xs">{entry.label}</p>
              <SheetEntries entries={entry.items} onDone={onDone} />
            </div>
          )
        return (
          <button
            key={entry.label}
            type="button"
            onClick={() => {
              entry.onSelect()
              onDone()
            }}
            className={SHEET_ITEM}
          >
            {entry.label}
            {entry.shortcut !== undefined ? (
              <span aria-hidden="true" className="ml-auto pl-4 text-muted text-xs">
                {keyLabel(entry.shortcut, isMac())}
              </span>
            ) : null}
          </button>
        )
      })}
    </>
  )
}

function MenuSheet({ env }: { env: FileEnvironment }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const [open, setOpen] = useState(false)
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Trigger asChild>
        <button
          type="button"
          aria-label={strings.toolbar.menu}
          className="inline-flex h-11 w-11 items-center justify-center rounded text-fg"
        >
          <Hexagon size={20} />
        </button>
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <RadixDialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-surface p-1 text-fg shadow-panel">
          <RadixDialog.Title className="px-3 py-2 font-semibold text-sm">
            {strings.toolbar.menu}
          </RadixDialog.Title>
          <RadixDialog.Description className="sr-only">
            {strings.toolbar.menu}
          </RadixDialog.Description>
          {/* Recomputed per render so profile checkmarks and names stay current. */}
          <SheetEntries entries={menuModel(store, env, strings)} onDone={() => setOpen(false)} />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

/** Spec §9: Depurar plus, while paused, the stepping actions the compact run controls drop. */
function MoreActions() {
  const strings = useEditorStore(stringsOf)
  const state = useEditorStore((s) => s.state)
  const errors = useEditorStore(hasErrors)
  const stepInto = useEditorStore((s) => s.stepInto)
  const stepOver = useEditorStore((s) => s.stepOver)
  const stepOut = useEditorStore((s) => s.stepOut)
  const requestPanel = useEditorStore((s) => s.requestPanel)
  const t = strings.toolbar
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={strings.mobile.moreActions}
          className="inline-flex h-11 w-11 items-center justify-center rounded text-fg"
        >
          <Ellipsis />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-50 flex items-center gap-1 rounded-md bg-surface p-1 text-fg shadow-panel"
        >
          <IconButton
            label={t.debug}
            shortcut={SHORTCUTS.stepInto}
            onClick={() => (errors ? requestPanel('problems') : stepInto())}
          >
            <Bug />
          </IconButton>
          {state === 'paused' ? (
            <>
              <IconButton label={t.stepOver} shortcut={SHORTCUTS.stepOver} onClick={stepOver}>
                <StepForward />
              </IconButton>
              <IconButton label={t.stepInto} shortcut={SHORTCUTS.stepInto} onClick={stepInto}>
                <ArrowDownToDot />
              </IconButton>
              <IconButton label={t.stepOut} shortcut={SHORTCUTS.stepOut} onClick={stepOut}>
                <ArrowUpFromDot />
              </IconButton>
            </>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/** Spec §9: 44 px bar — menu sheet, filename, compact run controls, the "more" popover. */
export function MobileTopBar({ env }: { env: FileEnvironment }) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-1 border-border border-b bg-surface px-1">
      <MenuSheet env={env} />
      <Filename />
      <div className="ml-auto flex items-center gap-1">
        <RunControls compact />
        <MoreActions />
      </div>
    </header>
  )
}
