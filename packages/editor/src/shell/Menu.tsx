import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { type ComponentType, useMemo } from 'react'
import { type FileEnvironment, newDocument, openFile, saveFile, saveFileAs } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { PANEL_IDS } from '../store/layout'
import { type EditorStore, stringsOf } from '../store/store'
import type { Strings } from '../strings'
import {
  BookOpen,
  Check,
  FilePen,
  FilePlus,
  FolderOpen,
  type IconProps,
  Info,
  Languages,
  PanelBottom,
  RotateCcw,
  Save,
  Settings,
  Share2,
} from '../ui/icons'
import { isMac, keyLabel } from '../ui/keys'
import { PANEL_ICONS } from '../ui/panelIcons'
import { IconButton } from '../ui/Tooltip'
import { profileItems } from './StatusBar'
import { SHORTCUTS } from './shortcuts'

export type MenuIcon = ComponentType<IconProps>

export type MenuEntry =
  | {
      kind: 'item'
      label: string
      shortcut?: string
      checked?: boolean
      icon?: MenuIcon
      onSelect: () => void
    }
  | { kind: 'separator' }
  | { kind: 'submenu'; label: string; icon?: MenuIcon; items: MenuEntry[] }

/** Spec §4.4, as data so the desktop dropdown and the phone sheet render the same tree. */
export function menuModel(store: EditorStore, env: FileEnvironment, strings: Strings): MenuEntry[] {
  const s = store.getState()
  const item = (
    label: string,
    onSelect: () => void,
    extra: { shortcut?: string; checked?: boolean; icon?: MenuIcon } = {},
  ): MenuEntry => ({ kind: 'item', label, onSelect, ...extra })
  return [
    item(strings.toolbar.new, () => newDocument(store), {
      shortcut: SHORTCUTS.new,
      icon: FilePlus,
    }),
    item(strings.toolbar.open, () => void openFile(store, env), {
      shortcut: SHORTCUTS.open,
      icon: FolderOpen,
    }),
    item(strings.toolbar.save, () => void saveFile(store, env), {
      shortcut: SHORTCUTS.save,
      icon: Save,
    }),
    item(strings.toolbar.saveAs, () => void saveFileAs(store, env), {
      shortcut: SHORTCUTS.saveAs,
      icon: FilePen,
    }),
    { kind: 'separator' },
    item(strings.menu.examples, () => s.openDialog('examples'), { icon: BookOpen }),
    item(strings.menu.share, () => s.openDialog('share'), { icon: Share2 }),
    { kind: 'separator' },
    {
      kind: 'submenu',
      label: strings.menu.profile,
      icon: Languages,
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
      icon: PanelBottom,
      items: [
        ...PANEL_IDS.filter((id) => id !== 'editor').map((id) =>
          item(strings.panels[id], () => s.requestPanel(id), { icon: PANEL_ICONS[id] }),
        ),
        { kind: 'separator' },
        item(strings.menu.resetLayout, () => s.resetLayout(), { icon: RotateCcw }),
      ],
    },
    { kind: 'separator' },
    item(strings.menu.settings, () => s.openDialog('settings'), {
      shortcut: SHORTCUTS.settings,
      icon: Settings,
    }),
    item(strings.menu.about, () => s.openDialog('about'), { icon: Info }),
  ]
}

const ITEM =
  'flex h-8 cursor-default select-none items-center gap-2 rounded px-2 text-sm outline-none data-[highlighted]:bg-surface-raised'

/**
 * A fixed slot at the left of every item, so labels line up whether the entry has an icon, a
 * check mark (the profile list) or neither.
 */
export function MenuSlot({ icon: Icon, checked }: { icon?: MenuIcon; checked?: boolean }) {
  return (
    <span className="flex w-4 shrink-0 items-center justify-center">
      {checked === true ? <Check /> : Icon !== undefined ? <Icon /> : null}
    </span>
  )
}

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
                <MenuSlot {...(entry.icon === undefined ? {} : { icon: entry.icon })} />
                {entry.label}
                <span aria-hidden="true" className="ml-auto text-muted">
                  ▸
                </span>
              </Dropdown.SubTrigger>
              <Dropdown.Portal>
                <Dropdown.SubContent
                  className="z-modal min-w-48 rounded-md bg-surface p-1 text-fg shadow-panel"
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
            <MenuSlot
              {...(entry.icon === undefined ? {} : { icon: entry.icon })}
              {...(entry.checked === undefined ? {} : { checked: entry.checked })}
            />
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
  // menuModel reads profileId/customProfiles/settings off the store too (for the Perfil check
  // and list), but Menu only re-renders on its own selected values — so those raw fields are
  // selected here as well (as StatusBar's ProfilePopover does), or a profile switch that keeps
  // the same UI locale would leave the model stale.
  const profileId = useEditorStore((s) => s.profileId)
  const customProfiles = useEditorStore((s) => s.customProfiles)
  const settings = useEditorStore((s) => s.settings)
  // profileId/customProfiles/settings aren't read directly in the callback below — they're the
  // store fields that menuModel's own store.getState() call reads, so they belong in the
  // recompute trigger even though the callback body never names them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  const entries = useMemo(
    () => menuModel(store, env, strings),
    [store, env, strings, profileId, customProfiles, settings],
  )
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <IconButton label={strings.toolbar.menu} onClick={() => {}}>
          <img src="/pwa-64x64.png" alt="" width={20} height={20} />
        </IconButton>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="start"
          sideOffset={6}
          className="z-modal min-w-56 rounded-md bg-surface p-1 text-fg shadow-panel"
        >
          <Entries entries={entries} />
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}
