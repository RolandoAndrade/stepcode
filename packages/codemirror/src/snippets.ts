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

/** One keyword completion per opener, applying its template. */
export function blockSnippets(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<OpenerKey, Completion> {
  const out = new Map<OpenerKey, Completion>()
  for (const [key, template] of blockTemplates(profile, strings)) {
    const label = profile.keywords[key]?.[0]
    if (label === undefined || label.length === 0) continue
    out.set(key, snippetCompletion(template, { label, type: 'keyword', boost: 0 }))
  }
  return out
}
