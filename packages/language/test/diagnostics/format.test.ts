import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { en } from '../../src/diagnostics/catalog/en'
import { es } from '../../src/diagnostics/catalog/es'
import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  registerCatalog,
} from '../../src/diagnostics/index'

describe('codes and severities', () => {
  it('lists every code of the spec, lexer first then parser, checker and runtime', () => {
    expect(DIAGNOSTIC_CODES).toEqual([
      'E1001',
      'E1002',
      'E1003',
      'E1006',
      'E2001',
      'E2002',
      'E2003',
      'E2004',
      'E2005',
      'E2006',
      'E2010',
      'E2011',
      'E2012',
      'E2013',
      'E2014',
      'E2015',
      'E2020',
      'E2021',
      'E2022',
      'E2023',
      'E2030',
      'E2031',
      'E2032',
      'W2001',
      'E3001',
      'E3002',
      'E3003',
      'E3004',
      'E3005',
      'E3006',
      'E3007',
      'E3008',
      'E3009',
      'E3010',
      'E3011',
      'E3012',
      'E3013',
      'E3014',
      'E3015',
      'E3016',
      'E3017',
      'E3020',
      'E3021',
      'E3022',
      'E3023',
      'E3024',
      'E3025',
      'E3026',
      'E3027',
      'E3028',
      'E3029',
      'E3030',
      'E3031',
      'E3032',
      'E3033',
      'E3034',
      'E3035',
      'E3036',
      'E3037',
      'W3001',
      'W3002',
      'W3003',
      'W3004',
      'E4001',
      'E4002',
      'E4003',
      'E4004',
      'E4005',
      'E4006',
      'E4007',
      'E4008',
      'E4009',
    ])
  })

  it('fixes one severity per code: only W2001 is a warning', () => {
    for (const code of DIAGNOSTIC_CODES) {
      expect(DIAGNOSTIC_SEVERITY[code]).toBe(code.startsWith('W') ? 'warning' : 'error')
    }
  })

  it('createDiagnostic stamps the severity and defaults data to an empty object', () => {
    const diagnostic = createDiagnostic('E2001', { start: 3, end: 3 })
    expect(diagnostic).toEqual({
      code: 'E2001',
      severity: 'error',
      span: { start: 3, end: 3 },
      data: {},
    })
    expect('related' in diagnostic).toBe(false)
  })

  it('createDiagnostic keeps related spans when given', () => {
    const diagnostic = createDiagnostic('E2003', { start: 0, end: 2 }, { opener: 'if' }, [
      { span: { start: 9, end: 14 } },
    ])
    expect(diagnostic.related).toEqual([{ span: { start: 9, end: 14 } }])
  })
})

describe('catalogs', () => {
  it('es and en both spell every code', () => {
    for (const code of DIAGNOSTIC_CODES) {
      expect(es.templates[code], `es is missing ${code}`).toBeTypeOf('string')
      expect(es.templates[code]?.length).toBeGreaterThan(0)
      expect(en.templates[code], `en is missing ${code}`).toBeTypeOf('string')
      expect(en.templates[code]?.length).toBeGreaterThan(0)
    }
  })

  const SLOT_BAG = {
    text: 'x',
    found: 'Entero',
    name: 'x',
    bracket: ')',
    openerLine: 3,
    opener: 'if',
    closer: 'endIf',
    expected: 'Real',
    modifier: 'byRef',
    form: 'procedure',
    limit: 500,
    first: '<',
    second: '<=',
    suggestion: 'total',
    length: 3,
    op: '+',
    side: 'right',
    position: 2,
    value: '7',
    param: 'n',
    builtin: 'length',
    kw: 'break',
    index: 4,
    low: 1,
    high: 3,
    size: 0,
    depth: 1000,
    type: 'Entero',
    message: 'boom',
  }

  it('leaves no unresolved slot in any template under the es profile', () => {
    for (const code of DIAGNOSTIC_CODES) {
      const message = formatDiagnostic(
        createDiagnostic(code, { start: 0, end: 1 }, SLOT_BAG),
        'es',
        profiles.es,
      )
      expect(message, `${code} left a slot unresolved`).not.toMatch(/\{[a-zA-Z$:]+\}/)
    }
  })

  it('leaves no unresolved slot in any variant of either catalog', () => {
    for (const catalog of [es, en] as const) {
      for (const key of Object.keys(catalog.variants ?? {})) {
        const [code, hint] = key.split('.') as [string, string]
        const message = formatDiagnostic(
          createDiagnostic(
            code as (typeof DIAGNOSTIC_CODES)[number],
            { start: 0, end: 1 },
            {
              ...SLOT_BAG,
              hint,
            },
          ),
          catalog === es ? 'es' : 'en',
          catalog === es ? profiles.es : profiles.en,
        )
        expect(message, `${key} left a slot unresolved`).not.toMatch(/\{[a-zA-Z$:]+\}/)
      }
    }
  })

  it('spells the same variants in es and en', () => {
    expect(Object.keys(es.variants ?? {}).sort()).toEqual(Object.keys(en.variants ?? {}).sort())
  })

  it('resolves the builtin slot through the profile builtin spellings', () => {
    const diagnostic = createDiagnostic('E3013', { start: 0, end: 1 }, {})
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toContain('Subcadena')
    expect(formatDiagnostic(diagnostic, 'en', profiles.en)).toContain('Substring')
  })
})

