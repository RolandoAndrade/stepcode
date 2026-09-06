import { NodeProp, type NodeSet, Tree } from '@lezer/common'
import type { KeywordKey, OperatorKey } from '@stepcode/profiles'
import type {
  BuiltinCall,
  Call,
  CompileResult,
  DimensionItem,
  Identifier,
  Literal,
  Node,
  SwitchCase,
  Token,
} from 'stepcode'
import { childrenOf } from 'stepcode'
import { nodeSet as baseNodeSet, keywordNodeName, nodeId } from './nodes'

/** What rides on the top node of every tree (spec §4.3). */
export interface TreeData {
  readonly result: CompileResult
  /** offset of an identifier leaf → its AST node, for hover, go to definition, signature help */
  readonly identifiers: ReadonlyMap<number, Identifier>
  /** offset of a Call or BuiltinCall node → its AST node */
  readonly calls: ReadonlyMap<number, Call | BuiltinCall>
}

export const compileProp = new NodeProp<TreeData>({ perNode: true })

/** An AST node, or one of the two plain records the tree keeps as nodes. */
type Emit = Node | SwitchCase | DimensionItem

const isNode = (one: Emit): one is Node => 'kind' in one

const recordName = (one: SwitchCase | DimensionItem): 'SwitchCase' | 'DimensionItem' =>
  'values' in one ? 'SwitchCase' : 'DimensionItem'

const bySource = (list: Emit[]): Emit[] => list.sort((a, b) => a.tokens[0] - b.tokens[0])

/** `childrenOf`, except that switch cases and dimension items stay whole (spec §4.3 rule 1). */
function childrenFor(one: Emit): Emit[] {
  if (!isNode(one)) {
    return 'values' in one ? [...one.values, ...one.body] : [one.name, ...one.sizes]
  }
  switch (one.kind) {
    case 'SwitchStmt':
      return bySource([one.selector, ...one.cases, ...(one.otherwise ?? [])])
    case 'DimensionStmt':
      return [...one.items]
    default:
      return childrenOf(one)
  }
}

/** Spec §4.3 rule 2: the leaf name of an identifier, from the field its parent holds it in. */
function identifierRole(id: Identifier, parent: Emit | null): string {
  if (parent === null) return 'Identifier'
  if (!isNode(parent)) {
    return !('values' in parent) && parent.name === id ? 'VariableDefinition' : 'Identifier'
  }
  switch (parent.kind) {
    case 'MainBlock':
      return parent.name === id ? 'SubprogramName' : 'Identifier'
    case 'SubprogramDecl':
      if (parent.name === id) return 'SubprogramName'
      return parent.returnName === id ? 'VariableDefinition' : 'Identifier'
    case 'Param':
    case 'ConstantStmt':
      return parent.name === id ? 'VariableDefinition' : 'Identifier'
    case 'DefineStmt':
      return parent.names.includes(id) ? 'VariableDefinition' : 'Identifier'
    case 'Call':
      return parent.callee === id ? 'CallName' : 'Identifier'
    default:
      return 'Identifier'
  }
}

function literalLeaf(literal: Literal): string {
  switch (literal.type) {
    case 'string':
      return 'String'
    case 'boolean':
      return 'Boolean'
    default:
      return 'Number'
  }
}

const COMPARE: ReadonlySet<OperatorKey> = new Set(['equal', 'notEqual', 'lt', 'le', 'gt', 'ge'])
const PUNCT: ReadonlyMap<string, string> = new Map([
  ['(', 'OpenParen'],
  [')', 'CloseParen'],
  ['[', 'OpenBracket'],
  [']', 'CloseBracket'],
])

/** The leaf type of a token, or `null` for the trivia the tree drops (spec §4.2). */
function tokenLeaf(token: Token): string | null {
  switch (token.kind) {
    case 'keyword':
      return keywordNodeName(token.value as KeywordKey)
    case 'type':
      return 'TypeName'
    case 'builtin':
      return 'BuiltinName'
    case 'operator': {
      const key = token.value as OperatorKey
      if (key === 'assign') return 'AssignOp'
      return COMPARE.has(key) ? 'CompareOp' : 'ArithOp'
    }
    case 'identifier':
      return 'Identifier'
    case 'integer':
    case 'real':
      return 'Number'
    case 'string':
      return 'String'
    case 'punct':
      return PUNCT.get(token.text) ?? 'Punct'
    case 'comment':
      return 'Comment'
    case 'error':
      return 'Error'
    default:
      return null
  }
}

/**
 * Emits the postfix buffer `Tree.build` wants: every child before its parent, four numbers
 * per node. Recursive over the AST; a program deep enough to matter here is not one an
 * editor shows.
 */
class Builder {
  readonly buffer: number[] = []
  readonly identifiers = new Map<number, Identifier>()
  readonly calls = new Map<number, Call | BuiltinCall>()

  constructor(private readonly tokens: readonly Token[]) {}

  private leaf(name: string, start: number, end: number): void {
    this.buffer.push(nodeId(name), start, end, 4)
  }

  /** Leaves for the tokens `first..last` (inclusive) that no child claimed. */
  private tokensBetween(first: number, last: number): void {
    for (let index = first; index <= last; index++) {
      const token = this.tokens[index]
      if (token === undefined) continue
      const name = tokenLeaf(token)
      if (name !== null) this.leaf(name, token.span.start, token.span.end)
    }
  }

  /**
   * The children and loose tokens of `one`, without `one` itself. `range` defaults to the
   * node's own token range; the top level passes the whole stream, so a comment written
   * before the program or after it still becomes a leaf under `Program`.
   */
  emitChildren(one: Emit, range: readonly [number, number] = one.tokens): void {
    const [first, last] = range
    let next = first
    for (const child of childrenFor(one)) {
      const [childFirst, childLast] = child.tokens
      this.tokensBetween(next, childFirst - 1)
      this.emit(child, one)
      next = Math.max(next, childLast + 1)
    }
    this.tokensBetween(next, last)
  }

  emit(one: Emit, parent: Emit | null): void {
    if (isNode(one)) {
      if (one.kind === 'Identifier') {
        if (one.missing === true) return
        this.identifiers.set(one.span.start, one)
        this.leaf(identifierRole(one, parent), one.span.start, one.span.end)
        return
      }
      if (one.kind === 'Literal') {
        this.leaf(literalLeaf(one), one.span.start, one.span.end)
        return
      }
      if (one.kind === 'Call' || one.kind === 'BuiltinCall') this.calls.set(one.span.start, one)
    }
    const start = this.buffer.length
    this.emitChildren(one)
    const name = isNode(one) ? one.kind : recordName(one)
    this.buffer.push(nodeId(name), one.span.start, one.span.end, this.buffer.length - start + 4)
  }
}

/**
 * The Lezer tree for one compile result. `set` is the node set to build with — the base set,
 * or a language's extension of it; ids are the same either way.
 */
export function buildTree(result: CompileResult, set: NodeSet = baseNodeSet): Tree {
  const builder = new Builder(result.tokens)
  builder.emitChildren(result.ast, [0, result.tokens.length - 1])
  const built = Tree.build({
    buffer: builder.buffer,
    nodeSet: set,
    topID: nodeId('Program'),
    length: result.source.length,
  })
  const data: TreeData = {
    result,
    identifiers: builder.identifiers,
    calls: builder.calls,
  }
  return new Tree(built.type, built.children, built.positions, built.length, [[compileProp, data]])
}
