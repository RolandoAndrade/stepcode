import type { LookupEntry, OperatorKey, ResolvedProfile } from '@stepcode/profiles'
import type { DiagnosticData } from '../diagnostics/index'
import { createDiagnostic, type Diagnostic, type DiagnosticCode } from '../diagnostics/index'
import type { Token, TokenizeResult, TokenKind } from './token'

const WORD_START = /[\p{L}_]/u
const WORD_PART = /[\p{L}\p{N}_]/u
/** Whitespace that is not a line break: line breaks get their own token kind. */
const BLANK = /[^\S\r\n]/
const HAS_LETTER = /\p{L}/u
const PUNCT = new Set(['(', ')', '[', ']', ',', ':', ';'])

type SymbolicTable = readonly (readonly [string, LookupEntry])[]
type OperatorTable = readonly (readonly [string, OperatorKey])[]

const symbolicCache = new WeakMap<ResolvedProfile, SymbolicTable>()
const operatorCache = new WeakMap<ResolvedProfile, OperatorTable>()

/** Longest first, then alphabetical, so matching is deterministic across runs. */
function byLengthThenText<T extends readonly [string, unknown]>(a: T, b: T): number {
  if (a[0].length !== b[0].length) return b[0].length - a[0].length
  return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
}

/**
 * Keyword/type/builtin spellings that contain no letter (`&`, `|`, `~`, `%`, or whatever a
 * custom profile adds). They live in the punctuation path, ahead of operators.
 *
 * `profile.lookup` is a sealed read-only Map, so this derived table is a brand-new array,
 * memoised per profile object in a `WeakMap`.
 */
export function symbolicKeywords(profile: ResolvedProfile): SymbolicTable {
  const cached = symbolicCache.get(profile)
  if (cached !== undefined) return cached
  const table: SymbolicTable = [...profile.lookup.entries()]
    .filter(([spelling]) => !HAS_LETTER.test(spelling))
    .sort(byLengthThenText)
  symbolicCache.set(profile, table)
  return table
}

function operatorSpellings(profile: ResolvedProfile): OperatorTable {
  const cached = operatorCache.get(profile)
  if (cached !== undefined) return cached
  const table: OperatorTable = [...profile.operatorLookup.entries()].sort(byLengthThenText)
  operatorCache.set(profile, table)
  return table
}

function matchTable<V>(
  table: readonly (readonly [string, V])[],
  source: string,
  at: number,
): readonly [string, V] | undefined {
  for (const entry of table) if (source.startsWith(entry[0], at)) return entry
  return undefined
}

function isDigit(char: string | undefined): boolean {
  return char !== undefined && char >= '0' && char <= '9'
}

/** End offset of the word that starts at `from` (whose first character is a word start). */
function readWord(source: string, from: number): number {
  let end = from + 1
  while (end < source.length) {
    const char = source[end]
    if (char === undefined || !WORD_PART.test(char)) break
    end++
  }
  return end
}

/**
 * One linear pass over the source. Never throws: anything unrecognized becomes an `error`
 * token carrying a diagnostic, and scanning continues at the next character.
 */
