import {
  foldNodeProp,
  indentNodeProp,
  syntaxTree,
  type TreeIndentContext,
} from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import type { NodePropSource, SyntaxNode } from '@lezer/common'
import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import { keywordNodeName } from './nodes'

export const BLOCK_NAMES = [
  'IfStmt',
  'SwitchStmt',
  'SwitchCase',
  'WhileStmt',
  'RepeatStmt',
  'ForStmt',
  'SubprogramDecl',
  'MainBlock',
] as const

export type BlockName = (typeof BLOCK_NAMES)[number]

/** The keyword leaf that closes each block, when it has one. */
const CLOSERS: Readonly<Record<BlockName, readonly KeywordKey[]>> = {
  IfStmt: ['endIf'],
  SwitchStmt: ['endSwitch'],
  SwitchCase: [],
  WhileStmt: ['endWhile'],
  RepeatStmt: ['until', 'while'],
  ForStmt: ['endFor'],
  SubprogramDecl: ['endProcedure', 'endFunction'],
  MainBlock: ['endProgram'],
}

/** Lines that sit at the block's own column (spec §5.4). `SwitchStmt` handles its own. */
const DEDENT: Readonly<Record<BlockName, readonly KeywordKey[]>> = {
  IfStmt: ['elseIf', 'else', 'endIf'],
  SwitchStmt: ['endSwitch'],
  SwitchCase: ['otherwise', 'endSwitch'],
  WhileStmt: ['endWhile'],
  RepeatStmt: ['until'],
  ForStmt: ['endFor'],
  SubprogramDecl: ['endProcedure', 'endFunction'],
  MainBlock: ['endProgram'],
}

const ALL_DEDENT_KEYS: readonly KeywordKey[] = [...new Set(Object.values(DEDENT).flat())]

/** `valor:` on its own — a case line under `Segun` (plan deviation 4). */
const CASE_LINE = /^\s*[^:\s][^:]*:\s*$/

/** The closer keyword leaf of a block node, or null when it is missing or the block has none. */
export function closerOf(node: SyntaxNode): SyntaxNode | null {
  const closers = CLOSERS[node.name as BlockName] ?? []
  for (const key of closers) {
    const found = node.getChild(keywordNodeName(key))
    if (found !== null) return found
  }
  return null
}

/** Spec §5.3. */
export function foldBlock(
  node: SyntaxNode,
  state: EditorState,
): { from: number; to: number } | null {
  const from = state.doc.lineAt(node.from).to
  const closer = closerOf(node)
  const to = closer === null ? node.to : closer.from
  return from < to ? { from, to } : null
}

/**
 * Does `text` start with one of `keys`, spelled per `profile`? Longest phrase first, up to the
 * profile's longest keyword, so `Sino Si` beats `Sino`; a trailing colon is ignored.
 */
export function startsWithKeyword(
  profile: ResolvedProfile,
  text: string,
  keys: readonly KeywordKey[],
): boolean {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  for (let count = Math.min(profile.maxWords, words.length); count >= 1; count--) {
    const phrase = words.slice(0, count).join(' ').replace(/:$/, '')
    const entry = profile.lookup.get(profile.normalize(phrase))
    if (entry?.kind === 'keyword') return keys.includes(entry.key as KeywordKey)
  }
  return false
}

/** The end of the last non-blank text before `upto`, or null when there is none. */
function lastTextBefore(context: TreeIndentContext, upto: number): number | null {
  const doc = context.state.doc
  let pos = upto
  while (pos > 0) {
    const line = doc.lineAt(pos - 1)
    const text = doc.sliceString(line.from, Math.min(line.to, pos)).trimEnd()
    if (text.length > 0) return line.from + text.length
    pos = line.from
  }
  return null
}

/** The direct child of `block` that contains the previous non-blank line's end, if any. */
function previousChild(context: TreeIndentContext, block: SyntaxNode): SyntaxNode | null {
  const here = context.lineAt(context.pos, -1)
  const end = lastTextBefore(context, here.from)
  if (end === null) return null
  let node: SyntaxNode | null = syntaxTree(context.state).resolveInner(end, -1)
  while (node !== null) {
    const parent: SyntaxNode | null = node.parent
    if (parent === null) return null
    if (parent.from === block.from && parent.name === block.name) return node
    node = parent
  }
  return null
}

function indentSwitch(context: TreeIndentContext, profile: ResolvedProfile): number | null {
  const text = context.textAfter
  const base = context.baseIndent
  if (startsWithKeyword(profile, text, ['endSwitch'])) return base
  if (startsWithKeyword(profile, text, ['otherwise']) || CASE_LINE.test(text)) {
    return base + context.unit
  }
  const previous = previousChild(context, context.node)
  if (previous === null) return base + context.unit
  if (previous.name === 'SwitchCase') return context.lineIndent(previous.from) + context.unit
  const otherwise = context.node.getChild(keywordNodeName('otherwise'))
  if (
    otherwise !== null &&
    previous.from >= otherwise.from &&
    previous.name !== keywordNodeName('endSwitch')
  ) {
    return base + 2 * context.unit
  }
  return base + context.unit
}

function indentCase(context: TreeIndentContext, profile: ResolvedProfile): number | null {
  const text = context.textAfter
  if (startsWithKeyword(profile, text, DEDENT.SwitchCase) || CASE_LINE.test(text)) {
    return context.continue()
  }
  return context.baseIndent + context.unit
}

const BLOCK_NAME_SET: ReadonlySet<string> = new Set<string>(BLOCK_NAMES)

/**
 * A nested block that ends on the previous non-blank line without its closer: error recovery
 * cut it short (`Segun x Hacer` with no case yet), so the line being indented is still its body.
 */
function unclosedOpenerBefore(context: TreeIndentContext, block: SyntaxNode): SyntaxNode | null {
  const previous = previousChild(context, block)
  if (previous === null || !BLOCK_NAME_SET.has(previous.name)) return null
  return closerOf(previous) === null ? previous : null
}

function indentBlock(context: TreeIndentContext, profile: ResolvedProfile): number | null {
  const name = context.node.name as BlockName
  if (name === 'SwitchStmt') return indentSwitch(context, profile)
  if (name === 'SwitchCase') return indentCase(context, profile)
  if (startsWithKeyword(profile, context.textAfter, DEDENT[name])) return context.baseIndent
  const opener = unclosedOpenerBefore(context, context.node)
  if (opener !== null) return context.lineIndent(opener.from) + context.unit
  return context.baseIndent + context.unit
}

/** The fold and indent props for every block node, bound to one profile's spellings. */
export function blockProps(profile: ResolvedProfile): NodePropSource[] {
  const fold: Record<string, typeof foldBlock> = {}
  const indent: Record<string, (context: TreeIndentContext) => number | null> = {}
  for (const name of BLOCK_NAMES) {
    fold[name] = foldBlock
    indent[name] = (context) => indentBlock(context, profile)
  }
  return [foldNodeProp.add(fold), indentNodeProp.add(indent)]
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Spec §5.4: re-indent a line once it reads as a dedent keyword (every spelling of every
 * dedent key, longest first) or as a case line.
 */
export function indentOnInputPatterns(profile: ResolvedProfile): RegExp[] {
  const spellings = [...new Set(ALL_DEDENT_KEYS.flatMap((key) => profile.keywords[key] ?? []))]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
  const flags = profile.options.caseSensitive ? '' : 'i'
  return [new RegExp(`^\\s*(?:${spellings.join('|')})$`, flags), /^\s*[^:\s][^:]*:$/]
}
