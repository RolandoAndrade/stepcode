// @vitest-environment happy-dom
import { EditorView, type Tooltip } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import { hoverInfoAt, hoverSource, stepcodeHover } from '../src/hover'
import { es, stateFor } from './helpers'

const options = { profile: es, locale: 'es' }

const program = [
  'SubProceso llena(v Por Referencia Como Entero, n Como Entero)',
  '  v <- n;',
  'FinSubProceso',
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir a Como Entero;',
  '  Constante MAX <- 10;',
  '  a <- doble(MAX);',
  '  llena(a, 1);',
  '  Escribir Abs(a);',
  'FinProceso',
].join('\n')

/** The `f(): T` forms, which return through `Retornar` and so declare no result variable. */
const returning = [
  'Funcion sumar(): Entero',
  '  Retornar 1;',
  'FinFuncion',
  'Funcion lista(): Entero[]',
  '  Definir xs Como Entero[3];',
  '  Retornar xs;',
  'FinFuncion',
  'Proceso p',
  '  Escribir sumar();',
  'FinProceso',
].join('\n')

const linesAt = (marker: string, offset = 0): readonly string[] | null =>
  hoverInfoAt(stateFor(program), program.indexOf(marker) + offset, 1, options)?.lines ?? null

describe('hoverInfoAt', () => {
  it('describes a variable with its type and declaring line', () => {
    expect(linesAt('a <- doble')).toEqual(['variable a: Entero', 'declarada en la línea 8'])
  })

  it('describes a constant, a parameter by reference and a result', () => {
    expect(linesAt('MAX);')).toEqual(['constante MAX: Entero', 'declarada en la línea 9'])
    expect(linesAt('v <- n')).toEqual([
      'parámetro v: Entero (por referencia)',
      'declarada en la línea 1',
    ])
    expect(linesAt('r <- n * 2')).toEqual(['resultado r: Entero', 'declarada en la línea 4'])
  })

  it('describes a function and a procedure at their call and at their declaration', () => {
    expect(linesAt('doble(MAX')).toEqual(['función doble: Entero', 'declarada en la línea 4'])
    expect(linesAt('llena(a')).toEqual(['procedimiento llena', 'declarada en la línea 1'])
    expect(linesAt('doble(n')).toEqual(['función doble: Entero', 'declarada en la línea 4'])
  })

  it('describes a function that returns through Retornar, with no result variable', () => {
    const at = (marker: string): readonly string[] | null =>
      hoverInfoAt(stateFor(returning), returning.indexOf(marker), 1, options)?.lines ?? null
    expect(at('sumar():')).toEqual(['función sumar: Entero', 'declarada en la línea 1'])
    expect(at('lista():')).toEqual(['función lista: Entero[]', 'declarada en la línea 4'])
    expect(at('sumar();')).toEqual(['función sumar: Entero', 'declarada en la línea 1'])
  })

  it('describes a builtin by its signature', () => {
    expect(linesAt('Abs(')).toEqual(['Abs(número) : igual al argumento'])
  })

  it('renders in the requested locale', () => {
    const info = hoverInfoAt(stateFor(program), program.indexOf('a <- doble'), 1, {
      profile: es,
      locale: 'en',
    })
    expect(info?.lines).toEqual(['variable a: Entero', 'declared on line 8'])
  })

  it('covers the whole word', () => {
    const info = hoverInfoAt(stateFor(program), program.indexOf('MAX);') + 1, 1, options)
    expect(info?.from).toBe(program.indexOf('MAX);'))
    expect(info?.to).toBe(program.indexOf('MAX);') + 3)
  })

  it('has nothing to say on a keyword, a number or an unresolved name', () => {
    expect(linesAt('Proceso p')).toBeNull()
    expect(linesAt('10;')).toBeNull()
    const broken = 'Proceso p\n  Escribir nope;\nFinProceso'
    expect(hoverInfoAt(stateFor(broken), broken.indexOf('nope'), 1, options)).toBeNull()
  })
})

describe('hoverSource', () => {
  it('builds a tooltip whose DOM lists the lines', () => {
    const view = new EditorView({ state: stateFor(program) })
    const tooltip = hoverSource(options)(view, program.indexOf('a <- doble'), 1) as Tooltip | null
    expect(tooltip?.pos).toBe(program.indexOf('a <- doble'))
    const dom = tooltip?.create(view).dom
    expect(dom?.className).toBe('cm-stepcode-hover')
    expect(dom?.textContent).toBe('variable a: Enterodeclarada en la línea 8')
    expect(dom?.childElementCount).toBe(2)
    view.destroy()
  })

  it('is installable', () => {
    const view = new EditorView({ state: stateFor(program, stepcodeHover(options)) })
    expect(view.state.doc.length).toBe(program.length)
    view.destroy()
  })
})
