import { describe, expect, it } from 'vitest'
import {
  accentClass,
  caseFlag,
  escapeRegex,
  hasLetter,
  IDENT,
  isMultiWord,
  sortSpellings,
  symbolAlternation,
  WORD_END,
  WORD_START,
  wordAlternation,
  wordPattern,
  wordRule,
} from '../src/regex'

const folded = { caseSensitive: false, foldAccents: true }
const exact = { caseSensitive: true, foldAccents: false }

describe('escapeRegex', () => {
  it('escapes every regex metacharacter and leaves letters alone', () => {
    expect(escapeRegex('a.b*c+d?e^f$g(h)i[j]k{l}m|n\\o/p-q')).toBe(
      'a\\.b\\*c\\+d\\?e\\^f\\$g\\(h\\)i\\[j\\]k\\{l\\}m\\|n\\\\o\\/p-q',
    )
    expect(escapeRegex('Escribir')).toBe('Escribir')
  })
})

describe('accentClass', () => {
  it('expands the vowels, c and y in both cases', () => {
    expect(accentClass('a')).toBe('[aàáâãä]')
    expect(accentClass('e')).toBe('[eèéêë]')
    expect(accentClass('i')).toBe('[iìíîï]')
    expect(accentClass('o')).toBe('[oòóôõö]')
    expect(accentClass('u')).toBe('[uùúûü]')
    expect(accentClass('c')).toBe('[cç]')
    expect(accentClass('y')).toBe('[yýÿ]')
    expect(accentClass('A')).toBe('[AÀÁÂÃÄ]')
    expect(accentClass('U')).toBe('[UÙÚÛÜ]')
  })
  it('leaves every other character unchanged', () => {
    expect(accentClass('n')).toBe('n')
    expect(accentClass('ñ')).toBe('ñ')
    expect(accentClass('_')).toBe('_')
    expect(accentClass('\\.')).toBe('\\.')
  })
})

describe('wordPattern', () => {
  it('expands accent classes when folding', () => {
    expect(wordPattern('Funcion', folded)).toBe('F[uùúûü]n[cç][iìíîï][oòóôõö]n')
  })
  it('folds an accented spelling first, so Función and Funcion produce the same pattern', () => {
    expect(wordPattern('Función', folded)).toBe(wordPattern('Funcion', folded))
  })
  it('keeps the spelling literal when not folding', () => {
    expect(wordPattern('Función', exact)).toBe('Función')
    expect(wordPattern('If', exact)).toBe('If')
  })
  it('joins the words of a multi-word spelling with a tab-or-space run', () => {
    expect(wordPattern('Con Paso', exact)).toBe('Con[ \\t]+Paso')
    expect(wordPattern('Escribir   Sin Saltar', exact)).toBe('Escribir[ \\t]+Sin[ \\t]+Saltar')
  })
  it('escapes before expanding', () => {
    expect(wordPattern('a.b', exact)).toBe('a\\.b')
    expect(wordPattern('a.b', folded)).toBe('[aàáâãä]\\.b')
  })
})

describe('sortSpellings', () => {
  it('orders by word count, then length, then alphabetically, and does not mutate', () => {
    const input = ['Sino', 'Sino Si', 'Si', 'Mientras', 'Mientras Que', 'De Otro Modo']
    expect(sortSpellings(input)).toEqual([
      'De Otro Modo',
      'Mientras Que',
      'Sino Si',
      'Mientras',
      'Sino',
      'Si',
    ])
    expect(input[0]).toBe('Sino')
  })
})

describe('wordAlternation and wordRule', () => {
  it('builds a sorted alternation', () => {
    expect(wordAlternation(['Si', 'Sino Si', 'Sino'], exact)).toBe('Sino[ \\t]+Si|Sino|Si')
  })
  it('wraps the alternation in boundaries and the case flag', () => {
    expect(wordRule(['If', 'Then'], exact)).toBe(`${WORD_START}(?:Then|If)${WORD_END}`)
    expect(wordRule(['If'], { caseSensitive: false, foldAccents: false })).toBe(
      `(?i)${WORD_START}(?:If)${WORD_END}`,
    )
  })
})

describe('caseFlag', () => {
  it('is (?i) only for case-insensitive profiles', () => {
    expect(caseFlag({ caseSensitive: false })).toBe('(?i)')
    expect(caseFlag({ caseSensitive: true })).toBe('')
  })
})

describe('symbolAlternation', () => {
  it('escapes and sorts longest first', () => {
    expect(symbolAlternation(['<', '<=', '<-', '**', '*'])).toBe('\\*\\*|<-|<=|\\*|<')
  })
})

describe('predicates', () => {
  it('isMultiWord and hasLetter', () => {
    expect(isMultiWord('Con Paso')).toBe(true)
    expect(isMultiWord('Escribir')).toBe(false)
    expect(hasLetter('MOD')).toBe(true)
    expect(hasLetter('%')).toBe(false)
    expect(hasLetter('ñ')).toBe(true)
  })
})

describe('constants', () => {
  it('use Unicode lookarounds, never \\b', () => {
    expect(WORD_START).toBe('(?<![\\p{L}\\p{N}_])')
    expect(WORD_END).toBe('(?![\\p{L}\\p{N}_])')
    expect(IDENT).toBe('[\\p{L}_][\\p{L}\\p{N}_]*')
  })
})
