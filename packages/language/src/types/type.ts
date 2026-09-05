import type { ResolvedProfile, TypeKey } from '@stepcode/profiles'

/** One of the five built-in scalars. Sizes and ranks never appear here. */
export interface ScalarType {
  readonly kind: 'scalar'
  readonly name: TypeKey
}

/** An array of scalars. `rank` is the number of dimensions; sizes are a runtime matter. */
export interface ArrayType {
  readonly kind: 'array'
  readonly element: TypeKey
  readonly rank: number
}

/**
 * The absorbing type. It is assignable to and from everything, every operator accepts it and
 * yields it, and nothing is ever reported about it — which is how one mistake stays one
 * diagnostic: whatever produced the first error types `unknown` on the way up.
 */
export interface UnknownType {
  readonly kind: 'unknown'
}

export type Type = ScalarType | ArrayType | UnknownType

/** A value the folder produced: literal, constant, or an operation over folded operands. */
export interface ConstValue {
  readonly type: TypeKey
  readonly value: number | string | boolean
}

/**
 * What an operator or a builtin parameter accepts. `scalar` is "any of the five", used by
 * `toText` and by `Escribir`.
 */
export type OperandClass = 'numeric' | 'text' | 'boolean' | 'integer' | 'scalar'

/** An expectation is either a class of types or one exact type. Both render to text. */
export type Expected = OperandClass | Type

export const UNKNOWN: UnknownType = Object.freeze({ kind: 'unknown' })
export const INTEGER: ScalarType = Object.freeze({ kind: 'scalar', name: 'integer' })
export const REAL: ScalarType = Object.freeze({ kind: 'scalar', name: 'real' })
export const STRING: ScalarType = Object.freeze({ kind: 'scalar', name: 'string' })
export const CHAR: ScalarType = Object.freeze({ kind: 'scalar', name: 'char' })
export const BOOLEAN: ScalarType = Object.freeze({ kind: 'scalar', name: 'boolean' })

const SCALARS: Readonly<Record<TypeKey, ScalarType>> = Object.freeze({
  integer: INTEGER,
  real: REAL,
  string: STRING,
  char: CHAR,
  boolean: BOOLEAN,
})

/** The scalar singleton for a key: types are compared with `===` all over the checker. */
export function scalar(name: TypeKey): ScalarType {
  return SCALARS[name]
}

export function arrayOf(element: TypeKey, rank: number): ArrayType {
  return { kind: 'array', element, rank }
}

export function isUnknown(type: Type): type is UnknownType {
  return type.kind === 'unknown'
}

export function isScalar(type: Type): type is ScalarType {
  return type.kind === 'scalar'
}

export function isArray(type: Type): type is ArrayType {
  return type.kind === 'array'
}

export function isNumeric(type: Type): boolean {
  return type.kind === 'scalar' && (type.name === 'integer' || type.name === 'real')
}

export function isText(type: Type): boolean {
  return type.kind === 'scalar' && (type.name === 'string' || type.name === 'char')
}

export function sameType(left: Type, right: Type): boolean {
  if (left.kind !== right.kind) return false
  if (left.kind === 'scalar') return left.name === (right as ScalarType).name
  if (left.kind === 'array') {
    const other = right as ArrayType
    return left.element === other.element && left.rank === other.rank
  }
  return true
}

export function constType(value: ConstValue): ScalarType {
  return scalar(value.type)
}

/** The profile's first spelling of a type key, or the key itself when it has none. */
function spellingOf(name: TypeKey, profile: ResolvedProfile): string {
  return profile.types[name]?.[0] ?? name
}

/**
 * `Entero`, `Entero[]`, `Entero[,]` — the shape spec §4.1 asks messages to use. `unknown`
 * renders as `?`; it should never reach a message, since nothing is reported about it, but a
 * total function is one fewer way to print `undefined` at a user.
 */
export function typeToString(type: Type, profile: ResolvedProfile): string {
  if (type.kind === 'unknown') return '?'
  if (type.kind === 'scalar') return spellingOf(type.name, profile)
  return `${spellingOf(type.element, profile)}[${','.repeat(Math.max(0, type.rank - 1))}]`
}

const CLASS_MEMBERS: Readonly<Record<OperandClass, readonly TypeKey[]>> = Object.freeze({
  numeric: ['integer', 'real'],
  text: ['string', 'char'],
  boolean: ['boolean'],
  integer: ['integer'],
  scalar: ['integer', 'real', 'string', 'char', 'boolean'],
})

/**
 * `Entero/Real` — the members of a class, in the profile's own words, joined by a slash. A
 * slash needs no translation, which is why the class is not spelled out in prose here: the
 * catalogs receive the rendered list as one plain `{expected}` slot.
 */
export function classToString(operand: OperandClass, profile: ResolvedProfile): string {
  return CLASS_MEMBERS[operand].map((name) => spellingOf(name, profile)).join('/')
}

export function expectedToString(expected: Expected, profile: ResolvedProfile): string {
  return typeof expected === 'string'
    ? classToString(expected, profile)
    : typeToString(expected, profile)
}
