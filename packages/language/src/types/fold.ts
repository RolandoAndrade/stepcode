import type { BinaryOp, Expr, Identifier } from '../ast/index'
import type { ConstValue } from './type'

/** How the folder reaches a `Constante`'s value. Anything else folds to `undefined`. */
export type ConstantLookup = (id: Identifier) => ConstValue | undefined

const integer = (value: number): ConstValue | undefined =>
  Number.isFinite(value) ? { type: 'integer', value: Math.trunc(value) } : undefined

const real = (value: number): ConstValue | undefined =>
  Number.isFinite(value) ? { type: 'real', value } : undefined

const boolean = (value: boolean): ConstValue => ({ type: 'boolean', value })

const isInteger = (value: ConstValue): boolean => value.type === 'integer'
const isNumber = (value: ConstValue): boolean => value.type === 'integer' || value.type === 'real'
const isTextValue = (value: ConstValue): boolean => value.type === 'string' || value.type === 'char'

/** `Entero` when both are `Entero`, `Real` as soon as one is: the §4.3 widening rule. */
function wider(left: ConstValue, right: ConstValue, value: number): ConstValue | undefined {
  return isInteger(left) && isInteger(right) ? integer(value) : real(value)
}

function foldBinary(op: BinaryOp, left: ConstValue, right: ConstValue): ConstValue | undefined {
  const a = left.value
  const b = right.value
  if (op === 'plus' && isTextValue(left) && isTextValue(right)) {
    return { type: 'string', value: `${String(a)}${String(b)}` }
  }
  if (op === 'and' || op === 'or') {
    if (left.type !== 'boolean' || right.type !== 'boolean') return undefined
    return boolean(op === 'and' ? a === true && b === true : a === true || b === true)
  }
  if (op === 'equal' || op === 'notEqual') {
    const same =
      (isNumber(left) && isNumber(right)) || (isTextValue(left) && isTextValue(right))
        ? a === b
        : left.type === right.type
          ? a === b
          : undefined
    if (same === undefined) return undefined
    return boolean(op === 'equal' ? same : !same)
  }
  if (op === 'lt' || op === 'le' || op === 'gt' || op === 'ge') {
    const ordered = (isNumber(left) && isNumber(right)) || (isTextValue(left) && isTextValue(right))
    if (!ordered) return undefined
    const less = a < b
    const equal = a === b
    return boolean(
      op === 'lt' ? less : op === 'le' ? less || equal : op === 'gt' ? !less && !equal : !less,
    )
  }
  if (!isNumber(left) || !isNumber(right)) return undefined
  const x = Number(a)
  const y = Number(b)
  switch (op) {
    case 'plus':
      return wider(left, right, x + y)
    case 'minus':
      return wider(left, right, x - y)
    case 'times':
      return wider(left, right, x * y)
    case 'divide':
      return y === 0 ? undefined : real(x / y)
    case 'power':
      return real(x ** y)
    case 'div':
      return !isInteger(left) || !isInteger(right) || y === 0 ? undefined : integer(x / y)
    case 'mod':
      return !isInteger(left) || !isInteger(right) || y === 0 ? undefined : integer(x % y)
    default:
      return undefined
  }
}

/**
 * Spec §4.6. Folds literals, `Constante` symbols and the operators of §4.3 over folded
 * operands, and nothing else — builtins never fold, so `Longitud("abc")` is not a constant.
 * Used only by `Segun` labels, array sizes, `Constante` values and the zero checks.
 */
export function fold(expr: Expr, constants: ConstantLookup): ConstValue | undefined {
  switch (expr.kind) {
    case 'Literal':
      return { type: expr.type, value: expr.value }
    case 'Identifier':
      return expr.missing === true ? undefined : constants(expr)
    case 'Unary': {
      const operand = fold(expr.operand, constants)
      if (operand === undefined) return undefined
      if (expr.op === 'not') {
        return operand.type === 'boolean' ? boolean(operand.value !== true) : undefined
      }
      if (!isNumber(operand)) return undefined
      const value = expr.op === 'minus' ? -Number(operand.value) : Number(operand.value)
      return isInteger(operand) ? integer(value) : real(value)
    }
    case 'Binary': {
      const left = fold(expr.left, constants)
      if (left === undefined) return undefined
      const right = fold(expr.right, constants)
      if (right === undefined) return undefined
      return foldBinary(expr.op, left, right)
    }
    default:
      return undefined
  }
}
