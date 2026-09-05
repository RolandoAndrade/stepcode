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
    readonly classList?: { add(token: string): void; remove(token: string): void }
  }
}

export interface ApiLike {
  readonly groups: readonly GroupLike[]
  getGroup(id: string): GroupLike | undefined
  readonly width: number
  readonly height: number
}

const MIN_RESTORE_FRACTION = 0.3

/** dockview's own default group minimum, restored when the layout set no other one. */
export const DEFAULT_GROUP_MIN = 100

/** The dock's own box: the group rects are viewport rects, so they need its origin to read. */
export interface ContainerRect {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly height: number
}

/** Spec §3.3: `dock.css` rotates the labels of a group collapsed against a left or right edge. */
export const COLLAPSED_VERTICAL_CLASS = 'sc-collapsed-vertical'

/** Which container edge the group touches; ties go to bottom (the default layout's group). */
export function edgeOf(group: GroupLike, container: ContainerRect): Edge {
  const box = group.element?.getBoundingClientRect() ?? {
    top: container.top,
    left: container.left,
    right: container.left + group.api.width,
    bottom: container.top + group.api.height,
    width: group.api.width,
    height: group.api.height,
  }
  // Relative to the container, never to the viewport: the dock sits below the toolbar.
  const top = box.top - container.top
  const bottom = box.bottom - container.top
  const left = box.left - container.left
  const spansWidth = box.width >= container.width - 2
  if (spansWidth) return top <= 1 && bottom < container.height - 1 ? 'top' : 'bottom'
  return left <= 1 ? 'left' : 'right'
}

function vertical(edge: Edge): boolean {
  return edge === 'top' || edge === 'bottom'
}

/**
 * Spec §3.3: shrink the cross-axis to the header height and freeze it there. Both ends of the
 * range move: dockview clamps a size to the minimum whenever the minimum exceeds the maximum, so
 * a maximum alone would leave the group sitting on its old floor (120 px for the default bottom
 * group, 100 px elsewhere) instead of on the header.
 */
export function collapseGroup(
  group: GroupLike,
  edge: Edge,
  headerSize: number,
): { restore: number } {
  const restore = vertical(edge) ? group.api.height : group.api.width
  if (vertical(edge)) {
    group.api.setConstraints({ minimumHeight: headerSize, maximumHeight: headerSize })
    group.api.setSize({ height: headerSize })
  } else {
    group.api.setConstraints({ minimumWidth: headerSize, maximumWidth: headerSize })
    group.api.setSize({ width: headerSize })
    group.element?.classList?.add(COLLAPSED_VERTICAL_CLASS)
  }
  return { restore }
}

/** Undo {@link collapseGroup}: the group gets its size and its old floor back. */
export function expandGroup(group: GroupLike, edge: Edge, restore: number, minimum: number): void {
  group.element?.classList?.remove(COLLAPSED_VERTICAL_CLASS)
  if (vertical(edge)) {
    group.api.setConstraints({
      minimumHeight: minimum,
      maximumHeight: Number.POSITIVE_INFINITY,
    })
    group.api.setSize({ height: restore })
  } else {
    group.api.setConstraints({ minimumWidth: minimum, maximumWidth: Number.POSITIVE_INFINITY })
    group.api.setSize({ width: restore })
  }
}

export class CollapseController {
  private readonly collapsed = new Map<string, { edge: Edge; restore: number; minimum: number }>()

  /**
   * `minimum` is the floor a group gets back when it expands: the default layout's own
   * `minimumHeight` for this dock, or dockview's default when the layout set none.
   */
  constructor(
    private readonly api: ApiLike,
    private readonly headerSize: number,
    private readonly onChange: (ids: string[]) => void,
    private readonly minimum: number = DEFAULT_GROUP_MIN,
  ) {}

  /** The dock's box: dockview reports its size, and the group rects give away its origin. */
  private containerRect(): ContainerRect {
    let top = Number.POSITIVE_INFINITY
    let left = Number.POSITIVE_INFINITY
    for (const group of this.api.groups) {
      const box = group.element?.getBoundingClientRect()
      if (box === undefined) continue
      top = Math.min(top, box.top)
      left = Math.min(left, box.left)
    }
    return {
      top: Number.isFinite(top) ? top : 0,
      left: Number.isFinite(left) ? left : 0,
      width: this.api.width,
      height: this.api.height,
    }
  }

  isCollapsed(id: string): boolean {
    return this.collapsed.has(id)
  }

  collapsedIds(): string[] {
    return [...this.collapsed.keys()]
  }

  collapse(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || group.api.location.type !== 'grid' || this.collapsed.has(id)) return
    const edge = edgeOf(group, this.containerRect())
    const { restore } = collapseGroup(group, edge, this.headerSize)
    const fallback =
      (edge === 'top' || edge === 'bottom' ? this.api.height : this.api.width) *
      MIN_RESTORE_FRACTION
    this.collapsed.set(id, {
      edge,
      restore: restore > this.headerSize ? restore : fallback,
      minimum: this.minimum,
    })
    this.onChange(this.collapsedIds())
  }

  expand(id: string): void {
    const entry = this.collapsed.get(id)
    const group = this.api.getGroup(id)
    if (entry === undefined || group === undefined) return
    expandGroup(group, entry.edge, entry.restore, entry.minimum)
    this.collapsed.delete(id)
    this.onChange(this.collapsedIds())
  }

  toggle(id: string): void {
    if (this.collapsed.has(id)) this.expand(id)
    else this.collapse(id)
  }

  /**
   * After `fromJSON`: re-apply the saved collapsed set; unknown ids are dropped silently. Every
   * other group is freed first — a layout serialized while a group was collapsed carries the
   * header-sized constraint pair with it, and nothing else would ever lift it.
   */
  restoreFrom(ids: readonly string[]): void {
    for (const group of this.api.groups) {
      if (ids.includes(group.id) || group.api.location.type !== 'grid') continue
      group.api.setConstraints({
        minimumHeight: this.minimum,
        minimumWidth: DEFAULT_GROUP_MIN,
        maximumHeight: Number.POSITIVE_INFINITY,
        maximumWidth: Number.POSITIVE_INFINITY,
      })
      group.element?.classList?.remove(COLLAPSED_VERTICAL_CLASS)
    }
    for (const id of ids) this.collapse(id)
  }

  dispose(): void {
    this.collapsed.clear()
  }
}
