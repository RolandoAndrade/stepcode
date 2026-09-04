import type {
  AssignStmt,
  CallStmt,
  DefineStmt,
  Identifier,
  Index,
  ReturnStmt,
  Stmt,
  WriteStmt,
} from '../ast/index'
import type { DiagnosticData } from '../diagnostics/index'
import { assignFailure } from '../types/assign'
import { isArray, isUnknown, type Type } from '../types/type'
import { typeFromRef } from './driver'
import {
  checkBuiltinCall,
  checkUserCall,
  declareRecovered,
  markWritten,
  nameOf,
  reportUnknownName,
  resolveIdentifier,
  typeOf,
  typeOfIndex,
} from './expressions'
import { type CheckerState, report, reportAssignFailure, setType } from './result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import { createSymbol, declareSymbol, lookupLocal, type Symbol } from './scope'

/**
 * Declares one variable in the current body scope, with the clash rules of §3.2: a name
 * already in this scope is E3002 (with the `result` and `parameter` variants), a name that is
 * a subprogram is E3004. Both keep the first symbol and carry on.
 *
 * A `recovered` symbol is not a declaration: it is what an unresolved read left behind so a
 * second read would not report E3001 again. The real declaration replaces it silently — one
 * mistake, one diagnostic (§3.2).
 */
export function declareVariable(
  state: CheckerState,
  id: Identifier,
  type: Type,
  dimensioned: boolean,
): Symbol | undefined {
  if (id.missing === true) return undefined
  const scope = state.frame.scope
  const existing = lookupLocal(scope, id.name)
  if (existing !== undefined && existing.recovered !== true) {
    const hint =
      existing.kind === 'result'
        ? 'result'
        : existing.kind === 'parameter'
          ? 'parameter'
          : undefined
    const data: DiagnosticData = hint === undefined ? { name: id.text } : { name: id.text, hint }
    report(state, 'E3002', id.span, data, [{ span: existing.declaredAt.span }])
    return existing
  }
  const clash = lookupLocal(state.programScope, id.name)
  if (clash !== undefined) {
    report(state, 'E3004', id.span, { name: id.text }, [{ span: clash.declaredAt.span }])
  }
  const symbol = createSymbol({ name: id.name, kind: 'variable', type, declaredAt: id, scope })
  if (dimensioned) symbol.dimensioned = true
  declareSymbol(scope, symbol)
  state.symbols.set(id, symbol)
  return symbol
}

function checkDefine(state: CheckerState, stmt: DefineStmt): void {
  const { type, dimensioned } = typeFromRef(state, stmt.type)
  for (const name of stmt.names) declareVariable(state, name, type, dimensioned)
}

/**
 * Resolves an assignment or `Leer` target and returns the type a value must fit, or
 * `undefined` when the target itself was the mistake and nothing more is to be said.
 * `valueType` is what pseint's implicit declaration takes its type from, and `allowImplicit`
 * says whether this statement may declare at all: an assignment may, `Leer` may not (§3.2).
 */
export function resolveWriteTarget(
  state: CheckerState,
  target: Identifier | Index,
  valueType: Type,
  allowImplicit: boolean,
): Type | undefined {
  if (target.kind === 'Index') {
    const element = setType(state, target, typeOfIndex(state, target))
    const base = state.types.get(target.target)
    if (base !== undefined && base.kind === 'scalar' && base.name === 'string') {
      // `s[i] <- …`: a text is read-only through its index (§5.4).
      report(state, 'E3013', target.span)
      return undefined
    }
    markWritten(state, target)
    return isUnknown(element) ? undefined : element
  }
  const existing = resolveIdentifier(state, target)
  if (existing === undefined) {
    if (target.missing === true) return undefined
    if (allowImplicit && state.profile.options.implicitDeclarations) {
      // §3.2: the first assignment declares, with the value's type — `unknown` included, which
      // simply gives an `unknown` variable and no further diagnostic.
      const symbol = declareVariable(state, target, valueType, false)
      if (symbol !== undefined) symbol.writes++
      return undefined
    }
    reportUnknownName(state, target, 'declare')
    declareRecovered(state, target)
    return undefined
  }
  if (existing.kind === 'subprogram') {
    report(state, 'E3005', target.span, { name: target.text })
    return undefined
  }
  if (isArray(existing.type)) {
    report(state, 'E3009', target.span, { name: target.text, hint: 'array' })
    return undefined
  }
  existing.writes++
  // §5.12: an untyped result variable takes the type of its first assignment.
  if (existing.kind === 'result' && isUnknown(existing.type) && !isUnknown(valueType)) {
    existing.type = valueType
    const decl = state.frame.subprogram
    const body = decl === null ? undefined : state.bodies.get(decl)
    if (body !== undefined) body.resultType = valueType
  }
  if (existing.kind === 'result') {
    const decl = state.frame.subprogram
    const body = decl === null ? undefined : state.bodies.get(decl)
    if (body !== undefined) body.resultWrites++
  }
  return existing.type
}

