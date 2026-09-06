import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { allocateArray } from '../../src/interpreter/value'
import { evalIn, runtimeErrorOf } from './drive'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

/** A program declaring the usual fixture variables, ending in `Escribir <expr>;`. */
const withVars = (expr: string, ...extra: string[]): string =>
  main(
    'Definir n, m Como Entero;',
    'Definir x, yy Como Real;',
    'Definir s, t Como Cadena;',
    'Definir c Como Caracter;',
    'Definir b, d Como Logico;',
    'Definir a Como Entero[3];',
    'Definir g Como Real[2,3];',
    ...extra,
    `Escribir ${expr};`,
  )

const numbers = { n: 7, m: 2, x: 7.5, yy: 2 }

describe('literals and identifiers', () => {
  it('evaluates every literal kind', () => {
    expect(evalIn(main('Escribir 42;'), '42').value).toBe(42)
    expect(evalIn(main('Escribir 2.5;'), '2.5').value).toBe(2.5)
    expect(evalIn(main('Escribir "hola";'), '"hola"').value).toBe('hola')
    expect(evalIn(main('Escribir Verdadero;'), 'Verdadero').value).toBe(true)
    expect(evalIn(main('Escribir Falso;'), 'Falso').value).toBe(false)
  })

  it('reads a slot value', () => {
    expect(evalIn(withVars('n'), 'n', { values: { n: 3 } }).value).toBe(3)
    expect(evalIn(withVars('s'), 's', { values: { s: 'ab' } }).value).toBe('ab')
  })

  it('reads a constant filled at frame entry', () => {
    const source = main('Constante K <- 10;', 'Escribir K;')
    expect(evalIn(source, 'K').value).toBe(10)
  })

  it('reports E4003 at the identifier for an unassigned scalar', () => {
    const source = withVars('n + 1')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'n + 1'))
    expect(diagnostic.code).toBe('E4003')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('n')
    expect(diagnostic.data).toEqual({ name: 'n' })
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toBe(
      '«n» todavía no tiene valor: asígnale uno antes de usarla.',
    )
  })
})

describe('arithmetic (§5.3)', () => {
  it('+ - * over Entero stay integral, over Real give Real', () => {
    expect(evalIn(withVars('n + m'), 'n + m', { values: numbers }).value).toBe(9)
    expect(evalIn(withVars('n - m'), 'n - m', { values: numbers }).value).toBe(5)
    expect(evalIn(withVars('n * m'), 'n * m', { values: numbers }).value).toBe(14)
    expect(evalIn(withVars('x + yy'), 'x + yy', { values: numbers }).value).toBe(9.5)
    expect(evalIn(withVars('n * x'), 'n * x', { values: numbers }).value).toBe(52.5)
  })

  it('+ over text concatenates, Caracter + Caracter included', () => {
    expect(evalIn(withVars('s + t'), 's + t', { values: { s: 'ho', t: 'la' } }).value).toBe('hola')
    expect(evalIn(withVars('c + c'), 'c + c', { values: { c: 'a' } }).value).toBe('aa')
    expect(evalIn(withVars('s + c'), 's + c', { values: { s: 'x', c: 'y' } }).value).toBe('xy')
  })

  it('/ is JS division, always Real: 7 / 2 is 3.5 and 4 / 2 is 2', () => {
    expect(evalIn(withVars('n / m'), 'n / m', { values: numbers }).value).toBe(3.5)
    expect(evalIn(main('Escribir 4 / 2;'), '4 / 2').value).toBe(2)
  })

  it('/ by a computed zero is E4002 at the divisor', () => {
    const source = withVars('n / m')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'n / m', { values: { n: 1, m: 0 } }))
    expect(diagnostic.code).toBe('E4002')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('m')
    expect(diagnostic.data).toEqual({ op: '/' })
    expect(formatDiagnostic(diagnostic, 'en', profiles.en)).toBe(
      'This divides by zero: "/" received a divisor equal to 0.',
    )
  })

  it('^ is JS **, always Real', () => {
    expect(evalIn(withVars('n ^ m'), 'n ^ m', { values: numbers }).value).toBe(49)
    expect(evalIn(withVars('x ^ yy'), 'x ^ yy', { values: { x: 2, yy: 0.5 } }).value).toBeCloseTo(
      Math.SQRT2,
    )
  })

  it('DIV truncates toward zero and MOD keeps the sign of the dividend', () => {
    expect(evalIn(withVars('n DIV m'), 'n DIV m', { values: { n: 7, m: 2 } }).value).toBe(3)
    expect(evalIn(withVars('n DIV m'), 'n DIV m', { values: { n: -7, m: 2 } }).value).toBe(-3)
    expect(evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: 7, m: 3 } }).value).toBe(1)
    expect(evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: -7, m: 3 } }).value).toBe(-1)
    expect(evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: 7, m: -3 } }).value).toBe(1)
  })

  it('DIV and MOD by a computed zero are E4002 with the keyword spelling', () => {
    const div = runtimeErrorOf(() =>
      evalIn(withVars('n DIV m'), 'n DIV m', { values: { n: 1, m: 0 } }),
    )
    expect(div.code).toBe('E4002')
    expect(div.data).toEqual({ op: 'DIV' })
    const mod = runtimeErrorOf(() =>
      evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: 1, m: 0 } }),
    )
    expect(mod.data).toEqual({ op: 'MOD' })
  })

  it('unary minus negates and unary plus is the identity', () => {
    expect(evalIn(withVars('-n'), '-n', { values: numbers }).value).toBe(-7)
    expect(evalIn(withVars('+x'), '+x', { values: numbers }).value).toBe(7.5)
  })
})

