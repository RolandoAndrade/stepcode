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
