import type { DockviewApi } from 'dockview-react'
import type { PanelId } from '../../store/layout'
import type { Strings } from '../../strings'

export const DEFAULT_BOTTOM_FRACTION = 0.3
export const DEFAULT_BOTTOM_MIN = 120

/**
 * The titles dockview puts on its own tab wrapper (`aria-label`) and on the group's region label.
 * They are the panel names, so the accessible name of a tab is the name the user reads on it.
 */
export function PANEL_TITLES(strings: Strings): Record<PanelId, string> {
  return { ...strings.panels }
}

/** Spec §3.2: editor alone; Consola, Problemas, Variables as tabs of one group below it. */
export function applyDefaultLayout(
  api: DockviewApi,
  titles: Record<PanelId, string>,
): { bottomGroupId: string } {
  const editor = api.addPanel({
    id: 'editor',
    component: 'editor',
    tabComponent: 'tab',
    title: titles.editor,
  })
  editor.group.locked = true
  const consolePanel = api.addPanel({
    id: 'console',
    component: 'console',
    tabComponent: 'tab',
    title: titles.console,
    position: { referencePanel: 'editor', direction: 'below' },
  })
  api.addPanel({
    id: 'problems',
    component: 'problems',
    tabComponent: 'tab',
    title: titles.problems,
    position: { referencePanel: 'console', direction: 'within' },
  })
  api.addPanel({
    id: 'variables',
    component: 'variables',
    tabComponent: 'tab',
    title: titles.variables,
    position: { referencePanel: 'console', direction: 'within' },
  })
  consolePanel.group.api.setConstraints({ minimumHeight: DEFAULT_BOTTOM_MIN })
  consolePanel.group.api.setSize({ height: api.height * DEFAULT_BOTTOM_FRACTION })
  consolePanel.api.setActive()
  return { bottomGroupId: consolePanel.group.id }
}
