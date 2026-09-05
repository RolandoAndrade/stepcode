import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { DEFAULT_BUDGET, type RunProgramOptions, runProgram } from '../../src/interpreter/program'
import type { InputRequest } from '../../src/interpreter/run'
import { compileEs } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

interface Harness {
  readonly options: RunProgramOptions
  readonly output: () => string
  readonly requests: InputRequest[]
  readonly sleeps: number[]
  readonly cleared: () => number
}

function harness(inputs: readonly string[], extra: Partial<RunProgramOptions> = {}): Harness {
  const queue = [...inputs]
  const writes: string[] = []
  const requests: InputRequest[] = []
  const sleeps: number[] = []
  let cleared = 0
  const options: RunProgramOptions = {
    profile: profiles.es,
    io: {
      write: (text) => void writes.push(text),
      clear: () => {
        cleared++
      },
      read: (request) => {
        requests.push(request)
        const text = queue.shift()
        if (text === undefined) return Promise.reject(new Error('no input left'))
        return Promise.resolve(text)
      },
    },
    sleep: (millis) => {
      sleeps.push(millis)
      return Promise.resolve()
    },
    ...extra,
  }
  return { options, output: () => writes.join(''), requests, sleeps, cleared: () => cleared }
}

describe('runProgram (§3.6)', () => {
  it('runs to done, answering every input request through io.read', async () => {
    const program = compileEs(main('Definir a, b Como Entero;', 'Leer a, b;', 'Escribir a + b;'))
    const h = harness(['2', '3'])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.output()).toBe('5\n')
    expect(h.requests.map((request) => request.target?.name)).toEqual(['a', 'b'])
    expect(h.requests[0]?.rejected).toBeUndefined()
  })

  it('passes a rejected request back to io.read with rejected set, until it parses', async () => {
    const program = compileEs(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))
    const h = harness(['x', 'y', '4'])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.requests.map((request) => request.rejected?.code)).toEqual([
      undefined,
      'E4004',
      'E4004',
    ])
    expect(h.requests[1]?.rejected?.data).toEqual({
      name: 'n',
      type: 'Entero',
      text: 'x',
      hint: 'integer',
    })
    expect(h.output()).toBe('4\n')
  })

  it('answers Esperar Tecla through io.read too and ignores the text', async () => {
    const program = compileEs(main('Esperar Tecla;', 'Escribir "ok";'))
    const h = harness(['anything'])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.requests).toEqual([{ line: 2, target: null }])
    expect(h.output()).toBe('ok\n')
  })

  it('sleeps through options.sleep on Esperar and forwards Limpiar Pantalla', async () => {
    const program = compileEs(main('Limpiar Pantalla;', 'Esperar 120;', 'Escribir "x";'))
    const h = harness([])
    await runProgram(program, h.options)
    expect(h.sleeps).toEqual([120])
    expect(h.cleared()).toBe(1)
  })

  it('returns the error outcome with its frames', async () => {
    const program = compileEs(main('Definir a Como Entero[2];', 'Escribir a[3];'))
    const h = harness([])
    const outcome = await runProgram(program, h.options)
    expect(outcome.kind).toBe('error')
    if (outcome.kind !== 'error') return
    expect(outcome.diagnostic.code).toBe('E4001')
    expect(outcome.frames.map((frame) => frame.name)).toEqual(['p'])
  })

  it('yields to the event loop between budget slices, on the default macrotask sleep', async () => {
    const program = compileEs(
      main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
    )
    const marks: string[] = []
    const h = harness([], { budget: 1 })
    // Drop the harness's fake `sleep` so this pins the *default* budget yield to a real
    // macrotask, not the harness's synchronously-resolving stub.
    const { sleep: _unused, ...withoutSleep } = h.options
    setTimeout(() => marks.push('tick'), 0)
    const options: RunProgramOptions = {
      ...withoutSleep,
      io: { ...h.options.io, write: (text) => void marks.push(text.trim()) },
    }
    await runProgram(program, options)
    // The tick was queued before the run started and the first slice ends before any output,
    // so the macrotask await lets it through first; without that await it would come last.
    expect(marks).toEqual(['tick', '1', '2', '3'])
  })

  it('routes the budget yield through an injected sleep instead of a hard-wired macrotask', async () => {
    // A host on fake timers relies on this: the budget yield must go through the same
    // injectable `sleep` as `Esperar`, not a hard-wired `setTimeout`.
    const program = compileEs(
      main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
    )
    const h = harness([], { budget: 1 })
    await runProgram(program, h.options)
    // One budget-yield `sleep(0)` between each `continue({ budget: 1 })` slice this run takes.
    expect(h.sleeps).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('defaults the budget to 10000 statements and still finishes a longer run', async () => {
    expect(DEFAULT_BUDGET).toBe(10_000)
    const program = compileEs(
      main(
        'Definir i, s Como Entero;',
        's <- 0;',
        'Para i <- 1 Hasta 12000 Hacer',
        '  s <- s + 1;',
        'FinPara',
        'Escribir s;',
      ),
    )
    const h = harness([])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.output()).toBe('12000\n')
  })

  it('returns aborted without executing when the signal is already aborted', async () => {
    const program = compileEs(main('Escribir "never";'))
    const controller = new AbortController()
    controller.abort()
    const h = harness([], { signal: controller.signal })
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'aborted' })
    expect(h.output()).toBe('')
  })

  it('returns aborted after an await when the signal fires meanwhile, without throwing', async () => {
    const program = compileEs(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))
    const controller = new AbortController()
    const h = harness([], {
      signal: controller.signal,
      io: {
        write: () => {},
        read: () => {
          controller.abort()
          return Promise.resolve('1')
        },
      },
    })
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'aborted' })
    expect(h.output()).toBe('')
  })

  it('refuses a program with errors the way start does', async () => {
    const broken = compile(main('Escribir x;'), { profile: profiles.es })
    const h = harness([])
    await expect(runProgram(broken, h.options)).rejects.toThrow(/E3001/)
  })
})
