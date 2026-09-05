import { type PointerEvent, type ReactNode, useRef } from 'react'
import type { SheetPosition } from '../../store/layout'
import { ChevronDown, ChevronUp } from '../../ui/icons'

const DRAG_THRESHOLD = 40
const ORDER: readonly SheetPosition[] = ['collapsed', 'half', 'full']

export function nextPosition(
  current: SheetPosition,
  gesture: 'tap' | 'up' | 'down',
): SheetPosition {
  const index = ORDER.indexOf(current)
  if (gesture === 'tap') return ORDER[(index + 1) % ORDER.length] ?? 'collapsed'
  const next = gesture === 'up' ? index + 1 : index - 1
  return ORDER[Math.max(0, Math.min(ORDER.length - 1, next))] ?? current
}

/** Spec §9: collapsed strip, half, full. */
const HEIGHT: Readonly<Record<SheetPosition, string>> = {
  collapsed: 'h-9',
  half: 'h-[45%]',
  full: 'h-[calc(100%-44px)]',
}

export function BottomSheet<T extends string>({
  position,
  onPosition,
  tabs,
  active,
  onActive,
  actions,
  labels,
  children,
}: {
  position: SheetPosition
  onPosition: (next: SheetPosition) => void
  tabs: readonly { id: T; label: string }[]
  active: T
  onActive: (id: T) => void
  actions: ReactNode
  labels: { collapse: string; expand: string; sheet: string }
  children: (id: T) => ReactNode
}) {
  const start = useRef<number | null>(null)
  const onPointerDown = (event: PointerEvent): void => {
    start.current = event.clientY
  }
  const onPointerUp = (event: PointerEvent): void => {
    const from = start.current
    start.current = null
    if (from === null) return
    const delta = from - event.clientY
    if (Math.abs(delta) < DRAG_THRESHOLD) return
    onPosition(nextPosition(position, delta > 0 ? 'up' : 'down'))
  }
  return (
    <section
      aria-label={labels.sheet}
      className={`flex ${HEIGHT[position]} min-h-9 flex-col border-border border-t bg-surface transition-[height] duration-150`}
    >
      <div
        className="flex h-9 shrink-0 touch-none items-center gap-1 px-2"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div role="tablist" className="flex flex-1 items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === active}
              onClick={() => {
                onActive(tab.id)
                if (position === 'collapsed') onPosition('half')
              }}
              className={`h-9 px-3 text-xs ${tab.id === active ? 'border-accent border-b-2 text-fg' : 'text-muted'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {position === 'collapsed' ? null : actions}
        <button
          type="button"
          aria-label={position === 'collapsed' ? labels.expand : labels.collapse}
          onClick={() => onPosition(position === 'collapsed' ? 'half' : 'collapsed')}
          className="flex h-9 w-11 items-center justify-center"
        >
          {position === 'collapsed' ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      {position === 'collapsed' ? null : <div className="min-h-0 flex-1">{children(active)}</div>}
    </section>
  )
}
