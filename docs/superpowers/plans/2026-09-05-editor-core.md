# Editor core (sub-project 4a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `packages/editor` run a StepCode program end to end against the real runtime — edit with the `@stepcode/codemirror` language support, run, pause, step, set breakpoints, answer inputs, inspect variables, read problems — themed with One Light / One Dark tokens, and deployable to Cloudflare Workers from the first commit.

**Architecture:** A Web Worker owns execution: `src/runtime/driver.ts` is a state machine over the language package's `Run` that time-slices `continue({ budget })`, batches output, and posts typed messages; `src/runtime/host.ts` (`RuntimeHost`) spawns the worker, relays messages, and stops by terminate-and-respawn. A vanilla Zustand store (`src/store/store.ts`) is the host's only subscriber and the only state React reads; panels (`Editor`, `Console`, `Variables`, `Problems`) and the toolbar select from it through a context hook. Colors exist once, as semantic CSS variables in `src/theme/tokens.css`, consumed by Tailwind (`@theme inline`) and by the CodeMirror theme and highlight style (`var(--sc-…)`). `wrangler.jsonc` describes an assets-only Worker that Workers Builds deploys from the repository.

**Tech Stack:** TypeScript 7 (strict, ESM), React 19, Vite 8, Tailwind 4, Zustand 5 (vanilla store + `useStore`), CodeMirror 6 (`@codemirror/state`, `view`, `language`, `lint`, `commands`, `@lezer/highlight`), Vitest 4.1 with `happy-dom` opted in per file and `@vitest/web-worker` for the real-worker test, Biome 2.5, pnpm 11 workspace, wrangler 4. New dependencies: `zustand` ^5.0.15, `@codemirror/commands` ^6.11.0 (catalog), the catalog CodeMirror/Lezer packages already used by `@stepcode/codemirror`, the three workspace packages; dev: `@vitest/web-worker` ^4.1.11 (same major as the catalog's `vitest`), `@types/node` (catalog), `wrangler` 4.129.0 (Task 13). Versions checked on npm on 2026-09-05; pnpm's `minimumReleaseAge` may resolve a slightly older patch — accept what `pnpm add` resolves and record it in the task report, never add exclusions.

**Spec:** `docs/superpowers/specs/2026-09-05-editor-core-design.md` (all sections). Consumes `docs/superpowers/specs/2026-09-04-language-interpreter-design.md` §3 (`Run`, `StepResult`, `Frame`), `docs/superpowers/specs/2026-09-04-codemirror-design.md` §3 (public surface) and §8 (debug classes). Parent: `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` §4, §3.2, §3.5.

## Deviations from the spec, decided while planning

1. **`Theme` type and the host interface live in Task 1.** The store (Task 4) needs the host's method set and the `Theme` type before `host.ts` (Task 3) and `theme/theme.ts` (Task 5) exist, and the three run in parallel. `src/runtime/host-api.ts` declares `HostApi` (the method set of spec §5); `src/theme/types.ts` declares `Theme`. `RuntimeHost implements HostApi`; the store depends on the interface only, so its tests use a fake host.
2. **The store does not import `applyTheme`.** Spec §8.2 says `setTheme` calls `applyTheme`; to keep Tasks 4 and 5 parallel, `createEditorStore(host, { applyTheme })` receives it as an option and `main.tsx` (Task 12) passes the real one. Behavior is the spec's; the wiring point moved.
3. **The React hook requires a provider.** `useEditorStore(selector)` reads the store from `StoreContext` and throws without a `StoreProvider`, so every test renders with its own store and fake host, and `main.tsx` provides the one real store. The spec's "the store is the only subscriber of `RuntimeHost`" holds: one store, one host, created in `main.tsx`.
4. **The "tokens only" assertion for the CodeMirror theme and highlight style moves from `theme.test.ts` (Task 5) to `extensions.test.ts` (Task 6)**, because Task 6 owns those two files and runs after Task 5. `theme.test.ts` keeps the token-set and contrast assertions.
5. **The editor panel exposes an imperative handle.** Spec §7.1 says Problems selects through `revealSpan(from, to)`. `Editor` takes a `handleRef` (`EditorHandle = { view, revealSpan }`); `Problems` takes an `onReveal(from, to)` prop; `App` connects them. Problems (Task 10) therefore does not depend on Editor (Task 7) and its test drives a real `EditorView` of its own.
6. **Test helpers split by environment.** `test/helpers.ts` stays Node-safe (recording port, corpus, profile inputs); `test/fake-host.ts` and `test/render.tsx` (Task 4) carry the fake host, `storeWith`, and `renderWithStore`, which import React and Testing Library and are only imported by happy-dom test files.
7. **`wrangler.jsonc` is written as plain JSON** (valid JSONC) so `deploy.test.ts` can `JSON.parse` it; the `$schema` key documents it.

## Parallelism

Waves. A task starts when every task it depends on is complete and reviewed. Inside a wave the file sets are disjoint; commit interleaving across parallel tasks is expected and review packages are built by path.

| Wave | Tasks | Owned files (nothing else is touched) |
|---|---|---|
| 1 | **1** | `packages/editor/{package.json,vite.config.ts,tsconfig.json}`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `src/strings.ts`, `src/runtime/protocol.ts`, `src/runtime/host-api.ts`, `src/store/output.ts`, `src/theme/types.ts`, `src/labels.ts`, `test/{setup.ts,helpers.ts,strings.test.ts,output.test.ts,labels.test.ts}` |
| 2 | **2** | `src/runtime/driver.ts`, `test/driver.test.ts` |
| 2 | **4** | `src/store/store.ts`, `src/store/context.tsx`, `test/fake-host.ts`, `test/render.tsx`, `test/store.test.ts` |
| 2 | **5** | `src/theme/tokens.css`, `src/theme/theme.ts`, `src/index.css`, `test/theme.test.ts` |
| 3 | **3** | `src/runtime/worker.ts`, `src/runtime/host.ts`, `test/host.test.ts` |
| 3 | **6** | `src/editor/highlight.ts`, `src/editor/theme.ts`, `src/editor/extensions.ts`, `test/extensions.test.ts` |
| 3 | **8** | `src/panels/Console.tsx`, `test/Console.test.tsx` |
| 3 | **9** | `src/panels/values.ts`, `src/panels/Variables.tsx`, `test/values.test.ts`, `test/Variables.test.tsx` |
| 3 | **10** | `src/panels/Problems.tsx`, `test/Problems.test.tsx` |
| 3 | **11** | `src/components/shortcuts.ts`, `src/components/Toolbar.tsx`, `test/shortcuts.test.ts`, `test/Toolbar.test.tsx` |
| 4 | **7** | `src/panels/Editor.tsx`, `test/Editor.test.tsx` |
| 5 | **12** | `src/App.tsx`, `src/main.tsx`, `test/App.test.tsx`, `packages/editor/README.md`, `packages/codemirror/src/index.ts`, `packages/codemirror/test/index.test.ts` |
| 5 | **13** (after 12) | `packages/editor/wrangler.jsonc`, `packages/editor/package.json` (wrangler dev dependency), `pnpm-lock.yaml`, `.github/workflows/ci.yml`, `packages/editor/README.md` (append), `test/deploy.test.ts` |

Dependencies: 1 → {2, 4, 5}; 3 ← 2; 6 ← 5; {8, 9, 10, 11} ← 4; 7 ← {4, 6}; 12 ← all; 13 ← 12. Every string any task renders is defined in Task 1 (`src/strings.ts` is never edited again). `package.json` is edited by Task 1 and Task 13 only. `src/index.css` by Task 5 only. `test/helpers.ts` by Task 1 only.

## Global Constraints

These are the spec's binding rules and the repository's conventions. They hold in every task; do not weaken them.

- **TypeScript strict** with `tsconfig.base.json`: `noUncheckedIndexedAccess` (every index access is `T | undefined`), `exactOptionalPropertyTypes` (never assign `undefined` to an optional property — omit the key), `verbatimModuleSyntax` (`import type`), `noFallthroughCasesInSwitch`, `isolatedModules`. Imports are extensionless. The checker's `Symbol` type shadows the global; the editor never imports it.
- **Dependencies** are exactly those in the Tech Stack line. No dockview, no PWA plugin, no icon library, no Playwright, no Vitest browser mode.
- **Colors exist only in `src/theme/tokens.css`.** No hex, `rgb(`, or named color anywhere else — chrome uses Tailwind utilities mapped to tokens (`bg-bg`, `bg-surface`, `bg-surface-raised`, `text-fg`, `text-muted`, `border-border`, `text-error`, `text-warning`, `text-success`, `text-accent`), CodeMirror uses `var(--sc-…)`.
- **The store has no React import.** `src/store/store.ts` uses `zustand/vanilla`; React enters through `src/store/context.tsx` only.
- **The driver and worker have no DOM import.** `src/runtime/driver.ts` and `src/runtime/worker.ts` import only from `stepcode`, `@stepcode/profiles`, and `./protocol`.
- **Biome** (`biome.json`: 2-space indent, single quotes, no semicolons, trailing commas, line width 100, organized imports). Run `pnpm lint:fix` before every commit; `pnpm lint` must exit 0. Every command runs from the repo root.
- **Commands.** One file: `pnpm vitest run --project @stepcode/editor packages/editor/test/<file>`; the package: `pnpm vitest run --project @stepcode/editor`; typecheck: `pnpm --filter @stepcode/editor typecheck`; the codemirror package (Task 12): `pnpm vitest run --project @stepcode/codemirror`; whole repo: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`.
- **Strict TDD**: every step writes the failing test first, runs it to see the expected failure, then writes the minimal implementation, then runs it green. **One commit per task** (or per step group the task names), conventional-commit style (`feat(editor): …`, `test(editor): …`, `docs(editor): …`, `chore(editor): …`, `ci: …`), **no attribution trailers**, no pushing.
- **Never use bare `git stash` / `git stash pop`** (the stash is shared with other worktrees). Use a temporary WIP commit to set work aside.
- **English artifacts**: code, comments, test names, README and commit messages are English. UI copy lives in `src/strings.ts` in `es` and `en`. Test programs are Spanish StepCode under the `es` profile.
- **happy-dom is opt-in per file** with `// @vitest-environment happy-dom` as the first line. Every other test runs under Node and touches no DOM. A file that imports `test/render.tsx` or `test/fake-host.ts`'s React helpers must be a happy-dom file.
- **Corpus reuse, not duplication.** `test/helpers.ts` reads `packages/language/test/corpus/programs` in place through `node:url`'s own `URL` (happy-dom replaces the global one).
- **Every string comes from `stringsFor(locale)`.** Components never hold literal UI copy.

## File Structure

Everything below `packages/editor/` unless a path starts with `packages/codemirror/` or `.github/`.

```
package.json, vite.config.ts, tsconfig.json                  (Task 1; Task 13 adds wrangler)
wrangler.jsonc                                               (Task 13)
README.md                                                    (Task 12; Task 13 appends)
src/
  strings.ts          Strings, stringsFor(locale)             (Task 1)
  labels.ts           typeLabel(type, profile, strings)        (Task 1)
  index.css           tailwind + tokens + @theme inline       (Task 5)
  main.tsx            store creation, initial theme, mount    (Task 12)
  App.tsx             toolbar + grid of panels                (Task 12)
  runtime/
    protocol.ts       HostMessage, WorkerMessage, WorkerState, DriverPort   (Task 1)
    host-api.ts       HostApi interface                       (Task 1)
    driver.ts         createDriver(port, options)             (Task 2)
    worker.ts         worker entry                            (Task 3)
    host.ts           RuntimeHost, defaultSpawn               (Task 3)
  store/
    output.ts         OutputBuffer, appendOutput, OUTPUT_CAP  (Task 1)
    store.ts          createEditorStore, StoreState, selectors (Task 4)
    context.tsx       StoreProvider, useEditorStore           (Task 4)
  theme/
    types.ts          Theme                                    (Task 1)
    tokens.css        the token blocks                         (Task 5)
    theme.ts          resolveInitialTheme, applyTheme, contrastRatio, parseTokens, TOKEN_NAMES (Task 5)
  editor/
    highlight.ts      HIGHLIGHT_SPECS, appHighlightStyle       (Task 6)
    theme.ts          EDITOR_THEME_SPEC, appEditorTheme        (Task 6)
    extensions.ts     createExtensions, languageExtension, readOnlyExtension, darkExtension (Task 6)
  panels/
    Editor.tsx        EditorHandle, Editor                     (Task 7)
    Console.tsx       Console                                  (Task 8)
    values.ts         renderArray, typeLabel, valueLabel       (Task 9)
    Variables.tsx     Variables                                (Task 9)
    Problems.tsx      Problems                                 (Task 10)
  components/
    shortcuts.ts      shortcutFor, installShortcuts            (Task 11)
    Toolbar.tsx       Toolbar                                  (Task 11)
test/
  setup.ts, helpers.ts, strings.test.ts, output.test.ts, labels.test.ts (Task 1)
  driver.test.ts                                               (Task 2)
  host.test.ts                                                 (Task 3)
  fake-host.ts, render.tsx, store.test.ts                      (Task 4)
  theme.test.ts                                                (Task 5)
  extensions.test.ts                                           (Task 6)
  Editor.test.tsx                                              (Task 7)
  Console.test.tsx                                             (Task 8)
  values.test.ts, Variables.test.tsx                           (Task 9)
  Problems.test.tsx                                            (Task 10)
  shortcuts.test.ts, Toolbar.test.tsx                          (Task 11)
  App.test.tsx                                                 (Task 12)
  deploy.test.ts                                               (Task 13)
```

Facts every task relies on (verified 2026-09-05 against the workspace sources):

- `stepcode` exports `compile(source, { profile }): CompileResult` (`diagnostics`, `ast`, `symbols`, `source`, `tokens`), `start(program, { profile, io: { write, clear? } }): Run`, `Run` (`state`, `step()`, `stepOver()`, `stepOut()`, `continue({ budget? })`, `input(text)`, `setBreakpoints(lines)`, `inspect()`), `StepResult` (`paused { reason: 'step'|'breakpoint'|'budget', line, frames }`, `input { line, target: { name, type } | null, rejected? }`, `wait { line, millis }`, `done`, `error { diagnostic, frames }`), `Frame { name, line, variables: FrameVariable[] }`, `FrameVariable { name, kind: SymbolKind, type: Type, value: RuntimeValue | undefined }`, `RuntimeValue = number | string | boolean | ArrayValue`, `ArrayValue { element: TypeKey, dims, data: (Scalar | undefined)[] }` row-major, `Type = { kind: 'scalar', name: TypeKey } | { kind: 'array', element, rank } | { kind: 'unknown' }`, `renderValue(value, type, profile): string` (scalars only, throws on arrays), `formatDiagnostic(diagnostic, locale, profile): string`, `LineMap(source)` with `positionAt(offset): { line, column }` (1-based), `Diagnostic { code, severity: 'error'|'warning', span: { start, end }, data }`, `SymbolKind = 'variable'|'parameter'|'result'|'constant'|'counter'|'subprogram'`.
- `@stepcode/profiles` exports `profiles.{es,en,pseint}: ResolvedProfile`, `builtinProfiles: ProfileRegistry` (a `Map<string, ProfileInput>`), `resolveProfile(input, registry)`, `ProfileInput` (the JSON shape: `{ id, locale, keywords, types, operators, builtins, options }` or `{ id, extends, … }`), `TypeKey = 'integer'|'real'|'string'|'char'|'boolean'`; `profile.types[key]` is the spelling list (`['Entero']`, …); `profile.locale`.
- `@stepcode/codemirror` exports `stepcode({ profile, locale? }): LanguageSupport`, `stepcodeDiagnostics(state, { profile, locale }): readonly LintDiagnostic[]` (messages already formatted, `source` = code), `debug()`, `setCurrentLine: StateEffectType<number | null>`, `setBreakpoints: StateEffectType<readonly number[]>`, `breakpointLines(state): number[]`, `breakpointsChanged(update): boolean`, `packageName` (removed in Task 12). Its base theme classes: `.cm-stepcode-breakpoints` (gutter), `.cm-stepcode-breakpoint`, `.cm-stepcode-breakpoint-spacer`, `.cm-stepcode-current-line-marker`, `.cm-stepcode-current-line`, `.cm-stepcode-hover`, `.cm-stepcode-signature`, `.cm-stepcode-signature-active`.
- Highlight tags the language emits (`packages/codemirror/src/nodes.ts`): `controlKeyword`, `definitionKeyword`, `operatorKeyword`, `keyword`, `bool`, `typeName`, `function(standard(variableName))` (builtins), `definitionOperator`, `compareOperator`, `arithmeticOperator`, `number`, `string`, `lineComment`, `variableName`, `definition(variableName)`, `function(definition(variableName))`, `function(variableName)`, `paren`, `squareBracket`, `separator`, `invalid`.
- StepCode `es` syntax used by the test programs: `Proceso nombre … FinProceso`, `Definir a, b Como Entero;`, `a <- 1;`, `Escribir 'x', a;`, `Leer n;`, `Esperar 500;`, `Esperar Tecla;`, `Para i <- 1 Hasta 3 Hacer … FinPara`, `Mientras cond Hacer … FinMientras`, `SubProceso nombre(p Como Entero) … FinSubProceso`, `Funcion r Como Entero <- doble(n Como Entero) … FinFuncion`. `Escribir` appends `\n`; `Escribir Sin Saltar` does not.
- Corpus sidecars: `packages/language/test/corpus/programs/<slug>.run.json` = `{ runs: [{ name?, inputs: string[], output: string, seed? }] }`; `index-base-0.txt` lists slugs needing `indexBase: 0`.
- Root `vitest.config.ts` uses `projects: ['packages/*']`; each package config sets `test.name`.

---

### Task 1: package wiring, strings, protocol, output buffer

**Files:**
- Modify: `packages/editor/package.json` (whole file)
- Modify: `packages/editor/vite.config.ts` (whole file)
- Modify: `packages/editor/tsconfig.json` (whole file)
- Modify: `pnpm-workspace.yaml` (the `catalog:` block)
- Create: `packages/editor/src/strings.ts`
- Create: `packages/editor/src/runtime/protocol.ts`
- Create: `packages/editor/src/runtime/host-api.ts`
- Create: `packages/editor/src/store/output.ts`
- Create: `packages/editor/src/theme/types.ts`
- Create: `packages/editor/src/labels.ts`
- Modify: `packages/editor/test/setup.ts` (whole file)
- Create: `packages/editor/test/helpers.ts`
- Test: `packages/editor/test/strings.test.ts`, `packages/editor/test/output.test.ts`, `packages/editor/test/labels.test.ts`

**Interfaces:**
- Consumes: `SymbolKind`, `Frame`, `Diagnostic`, `Type` from `stepcode`; `ProfileInput`, `builtinProfiles` from `@stepcode/profiles`.
- Produces: `Strings` and `stringsFor(locale: string): Strings` (every later task); `HostMessage`, `WorkerMessage`, `WorkerState`, `DriverPort`, `RunMode` in `protocol.ts` (Tasks 2, 3, 4); `HostApi` in `host-api.ts` (Tasks 3, 4); `OutputBuffer`, `emptyOutput`, `appendOutput(buffer, chunks, cap?)`, `OUTPUT_CAP` in `store/output.ts` (Tasks 4, 8); `Theme`, `THEMES` in `theme/types.ts` (Tasks 4, 5, 11); `typeLabel(type, profile, strings)` in `labels.ts` (Tasks 8, 9); test helpers `recordingPort()`, `profileInput(id)`, `corpusPrograms()`, `ES_INDEX_0` (Tasks 2, 3).

- [ ] **Step 1: Write the failing strings test**

Create `packages/editor/test/strings.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'

describe('stringsFor', () => {
  it('returns Spanish for es', () => {
    const s = stringsFor('es')
    expect(s.toolbar.run).toBe('Ejecutar')
    expect(s.console.read('n', 'Entero')).toBe('Leer n (Entero)')
    expect(s.console.waiting(500)).toBe('Esperando 500 ms')
    expect(s.variables.arrayOf('Entero', 1)).toBe('Arreglo de Entero')
    expect(s.variables.arrayOf('Entero', 2)).toBe('Arreglo de Entero (2D)')
    expect(s.problems.summary(1, 2)).toBe('1 error, 2 advertencias')
    expect(s.toolbar.errors(1)).toBe('1 error')
    expect(s.toolbar.errors(3)).toBe('3 errores')
  })

  it('returns English for en', () => {
    const s = stringsFor('en')
    expect(s.toolbar.stepOver).toBe('Step over')
    expect(s.console.pressKey).toBe('Press a key')
    expect(s.console.dropped(12)).toBe('… 12 chunks dropped')
    expect(s.variables.empty).toBe('No program running')
    expect(s.problems.summary(0, 1)).toBe('0 errors, 1 warning')
  })

  it('falls back by primary subtag, then to es', () => {
    expect(stringsFor('en-US').toolbar.run).toBe('Run')
    expect(stringsFor('es-MX').toolbar.run).toBe('Ejecutar')
    expect(stringsFor('pt-BR')).toBe(stringsFor('es'))
    expect(stringsFor('')).toBe(stringsFor('es'))
  })

  it('names every symbol kind and every worker state in both locales', () => {
    const kinds = ['variable', 'parameter', 'result', 'constant', 'counter', 'subprogram'] as const
    const states = ['ready', 'running', 'paused', 'input', 'waiting', 'done', 'error'] as const
    for (const locale of ['es', 'en']) {
      const s = stringsFor(locale)
      for (const kind of kinds) expect(s.kinds[kind].length).toBeGreaterThan(0)
      for (const state of states) expect(s.states[state].length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/strings.test.ts`
Expected: FAIL — `Failed to resolve import "../src/strings"` (the project name may be reported as the package name until Step 5 sets it; if Vitest reports "No projects matched", run `pnpm --filter @stepcode/editor exec vitest run test/strings.test.ts` for this one step).

- [ ] **Step 3: Write the strings table**

Create `packages/editor/src/strings.ts`:

```ts
import type { SymbolKind } from 'stepcode'
import type { WorkerState } from './runtime/protocol'

/** Every human string the editor renders. Diagnostics come formatted from the language package. */
export interface Strings {
  readonly app: { readonly title: string; readonly editor: string }
  readonly toolbar: {
    readonly run: string
    readonly continue: string
    readonly step: string
    readonly stepOver: string
    readonly stepInto: string
    readonly stepOut: string
    readonly pause: string
    readonly stop: string
    readonly profile: string
    readonly toLight: string
    readonly toDark: string
    readonly errors: (count: number) => string
    readonly warnings: (count: number) => string
  }
  readonly states: Readonly<Record<WorkerState, string>>
  readonly console: {
    readonly title: string
    readonly clear: string
    readonly read: (name: string, type: string) => string
    readonly pressKey: string
    readonly placeholder: string
    readonly submit: string
    readonly waiting: (millis: number) => string
    readonly errorAt: (line: number, message: string) => string
    readonly dropped: (count: number) => string
  }
  readonly variables: {
    readonly title: string
    readonly empty: string
    readonly name: string
    readonly kind: string
    readonly type: string
    readonly value: string
    readonly unassigned: string
    readonly frameAt: (name: string, line: number) => string
    readonly arrayOf: (element: string, rank: number) => string
    readonly more: (count: number) => string
  }
  readonly problems: {
    readonly title: string
    readonly empty: string
    readonly summary: (errors: number, warnings: number) => string
  }
  readonly kinds: Readonly<Record<SymbolKind, string>>
}

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

const es: Strings = {
  app: { title: 'StepCode', editor: 'Editor' },
  toolbar: {
    run: 'Ejecutar',
    continue: 'Continuar',
    step: 'Paso',
    stepOver: 'Pasar por encima',
    stepInto: 'Entrar',
    stepOut: 'Salir',
    pause: 'Pausar',
    stop: 'Detener',
    profile: 'Perfil',
    toLight: 'Tema claro',
    toDark: 'Tema oscuro',
    errors: (count) => plural(count, 'error', 'errores'),
    warnings: (count) => plural(count, 'advertencia', 'advertencias'),
  },
  states: {
    ready: 'Listo',
    running: 'Ejecutando',
    paused: 'En pausa',
    input: 'Esperando entrada',
    waiting: 'Esperando',
    done: 'Terminado',
    error: 'Error',
  },
  console: {
    title: 'Consola',
    clear: 'Limpiar',
    read: (name, type) => `Leer ${name} (${type})`,
    pressKey: 'Presiona una tecla',
    placeholder: 'Escribe y presiona Enter',
    submit: 'Enviar',
    waiting: (millis) => `Esperando ${millis} ms`,
    errorAt: (line, message) => `Línea ${line}: ${message}`,
    dropped: (count) => `… ${count} fragmentos descartados`,
  },
  variables: {
    title: 'Variables',
    empty: 'Sin programa en ejecución',
    name: 'Nombre',
    kind: 'Clase',
    type: 'Tipo',
    value: 'Valor',
    unassigned: '—',
    frameAt: (name, line) => `${name} · línea ${line}`,
    arrayOf: (element, rank) => (rank === 1 ? `Arreglo de ${element}` : `Arreglo de ${element} (${rank}D)`),
    more: (count) => `… (+${count})`,
  },
  problems: {
    title: 'Problemas',
    empty: 'Sin problemas',
    summary: (errors, warnings) =>
      `${plural(errors, 'error', 'errores')}, ${plural(warnings, 'advertencia', 'advertencias')}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
}

