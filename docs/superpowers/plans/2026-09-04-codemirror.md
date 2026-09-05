# `@stepcode/codemirror` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `@stepcode/codemirror` (`packages/codemirror`): CodeMirror 6 language support built on a Lezer tree produced from the `stepcode` parser and checker — highlighting, lint, folding, indentation, block matching, completion with block snippets, signature help, hover, go to definition — plus the runtime-free debug extensions (breakpoint gutter, current-line marker), a base theme, `es`/`en` strings, and the `stepcode()` bundle.

**Architecture:** One `compile` per document version, run inside a custom `@lezer/common` `Parser` (`src/parser.ts`). `src/tree.ts` turns the `CompileResult` (AST + tokens) into a postfix buffer for `Tree.build`, and rebuilds the top node with a per-tree `NodeProp` carrying the `CompileResult` and two offset maps (identifier leaves, call nodes). `src/nodes.ts` is the `NodeSet`: one type per AST kind, one leaf type per token role, one keyword type per profile key, with `closedBy`/`openedBy`, `styleTags`, fold and indent props. Every feature (`lint.ts`, `completion.ts`, `snippets.ts`, `signature.ts`, `hover.ts`, `definition.ts`, `blocks.ts`) reads `syntaxTree(state)` and never compiles on its own; `symbols.ts` holds the shared lookups (identifier leaf → `Symbol`, scope at a position, type and signature rendering). `debug.ts` is pure editor state (a `RangeSet<GutterMarker>` field and a line-start field) with no import from the interpreter. `strings.ts` is the `es`/`en` table. `stepcode.ts` assembles the `LanguageSupport`.

**Tech Stack:** TypeScript 7 (strict, ESM), Vitest 4.1 (Node environment; happy-dom per file for view tests), tsdown 0.22, Biome 2.5, pnpm 11 workspace. New regular dependencies: `@codemirror/state` ^6.7.3, `@codemirror/view` ^6.43.11, `@codemirror/language` ^6.12.4, `@codemirror/lint` ^6.9.7, `@codemirror/autocomplete` ^6.20.3, `@lezer/common` ^1.5.2, `@lezer/highlight` ^1.2.3, `stepcode` (workspace), `@stepcode/profiles` (workspace). New devDependencies: `happy-dom` ^20.13.2, `@types/node` (catalog). Verified against the published `.d.ts` files of those versions on 2026-09-04.

**Spec:** `docs/superpowers/specs/2026-09-04-codemirror-design.md` (all sections). Consumes `docs/superpowers/specs/2026-09-04-language-interpreter-design.md` §7 (`CompileResult`), `docs/superpowers/specs/2026-09-04-language-checker-design.md` (scopes, symbols, diagnostics), `docs/superpowers/specs/2026-09-03-language-syntax-design.md` (tree contract: every node has `span` and `tokens: [first, last]`, children nest without overlap, `childrenOf` is source-ordered). Parent: `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` §3.5, §5, §6, §7 item 5.

## Deviations from the spec, decided while planning

1. **`CompileResult` gains `tokens`.** The tree builder attaches every significant token to a node, so it needs the parser's token stream, which `CompileResult` (`CheckResult & { ast, source }`) did not carry. Task 1 adds `readonly tokens: readonly Token[]` to `CompileResult` in `packages/language/src/compile.ts` — additive, and `parse` already produces the array. A `stepcode` patch changeset records it.
2. **The `NodeSet` is built once, then extended per language.** `Language` finds its data facet through `languageDataProp` on the top node type, and the facet is per profile (comment token, indent-on-input pattern). `nodes.ts` builds the base set once; `stepcodeLanguage(profile)` derives `nodeSet.extend(languageDataProp.add({ Program: data }))`. Node ids and names are unchanged, so §4.2 holds.
3. **`stepcodeLanguage(profile)` is memoized per `ResolvedProfile`** (a `WeakMap`), so `stepcodeCompletion(options)` can register its source through the language's data facet with the spec's signature, and every piece of `stepcode()` sees the same `Language` object.
4. **Switch indentation, refined.** `es` spells `case` with no keyword (a case line is `valor:`), so the §5.4 dedent-by-keyword rule cannot recognise a new case line, and a line typed after a case body resolves to the `SwitchStmt`, not the `SwitchCase` (the case node ends at its last statement). `SwitchStmt`'s rule therefore also (a) treats a line matching `^[^:]+:\s*$` as a case line (one unit past `Segun`), (b) indents a line whose previous non-blank line ends inside one of its cases two units past `Segun`, and (c) indents a line after `De Otro Modo` two units. `SwitchCase`'s own rule handles the (rarer) position inside the case's range. §5.4's table stands for every other block.
5. **Line survival for debug markers is explicit** rather than `RangeSet.map`'s default `TrackDel`, which would move a marker onto the next line when its line is deleted. A marker survives a change unless its line's whole content was deleted (both ends map to one offset) or, for an empty line, its line break was deleted. The same helper serves the current-line field.
6. **The `Repetir … Mientras Que` closer is not a matching pair.** Marking `WhileKeyword` as `openedBy: ['RepeatKeyword']` would make an ordinary `Mientras` opener report "no match" (the matcher tries the backward direction first and stops on the first answer). Only `repeat`↔`until` matches, as §4.2 lists.

## Parallelism

Tasks touching disjoint files may run concurrently; tasks sharing a file are sequenced.

| Task | Files it creates or modifies | Runs |
|---|---|---|
| 1 | `packages/language/src/compile.ts`, `packages/language/test/checker/compile.test.ts`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `packages/codemirror/{package.json,tsconfig.json,vitest.config.ts}`, `packages/codemirror/src/{index,strings}.ts`, `packages/codemirror/test/{setup,helpers,index.test,strings.test}.ts` | **alone, first** |
| 2 | `src/nodes.ts`, `test/nodes.test.ts` | after 1, alone |
| 3 | `src/tree.ts`, `src/parser.ts`, `test/helpers.ts` (append), `test/tree.test.ts`, `test/parser.test.ts` | after 2 |
| 4 | `src/options.ts`, `src/lint.ts`, `test/highlight.test.ts`, `test/lint.test.ts` | after 3, parallel with 5 and 6 |
| 5 | `src/blocks.ts`, `src/parser.ts` (block props, indentOnInput rules), `test/fold.test.ts`, `test/indent.test.ts` | after 3, parallel with 4 and 6 |
| 6 | `src/matching.ts`, `test/matching.test.ts` | after 3, parallel with 4 and 5 |
| 7 | `src/symbols.ts`, `src/completion.ts`, `test/completion.test.ts` | after 4–6 |
| 8 | `src/snippets.ts`, `src/completion.ts` (opener snippets), `test/snippets.test.ts`, `test/completion.test.ts` (append) | after 7 |
| 9 | `src/signature.ts`, `test/signature.test.ts` | after 7, parallel with 8 and 10 |
| 10 | `src/hover.ts`, `src/definition.ts`, `test/hover.test.ts`, `test/definition.test.ts` | after 7, parallel with 8 and 9 |
| 11 | `src/debug.ts`, `src/theme.ts`, `test/debug.test.ts` | after 1, parallel with 2–10 |
| 12 | `src/stepcode.ts`, `src/index.ts`, `test/index.test.ts`, `test/bundle.test.ts`, `packages/codemirror/README.md`, `.changeset/codemirror.md`, `.changeset/language-tokens.md` | last |

Summary: 1 → 2 → 3 → {4, 5, 6} → 7 → {8, 9, 10} → 12, with 11 free to run any time after 1. `test/helpers.ts` is touched by Tasks 1 and 3, by appending. `src/parser.ts` by Tasks 3 and 5; `src/completion.ts` and `test/completion.test.ts` by 7 and 8; `src/index.ts` by 1 and 12 (Task 12 rewrites it).

## Global Constraints

These are the spec's binding rules and the repository's conventions. They hold in every task; do not weaken them.

- **TypeScript strict**, with the flags in `tsconfig.base.json`: `noUncheckedIndexedAccess` (every index access is `T | undefined`), **`exactOptionalPropertyTypes`** (never assign `undefined` to an optional property — build the object with the key omitted), `verbatimModuleSyntax` (`import type` for types), `noFallthroughCasesInSwitch`, `isolatedModules`. Imports are extensionless (`./tree`, `../src/nodes`). The checker's `Symbol` type shadows the global: import it as `type Symbol as StepSymbol`.
- **Dependencies** are exactly the list in the Tech Stack line, all regular except `happy-dom` and `@types/node`. Nothing else is added in any task. No Playwright, no Vitest browser mode.
- **No runtime import in the debug extensions.** `src/debug.ts` and `src/theme.ts` import only from `@codemirror/state` and `@codemirror/view`.
- **No highlight style, lint gutter, line numbers, history or default keymap in `stepcode()`** (spec §7).
- **Every feature reads `syntaxTree(state)`.** No module other than `parser.ts` calls `compile`. `compileResultAt` / `treeDataAt` are the only way to the checker's tables.
- **Biome** (`biome.json`: 2-space indent, single quotes, no semicolons, trailing commas, line width 100, organized imports). Run `pnpm lint:fix` before every commit; `pnpm lint` must exit 0. Every command runs from the repo root.
- **Commands.** One file: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/<file>`; the package: `pnpm vitest run --project @stepcode/codemirror`; typecheck: `pnpm --filter @stepcode/codemirror typecheck`; whole repo: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`. (`pnpm --filter <pkg> test` from a package directory picks up the root projects glob and is not used.)
- **Strict TDD**: every step writes the failing test first, runs it to see it fail with the expected failure, then writes the minimal implementation, then runs it green. **One commit per task** (or per step group the task names), conventional-commit message in the branch's style (`feat(codemirror): …`, `test(codemirror): …`, `docs(codemirror): …`, `feat(language): …`), **no attribution trailers**, no pushing.
- **Never use bare `git stash` / `git stash pop`** (the stash is shared with other worktrees). Use a temporary WIP commit to set work aside.
- **English artifacts**: code, comments, test names, README text and commit messages are English. Test programs are Spanish StepCode under the `es` profile unless a test is about `en`.
- **View tests opt in to happy-dom** with `// @vitest-environment happy-dom` as the first line of the file; every other test file runs under Node and touches no DOM.
- **Corpus reuse, not duplication.** `test/helpers.ts` reads the programs from `packages/language/test/corpus/{programs,guides}` by relative path; nothing is copied into this package.
- **Test helpers grow by appending** (Tasks 1 and 3); every other task reuses them verbatim.

## File Structure

Everything below `packages/codemirror/` unless a path starts with `packages/language/`.

```
package.json, tsconfig.json, vitest.config.ts                                (Task 1)
src/
  strings.ts       Strings, stringsFor(locale)                                (Task 1)
  nodes.ts         node names, ids, nodeSet, keywordNodeName, closedBy/openedBy,
                   styleTags                                                  (Task 2)
  tree.ts          TreeData, compileProp, buildTree(result, set)               (Task 3)
  parser.ts        StepcodeParser, stepcodeLanguage (memoized), languageData,
                   treeDataAt, compileResultAt                                (Task 3, 5)
  options.ts       StepcodeOptions                                            (Task 4)
  lint.ts          stepcodeDiagnostics(state, options), stepcodeLint(options)  (Task 4)
  blocks.ts        BLOCK_NAMES, closerOf, foldBlock, indentBlock, dedent tests,
                   indentOnInputPattern(profile)                              (Task 5)
  matching.ts      stepcodeBlockMatching()                                     (Task 6)
  symbols.ts       identifierLeafAt, symbolAt, scopeAt, visibleSymbols,
                   typeLabel, builtinKeyAt, builtinSignatureParts             (Task 7)
  completion.ts    completionSourceFor(options), stepcodeCompletion(options)   (Task 7, 8)
  snippets.ts      blockSnippets(profile, strings)                             (Task 8)
  signature.ts     signatureAt(state, pos, options), stepcodeSignatureHelp    (Task 9)
  hover.ts         hoverInfoAt, hoverSource, stepcodeHover                     (Task 10)
  definition.ts    definitionAt, goToDefinition, stepcodeKeymap                (Task 10)
  debug.ts         breakpoints, currentLine, debug, effects, readers           (Task 11)
  theme.ts         stepcodeBaseTheme                                           (Task 11)
  stepcode.ts      stepcode(options), StepcodeOptions                          (Task 12)
  index.ts         barrel                                                      (Task 1, 12)
test/
  setup.ts         DOM range polyfills for happy-dom                           (Task 1)
  helpers.ts       es/en/es0 profiles, corpus enumeration (Task 1);
                   stateFor, treeFor, leaves (Task 3)
  strings.test.ts, index.test.ts                                              (Task 1)
  nodes.test.ts                                                               (Task 2)
  tree.test.ts, parser.test.ts                                                (Task 3)
  highlight.test.ts, lint.test.ts                                             (Task 4)
  fold.test.ts, indent.test.ts                                                (Task 5)
  matching.test.ts                                                            (Task 6)
  completion.test.ts                                                          (Task 7, 8)
  snippets.test.ts                                                            (Task 8)
  signature.test.ts                                                           (Task 9)
  hover.test.ts (happy-dom), definition.test.ts                              (Task 10)
  debug.test.ts (happy-dom)                                                   (Task 11)
  bundle.test.ts (happy-dom)                                                  (Task 12)
README.md                                                                     (Task 12)
packages/language/src/compile.ts            + tokens                          (Task 1)
packages/language/test/checker/compile.test.ts   + one test                   (Task 1)
.changeset/codemirror.md, .changeset/language-tokens.md                       (Task 12)
```

---

### Task 1: `CompileResult.tokens`, package wiring, strings

**Files:**
- Modify: `packages/language/src/compile.ts` (whole file, 32 lines)
- Modify: `packages/language/test/checker/compile.test.ts` (append one test to the last `describe`, which ends at line 112)
- Modify: `pnpm-workspace.yaml` (the `catalog:` block, lines 4–9)
- Modify: `packages/codemirror/package.json` (whole file)
- Modify: `packages/codemirror/tsconfig.json` (whole file)
- Create: `packages/codemirror/vitest.config.ts`
- Create: `packages/codemirror/src/strings.ts`
- Modify: `packages/codemirror/src/index.ts` (whole file, currently 2 lines)
- Create: `packages/codemirror/test/setup.ts`, `packages/codemirror/test/helpers.ts`
- Modify: `packages/codemirror/test/index.test.ts` (whole file)
- Create: `packages/codemirror/test/strings.test.ts`

**Interfaces:**
- Consumes: `compile(source, { profile })` from `stepcode`; `parse` already returns `tokens`.
- Produces: `CompileResult.tokens: readonly Token[]` (Task 3 reads it). `stringsFor(locale: string): Strings` and the `Strings` shape below (Tasks 4, 7, 8, 9, 10). `test/helpers.ts`: `es`, `en`, `es0: ResolvedProfile`; `corpusSources(): readonly CorpusSource[]` (Task 3). `packageName` stays exported because `packages/editor/src/App.tsx` renders it.

- [ ] **Step 1: Write the failing language test**

Append inside the last `describe` of `packages/language/test/checker/compile.test.ts`, before its closing `})`:

```ts
  it('hands back the token stream the parser produced', () => {
    const source = 'Proceso p\n  Escribir 1;\nFinProceso'
    const result = compile(source, { profile: profiles.es })
    const words = result.tokens
      .filter((token) => token.kind !== 'whitespace' && token.kind !== 'newline')
      .map((token) => token.text)
    expect(words).toEqual(['Proceso', 'p', 'Escribir', '1', ';', 'FinProceso', ''])
  })
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode packages/language/test/checker/compile.test.ts`
Expected: FAIL — `TypeError: Cannot read properties of undefined (reading 'filter')`.

- [ ] **Step 3: Add `tokens` to `CompileResult`**

Replace `packages/language/src/compile.ts` with:

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from './ast/index'
import { type CheckResult, check } from './checker/index'
import { sortDiagnostics } from './diagnostics/sort'
import type { Token } from './lexer/index'
import { parse } from './parser/index'

/**
 * What `compile` hands back: the checker's tables unchanged, the merged diagnostics, the tree,
 * the token stream it was built from and the source. The interpreter reads `types`, `symbols`
 * and `calls` from here and builds its line map from `source` (interpreter spec §7.1); the
 * CodeMirror package attaches every `tokens` entry to a tree node; nobody re-runs `check`.
 */
export interface CompileResult extends CheckResult {
  readonly ast: Program
  readonly tokens: readonly Token[]
  readonly source: string
}

/**
 * Parse, then check — always both, even when the parser reported errors: an editor wants the
 * two kinds of diagnostic at once, and the checker is silent on the placeholders a broken
 * parse leaves behind (§2). Deduplication keys on code and span (§7.2), and no code is both a
 * parser's and a checker's, so the two lists can only ever sort together — never collide.
 */
export function compile(source: string, options: { profile: ResolvedProfile }): CompileResult {
  const parsed = parse(source, { profile: options.profile })
  const checked = check(parsed.program, { profile: options.profile })
  return {
    ...checked,
    diagnostics: sortDiagnostics([...parsed.diagnostics, ...checked.diagnostics]),
    ast: parsed.program,
    tokens: parsed.tokens,
    source,
  }
}
```

- [ ] **Step 4: Run the language tests**

Run: `pnpm vitest run --project stepcode packages/language/test/checker/compile.test.ts`
Expected: PASS (every test in the file). Then `pnpm --filter stepcode typecheck` — exit 0 (the interpreter and tests build `CompileResult` values only through `compile`; if a test fixture constructs one by hand, add `tokens: []` to it).

- [ ] **Step 5: Add the CodeMirror catalog entries**

In `pnpm-workspace.yaml`, extend the `catalog:` block to:

```yaml
catalog:
  typescript: ^7.0.2
  vitest: ^4.1.11
  tsdown: ^0.22.14
  '@types/node': ^24.13.3
  fast-check: ^4.3.0
  '@codemirror/state': ^6.7.3
  '@codemirror/view': ^6.43.11
  '@codemirror/language': ^6.12.4
  '@codemirror/lint': ^6.9.7
  '@codemirror/autocomplete': ^6.20.3
  '@lezer/common': ^1.5.2
  '@lezer/highlight': ^1.2.3
  happy-dom: ^20.13.2
```

- [ ] **Step 6: Wire the package**

Replace `packages/codemirror/package.json` with:

```json
{
  "name": "@stepcode/codemirror",
  "version": "0.0.0",
  "description": "CodeMirror 6 language support and debug extensions for StepCode",
  "license": "MIT",
  "author": "Rolando Andrade",
  "keywords": ["stepcode", "codemirror", "pseudocode", "pseint"],
  "repository": {
    "type": "git",
    "url": "https://github.com/RolandoAndrade/stepcode",
    "directory": "packages/codemirror"
  },
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@codemirror/autocomplete": "catalog:",
    "@codemirror/language": "catalog:",
    "@codemirror/lint": "catalog:",
    "@codemirror/state": "catalog:",
    "@codemirror/view": "catalog:",
    "@lezer/common": "catalog:",
    "@lezer/highlight": "catalog:",
    "@stepcode/profiles": "workspace:*",
    "stepcode": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "happy-dom": "catalog:",
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

Replace `packages/codemirror/tsconfig.json` with:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "types": ["node"]
  },
  "include": ["src", "test", "vitest.config.ts"]
}
```

Create `packages/codemirror/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@stepcode/codemirror',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
```

Create `packages/codemirror/test/setup.ts` — the two DOM measurements CodeMirror calls that happy-dom does not implement; a no-op under Node:

```ts
// happy-dom implements neither `Range.getClientRects` nor `getBoundingClientRect` on ranges,
// and CodeMirror measures through both. Under Node (`document` undefined) nothing to patch.
const RECT = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }

if (typeof document !== 'undefined' && typeof Range !== 'undefined') {
  const proto = Range.prototype as unknown as Record<string, unknown>
  if (typeof proto.getClientRects !== 'function') {
    proto.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] })
  }
  if (typeof proto.getBoundingClientRect !== 'function') {
    proto.getBoundingClientRect = () => ({ ...RECT, toJSON: () => RECT })
  }
}
```

Run: `pnpm install`
Expected: the lockfile gains the seven CodeMirror/Lezer packages and `happy-dom` for this package; exit 0. If pnpm's minimum-release-age rule resolves a slightly older patch version than the catalog's floor allows, accept what it resolves — do not add exclusions.

- [ ] **Step 7: Write the failing strings and index tests**

Replace `packages/codemirror/test/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { packageName, stringsFor } from '../src/index'

