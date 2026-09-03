import type { KeywordKey } from '@stepcode/profiles'
import type {
  BuiltinCall,
  Call,
  DimensionItem,
  Expr,
  Identifier,
  IfBranch,
  Index,
  Stmt,
  SubprogramDecl,
  SwitchCase,
  TypeRef,
} from '../ast/index'
import type { Token } from '../lexer/index'
import { finishBlock, openBlock, parseSection, reportUnclosed } from './blocks'
import { nodeRange, type ParserContext, placeholderRange, report } from './context'
import {
  expectIdentifier,
  parseDefine,
  parseFunction,
  parseProcedure,
  parseTypeRef,
} from './declarations'
import { parseExpression, parseTarget } from './expression'
import { parseCommaSeparated } from './list'
import { BLOCK_BOUNDARY_KEYWORDS, consumeTerminator, skipToRecoveryPoint } from './terminator'
import { isKeyword, isOperator, isPunct, keywordKeyOf } from './tokens'

function errorStmt(ctx: ParserContext, start: number): Stmt {
  return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
}

/** Consumes a required keyword (`Entonces`, `Hacer`) or reports E2004 and carries on. */
function expectKeyword(ctx: ParserContext, key: KeywordKey): void {
  // An `error` token in the way is the lexer's business, not a missing keyword.
  while (ctx.cursor.peek().kind === 'error') ctx.cursor.next()
  if (isKeyword(ctx.cursor.peek(), key)) {
    ctx.cursor.next()
    return
  }
  report(ctx, 'E2004', ctx.cursor.peek().span, { expected: key })
}

/** One statement, or `null` for an empty statement (`;`), which produces no node. */
export function parseStatement(ctx: ParserContext): Stmt | null {
  const token = ctx.cursor.peek()
  if (isPunct(token, ';')) {
    report(ctx, 'W2001', token.span)
    ctx.cursor.next()
    return null
  }
  // The lexer already reported this run; it produces no node and no second diagnostic.
  if (token.kind === 'error') {
    ctx.cursor.next()
    return null
  }
  switch (keywordKeyOf(token)) {
    case 'procedure':
    case 'function':
      return parseMisplacedSubprogram(ctx)
    case 'define':
      return parseDefine(ctx)
    case 'dimension':
      return parseDimension(ctx)
    case 'constant':
      return parseConstant(ctx)
    case 'write':
      return parseWrite(ctx, true)
    case 'writeNoNewline':
      return parseWrite(ctx, false)
    case 'read':
      return parseRead(ctx)
    case 'if':
      return parseIf(ctx)
    case 'switch':
      return parseSwitch(ctx)
    case 'while':
      return parseWhile(ctx)
    case 'repeat':
      return parseRepeat(ctx)
    case 'for':
      return parseFor(ctx)
    case 'break':
      return parseBare(ctx, 'BreakStmt')
    case 'continue':
      return parseBare(ctx, 'ContinueStmt')
    case 'return':
      return parseReturn(ctx)
    case 'clearScreen':
      return parseBare(ctx, 'ClearStmt')
    case 'waitKey':
      return parseBare(ctx, 'WaitKeyStmt')
    case 'wait':
      return parseWait(ctx)
    default:
      break
  }
  if (token.kind === 'identifier' || token.kind === 'builtin') return parseAssignOrCall(ctx)
  return parseErrorStatement(ctx)
}

/**
 * A `SubProceso`/`Funcion` met inside an open block. It is parsed in full and stays where the
 * source put it — a statement of this block — while `Program.subprograms` keeps the very same
 * object, so only its placement is wrong: E2015 at the opener and the block goes on after its
 * closer.
 */
function parseMisplacedSubprogram(ctx: ParserContext): Stmt {
  const token = ctx.cursor.peek()
  const form = keywordKeyOf(token) === 'procedure' ? 'procedure' : 'function'
  report(ctx, 'E2015', token.span, { form })
  const declaration = form === 'procedure' ? parseProcedure(ctx) : parseFunction(ctx)
  const misplaced: SubprogramDecl = { ...declaration, misplaced: true }
  ctx.subprograms.push(misplaced)
  return misplaced
}

/** E2002 at the offending token, then skip to the next recovery point: one `ErrorStmt`. */
export function parseErrorStatement(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  report(ctx, 'E2002', token.span, { found: token.text })
  skipToRecoveryPoint(ctx)
  return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
}

// --- simple statements -----------------------------------------------------

