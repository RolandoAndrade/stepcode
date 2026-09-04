# `stepcode` language sub-spec B — checker and diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `check(program, { profile })` and `compile(source, { profile })` inside `packages/language` (npm `stepcode`): scopes and symbols, the type model, assignability, the operator and builtin tables, constant folding, per-statement rules, flow warnings, the E3xxx/W3xxx diagnostics in Spanish and English, and the side tables (`types`, `symbols`, `calls`, `scopes`) that the interpreter and the editor read instead of re-deriving anything.

**Architecture:** Two directories under `src/`. `types/` is pure data and pure functions over `Type` — no AST walking, no diagnostics, no profile state: assignability, one operator table, one builtin table, one constant folder. `checker/` walks the AST once per body over a mutable `CheckerState` (scopes, side tables, diagnostic list, current frame) and never throws: every unresolved or already-flagged node is typed `unknown`, and `unknown` absorbs everything so one mistake yields one diagnostic. The driver runs two phases — collect every signature, then check main and check each body on demand from its first call, memoized — so an untyped parameter is fixed by the first checked call site.

**Tech Stack:** TypeScript 7 (strict, ESM), Vitest 4.1, tsdown 0.22, Biome 2.5, `@stepcode/profiles` (workspace), `fast-check` 4 (already a devDependency).

**Spec:** `docs/superpowers/specs/2026-09-04-language-checker-design.md` (all sections). Previous: `docs/superpowers/specs/2026-09-03-language-syntax-design.md` (lexer, parser, AST — already implemented, and implemented by `docs/superpowers/plans/2026-09-03-language-syntax.md`). Parent: `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` §2, §3.3, §3.4, §6, §7 item 3.

## Global Constraints

These are the spec's binding rules. They hold in every task; do not weaken them.

- **TypeScript strict**, with the flags already in `tsconfig.base.json`: `noUncheckedIndexedAccess` (every index access is `T | undefined`), **`exactOptionalPropertyTypes`** (never assign `undefined` to an optional property — build the object with the key omitted), `verbatimModuleSyntax` (`import type` for types), `noFallthroughCasesInSwitch`, `isolatedModules`. Imports are extensionless (`./type`, `../ast/index`).
- **ESM only**, `"type": "module"`. **No runtime dependencies** beyond `@stepcode/profiles` (a workspace package). Nothing is added to `dependencies` in this sub-spec.
- **Biome lint** (`biome.json`, 2-space indent, single quotes, no semicolons, trailing commas, line width 100). Run `pnpm lint:fix` before every commit; `pnpm lint` must exit 0.
- **vitest** for every test; **pnpm** for every command. Commands run from the repo root.
- **Test-driven**: every step writes the failing test first, runs it to see it fail, then implements, then runs it green. **One commit per task**, conventional-commit message, no attribution trailers, no pushing.
- **The checker never throws** on any input, however broken the tree. `check` always returns a `CheckResult`.
- **Codes and severity are an exhaustive tuple.** `DIAGNOSTIC_CODES` is a `const` tuple and `DIAGNOSTIC_SEVERITY` is `Readonly<Record<DiagnosticCode, Severity>>`, so a code without a severity fails typecheck. Severity is fixed per code and never varies with context.
- **Catalogs are exhaustive in `es` and `en`.** `Catalog.templates` is `Readonly<Record<DiagnosticCode, string>>`; a missing entry fails typecheck. Every variant added in one catalog is added in the other.
- **Diagnostics are sorted.** `check` returns them sorted by `span.start`, then severity (`error` before `warning`), then code. `compile` concatenates parser diagnostics first and checker diagnostics second and sorts the same way, so parser diagnostics win ties. Two diagnostics with the same code and the same span collapse to one.
- **One mistake, one diagnostic.** `unknown` absorbs: it is assignable to and from everything, every operator accepts it and yields `unknown`, and nothing is ever reported about an `unknown` operand. Any expression that already produced a diagnostic types `unknown`, so the mistake is never reported twice on the way up the tree.
- **The unknown-type rule, restated for recovery:** `ErrorExpr`, `ErrorStmt` and `Identifier.missing` nodes are typed `unknown` and produce no diagnostic at all — the parser already flagged them.
- **The corpus must check clean under the default profile.** Every program in `packages/language/test/corpus/programs/*.stepcode` produces zero error-severity checker diagnostics under `profiles.es` (the slugs in `index-base-0.txt` under an `es`-derived profile with `indexBase: 0`). Programs that relied on `pseint` leniency are rewritten minimally and each rewrite is recorded in `test/corpus/programs/README.md`.
- **Diagnostics are data.** No human text is ever stored in a `Diagnostic`. Types reach the catalogs pre-rendered: `data.expected` and `data.found` are strings produced by `typeToString(type, profile)` / `expectedToString(expected, profile)` before the diagnostic is created, so a catalog never sees a `Type` object.
- **Never call `profile.normalize` on an identifier** for naming purposes. `Identifier.name` is already canonical (the lexer lowercased it unless `caseSensitive`). `normalize` is used only inside `suggest.ts`, for fuzzy matching, never to derive a symbol's key.
- **Determinism**: the same `(program, profile)` produces identical diagnostics in identical order. Never iterate a `Map` whose insertion order is not source order; `Scope.order` exists for exactly that reason.
- `packages/language/test/helpers.ts` grows in Task 1 and is reused verbatim afterwards. Later tasks add nothing to it unless the task says so; merge new imports into the existing import block and let `pnpm lint:fix` sort them.

## File Structure

Everything below `packages/language/`.

```
src/
  types/
    type.ts          Type, ConstValue, OperandClass, the type singletons, sameType,
                     typeToString / classToString / expectedToString   (Task 1)
    assign.ts        assignable(), assignFailure() and the hint chooser (§4.2) (Task 2)
    operators.ts     BINARY_TABLE / UNARY_TABLE, checkBinary, checkUnary,
                     comparable, operatorSpelling (§4.3, §4.4)          (Task 2)
    fold.ts          fold(expr, constants) → ConstValue | undefined (§4.6) (Task 2)
    builtins.ts      BUILTIN_SIGNATURES, builtinResult (§6)              (Task 3)
  checker/
    scope.ts         Scope, Symbol, createScope, declare, lookup (§3)     (Task 4)
    result.ts        CheckResult, CheckerState, report, setType,
                     reportAssignFailure                                  (Task 4)
    suggest.ts       suggestName, damerauLevenshtein (§3.2)               (Task 4)
    expressions.ts   typeOf, resolveIdentifier, calls, indexing (§4.5, §5.11) (Task 5)
    driver.ts        check(): phase one, phase two, ensureChecked (§8, §5.12) (Task 6)
    statements.ts    per-statement rules (§5)                    (Tasks 6, 7, 8)
    flow.ts          W3001–W3004 (§9)                                      (Task 9)
    index.ts         barrel                                                (Task 6)
  compile.ts         parse + check (§2)                                    (Task 10)
  diagnostics/
    codes.ts         + E3001–E3037, W3001–W3004                            (Task 1)
    catalog/es.ts    + every new template and variant                      (Task 1)
    catalog/en.ts    + every new template and variant                      (Task 1)
    format.ts        + the `{builtin:…}` slot section                      (Task 1)
    sort.ts          sortDiagnostics (§7.2)                                (Task 10)
    index.ts         + sortDiagnostics                                     (Task 10)
  parser/
    declarations.ts  expectIdentifier gains the E2002 `builtin` variant    (Task 1)
  index.ts           + check, compile, Type, Symbol, Scope, the tables     (Task 10)
test/
  helpers.ts                    + checkSource, checkCodes, typeOfExpr, spanOf (Task 1)
  types/type.test.ts            §4.1 and typeToString                      (Task 1)
  types/assign.test.ts          one test per row of §4.2                   (Task 2)
  types/operators.test.ts       one test per row of §4.3 and §4.4          (Task 2)
  types/fold.test.ts            §4.6                                       (Task 2)
  types/builtins.test.ts        one test per row of §6                     (Task 3)
  checker/scope.test.ts         §3.1, §3.2 declaration and lookup          (Task 4)
  checker/suggest.test.ts       Damerau-Levenshtein and the near-miss rule (Task 4)
  checker/expressions.test.ts   §4.5, §5.11, the E3001/E3012/E303x codes   (Task 5)
  checker/driver.test.ts        §8 phases, memoization, §5.12 inference    (Task 6)
  checker/declarations.test.ts  §5.1–§5.6                                  (Tasks 6, 7)
  checker/control.test.ts       §5.7–§5.10, §5.13                          (Task 8)
  checker/flow.test.ts          §9                                         (Task 9)
  checker/by-code.test.ts       one case per E3xxx/W3xxx, both locales     (Task 11)
  checker/one-mistake.test.ts   the mutation property test (§10)           (Task 11)
  checker/side-tables.test.ts   the side-table invariant over the corpus   (Task 11)
  corpus/check.test.ts          every corpus program checks clean          (Task 11)
  corpus/programs/README.md     + the checker rewrites                     (Task 11)
  index.test.ts                 + check/compile through the public API     (Task 10)
README.md                       + the checker section                      (Task 12)
.changeset/language-checker.md  the changeset                              (Task 12)
```

**Parallelism map.** Task 1 is the foundation and runs alone. Tasks 2, 3 and 4 touch disjoint files and may run in parallel. Task 5 needs all three. Task 6 needs Task 5. Tasks 7, 8 and 9 all touch `checker/statements.ts` or its write-counting and must run in that order. Task 10 touches only `compile.ts`, `diagnostics/sort.ts`, `diagnostics/index.ts`, `src/index.ts` and `test/index.test.ts`, so it may run in parallel with Tasks 7–9. Task 11 needs everything. Task 12 is last.

---

### Task 1: the type model, the diagnostic codes, the catalogs, the `{builtin:…}` slot and the test helper

**Files:**
- Create: `packages/language/src/types/type.ts`
- Modify: `packages/language/src/diagnostics/codes.ts`
- Modify: `packages/language/src/diagnostics/format.ts`
- Modify: `packages/language/src/diagnostics/catalog/es.ts`
- Modify: `packages/language/src/diagnostics/catalog/en.ts`
- Modify: `packages/language/src/parser/declarations.ts` (`expectIdentifier`)
- Modify: `packages/language/test/helpers.ts`
- Modify: `packages/language/test/diagnostics/format.test.ts` (the code list and the slot bag)
- Modify: `packages/language/test/parser/diagnostics.test.ts` (one new case for `E2002.builtin`)
- Test: `packages/language/test/types/type.test.ts`

**Interfaces:**
- Consumes: `TypeKey`, `ResolvedProfile` from `@stepcode/profiles`; `DiagnosticCode`, `createDiagnostic`, `formatDiagnostic` from `../diagnostics/index`; `parse` from `../parser/parse`.
- Produces:
  - `type Type = ScalarType | ArrayType | UnknownType` with
    `interface ScalarType { readonly kind: 'scalar'; readonly name: TypeKey }`,
    `interface ArrayType { readonly kind: 'array'; readonly element: TypeKey; readonly rank: number }`,
    `interface UnknownType { readonly kind: 'unknown' }`
  - `interface ConstValue { readonly type: TypeKey; readonly value: number | string | boolean }`
  - `type OperandClass = 'numeric' | 'text' | 'boolean' | 'integer' | 'scalar'`
  - `type Expected = OperandClass | Type`
  - `const UNKNOWN: UnknownType`, `INTEGER`, `REAL`, `STRING`, `CHAR`, `BOOLEAN: ScalarType`
  - `function scalar(name: TypeKey): ScalarType`
  - `function arrayOf(element: TypeKey, rank: number): ArrayType`
  - `function isUnknown(type: Type): type is UnknownType`
  - `function isScalar(type: Type): type is ScalarType`
  - `function isArray(type: Type): type is ArrayType`
  - `function isNumeric(type: Type): boolean`
  - `function isText(type: Type): boolean`
  - `function sameType(left: Type, right: Type): boolean`
  - `function constType(value: ConstValue): ScalarType`
  - `function typeToString(type: Type, profile: ResolvedProfile): string`
  - `function classToString(operand: OperandClass, profile: ResolvedProfile): string`
  - `function expectedToString(expected: Expected, profile: ResolvedProfile): string`
  - `DIAGNOSTIC_CODES` gains `'E3001' … 'E3037'`, `'W3001' … 'W3004'`; `DIAGNOSTIC_SEVERITY` gains their severities.
  - `formatDiagnostic` resolves `{builtin:key}` and `{builtin:$slot}` through `profile.builtins`.
  - Test helpers: `checkSource(source, profileName?)`, `checkCodes(source, profileName?)`, `spanOf(source, snippet)`, `typeOfExpr(source, snippet, profileName?)`, `profileNamed(name)`.

- [ ] **Step 1: Write the failing test `packages/language/test/types/type.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  arrayOf,
  BOOLEAN,
  CHAR,
  classToString,
  constType,
  expectedToString,
  INTEGER,
  isArray,
  isNumeric,
  isScalar,
  isText,
  isUnknown,
  REAL,
  sameType,
  scalar,
  STRING,
  typeToString,
  UNKNOWN,
} from '../../src/types/type'

describe('the type model', () => {
  it('names the five scalars and the array and unknown shapes', () => {
    expect(INTEGER).toEqual({ kind: 'scalar', name: 'integer' })
    expect(REAL).toEqual({ kind: 'scalar', name: 'real' })
    expect(STRING).toEqual({ kind: 'scalar', name: 'string' })
    expect(CHAR).toEqual({ kind: 'scalar', name: 'char' })
    expect(BOOLEAN).toEqual({ kind: 'scalar', name: 'boolean' })
    expect(UNKNOWN).toEqual({ kind: 'unknown' })
    expect(arrayOf('integer', 2)).toEqual({ kind: 'array', element: 'integer', rank: 2 })
  })

  it('hands back one frozen singleton per scalar', () => {
    expect(scalar('integer')).toBe(INTEGER)
    expect(scalar('char')).toBe(CHAR)
    expect(Object.isFrozen(INTEGER)).toBe(true)
    expect(Object.isFrozen(UNKNOWN)).toBe(true)
  })

  it('classifies shapes', () => {
    expect(isScalar(INTEGER)).toBe(true)
    expect(isScalar(arrayOf('integer', 1))).toBe(false)
    expect(isArray(arrayOf('integer', 1))).toBe(true)
    expect(isUnknown(UNKNOWN)).toBe(true)
    expect(isUnknown(INTEGER)).toBe(false)
  })

  it('classifies numeric and text scalars, and nothing else', () => {
    expect(isNumeric(INTEGER)).toBe(true)
    expect(isNumeric(REAL)).toBe(true)
    expect(isNumeric(BOOLEAN)).toBe(false)
    expect(isNumeric(UNKNOWN)).toBe(false)
    expect(isNumeric(arrayOf('integer', 1))).toBe(false)
    expect(isText(STRING)).toBe(true)
    expect(isText(CHAR)).toBe(true)
    expect(isText(INTEGER)).toBe(false)
    expect(isText(arrayOf('string', 1))).toBe(false)
  })

  it('compares types structurally, and unknown is only ever the same as unknown', () => {
    expect(sameType(INTEGER, scalar('integer'))).toBe(true)
    expect(sameType(INTEGER, REAL)).toBe(false)
    expect(sameType(arrayOf('integer', 2), arrayOf('integer', 2))).toBe(true)
    expect(sameType(arrayOf('integer', 2), arrayOf('integer', 1))).toBe(false)
    expect(sameType(arrayOf('integer', 1), arrayOf('real', 1))).toBe(false)
    expect(sameType(UNKNOWN, UNKNOWN)).toBe(true)
    expect(sameType(UNKNOWN, INTEGER)).toBe(false)
  })

  it('derives a scalar type from a folded constant', () => {
    expect(constType({ type: 'real', value: 2 })).toBe(REAL)
    expect(constType({ type: 'string', value: 'ab' })).toBe(STRING)
  })

  it('renders types through the profile first spelling', () => {
    expect(typeToString(INTEGER, profiles.es)).toBe('Entero')
    expect(typeToString(INTEGER, profiles.en)).toBe('Integer')
    expect(typeToString(CHAR, profiles.es)).toBe('Caracter')
    expect(typeToString(arrayOf('integer', 1), profiles.es)).toBe('Entero[]')
    expect(typeToString(arrayOf('integer', 2), profiles.es)).toBe('Entero[,]')
    expect(typeToString(arrayOf('real', 3), profiles.en)).toBe('Real[,,]')
    expect(typeToString(UNKNOWN, profiles.es)).toBe('?')
  })

  it('renders operand classes as the profile spellings they accept', () => {
    expect(classToString('numeric', profiles.es)).toBe('Entero/Real')
    expect(classToString('text', profiles.es)).toBe('Cadena/Caracter')
    expect(classToString('integer', profiles.es)).toBe('Entero')
    expect(classToString('boolean', profiles.es)).toBe('Logico')
    expect(classToString('scalar', profiles.es)).toBe('Entero/Real/Cadena/Caracter/Logico')
  })

  it('renders an expectation, whichever of the two shapes it is', () => {
    expect(expectedToString('numeric', profiles.es)).toBe('Entero/Real')
    expect(expectedToString(CHAR, profiles.es)).toBe('Caracter')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/types/type.test.ts`
Expected: FAIL — cannot resolve `../../src/types/type`.

- [ ] **Step 3: Write `packages/language/src/types/type.ts`**

```ts
import type { ResolvedProfile, TypeKey } from '@stepcode/profiles'

/** One of the five built-in scalars. Sizes and ranks never appear here. */
export interface ScalarType {
  readonly kind: 'scalar'
  readonly name: TypeKey
}

/** An array of scalars. `rank` is the number of dimensions; sizes are a runtime matter. */
export interface ArrayType {
  readonly kind: 'array'
  readonly element: TypeKey
  readonly rank: number
}

/**
 * The absorbing type. It is assignable to and from everything, every operator accepts it and
 * yields it, and nothing is ever reported about it — which is how one mistake stays one
 * diagnostic: whatever produced the first error types `unknown` on the way up.
 */
export interface UnknownType {
  readonly kind: 'unknown'
}

export type Type = ScalarType | ArrayType | UnknownType

/** A value the folder produced: literal, constant, or an operation over folded operands. */
export interface ConstValue {
  readonly type: TypeKey
  readonly value: number | string | boolean
}

/**
 * What an operator or a builtin parameter accepts. `scalar` is "any of the five", used by
 * `toText` and by `Escribir`.
 */
export type OperandClass = 'numeric' | 'text' | 'boolean' | 'integer' | 'scalar'

/** An expectation is either a class of types or one exact type. Both render to text. */
export type Expected = OperandClass | Type

export const UNKNOWN: UnknownType = Object.freeze({ kind: 'unknown' })
export const INTEGER: ScalarType = Object.freeze({ kind: 'scalar', name: 'integer' })
export const REAL: ScalarType = Object.freeze({ kind: 'scalar', name: 'real' })
export const STRING: ScalarType = Object.freeze({ kind: 'scalar', name: 'string' })
export const CHAR: ScalarType = Object.freeze({ kind: 'scalar', name: 'char' })
export const BOOLEAN: ScalarType = Object.freeze({ kind: 'scalar', name: 'boolean' })

const SCALARS: Readonly<Record<TypeKey, ScalarType>> = Object.freeze({
  integer: INTEGER,
  real: REAL,
  string: STRING,
  char: CHAR,
  boolean: BOOLEAN,
})

/** The scalar singleton for a key: types are compared with `===` all over the checker. */
export function scalar(name: TypeKey): ScalarType {
  return SCALARS[name]
}

export function arrayOf(element: TypeKey, rank: number): ArrayType {
  return { kind: 'array', element, rank }
}

export function isUnknown(type: Type): type is UnknownType {
  return type.kind === 'unknown'
}

export function isScalar(type: Type): type is ScalarType {
  return type.kind === 'scalar'
}

export function isArray(type: Type): type is ArrayType {
  return type.kind === 'array'
}

export function isNumeric(type: Type): boolean {
  return type.kind === 'scalar' && (type.name === 'integer' || type.name === 'real')
}

export function isText(type: Type): boolean {
  return type.kind === 'scalar' && (type.name === 'string' || type.name === 'char')
}

export function sameType(left: Type, right: Type): boolean {
  if (left.kind !== right.kind) return false
  if (left.kind === 'scalar') return left.name === (right as ScalarType).name
  if (left.kind === 'array') {
    const other = right as ArrayType
    return left.element === other.element && left.rank === other.rank
  }
  return true
}

export function constType(value: ConstValue): ScalarType {
  return scalar(value.type)
}

/** The profile's first spelling of a type key, or the key itself when it has none. */
function spellingOf(name: TypeKey, profile: ResolvedProfile): string {
  return profile.types[name]?.[0] ?? name
}

/**
 * `Entero`, `Entero[]`, `Entero[,]` — the shape spec §4.1 asks messages to use. `unknown`
 * renders as `?`; it should never reach a message, since nothing is reported about it, but a
 * total function is one fewer way to print `undefined` at a user.
 */
export function typeToString(type: Type, profile: ResolvedProfile): string {
  if (type.kind === 'unknown') return '?'
  if (type.kind === 'scalar') return spellingOf(type.name, profile)
  return `${spellingOf(type.element, profile)}[${','.repeat(Math.max(0, type.rank - 1))}]`
}

const CLASS_MEMBERS: Readonly<Record<OperandClass, readonly TypeKey[]>> = Object.freeze({
  numeric: ['integer', 'real'],
  text: ['string', 'char'],
  boolean: ['boolean'],
  integer: ['integer'],
  scalar: ['integer', 'real', 'string', 'char', 'boolean'],
})

/**
 * `Entero/Real` — the members of a class, in the profile's own words, joined by a slash. A
 * slash needs no translation, which is why the class is not spelled out in prose here: the
 * catalogs receive the rendered list as one plain `{expected}` slot.
 */
export function classToString(operand: OperandClass, profile: ResolvedProfile): string {
  return CLASS_MEMBERS[operand].map((name) => spellingOf(name, profile)).join('/')
}

export function expectedToString(expected: Expected, profile: ResolvedProfile): string {
  return typeof expected === 'string'
    ? classToString(expected, profile)
    : typeToString(expected, profile)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/types/type.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the failing catalogue test — extend `packages/language/test/diagnostics/format.test.ts`**

Replace the `DIAGNOSTIC_CODES` list in the first test with the full list (parser codes unchanged, checker codes appended):

```ts
  it('lists every code of the spec, lexer first then parser then checker', () => {
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
    ])
  })
```

Replace the data bag of the "leaves no unresolved slot" test so it covers every new slot, and
extend it to walk the variants too:

```ts
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
          createDiagnostic(code as (typeof DIAGNOSTIC_CODES)[number], { start: 0, end: 1 }, {
            ...SLOT_BAG,
            hint,
          }),
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
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/diagnostics/format.test.ts`
Expected: FAIL — the code list does not match and `E3013` has no template.

- [ ] **Step 7: Add the codes to `packages/language/src/diagnostics/codes.ts`**

Append inside `DIAGNOSTIC_CODES`, after `'W2001'`:

```ts
  'E3001', // name not declared
  'E3002', // already declared
  'E3003', // used before its declaration
  'E3004', // variable named like a subprogram
  'E3005', // subprogram used as a variable
  'E3006', // not a subprogram
  'E3007', // constant is read-only
  'E3008', // counter is read-only inside its loop
  'E3009', // array where a scalar is needed, or scalar indexed
  'E3010', // cannot assign
  'E3011', // literal too long for a character
  'E3012', // operator operand mismatch
  'E3013', // cannot assign into a text by index
  'E3014', // condition is not logical
  'E3015', // cannot infer the type
  'E3016', // index count mismatch
  'E3017', // index is not an integer
  'E3020', // procedure used as a value
  'E3021', // dimension of an undeclared name
  'E3022', // cannot dimension
  'E3023', // array size is not a positive integer constant
  'E3024', // constant value is not constant
  'E3025', // division by zero
  'E3026', // counter must be an integer
  'E3027', // step is zero
  'E3028', // selector type cannot be switched on
  'E3029', // case label is not constant
  'E3030', // duplicate case label
  'E3031', // break or continue outside a loop
  'E3032', // by-reference argument must be a variable
  'E3033', // return value outside a function
  'E3034', // wrong number of arguments
  'E3035', // argument type mismatch
  'E3036', // wrong number of arguments to a builtin
  'E3037', // builtin argument type mismatch
  'W3001', // unreachable code
  'W3002', // declared but never read
  'W3003', // read but never assigned
  'W3004', // function result never assigned
```

and append to `DIAGNOSTIC_SEVERITY`:

```ts
  E3001: 'error',
  E3002: 'error',
  E3003: 'error',
  E3004: 'error',
  E3005: 'error',
  E3006: 'error',
  E3007: 'error',
  E3008: 'error',
  E3009: 'error',
  E3010: 'error',
  E3011: 'error',
  E3012: 'error',
  E3013: 'error',
  E3014: 'error',
  E3015: 'error',
  E3016: 'error',
  E3017: 'error',
  E3020: 'error',
  E3021: 'error',
  E3022: 'error',
  E3023: 'error',
  E3024: 'error',
  E3025: 'error',
  E3026: 'error',
  E3027: 'error',
  E3028: 'error',
  E3029: 'error',
  E3030: 'error',
  E3031: 'error',
  E3032: 'error',
  E3033: 'error',
  E3034: 'error',
  E3035: 'error',
  E3036: 'error',
  E3037: 'error',
  W3001: 'warning',
  W3002: 'warning',
  W3003: 'warning',
  W3004: 'warning',
```

Also update the doc comment above `DIAGNOSTIC_CODES`: `E3xxx` is now the checker, not "a later sub-spec".

- [ ] **Step 8: Add the `builtin` slot section to `packages/language/src/diagnostics/format.ts`**

Three edits. The section union and its set:

```ts
/** The sections a `{kw:…}`-style slot can name. `fn` and `builtin` are the same table. */
type Section = 'kw' | 'type' | 'op' | 'fn' | 'builtin'

