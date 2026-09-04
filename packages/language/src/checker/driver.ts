import type { ResolvedProfile } from '@stepcode/profiles'
import type {
  Expr,
  Identifier,
  MainBlock,
  Param,
  Program,
  Stmt,
  SubprogramDecl,
  TypeRef,
} from '../ast/index'
import { sortDiagnostics } from '../diagnostics/sort'
import type { Span } from '../source/index'
import { fold } from '../types/fold'
import { arrayOf, isUnknown, scalar, type Type, UNKNOWN } from '../types/type'
import { constantLookup, typeOf } from './expressions'
import { type BodyState, type CheckerState, type CheckResult, createState, report } from './result'
import {
  createScope,
  createSymbol,
  declareSymbol,
  lookupLocal,
  type Scope,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
  type Symbol,
} from './scope'
import { checkStatements } from './statements'

/**
 * An array size (§5.1, §5.2). It must fold to a positive integer, else E3023 — unless the
 * expression is already `unknown`, in which case something else was reported and this stays
 * silent.
 */
export function checkSize(state: CheckerState, size: Expr): void {
  const type = typeOf(state, size)
  if (isUnknown(type)) return
  const value = fold(size, constantLookup(state))
  if (value !== undefined && value.type === 'integer' && Number(value.value) > 0) return
  report(state, 'E3023', size.span)
}

/**
 * The type a `TypeRef` denotes, and whether it fixed the array's sizes. `[]` is a scalar;
 * `[null, …]` an unsized array of that rank; sized dimensions are checked and mark the array
 * dimensioned.
 */
export function typeFromRef(
  state: CheckerState,
  ref: TypeRef,
): { type: Type; dimensioned: boolean } {
  if (ref.dimensions.length === 0) return { type: scalar(ref.base), dimensioned: false }
  let dimensioned = false
  for (const dimension of ref.dimensions) {
    if (dimension === null) continue
    dimensioned = true
    checkSize(state, dimension)
  }
  return { type: arrayOf(ref.base, ref.dimensions.length), dimensioned }
}

function declareParam(state: CheckerState, scope: Scope, param: Param): Symbol | null {
  const name = param.name
  // No name to declare, but the position still counts: `null` keeps `params` aligned with the
  // arguments a call writes (§5.11).
  if (name.missing === true) return null
  const existing = lookupLocal(scope, name.name)
  if (existing !== undefined) {
    report(state, 'E3002', name.span, { name: name.text, hint: 'parameter' }, [
      { span: existing.declaredAt.span },
    ])
    return existing
  }
  const type = param.type === undefined ? UNKNOWN : typeFromRef(state, param.type).type
  const symbol = createSymbol({
    name: name.name,
    kind: 'parameter',
    type,
    declaredAt: name,
    scope,
    byRef: param.byRef,
  })
  if (type.kind === 'array') symbol.dimensioned = true
  declareSymbol(scope, symbol)
  state.symbols.set(name, symbol)
  return symbol
}

/**
 * Phase one (§8.1): every subprogram gets its name in the program scope, a body scope with
 * its parameters and its result variable, and a `BodyState`. No body is checked here.
 */
function collectSignatures(state: CheckerState, program: Program): void {
  for (const decl of program.subprograms) {
    const name = decl.name
    if (name.missing !== true) {
      const existing = lookupLocal(state.programScope, name.name)
      if (existing === undefined) {
        const symbol = createSymbol({
          name: name.name,
          kind: 'subprogram',
          type: UNKNOWN,
          declaredAt: name,
          scope: state.programScope,
          decl,
        })
        declareSymbol(state.programScope, symbol)
        state.symbols.set(name, symbol)
      } else {
        report(state, 'E3002', name.span, { name: name.text }, [{ span: existing.declaredAt.span }])
      }
    }
    const scope = createScope('body', decl, state.programScope)
    state.scopes.push(scope)
    // Parameter types may name array sizes, which are expressions: type them in the body
    // scope they belong to, not in the program scope.
    const previous = state.frame
    state.frame = { scope, subprogram: decl, loopDepth: 0 }
    const params: (Symbol | null)[] = []
    for (const param of decl.params) params.push(declareParam(state, scope, param))
    const declared =
      decl.returnType === undefined ? UNKNOWN : typeFromRef(state, decl.returnType).type
    let result: Symbol | null = null
    if (decl.returnName !== undefined && decl.returnName.missing !== true) {
      result = createSymbol({
        name: decl.returnName.name,
        kind: 'result',
        type: declared,
        declaredAt: decl.returnName,
        scope,
      })
      declareSymbol(scope, result)
      state.symbols.set(decl.returnName, result)
    }
    state.frame = previous
    state.bodies.set(decl, {
      status: 'unchecked',
      scope,
      params,
      result,
      resultType: declared,
      resultWrites: 0,
      inferReported: false,
    })
  }
}

