import { describe, expect, it } from 'vitest'
import type { Expr, IfStmt, Literal, Node, Program } from '../../src/ast/index'
import { childrenOf, walk } from '../../src/ast/index'

const span = { start: 0, end: 0 }
const at = (): { span: { start: number; end: number }; tokens: [number, number] } => ({
  span,
  tokens: [0, 0],
})

const literal = (value: number): Literal => ({ kind: 'Literal', value, type: 'integer', ...at() })
const ident = (name: string): Expr => ({ kind: 'Identifier', name, text: name, ...at() })

const ifStmt: IfStmt = {
  kind: 'IfStmt',
  branches: [
    {
      condition: { kind: 'Binary', op: 'lt', left: ident('a'), right: literal(1), ...at() },
      body: [{ kind: 'WriteStmt', args: [literal(2)], newline: true, ...at() }],
    },
    {
      condition: ident('b'),
      body: [{ kind: 'WriteStmt', args: [literal(3)], newline: true, ...at() }],
    },
  ],
  elseBody: [{ kind: 'WriteStmt', args: [literal(4)], newline: true, ...at() }],
  ...at(),
}

const program: Program = {
  kind: 'Program',
  subprograms: [],
  main: {
    kind: 'MainBlock',
    name: { kind: 'Identifier', name: 'p', text: 'p', ...at() },
    body: [ifStmt],
    ...at(),
  },
  ...at(),
}

const kinds = (node: Node): string[] => {
  const seen: string[] = []
  walk(node, { enter: (n) => void seen.push(n.kind) })
  return seen
}

describe('childrenOf', () => {
  it('descends into branch records in source order', () => {
    expect(childrenOf(ifStmt).map((n) => n.kind)).toEqual([
      'Binary',
      'WriteStmt',
      'Identifier',
      'WriteStmt',
      'WriteStmt',
    ])
  })

  it('returns nothing for a leaf', () => {
    expect(childrenOf(literal(1))).toEqual([])
    expect(childrenOf({ kind: 'BreakStmt', ...at() })).toEqual([])
  })
})

describe('walk', () => {
  it('visits parents before children, in source order', () => {
    expect(kinds(program)).toEqual([
      'Program',
      'MainBlock',
      'Identifier',
      'IfStmt',
      'Binary',
      'Identifier',
      'Literal',
      'WriteStmt',
      'Literal',
      'Identifier',
      'WriteStmt',
      'Literal',
      'WriteStmt',
      'Literal',
    ])
  })

  it('passes the parent, null at the root', () => {
    const pairs: [string, string | null][] = []
    walk(program, { enter: (node, parent) => void pairs.push([node.kind, parent?.kind ?? null]) })
    expect(pairs[0]).toEqual(['Program', null])
    expect(pairs[1]).toEqual(['MainBlock', 'Program'])
    expect(pairs[3]).toEqual(['IfStmt', 'MainBlock'])
  })

  it('skips the children of a node whose enter returns false', () => {
    const seen: string[] = []
    walk(program, {
      enter: (node) => {
        seen.push(node.kind)
        return node.kind !== 'IfStmt'
      },
    })
    expect(seen).toEqual(['Program', 'MainBlock', 'Identifier', 'IfStmt'])
  })

  it('does not call exit for a skipped node', () => {
    const exited: string[] = []
    walk(ifStmt, {
      enter: (node) => node.kind !== 'Binary',
      exit: (node) => void exited.push(node.kind),
    })
    expect(exited).not.toContain('Binary')
    expect(exited).toContain('IfStmt')
  })

  it('calls exit after all children, innermost first', () => {
    const exited: string[] = []
    walk(ifStmt.branches[0]!.condition, { exit: (node) => void exited.push(node.kind) })
    expect(exited).toEqual(['Identifier', 'Literal', 'Binary'])
  })

  it('a visitor with neither hook is a no-op', () => {
    expect(() => walk(program, {})).not.toThrow()
  })
})
