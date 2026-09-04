import type { ResolvedProfile } from '@stepcode/profiles'
import type { Binary, Call, Expr, Identifier, Index, Node, SubprogramDecl } from '../ast/index'
import { nameOf } from '../checker/result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import type { Symbol } from '../checker/scope'
import type { CompileResult } from '../compile'
import type { LineMap, Span } from '../source/index'
import { operatorSpelling } from '../types/operators'
import { isText, type Type } from '../types/type'
import { type BuiltinContext, callBuiltin } from './builtins'
import { type RuntimeFrame, slotOf } from './frame'
import {
  type ArrayValue,
  cellOffset,
  cellSlot,
  checkIndex,
  fail,
  isArrayValue,
  type RuntimeValue,
  type Scalar,
  type Slot,
} from './value'

/** What every generator reads: the compiled program, the profile, the host `io`, the PRNG. */
export interface Context {
  readonly program: CompileResult
  readonly profile: ResolvedProfile
  readonly indexBase: number
  readonly io: { write(text: string): void; clear?(): void }
  readonly random: () => number
  readonly lines: LineMap
}

/** Yielded once before each statement executes, and by loops before every test (§3.4). */
export interface PauseEvent {
  readonly kind: 'pause'
  readonly line: number
}

export interface InputTarget {
  readonly name: string
  readonly type: Type
  /** Where the accepted value goes: the variable's slot or a bounds-checked cell slot. */
  readonly slot: Slot
  readonly span: Span
}

/** `target: null` is `Esperar Tecla` (§5.7). */
export interface InputEvent {
  readonly kind: 'input'
  readonly target: InputTarget | null
}

export interface WaitEvent {
  readonly kind: 'wait'
  readonly millis: number
}

/** §5.5 step 1: a copied scalar or an array reference, or the slot a by-reference parameter aliases. */
export type Argument =
  | { readonly kind: 'value'; readonly value: RuntimeValue }
  | { readonly kind: 'slot'; readonly slot: Slot }

/** A user call: the controller opens the frame, so user calls never nest on the JS stack (§5.1). */
export interface CallEvent {
  readonly kind: 'call'
  readonly node: Call
  readonly decl: SubprogramDecl
  readonly args: readonly Argument[]
}

export type Event = PauseEvent | InputEvent | WaitEvent | CallEvent

export type Gen<T> = Generator<Event, T, unknown>

export function lineOf(ctx: Context, node: Node): number {
  return ctx.lines.positionAt(node.span.start).line
}

export function symbolOf(ctx: Context, id: Identifier): Symbol {
  const symbol = ctx.program.symbols.get(id)
  if (symbol === undefined) throw new Error(`the checker left "${id.text}" unresolved`)
  return symbol
}

export function typeOfNode(ctx: Context, expr: Expr): Type {
  const type = ctx.program.types.get(expr)
  if (type === undefined) throw new Error(`the checker left a ${expr.kind} untyped`)
  return type
}

/** A read of a scalar or array variable: E4003 when the slot is still unassigned (§5.4). */
function readSlot(ctx: Context, frame: RuntimeFrame, id: Identifier): RuntimeValue {
  const value = slotOf(frame, symbolOf(ctx, id)).value
  if (value === undefined) fail('E4003', id.span, { name: id.text })
  return value
}

/**
 * Every index of an `Index` node, evaluated left to right and bounds-checked against the
 * container — an array's dim for that position, or the text's length in code points (§5.4).
 */
function* evaluateIndices(
  ctx: Context,
  frame: RuntimeFrame,
  node: Index,
  container: string | ArrayValue,
  name: string,
): Gen<number[]> {
  const indices: number[] = []
  for (let position = 0; position < node.indices.length; position++) {
    const expr = node.indices[position]
    if (expr === undefined) continue
    const index = Number(yield* evaluate(ctx, frame, expr))
    const size =
      typeof container === 'string' ? [...container].length : (container.dims[position] ?? 0)
    checkIndex(index, size, ctx.indexBase, expr.span, name)
    indices.push(index)
  }
  return indices
}

function less(left: Scalar, right: Scalar): boolean {
  return typeof left === 'number' && typeof right === 'number'
    ? left < right
    : String(left) < String(right)
}

function divisor(ctx: Context, node: Binary, right: number): void {
  if (right === 0) fail('E4002', node.right.span, { op: operatorSpelling(node.op, ctx.profile) })
}

/**
 * §5.3, both operands already evaluated. The choice between text concatenation and numeric
 * addition is made on the static type of the left operand, as the spec asks — never on the
 * runtime value.
 */
function applyBinary(ctx: Context, node: Binary, left: RuntimeValue, right: RuntimeValue): Scalar {
  if (isArrayValue(left) || isArrayValue(right)) throw new Error('an operator never sees an array')
  switch (node.op) {
    case 'plus':
      return isText(typeOfNode(ctx, node.left))
        ? String(left) + String(right)
        : Number(left) + Number(right)
    case 'minus':
      return Number(left) - Number(right)
    case 'times':
      return Number(left) * Number(right)
    case 'divide':
      divisor(ctx, node, Number(right))
      return Number(left) / Number(right)
    case 'power':
      return Number(left) ** Number(right)
    case 'div':
      divisor(ctx, node, Number(right))
      return Math.trunc(Number(left) / Number(right))
    case 'mod': {
      divisor(ctx, node, Number(right))
      const a = Number(left)
      const b = Number(right)
      return a - b * Math.trunc(a / b)
    }
    case 'equal':
      return left === right
    case 'notEqual':
      return left !== right
    case 'lt':
      return less(left, right)
    case 'le':
      return less(left, right) || left === right
    case 'gt':
      return less(right, left)
    case 'ge':
      return less(right, left) || left === right
    case 'and':
      return left === true && right === true
    case 'or':
      return left === true || right === true
  }
}

