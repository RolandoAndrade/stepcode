# Interpreter and Run Controller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `start(program, options)`, the `Run` controller and `runProgram(program, options)` inside `packages/language` (npm `stepcode`): a resumable tree-walking interpreter in which every statement is one generator step, so breakpoints, stepping, inspection and input are one mechanism; the runtime value model, frames keyed by the checker's `Symbol` objects, the 22 builtin bodies, input parsing by target type, value rendering, the E4001–E4008 diagnostics in Spanish and English, `CompileResult` carrying the checker's side tables, and a run corpus (`<slug>.run.json` sidecars) that pins every program's output.

**Architecture:** One directory, `src/interpreter/`. `value.ts` is pure data: the value shapes, the array allocator, cell offsets, cell slots and the `RuntimeError` exception that carries a `Diagnostic`. `render.ts`, `input.ts` and `builtins.ts` are pure synchronous functions over values. `frame.ts` builds a frame's slots from `Scope.order` and produces the `Frame[]` that `inspect()` returns. `evaluate.ts` is the evaluator: statements and expressions are generator functions composed with `yield*`; a statement yields a `pause` event before it executes, `Leer` yields `input` events, `Esperar` yields a `wait` event, and a user call yields a `call` event so the controller — not the JS stack — opens the callee's frame. `run.ts` is the controller: it owns the frame stack and one generator per frame, drives the innermost generator, interprets events, applies the stepping rule, catches `RuntimeError` and freezes the frames. `program.ts` is `runProgram`, a loop over `continue({ budget })` with `await`s for input, sleep and the event loop. The interpreter trusts the checker: it reads `types`, `symbols` and `calls` from the `CompileResult` and never looks a name up.

**Tech Stack:** TypeScript 7 (strict, ESM), Vitest 4.1, tsdown 0.22, Biome 2.5, pnpm 11 workspace, `@stepcode/profiles` (workspace), `fast-check` 4 (devDependency, unused here). Verified in `package.json` (root: `"packageManager": "pnpm@11.25.0"`, scripts `lint`, `typecheck`, `test`, `build`) and `packages/language/package.json` (name `stepcode`, scripts `build: tsdown`, `typecheck: tsc --noEmit`, `test: vitest run`).

**Spec:** `docs/superpowers/specs/2026-09-04-language-interpreter-design.md` (all sections). Previous: `docs/superpowers/specs/2026-09-04-language-checker-design.md` (checker, implemented by `docs/superpowers/plans/2026-09-04-language-checker.md`) and `docs/superpowers/specs/2026-09-03-language-syntax-design.md` (lexer, parser, AST). Parent: `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` §3.2, §3.3, §3.4, §6, §7 item 3.

## Parallelism

Tasks touching disjoint files may run concurrently; tasks sharing a file are sequenced. The sub-spec B plan used the same rule and the only conflicts were on shared test files, so the shared files are named here explicitly.

| Task | Files it creates or modifies | Runs |
|---|---|---|
| 1 | `diagnostics/codes.ts`, `diagnostics/catalog/{es,en}.ts`, `compile.ts`, `checker/result.ts`, `checker/index.ts`, `checker/expressions.ts`, `checker/statements.ts`, `interpreter/value.ts`, `test/helpers.ts`, `test/diagnostics/format.test.ts`, `test/checker/by-code.test.ts`, `test/checker/compile.test.ts`, `test/interpreter/value.test.ts` | **alone, first** |
| 2 | `interpreter/render.ts`, `interpreter/input.ts`, `test/interpreter/render.test.ts`, `test/interpreter/input.test.ts` | parallel with 3 and 4 |
| 3 | `interpreter/builtins.ts`, `test/interpreter/builtins.test.ts` | parallel with 2 and 4 — but its `toText` body imports `renderValue` from Task 2's `render.ts`, so land Task 3 after Task 2 (Task 2 is the smallest of the three; start it first) |
| 4 | `interpreter/frame.ts`, `test/interpreter/frame.test.ts` | parallel with 2 and 3 |
| 5 | `interpreter/evaluate.ts` (expressions), `test/interpreter/drive.ts`, `test/interpreter/expressions.test.ts` | after 1–4 |
| 6 | `interpreter/evaluate.ts` (statements), `test/interpreter/drive.ts`, `test/interpreter/statements.test.ts` | after 5 (same two files) |
| 7 | `interpreter/run.ts`, `test/helpers.ts` (`collectRun`), `test/interpreter/run.test.ts`, `test/interpreter/by-code.test.ts` | after 6 |
| 8 | `interpreter/program.ts`, `interpreter/index.ts`, `src/index.ts`, `test/index.test.ts`, `test/interpreter/program.test.ts`, `README.md`, `.changeset/language-interpreter.md` | after 7 |
| 9 | `scripts/run-source.ts`, `scripts/extract-runs.ts`, `scripts/record-run.ts`, `test/corpus/run.test.ts`, `test/helpers.ts` (sidecar helpers), `test/corpus/programs/*.run.json`, `test/corpus/programs/README.md`, `test/interpreter/by-code.test.ts` (the `a[-1]` case) | after 8 |
| 10 | `test/corpus/guides/runtime/*.stepcode`, `test/corpus/guides/*.run.json`, `test/corpus/guides/README.md`, `test/corpus/guides.test.ts`, `test/corpus/run.test.ts` (the guides loop) | after 9 (shares `run.test.ts` and `run-source.ts`) |
| 11 | `test/corpus/step-equivalence.test.ts`, `test/interpreter/integration.test.ts` | after 10 |

Summary: 1 → {2, 3, 4} → 5 → 6 → 7 → 8 → 9 → 10 → 11. Only Tasks 2, 3 and 4 run concurrently. `test/helpers.ts` is touched by Tasks 1, 7 and 9, always by appending; `test/interpreter/drive.ts` by Tasks 5 and 6; `test/interpreter/by-code.test.ts` by Tasks 7 and 9; `test/corpus/run.test.ts` by Tasks 9 and 10.

## Global Constraints

These are the spec's binding rules and the repository's conventions. They hold in every task; do not weaken them.

- **TypeScript strict**, with the flags in `tsconfig.base.json`: `noUncheckedIndexedAccess` (every index access is `T | undefined`), **`exactOptionalPropertyTypes`** (never assign `undefined` to an optional property — build the object with the key omitted), `verbatimModuleSyntax` (`import type` for types), `noFallthroughCasesInSwitch`, `isolatedModules`. Imports are extensionless (`./value`, `../checker/result`).
- **ESM only**, `"type": "module"`. **No runtime dependencies** beyond `@stepcode/profiles`. Nothing is added to `dependencies` or `devDependencies` in this sub-spec.
- **Biome** (`biome.json`: 2-space indent, single quotes, no semicolons, trailing commas, line width 100, organized imports). Run `pnpm lint:fix` before every commit; `pnpm lint` must exit 0. Every command runs from the repo root.
- **Commands.** Package suite: `pnpm --filter stepcode test`; typecheck: `pnpm --filter stepcode typecheck`; one file: `pnpm vitest run --project stepcode <path under packages/language>`; whole repo: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`.
- **Strict TDD**: every step writes the failing test first, runs it to see it fail with the expected failure, then writes the minimal implementation, then runs it green. **One commit per task** (or per step group the task names), conventional-commit message in the style of the branch (`feat(language): …`, `test(language): …`, `docs(language): …`, `fix(language): …`), **no attribution trailers**, no pushing.
- **English artifacts**: code, comments, test names, README text, sidecar `name`s and commit messages are English. The corpus programs themselves are Spanish StepCode, as they were.
- **Every diagnostic code lives in both catalogs.** `Catalog.templates` is `Readonly<Record<DiagnosticCode, string>>`, so a code without an `es` and an `en` template fails typecheck; every variant added to one catalog is added to the other, and `test/diagnostics/format.test.ts` asserts the variant keys agree.
- **One test per table row.** Every row of spec §5.2, §5.3, §5.6, §5.7, §5.8 and §6.1, and every rule of §5.9, has a named test.
- **The interpreter trusts the checker.** It reads `program.types`, `program.symbols`, `program.calls` and `program.scopes`; it never re-derives a type, never resolves a name, never meets `ErrorStmt`, `ErrorExpr`, `extraMains` or a misplaced subprogram (`start` refuses any program with an error-severity diagnostic, §3.1). A missing side-table entry is an internal `Error`, never a diagnostic.
- **Runtime diagnostics are data**, `{ code, severity, span, data }`, created with `createDiagnostic`; types reach `data` pre-rendered with `typeToString(type, profile)`; operators pre-rendered with `operatorSpelling(op, profile)`; builtin keys travel raw in `data.builtin` and render through the `{builtin:$builtin}` slot.
- **Determinism.** A run is a function of `(source, profile, inputs, random sequence, limits)`. `random` and `randomBetween` consume exactly one `options.random()` value per call, in evaluation order. No `Map` is iterated except `Scope.order`-shaped arrays.
- **The core is synchronous.** No promise is created below `program.ts`. Output goes through `io.write` synchronously, once per `Escribir`.
- **Values.** `Entero` and `Real` are JS numbers, text is a JS string, `Logico` a boolean, arrays one flat row-major buffer shared by reference. Unassigned is `undefined`. No overflow checks.
- **`test/helpers.ts` grows by appending** in Tasks 1, 7 and 9; every other task reuses it verbatim. Merge new imports into the existing import block and let `pnpm lint:fix` sort them.
- **Scripts run with Node's type stripping**: `node --experimental-transform-types --conditions=development packages/language/scripts/<script>.ts` (`--experimental-transform-types` because `LineMap` uses a constructor parameter property, which plain stripping rejects; `--conditions=development` so `@stepcode/profiles` and `stepcode` resolve to `src/` without a build).

## File Structure

Everything below `packages/language/`.

```
src/
  interpreter/
    value.ts        Scalar, ArrayValue, RuntimeValue, Slot, isArrayValue, RuntimeError, fail,
                    allocateArray (E4001.size), checkIndex (E4001), cellOffset, cellSlot,
                    INTEGER_TEXT, REAL_TEXT, parseReal                        (Task 1)
    render.ts       renderValue(value, type, profile) (§5.6)                    (Task 2)
    input.ts        parseInput(text, type, profile) (§5.7)                      (Task 2)
    builtins.ts     callBuiltin(key, args, ctx): the 22 bodies (§5.8)           (Task 3)
    frame.ts        RuntimeFrame, Frame, FrameVariable, createFrame, slotOf,
                    bindSlot, bodyScopeOf, inspectFrames (§3.7, §4.2)           (Task 4)
    evaluate.ts     Context, Event, Gen, evaluate, evaluateRef, evaluateCall   (Task 5)
                    execute, runBody, runFrame, frameForCall (§5.1–§5.5, §5.9) (Task 6)
    run.ts          start, Run, RunState, StepResult, InputRequest (§3)        (Task 7)
    program.ts      runProgram, RunProgramOptions, RunOutcome (§3.6)            (Task 8)
    index.ts        barrel                                                     (Task 8)
  compile.ts        CompileResult extends CheckResult & { ast, source } (§7.1)  (Task 1)
  checker/result.ts nameOf(expr, profile) (§7.2)                                (Task 1)
  checker/index.ts  + nameOf                                                    (Task 1)
  checker/expressions.ts, checker/statements.ts   the three nameOf callers      (Task 1)
  diagnostics/codes.ts        + E4001–E4008                                     (Task 1)
  diagnostics/catalog/es.ts   + templates and variants of §6.2                  (Task 1)
  diagnostics/catalog/en.ts   + the same                                        (Task 1)
  index.ts          + start, runProgram, renderValue and the types (§7.3)       (Task 8)
scripts/
  run-source.ts     runSource(source, profile, answer, seed): the shared runner (Task 9)
  extract-runs.ts   v1 expectations → programs/*.run.json (§8.2)                (Task 9)
  record-run.ts     one run from the command line → <slug>.run.json (§8.3)     (Task 10)
test/
  helpers.ts        + seeded, compileEs (Task 1); collectRun (Task 7);
                    SidecarRun, Sidecar, readSidecar, runSidecar (Task 9)
  interpreter/
    value.test.ts        §4.1, allocator, offsets, cell slots, parseReal        (Task 1)
    render.test.ts       one test per row of §5.6                              (Task 2)
    input.test.ts        one test per row of §5.7                              (Task 2)
    builtins.test.ts     one test per row of §5.8 and every E4007 variant       (Task 3)
    frame.test.ts        §4.2 slots, binding, §3.7 inspect                     (Task 4)
    drive.ts             drain, evalIn (Task 5); runMain (Task 6)
    expressions.test.ts  §5.3, §5.4, §5.5 argument binding                     (Task 5)
    statements.test.ts   one test per row of §5.2 and each rule of §5.9        (Task 6)
    run.test.ts          §3.1–§3.5, §3.7                                       (Task 7)
    by-code.test.ts      one case per E4xxx, es and en, E4001.size direct      (Task 7)
    program.test.ts      §3.6                                                  (Task 8)
    integration.test.ts  recursion, determinism, abort, end to end             (Task 11)
  corpus/
    run.test.ts          every sidecar run through runProgram (§8.1)           (Tasks 9, 10)
    step-equivalence.test.ts   step() to the end equals runProgram (§8)        (Task 11)
    programs/*.run.json, programs/README.md                                    (Task 9)
    guides/runtime/*.stepcode, guides/*.run.json, guides/README.md             (Task 10)
    guides.test.ts       + the runtime programs                                (Task 10)
  index.test.ts          + the three exports and one end-to-end run            (Task 8)
README.md                + the interpreter section                             (Task 8)
.changeset/language-interpreter.md                                             (Task 8)
```

---

### Task 1: shared surfaces — codes, catalogs, `CompileResult`, `nameOf`, the value model, test helpers

**Files:**
- Modify: `packages/language/src/diagnostics/codes.ts` (the `DIAGNOSTIC_CODES` tuple, lines 8–72; `DIAGNOSTIC_SEVERITY`, lines 77–141)
- Modify: `packages/language/src/diagnostics/catalog/es.ts` (templates end at line 74, variants at lines 76–133)
- Modify: `packages/language/src/diagnostics/catalog/en.ts` (templates end at line 71, variants at lines 73–129)
- Modify: `packages/language/src/compile.ts` (whole file, 26 lines)
- Modify: `packages/language/src/checker/result.ts` (`nameOf`, lines 122–127; its use at line 148)
- Modify: `packages/language/src/checker/index.ts` (line 6, the `./result` export list)
- Modify: `packages/language/src/checker/expressions.ts` (line 200, the E3009 `scalar` report)
- Modify: `packages/language/src/checker/statements.ts` (line 216, the E3009 `array` report)
- Create: `packages/language/src/interpreter/value.ts`
- Modify: `packages/language/test/helpers.ts` (append at the end, line 579; merge imports at lines 1–21)
- Modify: `packages/language/test/diagnostics/format.test.ts` (the code list, lines 15–79; `SLOT_BAG`, lines 113–137)
- Modify: `packages/language/test/checker/by-code.test.ts` (the `falls back to the nameless wording` test, lines 565–585)
- Modify: `packages/language/test/checker/compile.test.ts` (one new test)
- Test: `packages/language/test/interpreter/value.test.ts`

**Interfaces:**
- Consumes: `createDiagnostic`, `Diagnostic`, `DiagnosticCode`, `DiagnosticData` from `../diagnostics/index`; `Span` from `../source/index`; `TypeKey`, `ResolvedProfile` from `@stepcode/profiles`; `CheckResult` from `./checker/index`.
- Produces:
  - `DIAGNOSTIC_CODES` gains `'E4001' … 'E4008'`, all `'error'` in `DIAGNOSTIC_SEVERITY`.
  - `es` and `en` gain the eight templates and the eleven variants of spec §6.2.
  - `interface CompileResult extends CheckResult { readonly ast: Program; readonly source: string }`
  - `function nameOf(expr: Expr, profile: ResolvedProfile): string` (exported from `checker/result.ts` and `checker/index.ts`)
  - In `interpreter/value.ts`:
    - `type Scalar = number | string | boolean`
    - `interface ArrayValue { readonly element: TypeKey; readonly dims: readonly number[]; readonly data: (Scalar | undefined)[] }`
    - `type RuntimeValue = Scalar | ArrayValue`
    - `interface Slot { value: RuntimeValue | undefined }`
    - `function isArrayValue(value: RuntimeValue | undefined): value is ArrayValue`
    - `class RuntimeError extends Error { readonly diagnostic: Diagnostic }`
    - `function fail(code: DiagnosticCode, span: Span, data?: DiagnosticData): never`
    - `function allocateArray(element: TypeKey, dims: readonly number[], at: { readonly name: string; readonly spans: readonly Span[] }): ArrayValue`
    - `function checkIndex(index: number, size: number, indexBase: number, span: Span, name: string): void`
    - `function cellOffset(dims: readonly number[], indices: readonly number[], indexBase: number): number`
    - `function cellSlot(array: ArrayValue, offset: number): Slot`
    - `const INTEGER_TEXT: RegExp`, `const REAL_TEXT: RegExp`, `function parseReal(text: string): number | undefined`
  - Test helpers: `seeded(seed: number): () => number` (mulberry32), `compileEs(source: string, profileName?: ProfileName): CompileResult` (throws on an error-severity diagnostic).

- [ ] **Step 1: Write the failing catalog test — extend `packages/language/test/diagnostics/format.test.ts`**

In the first test (`lists every code of the spec…`), append the eight runtime codes after `'W3004',`:

```ts
      'W3004',
      'E4001',
      'E4002',
      'E4003',
      'E4004',
      'E4005',
      'E4006',
      'E4007',
      'E4008',
    ])
```

and rename the test to `'lists every code of the spec, lexer first then parser, checker and runtime'`. In `SLOT_BAG`, add six slots after `kw: 'break',`:

```ts
    kw: 'break',
    index: 4,
    low: 1,
    high: 3,
    size: 0,
    depth: 1000,
    type: 'Entero',
  }
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/diagnostics/format.test.ts`
Expected: FAIL — `lists every code of the spec` reports the array is missing `E4001` … `E4008`; `es and en both spell every code` fails on `es is missing E4001`.

- [ ] **Step 3: Add the codes to `packages/language/src/diagnostics/codes.ts`**

After `'W3004', // function result never assigned` (line 71), before `] as const`:

```ts
  'W3004', // function result never assigned
  'E4001', // index out of range
  'E4002', // division by zero
  'E4003', // unassigned value read
  'E4004', // input rejected
  'E4005', // stack depth exceeded
  'E4006', // function ended without a result
  'E4007', // invalid builtin argument
  'E4008', // Para step is zero
] as const
```

After `W3004: 'warning',` (line 140), before `})`:

```ts
  W3004: 'warning',
  E4001: 'error',
  E4002: 'error',
  E4003: 'error',
  E4004: 'error',
  E4005: 'error',
  E4006: 'error',
  E4007: 'error',
  E4008: 'error',
})
```

Also update the doc comment at the top of the file: replace `A later sub-spec uses E4xxx (runtime).` with `E4xxx runtime.`.

- [ ] **Step 4: Add the templates and variants to `packages/language/src/diagnostics/catalog/es.ts`**

After the `W3004:` template (line 73), before the closing `}`:

```ts
  W3004: '«{name}» nunca recibe un valor: la función no devuelve nada.',
  E4001: 'El índice {index} se sale de «{name}»: sus posiciones van del {low} al {high}.',
  E4002: 'Esto divide entre cero: «{op}» recibió un divisor igual a 0.',
  E4003: '«{name}» todavía no tiene valor: asígnale uno antes de usarla.',
  E4004: 'La entrada «{text}» no sirve para «{name}», que es {type}.',
  E4005:
    'Demasiadas llamadas anidadas: «{name}» llegó a {depth} llamadas sin terminar. Revisa la condición de parada.',
  E4006:
    'La función «{name}» terminó sin devolver un valor: asigna el resultado o usa «{kw:return}».',
  E4007: '«{builtin:$builtin}» no acepta este valor.',
  E4008: 'El paso del bucle de «{name}» es 0: el bucle nunca terminaría.',
}
```

After the last variant (`'E3035.element': …`, line 132), before the closing `}` of `variants`:

```ts
  'E4001.size':
    '«{name}» no puede tener tamaño {size}: un arreglo necesita al menos una posición.',
  'E4003.cell': '«{name}[{index}]» todavía no tiene valor: asígnale uno antes de usarlo.',
  'E4004.integer':
    'La entrada «{text}» no es un {type:integer}: escribe solo dígitos, con signo opcional, como «-12».',
  'E4004.real':
    'La entrada «{text}» no es un {type:real}: escribe un número con punto decimal opcional, como «3.5».',
  'E4004.boolean': 'La entrada «{text}» no es un {type:boolean}: escribe «{kw:true}» o «{kw:false}».',
  'E4004.char': 'La entrada «{text}» no cabe en un {type:char}: escribe exactamente una letra.',
  'E4007.negative': '«{builtin:$builtin}» no acepta un número negativo.',
  'E4007.nonPositive': '«{builtin:$builtin}» necesita un número mayor que 0.',
  'E4007.domain': '«{builtin:$builtin}» solo acepta valores entre -1 y 1.',
  'E4007.range': '«{builtin:$builtin}» necesita que el primer valor no sea mayor que el segundo.',
  'E4007.number': '«{builtin:$builtin}» no pudo leer «{text}» como número.',
}
```

- [ ] **Step 5: Add the same to `packages/language/src/diagnostics/catalog/en.ts`**

After the `W3004:` template (line 70):

```ts
  W3004: '"{name}" is never given a value: the function returns nothing.',
  E4001: 'Index {index} is outside "{name}": its positions run from {low} to {high}.',
  E4002: 'This divides by zero: "{op}" received a divisor equal to 0.',
  E4003: '"{name}" has no value yet: give it one before using it.',
  E4004: 'The input "{text}" does not fit "{name}", which is {type}.',
  E4005:
    'Too many nested calls: "{name}" reached {depth} calls without returning. Check the stopping condition.',
  E4006: 'Function "{name}" ended without a result: assign its result or use "{kw:return}".',
  E4007: '"{builtin:$builtin}" does not accept this value.',
  E4008: 'The step of the loop over "{name}" is 0: the loop would never end.',
}
```

After the last variant (line 128):

```ts
  'E4001.size': '"{name}" cannot have size {size}: an array needs at least one position.',
  'E4003.cell': '"{name}[{index}]" has no value yet: give it one before using it.',
  'E4004.integer':
    'The input "{text}" is not an {type:integer}: type digits only, with an optional sign, like "-12".',
  'E4004.real':
    'The input "{text}" is not a {type:real}: type a number with an optional decimal point, like "3.5".',
  'E4004.boolean': 'The input "{text}" is not a {type:boolean}: type "{kw:true}" or "{kw:false}".',
  'E4004.char': 'The input "{text}" does not fit a {type:char}: type exactly one character.',
  'E4007.negative': '"{builtin:$builtin}" does not accept a negative number.',
  'E4007.nonPositive': '"{builtin:$builtin}" needs a number greater than 0.',
  'E4007.domain': '"{builtin:$builtin}" only accepts values between -1 and 1.',
  'E4007.range': '"{builtin:$builtin}" needs its first value to be no greater than its second.',
  'E4007.number': '"{builtin:$builtin}" could not read "{text}" as a number.',
}
```

- [ ] **Step 6: Run the catalog test to verify it passes**

Run: `pnpm vitest run --project stepcode test/diagnostics/format.test.ts`
Expected: PASS, every test — including `spells the same variants in es and en` and `leaves no unresolved slot in any variant of either catalog`.

- [ ] **Step 7: Write the failing `compile` test — extend `packages/language/test/checker/compile.test.ts`**

Append inside the file's top-level `describe` (or as a new `describe` at the end if the file has several):

```ts
describe('compile carries the checker tables and the source', () => {
  it('hands back types, symbols, calls, scopes and the source it compiled', () => {
    const source = [
      'Proceso p',
      '  Definir n Como Entero;',
      '  n <- 1;',
      '  Escribir n;',
      'FinProceso',
    ].join('\n')
    const result = compile(source, { profile: profiles.es })
    expect(result.source).toBe(source)
    expect(result.scopes.length).toBe(2)
    expect(result.types).toBeInstanceOf(WeakMap)
    expect(result.symbols).toBeInstanceOf(WeakMap)
    expect(result.calls).toBeInstanceOf(WeakMap)
    const main = result.ast.main
    expect(main).not.toBeNull()
    const write = main?.body[2]
    expect(write?.kind).toBe('WriteStmt')
    if (write?.kind !== 'WriteStmt') return
    const arg = write.args[0]
    expect(arg).toBeDefined()
    if (arg === undefined) return
    expect(result.types.get(arg)).toEqual({ kind: 'scalar', name: 'integer' })
  })
})
```

Add `import { profiles } from '@stepcode/profiles'` and `import { compile } from '../../src/compile'` if the file does not already import them.

- [ ] **Step 8: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/compile.test.ts`
Expected: FAIL — `expect(result.source).toBe(source)` receives `undefined` (and typecheck would reject `result.source`).

- [ ] **Step 9: Rewrite `packages/language/src/compile.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from './ast/index'
import { check, type CheckResult } from './checker/index'
import { sortDiagnostics } from './diagnostics/sort'
import { parse } from './parser/index'

/**
 * What `compile` hands back: the checker's tables unchanged, the merged diagnostics, the tree
 * and the source it came from. The interpreter reads `types`, `symbols` and `calls` from here
 * and builds its line map from `source` (interpreter spec §7.1); nobody re-runs `check`.
 */
export interface CompileResult extends CheckResult {
  readonly ast: Program
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
    source,
  }
}
```

- [ ] **Step 10: Run the compile tests to verify they pass**

Run: `pnpm vitest run --project stepcode test/checker/compile.test.ts test/index.test.ts`
Expected: PASS.

- [ ] **Step 11: Write the failing `nameOf` tests — modify `packages/language/test/checker/by-code.test.ts`**

Replace the test `falls back to the nameless wording when the value has no name` (lines 565–585) with these two, inside the same `describe('E3009 names the array itself', …)`. That test was the only user of the `es` catalog import (line 3): remove `import { es } from '../../src/diagnostics/catalog/es'` as well.

```ts
  // §7.2 of the interpreter spec: a call renders as its callee, so the array `f()` returned
  // is named after `f` instead of falling back to the nameless base template.
  it('names the function whose call returned the array', () => {
    const source = [
      'Funcion r Como Entero[3] <- f()',
      '  Definir b Como Entero[3];',
      '  b[1] <- 1;',
      '  Retornar b;',
      'FinFuncion',
      'Proceso p',
      '  Definir i Como Entero;',
      '  i <- f();',
      '  Escribir i;',
      'FinProceso',
    ].join('\n')
    expect(named(source)).toEqual(['«f» es un arreglo completo, y aquí hace falta un valor.'])
  })

  it('names the builtin whose result was indexed', () => {
    const source = main('Definir s Como Cadena;', 's <- "hola";', 'Escribir Longitud(s)[1];')
    expect(named(source)).toEqual(['«Longitud» no es un arreglo: no se puede indexar.'])
  })
```

- [ ] **Step 12: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/checker/by-code.test.ts`
Expected: FAIL — the first receives the base template `Aquí hace falta un valor suelto, y esto es un arreglo completo.`; the second receives `«» no es un arreglo: no se puede indexar.`.

- [ ] **Step 13: Give `nameOf` a profile — `packages/language/src/checker/result.ts`**

Replace lines 122–127:

```ts
/**
 * The name a diagnostic can print for an expression; empty when it has no name of its own. A
 * call is named after its callee and a builtin call after the profile's first spelling of the
 * builtin, the same "first spelling" rule `typeToString` and `formatDiagnostic` use, so
 * `Escribir f(x)` says «f» and `Longitud(s)[1]` says «Longitud». The interpreter reuses this
 * for E4001 and E4003 (interpreter spec §6.1).
 */
export function nameOf(expr: Expr, profile: ResolvedProfile): string {
  if (expr.kind === 'Identifier') return expr.text
  if (expr.kind === 'Index') return nameOf(expr.target, profile)
  if (expr.kind === 'Call') return expr.callee.text
  if (expr.kind === 'BuiltinCall') return profile.builtins[expr.key]?.[0] ?? expr.key
  return ''
}
```

On line 148, `nameOf(source)` becomes `nameOf(source, state.profile)`. In `checker/expressions.ts` line 200, `nameOf(node.target)` becomes `nameOf(node.target, state.profile)`. In `checker/statements.ts` line 216, `nameOf(arg)` becomes `nameOf(arg, state.profile)`. In `checker/index.ts` line 6, export it: `export { createState, nameOf, report, reportAssignFailure, setType } from './result'`.

- [ ] **Step 14: Run the checker suite to verify it passes**

Run: `pnpm vitest run --project stepcode test/checker`
Expected: PASS, every file.

- [ ] **Step 15: Write the failing value-model test `packages/language/test/interpreter/value.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import {
  allocateArray,
  cellOffset,
  cellSlot,
  checkIndex,
  fail,
  INTEGER_TEXT,
  isArrayValue,
  parseReal,
  REAL_TEXT,
  RuntimeError,
} from '../../src/interpreter/value'

const span = { start: 10, end: 12 }

describe('the value model', () => {
  it('tells an array from a scalar', () => {
    expect(isArrayValue(1)).toBe(false)
    expect(isArrayValue('a')).toBe(false)
    expect(isArrayValue(true)).toBe(false)
    expect(isArrayValue(undefined)).toBe(false)
    expect(isArrayValue({ element: 'integer', dims: [1], data: [undefined] })).toBe(true)
  })

  it('allocates one flat buffer of unassigned cells, row-major', () => {
    const array = allocateArray('real', [2, 3], { name: 'm', spans: [span, span] })
    expect(array.element).toBe('real')
    expect(array.dims).toEqual([2, 3])
    expect(array.data).toHaveLength(6)
    expect(array.data.every((cell) => cell === undefined)).toBe(true)
  })

  it('refuses a size below one with E4001.size at that size expression', () => {
    const second = { start: 20, end: 21 }
    let caught: unknown
    try {
      allocateArray('integer', [3, 0], { name: 'm', spans: [span, second] })
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(RuntimeError)
    if (!(caught instanceof RuntimeError)) return
    expect(caught.diagnostic.code).toBe('E4001')
    expect(caught.diagnostic.span).toEqual(second)
    expect(caught.diagnostic.data).toEqual({ name: 'm', size: 0, hint: 'size' })
    expect(formatDiagnostic(caught.diagnostic, 'es', profiles.es)).toBe(
      '«m» no puede tener tamaño 0: un arreglo necesita al menos una posición.',
    )
    expect(formatDiagnostic(caught.diagnostic, 'en', profiles.en)).toBe(
      '"m" cannot have size 0: an array needs at least one position.',
    )
  })

  it('computes row-major offsets under both index bases', () => {
    expect(cellOffset([3], [1], 1)).toBe(0)
    expect(cellOffset([3], [3], 1)).toBe(2)
    expect(cellOffset([2, 3], [1, 1], 1)).toBe(0)
    expect(cellOffset([2, 3], [1, 3], 1)).toBe(2)
    expect(cellOffset([2, 3], [2, 1], 1)).toBe(3)
    expect(cellOffset([2, 3], [2, 3], 1)).toBe(5)
    expect(cellOffset([2, 3], [0, 0], 0)).toBe(0)
    expect(cellOffset([2, 3], [1, 2], 0)).toBe(5)
    expect(cellOffset([2, 3, 4], [2, 3, 4], 1)).toBe(23)
  })

  it('accepts an index inside [indexBase, indexBase + size - 1] and nothing else', () => {
    expect(() => checkIndex(1, 3, 1, span, 'a')).not.toThrow()
    expect(() => checkIndex(3, 3, 1, span, 'a')).not.toThrow()
    expect(() => checkIndex(0, 3, 0, span, 'a')).not.toThrow()
    expect(() => checkIndex(2, 3, 0, span, 'a')).not.toThrow()
    for (const [index, base] of [
      [0, 1],
      [4, 1],
      [-1, 1],
      [3, 0],
      [-1, 0],
    ] as const) {
      let caught: unknown
      try {
        checkIndex(index, 3, base, span, 'a')
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(RuntimeError)
      if (!(caught instanceof RuntimeError)) return
      expect(caught.diagnostic.code).toBe('E4001')
      expect(caught.diagnostic.span).toEqual(span)
      expect(caught.diagnostic.data).toEqual({ name: 'a', index, low: base, high: base + 2 })
    }
  })

  it('renders E4001 in both locales', () => {
    let caught: unknown
    try {
      checkIndex(4, 3, 1, span, 'a')
    } catch (error) {
      caught = error
    }
    if (!(caught instanceof RuntimeError)) throw new Error('expected a RuntimeError')
    expect(formatDiagnostic(caught.diagnostic, 'es', profiles.es)).toBe(
      'El índice 4 se sale de «a»: sus posiciones van del 1 al 3.',
    )
    expect(formatDiagnostic(caught.diagnostic, 'en', profiles.en)).toBe(
      'Index 4 is outside "a": its positions run from 1 to 3.',
    )
  })

  it('makes a cell slot that reads and writes through to the buffer', () => {
    const array = allocateArray('integer', [3], { name: 'a', spans: [span] })
    const slot = cellSlot(array, 1)
    expect(slot.value).toBeUndefined()
    slot.value = 7
    expect(array.data).toEqual([undefined, 7, undefined])
    array.data[1] = 9
    expect(slot.value).toBe(9)
  })

  it('fail throws a RuntimeError carrying a diagnostic with the given data', () => {
    let caught: unknown
    try {
      fail('E4002', span, { op: '/' })
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(RuntimeError)
    if (!(caught instanceof RuntimeError)) return
    expect(caught.diagnostic).toEqual({
      code: 'E4002',
      severity: 'error',
      span,
      data: { op: '/' },
    })
    expect(caught.name).toBe('RuntimeError')
  })

  it('spells the input grammars of §5.7', () => {
    for (const text of ['0', '12', '+3', '-12']) expect(INTEGER_TEXT.test(text)).toBe(true)
    for (const text of ['1.5', '1.', '.5', '12', '', '1e3', 'abc', '1,5']) {
      expect(INTEGER_TEXT.test(text)).toBe(false)
    }
    for (const text of ['3.5', '3.', '.5', '-0.25', '+7', '12']) expect(REAL_TEXT.test(text)).toBe(true)
    for (const text of ['', '.', '1e3', '1,5', 'abc', '1.2.3']) expect(REAL_TEXT.test(text)).toBe(false)
  })

  it('parseReal trims, then applies the Real grammar', () => {
    expect(parseReal('  3.5 ')).toBe(3.5)
    expect(parseReal('12')).toBe(12)
    expect(parseReal('.5')).toBe(0.5)
    expect(parseReal('abc')).toBeUndefined()
    expect(parseReal('')).toBeUndefined()
    expect(parseReal('1,5')).toBeUndefined()
  })
})
```

