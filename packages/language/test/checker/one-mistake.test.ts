import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { profileNamed } from '../helpers'

const dir = fileURLToPath(new URL('../corpus/programs', import.meta.url))
const zeroBased = new Set(
  readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
    .split('\n')
    .filter((line) => line.length > 0),
)
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

interface Mutation {
  readonly name: string
  /** The mutated source, or `undefined` when this program has nothing to mutate. */
  apply(source: string): string | undefined
}

const mutations: Mutation[] = [
  {
    name: 'delete one Definir of a single name',
    apply: (source) => {
      const match =
        /^[ \t]*Definir[ \t]+([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)[ \t]+[Cc]omo[ \t]+[^;,\n]*;?[ \t]*\n/m.exec(
          source,
        )
      if (match === null) return undefined
      return source.slice(0, match.index) + source.slice(match.index + match[0].length)
    },
  },
  {
    name: 'misspell the last use of a name',
    apply: (source) => {
      const match = /Escribir[ \t]+([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)[ \t]*;/g
      const all = [...source.matchAll(match)]
      const last = all[all.length - 1]
      if (last === undefined || last.index === undefined) return undefined
      const name = last[1] as string
      const at = source.indexOf(name, last.index)
      return `${source.slice(0, at)}${name}qz${source.slice(at + name.length)}`
    },
  },
  {
    name: 'swap one literal for a text',
    apply: (source) => {
      const match = /Escribir[ \t]+(\d+)[ \t]*;/.exec(source)
      if (match === null || match.index === undefined) return undefined
      const at = source.indexOf(match[1] as string, match.index)
      // `Escribir` takes any scalar, so the literal is swapped inside a numeric builtin call.
      return `${source.slice(0, at)}Longitud(${match[1]})${source.slice(at + (match[1] as string).length)}`
    },
  },
  {
    name: 'drop the last argument of a call',
    apply: (source) => {
      const match = /([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)\(([^()\n]+),[ \t]*([^(),\n]+)\)[ \t]*;/.exec(
        source,
      )
      if (match === null || match.index === undefined) return undefined
      return `${source.slice(0, match.index)}${match[1]}(${match[2]});${source.slice(
        match.index + match[0].length,
      )}`
    },
  },
  {
    name: 'change one operator',
    apply: (source) => {
      const match = /(\w)[ \t]\+[ \t](\w)/.exec(source)
      if (match === null || match.index === undefined) return undefined
      return `${source.slice(0, match.index)}${match[1]} Y ${match[2]}${source.slice(
        match.index + match[0].length,
      )}`
    },
  },
]

/**
 * Programs whose mutation is not a single mistake — the mutated text happens to break two
 * unrelated things at once. Each entry needs a one-line reason; an unexplained entry is a way
 * of hiding a real cascade, which is exactly what this test exists to catch.
 */
const skip: ReadonlySet<string> = new Set<string>([])

describe('one mistake, one diagnostic', () => {
  for (const file of files) {
    const slug = file.replace('.stepcode', '')
    const profile = profileNamed(zeroBased.has(slug) ? 'es0' : 'es')
    const source = readFileSync(join(dir, file), 'utf8')
    for (const mutation of mutations) {
      const key = `${slug}::${mutation.name}`
      if (skip.has(key)) continue
      const mutated = mutation.apply(source)
      if (mutated === undefined || mutated === source) continue
      it(`${file}: ${mutation.name}`, () => {
        const before = compile(source, { profile }).diagnostics.filter(
          (one) => one.severity === 'error',
        )
        expect(before).toEqual([])
        const after = compile(mutated, { profile }).diagnostics.filter(
          (one) => one.severity === 'error',
        )
        expect(
          after.map((one) => `${one.code}@${mutated.slice(one.span.start, one.span.end)}`),
        ).toHaveLength(1)
      })
    }
  }
})
