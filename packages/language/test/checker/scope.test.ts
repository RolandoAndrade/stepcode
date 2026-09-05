import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { createState, report, reportAssignFailure, setType } from '../../src/checker/result'
import {
  createScope,
  createSymbol,
  declareSymbol,
  lookup,
  lookupLocal,
} from '../../src/checker/scope'
import { assignFailure } from '../../src/types/assign'
import { CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'
import { parseExpr, parseSource } from '../helpers'

const programOf = (source: string) => parseSource(source).program

const sample = programOf('Proceso p\n  Escribir 1;\nFinProceso')
const declaredAt = parseExpr('a')

describe('scopes', () => {
  it('starts empty and remembers its kind, owner and parent', () => {
    const program = createScope('program', sample, null)
    const body = createScope('body', sample.main!, program)
    expect(program.kind).toBe('program')
    expect(program.parent).toBeNull()
    expect(body.parent).toBe(program)
    expect(body.owner).toBe(sample.main)
    expect(body.symbols.size).toBe(0)
    expect(body.order).toEqual([])
  })

  it('declares a symbol under its canonical name and keeps declaration order', () => {
    const scope = createScope('body', sample.main!, null)
    const first = declareSymbol(
      scope,
      createSymbol({ name: 'total', kind: 'variable', type: INTEGER, declaredAt, scope }),
    )
    const second = declareSymbol(
      scope,
      createSymbol({ name: 'aux', kind: 'variable', type: STRING, declaredAt, scope }),
    )
    expect(lookupLocal(scope, 'total')).toBe(first)
    expect(scope.order).toEqual([first, second])
  })

  it('starts every symbol with no reads and no writes', () => {
    const scope = createScope('body', sample.main!, null)
    const symbol = createSymbol({ name: 'n', kind: 'variable', type: INTEGER, declaredAt, scope })
    expect(symbol.reads).toBe(0)
    expect(symbol.writes).toBe(0)
    expect(symbol.dimensioned).toBeUndefined()
    expect('byRef' in symbol).toBe(false)
  })

  it('keeps the optional fields off the object unless they were given', () => {
    const scope = createScope('body', sample.main!, null)
    const byValue = createSymbol({ name: 'n', kind: 'parameter', type: INTEGER, declaredAt, scope })
    const byRef = createSymbol({
      name: 'm',
      kind: 'parameter',
      type: INTEGER,
      declaredAt,
      scope,
      byRef: true,
    })
    expect('byRef' in byValue).toBe(false)
    expect(byRef.byRef).toBe(true)
  })

  it('looks a name up through the parent chain but never sideways', () => {
    const program = createScope('program', sample, null)
    const main = createScope('body', sample.main!, program)
    const other = createScope('body', sample.main!, program)
    const sub = declareSymbol(
      program,
      createSymbol({ name: 'f', kind: 'subprogram', type: UNKNOWN, declaredAt, scope: program }),
    )
    const local = declareSymbol(
      main,
      createSymbol({ name: 'x', kind: 'variable', type: INTEGER, declaredAt, scope: main }),
    )
    expect(lookup(main, 'f')).toBe(sub)
    expect(lookup(main, 'x')).toBe(local)
    expect(lookup(other, 'x')).toBeUndefined()
    expect(lookupLocal(main, 'f')).toBeUndefined()
  })
})

describe('the checker state', () => {
  it('opens with a program scope, listed first', () => {
    const state = createState(sample, profiles.es)
    expect(state.scopes).toEqual([state.programScope])
    expect(state.programScope.kind).toBe('program')
    expect(state.frame.scope).toBe(state.programScope)
    expect(state.frame.subprogram).toBeNull()
    expect(state.frame.loopDepth).toBe(0)
  })

  it('stamps severity and keeps the data it was given', () => {
    const state = createState(sample, profiles.es)
    report(state, 'E3001', { start: 3, end: 8 }, { name: 'total' })
    expect(state.diagnostics).toEqual([
      { code: 'E3001', severity: 'error', span: { start: 3, end: 8 }, data: { name: 'total' } },
    ])
  })

  it('records a type per expression node', () => {
    const state = createState(sample, profiles.es)
    const expr = parseExpr('1 + 2')
    expect(setType(state, expr, INTEGER)).toBe(INTEGER)
    expect(state.types.get(expr)).toBe(INTEGER)
  })

  it('renders the two types of an assignment failure before reporting it', () => {
    const state = createState(sample, profiles.es)
    // The failing value is the node itself, so the diagnostic covers exactly it.
    reportAssignFailure(state, parseExpr('2.5'), assignFailure(INTEGER, REAL)!)
    expect(state.diagnostics[0]).toEqual({
      code: 'E3010',
      severity: 'error',
      span: { start: 0, end: 3 },
      data: { expected: 'Entero', found: 'Real', hint: 'trunc' },
    })
  })

  it('turns an assignment failure into E3035 when the context says argument', () => {
    const state = createState(sample, profiles.es)
    reportAssignFailure(state, parseExpr('2.5'), assignFailure(INTEGER, REAL)!, {
      code: 'E3035',
      data: { name: 'f', position: 2 },
    })
    expect(state.diagnostics[0]?.code).toBe('E3035')
    expect(state.diagnostics[0]?.data).toEqual({
      expected: 'Entero',
      found: 'Real',
      hint: 'trunc',
      name: 'f',
      position: 2,
    })
  })

  it('keeps E3009 and E3011 as themselves even in an argument context', () => {
    const state = createState(sample, profiles.es)
    const value = parseExpr('"ab"')
    reportAssignFailure(state, value, assignFailure(CHAR, STRING, value)!, { code: 'E3035' })
    expect(state.diagnostics[0]?.code).toBe('E3011')
    expect(state.diagnostics[0]?.data.length).toBe(2)
  })
})
