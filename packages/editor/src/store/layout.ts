export type PanelId = 'editor' | 'console' | 'problems' | 'variables'

export const PANEL_IDS: readonly PanelId[] = ['editor', 'console', 'problems', 'variables']

export type SheetPosition = 'collapsed' | 'half' | 'full'

export interface LayoutState {
  /** dockview's `toJSON()`; validated only by dockview itself on `fromJSON`. */
  readonly dockview: Record<string, unknown> | null
  /** ids of collapsed groups (spec §3.3). */
  readonly collapsed: readonly string[]
  readonly sheet: SheetPosition
}

export const DEFAULT_LAYOUT: LayoutState = Object.freeze({
  dockview: null,
  collapsed: [],
  sheet: 'collapsed',
})

export interface PanelRequest {
  readonly id: PanelId
  readonly seq: number
}
