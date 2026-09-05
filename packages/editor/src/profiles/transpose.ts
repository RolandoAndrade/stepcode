import type { ResolvedProfile } from '@stepcode/profiles'
import { type Token, tokenize } from 'stepcode'

export type SpellingKind = 'keyword' | 'type' | 'builtin' | 'operator'

const SECTION: Readonly<Record<SpellingKind, 'keywords' | 'types' | 'builtins' | 'operators'>> = {
  keyword: 'keywords',
  type: 'types',
  builtin: 'builtins',
  operator: 'operators',
}

/** The first spelling of `key` in `profile`, or undefined when the profile has none. */
export function primarySpelling(
  profile: ResolvedProfile,
  kind: SpellingKind,
  key: string,
): string | undefined {
  const section = profile[SECTION[kind]] as Readonly<Record<string, readonly string[] | undefined>>
  return section[key]?.[0]
}

/**
 * ALL CAPS → ALL CAPS, lower → lower, Title Case (leading letter capitalized, rest lower) →
 * Title Case; any other mixed casing keeps the target's own casing as authored.
 */
export function matchCase(template: string, spelling: string): string {
  const letters = template.replace(/[^\p{L}]/gu, '')
  if (letters.length === 0) return spelling
  const first = letters[0] as string
  const rest = letters.slice(1)
  // Title Case is checked first: a single capitalized letter (e.g. the `Y` in `a Y b`) is
  // vacuously both "all caps" and "Title Case", and here it means Title Case, not shouting.
  if (first === first.toUpperCase() && rest === rest.toLowerCase()) {
    if (spelling.length === 0) return spelling
    return `${(spelling[0] as string).toUpperCase()}${spelling.slice(1).toLowerCase()}`
  }
  if (letters === letters.toUpperCase()) return spelling.toUpperCase()
  if (letters === letters.toLowerCase()) return spelling.toLowerCase()
  return spelling
}

function isSpelled(token: Token): token is Token & { kind: SpellingKind; value: string } {
  return (
    (token.kind === 'keyword' ||
      token.kind === 'type' ||
      token.kind === 'builtin' ||
      token.kind === 'operator') &&
    typeof token.value === 'string'
  )
}

/**
 * Spec §8.4: re-spell every keyword, type, builtin and operator token with the target's primary
 * spelling; everything else (identifiers, literals, comments, whitespace) keeps its text.
 * Options are not translated — per-profile example overrides exist for that.
 */
export function transpose(source: string, from: ResolvedProfile, to: ResolvedProfile): string {
  if (from === to) return source
  const { tokens } = tokenize(source, from)
  let out = ''
  for (const token of tokens) {
    if (token.kind === 'eof') break
    if (isSpelled(token)) {
      const spelling = primarySpelling(to, token.kind, token.value)
      out += spelling === undefined ? token.text : matchCase(token.text, spelling)
    } else {
      out += token.text
    }
  }
  return out
}
