import type { Node, TokenRange } from '../ast/index'
import { childrenOf } from '../ast/index'
import type { Token } from '../lexer/index'
import type { Span } from '../source/index'

/** The plain records that group children: `IfBranch`, `SwitchCase`, `DimensionItem`. */
interface Record_ {
  readonly span: Span
  readonly tokens: TokenRange
}

interface Group {
  readonly record: Record_
  readonly children: readonly Node[]
}

function groupsOf(node: Node): Group[] {
  switch (node.kind) {
    case 'IfStmt':
      return node.branches.map((branch) => ({
        record: branch,
        children: [branch.condition, ...branch.body],
      }))
    case 'SwitchStmt':
      return node.cases.map((entry) => ({
        record: entry,
        children: [...entry.values, ...entry.body],
      }))
    case 'DimensionStmt':
      return node.items.map((item) => ({ record: item, children: [item.name, ...item.sizes] }))
    default:
      return []
  }
}

/** The empty range of a placeholder: `[first, first - 1]`, owning no token. */
const isEmpty = (range: TokenRange): boolean => range[0] === range[1] + 1

/** `span` and `tokens` are readonly to consumers; the parser owns them until `parse` returns. */
function setRange(target: Record_, start: number, end: number, tokens: readonly Token[]): void {
  const first = tokens[start]
  const last = tokens[end]
  if (first === undefined || last === undefined) return
  const writable = target as { span: Span; tokens: TokenRange }
  writable.tokens = [start, end]
  writable.span = { start: first.span.start, end: last.span.end }
}

/**
 * Widens every node so it covers its children, and every node's `span` so it runs from its
 * first token's start to its last token's end.
 *
 * A recovery placeholder sits just past the last token consumed, which can be before the node
 * that ends up holding it (`Si Hasta`: the branch begins at `Hasta`, its placeholder condition
 * right after the `Si`). Rather than teach each of the twenty construction sites about that,
 * the finished tree is sealed once here, so the tree contract — a child's token range always
 * lies inside its parent's — holds by construction of `parse`, not by vigilance.
 */
export function sealRanges(root: Node, tokens: readonly Token[]): void {
  // One `childrenOf` call per node: the traversal that collects the nodes keeps what it read.
  const nodes: Node[] = []
  const childrenByNode = new Map<Node, Node[]>()
  const stack: Node[] = [root]
  while (stack.length > 0) {
    const node = stack.pop() as Node
    nodes.push(node)
    const children = childrenOf(node)
    childrenByNode.set(node, children)
    stack.push(...children)
  }
  // Reverse order visits every child before its parent, so widening propagates outwards.
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index] as Node
    // An empty range is a placeholder: it stands for nothing and is never given a token.
    if (isEmpty(node.tokens)) continue
    let [start, end] = node.tokens
    for (const group of groupsOf(node)) {
      if (isEmpty(group.record.tokens)) continue
      let [recordStart, recordEnd] = group.record.tokens
      for (const child of group.children) {
        recordStart = Math.min(recordStart, child.tokens[0])
        recordEnd = Math.max(recordEnd, child.tokens[1])
      }
      setRange(group.record, recordStart, recordEnd, tokens)
      start = Math.min(start, recordStart)
      end = Math.max(end, recordEnd)
    }
    for (const child of childrenByNode.get(node) ?? []) {
      start = Math.min(start, child.tokens[0])
      end = Math.max(end, child.tokens[1])
    }
    setRange(node, start, end, tokens)
  }
}
