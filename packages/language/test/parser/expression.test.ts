import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parseExpr, parseExprResult, sexpr } from '../helpers'

const s = (source: string) => sexpr(parseExpr(source))
const codes = (source: string) => parseExprResult(source).diagnostics.map((d) => d.code)

describe('primaries', () => {
  it('reads every literal kind', () => {
    expect(s('10')).toBe('(literal 10)')
    expect(s('10.5')).toBe('(literal 10.5)')
    expect(s('"hola"')).toBe('(literal "hola")')
    expect(s("'hola'")).toBe('(literal "hola")')
    expect(s('Verdadero')).toBe('(literal true)')
    expect(s('Falso')).toBe('(literal false)')
  })

  it('reads identifiers with the canonical name', () => {
    expect(s('MiVar')).toBe('mivar')
  })

  it('produces no node for parentheses', () => {
    expect(s('(a)')).toBe('a')
    expect(s('(2 + 3) * 5')).toBe(
      '(binary times (binary plus (literal 2) (literal 3)) (literal 5))',
    )
    expect(s('2 * (3 + 5)')).toBe(
      '(binary times (literal 2) (binary plus (literal 3) (literal 5)))',
    )
  })
})

describe('calls and indexing', () => {
  it('parses a user call, including the zero-argument form', () => {
    expect(s('f(a, b)')).toBe('(call f a b)')
    expect(s('f()')).toBe('(call f)')
  })

  it('parses a builtin call and a bare builtin as a zero-argument call', () => {
    expect(s('Raiz(9)')).toBe('(builtin sqrt (literal 9))')
    expect(s('PI')).toBe('(builtin pi)')
    expect(s('Azar')).toBe('(builtin random)')
    expect(s('Azar()')).toBe('(builtin random)')
  })

  it('merges a[i,j] and a[i][j] into one Index with two indices', () => {
    expect(s('a[i,j]')).toBe('(index a i j)')
    expect(s('a[i][j]')).toBe('(index a i j)')
    expect(s('a[i,j]')).toBe(s('a[i][j]'))
  })

  it('indexes the result of a call chain', () => {
    expect(s('f(x)[1]')).toBe('(index (call f x) (literal 1))')
  })
})

describe('precedence table, line by line', () => {
  it('or is lowest, and binds tighter', () => {
    // `p`/`q`/`r`, not `x`/`y`/`z`: the es profile spells `and`/`or` as `Y`/`O`, and the
    // lexer is case-insensitive by default, so an identifier literally named `y` or `o`
    // would tokenize as the keyword, not an identifier.
    expect(s('p Y q O r')).toBe('(binary or (binary and p q) r)')
    expect(s('p O q Y r')).toBe('(binary or p (binary and q r))')
  })

  it('not sits below the relational operators', () => {
    expect(s('No a = b')).toBe('(unary not (binary equal a b))')
    expect(s('No a Y b')).toBe('(binary and (unary not a) b)')
  })

  it('relational operators sit below plus and minus', () => {
    expect(s('a + 1 < b')).toBe('(binary lt (binary plus a (literal 1)) b)')
  })

  it('plus and minus are left associative', () => {
    expect(s('2 + 3 - 5')).toBe('(binary minus (binary plus (literal 2) (literal 3)) (literal 5))')
  })

  it('times, divide, div and mod bind tighter than plus, and are left associative', () => {
    expect(s('a + 2 * 3')).toBe('(binary plus a (binary times (literal 2) (literal 3)))')
    expect(s('2 * 3 / 5')).toBe(
      '(binary divide (binary times (literal 2) (literal 3)) (literal 5))',
    )
    expect(s('a DIV 2 MOD 3')).toBe('(binary mod (binary div a (literal 2)) (literal 3))')
  })

  it('unary minus sits below power', () => {
    expect(s('-2^2')).toBe('(unary minus (binary power (literal 2) (literal 2)))')
    expect(s('-a * b')).toBe('(binary times (unary minus a) b)')
  })

  it('power is right associative and accepts a unary operand', () => {
    expect(s('2^3^2')).toBe('(binary power (literal 2) (binary power (literal 3) (literal 2)))')
    expect(s('2^-1')).toBe('(binary power (literal 2) (unary minus (literal 1)))')
    expect(s('2 ** 3')).toBe('(binary power (literal 2) (literal 3))')
  })

  it('postfix binds tighter than every operator', () => {
    expect(s('-a[1]')).toBe('(unary minus (index a (literal 1)))')
    expect(s('a[1] + b[2]')).toBe('(binary plus (index a (literal 1)) (index b (literal 2)))')
  })
})

