import type { DockviewTheme } from 'dockview-react'

export const HEADER_HEIGHT = 28

/** Spec §3.1: our chrome, our colors; dockview only supplies the mechanics. */
export const DOCK_THEME: DockviewTheme = {
  name: 'stepcode',
  className: 'sc-dock',
  dndOverlayMounting: 'absolute',
  dndPanelOverlay: 'group',
}
