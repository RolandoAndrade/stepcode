# `stepcode` language sub-spec A — lexer, parser, AST Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `source → tokens → AST` inside `packages/language` (npm `stepcode`): spans and a line map, a data-only diagnostic system with Spanish and English catalogs, a profile-driven lexer with multi-word longest match, the AST node set with a `walk` utility, a Pratt expression parser and a recursive-descent statement parser with error recovery, plus the v1 conformance corpus and property tests.

**Architecture:** Five layers, each a directory under `src/`, each usable alone. `source/` is pure arithmetic over offsets. `diagnostics/` is data (`{ code, severity, span, data }`) plus a separate formatter that resolves message templates against a locale catalog and the active profile's spellings. `lexer/` walks the source once and emits a lossless token stream (trivia included) driven by `ResolvedProfile.lookup` / `operatorLookup` / `maxWords` / `normalize`. `ast/` is a discriminated union on `kind`. `parser/` is a set of free functions over a shared mutable `ParserContext` (cursor, profile, diagnostics, block stack), never throwing: every broken region becomes an `ErrorStmt` / `ErrorExpr`.

**Tech Stack:** TypeScript 7 (strict, ESM), Vitest 4.1, tsdown 0.22, Biome 2.5, `@stepcode/profiles` (workspace), `fast-check` 4 (added in Task 9).

**Spec:** `docs/superpowers/specs/2026-09-03-language-syntax-design.md` (all sections). Parent: `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` §2, §3.1, §3.4, §7 item 3. Profile contract: `docs/superpowers/specs/2026-09-03-profiles-design.md`.

## Global Constraints

These are the spec's binding rules (§2). They hold in every task; do not weaken them.

- **Never throws** on any input. `parse` always returns a `Program`; broken regions become `ErrorStmt` / `ErrorExpr` nodes with spans. `tokenize` likewise always returns a token stream. No function in this package throws for malformed *source* (a malformed *profile* is `@stepcode/profiles`' business and already threw before we are called).
- **Diagnostics are data.** A `Diagnostic` is `{ code, severity, span, data, related? }`. No human text is ever stored in a diagnostic. Text comes only from `formatDiagnostic(d, locale, profile)`, whose catalogs live in this package (`es`, `en`; locale fallback `pt-BR → pt → en`; `registerCatalog` adds or overrides). Templates quote the active profile's first spelling of a construct via `{kw:endIf}` / `{type:integer}` / `{op:equal}` slots.
- **Deterministic**: the same `(source, profile)` produces identical tokens, AST and diagnostics — same order, same spans. No `Map` iteration over unsorted derived data, no `Date`, no randomness.
- **Lossless**: `tokens.map((t) => t.text).join('') === source` for every input; every non-trivia token lies in the token range of exactly one innermost node.
- **Options are read from `profile.options`** (`requireSemicolons`, `assignWithEquals`, `typedParameters`, `caseSensitive`, `indexBase`). The parser takes no separate options object: its signature is `parse(source, { profile })`.
- **The profile's lookup tables are sealed read-only `Map`s.** `profile.lookup.set(...)` throws `TypeError`. Any derived table (symbolic keywords, sorted operator spellings) must be a **new** `Map`/array, cached per profile in a module-level `WeakMap`.
- **Never call `profile.normalize` on an identifier.** `normalize` folds case *and accents* and is only for matching profile spellings. An identifier's canonical name is `text.toLowerCase()` when `!profile.options.caseSensitive`, else `text` verbatim. Accents are never folded in identifiers.
- Biome style: 2-space indent, single quotes, no semicolons, trailing commas, line width 100. Run `pnpm lint:fix` before every commit; `pnpm lint` must exit 0.
- TS strict flags in force from `tsconfig.base.json`: `noUncheckedIndexedAccess` (every index access is `T | undefined` — use `?? fallback` or a local `const`), `exactOptionalPropertyTypes` (never assign `undefined` to an optional property; build the object with the key omitted), `verbatimModuleSyntax` (`import type` for types), `noFallthroughCasesInSwitch`, `isolatedModules`. Imports are extensionless (`./cursor`, `../ast/index`), matching `packages/profiles`.
- TDD: every task writes the failing test first, runs it to see it fail, then implements, then runs it green. Commands run from the repo root: `pnpm vitest run --project stepcode <path>`, `pnpm --filter stepcode typecheck`, `pnpm --filter stepcode build`.
- `packages/language/test/helpers.ts` grows across Tasks 3, 5, 6 and 8. Each task appends new
  exports; merge the new imports into the file's existing import block rather than repeating an
  import statement, and let `pnpm lint:fix` sort them.
- Conventional commit messages, no attribution trailers. Do not push (the controller pushes at the end).

## File Structure

```
packages/language/
  package.json                 add @types/node + fast-check devDependencies (Tasks 9)
  tsconfig.json                add "types": ["node"], include test/helpers.ts
  scripts/extract-corpus.ts    one-off v1 corpus extractor (Task 9)
  src/
    index.ts                   public exports (keeps `packageName`)
    source/index.ts            Span, Position, LineMap
    diagnostics/
      codes.ts                 DiagnosticCode, DIAGNOSTIC_CODES, DIAGNOSTIC_SEVERITY, Severity
      diagnostic.ts            Diagnostic interface, createDiagnostic
      format.ts                Catalog, registerCatalog, formatDiagnostic
      catalog/es.ts, catalog/en.ts
      index.ts
    lexer/
      token.ts                 Token, TokenKind, TokenizeResult
      tokenize.ts              tokenize(), symbolicKeywords()
      index.ts
    ast/
      nodes.ts                 every node interface + Stmt/Expr/Node unions
      walk.ts                  walk(), childrenOf()
      index.ts
    parser/
      cursor.ts                Cursor
      tokens.ts                keywordKeyOf, isPunct, isOperator, …
      context.ts               ParserContext, createContext, report, nodeRange
      expression.ts            parseExpression, parseTarget
      terminator.ts            consumeTerminator, skipToRecoveryPoint
      blocks.ts                BlockFrame, openBlock, parseSection, finishBlock
      block.ts                 parseBlock
      declarations.ts          parseProgram, parseSubprogram, parseParamList, parseTypeRef, parseDefine
      statement.ts             parseStatement + every statement form
      parse.ts                 parse(), ParseResult
      index.ts
  test/
    helpers.ts                 tokenSummary, sexpr, parseExpr, esProfile helpers
    index.test.ts              existing (updated in Task 10)
    source/line-map.test.ts
    diagnostics/format.test.ts
    lexer/tokenize.test.ts
    ast/walk.test.ts
    parser/expression.test.ts
    parser/program.test.ts
    parser/statements-simple.test.ts
    parser/statements-control.test.ts
    parser/statements-switch.test.ts
    parser/options.test.ts
    parser/diagnostics.test.ts
    parser/property.test.ts
    corpus/parse.test.ts
    corpus/programs/*.stepcode  generated, committed
    corpus/programs/index-base-0.txt
```

---

### Task 1: `source/` — Span, Position, LineMap

**Files:**
- Create: `packages/language/src/source/index.ts`
- Test: `packages/language/test/source/line-map.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface Span { readonly start: number; readonly end: number }` — UTF-16 offsets, `end` exclusive.
  - `interface Position { readonly line: number; readonly column: number }` — both 1-based.
  - `class LineMap { constructor(source: string); readonly source: string; get lineCount(): number; positionAt(offset: number): Position; offsetAt(position: Position): number; lineStart(line: number): number; lineEnd(line: number): number }`

- [ ] **Step 1: Write the failing test `packages/language/test/source/line-map.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { LineMap } from '../../src/source/index'

describe('LineMap', () => {
  it('maps offsets to 1-based line and column', () => {
    const map = new LineMap('ab\ncd\n')
    expect(map.positionAt(0)).toEqual({ line: 1, column: 1 })
    expect(map.positionAt(1)).toEqual({ line: 1, column: 2 })
    expect(map.positionAt(2)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(3)).toEqual({ line: 2, column: 1 })
    expect(map.positionAt(5)).toEqual({ line: 2, column: 3 })
  })

  it('counts a CRLF pair as one line break', () => {
    const map = new LineMap('a\r\nb')
    expect(map.lineCount).toBe(2)
    expect(map.positionAt(1)).toEqual({ line: 1, column: 2 })
    expect(map.positionAt(2)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(3)).toEqual({ line: 2, column: 1 })
  })

  it('counts a lone CR as a line break', () => {
    const map = new LineMap('a\rb\rc')
    expect(map.lineCount).toBe(3)
    expect(map.positionAt(2)).toEqual({ line: 2, column: 1 })
    expect(map.positionAt(4)).toEqual({ line: 3, column: 1 })
  })

  it('accepts the offset at end of file and clamps beyond it', () => {
    const map = new LineMap('ab')
    expect(map.positionAt(2)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(99)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(-4)).toEqual({ line: 1, column: 1 })
  })

  it('reports a trailing line break as an extra empty last line', () => {
    const map = new LineMap('a\n')
    expect(map.lineCount).toBe(2)
    expect(map.positionAt(2)).toEqual({ line: 2, column: 1 })
  })

  it('handles the empty source', () => {
    const map = new LineMap('')
    expect(map.lineCount).toBe(1)
    expect(map.positionAt(0)).toEqual({ line: 1, column: 1 })
    expect(map.offsetAt({ line: 1, column: 1 })).toBe(0)
  })

  it('round-trips every offset of a mixed-ending source', () => {
    const source = 'uno\r\ndos\rtres\ncuatro'
    const map = new LineMap(source)
    for (let offset = 0; offset <= source.length; offset++) {
      const position = map.positionAt(offset)
      const back = map.offsetAt(position)
      expect(map.positionAt(back)).toEqual(position)
    }
  })

  it('offsetAt clamps a column past the end of its line to the line end', () => {
    const map = new LineMap('ab\ncdef')
    expect(map.offsetAt({ line: 1, column: 99 })).toBe(2)
    expect(map.offsetAt({ line: 2, column: 3 })).toBe(5)
    expect(map.offsetAt({ line: 99, column: 1 })).toBe(3)
    expect(map.offsetAt({ line: 0, column: 0 })).toBe(0)
  })

  it('exposes line bounds without the terminator', () => {
    const map = new LineMap('ab\r\ncd')
    expect(map.lineStart(1)).toBe(0)
    expect(map.lineEnd(1)).toBe(2)
    expect(map.lineStart(2)).toBe(4)
    expect(map.lineEnd(2)).toBe(6)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/source/line-map.test.ts`
Expected: FAIL — cannot resolve `../../src/source/index`.

- [ ] **Step 3: Write `packages/language/src/source/index.ts`**

```ts
/** A half-open range of UTF-16 offsets into the source: `start` inclusive, `end` exclusive. */
export interface Span {
  readonly start: number
  readonly end: number
}

/** A 1-based line/column pair, the shape editors and error messages want. */
export interface Position {
  readonly line: number
  readonly column: number
}

const LF = 10
const CR = 13

/**
 * Offset ↔ line/column for one source string. Built once per parse and shared: construction
 * is a single linear scan, `positionAt` is a binary search over the line-start table.
 *
 * A CRLF pair is one break, and so is a lone CR — the lexer's `newline` token uses the same
 * rule, so token spans and positions always agree.
 */
export class LineMap {
  /** Offset of the first character of each line, in order; always starts with 0. */
  private readonly starts: readonly number[]

  constructor(readonly source: string) {
    const starts: number[] = [0]
    for (let i = 0; i < source.length; i++) {
      const code = source.charCodeAt(i)
      if (code === CR) {
        if (source.charCodeAt(i + 1) === LF) i++
        starts.push(i + 1)
      } else if (code === LF) {
        starts.push(i + 1)
      }
    }
    this.starts = starts
  }

  /** Number of lines; a source ending in a break has a final empty line. */
  get lineCount(): number {
    return this.starts.length
  }

  /** Offset of the first character of `line` (1-based), clamped into range. */
  lineStart(line: number): number {
    const index = Math.max(0, Math.min(line - 1, this.starts.length - 1))
    return this.starts[index] ?? 0
  }

  /** Offset just past the last character of `line`, excluding its line terminator. */
  lineEnd(line: number): number {
    const index = Math.max(0, Math.min(line - 1, this.starts.length - 1))
    const next = this.starts[index + 1]
    if (next === undefined) return this.source.length
    let end = next
    if (end > 0 && this.source.charCodeAt(end - 1) === LF) end--
    if (end > 0 && this.source.charCodeAt(end - 1) === CR) end--
    return end
  }

  /** The 1-based position of `offset`; offsets outside the source clamp to its ends. */
  positionAt(offset: number): Position {
    const clamped = Math.max(0, Math.min(offset, this.source.length))
    let low = 0
    let high = this.starts.length - 1
    while (low < high) {
      const mid = (low + high + 1) >> 1
      if ((this.starts[mid] ?? 0) <= clamped) low = mid
      else high = mid - 1
    }
    return { line: low + 1, column: clamped - (this.starts[low] ?? 0) + 1 }
  }

  /** The offset of `position`; a line or column out of range clamps to the nearest valid one. */
  offsetAt(position: Position): number {
    const line = Math.max(1, Math.min(position.line, this.starts.length))
    const start = this.lineStart(line)
    const end = this.lineEnd(line)
    const column = Math.max(1, position.column)
    return Math.min(start + column - 1, end)
  }
}
```

- [ ] **Step 4: Run the test, typecheck**

Run: `pnpm vitest run --project stepcode test/source/line-map.test.ts` then `pnpm --filter stepcode typecheck`
Expected: all 9 tests pass; typecheck silent.

- [ ] **Step 5: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): spans, positions and a line map"
```

---

### Task 2: `diagnostics/` — codes, severities, catalogs, formatter

**Files:**
- Create: `packages/language/src/diagnostics/codes.ts`, `diagnostic.ts`, `format.ts`, `catalog/es.ts`, `catalog/en.ts`, `index.ts`
- Test: `packages/language/test/diagnostics/format.test.ts`

**Interfaces:**
- Consumes: `Span` from `../source/index`; `ResolvedProfile` from `@stepcode/profiles`.
- Produces:
  - `type Severity = 'error' | 'warning'`
  - `type DiagnosticCode` — the union of every code in spec §3.3 and §7.1.
  - `const DIAGNOSTIC_CODES: readonly DiagnosticCode[]`
  - `const DIAGNOSTIC_SEVERITY: Readonly<Record<DiagnosticCode, Severity>>`
  - `interface DiagnosticData { readonly [slot: string]: string | number }`
  - `interface Diagnostic { readonly code: DiagnosticCode; readonly severity: Severity; readonly span: Span; readonly data: DiagnosticData; readonly related?: readonly { readonly span: Span }[] }`
  - `function createDiagnostic(code: DiagnosticCode, span: Span, data?: DiagnosticData, related?: readonly { readonly span: Span }[]): Diagnostic`
  - `interface Catalog { readonly templates: Readonly<Record<DiagnosticCode, string>>; readonly variants?: Readonly<Record<string, string>> }`
  - `function registerCatalog(locale: string, catalog: Catalog): void`
  - `function formatDiagnostic(d: Diagnostic, locale: string, profile: ResolvedProfile): string`

**Slot syntax** (spec §7.2, extended twice for cases the spec's own diagnostics need):
- `{name}` — `String(data.name)`; left verbatim when `data` has no such slot.
- `{kw:endIf}` / `{type:integer}` / `{op:equal}` — the profile's **first** spelling of that key; when the profile spells it with an empty list (`case` in `es`), the key itself is used.
- `{kw:$closer}` — indirection: the key is read from `data.closer`. Needed by E2003, E2004, E2006 and E2022, whose keyword varies per occurrence.
- A diagnostic whose `data.hint` is a string first looks for the variant template `` `${code}.${hint}` `` in the catalog's `variants`, falling back to `templates[code]`. E1001 uses this for the `$` / `indexBase` hint.

- [ ] **Step 1: Write the failing test `packages/language/test/diagnostics/format.test.ts`**

```ts
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
      'E2020',
      'E2021',
      'E2022',
      'E2030',
      'E2031',
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
      expect(es.templates[code]!.length).toBeGreaterThan(0)
      expect(en.templates[code], `en is missing ${code}`).toBeTypeOf('string')
      expect(en.templates[code]!.length).toBeGreaterThan(0)
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
    const message = formatDiagnostic(createDiagnostic('E1003', span, { text: '10abc' }), 'es', profiles.es)
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
    const plain = formatDiagnostic(createDiagnostic('E1001', span, { text: '@' }), 'es', profiles.es)
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
    expect(formatDiagnostic(createDiagnostic('E2002', span), 'es', profiles.es)).toContain('{found}')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/diagnostics/format.test.ts`
Expected: FAIL — cannot resolve `../../src/diagnostics/index`.

- [ ] **Step 3: Write `packages/language/src/diagnostics/codes.ts`**

```ts
export type Severity = 'error' | 'warning'

/**
 * Every diagnostic this package can produce. Ranges (spec §7.1): E1xxx lexer;
 * E2001–E2019 statements; E2020–E2029 declarations and headers; E2030–E2039 expressions;
 * W2xxx parser warnings. Later sub-specs use E3xxx (checker) and E4xxx (runtime).
 */
export const DIAGNOSTIC_CODES = [
  'E1001', // unexpected character(s)
  'E1002', // unterminated string
  'E1003', // malformed number
  'E1006', // `==` is not an operator
  'E2001', // expected `;`
  'E2002', // unexpected token
  'E2003', // expected closer for open block
  'E2004', // expected `Entonces` / `Hacer`
  'E2005', // unbalanced bracket
  'E2006', // closer without an open block
  'E2010', // no main block
  'E2011', // second main block
  'E2012', // statement outside a block
  'E2013', // second `De Otro Modo`
  'E2020', // assignment to a call
  'E2021', // parameter without a type
  'E2022', // repeated parameter modifier
  'E2030', // chained comparison
  'E2031', // expected an expression
  'W2001', // empty statement
] as const

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[number]

/** Severity is fixed per code and never varies with context. */
export const DIAGNOSTIC_SEVERITY: Readonly<Record<DiagnosticCode, Severity>> = Object.freeze({
  E1001: 'error',
  E1002: 'error',
  E1003: 'error',
  E1006: 'error',
  E2001: 'error',
  E2002: 'error',
  E2003: 'error',
  E2004: 'error',
  E2005: 'error',
  E2006: 'error',
  E2010: 'error',
  E2011: 'error',
  E2012: 'error',
  E2013: 'error',
  E2020: 'error',
  E2021: 'error',
  E2022: 'error',
  E2030: 'error',
  E2031: 'error',
  W2001: 'warning',
})
```

- [ ] **Step 4: Write `packages/language/src/diagnostics/diagnostic.ts`**

```ts
import type { Span } from '../source/index'
import { type DiagnosticCode, DIAGNOSTIC_SEVERITY, type Severity } from './codes'

/** Template slots. Values are plain data: never a rendered message, never a profile object. */
export interface DiagnosticData {
  readonly [slot: string]: string | number
}

export interface RelatedSpan {
  readonly span: Span
}

/**
 * A diagnostic is data. Human text exists only in `formatDiagnostic`, so the same diagnostic
 * renders in any locale and under any profile's spellings.
 */
export interface Diagnostic {
  readonly code: DiagnosticCode
  readonly severity: Severity
  readonly span: Span
  readonly data: DiagnosticData
  readonly related?: readonly RelatedSpan[]
}

export function createDiagnostic(
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): Diagnostic {
  // `exactOptionalPropertyTypes` forbids writing `related: undefined`, so build both shapes.
  return related === undefined
    ? { code, severity: DIAGNOSTIC_SEVERITY[code], span, data }
    : { code, severity: DIAGNOSTIC_SEVERITY[code], span, data, related }
}
```

- [ ] **Step 5: Write `packages/language/src/diagnostics/format.ts`**

```ts
import type { BuiltinKey, KeywordKey, OperatorKey, ResolvedProfile, TypeKey } from '@stepcode/profiles'
import type { DiagnosticCode } from './codes'
import type { Diagnostic } from './diagnostic'

export interface Catalog {
  /** One template per code. */
  readonly templates: Readonly<Record<DiagnosticCode, string>>
  /** Optional `${code}.${hint}` variants, chosen when `data.hint` matches. */
  readonly variants?: Readonly<Record<string, string>>
}

const catalogs = new Map<string, Catalog>()

/** Adds or replaces the catalog for `locale`. Locales are matched case-insensitively. */
export function registerCatalog(locale: string, catalog: Catalog): void {
  catalogs.set(locale.toLowerCase(), catalog)
}

/**
 * `pt-BR` → `pt` → `en`: drop one subtag at a time, then the ultimate fallback. `en` is
 * always last, so a catalog is always found.
 */
function localeChain(locale: string): string[] {
  const chain: string[] = []
  const parts = locale.toLowerCase().split('-')
  for (let length = parts.length; length > 0; length--) chain.push(parts.slice(0, length).join('-'))
  if (!chain.includes('en')) chain.push('en')
  return chain
}

function templateFor(code: DiagnosticCode, hint: string | undefined, locale: string): string | undefined {
  for (const candidate of localeChain(locale)) {
    const catalog = catalogs.get(candidate)
    if (catalog === undefined) continue
    if (hint !== undefined) {
      const variant = catalog.variants?.[`${code}.${hint}`]
      if (variant !== undefined) return variant
    }
    const template = catalog.templates[code]
    if (template !== undefined) return template
  }
  return undefined
}

/** The profile's first spelling of a construct, or the key itself when it has none. */
function spellingOf(profile: ResolvedProfile, section: string, key: string): string {
  const spellings =
    section === 'kw'
      ? profile.keywords[key as KeywordKey]
      : section === 'type'
        ? profile.types[key as TypeKey]
        : section === 'op'
          ? profile.operators[key as OperatorKey]
          : profile.builtins[key as BuiltinKey]
  return spellings?.[0] ?? key
}

const SLOT = /\{(kw|type|op|fn):(\$?[A-Za-z][A-Za-z0-9]*)\}|\{([A-Za-z][A-Za-z0-9]*)\}/g

/**
 * Renders one diagnostic. Never throws: an unknown code returns the code, a missing data slot
 * is left verbatim so the gap is visible instead of silently blank.
 */
