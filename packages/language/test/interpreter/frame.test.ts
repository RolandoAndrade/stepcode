import { describe, expect, it } from 'vitest'
import {
  bindSlot,
  bodyScopeOf,
  createFrame,
  inspectFrames,
  slotOf,
} from '../../src/interpreter/frame'
import { allocateArray, cellSlot, type Slot } from '../../src/interpreter/value'
import { compileEs } from '../helpers'

const source = [
  'Funcion r Como Entero <- suma(a Como Entero, b Por Referencia Como Entero)',
  '  Constante K <- 10;',
  '  r <- a + b + K;',
  '  b <- 0;',
  'FinFuncion',
  'Proceso p',
  '  Definir x, yy Como Entero;',
  '  Definir lista Como Entero[3];',
  '  Constante MAX <- 5;',
  '  x <- 1;',
  '  yy <- 2;',
  '  lista[1] <- suma(x, yy);',
  '  Escribir lista[1], MAX;',
  'FinProceso',
].join('\n')

function program() {
  const compiled = compileEs(source)
  const main = compiled.ast.main
  const decl = compiled.ast.subprograms[0]
  if (main === null || decl === undefined) throw new Error('the fixture lost its blocks')
  return { compiled, main, decl }
}

describe('frames (§4.2)', () => {
  it('finds the body scope the checker built for a block', () => {
    const { compiled, main, decl } = program()
    expect(bodyScopeOf(compiled, main).owner).toBe(main)
    expect(bodyScopeOf(compiled, decl).owner).toBe(decl)
  })

  it('creates one unassigned slot per symbol of Scope.order, constants filled', () => {
    const { compiled, main } = program()
    const scope = bodyScopeOf(compiled, main)
    const frame = createFrame(scope, 6)
    expect(frame.name).toBe('p')
    expect(frame.decl).toBeNull()
    expect(frame.line).toBe(6)
    expect(frame.result).toBeNull()
    expect(scope.order.map((symbol) => symbol.name)).toEqual(['x', 'yy', 'lista', 'max'])
    for (const symbol of scope.order) expect(frame.slots.has(symbol)).toBe(true)
    const names = scope.order.map((symbol) => [symbol.name, slotOf(frame, symbol).value])
    expect(names).toEqual([
      ['x', undefined],
      ['yy', undefined],
      ['lista', undefined],
      ['max', 5],
    ])
  })

  it('records the result variable of a function and fills its constant', () => {
    const { compiled, decl } = program()
    const scope = bodyScopeOf(compiled, decl)
    const frame = createFrame(scope, 1)
    expect(frame.name).toBe('suma')
    expect(frame.decl).toBe(decl)
    expect(frame.result?.name).toBe('r')
    expect(frame.result?.kind).toBe('result')
    const constant = scope.order.find((symbol) => symbol.kind === 'constant')
    expect(constant).toBeDefined()
    if (constant === undefined) return
    expect(slotOf(frame, constant).value).toBe(10)
  })

  it('slotOf throws for a symbol of another frame', () => {
    const { compiled, main, decl } = program()
    const frame = createFrame(bodyScopeOf(compiled, main), 6)
    const foreign = bodyScopeOf(compiled, decl).order[0]
    if (foreign === undefined) throw new Error('no parameter')
    expect(() => slotOf(frame, foreign)).toThrow(/slot/)
  })

  it('bindSlot aliases a caller slot, so writes through the callee reach the caller', () => {
    const { compiled, main, decl } = program()
    const caller = createFrame(bodyScopeOf(compiled, main), 6)
    const callee = createFrame(bodyScopeOf(compiled, decl), 1)
    const y = bodyScopeOf(compiled, main).symbols.get('yy')
    const b = bodyScopeOf(compiled, decl).symbols.get('b')
    if (y === undefined || b === undefined) throw new Error('fixture symbols missing')
    slotOf(caller, y).value = 2
    bindSlot(callee, b, slotOf(caller, y))
    expect(slotOf(callee, b).value).toBe(2)
    slotOf(callee, b).value = 0
    expect(slotOf(caller, y).value).toBe(0)
  })

  it('a cell slot bound by reference writes into the caller array', () => {
    const { compiled, decl } = program()
    const callee = createFrame(bodyScopeOf(compiled, decl), 1)
    const b = bodyScopeOf(compiled, decl).symbols.get('b')
    if (b === undefined) throw new Error('fixture symbol missing')
    const array = allocateArray('integer', [3], { name: 'lista', spans: [] })
    const cell: Slot = cellSlot(array, 2)
    bindSlot(callee, b, cell)
    slotOf(callee, b).value = 9
    expect(array.data).toEqual([undefined, undefined, 9])
  })
})

describe('inspectFrames (§3.7)', () => {
  it('lists frames innermost first with Scope.order variables and current values', () => {
    const { compiled, main, decl } = program()
    const outer = createFrame(bodyScopeOf(compiled, main), 12)
    const inner = createFrame(bodyScopeOf(compiled, decl), 3)
    const x = bodyScopeOf(compiled, main).symbols.get('x')
    const a = bodyScopeOf(compiled, decl).symbols.get('a')
    if (x === undefined || a === undefined) throw new Error('fixture symbols missing')
    slotOf(outer, x).value = 1
    slotOf(inner, a).value = 1
    const frames = inspectFrames([outer, inner])
    expect(frames.map((frame) => frame.name)).toEqual(['suma', 'p'])
    expect(frames.map((frame) => frame.line)).toEqual([3, 12])
    expect(frames[0]?.variables.map((v) => [v.name, v.kind, v.value])).toEqual([
      ['a', 'parameter', 1],
      ['b', 'parameter', undefined],
      ['r', 'result', undefined],
      ['k', 'constant', 10],
    ])
    expect(frames[1]?.variables.map((v) => [v.name, v.kind, v.value])).toEqual([
      ['x', 'variable', 1],
      ['yy', 'variable', undefined],
      ['lista', 'variable', undefined],
      ['max', 'constant', 5],
    ])
    expect(frames[1]?.variables[0]?.type).toEqual({ kind: 'scalar', name: 'integer' })
    expect(frames[1]?.variables[2]?.type).toEqual({ kind: 'array', element: 'integer', rank: 1 })
  })

  it('shows an allocated array as its ArrayValue and a by-reference parameter as the aliased value', () => {
    const { compiled, main, decl } = program()
    const outer = createFrame(bodyScopeOf(compiled, main), 12)
    const inner = createFrame(bodyScopeOf(compiled, decl), 3)
    const lista = bodyScopeOf(compiled, main).symbols.get('lista')
    const y = bodyScopeOf(compiled, main).symbols.get('yy')
    const b = bodyScopeOf(compiled, decl).symbols.get('b')
    if (lista === undefined || y === undefined || b === undefined) throw new Error('missing')
    const array = allocateArray('integer', [3], { name: 'lista', spans: [] })
    slotOf(outer, lista).value = array
    slotOf(outer, y).value = 2
    bindSlot(inner, b, slotOf(outer, y))
    const frames = inspectFrames([outer, inner])
    expect(frames[1]?.variables[2]?.value).toBe(array)
    expect(frames[0]?.variables[1]?.value).toBe(2)
  })

  it('returns [] for no frames', () => {
    expect(inspectFrames([])).toEqual([])
  })
})
