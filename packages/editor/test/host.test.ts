// @vitest-environment happy-dom
import '@vitest/web-worker'
import { describe, expect, it } from 'vitest'
import { RuntimeHost } from '../src/runtime/host'
import type { HostMessage, WorkerMessage } from '../src/runtime/protocol'
import { type CorpusProgram, corpusProgram, profileInput, type SidecarRun, until } from './helpers'

const es = profileInput('es')

const COUNT = [
  'Proceso Contar',
  '  Definir i Como Entero;',
  '  Para i <- 1 Hasta 3 Hacer',
  '    Escribir i;',
  '  FinPara',
  'FinProceso',
].join('\n')

const LOOP = [
  'Proceso Bucle',
  '  Definir x Como Entero;',
  '  x <- 0;',
  '  Mientras x >= 0 Hacer',
  '    x <- x + 1;',
  '  FinMientras',
  'FinProceso',
].join('\n')

/** A worker stand-in: records what the host posts and lets a test speak as the worker. */
class FakeWorker {
  readonly posted: HostMessage[] = []
  terminated = false
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null = null
  postMessage(message: HostMessage): void {
    this.posted.push(message)
  }
  terminate(): void {
    this.terminated = true
  }
  /** Speak as the worker. */
  say(message: WorkerMessage): void {
    this.onmessage?.({ data: message } as MessageEvent<WorkerMessage>)
  }
  asWorker(): Worker {
    return this as unknown as Worker
  }
}

function fakes(): { host: RuntimeHost; workers: FakeWorker[]; received: WorkerMessage[] } {
  const workers: FakeWorker[] = []
  const host = new RuntimeHost(() => {
    const worker = new FakeWorker()
    workers.push(worker)
    return worker.asWorker()
  })
  const received: WorkerMessage[] = []
  host.subscribe((message) => {
    received.push(message)
  })
  return { host, workers, received }
}

describe('RuntimeHost with a fake worker', () => {
  it('spawns on the first command and posts commands as-is', () => {
    const { host, workers } = fakes()
    expect(workers.length).toBe(0)
    host.start(COUNT, es, [4], 'run')
    expect(workers.length).toBe(1)
    host.step()
    host.stepOver()
    host.stepOut()
    host.continue()
    host.pause()
    host.input('x')
    host.setBreakpoints([1, 2])
    expect(workers[0]?.posted).toEqual([
      { kind: 'start', source: COUNT, profile: es, breakpoints: [4], mode: 'run' },
      { kind: 'step' },
      { kind: 'stepOver' },
      { kind: 'stepOut' },
      { kind: 'continue' },
      { kind: 'pause' },
      { kind: 'input', text: 'x' },
      { kind: 'setBreakpoints', lines: [1, 2] },
    ])
  })

  it('relays worker messages to every subscriber until unsubscribed', () => {
    const { host, workers, received } = fakes()
    const other: WorkerMessage[] = []
    const unsubscribe = host.subscribe((message) => {
      other.push(message)
    })
    host.start(COUNT, es, [], 'run')
    workers[0]?.say({ kind: 'state', state: 'running' })
    unsubscribe()
    workers[0]?.say({ kind: 'done', frames: [] })
    expect(received.map((message) => message.kind)).toEqual(['state', 'done'])
    expect(other.map((message) => message.kind)).toEqual(['state'])
  })

  it('stops by terminating, respawning, and announcing ready', () => {
    const { host, workers, received } = fakes()
    host.start(LOOP, es, [], 'run')
    host.stop()
    expect(workers[0]?.terminated).toBe(true)
    expect(workers.length).toBe(2)
    expect(workers[1]?.terminated).toBe(false)
    expect(received).toEqual([{ kind: 'state', state: 'ready' }])
    host.start(COUNT, es, [], 'step')
    expect(workers.length).toBe(2)
    expect(workers[1]?.posted.map((message) => message.kind)).toEqual(['start'])
  })

  it('drops messages from a terminated generation', () => {
    const { host, workers, received } = fakes()
    host.start(LOOP, es, [], 'run')
    const old = workers[0]
    host.stop()
    old?.say({ kind: 'output', chunks: ['late'] })
    workers[1]?.say({ kind: 'state', state: 'running' })
    expect(received.map((message) => message.kind)).toEqual(['state', 'state'])
    expect(received[1]).toEqual({ kind: 'state', state: 'running' })
  })

  it('disposes without respawning', () => {
    const { host, workers } = fakes()
    host.start(COUNT, es, [], 'run')
    host.dispose()
    expect(workers[0]?.terminated).toBe(true)
    expect(workers.length).toBe(1)
  })

  it('stop before any command still leaves a worker ready', () => {
    const { host, workers, received } = fakes()
    host.stop()
    expect(workers.length).toBe(1)
    expect(received).toEqual([{ kind: 'state', state: 'ready' }])
  })
})

/** Drives one sidecar run through a real worker and returns what the program wrote. */
async function runThrough(
  host: RuntimeHost,
  program: CorpusProgram,
  run: SidecarRun,
): Promise<string> {
  let output = ''
  let next = 0
  let finished = false
  let failure: string | null = null
  const unsubscribe = host.subscribe((message) => {
    switch (message.kind) {
      case 'output':
        output += message.chunks.join('')
        return
      case 'clear':
        output = ''
        return
      case 'input': {
        const text = run.inputs[next]
        next++
        if (text === undefined) failure = 'ran out of inputs'
        else host.input(text)
        return
      }
      case 'done':
        finished = true
        return
      case 'error':
        failure = message.diagnostic.code
        return
      default:
        return
    }
  })
  host.start(program.source, program.profile, [], 'run')
  await until(() => finished || failure !== null)
  unsubscribe()
  if (failure !== null) throw new Error(`${program.slug}: ${failure}`)
  return output
}

describe('RuntimeHost with the real worker', () => {
  it('runs a program in the worker and relays its messages', async () => {
    const host = new RuntimeHost()
    const received: WorkerMessage[] = []
    host.subscribe((message) => {
      received.push(message)
    })
    host.start(COUNT, es, [], 'run')
    await until(() => received.some((message) => message.kind === 'done'))
    expect(received.map((message) => message.kind)).toEqual(['state', 'output', 'state', 'done'])
    expect(received.flatMap((m) => (m.kind === 'output' ? m.chunks : [])).join('')).toBe(
      '1\n2\n3\n',
    )
    host.dispose()
  })

  it('stops an infinite loop and can run again', async () => {
    const host = new RuntimeHost()
    const received: WorkerMessage[] = []
    host.subscribe((message) => {
      received.push(message)
    })
    host.start(LOOP, es, [], 'run')
    await until(() => received.some((m) => m.kind === 'state' && m.state === 'running'))
    host.stop()
    expect(received.at(-1)).toEqual({ kind: 'state', state: 'ready' })
    received.length = 0
    host.start(COUNT, es, [], 'run')
    await until(() => received.some((message) => message.kind === 'done'))
    expect(received.flatMap((m) => (m.kind === 'output' ? m.chunks : [])).join('')).toBe(
      '1\n2\n3\n',
    )
    host.dispose()
  })

  it.each(['fibonacci', 'addition', 'bubble-sort'])(
    'matches the corpus sidecar for %s',
    async (slug) => {
      const program = corpusProgram(slug)
      const host = new RuntimeHost()
      for (const run of program.runs) {
        expect(await runThrough(host, program, run)).toBe(run.output)
      }
      host.dispose()
    },
  )
})
