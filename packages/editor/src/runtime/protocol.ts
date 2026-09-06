import type { ProfileInput } from '@stepcode/profiles'
import type { Diagnostic, Frame, Type } from 'stepcode'

export type RunMode = 'run' | 'step'

/** Spec §3. Every member is structured-clone safe. */
export type HostMessage =
  | {
      readonly kind: 'start'
      readonly source: string
      readonly profile: ProfileInput
      readonly breakpoints: readonly number[]
      readonly mode: RunMode
    }
  | { readonly kind: 'step' }
  | { readonly kind: 'stepOver' }
  | { readonly kind: 'stepOut' }
  | { readonly kind: 'continue' }
  | { readonly kind: 'pause' }
  | { readonly kind: 'input'; readonly text: string }
  | { readonly kind: 'setBreakpoints'; readonly lines: readonly number[] }

export type WorkerState = 'ready' | 'running' | 'paused' | 'input' | 'waiting' | 'done' | 'error'

export type PauseReason = 'step' | 'breakpoint' | 'pause'

export interface InputTarget {
  readonly name: string
  readonly type: Type
}

export type WorkerMessage =
  | { readonly kind: 'state'; readonly state: WorkerState }
  | { readonly kind: 'output'; readonly chunks: readonly string[] }
  | { readonly kind: 'clear' }
  | {
      readonly kind: 'paused'
      readonly reason: PauseReason
      readonly line: number
      readonly frames: readonly Frame[]
    }
  | {
      readonly kind: 'input'
      readonly line: number
      readonly target: InputTarget | null
      readonly rejected?: Diagnostic
    }
  | { readonly kind: 'wait'; readonly line: number; readonly millis: number }
  | { readonly kind: 'done'; readonly frames: readonly Frame[] }
  | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: readonly Frame[] }

/** What the driver needs from a worker's global scope — or from a test's recording port. */
export interface DriverPort {
  postMessage(message: WorkerMessage): void
  onmessage: ((event: { readonly data: HostMessage }) => void) | null
}
