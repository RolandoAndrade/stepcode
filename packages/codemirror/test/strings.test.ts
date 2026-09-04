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
