import { describe, expect, it } from 'vitest'
import type { Binary, Node } from '../../src/ast/index'
import { walk } from '../../src/ast/index'
import { diagnosticCodes, parseSource, sexpr } from '../helpers'

/** A `Segun` whose case label starts with a bracket used to spin forever (final review C1). */
describe('a bracket in case-label position never spins', () => {
  const labels = ['1):', '):', '1,):', 'f(a)):']
  for (const label of labels) {
    it(`makes progress on «${label}»`, { timeout: 5000 }, () => {
      const source = `Proceso p\n  Segun x Hacer\n    ${label}\n      Escribir 1;\n  FinSegun\nFinProceso`
      const result = parseSource(source)
      expect(result.diagnostics.length).toBeLessThan(6)
      expect(result.program.main?.name.name).toBe('p')
      expect(sexpr(result.program)).toContain('(write (literal 1))')
    })
  }
})

describe('depth guards keep deep input from overflowing the stack', () => {
  it('reports E2032 alone for 10 000 nested parentheses', { timeout: 20_000 }, () => {
    const source = `Proceso p\n  a <- ${'('.repeat(10_000)}1${')'.repeat(10_000)};\nFinProceso`
    let codes: string[] = []
    expect(() => {
      codes = diagnosticCodes(source)
    }).not.toThrow()
    // The unwind's E2005 storm is suppressed: one depth error, then at most the garbled tail.
    expect(codes[0]).toBe('E2032')
    expect(codes.slice(1).every((code) => code === 'E2002')).toBe(true)
    expect(codes.length).toBeLessThanOrEqual(2)
  })

  it('parses a 10 000-term left chain without a depth error', { timeout: 20_000 }, () => {
    const source = `Proceso p\n  a <- ${Array.from({ length: 10_000 }, () => '1').join(' + ')};\nFinProceso`
    const result = parseSource(source)
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.body[0]?.kind).toBe('AssignStmt')
  })

  it('reports E2032 alone for 5 000 nested Si', { timeout: 20_000 }, () => {
    const source = `Proceso p\n${'Si a Entonces\n'.repeat(5000)}${'FinSi\n'.repeat(5000)}FinProceso`
    let codes: string[] = []
    expect(() => {
      codes = diagnosticCodes(source)
    }).not.toThrow()
    expect(codes).toEqual(['E2032'])
  })

  it('walks a 20 000-node chain without overflowing', { timeout: 20_000 }, () => {
    const at = { span: { start: 0, end: 0 }, tokens: [0, 0] as const }
    let node: Node = { kind: 'Literal', value: 1, type: 'integer', ...at }
    for (let index = 0; index < 20_000; index++) {
      const binary: Binary = {
        kind: 'Binary',
        op: 'plus',
        left: node as Binary,
        right: { kind: 'Literal', value: 1, type: 'integer', ...at },
        ...at,
      }
      node = binary
    }
    let count = 0
    expect(() => walk(node, { enter: () => void count++ })).not.toThrow()
    expect(count).toBe(40_001)
  })
})
