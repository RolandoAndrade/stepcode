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
  it('lists every code of the spec, lexer first then parser', () => {
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

  it('leaves no unresolved slot in any template under the es profile', () => {
    for (const code of DIAGNOSTIC_CODES) {
      const message = formatDiagnostic(
        createDiagnostic(
          code,
          { start: 0, end: 1 },
          {
            text: 'x',
            found: 'x',
            name: 'x',
            bracket: ')',
            openerLine: 3,
            opener: 'if',
            closer: 'endIf',
            expected: 'then',
            modifier: 'byRef',
            form: 'procedure',
            limit: 500,
            first: '<',
            second: '<=',
          },
        ),
        'es',
        profiles.es,
      )
      expect(message, `${code} left a slot unresolved`).not.toMatch(/\{[a-zA-Z$:]+\}/)
    }
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