- [ ] **Step 16: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/value.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/value`.

- [ ] **Step 17: Write `packages/language/src/interpreter/value.ts`**

```ts
import type { TypeKey } from '@stepcode/profiles'
import {
  createDiagnostic,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticData,
} from '../diagnostics/index'
import type { Span } from '../source/index'

/** `Entero` and `Real` are numbers, `Cadena` and `Caracter` strings, `Logico` a boolean (§4.1). */
export type Scalar = number | string | boolean

/**
 * One flat row-major buffer, shared by reference: assigning through any alias writes into the
 * same `data`. `dims` holds one size per rank, every size ≥ 1; a hole is `undefined`.
 */
export interface ArrayValue {
  readonly element: TypeKey
  readonly dims: readonly number[]
  readonly data: (Scalar | undefined)[]
}

export type RuntimeValue = Scalar | ArrayValue

/** A variable's storage. A cell slot (`cellSlot`) is one whose accessor reaches into a buffer. */
export interface Slot {
  value: RuntimeValue | undefined
}

export function isArrayValue(value: RuntimeValue | undefined): value is ArrayValue {
  return typeof value === 'object' && value !== null
}

/**
 * The internal exception a runtime diagnostic travels in. Thrown inside the evaluator, caught
 * by the controller, which freezes the frames and turns it into an `error` step result (§5.1).
 * It never escapes the public API.
 */
export class RuntimeError extends Error {
  constructor(readonly diagnostic: Diagnostic) {
    super(diagnostic.code)
    this.name = 'RuntimeError'
  }
}

export function fail(code: DiagnosticCode, span: Span, data: DiagnosticData = {}): never {
  throw new RuntimeError(createDiagnostic(code, span, data))
}

/**
 * A fresh array, every cell unassigned. A size below 1 is E4001 `size` at that size's
 * expression: the checker folds every size (E3023), so no compiled program reaches this, but
 * the allocator guards it anyway (§5.2, §9).
 */
export function allocateArray(
  element: TypeKey,
  dims: readonly number[],
  at: { readonly name: string; readonly spans: readonly Span[] },
): ArrayValue {
  let cells = 1
  dims.forEach((size, index) => {
    if (!Number.isInteger(size) || size < 1) {
      fail('E4001', at.spans[index] ?? { start: 0, end: 0 }, { name: at.name, size, hint: 'size' })
    }
    cells *= size
  })
  return { element, dims: [...dims], data: new Array<Scalar | undefined>(cells).fill(undefined) }
}

/** §5.4: an index must lie in `[indexBase, indexBase + size − 1]`; a negative one is simply out. */
export function checkIndex(
  index: number,
  size: number,
  indexBase: number,
  span: Span,
  name: string,
): void {
  const low = indexBase
  const high = indexBase + size - 1
  if (!Number.isInteger(index) || index < low || index > high) {
    fail('E4001', span, { name, index, low, high })
  }
}

/** §4.1: `offset = Σ (iₖ − b) · Π_{j>k} sⱼ`, for indices that already passed `checkIndex`. */
export function cellOffset(
  dims: readonly number[],
  indices: readonly number[],
  indexBase: number,
): number {
  let offset = 0
  for (let k = 0; k < dims.length; k++) {
    let stride = 1
    for (let j = k + 1; j < dims.length; j++) stride *= dims[j] ?? 1
    offset += ((indices[k] ?? indexBase) - indexBase) * stride
  }
  return offset
}

/** A slot whose value lives in one cell of `array`: what a by-reference `a[i]` binds to (§4.2). */
export function cellSlot(array: ArrayValue, offset: number): Slot {
  return {
    get value(): RuntimeValue | undefined {
      return array.data[offset]
    },
    set value(next: RuntimeValue | undefined) {
      array.data[offset] = isArrayValue(next) ? undefined : next
    },
  }
}

/** §5.7: the `Entero` input grammar. */
export const INTEGER_TEXT = /^[+-]?\d+$/

/** §5.7: the `Real` input grammar — dot only, integers accepted. Shared with `toNumber` (§5.8). */
export const REAL_TEXT = /^[+-]?(\d+\.?\d*|\.\d+)$/

export function parseReal(text: string): number | undefined {
  const trimmed = text.trim()
  return REAL_TEXT.test(trimmed) ? Number(trimmed) : undefined
}
```

- [ ] **Step 18: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/value.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 19: Add `seeded` and `compileEs` to `packages/language/test/helpers.ts`**

Merge `import { compile, type CompileResult } from '../src/compile'` into the import block, then append at the end of the file:

```ts
/**
 * mulberry32: a 32-bit seeded PRNG in `[0, 1)`, the `random` option every corpus run with
 * `Azar` or `Aleatorio` passes so its output is reproducible (interpreter spec §8.1).
 */
export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Compile, and refuse anything with an error: an interpreter test must run a program the
 * checker accepted, so a static mistake fails loudly here instead of surfacing as a runtime
 * surprise. Warnings are allowed, as `start` allows them.
 */
