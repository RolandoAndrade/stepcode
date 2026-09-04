import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { type Context, execute } from '../../src/interpreter/evaluate'
import { bodyScopeOf, createFrame, slotOf } from '../../src/interpreter/frame'
import { isArrayValue, type RuntimeValue } from '../../src/interpreter/value'
import { LineMap } from '../../src/source/index'
import { compileEs, profileNamed } from '../helpers'
import { type RunMainReport, runMain } from './drive'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

/** The final value of a main-frame variable. */
function variableValue(report: RunMainReport, name: string): RuntimeValue | undefined {
  const symbol = report.main.scope.symbols.get(name)
  if (symbol === undefined) throw new Error(`"${name}" is not a main variable`)
  return slotOf(report.main, symbol).value
}

describe('declarations (§5.2)', () => {
  it('Definir of a scalar is a no-op: the slot already exists, unassigned', () => {
    const report = runMain(main('Definir n Como Entero;', 'n <- 1;', 'Escribir n;'))
    expect(report.output).toBe('1\n')
    expect(report.pauses).toEqual([2, 3, 4])
  })

  it('sized Definir allocates the array at that statement, unassigned; again allocates afresh', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 2 Hacer',
        '  Definir a Como Entero[2,2];',
        '  a[1,1] <- i;',
        'FinPara',
        'Escribir a[1,1];',
      ),
    )
    expect(report.error).toBeUndefined()
    expect(report.output).toBe('2\n')
    const a = variableValue(report, 'a')
    expect(isArrayValue(a) && a.dims).toEqual([2, 2])
    expect(isArrayValue(a) && a.data).toEqual([2, undefined, undefined, undefined])
  })

  it('unsized Definir is a no-op and the array is E4003 until dimensioned', () => {
    const report = runMain(main('Definir a Como Entero[];', 'Escribir a[1];'))
    expect(report.error?.code).toBe('E4003')
    expect(report.error?.data).toEqual({ name: 'a' })
  })

  it('Dimension allocates a fresh unassigned array; re-execution allocates afresh', () => {
    // A second `Dimension` of the same name is E3022, so re-execution needs a loop; a size
    // must fold (E3023), so it is a literal.
    const report = runMain(
      main(
        'Definir a Como Entero;',
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 2 Hacer',
        '  Dimension a[3];',
        '  Si i = 1 Entonces',
        '    a[1] <- 7;',
        '    Escribir a[1];',
        '  FinSi',
        'FinPara',
        'Escribir a[1];',
      ),
    )
    expect(report.output).toBe('7\n')
    expect(report.error?.code).toBe('E4003')
    expect(report.error?.data).toEqual({ name: 'a', index: '1', hint: 'cell' })
  })

  it('Constante is a no-op step whose value was filled at frame entry', () => {
    const report = runMain(main('Constante K <- 3 * 4;', 'Escribir K;'))
    expect(report.output).toBe('12\n')
    expect(report.pauses).toEqual([2, 3])
  })
})

