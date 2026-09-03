import { profiles, type ResolvedProfile } from '@stepcode/profiles'
import type { Expr, Node, Stmt, TokenRange, TypeRef } from '../src/ast/index'
import { childrenOf, walk } from '../src/ast/index'
import type { Diagnostic, DiagnosticCode } from '../src/diagnostics/index'
import { formatDiagnostic } from '../src/diagnostics/index'
import type { Token } from '../src/lexer/index'
import { isTrivia, tokenize } from '../src/lexer/index'
import { createContext } from '../src/parser/context'
import { parseExpression } from '../src/parser/expression'
import { type ParseResult, parse } from '../src/parser/parse'
import { LineMap, type Span } from '../src/source/index'

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
      const parts = node.subprograms.map(sexpr)
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

/**
 * A placeholder stands where syntax is missing. It points at the last token the parser
 * consumed so it stays inside its parent, which means it may share that token with a sibling;
 * owning nothing, it is left out of the one-owner check.
 */
function isPlaceholder(node: Node): boolean {
  return node.kind === 'ErrorExpr' || (node.kind === 'Identifier' && node.missing === true)
}

const describeNode = (node: Node): string => `${node.kind}[${node.tokens.join()}]`

/**
 * The tree contract of spec §2 and §6, over one parse:
 *
 * a. every child's token range lies inside its parent's;
 * b. every significant token (trivia, newlines and `eof` aside) has exactly one innermost
 *    owner — siblings never overlap, and the root covers them all;
 * c. `childrenOf` is sorted by `tokens[0]`;
 * d. every node's span runs from its first token's start to its last token's end.
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
    check(start <= end, `${label} has an inverted token range`)
    check(
      start >= parent[0] && end <= parent[1],
      `${label} escapes ${parentLabel}[${parent.join()}]`,
    )
    const first = tokens[start]
    const last = tokens[end]
    check(
      first !== undefined && last !== undefined && span.start === first.span.start,
      `${label} does not start at its first token`,
    )
    check(
      last !== undefined && span.end === last.span.end,
      `${label} does not end at its last token`,
    )
  }

  walk(program, {
    enter: (node) => {
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
        if (isPlaceholder(child)) continue
        // A subprogram written inside a block is hoisted to `Program.subprograms` (E2015), so
        // its tokens sit inside the main block's range: the one place a token has two owners.
        const hoisted = node.kind === 'Program' && child.tokens[1] <= previousEnd
        check(
          hoisted || child.tokens[0] > previousEnd,
          `children of ${describeNode(node)} overlap at token ${child.tokens[0]}`,
        )
        previousEnd = Math.max(previousEnd, child.tokens[1])
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

  const significant = tokens.filter(
    (token) =>
      !isTrivia(token) && token.kind !== 'newline' && token.kind !== 'eof' && token.text.length > 0,
  )
  for (const token of significant) {
    const index = tokens.indexOf(token)
    check(
      index >= program.tokens[0] && index <= program.tokens[1],
      `token ${index} (${token.kind}) lies outside the Program`,
    )
  }
  if (failures.length > 0) {
    throw new Error(`tree invariants broken:\n${[...new Set(failures)].join('\n')}`)
  }
}