export function tokenize(source: string, profile: ResolvedProfile): TokenizeResult {
  const tokens: Token[] = []
  const diagnostics: Diagnostic[] = []
  const symbolic = symbolicKeywords(profile)
  const operators = operatorSpellings(profile)
  const caseSensitive = profile.options.caseSensitive
  const hasDoubleEquals = profile.operatorLookup.has('==')

  const push = (kind: TokenKind, start: number, end: number, value?: Token['value']): void => {
    const text = source.slice(start, end)
    tokens.push(
      value === undefined
        ? { kind, text, span: { start, end } }
        : { kind, text, span: { start, end }, value },
    )
  }
  const report = (
    code: DiagnosticCode,
    start: number,
    end: number,
    data: DiagnosticData = {},
  ): void => {
    diagnostics.push(createDiagnostic(code, { start, end }, data))
  }

  let at = 0
  while (at < source.length) {
    const char = source[at] as string

    // 1. line breaks
    if (char === '\r' || char === '\n') {
      const end = char === '\r' && source[at + 1] === '\n' ? at + 2 : at + 1
      push('newline', at, end)
      at = end
      continue
    }

    // 2. blanks
    if (BLANK.test(char)) {
      let end = at + 1
      while (end < source.length && BLANK.test(source[end] as string)) end++
      push('whitespace', at, end)
      at = end
      continue
    }

    // 3. words: multi-word longest match, then single-word lookup, then identifier
    if (WORD_START.test(char)) {
      const ends: number[] = [readWord(source, at)]
      let scan = ends[0] as number
      while (ends.length < profile.maxWords) {
        let next = scan
        while (next < source.length && BLANK.test(source[next] as string)) next++
        const head = source[next]
        if (head === undefined || !WORD_START.test(head)) break
        scan = readWord(source, next)
        ends.push(scan)
      }
      let matched = false
      for (let index = ends.length - 1; index >= 0; index--) {
        const end = ends[index] as number
        const entry = profile.lookup.get(profile.normalize(source.slice(at, end)))
        if (entry === undefined) continue
        push(entry.kind, at, end, entry.key)
        at = end
        matched = true
        break
      }
      if (matched) continue
      const end = ends[0] as number
      const text = source.slice(at, end)
      // Identifiers are never run through `profile.normalize`: it folds accents too.
      push('identifier', at, end, caseSensitive ? text : text.toLowerCase())
      at = end
      continue
    }

    // 4. numbers
    if (isDigit(char)) {
      let end = at + 1
      while (isDigit(source[end])) end++
      let kind: TokenKind = 'integer'
      if (source[end] === '.' && isDigit(source[end + 1])) {
        end += 2
        while (isDigit(source[end])) end++
        kind = 'real'
      }
      const tail = source[end]
      if (tail !== undefined && WORD_START.test(tail)) {
        const wordEnd = readWord(source, end)
        push('error', at, wordEnd)
        report('E1003', at, wordEnd, { text: source.slice(at, wordEnd) })
        at = wordEnd
        continue
      }
      push(kind, at, end, Number(source.slice(at, end)))
      at = end
      continue
    }

    // 5. strings
    if (char === '"' || char === "'") {
      let end = at + 1
      while (end < source.length) {
        const inner = source[end] as string
        if (inner === char || inner === '\n' || inner === '\r') break
        end++
      }
      if (source[end] === char) {
        push('string', at, end + 1, source.slice(at + 1, end))
        at = end + 1
        continue
      }
      push('string', at, end, source.slice(at + 1, end))
      report('E1002', at, end)
      at = end
      continue
    }

    // 6. `==` is a common mistake, not an operator
    if (!hasDoubleEquals && source.startsWith('==', at)) {
      push('error', at, at + 2)
      report('E1006', at, at + 2)
      at += 2
      continue
    }

    // 7. symbolic keyword spellings, ahead of operators
    const symbol = matchTable(symbolic, source, at)
    if (symbol !== undefined) {
      const [spelling, entry] = symbol
      push(entry.kind, at, at + spelling.length, entry.key)
      at += spelling.length
      continue
    }

    // 8. operators, and the comment spelling
    const operator = matchTable(operators, source, at)
    if (operator !== undefined) {
      const [spelling, key] = operator
      if (key === 'comment') {
        let end = at
        while (end < source.length && source[end] !== '\n' && source[end] !== '\r') end++
        push('comment', at, end)
        at = end
        continue
      }
      push('operator', at, at + spelling.length, key)
      at += spelling.length
      continue
    }

    // 9. punctuation the grammar owns
    if (PUNCT.has(char)) {
      push('punct', at, at + 1, char)
      at += 1
      continue
    }

    // 10. an unrecognized run
    let end = at
    while (end < source.length) {
      const stray = source[end] as string
      if (
        stray === '\r' ||
        stray === '\n' ||
        BLANK.test(stray) ||
        WORD_START.test(stray) ||
        isDigit(stray) ||
        stray === '"' ||
        stray === "'" ||
        PUNCT.has(stray) ||
        matchTable(symbolic, source, end) !== undefined ||
        matchTable(operators, source, end) !== undefined
      ) {
        break
      }
      end++
    }
    if (end === at) end = at + 1
    const text = source.slice(at, end)
    push('error', at, end)
    report('E1001', at, end, text.includes('$') ? { text, hint: 'indexBase' } : { text })
    at = end
  }

  push('eof', source.length, source.length)
  return { tokens, diagnostics }
}
