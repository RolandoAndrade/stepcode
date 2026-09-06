import type { BuiltinKey } from '@stepcode/profiles'
import { INTEGER, type OperandClass, REAL, STRING, type Type, UNKNOWN } from './type'

/**
 * One row per builtin (spec §6). `params` is positional and exact — arity is `params.length`.
 * `same` returns the first argument's type, which is how `Abs` keeps `Entero` and `Mayusculas`
 * keeps `Caracter`.
 */
export interface BuiltinSignature {
  readonly params: readonly OperandClass[]
  readonly result: Type | 'same'
}

const NUMERIC_TO_REAL: BuiltinSignature = { params: ['numeric'], result: REAL }

export const BUILTIN_SIGNATURES: Readonly<Record<BuiltinKey, BuiltinSignature>> = Object.freeze({
  abs: { params: ['numeric'], result: 'same' },
  sqrt: NUMERIC_TO_REAL,
  ln: NUMERIC_TO_REAL,
  exp: NUMERIC_TO_REAL,
  sin: NUMERIC_TO_REAL,
  cos: NUMERIC_TO_REAL,
  tan: NUMERIC_TO_REAL,
  asin: NUMERIC_TO_REAL,
  acos: NUMERIC_TO_REAL,
  atan: NUMERIC_TO_REAL,
  trunc: { params: ['numeric'], result: INTEGER },
  round: { params: ['numeric'], result: INTEGER },
  random: { params: [], result: REAL },
  randomBetween: { params: ['integer', 'integer'], result: INTEGER },
  pi: { params: [], result: REAL },
  length: { params: ['text'], result: INTEGER },
  upper: { params: ['text'], result: 'same' },
  lower: { params: ['text'], result: 'same' },
  // `ini..fin` inclusive under the profile's `indexBase`; the bounds are the interpreter's.
  substring: { params: ['text', 'integer', 'integer'], result: STRING },
  concat: { params: ['text', 'text'], result: STRING },
  // `Real`, so assigning it to an `Entero` gets the `trunc` hint rather than passing quietly.
  toNumber: { params: ['text'], result: REAL },
  toText: { params: ['scalar'], result: STRING },
})

/**
 * The result type of one call. `same` copies the first argument's type, which is `unknown`
 * when the argument is missing or already unknown — the absorbing rule, again.
 */
export function builtinResult(key: BuiltinKey, args: readonly Type[]): Type {
  const { result } = BUILTIN_SIGNATURES[key]
  if (result !== 'same') return result
  return args[0] ?? UNKNOWN
}
