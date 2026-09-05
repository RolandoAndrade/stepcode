import { PANEL_IDS, type PanelId } from '../../store/layout'
import type { PanelStates, Zone } from '../Sidebar'

/** As much of a `DOMRect` as the zones need. */
export interface RectLike {
  readonly top: number
  readonly left: number
  readonly right: number
  readonly bottom: number
  readonly width: number
  readonly height: number
}

/** The structural subset of `DockviewApi` the sidebar's state needs. */
export interface PanelHostLike {
  getPanel(id: string):
    | {
        readonly group: {
          readonly id: string
          readonly activePanel?: { readonly id: string } | undefined
          readonly api: { readonly location: { readonly type: string } }
          readonly element?: { getBoundingClientRect(): RectLike }
        }
      }
    | undefined
}

const ZERO: RectLike = { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }

/** Two adjacent groups are separated by a sash, so their edges never meet exactly. */
const SASH = 4

/** What the sidebar draws before the dock exists, and for a panel the layout lost. */
export const HIDDEN_PANEL_STATES: PanelStates = Object.freeze(
  Object.fromEntries(
    PANEL_IDS.map((id) => [
      id,
      { visible: false, active: false, zone: id === 'editor' ? 'left-top' : 'left-bottom' },
    ]),
  ) as Record<PanelId, { visible: false; active: false; zone: Zone }>,
)

/**
 * Spec §3.3: a panel's sidebar button lives on the side of the editor its group sits on — to the
 * right of the editor is the right strip, above it the left strip's top cluster, and anything
 * else (below, or to the left) the bottom cluster the default layout uses.
 *
 * A group with no box keeps `fallback` — its previous zone. happy-dom reports zeros, dockview
 * reports zeros before it has laid a group out, and a *collapsed* group is a zero-height box
 * parked at the top of the grid, which would otherwise throw every icon into the top cluster.
 */
export function zoneFor(editor: RectLike, group: RectLike, fallback: Zone = 'left-bottom'): Zone {
  const measured = editor.width > 0 && editor.height > 0 && group.width > 0 && group.height > 0
  if (!measured) return fallback
  // The sash between two groups is a few pixels wide, so the edges never meet exactly.
  if (group.left >= editor.right - SASH) return 'right'
  if (group.bottom <= editor.top + SASH) return 'left-top'
  return 'left-bottom'
}

/**
 * The editor is the reference every other panel is placed against, so it is placed against the
 * dock itself: docked in the right half, its button joins the right strip; anywhere else it leads
 * the left strip's top cluster.
 */
export function editorZoneFor(dock: RectLike, editor: RectLike, fallback: Zone = 'left-top'): Zone {
  if (dock.width === 0 || editor.width === 0) return fallback
  return editor.left + editor.width / 2 > dock.left + dock.width / 2 ? 'right' : 'left-top'
}

/**
 * Spec §3.3: a panel is visible when its group is not collapsed, and active when it is the tab in
 * front of that group. `isCollapsed` comes from the shell's own controller rather than dockview's
 * `api.isVisible`, which `fromJSON` restores without firing the visibility event it is fed from.
 * A floating or popped-out group can sit anywhere, so its panels keep the zone they had.
 */
export function panelStatesOf(
  api: PanelHostLike,
  isCollapsed: (groupId: string) => boolean,
  previous: PanelStates = HIDDEN_PANEL_STATES,
  dock: RectLike = ZERO,
): PanelStates {
  const editor = api.getPanel('editor')?.group.element?.getBoundingClientRect() ?? ZERO
  const states: Record<string, { visible: boolean; active: boolean; zone: Zone }> = {}
  for (const id of PANEL_IDS) {
    const panel = api.getPanel(id)
    const kept = previous[id].zone
    if (panel === undefined) {
      states[id] = { visible: false, active: false, zone: kept }
      continue
    }
    const grid = panel.group.api.location.type === 'grid'
    const box = panel.group.element?.getBoundingClientRect() ?? ZERO
    const zone =
      id === 'editor' ? editorZoneFor(dock, box, kept) : grid ? zoneFor(editor, box, kept) : kept
    states[id] = {
      visible: !isCollapsed(panel.group.id),
      active: panel.group.activePanel?.id === id,
      zone,
    }
  }
  return states as PanelStates
}

/** What a sidebar click does to the panel's group. */
export type SidebarAction = 'activate' | 'expand' | 'collapse'

/**
 * Spec §3.3. The editor is never hidden, and a floating or popped-out group never collapses — `CollapseController` refuses it —
 * so the click only brings its panel forward; collapsing it anyway would leave the group marked
 * manually collapsed (§3.4) for a collapse that never happened.
 */
export function sidebarActionFor(
  group: {
    readonly api: { readonly location: { readonly type: string } }
    readonly activePanel?: { readonly id: string } | undefined
  },
  panel: PanelId,
  collapsed: boolean,
): SidebarAction {
  // The editor never collapses (§3.1): its button only puts the cursor back where the user types.
  if (panel === 'editor') return 'activate'
  if (group.api.location.type !== 'grid') return 'activate'
  if (collapsed) return 'expand'
  return group.activePanel?.id === panel ? 'collapse' : 'activate'
}
