import { BUILTIN_KEYS, KEYWORD_KEYS, TYPE_KEYS } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'

describe('stringsFor', () => {
  it('returns Spanish for es', () => {
    const s = stringsFor('es')
    expect(s.kinds.parameter).toBe('parámetro')
    expect(s.function).toBe('función')
    expect(s.declaredAt(12)).toBe('declarada en la línea 12')
    expect(s.replaceWith('total')).toBe('Cambiar a «total»')
    expect(s.operandClass.numeric).toBe('número')
    expect(s.placeholders.condition).toBe('condicion')
  })

  it('returns English for en', () => {
    const s = stringsFor('en')
    expect(s.kinds.constant).toBe('constant')
    expect(s.declaredAt(3)).toBe('declared on line 3')
    expect(s.replaceWith('total')).toBe('Replace with "total"')
    expect(s.same).toBe('same as the argument')
  })

  it('falls back by primary subtag, then to en', () => {
    expect(stringsFor('es-MX').kinds.variable).toBe('variable')
    expect(stringsFor('es-MX').byReference).toBe('por referencia')
    expect(stringsFor('pt-BR').byReference).toBe('by reference')
    expect(stringsFor('')).toBe(stringsFor('en'))
  })

  it('describes every keyword, type and builtin in both locales, one sentence each', () => {
    for (const locale of ['es', 'en']) {
      const d = stringsFor(locale).descriptions
      expect(Object.keys(d.keywords).sort()).toEqual([...KEYWORD_KEYS].sort())
      expect(Object.keys(d.types).sort()).toEqual([...TYPE_KEYS].sort())
      expect(Object.keys(d.builtins).sort()).toEqual([...BUILTIN_KEYS].sort())
      for (const text of [
        ...Object.values(d.keywords),
        ...Object.values(d.types),
        ...Object.values(d.builtins),
      ]) {
        expect(text.length).toBeGreaterThan(0)
        expect(text.endsWith('.')).toBe(true)
      }
    }
  })

  it('describes in the language of the locale', () => {
    expect(stringsFor('es').descriptions.keywords.write).toBe('Muestra un valor en la consola.')
    expect(stringsFor('en').descriptions.keywords.write).toBe('Shows a value in the console.')
    expect(stringsFor('es').descriptions.types.integer).toBe('Números sin decimales.')
    expect(stringsFor('es').descriptions.builtins.sqrt).toBe('Da la raíz cuadrada de un número.')
  })

  it('covers every symbol kind and operand class in both locales', () => {
    for (const locale of ['es', 'en']) {
      const s = stringsFor(locale)
      for (const kind of ['variable', 'parameter', 'result', 'constant', 'counter', 'subprogram']) {
        expect(s.kinds[kind as keyof typeof s.kinds].length).toBeGreaterThan(0)
      }
      for (const cls of ['numeric', 'text', 'boolean', 'integer', 'scalar']) {
        expect(s.operandClass[cls as keyof typeof s.operandClass].length).toBeGreaterThan(0)
      }
    }
  })
})
