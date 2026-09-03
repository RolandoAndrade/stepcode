import type { DiagnosticCode } from '../codes'
import type { Catalog } from '../format'

const templates: Record<DiagnosticCode, string> = {
  E1001: 'I do not understand "{text}" here.',
  E1002: 'This text is missing its closing quote.',
  E1003:
    '"{text}" is not a valid number: leave a space or an operator between the number and the letters.',
  E1006: '"==" is not part of StepCode: write "{op:equal}" to compare two values.',
  E2001: 'This statement is missing its ";".',
  E2002: 'I did not expect "{found}" here.',
  E2003: '"{kw:$closer}" is missing: the "{kw:$opener}" on line {openerLine} is never closed.',
  E2004: '"{kw:$expected}" is missing here.',
  E2005: '"{bracket}" is missing: a bracket is left open.',
  E2006: '"{kw:$closer}" does not close any open block.',
  E2010: 'The main block is missing: a program needs "{kw:program}" … "{kw:endProgram}".',
  E2011: 'There is already a "{kw:program}" block in this file: only one is allowed.',
  E2012: '"{found}" is outside every block: put it inside "{kw:program}" … "{kw:endProgram}".',
  E2013: 'This "{kw:switch}" already has an "{kw:otherwise}": only one is allowed.',
  E2020: 'You cannot assign to the result of a call: the left side must be a variable.',
  E2021: 'Parameter "{name}" has no type: write "{name} {kw:as} {type:integer}", for example.',
  E2022: 'This parameter already has "{kw:$modifier}".',
  E2030: 'Comparisons cannot be chained: write "a {text} b {kw:and} b {text} c".',
  E2031: 'An expression is missing here: I found "{found}".',
  E2032: 'This expression or block is nested too deeply (more than {limit} levels).',
  W2001: 'Empty statement: this ";" is not needed.',
}

const variants: Record<string, string> = {
  'E1001.indexBase':
    'I do not understand "{text}" here. To make arrays start at 0, use the profile option "indexBase" instead of a line in the program.',
}

export const en: Catalog = { templates, variants }