export function formatDiagnostic(
  diagnostic: Diagnostic,
  locale: string,
  profile: ResolvedProfile,
): string {
  const rawHint = diagnostic.data.hint
  const hint = typeof rawHint === 'string' ? rawHint : undefined
  const template = templateFor(diagnostic.code, hint, locale)
  if (template === undefined) return diagnostic.code
  return template.replace(SLOT, (match, section: string | undefined, key: string | undefined, plain: string | undefined) => {
    if (section !== undefined && key !== undefined) {
      const resolved = key.startsWith('$') ? diagnostic.data[key.slice(1)] : key
      if (resolved === undefined) return match
      return spellingOf(profile, section, String(resolved))
    }
    if (plain === undefined) return match
    const value = diagnostic.data[plain]
    return value === undefined ? match : String(value)
  })
}
```

- [ ] **Step 6: Write `packages/language/src/diagnostics/catalog/es.ts`**

Wording rule for both catalogs: address a beginner, name what is missing and what to write instead, never quote an internal key. Every construct name comes from a slot so a custom profile's spellings appear.

```ts
import type { DiagnosticCode } from '../codes'
import type { Catalog } from '../format'

const templates: Record<DiagnosticCode, string> = {
  E1001: 'No entiendo «{text}» aquí.',
  E1002: 'A este texto le falta la comilla de cierre.',
  E1003: '«{text}» no es un número válido: deja un espacio o un operador entre el número y las letras.',
  E1006: '«==» no existe en StepCode: para comparar dos valores se escribe «{op:equal}».',
  E2001: 'Falta «;» al final de esta instrucción.',
  E2002: 'No esperaba «{found}» aquí.',
  E2003: 'Falta «{kw:$closer}» para cerrar el «{kw:$opener}» que empieza en la línea {openerLine}.',
  E2004: 'Falta «{kw:$expected}» aquí.',
  E2005: 'Falta «{bracket}»: hay un paréntesis o un corchete sin cerrar.',
  E2006: '«{kw:$closer}» no cierra ningún bloque abierto.',
  E2010: 'Falta el bloque principal: el programa necesita «{kw:program}» … «{kw:endProgram}».',
  E2011: 'Ya hay un bloque «{kw:program}» en este archivo: solo puede haber uno.',
  E2012: '«{found}» está fuera de todo bloque: ponlo dentro de «{kw:program}» … «{kw:endProgram}».',
  E2013: 'Este «{kw:switch}» ya tiene un «{kw:otherwise}»: solo puede haber uno.',
  E2020: 'No se puede asignar al resultado de una llamada: a la izquierda va una variable.',
  E2021: 'Al parámetro «{name}» le falta su tipo: escribe «{name} {kw:as} {type:integer}», por ejemplo.',
  E2022: 'Este parámetro ya tiene «{kw:$modifier}».',
  E2030: 'No se pueden encadenar comparaciones: escribe «a {text} b {kw:and} b {text} c».',
  E2031: 'Falta una expresión aquí: encontré «{found}».',
  W2001: 'Instrucción vacía: este «;» sobra.',
}

const variants: Record<string, string> = {
  'E1001.indexBase':
    'No entiendo «{text}» aquí. Si querías que los arreglos empiecen en 0, se hace con la opción «indexBase» del perfil, no con una línea en el programa.',
}

export const es: Catalog = { templates, variants }
```

- [ ] **Step 7: Write `packages/language/src/diagnostics/catalog/en.ts`**

```ts
import type { DiagnosticCode } from '../codes'
import type { Catalog } from '../format'

const templates: Record<DiagnosticCode, string> = {
  E1001: 'I do not understand "{text}" here.',
  E1002: 'This text is missing its closing quote.',
  E1003: '"{text}" is not a valid number: leave a space or an operator between the number and the letters.',
  E1006: '"==" is not part of StepCode: write "{op:equal}" to compare two values.',
  E2001: 'This statement is missing its ";".',
  E2002: 'I did not expect "{found}" here.',
  E2003: '"{kw:$closer}" is missing: the "{kw:$opener}" on line {openerLine} is never closed.',
  E2004: '"{kw:$expected}" is missing here.',
  E2005: '"{bracket}" is missing: a bracket is left open.',
  E2006: '"{kw:$closer}" does not close any open block.',
  E2010: 'The main block is missing: a program needs "{kw:program}" … "{kw:endProgram}".',
  E2011: 'There is already a "{kw:program}" block in this file: only one is allowed.',
  E2012: '"{found}" is outside every block: put it inside "{kw:program}" … "{kw:endProgram}".',
  E2013: 'This "{kw:switch}" already has an "{kw:otherwise}": only one is allowed.',
  E2020: 'You cannot assign to the result of a call: the left side must be a variable.',
  E2021: 'Parameter "{name}" has no type: write "{name} {kw:as} {type:integer}", for example.',
  E2022: 'This parameter already has "{kw:$modifier}".',
  E2030: 'Comparisons cannot be chained: write "a {text} b {kw:and} b {text} c".',
  E2031: 'An expression is missing here: I found "{found}".',
  W2001: 'Empty statement: this ";" is not needed.',
}

const variants: Record<string, string> = {
  'E1001.indexBase':
    'I do not understand "{text}" here. To make arrays start at 0, use the profile option "indexBase" instead of a line in the program.',
}

export const en: Catalog = { templates, variants }
```

- [ ] **Step 8: Write `packages/language/src/diagnostics/index.ts`**

```ts
import { en } from './catalog/en'
import { es } from './catalog/es'
import { registerCatalog } from './format'

// The two shipped catalogs are registered at module load; `en` is the ultimate fallback.
registerCatalog('es', es)
registerCatalog('en', en)

export type { DiagnosticCode, Severity } from './codes'
export { DIAGNOSTIC_CODES, DIAGNOSTIC_SEVERITY } from './codes'
export type { Diagnostic, DiagnosticData, RelatedSpan } from './diagnostic'
export { createDiagnostic } from './diagnostic'
export type { Catalog } from './format'
export { formatDiagnostic, registerCatalog } from './format'
export { en } from './catalog/en'
export { es } from './catalog/es'
```

- [ ] **Step 9: Run the test, typecheck**

Run: `pnpm vitest run --project stepcode test/diagnostics/format.test.ts` then `pnpm --filter stepcode typecheck`
Expected: every test passes; typecheck silent. If the "no unresolved slot" test fails for a code, the template used a slot the test's data object does not provide — either add the slot's value to that test object or reword the template.

- [ ] **Step 10: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): diagnostic codes, severities and es/en catalogs"
```

---

### Task 3: `lexer/` — tokenize

**Files:**
- Create: `packages/language/src/lexer/token.ts`, `tokenize.ts`, `index.ts`
- Create: `packages/language/test/helpers.ts`
- Test: `packages/language/test/lexer/tokenize.test.ts`

**Interfaces:**
- Consumes: `Span` from `../source/index`; `createDiagnostic`, `Diagnostic` from `../diagnostics/index`; `ResolvedProfile`, `LookupEntry`, `BuiltinKey`, `KeywordKey`, `OperatorKey`, `TypeKey` from `@stepcode/profiles`.
- Produces:
  - `type TokenKind = 'keyword' | 'type' | 'builtin' | 'operator' | 'identifier' | 'integer' | 'real' | 'string' | 'punct' | 'newline' | 'whitespace' | 'comment' | 'error' | 'eof'`
  - `interface Token { readonly kind: TokenKind; readonly text: string; readonly span: Span; readonly value?: KeywordKey | TypeKey | BuiltinKey | OperatorKey | string | number }`
  - `interface TokenizeResult { readonly tokens: Token[]; readonly diagnostics: Diagnostic[] }`
  - `function tokenize(source: string, profile: ResolvedProfile): TokenizeResult`
  - `function symbolicKeywords(profile: ResolvedProfile): readonly (readonly [string, LookupEntry])[]` — the profile's letter-free keyword/type/builtin spellings, longest first, cached per profile in a `WeakMap`.
- Test helper produced here (grows in Tasks 5 and 9): `tokenSummary(tokens, includeTrivia?): string[]` in `test/helpers.ts`.

**Scanning order** (spec §3.2). At each offset, in this exact order:
1. `\r\n`, `\r`, `\n` → one `newline`.
2. A run of blanks that are not line breaks → one `whitespace`.
3. A word start (`\p{L}` or `_`) → the multi-word longest-match path.
4. A digit → the number path.
5. `"` or `'` → the string path.
6. `==` when the profile has no `==` operator spelling → one `error` token, E1006.
7. Symbolic keyword spellings, longest first.
8. Operator spellings, longest first; the `comment` key runs to end of line as a `comment` token.
9. One of `( ) [ ] , : ;` → `punct`.
10. Anything else → an `error` run, E1001; consecutive unrecognized characters merge into one token.

- [ ] **Step 1: Write `packages/language/test/helpers.ts`**

A plain module, not a test file — importing a `*.test.ts` from another test would register its suites twice.

```ts
import type { Token } from '../src/lexer/index'

/**
 * A token stream as `kind:value` strings, the compact form the lexer tests assert against.
 * Whitespace and comments are dropped unless `includeTrivia` is set; newlines always show.
 */
export function tokenSummary(tokens: readonly Token[], includeTrivia = false): string[] {
  const out: string[] = []
  for (const token of tokens) {
    switch (token.kind) {
      case 'whitespace':
        if (includeTrivia) out.push('whitespace')
        break
      case 'comment':
        if (includeTrivia) out.push(`comment:${token.text}`)
        break
      case 'newline':
        out.push('newline')
        break
      case 'eof':
        out.push('eof')
        break
      case 'error':
        out.push(`error:${token.text}`)
        break
      default:
        out.push(`${token.kind}:${String(token.value ?? token.text)}`)
        break
    }
  }
  return out
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/lexer/tokenize.test.ts`**

```ts
import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { symbolicKeywords, tokenize } from '../../src/lexer/index'
import { tokenSummary } from '../helpers'

const es = profiles.es
const summary = (source: string, profile = es) => tokenSummary(tokenize(source, profile).tokens)
const codes = (source: string, profile = es) =>
  tokenize(source, profile).diagnostics.map((d) => d.code)

describe('words and multi-word longest match', () => {
  it('reads a single-word keyword, type and builtin', () => {
    expect(summary('Si Entero Raiz')).toEqual([
      'keyword:if',
      'type:integer',
      'builtin:sqrt',
      'eof',
    ])
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
    const strict = resolveProfile({ id: 'x', extends: 'es', options: { caseSensitive: true } }, builtinProfiles)
    const { tokens } = tokenize('MiVariable', strict)
    expect(tokens[0]!.value).toBe('MiVariable')
  })

  it('never folds accents in identifiers', () => {
    const { tokens } = tokenize('año Función', es)
    expect(tokens[0]!.value).toBe('año')
    expect(tokens[2]!.value).toBe('función')
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
  it('derives a letter-free table, longest first, cached per profile', () => {
    const table = symbolicKeywords(es)
    expect(symbolicKeywords(es)).toBe(table)
    expect([...table.map(([spelling]) => spelling)].sort()).toEqual(['%', '&', '|', '~'])
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
      expect(tokenize(source, es).tokens.map((t) => t.text).join('')).toBe(source)
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/lexer/tokenize.test.ts`
Expected: FAIL — cannot resolve `../../src/lexer/index`.

- [ ] **Step 4: Write `packages/language/src/lexer/token.ts`**

```ts
import type { BuiltinKey, KeywordKey, OperatorKey, TypeKey } from '@stepcode/profiles'
import type { Diagnostic } from '../diagnostics/index'
import type { Span } from '../source/index'

export type TokenKind =
  | 'keyword'
  | 'type'
  | 'builtin'
  | 'operator'
  | 'identifier'
  | 'integer'
  | 'real'
  | 'string'
  | 'punct'
  | 'newline'
  | 'whitespace'
  | 'comment'
  | 'error'
  | 'eof'

/**
 * `text` is always the exact source slice, so the stream is lossless. `value` carries the
 * decoded meaning: the profile key for a construct, the canonical name for an identifier,
 * the number for a literal, the quote-free content for a string, the character for punct.
 */
export interface Token {
  readonly kind: TokenKind
  readonly text: string
  readonly span: Span
  readonly value?: KeywordKey | TypeKey | BuiltinKey | OperatorKey | string | number
}

export interface TokenizeResult {
  readonly tokens: Token[]
  readonly diagnostics: Diagnostic[]
}

/** Trivia never reaches the parser's significant-token view. */
export function isTrivia(token: Token): boolean {
  return token.kind === 'whitespace' || token.kind === 'comment'
}
```

- [ ] **Step 5: Write `packages/language/src/lexer/tokenize.ts`**

```ts
import type { LookupEntry, OperatorKey, ResolvedProfile } from '@stepcode/profiles'
import { createDiagnostic, type Diagnostic, type DiagnosticCode } from '../diagnostics/index'
import type { DiagnosticData } from '../diagnostics/index'
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
    tokens.push(value === undefined ? { kind, text, span: { start, end } } : { kind, text, span: { start, end }, value })
  }
  const report = (code: DiagnosticCode, start: number, end: number, data: DiagnosticData = {}): void => {
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
```

- [ ] **Step 6: Write `packages/language/src/lexer/index.ts`**

```ts
export type { Token, TokenizeResult, TokenKind } from './token'
export { isTrivia } from './token'
export { symbolicKeywords, tokenize } from './tokenize'
```

- [ ] **Step 7: Run the test, typecheck**

Run: `pnpm vitest run --project stepcode test/lexer/tokenize.test.ts` then `pnpm --filter stepcode typecheck`
Expected: every test passes; typecheck silent. Two traps to expect: `test/tsconfig` must see `test/helpers.ts` (fixed in Task 9's tsconfig edit — until then `pnpm --filter stepcode typecheck` simply does not check that file), and the symbolic table test compares a sorted array so the `~` entry order does not matter.

- [ ] **Step 8: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): profile-driven lexer with multi-word longest match"
```

---

### Task 4: `ast/` — nodes and walk

**Files:**
- Create: `packages/language/src/ast/nodes.ts`, `walk.ts`, `index.ts`
- Test: `packages/language/test/ast/walk.test.ts`

**Interfaces:**
- Consumes: `Span` from `../source/index`; `BuiltinKey`, `TypeKey` from `@stepcode/profiles`.
- Produces: every node interface of spec §6, the `Stmt` / `Expr` / `Node` unions, `BinaryOp`, `UnaryOp`, plus `walk(node, visitor)`, `childrenOf(node)`, `interface Visitor`.

Every node is `{ kind, span, tokens: [first, last] }` plus its own fields; `tokens` are inclusive indices into `ParseResult.tokens`. `kind` is the spec's node name verbatim (`'IfStmt'`, `'BuiltinCall'`, …). `IfStmt.branches`, `SwitchStmt.cases` and `DimensionStmt.items` hold plain records, not nodes — `childrenOf` descends into them by hand.

- [ ] **Step 1: Write the failing test `packages/language/test/ast/walk.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { Expr, IfStmt, Literal, Node, Program } from '../../src/ast/index'
import { childrenOf, walk } from '../../src/ast/index'

const span = { start: 0, end: 0 }
const at = (): { span: { start: number; end: number }; tokens: [number, number] } => ({
  span,
  tokens: [0, 0],
})

const literal = (value: number): Literal => ({ kind: 'Literal', value, type: 'integer', ...at() })
const ident = (name: string): Expr => ({ kind: 'Identifier', name, text: name, ...at() })

const ifStmt: IfStmt = {
  kind: 'IfStmt',
  branches: [
    {
      condition: { kind: 'Binary', op: 'lt', left: ident('a'), right: literal(1), ...at() },
      body: [{ kind: 'WriteStmt', args: [literal(2)], newline: true, ...at() }],
    },
    {
      condition: ident('b'),
      body: [{ kind: 'WriteStmt', args: [literal(3)], newline: true, ...at() }],
    },
  ],
  elseBody: [{ kind: 'WriteStmt', args: [literal(4)], newline: true, ...at() }],
  ...at(),
}

const program: Program = {
  kind: 'Program',
  subprograms: [],
  main: {
    kind: 'MainBlock',
    name: { kind: 'Identifier', name: 'p', text: 'p', ...at() },
    body: [ifStmt],
    ...at(),
  },
  ...at(),
}

const kinds = (node: Node): string[] => {
  const seen: string[] = []
  walk(node, { enter: (n) => void seen.push(n.kind) })
  return seen
}

describe('childrenOf', () => {
  it('descends into branch records in source order', () => {
    expect(childrenOf(ifStmt).map((n) => n.kind)).toEqual([
      'Binary',
      'WriteStmt',
      'Identifier',
      'WriteStmt',
      'WriteStmt',
    ])
  })

  it('returns nothing for a leaf', () => {
    expect(childrenOf(literal(1))).toEqual([])
    expect(childrenOf({ kind: 'BreakStmt', ...at() })).toEqual([])
  })
})

