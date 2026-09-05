import { PANEL_IDS, type PanelId } from '../../store/layout'
import type { PanelStates, Zone } from '../Sidebar'

/** As much of a `DOMRect` as the zones need. */
export interface RectLike {
  readonly top: number
  readonly left: number
  readonly right: number
  readonly bottom: number
  readonly width: number
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

const ZERO: RectLike = { top: 0, left: 0, right: 0, bottom: 0, width: 0 }

/** What the sidebar draws before the dock exists, and for a panel the layout lost. */
export const HIDDEN_PANEL_STATES: PanelStates = Object.freeze(
  Object.fromEntries(
    PANEL_IDS.map((id) => [id, { visible: false, active: false, zone: 'left-bottom' }]),
  ) as Record<PanelId, { visible: false; active: false; zone: 'left-bottom' }>,
)

/**
 * Spec §3.3: a panel's sidebar button lives on the side of the editor its group sits on — to the
 * right of the editor is the right strip, above it the left strip's top cluster, and anything
 * else (below, or to the left) the bottom cluster the default layout uses.
 *
 * An unmeasured group keeps the default: happy-dom reports zeros, and so does dockview before it
 * has laid the group out.
 */
export function zoneFor(editor: RectLike, group: RectLike): Zone {
  if (editor.width === 0 || group.width === 0) return 'left-bottom'
  if (group.left >= editor.right) return 'right'
  if (group.bottom <= editor.top) return 'left-top'
  return 'left-bottom'
}

/**
 * Spec §3.3: a panel is visible when its group is not collapsed, and active when it is the tab in
 * front of that group. `isCollapsed` comes from the shell's own controller rather than dockview's
 * `api.isVisible`, which `fromJSON` restores without firing the visibility event it is fed from.
 * A floating or popped-out group can sit anywhere, so its panels keep the default zone.
 */
export function panelStatesOf(
  api: PanelHostLike,
  isCollapsed: (groupId: string) => boolean,
): PanelStates {
  const editor = api.getPanel('editor')?.group.element?.getBoundingClientRect() ?? ZERO
  const states: Record<string, { visible: boolean; active: boolean; zone: Zone }> = {}
  for (const id of PANEL_IDS) {
    const panel = api.getPanel(id)
    if (panel === undefined) {
      states[id] = { visible: false, active: false, zone: 'left-bottom' }
      continue
    }
    const grid = panel.group.api.location.type === 'grid'
    const box = panel.group.element?.getBoundingClientRect() ?? ZERO
    states[id] = {
      visible: !isCollapsed(panel.group.id),
      active: panel.group.activePanel?.id === id,
      zone: grid ? zoneFor(editor, box) : 'left-bottom',
    }
  }
  return states as PanelStates
}

/** What a sidebar click does to the panel's group. */
export type SidebarAction = 'activate' | 'expand' | 'collapse'

/**
 * Spec §3.3. A floating or popped-out group never collapses — `CollapseController` refuses it —
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
  if (group.api.location.type !== 'grid') return 'activate'
  if (collapsed) return 'expand'
  return group.activePanel?.id === panel ? 'collapse' : 'activate'
}
