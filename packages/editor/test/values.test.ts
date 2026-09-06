import { profiles } from '@stepcode/profiles'
import type { ArrayValue, FrameVariable } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { ARRAY_LIMIT, renderArray, valueLabel } from '../src/panels/values'
import { stringsFor } from '../src/strings'

const es = stringsFor('es')
const scalar = (value: number | string | boolean): string => String(value)
const more = (count: number): string => `… (+${count})`

function array(dims: number[], data: (number | undefined)[]): ArrayValue {
  return { element: 'integer', dims, data }
}

describe('renderArray', () => {
  it('renders rank 1 with holes', () => {
    expect(renderArray(array([3], [1, undefined, 3]), scalar, '—', more)).toBe('[1, —, 3]')
  })

  it('renders rank 2 row-major and rank 3 nested', () => {
    expect(renderArray(array([2, 2], [1, 2, 3, 4]), scalar, '—', more)).toBe('[[1, 2], [3, 4]]')
    expect(renderArray(array([2, 1, 2], [1, 2, 3, 4]), scalar, '—', more)).toBe(
      '[[[1, 2]], [[3, 4]]]',
    )
  })

  it('truncates past the limit and says how many more', () => {
    const data = Array.from({ length: 105 }, (_, i) => i)
    const text = renderArray(array([105], data), scalar, '—', more, 100)
    expect(text.startsWith('[0, 1, 2')).toBe(true)
    expect(text.endsWith(', 99, … (+5)]')).toBe(true)
    expect(text.split(', ').length).toBe(101)
    expect(ARRAY_LIMIT).toBe(100)
  })

  it('truncates a matrix by cells, not rows', () => {
    const data = Array.from({ length: 6 }, (_, i) => i)
    expect(renderArray(array([3, 2], data), scalar, '—', more, 4)).toBe(
      '[[0, 1], [2, 3], [… (+2)]]',
    )
  })
})

describe('valueLabel', () => {
  const variable = (partial: Partial<FrameVariable>): FrameVariable => ({
    name: 'v',
    kind: 'variable',
    type: { kind: 'scalar', name: 'integer' },
    value: undefined,
    ...partial,
  })

  it('renders scalars through the language renderer', () => {
    expect(valueLabel(variable({ value: 3 }), profiles.es, es)).toBe('3')
    expect(
      valueLabel(
        variable({ type: { kind: 'scalar', name: 'boolean' }, value: true }),
        profiles.es,
        es,
      ),
    ).toBe('Verdadero')
    expect(
      valueLabel(
        variable({ type: { kind: 'scalar', name: 'boolean' }, value: true }),
        profiles.en,
        stringsFor('en'),
      ),
    ).toBe('True')
  })

  it('renders an unassigned scalar as the dash and an array as a list', () => {
    expect(valueLabel(variable({}), profiles.es, es)).toBe('—')
    expect(
      valueLabel(
        variable({
          type: { kind: 'array', element: 'integer', rank: 1 },
          value: array([2], [7, undefined]),
        }),
        profiles.es,
        es,
      ),
    ).toBe('[7, —]')
  })
})