/** The statement lists one statement holds. A nested subprogram owns its own body scope. */
function innerBodies(stmt: Stmt): readonly (readonly Stmt[])[] {
  switch (stmt.kind) {
    case 'IfStmt':
      return [
        ...stmt.branches.map((branch) => branch.body),
        ...(stmt.elseBody === undefined ? [] : [stmt.elseBody]),
      ]
    case 'SwitchStmt':
      return [
        ...stmt.cases.map((entry) => entry.body),
        ...(stmt.otherwise === undefined ? [] : [stmt.otherwise]),
      ]
    case 'WhileStmt':
    case 'RepeatStmt':
    case 'ForStmt':
      return [stmt.body]
    default:
      return []
  }
}

/**
 * §3.2: the names a body declares, wherever in it they are written — a body scope has no
 * blocks, so a `Definir` inside a loop declares for the whole body. Only the first writing of
 * a name is kept: it is the one a use above it was reaching for. A nested subprogram is a
 * scope of its own and is not descended into.
 */
function pendingNames(
  stmts: readonly Stmt[],
  into = new Map<string, Identifier>(),
): Map<string, Identifier> {
  for (const stmt of stmts) {
    if (stmt.kind === 'DefineStmt') {
      for (const name of stmt.names) {
        if (name.missing !== true && !into.has(name.name)) into.set(name.name, name)
      }
    } else if (stmt.kind === 'ConstantStmt') {
      const name = stmt.name
      if (name.missing !== true && !into.has(name.name)) into.set(name.name, name)
    }
    if (stmt.kind === 'SubprogramDecl') continue
    for (const body of innerBodies(stmt)) pendingNames(body, into)
  }
  return into
}

function checkMain(state: CheckerState, block: MainBlock): void {
  const scope = createScope('body', block, state.programScope)
  state.scopes.push(scope)
  const previous = state.frame
  state.frame = { scope, subprogram: null, loopDepth: 0, pending: pendingNames(block.body) }
  checkStatements(state, block.body)
  state.frame = previous
}

/**
 * §8.3. Checks a subprogram body at most once. When the call site brought argument types and
 * the body has untyped parameters, they are fixed here first, so the body is checked with the
 * types its first caller gave it. A call that arrives while the body is already being checked
 * is a cycle: the parameters stay `unknown` and E3015 says so, once.
 */
export function ensureChecked(
  state: CheckerState,
  decl: SubprogramDecl,
  argTypes: readonly Type[] | undefined,
  site: Span | undefined,
): BodyState | undefined {
  const body = state.bodies.get(decl)
  if (body === undefined) return undefined
  if (body.status === 'checked') return body
  if (body.status === 'checking') {
    if (argTypes !== undefined && !body.inferReported) {
      body.inferReported = true
      for (const param of body.params) {
        if (param === null || !isUnknown(param.type)) continue
        report(state, 'E3015', param.declaredAt.span, { name: param.name, hint: 'parameter' })
      }
    }
    return body
  }
  body.status = 'checking'
  if (argTypes !== undefined) {
    let fixed = false
    body.params.forEach((param, index) => {
      const argument = argTypes[index]
      if (param === null || argument === undefined || isUnknown(argument)) return
      if (!isUnknown(param.type)) return
      param.type = argument
      fixed = true
    })
    if (fixed && site !== undefined) body.fixedBy = site
  }
  const previous = state.frame
  state.frame = {
    scope: body.scope,
    subprogram: decl,
    loopDepth: 0,
    pending: pendingNames(decl.body),
  }
  checkStatements(state, decl.body)
  state.frame = previous
  body.status = 'checked'
  return body
}

/**
 * Spec §8. Phase one collects every signature; phase two checks main, then each extra main,
 * with subprogram bodies pulled in on demand from their first call; whatever is left is
 * checked in source order at the end.
 */
export function check(program: Program, options: { profile: ResolvedProfile }): CheckResult {
  const state = createState(program, options.profile)
  collectSignatures(state, program)
  if (program.main !== null) checkMain(state, program.main)
  for (const extra of program.extraMains) checkMain(state, extra)
  for (const decl of program.subprograms) ensureChecked(state, decl, undefined, undefined)
  return {
    diagnostics: sortDiagnostics(state.diagnostics),
    types: state.types,
    symbols: state.symbols,
    calls: state.calls,
    scopes: state.scopes,
  }
}
