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
}

export interface ApiLike {
  readonly groups: readonly GroupLike[]
  getGroup(id: string): GroupLike | undefined
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
 */
export class CollapseController {
  private readonly collapsed = new Set<string>()

  constructor(
    private readonly api: ApiLike,
    private readonly onChange: (ids: string[]) => void,
  ) {}

  isCollapsed(id: string): boolean {
    return this.collapsed.has(id)
  }

  collapsedIds(): string[] {
    return [...this.collapsed]
  }

  collapse(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || group.api.location.type !== 'grid' || this.collapsed.has(id)) return
    group.api.setVisible(false)
    this.collapsed.add(id)
    this.onChange(this.collapsedIds())
  }

  expand(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || !this.collapsed.has(id)) return
    group.api.setVisible(true)
    this.collapsed.delete(id)
    this.onChange(this.collapsedIds())
  }

  toggle(id: string): void {
    if (this.collapsed.has(id)) this.expand(id)
    else this.collapse(id)
  }

  /**
   * After `fromJSON`: re-apply the saved collapsed set; unknown ids are dropped silently. Every
   * other grid group is shown first — a layout serialized while a group was hidden comes back
   * hidden, and nothing else would ever bring it back.
   */
  restoreFrom(ids: readonly string[]): void {
    this.collapsed.clear()
    for (const group of this.api.groups) {
      if (ids.includes(group.id) || group.api.location.type !== 'grid') continue
      group.api.setVisible(true)
    }
    for (const id of ids) this.collapse(id)
  }

  dispose(): void {
    this.collapsed.clear()
  }
}
