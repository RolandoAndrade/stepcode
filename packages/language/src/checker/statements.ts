import type {
  AssignStmt,
  CallStmt,
  ConstantStmt,
  DefineStmt,
  DimensionStmt,
  Expr,
  ForStmt,
  Identifier,
  Index,
  ReadStmt,
  ReturnStmt,
  Stmt,
  SwitchStmt,
  WriteStmt,
} from '../ast/index'
import type { DiagnosticData } from '../diagnostics/index'
import type { Span } from '../source/index'
import { assignFailure } from '../types/assign'
import { fold } from '../types/fold'
import type { ConstValue } from '../types/type'
import {
  arrayOf,
  constType,
  INTEGER,
  isArray,
  isNumeric,
  isUnknown,
  type Type,
  typeToString,
  UNKNOWN,
} from '../types/type'
import { checkSize, typeFromRef } from './driver'
import {
  checkBuiltinCall,
  checkUserCall,
  constantLookup,
  declareRecovered,
  markWritten,
  reportUnknownName,
  resolveIdentifier,
  typeOf,
  typeOfIndex,
} from './expressions'
import { reportUnreachable } from './flow'
import { type CheckerState, nameOf, report, reportAssignFailure, setType } from './result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import { createSymbol, declareSymbol, lookupLocal, type Symbol, type SymbolKind } from './scope'

/**
 * Declares one name in the current body scope, with the clash rules of §3.2: a name already
 * in this scope is E3002 (with the `result` and `parameter` variants), a name that is also a
 * subprogram is E3004. Both keep the first symbol and carry on.
 *
 * A `recovered` symbol is not a declaration: it is what an unresolved read left behind so a
 * second read would not report E3001 again. The real declaration replaces it silently — one
 * mistake, one diagnostic (§3.2).
 */
export function declareNamed(
  state: CheckerState,
  id: Identifier,
  kind: SymbolKind,
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
  const symbol = createSymbol({ name: id.name, kind, type, declaredAt: id, scope })
  if (dimensioned) symbol.dimensioned = true
  // The recovered symbol this replaces already stood for the name at every use since the
  // mistake was reported (§3.2): the reads and writes it collected belong to this symbol too,
  // or a pre-declaration use would cascade into a false "never read"/"never assigned" warning.
  if (existing !== undefined && existing.recovered === true) {
    symbol.reads = existing.reads
    symbol.writes = existing.writes
  }
  declareSymbol(scope, symbol)
  state.symbols.set(id, symbol)
  return symbol
}

export function declareVariable(
  state: CheckerState,
  id: Identifier,
  type: Type,
  dimensioned: boolean,
): Symbol | undefined {
  return declareNamed(state, id, 'variable', type, dimensioned)
}

function checkDefine(state: CheckerState, stmt: DefineStmt): void {
  const { type, dimensioned } = typeFromRef(state, stmt.type)
  for (const name of stmt.names) declareVariable(state, name, type, dimensioned)
}

/**
 * The three kinds nothing can be written into (§3.2, §5.9), each with the code that already
 * names that kind: a subprogram, a constant, and the counter of the loop being checked. One
 * ladder, so an assignment, a `Leer` and a `Para` counter can never disagree about them.
 * Returns whether it reported.
 */
