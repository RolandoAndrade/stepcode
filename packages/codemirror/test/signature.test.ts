import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { signatureAt, stepcodeSignatureHelp } from '../src/signature'
import { signatureText } from '../src/symbols'
import { es, stateFor } from './helpers'

const options = { profile: es, locale: 'es' }

const program = [
  'Funcion r <- suma(a Como Entero, b Como Entero)',
  '  r <- a + b;',
  'FinFuncion',
  'Proceso p',
  '  Definir s Como Cadena;',
  '  s <- Subcadena("hola", 1, 2);',
  '  Escribir suma(1, 2);',
  '  Escribir Abs(-1) + 1;',
  '  Escribir noExiste(1);',
  'FinProceso',
].join('\n')

/** The signature at the offset of `marker` plus `offset`, as `[text, active index]`. */
function at(marker: string, offset = 0): [string, number] | null {
  const state = stateFor(program)
  const signature = signatureAt(state, program.indexOf(marker) + offset, options)
  if (signature === null) return null
  return [signatureText(signature.parts), signature.parts.findIndex((part) => part.active)]
}

describe('signatureAt', () => {
  it('shows a builtin signature with the active argument, per comma', () => {
    expect(at('"hola"')).toEqual(['Subcadena(texto, entero, entero) : Cadena', 1])
    expect(at('1, 2);')).toEqual(['Subcadena(texto, entero, entero) : Cadena', 3])
    expect(at('2);')).toEqual(['Subcadena(texto, entero, entero) : Cadena', 5])
  })

  it('shows the header of a user function with the active parameter', () => {
    expect(at('suma(1', 5)).toEqual(['Funcion r <- suma(a Como Entero, b Como Entero)', 1])
    expect(at('suma(1', 8)).toEqual(['Funcion r <- suma(a Como Entero, b Como Entero)', 3])
  })

  it('anchors the tooltip at the opening parenthesis', () => {
    const state = stateFor(program)
    expect(signatureAt(state, program.indexOf('"hola"'), options)?.pos).toBe(
      program.indexOf('("hola"'),
    )
  })

  it('shows nothing outside the parentheses or after the closing one', () => {
    expect(at('Subcadena')).toBeNull()
    expect(at('Abs(-1)', 'Abs(-1)'.length)).toBeNull()
    expect(at('+ 1;')).toBeNull()
  })

  it('shows nothing for an unresolved callee', () => {
    expect(at('noExiste(1', 9)).toBeNull()
  })

  it('shows a zero-parameter builtin with no active part', () => {
    const source = 'Proceso p\n  Escribir Azar();\nFinProceso'
    const state = stateFor(source)
    const signature = signatureAt(state, source.indexOf('()') + 1, options)
    expect(signature === null ? null : signatureText(signature.parts)).toBe('Azar() : Real')
  })

  it('is an extension a state accepts', () => {
    const state = EditorState.create({ doc: 'x', extensions: stepcodeSignatureHelp(options) })
    expect(state.doc.length).toBe(1)
  })
})
