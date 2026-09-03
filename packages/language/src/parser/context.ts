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

export function report(
  ctx: ParserContext,
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): void {
  ctx.diagnostics.push(createDiagnostic(code, span, data, related))
}

/** E2032, at most once per parse: the input nests deeper than the parser will descend. */
export function reportTooDeep(ctx: ParserContext, limit: number): void {
  if (ctx.depth.reported) return
  ctx.depth.reported = true
  report(ctx, 'E2032', ctx.cursor.peek().span, { limit })
}

/**
 * The range of a placeholder node standing in for syntax that is not there: an `ErrorExpr`, a
 * synthesized `Identifier`. It points at the last token the parser consumed — never at the
 * token still ahead, which belongs to whatever recovers next — so a placeholder always lies
 * inside its parent's range and never claims a token twice. Before anything is consumed the
 * parent starts where the placeholder does, so `startIndex` stands in.
 */
export function placeholderRange(
  ctx: ParserContext,
  startIndex: number,
): { span: Span; tokens: TokenRange } {
  const last = ctx.cursor.lastIndex()
  const index = last < 0 ? startIndex : last
  const token = ctx.tokens[index]
  const span = token?.span ?? { start: 0, end: 0 }
  return { span: { start: span.start, end: span.end }, tokens: [index, index] }
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
