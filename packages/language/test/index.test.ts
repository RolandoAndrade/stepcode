import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  BUILTIN_SIGNATURES,
  check,
  compile,
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  LineMap,
  packageName,
  parse,
  registerCatalog,
  tokenize,
  typeToString,
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

  it('exports the checker and the one-call pipeline', () => {
    expect(typeof check).toBe('function')
    expect(typeof compile).toBe('function')
    expect(typeof typeToString).toBe('function')
    expect(BUILTIN_SIGNATURES.length.result).toEqual({ kind: 'scalar', name: 'integer' })
    expect(DIAGNOSTIC_SEVERITY.W3002).toBe('warning')
  })

  it('compiles a program end to end and hands back the side tables', () => {
    const source = [
      'Proceso saluda',
      '  Definir nombre Como Cadena;',
      '  nombre <- "hola";',
      '  Escribir nombre;',
      'FinProceso',
    ].join('\n')
    const { ast, diagnostics } = compile(source, { profile: profiles.es })
    expect(diagnostics).toEqual([])
    const result = check(ast, { profile: profiles.es })
    expect(result.scopes.length).toBe(2)
    expect([...(result.scopes[1]?.symbols.keys() ?? [])]).toEqual(['nombre'])
  })

  it('reports a checker mistake in both locales from the same data', () => {
    const source = [
      'Proceso p',
      '  Definir n Como Entero;',
      '  n <- 2.5;',
      '  Escribir n;',
      'FinProceso',
    ].join('\n')
    const { diagnostics } = compile(source, { profile: profiles.es })
    const first = diagnostics[0]
    expect(first?.code).toBe('E3010')
    // §7.2: `expected`/`found` are pre-rendered with the checking profile's spelling
    // ("Entero"), so only the surrounding template text varies by the formatting locale.
    expect(formatDiagnostic(first!, 'es', profiles.es)).toContain('Entero')
    expect(formatDiagnostic(first!, 'en', profiles.en)).toContain('cannot be stored')
  })
})
