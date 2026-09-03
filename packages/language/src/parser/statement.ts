import type { Stmt } from '../ast/index'
import { nodeRange, type ParserContext, report } from './context'
import { parseDefine } from './declarations'
import { STATEMENT_START_KEYWORDS, skipToRecoveryPoint } from './terminator'
import { isPunct, keywordKeyOf } from './tokens'

/**
 * One statement, or `null` when nothing should be added to the body: an empty statement
 * (`;`), or a statement kind Task 7's dispatcher will own. A keyword from
 * `STATEMENT_START_KEYWORDS` is syntactically a statement even before its parser exists, so
 * it is skipped without a diagnostic rather than reported as an error.
 */
export function parseStatement(ctx: ParserContext): Stmt | null {
  const token = ctx.cursor.peek()
  if (isPunct(token, ';')) {
    report(ctx, 'W2001', token.span)
    ctx.cursor.next()
    return null
  }
  const key = keywordKeyOf(token)
  if (key === 'define') return parseDefine(ctx)
  if (key !== null && STATEMENT_START_KEYWORDS.has(key)) {
    skipToRecoveryPoint(ctx)
    return null
  }
  return parseErrorStatement(ctx)
}

/** E2002 at the offending token, then skip to the next recovery point: one `ErrorStmt`. */
export function parseErrorStatement(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  report(ctx, 'E2002', token.span, { found: token.text })
  skipToRecoveryPoint(ctx)
  return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
}