describe('@stepcode/codemirror', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/codemirror')
  })

  it('exports the string table', () => {
    expect(stringsFor('es').kinds.variable).toBe('variable')
  })
})
```

Create `packages/codemirror/test/strings.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'

describe('stringsFor', () => {
  it('returns Spanish for es', () => {
    const s = stringsFor('es')
    expect(s.kinds.parameter).toBe('parámetro')
    expect(s.function).toBe('función')
    expect(s.declaredAt(12)).toBe('declarada en la línea 12')
    expect(s.replaceWith('total')).toBe('Cambiar a «total»')
    expect(s.operandClass.numeric).toBe('número')
    expect(s.placeholders.condition).toBe('condicion')
  })

  it('returns English for en', () => {
    const s = stringsFor('en')
    expect(s.kinds.constant).toBe('constant')
    expect(s.declaredAt(3)).toBe('declared on line 3')
    expect(s.replaceWith('total')).toBe('Replace with "total"')
    expect(s.same).toBe('same as the argument')
  })

  it('falls back by primary subtag, then to en', () => {
    expect(stringsFor('es-MX').kinds.variable).toBe('variable')
    expect(stringsFor('es-MX').byReference).toBe('por referencia')
    expect(stringsFor('pt-BR').byReference).toBe('by reference')
    expect(stringsFor('')).toBe(stringsFor('en'))
  })

  it('covers every symbol kind and operand class in both locales', () => {
    for (const locale of ['es', 'en']) {
      const s = stringsFor(locale)
      for (const kind of ['variable', 'parameter', 'result', 'constant', 'counter', 'subprogram']) {
        expect(s.kinds[kind as keyof typeof s.kinds].length).toBeGreaterThan(0)
      }
      for (const cls of ['numeric', 'text', 'boolean', 'integer', 'scalar']) {
        expect(s.operandClass[cls as keyof typeof s.operandClass].length).toBeGreaterThan(0)
      }
    }
  })
})
```

- [ ] **Step 8: Run them to verify they fail**

Run: `pnpm vitest run --project @stepcode/codemirror`
Expected: FAIL — `Failed to resolve import "../src/strings"` and `stringsFor` is not exported from `../src/index`.

- [ ] **Step 9: Write `strings.ts` and the barrel**

Create `packages/codemirror/src/strings.ts`:

```ts
import type { OperandClass, SymbolKind } from 'stepcode'

export type PlaceholderKey =
  | 'condition'
  | 'value'
  | 'name'
  | 'parameters'
  | 'result'
  | 'counter'
  | 'start'
  | 'limit'
  | 'case'

/** Every human string this package renders outside diagnostics (spec §9). */
export interface Strings {
  readonly kinds: Readonly<Record<SymbolKind, string>>
  readonly procedure: string
  readonly function: string
  readonly byReference: string
  readonly declaredAt: (line: number) => string
  readonly replaceWith: (name: string) => string
  readonly operandClass: Readonly<Record<OperandClass, string>>
  /** A builtin whose result type is its first argument's. */
  readonly same: string
  /** Snippet field names; ASCII so the inserted program stays lexable. */
  readonly placeholders: Readonly<Record<PlaceholderKey, string>>
}

const es: Strings = {
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
  procedure: 'procedimiento',
  function: 'función',
  byReference: 'por referencia',
  declaredAt: (line) => `declarada en la línea ${line}`,
  replaceWith: (name) => `Cambiar a «${name}»`,
  operandClass: {
    numeric: 'número',
    text: 'texto',
    boolean: 'lógico',
    integer: 'entero',
    scalar: 'valor',
  },
  same: 'igual al argumento',
  placeholders: {
    condition: 'condicion',
    value: 'valor',
    name: 'nombre',
    parameters: 'parametros',
    result: 'resultado',
    counter: 'i',
    start: 'inicio',
    limit: 'fin',
    case: 'caso',
  },
}

const en: Strings = {
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
  procedure: 'procedure',
  function: 'function',
  byReference: 'by reference',
  declaredAt: (line) => `declared on line ${line}`,
  replaceWith: (name) => `Replace with "${name}"`,
  operandClass: {
    numeric: 'number',
    text: 'text',
    boolean: 'boolean',
    integer: 'integer',
    scalar: 'value',
  },
  same: 'same as the argument',
  placeholders: {
    condition: 'condition',
    value: 'value',
    name: 'name',
    parameters: 'parameters',
    result: 'result',
    counter: 'i',
    start: 'start',
    limit: 'end',
    case: 'case',
  },
}

const TABLES: Readonly<Record<string, Strings>> = { es, en }

/** The table for a BCP-47 tag: exact, then primary subtag (`es-MX` → `es`), then `en`. */
export function stringsFor(locale: string): Strings {
  const exact = TABLES[locale]
  if (exact !== undefined) return exact
  const primary = locale.split('-')[0] ?? ''
  return TABLES[primary] ?? en
}
```

Replace `packages/codemirror/src/index.ts`:

```ts
export const packageName = '@stepcode/codemirror'

export type { PlaceholderKey, Strings } from './strings'
export { stringsFor } from './strings'
```

- [ ] **Step 10: Test helpers**

Create `packages/codemirror/test/helpers.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { builtinProfiles, profiles, type ResolvedProfile, resolveProfile } from '@stepcode/profiles'

export const es: ResolvedProfile = profiles.es
export const en: ResolvedProfile = profiles.en

/** `es` with 0-based arrays, for the corpus programs `index-base-0.txt` lists. */
export const es0: ResolvedProfile = resolveProfile(
  { id: 'es-index-0', extends: 'es', options: { indexBase: 0 } },
  builtinProfiles,
)

/** The language package's corpora, read in place — nothing is copied into this package. */
const corpusRoot = fileURLToPath(new URL('../../language/test/corpus', import.meta.url))

export interface CorpusSource {
  readonly slug: string
  readonly source: string
  readonly profile: ResolvedProfile
}

function zeroBasedSlugs(): Set<string> {
  return new Set(
    readFileSync(join(corpusRoot, 'programs', 'index-base-0.txt'), 'utf8')
      .split('\n')
      .filter((line) => line.length > 0),
  )
}

function programsIn(dir: string, profileFor: (slug: string) => ResolvedProfile): CorpusSource[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.stepcode'))
    .sort()
    .map((file) => {
      const slug = file.replace('.stepcode', '')
      return { slug, source: readFileSync(join(dir, file), 'utf8'), profile: profileFor(slug) }
    })
}

let corpus: CorpusSource[] | undefined

/**
 * Every program of the conformance corpus, the guide corpus and the guide error and runtime
 * sub-corpora, each with the profile the language package checks it under.
 */
export function corpusSources(): readonly CorpusSource[] {
  if (corpus !== undefined) return corpus
  const zero = zeroBasedSlugs()
  corpus = [
    ...programsIn(join(corpusRoot, 'programs'), (slug) => (zero.has(slug) ? es0 : es)),
    ...programsIn(join(corpusRoot, 'guides'), () => es),
    ...programsIn(join(corpusRoot, 'guides', 'errors'), () => es),
    ...programsIn(join(corpusRoot, 'guides', 'runtime'), () => es),
  ]
  return corpus
}
```

- [ ] **Step 11: Run the package tests, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror`
Expected: PASS — 2 files, 6 tests.
Run: `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0. (`helpers.ts` is not imported yet; `tsc` still checks it through `include`.)

- [ ] **Step 12: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml packages/language/src/compile.ts packages/language/test/checker/compile.test.ts packages/codemirror
git commit -m "feat(codemirror): package wiring, string table, and tokens on CompileResult"
```

---

### Task 2: the node set

**Files:**
- Create: `packages/codemirror/src/nodes.ts`
- Create: `packages/codemirror/test/nodes.test.ts`

**Interfaces:**
- Consumes: `KEYWORD_KEYS`, `KeywordKey` from `@stepcode/profiles`; `NodeProp`, `NodeSet`, `NodeType` from `@lezer/common`; `styleTags`, `tags` from `@lezer/highlight`.
- Produces (read by Tasks 3, 5, 6, 7, 9, 10): `STRUCTURE_NAMES`, `LEAF_NAMES`, `IDENTIFIER_NAMES` (readonly tuples), `keywordNodeName(key: KeywordKey): string`, `NODE_NAMES: readonly string[]`, `nodeId(name: string): number` (throws on an unknown name), `nodeSet: NodeSet`, `MATCHING_PAIRS: readonly (readonly [KeywordKey, KeywordKey])[]`.

- [ ] **Step 1: Write the failing test**

Create `packages/codemirror/test/nodes.test.ts`:

```ts
import { NodeProp } from '@lezer/common'
import { KEYWORD_KEYS } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  IDENTIFIER_NAMES,
  keywordNodeName,
  LEAF_NAMES,
  MATCHING_PAIRS,
  NODE_NAMES,
  nodeId,
  nodeSet,
  STRUCTURE_NAMES,
} from '../src/nodes'

describe('node names', () => {
  it('PascalCases a keyword key and appends Keyword', () => {
    expect(keywordNodeName('if')).toBe('IfKeyword')
    expect(keywordNodeName('endIf')).toBe('EndIfKeyword')
    expect(keywordNodeName('writeNoNewline')).toBe('WriteNoNewlineKeyword')
  })

  it('has one type per structure name, leaf name and keyword key, all distinct', () => {
    expect(NODE_NAMES.length).toBe(
      STRUCTURE_NAMES.length + LEAF_NAMES.length + KEYWORD_KEYS.length,
    )
    expect(new Set(NODE_NAMES).size).toBe(NODE_NAMES.length)
    expect(nodeSet.types.length).toBe(NODE_NAMES.length)
  })

  it('ids index the set and Program is the top node', () => {
    for (const name of NODE_NAMES) {
      expect(nodeSet.types[nodeId(name)]?.name).toBe(name)
    }
    expect(nodeSet.types[nodeId('Program')]?.isTop).toBe(true)
    expect(() => nodeId('Nope')).toThrow(/unknown node/)
  })

  it('flags the error types', () => {
    for (const name of ['Error', 'ErrorStmt', 'ErrorExpr']) {
      expect(nodeSet.types[nodeId(name)]?.isError).toBe(true)
    }
    expect(nodeSet.types[nodeId('IfStmt')]?.isError).toBe(false)
  })

  it('lists the four identifier roles as leaves', () => {
    expect([...IDENTIFIER_NAMES]).toEqual([
      'Identifier',
      'VariableDefinition',
      'SubprogramName',
      'CallName',
    ])
    for (const name of IDENTIFIER_NAMES) expect(LEAF_NAMES).toContain(name)
  })

  it('pairs each opener with its closer through closedBy and openedBy', () => {
    expect(MATCHING_PAIRS.length).toBe(8)
    for (const [opener, closer] of MATCHING_PAIRS) {
      const open = nodeSet.types[nodeId(keywordNodeName(opener))]
      const close = nodeSet.types[nodeId(keywordNodeName(closer))]
      expect(open?.prop(NodeProp.closedBy)).toEqual([keywordNodeName(closer)])
      expect(close?.prop(NodeProp.openedBy)).toEqual([keywordNodeName(opener)])
    }
    expect(nodeSet.types[nodeId('ThenKeyword')]?.prop(NodeProp.closedBy)).toBeUndefined()
    expect(nodeSet.types[nodeId('WhileKeyword')]?.prop(NodeProp.openedBy)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/nodes.test.ts`
Expected: FAIL — `Failed to resolve import "../src/nodes"`.

- [ ] **Step 3: Write `nodes.ts`**

Create `packages/codemirror/src/nodes.ts`:

```ts
import { NodeProp, NodeSet, NodeType } from '@lezer/common'
import { styleTags, tags as t } from '@lezer/highlight'
import { KEYWORD_KEYS, type KeywordKey } from '@stepcode/profiles'

/** One node per AST kind, plus the two plain records the tree keeps as nodes (spec §4.2). */
export const STRUCTURE_NAMES = [
  'Program',
  'MainBlock',
  'SubprogramDecl',
  'Param',
  'TypeRef',
  'DefineStmt',
  'DimensionStmt',
  'DimensionItem',
  'ConstantStmt',
  'AssignStmt',
  'WriteStmt',
  'ReadStmt',
  'IfStmt',
  'SwitchStmt',
  'SwitchCase',
  'WhileStmt',
  'RepeatStmt',
  'ForStmt',
  'BreakStmt',
  'ContinueStmt',
  'ReturnStmt',
  'CallStmt',
  'ClearStmt',
  'WaitStmt',
  'WaitKeyStmt',
  'ErrorStmt',
  'Index',
  'Call',
  'BuiltinCall',
  'Unary',
  'Binary',
  'ErrorExpr',
] as const

/** The identifier roles, all leaves (spec §4.3 rule 2). */
export const IDENTIFIER_NAMES = [
  'Identifier',
  'VariableDefinition',
  'SubprogramName',
  'CallName',
] as const

/** Every leaf type that is not a keyword. */
export const LEAF_NAMES = [
  ...IDENTIFIER_NAMES,
  'Number',
  'String',
  'Boolean',
  'TypeName',
  'BuiltinName',
  'AssignOp',
  'CompareOp',
  'ArithOp',
  'OpenParen',
  'CloseParen',
  'OpenBracket',
  'CloseBracket',
  'Punct',
  'Comment',
  'Error',
] as const

/** `if` → `IfKeyword`, `writeNoNewline` → `WriteNoNewlineKeyword`. */
export function keywordNodeName(key: KeywordKey): string {
  return `${key.charAt(0).toUpperCase()}${key.slice(1)}Keyword`
}

/** Opener ↔ closer, the pairs the bracket matcher and the fold rule know (spec §4.2). */
export const MATCHING_PAIRS: readonly (readonly [KeywordKey, KeywordKey])[] = [
  ['if', 'endIf'],
  ['switch', 'endSwitch'],
  ['while', 'endWhile'],
  ['for', 'endFor'],
  ['repeat', 'until'],
  ['procedure', 'endProcedure'],
  ['function', 'endFunction'],
  ['program', 'endProgram'],
]

export const NODE_NAMES: readonly string[] = [
  ...STRUCTURE_NAMES,
  ...LEAF_NAMES,
  ...KEYWORD_KEYS.map(keywordNodeName),
]

const ids = new Map<string, number>(NODE_NAMES.map((name, id) => [name, id]))

/** The id of a node type in `nodeSet`; unknown names are a programming error. */
export function nodeId(name: string): number {
  const id = ids.get(name)
  if (id === undefined) throw new Error(`unknown node type: ${name}`)
  return id
}

const ERROR_NAMES: ReadonlySet<string> = new Set(['Error', 'ErrorStmt', 'ErrorExpr'])
const closers = new Map<string, string>(
  MATCHING_PAIRS.map(([open, close]) => [keywordNodeName(open), keywordNodeName(close)]),
)
const openers = new Map<string, string>(
  MATCHING_PAIRS.map(([open, close]) => [keywordNodeName(close), keywordNodeName(open)]),
)

function propsFor(name: string): readonly [NodeProp<readonly string[]>, readonly string[]][] {
  const closer = closers.get(name)
  if (closer !== undefined) return [[NodeProp.closedBy, [closer]]]
  const opener = openers.get(name)
  if (opener !== undefined) return [[NodeProp.openedBy, [opener]]]
  return []
}

const keywords = (keys: readonly KeywordKey[]): string => keys.map(keywordNodeName).join(' ')

const CONTROL: readonly KeywordKey[] = [
  'if', 'then', 'elseIf', 'else', 'endIf', 'switch', 'case', 'otherwise', 'endSwitch',
  'while', 'do', 'endWhile', 'for', 'to', 'step', 'endFor', 'repeat', 'until', 'break',
  'continue', 'return',
]
const DEFINITION: readonly KeywordKey[] = [
  'program', 'endProgram', 'define', 'as', 'constant', 'dimension', 'procedure',
  'endProcedure', 'function', 'endFunction', 'byRef', 'byValue',
]
const OPERATOR: readonly KeywordKey[] = ['and', 'or', 'not', 'mod', 'div']
const IO: readonly KeywordKey[] = ['write', 'writeNoNewline', 'read', 'clearScreen', 'wait', 'waitKey']

/** Spec §5.1, as one `styleTags` source. `true`/`false` only appear inside `Boolean` leaves. */
const highlighting = styleTags({
  [keywords(CONTROL)]: t.controlKeyword,
  [keywords(DEFINITION)]: t.definitionKeyword,
  [keywords(OPERATOR)]: t.operatorKeyword,
  [keywords(IO)]: t.keyword,
  [keywords(['true', 'false'])]: t.bool,
  TypeName: t.typeName,
  BuiltinName: t.function(t.standard(t.variableName)),
  AssignOp: t.definitionOperator,
  CompareOp: t.compareOperator,
  ArithOp: t.arithmeticOperator,
  Number: t.number,
  String: t.string,
  Boolean: t.bool,
  Comment: t.lineComment,
  Identifier: t.variableName,
  VariableDefinition: t.definition(t.variableName),
  SubprogramName: t.function(t.definition(t.variableName)),
  CallName: t.function(t.variableName),
  'OpenParen CloseParen': t.paren,
  'OpenBracket CloseBracket': t.squareBracket,
  Punct: t.separator,
  'Error ErrorStmt ErrorExpr': t.invalid,
})

/**
 * The one node set. Built once at module load; `stepcodeLanguage` extends it per profile with
 * the language data prop on `Program`, which changes no id or name.
 */
export const nodeSet: NodeSet = new NodeSet(
  NODE_NAMES.map((name, id) =>
    NodeType.define({
      id,
      name,
      top: name === 'Program',
      error: ERROR_NAMES.has(name),
      props: propsFor(name),
    }),
  ),
).extend(highlighting)
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/nodes.test.ts`
Expected: PASS — 6 tests. Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0. (Biome may reflow the `CONTROL`/`DEFINITION` arrays one item per line; accept it.)

- [ ] **Step 5: Commit**

```bash
git add packages/codemirror/src/nodes.ts packages/codemirror/test/nodes.test.ts
git commit -m "feat(codemirror): node set with matching pairs and highlight tags"
```

---

### Task 3: the tree builder, the parser, the language

**Files:**
- Create: `packages/codemirror/src/tree.ts`, `packages/codemirror/src/parser.ts`
- Modify: `packages/codemirror/test/helpers.ts` (append)
- Create: `packages/codemirror/test/tree.test.ts`, `packages/codemirror/test/parser.test.ts`

**Interfaces:**
- Consumes: `nodeSet`, `nodeId`, `keywordNodeName` (Task 2); `CompileResult.tokens` (Task 1); `childrenOf`, `compile` from `stepcode`.
- Produces: `TreeData { result, identifiers, calls }`, `compileProp: NodeProp<TreeData>`, `buildTree(result: CompileResult, set?: NodeSet): Tree`; `stepcodeLanguage(profile): Language` (memoized), `languageData(profile): { commentTokens: { line: string } }` (Task 5 extends it), `treeDataAt(state): TreeData | null`, `compileResultAt(state): CompileResult | null`. Helpers: `treeFor(source, profile?)`, `leaves(tree)`, `stateFor(source, extensions?, profile?)`.

- [ ] **Step 1: Append the helpers**

Append to `packages/codemirror/test/helpers.ts` (merge the new imports into the import block; `pnpm lint:fix` sorts them):

```ts
import { ensureSyntaxTree } from '@codemirror/language'
import { EditorState, type Extension } from '@codemirror/state'
import type { SyntaxNode, Tree } from '@lezer/common'
import { compile } from 'stepcode'
import { stepcodeLanguage } from '../src/parser'
import { buildTree } from '../src/tree'

/** The tree for a source, built directly — no editor state involved. */
export function treeFor(source: string, profile: ResolvedProfile = es): Tree {
  return buildTree(compile(source, { profile }))
}

export interface Leaf {
  readonly name: string
  readonly from: number
  readonly to: number
}

/** Every childless node, in document order. */
export function leaves(tree: Tree): Leaf[] {
  const out: Leaf[] = []
  const visit = (node: SyntaxNode): void => {
    let child = node.firstChild
    if (child === null) {
      out.push({ name: node.name, from: node.from, to: node.to })
      return
    }
    while (child !== null) {
      visit(child)
      child = child.nextSibling
    }
  }
  visit(tree.topNode)
  return out
}

/** An editor state with the language installed and the whole document parsed. */
export function stateFor(
  source: string,
  extensions: Extension = [],
  profile: ResolvedProfile = es,
): EditorState {
  const state = EditorState.create({ doc: source, extensions: [stepcodeLanguage(profile), extensions] })
  ensureSyntaxTree(state, state.doc.length, 1e9)
  return state
}
```

