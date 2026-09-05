import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { tokenize } from '../../src/lexer/index'
import { punctuationTable } from '../../src/lexer/tokenize'
import { tokenSummary } from '../helpers'

const es = profiles.es
const summary = (source: string, profile = es) => tokenSummary(tokenize(source, profile).tokens)
const codes = (source: string, profile = es) =>
  tokenize(source, profile).diagnostics.map((d) => d.code)

describe('words and multi-word longest match', () => {
  it('reads a single-word keyword, type and builtin', () => {
    expect(summary('Si Entero Raiz')).toEqual(['keyword:if', 'type:integer', 'builtin:sqrt', 'eof'])
  })

  it('prefers the longest multi-word spelling', () => {
    expect(summary('Escribir Sin Saltar')).toEqual(['keyword:writeNoNewline', 'eof'])
    expect(summary('Escribir x')).toEqual(['keyword:write', 'identifier:x', 'eof'])
    expect(summary('Sino Si')).toEqual(['keyword:elseIf', 'eof'])
    expect(summary('Sino x')).toEqual(['keyword:else', 'identifier:x', 'eof'])
    expect(summary('Hasta Que')).toEqual(['keyword:until', 'eof'])
    expect(summary('Hasta 5')).toEqual(['keyword:to', 'integer:5', 'eof'])
  })

  it('collapses inner blanks inside a multi-word spelling', () => {
    expect(summary('Escribir   Sin\tSaltar')).toEqual(['keyword:writeNoNewline', 'eof'])
  })

  it('never joins words across a newline', () => {
    expect(summary('Sino\nSi')).toEqual(['keyword:else', 'newline', 'keyword:if', 'eof'])
  })

  it('never joins words across a comment', () => {
    expect(summary('Escribir // Sin Saltar\nSin')).toEqual([
      'keyword:write',
      'newline',
      'identifier:sin',
      'eof',
    ])
  })

  it('falls back to a single-word identifier when no spelling matches', () => {
    expect(summary('Escribir Algo Mas')).toEqual([
      'keyword:write',
      'identifier:algo',
      'identifier:mas',
      'eof',
    ])
  })

  it('matches a three-word keyword from a custom profile', () => {
    const custom = resolveProfile(
      { id: 'aula', extends: 'es', keywords: { break: ['Salir Del Bucle'] } },
      builtinProfiles,
    )
    expect(custom.maxWords).toBe(3)
    expect(tokenSummary(tokenize('Salir Del Bucle', custom).tokens)).toEqual([
      'keyword:break',
      'eof',
    ])
    expect(tokenSummary(tokenize('Salir Del', custom).tokens)).toEqual([
      'identifier:salir',
      'identifier:del',
      'eof',
    ])
  })
})

describe('identifiers', () => {
  it('keeps the written text and lowercases the canonical name by default', () => {
    const { tokens } = tokenize('MiVariable', es)
    const first = tokens[0]!
    expect(first.kind).toBe('identifier')
    expect(first.text).toBe('MiVariable')
    expect(first.value).toBe('mivariable')
  })

  it('keeps case when caseSensitive is on', () => {
    const strict = resolveProfile(
      { id: 'x', extends: 'es', options: { caseSensitive: true } },
      builtinProfiles,
    )
    const { tokens } = tokenize('MiVariable', strict)
    expect(tokens[0]!.value).toBe('MiVariable')
  })

  it('never folds accents in identifiers', () => {
    // 'Función' is deliberately avoided here: its accent-folded form collides with the
    // `function` keyword spelling ('Funcion'), which is a separate, correct scanning rule.
    const { tokens } = tokenize('año Área', es)
    expect(tokens[0]!.value).toBe('año')
    expect(tokens[2]!.value).toBe('área')
  })

  it('accepts digits and underscores after the first character', () => {
    expect(summary('_a1 b_2')).toEqual(['identifier:_a1', 'identifier:b_2', 'eof'])
  })
})

describe('the en profile', () => {
  it('lexes English spellings', () => {
    expect(summary('If Integer Sqrt Print', profiles.en)).toEqual([
      'keyword:if',
      'type:integer',
      'builtin:sqrt',
      'keyword:write',
      'eof',
    ])
  })
})

