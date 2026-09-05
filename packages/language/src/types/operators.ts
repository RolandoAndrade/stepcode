import type { KeywordKey, OperatorKey, ResolvedProfile } from '@stepcode/profiles'
import type { BinaryOp, UnaryOp } from '../ast/index'
import { assignable } from './assign'
import {
  BOOLEAN,
  type Expected,
  INTEGER,
  isNumeric,
  isText,
  isUnknown,
  type OperandClass,
  REAL,
  STRING,
  type Type,
  UNKNOWN,
} from './type'

/** One row of the spec §4.3 table: which operands, and what comes out. */
export interface BinaryRule {
  readonly left: OperandClass
  readonly right: OperandClass
  /** `wider`: `Entero` when both operands are `Entero`, `Real` as soon as one is `Real`. */
  readonly result: Type | 'wider'
}

const NUMERIC_WIDER: BinaryRule = { left: 'numeric', right: 'numeric', result: 'wider' }
const NUMERIC_REAL: BinaryRule = { left: 'numeric', right: 'numeric', result: REAL }
const INTEGER_ONLY: BinaryRule = { left: 'integer', right: 'integer', result: INTEGER }
const ORDERING: readonly BinaryRule[] = [
  { left: 'numeric', right: 'numeric', result: BOOLEAN },
  { left: 'text', right: 'text', result: BOOLEAN },
]
const LOGICAL: readonly BinaryRule[] = [{ left: 'boolean', right: 'boolean', result: BOOLEAN }]

/**
 * Spec §4.3, one row per operator and operand class, in the order they are tried. `equal` and
 * `notEqual` have no rows: comparability is a relation between the two operands (§4.4), not a
 * pair of independent classes, so `checkBinary` settles them before consulting the table.
 */
export const BINARY_TABLE: Readonly<Record<BinaryOp, readonly BinaryRule[]>> = Object.freeze({
  plus: [NUMERIC_WIDER, { left: 'text', right: 'text', result: STRING }],
  minus: [NUMERIC_WIDER],
  times: [NUMERIC_WIDER],
  divide: [NUMERIC_REAL],
  power: [NUMERIC_REAL],
  div: [INTEGER_ONLY],
  mod: [INTEGER_ONLY],
  equal: [],
  notEqual: [],
  lt: ORDERING,
  le: ORDERING,
  gt: ORDERING,
  ge: ORDERING,
  and: LOGICAL,
  or: LOGICAL,
})

export const UNARY_TABLE: Readonly<
  Record<UnaryOp, { readonly operand: OperandClass; readonly result: Type | 'same' }>
> = Object.freeze({
  minus: { operand: 'numeric', result: 'same' },
  plus: { operand: 'numeric', result: 'same' },
  not: { operand: 'boolean', result: BOOLEAN },
})

/** `unknown` is accepted by every class: nothing is ever reported about it. */
export function accepts(operand: OperandClass, type: Type): boolean {
  if (isUnknown(type)) return true
  switch (operand) {
    case 'numeric':
      return isNumeric(type)
    case 'text':
      return isText(type)
    case 'boolean':
      return type.kind === 'scalar' && type.name === 'boolean'
    case 'integer':
      return type.kind === 'scalar' && type.name === 'integer'
    case 'scalar':
      return type.kind === 'scalar'
  }
}

/** §4.4: two values may be compared for equality when either fits in the other. */
export function comparable(left: Type, right: Type): boolean {
  return assignable(left, right) || assignable(right, left)
}

export interface OperandError {
  /** Which operand is wrong. The diagnostic's span is that operand, so the message stays mute
   * about sides; the side travels in `data` for tooling. */
  readonly side: 'left' | 'right'
  readonly expected: Expected
  readonly found: Type
  readonly hint?: 'divide' | 'trunc' | 'toText'
}

export interface OperatorCheck {
  readonly type: Type
  readonly error?: OperandError
}

function resultOf(rule: BinaryRule, left: Type, right: Type): Type {
  if (rule.result !== 'wider') return rule.result
  const bothIntegers =
    left.kind === 'scalar' &&
    left.name === 'integer' &&
    right.kind === 'scalar' &&
    right.name === 'integer'
  return bothIntegers ? INTEGER : REAL
}

