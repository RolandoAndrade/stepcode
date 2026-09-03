import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import type { TokenRange } from '../ast/index'
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

/**
 * The span and inclusive token range of a node that started at token `startIndex` and ended
 * with the last token the cursor consumed.
 */
export function nodeRange(
  ctx: ParserContext,
  startIndex: number,
): { span: Span; tokens: TokenRange } {
  const endIndex = Math.max(startIndex, ctx.cursor.lastIndex())
  const first = ctx.tokens[startIndex]
  const last = ctx.tokens[endIndex]
  const start = first?.span.start ?? 0
  return { span: { start, end: last?.span.end ?? start }, tokens: [startIndex, endIndex] }
}