describe('assignment and output (§5.2)', () => {
  it('assigns a scalar, a cell, a Real from an Entero and a Cadena from a Caracter', () => {
    const report = runMain(
      main(
        'Definir n Como Entero;',
        'Definir x Como Real;',
        'Definir s Como Cadena;',
        'Definir c Como Caracter;',
        'Definir a Como Entero[3];',
        'n <- 5;',
        'x <- n;',
        "c <- 'z';",
        's <- c;',
        'a[2] <- n * 2;',
        'Escribir n, " ", x, " ", s, " ", a[2];',
      ),
    )
    expect(report.output).toBe('5 5 z 10\n')
    expect(variableValue(report, 'x')).toBe(5)
  })

  it('evaluates the value before the target indices', () => {
    // Each side prints its own marker, so the output order actually pins down which side ran
    // first — a test that only checks the final stored value would pass in either order.
    const report = runMain(
      [
        'Funcion v Como Entero <- valor()',
        '  Escribir Sin Saltar "V";',
        '  v <- 4;',
        'FinFuncion',
        'Funcion j Como Entero <- indice()',
        '  Escribir Sin Saltar "I";',
        '  j <- 1;',
        'FinFuncion',
        'Proceso p',
        '  Definir a Como Entero[3];',
        '  a[indice()] <- valor();',
        '  Escribir "";',
        '  Escribir a[1];',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('VI\n4\n')
  })

  it('Escribir concatenates every rendered argument with no separator plus a newline', () => {
    const report = runMain(
      main('Definir b Como Logico;', 'b <- 3 > 2;', 'Escribir "a", 1, 2.5, b, " fin";'),
    )
    expect(report.output).toBe('a12.5Verdadero fin\n')
  })

  it('Escribir Sin Saltar appends no newline', () => {
    const report = runMain(main('Escribir Sin Saltar "a", "b";', 'Escribir "c";'))
    expect(report.output).toBe('abc\n')
  })

  it('Escribir renders under the en profile with its own true/false spellings', () => {
    const report = runMain(
      ['Program p', '  Define b As Boolean;', '  b <- 1 = 1;', '  Write b;', 'EndProgram'].join(
        '\n',
      ),
      { profileName: 'en' },
    )
    expect(report.output).toBe('True\n')
  })
})

describe('input (§5.2, §5.7)', () => {
  it('Leer issues one request per target, left to right, storing each parsed value', () => {
    const report = runMain(
      main(
        'Definir n Como Entero;',
        'Definir x Como Real;',
        'Definir s Como Cadena;',
        'Leer n, x, s;',
        'Escribir n + 1, " ", x * 2, " ", s;',
      ),
      { inputs: ['4', '1.5', ' hola '] },
    )
    expect(report.output).toBe('5 3 hola\n')
  })

  it('Leer into an indexed target evaluates and bounds-checks the indices before asking', () => {
    const ok = runMain(main('Definir a Como Entero[3];', 'Leer a[2];', 'Escribir a[2];'), {
      inputs: ['8'],
    })
    expect(ok.output).toBe('8\n')
    const bad = runMain(main('Definir a Como Entero[3];', 'Leer a[4];'), { inputs: ['8'] })
    expect(bad.error?.code).toBe('E4001')
    expect(bad.error?.data).toEqual({ name: 'a', index: 4, low: 1, high: 3 })
  })
})

describe('branches (§5.2)', () => {
  it('Si runs the first true branch, else Sino', () => {
    const program = (n: number): string =>
      main(
        'Definir n Como Entero;',
        `n <- ${n};`,
        'Si n < 0 Entonces',
        '  Escribir "neg";',
        'Sino Si n = 0 Entonces',
        '  Escribir "cero";',
        'Sino',
        '  Escribir "pos";',
        'FinSi',
      )
    expect(runMain(program(-1)).output).toBe('neg\n')
    expect(runMain(program(0)).output).toBe('cero\n')
    expect(runMain(program(3)).output).toBe('pos\n')
  })

  it('Si yields once before the condition; the chosen branch statements are steps of their own', () => {
    const report = runMain(
      main('Si 1 < 2 Entonces', '  Escribir "a";', 'Sino', '  Escribir "b";', 'FinSi'),
    )
    expect(report.pauses).toEqual([2, 3])
  })

  it('Segun runs the first case one of whose values equals the selector, else De Otro Modo', () => {
    const program = (n: number): string =>
      main(
        'Definir n Como Entero;',
        `n <- ${n};`,
        'Segun n Hacer',
        '  1, 2:',
        '    Escribir "bajo";',
        '  3:',
        '    Escribir "tres";',
        '  De Otro Modo:',
        '    Escribir "otro";',
        'FinSegun',
      )
    expect(runMain(program(2)).output).toBe('bajo\n')
    expect(runMain(program(3)).output).toBe('tres\n')
    expect(runMain(program(9)).output).toBe('otro\n')
  })

  it('Segun on a Caracter selector matches one-character Cadena labels', () => {
    const report = runMain(
      main(
        'Definir c Como Caracter;',
        "c <- 'b';",
        'Segun c Hacer',
        '  "a":',
        '    Escribir "A";',
        '  "b":',
        '    Escribir "B";',
        'FinSegun',
      ),
    )
    expect(report.output).toBe('B\n')
  })
})

describe('loops (§5.2, §3.4)', () => {
  it('Mientras tests before each pass and yields on its own line before every test', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'i <- 0;',
        'Mientras i < 3 Hacer',
        '  i <- i + 1;',
        'FinMientras',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('3\n')
    expect(report.pauses).toEqual([2, 3, 4, 5, 4, 5, 4, 5, 4, 7])
  })

  it('an empty Mientras body still yields once per iteration', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'i <- 0;',
        'Mientras i < 0 Hacer',
        'FinMientras',
        'Escribir i;',
      ),
    )
    expect(report.pauses).toEqual([2, 3, 4, 6])
  })

  it('Repetir … Hasta Que runs the body first and exits when the condition is true', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'i <- 5;',
        'Repetir',
        '  i <- i + 1;',
        'Hasta Que i > 0;',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('6\n')
    expect(report.pauses).toEqual([2, 3, 4, 5, 4, 7])
  })

  it('Repetir … Mientras Que continues while the condition is true', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'i <- 0;',
        'Repetir',
        '  i <- i + 1;',
        'Mientras Que i < 3;',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('3\n')
  })

  it('Romper leaves the innermost loop; Continuar skips to its next test', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 10 Hacer',
        '  Si i MOD 2 = 0 Entonces',
        '    Continuar;',
        '  FinSi',
        '  Si i > 5 Entonces',
        '    Romper;',
        '  FinSi',
        '  Escribir Sin Saltar i;',
        'FinPara',
        'Escribir "";',
      ),
    )
    expect(report.output).toBe('135\n')
  })

  it('Romper and Continuar pass through Segun to the enclosing loop', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 5 Hacer',
        '  Segun i Hacer',
        '    2:',
        '      Continuar;',
        '    4:',
        '      Romper;',
        '  FinSegun',
        '  Escribir Sin Saltar i;',
        'FinPara',
        'Escribir "";',
      ),
    )
    expect(report.output).toBe('13\n')
  })

  it('a loop inside a call consumes its own Romper, not the caller loop', () => {
    const report = runMain(
      [
        'SubProceso salir()',
        '  Mientras Verdadero Hacer',
        '    Romper;',
        '  FinMientras',
        'FinSubProceso',
        'Proceso p',
        '  Definir i Como Entero;',
        '  Para i <- 1 Hasta 2 Hacer',
        '    salir();',
        '    Escribir Sin Saltar i;',
        '  FinPara',
        '  Escribir "";',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('12\n')
  })
})

