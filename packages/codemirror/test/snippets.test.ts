import { snippet } from '@codemirror/autocomplete'
import { EditorState, type Transaction } from '@codemirror/state'
import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  blockSnippets,
  blockTemplates,
  keywordSnippets,
  OPENER_KEYS,
  STATEMENT_KEYS,
  statementTemplates,
} from '../src/snippets'
import { stringsFor } from '../src/strings'
import { en, es } from './helpers'

/** The document after applying `template` over `doc[from..to]`. */
function applied(template: string, doc: string, from: number, to = from): string {
  let state = EditorState.create({ doc })
  const dispatch = (tr: Transaction): void => {
    state = tr.state
  }
  snippet(template)({ state, dispatch }, null, from, to)
  return state.doc.toString()
}

const t = (key: (typeof OPENER_KEYS)[number]): string => {
  const found = blockTemplates(es, stringsFor('es')).get(key)
  if (found === undefined) throw new Error(`no template for ${key}`)
  return found
}

describe('block templates', () => {
  it('spell every opener with the es profile, per spec §5.7', () => {
    expect(t('if')).toBe('Si ${condicion} Entonces\n\t${}\nFinSi')
    expect(t('while')).toBe('Mientras ${condicion} Hacer\n\t${}\nFinMientras')
    expect(t('for')).toBe('Para ${contador} <- ${inicio} Hasta ${limite} Hacer\n\t${}\nFinPara')
    expect(t('repeat')).toBe('Repetir\n\t${}\nHasta Que ${condicion}')
    expect(t('switch')).toBe(
      'Segun ${valor} Hacer\n\t${caso}:\n\t\t${}\n\tDe Otro Modo:\n\t\t\nFinSegun',
    )
    expect(t('function')).toBe(
      'Funcion ${resultado} <- ${nombre}(${parametros})\n\t${}\nFinFuncion',
    )
    expect(t('procedure')).toBe('SubProceso ${nombre}(${parametros})\n\t${}\nFinSubProceso')
    expect(t('program')).toBe('Proceso ${nombre}\n\t${}\nFinProceso')
  })

  it('use = under assignWithEquals and the en spellings under en', () => {
    const templates = blockTemplates(en, stringsFor('en'))
    expect(templates.get('if')).toBe('If ${condition} Then\n\t${}\nEndIf')
    expect(templates.get('for')).toContain('For ${counter} <- ${start} To ${limit} Do')
    const equals = resolveProfile(
      { id: 'es-eq', extends: 'es', options: { assignWithEquals: true } },
      builtinProfiles,
    )
    expect(blockTemplates(equals, stringsFor('es')).get('for')).toContain(
      'Para ${contador} = ${inicio}',
    )
    expect(blockTemplates(equals, stringsFor('es')).get('function')).toContain('${resultado} = ')
  })

  it('cover exactly the opener keys', () => {
    expect([...blockTemplates(es, stringsFor('es')).keys()]).toEqual([...OPENER_KEYS])
  })
})

describe('block snippets', () => {
  it('insert the construct with its closer, indented to the line', () => {
    const doc = 'Proceso p\n  \nFinProceso'
    const from = doc.indexOf('  \n') + 2
    expect(applied(t('if'), doc, from)).toBe(
      'Proceso p\n  Si condicion Entonces\n    \n  FinSi\nFinProceso',
    )
  })

  it('replace the typed prefix', () => {
    expect(applied(t('while'), 'Mien', 0, 4)).toBe('Mientras condicion Hacer\n  \nFinMientras')
  })

  it('are keyword completions labelled by the opener', () => {
    const snippets = blockSnippets(es, stringsFor('es'))
    expect(snippets.get('if')?.label).toBe('Si')
    expect(snippets.get('if')?.type).toBe('keyword')
    expect(typeof snippets.get('if')?.apply).toBe('function')
  })
})

const pseint = profiles.pseint

const st = (key: (typeof STATEMENT_KEYS)[number], profile = es, locale = 'es'): string => {
  const found = statementTemplates(profile, stringsFor(locale)).get(key)
  if (found === undefined) throw new Error(`no template for ${key}`)
  return found
}

describe('statement templates', () => {
  it('spell the es statements with their semicolon', () => {
    expect(st('define')).toBe('Definir ${variable} Como ${tipo};${}')
    expect(st('dimension')).toBe('Dimension ${variable}[${tamano}];${}')
    expect(st('write')).toBe('Escribir ${mensaje};${}')
    expect(st('writeNoNewline')).toBe('Escribir Sin Saltar ${mensaje};${}')
    expect(st('read')).toBe('Leer ${variable};${}')
    expect(st('return')).toBe('Retornar ${valor};${}')
    expect(st('break')).toBe('Romper;${}')
    expect(st('continue')).toBe('Continuar;${}')
    expect(st('else')).toBe('Sino\n\t${}')
    expect(st('elseIf')).toBe('Sino Si ${condicion} Entonces\n\t${}')
  })

  it('spell the en statements in English', () => {
    expect(st('define', en, 'en')).toBe('Define ${variable} As ${type};${}')
    expect(st('write', en, 'en')).toBe('Write ${message};${}')
    expect(st('elseIf', en, 'en')).toBe('ElseIf ${condition} Then\n\t${}')
  })

  it('drop the semicolon where the profile does not require one', () => {
    expect(statementTemplates(pseint, stringsFor('es')).get('write')).toBe('Escribir ${mensaje}${}')
    expect(statementTemplates(pseint, stringsFor('es')).get('break')).toBe('Romper${}')
    expect(statementTemplates(pseint, stringsFor('es')).get('else')).toBe('Sino\n\t${}')
  })

  it('cover exactly the statement keys, none of them an opener', () => {
    expect([...statementTemplates(es, stringsFor('es')).keys()]).toEqual([...STATEMENT_KEYS])
    for (const key of STATEMENT_KEYS) expect(OPENER_KEYS).not.toContain(key)
  })
})

describe('keywordSnippets', () => {
  it('carry both the openers and the statements, described and applied', () => {
    const all = keywordSnippets(es, stringsFor('es'))
    expect(all.get('if')?.label).toBe('Si')
    expect(all.get('write')?.label).toBe('Escribir')
    expect(all.get('write')?.info).toBe('Muestra un valor en la consola.')
    expect(typeof all.get('write')?.apply).toBe('function')
  })

  it('insert the statement at the cursor', () => {
    expect(applied(st('write'), 'Escr', 0, 4)).toBe('Escribir mensaje;')
  })
})
