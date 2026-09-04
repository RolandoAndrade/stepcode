import type { Expr } from '../ast/index'
import { isArray, isNumeric, isText, isUnknown, sameType, type Type } from './type'

/** The E3010 hint variants of spec §4.2, plus the two E3009 ones. */
export type AssignHint =
  | 'array'
  | 'scalar'
  | 'trunc'
  | 'div'
  | 'index'
  | 'toNumber'
  | 'toText'
  | 'rank'
  | 'element'

/**
 * Why a value does not fit. `expected` and `found` are types, not text: the reporting site
 * renders them with `typeToString`, so this module never sees a profile.
 */
export interface AssignFailure {
  readonly code: 'E3009' | 'E3010' | 'E3011'
  readonly hint?: AssignHint
  readonly expected: Type
  readonly found: Type
  /** E3011 only: how many characters the literal actually has. */
  readonly length?: number
}

/** The count in characters, counting a surrogate pair as the one character it is. */
function characterCount(value: string): number {
  return [...value].length
}

export function assignable(target: Type, source: Type, sourceNode?: Expr): boolean {
  return assignFailure(target, source, sourceNode) === undefined
}

/**
 * Spec §4.2, target on the left. `sourceNode` is only ever consulted for the two rules that
 * are about the expression and not about its type: a one-character string literal fitting a
 * `Caracter`, and a `/` node choosing the `div` hint over `trunc`.
 */
export function assignFailure(
  target: Type,
  source: Type,
  sourceNode?: Expr,
): AssignFailure | undefined {
  // `unknown` absorbs in both directions: it is how one mistake stays one diagnostic.
  if (isUnknown(target) || isUnknown(source)) return undefined
  if (sameType(target, source)) return undefined
  if (isArray(target) && isArray(source)) {
    const hint = target.element === source.element ? 'rank' : 'element'
    return { code: 'E3010', hint, expected: target, found: source }
  }
  if (isArray(source)) return { code: 'E3009', hint: 'array', expected: target, found: source }
  if (isArray(target)) return { code: 'E3009', hint: 'scalar', expected: target, found: source }
  // Two different scalars from here on.
  if (target.name === 'real' && source.name === 'integer') return undefined
  if (target.name === 'string' && source.name === 'char') return undefined
  if (target.name === 'char' && source.name === 'string') {
    if (sourceNode?.kind === 'Literal' && sourceNode.type === 'string') {
      const length = typeof sourceNode.value === 'string' ? characterCount(sourceNode.value) : 0
      if (length === 1) return undefined
      return { code: 'E3011', expected: target, found: source, length }
    }
    return { code: 'E3010', hint: 'index', expected: target, found: source }
  }
  if (target.name === 'integer' && source.name === 'real') {
    const fromDivision = sourceNode?.kind === 'Binary' && sourceNode.op === 'divide'
    return {
      code: 'E3010',
      hint: fromDivision ? 'div' : 'trunc',
      expected: target,
      found: source,
    }
  }
  if (isNumeric(target) && isText(source)) {
    return { code: 'E3010', hint: 'toNumber', expected: target, found: source }
  }
  if (target.name === 'string' && (isNumeric(source) || source.name === 'boolean')) {
    return { code: 'E3010', hint: 'toText', expected: target, found: source }
  }
  return { code: 'E3010', expected: target, found: source }
}