describe('expression diagnostics', () => {
  it('reports a chained comparison once, and still builds an AST', () => {
    const { expr, diagnostics } = parseExprResult('a < b < c')
    expect(diagnostics.map((d) => d.code)).toEqual(['E2030'])
    expect(diagnostics[0]!.data).toMatchObject({ first: '<', second: '<' })
    expect(sexpr(expr)).toBe('(binary lt (binary lt a b) c)')
  })

  it('allows a comparison inside a parenthesised operand', () => {
    expect(codes('(a < b) = Verdadero')).toEqual([])
  })

  it('reports a type or a non-literal keyword in expression position', () => {
    expect(codes('Entero')).toEqual(['E2031'])
    expect(codes('Si')).toEqual(['E2031'])
    expect(s('Entero')).toBe('(error-expr)')
    expect(parseExprResult('Entero').diagnostics[0]!.data.found).toBe('Entero')
  })

  it('reports a missing operand', () => {
    expect(codes('a +')).toEqual(['E2031'])
    expect(s('a +')).toBe('(binary plus a (error-expr))')
  })

  it('reports an unbalanced bracket at the opener', () => {
    const parenthesis = parseExprResult('(a + b')
    expect(parenthesis.diagnostics.map((d) => d.code)).toEqual(['E2005'])
    expect(parenthesis.diagnostics[0]!.span).toEqual({ start: 0, end: 1 })
    expect(parenthesis.diagnostics[0]!.data.bracket).toBe(')')

    const bracket = parseExprResult('a[1')
    expect(bracket.diagnostics.map((d) => d.code)).toEqual(['E2005'])
    expect(bracket.diagnostics[0]!.span).toEqual({ start: 1, end: 2 })
    expect(bracket.diagnostics[0]!.data.bracket).toBe(']')
  })

  it('leaves an error token to the lexer instead of piling E2031 on it', () => {
    expect(codes('== b')).toEqual(['E1006'])
    expect(codes('10abc')).toEqual(['E1003'])
  })

  it('never throws on a hostile expression', () => {
    for (const source of ['', ')', '][', ',,,', '1 1 1', 'a(((', 'Si Entonces FinSi']) {
      expect(() => parseExprResult(source)).not.toThrow()
    }
  })
})

describe('profile independence', () => {
  it('uses the profile spellings, not hardcoded words', () => {
    expect(sexpr(parseExpr('a And b Or Not c', profiles.en))).toBe(
      '(binary or (binary and a b) (unary not c))',
    )
  })

  it('honours a custom operator spelling', () => {
    const custom = resolveProfile(
      { id: 'aula', extends: 'es', operators: { power: ['^', '**', '↑'] } },
      builtinProfiles,
    )
    expect(sexpr(parseExpr('2 ↑ 3', custom))).toBe('(binary power (literal 2) (literal 3))')
  })
})

describe('node ranges', () => {
  it('gives every expression a span that covers its source text', () => {
    const expr = parseExpr('a + b * c')
    expect(expr.span).toEqual({ start: 0, end: 9 })
    expect(expr.tokens[0]).toBe(0)
  })

  it('lets the parent range cover the parentheses of a parenthesised operand', () => {
    const expr = parseExpr('(a + b) * c')
    expect(expr.span).toEqual({ start: 0, end: 11 })
  })
})
