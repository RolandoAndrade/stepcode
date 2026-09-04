import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { ensureSyntaxTree } from '@codemirror/language'
import { EditorState, type Extension } from '@codemirror/state'
import type { SyntaxNode, Tree } from '@lezer/common'
import { builtinProfiles, profiles, type ResolvedProfile, resolveProfile } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { stepcodeLanguage } from '../src/parser'
import { buildTree } from '../src/tree'

export const es: ResolvedProfile = profiles.es
export const en: ResolvedProfile = profiles.en

/** `es` with 0-based arrays, for the corpus programs `index-base-0.txt` lists. */
export const es0: ResolvedProfile = resolveProfile(
  { id: 'es-index-0', extends: 'es', options: { indexBase: 0 } },
  builtinProfiles,
)

/**
 * The language package's corpora, read in place — nothing is copied into this package.
 * Built with `node:url`'s own `URL`, not the global one: a happy-dom test environment
 * replaces `globalThis.URL` with a polyfill `fileURLToPath` does not recognize as a file URL.
 */
const corpusRoot = fileURLToPath(new NodeURL('../../language/test/corpus', import.meta.url))

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

/** The tree for a source, built directly — no editor state involved. */
export function treeFor(source: string, profile: ResolvedProfile = es): Tree {
  return buildTree(compile(source, { profile }))
}

export interface Leaf {
  readonly name: string
  readonly from: number
  readonly to: number
}

/** Every childless node, in document order. */
export function leaves(tree: Tree): Leaf[] {
  const out: Leaf[] = []
  const visit = (node: SyntaxNode): void => {
    let child = node.firstChild
    if (child === null) {
      out.push({ name: node.name, from: node.from, to: node.to })
      return
    }
    while (child !== null) {
      visit(child)
      child = child.nextSibling
    }
  }
  visit(tree.topNode)
  return out
}

/** An editor state with the language installed and the whole document parsed. */
export function stateFor(
  source: string,
  extensions: Extension = [],
  profile: ResolvedProfile = es,
): EditorState {
  const state = EditorState.create({
    doc: source,
    extensions: [stepcodeLanguage(profile), extensions],
  })
  ensureSyntaxTree(state, state.doc.length, 1e9)
  return state
}
