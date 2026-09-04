import { builtinProfiles, profiles, type ResolvedProfile, resolveProfile } from '@stepcode/profiles'
import type { Expr, Node, Program, Stmt, TokenRange, TypeRef } from '../src/ast/index'
import { childrenOf, walk } from '../src/ast/index'
import { check } from '../src/checker/driver'
import { typeOf } from '../src/checker/expressions'
import type { CheckResult } from '../src/checker/result'
import { createState } from '../src/checker/result'
import { createScope, createSymbol, declareSymbol } from '../src/checker/scope'
import type { Diagnostic, DiagnosticCode } from '../src/diagnostics/index'
import { formatDiagnostic } from '../src/diagnostics/index'
import type { Token } from '../src/lexer/index'
import { isTrivia, tokenize } from '../src/lexer/index'
import { createContext } from '../src/parser/context'
import { parseExpression } from '../src/parser/expression'
import { type ParseResult, parse } from '../src/parser/parse'
import { sealRanges } from '../src/parser/ranges'
import { LineMap, type Span } from '../src/source/index'
import { type Type, typeToString } from '../src/types/type'

/**
 * A token stream as `kind:value` strings, the compact form the lexer tests assert against.
 * Whitespace and comments are dropped unless `includeTrivia` is set; newlines always show.
 */
export function tokenSummary(tokens: readonly Token[], includeTrivia = false): string[] {
  const out: string[] = []
  for (const token of tokens) {
    switch (token.kind) {
      case 'whitespace':
        if (includeTrivia) out.push('whitespace')
        break
      case 'comment':
        if (includeTrivia) out.push(`comment:${token.text}`)
        break
      case 'newline':
        out.push('newline')
        break
      case 'eof':
        out.push('eof')
        break
      case 'error':
        out.push(`error:${token.text}`)
        break
      default:
        out.push(`${token.kind}:${String(token.value ?? token.text)}`)
        break
    }
  }
  return out
}

const list = (nodes: readonly Node[]): string => nodes.map(sexpr).join(' ')
const body = (nodes: readonly Stmt[]): string => (nodes.length === 0 ? '' : ` ${list(nodes)}`)
const optional = (node: Node | undefined): string => (node === undefined ? '-' : sexpr(node))

const typeRef = (node: TypeRef): string => {
  if (node.dimensions.length === 0) return `(type ${node.base})`
  const dimensions = node.dimensions.map((dimension) =>
    dimension === null ? '_' : sexpr(dimension),
  )
  return `(type ${node.base} [${dimensions.join(' ')}])`
}

