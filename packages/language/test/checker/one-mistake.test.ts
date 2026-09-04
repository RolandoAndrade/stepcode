import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { type CorpusProgram, corpusPrograms, profileNamed } from '../helpers'

interface Mutated {
  readonly source: string
  /**
   * The identifier this mutation misspelled, when it misspelled one. Misspelling a variable's
   * last read leaves it written and never read, and that W3002 is true of the mutated text —
   * but only for *that* name, and only once. Every other warning is a cascade.
   */
  readonly misspelled?: string
}

interface Mutation {
  readonly name: string
  /**
   * The fewest corpus programs this mutation must reach. `apply` returns `undefined` on a
   * regex miss and the harness moves on, so a corpus reformat could quietly retire a whole
   * family of mistakes; the floor is what says out loud how many programs each family
   * currently mutates. Today's counts, in the order below: 72, 84, 70, 7, 29.
   */
  readonly atLeast: number
  /** The mutated program, or `undefined` when this program has nothing to mutate. */
  apply(source: string): Mutated | undefined
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
      return { source: source.slice(0, match.index) + source.slice(match.index + match[0].length) }
    },
  },
  {
    name: 'misspell the last use of a name',
    atLeast: 80,
    apply: (source) => {
      const match = /Escribir[ \t]+([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)[ \t]*;/g
      const all = [...source.matchAll(match)]
      const last = all[all.length - 1]
      if (last === undefined || last.index === undefined) return undefined
      const name = last[1] as string
      // From the end of the match: `Escribir` itself holds a `c`, and misspelling the keyword
      // is a parser mistake, not the one this mutation is named for.
      const at = last.index + (last[0] as string).lastIndexOf(name)
      return {
        source: `${source.slice(0, at)}${name}qz${source.slice(at + name.length)}`,
        misspelled: name,
      }
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
      return { source: `${source.slice(0, at)}"${digits}"${source.slice(at + digits.length)}` }
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
      return {
        source: `${source.slice(0, match.index)}${match[1]}(${match[2]});${source.slice(
          match.index + match[0].length,
        )}`,
      }
    },
  },
  {
    name: 'change one operator',
    atLeast: 25,
    apply: (source) => {
      const match = /(\w)[ \t]\+[ \t](\w)/.exec(source)
      if (match === null || match.index === undefined) return undefined
      return {
        source: `${source.slice(0, match.index)}${match[1]} Y ${match[2]}${source.slice(
          match.index + match[0].length,
        )}`,
      }
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

const programs = corpusPrograms()

describe('one mistake, one diagnostic', () => {
  const applied = new Map<string, number>()
  for (const { slug, file, source, profileName } of programs) {
    if (skip.has(slug)) continue
    const profile = profileNamed(profileName)
    for (const mutation of mutations) {
      const mutated = mutation.apply(source)
      if (mutated === undefined || mutated.source === source) continue
      applied.set(mutation.name, (applied.get(mutation.name) ?? 0) + 1)
      it(`${file}: ${mutation.name}`, () => {
        expect(compile(source, { profile }).diagnostics).toEqual([])
        // Every diagnostic, warnings included: a cascade into W3002 or W3003 is exactly the
        // kind of second complaint this property exists to catch.
        const after = compile(mutated.source, { profile }).diagnostics
        const at = (one: (typeof after)[number]): string =>
          `${one.code}@${mutated.source.slice(one.span.start, one.span.end)}`
        expect(after.filter((one) => one.severity === 'error').map(at)).toHaveLength(1)
        // The one warning a misspelling may leave behind: W3002 on the very name it
        // misspelled, and only one. Anything else, from any family, is a second complaint.
        // Names compare case-folded: a symbol's name is canonical, the source's is as typed.
        const warnings = after
          .filter((one) => one.severity === 'warning')
          .map((one) => `${one.code}@${String(one.data.name)}`.toLowerCase())
        const allowed =
          mutated.misspelled === undefined ? [] : [`W3002@${mutated.misspelled}`.toLowerCase()]
        expect(
          warnings.filter((one) => !allowed.includes(one)),
          'a warning this mutation did not make true',
        ).toEqual([])
        expect(warnings.length, 'more than one warning').toBeLessThanOrEqual(1)
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
      const program = programs.find((one) => one.slug === slug) as CorpusProgram | undefined
      expect(program, `${slug} is not a corpus program`).toBeDefined()
      if (program === undefined) continue
      const before = compile(program.source, { profile: profileNamed(program.profileName) })
      const codes = before.diagnostics.map((one) => one.code)
      expect(codes.length, `${slug} no longer warns: drop it from the skip list`).toBeGreaterThan(0)
      expect(codes, reason).toContain(reason.slice(0, reason.indexOf(':')))
    }
  })
})
