import type { EditorView } from '@codemirror/view'
import type { KeywordKey, ResolvedProfile, TypeKey } from '@stepcode/profiles'

export interface SymbolKey {
  readonly label: string
  readonly insert: string
}

const PUNCTUATION = ['(', ')', '[', ']', ',', '"', ':', ';'] as const
const KEYWORDS: readonly KeywordKey[] = [
  'if',
  'then',
  'else',
  'endIf',
  'while',
  'do',
  'endWhile',
  'for',
  'to',
  'endFor',
  'write',
  'read',
  'define',
  'as',
]
const TYPES: readonly TypeKey[] = ['integer', 'real', 'string', 'char', 'boolean']

/** Spec §9: the assign operator, punctuation, then the profile's primary keyword and type spellings. */
export function symbolKeys(profile: ResolvedProfile): SymbolKey[] {
  const assign = profile.operators.assign[0] ?? '<-'
  const keys: SymbolKey[] = [
    { label: assign, insert: ` ${assign} ` },
    ...PUNCTUATION.map((p) => ({ label: p, insert: p })),
  ]
  for (const key of KEYWORDS) {
    const spelling = profile.keywords[key]?.[0]
    if (spelling !== undefined) keys.push({ label: spelling, insert: `${spelling} ` })
  }
  for (const key of TYPES) {
    const spelling = profile.types[key]?.[0]
    if (spelling !== undefined) keys.push({ label: spelling, insert: `${spelling} ` })
  }
  return keys
}

export function insertSymbol(view: EditorView, insert: string): void {
  view.dispatch(view.state.replaceSelection(insert))
  view.focus()
}