/** A compact S-expression form of any node, the shape every parser test asserts against. */
export function sexpr(node: Node): string {
  switch (node.kind) {
    case 'Program': {
      // A misplaced subprogram prints inside the block that holds it, not twice.
      const parts = node.subprograms.filter((one) => one.misplaced !== true).map(sexpr)
      parts.push(node.main === null ? '-' : sexpr(node.main))
      parts.push(...node.extraMains.map(sexpr))
      return `(program ${parts.join(' ')})`
    }
    case 'MainBlock':
      return `(main ${node.name.name}${body(node.body)})`
    case 'SubprogramDecl':
      return `(${node.form} ${node.name.name} (params ${list(node.params)}) (returns ${
        node.returnName === undefined ? '-' : node.returnName.name
      } ${node.returnType === undefined ? '-' : typeRef(node.returnType)})${body(node.body)})`
    case 'Param':
      return `(param ${node.name.name} ${node.type === undefined ? '-' : typeRef(node.type)} ${
        node.byRef ? 'byref' : 'byvalue'
      })`
    case 'TypeRef':
      return typeRef(node)
    case 'Identifier':
      return node.name
    case 'DefineStmt':
      return `(define (${node.names.map((name) => name.name).join(' ')}) ${typeRef(node.type)})`
    case 'DimensionStmt':
      return `(dimension ${node.items
        .map((item) => `(${item.name.name} ${list(item.sizes)})`)
        .join(' ')})`
    case 'ConstantStmt':
      return `(constant ${node.name.name} ${
        node.type === undefined ? '-' : typeRef(node.type)
      } ${sexpr(node.value)})`
    case 'AssignStmt':
      return `(${node.viaEquals ? 'assign=' : 'assign'} ${sexpr(node.target)} ${sexpr(node.value)})`
    case 'WriteStmt':
      return `(${node.newline ? 'write' : 'write-nonl'} ${list(node.args)})`
    case 'ReadStmt':
      return `(read ${list(node.targets)})`
    case 'IfStmt': {
      const parts: string[] = []
      node.branches.forEach((branch, index) => {
        if (index > 0) parts.push('elseif')
        parts.push(sexpr(branch.condition))
        parts.push(...branch.body.map(sexpr))
      })
      if (node.elseBody !== undefined) parts.push('else', ...node.elseBody.map(sexpr))
      return `(if ${parts.join(' ')})`
    }
    case 'SwitchStmt': {
      const parts = node.cases.map((entry) => `(case (${list(entry.values)})${body(entry.body)})`)
      if (node.otherwise !== undefined) parts.push(`(otherwise${body(node.otherwise)})`)
      return `(switch ${sexpr(node.selector)}${parts.length === 0 ? '' : ` ${parts.join(' ')}`})`
    }
    case 'WhileStmt':
      return `(while ${sexpr(node.condition)}${body(node.body)})`
    case 'RepeatStmt':
      return `(repeat${body(node.body)} ${node.until ? 'until' : 'while'} ${sexpr(node.condition)})`
    case 'ForStmt':
      return `(for ${node.counter.name} ${sexpr(node.from)} ${sexpr(node.to)} ${optional(
        node.step,
      )}${body(node.body)})`
    case 'BreakStmt':
      return '(break)'
    case 'ContinueStmt':
      return '(continue)'
    case 'ReturnStmt':
      return node.value === undefined ? '(return)' : `(return ${sexpr(node.value)})`
    case 'CallStmt':
      return `(callstmt ${sexpr(node.call)})`
    case 'ClearStmt':
      return '(clear)'
    case 'WaitStmt':
      return `(wait ${sexpr(node.millis)})`
    case 'WaitKeyStmt':
      return '(waitkey)'
    case 'ErrorStmt':
      return '(error-stmt)'
    case 'Literal':
      return typeof node.value === 'string'
        ? `(literal "${node.value}")`
        : `(literal ${String(node.value)})`
    case 'Index':
      return `(index ${sexpr(node.target)} ${list(node.indices)})`
    case 'Call':
      return `(call ${node.callee.name}${node.args.length === 0 ? '' : ` ${list(node.args)}`})`
    case 'BuiltinCall':
      return `(builtin ${node.key}${node.args.length === 0 ? '' : ` ${list(node.args)}`})`
    case 'Unary':
      return `(unary ${node.op} ${sexpr(node.operand)})`
    case 'Binary':
      return `(binary ${node.op} ${sexpr(node.left)} ${sexpr(node.right)})`
    case 'ErrorExpr':
      return '(error-expr)'
  }
}

/** Parses one expression in isolation; the statement layer is not involved. */
export function parseExprResult(
  source: string,
  profile: ResolvedProfile = profiles.es,
): { expr: Expr; diagnostics: readonly Diagnostic[] } {
  const { tokens, diagnostics } = tokenize(source, profile)
  const ctx = createContext(source, tokens, profile, [...diagnostics])
  const expr = parseExpression(ctx)
  sealRanges(expr, tokens)
  return { expr, diagnostics: ctx.diagnostics }
}

export function parseExpr(source: string, profile: ResolvedProfile = profiles.es): Expr {
  return parseExprResult(source, profile).expr
}

export function parseSource(source: string, profile: ResolvedProfile = profiles.es): ParseResult {
  return parse(source, { profile })
}

/** The parsed program as an S-expression. */
export function ast(source: string, profile: ResolvedProfile = profiles.es): string {
  return sexpr(parseSource(source, profile).program)
}

export function diagnosticCodes(
  source: string,
  profile: ResolvedProfile = profiles.es,
): DiagnosticCode[] {
  return parseSource(source, profile).diagnostics.map((diagnostic) => diagnostic.code)
}

