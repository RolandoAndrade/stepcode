import type { ResolvedProfile } from '@stepcode/profiles'
import { profiles } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { matchCase, primarySpelling, transpose } from '../src/profiles/transpose'

const ES = [
  'Proceso Suma',
  '  Definir a, b Como Entero;',
  '  // un comentario con Escribir dentro',
  "  Escribir 'Escribir no es palabra clave aquí';",
  '  Leer a;',
  '  Si a > 1 Y Verdadero Entonces',
  '    b <- a MOD 2;',
  '  FinSi',
  '  Escribir Abs(b);',
  'FinProceso',
  '',
].join('\n')

describe('transpose', () => {
  it('re-spells keywords, types, builtins and operators; leaves comments and strings alone', () => {
    const en = transpose(ES, profiles.es, profiles.en)
    expect(en).toContain('Program Suma')
    expect(en).toContain('Define a, b As Integer;')
    expect(en).toContain('// un comentario con Escribir dentro')
    expect(en).toContain("'Escribir no es palabra clave aquí'")
    expect(en).toContain('Read a;')
    expect(en).toContain('If a > 1 And True Then')
    expect(en).toContain('EndIf')
    expect(compile(en, { profile: profiles.en }).diagnostics).toEqual([])
  })

  it('is the identity for the same profile and round-trips through en', () => {
    expect(transpose(ES, profiles.es, profiles.es)).toBe(ES)
    const back = transpose(transpose(ES, profiles.es, profiles.en), profiles.en, profiles.es)
    expect(compile(back, { profile: profiles.es }).diagnostics).toEqual([])
  })

  it('preserves the casing pattern of the original spelling', () => {
    expect(matchCase('ESCRIBIR', 'Write')).toBe('WRITE')
    expect(matchCase('escribir', 'Write')).toBe('write')
    expect(matchCase('Escribir', 'write')).toBe('Write')
    expect(matchCase('FinSi', 'EndIf')).toBe('EndIf')
    const upper = transpose('PROCESO A\nESCRIBIR 1;\nFINPROCESO\n', profiles.es, profiles.en)
    expect(upper).toContain('PROGRAM A')
    expect(upper).toContain('WRITE 1;')
  })

  it('keeps the original text when the target has no spelling for a key', () => {
    // `wait` is a required keyword in every built-in profile, so `resolveProfile` refuses to
    // produce one lacking it; build the edge case directly instead.
    const keywords: Record<string, readonly string[]> = { ...profiles.es.keywords }
    delete keywords.wait
    const noWait = { ...profiles.es, keywords } as unknown as ResolvedProfile
    expect(transpose('Esperar 10;', profiles.es, noWait)).toBe('Esperar 10;')
    expect(primarySpelling(noWait, 'keyword', 'wait')).toBeUndefined()
  })

  it('uses the primary spelling for keys with alternatives', () => {
    expect(primarySpelling(profiles.es, 'keyword', 'write')).toBe('Escribir')
    expect(transpose('Mostrar 1;', profiles.es, profiles.es)).toBe('Mostrar 1;')
    expect(transpose('Print 1;', profiles.en, profiles.es)).toMatch(/^(Escribir|Mostrar) 1;$/)
  })
})
