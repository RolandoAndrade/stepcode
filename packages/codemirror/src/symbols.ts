import { syntaxTree } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import type { SyntaxNode } from '@lezer/common'
import type { BuiltinKey, ResolvedProfile } from '@stepcode/profiles'
import {
  BUILTIN_SIGNATURES,
  type CompileResult,
  type Scope,
  type Symbol as StepSymbol,
  typeToString,
} from 'stepcode'
import { IDENTIFIER_NAMES } from './nodes'
import { treeDataAt } from './parser'
import type { Strings } from './strings'

const IDENTIFIERS: ReadonlySet<string> = new Set(IDENTIFIER_NAMES)

/**
 * The identifier leaf ending at `pos` (side -1), starting at it (side 1), or either (0, the
 * leaf ending there first) — a cursor touches a word from both sides.
 */
export function identifierLeafAt(
  state: EditorState,
  pos: number,
  side: -1 | 0 | 1 = 0,
): SyntaxNode | null {
  const tree = syntaxTree(state)
  const sides: readonly (-1 | 1)[] = side === 0 ? [-1, 1] : [side]
  for (const one of sides) {
    const node = tree.resolveInner(pos, one)
    if (IDENTIFIERS.has(node.name)) return node
  }
  return null
}

/** The leaf at `pos` and the checker symbol it resolved to, or null. */
export function symbolAt(
  state: EditorState,
  pos: number,
  side: -1 | 0 | 1 = 0,
): { readonly leaf: SyntaxNode; readonly symbol: StepSymbol } | null {
  const leaf = identifierLeafAt(state, pos, side)
  const data = treeDataAt(state)
  if (leaf === null || data === null) return null
  const identifier = data.identifiers.get(leaf.from)
  if (identifier === undefined) return null
  const symbol = data.result.symbols.get(identifier)
  return symbol === undefined ? null : { leaf, symbol }
}

/**
 * The innermost body scope whose owner contains `pos`, else the program scope. Bodies do nest:
 * a subprogram written inside another one (E2015) keeps its place in the source, so its span
 * lies inside the enclosing body's. `scopes` is build order, not nesting order, so the
 * narrowest containing owner wins rather than the first one listed.
 */
export function scopeAt(result: CompileResult, pos: number): Scope {
  const program = result.scopes[0]
  if (program === undefined) throw new Error('a compile result always has a program scope')
  let innermost: Scope = program
  let width = Number.POSITIVE_INFINITY
  for (const scope of result.scopes) {
    if (scope.kind !== 'body') continue
    const { span } = scope.owner
    if (span.start > pos || pos > span.end || span.end - span.start >= width) continue
    innermost = scope
    width = span.end - span.start
  }
  return innermost
}

/**
 * Spec §5.6: the symbols usable at `pos` — the scope chain from the innermost, a name once,
 * declarations after the cursor excluded except subprograms, recovery symbols never.
 */
export function visibleSymbols(result: CompileResult, pos: number): StepSymbol[] {
  const seen = new Set<string>()
  const out: StepSymbol[] = []
  for (let scope: Scope | null = scopeAt(result, pos); scope !== null; scope = scope.parent) {
    for (const symbol of scope.order) {
      if (seen.has(symbol.name) || symbol.recovered === true) continue
      if (symbol.kind !== 'subprogram' && symbol.declaredAt.span.start >= pos) continue
      seen.add(symbol.name)
      out.push(symbol)
    }
  }
  return out
}

/** The name as the declaration wrote it; a result variable's from the header. */
export function symbolLabel(symbol: StepSymbol): string {
  const at = symbol.declaredAt
  if (at.kind === 'Identifier') return at.text
  if (at.kind === 'SubprogramDecl' && at.returnName !== undefined) return at.returnName.text
  return symbol.name
}

/** The builtin a spelling names under `profile`, or null. */
export function builtinKeyAt(profile: ResolvedProfile, text: string): BuiltinKey | null {
  const entry = profile.lookup.get(profile.normalize(text))
  return entry?.kind === 'builtin' ? (entry.key as BuiltinKey) : null
}

export interface SignaturePart {
  readonly text: string
  readonly active: boolean
}

/** `Name(p1, p2) : result`, spec §5.6, with the parameter at `activeIndex` flagged. */
export function builtinSignatureParts(
  key: BuiltinKey,
  profile: ResolvedProfile,
  strings: Strings,
  activeIndex = -1,
): SignaturePart[] {
  const signature = BUILTIN_SIGNATURES[key]
  const name = profile.builtins[key]?.[0] ?? key
  const parts: SignaturePart[] = [{ text: `${name}(`, active: false }]
  signature.params.forEach((operand, index) => {
    if (index > 0) parts.push({ text: ', ', active: false })
    parts.push({ text: strings.operandClass[operand], active: index === activeIndex })
  })
  const result =
    signature.result === 'same' ? strings.same : typeToString(signature.result, profile)
  parts.push({ text: `) : ${result}`, active: false })
  return parts
}

export const signatureText = (parts: readonly SignaturePart[]): string =>
  parts.map((part) => part.text).join('')