describe('walk', () => {
  it('visits parents before children, in source order', () => {
    expect(kinds(program)).toEqual([
      'Program',
      'MainBlock',
      'Identifier',
      'IfStmt',
      'Binary',
      'Identifier',
      'Literal',
      'WriteStmt',
      'Literal',
      'Identifier',
      'WriteStmt',
      'Literal',
      'WriteStmt',
      'Literal',
    ])
  })

  it('passes the parent, null at the root', () => {
    const pairs: [string, string | null][] = []
    walk(program, { enter: (node, parent) => void pairs.push([node.kind, parent?.kind ?? null]) })
    expect(pairs[0]).toEqual(['Program', null])
    expect(pairs[1]).toEqual(['MainBlock', 'Program'])
    expect(pairs[3]).toEqual(['IfStmt', 'MainBlock'])
  })

  it('skips the children of a node whose enter returns false', () => {
    const seen: string[] = []
    walk(program, {
      enter: (node) => {
        seen.push(node.kind)
        return node.kind !== 'IfStmt'
      },
    })
    expect(seen).toEqual(['Program', 'MainBlock', 'Identifier', 'IfStmt'])
  })

  it('does not call exit for a skipped node', () => {
    const exited: string[] = []
    walk(ifStmt, {
      enter: (node) => node.kind !== 'Binary',
      exit: (node) => void exited.push(node.kind),
    })
    expect(exited).not.toContain('Binary')
    expect(exited).toContain('IfStmt')
  })

  it('calls exit after all children, innermost first', () => {
    const exited: string[] = []
    walk(ifStmt.branches[0]!.condition, { exit: (node) => void exited.push(node.kind) })
    expect(exited).toEqual(['Identifier', 'Literal', 'Binary'])
  })

  it('a visitor with neither hook is a no-op', () => {
    expect(() => walk(program, {})).not.toThrow()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/ast/walk.test.ts`
Expected: FAIL — cannot resolve `../../src/ast/index`.

- [ ] **Step 3: Write `packages/language/src/ast/nodes.ts`**

```ts
import type { BuiltinKey, TypeKey } from '@stepcode/profiles'
import type { Span } from '../source/index'

/** Inclusive first/last token indices into `ParseResult.tokens`. */
export type TokenRange = readonly [number, number]

interface NodeBase {
  readonly span: Span
  readonly tokens: TokenRange
}

export type BinaryOp =
  | 'plus'
  | 'minus'
  | 'times'
  | 'divide'
  | 'power'
  | 'div'
  | 'mod'
  | 'equal'
  | 'notEqual'
  | 'lt'
  | 'le'
  | 'gt'
  | 'ge'
  | 'and'
  | 'or'

export type UnaryOp = 'minus' | 'plus' | 'not'

export type LiteralType = 'integer' | 'real' | 'string' | 'boolean'

// --- structure -------------------------------------------------------------

export interface Program extends NodeBase {
  readonly kind: 'Program'
  readonly subprograms: readonly SubprogramDecl[]
  readonly main: MainBlock | null
}

export interface MainBlock extends NodeBase {
  readonly kind: 'MainBlock'
  readonly name: Identifier
  readonly body: readonly Stmt[]
}

export interface SubprogramDecl extends NodeBase {
  readonly kind: 'SubprogramDecl'
  readonly form: 'procedure' | 'function'
  readonly name: Identifier
  readonly params: readonly Param[]
  readonly returnName?: Identifier
  readonly returnType?: TypeRef
  readonly body: readonly Stmt[]
}

export interface Param extends NodeBase {
  readonly kind: 'Param'
  readonly name: Identifier
  readonly type?: TypeRef
  readonly byRef: boolean
}

/** `dimensions`: `[]` scalar; `[null]` is `T[]`; `[null, null]` is `T[,]`; `[e1, e2]` is sized. */
export interface TypeRef extends NodeBase {
  readonly kind: 'TypeRef'
  readonly base: TypeKey
  readonly dimensions: readonly (Expr | null)[]
}

export interface Identifier extends NodeBase {
  readonly kind: 'Identifier'
  /** Canonical name: `text.toLowerCase()` unless the profile is case sensitive. */
  readonly name: string
  /** Exactly as written in the source. */
  readonly text: string
}

// --- statements ------------------------------------------------------------

export interface DefineStmt extends NodeBase {
  readonly kind: 'DefineStmt'
  readonly names: readonly Identifier[]
  readonly type: TypeRef
}

export interface DimensionItem {
  readonly name: Identifier
  readonly sizes: readonly Expr[]
}

export interface DimensionStmt extends NodeBase {
  readonly kind: 'DimensionStmt'
  readonly items: readonly DimensionItem[]
}

export interface ConstantStmt extends NodeBase {
  readonly kind: 'ConstantStmt'
  readonly name: Identifier
  readonly type?: TypeRef
  readonly value: Expr
}

export interface AssignStmt extends NodeBase {
  readonly kind: 'AssignStmt'
  readonly target: Identifier | Index
  readonly value: Expr
  readonly viaEquals: boolean
}

export interface WriteStmt extends NodeBase {
  readonly kind: 'WriteStmt'
  readonly args: readonly Expr[]
  /** `false` for the writeNoNewline form. */
  readonly newline: boolean
}

export interface ReadStmt extends NodeBase {
  readonly kind: 'ReadStmt'
  readonly targets: readonly (Identifier | Index)[]
}

export interface IfBranch {
  readonly condition: Expr
  readonly body: readonly Stmt[]
}

export interface IfStmt extends NodeBase {
  readonly kind: 'IfStmt'
  /** The `if` branch first, then every `elseIf` branch in source order. */
  readonly branches: readonly IfBranch[]
  readonly elseBody?: readonly Stmt[]
}

export interface SwitchCase {
  readonly values: readonly Expr[]
  readonly body: readonly Stmt[]
}

export interface SwitchStmt extends NodeBase {
  readonly kind: 'SwitchStmt'
  readonly selector: Expr
  readonly cases: readonly SwitchCase[]
  readonly otherwise?: readonly Stmt[]
}

export interface WhileStmt extends NodeBase {
  readonly kind: 'WhileStmt'
  readonly condition: Expr
  readonly body: readonly Stmt[]
}

export interface RepeatStmt extends NodeBase {
  readonly kind: 'RepeatStmt'
  readonly body: readonly Stmt[]
  readonly condition: Expr
  /** `true` when closed with the `until` keyword, `false` for the `while` closer. */
  readonly until: boolean
}

export interface ForStmt extends NodeBase {
  readonly kind: 'ForStmt'
  readonly counter: Identifier
  readonly from: Expr
  readonly to: Expr
  readonly step?: Expr
  readonly body: readonly Stmt[]
}

export interface BreakStmt extends NodeBase {
  readonly kind: 'BreakStmt'
}

export interface ContinueStmt extends NodeBase {
  readonly kind: 'ContinueStmt'
}

export interface ReturnStmt extends NodeBase {
  readonly kind: 'ReturnStmt'
  readonly value?: Expr
}

export interface CallStmt extends NodeBase {
  readonly kind: 'CallStmt'
  readonly call: Call | BuiltinCall
}

export interface ClearStmt extends NodeBase {
  readonly kind: 'ClearStmt'
}

export interface WaitStmt extends NodeBase {
  readonly kind: 'WaitStmt'
  readonly millis: Expr
}

export interface WaitKeyStmt extends NodeBase {
  readonly kind: 'WaitKeyStmt'
}

export interface ErrorStmt extends NodeBase {
  readonly kind: 'ErrorStmt'
}

// --- expressions -----------------------------------------------------------

export interface Literal extends NodeBase {
  readonly kind: 'Literal'
  readonly value: number | string | boolean
  readonly type: LiteralType
}

export interface Index extends NodeBase {
  readonly kind: 'Index'
  readonly target: Expr
  /** `a[i,j]` and `a[i][j]` both produce one node with two indices. */
  readonly indices: readonly Expr[]
}

export interface Call extends NodeBase {
  readonly kind: 'Call'
  readonly callee: Identifier
  readonly args: readonly Expr[]
}

export interface BuiltinCall extends NodeBase {
  readonly kind: 'BuiltinCall'
  readonly key: BuiltinKey
  readonly args: readonly Expr[]
}

export interface Unary extends NodeBase {
  readonly kind: 'Unary'
  readonly op: UnaryOp
  readonly operand: Expr
}

export interface Binary extends NodeBase {
  readonly kind: 'Binary'
  readonly op: BinaryOp
  readonly left: Expr
  readonly right: Expr
}

export interface ErrorExpr extends NodeBase {
  readonly kind: 'ErrorExpr'
}

export type Expr = Literal | Identifier | Index | Call | BuiltinCall | Unary | Binary | ErrorExpr

export type Stmt =
  | DefineStmt
  | DimensionStmt
  | ConstantStmt
  | AssignStmt
  | WriteStmt
  | ReadStmt
  | IfStmt
  | SwitchStmt
  | WhileStmt
  | RepeatStmt
  | ForStmt
  | BreakStmt
  | ContinueStmt
  | ReturnStmt
  | CallStmt
  | ClearStmt
  | WaitStmt
  | WaitKeyStmt
  | ErrorStmt

export type Node = Program | MainBlock | SubprogramDecl | Param | TypeRef | Stmt | Expr
```

- [ ] **Step 4: Write `packages/language/src/ast/walk.ts`**

```ts
import type { Expr, Node } from './nodes'

export interface Visitor {
  /** Return `false` to skip this node's children (and its `exit` call). */
  enter?(node: Node, parent: Node | null): boolean | void
  exit?(node: Node, parent: Node | null): void
}

/** Every child node, in source order. Plain records (branches, cases, items) are flattened. */
export function childrenOf(node: Node): Node[] {
  switch (node.kind) {
    case 'Program':
      return node.main === null ? [...node.subprograms] : [...node.subprograms, node.main]
    case 'MainBlock':
      return [node.name, ...node.body]
    case 'SubprogramDecl': {
      const children: Node[] = [node.name, ...node.params]
      if (node.returnName !== undefined) children.push(node.returnName)
      if (node.returnType !== undefined) children.push(node.returnType)
      children.push(...node.body)
      return children
    }
    case 'Param':
      return node.type === undefined ? [node.name] : [node.name, node.type]
    case 'TypeRef':
      return node.dimensions.filter((dimension): dimension is Expr => dimension !== null)
    case 'DefineStmt':
      return [...node.names, node.type]
    case 'DimensionStmt':
      return node.items.flatMap((item) => [item.name, ...item.sizes])
    case 'ConstantStmt':
      return node.type === undefined ? [node.name, node.value] : [node.name, node.type, node.value]
    case 'AssignStmt':
      return [node.target, node.value]
    case 'WriteStmt':
      return [...node.args]
    case 'ReadStmt':
      return [...node.targets]
    case 'IfStmt': {
      const children: Node[] = node.branches.flatMap((branch) => [branch.condition, ...branch.body])
      if (node.elseBody !== undefined) children.push(...node.elseBody)
      return children
    }
    case 'SwitchStmt': {
      const children: Node[] = [node.selector]
      for (const entry of node.cases) children.push(...entry.values, ...entry.body)
      if (node.otherwise !== undefined) children.push(...node.otherwise)
      return children
    }
    case 'WhileStmt':
      return [node.condition, ...node.body]
    case 'RepeatStmt':
      return [...node.body, node.condition]
    case 'ForStmt': {
      const children: Node[] = [node.counter, node.from, node.to]
      if (node.step !== undefined) children.push(node.step)
      children.push(...node.body)
      return children
    }
    case 'ReturnStmt':
      return node.value === undefined ? [] : [node.value]
    case 'CallStmt':
      return [node.call]
    case 'WaitStmt':
      return [node.millis]
    case 'Index':
      return [node.target, ...node.indices]
    case 'Call':
      return [node.callee, ...node.args]
    case 'BuiltinCall':
      return [...node.args]
    case 'Unary':
      return [node.operand]
    case 'Binary':
      return [node.left, node.right]
    case 'BreakStmt':
    case 'ContinueStmt':
    case 'ClearStmt':
    case 'WaitKeyStmt':
    case 'ErrorStmt':
    case 'Literal':
    case 'Identifier':
    case 'ErrorExpr':
      return []
  }
}

/**
 * The single traversal utility: the checker, the interpreter and the CodeMirror package all
 * use it. Depth-first, parents before children, children in source order.
 */
export function walk(node: Node, visitor: Visitor): void {
  const visit = (current: Node, parent: Node | null): void => {
    if (visitor.enter?.(current, parent) === false) return
    for (const child of childrenOf(current)) visit(child, current)
    visitor.exit?.(current, parent)
  }
  visit(node, null)
}
```

- [ ] **Step 5: Write `packages/language/src/ast/index.ts`**

```ts
export type {
  AssignStmt,
  Binary,
  BinaryOp,
  BreakStmt,
  BuiltinCall,
  Call,
  CallStmt,
  ClearStmt,
  ConstantStmt,
  ContinueStmt,
  DefineStmt,
  DimensionItem,
  DimensionStmt,
  ErrorExpr,
  ErrorStmt,
  Expr,
  ForStmt,
  Identifier,
  IfBranch,
  IfStmt,
  Index,
  Literal,
  LiteralType,
  MainBlock,
  Node,
  Param,
  Program,
  ReadStmt,
  RepeatStmt,
  ReturnStmt,
  Stmt,
  SubprogramDecl,
  SwitchCase,
  SwitchStmt,
  TokenRange,
  TypeRef,
  Unary,
  UnaryOp,
  WaitKeyStmt,
  WaitStmt,
  WhileStmt,
  WriteStmt,
} from './nodes'
export type { Visitor } from './walk'
export { childrenOf, walk } from './walk'
```

- [ ] **Step 6: Run the test, typecheck**

Run: `pnpm vitest run --project stepcode test/ast/walk.test.ts` then `pnpm --filter stepcode typecheck`
Expected: every test passes; typecheck silent. `childrenOf`'s switch has no `default`: TypeScript proves it exhaustive, so a node kind added later fails to compile until it is handled.

- [ ] **Step 7: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): AST node set and walk"
```

---

### Task 5: `parser/` core — cursor, context, Pratt expressions

**Files:**
- Create: `packages/language/src/parser/cursor.ts`, `tokens.ts`, `context.ts`, `expression.ts`
- Modify: `packages/language/test/helpers.ts` (add `sexpr`, `parseExpr`, `parseExprResult`)
- Test: `packages/language/test/parser/expression.test.ts`

**Interfaces:**
- Consumes: `Token`, `isTrivia` from `../lexer/index`; `Diagnostic`, `createDiagnostic`, `DiagnosticCode`, `DiagnosticData` from `../diagnostics/index`; `LineMap`, `Span` from `../source/index`; AST types from `../ast/index`; `ResolvedProfile`, `KeywordKey`, `OperatorKey`, `BuiltinKey` from `@stepcode/profiles`.
- Produces:
  - `class Cursor` — `at()`, `peek()`, `peekAhead(n)`, `peekRaw()`, `next()`, `lastIndex()`, `onNewLine()`, `atEnd()`.
  - `keywordKeyOf(token)`, `isKeyword(token, key)`, `operatorKeyOf(token)`, `isOperator(token, key)`, `isPunct(token, text)`.
  - `interface BlockFrame`, `interface ParserContext`, `createContext(source, tokens, profile, diagnostics?)`, `report(ctx, code, span, data?, related?)`, `nodeRange(ctx, startIndex)`.
  - `parseExpression(ctx, minBinding?): Expr`, `parseTarget(ctx): Expr`, and the binding constants `NOT_BINDING = 5`, `UNARY_BINDING = 13`, `TARGET_BINDING = 17`.
- Test helpers produced: `sexpr(node): string`, `parseExpr(source, profile?): Expr`, `parseExprResult(source, profile?): { expr, diagnostics }`.

**Binding powers** (spec §5, lowest to highest). `left` is the power the operator claims from its left; `right` is the minimum passed to the right operand — `left + 1` for left-associative, `left` for right-associative.

| level | operators | left | right |
|---|---|---|---|
| 1 | `or` | 1 | 2 |
| 2 | `and` | 3 | 4 |
| 3 | `not` (prefix) | — | operand parsed at 5 |
| 4 | `equal notEqual lt le gt ge` | 7 | 8 |
| 5 | `plus minus` | 9 | 10 |
| 6 | `times divide div mod` | 11 | 12 |
| 7 | `minus plus` (prefix) | — | operand parsed at 13 |
| 8 | `power` | 15 | 15 |
| 9 | postfix `[…]`, call `(…)` | handled in `parsePostfix` / `parsePrimary` | — |

`parseTarget` is `parseExpression(ctx, 17)`: above every binary power, so it parses exactly one primary plus its postfix chain.

- [ ] **Step 1: Append the printer and parse helpers to `packages/language/test/helpers.ts`**

```ts
import { profiles, type ResolvedProfile } from '@stepcode/profiles'
import type { Expr, Node, Stmt, TypeRef } from '../src/ast/index'
import type { Diagnostic } from '../src/diagnostics/index'
import { tokenize } from '../src/lexer/index'
import { createContext } from '../src/parser/context'
import { parseExpression } from '../src/parser/expression'

const list = (nodes: readonly Node[]): string => nodes.map(sexpr).join(' ')
const body = (nodes: readonly Stmt[]): string => (nodes.length === 0 ? '' : ` ${list(nodes)}`)
const optional = (node: Node | undefined): string => (node === undefined ? '-' : sexpr(node))

const typeRef = (node: TypeRef): string => {
  if (node.dimensions.length === 0) return `(type ${node.base})`
  const dimensions = node.dimensions.map((dimension) => (dimension === null ? '_' : sexpr(dimension)))
  return `(type ${node.base} [${dimensions.join(' ')}])`
}

/** A compact S-expression form of any node, the shape every parser test asserts against. */
export function sexpr(node: Node): string {
  switch (node.kind) {
    case 'Program': {
      const parts = node.subprograms.map(sexpr)
      parts.push(node.main === null ? '-' : sexpr(node.main))
      return `(program ${parts.join(' ')})`
    }
    case 'MainBlock':
      return `(main ${node.name.name}${body(node.body)})`
    case 'SubprogramDecl':
      return `(${node.form} ${node.name.name} (params ${list(node.params)}) (returns ${
        node.returnName === undefined ? '-' : node.returnName.name
      } ${node.returnType === undefined ? '-' : typeRef(node.returnType)})${body(node.body)})`
    case 'Param':
      return `(param ${node.name.name} ${node.type === undefined ? '-' : typeRef(node.type)} ${
        node.byRef ? 'byref' : 'byvalue'
      })`
    case 'TypeRef':
      return typeRef(node)
    case 'Identifier':
      return node.name
    case 'DefineStmt':
      return `(define (${node.names.map((name) => name.name).join(' ')}) ${typeRef(node.type)})`
    case 'DimensionStmt':
      return `(dimension ${node.items
        .map((item) => `(${item.name.name} ${list(item.sizes)})`)
        .join(' ')})`
    case 'ConstantStmt':
      return `(constant ${node.name.name} ${
        node.type === undefined ? '-' : typeRef(node.type)
      } ${sexpr(node.value)})`
    case 'AssignStmt':
      return `(${node.viaEquals ? 'assign=' : 'assign'} ${sexpr(node.target)} ${sexpr(node.value)})`
    case 'WriteStmt':
      return `(${node.newline ? 'write' : 'write-nonl'} ${list(node.args)})`
    case 'ReadStmt':
      return `(read ${list(node.targets)})`
    case 'IfStmt': {
      const parts: string[] = []
      node.branches.forEach((branch, index) => {
        if (index > 0) parts.push('elseif')
        parts.push(sexpr(branch.condition))
        parts.push(...branch.body.map(sexpr))
      })
      if (node.elseBody !== undefined) parts.push('else', ...node.elseBody.map(sexpr))
      return `(if ${parts.join(' ')})`
    }
    case 'SwitchStmt': {
      const parts = node.cases.map(
        (entry) => `(case (${list(entry.values)})${body(entry.body)})`,
      )
      if (node.otherwise !== undefined) parts.push(`(otherwise${body(node.otherwise)})`)
      return `(switch ${sexpr(node.selector)}${parts.length === 0 ? '' : ` ${parts.join(' ')}`})`
    }
    case 'WhileStmt':
      return `(while ${sexpr(node.condition)}${body(node.body)})`
    case 'RepeatStmt':
      return `(repeat${body(node.body)} ${node.until ? 'until' : 'while'} ${sexpr(node.condition)})`
    case 'ForStmt':
      return `(for ${node.counter.name} ${sexpr(node.from)} ${sexpr(node.to)} ${optional(
        node.step,
      )}${body(node.body)})`
    case 'BreakStmt':
      return '(break)'
    case 'ContinueStmt':
      return '(continue)'
    case 'ReturnStmt':
      return node.value === undefined ? '(return)' : `(return ${sexpr(node.value)})`
    case 'CallStmt':
      return `(callstmt ${sexpr(node.call)})`
    case 'ClearStmt':
      return '(clear)'
    case 'WaitStmt':
      return `(wait ${sexpr(node.millis)})`
    case 'WaitKeyStmt':
      return '(waitkey)'
    case 'ErrorStmt':
      return '(error-stmt)'
    case 'Literal':
      return typeof node.value === 'string'
        ? `(literal "${node.value}")`
        : `(literal ${String(node.value)})`
    case 'Index':
      return `(index ${sexpr(node.target)} ${list(node.indices)})`
    case 'Call':
      return `(call ${node.callee.name}${node.args.length === 0 ? '' : ` ${list(node.args)}`})`
    case 'BuiltinCall':
      return `(builtin ${node.key}${node.args.length === 0 ? '' : ` ${list(node.args)}`})`
    case 'Unary':
      return `(unary ${node.op} ${sexpr(node.operand)})`
    case 'Binary':
      return `(binary ${node.op} ${sexpr(node.left)} ${sexpr(node.right)})`
    case 'ErrorExpr':
      return '(error-expr)'
  }
}

/** Parses one expression in isolation; the statement layer is not involved. */
export function parseExprResult(
  source: string,
  profile: ResolvedProfile = profiles.es,
): { expr: Expr; diagnostics: readonly Diagnostic[] } {
  const { tokens, diagnostics } = tokenize(source, profile)
  const ctx = createContext(source, tokens, profile, [...diagnostics])
  const expr = parseExpression(ctx)
  return { expr, diagnostics: ctx.diagnostics }
}

export function parseExpr(source: string, profile: ResolvedProfile = profiles.es): Expr {
  return parseExprResult(source, profile).expr
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/parser/expression.test.ts`**

```ts
import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parseExpr, parseExprResult, sexpr } from '../helpers'

const s = (source: string) => sexpr(parseExpr(source))
const codes = (source: string) => parseExprResult(source).diagnostics.map((d) => d.code)

describe('primaries', () => {
  it('reads every literal kind', () => {
    expect(s('10')).toBe('(literal 10)')
    expect(s('10.5')).toBe('(literal 10.5)')
    expect(s('"hola"')).toBe('(literal "hola")')
    expect(s("'hola'")).toBe('(literal "hola")')
    expect(s('Verdadero')).toBe('(literal true)')
    expect(s('Falso')).toBe('(literal false)')
  })

  it('reads identifiers with the canonical name', () => {
    expect(s('MiVar')).toBe('mivar')
  })

  it('produces no node for parentheses', () => {
    expect(s('(a)')).toBe('a')
    expect(s('(2 + 3) * 5')).toBe('(binary times (binary plus (literal 2) (literal 3)) (literal 5))')
    expect(s('2 * (3 + 5)')).toBe('(binary times (literal 2) (binary plus (literal 3) (literal 5)))')
  })
})

describe('calls and indexing', () => {
  it('parses a user call, including the zero-argument form', () => {
    expect(s('f(a, b)')).toBe('(call f a b)')
    expect(s('f()')).toBe('(call f)')
  })

  it('parses a builtin call and a bare builtin as a zero-argument call', () => {
    expect(s('Raiz(9)')).toBe('(builtin sqrt (literal 9))')
    expect(s('PI')).toBe('(builtin pi)')
    expect(s('Azar')).toBe('(builtin random)')
    expect(s('Azar()')).toBe('(builtin random)')
  })

  it('merges a[i,j] and a[i][j] into one Index with two indices', () => {
    expect(s('a[i,j]')).toBe('(index a i j)')
    expect(s('a[i][j]')).toBe('(index a i j)')
    expect(s('a[i,j]')).toBe(s('a[i][j]'))
  })

  it('indexes the result of a call chain', () => {
    expect(s('f(x)[1]')).toBe('(index (call f x) (literal 1))')
  })
})

describe('precedence table, line by line', () => {
  it('or is lowest, and binds tighter', () => {
    expect(s('x Y y O z')).toBe('(binary or (binary and x y) z)')
    expect(s('x O y Y z')).toBe('(binary or x (binary and y z))')
  })

  it('not sits below the relational operators', () => {
    expect(s('No a = b')).toBe('(unary not (binary equal a b))')
    expect(s('No a Y b')).toBe('(binary and (unary not a) b)')
  })

  it('relational operators sit below plus and minus', () => {
    expect(s('a + 1 < b')).toBe('(binary lt (binary plus a (literal 1)) b)')
  })

  it('plus and minus are left associative', () => {
    expect(s('2 + 3 - 5')).toBe('(binary minus (binary plus (literal 2) (literal 3)) (literal 5))')
  })

  it('times, divide, div and mod bind tighter than plus, and are left associative', () => {
    expect(s('a + 2 * 3')).toBe('(binary plus a (binary times (literal 2) (literal 3)))')
    expect(s('2 * 3 / 5')).toBe('(binary divide (binary times (literal 2) (literal 3)) (literal 5))')
    expect(s('a DIV 2 MOD 3')).toBe('(binary mod (binary div a (literal 2)) (literal 3))')
  })

  it('unary minus sits below power', () => {
    expect(s('-2^2')).toBe('(unary minus (binary power (literal 2) (literal 2)))')
    expect(s('-a * b')).toBe('(binary times (unary minus a) b)')
  })

  it('power is right associative and accepts a unary operand', () => {
    expect(s('2^3^2')).toBe('(binary power (literal 2) (binary power (literal 3) (literal 2)))')
    expect(s('2^-1')).toBe('(binary power (literal 2) (unary minus (literal 1)))')
    expect(s('2 ** 3')).toBe('(binary power (literal 2) (literal 3))')
  })

  it('postfix binds tighter than every operator', () => {
    expect(s('-a[1]')).toBe('(unary minus (index a (literal 1)))')
    expect(s('a[1] + b[2]')).toBe('(binary plus (index a (literal 1)) (index b (literal 2)))')
  })
})

describe('expression diagnostics', () => {
  it('reports a chained comparison once, and still builds an AST', () => {
    const { expr, diagnostics } = parseExprResult('a < b < c')
    expect(diagnostics.map((d) => d.code)).toEqual(['E2030'])
    expect(diagnostics[0]!.data.text).toBe('<')
    expect(sexpr(expr)).toBe('(binary lt (binary lt a b) c)')
  })

  it('allows a comparison inside a parenthesised operand', () => {
    expect(codes('(a < b) = Verdadero')).toEqual([])
  })

  it('reports a type or a non-literal keyword in expression position', () => {
    expect(codes('Entero')).toEqual(['E2031'])
    expect(codes('Si')).toEqual(['E2031'])
    expect(s('Entero')).toBe('(error-expr)')
    expect(parseExprResult('Entero').diagnostics[0]!.data.found).toBe('Entero')
  })

  it('reports a missing operand', () => {
    expect(codes('a +')).toEqual(['E2031'])
    expect(s('a +')).toBe('(binary plus a (error-expr))')
  })

  it('reports an unbalanced bracket at the opener', () => {
    const parenthesis = parseExprResult('(a + b')
    expect(parenthesis.diagnostics.map((d) => d.code)).toEqual(['E2005'])
    expect(parenthesis.diagnostics[0]!.span).toEqual({ start: 0, end: 1 })
    expect(parenthesis.diagnostics[0]!.data.bracket).toBe(')')

    const bracket = parseExprResult('a[1')
    expect(bracket.diagnostics.map((d) => d.code)).toEqual(['E2005'])
    expect(bracket.diagnostics[0]!.span).toEqual({ start: 1, end: 2 })
    expect(bracket.diagnostics[0]!.data.bracket).toBe(']')
  })

  it('keeps the lexer diagnostics ahead of the parser ones', () => {
    expect(codes('== b')).toEqual(['E1006', 'E2031'])
  })

  it('never throws on a hostile expression', () => {
    for (const source of ['', ')', '][', ',,,', '1 1 1', 'a(((', 'Si Entonces FinSi']) {
      expect(() => parseExprResult(source)).not.toThrow()
    }
  })
})

describe('profile independence', () => {
  it('uses the profile spellings, not hardcoded words', () => {
    expect(sexpr(parseExpr('a And b Or Not c', profiles.en))).toBe(
      '(binary or (binary and a b) (unary not c))',
    )
  })

  it('honours a custom operator spelling', () => {
    const custom = resolveProfile(
      { id: 'aula', extends: 'es', operators: { power: ['^', '**', '↑'] } },
      builtinProfiles,
    )
    expect(sexpr(parseExpr('2 ↑ 3', custom))).toBe('(binary power (literal 2) (literal 3))')
  })
})

describe('node ranges', () => {
  it('gives every expression a span that covers its source text', () => {
    const expr = parseExpr('a + b * c')
    expect(expr.span).toEqual({ start: 0, end: 9 })
    expect(expr.tokens[0]).toBe(0)
  })

  it('lets the parent range cover the parentheses of a parenthesised operand', () => {
    const expr = parseExpr('(a + b) * c')
    expect(expr.span).toEqual({ start: 0, end: 11 })
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/parser/expression.test.ts`
Expected: FAIL — cannot resolve `../../src/parser/context`.

- [ ] **Step 4: Write `packages/language/src/parser/cursor.ts`**

```ts
import { isTrivia, type Token } from '../lexer/index'

const EOF_FALLBACK: Token = { kind: 'eof', text: '', span: { start: 0, end: 0 } }

/**
 * A position in the token stream with two views: the significant view, which skips
 * whitespace, comments *and* newlines, and the raw view, which skips only whitespace and
 * comments so the terminator rule can see line breaks.
 */
export class Cursor {
  private position = 0
  private consumed = -1
  private readonly eof: Token

  constructor(readonly tokens: readonly Token[]) {
    this.eof = tokens[tokens.length - 1] ?? EOF_FALLBACK
  }

  /** First index at or after `from` that is not whitespace or a comment. */
  private skipTrivia(from: number): number {
    let index = from
    while (index < this.tokens.length) {
      const token = this.tokens[index]
      if (token === undefined || !isTrivia(token)) break
      index++
    }
    return index
  }

  /** First index at or after `from` that is significant: trivia and newlines skipped. */
  private skipAll(from: number): number {
    let index = this.skipTrivia(from)
    while (index < this.tokens.length && this.tokens[index]?.kind === 'newline') {
      index = this.skipTrivia(index + 1)
    }
    return index
  }

  /** Token index of the next significant token. */
  at(): number {
    return this.skipAll(this.position)
  }

  /** The next significant token. Always defined: the stream ends with `eof`. */
  peek(): Token {
    return this.tokens[this.at()] ?? this.eof
  }

  /** The significant token `count` places after `peek()`. */
  peekAhead(count: number): Token {
    let index = this.at()
    for (let step = 0; step < count; step++) index = this.skipAll(index + 1)
    return this.tokens[index] ?? this.eof
  }

  /** The next token with newlines significant: a `newline` token if one comes first. */
  peekRaw(): Token {
    return this.tokens[this.skipTrivia(this.position)] ?? this.eof
  }

  /** Consumes and returns `peek()`; `eof` is never consumed. */
  next(): Token {
    const index = this.at()
    const token = this.tokens[index] ?? this.eof
    if (token.kind !== 'eof') {
      this.consumed = index
      this.position = index + 1
    }
    return token
  }

  /** Index of the last consumed token, or `-1` before anything is consumed. */
  lastIndex(): number {
    return this.consumed
  }

  /** True when a line break separates the last consumed token from `peek()`. */
  onNewLine(): boolean {
    const end = this.at()
    for (let index = this.consumed + 1; index < end; index++) {
      if (this.tokens[index]?.kind === 'newline') return true
    }
    return false
  }

  atEnd(): boolean {
    return this.peek().kind === 'eof'
  }
}
```

- [ ] **Step 5: Write `packages/language/src/parser/tokens.ts`**

```ts
import type { KeywordKey, OperatorKey } from '@stepcode/profiles'
import type { Token } from '../lexer/index'

export function keywordKeyOf(token: Token): KeywordKey | null {
  return token.kind === 'keyword' ? (token.value as KeywordKey) : null
}

export function isKeyword(token: Token, key: KeywordKey): boolean {
  return token.kind === 'keyword' && token.value === key
}

export function operatorKeyOf(token: Token): OperatorKey | null {
  return token.kind === 'operator' ? (token.value as OperatorKey) : null
}

export function isOperator(token: Token, key: OperatorKey): boolean {
  return token.kind === 'operator' && token.value === key
}

export function isPunct(token: Token, text: string): boolean {
  return token.kind === 'punct' && token.text === text
}
```

- [ ] **Step 6: Write `packages/language/src/parser/context.ts`**

```ts
import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import type { TokenRange } from '../ast/index'
import {
  createDiagnostic,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticData,
  type RelatedSpan,
} from '../diagnostics/index'
import type { Token } from '../lexer/index'
import { LineMap, type Span } from '../source/index'
import { Cursor } from './cursor'

/**
 * One open block. `follows` lists every keyword this block may still consume — `endIf` plus
 * `elseIf` and `else` for an `if`, `until` and `while` for a `repeat` — so the recovery layer
 * can tell a dangling closer from one an enclosing block is waiting for.
 */
export interface BlockFrame {
  readonly opener: KeywordKey
  readonly closer: KeywordKey
  readonly follows: readonly KeywordKey[]
  /** Token index of the opener keyword, for the E2003 span and line number. */
  readonly openerToken: number
}

export interface ParserContext {
  readonly source: string
  readonly profile: ResolvedProfile
  readonly tokens: readonly Token[]
  readonly cursor: Cursor
  readonly lineMap: LineMap
  /** Lexer diagnostics first, then parser diagnostics in the order they are found. */
  readonly diagnostics: Diagnostic[]
  readonly blocks: BlockFrame[]
}

export function createContext(
  source: string,
  tokens: readonly Token[],
  profile: ResolvedProfile,
  diagnostics: Diagnostic[] = [],
): ParserContext {
  return {
    source,
    profile,
    tokens,
    cursor: new Cursor(tokens),
    lineMap: new LineMap(source),
    diagnostics,
    blocks: [],
  }
}

export function report(
  ctx: ParserContext,
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): void {
  ctx.diagnostics.push(createDiagnostic(code, span, data, related))
}

/**
 * The span and inclusive token range of a node that started at token `startIndex` and ended
 * with the last token the cursor consumed.
 */
export function nodeRange(
  ctx: ParserContext,
  startIndex: number,
): { span: Span; tokens: TokenRange } {
  const endIndex = Math.max(startIndex, ctx.cursor.lastIndex())
  const first = ctx.tokens[startIndex]
  const last = ctx.tokens[endIndex]
  const start = first?.span.start ?? 0
  return { span: { start, end: last?.span.end ?? start }, tokens: [startIndex, endIndex] }
}
```

- [ ] **Step 7: Write `packages/language/src/parser/expression.ts`**

```ts
import type { BuiltinKey, KeywordKey, OperatorKey } from '@stepcode/profiles'
import type { BinaryOp, Expr, Identifier } from '../ast/index'
import type { Span } from '../source/index'
import { nodeRange, type ParserContext, report } from './context'
import { isKeyword, isPunct, keywordKeyOf, operatorKeyOf } from './tokens'

const BINARY_FROM_OPERATOR: Partial<Record<OperatorKey, BinaryOp>> = {
  equal: 'equal',
  notEqual: 'notEqual',
  lt: 'lt',
  le: 'le',
  gt: 'gt',
  ge: 'ge',
  plus: 'plus',
  minus: 'minus',
  times: 'times',
  divide: 'divide',
  power: 'power',
}

const BINARY_FROM_KEYWORD: Partial<Record<KeywordKey, BinaryOp>> = {
  and: 'and',
  or: 'or',
  mod: 'mod',
  div: 'div',
}

/** Spec §5. `left` is what the operator claims from its left side. */
const LEFT_BINDING: Record<BinaryOp, number> = {
  or: 1,
  and: 3,
  equal: 7,
  notEqual: 7,
  lt: 7,
  le: 7,
  gt: 7,
  ge: 7,
  plus: 9,
  minus: 9,
  times: 11,
  divide: 11,
  div: 11,
  mod: 11,
  power: 15,
}

/** `left + 1` for left-associative operators; `left` for right-associative `power`. */
const RIGHT_BINDING: Record<BinaryOp, number> = {
  or: 2,
  and: 4,
  equal: 8,
  notEqual: 8,
  lt: 8,
  le: 8,
  gt: 8,
  ge: 8,
  plus: 10,
  minus: 10,
  times: 12,
  divide: 12,
  div: 12,
  mod: 12,
  power: 15,
}

const COMPARISONS: ReadonlySet<BinaryOp> = new Set(['equal', 'notEqual', 'lt', 'le', 'gt', 'ge'])

/** `not` sits below the relational level: `No a = b` is `No (a = b)`. */
export const NOT_BINDING = 5
/** Unary `-`/`+` sit below power: `-2^2` is `-(2^2)`. */
export const UNARY_BINDING = 13
/** Above every binary power: one primary plus its postfix chain, nothing else. */
export const TARGET_BINDING = 17

function binaryOpOf(token: { kind: string; value?: unknown }): BinaryOp | null {
  if (token.kind === 'operator') return BINARY_FROM_OPERATOR[token.value as OperatorKey] ?? null
  if (token.kind === 'keyword') return BINARY_FROM_KEYWORD[token.value as KeywordKey] ?? null
  return null
}

/**
 * Pratt parser over the profile's operators. Never throws: a missing operand becomes an
 * `ErrorExpr` carrying E2031 and parsing continues.
 */
export function parseExpression(ctx: ParserContext, minBinding = 0): Expr {
  const start = ctx.cursor.at()
  let left = parsePrefix(ctx)
  let afterComparison = false
  for (;;) {
    const token = ctx.cursor.peek()
    const op = binaryOpOf(token)
    if (op === null) break
    const binding = LEFT_BINDING[op]
    if (binding < minBinding) break
    // The relational level is non-associative: `a < b < c` is a mistake, not a nesting.
    if (afterComparison && COMPARISONS.has(op)) report(ctx, 'E2030', token.span, { text: token.text })
    ctx.cursor.next()
    const right = parseExpression(ctx, RIGHT_BINDING[op])
    left = { kind: 'Binary', op, left, right, ...nodeRange(ctx, start) }
    afterComparison = COMPARISONS.has(op)
  }
  return left
}

/** One primary plus its postfix chain: an assignment target or a `Leer` target. */
export function parseTarget(ctx: ParserContext): Expr {
  return parseExpression(ctx, TARGET_BINDING)
}

function parsePrefix(ctx: ParserContext): Expr {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (isKeyword(token, 'not')) {
    ctx.cursor.next()
    const operand = parseExpression(ctx, NOT_BINDING)
    return { kind: 'Unary', op: 'not', operand, ...nodeRange(ctx, start) }
  }
  const operator = operatorKeyOf(token)
  if (operator === 'minus' || operator === 'plus') {
    ctx.cursor.next()
    const operand = parseExpression(ctx, UNARY_BINDING)
    return { kind: 'Unary', op: operator, operand, ...nodeRange(ctx, start) }
  }
  return parsePostfix(ctx, parsePrimary(ctx), start)
}

/** `a[i,j]` and `a[i][j]` both collapse into one `Index` with two indices. */
function parsePostfix(ctx: ParserContext, target: Expr, start: number): Expr {
  let current = target
  for (;;) {
    const open = ctx.cursor.peek()
    if (!isPunct(open, '[')) return current
    const base = current.kind === 'Index' ? current.target : current
    const indices: Expr[] = current.kind === 'Index' ? [...current.indices] : []
    ctx.cursor.next()
    indices.push(parseExpression(ctx))
    while (isPunct(ctx.cursor.peek(), ',')) {
      ctx.cursor.next()
      indices.push(parseExpression(ctx))
    }
    expectBracket(ctx, ']', open.span)
    current = { kind: 'Index', target: base, indices, ...nodeRange(ctx, start) }
  }
}

function expectBracket(ctx: ParserContext, bracket: ')' | ']', openerSpan: Span): void {
  if (isPunct(ctx.cursor.peek(), bracket)) {
    ctx.cursor.next()
    return
  }
  report(ctx, 'E2005', openerSpan, { bracket })
}

function parseArguments(ctx: ParserContext): Expr[] {
  const open = ctx.cursor.next()
  const args: Expr[] = []
  if (!isPunct(ctx.cursor.peek(), ')')) {
    args.push(parseExpression(ctx))
    while (isPunct(ctx.cursor.peek(), ',')) {
      ctx.cursor.next()
      args.push(parseExpression(ctx))
    }
  }
  expectBracket(ctx, ')', open.span)
  return args
}

function parsePrimary(ctx: ParserContext): Expr {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  switch (token.kind) {
    case 'integer':
    case 'real': {
      ctx.cursor.next()
      const value = typeof token.value === 'number' ? token.value : Number(token.text)
      return { kind: 'Literal', value, type: token.kind, ...nodeRange(ctx, start) }
    }
    case 'string': {
      ctx.cursor.next()
      return {
        kind: 'Literal',
        value: typeof token.value === 'string' ? token.value : '',
        type: 'string',
        ...nodeRange(ctx, start),
      }
    }
    case 'identifier': {
      ctx.cursor.next()
      const callee: Identifier = {
        kind: 'Identifier',
        name: typeof token.value === 'string' ? token.value : token.text,
        text: token.text,
        ...nodeRange(ctx, start),
      }
      // A user-defined zero-argument call still needs its parentheses.
      if (!isPunct(ctx.cursor.peek(), '(')) return callee
      const args = parseArguments(ctx)
      return { kind: 'Call', callee, args, ...nodeRange(ctx, start) }
    }
    case 'builtin': {
      ctx.cursor.next()
      const key = token.value as BuiltinKey
      // A bare builtin is a zero-argument call: `PI`, `Azar`.
      const args = isPunct(ctx.cursor.peek(), '(') ? parseArguments(ctx) : []
      return { kind: 'BuiltinCall', key, args, ...nodeRange(ctx, start) }
    }
    case 'punct': {
      if (token.text !== '(') break
      ctx.cursor.next()
      const inner = parseExpression(ctx)
      // Parentheses produce no node; their tokens fall inside the parent's range.
      expectBracket(ctx, ')', token.span)
      return inner
    }
    case 'keyword': {
      const key = keywordKeyOf(token)
      if (key !== 'true' && key !== 'false') break
      ctx.cursor.next()
      return { kind: 'Literal', value: key === 'true', type: 'boolean', ...nodeRange(ctx, start) }
    }
    default:
      break
  }
  // The offending token is left in place so the statement layer can recover on it.
  report(ctx, 'E2031', token.span, { found: token.text })
  return {
    kind: 'ErrorExpr',
    span: { start: token.span.start, end: token.span.start },
    tokens: [start, start],
  }
}
```

- [ ] **Step 8: Run the test, typecheck**

Run: `pnpm vitest run --project stepcode test/parser/expression.test.ts` then `pnpm --filter stepcode typecheck`
Expected: every test passes; typecheck silent. If `-a * b` comes out as `-(a * b)`, `UNARY_BINDING` is below the multiplicative level — it must be 13.

- [ ] **Step 9: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): token cursor, parser context and Pratt expression parser"
```

---

### Task 6: `parser/` program structure, subprogram headers, parameters, types

**Files:**
- Create: `packages/language/src/parser/terminator.ts`, `blocks.ts`, `declarations.ts`, `statement.ts`, `parse.ts`, `index.ts`
- Modify: `packages/language/test/helpers.ts` (add `parseSource`, `ast`, `diagnosticCodes`)
- Test: `packages/language/test/parser/program.test.ts`

**Interfaces:**
- Consumes: everything from Task 5 plus `parseExpression`, `parseTarget`.
- Produces:
  - `terminator.ts`: `BLOCK_BOUNDARY_KEYWORDS`, `STATEMENT_START_KEYWORDS` (both `ReadonlySet<KeywordKey>`), `canStartStatement(token): boolean`, `type TerminatorResult = 'ok' | 'missing' | 'garbled'`, `consumeTerminator(ctx): TerminatorResult`, `skipToRecoveryPoint(ctx): void`.
  - `blocks.ts`: `interface BlockOptions { readonly stop?: (ctx: ParserContext) => boolean }`, `parseBlock(ctx, options?): Stmt[]`, `openBlock(ctx, frame: BlockFrame): void`, `parseSection(ctx, options?): Stmt[]`, `finishBlock(ctx, closer: KeywordKey): void`, `reportUnclosed(ctx, frame, closerSpan): void`.
  - `declarations.ts`: `parseProgram(ctx): Program`, `parseMainBlock(ctx): MainBlock`, `parseProcedure(ctx): SubprogramDecl`, `parseFunction(ctx): SubprogramDecl`, `parseParamList(ctx): Param[]`, `parseTypeRef(ctx): TypeRef | null`, `expectIdentifier(ctx): Identifier`, `parseDefine(ctx): Stmt`.
  - `statement.ts`: `parseStatement(ctx): Stmt | null`, `parseErrorStatement(ctx): Stmt`. **This task ships the `define` case and the error path only; Task 7 replaces the file with the complete dispatcher.**
  - `parse.ts`: `interface ParseResult { readonly program: Program; readonly tokens: readonly Token[]; readonly diagnostics: readonly Diagnostic[] }`, `parse(source, options: { profile: ResolvedProfile }): ParseResult`.
- Test helpers produced: `parseSource`, `ast`, `diagnosticCodes`.

Notes fixed by this task and relied on by Tasks 7 and 8:
- The five header forms — `Funcion f()`, `Funcion f(): Entero`, `Funcion r <- f()`, `Funcion r Como Real <- f(x Como Real)`, `SubProceso f` with or without parens — all produce one `SubprogramDecl`.
- Parameter modifiers occupy two slots: the type slot (`as Type`) and the direction slot (`byRef` / `byValue`). A second modifier in the same slot is E2022; the first one wins.
- `parseBlock` guarantees progress: if a statement consumed nothing, the cursor advances one token before the next round, so no input can loop forever.

- [ ] **Step 1: Append the program helpers to `packages/language/test/helpers.ts`**

```ts
import type { DiagnosticCode } from '../src/diagnostics/index'
import { parse, type ParseResult } from '../src/parser/parse'

export function parseSource(source: string, profile: ResolvedProfile = profiles.es): ParseResult {
  return parse(source, { profile })
}

/** The parsed program as an S-expression. */
export function ast(source: string, profile: ResolvedProfile = profiles.es): string {
  return sexpr(parseSource(source, profile).program)
}

export function diagnosticCodes(
  source: string,
  profile: ResolvedProfile = profiles.es,
): DiagnosticCode[] {
  return parseSource(source, profile).diagnostics.map((diagnostic) => diagnostic.code)
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/parser/program.test.ts`**

```ts
import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

const untyped = resolveProfile(
  { id: 'untyped', extends: 'es', options: { typedParameters: false } },
  builtinProfiles,
)

describe('top level', () => {
  it('parses a main block', () => {
    expect(ast('Proceso p\nFinProceso')).toBe('(program (main p))')
    expect(diagnosticCodes('Proceso p\nFinProceso')).toEqual([])
  })

  it('accepts both program spellings', () => {
    expect(ast('Algoritmo p\nFinAlgoritmo')).toBe('(program (main p))')
  })

  it('accepts subprograms before and after the main block', () => {
    const source = 'SubProceso a\nFinSubProceso\nProceso p\nFinProceso\nSubProceso b\nFinSubProceso'
    expect(ast(source)).toBe(
      '(program (procedure a (params ) (returns - -)) (procedure b (params ) (returns - -)) (main p))',
    )
    expect(diagnosticCodes(source)).toEqual([])
  })

  it('reports E2010 at end of file when there is no main block', () => {
    const result = parseSource('SubProceso a\nFinSubProceso\n')
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2010'])
    expect(result.program.main).toBeNull()
  })

  it('reports E2011 at the opener of a second main block, keeping the first', () => {
    const source = 'Proceso uno\nFinProceso\nProceso dos\nFinProceso'
    const result = parseSource(source)
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2011'])
    expect(result.program.main?.name.name).toBe('uno')
    const position = result.diagnostics[0]!.span.start
    expect(source.slice(position, position + 7)).toBe('Proceso')
  })

  it('reports E2012 for a statement outside every block, once per run', () => {
    const result = parseSource('Escribir 1;\nEscribir 2;\nProceso p\nFinProceso')
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2012'])
    expect(result.diagnostics[0]!.data.found).toBe('Escribir')
    expect(result.program.main?.name.name).toBe('p')
  })
})

describe('subprogram headers', () => {
  const header = (source: string) => {
    const declaration = parseSource(`${source}\nFinFuncion\nProceso p\nFinProceso`).program
      .subprograms[0]
    return declaration
  }

  it('accepts a procedure with and without parentheses', () => {
    expect(ast('SubProceso f\nFinSubProceso\nProceso p\nFinProceso')).toContain(
      '(procedure f (params ) (returns - -))',
    )
    expect(ast('SubProceso f()\nFinSubProceso\nProceso p\nFinProceso')).toContain(
      '(procedure f (params ) (returns - -))',
    )
  })

  it('accepts every procedure keyword pair of the profile', () => {
    expect(diagnosticCodes('Procedimiento f\nFinProcedimiento\nProceso p\nFinProceso')).toEqual([])
    expect(diagnosticCodes('SubAlgoritmo f\nFinSubAlgoritmo\nProceso p\nFinProceso')).toEqual([])
  })

  it('parses all five header forms into one node shape', () => {
    expect(header('Funcion f()')).toMatchObject({ form: 'function', name: { name: 'f' } })
    expect(header('Funcion f(): Entero')).toMatchObject({
      returnType: { base: 'integer' },
    })
    expect(header('Funcion r <- f()')).toMatchObject({
      name: { name: 'f' },
      returnName: { name: 'r' },
    })
    expect(header('Funcion r Como Real <- f(x Como Real)')).toMatchObject({
      name: { name: 'f' },
      returnName: { name: 'r' },
      returnType: { base: 'real' },
      params: [{ name: { name: 'x' }, byRef: false, type: { base: 'real' } }],
    })
    expect(header('Funcion f')).toMatchObject({ form: 'function', name: { name: 'f' } })
  })

  it('leaves a function with neither return name nor return type valid', () => {
    expect(diagnosticCodes('Funcion f()\nFinFuncion\nProceso p\nFinProceso')).toEqual([])
  })

  it('accepts the unicode assignment arrow in the header', () => {
    expect(header('Funcion r ← f()')).toMatchObject({ returnName: { name: 'r' } })
  })

  it('reports E2003 when a subprogram is never closed', () => {
    const result = parseSource('SubProceso f\nProceso p\nFinProceso')
    expect(result.diagnostics.map((d) => d.code)).toContain('E2003')
  })
})

describe('parameters', () => {
  const params = (header: string, profile = profiles.es) =>
    parseSource(`SubProceso f(${header})\nFinSubProceso\nProceso p\nFinProceso`, profile).program
      .subprograms[0]?.params

  it('reads a typed parameter', () => {
    expect(params('a Como Entero')).toMatchObject([
      { name: { name: 'a' }, type: { base: 'integer' }, byRef: false },
    ])
  })

  it('accepts the modifiers in either order', () => {
    expect(params('a Como Entero Por Referencia')).toMatchObject([
      { type: { base: 'integer' }, byRef: true },
    ])
    expect(params('a Por Referencia Como Entero')).toMatchObject([
      { type: { base: 'integer' }, byRef: true },
    ])
  })

  it('marks Por Valor explicitly', () => {
    expect(params('a Como Entero Por Valor')).toMatchObject([{ byRef: false }])
  })

  it('reads several parameters', () => {
    expect(params('a Como Entero, b Como Real')).toHaveLength(2)
  })

  it('reports E2021 for an untyped parameter when typedParameters is on', () => {
    const result = parseSource('SubProceso f(a)\nFinSubProceso\nProceso p\nFinProceso')
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2021'])
    expect(result.diagnostics[0]!.data.name).toBe('a')
  })

  it('accepts an untyped parameter when typedParameters is off', () => {
    expect(
      diagnosticCodes('SubProceso f(a, b Por Referencia)\nFinSubProceso\nProceso p\nFinProceso', untyped),
    ).toEqual([])
    expect(params('a, b Por Referencia', untyped)).toMatchObject([{ byRef: false }, { byRef: true }])
  })

  it('reports E2022 for a repeated modifier and keeps the first', () => {
    const result = parseSource(
      'SubProceso f(a Por Referencia Por Valor)\nFinSubProceso\nProceso p\nFinProceso',
      untyped,
    )
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2022'])
    expect(result.diagnostics[0]!.data.modifier).toBe('byValue')
    expect(result.program.subprograms[0]?.params[0]?.byRef).toBe(true)
  })

  it('reports E2022 for a repeated type modifier', () => {
    expect(
      diagnosticCodes('SubProceso f(a Como Entero Como Real)\nFinSubProceso\nProceso p\nFinProceso'),
    ).toEqual(['E2022'])
  })
})

describe('type references', () => {
  const type = (source: string) => {
    const statement = parseSource(`Proceso p\n${source}\nFinProceso`).program.main?.body[0]
    return statement?.kind === 'DefineStmt' ? statement.type : undefined
  }

  it('reads a scalar type', () => {
    expect(type('Definir a Como Entero;')).toMatchObject({ base: 'integer', dimensions: [] })
  })

  it('reads the unsized one-dimensional and two-dimensional forms', () => {
    expect(type('Definir a Como Entero[];')).toMatchObject({ dimensions: [null] })
    expect(type('Definir a Como Entero[,];')).toMatchObject({ dimensions: [null, null] })
  })

  it('reads sized dimensions', () => {
    expect(ast('Proceso p\nDefinir a Como Entero[3,3];\nFinProceso')).toBe(
      '(program (main p (define (a) (type integer [(literal 3) (literal 3)]))))',
    )
  })

  it('accepts an expression as a size', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero[n + 1];\nFinProceso')).toEqual([])
  })

  it('reports E2002 when some sizes are present and others are not', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero[3,];\nFinProceso')).toEqual(['E2002'])
  })

  it('reads a list of names sharing one type', () => {
    expect(ast('Proceso p\nDefinir a, b, c Como Cadena;\nFinProceso')).toBe(
      '(program (main p (define (a b c) (type string))))',
    )
  })

  it('accepts a bracket type on a parameter and on a return type', () => {
    const declaration = parseSource(
      'Funcion f(a Como Entero[]): Entero[,]\nFinFuncion\nProceso p\nFinProceso',
    ).program.subprograms[0]
    expect(declaration?.params[0]?.type).toMatchObject({ dimensions: [null] })
    expect(declaration?.returnType).toMatchObject({ dimensions: [null, null] })
  })
})

describe('terminators on Definir', () => {
  it('requires a semicolon when requireSemicolons is on', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero\nEscribir a;\nFinProceso')).toEqual([
      'E2001',
    ])
  })

  it('accepts a newline terminator under pseint', () => {
    expect(
      diagnosticCodes('Proceso p\nDefinir a Como Entero\nFinProceso', profiles.pseint),
    ).toEqual([])
  })

  it('reports W2001 for a stray semicolon', () => {
    expect(diagnosticCodes('Proceso p\nDefinir a Como Entero;;\nFinProceso')).toEqual(['W2001'])
  })
})

