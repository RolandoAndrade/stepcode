import { builtinProfiles, profiles, type ResolvedProfile, resolveProfile } from '@stepcode/profiles'
import type { BundledLanguage, Highlighter } from 'shiki'
import { type TokenKind, tokenize } from 'stepcode'
import { beforeAll, describe, expect, it } from 'vitest'
import { generateGrammar, grammars } from '../src/index'
import { type EngineName, makeHighlighters, readSample } from './helpers'

const strictProfile = resolveProfile(
  {
    id: 'strict',
    extends: 'en',
    keywords: { if: ['When'] },
    options: { caseSensitive: true, foldAccents: false },
  },
  builtinProfiles,
)
const strict = generateGrammar(strictProfile, {
  name: 'stepcode-strict',
  scopeName: 'source.stepcode.strict',
})

/** Which deepest-scope prefixes a lexer token kind may carry. */
const FAMILIES: Partial<Record<TokenKind, readonly string[]>> = {
  keyword: ['keyword.', 'storage.', 'constant.language.boolean.'],
  type: ['support.type.'],
  builtin: ['support.function.builtin.'],
  operator: ['keyword.operator.'],
  identifier: ['variable.', 'entity.name.function'],
  integer: ['constant.numeric.integer.'],
  real: ['constant.numeric.real.'],
  string: ['string.quoted.'],
  comment: ['comment.line.'],
  punct: ['punctuation.'],
}

interface Case {
  sample: string
  lang: string
  profile: ResolvedProfile
}
const cases: Case[] = [
  { sample: 'es', lang: 'stepcode', profile: profiles.es },
  { sample: 'es', lang: 'stepcode-pseint', profile: profiles.pseint },
  { sample: 'en', lang: 'stepcode-en', profile: profiles.en },
  { sample: 'custom', lang: 'stepcode-strict', profile: strictProfile },
]

let highlighters: Record<EngineName, Highlighter>
beforeAll(async () => {
  highlighters = await makeHighlighters([...grammars, strict])
})

/** Deepest scope at each source offset, from Shiki's per-line tokens. */
function scopeAtOffsets(highlighter: Highlighter, lang: string, code: string): string[] {
  const lines = highlighter.codeToTokensBase(code, {
    lang: lang as BundledLanguage,
    theme: 'github-light',
    includeExplanation: 'scopeName',
  })
  const scopes: string[] = new Array(code.length).fill('')
  let lineStart = 0
  const sourceLines = code.split('\n')
  lines.forEach((tokens, index) => {
    let offset = lineStart
    for (const token of tokens) {
      for (const part of token.explanation ?? []) {
        const scope = part.scopes.at(-1)?.scopeName ?? ''
        for (let i = 0; i < part.content.length; i++) scopes[offset + i] = scope
        offset += part.content.length
      }
    }
    lineStart += (sourceLines[index]?.length ?? 0) + 1
  })
  return scopes
}

describe.each(['javascript', 'oniguruma'] as const)('%s engine agrees with the lexer', (engine) => {
  it.each(cases)('$sample under $lang', ({ sample, lang, profile }) => {
    const code = readSample(sample)
    const scopes = scopeAtOffsets(highlighters[engine], lang, code)
    const mismatches: string[] = []
    let checked = 0
    for (const token of tokenize(code, profile).tokens) {
      const allowed = FAMILIES[token.kind]
      if (allowed === undefined) continue
      checked++
      const scope = scopes[token.span.start] ?? ''
      if (!allowed.some((prefix) => scope.startsWith(prefix))) {
        mismatches.push(
          `${token.kind} ${JSON.stringify(token.text)} @${token.span.start} got ${scope || '(none)'}`,
        )
      }
    }
    expect(mismatches).toEqual([])
    expect(checked).toBeGreaterThan(50)
  })
})
