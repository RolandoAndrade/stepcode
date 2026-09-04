import type {
  Binary,
  BinaryOp,
  BuiltinCall,
  Call,
  Expr,
  Identifier,
  Index,
  SubprogramDecl,
  UnaryOp,
} from '../ast/index'
import type { DiagnosticData } from '../diagnostics/index'
import type { Span } from '../source/index'
import { assignFailure } from '../types/assign'
import { BUILTIN_SIGNATURES, builtinResult } from '../types/builtins'
import { type ConstantLookup, fold } from '../types/fold'
import {
  accepts,
  checkBinary,
  checkUnary,
  type OperandError,
  operatorSpelling,
} from '../types/operators'
import {
  CHAR,
  classToString,
  expectedToString,
  isArray,
  isUnknown,
  scalar,
  type Type,
  typeToString,
  UNKNOWN,
} from '../types/type'
import { ensureChecked } from './driver'
import { type BodyState, type CheckerState, report, reportAssignFailure, setType } from './result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import { createSymbol, declareSymbol, lookup, type Symbol } from './scope'
import { suggestName } from './suggest'

/** The name a diagnostic can print for an expression; empty when it has no name of its own. */
export function nameOf(expr: Expr): string {
  if (expr.kind === 'Identifier') return expr.text
  if (expr.kind === 'Index') return nameOf(expr.target)
  return ''
}

/** Only `Constante` symbols fold; everything else is a runtime value (§4.6). */
export function constantLookup(state: CheckerState): ConstantLookup {
  return (id: Identifier) => {
    const symbol = lookup(state.frame.scope, id.name)
    return symbol?.kind === 'constant' ? symbol.constValue : undefined
  }
}

/** Every name a suggestion may offer: this body's, in declaration order, then the subprograms. */
function visibleNames(state: CheckerState): string[] {
  const names: string[] = []
  for (const symbol of state.frame.scope.order) {
    if (symbol.recovered !== true) names.push(symbol.name)
  }
  if (state.frame.scope !== state.programScope) {
    for (const symbol of state.programScope.order) names.push(symbol.name)
  }
  return names
}

/**
 * Resolves a name, records the symbol, and reports the source-order rule. Returns `undefined`
 * when the name is unknown or missing: what to do then depends on the caller — a read reports
 * E3001, an assignment in pseint mode declares instead.
 */
export function resolveIdentifier(state: CheckerState, id: Identifier): Symbol | undefined {
  if (id.missing === true) return undefined
  const found = lookup(state.frame.scope, id.name)
  if (found === undefined) return undefined
  state.symbols.set(id, found)
  // §3.2: source order only, flow is ignored — and subprograms are hoisted, so they are exempt.
  if (found.kind !== 'subprogram' && id.span.start < found.declaredAt.span.start) {
    report(state, 'E3003', id.span, { name: id.text }, [{ span: found.declaredAt.span }])
  }
  return found
}

/**
 * E3001, or E3003 when the name is one this body declares further down (§3.2): names are
 * declared in source order, so the symbol does not exist yet — but the declaration does, and
 * it is what the reader meant. No suggestion is offered for a name that is simply too early.
 */
export function reportUnknownName(state: CheckerState, id: Identifier, hint?: 'declare'): void {
  const declaredBelow = state.frame.pending?.get(id.name)
  // Strictly below: `Constante A <- A` declares `A` at that very statement, and the value is
  // read against what exists before it — E3001, not a use of the name being declared (§5.3).
  if (declaredBelow !== undefined && declaredBelow.span.start > id.span.start) {
    report(state, 'E3003', id.span, { name: id.text }, [{ span: declaredBelow.span }])
    return
  }
  const suggestion = suggestName(id.name, visibleNames(state), state.profile.normalize)
  if (suggestion !== undefined) {
    report(state, 'E3001', id.span, { name: id.text, hint: 'suggest', suggestion })
    return
  }
  const data: DiagnosticData = hint === undefined ? { name: id.text } : { name: id.text, hint }
  report(state, 'E3001', id.span, data)
}

/**
 * The recovery symbol of §3.2: an `unknown` variable under the unknown name, so the second
 * use of `totl` in a body does not report a second E3001. It is flagged `recovered`, which
 * keeps it out of the flow warnings — the mistake was already reported once.
 */
export function declareRecovered(state: CheckerState, id: Identifier): Symbol {
  const scope = state.frame.scope
  const symbol = createSymbol({
    name: id.name,
    kind: 'variable',
    type: UNKNOWN,
    declaredAt: id,
    scope,
    recovered: true,
  })
  declareSymbol(scope, symbol)
  state.symbols.set(id, symbol)
  return symbol
}

export function resolveOrRecover(state: CheckerState, id: Identifier, hint?: 'declare'): Symbol {
  const found = resolveIdentifier(state, id)
  if (found !== undefined) return found
  reportUnknownName(state, id, hint)
  return declareRecovered(state, id)
}

