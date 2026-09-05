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

/** Spec §3.3: the tool-window strips list the panels that are not the editor, in tab order. */
export const SIDEBAR_PANELS: readonly PanelId[] = ['console', 'problems', 'variables']

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
  const pressed = state.visible && state.active
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

  const panelsIn = (zone: Zone): readonly PanelId[] =>
    SIDEBAR_PANELS.filter((id) => states[id].zone === zone)

  const cluster = (zone: Zone, extra: string): ReactNode => (
    <div
      // A strip of panel buttons that also takes their drops: an interactive container needs a
      // role, and this one is a vertical toolbar.
      role="toolbar"
      aria-orientation="vertical"
      data-zone={zone}
      className={`flex min-h-10 flex-col items-center gap-1 py-1 ${extra} ${
        dragging ? 'bg-accent-soft' : ''
      }`}
      onDragOver={(event) => {
        // Only a preventDefault-ed dragover makes an element a drop target.
        if (event.dataTransfer.types.includes(PANEL_MIME)) event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const id = event.dataTransfer.getData(PANEL_MIME) as PanelId
        if (SIDEBAR_PANELS.includes(id)) onMove(id, zone)
      }}
    >
      {panelsIn(zone).map((id) => (
        <PanelButton
          key={id}
          id={id}
          state={states[id]}
          label={strings.panels[id]}
          errors={errors}
          onToggle={onToggle}
          onDragStart={(panel, event) => {
            event.dataTransfer.setData(PANEL_MIME, panel)
            setDragging(true)
          }}
          onDragEnd={() => setDragging(false)}
        />
      ))}
    </div>
  )

  // The right strip only exists once something lives there — or while a drag looks for a home.
  const right = panelsIn('right')
  return (
    <div className="flex h-full w-full">
      <div className="flex w-10 shrink-0 flex-col border-border border-r bg-surface">
        {cluster('left-top', '')}
        {cluster('left-bottom', 'mt-auto')}
      </div>
      {children}
      {right.length > 0 || dragging ? (
        <div className="flex w-10 shrink-0 flex-col border-border border-l bg-surface">
          {cluster('right', 'mt-auto')}
        </div>
      ) : null}
    </div>
  )
}