describe('Para (§5.9)', () => {
  it('evaluates from, to and step once, in that order, before the first iteration', () => {
    const report = runMain(
      main(
        'Definir i, n Como Entero;',
        'n <- 3;',
        'Para i <- 1 Hasta n Con Paso 1 Hacer',
        '  n <- 10;',
        'FinPara',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('4\n')
  })

  it('leaves the counter at the first failing value after a normal end', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', 'FinPara', 'Escribir i;'),
    )
    expect(report.output).toBe('4\n')
  })

  it('leaves the counter at from when the loop never runs', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 5 Hasta 3 Hacer',
        '  Escribir "no";',
        'FinPara',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('5\n')
  })

  it('leaves the counter at the current value after Romper', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 9 Hacer',
        '  Si i = 4 Entonces',
        '    Romper;',
        '  FinSi',
        'FinPara',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('4\n')
  })

  it('runs downwards with a negative step while counter >= to', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 5 Hasta 1 Con Paso -2 Hacer',
        '  Escribir Sin Saltar i;',
        'FinPara',
        'Escribir "";',
      ),
    )
    expect(report.output).toBe('531\n')
  })

  it('yields on its own line before every test', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'Para i <- 1 Hasta 2 Hacer', '  Escribir i;', 'FinPara'),
    )
    expect(report.pauses).toEqual([2, 3, 4, 3, 4, 3])
  })

  it('increments the counter before yielding the loop-line pause, so an inspection there sees the new value', () => {
    // Driven directly, one `execute` step at a time, because `runMain`'s report only records
    // pause *lines*, not the frame state at each one: a host stepping at the loop line must see
    // the already-incremented counter (§3.4, §5.9), not the value the just-finished body saw.
    const source = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 3 Hacer',
      'FinPara',
      'Escribir i;',
    )
    const program = compileEs(source)
    const profile = profileNamed('es')
    const mainBlock = program.ast.main
    if (mainBlock === null) throw new Error('the program has no main block')
    const forStmt = mainBlock.body.find((stmt) => stmt.kind === 'ForStmt')
    if (forStmt === undefined) throw new Error('expected a ForStmt in the fixture')
    const ctx: Context = {
      program,
      profile,
      indexBase: profile.options.indexBase,
      io: { write: () => {} },
      random: () => 0.5,
      lines: new LineMap(source),
    }
    const frame = createFrame(bodyScopeOf(program, mainBlock), 1)
    const symbol = frame.scope.symbols.get('i')
    if (symbol === undefined) throw new Error('"i" is not declared in the fixture')
    const loopLine = 3
    const counterAtLoopLinePause: (RuntimeValue | undefined)[] = []
    const gen = execute(ctx, frame, forStmt)
    let step = gen.next()
    while (!step.done) {
      if (step.value.kind === 'pause' && step.value.line === loopLine) {
        counterAtLoopLinePause.push(slotOf(frame, symbol).value)
      }
      step = gen.next()
    }
    // The first pause on the loop line is `execute`'s own entry pause, before `from` is even
    // evaluated: the counter is still unassigned there. Every later one is the loop's own-line
    // pause after a body, and must already carry the incremented value.
    expect(counterAtLoopLinePause).toEqual([undefined, 2, 3, 4])
  })

  it('reports a computed zero step as E4008 at the step expression', () => {
    const source = main(
      'Definir i, s Como Entero;',
      's <- 0;',
      'Para i <- 1 Hasta 3 Con Paso s Hacer',
      '  Escribir i;',
      'FinPara',
    )
    const report = runMain(source)
    expect(report.error?.code).toBe('E4008')
    expect(report.error && source.slice(report.error.span.start, report.error.span.end)).toBe('s')
    expect(report.error?.data).toEqual({ name: 'i' })
    expect(report.error && formatDiagnostic(report.error, 'es', profiles.es)).toBe(
      'El paso del bucle de «i» es 0: el bucle nunca terminaría.',
    )
  })
})

