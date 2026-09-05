import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'

function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix === '' ? key : `${prefix}.${key}`),
  )
}

describe('stringsFor', () => {
  it('returns Spanish for es and English for en', () => {
    expect(stringsFor('es').toolbar.run).toBe('Ejecutar')
    expect(stringsFor('en').toolbar.run).toBe('Run')
    expect(stringsFor('es').status.pausedAt(12)).toBe('En pausa en la línea 12')
    expect(stringsFor('en').status.problems(2, 1)).toBe('✖ 2  ▲ 1')
    expect(stringsFor('es').confirmSave.title('a.stepcode')).toBe(
      '¿Guardar los cambios de a.stepcode?',
    )
    expect(stringsFor('es').app.untitled).toBe('sin título.stepcode')
  })

  it('falls back by primary subtag, then to es', () => {
    expect(stringsFor('en-US').toolbar.run).toBe('Run')
    expect(stringsFor('pt-BR')).toBe(stringsFor('es'))
    expect(stringsFor('')).toBe(stringsFor('es'))
  })

  it('has the same key set in both locales', () => {
    expect(keysOf(stringsFor('en')).sort()).toEqual(keysOf(stringsFor('es')).sort())
  })

  it('names every builtin profile, panel, dialog and worker state', () => {
    for (const locale of ['es', 'en']) {
      const s = stringsFor(locale)
      for (const id of ['es', 'en', 'pseint']) expect(s.profiles[id]?.length).toBeGreaterThan(0)
      for (const panel of ['editor', 'console', 'problems', 'variables'] as const) {
        expect(s.panels[panel].length).toBeGreaterThan(0)
      }
      for (const state of [
        'ready',
        'running',
        'paused',
        'input',
        'waiting',
        'done',
        'error',
      ] as const) {
        expect(s.states[state].length).toBeGreaterThan(0)
      }
    }
  })
})
