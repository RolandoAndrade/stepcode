import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  LineMap,
  packageName,
  parse,
  registerCatalog,
  tokenize,
  walk,
} from '../src/index'

describe('stepcode', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('stepcode')
  })

  it('exports the whole source → tokens → AST pipeline', () => {
    expect(typeof tokenize).toBe('function')
    expect(typeof parse).toBe('function')
    expect(typeof walk).toBe('function')
    expect(typeof formatDiagnostic).toBe('function')
    expect(typeof registerCatalog).toBe('function')
    expect(DIAGNOSTIC_CODES.length).toBeGreaterThan(0)
    expect(DIAGNOSTIC_SEVERITY.W2001).toBe('warning')
    expect(new LineMap('a\nb').lineCount).toBe(2)
  })

  it('parses a program end to end through the public API', () => {
    const result = parse('Proceso saluda\n  Escribir "hola";\nFinProceso', { profile: profiles.es })
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.name.name).toBe('saluda')
    const kinds: string[] = []
    walk(result.program, { enter: (node) => void kinds.push(node.kind) })
    expect(kinds).toContain('WriteStmt')
  })

  it('formats a diagnostic in both locales from the same data', () => {
    const result = parse('Proceso p\n  Si a Entonces\nFinProceso', { profile: profiles.es })
    const diagnostic = result.diagnostics[0]
    expect(diagnostic?.code).toBe('E2003')
    expect(formatDiagnostic(diagnostic!, 'es', profiles.es)).toContain('FinSi')
    expect(formatDiagnostic(diagnostic!, 'en', profiles.en)).toContain('EndIf')
  })
})