function reportOperand(
  state: CheckerState,
  op: BinaryOp | UnaryOp,
  span: Span,
  error: OperandError,
): void {
  const data: DiagnosticData = {
    op: operatorSpelling(op, state.profile),
    expected: expectedToString(error.expected, state.profile),
    found: typeToString(error.found, state.profile),
    side: error.side,
    ...(error.hint === undefined ? {} : { hint: error.hint }),
  }
  report(state, 'E3012', span, data)
}

const DIVIDERS: ReadonlySet<BinaryOp> = new Set<BinaryOp>(['divide', 'div', 'mod'])

/** E3025: a divisor that folds to zero. A non-constant zero is the interpreter's problem. */
function checkZeroDivisor(state: CheckerState, expr: Binary): void {
  if (!DIVIDERS.has(expr.op)) return
  const value = fold(expr.right, constantLookup(state))
  if (value === undefined || typeof value.value !== 'number' || value.value !== 0) return
  report(state, 'E3025', expr.right.span, { op: operatorSpelling(expr.op, state.profile) })
}

function checkIndexCount(state: CheckerState, node: Index, expected: number, found: number): void {
  if (expected === found) return
  report(state, 'E3016', node.span, { expected, found })
}

function checkIndexTypes(state: CheckerState, node: Index, types: readonly Type[]): void {
  node.indices.forEach((index, position) => {
    const type = types[position] ?? UNKNOWN
    if (isUnknown(type) || (type.kind === 'scalar' && type.name === 'integer')) return
    report(state, 'E3017', index.span, { found: typeToString(type, state.profile) })
  })
}

export function typeOfIndex(state: CheckerState, node: Index): Type {
  const target = typeOf(state, node.target)
  // The indices are typed and recorded even when the target failed, so a bad target is one
  // diagnostic and the editor still knows what every index node is (§4.5).
  const indices = node.indices.map((index) => typeOf(state, index))
  if (isUnknown(target)) return UNKNOWN
  if (isArray(target)) {
    checkIndexCount(state, node, target.rank, indices.length)
    checkIndexTypes(state, node, indices)
    return scalar(target.element)
  }
  if (target.kind === 'scalar' && target.name === 'string') {
    checkIndexCount(state, node, 1, indices.length)
    checkIndexTypes(state, node, indices)
    return CHAR
  }
  report(state, 'E3009', node.target.span, { name: nameOf(node.target), hint: 'scalar' })
  return UNKNOWN
}

export function checkBuiltinCall(state: CheckerState, node: BuiltinCall): Type {
  const argTypes = node.args.map((arg) => typeOf(state, arg))
  const signature = BUILTIN_SIGNATURES[node.key]
  if (signature.params.length !== node.args.length) {
    report(state, 'E3036', node.span, {
      builtin: node.key,
      expected: signature.params.length,
      found: node.args.length,
    })
    return UNKNOWN
  }
  let bad = false
  signature.params.forEach((expected, position) => {
    const arg = node.args[position]
    const type = argTypes[position] ?? UNKNOWN
    if (arg === undefined || accepts(expected, type)) return
    bad = true
    report(state, 'E3037', arg.span, {
      builtin: node.key,
      position: position + 1,
      expected: classToString(expected, state.profile),
      found: typeToString(type, state.profile),
    })
  })
  return bad ? UNKNOWN : builtinResult(node.key, argTypes)
}

/**
 * Bottom-up typing. Every node visited is written to `state.types`, including the ones that
 * failed — they are typed `unknown`, which absorbs, so a mistake is reported exactly once.
 */
export function typeOf(state: CheckerState, expr: Expr): Type {
  switch (expr.kind) {
    // The parser already reported this region; the checker stays silent (§2).
    case 'ErrorExpr':
      return setType(state, expr, UNKNOWN)
    case 'Literal':
      return setType(state, expr, scalar(expr.type))
    case 'Identifier': {
      if (expr.missing === true) return setType(state, expr, UNKNOWN)
      const symbol = resolveOrRecover(state, expr)
      if (symbol.kind === 'subprogram') {
        report(state, 'E3005', expr.span, { name: expr.text })
        return setType(state, expr, UNKNOWN)
      }
      symbol.reads++
      return setType(state, expr, symbol.type)
    }
    case 'Index':
      return setType(state, expr, typeOfIndex(state, expr))
    case 'Call':
      return setType(state, expr, checkUserCall(state, expr, true))
    case 'BuiltinCall':
      return setType(state, expr, checkBuiltinCall(state, expr))
    case 'Unary': {
      const operand = typeOf(state, expr.operand)
      const check = checkUnary(expr.op, operand)
      if (check.error !== undefined) {
        reportOperand(state, expr.op, expr.operand.span, check.error)
      }
      return setType(state, expr, check.type)
    }
    case 'Binary': {
      const left = typeOf(state, expr.left)
      const right = typeOf(state, expr.right)
      const check = checkBinary(expr.op, left, right)
      if (check.error !== undefined) {
        reportOperand(
          state,
          expr.op,
          check.error.side === 'left' ? expr.left.span : expr.right.span,
          check.error,
        )
      } else {
        checkZeroDivisor(state, expr)
      }
      return setType(state, expr, check.type)
    }
  }
}

