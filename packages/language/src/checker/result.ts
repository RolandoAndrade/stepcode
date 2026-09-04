import type { ResolvedProfile } from '@stepcode/profiles'
import type { Call, Expr, Identifier, Program, SubprogramDecl } from '../ast/index'
import {
  createDiagnostic,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticData,
  type RelatedSpan,
} from '../diagnostics/index'
import type { Span } from '../source/index'
import type { AssignFailure } from '../types/assign'
import { type Type, typeToString } from '../types/type'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import { createScope, type Scope, type Symbol } from './scope'

/**
 * What `check` hands back. The interpreter and the editor read these tables instead of
 * re-deriving anything: only the checker knows types.
 */
export interface CheckResult {
  readonly diagnostics: readonly Diagnostic[]
  /** Every expression node of every checked body. */
  readonly types: WeakMap<Expr, Type>
  /** Every resolved, non-missing identifier. */
  readonly symbols: WeakMap<Identifier, Symbol>
  /** Every resolved user call. */
  readonly calls: WeakMap<Call, SubprogramDecl>
  /** The program scope first, then one body scope per body, in the order they were built. */
  readonly scopes: readonly Scope[]
}

/** Per-subprogram bookkeeping for the on-demand body check of §8. */
export interface BodyState {
  status: 'unchecked' | 'checking' | 'checked'
  readonly scope: Scope
  /**
   * One entry per written parameter, in source order. A parameter whose name the parser could
   * not read is `null`, so an argument is always paired with the parameter at its position.
   */
  readonly params: (Symbol | null)[]
  /**
   * The result *variable* — the one the header names in `r <- f(…)`, which lives in the body
   * scope. `null` for a procedure and for a `f(): T` function, which returns only through
   * `Retornar` and so has no name to assign to.
   */
  readonly result: Symbol | null
  /** What a call to this subprogram yields. `unknown` until §5.12 fixes it. */
  resultType: Type
  /** Assignments to the result variable plus `Retornar value`, for W3004. */
  resultWrites: number
  /** The call that fixed the untyped parameters, for the E3035 `related` span (§5.12). */
  fixedBy?: Span
  /** E3015 is reported once per body, however many calls hit the same cycle. */
  inferReported: boolean
}

/** The body being checked right now. */
export interface Frame {
  readonly scope: Scope
  /** `null` while main or an `extraMains` body is being checked. */
  readonly subprogram: SubprogramDecl | null
  /** Loops of *this* body only: a loop in a caller does not make `Romper` legal here (§5.10). */
  loopDepth: number
  /**
   * The names this body declares *below* the point being checked, gathered before it is
   * checked: names are declared in source order, so a use above its `Definir` finds nothing
   * and would read as E3001 without this. §3.2 wants E3003 there, pointing at the declaration.
   */
  readonly pending?: ReadonlyMap<string, Identifier>
}

export interface CheckerState {
  readonly profile: ResolvedProfile
  readonly diagnostics: Diagnostic[]
  readonly types: WeakMap<Expr, Type>
  readonly symbols: WeakMap<Identifier, Symbol>
  readonly calls: WeakMap<Call, SubprogramDecl>
  readonly scopes: Scope[]
  readonly programScope: Scope
  readonly bodies: Map<SubprogramDecl, BodyState>
  frame: Frame
}

export function createState(program: Program, profile: ResolvedProfile): CheckerState {
  const programScope = createScope('program', program, null)
  return {
    profile,
    diagnostics: [],
    types: new WeakMap(),
    symbols: new WeakMap(),
    calls: new WeakMap(),
    scopes: [programScope],
    programScope,
    bodies: new Map(),
    frame: { scope: programScope, subprogram: null, loopDepth: 0 },
  }
}

export function report(
  state: CheckerState,
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): void {
  state.diagnostics.push(createDiagnostic(code, span, data, related))
}

/** Records the type of one expression node and hands it back, so callers can `return`. */
export function setType(state: CheckerState, expr: Expr, type: Type): Type {
  state.types.set(expr, type)
  return type
}

export interface AssignContext {
  /** An argument mismatch is E3035 rather than E3010; E3009 and E3011 keep their own code. */
  readonly code?: 'E3035'
  readonly data?: DiagnosticData
  readonly related?: readonly RelatedSpan[]
}

/**
 * The one place a type reaches a diagnostic. Both types are rendered here with
 * `typeToString`, so no catalog ever receives a `Type` object.
 */
export function reportAssignFailure(
  state: CheckerState,
  span: Span,
  failure: AssignFailure,
  context: AssignContext = {},
): void {
  const data: Record<string, string | number> = {
    expected: typeToString(failure.expected, state.profile),
    found: typeToString(failure.found, state.profile),
    ...context.data,
  }
  if (failure.hint !== undefined) data.hint = failure.hint
  if (failure.length !== undefined) data.length = failure.length
  const code = failure.code === 'E3010' && context.code !== undefined ? context.code : failure.code
  report(state, code, span, data, context.related)
}
