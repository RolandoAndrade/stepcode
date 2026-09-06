import { BUILTIN_KEYS, type OperatorKey, TYPE_KEYS } from '@stepcode/profiles'

export type WordSection = 'keywords' | 'types' | 'builtins'

export interface WordFamily {
  /** Repository key. */
  id: string
  section: WordSection
  keys: readonly string[]
  scope: string
}

export interface OperatorFamily {
  id: string
  keys: readonly OperatorKey[]
  scope: string
}

/** Shared by the `keyword-definition` family and the structural rules that capture its keywords. */
export const DEFINITION_SCOPE = 'storage.type.stepcode'

/** Word families in the order their rules appear in `patterns` (spec §4.4, §5). */
export const WORD_FAMILIES: readonly WordFamily[] = [
  {
    id: 'keyword-control',
    section: 'keywords',
    keys: [
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
    ],
    scope: 'keyword.control.stepcode',
  },
  {
    id: 'keyword-definition',
    section: 'keywords',
    keys: [
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
    ],
    scope: DEFINITION_SCOPE,
  },
  {
    id: 'keyword-modifier',
    section: 'keywords',
    keys: ['byRef', 'byValue'],
    scope: 'storage.modifier.stepcode',
  },
  {
    id: 'keyword-io',
    section: 'keywords',
    keys: ['write', 'writeNoNewline', 'read', 'clearScreen', 'wait', 'waitKey'],
    scope: 'keyword.other.io.stepcode',
  },
  {
    id: 'keyword-operator',
    section: 'keywords',
    keys: ['and', 'or', 'not', 'mod', 'div'],
    scope: 'keyword.operator.word.stepcode',
  },
  {
    id: 'boolean',
    section: 'keywords',
    keys: ['true', 'false'],
    scope: 'constant.language.boolean.stepcode',
  },
  { id: 'type', section: 'types', keys: TYPE_KEYS, scope: 'support.type.primitive.stepcode' },
  {
    id: 'builtin',
    section: 'builtins',
    keys: BUILTIN_KEYS,
    scope: 'support.function.builtin.stepcode',
  },
]

export const OPERATOR_FAMILIES: readonly OperatorFamily[] = [
  { id: 'operator-assignment', keys: ['assign'], scope: 'keyword.operator.assignment.stepcode' },
  {
    id: 'operator-comparison',
    keys: ['equal', 'notEqual', 'lt', 'le', 'gt', 'ge'],
    scope: 'keyword.operator.comparison.stepcode',
  },
  {
    id: 'operator-arithmetic',
    keys: ['plus', 'minus', 'times', 'divide', 'power'],
    scope: 'keyword.operator.arithmetic.stepcode',
  },
]

export const SCOPES = {
  comment: 'comment.line.stepcode',
  stringDouble: 'string.quoted.double.stepcode',
  stringSingle: 'string.quoted.single.stepcode',
  integer: 'constant.numeric.integer.stepcode',
  real: 'constant.numeric.real.stepcode',
  parens: 'punctuation.section.parens.stepcode',
  brackets: 'punctuation.section.brackets.stepcode',
  separator: 'punctuation.separator.stepcode',
  terminator: 'punctuation.terminator.stepcode',
  subprogramName: 'entity.name.function.stepcode',
  callName: 'entity.name.function.call.stepcode',
  definedVariable: 'variable.other.definition.stepcode',
  identifier: 'variable.other.stepcode',
  assignment: 'keyword.operator.assignment.stepcode',
} as const

/** Repository keys in the order they are tried (spec §4.4). Missing keys are skipped. */
export const PATTERN_ORDER: readonly string[] = [
  'comment',
  'string',
  'subprogram',
  'program',
  'definition',
  'multiword',
  'keyword-control',
  'keyword-definition',
  'keyword-modifier',
  'keyword-io',
  'keyword-operator',
  'boolean',
  'type',
  'builtin',
  'number',
  'call',
  'operator-assignment',
  'operator-comparison',
  'operator-arithmetic',
  'punctuation',
  'identifier',
]