function parseBare(
  ctx: ParserContext,
  kind: 'BreakStmt' | 'ContinueStmt' | 'ClearStmt' | 'WaitKeyStmt',
): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind, ...nodeRange(ctx, start) }
}

function parseWait(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const millis = parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'WaitStmt', millis, ...nodeRange(ctx, start) }
}

function parseReturn(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const token = ctx.cursor.peek()
  const key = keywordKeyOf(token)
  const bare =
    isPunct(token, ';') ||
    token.kind === 'eof' ||
    (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key)) ||
    ctx.cursor.onNewLine()
  const value = bare ? undefined : parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  const range = nodeRange(ctx, start)
  return value === undefined
    ? { kind: 'ReturnStmt', ...range }
    : { kind: 'ReturnStmt', value, ...range }
}

function parseWrite(ctx: ParserContext, newline: boolean): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const args = parseCommaSeparated(ctx, parseExpression)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'WriteStmt', args, newline, ...nodeRange(ctx, start) }
}

function parseRead(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const targets: (Identifier | Index)[] = []
  for (const target of parseCommaSeparated(ctx, parseTarget)) {
    if (target.kind === 'Identifier' || target.kind === 'Index') targets.push(target)
    else
      report(ctx, 'E2002', target.span, {
        found: ctx.source.slice(target.span.start, target.span.end),
      })
  }
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'ReadStmt', targets, ...nodeRange(ctx, start) }
}

function parseDimension(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const items: DimensionItem[] = []
  // A round that does not break consumes the `,` between two items.
  for (;;) {
    const itemStart = ctx.cursor.at()
    const name = expectIdentifier(ctx)
    const sizes: Expr[] = []
    // Each round consumes its `[`, so the loop always moves forward.
    while (isPunct(ctx.cursor.peek(), '[')) {
      const open = ctx.cursor.next()
      sizes.push(...parseCommaSeparated(ctx, parseExpression))
      if (isPunct(ctx.cursor.peek(), ']')) ctx.cursor.next()
      else report(ctx, 'E2005', open.span, { bracket: ']' })
    }
    items.push({ name, sizes, ...nodeRange(ctx, itemStart) })
    if (!isPunct(ctx.cursor.peek(), ',')) break
    ctx.cursor.next()
  }
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'DimensionStmt', items, ...nodeRange(ctx, start) }
}

function parseConstant(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const name = expectIdentifier(ctx)
  let type: TypeRef | undefined
  if (isKeyword(ctx.cursor.peek(), 'as')) {
    ctx.cursor.next()
    type = parseTypeRef(ctx) ?? undefined
  }
  if (isOperator(ctx.cursor.peek(), 'assign')) ctx.cursor.next()
  else {
    const token = ctx.cursor.peek()
    report(ctx, 'E2002', token.span, { found: token.text })
    skipToRecoveryPoint(ctx)
    return errorStmt(ctx, start)
  }
  const value = parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  const range = nodeRange(ctx, start)
  return type === undefined
    ? { kind: 'ConstantStmt', name, value, ...range }
    : { kind: 'ConstantStmt', name, type, value, ...range }
}

/** `Target assign Expr`, `Target equal Expr` (option), a call statement, or E2002. */
function parseAssignOrCall(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  const target = parseTarget(ctx)
  const next = ctx.cursor.peek()
  const viaEquals = ctx.profile.options.assignWithEquals && isOperator(next, 'equal')
  if (isOperator(next, 'assign') || viaEquals) {
    ctx.cursor.next()
    const value = parseExpression(ctx)
    const terminator = consumeTerminator(ctx)
    if (target.kind !== 'Identifier' && target.kind !== 'Index') {
      report(ctx, 'E2020', target.span)
      return errorStmt(ctx, start)
    }
    if (terminator === 'garbled') return errorStmt(ctx, start)
    return { kind: 'AssignStmt', target, value, viaEquals, ...nodeRange(ctx, start) }
  }
  if (target.kind === 'Call' || target.kind === 'BuiltinCall') {
    const call: Call | BuiltinCall = target
    if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
    return { kind: 'CallStmt', call, ...nodeRange(ctx, start) }
  }
  report(ctx, 'E2002', next.span, { found: next.text })
  skipToRecoveryPoint(ctx)
  return errorStmt(ctx, start)
}

// --- control flow ----------------------------------------------------------

/** One `Si`/`Sino Si` branch: its condition, `Entonces`, and body, from the condition on. */
function parseIfBranch(ctx: ParserContext): IfBranch {
  const start = ctx.cursor.at()
  const condition = parseExpression(ctx)
  expectKeyword(ctx, 'then')
  const body = parseSection(ctx)
  return { condition, body, ...nodeRange(ctx, start) }
}