export interface DiagnosticReport {
  code: string
  line: number
  column: number
  es: string
  en: string
}

/** Every diagnostic of one parse, with its 1-based position and both rendered messages. */
export function diagnosticReport(
  source: string,
  profile: ResolvedProfile = profiles.es,
): DiagnosticReport[] {
  const map = new LineMap(source)
  return parseSource(source, profile).diagnostics.map((diagnostic) => {
    const position = map.positionAt(diagnostic.span.start)
    return {
      code: diagnostic.code,
      line: position.line,
      column: position.column,
      es: formatDiagnostic(diagnostic, 'es', profile),
      en: formatDiagnostic(diagnostic, 'en', profiles.en),
    }
  })
}

interface Container {
  readonly label: string
  readonly span: Span
  readonly tokens: TokenRange
  readonly children: readonly Node[]
}

/**
 * The plain records that group a node's children: `IfBranch`, `SwitchCase`, `DimensionItem`.
 * They are not nodes (no `kind`), but they carry a range and must contain their own children.
 */
function containersOf(node: Node): Container[] {
  switch (node.kind) {
    case 'IfStmt':
      return node.branches.map((branch, index) => ({
        label: `branch ${index}`,
        span: branch.span,
        tokens: branch.tokens,
        children: [branch.condition, ...branch.body],
      }))
    case 'SwitchStmt':
      return node.cases.map((entry, index) => ({
        label: `case ${index}`,
        span: entry.span,
        tokens: entry.tokens,
        children: [...entry.values, ...entry.body],
      }))
    case 'DimensionStmt':
      return node.items.map((item, index) => ({
        label: `item ${index}`,
        span: item.span,
        tokens: item.tokens,
        children: [item.name, ...item.sizes],
      }))
    default:
      return []
  }
}

/** The empty-range convention: `[first, first - 1]` covers no token at all. */
const isEmptyRange = (range: TokenRange): boolean => range[0] === range[1] + 1

const describeNode = (node: Node): string => `${node.kind}[${node.tokens.join()}]`

/**
 * The tree contract of spec §2 and §6, over one parse:
 *
 * a. every child's token range lies inside its parent's;
 * b. every significant token (trivia, newlines and `eof` aside) has exactly one innermost
 *    owner — siblings never overlap, and the root covers them all. When the parse reported no
 *    error, the stronger form holds too: every significant token lies inside some node other
 *    than `Program`, so nothing that parsed cleanly was dropped on the way into the tree;
 * c. `childrenOf` is sorted by `tokens[0]`;
 * d. a node's span runs from its first token's start to its last token's end — or, for the
 *    empty range a placeholder carries, is zero-width where that token would have begun.
 */