export function compileEs(source: string, profileName: ProfileName = 'es'): CompileResult {
  const result = compile(source, { profile: profileNamed(profileName) })
  const errors = result.diagnostics.filter((one) => one.severity === 'error')
  if (errors.length > 0) {
    throw new Error(
      `the program does not compile: ${errors
        .map((one) => `${one.code}@${source.slice(one.span.start, one.span.end)}`)
        .join(', ')}\n${source}`,
    )
  }
  return result
}
```

Add one test for `seeded` to `packages/language/test/interpreter/value.test.ts` (`import { compileEs, seeded } from '../helpers'` goes into the import block at the top):

```ts
describe('the test helpers', () => {
  it('seeded is deterministic per seed and stays in [0, 1)', () => {
    const a = seeded(1)
    const b = seeded(1)
    const c = seeded(2)
    const first = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(first)
    expect([c(), c(), c()]).not.toEqual(first)
    for (const value of first) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('compileEs refuses a program with an error and accepts one with a warning', () => {
    expect(() => compileEs('Proceso p\n  Escribir x;\nFinProceso')).toThrow(/E3001/)
    expect(compileEs('Proceso p\n  Definir a Como Entero;\n  a <- 1;\nFinProceso').source).toContain(
      'Definir a',
    )
  })
})
```

Run: `pnpm vitest run --project stepcode test/interpreter/value.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 20: Run lint, typecheck and the package suite**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm --filter stepcode test
```

Expected: all clean. Note `test/checker/side-tables.test.ts` and every other consumer of `CompileResult` still typecheck: the new shape is a superset.

- [ ] **Step 21: Commit**

```bash
git add packages/language/src packages/language/test
git commit -m "feat(language): runtime codes, side tables on compile, nameOf for calls, and the value model"
```

**Parallelism:** none — Task 1 runs alone; every later task imports from it.

---

### Task 2: `interpreter/render.ts` and `interpreter/input.ts`

**Files:**
- Create: `packages/language/src/interpreter/render.ts`
- Create: `packages/language/src/interpreter/input.ts`
- Test: `packages/language/test/interpreter/render.test.ts`
- Test: `packages/language/test/interpreter/input.test.ts`

**Interfaces:**
- Consumes: `ResolvedProfile` from `@stepcode/profiles`; `Type` from `../types/type`; `RuntimeValue`, `Scalar`, `isArrayValue`, `INTEGER_TEXT`, `parseReal` from `./value`.
- Produces:
  - `function renderValue(value: RuntimeValue, type: Type, profile: ResolvedProfile): string` — throws a plain `Error` for an array value or a non-scalar type (§5.6).
  - `type InputHint = 'integer' | 'real' | 'boolean' | 'char'`
  - `type InputResult = { readonly ok: true; readonly value: Scalar } | { readonly ok: false; readonly hint: InputHint; readonly text: string }` — `text` is the trimmed input, what E4004 quotes.
  - `function parseInput(text: string, type: Type, profile: ResolvedProfile): InputResult` — throws a plain `Error` for a non-scalar type (a `Leer` target is always a scalar, E3009 otherwise).

- [ ] **Step 1: Write the failing test `packages/language/test/interpreter/render.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { renderValue } from '../../src/interpreter/render'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING, UNKNOWN } from '../../src/types/type'

describe('renderValue (§5.6)', () => {
  it('renders an Entero as a decimal integer', () => {
    expect(renderValue(42, INTEGER, profiles.es)).toBe('42')
    expect(renderValue(-7, INTEGER, profiles.es)).toBe('-7')
    expect(renderValue(0, INTEGER, profiles.es)).toBe('0')
  })

  it('renders a Real as the JS shortest round-trip, integral values without a point', () => {
    expect(renderValue(2, REAL, profiles.es)).toBe('2')
    expect(renderValue(4 / 2, REAL, profiles.es)).toBe('2')
    expect(renderValue(2.5, REAL, profiles.es)).toBe('2.5')
    expect(renderValue(0.1 + 0.2, REAL, profiles.es)).toBe('0.30000000000000004')
    expect(renderValue(1e21, REAL, profiles.es)).toBe('1e+21')
    expect(renderValue(1e-7, REAL, profiles.es)).toBe('1e-7')
  })

  it('renders a Logico with the profile first spelling of true and false', () => {
    expect(renderValue(true, BOOLEAN, profiles.es)).toBe('Verdadero')
    expect(renderValue(false, BOOLEAN, profiles.es)).toBe('Falso')
    expect(renderValue(true, BOOLEAN, profiles.en)).toBe('True')
    expect(renderValue(false, BOOLEAN, profiles.en)).toBe('False')
  })

  it('renders a Cadena and a Caracter as the string itself', () => {
    expect(renderValue('hola', STRING, profiles.es)).toBe('hola')
    expect(renderValue('', STRING, profiles.es)).toBe('')
    expect(renderValue('ñ', CHAR, profiles.es)).toBe('ñ')
  })

  it('throws for an array: hosts render arrays themselves', () => {
    const array = { element: 'integer' as const, dims: [1], data: [1] }
    expect(() => renderValue(array, arrayOf('integer', 1), profiles.es)).toThrow(/array/)
    expect(() => renderValue(1, arrayOf('integer', 1), profiles.es)).toThrow(/array/)
    expect(() => renderValue(1, UNKNOWN, profiles.es)).toThrow()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/render.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/render`.

- [ ] **Step 3: Write `packages/language/src/interpreter/render.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Type } from '../types/type'
import { isArrayValue, type RuntimeValue } from './value'

/**
 * §5.6. Used by `Escribir`, by `ConvertirATexto` and by hosts for the variables panel. Numbers
 * print as JS prints them — an integral `Real` has no point, a huge one has an exponent — and a
 * `Logico` prints as the profile's first spelling of `true` / `false`. Arrays never render:
 * E3009 keeps them out of `Escribir`, and a host draws an `ArrayValue` itself.
 */
export function renderValue(value: RuntimeValue, type: Type, profile: ResolvedProfile): string {
  if (isArrayValue(value) || type.kind !== 'scalar') {
    throw new Error('renderValue: an array does not render; hosts render arrays themselves')
  }
  switch (type.name) {
    case 'integer':
    case 'real':
      return String(value)
    case 'boolean':
      return value === true
        ? (profile.keywords.true[0] ?? 'true')
        : (profile.keywords.false[0] ?? 'false')
    case 'string':
    case 'char':
      return String(value)
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/render.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing test `packages/language/test/interpreter/input.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { parseInput } from '../../src/interpreter/input'
import { arrayOf, BOOLEAN, CHAR, INTEGER, REAL, STRING } from '../../src/types/type'

describe('parseInput (§5.7)', () => {
  it('Entero accepts an optionally signed digit string and nothing else', () => {
    expect(parseInput('12', INTEGER, profiles.es)).toEqual({ ok: true, value: 12 })
    expect(parseInput('-12', INTEGER, profiles.es)).toEqual({ ok: true, value: -12 })
    expect(parseInput('+3', INTEGER, profiles.es)).toEqual({ ok: true, value: 3 })
    expect(parseInput('1.5', INTEGER, profiles.es)).toEqual({ ok: false, hint: 'integer', text: '1.5' })
    expect(parseInput('abc', INTEGER, profiles.es)).toEqual({ ok: false, hint: 'integer', text: 'abc' })
    expect(parseInput('', INTEGER, profiles.es)).toEqual({ ok: false, hint: 'integer', text: '' })
  })

  it('Real accepts the dot grammar, integers included, and rejects a comma', () => {
    expect(parseInput('3.5', REAL, profiles.es)).toEqual({ ok: true, value: 3.5 })
    expect(parseInput('-1.5', REAL, profiles.es)).toEqual({ ok: true, value: -1.5 })
    expect(parseInput('.5', REAL, profiles.es)).toEqual({ ok: true, value: 0.5 })
    expect(parseInput('3.', REAL, profiles.es)).toEqual({ ok: true, value: 3 })
    expect(parseInput('12', REAL, profiles.es)).toEqual({ ok: true, value: 12 })
    expect(parseInput('3,5', REAL, profiles.es)).toEqual({ ok: false, hint: 'real', text: '3,5' })
    expect(parseInput('1e3', REAL, profiles.es)).toEqual({ ok: false, hint: 'real', text: '1e3' })
  })

  it('Logico accepts any spelling of true or false under the profile normalizer', () => {
    expect(parseInput('Verdadero', BOOLEAN, profiles.es)).toEqual({ ok: true, value: true })
    expect(parseInput('verdadero', BOOLEAN, profiles.es)).toEqual({ ok: true, value: true })
    expect(parseInput('FALSO', BOOLEAN, profiles.es)).toEqual({ ok: true, value: false })
    expect(parseInput('True', BOOLEAN, profiles.en)).toEqual({ ok: true, value: true })
    expect(parseInput('false', BOOLEAN, profiles.en)).toEqual({ ok: true, value: false })
    expect(parseInput('si', BOOLEAN, profiles.es)).toEqual({ ok: false, hint: 'boolean', text: 'si' })
    expect(parseInput('True', BOOLEAN, profiles.es)).toEqual({ ok: false, hint: 'boolean', text: 'True' })
  })

  it('Caracter accepts exactly one code point, an astral one included', () => {
    expect(parseInput('a', CHAR, profiles.es)).toEqual({ ok: true, value: 'a' })
    expect(parseInput('😀', CHAR, profiles.es)).toEqual({ ok: true, value: '😀' })
    expect(parseInput('ab', CHAR, profiles.es)).toEqual({ ok: false, hint: 'char', text: 'ab' })
    expect(parseInput('', CHAR, profiles.es)).toEqual({ ok: false, hint: 'char', text: '' })
  })

  it('Cadena accepts any text, the empty one included', () => {
    expect(parseInput('hola mundo', STRING, profiles.es)).toEqual({ ok: true, value: 'hola mundo' })
    expect(parseInput('', STRING, profiles.es)).toEqual({ ok: true, value: '' })
  })

  it('trims leading and trailing whitespace for every type, Cadena included', () => {
    expect(parseInput('  12 ', INTEGER, profiles.es)).toEqual({ ok: true, value: 12 })
    expect(parseInput('\t3.5\n', REAL, profiles.es)).toEqual({ ok: true, value: 3.5 })
    expect(parseInput(' Falso ', BOOLEAN, profiles.es)).toEqual({ ok: true, value: false })
    expect(parseInput(' x ', CHAR, profiles.es)).toEqual({ ok: true, value: 'x' })
    expect(parseInput('  hola  ', STRING, profiles.es)).toEqual({ ok: true, value: 'hola' })
    expect(parseInput(' 1.5 ', INTEGER, profiles.es)).toEqual({ ok: false, hint: 'integer', text: '1.5' })
  })

  it('throws for a non-scalar target type', () => {
    expect(() => parseInput('1', arrayOf('integer', 1), profiles.es)).toThrow()
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/input.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/input`.

- [ ] **Step 7: Write `packages/language/src/interpreter/input.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Type } from '../types/type'
import { INTEGER_TEXT, parseReal, type Scalar } from './value'

/** The E4004 hint: every rejectable type has one, and `Cadena` never rejects (§6.1). */
export type InputHint = 'integer' | 'real' | 'boolean' | 'char'

export type InputResult =
  | { readonly ok: true; readonly value: Scalar }
  | { readonly ok: false; readonly hint: InputHint; readonly text: string }

const accepted = (value: Scalar): InputResult => ({ ok: true, value })
const rejected = (hint: InputHint, text: string): InputResult => ({ ok: false, hint, text })

function spelled(spellings: readonly string[], text: string, profile: ResolvedProfile): boolean {
  const wanted = profile.normalize(text)
  return spellings.some((spelling) => profile.normalize(spelling) === wanted)
}

/**
 * §5.7: trim, then parse by the target's static type. The text a rejection carries is the
 * trimmed one, so the message quotes what the reader typed without its surrounding space.
 */
export function parseInput(text: string, type: Type, profile: ResolvedProfile): InputResult {
  if (type.kind !== 'scalar') throw new Error('parseInput: a Leer target is always a scalar')
  const trimmed = text.trim()
  switch (type.name) {
    case 'integer':
      return INTEGER_TEXT.test(trimmed) ? accepted(Number(trimmed)) : rejected('integer', trimmed)
    case 'real': {
      const value = parseReal(trimmed)
      return value === undefined ? rejected('real', trimmed) : accepted(value)
    }
    case 'boolean':
      if (spelled(profile.keywords.true, trimmed, profile)) return accepted(true)
      if (spelled(profile.keywords.false, trimmed, profile)) return accepted(false)
      return rejected('boolean', trimmed)
    case 'char':
      return [...trimmed].length === 1 ? accepted(trimmed) : rejected('char', trimmed)
    case 'string':
      return accepted(trimmed)
  }
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/input.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 9: Run lint and typecheck, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
git add packages/language/src/interpreter/render.ts packages/language/src/interpreter/input.ts packages/language/test/interpreter/render.test.ts packages/language/test/interpreter/input.test.ts
git commit -m "feat(language): render values and parse input by target type"
```

**Parallelism:** parallel with Tasks 3 and 4. Task 3 imports `renderValue`; land this task first.

---

### Task 3: `interpreter/builtins.ts` — the 22 bodies

**Files:**
- Create: `packages/language/src/interpreter/builtins.ts`
- Test: `packages/language/test/interpreter/builtins.test.ts`

**Interfaces:**
- Consumes: `BuiltinKey`, `ResolvedProfile` from `@stepcode/profiles`; `Span` from `../source/index`; `BOOLEAN`, `REAL`, `STRING` from `../types/type`; `renderValue` from `./render`; `checkIndex`, `fail`, `parseReal`, `Scalar` from `./value`.
- Produces:
  - `interface BuiltinContext { readonly profile: ResolvedProfile; readonly random: () => number; readonly indexBase: number; readonly spans: readonly Span[]; readonly names: readonly string[] }` — `spans[i]` is the span of argument `i` (E4007 is reported there), `names[i]` is `nameOf(arg[i], profile)` (`''` when nameless), used by `substring`'s E4001.
  - `function callBuiltin(key: BuiltinKey, args: readonly Scalar[], ctx: BuiltinContext): Scalar` — throws `RuntimeError` for E4007 and E4001, never yields.

- [ ] **Step 1: Write the failing test `packages/language/test/interpreter/builtins.test.ts`**

```ts
import type { BuiltinKey } from '@stepcode/profiles'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { type BuiltinContext, callBuiltin } from '../../src/interpreter/builtins'
import { RuntimeError, type Scalar } from '../../src/interpreter/value'
import { seeded } from '../helpers'

const spans = [
  { start: 0, end: 1 },
  { start: 2, end: 3 },
  { start: 4, end: 5 },
]

function context(overrides: Partial<BuiltinContext> = {}): BuiltinContext {
  return {
    profile: profiles.es,
    random: () => 0.5,
    indexBase: 1,
    spans,
    names: ['s', '', ''],
    ...overrides,
  }
}

const call = (key: BuiltinKey, args: Scalar[], ctx = context()): Scalar => callBuiltin(key, args, ctx)

function failure(key: BuiltinKey, args: Scalar[], ctx = context()): RuntimeError {
  try {
    callBuiltin(key, args, ctx)
  } catch (error) {
    if (error instanceof RuntimeError) return error
    throw error
  }
  throw new Error(`${key} did not fail`)
}

describe('builtin bodies (§5.8)', () => {
  it('abs keeps the argument type: Math.abs', () => {
    expect(call('abs', [-3])).toBe(3)
    expect(call('abs', [-2.5])).toBe(2.5)
    expect(call('abs', [4])).toBe(4)
  })

  it('sqrt is Math.sqrt and rejects a negative with E4007.negative', () => {
    expect(call('sqrt', [9])).toBe(3)
    expect(call('sqrt', [0])).toBe(0)
    const error = failure('sqrt', [-1])
    expect(error.diagnostic.code).toBe('E4007')
    expect(error.diagnostic.span).toEqual(spans[0])
    expect(error.diagnostic.data).toEqual({ builtin: 'sqrt', hint: 'negative' })
  })

  it('ln is Math.log and rejects zero and below with E4007.nonPositive', () => {
    expect(call('ln', [Math.E])).toBeCloseTo(1)
    expect(failure('ln', [0]).diagnostic.data).toEqual({ builtin: 'ln', hint: 'nonPositive' })
    expect(failure('ln', [-2]).diagnostic.data).toEqual({ builtin: 'ln', hint: 'nonPositive' })
  })

  it('exp is Math.exp', () => {
    expect(call('exp', [0])).toBe(1)
    expect(call('exp', [1])).toBeCloseTo(Math.E)
  })

  it('sin, cos and tan are the Math functions', () => {
    expect(call('sin', [0])).toBe(0)
    expect(call('cos', [0])).toBe(1)
    expect(call('tan', [0])).toBe(0)
    expect(call('sin', [Math.PI / 2])).toBeCloseTo(1)
  })

  it('asin and acos reject |x| > 1 with E4007.domain', () => {
    expect(call('asin', [1])).toBeCloseTo(Math.PI / 2)
    expect(call('acos', [1])).toBe(0)
    expect(call('asin', [-1])).toBeCloseTo(-Math.PI / 2)
    expect(failure('asin', [1.5]).diagnostic.data).toEqual({ builtin: 'asin', hint: 'domain' })
    expect(failure('acos', [-2]).diagnostic.data).toEqual({ builtin: 'acos', hint: 'domain' })
  })

  it('atan is Math.atan', () => {
    expect(call('atan', [0])).toBe(0)
    expect(call('atan', [1])).toBeCloseTo(Math.PI / 4)
  })

  it('trunc is Math.trunc', () => {
    expect(call('trunc', [1.5])).toBe(1)
    expect(call('trunc', [-1.5])).toBe(-1)
    expect(call('trunc', [7])).toBe(7)
  })

  it('round is half away from zero: round(-1.5) is -2', () => {
    expect(call('round', [1.5])).toBe(2)
    expect(call('round', [-1.5])).toBe(-2)
    expect(call('round', [2.4])).toBe(2)
    expect(call('round', [-2.4])).toBe(-2)
    expect(call('round', [0])).toBe(0)
  })

  it('random consumes one value of options.random and takes no argument', () => {
    const values = [0.25, 0.75]
    let calls = 0
    const ctx = context({ random: () => values[calls++] ?? 0 })
    expect(call('random', [], ctx)).toBe(0.25)
    expect(call('random', [], ctx)).toBe(0.75)
    expect(calls).toBe(2)
  })

  it('randomBetween is an Entero in [a, b] inclusive, one random value per call', () => {
    expect(call('randomBetween', [1, 6], context({ random: () => 0 }))).toBe(1)
    expect(call('randomBetween', [1, 6], context({ random: () => 0.999 }))).toBe(6)
    expect(call('randomBetween', [1, 6], context({ random: () => 0.5 }))).toBe(4)
    expect(call('randomBetween', [3, 3], context({ random: () => 0.7 }))).toBe(3)
    const random = seeded(7)
    const seen = new Set<Scalar>()
    for (let i = 0; i < 200; i++) seen.add(call('randomBetween', [-2, 2], context({ random })))
    expect([...seen].sort()).toEqual([-1, -2, 0, 1, 2].sort())
  })

  it('randomBetween rejects a > b with E4007.range at the first argument', () => {
    const error = failure('randomBetween', [5, 1])
    expect(error.diagnostic.span).toEqual(spans[0])
    expect(error.diagnostic.data).toEqual({ builtin: 'randomBetween', hint: 'range' })
  })

  it('pi is Math.PI', () => {
    expect(call('pi', [])).toBe(Math.PI)
  })

  it('length counts code points', () => {
    expect(call('length', ['hola'])).toBe(4)
    expect(call('length', [''])).toBe(0)
    expect(call('length', ['a😀b'])).toBe(3)
  })

  it('upper and lower keep the argument shape', () => {
    expect(call('upper', ['hola'])).toBe('HOLA')
    expect(call('lower', ['HOLA'])).toBe('hola')
    expect(call('upper', ['ñ'])).toBe('Ñ')
  })

  it('substring yields "" when ini > fin with no bounds check', () => {
    expect(call('substring', ['hola', 1, 0])).toBe('')
    expect(call('substring', ['hola', 5, 4])).toBe('')
    expect(call('substring', ['hola', 9, 2])).toBe('')
  })

  it('substring is inclusive from ini to fin in code points under indexBase', () => {
    expect(call('substring', ['hola', 1, 2])).toBe('ho')
    expect(call('substring', ['hola', 2, 4])).toBe('ola')
    expect(call('substring', ['hola', 3, 3])).toBe('l')
    expect(call('substring', ['a😀b', 2, 2])).toBe('😀')
    expect(call('substring', ['hola', 0, 1], context({ indexBase: 0 }))).toBe('ho')
  })

  it('substring reports an out-of-range position as E4001 at that argument, named after the text', () => {
    const low = failure('substring', ['hola', 0, 2])
    expect(low.diagnostic.code).toBe('E4001')
    expect(low.diagnostic.span).toEqual(spans[1])
    expect(low.diagnostic.data).toEqual({ name: 's', index: 0, low: 1, high: 4 })
    const high = failure('substring', ['hola', 2, 5])
    expect(high.diagnostic.span).toEqual(spans[2])
    expect(high.diagnostic.data).toEqual({ name: 's', index: 5, low: 1, high: 4 })
  })

  it('concat joins two texts', () => {
    expect(call('concat', ['ho', 'la'])).toBe('hola')
    expect(call('concat', ['', 'x'])).toBe('x')
  })

  it('toNumber trims, applies the Real grammar and yields a Real', () => {
    expect(call('toNumber', ['12'])).toBe(12)
    expect(call('toNumber', [' 3.5 '])).toBe(3.5)
    expect(call('toNumber', ['-.5'])).toBe(-0.5)
  })

  it('toNumber rejects other text with E4007.number carrying the text', () => {
    const error = failure('toNumber', ['doce'])
    expect(error.diagnostic.span).toEqual(spans[0])
    expect(error.diagnostic.data).toEqual({ builtin: 'toNumber', hint: 'number', text: 'doce' })
  })

  it('toText renders with renderValue', () => {
    expect(call('toText', [12])).toBe('12')
    expect(call('toText', [2.5])).toBe('2.5')
    expect(call('toText', [true])).toBe('Verdadero')
    expect(call('toText', [false], context({ profile: profiles.en }))).toBe('False')
    expect(call('toText', ['ya'])).toBe('ya')
  })

  it('renders every E4007 variant in es and en with no unfilled slot', () => {
    const cases: [BuiltinKey, Scalar[]][] = [
      ['sqrt', [-1]],
      ['ln', [0]],
      ['asin', [2]],
      ['randomBetween', [5, 1]],
      ['toNumber', ['x']],
    ]
    for (const [key, args] of cases) {
      const { diagnostic } = failure(key, args)
      const spanish = formatDiagnostic(diagnostic, 'es', profiles.es)
      const english = formatDiagnostic(diagnostic, 'en', profiles.en)
      expect(spanish, key).not.toMatch(/\{[a-zA-Z$:]+\}/)
      expect(english, key).not.toMatch(/\{[a-zA-Z$:]+\}/)
      expect(spanish).not.toBe(english)
    }
    expect(formatDiagnostic(failure('sqrt', [-1]).diagnostic, 'es', profiles.es)).toBe(
      '«RC» no acepta un número negativo.',
    )
    expect(formatDiagnostic(failure('toNumber', ['x']).diagnostic, 'en', profiles.en)).toBe(
      '"ToNumber" could not read "x" as a number.',
    )
  })
})
```

If the `es` profile's first spelling of `sqrt` is not `RC` or the `en` spelling of `toNumber` is not `ToNumber`, read `packages/profiles/src/profiles/es.json` and `en.json` and use the first spelling listed there; the assertion is about the first-spelling rule, not about those two words.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/builtins.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/builtins`.

- [ ] **Step 3: Write `packages/language/src/interpreter/builtins.ts`**

```ts
import type { BuiltinKey, ResolvedProfile } from '@stepcode/profiles'
import type { Span } from '../source/index'
import { BOOLEAN, REAL, STRING } from '../types/type'
import { renderValue } from './render'
import { checkIndex, fail, parseReal, type Scalar } from './value'

export interface BuiltinContext {
  readonly profile: ResolvedProfile
  /** `options.random`: one value consumed per `random` / `randomBetween` call (§5.8). */
  readonly random: () => number
  readonly indexBase: number
  /** One span per argument: E4007 and `substring`'s E4001 point at the offending argument. */
  readonly spans: readonly Span[]
  /** `nameOf` of each argument, `''` when it has none: `substring`'s E4001 names the text. */
  readonly names: readonly string[]
}

const NO_SPAN: Span = { start: 0, end: 0 }

function spanAt(ctx: BuiltinContext, index: number): Span {
  return ctx.spans[index] ?? NO_SPAN
}

function reject(
  ctx: BuiltinContext,
  key: BuiltinKey,
  index: number,
  hint: 'negative' | 'nonPositive' | 'domain' | 'range' | 'number',
  text?: string,
): never {
  return fail(
    'E4007',
    spanAt(ctx, index),
    text === undefined ? { builtin: key, hint } : { builtin: key, hint, text },
  )
}

const num = (args: readonly Scalar[], index: number): number => Number(args[index] ?? 0)
const str = (args: readonly Scalar[], index: number): string => String(args[index] ?? '')

/**
 * §5.8: the bodies. Arity and result types are the checker's business (`BUILTIN_SIGNATURES`);
 * by the time a call reaches here it has the right number of arguments of the right classes.
 * Nothing here yields, so a builtin is plain synchronous code inside an expression generator.
 */
export function callBuiltin(key: BuiltinKey, args: readonly Scalar[], ctx: BuiltinContext): Scalar {
  switch (key) {
    case 'abs':
      return Math.abs(num(args, 0))
    case 'sqrt': {
      const x = num(args, 0)
      if (x < 0) reject(ctx, key, 0, 'negative')
      return Math.sqrt(x)
    }
    case 'ln': {
      const x = num(args, 0)
      if (x <= 0) reject(ctx, key, 0, 'nonPositive')
      return Math.log(x)
    }
    case 'exp':
      return Math.exp(num(args, 0))
    case 'sin':
      return Math.sin(num(args, 0))
    case 'cos':
      return Math.cos(num(args, 0))
    case 'tan':
      return Math.tan(num(args, 0))
    case 'asin':
    case 'acos': {
      const x = num(args, 0)
      if (Math.abs(x) > 1) reject(ctx, key, 0, 'domain')
      return key === 'asin' ? Math.asin(x) : Math.acos(x)
    }
    case 'atan':
      return Math.atan(num(args, 0))
    case 'trunc':
      return Math.trunc(num(args, 0))
    case 'round': {
      // Half away from zero, not JS's half-up: round(-1.5) is -2 (§5.8, §9).
      const x = num(args, 0)
      return x === 0 ? 0 : Math.sign(x) * Math.round(Math.abs(x))
    }
    case 'random':
      return ctx.random()
    case 'randomBetween': {
      const a = num(args, 0)
      const b = num(args, 1)
      if (a > b) reject(ctx, key, 0, 'range')
      return a + Math.floor(ctx.random() * (b - a + 1))
    }
    case 'pi':
      return Math.PI
    case 'length':
      return [...str(args, 0)].length
    case 'upper':
      return str(args, 0).toUpperCase()
    case 'lower':
      return str(args, 0).toLowerCase()
    case 'substring': {
      const points = [...str(args, 0)]
      const ini = num(args, 1)
      const fin = num(args, 2)
      // The corpus leans on `Subcadena(s, 1, 0)` and `Subcadena(s, n + 1, n)` being "" (§5.8).
      if (ini > fin) return ''
      const name = ctx.names[0] ?? ''
      checkIndex(ini, points.length, ctx.indexBase, spanAt(ctx, 1), name)
      checkIndex(fin, points.length, ctx.indexBase, spanAt(ctx, 2), name)
      return points.slice(ini - ctx.indexBase, fin - ctx.indexBase + 1).join('')
    }
    case 'concat':
      return str(args, 0) + str(args, 1)
    case 'toNumber': {
      const text = str(args, 0).trim()
      const value = parseReal(text)
      if (value === undefined) reject(ctx, key, 0, 'number', text)
      return value
    }
    case 'toText': {
      const value = args[0] ?? ''
      const type = typeof value === 'number' ? REAL : typeof value === 'boolean' ? BOOLEAN : STRING
      return renderValue(value, type, ctx.profile)
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/builtins.test.ts`
Expected: PASS, 23 tests.

- [ ] **Step 5: Run lint and typecheck, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
git add packages/language/src/interpreter/builtins.ts packages/language/test/interpreter/builtins.test.ts
git commit -m "feat(language): the 22 builtin bodies"
```

**Parallelism:** parallel with Task 4; needs Task 2's `render.ts` for `toText`.

---

### Task 4: `interpreter/frame.ts` — frames, slots and `inspect()`

**Files:**
- Create: `packages/language/src/interpreter/frame.ts`
- Test: `packages/language/test/interpreter/frame.test.ts`

**Interfaces:**
- Consumes: `MainBlock`, `Stmt`, `SubprogramDecl` from `../ast/index`; `CheckResult` from `../checker/result`; `Scope`, `Symbol`, `SymbolKind` from `../checker/scope`; `Type` from `../types/type`; `RuntimeValue`, `Slot` from `./value`.
- Produces:
  - `interface FrameVariable { readonly name: string; readonly kind: SymbolKind; readonly type: Type; readonly value: RuntimeValue | undefined }`
  - `interface Frame { readonly name: string; readonly line: number; readonly variables: readonly FrameVariable[] }`
  - `interface RuntimeFrame { readonly name: string; readonly scope: Scope; readonly decl: SubprogramDecl | null; readonly body: readonly Stmt[]; readonly slots: Map<Symbol, Slot>; readonly result: Symbol | null; line: number; returnValue: RuntimeValue | undefined }`
  - `function bodyScopeOf(program: CheckResult, owner: MainBlock | SubprogramDecl): Scope` — throws a plain `Error` when the checker built no scope for `owner`.
  - `function createFrame(scope: Scope, line: number): RuntimeFrame` — one unassigned slot per `Scope.order` symbol, constants filled from `constValue`, `result` set to the symbol of kind `result` if any.
  - `function slotOf(frame: RuntimeFrame, symbol: Symbol): Slot` — throws a plain `Error` for a symbol with no slot (an internal invariant).
  - `function bindSlot(frame: RuntimeFrame, symbol: Symbol, slot: Slot): void` — replaces the symbol's slot: by-reference aliasing.
  - `function inspectFrames(frames: readonly RuntimeFrame[]): Frame[]` — innermost first.

- [ ] **Step 1: Write the failing test `packages/language/test/interpreter/frame.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import {
  bindSlot,
  bodyScopeOf,
  createFrame,
  inspectFrames,
  slotOf,
} from '../../src/interpreter/frame'
import { allocateArray, cellSlot, type Slot } from '../../src/interpreter/value'
import { compileEs } from '../helpers'

const source = [
  'Funcion r Como Entero <- suma(a Como Entero, b Por Referencia Como Entero)',
  '  Constante K <- 10;',
  '  r <- a + b + K;',
  '  b <- 0;',
  'FinFuncion',
  'Proceso p',
  '  Definir x, y Como Entero;',
  '  Definir lista Como Entero[3];',
  '  Constante MAX <- 5;',
  '  x <- 1;',
  '  y <- 2;',
  '  lista[1] <- suma(x, y);',
  '  Escribir lista[1], MAX;',
  'FinProceso',
].join('\n')

function program() {
  const compiled = compileEs(source)
  const main = compiled.ast.main
  const decl = compiled.ast.subprograms[0]
  if (main === null || decl === undefined) throw new Error('the fixture lost its blocks')
  return { compiled, main, decl }
}

describe('frames (§4.2)', () => {
  it('finds the body scope the checker built for a block', () => {
    const { compiled, main, decl } = program()
    expect(bodyScopeOf(compiled, main).owner).toBe(main)
    expect(bodyScopeOf(compiled, decl).owner).toBe(decl)
  })

  it('creates one unassigned slot per symbol of Scope.order, constants filled', () => {
    const { compiled, main } = program()
    const scope = bodyScopeOf(compiled, main)
    const frame = createFrame(scope, 6)
    expect(frame.name).toBe('p')
    expect(frame.decl).toBeNull()
    expect(frame.line).toBe(6)
    expect(frame.result).toBeNull()
    expect(scope.order.map((symbol) => symbol.name)).toEqual(['x', 'y', 'lista', 'max'])
    for (const symbol of scope.order) expect(frame.slots.has(symbol)).toBe(true)
    const names = scope.order.map((symbol) => [symbol.name, slotOf(frame, symbol).value])
    expect(names).toEqual([
      ['x', undefined],
      ['y', undefined],
      ['lista', undefined],
      ['max', 5],
    ])
  })

  it('records the result variable of a function and fills its constant', () => {
    const { compiled, decl } = program()
    const scope = bodyScopeOf(compiled, decl)
    const frame = createFrame(scope, 1)
    expect(frame.name).toBe('suma')
    expect(frame.decl).toBe(decl)
    expect(frame.result?.name).toBe('r')
    expect(frame.result?.kind).toBe('result')
    const constant = scope.order.find((symbol) => symbol.kind === 'constant')
    expect(constant).toBeDefined()
    if (constant === undefined) return
    expect(slotOf(frame, constant).value).toBe(10)
  })

  it('slotOf throws for a symbol of another frame', () => {
    const { compiled, main, decl } = program()
    const frame = createFrame(bodyScopeOf(compiled, main), 6)
    const foreign = bodyScopeOf(compiled, decl).order[0]
    if (foreign === undefined) throw new Error('no parameter')
    expect(() => slotOf(frame, foreign)).toThrow(/slot/)
  })

  it('bindSlot aliases a caller slot, so writes through the callee reach the caller', () => {
    const { compiled, main, decl } = program()
    const caller = createFrame(bodyScopeOf(compiled, main), 6)
    const callee = createFrame(bodyScopeOf(compiled, decl), 1)
    const y = bodyScopeOf(compiled, main).symbols.get('y')
    const b = bodyScopeOf(compiled, decl).symbols.get('b')
    if (y === undefined || b === undefined) throw new Error('fixture symbols missing')
    slotOf(caller, y).value = 2
    bindSlot(callee, b, slotOf(caller, y))
    expect(slotOf(callee, b).value).toBe(2)
    slotOf(callee, b).value = 0
    expect(slotOf(caller, y).value).toBe(0)
  })

  it('a cell slot bound by reference writes into the caller array', () => {
    const { compiled, decl } = program()
    const callee = createFrame(bodyScopeOf(compiled, decl), 1)
    const b = bodyScopeOf(compiled, decl).symbols.get('b')
    if (b === undefined) throw new Error('fixture symbol missing')
    const array = allocateArray('integer', [3], { name: 'lista', spans: [] })
    const cell: Slot = cellSlot(array, 2)
    bindSlot(callee, b, cell)
    slotOf(callee, b).value = 9
    expect(array.data).toEqual([undefined, undefined, 9])
  })
})

describe('inspectFrames (§3.7)', () => {
  it('lists frames innermost first with Scope.order variables and current values', () => {
    const { compiled, main, decl } = program()
    const outer = createFrame(bodyScopeOf(compiled, main), 12)
    const inner = createFrame(bodyScopeOf(compiled, decl), 3)
    const x = bodyScopeOf(compiled, main).symbols.get('x')
    const a = bodyScopeOf(compiled, decl).symbols.get('a')
    if (x === undefined || a === undefined) throw new Error('fixture symbols missing')
    slotOf(outer, x).value = 1
    slotOf(inner, a).value = 1
    const frames = inspectFrames([outer, inner])
    expect(frames.map((frame) => frame.name)).toEqual(['suma', 'p'])
    expect(frames.map((frame) => frame.line)).toEqual([3, 12])
    expect(frames[0]?.variables.map((v) => [v.name, v.kind, v.value])).toEqual([
      ['a', 'parameter', 1],
      ['b', 'parameter', undefined],
      ['r', 'result', undefined],
      ['k', 'constant', 10],
    ])
    expect(frames[1]?.variables.map((v) => [v.name, v.kind, v.value])).toEqual([
      ['x', 'variable', 1],
      ['y', 'variable', undefined],
      ['lista', 'variable', undefined],
      ['max', 'constant', 5],
    ])
    expect(frames[1]?.variables[0]?.type).toEqual({ kind: 'scalar', name: 'integer' })
    expect(frames[1]?.variables[2]?.type).toEqual({ kind: 'array', element: 'integer', rank: 1 })
  })

  it('shows an allocated array as its ArrayValue and a by-reference parameter as the aliased value', () => {
    const { compiled, main, decl } = program()
    const outer = createFrame(bodyScopeOf(compiled, main), 12)
    const inner = createFrame(bodyScopeOf(compiled, decl), 3)
    const lista = bodyScopeOf(compiled, main).symbols.get('lista')
    const y = bodyScopeOf(compiled, main).symbols.get('y')
    const b = bodyScopeOf(compiled, decl).symbols.get('b')
    if (lista === undefined || y === undefined || b === undefined) throw new Error('missing')
    const array = allocateArray('integer', [3], { name: 'lista', spans: [] })
    slotOf(outer, lista).value = array
    slotOf(outer, y).value = 2
    bindSlot(inner, b, slotOf(outer, y))
    const frames = inspectFrames([outer, inner])
    expect(frames[1]?.variables[2]?.value).toBe(array)
    expect(frames[0]?.variables[1]?.value).toBe(2)
  })

  it('returns [] for no frames', () => {
    expect(inspectFrames([])).toEqual([])
  })
})
```

If `Scope.order` for `suma` lists the result variable `r` before the parameters (the checker declares parameters first, then the result — see `collectSignatures` in `checker/driver.ts`), the order asserted above is `a`, `b`, `r`, `k`; adjust only if the checker's actual order differs, and keep the assertion equal to `Scope.order`.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/frame.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/frame`.

- [ ] **Step 3: Write `packages/language/src/interpreter/frame.ts`**

```ts
import type { MainBlock, Stmt, SubprogramDecl } from '../ast/index'
import type { CheckResult } from '../checker/result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import type { Scope, Symbol, SymbolKind } from '../checker/scope'
import type { Type } from '../types/type'
import type { RuntimeValue, Slot } from './value'

/** One row of the variables panel (§3.7). */
export interface FrameVariable {
  /** As declared: `Symbol.name`, the canonical form. */
  readonly name: string
  readonly kind: SymbolKind
  readonly type: Type
  readonly value: RuntimeValue | undefined
}

/** What `inspect()` returns, one per active call. */
export interface Frame {
  /** The main block's name, or the subprogram's. */
  readonly name: string
  readonly line: number
  readonly variables: readonly FrameVariable[]
}

/**
 * The controller's frame: slots keyed by the checker's `Symbol` objects, so an identifier
 * reaches its storage through `program.symbols.get(id)` and this map — no name is ever looked
 * up at runtime (§4.2). `line` is the statement about to execute (innermost frame) or the
 * call in progress (outer frames); `returnValue` carries `Retornar v` out of a `f(): T`
 * function, which has no result variable.
 */
export interface RuntimeFrame {
  readonly name: string
  readonly scope: Scope
  readonly decl: SubprogramDecl | null
  readonly body: readonly Stmt[]
  readonly slots: Map<Symbol, Slot>
  readonly result: Symbol | null
  line: number
  returnValue: RuntimeValue | undefined
}

/** The body scope the checker built for a block: `CheckResult.scopes` holds one per body. */
export function bodyScopeOf(program: CheckResult, owner: MainBlock | SubprogramDecl): Scope {
  const scope = program.scopes.find((one) => one.kind === 'body' && one.owner === owner)
  if (scope === undefined) throw new Error(`no body scope for ${owner.name.text}`)
  return scope
}

/**
 * §4.2: one slot per symbol of `Scope.order`, all unassigned, except constants, filled from
 * the folded value the checker stored (E3024 guarantees every constant of a started program
 * has one). Parameters are bound afterwards by the caller (`bindSlot` or a plain write).
 */
export function createFrame(scope: Scope, line: number): RuntimeFrame {
  const owner = scope.owner
  if (owner.kind === 'Program') throw new Error('a frame needs a body scope, not the program scope')
  const slots = new Map<Symbol, Slot>()
  let result: Symbol | null = null
  for (const symbol of scope.order) {
    if (symbol.kind === 'subprogram') continue
    const slot: Slot = { value: undefined }
    if (symbol.kind === 'constant' && symbol.constValue !== undefined) {
      slot.value = symbol.constValue.value
    }
    if (symbol.kind === 'result') result = symbol
    slots.set(symbol, slot)
  }
  return {
    name: owner.name.text,
    scope,
    decl: owner.kind === 'SubprogramDecl' ? owner : null,
    body: owner.body,
    slots,
    result,
    line,
    returnValue: undefined,
  }
}

export function slotOf(frame: RuntimeFrame, symbol: Symbol): Slot {
  const slot = frame.slots.get(symbol)
  if (slot === undefined) throw new Error(`no slot for ${symbol.name} in ${frame.name}`)
  return slot
}

/** By-reference binding: the callee's map entry *is* the caller's slot (§4.2). */
export function bindSlot(frame: RuntimeFrame, symbol: Symbol, slot: Slot): void {
  frame.slots.set(symbol, slot)
}

/** §3.7: innermost first; variables in `Scope.order`; an aliased parameter shows the alias. */
export function inspectFrames(frames: readonly RuntimeFrame[]): Frame[] {
  const out: Frame[] = []
  for (let index = frames.length - 1; index >= 0; index--) {
    const frame = frames[index]
    if (frame === undefined) continue
    const variables: FrameVariable[] = []
    for (const symbol of frame.scope.order) {
      if (symbol.kind === 'subprogram') continue
      variables.push({
        name: symbol.name,
        kind: symbol.kind,
        type: symbol.type,
        value: slotOf(frame, symbol).value,
      })
    }
    out.push({ name: frame.name, line: frame.line, variables })
  }
  return out
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/frame.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Run lint and typecheck, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
git add packages/language/src/interpreter/frame.ts packages/language/test/interpreter/frame.test.ts
git commit -m "feat(language): frames keyed by checker symbols, aliasing slots and inspect"
```

**Parallelism:** parallel with Tasks 2 and 3.

---

### Task 5: `interpreter/evaluate.ts` — expressions, events and the call protocol

**Files:**
- Create: `packages/language/src/interpreter/evaluate.ts`
- Create: `packages/language/test/interpreter/drive.ts` (test-only driver: `drain`, `evalIn`, `runtimeErrorOf`)
- Test: `packages/language/test/interpreter/expressions.test.ts`

**Interfaces:**
- Consumes: `Binary`, `Call`, `Expr`, `Identifier`, `Index`, `Node`, `SubprogramDecl` from `../ast/index`; `nameOf` from `../checker/result`; `Symbol` from `../checker/scope`; `CompileResult` from `../compile`; `LineMap`, `Span` from `../source/index`; `operatorSpelling` from `../types/operators`; `isText`, `Type` from `../types/type`; `BuiltinContext`, `callBuiltin` from `./builtins`; `RuntimeFrame`, `slotOf` from `./frame`; everything from `./value`.
- Produces:
  - `interface Context { readonly program: CompileResult; readonly profile: ResolvedProfile; readonly indexBase: number; readonly io: { write(text: string): void; clear?(): void }; readonly random: () => number; readonly lines: LineMap }`
  - `interface PauseEvent { readonly kind: 'pause'; readonly line: number }`
  - `interface InputTarget { readonly name: string; readonly type: Type; readonly slot: Slot; readonly span: Span }`
  - `interface InputEvent { readonly kind: 'input'; readonly target: InputTarget | null }`
  - `interface WaitEvent { readonly kind: 'wait'; readonly millis: number }`
  - `type Argument = { readonly kind: 'value'; readonly value: RuntimeValue } | { readonly kind: 'slot'; readonly slot: Slot }`
  - `interface CallEvent { readonly kind: 'call'; readonly node: Call; readonly decl: SubprogramDecl; readonly args: readonly Argument[] }`
  - `type Event = PauseEvent | InputEvent | WaitEvent | CallEvent`
  - `type Gen<T> = Generator<Event, T, unknown>`
  - `function lineOf(ctx: Context, node: Node): number`
  - `function symbolOf(ctx: Context, id: Identifier): Symbol` — throws a plain `Error` when the checker left the identifier unresolved.
  - `function typeOfNode(ctx: Context, expr: Expr): Type` — throws a plain `Error` when untyped.
  - `function* evaluate(ctx: Context, frame: RuntimeFrame, expr: Expr): Gen<RuntimeValue>` — a read: E4003 for an unassigned identifier or cell.
  - `function* evaluateRef(ctx: Context, frame: RuntimeFrame, target: Identifier | Index): Gen<Slot>` — a variable's slot or a bounds-checked cell slot; never reads the target scalar.
  - `function* evaluateCall(ctx: Context, frame: RuntimeFrame, node: Call): Gen<RuntimeValue | undefined>` — evaluates the arguments per §5.5 step 1, yields one `CallEvent`, returns what the controller sends back.
  - Test driver: `drain<T>(gen: Gen<T>, onCall?: (event: CallEvent) => RuntimeValue | undefined): { value: T; events: Event[] }`; `evalIn(source: string, snippet: string, options?: { values?: Record<string, RuntimeValue>; onCall?: …; profileName?: ProfileName; random?: () => number }): { value: RuntimeValue; events: Event[]; output: string[] }`; `runtimeErrorOf(fn: () => unknown): Diagnostic`.

- [ ] **Step 1: Write the test driver `packages/language/test/interpreter/drive.ts`**

```ts
import type { Expr } from '../../src/ast/index'
import { walk } from '../../src/ast/index'
import type { Diagnostic } from '../../src/diagnostics/index'
import {
  type CallEvent,
  type Context,
  type Event,
  evaluate,
  type Gen,
} from '../../src/interpreter/evaluate'
import { bodyScopeOf, createFrame, type RuntimeFrame, slotOf } from '../../src/interpreter/frame'
import { RuntimeError, type RuntimeValue } from '../../src/interpreter/value'
import { LineMap } from '../../src/source/index'
import { compileEs, type ProfileName, profileNamed } from '../helpers'

type OnCall = (event: CallEvent) => RuntimeValue | undefined

const noCalls: OnCall = (event) => {
  throw new Error(`unexpected call of ${event.decl.name.text}`)
}

/**
 * Runs one generator to completion on the current JS stack. A `call` event is answered by
 * `onCall`; every other event is recorded and resumed with `undefined`. This is the driver the
 * expression and statement tests use before the controller exists (Task 7).
 */
export function drain<T>(gen: Gen<T>, onCall: OnCall = noCalls): { value: T; events: Event[] } {
  const events: Event[] = []
  let sent: unknown
  for (;;) {
    const result = gen.next(sent)
    if (result.done) return { value: result.value, events }
    const event = result.value
    events.push(event)
    sent = event.kind === 'call' ? onCall(event) : undefined
  }
}

export interface EvalOptions {
  /** Slot values to set on the main frame before evaluating, by variable name. */
  readonly values?: Readonly<Record<string, RuntimeValue>>
  readonly onCall?: OnCall
  readonly profileName?: ProfileName
  readonly random?: () => number
}

export interface EvalReport {
  readonly value: RuntimeValue
  readonly events: Event[]
  readonly output: string[]
  readonly frame: RuntimeFrame
}

/**
 * Compiles `source`, finds the one typed expression whose text is exactly `snippet`, and
 * evaluates it in a fresh main frame. The program supplies declarations and types; the test
 * supplies values through `options.values`.
 */
export function evalIn(source: string, snippet: string, options: EvalOptions = {}): EvalReport {
  const program = compileEs(source, options.profileName ?? 'es')
  const profile = profileNamed(options.profileName ?? 'es')
  const main = program.ast.main
  if (main === null) throw new Error('the program has no main block')
  const found: Expr[] = []
  walk(program.ast, {
    enter: (node) => {
      if (
        program.types.has(node as Expr) &&
        source.slice(node.span.start, node.span.end) === snippet
      ) {
        found.push(node as Expr)
      }
      return true
    },
  })
  const expr = found[0]
  if (found.length !== 1 || expr === undefined) {
    throw new Error(`"${snippet}" matches ${found.length} typed expressions, expected exactly 1`)
  }
  const output: string[] = []
  const ctx: Context = {
    program,
    profile,
    indexBase: profile.options.indexBase,
    io: { write: (text) => void output.push(text) },
    random: options.random ?? (() => 0.5),
    lines: new LineMap(source),
  }
  const frame = createFrame(bodyScopeOf(program, main), 1)
  for (const [name, value] of Object.entries(options.values ?? {})) {
    const symbol = frame.scope.symbols.get(profile.options.caseSensitive ? name : name.toLowerCase())
    if (symbol === undefined) throw new Error(`"${name}" is not declared in the fixture`)
    slotOf(frame, symbol).value = value
  }
  const { value, events } = drain(evaluate(ctx, frame, expr), options.onCall)
  return { value, events, output, frame }
}

/** The diagnostic a thunk fails with; a thunk that does not throw a `RuntimeError` is a test failure. */
export function runtimeErrorOf(fn: () => unknown): Diagnostic {
  try {
    fn()
  } catch (error) {
    if (error instanceof RuntimeError) return error.diagnostic
    throw error
  }
  throw new Error('expected a RuntimeError')
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/interpreter/expressions.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { allocateArray } from '../../src/interpreter/value'
import { evalIn, runtimeErrorOf } from './drive'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

/** A program declaring the usual fixture variables, ending in `Escribir <expr>;`. */
const withVars = (expr: string, ...extra: string[]): string =>
  main(
    'Definir n, m Como Entero;',
    'Definir x, y Como Real;',
    'Definir s, t Como Cadena;',
    'Definir c Como Caracter;',
    'Definir b, d Como Logico;',
    'Definir a Como Entero[3];',
    'Definir g Como Real[2,3];',
    ...extra,
    `Escribir ${expr};`,
  )

const numbers = { n: 7, m: 2, x: 7.5, y: 2 }

describe('literals and identifiers', () => {
  it('evaluates every literal kind', () => {
    expect(evalIn(main('Escribir 42;'), '42').value).toBe(42)
    expect(evalIn(main('Escribir 2.5;'), '2.5').value).toBe(2.5)
    expect(evalIn(main('Escribir "hola";'), '"hola"').value).toBe('hola')
    expect(evalIn(main('Escribir Verdadero;'), 'Verdadero').value).toBe(true)
    expect(evalIn(main('Escribir Falso;'), 'Falso').value).toBe(false)
  })

  it('reads a slot value', () => {
    expect(evalIn(withVars('n'), 'n', { values: { n: 3 } }).value).toBe(3)
    expect(evalIn(withVars('s'), 's', { values: { s: 'ab' } }).value).toBe('ab')
  })

  it('reads a constant filled at frame entry', () => {
    const source = main('Constante K <- 10;', 'Escribir K;')
    expect(evalIn(source, 'K').value).toBe(10)
  })

  it('reports E4003 at the identifier for an unassigned scalar', () => {
    const source = withVars('n + 1')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'n + 1'))
    expect(diagnostic.code).toBe('E4003')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('n')
    expect(diagnostic.data).toEqual({ name: 'n' })
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toBe(
      '«n» todavía no tiene valor: asígnale uno antes de usarla.',
    )
  })
})

describe('arithmetic (§5.3)', () => {
  it('+ - * over Entero stay integral, over Real give Real', () => {
    expect(evalIn(withVars('n + m'), 'n + m', { values: numbers }).value).toBe(9)
    expect(evalIn(withVars('n - m'), 'n - m', { values: numbers }).value).toBe(5)
    expect(evalIn(withVars('n * m'), 'n * m', { values: numbers }).value).toBe(14)
    expect(evalIn(withVars('x + y'), 'x + y', { values: numbers }).value).toBe(9.5)
    expect(evalIn(withVars('n * x'), 'n * x', { values: numbers }).value).toBe(52.5)
  })

  it('+ over text concatenates, Caracter + Caracter included', () => {
    expect(evalIn(withVars('s + t'), 's + t', { values: { s: 'ho', t: 'la' } }).value).toBe('hola')
    expect(evalIn(withVars('c + c'), 'c + c', { values: { c: 'a' } }).value).toBe('aa')
    expect(evalIn(withVars('s + c'), 's + c', { values: { s: 'x', c: 'y' } }).value).toBe('xy')
  })

  it('/ is JS division, always Real: 7 / 2 is 3.5 and 4 / 2 is 2', () => {
    expect(evalIn(withVars('n / m'), 'n / m', { values: numbers }).value).toBe(3.5)
    expect(evalIn(main('Escribir 4 / 2;'), '4 / 2').value).toBe(2)
  })

  it('/ by a computed zero is E4002 at the divisor', () => {
    const source = withVars('n / m')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'n / m', { values: { n: 1, m: 0 } }))
    expect(diagnostic.code).toBe('E4002')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('m')
    expect(diagnostic.data).toEqual({ op: '/' })
    expect(formatDiagnostic(diagnostic, 'en', profiles.en)).toBe(
      'This divides by zero: "/" received a divisor equal to 0.',
    )
  })

  it('^ is JS **, always Real', () => {
    expect(evalIn(withVars('n ^ m'), 'n ^ m', { values: numbers }).value).toBe(49)
    expect(evalIn(withVars('x ^ y'), 'x ^ y', { values: { x: 2, y: 0.5 } }).value).toBeCloseTo(
      Math.SQRT2,
    )
  })

  it('DIV truncates toward zero and MOD keeps the sign of the dividend', () => {
    expect(evalIn(withVars('n DIV m'), 'n DIV m', { values: { n: 7, m: 2 } }).value).toBe(3)
    expect(evalIn(withVars('n DIV m'), 'n DIV m', { values: { n: -7, m: 2 } }).value).toBe(-3)
    expect(evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: 7, m: 3 } }).value).toBe(1)
    expect(evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: -7, m: 3 } }).value).toBe(-1)
    expect(evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: 7, m: -3 } }).value).toBe(1)
  })

  it('DIV and MOD by a computed zero are E4002 with the keyword spelling', () => {
    const div = runtimeErrorOf(() => evalIn(withVars('n DIV m'), 'n DIV m', { values: { n: 1, m: 0 } }))
    expect(div.code).toBe('E4002')
    expect(div.data).toEqual({ op: 'DIV' })
    const mod = runtimeErrorOf(() => evalIn(withVars('n MOD m'), 'n MOD m', { values: { n: 1, m: 0 } }))
    expect(mod.data).toEqual({ op: 'MOD' })
  })

  it('unary minus negates and unary plus is the identity', () => {
    expect(evalIn(withVars('-n'), '-n', { values: numbers }).value).toBe(-7)
    expect(evalIn(withVars('+x'), '+x', { values: numbers }).value).toBe(7.5)
  })
})

describe('logic and comparison (§5.3)', () => {
  it('Y and O short-circuit: the right operand is not evaluated when the left decides', () => {
    // `m` is unassigned: evaluating it would be E4003, so a result proves it was skipped.
    expect(evalIn(withVars('b Y m > 0'), 'b Y m > 0', { values: { b: false } }).value).toBe(false)
    expect(evalIn(withVars('b O m > 0'), 'b O m > 0', { values: { b: true } }).value).toBe(true)
    expect(evalIn(withVars('b Y d'), 'b Y d', { values: { b: true, d: true } }).value).toBe(true)
    expect(evalIn(withVars('b O d'), 'b O d', { values: { b: false, d: false } }).value).toBe(false)
    expect(runtimeErrorOf(() => evalIn(withVars('b Y m > 0'), 'b Y m > 0', { values: { b: true } })).code).toBe('E4003')
  })

  it('NO negates', () => {
    expect(evalIn(withVars('NO b'), 'NO b', { values: { b: true } }).value).toBe(false)
  })

  it('= and <> compare numbers numerically, text as text, booleans by value', () => {
    expect(evalIn(withVars('n = x'), 'n = x', { values: { n: 1, x: 1.0 } }).value).toBe(true)
    expect(evalIn(withVars('n <> x'), 'n <> x', { values: { n: 1, x: 1.5 } }).value).toBe(true)
    expect(evalIn(withVars('s = c'), 's = c', { values: { s: 'a', c: 'a' } }).value).toBe(true)
    expect(evalIn(withVars('s <> c'), 's <> c', { values: { s: 'ab', c: 'a' } }).value).toBe(true)
    expect(evalIn(withVars('b = d'), 'b = d', { values: { b: true, d: false } }).value).toBe(false)
  })

  it('< <= > >= compare numbers numerically and text by UTF-16 code unit order', () => {
    expect(evalIn(withVars('n < x'), 'n < x', { values: { n: 2, x: 2.5 } }).value).toBe(true)
    expect(evalIn(withVars('n <= m'), 'n <= m', { values: { n: 2, m: 2 } }).value).toBe(true)
    expect(evalIn(withVars('n > m'), 'n > m', { values: { n: 2, m: 3 } }).value).toBe(false)
    expect(evalIn(withVars('n >= m'), 'n >= m', { values: { n: 3, m: 3 } }).value).toBe(true)
    expect(evalIn(withVars('s < t'), 's < t', { values: { s: 'abc', t: 'abd' } }).value).toBe(true)
    expect(evalIn(withVars('s > t'), 's > t', { values: { s: 'b', t: 'abc' } }).value).toBe(true)
    expect(evalIn(withVars('c <= s'), 'c <= s', { values: { c: 'a', s: 'a' } }).value).toBe(true)
    expect(evalIn(withVars('s >= t'), 's >= t', { values: { s: 'Z', t: 'a' } }).value).toBe(false)
  })
})

describe('indexing (§5.4)', () => {
  const filled = () => {
    const array = allocateArray('integer', [3], { name: 'a', spans: [] })
    array.data[0] = 10
    array.data[2] = 30
    return array
  }

  it('reads an array cell under indexBase 1', () => {
    expect(evalIn(withVars('a[1]'), 'a[1]', { values: { a: filled() } }).value).toBe(10)
    expect(evalIn(withVars('a[n]'), 'a[n]', { values: { a: filled(), n: 3 } }).value).toBe(30)
  })

  it('reads a matrix cell row-major', () => {
    const g = allocateArray('real', [2, 3], { name: 'g', spans: [] })
    g.data[5] = 2.5
    expect(evalIn(withVars('g[2,3]'), 'g[2,3]', { values: { g } }).value).toBe(2.5)
    expect(evalIn(withVars('g[2][3]'), 'g[2][3]', { values: { g } }).value).toBe(2.5)
  })

  it('reads under indexBase 0 with the es0 profile', () => {
    expect(
      evalIn(withVars('a[0]'), 'a[0]', { values: { a: filled() }, profileName: 'es0' }).value,
    ).toBe(10)
    expect(runtimeErrorOf(() => evalIn(withVars('a[3]'), 'a[3]', { values: { a: filled() }, profileName: 'es0' })).data).toEqual({ name: 'a', index: 3, low: 0, high: 2 })
  })

  it('indexes a text: one-character string at that position, code points counted', () => {
    expect(evalIn(withVars('s[2]'), 's[2]', { values: { s: 'hola' } }).value).toBe('o')
    expect(evalIn(withVars('s[2]'), 's[2]', { values: { s: 'a😀b' } }).value).toBe('😀')
  })

  it('reports E4001 at the index expression with name, index, low and high', () => {
    const source = withVars('a[n]')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'a[n]', { values: { a: filled(), n: 4 } }))
    expect(diagnostic.code).toBe('E4001')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('n')
    expect(diagnostic.data).toEqual({ name: 'a', index: 4, low: 1, high: 3 })
    const negative = runtimeErrorOf(() => evalIn(withVars('s[-1]'), 's[-1]', { values: { s: 'ab' } }))
    expect(negative.data).toEqual({ name: 's', index: -1, low: 1, high: 2 })
  })

  it('checks every index left to right and stops at the first bad one', () => {
    const g = allocateArray('real', [2, 3], { name: 'g', spans: [] })
    const source = withVars('g[n, m]')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'g[n, m]', { values: { g, n: 3, m: 9 } }))
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('n')
    expect(diagnostic.data).toEqual({ name: 'g', index: 3, low: 1, high: 2 })
  })

  it('reports E4003.cell at the Index node for an unassigned cell', () => {
    const source = withVars('a[2]')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'a[2]', { values: { a: filled() } }))
    expect(diagnostic.code).toBe('E4003')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('a[2]')
    expect(diagnostic.data).toEqual({ name: 'a', index: '2', hint: 'cell' })
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).toBe(
      '«a[2]» todavía no tiene valor: asígnale uno antes de usarlo.',
    )
    const g = allocateArray('real', [2, 3], { name: 'g', spans: [] })
    const matrix = runtimeErrorOf(() => evalIn(withVars('g[2, 3]'), 'g[2, 3]', { values: { g } }))
    expect(matrix.data).toEqual({ name: 'g', index: '2, 3', hint: 'cell' })
  })

  it('reports E4003 at the identifier for an array never dimensioned', () => {
    const source = main('Definir v Como Entero;', 'Definir i Como Entero;', 'i <- 1;', 'Dimension v[3];', 'Escribir v[i];')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'v[i]', { values: { i: 1 } }))
    expect(diagnostic.code).toBe('E4003')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('v')
    expect(diagnostic.data).toEqual({ name: 'v' })
  })
})

describe('builtin calls (§5.8)', () => {
  it('dispatches to callBuiltin with the evaluated arguments', () => {
    expect(evalIn(withVars('Abs(n)'), 'Abs(n)', { values: { n: -3 } }).value).toBe(3)
    expect(evalIn(withVars('Longitud(s)'), 'Longitud(s)', { values: { s: 'hola' } }).value).toBe(4)
    expect(evalIn(withVars('Subcadena(s, 2, 3)'), 'Subcadena(s, 2, 3)', { values: { s: 'hola' } }).value).toBe('ol')
    expect(evalIn(withVars('ConvertirATexto(b)'), 'ConvertirATexto(b)', { values: { b: true } }).value).toBe('Verdadero')
  })

  it('reports E4007 at the argument and E4001 named after the text argument', () => {
    const source = withVars('RC(x)')
    const diagnostic = runtimeErrorOf(() => evalIn(source, 'RC(x)', { values: { x: -4 } }))
    expect(diagnostic.code).toBe('E4007')
    expect(source.slice(diagnostic.span.start, diagnostic.span.end)).toBe('x')
    expect(diagnostic.data).toEqual({ builtin: 'sqrt', hint: 'negative' })
    const sub = withVars('Subcadena(s, 1, n)')
    const range = runtimeErrorOf(() => evalIn(sub, 'Subcadena(s, 1, n)', { values: { s: 'abc', n: 4 } }))
    expect(range.code).toBe('E4001')
    expect(sub.slice(range.span.start, range.span.end)).toBe('n')
    expect(range.data).toEqual({ name: 's', index: 4, low: 1, high: 3 })
  })

  it('consumes one random value per call, in evaluation order', () => {
    const values = [0.1, 0.9]
    let index = 0
    const report = evalIn(withVars('Aleatorio(1, 10) + Aleatorio(1, 10)'), 'Aleatorio(1, 10) + Aleatorio(1, 10)', {
      random: () => values[index++] ?? 0,
    })
    expect(report.value).toBe(2 + 10)
    expect(index).toBe(2)
  })
})

describe('user calls (§5.5)', () => {
  const program = [
    'Funcion r Como Entero <- f(a Como Entero, b Por Referencia Como Entero, v Como Entero[])',
    '  r <- a;',
    'FinFuncion',
    'Proceso p',
    '  Definir n, m Como Entero;',
    '  Definir lista Como Entero[3];',
    '  n <- 1;',
    '  m <- 2;',
    '  lista[1] <- 5;',
    '  Escribir f(n + 1, m, lista);',
    '  Escribir f(n, lista[1], lista);',
    'FinProceso',
  ].join('\n')

  it('yields one call event with by-value copies, by-reference slots and array references', () => {
    const lista = allocateArray('integer', [3], { name: 'lista', spans: [] })
    lista.data[0] = 5
    const report = evalIn(program, 'f(n + 1, m, lista)', {
      values: { n: 1, m: 2, lista },
      onCall: (event) => {
        expect(event.decl.name.text).toBe('f')
        expect(event.args).toHaveLength(3)
        expect(event.args[0]).toEqual({ kind: 'value', value: 2 })
        expect(event.args[1]?.kind).toBe('slot')
        if (event.args[1]?.kind === 'slot') {
          event.args[1].slot.value = 99
        }
        expect(event.args[2]).toEqual({ kind: 'value', value: lista })
        return 42
      },
    })
    expect(report.value).toBe(42)
    expect(report.events.filter((event) => event.kind === 'call')).toHaveLength(1)
    const m = report.frame.scope.symbols.get('m')
    expect(m && report.frame.slots.get(m)?.value).toBe(99)
  })

  it('binds a by-reference cell without reading it, and names its array', () => {
    const lista = allocateArray('integer', [3], { name: 'lista', spans: [] })
    const report = evalIn(program, 'f(n, lista[1], lista)', {
      values: { n: 1, lista },
      onCall: (event) => {
        const cell = event.args[1]
        if (cell?.kind !== 'slot') throw new Error('expected a cell slot')
        expect(cell.slot.value).toBeUndefined()
        cell.slot.value = 7
        return 0
      },
    })
    expect(report.value).toBe(0)
    expect(lista.data).toEqual([7, undefined, undefined])
  })

  it('reads a by-value argument, so an unassigned one is E4003 before the call', () => {
    const diagnostic = runtimeErrorOf(() =>
      evalIn(program, 'f(n + 1, m, lista)', { values: { m: 2 }, onCall: () => 0 }),
    )
    expect(diagnostic.code).toBe('E4003')
    expect(diagnostic.data).toEqual({ name: 'n' })
  })

  it('reports an unallocated array argument as E4003 at the identifier', () => {
    const diagnostic = runtimeErrorOf(() =>
      evalIn(program, 'f(n + 1, m, lista)', { values: { n: 1, m: 2 }, onCall: () => 0 }),
    )
    expect(diagnostic.code).toBe('E4003')
    expect(diagnostic.data).toEqual({ name: 'lista' })
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/expressions.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/evaluate`.

- [ ] **Step 4: Write `packages/language/src/interpreter/evaluate.ts` (expressions)**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { Binary, Call, Expr, Identifier, Index, Node, SubprogramDecl } from '../ast/index'
import { nameOf } from '../checker/result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import type { Symbol } from '../checker/scope'
import type { CompileResult } from '../compile'
import type { LineMap, Span } from '../source/index'
import { operatorSpelling } from '../types/operators'
import { isText, type Type } from '../types/type'
import { type BuiltinContext, callBuiltin } from './builtins'
import { type RuntimeFrame, slotOf } from './frame'
import {
  type ArrayValue,
  cellOffset,
  cellSlot,
  checkIndex,
  fail,
  isArrayValue,
  type RuntimeValue,
  type Scalar,
  type Slot,
} from './value'

/** What every generator reads: the compiled program, the profile, the host `io`, the PRNG. */
export interface Context {
  readonly program: CompileResult
  readonly profile: ResolvedProfile
  readonly indexBase: number
  readonly io: { write(text: string): void; clear?(): void }
  readonly random: () => number
  readonly lines: LineMap
}

/** Yielded once before each statement executes, and by loops before every test (§3.4). */
export interface PauseEvent {
  readonly kind: 'pause'
  readonly line: number
}

export interface InputTarget {
  readonly name: string
  readonly type: Type
  /** Where the accepted value goes: the variable's slot or a bounds-checked cell slot. */
  readonly slot: Slot
  readonly span: Span
}

/** `target: null` is `Esperar Tecla` (§5.7). */
export interface InputEvent {
  readonly kind: 'input'
  readonly target: InputTarget | null
}

export interface WaitEvent {
  readonly kind: 'wait'
  readonly millis: number
}

/** §5.5 step 1: a copied scalar or an array reference, or the slot a by-reference parameter aliases. */
export type Argument =
  | { readonly kind: 'value'; readonly value: RuntimeValue }
  | { readonly kind: 'slot'; readonly slot: Slot }

/** A user call: the controller opens the frame, so user calls never nest on the JS stack (§5.1). */
export interface CallEvent {
  readonly kind: 'call'
  readonly node: Call
  readonly decl: SubprogramDecl
  readonly args: readonly Argument[]
}

export type Event = PauseEvent | InputEvent | WaitEvent | CallEvent

export type Gen<T> = Generator<Event, T, unknown>

export function lineOf(ctx: Context, node: Node): number {
  return ctx.lines.positionAt(node.span.start).line
}

export function symbolOf(ctx: Context, id: Identifier): Symbol {
  const symbol = ctx.program.symbols.get(id)
  if (symbol === undefined) throw new Error(`the checker left "${id.text}" unresolved`)
  return symbol
}

export function typeOfNode(ctx: Context, expr: Expr): Type {
  const type = ctx.program.types.get(expr)
  if (type === undefined) throw new Error(`the checker left a ${expr.kind} untyped`)
  return type
}

/** A read of a scalar or array variable: E4003 when the slot is still unassigned (§5.4). */
function readSlot(ctx: Context, frame: RuntimeFrame, id: Identifier): RuntimeValue {
  const value = slotOf(frame, symbolOf(ctx, id)).value
  if (value === undefined) fail('E4003', id.span, { name: id.text })
  return value
}

/**
 * Every index of an `Index` node, evaluated left to right and bounds-checked against the
 * container — an array's dim for that position, or the text's length in code points (§5.4).
 */
function* evaluateIndices(
  ctx: Context,
  frame: RuntimeFrame,
  node: Index,
  container: string | ArrayValue,
  name: string,
): Gen<number[]> {
  const indices: number[] = []
  for (let position = 0; position < node.indices.length; position++) {
    const expr = node.indices[position]
    if (expr === undefined) continue
    const index = Number(yield* evaluate(ctx, frame, expr))
    const size =
      typeof container === 'string' ? [...container].length : (container.dims[position] ?? 0)
    checkIndex(index, size, ctx.indexBase, expr.span, name)
    indices.push(index)
  }
  return indices
}

function less(left: Scalar, right: Scalar): boolean {
  return typeof left === 'number' && typeof right === 'number'
    ? left < right
    : String(left) < String(right)
}

function divisor(ctx: Context, node: Binary, right: number): void {
  if (right === 0) fail('E4002', node.right.span, { op: operatorSpelling(node.op, ctx.profile) })
}

/**
 * §5.3, both operands already evaluated. The choice between text concatenation and numeric
 * addition is made on the static type of the left operand, as the spec asks — never on the
 * runtime value.
 */
function applyBinary(ctx: Context, node: Binary, left: RuntimeValue, right: RuntimeValue): Scalar {
  if (isArrayValue(left) || isArrayValue(right)) throw new Error('an operator never sees an array')
  switch (node.op) {
    case 'plus':
      return isText(typeOfNode(ctx, node.left))
        ? String(left) + String(right)
        : Number(left) + Number(right)
    case 'minus':
      return Number(left) - Number(right)
    case 'times':
      return Number(left) * Number(right)
    case 'divide':
      divisor(ctx, node, Number(right))
      return Number(left) / Number(right)
    case 'power':
      return Number(left) ** Number(right)
    case 'div':
      divisor(ctx, node, Number(right))
      return Math.trunc(Number(left) / Number(right))
    case 'mod': {
      divisor(ctx, node, Number(right))
      const a = Number(left)
      const b = Number(right)
      return a - b * Math.trunc(a / b)
    }
    case 'equal':
      return left === right
    case 'notEqual':
      return left !== right
    case 'lt':
      return less(left, right)
    case 'le':
      return less(left, right) || left === right
    case 'gt':
      return less(right, left)
    case 'ge':
      return less(right, left) || left === right
    case 'and':
      return left === true && right === true
    case 'or':
      return left === true || right === true
  }
}

/** A value read: the expression's result, with every E4001/E4002/E4003/E4007 it can raise. */
export function* evaluate(ctx: Context, frame: RuntimeFrame, expr: Expr): Gen<RuntimeValue> {
  switch (expr.kind) {
    case 'Literal':
      return expr.value
    case 'Identifier':
      return readSlot(ctx, frame, expr)
    case 'Index': {
      const container = yield* evaluate(ctx, frame, expr.target)
      const name = nameOf(expr.target, ctx.profile)
      if (typeof container !== 'string' && !isArrayValue(container)) {
        throw new Error('indexing a scalar that is not text (E3009)')
      }
      const indices = yield* evaluateIndices(ctx, frame, expr, container, name)
      if (typeof container === 'string') {
        return [...container][(indices[0] ?? ctx.indexBase) - ctx.indexBase] ?? ''
      }
      const value = container.data[cellOffset(container.dims, indices, ctx.indexBase)]
      if (value === undefined) {
        fail('E4003', expr.span, { name, index: indices.join(', '), hint: 'cell' })
      }
      return value
    }
    case 'Call': {
      const value = yield* evaluateCall(ctx, frame, expr)
      if (value === undefined) throw new Error(`"${expr.callee.text}" returned nothing (E3020)`)
      return value
    }
    case 'BuiltinCall': {
      const args: Scalar[] = []
      for (const arg of expr.args) {
        const value = yield* evaluate(ctx, frame, arg)
        if (isArrayValue(value)) throw new Error('a builtin never takes an array (E3037)')
        args.push(value)
      }
      const builtinContext: BuiltinContext = {
        profile: ctx.profile,
        random: ctx.random,
        indexBase: ctx.indexBase,
        spans: expr.args.map((arg) => arg.span),
        names: expr.args.map((arg) => nameOf(arg, ctx.profile)),
      }
      return callBuiltin(expr.key, args, builtinContext)
    }
    case 'Unary': {
      const operand = yield* evaluate(ctx, frame, expr.operand)
      if (expr.op === 'not') return operand !== true
      if (expr.op === 'minus') return -Number(operand)
      return Number(operand)
    }
    case 'Binary': {
      if (expr.op === 'and' || expr.op === 'or') {
        const left = yield* evaluate(ctx, frame, expr.left)
        if (expr.op === 'and' && left !== true) return false
        if (expr.op === 'or' && left === true) return true
        return (yield* evaluate(ctx, frame, expr.right)) === true
      }
      const left = yield* evaluate(ctx, frame, expr.left)
      const right = yield* evaluate(ctx, frame, expr.right)
      return applyBinary(ctx, expr, left, right)
    }
    case 'ErrorExpr':
      throw new Error('an ErrorExpr never reaches a started program (§3.1)')
  }
}

/**
 * The slot a write or a by-reference binding needs: a variable's own slot, or a cell slot
 * built from the array and its bounds-checked indices. Binding never reads the scalar (§5.4),
 * but the array itself is read, so an unallocated one is E4003 at its identifier.
 */
export function* evaluateRef(
  ctx: Context,
  frame: RuntimeFrame,
  target: Identifier | Index,
): Gen<Slot> {
  if (target.kind === 'Identifier') return slotOf(frame, symbolOf(ctx, target))
  const container = yield* evaluate(ctx, frame, target.target)
  if (!isArrayValue(container)) throw new Error('assigning into a text by index (E3013)')
  const name = nameOf(target.target, ctx.profile)
  const indices = yield* evaluateIndices(ctx, frame, target, container, name)
  return cellSlot(container, cellOffset(container.dims, indices, ctx.indexBase))
}

/**
 * §5.5 step 1, then one `call` event. A by-value scalar is read and copied; a by-reference
 * parameter gets the argument's slot; an array parameter gets the `ArrayValue` reference
 * whatever the modifier. The controller answers the event with the call's value.
 */
export function* evaluateCall(
  ctx: Context,
  frame: RuntimeFrame,
  node: Call,
): Gen<RuntimeValue | undefined> {
  const decl = ctx.program.calls.get(node)
  if (decl === undefined) throw new Error(`the checker left the call to "${node.callee.text}" unresolved`)
  const args: Argument[] = []
  for (let position = 0; position < node.args.length; position++) {
    const arg = node.args[position]
    const param = decl.params[position]
    if (arg === undefined || param === undefined) throw new Error('an arity mismatch the checker missed')
    const symbol = symbolOf(ctx, param.name)
    if (symbol.type.kind === 'array' || !param.byRef) {
      args.push({ kind: 'value', value: yield* evaluate(ctx, frame, arg) })
    } else if (arg.kind === 'Identifier' || arg.kind === 'Index') {
      args.push({ kind: 'slot', slot: yield* evaluateRef(ctx, frame, arg) })
    } else {
      throw new Error('a by-reference argument is always a variable or a cell (E3032)')
    }
  }
  const event: CallEvent = { kind: 'call', node, decl, args }
  const returned = yield event
  return returned as RuntimeValue | undefined
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/expressions.test.ts`
Expected: PASS, 27 tests.

- [ ] **Step 6: Run lint and typecheck, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
git add packages/language/src/interpreter/evaluate.ts packages/language/test/interpreter/drive.ts packages/language/test/interpreter/expressions.test.ts
git commit -m "feat(language): expression evaluator with call, input and wait events"
```

**Parallelism:** none — needs Tasks 1–4; Task 6 continues in the same file.

---

### Task 6: `interpreter/evaluate.ts` — statements, completions, `runFrame` and `frameForCall`

**Files:**
- Modify: `packages/language/src/interpreter/evaluate.ts` (append after `evaluateCall`; extend the import block)
- Modify: `packages/language/test/interpreter/drive.ts` (append `runMain`)
- Test: `packages/language/test/interpreter/statements.test.ts`

**Interfaces:**
- Consumes: Task 5's exports; `Stmt` from `../ast/index`; `bindSlot`, `bodyScopeOf`, `createFrame` from `./frame`; `renderValue` from `./render`; `allocateArray` from `./value`.
- Produces (all in `evaluate.ts`):
  - `type Completion = 'normal' | 'break' | 'continue' | 'return'`
  - `function* execute(ctx: Context, frame: RuntimeFrame, stmt: Stmt): Gen<Completion>` — yields the statement's pause event first, then executes (§5.1, §5.2).
  - `function* runBody(ctx: Context, frame: RuntimeFrame, stmts: readonly Stmt[]): Gen<Completion>` — stops at the first non-normal completion.
  - `function* runFrame(ctx: Context, frame: RuntimeFrame): Gen<RuntimeValue | undefined>` — runs the body, consumes `return`, produces the function's value or E4006 (§5.5 step 4).
  - `function frameForCall(ctx: Context, event: CallEvent): RuntimeFrame` — the callee frame with its parameters bound (§4.2, §5.5 step 3).
  - Test driver: `runMain(source: string, options?: { inputs?: readonly string[]; profileName?: ProfileName; random?: () => number }): { output: string; error: Diagnostic | undefined; main: RuntimeFrame; pauses: number[]; waits: number[]; cleared: number }`.

- [ ] **Step 1: Append `runMain` to `packages/language/test/interpreter/drive.ts`**

Merge these imports into the file's import block: `frameForCall`, `runFrame`, `type InputEvent` from `'../../src/interpreter/evaluate'`; `parseInput` from `'../../src/interpreter/input'`. Then append:

```ts
export interface RunMainOptions {
  readonly inputs?: readonly string[]
  readonly profileName?: ProfileName
  readonly random?: () => number
}

export interface RunMainReport {
  readonly output: string
  readonly error: Diagnostic | undefined
  readonly main: RuntimeFrame
  /** The line of every pause event, in order. */
  readonly pauses: number[]
  /** The millis of every wait event, in order. */
  readonly waits: number[]
  readonly cleared: number
}

/**
 * A miniature controller for the statement tests: runs main to the end, opening a frame per
 * call event and answering input events from `inputs`. A rejected or missing input throws a
 * plain `Error`, since these tests never exercise the rejection loop (that is Task 7's).
 */
export function runMain(source: string, options: RunMainOptions = {}): RunMainReport {
  const program = compileEs(source, options.profileName ?? 'es')
  const profile = profileNamed(options.profileName ?? 'es')
  const mainBlock = program.ast.main
  if (mainBlock === null) throw new Error('the program has no main block')
  let output = ''
  let cleared = 0
  const ctx: Context = {
    program,
    profile,
    indexBase: profile.options.indexBase,
    io: {
      write: (text) => {
        output += text
      },
      clear: () => {
        cleared++
      },
    },
    random: options.random ?? (() => 0.5),
    lines: new LineMap(source),
  }
  const main = createFrame(bodyScopeOf(program, mainBlock), 1)
  const frames: RuntimeFrame[] = [main]
  const stack: Gen<RuntimeValue | undefined>[] = [runFrame(ctx, main)]
  const pauses: number[] = []
  const waits: number[] = []
  const inputs = [...(options.inputs ?? [])]
  const answer = (event: InputEvent): void => {
    const text = inputs.shift()
    if (text === undefined) throw new Error('the program asked for more input than the test gave')
    if (event.target === null) return
    const parsed = parseInput(text, event.target.type, profile)
    if (!parsed.ok) throw new Error(`"${text}" was rejected for ${event.target.name}`)
    event.target.slot.value = parsed.value
  }
  let sent: RuntimeValue | undefined
  try {
    for (;;) {
      const gen = stack[stack.length - 1]
      if (gen === undefined) break
      const result = gen.next(sent)
      sent = undefined
      if (result.done) {
        stack.pop()
        frames.pop()
        if (stack.length === 0) break
        sent = result.value
        continue
      }
      const event = result.value
      switch (event.kind) {
        case 'pause':
          pauses.push(event.line)
          break
        case 'input':
          answer(event)
          break
        case 'wait':
          waits.push(event.millis)
          break
        case 'call': {
          const frame = frameForCall(ctx, event)
          frames.push(frame)
          stack.push(runFrame(ctx, frame))
          break
        }
      }
    }
    return { output, error: undefined, main, pauses, waits, cleared }
  } catch (error) {
    if (error instanceof RuntimeError) {
      return { output, error: error.diagnostic, main, pauses, waits, cleared }
    }
    throw error
  }
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/interpreter/statements.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { slotOf } from '../../src/interpreter/frame'
import { isArrayValue, type RuntimeValue } from '../../src/interpreter/value'
import { runMain, type RunMainReport } from './drive'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

/** The final value of a main-frame variable. */
function valueOf(report: RunMainReport, name: string): RuntimeValue | undefined {
  const symbol = report.main.scope.symbols.get(name)
  if (symbol === undefined) throw new Error(`"${name}" is not a main variable`)
  return slotOf(report.main, symbol).value
}

describe('declarations (§5.2)', () => {
  it('Definir of a scalar is a no-op: the slot already exists, unassigned', () => {
    const report = runMain(main('Definir n Como Entero;', 'n <- 1;', 'Escribir n;'))
    expect(report.output).toBe('1\n')
    expect(report.pauses).toEqual([2, 3, 4])
  })

  it('sized Definir allocates the array at that statement, unassigned; again allocates afresh', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 2 Hacer',
        '  Definir a Como Entero[2,2];',
        '  a[1,1] <- i;',
        'FinPara',
        'Escribir a[1,1];',
      ),
    )
    expect(report.error).toBeUndefined()
    expect(report.output).toBe('2\n')
    const a = valueOf(report, 'a')
    expect(isArrayValue(a) && a.dims).toEqual([2, 2])
    expect(isArrayValue(a) && a.data).toEqual([2, undefined, undefined, undefined])
  })

  it('unsized Definir is a no-op and the array is E4003 until dimensioned', () => {
    const report = runMain(main('Definir a Como Entero[];', 'Escribir a[1];'))
    expect(report.error?.code).toBe('E4003')
    expect(report.error?.data).toEqual({ name: 'a' })
  })

  it('Dimension allocates a fresh unassigned array; re-execution allocates afresh', () => {
    // A second `Dimension` of the same name is E3022, so re-execution needs a loop; a size
    // must fold (E3023), so it is a literal.
    const report = runMain(
      main(
        'Definir a Como Entero;',
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 2 Hacer',
        '  Dimension a[3];',
        '  Si i = 1 Entonces',
        '    a[1] <- 7;',
        '    Escribir a[1];',
        '  FinSi',
        'FinPara',
        'Escribir a[1];',
      ),
    )
    expect(report.output).toBe('7\n')
    expect(report.error?.code).toBe('E4003')
    expect(report.error?.data).toEqual({ name: 'a', index: '1', hint: 'cell' })
  })

  it('Constante is a no-op step whose value was filled at frame entry', () => {
    const report = runMain(main('Constante K <- 3 * 4;', 'Escribir K;'))
    expect(report.output).toBe('12\n')
    expect(report.pauses).toEqual([2, 3])
  })
})

describe('assignment and output (§5.2)', () => {
  it('assigns a scalar, a cell, a Real from an Entero and a Cadena from a Caracter', () => {
    const report = runMain(
      main(
        'Definir n Como Entero;',
        'Definir x Como Real;',
        'Definir s Como Cadena;',
        'Definir c Como Caracter;',
        'Definir a Como Entero[3];',
        'n <- 5;',
        'x <- n;',
        "c <- 'z';",
        's <- c;',
        'a[2] <- n * 2;',
        'Escribir n, " ", x, " ", s, " ", a[2];',
      ),
    )
    expect(report.output).toBe('5 5 z 10\n')
    expect(valueOf(report, 'x')).toBe(5)
  })

  it('evaluates the value before the target indices', () => {
    const report = runMain(
      main(
        'Definir a Como Entero[3];',
        'Definir i Como Entero;',
        'i <- 1;',
        'a[i] <- 9;',
        'a[a[1] - 7] <- 4;',
        'Escribir a[2];',
      ),
    )
    expect(report.output).toBe('4\n')
  })

  it('Escribir concatenates every rendered argument with no separator plus a newline', () => {
    const report = runMain(
      main('Definir b Como Logico;', 'b <- 3 > 2;', 'Escribir "a", 1, 2.5, b, " fin";'),
    )
    expect(report.output).toBe('a12.5Verdadero fin\n')
  })

  it('Escribir Sin Saltar appends no newline', () => {
    const report = runMain(main('Escribir Sin Saltar "a", "b";', 'Escribir "c";'))
    expect(report.output).toBe('abc\n')
  })

  it('Escribir renders under the en profile with its own true/false spellings', () => {
    const report = runMain(
      ['Program p', '  Define b As Boolean;', '  b <- 1 = 1;', '  Write b;', 'EndProgram'].join('\n'),
      { profileName: 'en' },
    )
    expect(report.output).toBe('True\n')
  })
})

describe('input (§5.2, §5.7)', () => {
  it('Leer issues one request per target, left to right, storing each parsed value', () => {
    const report = runMain(
      main(
        'Definir n Como Entero;',
        'Definir x Como Real;',
        'Definir s Como Cadena;',
        'Leer n, x, s;',
        'Escribir n + 1, " ", x * 2, " ", s;',
      ),
      { inputs: ['4', '1.5', ' hola '] },
    )
    expect(report.output).toBe('5 3 hola\n')
  })

  it('Leer into an indexed target evaluates and bounds-checks the indices before asking', () => {
    const ok = runMain(
      main('Definir a Como Entero[3];', 'Leer a[2];', 'Escribir a[2];'),
      { inputs: ['8'] },
    )
    expect(ok.output).toBe('8\n')
    const bad = runMain(main('Definir a Como Entero[3];', 'Leer a[4];'), { inputs: ['8'] })
    expect(bad.error?.code).toBe('E4001')
    expect(bad.error?.data).toEqual({ name: 'a', index: 4, low: 1, high: 3 })
  })
})

describe('branches (§5.2)', () => {
  it('Si runs the first true branch, else Sino', () => {
    const program = (n: number): string =>
      main(
        'Definir n Como Entero;',
        `n <- ${n};`,
        'Si n < 0 Entonces',
        '  Escribir "neg";',
        'Sino Si n = 0 Entonces',
        '  Escribir "cero";',
        'Sino',
        '  Escribir "pos";',
        'FinSi',
      )
    expect(runMain(program(-1)).output).toBe('neg\n')
    expect(runMain(program(0)).output).toBe('cero\n')
    expect(runMain(program(3)).output).toBe('pos\n')
  })

  it('Si yields once before the condition; the chosen branch statements are steps of their own', () => {
    const report = runMain(main('Si 1 < 2 Entonces', '  Escribir "a";', 'Sino', '  Escribir "b";', 'FinSi'))
    expect(report.pauses).toEqual([2, 3])
  })

  it('Segun runs the first case one of whose values equals the selector, else De Otro Modo', () => {
    const program = (n: number): string =>
      main(
        'Definir n Como Entero;',
        `n <- ${n};`,
        'Segun n Hacer',
        '  1, 2:',
        '    Escribir "bajo";',
        '  3:',
        '    Escribir "tres";',
        '  De Otro Modo:',
        '    Escribir "otro";',
        'FinSegun',
      )
    expect(runMain(program(2)).output).toBe('bajo\n')
    expect(runMain(program(3)).output).toBe('tres\n')
    expect(runMain(program(9)).output).toBe('otro\n')
  })

  it('Segun on a Caracter selector matches one-character Cadena labels', () => {
    const report = runMain(
      main(
        'Definir c Como Caracter;',
        "c <- 'b';",
        'Segun c Hacer',
        '  "a":',
        '    Escribir "A";',
        '  "b":',
        '    Escribir "B";',
        'FinSegun',
      ),
    )
    expect(report.output).toBe('B\n')
  })
})

describe('loops (§5.2, §3.4)', () => {
  it('Mientras tests before each pass and yields on its own line before every test', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'i <- 0;', 'Mientras i < 3 Hacer', '  i <- i + 1;', 'FinMientras', 'Escribir i;'),
    )
    expect(report.output).toBe('3\n')
    expect(report.pauses).toEqual([2, 3, 4, 5, 4, 5, 4, 5, 4, 7])
  })

  it('an empty Mientras body still yields once per iteration', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'i <- 0;', 'Mientras i < 0 Hacer', 'FinMientras', 'Escribir i;'),
    )
    expect(report.pauses).toEqual([2, 3, 4, 6])
  })

  it('Repetir … Hasta Que runs the body first and exits when the condition is true', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'i <- 5;', 'Repetir', '  i <- i + 1;', 'Hasta Que i > 0;', 'Escribir i;'),
    )
    expect(report.output).toBe('6\n')
    expect(report.pauses).toEqual([2, 3, 4, 5, 4, 7])
  })

  it('Repetir … Mientras Que continues while the condition is true', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'i <- 0;', 'Repetir', '  i <- i + 1;', 'Mientras Que i < 3;', 'Escribir i;'),
    )
    expect(report.output).toBe('3\n')
  })

  it('Romper leaves the innermost loop; Continuar skips to its next test', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 10 Hacer',
        '  Si i MOD 2 = 0 Entonces',
        '    Continuar;',
        '  FinSi',
        '  Si i > 5 Entonces',
        '    Romper;',
        '  FinSi',
        '  Escribir Sin Saltar i;',
        'FinPara',
        'Escribir "";',
      ),
    )
    expect(report.output).toBe('135\n')
  })

  it('Romper and Continuar pass through Segun to the enclosing loop', () => {
    const report = runMain(
      main(
        'Definir i Como Entero;',
        'Para i <- 1 Hasta 5 Hacer',
        '  Segun i Hacer',
        '    2:',
        '      Continuar;',
        '    4:',
        '      Romper;',
        '  FinSegun',
        '  Escribir Sin Saltar i;',
        'FinPara',
        'Escribir "";',
      ),
    )
    expect(report.output).toBe('13\n')
  })

  it('a loop inside a call consumes its own Romper, not the caller loop', () => {
    const report = runMain(
      [
        'SubProceso salir()',
        '  Mientras Verdadero Hacer',
        '    Romper;',
        '  FinMientras',
        'FinSubProceso',
        'Proceso p',
        '  Definir i Como Entero;',
        '  Para i <- 1 Hasta 2 Hacer',
        '    salir();',
        '    Escribir Sin Saltar i;',
        '  FinPara',
        '  Escribir "";',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('12\n')
  })
})

describe('Para (§5.9)', () => {
  it('evaluates from, to and step once, in that order, before the first iteration', () => {
    const report = runMain(
      main(
        'Definir i, n Como Entero;',
        'n <- 3;',
        'Para i <- 1 Hasta n Con Paso 1 Hacer',
        '  n <- 10;',
        'FinPara',
        'Escribir i;',
      ),
    )
    expect(report.output).toBe('4\n')
  })

  it('leaves the counter at the first failing value after a normal end', () => {
    const report = runMain(main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', 'FinPara', 'Escribir i;'))
    expect(report.output).toBe('4\n')
  })

  it('leaves the counter at from when the loop never runs', () => {
    const report = runMain(main('Definir i Como Entero;', 'Para i <- 5 Hasta 3 Hacer', '  Escribir "no";', 'FinPara', 'Escribir i;'))
    expect(report.output).toBe('5\n')
  })

  it('leaves the counter at the current value after Romper', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'Para i <- 1 Hasta 9 Hacer', '  Si i = 4 Entonces', '    Romper;', '  FinSi', 'FinPara', 'Escribir i;'),
    )
    expect(report.output).toBe('4\n')
  })

  it('runs downwards with a negative step while counter >= to', () => {
    const report = runMain(
      main('Definir i Como Entero;', 'Para i <- 5 Hasta 1 Con Paso -2 Hacer', '  Escribir Sin Saltar i;', 'FinPara', 'Escribir "";'),
    )
    expect(report.output).toBe('531\n')
  })

  it('yields on its own line before every test', () => {
    const report = runMain(main('Definir i Como Entero;', 'Para i <- 1 Hasta 2 Hacer', '  Escribir i;', 'FinPara'))
    expect(report.pauses).toEqual([2, 3, 4, 3, 4, 3])
  })

  it('reports a computed zero step as E4008 at the step expression', () => {
    const source = main('Definir i, s Como Entero;', 's <- 0;', 'Para i <- 1 Hasta 3 Con Paso s Hacer', '  Escribir i;', 'FinPara')
    const report = runMain(source)
    expect(report.error?.code).toBe('E4008')
    expect(report.error && source.slice(report.error.span.start, report.error.span.end)).toBe('s')
    expect(report.error?.data).toEqual({ name: 'i' })
    expect(report.error && formatDiagnostic(report.error, 'es', profiles.es)).toBe(
      'El paso del bucle de «i» es 0: el bucle nunca terminaría.',
    )
  })
})

describe('calls and returns (§5.2, §5.5)', () => {
  it('a function returns its result slot; Retornar v assigns it and returns', () => {
    const report = runMain(
      [
        'Funcion r Como Entero <- doble(n Como Entero)',
        '  r <- n * 2;',
        'FinFuncion',
        'Funcion r Como Entero <- triple(n Como Entero)',
        '  Retornar n * 3;',
        '  r <- 0;',
        'FinFuncion',
        'Funcion cuadruple(n Como Entero): Entero',
        '  Retornar n * 4;',
        'FinFuncion',
        'Proceso p',
        '  Escribir doble(2), " ", triple(2), " ", cuadruple(2);',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('4 6 8\n')
  })

  it('a bare Retornar ends the frame; in main the program is done', () => {
    const report = runMain(
      [
        'SubProceso s()',
        '  Escribir "a";',
        '  Retornar;',
        '  Escribir "b";',
        'FinSubProceso',
        'Proceso p',
        '  s();',
        '  Escribir "c";',
        '  Retornar;',
        '  Escribir "d";',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('a\nc\n')
  })

  it('a call statement discards a function result', () => {
    const report = runMain(
      ['Funcion r Como Entero <- f()', '  Escribir "f";', '  r <- 1;', 'FinFuncion', 'Proceso p', '  f();', 'FinProceso'].join('\n'),
    )
    expect(report.output).toBe('f\n')
  })

  it('reports E4006 at the function name when it ends without a result', () => {
    const source = [
      'Funcion r Como Entero <- mayor(a, b Como Entero)',
      '  Si a > b Entonces',
      '    r <- a;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n')
    const report = runMain(source)
    expect(report.error?.code).toBe('E4006')
    expect(report.error && source.slice(report.error.span.start, report.error.span.end)).toBe('mayor')
    expect(report.error?.data).toEqual({ name: 'mayor' })
    const typed = [
      'Funcion f(n Como Entero): Entero',
      '  Si n > 0 Entonces',
      '    Retornar n;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir f(0);',
      'FinProceso',
    ].join('\n')
    expect(runMain(typed).error?.code).toBe('E4006')
  })

  it('a by-reference scalar aliases the caller variable and a by-reference cell the caller cell', () => {
    const report = runMain(
      [
        'SubProceso poner(x Por Referencia Como Entero, v Como Entero)',
        '  x <- v;',
        'FinSubProceso',
        'Proceso p',
        '  Definir n Como Entero;',
        '  Definir a Como Entero[2];',
        '  poner(n, 5);',
        '  poner(a[2], 6);',
        '  Escribir n, " ", a[2];',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('5 6\n')
  })

  it('a by-value scalar is a copy; an array travels by reference even by value', () => {
    const report = runMain(
      [
        'SubProceso cambia(n Como Entero, a Como Entero[])',
        '  n <- 99;',
        '  a[1] <- 99;',
        'FinSubProceso',
        'Proceso p',
        '  Definir n Como Entero;',
        '  Definir a Como Entero[2];',
        '  n <- 1;',
        '  a[1] <- 1;',
        '  cambia(n, a);',
        '  Escribir n, " ", a[1];',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('1 99\n')
  })

  it('recursion is ordinary: each call is a frame', () => {
    const report = runMain(
      [
        'Funcion r Como Entero <- fact(n Como Entero)',
        '  Si n <= 1 Entonces',
        '    r <- 1;',
        '  Sino',
        '    r <- n * fact(n - 1);',
        '  FinSi',
        'FinFuncion',
        'Proceso p',
        '  Escribir fact(5);',
        'FinProceso',
      ].join('\n'),
    )
    expect(report.output).toBe('120\n')
  })
})

describe('host statements (§5.2)', () => {
  it('Limpiar Pantalla calls io.clear when the host provides it', () => {
    const report = runMain(main('Limpiar Pantalla;', 'Escribir "x";'))
    expect(report.cleared).toBe(1)
    expect(report.output).toBe('x\n')
  })

  it('Esperar yields a wait event with the evaluated millis, negatives clamped to 0', () => {
    const report = runMain(main('Definir t Como Entero;', 't <- -5;', 'Esperar 250;', 'Esperar t;', 'Escribir "x";'))
    expect(report.waits).toEqual([250, 0])
    expect(report.output).toBe('x\n')
  })

  it('Esperar Tecla yields an input request with no target and accepts any text', () => {
    const report = runMain(main('Escribir "pulsa";', 'Esperar Tecla;', 'Escribir "ok";'), { inputs: ['whatever'] })
    expect(report.output).toBe('pulsa\nok\n')
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/statements.test.ts`
Expected: FAIL — `runFrame` and `frameForCall` are not exported from `../../src/interpreter/evaluate` (typecheck/runtime import error).

- [ ] **Step 4: Append the statement layer to `packages/language/src/interpreter/evaluate.ts`**

Extend the import block: add `Stmt` to the `../ast/index` type import; import `bindSlot`, `bodyScopeOf`, `createFrame` from `./frame`; `renderValue` from `./render`; `allocateArray` from `./value`. Then append:

```ts
/** What a statement hands up (§5.1). Lists stop at the first non-normal one. */
export type Completion = 'normal' | 'break' | 'continue' | 'return'

function pause(ctx: Context, stmt: Stmt): PauseEvent {
  return { kind: 'pause', line: lineOf(ctx, stmt) }
}

/** Sizes of a `Definir a Como T[3,3]` or a `Dimension` item, evaluated left to right. */
function* evaluateSizes(ctx: Context, frame: RuntimeFrame, sizes: readonly Expr[]): Gen<number[]> {
  const out: number[] = []
  for (const size of sizes) out.push(Number(yield* evaluate(ctx, frame, size)))
  return out
}

/** The completion a loop hands up after its body: `break` ends it, `return` escapes it. */
function afterBody(completion: Completion): Completion | null {
  if (completion === 'break') return 'normal'
  if (completion === 'return') return 'return'
  return null
}

/**
 * §5.2, one case per statement kind. The pause event comes first, always: it is the point a
 * breakpoint or a step stops at, before anything of the statement has run. Loops add one more
 * pause on their own line before every later test, so an empty body cannot spin unobserved.
 */
export function* execute(ctx: Context, frame: RuntimeFrame, stmt: Stmt): Gen<Completion> {
  yield pause(ctx, stmt)
  switch (stmt.kind) {
    case 'DefineStmt': {
      const ref = stmt.type
      if (ref.dimensions.length === 0 || ref.dimensions.some((size) => size === null)) return 'normal'
      const sizeExprs = ref.dimensions.filter((size): size is Expr => size !== null)
      const sizes = yield* evaluateSizes(ctx, frame, sizeExprs)
      const spans = sizeExprs.map((size) => size.span)
      for (const name of stmt.names) {
        slotOf(frame, symbolOf(ctx, name)).value = allocateArray(ref.base, sizes, { name: name.text, spans })
      }
      return 'normal'
    }
    case 'DimensionStmt': {
      for (const item of stmt.items) {
        const symbol = symbolOf(ctx, item.name)
        if (symbol.type.kind !== 'array') throw new Error(`"${item.name.text}" is not an array (E3022)`)
        const sizes = yield* evaluateSizes(ctx, frame, item.sizes)
        slotOf(frame, symbol).value = allocateArray(symbol.type.element, sizes, {
          name: item.name.text,
          spans: item.sizes.map((size) => size.span),
        })
      }
      return 'normal'
    }
    case 'ConstantStmt':
      return 'normal'
    case 'AssignStmt': {
      const value = yield* evaluate(ctx, frame, stmt.value)
      const slot = yield* evaluateRef(ctx, frame, stmt.target)
      slot.value = value
      return 'normal'
    }
    case 'WriteStmt': {
      let text = ''
      for (const arg of stmt.args) {
        const value = yield* evaluate(ctx, frame, arg)
        text += renderValue(value, typeOfNode(ctx, arg), ctx.profile)
      }
      ctx.io.write(stmt.newline ? `${text}\n` : text)
      return 'normal'
    }
    case 'ReadStmt': {
      for (const target of stmt.targets) {
        const slot = yield* evaluateRef(ctx, frame, target)
        const event: InputEvent = {
          kind: 'input',
          target: {
            name: nameOf(target, ctx.profile),
            type: typeOfNode(ctx, target),
            slot,
            span: target.span,
          },
        }
        yield event
      }
      return 'normal'
    }
    case 'IfStmt': {
      for (const branch of stmt.branches) {
        if ((yield* evaluate(ctx, frame, branch.condition)) === true) {
          return yield* runBody(ctx, frame, branch.body)
        }
      }
      if (stmt.elseBody !== undefined) return yield* runBody(ctx, frame, stmt.elseBody)
      return 'normal'
    }
    case 'SwitchStmt': {
      const selector = yield* evaluate(ctx, frame, stmt.selector)
      for (const entry of stmt.cases) {
        for (const label of entry.values) {
          if ((yield* evaluate(ctx, frame, label)) === selector) {
            return yield* runBody(ctx, frame, entry.body)
          }
        }
      }
      if (stmt.otherwise !== undefined) return yield* runBody(ctx, frame, stmt.otherwise)
      return 'normal'
    }
    case 'WhileStmt': {
      for (;;) {
        if ((yield* evaluate(ctx, frame, stmt.condition)) !== true) return 'normal'
        const after = afterBody(yield* runBody(ctx, frame, stmt.body))
        if (after !== null) return after
        yield pause(ctx, stmt)
      }
    }
    case 'RepeatStmt': {
      for (;;) {
        const after = afterBody(yield* runBody(ctx, frame, stmt.body))
        if (after !== null) return after
        yield pause(ctx, stmt)
        const holds = (yield* evaluate(ctx, frame, stmt.condition)) === true
        if (stmt.until ? holds : !holds) return 'normal'
      }
    }
    case 'ForStmt': {
      const slot = slotOf(frame, symbolOf(ctx, stmt.counter))
      const from = Number(yield* evaluate(ctx, frame, stmt.from))
      const to = Number(yield* evaluate(ctx, frame, stmt.to))
      const step = stmt.step === undefined ? 1 : Number(yield* evaluate(ctx, frame, stmt.step))
      if (step === 0 && stmt.step !== undefined) {
        fail('E4008', stmt.step.span, { name: stmt.counter.text })
      }
      slot.value = from
      for (;;) {
        const counter = Number(slot.value)
        if (step > 0 ? counter > to : counter < to) return 'normal'
        const after = afterBody(yield* runBody(ctx, frame, stmt.body))
        if (after !== null) return after
        yield pause(ctx, stmt)
        slot.value = counter + step
      }
    }
    case 'BreakStmt':
      return 'break'
    case 'ContinueStmt':
      return 'continue'
    case 'ReturnStmt': {
      if (stmt.value !== undefined) {
        const value = yield* evaluate(ctx, frame, stmt.value)
        if (frame.result !== null) slotOf(frame, frame.result).value = value
        else frame.returnValue = value
      }
      return 'return'
    }
    case 'CallStmt': {
      if (stmt.call.kind === 'Call') yield* evaluateCall(ctx, frame, stmt.call)
      else yield* evaluate(ctx, frame, stmt.call)
      return 'normal'
    }
    case 'ClearStmt':
      ctx.io.clear?.()
      return 'normal'
    case 'WaitStmt': {
      const millis = Number(yield* evaluate(ctx, frame, stmt.millis))
      const event: WaitEvent = { kind: 'wait', millis: Math.max(0, millis) }
      yield event
      return 'normal'
    }
    case 'WaitKeyStmt': {
      const event: InputEvent = { kind: 'input', target: null }
      yield event
      return 'normal'
    }
    case 'SubprogramDecl':
    case 'ErrorStmt':
      throw new Error(`a ${stmt.kind} never reaches a started program (§3.1)`)
  }
}

export function* runBody(ctx: Context, frame: RuntimeFrame, stmts: readonly Stmt[]): Gen<Completion> {
  for (const stmt of stmts) {
    const completion = yield* execute(ctx, frame, stmt)
    if (completion !== 'normal') return completion
  }
  return 'normal'
}

/**
 * One frame's whole life: the body, then the value it hands back. A procedure and main return
 * nothing; a function returns its result slot, or what `Retornar v` left when it has none.
 * Ending with neither is E4006 at the function's name, raised while the frame is still on the
 * stack so the error shows it (§5.5 step 4).
 */
export function* runFrame(ctx: Context, frame: RuntimeFrame): Gen<RuntimeValue | undefined> {
  yield* runBody(ctx, frame, frame.body)
  const decl = frame.decl
  if (decl === null || decl.form === 'procedure') return undefined
  const value = frame.result === null ? frame.returnValue : slotOf(frame, frame.result).value
  if (value === undefined) fail('E4006', decl.name.span, { name: decl.name.text })
  return value
}

/** §4.2, §5.5 step 3: the callee frame, parameters bound from the event's arguments. */
export function frameForCall(ctx: Context, event: CallEvent): RuntimeFrame {
  const frame = createFrame(bodyScopeOf(ctx.program, event.decl), lineOf(ctx, event.decl.name))
  event.decl.params.forEach((param, position) => {
    const symbol = symbolOf(ctx, param.name)
    const arg = event.args[position]
    if (arg === undefined) throw new Error(`no argument for parameter "${param.name.text}"`)
    if (arg.kind === 'slot') bindSlot(frame, symbol, arg.slot)
    else slotOf(frame, symbol).value = arg.value
  })
  return frame
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/statements.test.ts`
Expected: PASS, 38 tests. If `pauses` for the `Mientras` case differ by the line of `FinMientras`, re-read §3.4: the loop yields on *its own* line (the `Mientras` line, 4 in that fixture) before every test — the expectation is right and the implementation is wrong.

- [ ] **Step 6: Run lint, typecheck and the interpreter suite, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm vitest run --project stepcode test/interpreter
git add packages/language/src/interpreter/evaluate.ts packages/language/test/interpreter/drive.ts packages/language/test/interpreter/statements.test.ts
git commit -m "feat(language): statement semantics, completions and the frame runner"
```

**Parallelism:** none — same file as Task 5; Task 7 builds on `runFrame` and `frameForCall`.

---

### Task 7: `interpreter/run.ts` — `start`, the `Run` controller and the runtime by-code suite

**Files:**
- Create: `packages/language/src/interpreter/run.ts`
- Modify: `packages/language/test/helpers.ts` (append `startSource`, `collectRun`; merge imports)
- Test: `packages/language/test/interpreter/run.test.ts`
- Test: `packages/language/test/interpreter/by-code.test.ts`

**Interfaces:**
- Consumes: `CompileResult` from `../compile`; `createDiagnostic`, `Diagnostic` from `../diagnostics/index`; `LineMap` from `../source/index`; `Type`, `typeToString` from `../types/type`; `CallEvent`, `Context`, `Event`, `frameForCall`, `InputEvent`, `lineOf`, `runFrame` from `./evaluate`; `bodyScopeOf`, `createFrame`, `Frame`, `inspectFrames`, `RuntimeFrame` from `./frame`; `parseInput` from `./input`; `fail`, `RuntimeError`, `RuntimeValue` from `./value`.
- Produces:
  - `interface RunOptions { readonly profile: ResolvedProfile; readonly io: { write(text: string): void; clear?(): void }; readonly random?: () => number; readonly limits?: { readonly stackDepth?: number } }`
  - `type RunState = 'ready' | 'paused' | 'input' | 'waiting' | 'done' | 'error'`
  - `type PauseReason = 'step' | 'breakpoint' | 'budget'`
  - `type StepResult = { kind: 'paused'; reason: PauseReason; line: number; frames: Frame[] } | { kind: 'input'; line: number; target: { name: string; type: Type } | null; rejected?: Diagnostic } | { kind: 'wait'; line: number; millis: number } | { kind: 'done' } | { kind: 'error'; diagnostic: Diagnostic; frames: Frame[] }` (all fields `readonly`)
  - `type InputRequest = Omit<Extract<StepResult, { kind: 'input' }>, 'kind'>`
  - `interface Run { readonly state: RunState; step(): StepResult; stepOver(): StepResult; stepOut(): StepResult; continue(opts?: { readonly budget?: number }): StepResult; input(text: string): void; setBreakpoints(lines: Iterable<number>): void; inspect(): Frame[] }`
  - `const DEFAULT_STACK_DEPTH = 1000`
  - `function start(program: CompileResult, options: RunOptions): Run` — throws a plain `Error` naming the first error code when `program.diagnostics` holds an error.
  - Test helpers: `startSource(source, options?: { profileName?: ProfileName; random?: () => number; stackDepth?: number }): { run: Run; output: () => string; writes: string[]; program: CompileResult }`; `collectRun(run: Run, inputs?: readonly string[]): StepResult` — drives `continue()` answering inputs in order until `done`, `error`, a rejected request or a request with no answer left.

- [ ] **Step 1: Add `startSource` and `collectRun` to `packages/language/test/helpers.ts`**

Merge `import { type Run, type StepResult, start } from '../src/interpreter/run'` into the import block, then append:

```ts
export interface StartOptions {
  readonly profileName?: ProfileName
  readonly random?: () => number
  readonly stackDepth?: number
}

/** `start` over a compiled source with a buffering `io`; `writes` keeps every `io.write` apart. */
export function startSource(
  source: string,
  options: StartOptions = {},
): { run: Run; output: () => string; writes: string[]; program: CompileResult } {
  const program = compileEs(source, options.profileName ?? 'es')
  const writes: string[] = []
  const run = start(program, {
    profile: profileNamed(options.profileName ?? 'es'),
    io: { write: (text) => void writes.push(text) },
    ...(options.random === undefined ? {} : { random: options.random }),
    ...(options.stackDepth === undefined ? {} : { limits: { stackDepth: options.stackDepth } }),
  })
  return { run, output: () => writes.join(''), writes, program }
}

/**
 * Drives `run` with `continue()` — no breakpoints, no budget — answering input requests from
 * `inputs` in order and carrying straight on after a wait. Ends at `done`, at `error`, at a
 * request that was rejected, or at a request there is no answer left for; the caller decides
 * which of those it expected.
 */
export function collectRun(run: Run, inputs: readonly string[] = []): StepResult {
  const queue = [...inputs]
  for (;;) {
    const result = run.continue()
    switch (result.kind) {
      case 'done':
      case 'error':
        return result
      case 'input': {
        if (result.rejected !== undefined) return result
        const text = queue.shift()
        if (text === undefined) return result
        run.input(text)
        break
      }
      case 'wait':
        break
      case 'paused':
        throw new Error(`continue() without breakpoints or budget paused (${result.reason})`)
    }
  }
}
```

- [ ] **Step 2: Write the failing test `packages/language/test/interpreter/run.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { formatDiagnostic } from '../../src/diagnostics/index'
import { type StepResult, start } from '../../src/interpreter/run'
import { collectRun, seeded, startSource } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

const counting = main(
  'Definir i, total Como Entero;',
  'total <- 0;',
  'Para i <- 1 Hasta 3 Hacer',
  '  total <- total + i;',
  'FinPara',
  'Escribir total;',
)

const withCall = [
  'Funcion r Como Entero <- doble(n Como Entero)',
  '  r <- n * 2;',
  '  Escribir "en doble";',
  'FinFuncion',
  'Proceso p',
  '  Definir x Como Entero;',
  '  x <- doble(4);',
  '  Escribir x;',
  'FinProceso',
].join('\n')

function paused(result: StepResult): Extract<StepResult, { kind: 'paused' }> {
  if (result.kind !== 'paused') throw new Error(`expected paused, got ${result.kind}`)
  return result
}

describe('start (§3.1)', () => {
  it('throws a plain Error naming the first error code, and accepts warnings', () => {
    const broken = compile(main('Escribir x;'), { profile: profiles.es })
    expect(() => start(broken, { profile: profiles.es, io: { write: () => {} } })).toThrow(/E3001/)
    const warned = compile(main('Definir a Como Entero;', 'a <- 1;'), { profile: profiles.es })
    expect(warned.diagnostics.map((one) => one.code)).toEqual(['W3002'])
    expect(() => start(warned, { profile: profiles.es, io: { write: () => {} } })).not.toThrow()
  })

  it('returns a Run in state ready, positioned before the first statement, having executed nothing', () => {
    const { run, output } = startSource(counting)
    expect(run.state).toBe('ready')
    expect(output()).toBe('')
    expect(run.inspect()).toEqual([
      {
        name: 'p',
        line: 2,
        variables: [
          { name: 'i', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value: undefined },
          { name: 'total', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value: undefined },
        ],
      },
    ])
  })
})

describe('step (§3.4)', () => {
  it('executes the first statement from ready and pauses before the next, with frames', () => {
    const { run } = startSource(counting)
    const first = paused(run.step())
    expect(first.reason).toBe('step')
    expect(first.line).toBe(3)
    expect(run.state).toBe('paused')
    const second = paused(run.step())
    expect(second.line).toBe(4)
    expect(second.frames[0]?.variables.map((v) => v.value)).toEqual([undefined, 0])
  })

  it('visits a loop header once per iteration and ends with done', () => {
    const { run, output } = startSource(counting)
    const lines: number[] = []
    for (;;) {
      const result = run.step()
      if (result.kind === 'done') break
      lines.push(paused(result).line)
    }
    expect(lines).toEqual([3, 4, 5, 4, 5, 4, 5, 4, 7])
    expect(run.state).toBe('done')
    expect(output()).toBe('6\n')
    expect(run.inspect()).toEqual([])
  })

  it('enters a call: the callee frame is innermost and the caller shows the call line', () => {
    const { run } = startSource(withCall)
    paused(run.step()) // Definir x → before x <- doble(4)
    const inside = paused(run.step())
    expect(inside.line).toBe(2)
    expect(inside.frames.map((frame) => [frame.name, frame.line])).toEqual([
      ['doble', 2],
      ['p', 7],
    ])
    expect(inside.frames[0]?.variables.map((v) => [v.name, v.value])).toEqual([
      ['n', 4],
      ['r', undefined],
    ])
  })
})

describe('stepOver and stepOut (§3.4)', () => {
  it('stepOver runs a call to completion and pauses at the next statement of the same depth', () => {
    const { run, output } = startSource(withCall)
    paused(run.step())
    const after = paused(run.stepOver())
    expect(after.line).toBe(8)
    expect(after.frames).toHaveLength(1)
    expect(output()).toBe('en doble\n')
  })

  it('stepOver inside the callee behaves like step for its own statements', () => {
    const { run } = startSource(withCall)
    paused(run.step())
    paused(run.step()) // inside doble, before r <- n * 2
    const next = paused(run.stepOver())
    expect(next.line).toBe(3)
    expect(next.frames).toHaveLength(2)
  })

  it('stepOut runs until the current frame returns; in main it runs to done', () => {
    const { run, output } = startSource(withCall)
    paused(run.step())
    paused(run.step())
    const out = paused(run.stepOut())
    expect(out.line).toBe(8)
    expect(out.frames).toHaveLength(1)
    expect(run.stepOut()).toEqual({ kind: 'done' })
    expect(output()).toBe('en doble\n8\n')
  })

  it('stepOut from a recursive frame returns to the caller frame only', () => {
    // `r <- k` after the recursive call gives the caller frame a pause point of its own.
    const source = [
      'Funcion r Como Entero <- fact(n Como Entero)',
      '  Definir k Como Entero;',
      '  Si n <= 1 Entonces',
      '    k <- 1;',
      '  Sino',
      '    k <- n * fact(n - 1);',
      '  FinSi',
      '  r <- k;',
      'FinFuncion',
      'Proceso p',
      '  Escribir fact(3);',
      'FinProceso',
    ].join('\n')
    const { run } = startSource(source)
    let result = run.step()
    while (result.kind === 'paused' && result.frames.length < 3) result = run.step()
    expect(paused(result).frames.map((frame) => frame.name)).toEqual(['fact', 'fact', 'p'])
    const out = paused(run.stepOut())
    expect(out.line).toBe(8)
    expect(out.frames.map((frame) => [frame.name, frame.line])).toEqual([
      ['fact', 8],
      ['p', 11],
    ])
    expect(out.frames[0]?.variables.map((v) => [v.name, v.value])).toEqual([
      ['n', 3],
      ['r', undefined],
      ['k', 6],
    ])
  })
})

describe('breakpoints (§3.5)', () => {
  it('hits a loop body line on every iteration, never on the line it resumes from', () => {
    const { run } = startSource(counting)
    run.setBreakpoints([5])
    const hits: number[] = []
    for (;;) {
      const result = run.continue()
      if (result.kind === 'done') break
      const pause = paused(result)
      expect(pause.reason).toBe('breakpoint')
      hits.push(pause.frames[0]?.variables[0]?.value as number)
    }
    expect(hits).toEqual([1, 2, 3])
  })

  it('never hits a line that holds no statement start, and replaces the set', () => {
    const { run } = startSource(counting)
    run.setBreakpoints([1, 6, 8])
    expect(run.continue()).toEqual({ kind: 'done' })
    const again = startSource(counting)
    again.run.setBreakpoints([5])
    again.run.setBreakpoints([7])
    expect(paused(again.run.continue()).line).toBe(7)
    expect(again.run.continue()).toEqual({ kind: 'done' })
  })

  it('wins over the stepping reason when both hold, and stops stepOver inside a call', () => {
    const { run } = startSource(counting)
    run.setBreakpoints([3])
    expect(paused(run.step()).reason).toBe('breakpoint')
    const call = startSource(withCall)
    call.run.setBreakpoints([3])
    paused(call.run.step())
    const stopped = paused(call.run.stepOver())
    expect(stopped.reason).toBe('breakpoint')
    expect(stopped.frames.map((frame) => frame.name)).toEqual(['doble', 'p'])
  })
})

describe('continue and budget (§3.5)', () => {
  it('runs to done without a budget', () => {
    const { run, output } = startSource(counting)
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('6\n')
  })

  it('pauses with reason budget after exactly n pause points, counting loop re-tests', () => {
    const { run } = startSource(counting)
    const first = paused(run.continue({ budget: 2 }))
    expect(first.reason).toBe('budget')
    expect(first.line).toBe(4)
    const second = paused(run.continue({ budget: 3 }))
    expect(second.line).toBe(5)
    expect(second.frames[0]?.variables[0]?.value).toBe(2)
  })

  it('finishes when the budget exceeds what is left', () => {
    const { run } = startSource(counting)
    expect(run.continue({ budget: 1000 })).toEqual({ kind: 'done' })
  })
})

describe('input (§3.2, §5.7)', () => {
  const reading = main(
    'Definir n Como Entero;',
    'Definir s Como Cadena;',
    'Leer n, s;',
    'Escribir n * 2, s;',
  )

  it('reports the target name and static type, stores an accepted value, then pauses mid-statement', () => {
    const { run, output } = startSource(reading)
    const request = run.continue()
    expect(request).toEqual({
      kind: 'input',
      line: 4,
      target: { name: 'n', type: { kind: 'scalar', name: 'integer' } },
    })
    expect(run.state).toBe('input')
    run.input(' 21 ')
    expect(run.state).toBe('paused')
    expect(run.inspect()[0]?.variables[0]?.value).toBe(21)
    const second = run.continue()
    expect(second.kind === 'input' && second.target?.name).toBe('s')
    run.input('x')
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('42x\n')
  })

  it('keeps the state input on a rejected text and re-reports the request with E4004', () => {
    const { run, program } = startSource(reading)
    run.continue()
    run.input('veinte')
    expect(run.state).toBe('input')
    const again = run.step()
    expect(again.kind).toBe('input')
    if (again.kind !== 'input') return
    expect(again.target?.name).toBe('n')
    expect(again.rejected?.code).toBe('E4004')
    expect(again.rejected && program.source.slice(again.rejected.span.start, again.rejected.span.end)).toBe('n')
    expect(again.rejected?.data).toEqual({ name: 'n', type: 'Entero', text: 'veinte', hint: 'integer' })
    expect(again.rejected && formatDiagnostic(again.rejected, 'es', profiles.es)).toBe(
      'La entrada «veinte» no es un Entero: escribe solo dígitos, con signo opcional, como «-12».',
    )
    run.input('7')
    expect(run.state).toBe('paused')
    expect(run.continue().kind).toBe('input')
  })

  it('accepts input() again directly after a rejection, without re-reading the request', () => {
    const { run } = startSource(reading)
    run.continue()
    run.input('a')
    run.input('b')
    run.input('3')
    expect(run.state).toBe('paused')
    expect(run.inspect()[0]?.variables[0]?.value).toBe(3)
  })

  it('reads an indexed target as its element type, and reports Esperar Tecla with target null', () => {
    const { run } = startSource(
      main('Definir a Como Real[2];', 'Leer a[2];', 'Esperar Tecla;', 'Escribir a[2];'),
    )
    const request = run.continue()
    expect(request.kind === 'input' && request.target).toEqual({
      name: 'a',
      type: { kind: 'scalar', name: 'real' },
    })
    run.input('1.5')
    const key = run.continue()
    expect(key).toEqual({ kind: 'input', line: 4, target: null })
    run.input('anything at all')
    expect(run.state).toBe('paused')
    expect(run.continue()).toEqual({ kind: 'done' })
  })
})

describe('wait (§3.3)', () => {
  it('reports the evaluated millis at the statement line, then resumes at the next statement', () => {
    const { run, output } = startSource(main('Escribir "a";', 'Esperar 300;', 'Escribir "b";'))
    expect(run.continue()).toEqual({ kind: 'wait', line: 3, millis: 300 })
    expect(run.state).toBe('waiting')
    expect(run.inspect()[0]?.line).toBe(3)
    expect(paused(run.step()).line).toBe(4)
    expect(run.continue()).toEqual({ kind: 'done' })
    expect(output()).toBe('a\nb\n')
  })
})

describe('errors (§3.3, §5.1)', () => {
  it('returns the diagnostic with the frames at the failure and keeps them in inspect()', () => {
    const source = [
      'SubProceso f(k Como Entero)',
      '  Definir a Como Entero[2];',
      '  a[k] <- 1;',
      'FinSubProceso',
      'Proceso p',
      '  f(3);',
      'FinProceso',
    ].join('\n')
    const { run } = startSource(source)
    const result = run.continue()
    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.diagnostic.code).toBe('E4001')
    expect(result.frames.map((frame) => [frame.name, frame.line])).toEqual([
      ['f', 3],
      ['p', 6],
    ])
    expect(run.state).toBe('error')
    expect(run.inspect()).toBe(result.frames)
    expect(() => run.step()).toThrow(/error/)
  })

  it('reports E4005 at the call when the stack would exceed limits.stackDepth', () => {
    const source = [
      'Funcion r Como Entero <- f(n Como Entero)',
      '  r <- f(n + 1);',
      'FinFuncion',
      'Proceso p',
      '  Escribir f(1);',
      'FinProceso',
    ].join('\n')
    const { run, program } = startSource(source, { stackDepth: 5 })
    const result = run.continue()
    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.diagnostic.code).toBe('E4005')
    expect(program.source.slice(result.diagnostic.span.start, result.diagnostic.span.end)).toBe('f(n + 1)')
    expect(result.diagnostic.data).toEqual({ name: 'f', depth: 5 })
    expect(result.frames).toHaveLength(5)
    expect(formatDiagnostic(result.diagnostic, 'en', profiles.en)).toBe(
      'Too many nested calls: "f" reached 5 calls without returning. Check the stopping condition.',
    )
  })

  it('uses 1000 as the default stack depth', () => {
    const source = [
      'Funcion r Como Entero <- f(n Como Entero)',
      '  r <- f(n + 1);',
      'FinFuncion',
      'Proceso p',
      '  Escribir f(1);',
      'FinProceso',
    ].join('\n')
    const result = collectRun(startSource(source).run)
    expect(result.kind === 'error' && result.diagnostic.data).toEqual({ name: 'f', depth: 1000 })
  })
})

describe('legal commands per state (§3.2)', () => {
  it('rejects input() outside the input state and every stepping command after done', () => {
    const { run } = startSource(main('Escribir 1;'))
    expect(() => run.input('x')).toThrow(/input/)
    expect(run.continue()).toEqual({ kind: 'done' })
    for (const command of [() => run.step(), () => run.stepOver(), () => run.stepOut(), () => run.continue()]) {
      expect(command).toThrow(/done/)
    }
    expect(() => run.setBreakpoints([1])).not.toThrow()
    expect(run.inspect()).toEqual([])
  })

  it('answers stepping commands in the input state by re-reporting the request', () => {
    const { run } = startSource(main('Definir n Como Entero;', 'Leer n;'))
    const request = run.continue()
    expect(run.step()).toEqual(request)
    expect(run.stepOver()).toEqual(request)
    expect(run.stepOut()).toEqual(request)
    expect(run.continue({ budget: 1 })).toEqual(request)
  })
})

describe('determinism', () => {
  const dice = main(
    'Definir i Como Entero;',
    'Para i <- 1 Hasta 5 Hacer',
    '  Escribir Sin Saltar Aleatorio(1, 6), " ";',
    'FinPara',
    'Escribir Azar();',
  )

  it('produces the same output for the same seed and a different one for another seed', () => {
    const a = startSource(dice, { random: seeded(1) })
    const b = startSource(dice, { random: seeded(1) })
    const c = startSource(dice, { random: seeded(2) })
    for (const { run } of [a, b, c]) expect(collectRun(run)).toEqual({ kind: 'done' })
    expect(a.output()).toBe(b.output())
    expect(a.output()).not.toBe(c.output())
    expect(a.output()).toMatch(/^([1-6] ){5}0\.\d+\n$/)
  })
})
```

If `Azar` is not the `es` profile's spelling of `random` (check `packages/profiles/src/profiles/es.json`, key `random`), use the first spelling listed there.

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/run.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/run` (and `test/helpers.ts` fails to import it).

- [ ] **Step 4: Write `packages/language/src/interpreter/run.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { MainBlock } from '../ast/index'
import type { CompileResult } from '../compile'
import { createDiagnostic, type Diagnostic } from '../diagnostics/index'
import { LineMap } from '../source/index'
import { type Type, typeToString } from '../types/type'
import {
  type CallEvent,
  type Context,
  type Event,
  frameForCall,
  type InputEvent,
  lineOf,
  runFrame,
} from './evaluate'
import { bodyScopeOf, createFrame, type Frame, inspectFrames, type RuntimeFrame } from './frame'
import { parseInput } from './input'
import { fail, RuntimeError, type RuntimeValue } from './value'

export interface RunOptions {
  readonly profile: ResolvedProfile
  readonly io: { write(text: string): void; clear?(): void }
  /** Default `Math.random`; returns `[0, 1)`. A seeded generator makes a run reproducible. */
  readonly random?: () => number
  /** `stackDepth` default 1000 (§4.2). */
  readonly limits?: { readonly stackDepth?: number }
}

export type RunState = 'ready' | 'paused' | 'input' | 'waiting' | 'done' | 'error'

export type PauseReason = 'step' | 'breakpoint' | 'budget'

/** §3.3. `paused` is reported before the statement at `line` executes. */
export type StepResult =
  | {
      readonly kind: 'paused'
      readonly reason: PauseReason
      readonly line: number
      readonly frames: Frame[]
    }
  | {
      readonly kind: 'input'
      readonly line: number
      /** The scalar being read and its static type; `null` for `Esperar Tecla`. */
      readonly target: { readonly name: string; readonly type: Type } | null
      /** The E4004 of the previous `input()`, when it did not parse. */
      readonly rejected?: Diagnostic
    }
  | { readonly kind: 'wait'; readonly line: number; readonly millis: number }
  | { readonly kind: 'done' }
  | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: Frame[] }

export type InputRequest = Omit<Extract<StepResult, { kind: 'input' }>, 'kind'>

/** §3.2. A command that is not legal in the current state throws a plain `Error`. */
export interface Run {
  readonly state: RunState
  /** One statement; enters calls. */
  step(): StepResult
  /** One statement; calls run to completion. */
  stepOver(): StepResult
  /** Until the current frame returns. */
  stepOut(): StepResult
  /** Until a breakpoint, or `budget` statements have executed. */
  continue(opts?: { readonly budget?: number }): StepResult
  /** Only legal in state `input`. */
  input(text: string): void
  /** Replaces the set. Legal in every state. */
  setBreakpoints(lines: Iterable<number>): void
  /** Innermost first. Legal in every state. */
  inspect(): Frame[]
}

export const DEFAULT_STACK_DEPTH = 1000

/**
 * §3.1. Refuses a program with an error-severity diagnostic, so the evaluator never meets an
 * `ErrorStmt`, an `ErrorExpr`, a second main or a misplaced subprogram. Builds the main frame
 * and executes nothing.
 */
export function start(program: CompileResult, options: RunOptions): Run {
  const error = program.diagnostics.find((one) => one.severity === 'error')
  if (error !== undefined) throw new Error(`cannot start a program with errors: ${error.code}`)
  const main = program.ast.main
  if (main === null) throw new Error('cannot start a program without a main block')
  return new Controller(program, main, options)
}

type FrameGenerator = Generator<Event, RuntimeValue | undefined, unknown>

/** §3.4: whether a pause event ends the current command, given the depth now and the pauses passed. */
type StopRule = (depth: number, passed: number) => PauseReason | null

interface Pending {
  readonly event: InputEvent
  rejected?: Diagnostic
}

class Controller implements Run {
  state: RunState = 'ready'
  private readonly ctx: Context
  private readonly stackDepth: number
  /** Index 0 is main; depth is `frames.length`. One generator per frame, innermost last. */
  private readonly frames: RuntimeFrame[] = []
  private readonly generators: FrameGenerator[] = []
  private breakpoints: ReadonlySet<number> = new Set()
  private pending: Pending | null = null
  private failure: Extract<StepResult, { kind: 'error' }> | null = null
  /** What the innermost generator receives on its next `next()`: a call's returned value. */
  private resumeWith: RuntimeValue | undefined = undefined
  /** The innermost generator is suspended at a pause event (not at an input or a wait). */
  private atPause = false
  /** The run has not yet reached the pause before the first statement. */
  private primed = false

  constructor(program: CompileResult, main: MainBlock, options: RunOptions) {
    const profile = options.profile
    this.ctx = {
      program,
      profile,
      indexBase: profile.options.indexBase,
      io: options.io,
      random: options.random ?? Math.random,
      lines: new LineMap(program.source),
    }
    this.stackDepth = options.limits?.stackDepth ?? DEFAULT_STACK_DEPTH
    const first = main.body[0]
    const frame = createFrame(bodyScopeOf(program, main), lineOf(this.ctx, first ?? main))
    this.frames.push(frame)
    this.generators.push(runFrame(this.ctx, frame))
  }

  step(): StepResult {
    return this.command('step', () => 'step')
  }

  stepOver(): StepResult {
    const depth = this.frames.length
    return this.command('stepOver', (now) => (now <= depth ? 'step' : null))
  }

  stepOut(): StepResult {
    const depth = this.frames.length
    return this.command('stepOut', (now) => (now < depth ? 'step' : null))
  }

  continue(opts: { readonly budget?: number } = {}): StepResult {
    const budget = opts.budget
    return this.command('continue', (_now, passed) =>
      budget !== undefined && passed >= budget ? 'budget' : null,
    )
  }

  input(text: string): void {
    const pending = this.pending
    if (this.state !== 'input' || pending === null) {
      throw new Error(`input is not legal in state ${this.state}`)
    }
    const target = pending.event.target
    if (target !== null) {
      const parsed = parseInput(text, target.type, this.ctx.profile)
      if (!parsed.ok) {
        pending.rejected = createDiagnostic('E4004', target.span, {
          name: target.name,
          type: typeToString(target.type, this.ctx.profile),
          text: parsed.text,
          hint: parsed.hint,
        })
        return
      }
      target.slot.value = parsed.value
    }
    this.pending = null
    this.state = 'paused'
    this.atPause = false
  }

  setBreakpoints(lines: Iterable<number>): void {
    this.breakpoints = new Set(lines)
  }

  inspect(): Frame[] {
    if (this.state === 'done') return []
    if (this.failure !== null) return this.failure.frames
    return inspectFrames(this.frames)
  }

  private innermost(): RuntimeFrame {
    const frame = this.frames[this.frames.length - 1]
    if (frame === undefined) throw new Error('the frame stack is empty')
    return frame
  }

  private command(name: string, rule: StopRule): StepResult {
    if (this.state === 'done' || this.state === 'error') {
      throw new Error(`${name} is not legal in state ${this.state}`)
    }
    if (this.state === 'input') return this.reportInput()
    try {
      return this.drive(rule)
    } catch (error) {
      if (!(error instanceof RuntimeError)) throw error
      this.failure = { kind: 'error', diagnostic: error.diagnostic, frames: inspectFrames(this.frames) }
      this.state = 'error'
      this.atPause = false
      return this.failure
    }
  }

  /**
   * §3.4, §3.5. Resumes the innermost generator and interprets events until one ends the
   * command. A pause point is counted when it is passed: resuming past the one the run is
   * sitting on counts, so `continue({ budget: 1 })` executes exactly one statement.
   */
  private drive(rule: StopRule): StepResult {
    let passed = 0
    if (!this.primed) {
      // The pause before the first statement is the position `ready` stands for (§3.1); it is
      // reached now, and passed like any other, so the first statement executes (§3.4).
      this.primed = true
      const first = this.advance()
      if (first === 'done') return this.finish()
      this.atPause = first.kind === 'pause'
    }
    if (this.atPause) passed++
    for (;;) {
      const event = this.advance()
      if (event === 'done') return this.finish()
      switch (event.kind) {
        case 'pause': {
          const reason = this.breakpoints.has(event.line)
            ? 'breakpoint'
            : rule(this.frames.length, passed)
          if (reason !== null) {
            this.state = 'paused'
            this.atPause = true
            return { kind: 'paused', reason, line: event.line, frames: this.inspect() }
          }
          passed++
          break
        }
        case 'input':
          this.state = 'input'
          this.atPause = false
          this.pending = { event }
          return this.reportInput()
        case 'wait':
          this.state = 'waiting'
          this.atPause = false
          return { kind: 'wait', line: this.innermost().line, millis: event.millis }
        case 'call':
          throw new Error('advance() consumes call events')
      }
    }
  }

  /**
   * Drives the innermost generator to its next event. A `call` event pushes the callee's
   * frame and generator and carries on; a finished generator pops its frame and hands its
   * value to the caller's generator. Only pause, input and wait events come out.
   */
  private advance(): Event | 'done' {
    for (;;) {
      const generator = this.generators[this.generators.length - 1]
      if (generator === undefined) return 'done'
      const result = generator.next(this.resumeWith)
      this.resumeWith = undefined
      if (result.done) {
        if (this.generators.length === 1) return 'done'
        this.generators.pop()
        this.frames.pop()
        this.resumeWith = result.value
        continue
      }
      const event = result.value
      if (event.kind === 'call') {
        this.enter(event)
        continue
      }
      if (event.kind === 'pause') this.innermost().line = event.line
      return event
    }
  }

  /** §5.5 steps 2 and 3: the depth limit, then the callee frame. */
  private enter(event: CallEvent): void {
    if (this.frames.length >= this.stackDepth) {
      fail('E4005', event.node.span, { name: event.node.callee.text, depth: this.stackDepth })
    }
    const frame = frameForCall(this.ctx, event)
    this.frames.push(frame)
    this.generators.push(runFrame(this.ctx, frame))
  }

  private finish(): StepResult {
    this.state = 'done'
    this.atPause = false
    return { kind: 'done' }
  }

  private reportInput(): StepResult {
    const pending = this.pending
    if (pending === null) throw new Error('no input request is pending')
    const target = pending.event.target
    const request = {
      kind: 'input' as const,
      line: this.innermost().line,
      target: target === null ? null : { name: target.name, type: target.type },
    }
    return pending.rejected === undefined ? request : { ...request, rejected: pending.rejected }
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/run.test.ts`
Expected: PASS, 23 tests.

- [ ] **Step 6: Write the failing runtime by-code suite `packages/language/test/interpreter/by-code.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { type Diagnostic, DIAGNOSTIC_CODES, formatDiagnostic } from '../../src/diagnostics/index'
import { allocateArray, RuntimeError } from '../../src/interpreter/value'
import { collectRun, type ProfileName, profileNamed, startSource } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

interface Case {
  readonly code: string
  /** A program that fails with exactly this code at runtime. */
  readonly source: string
  readonly inputs?: readonly string[]
  /** The source text the diagnostic must cover. */
  readonly text: string
  /** A neighbouring program that runs to `done` with the same inputs. */
  readonly clean: string
  readonly cleanInputs?: readonly string[]
  readonly profile?: ProfileName
}

const cases: Case[] = [
  {
    code: 'E4001',
    source: main('Definir a Como Entero[3];', 'Definir i Como Entero;', 'i <- 4;', 'a[i] <- 1;'),
    text: 'i',
    clean: main('Definir a Como Entero[3];', 'Definir i Como Entero;', 'i <- 3;', 'a[i] <- 1;', 'Escribir a[i];'),
  },
  {
    code: 'E4002',
    source: main('Definir n Como Entero;', 'Leer n;', 'Escribir 10 / n;'),
    inputs: ['0'],
    text: 'n',
    clean: main('Definir n Como Entero;', 'Leer n;', 'Escribir 10 / n;'),
    cleanInputs: ['5'],
  },
  {
    code: 'E4003',
    source: main('Definir total, i Como Entero;', 'Para i <- 1 Hasta 0 Hacer', '  total <- total + i;', 'FinPara', 'Escribir total;'),
    text: 'total',
    clean: main('Definir total, i Como Entero;', 'total <- 0;', 'Para i <- 1 Hasta 0 Hacer', '  total <- total + i;', 'FinPara', 'Escribir total;'),
  },
  {
    code: 'E4004',
    source: main('Definir edad Como Entero;', 'Leer edad;', 'Escribir edad;'),
    inputs: ['veinte'],
    text: 'edad',
    clean: main('Definir edad Como Entero;', 'Leer edad;', 'Escribir edad;'),
    cleanInputs: ['20'],
  },
  {
    code: 'E4005',
    source: [
      'Funcion r Como Entero <- cuenta(n Como Entero)',
      '  r <- cuenta(n + 1);',
      'FinFuncion',
      'Proceso p',
      '  Escribir cuenta(1);',
      'FinProceso',
    ].join('\n'),
    text: 'cuenta(n + 1)',
    clean: [
      'Funcion r Como Entero <- cuenta(n Como Entero)',
      '  Si n >= 10 Entonces',
      '    r <- n;',
      '  Sino',
      '    r <- cuenta(n + 1);',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir cuenta(1);',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E4006',
    source: [
      'Funcion r Como Entero <- mayor(a, b Como Entero)',
      '  Si a > b Entonces',
      '    r <- a;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n'),
    text: 'mayor',
    clean: [
      'Funcion r Como Entero <- mayor(a, b Como Entero)',
      '  Si a > b Entonces',
      '    r <- a;',
      '  Sino',
      '    r <- b;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E4007',
    source: main('Definir x Como Real;', 'Leer x;', 'Escribir RC(x);'),
    inputs: ['-4'],
    text: 'x',
    clean: main('Definir x Como Real;', 'Leer x;', 'Escribir RC(x);'),
    cleanInputs: ['4'],
  },
  {
    code: 'E4008',
    source: main('Definir i, paso Como Entero;', 'Leer paso;', 'Para i <- 1 Hasta 10 Con Paso paso Hacer', '  Escribir i;', 'FinPara'),
    inputs: ['0'],
    text: 'paso',
    clean: main('Definir i, paso Como Entero;', 'Leer paso;', 'Para i <- 1 Hasta 10 Con Paso paso Hacer', '  Escribir i;', 'FinPara'),
    cleanInputs: ['5'],
  },
]

/** The runtime diagnostic a run ends with: an `error` result, or the `rejected` of an input request (E4004). */
function diagnosticOf(source: string, inputs: readonly string[], profile: ProfileName): Diagnostic | undefined {
  const result = collectRun(startSource(source, { profileName: profile }).run, inputs)
  if (result.kind === 'error') return result.diagnostic
  if (result.kind === 'input') return result.rejected
  return undefined
}

describe('every runtime code has a case', () => {
  it('covers E4001–E4008', () => {
    const covered = [...new Set(cases.map((entry) => entry.code))].sort()
    const expected = DIAGNOSTIC_CODES.filter((code) => code.startsWith('E4'))
    expect(covered).toEqual([...expected].sort())
  })

  for (const entry of cases) {
    describe(entry.code, () => {
      const profile = entry.profile ?? 'es'

      it('is raised over the right text', () => {
        const diagnostic = diagnosticOf(entry.source, entry.inputs ?? [], profile)
        expect(diagnostic?.code).toBe(entry.code)
        expect(diagnostic && entry.source.slice(diagnostic.span.start, diagnostic.span.end)).toBe(entry.text)
      })

      it('renders in es and en with no unfilled slot', () => {
        const diagnostic = diagnosticOf(entry.source, entry.inputs ?? [], profile)
        expect(diagnostic).toBeDefined()
        if (diagnostic === undefined) return
        const spanish = formatDiagnostic(diagnostic, 'es', profileNamed(profile))
        const english = formatDiagnostic(diagnostic, 'en', profiles.en)
        expect(spanish).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(english).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(spanish.length).toBeGreaterThan(0)
        expect(english).not.toBe(spanish)
      })

      it('leaves the neighbouring program running to done', () => {
        const result = collectRun(
          startSource(entry.clean, { profileName: profile }).run,
          entry.cleanInputs ?? entry.inputs ?? [],
        )
        expect(result).toEqual({ kind: 'done' })
      })
    })
  }
})

describe('E4001.size', () => {
  // Unreachable from a compiled program (E3023 folds every size), so the allocator is called
  // directly (§8, §9).
  it('renders in es and en', () => {
    let diagnostic: Diagnostic | undefined
    try {
      allocateArray('integer', [0], { name: 'a', spans: [{ start: 0, end: 1 }] })
    } catch (error) {
      if (error instanceof RuntimeError) diagnostic = error.diagnostic
    }
    expect(diagnostic?.data).toEqual({ name: 'a', size: 0, hint: 'size' })
    if (diagnostic === undefined) return
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).not.toMatch(/\{[a-zA-Z$:]+\}/)
    expect(formatDiagnostic(diagnostic, 'en', profiles.en)).toContain('cannot have size 0')
  })
})
```

- [ ] **Step 7: Run it to verify it passes** (the implementation exists; this suite pins it)

Run: `pnpm vitest run --project stepcode test/interpreter/by-code.test.ts`
Expected: PASS, 26 tests. If a `clean` program draws a checker error, `startSource` throws with the code: fix the fixture, not the checker.

- [ ] **Step 8: Run lint, typecheck and the package suite, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm --filter stepcode test
git add packages/language/src/interpreter/run.ts packages/language/test/helpers.ts packages/language/test/interpreter/run.test.ts packages/language/test/interpreter/by-code.test.ts
git commit -m "feat(language): the run controller, stepping, breakpoints, input and the runtime by-code suite"
```

**Parallelism:** none — needs Task 6; Task 8 exports it.

---

### Task 8: `runProgram`, the barrel, the public API, README and changeset

**Files:**
- Create: `packages/language/src/interpreter/program.ts`
- Create: `packages/language/src/interpreter/index.ts`
- Modify: `packages/language/src/index.ts` (append after the `./diagnostics/index` exports, line 125)
- Modify: `packages/language/test/index.test.ts` (import block, lines 1–17; append two tests)
- Modify: `packages/language/README.md` (line 5; the `## API` table, lines 38–56; the runtime sentence at lines 112–114; a new `## Running` section before the closing `See docs …` paragraph at line 118)
- Create: `.changeset/language-interpreter.md`
- Test: `packages/language/test/interpreter/program.test.ts`

**Interfaces:**
- Consumes: `CompileResult` from `../compile`; `Diagnostic` from `../diagnostics/index`; `Frame` from `./frame`; `InputRequest`, `RunOptions`, `start` from `./run`.
- Produces:
  - `interface RunProgramOptions extends RunOptions { readonly io: { write(text: string): void; clear?(): void; read(request: InputRequest): Promise<string> }; readonly signal?: AbortSignal; readonly sleep?: (millis: number) => Promise<void>; readonly budget?: number }`
  - `type RunOutcome = { readonly kind: 'done' } | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: Frame[] } | { readonly kind: 'aborted' }`
  - `const DEFAULT_BUDGET = 10_000`
  - `function runProgram(program: CompileResult, options: RunProgramOptions): Promise<RunOutcome>`
  - `src/index.ts` exports `start`, `runProgram`, `renderValue`, `DEFAULT_STACK_DEPTH`, `DEFAULT_BUDGET` and the types `Run`, `RunOptions`, `RunState`, `PauseReason`, `StepResult`, `InputRequest`, `Frame`, `FrameVariable`, `RuntimeValue`, `Scalar`, `ArrayValue`, `RunProgramOptions`, `RunOutcome`.

- [ ] **Step 1: Write the failing test `packages/language/test/interpreter/program.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { DEFAULT_BUDGET, runProgram, type RunProgramOptions } from '../../src/interpreter/program'
import type { InputRequest } from '../../src/interpreter/run'
import { compileEs } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

interface Harness {
  readonly options: RunProgramOptions
  readonly output: () => string
  readonly requests: InputRequest[]
  readonly sleeps: number[]
  readonly cleared: () => number
}

function harness(inputs: readonly string[], extra: Partial<RunProgramOptions> = {}): Harness {
  const queue = [...inputs]
  const writes: string[] = []
  const requests: InputRequest[] = []
  const sleeps: number[] = []
  let cleared = 0
  const options: RunProgramOptions = {
    profile: profiles.es,
    io: {
      write: (text) => void writes.push(text),
      clear: () => {
        cleared++
      },
      read: (request) => {
        requests.push(request)
        const text = queue.shift()
        if (text === undefined) return Promise.reject(new Error('no input left'))
        return Promise.resolve(text)
      },
    },
    sleep: (millis) => {
      sleeps.push(millis)
      return Promise.resolve()
    },
    ...extra,
  }
  return { options, output: () => writes.join(''), requests, sleeps, cleared: () => cleared }
}

describe('runProgram (§3.6)', () => {
  it('runs to done, answering every input request through io.read', async () => {
    const program = compileEs(main('Definir a, b Como Entero;', 'Leer a, b;', 'Escribir a + b;'))
    const h = harness(['2', '3'])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.output()).toBe('5\n')
    expect(h.requests.map((request) => request.target?.name)).toEqual(['a', 'b'])
    expect(h.requests[0]?.rejected).toBeUndefined()
  })

  it('passes a rejected request back to io.read with rejected set, until it parses', async () => {
    const program = compileEs(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))
    const h = harness(['x', 'y', '4'])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.requests.map((request) => request.rejected?.code)).toEqual([undefined, 'E4004', 'E4004'])
    expect(h.requests[1]?.rejected?.data).toEqual({ name: 'n', type: 'Entero', text: 'x', hint: 'integer' })
    expect(h.output()).toBe('4\n')
  })

  it('answers Esperar Tecla through io.read too and ignores the text', async () => {
    const program = compileEs(main('Esperar Tecla;', 'Escribir "ok";'))
    const h = harness(['anything'])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.requests).toEqual([{ line: 2, target: null }])
    expect(h.output()).toBe('ok\n')
  })

  it('sleeps through options.sleep on Esperar and forwards Limpiar Pantalla', async () => {
    const program = compileEs(main('Limpiar Pantalla;', 'Esperar 120;', 'Escribir "x";'))
    const h = harness([])
    await runProgram(program, h.options)
    expect(h.sleeps).toEqual([120])
    expect(h.cleared()).toBe(1)
  })

  it('returns the error outcome with its frames', async () => {
    const program = compileEs(main('Definir a Como Entero[2];', 'Escribir a[3];'))
    const h = harness([])
    const outcome = await runProgram(program, h.options)
    expect(outcome.kind).toBe('error')
    if (outcome.kind !== 'error') return
    expect(outcome.diagnostic.code).toBe('E4001')
    expect(outcome.frames.map((frame) => frame.name)).toEqual(['p'])
  })

  it('yields to the event loop between budget slices', async () => {
    const program = compileEs(
      main('Definir i Como Entero;', 'Para i <- 1 Hasta 3 Hacer', '  Escribir i;', 'FinPara'),
    )
    const marks: string[] = []
    const h = harness([], { budget: 1 })
    setTimeout(() => marks.push('tick'), 0)
    const options: RunProgramOptions = {
      ...h.options,
      io: { ...h.options.io, write: (text) => void marks.push(text.trim()) },
    }
    await runProgram(program, options)
    // The tick was queued before the run started and the first slice ends before any output,
    // so the macrotask await lets it through first; without that await it would come last.
    expect(marks).toEqual(['tick', '1', '2', '3'])
  })

  it('defaults the budget to 10000 statements and still finishes a longer run', async () => {
    expect(DEFAULT_BUDGET).toBe(10_000)
    const program = compileEs(
      main('Definir i, s Como Entero;', 's <- 0;', 'Para i <- 1 Hasta 12000 Hacer', '  s <- s + 1;', 'FinPara', 'Escribir s;'),
    )
    const h = harness([])
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'done' })
    expect(h.output()).toBe('12000\n')
  })

  it('returns aborted without executing when the signal is already aborted', async () => {
    const program = compileEs(main('Escribir "never";'))
    const controller = new AbortController()
    controller.abort()
    const h = harness([], { signal: controller.signal })
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'aborted' })
    expect(h.output()).toBe('')
  })

  it('returns aborted after an await when the signal fires meanwhile, without throwing', async () => {
    const program = compileEs(main('Definir n Como Entero;', 'Leer n;', 'Escribir n;'))
    const controller = new AbortController()
    const h = harness([], {
      signal: controller.signal,
      io: {
        write: () => {},
        read: () => {
          controller.abort()
          return Promise.resolve('1')
        },
      },
    })
    await expect(runProgram(program, h.options)).resolves.toEqual({ kind: 'aborted' })
    expect(h.output()).toBe('')
  })

  it('refuses a program with errors the way start does', async () => {
    const broken = compile(main('Escribir x;'), { profile: profiles.es })
    const h = harness([])
    await expect(runProgram(broken, h.options)).rejects.toThrow(/E3001/)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/interpreter/program.test.ts`
Expected: FAIL — cannot resolve `../../src/interpreter/program`.

- [ ] **Step 3: Write `packages/language/src/interpreter/program.ts`**

```ts
import type { CompileResult } from '../compile'
import type { Diagnostic } from '../diagnostics/index'
import type { Frame } from './frame'
import { type InputRequest, type RunOptions, start } from './run'

export interface RunProgramOptions extends RunOptions {
  readonly io: {
    write(text: string): void
    clear?(): void
    /** Answers one input request; called again with `rejected` set when the text did not parse. */
    read(request: InputRequest): Promise<string>
  }
  /** Checked before every `continue` and after every `await`; an abort returns `aborted`. */
  readonly signal?: AbortSignal
  /** Default `setTimeout`. Tests pass a no-op. */
  readonly sleep?: (millis: number) => Promise<void>
  /** Statements per slice before yielding one macrotask to the host's event loop. */
  readonly budget?: number
}

export type RunOutcome =
  | { readonly kind: 'done' }
  | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: Frame[] }
  | { readonly kind: 'aborted' }

export const DEFAULT_BUDGET = 10_000

const timeout = (millis: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, millis)
  })

/**
 * §3.6: `start` plus a loop over `continue({ budget })`. A `budget` pause awaits one
 * macrotask so the host's event loop runs; an input request awaits `io.read`; a wait awaits
 * `sleep`. No breakpoints are set, so a `breakpoint` pause cannot occur. Never throws for an
 * abort; a program with errors throws from `start`, as a rejected promise.
 */
export async function runProgram(
  program: CompileResult,
  options: RunProgramOptions,
): Promise<RunOutcome> {
  const run = start(program, options)
  const sleep = options.sleep ?? timeout
  const budget = options.budget ?? DEFAULT_BUDGET
  const signal = options.signal
  const aborted = (): boolean => signal?.aborted === true
  for (;;) {
    if (aborted()) return { kind: 'aborted' }
    const result = run.continue({ budget })
    switch (result.kind) {
      case 'done':
        return { kind: 'done' }
      case 'error':
        return { kind: 'error', diagnostic: result.diagnostic, frames: result.frames }
      case 'paused':
        await timeout(0)
        break
      case 'input': {
        const request: InputRequest =
          result.rejected === undefined
            ? { line: result.line, target: result.target }
            : { line: result.line, target: result.target, rejected: result.rejected }
        const text = await options.io.read(request)
        if (aborted()) return { kind: 'aborted' }
        run.input(text)
        break
      }
      case 'wait':
        await sleep(result.millis)
        break
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/interpreter/program.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Write the barrel `packages/language/src/interpreter/index.ts`**

```ts
export type { Frame, FrameVariable } from './frame'
export type { RunOutcome, RunProgramOptions } from './program'
export { DEFAULT_BUDGET, runProgram } from './program'
export { renderValue } from './render'
export type { InputRequest, PauseReason, Run, RunOptions, RunState, StepResult } from './run'
export { DEFAULT_STACK_DEPTH, start } from './run'
export type { ArrayValue, RuntimeValue, Scalar } from './value'
```

- [ ] **Step 6: Write the failing public-API tests — extend `packages/language/test/index.test.ts`**

Add `BOOLEAN`, `renderValue`, `runProgram`, `start` to the import list from `'../src/index'`. Append inside `describe('stepcode', …)`:

```ts
  it('exports the interpreter', () => {
    expect(typeof start).toBe('function')
    expect(typeof runProgram).toBe('function')
    expect(typeof renderValue).toBe('function')
    expect(renderValue(true, BOOLEAN, profiles.es)).toBe('Verdadero')
  })

  it('runs a program end to end through compile and runProgram with a stub io', async () => {
    const source = [
      'Proceso saluda',
      '  Definir nombre Como Cadena;',
      '  Escribir "Nombre:";',
      '  Leer nombre;',
      '  Escribir "Hola, ", nombre;',
      'FinProceso',
    ].join('\n')
    const program = compile(source, { profile: profiles.es })
    const writes: string[] = []
    const outcome = await runProgram(program, {
      profile: profiles.es,
      io: { write: (text) => void writes.push(text), read: () => Promise.resolve('Ada') },
      sleep: () => Promise.resolve(),
    })
    expect(outcome).toEqual({ kind: 'done' })
    expect(writes.join('')).toBe('Nombre:\nHola, Ada\n')
  })
```

- [ ] **Step 7: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/index.test.ts`
Expected: FAIL — `start`, `runProgram`, `renderValue` are not exported from `../src/index`.

- [ ] **Step 8: Export from `packages/language/src/index.ts`**

Append after the `./diagnostics/index` export block (line 125):

```ts
export type {
  ArrayValue,
  Frame,
  FrameVariable,
  InputRequest,
  PauseReason,
  Run,
  RunOptions,
  RunOutcome,
  RunProgramOptions,
  RunState,
  RuntimeValue,
  Scalar,
  StepResult,
} from './interpreter/index'
export {
  DEFAULT_BUDGET,
  DEFAULT_STACK_DEPTH,
  renderValue,
  runProgram,
  start,
} from './interpreter/index'
```

Also update the doc comment on `packageName`'s neighbours if any mention "the interpreter arrives later"; `src/index.ts` has none today.

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm vitest run --project stepcode test/index.test.ts`
Expected: PASS.

- [ ] **Step 10: Update `packages/language/README.md`**

Line 5: replace `The checker and `compile()` are here too; the interpreter arrives in the next release.` with `The checker, `compile()` and the steppable interpreter are here too.`

In the `## API` table, append after the `fold(expr, constants)` row:

```markdown
| `start(program, { profile, io, random?, limits? })` | a `Run`: `step`, `stepOver`, `stepOut`, `continue({ budget })`, `input`, `setBreakpoints`, `inspect` |
| `runProgram(program, { profile, io, signal?, sleep?, budget? })` | `Promise<{ kind: 'done' \| 'error' \| 'aborted' }>` — the controller driven to the end |
| `renderValue(value, type, profile)` | `Escribir`'s rendering of one value: `2`, `2.5`, `Verdadero`, `hola` |
```

Replace the paragraph at lines 112–114 (`Diagnostic ranges: … not this package's business yet.`) with:

```markdown
Diagnostic ranges: `E1xxx` lexer, `E2xxx` parser, `E3001`–`E3037` checker, `W3001`–`W3004`
checker warnings, `E4001`–`E4008` runtime: index out of range, division by zero, a value read
before it was assigned, an input that does not parse, stack depth, a function ending without a
result, a builtin argument outside its domain, and a `Para` step of zero.
```

Insert a `## Running` section before the closing `See docs/superpowers/specs/…` paragraph:

````markdown
## Running

`start(program, options)` turns a clean `CompileResult` into a `Run` that executes one
statement per `step()`. Every statement is a pause point, loops pause on their own line before
every test, and a user call opens a frame the controller drives itself — so breakpoints,
stepping, `inspect()` and input are one mechanism, with no promise inside the evaluator:

```ts
import { compile, start } from 'stepcode'
import { profiles } from '@stepcode/profiles'

const program = compile(source, { profile: profiles.es })
const run = start(program, { profile: profiles.es, io: { write: (text) => process.stdout.write(text) } })
run.setBreakpoints([12])
let result = run.continue()
while (result.kind !== 'done' && result.kind !== 'error') {
  if (result.kind === 'input') run.input(await ask(result.target?.name ?? 'key'))
  else if (result.kind === 'wait') await new Promise((r) => setTimeout(r, result.millis))
  else console.log(result.reason, result.line, result.frames[0]?.variables)
  result = run.continue()
}
```

A `StepResult` is `paused` (before the statement at `line`, with `reason` `step`, `breakpoint`
or `budget` and the frames innermost first), `input` (a `Leer` target with its name and static
type, or `null` for `Esperar Tecla`; `rejected` carries the E4004 of a text that did not parse),
`wait` (an `Esperar`), `done` or `error` (the diagnostic and the frames at the failure, which
`inspect()` keeps returning).

`runProgram(program, options)` drives that loop for you: `io.read(request)` answers input
requests, `sleep` handles `Esperar`, `budget` (default 10 000 statements) is how often it
yields to the event loop, and an `AbortSignal` returns `{ kind: 'aborted' }`. Pass a seeded
`random` and the same inputs and a run is reproducible to the byte.

Values are what JavaScript gives: `Entero` and `Real` are numbers (`4 / 2` prints `2`,
`7 / 2` prints `3.5`, `Redondear(-1.5)` is `-2`), text is a string, `Logico` a boolean
rendered as the profile's `Verdadero` / `Falso`, arrays one flat buffer shared by reference.
Unassigned is unassigned: reading it is E4003, not `0`.
````

- [ ] **Step 11: Write `.changeset/language-interpreter.md`**

```markdown
---
'stepcode': minor
---

The interpreter: `start(program, options)` returns a resumable `Run` that executes one
statement per step, with breakpoints, `stepOver` / `stepOut`, a statement budget, frame
inspection and input as step results; `runProgram(program, options)` drives it to the end
with async input, sleep and an `AbortSignal`. Runtime errors are E4001–E4008 in Spanish and
English. `compile` now returns the checker's side tables and the source, and the corpus
programs gain `.run.json` sidecars pinning their output for given inputs.
```

`.changeset/language-checker.md` stays as it is: the repository keeps one changeset per sub-spec (`language-syntax.md`, `language-checker.md`), all `minor`, released together.

- [ ] **Step 12: Run everything, then commit**

```bash
pnpm lint:fix && pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm changeset status
```

Expected: lint 0; typecheck silent; `dist/index.js` and `dist/index.d.ts` rebuilt for `stepcode`; every test green; `stepcode` listed as `minor`. Then:

```bash
node -e "import('./packages/language/dist/index.js').then(async (m) => { const { profiles } = await import('@stepcode/profiles'); const p = m.compile('Proceso p\n  Definir n Como Entero;\n  Leer n;\n  Escribir n * 2;\nFinProceso', { profile: profiles.es }); const out = await m.runProgram(p, { profile: profiles.es, io: { write: (t) => process.stdout.write(t), read: async () => '21' } }); console.log(out) })"
```

Expected: prints `42` then `{ kind: 'done' }`.

```bash
git add packages/language/src packages/language/test packages/language/README.md .changeset/language-interpreter.md
git commit -m "feat(language): runProgram, the public interpreter API, docs and the changeset"
```

**Parallelism:** none — needs Task 7; Task 9 uses `runProgram`.

---

### Task 9: run sidecars for `programs/` — harness, `extract-runs.ts`, README, the withdrawn `a[-1]` programs

**Files:**
- Create: `packages/language/scripts/run-source.ts`
- Create: `packages/language/scripts/extract-runs.ts`
- Create: `packages/language/scripts/record-run.ts`
- Create: `packages/language/test/corpus/run.test.ts`
- Modify: `packages/language/test/helpers.ts` (append `SidecarRun`, `Sidecar`, `corpusDirs`, `sidecarPath`, `readSidecar`, `runSidecar`; export `corpusDir` as `corpusDirs.programs`)
- Create: `packages/language/test/corpus/programs/<slug>.run.json`, one per program (generated by the script, reviewed by a human)
- Delete: `packages/language/test/corpus/programs/test-reverse-indexing.stepcode`, `packages/language/test/corpus/programs/test-reverse-indexing-2.stepcode`
- Modify: `packages/language/test/corpus/programs/README.md` (append a `## Runtime expectations (sub-spec C)` section; add two rows to the `### Withdrawn` table at lines 121–125)
- Modify: `packages/language/test/interpreter/by-code.test.ts` (two more `E4001` cases in `cases`)

**Interfaces:**
- Consumes: `compile`, `runProgram`, `RunOutcome`, `InputRequest` from `../src/index`; `seeded`, `profileNamed`, `corpusIndexBaseZero` from `../test/helpers`.
- Produces:
  - `scripts/run-source.ts`: `interface RunReport { readonly outcome: RunOutcome | { kind: 'compile-error'; codes: string[] } | { kind: 'input-exhausted'; requests: number } | { kind: 'input-rejected'; name: string; text: string }; readonly output: string; readonly requests: number }`; `function runSource(source: string, profile: ResolvedProfile, inputs: readonly string[], seed: number | undefined, repeat?: boolean): Promise<RunReport>`; `function usesRandom(source: string): boolean`.
  - `scripts/extract-runs.ts`: the one-off extractor (§8.2), run from the repo root.
  - `scripts/record-run.ts`: `record-run <programs|guides> <slug> [--name <text>] [--seed <n>] [--replace] [--input <text>]…` — runs the program once and appends the run to its sidecar (§8.2, §8.3).
  - Test helpers: `interface SidecarRun { readonly name?: string; readonly inputs: readonly string[]; readonly output: string; readonly seed?: number }`; `interface Sidecar { readonly runs: readonly SidecarRun[] }`; `const corpusDirs: { readonly programs: string; readonly guides: string }`; `function sidecarPath(dir: string, slug: string): string`; `function readSidecar(dir: string, slug: string): Sidecar | undefined`; `async function runSidecar(source: string, profile: ResolvedProfile, run: SidecarRun): Promise<{ outcome: RunOutcome; output: string }>` — throws a plain `Error` on a request past the end of `inputs` or on a rejected request.

- [ ] **Step 1: Add the sidecar helpers to `packages/language/test/helpers.ts`**

Merge `import { runProgram, type RunOutcome } from '../src/interpreter/program'` into the import block. Replace the line `const corpusDir = fileURLToPath(new URL('./corpus/programs', import.meta.url))` with:

```ts
/** Where the two corpora live; every sidecar sits beside its program. */
export const corpusDirs = {
  programs: fileURLToPath(new URL('./corpus/programs', import.meta.url)),
  guides: fileURLToPath(new URL('./corpus/guides', import.meta.url)),
} as const

const corpusDir = corpusDirs.programs
```

Then append at the end of the file:

```ts
/** One entry of a `<slug>.run.json` (interpreter spec §8.1). */
export interface SidecarRun {
  readonly name?: string
  /** The answers to the input requests, in order; `Esperar Tecla` consumes one like any other. */
  readonly inputs: readonly string[]
  /** The exact concatenation of every `io.write`. */
  readonly output: string
  /** Required when the program calls `Azar` or `Aleatorio`: the mulberry32 seed. */
  readonly seed?: number
}

export interface Sidecar {
  readonly runs: readonly SidecarRun[]
}

export function sidecarPath(dir: string, slug: string): string {
  return join(dir, `${slug}.run.json`)
}

/** The sidecar of one program, or `undefined` when it has none. A malformed one throws. */
export function readSidecar(dir: string, slug: string): Sidecar | undefined {
  const path = sidecarPath(dir, slug)
  if (!existsSync(path)) return undefined
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as Sidecar).runs)) {
    throw new Error(`${path} is not a { runs: [...] } sidecar`)
  }
  for (const run of (parsed as Sidecar).runs) {
    if (!Array.isArray(run.inputs) || typeof run.output !== 'string') {
      throw new Error(`${path}: every run needs inputs: string[] and output: string`)
    }
  }
  return parsed as Sidecar
}

/**
 * One sidecar run through `runProgram`: a no-op sleep, an `io` that appends to a buffer and
 * answers `read` from `inputs`. A request past the end of `inputs` and a rejected request both
 * throw, because a sidecar that does not answer its program is wrong (§8.1).
 */
export async function runSidecar(
  source: string,
  profile: ResolvedProfile,
  run: SidecarRun,
): Promise<{ outcome: RunOutcome; output: string }> {
  const program = compile(source, { profile })
  let output = ''
  let next = 0
  const outcome = await runProgram(program, {
    profile,
    io: {
      write: (text) => {
        output += text
      },
      read: (request) => {
        if (request.rejected !== undefined) {
          return Promise.reject(
            new Error(`input ${next} was rejected for ${request.target?.name ?? 'key'} (E4004)`),
          )
        }
        const text = run.inputs[next]
        next++
        if (text === undefined) {
          return Promise.reject(new Error(`the program asked for input ${next} but the sidecar has ${run.inputs.length}`))
        }
        return Promise.resolve(text)
      },
    },
    sleep: () => Promise.resolve(),
    ...(run.seed === undefined ? {} : { random: seeded(run.seed) }),
  })
  return { outcome, output }
}
```

Add `existsSync` to the `node:fs` import.

- [ ] **Step 2: Write the failing harness `packages/language/test/corpus/run.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { corpusDirs, corpusPrograms, profileNamed, readSidecar, runSidecar } from '../helpers'

describe('the conformance corpus runs (§8.1)', () => {
  for (const program of corpusPrograms()) {
    const sidecar = readSidecar(corpusDirs.programs, program.slug)
    if (sidecar === undefined) {
      it(`${program.file} has a run sidecar`, () => {
        throw new Error(`${program.slug}.run.json is missing: the corpus is complete or it is not`)
      })
      continue
    }
    sidecar.runs.forEach((run, index) => {
      const title = run.name ?? `run ${index + 1}`
      it(`${program.file} · ${title} produces its recorded output`, async () => {
        const profile = profileNamed(program.profileName)
        const { outcome, output } = await runSidecar(program.source, profile, run)
        expect(outcome).toEqual({ kind: 'done' })
        expect(output).toBe(run.output)
      })
    })
  }
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project stepcode test/corpus/run.test.ts`
Expected: FAIL — one `has a run sidecar` failure per program (138 now, 136 after the two withdrawals below).

- [ ] **Step 4: Write `packages/language/scripts/run-source.ts`**

```ts
/**
 * The shared runner behind `extract-runs.ts` and `record-run.ts`: one program, one profile, a
 * fixed list of answers, an optional seed. It is what the corpus harness does in
 * `test/helpers.ts` (`runSidecar`), with the failure modes reported instead of thrown, so a
 * script can print them for the reviewer.
 */
import type { ResolvedProfile } from '@stepcode/profiles'
import { compile, type RunOutcome, runProgram } from '../src/index'
import { seeded } from '../test/helpers'

export type RunProblem =
  | { readonly kind: 'compile-error'; readonly codes: string[] }
  | { readonly kind: 'input-exhausted'; readonly requests: number }
  | { readonly kind: 'input-rejected'; readonly name: string; readonly text: string }

export interface RunReport {
  readonly outcome: RunOutcome | RunProblem
  readonly output: string
  /** How many input requests the program made before it ended. */
  readonly requests: number
}

/** `Azar(` / `Aleatorio(`: the program consumes `options.random`, so a run needs a seed. */
export function usesRandom(source: string): boolean {
  return /\b(?:Azar|Aleatorio)\s*\(/i.test(source)
}

/**
 * `repeat` answers every request with the last input — v1 tests written as
 * `resolve('1.5')` answered every request with one literal, and the extractor learns how
 * many answers that took from `requests`.
 */
export async function runSource(
  source: string,
  profile: ResolvedProfile,
  inputs: readonly string[],
  seed: number | undefined,
  repeat = false,
): Promise<RunReport> {
  const program = compile(source, { profile })
  const errors = program.diagnostics.filter((one) => one.severity === 'error')
  if (errors.length > 0) {
    return { outcome: { kind: 'compile-error', codes: errors.map((one) => one.code) }, output: '', requests: 0 }
  }
  let output = ''
  let requests = 0
  // A holder, not a `let`: TypeScript does not see an assignment made inside `read`.
  const state: { problem: RunProblem | null } = { problem: null }
  const controller = new AbortController()
  const outcome = await runProgram(program, {
    profile,
    io: {
      write: (text) => {
        output += text
      },
      read: (request) => {
        if (request.rejected !== undefined) {
          state.problem = {
            kind: 'input-rejected',
            name: request.target?.name ?? 'key',
            text: String(request.rejected.data.text ?? ''),
          }
          controller.abort()
          return Promise.resolve('')
        }
        const text = repeat ? inputs[Math.min(requests, inputs.length - 1)] : inputs[requests]
        requests++
        if (text === undefined) {
          state.problem = { kind: 'input-exhausted', requests }
          controller.abort()
          return Promise.resolve('')
        }
        return Promise.resolve(text)
      },
    },
    sleep: () => Promise.resolve(),
    signal: controller.signal,
    ...(seed === undefined ? {} : { random: seeded(seed) }),
  })
  return { outcome: state.problem ?? outcome, output, requests }
}
```

- [ ] **Step 5: Write `packages/language/scripts/extract-runs.ts`**

```ts
/**
 * One-off: turns the StepCode v1 test expectations into `<slug>.run.json` sidecars beside the
 * corpus programs (interpreter spec §8.2). `extract-corpus.ts` is NOT re-run — the checker
 * rewrites of sub-spec B were applied by hand on top of its output and would be lost — but the
 * slug rule is the same, so each v1 test lands beside the program it exercised.
 *
 * Run once from the repo root, review every sidecar it wrote, then commit:
 *   node --experimental-transform-types --conditions=development packages/language/scripts/extract-runs.ts
 *
 * Per v1 test it collects the input list, every asserted `output-request` string, every negated
 * one and `toBeCalledTimes(n)`; runs the v2 program with those inputs (seed 1 when it uses
 * `Azar` / `Aleatorio`); writes the produced output; and prints every assertion it could not
 * confirm. The v1 → v2 mapping is line-based: v1 emitted one `output-request` per `Escribir`
 * with no newline, v2 emits the same text plus `\n`, so each asserted string must equal one
 * line of the v2 output. v1 printed booleans as `true` / `false`; those two strings are
 * rewritten to `Verdadero` / `Falso` before comparing, and the programs it touched are listed.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { corpusIndexBaseZero, profileNamed, type SidecarRun } from '../test/helpers'
import { runSource, usesRandom } from './run-source'

const root = fileURLToPath(new URL('../test/corpus', import.meta.url))
const v1 = join(root, 'v1')
const out = join(root, 'programs')

const BLOCK = /\b(test|it|describe)\(\s*(['"])([\s\S]*?)\2/g
const PROGRAM = /`([^`]*)`/g
const LOOKS_LIKE_PROGRAM =
  /^\s*(?:\$|Proceso|Algoritmo|SubProceso|SubAlgoritmo|Procedimiento|Funcion)\b/im
const EXPECTATION =
  /(\.not)?\.toHaveBeenCalledWith\(\s*'output-request'\s*,\s*(['"])((?:\\.|(?!\2).)*)\2\s*\)/g
const COMPUTED = /toHaveBeenCalledWith\(\s*'output-request'\s*,\s*(?!['"])[^\n]*/g
const TIMES = /toBeCalledTimes\((\d+)\)/
const INPUT_LIST = /const\s+inputs?\s*=\s*\[([\s\S]*?)\]/
const INPUT_IMPORTED = /resolve\(\s*([A-Za-z_]\w*)\[i\+\+\]/
const INPUT_LITERAL = /resolve\(\s*(['"])((?:\\.|(?!\1).)*)\1\s*\)/
const PROGRAM_REF = /internalInterpret\(\s*([A-Za-z_]\w*Program)\b/

function unescapeLiteral(text: string): string {
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
      .replace(/[̀-ͯ]/g, '')
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

/** `[1, 2, 'x']` with `//` comments → `['1', '2', 'x']`, stringified as v1's `toString()` did. */
function parseList(text: string): string[] {
  return text
    .replace(/\/\/[^\n]*/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const quoted = /^(['"])(.*)\1$/.exec(item)
      if (quoted?.[2] !== undefined) return unescapeLiteral(quoted[2])
      return Number.isNaN(Number(item)) ? item : String(Number(item))
    })
}

interface Block {
  readonly kind: string
  readonly title: string
  readonly body: string
}

function blocksOf(source: string): Block[] {
  const found: { kind: string; title: string; start: number }[] = []
  BLOCK.lastIndex = 0
  for (let match = BLOCK.exec(source); match !== null; match = BLOCK.exec(source)) {
    found.push({ kind: match[1] ?? 'test', title: match[3] ?? '', start: match.index })
  }
  return found.map((entry, index) => ({
    kind: entry.kind,
    title: entry.title,
    body: source.slice(entry.start, found[index + 1]?.start ?? source.length),
  }))
}

function programLiteralOf(body: string): string | undefined {
  PROGRAM.lastIndex = 0
  for (let match = PROGRAM.exec(body); match !== null; match = PROGRAM.exec(body)) {
    const literal = match[1]
    if (literal !== undefined && LOOKS_LIKE_PROGRAM.test(literal)) return literal
  }
  return undefined
}

interface Expectation {
  readonly name: string
  readonly inputs: string[]
  readonly repeat: boolean
  readonly lines: string[]
  readonly absent: string[]
  readonly times: number | null
  readonly computed: string[]
}

const BOOLEANS: Record<string, string> = { true: 'Verdadero', false: 'Falso' }
const booleanRewrites = new Set<string>()

function expectationOf(block: Block, slug: string, imported: ReadonlyMap<string, string[]>): Expectation {
  const body = block.body
  let inputs: string[] = []
  let repeat = false
  const list = INPUT_LIST.exec(body)
  const named = INPUT_IMPORTED.exec(body)
  const literal = INPUT_LITERAL.exec(body)
  if (list?.[1] !== undefined) inputs = parseList(list[1])
  else if (named?.[1] !== undefined && imported.has(named[1])) inputs = imported.get(named[1]) ?? []
  else if (literal?.[2] !== undefined) {
    inputs = [unescapeLiteral(literal[2])]
    repeat = true
  }
  const lines: string[] = []
  const absent: string[] = []
  EXPECTATION.lastIndex = 0
  for (let match = EXPECTATION.exec(body); match !== null; match = EXPECTATION.exec(body)) {
    let text = unescapeLiteral(match[3] ?? '')
    const rewritten = BOOLEANS[text]
    if (rewritten !== undefined) {
      text = rewritten
      booleanRewrites.add(slug)
    }
    if (match[1] === undefined) lines.push(text)
    else absent.push(text)
  }
  const computed = [...body.matchAll(COMPUTED)].map((match) => match[0].trim())
  const times = TIMES.exec(body)
  return {
    name: block.title,
    inputs,
    repeat,
    lines,
    absent,
    times: times?.[1] === undefined ? null : Number(times[1]),
    computed,
  }
}

// The two `v1/programs/*.program.ts` files export a program literal and, for one of them, the
// input arrays `examples.v1.ts` imports.
const importedPrograms = new Map<string, string>()
const importedInputs = new Map<string, string[]>()
const programsDir = join(v1, 'programs')
for (const file of readdirSync(programsDir).filter((name) => name.endsWith('.ts')).sort()) {
  const source = readFileSync(join(programsDir, file), 'utf8')
  for (const match of source.matchAll(/export const (\w+)\s*=\s*\[([\s\S]*?)\]/g)) {
    if (match[1] !== undefined && match[2] !== undefined) importedInputs.set(match[1], parseList(match[2]))
  }
  const literal = /export const (\w+)\s*=\s*`/.exec(source)
  if (literal?.[1] !== undefined) {
    importedPrograms.set(literal[1], basename(file).replace(/\.(program\.)?ts$/, ''))
  }
}

const runsBySlug = new Map<string, Expectation[]>()
function addRun(slug: string, expectation: Expectation): void {
  const runs = runsBySlug.get(slug) ?? []
  runs.push(expectation)
  runsBySlug.set(slug, runs)
}

for (const file of readdirSync(v1).filter((name) => name.endsWith('.v1.ts')).sort()) {
  const source = readFileSync(join(v1, file), 'utf8')
  let current: string | undefined
  for (const block of blocksOf(source)) {
    if (programLiteralOf(block.body) !== undefined) current = uniqueSlug(block.title)
    if (block.kind === 'describe') continue
    const ref = PROGRAM_REF.exec(block.body)
    const slug = ref?.[1] !== undefined ? importedPrograms.get(ref[1]) : current
    if (slug === undefined) continue
    addRun(slug, expectationOf(block, slug, importedInputs))
  }
}
// Keep the slug numbering aligned with extract-corpus.ts, which emitted these last.
for (const slug of importedPrograms.values()) uniqueSlug(slug)

const zeroBased = new Set(corpusIndexBaseZero())
let written = 0
let mismatches = 0
const unconfirmed: string[] = []
const withoutExpectation: string[] = []

for (const [slug, expectations] of [...runsBySlug].sort(([a], [b]) => (a < b ? -1 : 1))) {
  const file = join(out, `${slug}.stepcode`)
  if (!existsSync(file)) {
    console.log(`withdrawn: ${slug} (no program file)`)
    continue
  }
  const source = readFileSync(file, 'utf8')
  const profile = profileNamed(zeroBased.has(slug) ? 'es0' : 'es')
  const seed = usesRandom(source) ? 1 : undefined
  const runs: SidecarRun[] = []
  for (const expectation of expectations) {
    const report = await runSource(source, profile, expectation.inputs, seed, expectation.repeat)
    if (report.outcome.kind !== 'done') {
      mismatches++
      console.log(`${slug} · ${expectation.name}: ${JSON.stringify(report.outcome)}`)
      continue
    }
    const lines = report.output.split('\n')
    if (lines[lines.length - 1] === '') lines.pop()
    for (const line of expectation.lines) {
      if (!lines.includes(line)) {
        mismatches++
        console.log(`${slug} · ${expectation.name}: expected a line ${JSON.stringify(line)}, got ${JSON.stringify(lines)}`)
      }
    }
    for (const line of expectation.absent) {
      if (lines.includes(line)) {
        mismatches++
        console.log(`${slug} · ${expectation.name}: did not expect a line ${JSON.stringify(line)}`)
      }
    }
    if (expectation.times !== null && lines.length !== expectation.times) {
      mismatches++
      console.log(`${slug} · ${expectation.name}: expected ${expectation.times} lines, got ${lines.length}`)
    }
    for (const computed of expectation.computed) unconfirmed.push(`${slug} · ${expectation.name}: ${computed}`)
    if (expectation.lines.length === 0 && expectation.times === null) withoutExpectation.push(`${slug} · ${expectation.name}`)
    const inputs = expectation.repeat
      ? Array.from({ length: report.requests }, () => expectation.inputs[0] ?? '')
      : expectation.inputs
    runs.push({
      name: expectation.name,
      inputs,
      output: report.output,
      ...(seed === undefined ? {} : { seed }),
    })
  }
  if (runs.length === 0) continue
  writeFileSync(join(out, `${slug}.run.json`), `${JSON.stringify({ runs }, null, 2)}\n`, 'utf8')
  written++
}

const programs = readdirSync(out).filter((name) => name.endsWith('.stepcode'))
const missing = programs.filter((name) => !existsSync(join(out, name.replace('.stepcode', '.run.json'))))
console.log(`\n${written} sidecars written, ${mismatches} mismatches`)
console.log(`boolean rewrite (true/false → Verdadero/Falso) touched: ${[...booleanRewrites].sort().join(', ') || 'none'}`)
console.log(`computed expectations to confirm by hand:\n  ${unconfirmed.join('\n  ') || 'none'}`)
console.log(`runs recorded with no v1 assertion (review the output):\n  ${withoutExpectation.join('\n  ') || 'none'}`)
console.log(`programs still without a sidecar (record them with scripts/record-run.ts):\n  ${missing.join('\n  ') || 'none'}`)
```

- [ ] **Step 6: Withdraw the two `a[-1]` programs and pin them in the by-code suite**

```bash
git rm packages/language/test/corpus/programs/test-reverse-indexing.stepcode packages/language/test/corpus/programs/test-reverse-indexing-2.stepcode
```

Add to `cases` in `packages/language/test/interpreter/by-code.test.ts`, after the first `E4001` entry:

```ts
  {
    // v1's `arrays.v1.ts` "test reverse indexing" read `a[-1]` of an array and got its last
    // cell; under §5.4 a negative index is simply out of range, so the program left the
    // corpus (§8.2) and lives here.
    code: 'E4001',
    source: main('Definir a, b Como Entero;', 'Dimension a[3];', 'a[1] <- 1;', 'a[2] <- 2;', 'a[3] <- 3;', 'b <- a[-1];', 'Escribir b;'),
    text: '-1',
    clean: main('Definir a, b Como Entero;', 'Dimension a[3];', 'a[1] <- 1;', 'a[2] <- 2;', 'a[3] <- 3;', 'b <- a[3];', 'Escribir b;'),
  },
  {
    // The same for `strings.v1.ts`: `"Hola"[-1]` was `a` in v1.
    code: 'E4001',
    source: main('Definir a, b Como Cadena;', 'a <- "Hola";', 'b <- a[-1];', 'Escribir b;'),
    text: '-1',
    clean: main('Definir a, b Como Cadena;', 'a <- "Hola";', 'b <- a[4];', 'Escribir b;'),
  },
```

Run: `pnpm vitest run --project stepcode test/interpreter/by-code.test.ts test/corpus/check.test.ts test/corpus/parse.test.ts test/checker/side-tables.test.ts test/checker/one-mistake.test.ts`
Expected: PASS — the corpus tests simply see two programs fewer.

- [ ] **Step 7: Run the extractor and review**

```bash
node --experimental-transform-types --conditions=development packages/language/scripts/extract-runs.ts
```

Expected output: about 120 sidecars written; the mismatch list contains exactly `test-round · test round: expected a line "-1"` (§8.2's one documented divergence: v2 prints `-2`) — any other mismatch is a bug in the interpreter or in the extractor and is fixed before going on, with a test added to the file that owns the behaviour; the computed-expectation list names the three `arithmetic-operations` tests written as `(2 * 3 / 5).toString()` and the like, plus `internal-functions`' `expect.stringMatching(/^0\.\d+$/)` for `test-random`; the boolean-rewrite line names the `boolean-operations`, `relational-operations` and `mixboolean-expressions` program families; the "still without a sidecar" list names the programs no v1 test asserted against (recorded in Step 9).

Review by hand, and record the result in the README of Step 10:
- Every computed expectation: evaluate the JS expression (`(2 * 3 / 5).toString()` is `1.2`) and confirm it is a line of the sidecar's `output`.
- `test-random.run.json`: the output must match `/^0\.\d+\n$/` under seed 1.
- Open every sidecar whose run had no v1 assertion and read the output against the program.

- [ ] **Step 8: Run the harness to verify the recorded programs pass**

Run: `pnpm vitest run --project stepcode test/corpus/run.test.ts`
Expected: every recorded run passes; only `has a run sidecar` failures remain, for the programs the extractor listed as still without one.

- [ ] **Step 9: Write `packages/language/scripts/record-run.ts` and record the programs without a v1 assertion**

```ts
/**
 * Records one run of a corpus program into its `<slug>.run.json` sidecar (interpreter spec
 * §8.2, §8.3). The interpreter produces the output; a human reads it against the program
 * before committing. From the repo root:
 *
 *   node --experimental-transform-types --conditions=development packages/language/scripts/record-run.ts \
 *     <programs|guides> <slug> [--name <text>] [--seed <n>] [--replace] [--input <text>]...
 *
 * `--input` repeats, one per input request in order (`Esperar Tecla` takes one too). `--seed`
 * is required when the program calls `Azar` or `Aleatorio` (default 1 then). `--replace`
 * drops the runs already in the sidecar; otherwise the run is appended. The produced output is
 * printed between `--- output ---` markers for review, and a run that does not end in `done`
 * writes nothing and exits 1.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { corpusIndexBaseZero, profileNamed, type Sidecar, type SidecarRun } from '../test/helpers'
import { runSource, usesRandom } from './run-source'

const root = fileURLToPath(new URL('../test/corpus', import.meta.url))

function usage(message: string): never {
  console.error(message)
  console.error(
    'usage: record-run.ts <programs|guides> <slug> [--name <text>] [--seed <n>] [--replace] [--input <text>]...',
  )
  process.exit(2)
}

const [dirName, slug, ...rest] = process.argv.slice(2)
if ((dirName !== 'programs' && dirName !== 'guides') || slug === undefined) usage('missing directory or slug')
const inputs: string[] = []
let name: string | undefined
let seed: number | undefined
let replace = false
for (let index = 0; index < rest.length; index++) {
  const flag = rest[index]
  const value = rest[index + 1]
  if (flag === '--replace') {
    replace = true
    continue
  }
  if (value === undefined) usage(`${flag} needs a value`)
  if (flag === '--input') inputs.push(value)
  else if (flag === '--name') name = value
  else if (flag === '--seed') seed = Number(value)
  else usage(`unknown flag ${flag}`)
  index++
}

const dir = join(root, dirName)
const file = join(dir, `${slug}.stepcode`)
if (!existsSync(file)) usage(`${file} does not exist`)
const source = readFileSync(file, 'utf8')
if (usesRandom(source) && seed === undefined) seed = 1
const profile = profileNamed(
  dirName === 'programs' && corpusIndexBaseZero().includes(slug) ? 'es0' : 'es',
)

const report = await runSource(source, profile, inputs, seed)
console.log('--- output ---')
process.stdout.write(report.output)
console.log('--- end ---')
if (report.outcome.kind !== 'done') {
  console.error(`the run did not end in done: ${JSON.stringify(report.outcome)}`)
  process.exit(1)
}
if (report.requests !== inputs.length) {
  console.error(`the program made ${report.requests} input requests but ${inputs.length} inputs were given`)
  process.exit(1)
}

const sidecarFile = join(dir, `${slug}.run.json`)
const existing: Sidecar =
  !replace && existsSync(sidecarFile)
    ? (JSON.parse(readFileSync(sidecarFile, 'utf8')) as Sidecar)
    : { runs: [] }
const run: SidecarRun = {
  ...(name === undefined ? {} : { name }),
  inputs,
  output: report.output,
  ...(seed === undefined ? {} : { seed }),
}
const sidecar: Sidecar = { runs: [...existing.runs, run] }
writeFileSync(sidecarFile, `${JSON.stringify(sidecar, null, 2)}\n`, 'utf8')
console.log(`${sidecarFile}: ${sidecar.runs.length} run(s)`)
```

Then, for each program the extractor listed as "still without a sidecar", read the program, choose inputs that exercise its purpose (every `Leer` needs one answer; `Esperar Tecla` needs one entry; a program that reads nothing gets no `--input`), and record it:

```bash
node --experimental-transform-types --conditions=development packages/language/scripts/record-run.ts programs <slug> --name "<what the run shows>" --input <answer> [--input <answer> …]
```

Read the printed output against the program source before moving to the next one. Then:

Run: `pnpm vitest run --project stepcode test/corpus/run.test.ts`
Expected: PASS, one test per run, no `has a run sidecar` failure.

- [ ] **Step 10: Document the runtime expectations in `packages/language/test/corpus/programs/README.md`**

Append after the `### Withdrawn` table two rows, then a new section:

```markdown
| `test-reverse-indexing.stepcode` | Read `a[-1]` of an array; v1 answered the last cell. §5.4 makes a negative index out of range, so the program cannot run: its E4001 is pinned by `test/interpreter/by-code.test.ts`. |
| `test-reverse-indexing-2.stepcode` | Read `"Hola"[-1]`; v1 answered `a`. Same rule, same pin. |

## Runtime expectations (sub-spec C)

Every program here has a `<slug>.run.json` sidecar, `{ "runs": [{ "name"?, "inputs", "output", "seed"? }] }`:
one entry per input set, `inputs` in request order (`Esperar Tecla` consumes one), `output` the
exact concatenation of every `io.write`, `seed` the mulberry32 seed when the program calls
`Azar` or `Aleatorio`. `test/corpus/run.test.ts` runs each entry under `es` (or `es0` for the
slugs in `index-base-0.txt`) and asserts `done` and the output; a program without a sidecar
fails the suite.

The sidecars were generated by `scripts/extract-runs.ts` from the v1 test expectations
(`test/corpus/v1/*.v1.ts`) and reviewed by hand. v1 asserted whole output lines; the script
checked each against the v2 output and printed what it could not confirm.

- **Booleans.** v1 printed `true` / `false`; v2 prints the profile's `Verdadero` / `Falso`. The
  script rewrote those two strings before comparing. Programs touched: <the list the script
  printed, one slug per item>.
- **`Redondear(-1.5)`.** v1 asserted `-1` (JS `Math.round`); v2 rounds half away from zero (§5.8)
  and `test-round.run.json` records `-2`. The one intentional divergence.
- **Computed expectations** (`(2 * 3 / 5).toString()` and the like, and `test-random`'s
  `/^0\.\d+$/`) were confirmed by hand: <one line per test naming the value confirmed>.
- **Programs no v1 test asserted against** were recorded with `scripts/record-run.ts` and the
  outputs read against the source: <one slug per item, with the inputs chosen>.
```

Fill the three `<…>` placeholders from the script's output; a README with an angle-bracket placeholder left in it fails Step 12.

- [ ] **Step 11: Run lint and typecheck** (the scripts are linted, not typechecked — `tsconfig.json` includes `src` and the tests only)

```bash
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm --filter stepcode test
```

Expected: all clean.

- [ ] **Step 12: Check nothing was left half-written, then commit**

```bash
grep -n '<' packages/language/test/corpus/programs/README.md | grep -v '<-\|<>\|<=\|E4\|Entero\[' ; ls packages/language/test/corpus/programs/*.stepcode | wc -l; ls packages/language/test/corpus/programs/*.run.json | wc -l
```

Expected: no placeholder line; the two counts are equal.

```bash
git add packages/language/scripts packages/language/test
git commit -m "test(language): run sidecars for the v1 corpus, extracted from the v1 expectations"
```

**Parallelism:** none — Task 10 shares `run.test.ts` and `run-source.ts`.

---

### Task 10: `guides/runtime/`, the guides harness and the guide sidecars

**Files:**
- Create: `packages/language/test/corpus/guides/runtime/e4001-indice-fuera-de-rango.stepcode`, `e4002-division-entre-cero.stepcode`, `e4003-sin-valor.stepcode`, `e4004-entrada-rechazada.stepcode`, `e4005-recursion-sin-fin.stepcode`, `e4006-funcion-sin-resultado.stepcode`, `e4007-raiz-negativa.stepcode`, `e4008-paso-cero.stepcode`
- Modify: `packages/language/test/corpus/guides.test.ts` (imports; append a `describe`)
- Modify: `packages/language/test/corpus/run.test.ts` (append the guides `describe`)
- Create: `packages/language/test/corpus/guides/<slug>.run.json`, one per guide program (52)
- Modify: `packages/language/test/corpus/guides/README.md` (lines 18–19; append `## Runtime corpus` and `## Runs`)

**Interfaces:**
- Consumes: `compile` from `../../src/compile`; `start` from `../../src/interpreter/run`; `collectRun`, `corpusDirs`, `readSidecar`, `runSidecar` from `../helpers`; `scripts/record-run.ts` from Task 9.
- Produces: the eight runtime programs, each with a `// expect: E4xxx` first line and `// input: <text>` lines after it; the guides loop of `run.test.ts`; the 52 sidecars.

- [ ] **Step 1: Write the eight runtime programs**

`packages/language/test/corpus/guides/runtime/e4001-indice-fuera-de-rango.stepcode`:

```
// expect: E4001
// U5 Arreglos: el estudiante recorre hasta el tamaño más uno.
Proceso IndiceFueraDeRango
    Definir notas Como Real[3];
    Definir i Como Entero;
    Para i <- 1 Hasta 4 Hacer
        notas[i] <- i * 1.5;
    FinPara
    Escribir notas[1];
FinProceso
```

`e4002-division-entre-cero.stepcode`:

```
// expect: E4002
// input: 0
// U1 P6: el tiempo de un MRU con velocidad cero.
Proceso DivisionEntreCero
    Definir distancia, velocidad Como Real;
    distancia <- 100;
    Escribir "Velocidad:";
    Leer velocidad;
    Escribir "Tiempo: ", distancia / velocidad;
FinProceso
```

`e4003-sin-valor.stepcode`:

```
// expect: E4003
// U4: el acumulador nunca se inicializa y el bucle no llega a asignarlo.
Proceso SinValor
    Definir total, i Como Entero;
    Para i <- 1 Hasta 0 Hacer
        total <- total + i;
    FinPara
    Escribir "Total: ", total;
FinProceso
```

`e4004-entrada-rechazada.stepcode`:

```
// expect: E4004
// input: veinte
// U2: se pide un Entero y el usuario escribe una palabra.
Proceso EntradaRechazada
    Definir edad Como Entero;
    Escribir "Edad:";
    Leer edad;
    Escribir "Tienes ", edad, " años";
FinProceso
```

`e4005-recursion-sin-fin.stepcode`:

```
// expect: E4005
// U6: una función recursiva sin caso base.
Funcion r Como Entero <- Cuenta(n Como Entero)
    r <- Cuenta(n + 1);
FinFuncion

Proceso RecursionSinFin
    Escribir Cuenta(1);
FinProceso
```

`e4006-funcion-sin-resultado.stepcode`:

```
// expect: E4006
// U6: la función solo asigna su resultado en una rama.
Funcion r Como Entero <- Mayor(a, b Como Entero)
    Si a > b Entonces
        r <- a;
    FinSi
FinFuncion

Proceso FuncionSinResultado
    Escribir Mayor(1, 2);
FinProceso
```

`e4007-raiz-negativa.stepcode`:

```
// expect: E4007
// input: -4
// U3: raíz cuadrada de un número negativo.
Proceso RaizNegativa
    Definir x Como Real;
    Escribir "Número:";
    Leer x;
    Escribir "Raíz: ", RC(x);
FinProceso
```

`e4008-paso-cero.stepcode`:

```
// expect: E4008
// input: 0
// U4: el paso del bucle viene de la entrada y es cero.
Proceso PasoCero
    Definir i, paso Como Entero;
    Escribir "Paso:";
    Leer paso;
    Para i <- 1 Hasta 10 Con Paso paso Hacer
        Escribir i;
    FinPara
FinProceso
```

- [ ] **Step 2: Write the failing guides test — extend `packages/language/test/corpus/guides.test.ts`**

Add `import { start } from '../../src/interpreter/run'` and `import { collectRun } from '../helpers'` (and `DIAGNOSTIC_CODES` from `'../../src/diagnostics/index'`). Append:

```ts
const runtimeDir = join(dir, 'runtime')
const runtimeFiles = readdirSync(runtimeDir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

/** `// expect: E4001` then zero or more `// input: <text>` lines, the text after the single space verbatim. */
function runtimeHeader(source: string): { expected: string[]; inputs: string[] } {
  const lines = source.split('\n')
  const expected = expectedCodes(source)
  const inputs: string[] = []
  for (const line of lines.slice(1)) {
    if (!line.startsWith('// input:')) break
    inputs.push(line.slice('// input:'.length + 1))
  }
  return { expected, inputs }
}

describe('the course-guide runtime corpus', () => {
  it('holds one program per runtime code', () => {
    const codes = runtimeFiles.map((file) => file.slice(0, 5).toUpperCase()).sort()
    expect(codes).toEqual(DIAGNOSTIC_CODES.filter((code) => code.startsWith('E4')))
  })

  it.each(runtimeFiles)('runtime/%s compiles clean and ends with exactly the code it declares', (file) => {
    const source = readFileSync(join(runtimeDir, file), 'utf8')
    const { expected, inputs } = runtimeHeader(source)
    const program = compile(source, { profile: profiles.es })
    expect(program.diagnostics.filter((one) => one.severity === 'error')).toEqual([])
    const run = start(program, { profile: profiles.es, io: { write: () => {} } })
    const result = collectRun(run, inputs)
    const codes =
      result.kind === 'error'
        ? [result.diagnostic.code]
        : result.kind === 'input' && result.rejected !== undefined
          ? [result.rejected.code]
          : []
    expect(codes).toEqual(expected)
  })
})
```

- [ ] **Step 3: Run it to verify it passes** (the programs and the controller exist; this pins them)

Run: `pnpm vitest run --project stepcode test/corpus/guides.test.ts`
Expected: PASS, the existing tests plus 9 new ones. A runtime program that fails to compile is fixed in the program, never in the checker.

- [ ] **Step 4: Extend `packages/language/test/corpus/run.test.ts` to the guides**

Append:

```ts
const guideFiles = readdirSync(corpusDirs.guides)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

describe('the course-guide corpus runs (§8.3)', () => {
  for (const file of guideFiles) {
    const slug = file.replace('.stepcode', '')
    const source = readFileSync(join(corpusDirs.guides, file), 'utf8')
    const sidecar = readSidecar(corpusDirs.guides, slug)
    if (sidecar === undefined) {
      it(`guides/${file} has a run sidecar`, () => {
        throw new Error(`${slug}.run.json is missing: the corpus is complete or it is not`)
      })
      continue
    }
    sidecar.runs.forEach((run, index) => {
      const title = run.name ?? `run ${index + 1}`
      it(`guides/${file} · ${title} produces its recorded output`, async () => {
        const { outcome, output } = await runSidecar(source, profileNamed('es'), run)
        expect(outcome).toEqual({ kind: 'done' })
        expect(output).toBe(run.output)
      })
    })
  }
})
```

Add `readdirSync`, `readFileSync` from `node:fs` and `join` from `node:path` to the imports.

Run: `pnpm vitest run --project stepcode test/corpus/run.test.ts`
Expected: the `programs/` runs pass; 52 `guides/… has a run sidecar` failures.

- [ ] **Step 5: Record one run per guide program**

For each of the 52 files in `test/corpus/guides/*.stepcode`, in alphabetical order:

1. Read the program. List its input requests in order (every `Leer` target, every `Esperar Tecla`), and what each prompt asks for.
2. Choose answers that exercise the program's purpose — the branch or loop the guide exercise is about, not the trivial path: a `Segun` gets a value that hits a labelled case, a search finds its element, a validation loop gets one rejected-by-the-program value before a good one when the program re-asks itself, a recursive function gets a depth of at least 3.
3. Record:

```bash
node --experimental-transform-types --conditions=development packages/language/scripts/record-run.ts guides <slug> --name "<what the run shows>" [--input <answer>]… [--seed 1]
```

4. Read the printed output against the program source line by line: every `Escribir` the chosen path reaches must appear, in order, with the values the arithmetic gives. An output that looks wrong is an interpreter bug: stop, write the failing unit test in the file that owns the behaviour, fix, re-record.

Two entries are fixed by the spec:
- `u6-menu-interactivo`: `--input 1 --input 1000 --input "" --input 2 --input 10 --input "" --input 0` — option 1 with 1000 metres (`Son 1 km`), a key press, option 2 with 10 pounds (`Son 4.5359237 kg`), a key press, then 0 (`Hasta pronto`); `Esperar 500` is a no-op under the test `sleep`.
- `u5-arreglos-generador-de-nombres` calls `Aleatorio`, so it takes `--seed 1`; the script adds the seed itself.

A program that reads nothing (`u1-energia-einstein`, for example) is recorded with no `--input`.

Run: `pnpm vitest run --project stepcode test/corpus/run.test.ts`
Expected: PASS — every program and every guide has a sidecar and every run reproduces its output.

- [ ] **Step 6: Update `packages/language/test/corpus/guides/README.md`**

Replace lines 18–19 (`Runtime inputs and expected outputs come later, in sub-spec C; for now these programs only have to be valid, well-typed StepCode.`) with:

```markdown
Every program also has a `<slug>.run.json` sidecar — `{ runs: [{ name?, inputs, output, seed? }] }`,
the schema of `../programs/README.md` — recorded with `scripts/record-run.ts` and read against
the source by hand; `run.test.ts` replays each one under `es` and asserts the output. The
inputs chosen for each program are listed under **Runs** below.
```

Append at the end:

````markdown
## Runtime corpus

`runtime/` holds one program per runtime code, E4001–E4008, each a realistic mistake from the
same guides. The first line declares the code; when the program reads input, one
`// input: <text>` line per answer follows it, the text after the single space verbatim:

```
// expect: E4004
// input: veinte
```

`guides.test.ts` compiles each one clean, drives it with `start` and `continue`, answers input
from the header lines, and asserts the run ends with exactly that code — from an `error` result,
or, for E4004, from the `rejected` diagnostic of the re-reported input request.

## Runs

| Program | Inputs | What the run shows |
| --- | --- | --- |
````

then one row per guide program, in the order recorded, with the exact `--input` values (an
empty answer shown as `""`, a seed as `seed 1`) and the sentence given as `--name`. All 52 rows
are present or Step 7's check fails.

- [ ] **Step 7: Check completeness, lint, typecheck, then commit**

```bash
ls packages/language/test/corpus/guides/*.stepcode | wc -l
ls packages/language/test/corpus/guides/*.run.json | wc -l
grep -c '^| `' packages/language/test/corpus/guides/README.md
pnpm lint:fix && pnpm lint
pnpm --filter stepcode typecheck
pnpm --filter stepcode test
```

Expected: the first two counts are equal (52); the third is at least 52 + the rows of the existing program table; everything green.

```bash
git add packages/language/test
git commit -m "test(language): runtime guide programs and run sidecars for the course guides"
```

**Parallelism:** none — after Task 9; Task 11 reads the sidecars.

---

### Task 11: the stepping property, the integration tests and the final run

**Files:**
- Create: `packages/language/test/corpus/step-equivalence.test.ts`
- Create: `packages/language/test/interpreter/integration.test.ts`

**Interfaces:**
- Consumes: `compile` from `../../src/compile`; `start` from `../../src/interpreter/run`; `corpusDirs`, `corpusPrograms`, `profileNamed`, `readSidecar`, `runSidecar`, `seeded`, `startSource`, `collectRun` from `../helpers`; `runProgram` from `../../src/interpreter/program`.
- Produces: no new source; two test files.

- [ ] **Step 1: Write the property test `packages/language/test/corpus/step-equivalence.test.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ResolvedProfile } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { start } from '../../src/interpreter/run'
import {
  corpusDirs,
  corpusPrograms,
  profileNamed,
  readSidecar,
  runSidecar,
  seeded,
  type SidecarRun,
} from '../helpers'

/**
 * Drives a run to the end with `step()` alone, answering inputs from the sidecar, and returns
 * what it wrote. The output must equal `runProgram`'s: stepping is a way of pausing, never a
 * way of computing something else (§8, "Property").
 */
function stepToEnd(source: string, profile: ResolvedProfile, run: SidecarRun): string {
  const program = compile(source, { profile })
  let output = ''
  let next = 0
  const controller = start(program, {
    profile,
    io: {
      write: (text) => {
        output += text
      },
    },
    ...(run.seed === undefined ? {} : { random: seeded(run.seed) }),
  })
  for (let steps = 0; steps < 1_000_000; steps++) {
    const result = controller.step()
    if (result.kind === 'done') return output
    if (result.kind === 'error') throw new Error(`stepping hit ${result.diagnostic.code}`)
    if (result.kind === 'input') {
      if (result.rejected !== undefined) throw new Error('stepping had an input rejected')
      const text = run.inputs[next]
      next++
      if (text === undefined) throw new Error('stepping ran out of inputs')
      controller.input(text)
    }
    // `paused` and `wait`: keep stepping.
  }
  throw new Error('stepping did not finish within a million steps')
}

interface Candidate {
  readonly title: string
  readonly source: string
  readonly profile: ResolvedProfile
  readonly run: SidecarRun
}

const candidates: Candidate[] = []
for (const program of corpusPrograms()) {
  const sidecar = readSidecar(corpusDirs.programs, program.slug)
  for (const run of sidecar?.runs ?? []) {
    candidates.push({
      title: `${program.file} · ${run.name ?? 'run'}`,
      source: program.source,
      profile: profileNamed(program.profileName),
      run,
    })
  }
}
for (const file of readdirSync(corpusDirs.guides).filter((name) => name.endsWith('.stepcode')).sort()) {
  const sidecar = readSidecar(corpusDirs.guides, file.replace('.stepcode', ''))
  for (const run of sidecar?.runs ?? []) {
    candidates.push({
      title: `guides/${file} · ${run.name ?? 'run'}`,
      source: readFileSync(join(corpusDirs.guides, file), 'utf8'),
      profile: profileNamed('es'),
      run,
    })
  }
}

describe('stepping to the end equals runProgram (§8)', () => {
  it('covers the whole corpus', () => {
    expect(candidates.length).toBeGreaterThan(150)
  })

  for (const candidate of candidates) {
    it(candidate.title, async () => {
      const stepped = stepToEnd(candidate.source, candidate.profile, candidate.run)
      const { outcome, output } = await runSidecar(candidate.source, candidate.profile, candidate.run)
      expect(outcome).toEqual({ kind: 'done' })
      expect(stepped).toBe(output)
      expect(stepped).toBe(candidate.run.output)
    })
  }
})
```

Run: `pnpm vitest run --project stepcode test/corpus/step-equivalence.test.ts`
Expected: PASS, one test per run plus the count. A difference between the two outputs is an interpreter bug (a value depending on how the run was driven): find it with `systematic-debugging`, pin it in `test/interpreter/run.test.ts`, fix it.

- [ ] **Step 2: Write `packages/language/test/interpreter/integration.test.ts`**

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { runProgram } from '../../src/interpreter/program'
import { collectRun, seeded, startSource } from '../helpers'

const fibonacci = [
  'Funcion r Como Entero <- fib(n Como Entero)',
  '  Si n < 2 Entonces',
  '    r <- n;',
  '  Sino',
  '    r <- fib(n - 1) + fib(n - 2);',
  '  FinSi',
  'FinFuncion',
  'Proceso p',
  '  Definir i Como Entero;',
  '  Para i <- 0 Hasta 10 Hacer',
  '    Escribir Sin Saltar fib(i), " ";',
  '  FinPara',
  '  Escribir "";',
  'FinProceso',
].join('\n')

describe('recursion through the controller', () => {
  it('computes fibonacci with two calls per frame, under the default depth limit', () => {
    const { run, output } = startSource(fibonacci)
    expect(collectRun(run)).toEqual({ kind: 'done' })
    expect(output()).toBe('0 1 1 2 3 5 8 13 21 34 55 \n')
  })

  it('stepOver over a recursive call statement runs the whole tree', () => {
    const { run, output } = startSource(fibonacci)
    let result = run.step()
    while (result.kind === 'paused' && result.line !== 11) result = run.step()
    expect(result.kind).toBe('paused')
    const after = run.stepOver()
    expect(after.kind === 'paused' && after.frames).toHaveLength(1)
    expect(output()).toBe('0 ')
  })

  it('a deep but finite recursion runs when the limit allows it and fails when it does not', () => {
    const source = [
      'Funcion r Como Entero <- suma(n Como Entero)',
      '  Si n = 0 Entonces',
      '    r <- 0;',
      '  Sino',
      '    r <- n + suma(n - 1);',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir suma(500);',
      'FinProceso',
    ].join('\n')
    const ok = startSource(source)
    expect(collectRun(ok.run)).toEqual({ kind: 'done' })
    expect(ok.output()).toBe('125250\n')
    const tight = startSource(source, { stackDepth: 100 })
    const result = collectRun(tight.run)
    expect(result.kind === 'error' && result.diagnostic.code).toBe('E4005')
  })
})

describe('input rejection through runProgram', () => {
  it('re-asks until the text parses, for every rejectable type', async () => {
    const source = [
      'Proceso p',
      '  Definir n Como Entero;',
      '  Definir x Como Real;',
      '  Definir b Como Logico;',
      '  Definir c Como Caracter;',
      '  Leer n, x, b, c;',
      '  Escribir n, " ", x, " ", b, " ", c;',
      'FinProceso',
    ].join('\n')
    const answers = ['1.5', '7', 'abc', '2.5', 'yes', 'falso', 'ab', 'z']
    const hints: (string | undefined)[] = []
    let writes = ''
    const outcome = await runProgram(compile(source, { profile: profiles.es }), {
      profile: profiles.es,
      io: {
        write: (text) => {
          writes += text
        },
        read: (request) => {
          hints.push(request.rejected === undefined ? undefined : String(request.rejected.data.hint))
          return Promise.resolve(answers.shift() ?? '')
        },
      },
    })
    expect(outcome).toEqual({ kind: 'done' })
    expect(hints).toEqual([undefined, 'integer', undefined, 'real', undefined, 'boolean', undefined, 'char'])
    expect(writes).toBe('7 2.5 Falso z\n')
  })
})

describe('determinism end to end', () => {
  const lottery = [
    'Proceso p',
    '  Definir i, n Como Entero;',
    '  Definir s Como Cadena;',
    '  Leer s;',
    '  Para i <- 1 Hasta 3 Hacer',
    '    n <- Aleatorio(1, 100);',
    '    Escribir s, " ", n;',
    '  FinPara',
    'FinProceso',
  ].join('\n')

  async function play(seed: number, name: string): Promise<string> {
    let output = ''
    await runProgram(compile(lottery, { profile: profiles.es }), {
      profile: profiles.es,
      io: {
        write: (text) => {
          output += text
        },
        read: () => Promise.resolve(name),
      },
      random: seeded(seed),
    })
    return output
  }

  it('is a function of inputs and seed alone', async () => {
    expect(await play(3, 'ana')).toBe(await play(3, 'ana'))
    expect(await play(3, 'ana')).not.toBe(await play(4, 'ana'))
    expect(await play(3, 'ana').then((out) => out.replace(/ana/g, 'eva'))).toBe(await play(3, 'eva'))
  })
})

describe('abort', () => {
  it('stops a run in the middle of an input-driven loop without an exception', async () => {
    const source = [
      'Proceso p',
      '  Definir n Como Entero;',
      '  n <- 1;',
      '  Mientras n <> 0 Hacer',
      '    Leer n;',
      '    Escribir n;',
      '  FinMientras',
      'FinProceso',
    ].join('\n')
    const controller = new AbortController()
    let reads = 0
    let output = ''
    const outcome = await runProgram(compile(source, { profile: profiles.es }), {
      profile: profiles.es,
      io: {
        write: (text) => {
          output += text
        },
        read: () => {
          reads++
          if (reads === 3) controller.abort()
          return Promise.resolve('5')
        },
      },
      signal: controller.signal,
    })
    expect(outcome).toEqual({ kind: 'aborted' })
    expect(reads).toBe(3)
    expect(output).toBe('5\n5\n')
  })
})
```

Run: `pnpm vitest run --project stepcode test/interpreter/integration.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 3: The final run, from the repo root**

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
grep -rn 'TODO\|FIXME\|XXX' packages/language/src packages/language/scripts
```

Expected: lint exits 0; typecheck silent for every package; the build emits `dist/index.js` and `dist/index.d.ts` for `stepcode`; every test green (the whole workspace, `packages/*`); the grep finds nothing.

- [ ] **Step 4: Commit**

```bash
git add packages/language/test
git commit -m "test(language): stepping equals runProgram over the corpus, and the controller end to end"
```

The handoff document (`docs/superpowers/handoffs/`) is written by the orchestrator after this plan, not by this task.

**Parallelism:** none — last task.

---

## Diagnostic coverage

Every runtime code of spec §6.1, the task that raises it, and the data it carries.

| Code | Raised in | Task | Data | Hint variants |
|---|---|---|---|---|
| E4001 | `value.ts` `checkIndex` (indexing, `substring`), `allocateArray` | 1, 3, 5 | `name`, `index`, `low`, `high` | `size` (data `name`, `size`) |
| E4002 | `evaluate.ts` `applyBinary` | 5 | `op` (pre-rendered) | — |
| E4003 | `evaluate.ts` `readSlot`, `evaluate` (`Index`) | 5 | `name` | `cell` (data adds `index`) |
| E4004 | `run.ts` `input()` | 7 | `name`, `type` (pre-rendered), `text` | `integer`, `real`, `boolean`, `char` |
| E4005 | `run.ts` `enter()` | 7 | `name`, `depth` | — |
| E4006 | `evaluate.ts` `runFrame` | 6 | `name` | — |
| E4007 | `builtins.ts` `reject()` | 3 | `builtin` (+ `text` for `number`) | `negative`, `nonPositive`, `domain`, `range`, `number` |
| E4008 | `evaluate.ts` `execute` (`ForStmt`) | 6 | `name` | — |

Each is exercised at a named span in `test/interpreter/by-code.test.ts` (Task 7), which asserts the list equals the `E4` codes of `DIAGNOSTIC_CODES`, and once more as a guide program in `test/corpus/guides/runtime/` (Task 10). Every variant renders in `es` and `en` with no unfilled slot (`test/diagnostics/format.test.ts`, Task 1).

## Spec coverage

| Spec section | Where it lands |
|---|---|
| §2 layout and public surface | Tasks 1–8; `src/index.ts` in Task 8 |
| §3.1 `start` | Task 7 |
| §3.2 `Run`, states and legal commands | Task 7 (`command`, `input`, `setBreakpoints`, `inspect`) |
| §3.3 step results | Task 7 |
| §3.4 stepping semantics, loop pause points | Task 6 (`execute`) and Task 7 (`drive`) |
| §3.5 breakpoints and budget | Task 7 |
| §3.6 `runProgram` | Task 8 |
| §3.7 frames and inspection | Task 4 (`inspectFrames`) |
| §4.1 value model, cell offsets | Task 1 |
| §4.2 frames, slots, parameters, constants, result variable, cell slots, depth | Tasks 1, 4, 6 (`frameForCall`), 7 (E4005) |
| §5.1 evaluator shape, completions, call events | Tasks 5, 6, 7 |
| §5.2 statements | Task 6 |
| §5.3 operators | Task 5 |
| §5.4 indexing and unassigned reads | Task 5 |
| §5.5 calls | Tasks 5 (arguments), 6 (frame, result, E4006), 7 (depth) |
| §5.6 rendering | Task 2 |
| §5.7 input parsing and the rejection loop | Tasks 2, 7, 8 |
| §5.8 builtins | Task 3 |
| §5.9 `Para` | Task 6 |
| §6.1 codes, §6.2 catalogs | Task 1 |
| §7.1 `compile` | Task 1 |
| §7.2 `nameOf` | Task 1 |
| §7.3 `index.ts` | Task 8 |
| §8 unit tests | Tasks 2, 3, 5, 6, 7, 8 |
| §8 property | Task 11 |
| §8.1 sidecars and `run.test.ts` | Tasks 9, 10 |
| §8.2 expected outputs, `extract-runs.ts`, README, withdrawn `a[-1]` | Task 9 |
| §8.3 `guides/runtime/`, `guides.test.ts`, guide sidecars | Task 10 |
| §9 decisions log | honoured where each decision applies; the loop pause rule in Task 6, the resume-on-breakpoint rule and `step` from `ready` in Task 7, the E4002 span in Task 5, `E4001.size` in Task 1, sized `Definir` in Task 6, `random` arity and `substring`/`length` in Task 3, E4004/E4007 data in Tasks 7/3, one `io.write` per `Escribir` in Task 6, the sidecar schema in Task 9, mulberry32 in Task 1 |

## What it guarantees

- **A started program is a checked program.** `start` refuses any error-severity diagnostic, so the evaluator never meets a placeholder node; every side-table miss is an internal `Error`, never a user-facing diagnostic.
- **One statement, one pause point.** Every statement yields once before executing; loops yield on their own line before every test; so a breakpoint on a loop line hits every iteration, an empty body cannot spin unobserved, and `continue({ budget })` counts what a user would count.
- **User calls never touch the JS stack.** A call is an event; the controller holds one generator per frame, so `stackDepth` is a policy limit (E4005), `stepOver` and `stepOut` always know the depth, and a thousand-deep recursion is fine.
- **Input is a step result.** No promise lives below `runProgram`; a Web Worker or a test drives the run synchronously and answers `input` results in its own time. A rejected text keeps the state `input` and re-reports the request with the E4004 that explains why.
- **Runtime errors are diagnostics** with the same shape, catalogs and `formatDiagnostic` as the checker's, plus the frames at the failure, which `inspect()` keeps returning.
- **Runs are reproducible.** Output is a function of `(source, profile, inputs, random sequence, limits)`; the corpus sidecars pin it, and stepping to the end produces the same bytes as `runProgram`.
- **The corpus is complete or it is not.** Every program and every guide has a sidecar, every sidecar was generated by the interpreter and read by a person, and the one divergence from v1 (`Redondear(-1.5)`) is written down.

## API

| Export | What it does |
| --- | --- |
| `start(program, { profile, io, random?, limits? })` | a `Run` in state `ready`; throws on a program with errors |
| `Run.step()` / `stepOver()` / `stepOut()` / `continue({ budget? })` | §3.4; each returns a `StepResult` |
| `Run.input(text)` | answers the pending request; legal only in state `input` |
| `Run.setBreakpoints(lines)` / `Run.inspect()` | legal in every state |
| `runProgram(program, { profile, io, signal?, sleep?, budget? })` | `Promise<RunOutcome>` — `done`, `error` or `aborted` |
| `renderValue(value, type, profile)` | §5.6 |
| `compile(source, { profile })` | now `CheckResult & { ast, source }` |
| `DEFAULT_STACK_DEPTH`, `DEFAULT_BUDGET` | 1000 frames, 10 000 statements |
| `Run`, `RunState`, `PauseReason`, `StepResult`, `InputRequest`, `Frame`, `FrameVariable`, `RuntimeValue`, `Scalar`, `ArrayValue`, `RunOptions`, `RunProgramOptions`, `RunOutcome` | the public types |

## Verification checklist

Run from the repo root when every task is done:

- [ ] `pnpm lint` exits 0.
- [ ] `pnpm typecheck` is silent for all packages.
- [ ] `pnpm test` is green; `pnpm --filter stepcode test` alone is green.
- [ ] `pnpm build` succeeds; the `node -e` of Task 8 Step 12 prints `42` and `{ kind: 'done' }`.
- [ ] `DIAGNOSTIC_CODES` ends with `E4001` … `E4008`; `test/diagnostics/format.test.ts` lists them and its `SLOT_BAG` carries `index`, `low`, `high`, `size`, `depth`, `type`.
- [ ] `es.variants` and `en.variants` have the same keys; no template or variant leaves a `{slot}` unresolved.
- [ ] Every `E4xxx` has a case in `test/interpreter/by-code.test.ts` (the suite asserts it), a program in `test/corpus/guides/runtime/` (the guides suite asserts it), and renders in both locales.
- [ ] `compile(...)` returns `types`, `symbols`, `calls`, `scopes`, `ast`, `source`; `nameOf(expr, profile)` names a call after its callee and a builtin call after its first spelling.
- [ ] `test/interpreter/statements.test.ts` has one test per row of §5.2 and each rule of §5.9; `expressions.test.ts` one per row of §5.3 and §5.4; `builtins.test.ts` one per row of §5.8 including every E4007 variant; `render.test.ts` and `input.test.ts` one per row of §5.6 and §5.7.
- [ ] Every `.stepcode` under `test/corpus/programs/` and `test/corpus/guides/` has a `.run.json` beside it (counts equal), and `test/corpus/run.test.ts` has no `has a run sidecar` failure.
- [ ] `test/corpus/step-equivalence.test.ts` passes over more than 150 runs.
- [ ] `programs/README.md` has the `Runtime expectations` section with the boolean-rewrite list, the `Redondear(-1.5)` note, the confirmed computed expectations and the recorded-by-hand list, with no `<…>` placeholder; its `Withdrawn` table lists both `test-reverse-indexing` programs.
- [ ] `guides/README.md` has the `Runtime corpus` section and a `Runs` row for all 52 programs.
- [ ] `grep -rn 'TODO\|FIXME' packages/language/src packages/language/scripts` finds nothing.
- [ ] `pnpm changeset status` lists `stepcode` as `minor` (two pending changesets, `language-checker` and `language-interpreter`).
