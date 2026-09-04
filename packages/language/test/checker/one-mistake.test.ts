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
  /**
   * The fewest corpus programs this mutation must reach. `apply` returns `undefined` on a
   * regex miss and the harness moves on, so a corpus reformat could quietly retire a whole
   * family of mistakes; the floor is what says out loud how many programs each family
   * currently mutates. Today's counts, in the order below: 72, 84, 70, 7, 29.
   */
  readonly atLeast: number
  /**
   * The warning this mutation legitimately makes true of the mutated program, if any. A
   * misspelled read is still the one mistake, but the variable it stopped reading really is
   * written and never read now. Anything else the mutation draws is a cascade.
   */
  readonly alsoWarns?: 'W3002'
  /** The mutated source, or `undefined` when this program has nothing to mutate. */
  apply(source: string): string | undefined
}

const mutations: Mutation[] = [
  {
    name: 'delete one Definir of a single name',
    atLeast: 70,
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
    atLeast: 80,
    alsoWarns: 'W3002',
    apply: (source) => {
      const match = /Escribir[ \t]+([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)[ \t]*;/g
      const all = [...source.matchAll(match)]
      const last = all[all.length - 1]
      if (last === undefined || last.index === undefined) return undefined
      const name = last[1] as string
      // From the end of the match: `Escribir` itself holds a `c`, and misspelling the keyword
      // is a parser mistake, not the one this mutation is named for.
      const at = last.index + (last[0] as string).lastIndexOf(name)
      return `${source.slice(0, at)}${name}qz${source.slice(at + name.length)}`
    },
  },
  {
    name: 'swap one literal for a text',
    atLeast: 70,
    apply: (source) => {
      // The first integer assigned to a variable becomes the same digits in quotes, so the
      // value no longer fits where it is stored.
      const match = /(<-[ \t]*)(\d+)([ \t]*;)/.exec(source)
      if (match === null) return undefined
      const at = match.index + (match[1] as string).length
      const digits = match[2] as string
      return `${source.slice(0, at)}"${digits}"${source.slice(at + digits.length)}`
    },
  },
  {
    name: 'drop the last argument of a call',
    atLeast: 7,
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
    atLeast: 25,
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
 * Corpus programs that already have something to say before any mutation. The property is
 * about what *one mistake* adds, and these do not start from silence, so they are left out —
 * each with the warning it already carries. `states the warning each skipped program carries`
 * below keeps the list honest: an entry that stopped warning fails the suite.
 */
const skip: ReadonlyMap<string, string> = new Map([
  ['array-operations', 'W2001: one statement ends with `;;`'],
  ['procedure-cannot-override-variable-of-the-process', 'W3002: the process `a` is never read'],
  ['procedure-test-early-return', 'W3001: the code after the early `Retornar` is dead'],
  ['test-enter-default-case', 'W3002: `b` is only written'],
  ['test-enter-first-case', 'W3002: `b` is only written'],
  ['test-enter-second-case', 'W3002: `b` is only written'],
  ['test-if-statement-with-multiple-statements-in-body', 'W3002: `b` is only written'],
  ['test-multiple-constants-in-case', 'W3002: `b` is only written'],
  ['test-multiple-statements-in-case', 'W3002: `b` is only written'],
])

const profileFor = (slug: string) => profileNamed(zeroBased.has(slug) ? 'es0' : 'es')

const sourceOf = (file: string): string => readFileSync(join(dir, file), 'utf8')

describe('one mistake, one diagnostic', () => {
  const applied = new Map<string, number>()
  for (const file of files) {
    const slug = file.replace('.stepcode', '')
    if (skip.has(slug)) continue
    const profile = profileFor(slug)
    const source = sourceOf(file)
    for (const mutation of mutations) {
      const mutated = mutation.apply(source)
      if (mutated === undefined || mutated === source) continue
      applied.set(mutation.name, (applied.get(mutation.name) ?? 0) + 1)
      it(`${file}: ${mutation.name}`, () => {
        expect(compile(source, { profile }).diagnostics).toEqual([])
        // Every diagnostic, warnings included: a cascade into W3002 or W3003 is exactly the
        // kind of second complaint this property exists to catch.
        const after = compile(mutated, { profile }).diagnostics
        const errors = after.filter((one) => one.severity === 'error')
        const others = after.filter((one) => one.code !== mutation.alsoWarns)
        expect(
          errors.map((one) => `${one.code}@${mutated.slice(one.span.start, one.span.end)}`),
        ).toHaveLength(1)
        expect(
          others.map((one) => `${one.code}@${mutated.slice(one.span.start, one.span.end)}`),
        ).toHaveLength(1)
      })
    }
  }

  it('reaches every mutation family, and enough programs with each', () => {
    for (const mutation of mutations) {
      expect(applied.get(mutation.name) ?? 0, mutation.name).toBeGreaterThanOrEqual(
        mutation.atLeast,
      )
    }
  })

  it('states the warning each skipped program carries', () => {
    for (const [slug, reason] of skip) {
      expect(files, slug).toContain(`${slug}.stepcode`)
      const before = compile(sourceOf(`${slug}.stepcode`), { profile: profileFor(slug) })
      const codes = before.diagnostics.map((one) => one.code)
      expect(codes.length, `${slug} no longer warns: drop it from the skip list`).toBeGreaterThan(0)
      expect(codes, reason).toContain(reason.slice(0, reason.indexOf(':')))
    }
  })
})
