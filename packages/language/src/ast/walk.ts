import type { Expr, Node } from './nodes'

export interface Visitor {
  /** Return `false` to skip this node's children (and its `exit` call). */
  enter?(node: Node, parent: Node | null): boolean | undefined
  exit?(node: Node, parent: Node | null): void
}

/** Every child node, in source order. Plain records (branches, cases, items) are flattened. */
export function childrenOf(node: Node): Node[] {
  switch (node.kind) {
    case 'Program':
      return node.main === null ? [...node.subprograms] : [...node.subprograms, node.main]
    case 'MainBlock':
      return [node.name, ...node.body]
    case 'SubprogramDecl': {
      const children: Node[] = [node.name, ...node.params]
      if (node.returnName !== undefined) children.push(node.returnName)
      if (node.returnType !== undefined) children.push(node.returnType)
      children.push(...node.body)
      return children
    }
    case 'Param':
      return node.type === undefined ? [node.name] : [node.name, node.type]
    case 'TypeRef':
      return node.dimensions.filter((dimension): dimension is Expr => dimension !== null)
    case 'DefineStmt':
      return [...node.names, node.type]
    case 'DimensionStmt':
      return node.items.flatMap((item) => [item.name, ...item.sizes])
    case 'ConstantStmt':
      return node.type === undefined ? [node.name, node.value] : [node.name, node.type, node.value]
    case 'AssignStmt':
      return [node.target, node.value]
    case 'WriteStmt':
      return [...node.args]
    case 'ReadStmt':
      return [...node.targets]
    case 'IfStmt': {
      const children: Node[] = node.branches.flatMap((branch) => [branch.condition, ...branch.body])
      if (node.elseBody !== undefined) children.push(...node.elseBody)
      return children
    }
    case 'SwitchStmt': {
      const children: Node[] = [node.selector]
      for (const entry of node.cases) children.push(...entry.values, ...entry.body)
      if (node.otherwise !== undefined) children.push(...node.otherwise)
      return children
    }
    case 'WhileStmt':
      return [node.condition, ...node.body]
    case 'RepeatStmt':
      return [...node.body, node.condition]
    case 'ForStmt': {
      const children: Node[] = [node.counter, node.from, node.to]
      if (node.step !== undefined) children.push(node.step)
      children.push(...node.body)
      return children
    }
    case 'ReturnStmt':
      return node.value === undefined ? [] : [node.value]
    case 'CallStmt':
      return [node.call]
    case 'WaitStmt':
      return [node.millis]
    case 'Index':
      return [node.target, ...node.indices]
    case 'Call':
      return [node.callee, ...node.args]
    case 'BuiltinCall':
      return [...node.args]
    case 'Unary':
      return [node.operand]
    case 'Binary':
      return [node.left, node.right]
    case 'BreakStmt':
    case 'ContinueStmt':
    case 'ClearStmt':
    case 'WaitKeyStmt':
    case 'ErrorStmt':
    case 'Literal':
    case 'Identifier':
    case 'ErrorExpr':
      return []
  }
}

/**
 * The single traversal utility: the checker, the interpreter and the CodeMirror package all
 * use it. Depth-first, parents before children, children in source order.
 *
 * Iterative on an explicit stack, so a deeply nested tree (a 20 000-term chain of binary
 * operators, say) costs heap instead of JavaScript frames and never overflows the stack.
 */
export function walk(node: Node, visitor: Visitor): void {
  interface Frame {
    readonly node: Node
    readonly parent: Node | null
    children: Node[] | null
    index: number
  }
  const stack: Frame[] = [{ node, parent: null, children: null, index: 0 }]
  while (stack.length > 0) {
    const frame = stack[stack.length - 1] as Frame
    if (frame.children === null) {
      // `enter` returning false skips this node's children and its `exit` call.
      if (visitor.enter?.(frame.node, frame.parent) === false) {
        stack.pop()
        continue
      }
      frame.children = childrenOf(frame.node)
    }
    if (frame.index < frame.children.length) {
      const child = frame.children[frame.index] as Node
      frame.index++
      stack.push({ node: child, parent: frame.node, children: null, index: 0 })
      continue
    }
    visitor.exit?.(frame.node, frame.parent)
    stack.pop()
  }
}
