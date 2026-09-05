import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import { compile, type Frame, type Run, type StepResult, start } from 'stepcode'
import type { DriverPort, HostMessage, WorkerMessage, WorkerState } from './protocol'

export interface DriverOptions {
  /** Statements per `Run.continue` slice. */
  readonly budget?: number
  /** Wall-clock milliseconds of slices before yielding to the worker's event loop. */
  readonly sliceMillis?: number
  readonly sleep?: (millis: number) => Promise<void>
  readonly now?: () => number
  readonly yield?: () => Promise<void>
}

export interface Driver {
  readonly state: WorkerState
  handle(message: HostMessage): void
}

export const DEFAULT_BUDGET = 5000
export const DEFAULT_SLICE_MILLIS = 30

/** The command an input or wait interrupted, resumed once the answer or the sleep is in. */
type Resume = 'run' | 'step' | 'stepOver' | 'stepOut'

type StartMessage = Extract<HostMessage, { kind: 'start' }>

/** A macrotask that timers cannot clamp: one hop through a `MessageChannel`. */
function defaultYield(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }
    channel.port2.postMessage(null)
  })
}

function defaultSleep(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

/** Spec §4. Attaches to `port.onmessage`; every posted message is spec §3. */
export function createDriver(port: DriverPort, options: DriverOptions = {}): Driver {
  const budget = options.budget ?? DEFAULT_BUDGET
  const sliceMillis = options.sliceMillis ?? DEFAULT_SLICE_MILLIS
  const sleep = options.sleep ?? defaultSleep
  const now = options.now ?? (() => performance.now())
  const yieldToHost = options.yield ?? defaultYield

  let state: WorkerState = 'ready'
  let run: Run | null = null
  let pending: string[] = []
  let pauseRequested = false
  let resume: Resume = 'run'

  const post = (message: WorkerMessage): void => {
    port.postMessage(message)
  }

  const flush = (): void => {
    if (pending.length === 0) return
    const chunks = pending
    pending = []
    post({ kind: 'output', chunks })
  }

  const transition = (next: WorkerState): void => {
    state = next
    post({ kind: 'state', state: next })
  }

  /** `Run.inspect()` keeps reporting main's final frame after `done` (interpreter spec §3.2). */
  const frames = (): readonly Frame[] => run?.inspect() ?? []

  /** Everything before the first `await` runs synchronously, so step results post at once. */
  async function deliver(result: StepResult): Promise<void> {
    flush()
    switch (result.kind) {
      case 'paused':
        transition('paused')
        post({
          kind: 'paused',
          reason: result.reason === 'budget' ? 'pause' : result.reason,
          line: result.line,
          frames: result.frames,
        })
        return
      case 'input':
        transition('input')
        post(
          result.rejected === undefined
            ? { kind: 'input', line: result.line, target: result.target }
            : {
                kind: 'input',
                line: result.line,
                target: result.target,
                rejected: result.rejected,
              },
        )
        return
      case 'wait':
        transition('waiting')
        post({ kind: 'wait', line: result.line, millis: result.millis })
        await sleep(result.millis)
        await resumeInterrupted()
        return
      case 'done':
        transition('done')
        post({ kind: 'done', frames: frames() })
        return
      case 'error':
        transition('error')
        post({ kind: 'error', diagnostic: result.diagnostic, frames: result.frames })
        return
    }
  }

  async function resumeInterrupted(): Promise<void> {
    if (run === null) return
    if (resume === 'run') {
      await runLoop()
    } else {
      await deliver(run[resume]())
    }
  }

  async function runLoop(): Promise<void> {
    const active = run
    if (active === null) return
    resume = 'run'
    pauseRequested = false
    transition('running')
    let sliceStart = now()
    for (;;) {
      const result = active.continue({ budget })
      if (result.kind !== 'paused' || result.reason !== 'budget') {
        await deliver(result)
        return
      }
      if (pauseRequested) {
        pauseRequested = false
        flush()
        transition('paused')
        post({ kind: 'paused', reason: 'pause', line: result.line, frames: result.frames })
        return
      }
      if (now() - sliceStart >= sliceMillis) {
        flush()
        await yieldToHost()
        sliceStart = now()
      }
    }
  }

  function handleStart(message: StartMessage): void {
    if (state !== 'ready' && state !== 'done' && state !== 'error') return
    const profile = resolveProfile(message.profile, builtinProfiles)
    const program = compile(message.source, { profile })
    const firstError = program.diagnostics.find((one) => one.severity === 'error')
    if (firstError !== undefined) {
      run = null
      transition('error')
      post({ kind: 'error', diagnostic: firstError, frames: [] })
      return
    }
    pending = []
    const active = start(program, {
      profile,
      io: {
        write: (text) => {
          pending.push(text)
        },
        clear: () => {
          flush()
          post({ kind: 'clear' })
        },
      },
    })
    active.setBreakpoints(message.breakpoints)
    run = active
    if (message.mode === 'step') {
      resume = 'step'
      void deliver(active.step())
    } else {
      void runLoop()
    }
  }

  function handleInput(text: string): void {
    if (state !== 'input' || run === null) return
    run.input(text)
    if (run.state === 'input') {
      // Rejected: the next command re-reports the request with `rejected` set (§4). Re-ask
      // without announcing `running` for a resume that executes nothing.
      void deliver(run.step())
      return
    }
    void resumeInterrupted()
  }

  function dispatch(message: HostMessage): void {
    switch (message.kind) {
      case 'start':
        handleStart(message)
        return
      case 'step':
      case 'stepOver':
      case 'stepOut':
        if (state !== 'paused' || run === null) return
        resume = message.kind
        void deliver(run[message.kind]())
        return
      case 'continue':
        if (state !== 'paused') return
        void runLoop()
        return
      case 'pause':
        if (state === 'running') pauseRequested = true
        return
      case 'input':
        handleInput(message.text)
        return
      case 'setBreakpoints':
        run?.setBreakpoints(message.lines)
        return
    }
  }

  function handle(message: HostMessage): void {
    try {
      dispatch(message)
    } catch (error) {
      // Never across the port (§4): a defect here must not kill the worker.
      console.error('stepcode driver', error)
    }
  }

  port.onmessage = (event) => {
    handle(event.data)
  }

  return {
    get state() {
      return state
    },
    handle,
  }
}