describe('parse never throws', () => {
  it('survives hostile input', () => {
    for (const source of ['', 'Proceso', 'FinProceso', 'Proceso p', '(((', 'Funcion <- ']) {
      expect(() => parseSource(source)).not.toThrow()
    }
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/parser/program.test.ts`
Expected: FAIL — cannot resolve `../../src/parser/parse`.

- [ ] **Step 4: Write `packages/language/src/parser/terminator.ts`**

```ts
import type { KeywordKey } from '@stepcode/profiles'
import type { Token } from '../lexer/index'
import { type ParserContext, report } from './context'
import { isPunct, keywordKeyOf } from './tokens'

/** Keywords that end or continue a block. A statement never starts with one of these. */
export const BLOCK_BOUNDARY_KEYWORDS: ReadonlySet<KeywordKey> = new Set([
  'endProgram',
  'endProcedure',
  'endFunction',
  'endIf',
  'elseIf',
  'else',
  'endSwitch',
  'case',
  'otherwise',
  'endWhile',
  'endFor',
  'until',
  // A top-level opener can never appear inside a block, so meeting one ends the block and
  // hands the token back to `parseProgram` instead of garbling the rest of the file.
  'program',
  'procedure',
  'function',
])

/** Keywords a statement may start with. */
export const STATEMENT_START_KEYWORDS: ReadonlySet<KeywordKey> = new Set([
  'define',
  'dimension',
  'constant',
  'write',
  'writeNoNewline',
  'read',
  'if',
  'switch',
  'while',
  'repeat',
  'for',
  'break',
  'continue',
  'return',
  'clearScreen',
  'wait',
  'waitKey',
])

/** Used by the missing-terminator rule to tell "next statement" from "garbled tail". */
export function canStartStatement(token: Token): boolean {
  const key = keywordKeyOf(token)
  if (key !== null) return STATEMENT_START_KEYWORDS.has(key) || BLOCK_BOUNDARY_KEYWORDS.has(key)
  return token.kind === 'identifier' || token.kind === 'builtin' || token.kind === 'eof'
}

export type TerminatorResult =
  /** A terminator was there, or none was needed. */
  | 'ok'
  /** E2001: the terminator is missing but the statement is intact; keep it. */
  | 'missing'
  /** E2002: the tail is garbled; the caller returns an `ErrorStmt`. */
  | 'garbled'

/**
 * Spec §7. With `requireSemicolons`, only a `;` on the same line terminates; a statement
 * that runs into the next line gets E2001 and is kept, anything else gets E2002 and is
 * skipped. Without it, a line break, a block boundary or end of file all terminate.
 */
export function consumeTerminator(ctx: ParserContext): TerminatorResult {
  const { cursor } = ctx
  if (isPunct(cursor.peekRaw(), ';')) {
    cursor.next()
    return 'ok'
  }
  const next = cursor.peek()
  if (!ctx.profile.options.requireSemicolons) {
    const key = keywordKeyOf(next)
    const atBoundary = next.kind === 'eof' || (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key))
    if (atBoundary || cursor.onNewLine()) return 'ok'
    report(ctx, 'E2002', next.span, { found: next.text })
    skipToRecoveryPoint(ctx)
    return 'garbled'
  }
  if (next.kind === 'eof' || (cursor.onNewLine() && canStartStatement(next))) {
    const previous = ctx.tokens[cursor.lastIndex()]
    const at = previous?.span.end ?? next.span.start
    report(ctx, 'E2001', { start: at, end: at })
    return 'missing'
  }
  report(ctx, 'E2002', next.span, { found: next.text })
  skipToRecoveryPoint(ctx)
  return 'garbled'
}

/**
 * Skips the garbled tail: to just past the next `;`, or up to the next line break, block
 * boundary or statement keyword. Always consumes at least one token, so no caller can spin.
 */
export function skipToRecoveryPoint(ctx: ParserContext): void {
  const { cursor } = ctx
  cursor.next()
  while (!cursor.atEnd()) {
    if (cursor.peekRaw().kind === 'newline') return
    const token = cursor.peek()
    if (isPunct(token, ';')) {
      cursor.next()
      return
    }
    const key = keywordKeyOf(token)
    if (key !== null && (BLOCK_BOUNDARY_KEYWORDS.has(key) || STATEMENT_START_KEYWORDS.has(key))) {
      return
    }
    cursor.next()
  }
}
```

- [ ] **Step 5: Write `packages/language/src/parser/blocks.ts`**

```ts
import type { KeywordKey } from '@stepcode/profiles'
import type { Stmt } from '../ast/index'
import type { Span } from '../source/index'
import { type BlockFrame, type ParserContext, report } from './context'
import { parseStatement } from './statement'
import { BLOCK_BOUNDARY_KEYWORDS } from './terminator'
import { keywordKeyOf } from './tokens'

export interface BlockOptions {
  /**
   * An extra stop test, run before each statement: a `Segun` case label that carries no
   * keyword, or the `Mientras Que` that closes a `Repetir`.
   */
  readonly stop?: (ctx: ParserContext) => boolean
}

/**
 * Statements until a block boundary. Guarantees progress: a statement that consumed nothing
 * costs one token, so no input loops forever.
 */
export function parseBlock(ctx: ParserContext, options: BlockOptions = {}): Stmt[] {
  const body: Stmt[] = []
  while (!ctx.cursor.atEnd()) {
    const key = keywordKeyOf(ctx.cursor.peek())
    if (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key)) break
    if (options.stop?.(ctx) === true) break
    const before = ctx.cursor.at()
    const statement = parseStatement(ctx)
    if (statement !== null) body.push(statement)
    if (ctx.cursor.at() === before) ctx.cursor.next()
  }
  return body
}

export function openBlock(ctx: ParserContext, frame: BlockFrame): void {
  ctx.blocks.push(frame)
}

/**
 * One block body. Task 8 gives this the dangling-closer recovery; here it is just a block.
 */
export function parseSection(ctx: ParserContext, options: BlockOptions = {}): Stmt[] {
  return parseBlock(ctx, options)
}

export function reportUnclosed(ctx: ParserContext, frame: BlockFrame, closerSpan: Span): void {
  const opener = ctx.tokens[frame.openerToken]
  const span = opener?.span ?? closerSpan
  report(
    ctx,
    'E2003',
    span,
    {
      opener: frame.opener,
      closer: frame.closer,
      openerLine: ctx.lineMap.positionAt(span.start).line,
    },
    [{ span: closerSpan }],
  )
}

/** Consumes the closer, or reports E2003 against the innermost open block. */
export function finishBlock(ctx: ParserContext, closer: KeywordKey): void {
  const frame = ctx.blocks.pop()
  const token = ctx.cursor.peek()
  if (keywordKeyOf(token) === closer) {
    ctx.cursor.next()
    return
  }
  if (frame !== undefined) reportUnclosed(ctx, frame, token.span)
}
```

- [ ] **Step 6: Write `packages/language/src/parser/declarations.ts`**

```ts
import type { TypeKey } from '@stepcode/profiles'
import type {
  Expr,
  Identifier,
  MainBlock,
  Param,
  Program,
  Stmt,
  SubprogramDecl,
  TypeRef,
} from '../ast/index'
import { finishBlock, openBlock, parseSection } from './blocks'
import { nodeRange, type ParserContext, report } from './context'
import { parseExpression } from './expression'
import { consumeTerminator, skipToRecoveryPoint } from './terminator'
import { isKeyword, isOperator, isPunct, keywordKeyOf } from './tokens'

/** Consumes an identifier, or reports E2002 and returns an empty synthetic one. */
export function expectIdentifier(ctx: ParserContext): Identifier {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (token.kind !== 'identifier') {
    report(ctx, 'E2002', token.span, { found: token.text })
    return {
      kind: 'Identifier',
      name: '',
      text: '',
      span: { start: token.span.start, end: token.span.start },
      tokens: [start, start],
    }
  }
  ctx.cursor.next()
  return {
    kind: 'Identifier',
    name: typeof token.value === 'string' ? token.value : token.text,
    text: token.text,
    ...nodeRange(ctx, start),
  }
}

/** `TypeName [ "[" (Expr | ε) ("," (Expr | ε))* "]" ]`; sizes are all present or all absent. */
export function parseTypeRef(ctx: ParserContext): TypeRef | null {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (token.kind !== 'type') {
    report(ctx, 'E2002', token.span, { found: token.text })
    return null
  }
  ctx.cursor.next()
  const base = token.value as TypeKey
  const dimensions: (Expr | null)[] = []
  if (isPunct(ctx.cursor.peek(), '[')) {
    const open = ctx.cursor.next()
    for (;;) {
      const head = ctx.cursor.peek()
      if (isPunct(head, ']') || isPunct(head, ',')) dimensions.push(null)
      else dimensions.push(parseExpression(ctx))
      if (!isPunct(ctx.cursor.peek(), ',')) break
      ctx.cursor.next()
    }
    if (isPunct(ctx.cursor.peek(), ']')) ctx.cursor.next()
    else report(ctx, 'E2005', open.span, { bracket: ']' })
    const sized = dimensions.filter((dimension) => dimension !== null)
    if (sized.length !== 0 && sized.length !== dimensions.length) {
      const first = sized[0] as Expr
      report(ctx, 'E2002', first.span, {
        found: ctx.source.slice(first.span.start, first.span.end),
      })
    }
  }
  return { kind: 'TypeRef', base, dimensions, ...nodeRange(ctx, start) }
}

function parseParam(ctx: ParserContext): Param {
  const start = ctx.cursor.at()
  const name = expectIdentifier(ctx)
  let type: TypeRef | undefined
  let byRef: boolean | undefined
  for (;;) {
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === 'as') {
      ctx.cursor.next()
      const parsed = parseTypeRef(ctx)
      if (type !== undefined) report(ctx, 'E2022', token.span, { modifier: 'as' })
      else if (parsed !== null) type = parsed
      continue
    }
    if (key === 'byRef' || key === 'byValue') {
      ctx.cursor.next()
      if (byRef !== undefined) report(ctx, 'E2022', token.span, { modifier: key })
      else byRef = key === 'byRef'
      continue
    }
    break
  }
  if (type === undefined && ctx.profile.options.typedParameters) {
    report(ctx, 'E2021', name.span, { name: name.text })
  }
  const range = nodeRange(ctx, start)
  return type === undefined
    ? { kind: 'Param', name, byRef: byRef ?? false, ...range }
    : { kind: 'Param', name, type, byRef: byRef ?? false, ...range }
}

export function parseParamList(ctx: ParserContext): Param[] {
  const params: Param[] = []
  if (!isPunct(ctx.cursor.peek(), '(')) return params
  const open = ctx.cursor.next()
  if (isPunct(ctx.cursor.peek(), ')')) {
    ctx.cursor.next()
    return params
  }
  for (;;) {
    params.push(parseParam(ctx))
    if (!isPunct(ctx.cursor.peek(), ',')) break
    ctx.cursor.next()
  }
  if (isPunct(ctx.cursor.peek(), ')')) ctx.cursor.next()
  else report(ctx, 'E2005', open.span, { bracket: ')' })
  return params
}

export function parseMainBlock(ctx: ParserContext): MainBlock {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const name = expectIdentifier(ctx)
  openBlock(ctx, {
    opener: 'program',
    closer: 'endProgram',
    follows: ['endProgram'],
    openerToken: start,
  })
  const body = parseSection(ctx)
  finishBlock(ctx, 'endProgram')
  return { kind: 'MainBlock', name, body, ...nodeRange(ctx, start) }
}

export function parseProcedure(ctx: ParserContext): SubprogramDecl {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const name = expectIdentifier(ctx)
  const params = parseParamList(ctx)
  openBlock(ctx, {
    opener: 'procedure',
    closer: 'endProcedure',
    follows: ['endProcedure'],
    openerToken: start,
  })
  const body = parseSection(ctx)
  finishBlock(ctx, 'endProcedure')
  return { kind: 'SubprogramDecl', form: 'procedure', name, params, body, ...nodeRange(ctx, start) }
}

/**
 * All four `Funcion` forms: `f()`, `f(): T`, `r <- f()`, `r Como T <- f(…)`. The return name
 * is only known once the arrow is seen, so the first identifier is read speculatively.
 */
export function parseFunction(ctx: ParserContext): SubprogramDecl {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  let name = expectIdentifier(ctx)
  let returnName: Identifier | undefined
  let returnType: TypeRef | undefined
  if (isKeyword(ctx.cursor.peek(), 'as')) {
    ctx.cursor.next()
    returnType = parseTypeRef(ctx) ?? undefined
  }
  if (isOperator(ctx.cursor.peek(), 'assign')) {
    ctx.cursor.next()
    returnName = name
    name = expectIdentifier(ctx)
  }
  const params = parseParamList(ctx)
  if (isPunct(ctx.cursor.peek(), ':')) {
    ctx.cursor.next()
    returnType = parseTypeRef(ctx) ?? returnType
  }
  openBlock(ctx, {
    opener: 'function',
    closer: 'endFunction',
    follows: ['endFunction'],
    openerToken: start,
  })
  const body = parseSection(ctx)
  finishBlock(ctx, 'endFunction')
  // `exactOptionalPropertyTypes` forbids writing an explicit `undefined`, so build the extras.
  const extras: { returnName?: Identifier; returnType?: TypeRef } = {}
  if (returnName !== undefined) extras.returnName = returnName
  if (returnType !== undefined) extras.returnType = returnType
  return {
    kind: 'SubprogramDecl',
    form: 'function',
    name,
    params,
    ...extras,
    body,
    ...nodeRange(ctx, start),
  }
}

/** `define Ident ("," Ident)* as Type ;` */
export function parseDefine(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const names: Identifier[] = [expectIdentifier(ctx)]
  while (isPunct(ctx.cursor.peek(), ',')) {
    ctx.cursor.next()
    names.push(expectIdentifier(ctx))
  }
  if (isKeyword(ctx.cursor.peek(), 'as')) ctx.cursor.next()
  else report(ctx, 'E2004', ctx.cursor.peek().span, { expected: 'as' })
  const type = parseTypeRef(ctx)
  if (type === null) {
    skipToRecoveryPoint(ctx)
    return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
  }
  if (consumeTerminator(ctx) === 'garbled') return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
  return { kind: 'DefineStmt', names, type, ...nodeRange(ctx, start) }
}

function skipToTopLevel(ctx: ParserContext): void {
  ctx.cursor.next()
  while (!ctx.cursor.atEnd()) {
    const key = keywordKeyOf(ctx.cursor.peek())
    if (key === 'program' || key === 'procedure' || key === 'function') return
    ctx.cursor.next()
  }
}

/** The top level admits subprograms and exactly one main block, in any order. */
export function parseProgram(ctx: ParserContext): Program {
  const start = ctx.cursor.at()
  const subprograms: SubprogramDecl[] = []
  let main: MainBlock | null = null
  while (!ctx.cursor.atEnd()) {
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === 'program') {
      const block = parseMainBlock(ctx)
      if (main === null) main = block
      else report(ctx, 'E2011', token.span)
      continue
    }
    if (key === 'procedure') {
      subprograms.push(parseProcedure(ctx))
      continue
    }
    if (key === 'function') {
      subprograms.push(parseFunction(ctx))
      continue
    }
    report(ctx, 'E2012', token.span, { found: token.text })
    skipToTopLevel(ctx)
  }
  if (main === null) report(ctx, 'E2010', ctx.cursor.peek().span)
  return { kind: 'Program', subprograms, main, ...nodeRange(ctx, start) }
}
```

- [ ] **Step 7: Write `packages/language/src/parser/statement.ts` (partial — Task 7 replaces it)**

```ts
import type { Stmt } from '../ast/index'
import { nodeRange, type ParserContext, report } from './context'
import { parseDefine } from './declarations'
import { skipToRecoveryPoint } from './terminator'
import { isPunct, keywordKeyOf } from './tokens'

