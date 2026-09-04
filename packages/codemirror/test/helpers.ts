import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { builtinProfiles, profiles, type ResolvedProfile, resolveProfile } from '@stepcode/profiles'

export const es: ResolvedProfile = profiles.es
export const en: ResolvedProfile = profiles.en

/** `es` with 0-based arrays, for the corpus programs `index-base-0.txt` lists. */
export const es0: ResolvedProfile = resolveProfile(
  { id: 'es-index-0', extends: 'es', options: { indexBase: 0 } },
  builtinProfiles,
)

/** The language package's corpora, read in place — nothing is copied into this package. */
const corpusRoot = fileURLToPath(new URL('../../language/test/corpus', import.meta.url))

export interface CorpusSource {
  readonly slug: string
  readonly source: string
  readonly profile: ResolvedProfile
}

function zeroBasedSlugs(): Set<string> {
  return new Set(
    readFileSync(join(corpusRoot, 'programs', 'index-base-0.txt'), 'utf8')
      .split('\n')
      .filter((line) => line.length > 0),
  )
}

function programsIn(dir: string, profileFor: (slug: string) => ResolvedProfile): CorpusSource[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.stepcode'))
    .sort()
    .map((file) => {
      const slug = file.replace('.stepcode', '')
      return { slug, source: readFileSync(join(dir, file), 'utf8'), profile: profileFor(slug) }
    })
}

let corpus: CorpusSource[] | undefined

/**
 * Every program of the conformance corpus, the guide corpus and the guide error and runtime
 * sub-corpora, each with the profile the language package checks it under.
 */
export function corpusSources(): readonly CorpusSource[] {
  if (corpus !== undefined) return corpus
  const zero = zeroBasedSlugs()
  corpus = [
    ...programsIn(join(corpusRoot, 'programs'), (slug) => (zero.has(slug) ? es0 : es)),
    ...programsIn(join(corpusRoot, 'guides'), () => es),
    ...programsIn(join(corpusRoot, 'guides', 'errors'), () => es),
    ...programsIn(join(corpusRoot, 'guides', 'runtime'), () => es),
  ]
  return corpus
}
