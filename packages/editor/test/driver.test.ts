import { describe, expect, it } from 'vitest'
import { createDriver, type DriverOptions } from '../src/runtime/driver'
import type { HostMessage, WorkerMessage } from '../src/runtime/protocol'
import { profileInput, type RecordingPort, recordingPort, until } from './helpers'

const es = profileInput('es')

const COUNT = [
  'Proceso Contar',
  '  Definir i Como Entero;',
  '  Para i <- 1 Hasta 3 Hacer',
  '    Escribir i;',
  '  FinPara',
  'FinProceso',
].join('\n')

const GREET = [
  'Proceso Saludo',
  '  Definir nombre Como Cadena;',
  "  Escribir 'Nombre';",
  '  Leer nombre;',
  "  Escribir 'Hola ', nombre;",
  'FinProceso',
].join('\n')

const NUMBER = [
  'Proceso Numero',
  '  Definir n Como Entero;',
  '  Leer n;',
  '  Escribir n * 2;',
  'FinProceso',
].join('\n')

const WAIT = [
  'Proceso Pausa',
  "  Escribir 'a';",
  '  Esperar 50;',
  "  Escribir 'b';",
  'FinProceso',
].join('\n')

const CLEAR = [
  'Proceso Limpio',
  "  Escribir 'a';",
  '  Limpiar Pantalla;',
  "  Escribir 'b';",
  'FinProceso',
].join('\n')

const CALL = [
  'SubProceso Saludar(veces Como Entero)',
  '  Definir k Como Entero;',
  '  Para k <- 1 Hasta veces Hacer',
  "    Escribir 'hola';",
  '  FinPara',
  'FinSubProceso',
  '',
  'Proceso Principal',
  "  Escribir 'inicio';",
  '  Saludar(2);',
  "  Escribir 'fin';",
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

const BROKEN = ['Proceso Roto', '  Escribir x;', 'FinProceso'].join('\n')

function startMessage(
  source: string,
  mode: 'run' | 'step',
  breakpoints: readonly number[] = [],
): HostMessage {
  return { kind: 'start', source, profile: es, breakpoints, mode }
}

/** A driver over a recording port with instant sleeps and a yield on every slice. */
function harness(options: DriverOptions = {}): {
  port: RecordingPort
  driver: ReturnType<typeof createDriver>
} {
  const port = recordingPort()
  const driver = createDriver(port, { sleep: async () => {}, ...options })
  return { port, driver }
}

function last<K extends WorkerMessage['kind']>(
  port: RecordingPort,
  kind: K,
): Extract<WorkerMessage, { kind: K }> {
  const found = [...port.posted].reverse().find((message) => message.kind === kind)
  if (found === undefined) throw new Error(`no ${kind} message; got ${port.kinds().join(', ')}`)
  return found as Extract<WorkerMessage, { kind: K }>
}

function states(port: RecordingPort): string[] {
  return port.posted.flatMap((message) => (message.kind === 'state' ? [message.state] : []))
}

describe('start', () => {
  it('refuses a program with an error diagnostic and reports the first one', () => {
    const { port, driver } = harness()
    port.send(startMessage(BROKEN, 'run'))
    expect(port.kinds()).toEqual(['state', 'error'])
    expect(states(port)).toEqual(['error'])
    const error = last(port, 'error')
    expect(error.diagnostic.code).toBe('E3001')
    expect(error.frames).toEqual([])
    expect(driver.state).toBe('error')
  })

  it('runs a program to the end, posting output before done and no budget pauses', async () => {
    const { port } = harness()
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(port.kinds()).toEqual(['state', 'output', 'state', 'done'])
    expect(states(port)).toEqual(['running', 'done'])
    expect(port.text()).toBe('1\n2\n3\n')
    expect(last(port, 'done').frames[0]?.variables.map((v) => v.name)).toEqual(['i'])
  })

  it('in step mode executes the first statement and pauses', () => {
    const { port, driver } = harness()
    port.send(startMessage(COUNT, 'step'))
    expect(port.kinds()).toEqual(['state', 'paused'])
    const paused = last(port, 'paused')
    expect(paused.reason).toBe('step')
    expect(paused.frames[0]?.name).toBe('Contar')
    expect(driver.state).toBe('paused')
  })

  it('can start again after done and after a refusal', async () => {
    const { port } = harness()
    port.send(startMessage(BROKEN, 'run'))
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().filter((kind) => kind === 'done').length === 2)
    expect(port.text()).toBe('1\n2\n3\n1\n2\n3\n')
  })
})

