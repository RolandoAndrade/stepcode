import type { BuiltinKey, KeywordKey, OperatorKey } from '@stepcode/profiles'
import type { BinaryOp, Expr, Identifier } from '../ast/index'
import type { Span } from '../source/index'
import { nodeRange, type ParserContext, placeholderRange, report, reportTooDeep } from './context'
import { isKeyword, isPunct, keywordKeyOf, operatorKeyOf } from './tokens'

const BINARY_FROM_OPERATOR: Partial<Record<OperatorKey, BinaryOp>> = {
  equal: 'equal',
  notEqual: 'notEqual',
  lt: 'lt',
  le: 'le',
  gt: 'gt',
  ge: 'ge',
  plus: 'plus',
  minus: 'minus',
  times: 'times',
  divide: 'divide',
  power: 'power',
}

const BINARY_FROM_KEYWORD: Partial<Record<KeywordKey, BinaryOp>> = {
  and: 'and',
  or: 'or',
  mod: 'mod',
  div: 'div',
}

/** Spec §5. `left` is what the operator claims from its left side. */
const LEFT_BINDING: Record<BinaryOp, number> = {
  or: 1,
  and: 3,
  equal: 7,
  notEqual: 7,
  lt: 7,
  le: 7,
  gt: 7,
  ge: 7,
  plus: 9,
  minus: 9,
  times: 11,
  divide: 11,
  div: 11,
  mod: 11,
  power: 15,
}

/** `left + 1` for left-associative operators; `left` for right-associative `power`. */
const RIGHT_BINDING: Record<BinaryOp, number> = {
  or: 2,
  and: 4,
  equal: 8,
  notEqual: 8,
  lt: 8,
  le: 8,
  gt: 8,
  ge: 8,
  plus: 10,
  minus: 10,
  times: 12,
  divide: 12,
  div: 12,
  mod: 12,
  power: 15,
}

const COMPARISONS: ReadonlySet<BinaryOp> = new Set(['equal', 'notEqual', 'lt', 'le', 'gt', 'ge'])

/** `not` sits below the relational level: `No a = b` is `No (a = b)`. */
export const NOT_BINDING = 5
/** Unary `-`/`+` sit below power: `-2^2` is `-(2^2)`. */
export const UNARY_BINDING = 13
/** Above every binary power: one primary plus its postfix chain, nothing else. */
export const TARGET_BINDING = 17

function binaryOpOf(token: { kind: string; value?: unknown }): BinaryOp | null {
  if (token.kind === 'operator') return BINARY_FROM_OPERATOR[token.value as OperatorKey] ?? null
  if (token.kind === 'keyword') return BINARY_FROM_KEYWORD[token.value as KeywordKey] ?? null
  return null
}

/**
 * How deep `parseExpression` will descend. Every nesting level (a parenthesis, a prefix
 * operator, the right side of a binary operator) costs one JavaScript frame, so a limit well
 * under the engine's stack keeps `parse` total on pathological input. Past it the expression
 * becomes one `ErrorExpr` carrying E2032; the tokens are left to the statement layer.
 */
export const MAX_EXPRESSION_DEPTH = 500

/** The placeholder a guard hands back: it stands where the too-deep expression would be. */
function tooDeepExpr(ctx: ParserContext): Expr {
  reportTooDeep(ctx, MAX_EXPRESSION_DEPTH)
  return { kind: 'ErrorExpr', ...placeholderRange(ctx, ctx.cursor.at()) }
}

/**
 * Pratt parser over the profile's operators. Never throws: a missing operand becomes an
 * `ErrorExpr` carrying E2031 and parsing continues.
 */
export function parseExpression(ctx: ParserContext, minBinding = 0): Expr {
  if (ctx.depth.expression >= MAX_EXPRESSION_DEPTH) return tooDeepExpr(ctx)
  ctx.depth.expression++
  try {
    return parseExpressionAt(ctx, minBinding)
  } finally {
    ctx.depth.expression--
  }
}

function parseExpressionAt(ctx: ParserContext, minBinding: number): Expr {
  const start = ctx.cursor.at()
  let left = parsePrefix(ctx)
  let afterComparison = false
  for (;;) {
    const token = ctx.cursor.peek()
    const op = binaryOpOf(token)
    if (op === null) break
    const binding = LEFT_BINDING[op]
    if (binding < minBinding) break
    // The relational level is non-associative: `a < b < c` is a mistake, not a nesting.
    if (afterComparison && COMPARISONS.has(op))
      report(ctx, 'E2030', token.span, { text: token.text })
    ctx.cursor.next()
    const right = parseExpression(ctx, RIGHT_BINDING[op])
    left = { kind: 'Binary', op, left, right, ...nodeRange(ctx, start) }
    afterComparison = COMPARISONS.has(op)
  }
  return left
}

