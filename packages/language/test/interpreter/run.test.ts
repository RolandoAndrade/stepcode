import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { type StepResult, start } from '../../src/interpreter/run'
import { collectRun, compileEs, seeded, startSource } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

const counting = main(
  'Definir i, total Como Entero;',
  'total <- 0;',
  'Para i <- 1 Hasta 3 Hacer',
  '  total <- total + i;',
  'FinPara',
  'Escribir total;',
)

const withCall = [
  'Funcion r Como Entero <- doble(n Como Entero)',
  '  r <- n * 2;',
  '  Escribir "en doble";',
  'FinFuncion',
  'Proceso p',
  '  Definir x Como Entero;',
  '  x <- doble(4);',
  '  Escribir x;',
  'FinProceso',
].join('\n')

function paused(result: StepResult): Extract<StepResult, { kind: 'paused' }> {
  if (result.kind !== 'paused') throw new Error(`expected paused, got ${result.kind}`)
  return result
}

describe('start (§3.1)', () => {
  it('throws a plain Error naming the first error code, and accepts warnings', () => {
    const broken = compile(main('Escribir x;'), { profile: profiles.es })
    expect(() => start(broken, { profile: profiles.es, io: { write: () => {} } })).toThrow(/E3001/)
    const warned = compile(main('Definir a Como Entero;', 'a <- 1;'), { profile: profiles.es })
    expect(warned.diagnostics.map((one) => one.code)).toEqual(['W3002'])
    expect(() => start(warned, { profile: profiles.es, io: { write: () => {} } })).not.toThrow()
  })

  it('guards a program without a main block with an internal Error', () => {
    // §3.1 makes this unreachable from `compile`: a source with no main block draws an error
    // diagnostic, which `start` refuses first. The guard is pinned all the same.
    const headless = compileEs(main('Escribir 1;'))
    const withoutMain = { ...headless, ast: { ...headless.ast, main: null } }
    expect(() => start(withoutMain, { profile: profiles.es, io: { write: () => {} } })).toThrow(
      /main block/,
    )
  })

  it('returns a Run in state ready, positioned before the first statement, having executed nothing', () => {
    const { run, output } = startSource(counting)
    expect(run.state).toBe('ready')
    expect(output()).toBe('')
    expect(run.inspect()).toEqual([
      {
        name: 'p',
        line: 2,
        variables: [
          {
            name: 'i',
            kind: 'variable',
            type: { kind: 'scalar', name: 'integer' },
            value: undefined,
          },
          {
            name: 'total',
            kind: 'variable',
            type: { kind: 'scalar', name: 'integer' },
            value: undefined,
          },
        ],
      },
    ])
  })
})

describe('step (§3.4)', () => {
  it('executes the first statement from ready and pauses before the next, with frames', () => {
    const { run } = startSource(counting)
    const first = paused(run.step())
    expect(first.reason).toBe('step')
    expect(first.line).toBe(3)
    expect(run.state).toBe('paused')
    const second = paused(run.step())
    expect(second.line).toBe(4)
    expect(second.frames[0]?.variables.map((v) => v.value)).toEqual([undefined, 0])
  })

  it('visits a loop header once per iteration and ends with done', () => {
    const { run, output } = startSource(counting)
    const lines: number[] = []
    for (;;) {
      const result = run.step()
      if (result.kind === 'done') break
      lines.push(paused(result).line)
    }
    expect(lines).toEqual([3, 4, 5, 4, 5, 4, 5, 4, 7])
    expect(run.state).toBe('done')
    expect(output()).toBe('6\n')
    expect(run.inspect()).toEqual([])
  })

  it('enters a call: the callee frame is innermost and the caller shows the call line', () => {
    const { run } = startSource(withCall)
    paused(run.step()) // Definir x → before x <- doble(4)
    const inside = paused(run.step())
    expect(inside.line).toBe(2)
    expect(inside.frames.map((frame) => [frame.name, frame.line])).toEqual([
      ['doble', 2],
      ['p', 7],
    ])
    expect(inside.frames[0]?.variables.map((v) => [v.name, v.value])).toEqual([
      ['n', 4],
      ['r', undefined],
    ])
  })
})

