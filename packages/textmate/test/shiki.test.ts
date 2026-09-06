import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import type { Highlighter } from 'shiki'
import { beforeAll, describe, expect, it } from 'vitest'
import { generateGrammar, grammars } from '../src/index'
import { type EngineName, makeHighlighters, readSample, scopeOf, scopesOf } from './helpers'

const strict = generateGrammar(
  resolveProfile(
    {
      id: 'strict',
      extends: 'en',
      keywords: { if: ['When'] },
      options: { caseSensitive: true, foldAccents: false },
    },
    builtinProfiles,
  ),
  { name: 'stepcode-strict', scopeName: 'source.stepcode.strict' },
)

let highlighters: Record<EngineName, Highlighter>
beforeAll(async () => {
  highlighters = await makeHighlighters([...grammars, strict])
})

const engines: EngineName[] = ['javascript', 'oniguruma']

describe.each(engines)('%s engine', (engine) => {
  describe('es', () => {
    const code = readSample('es')
    const tokens = () => scopesOf(highlighters[engine], 'stepcode', code)
    it.each([
      ['// Suma y saludo', 'comment.line.stepcode'],
      ['Proceso', 'storage.type.stepcode'],
      ['Ejemplo', 'entity.name.function.stepcode'],
      ['Definir', 'storage.type.stepcode'],
      ['Como', 'storage.type.stepcode'],
      ['Entero', 'support.type.primitive.stepcode'],
      ['Cadena', 'support.type.primitive.stepcode'],
      ['Logico', 'support.type.primitive.stepcode'],
      ['Escribir Sin Saltar', 'keyword.other.io.stepcode'],
      ['"Nombre: "', 'string.quoted.double.stepcode'],
      ["'Hola '", 'string.quoted.single.stepcode'],
      ['Leer', 'keyword.other.io.stepcode'],
      ['<-', 'keyword.operator.assignment.stepcode'],
      ['←', 'keyword.operator.assignment.stepcode'],
      ['10', 'constant.numeric.integer.stepcode'],
      ['1.5', 'constant.numeric.real.stepcode'],
      ['MOD', 'keyword.operator.word.stepcode'],
      ['DIV', 'keyword.operator.word.stepcode'],
      ['%', 'keyword.operator.arithmetic.stepcode'],
      ['^', 'keyword.operator.arithmetic.stepcode'],
      ['Abs', 'support.function.builtin.stepcode'],
      ['Aleatorio', 'support.function.builtin.stepcode'],
      ['>=', 'keyword.operator.comparison.stepcode'],
      ['<>', 'keyword.operator.comparison.stepcode'],
      ['Y', 'keyword.operator.word.stepcode'],
      ['No', 'keyword.operator.word.stepcode'],
      ['Falso', 'constant.language.boolean.stepcode'],
      ['Verdadero', 'constant.language.boolean.stepcode'],
      ['Entonces', 'keyword.control.stepcode'],
      ['Sino Si', 'keyword.control.stepcode'],
      ['Sino', 'keyword.control.stepcode'],
      ['Sí', 'keyword.control.stepcode'],
      ['Mientras Que', 'keyword.control.stepcode'],
      ['Con Paso', 'keyword.control.stepcode'],
      ['Hasta Que', 'keyword.control.stepcode'],
      ['Hasta', 'keyword.control.stepcode'],
      ['De Otro Modo', 'keyword.control.stepcode'],
      ['SiNoValido', 'variable.other.stepcode'],
      ['Limpiar Pantalla', 'keyword.other.io.stepcode'],
      ['Esperar Tecla', 'keyword.other.io.stepcode'],
      ['Funcion', 'storage.type.stepcode'],
      ['Por Valor', 'storage.modifier.stepcode'],
      ['Por Referencia', 'storage.modifier.stepcode'],
      ['FinSubProceso', 'storage.type.stepcode'],
      [';', 'punctuation.terminator.stepcode'],
      [',', 'punctuation.separator.stepcode'],
      ['(', 'punctuation.section.parens.stepcode'],
    ])('%s → %s', (text, scope) => {
      expect(scopeOf(tokens(), text)).toBe(scope)
    })
    it('scopes subprogram names, call names and definition lists', () => {
      const t = tokens()
      expect(scopeOf(t, 'Cuadrado', 36)).toBe('entity.name.function.call.stepcode')
      expect(scopeOf(t, 'Saludar', 37)).toBe('entity.name.function.call.stepcode')
      expect(scopeOf(t, 'Cuadrado', 42)).toBe('entity.name.function.stepcode')
      expect(scopeOf(t, 'Saludar', 46)).toBe('entity.name.function.stepcode')
      expect(scopeOf(t, 'r', 42)).toBe('variable.other.definition.stepcode')
      expect(scopeOf(t, 'r', 43)).toBe('variable.other.stepcode')
      expect(scopeOf(t, 'a', 3)).toBe('variable.other.definition.stepcode')
      expect(scopeOf(t, 'total', 3)).toBe('variable.other.definition.stepcode')
      expect(scopeOf(t, 'nombre', 4)).toBe('variable.other.definition.stepcode')
      expect(scopeOf(t, 'nombre', 7)).toBe('variable.other.stepcode')
    })
    it('never leaves a keyword inside an identifier', () => {
      expect(tokens().filter((t) => t.text === 'Si' && t.line === 36)).toEqual([])
    })
  })

  describe('en', () => {
    const code = readSample('en')
    const tokens = () => scopesOf(highlighters[engine], 'stepcode-en', code)
    it.each([
      ['Program', 'storage.type.stepcode'],
      ['Example', 'entity.name.function.stepcode'],
      ['WriteNoNewline', 'keyword.other.io.stepcode'],
      ['Mod', 'keyword.operator.word.stepcode'],
      ['**', 'keyword.operator.arithmetic.stepcode'],
      ['&', 'keyword.operator.arithmetic.stepcode'],
      ['ElseIf', 'keyword.control.stepcode'],
      ['Step', 'keyword.control.stepcode'],
      ['ClearScreen', 'keyword.other.io.stepcode'],
      ['Integer', 'support.type.primitive.stepcode'],
    ])('%s → %s', (text, scope) => {
      expect(scopeOf(tokens(), text)).toBe(scope)
    })
    it('scopes the call and the definition of Square differently', () => {
      const t = tokens()
      expect(scopeOf(t, 'Square', 18)).toBe('entity.name.function.call.stepcode')
      expect(scopeOf(t, 'Square', 23)).toBe('entity.name.function.stepcode')
    })
    it('lower-case keywords still match under the default case folding', () => {
      const t = scopesOf(highlighters[engine], 'stepcode-en', 'program X\n  write 1;\nendprogram\n')
      expect(scopeOf(t, 'program')).toBe('storage.type.stepcode')
      expect(scopeOf(t, 'write')).toBe('keyword.other.io.stepcode')
    })
  })

  describe('custom strict profile', () => {
    const code = readSample('custom')
    const tokens = () => scopesOf(highlighters[engine], 'stepcode-strict', code)
    it('honours the renamed keyword, exact case and unfolded accents', () => {
      const t = tokens()
      expect(scopeOf(t, 'When')).toBe('keyword.control.stepcode')
      expect(scopeOf(t, 'if')).toBe('variable.other.stepcode')
      expect(scopeOf(t, 'Ábs')).toBe('entity.name.function.call.stepcode')
    })
  })

  describe('edge cases', () => {
    const code = readSample('edge')
    const tokens = () => scopesOf(highlighters[engine], 'stepcode', code)
    it('an unterminated string runs to the end of the line', () => {
      expect(scopeOf(tokens(), '"sin cerrar;')).toBe('string.quoted.double.stepcode')
      expect(scopeOf(tokens(), "'otra;")).toBe('string.quoted.single.stepcode')
    })
    it('a number glued to a letter is not a number', () => {
      const t = tokens()
      expect(t.find((x) => x.text === '12')).toBeUndefined()
      expect(t.find((x) => x.text === 'abc')).toBeUndefined()
    })
  })
})
