import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { type FileEnvironment, newDocument, openFile, saveFile, saveFileAs } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { PANEL_IDS } from '../store/layout'
import { type EditorStore, stringsOf } from '../store/store'
import type { Strings } from '../strings'
import { Check, Hexagon } from '../ui/icons'
import { isMac, keyLabel } from '../ui/keys'
import { Tooltip } from '../ui/Tooltip'
import { profileItems } from './StatusBar'
import { SHORTCUTS } from './shortcuts'

export type MenuEntry =
  | { kind: 'item'; label: string; shortcut?: string; checked?: boolean; onSelect: () => void }
  | { kind: 'separator' }
  | { kind: 'submenu'; label: string; items: MenuEntry[] }

/** Spec §4.4, as data so the desktop dropdown and the phone sheet render the same tree. */
export function menuModel(store: EditorStore, env: FileEnvironment, strings: Strings): MenuEntry[] {
  const s = store.getState()
  const item = (
    label: string,
    onSelect: () => void,
    extra: { shortcut?: string; checked?: boolean } = {},
  ): MenuEntry => ({ kind: 'item', label, onSelect, ...extra })
  return [
    item(strings.toolbar.new, () => newDocument(store), { shortcut: SHORTCUTS.new }),
    item(strings.toolbar.open, () => void openFile(store, env), { shortcut: SHORTCUTS.open }),
    item(strings.toolbar.save, () => void saveFile(store, env), { shortcut: SHORTCUTS.save }),
    item(strings.toolbar.saveAs, () => void saveFileAs(store, env), { shortcut: SHORTCUTS.saveAs }),
    { kind: 'separator' },
    item(strings.menu.examples, () => s.openDialog('examples')),
    item(strings.menu.share, () => s.openDialog('share')),
    { kind: 'separator' },
    {
      kind: 'submenu',
      label: strings.menu.profile,
      items: [
        ...profileItems(s).map((p) =>
          item(p.name, () => s.setProfile(p.id), { checked: p.id === s.profileId }),
        ),
        { kind: 'separator' },
        item(strings.menu.customize, () => s.openDialog('settings')),
      ],
    },
    {
      kind: 'submenu',
      label: strings.menu.view,
      items: [
        ...PANEL_IDS.filter((id) => id !== 'editor').map((id) =>
          item(strings.panels[id], () => s.requestPanel(id)),
        ),
        { kind: 'separator' },
        item(strings.menu.resetLayout, () => s.resetLayout()),
      ],
    },
    { kind: 'separator' },
    item(strings.menu.settings, () => s.openDialog('settings'), { shortcut: SHORTCUTS.settings }),
    item(strings.menu.about, () => s.openDialog('about')),
  ]
}

const ITEM =
  'flex h-8 cursor-default select-none items-center gap-2 rounded px-2 text-sm outline-none data-[highlighted]:bg-surface-raised'

function Entries({ entries }: { entries: MenuEntry[] }) {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.kind === 'separator')
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the menu tree is static per locale
            <Dropdown.Separator key={`sep-${index}`} className="my-1 border-t border-border" />
          )
        if (entry.kind === 'submenu') {
          return (
            <Dropdown.Sub key={entry.label}>
              <Dropdown.SubTrigger className={ITEM}>
                {entry.label}
                <span aria-hidden="true" className="ml-auto text-muted">
                  ▸
                </span>
              </Dropdown.SubTrigger>
              <Dropdown.Portal>
                <Dropdown.SubContent
                  className="z-50 min-w-48 rounded-md bg-surface p-1 text-fg shadow-panel"
                  sideOffset={4}
                >
                  <Entries entries={entry.items} />
                </Dropdown.SubContent>
              </Dropdown.Portal>
            </Dropdown.Sub>
          )
        }
        return (
          <Dropdown.Item key={entry.label} className={ITEM} onSelect={entry.onSelect}>
            <span className="w-4">{entry.checked ? <Check /> : null}</span>
            {entry.label}
            {entry.shortcut !== undefined ? (
              <span aria-hidden="true" className="ml-auto pl-4 text-muted text-xs">
                {keyLabel(entry.shortcut, isMac())}
              </span>
            ) : null}
          </Dropdown.Item>
        )
      })}
    </>
  )
}

export function Menu({ env }: { env: FileEnvironment }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  // Recomputed per render so profile checkmarks and names stay current.
  const entries = menuModel(store, env, strings)
  return (
    <Dropdown.Root modal={false}>
      <Tooltip label={strings.toolbar.menu}>
        <Dropdown.Trigger
          type="button"
          aria-label={strings.toolbar.menu}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-fg transition-colors duration-150 hover:bg-surface-raised"
        >
          <Hexagon size={20} />
        </Dropdown.Trigger>
      </Tooltip>
      <Dropdown.Portal>
        <Dropdown.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-56 rounded-md bg-surface p-1 text-fg shadow-panel"
        >
          <Entries entries={entries} />
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}
