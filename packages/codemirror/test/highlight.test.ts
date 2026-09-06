import { highlightTree, tags as t, tagHighlighter } from '@lezer/highlight'
import { describe, expect, it } from 'vitest'
import { treeFor } from './helpers'

const highlighter = tagHighlighter([
  { tag: t.controlKeyword, class: 'control' },
  { tag: t.definitionKeyword, class: 'definition' },
  { tag: t.operatorKeyword, class: 'opkeyword' },
  { tag: t.keyword, class: 'keyword' },
  { tag: t.typeName, class: 'type' },
  { tag: t.function(t.standard(t.variableName)), class: 'builtin' },
  { tag: t.definitionOperator, class: 'assign' },
  { tag: t.compareOperator, class: 'compare' },
  { tag: t.arithmeticOperator, class: 'arith' },
  { tag: t.number, class: 'number' },
  { tag: t.string, class: 'string' },
  { tag: t.bool, class: 'bool' },
  { tag: t.lineComment, class: 'comment' },
  { tag: t.function(t.definition(t.variableName)), class: 'fndef' },
  { tag: t.definition(t.variableName), class: 'def' },
  { tag: t.function(t.variableName), class: 'call' },
  { tag: t.variableName, class: 'var' },
  { tag: t.paren, class: 'paren' },
  { tag: t.squareBracket, class: 'bracket' },
  { tag: t.separator, class: 'sep' },
  { tag: t.invalid, class: 'invalid' },
])

/** `[text, classes]` per highlighted range, in order. */
function highlights(source: string): [string, string[]][] {
  const out: [string, string[]][] = []
  highlightTree(treeFor(source), highlighter, (from, to, classes) => {
    out.push([source.slice(from, to), classes.split(' ')])
  })
  return out
}

/** The classes of the first range whose text is `text`. */
function classesOf(source: string, text: string): string[] {
  const found = highlights(source).find(([slice]) => slice === text)
  if (found === undefined) throw new Error(`${text} was not highlighted`)
  return found[1]
}

describe('highlighting', () => {
  const source = [
    'Funcion r <- doble(n Como Entero)',
    '  r <- Abs(n) * 2; // twice',
    'FinFuncion',
    'Proceso p',
    '  Definir a, lista Como Entero;',
    '  Dimension lista[3];',
    '  Si a >= 1 Y Verdadero Entonces',
    '    Escribir "hola", doble(lista[1]);',
    '  FinSi',
    'FinProceso',
  ].join('\n')

  it('keywords by family', () => {
    expect(classesOf(source, 'Si')).toContain('control')
    expect(classesOf(source, 'FinSi')).toContain('control')
    expect(classesOf(source, 'Funcion')).toContain('definition')
    expect(classesOf(source, 'Como')).toContain('definition')
    expect(classesOf(source, 'Y')).toContain('opkeyword')
    expect(classesOf(source, 'Escribir')).toContain('keyword')
    expect(classesOf(source, 'Escribir')).not.toContain('control')
  })

  it('types, builtins, literals, comments', () => {
    expect(classesOf(source, 'Entero')).toContain('type')
    expect(classesOf(source, 'Abs')).toContain('builtin')
    expect(classesOf(source, '2')).toContain('number')
    expect(classesOf(source, '"hola"')).toContain('string')
    expect(classesOf(source, 'Verdadero')).toContain('bool')
    expect(classesOf(source, '// twice')).toContain('comment')
  })

  it('operators by class', () => {
    expect(classesOf(source, '<-')).toContain('assign')
    expect(classesOf(source, '>=')).toContain('compare')
    expect(classesOf(source, '*')).toContain('arith')
  })

  it('identifiers by role', () => {
    const all = highlights(source)
    const roles = all.filter(([text]) => ['doble', 'r', 'n', 'a', 'lista', 'p'].includes(text))
    expect(roles[0]).toEqual(['r', expect.arrayContaining(['def'])])
    expect(roles[1]).toEqual(['doble', expect.arrayContaining(['fndef'])])
    expect(roles[2]).toEqual(['n', expect.arrayContaining(['def'])])
    expect(roles[3]?.[1]).not.toContain('def')
    expect(roles[3]?.[1]).toContain('var')
    const call = all.find(([text, classes]) => text === 'doble' && classes.includes('call'))
    expect(call).toBeDefined()
    expect(call?.[1]).not.toContain('fndef')
  })

  it('punctuation and invalid tokens', () => {
    expect(classesOf(source, '(')).toContain('paren')
    expect(classesOf(source, '[')).toContain('bracket')
    expect(classesOf(source, ',')).toContain('sep')
    expect(highlights('Proceso p\n  ) 3;\nFinProceso').some(([, c]) => c.includes('invalid'))).toBe(
      true,
    )
  })
})
