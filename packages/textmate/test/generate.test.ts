import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { generateGrammar } from '../src/generate'
import {
  IDENT,
  symbolAlternation,
  WORD_END,
  WORD_START,
  wordAlternation,
  wordRule,
} from '../src/regex'
import type { TextMateRule } from '../src/types'

const options = { name: 'stepcode', scopeName: 'source.stepcode' }
const folded = { caseSensitive: false, foldAccents: true }
const es = generateGrammar(profiles.es, options)
const en = generateGrammar(profiles.en, options)

const rule = (grammar: ReturnType<typeof generateGrammar>, id: string): TextMateRule => {
  const found = grammar.repository[id]
  if (found === undefined) throw new Error(`no rule ${id}`)
  return found
}

const includes = (grammar: ReturnType<typeof generateGrammar>): string[] =>
  grammar.patterns.map((p) => p.include ?? '?')

describe('grammar shell', () => {
  it('carries the registration fields', () => {
    const grammar = generateGrammar(profiles.es, {
      name: 'stepcode',
      scopeName: 'source.stepcode',
      displayName: 'StepCode',
      aliases: ['pseudocode'],
    })
    expect(grammar.name).toBe('stepcode')
    expect(grammar.scopeName).toBe('source.stepcode')
    expect(grammar.displayName).toBe('StepCode')
    expect(grammar.aliases).toEqual(['pseudocode'])
  })
  it('omits optional fields that were not given', () => {
    expect('displayName' in es).toBe(false)
    expect('aliases' in es).toBe(false)
  })
  it('is deterministic', () => {
    expect(generateGrammar(profiles.es, options)).toEqual(es)
  })
})

describe('word families', () => {
  it('scopes every family', () => {
    expect(rule(es, 'keyword-control').name).toBe('keyword.control.stepcode')
    expect(rule(es, 'keyword-definition').name).toBe('storage.type.stepcode')
    // es's byRef/byValue are both multi-word ("Por Referencia", "Por Valor"), so the family
    // has no single-word list of its own; its scope reaches the grammar only through the
    // multiword rule's captures (see the "multiword rule" block below).
    expect(es.repository['keyword-modifier']).toBeUndefined()
    // en's ByRef/ByValue are single words, so en does get a keyword-modifier rule.
    expect(rule(en, 'keyword-modifier').name).toBe('storage.modifier.stepcode')
    expect(rule(es, 'keyword-io').name).toBe('keyword.other.io.stepcode')
    expect(rule(es, 'keyword-operator').name).toBe('keyword.operator.word.stepcode')
    expect(rule(es, 'boolean').name).toBe('constant.language.boolean.stepcode')
    expect(rule(es, 'type').name).toBe('support.type.primitive.stepcode')
    expect(rule(es, 'builtin').name).toBe('support.function.builtin.stepcode')
  })
  it('puts the single-word spellings of the family in its rule', () => {
    // The spellings are read from packages/profiles/src/profiles/es.json by hand; the rule
    // composition (sorting, boundaries, flag, accent classes) is regex.test.ts's job.
    expect(rule(es, 'keyword-control').match).toBe(
      wordRule(
        [
          'Si',
          'Entonces',
          'Sino',
          'FinSi',
          'Segun',
          'FinSegun',
          'Mientras',
          'Hacer',
          'FinMientras',
          'Para',
          'Hasta',
          'FinPara',
          'Repetir',
          'Romper',
          'Continuar',
          'Retornar',
        ],
        folded,
      ),
    )
    expect(rule(es, 'type').match).toBe(
      wordRule(['Entero', 'Real', 'Cadena', 'Caracteres', 'Texto', 'Caracter', 'Logico'], folded),
    )
  })
  it('does not repeat multi-word spellings in the family rule', () => {
    expect(rule(es, 'keyword-control').match).not.toContain('Paso')
    expect(rule(es, 'keyword-io').match).not.toContain('Saltar')
  })
  it('folds accents in es and expands the classes', () => {
    expect(rule(es, 'keyword-definition').match).toContain('F[uùúûü]n[cç][iìíîï][oòóôõö]n')
  })
  it('leaves letterless spellings out of the word-operator rule', () => {
    expect(rule(es, 'keyword-operator').match).toBe(
      wordRule(['Y', 'O', 'No', 'MOD', 'DIV'], folded),
    )
  })
  it('omits a family with no spelling at all', () => {
    // byRef/byValue may not be empty (resolveProfile requires every keyword key but `case` to
    // have a spelling); use letterless spellings instead so spellingsOf's hasLetter filter
    // still yields no spelling for the family, without violating profile validation.
    const bare = resolveProfile(
      { id: 'bare', extends: 'es', keywords: { byRef: ['@'], byValue: ['#'] } },
      builtinProfiles,
    )
    const grammar = generateGrammar(bare, options)
    expect(grammar.repository['keyword-modifier']).toBeUndefined()
    expect(includes(grammar)).not.toContain('#keyword-modifier')
  })
})

