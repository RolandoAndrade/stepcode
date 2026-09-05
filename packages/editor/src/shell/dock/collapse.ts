/**
 * The structural subset of `DockviewGroupPanel` collapse needs. `'edge'` is one of dockview's own
 * group locations; it is listed so a real `DockviewApi` stays assignable to {@link ApiLike}, and
 * refused alongside floating and popped-out groups (spec §3.3).
 */
export interface GroupLike {
  readonly id: string
  readonly api: {
    readonly location: { readonly type: 'grid' | 'floating' | 'popout' | 'edge' }
    setVisible(isVisible: boolean): void
  }
  /**
   * A hidden group is a zero-sized box, not a `display: none` one: its tab strip, chevron and
   * panel actions stay in the tab order and in the accessibility tree unless they are made inert.
   * Optional because dockview's `getGroup` is typed as the interface, which omits the element the
   * class it returns actually has.
   */
  readonly element?: { inert: boolean }
}

export interface ApiLike {
  readonly groups: readonly GroupLike[]
  getGroup(id: string): GroupLike | undefined
}

/** The dock root, `.sc-dock`: what `dock.css` hangs the collapse transition off. */
export interface RootLike {
  readonly classList: { add(token: string): void; remove(token: string): void }
  addEventListener(type: 'transitionend', listener: (event: { target: unknown }) => void): void
  removeEventListener(type: 'transitionend', listener: (event: { target: unknown }) => void): void
}

/**
 * What the shell needs to animate a collapse: the dock root to mark, and a way to make dockview
 * re-measure. `defaultRenderer="always"` renders every panel into an overlay positioned from the
 * group's rect, and that rect is read one frame after a dimension change — mid-transition it is
 * still the old one, so without a relayout per frame the panels stay at their old size and the
 * expanded group renders blank behind the editor's overlay.
 */
export interface DockAnimation {
  readonly root: RootLike
  readonly relayout: () => void
}

/** While it is on the dock root, dockview's grid views animate their position and size. */
export const ANIMATING_CLASS = 'sc-animating'

/** The class dockview puts on a grid slot: the only transitions that end this animation. */
const VIEW_CLASS = 'dv-view'

/**
 * A transition that never ends (an interrupted one, a view that was already at its target size)
 * would leave the dock animating into the next sash drag, so the mark also expires on its own.
 */
export const ANIMATION_FALLBACK_MS = 250

function setInert(group: GroupLike, value: boolean): void {
  if (group.element !== undefined) group.element.inert = value
}

function isGridView(target: unknown): boolean {
  const classList = (target as { classList?: { contains?(token: string): boolean } } | null)
    ?.classList
  return typeof classList?.contains === 'function' && classList.contains(VIEW_CLASS)
}

/**
 * Spec §3.3: a collapsed group is hidden outright — `setVisible(false)` on the grid view. Dockview
 * caches the hidden view's size and clamps it back when the view is shown again, so the previous
 * size needs no bookkeeping here, and its JSON carries the hidden state (`visible: false`) across
 * a reload. The collapsed set is still kept next to the layout (§7) because it is the shell's own
 * truth: `fromJSON` restores a hidden view without firing the visibility event, so the group's
 * `api.isVisible` cannot be read back afterwards.
 *
 * Only grid groups collapse. Dockview would hide a floating group's overlay and merely warn for a
 * popped-out one, but neither has a chevron (§3.3), so both are refused here too.
 *
 * Hiding and showing are marked on the dock root so the grid slides instead of jumping; the mark
 * is only ever on around a collapse, never while the user drags a sash.
 */
export class CollapseController {
  private readonly collapsed = new Set<string>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private frame: number | null = null
  private muted = false

  constructor(
    private readonly api: ApiLike,
    private readonly onChange: (ids: string[]) => void,
    private readonly animation: DockAnimation | null = null,
  ) {}

  private readonly onTransitionEnd = (event: { target: unknown }): void => {
    // Only the grid slots slide; a tab's colour transition must not cut the animation short.
    if (isGridView(event.target)) this.endAnimation()
  }

  private readonly endAnimation = (): void => {
    if (this.timer === null) return
    clearTimeout(this.timer)
    this.timer = null
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame)
      this.frame = null
    }
    const animation = this.animation
    if (animation === null) return
    animation.root.classList.remove(ANIMATING_CLASS)
    animation.root.removeEventListener('transitionend', this.onTransitionEnd)
    // The frames are over and the geometry is final: this pass is what leaves the panels right.
    animation.relayout()
  }

  private readonly onFrame = (): void => {
    this.frame = null
    if (this.timer === null) return
    this.animation?.relayout()
    this.frame = requestAnimationFrame(this.onFrame)
  }

  /**
   * Building, resetting or restoring a layout lands on its geometry in one pass; only a change
   * the user asked for slides. Everything `run` collapses or expands skips the animation.
   */
  withoutAnimation(run: () => void): void {
    this.muted = true
    try {
      run()
    } finally {
      this.muted = false
    }
  }

  /** Mark the dock just before the grid is relaid out; the first finished transition clears it. */
  private beginAnimation(): void {
    const animation = this.animation
    if (animation === null || this.muted) return
    if (this.timer === null) animation.root.addEventListener('transitionend', this.onTransitionEnd)
    else clearTimeout(this.timer)
    animation.root.classList.add(ANIMATING_CLASS)
    this.timer = setTimeout(this.endAnimation, ANIMATION_FALLBACK_MS)
    if (this.frame === null) this.frame = requestAnimationFrame(this.onFrame)
  }

  isCollapsed(id: string): boolean {
    return this.collapsed.has(id)
  }

  collapsedIds(): string[] {
    return [...this.collapsed]
  }

  collapse(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || group.api.location.type !== 'grid' || this.collapsed.has(id)) return
    this.beginAnimation()
    group.api.setVisible(false)
    setInert(group, true)
    this.collapsed.add(id)
    this.onChange(this.collapsedIds())
  }

  expand(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || !this.collapsed.has(id)) return
    this.beginAnimation()
    group.api.setVisible(true)
    setInert(group, false)
    this.collapsed.delete(id)
    this.onChange(this.collapsedIds())
  }

  toggle(id: string): void {
    if (this.collapsed.has(id)) this.expand(id)
    else this.collapse(id)
  }

  /**
   * After `fromJSON`: re-apply the saved collapsed set; ids that name no grid group are dropped
   * silently — the persisted list is plain strings, and a stale one must not hide the editor.
   * Every other grid group is shown first: a layout serialized while a group was hidden comes
   * back hidden, and nothing else would ever bring it back.
   */
  restoreFrom(ids: readonly string[]): void {
    this.withoutAnimation(() => {
      this.collapsed.clear()
      const wanted = ids.filter((id) => this.api.getGroup(id)?.api.location.type === 'grid')
      for (const group of this.api.groups) {
        if (wanted.includes(group.id) || group.api.location.type !== 'grid') continue
        group.api.setVisible(true)
        setInert(group, false)
      }
      for (const id of wanted) this.collapse(id)
    })
  }

  dispose(): void {
    this.endAnimation()
    this.collapsed.clear()
  }
}