/** One statement, or `null` when the input was an empty statement (`;`). */
export function parseStatement(ctx: ParserContext): Stmt | null {
  const token = ctx.cursor.peek()
  if (isPunct(token, ';')) {
    report(ctx, 'W2001', token.span)
    ctx.cursor.next()
    return null
  }
  if (keywordKeyOf(token) === 'define') return parseDefine(ctx)
  return parseErrorStatement(ctx)
}

/** E2002 at the offending token, then skip to the next recovery point: one `ErrorStmt`. */
export function parseErrorStatement(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  report(ctx, 'E2002', token.span, { found: token.text })
  skipToRecoveryPoint(ctx)
  return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
}
```

- [ ] **Step 8: Write `packages/language/src/parser/parse.ts` and `packages/language/src/parser/index.ts`**

`parse.ts`:

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from '../ast/index'
import type { Diagnostic } from '../diagnostics/index'
import { type Token, tokenize } from '../lexer/index'
import { createContext } from './context'
import { parseProgram } from './declarations'

export interface ParseResult {
  readonly program: Program
  readonly tokens: readonly Token[]
  readonly diagnostics: readonly Diagnostic[]
}

/**
 * Source to AST. Never throws; every option comes from `options.profile.options`.
 * Lexer diagnostics come first, then parser diagnostics in the order they were found.
 */
export function parse(source: string, options: { profile: ResolvedProfile }): ParseResult {
  const { tokens, diagnostics } = tokenize(source, options.profile)
  const ctx = createContext(source, tokens, options.profile, diagnostics)
  const program = parseProgram(ctx)
  return { program, tokens, diagnostics: ctx.diagnostics }
}
```

`index.ts`:

```ts
export type { BlockFrame, ParserContext } from './context'
export { createContext, nodeRange, report } from './context'
export { Cursor } from './cursor'
export type { ParseResult } from './parse'
export { parse } from './parse'
```

- [ ] **Step 9: Run the test, typecheck**

