import { NodeProp, NodeSet, NodeType } from '@lezer/common'
import { styleTags, tags as t } from '@lezer/highlight'
import { KEYWORD_KEYS, type KeywordKey } from '@stepcode/profiles'

/** One node per AST kind, plus the two plain records the tree keeps as nodes (spec §4.2). */
export const STRUCTURE_NAMES = [
  'Program',
  'MainBlock',
  'SubprogramDecl',
  'Param',
  'TypeRef',
  'DefineStmt',
  'DimensionStmt',
  'DimensionItem',
  'ConstantStmt',
  'AssignStmt',
  'WriteStmt',
  'ReadStmt',
  'IfStmt',
  'SwitchStmt',
  'SwitchCase',
  'WhileStmt',
  'RepeatStmt',
  'ForStmt',
  'BreakStmt',
  'ContinueStmt',
  'ReturnStmt',
  'CallStmt',
  'ClearStmt',
  'WaitStmt',
  'WaitKeyStmt',
  'ErrorStmt',
  'Index',
  'Call',
  'BuiltinCall',
  'Unary',
  'Binary',
  'ErrorExpr',
] as const

/** The identifier roles, all leaves (spec §4.3 rule 2). */
export const IDENTIFIER_NAMES = [
  'Identifier',
  'VariableDefinition',
  'SubprogramName',
  'CallName',
] as const

/** Every leaf type that is not a keyword. */
export const LEAF_NAMES = [
  ...IDENTIFIER_NAMES,
  'Number',
  'String',
  'Boolean',
  'TypeName',
  'BuiltinName',
  'AssignOp',
  'CompareOp',
  'ArithOp',
  'OpenParen',
  'CloseParen',
  'OpenBracket',
  'CloseBracket',
  'Punct',
  'Comment',
  'Error',
] as const

/** `if` → `IfKeyword`, `writeNoNewline` → `WriteNoNewlineKeyword`. */
export function keywordNodeName(key: KeywordKey): string {
  return `${key.charAt(0).toUpperCase()}${key.slice(1)}Keyword`
}

/** Opener ↔ closer, the pairs the bracket matcher and the fold rule know (spec §4.2). */
export const MATCHING_PAIRS: readonly (readonly [KeywordKey, KeywordKey])[] = [
  ['if', 'endIf'],
  ['switch', 'endSwitch'],
  ['while', 'endWhile'],
  ['for', 'endFor'],
  ['repeat', 'until'],
  ['procedure', 'endProcedure'],
  ['function', 'endFunction'],
  ['program', 'endProgram'],
]

/**
 * Opener ↔ closer punctuation node names (spec §4.2). The stock bracket matcher's text
 * fallback only pairs characters whose tree nodes share one type, and ours are distinct types
 * by design, so these get the same `closedBy`/`openedBy` treatment as the keyword pairs.
 */
export const PUNCT_MATCHING_PAIRS: readonly (readonly [string, string])[] = [
  ['OpenParen', 'CloseParen'],
  ['OpenBracket', 'CloseBracket'],
]

export const NODE_NAMES: readonly string[] = [
  ...STRUCTURE_NAMES,
  ...LEAF_NAMES,
  ...KEYWORD_KEYS.map(keywordNodeName),
]

const ids = new Map<string, number>(NODE_NAMES.map((name, id) => [name, id]))

/** The id of a node type in `nodeSet`; unknown names are a programming error. */
export function nodeId(name: string): number {
  const id = ids.get(name)
  if (id === undefined) throw new Error(`unknown node type: ${name}`)
  return id
}

const ERROR_NAMES: ReadonlySet<string> = new Set(['Error', 'ErrorStmt', 'ErrorExpr'])
const closers = new Map<string, string>([
  ...MATCHING_PAIRS.map(([open, close]): [string, string] => [
    keywordNodeName(open),
    keywordNodeName(close),
  ]),
  ...PUNCT_MATCHING_PAIRS.map(([open, close]): [string, string] => [open, close]),
])
const openers = new Map<string, string>([
  ...MATCHING_PAIRS.map(([open, close]): [string, string] => [
    keywordNodeName(close),
    keywordNodeName(open),
  ]),
  ...PUNCT_MATCHING_PAIRS.map(([open, close]): [string, string] => [close, open]),
])

function propsFor(name: string): readonly [NodeProp<readonly string[]>, readonly string[]][] {
  const closer = closers.get(name)
  if (closer !== undefined) return [[NodeProp.closedBy, [closer]]]
  const opener = openers.get(name)
  if (opener !== undefined) return [[NodeProp.openedBy, [opener]]]
  return []
}

const keywords = (keys: readonly KeywordKey[]): string => keys.map(keywordNodeName).join(' ')

const CONTROL: readonly KeywordKey[] = [
  'if',
  'then',
  'elseIf',
  'else',
  'endIf',
  'switch',
  'case',
  'otherwise',
  'endSwitch',
  'while',
  'do',
  'endWhile',
  'for',
  'to',
  'step',
  'endFor',
  'repeat',
  'until',
  'break',
  'continue',
  'return',
]
const DEFINITION: readonly KeywordKey[] = [
  'program',
  'endProgram',
  'define',
  'as',
  'constant',
  'dimension',
  'procedure',
  'endProcedure',
  'function',
  'endFunction',
  'byRef',
  'byValue',
]
const OPERATOR: readonly KeywordKey[] = ['and', 'or', 'not', 'mod', 'div']
const IO: readonly KeywordKey[] = [
  'write',
  'writeNoNewline',
  'read',
  'clearScreen',
  'wait',
  'waitKey',
]

/** Spec §5.1, as one `styleTags` source. `true`/`false` only appear inside `Boolean` leaves. */
const highlighting = styleTags({
  [keywords(CONTROL)]: t.controlKeyword,
  [keywords(DEFINITION)]: t.definitionKeyword,
  [keywords(OPERATOR)]: t.operatorKeyword,
  [keywords(IO)]: t.keyword,
  [keywords(['true', 'false'])]: t.bool,
  TypeName: t.typeName,
  BuiltinName: t.function(t.standard(t.variableName)),
  AssignOp: t.definitionOperator,
  CompareOp: t.compareOperator,
  ArithOp: t.arithmeticOperator,
  Number: t.number,
  String: t.string,
  Boolean: t.bool,
  Comment: t.lineComment,
  Identifier: t.variableName,
  VariableDefinition: t.definition(t.variableName),
  SubprogramName: t.function(t.definition(t.variableName)),
  CallName: t.function(t.variableName),
  'OpenParen CloseParen': t.paren,
  'OpenBracket CloseBracket': t.squareBracket,
  Punct: t.separator,
  'Error ErrorStmt ErrorExpr': t.invalid,
})

/**
 * The one node set. Built once at module load; `stepcodeLanguage` extends it per profile with
 * the language data prop on `Program`, which changes no id or name.
 */
export const nodeSet: NodeSet = new NodeSet(
  NODE_NAMES.map((name, id) =>
    NodeType.define({
      id,
      name,
      top: name === 'Program',
      error: ERROR_NAMES.has(name),
      props: propsFor(name),
    }),
  ),
).extend(highlighting)
