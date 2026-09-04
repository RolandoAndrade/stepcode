// @vitest-environment happy-dom
import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import { definitionAt, goToDefinition, stepcodeKeymap } from '../src/definition'
import { stateFor } from './helpers'

const program = [
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir a Como Entero;',
  '  a <- doble(3);',
  'FinProceso',
].join('\n')

describe('definitionAt', () => {
  it('finds the declaration of a variable and of a called subprogram', () => {
    const state = stateFor(program)
    expect(definitionAt(state, program.indexOf('a <- doble'))).toBe(program.indexOf('a Como'))
    expect(definitionAt(state, program.indexOf('doble(3') + 2)).toBe(program.indexOf('doble(n'))
    expect(definitionAt(state, program.indexOf('n * 2'))).toBe(program.indexOf('n Como'))
  })

  it('works from either side of the word', () => {
    const state = stateFor(program)
    const end = program.indexOf('doble(3') + 'doble'.length
    expect(definitionAt(state, end)).toBe(program.indexOf('doble(n'))
  })

  it('returns null on a keyword or a literal', () => {
    const state = stateFor(program)
    expect(definitionAt(state, program.indexOf('Proceso'))).toBeNull()
    expect(definitionAt(state, program.indexOf('3);'))).toBeNull()
  })
})

describe('goToDefinition', () => {
  it('moves the selection to the declaration and reports success', () => {
    const view = new EditorView({ state: stateFor(program) })
    view.dispatch({ selection: EditorSelection.single(program.indexOf('doble(3') + 1) })
    expect(goToDefinition(view)).toBe(true)
    expect(view.state.selection.main.head).toBe(program.indexOf('doble(n'))
    expect(view.state.selection.main.empty).toBe(true)
    view.destroy()
  })

  it('reports failure and leaves the selection alone elsewhere', () => {
    const view = new EditorView({ state: stateFor(program) })
    view.dispatch({ selection: EditorSelection.single(program.indexOf('Proceso')) })
    expect(goToDefinition(view)).toBe(false)
    expect(view.state.selection.main.head).toBe(program.indexOf('Proceso'))
    view.destroy()
  })

  it('is bound to F12', () => {
    expect(stepcodeKeymap).toEqual([{ key: 'F12', run: goToDefinition }])
  })
})
