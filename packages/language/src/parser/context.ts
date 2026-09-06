import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import type { SubprogramDecl, TokenRange } from '../ast/index'
import {
  createDiagnostic,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticData,
  type RelatedSpan,
} from '../diagnostics/index'
import type { Token } from '../lexer/index'
import { LineMap, type Span } from '../source/index'
import { Cursor } from './cursor'

/**
 * One open block. `follows` lists every keyword this block may still consume — `endIf` plus
 * `elseIf` and `else` for an `if`, `until` and `while` for a `repeat` — so the recovery layer
 * can tell a dangling closer from one an enclosing block is waiting for.
 */
export interface BlockFrame {
  readonly opener: KeywordKey
  readonly closer: KeywordKey
  readonly follows: readonly KeywordKey[]
  /** Token index of the opener keyword, for the E2003 span and line number. */
  readonly openerToken: number
}

export interface ParserContext {
  readonly source: string
  readonly profile: ResolvedProfile
  readonly tokens: readonly Token[]
  readonly cursor: Cursor
  readonly lineMap: LineMap
  /** Lexer diagnostics first, then parser diagnostics in the order they are found. */
  readonly diagnostics: Diagnostic[]
  readonly blocks: BlockFrame[]
  /**
   * Every subprogram of the file, in the order they were met — including one found inside a
   * block, which is reported (E2015) but still belongs to the program, not to the block.
   */
  readonly subprograms: SubprogramDecl[]
  /**
   * Nesting counters for the depth guards (`MAX_EXPRESSION_DEPTH`, `MAX_BLOCK_DEPTH`). Deep
   * input must not reach the JavaScript stack limit, so both parsers stop descending past
   * their limit and report E2032 — once per parse, however many times the limit is hit.
   */
  readonly depth: { expression: number; block: number; reported: boolean }
}

export function createContext(
  source: string,
  tokens: readonly Token[],
  profile: ResolvedProfile,
  diagnostics: Diagnostic[] = [],
): ParserContext {
  return {
    source,
    profile,
    tokens,
    cursor: new Cursor(tokens),
    lineMap: new LineMap(source),
    diagnostics,
    blocks: [],
    subprograms: [],
    depth: { expression: 0, block: 0, reported: false },
  }
}

/**
 * Diagnostics that a depth-limited parse would only invent about itself: the brackets and
 * closers it stopped short of reading. Once E2032 has been reported they are noise — the one
 * real problem is the nesting — so they are dropped for the rest of the parse.
 */
const AFTER_TOO_DEEP: ReadonlySet<DiagnosticCode> = new Set(['E2003', 'E2005', 'E2006'])

export function report(
  ctx: ParserContext,
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): void {
  if (ctx.depth.reported && AFTER_TOO_DEEP.has(code)) return
  ctx.diagnostics.push(createDiagnostic(code, span, data, related))
}

/**
 * E2032, at most once per parse: the input nests deeper than the parser will descend. From
 * here on the unclosed-bracket and unclosed-block diagnostics are suppressed (`report`), since
 * the parser stopped reading, not the program.
 */
export function reportTooDeep(ctx: ParserContext, limit: number): void {
  if (ctx.depth.reported) return
  report(ctx, 'E2032', ctx.cursor.peek().span, { limit })
  ctx.depth.reported = true
}

/**
 * The range of a placeholder standing in for syntax that is not there: an `ErrorExpr`, a
 * synthesized `Identifier`, a node that consumed nothing at all.
 *
 * It is genuinely empty. The token range is `[last + 1, last]` — first past last, the empty
 * range of spec §6 — so the placeholder owns no token: neither the one still ahead, which
 * belongs to whatever recovers next, nor the last one consumed, which belongs to the node that
 * consumed it. The span is zero-width where the missing token would have begun.
 */
export function placeholderRange(
  ctx: ParserContext,
  startIndex: number,
): { span: Span; tokens: TokenRange } {
  const last = ctx.cursor.lastIndex()
  const first = last < 0 ? startIndex : last + 1
  // The stream is contiguous, so this is also the end of the token before it.
  const at = ctx.tokens[first]?.span.start ?? ctx.source.length
  return { span: { start: at, end: at }, tokens: [first, first - 1] }
}

/**
 * The span and inclusive token range of a node that started at token `startIndex` and ended
 * with the last token the cursor consumed. A node that consumed nothing at all gets the
 * placeholder range instead of claiming the token ahead, which keeps every node inside its
 * parent: the end is the last consumed token, so it is never behind a child's end.
 */
export function nodeRange(
  ctx: ParserContext,
  startIndex: number,
): { span: Span; tokens: TokenRange } {
  const endIndex = ctx.cursor.lastIndex()
  if (endIndex < startIndex) return placeholderRange(ctx, startIndex)
  const first = ctx.tokens[startIndex]
  const last = ctx.tokens[endIndex]
  const start = first?.span.start ?? 0
  return { span: { start, end: last?.span.end ?? start }, tokens: [startIndex, endIndex] }
}