const SECTIONS: ReadonlySet<string> = new Set<Section>(['kw', 'type', 'op', 'fn', 'builtin'])
```

the lookup:

```ts
function spellingOf(profile: ResolvedProfile, section: Section, key: string): string {
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
```

and the slot pattern:

```ts
const SLOT = /\{(kw|type|op|fn|builtin):(\$?[A-Za-z][A-Za-z0-9]*)\}|\{([A-Za-z][A-Za-z0-9]*)\}/g
```

- [ ] **Step 9: Add every template and variant to `packages/language/src/diagnostics/catalog/es.ts`**

Append to `templates`:

```ts
  E3001: '«{name}» no está declarada.',
  E3002: '«{name}» ya está declarada en este bloque.',
  E3003: '«{name}» se usa aquí, antes de declararse más abajo: mueve la declaración arriba.',
  E3004: 'Ya hay un subprograma llamado «{name}»: usa otro nombre para la variable.',
  E3005: '«{name}» es un subprograma, no una variable.',
  E3006: '«{name}» no es un subprograma: no se puede llamar.',
  E3007: '«{name}» es una constante: su valor no se puede cambiar.',
  E3008: '«{name}» es el contador de este bucle: no se puede cambiar dentro del bucle.',
  E3009: '«{name}» es un arreglo completo, y aquí hace falta un valor.',
  E3010: 'No se puede guardar un {found} donde se espera un {expected}.',
  E3011: 'Un {type:char} guarda una sola letra, y este texto tiene {length}.',
  E3012: '«{op}» no puede operar con {found}: aquí espera {expected}.',
  E3013:
    'No se puede cambiar una letra suelta de un texto; arma el texto nuevo con «{builtin:substring}» y «{builtin:concat}».',
  E3014: 'La condición tiene que ser {type:boolean}, y esta es {found}.',
  E3015: 'No puedo deducir el tipo de «{name}».',
  E3016: 'Este arreglo necesita {expected} índices y le diste {found}.',
  E3017: 'Un índice tiene que ser {type:integer}, y este es {found}.',
  E3020: '«{name}» es un subprograma sin valor de retorno: no se puede usar como valor.',
  E3021: '«{name}» no está declarada: declárala antes de dimensionarla.',
  E3022: '«{name}» no se puede dimensionar.',
  E3023: 'El tamaño de un arreglo tiene que ser un número entero positivo conocido de antemano.',
  E3024: 'El valor de la constante «{name}» tiene que poder calcularse antes de ejecutar.',
  E3025: 'Esto divide entre cero: «{op}» necesita un divisor distinto de 0.',
  E3026: 'El contador «{name}» tiene que ser {type:integer}, y es {found}.',
  E3027: 'El paso no puede ser 0: el bucle nunca terminaría.',
  E3028: 'No se puede elegir según un valor {found}: usa {type:integer}, {type:char} o {type:string}.',
  E3029: 'Este valor tiene que poder calcularse antes de ejecutar.',
  E3030: 'El valor {value} ya aparece en otra opción de este «{kw:switch}».',
  E3031: '«{kw:$kw}» solo puede usarse dentro de un bucle.',
  E3032:
    'El parámetro «{param}» es {kw:byRef}: aquí hay que pasar una variable, no un valor calculado.',
  E3033: 'Solo una {kw:function} puede devolver un valor.',
  E3034: '«{name}» necesita {expected} argumentos y le diste {found}.',
  E3035: 'El argumento {position} de «{name}» es {found} y se espera {expected}.',
  E3036: '«{builtin:$builtin}» necesita {expected} argumentos y le diste {found}.',
  E3037: 'El argumento {position} de «{builtin:$builtin}» es {found} y se espera {expected}.',
  W3001: 'Este código nunca se ejecuta.',
  W3002: '«{name}» se declara pero nunca se lee.',
  W3003: '«{name}» se lee pero nunca recibe un valor.',
  W3004: '«{name}» nunca recibe un valor: la función no devuelve nada.',
```

Append to `variants`:

```ts
  'E2002.builtin':
    'No esperaba «{found}» aquí: «{builtin:$builtin}» es una función del lenguaje, elige otro nombre.',
  'E3001.suggest': '«{name}» no está declarada. ¿Querías decir «{suggestion}»?',
  'E3001.declare': '«{name}» no está declarada: declárala con «{kw:define}» antes de usarla.',
  'E3002.result':
    '«{name}» ya es el resultado de esta función: quita este «{kw:define}», la cabecera ya la declara.',
  'E3002.parameter': '«{name}» ya es un parámetro de este subprograma.',
  'E3009.array': '«{name}» es un arreglo completo, y aquí hace falta un valor.',
  'E3009.scalar': '«{name}» no es un arreglo: no se puede indexar.',
  'E3010.trunc':
    'No se puede guardar un {found} donde se espera un {expected}: usa «{builtin:trunc}» o «{builtin:round}».',
  'E3010.div':
    'No se puede guardar un {found} donde se espera un {expected}: «{kw:div}» da la división entera.',
  'E3010.index':
    'No se puede guardar un {found} donde se espera un {expected}: toma una letra con «texto[i]».',
  'E3010.toNumber':
    'No se puede guardar un {found} donde se espera un {expected}: conviértelo con «{builtin:toNumber}».',
  'E3010.toText':
    'No se puede guardar un {found} donde se espera un {expected}: conviértelo con «{builtin:toText}».',
  'E3010.rank': 'Este arreglo es {found} y se espera {expected}: no coincide el número de dimensiones.',
  'E3010.element': 'Este arreglo es {found} y se espera {expected}: no coincide el tipo de sus elementos.',
  'E3012.divide': '«{op}» solo divide enteros: para dividir con decimales usa «{op:divide}».',
  'E3012.trunc':
    '«{op}» solo opera con {type:integer}: convierte antes con «{builtin:trunc}» o «{builtin:round}».',
  'E3012.toText':
    '«{op}» no mezcla texto y números: convierte el número con «{builtin:toText}».',
  'E3014.compare':
    'La condición tiene que ser {type:boolean}, y esta es {found}: compara explícitamente, por ejemplo «… <> 0».',
  'E3015.parameter':
    'No puedo deducir el tipo del parámetro «{name}»: escribe «{name} {kw:as} {type:integer}», por ejemplo.',
  'E3015.result':
    'No puedo deducir el tipo del resultado «{name}»: declara el tipo de la función con «{kw:as}».',
  'E3022.again': '«{name}» ya es un arreglo dimensionado: solo se puede dimensionar una vez.',
  'E3022.kind': '«{name}» no es una variable de este bloque: solo se dimensionan variables.',
  'E3022.rank':
    '«{name}» se declaró con otro número de dimensiones: usa {expected} en lugar de {found}.',
  'E3035.trunc':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: usa «{builtin:trunc}» o «{builtin:round}».',
  'E3035.div':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: «{kw:div}» da la división entera.',
  'E3035.index':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: toma una letra con «texto[i]».',
  'E3035.toNumber':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: conviértelo con «{builtin:toNumber}».',
  'E3035.toText':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: conviértelo con «{builtin:toText}».',
  'E3035.rank':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: no coincide el número de dimensiones.',
  'E3035.element':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: no coincide el tipo de sus elementos.',
```

- [ ] **Step 10: Add the same templates and variants to `packages/language/src/diagnostics/catalog/en.ts`**

Append to `templates`:

```ts
  E3001: '"{name}" is not declared.',
  E3002: '"{name}" is already declared in this block.',
  E3003: '"{name}" is used here, before it is declared below: move the declaration up.',
  E3004: 'There is already a subprogram called "{name}": give the variable another name.',
  E3005: '"{name}" is a subprogram, not a variable.',
  E3006: '"{name}" is not a subprogram: it cannot be called.',
  E3007: '"{name}" is a constant: its value cannot change.',
  E3008: '"{name}" is this loop\'s counter: it cannot change inside the loop.',
  E3009: '"{name}" is a whole array, and a single value is needed here.',
  E3010: 'A {found} cannot be stored where a {expected} is expected.',
  E3011: 'A {type:char} holds one single letter, and this text has {length}.',
  E3012: '"{op}" cannot work with {found}: it expects {expected} here.',
  E3013:
    'A single letter of a text cannot be changed; build the new text with "{builtin:substring}" and "{builtin:concat}".',
  E3014: 'A condition has to be {type:boolean}, and this one is {found}.',
  E3015: 'I cannot work out the type of "{name}".',
  E3016: 'This array needs {expected} indices and you gave it {found}.',
  E3017: 'An index has to be {type:integer}, and this one is {found}.',
  E3020: '"{name}" is a subprogram with no return value: it cannot be used as a value.',
  E3021: '"{name}" is not declared: declare it before dimensioning it.',
  E3022: '"{name}" cannot be dimensioned.',
  E3023: 'An array size has to be a positive whole number known in advance.',
  E3024: 'The value of constant "{name}" has to be computable before the program runs.',
  E3025: 'This divides by zero: "{op}" needs a divisor other than 0.',
  E3026: 'Counter "{name}" has to be {type:integer}, and it is {found}.',
  E3027: 'The step cannot be 0: the loop would never end.',
  E3028: 'A {found} value cannot be switched on: use {type:integer}, {type:char} or {type:string}.',
  E3029: 'This value has to be computable before the program runs.',
  E3030: 'The value {value} already appears in another option of this "{kw:switch}".',
  E3031: '"{kw:$kw}" can only be used inside a loop.',
  E3032:
    'Parameter "{param}" is {kw:byRef}: pass a variable here, not a computed value.',
  E3033: 'Only a {kw:function} can return a value.',
  E3034: '"{name}" needs {expected} arguments and you gave it {found}.',
  E3035: 'Argument {position} of "{name}" is {found} and {expected} is expected.',
  E3036: '"{builtin:$builtin}" needs {expected} arguments and you gave it {found}.',
  E3037: 'Argument {position} of "{builtin:$builtin}" is {found} and {expected} is expected.',
  W3001: 'This code never runs.',
  W3002: '"{name}" is declared but never read.',
  W3003: '"{name}" is read but never given a value.',
  W3004: '"{name}" is never given a value: the function returns nothing.',
```

Append to `variants`:

```ts
  'E2002.builtin':
    'I did not expect "{found}" here: "{builtin:$builtin}" is a language function, pick another name.',
  'E3001.suggest': '"{name}" is not declared. Did you mean "{suggestion}"?',
  'E3001.declare': '"{name}" is not declared: declare it with "{kw:define}" before using it.',
  'E3002.result':
    '"{name}" is already this function\'s result: remove this "{kw:define}", the header declares it.',
  'E3002.parameter': '"{name}" is already a parameter of this subprogram.',
  'E3009.array': '"{name}" is a whole array, and a single value is needed here.',
  'E3009.scalar': '"{name}" is not an array: it cannot be indexed.',
  'E3010.trunc':
    'A {found} cannot be stored where a {expected} is expected: use "{builtin:trunc}" or "{builtin:round}".',
  'E3010.div':
    'A {found} cannot be stored where a {expected} is expected: "{kw:div}" gives the whole division.',
  'E3010.index':
    'A {found} cannot be stored where a {expected} is expected: take one letter with "text[i]".',
  'E3010.toNumber':
    'A {found} cannot be stored where a {expected} is expected: convert it with "{builtin:toNumber}".',
  'E3010.toText':
    'A {found} cannot be stored where a {expected} is expected: convert it with "{builtin:toText}".',
  'E3010.rank': 'This array is {found} and {expected} is expected: the number of dimensions differs.',
  'E3010.element': 'This array is {found} and {expected} is expected: the element type differs.',
  'E3012.divide': '"{op}" only divides whole numbers: use "{op:divide}" to divide with decimals.',
  'E3012.trunc':
    '"{op}" only works with {type:integer}: convert first with "{builtin:trunc}" or "{builtin:round}".',
  'E3012.toText': '"{op}" does not mix text and numbers: convert the number with "{builtin:toText}".',
  'E3014.compare':
    'A condition has to be {type:boolean}, and this one is {found}: compare explicitly, for example "… <> 0".',
  'E3015.parameter':
    'I cannot work out the type of parameter "{name}": write "{name} {kw:as} {type:integer}", for example.',
  'E3015.result':
    'I cannot work out the type of result "{name}": declare the function\'s type with "{kw:as}".',
  'E3022.again': '"{name}" is already a dimensioned array: it can only be dimensioned once.',
  'E3022.kind': '"{name}" is not a variable of this block: only variables can be dimensioned.',
  'E3022.rank':
    '"{name}" was declared with a different number of dimensions: use {expected} instead of {found}.',
  'E3035.trunc':
    'Argument {position} of "{name}" is {found} and {expected} is expected: use "{builtin:trunc}" or "{builtin:round}".',
  'E3035.div':
    'Argument {position} of "{name}" is {found} and {expected} is expected: "{kw:div}" gives the whole division.',
  'E3035.index':
    'Argument {position} of "{name}" is {found} and {expected} is expected: take one letter with "text[i]".',
  'E3035.toNumber':
    'Argument {position} of "{name}" is {found} and {expected} is expected: convert it with "{builtin:toNumber}".',
  'E3035.toText':
    'Argument {position} of "{name}" is {found} and {expected} is expected: convert it with "{builtin:toText}".',
  'E3035.rank':
    'Argument {position} of "{name}" is {found} and {expected} is expected: the number of dimensions differs.',
  'E3035.element':
    'Argument {position} of "{name}" is {found} and {expected} is expected: the element type differs.',
```

- [ ] **Step 11: Run the catalogue test to verify it passes**

Run: `pnpm vitest run --project stepcode test/diagnostics/format.test.ts`
Expected: PASS. If a variant leaves `{…}` unresolved, the failure names the key.

- [ ] **Step 12: Write the failing parser test for the `E2002.builtin` variant**

Add to the `cases` array of `packages/language/test/parser/diagnostics.test.ts`, right after the existing `E2002` case:

```ts
  {
    code: 'E2002',
    source: 'Proceso p\n  Definir Longitud Como Entero;\nFinProceso',
    line: 2,
    column: 11,
    es: 'Longitud',
    en: 'Length',
  },
```

and add a dedicated test below the `cases` loop:

```ts
describe('E2002 in a declaration position', () => {
  it('names the builtin that stole the name, in each profile spelling', () => {
    const report = diagnosticReport('Proceso p\n  Definir Longitud Como Entero;\nFinProceso')
    const first = report.find((item) => item.code === 'E2002')
    expect(first?.es).toContain('Longitud')
    expect(first?.en).toContain('Length')
  })

  it('keeps the plain variant for a token that is not a builtin', () => {
    const report = diagnosticReport('Proceso p\n  Definir 4 Como Entero;\nFinProceso')
    const first = report.find((item) => item.code === 'E2002')
    expect(first?.es).not.toContain('función del lenguaje')
  })
})
```

- [ ] **Step 13: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/parser/diagnostics.test.ts`
Expected: FAIL — the message says `No esperaba «Longitud» aquí.` and never mentions the builtin.

- [ ] **Step 14: Teach `expectIdentifier` the variant, in `packages/language/src/parser/declarations.ts`**

```ts
/** Consumes an identifier, or reports E2002 and returns an empty synthetic one. */
export function expectIdentifier(ctx: ParserContext): Identifier {
  const start = ctx.cursor.at()
  const token = ctx.cursor.peek()
  if (token.kind !== 'identifier') {
    // A builtin name in a declaration position is a name clash, not random garbage: the
    // lexer reserved the word, so the fix is to rename, and the message says so.
    const data: DiagnosticData =
      token.kind === 'builtin'
        ? { found: token.text, hint: 'builtin', builtin: String(token.value ?? token.text) }
        : { found: token.text }
    report(ctx, 'E2002', token.span, data)
    return {
      kind: 'Identifier',
      name: '',
      text: '',
      missing: true,
      ...placeholderRange(ctx, start),
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
```

Add the import at the top of the file:

```ts
import type { DiagnosticData } from '../diagnostics/index'
```

- [ ] **Step 15: Run the parser tests to verify they pass**

Run: `pnpm vitest run --project stepcode test/parser`
Expected: PASS across the whole parser suite.

- [ ] **Step 16: Add the two profile/span helpers to `packages/language/test/helpers.ts`**

Only these two land here: they depend on nothing that does not exist yet. The behaviour-first
`checkSource` helper needs `check`, so it lands in Task 6, and the expression harness
`checkExpr` needs `typeOf`, so it lands in Task 5. Append at the end of the file, merging the
new imports (`builtinProfiles`, `resolveProfile`) into the existing import block:

```ts
/** `es` is the default profile; `pseint` is the lenient one; `es0` is `es` with 0-based arrays. */
export type ProfileName = 'es' | 'en' | 'pseint' | 'es0'

/**
 * `es` with `indexBase: 0`, for the corpus programs that carried the v1 `$ arrays@stepcode`
 * directive. Resolved once: `resolveProfile` builds sealed lookup tables and is not free.
 */
const es0 = resolveProfile(
  { id: 'es-index-0', extends: 'es', options: { indexBase: 0 } },
  builtinProfiles,
)

export function profileNamed(name: ProfileName): ResolvedProfile {
  return name === 'es0' ? es0 : profiles[name]
}

/** `'23-28'` — the span of the one and only occurrence of `snippet` in `source`. */
export function spanOf(source: string, snippet: string): string {
  const start = source.indexOf(snippet)
  if (start < 0) throw new Error(`"${snippet}" is not in the source`)
  if (source.indexOf(snippet, start + 1) >= 0) {
    throw new Error(`"${snippet}" appears more than once; give a longer snippet`)
  }
  return `${start}-${start + snippet.length}`
}
```

- [ ] **Step 17: Run lint, typecheck and the whole suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: lint exits 0; typecheck silent; every existing test still green plus the new
`test/types/type.test.ts`.

- [ ] **Step 18: Commit**

```bash
git add packages/language/src/types packages/language/src/diagnostics packages/language/src/parser/declarations.ts packages/language/test
git commit -m "feat(language): type model, checker diagnostic codes and catalogs"
```

**Parallelism:** none — every later task depends on this one.

---

### Task 2: `types/assign.ts`, `types/operators.ts`, `types/fold.ts`

**Files:**
- Create: `packages/language/src/types/assign.ts`
- Create: `packages/language/src/types/operators.ts`
- Create: `packages/language/src/types/fold.ts`
- Test: `packages/language/test/types/assign.test.ts`
- Test: `packages/language/test/types/operators.test.ts`
- Test: `packages/language/test/types/fold.test.ts`

**Interfaces:**
- Consumes: `Type`, `ConstValue`, `OperandClass`, `Expected`, the type singletons, `isNumeric`, `isText`, `isArray`, `isUnknown`, `sameType` from `./type` (Task 1); `Expr`, `Identifier`, `BinaryOp`, `UnaryOp` from `../ast/index`; `parseExpr` from `test/helpers.ts`.
- Produces:
  - `type AssignHint = 'array' | 'scalar' | 'trunc' | 'div' | 'index' | 'toNumber' | 'toText' | 'rank' | 'element'`
  - `interface AssignFailure { readonly code: 'E3009' | 'E3010' | 'E3011'; readonly hint?: AssignHint; readonly expected: Type; readonly found: Type; readonly length?: number }`
  - `function assignable(target: Type, source: Type, sourceNode?: Expr): boolean`
  - `function assignFailure(target: Type, source: Type, sourceNode?: Expr): AssignFailure | undefined`
  - `interface BinaryRule { readonly left: OperandClass; readonly right: OperandClass; readonly result: Type | 'wider' }`
  - `const BINARY_TABLE: Readonly<Record<BinaryOp, readonly BinaryRule[]>>`
  - `const UNARY_TABLE: Readonly<Record<UnaryOp, { readonly operand: OperandClass; readonly result: Type | 'same' }>>`
  - `interface OperandError { readonly side: 'left' | 'right'; readonly expected: Expected; readonly found: Type; readonly hint?: 'divide' | 'trunc' | 'toText' }`
  - `interface OperatorCheck { readonly type: Type; readonly error?: OperandError }`
  - `function checkBinary(op: BinaryOp, left: Type, right: Type): OperatorCheck`
  - `function checkUnary(op: UnaryOp, operand: Type): OperatorCheck`
  - `function accepts(operand: OperandClass, type: Type): boolean`
  - `function comparable(left: Type, right: Type): boolean`
  - `function operatorSpelling(op: BinaryOp | UnaryOp, profile: ResolvedProfile): string`
  - `type ConstantLookup = (id: Identifier) => ConstValue | undefined`
  - `function fold(expr: Expr, constants: ConstantLookup): ConstValue | undefined`

- [ ] **Step 1: Write the failing test `packages/language/test/types/assign.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { assignable, assignFailure } from '../../src/types/assign'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'
import { parseExpr } from '../helpers'

describe('assignability (§4.2)', () => {
  it('accepts the same type', () => {
    expect(assignable(INTEGER, INTEGER)).toBe(true)
    expect(assignable(arrayOf('real', 2), arrayOf('real', 2))).toBe(true)
  })

  it('accepts unknown in either position and reports nothing about it', () => {
    expect(assignable(INTEGER, UNKNOWN)).toBe(true)
    expect(assignable(UNKNOWN, arrayOf('char', 1))).toBe(true)
    expect(assignFailure(INTEGER, UNKNOWN)).toBeUndefined()
  })

  it('widens Entero to Real but never the reverse', () => {
    expect(assignable(REAL, INTEGER)).toBe(true)
    expect(assignFailure(INTEGER, REAL)).toEqual({
      code: 'E3010',
      hint: 'trunc',
      expected: INTEGER,
      found: REAL,
    })
  })

  it('offers the div hint when the Real came from a division', () => {
    const node = parseExpr('a / b')
    expect(assignFailure(INTEGER, REAL, node)?.hint).toBe('div')
    expect(assignFailure(INTEGER, REAL, parseExpr('a * b'))?.hint).toBe('trunc')
  })

  it('widens Caracter to Cadena but never the reverse', () => {
    expect(assignable(STRING, CHAR)).toBe(true)
    expect(assignFailure(CHAR, STRING)).toEqual({
      code: 'E3010',
      hint: 'index',
      expected: CHAR,
      found: STRING,
    })
  })

  it('fits a one-character string literal into a Caracter, and only the literal', () => {
    expect(assignable(CHAR, STRING, parseExpr("'M'"))).toBe(true)
    expect(assignable(CHAR, STRING, parseExpr('"M"'))).toBe(true)
    expect(assignable(CHAR, STRING, parseExpr('nombre'))).toBe(false)
  })

  it('reports the length when the literal is too long, or empty', () => {
    expect(assignFailure(CHAR, STRING, parseExpr('"Mar"'))).toEqual({
      code: 'E3011',
      expected: CHAR,
      found: STRING,
      length: 3,
    })
    expect(assignFailure(CHAR, STRING, parseExpr('""'))?.length).toBe(0)
  })

  it('offers toNumber for text into a number and toText for a value into text', () => {
    expect(assignFailure(INTEGER, STRING)?.hint).toBe('toNumber')
    expect(assignFailure(REAL, CHAR)?.hint).toBe('toNumber')
    expect(assignFailure(STRING, INTEGER)?.hint).toBe('toText')
    expect(assignFailure(STRING, BOOLEAN)?.hint).toBe('toText')
  })

  it('has no hint for a pair nothing sensible can be said about', () => {
    const failure = assignFailure(BOOLEAN, INTEGER)
    expect(failure?.code).toBe('E3010')
    expect(failure?.hint).toBeUndefined()
  })

  it('matches arrays on element and rank, and names which one differs', () => {
    expect(assignFailure(arrayOf('integer', 1), arrayOf('integer', 2))).toEqual({
      code: 'E3010',
      hint: 'rank',
      expected: arrayOf('integer', 1),
      found: arrayOf('integer', 2),
    })
    expect(assignFailure(arrayOf('integer', 1), arrayOf('real', 1))?.hint).toBe('element')
  })

  it('never widens an array element the way it widens a scalar', () => {
    expect(assignable(arrayOf('real', 1), arrayOf('integer', 1))).toBe(false)
  })

  it('separates a scalar from an array with E3009, in both directions', () => {
    expect(assignFailure(INTEGER, arrayOf('integer', 1))).toEqual({
      code: 'E3009',
      hint: 'array',
      expected: INTEGER,
      found: arrayOf('integer', 1),
    })
    expect(assignFailure(arrayOf('integer', 1), INTEGER)).toEqual({
      code: 'E3009',
      hint: 'scalar',
      expected: arrayOf('integer', 1),
      found: INTEGER,
    })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/types/assign.test.ts`
Expected: FAIL — cannot resolve `../../src/types/assign`.

- [ ] **Step 3: Write `packages/language/src/types/assign.ts`**

```ts
import type { Expr } from '../ast/index'
import { isArray, isNumeric, isText, isUnknown, sameType, type Type } from './type'

/** The E3010 hint variants of spec §4.2, plus the two E3009 ones. */
export type AssignHint =
  | 'array'
  | 'scalar'
  | 'trunc'
  | 'div'
  | 'index'
  | 'toNumber'
  | 'toText'
  | 'rank'
  | 'element'

/**
 * Why a value does not fit. `expected` and `found` are types, not text: the reporting site
 * renders them with `typeToString`, so this module never sees a profile.
 */
export interface AssignFailure {
  readonly code: 'E3009' | 'E3010' | 'E3011'
  readonly hint?: AssignHint
  readonly expected: Type
  readonly found: Type
  /** E3011 only: how many characters the literal actually has. */
  readonly length?: number
}

/** The count in characters, counting a surrogate pair as the one character it is. */
function characterCount(value: string): number {
  return [...value].length
}

export function assignable(target: Type, source: Type, sourceNode?: Expr): boolean {
  return assignFailure(target, source, sourceNode) === undefined
}

/**
 * Spec §4.2, target on the left. `sourceNode` is only ever consulted for the two rules that
 * are about the expression and not about its type: a one-character string literal fitting a
 * `Caracter`, and a `/` node choosing the `div` hint over `trunc`.
 */
export function assignFailure(
  target: Type,
  source: Type,
  sourceNode?: Expr,
): AssignFailure | undefined {
  // `unknown` absorbs in both directions: it is how one mistake stays one diagnostic.
  if (isUnknown(target) || isUnknown(source)) return undefined
  if (sameType(target, source)) return undefined
  if (isArray(target) && isArray(source)) {
    const hint = target.element === source.element ? 'rank' : 'element'
    return { code: 'E3010', hint, expected: target, found: source }
  }
  if (isArray(source)) return { code: 'E3009', hint: 'array', expected: target, found: source }
  if (isArray(target)) return { code: 'E3009', hint: 'scalar', expected: target, found: source }
  // Two different scalars from here on.
  if (target.name === 'real' && source.name === 'integer') return undefined
  if (target.name === 'string' && source.name === 'char') return undefined
  if (target.name === 'char' && source.name === 'string') {
    if (sourceNode?.kind === 'Literal' && sourceNode.type === 'string') {
      const length = typeof sourceNode.value === 'string' ? characterCount(sourceNode.value) : 0
      if (length === 1) return undefined
      return { code: 'E3011', expected: target, found: source, length }
    }
    return { code: 'E3010', hint: 'index', expected: target, found: source }
  }
  if (target.name === 'integer' && source.name === 'real') {
    const fromDivision = sourceNode?.kind === 'Binary' && sourceNode.op === 'divide'
    return {
      code: 'E3010',
      hint: fromDivision ? 'div' : 'trunc',
      expected: target,
      found: source,
    }
  }
  if (isNumeric(target) && isText(source)) {
    return { code: 'E3010', hint: 'toNumber', expected: target, found: source }
  }
  if (target.name === 'string' && (isNumeric(source) || source.name === 'boolean')) {
    return { code: 'E3010', hint: 'toText', expected: target, found: source }
  }
  return { code: 'E3010', expected: target, found: source }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/types/assign.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 5: Write the failing test `packages/language/test/types/operators.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import type { BinaryOp } from '../../src/ast/index'
import {
  accepts,
  BINARY_TABLE,
  checkBinary,
  checkUnary,
  comparable,
  operatorSpelling,
  UNARY_TABLE,
} from '../../src/types/operators'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'

describe('the operand classes', () => {
  it('accepts unknown everywhere', () => {
    expect(accepts('integer', UNKNOWN)).toBe(true)
    expect(accepts('boolean', UNKNOWN)).toBe(true)
  })

  it('never accepts an array', () => {
    expect(accepts('numeric', arrayOf('integer', 1))).toBe(false)
    expect(accepts('scalar', arrayOf('integer', 1))).toBe(false)
  })

  it('sorts the five scalars into their classes', () => {
    expect(accepts('numeric', INTEGER)).toBe(true)
    expect(accepts('numeric', REAL)).toBe(true)
    expect(accepts('integer', REAL)).toBe(false)
    expect(accepts('text', CHAR)).toBe(true)
    expect(accepts('text', INTEGER)).toBe(false)
    expect(accepts('boolean', BOOLEAN)).toBe(true)
    expect(accepts('scalar', BOOLEAN)).toBe(true)
  })
})

describe('binary operators (§4.3)', () => {
  const type = (op: BinaryOp, left = INTEGER, right = INTEGER) => checkBinary(op, left, right).type

  it('has a row for every operator the AST knows', () => {
    const ops: BinaryOp[] = [
      'plus',
      'minus',
      'times',
      'divide',
      'power',
      'div',
      'mod',
      'equal',
      'notEqual',
      'lt',
      'le',
      'gt',
      'ge',
      'and',
      'or',
    ]
    for (const op of ops) expect(BINARY_TABLE[op], op).toBeDefined()
  })

  it('keeps + - * integer when both sides are integer, and widens otherwise', () => {
    expect(type('plus')).toBe(INTEGER)
    expect(type('minus', INTEGER, REAL)).toBe(REAL)
    expect(type('times', REAL, INTEGER)).toBe(REAL)
    expect(type('times', REAL, REAL)).toBe(REAL)
  })

  it('concatenates text with +', () => {
    expect(type('plus', STRING, STRING)).toBe(STRING)
    expect(type('plus', CHAR, CHAR)).toBe(STRING)
    expect(type('plus', STRING, CHAR)).toBe(STRING)
  })

  it('always yields Real for / and ^', () => {
    expect(type('divide')).toBe(REAL)
    expect(type('power')).toBe(REAL)
  })

  it('takes and yields Entero for DIV and MOD', () => {
    expect(type('div')).toBe(INTEGER)
    expect(type('mod')).toBe(INTEGER)
    expect(checkBinary('div', INTEGER, REAL).error).toEqual({
      side: 'right',
      expected: 'integer',
      found: REAL,
      hint: 'divide',
    })
    expect(checkBinary('mod', REAL, INTEGER).error).toEqual({
      side: 'left',
      expected: 'integer',
      found: REAL,
      hint: 'trunc',
    })
  })

  it('offers toText when + mixes text and numbers, on whichever side is odd', () => {
    expect(checkBinary('plus', STRING, INTEGER).error).toEqual({
      side: 'right',
      expected: 'text',
      found: INTEGER,
      hint: 'toText',
    })
    expect(checkBinary('plus', INTEGER, STRING).error).toEqual({
      side: 'right',
      expected: 'numeric',
      found: STRING,
      hint: 'toText',
    })
  })

  it('reports on the left when nothing accepts the left operand', () => {
    expect(checkBinary('minus', BOOLEAN, INTEGER).error).toEqual({
      side: 'left',
      expected: 'numeric',
      found: BOOLEAN,
    })
  })

  it('yields Logico for the logical operators and rejects anything else', () => {
    expect(type('and', BOOLEAN, BOOLEAN)).toBe(BOOLEAN)
    expect(checkBinary('or', BOOLEAN, INTEGER).error?.expected).toBe('boolean')
  })

  it('orders numbers with numbers and text with text, never one with the other', () => {
    expect(type('lt', REAL, INTEGER)).toBe(BOOLEAN)
    expect(type('ge', STRING, CHAR)).toBe(BOOLEAN)
    expect(checkBinary('gt', STRING, INTEGER).error).toEqual({
      side: 'right',
      expected: 'text',
      found: INTEGER,
    })
    expect(checkBinary('le', BOOLEAN, BOOLEAN).error?.side).toBe('left')
  })

  it('absorbs unknown: no error, no type', () => {
    expect(checkBinary('plus', UNKNOWN, BOOLEAN)).toEqual({ type: UNKNOWN })
    expect(checkBinary('div', REAL, UNKNOWN)).toEqual({ type: UNKNOWN })
  })

  it('rejects an array operand', () => {
    expect(checkBinary('plus', arrayOf('integer', 1), INTEGER).error?.side).toBe('left')
  })
})

describe('comparability (§4.4)', () => {
  it('holds when either side is assignable to the other', () => {
    expect(comparable(CHAR, STRING)).toBe(true)
    expect(comparable(INTEGER, REAL)).toBe(true)
    expect(comparable(STRING, CHAR)).toBe(true)
    expect(comparable(BOOLEAN, BOOLEAN)).toBe(true)
  })

  it('does not hold across the number/text/boolean divide', () => {
    expect(comparable(BOOLEAN, INTEGER)).toBe(false)
    expect(comparable(STRING, INTEGER)).toBe(false)
  })

  it('types = and <> as Logico and names the left type as the expectation', () => {
    expect(checkBinary('equal', CHAR, STRING).type).toBe(BOOLEAN)
    expect(checkBinary('notEqual', INTEGER, REAL).type).toBe(BOOLEAN)
    expect(checkBinary('equal', BOOLEAN, INTEGER).error).toEqual({
      side: 'right',
      expected: BOOLEAN,
      found: INTEGER,
    })
  })
})

describe('unary operators', () => {
  it('keeps the operand type under - and +, and rejects non-numbers', () => {
    expect(UNARY_TABLE.minus.operand).toBe('numeric')
    expect(checkUnary('minus', REAL).type).toBe(REAL)
    expect(checkUnary('plus', INTEGER).type).toBe(INTEGER)
    expect(checkUnary('minus', STRING).error?.expected).toBe('numeric')
  })

  it('types NO as Logico over a Logico', () => {
    expect(checkUnary('not', BOOLEAN).type).toBe(BOOLEAN)
    expect(checkUnary('not', INTEGER).error?.found).toBe(INTEGER)
  })

  it('absorbs unknown', () => {
    expect(checkUnary('not', UNKNOWN)).toEqual({ type: UNKNOWN })
  })
})

describe('operatorSpelling', () => {
  it('finds symbolic operators and word operators alike, per profile', () => {
    expect(operatorSpelling('plus', profiles.es)).toBe('+')
    expect(operatorSpelling('divide', profiles.es)).toBe('/')
    expect(operatorSpelling('div', profiles.es)).toBe('DIV')
    expect(operatorSpelling('and', profiles.es)).toBe('Y')
    expect(operatorSpelling('and', profiles.en)).toBe('AND')
    expect(operatorSpelling('not', profiles.en)).toBe('NOT')
  })
})
```

The `es` profile's first spellings are what `packages/profiles/src/profiles/es.json` lists;
if `div`, `and` or `not` lead with a different spelling there, use that one — the test asserts
the profile's own first spelling, not a guess.

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/types/operators.test.ts`
Expected: FAIL — cannot resolve `../../src/types/operators`.

- [ ] **Step 7: Write `packages/language/src/types/operators.ts`**

```ts
import type { KeywordKey, OperatorKey, ResolvedProfile } from '@stepcode/profiles'
import type { BinaryOp, UnaryOp } from '../ast/index'
import { assignable } from './assign'
import {
  BOOLEAN,
  type Expected,
  INTEGER,
  isNumeric,
  isText,
  isUnknown,
  type OperandClass,
  REAL,
  STRING,
  type Type,
  UNKNOWN,
} from './type'

/** One row of the spec §4.3 table: which operands, and what comes out. */
export interface BinaryRule {
  readonly left: OperandClass
  readonly right: OperandClass
  /** `wider`: `Entero` when both operands are `Entero`, `Real` as soon as one is `Real`. */
  readonly result: Type | 'wider'
}

const NUMERIC_WIDER: BinaryRule = { left: 'numeric', right: 'numeric', result: 'wider' }
const NUMERIC_REAL: BinaryRule = { left: 'numeric', right: 'numeric', result: REAL }
const INTEGER_ONLY: BinaryRule = { left: 'integer', right: 'integer', result: INTEGER }
const ORDERING: readonly BinaryRule[] = [
  { left: 'numeric', right: 'numeric', result: BOOLEAN },
  { left: 'text', right: 'text', result: BOOLEAN },
]
const LOGICAL: readonly BinaryRule[] = [{ left: 'boolean', right: 'boolean', result: BOOLEAN }]

/**
 * Spec §4.3, one row per operator and operand class, in the order they are tried. `equal` and
 * `notEqual` have no rows: comparability is a relation between the two operands (§4.4), not a
 * pair of independent classes, so `checkBinary` settles them before consulting the table.
 */
export const BINARY_TABLE: Readonly<Record<BinaryOp, readonly BinaryRule[]>> = Object.freeze({
  plus: [NUMERIC_WIDER, { left: 'text', right: 'text', result: STRING }],
  minus: [NUMERIC_WIDER],
  times: [NUMERIC_WIDER],
  divide: [NUMERIC_REAL],
  power: [NUMERIC_REAL],
  div: [INTEGER_ONLY],
  mod: [INTEGER_ONLY],
  equal: [],
  notEqual: [],
  lt: ORDERING,
  le: ORDERING,
  gt: ORDERING,
  ge: ORDERING,
  and: LOGICAL,
  or: LOGICAL,
})

export const UNARY_TABLE: Readonly<
  Record<UnaryOp, { readonly operand: OperandClass; readonly result: Type | 'same' }>
> = Object.freeze({
  minus: { operand: 'numeric', result: 'same' },
  plus: { operand: 'numeric', result: 'same' },
  not: { operand: 'boolean', result: BOOLEAN },
})

/** `unknown` is accepted by every class: nothing is ever reported about it. */
export function accepts(operand: OperandClass, type: Type): boolean {
  if (isUnknown(type)) return true
  switch (operand) {
    case 'numeric':
      return isNumeric(type)
    case 'text':
      return isText(type)
    case 'boolean':
      return type.kind === 'scalar' && type.name === 'boolean'
    case 'integer':
      return type.kind === 'scalar' && type.name === 'integer'
    case 'scalar':
      return type.kind === 'scalar'
  }
}

/** §4.4: two values may be compared for equality when either fits in the other. */
export function comparable(left: Type, right: Type): boolean {
  return assignable(left, right) || assignable(right, left)
}

export interface OperandError {
  /** Which operand is wrong. The diagnostic's span is that operand, so the message stays mute
   * about sides; the side travels in `data` for tooling. */
  readonly side: 'left' | 'right'
  readonly expected: Expected
  readonly found: Type
  readonly hint?: 'divide' | 'trunc' | 'toText'
}

export interface OperatorCheck {
  readonly type: Type
  readonly error?: OperandError
}

function resultOf(rule: BinaryRule, left: Type, right: Type): Type {
  if (rule.result !== 'wider') return rule.result
  const bothIntegers =
    left.kind === 'scalar' && left.name === 'integer' && right.kind === 'scalar' && right.name === 'integer'
  return bothIntegers ? INTEGER : REAL
}

/**
 * The hint for a rejected operand, chosen from the operator and from what the *other* operand
 * turned out to be: `DIV` over a `Real` wants `/`, `MOD` over a `Real` wants `Truncar`, and a
 * `+` that mixes text with a number wants `ConvertirATexto`.
 */
function operandError(
  op: BinaryOp,
  side: 'left' | 'right',
  expected: Expected,
  found: Type,
  other: Type,
): OperandError {
  if (op === 'div' && isNumeric(found)) return { side, expected, found, hint: 'divide' }
  if (op === 'mod' && isNumeric(found)) return { side, expected, found, hint: 'trunc' }
  if (op === 'plus' && ((isText(other) && isNumeric(found)) || (isNumeric(other) && isText(found)))) {
    return { side, expected, found, hint: 'toText' }
  }
  return { side, expected, found }
}

export function checkBinary(op: BinaryOp, left: Type, right: Type): OperatorCheck {
  if (isUnknown(left) || isUnknown(right)) return { type: UNKNOWN }
  if (op === 'equal' || op === 'notEqual') {
    if (comparable(left, right)) return { type: BOOLEAN }
    return { type: UNKNOWN, error: { side: 'right', expected: left, found: right } }
  }
  const rules = BINARY_TABLE[op]
  const first = rules[0]
  if (first === undefined) return { type: UNKNOWN }
  const byLeft = rules.filter((rule) => accepts(rule.left, left))
  if (byLeft.length === 0) {
    return { type: UNKNOWN, error: operandError(op, 'left', first.left, left, right) }
  }
  const match = byLeft.find((rule) => accepts(rule.right, right))
  if (match !== undefined) return { type: resultOf(match, left, right) }
  const rule = byLeft[0] as BinaryRule
  return { type: UNKNOWN, error: operandError(op, 'right', rule.right, right, left) }
}

export function checkUnary(op: UnaryOp, operand: Type): OperatorCheck {
  if (isUnknown(operand)) return { type: UNKNOWN }
  const rule = UNARY_TABLE[op]
  if (!accepts(rule.operand, operand)) {
    // A prefix operator has one operand; `left` is where it stands.
    return { type: UNKNOWN, error: { side: 'left', expected: rule.operand, found: operand } }
  }
  return { type: rule.result === 'same' ? operand : rule.result }
}

/** Where an operator's spelling lives: some are symbols, some are words. */
const SPELLING: Readonly<
  Record<BinaryOp | UnaryOp, { readonly section: 'op'; readonly key: OperatorKey } | { readonly section: 'kw'; readonly key: KeywordKey }>
> = Object.freeze({
  plus: { section: 'op', key: 'plus' },
  minus: { section: 'op', key: 'minus' },
  times: { section: 'op', key: 'times' },
  divide: { section: 'op', key: 'divide' },
  power: { section: 'op', key: 'power' },
  equal: { section: 'op', key: 'equal' },
  notEqual: { section: 'op', key: 'notEqual' },
  lt: { section: 'op', key: 'lt' },
  le: { section: 'op', key: 'le' },
  gt: { section: 'op', key: 'gt' },
  ge: { section: 'op', key: 'ge' },
  div: { section: 'kw', key: 'div' },
  mod: { section: 'kw', key: 'mod' },
  and: { section: 'kw', key: 'and' },
  or: { section: 'kw', key: 'or' },
  not: { section: 'kw', key: 'not' },
})

/**
 * The operator as the active profile writes it. Pre-rendered into `data.op` because a
 * template slot cannot know whether an operator lives in the operator table or the keyword
 * table — `+` is one, `DIV` is the other.
 */
export function operatorSpelling(op: BinaryOp | UnaryOp, profile: ResolvedProfile): string {
  const entry = SPELLING[op]
  const spellings = entry.section === 'op' ? profile.operators[entry.key] : profile.keywords[entry.key]
  return spellings?.[0] ?? entry.key
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/types/operators.test.ts`
Expected: PASS, 15 tests.

- [ ] **Step 9: Write the failing test `packages/language/test/types/fold.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { Identifier } from '../../src/ast/index'
import { fold } from '../../src/types/fold'
import type { ConstValue } from '../../src/types/type'
import { parseExpr } from '../helpers'

const constants: Record<string, ConstValue> = {
  max: { type: 'integer', value: 10 },
  saludo: { type: 'string', value: 'hola' },
}

const lookup = (id: Identifier): ConstValue | undefined => constants[id.name]

const folded = (source: string): ConstValue | undefined => fold(parseExpr(source), lookup)

describe('constant folding (§4.6)', () => {
  it('folds every literal', () => {
    expect(folded('7')).toEqual({ type: 'integer', value: 7 })
    expect(folded('2.5')).toEqual({ type: 'real', value: 2.5 })
    expect(folded('"ab"')).toEqual({ type: 'string', value: 'ab' })
    expect(folded('Verdadero')).toEqual({ type: 'boolean', value: true })
  })

  it('folds a constant symbol and nothing else that is named', () => {
    expect(folded('max')).toEqual({ type: 'integer', value: 10 })
    expect(folded('otra')).toBeUndefined()
  })

  it('keeps integer arithmetic integer and widens as soon as a Real appears', () => {
    expect(folded('2 + 3 * 4')).toEqual({ type: 'integer', value: 14 })
    expect(folded('2 + 0.5')).toEqual({ type: 'real', value: 2.5 })
    expect(folded('max - 4')).toEqual({ type: 'integer', value: 6 })
  })

  it('makes / and ^ Real even when the answer is whole', () => {
    expect(folded('4 / 2')).toEqual({ type: 'real', value: 2 })
    expect(folded('2 ^ 3')).toEqual({ type: 'real', value: 8 })
  })

  it('keeps DIV and MOD integer and refuses a Real operand', () => {
    expect(folded('7 DIV 2')).toEqual({ type: 'integer', value: 3 })
    expect(folded('7 MOD 2')).toEqual({ type: 'integer', value: 1 })
    expect(folded('-7 DIV 2')).toEqual({ type: 'integer', value: -3 })
    expect(folded('7.0 DIV 2')).toBeUndefined()
  })

  it('refuses to fold a division by zero instead of inventing infinity', () => {
    expect(folded('1 / 0')).toBeUndefined()
    expect(folded('1 DIV 0')).toBeUndefined()
    expect(folded('1 MOD 0')).toBeUndefined()
  })

  it('folds text concatenation', () => {
    expect(folded('saludo + " mundo"')).toEqual({ type: 'string', value: 'hola mundo' })
    expect(folded('"a" + 1')).toBeUndefined()
  })

  it('folds comparisons and logic', () => {
    expect(folded('3 < 4')).toEqual({ type: 'boolean', value: true })
    expect(folded('"a" = "b"')).toEqual({ type: 'boolean', value: false })
    expect(folded('3 <> 3')).toEqual({ type: 'boolean', value: false })
    expect(folded('Verdadero Y Falso')).toEqual({ type: 'boolean', value: false })
    expect(folded('Verdadero O Falso')).toEqual({ type: 'boolean', value: true })
    expect(folded('NO Verdadero')).toEqual({ type: 'boolean', value: false })
    expect(folded('1 Y Verdadero')).toBeUndefined()
  })

  it('folds unary minus and keeps the operand type', () => {
    expect(folded('-max')).toEqual({ type: 'integer', value: -10 })
    expect(folded('-2.5')).toEqual({ type: 'real', value: -2.5 })
    expect(folded('-"a"')).toBeUndefined()
  })

  it('never folds a call, an index or a builtin', () => {
    expect(folded('Longitud("abc")')).toBeUndefined()
    expect(folded('f(1)')).toBeUndefined()
    expect(folded('a[1]')).toBeUndefined()
  })

  it('gives up rather than return a non-finite number', () => {
    expect(folded('9 ^ 9 ^ 9 ^ 9')).toBeUndefined()
  })
})
```

- [ ] **Step 10: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/types/fold.test.ts`
Expected: FAIL — cannot resolve `../../src/types/fold`.

- [ ] **Step 11: Write `packages/language/src/types/fold.ts`**

```ts
import type { BinaryOp, Expr, Identifier } from '../ast/index'
import type { ConstValue } from './type'

/** How the folder reaches a `Constante`'s value. Anything else folds to `undefined`. */
export type ConstantLookup = (id: Identifier) => ConstValue | undefined

const integer = (value: number): ConstValue | undefined =>
  Number.isFinite(value) ? { type: 'integer', value: Math.trunc(value) } : undefined

const real = (value: number): ConstValue | undefined =>
  Number.isFinite(value) ? { type: 'real', value } : undefined

const boolean = (value: boolean): ConstValue => ({ type: 'boolean', value })

const isInteger = (value: ConstValue): boolean => value.type === 'integer'
const isNumber = (value: ConstValue): boolean => value.type === 'integer' || value.type === 'real'
const isTextValue = (value: ConstValue): boolean => value.type === 'string' || value.type === 'char'

/** `Entero` when both are `Entero`, `Real` as soon as one is: the §4.3 widening rule. */
function wider(left: ConstValue, right: ConstValue, value: number): ConstValue | undefined {
  return isInteger(left) && isInteger(right) ? integer(value) : real(value)
}

function foldBinary(op: BinaryOp, left: ConstValue, right: ConstValue): ConstValue | undefined {
  const a = left.value
  const b = right.value
  if (op === 'plus' && isTextValue(left) && isTextValue(right)) {
    return { type: 'string', value: `${String(a)}${String(b)}` }
  }
  if (op === 'and' || op === 'or') {
    if (left.type !== 'boolean' || right.type !== 'boolean') return undefined
    return boolean(op === 'and' ? a === true && b === true : a === true || b === true)
  }
  if (op === 'equal' || op === 'notEqual') {
    const same =
      (isNumber(left) && isNumber(right)) || (isTextValue(left) && isTextValue(right))
        ? a === b
        : left.type === right.type
          ? a === b
          : undefined
    if (same === undefined) return undefined
    return boolean(op === 'equal' ? same : !same)
  }
  if (op === 'lt' || op === 'le' || op === 'gt' || op === 'ge') {
    const ordered = (isNumber(left) && isNumber(right)) || (isTextValue(left) && isTextValue(right))
    if (!ordered) return undefined
    const less = a < b
    const equal = a === b
    return boolean(op === 'lt' ? less : op === 'le' ? less || equal : op === 'gt' ? !less && !equal : !less)
  }
  if (!isNumber(left) || !isNumber(right)) return undefined
  const x = Number(a)
  const y = Number(b)
  switch (op) {
    case 'plus':
      return wider(left, right, x + y)
    case 'minus':
      return wider(left, right, x - y)
    case 'times':
      return wider(left, right, x * y)
    case 'divide':
      return y === 0 ? undefined : real(x / y)
    case 'power':
      return real(x ** y)
    case 'div':
      return !isInteger(left) || !isInteger(right) || y === 0 ? undefined : integer(x / y)
    case 'mod':
      return !isInteger(left) || !isInteger(right) || y === 0 ? undefined : integer(x % y)
    default:
      return undefined
  }
}

/**
 * Spec §4.6. Folds literals, `Constante` symbols and the operators of §4.3 over folded
 * operands, and nothing else — builtins never fold, so `Longitud("abc")` is not a constant.
 * Used only by `Segun` labels, array sizes, `Constante` values and the zero checks.
 */
export function fold(expr: Expr, constants: ConstantLookup): ConstValue | undefined {
  switch (expr.kind) {
    case 'Literal':
      return { type: expr.type, value: expr.value }
    case 'Identifier':
      return expr.missing === true ? undefined : constants(expr)
    case 'Unary': {
      const operand = fold(expr.operand, constants)
      if (operand === undefined) return undefined
      if (expr.op === 'not') {
        return operand.type === 'boolean' ? boolean(operand.value !== true) : undefined
      }
      if (!isNumber(operand)) return undefined
      const value = expr.op === 'minus' ? -Number(operand.value) : Number(operand.value)
      return isInteger(operand) ? integer(value) : real(value)
    }
    case 'Binary': {
      const left = fold(expr.left, constants)
      if (left === undefined) return undefined
      const right = fold(expr.right, constants)
      if (right === undefined) return undefined
      return foldBinary(expr.op, left, right)
    }
    default:
      return undefined
  }
}
```

`Literal.type` is `LiteralType` (`'integer' | 'real' | 'string' | 'boolean'`), every member of
which is a `TypeKey`, so `{ type: expr.type, value: expr.value }` is a `ConstValue` with no
cast. A `Caracter` never appears as a literal type: a one-character string literal is still a
string literal, and §4.2 is where it becomes a `Caracter`.

- [ ] **Step 12: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/types/fold.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 13: Run lint, typecheck and the whole package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 14: Commit**

```bash
git add packages/language/src/types packages/language/test/types
git commit -m "feat(language): assignability, the operator table and constant folding"
```

**Parallelism:** may run in parallel with Task 3 and Task 4 — disjoint files.

---

### Task 3: `types/builtins.ts`

**Files:**
- Create: `packages/language/src/types/builtins.ts`
- Test: `packages/language/test/types/builtins.test.ts`

**Interfaces:**
- Consumes: `BuiltinKey`, `BUILTIN_KEYS` from `@stepcode/profiles`; `Type`, `OperandClass`, the type singletons from `./type` (Task 1).
- Produces:
  - `interface BuiltinSignature { readonly params: readonly OperandClass[]; readonly result: Type | 'same' }`
  - `const BUILTIN_SIGNATURES: Readonly<Record<BuiltinKey, BuiltinSignature>>`
  - `function builtinResult(key: BuiltinKey, args: readonly Type[]): Type`
  - `const TEXT_TYPES: readonly Type[]`

There is no `types/index.ts`: spec §2 lists five files under `types/` and every consumer
imports the one it needs (`../types/assign`, `../types/operators`, …), the way the parser
imports `./cursor` and `./tokens`. That also keeps Tasks 2 and 3 free of a shared file.

- [ ] **Step 1: Write the failing test `packages/language/test/types/builtins.test.ts`**

```ts
import { BUILTIN_KEYS, type BuiltinKey } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { builtinResult, BUILTIN_SIGNATURES } from '../../src/types/builtins'
import { CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'

describe('the builtin table (§6)', () => {
  it('has a row for every builtin the profiles can spell', () => {
    for (const key of BUILTIN_KEYS) expect(BUILTIN_SIGNATURES[key], key).toBeDefined()
    expect(Object.keys(BUILTIN_SIGNATURES).sort()).toEqual([...BUILTIN_KEYS].sort())
  })

  it('takes a number and gives back the same type for abs', () => {
    expect(BUILTIN_SIGNATURES.abs).toEqual({ params: ['numeric'], result: 'same' })
    expect(builtinResult('abs', [INTEGER])).toBe(INTEGER)
    expect(builtinResult('abs', [REAL])).toBe(REAL)
  })

  it('always gives Real for the transcendental functions', () => {
    const real: BuiltinKey[] = ['sqrt', 'ln', 'exp', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan']
    for (const key of real) {
      expect(BUILTIN_SIGNATURES[key], key).toEqual({ params: ['numeric'], result: REAL })
      expect(builtinResult(key, [INTEGER]), key).toBe(REAL)
    }
  })

  it('gives Entero for trunc and round', () => {
    expect(builtinResult('trunc', [REAL])).toBe(INTEGER)
    expect(builtinResult('round', [REAL])).toBe(INTEGER)
  })

  it('describes the zero-argument builtins', () => {
    expect(BUILTIN_SIGNATURES.random).toEqual({ params: [], result: REAL })
    expect(BUILTIN_SIGNATURES.pi).toEqual({ params: [], result: REAL })
  })

  it('takes two integers and gives an integer for randomBetween', () => {
    expect(BUILTIN_SIGNATURES.randomBetween).toEqual({
      params: ['integer', 'integer'],
      result: INTEGER,
    })
  })

  it('describes the text builtins', () => {
    expect(BUILTIN_SIGNATURES.length).toEqual({ params: ['text'], result: INTEGER })
    expect(BUILTIN_SIGNATURES.upper).toEqual({ params: ['text'], result: 'same' })
    expect(builtinResult('lower', [CHAR])).toBe(CHAR)
    expect(builtinResult('upper', [STRING])).toBe(STRING)
    expect(BUILTIN_SIGNATURES.substring).toEqual({
      params: ['text', 'integer', 'integer'],
      result: STRING,
    })
    expect(BUILTIN_SIGNATURES.concat).toEqual({ params: ['text', 'text'], result: STRING })
  })

  it('converts in both directions, toNumber to Real and toText from any scalar', () => {
    expect(BUILTIN_SIGNATURES.toNumber).toEqual({ params: ['text'], result: REAL })
    expect(BUILTIN_SIGNATURES.toText).toEqual({ params: ['scalar'], result: STRING })
  })

  it('gives unknown for a same-typed builtin with no argument to copy', () => {
    expect(builtinResult('abs', [])).toBe(UNKNOWN)
    expect(builtinResult('upper', [UNKNOWN])).toBe(UNKNOWN)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/types/builtins.test.ts`
Expected: FAIL — cannot resolve `../../src/types/builtins`.

- [ ] **Step 3: Write `packages/language/src/types/builtins.ts`**

```ts
import type { BuiltinKey } from '@stepcode/profiles'
import { CHAR, INTEGER, type OperandClass, REAL, STRING, type Type, UNKNOWN } from './type'

/**
 * One row per builtin (spec §6). `params` is positional and exact — arity is `params.length`.
 * `same` returns the first argument's type, which is how `Abs` keeps `Entero` and `Mayusculas`
 * keeps `Caracter`.
 */
export interface BuiltinSignature {
  readonly params: readonly OperandClass[]
  readonly result: Type | 'same'
}

const NUMERIC_TO_REAL: BuiltinSignature = { params: ['numeric'], result: REAL }

export const BUILTIN_SIGNATURES: Readonly<Record<BuiltinKey, BuiltinSignature>> = Object.freeze({
  abs: { params: ['numeric'], result: 'same' },
  sqrt: NUMERIC_TO_REAL,
  ln: NUMERIC_TO_REAL,
  exp: NUMERIC_TO_REAL,
  sin: NUMERIC_TO_REAL,
  cos: NUMERIC_TO_REAL,
  tan: NUMERIC_TO_REAL,
  asin: NUMERIC_TO_REAL,
  acos: NUMERIC_TO_REAL,
  atan: NUMERIC_TO_REAL,
  trunc: { params: ['numeric'], result: INTEGER },
  round: { params: ['numeric'], result: INTEGER },
  random: { params: [], result: REAL },
  randomBetween: { params: ['integer', 'integer'], result: INTEGER },
  pi: { params: [], result: REAL },
  length: { params: ['text'], result: INTEGER },
  upper: { params: ['text'], result: 'same' },
  lower: { params: ['text'], result: 'same' },
  // `ini..fin` inclusive under the profile's `indexBase`; the bounds are the interpreter's.
  substring: { params: ['text', 'integer', 'integer'], result: STRING },
  concat: { params: ['text', 'text'], result: STRING },
  // `Real`, so assigning it to an `Entero` gets the `trunc` hint rather than passing quietly.
  toNumber: { params: ['text'], result: REAL },
  toText: { params: ['scalar'], result: STRING },
})

/**
 * The result type of one call. `same` copies the first argument's type, which is `unknown`
 * when the argument is missing or already unknown — the absorbing rule, again.
 */
export function builtinResult(key: BuiltinKey, args: readonly Type[]): Type {
  const { result } = BUILTIN_SIGNATURES[key]
  if (result !== 'same') return result
  return args[0] ?? UNKNOWN
}

/** Re-exported so a consumer can name the two text scalars without importing `type.ts`. */
export const TEXT_TYPES: readonly Type[] = Object.freeze([STRING, CHAR])
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/types/builtins.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add packages/language/src/types/builtins.ts packages/language/test/types/builtins.test.ts
git commit -m "feat(language): builtin signature table"
```

**Parallelism:** may run in parallel with Task 2 and Task 4 — no shared file.

---

### Task 4: `checker/scope.ts`, `checker/result.ts`, `checker/suggest.ts`

**Files:**
- Create: `packages/language/src/checker/scope.ts`
- Create: `packages/language/src/checker/result.ts`
- Create: `packages/language/src/checker/suggest.ts`
- Test: `packages/language/test/checker/scope.test.ts`
- Test: `packages/language/test/checker/suggest.test.ts`

**Interfaces:**
- Consumes: `Type`, `ConstValue`, `typeToString`, `UNKNOWN` from `../types/type` (Task 1); `AssignFailure` from `../types/assign` (Task 2); the AST node types; `createDiagnostic`, `Diagnostic`, `DiagnosticCode`, `DiagnosticData`, `RelatedSpan` from `../diagnostics/index`; `Span` from `../source/index`.
- Produces:
  - `type SymbolKind = 'variable' | 'parameter' | 'result' | 'constant' | 'counter' | 'subprogram'`
  - `interface Symbol { readonly name: string; readonly kind: SymbolKind; type: Type; readonly declaredAt: Node; readonly scope: Scope; readonly byRef?: boolean; readonly decl?: SubprogramDecl; readonly recovered?: true; constValue?: ConstValue; dimensioned?: boolean; counting?: boolean; reads: number; writes: number }`
  - `interface Scope { readonly kind: 'program' | 'body'; readonly owner: Program | MainBlock | SubprogramDecl; readonly parent: Scope | null; readonly symbols: Map<string, Symbol>; readonly order: Symbol[] }`
  - `function createScope(kind: Scope['kind'], owner: Scope['owner'], parent: Scope | null): Scope`
  - `interface SymbolInit { readonly name: string; readonly kind: SymbolKind; readonly type: Type; readonly declaredAt: Node; readonly scope: Scope; readonly byRef?: boolean; readonly decl?: SubprogramDecl; readonly recovered?: true }`
  - `function createSymbol(init: SymbolInit): Symbol`
  - `function declareSymbol(scope: Scope, symbol: Symbol): Symbol`
  - `function lookupLocal(scope: Scope, name: string): Symbol | undefined`
  - `function lookup(scope: Scope, name: string): Symbol | undefined`
  - `interface CheckResult { readonly diagnostics: readonly Diagnostic[]; readonly types: WeakMap<Expr, Type>; readonly symbols: WeakMap<Identifier, Symbol>; readonly calls: WeakMap<Call, SubprogramDecl>; readonly scopes: readonly Scope[] }`
  - `interface BodyState`, `interface Frame`, `interface CheckerState`
  - `function createState(program: Program, profile: ResolvedProfile): CheckerState`
  - `function report(state: CheckerState, code: DiagnosticCode, span: Span, data?: DiagnosticData, related?: readonly RelatedSpan[]): void`
  - `function setType(state: CheckerState, expr: Expr, type: Type): Type`
  - `function reportAssignFailure(state: CheckerState, span: Span, failure: AssignFailure, context?: AssignContext): void`
  - `function suggestName(name: string, candidates: readonly string[], normalize: (text: string) => string): string | undefined`
  - `function damerauLevenshtein(left: string, right: string, max: number): number`

- [ ] **Step 1: Write the failing test `packages/language/test/checker/scope.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  createScope,
  createSymbol,
  declareSymbol,
  lookup,
  lookupLocal,
} from '../../src/checker/scope'
import { createState, report, reportAssignFailure, setType } from '../../src/checker/result'
import { assignFailure } from '../../src/types/assign'
import { CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'
import { parseExpr, parseSource } from '../helpers'

const programOf = (source: string) => parseSource(source).program

const sample = programOf('Proceso p\n  Escribir 1;\nFinProceso')
const declaredAt = parseExpr('a')

describe('scopes', () => {
  it('starts empty and remembers its kind, owner and parent', () => {
    const program = createScope('program', sample, null)
    const body = createScope('body', sample.main!, program)
    expect(program.kind).toBe('program')
    expect(program.parent).toBeNull()
    expect(body.parent).toBe(program)
    expect(body.owner).toBe(sample.main)
    expect(body.symbols.size).toBe(0)
    expect(body.order).toEqual([])
  })

  it('declares a symbol under its canonical name and keeps declaration order', () => {
    const scope = createScope('body', sample.main!, null)
    const first = declareSymbol(
      scope,
      createSymbol({ name: 'total', kind: 'variable', type: INTEGER, declaredAt, scope }),
    )
    const second = declareSymbol(
      scope,
      createSymbol({ name: 'aux', kind: 'variable', type: STRING, declaredAt, scope }),
    )
    expect(lookupLocal(scope, 'total')).toBe(first)
    expect(scope.order).toEqual([first, second])
  })

  it('starts every symbol with no reads and no writes', () => {
    const scope = createScope('body', sample.main!, null)
    const symbol = createSymbol({ name: 'n', kind: 'variable', type: INTEGER, declaredAt, scope })
    expect(symbol.reads).toBe(0)
    expect(symbol.writes).toBe(0)
    expect(symbol.dimensioned).toBeUndefined()
    expect('byRef' in symbol).toBe(false)
  })

  it('keeps the optional fields off the object unless they were given', () => {
    const scope = createScope('body', sample.main!, null)
    const byValue = createSymbol({ name: 'n', kind: 'parameter', type: INTEGER, declaredAt, scope })
    const byRef = createSymbol({
      name: 'm',
      kind: 'parameter',
      type: INTEGER,
      declaredAt,
      scope,
      byRef: true,
    })
    expect('byRef' in byValue).toBe(false)
    expect(byRef.byRef).toBe(true)
  })

  it('looks a name up through the parent chain but never sideways', () => {
    const program = createScope('program', sample, null)
    const main = createScope('body', sample.main!, program)
    const other = createScope('body', sample.main!, program)
    const sub = declareSymbol(
      program,
      createSymbol({ name: 'f', kind: 'subprogram', type: UNKNOWN, declaredAt, scope: program }),
    )
    const local = declareSymbol(
      main,
      createSymbol({ name: 'x', kind: 'variable', type: INTEGER, declaredAt, scope: main }),
    )
    expect(lookup(main, 'f')).toBe(sub)
    expect(lookup(main, 'x')).toBe(local)
    expect(lookup(other, 'x')).toBeUndefined()
    expect(lookupLocal(main, 'f')).toBeUndefined()
  })
})

describe('the checker state', () => {
  it('opens with a program scope, listed first', () => {
    const state = createState(sample, profiles.es)
    expect(state.scopes).toEqual([state.programScope])
    expect(state.programScope.kind).toBe('program')
    expect(state.frame.scope).toBe(state.programScope)
    expect(state.frame.subprogram).toBeNull()
    expect(state.frame.loopDepth).toBe(0)
  })

  it('stamps severity and keeps the data it was given', () => {
    const state = createState(sample, profiles.es)
    report(state, 'E3001', { start: 3, end: 8 }, { name: 'total' })
    expect(state.diagnostics).toEqual([
      { code: 'E3001', severity: 'error', span: { start: 3, end: 8 }, data: { name: 'total' } },
    ])
  })

  it('records a type per expression node', () => {
    const state = createState(sample, profiles.es)
    const expr = parseExpr('1 + 2')
    expect(setType(state, expr, INTEGER)).toBe(INTEGER)
    expect(state.types.get(expr)).toBe(INTEGER)
  })

  it('renders the two types of an assignment failure before reporting it', () => {
    const state = createState(sample, profiles.es)
    reportAssignFailure(state, { start: 0, end: 1 }, assignFailure(INTEGER, REAL)!)
    expect(state.diagnostics[0]).toEqual({
      code: 'E3010',
      severity: 'error',
      span: { start: 0, end: 1 },
      data: { expected: 'Entero', found: 'Real', hint: 'trunc' },
    })
  })

  it('turns an assignment failure into E3035 when the context says argument', () => {
    const state = createState(sample, profiles.es)
    reportAssignFailure(state, { start: 0, end: 1 }, assignFailure(INTEGER, REAL)!, {
      code: 'E3035',
      data: { name: 'f', position: 2 },
    })
    expect(state.diagnostics[0]?.code).toBe('E3035')
    expect(state.diagnostics[0]?.data).toEqual({
      expected: 'Entero',
      found: 'Real',
      hint: 'trunc',
      name: 'f',
      position: 2,
    })
  })

  it('keeps E3009 and E3011 as themselves even in an argument context', () => {
    const state = createState(sample, profiles.es)
    reportAssignFailure(state, { start: 0, end: 1 }, assignFailure(CHAR, STRING, parseExpr('"ab"'))!, {
      code: 'E3035',
    })
    expect(state.diagnostics[0]?.code).toBe('E3011')
    expect(state.diagnostics[0]?.data.length).toBe(2)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/scope.test.ts`
Expected: FAIL — cannot resolve `../../src/checker/scope`.

- [ ] **Step 3: Write `packages/language/src/checker/scope.ts`**

```ts
import type { Identifier, MainBlock, Node, Program, SubprogramDecl } from '../ast/index'
import type { ConstValue, Type } from '../types/type'

export type SymbolKind =
  | 'variable'
  | 'parameter'
  | 'result'
  | 'constant'
  | 'counter'
  | 'subprogram'

/**
 * One declared name. `type` is mutable because an untyped parameter or an untyped function
 * result is fixed later (§5.12); everything that identifies the symbol is not.
 */
export interface Symbol {
  /** Canonical: `Identifier.name`, already case-folded by the lexer unless `caseSensitive`. */
  readonly name: string
  readonly kind: SymbolKind
  type: Type
  /** The `Identifier` of the declaration, or the header for a result variable. */
  readonly declaredAt: Node
  readonly scope: Scope
  /** Parameters only. */
  readonly byRef?: boolean
  /** Subprogram symbols only: the declaration this name stands for. */
  readonly decl?: SubprogramDecl
  /** Constants only, once the value folded. */
  constValue?: ConstValue
  /** Arrays: set by a sized `Definir` shorthand or by `Dimension`. */
  dimensioned?: boolean
  /** True only while the checker is inside the `Para` body this symbol counts (§5.9). */
  counting?: boolean
  /**
   * Declared by recovery after E3001, so a second use of the same unknown name does not
   * report again (§3.2). Exempt from every later diagnostic, warnings included: the one
   * mistake was already reported.
   */
  readonly recovered?: true
  reads: number
  writes: number
}

/**
 * Two kinds and no block scopes (§3.1). The program scope holds subprogram names; one body
 * scope stands under it per main, per `extraMains` entry and per subprogram. Bodies are
 * siblings, so a subprogram never sees main's variables.
 */
export interface Scope {
  readonly kind: 'program' | 'body'
  readonly owner: Program | MainBlock | SubprogramDecl
  readonly parent: Scope | null
  readonly symbols: Map<string, Symbol>
  /** Declaration order. Every warning pass walks this, never the `Map`, so output is stable. */
  readonly order: Symbol[]
}

export function createScope(
  kind: Scope['kind'],
  owner: Scope['owner'],
  parent: Scope | null,
): Scope {
  return { kind, owner, parent, symbols: new Map(), order: [] }
}

export interface SymbolInit {
  readonly name: string
  readonly kind: SymbolKind
  readonly type: Type
  readonly declaredAt: Node
  readonly scope: Scope
  readonly byRef?: boolean
  readonly decl?: SubprogramDecl
  readonly recovered?: true
}

/**
 * `exactOptionalPropertyTypes` forbids writing `byRef: undefined`, so the optional fields are
 * spread in only when they were given.
 */
export function createSymbol(init: SymbolInit): Symbol {
  return {
    name: init.name,
    kind: init.kind,
    type: init.type,
    declaredAt: init.declaredAt,
    scope: init.scope,
    ...(init.byRef === undefined ? {} : { byRef: init.byRef }),
    ...(init.decl === undefined ? {} : { decl: init.decl }),
    ...(init.recovered === undefined ? {} : { recovered: init.recovered }),
    reads: 0,
    writes: 0,
  }
}

/**
 * Adds the symbol. Clashes are the caller's business: E3002 wants the *first* declaration as
 * its `related` span, so the caller looks the name up before declaring and decides.
 */
export function declareSymbol(scope: Scope, symbol: Symbol): Symbol {
  scope.symbols.set(symbol.name, symbol)
  scope.order.push(symbol)
  return symbol
}

export function lookupLocal(scope: Scope, name: string): Symbol | undefined {
  return scope.symbols.get(name)
}

/** This scope, then its parents. A body scope's only parent is the program scope. */
export function lookup(scope: Scope, name: string): Symbol | undefined {
  for (let current: Scope | null = scope; current !== null; current = current.parent) {
    const found = current.symbols.get(name)
    if (found !== undefined) return found
  }
  return undefined
}

/** A `missing` identifier is never declared and never resolved (§3.2). */
export function isMissing(id: Identifier): boolean {
  return id.missing === true
}
```

- [ ] **Step 4: Write `packages/language/src/checker/result.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Call, Expr, Identifier, Program, SubprogramDecl } from '../ast/index'
import {
  createDiagnostic,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticData,
  type RelatedSpan,
} from '../diagnostics/index'
import type { Span } from '../source/index'
import type { AssignFailure } from '../types/assign'
import { type Type, typeToString } from '../types/type'
import { createScope, type Scope, type Symbol } from './scope'

/**
 * What `check` hands back. The interpreter and the editor read these tables instead of
 * re-deriving anything: only the checker knows types.
 */
export interface CheckResult {
  readonly diagnostics: readonly Diagnostic[]
  /** Every expression node of every checked body. */
  readonly types: WeakMap<Expr, Type>
  /** Every resolved, non-missing identifier. */
  readonly symbols: WeakMap<Identifier, Symbol>
  /** Every resolved user call. */
  readonly calls: WeakMap<Call, SubprogramDecl>
  /** The program scope first, then one body scope per body, in the order they were built. */
  readonly scopes: readonly Scope[]
}

/** Per-subprogram bookkeeping for the on-demand body check of §8. */
export interface BodyState {
  status: 'unchecked' | 'checking' | 'checked'
  readonly scope: Scope
  readonly params: Symbol[]
  /**
   * The result *variable* — the one the header names in `r <- f(…)`, which lives in the body
   * scope. `null` for a procedure and for a `f(): T` function, which returns only through
   * `Retornar` and so has no name to assign to.
   */
  readonly result: Symbol | null
  /** What a call to this subprogram yields. `unknown` until §5.12 fixes it. */
  resultType: Type
  /** Assignments to the result variable plus `Retornar value`, for W3004. */
  resultWrites: number
  /** The call that fixed the untyped parameters, for the E3035 `related` span (§5.12). */
  fixedBy?: Span
  /** E3015 is reported once per body, however many calls hit the same cycle. */
  inferReported: boolean
}

/** The body being checked right now. */
export interface Frame {
  readonly scope: Scope
  /** `null` while main or an `extraMains` body is being checked. */
  readonly subprogram: SubprogramDecl | null
  /** Loops of *this* body only: a loop in a caller does not make `Romper` legal here (§5.10). */
  loopDepth: number
}

export interface CheckerState {
  readonly profile: ResolvedProfile
  readonly diagnostics: Diagnostic[]
  readonly types: WeakMap<Expr, Type>
  readonly symbols: WeakMap<Identifier, Symbol>
  readonly calls: WeakMap<Call, SubprogramDecl>
  readonly scopes: Scope[]
  readonly programScope: Scope
  readonly bodies: Map<SubprogramDecl, BodyState>
  frame: Frame
}

export function createState(program: Program, profile: ResolvedProfile): CheckerState {
  const programScope = createScope('program', program, null)
  return {
    profile,
    diagnostics: [],
    types: new WeakMap(),
    symbols: new WeakMap(),
    calls: new WeakMap(),
    scopes: [programScope],
    programScope,
    bodies: new Map(),
    frame: { scope: programScope, subprogram: null, loopDepth: 0 },
  }
}

export function report(
  state: CheckerState,
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): void {
  state.diagnostics.push(createDiagnostic(code, span, data, related))
}

/** Records the type of one expression node and hands it back, so callers can `return`. */
export function setType(state: CheckerState, expr: Expr, type: Type): Type {
  state.types.set(expr, type)
  return type
}

export interface AssignContext {
  /** An argument mismatch is E3035 rather than E3010; E3009 and E3011 keep their own code. */
  readonly code?: 'E3035'
  readonly data?: DiagnosticData
  readonly related?: readonly RelatedSpan[]
}

/**
 * The one place a type reaches a diagnostic. Both types are rendered here with
 * `typeToString`, so no catalog ever receives a `Type` object.
 */
export function reportAssignFailure(
  state: CheckerState,
  span: Span,
  failure: AssignFailure,
  context: AssignContext = {},
): void {
  const data: Record<string, string | number> = {
    expected: typeToString(failure.expected, state.profile),
    found: typeToString(failure.found, state.profile),
    ...context.data,
  }
  if (failure.hint !== undefined) data.hint = failure.hint
  if (failure.length !== undefined) data.length = failure.length
  const code = failure.code === 'E3010' && context.code !== undefined ? context.code : failure.code
  report(state, code, span, data, context.related)
}
```

- [ ] **Step 5: Run the scope test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/scope.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 6: Write the failing test `packages/language/test/checker/suggest.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { damerauLevenshtein, suggestName } from '../../src/checker/suggest'

const normalize = profiles.es.normalize

describe('damerauLevenshtein', () => {
  it('is zero for equal strings', () => {
    expect(damerauLevenshtein('total', 'total', 2)).toBe(0)
  })

  it('counts one substitution, one insertion and one deletion', () => {
    expect(damerauLevenshtein('total', 'tota', 2)).toBe(1)
    expect(damerauLevenshtein('total', 'totall', 2)).toBe(1)
    expect(damerauLevenshtein('total', 'tetal', 2)).toBe(1)
  })

  it('counts a transposition as one, not two', () => {
    expect(damerauLevenshtein('total', 'ttoal', 2)).toBe(1)
    expect(damerauLevenshtein('contador', 'contadro', 2)).toBe(1)
  })

  it('stops counting past the cutoff instead of walking the whole matrix', () => {
    expect(damerauLevenshtein('abcdef', 'zzzzzz', 2)).toBeGreaterThan(2)
    expect(damerauLevenshtein('', 'abcdef', 2)).toBeGreaterThan(2)
  })
})

describe('suggestName', () => {
  it('finds a name within distance two', () => {
    expect(suggestName('contadro', ['contador', 'total'], normalize)).toBe('contador')
    expect(suggestName('totl', ['contador', 'total'], normalize)).toBe('total')
  })

  it('gives nothing when everything is further than two edits away', () => {
    expect(suggestName('xyz', ['contador', 'total'], normalize)).toBeUndefined()
  })

  it('ignores accents and case, because the profile normalizer folds both', () => {
    expect(suggestName('anio', ['año'], normalize)).toBeUndefined()
    expect(suggestName('AÑO', ['año'], normalize)).toBe('año')
    expect(suggestName('Total', ['total'], normalize)).toBe('total')
  })

  it('prefers the nearest candidate, and the first one at equal distance', () => {
    expect(suggestName('tota', ['total', 'tot'], normalize)).toBe('total')
    expect(suggestName('cont', ['conta', 'conto'], normalize)).toBe('conta')
  })

  it('hands back the candidate exactly as it was written', () => {
    expect(suggestName('miedad', ['miEdad'], normalize)).toBe('miEdad')
  })
})
```

- [ ] **Step 7: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/suggest.test.ts`
Expected: FAIL — cannot resolve `../../src/checker/suggest`.

- [ ] **Step 8: Write `packages/language/src/checker/suggest.ts`**

```ts
/** How far apart two names may be and still be offered as "did you mean" (§3.2). */
export const MAX_SUGGESTION_DISTANCE = 2

/**
 * Optimal string alignment distance: insertions, deletions, substitutions and the swap of two
 * adjacent characters, each costing one. `max` is a cutoff — once every cell of a row is past
 * it the answer can only grow, so the walk stops and returns `max + 1`. A near-miss search
 * over a scope of names should not cost a full matrix per name.
 */
export function damerauLevenshtein(left: string, right: string, max: number): number {
  const a = [...left]
  const b = [...right]
  if (Math.abs(a.length - b.length) > max) return max + 1
  let previousPrevious: number[] = []
  let previous: number[] = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    const current: number[] = new Array<number>(b.length + 1)
    current[0] = i
    let best = current[0] as number
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(
        (previous[j] as number) + 1,
        (current[j - 1] as number) + 1,
        (previous[j - 1] as number) + cost,
      )
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (previousPrevious[j - 2] as number) + 1)
      }
      current[j] = value
      if (value < best) best = value
    }
    if (best > max) return max + 1
    previousPrevious = previous
    previous = current
  }
  return previous[b.length] as number
}

/**
 * The nearest candidate within `MAX_SUGGESTION_DISTANCE`, compared after folding case and
 * accents with the profile's own normalizer — `AÑO` finds `año`, `anio` does not, because
 * folding an accent is not the same as spelling it out. Candidates are visited in the order
 * given (declaration order), so ties resolve to the first one and the answer is deterministic.
 * The candidate is returned exactly as it was written.
 */
export function suggestName(
  name: string,
  candidates: readonly string[],
  normalize: (text: string) => string,
): string | undefined {
  const target = normalize(name)
  let best: string | undefined
  let bestDistance = MAX_SUGGESTION_DISTANCE + 1
  for (const candidate of candidates) {
    const distance = damerauLevenshtein(target, normalize(candidate), MAX_SUGGESTION_DISTANCE)
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return bestDistance <= MAX_SUGGESTION_DISTANCE ? best : undefined
}
```

- [ ] **Step 9: Run the suggestion test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/suggest.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 10: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 11: Commit**

```bash
git add packages/language/src/checker packages/language/test/checker
git commit -m "feat(language): scopes, symbols, checker state and name suggestions"
```

**Parallelism:** may run in parallel with Task 2 and Task 3. `result.ts` imports
`AssignFailure` from Task 2's `types/assign.ts`, so typecheck this task only once Task 2 has
landed; the code itself is independent.

---

### Task 5: `checker/expressions.ts` — typing, names, indexing, builtin calls

**Files:**
- Create: `packages/language/src/checker/expressions.ts`
- Modify: `packages/language/test/helpers.ts` (the `checkExprIn` harness)
- Test: `packages/language/test/checker/expressions.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–4.
- Produces:
  - `function typeOf(state: CheckerState, expr: Expr): Type`
  - `function typeOfIndex(state: CheckerState, node: Index): Type`
  - `function checkBuiltinCall(state: CheckerState, node: BuiltinCall): Type`
  - `function resolveIdentifier(state: CheckerState, id: Identifier): Symbol | undefined`
  - `function resolveOrRecover(state: CheckerState, id: Identifier, hint?: 'declare'): Symbol`
  - `function reportUnknownName(state: CheckerState, id: Identifier, hint?: 'declare'): void`
  - `function declareRecovered(state: CheckerState, id: Identifier): Symbol`
  - `function constantLookup(state: CheckerState): ConstantLookup`
  - `function nameOf(expr: Expr): string`
  - `function markWritten(state: CheckerState, expr: Expr): void`
  - `function isPassableByRef(state: CheckerState, expr: Expr): boolean`
  - `function isActiveCounter(state: CheckerState, expr: Expr): boolean`
  - `function argText(expr: Expr): string`
  - Test helper `checkExprIn(source, options?) => { type: string; codes: DiagnosticCode[]; diagnostics: string[] }`

**Scope note:** `typeOf`'s `Call` case types its arguments and yields `unknown` here. User calls
need the signature table and the on-demand body check, so Task 6 replaces that one case with
`checkUserCall` and adds E3006, E3020, E3032, E3034 and E3035. Nothing else in this file changes
afterwards.

- [ ] **Step 1: Add the `checkExprIn` harness to `packages/language/test/helpers.ts`**

Append, merging the imports into the existing block:

```ts
import { createScope, createSymbol, declareSymbol } from '../src/checker/scope'
import { createState } from '../src/checker/result'
import { typeOf } from '../src/checker/expressions'
import { type Type, typeToString } from '../src/types/type'

export interface ExprCaseOptions {
  /** The variables the expression may use, with their types. */
  readonly vars?: Readonly<Record<string, Type>>
  /** Variables declared *below* the expression, for the used-before-declared rule (§3.2). */
  readonly declaredAfter?: Readonly<Record<string, Type>>
  readonly profileName?: ProfileName
}

export interface ExprCaseReport {
  /** The expression's type, rendered with `typeToString`. */
  readonly type: string
  readonly codes: DiagnosticCode[]
  readonly diagnostics: string[]
}

/**
 * One expression, checked in a body scope holding exactly the variables the case declares.
 * The statement layer is not involved — the parser's own `parseExpr` harness, one level up.
 */
export function checkExprIn(source: string, options: ExprCaseOptions = {}): ExprCaseReport {
  const profile = profileNamed(options.profileName ?? 'es')
  const parsed = parseExprResult(source, profile)
  const parseErrors = parsed.diagnostics.filter((one) => one.severity === 'error')
  if (parseErrors.length > 0) {
    throw new Error(`the expression does not parse: ${parseErrors.map((o) => o.code).join(', ')}`)
  }
  const program = parse('Proceso p\nFinProceso', { profile }).program
  const main = program.main
  if (main === null) throw new Error('the harness program has no main block')
  const state = createState(program, profile)
  const scope = createScope('body', main, state.programScope)
  state.scopes.push(scope)
  state.frame = { scope, subprogram: null, loopDepth: 0 }
  // Declared at offset 0: before the expression, whatever the expression's own offsets are.
  for (const [name, type] of Object.entries(options.vars ?? {})) {
    declareSymbol(scope, createSymbol({ name, kind: 'variable', type, declaredAt: main, scope }))
  }
  // Declared far below: `declaredAt` sits past every offset the expression can occupy, which
  // is exactly the source-order relation E3003 is about.
  const late = parseExpr(`${' '.repeat(1000)}z`)
  for (const [name, type] of Object.entries(options.declaredAfter ?? {})) {
    declareSymbol(scope, createSymbol({ name, kind: 'variable', type, declaredAt: late, scope }))
  }
  const type = typeOf(state, parsed.expr)
  return {
    type: typeToString(type, profile),
    codes: state.diagnostics.map((one) => one.code),
    diagnostics: state.diagnostics.map((one) => `${one.code}@${one.span.start}-${one.span.end}`),
  }
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/checker/expressions.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING } from '../../src/types/type'
import { checkExprIn, spanOf } from '../helpers'

const vars = {
  n: INTEGER,
  x: REAL,
  s: STRING,
  c: CHAR,
  b: BOOLEAN,
  lista: arrayOf('integer', 1),
  tabla: arrayOf('real', 2),
}

const typeOfCase = (source: string): string => checkExprIn(source, { vars }).type
const codesOfCase = (source: string): string[] => checkExprIn(source, { vars }).codes

describe('literals and names', () => {
  it('types every literal form', () => {
    expect(typeOfCase('7')).toBe('Entero')
    expect(typeOfCase('2.5')).toBe('Real')
    expect(typeOfCase('"hola"')).toBe('Cadena')
    expect(typeOfCase("'M'")).toBe('Cadena')
    expect(typeOfCase('Verdadero')).toBe('Logico')
  })

  it('types a declared name from its symbol', () => {
    expect(typeOfCase('n')).toBe('Entero')
    expect(typeOfCase('lista')).toBe('Entero[]')
    expect(codesOfCase('n')).toEqual([])
  })

  it('reports an unknown name once, however many times it appears', () => {
    expect(checkExprIn('total + total + total', { vars }).codes).toEqual(['E3001'])
  })

  it('suggests a near miss and stays quiet when nothing is near', () => {
    const near = checkExprIn('lisat', { vars })
    expect(near.codes).toEqual(['E3001'])
    const far = checkExprIn('zzzzzzz', { vars })
    expect(far.codes).toEqual(['E3001'])
  })

  it('reports a name used above its declaration', () => {
    const report = checkExprIn('total + 1', { vars, declaredAfter: { total: INTEGER } })
    expect(report.codes).toEqual(['E3003'])
    expect(report.type).toBe('Entero')
  })

  it('types an unknown name as unknown, so nothing cascades', () => {
    expect(checkExprIn('total + "a"', { vars }).codes).toEqual(['E3001'])
    expect(checkExprIn('total + "a"', { vars }).type).toBe('?')
  })
})

describe('operators over real expressions', () => {
  it('widens and keeps the §4.3 result types', () => {
    expect(typeOfCase('n + n')).toBe('Entero')
    expect(typeOfCase('n + x')).toBe('Real')
    expect(typeOfCase('n / n')).toBe('Real')
    expect(typeOfCase('n ^ 2')).toBe('Real')
    expect(typeOfCase('n DIV 2')).toBe('Entero')
    expect(typeOfCase('s + c')).toBe('Cadena')
    expect(typeOfCase('n < x')).toBe('Logico')
    expect(typeOfCase('b Y Verdadero')).toBe('Logico')
    expect(typeOfCase('NO b')).toBe('Logico')
    expect(typeOfCase('-x')).toBe('Real')
  })

  it('reports the offending operand, at that operand', () => {
    const source = 'n + b'
    const report = checkExprIn(source, { vars })
    expect(report.diagnostics).toEqual([`E3012@${spanOf(source, 'b')}`])
  })

  it('reports a MOD over a Real once, on the Real', () => {
    const source = 'x MOD 2'
    expect(checkExprIn(source, { vars }).diagnostics).toEqual([`E3012@${spanOf(source, 'x')}`])
  })

  it('reports the whole comparison mismatch once', () => {
    expect(codesOfCase('s = n')).toEqual(['E3012'])
    expect(codesOfCase("c = 'M'")).toEqual([])
    expect(codesOfCase('n = x')).toEqual([])
  })

  it('reports a constant zero divisor for /, DIV and MOD', () => {
    expect(codesOfCase('n / 0')).toEqual(['E3025'])
    expect(codesOfCase('n DIV 0')).toEqual(['E3025'])
    expect(codesOfCase('n MOD (1 - 1)')).toEqual(['E3025'])
    expect(codesOfCase('n / x')).toEqual([])
  })

  it('says nothing about an operand that already failed', () => {
    expect(codesOfCase('(n + b) * 2')).toEqual(['E3012'])
  })
})

describe('indexing (§4.5)', () => {
  it('gives the element type for the right number of indices', () => {
    expect(typeOfCase('lista[1]')).toBe('Entero')
    expect(typeOfCase('tabla[1,2]')).toBe('Real')
  })

  it('gives a Caracter for a text indexed once', () => {
    expect(typeOfCase('s[1]')).toBe('Caracter')
    expect(codesOfCase('s[1]')).toEqual([])
  })

  it('reports the index count against the rank', () => {
    expect(codesOfCase('tabla[1]')).toEqual(['E3016'])
    expect(codesOfCase('lista[1,2]')).toEqual(['E3016'])
    expect(codesOfCase('s[1,2]')).toEqual(['E3016'])
  })

  it('reports an index that is not an integer, on the index', () => {
    const source = 'lista[x]'
    expect(checkExprIn(source, { vars }).diagnostics).toEqual([`E3017@${spanOf(source, 'x')}`])
    expect(codesOfCase('lista["a"]')).toEqual(['E3017'])
  })

  it('reports indexing something that is not an array or a text, once', () => {
    const source = 'n[1]'
    const report = checkExprIn(source, { vars })
    expect(report.diagnostics).toEqual([`E3009@${spanOf(source, 'n')}`])
    expect(report.type).toBe('?')
    expect(codesOfCase('c[1]')).toEqual(['E3009'])
  })

  it('still types the indices when the target failed, so they check once each', () => {
    expect(codesOfCase('n[b]')).toEqual(['E3009'])
  })
})

describe('builtin calls (§6)', () => {
  it('types every result shape', () => {
    expect(typeOfCase('Abs(n)')).toBe('Entero')
    expect(typeOfCase('Abs(x)')).toBe('Real')
    expect(typeOfCase('rc(n)')).toBe('Real')
    expect(typeOfCase('Trunc(x)')).toBe('Entero')
    expect(typeOfCase('Longitud(s)')).toBe('Entero')
    expect(typeOfCase('Mayusculas(c)')).toBe('Caracter')
    expect(typeOfCase('Subcadena(s, 1, 2)')).toBe('Cadena')
    expect(typeOfCase('Concatenar(s, c)')).toBe('Cadena')
    expect(typeOfCase('ConvertirANumero(s)')).toBe('Real')
    expect(typeOfCase('ConvertirATexto(b)')).toBe('Cadena')
  })

  it('treats a bare builtin as a zero-argument call', () => {
    expect(typeOfCase('PI')).toBe('Real')
    expect(codesOfCase('PI')).toEqual([])
    expect(codesOfCase('Longitud')).toEqual(['E3036'])
  })

  it('reports the wrong argument count once, and nothing about the types', () => {
    expect(codesOfCase('Subcadena(s, 1)')).toEqual(['E3036'])
    expect(codesOfCase('Longitud(s, 1)')).toEqual(['E3036'])
  })

  it('reports one bad argument at that argument', () => {
    const source = 'Longitud(n)'
    expect(checkExprIn(source, { vars }).diagnostics).toEqual([`E3037@${spanOf(source, 'n')}`])
    expect(codesOfCase('Subcadena(s, x, 2)')).toEqual(['E3037'])
    expect(codesOfCase('ConvertirATexto(lista)')).toEqual(['E3037'])
  })

  it('reports every bad argument of one call, and types the call unknown', () => {
    const report = checkExprIn('Subcadena(n, x, 2)', { vars })
    expect(report.codes).toEqual(['E3037', 'E3037'])
    expect(report.type).toBe('?')
  })
})
```

The builtin spellings above (`rc`, `Trunc`, `Longitud`, `Mayusculas`, `Subcadena`,
`Concatenar`, `ConvertirANumero`, `ConvertirATexto`, `PI`) are the `es` profile's first
spellings from `packages/profiles/src/profiles/es.json`; use whatever that file actually
lists — the test is about the checker, not about the spelling.

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/expressions.test.ts`
Expected: FAIL — cannot resolve `../../src/checker/expressions`.

- [ ] **Step 4: Write `packages/language/src/checker/expressions.ts`**

```ts
import type { Binary, BinaryOp, BuiltinCall, Expr, Identifier, Index, UnaryOp } from '../ast/index'
import type { DiagnosticData } from '../diagnostics/index'
import type { Span } from '../source/index'
import { builtinResult, BUILTIN_SIGNATURES } from '../types/builtins'
import { type ConstantLookup, fold } from '../types/fold'
import {
  accepts,
  checkBinary,
  checkUnary,
  type OperandError,
  operatorSpelling,
} from '../types/operators'
import {
  CHAR,
  classToString,
  expectedToString,
  isArray,
  isUnknown,
  scalar,
  type Type,
  typeToString,
  UNKNOWN,
} from '../types/type'
import { type CheckerState, report, setType } from './result'
import { createSymbol, declareSymbol, lookup, type Symbol } from './scope'
import { suggestName } from './suggest'

/** The name a diagnostic can print for an expression; empty when it has no name of its own. */
export function nameOf(expr: Expr): string {
  if (expr.kind === 'Identifier') return expr.text
  if (expr.kind === 'Index') return nameOf(expr.target)
  return ''
}

/** Only `Constante` symbols fold; everything else is a runtime value (§4.6). */
export function constantLookup(state: CheckerState): ConstantLookup {
  return (id: Identifier) => {
    const symbol = lookup(state.frame.scope, id.name)
    return symbol?.kind === 'constant' ? symbol.constValue : undefined
  }
}

/** Every name a suggestion may offer: this body's, in declaration order, then the subprograms. */
function visibleNames(state: CheckerState): string[] {
  const names: string[] = []
  for (const symbol of state.frame.scope.order) {
    if (symbol.recovered !== true) names.push(symbol.name)
  }
  if (state.frame.scope !== state.programScope) {
    for (const symbol of state.programScope.order) names.push(symbol.name)
  }
  return names
}

/**
 * Resolves a name, records the symbol, and reports the source-order rule. Returns `undefined`
 * when the name is unknown or missing: what to do then depends on the caller — a read reports
 * E3001, an assignment in pseint mode declares instead.
 */
export function resolveIdentifier(state: CheckerState, id: Identifier): Symbol | undefined {
  if (id.missing === true) return undefined
  const found = lookup(state.frame.scope, id.name)
  if (found === undefined) return undefined
  state.symbols.set(id, found)
  // §3.2: source order only, flow is ignored — and subprograms are hoisted, so they are exempt.
  if (found.kind !== 'subprogram' && id.span.start < found.declaredAt.span.start) {
    report(state, 'E3003', id.span, { name: id.text }, [{ span: found.declaredAt.span }])
  }
  return found
}

export function reportUnknownName(
  state: CheckerState,
  id: Identifier,
  hint?: 'declare',
): void {
  const suggestion = suggestName(id.name, visibleNames(state), state.profile.normalize)
  if (suggestion !== undefined) {
    report(state, 'E3001', id.span, { name: id.text, hint: 'suggest', suggestion })
    return
  }
  const data: DiagnosticData = hint === undefined ? { name: id.text } : { name: id.text, hint }
  report(state, 'E3001', id.span, data)
}

/**
 * The recovery symbol of §3.2: an `unknown` variable under the unknown name, so the second
 * use of `totl` in a body does not report a second E3001. It is flagged `recovered`, which
 * keeps it out of the flow warnings — the mistake was already reported once.
 */
export function declareRecovered(state: CheckerState, id: Identifier): Symbol {
  const scope = state.frame.scope
  const symbol = createSymbol({
    name: id.name,
    kind: 'variable',
    type: UNKNOWN,
    declaredAt: id,
    scope,
    recovered: true,
  })
  declareSymbol(scope, symbol)
  state.symbols.set(id, symbol)
  return symbol
}

export function resolveOrRecover(
  state: CheckerState,
  id: Identifier,
  hint?: 'declare',
): Symbol {
  const found = resolveIdentifier(state, id)
  if (found !== undefined) return found
  reportUnknownName(state, id, hint)
  return declareRecovered(state, id)
}

function reportOperand(
  state: CheckerState,
  op: BinaryOp | UnaryOp,
  span: Span,
  error: OperandError,
): void {
  const data: DiagnosticData = {
    op: operatorSpelling(op, state.profile),
    expected: expectedToString(error.expected, state.profile),
    found: typeToString(error.found, state.profile),
    side: error.side,
    ...(error.hint === undefined ? {} : { hint: error.hint }),
  }
  report(state, 'E3012', span, data)
}

const DIVIDERS: ReadonlySet<BinaryOp> = new Set<BinaryOp>(['divide', 'div', 'mod'])

/** E3025: a divisor that folds to zero. A non-constant zero is the interpreter's problem. */
function checkZeroDivisor(state: CheckerState, expr: Binary): void {
  if (!DIVIDERS.has(expr.op)) return
  const value = fold(expr.right, constantLookup(state))
  if (value === undefined || typeof value.value !== 'number' || value.value !== 0) return
  report(state, 'E3025', expr.right.span, { op: operatorSpelling(expr.op, state.profile) })
}

function checkIndexCount(state: CheckerState, node: Index, expected: number, found: number): void {
  if (expected === found) return
  report(state, 'E3016', node.span, { expected, found })
}

function checkIndexTypes(state: CheckerState, node: Index, types: readonly Type[]): void {
  node.indices.forEach((index, position) => {
    const type = types[position] ?? UNKNOWN
    if (isUnknown(type) || (type.kind === 'scalar' && type.name === 'integer')) return
    report(state, 'E3017', index.span, { found: typeToString(type, state.profile) })
  })
}

export function typeOfIndex(state: CheckerState, node: Index): Type {
  const target = typeOf(state, node.target)
  // The indices are typed and recorded even when the target failed, so a bad target is one
  // diagnostic and the editor still knows what every index node is (§4.5).
  const indices = node.indices.map((index) => typeOf(state, index))
  if (isUnknown(target)) return UNKNOWN
  if (isArray(target)) {
    checkIndexCount(state, node, target.rank, indices.length)
    checkIndexTypes(state, node, indices)
    return scalar(target.element)
  }
  if (target.kind === 'scalar' && target.name === 'string') {
    checkIndexCount(state, node, 1, indices.length)
    checkIndexTypes(state, node, indices)
    return CHAR
  }
  report(state, 'E3009', node.target.span, { name: nameOf(node.target), hint: 'scalar' })
  return UNKNOWN
}

export function checkBuiltinCall(state: CheckerState, node: BuiltinCall): Type {
  const argTypes = node.args.map((arg) => typeOf(state, arg))
  const signature = BUILTIN_SIGNATURES[node.key]
  if (signature.params.length !== node.args.length) {
    report(state, 'E3036', node.span, {
      builtin: node.key,
      expected: signature.params.length,
      found: node.args.length,
    })
    return UNKNOWN
  }
  let bad = false
  signature.params.forEach((expected, position) => {
    const arg = node.args[position]
    const type = argTypes[position] ?? UNKNOWN
    if (arg === undefined || accepts(expected, type)) return
    bad = true
    report(state, 'E3037', arg.span, {
      builtin: node.key,
      position: position + 1,
      expected: classToString(expected, state.profile),
      found: typeToString(type, state.profile),
    })
  })
  return bad ? UNKNOWN : builtinResult(node.key, argTypes)
}

/**
 * Bottom-up typing. Every node visited is written to `state.types`, including the ones that
 * failed — they are typed `unknown`, which absorbs, so a mistake is reported exactly once.
 */
export function typeOf(state: CheckerState, expr: Expr): Type {
  switch (expr.kind) {
    // The parser already reported this region; the checker stays silent (§2).
    case 'ErrorExpr':
      return setType(state, expr, UNKNOWN)
    case 'Literal':
      return setType(state, expr, scalar(expr.type))
    case 'Identifier': {
      if (expr.missing === true) return setType(state, expr, UNKNOWN)
      const symbol = resolveOrRecover(state, expr)
      if (symbol.kind === 'subprogram') {
        report(state, 'E3005', expr.span, { name: expr.text })
        return setType(state, expr, UNKNOWN)
      }
      symbol.reads++
      return setType(state, expr, symbol.type)
    }
    case 'Index':
      return setType(state, expr, typeOfIndex(state, expr))
    case 'Call': {
      // A user call needs the signature table and the on-demand body check of §5.12: Task 6
      // replaces this case with `checkUserCall`. Until then the arguments are ordinary
      // expressions and are typed as such, and the call is `unknown`, which absorbs.
      for (const arg of expr.args) typeOf(state, arg)
      return setType(state, expr, UNKNOWN)
    }
    case 'BuiltinCall':
      return setType(state, expr, checkBuiltinCall(state, expr))
    case 'Unary': {
      const operand = typeOf(state, expr.operand)
      const check = checkUnary(expr.op, operand)
      if (check.error !== undefined) {
        reportOperand(state, expr.op, expr.operand.span, check.error)
      }
      return setType(state, expr, check.type)
    }
    case 'Binary': {
      const left = typeOf(state, expr.left)
      const right = typeOf(state, expr.right)
      const check = checkBinary(expr.op, left, right)
      if (check.error !== undefined) {
        reportOperand(
          state,
          expr.op,
          check.error.side === 'left' ? expr.left.span : expr.right.span,
          check.error,
        )
      } else {
        checkZeroDivisor(state, expr)
      }
      return setType(state, expr, check.type)
    }
  }
}

/** A write through an argument or a target: counts for W3003 (§9). */
export function markWritten(state: CheckerState, expr: Expr): void {
  const target = expr.kind === 'Index' ? expr.target : expr
  if (target.kind !== 'Identifier' || target.missing === true) return
  const symbol = state.symbols.get(target)
  if (symbol !== undefined) symbol.writes++
}

/**
 * §5.11: a `Por Referencia` parameter needs somewhere to write back — a variable, a
 * parameter, the result variable, a counter, or one element of an array. A constant, a
 * literal, or any computed expression is E3032.
 */
/**
 * §5.9: a counter is read-only inside its own loop, and a `Por Referencia` argument is a
 * write, so an active counter passed by reference is E3008 rather than E3032.
 */
export function isActiveCounter(state: CheckerState, expr: Expr): boolean {
  const target = expr.kind === 'Index' ? expr.target : expr
  if (target.kind !== 'Identifier' || target.missing === true) return false
  return state.symbols.get(target)?.counting === true
}

/** The identifier text of a variable or array-element argument, for messages. */
export function argText(expr: Expr): string {
  const target = expr.kind === 'Index' ? expr.target : expr
  return target.kind === 'Identifier' ? target.text : ''
}

export function isPassableByRef(state: CheckerState, expr: Expr): boolean {
  const target = expr.kind === 'Index' ? expr.target : expr
  if (target.kind !== 'Identifier' || target.missing === true) return false
  const symbol = state.symbols.get(target)
  if (symbol === undefined) return false
  return (
    symbol.kind === 'variable' ||
    symbol.kind === 'parameter' ||
    symbol.kind === 'result' ||
    symbol.kind === 'counter'
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/expressions.test.ts`
Expected: PASS, 20 tests.

- [ ] **Step 6: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 7: Commit**

```bash
git add packages/language/src/checker/expressions.ts packages/language/test
git commit -m "feat(language): expression typing, name resolution, indexing and builtin calls"
```

**Parallelism:** none — Tasks 2, 3 and 4 must all have landed, and Task 6 builds directly on
this file.

---

### Task 6: `checker/driver.ts` — the two phases, memoized bodies, untyped parameters; `checker/statements.ts` — declarations, assignment, `Escribir`, `Retornar`, user calls

**Files:**
- Create: `packages/language/src/checker/driver.ts`
- Create: `packages/language/src/checker/statements.ts`
- Create: `packages/language/src/checker/index.ts`
- Create: `packages/language/src/diagnostics/sort.ts`
- Modify: `packages/language/src/checker/expressions.ts` (the `Call` case becomes `checkUserCall`)
- Modify: `packages/language/test/helpers.ts` (`checkSource`, `checkCodes`, `typeOfExpr`)
- Test: `packages/language/test/checker/driver.test.ts`
- Test: `packages/language/test/checker/declarations.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces:
  - `function check(program: Program, options: { profile: ResolvedProfile }): CheckResult`
  - `function ensureChecked(state: CheckerState, decl: SubprogramDecl, argTypes: readonly Type[] | undefined, site: Span | undefined): BodyState | undefined`
  - `function typeFromRef(state: CheckerState, ref: TypeRef): { type: Type; dimensioned: boolean }`
  - `function checkStatements(state: CheckerState, stmts: readonly Stmt[]): void`
  - `function checkStatement(state: CheckerState, stmt: Stmt): void`
  - `function declareVariable(state: CheckerState, id: Identifier, type: Type, dimensioned: boolean): Symbol | undefined`
  - `function resolveWriteTarget(state: CheckerState, target: Identifier | Index, valueType: Type, allowImplicit: boolean): Type | undefined`
  - `function checkUserCall(state: CheckerState, node: Call, asValue: boolean): Type` (in `expressions.ts`)
  - `function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[]`
  - Test helpers `checkSource`, `checkCodes`, `typeOfExpr`

- [ ] **Step 1: Write `packages/language/src/diagnostics/sort.ts`**

This one has no test of its own here — Task 10 tests the ordering rule through `compile`,
where both diagnostic sources meet. It is written now because `check` returns sorted
diagnostics (§7.2) and every test below depends on that order.

```ts
import type { Severity } from './codes'
import type { Diagnostic } from './diagnostic'

const SEVERITY_ORDER: Readonly<Record<Severity, number>> = { error: 0, warning: 1 }

/**
 * Spec §7.2: by `span.start`, then severity (errors first), then code. The sort is stable, so
 * diagnostics that tie on all three keep the order they were given — which is how `compile`
 * lets a parser diagnostic win over a checker one at the same place: it concatenates the
 * parser's first. Two diagnostics with the same code and span collapse to one, the first.
 */
export function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  const sorted = [...diagnostics].sort(
    (left, right) =>
      left.span.start - right.span.start ||
      SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] ||
      (left.code < right.code ? -1 : left.code > right.code ? 1 : 0),
  )
  const seen = new Set<string>()
  const unique: Diagnostic[] = []
  for (const diagnostic of sorted) {
    const key = `${diagnostic.code}@${diagnostic.span.start}-${diagnostic.span.end}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(diagnostic)
  }
  return unique
}
```

- [ ] **Step 2: Add `checkSource`, `checkCodes` and `typeOfExpr` to `packages/language/test/helpers.ts`**

Append, merging the imports:

```ts
import { check } from '../src/checker/driver'
import type { CheckResult } from '../src/checker/result'

export interface CheckReport {
  /** `['E3010@23-28']`: the code, then the diagnostic's span as `start-end`. */
  readonly diagnostics: string[]
  /** The codes alone, in the same order. */
  readonly codes: DiagnosticCode[]
  /** The source text each diagnostic covers, in the same order. */
  readonly texts: string[]
  readonly result: CheckResult
  readonly program: Program
  readonly profile: ResolvedProfile
}

/**
 * Parse, then check. The parse must be clean: a checker test asserting a checker diagnostic
 * must not be reading a broken tree, so a parser error fails loudly here instead of quietly
 * changing what the checker saw. `compile` is the API that tolerates both (Task 10).
 */
export function checkSource(source: string, profileName: ProfileName = 'es'): CheckReport {
  const profile = profileNamed(profileName)
  const parsed = parse(source, { profile })
  const parseErrors = parsed.diagnostics.filter((one) => one.severity === 'error')
  if (parseErrors.length > 0) {
    throw new Error(
      `the source does not parse: ${parseErrors.map((one) => one.code).join(', ')}\n${source}`,
    )
  }
  const result = check(parsed.program, { profile })
  return {
    diagnostics: result.diagnostics.map((one) => `${one.code}@${one.span.start}-${one.span.end}`),
    codes: result.diagnostics.map((one) => one.code),
    texts: result.diagnostics.map((one) => source.slice(one.span.start, one.span.end)),
    result,
    program: parsed.program,
    profile,
  }
}

/** The codes one source produces, in order. The shape most rule tests assert against. */
export function checkCodes(source: string, profileName: ProfileName = 'es'): DiagnosticCode[] {
  return checkSource(source, profileName).codes
}

/**
 * The checker's type for the expression whose source text is exactly `snippet`, rendered with
 * `typeToString`. The snippet must name one typed node and no other.
 */
export function typeOfExpr(
  source: string,
  snippet: string,
  profileName: ProfileName = 'es',
): string {
  const report = checkSource(source, profileName)
  const found: Type[] = []
  walk(report.program, {
    enter: (node) => {
      const type = report.result.types.get(node as Expr)
      if (type !== undefined && source.slice(node.span.start, node.span.end) === snippet) {
        found.push(type)
      }
      return true
    },
  })
  if (found.length !== 1) {
    throw new Error(`"${snippet}" matches ${found.length} typed expressions, expected exactly 1`)
  }
  return typeToString(found[0] as Type, report.profile)
}
```

- [ ] **Step 3: Write the failing test `packages/language/test/checker/driver.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf, typeOfExpr } from '../helpers'

describe('phase one: signatures', () => {
  it('hoists subprograms, so a call may precede the declaration', () => {
    const source = [
      'Proceso p',
      '  Escribir doble(2);',
      'FinProceso',
      'Funcion r <- doble(n Como Entero) Como Entero',
      '  r <- n * 2;',
      'FinFuncion',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'doble(2)')).toBe('Entero')
  })

  it('allows recursion', () => {
    const source = [
      'Funcion r <- fact(n Como Entero) Como Entero',
      '  Si n <= 1 Entonces',
      '    r <- 1;',
      '  SiNo',
      '    r <- n * fact(n - 1);',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir fact(5);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })

  it('reports a second subprogram of the same name, on the second', () => {
    const source = [
      'SubProceso f()',
      'FinSubProceso',
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3002'])
    expect(report.diagnostics[0]).toBe(`E3002@${source.lastIndexOf('f()')}-${source.lastIndexOf('f()') + 1}`)
    expect(report.result.diagnostics[0]?.related?.length).toBe(1)
  })

  it('lists the program scope first, then one scope per body', () => {
    const source = [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    const { result } = checkSource(source)
    expect(result.scopes.length).toBe(3)
    expect(result.scopes[0]?.kind).toBe('program')
    expect([...(result.scopes[0]?.symbols.keys() ?? [])]).toEqual(['f'])
  })

  it('keeps a subprogram from seeing main variables', () => {
    const source = [
      'SubProceso f()',
      '  Escribir total;',
      'FinSubProceso',
      'Proceso p',
      '  Definir total Como Entero;',
      '  total <- 1;',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3001'])
  })
})

describe('phase two: bodies are checked once', () => {
  it('reports a mistake in a body once, however many calls reach it', () => {
    const source = [
      'SubProceso f()',
      '  Escribir noExiste;',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3001'])
  })

  it('checks a subprogram nobody calls, in source order, at the end', () => {
    const source = [
      'SubProceso f()',
      '  Escribir noExiste;',
      'FinSubProceso',
      'Proceso p',
      '  Escribir 1;',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3001'])
    expect(report.texts).toEqual(['noExiste'])
  })

  it('checks the extra main blocks too', () => {
    const source = ['Proceso a', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual([])
  })
})

describe('untyped parameters (§5.12)', () => {
  const pseint = 'pseint' as const

  it('fixes an untyped parameter from the first checked call', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n + 1',
      'FinSubProceso',
      'Proceso p',
      '  f(2)',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source, pseint)).toEqual([])
  })

  it('reports a later call that does not fit, pointing at the call that fixed it', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n + 1',
      'FinSubProceso',
      'Proceso p',
      '  f(2)',
      '  f("hola")',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, pseint)
    expect(report.codes).toEqual(['E3035'])
    expect(report.texts).toEqual(['"hola"'])
    expect(report.result.diagnostics[0]?.related?.[0]?.span.start).toBe(source.indexOf('f(2)'))
  })

  it('leaves a cycle unknown and says so on the parameter, once', () => {
    const source = [
      'SubProceso f(n)',
      '  g(n)',
      'FinSubProceso',
      'SubProceso g(m)',
      '  f(m)',
      'FinSubProceso',
      'Proceso p',
      '  f(1)',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source, pseint)
    expect(report.codes).toEqual(['E3015'])
    expect(report.texts).toEqual(['n'])
  })

  it('says nothing about the parameters of a subprogram nobody calls', () => {
    const source = ['SubProceso f(n)', '  Escribir n', 'FinSubProceso', 'Proceso p', 'FinProceso'].join(
      '\n',
    )
    expect(checkCodes(source, pseint)).toEqual([])
  })

  it('takes the argument type, not a guess, into the body', () => {
    const source = [
      'SubProceso f(n)',
      '  Escribir n + 1',
      'FinSubProceso',
      'Proceso p',
      '  f("hola")',
      'FinProceso',
    ].join('\n')
    // `n` is `Cadena`, so `n + 1` is the one mistake, inside the body.
    const report = checkSource(source, pseint)
    expect(report.codes).toEqual(['E3012'])
    expect(report.texts).toEqual(['1'])
  })
})

describe('untyped results (§5.12)', () => {
  it('infers a function result from its first assignment', () => {
    const source = [
      'Funcion r <- doble(n)',
      '  r <- n * 2',
      'FinFuncion',
      'Proceso p',
      '  Escribir doble(3)',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual([])
    expect(typeOfExpr(source, 'doble(3)', 'pseint')).toBe('Entero')
  })

  it('infers a function result from its first Retornar', () => {
    const source = [
      'Funcion mayor(a Como Entero, b Como Entero)',
      '  Si a > b Entonces',
      '    Retornar a;',
      '  FinSi',
      '  Retornar b;',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'mayor(1, 2)')).toBe('Entero')
  })

  it('reports a return value that does not fit the declared result type', () => {
    const source = [
      'Funcion r <- f() Como Entero',
      '  Retornar "hola";',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3010'])
    expect(report.texts).toEqual(['"hola"'])
  })

  it('reports a return value outside a function', () => {
    const source = ['Proceso p', '  Retornar 1;', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual(['E3033'])
    const inProcedure = [
      'SubProceso f()',
      '  Retornar 1;',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(inProcedure)).toEqual(['E3033'])
  })

  it('allows a bare Retornar anywhere', () => {
    const source = ['Proceso p', '  Retornar;', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual([])
  })
})

describe('user calls (§5.11)', () => {
  const withF = (body: string, call: string): string =>
    [
      'SubProceso f(n Como Entero)',
      `  ${body}`,
      'FinSubProceso',
      'Proceso p',
      `  ${call}`,
      'FinProceso',
    ].join('\n')

  it('checks arity exactly', () => {
    expect(checkCodes(withF('Escribir n;', 'f();'))).toEqual(['E3034'])
    expect(checkCodes(withF('Escribir n;', 'f(1, 2);'))).toEqual(['E3034'])
    expect(checkCodes(withF('Escribir n;', 'f(1);'))).toEqual([])
  })

  it('checks each argument against its parameter, at the argument', () => {
    const source = withF('Escribir n;', 'f("hola");')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3035'])
    expect(report.diagnostics).toEqual([`E3035@${spanOf(source, '"hola"')}`])
  })

  it('records every resolved call', () => {
    const source = withF('Escribir n;', 'f(1);')
    const { result, program } = checkSource(source)
    const main = program.main
    const statement = main?.body[0]
    expect(statement?.kind).toBe('CallStmt')
    if (statement?.kind === 'CallStmt' && statement.call.kind === 'Call') {
      expect(result.calls.get(statement.call)?.name.name).toBe('f')
    }
  })

  it('refuses a procedure as a value and allows a function call as a statement', () => {
    expect(checkCodes(withF('Escribir n;', 'Escribir f(1);'))).toEqual(['E3020'])
    const source = [
      'Funcion r <- f() Como Entero',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })

  it('refuses a computed argument for a by-reference parameter', () => {
    const source = [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- 0;',
      '  f(a + 1);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3032'])
    const withVariable = source.replace('f(a + 1);', 'f(a);')
    expect(checkCodes(withVariable)).toEqual([])
  })

  it('reports a call to something that is not a subprogram', () => {
    const source = [
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- 1;',
      '  a(2);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3006'])
  })

  it('reports a call to a name that does not exist at all', () => {
    const source = ['Proceso p', '  noExiste(1);', 'FinProceso'].join('\n')
    expect(checkCodes(source)).toEqual(['E3001'])
  })

  it('passes an array to an array parameter and refuses a scalar', () => {
    const source = [
      'SubProceso f(a Como Entero[])',
      '  Escribir a[1];',
      'FinSubProceso',
      'Proceso p',
      '  Definir lista Como Entero[10];',
      '  f(lista);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
    const scalarArgument = source.replace('f(lista);', 'f(1);')
    expect(checkCodes(scalarArgument)).toEqual(['E3009'])
  })
})
```

- [ ] **Step 4: Write the failing test `packages/language/test/checker/declarations.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf, typeOfExpr } from '../helpers'

const main = (...lines: string[]): string => ['Proceso p', ...lines.map((l) => `  ${l}`), 'FinProceso'].join('\n')

describe('Definir (§5.1)', () => {
  it('declares every name of the statement with the written type', () => {
    const source = main('Definir a, b Como Entero;', 'a <- 1;', 'b <- a;')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'b <- a;'.slice(5, 6))).toBe('Entero')
  })

  it('declares an unsized array of the written rank', () => {
    const source = main('Definir lista Como Entero[];', 'Escribir lista[1];')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'lista[1]')).toBe('Entero')
  })

  it('accepts a constant size and refuses one that is not a positive integer', () => {
    expect(checkCodes(main('Definir lista Como Entero[10];', 'lista[1] <- 1;'))).toEqual([])
    expect(checkCodes(main('Definir lista Como Entero[0];', 'lista[1] <- 1;'))).toEqual(['E3023'])
    expect(checkCodes(main('Definir lista Como Entero[2.5];', 'lista[1] <- 1;'))).toEqual(['E3023'])
    expect(checkCodes(main('Definir n Como Entero;', 'Definir lista Como Entero[n];', 'lista[1] <- 1;'))).toEqual(
      ['E3023'],
    )
  })

  it('reports a second declaration of the same name, pointing at the first', () => {
    const source = main('Definir a Como Entero;', 'Definir a Como Real;', 'a <- 1;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3002'])
    expect(report.result.diagnostics[0]?.related?.[0]?.span.start).toBe(source.indexOf('a Como Entero'))
  })

  it('names the parameter and the result variant of a redeclaration', () => {
    const parameter = [
      'SubProceso f(n Como Entero)',
      '  Definir n Como Entero;',
      'FinSubProceso',
      'Proceso p',
      '  f(1);',
      'FinProceso',
    ].join('\n')
    expect(checkSource(parameter).result.diagnostics[0]?.data.hint).toBe('parameter')
    const result = [
      'Funcion r <- f() Como Entero',
      '  Definir r Como Entero;',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkSource(result).result.diagnostics[0]?.data.hint).toBe('result')
  })

  it('reports a variable named like a subprogram', () => {
    const source = [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  Definir f Como Entero;',
      '  f <- 1;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3004'])
  })
})

describe('assignment (§5.4)', () => {
  it('accepts what fits and widens what widens', () => {
    expect(checkCodes(main('Definir x Como Real;', 'x <- 1;'))).toEqual([])
    expect(checkCodes(main('Definir s Como Cadena;', "s <- 'a';"))).toEqual([])
    expect(checkCodes(main('Definir c Como Caracter;', "c <- 'a';"))).toEqual([])
    expect(checkCodes(main('Definir c Como Caracter;', 'c <- "a";'))).toEqual([])
  })

  it('reports what does not fit, at the value', () => {
    const source = main('Definir n Como Entero;', 'n <- 2.5;')
    expect(checkSource(source).diagnostics).toEqual([`E3010@${spanOf(source, '2.5')}`])
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('trunc')
  })

  it('offers the div hint when the value came from a division', () => {
    const source = main('Definir n Como Entero;', 'n <- 7 / 2;')
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('div')
  })

  it('reports a literal too long for a Caracter', () => {
    const source = main('Definir c Como Caracter;', 'c <- "ab";')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3011'])
    expect(report.result.diagnostics[0]?.data.length).toBe(2)
  })

  it('reports a Cadena variable stored in a Caracter with the index hint', () => {
    const source = main('Definir c Como Caracter;', 'Definir s Como Cadena;', 's <- "ab";', 'c <- s;')
    expect(checkSource(source).result.diagnostics[0]?.data.hint).toBe('index')
  })

  it('writes into one element of an array but never into a letter of a text', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'lista[1] <- 5;'))).toEqual([])
    const text = main('Definir s Como Cadena;', 's <- "ab";', "s[1] <- 'z';")
    expect(checkCodes(text)).toEqual(['E3013'])
  })

  it('refuses to assign a whole array or a subprogram name', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'lista <- 1;'))).toEqual(['E3009'])
    const subprogram = [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  f <- 1;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(subprogram)).toEqual(['E3005'])
  })

  it('reports an assignment to a name that was never declared', () => {
    expect(checkCodes(main('total <- 1;'))).toEqual(['E3001'])
  })

  it('declares on first assignment in pseint mode, with the value type', () => {
    const source = ['Proceso p', '  total <- 1', '  Escribir total + 1', 'FinProceso'].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual([])
    expect(typeOfExpr(source, 'total + 1', 'pseint')).toBe('Entero')
  })

  it('still refuses a read of an undeclared name in pseint mode', () => {
    const source = ['Proceso p', '  Escribir total', 'FinProceso'].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual(['E3001'])
  })
})

describe('Escribir (§5.6)', () => {
  it('takes any scalar', () => {
    expect(checkCodes(main('Escribir 1, "a", Verdadero;'))).toEqual([])
  })

  it('refuses a whole array', () => {
    const source = main('Definir lista Como Entero[3];', 'Escribir lista;')
    expect(checkSource(source).diagnostics).toEqual([`E3009@${spanOf(source, 'lista;').slice(0, -1)}`])
  })
})
```

The `E3009@…` expectation above uses `spanOf(source, 'lista;')` minus the `;`; if that reads
awkwardly in review, assert `checkCodes(source)` plus `expect(report.texts).toEqual(['lista'])`
instead — the point is the span covers the argument, not the statement.

- [ ] **Step 5: Run both tests to verify they fail**

Run: `pnpm vitest run --project stepcode test/checker/driver.test.ts test/checker/declarations.test.ts`
Expected: FAIL — cannot resolve `../../src/checker/driver`.

- [ ] **Step 6: Write `packages/language/src/checker/driver.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Expr, MainBlock, Param, Program, SubprogramDecl, TypeRef } from '../ast/index'
import { sortDiagnostics } from '../diagnostics/sort'
import type { Span } from '../source/index'
import { fold } from '../types/fold'
import { arrayOf, isUnknown, scalar, type Type, UNKNOWN } from '../types/type'
import { constantLookup, typeOf } from './expressions'
import { type BodyState, type CheckerState, type CheckResult, createState, report } from './result'
import { createScope, createSymbol, declareSymbol, lookupLocal, type Scope, type Symbol } from './scope'
import { checkStatements } from './statements'

/**
 * An array size (§5.1, §5.2). It must fold to a positive integer, else E3023 — unless the
 * expression is already `unknown`, in which case something else was reported and this stays
 * silent.
 */
function checkSize(state: CheckerState, size: Expr): void {
  const type = typeOf(state, size)
  if (isUnknown(type)) return
  const value = fold(size, constantLookup(state))
  if (value !== undefined && value.type === 'integer' && Number(value.value) > 0) return
  report(state, 'E3023', size.span)
}

/**
 * The type a `TypeRef` denotes, and whether it fixed the array's sizes. `[]` is a scalar;
 * `[null, …]` an unsized array of that rank; sized dimensions are checked and mark the array
 * dimensioned.
 */
export function typeFromRef(
  state: CheckerState,
  ref: TypeRef,
): { type: Type; dimensioned: boolean } {
  if (ref.dimensions.length === 0) return { type: scalar(ref.base), dimensioned: false }
  let dimensioned = false
  for (const dimension of ref.dimensions) {
    if (dimension === null) continue
    dimensioned = true
    checkSize(state, dimension)
  }
  return { type: arrayOf(ref.base, ref.dimensions.length), dimensioned }
}

function declareParam(state: CheckerState, scope: Scope, param: Param): Symbol | null {
  const name = param.name
  if (name.missing === true) return null
  const existing = lookupLocal(scope, name.name)
  if (existing !== undefined) {
    report(state, 'E3002', name.span, { name: name.text, hint: 'parameter' }, [
      { span: existing.declaredAt.span },
    ])
    return existing
  }
  const type = param.type === undefined ? UNKNOWN : typeFromRef(state, param.type).type
  const symbol = createSymbol({
    name: name.name,
    kind: 'parameter',
    type,
    declaredAt: name,
    scope,
    byRef: param.byRef,
  })
  if (type.kind === 'array') symbol.dimensioned = true
  declareSymbol(scope, symbol)
  state.symbols.set(name, symbol)
  return symbol
}

/**
 * Phase one (§8.1): every subprogram gets its name in the program scope, a body scope with
 * its parameters and its result variable, and a `BodyState`. No body is checked here.
 */
function collectSignatures(state: CheckerState, program: Program): void {
  for (const decl of program.subprograms) {
    const name = decl.name
    if (name.missing !== true) {
      const existing = lookupLocal(state.programScope, name.name)
      if (existing === undefined) {
        const symbol = createSymbol({
          name: name.name,
          kind: 'subprogram',
          type: UNKNOWN,
          declaredAt: name,
          scope: state.programScope,
          decl,
        })
        declareSymbol(state.programScope, symbol)
        state.symbols.set(name, symbol)
      } else {
        report(state, 'E3002', name.span, { name: name.text }, [
          { span: existing.declaredAt.span },
        ])
      }
    }
    const scope = createScope('body', decl, state.programScope)
    state.scopes.push(scope)
    // Parameter types may name array sizes, which are expressions: type them in the body
    // scope they belong to, not in the program scope.
    const previous = state.frame
    state.frame = { scope, subprogram: decl, loopDepth: 0 }
    const params: Symbol[] = []
    for (const param of decl.params) {
      const symbol = declareParam(state, scope, param)
      if (symbol !== null) params.push(symbol)
    }
    const declared = decl.returnType === undefined ? UNKNOWN : typeFromRef(state, decl.returnType).type
    let result: Symbol | null = null
    if (decl.returnName !== undefined && decl.returnName.missing !== true) {
      result = createSymbol({
        name: decl.returnName.name,
        kind: 'result',
        type: declared,
        declaredAt: decl.returnName,
        scope,
      })
      declareSymbol(scope, result)
      state.symbols.set(decl.returnName, result)
    }
    state.frame = previous
    state.bodies.set(decl, {
      status: 'unchecked',
      scope,
      params,
      result,
      resultType: declared,
      resultWrites: 0,
      inferReported: false,
    })
  }
}

function checkMain(state: CheckerState, block: MainBlock): void {
  const scope = createScope('body', block, state.programScope)
  state.scopes.push(scope)
  const previous = state.frame
  state.frame = { scope, subprogram: null, loopDepth: 0 }
  checkStatements(state, block.body)
  state.frame = previous
}

/**
 * §8.3. Checks a subprogram body at most once. When the call site brought argument types and
 * the body has untyped parameters, they are fixed here first, so the body is checked with the
 * types its first caller gave it. A call that arrives while the body is already being checked
 * is a cycle: the parameters stay `unknown` and E3015 says so, once.
 */
export function ensureChecked(
  state: CheckerState,
  decl: SubprogramDecl,
  argTypes: readonly Type[] | undefined,
  site: Span | undefined,
): BodyState | undefined {
  const body = state.bodies.get(decl)
  if (body === undefined) return undefined
  if (body.status === 'checked') return body
  if (body.status === 'checking') {
    if (argTypes !== undefined && !body.inferReported) {
      body.inferReported = true
      for (const param of body.params) {
        if (!isUnknown(param.type)) continue
        report(state, 'E3015', param.declaredAt.span, { name: param.name, hint: 'parameter' })
      }
    }
    return body
  }
  body.status = 'checking'
  if (argTypes !== undefined) {
    let fixed = false
    body.params.forEach((param, index) => {
      const argument = argTypes[index]
      if (argument === undefined || isUnknown(argument) || !isUnknown(param.type)) return
      param.type = argument
      fixed = true
    })
    if (fixed && site !== undefined) body.fixedBy = site
  }
  const previous = state.frame
  state.frame = { scope: body.scope, subprogram: decl, loopDepth: 0 }
  checkStatements(state, decl.body)
  state.frame = previous
  body.status = 'checked'
  return body
}

/**
 * Spec §8. Phase one collects every signature; phase two checks main, then each extra main,
 * with subprogram bodies pulled in on demand from their first call; whatever is left is
 * checked in source order at the end.
 */
export function check(program: Program, options: { profile: ResolvedProfile }): CheckResult {
  const state = createState(program, options.profile)
  collectSignatures(state, program)
  if (program.main !== null) checkMain(state, program.main)
  for (const extra of program.extraMains) checkMain(state, extra)
  for (const decl of program.subprograms) ensureChecked(state, decl, undefined, undefined)
  return {
    diagnostics: sortDiagnostics(state.diagnostics),
    types: state.types,
    symbols: state.symbols,
    calls: state.calls,
    scopes: state.scopes,
  }
}
```

- [ ] **Step 7: Write `packages/language/src/checker/statements.ts`**

```ts
import type {
  AssignStmt,
  CallStmt,
  DefineStmt,
  Identifier,
  Index,
  ReturnStmt,
  Stmt,
  WriteStmt,
} from '../ast/index'
import type { DiagnosticData } from '../diagnostics/index'
import { assignFailure } from '../types/assign'
import { isArray, isUnknown, type Type, UNKNOWN } from '../types/type'
import { typeFromRef } from './driver'
import {
  checkBuiltinCall,
  checkUserCall,
  declareRecovered,
  markWritten,
  nameOf,
  reportUnknownName,
  resolveIdentifier,
  typeOf,
  typeOfIndex,
} from './expressions'
import { type CheckerState, report, reportAssignFailure, setType } from './result'
import { createSymbol, declareSymbol, lookupLocal, type Symbol } from './scope'

/**
 * Declares one variable in the current body scope, with the clash rules of §3.2: a name
 * already in this scope is E3002 (with the `result` and `parameter` variants), a name that is
 * a subprogram is E3004. Both keep the first symbol and carry on.
 */
export function declareVariable(
  state: CheckerState,
  id: Identifier,
  type: Type,
  dimensioned: boolean,
): Symbol | undefined {
  if (id.missing === true) return undefined
  const scope = state.frame.scope
  const existing = lookupLocal(scope, id.name)
  if (existing !== undefined) {
    const hint =
      existing.kind === 'result' ? 'result' : existing.kind === 'parameter' ? 'parameter' : undefined
    const data: DiagnosticData = hint === undefined ? { name: id.text } : { name: id.text, hint }
    report(state, 'E3002', id.span, data, [{ span: existing.declaredAt.span }])
    return existing
  }
  const clash = lookupLocal(state.programScope, id.name)
  if (clash !== undefined) {
    report(state, 'E3004', id.span, { name: id.text }, [{ span: clash.declaredAt.span }])
  }
  const symbol = createSymbol({ name: id.name, kind: 'variable', type, declaredAt: id, scope })
  if (dimensioned) symbol.dimensioned = true
  declareSymbol(scope, symbol)
  state.symbols.set(id, symbol)
  return symbol
}

function checkDefine(state: CheckerState, stmt: DefineStmt): void {
  const { type, dimensioned } = typeFromRef(state, stmt.type)
  for (const name of stmt.names) declareVariable(state, name, type, dimensioned)
}

/**
 * Resolves an assignment or `Leer` target and returns the type a value must fit, or
 * `undefined` when the target itself was the mistake and nothing more is to be said.
 * `valueType` is what pseint's implicit declaration takes its type from, and `allowImplicit`
 * says whether this statement may declare at all: an assignment may, `Leer` may not (§3.2).
 */
export function resolveWriteTarget(
  state: CheckerState,
  target: Identifier | Index,
  valueType: Type,
  allowImplicit: boolean,
): Type | undefined {
  if (target.kind === 'Index') {
    const element = setType(state, target, typeOfIndex(state, target))
    const base = state.types.get(target.target)
    if (base !== undefined && base.kind === 'scalar' && base.name === 'string') {
      // `s[i] <- …`: a text is read-only through its index (§5.4).
      report(state, 'E3013', target.span)
      return undefined
    }
    markWritten(state, target)
    return isUnknown(element) ? undefined : element
  }
  const existing = resolveIdentifier(state, target)
  if (existing === undefined) {
    if (target.missing === true) return undefined
    if (allowImplicit && state.profile.options.implicitDeclarations) {
      // §3.2: the first assignment declares, with the value's type — `unknown` included, which
      // simply gives an `unknown` variable and no further diagnostic.
      const symbol = declareVariable(state, target, valueType, false)
      if (symbol !== undefined) symbol.writes++
      return undefined
    }
    reportUnknownName(state, target, 'declare')
    declareRecovered(state, target)
    return undefined
  }
  if (existing.kind === 'subprogram') {
    report(state, 'E3005', target.span, { name: target.text })
    return undefined
  }
  if (isArray(existing.type)) {
    report(state, 'E3009', target.span, { name: target.text, hint: 'array' })
    return undefined
  }
  existing.writes++
  // §5.12: an untyped result variable takes the type of its first assignment.
  if (existing.kind === 'result' && isUnknown(existing.type) && !isUnknown(valueType)) {
    existing.type = valueType
    const decl = state.frame.subprogram
    const body = decl === null ? undefined : state.bodies.get(decl)
    if (body !== undefined) body.resultType = valueType
  }
  if (existing.kind === 'result') {
    const decl = state.frame.subprogram
    const body = decl === null ? undefined : state.bodies.get(decl)
    if (body !== undefined) body.resultWrites++
  }
  return existing.type
}

function checkAssign(state: CheckerState, stmt: AssignStmt): void {
  // The value first: pseint's implicit declaration takes the variable's type from it.
  const value = typeOf(state, stmt.value)
  // `true`: an assignment is the one statement pseint lets declare a variable (§3.2).
  const target = resolveWriteTarget(state, stmt.target, value, true)
  if (target === undefined) return
  const failure = assignFailure(target, value, stmt.value)
  if (failure === undefined) return
  reportAssignFailure(state, stmt.value.span, failure, { data: { name: nameOf(stmt.target) } })
}

function checkWrite(state: CheckerState, stmt: WriteStmt): void {
  for (const arg of stmt.args) {
    const type = typeOf(state, arg)
    if (!isArray(type)) continue
    report(state, 'E3009', arg.span, { name: nameOf(arg), hint: 'array' })
  }
}

function checkReturn(state: CheckerState, stmt: ReturnStmt): void {
  // A bare `Retornar` is allowed anywhere: it is a jump, not a value (§5.10).
  if (stmt.value === undefined) return
  const value = typeOf(state, stmt.value)
  const decl = state.frame.subprogram
  const body = decl === null ? undefined : state.bodies.get(decl)
  if (decl === null || decl.form !== 'function' || body === undefined) {
    report(state, 'E3033', stmt.span)
    return
  }
  body.resultWrites++
  if (body.result !== null) body.result.writes++
  if (isUnknown(body.resultType)) {
    // §5.10 and §5.12: the first returned value fixes an undeclared result type.
    if (isUnknown(value)) return
    body.resultType = value
    if (body.result !== null) body.result.type = value
    return
  }
  const failure = assignFailure(body.resultType, value, stmt.value)
  if (failure !== undefined) reportAssignFailure(state, stmt.value.span, failure)
}

function checkCallStatement(state: CheckerState, stmt: CallStmt): void {
  const call = stmt.call
  if (call.kind === 'BuiltinCall') {
    setType(state, call, checkBuiltinCall(state, call))
    return
  }
  // A function called as a statement discards its result silently (§5.11).
  setType(state, call, checkUserCall(state, call, false))
}

export function checkStatements(state: CheckerState, stmts: readonly Stmt[]): void {
  for (const stmt of stmts) checkStatement(state, stmt)
}

export function checkStatement(state: CheckerState, stmt: Stmt): void {
  switch (stmt.kind) {
    // A misplaced subprogram is checked once, from `Program.subprograms` (§3.1); the parser
    // already reported whatever an `ErrorStmt` stands for (§2); the rest have nothing to check.
    case 'SubprogramDecl':
    case 'ErrorStmt':
    case 'ClearStmt':
    case 'WaitKeyStmt':
      return
    case 'DefineStmt':
      return checkDefine(state, stmt)
    case 'AssignStmt':
      return checkAssign(state, stmt)
    case 'WriteStmt':
      return checkWrite(state, stmt)
    case 'ReturnStmt':
      return checkReturn(state, stmt)
    case 'CallStmt':
      return checkCallStatement(state, stmt)
    case 'DimensionStmt': {
      // Task 7 adds §5.2. The sizes are expressions and are typed here either way.
      for (const item of stmt.items) for (const size of item.sizes) typeOf(state, size)
      return
    }
    case 'ConstantStmt': {
      // Task 7 adds §5.3.
      typeOf(state, stmt.value)
      return
    }
    case 'ReadStmt': {
      // Task 7 adds §5.5.
      for (const target of stmt.targets) typeOf(state, target)
      return
    }
    case 'WaitStmt': {
      // Task 8 adds the `Entero` rule of §5.13.
      typeOf(state, stmt.millis)
      return
    }
    case 'BreakStmt':
    case 'ContinueStmt':
      // Task 8 adds E3031.
      return
    case 'IfStmt': {
      // Task 8 adds E3014 on every condition.
      for (const branch of stmt.branches) {
        typeOf(state, branch.condition)
        checkStatements(state, branch.body)
      }
      if (stmt.elseBody !== undefined) checkStatements(state, stmt.elseBody)
      return
    }
    case 'WhileStmt': {
      typeOf(state, stmt.condition)
      checkStatements(state, stmt.body)
      return
    }
    case 'RepeatStmt': {
      checkStatements(state, stmt.body)
      typeOf(state, stmt.condition)
      return
    }
    case 'SwitchStmt': {
      // Task 8 adds §5.8.
      typeOf(state, stmt.selector)
      for (const entry of stmt.cases) {
        for (const value of entry.values) typeOf(state, value)
        checkStatements(state, entry.body)
      }
      if (stmt.otherwise !== undefined) checkStatements(state, stmt.otherwise)
      return
    }
    case 'ForStmt': {
      // Task 8 adds §5.9.
      typeOf(state, stmt.counter)
      typeOf(state, stmt.from)
      typeOf(state, stmt.to)
      if (stmt.step !== undefined) typeOf(state, stmt.step)
      checkStatements(state, stmt.body)
      return
    }
  }
}
```

- [ ] **Step 8: Replace the `Call` case of `packages/language/src/checker/expressions.ts`**

Add `checkUserCall` and its helper, and point the `Call` case at it:

```ts
    case 'Call':
      return setType(state, expr, checkUserCall(state, expr, true))
```

```ts
/**
 * §5.11. The arguments are typed first, because the callee's untyped parameters are fixed
 * from them (§5.12) and because an unresolvable callee must not silence its arguments.
 * `asValue` is false for a call written as a statement, which discards a function's result.
 */
export function checkUserCall(state: CheckerState, node: Call, asValue: boolean): Type {
  const argTypes = node.args.map((arg) => typeOf(state, arg))
  const callee = node.callee
  if (callee.missing === true) return UNKNOWN
  const symbol = lookup(state.frame.scope, callee.name)
  if (symbol === undefined) {
    reportUnknownName(state, callee)
    declareRecovered(state, callee)
    return UNKNOWN
  }
  state.symbols.set(callee, symbol)
  const decl = symbol.decl
  if (symbol.kind !== 'subprogram' || decl === undefined) {
    report(state, 'E3006', callee.span, { name: callee.text })
    return UNKNOWN
  }
  state.calls.set(node, decl)
  const body = ensureChecked(state, decl, argTypes, node.span)
  if (body === undefined) return UNKNOWN
  checkArguments(state, node, decl, body, argTypes)
  if (!asValue) return UNKNOWN
  if (decl.form !== 'function') {
    report(state, 'E3020', callee.span, { name: callee.text })
    return UNKNOWN
  }
  if (isUnknown(body.resultType) && body.status === 'checking') {
    // A recursive call used as a value, in a function whose result type is not known yet:
    // there is nothing to infer it from (§5.12).
    report(state, 'E3015', callee.span, { name: callee.text, hint: 'result' })
  }
  return body.resultType
}

function checkArguments(
  state: CheckerState,
  node: Call,
  decl: SubprogramDecl,
  body: BodyState,
  argTypes: readonly Type[],
): void {
  if (decl.params.length !== node.args.length) {
    report(state, 'E3034', node.span, {
      name: decl.name.text,
      expected: decl.params.length,
      found: node.args.length,
    })
  }
  // The call that fixed the parameters is worth pointing at — unless it is this one.
  const fixedBy = body.fixedBy
  const related =
    fixedBy !== undefined && fixedBy.start !== node.span.start ? [{ span: fixedBy }] : undefined
  const count = Math.min(body.params.length, node.args.length)
  for (let position = 0; position < count; position++) {
    const param = body.params[position]
    const arg = node.args[position]
    if (param === undefined || arg === undefined) continue
    const failure = assignFailure(param.type, argTypes[position] ?? UNKNOWN, arg)
    if (failure !== undefined) {
      reportAssignFailure(state, arg.span, failure, {
        code: 'E3035',
        data: { name: decl.name.text, position: position + 1 },
        ...(related === undefined ? {} : { related }),
      })
    }
    if (param.byRef !== true) continue
    if (isActiveCounter(state, arg)) report(state, 'E3008', arg.span, { name: argText(arg) })
    else if (isPassableByRef(state, arg)) markWritten(state, arg)
    else report(state, 'E3032', arg.span, { param: param.name })
  }
}
```

New imports in `expressions.ts`:

```ts
import type { Call, SubprogramDecl } from '../ast/index'
import { assignFailure } from '../types/assign'
import { ensureChecked } from './driver'
import { type BodyState, reportAssignFailure } from './result'
```

`expressions.ts` and `driver.ts` now import each other, and `statements.ts` closes the ring.
That is fine: every one of them is a hoisted `function` declaration and none of the modules
runs anything at import time — the same shape `parser/statement.ts` and `parser/declarations.ts`
already have.

- [ ] **Step 9: Write `packages/language/src/checker/index.ts`**

```ts
export { check, ensureChecked, typeFromRef } from './driver'
export type { BodyState, CheckerState, CheckResult, Frame } from './result'
export { createState, report, reportAssignFailure, setType } from './result'
export type { Scope, Symbol, SymbolInit, SymbolKind } from './scope'
export { createScope, createSymbol, declareSymbol, lookup, lookupLocal } from './scope'
export { suggestName } from './suggest'
```

- [ ] **Step 10: Run both tests to verify they pass**

Run: `pnpm vitest run --project stepcode test/checker`
Expected: PASS — driver.test.ts (21 tests), declarations.test.ts (16 tests), plus the earlier
checker tests.

- [ ] **Step 11: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 12: Commit**

```bash
git add packages/language/src packages/language/test
git commit -m "feat(language): checker driver, declarations, assignment and user calls"
```

**Parallelism:** none — Task 5 must have landed, and Tasks 7, 8 and 9 all build on
`statements.ts`. Task 10 may start as soon as this task lands.

---

### Task 7: `Dimension`, `Constante` and `Leer`

**Files:**
- Modify: `packages/language/src/checker/statements.ts`
- Modify: `packages/language/src/checker/driver.ts` (export `checkSize`)
- Test: `packages/language/test/checker/declarations.test.ts` (new `describe` blocks)

**Interfaces:**
- Consumes: `checkSize`, `typeFromRef` from `./driver`; `fold`, `constantLookup`; `resolveWriteTarget`, `declareVariable` from Task 6.
- Produces:
  - `function checkSize(state: CheckerState, size: Expr): void` (now exported from `driver.ts`)
  - `function declareNamed(state: CheckerState, id: Identifier, kind: SymbolKind, type: Type, dimensioned: boolean): Symbol | undefined`
  - `declareVariable` keeps its signature and delegates to `declareNamed`.
  - `resolveWriteTarget` gains the constant rule (E3007).
  - `checkStatement` implements `DimensionStmt`, `ConstantStmt` and `ReadStmt` for real.

- [ ] **Step 1: Write the failing tests — append to `packages/language/test/checker/declarations.test.ts`**

```ts
describe('Dimension (§5.2)', () => {
  it('turns a declared scalar into an array of that rank', () => {
    const source = main('Definir lista Como Entero;', 'Dimension lista[5];', 'lista[1] <- 2;')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'lista[1]')).toBe('Entero')
  })

  it('sizes an unsized array of the same rank', () => {
    const source = main('Definir tabla Como Real[,];', 'Dimension tabla[3,4];', 'tabla[1,1] <- 0.5;')
    expect(checkCodes(source)).toEqual([])
  })

  it('reports a name that was never declared', () => {
    const source = main('Dimension lista[5];')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3021'])
    expect(report.texts).toEqual(['lista'])
  })

  it('does not declare in pseint mode either', () => {
    const source = ['Proceso p', '  Dimension lista[5]', 'FinProceso'].join('\n')
    expect(checkCodes(source, 'pseint')).toEqual(['E3021'])
  })

  it('refuses a second dimensioning', () => {
    const twice = main('Definir lista Como Entero;', 'Dimension lista[5];', 'Dimension lista[5];')
    expect(checkSource(twice).result.diagnostics[0]?.data.hint).toBe('again')
    const sized = main('Definir lista Como Entero[5];', 'Dimension lista[5];')
    expect(checkSource(sized).result.diagnostics[0]?.data.hint).toBe('again')
  })

  it('refuses anything that is not a variable of this body', () => {
    const parameter = [
      'SubProceso f(n Como Entero)',
      '  Dimension n[5];',
      'FinSubProceso',
      'Proceso p',
      '  f(1);',
      'FinProceso',
    ].join('\n')
    expect(checkSource(parameter).result.diagnostics[0]?.data.hint).toBe('kind')
  })

  it('refuses a rank the declaration does not have', () => {
    const source = main('Definir tabla Como Real[,];', 'Dimension tabla[3];')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3022'])
    expect(report.result.diagnostics[0]?.data).toEqual({
      name: 'tabla',
      hint: 'rank',
      expected: 2,
      found: 1,
    })
  })

  it('checks its sizes the way Definir does', () => {
    expect(checkCodes(main('Definir lista Como Entero;', 'Dimension lista[0];'))).toEqual(['E3023'])
  })
})

describe('Constante (§5.3)', () => {
  it('takes the folded value type when no type is written', () => {
    const source = main('Constante MAX <- 10;', 'Escribir MAX + 1;')
    expect(checkCodes(source)).toEqual([])
    expect(typeOfExpr(source, 'MAX + 1')).toBe('Entero')
  })

  it('takes the written type, and checks the value against it', () => {
    expect(checkCodes(main('Constante MAX Como Real <- 10;', 'Escribir MAX;'))).toEqual([])
    const bad = main('Constante MAX Como Entero <- 2.5;', 'Escribir MAX;')
    expect(checkCodes(bad)).toEqual(['E3010'])
  })

  it('refuses a value that does not fold', () => {
    const source = main('Definir n Como Entero;', 'n <- 1;', 'Constante MAX <- n;', 'Escribir MAX;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3024'])
    expect(report.texts).toEqual(['n'])
  })

  it('folds the value before the name exists', () => {
    const source = main('Constante A <- A;', 'Escribir A;')
    expect(checkCodes(source)).toEqual(['E3001'])
  })

  it('is read-only: assignment and Leer are both refused', () => {
    expect(checkCodes(main('Constante MAX <- 10;', 'MAX <- 11;'))).toEqual(['E3007'])
    expect(checkCodes(main('Constante MAX <- 10;', 'Leer MAX;'))).toEqual(['E3007'])
  })

  it('refuses a constant by reference', () => {
    const source = [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Constante MAX <- 10;',
      '  f(MAX);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3032'])
  })

  it('clashes with a variable of the same name like any other declaration', () => {
    expect(checkCodes(main('Definir MAX Como Entero;', 'Constante MAX <- 10;', 'Escribir MAX;'))).toEqual([
      'E3002',
    ])
  })
})

describe('Leer (§5.5)', () => {
  it('reads into a variable, a parameter and an array element', () => {
    expect(checkCodes(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))).toEqual([])
    expect(
      checkCodes(main('Definir lista Como Entero[3];', 'Leer lista[1];', 'Escribir lista[1];')),
    ).toEqual([])
  })

  it('reads any scalar type', () => {
    expect(
      checkCodes(main('Definir c Como Caracter;', 'Definir b Como Logico;', 'Leer c, b;', 'Escribir c, b;')),
    ).toEqual([])
  })

  it('refuses a whole array and a letter of a text', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'Leer lista;'))).toEqual(['E3009'])
    const text = main('Definir s Como Cadena;', 's <- "ab";', 'Leer s[1];')
    expect(checkCodes(text)).toEqual(['E3013'])
  })

  it('never declares, not even in pseint mode', () => {
    expect(checkCodes(main('Leer total;'))).toEqual(['E3001'])
    const lenient = ['Proceso p', '  Leer total', 'FinProceso'].join('\n')
    expect(checkCodes(lenient, 'pseint')).toEqual(['E3001'])
  })

  it('counts as giving the variable a value', () => {
    expect(checkCodes(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))).toEqual([])
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project stepcode test/checker/declarations.test.ts`
Expected: FAIL — `Dimension lista[5];` reports nothing, `Constante` declares nothing, `Leer total`
is silent.

- [ ] **Step 3: Export `checkSize` from `packages/language/src/checker/driver.ts`**

```ts
export function checkSize(state: CheckerState, size: Expr): void {
```

(the body is unchanged; only the `export` keyword is added).

- [ ] **Step 4: Generalize the declaration helper in `packages/language/src/checker/statements.ts`**

Replace `declareVariable` with the pair:

```ts
/**
 * Declares one name in the current body scope, with the clash rules of §3.2: a name already
 * in this scope is E3002 (with the `result` and `parameter` variants), a name that is also a
 * subprogram is E3004. Both keep the first symbol and carry on.
 */
export function declareNamed(
  state: CheckerState,
  id: Identifier,
  kind: SymbolKind,
  type: Type,
  dimensioned: boolean,
): Symbol | undefined {
  if (id.missing === true) return undefined
  const scope = state.frame.scope
  const existing = lookupLocal(scope, id.name)
  if (existing !== undefined) {
    const hint =
      existing.kind === 'result' ? 'result' : existing.kind === 'parameter' ? 'parameter' : undefined
    const data: DiagnosticData = hint === undefined ? { name: id.text } : { name: id.text, hint }
    report(state, 'E3002', id.span, data, [{ span: existing.declaredAt.span }])
    return existing
  }
  const clash = lookupLocal(state.programScope, id.name)
  if (clash !== undefined) {
    report(state, 'E3004', id.span, { name: id.text }, [{ span: clash.declaredAt.span }])
  }
  const symbol = createSymbol({ name: id.name, kind, type, declaredAt: id, scope })
  if (dimensioned) symbol.dimensioned = true
  declareSymbol(scope, symbol)
  state.symbols.set(id, symbol)
  return symbol
}

export function declareVariable(
  state: CheckerState,
  id: Identifier,
  type: Type,
  dimensioned: boolean,
): Symbol | undefined {
  return declareNamed(state, id, 'variable', type, dimensioned)
}
```

- [ ] **Step 5: Add the constant rule to `resolveWriteTarget`**

Right after the `subprogram` branch:

```ts
  if (existing.kind === 'constant') {
    report(state, 'E3007', target.span, { name: target.text })
    return undefined
  }
```

- [ ] **Step 6: Implement the three statements in `packages/language/src/checker/statements.ts`**

```ts
/**
 * §5.2. `Dimension` turns a declared scalar, or an unsized array of the same rank, into a
 * sized array — once. Everything else is E3022 with the variant that says why.
 */
function checkDimension(state: CheckerState, stmt: DimensionStmt): void {
  for (const item of stmt.items) {
    for (const size of item.sizes) checkSize(state, size)
    const id = item.name
    if (id.missing === true) continue
    const symbol = lookupLocal(state.frame.scope, id.name)
    if (symbol === undefined) {
      // pseint declares on assignment, never here (§5.2).
      report(state, 'E3021', id.span, { name: id.text })
      continue
    }
    state.symbols.set(id, symbol)
    if (symbol.kind !== 'variable') {
      report(state, 'E3022', id.span, { name: id.text, hint: 'kind' })
      continue
    }
    if (symbol.dimensioned === true) {
      report(state, 'E3022', id.span, { name: id.text, hint: 'again' })
      continue
    }
    const rank = item.sizes.length
    const current = symbol.type
    if (isArray(current) && current.rank !== rank) {
      report(state, 'E3022', id.span, {
        name: id.text,
        hint: 'rank',
        expected: current.rank,
        found: rank,
      })
      continue
    }
    const element = isArray(current)
      ? current.element
      : current.kind === 'scalar'
        ? current.name
        : undefined
    // An `unknown` variable stays unknown: something was already reported about it.
    if (element === undefined) continue
    symbol.type = arrayOf(element, rank)
    symbol.dimensioned = true
  }
}

/**
 * §5.3. The value is folded *before* the name is declared, so `Constante A <- A` resolves `A`
 * against what exists at that point and is E3001, not a self-reference.
 */
function checkConstant(state: CheckerState, stmt: ConstantStmt): void {
  const valueType = typeOf(state, stmt.value)
  const folded = fold(stmt.value, constantLookup(state))
  const declared = stmt.type === undefined ? undefined : typeFromRef(state, stmt.type).type
  const id = stmt.name
  if (id.missing === true) return
  if (folded === undefined && !isUnknown(valueType)) {
    report(state, 'E3024', stmt.value.span, { name: id.text })
  }
  if (declared !== undefined && folded !== undefined) {
    const failure = assignFailure(declared, constType(folded), stmt.value)
    if (failure !== undefined) {
      reportAssignFailure(state, stmt.value.span, failure, { data: { name: id.text } })
    }
  }
  const type = declared ?? (folded === undefined ? UNKNOWN : constType(folded))
  const symbol = declareNamed(state, id, 'constant', type, false)
  if (symbol !== undefined && symbol.kind === 'constant' && folded !== undefined) {
    symbol.constValue = folded
  }
}

/**
 * §5.5. Every target is a write, so the target rules of §5.4 apply — but `Leer` never
 * declares, not even in pseint mode, so the implicit-declaration door is shut.
 */
function checkRead(state: CheckerState, stmt: ReadStmt): void {
  for (const target of stmt.targets) resolveWriteTarget(state, target, UNKNOWN, false)
}
```

and replace the three placeholder cases of `checkStatement`:

```ts
    case 'DimensionStmt':
      return checkDimension(state, stmt)
    case 'ConstantStmt':
      return checkConstant(state, stmt)
    case 'ReadStmt':
      return checkRead(state, stmt)
```

New imports in `statements.ts`:

```ts
import type { ConstantStmt, DimensionStmt, ReadStmt } from '../ast/index'
import { fold } from '../types/fold'
import { arrayOf, constType } from '../types/type'
import { checkSize, typeFromRef } from './driver'
import { constantLookup } from './expressions'
import type { SymbolKind } from './scope'
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/declarations.test.ts`
Expected: PASS — the three new blocks plus everything from Task 6.

- [ ] **Step 8: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 9: Commit**

```bash
git add packages/language/src/checker packages/language/test/checker
git commit -m "feat(language): Dimension, Constante and Leer rules"
```

**Parallelism:** none against Task 8 or Task 9 — all three edit `statements.ts`. Task 10 is
independent and may run at the same time.

---

### Task 8: control flow — `Si`, `Mientras`, `Repetir`, `Segun`, `Para`, `Romper`, `Continuar`, `Esperar`

**Files:**
- Modify: `packages/language/src/checker/statements.ts`
- Test: `packages/language/test/checker/control.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces:
  - `function checkCondition(state: CheckerState, condition: Expr): void` (E3014)
  - `function checkSwitch(state: CheckerState, stmt: SwitchStmt): void` (E3028, E3029, E3030)
  - `function checkFor(state: CheckerState, stmt: ForStmt): void` (E3026, E3027, E3008)
  - `checkStatement` implements every remaining statement kind; E3031 for `Romper` and
    `Continuar` outside a loop; the `Entero` rule for `Esperar`.

- [ ] **Step 1: Write the failing test `packages/language/test/checker/control.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('conditions (§5.7)', () => {
  it('accepts a Logico condition in every conditional form', () => {
    expect(checkCodes(main('Si Verdadero Entonces', 'Escribir 1;', 'FinSi'))).toEqual([])
    expect(checkCodes(main('Mientras Falso Hacer', 'Escribir 1;', 'FinMientras'))).toEqual([])
    expect(checkCodes(main('Repetir', 'Escribir 1;', 'Hasta Que Verdadero;'))).toEqual([])
  })

  it('refuses a number as a condition, with the compare hint', () => {
    const source = main('Definir a Como Entero;', 'a <- 3;', 'Si a MOD 2 Entonces', 'Escribir 1;', 'FinSi')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3014'])
    expect(report.texts).toEqual(['a MOD 2'])
    expect(report.result.diagnostics[0]?.data.hint).toBe('compare')
  })

  it('refuses a text condition, without the compare hint', () => {
    const source = main('Definir s Como Cadena;', 's <- "a";', 'Mientras s Hacer', 'Escribir 1;', 'FinMientras')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3014'])
    expect(report.result.diagnostics[0]?.data.hint).toBeUndefined()
  })

  it('checks every branch of an Si chain', () => {
    const source = main(
      'Definir a Como Entero;',
      'a <- 1;',
      'Si Verdadero Entonces',
      'Escribir 1;',
      'SiNo Si a Entonces',
      'Escribir 2;',
      'FinSi',
    )
    expect(checkCodes(source)).toEqual(['E3014'])
  })

  it('says nothing about a condition that already failed', () => {
    const source = main('Si noExiste Entonces', 'Escribir 1;', 'FinSi')
    expect(checkCodes(source)).toEqual(['E3001'])
  })
})

describe('Segun (§5.8)', () => {
  it('switches on an Entero, a Caracter and a Cadena', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  2:',
      '    Escribir 2;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual([])
  })

  it('refuses a Real, a Logico and an array selector', () => {
    const real = main('Definir x Como Real;', 'x <- 1.5;', 'Segun x Hacer', '  1:', '    Escribir 1;', 'FinSegun')
    const report = checkSource(real)
    expect(report.codes).toEqual(['E3028'])
    expect(report.texts).toEqual(['x'])
    const logical = main('Definir b Como Logico;', 'b <- Verdadero;', 'Segun b Hacer', '  1:', '    Escribir 1;', 'FinSegun')
    expect(checkCodes(logical)).toEqual(['E3028'])
  })

  it('refuses a label that does not fold', () => {
    const source = main(
      'Definir n, m Como Entero;',
      'n <- 1;',
      'm <- 2;',
      'Segun n Hacer',
      '  m:',
      '    Escribir 1;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3029'])
  })

  it('refuses a label the selector cannot hold', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  "a":',
      '    Escribir 1;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3010'])
  })

  it('refuses a repeated label anywhere in the same Segun, pointing at the first', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1, 2:',
      '    Escribir 1;',
      '  2:',
      '    Escribir 2;',
      'FinSegun',
    )
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3030'])
    expect(report.result.diagnostics[0]?.related?.length).toBe(1)
  })

  it('compares a Caracter label with a one-character Cadena label by value', () => {
    const source = main(
      "Definir c Como Caracter;",
      "c <- 'a';",
      'Segun c Hacer',
      "  'a':",
      '    Escribir 1;',
      '  "a":',
      '    Escribir 2;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3030'])
  })

  it('checks the bodies and the otherwise branch', () => {
    const source = main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir noExiste;',
      'De Otro Modo',
      '    Escribir tampoco;',
      'FinSegun',
    )
    expect(checkCodes(source)).toEqual(['E3001', 'E3001'])
  })
})

describe('Para (§5.9)', () => {
  it('uses a declared Entero counter', () => {
    const source = main('Definir i Como Entero;', 'Para i <- 1 Hasta 10 Hacer', '  Escribir i;', 'FinPara')
    expect(checkCodes(source)).toEqual([])
  })

  it('refuses an undeclared counter in the strict profile', () => {
    const source = main('Para i <- 1 Hasta 10 Hacer', '  Escribir i;', 'FinPara')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3001'])
    expect(report.result.diagnostics[0]?.data.hint).toBe('declare')
  })

  it('declares the counter in pseint mode', () => {
    const source = ['Proceso p', '  Para i <- 1 Hasta 10 Hacer', '    Escribir i', '  FinPara', 'FinProceso'].join(
      '\n',
    )
    expect(checkCodes(source, 'pseint')).toEqual([])
  })

  it('refuses a counter that is not an Entero', () => {
    const source = main('Definir x Como Real;', 'Para x <- 1 Hasta 10 Hacer', '  Escribir x;', 'FinPara')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3026'])
    expect(report.texts).toEqual(['x'])
  })

  it('makes the counter read-only inside the loop and ordinary after it', () => {
    const inside = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  i <- 3;',
      'FinPara',
    )
    expect(checkCodes(inside)).toEqual(['E3008'])
    const read = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  Leer i;',
      'FinPara',
    )
    expect(checkCodes(read)).toEqual(['E3008'])
    const byRef = [
      'SubProceso doble(x Por Referencia Como Entero)',
      '  x <- x * 2;',
      'FinSubProceso',
      'Proceso p',
      '  Definir i Como Entero;',
      '  Para i <- 1 Hasta 10 Hacer',
      '    doble(i);',
      '  FinPara',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(byRef)).toEqual(['E3008'])
    const after = main(
      'Definir i Como Entero;',
      'Para i <- 1 Hasta 10 Hacer',
      '  Escribir i;',
      'FinPara',
      'i <- 3;',
    )
    expect(checkCodes(after)).toEqual([])
  })

  it('requires Entero bounds and a non-zero step', () => {
    expect(
      checkCodes(main('Definir i Como Entero;', 'Para i <- 1 Hasta 2.5 Hacer', '  Escribir i;', 'FinPara')),
    ).toEqual(['E3010'])
    expect(
      checkCodes(
        main('Definir i Como Entero;', 'Para i <- 1 Hasta 10 Con Paso 0 Hacer', '  Escribir i;', 'FinPara'),
      ),
    ).toEqual(['E3027'])
    expect(
      checkCodes(
        main('Definir i Como Entero;', 'Para i <- 10 Hasta 1 Con Paso -1 Hacer', '  Escribir i;', 'FinPara'),
      ),
    ).toEqual([])
  })
})

