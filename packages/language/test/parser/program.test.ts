import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

const untyped = resolveProfile(
  { id: 'untyped', extends: 'es', options: { typedParameters: false } },
  builtinProfiles,
)

describe('top level', () => {
  it('parses a main block', () => {
    expect(ast('Proceso p\nFinProceso')).toBe('(program (main p))')
    expect(diagnosticCodes('Proceso p\nFinProceso')).toEqual([])
  })

  it('accepts both program spellings', () => {
    expect(ast('Algoritmo p\nFinAlgoritmo')).toBe('(program (main p))')
  })

  it('accepts subprograms before and after the main block', () => {
    const source = 'SubProceso a\nFinSubProceso\nProceso p\nFinProceso\nSubProceso b\nFinSubProceso'
    expect(ast(source)).toBe(
      '(program (procedure a (params ) (returns - -)) (procedure b (params ) (returns - -)) (main p))',
    )
    expect(diagnosticCodes(source)).toEqual([])
  })

  it('reports E2010 at end of file when there is no main block', () => {
    const result = parseSource('SubProceso a\nFinSubProceso\n')
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2010'])
    expect(result.program.main).toBeNull()
  })

  it('reports E2011 at the opener of a second main block, keeping the first', () => {
    const source = 'Proceso uno\nFinProceso\nProceso dos\nFinProceso'
    const result = parseSource(source)
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2011'])
    expect(result.program.main?.name.name).toBe('uno')
    const position = result.diagnostics[0]!.span.start
    expect(source.slice(position, position + 7)).toBe('Proceso')
  })

  it('reports E2012 for a statement outside every block, once per run', () => {
    const result = parseSource('Escribir 1;\nEscribir 2;\nProceso p\nFinProceso')
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2012'])
    expect(result.diagnostics[0]!.data.found).toBe('Escribir')
    expect(result.program.main?.name.name).toBe('p')
  })
})

describe('subprogram headers', () => {
  const header = (source: string) => {
    const declaration = parseSource(`${source}\nFinFuncion\nProceso p\nFinProceso`).program
      .subprograms[0]
    return declaration
  }

  it('accepts a procedure with and without parentheses', () => {
    expect(ast('SubProceso f\nFinSubProceso\nProceso p\nFinProceso')).toContain(
      '(procedure f (params ) (returns - -))',
    )
    expect(ast('SubProceso f()\nFinSubProceso\nProceso p\nFinProceso')).toContain(
      '(procedure f (params ) (returns - -))',
    )
  })

  it('accepts every procedure keyword pair of the profile', () => {
    expect(diagnosticCodes('Procedimiento f\nFinProcedimiento\nProceso p\nFinProceso')).toEqual([])
    expect(diagnosticCodes('SubAlgoritmo f\nFinSubAlgoritmo\nProceso p\nFinProceso')).toEqual([])
  })

  it('parses all five header forms into one node shape', () => {
    expect(header('Funcion f()')).toMatchObject({ form: 'function', name: { name: 'f' } })
    expect(header('Funcion f(): Entero')).toMatchObject({
      returnType: { base: 'integer' },
    })
    expect(header('Funcion r <- f()')).toMatchObject({
      name: { name: 'f' },
      returnName: { name: 'r' },
    })
    expect(header('Funcion r Como Real <- f(x Como Real)')).toMatchObject({
      name: { name: 'f' },
      returnName: { name: 'r' },
      returnType: { base: 'real' },
      params: [{ name: { name: 'x' }, byRef: false, type: { base: 'real' } }],
    })
    expect(header('Funcion f')).toMatchObject({ form: 'function', name: { name: 'f' } })
  })

  it('leaves a function with neither return name nor return type valid', () => {
    expect(diagnosticCodes('Funcion f()\nFinFuncion\nProceso p\nFinProceso')).toEqual([])
  })

  it('accepts the unicode assignment arrow in the header', () => {
    expect(header('Funcion r ← f()')).toMatchObject({ returnName: { name: 'r' } })
  })

  it('reports E2003 when a subprogram is never closed', () => {
    const result = parseSource('SubProceso f\nProceso p\nFinProceso')
    expect(result.diagnostics.map((d) => d.code)).toContain('E2003')
  })
})