function parseIf(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'if',
    closer: 'endIf',
    follows: ['elseIf', 'else', 'endIf'],
    openerToken: start,
  })
  const branches: IfBranch[] = [parseIfBranch(ctx)]
  while (isKeyword(ctx.cursor.peek(), 'elseIf')) {
    ctx.cursor.next()
    branches.push(parseIfBranch(ctx))
  }
  let elseBody: Stmt[] | undefined
  if (isKeyword(ctx.cursor.peek(), 'else')) {
    ctx.cursor.next()
    elseBody = parseSection(ctx)
  }
  // A branch written after the `Sino` is out of order, not lost: E2015's sibling E2014 says so
  // and the branch joins the others, so the tree still holds every statement of the program.
  while (isKeyword(ctx.cursor.peek(), 'elseIf')) {
    report(ctx, 'E2014', ctx.cursor.peek().span)
    ctx.cursor.next()
    branches.push(parseIfBranch(ctx))
  }
  finishBlock(ctx, 'endIf')
  const range = nodeRange(ctx, start)
  return elseBody === undefined
    ? { kind: 'IfStmt', branches, ...range }
    : { kind: 'IfStmt', branches, elseBody, ...range }
}

function parseWhile(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'while',
    closer: 'endWhile',
    follows: ['endWhile'],
    openerToken: start,
  })
  const condition = parseExpression(ctx)
  expectKeyword(ctx, 'do')
  const body = parseSection(ctx)
  finishBlock(ctx, 'endWhile')
  return { kind: 'WhileStmt', condition, body, ...nodeRange(ctx, start) }
}

/** `Repetir` closes with `until` or `while`; the node keeps which one in `until`. */
function parseRepeat(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'repeat',
    closer: 'until',
    follows: ['until', 'while'],
    openerToken: start,
  })
  const body = parseSection(ctx, { stop: repeatCloserAhead })
  const frame = ctx.blocks.pop()
  const token = ctx.cursor.peek()
  const key = keywordKeyOf(token)
  let until = true
  if (key === 'until' || key === 'while') {
    until = key === 'until'
    ctx.cursor.next()
  } else if (frame !== undefined) {
    reportUnclosed(ctx, frame, token.span)
    return {
      kind: 'RepeatStmt',
      body,
      condition: parseErrorExpr(ctx),
      until,
      ...nodeRange(ctx, start),
    }
  }
  const condition = parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'RepeatStmt', body, condition, until, ...nodeRange(ctx, start) }
}

/**
 * How far ahead the `Repetir` closer is looked for: enough for any realistic condition. Past
 * it the lookahead answers "closer", which ends the loop body rather than swallowing the rest
 * of the file into it.
 */
const REPEAT_CLOSER_LOOKAHEAD = 64

/**
 * True when the `while` keyword ahead closes a `Repetir` rather than opening a loop. Both
 * spell the same key (`Mientras`, `Mientras Que`), so they are told apart by what follows:
 * a loop header reaches `do`, a closer reaches the terminator or a block boundary first.
 */
function repeatCloserAhead(ctx: ParserContext): boolean {
  if (keywordKeyOf(ctx.cursor.peek()) !== 'while') return false
  for (let offset = 1; offset < REPEAT_CLOSER_LOOKAHEAD; offset++) {
    const token = ctx.cursor.peekAhead(offset)
    if (token.kind === 'eof' || isPunct(token, ';')) return true
    const key = keywordKeyOf(token)
    if (key === 'do') return false
    if (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key)) return true
  }
  return true
}

/** A placeholder condition for a `Repetir` that never got its closer. */
function parseErrorExpr(ctx: ParserContext): Expr {
  return { kind: 'ErrorExpr', ...placeholderRange(ctx, ctx.cursor.at()) }
}

function parseFor(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, { opener: 'for', closer: 'endFor', follows: ['endFor'], openerToken: start })
  const counter = expectIdentifier(ctx)
  if (isOperator(ctx.cursor.peek(), 'assign')) ctx.cursor.next()
  else report(ctx, 'E2002', ctx.cursor.peek().span, { found: ctx.cursor.peek().text })
  const from = parseExpression(ctx)
  expectKeyword(ctx, 'to')
  const to = parseExpression(ctx)
  let step: Expr | undefined
  if (isKeyword(ctx.cursor.peek(), 'step')) {
    ctx.cursor.next()
    step = parseExpression(ctx)
  }
  expectKeyword(ctx, 'do')
  const body = parseSection(ctx)
  finishBlock(ctx, 'endFor')
  const range = nodeRange(ctx, start)
  return step === undefined
    ? { kind: 'ForStmt', counter, from, to, body, ...range }
    : { kind: 'ForStmt', counter, from, to, step, body, ...range }
}