Run: `pnpm vitest run --project stepcode test/parser/program.test.ts` then `pnpm vitest run --project stepcode` and `pnpm --filter stepcode typecheck`
Expected: every test in `program.test.ts` passes and Tasks 1–5 stay green; typecheck silent. `blocks.ts` and `statement.ts` import each other — an ordinary parser cycle that ESM resolves because both sides only call at run time.

- [ ] **Step 10: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): program structure, subprogram headers, parameters and types"
```

---

### Task 7: `parser/` statements

**Files:**
- Modify: `packages/language/src/parser/statement.ts` (replaced with the complete dispatcher)
- Test: `packages/language/test/parser/statements-simple.test.ts`, `statements-control.test.ts`, `statements-switch.test.ts`, `options.test.ts`

**Interfaces:**
- Consumes: `parseDefine`, `expectIdentifier`, `parseTypeRef` from `./declarations`; `parseExpression`, `parseTarget` from `./expression`; `openBlock`, `parseSection`, `finishBlock`, `reportUnclosed` from `./blocks`; `consumeTerminator`, `skipToRecoveryPoint`, `BLOCK_BOUNDARY_KEYWORDS` from `./terminator`.
- Produces (all from `statement.ts`): `parseStatement(ctx): Stmt | null`, `parseErrorStatement(ctx): Stmt`, `looksLikeCaseLabel(ctx): boolean`.

Rules this task fixes:
- The dispatcher branches on the keyword key, so every profile spelling works. `Esperar Tecla` beats `Esperar` in the lexer, so `waitKey` and `wait` never collide here.
- A statement that starts with an identifier or a builtin parses one target chain and then decides: `assign` → `AssignStmt`; `equal` → `AssignStmt` with `viaEquals` when `assignWithEquals`; a `Call` / `BuiltinCall` on its own → `CallStmt`; assignment onto a call → E2020; anything else → E2002.
- `Segun` case labels carry the `case` keyword only when the profile spells it. Without it, a label is recognised by lookahead: a run of literals, identifiers, builtins, commas, parentheses and unary `+`/`-` ending in `:`.
- `Repetir` closes with `until` or `while`; the node records which in `until`.

- [ ] **Step 1: Write the four failing test files**

`packages/language/test/parser/statements-simple.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

const body = (statements: string) => `Proceso p\n${statements}\nFinProceso`
const main = (statements: string) => ast(body(statements))
const codes = (statements: string) => diagnosticCodes(body(statements))

describe('Definir and Dimension', () => {
  it('parses a definition', () => {
    expect(main('Definir a, b Como Entero;')).toBe(
      '(program (main p (define (a b) (type integer))))',
    )
  })

  it('parses a one-dimensional and a matrix dimension', () => {
    expect(main('Dimension a[3];')).toBe('(program (main p (dimension (a (literal 3)))))')
    expect(main('Dimension a[3,3];')).toBe(
      '(program (main p (dimension (a (literal 3) (literal 3)))))',
    )
  })

  it('parses chained bracket sizes and several items', () => {
    expect(main('Dimension a[3][2], b[4];')).toBe(
      '(program (main p (dimension (a (literal 3) (literal 2)) (b (literal 4)))))',
    )
  })
})

describe('Constante', () => {
  it('parses with and without a type', () => {
    expect(main('Constante PI2 <- 6;')).toBe('(program (main p (constant pi2 - (literal 6))))')
    expect(main('Constante N Como Entero <- 6;')).toBe(
      '(program (main p (constant n (type integer) (literal 6))))',
    )
  })
})

describe('assignment', () => {
  it('parses a plain assignment', () => {
    expect(main('a <- 1;')).toBe('(program (main p (assign a (literal 1))))')
  })

  it('parses an indexed assignment, comma and chained forms alike', () => {
    expect(main('a[1] <- 2;')).toBe('(program (main p (assign (index a (literal 1)) (literal 2))))')
    expect(main('a[1,2] <- 3;')).toBe(main('a[1][2] <- 3;'))
  })

  it('accepts the unicode arrow', () => {
    expect(main('a ← 1;')).toBe('(program (main p (assign a (literal 1))))')
  })

  it('reports E2020 for an assignment onto a call', () => {
    expect(codes('f(1) <- 2;')).toEqual(['E2020'])
  })

  it('rejects "=" as assignment by default', () => {
    expect(codes('a = 1;')).toEqual(['E2002'])
  })
})

describe('Escribir and Leer', () => {
  it('parses one and several arguments', () => {
    expect(main('Escribir "a";')).toBe('(program (main p (write (literal "a"))))')
    expect(main('Escribir a, " * ", b;')).toBe(
      '(program (main p (write a (literal " * ") b)))',
    )
  })

  it('parses the no-newline form', () => {
    expect(main('Escribir Sin Saltar a;')).toBe('(program (main p (write-nonl a)))')
    expect(main('Mostrar Sin Saltar a;')).toBe('(program (main p (write-nonl a)))')
  })

  it('parses Leer with one and several targets, including indices', () => {
    expect(main('Leer a;')).toBe('(program (main p (read a)))')
    expect(main('Leer a, b[1];')).toBe('(program (main p (read a (index b (literal 1)))))')
  })

  it('reports E2002 for a Leer target that is not a variable', () => {
    expect(codes('Leer f(1);')).toEqual(['E2002'])
  })
})

describe('calls, jumps and the small statements', () => {
  it('parses a call statement and a builtin used as a statement', () => {
    expect(main('f(a, b);')).toBe('(program (main p (callstmt (call f a b))))')
    expect(main('Azar();')).toBe('(program (main p (callstmt (builtin random))))')
  })

  it('parses break, continue and both return forms', () => {
    expect(main('Romper;')).toBe('(program (main p (break)))')
    expect(main('Continuar;')).toBe('(program (main p (continue)))')
    expect(main('Retornar;')).toBe('(program (main p (return)))')
    expect(main('Retornar a + 1;')).toBe(
      '(program (main p (return (binary plus a (literal 1)))))',
    )
  })

  it('parses the screen and wait statements', () => {
    expect(main('Limpiar Pantalla;')).toBe('(program (main p (clear)))')
    expect(main('Esperar 500;')).toBe('(program (main p (wait (literal 500))))')
    expect(main('Esperar Tecla;')).toBe('(program (main p (waitkey)))')
  })
})

describe('every simple statement carries an exact token range', () => {
  it('covers its own source text and nothing else', () => {
    const result = parseSource('Proceso p\n  a <- 1;\nFinProceso')
    const statement = result.program.main?.body[0]
    expect(statement).toBeDefined()
    const [first, last] = statement!.tokens
    expect(result.tokens[first]!.text).toBe('a')
    expect(result.tokens[last]!.text).toBe(';')
  })
})
```

`packages/language/test/parser/statements-control.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

const body = (statements: string) => `Proceso p\n${statements}\nFinProceso`
const main = (statements: string) => ast(body(statements))
const codes = (statements: string) => diagnosticCodes(body(statements))

describe('Si', () => {
  it('parses the plain form', () => {
    expect(main('Si a < b Entonces\nEscribir 1;\nFinSi')).toBe(
      '(program (main p (if (binary lt a b) (write (literal 1)))))',
    )
  })

  it('parses the else form', () => {
    expect(main('Si a < b Entonces\nEscribir 1;\nSino\nEscribir 2;\nFinSi')).toBe(
      '(program (main p (if (binary lt a b) (write (literal 1)) else (write (literal 2)))))',
    )
  })

  it('parses a chain of Sino Si branches', () => {
    expect(main('Si a Entonces\nEscribir 1;\nSino Si b Entonces\nEscribir 2;\nSino\nEscribir 3;\nFinSi')).toBe(
      '(program (main p (if a (write (literal 1)) elseif b (write (literal 2)) else (write (literal 3)))))',
    )
  })

  it('accepts the SiNo spelling variants of the corpus', () => {
    expect(codes('Si a Entonces\nEscribir 1;\nSiNo Si b Entonces\nEscribir 2;\nFinSi')).toEqual([])
  })

  it('nests', () => {
    expect(codes('Si a Entonces\nSi b Entonces\nEscribir 1;\nFinSi\nFinSi')).toEqual([])
  })

  it('reports E2004 for a missing Entonces and still parses the body', () => {
    const result = parseSource(body('Si a\nEscribir 1;\nFinSi'))
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2004'])
    expect(result.diagnostics[0]!.data.expected).toBe('then')
    expect(result.program.main?.body[0]?.kind).toBe('IfStmt')
  })

  it('takes no terminator after a block opener or closer', () => {
    expect(codes('Si a Entonces\nEscribir 1;\nFinSi')).toEqual([])
  })
})

describe('Mientras', () => {
  it('parses the loop', () => {
    expect(main('Mientras a < 5 Hacer\nEscribir a;\nFinMientras')).toBe(
      '(program (main p (while (binary lt a (literal 5)) (write a))))',
    )
  })

  it('reports E2004 for a missing Hacer', () => {
    expect(codes('Mientras a\nEscribir a;\nFinMientras')).toEqual(['E2004'])
  })
})

describe('Repetir', () => {
  it('closes with Hasta Que and records until', () => {
    const result = parseSource(body('Repetir\nEscribir a;\nHasta Que a > 5;'))
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.body[0]).toMatchObject({ kind: 'RepeatStmt', until: true })
    expect(ast(body('Repetir\nEscribir a;\nHasta Que a > 5;'))).toBe(
      '(program (main p (repeat (write a) until (binary gt a (literal 5)))))',
    )
  })

  it('closes with Mientras Que and records until as false', () => {
    const result = parseSource(body('Repetir\nEscribir a;\nMientras Que a <= 5;'))
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.body[0]).toMatchObject({ kind: 'RepeatStmt', until: false })
  })

  it('lets a Mientras statement inside the body keep working', () => {
    expect(codes('Repetir\nMientras a Hacer\nEscribir 1;\nFinMientras\nHasta Que b;')).toEqual([])
  })

  it('reports E2003 when neither closer arrives', () => {
    expect(codes('Repetir\nEscribir a;')).toContain('E2003')
  })
})

describe('Para', () => {
  it('parses without a step', () => {
    expect(main('Para i <- 1 Hasta 5 Hacer\nEscribir i;\nFinPara')).toBe(
      '(program (main p (for i (literal 1) (literal 5) - (write i))))',
    )
  })

  it('parses with a step, including a negative one', () => {
    expect(main('Para i <- 5 Hasta 1 Con Paso -2 Hacer\nEscribir i;\nFinPara')).toBe(
      '(program (main p (for i (literal 5) (literal 1) (unary minus (literal 2)) (write i))))',
    )
  })

  it('accepts any expression as bounds and step', () => {
    expect(codes('Para i <- 1 Hasta Longitud(s) Con Paso n Hacer\nFinPara')).toEqual([])
  })

  it('reports E2004 for a missing Hacer', () => {
    expect(codes('Para i <- 1 Hasta 5\nFinPara')).toEqual(['E2004'])
  })
})

describe('bodies are intact across nesting', () => {
  it('parses a loop inside a branch inside a loop', () => {
    const source = body(
      'Para i <- 1 Hasta 3 Hacer\nSi i MOD 2 = 0 Entonces\nMientras a Hacer\nRomper;\nFinMientras\nFinSi\nFinPara',
    )
    expect(diagnosticCodes(source)).toEqual([])
  })
})
```

`packages/language/test/parser/statements-switch.test.ts`:

```ts
import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes, parseSource } from '../helpers'

/** `es` leaves `case` unspelled; this profile spells it, exercising the optional keyword. */
const withCaso = resolveProfile(
  { id: 'caso', extends: 'es', keywords: { case: ['Caso'] } },
  builtinProfiles,
)

const body = (statements: string) => `Proceso p\n${statements}\nFinProceso`

describe('Segun without the case keyword', () => {
  it('parses labels, multi-value labels and the default clause', () => {
    const source = body(
      'Segun a Hacer\n1: Escribir "uno";\n2, 3: Escribir "dos o tres";\nDe Otro Modo: Escribir "otro";\nFinSegun',
    )
    expect(diagnosticCodes(source)).toEqual([])
    expect(ast(source)).toBe(
      '(program (main p (switch a' +
        ' (case ((literal 1)) (write (literal "uno")))' +
        ' (case ((literal 2) (literal 3)) (write (literal "dos o tres")))' +
        ' (otherwise (write (literal "otro"))))))',
    )
  })

  it('accepts several statements per label', () => {
    const source = body('Segun a Hacer\n1: Escribir "x";\nEscribir "y";\nFinSegun')
    expect(diagnosticCodes(source)).toEqual([])
    const statement = parseSource(source).program.main?.body[0]
    expect(statement).toMatchObject({ kind: 'SwitchStmt' })
    expect(statement?.kind === 'SwitchStmt' && statement.cases[0]?.body).toHaveLength(2)
  })

  it('accepts no default clause at all', () => {
    expect(diagnosticCodes(body('Segun a Hacer\n1: Escribir "x";\nFinSegun'))).toEqual([])
  })

  it('accepts an expression label', () => {
    expect(diagnosticCodes(body('Segun a Hacer\nn + 1: Escribir "x";\nFinSegun'))).toEqual([])
  })

  it('does not mistake a call statement for a label', () => {
    expect(diagnosticCodes(body('Segun a Hacer\n1: f(x, y);\nFinSegun'))).toEqual([])
  })

  it('reports E2004 for a missing Hacer', () => {
    expect(diagnosticCodes(body('Segun a\n1: Escribir "x";\nFinSegun'))).toEqual(['E2004'])
  })

  it('reports E2013 for a second default clause and keeps the first', () => {
    const source = body(
      'Segun a Hacer\nDe Otro Modo: Escribir "uno";\nDe Otro Modo: Escribir "dos";\nFinSegun',
    )
    const result = parseSource(source)
    expect(result.diagnostics.map((d) => d.code)).toEqual(['E2013'])
    const statement = result.program.main?.body[0]
    expect(statement?.kind === 'SwitchStmt' && statement.otherwise).toHaveLength(1)
  })
})

describe('Segun with a profile that spells the case keyword', () => {
  it('accepts the keyword form', () => {
    const source = body('Segun a Hacer\nCaso 1: Escribir "uno";\nFinSegun')
    expect(diagnosticCodes(source, withCaso)).toEqual([])
    expect(ast(source, withCaso)).toBe(
      '(program (main p (switch a (case ((literal 1)) (write (literal "uno"))))))',
    )
  })

  it('still accepts a label without the keyword', () => {
    expect(diagnosticCodes(body('Segun a Hacer\n1: Escribir "uno";\nFinSegun'), withCaso)).toEqual(
      [],
    )
  })
})
```

`packages/language/test/parser/options.test.ts`:

```ts
import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { ast, diagnosticCodes } from '../helpers'

const withEquals = resolveProfile(
  { id: 'equals', extends: 'es', options: { assignWithEquals: true } },
  builtinProfiles,
)
const untyped = resolveProfile(
  { id: 'untyped', extends: 'es', options: { typedParameters: false } },
  builtinProfiles,
)

describe('requireSemicolons: false', () => {
  it('terminates statements on a line break', () => {
    const source = 'Proceso p\nDefinir a Como Entero\na <- 1\nEscribir a\nFinProceso'
    expect(diagnosticCodes(source, profiles.pseint)).toEqual([])
    expect(ast(source, profiles.pseint)).toBe(
      '(program (main p (define (a) (type integer)) (assign a (literal 1)) (write a)))',
    )
  })

  it('still accepts explicit semicolons', () => {
    expect(diagnosticCodes('Proceso p\na <- 1;\nFinProceso', profiles.pseint)).toEqual([])
  })

  it('accepts a statement running straight into a block closer', () => {
    expect(
      diagnosticCodes('Proceso p\nSi a Entonces\nEscribir 1\nFinSi\nFinProceso', profiles.pseint),
    ).toEqual([])
  })

  it('still reports garbage on the same line', () => {
    expect(diagnosticCodes('Proceso p\na <- 1 )\nFinProceso', profiles.pseint)).toEqual(['E2002'])
  })
})

describe('assignWithEquals', () => {
  it('accepts "=" as assignment and marks viaEquals', () => {
    expect(ast('Proceso p\na = 1;\nFinProceso', withEquals)).toBe(
      '(program (main p (assign= a (literal 1))))',
    )
  })

  it('still accepts the arrow', () => {
    expect(ast('Proceso p\na <- 1;\nFinProceso', withEquals)).toBe(
      '(program (main p (assign a (literal 1))))',
    )
  })

  it('keeps "=" as comparison inside an expression', () => {
    expect(ast('Proceso p\nEscribir a = 1;\nFinProceso', withEquals)).toBe(
      '(program (main p (write (binary equal a (literal 1)))))',
    )
  })
})

describe('typedParameters: false', () => {
  it('accepts a bare parameter', () => {
    expect(
      diagnosticCodes('SubProceso f(arreglo)\nFinSubProceso\nProceso p\nFinProceso', untyped),
    ).toEqual([])
  })
})

describe('caseSensitive', () => {
  it('folds identifier case by default', () => {
    expect(ast('Proceso p\nMiVar <- 1;\nFinProceso')).toBe(
      '(program (main p (assign mivar (literal 1))))',
    )
  })

  it('keeps identifier case when the option is on', () => {
    const strict = resolveProfile(
      { id: 'strict', extends: 'es', options: { caseSensitive: true } },
      builtinProfiles,
    )
    expect(ast('Proceso p\nMiVar <- 1;\nFinProceso', strict)).toBe(
      '(program (main p (assign MiVar (literal 1))))',
    )
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project stepcode test/parser/statements-simple.test.ts test/parser/statements-control.test.ts test/parser/statements-switch.test.ts test/parser/options.test.ts`
Expected: FAIL — every statement other than `Definir` currently falls into `parseErrorStatement`.

- [ ] **Step 3: Replace `packages/language/src/parser/statement.ts` with the complete dispatcher**

```ts
import type { KeywordKey } from '@stepcode/profiles'
import type {
  BuiltinCall,
  Call,
  DimensionItem,
  Expr,
  Identifier,
  IfBranch,
  Index,
  Stmt,
  SwitchCase,
  TypeRef,
} from '../ast/index'
import { finishBlock, openBlock, parseSection, reportUnclosed } from './blocks'
import { nodeRange, type ParserContext, report } from './context'
import { expectIdentifier, parseDefine, parseTypeRef } from './declarations'
import { parseExpression, parseTarget } from './expression'
import { BLOCK_BOUNDARY_KEYWORDS, consumeTerminator, skipToRecoveryPoint } from './terminator'
import { isKeyword, isOperator, isPunct, keywordKeyOf } from './tokens'

function errorStmt(ctx: ParserContext, start: number): Stmt {
  return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
}

/** Consumes a required keyword (`Entonces`, `Hacer`) or reports E2004 and carries on. */
function expectKeyword(ctx: ParserContext, key: KeywordKey): void {
  if (isKeyword(ctx.cursor.peek(), key)) {
    ctx.cursor.next()
    return
  }
  report(ctx, 'E2004', ctx.cursor.peek().span, { expected: key })
}

function parseExprList(ctx: ParserContext): Expr[] {
  const items: Expr[] = [parseExpression(ctx)]
  while (isPunct(ctx.cursor.peek(), ',')) {
    ctx.cursor.next()
    items.push(parseExpression(ctx))
  }
  return items
}

/** One statement, or `null` for an empty statement (`;`), which produces no node. */
export function parseStatement(ctx: ParserContext): Stmt | null {
  const token = ctx.cursor.peek()
  if (isPunct(token, ';')) {
    report(ctx, 'W2001', token.span)
    ctx.cursor.next()
    return null
  }
  switch (keywordKeyOf(token)) {
    case 'define':
      return parseDefine(ctx)
    case 'dimension':
      return parseDimension(ctx)
    case 'constant':
      return parseConstant(ctx)
    case 'write':
      return parseWrite(ctx, true)
    case 'writeNoNewline':
      return parseWrite(ctx, false)
    case 'read':
      return parseRead(ctx)
    case 'if':
      return parseIf(ctx)
    case 'switch':
      return parseSwitch(ctx)
    case 'while':
      return parseWhile(ctx)
    case 'repeat':
      return parseRepeat(ctx)
    case 'for':
      return parseFor(ctx)
    case 'break':
      return parseBare(ctx, 'BreakStmt')
    case 'continue':
      return parseBare(ctx, 'ContinueStmt')
    case 'return':
      return parseReturn(ctx)
    case 'clearScreen':
      return parseBare(ctx, 'ClearStmt')
    case 'waitKey':
      return parseBare(ctx, 'WaitKeyStmt')
    case 'wait':
      return parseWait(ctx)
    default:
      break
  }
  if (token.kind === 'identifier' || token.kind === 'builtin') return parseAssignOrCall(ctx)
  return parseErrorStatement(ctx)
}

/** E2002 at the offending token, then skip to the next recovery point: one `ErrorStmt`. */
export function parseErrorStatement(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  report(ctx, 'E2002', token.span, { found: token.text })
  skipToRecoveryPoint(ctx)
  return { kind: 'ErrorStmt', ...nodeRange(ctx, start) }
}

// --- simple statements -----------------------------------------------------

function parseBare(
  ctx: ParserContext,
  kind: 'BreakStmt' | 'ContinueStmt' | 'ClearStmt' | 'WaitKeyStmt',
): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind, ...nodeRange(ctx, start) }
}

function parseWait(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const millis = parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'WaitStmt', millis, ...nodeRange(ctx, start) }
}

function parseReturn(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const token = ctx.cursor.peek()
  const key = keywordKeyOf(token)
  const bare =
    isPunct(token, ';') ||
    token.kind === 'eof' ||
    (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key)) ||
    ctx.cursor.onNewLine()
  const value = bare ? undefined : parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  const range = nodeRange(ctx, start)
  return value === undefined
    ? { kind: 'ReturnStmt', ...range }
    : { kind: 'ReturnStmt', value, ...range }
}

function parseWrite(ctx: ParserContext, newline: boolean): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const args = parseExprList(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'WriteStmt', args, newline, ...nodeRange(ctx, start) }
}

function parseRead(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const targets: (Identifier | Index)[] = []
  for (;;) {
    const target = parseTarget(ctx)
    if (target.kind === 'Identifier' || target.kind === 'Index') targets.push(target)
    else report(ctx, 'E2002', target.span, { found: ctx.source.slice(target.span.start, target.span.end) })
    if (!isPunct(ctx.cursor.peek(), ',')) break
    ctx.cursor.next()
  }
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'ReadStmt', targets, ...nodeRange(ctx, start) }
}

