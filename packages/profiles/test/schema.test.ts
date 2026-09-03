import { describe, expect, it } from 'vitest'
import { BUILTIN_KEYS, KEYWORD_KEYS, OPERATOR_KEYS, TYPE_KEYS } from '../src/keys'
import {
  DEFAULT_OPTIONS,
  ProfileInputSchema,
  profileJsonSchema,
  ResolvedProfileDataSchema,
} from '../src/schema'
import { completeInput } from './helpers'

describe('key lists', () => {
  it('contain the construct inventory from the spec', () => {
    expect(KEYWORD_KEYS).toContain('writeNoNewline')
    expect(KEYWORD_KEYS).toContain('case')
    expect(TYPE_KEYS).toEqual(['integer', 'real', 'string', 'char', 'boolean'])
    expect(OPERATOR_KEYS).toContain('comment')
    expect(BUILTIN_KEYS).toContain('randomBetween')
    expect(BUILTIN_KEYS).not.toContain('writeln')
  })
})

describe('ProfileInputSchema', () => {
  it('accepts a complete profile', () => {
    expect(ProfileInputSchema.safeParse(completeInput()).success).toBe(true)
  })

  it('accepts a partial profile when extends is set', () => {
    const result = ProfileInputSchema.safeParse({
      id: 'x',
      extends: 'es',
      keywords: { if: ['Cuando'] },
    })
    expect(result.success).toBe(true)
  })

  it('rejects a partial profile without extends', () => {
    const result = ProfileInputSchema.safeParse({ id: 'x', locale: 'es', keywords: { if: ['Si'] } })
    expect(result.success).toBe(false)
  })

  it('rejects unknown keys', () => {
    const input = completeInput() as Record<string, unknown>
    ;(input.keywords as Record<string, unknown>).goto = ['Goto']
    expect(ProfileInputSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a non-array spelling', () => {
    const input = completeInput()
    ;(input.keywords as Record<string, unknown>).if = 'Si'
    expect(ProfileInputSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a malformed locale tag', () => {
    expect(ProfileInputSchema.safeParse({ ...completeInput(), locale: 'Spanish' }).success).toBe(
      false,
    )
    expect(ProfileInputSchema.safeParse({ ...completeInput(), locale: 'pt-BR' }).success).toBe(true)
  })

  it('rejects an invalid option value', () => {
    const input = { ...completeInput(), options: { indexBase: 2 } }
    expect(ProfileInputSchema.safeParse(input).success).toBe(false)
  })
})

describe('defaults and resolved schema', () => {
  it('has the exact option defaults from the spec', () => {
    expect(DEFAULT_OPTIONS).toEqual({
      indexBase: 1,
      caseSensitive: false,
      foldAccents: true,
      implicitDeclarations: false,
      requireSemicolons: true,
      typedParameters: true,
      assignWithEquals: false,
    })
  })

  it('requires every key and every option in resolved data', () => {
    const data = { ...completeInput(), options: DEFAULT_OPTIONS }
    expect(ResolvedProfileDataSchema.safeParse(data).success).toBe(true)
    const { if: _dropped, ...keywords } = data.keywords
    expect(ResolvedProfileDataSchema.safeParse({ ...data, keywords }).success).toBe(false)
  })

  it('exposes a JSON schema with the four sections', () => {
    const props = (profileJsonSchema as { properties: Record<string, unknown> }).properties
    expect(Object.keys(props)).toEqual(
      expect.arrayContaining([
        'id',
        'locale',
        'keywords',
        'types',
        'operators',
        'builtins',
        'options',
      ]),
    )
  })
})
