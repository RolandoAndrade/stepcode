import type { DockviewApi } from 'dockview-react'

export const DEFAULT_BOTTOM_FRACTION = 0.3
export const DEFAULT_BOTTOM_MIN = 120

/** Spec §3.2: editor alone; Consola, Problemas, Variables as tabs of one group below it. */
export function applyDefaultLayout(api: DockviewApi): { bottomGroupId: string } {
  const editor = api.addPanel({ id: 'editor', component: 'editor', tabComponent: 'tab' })
  editor.group.locked = true
  const consolePanel = api.addPanel({
    id: 'console',
    component: 'console',
    tabComponent: 'tab',
    position: { referencePanel: 'editor', direction: 'below' },
  })
  api.addPanel({
    id: 'problems',
    component: 'problems',
    tabComponent: 'tab',
    position: { referencePanel: 'console', direction: 'within' },
  })
  api.addPanel({
    id: 'variables',
    component: 'variables',
    tabComponent: 'tab',
    position: { referencePanel: 'console', direction: 'within' },
  })
  consolePanel.group.api.setConstraints({ minimumHeight: DEFAULT_BOTTOM_MIN })
  consolePanel.group.api.setSize({ height: api.height * DEFAULT_BOTTOM_FRACTION })
  consolePanel.api.setActive()
  return { bottomGroupId: consolePanel.group.id }
}
