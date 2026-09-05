# StepCode v2 — Editor distribution (sub-project 4c) design

Date: 2026-09-05. Branch `RolandoAndrade/v2`. Umbrella: `2026-09-03-stepcode-v2-design.md` §4.4,
§4.5, §6. Predecessor: `2026-09-05-editor-shell-design.md` (4b), whose §1.1 lists this scope.

## 1. Goal and scope

Make a StepCode program reachable and runnable from outside the editor:

1. **Programs by URL** on both entries: `#code=` (shipped in 4b), `?example=<id>`, `?src=<url>`
   limited to GitHub and Gists, plus query flags.
2. **The `/embed` route**: a compact, iframe-friendly editor configured by URL, with a
   `postMessage` protocol for host pages.
3. **The Insertar tab** in the Compartir dialog: a snippet generator with a live preview.
4. **The Playwright pass** deferred by 4b: desktop drag/float/popout, phone gestures, URL
   loading, embed.

The primary embedders are Canvas LMS course pages (teachers paste an `<iframe>` into the Rich
Content Editor, the frame has whatever fixed height they typed, and nothing on the host page
talks to the frame) and the academy site (which may drive the frame through `postMessage`).
Anyone else is welcome; the protocol is public and forgiving.

Non-goals: a web component package, auto-height messages (Canvas cannot use them), profile
JSON by URL, persistence inside the embed, an embed docs page beyond the README section.

## 2. URL contract

### 2.1 Program sources

Resolved in this order; the first that yields a program wins and the rest are ignored:

1. `#code=<base64url(deflate-raw)>&profile=<id>&name=<name>` — 4b's share hash. `name=` is new:
   the encoder always writes it (URL-encoded document name, extension included), the decoder
   returns it when present, old links without it still decode. On `/` the loaded document keeps
   that name instead of `compartido.stepcode`.
2. `?example=<topic/slug>` — a bundled example (`src/examples`), transposed to the active
   profile with `src/profiles/transpose.ts`. Unknown id: failure.
3. `?src=<url>` — a text file fetched from an accepted host (§2.2).

A failed source falls through to the next one. When every present source fails the entry keeps
whatever it had (the stored document on `/`, an empty editor on `/embed`) and reports the reason:
a toast on `/`, a console line on `/embed` (§3.5). Loading happens in the boot sequence, after
persistence is restored and before the first render, where `applyShareFromLocation` runs today;
a loaded `?example=`/`?src=` program goes through the same dirty-document prompt as a share hash.

On `/` the hash is removed after loading, as today; the query string is left alone on both
entries so a reload of an embed shows the same program.

### 2.2 `src` hosts

`src/share/src.ts` exports `acceptedSrc(url: string): URL | null`: it returns the URL to fetch,
rewriting the browsing forms to raw ones, or `null` when the host is not accepted. Only `https:`.

| Pasted | Fetched |
|---|---|
| `https://github.com/<user>/<repo>/blob/<ref>/<path>` | `https://raw.githubusercontent.com/<user>/<repo>/<ref>/<path>` |
| `https://gist.github.com/<user>/<id>` (optional `#file-…`) | `https://gist.githubusercontent.com/<user>/<id>/raw` |
| `https://raw.githubusercontent.com/…`, `https://gist.githubusercontent.com/…` | unchanged |
| anything else | `null` |

