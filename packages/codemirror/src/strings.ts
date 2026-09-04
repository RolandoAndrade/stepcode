import type { OperandClass, SymbolKind } from 'stepcode'

export type PlaceholderKey =
  | 'condition'
  | 'value'
  | 'name'
  | 'parameters'
  | 'result'
  | 'counter'
  | 'start'
  | 'limit'
  | 'case'

/** Every human string this package renders outside diagnostics (spec §9). */
export interface Strings {
  readonly kinds: Readonly<Record<SymbolKind, string>>
  readonly procedure: string
  readonly function: string
  readonly byReference: string
  readonly declaredAt: (line: number) => string
  readonly replaceWith: (name: string) => string
  readonly operandClass: Readonly<Record<OperandClass, string>>
  /** A builtin whose result type is its first argument's. */
  readonly same: string
  /** Snippet field names; ASCII so the inserted program stays lexable. */
  readonly placeholders: Readonly<Record<PlaceholderKey, string>>
}

const es: Strings = {
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
  procedure: 'procedimiento',
  function: 'función',
  byReference: 'por referencia',
  declaredAt: (line) => `declarada en la línea ${line}`,
  replaceWith: (name) => `Cambiar a «${name}»`,
  operandClass: {
    numeric: 'número',
    text: 'texto',
    boolean: 'lógico',
    integer: 'entero',
    scalar: 'valor',
  },
  same: 'igual al argumento',
  placeholders: {
    condition: 'condicion',
    value: 'valor',
    name: 'nombre',
    parameters: 'parametros',
    result: 'resultado',
    counter: 'contador',
    start: 'inicio',
    limit: 'limite',
    case: 'caso',
  },
}

const en: Strings = {
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
  procedure: 'procedure',
  function: 'function',
  byReference: 'by reference',
  declaredAt: (line) => `declared on line ${line}`,
  replaceWith: (name) => `Replace with "${name}"`,
  operandClass: {
    numeric: 'number',
    text: 'text',
    boolean: 'boolean',
    integer: 'integer',
    scalar: 'value',
  },
  same: 'same as the argument',
  placeholders: {
    condition: 'condition',
    value: 'value',
    name: 'name',
    parameters: 'parameters',
    result: 'result',
    counter: 'counter',
    start: 'start',
    limit: 'limit',
    case: 'case',
  },
}

const TABLES: Readonly<Record<string, Strings>> = { es, en }

/** The table for a BCP-47 tag: exact, then primary subtag (`es-MX` → `es`), then `en`. */
export function stringsFor(locale: string): Strings {
  const exact = TABLES[locale]
  if (exact !== undefined) return exact
  const primary = locale.split('-')[0] ?? ''
  return TABLES[primary] ?? en
}
