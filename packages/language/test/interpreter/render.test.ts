import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { renderValue } from '../../src/interpreter/render'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'

describe('renderValue (§5.6)', () => {
  it('renders an Entero as a decimal integer', () => {
    expect(renderValue(42, INTEGER, profiles.es)).toBe('42')
    expect(renderValue(-7, INTEGER, profiles.es)).toBe('-7')
    expect(renderValue(0, INTEGER, profiles.es)).toBe('0')
  })

  it('renders a Real as the JS shortest round-trip, integral values without a point', () => {
    expect(renderValue(2, REAL, profiles.es)).toBe('2')
    expect(renderValue(4 / 2, REAL, profiles.es)).toBe('2')
    expect(renderValue(2.5, REAL, profiles.es)).toBe('2.5')
    expect(renderValue(0.1 + 0.2, REAL, profiles.es)).toBe('0.30000000000000004')
    expect(renderValue(1e21, REAL, profiles.es)).toBe('1e+21')
    expect(renderValue(1e-7, REAL, profiles.es)).toBe('1e-7')
  })

  it('renders a Logico with the profile first spelling of true and false', () => {
    expect(renderValue(true, BOOLEAN, profiles.es)).toBe('Verdadero')
    expect(renderValue(false, BOOLEAN, profiles.es)).toBe('Falso')
    expect(renderValue(true, BOOLEAN, profiles.en)).toBe('True')
    expect(renderValue(false, BOOLEAN, profiles.en)).toBe('False')
  })

  it('renders a Cadena and a Caracter as the string itself', () => {
    expect(renderValue('hola', STRING, profiles.es)).toBe('hola')
    expect(renderValue('', STRING, profiles.es)).toBe('')
    expect(renderValue('ñ', CHAR, profiles.es)).toBe('ñ')
  })

  it('throws for an array: hosts render arrays themselves', () => {
    const array = { element: 'integer' as const, dims: [1], data: [1] }
    expect(() => renderValue(array, arrayOf('integer', 1), profiles.es)).toThrow(/array/)
    expect(() => renderValue(1, arrayOf('integer', 1), profiles.es)).toThrow(/array/)
    expect(() => renderValue(1, UNKNOWN, profiles.es)).toThrow()
  })
})