function parseDimension(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const items: DimensionItem[] = []
  for (;;) {
    const name = expectIdentifier(ctx)
    const sizes: Expr[] = []
    while (isPunct(ctx.cursor.peek(), '[')) {
      const open = ctx.cursor.next()
      sizes.push(parseExpression(ctx))
      while (isPunct(ctx.cursor.peek(), ',')) {
        ctx.cursor.next()
        sizes.push(parseExpression(ctx))
      }
      if (isPunct(ctx.cursor.peek(), ']')) ctx.cursor.next()
      else report(ctx, 'E2005', open.span, { bracket: ']' })
    }
    items.push({ name, sizes })
    if (!isPunct(ctx.cursor.peek(), ',')) break
    ctx.cursor.next()
  }
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'DimensionStmt', items, ...nodeRange(ctx, start) }
}

function parseConstant(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  const name = expectIdentifier(ctx)
  let type: TypeRef | undefined
  if (isKeyword(ctx.cursor.peek(), 'as')) {
    ctx.cursor.next()
    type = parseTypeRef(ctx) ?? undefined
  }
  if (isOperator(ctx.cursor.peek(), 'assign')) ctx.cursor.next()
  else {
    const token = ctx.cursor.peek()
    report(ctx, 'E2002', token.span, { found: token.text })
    skipToRecoveryPoint(ctx)
    return errorStmt(ctx, start)
  }
  const value = parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  const range = nodeRange(ctx, start)
  return type === undefined
    ? { kind: 'ConstantStmt', name, value, ...range }
    : { kind: 'ConstantStmt', name, type, value, ...range }
}

/** `Target assign Expr`, `Target equal Expr` (option), a call statement, or E2002. */
function parseAssignOrCall(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  const target = parseTarget(ctx)
  const next = ctx.cursor.peek()
  const viaEquals = ctx.profile.options.assignWithEquals && isOperator(next, 'equal')
  if (isOperator(next, 'assign') || viaEquals) {
    ctx.cursor.next()
    const value = parseExpression(ctx)
    const terminator = consumeTerminator(ctx)
    if (target.kind !== 'Identifier' && target.kind !== 'Index') {
      report(ctx, 'E2020', target.span)
      return errorStmt(ctx, start)
    }
    if (terminator === 'garbled') return errorStmt(ctx, start)
    return { kind: 'AssignStmt', target, value, viaEquals, ...nodeRange(ctx, start) }
  }
  if (target.kind === 'Call' || target.kind === 'BuiltinCall') {
    const call: Call | BuiltinCall = target
    if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
    return { kind: 'CallStmt', call, ...nodeRange(ctx, start) }
  }
  report(ctx, 'E2002', next.span, { found: next.text })
  skipToRecoveryPoint(ctx)
  return errorStmt(ctx, start)
}

// --- control flow ----------------------------------------------------------

function parseIf(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'if',
    closer: 'endIf',
    follows: ['elseIf', 'else', 'endIf'],
    openerToken: start,
  })
  const condition = parseExpression(ctx)
  expectKeyword(ctx, 'then')
  const branches: IfBranch[] = [{ condition, body: parseSection(ctx) }]
  while (isKeyword(ctx.cursor.peek(), 'elseIf')) {
    ctx.cursor.next()
    const next = parseExpression(ctx)
    expectKeyword(ctx, 'then')
    branches.push({ condition: next, body: parseSection(ctx) })
  }
  let elseBody: Stmt[] | undefined
  if (isKeyword(ctx.cursor.peek(), 'else')) {
    ctx.cursor.next()
    elseBody = parseSection(ctx)
  }
  finishBlock(ctx, 'endIf')
  const range = nodeRange(ctx, start)
  return elseBody === undefined
    ? { kind: 'IfStmt', branches, ...range }
    : { kind: 'IfStmt', branches, elseBody, ...range }
}

function parseWhile(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'while',
    closer: 'endWhile',
    follows: ['endWhile'],
    openerToken: start,
  })
  const condition = parseExpression(ctx)
  expectKeyword(ctx, 'do')
  const body = parseSection(ctx)
  finishBlock(ctx, 'endWhile')
  return { kind: 'WhileStmt', condition, body, ...nodeRange(ctx, start) }
}

/** `Repetir` closes with `until` or `while`; the node keeps which one in `until`. */
function parseRepeat(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'repeat',
    closer: 'until',
    follows: ['until', 'while'],
    openerToken: start,
  })
  const body = parseSection(ctx, { stop: repeatCloserAhead })
  const frame = ctx.blocks.pop()
  const token = ctx.cursor.peek()
  const key = keywordKeyOf(token)
  let until = true
  if (key === 'until' || key === 'while') {
    until = key === 'until'
    ctx.cursor.next()
  } else if (frame !== undefined) {
    reportUnclosed(ctx, frame, token.span)
    return { kind: 'RepeatStmt', body, condition: parseErrorExpr(ctx), until, ...nodeRange(ctx, start) }
  }
  const condition = parseExpression(ctx)
  if (consumeTerminator(ctx) === 'garbled') return errorStmt(ctx, start)
  return { kind: 'RepeatStmt', body, condition, until, ...nodeRange(ctx, start) }
}

/**
 * True when the `while` keyword ahead closes a `Repetir` rather than opening a loop. Both
 * spell the same key (`Mientras`, `Mientras Que`), so they are told apart by what follows:
 * a loop header reaches `do`, a closer reaches the terminator or a block boundary first.
 */
function repeatCloserAhead(ctx: ParserContext): boolean {
  if (keywordKeyOf(ctx.cursor.peek()) !== 'while') return false
  for (let offset = 1; offset < 64; offset++) {
    const token = ctx.cursor.peekAhead(offset)
    if (token.kind === 'eof' || isPunct(token, ';')) return true
    const key = keywordKeyOf(token)
    if (key === 'do') return false
    if (key !== null && BLOCK_BOUNDARY_KEYWORDS.has(key)) return true
  }
  return true
}

/** A zero-width placeholder condition for a `Repetir` that never got its closer. */
function parseErrorExpr(ctx: ParserContext): Expr {
  const index = ctx.cursor.at()
  const span = ctx.cursor.peek().span
  return { kind: 'ErrorExpr', span: { start: span.start, end: span.start }, tokens: [index, index] }
}

function parseFor(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, { opener: 'for', closer: 'endFor', follows: ['endFor'], openerToken: start })
  const counter = expectIdentifier(ctx)
  if (isOperator(ctx.cursor.peek(), 'assign')) ctx.cursor.next()
  else report(ctx, 'E2002', ctx.cursor.peek().span, { found: ctx.cursor.peek().text })
  const from = parseExpression(ctx)
  expectKeyword(ctx, 'to')
  const to = parseExpression(ctx)
  let step: Expr | undefined
  if (isKeyword(ctx.cursor.peek(), 'step')) {
    ctx.cursor.next()
    step = parseExpression(ctx)
  }
  expectKeyword(ctx, 'do')
  const body = parseSection(ctx)
  finishBlock(ctx, 'endFor')
  const range = nodeRange(ctx, start)
  return step === undefined
    ? { kind: 'ForStmt', counter, from, to, body, ...range }
    : { kind: 'ForStmt', counter, from, to, step, body, ...range }
}

// --- Segun -----------------------------------------------------------------

const CASE_LABEL_KINDS: ReadonlySet<string> = new Set([
  'integer',
  'real',
  'string',
  'identifier',
  'builtin',
])

/**
 * True when the tokens ahead read as `Expr ("," Expr)* ":"`. A `Segun` label carries the
 * `case` keyword only when the profile spells it, so a bare label needs this lookahead to
 * be told apart from an ordinary statement.
 */
export function looksLikeCaseLabel(ctx: ParserContext): boolean {
  for (let offset = 0; offset < 32; offset++) {
    const token = ctx.cursor.peekAhead(offset)
    if (isPunct(token, ':')) return offset > 0
    if (isPunct(token, ',') || isPunct(token, '(') || isPunct(token, ')')) continue
    if (token.kind === 'operator') {
      const key = token.value
      if (key === 'minus' || key === 'plus') continue
      return false
    }
    if (token.kind === 'keyword') {
      const key = keywordKeyOf(token)
      if (key === 'true' || key === 'false') continue
      return false
    }
    if (!CASE_LABEL_KINDS.has(token.kind)) return false
  }
  return false
}

function parseSwitch(ctx: ParserContext): Stmt {
  const start = ctx.cursor.at()
  ctx.cursor.next()
  openBlock(ctx, {
    opener: 'switch',
    closer: 'endSwitch',
    follows: ['case', 'otherwise', 'endSwitch'],
    openerToken: start,
  })
  const selector = parseExpression(ctx)
  expectKeyword(ctx, 'do')
  const options = { stop: looksLikeCaseLabel }
  const cases: SwitchCase[] = []
  let otherwise: Stmt[] | undefined
  for (;;) {
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === 'otherwise') {
      ctx.cursor.next()
      if (isPunct(ctx.cursor.peek(), ':')) ctx.cursor.next()
      const body = parseSection(ctx, options)
      if (otherwise === undefined) otherwise = body
      else report(ctx, 'E2013', token.span)
      continue
    }
    if (key !== 'case' && !looksLikeCaseLabel(ctx)) break
    if (key === 'case') ctx.cursor.next()
    const values = parseExprList(ctx)
    if (isPunct(ctx.cursor.peek(), ':')) ctx.cursor.next()
    else {
      const found = ctx.cursor.peek()
      report(ctx, 'E2002', found.span, { found: found.text })
    }
    cases.push({ values, body: parseSection(ctx, options) })
  }
  finishBlock(ctx, 'endSwitch')
  const range = nodeRange(ctx, start)
  return otherwise === undefined
    ? { kind: 'SwitchStmt', selector, cases, ...range }
    : { kind: 'SwitchStmt', selector, cases, otherwise, ...range }
}
```

- [ ] **Step 4: Run the four files, then the whole suite, then typecheck**

Run: `pnpm vitest run --project stepcode test/parser` then `pnpm vitest run --project stepcode` and `pnpm --filter stepcode typecheck`
Expected: every parser test passes and Tasks 1–6 stay green; typecheck silent. If `Segun` swallows the statement after a label, `looksLikeCaseLabel` is matching a `:` too far away — the scan must stop at any token kind it does not list.

- [ ] **Step 5: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): every statement form of the grammar"
```

---

### Task 8: error recovery and the diagnostics suite

**Files:**
- Modify: `packages/language/src/parser/blocks.ts` (`parseSection` gains the dangling-closer recovery)
- Modify: `packages/language/test/helpers.ts` (add `diagnosticReport`)
- Test: `packages/language/test/parser/diagnostics.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 5–7.
- Produces: the final `parseSection` behaviour, plus `DANGLING_KEYWORDS` exported from `blocks.ts`; test helper `diagnosticReport(source, profile?): { code, line, column, es, en }[]`.

**The block-stack rules** (spec §7), all already reachable through `openBlock` / `parseSection` / `finishBlock`; this task completes the middle one:
- The closer matches the innermost block → `finishBlock` consumes it and pops. (Task 6.)
- The closer matches an **outer** block → `finishBlock` reports E2003 on the innermost opener with the closer's span as `related`, pops the inner frame and leaves the token; the outer block consumes it. (Task 6, because `finishBlock` only consumes a token it recognises.)
- The closer matches **nothing** → E2006 and the token is dropped, then the block keeps parsing. (This task, in `parseSection`.)
- EOF with open blocks → one E2003 per open block, innermost first, because each `finishBlock` runs as its own parse call returns. (Task 6.)

The missing-terminator rule (E2001 / E2002), E2004, E2005 and E2020 are already implemented in Tasks 5–7; this task's job for them is a named test per code.

- [ ] **Step 1: Append `diagnosticReport` to `packages/language/test/helpers.ts`**

```ts
import { formatDiagnostic } from '../src/diagnostics/index'
import { LineMap } from '../src/source/index'

export interface DiagnosticReport {
  code: string
  line: number
  column: number
  es: string
  en: string
}

/** Every diagnostic of one parse, with its 1-based position and both rendered messages. */
export function diagnosticReport(
  source: string,
  profile: ResolvedProfile = profiles.es,
): DiagnosticReport[] {
  const map = new LineMap(source)
  return parseSource(source, profile).diagnostics.map((diagnostic) => {
    const position = map.positionAt(diagnostic.span.start)
    return {
      code: diagnostic.code,
      line: position.line,
      column: position.column,
      es: formatDiagnostic(diagnostic, 'es', profile),
      en: formatDiagnostic(diagnostic, 'en', profiles.en),
    }
  })
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/parser/diagnostics.test.ts`**

```ts
import { builtinProfiles, profiles, resolveProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES } from '../../src/diagnostics/index'
import { ast, diagnosticCodes, diagnosticReport, parseSource, sexpr } from '../helpers'

const untyped = resolveProfile(
  { id: 'untyped', extends: 'es', options: { typedParameters: false } },
  builtinProfiles,
)

/** One case per code: the source, the profile, and where the first diagnostic must land. */
const cases: {
  code: string
  source: string
  profile?: typeof profiles.es
  line: number
  column: number
  es: string
  en: string
}[] = [
  {
    code: 'E1001',
    source: 'Proceso p\n  a <- @;\nFinProceso',
    line: 2,
    column: 8,
    es: '@',
    en: '@',
  },
  {
    code: 'E1002',
    source: 'Proceso p\n  Escribir "hola;\nFinProceso',
    line: 2,
    column: 12,
    es: 'comilla',
    en: 'quote',
  },
  {
    code: 'E1003',
    source: 'Proceso p\n  a <- 10abc;\nFinProceso',
    line: 2,
    column: 8,
    es: '10abc',
    en: '10abc',
  },
  {
    code: 'E1006',
    source: 'Proceso p\n  Si a == b Entonces\n  FinSi\nFinProceso',
    line: 2,
    column: 8,
    es: '=',
    en: '=',
  },
  {
    code: 'E2001',
    source: 'Proceso p\n  Definir a Como Entero\n  a <- 1;\nFinProceso',
    line: 2,
    column: 24,
    es: ';',
    en: ';',
  },
  {
    code: 'E2002',
    source: 'Proceso p\n  a <- 1 ) 2;\nFinProceso',
    line: 2,
    column: 10,
    es: ')',
    en: ')',
  },
  {
    code: 'E2003',
    source: 'Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso',
    line: 2,
    column: 3,
    es: 'FinSi',
    en: 'EndIf',
  },
  {
    code: 'E2004',
    source: 'Proceso p\n  Si a\n  Escribir 1;\n  FinSi\nFinProceso',
    line: 3,
    column: 3,
    es: 'Entonces',
    en: 'Then',
  },
  {
    code: 'E2005',
    source: 'Proceso p\n  a <- (1 + 2;\nFinProceso',
    line: 2,
    column: 8,
    es: ')',
    en: ')',
  },
  {
    code: 'E2006',
    source: 'Proceso p\n  FinSi\nFinProceso',
    line: 2,
    column: 3,
    es: 'FinSi',
    en: 'EndIf',
  },
  {
    code: 'E2010',
    source: 'SubProceso f\nFinSubProceso\n',
    line: 3,
    column: 1,
    es: 'Proceso',
    en: 'Program',
  },
  {
    code: 'E2011',
    source: 'Proceso uno\nFinProceso\nProceso dos\nFinProceso',
    line: 3,
    column: 1,
    es: 'Proceso',
    en: 'Program',
  },
  {
    code: 'E2012',
    source: 'Escribir 1;\nProceso p\nFinProceso',
    line: 1,
    column: 1,
    es: 'Escribir',
    en: 'Escribir',
  },
  {
    code: 'E2013',
    source:
      'Proceso p\n  Segun a Hacer\n  De Otro Modo: Escribir 1;\n  De Otro Modo: Escribir 2;\n  FinSegun\nFinProceso',
    line: 4,
    column: 3,
    es: 'De Otro Modo',
    en: 'Otherwise',
  },
  {
    code: 'E2020',
    source: 'Proceso p\n  f(1) <- 2;\nFinProceso',
    line: 2,
    column: 3,
    es: 'llamada',
    en: 'call',
  },
  {
    code: 'E2021',
    source: 'SubProceso f(a)\nFinSubProceso\nProceso p\nFinProceso',
    line: 1,
    column: 14,
    es: 'a',
    en: 'a',
  },
  {
    code: 'E2022',
    source: 'SubProceso f(a Por Referencia Por Valor)\nFinSubProceso\nProceso p\nFinProceso',
    profile: untyped,
    line: 1,
    column: 31,
    es: 'Por Valor',
    en: 'ByValue',
  },
  {
    code: 'E2030',
    source: 'Proceso p\n  Escribir a < b < c;\nFinProceso',
    line: 2,
    column: 18,
    es: 'Y',
    en: 'And',
  },
  {
    code: 'E2031',
    source: 'Proceso p\n  Escribir Entero;\nFinProceso',
    line: 2,
    column: 12,
    es: 'Entero',
    en: 'Entero',
  },
  {
    code: 'W2001',
    source: 'Proceso p\n  a <- 1;;\nFinProceso',
    line: 2,
    column: 10,
    es: ';',
    en: ';',
  },
]

describe('every diagnostic code has a case', () => {
  it('covers the whole catalogue', () => {
    expect([...new Set(cases.map((entry) => entry.code))].sort()).toEqual([...DIAGNOSTIC_CODES].sort())
  })

  for (const entry of cases) {
    it(`${entry.code} reports at the right place in both locales`, () => {
      const report = diagnosticReport(entry.source, entry.profile ?? profiles.es)
      const first = report.find((item) => item.code === entry.code)
      expect(first, `${entry.code} was not reported: ${JSON.stringify(report)}`).toBeDefined()
      expect({ line: first!.line, column: first!.column }).toEqual({
        line: entry.line,
        column: entry.column,
      })
      expect(first!.es).toContain(entry.es)
      expect(first!.en).toContain(entry.en)
      expect(first!.es).not.toMatch(/\{[a-zA-Z$:]+\}/)
      expect(first!.en).not.toMatch(/\{[a-zA-Z$:]+\}/)
    })
  }
})

describe('E2003 carries the opener line and a related span', () => {
  it('names the opener, the closer and the line', () => {
    const result = parseSource('Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso')
    const diagnostic = result.diagnostics.find((item) => item.code === 'E2003')
    expect(diagnostic?.data).toMatchObject({ opener: 'if', closer: 'endIf', openerLine: 2 })
    expect(diagnostic?.related).toHaveLength(1)
  })

  it('reports one E2003 per open block at end of file, innermost first', () => {
    const result = parseSource('Proceso p\n  Si a Entonces\n  Mientras b Hacer\n')
    expect(result.diagnostics.map((item) => item.code)).toEqual(['E2003', 'E2003', 'E2003'])
    expect(result.diagnostics.map((item) => item.data.closer)).toEqual([
      'endWhile',
      'endIf',
      'endProgram',
    ])
  })

  it('lets an outer closer close the outer block after the inner one is reported', () => {
    const result = parseSource('Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso')
    expect(result.diagnostics.map((item) => item.code)).toEqual(['E2003'])
    expect(sexpr(result.program)).toBe(
      '(program (main p (if a (write (literal 1)))))',
    )
  })
})

describe('recovery: one mistake, one diagnostic, an intact AST', () => {
  it('a missing semicolon before a statement on the next line', () => {
    const source = 'Proceso p\n  a <- 1\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2001'])
    expect(ast(source)).toBe(
      '(program (main p (assign a (literal 1)) (assign b (literal 2))))',
    )
  })

  it('a garbled statement on one line, with the rest intact', () => {
    const source = 'Proceso p\n  a <- 1 )) 9;\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2002'])
    expect(ast(source)).toBe('(program (main p (error-stmt) (assign b (literal 2))))')
  })

  it('a bad statement start', () => {
    const source = 'Proceso p\n  Entonces;\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2002'])
    expect(ast(source)).toBe('(program (main p (error-stmt) (assign b (literal 2))))')
  })

  it('a missing FinSi', () => {
    const source = 'Proceso p\n  Si a Entonces\n  Escribir 1;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2003'])
  })

  it('a stray FinSi, dropped so the block keeps parsing', () => {
    const source = 'Proceso p\n  a <- 1;\n  FinSi\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2006'])
    expect(ast(source)).toBe(
      '(program (main p (assign a (literal 1)) (assign b (literal 2))))',
    )
  })

  it('a mismatched closer', () => {
    const source = 'Proceso p\n  Si a Entonces\n  Escribir 1;\n  FinMientras\nFinProceso'
    const codes = diagnosticCodes(source)
    expect(codes).toContain('E2006')
    expect(codes.filter((code) => code === 'E2003')).toHaveLength(1)
  })

  it('a statement outside Proceso', () => {
    const source = 'a <- 1;\nProceso p\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2012'])
    expect(ast(source)).toBe('(program (main p (assign b (literal 2))))')
  })

  it('a broken expression leaves the statement terminated', () => {
    const source = 'Proceso p\n  a <- ;\n  b <- 2;\nFinProceso'
    expect(diagnosticCodes(source)).toEqual(['E2031'])
    expect(ast(source)).toBe(
      '(program (main p (assign a (error-expr)) (assign b (literal 2))))',
    )
  })
})

