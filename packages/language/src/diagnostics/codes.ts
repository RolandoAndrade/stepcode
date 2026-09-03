export type Severity = 'error' | 'warning'

/**
 * Every diagnostic this package can produce. Ranges (spec §7.1): E1xxx lexer;
 * E2001–E2019 statements; E2020–E2029 declarations and headers; E2030–E2039 expressions;
 * W2xxx parser warnings. Later sub-specs use E3xxx (checker) and E4xxx (runtime).
 */
export const DIAGNOSTIC_CODES = [
  'E1001', // unexpected character(s)
  'E1002', // unterminated string
  'E1003', // malformed number
  'E1006', // `==` is not an operator
  'E2001', // expected `;`
  'E2002', // unexpected token
  'E2003', // expected closer for open block
  'E2004', // expected `Entonces` / `Hacer`
  'E2005', // unbalanced bracket
  'E2006', // closer without an open block
  'E2010', // no main block
  'E2011', // second main block
  'E2012', // statement outside a block
  'E2013', // second `De Otro Modo`
  'E2020', // assignment to a call
  'E2021', // parameter without a type
  'E2022', // repeated parameter modifier
  'E2030', // chained comparison
  'E2031', // expected an expression
  'W2001', // empty statement
] as const

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[number]

/** Severity is fixed per code and never varies with context. */
export const DIAGNOSTIC_SEVERITY: Readonly<Record<DiagnosticCode, Severity>> = Object.freeze({
  E1001: 'error',
  E1002: 'error',
  E1003: 'error',
  E1006: 'error',
  E2001: 'error',
  E2002: 'error',
  E2003: 'error',
  E2004: 'error',
  E2005: 'error',
  E2006: 'error',
  E2010: 'error',
  E2011: 'error',
  E2012: 'error',
  E2013: 'error',
  E2020: 'error',
  E2021: 'error',
  E2022: 'error',
  E2030: 'error',
  E2031: 'error',
  W2001: 'warning',
})
