# @stepcode/editor

The StepCode web editor: edit with full language support, run, pause, step, set breakpoints,
answer inputs, inspect variables, and read problems. Private; deployed to Cloudflare Workers.

## Run it

```
pnpm dev                                  # Vite dev server, workspace libraries from src/
pnpm --filter @stepcode/editor build      # production bundle in packages/editor/dist
pnpm vitest run --project @stepcode/editor
```

## Programs by URL and embedding

Both entries — the editor at `/` and the embed at `/embed` — read the same URL contract. The
program comes from the first of these that yields one, and a failure falls through to the next:

1. `#code=<base64url(deflate-raw)>&profile=<id>&name=<name>` — a share link, made by Compartir.
2. `?example=<topic>/<slug>` — a bundled example, transposed to the active profile.
3. `?src=<url>` — a text file from GitHub or a Gist.

`?src=` accepts `https://github.com/<user>/<repo>/blob/<ref>/<path>`,
`https://gist.github.com/<user>/<id>`, and the two raw hosts
(`raw.githubusercontent.com`, `gist.githubusercontent.com`); a browsing URL is rewritten to its
raw form, so you can paste what you are looking at. Anything else is refused. The file must be
text and under 5 MB.

### Flags

| Flag | Values | `/` | `/embed` |
|---|---|---|---|
| `profile` | `es`, `en`, `pseint` | switches the profile for the session, unless the reader then changes a setting, which also saves the session's profile and language | same |
| `lang` | `es`, `en` | UI language for the session, unless the reader then changes a setting, which also saves the session's profile and language | same |
| `autorun` | flag | runs the program after it loads | same |
| `title` | text | ignored | the top-bar title |
| `readonly` | flag | ignored | locks the source (input still accepts typing) |
| `showProfile` | flag | ignored | shows the profile name |
| `debug` | flag | ignored | adds Variables and the stepping buttons |
| `theme` | `light`, `dark`, `system` | ignored | the frame's theme (default `system`) |

A flag is on when it is present with no value, `1`, or `true`; anything else is off. A `#code=`
hash carries its own profile and beats `?profile=`.

### Embedding

Compartir → Insertar builds the snippet for you, with a live preview:

```html
<iframe src="https://stepcode.example/embed?readonly&autorun#code=…&profile=es&name=tarea.stepcode"
        width="100%" height="480" style="border:0" loading="lazy" title="tarea"></iframe>
```

Width is always `100%`; you choose the height. The frame stores nothing — no `localStorage`, no
service worker — and it never resizes itself, so give it the height your page needs.

### Talking to the frame

The frame posts to `window.parent` with `'*'` and listens for messages from any origin. Every
message is a plain object with a `type`; add an `id` and the reply echoes it. A `type` the frame
does not know is ignored without a reply, on purpose: the frame's window also receives traffic
that has nothing to do with StepCode, and answering it would be noise.

Send:

| Type | Payload | Reply |
|---|---|---|
| `setSource` | `{ source }` | `source` |
| `getSource` | — | `source { source }` |
| `run`, `debug`, `continue`, `stepOver`, `stepInto`, `stepOut`, `pause`, `stop` | — | `state`, or `error` when the current state does not offer it |
| `input` | `{ value }` | `state`, or `error` when nothing is pending |
| `setProfile` | `{ profileId }` or `{ profile }` | `profile { profileId }` |
| `setTheme` | `{ theme }` | `options { theme }` |

Receive:

| Type | When | Payload |
|---|---|---|
| `ready` | once, after the program loads | `{ protocol: 1, version }` |
| `source` | on edits, debounced 300 ms | `{ source }` |
| `diagnostics` | when the problems change | `{ items: [{ severity, code, message, line, column }] }` |
| `state` | on every run-state change | `{ state, line }` |
| `paused` | on entering `paused` | `{ line, variables: [{ name, type, value }] }` |
| `inputRequest` | when the program asks for input | `{ prompt }` |
| `output` | per console line | `{ text }` |
| `done` | when a run ends | `{ state: 'done' \| 'error' \| 'stopped' }` |
| `error` | on a runtime error | `{ message, line }` |

```js
const frame = document.querySelector('iframe')
addEventListener('message', (event) => {
  // Any page — an ad, another frame, an extension — can post here, so check the sender before
  // trusting `ready` or a reply.
  if (event.source !== frame.contentWindow) return
  if (event.data?.type === 'ready') frame.contentWindow.postMessage({ type: 'run' }, '*')
})
```