describe('stepping', () => {
  it('steps to the end and ignores commands that are illegal in done', () => {
    const { port, driver } = harness()
    port.send(startMessage(COUNT, 'step'))
    for (let i = 0; i < 50 && driver.state === 'paused'; i++) port.send({ kind: 'step' })
    expect(driver.state).toBe('done')
    expect(port.text()).toBe('1\n2\n3\n')
    const before = port.posted.length
    port.send({ kind: 'step' })
    port.send({ kind: 'continue' })
    port.send({ kind: 'pause' })
    port.send({ kind: 'input', text: 'x' })
    expect(port.posted.length).toBe(before)
  })

  it('steps over a call without entering it', () => {
    const { port } = harness()
    port.send(startMessage(CALL, 'step'))
    expect(last(port, 'paused').line).toBe(10)
    port.send({ kind: 'stepOver' })
    const paused = last(port, 'paused')
    expect(paused.line).toBe(11)
    expect(paused.frames.map((frame) => frame.name)).toEqual(['Principal'])
    expect(port.text()).toBe('inicio\nhola\nhola\n')
  })

  it('steps into a call and out of it', () => {
    const { port } = harness()
    port.send(startMessage(CALL, 'step'))
    port.send({ kind: 'step' })
    let paused = last(port, 'paused')
    expect(paused.frames.map((frame) => frame.name)).toEqual(['Saludar', 'Principal'])
    port.send({ kind: 'stepOut' })
    paused = last(port, 'paused')
    expect(paused.frames.map((frame) => frame.name)).toEqual(['Principal'])
    expect(paused.line).toBe(11)
    expect(port.text()).toBe('inicio\nhola\nhola\n')
  })

  it('ignores step commands while ready', () => {
    const { port } = harness()
    port.send({ kind: 'step' })
    port.send({ kind: 'stepOver' })
    port.send({ kind: 'stepOut' })
    port.send({ kind: 'continue' })
    expect(port.posted).toEqual([])
  })
})

describe('run loop', () => {
  it('flushes output once per slice', async () => {
    let clock = 0
    const { port } = harness({
      budget: 1,
      sliceMillis: 1,
      now: () => clock++,
      yield: async () => {},
    })
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(port.posted.filter((message) => message.kind === 'output').length).toBe(3)
    expect(port.text()).toBe('1\n2\n3\n')
    expect(port.kinds()).not.toContain('paused')
  })

  it('does not yield inside one slice', async () => {
    let yields = 0
    const { port } = harness({
      budget: 1,
      sliceMillis: 1000,
      now: () => 0,
      yield: async () => {
        yields++
      },
    })
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(yields).toBe(0)
    expect(port.posted.filter((message) => message.kind === 'output').length).toBe(1)
  })

  it('pauses between slices when asked and continues afterwards', async () => {
    let clock = 0
    const port = recordingPort()
    createDriver(port, {
      budget: 1,
      sliceMillis: 1,
      now: () => clock++,
      yield: async () => {
        port.send({ kind: 'pause' })
      },
    })
    port.send(startMessage(LOOP, 'run'))
    await until(() => port.kinds().includes('paused'))
    const paused = last(port, 'paused')
    expect(paused.reason).toBe('pause')
    expect(paused.frames[0]?.name).toBe('Bucle')
    expect(states(port)).toEqual(['running', 'paused'])
    port.send({ kind: 'continue' })
    await until(() => port.posted.filter((message) => message.kind === 'paused').length === 2)
    expect(states(port)).toEqual(['running', 'paused', 'running', 'paused'])
    const x = last(port, 'paused').frames[0]?.variables.find((v) => v.name === 'x')
    expect(typeof x?.value).toBe('number')
  })

  it('honours breakpoints set during a run', async () => {
    let clock = 0
    const port = recordingPort()
    let sent = false
    createDriver(port, {
      budget: 1,
      sliceMillis: 1,
      now: () => clock++,
      yield: async () => {
        if (!sent) {
          sent = true
          port.send({ kind: 'setBreakpoints', lines: [4] })
        }
      },
    })
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('paused'))
    const paused = last(port, 'paused')
    expect(paused.reason).toBe('breakpoint')
    expect(paused.line).toBe(4)
  })

  it('stops at breakpoints given at start, once per visit', async () => {
    const { port } = harness()
    port.send(startMessage(COUNT, 'run', [4]))
    await until(() => port.kinds().includes('paused'))
    expect(last(port, 'paused')).toMatchObject({ reason: 'breakpoint', line: 4 })
    expect(port.text()).toBe('')
    port.send({ kind: 'continue' })
    await until(() => port.posted.filter((message) => message.kind === 'paused').length === 2)
    expect(port.text()).toBe('1\n')
    port.send({ kind: 'continue' })
    port.send({ kind: 'continue' })
    await until(() => port.kinds().includes('done'))
    expect(port.text()).toBe('1\n2\n3\n')
  })

  it('ignores pause when not running', () => {
    const { port } = harness()
    port.send({ kind: 'pause' })
    port.send(startMessage(COUNT, 'step'))
    port.send({ kind: 'pause' })
    expect(port.kinds()).toEqual(['state', 'paused'])
  })
})

