import { useEditorStore } from '../store/context'
import type { PanelId } from '../store/layout'
import { stringsOf } from '../store/store'
import { PANEL_ICONS } from '../ui/panelIcons'
import { IconButton } from '../ui/Tooltip'

export interface PanelState {
  /** False while the panel's group is collapsed, i.e. hidden from the grid (spec §3.3). */
  readonly visible: boolean
  /** Whether the panel is the active tab of its own group. */
  readonly active: boolean
}

export type PanelStates = Readonly<Record<PanelId, PanelState>>

/** Spec §3.3: the tool-window strip lists the panels that share the bottom group, in tab order. */
export const SIDEBAR_PANELS: readonly PanelId[] = ['console', 'problems', 'variables']

/**
 * The JetBrains-style tool-window bar: a 40 px strip down the left of the dock whose buttons
 * show, hide and switch the panels. It only draws what it is given; the shell owns the dock.
 */
export function Sidebar({
  states,
  onToggle,
}: {
  states: PanelStates
  onToggle: (id: PanelId) => void
}) {
  const strings = useEditorStore(stringsOf)
  const errors = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'error').length)
  return (
    <div className="flex w-10 shrink-0 flex-col border-border border-r bg-surface">
      <div className="mt-auto flex flex-col items-center gap-1 pb-2">
        {SIDEBAR_PANELS.map((id) => {
          const Icon = PANEL_ICONS[id]
          const state = states[id]
          const pressed = state.visible && state.active
          return (
            <div key={id} className="relative flex items-center justify-center">
              {pressed ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1 bottom-1 left-0 w-0.5 rounded-r-sm bg-accent"
                />
              ) : null}
              <IconButton label={strings.panels[id]} active={pressed} onClick={() => onToggle(id)}>
                <span className={pressed ? undefined : 'text-muted'}>
                  <Icon />
                </span>
              </IconButton>
              {id === 'problems' && errors > 0 ? (
                // The count is announced by the status bar and the Problemas panel already.
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 right-0 rounded-sm bg-error px-1 text-[10px] text-bg leading-[1.4]"
                >
                  {errors}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