describe('Romper, Continuar (§5.10)', () => {
  it('accepts them inside any loop of this body', () => {
    expect(
      checkCodes(main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras')),
    ).toEqual([])
    expect(
      checkCodes(
        main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Continuar;', 'FinPara'),
      ),
    ).toEqual([])
    expect(checkCodes(main('Repetir', '  Romper;', 'Hasta Que Verdadero;'))).toEqual([])
  })

  it('refuses them outside a loop', () => {
    const source = main('Romper;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['E3031'])
    expect(report.result.diagnostics[0]?.data.kw).toBe('break')
    expect(checkCodes(main('Continuar;'))).toEqual(['E3031'])
  })

  it('does not count a loop in the caller', () => {
    const source = [
      'SubProceso f()',
      '  Romper;',
      'FinSubProceso',
      'Proceso p',
      '  Mientras Verdadero Hacer',
      '    f();',
      '  FinMientras',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual(['E3031'])
  })
})

describe('Esperar (§5.13)', () => {
  it('takes an Entero and refuses anything else', () => {
    expect(checkCodes(main('Esperar 100 Milisegundos;'))).toEqual([])
    const source = main('Esperar 2.5 Milisegundos;')
    expect(checkSource(source).diagnostics).toEqual([`E3010@${spanOf(source, '2.5')}`])
  })
})
```

The `Esperar … Milisegundos` spelling above is whatever the `es` profile's `wait` keyword and
unit words accept; use the form `packages/language/test/parser/statements-simple.test.ts`
already parses.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/control.test.ts`
Expected: FAIL — conditions, `Segun`, `Para`, `Romper` and `Esperar` all report nothing.

- [ ] **Step 3: Implement the rules in `packages/language/src/checker/statements.ts`**

```ts
/** §5.7. The condition must be `Logico`; a numeric one gets the "compare explicitly" hint. */
function checkCondition(state: CheckerState, condition: Expr): void {
  const type = typeOf(state, condition)
  if (isUnknown(type)) return
  if (type.kind === 'scalar' && type.name === 'boolean') return
  const data: DiagnosticData = { found: typeToString(type, state.profile) }
  if (isNumeric(type)) data.hint = 'compare'
  report(state, 'E3014', condition.span, data)
}

/** A label's identity for the duplicate check: text compares by value, so `'a'` meets `"a"`. */
function labelKey(value: ConstValue): string {
  if (typeof value.value === 'string') return `t:${value.value}`
  if (typeof value.value === 'boolean') return `b:${String(value.value)}`
  return `n:${String(value.value)}`
}

/** §5.8. */
function checkSwitch(state: CheckerState, stmt: SwitchStmt): void {
  const selector = typeOf(state, stmt.selector)
  const switchable =
    isUnknown(selector) ||
    (selector.kind === 'scalar' &&
      (selector.name === 'integer' || selector.name === 'char' || selector.name === 'string'))
  if (!switchable) {
    report(state, 'E3028', stmt.selector.span, { found: typeToString(selector, state.profile) })
  }
  const seen = new Map<string, Span>()
  for (const entry of stmt.cases) {
    for (const value of entry.values) {
      const type = typeOf(state, value)
      const folded = fold(value, constantLookup(state))
      if (folded === undefined) {
        if (!isUnknown(type)) report(state, 'E3029', value.span)
        continue
      }
      if (switchable && !isUnknown(selector)) {
        const failure = assignFailure(selector, constType(folded), value)
        if (failure !== undefined) {
          reportAssignFailure(state, value.span, failure)
          continue
        }
      }
      const key = labelKey(folded)
      const first = seen.get(key)
      if (first !== undefined) {
        report(state, 'E3030', value.span, { value: String(folded.value) }, [{ span: first }])
        continue
      }
      seen.set(key, value.span)
    }
    checkStatements(state, entry.body)
  }
  if (stmt.otherwise !== undefined) checkStatements(state, stmt.otherwise)
}

/** An `Entero` bound or step, reported the way an assignment to an `Entero` would be. */
function checkIntegerBound(state: CheckerState, expr: Expr): void {
  const type = typeOf(state, expr)
  const failure = assignFailure(INTEGER, type, expr)
  if (failure !== undefined) reportAssignFailure(state, expr.span, failure)
}

/**
 * §5.9. Strict mode wants a declared `Entero`; pseint declares a `counter` at the loop. Either
 * way the symbol is read-only for the length of the body, and an ordinary variable after it.
 */
function checkFor(state: CheckerState, stmt: ForStmt): void {
  checkIntegerBound(state, stmt.from)
  checkIntegerBound(state, stmt.to)
  if (stmt.step !== undefined) {
    checkIntegerBound(state, stmt.step)
    const step = fold(stmt.step, constantLookup(state))
    if (step !== undefined && typeof step.value === 'number' && step.value === 0) {
      report(state, 'E3027', stmt.step.span)
    }
  }
  const counter = stmt.counter
  let symbol = counter.missing === true ? undefined : resolveIdentifier(state, counter)
  if (symbol === undefined && counter.missing !== true) {
    if (state.profile.options.implicitDeclarations) {
      // pseint declares the counter at the loop, `Entero` by construction (§5.9).
      symbol = declareNamed(state, counter, 'counter', INTEGER, false)
    } else {
      reportUnknownName(state, counter, 'declare')
      symbol = declareRecovered(state, counter)
    }
  }
  if (symbol === undefined) {
    // A `missing` counter: the parser already reported it, and it is never a symbol.
    setType(state, counter, UNKNOWN)
  } else {
    setType(state, counter, symbol.type)
    symbol.writes++
    if (!isUnknown(symbol.type) && !(symbol.type.kind === 'scalar' && symbol.type.name === 'integer')) {
      report(state, 'E3026', counter.span, {
        name: counter.text,
        found: typeToString(symbol.type, state.profile),
      })
    }
  }
  const wasCounting = symbol?.counting
  if (symbol !== undefined) symbol.counting = true
  state.frame.loopDepth++
  checkStatements(state, stmt.body)
  state.frame.loopDepth--
  // After the loop the counter is an ordinary variable again, holding whatever was left.
  if (symbol !== undefined) symbol.counting = wasCounting === true
}
```

Replace the corresponding `checkStatement` cases:

```ts
    case 'WaitStmt':
      return checkIntegerBound(state, stmt.millis)
    case 'BreakStmt':
    case 'ContinueStmt': {
      if (state.frame.loopDepth > 0) return
      report(state, 'E3031', stmt.span, { kw: stmt.kind === 'BreakStmt' ? 'break' : 'continue' })
      return
    }
    case 'IfStmt': {
      for (const branch of stmt.branches) {
        checkCondition(state, branch.condition)
        checkStatements(state, branch.body)
      }
      if (stmt.elseBody !== undefined) checkStatements(state, stmt.elseBody)
      return
    }
    case 'WhileStmt': {
      checkCondition(state, stmt.condition)
      state.frame.loopDepth++
      checkStatements(state, stmt.body)
      state.frame.loopDepth--
      return
    }
    case 'RepeatStmt': {
      state.frame.loopDepth++
      checkStatements(state, stmt.body)
      state.frame.loopDepth--
      checkCondition(state, stmt.condition)
      return
    }
    case 'SwitchStmt':
      return checkSwitch(state, stmt)
    case 'ForStmt':
      return checkFor(state, stmt)
```

and add the counter rule to `resolveWriteTarget`, right after the constant branch:

```ts
  if (existing.counting === true) {
    report(state, 'E3008', target.span, { name: target.text })
    return undefined
  }
```

New imports in `statements.ts`:

```ts
import type { Expr, ForStmt, SwitchStmt } from '../ast/index'
import type { Span } from '../source/index'
import type { ConstValue } from '../types/type'
import { INTEGER, isNumeric, typeToString } from '../types/type'
import { declareRecovered, reportUnknownName, resolveIdentifier } from './expressions'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/control.test.ts`
Expected: PASS, 19 tests.

- [ ] **Step 5: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add packages/language/src/checker/statements.ts packages/language/test/checker/control.test.ts
git commit -m "feat(language): control-flow rules, Segun labels and Para counters"
```

**Parallelism:** none against Task 7 or Task 9 — same file. Task 10 is independent.

---

### Task 9: `checker/flow.ts` — the four warnings

**Files:**
- Create: `packages/language/src/checker/flow.ts`
- Modify: `packages/language/src/checker/statements.ts` (`checkStatements` calls `reportUnreachable`)
- Modify: `packages/language/src/checker/driver.ts` (each body reports its warnings when it is done)
- Modify: `packages/language/src/checker/index.ts` (export the two functions)
- Test: `packages/language/test/checker/flow.test.ts`

**Interfaces:**
- Consumes: `CheckerState`, `report`, `BodyState` from `./result`; `Scope` from `./scope`; `isArray` from `../types/type`.
- Produces:
  - `function reportUnreachable(state: CheckerState, stmts: readonly Stmt[]): void`
  - `function reportBodyWarnings(state: CheckerState, scope: Scope, decl: SubprogramDecl | null, body: BodyState | undefined): void`

- [ ] **Step 1: Write the failing test `packages/language/test/checker/flow.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { checkCodes, checkSource, spanOf } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

describe('W3001 unreachable code', () => {
  it('warns once, from the statement after the jump to the end of the list', () => {
    const source = [
      'Funcion r <- f() Como Entero',
      '  Retornar 1;',
      '  Escribir 2;',
      '  Escribir 3;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['W3001'])
    expect(report.texts).toEqual(['Escribir 2;\n  Escribir 3;'])
  })

  it('warns after Romper and after Continuar too', () => {
    const broken = main('Mientras Verdadero Hacer', '  Romper;', '  Escribir 1;', 'FinMientras')
    expect(checkCodes(broken)).toEqual(['W3001'])
    const continued = main('Mientras Verdadero Hacer', '  Continuar;', '  Escribir 1;', 'FinMientras')
    expect(checkCodes(continued)).toEqual(['W3001'])
  })

  it('says nothing when the jump is the last statement of its list', () => {
    const source = main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras')
    expect(checkCodes(source)).toEqual([])
  })

  it('looks at each list separately, so a jump in a branch ends only that branch', () => {
    const source = main(
      'Si Verdadero Entonces',
      '  Mientras Verdadero Hacer',
      '    Romper;',
      '  FinMientras',
      'FinSi',
      'Escribir 1;',
    )
    expect(checkCodes(source)).toEqual([])
  })
})

describe('W3002 declared but never read', () => {
  it('warns at the declaration', () => {
    const source = main('Definir a Como Entero;', 'a <- 1;')
    const report = checkSource(source)
    expect(report.codes).toEqual(['W3002'])
    expect(report.diagnostics).toEqual([`W3002@${spanOf(source, 'a Como Entero').slice(0, -12)}`])
  })

  it('warns for a variable that is never touched at all', () => {
    expect(checkCodes(main('Definir a Como Entero;'))).toEqual(['W3002'])
  })

  it('exempts parameters, constants, counters and result variables', () => {
    const parameters = [
      'SubProceso f(n Como Entero)',
      '  Escribir 1;',
      'FinSubProceso',
      'Proceso p',
      '  f(1);',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(parameters)).toEqual([])
    expect(checkCodes(main('Constante MAX <- 10;'))).toEqual([])
    const counter = main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir 1;', 'FinPara')
    expect(checkCodes(counter)).toEqual([])
    const result = [
      'Funcion r <- f() Como Entero',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(result)).toEqual([])
  })

  it('says nothing about a name that was already reported as undeclared', () => {
    expect(checkCodes(main('Escribir noExiste;'))).toEqual(['E3001'])
  })
})

describe('W3003 read but never assigned', () => {
  it('warns at the declaration of a variable that is only read', () => {
    const source = main('Definir a Como Entero;', 'Escribir a;')
    expect(checkCodes(source)).toEqual(['W3003'])
  })

  it('counts Leer, Para, assignment and a by-reference argument as giving a value', () => {
    expect(checkCodes(main('Definir a Como Entero;', 'Leer a;', 'Escribir a;'))).toEqual([])
    expect(
      checkCodes(main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara')),
    ).toEqual([])
    const byRef = [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Definir a Como Entero;',
      '  f(a);',
      '  Escribir a;',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(byRef)).toEqual([])
  })

  it('exempts arrays, which Dimension and a sized declaration initialize', () => {
    expect(checkCodes(main('Definir lista Como Entero[3];', 'Escribir lista[1];'))).toEqual([])
    expect(
      checkCodes(main('Definir lista Como Entero;', 'Dimension lista[3];', 'Escribir lista[1];')),
    ).toEqual([])
  })

  it('gives one warning per variable, never both', () => {
    expect(checkCodes(main('Definir a Como Entero;'))).toEqual(['W3002'])
  })
})

describe('W3004 function result never assigned', () => {
  it('warns at the function name', () => {
    const source = [
      'Funcion r <- f() Como Entero',
      '  Escribir 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    const report = checkSource(source)
    expect(report.codes).toEqual(['W3004'])
    expect(report.texts).toEqual(['f'])
  })

  it('is satisfied by an assignment or by a Retornar', () => {
    const assigned = [
      'Funcion r <- f() Como Entero',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(assigned)).toEqual([])
    const returned = [
      'Funcion f() Como Entero',
      '  Retornar 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(returned)).toEqual([])
  })

  it('says nothing about a procedure', () => {
    const source = [
      'SubProceso f()',
      '  Escribir 1;',
      'FinSubProceso',
      'Proceso p',
      '  f();',
      'FinProceso',
    ].join('\n')
    expect(checkCodes(source)).toEqual([])
  })
})
```

The `Funcion f() Como Entero` header above is the form the parser accepts for a function with a
return type and no result variable; if `packages/language/test/parser/program.test.ts` spells it
`Funcion f(): Entero`, use that instead — the rule under test is that `Retornar` counts as
assigning the result.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/flow.test.ts`
Expected: FAIL — no warning is produced at all.

- [ ] **Step 3: Write `packages/language/src/checker/flow.ts`**

```ts
import type { Stmt, SubprogramDecl } from '../ast/index'
import { isArray } from '../types/type'
import { type BodyState, type CheckerState, report } from './result'
import type { Scope } from './scope'

/** The statements after which nothing in the same list can run. */
const JUMPS: ReadonlySet<Stmt['kind']> = new Set<Stmt['kind']>([
  'ReturnStmt',
  'BreakStmt',
  'ContinueStmt',
])

/**
 * W3001, the one flow-sensitive check (§9): in any statement list, everything after the first
 * jump is dead. One warning per list, spanning from that statement to the end of the list —
 * not one per statement, which would bury the reader in repetitions of the same fact.
 */
export function reportUnreachable(state: CheckerState, stmts: readonly Stmt[]): void {
  for (let index = 0; index < stmts.length - 1; index++) {
    const stmt = stmts[index]
    if (stmt === undefined || !JUMPS.has(stmt.kind)) continue
    const first = stmts[index + 1]
    const last = stmts[stmts.length - 1]
    if (first === undefined || last === undefined) return
    report(state, 'W3001', { start: first.span.start, end: last.span.end })
    return
  }
}

/**
 * W3002–W3004 (§9), flow-insensitive, one pass per body in declaration order so the output is
 * stable. Parameters, constants, counters and result variables are exempt from W3002 and
 * W3003 by construction: only `variable` symbols are considered. A symbol the checker created
 * to recover from E3001 is exempt from everything — its one mistake is already reported.
 */
export function reportBodyWarnings(
  state: CheckerState,
  scope: Scope,
  decl: SubprogramDecl | null,
  body: BodyState | undefined,
): void {
  for (const symbol of scope.order) {
    if (symbol.recovered === true || symbol.kind !== 'variable') continue
    if (symbol.reads === 0) {
      // Written but never read is still "never read": the value goes nowhere.
      report(state, 'W3002', symbol.declaredAt.span, { name: symbol.name })
      continue
    }
    // An array is initialized by its `Dimension` or its sized declaration, so it is exempt.
    if (symbol.writes === 0 && !isArray(symbol.type)) {
      report(state, 'W3003', symbol.declaredAt.span, { name: symbol.name })
    }
  }
  if (decl === null || decl.form !== 'function' || body === undefined) return
  if (body.resultWrites === 0) {
    report(state, 'W3004', decl.name.span, { name: decl.name.text })
  }
}
```

- [ ] **Step 4: Call `reportUnreachable` from every statement list**

In `packages/language/src/checker/statements.ts`:

```ts
export function checkStatements(state: CheckerState, stmts: readonly Stmt[]): void {
  for (const stmt of stmts) checkStatement(state, stmt)
  reportUnreachable(state, stmts)
}
```

with `import { reportUnreachable } from './flow'`.

- [ ] **Step 5: Report the per-body warnings from `driver.ts`**

In `checkMain`:

```ts
  checkStatements(state, block.body)
  reportBodyWarnings(state, scope, null, undefined)
  state.frame = previous
```

and in `ensureChecked`, after the body is checked:

```ts
  checkStatements(state, decl.body)
  reportBodyWarnings(state, body.scope, decl, body)
  state.frame = previous
```

with `import { reportBodyWarnings } from './flow'`.

- [ ] **Step 6: Export the two functions from `packages/language/src/checker/index.ts`**

```ts
export { reportBodyWarnings, reportUnreachable } from './flow'
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/flow.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 8: Run the whole checker suite — the warnings are new noise for older tests**

Run: `pnpm vitest run --project stepcode test/checker`
Expected: PASS. Some Task 6–8 cases now also produce W3002/W3003 (a variable declared for one
assignment and never read). Where that happens, fix the *test program*, not the checker: add
the `Escribir` that reads the variable, exactly as the tests written above already do. Do not
weaken a warning to keep an old case quiet.

- [ ] **Step 9: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean.

- [ ] **Step 10: Commit**

```bash
git add packages/language/src/checker packages/language/test/checker
git commit -m "feat(language): unreachable, unused and unassigned warnings"
```

**Parallelism:** none against Tasks 7 and 8 — same file, and the write counts they add are what
W3003 reads. Task 10 is independent.

---

### Task 10: `compile.ts`, the public API and the ordering rule

**Files:**
- Create: `packages/language/src/compile.ts`
- Modify: `packages/language/src/diagnostics/index.ts` (export `sortDiagnostics`)
- Modify: `packages/language/src/index.ts`
- Modify: `packages/language/test/index.test.ts`
- Test: `packages/language/test/checker/compile.test.ts`

**Interfaces:**
- Consumes: `parse`, `check`, `sortDiagnostics`.
- Produces:
  - `interface CompileResult { readonly ast: Program; readonly diagnostics: readonly Diagnostic[] }`
  - `function compile(source: string, options: { profile: ResolvedProfile }): CompileResult`
  - The package's public surface: `check`, `compile`, `Type`, `Symbol`, `Scope`, `CheckResult`, `CompileResult`, `typeToString`, `BINARY_TABLE`, `UNARY_TABLE`, `BUILTIN_SIGNATURES`, `assignable`, `fold`.

- [ ] **Step 1: Write the failing test `packages/language/test/checker/compile.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { createDiagnostic, type Diagnostic, sortDiagnostics } from '../../src/diagnostics/index'

const codesOf = (source: string): string[] =>
  compile(source, { profile: profiles.es }).diagnostics.map((one) => one.code)

describe('compile', () => {
  it('parses and checks a clean program', () => {
    const source = ['Proceso p', '  Escribir 1;', 'FinProceso'].join('\n')
    const result = compile(source, { profile: profiles.es })
    expect(result.diagnostics).toEqual([])
    expect(result.ast.main?.name.name).toBe('p')
  })

  it('checks even when the parser reported errors', () => {
    const source = ['Proceso p', '  Escribir noExiste', 'FinProceso'].join('\n')
    // E2001 (missing `;`) from the parser, E3001 from the checker, both present.
    expect(codesOf(source)).toEqual(['E3001', 'E2001'])
  })

  it('sorts by position, then severity, then code', () => {
    const source = [
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- "hola";',
      '  Escribir noExiste;',
      'FinProceso',
    ].join('\n')
    const diagnostics = compile(source, { profile: profiles.es }).diagnostics
    const positions = diagnostics.map((one) => one.span.start)
    expect([...positions].sort((left, right) => left - right)).toEqual(positions)
  })

  it('lets a parser diagnostic win a tie with a checker one', () => {
    // Both would sit at the same offset; the parser's was concatenated first, and the sort
    // is stable, so it comes first.
    const source = ['Proceso p', '  Escribir 1', 'FinProceso'].join('\n')
    const diagnostics = compile(source, { profile: profiles.es }).diagnostics
    expect(diagnostics.map((one) => one.code)).toEqual(['E2001'])
  })

  it('says nothing about the placeholders of a broken tree', () => {
    const source = ['Proceso p', '  Definir Como Entero;', 'FinProceso'].join('\n')
    const codes = codesOf(source)
    expect(codes.every((code) => code.startsWith('E2'))).toBe(true)
  })

})

describe('sortDiagnostics', () => {
  const at = (code: 'E3001' | 'W3002' | 'E3010', start: number): Diagnostic =>
    createDiagnostic(code, { start, end: start + 1 })

  it('collapses two diagnostics with the same code and span into one', () => {
    expect(sortDiagnostics([at('E3001', 4), at('E3001', 4)])).toHaveLength(1)
  })

  it('keeps two different codes at the same span, in code order', () => {
    const sorted = sortDiagnostics([at('E3010', 4), at('E3001', 4)])
    expect(sorted.map((one) => one.code)).toEqual(['E3001', 'E3010'])
  })

  it('puts an error before a warning at the same offset', () => {
    const sorted = sortDiagnostics([at('W3002', 4), at('E3010', 4)])
    expect(sorted.map((one) => one.code)).toEqual(['E3010', 'W3002'])
  })

  it('orders by position before anything else', () => {
    const sorted = sortDiagnostics([at('E3001', 9), at('W3002', 2)])
    expect(sorted.map((one) => one.span.start)).toEqual([2, 9])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/compile.test.ts`
Expected: FAIL — cannot resolve `../../src/compile`.

- [ ] **Step 3: Write `packages/language/src/compile.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from './ast/index'
import { check } from './checker/index'
import type { Diagnostic } from './diagnostics/index'
import { sortDiagnostics } from './diagnostics/sort'
import { parse } from './parser/index'

export interface CompileResult {
  readonly ast: Program
  readonly diagnostics: readonly Diagnostic[]
}

/**
 * Parse, then check — always both, even when the parser reported errors: an editor wants the
 * two kinds of diagnostic at once, and the checker is silent on the placeholders a broken
 * parse leaves behind (§2). Parser diagnostics are concatenated first, so at the same
 * position, severity and code the parser's is the one that survives deduplication (§7.2).
 */
export function compile(source: string, options: { profile: ResolvedProfile }): CompileResult {
  const parsed = parse(source, { profile: options.profile })
  const checked = check(parsed.program, { profile: options.profile })
  return {
    ast: parsed.program,
    diagnostics: sortDiagnostics([...parsed.diagnostics, ...checked.diagnostics]),
  }
}
```

- [ ] **Step 4: Export `sortDiagnostics` from `packages/language/src/diagnostics/index.ts`**

```ts
export { sortDiagnostics } from './sort'
```

- [ ] **Step 5: Run the compile test to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker/compile.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 6: Update the failing public-API test `packages/language/test/index.test.ts`**

Add to the existing import list and add two tests:

```ts
import {
  BUILTIN_SIGNATURES,
  check,
  compile,
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  LineMap,
  packageName,
  parse,
  registerCatalog,
  tokenize,
  typeToString,
  walk,
} from '../src/index'
```

```ts
  it('exports the checker and the one-call pipeline', () => {
    expect(typeof check).toBe('function')
    expect(typeof compile).toBe('function')
    expect(typeof typeToString).toBe('function')
    expect(BUILTIN_SIGNATURES.length.result).toEqual({ kind: 'scalar', name: 'integer' })
    expect(DIAGNOSTIC_SEVERITY.W3002).toBe('warning')
  })

  it('compiles a program end to end and hands back the side tables', () => {
    const source = [
      'Proceso saluda',
      '  Definir nombre Como Cadena;',
      '  nombre <- "hola";',
      '  Escribir nombre;',
      'FinProceso',
    ].join('\n')
    const { ast, diagnostics } = compile(source, { profile: profiles.es })
    expect(diagnostics).toEqual([])
    const result = check(ast, { profile: profiles.es })
    expect(result.scopes.length).toBe(2)
    expect([...(result.scopes[1]?.symbols.keys() ?? [])]).toEqual(['nombre'])
  })

  it('reports a checker mistake in both locales from the same data', () => {
    const source = ['Proceso p', '  Definir n Como Entero;', '  n <- 2.5;', '  Escribir n;', 'FinProceso'].join(
      '\n',
    )
    const { diagnostics } = compile(source, { profile: profiles.es })
    const first = diagnostics[0]
    expect(first?.code).toBe('E3010')
    expect(formatDiagnostic(first!, 'es', profiles.es)).toContain('Entero')
    expect(formatDiagnostic(first!, 'en', profiles.en)).toContain('Integer')
  })
```

- [ ] **Step 7: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/index.test.ts`
Expected: FAIL — `../src/index` exports neither `check` nor `compile`.

- [ ] **Step 8: Extend `packages/language/src/index.ts`**

Insert, keeping the file's alphabetical export order (Biome's organizer will settle it):

```ts
export type { BodyState, CheckerState, CheckResult, Scope, Symbol, SymbolKind } from './checker/index'
export { check, createScope, createSymbol, declareSymbol, lookup, suggestName } from './checker/index'
export type { CompileResult } from './compile'
export { compile } from './compile'
export { sortDiagnostics } from './diagnostics/index'
export type {
  ArrayType,
  AssignFailure,
  BinaryRule,
  BuiltinSignature,
  ConstValue,
  Expected,
  OperandClass,
  ScalarType,
  Type,
  UnknownType,
} from './types/index'
```

There is no `types/index.ts`, so the type exports come from their own modules:

```ts
export type { AssignFailure, AssignHint } from './types/assign'
export { assignable, assignFailure } from './types/assign'
export type { BuiltinSignature } from './types/builtins'
export { builtinResult, BUILTIN_SIGNATURES } from './types/builtins'
export type { ConstantLookup } from './types/fold'
export { fold } from './types/fold'
export type { BinaryRule, OperandError, OperatorCheck } from './types/operators'
export {
  accepts,
  BINARY_TABLE,
  checkBinary,
  checkUnary,
  comparable,
  operatorSpelling,
  UNARY_TABLE,
} from './types/operators'
export type {
  ArrayType,
  ConstValue,
  Expected,
  OperandClass,
  ScalarType,
  Type,
  UnknownType,
} from './types/type'
export {
  arrayOf,
  BOOLEAN,
  CHAR,
  classToString,
  constType,
  expectedToString,
  INTEGER,
  isArray,
  isNumeric,
  isScalar,
  isText,
  isUnknown,
  REAL,
  sameType,
  scalar,
  STRING,
  typeToString,
  UNKNOWN,
} from './types/type'
```

(use this second block; the first is what it replaces.)

- [ ] **Step 9: Run the public-API test to verify it passes**

Run: `pnpm vitest run --project stepcode test/index.test.ts`
Expected: PASS.

- [ ] **Step 10: Run lint, typecheck, build and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
pnpm --filter stepcode build
```

Expected: all clean; the build emits `dist/index.js` and `dist/index.d.ts`.

- [ ] **Step 11: Commit**

```bash
git add packages/language/src packages/language/test
git commit -m "feat(language): compile(), diagnostic ordering and the public checker API"
```

**Parallelism:** may run in parallel with Tasks 7, 8 and 9 — it touches `compile.ts`,
`diagnostics/`, `src/index.ts` and `test/index.test.ts`, none of which those tasks edit. The
`Symbol` export shadows the global `Symbol` type inside modules that import it; that is
deliberate and matches the spec's public surface.

---

### Task 11: the corpus, the code-by-code suite, the one-mistake property and the side tables

**Files:**
- Create: `packages/language/test/checker/by-code.test.ts`
- Create: `packages/language/test/checker/one-mistake.test.ts`
- Create: `packages/language/test/checker/side-tables.test.ts`
- Create: `packages/language/test/corpus/check.test.ts`
- Modify: `packages/language/test/corpus/programs/*.stepcode` (the minimal rewrites)
- Modify: `packages/language/test/corpus/programs/README.md`
- Modify: `packages/language/test/corpus/README.md` (one pointer line)

**Interfaces:**
- Consumes: `checkSource`, `checkCodes`, `profileNamed` from `test/helpers.ts`; `compile`; `check`; `DIAGNOSTIC_CODES`; `formatDiagnostic`.
- Produces: no source-code interface — this task is the evidence that the previous ten are right.

- [ ] **Step 1: Write the failing code-by-code suite `packages/language/test/checker/by-code.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES } from '../../src/diagnostics/index'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { checkSource, type ProfileName } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

interface Case {
  readonly code: string
  /** A program that triggers the code exactly once. */
  readonly source: string
  /** The source text the diagnostic must cover. */
  readonly text: string
  /** A neighbouring program that must not trigger it. */
  readonly clean: string
  readonly profile?: ProfileName
}

const withF = (header: string, body: string, call: string): string =>
  [header, `  ${body}`, 'FinSubProceso', 'Proceso p', `  ${call}`, 'FinProceso'].join('\n')

const cases: Case[] = [
  {
    code: 'E3001',
    source: main('Escribir noExiste;'),
    text: 'noExiste',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'E3002',
    source: main('Definir a Como Entero;', 'Definir a Como Real;', 'a <- 1;', 'Escribir a;'),
    text: 'a',
    clean: main('Definir a, b Como Entero;', 'a <- 1;', 'b <- 2;', 'Escribir a, b;'),
  },
  {
    code: 'E3003',
    source: main('Escribir a;', 'Definir a Como Entero;', 'a <- 1;'),
    text: 'a',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'E3004',
    source: [
      'SubProceso f()',
      'FinSubProceso',
      'Proceso p',
      '  Definir f Como Entero;',
      '  f <- 1;',
      '  Escribir f;',
      'FinProceso',
    ].join('\n'),
    text: 'f',
    clean: ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  f();', 'FinProceso'].join('\n'),
  },
  {
    code: 'E3005',
    source: ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  Escribir f;', 'FinProceso'].join('\n'),
    text: 'f',
    clean: ['SubProceso f()', 'FinSubProceso', 'Proceso p', '  f();', 'FinProceso'].join('\n'),
  },
  {
    code: 'E3006',
    source: main('Definir a Como Entero;', 'a <- 1;', 'a(2);'),
    text: 'a',
    clean: ['SubProceso a(n Como Entero)', '  Escribir n;', 'FinSubProceso', 'Proceso p', '  a(2);', 'FinProceso'].join(
      '\n',
    ),
  },
  {
    code: 'E3007',
    source: main('Constante MAX <- 10;', 'MAX <- 11;'),
    text: 'MAX',
    clean: main('Constante MAX <- 10;', 'Escribir MAX;'),
  },
  {
    code: 'E3008',
    source: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  i <- 9;', 'FinPara'),
    text: 'i',
    clean: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
  },
  {
    code: 'E3009',
    source: main('Definir lista Como Entero[3];', 'Escribir lista;'),
    text: 'lista',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[1];'),
  },
  {
    code: 'E3010',
    source: main('Definir n Como Entero;', 'n <- 2.5;', 'Escribir n;'),
    text: '2.5',
    clean: main('Definir x Como Real;', 'x <- 2.5;', 'Escribir x;'),
  },
  {
    code: 'E3011',
    source: main('Definir c Como Caracter;', 'c <- "ab";', 'Escribir c;'),
    text: '"ab"',
    clean: main('Definir c Como Caracter;', 'c <- "a";', 'Escribir c;'),
  },
  {
    code: 'E3012',
    source: main('Escribir 1 + Verdadero;'),
    text: 'Verdadero',
    clean: main('Escribir 1 + 2;'),
  },
  {
    code: 'E3013',
    source: main('Definir s Como Cadena;', 's <- "ab";', "s[1] <- 'z';"),
    text: 's[1]',
    clean: main('Definir lista Como Entero[3];', 'lista[1] <- 9;', 'Escribir lista[1];'),
  },
  {
    code: 'E3014',
    source: main('Si 1 Entonces', '  Escribir 1;', 'FinSi'),
    text: '1',
    clean: main('Si Verdadero Entonces', '  Escribir 1;', 'FinSi'),
  },
  {
    code: 'E3015',
    profile: 'pseint',
    source: [
      'SubProceso f(n)',
      '  g(n)',
      'FinSubProceso',
      'SubProceso g(m)',
      '  f(m)',
      'FinSubProceso',
      'Proceso p',
      '  f(1)',
      'FinProceso',
    ].join('\n'),
    text: 'n',
    clean: ['SubProceso f(n)', '  Escribir n', 'FinSubProceso', 'Proceso p', '  f(1)', 'FinProceso'].join('\n'),
  },
  {
    code: 'E3016',
    source: main('Definir lista Como Entero[3];', 'Escribir lista[1,2];'),
    text: 'lista[1,2]',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[1];'),
  },
  {
    code: 'E3017',
    source: main('Definir lista Como Entero[3];', 'Escribir lista[2.5];'),
    text: '2.5',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[2];'),
  },
  {
    code: 'E3020',
    source: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'Escribir f(1);'),
    text: 'f',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3021',
    source: main('Dimension lista[5];'),
    text: 'lista',
    clean: main('Definir lista Como Entero;', 'Dimension lista[5];', 'Escribir lista[1];'),
  },
  {
    code: 'E3022',
    source: main('Definir lista Como Entero;', 'Dimension lista[5];', 'Dimension lista[5];', 'Escribir lista[1];'),
    text: 'lista',
    clean: main('Definir lista Como Entero;', 'Dimension lista[5];', 'Escribir lista[1];'),
  },
  {
    code: 'E3023',
    source: main('Definir lista Como Entero[0];', 'Escribir lista[1];'),
    text: '0',
    clean: main('Definir lista Como Entero[3];', 'Escribir lista[1];'),
  },
  {
    code: 'E3024',
    source: main('Definir n Como Entero;', 'n <- 1;', 'Constante MAX <- n;', 'Escribir MAX;'),
    text: 'n',
    clean: main('Constante MAX <- 10;', 'Escribir MAX;'),
  },
  {
    code: 'E3025',
    source: main('Escribir 1 / 0;'),
    text: '0',
    clean: main('Escribir 1 / 2;'),
  },
  {
    code: 'E3026',
    source: main('Definir x Como Real;', 'Para x <- 1 Hasta 3 Hacer', '  Escribir x;', 'FinPara'),
    text: 'x',
    clean: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
  },
  {
    code: 'E3027',
    source: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Con Paso 0 Hacer', '  Escribir i;', 'FinPara'),
    text: '0',
    clean: main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Con Paso 2 Hacer', '  Escribir i;', 'FinPara'),
  },
  {
    code: 'E3028',
    source: main('Definir x Como Real;', 'x <- 1.5;', 'Segun x Hacer', '  1:', '    Escribir 1;', 'FinSegun'),
    text: 'x',
    clean: main('Definir n Como Entero;', 'n <- 1;', 'Segun n Hacer', '  1:', '    Escribir 1;', 'FinSegun'),
  },
  {
    code: 'E3029',
    source: main(
      'Definir n, m Como Entero;',
      'n <- 1;',
      'm <- 2;',
      'Segun n Hacer',
      '  m:',
      '    Escribir 1;',
      'FinSegun',
    ),
    text: 'm',
    clean: main('Definir n Como Entero;', 'n <- 1;', 'Segun n Hacer', '  1:', '    Escribir 1;', 'FinSegun'),
  },
  {
    code: 'E3030',
    source: main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  1:',
      '    Escribir 2;',
      'FinSegun',
    ),
    text: '1',
    clean: main(
      'Definir n Como Entero;',
      'n <- 1;',
      'Segun n Hacer',
      '  1:',
      '    Escribir 1;',
      '  2:',
      '    Escribir 2;',
      'FinSegun',
    ),
  },
  {
    code: 'E3031',
    source: main('Romper;'),
    text: 'Romper;',
    clean: main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras'),
  },
  {
    code: 'E3032',
    source: [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  f(1 + 1);',
      'FinProceso',
    ].join('\n'),
    text: '1 + 1',
    clean: [
      'SubProceso f(n Por Referencia Como Entero)',
      '  n <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  Definir a Como Entero;',
      '  f(a);',
      '  Escribir a;',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E3033',
    source: main('Retornar 1;'),
    text: 'Retornar 1;',
    clean: main('Retornar;'),
  },
  {
    code: 'E3034',
    source: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f();'),
    text: 'f()',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3035',
    source: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f("hola");'),
    text: '"hola"',
    clean: withF('SubProceso f(n Como Entero)', 'Escribir n;', 'f(1);'),
  },
  {
    code: 'E3036',
    source: main('Escribir Longitud;'),
    text: 'Longitud',
    clean: main('Escribir Longitud("hola");'),
  },
  {
    code: 'E3037',
    source: main('Escribir Longitud(1);'),
    text: '1',
    clean: main('Escribir Longitud("hola");'),
  },
  {
    code: 'W3001',
    source: main('Mientras Verdadero Hacer', '  Romper;', '  Escribir 1;', 'FinMientras'),
    text: 'Escribir 1;',
    clean: main('Mientras Verdadero Hacer', '  Romper;', 'FinMientras'),
  },
  {
    code: 'W3002',
    source: main('Definir a Como Entero;', 'a <- 1;'),
    text: 'a',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'W3003',
    source: main('Definir a Como Entero;', 'Escribir a;'),
    text: 'a',
    clean: main('Definir a Como Entero;', 'a <- 1;', 'Escribir a;'),
  },
  {
    code: 'W3004',
    source: [
      'Funcion r <- f() Como Entero',
      '  Escribir 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n'),
    text: 'f',
    clean: [
      'Funcion r <- f() Como Entero',
      '  r <- 1;',
      'FinFuncion',
      'Proceso p',
      '  Escribir f();',
      'FinProceso',
    ].join('\n'),
  },
]

describe('every checker code has a case', () => {
  it('covers E3001–E3037 and W3001–W3004', () => {
    const covered = [...new Set(cases.map((entry) => entry.code))].sort()
    const expected = DIAGNOSTIC_CODES.filter(
      (code) => code.startsWith('E3') || code.startsWith('W3'),
    )
    expect(covered).toEqual([...expected].sort())
  })

  for (const entry of cases) {
    describe(entry.code, () => {
      it('is reported exactly once, over the right text', () => {
        const report = checkSource(entry.source, entry.profile ?? 'es')
        const hits = report.codes
          .map((code, index) => ({ code, text: report.texts[index] ?? '' }))
          .filter((one) => one.code === entry.code)
        expect(hits.length, `expected one ${entry.code}, got ${report.diagnostics.join(', ')}`).toBe(1)
        expect(hits[0]?.text).toBe(entry.text)
      })

      it('renders in es and en with no unfilled slot', () => {
        const report = checkSource(entry.source, entry.profile ?? 'es')
        const diagnostic = report.result.diagnostics.find((one) => one.code === entry.code)
        expect(diagnostic).toBeDefined()
        const spanish = formatDiagnostic(diagnostic!, 'es', report.profile)
        const english = formatDiagnostic(diagnostic!, 'en', profiles.en)
        expect(spanish).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(english).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(spanish.length).toBeGreaterThan(0)
        expect(english).not.toBe(spanish)
      })

      it('is absent from the neighbouring program', () => {
        const report = checkSource(entry.clean, entry.profile ?? 'es')
        expect(report.codes, report.diagnostics.join(', ')).not.toContain(entry.code)
      })
    })
  }
})
```

- [ ] **Step 2: Run it and fix what it finds**

Run: `pnpm vitest run --project stepcode test/checker/by-code.test.ts`
Expected on the first run: a handful of failures, each naming a code whose span or count is off
by one design decision. Fix the **checker**, not the case, unless the case's program is genuinely
ambiguous (two mistakes in one program) — then narrow the program. Every fix here is a real bug
found by the spec's own coverage rule.

- [ ] **Step 3: Write the failing side-table test `packages/language/test/checker/side-tables.test.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { Expr, Identifier, Node } from '../../src/ast/index'
import { walk } from '../../src/ast/index'
import { check } from '../../src/checker/index'
import { parse } from '../../src/parser/index'
import { profileNamed } from '../helpers'

const dir = fileURLToPath(new URL('../corpus/programs', import.meta.url))
const zeroBased = new Set(
  readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
    .split('\n')
    .filter((line) => line.length > 0),
)
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

const EXPRESSION_KINDS: ReadonlySet<Node['kind']> = new Set<Node['kind']>([
  'Literal',
  'Identifier',
  'Index',
  'Call',
  'BuiltinCall',
  'Unary',
  'Binary',
  'ErrorExpr',
])

describe('the side tables cover every corpus tree', () => {
  for (const file of files) {
    it(`${file} types every expression, resolves every name and every call`, () => {
      const profile = profileNamed(zeroBased.has(file.replace('.stepcode', '')) ? 'es0' : 'es')
      const source = readFileSync(join(dir, file), 'utf8')
      const { program } = parse(source, { profile })
      const result = check(program, { profile })
      const untypedExpressions: string[] = []
      const unresolvedNames: string[] = []
      const unresolvedCalls: string[] = []
      walk(program, {
        enter: (node, parent) => {
          if (EXPRESSION_KINDS.has(node.kind) && !result.types.has(node as Expr)) {
            untypedExpressions.push(`${node.kind}@${node.span.start}`)
          }
          if (node.kind === 'Call' && !result.calls.has(node)) {
            unresolvedCalls.push(`Call@${node.span.start}`)
          }
          if (
            node.kind === 'Identifier' &&
            node.missing !== true &&
            // A main block's name is not a symbol: nothing declares it and nothing reads it.
            parent?.kind !== 'MainBlock' &&
            !result.symbols.has(node as Identifier)
          ) {
            unresolvedNames.push(`${node.text}@${node.span.start}`)
          }
          return true
        },
      })
      expect(untypedExpressions).toEqual([])
      expect(unresolvedNames).toEqual([])
      expect(unresolvedCalls).toEqual([])
    })

    it(`${file} lists every declared name once per scope`, () => {
      const profile = profileNamed(zeroBased.has(file.replace('.stepcode', '')) ? 'es0' : 'es')
      const source = readFileSync(join(dir, file), 'utf8')
      const { program } = parse(source, { profile })
      const result = check(program, { profile })
      for (const scope of result.scopes) {
        const names = scope.order.map((symbol) => symbol.name)
        expect(new Set(names).size).toBe(names.length)
        expect(scope.symbols.size).toBe(names.length)
      }
    })
  }
})
```

- [ ] **Step 4: Write the failing corpus test `packages/language/test/corpus/check.test.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { profileNamed } from '../helpers'

const dir = fileURLToPath(new URL('./programs', import.meta.url))
const zeroBased = new Set(
  readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
    .split('\n')
    .filter((line) => line.length > 0),
)
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

describe('the conformance corpus under the default profile', () => {
  it('is not empty', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  for (const file of files) {
    it(`${file} compiles with no errors`, () => {
      const profile = profileNamed(zeroBased.has(file.replace('.stepcode', '')) ? 'es0' : 'es')
      const source = readFileSync(join(dir, file), 'utf8')
      const { diagnostics } = compile(source, { profile })
      const errors = diagnostics.filter((one) => one.severity === 'error')
      expect(
        errors.map((one) => `${one.code}@${source.slice(one.span.start, one.span.end)}`),
      ).toEqual([])
    })
  }
})
```

- [ ] **Step 5: Run both and collect the offenders**

```bash
pnpm vitest run --project stepcode test/corpus/check.test.ts test/checker/side-tables.test.ts 2>&1 | tail -60
```

Expected: a list of failing programs. Ten of them fail at the **parser** level under the strict
profile and are known in advance:

| Program | Why |
|---|---|
| `addition.stepcode` | 3 untyped parameters (E2021) |
| `array-operations.stepcode` | 8 untyped parameters (E2021), 4 missing `;` (E2001) |
| `insert-into-array-procedure.stepcode` | 1 untyped parameter |
| `procedure-receives-parameters.stepcode` | 2 untyped parameters |
| `procedure-test-array-by-parameter.stepcode` | 1 untyped parameter |
| `procedure-test-by-reference.stepcode` | 2 untyped parameters |
| `procedure-test-by-value-and-reference.stepcode` | 2 untyped parameters |
| `test-assignation-function-with-parameters.stepcode` | 2 untyped parameters |
| `test-missing-semicolon-at-line-2.stepcode` | 1 missing `;` |
| `test-return-value.stepcode` | 2 untyped parameters |

- [ ] **Step 6: Rewrite the offenders, minimally**

The rules for a rewrite, in order of preference:

1. **Add the missing type to a parameter.** `SubProceso Ordenar(n1 Por Referencia, n2 Por Referencia)`
   becomes `SubProceso Ordenar(n1 Por Referencia Como Cadena, n2 Por Referencia Como Cadena)`.
   The type to write is the one the body already assumes; where the program is only ever called
   with one type, that is the type.
2. **Add the missing `;`.** Nothing else about the line changes.
3. **Declare a `Para` counter** that the program never declared: add `Definir i Como Entero;` at
   the top of the body that uses it.
4. **Compare explicitly**: `Si a MOD 2 Entonces` becomes `Si a MOD 2 <> 0 Entonces`.
5. **Remove a `Definir` of the result variable**, which the function header already declares.
6. **Fix a `/` assigned to an `Entero`**: use the profile's `DIV` when the program means whole
   division, or widen the variable to `Real` when it means a real one. Prefer whichever the
   program's own output statements imply.

Never change what a program computes, never rename anything, and never delete a statement that
does work. If a program cannot be fixed under those rules, stop and report it rather than
inventing a seventh rule.

Then re-run until both files are green:

```bash
pnpm vitest run --project stepcode test/corpus
```

- [ ] **Step 7: Check that the pseint parse suite is still green**

Run: `pnpm vitest run --project stepcode test/corpus/parse.test.ts`
Expected: PASS. Every rewrite above is legal under `pseint` too — adding a type, a semicolon or a
declaration takes nothing away — so the existing suite, which parses the corpus under
`profiles.pseint`, must not have moved. If it did, the rewrite went too far; narrow it.

- [ ] **Step 8: Record every rewrite in `packages/language/test/corpus/programs/README.md`**

Replace the "Do not hand-edit these files" paragraph with:

```markdown
Do not hand-edit these files for cosmetic reasons, and do not edit `test/corpus/v1/`. To change
what the extractor produces, edit the extraction script and re-run it:

```
node packages/language/scripts/extract-corpus.ts
```

Two kinds of edit are made by hand, on purpose, and are listed below: the extraction rewrites
(applied by the script) and the checker rewrites (applied once, by sub-spec B, to make every
program check clean under the default profile).
```

and add a new section at the end:

```markdown
## Checker rewrites (sub-spec B)

Sub-spec B's rule is that every program here checks clean under the **default** profile
(`profiles.es`), not only under the lenient `pseint` one: a corpus that only passes with the
leniency turned on cannot show that the strict rules are right. Programs that relied on
leniency were rewritten, minimally — no program computes anything different than it did — and
every rewrite is listed here.

| Program | Rewrite | Why |
|---|---|---|
| … | … | … |

Fill one row per edited program, naming the rule from the plan's Task 11 Step 6 that the edit
follows. `test-missing-semicolon-at-line-2.stepcode` keeps its name: what it stood for at the
parser level (a missing `;` under `requireSemicolons`) is covered by
`test/parser/diagnostics.test.ts`, which asserts E2001 directly.
```

The table is filled with the real rows as the rewrites are made; leaving it as `…` is a task
failure.

Add one line to `packages/language/test/corpus/README.md`, after its first paragraph:

```markdown
The per-program rewrites — both the extractor's and the checker's — are listed in
`programs/README.md`.
```

- [ ] **Step 9: Write the failing property test `packages/language/test/checker/one-mistake.test.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { profileNamed } from '../helpers'

const dir = fileURLToPath(new URL('../corpus/programs', import.meta.url))
const zeroBased = new Set(
  readFileSync(join(dir, 'index-base-0.txt'), 'utf8')
    .split('\n')
    .filter((line) => line.length > 0),
)
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

interface Mutation {
  readonly name: string
  /** The mutated source, or `undefined` when this program has nothing to mutate. */
  apply(source: string): string | undefined
}

const mutations: Mutation[] = [
  {
    name: 'delete one Definir of a single name',
    apply: (source) => {
      const match = /^[ \t]*Definir[ \t]+([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)[ \t]+[Cc]omo[ \t]+[^;,\n]*;?[ \t]*\n/m.exec(
        source,
      )
      if (match === null) return undefined
      return source.slice(0, match.index) + source.slice(match.index + match[0].length)
    },
  },
  {
    name: 'misspell the last use of a name',
    apply: (source) => {
      const match = /Escribir[ \t]+([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)[ \t]*;/g
      const all = [...source.matchAll(match)]
      const last = all[all.length - 1]
      if (last === undefined || last.index === undefined) return undefined
      const name = last[1] as string
      const at = source.indexOf(name, last.index)
      return `${source.slice(0, at)}${name}qz${source.slice(at + name.length)}`
    },
  },
  {
    name: 'swap one literal for a text',
    apply: (source) => {
      const match = /Escribir[ \t]+(\d+)[ \t]*;/.exec(source)
      if (match === null || match.index === undefined) return undefined
      const at = source.indexOf(match[1] as string, match.index)
      // `Escribir` takes any scalar, so the literal is swapped inside a numeric builtin call.
      return `${source.slice(0, at)}Longitud(${match[1]})${source.slice(at + (match[1] as string).length)}`
    },
  },
  {
    name: 'drop the last argument of a call',
    apply: (source) => {
      const match = /([A-Za-zÁÉÍÓÚÑáéíóúñ_][\w]*)\(([^()\n]+),[ \t]*([^(),\n]+)\)[ \t]*;/.exec(source)
      if (match === null || match.index === undefined) return undefined
      return `${source.slice(0, match.index)}${match[1]}(${match[2]});${source.slice(
        match.index + match[0].length,
      )}`
    },
  },
  {
    name: 'change one operator',
    apply: (source) => {
      const match = /(\w)[ \t]\+[ \t](\w)/.exec(source)
      if (match === null || match.index === undefined) return undefined
      return `${source.slice(0, match.index)}${match[1]} Y ${match[2]}${source.slice(
        match.index + match[0].length,
      )}`
    },
  },
]

/**
 * Programs whose mutation is not a single mistake — the mutated text happens to break two
 * unrelated things at once. Each entry needs a one-line reason; an unexplained entry is a way
 * of hiding a real cascade, which is exactly what this test exists to catch.
 */
const skip: ReadonlySet<string> = new Set<string>([])

describe('one mistake, one diagnostic', () => {
  for (const file of files) {
    const slug = file.replace('.stepcode', '')
    const profile = profileNamed(zeroBased.has(slug) ? 'es0' : 'es')
    const source = readFileSync(join(dir, file), 'utf8')
    for (const mutation of mutations) {
      const key = `${slug}::${mutation.name}`
      if (skip.has(key)) continue
      const mutated = mutation.apply(source)
      if (mutated === undefined || mutated === source) continue
      it(`${file}: ${mutation.name}`, () => {
        const before = compile(source, { profile }).diagnostics.filter(
          (one) => one.severity === 'error',
        )
        expect(before).toEqual([])
        const after = compile(mutated, { profile }).diagnostics.filter(
          (one) => one.severity === 'error',
        )
        expect(
          after.map((one) => `${one.code}@${mutated.slice(one.span.start, one.span.end)}`),
        ).toHaveLength(1)
      })
    }
  }
})
```

- [ ] **Step 10: Run it and fix the cascades it finds**

Run: `pnpm vitest run --project stepcode test/checker/one-mistake.test.ts`
Expected on the first run: a few failures. Each is one of three things, and only the first
justifies touching the test:

1. The mutation genuinely broke two things (`Longitud(x)` where the program also passed `x`
   somewhere else) — add the `slug::mutation` key to `skip`, **with a comment saying why**.
2. The checker reported a cascade: a mistake reported once and then again on the way up the
   tree. That is a bug — the offending path must type `unknown` and stay quiet. Fix the checker.
3. The mutation reported nothing at all (`toHaveLength(1)` saw 0). Either the mutation did not
   land where it was meant to, or a rule is missing. Read the mutated program before deciding.

- [ ] **Step 11: Run the whole package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode
```

Expected: all clean, corpus included.

- [ ] **Step 12: Commit**

```bash
git add packages/language/test
git commit -m "test(language): corpus checks clean, code coverage, side tables and the one-mistake property"
```

**Parallelism:** none — this task is the whole checker's evidence and needs Tasks 1–10.

---

### Task 12: README, changeset and the final run

**Files:**
- Modify: `packages/language/README.md`
- Create: `.changeset/language-checker.md`

**Interfaces:**
- Consumes: the finished package.
- Produces: the documentation and the release note. No code.

- [ ] **Step 1: Add the checker section to `packages/language/README.md`**

Replace the opening paragraph's last sentence ("The checker, the interpreter and `compile()`
arrive in later releases.") with "The checker and `compile()` are here too; the interpreter
arrives in the next release.", and add this section after the existing `## API` table:

````markdown
## Checking

`compile(source, { profile })` parses **and** checks, always both, so an editor gets the
parser's and the checker's diagnostics at once, sorted by position:

```ts
import { compile, formatDiagnostic } from 'stepcode'
import { profiles } from '@stepcode/profiles'

const { ast, diagnostics } = compile(
  'Proceso p\n  Definir n Como Entero;\n  n <- 7 / 2;\n  Escribir n;\nFinProceso',
  { profile: profiles.es },
)

for (const diagnostic of diagnostics) {
  console.log(diagnostic.code, formatDiagnostic(diagnostic, 'es', profiles.es))
}
// E3010 No se puede guardar un Real donde se espera un Entero: «DIV» da la división entera.
```

`check(program, { profile })` is the same check over a tree you already have. It returns the
side tables the interpreter and the editor read instead of re-deriving anything — only the
checker knows types:

| Table | Holds |
| --- | --- |
| `types` | `WeakMap<Expr, Type>` — every expression node of every checked body |
| `symbols` | `WeakMap<Identifier, Symbol>` — every resolved, non-missing name |
| `calls` | `WeakMap<Call, SubprogramDecl>` — every resolved user call |
| `scopes` | the program scope, then one body scope per main, extra main and subprogram |

What the checker enforces, in one page:

- **Types.** `Entero` widens to `Real`, never the reverse; `Caracter` widens to `Cadena`, and a
  one-character string literal fits a `Caracter`. `/` and `^` always give `Real`; `DIV` and
  `MOD` take and give `Entero`. Indexing a `Cadena` gives a read-only `Caracter`.
- **Names.** Subprograms are hoisted; variables are not — using one above its `Definir` is an
  error. An unknown name suggests the nearest declared one. With `implicitDeclarations`, the
  first assignment declares; reading or `Leer` of an unknown name is still an error.
- **Conditions** must be `Logico` in every profile: `Si a MOD 2` asks you to compare.
- **Untyped parameters** (`typedParameters: false`) are fixed by the first checked call, and a
  later call that does not fit points back at the call that fixed them.
- **Warnings**: unreachable code, declared but never read, read but never assigned, and a
  function result that never receives a value.

Diagnostic ranges: `E1xxx` lexer, `E2xxx` parser, `E3001`–`E3037` checker, `W3001`–`W3004`
checker warnings. Bounds, division by a non-constant zero, input parsing and stack depth are
runtime (`E4xxx`), not this package's business yet.
````

Add the new exports to the `## API` table:

```markdown
| `compile(source, { profile })` | `{ ast, diagnostics }` — parse and check in one call |
| `check(program, { profile })` | `{ diagnostics, types, symbols, calls, scopes }` |
| `typeToString(type, profile)` | `Entero`, `Entero[]`, `Entero[,]` |
| `BINARY_TABLE`, `UNARY_TABLE`, `BUILTIN_SIGNATURES` | the operator and builtin tables |
| `assignable(target, source, node?)` | the assignability rule, on its own |
| `fold(expr, constants)` | constant folding, on its own |
```

- [ ] **Step 2: Write `.changeset/language-checker.md`**

```markdown
---
'stepcode': minor
---

The checker: scopes and symbols, a type model with assignability and constant folding, the
operator and builtin tables, per-statement rules, flow warnings, and `compile(source, {
profile })`, which parses and checks in one call. Diagnostics gain E3001–E3037 and
W3001–W3004 in Spanish and English, and `check` returns the type, symbol, call and scope
tables the interpreter and the editor read.
```

- [ ] **Step 3: Verify the changeset is picked up**

Run: `pnpm changeset status`
Expected: `stepcode` listed as `minor`.

- [ ] **Step 4: Run everything, from the repo root**

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Expected: lint exits 0; typecheck silent for every package; the build emits `dist/index.js`
and `dist/index.d.ts` for `stepcode`; every test green.

- [ ] **Step 5: Check the built package really exports the checker**

```bash
node -e "import('./packages/language/dist/index.js').then(async (m) => { const { profiles } = await import('@stepcode/profiles'); const r = m.compile('Proceso p\n  Definir n Como Entero;\n  n <- 2.5;\n  Escribir n;\nFinProceso', { profile: profiles.es }); console.log(r.diagnostics.map((d) => d.code), m.formatDiagnostic(r.diagnostics[0], 'en', profiles.en)) })"
```

Expected: `[ 'E3010' ]` and an English message naming `Integer` and `Real`.

- [ ] **Step 6: Check nothing was left half-written**

```bash
grep -rn 'TODO\|FIXME\|XXX' packages/language/src
grep -rn '…' packages/language/test/corpus/programs/README.md
```

Expected: no output from either. The second one catches an unfilled rewrite table.

- [ ] **Step 7: Commit**

```bash
git add packages/language/README.md .changeset
git commit -m "docs(language): document the checker and add the changeset"
```

**Parallelism:** none — last task.

---

## Diagnostic coverage

Every code of spec §7.1, the task that produces it, and the data it carries.

| Code | Task | Data | Hint variants |
|---|---|---|---|
| E3001 | 5 | `name` | `suggest` (+`suggestion`), `declare` |
| E3002 | 6 | `name`, related | `result`, `parameter` |
| E3003 | 5 | `name`, related | — |
| E3004 | 6 | `name`, related | — |
| E3005 | 5 | `name` | — |
| E3006 | 6 | `name` | — |
| E3007 | 7 | `name` | — |
| E3008 | 8 | `name` | — |
| E3009 | 5 | `name` | `array`, `scalar` |
| E3010 | 6 | `expected`, `found` | `trunc`, `div`, `index`, `toNumber`, `toText`, `rank`, `element` |
| E3011 | 6 | `expected`, `found`, `length` | — |
| E3012 | 5 | `op`, `expected`, `found`, `side` | `divide`, `trunc`, `toText` |
| E3013 | 6 | — | — |
| E3014 | 8 | `found` | `compare` |
| E3015 | 6 | `name` | `parameter`, `result` |
| E3016 | 5 | `expected`, `found` | — |
| E3017 | 5 | `found` | — |
| E3020 | 6 | `name` | — |
| E3021 | 7 | `name` | — |
| E3022 | 7 | `name` (+`expected`, `found` for `rank`) | `again`, `kind`, `rank` |
| E3023 | 6 | — | — |
| E3024 | 7 | `name` | — |
| E3025 | 5 | `op` | — |
| E3026 | 8 | `name`, `found` | — |
| E3027 | 8 | — | — |
| E3028 | 8 | `found` | — |
| E3029 | 8 | — | — |
| E3030 | 8 | `value`, related | — |
| E3031 | 8 | `kw` | — |
| E3032 | 6 | `param` | — |
| E3033 | 6 | — | — |
| E3034 | 6 | `name`, `expected`, `found` | — |
| E3035 | 6 | `name`, `position`, `expected`, `found`, related | the E3010 variants |
| E3036 | 5 | `builtin`, `expected`, `found` | — |
| E3037 | 5 | `builtin`, `position`, `expected`, `found` | — |
| W3001 | 9 | — | — |
| W3002 | 9 | `name` | — |
| W3003 | 9 | `name` | — |
| W3004 | 9 | `name` | — |
| E2002 `builtin` | 1 | `found`, `builtin` | `builtin` (new variant on an existing parser code) |

Every code is also exercised once, at a named span, in `test/checker/by-code.test.ts` (Task 11),
which asserts that this list and `DIAGNOSTIC_CODES` agree.

## What it guarantees

- **It never throws.** `check` and `compile` return on any input, however broken the tree. A
  region the parser flagged is typed `unknown` and produces no second diagnostic.
- **One mistake, one diagnostic.** `unknown` absorbs: it is assignable both ways, every
  operator accepts it, nothing is reported about it, and any expression that already failed
  becomes it. An unknown name resolves to a recovery symbol, so its second use is silent. The
  property test in Task 11 mutates every corpus program and asserts exactly one error.
- **Diagnostics are data**, `{ code, severity, span, data, related? }`, with types pre-rendered
  through `typeToString(type, profile)`. The same diagnostic renders in `es` and `en`, in the
  active profile's own spellings, through `formatDiagnostic`.
- **Sorted and deduplicated**: by `span.start`, then severity, then code; two diagnostics with
  the same code and span collapse; in `compile` the parser's wins the tie.
- **Deterministic**: the same `(program, profile)` gives the same diagnostics in the same
  order. Warnings walk `Scope.order`, never a `Map`.
- **Every body is checked exactly once.** Bodies are pulled in on demand from their first call
  and memoized, so recursion depth is bounded by the number of subprograms; whatever no call
  reached is checked at the end, in source order.
- **The side tables are complete.** Every expression of every checked body has a type, every
  resolved non-missing identifier has a symbol, every resolved call has a target — asserted
  over the whole corpus in Task 11.
- **The corpus checks clean under the default profile**, not only under the lenient one, and
  every rewrite that took to get there is written down.

## API

| Export | What it does |
| --- | --- |
| `compile(source, { profile })` | `{ ast, diagnostics }` — parse and check in one call |
| `check(program, { profile })` | `{ diagnostics, types, symbols, calls, scopes }` |
| `typeToString(type, profile)` | `Entero`, `Entero[]`, `Entero[,]` |
| `assignable(target, source, node?)` | §4.2, on its own |
| `assignFailure(target, source, node?)` | the same rule, with the code and hint it would report |
| `checkBinary(op, left, right)` / `checkUnary(op, operand)` | §4.3 over the operator table |
| `comparable(left, right)` | §4.4 |
| `fold(expr, constants)` | §4.6 |
| `BINARY_TABLE`, `UNARY_TABLE` | the operator table, as data |
| `BUILTIN_SIGNATURES`, `builtinResult(key, args)` | the builtin table, as data |
| `sortDiagnostics(diagnostics)` | §7.2, for a caller merging its own diagnostics in |
| `Type`, `Symbol`, `Scope`, `CheckResult`, `CompileResult` | the public types |

## Verification checklist

Run from the repo root when every task is done:

- [ ] `pnpm lint` exits 0.
- [ ] `pnpm typecheck` is silent for all packages.
- [ ] `pnpm test` is green; `pnpm vitest run --project stepcode` alone is green.
- [ ] `pnpm build` succeeds; `node -e` against `dist/index.js` reports `E3010` for the sample.
- [ ] Every `E3xxx` and `W3xxx` in `DIAGNOSTIC_CODES` has a case in
      `test/checker/by-code.test.ts` (the suite asserts this itself), with a span and a
      neighbouring program that does not trigger it.
- [ ] `es.variants` and `en.variants` have the same keys, and no template or variant leaves a
      `{slot}` unresolved (`test/diagnostics/format.test.ts` asserts both).
- [ ] Every `.stepcode` corpus program compiles with zero error-severity diagnostics under the
      default profile — `profiles.es`, or the `indexBase: 0` variant for the slugs in
      `index-base-0.txt`.
- [ ] `test/corpus/parse.test.ts` is still green: every rewrite is legal under `pseint` too.
- [ ] Every corpus tree satisfies the side-table invariant: every expression typed, every
      non-missing identifier resolved, every call targeted, every scope listing each name once.
- [ ] The mutation property test passes, and every entry in its `skip` set carries a reason.
- [ ] `packages/language/test/corpus/programs/README.md` lists one row per rewritten program,
      with no `…` left in the table.
- [ ] `grep -rn 'TODO\|FIXME' packages/language/src` finds nothing.
- [ ] `pnpm changeset status` lists `stepcode` as `minor`.
