import type { PanelId } from '../store/layout'

export interface ExpandInput {
  readonly runSeq: number
  readonly pausedInRun: boolean
  readonly pendingInput: object | null
}

export interface ExpandEvent {
  readonly panel: PanelId
  readonly reason: 'run' | 'pause' | 'input'
}

/** Spec §3.4: which panel an observed store transition wants expanded, if any. */
export function autoExpandTarget(
  previous: ExpandInput,
  next: ExpandInput,
  showConsoleOnRun: boolean,
): ExpandEvent | null {
  if (next.pendingInput !== null && previous.pendingInput === null) {
    return { panel: 'console', reason: 'input' }
  }
  if (next.pausedInRun && !previous.pausedInRun) return { panel: 'variables', reason: 'pause' }
  if (next.runSeq !== previous.runSeq && showConsoleOnRun)
    return { panel: 'console', reason: 'run' }
  return null
}
