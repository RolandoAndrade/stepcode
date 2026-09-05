import { describe, expect, it } from 'vitest'
import { autoExpandTarget, type ExpandInput } from '../src/shell/autoExpand'

const idle: ExpandInput = { runSeq: 0, pausedInRun: false, pendingInput: null }

describe('autoExpandTarget', () => {
  it('opens the console when a run starts, unless the setting is off', () => {
    const next = { ...idle, runSeq: 1 }
    expect(autoExpandTarget(idle, next, true)).toEqual({ panel: 'console', reason: 'run' })
    expect(autoExpandTarget(idle, next, false)).toBeNull()
  })

  it('opens variables on the first pause of a run only', () => {
    const paused = { ...idle, runSeq: 1, pausedInRun: true }
    expect(autoExpandTarget({ ...idle, runSeq: 1 }, paused, true)).toEqual({
      panel: 'variables',
      reason: 'pause',
    })
    expect(autoExpandTarget(paused, paused, true)).toBeNull()
  })

  it('opens the console when input is requested', () => {
    const input = { ...idle, runSeq: 1, pendingInput: { line: 3, target: null } }
    expect(autoExpandTarget({ ...idle, runSeq: 1 }, input, true)).toEqual({
      panel: 'console',
      reason: 'input',
    })
    expect(autoExpandTarget(input, input, true)).toBeNull()
  })

  it('reports nothing when nothing changed', () => {
    expect(autoExpandTarget(idle, idle, true)).toBeNull()
  })
})