describe('parameters', () => {
  const params = (header: string, profile = profiles.es) =>
    parseSource(`SubProceso f(${header})\nFinSubProceso\nProceso p\nFinProceso`, profile).program
      .subprograms[0]?.params

  it('reads a typed parameter', () => {
    expect(params('a Como Entero')).toMatchObject([
      { name: { name: 'a' }, type: { base: 'integer' }, byRef: false },
    ])
  })

  it('accepts the modifiers in either order', () => {
    expect(params('a Como Entero Por Referencia')).toMatchObject([
      { type: { base: 'integer' }, byRef: true },
    ])
    expect(params('a Por Referencia Como Entero')).toMatchObject([
      { type: { base: 'integer' }, byRef: true },
    ])
  })

  it('marks Por Valor explicitly', () => {
    expect(params('a Como Entero Por Valor')).toMatchObject([{ byRef: false }])
  })

  it('reads several parameters', () => {
    expect(params('a Como Entero, b Como Real')).toHaveLength(2)
  })

  it('reports E2021 for an untyped parameter when typedParameters is on', () => {
    const result = parseSource('SubProceso f(a)\nFinSubProceso\nProceso p\nFinProceso')
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2021'])
    expect(result.diagnostics[0]!.data.name).toBe('a')
  })

  it('accepts an untyped parameter when typedParameters is off', () => {
    expect(
      diagnosticCodes(
        'SubProceso f(a, b Por Referencia)\nFinSubProceso\nProceso p\nFinProceso',
        untyped,
      ),
    ).toEqual([])
    expect(params('a, b Por Referencia', untyped)).toMatchObject([
      { byRef: false },
      { byRef: true },
    ])
  })

  it('reports E2022 for a repeated modifier and keeps the first', () => {
    const result = parseSource(
      'SubProceso f(a Por Referencia Por Valor)\nFinSubProceso\nProceso p\nFinProceso',
      untyped,
    )
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2022'])
    expect(result.diagnostics[0]!.data.modifier).toBe('byValue')
    expect(result.program.subprograms[0]?.params[0]?.byRef).toBe(true)
  })

  it('reports E2022 for a repeated type modifier', () => {
    expect(
      diagnosticCodes(
        'SubProceso f(a Como Entero Como Real)\nFinSubProceso\nProceso p\nFinProceso',
      ),
    ).toEqual(['E2022'])
  })
})

describe('type references', () => {
  const type = (source: string) => {
    const statement = parseSource(`Proceso p\n${source}\nFinProceso`).program.main?.body[0]
    return statement?.kind === 'DefineStmt' ? statement.type : undefined
  }

  it('reads a scalar type', () => {
    expect(type('Definir a Como Entero;')).toMatchObject({ base: 'integer', dimensions: [] })
  })

  it('reads the unsized one-dimensional and two-dimensional forms', () => {
    expect(type('Definir a Como Entero[];')).toMatchObject({ dimensions: [null] })
    expect(type('Definir a Como Entero[,];')).toMatchObject({ dimensions: [null, null] })
  })

  it('reads sized dimensions', () => {
    expect(ast('Proceso p\nDefinir a Como Entero[3,3];\nFinProceso')).toBe(
      '(program (main p (define (a) (type integer [(literal 3) (literal 3)]))))',
    )
  })

  it('accepts an expression as a size', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero[n + 1];\nFinProceso')).toEqual([])
  })

  it('reports E2023 when some sizes are present and others are not', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero[3,];\nFinProceso')).toEqual(['E2023'])
  })

  it('reads a list of names sharing one type', () => {
    expect(ast('Proceso p\nDefinir a, b, c Como Cadena;\nFinProceso')).toBe(
      '(program (main p (define (a b c) (type string))))',
    )
  })

  it('accepts a bracket type on a parameter and on a return type', () => {
    const declaration = parseSource(
      'Funcion f(a Como Entero[]): Entero[,]\nFinFuncion\nProceso p\nFinProceso',
    ).program.subprograms[0]
    expect(declaration?.params[0]?.type).toMatchObject({ dimensions: [null] })
    expect(declaration?.returnType).toMatchObject({ dimensions: [null, null] })
  })
})

describe('terminators on Definir', () => {
  it('requires a semicolon when requireSemicolons is on', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero\nEscribir a;\nFinProceso')).toEqual([
      'E2001',
    ])
  })

  it('accepts a newline terminator under pseint', () => {
    expect(
      diagnosticCodes('Proceso p\nDefinir a Como Entero\nFinProceso', profiles.pseint),
    ).toEqual([])
  })

  it('reports W2001 for a stray semicolon', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero;;\nFinProceso')).toEqual(['W2001'])
  })
})

describe('parse never throws', () => {
  it('survives hostile input', () => {
    for (const source of ['', 'Proceso', 'FinProceso', 'Proceso p', '(((', 'Funcion <- ']) {
      expect(() => parseSource(source)).not.toThrow()
    }
  })
})
