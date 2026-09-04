import { type Completion, type CompletionSource, snippetCompletion } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { BUILTIN_KEYS, KEYWORD_KEYS, type ResolvedProfile, TYPE_KEYS } from '@stepcode/profiles'
import { BUILTIN_SIGNATURES, type CompileResult, typeToString } from 'stepcode'
import type { StepcodeOptions } from './options'
import { stepcodeLanguage, treeDataAt } from './parser'
import { blockSnippets } from './snippets'
import type { Strings } from './strings'
import { stringsFor } from './strings'
import { builtinSignatureParts, signatureText, symbolLabel, visibleSymbols } from './symbols'

const WORD = /[\p{L}_][\p{L}\p{N}_]*$/u
const VALID = /^[\p{L}_][\p{L}\p{N}_]*$/u

const BOOST = { symbol: 3, builtin: 2, type: 1, keyword: 0 } as const

/** `name(<cursor>)` for a callable with parameters, `name()<cursor>` without. */
function callCompletion(label: string, hasParams: boolean, completion: Completion): Completion {
  return snippetCompletion(hasParams ? `${label}(\${})` : `${label}()\${}`, completion)
}

function symbolCompletions(
  result: CompileResult,
  pos: number,
  profile: ResolvedProfile,
  strings: Strings,
): Completion[] {
  return visibleSymbols(result, pos).map((symbol) => {
    const label = symbolLabel(symbol)
    if (symbol.kind === 'subprogram') {
      const decl = symbol.decl
      return callCompletion(label, decl !== undefined && decl.params.length > 0, {
        label,
        type: 'function',
        detail: decl?.form === 'function' ? strings.function : strings.procedure,
        boost: BOOST.symbol,
      })
    }
    return {
      label,
      type: symbol.kind === 'constant' ? 'constant' : 'variable',
      detail: typeToString(symbol.type, profile),
      boost: BOOST.symbol,
    }
  })
}

function builtinCompletions(profile: ResolvedProfile, strings: Strings): Completion[] {
  const out: Completion[] = []
  for (const key of BUILTIN_KEYS) {
    const label = profile.builtins[key]?.[0]
    if (label === undefined) continue
    const detail = signatureText(builtinSignatureParts(key, profile, strings)).slice(label.length)
    out.push(
      callCompletion(label, BUILTIN_SIGNATURES[key].params.length > 0, {
        label,
        type: 'function',
        detail,
        boost: BOOST.builtin,
      }),
    )
  }
  return out
}

function typeCompletions(profile: ResolvedProfile): Completion[] {
  const out: Completion[] = []
  for (const key of TYPE_KEYS) {
    const label = profile.types[key]?.[0]
    if (label !== undefined) out.push({ label, type: 'type', boost: BOOST.type })
  }
  return out
}

/** Every keyword with a spelling; the block openers apply their snippet (spec §5.7). */
export function keywordCompletions(profile: ResolvedProfile, strings: Strings): Completion[] {
  const snippets = blockSnippets(profile, strings)
  const out: Completion[] = []
  for (const key of KEYWORD_KEYS) {
    const label = profile.keywords[key]?.[0]
    if (label === undefined || label.length === 0) continue
    const snippet = (snippets as ReadonlyMap<string, Completion>).get(key)
    out.push(snippet ?? { label, type: 'keyword', boost: BOOST.keyword })
  }
  return out
}

/** Spec §5.6. */
export function completionSourceFor(options: StepcodeOptions): CompletionSource {
  const { profile } = options
  const strings = stringsFor(options.locale)
  const fixed = [
    ...builtinCompletions(profile, strings),
    ...typeCompletions(profile),
    ...keywordCompletions(profile, strings),
  ]
  return (context) => {
    const word = context.matchBefore(WORD)
    if (word === null && !context.explicit) return null
    const node = syntaxTree(context.state).resolveInner(context.pos, -1)
    if (node.name === 'Comment' || node.name === 'String') return null
    const data = treeDataAt(context.state)
    const symbols =
      data === null ? [] : symbolCompletions(data.result, context.pos, profile, strings)
    return { from: word?.from ?? context.pos, options: [...symbols, ...fixed], validFor: VALID }
  }
}

/** The source, registered through the language's data so `autocompletion()` picks it up. */
export function stepcodeCompletion(options: StepcodeOptions): Extension {
  return stepcodeLanguage(options.profile).data.of({ autocomplete: completionSourceFor(options) })
}
