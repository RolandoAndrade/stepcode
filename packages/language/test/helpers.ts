import { profiles, type ResolvedProfile } from '@stepcode/profiles'
import type { Expr, Node, Stmt, TypeRef } from '../src/ast/index'
import type { Diagnostic, DiagnosticCode } from '../src/diagnostics/index'
import type { Token } from '../src/lexer/index'
import { tokenize } from '../src/lexer/index'
import { createContext } from '../src/parser/context'
import { parseExpression } from '../src/parser/expression'
import { type ParseResult, parse } from '../src/parser/parse'

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
