import { snippet } from '@codemirror/autocomplete'
import { EditorState, type Transaction } from '@codemirror/state'
import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { blockSnippets, blockTemplates, OPENER_KEYS } from '../src/snippets'
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
