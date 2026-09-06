import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  arrayOf,
  BOOLEAN,
  CHAR,
  classToString,
  constType,
  expectedToString,
  INTEGER,
  isArray,
  isNumeric,
  isScalar,
  isText,
  isUnknown,
  REAL,
  STRING,
  sameType,
  scalar,
  typeToString,
  UNKNOWN,
} from '../../src/types/type'

describe('the type model', () => {
  it('names the five scalars and the array and unknown shapes', () => {
    expect(INTEGER).toEqual({ kind: 'scalar', name: 'integer' })
    expect(REAL).toEqual({ kind: 'scalar', name: 'real' })
    expect(STRING).toEqual({ kind: 'scalar', name: 'string' })
    expect(CHAR).toEqual({ kind: 'scalar', name: 'char' })
    expect(BOOLEAN).toEqual({ kind: 'scalar', name: 'boolean' })
    expect(UNKNOWN).toEqual({ kind: 'unknown' })
    expect(arrayOf('integer', 2)).toEqual({ kind: 'array', element: 'integer', rank: 2 })
  })

  it('hands back one frozen singleton per scalar', () => {
    expect(scalar('integer')).toBe(INTEGER)
    expect(scalar('char')).toBe(CHAR)
    expect(Object.isFrozen(INTEGER)).toBe(true)
    expect(Object.isFrozen(UNKNOWN)).toBe(true)
  })

  it('classifies shapes', () => {
    expect(isScalar(INTEGER)).toBe(true)
    expect(isScalar(arrayOf('integer', 1))).toBe(false)
    expect(isArray(arrayOf('integer', 1))).toBe(true)
    expect(isUnknown(UNKNOWN)).toBe(true)
    expect(isUnknown(INTEGER)).toBe(false)
  })

  it('classifies numeric and text scalars, and nothing else', () => {
    expect(isNumeric(INTEGER)).toBe(true)
    expect(isNumeric(REAL)).toBe(true)
    expect(isNumeric(BOOLEAN)).toBe(false)
    expect(isNumeric(UNKNOWN)).toBe(false)
    expect(isNumeric(arrayOf('integer', 1))).toBe(false)
    expect(isText(STRING)).toBe(true)
    expect(isText(CHAR)).toBe(true)
    expect(isText(INTEGER)).toBe(false)
    expect(isText(arrayOf('string', 1))).toBe(false)
  })

  it('compares types structurally, and unknown is only ever the same as unknown', () => {
    expect(sameType(INTEGER, scalar('integer'))).toBe(true)
    expect(sameType(INTEGER, REAL)).toBe(false)
    expect(sameType(arrayOf('integer', 2), arrayOf('integer', 2))).toBe(true)
    expect(sameType(arrayOf('integer', 2), arrayOf('integer', 1))).toBe(false)
    expect(sameType(arrayOf('integer', 1), arrayOf('real', 1))).toBe(false)
    expect(sameType(UNKNOWN, UNKNOWN)).toBe(true)
    expect(sameType(UNKNOWN, INTEGER)).toBe(false)
  })

  it('derives a scalar type from a folded constant', () => {
    expect(constType({ type: 'real', value: 2 })).toBe(REAL)
    expect(constType({ type: 'string', value: 'ab' })).toBe(STRING)
  })

  it('renders types through the profile first spelling', () => {
    expect(typeToString(INTEGER, profiles.es)).toBe('Entero')
    expect(typeToString(INTEGER, profiles.en)).toBe('Integer')
    expect(typeToString(CHAR, profiles.es)).toBe('Caracter')
    expect(typeToString(arrayOf('integer', 1), profiles.es)).toBe('Entero[]')
    expect(typeToString(arrayOf('integer', 2), profiles.es)).toBe('Entero[,]')
    expect(typeToString(arrayOf('real', 3), profiles.en)).toBe('Real[,,]')
    expect(typeToString(UNKNOWN, profiles.es)).toBe('?')
  })

  it('renders operand classes as the profile spellings they accept', () => {
    expect(classToString('numeric', profiles.es)).toBe('Entero/Real')
    expect(classToString('text', profiles.es)).toBe('Cadena/Caracter')
    expect(classToString('integer', profiles.es)).toBe('Entero')
    expect(classToString('boolean', profiles.es)).toBe('Logico')
    expect(classToString('scalar', profiles.es)).toBe('Entero/Real/Cadena/Caracter/Logico')
  })

  it('renders an expectation, whichever of the two shapes it is', () => {
    expect(expectedToString('numeric', profiles.es)).toBe('Entero/Real')
    expect(expectedToString(CHAR, profiles.es)).toBe('Caracter')
  })
})