describe('calls and returns (§5.2, §5.5)', () => {
  it('a function returns its result slot; Retornar v assigns it and returns', () => {
    const report = runMain(
      [
        'Funcion r Como Entero <- doble(n Como Entero)',
        '  r <- n * 2;',
        'FinFuncion',
        'Funcion r Como Entero <- triple(n Como Entero)',
        '  Retornar n * 3;',
        '  r <- 0;',
        'FinFuncion',
        'Funcion cuadruple(n Como Entero): Entero',
        '  Retornar n * 4;',
        'FinFuncion',
        'Proceso p',
        '  Escribir doble(2), " ", triple(2), " ", cuadruple(2);',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('4 6 8\n')
  })

  it('a bare Retornar ends the frame; in main the program is done', () => {
    const report = runMain(
      [
        'SubProceso s()',
        '  Escribir "a";',
        '  Retornar;',
        '  Escribir "b";',
        'FinSubProceso',
        'Proceso p',
        '  s();',
        '  Escribir "c";',
        '  Retornar;',
        '  Escribir "d";',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('a\nc\n')
  })

  it('a call statement discards a function result', () => {
    const report = runMain(
      [
        'Funcion r Como Entero <- f()',
        '  Escribir "f";',
        '  r <- 1;',
        'FinFuncion',
        'Proceso p',
        '  f();',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('f\n')
  })

  it('a builtin call statement executes and discards its result', () => {
    // `Azar()` (the `random` builtin) is callable as an expression, so the parser accepts a
    // bare `Azar();` as a `CallStmt` whose `call` is a `BuiltinCall` (§2, parseAssignOrCall).
    const report = runMain(main('Azar();', 'Escribir "ok";'))
    expect(report.error).toBeUndefined()
    expect(report.output).toBe('ok\n')
  })

  it('reports E4006 at the function name when it ends without a result', () => {
    const source = [
      'Funcion r Como Entero <- mayor(a Como Entero, b Como Entero)',
      '  Si a > b Entonces',
      '    r <- a;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n')
    const report = runMain(source)
    expect(report.error?.code).toBe('E4006')
    expect(report.error && source.slice(report.error.span.start, report.error.span.end)).toBe(
      'mayor',
    )
    expect(report.error?.data).toEqual({ name: 'mayor' })
    const typed = [
      'Funcion f(n Como Entero): Entero',
      '  Si n > 0 Entonces',
      '    Retornar n;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir f(0);',
      'FinProceso',
    ].join('\n')
    expect(runMain(typed).error?.code).toBe('E4006')
  })

  it('a by-reference scalar aliases the caller variable and a by-reference cell the caller cell', () => {
    const report = runMain(
      [
        'SubProceso poner(x Por Referencia Como Entero, v Como Entero)',
        '  x <- v;',
        'FinSubProceso',
        'Proceso p',
        '  Definir n Como Entero;',
        '  Definir a Como Entero[2];',
        '  poner(n, 5);',
        '  poner(a[2], 6);',
        '  Escribir n, " ", a[2];',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('5 6\n')
  })

  it('a by-value scalar is a copy; an array travels by reference even by value', () => {
    const report = runMain(
      [
        'SubProceso cambia(n Como Entero, a Como Entero[])',
        '  n <- 99;',
        '  a[1] <- 99;',
        'FinSubProceso',
        'Proceso p',
        '  Definir n Como Entero;',
        '  Definir a Como Entero[2];',
        '  n <- 1;',
        '  a[1] <- 1;',
        '  cambia(n, a);',
        '  Escribir n, " ", a[1];',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('1 99\n')
  })

  it('recursion is ordinary: each call is a frame', () => {
    const report = runMain(
      [
        'Funcion r Como Entero <- fact(n Como Entero)',
        '  Si n <= 1 Entonces',
        '    r <- 1;',
        '  Sino',
        '    r <- n * fact(n - 1);',
        '  FinSi',
        'FinFuncion',
        'Proceso p',
        '  Escribir fact(5);',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('120\n')
  })
})

describe('host statements (§5.2)', () => {
  it('Limpiar Pantalla calls io.clear when the host provides it', () => {
    const report = runMain(main('Limpiar Pantalla;', 'Escribir "x";'))
    expect(report.cleared).toBe(1)
    expect(report.output).toBe('x\n')
  })

  it('Esperar yields a wait event with the evaluated millis, negatives clamped to 0', () => {
    const report = runMain(
      main('Definir t Como Entero;', 't <- -5;', 'Esperar 250;', 'Esperar t;', 'Escribir "x";'),
    )
    expect(report.waits).toEqual([250, 0])
    expect(report.output).toBe('x\n')
  })

  it('Esperar Tecla yields an input request with no target and accepts any text', () => {
    const report = runMain(main('Escribir "pulsa";', 'Esperar Tecla;', 'Escribir "ok";'), {
      inputs: ['whatever'],
    })
    expect(report.output).toBe('pulsa\nok\n')
  })
})
