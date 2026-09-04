import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { runProgram } from '../../src/interpreter/program'
import { collectRun, seeded, startSource } from '../helpers'

const fibonacci = [
  'Funcion r Como Entero <- fib(n Como Entero)',
  '  Si n < 2 Entonces',
  '    r <- n;',
  '  Sino',
  '    r <- fib(n - 1) + fib(n - 2);',
  '  FinSi',
  'FinFuncion',
  'Proceso p',
  '  Definir i Como Entero;',
  '  Para i <- 0 Hasta 10 Hacer',
  '    Escribir Sin Saltar fib(i), " ";',
  '  FinPara',
  '  Escribir "";',
  'FinProceso',
].join('\n')

describe('recursion through the controller', () => {
  it('computes fibonacci with two calls per frame, under the default depth limit', () => {
    const { run, output } = startSource(fibonacci)
    expect(collectRun(run)).toEqual({ kind: 'done' })
    expect(output()).toBe('0 1 1 2 3 5 8 13 21 34 55 \n')
  })

  it('stepOver over a recursive call statement runs the whole tree', () => {
    const { run, output } = startSource(fibonacci)
    let result = run.step()
    while (result.kind === 'paused' && result.line !== 11) result = run.step()
    expect(result.kind).toBe('paused')
    const after = run.stepOver()
    expect(after.kind === 'paused' && after.frames).toHaveLength(1)
    expect(output()).toBe('0 ')
  })

  it('a deep but finite recursion runs when the limit allows it and fails when it does not', () => {
    const source = [
      'Funcion r Como Entero <- suma(n Como Entero)',
      '  Si n = 0 Entonces',
      '    r <- 0;',
      '  Sino',
      '    r <- n + suma(n - 1);',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir suma(500);',
      'FinProceso',
    ].join('\n')
    const ok = startSource(source)
    expect(collectRun(ok.run)).toEqual({ kind: 'done' })
    expect(ok.output()).toBe('125250\n')
    const tight = startSource(source, { stackDepth: 100 })
    const result = collectRun(tight.run)
    expect(result.kind === 'error' && result.diagnostic.code).toBe('E4005')
  })
})

describe('input rejection through runProgram', () => {
  it('re-asks until the text parses, for every rejectable type', async () => {
    const source = [
      'Proceso p',
      '  Definir n Como Entero;',
      '  Definir x Como Real;',
      '  Definir b Como Logico;',
      '  Definir c Como Caracter;',
      '  Leer n, x, b, c;',
      '  Escribir n, " ", x, " ", b, " ", c;',
      'FinProceso',
    ].join('\n')
    const answers = ['1.5', '7', 'abc', '2.5', 'yes', 'falso', 'ab', 'z']
    const hints: (string | undefined)[] = []
    let writes = ''
    const outcome = await runProgram(compile(source, { profile: profiles.es }), {
      profile: profiles.es,
      io: {
        write: (text) => {
          writes += text
        },
        read: (request) => {
          hints.push(
            request.rejected === undefined ? undefined : String(request.rejected.data.hint),
          )
          return Promise.resolve(answers.shift() ?? '')
        },
      },
    })
    expect(outcome).toEqual({ kind: 'done' })
    expect(hints).toEqual([
      undefined,
      'integer',
      undefined,
      'real',
      undefined,
      'boolean',
      undefined,
      'char',
    ])
    expect(writes).toBe('7 2.5 Falso z\n')
  })
})

describe('determinism end to end', () => {
  const lottery = [
    'Proceso p',
    '  Definir i, n Como Entero;',
    '  Definir s Como Cadena;',
    '  Leer s;',
    '  Para i <- 1 Hasta 3 Hacer',
    '    n <- Aleatorio(1, 100);',
    '    Escribir s, " ", n;',
    '  FinPara',
    'FinProceso',
  ].join('\n')

  async function play(seed: number, name: string): Promise<string> {
    let output = ''
    await runProgram(compile(lottery, { profile: profiles.es }), {
      profile: profiles.es,
      io: {
        write: (text) => {
          output += text
        },
        read: () => Promise.resolve(name),
      },
      random: seeded(seed),
    })
    return output
  }

  it('is a function of inputs and seed alone', async () => {
    expect(await play(3, 'ana')).toBe(await play(3, 'ana'))
    expect(await play(3, 'ana')).not.toBe(await play(4, 'ana'))
    expect(await play(3, 'ana').then((out) => out.replace(/ana/g, 'eva'))).toBe(
      await play(3, 'eva'),
    )
  })
})

describe('abort', () => {
  it('stops a run in the middle of an input-driven loop without an exception', async () => {
    const source = [
      'Proceso p',
      '  Definir n Como Entero;',
      '  n <- 1;',
      '  Mientras n <> 0 Hacer',
      '    Leer n;',
      '    Escribir n;',
      '  FinMientras',
      'FinProceso',
    ].join('\n')
    const controller = new AbortController()
    let reads = 0
    let output = ''
    const outcome = await runProgram(compile(source, { profile: profiles.es }), {
      profile: profiles.es,
      io: {
        write: (text) => {
          output += text
        },
        read: () => {
          reads++
          if (reads === 3) controller.abort()
          return Promise.resolve('5')
        },
      },
      signal: controller.signal,
    })
    expect(outcome).toEqual({ kind: 'aborted' })
    expect(reads).toBe(3)
    expect(output).toBe('5\n5\n')
  })
})