/**
 * The hint for a rejected operand, chosen from the operator and from what the *other* operand
 * turned out to be: `DIV` over a `Real` wants `/`, `MOD` over a `Real` wants `Truncar`, and a
 * `+` that mixes text with a number wants `ConvertirATexto`.
 */
function operandError(
  op: BinaryOp,
  side: 'left' | 'right',
  expected: Expected,
  found: Type,
  other: Type,
): OperandError {
  if (op === 'div' && isNumeric(found)) return { side, expected, found, hint: 'divide' }
  if (op === 'mod' && isNumeric(found)) return { side, expected, found, hint: 'trunc' }
  if (
    op === 'plus' &&
    ((isText(other) && isNumeric(found)) || (isNumeric(other) && isText(found)))
  ) {
    return { side, expected, found, hint: 'toText' }
  }
  return { side, expected, found }
}

export function checkBinary(op: BinaryOp, left: Type, right: Type): OperatorCheck {
  if (isUnknown(left) || isUnknown(right)) return { type: UNKNOWN }
  if (op === 'equal' || op === 'notEqual') {
    if (comparable(left, right)) return { type: BOOLEAN }
    return { type: UNKNOWN, error: { side: 'right', expected: left, found: right } }
  }
  const rules = BINARY_TABLE[op]
  const first = rules[0]
  if (first === undefined) return { type: UNKNOWN }
  const byLeft = rules.filter((rule) => accepts(rule.left, left))
  if (byLeft.length === 0) {
    return { type: UNKNOWN, error: operandError(op, 'left', first.left, left, right) }
  }
  const match = byLeft.find((rule) => accepts(rule.right, right))
  if (match !== undefined) return { type: resultOf(match, left, right) }
  const rule = byLeft[0] as BinaryRule
  return { type: UNKNOWN, error: operandError(op, 'right', rule.right, right, left) }
}

export function checkUnary(op: UnaryOp, operand: Type): OperatorCheck {
  if (isUnknown(operand)) return { type: UNKNOWN }
  const rule = UNARY_TABLE[op]
  if (!accepts(rule.operand, operand)) {
    // A prefix operator has one operand; `left` is where it stands.
    return { type: UNKNOWN, error: { side: 'left', expected: rule.operand, found: operand } }
  }
  return { type: rule.result === 'same' ? operand : rule.result }
}

/** Where an operator's spelling lives: some are symbols, some are words. */
const SPELLING: Readonly<
  Record<
    BinaryOp | UnaryOp,
    | { readonly section: 'op'; readonly key: OperatorKey }
    | { readonly section: 'kw'; readonly key: KeywordKey }
  >
> = Object.freeze({
  plus: { section: 'op', key: 'plus' },
  minus: { section: 'op', key: 'minus' },
  times: { section: 'op', key: 'times' },
  divide: { section: 'op', key: 'divide' },
  power: { section: 'op', key: 'power' },
  equal: { section: 'op', key: 'equal' },
  notEqual: { section: 'op', key: 'notEqual' },
  lt: { section: 'op', key: 'lt' },
  le: { section: 'op', key: 'le' },
  gt: { section: 'op', key: 'gt' },
  ge: { section: 'op', key: 'ge' },
  div: { section: 'kw', key: 'div' },
  mod: { section: 'kw', key: 'mod' },
  and: { section: 'kw', key: 'and' },
  or: { section: 'kw', key: 'or' },
  not: { section: 'kw', key: 'not' },
})

/**
 * The operator as the active profile writes it. Pre-rendered into `data.op` because a
 * template slot cannot know whether an operator lives in the operator table or the keyword
 * table — `+` is one, `DIV` is the other.
 */
export function operatorSpelling(op: BinaryOp | UnaryOp, profile: ResolvedProfile): string {
  const entry = SPELLING[op]
  const spellings =
    entry.section === 'op' ? profile.operators[entry.key] : profile.keywords[entry.key]
  return spellings?.[0] ?? entry.key
}