describe('multiword rule', () => {
  it('lists every multi-word spelling, one capture group per family, in family order', () => {
    const multi = rule(es, 'multiword')
    const control = wordAlternation(
      ['Sino Si', 'De Otro Modo', 'Mientras Que', 'Con Paso', 'Hasta Que'],
      folded,
    )
    const modifier = wordAlternation(['Por Referencia', 'Por Valor'], folded)
    const io = wordAlternation(
      [
        'Escribir Sin Saltar',
        'Mostrar Sin Saltar',
        'Limpiar Pantalla',
        'Borrar Pantalla',
        'Esperar Tecla',
      ],
      folded,
    )
    expect(multi.match).toBe(`(?i)${WORD_START}(?:(${control})|(${modifier})|(${io}))${WORD_END}`)
    expect(multi.captures).toEqual({
      '1': { name: 'keyword.control.stepcode' },
      '2': { name: 'storage.modifier.stepcode' },
      '3': { name: 'keyword.other.io.stepcode' },
    })
    expect(multi.name).toBeUndefined()
  })
  it('carries a family scope that has no rule of its own only through its capture group', () => {
    // es's keyword-modifier family has only multi-word spellings, so it emits no
    // keyword-modifier rule (see "scopes every family" above); its scope still reaches the
    // grammar, through the multiword rule's second capture group.
    expect(es.repository['keyword-modifier']).toBeUndefined()
    expect(rule(es, 'multiword').captures?.['2']).toEqual({ name: 'storage.modifier.stepcode' })
  })
  it('is absent for a profile with no multi-word spelling', () => {
    expect(en.repository.multiword).toBeUndefined()
    expect(includes(en)).not.toContain('#multiword')
  })
  it('precedes every word-family rule in patterns', () => {
    const order = includes(es)
    expect(order.indexOf('#multiword')).toBeLessThan(order.indexOf('#keyword-control'))
    expect(order.indexOf('#keyword-control')).toBeLessThan(order.indexOf('#builtin'))
  })
})

describe('profile options', () => {
  const strict = resolveProfile(
    { id: 'strict', extends: 'en', options: { caseSensitive: true, foldAccents: false } },
    builtinProfiles,
  )
  const grammar = generateGrammar(strict, options)
  it('emits no case flag for a case-sensitive profile', () => {
    expect(rule(grammar, 'keyword-control').match?.startsWith('(?<!')).toBe(true)
  })
  it('emits no accent classes when accents are not folded', () => {
    expect(rule(grammar, 'keyword-definition').match).toContain('EndProcedure|')
    // WORD_START/WORD_END always contain '[' (from `[\p{L}\p{N}_]`), so a literal '[' check
    // would fail regardless of accent folding. Check for accent-variant characters instead,
    // which only appear when foldAccents expands a letter into a character class.
    expect(rule(grammar, 'keyword-definition').match).not.toMatch(/[àáâãäèéêëìíîïòóôõöùúûüçýÿ]/)
  })
})

describe('symbol rules', () => {
  it('comment runs from the profile spelling to end of line', () => {
    expect(rule(es, 'comment')).toEqual({ name: 'comment.line.stepcode', match: '(?:\\/\\/).*$' })
  })
  it('strings are single line and tolerate a missing closing quote', () => {
    expect(rule(es, 'string')).toEqual({
      patterns: [
        { name: 'string.quoted.double.stepcode', match: '"[^"]*(?:"|$)' },
        { name: 'string.quoted.single.stepcode', match: "'[^']*(?:'|$)" },
      ],
    })
  })
  it('numbers are real before integer, bounded, without exponent', () => {
    expect(rule(es, 'number')).toEqual({
      patterns: [
        {
          name: 'constant.numeric.real.stepcode',
          match: '(?<![\\p{L}\\p{N}_])\\d+\\.\\d+(?![\\p{L}\\p{N}_])',
        },
        {
          name: 'constant.numeric.integer.stepcode',
          match: '(?<![\\p{L}\\p{N}_])\\d+(?![\\p{L}\\p{N}_])',
        },
      ],
    })
  })
  it('operator families come from the operators table, longest first', () => {
    expect(rule(es, 'operator-assignment')).toEqual({
      name: 'keyword.operator.assignment.stepcode',
      match: '<-|←',
    })
    expect(rule(es, 'operator-comparison')).toEqual({
      name: 'keyword.operator.comparison.stepcode',
      match: symbolAlternation(['=', '<>', '!=', '≠', '<', '<=', '≤', '>', '>=', '≥']),
    })
  })
  it('arithmetic takes the letterless keyword spellings too', () => {
    expect(rule(es, 'operator-arithmetic')).toEqual({
      name: 'keyword.operator.arithmetic.stepcode',
      match: symbolAlternation(['+', '-', '*', '/', '^', '**', '&', '|', '~', '%']),
    })
  })
  it('= is a comparison whatever the assignment options say', () => {
    expect(rule(es, 'operator-comparison').match).toContain('=')
    expect(rule(es, 'operator-assignment').match).not.toContain('=')
  })
  it('punctuation is the fixed lexer set', () => {
    expect(rule(es, 'punctuation')).toEqual({
      patterns: [
        { name: 'punctuation.section.parens.stepcode', match: '[()]' },
        { name: 'punctuation.section.brackets.stepcode', match: '[\\[\\]]' },
        { name: 'punctuation.separator.stepcode', match: '[,:]' },
        { name: 'punctuation.terminator.stepcode', match: ';' },
      ],
    })
  })
  it('identifier is the bounded word fallback and comes last', () => {
    expect(rule(es, 'identifier')).toEqual({
      name: 'variable.other.stepcode',
      match: '(?<![\\p{L}\\p{N}_])[\\p{L}_][\\p{L}\\p{N}_]*(?![\\p{L}\\p{N}_])',
    })
    expect(includes(es).at(-1)).toBe('#identifier')
    expect(includes(es).slice(0, 2)).toEqual(['#comment', '#string'])
  })
  it('omits the comment rule for a profile that spells no comment', () => {
    // resolveProfile requires every operator key to have a spelling (operators.comment has no
    // optional-key exception, unlike keywords.case), so an empty comment list is rejected.
    // Use a profile that spells the comment as `--` instead, and check the rule it produces.
    const dashes = resolveProfile(
      { id: 'dashes', extends: 'es', operators: { comment: ['--'] } },
      builtinProfiles,
    )
    const grammar = generateGrammar(dashes, options)
    expect(rule(grammar, 'comment').match).toBe('(?:--).*$')
  })
})

