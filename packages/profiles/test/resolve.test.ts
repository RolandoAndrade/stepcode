import { describe, expect, it } from 'vitest'
import { ProfileError } from '../src/errors'
import { type ResolvedProfile, resolveProfile } from '../src/resolve'
import type { ProfileInput } from '../src/schema'
import { completeInput } from './helpers'

// No `: ProfileInput` annotation: keeping the literal type (all sections required, no
// `extends`) lets later mutations like `input.keywords.if = [...]` typecheck without a
// possibly-undefined narrowing. `resolveProfile` takes `unknown`, so nothing needs the
// widened union type; `registry()`'s `ProfileInput[]` accepts this narrower shape fine.
const base = () => ({
  ...completeInput(),
  id: 'base',
  // biome-ignore lint/suspicious/noThenProperty: `then` is a real DSL keyword key, not a thenable.
  keywords: { ...completeInput().keywords, if: ['Si'], then: ['Entonces'] },
})

const registry = (...profiles: ProfileInput[]) => new Map(profiles.map((p) => [p.id, p]))

describe('resolveProfile — root profiles', () => {
  it('fills option defaults', () => {
    const resolved = resolveProfile(base(), registry())
    expect(resolved.options).toEqual({
      indexBase: 1,
      caseSensitive: false,
      foldAccents: true,
      implicitDeclarations: false,
      requireSemicolons: true,
      typedParameters: true,
      assignWithEquals: false,
    })
  })

  it('keeps explicit options', () => {
    const resolved = resolveProfile({ ...base(), options: { indexBase: 0 } }, registry())
    expect(resolved.options.indexBase).toBe(0)
    expect(resolved.options.requireSemicolons).toBe(true)
  })

  it('trims, collapses whitespace and dedupes spellings', () => {
    const input = base()
    input.keywords.writeNoNewline = [
      ' Escribir  Sin  Saltar',
      'Escribir Sin Saltar',
      'Mostrar Sin Saltar',
    ]
    const resolved = resolveProfile(input, registry())
    expect(resolved.keywords.writeNoNewline).toEqual(['Escribir Sin Saltar', 'Mostrar Sin Saltar'])
  })

  it('returns frozen data and drops extends', () => {
    const resolved = resolveProfile(base(), registry())
    expect(Object.isFrozen(resolved)).toBe(true)
    expect(Object.isFrozen(resolved.keywords)).toBe(true)
    expect('extends' in resolved).toBe(false)
  })

  it('throws PROFILE_INVALID for schema failures, with a path', () => {
    expect.assertions(2)
    try {
      resolveProfile({ ...base(), locale: 'nope!' }, registry())
    } catch (error) {
      expect(error).toBeInstanceOf(ProfileError)
      expect((error as ProfileError).code).toBe('PROFILE_INVALID')
    }
  })
})

describe('resolveProfile — extends', () => {
  it('merges per key: a child array replaces only that key', () => {
    const child: ProfileInput = { id: 'child', extends: 'base', keywords: { if: ['Cuando'] } }
    const resolved = resolveProfile(child, registry(base()))
    expect(resolved.id).toBe('child')
    expect(resolved.keywords.if).toEqual(['Cuando'])
    expect(resolved.keywords.then).toEqual(['Entonces'])
    expect(resolved.locale).toBe('es')
  })

  it('merges options field by field across a chain of depth 2', () => {
    const mid: ProfileInput = { id: 'mid', extends: 'base', options: { requireSemicolons: false } }
    const leaf: ProfileInput = { id: 'leaf', extends: 'mid', options: { indexBase: 0 } }
    const resolved = resolveProfile(leaf, registry(base(), mid))
    expect(resolved.options.requireSemicolons).toBe(false)
    expect(resolved.options.indexBase).toBe(0)
    expect(resolved.options.foldAccents).toBe(true)
  })

  it('a child that changes nothing equals its parent except id', () => {
    const parent = resolveProfile(base(), registry())
    const child = resolveProfile({ id: 'x', extends: 'base' }, registry(base()))
    // `normalize` is a fresh closure per resolution; compare everything else.
    const strip = ({ normalize: _normalize, ...rest }: ResolvedProfile) => rest
    expect({ ...strip(child), id: 'base' }).toEqual(strip(parent))
  })

  it('throws PROFILE_UNKNOWN_PARENT', () => {
    expect(() => resolveProfile({ id: 'x', extends: 'missing' }, registry())).toThrow(
      expect.objectContaining({ code: 'PROFILE_UNKNOWN_PARENT' }),
    )
  })

  it('throws PROFILE_CYCLE', () => {
    const a: ProfileInput = { id: 'a', extends: 'b' }
    const b: ProfileInput = { id: 'b', extends: 'a' }
    expect(() => resolveProfile(a, registry(a, b))).toThrow(
      expect.objectContaining({ code: 'PROFILE_CYCLE' }),
    )
  })

  it('throws PROFILE_DEPTH past 8 levels', () => {
    const chain: ProfileInput[] = [base()]
    for (let i = 1; i <= 9; i++)
      chain.push({ id: `p${i}`, extends: i === 1 ? 'base' : `p${i - 1}` })
    expect(() => resolveProfile(chain[9], registry(...chain))).toThrow(
      expect.objectContaining({ code: 'PROFILE_DEPTH' }),
    )
  })

  it('the registry is not required for root profiles', () => {
    expect(() => resolveProfile(base())).not.toThrow()
  })
})
