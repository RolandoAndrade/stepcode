import type { SyntaxNode } from '@lezer/common'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { keywordNodeName } from '../src/nodes'
import { buildTree, compileProp } from '../src/tree'
import { corpusSources, en, leaves, treeFor } from './helpers'

/** Children inside their parent, siblings ordered and disjoint, recursively. */
function assertNesting(node: SyntaxNode): void {
  let previousEnd = node.from
  for (let child = node.firstChild; child !== null; child = child.nextSibling) {
    expect(child.from).toBeGreaterThanOrEqual(previousEnd)
    expect(child.to).toBeLessThanOrEqual(node.to)
    expect(child.to).toBeGreaterThanOrEqual(child.from)
    previousEnd = child.to
    assertNesting(child)
  }
}

describe('buildTree over the corpus', () => {
  const cases = corpusSources().map((one) => [one.slug, one] as const)

  it('covers the whole corpus', () => {
    expect(cases.length).toBeGreaterThan(200)
  })

  it.each(cases)(
    '%s: leaves cover exactly the significant tokens, nested and in order',
    (_slug, c) => {
      const result = compile(c.source, { profile: c.profile })
      const tree = buildTree(result)
      expect(tree.length).toBe(c.source.length)
      expect(tree.prop(compileProp)?.result).toBe(result)
      assertNesting(tree.topNode)

      const expected = result.tokens
        .filter((t) => t.kind !== 'whitespace' && t.kind !== 'newline' && t.kind !== 'eof')
        .map((t) => `${t.span.start}-${t.span.end}`)
      const actual = leaves(tree)
        .filter((leaf) => leaf.from < leaf.to)
        .map((leaf) => `${leaf.from}-${leaf.to}`)
      expect(actual).toEqual(expected)

      const byStart = new Map(leaves(tree).map((leaf) => [leaf.from, leaf.name]))
      for (const token of result.tokens) {
        if (token.kind !== 'keyword' || typeof token.value !== 'string') continue
        const name = byStart.get(token.span.start)
        const keyword = keywordNodeName(token.value as Parameters<typeof keywordNodeName>[0])
        expect(name === keyword || name === 'Boolean').toBe(true)
      }
    },
  )
})

describe('buildTree shapes', () => {
  const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

  it('makes the program keyword, the name and the closer direct children of MainBlock', () => {
    const tree = treeFor(main('  Escribir 1;'))
    const block = tree.topNode.getChild('MainBlock')
    expect(block).not.toBeNull()
    expect(block?.getChild('ProgramKeyword')?.from).toBe(0)
    expect(block?.getChild('SubprogramName')?.name).toBe('SubprogramName')
    expect(block?.getChild('EndProgramKeyword')).not.toBeNull()
    expect(tree.toString()).toContain('WriteStmt(WriteKeyword,Number')
  })

  it('flattens IfBranch: Si, Entonces, Sino and FinSi are siblings under IfStmt', () => {
    const tree = treeFor(
      main('  Si 1 < 2 Entonces\n    Escribir 1;\n  Sino\n    Escribir 2;\n  FinSi'),
    )
    expect(tree.toString()).not.toContain('IfBranch')
    const stmt = tree.topNode.getChild('MainBlock')?.getChild('IfStmt')
    const names: string[] = []
    for (let child = stmt?.firstChild ?? null; child !== null; child = child.nextSibling) {
      names.push(child.name)
    }
    expect(names).toEqual([
      'IfKeyword',
      'Binary',
      'ThenKeyword',
      'WriteStmt',
      'ElseKeyword',
      'WriteStmt',
      'EndIfKeyword',
    ])
  })

  it('keeps SwitchCase as a node whose values and body are its children', () => {
    const source = main(
      '  Definir x Como Entero;\n  Segun x Hacer\n    1:\n      Escribir "uno";\n    De Otro Modo:\n      Escribir "otro";\n  FinSegun',
    )
    const stmt = treeFor(source).topNode.getChild('MainBlock')?.getChild('SwitchStmt')
    const kase = stmt?.getChild('SwitchCase')
    expect(kase?.getChild('Number')).not.toBeNull()
    expect(kase?.getChild('WriteStmt')).not.toBeNull()
    expect(stmt?.getChild('OtherwiseKeyword')).not.toBeNull()
    expect(stmt?.getChild('EndSwitchKeyword')).not.toBeNull()
  })

  it('names identifiers by role', () => {
    const source = [
      'Funcion r <- doble(n Como Entero)',
      '  r <- n * 2;',
      'FinFuncion',
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- doble(3);',
      'FinProceso',
    ].join('\n')
    const names = leaves(treeFor(source))
      .filter(
        (leaf) =>
          leaf.name.endsWith('Name') ||
          leaf.name === 'Identifier' ||
          leaf.name === 'VariableDefinition',
      )
      .map((leaf) => `${leaf.name}:${source.slice(leaf.from, leaf.to)}`)
    expect(names).toEqual([
      'VariableDefinition:r',
      'SubprogramName:doble',
      'VariableDefinition:n',
      'TypeName:Entero',
      'Identifier:r',
      'Identifier:n',
      'SubprogramName:p',
      'VariableDefinition:a',
      'TypeName:Entero',
      'Identifier:a',
      'CallName:doble',
    ])
  })

  it('records identifier leaves and call nodes by offset', () => {
    const source = main('  Definir a Como Entero;\n  a <- Abs(-1);')
    const data = treeFor(source).prop(compileProp)
    const aOffset = source.indexOf('a <-')
    expect(data?.identifiers.get(aOffset)?.text).toBe('a')
    expect(data?.calls.get(source.indexOf('Abs'))?.kind).toBe('BuiltinCall')
  })

  it('drops a missing identifier instead of emitting a zero-width leaf', () => {
    const tree = treeFor(main('  Definir Como Entero;'))
    const define = tree.topNode.getChild('MainBlock')?.getChild('DefineStmt')
    expect(define?.getChild('VariableDefinition')).toBeNull()
    expect(define?.getChild('TypeRef')).not.toBeNull()
  })

  it('keeps garbage as an ErrorStmt node with its tokens inside', () => {
    const tree = treeFor(main('  ) 3;'))
    const error = tree.topNode.getChild('MainBlock')?.getChild('ErrorStmt')
    expect(error).not.toBeNull()
    expect(error?.type.isError).toBe(true)
  })

  it('attaches a comment to the innermost node containing it', () => {
    const source = main('  Si 1 < 2 Entonces // why\n    Escribir 1;\n  FinSi')
    const stmt = treeFor(source).topNode.getChild('MainBlock')?.getChild('IfStmt')
    const comment = stmt?.getChild('Comment')
    expect(comment).not.toBeNull()
    expect(source.slice(comment?.from, comment?.to)).toBe('// why')
  })

  it('builds under the en profile with the same node names', () => {
    const tree = treeFor('Program p\n  Write 1;\nEndProgram', en)
    expect(tree.topNode.getChild('MainBlock')?.getChild('EndProgramKeyword')).not.toBeNull()
  })
})
