# StepCode v2 — umbrella design

Date: 2026-09-03
Status: approved in conversation; sub-project specs derive from this document.

## 1. Goal

Rewrite StepCode from scratch as a pnpm monorepo. v1 (an ANTLR grammar adapted from
Pascal, an 841-line visitor interpreter with runtime-only checks, and a duplicated Lezer
grammar for the editor) is replaced, not migrated. What survives from v1 is its test
programs, which become the v2 conformance corpus.

Priorities, in order:

1. Correct execution.
2. Diagnostics: precise spans, stable codes, messages in the user's language, before running
   where possible.
3. Pause, step, breakpoints, variable inspection.
4. Multiple keyword profiles (Spanish, English, user-defined) and parametric options.
5. An editor that works on phones and embeds cleanly in other sites.

Non-goals for 2.0: accounts, cloud save, multi-file programs, collaboration, flowchart view,
transpiling to other languages, records/structs (the AST leaves room for them).

## 2. Language decisions

- **Semantics are StepCode-defined**, with a PSeInt-compatible surface. Where PSeInt is vague or
  inconsistent, Pascal is the reference. A `pseint` profile opts into PSeInt's compatibility
  options.
- **Profiles, not a syntax builder.** The set of constructs is fixed by the language. A profile
  is data: spellings for each construct, type names, builtin names, operators, and options.
  Profiles can `extends` another profile. Shipped: `es`, `en`, `pseint` (extends `es`).
- **Every profile value is `string[]`**, even with one entry. Synonyms are natural
  (`["Proceso", "Algoritmo"]`), and code never branches on shape.
- **Static typing by default.** Declarations are required and the checker verifies types,
  arity, conditions, `Para` counter assignment, missing `FinX`, unreachable code, before
  execution. Option `implicitDeclarations: true` (PSeInt "flexible" mode) lets a variable spring
  into existence at first assignment with its type inferred from that expression and then
  fixed.
- **Typed parameters and returns** use `Como`:
  `SubProceso intercambiar(a Por Referencia Como Entero, b Por Referencia Como Entero)`,
  `Funcion r Como Real <- promedio(valores Como Real[])`. In flexible mode the type
  may be omitted and is inferred from the first call site; later mismatches are errors.
- **Types:** `Entero`, `Real`, `Cadena`, `Caracter`, `Logico`, arrays (n-dimensional).
- **Arrays:** `Dimension a[3,3]` and `Dimension a[3][3]` are equivalent; so are `a[i,j]` and
  `a[i][j]`. Element type comes from a preceding `Definir a Como Entero` (PSeInt pattern) or
  the shorthand `Definir a Como Entero[3,3]`. Bounds are checked at runtime against
  `indexBase`.
- **Options** (with defaults): `indexBase: 1`, `caseSensitive: false`,
  `implicitDeclarations: false`, `requireSemicolons: true`, `typedParameters: true`. The
  `pseint` profile sets `requireSemicolons: false` and `implicitDeclarations: true`.
- **Diagnostics** carry a stable code (`E0042`, `W0007`), a span, severity, structured data,
  and where possible a fix hint. Messages live in locale catalogs (`es`, `en`) inside the
  language package, not in profiles, and interpolate keyword spellings from the active
  profile ("se esperaba `FinSi`").

## 3. Architecture

```
stepcode/
├─ packages/
│  ├─ profiles/    @stepcode/profiles   schema, es/en/pseint, validator, `extends` resolver
│  ├─ language/    stepcode             lexer → parser → AST → checker → interpreter; diagnostics
│  ├─ codemirror/  @stepcode/codemirror language support + debug extensions for CodeMirror 6
│  ├─ textmate/    @stepcode/textmate   TextMate grammar generator (Shiki, the academy site)
│  └─ editor/      (private)            React 19 + Vite 8 + Tailwind 4 PWA
├─ docs/superpowers/specs/
└─ .github/workflows/
```

Dependency direction is strictly one way:

```
profiles ← language ← codemirror ← editor
profiles ← textmate
```

`language` imports `profiles` only for the schema types and the shipped profiles. A resolved
profile object is passed to `compile`; the core never reads files.

Deliberately absent: Turborepo, a Lezer grammar, ANTLR, a language server, any server
component. Each can be added later without moving package boundaries.

