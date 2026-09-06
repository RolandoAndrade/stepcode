import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import {
  type ArrayValue,
  allocateArray,
  cellOffset,
  cellSlot,
  checkIndex,
  fail,
  INTEGER_TEXT,
  isArrayValue,
  parseReal,
  REAL_TEXT,
  RuntimeError,
} from '../../src/interpreter/value'
import { compileEs, seeded } from '../helpers'

const span = { start: 10, end: 12 }

describe('the value model', () => {
  it('tells an array from a scalar', () => {
    expect(isArrayValue(1)).toBe(false)
    expect(isArrayValue('a')).toBe(false)
    expect(isArrayValue(true)).toBe(false)
    expect(isArrayValue(undefined)).toBe(false)
    expect(isArrayValue({ element: 'integer', dims: [1], data: [undefined] })).toBe(true)
  })

  it('allocates one flat buffer of unassigned cells, row-major', () => {
    const array = allocateArray('real', [2, 3], { name: 'm', spans: [span, span] })
    expect(array.element).toBe('real')
    expect(array.dims).toEqual([2, 3])
    expect(array.data).toHaveLength(6)
    expect(array.data.every((cell) => cell === undefined)).toBe(true)
  })

  it('refuses a size below one with E4001.size at that size expression', () => {
    const second = { start: 20, end: 21 }
    let caught: unknown
    try {
      allocateArray('integer', [3, 0], { name: 'm', spans: [span, second] })
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(RuntimeError)
    if (!(caught instanceof RuntimeError)) return
    expect(caught.diagnostic.code).toBe('E4001')
    expect(caught.diagnostic.span).toEqual(second)
    expect(caught.diagnostic.data).toEqual({ name: 'm', size: 0, hint: 'size' })
    expect(formatDiagnostic(caught.diagnostic, 'es', profiles.es)).toBe(
      '«m» no puede tener tamaño 0: un arreglo necesita al menos una posición.',
    )
    expect(formatDiagnostic(caught.diagnostic, 'en', profiles.en)).toBe(
      '"m" cannot have size 0: an array needs at least one position.',
    )
  })

  it('computes row-major offsets under both index bases', () => {
    expect(cellOffset([3], [1], 1)).toBe(0)
    expect(cellOffset([3], [3], 1)).toBe(2)
    expect(cellOffset([2, 3], [1, 1], 1)).toBe(0)
    expect(cellOffset([2, 3], [1, 3], 1)).toBe(2)
    expect(cellOffset([2, 3], [2, 1], 1)).toBe(3)
    expect(cellOffset([2, 3], [2, 3], 1)).toBe(5)
    expect(cellOffset([2, 3], [0, 0], 0)).toBe(0)
    expect(cellOffset([2, 3], [1, 2], 0)).toBe(5)
    expect(cellOffset([2, 3, 4], [2, 3, 4], 1)).toBe(23)
  })

  it('accepts an index inside [indexBase, indexBase + size - 1] and nothing else', () => {
    expect(() => checkIndex(1, 3, 1, span, 'a')).not.toThrow()
    expect(() => checkIndex(3, 3, 1, span, 'a')).not.toThrow()
    expect(() => checkIndex(0, 3, 0, span, 'a')).not.toThrow()
    expect(() => checkIndex(2, 3, 0, span, 'a')).not.toThrow()
    for (const [index, base] of [
      [0, 1],
      [4, 1],
      [-1, 1],
      [3, 0],
      [-1, 0],
    ] as const) {
      let caught: unknown
      try {
        checkIndex(index, 3, base, span, 'a')
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(RuntimeError)
      if (!(caught instanceof RuntimeError)) return
      expect(caught.diagnostic.code).toBe('E4001')
      expect(caught.diagnostic.span).toEqual(span)
      expect(caught.diagnostic.data).toEqual({ name: 'a', index, low: base, high: base + 2 })
    }
  })

  it('renders E4001 in both locales', () => {
    let caught: unknown
    try {
      checkIndex(4, 3, 1, span, 'a')
    } catch (error) {
      caught = error
    }
    if (!(caught instanceof RuntimeError)) throw new Error('expected a RuntimeError')
    expect(formatDiagnostic(caught.diagnostic, 'es', profiles.es)).toBe(
      'El índice 4 se sale de «a»: sus posiciones van del 1 al 3.',
    )
    expect(formatDiagnostic(caught.diagnostic, 'en', profiles.en)).toBe(
      'Index 4 is outside "a": its positions run from 1 to 3.',
    )
  })

  it('makes a cell slot that reads and writes through to the buffer', () => {
    const array = allocateArray('integer', [3], { name: 'a', spans: [span] })
    const slot = cellSlot(array, 1)
    expect(slot.value).toBeUndefined()
    slot.value = 7
    expect(array.data).toEqual([undefined, 7, undefined])
    array.data[1] = 9
    expect(slot.value).toBe(9)
  })

  it('throws rather than silently coercing an array write into a cell (checker-guaranteed by E3009)', () => {
    const array = allocateArray('integer', [3], { name: 'a', spans: [span] })
    const slot = cellSlot(array, 1)
    const nested: ArrayValue = { element: 'integer', dims: [1], data: [undefined] }
    expect(() => {
      slot.value = nested
    }).toThrow(/array/)
    // The buffer is untouched: the throw happens before any write.
    expect(array.data).toEqual([undefined, undefined, undefined])
  })

  it('fail throws a RuntimeError carrying a diagnostic with the given data', () => {
    let caught: unknown
    try {
      fail('E4002', span, { op: '/' })
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(RuntimeError)
    if (!(caught instanceof RuntimeError)) return
    expect(caught.diagnostic).toEqual({
      code: 'E4002',
      severity: 'error',
      span,
      data: { op: '/' },
    })
    expect(caught.name).toBe('RuntimeError')
  })

  it('spells the input grammars of §5.7', () => {
    for (const text of ['0', '12', '+3', '-12']) expect(INTEGER_TEXT.test(text)).toBe(true)
    for (const text of ['1.5', '1.', '.5', '', '1e3', 'abc', '1,5']) {
      expect(INTEGER_TEXT.test(text)).toBe(false)
    }
    for (const text of ['3.5', '3.', '.5', '-0.25', '+7', '12'])
      expect(REAL_TEXT.test(text)).toBe(true)
    for (const text of ['', '.', '1e3', '1,5', 'abc', '1.2.3'])
      expect(REAL_TEXT.test(text)).toBe(false)
  })

  it('parseReal trims, then applies the Real grammar', () => {
    expect(parseReal('  3.5 ')).toBe(3.5)
    expect(parseReal('12')).toBe(12)
    expect(parseReal('.5')).toBe(0.5)
    expect(parseReal('abc')).toBeUndefined()
    expect(parseReal('')).toBeUndefined()
    expect(parseReal('1,5')).toBeUndefined()
  })
})

describe('the test helpers', () => {
  it('seeded is deterministic per seed and stays in [0, 1)', () => {
    const a = seeded(1)
    const b = seeded(1)
    const c = seeded(2)
    const first = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(first)
    expect([c(), c(), c()]).not.toEqual(first)
    for (const value of first) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('compileEs refuses a program with an error and accepts one with a warning', () => {
    expect(() => compileEs('Proceso p\n  Escribir x;\nFinProceso')).toThrow(/E3001/)
    expect(
      compileEs('Proceso p\n  Definir a Como Entero;\n  a <- 1;\nFinProceso').source,
    ).toContain('Definir a')
  })
})
