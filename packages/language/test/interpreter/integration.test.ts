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

describe('breakpoints across a call', () => {
  const source = [
    'Funcion r Como Entero <- doble(n Como Entero)',
    '  r <- n * 2;',
    'FinFuncion',
    'Proceso p',
    '  Definir a Como Entero;',
    '  a <- doble(5);',
    '  Escribir a;',
    'FinProceso',
  ].join('\n')

  it("continue() from ready honours a breakpoint on main's first statement, but step() does not", () => {
    const stepped = startSource(source)
    stepped.run.setBreakpoints([5])
    const afterStep = stepped.run.step()
    expect(afterStep.kind).toBe('paused')
    expect(afterStep.kind === 'paused' && afterStep.reason).toBe('step')
    expect(afterStep.kind === 'paused' && afterStep.line).toBe(6)

    const continued = startSource(source)
    continued.run.setBreakpoints([5])
    const afterContinue = continued.run.continue()
    expect(afterContinue.kind).toBe('paused')
    expect(afterContinue.kind === 'paused' && afterContinue.reason).toBe('breakpoint')
    expect(afterContinue.kind === 'paused' && afterContinue.line).toBe(5)
  })

  it('continue() reaches the breakpoint in main, then the one inside the callee, with the callee innermost', () => {
    const { run } = startSource(source)
    run.setBreakpoints([2, 5])

    const first = run.continue()
    expect(first.kind).toBe('paused')
    expect(first.kind === 'paused' && first.reason).toBe('breakpoint')
    expect(first.kind === 'paused' && first.line).toBe(5)

    const second = run.continue()
    if (second.kind !== 'paused') throw new Error(`expected paused, got ${second.kind}`)
    expect(second.reason).toBe('breakpoint')
    expect(second.line).toBe(2)
    expect(second.frames).toHaveLength(2)
    expect(second.frames[0]?.name).toBe('doble')
    expect(second.frames[0]?.line).toBe(2)
    expect(second.frames[0]?.variables.find((v) => v.name === 'n')?.value).toBe(5)
    expect(second.frames[0]?.variables.find((v) => v.name === 'r')?.value).toBeUndefined()
    expect(second.frames[1]?.name).toBe('p')
    expect(second.frames[1]?.line).toBe(6)
    expect(second.frames[1]?.variables.find((v) => v.name === 'a')?.value).toBeUndefined()
  })
})

describe('budget', () => {
  const source = [
    'Proceso p',
    '  Definir i Como Entero;',
    '  Para i <- 1 Hasta 5 Hacer',
    '    Escribir i;',
    '  FinPara',
    'FinProceso',
  ].join('\n')

  it('continue({ budget }) pauses with reason "budget" after that many statements, and the loop counter matches', () => {
    const { run } = startSource(source)

    const first = run.continue({ budget: 3 })
    if (first.kind !== 'paused') throw new Error(`expected paused, got ${first.kind}`)
    expect(first.reason).toBe('budget')
    expect(first.line).toBe(3)
    expect(run.inspect()[0]?.variables.find((v) => v.name === 'i')?.value).toBe(2)

    const second = run.continue({ budget: 3 })
    if (second.kind !== 'paused') throw new Error(`expected paused, got ${second.kind}`)
    expect(second.reason).toBe('budget')
    expect(second.line).toBe(4)
    expect(run.inspect()[0]?.variables.find((v) => v.name === 'i')?.value).toBe(3)
  })

  it('repeated budgeted continues reach done with the same output as an unbudgeted run', () => {
    const budgeted = startSource(source)
    let result = budgeted.run.continue({ budget: 3 })
    let guard = 0
    while (result.kind === 'paused' && guard < 100) {
      result = budgeted.run.continue({ budget: 3 })
      guard++
    }
    expect(result.kind).toBe('done')

    const plain = startSource(source)
    expect(collectRun(plain.run)).toEqual({ kind: 'done' })
    expect(budgeted.output()).toBe(plain.output())
    expect(budgeted.output()).toBe('1\n2\n3\n4\n5\n')
  })
})

describe('stepOut across calls', () => {
  const source = [
    'Funcion r Como Entero <- g(x Como Entero)',
    '  r <- x + 1;',
    'FinFuncion',
    'Funcion r Como Entero <- f(x Como Entero)',
    '  Definir t Como Entero;',
    '  t <- g(x);',
    '  r <- t + 10;',
    'FinFuncion',
    'Proceso p',
    '  Definir v Como Entero;',
    '  v <- f(1);',
    '  Escribir v;',
    'FinProceso',
  ].join('\n')

  it('steps two levels deep (main → f → g), then steps out twice back through f to main', () => {
    const { run, output } = startSource(source)

    let atG = run.step()
    while (atG.kind === 'paused' && atG.frames[0]?.name !== 'g') atG = run.step()
    if (atG.kind !== 'paused') throw new Error(`expected paused, got ${atG.kind}`)
    expect(atG.frames.map((frame) => frame.name)).toEqual(['g', 'f', 'p'])
    expect(atG.line).toBe(2)

    const backInF = run.stepOut()
    if (backInF.kind !== 'paused') throw new Error(`expected paused, got ${backInF.kind}`)
    expect(backInF.frames.map((frame) => frame.name)).toEqual(['f', 'p'])
    expect(backInF.line).toBe(7)
    expect(backInF.frames[0]?.variables.find((v) => v.name === 't')?.value).toBe(2)

    const backInMain = run.stepOut()
    if (backInMain.kind !== 'paused') throw new Error(`expected paused, got ${backInMain.kind}`)
    expect(backInMain.frames.map((frame) => frame.name)).toEqual(['p'])
    expect(backInMain.line).toBe(12)
    expect(backInMain.frames[0]?.variables.find((v) => v.name === 'v')?.value).toBe(12)
    expect(output()).toBe('')
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
