import type { ComponentType } from 'react'
import type { PanelId } from '../store/layout'
import { Braces, Code, type IconProps, Terminal, TriangleAlert } from './icons'

/** One icon per panel, shared by the sidebar, the dock tabs, the phone sheet and the Vista menu. */
export const PANEL_ICONS: Readonly<Record<PanelId, ComponentType<IconProps>>> = {
  editor: Code,
  console: Terminal,
  problems: TriangleAlert,
  variables: Braces,
}