describe('stepOver and stepOut (§3.4)', () => {
  it('stepOver runs a call to completion and pauses at the next statement of the same depth', () => {
    const { run, output } = startSource(withCall)
    paused(run.step())
    const after = paused(run.stepOver())
    expect(after.line).toBe(8)
    expect(after.frames).toHaveLength(1)
    expect(output()).toBe('en doble\n')
  })

  it('stepOver inside the callee behaves like step for its own statements', () => {
    const { run } = startSource(withCall)
    paused(run.step())
    paused(run.step()) // inside doble, before r <- n * 2
    const next = paused(run.stepOver())
    expect(next.line).toBe(3)
    expect(next.frames).toHaveLength(2)
  })

  it('stepOut runs until the current frame returns; in main it runs to done', () => {
    const { run, output } = startSource(withCall)
    paused(run.step())
    paused(run.step())
    const out = paused(run.stepOut())
    expect(out.line).toBe(8)
    expect(out.frames).toHaveLength(1)
    expect(run.stepOut()).toEqual({ kind: 'done' })
    expect(output()).toBe('en doble\n8\n')
  })

  it('stepOut from a recursive frame returns to the caller frame only', () => {
    // `r <- k` after the recursive call gives the caller frame a pause point of its own.
    const source = [
      'Funcion r Como Entero <- fact(n Como Entero)',
      '  Definir k Como Entero;',
      '  Si n <= 1 Entonces',
      '    k <- 1;',
      '  Sino',
      '    k <- n * fact(n - 1);',
      '  FinSi',
      '  r <- k;',
      'FinFuncion',
      'Proceso p',
      '  Escribir fact(3);',
      'FinProceso',
    ].join('\n')
    const { run } = startSource(source)
    let result = run.step()
    while (result.kind === 'paused' && result.frames.length < 3) result = run.step()
    expect(paused(result).frames.map((frame) => frame.name)).toEqual(['fact', 'fact', 'p'])
    const out = paused(run.stepOut())
    expect(out.line).toBe(8)
    expect(out.frames.map((frame) => [frame.name, frame.line])).toEqual([
      ['fact', 8],
      ['p', 11],
    ])
    expect(out.frames[0]?.variables.map((v) => [v.name, v.value])).toEqual([
      ['n', 3],
      ['r', undefined],
      ['k', 6],
    ])
  })
})

describe('breakpoints (§3.5)', () => {
  it('hits a loop body line on every iteration, never on the line it resumes from', () => {
    const { run } = startSource(counting)
    run.setBreakpoints([5])
    const hits: number[] = []
    for (;;) {
      const result = run.continue()
      if (result.kind === 'done') break
      const pause = paused(result)
      expect(pause.reason).toBe('breakpoint')
      hits.push(pause.frames[0]?.variables[0]?.value as number)
    }
    expect(hits).toEqual([1, 2, 3])
  })

  it('never hits a line that holds no statement start, and replaces the set', () => {
    const { run } = startSource(counting)
    run.setBreakpoints([1, 6, 8])
    expect(run.continue()).toEqual({ kind: 'done' })
    const again = startSource(counting)
    again.run.setBreakpoints([5])
    again.run.setBreakpoints([7])
    expect(paused(again.run.continue()).line).toBe(7)
    expect(again.run.continue()).toEqual({ kind: 'done' })
  })

  it('stops continue() issued from ready on a breakpoint at main first statement', () => {
    // Nothing has executed yet, so there is no statement being resumed from (§3.5): the pause
    // before the first statement is a stop candidate like any other.
    const { run, output } = startSource(counting)
    run.setBreakpoints([2])
    const first = paused(run.continue())
    expect([first.reason, first.line]).toEqual(['breakpoint', 2])
    expect(output()).toBe('')
    expect(first.frames[0]?.variables.map((v) => v.value)).toEqual([undefined, undefined])
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('6\n')
  })

  it('never stops step() at the pause before the first statement', () => {
    // §3.4: `step` stops at the very next pause point, so breakpoints add nothing to it.
    const { run } = startSource(counting)
    run.setBreakpoints([2])
    const first = paused(run.step())
    expect([first.reason, first.line]).toEqual(['step', 3])
  })

  it('wins over the stepping reason when both hold, and stops stepOver inside a call', () => {
    const { run } = startSource(counting)
    run.setBreakpoints([3])
    expect(paused(run.step()).reason).toBe('breakpoint')
    const call = startSource(withCall)
    call.run.setBreakpoints([3])
    paused(call.run.step())
    const stopped = paused(call.run.stepOver())
    expect(stopped.reason).toBe('breakpoint')
    expect(stopped.frames.map((frame) => frame.name)).toEqual(['doble', 'p'])
  })
})