describe('formatDiagnostic', () => {
  const span = { start: 0, end: 1 }

  it('substitutes plain data slots', () => {
    const message = formatDiagnostic(
      createDiagnostic('E1003', span, { text: '10abc' }),
      'es',
      profiles.es,
    )
    expect(message).toContain('10abc')
  })

  it('substitutes keyword slots with the profile first spelling', () => {
    const diagnostic = createDiagnostic('E2010', span)
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toContain('Proceso')
    expect(formatDiagnostic(diagnostic, 'en', profiles.en)).toContain('Program')
  })

  it('substitutes indirect keyword slots through data', () => {
    const diagnostic = createDiagnostic('E2003', span, {
      opener: 'if',
      closer: 'endIf',
      openerLine: 7,
    })
    const message = formatDiagnostic(diagnostic, 'es', profiles.es)
    expect(message).toContain('FinSi')
    expect(message).toContain('Si')
    expect(message).toContain('7')
  })

  it('falls back to the key itself when the profile spells a keyword with an empty list', () => {
    const diagnostic = createDiagnostic('E2004', span, { expected: 'case' })
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toContain('case')
  })

  it('uses the profile spelling, not a hardcoded word', () => {
    const custom = resolveProfile(
      { id: 'aula', extends: 'es', keywords: { endIf: ['Cerrar Si'] } },
      builtinProfiles,
    )
    const diagnostic = createDiagnostic('E2003', span, {
      opener: 'if',
      closer: 'endIf',
      openerLine: 1,
    })
    expect(formatDiagnostic(diagnostic, 'es', custom)).toContain('Cerrar Si')
  })

  it('picks the hint variant when data.hint names one', () => {
    const plain = formatDiagnostic(
      createDiagnostic('E1001', span, { text: '@' }),
      'es',
      profiles.es,
    )
    const hinted = formatDiagnostic(
      createDiagnostic('E1001', span, { text: '$', hint: 'indexBase' }),
      'es',
      profiles.es,
    )
    expect(plain).not.toContain('indexBase')
    expect(hinted).toContain('indexBase')
  })

  it('falls back pt-BR → pt → en', () => {
    const diagnostic = createDiagnostic('E1002', span)
    expect(formatDiagnostic(diagnostic, 'pt-BR', profiles.es)).toBe(
      formatDiagnostic(diagnostic, 'en', profiles.es),
    )
    registerCatalog('pt', { templates: { ...en.templates, E1002: 'Falta a aspa de fecho.' } })
    expect(formatDiagnostic(diagnostic, 'pt-BR', profiles.es)).toBe('Falta a aspa de fecho.')
    expect(formatDiagnostic(diagnostic, 'pt', profiles.es)).toBe('Falta a aspa de fecho.')
  })

  it('falls back to en for an unknown locale', () => {
    const diagnostic = createDiagnostic('E1002', span)
    expect(formatDiagnostic(diagnostic, 'de', profiles.es)).toBe(
      formatDiagnostic(diagnostic, 'en', profiles.es),
    )
  })

  it('registerCatalog overrides a single code and keeps the rest', () => {
    registerCatalog('es', { templates: { ...es.templates, E2001: 'PONE EL PUNTO Y COMA' } })
    expect(formatDiagnostic(createDiagnostic('E2001', span), 'es', profiles.es)).toBe(
      'PONE EL PUNTO Y COMA',
    )
    registerCatalog('es', es)
    expect(formatDiagnostic(createDiagnostic('E2001', span), 'es', profiles.es)).toBe(
      es.templates.E2001,
    )
  })

  it('leaves a slot verbatim when its data is missing', () => {
    expect(formatDiagnostic(createDiagnostic('E2002', span), 'es', profiles.es)).toContain(
      '{found}',
    )
  })
})
