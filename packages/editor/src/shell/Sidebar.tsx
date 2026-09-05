import type { DragEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useEditorStore } from '../store/context'
import type { PanelId } from '../store/layout'
import { stringsOf } from '../store/store'
import { PANEL_ICONS } from '../ui/panelIcons'
import { IconButton } from '../ui/Tooltip'

/** Where a panel's button sits: the strip on the side of the editor its group is docked on. */
export type Zone = 'left-top' | 'left-bottom' | 'right'

export interface PanelState {
  /** False while the panel's group is collapsed, i.e. hidden from the grid (spec §3.3). */
  readonly visible: boolean
  /** Whether the panel is the active tab of its own group. */
  readonly active: boolean
  readonly zone: Zone
}

export type PanelStates = Readonly<Record<PanelId, PanelState>>

/**
 * Spec §3.3: the strips list every panel, the editor first — its button focuses the editor and,
 * dragged, moves it, but it never hides.
 */
export const SIDEBAR_PANELS: readonly PanelId[] = ['editor', 'console', 'problems', 'variables']

/** A drag that carries a panel id, so a drop from anywhere else is ignored. */
export const PANEL_MIME = 'application/x-stepcode-panel'

function PanelButton({
  id,
  state,
  label,
  errors,
  onToggle,
  onDragStart,
  onDragEnd,
}: {
  id: PanelId
  state: PanelState
  label: string
  errors: number
  onToggle: (id: PanelId) => void
  onDragStart: (id: PanelId, event: DragEvent) => void
  onDragEnd: () => void
}) {
  const Icon = PANEL_ICONS[id]
  // The editor is always open and always its group's only tab: a permanent accent says nothing.
  const pressed = id !== 'editor' && state.visible && state.active
  return (
    <div className="relative flex items-center justify-center">
      {pressed ? (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-0 w-0.5 rounded-r-sm bg-accent"
        />
      ) : null}
      <IconButton
        label={label}
        active={pressed}
        onClick={() => onToggle(id)}
        draggable
        onDragStart={(event) => onDragStart(id, event)}
        onDragEnd={onDragEnd}
      >
        <span className={pressed ? undefined : 'text-muted'}>
          <Icon />
        </span>
      </IconButton>
      {id === 'problems' && errors > 0 ? (
        // The count is announced by the status bar and the Problemas panel already.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 rounded-sm bg-error px-1 text-[10px] text-on-error leading-[1.4]"
        >
          {errors}
        </span>
      ) : null}
    </div>
  )
}

/**
 * The JetBrains-style tool-window bars: a 40 px strip down each side of the dock whose buttons
 * show, hide and switch the panels, and whose icons can be dragged from one strip to another to
 * dock the panel on that edge (spec §3.3). It only draws what it is given; the shell owns the dock,
 * which it renders between the two strips.
 */
export function Sidebar({
  states,
  onToggle,
  onMove,
  children,
}: {
  states: PanelStates
  onToggle: (id: PanelId) => void
  onMove: (id: PanelId, zone: Zone) => void
  children?: ReactNode
}) {
  const strings = useEditorStore(stringsOf)
  const errors = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'error').length)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState<Zone | null>(null)

  const panelsIn = (zone: Zone): readonly PanelId[] =>
    SIDEBAR_PANELS.filter((id) => states[id].zone === zone)

  const button = (id: PanelId): ReactNode => (
    <PanelButton
      key={id}
      id={id}
      state={states[id]}
      label={strings.panels[id]}
      errors={errors}
      onToggle={onToggle}
      onDragStart={(panel, event) => {
        event.dataTransfer.setData(PANEL_MIME, panel)
        event.dataTransfer.effectAllowed = 'move'
        setDragging(true)
      }}
      onDragEnd={() => {
        setDragging(false)
        setHovered(null)
      }}
    />
  )

  const cluster = (zone: Zone, extra: string): ReactNode => {
    const panels = panelsIn(zone)
    const lead = panels.filter((id) => id === 'editor')
    const rest = panels.filter((id) => id !== 'editor')
    return (
      // A drop target for panel icons, not a widget: it has no keyboard behaviour to promise.
      // biome-ignore lint/a11y/noStaticElementInteractions: the buttons inside carry the roles.
      <div
        data-zone={zone}
        // Each cluster takes half its strip, so a drop anywhere on it lands in one of the zones.
        className={`flex flex-1 flex-col items-center gap-1 py-1 ${extra} ${
          hovered === zone ? 'bg-accent-soft' : dragging ? 'bg-accent-soft/40' : ''
        }`}
        onDragOver={(event) => {
          // Only a preventDefault-ed dragover makes an element a drop target.
          if (!event.dataTransfer.types.includes(PANEL_MIME)) return
          event.dataTransfer.dropEffect = 'move'
          event.preventDefault()
          setHovered(zone)
        }}
        onDragLeave={() => setHovered((current) => (current === zone ? null : current))}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          setHovered(null)
          const id = event.dataTransfer.getData(PANEL_MIME) as PanelId
          if (SIDEBAR_PANELS.includes(id)) onMove(id, zone)
        }}
      >
        <div className="flex flex-col items-center gap-1">{lead.map(button)}</div>
        <div className="flex flex-col items-center gap-1">{rest.map(button)}</div>
      </div>
    )
  }

  // The right strip only exists once something lives there — or while a drag looks for a home.
  const right = panelsIn('right')
  return (
    <div className="flex h-full w-full">
      <div className="flex w-10 shrink-0 flex-col border-border border-r bg-surface">
        {cluster('left-top', 'justify-start')}
        {cluster('left-bottom', 'justify-end')}
      </div>
      {children}
      {right.length > 0 || dragging ? (
        <div className="flex w-10 shrink-0 flex-col border-border border-l bg-surface">
          {cluster('right', 'justify-between')}
        </div>
      ) : null}
    </div>
  )
}