const en: Strings = {
  app: { title: 'StepCode', editor: 'Editor' },
  toolbar: {
    run: 'Run',
    continue: 'Continue',
    step: 'Step',
    stepOver: 'Step over',
    stepInto: 'Step into',
    stepOut: 'Step out',
    pause: 'Pause',
    stop: 'Stop',
    profile: 'Profile',
    toLight: 'Light theme',
    toDark: 'Dark theme',
    errors: (count) => plural(count, 'error', 'errors'),
    warnings: (count) => plural(count, 'warning', 'warnings'),
  },
  states: {
    ready: 'Ready',
    running: 'Running',
    paused: 'Paused',
    input: 'Waiting for input',
    waiting: 'Waiting',
    done: 'Done',
    error: 'Error',
  },
  console: {
    title: 'Console',
    clear: 'Clear',
    read: (name, type) => `Read ${name} (${type})`,
    pressKey: 'Press a key',
    placeholder: 'Type and press Enter',
    submit: 'Send',
    waiting: (millis) => `Waiting ${millis} ms`,
    errorAt: (line, message) => `Line ${line}: ${message}`,
    dropped: (count) => `… ${count} chunks dropped`,
  },
  variables: {
    title: 'Variables',
    empty: 'No program running',
    name: 'Name',
    kind: 'Kind',
    type: 'Type',
    value: 'Value',
    unassigned: '—',
    frameAt: (name, line) => `${name} · line ${line}`,
    arrayOf: (element, rank) => (rank === 1 ? `Array of ${element}` : `Array of ${element} (${rank}D)`),
    more: (count) => `… (+${count})`,
  },
  problems: {
    title: 'Problems',
    empty: 'No problems',
    summary: (errors, warnings) =>
      `${plural(errors, 'error', 'errors')}, ${plural(warnings, 'warning', 'warnings')}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
}

const tables: Readonly<Record<string, Strings>> = { es, en }

/** Spec §11: by primary subtag; anything unknown is Spanish, the editor's home locale. */
export function stringsFor(locale: string): Strings {
  const primary = locale.toLowerCase().split('-')[0] ?? ''
  return tables[primary] ?? es
}
```

- [ ] **Step 4: Write the protocol, the host interface, and the theme type**

Create `packages/editor/src/runtime/protocol.ts`:

```ts
import type { ProfileInput } from '@stepcode/profiles'
import type { Diagnostic, Frame, Type } from 'stepcode'

export type RunMode = 'run' | 'step'

/** Spec §3. Every member is structured-clone safe. */
export type HostMessage =
  | {
      readonly kind: 'start'
      readonly source: string
      readonly profile: ProfileInput
      readonly breakpoints: readonly number[]
      readonly mode: RunMode
    }
  | { readonly kind: 'step' }
  | { readonly kind: 'stepOver' }
  | { readonly kind: 'stepOut' }
  | { readonly kind: 'continue' }
  | { readonly kind: 'pause' }
  | { readonly kind: 'input'; readonly text: string }
  | { readonly kind: 'setBreakpoints'; readonly lines: readonly number[] }

export type WorkerState = 'ready' | 'running' | 'paused' | 'input' | 'waiting' | 'done' | 'error'

export type PauseReason = 'step' | 'breakpoint' | 'pause'

export interface InputTarget {
  readonly name: string
  readonly type: Type
}

export type WorkerMessage =
  | { readonly kind: 'state'; readonly state: WorkerState }
  | { readonly kind: 'output'; readonly chunks: readonly string[] }
  | { readonly kind: 'clear' }
  | {
      readonly kind: 'paused'
      readonly reason: PauseReason
      readonly line: number
      readonly frames: readonly Frame[]
    }
  | {
      readonly kind: 'input'
      readonly line: number
      readonly target: InputTarget | null
      readonly rejected?: Diagnostic
    }
  | { readonly kind: 'wait'; readonly line: number; readonly millis: number }
  | { readonly kind: 'done'; readonly frames: readonly Frame[] }
  | { readonly kind: 'error'; readonly diagnostic: Diagnostic; readonly frames: readonly Frame[] }

/** What the driver needs from a worker's global scope — or from a test's recording port. */
export interface DriverPort {
  postMessage(message: WorkerMessage): void
  onmessage: ((event: { readonly data: HostMessage }) => void) | null
}
```

Create `packages/editor/src/runtime/host-api.ts`:

```ts
import type { ProfileInput } from '@stepcode/profiles'
import type { RunMode, WorkerMessage } from './protocol'

export type HostListener = (message: WorkerMessage) => void

/** Spec §5: the runtime host as the store sees it. `RuntimeHost` implements it; tests fake it. */
export interface HostApi {
  subscribe(listener: HostListener): () => void
  start(source: string, profile: ProfileInput, breakpoints: readonly number[], mode: RunMode): void
  step(): void
  stepOver(): void
  stepOut(): void
  continue(): void
  pause(): void
  input(text: string): void
  setBreakpoints(lines: readonly number[]): void
  stop(): void
  dispose(): void
}
```

Create `packages/editor/src/theme/types.ts`:

```ts
export type Theme = 'light' | 'dark'

export const THEMES: readonly Theme[] = ['light', 'dark']
```

- [ ] **Step 5: Wire the package**

In `pnpm-workspace.yaml`, add to the `catalog:` block (keep every existing entry):

```yaml
  '@codemirror/commands': ^6.11.0
  '@vitest/web-worker': ^4.1.11
```

Replace `packages/editor/package.json` with:

```json
{
  "name": "@stepcode/editor",
  "version": "0.0.0",
  "private": true,
  "description": "The StepCode web editor (PWA)",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@codemirror/commands": "catalog:",
    "@codemirror/language": "catalog:",
    "@codemirror/lint": "catalog:",
    "@codemirror/state": "catalog:",
    "@codemirror/view": "catalog:",
    "@lezer/highlight": "catalog:",
    "@stepcode/codemirror": "workspace:*",
    "@stepcode/profiles": "workspace:*",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "stepcode": "workspace:*",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@testing-library/react": "^16.3.3",
    "@types/node": "catalog:",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "@vitest/web-worker": "catalog:",
    "happy-dom": "catalog:",
    "tailwindcss": "^4.3.3",
    "typescript": "catalog:",
    "vite": "^8.2.2",
    "vitest": "catalog:"
  }
}
```

Replace `packages/editor/vite.config.ts` with:

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    name: '@stepcode/editor',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
```

Replace `packages/editor/tsconfig.json` with:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "types": ["vite/client", "node"]
  },
  "include": ["src", "test", "vite.config.ts"]
}
```

Replace `packages/editor/test/setup.ts` with:

```ts
// Under happy-dom, Testing Library needs cleanup between tests and CodeMirror measures through
// two Range methods happy-dom does not implement. Under Node (`document` undefined) nothing runs.
const RECT = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }

if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  const { afterEach } = await import('vitest')
  afterEach(() => {
    cleanup()
  })
  if (typeof Range !== 'undefined') {
    const proto = Range.prototype as unknown as Record<string, unknown>
    if (typeof proto.getClientRects !== 'function') {
      proto.getClientRects = () => ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: [][Symbol.iterator],
      })
    }
    if (typeof proto.getBoundingClientRect !== 'function') {
      proto.getBoundingClientRect = () => ({ ...RECT, toJSON: () => RECT })
    }
  }
}
```

Run: `pnpm install`
Expected: the lockfile gains `zustand`, `@codemirror/commands`, `@vitest/web-worker` and the editor's links to the workspace packages; exit 0. Record the resolved versions in the task report.

- [ ] **Step 6: Run the strings test to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/strings.test.ts`
Expected: PASS (4 tests). The existing `test/App.test.tsx` still passes (it is happy-dom by config no longer — add `// @vitest-environment happy-dom` as its first line now; Task 12 rewrites it).

- [ ] **Step 7: Write the failing output buffer test**

Create `packages/editor/test/output.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { appendOutput, emptyOutput, OUTPUT_CAP } from '../src/store/output'

describe('appendOutput', () => {
  it('appends chunks in order without joining them', () => {
    const one = appendOutput(emptyOutput, ['a', 'b\n'])
    const two = appendOutput(one, ['c'])
    expect(two.chunks).toEqual(['a', 'b\n', 'c'])
    expect(two.dropped).toBe(0)
    expect(one.chunks).toEqual(['a', 'b\n'])
  })

  it('leaves the buffer untouched for an empty append', () => {
    const one = appendOutput(emptyOutput, ['a'])
    expect(appendOutput(one, [])).toBe(one)
  })

  it('drops the oldest chunks past the cap and counts them', () => {
    const cap = 3
    const one = appendOutput(emptyOutput, ['1', '2', '3'], cap)
    expect(one.dropped).toBe(0)
    const two = appendOutput(one, ['4', '5'], cap)
    expect(two.chunks).toEqual(['3', '4', '5'])
    expect(two.dropped).toBe(2)
    const three = appendOutput(two, ['6'], cap)
    expect(three.chunks).toEqual(['4', '5', '6'])
    expect(three.dropped).toBe(3)
  })

  it('handles one append larger than the cap', () => {
    const big = appendOutput(emptyOutput, ['1', '2', '3', '4', '5'], 2)
    expect(big.chunks).toEqual(['4', '5'])
    expect(big.dropped).toBe(3)
  })

  it('caps at 10 000 chunks by default', () => {
    expect(OUTPUT_CAP).toBe(10_000)
    const chunks = Array.from({ length: OUTPUT_CAP + 1 }, (_, i) => String(i))
    const out = appendOutput(emptyOutput, chunks)
    expect(out.chunks.length).toBe(OUTPUT_CAP)
    expect(out.chunks[0]).toBe('1')
    expect(out.dropped).toBe(1)
  })
})
```

- [ ] **Step 8: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/output.test.ts`
Expected: FAIL — `Failed to resolve import "../src/store/output"`.

- [ ] **Step 9: Write the output buffer**

Create `packages/editor/src/store/output.ts`:

```ts
/** Spec §6.1: the console's bounded, immutable-by-replacement output. */
export interface OutputBuffer {
  readonly chunks: readonly string[]
  /** How many chunks were dropped from the front since the buffer was last cleared. */
  readonly dropped: number
}

export const OUTPUT_CAP = 10_000

export const emptyOutput: OutputBuffer = Object.freeze({ chunks: [], dropped: 0 })

export function appendOutput(
  buffer: OutputBuffer,
  chunks: readonly string[],
  cap: number = OUTPUT_CAP,
): OutputBuffer {
  if (chunks.length === 0) return buffer
  const all = [...buffer.chunks, ...chunks]
  const excess = Math.max(0, all.length - cap)
  return { chunks: excess === 0 ? all : all.slice(excess), dropped: buffer.dropped + excess }
}
```

- [ ] **Step 10: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/output.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 11: Write the Node-safe test helpers**

Create `packages/editor/test/helpers.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { builtinProfiles, type ProfileInput } from '@stepcode/profiles'
import type { DriverPort, HostMessage, WorkerMessage } from '../src/runtime/protocol'

export type ProfileId = 'es' | 'en' | 'pseint'

/** The JSON input of a shipped profile, as the worker receives it. */
export function profileInput(id: ProfileId): ProfileInput {
  const input = builtinProfiles.get(id)
  if (input === undefined) throw new Error(`no builtin profile ${id}`)
  return input
}

/** `es` with 0-based arrays, for the corpus programs `index-base-0.txt` lists. */
export const ES_INDEX_0: ProfileInput = {
  id: 'es-index-0',
  extends: 'es',
  options: { indexBase: 0 },
}

export interface RecordingPort extends DriverPort {
  /** Every message the driver posted, in order. */
  readonly posted: WorkerMessage[]
  /** Deliver a host message to the driver, as the worker's `onmessage` would. */
  send(message: HostMessage): void
  /** The `kind`s posted so far, for compact assertions. */
  kinds(): string[]
  /** Everything written since the buffer was last cleared, joined. */
  text(): string
}

export function recordingPort(): RecordingPort {
  const posted: WorkerMessage[] = []
  const port: RecordingPort = {
    posted,
    onmessage: null,
    postMessage: (message) => {
      posted.push(message)
    },
    send: (message) => {
      if (port.onmessage === null) throw new Error('the driver has not attached to the port')
      port.onmessage({ data: message })
    },
    kinds: () => posted.map((message) => message.kind),
    text: () => {
      let out = ''
      for (const message of posted) {
        if (message.kind === 'clear') out = ''
        if (message.kind === 'output') out += message.chunks.join('')
      }
      return out
    },
  }
  return port
}

/** Resolves once `predicate` holds; polls with macrotasks so worker messages get delivered. */
export function until(predicate: () => boolean, timeoutMillis = 5000): Promise<void> {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const tick = (): void => {
      if (predicate()) {
        resolve()
      } else if (Date.now() - started > timeoutMillis) {
        reject(new Error('until: timed out'))
      } else {
        setTimeout(tick, 5)
      }
    }
    tick()
  })
}

// Built with `node:url`'s own `URL`: happy-dom replaces the global one with a polyfill that
// `fileURLToPath` does not recognise as a file URL.
const corpusRoot = fileURLToPath(new NodeURL('../../language/test/corpus/programs', import.meta.url))

export interface SidecarRun {
  readonly name?: string
  readonly inputs: readonly string[]
  readonly output: string
  readonly seed?: number
}

export interface CorpusProgram {
  readonly slug: string
  readonly source: string
  readonly profile: ProfileInput
  readonly runs: readonly SidecarRun[]
}

let corpus: CorpusProgram[] | undefined

/** Every conformance program with a sidecar, read in place. */
export function corpusPrograms(): readonly CorpusProgram[] {
  if (corpus !== undefined) return corpus
  const zero = new Set(
    readFileSync(join(corpusRoot, 'index-base-0.txt'), 'utf8')
      .split('\n')
      .filter((line) => line.length > 0),
  )
  corpus = readdirSync(corpusRoot)
    .filter((name) => name.endsWith('.stepcode'))
    .sort()
    .map((file) => {
      const slug = file.replace('.stepcode', '')
      const sidecar = JSON.parse(readFileSync(join(corpusRoot, `${slug}.run.json`), 'utf8')) as {
        runs: SidecarRun[]
      }
      return {
        slug,
        source: readFileSync(join(corpusRoot, file), 'utf8'),
        profile: zero.has(slug) ? ES_INDEX_0 : profileInput('es'),
        runs: sidecar.runs,
      }
    })
  return corpus
}

/** One corpus program by slug; throws when the corpus does not have it. */
export function corpusProgram(slug: string): CorpusProgram {
  const program = corpusPrograms().find((one) => one.slug === slug)
  if (program === undefined) throw new Error(`no corpus program ${slug}`)
  return program
}
```

- [ ] **Step 11b: Write the failing type-label test, then the helper**

Create `packages/editor/test/labels.test.ts`:

```ts
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { typeLabel } from '../src/labels'
import { stringsFor } from '../src/strings'