- [ ] **Step 2: Write the failing tree tests**

Create `packages/codemirror/test/tree.test.ts`:

```ts
import type { SyntaxNode } from '@lezer/common'
import { describe, expect, it } from 'vitest'
import { compile } from 'stepcode'
import { keywordNodeName } from '../src/nodes'
import { buildTree, compileProp } from '../src/tree'
import { corpusSources, en, leaves, treeFor } from './helpers'

/** Children inside their parent, siblings ordered and disjoint, recursively. */
function assertNesting(node: SyntaxNode): void {
  let previousEnd = node.from
  for (let child = node.firstChild; child !== null; child = child.nextSibling) {
    expect(child.from).toBeGreaterThanOrEqual(previousEnd)
    expect(child.to).toBeLessThanOrEqual(node.to)
    expect(child.to).toBeGreaterThanOrEqual(child.from)
    previousEnd = child.to
    assertNesting(child)
  }
}

describe('buildTree over the corpus', () => {
  const cases = corpusSources().map((one) => [one.slug, one] as const)
  expect(cases.length).toBeGreaterThan(200)

  it.each(cases)('%s: leaves cover exactly the significant tokens, nested and in order', (_slug, c) => {
    const result = compile(c.source, { profile: c.profile })
    const tree = buildTree(result)
    expect(tree.length).toBe(c.source.length)
    expect(tree.prop(compileProp)?.result).toBe(result)
    assertNesting(tree.topNode)

    const expected = result.tokens
      .filter((t) => t.kind !== 'whitespace' && t.kind !== 'newline' && t.kind !== 'eof')
      .map((t) => `${t.span.start}-${t.span.end}`)
    const actual = leaves(tree)
      .filter((leaf) => leaf.from < leaf.to)
      .map((leaf) => `${leaf.from}-${leaf.to}`)
    expect(actual).toEqual(expected)

    const byStart = new Map(leaves(tree).map((leaf) => [leaf.from, leaf.name]))
    for (const token of result.tokens) {
      if (token.kind !== 'keyword' || typeof token.value !== 'string') continue
      const name = byStart.get(token.span.start)
      const keyword = keywordNodeName(token.value as Parameters<typeof keywordNodeName>[0])
      expect(name === keyword || name === 'Boolean').toBe(true)
    }
  })
})

describe('buildTree shapes', () => {
  const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

  it('makes the program keyword, the name and the closer direct children of MainBlock', () => {
    const tree = treeFor(main('  Escribir 1;'))
    const block = tree.topNode.getChild('MainBlock')
    expect(block).not.toBeNull()
    expect(block?.getChild('ProgramKeyword')?.from).toBe(0)
    expect(block?.getChild('SubprogramName')?.name).toBe('SubprogramName')
    expect(block?.getChild('EndProgramKeyword')).not.toBeNull()
    expect(tree.toString()).toContain('WriteStmt(WriteKeyword,Number')
  })

  it('flattens IfBranch: Si, Entonces, Sino and FinSi are siblings under IfStmt', () => {
    const tree = treeFor(main('  Si 1 < 2 Entonces\n    Escribir 1;\n  Sino\n    Escribir 2;\n  FinSi'))
    expect(tree.toString()).not.toContain('IfBranch')
    const stmt = tree.topNode.getChild('MainBlock')?.getChild('IfStmt')
    const names: string[] = []
    for (let child = stmt?.firstChild ?? null; child !== null; child = child.nextSibling) {
      names.push(child.name)
    }
    expect(names).toEqual([
      'IfKeyword',
      'Binary',
      'ThenKeyword',
      'WriteStmt',
      'ElseKeyword',
      'WriteStmt',
      'EndIfKeyword',
    ])
  })

  it('keeps SwitchCase as a node whose values and body are its children', () => {
    const source = main(
      '  Definir x Como Entero;\n  Segun x Hacer\n    1:\n      Escribir "uno";\n    De Otro Modo:\n      Escribir "otro";\n  FinSegun',
    )
    const stmt = treeFor(source).topNode.getChild('MainBlock')?.getChild('SwitchStmt')
    const kase = stmt?.getChild('SwitchCase')
    expect(kase?.getChild('Number')).not.toBeNull()
    expect(kase?.getChild('WriteStmt')).not.toBeNull()
    expect(stmt?.getChild('OtherwiseKeyword')).not.toBeNull()
    expect(stmt?.getChild('EndSwitchKeyword')).not.toBeNull()
  })

  it('names identifiers by role', () => {
    const source = [
      'Funcion r <- doble(n Como Entero)',
      '  r <- n * 2;',
      'FinFuncion',
      'Proceso p',
      '  Definir a Como Entero;',
      '  a <- doble(3);',
      'FinProceso',
    ].join('\n')
    const names = leaves(treeFor(source))
      .filter((leaf) => leaf.name.endsWith('Name') || leaf.name === 'Identifier' || leaf.name === 'VariableDefinition')
      .map((leaf) => `${leaf.name}:${source.slice(leaf.from, leaf.to)}`)
    expect(names).toEqual([
      'VariableDefinition:r',
      'SubprogramName:doble',
      'VariableDefinition:n',
      'TypeName:Entero',
      'Identifier:r',
      'Identifier:n',
      'SubprogramName:p',
      'VariableDefinition:a',
      'TypeName:Entero',
      'Identifier:a',
      'CallName:doble',
    ])
  })

  it('records identifier leaves and call nodes by offset', () => {
    const source = main('  Definir a Como Entero;\n  a <- Abs(-1);')
    const data = treeFor(source).prop(compileProp)
    const aOffset = source.indexOf('a <-')
    expect(data?.identifiers.get(aOffset)?.text).toBe('a')
    expect(data?.calls.get(source.indexOf('Abs'))?.kind).toBe('BuiltinCall')
  })

  it('drops a missing identifier instead of emitting a zero-width leaf', () => {
    const tree = treeFor(main('  Definir Como Entero;'))
    const define = tree.topNode.getChild('MainBlock')?.getChild('DefineStmt')
    expect(define?.getChild('VariableDefinition')).toBeNull()
    expect(define?.getChild('TypeRef')).not.toBeNull()
  })

  it('keeps garbage as an ErrorStmt node with its tokens inside', () => {
    const tree = treeFor(main('  ) 3;'))
    const error = tree.topNode.getChild('MainBlock')?.getChild('ErrorStmt')
    expect(error).not.toBeNull()
    expect(error?.type.isError).toBe(true)
  })

  it('attaches a comment to the innermost node containing it', () => {
    const source = main('  Si 1 < 2 Entonces // why\n    Escribir 1;\n  FinSi')
    const stmt = treeFor(source).topNode.getChild('MainBlock')?.getChild('IfStmt')
    const comment = stmt?.getChild('Comment')
    expect(comment).not.toBeNull()
    expect(source.slice(comment?.from, comment?.to)).toBe('// why')
  })

  it('builds under the en profile with the same node names', () => {
    const tree = treeFor('Program p\n  Write 1;\nEndProgram', en)
    expect(tree.topNode.getChild('MainBlock')?.getChild('EndProgramKeyword')).not.toBeNull()
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/tree.test.ts`
Expected: FAIL — `Failed to resolve import "../src/tree"`.

- [ ] **Step 4: Write `tree.ts`**

Create `packages/codemirror/src/tree.ts`:

```ts
import { NodeProp, type NodeSet, Tree } from '@lezer/common'
import type { KeywordKey, OperatorKey } from '@stepcode/profiles'
import type {
  BuiltinCall,
  Call,
  CompileResult,
  DimensionItem,
  Identifier,
  Literal,
  Node,
  SwitchCase,
  Token,
} from 'stepcode'
import { childrenOf } from 'stepcode'
import { nodeId, keywordNodeName, nodeSet as baseNodeSet } from './nodes'

/** What rides on the top node of every tree (spec §4.3). */
export interface TreeData {
  readonly result: CompileResult
  /** offset of an identifier leaf → its AST node, for hover, go to definition, signature help */
  readonly identifiers: ReadonlyMap<number, Identifier>
  /** offset of a Call or BuiltinCall node → its AST node */
  readonly calls: ReadonlyMap<number, Call | BuiltinCall>
}

export const compileProp = new NodeProp<TreeData>({ perNode: true })

/** An AST node, or one of the two plain records the tree keeps as nodes. */
type Emit = Node | SwitchCase | DimensionItem

const isNode = (one: Emit): one is Node => 'kind' in one

const recordName = (one: SwitchCase | DimensionItem): 'SwitchCase' | 'DimensionItem' =>
  'values' in one ? 'SwitchCase' : 'DimensionItem'

const bySource = (list: Emit[]): Emit[] => list.sort((a, b) => a.tokens[0] - b.tokens[0])

/** `childrenOf`, except that switch cases and dimension items stay whole (spec §4.3 rule 1). */
function childrenFor(one: Emit): Emit[] {
  if (!isNode(one)) {
    return 'values' in one ? [...one.values, ...one.body] : [one.name, ...one.sizes]
  }
  switch (one.kind) {
    case 'SwitchStmt':
      return bySource([one.selector, ...one.cases, ...(one.otherwise ?? [])])
    case 'DimensionStmt':
      return [...one.items]
    default:
      return childrenOf(one)
  }
}

/** Spec §4.3 rule 2: the leaf name of an identifier, from the field its parent holds it in. */
function identifierRole(id: Identifier, parent: Emit | null): string {
  if (parent === null) return 'Identifier'
  if (!isNode(parent)) {
    return !('values' in parent) && parent.name === id ? 'VariableDefinition' : 'Identifier'
  }
  switch (parent.kind) {
    case 'MainBlock':
      return parent.name === id ? 'SubprogramName' : 'Identifier'
    case 'SubprogramDecl':
      if (parent.name === id) return 'SubprogramName'
      return parent.returnName === id ? 'VariableDefinition' : 'Identifier'
    case 'Param':
    case 'ConstantStmt':
      return parent.name === id ? 'VariableDefinition' : 'Identifier'
    case 'DefineStmt':
      return parent.names.includes(id) ? 'VariableDefinition' : 'Identifier'
    case 'Call':
      return parent.callee === id ? 'CallName' : 'Identifier'
    default:
      return 'Identifier'
  }
}

function literalLeaf(literal: Literal): string {
  switch (literal.type) {
    case 'string':
      return 'String'
    case 'boolean':
      return 'Boolean'
    default:
      return 'Number'
  }
}

const COMPARE: ReadonlySet<OperatorKey> = new Set(['equal', 'notEqual', 'lt', 'le', 'gt', 'ge'])
const PUNCT: ReadonlyMap<string, string> = new Map([
  ['(', 'OpenParen'],
  [')', 'CloseParen'],
  ['[', 'OpenBracket'],
  [']', 'CloseBracket'],
])

/** The leaf type of a token, or `null` for the trivia the tree drops (spec §4.2). */
function tokenLeaf(token: Token): string | null {
  switch (token.kind) {
    case 'keyword':
      return keywordNodeName(token.value as KeywordKey)
    case 'type':
      return 'TypeName'
    case 'builtin':
      return 'BuiltinName'
    case 'operator': {
      const key = token.value as OperatorKey
      if (key === 'assign') return 'AssignOp'
      return COMPARE.has(key) ? 'CompareOp' : 'ArithOp'
    }
    case 'identifier':
      return 'Identifier'
    case 'integer':
    case 'real':
      return 'Number'
    case 'string':
      return 'String'
    case 'punct':
      return PUNCT.get(token.text) ?? 'Punct'
    case 'comment':
      return 'Comment'
    case 'error':
      return 'Error'
    default:
      return null
  }
}

/**
 * Emits the postfix buffer `Tree.build` wants: every child before its parent, four numbers
 * per node. Recursive over the AST; a program deep enough to matter here is not one an
 * editor shows.
 */
class Builder {
  readonly buffer: number[] = []
  readonly identifiers = new Map<number, Identifier>()
  readonly calls = new Map<number, Call | BuiltinCall>()

  constructor(private readonly tokens: readonly Token[]) {}

  private leaf(name: string, start: number, end: number): void {
    this.buffer.push(nodeId(name), start, end, 4)
  }

  /** Leaves for the tokens `first..last` (inclusive) that no child claimed. */
  private tokensBetween(first: number, last: number): void {
    for (let index = first; index <= last; index++) {
      const token = this.tokens[index]
      if (token === undefined) continue
      const name = tokenLeaf(token)
      if (name !== null) this.leaf(name, token.span.start, token.span.end)
    }
  }

  /** The children and loose tokens of `one`, without `one` itself. */
  emitChildren(one: Emit): void {
    const [first, last] = one.tokens
    let next = first
    for (const child of childrenFor(one)) {
      const [childFirst, childLast] = child.tokens
      this.tokensBetween(next, childFirst - 1)
      this.emit(child, one)
      next = Math.max(next, childLast + 1)
    }
    this.tokensBetween(next, last)
  }

  emit(one: Emit, parent: Emit | null): void {
    if (isNode(one)) {
      if (one.kind === 'Identifier') {
        if (one.missing === true) return
        this.identifiers.set(one.span.start, one)
        this.leaf(identifierRole(one, parent), one.span.start, one.span.end)
        return
      }
      if (one.kind === 'Literal') {
        this.leaf(literalLeaf(one), one.span.start, one.span.end)
        return
      }
      if (one.kind === 'Call' || one.kind === 'BuiltinCall') this.calls.set(one.span.start, one)
    }
    const start = this.buffer.length
    this.emitChildren(one)
    const name = isNode(one) ? one.kind : recordName(one)
    this.buffer.push(nodeId(name), one.span.start, one.span.end, this.buffer.length - start + 4)
  }
}

/**
 * The Lezer tree for one compile result. `set` is the node set to build with — the base set,
 * or a language's extension of it; ids are the same either way.
 */
export function buildTree(result: CompileResult, set: NodeSet = baseNodeSet): Tree {
  const builder = new Builder(result.tokens)
  builder.emitChildren(result.ast)
  const built = Tree.build({
    buffer: builder.buffer,
    nodeSet: set,
    topID: nodeId('Program'),
    length: result.source.length,
  })
  const data: TreeData = {
    result,
    identifiers: builder.identifiers,
    calls: builder.calls,
  }
  return new Tree(built.type, built.children, built.positions, built.length, [[compileProp, data]])
}
```

- [ ] **Step 5: Run the tree tests**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/tree.test.ts`
Expected: PASS — the corpus loop (200+ programs) and the 9 shape tests. If a corpus program fails the leaf comparison, the failing token is one the AST claims in no node's token range or one whose span lies outside its node's span; report it as a language-package finding in the task report rather than patching the builder around it.

- [ ] **Step 6: Write the failing parser tests**

Create `packages/codemirror/test/parser.test.ts`:

```ts
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { compileResultAt, stepcodeLanguage, treeDataAt } from '../src/parser'
import { en, es, stateFor } from './helpers'

describe('stepcodeLanguage', () => {
  it('is one Language per profile object', () => {
    expect(stepcodeLanguage(es)).toBe(stepcodeLanguage(es))
    expect(stepcodeLanguage(es)).not.toBe(stepcodeLanguage(en))
    expect(stepcodeLanguage(es).name).toBe('stepcode')
  })

  it('parses the whole document into a Program tree carrying the compile result', () => {
    const state = stateFor('Proceso p\n  Escribir noExiste;\nFinProceso')
    const tree = syntaxTree(state)
    expect(tree.topNode.name).toBe('Program')
    expect(tree.length).toBe(state.doc.length)
    expect(compileResultAt(state)?.diagnostics.map((d) => d.code)).toEqual(['E3001'])
    expect(treeDataAt(state)?.identifiers.size).toBe(2)
  })

  it('reparses after an edit', () => {
    const source = 'Proceso p\n  Escribir noExiste;\nFinProceso'
    const state = stateFor(source)
    const from = source.indexOf('noExiste')
    const next = state.update({ changes: { from, to: from + 'noExiste'.length, insert: '1' } }).state
    ensureSyntaxTree(next, next.doc.length, 1e9)
    expect(compileResultAt(next)?.diagnostics).toEqual([])
    expect(compileResultAt(next)?.source).toBe(next.doc.toString())
  })

  it('exposes the profile comment spelling as language data', () => {
    const state = stateFor('Proceso p\nFinProceso')
    expect(state.languageDataAt<{ line: string }>('commentTokens', 0)).toEqual([{ line: '//' }])
  })

  it('returns null before any parse', () => {
    expect(compileResultAt(EditorState.create({ doc: 'x' }))).toBeNull()
  })
})
```

- [ ] **Step 7: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/parser.test.ts`
Expected: FAIL — `Failed to resolve import "../src/parser"`.

- [ ] **Step 8: Write `parser.ts`**

Create `packages/codemirror/src/parser.ts`:

```ts
import { defineLanguageFacet, Language, languageDataProp, syntaxTree } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import {
  type Input,
  type NodeSet,
  Parser,
  type PartialParse,
  type Tree,
  type TreeFragment,
} from '@lezer/common'
import type { ResolvedProfile } from '@stepcode/profiles'
import { type CompileResult, compile } from 'stepcode'
import { nodeSet } from './nodes'
import { buildTree, compileProp, type TreeData } from './tree'

/**
 * Spec §4.1: one `advance()` compiles the whole input and returns its tree. Not incremental;
 * `fragments` and `ranges` are accepted and ignored, `stopAt` is recorded and ignored.
 */
class StepcodeParser extends Parser {
  constructor(
    private readonly profile: ResolvedProfile,
    private readonly set: NodeSet,
  ) {
    super()
  }

  createParse(
    input: Input,
    _fragments: readonly TreeFragment[],
    _ranges: readonly { from: number; to: number }[],
  ): PartialParse {
    const { profile, set } = this
    let parsedPos = 0
    let stoppedAt: number | null = null
    return {
      get parsedPos() {
        return parsedPos
      },
      get stoppedAt() {
        return stoppedAt
      },
      stopAt(pos: number) {
        stoppedAt = pos
      },
      advance(): Tree {
        const tree = buildTree(compile(input.read(0, input.length), { profile }), set)
        parsedPos = input.length
        return tree
      },
    }
  }
}

/** The language data for a profile; Task 5 adds `indentOnInput`. */
export function languageData(profile: ResolvedProfile): { [name: string]: unknown } {
  return { commentTokens: { line: profile.operators.comment[0] ?? '//' } }
}

const languages = new WeakMap<ResolvedProfile, Language>()

/**
 * One `Language` per profile object, cached: `stepcodeCompletion` registers through its data
 * facet, so every extension built for a profile must see the same instance.
 */
export function stepcodeLanguage(profile: ResolvedProfile): Language {
  const cached = languages.get(profile)
  if (cached !== undefined) return cached
  const data = defineLanguageFacet(languageData(profile))
  const set = nodeSet.extend(languageDataProp.add({ Program: data }))
  const language = new Language(data, new StepcodeParser(profile, set), [], 'stepcode')
  languages.set(profile, language)
  return language
}

/** The data on the current tree, or `null` before a parse has produced one. */
export function treeDataAt(state: EditorState): TreeData | null {
  return syntaxTree(state).prop(compileProp) ?? null
}

export function compileResultAt(state: EditorState): CompileResult | null {
  return treeDataAt(state)?.result ?? null
}
```

