import { defineLanguageFacet, Language, languageDataProp, syntaxTree } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import {
  type Input,
  type NodeSet,
  Parser,
  type PartialParse,
  type Tree,
  type TreeFragment,
} from '@lezer/common'
import type { ResolvedProfile } from '@stepcode/profiles'
import { type CompileResult, compile } from 'stepcode'
import { nodeSet } from './nodes'
import { buildTree, compileProp, type TreeData } from './tree'

/**
 * Spec §4.1: one `advance()` compiles the whole input and returns its tree. Not incremental;
 * `fragments` and `ranges` are accepted and ignored, `stopAt` is recorded and ignored.
 */
class StepcodeParser extends Parser {
  constructor(
    private readonly profile: ResolvedProfile,
    private readonly set: NodeSet,
  ) {
    super()
  }

  createParse(
    input: Input,
    _fragments: readonly TreeFragment[],
    _ranges: readonly { from: number; to: number }[],
  ): PartialParse {
    // Read through `this` rather than destructuring it, so the lint rule that looks for
    // member accesses sees the two constructor properties used.
    const profile = this.profile
    const set = this.set
    let parsedPos = 0
    let stoppedAt: number | null = null
    return {
      get parsedPos() {
        return parsedPos
      },
      get stoppedAt() {
        return stoppedAt
      },
      stopAt(pos: number) {
        stoppedAt = pos
      },
      advance(): Tree {
        const tree = buildTree(compile(input.read(0, input.length), { profile }), set)
        parsedPos = input.length
        return tree
      },
    }
  }
}

/** The language data for a profile; Task 5 adds `indentOnInput`. */
export function languageData(profile: ResolvedProfile): { [name: string]: unknown } {
  return { commentTokens: { line: profile.operators.comment[0] ?? '//' } }
}

const languages = new WeakMap<ResolvedProfile, Language>()

/**
 * One `Language` per profile object, cached: `stepcodeCompletion` registers through its data
 * facet, so every extension built for a profile must see the same instance.
 */
export function stepcodeLanguage(profile: ResolvedProfile): Language {
  const cached = languages.get(profile)
  if (cached !== undefined) return cached
  const data = defineLanguageFacet(languageData(profile))
  const set = nodeSet.extend(languageDataProp.add({ Program: data }))
  const language = new Language(data, new StepcodeParser(profile, set), [], 'stepcode')
  languages.set(profile, language)
  return language
}

/** The data on the current tree, or `null` before a parse has produced one. */
export function treeDataAt(state: EditorState): TreeData | null {
  return syntaxTree(state).prop(compileProp) ?? null
}

export function compileResultAt(state: EditorState): CompileResult | null {
  return treeDataAt(state)?.result ?? null
}