describe('continue and budget (§3.5)', () => {
  it('runs to done without a budget', () => {
    const { run, output } = startSource(counting)
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('6\n')
  })

  it('pauses with reason budget after exactly n pause points, counting loop re-tests', () => {
    const { run } = startSource(counting)
    const first = paused(run.continue({ budget: 2 }))
    expect(first.reason).toBe('budget')
    expect(first.line).toBe(4)
    const second = paused(run.continue({ budget: 3 }))
    expect(second.line).toBe(5)
    expect(second.frames[0]?.variables[0]?.value).toBe(2)
  })

  it('finishes when the budget exceeds what is left', () => {
    const { run } = startSource(counting)
    expect(run.continue({ budget: 1000 })).toEqual({ kind: 'done' })
  })
})

describe('input (§3.2, §5.7)', () => {
  const reading = main(
    'Definir n Como Entero;',
    'Definir s Como Cadena;',
    'Leer n, s;',
    'Escribir n * 2, s;',
  )

  it('reports the target name and static type, stores an accepted value, then pauses mid-statement', () => {
    const { run, output } = startSource(reading)
    const request = run.continue()
    expect(request).toEqual({
      kind: 'input',
      line: 4,
      target: { name: 'n', type: { kind: 'scalar', name: 'integer' } },
    })
    expect(run.state).toBe('input')
    expect(run.inspect()[0]?.line).toBe(4)
    run.input(' 21 ')
    expect(run.state).toBe('paused')
    expect(run.inspect()[0]?.variables[0]?.value).toBe(21)
    const second = run.continue()
    expect(second.kind === 'input' && second.target?.name).toBe('s')
    run.input('x')
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('42x\n')
  })

  it('keeps the state input on a rejected text and re-reports the request with E4004', () => {
    const { run, program } = startSource(reading)
    run.continue()
    run.input('veinte')
    expect(run.state).toBe('input')
    const again = run.step()
    expect(again.kind).toBe('input')
    if (again.kind !== 'input') return
    expect(again.target?.name).toBe('n')
    expect(again.rejected?.code).toBe('E4004')
    expect(
      again.rejected && program.source.slice(again.rejected.span.start, again.rejected.span.end),
    ).toBe('n')
    expect(again.rejected?.data).toEqual({
      name: 'n',
      type: 'Entero',
      text: 'veinte',
      hint: 'integer',
    })
    expect(again.rejected && formatDiagnostic(again.rejected, 'es', profiles.es)).toBe(
      'La entrada «veinte» no es un Entero: escribe solo dígitos, con signo opcional, como «-12».',
    )
    run.input('7')
    expect(run.state).toBe('paused')
    expect(run.continue().kind).toBe('input')
  })

  it('accepts input() again directly after a rejection, without re-reading the request', () => {
    const { run } = startSource(reading)
    run.continue()
    run.input('a')
    run.input('b')
    run.input('3')
    expect(run.state).toBe('paused')
    expect(run.inspect()[0]?.variables[0]?.value).toBe(3)
  })

  it('reads an indexed target as its element type, and reports Esperar Tecla with target null', () => {
    const { run } = startSource(
      main('Definir a Como Real[2];', 'Leer a[2];', 'Esperar Tecla;', 'Escribir a[2];'),
    )
    const request = run.continue()
    expect(request.kind === 'input' && request.target).toEqual({
      name: 'a',
      type: { kind: 'scalar', name: 'real' },
    })
    run.input('1.5')
    const key = run.continue()
    expect(key).toEqual({ kind: 'input', line: 4, target: null })
    run.input('anything at all')
    expect(run.state).toBe('paused')
    expect(run.continue()).toEqual({ kind: 'done' })
  })
})

describe('wait (§3.3)', () => {
  it('reports the evaluated millis at the statement line, then resumes at the next statement', () => {
    const { run, output } = startSource(main('Escribir "a";', 'Esperar 300;', 'Escribir "b";'))
    expect(run.continue()).toEqual({ kind: 'wait', line: 3, millis: 300 })
    expect(run.state).toBe('waiting')
    expect(run.inspect()[0]?.line).toBe(3)
    expect(paused(run.step()).line).toBe(4)
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('a\nb\n')
  })
})