- [ ] **Step 9: Run all package tests, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror`
Expected: PASS (nodes, strings, index, tree, parser). Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0.

- [ ] **Step 10: Commit**

```bash
git add packages/codemirror/src/tree.ts packages/codemirror/src/parser.ts packages/codemirror/test
git commit -m "feat(codemirror): Lezer tree from the compile result and the stepcode Language"
```

---

### Task 4: highlighting test and lint

**Files:**
- Create: `packages/codemirror/src/options.ts`, `packages/codemirror/src/lint.ts`
- Create: `packages/codemirror/test/highlight.test.ts`, `packages/codemirror/test/lint.test.ts`

**Interfaces:**
- Consumes: `treeDataAt` (Task 3), `stringsFor` (Task 1), `formatDiagnostic`, `Span`, `Severity` from `stepcode`; `linter`, `Diagnostic` from `@codemirror/lint`.
- Produces: `StepcodeOptions { readonly profile: ResolvedProfile; readonly locale: string }` (every later feature takes it); `widen(state, span): { from, to }`; `stepcodeDiagnostics(state, options): Diagnostic[]`; `stepcodeLint(options): Extension`.

- [ ] **Step 1: Write the highlighting test** (the tags were set in Task 2; this pins spec §5.1 as behaviour)

Create `packages/codemirror/test/highlight.test.ts`:

```ts
import { highlightTree, tagHighlighter, tags as t } from '@lezer/highlight'
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
    expect(classesOf('Proceso p\n  ) 3;\nFinProceso', ')')).toContain('invalid')
  })
})
```

- [ ] **Step 2: Run it**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/highlight.test.ts`
Expected: PASS. If the `invalid` case fails because the `)` inside an `ErrorStmt` is highlighted as `paren` (the leaf's own tag wins over the parent's), change that assertion to `expect(highlights('Proceso p\n  ) 3;\nFinProceso').some(([, c]) => c.includes('invalid'))).toBe(true)` — the intent is that an `ErrorStmt` region carries `invalid` somewhere; leaves inside it may keep their own tags. Record the outcome in the task report.

- [ ] **Step 3: Write the failing lint test**

Create `packages/codemirror/test/lint.test.ts` (happy-dom, because the replace action needs an `EditorView`):

```ts
// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from 'stepcode'
import { compileResultAt } from '../src/parser'
import { stepcodeDiagnostics, stepcodeLint, widen } from '../src/lint'
import { corpusSources, en, es, stateFor } from './helpers'

const options = { profile: es, locale: 'es' }

describe('stepcodeDiagnostics', () => {
  const guides = corpusSources().filter((one) => one.source.startsWith('// expect: E'))
  expect(guides.length).toBeGreaterThan(20)

  it.each(guides.map((one) => [one.slug, one] as const))(
    '%s: one lint diagnostic per compile diagnostic, formatted per locale',
    (_slug, c) => {
      const state = stateFor(c.source, [], c.profile)
      const compiled = compileResultAt(state)
      const lint = stepcodeDiagnostics(state, options)
      expect(lint.map((d) => d.source)).toEqual(compiled?.diagnostics.map((d) => d.code))
      for (const [index, d] of lint.entries()) {
        const original = compiled?.diagnostics[index]
        expect(d.to).toBeGreaterThanOrEqual(d.from)
        expect(d.message).toBe(
          original === undefined ? '' : formatDiagnostic(original, 'es', es),
        )
        expect(d.severity).toBe(original?.severity)
      }
    },
  )

  it('renders in the requested locale', () => {
    const state = stateFor('Proceso p\n  Escribir noExiste;\nFinProceso')
    const [d] = stepcodeDiagnostics(state, { profile: es, locale: 'en' })
    expect(d?.source).toBe('E3001')
    expect(d?.message).toMatch(/noExiste/)
    expect(d?.message).not.toMatch(/declarad/)
  })

  it('offers the checker suggestion as a replace action', () => {
    const source = 'Proceso p\n  Definir total Como Entero;\n  totl <- 1;\nFinProceso'
    const state = stateFor(source)
    const [d] = stepcodeDiagnostics(state, options)
    expect(d?.source).toBe('E3001')
    expect(d?.actions?.map((a) => a.name)).toEqual(['Cambiar a «total»'])
    const view = new EditorView({ state })
    d?.actions?.[0]?.apply(view, d.from, d.to)
    expect(view.state.doc.toString()).toBe(source.replace('totl', 'total'))
    view.destroy()
  })

  it('returns nothing before a parse exists', () => {
    expect(stepcodeDiagnostics(EditorState.create({ doc: 'x' }), options)).toEqual([])
  })

  it('works under the en profile', () => {
    const state = stateFor('Program p\n  Write nope;\nEndProgram', [], en)
    expect(stepcodeDiagnostics(state, { profile: en, locale: 'en' }).map((d) => d.source)).toEqual([
      'E3001',
    ])
  })
})

describe('widen', () => {
  it('keeps a non-empty span', () => {
    const state = EditorState.create({ doc: 'abc\ndef' })
    expect(widen(state, { start: 1, end: 3 })).toEqual({ from: 1, to: 3 })
  })

  it('widens to the right inside a line', () => {
    const state = EditorState.create({ doc: 'abc\ndef' })
    expect(widen(state, { start: 1, end: 1 })).toEqual({ from: 1, to: 2 })
  })

  it('widens to the left at the end of a line', () => {
    const state = EditorState.create({ doc: 'abc\ndef' })
    expect(widen(state, { start: 3, end: 3 })).toEqual({ from: 2, to: 3 })
  })

  it('widens to the left at the end of the document', () => {
    const state = EditorState.create({ doc: 'abc' })
    expect(widen(state, { start: 3, end: 3 })).toEqual({ from: 2, to: 3 })
  })

  it('leaves an empty line or document alone', () => {
    expect(widen(EditorState.create({ doc: '' }), { start: 0, end: 0 })).toEqual({ from: 0, to: 0 })
    expect(widen(EditorState.create({ doc: 'a\n\nb' }), { start: 2, end: 2 })).toEqual({
      from: 2,
      to: 2,
    })
  })
})

describe('stepcodeLint', () => {
  it('is an extension a state accepts', () => {
    const state = EditorState.create({ doc: 'x', extensions: stepcodeLint(options) })
    expect(state.doc.toString()).toBe('x')
  })
})
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/lint.test.ts`
Expected: FAIL — `Failed to resolve import "../src/lint"`.

- [ ] **Step 5: Write `options.ts` and `lint.ts`**

Create `packages/codemirror/src/options.ts`:

```ts
import type { ResolvedProfile } from '@stepcode/profiles'

/** What every language feature needs: the profile the tree was built with and a locale. */
export interface StepcodeOptions {
  readonly profile: ResolvedProfile
  readonly locale: string
}
```

Create `packages/codemirror/src/lint.ts`:

```ts
import { syntaxTree } from '@codemirror/language'
import { type Diagnostic, linter } from '@codemirror/lint'
import type { EditorState, Extension } from '@codemirror/state'
import { formatDiagnostic, type Span } from 'stepcode'
import type { StepcodeOptions } from './options'
import { treeDataAt } from './parser'
import { stringsFor } from './strings'

/**
 * Spec §5.2: a zero-width span is widened one character to the right, or to the left at the
 * end of its line, so the squiggle is visible; an empty line or document stays empty.
 */
export function widen(state: EditorState, span: Span): { from: number; to: number } {
  if (span.end > span.start) return { from: span.start, to: span.end }
  const line = state.doc.lineAt(span.start)
  if (span.start < line.to) return { from: span.start, to: span.start + 1 }
  if (span.start > line.from) return { from: span.start - 1, to: span.start }
  return { from: span.start, to: span.start }
}

/** The tree's compile diagnostics as CodeMirror diagnostics; empty before the first parse. */
export function stepcodeDiagnostics(state: EditorState, options: StepcodeOptions): Diagnostic[] {
  const data = treeDataAt(state)
  if (data === null) return []
  const strings = stringsFor(options.locale)
  return data.result.diagnostics.map((diagnostic) => {
    const { from, to } = widen(state, diagnostic.span)
    const base: Diagnostic = {
      from,
      to,
      severity: diagnostic.severity,
      source: diagnostic.code,
      message: formatDiagnostic(diagnostic, options.locale, options.profile),
    }
    const suggestion = diagnostic.data.suggestion
    if (typeof suggestion !== 'string') return base
    return {
      ...base,
      actions: [
        {
          name: strings.replaceWith(suggestion),
          apply: (view, actionFrom, actionTo) => {
            view.dispatch({ changes: { from: actionFrom, to: actionTo, insert: suggestion } })
          },
        },
      ],
    }
  })
}

/** Lint from the tree, re-run after every completed parse. */
export function stepcodeLint(options: StepcodeOptions): Extension {
  return linter((view) => stepcodeDiagnostics(view.state, options), {
    delay: 250,
    needsRefresh: (update) => syntaxTree(update.state) !== syntaxTree(update.startState),
  })
}
```

- [ ] **Step 6: Run the tests, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/lint.test.ts`
Expected: PASS. Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0.

- [ ] **Step 7: Commit**

```bash
git add packages/codemirror/src/options.ts packages/codemirror/src/lint.ts packages/codemirror/test/highlight.test.ts packages/codemirror/test/lint.test.ts
git commit -m "feat(codemirror): lint from the tree, highlighting pinned"
```

---

### Task 5: folding and indentation

**Files:**
- Create: `packages/codemirror/src/blocks.ts`
- Modify: `packages/codemirror/src/parser.ts` (`languageData`, `stepcodeLanguage`)
- Create: `packages/codemirror/test/fold.test.ts`, `packages/codemirror/test/indent.test.ts`

**Interfaces:**
- Consumes: `keywordNodeName` (Task 2); `foldNodeProp`, `indentNodeProp`, `TreeIndentContext`, `syntaxTree` from `@codemirror/language`.
- Produces: `BLOCK_NAMES`, `closerOf(node): SyntaxNode | null`, `foldBlock(node, state)`, `blockProps(profile): NodePropSource[]`, `indentOnInputPatterns(profile): RegExp[]`. `stepcodeLanguage` now extends the node set with `blockProps(profile)` and the language data with `indentOnInput`.

- [ ] **Step 1: Write the failing fold test**

Create `packages/codemirror/test/fold.test.ts`:

```ts
import { foldable } from '@codemirror/language'
import { describe, expect, it } from 'vitest'
import { stateFor } from './helpers'

/** The fold range of the line containing `marker`, as document text, or null. */
function foldOf(source: string, marker: string): string | null {
  const state = stateFor(source)
  const line = state.doc.lineAt(source.indexOf(marker))
  const range = foldable(state, line.from, line.to)
  return range === null ? null : source.slice(range.from, range.to)
}

const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

