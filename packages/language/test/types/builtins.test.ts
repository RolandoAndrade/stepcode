import { BUILTIN_KEYS, type BuiltinKey } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { BUILTIN_SIGNATURES, builtinResult } from '../../src/types/builtins'
import { CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'

describe('the builtin table (§6)', () => {
  it('has a row for every builtin the profiles can spell', () => {
    for (const key of BUILTIN_KEYS) expect(BUILTIN_SIGNATURES[key], key).toBeDefined()
    expect(Object.keys(BUILTIN_SIGNATURES).sort()).toEqual([...BUILTIN_KEYS].sort())
  })

  it('takes a number and gives back the same type for abs', () => {
    expect(BUILTIN_SIGNATURES.abs).toEqual({ params: ['numeric'], result: 'same' })
    expect(builtinResult('abs', [INTEGER])).toBe(INTEGER)
    expect(builtinResult('abs', [REAL])).toBe(REAL)
  })

  it('always gives Real for the transcendental functions', () => {
    const real: BuiltinKey[] = ['sqrt', 'ln', 'exp', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan']
    for (const key of real) {
      expect(BUILTIN_SIGNATURES[key], key).toEqual({ params: ['numeric'], result: REAL })
      expect(builtinResult(key, [INTEGER]), key).toBe(REAL)
    }
  })

  it('gives Entero for trunc and round', () => {
    expect(builtinResult('trunc', [REAL])).toBe(INTEGER)
    expect(builtinResult('round', [REAL])).toBe(INTEGER)
  })

  it('describes the zero-argument builtins', () => {
    expect(BUILTIN_SIGNATURES.random).toEqual({ params: [], result: REAL })
    expect(BUILTIN_SIGNATURES.pi).toEqual({ params: [], result: REAL })
  })

  it('takes two integers and gives an integer for randomBetween', () => {
    expect(BUILTIN_SIGNATURES.randomBetween).toEqual({
      params: ['integer', 'integer'],
      result: INTEGER,
    })
  })

  it('describes the text builtins', () => {
    expect(BUILTIN_SIGNATURES.length).toEqual({ params: ['text'], result: INTEGER })
    expect(BUILTIN_SIGNATURES.upper).toEqual({ params: ['text'], result: 'same' })
    expect(builtinResult('lower', [CHAR])).toBe(CHAR)
    expect(builtinResult('upper', [STRING])).toBe(STRING)
    expect(BUILTIN_SIGNATURES.substring).toEqual({
      params: ['text', 'integer', 'integer'],
      result: STRING,
    })
    expect(BUILTIN_SIGNATURES.concat).toEqual({ params: ['text', 'text'], result: STRING })
  })

  it('converts in both directions, toNumber to Real and toText from any scalar', () => {
    expect(BUILTIN_SIGNATURES.toNumber).toEqual({ params: ['text'], result: REAL })
    expect(BUILTIN_SIGNATURES.toText).toEqual({ params: ['scalar'], result: STRING })
  })

  it('gives unknown for a same-typed builtin with no argument to copy', () => {
    expect(builtinResult('abs', [])).toBe(UNKNOWN)
    expect(builtinResult('upper', [UNKNOWN])).toBe(UNKNOWN)
  })
})
