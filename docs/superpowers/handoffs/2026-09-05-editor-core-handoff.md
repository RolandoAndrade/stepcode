# Handoff: after sub-project 4a (editor core)

Written 2026-09-05 on branch `RolandoAndrade/v2` (worktree `/home/ubuntu/orca/workspaces/stepcode/v2`,
main checkout `~/projects/stepcode`). `master` still holds v0.12.0 and the deployed v1 editor
(stepcode.online); nothing merges until v2 reaches parity.

## Where things stand

| Sub-project | Status | Spec / plan |
|---|---|---|
| 1. Monorepo skeleton | done | umbrella `specs/2026-09-03-stepcode-v2-design.md`, `plans/2026-09-03-monorepo-skeleton.md` |
| 2. `@stepcode/profiles` | done | `specs/2026-09-03-profiles-design.md`, `plans/2026-09-03-profiles.md` |
| 3a–3c. Language | done | `specs/2026-09-0{3,4}-language-*-design.md`, matching plans |
| 5. `@stepcode/codemirror` | done | `specs/2026-09-04-codemirror-design.md`, `plans/2026-09-04-codemirror.md` |
| **4a. Editor core** | **done today** | `specs/2026-09-05-editor-core-design.md`, `plans/2026-09-05-editor-core.md` |
| 4b. Editor shell | next | spec to write (scope in 4a spec §1) |
| 4c. Editor distribution | after 4b | spec to write (scope in 4a spec §1) |
| 6. `@stepcode/textmate` | any time | — |
| 7. Release 2.0.0 | last | umbrella §7 |

Head: see `git log -1`. `pnpm lint && pnpm typecheck && pnpm build && pnpm test` clean. Editor
package: 17 test files, 159 tests; whole repo 91 files, 3657 tests.

## What 4a delivered

`packages/editor` (private) runs a program end to end against the real runtime:

- **Worker driver** (`src/runtime/driver.ts`): a state machine over the language `Run` that
  compiles, time-slices `continue({ budget })` with a `MessageChannel` yield, batches output per
  flush point, remembers the interrupted command across `input`/`wait`, and posts the typed
  protocol of spec §3 (`state` before the message it describes). Any failure inside the worker
  surfaces as `state:error` plus an `E4009` internal-failure diagnostic; nothing wedges silently.
- **RuntimeHost** (`src/runtime/host.ts`): lazy spawn on `start` only, message relay through
  `addEventListener`, stop by terminate-and-respawn with a generation counter, worker `error` /
  `messageerror` surfaced as `E4009`, `dispose()` inert afterwards.
- **Store** (`src/store/store.ts`, vanilla Zustand; React only in `context.tsx`): document slice
  (source, profile id, lint diagnostics, breakpoints, theme) and runtime slice (state, capped
  output buffer, current line, frames, pending input, wait, error) with state-guarded actions.
  `createEditorStore(host, { applyTheme, initialTheme })`; `main.tsx` owns the one store and host.
- **Panels**: Editor (one `EditorView`, compartments for language, read-only, dark; pushes
  source, diagnostics, breakpoints; consumes current line; `EditorHandle.revealSpan`), Console
  (verbatim chunks, inline input prompt with re-ask, wait line, error line, dropped marker),
  Variables (frames innermost first, arrays rendered per rank with truncation), Problems (sorted,
  glyph with accessible severity name, click reveals in the editor).
- **Toolbar and shortcuts**: controls per run state, profile select, theme toggle, diagnostics
  badge; F5/Shift+F5/F6/F10/F11/Shift+F11 always swallowed, legality decides whether an action
  runs.
- **Theme**: One Light and One Dark as 24 semantic `--sc-*` tokens in `src/theme/tokens.css`,
  mapped to Tailwind through `@theme inline` and consumed by the CodeMirror theme and highlight
  style as `var(--sc-…)`; contrast and tokens-only tests.
- **Deployment**: `packages/editor/wrangler.jsonc` (assets-only Worker `stepcode-editor`, SPA
  fallback, preview URLs), `wrangler` pinned as a dev dependency, CI dry run after the build,
  Workers Builds dashboard settings in the editor README.
