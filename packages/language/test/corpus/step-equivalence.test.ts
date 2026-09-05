import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ResolvedProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { start } from '../../src/interpreter/run'
import {
  corpusDirs,
  corpusPrograms,
  profileNamed,
  readSidecar,
  runSidecar,
  type SidecarRun,
  seeded,
} from '../helpers'

/**
 * Drives a run to the end with `step()` alone, answering inputs from the sidecar, and returns
 * what it wrote. The output must equal `runProgram`'s: stepping is a way of pausing, never a
 * way of computing something else (§8, "Property").
 */
function stepToEnd(source: string, profile: ResolvedProfile, run: SidecarRun): string {
  const program = compile(source, { profile })
  let output = ''
  let next = 0
  const controller = start(program, {
    profile,
    io: {
      write: (text) => {
        output += text
      },
    },
    ...(run.seed === undefined ? {} : { random: seeded(run.seed) }),
  })
  for (let steps = 0; steps < 1_000_000; steps++) {
    const result = controller.step()
    if (result.kind === 'done') return output
    if (result.kind === 'error') throw new Error(`stepping hit ${result.diagnostic.code}`)
    if (result.kind === 'input') {
      if (result.rejected !== undefined) throw new Error('stepping had an input rejected')
      const text = run.inputs[next]
      next++
      if (text === undefined) throw new Error('stepping ran out of inputs')
      controller.input(text)
    }
    // `paused` and `wait`: keep stepping.
  }
  throw new Error('stepping did not finish within a million steps')
}

interface Candidate {
  readonly title: string
  readonly slug: string
  readonly source: string
  readonly profile: ResolvedProfile
  readonly run: SidecarRun
}

/**
 * Every step-equivalence candidate for one program or guide's sidecar: one per recorded run.
 * A program without a sidecar is not skipped — the corpus is complete or it is not (§8.1) — so
 * the caller gets `undefined` and reports a failing test itself, exactly as
 * `test/corpus/run.test.ts` does for the sidecars themselves.
 */
function candidatesFor(
  title: string,
  slug: string,
  source: string,
  profile: ResolvedProfile,
  sidecar: ReturnType<typeof readSidecar>,
): Candidate[] {
  if (sidecar === undefined) return []
  return sidecar.runs.map((run) => ({
    title: `${title} · ${run.name ?? 'run'}`,
    slug,
    source,
    profile,
    run,
  }))
}

describe('stepping to the end equals runProgram (§8)', () => {
  const candidates: Candidate[] = []

  for (const program of corpusPrograms()) {
    const sidecar = readSidecar(corpusDirs.programs, program.slug)
    if (sidecar === undefined) {
      it(`${program.file} has a run sidecar`, () => {
        throw new Error(`${program.slug}.run.json is missing: the corpus is complete or it is not`)
      })
      continue
    }
    candidates.push(
      ...candidatesFor(
        program.file,
        program.slug,
        program.source,
        profileNamed(program.profileName),
        sidecar,
      ),
    )
  }

  for (const file of readdirSync(corpusDirs.guides)
    .filter((name) => name.endsWith('.stepcode'))
    .sort()) {
    const slug = file.replace('.stepcode', '')
    const sidecar = readSidecar(corpusDirs.guides, slug)
    if (sidecar === undefined) {
      it(`guides/${file} has a run sidecar`, () => {
        throw new Error(`${slug}.run.json is missing: the corpus is complete or it is not`)
      })
      continue
    }
    candidates.push(
      ...candidatesFor(
        `guides/${file}`,
        slug,
        readFileSync(join(corpusDirs.guides, file), 'utf8'),
        profileNamed('es'),
        sidecar,
      ),
    )
  }

  it('covers the whole corpus', () => {
    expect(candidates.length).toBeGreaterThan(150)
  })

  for (const candidate of candidates) {
    it(candidate.title, async () => {
      const stepped = stepToEnd(candidate.source, candidate.profile, candidate.run)
      const { outcome, output } = await runSidecar(
        candidate.source,
        candidate.profile,
        candidate.run,
        candidate.slug,
      )
      expect(outcome).toEqual({ kind: 'done' })
      expect(stepped).toBe(output)
      expect(stepped).toBe(candidate.run.output)
    })
  }
})