`fetchSrc(url, fetchImpl = fetch): Promise<string>` requests with `Accept: text/plain`, refuses
a non-2xx status, a `Content-Type` that is not `text/*` (or absent), and a body over 5 MB (the
share decoder's cap), and returns the text. Errors carry a `SrcError` with a `reason` in
`'refused' | 'status' | 'type' | 'size' | 'network'`, mapped to strings.

### 2.3 Flags

`src/share/urlOptions.ts` exports `readUrlOptions(url: URL): UrlOptions`, pure and shared by
both entries:

```ts
interface UrlOptions {
  readonly example: string | null
  readonly src: string | null
  readonly profile: string | null      // builtin id only ('es' | 'en' | 'pseint'); others → null
  readonly title: string | null
  readonly autorun: boolean
  readonly readonly: boolean
  readonly showProfile: boolean
  readonly debug: boolean
  readonly theme: 'light' | 'dark' | 'system'   // default 'system'
  readonly lang: 'es' | 'en' | null              // null = derive from the profile as today
}
```

A boolean flag is true when the parameter is present with no value, `1` or `true`; anything
else is false. Invalid values fall back to the default silently.

| Flag | `/` | `/embed` |
|---|---|---|
| `profile` | switches the active profile for this session; not persisted | same |
| `autorun` | runs after load (input requests wait as usual) | same |
| `lang` | UI locale for the session; not persisted | same |
| `title` | ignored | the top-bar title (§3.2) |
| `readonly`, `showProfile`, `debug`, `theme` | ignored | §3 |

A `#code=…&profile=` beats `?profile=`. On `/` the `?profile=` switch happens before the program
loads so transposition uses it.

## 3. The embed

### 3.1 Entry

A second Vite page, `packages/editor/embed.html` → `src/embed/main.tsx`. Cloudflare Workers
assets serve it at `/embed` (the same `html_handling` that serves `popout.html` at `/popout`);
`/embed.html` redirects to `/embed`, which is fine. `deploy.test.ts` asserts the built `dist`
contains `embed.html` and that `index.html` does not reference the embed chunk.

Boot (`src/embed/main.tsx`): `createEditorStore(new RuntimeHost(), { applyTheme, initialTheme })`,
theme from the `theme` flag with `watchSystemTheme` for `system`; `readUrlOptions`; apply
`profile` and `lang`; load the program (§2.1); render `<EmbedApp options>`; then create the
bridge (§4) and post `ready`. No `localStorage`, no IndexedDB, no service worker, no
`UpdateToast`, no `DialogHost`, no dockview, no `installShortcuts` (§3.4 has its own).
`Toaster` is not mounted; every message goes to the console panel.

Embed options live in a small vanilla Zustand store `src/embed/options.ts`
(`readonly`, `showProfile`, `debug`, `title`) created from `UrlOptions`, separate from the editor
store so the persisted state schema does not change.

### 3.2 Layout

One column filling the frame (`html, body, #root { height: 100% }`), any height:

| Band | Content |
|---|---|
| Top bar, 36 px | left: the title (§3.3), truncated with an ellipsis; a lock icon with tooltip "Solo lectura" when `readonly`. Centre-left: the run cluster, `RunControls` with `compact={false}` when `debug`, and a restricted set otherwise: Ejecutar/Detener only (a new `RunControls` prop `debug: boolean`, default true, drops the Depurar and step slots). Right: the profile name (only with `showProfile`), the problems count from the status-bar item (click reveals the first problem), and an "Abrir en StepCode" icon button (external-link icon) that opens `/#code=…&profile=…&name=…` in a new tab, encoded on click. |
| Editor | flexible, `min-height: 120px`; the 4a `Editor` panel with line numbers, lint gutter and the same theme; `readonly` adds `EditorState.readOnly.of(true)` and `EditorView.editable.of(false)` through a new `readOnly` prop |
| Console | 35 % of the frame height, `min-height: 96px`; the 4b `Console` panel, header actions kept (Limpiar); below 240 px of frame height the console shows only its last line and the input row |
| Variables | only with `debug`: the 4a `Variables` panel to the right of the console, 40 % of the width |

No status bar, menu, file actions, settings, sidebar or auto-expand: the console is always
visible. Below 480 px width the top bar hides the profile name and the problems count keeps its
number only.

### 3.3 Title

In order: `title=`, the share hash `name=` (extension stripped with `displayName`), the example's
title for `?example=`, the file name for `?src=` (last path segment, extension stripped), else no
title and the bar starts with the run cluster. The document title (`<title>`) is the same text or
"StepCode".

### 3.4 Shortcuts and behaviour

F5 run/continue, Shift+F5 stop; F10, F11, Shift+F11 only with `debug`. `readonly` protects the
source only: input requests still accept typing. `autorun` calls `run()` once after `ready`;
with errors it does nothing (the problems count shows them). Runtime errors and finished runs
render in the console as in 4b.

### 3.5 Error paths

A refused or failed `src`, an unknown example, or an undecodable hash writes one muted console
line ("No se pudo cargar el programa: <reason>") and leaves the editor empty. A profile id that
does not exist falls back to `es` with the same kind of line. The frame never renders blank: the
boot's catch renders the embed with a fresh store, as `main.tsx` does.

## 4. postMessage protocol

`src/embed/bridge.ts`: `createBridge(store, options, io: BridgeIo): () => void` where
`BridgeIo = { post(message: Outbound): void; listen(handler: (data: unknown) => void): () => void }`.
`main.tsx` wires `post` to `window.parent.postMessage(message, '*')` when
`window.parent !== window` (otherwise a no-op) and `listen` to `window` `message` events from any
origin. The module has no React dependency and no DOM access beyond `BridgeIo`.

Messages are plain objects `{ type, id?, ...payload }`. Every reply echoes the `id` when present.
Inbound data that is not an object with a string `type` is ignored; a known type with bad
payload or a disallowed state replies `{ type: 'error', id, message }` and never throws.

Inbound:

| Type | Effect | Reply |
|---|---|---|
| `setSource {source: string}` | `setSource` (also when `readonly`: the host owns the frame) | `source` |
| `getSource` | none | `source {source}` |
| `run`, `debug`, `stepOver`, `stepInto`, `stepOut`, `continue`, `pause`, `stop` | the store action (`debug` = `stepInto` from ready/done/error); refused with `error` when `slotsFor(state)` does not offer it | `state` |
| `input {value: string}` | `submitInput`; `error` when nothing is pending | `state` |
| `setProfile {id: string}` or `{profile: ProfileInput}` | `setProfile` for a builtin; a profile object is validated by `@stepcode/profiles`' schema, installed with `saveCustomProfile` and selected; invalid → `error` | `profile {id}` |
| `setTheme {theme: 'light' \| 'dark' \| 'system'}` | `setThemePreference` | `options {theme}` |

Outbound (all posted with `'*'`):

| Type | When | Payload |
|---|---|---|
| `ready` | after the first render and the URL program load | `{protocol: 1, version}` |
| `source` | on edits, debounced 300 ms; immediately as a reply | `{source}` |
| `diagnostics` | when `store.diagnostics` changes | `{items: {severity, code, message, line, column}[]}` |
| `state` | on every `state` change | `{state, line: number \| null}` |
| `paused` | on entering `paused` | `{line, variables: {name, type, value}[]}` from `frames` through `panels/values.ts` |
| `inputRequest` | when `pendingInput` appears | `{prompt}` |
| `output` | per appended console line | `{text}` |
| `done` | on `done`, `error`, or a stop from a running state | `{state: 'done' \| 'error' \| 'stopped'}` |
| `error` | on `store.error` | `{message, line: number \| null}` |

Subscriptions use `store.subscribe` with selectors; the disposer unsubscribes everything and
stops the listener. A test asserts every outbound payload survives `structuredClone`.

## 5. Compartir: Enlace and Insertar

The Share dialog gets Radix tabs: **Enlace** (today's content, plus `name=` in the hash) and
**Insertar**.

Insertar:

- Checkboxes: Solo lectura, Ejecutar al abrir, Depuración, Mostrar perfil. Select Tema: Sistema,
  Claro, Oscuro. Number field Alto (px), default 480, min 200. Width is always `100%`.
- Live preview: an `<iframe>` with `src` = the embed URL of the current code and options, height
  as chosen (capped at 360 in the dialog, the snippet keeps the real value), `title` "Vista previa".
  Rebuilt when the hash or an option changes, debounced like the link.
- The snippet in a read-only textarea with Copiar código, and Copiar URL for hosts that take a URL:

  ```html
  <iframe src="https://…/embed?readonly&autorun#code=…&profile=es&name=…" width="100%" height="480" style="border:0" loading="lazy" title="<name>"></iframe>
  ```

- The same 8 000-character warning as the link.

`src/share/embed.ts`: `embedUrl(hash: string, options: EmbedOptions, base?: string): string` and
`embedSnippet(url, height, title): string`, pure and reused by the preview and the textarea.
Flags are written only when they differ from the defaults; `title` is not written (the hash
carries `name=`).

## 6. Playwright

`packages/editor/e2e/` with `@playwright/test`, `playwright.config.ts`: Chromium only,
`webServer: vite preview --port 4173` on the built `dist`, `baseURL http://localhost:4173`,
two projects: `desktop` (1280 × 800) and `phone` (`devices['Pixel 7']`, touch). Traces on first
retry, one retry in CI. Script `pnpm --filter @stepcode/editor e2e`; the root `pnpm e2e` filters
to it. A separate `e2e` job in `ci.yml` after install: `pnpm build`, `npx playwright install
--with-deps chromium`, `pnpm e2e`, upload `playwright-report` on failure.

Specs (`*.spec.ts`), each starting from a clean `localStorage`:

- `desktop.spec.ts`: type a program, F5, read the console; drag the Consola icon to the
  right-top zone and assert the icon sits in the right strip's top cluster; collapse and expand
  the bottom group, wait for `sc-animating` to clear, assert the content is visible and sized;
  float Problemas from its header action and close the float; pop out Consola and assert the
  popout window renders the panel; reset layout from the Vista menu.
- `mobile.spec.ts`: sheet drag collapsed → half → full, tabs switch, the symbol bar inserts `←`,
  run auto-expands the sheet.
- `url.spec.ts`: `?example=`, `?src=` against `page.route` mocks for a GitHub blob URL and a
  Gist, a refused host shows the toast, `?profile=en` transposes the example, `#code=` beats
  `?example=`.
- `embed.spec.ts`: title from each source, `readonly` blocks typing and shows the lock,
  `autorun` prints output, `debug` shows Variables and the step buttons, `showProfile`, `theme`,
  frame heights 200/480/800 with no page scroll; a host fixture page (`e2e/fixtures/host.html`,
  served through a Playwright `page.route` so nothing lands in `public/`) that sends
  `setSource`, `run`, `input` and awaits `done` and the collected `output`.

## 7. Unit tests (Vitest)

`readUrlOptions` (every flag, bad values); `acceptedSrc` (table §2.2 plus http, other hosts,
malformed); `fetchSrc` with a fake fetch (status, type, size, network); the loader order with
fakes (`src/share/load.ts`: `loadProgramFromUrl(store, url, deps)`); `embedUrl`/`embedSnippet`;
the bridge with a fake `BridgeIo` (every inbound type, ids, refusals, every outbound event,
`structuredClone`); `EmbedApp` rendering per option; `RunControls` `debug={false}`; `Editor`
`readOnly`; Share tabs and the snippet; `deploy.test.ts` for `embed.html`; the tokens-only and
contrast scans extended to `src/embed`; strings parity for the new keys.

## 8. Strings

New keys in `es`/`en`: `embed.{readOnly, openInStepCode, loadFailed(reason), title}`,
`share.{tabs.link, tabs.embed, readOnly, autorun, debug, showProfile, theme, height, copyCode,
copyUrl, preview, codeCopied}`, `src.{refused, status, type, size, network}`, and
`toolbar.debug` stays for the cluster.

## 9. Package changes

- `embed.html`, `src/embed/{main.tsx, EmbedApp.tsx, TopBar.tsx, options.ts, bridge.ts}`.
- `src/share/{urlOptions.ts, src.ts, load.ts, embed.ts}`; `link.ts` gains `name`.
- `vite.config.ts`: `build.rollupOptions.input` with `index.html` and `embed.html`; the PWA
  plugin's `navigateFallbackDenylist` gets `/^\/embed/` so the service worker never serves the
  app shell for the embed; `workbox.globPatterns` unchanged.
- `e2e/`, `playwright.config.ts`, devDependency `@playwright/test`, scripts `e2e`.
- `.github/workflows/ci.yml`: the `e2e` job.
- README: a "Programas por URL e inserción" section with the flags table and the protocol.

## 10. Decisions

- One URL contract for both entries, parsed by one pure function, so the docs have one table.
- `src` limited to GitHub and Gists (user's choice); the browsing URLs are rewritten so teachers
  can paste what they see.
- `profile=` takes builtin ids only; custom profiles arrive by `postMessage` (user's choice).
- The embed is its own entry, not a route of the SPA: a small bundle, no service worker in the
  host page, nothing to guard.
- The top bar shows the program's title, not the profile (user's choice); `showProfile` opts in.
- postMessage trimmed to source, run controls, input, profile and theme; flags and language are
  URL matters, diagnostics and variables are pushed (user's choice).
- Fixed console split in the embed; the teacher sizes the frame.
- The Playwright job builds in place; no artifact handoff.
- No height messages: Canvas frames are fixed-size.
