import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parseInput } from '../../src/interpreter/input'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING } from '../../src/types/type'

describe('parseInput (§5.7)', () => {
  it('Entero accepts an optionally signed digit string and nothing else', () => {
    expect(parseInput('12', INTEGER, profiles.es)).toEqual({ ok: true, value: 12 })
    expect(parseInput('-12', INTEGER, profiles.es)).toEqual({ ok: true, value: -12 })
    expect(parseInput('+3', INTEGER, profiles.es)).toEqual({ ok: true, value: 3 })
    expect(parseInput('1.5', INTEGER, profiles.es)).toEqual({
      ok: false,
      hint: 'integer',
      text: '1.5',
    })
    expect(parseInput('abc', INTEGER, profiles.es)).toEqual({
      ok: false,
      hint: 'integer',
      text: 'abc',
    })
    expect(parseInput('', INTEGER, profiles.es)).toEqual({ ok: false, hint: 'integer', text: '' })
  })

  it('Real accepts the dot grammar, integers included, and rejects a comma', () => {
    expect(parseInput('3.5', REAL, profiles.es)).toEqual({ ok: true, value: 3.5 })
    expect(parseInput('-1.5', REAL, profiles.es)).toEqual({ ok: true, value: -1.5 })
    expect(parseInput('.5', REAL, profiles.es)).toEqual({ ok: true, value: 0.5 })
    expect(parseInput('3.', REAL, profiles.es)).toEqual({ ok: true, value: 3 })
    expect(parseInput('12', REAL, profiles.es)).toEqual({ ok: true, value: 12 })
    expect(parseInput('3,5', REAL, profiles.es)).toEqual({ ok: false, hint: 'real', text: '3,5' })
    expect(parseInput('1e3', REAL, profiles.es)).toEqual({ ok: false, hint: 'real', text: '1e3' })
  })

  it('Logico accepts any spelling of true or false under the profile normalizer', () => {
    expect(parseInput('Verdadero', BOOLEAN, profiles.es)).toEqual({ ok: true, value: true })
    expect(parseInput('verdadero', BOOLEAN, profiles.es)).toEqual({ ok: true, value: true })
    expect(parseInput('FALSO', BOOLEAN, profiles.es)).toEqual({ ok: true, value: false })
    expect(parseInput('True', BOOLEAN, profiles.en)).toEqual({ ok: true, value: true })
    expect(parseInput('false', BOOLEAN, profiles.en)).toEqual({ ok: true, value: false })
    expect(parseInput('si', BOOLEAN, profiles.es)).toEqual({
      ok: false,
      hint: 'boolean',
      text: 'si',
    })
    expect(parseInput('True', BOOLEAN, profiles.es)).toEqual({
      ok: false,
      hint: 'boolean',
      text: 'True',
    })
  })

  it('Caracter accepts exactly one code point, an astral one included', () => {
    expect(parseInput('a', CHAR, profiles.es)).toEqual({ ok: true, value: 'a' })
    expect(parseInput('😀', CHAR, profiles.es)).toEqual({ ok: true, value: '😀' })
    expect(parseInput('ab', CHAR, profiles.es)).toEqual({ ok: false, hint: 'char', text: 'ab' })
    expect(parseInput('', CHAR, profiles.es)).toEqual({ ok: false, hint: 'char', text: '' })
  })

  it('Cadena accepts any text, the empty one included', () => {
    expect(parseInput('hola mundo', STRING, profiles.es)).toEqual({ ok: true, value: 'hola mundo' })
    expect(parseInput('', STRING, profiles.es)).toEqual({ ok: true, value: '' })
  })

  it('trims leading and trailing whitespace for every type, Cadena included', () => {
    expect(parseInput('  12 ', INTEGER, profiles.es)).toEqual({ ok: true, value: 12 })
    expect(parseInput('\t3.5\n', REAL, profiles.es)).toEqual({ ok: true, value: 3.5 })
    expect(parseInput(' Falso ', BOOLEAN, profiles.es)).toEqual({ ok: true, value: false })
    expect(parseInput(' x ', CHAR, profiles.es)).toEqual({ ok: true, value: 'x' })
    expect(parseInput('  hola  ', STRING, profiles.es)).toEqual({ ok: true, value: 'hola' })
    expect(parseInput(' 1.5 ', INTEGER, profiles.es)).toEqual({
      ok: false,
      hint: 'integer',
      text: '1.5',
    })
  })

  it('throws for a non-scalar target type', () => {
    expect(() => parseInput('1', arrayOf('integer', 1), profiles.es)).toThrow()
  })
})
