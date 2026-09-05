import { PANEL_IDS, type PanelId } from '../../store/layout'
import type { PanelStates } from '../Sidebar'

/** The structural subset of `DockviewApi` the sidebar's state needs. */
export interface PanelHostLike {
  getPanel(id: string):
    | {
        readonly group: {
          readonly id: string
          readonly activePanel?: { readonly id: string } | undefined
        }
      }
    | undefined
}

/** What the sidebar draws before the dock exists, and for a panel the layout lost. */
export const HIDDEN_PANEL_STATES: PanelStates = Object.freeze(
  Object.fromEntries(PANEL_IDS.map((id) => [id, { visible: false, active: false }])) as Record<
    PanelId,
    { visible: false; active: false }
  >,
)

/**
 * Spec §3.3: a panel is visible when its group is not collapsed, and active when it is the tab in
 * front of that group. `isCollapsed` comes from the shell's own controller rather than dockview's
 * `api.isVisible`, which `fromJSON` restores without firing the visibility event it is fed from.
 */
export function panelStatesOf(
  api: PanelHostLike,
  isCollapsed: (groupId: string) => boolean,
): PanelStates {
  const states: Record<string, { visible: boolean; active: boolean }> = {}
  for (const id of PANEL_IDS) {
    const panel = api.getPanel(id)
    states[id] =
      panel === undefined
        ? { visible: false, active: false }
        : {
            visible: !isCollapsed(panel.group.id),
            active: panel.group.activePanel?.id === id,
          }
  }
  return states as PanelStates
}