describe('logic and comparison (§5.3)', () => {
  it('Y and O short-circuit: the right operand is not evaluated when the left decides', () => {
    // `m` is unassigned: evaluating it would be E4003, so a result proves it was skipped.
    expect(evalIn(withVars('b Y m > 0'), 'b Y m > 0', { values: { b: false } }).value).toBe(false)
    expect(evalIn(withVars('b O m > 0'), 'b O m > 0', { values: { b: true } }).value).toBe(true)
    expect(evalIn(withVars('b Y d'), 'b Y d', { values: { b: true, d: true } }).value).toBe(true)
    expect(evalIn(withVars('b O d'), 'b O d', { values: { b: false, d: false } }).value).toBe(false)
    expect(
      runtimeErrorOf(() => evalIn(withVars('b Y m > 0'), 'b Y m > 0', { values: { b: true } }))
        .code,
    ).toBe('E4003')
  })

  it('NO negates', () => {
    expect(evalIn(withVars('NO b'), 'NO b', { values: { b: true } }).value).toBe(false)
  })

  it('= and <> compare numbers numerically, text as text, booleans by value', () => {
    expect(evalIn(withVars('n = x'), 'n = x', { values: { n: 1, x: 1.0 } }).value).toBe(true)
    expect(evalIn(withVars('n <> x'), 'n <> x', { values: { n: 1, x: 1.5 } }).value).toBe(true)
    expect(evalIn(withVars('s = c'), 's = c', { values: { s: 'a', c: 'a' } }).value).toBe(true)
    expect(evalIn(withVars('s <> c'), 's <> c', { values: { s: 'ab', c: 'a' } }).value).toBe(true)
    expect(evalIn(withVars('b = d'), 'b = d', { values: { b: true, d: false } }).value).toBe(false)
  })

  it('< <= > >= compare numbers numerically and text by UTF-16 code unit order', () => {
    expect(evalIn(withVars('n < x'), 'n < x', { values: { n: 2, x: 2.5 } }).value).toBe(true)
    expect(evalIn(withVars('n <= m'), 'n <= m', { values: { n: 2, m: 2 } }).value).toBe(true)
    expect(evalIn(withVars('n > m'), 'n > m', { values: { n: 2, m: 3 } }).value).toBe(false)
    expect(evalIn(withVars('n >= m'), 'n >= m', { values: { n: 3, m: 3 } }).value).toBe(true)
    expect(evalIn(withVars('s < t'), 's < t', { values: { s: 'abc', t: 'abd' } }).value).toBe(true)
    expect(evalIn(withVars('s > t'), 's > t', { values: { s: 'b', t: 'abc' } }).value).toBe(true)
    expect(evalIn(withVars('c <= s'), 'c <= s', { values: { c: 'a', s: 'a' } }).value).toBe(true)
    expect(evalIn(withVars('s >= t'), 's >= t', { values: { s: 'Z', t: 'a' } }).value).toBe(false)
  })
})