describe('errors (§3.3, §5.1)', () => {
  it('returns the diagnostic with the frames at the failure and keeps them in inspect()', () => {
    const source = [
      'SubProceso f(k Como Entero)',
      '  Definir a Como Entero[2];',
      '  a[k] <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  f(3);',
      'FinProceso',
    ].join('\n')
    const { run } = startSource(source)
    const result = run.continue()
    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.diagnostic.code).toBe('E4001')
    expect(result.frames.map((frame) => [frame.name, frame.line])).toEqual([
      ['f', 3],
      ['p', 6],
    ])
    expect(run.state).toBe('error')
    expect(run.inspect()).toBe(result.frames)
    expect(() => run.step()).toThrow(/error/)
    expect(() => run.input('x')).toThrow(/input/)
    expect(() => run.setBreakpoints([1])).not.toThrow()
  })

  it('reports E4005 at the call when the stack would exceed limits.stackDepth', () => {
    const source = [
      'Funcion r Como Entero <- f(n Como Entero)',
      '  r <- f(n + 1);',
      'FinFuncion',
      'Proceso p',
      '  Escribir f(1);',
      'FinProceso',
    ].join('\n')
    const { run, program } = startSource(source, { stackDepth: 5 })
    const result = run.continue()
    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.diagnostic.code).toBe('E4005')
    expect(program.source.slice(result.diagnostic.span.start, result.diagnostic.span.end)).toBe(
      'f(n + 1)',
    )
    expect(result.diagnostic.data).toEqual({ name: 'f', depth: 5 })
    expect(result.frames).toHaveLength(5)
    expect(formatDiagnostic(result.diagnostic, 'en', profiles.en)).toBe(
      'Too many nested calls: "f" reached 5 calls without returning. Check the stopping condition.',
    )
  })

  it('uses 1000 as the default stack depth', () => {
    const source = [
      'Funcion r Como Entero <- f(n Como Entero)',
      '  r <- f(n + 1);',
      'FinFuncion',
      'Proceso p',
      '  Escribir f(1);',
      'FinProceso',
    ].join('\n')
    const result = collectRun(startSource(source).run)
    expect(result.kind === 'error' && result.diagnostic.data).toEqual({ name: 'f', depth: 1000 })
  })
})

describe('legal commands per state (§3.2)', () => {
  it('rejects input() outside the input state and every stepping command after done', () => {
    const { run } = startSource(main('Escribir 1;'))
    expect(() => run.input('x')).toThrow(/input/)
    expect(run.continue()).toEqual({ kind: 'done' })
    for (const command of [
      () => run.step(),
      () => run.stepOver(),
      () => run.stepOut(),
      () => run.continue(),
    ]) {
      expect(command).toThrow(/done/)
    }
    expect(() => run.setBreakpoints([1])).not.toThrow()
    expect(run.inspect()).toEqual([])
  })

  it('answers stepping commands in the input state by re-reporting the request', () => {
    const { run } = startSource(main('Definir n Como Entero;', 'Leer n;'))
    const request = run.continue()
    expect(run.step()).toEqual(request)
    expect(run.stepOver()).toEqual(request)
    expect(run.stepOut()).toEqual(request)
    expect(run.continue({ budget: 1 })).toEqual(request)
  })
})

describe('determinism', () => {
  const dice = main(
    'Definir i Como Entero;',
    'Para i <- 1 Hasta 5 Hacer',
    '  Escribir Sin Saltar Aleatorio(1, 6), " ";',
    'FinPara',
    'Escribir Azar();',
  )

  it('produces the same output for the same seed and a different one for another seed', () => {
    const a = startSource(dice, { random: seeded(1) })
    const b = startSource(dice, { random: seeded(1) })
    const c = startSource(dice, { random: seeded(2) })
    for (const { run } of [a, b, c]) expect(collectRun(run)).toEqual({ kind: 'done' })
    expect(a.output()).toBe(b.output())
    expect(a.output()).not.toBe(c.output())
    expect(a.output()).toMatch(/^([1-6] ){5}0\.\d+\n$/)
  })
})
