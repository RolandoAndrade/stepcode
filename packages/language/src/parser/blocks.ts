import type { KeywordKey } from '@stepcode/profiles'
import type { Stmt } from '../ast/index'
import type { Span } from '../source/index'
import { type BlockFrame, type ParserContext, report, reportTooDeep } from './context'
import { parseStatement } from './statement'
import { BLOCK_BOUNDARY_KEYWORDS } from './terminator'
import { keywordKeyOf } from './tokens'

export interface BlockOptions {
  /**
   * An extra stop test, run before each statement: a `Segun` case label that carries no
   * keyword, or the `Mientras Que` that closes a `Repetir`.
   */
  readonly stop?: (ctx: ParserContext) => boolean
}

/**
 * How deep block statements may nest. Each level costs several JavaScript frames, so this
 * limit keeps `parse` total on pathological input; past it the block parses as empty, the
 * enclosing statement reports its missing closer, and E2032 explains why.
 */
export const MAX_BLOCK_DEPTH = 200

/**
 * Statements until a block boundary. Guarantees progress: a statement that consumed nothing
 * costs one token, so no input loops forever.
 */
export function parseBlock(ctx: ParserContext, options: BlockOptions = {}): Stmt[] {
  if (ctx.depth.block >= MAX_BLOCK_DEPTH) {
    reportTooDeep(ctx, MAX_BLOCK_DEPTH)
    return []
  }
  ctx.depth.block++
  try {
    return parseBlockAt(ctx, options)
  } finally {
    ctx.depth.block--
  }
}

function parseBlockAt(ctx: ParserContext, options: BlockOptions): Stmt[] {
  const body: Stmt[] = []
  while (!ctx.cursor.atEnd()) {
    const key = keywordKeyOf(ctx.cursor.peek())
    if (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key)) break
    if (options.stop?.(ctx) === true) break
    const before = ctx.cursor.at()
    const statement = parseStatement(ctx)
    if (statement !== null) body.push(statement)
    if (ctx.cursor.at() === before) ctx.cursor.next()
  }
  return body
}

export function openBlock(ctx: ParserContext, frame: BlockFrame): void {
  ctx.blocks.push(frame)
}

/**
 * Block boundaries that are *not* closers, so they can never dangle:
 * `case` is a label the `Segun` parser reads itself, and `program` opens the main block.
 */
const NEVER_DANGLING: ReadonlySet<KeywordKey> = new Set(['case', 'program'])

/**
 * Keywords that end or continue some block. One of these is *dangling* when no open block
 * lists it in `follows`: it closes nothing, so it is reported and dropped (spec §7).
 */
export const DANGLING_KEYWORDS: ReadonlySet<KeywordKey> = new Set(
  [...BLOCK_BOUNDARY_KEYWORDS].filter((key) => !NEVER_DANGLING.has(key)),
)

/**
 * One block body, plus the dangling-closer recovery: a closer no open block is waiting for
 * gets E2006, is dropped, and the body keeps parsing. A closer an *enclosing* block wants is
 * left alone so `finishBlock` can report the inner block unclosed and hand it outwards.
 */
export function parseSection(ctx: ParserContext, options: BlockOptions = {}): Stmt[] {
  const body: Stmt[] = []
  // `parseBlock` guarantees progress and a round that does not return consumes the dangling
  // closer, so the loop always moves forward.
  for (;;) {
    body.push(...parseBlock(ctx, options))
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === null || !DANGLING_KEYWORDS.has(key)) return body
    if (ctx.blocks.some((frame) => frame.follows.includes(key))) return body
    report(ctx, 'E2006', token.span, { closer: key })
    ctx.cursor.next()
  }
}

export function reportUnclosed(ctx: ParserContext, frame: BlockFrame, closerSpan: Span): void {
  const opener = ctx.tokens[frame.openerToken]
  const span = opener?.span ?? closerSpan
  report(
    ctx,
    'E2003',
    span,
    {
      opener: frame.opener,
      closer: frame.closer,
      openerLine: ctx.lineMap.positionAt(span.start).line,
    },
    [{ span: closerSpan }],
  )
}

/** Consumes the closer, or reports E2003 against the innermost open block. */
export function finishBlock(ctx: ParserContext, closer: KeywordKey): void {
  const frame = ctx.blocks.pop()
  const token = ctx.cursor.peek()
  if (keywordKeyOf(token) === closer) {
    ctx.cursor.next()
    return
  }
  if (frame !== undefined) reportUnclosed(ctx, frame, token.span)
}