/** A write through an argument or a target: counts for W3003 (§9). */
export function markWritten(state: CheckerState, expr: Expr): void {
  const target = expr.kind === 'Index' ? expr.target : expr
  if (target.kind !== 'Identifier' || target.missing === true) return
  const symbol = state.symbols.get(target)
  if (symbol !== undefined) symbol.writes++
}

/**
 * §5.9: a counter is read-only inside its own loop, and a `Por Referencia` argument is a
 * write, so an active counter passed by reference is E3008 rather than E3032.
 */
export function isActiveCounter(state: CheckerState, expr: Expr): boolean {
  const target = expr.kind === 'Index' ? expr.target : expr
  if (target.kind !== 'Identifier' || target.missing === true) return false
  return state.symbols.get(target)?.counting === true
}

/** The identifier text of a variable or array-element argument, for messages. */
export function argText(expr: Expr): string {
  const target = expr.kind === 'Index' ? expr.target : expr
  return target.kind === 'Identifier' ? target.text : ''
}

/**
 * §5.11: a `Por Referencia` parameter needs somewhere to write back — a variable, a
 * parameter, the result variable, or one element of an array (an active counter is caught
 * earlier by `isActiveCounter`). A constant, a literal, or any computed expression is E3032.
 */
export function isPassableByRef(state: CheckerState, expr: Expr): boolean {
  const target = expr.kind === 'Index' ? expr.target : expr
  if (target.kind !== 'Identifier' || target.missing === true) return false
  const symbol = state.symbols.get(target)
  if (symbol === undefined) return false
  return (
    symbol.kind === 'variable' ||
    symbol.kind === 'parameter' ||
    symbol.kind === 'result' ||
    symbol.kind === 'counter'
  )
}

/**
 * §5.11. The arguments are typed first, because the callee's untyped parameters are fixed
 * from them (§5.12) and because an unresolvable callee must not silence its arguments.
 * `asValue` is false for a call written as a statement, which discards a function's result.
 */
export function checkUserCall(state: CheckerState, node: Call, asValue: boolean): Type {
  const argTypes = node.args.map((arg) => typeOf(state, arg))
  const callee = node.callee
  if (callee.missing === true) return UNKNOWN
  const symbol = lookup(state.frame.scope, callee.name)
  if (symbol === undefined) {
    reportUnknownName(state, callee)
    declareRecovered(state, callee)
    return UNKNOWN
  }
  state.symbols.set(callee, symbol)
  const decl = symbol.decl
  if (symbol.kind !== 'subprogram' || decl === undefined) {
    // The callee resolved to a real symbol; the call is what is wrong, not the name. Counting
    // it as a read keeps the mistake to one diagnostic instead of also warning it was never
    // read (§4.1).
    symbol.reads++
    report(state, 'E3006', callee.span, { name: callee.text })
    return UNKNOWN
  }
  state.calls.set(node, decl)
  const body = ensureChecked(state, decl, argTypes, node.span)
  if (body === undefined) return UNKNOWN
  checkArguments(state, node, decl, body, argTypes)
  // A function called as a statement discards its result, but the node still carries the type
  // the call has (§5.11); `CallStmt` is the one that ignores it.
  if (!asValue) return body.resultType
  if (decl.form !== 'function') {
    report(state, 'E3020', callee.span, { name: callee.text })
    return UNKNOWN
  }
  if (isUnknown(body.resultType) && body.status === 'checking') {
    // A recursive call used as a value, in a function whose result type is not known yet:
    // there is nothing to infer it from (§5.12).
    report(state, 'E3015', callee.span, { name: callee.text, hint: 'result' })
  }
  return body.resultType
}

function checkArguments(
  state: CheckerState,
  node: Call,
  decl: SubprogramDecl,
  body: BodyState,
  argTypes: readonly Type[],
): void {
  if (decl.params.length !== node.args.length) {
    report(state, 'E3034', node.span, {
      name: decl.name.text,
      expected: decl.params.length,
      found: node.args.length,
    })
  }
  // The call that fixed the parameters is worth pointing at — unless it is this one.
  const fixedBy = body.fixedBy
  const related =
    fixedBy !== undefined && fixedBy.start !== node.span.start ? [{ span: fixedBy }] : undefined
  const count = Math.min(body.params.length, node.args.length)
  for (let position = 0; position < count; position++) {
    const param = body.params[position]
    const arg = node.args[position]
    // `null` is a parameter the parser could not name: the position exists, the rules do not.
    if (param === undefined || param === null || arg === undefined) continue
    const failure = assignFailure(param.type, argTypes[position] ?? UNKNOWN, arg)
    if (failure !== undefined) {
      reportAssignFailure(state, arg.span, failure, {
        code: 'E3035',
        data: { name: decl.name.text, position: position + 1 },
        ...(related === undefined ? {} : { related }),
      })
    }
    if (param.byRef !== true) continue
    if (isActiveCounter(state, arg)) report(state, 'E3008', arg.span, { name: argText(arg) })
    else if (isPassableByRef(state, arg)) markWritten(state, arg)
    else report(state, 'E3032', arg.span, { param: param.name })
  }
}