/** A value read: the expression's result, with every E4001/E4002/E4003/E4007 it can raise. */
export function* evaluate(ctx: Context, frame: RuntimeFrame, expr: Expr): Gen<RuntimeValue> {
  switch (expr.kind) {
    case 'Literal':
      return expr.value
    case 'Identifier':
      return readSlot(ctx, frame, expr)
    case 'Index': {
      const container = yield* evaluate(ctx, frame, expr.target)
      const name = nameOf(expr.target, ctx.profile)
      if (typeof container !== 'string' && !isArrayValue(container)) {
        throw new Error('indexing a scalar that is not text (E3009)')
      }
      const indices = yield* evaluateIndices(ctx, frame, expr, container, name)
      if (typeof container === 'string') {
        return [...container][(indices[0] ?? ctx.indexBase) - ctx.indexBase] ?? ''
      }
      const value = container.data[cellOffset(container.dims, indices, ctx.indexBase)]
      if (value === undefined) {
        fail('E4003', expr.span, { name, index: indices.join(', '), hint: 'cell' })
      }
      return value
    }
    case 'Call': {
      const value = yield* evaluateCall(ctx, frame, expr)
      if (value === undefined) throw new Error(`"${expr.callee.text}" returned nothing (E3020)`)
      return value
    }
    case 'BuiltinCall': {
      const args: Scalar[] = []
      for (const arg of expr.args) {
        const value = yield* evaluate(ctx, frame, arg)
        if (isArrayValue(value)) throw new Error('a builtin never takes an array (E3037)')
        args.push(value)
      }
      const builtinContext: BuiltinContext = {
        profile: ctx.profile,
        random: ctx.random,
        indexBase: ctx.indexBase,
        spans: expr.args.map((arg) => arg.span),
        names: expr.args.map((arg) => nameOf(arg, ctx.profile)),
      }
      return callBuiltin(expr.key, args, builtinContext)
    }
    case 'Unary': {
      const operand = yield* evaluate(ctx, frame, expr.operand)
      if (expr.op === 'not') return operand !== true
      if (expr.op === 'minus') return -Number(operand)
      return Number(operand)
    }
    case 'Binary': {
      if (expr.op === 'and' || expr.op === 'or') {
        const left = yield* evaluate(ctx, frame, expr.left)
        if (expr.op === 'and' && left !== true) return false
        if (expr.op === 'or' && left === true) return true
        return (yield* evaluate(ctx, frame, expr.right)) === true
      }
      const left = yield* evaluate(ctx, frame, expr.left)
      const right = yield* evaluate(ctx, frame, expr.right)
      return applyBinary(ctx, expr, left, right)
    }
    case 'ErrorExpr':
      throw new Error('an ErrorExpr never reaches a started program (§3.1)')
  }
}

/**
 * The slot a write or a by-reference binding needs: a variable's own slot, or a cell slot
 * built from the array and its bounds-checked indices. Binding never reads the scalar (§5.4),
 * but the array itself is read, so an unallocated one is E4003 at its identifier.
 */
export function* evaluateRef(
  ctx: Context,
  frame: RuntimeFrame,
  target: Identifier | Index,
): Gen<Slot> {
  if (target.kind === 'Identifier') return slotOf(frame, symbolOf(ctx, target))
  const container = yield* evaluate(ctx, frame, target.target)
  if (!isArrayValue(container)) throw new Error('assigning into a text by index (E3013)')
  const name = nameOf(target.target, ctx.profile)
  const indices = yield* evaluateIndices(ctx, frame, target, container, name)
  return cellSlot(container, cellOffset(container.dims, indices, ctx.indexBase))
}

/**
 * §5.5 step 1, then one `call` event. A by-value scalar is read and copied; a by-reference
 * parameter gets the argument's slot; an array parameter gets the `ArrayValue` reference
 * whatever the modifier. The controller answers the event with the call's value.
 */
export function* evaluateCall(
  ctx: Context,
  frame: RuntimeFrame,
  node: Call,
): Gen<RuntimeValue | undefined> {
  const decl = ctx.program.calls.get(node)
  if (decl === undefined)
    throw new Error(`the checker left the call to "${node.callee.text}" unresolved`)
  const args: Argument[] = []
  for (let position = 0; position < node.args.length; position++) {
    const arg = node.args[position]
    const param = decl.params[position]
    if (arg === undefined || param === undefined)
      throw new Error('an arity mismatch the checker missed')
    const symbol = symbolOf(ctx, param.name)
    if (symbol.type.kind === 'array' || !param.byRef) {
      args.push({ kind: 'value', value: yield* evaluate(ctx, frame, arg) })
    } else if (arg.kind === 'Identifier' || arg.kind === 'Index') {
      args.push({ kind: 'slot', slot: yield* evaluateRef(ctx, frame, arg) })
    } else {
      throw new Error('a by-reference argument is always a variable or a cell (E3032)')
    }
  }
  const event: CallEvent = { kind: 'call', node, decl, args }
  const returned = yield event
  return returned as RuntimeValue | undefined
}