describe('typeLabel', () => {
  it('spells scalars with the profile and arrays with the strings', () => {
    const es = stringsFor('es')
    expect(typeLabel({ kind: 'scalar', name: 'integer' }, profiles.es, es)).toBe('Entero')
    expect(typeLabel({ kind: 'scalar', name: 'string' }, profiles.en, stringsFor('en'))).toBe('String')
    expect(typeLabel({ kind: 'array', element: 'real', rank: 1 }, profiles.es, es)).toBe('Arreglo de Real')
    expect(typeLabel({ kind: 'array', element: 'boolean', rank: 2 }, profiles.en, stringsFor('en'))).toBe(
      'Array of Boolean (2D)',
    )
    expect(typeLabel({ kind: 'unknown' }, profiles.es, es)).toBe('?')
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/labels.test.ts`
Expected: FAIL — `Failed to resolve import "../src/labels"`.

Create `packages/editor/src/labels.ts`:

```ts
import type { ResolvedProfile, TypeKey } from '@stepcode/profiles'
import type { Type } from 'stepcode'
import type { Strings } from './strings'

function spelling(key: TypeKey, profile: ResolvedProfile): string {
  return profile.types[key][0] ?? key
}

/** A type as the user spells it: the profile's first spelling, arrays through the strings. */
export function typeLabel(type: Type, profile: ResolvedProfile, strings: Strings): string {
  switch (type.kind) {
    case 'scalar':
      return spelling(type.name, profile)
    case 'array':
      return strings.variables.arrayOf(spelling(type.element, profile), type.rank)
    case 'unknown':
      return '?'
  }
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/labels.test.ts`
Expected: PASS (1 test).

- [ ] **Step 12: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0 (the `test/App.test.tsx` from the scaffold still compiles and still imports `packageName`; it stays until Task 12).

Run: `pnpm vitest run --project @stepcode/editor`
Expected: PASS (strings, output, App).

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml packages/editor
git commit -m "feat(editor): package wiring, strings, worker protocol, output buffer"
```

### Task 2: the driver

**Files:**
- Create: `packages/editor/src/runtime/driver.ts`
- Test: `packages/editor/test/driver.test.ts`

**Interfaces:**
- Consumes: `compile`, `start`, `Run`, `StepResult`, `Frame` from `stepcode`; `resolveProfile`, `builtinProfiles` from `@stepcode/profiles`; `DriverPort`, `HostMessage`, `WorkerMessage`, `WorkerState` from `./protocol`; test helpers `recordingPort`, `profileInput`, `until`.
- Produces: `createDriver(port: DriverPort, options?: DriverOptions): Driver` with `Driver = { readonly state: WorkerState; handle(message: HostMessage): void }`, `DriverOptions = { budget?, sliceMillis?, sleep?, now?, yield? }`, `DEFAULT_BUDGET = 5000`, `DEFAULT_SLICE_MILLIS = 30` (Task 3's worker entry calls `createDriver(port)`).

Resolution of one spec ambiguity: spec §4 says `setBreakpoints` before a `Run` exists "stores them for the next `start`", but every `start` message carries the full breakpoint set (§5, §6), and the later list must win. The driver therefore forwards `setBreakpoints` only to a live `Run` and otherwise ignores it; `start` applies `message.breakpoints`. Recorded as Deviation 8 below the task list.

- [ ] **Step 1: Write the failing driver tests**

Create `packages/editor/test/driver.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createDriver, type DriverOptions } from '../src/runtime/driver'
import type { HostMessage, WorkerMessage } from '../src/runtime/protocol'
import { profileInput, type RecordingPort, recordingPort, until } from './helpers'

const es = profileInput('es')

const COUNT = [
  'Proceso Contar',
  '  Definir i Como Entero;',
  '  Para i <- 1 Hasta 3 Hacer',
  '    Escribir i;',
  '  FinPara',
  'FinProceso',
].join('\n')

const GREET = [
  'Proceso Saludo',
  '  Definir nombre Como Cadena;',
  "  Escribir 'Nombre';",
  '  Leer nombre;',
  "  Escribir 'Hola ', nombre;",
  'FinProceso',
].join('\n')

const NUMBER = ['Proceso Numero', '  Definir n Como Entero;', '  Leer n;', '  Escribir n * 2;', 'FinProceso'].join('\n')

const WAIT = ['Proceso Pausa', "  Escribir 'a';", '  Esperar 50;', "  Escribir 'b';", 'FinProceso'].join('\n')

const CLEAR = ['Proceso Limpio', "  Escribir 'a';", '  Limpiar Pantalla;', "  Escribir 'b';", 'FinProceso'].join('\n')

const CALL = [
  'SubProceso Saludar(veces Como Entero)',
  '  Definir k Como Entero;',
  '  Para k <- 1 Hasta veces Hacer',
  "    Escribir 'hola';",
  '  FinPara',
  'FinSubProceso',
  '',
  'Proceso Principal',
  "  Escribir 'inicio';",
  '  Saludar(2);',
  "  Escribir 'fin';",
  'FinProceso',
].join('\n')

const LOOP = [
  'Proceso Bucle',
  '  Definir x Como Entero;',
  '  x <- 0;',
  '  Mientras x >= 0 Hacer',
  '    x <- x + 1;',
  '  FinMientras',
  'FinProceso',
].join('\n')

const BROKEN = ['Proceso Roto', '  Escribir x;', 'FinProceso'].join('\n')

function startMessage(
  source: string,
  mode: 'run' | 'step',
  breakpoints: readonly number[] = [],
): HostMessage {
  return { kind: 'start', source, profile: es, breakpoints, mode }
}

/** A driver over a recording port with instant sleeps and a yield on every slice. */
function harness(options: DriverOptions = {}): { port: RecordingPort; driver: ReturnType<typeof createDriver> } {
  const port = recordingPort()
  const driver = createDriver(port, { sleep: async () => {}, ...options })
  return { port, driver }
}

function last<K extends WorkerMessage['kind']>(port: RecordingPort, kind: K): Extract<WorkerMessage, { kind: K }> {
  const found = [...port.posted].reverse().find((message) => message.kind === kind)
  if (found === undefined) throw new Error(`no ${kind} message; got ${port.kinds().join(', ')}`)
  return found as Extract<WorkerMessage, { kind: K }>
}

function states(port: RecordingPort): string[] {
  return port.posted.flatMap((message) => (message.kind === 'state' ? [message.state] : []))
}

describe('start', () => {
  it('refuses a program with an error diagnostic and reports the first one', () => {
    const { port, driver } = harness()
    port.send(startMessage(BROKEN, 'run'))
    expect(port.kinds()).toEqual(['state', 'error'])
    expect(states(port)).toEqual(['error'])
    const error = last(port, 'error')
    expect(error.diagnostic.code).toBe('E3001')
    expect(error.frames).toEqual([])
    expect(driver.state).toBe('error')
  })

  it('runs a program to the end, posting output before done and no budget pauses', async () => {
    const { port } = harness()
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(port.kinds()).toEqual(['state', 'output', 'state', 'done'])
    expect(states(port)).toEqual(['running', 'done'])
    expect(port.text()).toBe('1\n2\n3\n')
    expect(last(port, 'done').frames[0]?.variables.map((v) => v.name)).toEqual(['i'])
  })

  it('in step mode executes the first statement and pauses', () => {
    const { port, driver } = harness()
    port.send(startMessage(COUNT, 'step'))
    expect(port.kinds()).toEqual(['state', 'paused'])
    const paused = last(port, 'paused')
    expect(paused.reason).toBe('step')
    expect(paused.frames[0]?.name).toBe('Contar')
    expect(driver.state).toBe('paused')
  })

  it('can start again after done and after a refusal', async () => {
    const { port } = harness()
    port.send(startMessage(BROKEN, 'run'))
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().filter((kind) => kind === 'done').length === 2)
    expect(port.text()).toBe('1\n2\n3\n1\n2\n3\n')
  })
})

describe('stepping', () => {
  it('steps to the end and ignores commands that are illegal in done', () => {
    const { port, driver } = harness()
    port.send(startMessage(COUNT, 'step'))
    for (let i = 0; i < 50 && driver.state === 'paused'; i++) port.send({ kind: 'step' })
    expect(driver.state).toBe('done')
    expect(port.text()).toBe('1\n2\n3\n')
    const before = port.posted.length
    port.send({ kind: 'step' })
    port.send({ kind: 'continue' })
    port.send({ kind: 'pause' })
    port.send({ kind: 'input', text: 'x' })
    expect(port.posted.length).toBe(before)
  })

  it('steps over a call without entering it', () => {
    const { port } = harness()
    port.send(startMessage(CALL, 'step'))
    expect(last(port, 'paused').line).toBe(10)
    port.send({ kind: 'stepOver' })
    const paused = last(port, 'paused')
    expect(paused.line).toBe(11)
    expect(paused.frames.map((frame) => frame.name)).toEqual(['Principal'])
    expect(port.text()).toBe('inicio\nhola\nhola\n')
  })

  it('steps into a call and out of it', () => {
    const { port } = harness()
    port.send(startMessage(CALL, 'step'))
    port.send({ kind: 'step' })
    let paused = last(port, 'paused')
    expect(paused.frames.map((frame) => frame.name)).toEqual(['Saludar', 'Principal'])
    port.send({ kind: 'stepOut' })
    paused = last(port, 'paused')
    expect(paused.frames.map((frame) => frame.name)).toEqual(['Principal'])
    expect(paused.line).toBe(11)
    expect(port.text()).toBe('inicio\nhola\nhola\n')
  })

  it('ignores step commands while ready', () => {
    const { port } = harness()
    port.send({ kind: 'step' })
    port.send({ kind: 'stepOver' })
    port.send({ kind: 'stepOut' })
    port.send({ kind: 'continue' })
    expect(port.posted).toEqual([])
  })
})

describe('run loop', () => {
  it('flushes output once per slice', async () => {
    let clock = 0
    const { port } = harness({ budget: 1, sliceMillis: 1, now: () => clock++, yield: async () => {} })
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(port.posted.filter((message) => message.kind === 'output').length).toBe(3)
    expect(port.text()).toBe('1\n2\n3\n')
    expect(port.kinds()).not.toContain('paused')
  })

  it('does not yield inside one slice', async () => {
    let yields = 0
    const { port } = harness({
      budget: 1,
      sliceMillis: 1000,
      now: () => 0,
      yield: async () => {
        yields++
      },
    })
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(yields).toBe(0)
    expect(port.posted.filter((message) => message.kind === 'output').length).toBe(1)
  })

  it('pauses between slices when asked and continues afterwards', async () => {
    let clock = 0
    const port = recordingPort()
    createDriver(port, {
      budget: 1,
      sliceMillis: 1,
      now: () => clock++,
      yield: async () => {
        port.send({ kind: 'pause' })
      },
    })
    port.send(startMessage(LOOP, 'run'))
    await until(() => port.kinds().includes('paused'))
    const paused = last(port, 'paused')
    expect(paused.reason).toBe('pause')
    expect(paused.frames[0]?.name).toBe('Bucle')
    expect(states(port)).toEqual(['running', 'paused'])
    port.send({ kind: 'continue' })
    await until(() => port.posted.filter((message) => message.kind === 'paused').length === 2)
    expect(states(port)).toEqual(['running', 'paused', 'running', 'paused'])
    const x = last(port, 'paused').frames[0]?.variables.find((v) => v.name === 'x')
    expect(typeof x?.value).toBe('number')
  })

  it('honours breakpoints set during a run', async () => {
    let clock = 0
    const port = recordingPort()
    let sent = false
    createDriver(port, {
      budget: 1,
      sliceMillis: 1,
      now: () => clock++,
      yield: async () => {
        if (!sent) {
          sent = true
          port.send({ kind: 'setBreakpoints', lines: [4] })
        }
      },
    })
    port.send(startMessage(COUNT, 'run'))
    await until(() => port.kinds().includes('paused'))
    const paused = last(port, 'paused')
    expect(paused.reason).toBe('breakpoint')
    expect(paused.line).toBe(4)
  })

  it('stops at breakpoints given at start, once per visit', async () => {
    const { port } = harness()
    port.send(startMessage(COUNT, 'run', [4]))
    await until(() => port.kinds().includes('paused'))
    expect(last(port, 'paused')).toMatchObject({ reason: 'breakpoint', line: 4 })
    expect(port.text()).toBe('')
    port.send({ kind: 'continue' })
    await until(() => port.posted.filter((message) => message.kind === 'paused').length === 2)
    expect(port.text()).toBe('1\n')
    port.send({ kind: 'continue' })
    port.send({ kind: 'continue' })
    await until(() => port.kinds().includes('done'))
    expect(port.text()).toBe('1\n2\n3\n')
  })

  it('ignores pause when not running', () => {
    const { port } = harness()
    port.send({ kind: 'pause' })
    port.send(startMessage(COUNT, 'step'))
    port.send({ kind: 'pause' })
    expect(port.kinds()).toEqual(['state', 'paused'])
  })
})

describe('input', () => {
  it('parks a run-mode run and resumes running after the answer', async () => {
    const { port } = harness()
    port.send(startMessage(GREET, 'run'))
    await until(() => port.kinds().includes('input'))
    const request = last(port, 'input')
    expect(request.target).toEqual({ name: 'nombre', type: { kind: 'scalar', name: 'string' } })
    expect(request.rejected).toBeUndefined()
    expect(states(port)).toEqual(['running', 'input'])
    expect(port.text()).toBe('Nombre\n')
    port.send({ kind: 'input', text: 'Ana' })
    await until(() => port.kinds().includes('done'))
    expect(states(port)).toEqual(['running', 'input', 'running', 'done'])
    expect(port.kinds()).not.toContain('paused')
    expect(port.text()).toBe('Nombre\nHola Ana\n')
  })

  it('parks a step-mode run and resumes stepping after the answer', async () => {
    const { port, driver } = harness()
    port.send(startMessage(GREET, 'step'))
    for (let i = 0; i < 10 && driver.state === 'paused'; i++) port.send({ kind: 'step' })
    expect(driver.state).toBe('input')
    port.send({ kind: 'input', text: 'Ana' })
    await until(() => driver.state !== 'input')
    expect(driver.state).toBe('paused')
    expect(states(port)).not.toContain('running')
    port.send({ kind: 'step' })
    expect(driver.state).toBe('done')
    expect(port.text()).toBe('Nombre\nHola Ana\n')
  })

  it('re-asks with the rejection when the text does not parse', async () => {
    const { port } = harness()
    port.send(startMessage(NUMBER, 'run'))
    await until(() => port.kinds().includes('input'))
    port.send({ kind: 'input', text: 'abc' })
    await until(() => port.posted.filter((message) => message.kind === 'input').length === 2)
    const again = last(port, 'input')
    expect(again.rejected?.code).toBe('E4004')
    expect(states(port)).toEqual(['running', 'input', 'input'])
    port.send({ kind: 'input', text: '21' })
    await until(() => port.kinds().includes('done'))
    expect(port.text()).toBe('42\n')
  })

  it('ignores input outside the input state', () => {
    const { port } = harness()
    port.send(startMessage(COUNT, 'step'))
    const before = port.posted.length
    port.send({ kind: 'input', text: 'x' })
    expect(port.posted.length).toBe(before)
  })
})

describe('wait', () => {
  it('sleeps and resumes running', async () => {
    const slept: number[] = []
    const port = recordingPort()
    createDriver(port, {
      sleep: async (millis) => {
        slept.push(millis)
      },
    })
    port.send(startMessage(WAIT, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(slept).toEqual([50])
    expect(last(port, 'wait')).toMatchObject({ line: 3, millis: 50 })
    expect(states(port)).toEqual(['running', 'waiting', 'running', 'done'])
    const kinds = port.kinds()
    expect(kinds.indexOf('output')).toBeLessThan(kinds.indexOf('wait'))
    expect(port.text()).toBe('a\nb\n')
  })

  it('sleeps and resumes stepping', async () => {
    const { port, driver } = harness()
    port.send(startMessage(WAIT, 'step'))
    port.send({ kind: 'step' })
    await until(() => driver.state === 'paused' && port.kinds().includes('wait'))
    expect(states(port)).toEqual(['paused', 'waiting', 'paused'])
    expect(last(port, 'paused').line).toBe(4)
    expect(port.text()).toBe('a\n')
  })
})

describe('clear', () => {
  it('flushes pending output before posting clear', async () => {
    const { port } = harness()
    port.send(startMessage(CLEAR, 'run'))
    await until(() => port.kinds().includes('done'))
    expect(port.kinds()).toEqual(['state', 'output', 'clear', 'output', 'state', 'done'])
    expect(port.text()).toBe('b\n')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/driver.test.ts`
Expected: FAIL — `Failed to resolve import "../src/runtime/driver"`.

- [ ] **Step 3: Write the driver**

Create `packages/editor/src/runtime/driver.ts`:

```ts
import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import { compile, type Frame, type Run, type StepResult, start } from 'stepcode'
import type { DriverPort, HostMessage, WorkerMessage, WorkerState } from './protocol'

export interface DriverOptions {
  /** Statements per `Run.continue` slice. */
  readonly budget?: number
  /** Wall-clock milliseconds of slices before yielding to the worker's event loop. */
  readonly sliceMillis?: number
  readonly sleep?: (millis: number) => Promise<void>
  readonly now?: () => number
  readonly yield?: () => Promise<void>
}

export interface Driver {
  readonly state: WorkerState
  handle(message: HostMessage): void
}

export const DEFAULT_BUDGET = 5000
export const DEFAULT_SLICE_MILLIS = 30

/** The command an input or wait interrupted, resumed once the answer or the sleep is in. */
type Resume = 'run' | 'step' | 'stepOver' | 'stepOut'

type StartMessage = Extract<HostMessage, { kind: 'start' }>

/** A macrotask that timers cannot clamp: one hop through a `MessageChannel`. */
function defaultYield(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }
    channel.port2.postMessage(null)
  })
}

function defaultSleep(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

/** Spec §4. Attaches to `port.onmessage`; every posted message is spec §3. */
export function createDriver(port: DriverPort, options: DriverOptions = {}): Driver {
  const budget = options.budget ?? DEFAULT_BUDGET
  const sliceMillis = options.sliceMillis ?? DEFAULT_SLICE_MILLIS
  const sleep = options.sleep ?? defaultSleep
  const now = options.now ?? (() => performance.now())
  const yieldToHost = options.yield ?? defaultYield

  let state: WorkerState = 'ready'
  let run: Run | null = null
  let pending: string[] = []
  let pauseRequested = false
  let resume: Resume = 'run'

  const post = (message: WorkerMessage): void => {
    port.postMessage(message)
  }

  const flush = (): void => {
    if (pending.length === 0) return
    const chunks = pending
    pending = []
    post({ kind: 'output', chunks })
  }

  const transition = (next: WorkerState): void => {
    state = next
    post({ kind: 'state', state: next })
  }

  const frames = (): readonly Frame[] => run?.inspect() ?? []

  /** Everything before the first `await` runs synchronously, so step results post at once. */
  async function deliver(result: StepResult): Promise<void> {
    flush()
    switch (result.kind) {
      case 'paused':
        transition('paused')
        post({
          kind: 'paused',
          reason: result.reason === 'budget' ? 'pause' : result.reason,
          line: result.line,
          frames: result.frames,
        })
        return
      case 'input':
        transition('input')
        post(
          result.rejected === undefined
            ? { kind: 'input', line: result.line, target: result.target }
            : { kind: 'input', line: result.line, target: result.target, rejected: result.rejected },
        )
        return
      case 'wait':
        transition('waiting')
        post({ kind: 'wait', line: result.line, millis: result.millis })
        await sleep(result.millis)
        await resumeInterrupted()
        return
      case 'done':
        transition('done')
        post({ kind: 'done', frames: frames() })
        return
      case 'error':
        transition('error')
        post({ kind: 'error', diagnostic: result.diagnostic, frames: result.frames })
        return
    }
  }

  async function resumeInterrupted(): Promise<void> {
    if (run === null) return
    if (resume === 'run') {
      await runLoop()
    } else {
      await deliver(run[resume]())
    }
  }

  async function runLoop(): Promise<void> {
    const active = run
    if (active === null) return
    resume = 'run'
    pauseRequested = false
    transition('running')
    let sliceStart = now()
    for (;;) {
      const result = active.continue({ budget })
      if (result.kind !== 'paused' || result.reason !== 'budget') {
        await deliver(result)
        return
      }
      if (pauseRequested) {
        pauseRequested = false
        flush()
        transition('paused')
        post({ kind: 'paused', reason: 'pause', line: result.line, frames: result.frames })
        return
      }
      if (now() - sliceStart >= sliceMillis) {
        flush()
        await yieldToHost()
        sliceStart = now()
      }
    }
  }

  function handleStart(message: StartMessage): void {
    if (state !== 'ready' && state !== 'done' && state !== 'error') return
    const profile = resolveProfile(message.profile, builtinProfiles)
    const program = compile(message.source, { profile })
    const firstError = program.diagnostics.find((one) => one.severity === 'error')
    if (firstError !== undefined) {
      run = null
      transition('error')
      post({ kind: 'error', diagnostic: firstError, frames: [] })
      return
    }
    pending = []
    const active = start(program, {
      profile,
      io: {
        write: (text) => {
          pending.push(text)
        },
        clear: () => {
          flush()
          post({ kind: 'clear' })
        },
      },
    })
    active.setBreakpoints(message.breakpoints)
    run = active
    if (message.mode === 'step') {
      resume = 'step'
      void deliver(active.step())
    } else {
      void runLoop()
    }
  }

  function handleInput(text: string): void {
    if (state !== 'input' || run === null) return
    run.input(text)
    if (run.state === 'input') {
      // Rejected: the next command re-reports the request with `rejected` set (§4). Re-ask
      // without announcing `running` for a resume that executes nothing.
      void deliver(run.step())
      return
    }
    void resumeInterrupted()
  }

  function dispatch(message: HostMessage): void {
    switch (message.kind) {
      case 'start':
        handleStart(message)
        return
      case 'step':
      case 'stepOver':
      case 'stepOut':
        if (state !== 'paused' || run === null) return
        resume = message.kind
        void deliver(run[message.kind]())
        return
      case 'continue':
        if (state !== 'paused') return
        void runLoop()
        return
      case 'pause':
        if (state === 'running') pauseRequested = true
        return
      case 'input':
        handleInput(message.text)
        return
      case 'setBreakpoints':
        run?.setBreakpoints(message.lines)
        return
    }
  }

  function handle(message: HostMessage): void {
    try {
      dispatch(message)
    } catch (error) {
      // Never across the port (§4): a defect here must not kill the worker.
      console.error('stepcode driver', error)
    }
  }

  port.onmessage = (event) => {
    handle(event.data)
  }

  return {
    get state() {
      return state
    },
    handle,
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/driver.test.ts`
Expected: PASS (21 tests). If `steps over a call` or `steps into a call` fails on a line number, print `port.posted` and check the `Run` semantics in `packages/language/src/interpreter/run.ts` (`step` from `ready` executes the first statement; `paused.line` is the statement about to execute) before touching the driver — the test lines are computed from the `CALL` program as written (line 9 `Escribir 'inicio'`, 10 `Saludar(2)`, 11 `Escribir 'fin'`).

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/runtime/driver.ts packages/editor/test/driver.test.ts
git commit -m "feat(editor): worker driver over Run with time-sliced running"
```

### Task 3: the worker entry and the runtime host

**Files:**
- Create: `packages/editor/src/runtime/worker.ts`
- Create: `packages/editor/src/runtime/host.ts`
- Test: `packages/editor/test/host.test.ts`

**Interfaces:**
- Consumes: `createDriver` (Task 2); `HostApi`, `HostListener` (`./host-api`); `HostMessage`, `WorkerMessage`, `RunMode` (`./protocol`); test helpers `until`, `profileInput`, `corpusProgram`.
- Produces: `class RuntimeHost implements HostApi` with `constructor(spawn: SpawnWorker = defaultSpawn)`, `type SpawnWorker = () => Worker`, `defaultSpawn()` (Task 12 constructs `new RuntimeHost()`).

- [ ] **Step 1: Write the failing host tests**

Create `packages/editor/test/host.test.ts`:

```ts
// @vitest-environment happy-dom
import '@vitest/web-worker'
import { describe, expect, it } from 'vitest'
import { RuntimeHost } from '../src/runtime/host'
import type { HostMessage, WorkerMessage } from '../src/runtime/protocol'
import { type CorpusProgram, corpusProgram, profileInput, type SidecarRun, until } from './helpers'

const es = profileInput('es')

const COUNT = [
  'Proceso Contar',
  '  Definir i Como Entero;',
  '  Para i <- 1 Hasta 3 Hacer',
  '    Escribir i;',
  '  FinPara',
  'FinProceso',
].join('\n')

const LOOP = [
  'Proceso Bucle',
  '  Definir x Como Entero;',
  '  x <- 0;',
  '  Mientras x >= 0 Hacer',
  '    x <- x + 1;',
  '  FinMientras',
  'FinProceso',
].join('\n')

/** A worker stand-in: records what the host posts and lets a test speak as the worker. */
class FakeWorker {
  readonly posted: HostMessage[] = []
  terminated = false
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null = null
  postMessage(message: HostMessage): void {
    this.posted.push(message)
  }
  terminate(): void {
    this.terminated = true
  }
  /** Speak as the worker. */
  say(message: WorkerMessage): void {
    this.onmessage?.({ data: message } as MessageEvent<WorkerMessage>)
  }
  asWorker(): Worker {
    return this as unknown as Worker
  }
}

function fakes(): { host: RuntimeHost; workers: FakeWorker[]; received: WorkerMessage[] } {
  const workers: FakeWorker[] = []
  const host = new RuntimeHost(() => {
    const worker = new FakeWorker()
    workers.push(worker)
    return worker.asWorker()
  })
  const received: WorkerMessage[] = []
  host.subscribe((message) => {
    received.push(message)
  })
  return { host, workers, received }
}

describe('RuntimeHost with a fake worker', () => {
  it('spawns on the first command and posts commands as-is', () => {
    const { host, workers } = fakes()
    expect(workers.length).toBe(0)
    host.start(COUNT, es, [4], 'run')
    expect(workers.length).toBe(1)
    host.step()
    host.stepOver()
    host.stepOut()
    host.continue()
    host.pause()
    host.input('x')
    host.setBreakpoints([1, 2])
    expect(workers[0]?.posted).toEqual([
      { kind: 'start', source: COUNT, profile: es, breakpoints: [4], mode: 'run' },
      { kind: 'step' },
      { kind: 'stepOver' },
      { kind: 'stepOut' },
      { kind: 'continue' },
      { kind: 'pause' },
      { kind: 'input', text: 'x' },
      { kind: 'setBreakpoints', lines: [1, 2] },
    ])
  })

  it('relays worker messages to every subscriber until unsubscribed', () => {
    const { host, workers, received } = fakes()
    const other: WorkerMessage[] = []
    const unsubscribe = host.subscribe((message) => {
      other.push(message)
    })
    host.start(COUNT, es, [], 'run')
    workers[0]?.say({ kind: 'state', state: 'running' })
    unsubscribe()
    workers[0]?.say({ kind: 'done', frames: [] })
    expect(received.map((message) => message.kind)).toEqual(['state', 'done'])
    expect(other.map((message) => message.kind)).toEqual(['state'])
  })

  it('stops by terminating, respawning, and announcing ready', () => {
    const { host, workers, received } = fakes()
    host.start(LOOP, es, [], 'run')
    host.stop()
    expect(workers[0]?.terminated).toBe(true)
    expect(workers.length).toBe(2)
    expect(workers[1]?.terminated).toBe(false)
    expect(received).toEqual([{ kind: 'state', state: 'ready' }])
    host.start(COUNT, es, [], 'step')
    expect(workers.length).toBe(2)
    expect(workers[1]?.posted.map((message) => message.kind)).toEqual(['start'])
  })

  it('drops messages from a terminated generation', () => {
    const { host, workers, received } = fakes()
    host.start(LOOP, es, [], 'run')
    const old = workers[0]
    host.stop()
    old?.say({ kind: 'output', chunks: ['late'] })
    workers[1]?.say({ kind: 'state', state: 'running' })
    expect(received.map((message) => message.kind)).toEqual(['state', 'state'])
    expect(received[1]).toEqual({ kind: 'state', state: 'running' })
  })

  it('disposes without respawning', () => {
    const { host, workers } = fakes()
    host.start(COUNT, es, [], 'run')
    host.dispose()
    expect(workers[0]?.terminated).toBe(true)
    expect(workers.length).toBe(1)
  })

  it('stop before any command still leaves a worker ready', () => {
    const { host, workers, received } = fakes()
    host.stop()
    expect(workers.length).toBe(1)
    expect(received).toEqual([{ kind: 'state', state: 'ready' }])
  })
})

/** Drives one sidecar run through a real worker and returns what the program wrote. */
async function runThrough(host: RuntimeHost, program: CorpusProgram, run: SidecarRun): Promise<string> {
  let output = ''
  let next = 0
  let finished = false
  let failure: string | null = null
  const unsubscribe = host.subscribe((message) => {
    switch (message.kind) {
      case 'output':
        output += message.chunks.join('')
        return
      case 'clear':
        output = ''
        return
      case 'input': {
        const text = run.inputs[next]
        next++
        if (text === undefined) failure = 'ran out of inputs'
        else host.input(text)
        return
      }
      case 'done':
        finished = true
        return
      case 'error':
        failure = message.diagnostic.code
        return
      default:
        return
    }
  })
  host.start(program.source, program.profile, [], 'run')
  await until(() => finished || failure !== null)
  unsubscribe()
  if (failure !== null) throw new Error(`${program.slug}: ${failure}`)
  return output
}

describe('RuntimeHost with the real worker', () => {
  it('runs a program in the worker and relays its messages', async () => {
    const host = new RuntimeHost()
    const received: WorkerMessage[] = []
    host.subscribe((message) => {
      received.push(message)
    })
    host.start(COUNT, es, [], 'run')
    await until(() => received.some((message) => message.kind === 'done'))
    expect(received.map((message) => message.kind)).toEqual(['state', 'output', 'state', 'done'])
    expect(received.flatMap((m) => (m.kind === 'output' ? m.chunks : [])).join('')).toBe('1\n2\n3\n')
    host.dispose()
  })

  it('stops an infinite loop and can run again', async () => {
    const host = new RuntimeHost()
    const received: WorkerMessage[] = []
    host.subscribe((message) => {
      received.push(message)
    })
    host.start(LOOP, es, [], 'run')
    await until(() => received.some((m) => m.kind === 'state' && m.state === 'running'))
    host.stop()
    expect(received.at(-1)).toEqual({ kind: 'state', state: 'ready' })
    received.length = 0
    host.start(COUNT, es, [], 'run')
    await until(() => received.some((message) => message.kind === 'done'))
    expect(received.flatMap((m) => (m.kind === 'output' ? m.chunks : [])).join('')).toBe('1\n2\n3\n')
    host.dispose()
  })

  it.each(['fibonacci', 'addition', 'bubble-sort'])('matches the corpus sidecar for %s', async (slug) => {
    const program = corpusProgram(slug)
    const host = new RuntimeHost()
    for (const run of program.runs) {
      expect(await runThrough(host, program, run)).toBe(run.output)
    }
    host.dispose()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/host.test.ts`
Expected: FAIL — `Failed to resolve import "../src/runtime/host"`.

- [ ] **Step 3: Write the worker entry and the host**

Create `packages/editor/src/runtime/worker.ts`:

```ts
import { createDriver } from './driver'
import type { DriverPort, HostMessage, WorkerMessage } from './protocol'

// The worker's global scope, narrowed to what the driver needs. `lib: DOM` types `self` as a
// window, whose `postMessage` and `onmessage` differ in shape from a worker's; this adapter
// keeps the driver's port type honest without pulling the WebWorker lib into the app.
const scope = self as unknown as {
  postMessage(message: WorkerMessage): void
  onmessage: ((event: MessageEvent<HostMessage>) => void) | null
}

const port: DriverPort = {
  postMessage: (message) => {
    scope.postMessage(message)
  },
  onmessage: null,
}

createDriver(port)

scope.onmessage = (event) => {
  port.onmessage?.({ data: event.data })
}
```

Create `packages/editor/src/runtime/host.ts`:

```ts
import type { ProfileInput } from '@stepcode/profiles'
import type { HostApi, HostListener } from './host-api'
import type { HostMessage, RunMode, WorkerMessage } from './protocol'

export type SpawnWorker = () => Worker

/** Vite turns this literal into a real chunk; `@vitest/web-worker` runs it in tests. */
export function defaultSpawn(): Worker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}

/** Spec §5. Owns the worker; tracks no run state — the store decides what may be sent. */
export class RuntimeHost implements HostApi {
  private worker: Worker | null = null
  /** Bumped on every spawn and terminate, so a late message from an old worker is dropped. */
  private generation = 0
  private readonly listeners = new Set<HostListener>()

  constructor(private readonly spawn: SpawnWorker = defaultSpawn) {}

  subscribe(listener: HostListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  start(source: string, profile: ProfileInput, breakpoints: readonly number[], mode: RunMode): void {
    this.post({ kind: 'start', source, profile, breakpoints, mode })
  }

  step(): void {
    this.post({ kind: 'step' })
  }

  stepOver(): void {
    this.post({ kind: 'stepOver' })
  }

  stepOut(): void {
    this.post({ kind: 'stepOut' })
  }

  continue(): void {
    this.post({ kind: 'continue' })
  }

  pause(): void {
    this.post({ kind: 'pause' })
  }

  input(text: string): void {
    this.post({ kind: 'input', text })
  }

  setBreakpoints(lines: readonly number[]): void {
    this.post({ kind: 'setBreakpoints', lines })
  }

  /** Terminate, respawn, and announce `ready` ourselves: a dead worker cannot. */
  stop(): void {
    this.terminate()
    this.spawnWorker()
    this.emit({ kind: 'state', state: 'ready' })
  }

  dispose(): void {
    this.terminate()
    this.listeners.clear()
  }

  private post(message: HostMessage): void {
    ;(this.worker ?? this.spawnWorker()).postMessage(message)
  }

  private spawnWorker(): Worker {
    this.generation += 1
    const generation = this.generation
    const worker = this.spawn()
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      if (generation === this.generation) this.emit(event.data)
    }
    this.worker = worker
    return worker
  }

  private terminate(): void {
    if (this.worker === null) return
    this.worker.terminate()
    this.worker = null
    this.generation += 1
  }

  private emit(message: WorkerMessage): void {
    for (const listener of this.listeners) listener(message)
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/host.test.ts`
Expected: PASS (11 tests). If the real-worker cases fail with a module resolution error on `worker.ts`, `@vitest/web-worker` did not accept the happy-dom `URL` object: change `defaultSpawn` to pass `new URL('./worker.ts', import.meta.url).href` — Vite still recognises the `new URL(…, import.meta.url)` form inside the `Worker` constructor argument only if it is the argument itself, so if `.href` breaks the production build (`pnpm --filter @stepcode/editor build` must emit a worker chunk), keep `defaultSpawn` as written and make the real-worker tests spawn through `() => new Worker(new NodeURL('../src/runtime/worker.ts', import.meta.url).href, { type: 'module' })` with `NodeURL` from `node:url`; record which form worked in the report.

- [ ] **Step 5: Build once, typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor build`
Expected: `dist/assets/` contains a `worker-*.js` chunk (Vite emitted the worker). The editor's `App.tsx` is still the scaffold; that is fine.

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/runtime/worker.ts packages/editor/src/runtime/host.ts packages/editor/test/host.test.ts
git commit -m "feat(editor): RuntimeHost over a module worker with terminate-and-respawn stop"
```

### Task 4: the store

**Files:**
- Create: `packages/editor/src/store/store.ts`
- Create: `packages/editor/src/store/context.tsx`
- Create: `packages/editor/test/fake-host.ts`
- Create: `packages/editor/test/render.tsx`
- Test: `packages/editor/test/store.test.ts`

**Interfaces:**
- Consumes: `HostApi`, `HostListener` (Task 1); `WorkerMessage`, `WorkerState`, `InputTarget` (Task 1); `OutputBuffer`, `appendOutput`, `emptyOutput` (Task 1); `Theme` (Task 1); `profiles`, `builtinProfiles` from `@stepcode/profiles`; `formatDiagnostic`, `LineMap`, `Frame` from `stepcode`; `Diagnostic` from `@codemirror/lint`.
- Produces: `createEditorStore(host: HostApi, options?: StoreOptions): EditorStore`, `StoreState`, `EditorStore = StoreApi<StoreState>`, `ProfileId`, `PROFILE_IDS`, `PendingInput`, `RuntimeError`, `DEFAULT_SOURCE`, selectors `profileOf(state)`, `localeOf(state)`, `stringsOf(state)`, `hasErrors(state)`, `canEdit(runState)`, `profileInputOf(id)` (Tasks 7–12); `StoreProvider`, `useEditorStore(selector)`, `useEditorStoreApi()` (Tasks 7–12); test helpers `FakeHost` (Node-safe), `storeWith(partial?, host?)`, `renderWithStore(ui, store)` (Tasks 7–12).

- [ ] **Step 1: Write the fake host**

Create `packages/editor/test/fake-host.ts`:

```ts
import type { ProfileInput } from '@stepcode/profiles'
import type { HostApi, HostListener } from '../src/runtime/host-api'
import type { RunMode, WorkerMessage } from '../src/runtime/protocol'

export interface StartCall {
  readonly source: string
  readonly profile: ProfileInput
  readonly breakpoints: readonly number[]
  readonly mode: RunMode
}

/** Records every command and lets a test speak as the worker. */
export class FakeHost implements HostApi {
  readonly calls: string[] = []
  readonly starts: StartCall[] = []
  private readonly listeners = new Set<HostListener>()

  subscribe(listener: HostListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit(message: WorkerMessage): void {
    for (const listener of this.listeners) listener(message)
  }

  start(source: string, profile: ProfileInput, breakpoints: readonly number[], mode: RunMode): void {
    this.starts.push({ source, profile, breakpoints, mode })
    this.calls.push(`start:${mode}`)
  }

  step(): void {
    this.calls.push('step')
  }

  stepOver(): void {
    this.calls.push('stepOver')
  }

  stepOut(): void {
    this.calls.push('stepOut')
  }

  continue(): void {
    this.calls.push('continue')
  }

  pause(): void {
    this.calls.push('pause')
  }

  input(text: string): void {
    this.calls.push(`input:${text}`)
  }

  setBreakpoints(lines: readonly number[]): void {
    this.calls.push(`setBreakpoints:${lines.join(',')}`)
  }

  stop(): void {
    this.calls.push('stop')
    this.emit({ kind: 'state', state: 'ready' })
  }

  dispose(): void {
    this.calls.push('dispose')
  }
}
```

- [ ] **Step 2: Write the failing store tests**

Create `packages/editor/test/store.test.ts`:

```ts
import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import { profiles } from '@stepcode/profiles'
import { compile, type Frame } from 'stepcode'
import { describe, expect, it } from 'vitest'
import type { WorkerState } from '../src/runtime/protocol'
import { OUTPUT_CAP } from '../src/store/output'
import {
  canEdit,
  createEditorStore,
  DEFAULT_SOURCE,
  hasErrors,
  localeOf,
  profileInputOf,
  profileOf,
} from '../src/store/store'
import { FakeHost } from './fake-host'

const BROKEN = ['Proceso Roto', '  Escribir x;', 'FinProceso'].join('\n')

const errorDiagnostic: LintDiagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warningDiagnostic: LintDiagnostic = { from: 0, to: 1, severity: 'warning', message: 'w' }

const frame: Frame = {
  name: 'p',
  line: 2,
  variables: [{ name: 'i', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value: 1 }],
}

function setup(): { host: FakeHost; store: ReturnType<typeof createEditorStore>; applied: string[] } {
  const host = new FakeHost()
  const applied: string[] = []
  const store = createEditorStore(host, {
    applyTheme: (theme) => {
      applied.push(theme)
    },
  })
  return { host, store, applied }
}

describe('document slice', () => {
  it('starts with a Spanish hello-world, the es profile, and no diagnostics', () => {
    const { store } = setup()
    const s = store.getState()
    expect(s.source).toBe(DEFAULT_SOURCE)
    expect(s.profileId).toBe('es')
    expect(profileOf(s)).toBe(profiles.es)
    expect(localeOf(s)).toBe('es')
    expect(s.diagnostics).toEqual([])
    expect(hasErrors(s)).toBe(false)
    expect(s.state).toBe('ready')
    expect(s.theme).toBe('light')
  })

  it('updates source, profile, diagnostics', () => {
    const { store } = setup()
    store.getState().setSource('x')
    store.getState().setProfile('en')
    store.getState().setDiagnostics([warningDiagnostic, errorDiagnostic])
    const s = store.getState()
    expect(s.source).toBe('x')
    expect(profileOf(s)).toBe(profiles.en)
    expect(localeOf(s)).toBe('en')
    expect(hasErrors(s)).toBe(true)
    expect(profileInputOf('pseint').id).toBe('pseint')
  })

  it('forwards breakpoints to the host at once', () => {
    const { store, host } = setup()
    store.getState().setBreakpoints([3, 5])
    expect(store.getState().breakpoints).toEqual([3, 5])
    expect(host.calls).toEqual(['setBreakpoints:3,5'])
  })

  it('applies the theme through the option', () => {
    const { store, applied } = setup()
    store.getState().setTheme('dark')
    expect(store.getState().theme).toBe('dark')
    expect(applied).toEqual(['dark'])
  })
})

describe('run guards', () => {
  it('run and stepInto start from ready, done, and error only, and never with errors', () => {
    const { store, host } = setup()
    store.getState().setBreakpoints([4])
    store.getState().run()
    expect(host.starts).toEqual([
      { source: DEFAULT_SOURCE, profile: profileInputOf('es'), breakpoints: [4], mode: 'run' },
    ])
    host.emit({ kind: 'state', state: 'running' })
    store.getState().run()
    store.getState().stepInto()
    expect(host.starts.length).toBe(1)
    for (const state of ['done', 'error'] as const) {
      host.emit({ kind: 'state', state })
      store.getState().stepInto()
    }
    expect(host.starts.map((call) => call.mode)).toEqual(['run', 'step', 'step'])
    host.emit({ kind: 'state', state: 'ready' })
    store.getState().setDiagnostics([errorDiagnostic])
    store.getState().run()
    expect(host.starts.length).toBe(3)
  })

  it('stepping and continue need paused; pause needs running; input needs input; stop needs not ready', () => {
    const { store, host } = setup()
    const s = store.getState()
    s.stepOver()
    s.stepOut()
    s.continue()
    s.pause()
    s.submitInput('x')
    s.stop()
    expect(host.calls).toEqual([])
    host.emit({ kind: 'state', state: 'paused' })
    s.stepInto()
    s.stepOver()
    s.stepOut()
    s.continue()
    s.pause()
    expect(host.calls).toEqual(['step', 'stepOver', 'stepOut', 'continue'])
    host.emit({ kind: 'state', state: 'running' })
    s.pause()
    s.stepOver()
    expect(host.calls.at(-1)).toBe('pause')
    host.emit({ kind: 'state', state: 'input' })
    s.submitInput('42')
    expect(host.calls.at(-1)).toBe('input:42')
    s.stop()
    expect(host.calls.at(-1)).toBe('stop')
    expect(store.getState().state).toBe('ready')
  })

  it('canEdit is true only in ready, done, and error', () => {
    const editable = (['ready', 'running', 'paused', 'input', 'waiting', 'done', 'error'] as WorkerState[]).filter(canEdit)
    expect(editable).toEqual(['ready', 'done', 'error'])
  })
})

describe('worker messages', () => {
  it('resets the run slice on start and clears output', () => {
    const { store, host } = setup()
    host.emit({ kind: 'output', chunks: ['old'] })
    host.emit({ kind: 'paused', reason: 'step', line: 2, frames: [frame] })
    host.emit({ kind: 'state', state: 'done' })
    store.getState().run()
    const s = store.getState()
    expect(s.output.chunks).toEqual([])
    expect(s.currentLine).toBeNull()
    expect(s.frames).toEqual([])
    expect(s.pendingInput).toBeNull()
    expect(s.wait).toBeNull()
    expect(s.error).toBeNull()
  })

  it('tracks state, line, frames, input, and wait', () => {
    const { store, host } = setup()
    host.emit({ kind: 'state', state: 'paused' })
    host.emit({ kind: 'paused', reason: 'breakpoint', line: 4, frames: [frame] })
    expect(store.getState()).toMatchObject({ state: 'paused', currentLine: 4, frames: [frame] })
    host.emit({ kind: 'state', state: 'input' })
    host.emit({ kind: 'input', line: 5, target: { name: 'n', type: { kind: 'scalar', name: 'integer' } } })
    expect(store.getState().pendingInput).toEqual({
      line: 5,
      target: { name: 'n', type: { kind: 'scalar', name: 'integer' } },
    })
    expect(store.getState().currentLine).toBe(5)
    host.emit({ kind: 'state', state: 'waiting' })
    host.emit({ kind: 'wait', line: 6, millis: 500 })
    expect(store.getState().pendingInput).toBeNull()
    expect(store.getState().wait).toEqual({ line: 6, millis: 500 })
    host.emit({ kind: 'state', state: 'running' })
    expect(store.getState().wait).toBeNull()
    host.emit({ kind: 'state', state: 'paused' })
    host.emit({ kind: 'paused', reason: 'step', line: 7, frames: [frame] })
    expect(store.getState().wait).toBeNull()
  })

  it('keeps the final frames after done and clears the line', () => {
    const { store, host } = setup()
    host.emit({ kind: 'paused', reason: 'step', line: 2, frames: [] })
    host.emit({ kind: 'state', state: 'done' })
    host.emit({ kind: 'done', frames: [frame] })
    expect(store.getState().frames).toEqual([frame])
    expect(store.getState().currentLine).toBeNull()
  })

  it('formats a rejected input and a runtime error in the snapshot locale', () => {
    const { store, host } = setup()
    store.getState().setSource(BROKEN)
    const diagnostic = compile(BROKEN, { profile: profiles.es }).diagnostics[0]
    if (diagnostic === undefined) throw new Error('BROKEN should not compile clean')
    store.getState().setDiagnostics([])
    store.getState().run()
    host.emit({ kind: 'state', state: 'input' })
    host.emit({ kind: 'input', line: 2, target: null, rejected: diagnostic })
    expect(store.getState().pendingInput?.rejected).toContain('x')
    host.emit({ kind: 'state', state: 'error' })
    host.emit({ kind: 'error', diagnostic, frames: [frame] })
    const s = store.getState()
    expect(s.error?.line).toBe(2)
    expect(s.error?.message.length).toBeGreaterThan(0)
    expect(s.currentLine).toBe(2)
    expect(s.frames).toEqual([frame])
  })

  it('appends output up to the cap and clears on clear', () => {
    const { store, host } = setup()
    host.emit({ kind: 'output', chunks: ['a', 'b'] })
    expect(store.getState().output.chunks).toEqual(['a', 'b'])
    host.emit({ kind: 'output', chunks: Array.from({ length: OUTPUT_CAP }, () => 'x') })
    expect(store.getState().output.chunks.length).toBe(OUTPUT_CAP)
    expect(store.getState().output.dropped).toBe(2)
    host.emit({ kind: 'clear' })
    expect(store.getState().output.chunks).toEqual([])
    host.emit({ kind: 'output', chunks: ['c'] })
    store.getState().clearOutput()
    expect(store.getState().output.chunks).toEqual([])
  })

  it('clears the transient run fields when the host announces ready', () => {
    const { store, host } = setup()
    host.emit({ kind: 'state', state: 'input' })
    host.emit({ kind: 'input', line: 3, target: null })
    host.emit({ kind: 'state', state: 'ready' })
    const s = store.getState()
    expect(s.state).toBe('ready')
    expect(s.pendingInput).toBeNull()
    expect(s.currentLine).toBeNull()
    expect(s.wait).toBeNull()
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/store.test.ts`
Expected: FAIL — `Failed to resolve import "../src/store/store"`.

- [ ] **Step 4: Write the store**

Create `packages/editor/src/store/store.ts`:

```ts
import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import { builtinProfiles, type ProfileInput, profiles, type ResolvedProfile } from '@stepcode/profiles'
import { type Diagnostic, type Frame, formatDiagnostic, LineMap } from 'stepcode'
import { createStore, type StoreApi } from 'zustand/vanilla'
import type { HostApi } from '../runtime/host-api'
import type { InputTarget, RunMode, WorkerMessage, WorkerState } from '../runtime/protocol'
import { type Strings, stringsFor } from '../strings'
import type { Theme } from '../theme/types'
import { appendOutput, emptyOutput, type OutputBuffer } from './output'

export type ProfileId = 'es' | 'en' | 'pseint'

export const PROFILE_IDS: readonly ProfileId[] = ['es', 'en', 'pseint']

export interface PendingInput {
  readonly line: number
  readonly target: InputTarget | null
  /** The formatted E4004 of the previous answer. */
  readonly rejected?: string
}

export interface RuntimeError {
  readonly message: string
  readonly line: number
}

export interface Wait {
  readonly line: number
  readonly millis: number
}

/** Spec §6: the document slice, the runtime slice, and their actions. */
export interface StoreState {
  readonly source: string
  readonly profileId: ProfileId
  readonly diagnostics: readonly LintDiagnostic[]
  readonly breakpoints: readonly number[]
  readonly theme: Theme
  readonly state: WorkerState
  readonly output: OutputBuffer
  readonly currentLine: number | null
  readonly frames: readonly Frame[]
  readonly pendingInput: PendingInput | null
  readonly wait: Wait | null
  readonly error: RuntimeError | null
  setSource(source: string): void
  setProfile(id: ProfileId): void
  setDiagnostics(diagnostics: readonly LintDiagnostic[]): void
  setBreakpoints(lines: readonly number[]): void
  setTheme(theme: Theme): void
  run(): void
  /** From ready/done/error: start in step mode. From paused: one `step`. */
  stepInto(): void
  stepOver(): void
  stepOut(): void
  continue(): void
  pause(): void
  stop(): void
  submitInput(text: string): void
  clearOutput(): void
}

export type EditorStore = StoreApi<StoreState>

export interface StoreOptions {
  readonly applyTheme?: (theme: Theme) => void
  readonly initialTheme?: Theme
  readonly initialSource?: string
}

export const DEFAULT_SOURCE = ['Proceso Hola', "  Escribir 'Hola, mundo';", 'FinProceso', ''].join('\n')

export function profileOf(state: Pick<StoreState, 'profileId'>): ResolvedProfile {
  return profiles[state.profileId]
}

export function localeOf(state: Pick<StoreState, 'profileId'>): string {
  return profileOf(state).locale
}

export function stringsOf(state: Pick<StoreState, 'profileId'>): Strings {
  return stringsFor(localeOf(state))
}

export function hasErrors(state: Pick<StoreState, 'diagnostics'>): boolean {
  return state.diagnostics.some((diagnostic) => diagnostic.severity === 'error')
}

/** Spec §6: editing, running, and stepping from scratch are allowed in these states only. */
export function canEdit(state: WorkerState): boolean {
  return state === 'ready' || state === 'done' || state === 'error'
}

/** The JSON a builtin profile crosses the worker boundary as. */
export function profileInputOf(id: ProfileId): ProfileInput {
  const input = builtinProfiles.get(id)
  if (input === undefined) throw new Error(`no builtin profile ${id}`)
  return input
}

interface Snapshot {
  readonly source: string
  readonly profile: ResolvedProfile
}

export function createEditorStore(host: HostApi, options: StoreOptions = {}): EditorStore {
  /** What the worker is running: errors and rejections are formatted against it. */
  let snapshot: Snapshot | null = null

  const store = createStore<StoreState>((set, get) => {
    const begin = (mode: RunMode): void => {
      const s = get()
      if (!canEdit(s.state) || hasErrors(s)) return
      snapshot = { source: s.source, profile: profileOf(s) }
      set({
        output: emptyOutput,
        currentLine: null,
        frames: [],
        pendingInput: null,
        wait: null,
        error: null,
      })
      host.start(s.source, profileInputOf(s.profileId), s.breakpoints, mode)
    }
    return {
      source: options.initialSource ?? DEFAULT_SOURCE,
      profileId: 'es',
      diagnostics: [],
      breakpoints: [],
      theme: options.initialTheme ?? 'light',
      state: 'ready',
      output: emptyOutput,
      currentLine: null,
      frames: [],
      pendingInput: null,
      wait: null,
      error: null,
      setSource: (source) => set({ source }),
      setProfile: (profileId) => set({ profileId }),
      setDiagnostics: (diagnostics) => set({ diagnostics }),
      setBreakpoints: (breakpoints) => {
        set({ breakpoints })
        host.setBreakpoints(breakpoints)
      },
      setTheme: (theme) => {
        set({ theme })
        options.applyTheme?.(theme)
      },
      run: () => begin('run'),
      stepInto: () => {
        if (get().state === 'paused') host.step()
        else begin('step')
      },
      stepOver: () => {
        if (get().state === 'paused') host.stepOver()
      },
      stepOut: () => {
        if (get().state === 'paused') host.stepOut()
      },
      continue: () => {
        if (get().state === 'paused') host.continue()
      },
      pause: () => {
        if (get().state === 'running') host.pause()
      },
      stop: () => {
        if (get().state !== 'ready') host.stop()
      },
      submitInput: (text) => {
        if (get().state === 'input') host.input(text)
      },
      clearOutput: () => set({ output: emptyOutput }),
    }
  })

  const format = (diagnostic: Diagnostic): string => {
    const profile = snapshot?.profile ?? profileOf(store.getState())
    return formatDiagnostic(diagnostic, profile.locale, profile)
  }

  const lineOf = (diagnostic: Diagnostic): number => {
    const source = snapshot?.source ?? store.getState().source
    return new LineMap(source).positionAt(diagnostic.span.start).line
  }

  const receive = (message: WorkerMessage): void => {
    switch (message.kind) {
      case 'state':
        store.setState(
          message.state === 'ready'
            ? { state: 'ready', currentLine: null, pendingInput: null, wait: null }
            : message.state === 'running'
              ? { state: 'running', pendingInput: null, wait: null }
              : { state: message.state },
        )
        return
      case 'output':
        store.setState((s) => ({ output: appendOutput(s.output, message.chunks) }))
        return
      case 'clear':
        store.setState({ output: emptyOutput })
        return
      case 'paused':
        store.setState({
          currentLine: message.line,
          frames: message.frames,
          pendingInput: null,
          wait: null,
        })
        return
      case 'input': {
        const pending: PendingInput =
          message.rejected === undefined
            ? { line: message.line, target: message.target }
            : { line: message.line, target: message.target, rejected: format(message.rejected) }
        store.setState({ currentLine: message.line, pendingInput: pending, wait: null })
        return
      }
      case 'wait':
        store.setState({
          currentLine: message.line,
          wait: { line: message.line, millis: message.millis },
          pendingInput: null,
        })
        return
      case 'done':
        store.setState({ frames: message.frames, currentLine: null, pendingInput: null, wait: null })
        return
      case 'error': {
        const line = lineOf(message.diagnostic)
        store.setState({
          error: { message: format(message.diagnostic), line },
          frames: message.frames,
          currentLine: line,
          pendingInput: null,
          wait: null,
        })
        return
      }
    }
  }

  host.subscribe(receive)
  return store
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/store.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 6: Write the React context and the render helper**

Create `packages/editor/src/store/context.tsx`:

```tsx
import { createContext, type ReactNode, useContext } from 'react'
import { useStore } from 'zustand'
import type { EditorStore, StoreState } from './store'

const StoreContext = createContext<EditorStore | null>(null)

export function StoreProvider({ store, children }: { store: EditorStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

/** The store itself, for imperative access (actions, `getState`, `subscribe`). */
export function useEditorStoreApi(): EditorStore {
  const store = useContext(StoreContext)
  if (store === null) throw new Error('useEditorStore needs a StoreProvider')
  return store
}

/** A slice of state; re-renders when the selected value changes. */
export function useEditorStore<T>(selector: (state: StoreState) => T): T {
  return useStore(useEditorStoreApi(), selector)
}
```

Create `packages/editor/test/render.tsx` (imported by happy-dom test files only):

```tsx
import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { StoreProvider } from '../src/store/context'
import { createEditorStore, type EditorStore, type StoreState } from '../src/store/store'
import { FakeHost } from './fake-host'

export function storeWith(
  partial: Partial<StoreState> = {},
  host: FakeHost = new FakeHost(),
): { store: EditorStore; host: FakeHost } {
  const store = createEditorStore(host, { initialTheme: 'light' })
  store.setState(partial)
  return { store, host }
}

export function renderWithStore(ui: ReactElement, store: EditorStore): RenderResult {
  return render(<StoreProvider store={store}>{ui}</StoreProvider>)
}
```

The "hook without a provider throws" check needs a DOM and lives in Task 12's `App.test.tsx`.

- [ ] **Step 7: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/store packages/editor/test/fake-host.ts packages/editor/test/render.tsx packages/editor/test/store.test.ts
git commit -m "feat(editor): vanilla store over the runtime host with a React context"
```

### Task 5: theme tokens, theme helpers, Tailwind mapping

**Files:**
- Create: `packages/editor/src/theme/tokens.css`
- Create: `packages/editor/src/theme/theme.ts`
- Modify: `packages/editor/src/index.css` (whole file)
- Test: `packages/editor/test/theme.test.ts`

**Interfaces:**
- Consumes: `Theme`, `THEMES` (Task 1).
- Produces: `TOKEN_NAMES`, `HEX_TOKENS`, `parseTokens(css): Record<Theme, Record<string, string>>`, `contrastRatio(a, b): number`, `resolveInitialTheme(matchMedia?)`, `applyTheme(theme, root?)` (Task 12 uses the last two); the CSS custom properties `--sc-*` (Task 6) and the Tailwind color utilities `bg-bg`, `bg-surface`, `bg-surface-raised`, `border-border`, `text-fg`, `text-muted`, `text-accent`, `text-error`, `text-warning`, `text-success`, `bg-selection`, and `font-mono` (Tasks 7–12).

Resolution of one spec fact: the canonical One Light syntax colors sit between 3.0:1 and 4.7:1 on its background (`#c18401` and `#50a14f` on `#fafafa` are 3.06:1). Spec §8.3 asks 4.5:1 for every `syn-*` token, which the palette the spec itself fixes cannot meet. The test therefore asserts 4.5:1 for `fg` and 3:1 (WCAG AA for large text and UI parts) for `syn-*`, `error`, `warning`, `success`, `accent`; `fg-muted` and `syn-comment` stay exempt. Recorded as Deviation 9 below the task list.

- [ ] **Step 1: Write the failing theme tests**

Create `packages/editor/test/theme.test.ts`:

```ts
// @vitest-environment happy-dom
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyTheme,
  contrastRatio,
  HEX_TOKENS,
  parseTokens,
  resolveInitialTheme,
  TOKEN_NAMES,
} from '../src/theme/theme'
import { THEMES } from '../src/theme/types'

const srcRoot = fileURLToPath(new NodeURL('../src', import.meta.url))
const tokensCss = readFileSync(join(srcRoot, 'theme', 'tokens.css'), 'utf8')
const tokens = parseTokens(tokensCss)

describe('tokens.css', () => {
  it('defines every token in both themes', () => {
    for (const theme of THEMES) {
      for (const name of TOKEN_NAMES) {
        expect(tokens[theme][name], `${theme} --sc-${name}`).toBeDefined()
      }
      expect(Object.keys(tokens[theme]).sort()).toEqual([...TOKEN_NAMES].sort())
    }
  })

  it('spells hex tokens as six-digit hex and overlay tokens as rgba', () => {
    for (const theme of THEMES) {
      for (const name of TOKEN_NAMES) {
        const value = tokens[theme][name] ?? ''
        if (HEX_TOKENS.includes(name)) expect(value).toMatch(/^#[0-9a-f]{6}$/)
        else expect(value).toMatch(/^rgba\(\d+,\s?\d+,\s?\d+,\s?0\.\d+\)$/)
      }
    }
  })

  it('uses the canonical One Light and One Dark values', () => {
    expect(tokens.light.bg).toBe('#fafafa')
    expect(tokens.light['syn-keyword']).toBe('#a626a4')
    expect(tokens.light.caret).toBe('#526fff')
    expect(tokens.dark.bg).toBe('#282c34')
    expect(tokens.dark['syn-keyword']).toBe('#c678dd')
    expect(tokens.dark.caret).toBe('#528bff')
  })

  it('keeps text readable: 4.5:1 for fg, 3:1 for syntax and status colors', () => {
    for (const theme of THEMES) {
      const t = tokens[theme]
      const bg = t.bg ?? ''
      const surface = t.surface ?? ''
      expect(contrastRatio(t.fg ?? '', bg), `${theme} fg`).toBeGreaterThanOrEqual(4.5)
      for (const name of TOKEN_NAMES) {
        if (!name.startsWith('syn-') || name === 'syn-comment') continue
        expect(contrastRatio(t[name] ?? '', bg), `${theme} ${name}`).toBeGreaterThanOrEqual(3)
      }
      for (const name of ['error', 'warning', 'success', 'accent'] as const) {
        expect(contrastRatio(t[name] ?? '', surface), `${theme} ${name}`).toBeGreaterThanOrEqual(3)
      }
    }
  })
})

describe('contrastRatio', () => {
  it('follows WCAG 2', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0)
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(contrastRatio('#808080', '#808080')).toBe(1)
    expect(contrastRatio('#383a42', '#fafafa')).toBeCloseTo(10.86, 1)
  })
})

describe('resolveInitialTheme', () => {
  it('follows prefers-color-scheme and defaults to light', () => {
    expect(resolveInitialTheme(() => ({ matches: true }))).toBe('dark')
    expect(resolveInitialTheme(() => ({ matches: false }))).toBe('light')
    expect(resolveInitialTheme(undefined)).toBe('light')
  })
})

describe('applyTheme', () => {
  it('stamps the attribute for dark, removes it for light, and sets color-scheme', () => {
    const root = document.createElement('div')
    applyTheme('dark', root)
    expect(root.dataset.theme).toBe('dark')
    expect(root.style.colorScheme).toBe('dark')
    applyTheme('light', root)
    expect(root.dataset.theme).toBeUndefined()
    expect(root.style.colorScheme).toBe('light')
  })

  it('targets the document root by default', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })
})

describe('index.css', () => {
  it('imports the tokens and maps them for Tailwind', () => {
    const css = readFileSync(join(srcRoot, 'index.css'), 'utf8')
    expect(css).toContain('@import "tailwindcss"')
    expect(css).toContain('@import "./theme/tokens.css"')
    for (const [utility, token] of [
      ['bg', 'bg'],
      ['surface', 'surface'],
      ['surface-raised', 'surface-raised'],
      ['border', 'border'],
      ['fg', 'fg'],
      ['muted', 'fg-muted'],
      ['accent', 'accent'],
      ['selection', 'selection'],
      ['error', 'error'],
      ['warning', 'warning'],
      ['success', 'success'],
    ]) {
      expect(css).toContain(`--color-${utility}: var(--sc-${token})`)
    }
  })
})

describe('no raw colors outside tokens.css', () => {
  const files: string[] = []
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else if (/\.(ts|tsx|css)$/.test(name) && !path.endsWith(join('theme', 'tokens.css'))) files.push(path)
    }
  }
  walk(srcRoot)

  it.each(files)('%s has no hex or rgb color', (file) => {
    const text = readFileSync(file, 'utf8')
    expect(text).not.toMatch(/#[0-9a-fA-F]{6}\b/)
    expect(text).not.toMatch(/#[0-9a-fA-F]{3}\b(?![\w-])/)
    expect(text).not.toMatch(/\brgba?\(/)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/theme.test.ts`
Expected: FAIL — `Failed to resolve import "../src/theme/theme"`.

- [ ] **Step 3: Write the tokens**

Create `packages/editor/src/theme/tokens.css` (spec §8.1, verbatim values):

```css
/*
 * Spec §8.1: every color the editor uses, once. `:root` is One Light; the dark block is One Dark.
 * Tailwind reads these through `@theme inline` in index.css; CodeMirror through `var(--sc-…)`.
 * `--sc-line` and `--sc-current-line` are overlays and stay rgba; everything else is hex.
 */
:root {
  --sc-bg: #fafafa;
  --sc-surface: #ffffff;
  --sc-surface-raised: #f0f0f1;
  --sc-border: #dbdbdc;
  --sc-fg: #383a42;
  --sc-fg-muted: #a0a1a7;
  --sc-accent: #4078f2;
  --sc-caret: #526fff;
  --sc-selection: #e5e5e6;
  --sc-line: rgba(56,58,66,0.05);
  --sc-error: #e45649;
  --sc-warning: #c18401;
  --sc-success: #50a14f;
  --sc-breakpoint: #e45649;
  --sc-current-line: rgba(193,132,1,0.18);
  --sc-syn-keyword: #a626a4;
  --sc-syn-string: #50a14f;
  --sc-syn-number: #986801;
  --sc-syn-comment: #a0a1a7;
  --sc-syn-type: #c18401;
  --sc-syn-builtin: #4078f2;
  --sc-syn-operator: #0184bc;
  --sc-syn-variable: #e45649;
  --sc-syn-definition: #4078f2;
}

:root[data-theme="dark"] {
  --sc-bg: #282c34;
  --sc-surface: #21252b;
  --sc-surface-raised: #2c313a;
  --sc-border: #181a1f;
  --sc-fg: #abb2bf;
  --sc-fg-muted: #5c6370;
  --sc-accent: #61afef;
  --sc-caret: #528bff;
  --sc-selection: #3e4451;
  --sc-line: rgba(153,187,255,0.04);
  --sc-error: #e06c75;
  --sc-warning: #e5c07b;
  --sc-success: #98c379;
  --sc-breakpoint: #e06c75;
  --sc-current-line: rgba(229,192,123,0.18);
  --sc-syn-keyword: #c678dd;
  --sc-syn-string: #98c379;
  --sc-syn-number: #d19a66;
  --sc-syn-comment: #5c6370;
  --sc-syn-type: #e5c07b;
  --sc-syn-builtin: #61afef;
  --sc-syn-operator: #56b6c2;
  --sc-syn-variable: #e06c75;
  --sc-syn-definition: #61afef;
}
```

- [ ] **Step 4: Write the theme helpers**

Create `packages/editor/src/theme/theme.ts`:

```ts
import type { Theme } from './types'

/** Every `--sc-*` custom property, without the prefix. Both blocks of tokens.css define all. */
export const TOKEN_NAMES = [
  'bg',
  'surface',
  'surface-raised',
  'border',
  'fg',
  'fg-muted',
  'accent',
  'caret',
  'selection',
  'line',
  'error',
  'warning',
  'success',
  'breakpoint',
  'current-line',
  'syn-keyword',
  'syn-string',
  'syn-number',
  'syn-comment',
  'syn-type',
  'syn-builtin',
  'syn-operator',
  'syn-variable',
  'syn-definition',
] as const

export type TokenName = (typeof TOKEN_NAMES)[number]

/** Tokens that are opaque hex colors; the other two are translucent overlays. */
export const HEX_TOKENS: readonly TokenName[] = TOKEN_NAMES.filter(
  (name) => name !== 'line' && name !== 'current-line',
)

const BLOCK = /(:root(?:\[data-theme="dark"\])?)\s*\{([^}]*)\}/g
const DECLARATION = /--sc-([a-z-]+)\s*:\s*([^;]+);/g

/** Reads both token blocks out of tokens.css; used by the tests, not by the app. */
export function parseTokens(css: string): Record<Theme, Record<string, string>> {
  const out: Record<Theme, Record<string, string>> = { light: {}, dark: {} }
  for (const block of css.matchAll(BLOCK)) {
    const theme: Theme = block[1]?.includes('dark') ? 'dark' : 'light'
    for (const declaration of (block[2] ?? '').matchAll(DECLARATION)) {
      const name = declaration[1]
      const value = declaration[2]
      if (name !== undefined && value !== undefined) out[theme][name] = value.trim()
    }
  }
  return out
}

function channel(hex: string, offset: number): number {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/** WCAG 2 relative luminance of a `#rrggbb` color. */
export function relativeLuminance(hex: string): number {
  const digits = hex.replace('#', '')
  return 0.2126 * channel(digits, 0) + 0.7152 * channel(digits, 2) + 0.0722 * channel(digits, 4)
}

/** WCAG 2 contrast ratio, 1 to 21, order-independent. Hex colors only. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}

type MatchMedia = (query: string) => { readonly matches: boolean }

/** `prefers-color-scheme`, or light when the platform cannot say. */
export function resolveInitialTheme(
  matchMedia: MatchMedia | undefined = typeof window === 'undefined'
    ? undefined
    : window.matchMedia?.bind(window),
): Theme {
  if (matchMedia === undefined) return 'light'
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Spec §8.2: dark is an attribute on the root; light is its absence. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  if (theme === 'dark') root.dataset.theme = 'dark'
  else delete root.dataset.theme
  root.style.colorScheme = theme
}
```

- [ ] **Step 5: Write index.css**

Replace `packages/editor/src/index.css` with:

```css
@import "tailwindcss";
@import "./theme/tokens.css";

/* Spec §8.2: chrome colors are the tokens, never a literal. */
@theme inline {
  --color-bg: var(--sc-bg);
  --color-surface: var(--sc-surface);
  --color-surface-raised: var(--sc-surface-raised);
  --color-border: var(--sc-border);
  --color-fg: var(--sc-fg);
  --color-muted: var(--sc-fg-muted);
  --color-accent: var(--sc-accent);
  --color-selection: var(--sc-selection);
  --color-error: var(--sc-error);
  --color-warning: var(--sc-warning);
  --color-success: var(--sc-success);
  --font-mono: ui-monospace, "Cascadia Code", "Fira Code", Menlo, Consolas, monospace;
}

@layer base {
  html,
  body,
  #root {
    height: 100%;
  }

  body {
    background-color: var(--sc-bg);
    color: var(--sc-fg);
  }
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/theme.test.ts`
Expected: PASS. The "no raw colors" cases cover every file under `src/` that exists at this point; later tasks inherit the guard.

- [ ] **Step 7: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0 (Biome formats CSS too; accept its layout).

```bash
git add packages/editor/src/theme packages/editor/src/index.css packages/editor/test/theme.test.ts
git commit -m "feat(editor): One Light and One Dark as semantic tokens with contrast tests"
```

### Task 6: CodeMirror highlight style, editor theme, extension set

**Files:**
- Create: `packages/editor/src/editor/highlight.ts`
- Create: `packages/editor/src/editor/theme.ts`
- Create: `packages/editor/src/editor/extensions.ts`
- Test: `packages/editor/test/extensions.test.ts`

**Interfaces:**
- Consumes: `stepcode`, `debug`, `stepcodeDiagnostics`, `breakpointLines` from `@stepcode/codemirror`; `profiles` from `@stepcode/profiles`; `@codemirror/*` and `@lezer/highlight`; the `--sc-*` tokens (Task 5).
- Produces: `HIGHLIGHT_SPECS`, `appHighlightStyle`, `appHighlighting`; `EDITOR_THEME_SPEC`, `appEditorTheme`; `createExtensions(options): { extensions, compartments }`, `EditorOptions`, `EditorCompartments`, `languageExtension(profile, locale)`, `readOnlyExtension(readOnly)`, `darkExtension(dark)` (Task 7).

- [ ] **Step 1: Write the failing extension tests**

Create `packages/editor/test/extensions.test.ts`:

```ts
// @vitest-environment happy-dom
import { forceParsing, highlightingFor, syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { breakpointLines, stepcodeDiagnostics } from '@stepcode/codemirror'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  createExtensions,
  darkExtension,
  languageExtension,
  readOnlyExtension,
} from '../src/editor/extensions'
import { HIGHLIGHT_SPECS } from '../src/editor/highlight'
import { EDITOR_THEME_SPEC } from '../src/editor/theme'

const PROGRAM = ['Proceso p', '  Definir a Como Entero;', '  a <- 1;', '  Escribir a;', 'FinProceso'].join('\n')

function viewFor(doc = PROGRAM) {
  const { extensions, compartments } = createExtensions({
    profile: profiles.es,
    locale: 'es',
    readOnly: false,
    dark: false,
  })
  const view = new EditorView({
    parent: document.body,
    state: EditorState.create({ doc, extensions }),
  })
  forceParsing(view, view.state.doc.length, 1e9)
  return { view, compartments }
}

function values(spec: unknown): string[] {
  const out: string[] = []
  const visit = (node: unknown): void => {
    if (typeof node === 'string') out.push(node)
    else if (Array.isArray(node)) node.forEach(visit)
    else if (node !== null && typeof node === 'object') Object.values(node).forEach(visit)
  }
  visit(spec)
  return out
}

describe('tokens only', () => {
  it('colors the highlight style and the editor theme through var(--sc-…)', () => {
    const colorish = /color|background|border|outline|decoration/i
    for (const spec of HIGHLIGHT_SPECS) {
      for (const [key, value] of Object.entries(spec)) {
        if (key === 'tag') continue
        if (colorish.test(key) || key === 'textDecoration') expect(String(value)).toContain('var(--sc-')
      }
    }
    for (const [selector, rules] of Object.entries(EDITOR_THEME_SPEC)) {
      for (const [property, value] of Object.entries(rules)) {
        if (colorish.test(property)) expect(String(value), `${selector} ${property}`).toContain('var(--sc-')
      }
    }
    for (const value of [...values(HIGHLIGHT_SPECS), ...values(EDITOR_THEME_SPEC)]) {
      expect(value).not.toMatch(/#[0-9a-fA-F]{3,6}\b|\brgba?\(/)
    }
  })
})

describe('createExtensions', () => {
  it('installs line numbers, the lint gutter, the debug gutter, and the language', () => {
    const { view } = viewFor()
    expect(view.dom.querySelector('.cm-lineNumbers')).not.toBeNull()
    expect(view.dom.querySelector('.cm-gutter-lint')).not.toBeNull()
    expect(view.dom.querySelector('.cm-stepcode-breakpoints')).not.toBeNull()
    expect(syntaxTree(view.state).topNode.name).toBe('Program')
    expect(breakpointLines(view.state)).toEqual([])
    expect(stepcodeDiagnostics(view.state, { profile: profiles.es, locale: 'es' })).toEqual([])
    view.destroy()
  })

  it('assigns distinct classes to keywords, strings, builtins, and plain identifiers', () => {
    const { view } = viewFor()
    const classes = [t.controlKeyword, t.string, t.function(t.standard(t.variableName)), t.variableName].map(
      (tag) => highlightingFor(view.state, [tag]),
    )
    for (const cls of classes) expect(cls).not.toBeNull()
    expect(new Set(classes).size).toBe(4)
    expect(highlightingFor(view.state, [t.function(t.variableName)])).not.toBe(
      highlightingFor(view.state, [t.variableName]),
    )
    view.destroy()
  })

  it('toggles read-only and editable through the compartment', () => {
    const { view, compartments } = viewFor()
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
    expect(view.state.facet(EditorView.editable)).toBe(true)
    view.dispatch({ effects: compartments.readOnly.reconfigure(readOnlyExtension(true)) })
    expect(view.state.facet(EditorState.readOnly)).toBe(true)
    expect(view.state.facet(EditorView.editable)).toBe(false)
    view.destroy()
  })

  it('toggles the dark facet through the compartment', () => {
    const { view, compartments } = viewFor()
    expect(view.state.facet(EditorView.darkTheme)).toBe(false)
    view.dispatch({ effects: compartments.dark.reconfigure(darkExtension(true)) })
    expect(view.state.facet(EditorView.darkTheme)).toBe(true)
    view.destroy()
  })

  it('switches the language profile through the compartment', () => {
    const { view, compartments } = viewFor()
    view.dispatch({ effects: compartments.language.reconfigure(languageExtension(profiles.en, 'en')) })
    forceParsing(view, view.state.doc.length, 1e9)
    const diagnostics = stepcodeDiagnostics(view.state, { profile: profiles.en, locale: 'en' })
    expect(diagnostics.length).toBeGreaterThan(0)
    view.destroy()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/extensions.test.ts`
Expected: FAIL — `Failed to resolve import "../src/editor/extensions"`.

- [ ] **Step 3: Write the highlight style**

Create `packages/editor/src/editor/highlight.ts`:

```ts
import { HighlightStyle, syntaxHighlighting, type TagStyle } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { tags as t } from '@lezer/highlight'

/**
 * Spec §8.2 over the tags the language emits (codemirror spec §5.1). Colors are tokens, so the
 * style is theme-agnostic; the dark/light switch happens in CSS. More specific tags come after
 * their base tag so they win where both match.
 */
export const HIGHLIGHT_SPECS: readonly TagStyle[] = [
  {
    tag: [t.controlKeyword, t.definitionKeyword, t.operatorKeyword, t.keyword],
    color: 'var(--sc-syn-keyword)',
    fontWeight: 'bold',
  },
  { tag: t.string, color: 'var(--sc-syn-string)' },
  { tag: [t.number, t.bool], color: 'var(--sc-syn-number)' },
  { tag: t.lineComment, color: 'var(--sc-syn-comment)', fontStyle: 'italic' },
  { tag: t.typeName, color: 'var(--sc-syn-type)' },
  {
    tag: [t.definitionOperator, t.compareOperator, t.arithmeticOperator],
    color: 'var(--sc-syn-operator)',
  },
  { tag: [t.paren, t.squareBracket, t.separator], color: 'var(--sc-fg)' },
  { tag: t.variableName, color: 'var(--sc-syn-variable)' },
  {
    tag: [t.definition(t.variableName), t.function(t.variableName), t.function(t.definition(t.variableName))],
    color: 'var(--sc-syn-definition)',
  },
  { tag: t.function(t.standard(t.variableName)), color: 'var(--sc-syn-builtin)' },
  { tag: t.invalid, textDecoration: 'underline wavy var(--sc-error)' },
]

export const appHighlightStyle = HighlightStyle.define([...HIGHLIGHT_SPECS])

export const appHighlighting: Extension = syntaxHighlighting(appHighlightStyle)
```

If the "distinct classes" test reports the same class for `function(variableName)` and `variableName`, `@lezer/highlight` resolved the base tag's rule first: move the `variableName` spec after the two more specific specs (it is the rule order, not the tag structure, that decides) and record the final order in the report.

- [ ] **Step 4: Write the editor theme**

Create `packages/editor/src/editor/theme.ts`:

```ts
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

const MONO = 'ui-monospace, "Cascadia Code", "Fira Code", Menlo, Consolas, monospace'

/**
 * Spec §8.2. One theme for both modes: every color is a token. `EditorView.darkTheme` travels
 * in its own compartment (extensions.ts), so this spec never takes `{ dark }`. It overrides the
 * codemirror package's base theme classes (breakpoints, current line) with the app's tokens.
 */
export const EDITOR_THEME_SPEC: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  '&': { backgroundColor: 'var(--sc-bg)', color: 'var(--sc-fg)', height: '100%' },
  '.cm-scroller': { fontFamily: MONO, lineHeight: '1.5' },
  '.cm-content': { caretColor: 'var(--sc-caret)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--sc-caret)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground':
    { backgroundColor: 'var(--sc-selection)' },
  '.cm-content ::selection': { backgroundColor: 'var(--sc-selection)' },
  '.cm-activeLine': { backgroundColor: 'var(--sc-line)' },
  '.cm-gutters': {
    backgroundColor: 'var(--sc-surface)',
    color: 'var(--sc-fg-muted)',
    borderRight: '1px solid var(--sc-border)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'var(--sc-line)', color: 'var(--sc-fg)' },
  '.cm-stepcode-breakpoint': { backgroundColor: 'var(--sc-breakpoint)' },
  '.cm-stepcode-current-line': { backgroundColor: 'var(--sc-current-line)' },
  '.cm-stepcode-current-line-marker': { borderLeftColor: 'var(--sc-warning)' },
  '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy var(--sc-error)' },
  '.cm-lintRange-warning': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--sc-warning)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--sc-surface-raised)',
    color: 'var(--sc-fg)',
    border: '1px solid var(--sc-border)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--sc-selection)',
    color: 'var(--sc-fg)',
  },
  '.cm-matchingBracket': { outline: '1px solid var(--sc-success)', backgroundColor: 'transparent' },
  '.cm-nonmatchingBracket': { outline: '1px solid var(--sc-error)', backgroundColor: 'transparent' },
}

export const appEditorTheme: Extension = EditorView.theme(EDITOR_THEME_SPEC)
```

`transparent` is a keyword, not a color literal; the "tokens only" test's regex accepts it and the `values` scan finds no hex or rgb.

- [ ] **Step 5: Write the extension set**

Create `packages/editor/src/editor/extensions.ts`:

```ts
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { lintGutter } from '@codemirror/lint'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view'
import { debug, stepcode } from '@stepcode/codemirror'
import type { ResolvedProfile } from '@stepcode/profiles'
import { appHighlighting } from './highlight'
import { appEditorTheme } from './theme'

export interface EditorOptions {
  readonly profile: ResolvedProfile
  readonly locale: string
  readonly readOnly: boolean
  readonly dark: boolean
}

/** Spec §7.1: the three things the panel reconfigures at runtime. */
export interface EditorCompartments {
  readonly language: Compartment
  readonly readOnly: Compartment
  readonly dark: Compartment
}

export function languageExtension(profile: ResolvedProfile, locale: string): Extension {
  return stepcode({ profile, locale })
}

export function readOnlyExtension(readOnly: boolean): Extension {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]
}

export function darkExtension(dark: boolean): Extension {
  return EditorView.darkTheme.of(dark)
}

/** Spec §7.1: the editor's whole extension set, in the order the spec lists. */
export function createExtensions(options: EditorOptions): {
  extensions: Extension
  compartments: EditorCompartments
} {
  const compartments: EditorCompartments = {
    language: new Compartment(),
    readOnly: new Compartment(),
    dark: new Compartment(),
  }
  const extensions: Extension = [
    lineNumbers(),
    history(),
    highlightActiveLine(),
    drawSelection(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    lintGutter(),
    appHighlighting,
    appEditorTheme,
    compartments.language.of(languageExtension(options.profile, options.locale)),
    compartments.readOnly.of(readOnlyExtension(options.readOnly)),
    compartments.dark.of(darkExtension(options.dark)),
    debug(),
  ]
  return { extensions, compartments }
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/extensions.test.ts packages/editor/test/theme.test.ts`
Expected: PASS (the theme test's "no raw colors" guard now also scans the three new files).

- [ ] **Step 7: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/editor packages/editor/test/extensions.test.ts
git commit -m "feat(editor): CodeMirror highlight style, theme, and extension set over the tokens"
```

### Task 7: the Editor panel

**Files:**
- Create: `packages/editor/src/panels/Editor.tsx`
- Test: `packages/editor/test/Editor.test.tsx`

**Interfaces:**
- Consumes: `createExtensions`, `languageExtension`, `readOnlyExtension`, `darkExtension` (Task 6); `useEditorStoreApi` (Task 4); `canEdit`, `localeOf`, `profileOf`, `stringsOf` (Task 4); `breakpointLines`, `breakpointsChanged`, `setCurrentLine`, `stepcodeDiagnostics` from `@stepcode/codemirror`; `syntaxTree` from `@codemirror/language`; test helpers `storeWith`, `renderWithStore` (Task 4).
- Produces: `Editor({ handleRef? })` and `EditorHandle = { readonly view: EditorView; revealSpan(from, to): void }` (Task 12).

- [ ] **Step 1: Write the failing panel tests**

Create `packages/editor/test/Editor.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { forceParsing } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { currentLineOf, toggleBreakpoint } from '@stepcode/codemirror'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Editor, type EditorHandle } from '../src/panels/Editor'
import { renderWithStore, storeWith } from './render'

const BROKEN = ['Proceso p', '  Escribir x;', 'FinProceso'].join('\n')
const FINE = ['Proceso p', '  Definir a Como Entero;', '  a <- 1;', '  Escribir a;', 'FinProceso'].join('\n')

function mount(source: string) {
  const { store, host } = storeWith({ source })
  const ref = createRef<EditorHandle>()
  const rendered = renderWithStore(<Editor handleRef={ref} />, store)
  const handle = ref.current
  if (handle === null) throw new Error('the editor did not expose its handle')
  forceParsing(handle.view, handle.view.state.doc.length, 1e9)
  return { store, host, handle, view: handle.view, rendered }
}

describe('Editor', () => {
  it('shows the store source and pushes diagnostics once the tree is ready', () => {
    const { store, view } = mount(BROKEN)
    expect(view.state.doc.toString()).toBe(BROKEN)
    expect(store.getState().diagnostics.map((d) => d.source)).toEqual(['E3001'])
  })

  it('pushes edits to the store and re-lints after the next parse', () => {
    const { store, view } = mount(FINE)
    expect(store.getState().diagnostics).toEqual([])
    view.dispatch({ changes: { from: view.state.doc.length, insert: '\nEscribir z;' } })
    expect(store.getState().source).toBe(`${FINE}\nEscribir z;`)
    forceParsing(view, view.state.doc.length, 1e9)
    expect(store.getState().diagnostics.length).toBeGreaterThan(0)
  })

  it('forwards breakpoint changes to the store and the host', () => {
    const { store, host, view } = mount(FINE)
    view.dispatch({ effects: toggleBreakpoint.of({ line: 3 }) })
    expect(store.getState().breakpoints).toEqual([3])
    expect(host.calls).toContain('setBreakpoints:3')
    view.dispatch({ effects: toggleBreakpoint.of({ line: 3 }) })
    expect(store.getState().breakpoints).toEqual([])
  })

  it('moves the current-line marker when the store says so', () => {
    const { store, view } = mount(FINE)
    expect(currentLineOf(view.state)).toBeNull()
    store.setState({ currentLine: 3 })
    expect(currentLineOf(view.state)).toBe(3)
    store.setState({ currentLine: null })
    expect(currentLineOf(view.state)).toBeNull()
  })

  it('is read-only while a program is live', () => {
    const { host, view } = mount(FINE)
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
    host.emit({ kind: 'state', state: 'running' })
    expect(view.state.facet(EditorState.readOnly)).toBe(true)
    host.emit({ kind: 'state', state: 'paused' })
    expect(view.state.facet(EditorState.readOnly)).toBe(true)
    host.emit({ kind: 'state', state: 'done' })
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
  })

  it('switches the language when the profile changes', () => {
    const { store, view } = mount(FINE)
    store.getState().setProfile('en')
    forceParsing(view, view.state.doc.length, 1e9)
    expect(store.getState().diagnostics.length).toBeGreaterThan(0)
    store.getState().setProfile('es')
    forceParsing(view, view.state.doc.length, 1e9)
    expect(store.getState().diagnostics).toEqual([])
  })

  it('follows the theme through the dark facet', () => {
    const { store, view } = mount(FINE)
    expect(view.state.facet(EditorView.darkTheme)).toBe(false)
    store.getState().setTheme('dark')
    expect(view.state.facet(EditorView.darkTheme)).toBe(true)
  })

  it('reveals a span by selecting it', () => {
    const { handle, view } = mount(FINE)
    handle.revealSpan(12, 13)
    expect(view.state.selection.main.from).toBe(12)
    expect(view.state.selection.main.to).toBe(13)
  })

  it('destroys the view and clears the handle on unmount', () => {
    const { store } = storeWith({ source: FINE })
    const ref = createRef<EditorHandle>()
    const rendered = renderWithStore(<Editor handleRef={ref} />, store)
    const dom = ref.current?.view.dom
    rendered.unmount()
    expect(ref.current).toBeNull()
    expect(dom?.isConnected).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Editor.test.tsx`
Expected: FAIL — `Failed to resolve import "../src/panels/Editor"`.

- [ ] **Step 3: Write the panel**

Create `packages/editor/src/panels/Editor.tsx`:

```tsx
import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  breakpointLines,
  breakpointsChanged,
  setCurrentLine,
  stepcodeDiagnostics,
} from '@stepcode/codemirror'
import { type RefObject, useEffect, useRef } from 'react'
import {
  createExtensions,
  darkExtension,
  languageExtension,
  readOnlyExtension,
} from '../editor/extensions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { canEdit, localeOf, profileOf, stringsOf } from '../store/store'

/** Spec §7.1: what the rest of the app may do to the editor. */
export interface EditorHandle {
  readonly view: EditorView
  revealSpan(from: number, to: number): void
}

export function Editor({ handleRef }: { handleRef?: RefObject<EditorHandle | null> }) {
  const store = useEditorStoreApi()
  const title = useEditorStore((s) => stringsOf(s).app.editor)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = container.current
    if (parent === null) return
    const initial = store.getState()
    let options = { profile: profileOf(initial), locale: localeOf(initial) }
    const { extensions, compartments } = createExtensions({
      ...options,
      readOnly: !canEdit(initial.state),
      dark: initial.theme === 'dark',
    })
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: initial.source,
        extensions: [
          extensions,
          EditorView.updateListener.of((update) => {
            const actions = store.getState()
            if (update.docChanged) actions.setSource(update.state.doc.toString())
            if (syntaxTree(update.state) !== syntaxTree(update.startState)) {
              actions.setDiagnostics(stepcodeDiagnostics(update.state, options))
            }
            if (breakpointsChanged(update)) actions.setBreakpoints(breakpointLines(update.state))
          }),
        ],
      }),
    })
    const handle: EditorHandle = {
      view,
      revealSpan: (from, to) => {
        view.dispatch({
          selection: { anchor: from, head: to },
          effects: EditorView.scrollIntoView(from, { y: 'center' }),
        })
        view.focus()
      },
    }
    if (handleRef !== undefined) handleRef.current = handle

    let previous = initial
    const unsubscribe = store.subscribe((next) => {
      if (next.currentLine !== previous.currentLine) {
        view.dispatch({ effects: setCurrentLine.of(next.currentLine) })
      }
      if (next.profileId !== previous.profileId) {
        options = { profile: profileOf(next), locale: localeOf(next) }
        view.dispatch({
          effects: compartments.language.reconfigure(languageExtension(options.profile, options.locale)),
        })
      }
      if (canEdit(next.state) !== canEdit(previous.state)) {
        view.dispatch({
          effects: compartments.readOnly.reconfigure(readOnlyExtension(!canEdit(next.state))),
        })
      }
      if (next.theme !== previous.theme) {
        view.dispatch({ effects: compartments.dark.reconfigure(darkExtension(next.theme === 'dark')) })
      }
      previous = next
    })

    return () => {
      unsubscribe()
      if (handleRef !== undefined) handleRef.current = null
      view.destroy()
    }
  }, [store, handleRef])

  return (
    <section aria-label={title} className="h-full min-h-0 overflow-hidden bg-bg">
      <div ref={container} className="h-full" />
    </section>
  )
}
```

The `EditorState.create` doc is read once: the store never writes source back into the view in 4a (spec §7.1).

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Editor.test.tsx`
Expected: PASS (9 tests). If `pushes edits` fails on the diagnostics count, `forceParsing` returned before the tree changed under happy-dom: call `forceParsing` twice in the test helper, or replace it with `ensureSyntaxTree(view.state, view.state.doc.length, 1e9)` followed by `view.dispatch({})`; record what was needed.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/panels/Editor.tsx packages/editor/test/Editor.test.tsx
git commit -m "feat(editor): Editor panel wired to the store and the debug extensions"
```

### Task 8: the Console panel

**Files:**
- Create: `packages/editor/src/panels/Console.tsx`
- Test: `packages/editor/test/Console.test.tsx`

**Interfaces:**
- Consumes: `useEditorStore` (Task 4); `profileOf`, `stringsOf` (Task 4); `typeLabel` (Task 1); `OutputBuffer` (Task 1); test helpers `storeWith`, `renderWithStore`.
- Produces: `Console()` (Task 12).

- [ ] **Step 1: Write the failing console tests**

Create `packages/editor/test/Console.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Console } from '../src/panels/Console'
import { renderWithStore, storeWith } from './render'

const integer = { kind: 'scalar', name: 'integer' } as const

describe('Console', () => {
  it('joins chunks verbatim', () => {
    const { store } = storeWith({ output: { chunks: ['a', 'b\n', 'c'], dropped: 0 } })
    renderWithStore(<Console />, store)
    expect(screen.getByTestId('console-output').textContent).toBe('ab\nc')
  })

  it('shows the dropped marker first when chunks were dropped', () => {
    const { store } = storeWith({ output: { chunks: ['z'], dropped: 12 } })
    renderWithStore(<Console />, store)
    expect(screen.getByTestId('console-output').textContent).toBe('… 12 fragmentos descartados\nz')
  })

  it('prompts for a typed variable and submits on Enter', () => {
    const { store, host } = storeWith({
      state: 'input',
      pendingInput: { line: 3, target: { name: 'n', type: integer } },
    })
    renderWithStore(<Console />, store)
    const input = screen.getByLabelText('Leer n (Entero)')
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    expect(host.calls).toEqual(['input:42'])
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('prompts for a key and submits an empty answer on any key', () => {
    const { store, host } = storeWith({ state: 'input', pendingInput: { line: 3, target: null } })
    renderWithStore(<Console />, store)
    const input = screen.getByLabelText('Presiona una tecla')
    fireEvent.keyDown(input, { key: 'a' })
    expect(host.calls).toEqual(['input:'])
  })

  it('shows the rejection and keeps focus for the next answer', () => {
    const { store } = storeWith({
      state: 'input',
      pendingInput: { line: 3, target: { name: 'n', type: integer } },
    })
    renderWithStore(<Console />, store)
    store.setState({
      pendingInput: { line: 3, target: { name: 'n', type: integer }, rejected: 'no es un entero' },
    })
    expect(screen.getByRole('alert').textContent).toBe('no es un entero')
    expect(document.activeElement).toBe(screen.getByLabelText('Leer n (Entero)'))
  })

  it('renders the prompt in the profile locale', () => {
    const { store } = storeWith({
      profileId: 'en',
      state: 'input',
      pendingInput: { line: 3, target: { name: 'n', type: integer } },
    })
    renderWithStore(<Console />, store)
    expect(screen.getByLabelText('Read n (Integer)')).toBeDefined()
  })

  it('shows the wait line while waiting and drops it afterwards', () => {
    const { store } = storeWith({ state: 'waiting', wait: { line: 2, millis: 500 } })
    renderWithStore(<Console />, store)
    expect(screen.getByText('Esperando 500 ms')).toBeDefined()
    store.setState({ state: 'running', wait: null })
    expect(screen.queryByText('Esperando 500 ms')).toBeNull()
  })

  it('shows a runtime error with its line', () => {
    const { store } = storeWith({ state: 'error', error: { line: 4, message: 'división por cero' } })
    renderWithStore(<Console />, store)
    expect(screen.getByRole('alert').textContent).toBe('Línea 4: división por cero')
  })

  it('clears through the header button', () => {
    const { store } = storeWith({ output: { chunks: ['a'], dropped: 0 } })
    renderWithStore(<Console />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(store.getState().output.chunks).toEqual([])
    expect(screen.getByTestId('console-output').textContent).toBe('')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Console.test.tsx`
Expected: FAIL — `Failed to resolve import "../src/panels/Console"`.

- [ ] **Step 3: Write the panel**

Create `packages/editor/src/panels/Console.tsx`:

```tsx
import type { ResolvedProfile } from '@stepcode/profiles'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { typeLabel } from '../labels'
import { useEditorStore } from '../store/context'
import { type PendingInput, profileOf, stringsOf } from '../store/store'
import type { Strings } from '../strings'

function InputPrompt({
  pending,
  strings,
  profile,
  onSubmit,
}: {
  pending: PendingInput
  strings: Strings
  profile: ResolvedProfile
  onSubmit: (text: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  // A new request object (including a re-ask with `rejected`) takes focus back.
  useEffect(() => {
    input.current?.focus()
  }, [pending])
  const label =
    pending.target === null
      ? strings.console.pressKey
      : strings.console.read(pending.target.name, typeLabel(pending.target.type, profile, strings))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(text)
    setText('')
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (pending.target !== null) return
    event.preventDefault()
    onSubmit('')
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-1 border-t border-border p-2 font-mono text-sm">
      {pending.rejected !== undefined && (
        <p role="alert" className="text-error">
          {pending.rejected}
        </p>
      )}
      <label className="flex items-center gap-2">
        <span className="text-accent">{label}</span>
        <input
          ref={input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={pending.target === null ? '' : strings.console.placeholder}
          className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1 text-fg outline-none focus:border-accent"
          autoComplete="off"
        />
      </label>
    </form>
  )
}

export function Console() {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  const output = useEditorStore((s) => s.output)
  const pending = useEditorStore((s) => s.pendingInput)
  const wait = useEditorStore((s) => s.wait)
  const error = useEditorStore((s) => s.error)
  const submitInput = useEditorStore((s) => s.submitInput)
  const clearOutput = useEditorStore((s) => s.clearOutput)
  const pre = useRef<HTMLPreElement>(null)
  const stickToBottom = useRef(true)

  // Auto-scroll unless the reader scrolled up (spec §7.2).
  useEffect(() => {
    const element = pre.current
    if (element !== null && stickToBottom.current) element.scrollTop = element.scrollHeight
  })
  const onScroll = () => {
    const element = pre.current
    if (element === null) return
    stickToBottom.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 4
  }

  return (
    <section aria-label={strings.console.title} className="flex h-full min-h-0 flex-col bg-surface text-fg">
      <header className="flex items-center justify-between border-b border-border px-2 py-1 text-xs text-muted">
        <span>{strings.console.title}</span>
        <button type="button" onClick={clearOutput} className="rounded px-1 hover:bg-surface-raised hover:text-fg">
          {strings.console.clear}
        </button>
      </header>
      <pre
        ref={pre}
        onScroll={onScroll}
        data-testid="console-output"
        className="m-0 min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-2 font-mono text-sm"
      >
        {output.dropped > 0 && <span className="text-muted">{`${strings.console.dropped(output.dropped)}\n`}</span>}
        {output.chunks.join('')}
        {wait !== null && <span className="text-muted">{strings.console.waiting(wait.millis)}</span>}
        {error !== null && (
          <span role="alert" className="text-error">
            {strings.console.errorAt(error.line, error.message)}
          </span>
        )}
      </pre>
      {pending !== null && (
        <InputPrompt pending={pending} strings={strings} profile={profile} onSubmit={submitInput} />
      )}
    </section>
  )
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Console.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/panels/Console.tsx packages/editor/test/Console.test.tsx
git commit -m "feat(editor): Console panel with inline input, wait, and error lines"
```

### Task 9: the Variables panel

**Files:**
- Create: `packages/editor/src/panels/values.ts`
- Create: `packages/editor/src/panels/Variables.tsx`
- Test: `packages/editor/test/values.test.ts`, `packages/editor/test/Variables.test.tsx`

**Interfaces:**
- Consumes: `renderValue`, `ArrayValue`, `FrameVariable`, `Scalar` from `stepcode`; `typeLabel` (Task 1); `useEditorStore`, `profileOf`, `stringsOf` (Task 4).
- Produces: `ARRAY_LIMIT = 100`, `renderArray(value, renderScalar, unassigned, more, limit?)`, `valueLabel(variable, profile, strings)`; `Variables()` (Task 12).

- [ ] **Step 1: Write the failing value tests**

Create `packages/editor/test/values.test.ts`:

```ts
import { profiles } from '@stepcode/profiles'
import type { ArrayValue, FrameVariable } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { ARRAY_LIMIT, renderArray, valueLabel } from '../src/panels/values'
import { stringsFor } from '../src/strings'

const es = stringsFor('es')
const scalar = (value: number | string | boolean): string => String(value)
const more = (count: number): string => `… (+${count})`

function array(dims: number[], data: (number | undefined)[]): ArrayValue {
  return { element: 'integer', dims, data }
}

describe('renderArray', () => {
  it('renders rank 1 with holes', () => {
    expect(renderArray(array([3], [1, undefined, 3]), scalar, '—', more)).toBe('[1, —, 3]')
  })

  it('renders rank 2 row-major and rank 3 nested', () => {
    expect(renderArray(array([2, 2], [1, 2, 3, 4]), scalar, '—', more)).toBe('[[1, 2], [3, 4]]')
    expect(renderArray(array([2, 1, 2], [1, 2, 3, 4]), scalar, '—', more)).toBe('[[[1, 2]], [[3, 4]]]')
  })

  it('truncates past the limit and says how many more', () => {
    const data = Array.from({ length: 105 }, (_, i) => i)
    const text = renderArray(array([105], data), scalar, '—', more, 100)
    expect(text.startsWith('[0, 1, 2')).toBe(true)
    expect(text.endsWith(', 99, … (+5)]')).toBe(true)
    expect(text.split(', ').length).toBe(101)
    expect(ARRAY_LIMIT).toBe(100)
  })

  it('truncates a matrix by cells, not rows', () => {
    const data = Array.from({ length: 6 }, (_, i) => i)
    expect(renderArray(array([3, 2], data), scalar, '—', more, 4)).toBe('[[0, 1], [2, 3], [… (+2)]]')
  })
})

describe('valueLabel', () => {
  const variable = (partial: Partial<FrameVariable>): FrameVariable => ({
    name: 'v',
    kind: 'variable',
    type: { kind: 'scalar', name: 'integer' },
    value: undefined,
    ...partial,
  })

  it('renders scalars through the language renderer', () => {
    expect(valueLabel(variable({ value: 3 }), profiles.es, es)).toBe('3')
    expect(valueLabel(variable({ type: { kind: 'scalar', name: 'boolean' }, value: true }), profiles.es, es)).toBe('Verdadero')
    expect(valueLabel(variable({ type: { kind: 'scalar', name: 'boolean' }, value: true }), profiles.en, stringsFor('en'))).toBe('True')
  })

  it('renders an unassigned scalar as the dash and an array as a list', () => {
    expect(valueLabel(variable({}), profiles.es, es)).toBe('—')
    expect(
      valueLabel(
        variable({ type: { kind: 'array', element: 'integer', rank: 1 }, value: array([2], [7, undefined]) }),
        profiles.es,
        es,
      ),
    ).toBe('[7, —]')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/values.test.ts`
Expected: FAIL — `Failed to resolve import "../src/panels/values"`.

- [ ] **Step 3: Write the value helpers**

Create `packages/editor/src/panels/values.ts`:

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import { type ArrayValue, type FrameVariable, renderValue, type Scalar } from 'stepcode'
import type { Strings } from '../strings'

export const ARRAY_LIMIT = 100

/**
 * Spec §7.3: `[a, b, c]`, nested per rank, holes as `unassigned`, at most `limit` cells followed
 * by `more(rest)` inside the innermost list that overflowed.
 */
export function renderArray(
  value: ArrayValue,
  renderScalar: (scalar: Scalar) => string,
  unassigned: string,
  more: (count: number) => string,
  limit: number = ARRAY_LIMIT,
): string {
  const { dims, data } = value
  const total = data.length
  let used = 0
  const strides: number[] = []
  let stride = 1
  for (let i = dims.length - 1; i >= 0; i--) {
    strides[i] = stride
    stride *= dims[i] ?? 1
  }
  const render = (dimension: number, offset: number): string | null => {
    if (used >= limit) return null
    const size = dims[dimension] ?? 0
    const step = strides[dimension] ?? 1
    const parts: string[] = []
    for (let i = 0; i < size; i++) {
      if (dimension === dims.length - 1) {
        if (used >= limit) {
          parts.push(more(total - used))
          break
        }
        used++
        const cell = data[offset + i]
        parts.push(cell === undefined ? unassigned : renderScalar(cell))
      } else {
        const inner = render(dimension + 1, offset + i * step)
        if (inner === null) {
          parts.push(`[${more(total - used)}]`)
          break
        }
        parts.push(inner)
      }
    }
    return `[${parts.join(', ')}]`
  }
  return render(0, 0) ?? '[]'
}

/** A frame variable's value column. */
export function valueLabel(variable: FrameVariable, profile: ResolvedProfile, strings: Strings): string {
  const { value, type } = variable
  if (value === undefined) return strings.variables.unassigned
  if (typeof value === 'object') {
    const element = { kind: 'scalar', name: value.element } as const
    return renderArray(
      value,
      (scalar) => renderValue(scalar, element, profile),
      strings.variables.unassigned,
      strings.variables.more,
    )
  }
  if (type.kind !== 'scalar') return String(value)
  return renderValue(value, type, profile)
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/values.test.ts`
Expected: PASS (6 tests). The `True` spelling comes from `profiles.en` (`renderValue` uses the profile's boolean spellings); if it differs, read `packages/profiles/src/profiles/en.json` `keywords.true` and fix the test's expectation, not the code.

- [ ] **Step 5: Write the failing panel test**

Create `packages/editor/test/Variables.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { screen, within } from '@testing-library/react'
import type { Frame } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { Variables } from '../src/panels/Variables'
import { renderWithStore, storeWith } from './render'

const inner: Frame = {
  name: 'doble',
  line: 2,
  variables: [
    { name: 'n', kind: 'parameter', type: { kind: 'scalar', name: 'integer' }, value: 4 },
    { name: 'r', kind: 'result', type: { kind: 'scalar', name: 'integer' }, value: undefined },
  ],
}

const outer: Frame = {
  name: 'p',
  line: 7,
  variables: [
    {
      name: 'xs',
      kind: 'variable',
      type: { kind: 'array', element: 'integer', rank: 1 },
      value: { element: 'integer', dims: [2], data: [1, 2] },
    },
  ],
}

describe('Variables', () => {
  it('shows the empty state while ready', () => {
    const { store } = storeWith({ state: 'ready', frames: [] })
    renderWithStore(<Variables />, store)
    expect(screen.getByText('Sin programa en ejecución')).toBeDefined()
  })

  it('lists frames innermost first with kind, type, and value columns', () => {
    const { store } = storeWith({ state: 'paused', frames: [inner, outer] })
    renderWithStore(<Variables />, store)
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(['doble · línea 2', 'p · línea 7'])
    const rows = screen.getAllByRole('row').filter((row) => within(row).queryAllByRole('cell').length > 0)
    const cells = rows.map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent))
    expect(cells).toEqual([
      ['n', 'parámetro', 'Entero', '4'],
      ['r', 'resultado', 'Entero', '—'],
      ['xs', 'variable', 'Arreglo de Entero', '[1, 2]'],
    ])
  })

  it('keeps showing frames after done and follows the locale', () => {
    const { store } = storeWith({ state: 'done', frames: [outer], profileId: 'en' })
    renderWithStore(<Variables />, store)
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('p · line 7')
    expect(screen.getByText('Array of Integer')).toBeDefined()
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Variables.test.tsx`
Expected: FAIL — `Failed to resolve import "../src/panels/Variables"`.

- [ ] **Step 6: Write the panel**

Create `packages/editor/src/panels/Variables.tsx`:

```tsx
import { typeLabel } from '../labels'
import { useEditorStore } from '../store/context'
import { profileOf, stringsOf } from '../store/store'
import { valueLabel } from './values'

export function Variables() {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  const frames = useEditorStore((s) => s.frames)
  const state = useEditorStore((s) => s.state)
  const empty = state === 'ready' || frames.length === 0

  return (
    <section aria-label={strings.variables.title} className="flex h-full min-h-0 flex-col bg-surface text-fg">
      <header className="border-b border-border px-2 py-1 text-xs text-muted">{strings.variables.title}</header>
      <div className="min-h-0 flex-1 overflow-auto p-2 text-sm">
        {empty ? (
          <p className="text-muted">{strings.variables.empty}</p>
        ) : (
          frames.map((frame, index) => (
            <div key={`${index}-${frame.name}`} className="mb-3">
              <h3 className="mb-1 font-semibold">{strings.variables.frameAt(frame.name, frame.line)}</h3>
              <table className="w-full border-collapse font-mono text-xs">
                <thead className="text-muted">
                  <tr>
                    <th className="text-left font-normal">{strings.variables.name}</th>
                    <th className="text-left font-normal">{strings.variables.kind}</th>
                    <th className="text-left font-normal">{strings.variables.type}</th>
                    <th className="text-left font-normal">{strings.variables.value}</th>
                  </tr>
                </thead>
                <tbody>
                  {frame.variables.map((variable) => (
                    <tr key={variable.name} className="border-t border-border">
                      <td className="pr-2">{variable.name}</td>
                      <td className="pr-2 text-muted">{strings.kinds[variable.kind]}</td>
                      <td className="pr-2">{typeLabel(variable.type, profile, strings)}</td>
                      <td className="whitespace-pre-wrap break-all">{valueLabel(variable, profile, strings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Variables.test.tsx packages/editor/test/values.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 8: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/panels/values.ts packages/editor/src/panels/Variables.tsx packages/editor/test/values.test.ts packages/editor/test/Variables.test.tsx
git commit -m "feat(editor): Variables panel with array rendering"
```

### Task 10: the Problems panel

**Files:**
- Create: `packages/editor/src/panels/Problems.tsx`
- Test: `packages/editor/test/Problems.test.tsx`

**Interfaces:**
- Consumes: `useEditorStore`, `stringsOf` (Task 4); `LineMap` from `stepcode`; `Diagnostic` from `@codemirror/lint`.
- Produces: `Problems({ onReveal })` with `onReveal: (from: number, to: number) => void` (Task 12).

- [ ] **Step 1: Write the failing panel tests**

Create `packages/editor/test/Problems.test.tsx`:

```tsx
// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Problems } from '../src/panels/Problems'
import { renderWithStore, storeWith } from './render'

const SOURCE = ['Proceso p', '  Escribir x;', '  Definir a Como Entero;', 'FinProceso'].join('\n')

const diagnostics: Diagnostic[] = [
  { from: 34, to: 35, severity: 'warning', message: 'a never read', source: 'W3002' },
  { from: 21, to: 22, severity: 'error', message: 'x undeclared', source: 'E3001' },
  { from: 21, to: 22, severity: 'warning', message: 'also here', source: 'W9999' },
]

describe('Problems', () => {
  it('shows the empty state and zero counts', () => {
    const { store } = storeWith({ source: SOURCE, diagnostics: [] })
    renderWithStore(<Problems onReveal={() => {}} />, store)
    expect(screen.getByText('Sin problemas')).toBeDefined()
    expect(screen.getByText('0 errores, 0 advertencias')).toBeDefined()
  })

  it('lists diagnostics by position, errors before warnings at the same offset, with line:col', () => {
    const { store } = storeWith({ source: SOURCE, diagnostics })
    renderWithStore(<Problems onReveal={() => {}} />, store)
    expect(screen.getByText('1 error, 2 advertencias')).toBeDefined()
    const rows = screen.getAllByRole('row')
    const texts = rows.map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent))
    expect(texts).toEqual([
      ['error', '2:12', 'x undeclared', 'E3001'],
      ['warning', '2:12', 'also here', 'W9999'],
      ['warning', '3:11', 'a never read', 'W3002'],
    ])
  })

  it('reveals the span in a real editor on click', () => {
    const view = new EditorView({
      parent: document.body,
      state: EditorState.create({ doc: SOURCE }),
    })
    const { store } = storeWith({ source: SOURCE, diagnostics })
    renderWithStore(
      <Problems onReveal={(from, to) => view.dispatch({ selection: { anchor: from, head: to } })} />,
      store,
    )
    fireEvent.click(screen.getByText('a never read'))
    expect(view.state.selection.main.from).toBe(34)
    expect(view.state.selection.main.to).toBe(35)
    view.destroy()
  })

  it('follows the locale', () => {
    const { store } = storeWith({ source: SOURCE, diagnostics: [], profileId: 'en' })
    renderWithStore(<Problems onReveal={() => {}} />, store)
    expect(screen.getByText('No problems')).toBeDefined()
    expect(screen.getByText('0 errors, 0 warnings')).toBeDefined()
  })
})
```

Offsets: line 1 `Proceso p` is 9 characters plus its newline, so line 2 starts at 10 and its `x` sits at offset 21, column 12; line 3 starts at 24 and its `a` sits at offset 34, column 11. `LineMap.positionAt` from the language package is the authority; if it disagrees, fix the expectation and say so in the report.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Problems.test.tsx`
Expected: FAIL — `Failed to resolve import "../src/panels/Problems"`.

- [ ] **Step 3: Write the panel**

Create `packages/editor/src/panels/Problems.tsx`:

```tsx
import type { Diagnostic } from '@codemirror/lint'
import { LineMap } from 'stepcode'
import { useMemo } from 'react'
import { useEditorStore } from '../store/context'
import { stringsOf } from '../store/store'

const SEVERITY_ORDER: Readonly<Record<Diagnostic['severity'], number>> = {
  error: 0,
  warning: 1,
  info: 2,
  hint: 3,
}

function sorted(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort(
    (a, b) => a.from - b.from || SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  )
}

export function Problems({ onReveal }: { onReveal: (from: number, to: number) => void }) {
  const strings = useEditorStore(stringsOf)
  const source = useEditorStore((s) => s.source)
  const diagnostics = useEditorStore((s) => s.diagnostics)
  const lines = useMemo(() => new LineMap(source), [source])
  const rows = useMemo(() => sorted(diagnostics), [diagnostics])
  const errors = diagnostics.filter((d) => d.severity === 'error').length
  const warnings = diagnostics.filter((d) => d.severity === 'warning').length

  return (
    <section aria-label={strings.problems.title} className="flex h-full min-h-0 flex-col bg-surface text-fg">
      <header className="flex items-center justify-between border-b border-border px-2 py-1 text-xs text-muted">
        <span>{strings.problems.title}</span>
        <span>{strings.problems.summary(errors, warnings)}</span>
      </header>
      <div className="min-h-0 flex-1 overflow-auto text-sm">
        {rows.length === 0 ? (
          <p className="p-2 text-muted">{strings.problems.empty}</p>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((diagnostic, index) => {
                const position = lines.positionAt(diagnostic.from)
                return (
                  <tr
                    key={`${diagnostic.from}-${diagnostic.source ?? index}`}
                    onClick={() => onReveal(diagnostic.from, diagnostic.to)}
                    className="cursor-pointer border-t border-border hover:bg-surface-raised"
                  >
                    <td className={`px-2 py-1 ${diagnostic.severity === 'error' ? 'text-error' : 'text-warning'}`}>
                      {diagnostic.severity}
                    </td>
                    <td className="px-2 py-1 font-mono text-xs text-muted">{`${position.line}:${position.column}`}</td>
                    <td className="px-2 py-1">{diagnostic.message}</td>
                    <td className="px-2 py-1 font-mono text-xs text-muted">{diagnostic.source ?? ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Problems.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0.

```bash
git add packages/editor/src/panels/Problems.tsx packages/editor/test/Problems.test.tsx
git commit -m "feat(editor): Problems panel listing lint diagnostics with reveal on click"
```

### Task 11: toolbar and keyboard shortcuts

**Files:**
- Create: `packages/editor/src/components/shortcuts.ts`
- Create: `packages/editor/src/components/Toolbar.tsx`
- Test: `packages/editor/test/shortcuts.test.ts`, `packages/editor/test/Toolbar.test.tsx`

**Interfaces:**
- Consumes: `EditorStore`, `StoreState`, `PROFILE_IDS`, `canEdit`, `hasErrors`, `stringsOf` (Task 4); `useEditorStore` (Task 4); `WorkerState` (Task 1); `Theme` (Task 1).
- Produces: `ShortcutAction`, `shortcutFor(event)`, `isLegal(action, state)`, `performShortcut(store, action): boolean`, `installShortcuts(store, target?): () => void`; `Toolbar()` (Task 12).

- [ ] **Step 1: Write the failing shortcut tests**

Create `packages/editor/test/shortcuts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isLegal, performShortcut, shortcutFor } from '../src/components/shortcuts'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const key = (k: string, shift = false) => ({ key: k, shiftKey: shift, ctrlKey: false, altKey: false, metaKey: false })

describe('shortcutFor', () => {
  it('maps the spec keys and nothing else', () => {
    expect(shortcutFor(key('F5'))).toBe('runOrContinue')
    expect(shortcutFor(key('F5', true))).toBe('stop')
    expect(shortcutFor(key('F6'))).toBe('pause')
    expect(shortcutFor(key('F10'))).toBe('stepOver')
    expect(shortcutFor(key('F11'))).toBe('stepInto')
    expect(shortcutFor(key('F11', true))).toBe('stepOut')
    expect(shortcutFor(key('F9'))).toBeNull()
    expect(shortcutFor({ ...key('F5'), ctrlKey: true })).toBeNull()
  })
})

describe('isLegal', () => {
  it('follows the store guards', () => {
    expect(isLegal('runOrContinue', 'ready', false)).toBe(true)
    expect(isLegal('runOrContinue', 'ready', true)).toBe(false)
    expect(isLegal('runOrContinue', 'paused', true)).toBe(true)
    expect(isLegal('runOrContinue', 'running', false)).toBe(false)
    expect(isLegal('stepInto', 'done', false)).toBe(true)
    expect(isLegal('stepInto', 'paused', false)).toBe(true)
    expect(isLegal('stepInto', 'input', false)).toBe(false)
    expect(isLegal('stepOver', 'paused', false)).toBe(true)
    expect(isLegal('stepOver', 'ready', false)).toBe(false)
    expect(isLegal('stepOut', 'paused', false)).toBe(true)
    expect(isLegal('pause', 'running', false)).toBe(true)
    expect(isLegal('pause', 'paused', false)).toBe(false)
    expect(isLegal('stop', 'ready', false)).toBe(false)
    expect(isLegal('stop', 'waiting', false)).toBe(true)
  })
})

describe('performShortcut', () => {
  it('calls the matching store action and reports whether it was legal', () => {
    const host = new FakeHost()
    const store = createEditorStore(host)
    expect(performShortcut(store, 'stepOver')).toBe(false)
    expect(performShortcut(store, 'runOrContinue')).toBe(true)
    expect(host.calls).toEqual(['start:run'])
    host.emit({ kind: 'state', state: 'paused' })
    expect(performShortcut(store, 'runOrContinue')).toBe(true)
    expect(performShortcut(store, 'stepInto')).toBe(true)
    expect(performShortcut(store, 'stepOver')).toBe(true)
    expect(performShortcut(store, 'stepOut')).toBe(true)
    expect(host.calls.slice(1)).toEqual(['continue', 'step', 'stepOver', 'stepOut'])
    host.emit({ kind: 'state', state: 'running' })
    expect(performShortcut(store, 'pause')).toBe(true)
    expect(performShortcut(store, 'stop')).toBe(true)
    expect(host.calls.slice(-2)).toEqual(['pause', 'stop'])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/shortcuts.test.ts`
Expected: FAIL — `Failed to resolve import "../src/components/shortcuts"`.

- [ ] **Step 3: Write the shortcuts**

Create `packages/editor/src/components/shortcuts.ts`:

```ts
import type { WorkerState } from '../runtime/protocol'
import { canEdit, type EditorStore, hasErrors } from '../store/store'

export type ShortcutAction = 'runOrContinue' | 'stepOver' | 'stepInto' | 'stepOut' | 'pause' | 'stop'

export interface KeyLike {
  readonly key: string
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
}

/** Spec §7.5: F5 run/continue, Shift+F5 stop, F6 pause, F10 step over, F11 step into, Shift+F11 step out. */
export function shortcutFor(event: KeyLike): ShortcutAction | null {
  if (event.ctrlKey || event.altKey || event.metaKey) return null
  switch (event.key) {
    case 'F5':
      return event.shiftKey ? 'stop' : 'runOrContinue'
    case 'F6':
      return event.shiftKey ? null : 'pause'
    case 'F10':
      return event.shiftKey ? null : 'stepOver'
    case 'F11':
      return event.shiftKey ? 'stepOut' : 'stepInto'
    default:
      return null
  }
}

/** Mirrors the store's guards (spec §6) so a key is only swallowed when it does something. */
export function isLegal(action: ShortcutAction, state: WorkerState, errors: boolean): boolean {
  switch (action) {
    case 'runOrContinue':
      return state === 'paused' || (canEdit(state) && !errors)
    case 'stepInto':
      return state === 'paused' || (canEdit(state) && !errors)
    case 'stepOver':
    case 'stepOut':
      return state === 'paused'
    case 'pause':
      return state === 'running'
    case 'stop':
      return state !== 'ready'
  }
}

/** Runs the action when legal; returns whether it ran. */
export function performShortcut(store: EditorStore, action: ShortcutAction): boolean {
  const s = store.getState()
  if (!isLegal(action, s.state, hasErrors(s))) return false
  switch (action) {
    case 'runOrContinue':
      if (s.state === 'paused') s.continue()
      else s.run()
      return true
    case 'stepInto':
      s.stepInto()
      return true
    case 'stepOver':
      s.stepOver()
      return true
    case 'stepOut':
      s.stepOut()
      return true
    case 'pause':
      s.pause()
      return true
    case 'stop':
      s.stop()
      return true
  }
}

/** Window-level keydown; `preventDefault` only when the action ran (spec §7.5). */
export function installShortcuts(store: EditorStore, target: Window = window): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    const action = shortcutFor(event)
    if (action !== null && performShortcut(store, action)) event.preventDefault()
  }
  target.addEventListener('keydown', onKeyDown)
  return () => {
    target.removeEventListener('keydown', onKeyDown)
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/shortcuts.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing toolbar tests**

Create `packages/editor/test/Toolbar.test.tsx`:

```tsx
// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installShortcuts } from '../src/components/shortcuts'
import { Toolbar } from '../src/components/Toolbar'
import type { WorkerState } from '../src/runtime/protocol'
import { renderWithStore, storeWith } from './render'

const errorDiagnostic: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warningDiagnostic: Diagnostic = { from: 0, to: 1, severity: 'warning', message: 'w' }

function buttons(): string[] {
  return screen
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label') ?? button.textContent ?? '')
    .filter((name) => name !== 'Tema oscuro' && name !== 'Tema claro')
}

describe('Toolbar controls', () => {
  it.each<[WorkerState, string[]]>([
    ['ready', ['Ejecutar', 'Paso']],
    ['done', ['Ejecutar', 'Paso']],
    ['error', ['Ejecutar', 'Paso']],
    ['running', ['Pausar', 'Detener']],
    ['paused', ['Continuar', 'Pasar por encima', 'Entrar', 'Salir', 'Detener']],
    ['input', ['Detener']],
    ['waiting', ['Detener']],
  ])('in %s shows %j', (state, expected) => {
    const { store } = storeWith({ state })
    renderWithStore(<Toolbar />, store)
    expect(buttons()).toEqual(expected)
  })

  it('disables Run and Step while an error diagnostic exists', () => {
    const { store } = storeWith({ diagnostics: [errorDiagnostic] })
    renderWithStore(<Toolbar />, store)
    expect((screen.getByRole('button', { name: 'Ejecutar' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Paso' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('dispatches the store actions', () => {
    const { store, host } = storeWith({ state: 'paused' })
    renderWithStore(<Toolbar />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Pasar por encima' }))
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(host.calls).toEqual(['stepOver', 'step', 'stepOut', 'continue'])
    host.emit({ kind: 'state', state: 'running' })
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Detener' }))
    expect(host.calls.slice(-2)).toEqual(['pause', 'stop'])
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(host.calls.at(-1)).toBe('start:run')
  })

  it('shows the diagnostic badge and the state label', () => {
    const { store } = storeWith({ state: 'paused', diagnostics: [errorDiagnostic, warningDiagnostic, warningDiagnostic] })
    renderWithStore(<Toolbar />, store)
    expect(screen.getByText('1 error')).toBeDefined()
    expect(screen.getByText('2 advertencias')).toBeDefined()
    expect(screen.getByText('En pausa')).toBeDefined()
  })

  it('switches the profile and the theme', () => {
    const { store } = storeWith({})
    renderWithStore(<Toolbar />, store)
    fireEvent.change(screen.getByLabelText('Perfil'), { target: { value: 'en' } })
    expect(store.getState().profileId).toBe('en')
    expect(screen.getByRole('button', { name: 'Run' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
    expect(store.getState().theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Light theme' })).toBeDefined()
  })

  it('locks the profile while a program is live', () => {
    const { store } = storeWith({ state: 'running' })
    renderWithStore(<Toolbar />, store)
    expect((screen.getByLabelText('Perfil') as HTMLSelectElement).disabled).toBe(true)
  })
})

describe('installShortcuts', () => {
  it('runs legal actions and prevents default only then', () => {
    const { store, host } = storeWith({})
    const uninstall = installShortcuts(store)
    const legal = new KeyboardEvent('keydown', { key: 'F5', cancelable: true })
    window.dispatchEvent(legal)
    expect(legal.defaultPrevented).toBe(true)
    expect(host.calls).toEqual(['start:run'])
    const illegal = new KeyboardEvent('keydown', { key: 'F10', cancelable: true })
    window.dispatchEvent(illegal)
    expect(illegal.defaultPrevented).toBe(false)
    uninstall()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Toolbar.test.tsx`
Expected: FAIL — `Failed to resolve import "../src/components/Toolbar"`.

- [ ] **Step 6: Write the toolbar**

Create `packages/editor/src/components/Toolbar.tsx`:

```tsx
import type { ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../store/context'
import { canEdit, hasErrors, PROFILE_IDS, type ProfileId, stringsOf } from '../store/store'

const ICON = 'h-4 w-4 fill-current'

const icons = {
  run: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M4 2l10 6-10 6z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M3 2h4v12H3zM9 2h4v12H9z" />
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M3 3h10v10H3z" />
    </svg>
  ),
  stepOver: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M2 9a6 6 0 0 1 10-4.5V2l3 3-3 3V6a4 4 0 0 0-8 3zM7 12h2v2H7z" />
    </svg>
  ),
  stepInto: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M7 1h2v7h3l-4 4-4-4h3zM7 13h2v2H7z" />
    </svg>
  ),
  stepOut: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M8 1l4 4H9v7H7V5H4zM7 13h2v2H7z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <circle cx="8" cy="8" r="3.5" />
      <path d="M8 0h0v3M8 13v3M0 8h3M13 8h3M2.3 2.3l2.2 2.2M11.5 11.5l2.2 2.2M2.3 13.7l2.2-2.2M11.5 4.5l2.2-2.2" stroke="currentColor" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M10 1a7 7 0 1 0 5 12A6 6 0 0 1 10 1z" />
    </svg>
  ),
} as const

function Control({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded p-1 text-fg hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function Toolbar() {
  const strings = useEditorStore(stringsOf)
  const state = useEditorStore((s) => s.state)
  const errors = useEditorStore(hasErrors)
  const errorCount = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'error').length)
  const warningCount = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'warning').length)
  const profileId = useEditorStore((s) => s.profileId)
  const theme = useEditorStore((s) => s.theme)
  // Actions are stable, but the object is new per call: `useShallow` keeps re-renders away.
  const actions = useEditorStore(
    useShallow((s) => ({
      run: s.run,
      stepInto: s.stepInto,
      stepOver: s.stepOver,
      stepOut: s.stepOut,
      continue: s.continue,
      pause: s.pause,
      stop: s.stop,
      setProfile: s.setProfile,
      setTheme: s.setTheme,
    })),
  )
  const t = strings.toolbar

  const controls = (() => {
    switch (state) {
      case 'ready':
      case 'done':
      case 'error':
        return (
          <>
            <Control label={t.run} onClick={actions.run} disabled={errors}>
              {icons.run}
            </Control>
            <Control label={t.step} onClick={actions.stepInto} disabled={errors}>
              {icons.stepInto}
            </Control>
          </>
        )
      case 'running':
        return (
          <>
            <Control label={t.pause} onClick={actions.pause}>
              {icons.pause}
            </Control>
            <Control label={t.stop} onClick={actions.stop}>
              {icons.stop}
            </Control>
          </>
        )
      case 'paused':
        return (
          <>
            <Control label={t.continue} onClick={actions.continue}>
              {icons.run}
            </Control>
            <Control label={t.stepOver} onClick={actions.stepOver}>
              {icons.stepOver}
            </Control>
            <Control label={t.stepInto} onClick={actions.stepInto}>
              {icons.stepInto}
            </Control>
            <Control label={t.stepOut} onClick={actions.stepOut}>
              {icons.stepOut}
            </Control>
            <Control label={t.stop} onClick={actions.stop}>
              {icons.stop}
            </Control>
          </>
        )
      case 'input':
      case 'waiting':
        return (
          <Control label={t.stop} onClick={actions.stop}>
            {icons.stop}
          </Control>
        )
    }
  })()

  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-1 text-sm text-fg">
      <span className="font-semibold">{strings.app.title}</span>
      <label className="flex items-center gap-1 text-xs text-muted">
        {t.profile}
        <select
          aria-label={t.profile}
          value={profileId}
          disabled={!canEdit(state)}
          onChange={(event) => actions.setProfile(event.target.value as ProfileId)}
          className="rounded border border-border bg-surface px-1 py-0.5 text-fg"
        >
          {PROFILE_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <span className="flex items-center gap-2 text-xs">
        <span className={errorCount > 0 ? 'text-error' : 'text-muted'}>{t.errors(errorCount)}</span>
        <span className={warningCount > 0 ? 'text-warning' : 'text-muted'}>{t.warnings(warningCount)}</span>
      </span>
      <span className="ml-auto text-xs text-muted">{strings.states[state]}</span>
      <Control
        label={theme === 'dark' ? t.toLight : t.toDark}
        onClick={() => actions.setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? icons.sun : icons.moon}
      </Control>
      <div className="flex items-center gap-1">{controls}</div>
    </header>
  )
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Toolbar.test.tsx packages/editor/test/shortcuts.test.ts`
Expected: PASS (13 tests). The `buttons()` helper excludes the theme toggle by its two labels so the per-state table stays exact.

- [ ] **Step 8: Typecheck, lint, commit**

Run: `pnpm --filter @stepcode/editor typecheck && pnpm lint:fix && pnpm lint`
Expected: exit 0. Biome may flag `noArrayIndexKey` nowhere here; the `Control` component needs no key.

```bash
git add packages/editor/src/components packages/editor/test/shortcuts.test.ts packages/editor/test/Toolbar.test.tsx
git commit -m "feat(editor): toolbar run controls, profile and theme switches, keyboard shortcuts"
```

### Task 12: the app shell, the entry point, the barrel cleanup, the README

**Files:**
- Modify: `packages/editor/src/App.tsx` (whole file)
- Modify: `packages/editor/src/main.tsx` (whole file)
- Modify: `packages/editor/test/App.test.tsx` (whole file)
- Create: `packages/editor/README.md`
- Modify: `packages/codemirror/src/index.ts` (remove `packageName`)
- Modify: `packages/codemirror/test/index.test.ts` (remove the `packageName` expectations)
- Test: `packages/editor/test/App.test.tsx`

**Interfaces:**
- Consumes: `Toolbar` (Task 11), `Editor`, `EditorHandle` (Task 7), `Console` (Task 8), `Variables` (Task 9), `Problems` (Task 10), `installShortcuts` (Task 11), `createEditorStore`, `StoreProvider` (Task 4), `RuntimeHost` (Task 3), `applyTheme`, `resolveInitialTheme` (Task 5).
- Produces: `App()` rendered inside a provider; `main.tsx` owns the one store and the one host.

- [ ] **Step 1: Write the failing app tests**

Replace `packages/editor/test/App.test.tsx` with:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../src/App'
import { Toolbar } from '../src/components/Toolbar'
import { renderWithStore, storeWith } from './render'

describe('App', () => {
  it('renders the toolbar and the four panels', () => {
    const { store } = storeWith({})
    renderWithStore(<App />, store)
    expect(screen.getByRole('banner')).toBeDefined()
    for (const name of ['Editor', 'Consola', 'Variables', 'Problemas']) {
      expect(screen.getByRole('region', { name })).toBeDefined()
    }
    expect(screen.getByRole('button', { name: 'Ejecutar' })).toBeDefined()
  })

  it('installs the keyboard shortcuts while mounted', () => {
    const { store, host } = storeWith({})
    const rendered = renderWithStore(<App />, store)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
    rendered.unmount()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
  })

  it('connects Problems to the editor', () => {
    const { store } = storeWith({
      source: 'Proceso p\n  Escribir x;\nFinProceso',
      diagnostics: [{ from: 21, to: 22, severity: 'error', message: 'x undeclared', source: 'E3001' }],
    })
    renderWithStore(<App />, store)
    const row = screen.getAllByRole('row')[0]
    if (row === undefined) throw new Error('no diagnostic row')
    row.click()
    const editor = screen.getByRole('region', { name: 'Editor' })
    expect(editor.querySelector('.cm-content')?.textContent).toContain('Escribir x;')
    expect(document.activeElement?.closest('.cm-editor')).not.toBeNull()
  })

  it('refuses to render a store consumer without a provider', () => {
    expect(() => render(<Toolbar />)).toThrow(/StoreProvider/)
  })
})
```

`getByRole('region', { name })` finds the `<section aria-label>` each panel renders; `banner` is the toolbar's `<header>` at the top level.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/App.test.tsx`
Expected: FAIL — the scaffold `App` renders a heading and `packageName`; `getByRole('banner')` throws.

- [ ] **Step 3: Write the app and the entry point**

Replace `packages/editor/src/App.tsx` with:

```tsx
import { useEffect, useRef } from 'react'
import { installShortcuts } from './components/shortcuts'
import { Toolbar } from './components/Toolbar'
import { Console } from './panels/Console'
import { Editor, type EditorHandle } from './panels/Editor'
import { Problems } from './panels/Problems'
import { Variables } from './panels/Variables'
import { useEditorStoreApi } from './store/context'

/** Spec §7.6: toolbar row, editor two thirds left, Variables over Problems right, Console below. */
export function App() {
  const store = useEditorStoreApi()
  const editor = useRef<EditorHandle | null>(null)

  useEffect(() => installShortcuts(store), [store])

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-bg text-fg">
      <Toolbar />
      <div className="grid min-h-0 grid-cols-[2fr_1fr] grid-rows-[2fr_1fr] gap-px bg-border">
        <div className="min-h-0">
          <Editor handleRef={editor} />
        </div>
        <div className="grid min-h-0 grid-rows-[1fr_1fr] gap-px bg-border">
          <div className="min-h-0">
            <Variables />
          </div>
          <div className="min-h-0">
            <Problems onReveal={(from, to) => editor.current?.revealSpan(from, to)} />
          </div>
        </div>
        <div className="col-span-2 min-h-0">
          <Console />
        </div>
      </div>
    </div>
  )
}
```

Replace `packages/editor/src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { RuntimeHost } from './runtime/host'
import { StoreProvider } from './store/context'
import { createEditorStore } from './store/store'
import { applyTheme, resolveInitialTheme } from './theme/theme'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Missing #root element')
}

// Spec §8.2: the theme is on the root before the first paint.
const initialTheme = resolveInitialTheme()
applyTheme(initialTheme)

// Spec §6: one host, one store, the store its only subscriber.
const store = createEditorStore(new RuntimeHost(), { applyTheme, initialTheme })

createRoot(root).render(
  <StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </StrictMode>,
)
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/App.test.tsx`
Expected: PASS (4 tests). The Editor panel under `StrictMode` is not exercised here (tests render without it); `main.tsx` mounts under `StrictMode`, whose double effect run creates and destroys one view before the real one — `Editor`'s cleanup handles it.

- [ ] **Step 5: Remove `packageName` from the codemirror barrel**

In `packages/codemirror/src/index.ts`, delete the line `export const packageName = '@stepcode/codemirror'` and the blank line after it. In `packages/codemirror/test/index.test.ts`, delete `'packageName',` from the `surface` array and delete the whole `it('exposes its package name', …)` case.

Run: `pnpm vitest run --project @stepcode/codemirror packages/codemirror/test/index.test.ts`
Expected: PASS (3 tests). Then `grep -rn packageName packages/editor/src packages/codemirror/src` prints nothing.

- [ ] **Step 6: Write the README**

Create `packages/editor/README.md`:

````markdown
# @stepcode/editor

The StepCode web editor: edit with full language support, run, pause, step, set breakpoints,
answer inputs, inspect variables, and read problems. Private; deployed to Cloudflare Workers.

## Run it

```
pnpm dev                                  # Vite dev server, workspace libraries from src/
pnpm --filter @stepcode/editor build      # production bundle in packages/editor/dist
pnpm vitest run --project @stepcode/editor
```

## How it is put together

- `src/runtime/` — the Web Worker owns execution. `driver.ts` is a state machine over the
  language package's `Run`: it time-slices `continue`, batches output, and posts typed
  messages (`protocol.ts`). `host.ts` (`RuntimeHost`) spawns the worker, relays messages, and
  stops by terminating and respawning, so an infinite loop never needs the worker's cooperation.
- `src/store/` — one vanilla Zustand store, the host's only subscriber and the only state React
  reads. Actions are guarded by the run state; the worker announces every transition.
- `src/panels/` — Editor (CodeMirror with `@stepcode/codemirror`'s language support and debug
  extensions), Console (output, inline input, wait and error lines), Variables (frames
  innermost first), Problems (lint diagnostics, click to reveal).
- `src/theme/tokens.css` — every color, once, as `--sc-*` variables: One Light on `:root`, One
  Dark under `[data-theme="dark"]`. Tailwind maps them in `index.css`; CodeMirror reads them in
  `src/editor/`.

## Keyboard

F5 run or continue · Shift+F5 stop · F6 pause · F10 step over · F11 step into · Shift+F11 step out.
````

- [ ] **Step 7: Whole-repo gate, commit**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm build && pnpm test`
Expected: exit 0; the editor build emits the worker chunk; every project green.

```bash
git add packages/editor/src/App.tsx packages/editor/src/main.tsx packages/editor/test/App.test.tsx packages/editor/README.md packages/codemirror/src/index.ts packages/codemirror/test/index.test.ts
git commit -m "feat(editor): app shell with the four panels; drop packageName from the codemirror barrel"
```

### Task 13: Cloudflare Workers deployment

**Files:**
- Create: `packages/editor/wrangler.jsonc`
- Modify: `packages/editor/package.json` (add `wrangler` to `devDependencies`)
- Modify: `pnpm-lock.yaml` (by `pnpm install`)
- Modify: `.github/workflows/ci.yml` (one step)
- Modify: `packages/editor/README.md` (append a Deployment section)
- Test: `packages/editor/test/deploy.test.ts`

**Interfaces:**
- Consumes: the production build from Task 12.
- Produces: the assets-only Worker configuration Workers Builds deploys (spec §9).

- [ ] **Step 1: Write the failing deployment test**

Create `packages/editor/test/deploy.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new NodeURL(relative, import.meta.url)), 'utf8')

describe('wrangler.jsonc', () => {
  const config = JSON.parse(read('../wrangler.jsonc')) as Record<string, unknown>

  it('describes an assets-only Worker with SPA fallback and preview URLs', () => {
    expect(config.name).toBe('stepcode-editor')
    expect(config.main).toBeUndefined()
    expect(config.assets).toEqual({ directory: './dist', not_found_handling: 'single-page-application' })
    expect(config.preview_urls).toBe(true)
    expect(config.workers_dev).toBe(true)
    expect(String(config.compatibility_date)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('pins wrangler so Workers Builds uses the same version', () => {
    const pkg = JSON.parse(read('../package.json')) as { devDependencies: Record<string, string> }
    expect(pkg.devDependencies.wrangler).toMatch(/^\d+\.\d+\.\d+$/)
  })
})

describe('ci.yml', () => {
  it('dry-runs the deploy after the build', () => {
    const ci = read('../../../.github/workflows/ci.yml')
    const build = ci.indexOf('run: pnpm build')
    const dryRun = ci.indexOf('wrangler deploy --dry-run')
    expect(build).toBeGreaterThan(-1)
    expect(dryRun).toBeGreaterThan(build)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/deploy.test.ts`
Expected: FAIL — `ENOENT … wrangler.jsonc`.

- [ ] **Step 3: Add wrangler and the configuration**

Run: `pnpm --filter @stepcode/editor add -D -E wrangler@4.129.0`
Expected: `packages/editor/package.json` gains `"wrangler": "4.129.0"` (exact) and the lockfile updates; exit 0. If `minimumReleaseAge` refuses this version, take the newest it accepts, exact-pinned, and record it.

Create `packages/editor/wrangler.jsonc` (plain JSON, valid JSONC, so the test can parse it):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "stepcode-editor",
  "compatibility_date": "2026-09-05",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "preview_urls": true,
  "workers_dev": true
}
```

- [ ] **Step 4: Add the CI dry run**

In `.github/workflows/ci.yml`, after the `- run: pnpm build` step, add:

```yaml
      - run: pnpm --filter @stepcode/editor exec wrangler deploy --dry-run --config wrangler.jsonc
```

- [ ] **Step 5: Run it to verify it passes, and dry-run locally**

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/deploy.test.ts`
Expected: PASS (3 tests).

Run: `pnpm --filter @stepcode/editor build && pnpm --filter @stepcode/editor exec wrangler deploy --dry-run --config wrangler.jsonc`
Expected: wrangler prints the asset upload summary and `--dry-run: exiting now.`; exit 0; nothing is uploaded. Wrangler needs no login for a dry run; if it asks for one, pass `CLOUDFLARE_API_TOKEN=` empty in the environment and retry, and report it.

- [ ] **Step 6: Document the dashboard settings**

Append to `packages/editor/README.md`:

```markdown

## Deployment

`wrangler.jsonc` describes an assets-only Worker named `stepcode-editor`: `dist/` is served with
single-page-application fallback, preview URLs are on, no custom domain yet. Workers Builds
(git integration) builds and deploys it; the settings are entered once in the Cloudflare
dashboard (Workers & Pages → Create → connect `RolandoAndrade/stepcode`):

| Setting | Value |
|---|---|
| Root directory | `/` |
| Build command | `pnpm install --frozen-lockfile && pnpm --filter @stepcode/editor... build` |
| Deploy command | `npx wrangler deploy --config packages/editor/wrangler.jsonc` |
| Non-production branch deploy command | `npx wrangler versions upload --config packages/editor/wrangler.jsonc` |
| Production branch | `RolandoAndrade/v2` until the 2.0.0 release, then `master` |
| Non-production branch builds | enabled |

The build filter `@stepcode/editor...` builds the workspace libraries first: the production
bundle resolves them through their `default` export (`dist`), not the `development` condition
the dev server uses. CI runs `wrangler deploy --dry-run` after every build so a broken
configuration fails before Cloudflare sees it.
```

- [ ] **Step 7: Whole-repo gate, commit**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm build && pnpm test`
Expected: exit 0.

```bash
git add packages/editor/wrangler.jsonc packages/editor/package.json pnpm-lock.yaml .github/workflows/ci.yml packages/editor/README.md packages/editor/test/deploy.test.ts
git commit -m "ci(editor): assets-only Worker config, wrangler dry run, Workers Builds settings"
```

## Deviations recorded during planning, continued

8. **`setBreakpoints` before a run is a no-op.** Spec §4 says the driver stores breakpoints for the next `start`, but every `start` carries the full set (spec §5, §6) and the later list must win; the driver forwards `setBreakpoints` only to a live `Run` (Task 2).
9. **Contrast thresholds.** Canonical One Light syntax colors sit between 3.0:1 and 4.7:1 on `#fafafa`; the test asserts 4.5:1 for `fg` and 3:1 for `syn-*`, `error`, `warning`, `success`, `accent`, with `fg-muted` and `syn-comment` exempt (Task 5). The palette stays canonical, as the spec chose.

## Deviations from the plan, decided while executing

The executor appends here: `N. **Title.** What the plan said, what was done instead, why, and what it costs if wrong.`

## Strings

Every UI string lives in `packages/editor/src/strings.ts` (Task 1) and is reached through
`stringsOf(state)` from the store. Diagnostics arrive formatted from the language package.
Adding a locale is one more table and one more entry in `tables`.
