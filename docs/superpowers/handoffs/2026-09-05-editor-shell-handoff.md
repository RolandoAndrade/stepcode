# Handoff: after sub-project 4b (editor shell)

Written 2026-09-05 on branch `RolandoAndrade/v2` (worktree `/home/ubuntu/orca/workspaces/stepcode/v2`,
main checkout `~/projects/stepcode`). `master` still holds v0.12.0 and the deployed v1 editor;
nothing merges until v2 reaches parity.

## Where things stand

| Sub-project | Status | Spec / plan |
|---|---|---|
| 1. Monorepo skeleton | done | umbrella `specs/2026-09-03-stepcode-v2-design.md` |
| 2. `@stepcode/profiles` | done | `specs/2026-09-03-profiles-design.md` |
| 3a–3c. Language | done | `specs/2026-09-0{3,4}-language-*-design.md` |
| 5. `@stepcode/codemirror` | done | `specs/2026-09-04-codemirror-design.md` |
| 4a. Editor core | done | `specs/2026-09-05-editor-core-design.md` |
| **4b. Editor shell** | **done today** | `specs/2026-09-05-editor-shell-design.md`, `plans/2026-09-05-editor-shell.md` |
| 4c. Editor distribution | next | spec to write (scope in the 4b spec §1.1) |
| 6. `@stepcode/textmate` | any time | — |
| 7. Release 2.0.0 | last | umbrella §7 |

Head: see `git log -1`. `pnpm lint && pnpm typecheck && pnpm build && pnpm test` clean (editor
project 59 test files; whole repo 134 files, 3 814 tests). Preview deployed by hand at
https://stepcode-editor.rolandoandradefernandez.workers.dev.

## What 4b delivered

`packages/editor` is now the product shell around the 4a runtime and panels:

- **Desktop shell** (`src/shell/DesktopShell.tsx`, `src/shell/dock/*`): dockview 8.2.0 with custom
  tab/header chrome, editor group locked (drag source blocked through `onWillDragPanel`), one
  collapsed bottom group by default, collapse through group size constraints (`CollapseController`),
  auto-expand rules shared with the phone (`src/shell/autoExpand.ts`), layout persisted through
  `setDockLayout` and restored with a fallback to the default, reset from the Vista menu. The
  desktop shell loads lazily so phones never download dockview.
- **Phone shell** (`src/shell/mobile/*`): 44 px top bar with a `⋯` popover for debugging, bottom
  sheet (collapsed / half / full, drag or tap, tabs in the handle), symbol bar derived from the
  profile and shown from the VisualViewport API, compact status bar.
- **Toolbar, menu, status bar** (`src/shell/{Toolbar,Filename,RunControls,Menu,StatusBar,shortcuts}`):
  filename inline edit with the unsaved dot and the browser title, run cluster by state with
  slot placeholders, Radix dropdown menu built from the pure `menuModel`, status bar with cursor,
  profile popover, problems count and run state; shortcuts Ctrl/⌘ +N/O/S/Shift+S/, plus 4a's F-keys.
- **Settings** (`src/dialogs/Settings/*`): rail plus sections Lenguaje (profile cards, custom
  profile builder with base picker, spellings table, option toggles, live validation and preview),
  Editor, Ejecución, Apariencia (theme Sistema/Claro/Oscuro, UI language Automático/es/en), Diseño.
- **Files** (`src/files/*`, `src/dialogs/ConfirmSave.tsx`): File System Access with input/download
  fallbacks; `saveFile`/`saveFileAs` return whether a write really happened and the confirm-save
  dialog applies a replacement only then.
- **Examples** (`packages/editor/examples/**`, `src/examples/*`): twelve Spanish programs with a
  header comment, indexed with `import.meta.glob`, transposed per profile through
  `src/profiles/transpose.ts`; a test compiles every example under every builtin profile.
- **Share** (`src/share/*`): `#code=` encode and decode (deflate-raw + base64url, 5 MB inflate
  cap, 8 000-char warning), applied at boot ahead of the stored document through the usual
  unsaved prompt.
- **Persistence** (`src/store/persist.ts`): one `localStorage` key `stepcode.editor` (zod
  validated, `migrations[version]` list), document in IndexedDB through `idb-keyval`; the boot
  path never leaves a blank page (`src/main.tsx`).