`pause` and `stepInto` work without `debug`: a frame the host pauses shows Continuar and Detener
and nothing else, because the stepping buttons and Variables are what `debug` adds.

A profile the host installs through `setProfile` does not travel through "Abrir en StepCode":
the share hash carries the profile's id, not its definition, so a full editor opened from a frame
running a custom profile falls back to the builtin the id names (or reports it as unknown).

## How it is put together

- `src/runtime/` — the Web Worker owns execution. `driver.ts` is a state machine over the
  language package's `Run`: it time-slices `continue`, batches output, and posts typed
  messages (`protocol.ts`). `host.ts` (`RuntimeHost`) spawns the worker, relays messages, and
  stops by terminating and respawning, so an infinite loop never needs the worker's cooperation.
- `src/store/` — one vanilla Zustand store, the host's only subscriber and the only state React
  reads. Actions are guarded by the run state; the worker announces every transition. React
  reaches the store only through `src/store/context.tsx`.
- `src/shell/` — the chrome. `Toolbar.tsx` (40 px: menu, filename, file actions, run cluster),
  `StatusBar.tsx` (24 px: run state, problems, cursor, profile), `shortcuts.ts` (the keymap and
  its window listener), and `DesktopShell.tsx`, which hosts the panels in a dockview grid:
  groups collapse to a labelled strip instead of closing, float, and pop out into a second
  window (`public/popout.html`). `dock/defaultLayout.ts` lays out the first run; `autoExpand.ts`
  decides which panel a run or a debug session expands, and a group the user collapses during a
  run stays collapsed until the next one. `src/shell/mobile/` is the phone shell below 768 px
  (`useIsNarrow.ts`): a 44 px top bar, the editor, a symbol bar for characters the on-screen
  keyboard hides, and a bottom sheet with Consola, Problemas and Variables at three heights.
- `src/panels/` — Editor (CodeMirror with `@stepcode/codemirror`'s language support and debug
  extensions), Console (output, inline input, wait and error lines), Variables (frames
  innermost first), Problems (lint diagnostics, click to reveal). Panels take no layout props,
  so both shells mount the same components.
- `src/dialogs/` — `DialogHost.tsx` mounts every dialog once and the store's `dialog` field says
  which one is open: Ajustes (language and profile, editor, execution, layout, appearance),
  Ejemplos, Compartir, Acerca de, the warnings prompt, the unsaved-changes confirmation, and the
  toaster.
- `src/store/persist.ts` — settings, the profile and the layout live under the `stepcode.editor`
  localStorage key (versioned and migrated on read); the open document (name, source,
  profile and last saved text) lives in the `stepcode` IndexedDB database, debounced. Neither
  ever throws: a failure warns and the editor keeps working.
- `src/files/` — new, open, save and save as through the File System Access API, with a
  download and an `<input type="file">` fallback where it is missing; the environment is
  injected (`FileEnvironment`) so tests never touch the real pickers.
- `src/examples/` and `src/profiles/transpose.ts` — the bundled programs, written once in the
  `es` profile and transposed to the active profile's keywords on load, with a checked-in
  override file when a program cannot be transposed automatically.
- `src/share/` — a program travels in the URL fragment as compressed base64url
  (`link.ts`), decoded on load by `onLoad.ts` before persistence starts, so a shared link never
  overwrites the stored document silently.
- `src/pwa/` — `vite-plugin-pwa` precaches the build; `useUpdatePrompt` surfaces a new version
  as a toast the user accepts.
- `src/theme/tokens.css` — every color, once, as `--sc-*` variables: One Light on `:root`, One
  Dark under `[data-theme="dark"]`. Tailwind maps them in `index.css`; CodeMirror and dockview
  read them in `src/editor/` and `src/shell/dock/`. The preference (`system`, `light`, `dark`)
  is persisted and `watchSystemTheme` keeps `system` following the platform.
- `src/strings.ts` — every user-visible string in `es` and `en`, chosen by the active profile.

Open items: `RuntimeHost` has no store, so its one message (`host.workerError`) is read from the
`es` strings regardless of the selected language.

## Keyboard

F5 run or continue · Shift+F5 stop · F6 pause · F10 step over · F11 step into · Shift+F11 step
out · Ctrl+N new (editor focused) · Ctrl+O open · Ctrl+S save · Ctrl+Shift+S save as ·
Ctrl+, settings · Escape closes the open dialog.

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
