/** The edge of the grid a group is docked against: the one its collapse slides toward. */
export type SlideEdge = 'top' | 'bottom' | 'left' | 'right'

/** A view's box inside its splitview container, in the pixels dockview writes inline. */
export interface SlideBox {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly height: number
}

export interface SlideSize {
  readonly width: number
  readonly height: number
}

/** Which properties a slide writes: only the axis the splitview lays its children out on. */
export type SlideStyle = Partial<Record<'top' | 'left' | 'width' | 'height', string>>

/** Two adjacent views are separated by a sash, so an edge is "touched" a couple of pixels early. */
const TOLERANCE = 2

/**
 * Spec §3.3: a group collapses toward the edge it is docked against, so the bottom group sinks
 * into the bottom edge instead of flying up to the top.
 */
export function slideEdgeOf(box: SlideBox, container: SlideSize): SlideEdge {
  // A group stretches along the axis it is *not* docked on, so the fuller span names the axis.
  const alongWidth = box.width / container.width >= box.height / container.height
  if (alongWidth) return box.top <= TOLERANCE ? 'top' : 'bottom'
  return box.left <= TOLERANCE ? 'left' : 'right'
}

/** Where the view sits fully collapsed against `edge`: the end of a hide, the start of a show. */
export function edgeStyleFor(edge: SlideEdge, container: SlideSize): SlideStyle {
  switch (edge) {
    case 'top':
      return { top: '0px', height: '0px' }
    case 'bottom':
      return { top: `${container.height}px`, height: '0px' }
    case 'left':
      return { left: '0px', width: '0px' }
    default:
      return { left: `${container.width}px`, width: '0px' }
  }
}

/** The view's own box as the same two properties, so a show can animate back onto it. */
export function boxStyleFor(edge: SlideEdge, box: SlideBox): SlideStyle {
  return edge === 'top' || edge === 'bottom'
    ? { top: `${box.top}px`, height: `${box.height}px` }
    : { left: `${box.left}px`, width: `${box.width}px` }
}

/** The DOM a slide touches: dockview's grid slot (`.dv-view`) inside its splitview container. */
export interface SlideView {
  readonly style: { top: string; left: string; width: string; height: string }
  readonly offsetTop: number
  readonly offsetLeft: number
  readonly offsetWidth: number
  readonly offsetHeight: number
  readonly parentElement: { readonly clientWidth: number; readonly clientHeight: number } | null
}

function assign(view: SlideView, style: SlideStyle): void {
  if (style.top !== undefined) view.style.top = style.top
  if (style.left !== undefined) view.style.left = style.left
  if (style.width !== undefined) view.style.width = style.width
  if (style.height !== undefined) view.style.height = style.height
}

/**
 * Prepare one group's slide and hand back the write that starts it.
 *
 * A hidden view is parked at the container's origin with zero size, so an unprepared show grows
 * it downward from the top edge — the bottom group appears to fall out of the toolbar instead of
 * rising from the bottom. `'collapse'` reads the box while it is still there and returns the write
 * that sends it into its own edge; `'expand'` runs after dockview has restored the box, parks the
 * view at that edge without a transition (the reflow is what makes it the starting point) and
 * returns the write that puts the box back, this time with the transition on.
 */
export function prepareSlide(
  view: SlideView | null | undefined,
  phase: 'collapse' | 'expand',
): (() => void) | null {
  const container = view?.parentElement
  if (view === null || view === undefined || container === null || container === undefined) {
    return null
  }
  const size = { width: container.clientWidth, height: container.clientHeight }
  if (size.width === 0 || size.height === 0) return null
  const box = {
    top: view.offsetTop,
    left: view.offsetLeft,
    width: view.offsetWidth,
    height: view.offsetHeight,
  }
  if (box.width === 0 || box.height === 0) return null
  const edge = slideEdgeOf(box, size)
  if (phase === 'collapse') {
    const collapsed = edgeStyleFor(edge, size)
    return () => assign(view, collapsed)
  }
  const expanded = boxStyleFor(edge, box)
  assign(view, edgeStyleFor(edge, size))
  // Reading a layout property flushes the write, so the transition starts from the edge.
  void view.offsetHeight
  return () => assign(view, expanded)
}
