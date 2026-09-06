import { type Completion, CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { describe, expect, it } from 'vitest'
import { completionSourceFor } from '../src/completion'
import { en, es, stateFor } from './helpers'

const program = [
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir a Como Entero;',
  '  a <- 1;',
  '  Escribir "hola"; // nota',
  '  Definir b Como Real;',
  '  Dimension lista[3];',
  'FinProceso',
].join('\n')

/** Completions offered at the offset of `marker` (explicit request unless a prefix is typed). */
function complete(
  source: string,
  marker: string,
  options: { explicit?: boolean; profile?: typeof es; locale?: string; offset?: number } = {},
): CompletionResult | null {
  const profile = options.profile ?? es
  const state = stateFor(source, [], profile)
  const pos = source.indexOf(marker) + (options.offset ?? 0)
  const context = new CompletionContext(state, pos, options.explicit ?? true)
  const source_ = completionSourceFor({ profile, locale: options.locale ?? 'es' })
  return source_(context) as CompletionResult | null
}

const labels = (result: CompletionResult | null): string[] =>
  (result?.options ?? []).map((one) => one.label)

const option = (result: CompletionResult | null, label: string): Completion | undefined =>
  result?.options.find((one) => one.label === label)

describe('completion', () => {
  it('offers the variables declared before the cursor, with their types', () => {
    const result = complete(program, '1;')
    expect(labels(result)).toContain('a')
    expect(option(result, 'a')?.detail).toBe('Entero')
    expect(option(result, 'a')?.type).toBe('variable')
    expect(labels(result)).not.toContain('b')
    expect(labels(result)).not.toContain('lista')
  })

  it('offers a parameter and the result only inside their function', () => {
    const inside = complete(program, 'n * 2')
    expect(option(inside, 'n')?.detail).toBe('Entero')
    expect(labels(inside)).toContain('r')
    const outside = complete(program, '1;')
    expect(labels(outside)).not.toContain('n')
    expect(labels(outside)).not.toContain('r')
  })

  it('offers subprograms everywhere, applied with parentheses', () => {
    const result = complete(program, 'n * 2')
    const doble = option(result, 'doble')
    expect(doble?.type).toBe('function')
    expect(doble?.detail).toBe('función')
    expect(typeof doble?.apply).toBe('function')
    expect(labels(complete(program, '1;'))).toContain('doble')
  })

  it('offers builtins with their signature as detail', () => {
    const result = complete(program, '1;')
    expect(option(result, 'RC')?.detail).toBe('(número) : Real')
    expect(option(result, 'Abs')?.detail).toBe('(número) : igual al argumento')
    expect(option(result, 'Subcadena')?.detail).toBe('(texto, entero, entero) : Cadena')
    expect(option(result, 'Azar')?.detail).toBe('() : Real')
    expect(option(result, 'RC')?.type).toBe('function')
  })

  it('offers types and keywords in the profile first spelling', () => {
    const result = complete(program, '1;')
    expect(option(result, 'Entero')?.type).toBe('type')
    expect(option(result, 'Caracter')?.type).toBe('type')
    expect(option(result, 'Escribir')?.type).toBe('keyword')
    expect(option(result, 'Sino Si')?.type).toBe('keyword')
    expect(labels(result)).not.toContain('Mostrar')
    expect(labels(result)).not.toContain('')
  })

  it('ranks symbols above builtins above types above keywords', () => {
    const result = complete(program, '1;')
    const boost = (label: string): number => option(result, label)?.boost ?? 0
    expect(boost('a')).toBeGreaterThan(boost('Abs'))
    expect(boost('Abs')).toBeGreaterThan(boost('Entero'))
    expect(boost('Entero')).toBeGreaterThan(boost('Escribir'))
  })

  it('completes from the word before the cursor and validates on word characters', () => {
    const source = 'Proceso p\n  Definir alto Como Entero;\n  Escribir al;\nFinProceso'
    const result = complete(source, 'al;', { explicit: false, offset: 2 })
    expect(result?.from).toBe(source.indexOf('al;'))
    expect(labels(result)).toContain('alto')
    expect(result?.validFor).toBeInstanceOf(RegExp)
    const validFor = result?.validFor as RegExp
    expect(validFor.test('alto')).toBe(true)
    expect(validFor.test('al to')).toBe(false)
  })

  it('offers nothing without a word unless asked explicitly', () => {
    expect(complete(program, '1;', { explicit: false })).toBeNull()
  })

  it('offers nothing inside a string or a comment', () => {
    expect(complete(program, 'hola', { offset: 2 })).toBeNull()
    expect(complete(program, 'nota', { offset: 2 })).toBeNull()
  })

  it('offers nothing but keywords, types and builtins before the first parse', () => {
    const result = complete('', '', {})
    expect(labels(result)).toContain('Proceso')
    expect(labels(result)).toContain('Entero')
  })

  it('spells everything per the en profile', () => {
    const source = 'Program p\n  Define total As Integer;\n  total <- 1;\nEndProgram'
    const result = complete(source, '1;', { profile: en, locale: 'en' })
    expect(option(result, 'total')?.detail).toBe('Integer')
    expect(option(result, 'Write')?.type).toBe('keyword')
    expect(option(result, 'Sqrt')?.detail).toBe('(number) : Real')
  })

  it('carries the beginner description as info, in the active locale', () => {
    const result = complete(program, '1;')
    expect(option(result, 'Escribir')?.info).toBe('Muestra un valor en la consola.')
    expect(option(result, 'RC')?.info).toBe('Da la raíz cuadrada de un número.')
    expect(option(result, 'Entero')?.info).toBe('Números sin decimales.')
    const english = complete(
      'Program p\n  Define total As Integer;\n  total <- 1;\nEndProgram',
      '1;',
      { profile: en, locale: 'en' },
    )
    expect(option(english, 'Write')?.info).toBe('Shows a value in the console.')
  })

  it('applies a statement keyword as a snippet', () => {
    const result = complete(program, '1;')
    const write = option(result, 'Escribir')
    expect(typeof write?.apply).toBe('function')
  })

  it('applies a block opener as a snippet', () => {
    const result = complete(program, '1;')
    expect(typeof option(result, 'Si')?.apply).toBe('function')
    expect(typeof option(result, 'Proceso')?.apply).toBe('function')
    expect(option(result, 'Entonces')?.apply).toBeUndefined()
  })
})
