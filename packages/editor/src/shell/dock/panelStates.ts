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

/** A group beside the editor rather than above or below it: its icon belongs on a side strip. */
export function isRightOf(editor: RectLike, group: RectLike): boolean {
  // The sash between two groups is a few pixels wide, so the edges never meet exactly.
  return group.left >= editor.right - SASH
}

function isLeftOf(editor: RectLike, group: RectLike): boolean {
  return group.right <= editor.left + SASH
}

/**
 * Spec §3.3: a panel's sidebar button lives on the side of the editor its group sits on, in the
 * half of that strip the group sits in — a right column split in two puts one icon in the right
 * strip's top cluster and the other in its bottom cluster. A group beside the editor takes its
 * half from its own centre against the dock's; one above or below the editor takes the obvious
 * one, and everything else falls to the bottom cluster the default layout uses.
 *
 * A group with no box keeps `fallback` — its previous zone. happy-dom reports zeros, dockview
 * reports zeros before it has laid a group out, and a *collapsed* group is a zero-height box
 * parked at the top of the grid, which would otherwise throw every icon into the top cluster.
 */
export function zoneFor(
  editor: RectLike,
  group: RectLike,
  dock: RectLike = ZERO,
  fallback: Zone = 'left-bottom',
): Zone {
  const measured = editor.width > 0 && editor.height > 0 && group.width > 0 && group.height > 0
  if (!measured) return fallback
  const beside = isRightOf(editor, group) || isLeftOf(editor, group)
  if (beside) {
    const half = inTopHalf(dock, group) ? 'top' : 'bottom'
    return `${isRightOf(editor, group) ? 'right' : 'left'}-${half}` as Zone
  }
  return group.bottom <= editor.top + SASH ? 'left-top' : 'left-bottom'
}

/** Which half of the dock a group's own centre falls in; an unmeasured dock reads as the top. */
function inTopHalf(dock: RectLike, group: RectLike): boolean {
  if (dock.height === 0) return true
  return group.top + group.height / 2 <= dock.top + dock.height / 2
}

/**
 * The editor is the reference every other panel is placed against, so it is placed against the
 * dock itself: docked in the right half, its button joins the right strip; anywhere else it leads
 * the left strip's top cluster.
 */
export function editorZoneFor(dock: RectLike, editor: RectLike, fallback: Zone = 'left-top'): Zone {
  if (dock.width === 0 || editor.width === 0) return fallback
  return editor.left + editor.width / 2 > dock.left + dock.width / 2 ? 'right-top' : 'left-top'
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
      id === 'editor'
        ? editorZoneFor(dock, box, kept)
        : grid
          ? zoneFor(editor, box, dock, kept)
          : kept
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

/** Where a drop sends a group: an edge of the whole grid, or a side of a group already there. */
export interface DropPlan {
  readonly position: 'top' | 'bottom' | 'right'
  /** The group to split; absent means the edge of the grid itself. */
  readonly groupId?: string
}

/**
 * Spec §3.3: the left clusters dock against the top and bottom edges of the grid. The right ones
 * dock against its right edge only while nothing is there yet — once a right column exists, the
 * drop splits it, above its topmost group or below its bottommost one, so a right column can hold
 * two groups and each icon keeps its own half of the strip.
 */
export function dropPlanFor(
  zone: Zone,
  rightGroups: readonly { readonly id: string; readonly top: number }[],
): DropPlan {
  if (zone === 'left-top') return { position: 'top' }
  if (zone === 'left-bottom') return { position: 'bottom' }
  const ordered = [...rightGroups].sort((a, b) => a.top - b.top)
  const reference = zone === 'right-top' ? ordered[0] : ordered.at(-1)
  if (reference === undefined) return { position: 'right' }
  return { position: zone === 'right-top' ? 'top' : 'bottom', groupId: reference.id }
}