function reportUnwritableKind(state: CheckerState, id: Identifier, symbol: Symbol): boolean {
  if (symbol.kind === 'subprogram') {
    report(state, 'E3005', id.span, { name: id.text })
    return true
  }
  if (symbol.kind === 'constant') {
    report(state, 'E3007', id.span, { name: id.text })
    return true
  }
  if (symbol.counting === true) {
    report(state, 'E3008', id.span, { name: id.text })
    return true
  }
  return false
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
  // The target is an expression node like any other, so it is typed even when it is the
  // mistake: `unknown` absorbs, and every node the tree holds has an entry (§4.5).
  const fail = (): undefined => {
    setType(state, target, UNKNOWN)
    return undefined
  }
  const existing = resolveIdentifier(state, target)
  if (existing === undefined) {
    if (target.missing === true) return fail()
    if (allowImplicit && state.profile.options.implicitDeclarations) {
      // §3.2: the first assignment declares, with the value's type — `unknown` included, which
      // simply gives an `unknown` variable and no further diagnostic.
      const symbol = declareVariable(state, target, valueType, false)
      if (symbol !== undefined) symbol.writes++
      setType(state, target, symbol?.type ?? UNKNOWN)
      return undefined
    }
    reportUnknownName(state, target, 'declare')
    // The recovery symbol stands for the name from here on, and this statement writes it: a
    // write above the declaration is still a write, or the real declaration inherits a zero
    // and W3003 piles onto the E3001/E3003 already reported (§3.2, §9).
    declareRecovered(state, target).writes++
    return fail()
  }
  if (reportUnwritableKind(state, target, existing)) return fail()
  if (isArray(existing.type)) {
    report(state, 'E3009', target.span, { name: target.text, hint: 'array' })
    setType(state, target, existing.type)
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
  return setType(state, target, existing.type)
}

function checkAssign(state: CheckerState, stmt: AssignStmt): void {
  // The value first: pseint's implicit declaration takes the variable's type from it.
  const value = typeOf(state, stmt.value)
  // `true`: an assignment is the one statement pseint lets declare a variable (§3.2).
  const target = resolveWriteTarget(state, stmt.target, value, true)
  if (target === undefined) return
  const failure = assignFailure(target, value, stmt.value)
  if (failure === undefined) return
  reportAssignFailure(state, stmt.value, failure)
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
  if (failure !== undefined) reportAssignFailure(state, stmt.value, failure)
}

/**
 * §5.2. `Dimension` turns a declared scalar, or an unsized array of the same rank, into a
 * sized array — once. Everything else is E3022 with the variant that says why.
 */
function checkDimension(state: CheckerState, stmt: DimensionStmt): void {
  for (const item of stmt.items) {
    for (const size of item.sizes) checkSize(state, size)
    const id = item.name
    if (id.missing === true) continue
    const symbol = lookupLocal(state.frame.scope, id.name)
    // A recovery symbol is not a declaration (§3.2): dimensioning it is still dimensioning a
    // name nothing declares.
    if (symbol === undefined || symbol.recovered === true) {
      // pseint declares on assignment, never here (§5.2). The recovery symbol of §3.2 stands
      // in for the missing declaration all the same, so the uses below it say nothing more:
      // one missing `Definir`, one diagnostic.
      report(state, 'E3021', id.span, { name: id.text })
      declareRecovered(state, id)
      continue
    }
    state.symbols.set(id, symbol)
    if (symbol.kind !== 'variable') {
      report(state, 'E3022', id.span, { name: id.text, hint: 'kind' })
      continue
    }
    if (symbol.dimensioned === true) {
      report(state, 'E3022', id.span, { name: id.text, hint: 'again' })
      continue
    }
    const rank = item.sizes.length
    const current = symbol.type
    if (isArray(current) && current.rank !== rank) {
      report(state, 'E3022', id.span, {
        name: id.text,
        hint: 'rank',
        expected: current.rank,
        found: rank,
      })
      continue
    }
    const element = isArray(current)
      ? current.element
      : current.kind === 'scalar'
        ? current.name
        : undefined
    // An `unknown` variable stays unknown: something was already reported about it.
    if (element === undefined) continue
    symbol.type = arrayOf(element, rank)
    symbol.dimensioned = true
  }
}

/**
 * §5.3. The value is folded *before* the name is declared, so `Constante A <- A` resolves `A`
 * against what exists at that point and is E3001, not a self-reference.
 */
function checkConstant(state: CheckerState, stmt: ConstantStmt): void {
  const before = state.diagnostics.length
  const valueType = typeOf(state, stmt.value)
  // Whether typing the value already said something about it. `1 / 0` does not fold *because*
  // it divides by zero, which E3025 has just reported: E3024 on top of it would be the same
  // mistake told twice (§7.2).
  const quiet = state.diagnostics.length === before
  const folded = fold(stmt.value, constantLookup(state))
  const declared = stmt.type === undefined ? undefined : typeFromRef(state, stmt.type).type
  const id = stmt.name
  if (id.missing === true) return
  if (folded === undefined && !isUnknown(valueType) && quiet) {
    report(state, 'E3024', stmt.value.span, { name: id.text })
  }
  if (declared !== undefined && folded !== undefined) {
    const failure = assignFailure(declared, constType(folded), stmt.value)
    if (failure !== undefined) {
      reportAssignFailure(state, stmt.value, failure, { data: { name: id.text } })
    }
  }
  const type = declared ?? (folded === undefined ? UNKNOWN : constType(folded))
  const symbol = declareNamed(state, id, 'constant', type, false)
  // `declareNamed` hands back the *first* symbol when the name is already declared (E3002),
  // and that one keeps the value it was declared with: a fresh symbol is the one declared
  // here, at this identifier.
  if (symbol?.declaredAt === id && symbol.kind === 'constant' && folded !== undefined) {
    symbol.constValue = folded
  }
}

/**
 * §5.5. Every target is a write, so the target rules of §5.4 apply — but `Leer` never
 * declares, not even in pseint mode, so the implicit-declaration door is shut.
 */
function checkRead(state: CheckerState, stmt: ReadStmt): void {
  for (const target of stmt.targets) resolveWriteTarget(state, target, UNKNOWN, false)
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

/** §5.7. The condition must be `Logico`; a numeric one gets the "compare explicitly" hint. */
function checkCondition(state: CheckerState, condition: Expr): void {
  const type = typeOf(state, condition)
  if (isUnknown(type)) return
  if (type.kind === 'scalar' && type.name === 'boolean') return
  const data: DiagnosticData = {
    found: typeToString(type, state.profile),
    ...(isNumeric(type) ? { hint: 'compare' } : {}),
  }
  report(state, 'E3014', condition.span, data)
}

/** A label's identity for the duplicate check: text compares by value, so `'a'` meets `"a"`. */
function labelKey(value: ConstValue): string {
  if (typeof value.value === 'string') return `t:${value.value}`
  if (typeof value.value === 'boolean') return `b:${String(value.value)}`
  return `n:${String(value.value)}`
}

/** §5.8. */
function checkSwitch(state: CheckerState, stmt: SwitchStmt): void {
  const selector = typeOf(state, stmt.selector)
  const switchable =
    isUnknown(selector) ||
    (selector.kind === 'scalar' &&
      (selector.name === 'integer' || selector.name === 'char' || selector.name === 'string'))
  if (!switchable) {
    report(state, 'E3028', stmt.selector.span, { found: typeToString(selector, state.profile) })
  }
  const seen = new Map<string, Span>()
  for (const entry of stmt.cases) {
    for (const value of entry.values) {
      const type = typeOf(state, value)
      const folded = fold(value, constantLookup(state))
      if (folded === undefined) {
        if (!isUnknown(type)) report(state, 'E3029', value.span)
        continue
      }
      if (switchable && !isUnknown(selector)) {
        const failure = assignFailure(selector, constType(folded), value)
        if (failure !== undefined) {
          reportAssignFailure(state, value, failure)
          continue
        }
      }
      const key = labelKey(folded)
      const first = seen.get(key)
      if (first !== undefined) {
        report(state, 'E3030', value.span, { value: String(folded.value) }, [{ span: first }])
        continue
      }
      seen.set(key, value.span)
    }
    checkStatements(state, entry.body)
  }
  if (stmt.otherwise !== undefined) checkStatements(state, stmt.otherwise)
}

/** An `Entero` bound or step, reported the way an assignment to an `Entero` would be. */
function checkIntegerBound(state: CheckerState, expr: Expr): void {
  const type = typeOf(state, expr)
  const failure = assignFailure(INTEGER, type, expr)
  if (failure !== undefined) reportAssignFailure(state, expr, failure)
}

/**
 * §5.9: the counter must be an existing *variable* of type `Entero`. The kinds nothing can be
 * written into are the ladder every write shares; a parameter and a function's result are
 * writable, but they belong to the header rather than to the body, so they are E3026 with the
 * `kind` hint — the loop wants a variable of its own.
 */
function checkCounterSymbol(state: CheckerState, counter: Identifier, symbol: Symbol): void {
  if (reportUnwritableKind(state, counter, symbol)) return
  if (symbol.kind === 'parameter' || symbol.kind === 'result') {
    report(state, 'E3026', counter.span, { name: counter.text, hint: 'kind' })
    // The loop is not a write of the result variable any more, and the rejected loop must not
    // cascade into W3004 on top of the E3026 that already says what is wrong (§9).
    if (symbol.kind === 'result') {
      const decl = state.frame.subprogram
      const body = decl === null ? undefined : state.bodies.get(decl)
      if (body !== undefined) body.resultWrites++
    }
    return
  }
  if (isUnknown(symbol.type)) return
  if (symbol.type.kind === 'scalar' && symbol.type.name === 'integer') return
  report(state, 'E3026', counter.span, {
    name: counter.text,
    found: typeToString(symbol.type, state.profile),
  })
}

/**
 * §5.9. Strict mode wants a declared `Entero`; pseint declares a `counter` at the loop. Either
 * way the symbol is read-only for the length of the body, and an ordinary variable after it.
 *
 * Controller ruling (§9): the loop reads the counter every iteration to compare it with `to`,
 * so a `Para` loop counts as a read of the counter as well as a write — a body that never
 * mentions the counter must not draw W3002 for it.
 */
function checkFor(state: CheckerState, stmt: ForStmt): void {
  checkIntegerBound(state, stmt.from)
  checkIntegerBound(state, stmt.to)
  if (stmt.step !== undefined) {
    checkIntegerBound(state, stmt.step)
    const step = fold(stmt.step, constantLookup(state))
    if (step !== undefined && typeof step.value === 'number' && step.value === 0) {
      report(state, 'E3027', stmt.step.span)
    }
  }
  const counter = stmt.counter
  let symbol = counter.missing === true ? undefined : resolveIdentifier(state, counter)
  if (symbol === undefined && counter.missing !== true) {
    if (state.profile.options.implicitDeclarations) {
      // pseint declares the counter at the loop, `Entero` by construction (§5.9).
      symbol = declareNamed(state, counter, 'counter', INTEGER, false)
    } else {
      reportUnknownName(state, counter, 'declare')
      symbol = declareRecovered(state, counter)
    }
  }
  if (symbol === undefined) {
    // A `missing` counter: the parser already reported it, and it is never a symbol.
    setType(state, counter, UNKNOWN)
  } else {
    setType(state, counter, symbol.type)
    symbol.reads++
    symbol.writes++
    checkCounterSymbol(state, counter, symbol)
  }
  const wasCounting = symbol?.counting
  if (symbol !== undefined) symbol.counting = true
  state.frame.loopDepth++
  checkStatements(state, stmt.body)
  state.frame.loopDepth--
  // After the loop the counter is an ordinary variable again, holding whatever was left.
  if (symbol !== undefined) symbol.counting = wasCounting === true
}

export function checkStatements(state: CheckerState, stmts: readonly Stmt[]): void {
  for (const stmt of stmts) checkStatement(state, stmt)
  reportUnreachable(state, stmts)
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
      checkDimension(state, stmt)
      return
    }
    case 'ConstantStmt': {
      checkConstant(state, stmt)
      return
    }
    case 'ReadStmt': {
      checkRead(state, stmt)
      return
    }
    case 'WaitStmt': {
      checkIntegerBound(state, stmt.millis)
      return
    }
    case 'BreakStmt':
    case 'ContinueStmt': {
      if (state.frame.loopDepth > 0) return
      report(state, 'E3031', stmt.span, { kw: stmt.kind === 'BreakStmt' ? 'break' : 'continue' })
      return
    }
    case 'IfStmt': {
      for (const branch of stmt.branches) {
        checkCondition(state, branch.condition)
        checkStatements(state, branch.body)
      }
      if (stmt.elseBody !== undefined) checkStatements(state, stmt.elseBody)
      return
    }
    case 'WhileStmt': {
      checkCondition(state, stmt.condition)
      state.frame.loopDepth++
      checkStatements(state, stmt.body)
      state.frame.loopDepth--
      return
    }
    case 'RepeatStmt': {
      state.frame.loopDepth++
      checkStatements(state, stmt.body)
      state.frame.loopDepth--
      checkCondition(state, stmt.condition)
      return
    }
    case 'SwitchStmt': {
      checkSwitch(state, stmt)
      return
    }
    case 'ForStmt': {
      checkFor(state, stmt)
      return
    }
  }
}
