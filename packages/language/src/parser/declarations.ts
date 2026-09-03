import type { TypeKey } from '@stepcode/profiles'
import type {
  Expr,
  Identifier,
  MainBlock,
  Param,
  Program,
  Stmt,
  SubprogramDecl,
  TypeRef,
} from '../ast/index'
import { finishBlock, openBlock, parseSection } from './blocks'
import { nodeRange, type ParserContext, placeholderRange, report } from './context'
import { parseExpression } from './expression'
import { consumeTerminator, skipToRecoveryPoint } from './terminator'
import { isKeyword, isOperator, isPunct, keywordKeyOf } from './tokens'

/** Consumes an identifier, or reports E2002 and returns an empty synthetic one. */
export function expectIdentifier(ctx: ParserContext): Identifier {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (token.kind !== 'identifier') {
    report(ctx, 'E2002', token.span, { found: token.text })
    return {
      kind: 'Identifier',
      name: '',
      text: '',
      missing: true,
      ...placeholderRange(ctx, start),
    }
  }
  ctx.cursor.next()
  return {
    kind: 'Identifier',
    name: typeof token.value === 'string' ? token.value : token.text,
    text: token.text,
    ...nodeRange(ctx, start),
  }
}

/** `TypeName [ "[" (Expr | ε) ("," (Expr | ε))* "]" ]`; sizes are all present or all absent. */
export function parseTypeRef(ctx: ParserContext): TypeRef | null {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (token.kind !== 'type') {
    report(ctx, 'E2002', token.span, { found: token.text })
    return null
  }
  ctx.cursor.next()
  const base = token.value as TypeKey
  const dimensions: (Expr | null)[] = []
  if (isPunct(ctx.cursor.peek(), '[')) {
    const open = ctx.cursor.next()
    for (;;) {
      const head = ctx.cursor.peek()
      if (isPunct(head, ']') || isPunct(head, ',')) dimensions.push(null)
      else dimensions.push(parseExpression(ctx))
      if (!isPunct(ctx.cursor.peek(), ',')) break
      ctx.cursor.next()
    }
    if (isPunct(ctx.cursor.peek(), ']')) ctx.cursor.next()
    else report(ctx, 'E2005', open.span, { bracket: ']' })
    const sized = dimensions.filter((dimension) => dimension !== null)
    if (sized.length !== 0 && sized.length !== dimensions.length) {
      const first = sized[0] as Expr
      report(ctx, 'E2002', first.span, {
        found: ctx.source.slice(first.span.start, first.span.end),
      })
    }
  }
  return { kind: 'TypeRef', base, dimensions, ...nodeRange(ctx, start) }
}

function parseParam(ctx: ParserContext): Param {
  const start = ctx.cursor.at()
  const name = expectIdentifier(ctx)
  let type: TypeRef | undefined
  let byRef: boolean | undefined
  for (;;) {
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === 'as') {
      ctx.cursor.next()
      const parsed = parseTypeRef(ctx)
      if (type !== undefined) report(ctx, 'E2022', token.span, { modifier: 'as' })
      else if (parsed !== null) type = parsed
      continue
    }
    if (key === 'byRef' || key === 'byValue') {
      ctx.cursor.next()
      if (byRef !== undefined) report(ctx, 'E2022', token.span, { modifier: key })
      else byRef = key === 'byRef'
      continue
    }
    break
  }
  if (type === undefined && ctx.profile.options.typedParameters) {
    report(ctx, 'E2021', name.span, { name: name.text })
  }
  const range = nodeRange(ctx, start)
  return type === undefined
    ? { kind: 'Param', name, byRef: byRef ?? false, ...range }
    : { kind: 'Param', name, type, byRef: byRef ?? false, ...range }
}

export function parseParamList(ctx: ParserContext): Param[] {
  const params: Param[] = []
  if (!isPunct(ctx.cursor.peek(), '(')) return params
  const open = ctx.cursor.next()
  if (isPunct(ctx.cursor.peek(), ')')) {
    ctx.cursor.next()
    return params
  }
  for (;;) {
    params.push(parseParam(ctx))
    if (!isPunct(ctx.cursor.peek(), ',')) break
    ctx.cursor.next()
  }
  if (isPunct(ctx.cursor.peek(), ')')) ctx.cursor.next()
  else report(ctx, 'E2005', open.span, { bracket: ')' })
  return params
}

