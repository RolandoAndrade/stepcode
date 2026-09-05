import { describe, expect, it } from 'vitest'
import { autoExpandTarget, type ExpandInput } from '../src/shell/autoExpand'

const idle: ExpandInput = { runSeq: 0, pausedInRun: false, pendingInput: null }

describe('autoExpandTarget', () => {
  it('opens the console when a run starts', () => {
    const next = { ...idle, runSeq: 1 }
    expect(autoExpandTarget(idle, next)).toEqual({ panel: 'console', reason: 'run' })
  })

  it('opens variables on the first pause of a run only', () => {
    const paused = { ...idle, runSeq: 1, pausedInRun: true }
    expect(autoExpandTarget({ ...idle, runSeq: 1 }, paused)).toEqual({
      panel: 'variables',
      reason: 'pause',
    })
    expect(autoExpandTarget(paused, paused)).toBeNull()
  })

  it('opens the console when input is requested', () => {
    const input = { ...idle, runSeq: 1, pendingInput: { line: 3, target: null } }
    expect(autoExpandTarget({ ...idle, runSeq: 1 }, input)).toEqual({
      panel: 'console',
      reason: 'input',
    })
    expect(autoExpandTarget(input, input)).toBeNull()
  })

  it('reports nothing when nothing changed', () => {
    expect(autoExpandTarget(idle, idle)).toBeNull()
  })
})
