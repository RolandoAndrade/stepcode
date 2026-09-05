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