describe('symbolic keyword spellings', () => {
  it('derives one punctuation table, longest first, cached per profile', () => {
    const table = punctuationTable(es)
    expect(punctuationTable(es)).toBe(table)
    const spellings = table.map(([spelling]) => spelling)
    expect(spellings).toContain('&')
    expect(spellings).toContain('<-')
    expect([...spellings]).toEqual(
      [...spellings].sort((left, right) =>
        left.length === right.length
          ? left < right
            ? -1
            : left > right
              ? 1
              : 0
          : right.length - left.length,
      ),
    )
  })

  it('lets a longer operator win over a shorter symbolic keyword', () => {
    const amp = resolveProfile(
      { id: 'amp', extends: 'es', operators: { power: ['**', '&&'] } },
      builtinProfiles,
    )
    expect(summary('a && b', amp)).toEqual([
      'identifier:a',
      'operator:power',
      'identifier:b',
      'eof',
    ])
    expect(summary('a & b', amp)).toEqual(['identifier:a', 'keyword:and', 'identifier:b', 'eof'])
  })

  it('lexes an operator spelled with letters as that operator', () => {
    const worded = resolveProfile(
      { id: 'worded', extends: 'es', operators: { power: ['elevado'] } },
      builtinProfiles,
    )
    expect(summary('2 elevado 3', worded)).toEqual([
      'integer:2',
      'operator:power',
      'integer:3',
      'eof',
    ])
  })

  it('starts a comment at a comment spelling written with letters', () => {
    const remmed = resolveProfile(
      { id: 'remmed', extends: 'es', operators: { comment: ['REM'] } },
      builtinProfiles,
    )
    const { tokens } = tokenize('a <- 1; REM nota\nb <- 2;', remmed)
    expect(tokenSummary(tokens, true)).toContain('comment:REM nota')
  })

  it('lexes & | ~ % as keywords, not operators', () => {
    expect(summary('a & b | ~ c % d')).toEqual([
      'identifier:a',
      'keyword:and',
      'identifier:b',
      'keyword:or',
      'keyword:not',
      'identifier:c',
      'keyword:mod',
      'identifier:d',
      'eof',
    ])
  })
})

describe('operators', () => {
  it('matches the longest operator spelling first', () => {
    expect(summary('a <= b < c <- d')).toEqual([
      'identifier:a',
      'operator:le',
      'identifier:b',
      'operator:lt',
      'identifier:c',
      'operator:assign',
      'identifier:d',
      'eof',
    ])
    expect(summary('a ** b * c')).toEqual([
      'identifier:a',
      'operator:power',
      'identifier:b',
      'operator:times',
      'identifier:c',
      'eof',
    ])
  })

  it('lexes the unicode spellings', () => {
    expect(summary('a ← b ≥ c ≠ d ≤ e')).toEqual([
      'identifier:a',
      'operator:assign',
      'identifier:b',
      'operator:ge',
      'identifier:c',
      'operator:notEqual',
      'identifier:d',
      'operator:le',
      'identifier:e',
      'eof',
    ])
  })

  it('reports == as one error token', () => {
    expect(summary('a == b')).toEqual(['identifier:a', 'error:==', 'identifier:b', 'eof'])
    expect(codes('a == b')).toEqual(['E1006'])
  })
})

describe('comments', () => {
  it('runs from the comment spelling to the end of the line', () => {
    const { tokens } = tokenize('a // hola\nb', es)
    expect(tokenSummary(tokens, true)).toEqual([
      'identifier:a',
      'whitespace',
      'comment:// hola',
      'newline',
      'identifier:b',
      'eof',
    ])
  })

  it('does not treat a single slash as a comment', () => {
    expect(summary('a / b')).toEqual(['identifier:a', 'operator:divide', 'identifier:b', 'eof'])
  })
})

describe('numbers', () => {
  it('reads integers and reals', () => {
    expect(summary('10 10.5')).toEqual(['integer:10', 'real:10.5', 'eof'])
  })

  it('stops a real at a dot with no digit after it', () => {
    expect(summary('1.')).toEqual(['integer:1', 'error:.', 'eof'])
    expect(codes('1.')).toEqual(['E1001'])
  })

  it('has no leading-dot or exponent form', () => {
    expect(summary('.5')).toEqual(['error:.', 'integer:5', 'eof'])
    expect(summary('1e3')).toEqual(['error:1e3', 'eof'])
    expect(codes('1e3')).toEqual(['E1003'])
  })

  it('reports a number glued to letters as one malformed number', () => {
    expect(summary('10abc')).toEqual(['error:10abc', 'eof'])
    expect(codes('10abc')).toEqual(['E1003'])
  })
})

