import { type Completion, snippetCompletion } from '@codemirror/autocomplete'
import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import type { Strings } from './strings'

/** The keywords whose completion inserts a whole block (spec §5.7). */
export const OPENER_KEYS = [
  'if',
  'while',
  'for',
  'repeat',
  'switch',
  'function',
  'procedure',
  'program',
] as const

export type OpenerKey = (typeof OPENER_KEYS)[number]

/** The keywords whose completion inserts a whole statement rather than the bare word. */
export const STATEMENT_KEYS = [
  'define',
  'dimension',
  'write',
  'writeNoNewline',
  'read',
  'return',
  'break',
  'continue',
  'else',
  'elseIf',
] as const

export type StatementKey = (typeof STATEMENT_KEYS)[number]

const CURSOR = '${}'
const field = (name: string): string => `\${${name}}`

/**
 * The templates, spelled per profile. Body lines start with a tab, which the snippet library
 * turns into one indent unit relative to the line the snippet lands on.
 */
export function blockTemplates(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<OpenerKey, string> {
  const kw = (key: KeywordKey): string => profile.keywords[key]?.[0] ?? key
  const assign = profile.options.assignWithEquals ? '=' : (profile.operators.assign[0] ?? '<-')
  const p = strings.placeholders
  const lines = (...parts: string[]): string => parts.join('\n')
  return new Map<OpenerKey, string>([
    ['if', lines(`${kw('if')} ${field(p.condition)} ${kw('then')}`, `\t${CURSOR}`, kw('endIf'))],
    [
      'while',
      lines(`${kw('while')} ${field(p.condition)} ${kw('do')}`, `\t${CURSOR}`, kw('endWhile')),
    ],
    [
      'for',
      lines(
        `${kw('for')} ${field(p.counter)} ${assign} ${field(p.start)} ${kw('to')} ${field(p.limit)} ${kw('do')}`,
        `\t${CURSOR}`,
        kw('endFor'),
      ),
    ],
    ['repeat', lines(kw('repeat'), `\t${CURSOR}`, `${kw('until')} ${field(p.condition)}`)],
    [
      'switch',
      lines(
        `${kw('switch')} ${field(p.value)} ${kw('do')}`,
        `\t${field(p.case)}:`,
        `\t\t${CURSOR}`,
        `\t${kw('otherwise')}:`,
        '\t\t',
        kw('endSwitch'),
      ),
    ],
    [
      'function',
      lines(
        `${kw('function')} ${field(p.result)} ${assign} ${field(p.name)}(${field(p.parameters)})`,
        `\t${CURSOR}`,
        kw('endFunction'),
      ),
    ],
    [
      'procedure',
      lines(
        `${kw('procedure')} ${field(p.name)}(${field(p.parameters)})`,
        `\t${CURSOR}`,
        kw('endProcedure'),
      ),
    ],
    ['program', lines(`${kw('program')} ${field(p.name)}`, `\t${CURSOR}`, kw('endProgram'))],
  ])
}

/**
 * The one-line statements, spelled per profile. The trailing `;` is written only where the
 * profile requires terminators, so a PSeInt-style program never gains one it would reject.
 */
export function statementTemplates(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<StatementKey, string> {
  const kw = (key: KeywordKey): string => profile.keywords[key]?.[0] ?? key
  const p = strings.placeholders
  const end = profile.options.requireSemicolons ? ';' : ''
  const stmt = (text: string): string => `${text}${end}${CURSOR}`
  return new Map<StatementKey, string>([
    ['define', stmt(`${kw('define')} ${field(p.variable)} ${kw('as')} ${field(p.type)}`)],
    ['dimension', stmt(`${kw('dimension')} ${field(p.variable)}[${field(p.size)}]`)],
    ['write', stmt(`${kw('write')} ${field(p.message)}`)],
    ['writeNoNewline', stmt(`${kw('writeNoNewline')} ${field(p.message)}`)],
    ['read', stmt(`${kw('read')} ${field(p.variable)}`)],
    ['return', stmt(`${kw('return')} ${field(p.value)}`)],
    ['break', stmt(kw('break'))],
    ['continue', stmt(kw('continue'))],
    ['else', `${kw('else')}\n\t${CURSOR}`],
    ['elseIf', `${kw('elseIf')} ${field(p.condition)} ${kw('then')}\n\t${CURSOR}`],
  ])
}

/** One keyword completion per opener, applying its template. */
export function blockSnippets(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<OpenerKey, Completion> {
  const out = new Map<OpenerKey, Completion>()
  for (const [key, template] of blockTemplates(profile, strings)) {
    const label = profile.keywords[key]?.[0]
    if (label === undefined || label.length === 0) continue
    out.set(
      key,
      snippetCompletion(template, {
        label,
        type: 'keyword',
        info: strings.descriptions.keywords[key],
        boost: 0,
      }),
    )
  }
  return out
}

/** Every keyword whose completion applies a template: the block openers and the statements. */
export function keywordSnippets(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<KeywordKey, Completion> {
  const out = new Map<KeywordKey, Completion>(blockSnippets(profile, strings))
  for (const [key, template] of statementTemplates(profile, strings)) {
    const label = profile.keywords[key]?.[0]
    if (label === undefined || label.length === 0) continue
    out.set(
      key,
      snippetCompletion(template, {
        label,
        type: 'keyword',
        info: strings.descriptions.keywords[key],
        boost: 0,
      }),
    )
  }
  return out
}
