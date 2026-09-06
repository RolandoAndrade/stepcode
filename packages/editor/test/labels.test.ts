import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { typeLabel } from '../src/labels'
import { stringsFor } from '../src/strings'

describe('typeLabel', () => {
  it('spells scalars with the profile and arrays with the strings', () => {
    const es = stringsFor('es')
    expect(typeLabel({ kind: 'scalar', name: 'integer' }, profiles.es, es)).toBe('Entero')
    expect(typeLabel({ kind: 'scalar', name: 'string' }, profiles.en, stringsFor('en'))).toBe(
      'String',
    )
    expect(typeLabel({ kind: 'array', element: 'real', rank: 1 }, profiles.es, es)).toBe(
      'Arreglo de Real',
    )
    expect(
      typeLabel({ kind: 'array', element: 'boolean', rank: 2 }, profiles.en, stringsFor('en')),
    ).toBe('Array of Boolean (2D)')
    expect(typeLabel({ kind: 'unknown' }, profiles.es, es)).toBe('?')
  })
})
