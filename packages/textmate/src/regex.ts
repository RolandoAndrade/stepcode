import { createNormalizer } from '@stepcode/profiles'

/** Word boundaries as the lexer sees them: letters, digits and underscore form a word. */
export const WORD_START = '(?<![\\p{L}\\p{N}_])'
export const WORD_END = '(?![\\p{L}\\p{N}_])'
export const IDENT = '[\\p{L}_][\\p{L}\\p{N}_]*'
/** What may separate the words of a multi-word spelling on one line. */
export const WORD_GAP = '[ \\t]+'

export interface WordOptions {
  caseSensitive: boolean
  foldAccents: boolean
}

const ACCENTS: Record<string, string> = {
  a: 'àáâãä',
  e: 'èéêë',
  i: 'ìíîï',
  o: 'òóôõö',
  u: 'ùúûü',
  c: 'ç',
  y: 'ýÿ',
}

/** Folds accents the way the profile normalizer does (ñ kept), without lowercasing. */
const foldAccentMarks = createNormalizer({ caseSensitive: true, foldAccents: true })

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}

export function accentClass(char: string): string {
  const lower = char.toLowerCase()
  const marks = ACCENTS[lower]
  if (marks === undefined || char.length !== 1) return char
  const variants = char === lower ? marks : marks.toUpperCase()
  return `[${char}${variants}]`
}

export function isMultiWord(spelling: string): boolean {
  return /\s/.test(spelling.trim())
}

export function hasLetter(spelling: string): boolean {
  return /\p{L}/u.test(spelling)
}

function expand(word: string, options: WordOptions): string {
  const escaped = escapeRegex(options.foldAccents ? foldAccentMarks(word) : word)
  if (!options.foldAccents) return escaped
  let out = ''
  for (let i = 0; i < escaped.length; i++) {
    const char = escaped[i] as string
    if (char === '\\') {
      out += char + (escaped[i + 1] ?? '')
      i++
      continue
    }
    out += accentClass(char)
  }
  return out
}

export function wordPattern(spelling: string, options: WordOptions): string {
  return spelling
    .trim()
    .split(/\s+/)
    .map((word) => expand(word, options))
    .join(WORD_GAP)
}

const wordCount = (spelling: string): number => spelling.trim().split(/\s+/).length

export function sortSpellings(spellings: readonly string[]): string[] {
  return [...spellings].sort(
    (a, b) => wordCount(b) - wordCount(a) || b.length - a.length || a.localeCompare(b, 'en'),
  )
}

export function wordAlternation(spellings: readonly string[], options: WordOptions): string {
  return sortSpellings(spellings)
    .map((spelling) => wordPattern(spelling, options))
    .join('|')
}

export function caseFlag(options: Pick<WordOptions, 'caseSensitive'>): string {
  return options.caseSensitive ? '' : '(?i)'
}

export function wordRule(spellings: readonly string[], options: WordOptions): string {
  return `${caseFlag(options)}${WORD_START}(?:${wordAlternation(spellings, options)})${WORD_END}`
}

export function symbolAlternation(spellings: readonly string[]): string {
  return [...spellings]
    .sort((a, b) => b.length - a.length || a.localeCompare(b, 'en'))
    .map(escapeRegex)
    .join('|')
}