export function parseMainBlock(ctx: ParserContext): MainBlock {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const name = expectIdentifier(ctx)
  openBlock(ctx, {
    opener: 'program',
    closer: 'endProgram',
    follows: ['endProgram'],
    openerToken: start,
  })
  const body = parseSection(ctx)
  finishBlock(ctx, 'endProgram')
  return { kind: 'MainBlock', name, body, ...nodeRange(ctx, start) }
}

export function parseProcedure(ctx: ParserContext): SubprogramDecl {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const name = expectIdentifier(ctx)
  const params = parseParamList(ctx)
  openBlock(ctx, {
    opener: 'procedure',
    closer: 'endProcedure',
    follows: ['endProcedure'],
    openerToken: start,
  })
  const body = parseSection(ctx)
  finishBlock(ctx, 'endProcedure')
  return { kind: 'SubprogramDecl', form: 'procedure', name, params, body, ...nodeRange(ctx, start) }
}

/**
 * All four `Funcion` forms: `f()`, `f(): T`, `r <- f()`, `r Como T <- f(…)`. The return name
 * is only known once the arrow is seen, so the first identifier is read speculatively.
 */
export function parseFunction(ctx: ParserContext): SubprogramDecl {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  let name = expectIdentifier(ctx)
  let returnName: Identifier | undefined
  let returnType: TypeRef | undefined
  if (isKeyword(ctx.cursor.peek(), 'as')) {
    ctx.cursor.next()
    returnType = parseTypeRef(ctx) ?? undefined
  }
  if (isOperator(ctx.cursor.peek(), 'assign')) {
    ctx.cursor.next()
    returnName = name
    name = expectIdentifier(ctx)
  }
  const params = parseParamList(ctx)
  if (isPunct(ctx.cursor.peek(), ':')) {
    ctx.cursor.next()
    returnType = parseTypeRef(ctx) ?? returnType
  }
  openBlock(ctx, {
    opener: 'function',
    closer: 'endFunction',
    follows: ['endFunction'],
    openerToken: start,
  })
  const body = parseSection(ctx)
  finishBlock(ctx, 'endFunction')
  // `exactOptionalPropertyTypes` forbids writing an explicit `undefined`, so build the extras.
  const extras: { returnName?: Identifier; returnType?: TypeRef } = {}
  if (returnName !== undefined) extras.returnName = returnName
  if (returnType !== undefined) extras.returnType = returnType
  return {
    kind: 'SubprogramDecl',
    form: 'function',
    name,
    params,
    ...extras,
    body,
    ...nodeRange(ctx, start),
  }
}

/** `define Ident ("," Ident)* as Type ;` */
export function parseDefine(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const names: Identifier[] = [expectIdentifier(ctx)]
  while (isPunct(ctx.cursor.peek(), ',')) {
    ctx.cursor.next()
    names.push(expectIdentifier(ctx))
  }
  if (isKeyword(ctx.cursor.peek(), 'as')) ctx.cursor.next()
  else report(ctx, 'E2004', ctx.cursor.peek().span, { expected: 'as' })
  const type = parseTypeRef(ctx)
  if (type === null) {
    skipToRecoveryPoint(ctx)
    return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
  }
  if (consumeTerminator(ctx) === 'garbled') return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
  return { kind: 'DefineStmt', names, type, ...nodeRange(ctx, start) }
}

function skipToTopLevel(ctx: ParserContext): void {
  ctx.cursor.next()
  while (!ctx.cursor.atEnd()) {
    const key = keywordKeyOf(ctx.cursor.peek())
    if (key === 'program' || key === 'procedure' || key === 'function') return
    ctx.cursor.next()
  }
}

/** The top level admits subprograms and exactly one main block, in any order. */
export function parseProgram(ctx: ParserContext): Program {
  const start = ctx.cursor.at()
  const subprograms: SubprogramDecl[] = []
  let main: MainBlock | null = null
  while (!ctx.cursor.atEnd()) {
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === 'program') {
      const block = parseMainBlock(ctx)
      if (main === null) main = block
      else report(ctx, 'E2011', token.span)
      continue
    }
    if (key === 'procedure') {
      subprograms.push(parseProcedure(ctx))
      continue
    }
    if (key === 'function') {
      subprograms.push(parseFunction(ctx))
      continue
    }
    report(ctx, 'E2012', token.span, { found: token.text })
    skipToTopLevel(ctx)
  }
  if (main === null) report(ctx, 'E2010', ctx.cursor.peek().span)
  return { kind: 'Program', subprograms, main, ...nodeRange(ctx, start) }
}
