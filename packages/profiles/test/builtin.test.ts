import { describe, expect, it } from 'vitest'
import { builtinProfiles, defaultProfile, profiles, resolveProfile } from '../src/index'
import { BUILTIN_KEYS, KEYWORD_KEYS, TYPE_KEYS } from '../src/keys'

describe('shipped profiles', () => {
  it('es, en and pseint resolve', () => {
    expect(profiles.es.id).toBe('es')
    expect(profiles.en.id).toBe('en')
    expect(profiles.pseint.id).toBe('pseint')
    expect(defaultProfile).toBe(profiles.es)
  })

  it('every spelling of every shipped profile resolves to its key', () => {
    for (const profile of [profiles.es, profiles.en]) {
      for (const key of KEYWORD_KEYS) {
        for (const spelling of profile.keywords[key]) {
          expect(profile.lookup.get(profile.normalize(spelling))).toEqual({ kind: 'keyword', key })
        }
      }
      for (const key of TYPE_KEYS) {
        for (const spelling of profile.types[key]) {
          expect(profile.lookup.get(profile.normalize(spelling))).toEqual({ kind: 'type', key })
        }
      }
      for (const key of BUILTIN_KEYS) {
        for (const spelling of profile.builtins[key]) {
          expect(profile.lookup.get(profile.normalize(spelling))).toEqual({ kind: 'builtin', key })
        }
      }
    }
  })

  it('es has the spec spellings', () => {
    expect(profiles.es.keywords.program).toEqual(['Proceso', 'Algoritmo'])
    expect(profiles.es.keywords.writeNoNewline).toEqual([
      'Escribir Sin Saltar',
      'Mostrar Sin Saltar',
    ])
    expect(profiles.es.keywords.case).toEqual([])
    expect(profiles.es.types.string).toEqual(['Cadena', 'Caracteres', 'Texto'])
    expect(profiles.es.builtins.random).toEqual(['Azar'])
    expect(profiles.es.builtins.randomBetween).toEqual(['Aleatorio'])
    expect(profiles.es.operators.assign).toEqual(['<-', '←'])
    expect(profiles.es.operators.equal).toEqual(['='])
    expect(profiles.es.maxWords).toBe(3)
    expect(profiles.es.locale).toBe('es')
  })

  it('es carries the v1 extensions: DIV, ** and ConvertirACadena', () => {
    expect(profiles.es.keywords.div).toEqual(['DIV'])
    expect(profiles.es.operators.power).toEqual(['^', '**'])
    expect(profiles.es.builtins.toText).toEqual(['ConvertirATexto', 'ConvertirACadena'])
    expect(profiles.es.lookup.get('div')).toEqual({ kind: 'keyword', key: 'div' })
    expect(profiles.es.operatorLookup.get('**')).toBe('power')
  })

  it('en carries DIV and **', () => {
    expect(profiles.en.keywords.div).toEqual(['Div'])
    expect(profiles.en.operators.power).toEqual(['^', '**'])
  })

  it('en has the spec spellings', () => {
    expect(profiles.en.keywords.program).toEqual(['Program'])
    expect(profiles.en.keywords.write).toEqual(['Write', 'Print'])
    expect(profiles.en.types.string).toEqual(['String', 'Text'])
    expect(profiles.en.builtins.sqrt).toEqual(['Sqrt'])
    expect(profiles.en.locale).toBe('en')
  })

  it('pseint is es plus its three options', () => {
    expect(profiles.pseint.keywords).toEqual(profiles.es.keywords)
    expect(profiles.pseint.options).toEqual({
      ...profiles.es.options,
      requireSemicolons: false,
      implicitDeclarations: true,
      typedParameters: false,
    })
  })

  it('== is not an equality spelling in any shipped profile', () => {
    for (const profile of Object.values(profiles)) {
      expect(profile.operatorLookup.has('==')).toBe(false)
    }
  })

  it('lookup size equals the number of distinct normalized spellings', () => {
    const profile = profiles.es
    const distinct = new Set<string>()
    for (const key of KEYWORD_KEYS) {
      for (const spelling of profile.keywords[key]) distinct.add(profile.normalize(spelling))
    }
    for (const key of TYPE_KEYS) {
      for (const spelling of profile.types[key]) distinct.add(profile.normalize(spelling))
    }
    for (const key of BUILTIN_KEYS) {
      for (const spelling of profile.builtins[key]) distinct.add(profile.normalize(spelling))
    }
    expect(profile.lookup.size).toBe(distinct.size)
  })

  it('the registry resolves user profiles that extend a shipped one', () => {
    const custom = resolveProfile(
      { id: 'clase', extends: 'es', keywords: { if: ['Cuando'] } },
      builtinProfiles,
    )
    expect(custom.keywords.if).toEqual(['Cuando'])
    expect(custom.keywords.then).toEqual(['Entonces'])
    expect(builtinProfiles.has('pseint')).toBe(true)
  })
})