- **PWA** (`src/pwa/*`, `vite.config.ts`): `vite-plugin-pwa` with prompt updates and the v1 icons;
  About dialog with the version.
- **Language package**: `@stepcode/codemirror` gains `stepcode({ completion })` (patch changeset).
  Strings: full `es`/`en` tables in `src/strings.ts` with a parity test.

## Decisions worth remembering

- Progressive disclosure: editor alone at first, panels collapse and never close, icons with
  tooltips for actions, text in the status bar for state. Dockview kept because floating and
  rearranging matter to the user.
- The store is the only seam: `panelRequest`, `layoutReset`, `pendingReplace`, `dialog`, `toasts`,
  `sheet`. Both shells call the same pure `autoExpandTarget`.
- Spec amendments made during execution: an input request always expands its panel/sheet even
  after a manual collapse (§3.4, §9); `workbox-window` is a dev dependency (§12); symbol-bar keys
  and the sheet handle fill their bars instead of 44 px (§2.2, §9); the popout smoke test is 4c's
  (§3.5, §13); dockview 8.2.0's native collapsible edge groups are not adopted yet (§14).
- Zustand selectors must return stable values under React 19: select raw fields and `useMemo`
  derived lists (a `useShallow(profileItems)` loops).
- Radix: the toast announcer duplicates `role="status"` (query by text); `Tabs.Trigger` ignores
  `onClick`; a dialog whose auto-focus is prevented needs an explicit focus target.
- dockview 8.2.0: `locked` only blocks drops; constraints merge per key and `clamp` returns the
  minimum when it exceeds the maximum, so collapse must set both bounds.
- Workers assets redirect `/popout.html` to `/popout`; dockview follows the redirect.

## Next: 4c (editor distribution)

- `?example=<id>` and `?src=<url>` with an allowlist, `readonly`/`autorun`/`hideProfile` flags,
  the `/embed` route with `postMessage`, and the Playwright pass (desktop drag/float/popout, phone
  gestures, embed). `applyShareFromLocation` already preserves the query string.
- Consider migrating collapse to dockview's native edge groups (`addEdgeGroup`, `isCollapsed`).
- Connect Workers Builds so previews deploy per commit (README table); until then deploy by hand.

## Open items (deferred, none blocking)

- Dock: minimum-size bookkeeping is one scalar for both axes, so a restored side group carries a
  120 px width floor where a fresh one has 100; the collapsed strip tests cover the right edge
  only; single-panel groups have no heading treatment; tab `aria-label` is fixed at construction,
  so a mid-session UI-language switch does not relabel tabs; previous size is not remembered
  across a reload; `popoutUrl` could be `/popout` to skip the redirect.
- Profile builder: switching the base keeps overrides already typed in the spellings table (only
  the raw texts reset); the base select shows no value when a custom profile's `extends` no longer
  exists; `profileOf` warns on every call for an unresolvable profile; Tabs.Trigger `onClick` is
  test-shaped.
- Store/persist: `UiLocale` declared twice; `writeDocument` exported unwrapped; dead `ProfileId`
  alias; the boot fallback discards partially restored state.
- Panels: the dead `language` compartment path kept for a 4a test; any settings change rebuilds
  the language support; Variables shows the pause hint after done/error; Problems keeps the
  `line:col` cell; `MoreActions` duplicates RunControls' debug slots.
- Tests: `MobileTopBar` covered only by the checked-menu test; `DialogHost` test covers 4 of 7
  children; `useIsNarrow` lacks unmount assertions; the "store consumer without provider" case was
  dropped; the boot test polls; the dockview-free scan is a substring test.
- Docs: §9 list indentation; the `es`-only `host.workerError` string.

## Process notes

- Subagent-driven development, 14 tasks in four waves with up to five implementers in one
  worktree (files disjoint, commits by path). Parallel implementers can sweep each other's staged
  files into a commit (it happened once, c87843e); stage by path only.
- Final whole-branch review found three cross-task defects the per-task gates could not see
  (editor not following `source` replacement, collapse never reaching the header, confirm-save
  applying after a failed save); one fix wave plus one bounded correction closed them.
- Ledger and briefs lived in `.superpowers/sdd/2026-09-05-editor-shell/` (deleted at close).
