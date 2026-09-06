import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

const body = (statements: string) => `Proceso p\n${statements}\nFinProceso`
const main = (statements: string) => ast(body(statements))
const codes = (statements: string) => diagnosticCodes(body(statements))

describe('Definir and Dimension', () => {
  it('parses a definition', () => {
    expect(main('Definir a, b Como Entero;')).toBe(
      '(program (main p (define (a b) (type integer))))',
    )
  })

  it('parses a one-dimensional and a matrix dimension', () => {
    expect(main('Dimension a[3];')).toBe('(program (main p (dimension (a (literal 3)))))')
    expect(main('Dimension a[3,3];')).toBe(
      '(program (main p (dimension (a (literal 3) (literal 3)))))',
    )
  })

  it('parses chained bracket sizes and several items', () => {
    expect(main('Dimension a[3][2], b[4];')).toBe(
      '(program (main p (dimension (a (literal 3) (literal 2)) (b (literal 4)))))',
    )
  })
})

describe('Constante', () => {
  it('parses with and without a type', () => {
    expect(main('Constante PI2 <- 6;')).toBe('(program (main p (constant pi2 - (literal 6))))')
    expect(main('Constante N Como Entero <- 6;')).toBe(
      '(program (main p (constant n (type integer) (literal 6))))',
    )
  })
})

describe('assignment', () => {
  it('parses a plain assignment', () => {
    expect(main('a <- 1;')).toBe('(program (main p (assign a (literal 1))))')
  })

  it('parses an indexed assignment, comma and chained forms alike', () => {
    expect(main('a[1] <- 2;')).toBe('(program (main p (assign (index a (literal 1)) (literal 2))))')
    expect(main('a[1,2] <- 3;')).toBe(main('a[1][2] <- 3;'))
  })

  it('accepts the unicode arrow', () => {
    expect(main('a ← 1;')).toBe('(program (main p (assign a (literal 1))))')
  })

  it('reports E2020 for an assignment onto a call', () => {
    expect(codes('f(1) <- 2;')).toEqual(['E2020'])
  })

  it('rejects "=" as assignment by default', () => {
    expect(codes('a = 1;')).toEqual(['E2002'])
  })
})

describe('Escribir and Leer', () => {
  it('parses one and several arguments', () => {
    expect(main('Escribir "a";')).toBe('(program (main p (write (literal "a"))))')
    expect(main('Escribir a, " * ", b;')).toBe('(program (main p (write a (literal " * ") b)))')
  })

  it('parses the no-newline form', () => {
    expect(main('Escribir Sin Saltar a;')).toBe('(program (main p (write-nonl a)))')
    expect(main('Mostrar Sin Saltar a;')).toBe('(program (main p (write-nonl a)))')
  })

  it('parses Leer with one and several targets, including indices', () => {
    expect(main('Leer a;')).toBe('(program (main p (read a)))')
    expect(main('Leer a, b[1];')).toBe('(program (main p (read a (index b (literal 1)))))')
  })

  it('reports E2002 for a Leer target that is not a variable', () => {
    expect(codes('Leer f(1);')).toEqual(['E2002'])
  })
})

describe('calls, jumps and the small statements', () => {
  it('parses a call statement and a builtin used as a statement', () => {
    expect(main('f(a, b);')).toBe('(program (main p (callstmt (call f a b))))')
    expect(main('Azar();')).toBe('(program (main p (callstmt (builtin random))))')
  })

  it('parses break, continue and both return forms', () => {
    expect(main('Romper;')).toBe('(program (main p (break)))')
    expect(main('Continuar;')).toBe('(program (main p (continue)))')
    expect(main('Retornar;')).toBe('(program (main p (return)))')
    expect(main('Retornar a + 1;')).toBe('(program (main p (return (binary plus a (literal 1)))))')
  })

  it('parses the screen and wait statements', () => {
    expect(main('Limpiar Pantalla;')).toBe('(program (main p (clear)))')
    expect(main('Esperar 500;')).toBe('(program (main p (wait (literal 500))))')
    expect(main('Esperar Tecla;')).toBe('(program (main p (waitkey)))')
  })
})

describe('every simple statement carries an exact token range', () => {
  it('covers its own source text and nothing else', () => {
    const result = parseSource('Proceso p\n  a <- 1;\nFinProceso')
    const statement = result.program.main?.body[0]
    expect(statement).toBeDefined()
    const [first, last] = statement!.tokens
    expect(result.tokens[first]!.text).toBe('a')
    expect(result.tokens[last]!.text).toBe(';')
  })
})