describe('input', () => {
  it('parks a run-mode run and resumes running after the answer', async () => {
    const { port } = harness()
    port.send(startMessage(GREET, 'run'))
    await until(() => port.kinds().includes('input'))
    const request = last(port, 'input')
    expect(request.target).toEqual({ name: 'nombre', type: { kind: 'scalar', name: 'string' } })
    expect(request.rejected).toBeUndefined()
    expect(states(port)).toEqual(['running', 'input'])
    expect(port.text()).toBe('Nombre\n')
    port.send({ kind: 'input', text: 'Ana' })
    await until(() => port.kinds().includes('done'))
    expect(states(port)).toEqual(['running', 'input', 'running', 'done'])
    expect(port.kinds()).not.toContain('paused')
    expect(port.text()).toBe('Nombre\nHola Ana\n')
  })

  it('parks a step-mode run and resumes stepping after the answer', async () => {
    const { port, driver } = harness()
    port.send(startMessage(GREET, 'step'))
    for (let i = 0; i < 10 && driver.state === 'paused'; i++) port.send({ kind: 'step' })
    expect(driver.state).toBe('input')
    port.send({ kind: 'input', text: 'Ana' })
    await until(() => driver.state !== 'input')
    expect(driver.state).toBe('paused')
    expect(states(port)).not.toContain('running')
    port.send({ kind: 'step' })
    expect(driver.state).toBe('done')
    expect(port.text()).toBe('Nombre\nHola Ana\n')
  })

  it('re-asks with the rejection when the text does not parse', async () => {
    const { port } = harness()
    port.send(startMessage(NUMBER, 'run'))
    await until(() => port.kinds().includes('input'))
    port.send({ kind: 'input', text: 'abc' })
    await until(() => port.posted.filter((message) => message.kind === 'input').length === 2)
    const again = last(port, 'input')
    expect(again.rejected?.code).toBe('E4004')
    expect(states(port)).toEqual(['running', 'input', 'input'])
    port.send({ kind: 'input', text: '21' })
    await until(() => port.kinds().includes('done'))
    expect(port.text()).toBe('42\n')
  })

  it('ignores input outside the input state', () => {
    const { port } = harness()
    port.send(startMessage(COUNT, 'step'))
    const before = port.posted.length
    port.send({ kind: 'input', text: 'x' })
    expect(port.posted.length).toBe(before)
  })
})

describe('wait', () => {
  it('sleeps and resumes running', async () => {
    const slept: number[] = []
    const port = recordingPort()
    createDriver(port, {
      sleep: async (millis) => {
        slept.push(millis)
      },
    })
    port.send(startMessage(WAIT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(slept).toEqual([50])
    expect(last(port, 'wait')).toMatchObject({ line: 3, millis: 50 })
    expect(states(port)).toEqual(['running', 'waiting', 'running', 'done'])
    const kinds = port.kinds()
    expect(kinds.indexOf('output')).toBeLessThan(kinds.indexOf('wait'))
    expect(port.text()).toBe('a\nb\n')
  })

  it('sleeps and resumes stepping', async () => {
    const { port, driver } = harness()
    port.send(startMessage(WAIT, 'step'))
    port.send({ kind: 'step' })
    await until(() => driver.state === 'paused' && port.kinds().includes('wait'))
    expect(states(port)).toEqual(['paused', 'waiting', 'paused'])
    expect(last(port, 'paused').line).toBe(4)
    expect(port.text()).toBe('a\n')
  })
})

describe('clear', () => {
  it('flushes pending output before posting clear', async () => {
    const { port } = harness()
    port.send(startMessage(CLEAR, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(port.kinds()).toEqual(['state', 'output', 'clear', 'output', 'state', 'done'])
    expect(port.text()).toBe('b\n')
  })
})