describe('indexing (§5.4)', () => {
  const filled = () => {
    const array = allocateArray('integer', [3], { name: 'a', spans: [] })
    array.data[0] = 10
    array.data[2] = 30
    return array
  }

  it('reads an array cell under indexBase 1', () => {
    expect(evalIn(withVars('a[1]'), 'a[1]', { values: { a: filled() } }).value).toBe(10)
    expect(evalIn(withVars('a[n]'), 'a[n]', { values: { a: filled(), n: 3 } }).value).toBe(30)
  })

  it('reads a matrix cell row-major', () => {
    const g = allocateArray('real', [2, 3], { name: 'g', spans: [] })
    g.data[5] = 2.5
    expect(evalIn(withVars('g[2,3]'), 'g[2,3]', { values: { g } }).value).toBe(2.5)
    expect(evalIn(withVars('g[2][3]'), 'g[2][3]', { values: { g } }).value).toBe(2.5)
  })

  it('reads under indexBase 0 with the es0 profile', () => {
    expect(
      evalIn(withVars('a[0]'), 'a[0]', { values: { a: filled() }, profileName: 'es0' }).value,
    ).toBe(10)
    expect(
      runtimeErrorOf(() =>
        evalIn(withVars('a[3]'), 'a[3]', { values: { a: filled() }, profileName: 'es0' }),
      ).data,
    ).toEqual({ name: 'a', index: 3, low: 0, high: 2 })
  })

  it('indexes a text: one-character string at that position, code points counted', () => {
    expect(evalIn(withVars('s[2]'), 's[2]', { values: { s: 'hola' } }).value).toBe('o')
    expect(evalIn(withVars('s[2]'), 's[2]', { values: { s: 'a😀b' } }).value).toBe('😀')
  })

  it('reports E4001 at the index expression with name, index, low and high', () => {
    const source = withVars('a[n]')
    const diagnostic = runtimeErrorOf(() =>
      evalIn(source, 'a[n]', { values: { a: filled(), n: 4 } }),
    )
    expect(diagnostic.code).toBe('E4001')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('n')
    expect(diagnostic.data).toEqual({ name: 'a', index: 4, low: 1, high: 3 })
    const negative = runtimeErrorOf(() =>
      evalIn(withVars('s[-1]'), 's[-1]', { values: { s: 'ab' } }),
    )
    expect(negative.data).toEqual({ name: 's', index: -1, low: 1, high: 2 })
  })

  it('checks every index left to right and stops at the first bad one', () => {
    const g = allocateArray('real', [2, 3], { name: 'g', spans: [] })
    const source = withVars('g[n, m]')
    const diagnostic = runtimeErrorOf(() =>
      evalIn(source, 'g[n, m]', { values: { g, n: 3, m: 9 } }),
    )
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('n')
    expect(diagnostic.data).toEqual({ name: 'g', index: 3, low: 1, high: 2 })
  })

  it('reports E4003.cell at the Index node for an unassigned cell', () => {
    const source = withVars('a[2]')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'a[2]', { values: { a: filled() } }))
    expect(diagnostic.code).toBe('E4003')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('a[2]')
    expect(diagnostic.data).toEqual({ name: 'a', index: '2', hint: 'cell' })
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toBe(
      '«a[2]» todavía no tiene valor: asígnale uno antes de usarlo.',
    )
    const g = allocateArray('real', [2, 3], { name: 'g', spans: [] })
    const matrix = runtimeErrorOf(() => evalIn(withVars('g[2, 3]'), 'g[2, 3]', { values: { g } }))
    expect(matrix.data).toEqual({ name: 'g', index: '2, 3', hint: 'cell' })
  })

  it('reports E4003 at the identifier for an array never dimensioned', () => {
    const source = main(
      'Definir v Como Entero;',
      'Definir i Como Entero;',
      'i <- 1;',
      'Dimension v[3];',
      'Escribir v[i];',
    )
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'v[i]', { values: { i: 1 } }))
    expect(diagnostic.code).toBe('E4003')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('v')
    expect(diagnostic.data).toEqual({ name: 'v' })
  })
})