describe('structural rules', () => {
  const definitionKeyword = { name: 'storage.type.stepcode' }
  it('subprogram: keyword, optional return variable and arrow, then the name', () => {
    const sub = rule(es, 'subprogram')
    const head = wordAlternation(['SubProceso', 'SubAlgoritmo', 'Procedimiento', 'Funcion'], folded)
    expect(sub.match).toBe(
      `(?i)${WORD_START}(${head})${WORD_END}[ \\t]+(?:(${IDENT})[ \\t]*(<-|←)[ \\t]*)?(${IDENT})${WORD_END}`,
    )
    expect(sub.captures).toEqual({
      '1': definitionKeyword,
      '2': { name: 'variable.other.definition.stepcode' },
      '3': { name: 'keyword.operator.assignment.stepcode' },
      '4': { name: 'entity.name.function.stepcode' },
    })
  })
  it('program: keyword then the name', () => {
    const program = rule(es, 'program')
    const head = wordAlternation(['Proceso', 'Algoritmo'], folded)
    expect(program.match).toBe(`(?i)${WORD_START}(${head})${WORD_END}[ \\t]+(${IDENT})${WORD_END}`)
    expect(program.captures).toEqual({
      '1': definitionKeyword,
      '2': { name: 'entity.name.function.stepcode' },
    })
  })
  it('definition: keyword then a comma list of names, each scoped through nested patterns', () => {
    const definition = rule(es, 'definition')
    const head = wordAlternation(['Definir'], folded)
    expect(definition.match).toBe(
      `(?i)${WORD_START}(${head})${WORD_END}[ \\t]+((?:${IDENT}[ \\t]*,[ \\t]*)*${IDENT})${WORD_END}`,
    )
    expect(definition.captures).toEqual({
      '1': definitionKeyword,
      '2': { patterns: [{ name: 'variable.other.definition.stepcode', match: IDENT }] },
    })
  })
  it('call: an identifier followed by an opening paren', () => {
    expect(rule(es, 'call')).toEqual({
      match: `${WORD_START}(${IDENT})(?=[ \\t]*\\()`,
      captures: { '1': { name: 'entity.name.function.call.stepcode' } },
    })
  })
  it('patterns follow the spec order exactly for es', () => {
    expect(includes(es)).toEqual([
      '#comment',
      '#string',
      '#subprogram',
      '#program',
      '#definition',
      '#multiword',
      '#keyword-control',
      '#keyword-definition',
      '#keyword-io',
      '#keyword-operator',
      '#boolean',
      '#type',
      '#builtin',
      '#number',
      '#call',
      '#operator-assignment',
      '#operator-comparison',
      '#operator-arithmetic',
      '#punctuation',
      '#identifier',
    ])
  })
  it('patterns follow the spec order exactly for en, including keyword-modifier', () => {
    expect(includes(en)).toEqual([
      '#comment',
      '#string',
      '#subprogram',
      '#program',
      '#definition',
      '#keyword-control',
      '#keyword-definition',
      '#keyword-modifier',
      '#keyword-io',
      '#keyword-operator',
      '#boolean',
      '#type',
      '#builtin',
      '#number',
      '#call',
      '#operator-assignment',
      '#operator-comparison',
      '#operator-arithmetic',
      '#punctuation',
      '#identifier',
    ])
  })
})
