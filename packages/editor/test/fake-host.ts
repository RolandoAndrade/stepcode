import type { ProfileInput } from '@stepcode/profiles'
import type { HostApi, HostListener } from '../src/runtime/host-api'
import type { RunMode, WorkerMessage } from '../src/runtime/protocol'

export interface StartCall {
  readonly source: string
  readonly profile: ProfileInput
  readonly breakpoints: readonly number[]
  readonly mode: RunMode
}

/** Records every command and lets a test speak as the worker. */
export class FakeHost implements HostApi {
  readonly calls: string[] = []
  readonly starts: StartCall[] = []
  private readonly listeners = new Set<HostListener>()

  subscribe(listener: HostListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit(message: WorkerMessage): void {
    for (const listener of this.listeners) listener(message)
  }

  start(
    source: string,
    profile: ProfileInput,
    breakpoints: readonly number[],
    mode: RunMode,
  ): void {
    this.starts.push({ source, profile, breakpoints, mode })
    this.calls.push(`start:${mode}`)
  }

  step(): void {
    this.calls.push('step')
  }

  stepOver(): void {
    this.calls.push('stepOver')
  }

  stepOut(): void {
    this.calls.push('stepOut')
  }

  continue(): void {
    this.calls.push('continue')
  }

  pause(): void {
    this.calls.push('pause')
  }

  input(text: string): void {
    this.calls.push(`input:${text}`)
  }

  setBreakpoints(lines: readonly number[]): void {
    this.calls.push(`setBreakpoints:${lines.join(',')}`)
  }

  stop(): void {
    this.calls.push('stop')
    this.emit({ kind: 'state', state: 'ready' })
  }

  dispose(): void {
    this.calls.push('dispose')
  }
}
