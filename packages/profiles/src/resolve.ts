import { ProfileError } from './errors'
import type { BuiltinKey, KeywordKey, OperatorKey, TypeKey } from './keys'
import { BUILTIN_KEYS, KEYWORD_KEYS, OPERATOR_KEYS, OPTIONAL_KEYWORD_KEYS, TYPE_KEYS } from './keys'
import { collapseWhitespace, createNormalizer, type Normalizer } from './normalize'
import {
  DEFAULT_OPTIONS,
  type ProfileData,
  type ProfileInput,
  ProfileInputSchema,
  ResolvedProfileDataSchema,
} from './schema'

/** Spellings may not contain punctuation the lexer owns, and may not look like numbers. */
const FORBIDDEN_IN_SPELLING = /[;,()[\]"']/
const LEADING_DIGIT = /^\d/

export type ProfileRegistry = ReadonlyMap<string, ProfileInput>

export type LookupKind = 'keyword' | 'type' | 'builtin'

export interface LookupEntry {
  readonly kind: LookupKind
  readonly key: KeywordKey | TypeKey | BuiltinKey
}

export interface ResolvedProfile extends ProfileData {
  /** normalized spelling → construct, for keywords, types and builtins */
  readonly lookup: ReadonlyMap<string, LookupEntry>
  /** exact operator spelling → operator key */
  readonly operatorLookup: ReadonlyMap<string, OperatorKey>
  /** words in the longest multi-word spelling (for longest-match lexing) */
  readonly maxWords: number
  /** the normalizer the resolver used; the lexer must use the same one */
  readonly normalize: Normalizer
}

export const MAX_EXTENDS_DEPTH = 8

type Sections = Pick<ProfileData, 'keywords' | 'types' | 'operators' | 'builtins'>

function parseInput(input: unknown, path: readonly string[]): ProfileInput {
  const result = ProfileInputSchema.safeParse(input)
  if (!result.success) {
    const issue = result.error.issues[0]
    const issuePath = issue ? issue.path.map(String) : []
    throw new ProfileError(
      'PROFILE_INVALID',
      issue ? `${issuePath.join('.') || '<root>'}: ${issue.message}` : 'invalid profile',
      [...path, ...issuePath],
    )
  }
  return result.data
}

function mergeSection<K extends string>(
  keys: readonly K[],
  parent: Partial<Record<K, readonly string[]>> | undefined,
  child: Partial<Record<K, readonly string[]>> | undefined,
): Partial<Record<K, readonly string[]>> {
  const out: Partial<Record<K, readonly string[]>> = {}
  for (const key of keys) {
    const value = child?.[key] ?? parent?.[key]
    if (value !== undefined) out[key] = value
  }
  return out
}

interface Flattened {
  id: string
  locale: string | undefined
  sections: { [S in keyof Sections]: Partial<Sections[S]> }
  options: Partial<ProfileData['options']>
}

function flatten(input: ProfileInput, registry: ProfileRegistry, seen: string[]): Flattened {
  if (seen.length > MAX_EXTENDS_DEPTH) {
    throw new ProfileError(
      'PROFILE_DEPTH',
      `extends chain deeper than ${MAX_EXTENDS_DEPTH}: ${seen.join(' -> ')}`,
      ['extends'],
    )
  }
  if (seen.includes(input.id)) {
    throw new ProfileError('PROFILE_CYCLE', `extends cycle: ${[...seen, input.id].join(' -> ')}`, [
      'extends',
    ])
  }
  const own: Flattened = {
    id: input.id,
    locale: input.locale,
    sections: {
      keywords: input.keywords ?? {},
      types: input.types ?? {},
      operators: input.operators ?? {},
      builtins: input.builtins ?? {},
    },
    options: (input.options ?? {}) as Partial<ProfileData['options']>,
  }
  const extendsId = 'extends' in input ? input.extends : undefined
  if (extendsId === undefined) return own

  const parentInput = registry.get(extendsId)
  if (parentInput === undefined) {
    throw new ProfileError('PROFILE_UNKNOWN_PARENT', `unknown parent profile "${extendsId}"`, [
      'extends',
    ])
  }
  const parent = flatten(parseInput(parentInput, ['extends']), registry, [...seen, input.id])
  return {
    id: own.id,
    locale: own.locale ?? parent.locale,
    sections: {
      keywords: mergeSection(KEYWORD_KEYS, parent.sections.keywords, own.sections.keywords),
      types: mergeSection(TYPE_KEYS, parent.sections.types, own.sections.types),
      operators: mergeSection(OPERATOR_KEYS, parent.sections.operators, own.sections.operators),
      builtins: mergeSection(BUILTIN_KEYS, parent.sections.builtins, own.sections.builtins),
    },
    options: { ...parent.options, ...own.options },
  }
}

function cleanSpellings<K extends string>(
  section: Partial<Record<K, readonly string[]>>,
): Partial<Record<K, readonly string[]>> {
  const out: Partial<Record<K, readonly string[]>> = {}
  for (const [key, spellings] of Object.entries(section) as [K, readonly string[]][]) {
    out[key] = Object.freeze([...new Set(spellings.map(collapseWhitespace))])
  }
  return out
}

function deepFreeze<T extends object>(value: T): T {
  for (const nested of Object.values(value)) {
    if (typeof nested === 'object' && nested !== null && !Object.isFrozen(nested))
      deepFreeze(nested)
  }
  return Object.freeze(value)
}

export function resolveProfile(
  input: unknown,
  registry: ProfileRegistry = new Map(),
): ResolvedProfile {
  const parsed = parseInput(input, [])
  const flat = flatten(parsed, registry, [])
  const candidate = {
    id: flat.id,
    locale: flat.locale,
    keywords: cleanSpellings(flat.sections.keywords),
    types: cleanSpellings(flat.sections.types),
    operators: cleanSpellings(flat.sections.operators),
    builtins: cleanSpellings(flat.sections.builtins),
    options: { ...DEFAULT_OPTIONS, ...flat.options },
  }
  const checked = ResolvedProfileDataSchema.safeParse(candidate)
  if (!checked.success) {
    const issue = checked.error.issues[0]
    throw new ProfileError(
      'PROFILE_INVALID',
      issue ? `${issue.path.map(String).join('.')}: ${issue.message}` : 'invalid profile',
      issue ? issue.path.map(String) : [],
    )
  }
  const data = checked.data
  const normalize = createNormalizer(data.options)
  const { lookup, operatorLookup, maxWords } = buildLookups(data, normalize)
  return deepFreeze({ ...data, lookup, operatorLookup, maxWords, normalize })
}

type WordSectionName = 'keywords' | 'types' | 'builtins'

const WORD_SECTIONS: readonly [WordSectionName, LookupKind][] = [
  ['keywords', 'keyword'],
  ['types', 'type'],
  ['builtins', 'builtin'],
]

function validateSpelling(section: string, key: string, spelling: string): void {
  if (
    spelling.length === 0 ||
    FORBIDDEN_IN_SPELLING.test(spelling) ||
    LEADING_DIGIT.test(spelling)
  ) {
    throw new ProfileError(
      'PROFILE_INVALID_SPELLING',
      `${section}.${key}: "${spelling}" is not a valid spelling`,
      [section, key],
    )
  }
}

function buildLookups(
  data: ProfileData,
  normalize: Normalizer,
): Pick<ResolvedProfile, 'lookup' | 'operatorLookup' | 'maxWords'> {
  const lookup = new Map<string, LookupEntry>()
  const owner = new Map<string, string>()
  let maxWords = 1

  for (const [section, kind] of WORD_SECTIONS) {
    for (const [key, spellings] of Object.entries(data[section])) {
      if (
        spellings.length === 0 &&
        !(section === 'keywords' && OPTIONAL_KEYWORD_KEYS.includes(key as KeywordKey))
      ) {
        throw new ProfileError('PROFILE_MISSING_SPELLING', `${section}.${key} has no spelling`, [
          section,
          key,
        ])
      }
      for (const spelling of spellings) {
        validateSpelling(section, key, spelling)
        const normalized = normalize(spelling)
        const previous = owner.get(normalized)
        if (previous !== undefined && previous !== `${section}.${key}`) {
          throw new ProfileError(
            'PROFILE_COLLISION',
            `"${spelling}" is spelled for both ${previous} and ${section}.${key}`,
            [section, key],
          )
        }
        owner.set(normalized, `${section}.${key}`)
        lookup.set(normalized, { kind, key: key as LookupEntry['key'] })
        maxWords = Math.max(maxWords, normalized.split(' ').length)
      }
    }
  }

  const operatorLookup = new Map<string, OperatorKey>()
  for (const [key, spellings] of Object.entries(data.operators) as [
    OperatorKey,
    readonly string[],
  ][]) {
    if (spellings.length === 0) {
      throw new ProfileError('PROFILE_MISSING_SPELLING', `operators.${key} has no spelling`, [
        'operators',
        key,
      ])
    }
    for (const spelling of spellings) {
      if (spelling.length === 0 || /\s/.test(spelling)) {
        throw new ProfileError(
          'PROFILE_INVALID_SPELLING',
          `operators.${key}: "${spelling}" is not a valid operator spelling`,
          ['operators', key],
        )
      }
      const previous = operatorLookup.get(spelling)
      if (previous !== undefined && previous !== key) {
        throw new ProfileError(
          'PROFILE_COLLISION',
          `"${spelling}" is spelled for both operators.${previous} and operators.${key}`,
          ['operators', key],
        )
      }
      operatorLookup.set(spelling, key)
    }
  }

  return { lookup, operatorLookup, maxWords }
}
