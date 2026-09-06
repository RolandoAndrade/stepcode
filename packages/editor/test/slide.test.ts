import { describe, expect, it } from 'vitest'
import {
  boxStyleFor,
  edgeStyleFor,
  prepareSlide,
  type SlideView,
  slideEdgeOf,
} from '../src/shell/dock/slide'

const CONTAINER = { width: 1000, height: 600 }

function view(box: { top: number; left: number; width: number; height: number }): SlideView & {
  style: Record<string, string>
  reflows: number
} {
  const style: Record<string, string> = {}
  return {
    style,
    reflows: 0,
    offsetTop: box.top,
    offsetLeft: box.left,
    offsetWidth: box.width,
    offsetHeight: box.height,
    parentElement: { clientWidth: CONTAINER.width, clientHeight: CONTAINER.height },
  } as SlideView & { style: Record<string, string>; reflows: number }
}

describe('slideEdgeOf', () => {
  it('names the edge a group is docked against', () => {
    expect(slideEdgeOf({ top: 420, left: 0, width: 1000, height: 180 }, CONTAINER)).toBe('bottom')
    expect(slideEdgeOf({ top: 0, left: 0, width: 1000, height: 180 }, CONTAINER)).toBe('top')
    expect(slideEdgeOf({ top: 0, left: 700, width: 300, height: 600 }, CONTAINER)).toBe('right')
    expect(slideEdgeOf({ top: 0, left: 0, width: 300, height: 600 }, CONTAINER)).toBe('left')
  })

  it('takes the nearest edge when the group spans both axes or neither', () => {
    // A group beside the editor but under a top group spans nothing fully; it is still on the
    // right, which is the edge it touches.
    expect(slideEdgeOf({ top: 40, left: 700, width: 300, height: 560 }, CONTAINER)).toBe('right')
    expect(slideEdgeOf({ top: 0, left: 0, width: 1000, height: 600 }, CONTAINER)).toBe('top')
  })
})

describe('edgeStyleFor / boxStyleFor', () => {
  it('collapses a group into its own edge, on that edge’s axis only', () => {
    expect(edgeStyleFor('bottom', CONTAINER)).toEqual({ top: '600px', height: '0px' })
    expect(edgeStyleFor('top', CONTAINER)).toEqual({ top: '0px', height: '0px' })
    expect(edgeStyleFor('right', CONTAINER)).toEqual({ left: '1000px', width: '0px' })
    expect(edgeStyleFor('left', CONTAINER)).toEqual({ left: '0px', width: '0px' })
    expect(boxStyleFor('bottom', { top: 420, left: 0, width: 1000, height: 180 })).toEqual({
      top: '420px',
      height: '180px',
    })
    expect(boxStyleFor('right', { top: 0, left: 700, width: 300, height: 600 })).toEqual({
      left: '700px',
      width: '300px',
    })
  })
})

describe('prepareSlide', () => {
  it('sends a hiding bottom group down into the bottom edge', () => {
    const bottom = view({ top: 420, left: 0, width: 1000, height: 180 })
    const run = prepareSlide(bottom, 'collapse')
    // Nothing is written until dockview has hidden the view: the write is the animation's target.
    expect(bottom.style).toEqual({})
    run?.()
    expect(bottom.style).toEqual({ top: '600px', height: '0px' })
  })

  it('parks a showing group on its edge and hands back the write onto its box', () => {
    const bottom = view({ top: 420, left: 0, width: 1000, height: 180 })
    const run = prepareSlide(bottom, 'expand')
    // The park happens now, before the dock is marked, so it is not the thing that animates.
    expect(bottom.style).toEqual({ top: '600px', height: '0px' })
    run?.()
    expect(bottom.style).toEqual({ top: '420px', height: '180px' })
  })

  it('moves a side group along its own axis', () => {
    const side = view({ top: 0, left: 700, width: 300, height: 600 })
    prepareSlide(side, 'expand')?.()
    expect(side.style).toEqual({ left: '700px', width: '300px' })
  })

  it('does nothing without a box to measure', () => {
    expect(prepareSlide(null, 'expand')).toBeNull()
    expect(prepareSlide(view({ top: 0, left: 0, width: 0, height: 0 }), 'collapse')).toBeNull()
    const orphan = view({ top: 0, left: 0, width: 100, height: 100 })
    expect(prepareSlide({ ...orphan, parentElement: null }, 'collapse')).toBeNull()
  })
})
