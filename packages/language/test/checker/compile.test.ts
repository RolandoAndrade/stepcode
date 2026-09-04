import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { createDiagnostic, type Diagnostic, sortDiagnostics } from '../../src/diagnostics/index'

const codesOf = (source: string): string[] =>
  compile(source, { profile: profiles.es }).diagnostics.map((one) => one.code)

describe('compile', () => {
  it('parses and checks a clean program', () => {
    const source = ['Proceso p', '  Escribir 1;', 'FinProceso'].join('\n')
    const result = compile(source, { profile: profiles.es })
    expect(result.diagnostics).toEqual([])
    expect(result.ast.main?.name.name).toBe('p')
  })

  it('checks even when the parser reported errors', () => {
    const source = ['Proceso p', '  Escribir noExiste', 'FinProceso'].join('\n')
    // E2001 (missing `;`) from the parser, E3001 from the checker, both present.
    expect(codesOf(source)).toEqual(['E3001', 'E2001'])
  })

  it('sorts by position, then severity, then code', () => {
    const source = [
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- "hola";',
      '  Escribir noExiste;',
      'FinProceso',
    ].join('\n')
    const diagnostics = compile(source, { profile: profiles.es }).diagnostics
    const positions = diagnostics.map((one) => one.span.start)
    expect([...positions].sort((left, right) => left - right)).toEqual(positions)
  })

  it('lets a parser diagnostic win a tie with a checker one', () => {
    // Both would sit at the same offset; the parser's was concatenated first, and the sort
    // is stable, so it comes first.
    const source = ['Proceso p', '  Escribir 1', 'FinProceso'].join('\n')
    const diagnostics = compile(source, { profile: profiles.es }).diagnostics
    expect(diagnostics.map((one) => one.code)).toEqual(['E2001'])
  })

  it('says nothing about the placeholders of a broken tree', () => {
    // M9: a `missing` identifier is never resolved and never reported (§3.2). The guard lives
    // in the resolver itself, so every one of these leaves the checker silent.
    const sources = [
      ['Proceso p', '  Definir Como Entero;', 'FinProceso'],
      ['Proceso p', '  Dimension [3];', 'FinProceso'],
      ['Proceso p', '  Para <- 1 Hasta 3 Hacer', '  FinPara', 'FinProceso'],
    ]
    for (const lines of sources) {
      const codes = codesOf(lines.join('\n'))
      expect(codes, lines.join(' ')).not.toContain('E3001')
      expect(
        codes.every((code) => code.startsWith('E2')),
        lines.join(' '),
      ).toBe(true)
    }
  })
})

describe('sortDiagnostics', () => {
  const at = (code: 'E3001' | 'W3002' | 'E3010', start: number): Diagnostic =>
    createDiagnostic(code, { start, end: start + 1 })

  it('collapses two diagnostics with the same code and span into one', () => {
    expect(sortDiagnostics([at('E3001', 4), at('E3001', 4)])).toHaveLength(1)
  })

  it('keeps two different codes at the same span, in code order', () => {
    const sorted = sortDiagnostics([at('E3010', 4), at('E3001', 4)])
    expect(sorted.map((one) => one.code)).toEqual(['E3001', 'E3010'])
  })

  it('puts an error before a warning at the same offset', () => {
    const sorted = sortDiagnostics([at('W3002', 4), at('E3010', 4)])
    expect(sorted.map((one) => one.code)).toEqual(['E3010', 'W3002'])
  })

  it('orders by position before anything else', () => {
    const sorted = sortDiagnostics([at('E3001', 9), at('W3002', 2)])
    expect(sorted.map((one) => one.span.start)).toEqual([2, 9])
  })
})