export function assertTreeInvariants(result: ParseResult): void {
  const { program, tokens } = result
  const failures: string[] = []
  const check = (ok: boolean, message: string): void => {
    if (!ok) failures.push(message)
  }
  const checkRange = (
    label: string,
    span: Span,
    range: TokenRange,
    parentLabel: string,
    parent: TokenRange,
  ): void => {
    const [start, end] = range
    if (isEmptyRange(range)) {
      // A placeholder stands where syntax is missing: it owns no token, and sits where the
      // token it stands for would have begun.
      const at = tokens[start]
      check(span.start === span.end, `${label} is empty but its span is not zero-width`)
      check(
        at !== undefined && span.start === at.span.start,
        `${label} is not zero-width at the token that follows it`,
      )
      check(
        start >= parent[0] && start <= parent[1] + 1,
        `${label} escapes ${parentLabel}[${parent.join()}]`,
      )
      return
    }
    check(start <= end, `${label} has an inverted token range`)
    check(
      start >= parent[0] && end <= parent[1],
      `${label} escapes ${parentLabel}[${parent.join()}]`,
    )
    const first = tokens[start]
    const last = tokens[end]
    check(
      first !== undefined && span.start === first.span.start,
      `${label} does not start at its first token`,
    )
    check(
      last !== undefined && span.end === last.span.end,
      `${label} does not end at its last token`,
    )
  }

  const owned: boolean[] = tokens.map(() => false)
  walk(program, {
    enter: (node) => {
      if (node.kind !== 'Program' && !isEmptyRange(node.tokens)) {
        for (let index = node.tokens[0]; index <= node.tokens[1]; index++) owned[index] = true
      }
      const children = childrenOf(node)
      let previousStart = -1
      let previousEnd = -1
      for (const child of children) {
        checkRange(describeNode(child), child.span, child.tokens, describeNode(node), node.tokens)
        check(
          child.tokens[0] >= previousStart,
          `children of ${describeNode(node)} are not sorted by tokens[0]`,
        )
        previousStart = child.tokens[0]
        // An empty range owns nothing, so it can neither overlap a sibling nor push the
        // boundary the next sibling has to clear.
        if (isEmptyRange(child.tokens)) continue
        check(
          child.tokens[0] > previousEnd,
          `children of ${describeNode(node)} overlap at token ${child.tokens[0]}`,
        )
        previousEnd = child.tokens[1]
      }
      for (const container of containersOf(node)) {
        const label = `${describeNode(node)} ${container.label}`
        checkRange(label, container.span, container.tokens, describeNode(node), node.tokens)
        for (const child of container.children) {
          checkRange(describeNode(child), child.span, child.tokens, label, container.tokens)
        }
      }
      return true
    },
  })

  const clean = result.diagnostics.every((diagnostic) => diagnostic.severity !== 'error')
  tokens.forEach((token, index) => {
    if (isTrivia(token) || token.kind === 'newline' || token.kind === 'eof') return
    if (token.text.length === 0) return
    check(
      index >= program.tokens[0] && index <= program.tokens[1],
      `token ${index} (${token.kind}) lies outside the Program`,
    )
    check(!clean || owned[index] === true, `token ${index} (${token.kind}) is in no node`)
  })
  if (failures.length > 0) {
    throw new Error(`tree invariants broken:\n${[...new Set(failures)].join('\n')}`)
  }
}

/** `es` is the default profile; `pseint` is the lenient one; `es0` is `es` with 0-based arrays. */
export type ProfileName = 'es' | 'en' | 'pseint' | 'es0'

/**
 * `es` with `indexBase: 0`, for the corpus programs that carried the v1 `$ arrays@stepcode`
 * directive. Resolved once: `resolveProfile` builds sealed lookup tables and is not free.
 */
const es0 = resolveProfile(
  { id: 'es-index-0', extends: 'es', options: { indexBase: 0 } },
  builtinProfiles,
)

export function profileNamed(name: ProfileName): ResolvedProfile {
  return name === 'es0' ? es0 : profiles[name]
}

/** `'23-28'` — the span of the one and only occurrence of `snippet` in `source`. */
export function spanOf(source: string, snippet: string): string {
  const start = source.indexOf(snippet)
  if (start < 0) throw new Error(`"${snippet}" is not in the source`)
  if (source.indexOf(snippet, start + 1) >= 0) {
    throw new Error(`"${snippet}" appears more than once; give a longer snippet`)
  }
  return `${start}-${start + snippet.length}`
}

export interface ExprCaseOptions {
  /** The variables the expression may use, with their types. */
  readonly vars?: Readonly<Record<string, Type>>
  /** Variables declared *below* the expression, for the used-before-declared rule (§3.2). */
  readonly declaredAfter?: Readonly<Record<string, Type>>
  readonly profileName?: ProfileName
}

export interface ExprCaseReport {
  /** The expression's type, rendered with `typeToString`. */
  readonly type: string
  readonly codes: DiagnosticCode[]
  readonly diagnostics: string[]
}

/**
 * One expression, checked in a body scope holding exactly the variables the case declares.
 * The statement layer is not involved — the parser's own `parseExpr` harness, one level up.
 */
