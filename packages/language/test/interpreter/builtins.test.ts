import type { BuiltinKey } from '@stepcode/profiles'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { type BuiltinContext, callBuiltin } from '../../src/interpreter/builtins'
import { RuntimeError, type Scalar } from '../../src/interpreter/value'
import { seeded } from '../helpers'

const spans = [
  { start: 0, end: 1 },
  { start: 2, end: 3 },
  { start: 4, end: 5 },
]

function context(overrides: Partial<BuiltinContext> = {}): BuiltinContext {
  return {
    profile: profiles.es,
    random: () => 0.5,
    indexBase: 1,
    spans,
    names: ['s', '', ''],
    ...overrides,
  }
}

const call = (key: BuiltinKey, args: Scalar[], ctx = context()): Scalar =>
  callBuiltin(key, args, ctx)

function failure(key: BuiltinKey, args: Scalar[], ctx = context()): RuntimeError {
  try {
    callBuiltin(key, args, ctx)
  } catch (error) {
    if (error instanceof RuntimeError) return error
    throw error
  }
  throw new Error(`${key} did not fail`)
}

describe('builtin bodies (§5.8)', () => {
  it('abs keeps the argument type: Math.abs', () => {
    expect(call('abs', [-3])).toBe(3)
    expect(call('abs', [-2.5])).toBe(2.5)
    expect(call('abs', [4])).toBe(4)
  })

  it('sqrt is Math.sqrt and rejects a negative with E4007.negative', () => {
    expect(call('sqrt', [9])).toBe(3)
    expect(call('sqrt', [0])).toBe(0)
    const error = failure('sqrt', [-1])
    expect(error.diagnostic.code).toBe('E4007')
    expect(error.diagnostic.span).toEqual(spans[0])
    expect(error.diagnostic.data).toEqual({ builtin: 'sqrt', hint: 'negative' })
  })

  it('ln is Math.log and rejects zero and below with E4007.nonPositive', () => {
    expect(call('ln', [Math.E])).toBeCloseTo(1)
    expect(failure('ln', [0]).diagnostic.data).toEqual({ builtin: 'ln', hint: 'nonPositive' })
    expect(failure('ln', [-2]).diagnostic.data).toEqual({ builtin: 'ln', hint: 'nonPositive' })
  })

  it('exp is Math.exp', () => {
    expect(call('exp', [0])).toBe(1)
    expect(call('exp', [1])).toBeCloseTo(Math.E)
  })

  it('sin, cos and tan are the Math functions', () => {
    expect(call('sin', [0])).toBe(0)
    expect(call('cos', [0])).toBe(1)
    expect(call('tan', [0])).toBe(0)
    expect(call('sin', [Math.PI / 2])).toBeCloseTo(1)
  })

  it('asin and acos reject |x| > 1 with E4007.domain', () => {
    expect(call('asin', [1])).toBeCloseTo(Math.PI / 2)
    expect(call('acos', [1])).toBe(0)
    expect(call('asin', [-1])).toBeCloseTo(-Math.PI / 2)
    expect(failure('asin', [1.5]).diagnostic.data).toEqual({ builtin: 'asin', hint: 'domain' })
    expect(failure('acos', [-2]).diagnostic.data).toEqual({ builtin: 'acos', hint: 'domain' })
  })

  it('atan is Math.atan', () => {
    expect(call('atan', [0])).toBe(0)
    expect(call('atan', [1])).toBeCloseTo(Math.PI / 4)
  })

  it('trunc is Math.trunc', () => {
    expect(call('trunc', [1.5])).toBe(1)
    expect(call('trunc', [-1.5])).toBe(-1)
    expect(call('trunc', [7])).toBe(7)
  })

  it('round is half away from zero: round(-1.5) is -2', () => {
    expect(call('round', [1.5])).toBe(2)
    expect(call('round', [-1.5])).toBe(-2)
    expect(call('round', [2.4])).toBe(2)
    expect(call('round', [-2.4])).toBe(-2)
    expect(call('round', [0])).toBe(0)
  })

  it('random consumes one value of options.random and takes no argument', () => {
    const values = [0.25, 0.75]
    let calls = 0
    const ctx = context({ random: () => values[calls++] ?? 0 })
    expect(call('random', [], ctx)).toBe(0.25)
    expect(call('random', [], ctx)).toBe(0.75)
    expect(calls).toBe(2)
  })

  it('randomBetween is an Entero in [a, b] inclusive, one random value per call', () => {
    expect(call('randomBetween', [1, 6], context({ random: () => 0 }))).toBe(1)
    expect(call('randomBetween', [1, 6], context({ random: () => 0.999 }))).toBe(6)
    expect(call('randomBetween', [1, 6], context({ random: () => 0.5 }))).toBe(4)
    expect(call('randomBetween', [3, 3], context({ random: () => 0.7 }))).toBe(3)
    const random = seeded(7)
    const seen = new Set<Scalar>()
    for (let i = 0; i < 200; i++) seen.add(call('randomBetween', [-2, 2], context({ random })))
    expect([...seen].sort()).toEqual([-1, -2, 0, 1, 2].sort())
  })

  it('randomBetween rejects a > b with E4007.range at the first argument', () => {
    const error = failure('randomBetween', [5, 1])
    expect(error.diagnostic.span).toEqual(spans[0])
    expect(error.diagnostic.data).toEqual({ builtin: 'randomBetween', hint: 'range' })
  })

  it('pi is Math.PI', () => {
    expect(call('pi', [])).toBe(Math.PI)
  })

  it('length counts code points', () => {
    expect(call('length', ['hola'])).toBe(4)
    expect(call('length', [''])).toBe(0)
    expect(call('length', ['a😀b'])).toBe(3)
  })

  it('upper and lower keep the argument shape', () => {
    expect(call('upper', ['hola'])).toBe('HOLA')
    expect(call('lower', ['HOLA'])).toBe('hola')
    expect(call('upper', ['ñ'])).toBe('Ñ')
  })

  it('substring yields "" when ini > fin with no bounds check', () => {
    expect(call('substring', ['hola', 1, 0])).toBe('')
    expect(call('substring', ['hola', 5, 4])).toBe('')
    expect(call('substring', ['hola', 9, 2])).toBe('')
  })

  it('substring is inclusive from ini to fin in code points under indexBase', () => {
    expect(call('substring', ['hola', 1, 2])).toBe('ho')
    expect(call('substring', ['hola', 2, 4])).toBe('ola')
    expect(call('substring', ['hola', 3, 3])).toBe('l')
    expect(call('substring', ['a😀b', 2, 2])).toBe('😀')
    expect(call('substring', ['hola', 0, 1], context({ indexBase: 0 }))).toBe('ho')
  })

  it('substring reports an out-of-range position as E4001 at that argument, named after the text', () => {
    const low = failure('substring', ['hola', 0, 2])
    expect(low.diagnostic.code).toBe('E4001')
    expect(low.diagnostic.span).toEqual(spans[1])
    expect(low.diagnostic.data).toEqual({ name: 's', index: 0, low: 1, high: 4 })
    const high = failure('substring', ['hola', 2, 5])
    expect(high.diagnostic.span).toEqual(spans[2])
    expect(high.diagnostic.data).toEqual({ name: 's', index: 5, low: 1, high: 4 })
  })

  it('concat joins two texts', () => {
    expect(call('concat', ['ho', 'la'])).toBe('hola')
    expect(call('concat', ['', 'x'])).toBe('x')
  })

  it('toNumber trims, applies the Real grammar and yields a Real', () => {
    expect(call('toNumber', ['12'])).toBe(12)
    expect(call('toNumber', [' 3.5 '])).toBe(3.5)
    expect(call('toNumber', ['-.5'])).toBe(-0.5)
  })

  it('toNumber rejects other text with E4007.number carrying the text', () => {
    const error = failure('toNumber', ['doce'])
    expect(error.diagnostic.span).toEqual(spans[0])
    expect(error.diagnostic.data).toEqual({ builtin: 'toNumber', hint: 'number', text: 'doce' })
  })

  it('toText renders with renderValue', () => {
    expect(call('toText', [12])).toBe('12')
    expect(call('toText', [2.5])).toBe('2.5')
    expect(call('toText', [true])).toBe('Verdadero')
    expect(call('toText', [false], context({ profile: profiles.en }))).toBe('False')
    expect(call('toText', ['ya'])).toBe('ya')
  })

  it('renders every E4007 variant in es and en with no unfilled slot', () => {
    const cases: [BuiltinKey, Scalar[]][] = [
      ['sqrt', [-1]],
      ['ln', [0]],
      ['asin', [2]],
      ['randomBetween', [5, 1]],
      ['toNumber', ['x']],
    ]
    for (const [key, args] of cases) {
      const { diagnostic } = failure(key, args)
      const spanish = formatDiagnostic(diagnostic, 'es', profiles.es)
      const english = formatDiagnostic(diagnostic, 'en', profiles.en)
      expect(spanish, key).not.toMatch(/\{[a-zA-Z$:]+\}/)
      expect(english, key).not.toMatch(/\{[a-zA-Z$:]+\}/)
      expect(spanish).not.toBe(english)
    }
    expect(formatDiagnostic(failure('sqrt', [-1]).diagnostic, 'es', profiles.es)).toBe(
      '«RC» no acepta un número negativo.',
    )
    expect(formatDiagnostic(failure('toNumber', ['x']).diagnostic, 'en', profiles.en)).toBe(
      '"ToNumber" could not read "x" as a number.',
    )
  })
})
