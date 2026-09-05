import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'

describe('stringsFor', () => {
  it('returns Spanish for es', () => {
    const s = stringsFor('es')
    expect(s.toolbar.run).toBe('Ejecutar')
    expect(s.console.read('n', 'Entero')).toBe('Leer n (Entero)')
    expect(s.console.waiting(500)).toBe('Esperando 500 ms')
    expect(s.variables.arrayOf('Entero', 1)).toBe('Arreglo de Entero')
    expect(s.variables.arrayOf('Entero', 2)).toBe('Arreglo de Entero (2D)')
    expect(s.problems.summary(1, 2)).toBe('1 error, 2 advertencias')
    expect(s.toolbar.errors(1)).toBe('1 error')
    expect(s.toolbar.errors(3)).toBe('3 errores')
  })

  it('returns English for en', () => {
    const s = stringsFor('en')
    expect(s.toolbar.stepOver).toBe('Step over')
    expect(s.console.pressKey).toBe('Press a key')
    expect(s.console.dropped(12)).toBe('… 12 chunks dropped')
    expect(s.variables.empty).toBe('No program running')
    expect(s.problems.summary(0, 1)).toBe('0 errors, 1 warning')
  })

  it('falls back by primary subtag, then to es', () => {
    expect(stringsFor('en-US').toolbar.run).toBe('Run')
    expect(stringsFor('es-MX').toolbar.run).toBe('Ejecutar')
    expect(stringsFor('pt-BR')).toBe(stringsFor('es'))
    expect(stringsFor('')).toBe(stringsFor('es'))
  })

  it('names every symbol kind and every worker state in both locales', () => {
    const kinds = ['variable', 'parameter', 'result', 'constant', 'counter', 'subprogram'] as const
    const states = ['ready', 'running', 'paused', 'input', 'waiting', 'done', 'error'] as const
    for (const locale of ['es', 'en']) {
      const s = stringsFor(locale)
      for (const kind of kinds) expect(s.kinds[kind].length).toBeGreaterThan(0)
      for (const state of states) expect(s.states[state].length).toBeGreaterThan(0)
    }
  })
})
