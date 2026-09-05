# Editor core (sub-project 4a): runtime host and panels

**Umbrella:** `2026-09-03-stepcode-v2-design.md` §4 (Editor), §3.2 (execution model), §3.5.
**Consumes:** `stepcode` (`compile`, `start`, `Run`, `StepResult`, `Frame`, `renderValue`,
`formatDiagnostic`, `LineMap`), `@stepcode/profiles` (`resolveProfile`, `builtinProfiles`,
`profiles`, `ProfileInput`), `@stepcode/codemirror` (`stepcode`, `debug`, `setCurrentLine`,
`breakpointLines`, `breakpointsChanged`, `setBreakpoints`, `stepcodeDiagnostics`).
**Followed by:** 4b (shell: dockview, menu, status bar, settings, files, examples, share,
persistence, PWA) and 4c (programs by URL, embed, narrow layout, Playwright).

## 1. Goal

`packages/editor` runs a StepCode program end to end against the real runtime: edit with full
language support, run, pause, step, set breakpoints, answer inputs, inspect variables, read
problems. The result is deployed to Cloudflare Workers from day one so every push has a
preview. No menu, no settings dialog, no persistence, no dockview, no embed.

Decomposition of umbrella item 4, agreed 2026-09-05:

| Sub-project | Scope |
|---|---|
| **4a (this spec)** | worker protocol, `RuntimeHost`, store, Editor/Console/Variables/Problems panels, toolbar run controls, theme tokens, Workers deployment |
| 4b | dockview layout with persistence and reset, menu, status bar, settings dialog (profiles, custom profile builder, editor, execution, appearance, layout), open/save, examples, share, UI language, PWA |
| 4c | `#code=` / `?example=` / `?src=` loading, `readonly` / `autorun` / `hideProfile` flags, `/embed` route with `postMessage`, narrow-viewport layout, Playwright smoke tests |

## 2. Package layout

```
packages/editor/
  index.html, vite.config.ts, tsconfig.json, package.json
  wrangler.jsonc                    assets-only Worker (§9)
  src/
    main.tsx                        mounts <App/>, applies the initial theme attribute
    App.tsx                         toolbar + fixed grid of the four panels
    strings.ts                      UI copy, es/en, stringsFor(locale) (same shape as codemirror)
    runtime/protocol.ts             message unions both sides share (§3)
    runtime/driver.ts               createDriver(port, options): the state machine over Run (§4)
    runtime/worker.ts               worker entry: createDriver(self)
    runtime/host.ts                 RuntimeHost (§5)
    store/store.ts                  Zustand store: document + runtime slices (§6)
    store/output.ts                 bounded output buffer
    editor/extensions.ts            the editor's extension set, compartments
    editor/highlight.ts             HighlightStyle over theme tokens
    editor/theme.ts                 EditorView.theme over theme tokens
    panels/Editor.tsx
    panels/Console.tsx
    panels/Variables.tsx
    panels/Problems.tsx
    components/Toolbar.tsx
    components/shortcuts.ts         key bindings → store actions
    theme/tokens.css                semantic CSS variables, light and dark (§8)
    theme/theme.ts                  resolveInitialTheme, applyTheme, contrast helpers
    index.css                       @import tailwindcss; @import ./theme/tokens.css; @theme inline
  test/                             see §10
```