// --- Segun -----------------------------------------------------------------

const CASE_LABEL_KINDS: ReadonlySet<string> = new Set([
  'integer',
  'real',
  'string',
  'identifier',
  'builtin',
])

/**
 * How far ahead a case label is looked for. A label is `Expr ("," Expr)* ":"`, so 32
 * significant tokens cover any realistic one; past that the lookahead gives up and the tokens
 * parse as ordinary statements inside the previous case instead.
 */
const CASE_LABEL_LOOKAHEAD = 32

/** True when the token ahead can begin a case label, i.e. can begin an expression. */
function canStartCaseLabel(token: Token): boolean {
  if (isPunct(token, '(')) return true
  if (token.kind === 'operator') return token.value === 'minus' || token.value === 'plus'
  if (token.kind === 'keyword') {
    const key = keywordKeyOf(token)
    return key === 'true' || key === 'false' || key === 'case'
  }
  return CASE_LABEL_KINDS.has(token.kind)
}

/**
 * True when the tokens ahead read as `Expr ("," Expr)* ":"`. A `Segun` label carries the
 * `case` keyword only when the profile spells it, so a bare label needs this lookahead to
 * be told apart from an ordinary statement. The first token must be one an expression can
 * start with: a leading `)` or `,` is never a label, however the line ends.
 */
export function looksLikeCaseLabel(ctx: ParserContext): boolean {
  if (!canStartCaseLabel(ctx.cursor.peek())) return false
  for (let offset = 0; offset < CASE_LABEL_LOOKAHEAD; offset++) {
    const token = ctx.cursor.peekAhead(offset)
    if (isPunct(token, ':')) return offset > 0
    if (isPunct(token, ',') || isPunct(token, '(') || isPunct(token, ')')) continue
    if (token.kind === 'operator') {
      const key = token.value
      if (key === 'minus' || key === 'plus') continue
      return false
    }
    if (token.kind === 'keyword') {
      const key = keywordKeyOf(token)
      if (key === 'true' || key === 'false') continue
      return false
    }
    if (!CASE_LABEL_KINDS.has(token.kind)) return false
  }
  return false
}

function parseSwitch(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'switch',
    closer: 'endSwitch',
    follows: ['case', 'otherwise', 'endSwitch'],
    openerToken: start,
  })
  const selector = parseExpression(ctx)
  expectKeyword(ctx, 'do')
  const options = { stop: looksLikeCaseLabel }
  const cases: SwitchCase[] = []
  let otherwise: Stmt[] | undefined
  for (;;) {
    // Same guard as `parseBlock`: a round that consumed nothing costs one token, so a label
    // the parsers cannot make sense of can never spin here.
    const before = ctx.cursor.at()
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === 'otherwise') {
      ctx.cursor.next()
      if (isPunct(ctx.cursor.peek(), ':')) ctx.cursor.next()
      const body = parseSection(ctx, options)
      if (otherwise === undefined) otherwise = body
      else {
        // A second one is a mistake (E2013), but its statements are real: they join the first
        // `De Otro Modo` rather than vanishing from the tree.
        report(ctx, 'E2013', token.span)
        otherwise = [...otherwise, ...body]
      }
      if (ctx.cursor.at() === before) ctx.cursor.next()
      continue
    }
    if (key !== 'case' && !looksLikeCaseLabel(ctx)) break
    const caseStart = ctx.cursor.at()
    if (key === 'case') ctx.cursor.next()
    const values = parseCommaSeparated(ctx, parseExpression)
    if (isPunct(ctx.cursor.peek(), ':')) ctx.cursor.next()
    else {
      const found = ctx.cursor.peek()
      report(ctx, 'E2002', found.span, { found: found.text })
    }
    const body = parseSection(ctx, options)
    cases.push({ values, body, ...nodeRange(ctx, caseStart) })
    if (ctx.cursor.at() === before) ctx.cursor.next()
  }
  finishBlock(ctx, 'endSwitch')
  const range = nodeRange(ctx, start)
  return otherwise === undefined
    ? { kind: 'SwitchStmt', selector, cases, ...range }
    : { kind: 'SwitchStmt', selector, cases, otherwise, ...range }
}