function checkAssign(state: CheckerState, stmt: AssignStmt): void {
  // The value first: pseint's implicit declaration takes the variable's type from it.
  const value = typeOf(state, stmt.value)
  // `true`: an assignment is the one statement pseint lets declare a variable (§3.2).
  const target = resolveWriteTarget(state, stmt.target, value, true)
  if (target === undefined) return
  const failure = assignFailure(target, value, stmt.value)
  if (failure === undefined) return
  reportAssignFailure(state, stmt.value.span, failure, { data: { name: nameOf(stmt.target) } })
}

function checkWrite(state: CheckerState, stmt: WriteStmt): void {
  for (const arg of stmt.args) {
    const type = typeOf(state, arg)
    if (!isArray(type)) continue
    report(state, 'E3009', arg.span, { name: nameOf(arg), hint: 'array' })
  }
}

function checkReturn(state: CheckerState, stmt: ReturnStmt): void {
  // A bare `Retornar` is allowed anywhere: it is a jump, not a value (§5.10).
  if (stmt.value === undefined) return
  const value = typeOf(state, stmt.value)
  const decl = state.frame.subprogram
  const body = decl === null ? undefined : state.bodies.get(decl)
  if (decl === null || decl.form !== 'function' || body === undefined) {
    report(state, 'E3033', stmt.span)
    return
  }
  body.resultWrites++
  if (body.result !== null) body.result.writes++
  if (isUnknown(body.resultType)) {
    // §5.10 and §5.12: the first returned value fixes an undeclared result type.
    if (isUnknown(value)) return
    body.resultType = value
    if (body.result !== null) body.result.type = value
    return
  }
  const failure = assignFailure(body.resultType, value, stmt.value)
  if (failure !== undefined) reportAssignFailure(state, stmt.value.span, failure)
}

function checkCallStatement(state: CheckerState, stmt: CallStmt): void {
  const call = stmt.call
  if (call.kind === 'BuiltinCall') {
    setType(state, call, checkBuiltinCall(state, call))
    return
  }
  // A function called as a statement discards its result silently (§5.11).
  setType(state, call, checkUserCall(state, call, false))
}

export function checkStatements(state: CheckerState, stmts: readonly Stmt[]): void {
  for (const stmt of stmts) checkStatement(state, stmt)
}

export function checkStatement(state: CheckerState, stmt: Stmt): void {
  switch (stmt.kind) {
    // A misplaced subprogram is checked once, from `Program.subprograms` (§3.1); the parser
    // already reported whatever an `ErrorStmt` stands for (§2); the rest have nothing to check.
    case 'SubprogramDecl':
    case 'ErrorStmt':
    case 'ClearStmt':
    case 'WaitKeyStmt':
      return
    case 'DefineStmt': {
      checkDefine(state, stmt)
      return
    }
    case 'AssignStmt': {
      checkAssign(state, stmt)
      return
    }
    case 'WriteStmt': {
      checkWrite(state, stmt)
      return
    }
    case 'ReturnStmt': {
      checkReturn(state, stmt)
      return
    }
    case 'CallStmt': {
      checkCallStatement(state, stmt)
      return
    }
    case 'DimensionStmt': {
      // Task 7 adds §5.2. The sizes are expressions and are typed here either way.
      for (const item of stmt.items) for (const size of item.sizes) typeOf(state, size)
      return
    }
    case 'ConstantStmt': {
      // Task 7 adds §5.3.
      typeOf(state, stmt.value)
      return
    }
    case 'ReadStmt': {
      // Task 7 adds §5.5.
      for (const target of stmt.targets) typeOf(state, target)
      return
    }
    case 'WaitStmt': {
      // Task 8 adds the `Entero` rule of §5.13.
      typeOf(state, stmt.millis)
      return
    }
    case 'BreakStmt':
    case 'ContinueStmt':
      // Task 8 adds E3031.
      return
    case 'IfStmt': {
      // Task 8 adds E3014 on every condition.
      for (const branch of stmt.branches) {
        typeOf(state, branch.condition)
        checkStatements(state, branch.body)
      }
      if (stmt.elseBody !== undefined) checkStatements(state, stmt.elseBody)
      return
    }
    case 'WhileStmt': {
      typeOf(state, stmt.condition)
      checkStatements(state, stmt.body)
      return
    }
    case 'RepeatStmt': {
      checkStatements(state, stmt.body)
      typeOf(state, stmt.condition)
      return
    }
    case 'SwitchStmt': {
      // Task 8 adds §5.8.
      typeOf(state, stmt.selector)
      for (const entry of stmt.cases) {
        for (const value of entry.values) typeOf(state, value)
        checkStatements(state, entry.body)
      }
      if (stmt.otherwise !== undefined) checkStatements(state, stmt.otherwise)
      return
    }
    case 'ForStmt': {
      // Task 8 adds §5.9.
      typeOf(state, stmt.counter)
      typeOf(state, stmt.from)
      typeOf(state, stmt.to)
      if (stmt.step !== undefined) typeOf(state, stmt.step)
      checkStatements(state, stmt.body)
      return
    }
  }
}