### 3.1 Parser

Handwritten: recursive descent for statements, Pratt for expressions. Keywords are
recognized by the lexer against the profile table with longest-match, so multi-word keywords
(`Escribir Sin Saltar`, `Con Paso`, `Hasta Que`) reach the parser as single construct tokens.
Lexer and parser never throw; they return `{ result, diagnostics }` with a partial AST on
error, and recover so one typo yields one diagnostic.

### 3.2 Execution model

A resumable tree-walking interpreter: each statement executes as a generator step. Pausing is
not calling `next()`. Breakpoints, step-over, step-into, inspection, and asynchronous `Leer`
are the same mechanism. `continue()` loops `step()` until a breakpoint, an input request, the
end, or an error; with no breakpoints that is plain execution. Node hosts get a cooperative
yield every N steps plus `AbortSignal`; the editor stops a run by terminating its worker.

If speed ever matters, a bytecode VM can replace the evaluator without touching the parser,
checker, diagnostics, or the host API.

### 3.3 Public API (host-agnostic)

```ts
const program = compile(source, { profile, options })  // { ast, diagnostics }
const run = program.start({ io })                        // io: { write(text), read(): Promise<string> }
run.step()          // { kind: 'paused', line, frames } | { kind: 'done' } | { kind: 'error', diagnostic }
run.continue()      // until breakpoint / input / end
run.breakpoints.set(12)
run.inspect()       // scopes and variables
await runProgram(program, { io })   // sugar: start + continue
```

No DOM, no workers, no events in the core. The editor wraps the API in a Web Worker with a
typed message protocol; tests and a future CLI drive it directly.

### 3.4 `language` internals

```
language/src/
  lexer/        source → tokens with spans; profile-driven keyword recognition
  parser/       tokens → AST; error recovery
  ast/          node types with spans; visitors; the one tree everything reads
  checker/      scopes, symbol tables, types, flow checks; emits diagnostics
  interpreter/  Value model, Environment frames, generator evaluator, builtins, run controller
  diagnostics/  codes, severity, catalogs es/en, profile-aware formatting
  index.ts      compile(), runProgram(), types
```

Contracts: only the checker knows types; the interpreter trusts it in static mode and checks
only what statics cannot (bounds, division by zero, input parsing). The interpreter emits
codes and data, never formatted text. Everything is deterministic given
`(source, profile, io)`.

### 3.5 Editor bridge

`@stepcode/codemirror` builds a `@lezer/common` `Tree` from our parser output (`Tree.build`)
so highlighting, folding, indentation, and completion come from the same parser the runtime
uses. Diagnostics map to `@codemirror/lint`. Debug extensions (breakpoint gutter, current
line) are exported separately. `@lezer/common` is the only Lezer dependency; there is no
`.grammar` file.

CodeMirror 6 was re-verified on 2026-09-03: actively released (`@codemirror/view` 6.43.10,
2026-08-31), repositories moved from GitHub to `code.haverbeke.berlin` in April 2026 (npm
unchanged). Monaco still lists mobile browsers as unsupported.

## 4. Editor

Stack: React 19, Vite 8 (Rolldown), Tailwind 4, `vite-plugin-pwa`, Zustand, dockview
(`dockview-react`), CodeMirror 6. Hosted on Cloudflare Pages.

### 4.1 Layout

Panels (Editor, Console, Variables, Problems) are dockview panels: rearrange, split, tab,
float, pop out. Layout persists; "Reset layout" restores the default. On narrow viewports a
separate single-column layout is used: editor on top, a bottom sheet swiping between
Console / Variables / Problems, and a profile-driven symbol bar above the keyboard.

### 4.2 Toolbar and status bar

```
[≡]  hola-mundo.sc ✎                                            ▶  ⏭  ⏹
…
 Ln 12, Col 4  ·  Perfil: es  ·  Índice base 1  ·  ⚠ 2  ·  ● Listo
```

- Toolbar: menu, editable filename with unsaved dot, run controls. Run controls are
  state-driven: idle `▶`; running `⏸ ⏹`; paused `▶ ⏭ ⏹`.
- Menu (`≡`, a real dropdown): Nuevo · Abrir · Guardar · Guardar como · Ejemplos ▸ ·
  Compartir · Perfil ▸ · Vista ▸ · Tema · Ajustes · Acerca de. Open/Save use the File System
  Access API where available, download/upload otherwise.
