import type { ProfileInput } from '@stepcode/profiles'
import type { HostApi, HostListener } from './host-api'
import type { HostMessage, RunMode, WorkerMessage } from './protocol'

export type SpawnWorker = () => Worker

/** Vite turns this literal into a real chunk; `@vitest/web-worker` runs it in tests. */
export function defaultSpawn(): Worker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}

/** Spec §5. Owns the worker; tracks no run state — the store decides what may be sent. */
export class RuntimeHost implements HostApi {
  private worker: Worker | null = null
  /** Bumped on every spawn and terminate, so a late message from an old worker is dropped. */
  private generation = 0
  private readonly listeners = new Set<HostListener>()
  /** Set by `dispose()`. Once true, `post` and `stop` are no-ops: no spawn, no emit. */
  private disposed = false

  constructor(private readonly spawn: SpawnWorker = defaultSpawn) {}

  subscribe(listener: HostListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  start(
    source: string,
    profile: ProfileInput,
    breakpoints: readonly number[],
    mode: RunMode,
  ): void {
    this.post({ kind: 'start', source, profile, breakpoints, mode })
  }

  step(): void {
    this.post({ kind: 'step' })
  }

  stepOver(): void {
    this.post({ kind: 'stepOver' })
  }

  stepOut(): void {
    this.post({ kind: 'stepOut' })
  }

  continue(): void {
    this.post({ kind: 'continue' })
  }

  pause(): void {
    this.post({ kind: 'pause' })
  }

  input(text: string): void {
    this.post({ kind: 'input', text })
  }

  setBreakpoints(lines: readonly number[]): void {
    this.post({ kind: 'setBreakpoints', lines })
  }

  /** Terminate, respawn, and announce `ready` ourselves: a dead worker cannot. No-op once disposed. */
  stop(): void {
    if (this.disposed) return
    this.terminate()
    this.spawnWorker()
    this.emit({ kind: 'state', state: 'ready' })
  }

  dispose(): void {
    this.disposed = true
    this.terminate()
    this.listeners.clear()
  }

  private post(message: HostMessage): void {
    if (this.disposed) return
    ;(this.worker ?? this.spawnWorker()).postMessage(message)
  }

  private spawnWorker(): Worker {
    this.generation += 1
    const generation = this.generation
    const worker = this.spawn()
    const handleMessage = (event: MessageEvent<WorkerMessage>): void => {
      if (generation === this.generation) this.emit(event.data)
    }
    // `@vitest/web-worker` (under happy-dom) fires an `onmessage`-property assignment twice per
    // real worker post; `addEventListener('message', ...)` does not double-fire there, and a real
    // browser Worker supports it identically, so always use it.
    worker.addEventListener('message', handleMessage)
    // `error`/`messageerror` on the worker are deliberately unhandled in 4a — a follow-up.
    this.worker = worker
    return worker
  }

  private terminate(): void {
    if (this.worker === null) return
    this.worker.terminate()
    this.worker = null
    this.generation += 1
  }

  private emit(message: WorkerMessage): void {
    for (const listener of this.listeners) listener(message)
  }
}
