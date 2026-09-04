export type Severity = 'error' | 'warning'

/**
 * Every diagnostic this package can produce. Ranges (spec §7.1): E1xxx lexer;
 * E2001–E2019 statements; E2020–E2029 declarations and headers; E2030–E2039 expressions;
 * W2xxx parser warnings; E3xxx/W3xxx checker. A later sub-spec uses E4xxx (runtime).
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
  'E2014', // `Sino Si` after `Sino`
  'E2015', // subprogram inside a block
  'E2020', // assignment to a call
  'E2021', // parameter without a type
  'E2022', // repeated parameter modifier
  'E2023', // mixed sized and unsized dimensions
  'E2030', // chained comparison
  'E2031', // expected an expression
  'E2032', // nesting too deep
  'W2001', // empty statement
  'E3001', // name not declared
  'E3002', // already declared
  'E3003', // used before its declaration
  'E3004', // variable named like a subprogram
  'E3005', // subprogram used as a variable
  'E3006', // not a subprogram
  'E3007', // constant is read-only
  'E3008', // counter is read-only inside its loop
  'E3009', // array where a scalar is needed, or scalar indexed
  'E3010', // cannot assign
  'E3011', // literal too long for a character
  'E3012', // operator operand mismatch
  'E3013', // cannot assign into a text by index
  'E3014', // condition is not logical
  'E3015', // cannot infer the type
  'E3016', // index count mismatch
  'E3017', // index is not an integer
  'E3020', // procedure used as a value
  'E3021', // dimension of an undeclared name
  'E3022', // cannot dimension
  'E3023', // array size is not a positive integer constant
  'E3024', // constant value is not constant
  'E3025', // division by zero
  'E3026', // counter must be an integer
  'E3027', // step is zero
  'E3028', // selector type cannot be switched on
  'E3029', // case label is not constant
  'E3030', // duplicate case label
  'E3031', // break or continue outside a loop
  'E3032', // by-reference argument must be a variable
  'E3033', // return value outside a function
  'E3034', // wrong number of arguments
  'E3035', // argument type mismatch
  'E3036', // wrong number of arguments to a builtin
  'E3037', // builtin argument type mismatch
  'W3001', // unreachable code
  'W3002', // declared but never read
  'W3003', // read but never assigned
  'W3004', // function result never assigned
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
  E2014: 'error',
  E2015: 'error',
  E2020: 'error',
  E2021: 'error',
  E2022: 'error',
  E2023: 'error',
  E2030: 'error',
  E2031: 'error',
  E2032: 'error',
  W2001: 'warning',
  E3001: 'error',
  E3002: 'error',
  E3003: 'error',
  E3004: 'error',
  E3005: 'error',
  E3006: 'error',
  E3007: 'error',
  E3008: 'error',
  E3009: 'error',
  E3010: 'error',
  E3011: 'error',
  E3012: 'error',
  E3013: 'error',
  E3014: 'error',
  E3015: 'error',
  E3016: 'error',
  E3017: 'error',
  E3020: 'error',
  E3021: 'error',
  E3022: 'error',
  E3023: 'error',
  E3024: 'error',
  E3025: 'error',
  E3026: 'error',
  E3027: 'error',
  E3028: 'error',
  E3029: 'error',
  E3030: 'error',
  E3031: 'error',
  E3032: 'error',
  E3033: 'error',
  E3034: 'error',
  E3035: 'error',
  E3036: 'error',
  E3037: 'error',
  W3001: 'warning',
  W3002: 'warning',
  W3003: 'warning',
  W3004: 'warning',
})
