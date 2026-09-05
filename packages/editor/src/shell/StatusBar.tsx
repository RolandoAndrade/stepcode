import * as Popover from '@radix-ui/react-popover'
import { type ReactNode, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { WorkerState } from '../runtime/protocol'
import { useEditorStore } from '../store/context'
import {
  canEdit,
  PROFILE_IDS,
  profileNameOf,
  type RuntimeError,
  type StoreState,
  stringsOf,
} from '../store/store'
import type { Strings } from '../strings'
import { Check, ChevronDown, LoaderCircle } from '../ui/icons'
import { PANEL_ICONS } from '../ui/panelIcons'

export interface ProfileItem {
  readonly id: string
  readonly name: string
  readonly custom: boolean
}

export function profileItems(
  state: Pick<StoreState, 'profileId' | 'customProfiles' | 'settings'>,
): ProfileItem[] {
  return [
    ...PROFILE_IDS.map((id) => ({ id, name: profileNameOf(state, id), custom: false })),
    ...state.customProfiles.map((input) => ({ id: input.id, name: input.id, custom: true })),
  ]
}

/** Spec §5: one text per run state. */
export function statusText(
  strings: Strings,
  state: WorkerState,
  currentLine: number | null,
  error: RuntimeError | null,
): string {
  switch (state) {
    case 'ready':
      return strings.status.ready
    case 'running':
      return strings.status.running
    case 'paused':
      return strings.status.pausedAt(currentLine ?? 1)
    case 'input':
      return strings.status.waitingInput
    case 'waiting':
      return strings.status.waiting
    case 'done':
      return strings.status.done
    case 'error':
      return strings.status.errorAt(error?.line ?? currentLine ?? 1)
  }
}

const ITEM =
  'flex h-6 items-center gap-1 rounded px-2 text-xs transition-colors duration-150 disabled:cursor-default disabled:hover:bg-transparent'

/** Muted on the ordinary bar; on a colored band the band's own foreground already reads. */
const QUIET_ITEM = 'text-muted hover:bg-surface-raised hover:text-fg'
const BAND_ITEM = 'hover:bg-surface/25'

/**
 * Spec §5: the bar itself reports the run state. A live program tints it accent, a paused one
 * warning (the debugger colour), and everything else leaves it the surface it sits on.
 */
export function barTone(state: WorkerState): 'accent' | 'warning' | null {
  if (state === 'running' || state === 'input' || state === 'waiting') return 'accent'
  return state === 'paused' ? 'warning' : null
}

/** The profile list as a popover; `children` is the trigger. Reused by the Menu's Perfil submenu. */
export function ProfilePopover({
  children,
  disabled = false,
}: {
  children: ReactNode
  disabled?: boolean
}) {
  const strings = useEditorStore(stringsOf)
  const profileId = useEditorStore((s) => s.profileId)
  const customProfiles = useEditorStore((s) => s.customProfiles)
  const settings = useEditorStore((s) => s.settings)
  const setProfile = useEditorStore((s) => s.setProfile)
  const openDialog = useEditorStore((s) => s.openDialog)
  // profileItems allocates a fresh array/objects each call, so it is memoized here rather
  // than selected with useShallow (a one-level shallow compare can't stabilize nested objects).
  const items = useMemo(
    () => profileItems({ profileId, customProfiles, settings }),
    [profileId, customProfiles, settings],
  )
  return (
    <Popover.Root>
      <Popover.Trigger asChild disabled={disabled}>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          role="menu"
          align="start"
          sideOffset={4}
          className="z-modal min-w-44 rounded-md bg-surface p-1 text-sm text-fg shadow-panel"
        >
          {items.map((item) => (
            <Popover.Close asChild key={item.id}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={item.id === profileId}
                onClick={() => setProfile(item.id)}
                className="flex h-8 w-full items-center gap-2 rounded px-2 text-left hover:bg-surface-raised"
              >
                <span className="w-4">{item.id === profileId ? <Check /> : null}</span>
                {item.name}
              </button>
            </Popover.Close>
          ))}
          <div className="my-1 border-t border-border" />
          <Popover.Close asChild>
            <button
              type="button"
              role="menuitem"
              onClick={() => openDialog('settings')}
              className="flex h-8 w-full items-center gap-2 rounded px-2 text-left hover:bg-surface-raised"
            >
              <span className="w-4" />
              {strings.menu.customize}
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const ProblemsIcon = PANEL_ICONS.problems

/**
 * Spec §5, and §9 for `compact`: the phone bar carries the problems and the profile only. What
 * the program is doing sits on the left with the problems; where the cursor is and which profile
 * reads it sit on the right, away from the counts that change while you type.
 */
export function StatusBar({
  onFocusEditor,
  onFocusConsole,
  compact = false,
}: {
  onFocusEditor?: () => void
  onFocusConsole?: () => void
  compact?: boolean
}) {
  const strings = useEditorStore(stringsOf)
  const cursor = useEditorStore((s) => s.cursor)
  const profileName = useEditorStore((s) => profileNameOf(s, s.profileId))
  const counts = useEditorStore(
    useShallow((s) => ({
      errors: s.diagnostics.filter((d) => d.severity === 'error').length,
      warnings: s.diagnostics.filter((d) => d.severity === 'warning').length,
    })),
  )
  const state = useEditorStore((s) => s.state)
  const currentLine = useEditorStore((s) => s.currentLine)
  const error = useEditorStore((s) => s.error)
  const requestPanel = useEditorStore((s) => s.requestPanel)
  const clean = counts.errors === 0 && counts.warnings === 0
  const tone = barTone(state)
  const item = `${ITEM} ${tone === null ? QUIET_ITEM : BAND_ITEM}`
  const band =
    tone === null
      ? 'bg-surface'
      : tone === 'accent'
        ? 'bg-accent-strong text-on-accent'
        : 'bg-warning-strong text-on-warning'

  return (
    <footer
      className={`flex h-6 items-center gap-1 border-t border-border px-2 transition-colors duration-150 ${band}`}
    >
      <button
        type="button"
        className={`${item} ${
          clean || tone !== null ? '' : counts.errors > 0 ? 'text-error' : 'text-warning'
        }`}
        title={strings.problems.title}
        onClick={() => requestPanel('problems')}
      >
        {clean ? null : <ProblemsIcon size={12} />}
        {clean
          ? strings.status.noProblems
          : strings.status.problems(counts.errors, counts.warnings)}
      </button>
      {compact ? null : (
        <button
          type="button"
          className={item}
          title={strings.status.state}
          onClick={() => {
            requestPanel('console')
            onFocusConsole?.()
          }}
        >
          {state === 'running' ? <LoaderCircle size={12} className="animate-spin" /> : null}
          {statusText(strings, state, currentLine, error)}
        </button>
      )}
      {compact ? null : (
        <button
          type="button"
          className={`${item} ml-auto`}
          title={strings.status.cursor}
          onClick={onFocusEditor}
        >
          {strings.status.position(cursor.line, cursor.column)}
        </button>
      )}
      <ProfilePopover disabled={!canEdit(state)}>
        <button
          type="button"
          className={`${item} ${compact ? 'ml-auto' : ''}`}
          title={strings.toolbar.profile}
        >
          {profileName}
          <ChevronDown size={12} />
        </button>
      </ProfilePopover>
    </footer>
  )
}