describe('diagnostic ordering and shape', () => {
  it('puts lexer diagnostics before parser ones', () => {
    const codes = diagnosticCodes('Proceso p\n  a <- @;\n  b <- ) ;\nFinProceso')
    expect(codes).toContain('E1001')
    const lastLexer = codes.reduce((last, code, index) => (code.startsWith('E1') ? index : last), -1)
    const firstParser = codes.findIndex((code) => code.startsWith('E2'))
    expect(lastLexer).toBeLessThan(firstParser)
  })

  it('is deterministic across runs', () => {
    const source = 'Proceso p\n  Si a\n  FinMientras\n'
    expect(parseSource(source).diagnostics).toEqual(parseSource(source).diagnostics)
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/parser/diagnostics.test.ts`
Expected: FAIL — the stray-closer cases (E2006 and the recovery cases that depend on it) fail because `parseSection` does not drop dangling closers yet. Every other case should already pass; if one does not, fix the column expectation in the table rather than the source, since the spans are fixed by the earlier tasks.

- [ ] **Step 4: Give `parseSection` the dangling-closer recovery in `packages/language/src/parser/blocks.ts`**

Add the constant next to `BlockOptions`:

```ts
/**
 * Keywords that end or continue some block. One of these is *dangling* when no open block
 * lists it in `follows`: it closes nothing, so it is reported and dropped (spec §7).
 */
export const DANGLING_KEYWORDS: ReadonlySet<KeywordKey> = new Set([
  'endProgram',
  'endProcedure',
  'endFunction',
  'endIf',
  'elseIf',
  'else',
  'endSwitch',
  'otherwise',
  'endWhile',
  'endFor',
  'until',
])
```

Replace the body of `parseSection` with:

```ts
/**
 * One block body, plus the dangling-closer recovery: a closer no open block is waiting for
 * gets E2006, is dropped, and the body keeps parsing. A closer an *enclosing* block wants is
 * left alone so `finishBlock` can report the inner block unclosed and hand it outwards.
 */
export function parseSection(ctx: ParserContext, options: BlockOptions = {}): Stmt[] {
  const body: Stmt[] = []
  for (;;) {
    body.push(...parseBlock(ctx, options))
    const token = ctx.cursor.peek()
    const key = keywordKeyOf(token)
    if (key === null || !DANGLING_KEYWORDS.has(key)) return body
    if (ctx.blocks.some((frame) => frame.follows.includes(key))) return body
    report(ctx, 'E2006', token.span, { closer: key })
    ctx.cursor.next()
  }
}
```

- [ ] **Step 5: Run the whole suite, typecheck**

Run: `pnpm vitest run --project stepcode` then `pnpm --filter stepcode typecheck`
Expected: every test in the package passes; typecheck silent.

- [ ] **Step 6: Lint and commit**

```bash
pnpm lint:fix && pnpm lint
git add packages/language
git commit -m "feat(language): block-stack recovery and the full diagnostics suite"
```

---

### Task 9: the v1 conformance corpus and property tests

**Files:**
- Modify: `packages/language/package.json` (add `@types/node` and `fast-check` devDependencies), `packages/language/tsconfig.json` (`types: ["node"]`, include `test/helpers.ts`), `pnpm-workspace.yaml` (catalog entry)
- Create: `packages/language/scripts/extract-corpus.ts` (a one-off, run once, then committed)
- Create (generated, committed): `packages/language/test/corpus/programs/*.stepcode`, `packages/language/test/corpus/programs/index-base-0.txt`
- Test: `packages/language/test/corpus/parse.test.ts`, `packages/language/test/parser/property.test.ts`

**Interfaces:**
- Consumes: `parse` from `../../src/parser/parse`; `profiles.pseint` from `@stepcode/profiles`.
- Produces: the committed corpus files, plus two test suites. No new source API.

**What the script meets in `test/corpus/v1/`** (survey of 2026-09-03): thirteen `*.v1.ts` Vitest files whose programs sit in plain backtick template literals passed to `internalInterpret(...)` or `validate(...)`, plus two `programs/*.program.ts` files that export one template literal each. The literals contain no `${}` interpolation and no nested backticks, but they do contain `\t` escapes. `arrays.v1.ts` and `strings.v1.ts` carry the legacy `$ arrays@stepcode` first line. `internal-functions.v1.ts` and `examples.v1.ts` call `round(` and `random(`, which no profile spells. `utils.v1.ts` holds no programs at all.

- [ ] **Step 1: Add the dependencies and fix the tsconfig**

In `pnpm-workspace.yaml`, add to the `catalog:` block:

```yaml
  fast-check: ^4.3.0
```

In `packages/language/package.json`, replace `devDependencies` with:

```json
  "devDependencies": {
    "@types/node": "catalog:",
    "fast-check": "catalog:",
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
```

Replace `packages/language/tsconfig.json` with:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"]
  },
  "include": ["src", "test/**/*.test.ts", "test/helpers.ts"]
}
```

Run `pnpm install`. Expected: `fast-check` and `@types/node` land in the lockfile. If pnpm refuses `^4.3.0` because no such version exists yet, use the newest `4.x` it does resolve and put that range in the catalog; if `minimumReleaseAge` blocks the exact build, add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` and commit that too. `scripts/` is deliberately outside the tsconfig `include`: it is a one-off tool, not shipped code.

- [ ] **Step 2: Write `packages/language/scripts/extract-corpus.ts`**

```ts
/**
 * One-off: turns the frozen StepCode v1 test corpus into committed `.stepcode` programs.
 *
 * Run once from the repo root, then commit its output:
 *   node packages/language/scripts/extract-corpus.ts
 * (Node >= 22.18 runs TypeScript directly; on an older Node use
 *  `node --experimental-strip-types packages/language/scripts/extract-corpus.ts`.)
 *
 * Three rewrites are applied, all recorded in the language sub-spec §8:
 *   - the legacy `$ arrays@stepcode` first line is dropped and its program is listed in
 *     `index-base-0.txt`, so sub-spec C can re-run it with `indexBase: 0`;
 *   - `round(` becomes `Redondear(` and `random(` becomes `Azar(`, the v1-only builtin
 *     spellings no profile defines.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../test/corpus', import.meta.url))
const v1 = join(root, 'v1')
const out = join(root, 'programs')

/** Titles and template literals, in source order. The v1 literals have no `${}` and no nesting. */
const TOKEN = /\b(?:test|it|describe)\(\s*(['"])([\s\S]*?)\1|`([^`]*)`/g

const LOOKS_LIKE_PROGRAM = /^\s*(?:\$|Proceso|Algoritmo|SubProceso|SubAlgoritmo|Procedimiento|Funcion)\b/im

function unescape(text: string): string {
  return text.replace(/\\([\s\S])/g, (_match, char: string) => {
    if (char === 'n') return '\n'
    if (char === 't') return '\t'
    if (char === 'r') return '\r'
    return char
  })
}

function slugify(title: string): string {
  return (
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'program'
  )
}

const used = new Map<string, number>()
function uniqueSlug(title: string): string {
  const base = slugify(title)
  const seen = used.get(base) ?? 0
  used.set(base, seen + 1)
  return seen === 0 ? base : `${base}-${seen + 1}`
}

const indexBaseZero: string[] = []

function emit(title: string, raw: string): void {
  let program = unescape(raw)
  const slug = uniqueSlug(title)
  const lines = program.split('\n')
  if (/^\s*\$\s*arrays@stepcode\s*$/.test(lines[0] ?? '')) {
    indexBaseZero.push(slug)
    program = lines.slice(1).join('\n')
  }
  program = program.replace(/\bround\s*\(/g, 'Redondear(').replace(/\brandom\s*\(/g, 'Azar(')
  if (!program.endsWith('\n')) program += '\n'
  writeFileSync(join(out, `${slug}.stepcode`), program, 'utf8')
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

for (const file of readdirSync(v1).filter((name) => name.endsWith('.v1.ts')).sort()) {
  const source = readFileSync(join(v1, file), 'utf8')
  let title = basename(file, '.v1.ts')
  TOKEN.lastIndex = 0
  for (let match = TOKEN.exec(source); match !== null; match = TOKEN.exec(source)) {
    const [, , spokenTitle, literal] = match
    if (spokenTitle !== undefined) {
      title = spokenTitle
      continue
    }
    if (literal === undefined || !LOOKS_LIKE_PROGRAM.test(literal)) continue
    emit(title, literal)
  }
}

const programsDir = join(v1, 'programs')
for (const file of readdirSync(programsDir).filter((name) => name.endsWith('.ts')).sort()) {
  const source = readFileSync(join(programsDir, file), 'utf8')
  const match = /`([^`]*)`/.exec(source)
  if (match?.[1] === undefined || !LOOKS_LIKE_PROGRAM.test(match[1])) continue
  emit(basename(file).replace(/\.(program\.)?ts$/, ''), match[1])
}

writeFileSync(
  join(out, 'index-base-0.txt'),
  `${[...indexBaseZero].sort().join('\n')}\n`,
  'utf8',
)

const written = readdirSync(out).filter((name) => name.endsWith('.stepcode'))
console.log(`${written.length} programs, ${indexBaseZero.length} of them index-base 0`)
```

- [ ] **Step 3: Run the script once and inspect what it produced**

```bash
node packages/language/scripts/extract-corpus.ts
ls packages/language/test/corpus/programs | head -30
cat packages/language/test/corpus/programs/index-base-0.txt
```

Expected: at least 100 `.stepcode` files, `index-base-0.txt` naming the programs that came from `arrays.v1.ts` and `strings.v1.ts`, no file containing `$ arrays@stepcode`, `round(` or `random(`. Verify by hand:

```bash
grep -rl 'arrays@stepcode\|round(\|random(' packages/language/test/corpus/programs || echo clean
```

- [ ] **Step 4: Write the failing test `packages/language/test/corpus/parse.test.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parse } from '../../src/parser/parse'

const dir = fileURLToPath(new URL('./programs', import.meta.url))
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

describe('the v1 conformance corpus', () => {
  it('is not empty', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it('lists the index-base-0 programs it extracted', () => {
    const listed = readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
      .split('\n')
      .filter((line) => line.length > 0)
    expect(listed.length).toBeGreaterThan(0)
    for (const slug of listed) expect(files).toContain(`${slug}.stepcode`)
  })

  for (const file of files) {
    describe(file, () => {
      const source = readFileSync(join(dir, file), 'utf8')
      const result = parse(source, { profile: profiles.pseint })

      it('parses with no errors', () => {
        expect(
          result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error'),
        ).toEqual([])
      })

      it('warns only about empty statements, if at all', () => {
        expect(
          [...new Set(result.diagnostics.map((diagnostic) => diagnostic.code))].filter(
            (code) => code !== 'W2001',
          ),
        ).toEqual([])
      })

      it('is lossless', () => {
        expect(result.tokens.map((token) => token.text).join('')).toBe(source)
      })

      it('has a main block', () => {
        expect(result.program.main).not.toBeNull()
      })

      it('is deterministic', () => {
        const again = parse(source, { profile: profiles.pseint })
        expect(again.diagnostics).toEqual(result.diagnostics)
        expect(again.program).toEqual(result.program)
      })
    })
  }
})
```

- [ ] **Step 5: Run it and fix what it finds**

Run: `pnpm vitest run --project stepcode test/corpus/parse.test.ts`
Expected: green. If a program still reports an error, decide which side is wrong:
- a real grammar gap in this package → fix the parser and add a named unit test for it in the matching `test/parser/*.test.ts` file;
- a v1-only spelling no profile defines → extend the rewrite list in the script, re-run it, and note the rewrite in the script's header comment;
- a genuinely invalid v1 program → delete that `.stepcode` file and say why in the commit message.
Do not weaken the assertions.

- [ ] **Step 6: Write the failing test `packages/language/test/parser/property.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { tokenize } from '../../src/lexer/index'
import { parse } from '../../src/parser/parse'

/** The pieces a StepCode program is made of, plus a few the parser must survive. */
const VOCABULARY = [
  'Proceso',
  'FinProceso',
  'SubProceso',
  'FinSubProceso',
  'Funcion',
  'FinFuncion',
  'Definir',
  'Como',
  'Entero',
  'Si',
  'Entonces',
  'Sino',
  'FinSi',
  'Segun',
  'Hacer',
  'De Otro Modo',
  'FinSegun',
  'Mientras',
  'FinMientras',
  'Repetir',
  'Hasta Que',
  'Para',
  'Hasta',
  'Con Paso',
  'FinPara',
  'Escribir',
  'Leer',
  'Retornar',
  'Romper',
  'a',
  'i',
  '1',
  '2.5',
  '"hola"',
  '<-',
  '=',
  '==',
  '+',
  '*',
  '^',
  'Y',
  'No',
  '(',
  ')',
  '[',
  ']',
  ',',
  ':',
  ';',
  '\n',
  '@',
  '$',
]

const tokenSoup = fc
  .array(fc.constantFrom(...VOCABULARY), { maxLength: 60 })
  .map((parts) => parts.join(' '))

describe('parse is total', () => {
  it('never throws on an arbitrary string', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 400 }), (source) => {
        expect(() => parse(source, { profile: profiles.es })).not.toThrow()
      }),
      { numRuns: 400 },
    )
  })

  it('never throws on an arbitrary unicode string', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString({ maxLength: 200 }), (source) => {
        expect(() => parse(source, { profile: profiles.es })).not.toThrow()
      }),
      { numRuns: 200 },
    )
  })

  it('never throws on an arbitrary token soup, under either option set', () => {
    fc.assert(
      fc.property(tokenSoup, fc.boolean(), (source, strict) => {
        const profile = strict ? profiles.es : profiles.pseint
        expect(() => parse(source, { profile })).not.toThrow()
      }),
      { numRuns: 500 },
    )
  })
})

describe('tokenize is total and lossless', () => {
  it('always rebuilds its input', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 400 }), (source) => {
        const { tokens } = tokenize(source, profiles.es)
        expect(tokens.map((token) => token.text).join('')).toBe(source)
      }),
      { numRuns: 400 },
    )
  })

  it('always ends with exactly one eof token', () => {
    fc.assert(
      fc.property(tokenSoup, (source) => {
        const { tokens } = tokenize(source, profiles.es)
        expect(tokens.filter((token) => token.kind === 'eof')).toHaveLength(1)
        expect(tokens[tokens.length - 1]?.kind).toBe('eof')
      }),
      { numRuns: 200 },
    )
  })
})

describe('parse is deterministic', () => {
  it('returns equal results for the same input', () => {
    fc.assert(
      fc.property(tokenSoup, (source) => {
        const first = parse(source, { profile: profiles.es })
        const second = parse(source, { profile: profiles.es })
        expect(second.diagnostics).toEqual(first.diagnostics)
        expect(second.program).toEqual(first.program)
        expect(second.tokens).toEqual(first.tokens)
      }),
      { numRuns: 300 },
    )
  })
})
```

- [ ] **Step 7: Run the property tests**

Run: `pnpm vitest run --project stepcode test/parser/property.test.ts`
Expected: green. A hang means a parse loop has no progress guarantee — the culprit is a `for(;;)` whose body can consume nothing. Every such loop must either consume a token or break; `parseBlock`'s guard and `skipToRecoveryPoint`'s leading `next()` are the two that exist for this reason. A thrown error means fast-check prints the shrunk counterexample: add it verbatim as a named case in the matching unit test file, then fix it.

- [ ] **Step 8: Run the whole suite, typecheck, lint and commit**

Run: `pnpm vitest run --project stepcode` and `pnpm --filter stepcode typecheck`

```bash
pnpm lint:fix && pnpm lint
git add packages/language pnpm-lock.yaml pnpm-workspace.yaml
git commit -m "test(language): v1 conformance corpus and property tests"
```

---

### Task 10: public API, README, changeset

**Files:**
- Modify: `packages/language/src/index.ts`, `packages/language/test/index.test.ts`
- Create: `packages/language/README.md`, `.changeset/language-syntax.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the package's public surface. `packageName` stays exported — `packages/codemirror/src/index.ts` re-exports it as `languagePackageName` and its test asserts it. The placeholder `export { packageName as profilesPackageName } from '@stepcode/profiles'` goes away, so `packages/language/test/index.test.ts` must be updated in the same step.

- [ ] **Step 1: Update the failing test `packages/language/test/index.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  LineMap,
  packageName,
  parse,
  registerCatalog,
  tokenize,
  walk,
} from '../src/index'

describe('stepcode', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('stepcode')
  })

  it('exports the whole source → tokens → AST pipeline', () => {
    expect(typeof tokenize).toBe('function')
    expect(typeof parse).toBe('function')
    expect(typeof walk).toBe('function')
    expect(typeof formatDiagnostic).toBe('function')
    expect(typeof registerCatalog).toBe('function')
    expect(DIAGNOSTIC_CODES.length).toBeGreaterThan(0)
    expect(DIAGNOSTIC_SEVERITY.W2001).toBe('warning')
    expect(new LineMap('a\nb').lineCount).toBe(2)
  })

  it('parses a program end to end through the public API', () => {
    const result = parse('Proceso saluda\n  Escribir "hola";\nFinProceso', { profile: profiles.es })
    expect(result.diagnostics).toEqual([])
    expect(result.program.main?.name.name).toBe('saluda')
    const kinds: string[] = []
    walk(result.program, { enter: (node) => void kinds.push(node.kind) })
    expect(kinds).toContain('WriteStmt')
  })

  it('formats a diagnostic in both locales from the same data', () => {
    const result = parse('Proceso p\n  Si a Entonces\nFinProceso', { profile: profiles.es })
    const diagnostic = result.diagnostics[0]
    expect(diagnostic?.code).toBe('E2003')
    expect(formatDiagnostic(diagnostic!, 'es', profiles.es)).toContain('FinSi')
    expect(formatDiagnostic(diagnostic!, 'en', profiles.en)).toContain('EndIf')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/index.test.ts`
Expected: FAIL — `../src/index` exports neither `parse` nor the rest.

- [ ] **Step 3: Replace `packages/language/src/index.ts`**

```ts
export const packageName = 'stepcode'

export type {
  AssignStmt,
  Binary,
  BinaryOp,
  BreakStmt,
  BuiltinCall,
  Call,
  CallStmt,
  ClearStmt,
  ConstantStmt,
  ContinueStmt,
  DefineStmt,
  DimensionItem,
  DimensionStmt,
  ErrorExpr,
  ErrorStmt,
  Expr,
  ForStmt,
  Identifier,
  IfBranch,
  IfStmt,
  Index,
  Literal,
  LiteralType,
  MainBlock,
  Node,
  Param,
  Program,
  ReadStmt,
  RepeatStmt,
  ReturnStmt,
  Stmt,
  SubprogramDecl,
  SwitchCase,
  SwitchStmt,
  TokenRange,
  TypeRef,
  Unary,
  UnaryOp,
  Visitor,
  WaitKeyStmt,
  WaitStmt,
  WhileStmt,
  WriteStmt,
} from './ast/index'
export { childrenOf, walk } from './ast/index'
export type {
  Catalog,
  Diagnostic,
  DiagnosticCode,
  DiagnosticData,
  RelatedSpan,
  Severity,
} from './diagnostics/index'
export {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  registerCatalog,
} from './diagnostics/index'
export type { Token, TokenizeResult, TokenKind } from './lexer/index'
export { isTrivia, symbolicKeywords, tokenize } from './lexer/index'
export type { ParseResult } from './parser/index'
export { parse } from './parser/index'
export type { Position, Span } from './source/index'
export { LineMap } from './source/index'
```

- [ ] **Step 4: Write `packages/language/README.md`**

````markdown
# stepcode

The StepCode language: a PSeInt-compatible pseudocode that speaks whatever words a profile
gives it. This package covers the front end — source to tokens to AST, with diagnostics.
The checker, the interpreter and `compile()` arrive in later releases.

```ts
import { parse, formatDiagnostic, walk } from 'stepcode'
import { profiles } from '@stepcode/profiles'

const { program, tokens, diagnostics } = parse(
  'Proceso saluda\n  Escribir "hola";\nFinProceso',
  { profile: profiles.es },
)

for (const diagnostic of diagnostics) {
  console.log(diagnostic.code, formatDiagnostic(diagnostic, 'es', profiles.es))
}

walk(program, { enter: (node) => void console.log(node.kind) })
```

## What it guarantees

- **It never throws.** Any input returns a `Program`; broken regions become `ErrorStmt` and
  `ErrorExpr` nodes with real spans, so an editor always has a tree to work with.
- **Diagnostics are data**: `{ code, severity, span, data, related? }`. Message text lives in
  locale catalogs and is produced by `formatDiagnostic(diagnostic, locale, profile)`, which
  fills the active profile's own spellings into the message. Locales fall back
  `pt-BR → pt → en`; `registerCatalog(locale, catalog)` adds or overrides one.
- **The token stream is lossless**: `tokens.map((t) => t.text).join('') === source`, trivia
  and all, so formatters and editors can round-trip it.
- **It is deterministic**: the same `(source, profile)` always gives the same tokens, AST and
  diagnostics.
- **Every option comes from the profile** — `requireSemicolons`, `assignWithEquals`,
  `typedParameters`, `caseSensitive`. `parse` takes no options of its own.

## API

| Export | What it does |
| --- | --- |
| `parse(source, { profile })` | `{ program, tokens, diagnostics }` |
| `tokenize(source, profile)` | `{ tokens, diagnostics }` |
| `walk(node, visitor)` | depth-first traversal; `enter` returning `false` skips children |
| `childrenOf(node)` | one node's children in source order |
| `formatDiagnostic(d, locale, profile)` | the rendered message |
| `registerCatalog(locale, catalog)` | add or override a locale's templates |
| `LineMap` | offset ↔ 1-based line/column |
| `DIAGNOSTIC_CODES`, `DIAGNOSTIC_SEVERITY` | the catalogue and its fixed severities |

Diagnostic ranges: `E1xxx` lexer, `E2001`–`E2019` statements, `E2020`–`E2029` declarations and
headers, `E2030`–`E2039` expressions, `W2xxx` warnings.

See `docs/superpowers/specs/2026-09-03-language-syntax-design.md` for the full grammar,
precedence table and recovery rules.
````

- [ ] **Step 5: Write `.changeset/language-syntax.md`**

`minor`, not `major`: the 2.0.0 release is claimed later, once the checker and the interpreter land.

```markdown
---
'stepcode': minor
---

Lexer, parser and AST: profile-driven tokenizer with multi-word longest match, Pratt
expression parser, the full statement grammar, error recovery that keeps the tree intact, and
data-only diagnostics with Spanish and English catalogs.
```

- [ ] **Step 6: Run the whole workspace**

```bash
pnpm lint:fix && pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm changeset status
node -e "import('./packages/language/dist/index.js').then(async (m) => { const { profiles } = await import('@stepcode/profiles'); console.log(m.parse('Proceso p\nEscribir 1;\nFinProceso', { profile: profiles.es }).diagnostics) })"
```

Expected: lint exits 0; typecheck silent across all five packages; every test green, including
the other packages' `packageName` tests (`packages/codemirror` re-exports `stepcode`'s
`packageName`, which is still there); the build emits `dist/index.js` and `dist/index.d.ts`;
`changeset status` lists `stepcode` as minor; the node one-liner prints `[]`.

- [ ] **Step 7: Commit**

```bash
git add packages/language .changeset
git commit -m "docs(language): public API, README and changeset"
```

---

## Verification checklist

Run from the repo root when every task is done:

- [ ] `pnpm lint` exits 0.
- [ ] `pnpm typecheck` is silent for all packages.
- [ ] `pnpm test` is green; `pnpm vitest run --project stepcode` alone is green.
- [ ] `pnpm build` succeeds for all packages.
- [ ] Every code in `DIAGNOSTIC_CODES` has a named case in `test/parser/diagnostics.test.ts`
      (the suite asserts this itself).
- [ ] Every `.stepcode` corpus file parses with zero error-severity diagnostics under
      `profiles.pseint` and is lossless.
- [ ] `grep -rn 'TODO\|FIXME' packages/language/src` finds nothing.
