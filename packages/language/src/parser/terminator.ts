import type { KeywordKey } from '@stepcode/profiles'
import type { Token } from '../lexer/index'
import { type ParserContext, report } from './context'
import { isPunct, keywordKeyOf } from './tokens'

/** Keywords that end or continue a block. A statement never starts with one of these. */
export const BLOCK_BOUNDARY_KEYWORDS: ReadonlySet<KeywordKey> = new Set([
  'endProgram',
  'endProcedure',
  'endFunction',
  'endIf',
  'elseIf',
  'else',
  'endSwitch',
  'case',
  'otherwise',
  'endWhile',
  'endFor',
  'until',
  // A top-level opener can never appear inside a block, so meeting one ends the block and
  // hands the token back to `parseProgram` instead of garbling the rest of the file.
  'program',
  'procedure',
  'function',
])

/** Keywords a statement may start with. */
export const STATEMENT_START_KEYWORDS: ReadonlySet<KeywordKey> = new Set([
  'define',
  'dimension',
  'constant',
  'write',
  'writeNoNewline',
  'read',
  'if',
  'switch',
  'while',
  'repeat',
  'for',
  'break',
  'continue',
  'return',
  'clearScreen',
  'wait',
  'waitKey',
])

/** Used by the missing-terminator rule to tell "next statement" from "garbled tail". */
export function canStartStatement(token: Token): boolean {
  const key = keywordKeyOf(token)
  if (key !== null) return STATEMENT_START_KEYWORDS.has(key) || BLOCK_BOUNDARY_KEYWORDS.has(key)
  return token.kind === 'identifier' || token.kind === 'builtin' || token.kind === 'eof'
}

export type TerminatorResult =
  /** A terminator was there, or none was needed. */
  | 'ok'
  /** E2001: the terminator is missing but the statement is intact; keep it. */
  | 'missing'
  /** E2002: the tail is garbled; the caller returns an `ErrorStmt`. */
  | 'garbled'

/**
 * Spec §7. With `requireSemicolons`, only a `;` on the same line terminates; a statement
 * that runs into the next line gets E2001 and is kept, anything else gets E2002 and is
 * skipped. Without it, a line break, a block boundary or end of file all terminate.
 */
export function consumeTerminator(ctx: ParserContext): TerminatorResult {
  const { cursor } = ctx
  if (isPunct(cursor.peekRaw(), ';')) {
    cursor.next()
    return 'ok'
  }
  const next = cursor.peek()
  if (!ctx.profile.options.requireSemicolons) {
    const key = keywordKeyOf(next)
    const atBoundary = next.kind === 'eof' || (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key))
    if (atBoundary || cursor.onNewLine()) return 'ok'
    report(ctx, 'E2002', next.span, { found: next.text })
    skipToRecoveryPoint(ctx)
    return 'garbled'
  }
  if (next.kind === 'eof' || (cursor.onNewLine() && canStartStatement(next))) {
    const previous = ctx.tokens[cursor.lastIndex()]
    const at = previous?.span.end ?? next.span.start
    report(ctx, 'E2001', { start: at, end: at })
    return 'missing'
  }
  report(ctx, 'E2002', next.span, { found: next.text })
  skipToRecoveryPoint(ctx)
  return 'garbled'
}

/**
 * Skips the garbled tail: to just past the next `;`, or up to the next line break, block
 * boundary or statement keyword. Always consumes at least one token, so no caller can spin.
 */
export function skipToRecoveryPoint(ctx: ParserContext): void {
  const { cursor } = ctx
  cursor.next()
  while (!cursor.atEnd()) {
    if (cursor.peekRaw().kind === 'newline') return
    const token = cursor.peek()
    if (isPunct(token, ';')) {
      cursor.next()
      return
    }
    const key = keywordKeyOf(token)
    if (key !== null && (BLOCK_BOUNDARY_KEYWORDS.has(key) || STATEMENT_START_KEYWORDS.has(key))) {
      return
    }
    cursor.next()
  }
}
