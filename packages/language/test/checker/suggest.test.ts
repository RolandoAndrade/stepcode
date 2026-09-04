import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { damerauLevenshtein, suggestName } from '../../src/checker/suggest'

const normalize = profiles.es.normalize

describe('damerauLevenshtein', () => {
  it('is zero for equal strings', () => {
    expect(damerauLevenshtein('total', 'total', 2)).toBe(0)
  })

  it('counts one substitution, one insertion and one deletion', () => {
    expect(damerauLevenshtein('total', 'tota', 2)).toBe(1)
    expect(damerauLevenshtein('total', 'totall', 2)).toBe(1)
    expect(damerauLevenshtein('total', 'tetal', 2)).toBe(1)
  })

  it('counts a transposition as one, not two', () => {
    expect(damerauLevenshtein('total', 'ttoal', 2)).toBe(1)
    expect(damerauLevenshtein('contador', 'contadro', 2)).toBe(1)
  })

  it('stops counting past the cutoff instead of walking the whole matrix', () => {
    expect(damerauLevenshtein('abcdef', 'zzzzzz', 2)).toBe(3)
    expect(damerauLevenshtein('', 'abcdef', 2)).toBe(3)
    // The row minimum can stay at or under `max` while the bottom-right cell (the real
    // distance) is further away — the return must still cap at `max + 1`.
    expect(damerauLevenshtein('ca', 'abc', 1)).toBe(2)
  })
})

describe('suggestName', () => {
  it('finds a name within distance two', () => {
    expect(suggestName('contadro', ['contador', 'total'], normalize)).toBe('contador')
    expect(suggestName('totl', ['contador', 'total'], normalize)).toBe('total')
  })

  it('gives nothing when everything is further than two edits away', () => {
    expect(suggestName('xyz', ['contador', 'total'], normalize)).toBeUndefined()
  })

  it('ignores accents and case, because the profile normalizer folds both', () => {
    expect(suggestName('anio', ['año'], normalize)).toBe('año')
    expect(suggestName('AÑO', ['año'], normalize)).toBe('año')
    expect(suggestName('Total', ['total'], normalize)).toBe('total')
  })

  it('rejects a candidate past the cutoff', () => {
    expect(suggestName('anios', ['año'], normalize)).toBeUndefined()
  })

  it('prefers the nearest candidate, and the first one at equal distance', () => {
    expect(suggestName('tota', ['total', 'tot'], normalize)).toBe('total')
    expect(suggestName('cont', ['conta', 'conto'], normalize)).toBe('conta')
  })

  it('hands back the candidate exactly as it was written', () => {
    expect(suggestName('miedad', ['miEdad'], normalize)).toBe('miEdad')
  })
})