- **Language package**: `Run.inspect()` returns main's final frame after `done` (patch
  changeset); new `E4009` internal runtime failure code (patch changeset). `packageName` removed
  from the codemirror barrel.

## Decisions worth remembering

- The worker owns execution; the main thread never paces it. Stop is `Worker.terminate()` plus
  respawn because it must work on a program that never yields.
- A `ResolvedProfile` cannot cross `postMessage` (normalizer function, sealed maps); the worker
  receives the `ProfileInput` JSON and resolves it against `builtinProfiles`.
- Contrast bar: 4.5:1 for foreground, 3:1 for syntax colors (canonical One Light sits between
  3.06:1 and 4.7:1); comments and muted text exempt. The palette stays canonical.
- `@vitest/web-worker` double-fires `.onmessage` under happy-dom; the host uses
  `addEventListener`. `aria-query` counts nested panel `<header>`s as banners; the App test finds
  the toolbar by its title text.
- `allowBuilds: { esbuild, workerd }` in `pnpm-workspace.yaml` lets wrangler's native
  dependencies run their postinstall; pnpm 10+ requires the explicit allow.
- Production branch for Workers Builds is `RolandoAndrade/v2` until release, then `master`.

## Next: 4b (editor shell)

- Replace the fixed grid in `App.tsx` with dockview; the panels take no layout props and mount
  unchanged. Persist layout and settings under one versioned `localStorage` key.
- Menu, status bar, settings dialog (profile picker and custom profile builder over
  `ProfileInput`, editor, execution, appearance with UI language separate from the profile
  locale, layout reset), open/save through the File System Access API, examples, share, PWA.
- The theme toggle moves into settings; `setTheme` already calls `applyTheme`; persistence is the
  only missing piece. `strings.ts` grows per feature; `stringsFor(locale)` is the only entry.
- Host wiring for a custom profile is free: `start` already carries `ProfileInput`.

## User-owned setup

- Connect the repository in the Cloudflare dashboard (Workers & Pages → Create → connect
  `RolandoAndrade/stepcode`) with the settings table in `packages/editor/README.md`. No domain
  yet.
- `NPM_TOKEN` repository secret (not set; v0.12.0 was published by hand in 2023) or npm trusted
  publishing; confirm the `@stepcode` npm org; drop `RolandoAndrade/v2` from `ci.yml` triggers
  after the merge to `master`.

## Open items

- Deferred from reviews (stay deferred): Problems rows are mouse-only (no keyboard
  affordance); the Console re-joins the whole buffer on each render (memoizable); the press-any-key
  prompt submits on modifier keys and Tab; the Editor's store subscription dispatches from inside
  an update-listener chain without a comment stating why it cannot re-enter; `strings.console.submit`
  is unused; the host corpus smoke test has no no-input corpus program beyond the hand-written one;
  `revealSpan` scrolls only `from`; `RuntimeHost` is never disposed for the page lifetime;
  `subscribe()` after `dispose()` adds an inert listener; auto-scroll-unless-scrolled-up has no
  direct test (happy-dom lacks layout, belongs to 4c's Playwright pass); `renderArray` with empty
  `dims` renders `[]`; the `$schema` path in `wrangler.jsonc` resolves only from the package dir.
- From the fix-wave re-review: the host's `'worker error'` fallback text in `host.ts` bypasses
  `strings.ts`; `packages/language/README.md` and the interpreter spec's module inventory still
  say "E4001–E4008" (E4009 is host-synthesized); an internal failure's zero-width span makes the
  store point the current-line marker at line 1.
- `pause` during `waiting` or `input` is dropped by design (spec §4); the toolbar shows only Stop
  there.
- The plan's step checkboxes were not ticked; the ledger and git history are the record.

## Process notes

- Subagent-driven development, 13 tasks in five waves; up to six implementers in parallel on
  disjoint files; fix rounds on Tasks 2, 3, 6, 10 and one final fix wave. Review packages were
  built per commit because parallel commits interleave.
- Ledger and briefs lived in `.superpowers/sdd/2026-09-05-editor-core/` (deleted at close).
