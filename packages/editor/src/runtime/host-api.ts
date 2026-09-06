import type { ProfileInput } from '@stepcode/profiles'
import type { RunMode, WorkerMessage } from './protocol'

export type HostListener = (message: WorkerMessage) => void

/** Spec §5: the runtime host as the store sees it. `RuntimeHost` implements it; tests fake it. */
export interface HostApi {
  subscribe(listener: HostListener): () => void
  start(source: string, profile: ProfileInput, breakpoints: readonly number[], mode: RunMode): void
  step(): void
  stepOver(): void
  stepOut(): void
  continue(): void
  pause(): void
  input(text: string): void
  setBreakpoints(lines: readonly number[]): void
  stop(): void
  dispose(): void
}
