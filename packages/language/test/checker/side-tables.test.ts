import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { Expr, Identifier, Node } from '../../src/ast/index'
import { walk } from '../../src/ast/index'
import { check } from '../../src/checker/index'
import { parse } from '../../src/parser/index'
import { profileNamed } from '../helpers'

const dir = fileURLToPath(new URL('../corpus/programs', import.meta.url))
const zeroBased = new Set(
  readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
    .split('\n')
    .filter((line) => line.length > 0),
)
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

const EXPRESSION_KINDS: ReadonlySet<Node['kind']> = new Set<Node['kind']>([
  'Literal',
  'Identifier',
  'Index',
  'Call',
  'BuiltinCall',
  'Unary',
  'Binary',
  'ErrorExpr',
])

/**
 * An `Identifier` node is not always an expression. It also stands for the *name* of a
 * declaration and for a call's callee, where it names a symbol instead of yielding a value:
 * `Definir a Como Entero` types nothing, and `f(1)` types the call, not `f`. Those slots are
 * checked by `symbols` below; everything else the parser can put in expression position must
 * have a type.
 */
const isNameSlot = (node: Identifier, parent: Node | null | undefined): boolean => {
  switch (parent?.kind) {
    case 'MainBlock':
      return parent.name === node
    case 'SubprogramDecl':
      return parent.name === node || parent.returnName === node
    case 'Param':
      return parent.name === node
    case 'DefineStmt':
      return parent.names.includes(node)
    case 'DimensionStmt':
      return parent.items.some((item) => item.name === node)
    case 'Call':
      return parent.callee === node
    default:
      return false
  }
}

describe('the side tables cover every corpus tree', () => {
  for (const file of files) {
    it(`${file} types every expression, resolves every name and every call`, () => {
      const profile = profileNamed(zeroBased.has(file.replace('.stepcode', '')) ? 'es0' : 'es')
      const source = readFileSync(join(dir, file), 'utf8')
      const { program } = parse(source, { profile })
      const result = check(program, { profile })
      const untypedExpressions: string[] = []
      const unresolvedNames: string[] = []
      const unresolvedCalls: string[] = []
      walk(program, {
        enter: (node, parent) => {
          const named = node.kind === 'Identifier' && isNameSlot(node as Identifier, parent)
          if (EXPRESSION_KINDS.has(node.kind) && !named && !result.types.has(node as Expr)) {
            untypedExpressions.push(`${node.kind}@${node.span.start}`)
          }
          if (node.kind === 'Call' && !result.calls.has(node)) {
            unresolvedCalls.push(`Call@${node.span.start}`)
          }
          if (
            node.kind === 'Identifier' &&
            node.missing !== true &&
            // A main block's name is not a symbol: nothing declares it and nothing reads it.
            parent?.kind !== 'MainBlock' &&
            !result.symbols.has(node as Identifier)
          ) {
            unresolvedNames.push(`${node.text}@${node.span.start}`)
          }
          return true
        },
      })
      expect(untypedExpressions).toEqual([])
      expect(unresolvedNames).toEqual([])
      expect(unresolvedCalls).toEqual([])
    })

    it(`${file} lists every declared name once per scope`, () => {
      const profile = profileNamed(zeroBased.has(file.replace('.stepcode', '')) ? 'es0' : 'es')
      const source = readFileSync(join(dir, file), 'utf8')
      const { program } = parse(source, { profile })
      const result = check(program, { profile })
      for (const scope of result.scopes) {
        const names = scope.order.map((symbol) => symbol.name)
        expect(new Set(names).size).toBe(names.length)
        expect(scope.symbols.size).toBe(names.length)
      }
    })
  }
})
