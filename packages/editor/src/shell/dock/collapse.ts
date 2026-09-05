export type Edge = 'top' | 'bottom' | 'left' | 'right'

/**
 * The structural subset of `DockviewGroupPanel` collapse needs. `'edge'` is one of dockview's own
 * group locations; it is listed so a real `DockviewApi` stays assignable to {@link ApiLike}, and
 * refused alongside floating and popped-out groups (spec §3.3).
 */
export interface GroupLike {
  readonly id: string
  readonly api: {
    readonly width: number
    readonly height: number
    readonly location: { readonly type: 'grid' | 'floating' | 'popout' | 'edge' }
    setConstraints(value: {
      minimumWidth?: number
      minimumHeight?: number
      maximumWidth?: number
      maximumHeight?: number
    }): void
    setSize(value: { width?: number; height?: number }): void
  }
  readonly element?: {
    getBoundingClientRect(): {
      top: number
      left: number
      right: number
      bottom: number
      width: number
      height: number
    }
  }
}

export interface ApiLike {
  readonly groups: readonly GroupLike[]
  getGroup(id: string): GroupLike | undefined
  readonly width: number
  readonly height: number
}

const MIN_RESTORE_FRACTION = 0.3

/** Which container edge the group touches; ties go to bottom (the default layout's group). */
export function edgeOf(group: GroupLike, container: { width: number; height: number }): Edge {
  const box = group.element?.getBoundingClientRect() ?? {
    top: 0,
    left: 0,
    right: group.api.width,
    bottom: group.api.height,
    width: group.api.width,
    height: group.api.height,
  }
  const spansWidth = box.width >= container.width - 2
  if (spansWidth) return box.top <= 1 && box.bottom < container.height - 1 ? 'top' : 'bottom'
  return box.left <= 1 ? 'left' : 'right'
}

function vertical(edge: Edge): boolean {
  return edge === 'top' || edge === 'bottom'
}

/** Spec §3.3: shrink the cross-axis to the header height and freeze it there. */
export function collapseGroup(
  group: GroupLike,
  edge: Edge,
  headerSize: number,
): { restore: number } {
  const restore = vertical(edge) ? group.api.height : group.api.width
  if (vertical(edge)) {
    group.api.setConstraints({ maximumHeight: headerSize })
    group.api.setSize({ height: headerSize })
  } else {
    group.api.setConstraints({ maximumWidth: headerSize })
    group.api.setSize({ width: headerSize })
  }
  return { restore }
}

export function expandGroup(group: GroupLike, edge: Edge, restore: number): void {
  if (vertical(edge)) {
    group.api.setConstraints({ maximumHeight: Number.POSITIVE_INFINITY })
    group.api.setSize({ height: restore })
  } else {
    group.api.setConstraints({ maximumWidth: Number.POSITIVE_INFINITY })
    group.api.setSize({ width: restore })
  }
}

export class CollapseController {
  private readonly collapsed = new Map<string, { edge: Edge; restore: number }>()

  constructor(
    private readonly api: ApiLike,
    private readonly headerSize: number,
    private readonly onChange: (ids: string[]) => void,
  ) {}

  isCollapsed(id: string): boolean {
    return this.collapsed.has(id)
  }

  collapsedIds(): string[] {
    return [...this.collapsed.keys()]
  }

  collapse(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || group.api.location.type !== 'grid' || this.collapsed.has(id)) return
    const edge = edgeOf(group, this.api)
    const { restore } = collapseGroup(group, edge, this.headerSize)
    const fallback =
      (edge === 'top' || edge === 'bottom' ? this.api.height : this.api.width) *
      MIN_RESTORE_FRACTION
    this.collapsed.set(id, { edge, restore: restore > this.headerSize ? restore : fallback })
    this.onChange(this.collapsedIds())
  }

  expand(id: string): void {
    const entry = this.collapsed.get(id)
    const group = this.api.getGroup(id)
    if (entry === undefined || group === undefined) return
    expandGroup(group, entry.edge, entry.restore)
    this.collapsed.delete(id)
    this.onChange(this.collapsedIds())
  }

  toggle(id: string): void {
    if (this.collapsed.has(id)) this.expand(id)
    else this.collapse(id)
  }

  /** After `fromJSON`: re-apply the saved collapsed set; unknown ids are dropped silently. */
  restoreFrom(ids: readonly string[]): void {
    for (const id of ids) this.collapse(id)
  }

  dispose(): void {
    this.collapsed.clear()
  }
}