export function checkExprIn(source: string, options: ExprCaseOptions = {}): ExprCaseReport {
  const profile = profileNamed(options.profileName ?? 'es')
  const parsed = parseExprResult(source, profile)
  const parseErrors = parsed.diagnostics.filter((one) => one.severity === 'error')
  if (parseErrors.length > 0) {
    throw new Error(`the expression does not parse: ${parseErrors.map((o) => o.code).join(', ')}`)
  }
  const program = parse('Proceso p\nFinProceso', { profile }).program
  const main = program.main
  if (main === null) throw new Error('the harness program has no main block')
  const state = createState(program, profile)
  const scope = createScope('body', main, state.programScope)
  state.scopes.push(scope)
  state.frame = { scope, subprogram: null, loopDepth: 0 }
  // Declared at offset 0: before the expression, whatever the expression's own offsets are.
  for (const [name, type] of Object.entries(options.vars ?? {})) {
    declareSymbol(scope, createSymbol({ name, kind: 'variable', type, declaredAt: main, scope }))
  }
  // Declared far below: `declaredAt` sits past every offset the expression can occupy, which
  // is exactly the source-order relation E3003 is about.
  const late = parseExpr(`${' '.repeat(1000)}z`)
  for (const [name, type] of Object.entries(options.declaredAfter ?? {})) {
    declareSymbol(scope, createSymbol({ name, kind: 'variable', type, declaredAt: late, scope }))
  }
  const type = typeOf(state, parsed.expr)
  return {
    type: typeToString(type, profile),
    codes: state.diagnostics.map((one) => one.code),
    diagnostics: state.diagnostics.map((one) => `${one.code}@${one.span.start}-${one.span.end}`),
  }
}

export interface CheckReport {
  /** `['E3010@23-28']`: the code, then the diagnostic's span as `start-end`. */
  readonly diagnostics: string[]
  /** The codes alone, in the same order. */
  readonly codes: DiagnosticCode[]
  /** The source text each diagnostic covers, in the same order. */
  readonly texts: string[]
  readonly result: CheckResult
  readonly program: Program
  readonly profile: ResolvedProfile
}

export interface CheckSourceOptions {
  /**
   * Check a source the parser complained about. Only the few rules whose subject *is* a
   * parser error need it — a second `Proceso` block, a subprogram written inside one. The
   * report still holds the checker's diagnostics alone: the parser's never enter it.
   */
  readonly allowParseErrors?: boolean
}

/**
 * Parse, then check. The parse must be clean unless the case opts out: a checker test
 * asserting a checker diagnostic must not be reading a broken tree, so a parser error fails
 * loudly here instead of quietly changing what the checker saw. `compile` is the API that
 * tolerates both (Task 10).
 */
export function checkSource(
  source: string,
  profileName: ProfileName = 'es',
  options: CheckSourceOptions = {},
): CheckReport {
  const profile = profileNamed(profileName)
  const parsed = parse(source, { profile })
  const parseErrors = parsed.diagnostics.filter((one) => one.severity === 'error')
  if (parseErrors.length > 0 && options.allowParseErrors !== true) {
    throw new Error(
      `the source does not parse: ${parseErrors.map((one) => one.code).join(', ')}\n${source}`,
    )
  }
  const result = check(parsed.program, { profile })
  return {
    diagnostics: result.diagnostics.map((one) => `${one.code}@${one.span.start}-${one.span.end}`),
    codes: result.diagnostics.map((one) => one.code),
    texts: result.diagnostics.map((one) => source.slice(one.span.start, one.span.end)),
    result,
    program: parsed.program,
    profile,
  }
}

/** The codes one source produces, in order. The shape most rule tests assert against. */
export function checkCodes(
  source: string,
  profileName: ProfileName = 'es',
  options: CheckSourceOptions = {},
): DiagnosticCode[] {
  return checkSource(source, profileName, options).codes
}

/**
 * The checker's type for the expression whose source text is exactly `snippet`, rendered with
 * `typeToString`. The snippet must name one typed node and no other.
 */
export function typeOfExpr(
  source: string,
  snippet: string,
  profileName: ProfileName = 'es',
): string {
  const report = checkSource(source, profileName)
  const found: Type[] = []
  walk(report.program, {
    enter: (node) => {
      const type = report.result.types.get(node as Expr)
      if (type !== undefined && source.slice(node.span.start, node.span.end) === snippet) {
        found.push(type)
      }
      return true
    },
  })
  if (found.length !== 1) {
    throw new Error(`"${snippet}" matches ${found.length} typed expressions, expected exactly 1`)
  }
  return typeToString(found[0] as Type, report.profile)
}