describe('folding', () => {
  it('folds a main block from the end of its first line to its closer', () => {
    expect(foldOf(main('  Escribir 1;'), 'Proceso')).toBe('\n  Escribir 1;\n')
  })

  it('folds Si to FinSi, keeping the closer visible', () => {
    const source = main('  Si 1 < 2 Entonces\n    Escribir 1;\n  Sino\n    Escribir 2;\n  FinSi')
    expect(foldOf(source, 'Si 1')).toBe('\n    Escribir 1;\n  Sino\n    Escribir 2;\n  ')
  })

  it('folds every other block kind', () => {
    expect(foldOf(main('  Mientras 1 < 2 Hacer\n    Escribir 1;\n  FinMientras'), 'Mientras')).toBe(
      '\n    Escribir 1;\n  ',
    )
    expect(foldOf(main('  Definir i Como Entero;\n  Para i <- 1 Hasta 3 Hacer\n    Escribir i;\n  FinPara'), 'Para')).toBe(
      '\n    Escribir i;\n  ',
    )
    expect(foldOf(main('  Repetir\n    Escribir 1;\n  Hasta Que 1 < 2'), 'Repetir')).toBe(
      '\n    Escribir 1;\n  ',
    )
    const source = [
      'Funcion r <- doble(n Como Entero)',
      '  r <- n * 2;',
      'FinFuncion',
      'Proceso p',
      '  Escribir doble(1);',
      'FinProceso',
    ].join('\n')
    expect(foldOf(source, 'Funcion')).toBe('\n  r <- n * 2;\n')
  })

  it('folds Segun and each case with a body', () => {
    const source = main(
      '  Definir x Como Entero;\n  Segun x Hacer\n    1:\n      Escribir "uno";\n    2:\n    De Otro Modo:\n      Escribir "otro";\n  FinSegun',
    )
    expect(foldOf(source, 'Segun')).toBe(
      '\n    1:\n      Escribir "uno";\n    2:\n    De Otro Modo:\n      Escribir "otro";\n  ',
    )
    expect(foldOf(source, '1:')).toBe('\n      Escribir "uno";')
    expect(foldOf(source, '2:')).toBeNull()
  })

  it('does not fold a single-line block', () => {
    expect(foldOf(main('  Si 1 < 2 Entonces Escribir 1; FinSi'), 'Si 1')).toBeNull()
  })

  it('folds an unclosed block to its end', () => {
    const source = 'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\nFinProceso'
    expect(foldOf(source, 'Si 1')).toBe('\n    Escribir 1;')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/fold.test.ts`
Expected: FAIL — every `foldOf` returns `null` (no fold prop yet).

- [ ] **Step 3: Write the failing indentation test**

Create `packages/codemirror/test/indent.test.ts`:

```ts
import { getIndentation } from '@codemirror/language'
import { describe, expect, it } from 'vitest'
import { en, stateFor } from './helpers'
import { indentOnInputPatterns } from '../src/blocks'
import { es } from './helpers'

/** The indentation CodeMirror computes for the line containing `marker` (or the first blank line after `after`). */
function indentAt(source: string, marker: string, profile = es): number | null {
  const state = stateFor(source, [], profile)
  const line = state.doc.lineAt(source.indexOf(marker))
  return getIndentation(state, line.from)
}

const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

describe('indentation', () => {
  it('indents the line after a block opener', () => {
    expect(indentAt(main('  Si 1 < 2 Entonces\n@\n  FinSi'), '@')).toBe(4)
    expect(indentAt('Proceso p\n@\nFinProceso', '@')).toBe(2)
  })

  it('dedents Sino, Sino Si and FinSi to the opener', () => {
    const source = main('  Si 1 < 2 Entonces\n    Escribir 1;\nSino Si 2 < 3 Entonces\n    Escribir 2;\nSino\n    Escribir 3;\nFinSi')
    expect(indentAt(source, 'Sino Si')).toBe(2)
    expect(indentAt(source, 'Sino\n')).toBe(2)
    expect(indentAt(source, 'FinSi')).toBe(2)
  })

  it('keeps a statement inside the body at one unit', () => {
    expect(indentAt(main('  Si 1 < 2 Entonces\n    Escribir 1;\n@\n  FinSi'), '@')).toBe(4)
  })

  it('nests', () => {
    const source = main('  Mientras 1 < 2 Hacer\n    Si 2 < 3 Entonces\n@\n    FinSi\n  FinMientras')
    expect(indentAt(source, '@')).toBe(6)
    expect(indentAt(source, 'FinSi')).toBe(4)
    expect(indentAt(source, 'FinMientras')).toBe(2)
  })

  it('handles multi-word closers and Para/Repetir', () => {
    expect(indentAt(main('  Repetir\n    Escribir 1;\nHasta Que 1 < 2'), 'Hasta Que')).toBe(2)
    expect(indentAt(main('  Definir i Como Entero;\n  Para i <- 1 Hasta 3 Hacer\n@\n  FinPara'), '@')).toBe(4)
    expect(indentAt(main('  Definir i Como Entero;\n  Para i <- 1 Hasta 3 Hacer\n    Escribir i;\nFinPara'), 'FinPara')).toBe(2)
  })

  it('indents a subprogram body and dedents its closer', () => {
    const source = 'Funcion r <- doble(n Como Entero)\n@\nFinFuncion\nProceso p\n  Escribir doble(1);\nFinProceso'
    expect(indentAt(source, '@')).toBe(2)
    expect(indentAt(source, 'FinFuncion')).toBe(0)
  })

  it('Segun: case lines one unit, case bodies two, closer at the opener', () => {
    const source = main(
      '  Definir x Como Entero;\n  Segun x Hacer\n    1:\n      Escribir "uno";\n@\n2:\n      Escribir "dos";\nDe Otro Modo:\n#\n  FinSegun',
    )
    expect(indentAt(source, '@')).toBe(6)
    expect(indentAt(source, '2:')).toBe(4)
    expect(indentAt(source, 'De Otro Modo')).toBe(4)
    expect(indentAt(source, '#')).toBe(6)
    expect(indentAt(source, 'FinSegun')).toBe(2)
    expect(indentAt(main('  Definir x Como Entero;\n  Segun x Hacer\n@\n  FinSegun'), '@')).toBe(4)
  })

  it('works under en', () => {
    const source = 'Program p\n  If 1 < 2 Then\n@\nElse\n    Write 2;\n  EndIf\nEndProgram'
    expect(indentAt(source, '@', en)).toBe(4)
    expect(indentAt(source, 'Else', en)).toBe(2)
  })
})

describe('indentOnInputPatterns', () => {
  it('matches a dedent keyword typed at the start of a line, in any case', () => {
    const [keywords] = indentOnInputPatterns(es)
    expect(keywords?.test('  FinSi')).toBe(true)
    expect(keywords?.test('  finsi')).toBe(true)
    expect(keywords?.test('  Sino Si')).toBe(true)
    expect(keywords?.test('  Hasta Que')).toBe(true)
    expect(keywords?.test('  Si')).toBe(false)
    expect(keywords?.test('  FinSi x')).toBe(false)
  })

  it('matches a case line', () => {
    const [, caseLine] = indentOnInputPatterns(es)
    expect(caseLine?.test('    2:')).toBe(true)
    expect(caseLine?.test('    "a":')).toBe(true)
    expect(caseLine?.test('    Escribir a:')).toBe(true)
    expect(caseLine?.test('    :')).toBe(false)
  })

  it('is exposed as language data', () => {
    const state = stateFor('Proceso p\nFinProceso')
    expect(state.languageDataAt<RegExp>('indentOnInput', 0)).toHaveLength(2)
  })
})
```

Note on `'Sino\n'` as a marker: `source.indexOf('Sino\n')` finds the bare `Sino` line, not `Sino Si`. Write the file's imports as one sorted block (`pnpm lint:fix` merges the two `./helpers` imports; or write `import { en, es, stateFor } from './helpers'` directly).

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/indent.test.ts`
Expected: FAIL — `Failed to resolve import "../src/blocks"`.

- [ ] **Step 5: Write `blocks.ts`**

Create `packages/codemirror/src/blocks.ts`:

```ts
import { foldNodeProp, indentNodeProp, syntaxTree, type TreeIndentContext } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import type { NodePropSource, SyntaxNode } from '@lezer/common'
import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import { keywordNodeName } from './nodes'

export const BLOCK_NAMES = [
  'IfStmt',
  'SwitchStmt',
  'SwitchCase',
  'WhileStmt',
  'RepeatStmt',
  'ForStmt',
  'SubprogramDecl',
  'MainBlock',
] as const

export type BlockName = (typeof BLOCK_NAMES)[number]

/** The keyword leaf that closes each block, when it has one. */
const CLOSERS: Readonly<Record<BlockName, readonly KeywordKey[]>> = {
  IfStmt: ['endIf'],
  SwitchStmt: ['endSwitch'],
  SwitchCase: [],
  WhileStmt: ['endWhile'],
  RepeatStmt: ['until', 'while'],
  ForStmt: ['endFor'],
  SubprogramDecl: ['endProcedure', 'endFunction'],
  MainBlock: ['endProgram'],
}

/** Lines that sit at the block's own column (spec §5.4). `SwitchStmt` handles its own. */
const DEDENT: Readonly<Record<BlockName, readonly KeywordKey[]>> = {
  IfStmt: ['elseIf', 'else', 'endIf'],
  SwitchStmt: ['endSwitch'],
  SwitchCase: ['otherwise', 'endSwitch'],
  WhileStmt: ['endWhile'],
  RepeatStmt: ['until'],
  ForStmt: ['endFor'],
  SubprogramDecl: ['endProcedure', 'endFunction'],
  MainBlock: ['endProgram'],
}

const ALL_DEDENT_KEYS: readonly KeywordKey[] = [
  ...new Set(Object.values(DEDENT).flat()),
]

/** `valor:` on its own — a case line under `Segun` (plan deviation 4). */
const CASE_LINE = /^\s*[^:\s][^:]*:\s*$/

/** The closer keyword leaf of a block node, or null when it is missing or the block has none. */
export function closerOf(node: SyntaxNode): SyntaxNode | null {
  const closers = CLOSERS[node.name as BlockName] ?? []
  for (const key of closers) {
    const found = node.getChild(keywordNodeName(key))
    if (found !== null) return found
  }
  return null
}

/** Spec §5.3. */
export function foldBlock(node: SyntaxNode, state: EditorState): { from: number; to: number } | null {
  const from = state.doc.lineAt(node.from).to
  const closer = closerOf(node)
  const to = closer === null ? node.to : closer.from
  return from < to ? { from, to } : null
}

/**
 * Does `text` start with one of `keys`, spelled per `profile`? Longest phrase first, up to the
 * profile's longest keyword, so `Sino Si` beats `Sino`; a trailing colon is ignored.
 */
export function startsWithKeyword(
  profile: ResolvedProfile,
  text: string,
  keys: readonly KeywordKey[],
): boolean {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
  for (let count = Math.min(profile.maxWords, words.length); count >= 1; count--) {
    const phrase = words.slice(0, count).join(' ').replace(/:$/, '')
    const entry = profile.lookup.get(profile.normalize(phrase))
    if (entry?.kind === 'keyword') return keys.includes(entry.key as KeywordKey)
  }
  return false
}

/** The end of the last non-blank text before `upto`, or null when there is none. */
function lastTextBefore(context: TreeIndentContext, upto: number): number | null {
  const doc = context.state.doc
  let pos = upto
  while (pos > 0) {
    const line = doc.lineAt(pos - 1)
    const text = doc.sliceString(line.from, Math.min(line.to, pos)).trimEnd()
    if (text.length > 0) return line.from + text.length
    pos = line.from
  }
  return null
}

/** The direct child of `block` that contains the previous non-blank line's end, if any. */
function previousChild(context: TreeIndentContext, block: SyntaxNode): SyntaxNode | null {
  const here = context.lineAt(context.pos, -1)
  const end = lastTextBefore(context, here.from)
  if (end === null) return null
  let node: SyntaxNode | null = syntaxTree(context.state).resolveInner(end, -1)
  while (node !== null) {
    const parent = node.parent
    if (parent === null) return null
    if (parent.from === block.from && parent.name === block.name) return node
    node = parent
  }
  return null
}

function indentSwitch(context: TreeIndentContext, profile: ResolvedProfile): number | null {
  const text = context.textAfter
  const base = context.baseIndent
  if (startsWithKeyword(profile, text, ['endSwitch'])) return base
  if (startsWithKeyword(profile, text, ['otherwise']) || CASE_LINE.test(text)) return base + context.unit
  const previous = previousChild(context, context.node)
  if (previous === null) return base + context.unit
  if (previous.name === 'SwitchCase') return context.lineIndent(previous.from) + context.unit
  const otherwise = context.node.getChild(keywordNodeName('otherwise'))
  if (otherwise !== null && previous.from >= otherwise.from && previous.name !== keywordNodeName('endSwitch')) {
    return base + 2 * context.unit
  }
  return base + context.unit
}

function indentCase(context: TreeIndentContext, profile: ResolvedProfile): number | null {
  const text = context.textAfter
  if (startsWithKeyword(profile, text, DEDENT.SwitchCase) || CASE_LINE.test(text)) {
    return context.continue()
  }
  return context.baseIndent + context.unit
}

function indentBlock(context: TreeIndentContext, profile: ResolvedProfile): number | null {
  const name = context.node.name as BlockName
  if (name === 'SwitchStmt') return indentSwitch(context, profile)
  if (name === 'SwitchCase') return indentCase(context, profile)
  const dedent = startsWithKeyword(profile, context.textAfter, DEDENT[name])
  return context.baseIndent + (dedent ? 0 : context.unit)
}

/** The fold and indent props for every block node, bound to one profile's spellings. */
export function blockProps(profile: ResolvedProfile): NodePropSource[] {
  const fold: Record<string, typeof foldBlock> = {}
  const indent: Record<string, (context: TreeIndentContext) => number | null> = {}
  for (const name of BLOCK_NAMES) {
    fold[name] = foldBlock
    indent[name] = (context) => indentBlock(context, profile)
  }
  return [foldNodeProp.add(fold), indentNodeProp.add(indent)]
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Spec §5.4: re-indent a line once it reads as a dedent keyword (every spelling of every
 * dedent key, longest first) or as a case line.
 */
export function indentOnInputPatterns(profile: ResolvedProfile): RegExp[] {
  const spellings = [...new Set(ALL_DEDENT_KEYS.flatMap((key) => profile.keywords[key] ?? []))]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
  const flags = profile.options.caseSensitive ? '' : 'i'
  return [new RegExp(`^\\s*(?:${spellings.join('|')})$`, flags), /^\s*[^:\s][^:]*:$/]
}
```

- [ ] **Step 6: Wire the props into the language**

`languageDataAt('indentOnInput', pos)` returns one entry per facet value that carries the key and does not flatten arrays, and `indentOnInput()` calls `.test` on each entry — so the two patterns must be two facet values, not one array. In `packages/codemirror/src/parser.ts`, import `blockProps, indentOnInputPatterns` from `./blocks` and change `stepcodeLanguage` to:

```ts
export function stepcodeLanguage(profile: ResolvedProfile): Language {
  const cached = languages.get(profile)
  if (cached !== undefined) return cached
  const data = defineLanguageFacet(languageData(profile))
  const set = nodeSet.extend(languageDataProp.add({ Program: data }), ...blockProps(profile))
  // Spec §5.4: one `indentOnInput` rule per pattern, each its own facet value.
  const rules = indentOnInputPatterns(profile).map((pattern) => data.of({ indentOnInput: pattern }))
  const language = new Language(data, new StepcodeParser(profile, set), rules, 'stepcode')
  languages.set(profile, language)
  return language
}
```

`languageData(profile)` is unchanged (comment tokens only).

- [ ] **Step 7: Run both test files**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/fold.test.ts packages/codemirror/test/indent.test.ts`
Expected: PASS. If the `Segun` case-body test (`'@'` → 6) fails, check `previousChild`: the previous line ends inside the `SwitchCase` only when the case's token range covers its body's last statement (it does, per the AST). Then `pnpm vitest run --project @stepcode/codemirror` (whole package still green), `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint`.

- [ ] **Step 8: Commit**

```bash
git add packages/codemirror/src/blocks.ts packages/codemirror/src/parser.ts packages/codemirror/test/fold.test.ts packages/codemirror/test/indent.test.ts
git commit -m "feat(codemirror): fold and indent blocks by profile spelling"
```

---

### Task 6: block matching

**Files:**
- Create: `packages/codemirror/src/matching.ts`
- Create: `packages/codemirror/test/matching.test.ts`

**Interfaces:**
- Consumes: `bracketMatching`, `matchBrackets` from `@codemirror/language`; the `closedBy`/`openedBy` props (Task 2).
- Produces: `stepcodeBlockMatching(): Extension`.

- [ ] **Step 1: Write the failing test**

Create `packages/codemirror/test/matching.test.ts`:

```ts
import { matchBrackets } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { stepcodeBlockMatching } from '../src/matching'
import { stateFor } from './helpers'

const main = (body: string): string => `Proceso p\n${body}\nFinProceso`

/** The text of the match found from the token starting (dir 1) or ending (dir -1) at `pos`. */
function matchText(source: string, pos: number, dir: 1 | -1): { end: string | null; matched: boolean } | null {
  const state = stateFor(source, stepcodeBlockMatching())
  const result = matchBrackets(state, pos, dir)
  if (result === null) return null
  return {
    end: result.end === undefined ? null : source.slice(result.end.from, result.end.to),
    matched: result.matched,
  }
}

describe('block matching', () => {
  const source = main('  Si 1 < 2 Entonces\n    Si 2 < 3 Entonces\n      Escribir (1 + 2);\n    FinSi\n  FinSi')

  it('matches Si forward to its own FinSi, skipping the nested pair', () => {
    const outer = source.indexOf('Si 1')
    expect(matchText(source, outer, 1)).toEqual({ end: 'FinSi', matched: true })
    const state = stateFor(source, stepcodeBlockMatching())
    const result = matchBrackets(state, outer, 1)
    expect(result?.end?.from).toBe(source.lastIndexOf('FinSi'))
  })

  it('matches FinSi backward to its Si', () => {
    const inner = source.indexOf('    FinSi') + '    FinSi'.length
    const state = stateFor(source, stepcodeBlockMatching())
    const result = matchBrackets(state, inner, -1)
    expect(result?.matched).toBe(true)
    expect(result?.end?.from).toBe(source.indexOf('Si 2'))
  })

  it('matches Proceso with FinProceso and Repetir with Hasta Que', () => {
    expect(matchText(source, 0, 1)).toEqual({ end: 'FinProceso', matched: true })
    const loop = main('  Repetir\n    Escribir 1;\n  Hasta Que 1 < 2')
    expect(matchText(loop, loop.indexOf('Repetir'), 1)).toEqual({ end: 'Hasta Que', matched: true })
  })

  it('reports an unclosed block as unmatched', () => {
    const open = 'Proceso p\n  Si 1 < 2 Entonces\n    Escribir 1;\nFinProceso'
    expect(matchText(open, open.indexOf('Si 1'), 1)?.matched).toBe(false)
  })

  it('still matches parentheses and brackets by text', () => {
    expect(matchText(source, source.indexOf('('), 1)).toEqual({ end: ')', matched: true })
    const arr = main('  Definir a Como Entero;\n  Dimension a[3];')
    expect(matchText(arr, arr.indexOf('['), 1)).toEqual({ end: ']', matched: true })
  })

  it('finds nothing on a plain keyword', () => {
    expect(matchText(source, source.indexOf('Entonces'), 1)).toBeNull()
  })

  it('is an extension a state accepts', () => {
    const state = EditorState.create({ doc: 'x', extensions: stepcodeBlockMatching() })
    expect(state.doc.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/matching.test.ts`
Expected: FAIL — `Failed to resolve import "../src/matching"`.

- [ ] **Step 3: Write `matching.ts`**

Create `packages/codemirror/src/matching.ts`:

```ts
import { bracketMatching } from '@codemirror/language'
import type { Extension } from '@codemirror/state'

/**
 * Spec §5.5: the stock matcher. Keyword pairs come from the `closedBy` / `openedBy` props on
 * the keyword leaves; parentheses and brackets from the text.
 */
export function stepcodeBlockMatching(): Extension {
  return bracketMatching({ brackets: '()[]' })
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/matching.test.ts`
Expected: PASS. If "finds nothing on a plain keyword" returns a non-null unmatched result instead of `null`, the matcher fell through to text scanning for the `E` of `Entonces`; that is not a bracket character, so `matchBrackets` returns `null` — if it does not, replace the assertion with `expect(matchText(...)?.matched ?? false).toBe(false)` and note it. Then `pnpm lint:fix && pnpm lint`.

- [ ] **Step 5: Commit**

```bash
git add packages/codemirror/src/matching.ts packages/codemirror/test/matching.test.ts
git commit -m "feat(codemirror): block matching through the keyword pairs"
```

---

### Task 7: symbol lookups and completion

**Files:**
- Create: `packages/codemirror/src/symbols.ts`, `packages/codemirror/src/completion.ts`
- Create: `packages/codemirror/test/completion.test.ts`

**Interfaces:**
- Consumes: `treeDataAt`, `stepcodeLanguage` (Task 3); `IDENTIFIER_NAMES` (Task 2); `stringsFor` (Task 1); `StepcodeOptions` (Task 4); `BUILTIN_SIGNATURES`, `typeToString`, `Scope`, `Symbol` from `stepcode`; `BUILTIN_KEYS`, `TYPE_KEYS`, `KEYWORD_KEYS` from `@stepcode/profiles`.
- Produces (`symbols.ts`, read by Tasks 9 and 10): `identifierLeafAt(state, pos, side?)`, `symbolAt(state, pos, side?): { leaf, symbol } | null`, `scopeAt(result, pos): Scope`, `visibleSymbols(result, pos): Symbol[]`, `symbolLabel(symbol): string`, `builtinKeyAt(profile, text): BuiltinKey | null`, `SignaturePart { text, active }`, `builtinSignatureParts(key, profile, strings, activeIndex?)`, `signatureText(parts)`. (`completion.ts`): `completionSourceFor(options): CompletionSource`, `keywordCompletions(profile): Completion[]` (Task 8 replaces the openers), `stepcodeCompletion(options): Extension`.

- [ ] **Step 1: Write the failing test**

Create `packages/codemirror/test/completion.test.ts`:

```ts
import { type Completion, CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { describe, expect, it } from 'vitest'
import { completionSourceFor } from '../src/completion'
import { en, es, stateFor } from './helpers'

const program = [
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir a Como Entero;',
  '  a <- 1;',
  '  Escribir "hola"; // nota',
  '  Definir b Como Real;',
  '  Dimension lista[3];',
  'FinProceso',
].join('\n')

/** Completions offered at the offset of `marker` (explicit request unless a prefix is typed). */
function complete(
  source: string,
  marker: string,
  options: { explicit?: boolean; profile?: typeof es; locale?: string; offset?: number } = {},
): CompletionResult | null {
  const profile = options.profile ?? es
  const state = stateFor(source, [], profile)
  const pos = source.indexOf(marker) + (options.offset ?? 0)
  const context = new CompletionContext(state, pos, options.explicit ?? true)
  const source_ = completionSourceFor({ profile, locale: options.locale ?? 'es' })
  return source_(context) as CompletionResult | null
}

const labels = (result: CompletionResult | null): string[] =>
  (result?.options ?? []).map((one) => one.label)

const option = (result: CompletionResult | null, label: string): Completion | undefined =>
  result?.options.find((one) => one.label === label)

describe('completion', () => {
  it('offers the variables declared before the cursor, with their types', () => {
    const result = complete(program, '1;')
    expect(labels(result)).toContain('a')
    expect(option(result, 'a')?.detail).toBe('Entero')
    expect(option(result, 'a')?.type).toBe('variable')
    expect(labels(result)).not.toContain('b')
    expect(labels(result)).not.toContain('lista')
  })

  it('offers a parameter and the result only inside their function', () => {
    const inside = complete(program, 'n * 2')
    expect(option(inside, 'n')?.detail).toBe('Entero')
    expect(labels(inside)).toContain('r')
    const outside = complete(program, '1;')
    expect(labels(outside)).not.toContain('n')
    expect(labels(outside)).not.toContain('r')
  })

  it('offers subprograms everywhere, applied with parentheses', () => {
    const result = complete(program, 'n * 2')
    const doble = option(result, 'doble')
    expect(doble?.type).toBe('function')
    expect(doble?.detail).toBe('función')
    expect(typeof doble?.apply).toBe('function')
    expect(labels(complete(program, '1;'))).toContain('doble')
  })

  it('offers builtins with their signature as detail', () => {
    const result = complete(program, '1;')
    expect(option(result, 'RC')?.detail).toBe('(número) : Real')
    expect(option(result, 'Abs')?.detail).toBe('(número) : igual al argumento')
    expect(option(result, 'Subcadena')?.detail).toBe('(texto, entero, entero) : Cadena')
    expect(option(result, 'Azar')?.detail).toBe('() : Real')
    expect(option(result, 'RC')?.type).toBe('function')
  })

  it('offers types and keywords in the profile first spelling', () => {
    const result = complete(program, '1;')
    expect(option(result, 'Entero')?.type).toBe('type')
    expect(option(result, 'Caracter')?.type).toBe('type')
    expect(option(result, 'Escribir')?.type).toBe('keyword')
    expect(option(result, 'Sino Si')?.type).toBe('keyword')
    expect(labels(result)).not.toContain('Mostrar')
    expect(labels(result)).not.toContain('')
  })

  it('ranks symbols above builtins above types above keywords', () => {
    const result = complete(program, '1;')
    const boost = (label: string): number => option(result, label)?.boost ?? 0
    expect(boost('a')).toBeGreaterThan(boost('Abs'))
    expect(boost('Abs')).toBeGreaterThan(boost('Entero'))
    expect(boost('Entero')).toBeGreaterThan(boost('Escribir'))
  })

  it('completes from the word before the cursor and validates on word characters', () => {
    const source = 'Proceso p\n  Definir alto Como Entero;\n  Escribir al;\nFinProceso'
    const result = complete(source, 'al;', { explicit: false, offset: 2 })
    expect(result?.from).toBe(source.indexOf('al;'))
    expect(labels(result)).toContain('alto')
    expect(result?.validFor).toBeInstanceOf(RegExp)
    expect((result?.validFor as RegExp).test('alto')).toBe(true)
    expect((result?.validFor as RegExp).test('al to')).toBe(false)
  })

  it('offers nothing without a word unless asked explicitly', () => {
    expect(complete(program, '1;', { explicit: false })).toBeNull()
  })

  it('offers nothing inside a string or a comment', () => {
    expect(complete(program, 'hola', { offset: 2 })).toBeNull()
    expect(complete(program, 'nota', { offset: 2 })).toBeNull()
  })

  it('offers nothing but keywords, types and builtins before the first parse', () => {
    const result = complete('', '', {})
    expect(labels(result)).toContain('Proceso')
    expect(labels(result)).toContain('Entero')
  })

  it('spells everything per the en profile', () => {
    const source = 'Program p\n  Define total As Integer;\n  total <- 1;\nEndProgram'
    const result = complete(source, '1;', { profile: en, locale: 'en' })
    expect(option(result, 'total')?.detail).toBe('Integer')
    expect(option(result, 'Write')?.type).toBe('keyword')
    expect(option(result, 'Sqrt')?.detail).toBe('(number) : Real')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/completion.test.ts`
Expected: FAIL — `Failed to resolve import "../src/completion"`.

- [ ] **Step 3: Write `symbols.ts`**

Create `packages/codemirror/src/symbols.ts`:

```ts
import { syntaxTree } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import type { SyntaxNode } from '@lezer/common'
import type { BuiltinKey, ResolvedProfile } from '@stepcode/profiles'
import {
  BUILTIN_SIGNATURES,
  type CompileResult,
  type Scope,
  type Symbol as StepSymbol,
  typeToString,
} from 'stepcode'
import { IDENTIFIER_NAMES } from './nodes'
import { treeDataAt } from './parser'
import type { Strings } from './strings'

const IDENTIFIERS: ReadonlySet<string> = new Set(IDENTIFIER_NAMES)

/**
 * The identifier leaf ending at `pos` (side -1), starting at it (side 1), or either (0, the
 * leaf ending there first) — a cursor touches a word from both sides.
 */
export function identifierLeafAt(
  state: EditorState,
  pos: number,
  side: -1 | 0 | 1 = 0,
): SyntaxNode | null {
  const tree = syntaxTree(state)
  const sides: readonly (-1 | 1)[] = side === 0 ? [-1, 1] : [side]
  for (const one of sides) {
    const node = tree.resolveInner(pos, one)
    if (IDENTIFIERS.has(node.name)) return node
  }
  return null
}

/** The leaf at `pos` and the checker symbol it resolved to, or null. */
export function symbolAt(
  state: EditorState,
  pos: number,
  side: -1 | 0 | 1 = 0,
): { readonly leaf: SyntaxNode; readonly symbol: StepSymbol } | null {
  const leaf = identifierLeafAt(state, pos, side)
  const data = treeDataAt(state)
  if (leaf === null || data === null) return null
  const identifier = data.identifiers.get(leaf.from)
  if (identifier === undefined) return null
  const symbol = data.result.symbols.get(identifier)
  return symbol === undefined ? null : { leaf, symbol }
}

/** The body scope whose owner contains `pos`, else the program scope. Bodies never nest. */
export function scopeAt(result: CompileResult, pos: number): Scope {
  const program = result.scopes[0]
  if (program === undefined) throw new Error('a compile result always has a program scope')
  for (const scope of result.scopes) {
    if (scope.kind !== 'body') continue
    const { span } = scope.owner
    if (span.start <= pos && pos <= span.end) return scope
  }
  return program
}

/**
 * Spec §5.6: the symbols usable at `pos` — the scope chain from the innermost, a name once,
 * declarations after the cursor excluded except subprograms, recovery symbols never.
 */
export function visibleSymbols(result: CompileResult, pos: number): StepSymbol[] {
  const seen = new Set<string>()
  const out: StepSymbol[] = []
  for (let scope: Scope | null = scopeAt(result, pos); scope !== null; scope = scope.parent) {
    for (const symbol of scope.order) {
      if (seen.has(symbol.name) || symbol.recovered === true) continue
      if (symbol.kind !== 'subprogram' && symbol.declaredAt.span.start >= pos) continue
      seen.add(symbol.name)
      out.push(symbol)
    }
  }
  return out
}

/** The name as the declaration wrote it; a result variable's from the header. */
export function symbolLabel(symbol: StepSymbol): string {
  const at = symbol.declaredAt
  if (at.kind === 'Identifier') return at.text
  if (at.kind === 'SubprogramDecl' && at.returnName !== undefined) return at.returnName.text
  return symbol.name
}

/** The builtin a spelling names under `profile`, or null. */
export function builtinKeyAt(profile: ResolvedProfile, text: string): BuiltinKey | null {
  const entry = profile.lookup.get(profile.normalize(text))
  return entry?.kind === 'builtin' ? (entry.key as BuiltinKey) : null
}

export interface SignaturePart {
  readonly text: string
  readonly active: boolean
}

/** `Name(p1, p2) : result`, spec §5.6, with the parameter at `activeIndex` flagged. */
export function builtinSignatureParts(
  key: BuiltinKey,
  profile: ResolvedProfile,
  strings: Strings,
  activeIndex = -1,
): SignaturePart[] {
  const signature = BUILTIN_SIGNATURES[key]
  const name = profile.builtins[key]?.[0] ?? key
  const parts: SignaturePart[] = [{ text: `${name}(`, active: false }]
  signature.params.forEach((operand, index) => {
    if (index > 0) parts.push({ text: ', ', active: false })
    parts.push({ text: strings.operandClass[operand], active: index === activeIndex })
  })
  const result =
    signature.result === 'same' ? strings.same : typeToString(signature.result, profile)
  parts.push({ text: `) : ${result}`, active: false })
  return parts
}

export const signatureText = (parts: readonly SignaturePart[]): string =>
  parts.map((part) => part.text).join('')
```

- [ ] **Step 4: Write `completion.ts`**

Create `packages/codemirror/src/completion.ts`:

```ts
import {
  type Completion,
  type CompletionSource,
  snippetCompletion,
} from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import {
  BUILTIN_KEYS,
  KEYWORD_KEYS,
  type ResolvedProfile,
  TYPE_KEYS,
} from '@stepcode/profiles'
import { BUILTIN_SIGNATURES, type CompileResult, typeToString } from 'stepcode'
import type { StepcodeOptions } from './options'
import { stepcodeLanguage, treeDataAt } from './parser'
import type { Strings } from './strings'
import { stringsFor } from './strings'
import {
  builtinSignatureParts,
  signatureText,
  symbolLabel,
  visibleSymbols,
} from './symbols'

const WORD = /[\p{L}_][\p{L}\p{N}_]*$/u
const VALID = /^[\p{L}_][\p{L}\p{N}_]*$/u

const BOOST = { symbol: 3, builtin: 2, type: 1, keyword: 0 } as const

/** `name(<cursor>)` for a callable with parameters, `name()<cursor>` without. */
function callCompletion(label: string, hasParams: boolean, completion: Completion): Completion {
  return snippetCompletion(hasParams ? `${label}(\${})` : `${label}()\${}`, completion)
}

function symbolCompletions(
  result: CompileResult,
  pos: number,
  profile: ResolvedProfile,
  strings: Strings,
): Completion[] {
  return visibleSymbols(result, pos).map((symbol) => {
    const label = symbolLabel(symbol)
    if (symbol.kind === 'subprogram') {
      const decl = symbol.decl
      return callCompletion(label, decl !== undefined && decl.params.length > 0, {
        label,
        type: 'function',
        detail: decl?.form === 'function' ? strings.function : strings.procedure,
        boost: BOOST.symbol,
      })
    }
    return {
      label,
      type: symbol.kind === 'constant' ? 'constant' : 'variable',
      detail: typeToString(symbol.type, profile),
      boost: BOOST.symbol,
    }
  })
}

function builtinCompletions(profile: ResolvedProfile, strings: Strings): Completion[] {
  const out: Completion[] = []
  for (const key of BUILTIN_KEYS) {
    const label = profile.builtins[key]?.[0]
    if (label === undefined) continue
    const detail = signatureText(builtinSignatureParts(key, profile, strings)).slice(label.length)
    out.push(
      callCompletion(label, BUILTIN_SIGNATURES[key].params.length > 0, {
        label,
        type: 'function',
        detail,
        boost: BOOST.builtin,
      }),
    )
  }
  return out
}

function typeCompletions(profile: ResolvedProfile): Completion[] {
  const out: Completion[] = []
  for (const key of TYPE_KEYS) {
    const label = profile.types[key]?.[0]
    if (label !== undefined) out.push({ label, type: 'type', boost: BOOST.type })
  }
  return out
}

/** Every keyword with a spelling, as its first spelling. Task 8 swaps block openers for snippets. */
export function keywordCompletions(profile: ResolvedProfile): Completion[] {
  const out: Completion[] = []
  for (const key of KEYWORD_KEYS) {
    const label = profile.keywords[key]?.[0]
    if (label !== undefined && label.length > 0) {
      out.push({ label, type: 'keyword', boost: BOOST.keyword })
    }
  }
  return out
}

/** Spec §5.6. */
export function completionSourceFor(options: StepcodeOptions): CompletionSource {
  const { profile } = options
  const strings = stringsFor(options.locale)
  const fixed = [
    ...builtinCompletions(profile, strings),
    ...typeCompletions(profile),
    ...keywordCompletions(profile),
  ]
  return (context) => {
    const word = context.matchBefore(WORD)
    if (word === null && !context.explicit) return null
    const node = syntaxTree(context.state).resolveInner(context.pos, -1)
    if (node.name === 'Comment' || node.name === 'String') return null
    const data = treeDataAt(context.state)
    const symbols = data === null ? [] : symbolCompletions(data.result, context.pos, profile, strings)
    return { from: word?.from ?? context.pos, options: [...symbols, ...fixed], validFor: VALID }
  }
}

/** The source, registered through the language's data so `autocompletion()` picks it up. */
export function stepcodeCompletion(options: StepcodeOptions): Extension {
  return stepcodeLanguage(options.profile).data.of({ autocomplete: completionSourceFor(options) })
}
```

(In `callCompletion` the template strings contain a literal `${}` — the backslash escapes the template placeholder so the snippet library sees `${}`.)

- [ ] **Step 5: Run the test, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/completion.test.ts`
Expected: PASS. Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/codemirror/src/symbols.ts packages/codemirror/src/completion.ts packages/codemirror/test/completion.test.ts
git commit -m "feat(codemirror): completion from scopes, builtins, types and keywords"
```

---

### Task 8: block snippets

**Files:**
- Create: `packages/codemirror/src/snippets.ts`
- Modify: `packages/codemirror/src/completion.ts` (`keywordCompletions`)
- Create: `packages/codemirror/test/snippets.test.ts`
- Modify: `packages/codemirror/test/completion.test.ts` (append one test)

**Interfaces:**
- Consumes: `snippetCompletion`, `snippet` from `@codemirror/autocomplete`; `stringsFor` (Task 1).
- Produces: `OPENER_KEYS`, `blockTemplates(profile, strings): ReadonlyMap<KeywordKey, string>`, `blockSnippets(profile, strings): ReadonlyMap<KeywordKey, Completion>`.

- [ ] **Step 1: Write the failing test**

Create `packages/codemirror/test/snippets.test.ts`:

```ts
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
  snippet(template)(
    { state, dispatch: (tr: Transaction) => void (state = tr.state) },
    null,
    from,
    to,
  )
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
    expect(t('for')).toBe('Para ${i} <- ${inicio} Hasta ${fin} Hacer\n\t${}\nFinPara')
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
    expect(templates.get('for')).toContain('For ${i} <- ${start} To ${end} Do')
    const equals = resolveProfile(
      { id: 'es-eq', extends: 'es', options: { assignWithEquals: true } },
      builtinProfiles,
    )
    expect(blockTemplates(equals, stringsFor('es')).get('for')).toContain('Para ${i} = ${inicio}')
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/snippets.test.ts`
Expected: FAIL — `Failed to resolve import "../src/snippets"`.

- [ ] **Step 3: Write `snippets.ts`**

Create `packages/codemirror/src/snippets.ts`:

```ts
import { type Completion, snippetCompletion } from '@codemirror/autocomplete'
import type { KeywordKey, ResolvedProfile } from '@stepcode/profiles'
import type { Strings } from './strings'

/** The keywords whose completion inserts a whole block (spec §5.7). */
export const OPENER_KEYS = [
  'if',
  'while',
  'for',
  'repeat',
  'switch',
  'function',
  'procedure',
  'program',
] as const

export type OpenerKey = (typeof OPENER_KEYS)[number]

const CURSOR = '${}'
const field = (name: string): string => `\${${name}}`

/**
 * The templates, spelled per profile. Body lines start with a tab, which the snippet library
 * turns into one indent unit relative to the line the snippet lands on.
 */
export function blockTemplates(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<OpenerKey, string> {
  const kw = (key: KeywordKey): string => profile.keywords[key]?.[0] ?? key
  const assign = profile.options.assignWithEquals ? '=' : (profile.operators.assign[0] ?? '<-')
  const p = strings.placeholders
  const lines = (...parts: string[]): string => parts.join('\n')
  return new Map<OpenerKey, string>([
    ['if', lines(`${kw('if')} ${field(p.condition)} ${kw('then')}`, `\t${CURSOR}`, kw('endIf'))],
    ['while', lines(`${kw('while')} ${field(p.condition)} ${kw('do')}`, `\t${CURSOR}`, kw('endWhile'))],
    [
      'for',
      lines(
        `${kw('for')} ${field(p.counter)} ${assign} ${field(p.start)} ${kw('to')} ${field(p.limit)} ${kw('do')}`,
        `\t${CURSOR}`,
        kw('endFor'),
      ),
    ],
    ['repeat', lines(kw('repeat'), `\t${CURSOR}`, `${kw('until')} ${field(p.condition)}`)],
    [
      'switch',
      lines(
        `${kw('switch')} ${field(p.value)} ${kw('do')}`,
        `\t${field(p.case)}:`,
        `\t\t${CURSOR}`,
        `\t${kw('otherwise')}:`,
        '\t\t',
        kw('endSwitch'),
      ),
    ],
    [
      'function',
      lines(
        `${kw('function')} ${field(p.result)} ${assign} ${field(p.name)}(${field(p.parameters)})`,
        `\t${CURSOR}`,
        kw('endFunction'),
      ),
    ],
    [
      'procedure',
      lines(`${kw('procedure')} ${field(p.name)}(${field(p.parameters)})`, `\t${CURSOR}`, kw('endProcedure')),
    ],
    ['program', lines(`${kw('program')} ${field(p.name)}`, `\t${CURSOR}`, kw('endProgram'))],
  ])
}

/** One keyword completion per opener, applying its template. */
export function blockSnippets(
  profile: ResolvedProfile,
  strings: Strings,
): ReadonlyMap<OpenerKey, Completion> {
  const out = new Map<OpenerKey, Completion>()
  for (const [key, template] of blockTemplates(profile, strings)) {
    const label = profile.keywords[key]?.[0]
    if (label === undefined || label.length === 0) continue
    out.set(key, snippetCompletion(template, { label, type: 'keyword', boost: 0 }))
  }
  return out
}
```

- [ ] **Step 4: Swap the openers in the completion source**

In `packages/codemirror/src/completion.ts`, import `blockSnippets` from `./snippets` and change `keywordCompletions` to take the strings and use the snippets:

```ts
/** Every keyword with a spelling; the block openers apply their snippet (spec §5.7). */
export function keywordCompletions(profile: ResolvedProfile, strings: Strings): Completion[] {
  const snippets = blockSnippets(profile, strings)
  const out: Completion[] = []
  for (const key of KEYWORD_KEYS) {
    const label = profile.keywords[key]?.[0]
    if (label === undefined || label.length === 0) continue
    const snippet = (snippets as ReadonlyMap<string, Completion>).get(key)
    out.push(snippet ?? { label, type: 'keyword', boost: BOOST.keyword })
  }
  return out
}
```

and the call in `completionSourceFor` to `keywordCompletions(profile, strings)`.

Append to `packages/codemirror/test/completion.test.ts`, inside the `describe`:

```ts
  it('applies a block opener as a snippet', () => {
    const result = complete(program, '1;')
    expect(typeof option(result, 'Si')?.apply).toBe('function')
    expect(typeof option(result, 'Proceso')?.apply).toBe('function')
    expect(option(result, 'Entonces')?.apply).toBeUndefined()
  })
```

- [ ] **Step 5: Run both files, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/snippets.test.ts packages/codemirror/test/completion.test.ts`
Expected: PASS. Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/codemirror/src/snippets.ts packages/codemirror/src/completion.ts packages/codemirror/test/snippets.test.ts packages/codemirror/test/completion.test.ts
git commit -m "feat(codemirror): block snippets for the opener keywords"
```

---

### Task 9: signature help

**Files:**
- Create: `packages/codemirror/src/signature.ts`
- Create: `packages/codemirror/test/signature.test.ts`

**Interfaces:**
- Consumes: `treeDataAt` (Task 3); `builtinSignatureParts`, `SignaturePart` (Task 7); `showTooltip`, `Tooltip` from `@codemirror/view`; `StateField` from `@codemirror/state`.
- Produces: `Signature { pos: number; parts: readonly SignaturePart[] }`, `signatureAt(state, pos, options): Signature | null`, `stepcodeSignatureHelp(options): Extension`.

- [ ] **Step 1: Write the failing test**

Create `packages/codemirror/test/signature.test.ts`:

```ts
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { signatureAt, stepcodeSignatureHelp } from '../src/signature'
import { signatureText } from '../src/symbols'
import { es, stateFor } from './helpers'

const options = { profile: es, locale: 'es' }

const program = [
  'Funcion r <- suma(a Como Entero, b Como Entero)',
  '  r <- a + b;',
  'FinFuncion',
  'Proceso p',
  '  Definir s Como Cadena;',
  '  s <- Subcadena("hola", 1, 2);',
  '  Escribir suma(1, 2);',
  '  Escribir Abs(-1) + 1;',
  '  Escribir noExiste(1);',
  'FinProceso',
].join('\n')

/** The signature at the offset of `marker` plus `offset`, as `[text, active index]`. */
function at(marker: string, offset = 0): [string, number] | null {
  const state = stateFor(program)
  const signature = signatureAt(state, program.indexOf(marker) + offset, options)
  if (signature === null) return null
  return [signatureText(signature.parts), signature.parts.findIndex((part) => part.active)]
}

describe('signatureAt', () => {
  it('shows a builtin signature with the active argument, per comma', () => {
    expect(at('"hola"')).toEqual(['Subcadena(texto, entero, entero) : Cadena', 1])
    expect(at('1, 2);')).toEqual(['Subcadena(texto, entero, entero) : Cadena', 3])
    expect(at('2);')).toEqual(['Subcadena(texto, entero, entero) : Cadena', 5])
  })

  it('shows the header of a user function with the active parameter', () => {
    expect(at('suma(1', 5)).toEqual(['Funcion r <- suma(a Como Entero, b Como Entero)', 1])
    expect(at('suma(1', 8)).toEqual(['Funcion r <- suma(a Como Entero, b Como Entero)', 3])
  })

  it('anchors the tooltip at the opening parenthesis', () => {
    const state = stateFor(program)
    expect(signatureAt(state, program.indexOf('"hola"'), options)?.pos).toBe(
      program.indexOf('("hola"'),
    )
  })

  it('shows nothing outside the parentheses or after the closing one', () => {
    expect(at('Subcadena')).toBeNull()
    expect(at('Abs(-1)', 'Abs(-1)'.length)).toBeNull()
    expect(at('+ 1;')).toBeNull()
  })

  it('shows nothing for an unresolved callee', () => {
    expect(at('noExiste(1', 9)).toBeNull()
  })

  it('shows a zero-parameter builtin with no active part', () => {
    const source = 'Proceso p\n  Escribir Azar();\nFinProceso'
    const state = stateFor(source)
    const signature = signatureAt(state, source.indexOf('()') + 1, options)
    expect(signature === null ? null : signatureText(signature.parts)).toBe('Azar() : Real')
  })

  it('is an extension a state accepts', () => {
    const state = EditorState.create({ doc: 'x', extensions: stepcodeSignatureHelp(options) })
    expect(state.doc.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/signature.test.ts`
Expected: FAIL — `Failed to resolve import "../src/signature"`.

- [ ] **Step 3: Write `signature.ts`**

Create `packages/codemirror/src/signature.ts`:

```ts
import { syntaxTree } from '@codemirror/language'
import { type EditorState, type Extension, StateField } from '@codemirror/state'
import { showTooltip, type Tooltip } from '@codemirror/view'
import type { SyntaxNode } from '@lezer/common'
import type { SubprogramDecl } from 'stepcode'
import type { StepcodeOptions } from './options'
import { treeDataAt } from './parser'
import { stringsFor } from './strings'
import { builtinSignatureParts, type SignaturePart } from './symbols'

export interface Signature {
  /** Where the tooltip anchors: the opening parenthesis. */
  readonly pos: number
  readonly parts: readonly SignaturePart[]
}

/** The innermost call whose argument list contains `pos` (spec §5.8), with its parenthesis. */
function callAround(state: EditorState, pos: number): { node: SyntaxNode; open: SyntaxNode } | null {
  for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, -1); node !== null; node = node.parent) {
    if (node.name !== 'Call' && node.name !== 'BuiltinCall') continue
    const open = node.getChild('OpenParen')
    if (open === null || open.to > pos) continue
    const close = node.getChild('CloseParen')
    if (close !== null && pos > close.from) continue
    return { node, open }
  }
  return null
}

/** The number of argument separators of `call` that end at or before `pos`. */
function activeArgument(state: EditorState, call: SyntaxNode, pos: number): number {
  let count = 0
  for (const punct of call.getChildren('Punct')) {
    if (punct.to <= pos && state.doc.sliceString(punct.from, punct.to) === ',') count++
  }
  return count
}

/** The header of a declaration, its parameters split out so one can be marked active. */
function headerParts(decl: SubprogramDecl, source: string, active: number): SignaturePart[] {
  const last = decl.params[decl.params.length - 1]
  const paramsEnd = last === undefined ? decl.name.span.end : last.span.end
  const closeParen = source.indexOf(')', paramsEnd)
  const end = closeParen < 0 ? paramsEnd : closeParen + 1
  const parts: SignaturePart[] = []
  let cursor = decl.span.start
  decl.params.forEach((param, index) => {
    if (param.span.start > cursor) {
      parts.push({ text: source.slice(cursor, param.span.start), active: false })
    }
    parts.push({ text: source.slice(param.span.start, param.span.end), active: index === active })
    cursor = param.span.end
  })
  parts.push({ text: source.slice(cursor, end), active: false })
  return parts
}

export function signatureAt(
  state: EditorState,
  pos: number,
  options: StepcodeOptions,
): Signature | null {
  const data = treeDataAt(state)
  const found = callAround(state, pos)
  if (data === null || found === null) return null
  const call = data.calls.get(found.node.from)
  if (call === undefined) return null
  const active = activeArgument(state, found.node, pos)
  if (call.kind === 'BuiltinCall') {
    const parts = builtinSignatureParts(call.key, options.profile, stringsFor(options.locale), active)
    return { pos: found.open.from, parts }
  }
  const decl = data.result.calls.get(call)
  if (decl === undefined) return null
  return { pos: found.open.from, parts: headerParts(decl, data.result.source, active) }
}

function tooltipsFor(state: EditorState, options: StepcodeOptions): readonly Tooltip[] {
  const signature = signatureAt(state, state.selection.main.head, options)
  if (signature === null) return []
  return [
    {
      pos: signature.pos,
      above: true,
      create: () => {
        const dom = document.createElement('div')
        dom.className = 'cm-stepcode-signature'
        for (const part of signature.parts) {
          const span = document.createElement('span')
          if (part.active) span.className = 'cm-stepcode-signature-active'
          span.textContent = part.text
          dom.appendChild(span)
        }
        return { dom }
      },
    },
  ]
}

/** Spec §5.8: a tooltip field recomputed on selection, document and tree changes. */
export function stepcodeSignatureHelp(options: StepcodeOptions): Extension {
  return StateField.define<readonly Tooltip[]>({
    create: (state) => tooltipsFor(state, options),
    update: (value, tr) =>
      tr.docChanged || tr.selection !== undefined || syntaxTree(tr.state) !== syntaxTree(tr.startState)
        ? tooltipsFor(tr.state, options)
        : value,
    provide: (field) => showTooltip.computeN([field], (state) => state.field(field)),
  })
}
```

- [ ] **Step 4: Run the test, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/signature.test.ts`
Expected: PASS. Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add packages/codemirror/src/signature.ts packages/codemirror/test/signature.test.ts
git commit -m "feat(codemirror): signature help inside call arguments"
```

---

### Task 10: hover and go to definition

**Files:**
- Create: `packages/codemirror/src/hover.ts`, `packages/codemirror/src/definition.ts`
- Create: `packages/codemirror/test/hover.test.ts` (happy-dom), `packages/codemirror/test/definition.test.ts` (happy-dom)

**Interfaces:**
- Consumes: `symbolAt`, `symbolLabel`, `builtinKeyAt`, `builtinSignatureParts`, `signatureText` (Task 7); `LineMap`, `typeToString` from `stepcode`; `hoverTooltip`, `HoverTooltipSource`, `EditorView`, `KeyBinding`, `Command` from `@codemirror/view`.
- Produces: `HoverInfo { from, to, lines }`, `hoverInfoAt(state, pos, side, options)`, `hoverSource(options): HoverTooltipSource`, `stepcodeHover(options): Extension`; `definitionAt(state, pos): number | null`, `goToDefinition: Command`, `stepcodeKeymap: readonly KeyBinding[]`.

- [ ] **Step 1: Write the failing hover test**

Create `packages/codemirror/test/hover.test.ts`:

```ts
// @vitest-environment happy-dom
import { EditorView, type Tooltip } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import { hoverInfoAt, hoverSource, stepcodeHover } from '../src/hover'
import { es, stateFor } from './helpers'

const options = { profile: es, locale: 'es' }

const program = [
  'SubProceso llena(v Por Referencia Como Entero, n Como Entero)',
  '  v <- n;',
  'FinSubProceso',
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir a Como Entero;',
  '  Constante MAX <- 10;',
  '  a <- doble(MAX);',
  '  llena(a, 1);',
  '  Escribir Abs(a);',
  'FinProceso',
].join('\n')

const linesAt = (marker: string, offset = 0): string[] | null =>
  hoverInfoAt(stateFor(program), program.indexOf(marker) + offset, 1, options)?.lines ?? null

describe('hoverInfoAt', () => {
  it('describes a variable with its type and declaring line', () => {
    expect(linesAt('a <- doble')).toEqual(['variable a: Entero', 'declarada en la línea 8'])
  })

  it('describes a constant, a parameter by reference and a result', () => {
    expect(linesAt('MAX);')).toEqual(['constante MAX: Entero', 'declarada en la línea 9'])
    expect(linesAt('v <- n')).toEqual([
      'parámetro v: Entero (por referencia)',
      'declarada en la línea 1',
    ])
    expect(linesAt('r <- n * 2')).toEqual(['resultado r: Entero', 'declarada en la línea 4'])
  })

  it('describes a function and a procedure at their call and at their declaration', () => {
    expect(linesAt('doble(MAX')).toEqual(['función doble: Entero', 'declarada en la línea 4'])
    expect(linesAt('llena(a')).toEqual(['procedimiento llena', 'declarada en la línea 1'])
    expect(linesAt('doble(n')).toEqual(['función doble: Entero', 'declarada en la línea 4'])
  })

  it('describes a builtin by its signature', () => {
    expect(linesAt('Abs(')).toEqual(['Abs(número) : igual al argumento'])
  })

  it('renders in the requested locale', () => {
    const info = hoverInfoAt(stateFor(program), program.indexOf('a <- doble'), 1, {
      profile: es,
      locale: 'en',
    })
    expect(info?.lines).toEqual(['variable a: Entero', 'declared on line 8'])
  })

  it('covers the whole word', () => {
    const info = hoverInfoAt(stateFor(program), program.indexOf('MAX);') + 1, 1, options)
    expect(info?.from).toBe(program.indexOf('MAX);'))
    expect(info?.to).toBe(program.indexOf('MAX);') + 3)
  })

  it('has nothing to say on a keyword, a number or an unresolved name', () => {
    expect(linesAt('Proceso p')).toBeNull()
    expect(linesAt('10;')).toBeNull()
    const broken = 'Proceso p\n  Escribir nope;\nFinProceso'
    expect(hoverInfoAt(stateFor(broken), broken.indexOf('nope'), 1, options)).toBeNull()
  })
})

describe('hoverSource', () => {
  it('builds a tooltip whose DOM lists the lines', () => {
    const view = new EditorView({ state: stateFor(program) })
    const tooltip = hoverSource(options)(view, program.indexOf('a <- doble'), 1) as Tooltip | null
    expect(tooltip?.pos).toBe(program.indexOf('a <- doble'))
    const dom = tooltip?.create(view).dom
    expect(dom?.className).toBe('cm-stepcode-hover')
    expect(dom?.textContent).toBe('variable a: Enterodeclarada en la línea 8')
    expect(dom?.childElementCount).toBe(2)
    view.destroy()
  })

  it('is installable', () => {
    const view = new EditorView({ state: stateFor(program, stepcodeHover(options)) })
    expect(view.state.doc.length).toBe(program.length)
    view.destroy()
  })
})
```

- [ ] **Step 2: Write the failing definition test**

Create `packages/codemirror/test/definition.test.ts`:

```ts
// @vitest-environment happy-dom
import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import { definitionAt, goToDefinition, stepcodeKeymap } from '../src/definition'
import { stateFor } from './helpers'

const program = [
  'Funcion r <- doble(n Como Entero)',
  '  r <- n * 2;',
  'FinFuncion',
  'Proceso p',
  '  Definir a Como Entero;',
  '  a <- doble(3);',
  'FinProceso',
].join('\n')

describe('definitionAt', () => {
  it('finds the declaration of a variable and of a called subprogram', () => {
    const state = stateFor(program)
    expect(definitionAt(state, program.indexOf('a <- doble'))).toBe(program.indexOf('a Como'))
    expect(definitionAt(state, program.indexOf('doble(3') + 2)).toBe(program.indexOf('doble(n'))
    expect(definitionAt(state, program.indexOf('n * 2'))).toBe(program.indexOf('n Como'))
  })

  it('works from either side of the word', () => {
    const state = stateFor(program)
    const end = program.indexOf('doble(3') + 'doble'.length
    expect(definitionAt(state, end)).toBe(program.indexOf('doble(n'))
  })

  it('returns null on a keyword or a literal', () => {
    const state = stateFor(program)
    expect(definitionAt(state, program.indexOf('Proceso'))).toBeNull()
    expect(definitionAt(state, program.indexOf('3);'))).toBeNull()
  })
})

describe('goToDefinition', () => {
  it('moves the selection to the declaration and reports success', () => {
    const view = new EditorView({ state: stateFor(program) })
    view.dispatch({ selection: EditorSelection.single(program.indexOf('doble(3') + 1) })
    expect(goToDefinition(view)).toBe(true)
    expect(view.state.selection.main.head).toBe(program.indexOf('doble(n'))
    expect(view.state.selection.main.empty).toBe(true)
    view.destroy()
  })

  it('reports failure and leaves the selection alone elsewhere', () => {
    const view = new EditorView({ state: stateFor(program) })
    view.dispatch({ selection: EditorSelection.single(program.indexOf('Proceso')) })
    expect(goToDefinition(view)).toBe(false)
    expect(view.state.selection.main.head).toBe(program.indexOf('Proceso'))
    view.destroy()
  })

  it('is bound to F12', () => {
    expect(stepcodeKeymap).toEqual([{ key: 'F12', run: goToDefinition }])
  })
})
```

- [ ] **Step 3: Run both to verify they fail**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/hover.test.ts packages/codemirror/test/definition.test.ts`
Expected: FAIL — `Failed to resolve import "../src/hover"` and `"../src/definition"`.

- [ ] **Step 4: Write `hover.ts`**

Create `packages/codemirror/src/hover.ts`:

```ts
import { syntaxTree } from '@codemirror/language'
import type { EditorState, Extension } from '@codemirror/state'
import { type HoverTooltipSource, hoverTooltip } from '@codemirror/view'
import { LineMap, type Symbol as StepSymbol, typeToString } from 'stepcode'
import type { StepcodeOptions } from './options'
import { treeDataAt } from './parser'
import { type Strings, stringsFor } from './strings'
import {
  builtinKeyAt,
  builtinSignatureParts,
  signatureText,
  symbolAt,
  symbolLabel,
} from './symbols'

export interface HoverInfo {
  readonly from: number
  readonly to: number
  readonly lines: readonly string[]
}

/** `<kind> <name>: <type> (por referencia)` — the first hover line (spec §5.9). */
function describe(symbol: StepSymbol, options: StepcodeOptions, strings: Strings): string {
  const name = symbolLabel(symbol)
  if (symbol.kind === 'subprogram') {
    const isFunction = symbol.decl?.form === 'function'
    const kind = isFunction ? strings.function : strings.procedure
    return isFunction ? `${kind} ${name}: ${typeToString(symbol.type, options.profile)}` : `${kind} ${name}`
  }
  const byRef = symbol.byRef === true ? ` (${strings.byReference})` : ''
  return `${strings.kinds[symbol.kind]} ${name}: ${typeToString(symbol.type, options.profile)}${byRef}`
}

export function hoverInfoAt(
  state: EditorState,
  pos: number,
  side: -1 | 1,
  options: StepcodeOptions,
): HoverInfo | null {
  const strings = stringsFor(options.locale)
  const found = symbolAt(state, pos, side)
  if (found !== null) {
    const data = treeDataAt(state)
    if (data === null) return null
    const line = new LineMap(data.result.source).positionAt(found.symbol.declaredAt.span.start).line
    return {
      from: found.leaf.from,
      to: found.leaf.to,
      lines: [describe(found.symbol, options, strings), strings.declaredAt(line)],
    }
  }
  const node = syntaxTree(state).resolveInner(pos, side)
  if (node.name !== 'BuiltinName') return null
  const key = builtinKeyAt(options.profile, state.doc.sliceString(node.from, node.to))
  if (key === null) return null
  const parts = builtinSignatureParts(key, options.profile, strings)
  return { from: node.from, to: node.to, lines: [signatureText(parts)] }
}

export function hoverSource(options: StepcodeOptions): HoverTooltipSource {
  return (view, pos, side) => {
    const info = hoverInfoAt(view.state, pos, side, options)
    if (info === null) return null
    return {
      pos: info.from,
      end: info.to,
      above: true,
      create: () => {
        const dom = document.createElement('div')
        dom.className = 'cm-stepcode-hover'
        for (const line of info.lines) {
          const row = document.createElement('div')
          row.textContent = line
          dom.appendChild(row)
        }
        return { dom }
      },
    }
  }
}

/** Spec §5.9. */
export function stepcodeHover(options: StepcodeOptions): Extension {
  return hoverTooltip(hoverSource(options))
}
```

- [ ] **Step 5: Write `definition.ts`**

Create `packages/codemirror/src/definition.ts`:

```ts
import type { EditorState } from '@codemirror/state'
import { type Command, EditorView, type KeyBinding } from '@codemirror/view'
import { symbolAt } from './symbols'

/** The start of the declaration of the name at `pos`, or null (spec §5.10). */
export function definitionAt(state: EditorState, pos: number): number | null {
  return symbolAt(state, pos, 0)?.symbol.declaredAt.span.start ?? null
}

export const goToDefinition: Command = (view) => {
  const target = definitionAt(view.state, view.state.selection.main.head)
  if (target === null) return false
  view.dispatch({
    selection: { anchor: target },
    effects: EditorView.scrollIntoView(target, { y: 'center' }),
  })
  return true
}

/** F12 only; a mouse gesture is the host's choice (spec §5.10). */
export const stepcodeKeymap: readonly KeyBinding[] = [{ key: 'F12', run: goToDefinition }]
```

- [ ] **Step 6: Run both files, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/hover.test.ts packages/codemirror/test/definition.test.ts`
Expected: PASS. If the `resultado r` hover reports line 4 as expected but the `symbols` table has no entry for the result variable's *use* (`r <- n * 2`), the checker records result reads under the header symbol — the test expects exactly that (`declaredAt` is the `SubprogramDecl`, line 4). Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0.

- [ ] **Step 7: Commit**

```bash
git add packages/codemirror/src/hover.ts packages/codemirror/src/definition.ts packages/codemirror/test/hover.test.ts packages/codemirror/test/definition.test.ts
git commit -m "feat(codemirror): hover descriptions and go to definition"
```

---

### Task 11: debug extensions and base theme

**Files:**
- Create: `packages/codemirror/src/debug.ts`, `packages/codemirror/src/theme.ts`
- Create: `packages/codemirror/test/debug.test.ts` (happy-dom)

**Interfaces:**
- Consumes: only `@codemirror/state` and `@codemirror/view`.
- Produces: `toggleBreakpoint`, `setBreakpoints`, `setCurrentLine` (effect types), `breakpoints()`, `currentLine()`, `debug()`, `breakpointLines(state)`, `breakpointsChanged(update)`, `currentLineOf(state)`, `mapLineStart(changes, oldDoc, lineFrom)`; `stepcodeBaseTheme: Extension`.

- [ ] **Step 1: Write the failing test**

Create `packages/codemirror/test/debug.test.ts`:

```ts
// @vitest-environment happy-dom
import { ChangeSet, EditorState, Text } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import {
  breakpointLines,
  breakpoints,
  breakpointsChanged,
  currentLine,
  currentLineOf,
  debug,
  mapLineStart,
  setBreakpoints,
  setCurrentLine,
  toggleBreakpoint,
} from '../src/debug'
import { stepcodeBaseTheme } from '../src/theme'

const doc = 'uno\ndos\ntres\ncuatro'

const withDebug = (text = doc): EditorState => EditorState.create({ doc: text, extensions: debug() })

describe('breakpoints', () => {
  it('toggles on and off by line, reported ascending', () => {
    let state = withDebug()
    state = state.update({ effects: toggleBreakpoint.of({ line: 3 }) }).state
    state = state.update({ effects: toggleBreakpoint.of({ line: 1 }) }).state
    expect(breakpointLines(state)).toEqual([1, 3])
    state = state.update({ effects: toggleBreakpoint.of({ line: 3 }) }).state
    expect(breakpointLines(state)).toEqual([1])
  })

  it('replaces the set, ignoring lines outside the document and duplicates', () => {
    const state = withDebug().update({ effects: setBreakpoints.of([4, 2, 2, 9, 0]) }).state
    expect(breakpointLines(state)).toEqual([2, 4])
  })

  it('follows its line through an insertion above and an edit on the line', () => {
    let state = withDebug().update({ effects: setBreakpoints.of([2]) }).state
    state = state.update({ changes: { from: 0, insert: 'cero\n' } }).state
    expect(breakpointLines(state)).toEqual([3])
    state = state.update({ changes: { from: state.doc.line(3).from, insert: 'x' } }).state
    expect(breakpointLines(state)).toEqual([3])
    state = state.update({ changes: { from: state.doc.line(3).to, insert: '\nnueva' } }).state
    expect(breakpointLines(state)).toEqual([3])
  })

  it('vanishes when its line is deleted, and collapses two markers on one line', () => {
    let state = withDebug().update({ effects: setBreakpoints.of([2, 3]) }).state
    const line2 = state.doc.line(2)
    state = state.update({ changes: { from: line2.from, to: line2.to + 1 } }).state
    expect(breakpointLines(state)).toEqual([2])
    let joined = withDebug().update({ effects: setBreakpoints.of([1, 2]) }).state
    joined = joined.update({ changes: { from: joined.doc.line(1).to, to: joined.doc.line(2).from } }).state
    expect(breakpointLines(joined)).toEqual([1])
  })

  it('reports whether an update changed the set', () => {
    let changed = false
    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          debug(),
          EditorView.updateListener.of((update) => void (changed = breakpointsChanged(update))),
        ],
      }),
      parent: document.body,
    })
    view.dispatch({ effects: toggleBreakpoint.of({ line: 2 }) })
    expect(changed).toBe(true)
    view.dispatch({ selection: { anchor: 1 } })
    expect(changed).toBe(false)
    view.dispatch({ changes: { from: 0, insert: 'x' } })
    expect(changed).toBe(true)
    view.destroy()
  })

  it('reads as an empty list without the extension', () => {
    expect(breakpointLines(EditorState.create({ doc }))).toEqual([])
  })
})

describe('currentLine', () => {
  it('is set and cleared by the effect', () => {
    let state = withDebug().update({ effects: setCurrentLine.of(2) }).state
    expect(currentLineOf(state)).toBe(2)
    state = state.update({ effects: setCurrentLine.of(null) }).state
    expect(currentLineOf(state)).toBeNull()
    expect(currentLineOf(withDebug().update({ effects: setCurrentLine.of(99) }).state)).toBeNull()
  })

  it('maps through edits and clears when the line is deleted', () => {
    let state = withDebug().update({ effects: setCurrentLine.of(3) }).state
    state = state.update({ changes: { from: 0, insert: 'cero\n' } }).state
    expect(currentLineOf(state)).toBe(4)
    const line = state.doc.line(4)
    state = state.update({ changes: { from: line.from, to: line.to + 1 } }).state
    expect(currentLineOf(state)).toBeNull()
  })

  it('decorates the line and marks the gutter; the breakpoint marker renders too', () => {
    const view = new EditorView({
      state: EditorState.create({ doc, extensions: [debug(), stepcodeBaseTheme] }),
      parent: document.body,
    })
    view.dispatch({ effects: [setCurrentLine.of(2), toggleBreakpoint.of({ line: 3 })] })
    expect(view.dom.querySelectorAll('.cm-stepcode-current-line')).toHaveLength(1)
    expect(view.dom.querySelectorAll('.cm-stepcode-current-line-marker')).toHaveLength(1)
    expect(view.dom.querySelectorAll('.cm-stepcode-breakpoint')).toHaveLength(1)
    expect(view.dom.querySelector('.cm-stepcode-breakpoints')).not.toBeNull()
    view.destroy()
  })

  it('scrolls the line into view through a transaction extender', () => {
    const state = withDebug()
    const tr = state.update({ effects: setCurrentLine.of(3) })
    expect(tr.effects.length).toBe(2)
  })

  it('works alone, without breakpoints()', () => {
    const state = EditorState.create({ doc, extensions: currentLine() })
      .update({ effects: setCurrentLine.of(1) }).state
    expect(currentLineOf(state)).toBe(1)
    expect(breakpointLines(state)).toEqual([])
    const only = EditorState.create({ doc, extensions: breakpoints() })
    expect(currentLineOf(only)).toBeNull()
  })
})

describe('mapLineStart', () => {
  const text = Text.of(['a', '', 'ccc'])

  it('keeps a line whose content survives', () => {
    const changes = ChangeSet.of({ from: 0, insert: 'x' }, text.length)
    expect(mapLineStart(changes, text, 0)).toBe(0)
    expect(mapLineStart(changes, text, 3)).toBe(4)
  })

  it('drops a line whose content is entirely deleted', () => {
    const changes = ChangeSet.of({ from: 3, to: 6 }, text.length)
    expect(mapLineStart(changes, text, 3)).toBeNull()
  })

  it('drops an empty line whose break is deleted', () => {
    const changes = ChangeSet.of({ from: 2, to: 3 }, text.length)
    expect(mapLineStart(changes, text, 2)).toBeNull()
    expect(mapLineStart(ChangeSet.of({ from: 2, insert: 'b' }, text.length), text, 2)).toBe(2)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/debug.test.ts`
Expected: FAIL — `Failed to resolve import "../src/debug"`.

- [ ] **Step 3: Write `debug.ts`**

Create `packages/codemirror/src/debug.ts`:

```ts
import {
  type ChangeDesc,
  EditorState,
  type Extension,
  MapMode,
  RangeSet,
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Text,
  type Transaction,
} from '@codemirror/state'
import { Decoration, EditorView, GutterMarker, gutter, type ViewUpdate } from '@codemirror/view'

export const toggleBreakpoint = StateEffect.define<{ readonly line: number }>()
export const setBreakpoints = StateEffect.define<readonly number[]>()
export const setCurrentLine = StateEffect.define<number | null>()

class BreakpointMarker extends GutterMarker {
  override toDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'cm-stepcode-breakpoint'
    return dom
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof BreakpointMarker
  }
}

class CurrentLineMarker extends GutterMarker {
  override toDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'cm-stepcode-current-line-marker'
    return dom
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof CurrentLineMarker
  }
}

const breakpointMarker = new BreakpointMarker()
const currentLineMarker = new CurrentLineMarker()

/**
 * Where the start of the line at `lineFrom` lands after `changes`, or null when the line is
 * gone: its whole content was deleted, or — for an empty line — its line break was.
 */
export function mapLineStart(changes: ChangeDesc, oldDoc: Text, lineFrom: number): number | null {
  const line = oldDoc.lineAt(lineFrom)
  if (line.length === 0) return changes.mapPos(line.from, -1, MapMode.TrackAfter)
  const from = changes.mapPos(line.from, -1)
  const to = changes.mapPos(line.to, 1)
  return from === to ? null : from
}

function markersAt(positions: readonly number[]): RangeSet<GutterMarker> {
  const builder = new RangeSetBuilder<GutterMarker>()
  let last = -1
  for (const pos of [...positions].sort((a, b) => a - b)) {
    if (pos === last) continue
    builder.add(pos, pos, breakpointMarker)
    last = pos
  }
  return builder.finish()
}

function positionsOf(set: RangeSet<GutterMarker>): number[] {
  const out: number[] = []
  for (const cursor = set.iter(); cursor.value !== null; cursor.next()) out.push(cursor.from)
  return out
}

function lineStart(state: EditorState, line: number): number | null {
  return line >= 1 && line <= state.doc.lines ? state.doc.line(line).from : null
}

function remap(set: RangeSet<GutterMarker>, tr: Transaction): RangeSet<GutterMarker> {
  const positions: number[] = []
  for (const pos of positionsOf(set)) {
    const mapped = mapLineStart(tr.changes, tr.startState.doc, pos)
    if (mapped !== null) positions.push(tr.state.doc.lineAt(mapped).from)
  }
  return markersAt(positions)
}

const breakpointField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(value, tr) {
    let set = tr.docChanged ? remap(value, tr) : value
    for (const effect of tr.effects) {
      if (effect.is(toggleBreakpoint)) {
        const from = lineStart(tr.state, effect.value.line)
        if (from === null) continue
        const positions = positionsOf(set)
        set = markersAt(
          positions.includes(from) ? positions.filter((pos) => pos !== from) : [...positions, from],
        )
      } else if (effect.is(setBreakpoints)) {
        set = markersAt(
          effect.value.map((line) => lineStart(tr.state, line)).filter((pos): pos is number => pos !== null),
        )
      }
    }
    return set
  },
})

const currentLineDecoration = Decoration.line({ class: 'cm-stepcode-current-line' })

/** The start offset of the current line, or null. */
const currentLineField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    let next = value
    if (next !== null && tr.docChanged) {
      const mapped = mapLineStart(tr.changes, tr.startState.doc, next)
      next = mapped === null ? null : tr.state.doc.lineAt(mapped).from
    }
    for (const effect of tr.effects) {
      if (effect.is(setCurrentLine)) {
        next = effect.value === null ? null : lineStart(tr.state, effect.value)
      }
    }
    return next
  },
  provide: (field) =>
    EditorView.decorations.from(field, (value) =>
      value === null ? Decoration.none : Decoration.set(currentLineDecoration.range(value)),
    ),
})

/** Spec §6.2: setting a line also scrolls it into view. */
const scrollToCurrentLine = EditorState.transactionExtender.of((tr) => {
  for (const effect of tr.effects) {
    if (!effect.is(setCurrentLine) || effect.value === null) continue
    const line = effect.value
    if (line < 1 || line > tr.newDoc.lines) continue
    return { effects: EditorView.scrollIntoView(tr.newDoc.line(line).from, { y: 'nearest' }) }
  }
  return null
})

/** One gutter for both: breakpoint markers and the current-line arrow (spec §6.1). */
const debugGutter = gutter({
  class: 'cm-stepcode-breakpoints',
  markers: (view) => view.state.field(breakpointField, false) ?? RangeSet.empty,
  lineMarker: (view, line) => {
    const current = view.state.field(currentLineField, false)
    return current !== undefined && current !== null && current === line.from ? currentLineMarker : null
  },
  lineMarkerChange: (update) =>
    update.startState.field(currentLineField, false) !== update.state.field(currentLineField, false),
  initialSpacer: () => breakpointMarker,
  domEventHandlers: {
    mousedown(view, line) {
      view.dispatch({ effects: toggleBreakpoint.of({ line: view.state.doc.lineAt(line.from).number }) })
      return true
    },
  },
})

export function breakpoints(): Extension {
  return [breakpointField, debugGutter]
}

export function currentLine(): Extension {
  return [currentLineField, scrollToCurrentLine, debugGutter]
}

export function debug(): Extension {
  return [breakpoints(), currentLine()]
}

/** 1-based, ascending; empty without the extension. */
export function breakpointLines(state: EditorState): number[] {
  const set = state.field(breakpointField, false)
  if (set === undefined) return []
  return positionsOf(set).map((pos) => state.doc.lineAt(pos).number)
}

/** True when the update changed the breakpoint set — the host's cue to resend it. */
export function breakpointsChanged(update: ViewUpdate): boolean {
  return update.startState.field(breakpointField, false) !== update.state.field(breakpointField, false)
}

/** 1-based, or null. */
export function currentLineOf(state: EditorState): number | null {
  const pos = state.field(currentLineField, false)
  return pos === undefined || pos === null ? null : state.doc.lineAt(pos).number
}
```

A document change always rebuilds the set, so `breakpointsChanged` is true for any edit while a breakpoint exists; a selection-only transaction keeps the same object.

- [ ] **Step 4: Write `theme.ts`**

Create `packages/codemirror/src/theme.ts`:

```ts
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

/** Spec §8: class hooks with a minimal look; hosts restyle by class. */
export const stepcodeBaseTheme: Extension = EditorView.baseTheme({
  '.cm-gutter.cm-stepcode-breakpoints': { minWidth: '1.4em', cursor: 'pointer' },
  '.cm-stepcode-breakpoints .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.1em',
  },
  '.cm-stepcode-breakpoint': {
    width: '0.7em',
    height: '0.7em',
    borderRadius: '50%',
    backgroundColor: '#d33',
  },
  '.cm-stepcode-current-line-marker': {
    width: '0',
    height: '0',
    borderTop: '0.4em solid transparent',
    borderBottom: '0.4em solid transparent',
    borderLeft: '0.6em solid #d9a400',
  },
  '&light .cm-stepcode-current-line': { backgroundColor: 'rgba(255, 220, 0, 0.25)' },
  '&dark .cm-stepcode-current-line': { backgroundColor: 'rgba(255, 220, 0, 0.15)' },
  '.cm-tooltip .cm-stepcode-hover, .cm-tooltip .cm-stepcode-signature': {
    padding: '0.3em 0.5em',
    fontFamily: 'monospace',
  },
  '.cm-stepcode-signature-active': { fontWeight: 'bold' },
  '&light .cm-matchingBracket, &dark .cm-matchingBracket': {
    backgroundColor: 'transparent',
    outline: '1px solid #4a8',
  },
  '&light .cm-nonmatchingBracket, &dark .cm-nonmatchingBracket': {
    backgroundColor: 'transparent',
    outline: '1px solid #c44',
  },
})
```

- [ ] **Step 5: Run the test, typecheck, lint**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/debug.test.ts`
Expected: PASS. If happy-dom throws inside `EditorView` measurement (`getClientRects` and friends), extend `test/setup.ts` with the missing method as a no-op returning the `RECT` shape; do not switch the file to another environment. Then `pnpm --filter @stepcode/codemirror typecheck && pnpm lint:fix && pnpm lint` — exit 0. Confirm with `grep -n "from 'stepcode'" packages/codemirror/src/debug.ts packages/codemirror/src/theme.ts` printing nothing.

- [ ] **Step 6: Commit**

```bash
git add packages/codemirror/src/debug.ts packages/codemirror/src/theme.ts packages/codemirror/test/debug.test.ts packages/codemirror/test/setup.ts
git commit -m "feat(codemirror): breakpoint gutter, current-line marker and base theme"
```

---

### Task 12: the bundle, the barrel, README, changesets

**Files:**
- Create: `packages/codemirror/src/stepcode.ts`
- Modify: `packages/codemirror/src/index.ts` (whole file)
- Modify: `packages/codemirror/test/index.test.ts` (whole file)
- Create: `packages/codemirror/test/bundle.test.ts` (happy-dom)
- Create: `packages/codemirror/README.md`, `.changeset/codemirror.md`, `.changeset/language-tokens.md`

**Interfaces:**
- Consumes: everything above.
- Produces: `stepcode(options): LanguageSupport` and the public surface of spec §3.

- [ ] **Step 1: Write the failing tests**

Replace `packages/codemirror/test/index.test.ts`:

```ts
import { LanguageSupport } from '@codemirror/language'
import { describe, expect, it } from 'vitest'
import * as api from '../src/index'
import { es } from './helpers'

describe('@stepcode/codemirror', () => {
  it('exposes its package name', () => {
    expect(api.packageName).toBe('@stepcode/codemirror')
  })

  it('exports the surface of spec §3', () => {
    for (const name of [
      'stepcode',
      'stepcodeLanguage',
      'stepcodeLint',
      'stepcodeCompletion',
      'stepcodeSignatureHelp',
      'stepcodeHover',
      'stepcodeBlockMatching',
      'goToDefinition',
      'compileResultAt',
      'treeDataAt',
      'debug',
      'breakpoints',
      'currentLine',
      'breakpointLines',
      'breakpointsChanged',
      'currentLineOf',
      'stringsFor',
      'buildTree',
    ]) {
      expect(typeof api[name as keyof typeof api], name).toBe('function')
    }
    expect(Array.isArray(api.stepcodeKeymap)).toBe(true)
    expect(api.toggleBreakpoint).toBeDefined()
    expect(api.setBreakpoints).toBeDefined()
    expect(api.setCurrentLine).toBeDefined()
    expect(api.compileProp).toBeDefined()
    expect(api.stepcodeBaseTheme).toBeDefined()
    expect(api.nodeSet).toBeDefined()
  })

  it('bundles a LanguageSupport per profile', () => {
    expect(api.stepcode({ profile: es })).toBeInstanceOf(LanguageSupport)
  })
})
```

Create `packages/codemirror/test/bundle.test.ts`:

```ts
// @vitest-environment happy-dom
import { ensureSyntaxTree, foldable, syntaxTree } from '@codemirror/language'
import { diagnosticCount, forceLinting } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'
import { compileResultAt, debug, setCurrentLine, stepcode, toggleBreakpoint, breakpointLines } from '../src/index'
import { en, es } from './helpers'

const program = 'Proceso p\n  Definir a Como Entero;\n  a <- 1;\n  Escribir a;\nFinProceso'

describe('stepcode()', () => {
  it('mounts with every extension, parses, lints, folds and debugs', async () => {
    const view = new EditorView({
      state: EditorState.create({ doc: program, extensions: [stepcode({ profile: es }), debug()] }),
      parent: document.body,
    })
    ensureSyntaxTree(view.state, view.state.doc.length, 1e9)
    expect(syntaxTree(view.state).topNode.name).toBe('Program')
    expect(compileResultAt(view.state)?.diagnostics).toEqual([])
    expect(foldable(view.state, 0, view.state.doc.line(1).to)).not.toBeNull()

    const from = program.indexOf('Escribir a') + 'Escribir '.length
    view.dispatch({ changes: { from, to: from + 1, insert: 'b' } })
    ensureSyntaxTree(view.state, view.state.doc.length, 1e9)
    expect(compileResultAt(view.state)?.diagnostics.map((d) => d.code)).toEqual(['E3001'])
    forceLinting(view)
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(diagnosticCount(view.state)).toBe(1)

    view.dispatch({ effects: [toggleBreakpoint.of({ line: 3 }), setCurrentLine.of(3)] })
    expect(breakpointLines(view.state)).toEqual([3])
    expect(view.dom.querySelector('.cm-stepcode-current-line')).not.toBeNull()
    view.destroy()
  })

  it('defaults the locale to the profile locale and accepts an override', () => {
    const state = EditorState.create({ doc: program, extensions: stepcode({ profile: en, locale: 'es' }) })
    expect(state.doc.length).toBe(program.length)
    expect(stepcode({ profile: en }).language.name).toBe('stepcode')
  })

  it('does not bring a highlight style, a lint gutter or line numbers', () => {
    const view = new EditorView({
      state: EditorState.create({ doc: program, extensions: stepcode({ profile: es }) }),
      parent: document.body,
    })
    expect(view.dom.querySelector('.cm-lineNumbers')).toBeNull()
    expect(view.dom.querySelector('.cm-gutter-lint')).toBeNull()
    view.destroy()
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/index.test.ts packages/codemirror/test/bundle.test.ts`
Expected: FAIL — `api.stepcode is not a function` / `stepcode` not exported.

- [ ] **Step 3: Write `stepcode.ts` and the barrel**

Create `packages/codemirror/src/stepcode.ts`:

```ts
import { autocompletion } from '@codemirror/autocomplete'
import { foldGutter, indentOnInput, LanguageSupport } from '@codemirror/language'
import { keymap } from '@codemirror/view'
import type { ResolvedProfile } from '@stepcode/profiles'
import { stepcodeCompletion } from './completion'
import { stepcodeKeymap } from './definition'
import { stepcodeHover } from './hover'
import { stepcodeLint } from './lint'
import { stepcodeBlockMatching } from './matching'
import type { StepcodeOptions } from './options'
import { stepcodeLanguage } from './parser'
import { stepcodeSignatureHelp } from './signature'
import { stepcodeBaseTheme } from './theme'

/**
 * Spec §7: everything for one profile. Deliberately absent: a highlight style, the lint
 * gutter, line numbers, history and the default keymap — those are the host's.
 */
export function stepcode(options: { profile: ResolvedProfile; locale?: string }): LanguageSupport {
  const resolved: StepcodeOptions = {
    profile: options.profile,
    locale: options.locale ?? options.profile.locale,
  }
  return new LanguageSupport(stepcodeLanguage(resolved.profile), [
    stepcodeLint(resolved),
    stepcodeCompletion(resolved),
    stepcodeSignatureHelp(resolved),
    stepcodeHover(resolved),
    stepcodeBlockMatching(),
    autocompletion(),
    indentOnInput(),
    foldGutter(),
    keymap.of(stepcodeKeymap),
    stepcodeBaseTheme,
  ])
}
```

Replace `packages/codemirror/src/index.ts`:

```ts
export const packageName = '@stepcode/codemirror'

export { BLOCK_NAMES, closerOf, foldBlock, indentOnInputPatterns } from './blocks'
export { completionSourceFor, stepcodeCompletion } from './completion'
export {
  breakpointLines,
  breakpoints,
  breakpointsChanged,
  currentLine,
  currentLineOf,
  debug,
  mapLineStart,
  setBreakpoints,
  setCurrentLine,
  toggleBreakpoint,
} from './debug'
export { definitionAt, goToDefinition, stepcodeKeymap } from './definition'
export type { HoverInfo } from './hover'
export { hoverInfoAt, hoverSource, stepcodeHover } from './hover'
export { stepcodeDiagnostics, stepcodeLint, widen } from './lint'
export { stepcodeBlockMatching } from './matching'
export {
  IDENTIFIER_NAMES,
  keywordNodeName,
  LEAF_NAMES,
  MATCHING_PAIRS,
  NODE_NAMES,
  nodeId,
  nodeSet,
  STRUCTURE_NAMES,
} from './nodes'
export type { StepcodeOptions } from './options'
export { compileResultAt, stepcodeLanguage, treeDataAt } from './parser'
export type { Signature } from './signature'
export { signatureAt, stepcodeSignatureHelp } from './signature'
export type { OpenerKey } from './snippets'
export { blockSnippets, blockTemplates, OPENER_KEYS } from './snippets'
export { stepcode } from './stepcode'
export type { PlaceholderKey, Strings } from './strings'
export { stringsFor } from './strings'
export type { SignaturePart } from './symbols'
export {
  builtinKeyAt,
  builtinSignatureParts,
  identifierLeafAt,
  scopeAt,
  signatureText,
  symbolAt,
  symbolLabel,
  visibleSymbols,
} from './symbols'
export { stepcodeBaseTheme } from './theme'
export type { TreeData } from './tree'
export { buildTree, compileProp } from './tree'
```

- [ ] **Step 4: Run the package, then the whole repo**

Run: `pnpm vitest run --project @stepcode/codemirror`
Expected: PASS, every file. Then `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm build && pnpm test` — exit 0 (the editor's `App.test.tsx` still finds `packageName`; `tsdown` emits `dist/index.js` and `dist/index.d.ts`).

- [ ] **Step 5: README and changesets**

Create `packages/codemirror/README.md`:

````markdown
# @stepcode/codemirror

CodeMirror 6 language support for [StepCode](https://github.com/RolandoAndrade/stepcode),
built on the same parser and checker the runtime uses, plus the editor-side debugging
extensions. No worker, no interpreter: a host wires those.

```ts
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { lintGutter } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { breakpointLines, breakpointsChanged, debug, setCurrentLine, stepcode } from '@stepcode/codemirror'
import { profiles } from '@stepcode/profiles'

const view = new EditorView({
  state: EditorState.create({
    doc: 'Proceso hola\n  Escribir "hola";\nFinProceso',
    extensions: [
      stepcode({ profile: profiles.es }),
      debug(),
      // the host's choices:
      syntaxHighlighting(defaultHighlightStyle),
      lintGutter(),
      lineNumbers(),
      EditorView.updateListener.of((update) => {
        if (breakpointsChanged(update)) console.log(breakpointLines(update.state))
      }),
    ],
  }),
  parent: document.body,
})

// from a paused run:
view.dispatch({ effects: setCurrentLine.of(2) })
```

## What `stepcode()` bundles

One `LanguageSupport` per profile: the syntax tree (compiled by `stepcode`'s `compile` inside
a Lezer parser, so highlighting, diagnostics and completion never disagree), lint, folding,
indentation, block matching (`Si` ↔ `FinSi`), completion with block snippets, signature help,
hover, and `F12` go to definition. Switch profiles by wrapping it in a `Compartment`.

Every piece is also exported alone: `stepcodeLanguage`, `stepcodeLint`, `stepcodeCompletion`,
`stepcodeSignatureHelp`, `stepcodeHover`, `stepcodeBlockMatching`, `stepcodeKeymap`.
`compileResultAt(state)` hands back the `CompileResult` the tree was built from.

Not included on purpose: a highlight style, the lint gutter, line numbers, history, the
default keymap.

## Debugging

`debug()` (or `breakpoints()` and `currentLine()` separately) is pure editor state:

- a breakpoint gutter — click to toggle; `breakpointLines(state)` reads the lines,
  `setBreakpoints.of(lines)` / `toggleBreakpoint.of({ line })` change them,
  `breakpointsChanged(update)` tells an update listener when to resend them;
- a current-line marker — `setCurrentLine.of(line | null)` highlights the line, marks the
  gutter and scrolls it into view; `currentLineOf(state)` reads it back.

Markers follow their lines through edits and vanish when the line is deleted.

## Strings

Diagnostics render through `stepcode`'s catalogs; the few strings this package adds (symbol
kinds, "declared on line", snippet placeholders) come from `stringsFor(locale)` with `es` and
`en`, falling back to `en`. `stepcode({ profile, locale })` defaults `locale` to the profile's.
````

Create `.changeset/codemirror.md`:

```markdown
---
'@stepcode/codemirror': minor
---

First release: CodeMirror 6 language support built on the `stepcode` parser and checker
(highlighting, lint, folding, indentation, block matching, completion with block snippets,
signature help, hover, go to definition) and runtime-free debug extensions (breakpoint gutter,
current-line marker), with `es`/`en` strings.
```

Create `.changeset/language-tokens.md`:

```markdown
---
'stepcode': patch
---

`compile` now returns the parser's `tokens` alongside the AST, so an editor can attach every
token to a syntax-tree node without re-lexing.
```

- [ ] **Step 6: Final check and commit**

Run: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`
Expected: exit 0.

```bash
git add packages/codemirror .changeset/codemirror.md .changeset/language-tokens.md
git commit -m "feat(codemirror): stepcode() bundle, public surface, README and changesets"
```