describe('builtin calls (§5.8)', () => {
  it('dispatches to callBuiltin with the evaluated arguments', () => {
    expect(evalIn(withVars('Abs(n)'), 'Abs(n)', { values: { n: -3 } }).value).toBe(3)
    expect(evalIn(withVars('Longitud(s)'), 'Longitud(s)', { values: { s: 'hola' } }).value).toBe(4)
    expect(
      evalIn(withVars('Subcadena(s, 2, 3)'), 'Subcadena(s, 2, 3)', { values: { s: 'hola' } }).value,
    ).toBe('ol')
    expect(
      evalIn(withVars('ConvertirATexto(b)'), 'ConvertirATexto(b)', { values: { b: true } }).value,
    ).toBe('Verdadero')
  })

  it('reports E4007 at the argument and E4001 named after the text argument', () => {
    const source = withVars('RC(x)')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'RC(x)', { values: { x: -4 } }))
    expect(diagnostic.code).toBe('E4007')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('x')
    expect(diagnostic.data).toEqual({ builtin: 'sqrt', hint: 'negative' })
    const sub = withVars('Subcadena(s, 1, n)')
    const range = runtimeErrorOf(() =>
      evalIn(sub, 'Subcadena(s, 1, n)', { values: { s: 'abc', n: 4 } }),
    )
    expect(range.code).toBe('E4001')
    expect(sub.slice(range.span.start, range.span.end)).toBe('n')
    expect(range.data).toEqual({ name: 's', index: 4, low: 1, high: 3 })
  })

  it('consumes one random value per call, in evaluation order', () => {
    const values = [0.1, 0.9]
    let index = 0
    const report = evalIn(
      withVars('Aleatorio(1, 10) + Aleatorio(1, 10)'),
      'Aleatorio(1, 10) + Aleatorio(1, 10)',
      {
        random: () => values[index++] ?? 0,
      },
    )
    expect(report.value).toBe(2 + 10)
    expect(index).toBe(2)
  })
})

describe('user calls (§5.5)', () => {
  const program = [
    'Funcion r Como Entero <- f(a Como Entero, b Por Referencia Como Entero, v Como Entero[])',
    '  r <- a;',
    'FinFuncion',
    'Proceso p',
    '  Definir n, m Como Entero;',
    '  Definir lista Como Entero[3];',
    '  n <- 1;',
    '  m <- 2;',
    '  lista[1] <- 5;',
    '  Escribir f(n + 1, m, lista);',
    '  Escribir f(n, lista[1], lista);',
    'FinProceso',
  ].join('\n')

  it('yields one call event with by-value copies, by-reference slots and array references', () => {
    const lista = allocateArray('integer', [3], { name: 'lista', spans: [] })
    lista.data[0] = 5
    const report = evalIn(program, 'f(n + 1, m, lista)', {
      values: { n: 1, m: 2, lista },
      onCall: (event) => {
        expect(event.decl.name.text).toBe('f')
        expect(event.args).toHaveLength(3)
        expect(event.args[0]).toEqual({ kind: 'value', value: 2 })
        expect(event.args[1]?.kind).toBe('slot')
        if (event.args[1]?.kind === 'slot') {
          event.args[1].slot.value = 99
        }
        expect(event.args[2]).toEqual({ kind: 'value', value: lista })
        return 42
      },
    })
    expect(report.value).toBe(42)
    expect(report.events.filter((event) => event.kind === 'call')).toHaveLength(1)
    const m = report.frame.scope.symbols.get('m')
    expect(m && report.frame.slots.get(m)?.value).toBe(99)
  })

  it('binds a by-reference cell without reading it, and names its array', () => {
    const lista = allocateArray('integer', [3], { name: 'lista', spans: [] })
    const report = evalIn(program, 'f(n, lista[1], lista)', {
      values: { n: 1, lista },
      onCall: (event) => {
        const cell = event.args[1]
        if (cell?.kind !== 'slot') throw new Error('expected a cell slot')
        expect(cell.slot.value).toBeUndefined()
        cell.slot.value = 7
        return 0
      },
    })
    expect(report.value).toBe(0)
    expect(lista.data).toEqual([7, undefined, undefined])
  })

  it('reads a by-value argument, so an unassigned one is E4003 before the call', () => {
    const diagnostic = runtimeErrorOf(() =>
      evalIn(program, 'f(n + 1, m, lista)', { values: { m: 2 }, onCall: () => 0 }),
    )
    expect(diagnostic.code).toBe('E4003')
    expect(diagnostic.data).toEqual({ name: 'n' })
  })

  it('reports an unallocated array argument as E4003 at the identifier', () => {
    const diagnostic = runtimeErrorOf(() =>
      evalIn(program, 'f(n + 1, m, lista)', { values: { n: 1, m: 2 }, onCall: () => 0 }),
    )
    expect(diagnostic.code).toBe('E4003')
    expect(diagnostic.data).toEqual({ name: 'lista' })
  })
})
