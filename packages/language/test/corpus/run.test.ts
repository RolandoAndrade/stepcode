import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { corpusDirs, corpusPrograms, profileNamed, readSidecar, runSidecar } from '../helpers'

describe('the conformance corpus runs (§8.1)', () => {
  for (const program of corpusPrograms()) {
    const sidecar = readSidecar(corpusDirs.programs, program.slug)
    if (sidecar === undefined) {
      it(`${program.file} has a run sidecar`, () => {
        throw new Error(`${program.slug}.run.json is missing: the corpus is complete or it is not`)
      })
      continue
    }
    sidecar.runs.forEach((run, index) => {
      const title = run.name ?? `run ${index + 1}`
      it(`${program.file} · ${title} produces its recorded output`, async () => {
        const profile = profileNamed(program.profileName)
        const { outcome, output } = await runSidecar(program.source, profile, run, program.slug)
        expect(outcome).toEqual({ kind: 'done' })
        expect(output).toBe(run.output)
      })
    })
  }
})

const guideFiles = readdirSync(corpusDirs.guides)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

describe('the course-guide corpus runs (§8.3)', () => {
  for (const file of guideFiles) {
    const slug = file.replace('.stepcode', '')
    const source = readFileSync(join(corpusDirs.guides, file), 'utf8')
    const sidecar = readSidecar(corpusDirs.guides, slug)
    if (sidecar === undefined) {
      it(`guides/${file} has a run sidecar`, () => {
        throw new Error(`${slug}.run.json is missing: the corpus is complete or it is not`)
      })
      continue
    }
    sidecar.runs.forEach((run, index) => {
      const title = run.name ?? `run ${index + 1}`
      it(`guides/${file} · ${title} produces its recorded output`, async () => {
        const { outcome, output } = await runSidecar(source, profileNamed('es'), run, slug)
        expect(outcome).toEqual({ kind: 'done' })
        expect(output).toBe(run.output)
      })
    })
  }
})
