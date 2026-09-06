import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'
import { ExternalLink, Lock } from '../src/ui/icons'

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

describe('4c strings', () => {
  const REASONS = ['refused', 'status', 'type', 'size', 'network', 'example', 'hash'] as const
  const SHARE_KEYS = [
    'readOnly',
    'autorun',
    'debug',
    'showProfile',
    'theme',
    'height',
    'copyCode',
    'copyUrl',
    'preview',
    'codeCopied',
  ] as const

  it.each(['es', 'en'])(
    'names the embed, the reasons and the Insertar controls in %s',
    (locale) => {
      const s = stringsFor(locale)
      expect(s.embed.title.length).toBeGreaterThan(0)
      expect(s.embed.readOnly.length).toBeGreaterThan(0)
      expect(s.embed.openInStepCode.length).toBeGreaterThan(0)
      expect(s.embed.loadFailed('XYZ')).toContain('XYZ')
      for (const reason of REASONS) expect(s.src[reason].length, reason).toBeGreaterThan(0)
      for (const key of SHARE_KEYS) expect(s.share[key].length, key).toBeGreaterThan(0)
      expect(s.share.tabs.link.length).toBeGreaterThan(0)
      expect(s.share.tabs.embed.length).toBeGreaterThan(0)
    },
  )

  it('keeps the two locales different where they should differ', () => {
    expect(stringsFor('es').share.tabs.embed).toBe('Insertar')
    expect(stringsFor('en').share.tabs.embed).toBe('Embed')
    expect(stringsFor('es').embed.openInStepCode).toBe('Abrir en StepCode')
  })
})

describe('icons', () => {
  it('exports the two icons the embed top bar needs', () => {
    expect(typeof ExternalLink).toBe('function')
    expect(typeof Lock).toBe('function')
  })
})
