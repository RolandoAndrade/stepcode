import { describe, expect, it } from 'vitest'
import { collapseWhitespace, createNormalizer } from '../src/normalize'

describe('collapseWhitespace', () => {
  it('trims and collapses internal runs to a single space', () => {
    expect(collapseWhitespace('  Escribir   Sin\tSaltar ')).toBe('Escribir Sin Saltar')
  })
})

describe('createNormalizer', () => {
  it('folds case and accents by default', () => {
    const normalize = createNormalizer({ caseSensitive: false, foldAccents: true })
    expect(normalize('Función')).toBe('funcion')
    expect(normalize('SEGÚN')).toBe('segun')
    expect(normalize('Lógico')).toBe('logico')
  })

  it('keeps case when caseSensitive', () => {
    const normalize = createNormalizer({ caseSensitive: true, foldAccents: true })
    expect(normalize('Función')).toBe('Funcion')
  })

  it('keeps accents when foldAccents is off', () => {
    const normalize = createNormalizer({ caseSensitive: false, foldAccents: false })
    expect(normalize('Función')).toBe('función')
  })

  it('does not fold ñ (it is a letter, not an accent)', () => {
    const normalize = createNormalizer({ caseSensitive: false, foldAccents: true })
    expect(normalize('Año')).toBe('año')
  })

  it('collapses whitespace inside multi-word spellings', () => {
    const normalize = createNormalizer({ caseSensitive: false, foldAccents: true })
    expect(normalize('Escribir  Sin   Saltar')).toBe('escribir sin saltar')
  })
})
