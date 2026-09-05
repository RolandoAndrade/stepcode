import { profiles } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { EXAMPLES, exampleSource, findExample, TOPICS } from '../src/examples/index'

describe('examples', () => {
  it('lists every topic in order and at least two examples per topic', () => {
    expect(TOPICS).toEqual([
      'primeros-pasos',
      'condicionales',
      'ciclos',
      'arreglos',
      'funciones',
      'un-poco-mas',
    ])
    for (const topic of TOPICS) {
      expect(EXAMPLES.filter((example) => example.topic === topic).length).toBeGreaterThanOrEqual(2)
    }
    expect(EXAMPLES.map((e) => e.topic)).toEqual(
      [...EXAMPLES]
        .sort((a, b) => TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic))
        .map((e) => e.topic),
    )
  })

  it('has a title, a description, a unique id and a body without the header', () => {
    const ids = new Set<string>()
    for (const example of EXAMPLES) {
      expect(example.title.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
      expect(example.source.startsWith('//')).toBe(false)
      expect(ids.has(example.id)).toBe(false)
      ids.add(example.id)
    }
    expect(findExample('primeros-pasos/hola-mundo')?.title).toBe('Hola mundo')
    expect(findExample('nope')).toBeUndefined()
  })

  it.each([['es'], ['en'], ['pseint']] as const)(
    'compiles clean under %s (transposed or overridden)',
    (id) => {
      const profile = profiles[id]
      for (const example of EXAMPLES) {
        const source = exampleSource(example, profile)
        const { diagnostics } = compile(source, { profile })
        expect(diagnostics, `${example.id} under ${id}`).toEqual([])
      }
    },
  )
})