- Status bar (hidden in embeds): cursor, active profile, meaning-changing options, diagnostic
  count, run state. Each item opens its Settings section.
- Shortcuts: `Ctrl+S` save, `F5` run, `F10` step, `Shift+F5` stop, `Ctrl+,` settings.

### 4.3 Settings

Dialog with sections: Lenguaje (profile picker, every option, grammar builder for custom
profiles with JSON import/export), Editor, Ejecución, Apariencia (theme; UI language ES/EN,
separate from the profile), Diseño (reset layout). All settings, the active profile, custom
profiles, and the layout persist in `localStorage` under one versioned key with migrations.
Programs persist in IndexedDB.

### 4.4 Programs by URL

Resolved in order: `#code=<base64url(deflate(source))>&profile=es` (native
`CompressionStream`), `?example=<id>` (bundled examples), `?src=<url>` (allowlisted hosts).
Flags: `readonly`, `autorun`, `hideProfile`. Share produces the `#code=` form.

### 4.5 Embedded mode

Route `/embed`: compact chrome, editor + console stacked, no dockview, no persistence, no PWA
prompt; configured entirely by URL. `postMessage` out: `ready`, `height`, `output`, `done`;
in: `run`, `setSource`. The academy embeds an iframe; no shared React or CSS.

### 4.6 Runtime host

`RuntimeHost` owns the worker and a typed protocol:

```
editor → worker: load{source,profile} · run · step · continue · input{value} · setBreakpoints{lines} · stop
worker → editor: diagnostics · output{text} · input-request{prompt} · paused{line,frames} · done · error
```

`compile` runs on the main thread for editor feedback and again in the worker for execution.

## 5. Tooling

| Concern | Choice |
|---|---|
| Package manager | pnpm workspaces; `pnpm -r` topological builds, `--filter`; no Turborepo (revisit at CI > ~5 min or a third app) |
| Language | TypeScript strict, ESM only |
| Lint/format | Biome |
| Tests | Vitest workspace; browser mode for `codemirror`; Playwright smoke for the editor |
| Library builds | tsdown; a `development` export condition points at `src/` so the editor's dev server needs no builds |
| Versioning | Changesets; independent semver |
| CI | GitHub Actions: lint, typecheck, test, build on PR; publish on tag |
| Node | 24 LTS, `.nvmrc` + `packageManager` |

Published: `stepcode` (keeps the existing npm name), `@stepcode/profiles`,
`@stepcode/codemirror`, `@stepcode/textmate`. The editor is private.

## 6. Testing strategy

- Unit tests per unit: lexer tokens, parser AST snapshots, checker diagnostics by code,
  interpreter values.
- Conformance corpus in `packages/language/test/corpus/`: `(program, inputs, profile) →
  outputs / diagnostics`, run end-to-end through `runProgram`. Seeded from v1's test programs,
  extended per feature.
- Stepping tests: step N times, inspect, assert frames.
- Profiles: each shipped profile resolves; collision and inheritance cases.
- textmate: snapshots per profile plus a Shiki tokenization test.
- Editor: component and store tests; `RuntimeHost` against a real worker; Playwright for
  run/step on desktop and mobile viewports and for the embed route.
- TDD throughout.

## 7. Delivery plan

Each item is its own spec → plan → implementation cycle.

1. **Monorepo skeleton** — tooling, empty packages with one passing test each, CI green, v1
   `src/` removed, v1 test programs moved to the corpus directory as raw fixtures.
2. **Profiles.**
3. **Language** — split into sub-specs: lexer+parser+AST; checker+diagnostics;
   interpreter+run controller.
4. **Editor shell** — in parallel with 3, against a stub runtime; integration is the last task.
5. **codemirror** — after 3's AST exists.
6. **textmate** — anytime after 2.
7. **Release** — `stepcode@2.0.0`, merge `RolandoAndrade/v2` to `master`, repoint Cloudflare
   Pages, delete the `stepcode-subdomain` worker, update the academy.

## 8. History and branches

This branch becomes the monorepo, so the language's history is kept. The archived
`stepcode-editor` and `lezer-stepcode` repositories are not imported. `master` keeps v0.12.0
and the deployed editor until v2 reaches parity.
