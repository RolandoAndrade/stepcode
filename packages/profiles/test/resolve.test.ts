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

describe('resolveProfile — validation', () => {
  it('requires at least one spelling per key except case', () => {
    const input = base()
    input.keywords.if = []
    expect(() => resolveProfile(input)).toThrow(
      expect.objectContaining({ code: 'PROFILE_MISSING_SPELLING', path: ['keywords', 'if'] }),
    )
    const okay = base()
    okay.keywords.case = []
    expect(() => resolveProfile(okay)).not.toThrow()
  })

  it('rejects spellings that are empty, contain punctuation, or start with a digit', () => {
    for (const bad of ['', 'Si;', 'Si,No', 'Si(', '1Si', 'Si"']) {
      const input = base()
      input.keywords.if = [bad]
      expect(() => resolveProfile(input)).toThrow(
        expect.objectContaining({ code: 'PROFILE_INVALID_SPELLING', path: ['keywords', 'if'] }),
      )
    }
  })

  it('allows symbolic spellings for word operators (& | ~ %)', () => {
    const input = base()
    input.keywords.and = ['Y', '&']
    input.keywords.mod = ['MOD', '%']
    expect(() => resolveProfile(input)).not.toThrow()
  })

  it('detects a collision between two keywords', () => {
    const input = base()
    input.keywords.else = ['Si']
    expect(() => resolveProfile(input)).toThrow(
      expect.objectContaining({ code: 'PROFILE_COLLISION' }),
    )
  })

  it('detects a keyword/type and a keyword/builtin collision', () => {
    const a = base()
    a.types.integer = ['Si']
    expect(() => resolveProfile(a)).toThrow(expect.objectContaining({ code: 'PROFILE_COLLISION' }))
    const b = base()
    b.builtins.abs = ['si']
    expect(() => resolveProfile(b)).toThrow(expect.objectContaining({ code: 'PROFILE_COLLISION' }))
  })

  it('detects an operator collision separately from words', () => {
    const input = base()
    input.operators.lt = ['<']
    input.operators.assign = ['<']
    // Collisions are reported on the key processed second, in OPERATOR_KEYS order.
    expect(() => resolveProfile(input)).toThrow(
      expect.objectContaining({ code: 'PROFILE_COLLISION', path: ['operators', 'lt'] }),
    )
  })

  it('a collision that only appears after folding is caught only when folding is on', () => {
    const folded = base()
    folded.keywords.else = ['sí']
    expect(() => resolveProfile(folded)).toThrow(
      expect.objectContaining({ code: 'PROFILE_COLLISION' }),
    )
    const unfolded = { ...folded, options: { foldAccents: false, caseSensitive: true } }
    expect(() => resolveProfile(unfolded)).not.toThrow()
  })

  it('names both keys in the collision message', () => {
    const input = base()
    input.keywords.else = ['Si']
    expect(() => resolveProfile(input)).toThrow(
      /keywords\.if.*keywords\.else|keywords\.else.*keywords\.if/,
    )
  })
})

describe('resolveProfile — lookup tables', () => {
  it('maps every normalized spelling to its construct', () => {
    const input = base()
    input.keywords.writeNoNewline = ['Escribir Sin Saltar']
    input.types.boolean = ['Lógico']
    input.builtins.sqrt = ['RC', 'Raiz']
    const resolved = resolveProfile(input)
    expect(resolved.lookup.get('si')).toEqual({ kind: 'keyword', key: 'if' })
    expect(resolved.lookup.get('escribir sin saltar')).toEqual({
      kind: 'keyword',
      key: 'writeNoNewline',
    })
    expect(resolved.lookup.get('logico')).toEqual({ kind: 'type', key: 'boolean' })
    expect(resolved.lookup.get('raiz')).toEqual({ kind: 'builtin', key: 'sqrt' })
    expect(resolved.lookup.get('Si')).toBeUndefined()
  })

  it('operator lookup is exact (no folding)', () => {
    const resolved = resolveProfile(base())
    for (const key of Object.keys(resolved.operators)) {
      for (const spelling of resolved.operators[key as keyof typeof resolved.operators]) {
        expect(resolved.operatorLookup.get(spelling)).toBe(key)
      }
    }
  })

  it('reports maxWords from the longest multi-word spelling', () => {
    const input = base()
    input.keywords.writeNoNewline = ['Escribir Sin Saltar']
    expect(resolveProfile(input).maxWords).toBe(3)
    expect(resolveProfile(base()).maxWords).toBe(1)
  })

  it('normalize on the resolved profile matches the options', () => {
    const resolved = resolveProfile({ ...base(), options: { caseSensitive: true } })
    expect(resolved.normalize('Función')).toBe('Funcion')
  })
})