describe('strings', () => {
  it('accepts both quote styles and stores the content', () => {
    const { tokens } = tokenize(`"Hola" 'Hola'`, es)
    expect(tokens[0]!.value).toBe('Hola')
    expect(tokens[0]!.text).toBe('"Hola"')
    expect(tokens[2]!.value).toBe('Hola')
    expect(tokens[2]!.text).toBe("'Hola'")
  })

  it('keeps the other quote character as content', () => {
    expect(tokenize(`"it's"`, es).tokens[0]!.value).toBe("it's")
  })

  it('has no escape sequences', () => {
    expect(tokenize(String.raw`"a\nb"`, es).tokens[0]!.value).toBe(String.raw`a\nb`)
  })

  it('ends an unterminated string at the line end and lexes the next line normally', () => {
    expect(summary('"abc\nSi')).toEqual(['string:abc', 'newline', 'keyword:if', 'eof'])
    expect(codes('"abc\nSi')).toEqual(['E1002'])
    expect(codes('"abc')).toEqual(['E1002'])
  })
})

describe('newlines and punctuation', () => {
  it('emits one token per line break, whatever the style', () => {
    expect(summary('a\r\nb\rc\nd')).toEqual([
      'identifier:a',
      'newline',
      'identifier:b',
      'newline',
      'identifier:c',
      'newline',
      'identifier:d',
      'eof',
    ])
    expect(tokenize('a\r\nb', es).tokens[1]!.text).toBe('\r\n')
  })

  it('emits one punct token per bracket, comma, colon and semicolon', () => {
    expect(summary('([,:]);')).toEqual([
      'punct:(',
      'punct:[',
      'punct:,',
      'punct::',
      'punct:]',
      'punct:)',
      'punct:;',
      'eof',
    ])
  })
})

describe('errors', () => {
  it('merges consecutive stray characters into one token', () => {
    expect(summary('a @@# b')).toEqual(['identifier:a', 'error:@@#', 'identifier:b', 'eof'])
    expect(codes('a @@# b')).toEqual(['E1001'])
  })

  it('hints at indexBase for a leading $', () => {
    const { diagnostics } = tokenize('$ arrays@stepcode\nProceso p\nFinProceso', es)
    expect(diagnostics[0]!.code).toBe('E1001')
    expect(diagnostics[0]!.data.hint).toBe('indexBase')
  })

  it('records the offending text', () => {
    expect(tokenize('@@', es).diagnostics[0]!.data.text).toBe('@@')
  })
})

describe('losslessness and spans', () => {
  const sources = [
    '',
    'Proceso p\n  Escribir "hola";\nFinProceso\n',
    'a <- 10.5; // nota\r\nb <- "sin cerrar\nc <- 1.;',
    '$ arrays@stepcode\nSi a == b Entonces\nFinSi',
    'Escribir  Sin   Saltar 10abc @@ ≥ ←',
  ]

  it('joins every token text back into the source', () => {
    for (const source of sources) {
      expect(
        tokenize(source, es)
          .tokens.map((t) => t.text)
          .join(''),
      ).toBe(source)
    }
  })

  it('gives every token a span that slices its own text', () => {
    for (const source of sources) {
      for (const token of tokenize(source, es).tokens) {
        expect(source.slice(token.span.start, token.span.end)).toBe(token.text)
      }
    }
  })

  it('always ends with an empty eof token at the end of the source', () => {
    for (const source of sources) {
      const { tokens } = tokenize(source, es)
      const last = tokens[tokens.length - 1]!
      expect(last.kind).toBe('eof')
      expect(last.text).toBe('')
      expect(last.span).toEqual({ start: source.length, end: source.length })
    }
  })

  it('is deterministic', () => {
    for (const source of sources) {
      expect(tokenize(source, es)).toEqual(tokenize(source, es))
    }
  })
})
