import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

/** `es` leaves `case` unspelled; this profile spells it, exercising the optional keyword. */
const withCaso = resolveProfile(
  { id: 'caso', extends: 'es', keywords: { case: ['Caso'] } },
  builtinProfiles,
)

const body = (statements: string) => `Proceso p\n${statements}\nFinProceso`

describe('Segun without the case keyword', () => {
  it('parses labels, multi-value labels and the default clause', () => {
    const source = body(
      'Segun a Hacer\n1: Escribir "uno";\n2, 3: Escribir "dos o tres";\nDe Otro Modo: Escribir "otro";\nFinSegun',
    )
    expect(diagnosticCodes(source)).toEqual([])
    expect(ast(source)).toBe(
      '(program (main p (switch a' +
        ' (case ((literal 1)) (write (literal "uno")))' +
        ' (case ((literal 2) (literal 3)) (write (literal "dos o tres")))' +
        ' (otherwise (write (literal "otro"))))))',
    )
  })

  it('accepts several statements per label', () => {
    const source = body('Segun a Hacer\n1: Escribir "x";\nEscribir "y";\nFinSegun')
    expect(diagnosticCodes(source)).toEqual([])
    const statement = parseSource(source).program.main?.body[0]
    expect(statement).toMatchObject({ kind: 'SwitchStmt' })
    expect(statement?.kind === 'SwitchStmt' && statement.cases[0]?.body).toHaveLength(2)
  })

  it('accepts no default clause at all', () => {
    expect(diagnosticCodes(body('Segun a Hacer\n1: Escribir "x";\nFinSegun'))).toEqual([])
  })

  it('accepts an expression label', () => {
    expect(diagnosticCodes(body('Segun a Hacer\nn + 1: Escribir "x";\nFinSegun'))).toEqual([])
  })

  it('does not mistake a call statement for a label', () => {
    // `y` is the `Y`/"and" keyword in the `es` profile, so `z` avoids the collision.
    expect(diagnosticCodes(body('Segun a Hacer\n1: f(x, z);\nFinSegun'))).toEqual([])
  })

  it('reports E2004 for a missing Hacer', () => {
    expect(diagnosticCodes(body('Segun a\n1: Escribir "x";\nFinSegun'))).toEqual(['E2004'])
  })

  it('reports E2013 for a second default clause and keeps the first', () => {
    const source = body(
      'Segun a Hacer\nDe Otro Modo: Escribir "uno";\nDe Otro Modo: Escribir "dos";\nFinSegun',
    )
    const result = parseSource(source)
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2013'])
    const statement = result.program.main?.body[0]
    expect(statement?.kind === 'SwitchStmt' && statement.otherwise).toHaveLength(1)
  })
})

describe('Segun with a profile that spells the case keyword', () => {
  it('accepts the keyword form', () => {
    const source = body('Segun a Hacer\nCaso 1: Escribir "uno";\nFinSegun')
    expect(diagnosticCodes(source, withCaso)).toEqual([])
    expect(ast(source, withCaso)).toBe(
      '(program (main p (switch a (case ((literal 1)) (write (literal "uno"))))))',
    )
  })

  it('still accepts a label without the keyword', () => {
    expect(diagnosticCodes(body('Segun a Hacer\n1: Escribir "uno";\nFinSegun'), withCaso)).toEqual(
      [],
    )
  })
})
