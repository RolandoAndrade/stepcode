import type { ResolvedProfile } from '@stepcode/profiles'
import {
  caseFlag,
  hasLetter,
  isMultiWord,
  WORD_END,
  WORD_START,
  type WordOptions,
  wordAlternation,
  wordRule,
} from './regex'
import { PATTERN_ORDER, WORD_FAMILIES, type WordSection } from './scopes'
import type { GenerateOptions, TextMateGrammar, TextMateRule } from './types'

export function wordOptions(profile: ResolvedProfile): WordOptions {
  return {
    caseSensitive: profile.options.caseSensitive,
    foldAccents: profile.options.foldAccents,
  }
}

/** Letter-bearing spellings of some keys; symbols such as `&` belong to the operator rules. */
export function spellingsOf(
  profile: ResolvedProfile,
  section: WordSection,
  keys: readonly string[],
): string[] {
  const table = profile[section] as Record<string, readonly string[]>
  return keys.flatMap((key) => table[key] ?? []).filter(hasLetter)
}

function wordFamilyRules(profile: ResolvedProfile, repository: Record<string, TextMateRule>): void {
  const options = wordOptions(profile)
  const groups: string[] = []
  const captures: Record<string, TextMateRule> = {}
  for (const family of WORD_FAMILIES) {
    const spellings = spellingsOf(profile, family.section, family.keys)
    const multi = spellings.filter(isMultiWord)
    const single = spellings.filter((spelling) => !isMultiWord(spelling))
    if (multi.length > 0) {
      groups.push(`(${wordAlternation(multi, options)})`)
      captures[String(groups.length)] = { name: family.scope }
    }
    if (single.length > 0) {
      repository[family.id] = { name: family.scope, match: wordRule(single, options) }
    }
  }
  if (groups.length > 0) {
    repository.multiword = {
      match: `${caseFlag(options)}${WORD_START}(?:${groups.join('|')})${WORD_END}`,
      captures,
    }
  }
}

export function generateGrammar(
  profile: ResolvedProfile,
  options: GenerateOptions,
): TextMateGrammar {
  const repository: Record<string, TextMateRule> = {}
  wordFamilyRules(profile, repository)
  const grammar: TextMateGrammar = {
    name: options.name,
    scopeName: options.scopeName,
    patterns: PATTERN_ORDER.filter((id) => id in repository).map((id) => ({ include: `#${id}` })),
    repository,
  }
  if (options.displayName !== undefined) grammar.displayName = options.displayName
  if (options.aliases !== undefined) grammar.aliases = [...options.aliases]
  return grammar
}
