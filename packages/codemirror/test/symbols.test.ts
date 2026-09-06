import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { builtinKeyAt, identifierLeafAt, scopeAt, symbolAt, visibleSymbols } from '../src/symbols'
import { es, stateFor } from './helpers'

const program = [
  '// encabezado',
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir total Como Entero;',
  '  total <- doble(2);',
  '  Escribir total;',
  'FinProceso',
].join('\n')

/** A subprogram written inside another one: E2015, and the inner span nests in the outer. */
const nested = [
  'Funcion r <- externa(x Como Entero)',
  '  Procedimiento interna',
  '    Definir dentro Como Entero;',
  '    dentro <- 1;',
  '    Escribir dentro;',
  '  FinProcedimiento',
  '  r <- x;',
  'FinFuncion',
  'Proceso p',
  '  Escribir externa(1);',
  'FinProceso',
].join('\n')

const use = program.indexOf('total <- ')
const declaration = program.indexOf('total Como')

describe('identifierLeafAt', () => {
  const state = stateFor(program)

  it('finds the leaf at the start, in the middle and at the end of a word', () => {
    for (const offset of [0, 2, 'total'.length]) {
      const leaf = identifierLeafAt(state, use + offset)
      expect(leaf?.name).toBe('Identifier')
      expect(leaf?.from).toBe(use)
      expect(leaf?.to).toBe(use + 'total'.length)
    }
  })

  it('honours the side it is asked for', () => {
    expect(identifierLeafAt(state, use, -1)).toBeNull()
    expect(identifierLeafAt(state, use, 1)?.from).toBe(use)
    expect(identifierLeafAt(state, use + 'total'.length, 1)).toBeNull()
  })

  it('finds nothing on whitespace', () => {
    expect(identifierLeafAt(state, program.indexOf('  Escribir total;') + 1)).toBeNull()
  })
})

describe('symbolAt', () => {
  const state = stateFor(program)

  it('resolves a use and its declaration to the one symbol', () => {
    const at = symbolAt(state, use)
    const at_ = symbolAt(state, declaration)
    expect(at?.symbol.name).toBe('total')
    expect(at?.symbol.kind).toBe('variable')
    expect(at?.leaf.name).toBe('Identifier')
    expect(at_?.leaf.name).toBe('VariableDefinition')
    expect(at_?.symbol).toBe(at?.symbol)
  })

  it('resolves nothing on a keyword', () => {
    expect(symbolAt(state, program.indexOf('Escribir') + 2)).toBeNull()
  })
})

describe('scopeAt', () => {
  const result = compile(program, { profile: es })

  it('finds the body a position stands in', () => {
    expect(scopeAt(result, use).owner.kind).toBe('MainBlock')
    const inside = scopeAt(result, program.indexOf('r <- n'))
    expect(inside.owner.kind).toBe('SubprogramDecl')
    expect([...inside.symbols.keys()]).toEqual(['n', 'r'])
  })

  it('falls back to the program scope outside every body', () => {
    expect(scopeAt(result, 0).kind).toBe('program')
  })

  it('picks the innermost body when a subprogram is written inside another', () => {
    const inner = compile(nested, { profile: es })
    const scope = scopeAt(inner, nested.indexOf('dentro <- 1'))
    expect(scope.owner.span.start).toBe(nested.indexOf('Procedimiento interna'))
    expect([...scope.symbols.keys()]).toEqual(['dentro'])
    const visible = visibleSymbols(inner, nested.indexOf('dentro <- 1')).map((one) => one.name)
    expect(visible).toContain('dentro')
    expect(visible).not.toContain('x')
    expect(visible).not.toContain('r')
  })

  it('picks the innermost body whatever order the scopes are listed in', () => {
    const inner = compile(nested, { profile: es })
    const [first, ...bodies] = inner.scopes
    if (first === undefined) throw new Error('a compile result always has a program scope')
    // `scopes` is documented as build order, which is not nesting order: `scopeAt` must read
    // the spans, not the list. Here the enclosing body is listed before the one it contains.
    const reordered = { ...inner, scopes: [first, ...bodies.reverse()] }
    const scope = scopeAt(reordered, nested.indexOf('dentro <- 1'))
    expect(scope.owner.span.start).toBe(nested.indexOf('Procedimiento interna'))
  })
})

describe('builtinKeyAt', () => {
  it('names the builtin a spelling stands for', () => {
    expect(builtinKeyAt(es, 'Abs')).toBe('abs')
    expect(builtinKeyAt(es, 'raiz')).toBe('sqrt')
  })

  it('names nothing for a user name, a keyword or a type', () => {
    expect(builtinKeyAt(es, 'doble')).toBeNull()
    expect(builtinKeyAt(es, 'Escribir')).toBeNull()
    expect(builtinKeyAt(es, 'Entero')).toBeNull()
  })
})