/** One primary plus its postfix chain: an assignment target or a `Leer` target. */
export function parseTarget(ctx: ParserContext): Expr {
  return parseExpression(ctx, TARGET_BINDING)
}

function parsePrefix(ctx: ParserContext): Expr {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (isKeyword(token, 'not')) {
    ctx.cursor.next()
    const operand = parseExpression(ctx, NOT_BINDING)
    return { kind: 'Unary', op: 'not', operand, ...nodeRange(ctx, start) }
  }
  const operator = operatorKeyOf(token)
  if (operator === 'minus' || operator === 'plus') {
    ctx.cursor.next()
    const operand = parseExpression(ctx, UNARY_BINDING)
    return { kind: 'Unary', op: operator, operand, ...nodeRange(ctx, start) }
  }
  return parsePostfix(ctx, parsePrimary(ctx), start)
}

/** `a[i,j]` and `a[i][j]` both collapse into one `Index` with two indices. */
function parsePostfix(ctx: ParserContext, target: Expr, start: number): Expr {
  let current = target
  for (;;) {
    const open = ctx.cursor.peek()
    if (!isPunct(open, '[')) return current
    const base = current.kind === 'Index' ? current.target : current
    const indices: Expr[] = current.kind === 'Index' ? [...current.indices] : []
    ctx.cursor.next()
    indices.push(parseExpression(ctx))
    while (isPunct(ctx.cursor.peek(), ',')) {
      ctx.cursor.next()
      indices.push(parseExpression(ctx))
    }
    expectBracket(ctx, ']', open.span)
    current = { kind: 'Index', target: base, indices, ...nodeRange(ctx, start) }
  }
}

function expectBracket(ctx: ParserContext, bracket: ')' | ']', openerSpan: Span): void {
  if (isPunct(ctx.cursor.peek(), bracket)) {
    ctx.cursor.next()
    return
  }
  report(ctx, 'E2005', openerSpan, { bracket })
}

function parseArguments(ctx: ParserContext): Expr[] {
  const open = ctx.cursor.next()
  const args: Expr[] = []
  if (!isPunct(ctx.cursor.peek(), ')')) {
    args.push(parseExpression(ctx))
    while (isPunct(ctx.cursor.peek(), ',')) {
      ctx.cursor.next()
      args.push(parseExpression(ctx))
    }
  }
  expectBracket(ctx, ')', open.span)
  return args
}

function parsePrimary(ctx: ParserContext): Expr {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  switch (token.kind) {
    case 'integer':
    case 'real': {
      ctx.cursor.next()
      const value = typeof token.value === 'number' ? token.value : Number(token.text)
      return { kind: 'Literal', value, type: token.kind, ...nodeRange(ctx, start) }
    }
    case 'string': {
      ctx.cursor.next()
      return {
        kind: 'Literal',
        value: typeof token.value === 'string' ? token.value : '',
        type: 'string',
        ...nodeRange(ctx, start),
      }
    }
    case 'identifier': {
      ctx.cursor.next()
      const callee: Identifier = {
        kind: 'Identifier',
        name: typeof token.value === 'string' ? token.value : token.text,
        text: token.text,
        ...nodeRange(ctx, start),
      }
      // A user-defined zero-argument call still needs its parentheses.
      if (!isPunct(ctx.cursor.peek(), '(')) return callee
      const args = parseArguments(ctx)
      return { kind: 'Call', callee, args, ...nodeRange(ctx, start) }
    }
    case 'builtin': {
      ctx.cursor.next()
      const key = token.value as BuiltinKey
      // A bare builtin is a zero-argument call: `PI`, `Azar`.
      const args = isPunct(ctx.cursor.peek(), '(') ? parseArguments(ctx) : []
      return { kind: 'BuiltinCall', key, args, ...nodeRange(ctx, start) }
    }
    case 'punct': {
      if (token.text !== '(') break
      ctx.cursor.next()
      const inner = parseExpression(ctx)
      // Parentheses produce no node; their tokens fall inside the parent's range.
      expectBracket(ctx, ')', token.span)
      return inner
    }
    case 'keyword': {
      const key = keywordKeyOf(token)
      if (key !== 'true' && key !== 'false') break
      ctx.cursor.next()
      return { kind: 'Literal', value: key === 'true', type: 'boolean', ...nodeRange(ctx, start) }
    }
    default:
      break
  }
  // The offending token is left in place so the statement layer can recover on it, which is
  // why the placeholder stands on the last consumed token instead.
  report(ctx, 'E2031', token.span, { found: token.text })
  return { kind: 'ErrorExpr', ...placeholderRange(ctx, start) }
}
