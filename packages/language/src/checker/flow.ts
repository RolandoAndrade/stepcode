import type { Stmt, SubprogramDecl } from '../ast/index'
import { isArray } from '../types/type'
import { type BodyState, type CheckerState, report } from './result'
import type { Scope } from './scope'

/** The statements after which nothing in the same list can run. */
const JUMPS: ReadonlySet<Stmt['kind']> = new Set<Stmt['kind']>([
  'ReturnStmt',
  'BreakStmt',
  'ContinueStmt',
])

/**
 * W3001, the one flow-sensitive check (§9): in any statement list, everything after the first
 * jump is dead. One warning per list, spanning from that statement to the end of the list —
 * not one per statement, which would bury the reader in repetitions of the same fact.
 */
export function reportUnreachable(state: CheckerState, stmts: readonly Stmt[]): void {
  for (let index = 0; index < stmts.length - 1; index++) {
    const stmt = stmts[index]
    if (stmt === undefined || !JUMPS.has(stmt.kind)) continue
    const first = stmts[index + 1]
    const last = stmts[stmts.length - 1]
    if (first === undefined || last === undefined) return
    report(state, 'W3001', { start: first.span.start, end: last.span.end })
    return
  }
}

/**
 * W3002–W3004 (§9), flow-insensitive, one pass per body in declaration order so the output is
 * stable. Parameters, constants, counters and result variables are exempt from W3002 and
 * W3003 by construction: only `variable` symbols are considered. A symbol the checker created
 * to recover from E3001 is exempt from everything — its one mistake is already reported.
 */
export function reportBodyWarnings(
  state: CheckerState,
  scope: Scope,
  decl: SubprogramDecl | null,
  body: BodyState | undefined,
): void {
  for (const symbol of scope.order) {
    if (symbol.recovered === true || symbol.kind !== 'variable') continue
    if (symbol.reads === 0) {
      // Written but never read is still "never read": the value goes nowhere.
      report(state, 'W3002', symbol.declaredAt.span, { name: symbol.name })
      continue
    }
    // An array is initialized by its `Dimension` or its sized declaration, so it is exempt.
    if (symbol.writes === 0 && !isArray(symbol.type)) {
      report(state, 'W3003', symbol.declaredAt.span, { name: symbol.name })
    }
  }
  if (decl === null || decl.form !== 'function' || body === undefined) return
  if (body.resultWrites === 0) {
    report(state, 'W3004', decl.name.span, { name: decl.name.text })
  }
}