New dependencies: `zustand` (^5), `wrangler` (dev, pinned so Workers Builds uses it),
`@vitest/web-worker` (dev, same major as the catalog's `vitest`), `@codemirror/commands`,
`@codemirror/lint`, `@codemirror/view`, `@codemirror/state`, `@codemirror/language`,
`@lezer/highlight` from the catalog, and the three workspace packages. No dockview, no PWA
plugin, no icon library: the toolbar uses inline SVG.

## 3. Protocol

`src/runtime/protocol.ts`. Every message is a discriminated union member and structured-clone
safe: `Diagnostic`, `Frame`, `FrameVariable`, `Type`, and `RuntimeValue` are plain data
already. A `ResolvedProfile` is not (it holds a normalizer function and sealed maps), so the
profile crosses as its `ProfileInput` and the worker resolves it.

```ts
export type HostMessage =
  | { kind: 'start'; source: string; profile: ProfileInput; breakpoints: readonly number[]; mode: 'run' | 'step' }
  | { kind: 'step' } | { kind: 'stepOver' } | { kind: 'stepOut' } | { kind: 'continue' }
  | { kind: 'pause' }
  | { kind: 'input'; text: string }
  | { kind: 'setBreakpoints'; lines: readonly number[] }

export type WorkerState = 'ready' | 'running' | 'paused' | 'input' | 'waiting' | 'done' | 'error'

export type WorkerMessage =
  | { kind: 'state'; state: WorkerState }
  | { kind: 'output'; chunks: readonly string[] }
  | { kind: 'clear' }
  | { kind: 'paused'; reason: 'step' | 'breakpoint' | 'pause'; line: number; frames: readonly Frame[] }
  | { kind: 'input'; line: number; target: { name: string; type: Type } | null; rejected?: Diagnostic }
  | { kind: 'wait'; line: number; millis: number }
  | { kind: 'done'; frames: readonly Frame[] }
  | { kind: 'error'; diagnostic: Diagnostic; frames: readonly Frame[] }
```

Rules:

- `state` is posted on every transition, before the message that describes it (`state:paused`
  then `paused`). The UI renders controls from `state` alone.
- `output` is batched: one message per flush (§4). `chunks` preserves write boundaries so the
  console can join them without inventing newlines.
- There is no `stop` message. Stop is `Worker.terminate()` (§5).
- `done` carries the final frames so Variables keeps showing them after the run.
- The `Diagnostic` in `error` and `input.rejected` is raw; the host formats it with
  `formatDiagnostic(diagnostic, locale, profile)` on the main thread.

## 4. Driver

`createDriver(port: DriverPort, options?: DriverOptions): Driver`

```ts
interface DriverPort { postMessage(message: WorkerMessage): void; onmessage: ((event: { data: HostMessage }) => void) | null }
interface DriverOptions {
  readonly budget?: number        // statements per Run.continue slice, default 5000
  readonly sliceMillis?: number   // wall-clock per run of slices before yielding, default 30
  readonly sleep?: (millis: number) => Promise<void>   // default setTimeout
  readonly now?: () => number     // default performance.now
  readonly yield?: () => Promise<void>   // default: MessageChannel post (no timer clamp)
}
```

The worker entry is `createDriver(self)`; tests pass a recording port.

State machine (the driver's `state` mirrors `WorkerState`):

- **`start`** (legal in `ready`, `done`, `error`): resolve the profile with
  `resolveProfile(profile, builtinProfiles)`, `compile(source, { profile })`. If any
  diagnostic has severity `error`, post `state:error` and `error { diagnostic: first error,
  frames: [] }` and stop. Otherwise create `start(result, { profile, io })` with `io.write`
  appending to the output buffer and `io.clear` flushing then posting `clear`. Then `mode:
  'step'` behaves as a `step` command; `mode: 'run'` behaves as `continue`.
- **`step` / `stepOver` / `stepOut`** (legal in `paused`; also the implicit first command of
  `start` in step mode): call the `Run` method, deliver the result (below).
- **`continue`** (legal in `paused`): enter the run loop.
- **Run loop:** post `state:running`; repeat `run.continue({ budget })`; on a `budget` pause,
  if the pause flag is set post `state:paused` and `paused { reason: 'pause', ... }` and leave
  the loop; else if `now() - sliceStart >= sliceMillis` flush output, `await yield()`, reset
  `sliceStart`, continue; any other result is delivered and the loop ends. The yield is where
  `pause` and `setBreakpoints` messages get processed.
- **Deliver a `StepResult`:** flush output first, then
  - `paused` with reason `step` or `breakpoint` → `state:paused`, `paused`.
  - `input` → `state:input`, `input { line, target, rejected }`. The driver remembers the
    interrupted command (`resume: 'run' | 'step' | 'stepOver' | 'stepOut'`).
  - `wait` → `state:waiting`, `wait`, `await sleep(millis)`, then resume: re-enter the run
    loop when `resume` is `'run'`, otherwise call the remembered `Run` method once and
    deliver its result.
  - `done` → `state:done`, `done { frames: run.inspect() }`.
  - `error` → `state:error`, `error`.
- **`input { text }`** (legal in `input`): `run.input(text)`, then resume exactly as after a
  `wait`. A rejected input surfaces as the next `StepResult` of kind `input` with `rejected`
  set, so the same path re-asks.
- **`pause`** (legal in `running`): sets the flag; observed at the next budget pause.
- **`setBreakpoints`** (legal always): forwards to `run.setBreakpoints` when a `Run` exists;
  without one it is ignored, because every `start` carries the full set.
- A command illegal in the current state is ignored. The driver never throws across the port.
- **Output buffer:** `write` appends; `flush` posts one `output { chunks }` when non-empty.
  Flush points: each yield, and before every posted `paused`, `input`, `wait`, `done`, `error`,
  `clear`.

## 5. RuntimeHost

`src/runtime/host.ts`, a plain class with no React.

```ts
class RuntimeHost {
  constructor(spawn: () => Worker = defaultSpawn)
  subscribe(listener: (message: WorkerMessage) => void): () => void
  start(source: string, profile: ProfileInput, breakpoints: readonly number[], mode: 'run' | 'step'): void
  step(): void; stepOver(): void; stepOut(): void; continue(): void; pause(): void
  input(text: string): void
  setBreakpoints(lines: readonly number[]): void
  stop(): void
  dispose(): void
}
```

- `defaultSpawn` is `() => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`,
  which Vite turns into a real chunk in production and `@vitest/web-worker` runs in tests.
- The worker is spawned lazily on the first `start` and kept across runs.
- `stop()` terminates the current worker, increments a generation counter, spawns a fresh one,
  and posts `state:ready` to listeners itself, since a terminated worker cannot. Messages from
  an older generation are discarded. Stop is the only interruption that does not depend on the
  worker cooperating, so it works on a program that never yields.
- `dispose()` terminates without respawning.
- Every command is posted as-is; the host does not track state. The store decides what the
  UI may send.

## 6. Store

One Zustand store (`create` with slices), no React inside.

**Document slice:** `source: string`, `profileId: 'es' | 'en' | 'pseint'`,
`diagnostics: readonly LintDiagnostic[]` (CodeMirror lint diagnostics from
`stepcodeDiagnostics`, messages already formatted), `breakpoints: readonly number[]`,
`theme: 'light' | 'dark'`; actions `setSource`, `setProfile`, `setDiagnostics`,
`setBreakpoints`, `setTheme`. Derived: `profile` (resolved builtin), `locale`
(`profile.locale` until 4b), `hasErrors`.

**Runtime slice:** `state: WorkerState`, `output: OutputBuffer` (§6.1), `currentLine: number
| null`, `frames: readonly Frame[]`, `pendingInput: { line, target, rejected?: string } |
null` (rejection pre-formatted), `wait: { line, millis } | null`, `error: { message: string;
line: number } | null`; actions `run`, `stepInto` (start in step mode, or `step` when paused),
`stepOver`, `stepOut`, `continue`, `pause`, `stop`, `submitInput`, `clearOutput`.

- The store owns the `RuntimeHost` and is its only subscriber. `start` snapshots `source`,
  the profile's input, and `breakpoints`.
- Actions are guarded by `state`: `run` and `stepInto` from `ready`/`done`/`error` when
  `!hasErrors`; `continue`/`stepOver`/`stepOut` (and `stepInto` as `step`) from `paused`;
  `pause` from `running`; `submitInput` from `input`; `stop` from anything but `ready`. A guard
  failure is a no-op.
- On `start`, `currentLine`, `frames`, `error`, `pendingInput`, `wait` reset and output is
  cleared. On `paused`/`input`/`wait`/`error` the line updates; on `done` it clears.
- `setBreakpoints` forwards to the host immediately, so breakpoints toggled during a run apply.
- Editing is allowed only in `ready`, `done`, `error` (§7.1).

### 6.1 Output buffer

An immutable-by-replacement structure `{ chunks: readonly string[]; dropped: number }` with a
cap of 10 000 chunks. Appending past the cap drops the oldest and increments `dropped`; the
console renders a "…N chunks dropped" marker at the top when `dropped > 0`.

## 7. Panels and chrome

### 7.1 Editor panel

One `EditorView` in a ref, created once. Extensions: `lineNumbers`, `history`,
`highlightActiveLine`, `drawSelection`, `keymap.of([...defaultKeymap, ...historyKeymap,
indentWithTab])`, `lintGutter`, the app highlight style and editor theme (§8), then three
compartments: language (`stepcode({ profile, locale })`), read-only
(`EditorState.readOnly` + `EditorView.editable`), and dark (`EditorView.darkTheme`). Plus
`debug()` from the codemirror package.

Listeners: `docChanged` → `setSource`; tree changed (a new `syntaxTree` identity) →
`setDiagnostics(stepcodeDiagnostics(state, options))`; `breakpointsChanged(update)` →
`setBreakpoints([...breakpointLines(state)])`. Store subscriptions: `currentLine` →
`setCurrentLine.of(line)`; `profileId` → reconfigure language; `state` → read-only when not
in `ready`/`done`/`error`; `theme` → dark compartment. The Problems panel selects through an
exposed `revealSpan(from, to)` that sets the selection, scrolls into view, and focuses.

Source flows editor → store only; the store never writes back into the document in 4a.

### 7.2 Console

Chunks joined verbatim into a `<pre>` that auto-scrolls to the bottom unless the user has
scrolled up. Elements by state:

- `input`: an inline form at the bottom with a label from strings: `Leer {name} ({type})` /
  `Read {name} ({type})`, or `Presiona una tecla` / `Press a key` when `target` is `null`.
  Submit on Enter; for the null target any key submits an empty string. A `rejected`
  message renders in the error color above the field and focus stays.
- `waiting`: a muted line `Esperando {millis} ms` / `Waiting {millis} ms`, removed on resume.
- `error`: the formatted diagnostic in the error color, prefixed with the line.
- Header with a Clear button (`clearOutput`).

### 7.3 Variables

`frames` innermost first; each frame is a section titled with its name and line, containing a
table: name, kind, type (rendered from the profile's type spellings, arrays as
`Arreglo de Entero` / `Array of Integer` with rank), value. Scalars use `renderValue(value,
type, profile)`; arrays render as `[a, b, c]`, nested per rank from `dims`, holes as `—`,
truncated after 100 elements with `… (+N)`. Unassigned scalars show `—`. In `ready` the panel
shows a muted `Sin programa en ejecución` / `No program running`.

### 7.4 Problems

Diagnostics sorted by position: severity glyph, `line:col`, message, code. Click →
`revealSpan`. Header shows counts. Empty state `Sin problemas` / `No problems`.

### 7.5 Toolbar

Left: title `StepCode`, a `<select>` of the three builtin profiles. Right: theme toggle (sun
and moon), then controls by `state`:

| state | controls |
|---|---|
| `ready`, `done`, `error` | Run (F5), Step (F11) — disabled while `hasErrors` |
| `running` | Pause (F6), Stop (Shift+F5) |
| `paused` | Continue (F5), Step Over (F10), Step Into (F11), Step Out (Shift+F11), Stop |
| `input`, `waiting` | Stop |

Shortcuts are window-level `keydown` handlers that call store actions and `preventDefault`
only when the action is legal. A diagnostic badge shows error and warning counts.

### 7.6 Layout

`App.tsx` is a CSS grid: toolbar row, then a body with the editor spanning two thirds on the
left, Variables above Problems on the right third, and the console across the bottom third.
Each panel is a component that takes no layout props, so dockview wraps them unchanged in 4b.

## 8. Theme

### 8.1 Tokens

`src/theme/tokens.css` defines every color as a semantic variable. `:root` holds One Light,
`:root[data-theme="dark"]` holds One Dark. Both blocks define the full set; no color exists
anywhere else in the app.

| Token | One Light | One Dark |
|---|---|---|
| `--sc-bg` | `#fafafa` | `#282c34` |
| `--sc-surface` | `#ffffff` | `#21252b` |
| `--sc-surface-raised` | `#f0f0f1` | `#2c313a` |
| `--sc-border` | `#dbdbdc` | `#181a1f` |
| `--sc-fg` | `#383a42` | `#abb2bf` |
| `--sc-fg-muted` | `#a0a1a7` | `#5c6370` |
| `--sc-accent` | `#4078f2` | `#61afef` |
| `--sc-caret` | `#526fff` | `#528bff` |
| `--sc-selection` | `#e5e5e6` | `#3e4451` |
| `--sc-line` | `rgba(56,58,66,0.05)` | `rgba(153,187,255,0.04)` |
| `--sc-error` | `#e45649` | `#e06c75` |
| `--sc-warning` | `#c18401` | `#e5c07b` |
| `--sc-success` | `#50a14f` | `#98c379` |
| `--sc-breakpoint` | `#e45649` | `#e06c75` |
| `--sc-current-line` | `rgba(193,132,1,0.18)` | `rgba(229,192,123,0.18)` |
| `--sc-syn-keyword` | `#a626a4` | `#c678dd` |
| `--sc-syn-string` | `#50a14f` | `#98c379` |
| `--sc-syn-number` | `#986801` | `#d19a66` |
| `--sc-syn-comment` | `#a0a1a7` | `#5c6370` |
| `--sc-syn-type` | `#c18401` | `#e5c07b` |
| `--sc-syn-builtin` | `#4078f2` | `#61afef` |
| `--sc-syn-operator` | `#0184bc` | `#56b6c2` |
| `--sc-syn-variable` | `#e45649` | `#e06c75` |
| `--sc-syn-definition` | `#4078f2` | `#61afef` |

These are the canonical Atom One Light / One Dark values. v1's deviations (red caret, white
identifiers, a light theme without its blue family) are dropped on purpose.

### 8.2 Wiring

- `index.css`: `@import "tailwindcss"; @import "./theme/tokens.css";` and a `@theme inline`
  block mapping `--color-bg: var(--sc-bg)` and so on, so chrome uses `bg-bg`, `bg-surface`,
  `text-fg`, `text-muted`, `border-border`, `text-error`, never a hex.
- `editor/theme.ts`: `EditorView.theme({...})` referencing `var(--sc-*)` for background,
  gutters, caret, selection, active line, the codemirror package's breakpoint and current-line
  classes, and lint marks. Provided once; it does not take `{ dark }` because the dark
  compartment carries `EditorView.darkTheme`.
- `editor/highlight.ts`: `HighlightStyle.define` over the tags the codemirror package emits
  (§5.1 of its spec), each `color: 'var(--sc-syn-…)'`; comments italic, keywords bold.
- `theme/theme.ts`: `resolveInitialTheme()` = `prefers-color-scheme`; `applyTheme(theme)`
  sets `document.documentElement.dataset.theme` (removed for light) and `color-scheme`.
  `main.tsx` applies it before rendering to avoid a flash. The store's `setTheme` calls
  `applyTheme`. Persistence comes in 4b.
- Fonts: chrome `font-sans` (system stack); editor and console
  `ui-monospace, "Cascadia Code", "Fira Code", Menlo, Consolas, monospace`. No web fonts.

### 8.3 Contrast

`theme/theme.ts` exports `contrastRatio(fg, bg)` (WCAG 2 relative luminance, hex only). A test
parses `tokens.css` and asserts, for both themes, that `fg` reaches 4.5:1 on `bg`, that every
`syn-*` token reaches 3:1 on `bg`, and that `error`, `warning`, `success`, and `accent` reach
3:1 on `surface`. The canonical One Light syntax colors sit between 3.06:1 and 4.7:1 on
`#fafafa`, so 3:1 (the WCAG large-text and UI-component floor) is the bar for syntax; the
palette stays canonical rather than being darkened. `fg-muted` and `syn-comment` are exempt:
One Light's comment gray is 2.9:1 by design.

## 9. Deployment

`packages/editor/wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "stepcode-editor",
  "compatibility_date": "2026-09-05",
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" },
  "preview_urls": true,
  "workers_dev": true
}
```

No `main`: assets only. No custom domain in 4a.

Workers Builds, configured once in the Cloudflare dashboard by the user (Workers & Pages →
Create → connect `RolandoAndrade/stepcode`):

| Setting | Value |
|---|---|
| Root directory | `/` |
| Build command | `pnpm install --frozen-lockfile && pnpm --filter @stepcode/editor... build` |
| Deploy command | `npx wrangler deploy --config packages/editor/wrangler.jsonc` |
| Non-production branch deploy command | `npx wrangler versions upload --config packages/editor/wrangler.jsonc` |
| Production branch | `RolandoAndrade/v2` until the 2.0.0 release, then `master` |
| Non-production branch builds | enabled |

The build filter `@stepcode/editor...` builds the workspace libraries first because the
production bundle resolves them through their `default` export (`dist`), not the
`development` condition. `pnpm build` at the editor stays `vite build`.

CI (`ci.yml`) adds, after `pnpm build`:
`pnpm --filter @stepcode/editor exec wrangler deploy --dry-run --config wrangler.jsonc`.

## 10. Testing

Vitest, `happy-dom` opted in per file, `test/setup.ts` with Testing Library cleanup. Shared
`test/helpers.ts`: a `recordingPort()` for the driver, `programs` loading corpus fixtures from
`packages/language/test/corpus` the way the codemirror package does, and `renderWithStore`.

| File | Covers |
|---|---|
| `driver.test.ts` | every §4 transition against the real `Run`: start refuses errors; run posts no budget pauses; pause lands between slices; output flushes once per slice and before each result; breakpoints set mid-run stop the loop; input parks a step-mode run in step mode and a run-mode run in run mode; rejected input re-asks; wait resumes; done carries frames; illegal commands ignored; `clear` |
| `host.test.ts` (happy-dom, `@vitest/web-worker`) | spawn on first start, relay, stop terminates and respawns, late messages from an old generation dropped, corpus programs end to end including one with inputs |
| `store.test.ts` | guards per state, resets on start, line tracking, frames kept after done, error formatting, output cap and `dropped`, theme action |
| `output.test.ts` | buffer append, cap, drop count |
| `Toolbar.test.tsx` | controls per state, Run disabled with errors, badge counts, shortcuts dispatch and only when legal |
| `Console.test.tsx` | join without inventing newlines, input prompt label with name and type, key prompt, rejection message and focus retention, wait line, error line, clear, dropped marker |
| `Variables.test.tsx` | innermost first, scalar rendering via `renderValue`, arrays per rank, holes, truncation, unassigned, empty state |
| `Problems.test.tsx` | sorted rows, counts, click reveals the span in a real `EditorView` |
| `Editor.test.tsx` (happy-dom) | diagnostics pushed on tree change, breakpoints reach the store, `currentLine` reaches the view, profile compartment switch, read-only per state |
| `theme.test.ts` | both blocks define every token, contrast thresholds, `applyTheme` attribute and `color-scheme`, highlight style and editor theme reference only `var(--sc-` |
| `App.test.tsx` | renders the toolbar and four panels |

Not in 4a: Playwright, browser mode, worker tests in a real browser.

## 11. Strings

`src/strings.ts` mirrors the codemirror package: a `Strings` interface, `es` and `en` tables,
`stringsFor(locale)` falling back to `es`. Keys: toolbar labels and tooltips, console prompts,
Variables and Problems headers and empty states, the dropped-output marker, wait line.
Technical artifacts stay in English; UI copy is the user's locale.

## 12. Decisions

- Worker-owned driver over `Run` (option A of the brainstorm); the main thread never paces
  execution.
- Stop is terminate and respawn, not a message: it must work on a program that never yields.
- `start` folds loading in; there is no loaded-but-not-started state.
- Output is batched per flush point and capped at 10 000 chunks in the store.
- Time-sliced yielding with a `MessageChannel` post, not `setTimeout(0)`, to avoid the nested
  timer clamp.
- The editor is read-only while a program is live, because the marker and frames describe
  the running snapshot.
- Themes are One Light and One Dark, expressed once as semantic tokens shared by Tailwind and
  CodeMirror; the initial theme follows the system, a toolbar toggle overrides it.
- Workers Builds with git integration deploys previews; the production branch is the v2
  branch until release.
- `packageName` leaves the codemirror barrel when `App.tsx` stops importing it (this
  sub-project).
