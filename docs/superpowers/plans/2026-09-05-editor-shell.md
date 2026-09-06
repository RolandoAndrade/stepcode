# Editor shell (sub-project 4b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 4a prototype into the product: a calm dockview shell (collapse, float, pop out, persist, reset), toolbar with filename and file actions, menu, status bar, settings with a custom profile builder, open/save with fallbacks, autosave, examples transposed per profile, share links (encode and decode), a phone shell with bottom sheet and symbol bar, and a PWA — on top of the unchanged 4a runtime and panels.

**Architecture:** The vanilla Zustand store grows three slices — `settings`, `document`, `layout` — plus small UI intents (`dialog`, `panelRequest`, `toasts`, `pendingReplace`) so every component talks to the store and never to another component. Persistence is two adapters over the store: `localStorage` (settings + layout, one versioned zod-validated key) and IndexedDB (the document). `App.tsx` picks `DesktopShell` (dockview, custom chrome, collapse via group size constraints, auto-expand rules) or `MobileShell` (column, bottom sheet, symbol bar) by viewport; both mount the same four panels. Examples are `.stepcode` files loaded with `import.meta.glob` and transposed to the active profile through a token-level transposer. Dialogs are Radix primitives opened by a store field and hosted in one `DialogHost`.

**Tech Stack:** TypeScript 7 (strict, ESM), React 19, Vite 8, Tailwind 4, Zustand 5, CodeMirror 6, Vitest 4.1 (`happy-dom` opt-in per file), Biome 2.5, pnpm 11. New dependencies (versions checked on npm on 2026-09-05; pnpm's `minimumReleaseAge` may resolve one patch older — accept what `pnpm add` resolves, record it in the report, never add exclusions): `dockview-react` 8.2.0, `@radix-ui/react-dialog` 1.1.23, `@radix-ui/react-dropdown-menu` 2.1.24, `@radix-ui/react-popover` 1.1.23, `@radix-ui/react-tooltip` 1.2.16, `@radix-ui/react-tabs` 1.1.21, `@radix-ui/react-toast` 1.2.23, `lucide-react` 1.41.0, `idb-keyval` 6.3.0, `zod` ^4.5.4 (workspace catalog); dev: `fake-indexeddb` 6.2.5, `vite-plugin-pwa` 1.3.0.

**Spec:** `docs/superpowers/specs/2026-09-05-editor-shell-design.md` (all sections). Builds on `docs/superpowers/specs/2026-09-05-editor-core-design.md` (protocol, store, panels, tokens) and `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` §4.

## Deviations from the spec, decided while planning

1. **Examples use `import.meta.glob`, not a Vite plugin.** Spec §8.3 allows "a Vite plugin (or a build-time script)"; Vite's own `import.meta.glob(..., { query: '?raw', import: 'default', eager: true })` needs no plugin, works in Vitest, and the header parser is a pure function with its own tests.
2. **Panel headers move out of the panels.** Spec §3.6 puts Console actions and Problems counts in the group header. The 4a panels rendered their own `<header>`; Task 11 removes those headers, `PanelActions` (Task 11) renders the per-panel actions from the store, and the dock header (Task 6) and the sheet handle (Task 12) both mount it. The panels' props are unchanged (spec §1 "panels take no layout props").
3. **Console auto-scroll and cursor position live in the store.** The dock header needs the auto-scroll toggle and the status bar needs the cursor; both become store fields (`autoScroll`, `cursor`) written by the Console and the Editor.
4. **Document replacement is a store transaction.** `requestReplace(draft)` either applies the draft or parks it in `pendingReplace` and opens the `confirmSave` dialog; the dialog (Task 5) saves through the files module and then calls `applyReplace()`. Nuevo, examples and share links all go through it, so none of them depends on the files module.
5. **Layout intents flow through the store.** `panelRequest` (Vista menu, status bar), `layoutReset` (counter) and `sheet` are store fields the shells observe; the auto-expand rule of spec §3.4 is a pure function `autoExpandTarget(previous, next)` both shells call. This keeps Toolbar, Menu, StatusBar and the two shells independent.
6. **Dialogs open through `store.dialog`.** Menu, shortcuts and status bar set it; `DialogHost` (Task 14) renders the matching dialog. Each dialog component takes `open` and `onOpenChange` so it is testable alone.
7. **Custom profiles resolve lazily.** `profileOf(state)` resolves a custom `ProfileInput` against the builtin registry plus the other custom inputs, memoized by input identity. `ProfileId` becomes `string`; `PROFILE_IDS` keeps the three builtins.
8. **`@stepcode/codemirror` gains `stepcode({ completion })`.** Spec §6.2 has an autocomplete setting and `stepcode()` bundles `autocompletion()` unconditionally; a conflicting second `autocompletion()` config would throw. Task 11 adds the optional flag (default `true`) — a one-line, backward-compatible change with a patch changeset.
9. **Popout uses dockview's default `/popout.html`.** Task 6 ships `packages/editor/public/popout.html` (an empty document) so the Worker serves it; dockview injects the group and clones stylesheets.
10. **`Theme` stays the resolved theme.** The store keeps `theme: 'light' | 'dark'` (the Editor and CodeMirror read it) and adds `themePreference: ThemePreference` plus `systemDark`; `resolveTheme(preference, systemDark)` derives `theme`.
11. **Share encoding is asynchronous.** `CompressionStream` is stream-based, so `encodeShare` and `decodeShare` return promises; the dialog shows the link once it resolves.

## Parallelism

Waves. A task starts when every task it depends on is complete and reviewed. Inside a wave the file sets are disjoint; commit interleaving across parallel tasks is expected and review packages are built by path.

| Wave | Tasks | Owned files (nothing else is touched) |
|---|---|---|
| 1 | **1** | `packages/editor/package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `packages/editor/public/fonts/*`, `src/env.d.ts`, `src/version.ts`, `src/strings.ts`, `src/theme/types.ts`, `src/theme/tokens.css`, `src/index.css`, `src/ui/{icons.tsx,Tooltip.tsx,keys.ts}`, `src/store/{settings.ts,document.ts,layout.ts,store.ts,persist.ts}`, `src/shell/autoExpand.ts`, `src/theme/theme.ts` (`TOKEN_NAMES`/`HEX_TOKENS` only), `test/{render.tsx,strings.test.ts,keys.test.ts,Tooltip.test.tsx,settings.test.ts,document.test.ts,layout.test.ts,store.test.ts,persist.test.ts,autoExpand.test.ts,theme.test.ts}` |
| 2 | **2** | `src/profiles/{transpose.ts,starter.ts}`, `test/{transpose.test.ts,starter.test.ts}` |
| 2 | **3** | `packages/editor/examples/**`, `src/examples/{header.ts,index.ts}`, `test/{examples-header.test.ts,examples.test.ts}` |
| 2 | **4** | `src/share/{base64url.ts,link.ts,onLoad.ts}`, `test/{base64url.test.ts,share.test.ts}` |
| 2 | **5** | `src/files/{fsa.ts,actions.ts}`, `src/dialogs/ConfirmSave.tsx`, `test/{files.test.ts,ConfirmSave.test.tsx}` |
| 2 | **8** | `src/shell/StatusBar.tsx`, `test/StatusBar.test.tsx` |
| 2 | **11** | `src/panels/{Console,Problems,Variables,Editor}.tsx`, `src/panels/PanelActions.tsx`, `src/editor/extensions.ts`, `test/{Console,Problems,Variables,Editor,PanelActions}.test.tsx`, `test/extensions.test.ts`, `packages/codemirror/src/stepcode.ts`, `packages/codemirror/test/stepcode.test.ts`, `.changeset/codemirror-completion-flag.md` |
| 2 | **13** | `src/theme/theme.ts`, `src/pwa/{register.ts,UpdateToast.tsx}`, `packages/editor/vite.config.ts`, `packages/editor/tsconfig.json`, `packages/editor/public/{favicon.ico,pwa-64x64.png,pwa-192x192.png,pwa-512x512.png,maskable-icon-512x512.png,apple-touch-icon-180x180.png}`, `packages/editor/index.html`, `test/{theme-preference.test.ts,pwa.test.tsx}` |
| 3 | **6** | `src/shell/dock/{theme.ts,dock.css,Tab.tsx,HeaderActions.tsx,collapse.ts,defaultLayout.ts,panels.tsx}`, `src/shell/DesktopShell.tsx`, `packages/editor/public/popout.html`, `test/{collapse.test.ts,defaultLayout.test.ts,dock-theme.test.ts,DesktopShell.test.tsx}` |
| 3 | **7** | `src/shell/{Toolbar.tsx,Filename.tsx,RunControls.tsx,Menu.tsx,shortcuts.ts}`, `test/{ShellToolbar,Filename,RunControls,Menu}.test.tsx`, `test/shell-shortcuts.test.ts` |
| 3 | **9** | `src/dialogs/Settings/{Settings.tsx,Rail.tsx,Language.tsx,ProfileBuilder.tsx,EditorSection.tsx,Execution.tsx,Appearance.tsx,LayoutSection.tsx,controls.tsx}`, `test/{Settings.test.tsx,ProfileBuilder.test.tsx}` |
| 3 | **10** | `src/dialogs/{Dialog.tsx,Examples.tsx,Share.tsx,About.tsx,Warnings.tsx,Toaster.tsx}`, `test/{Examples,Share,About,Warnings,Toaster}.test.tsx` |
| 3 | **12** | `src/shell/mobile/{MobileShell.tsx,BottomSheet.tsx,SymbolBar.tsx,symbols.ts,viewport.ts,MobileTopBar.tsx}`, `test/{symbols.test.ts,viewport.test.ts,BottomSheet.test.tsx,SymbolBar.test.tsx,MobileShell.test.tsx}` |
| 4 | **14** | `src/App.tsx`, `src/main.tsx`, `src/dialogs/DialogHost.tsx`, `src/shell/useIsNarrow.ts`, `test/{App,DialogHost}.test.tsx`, `test/useIsNarrow.test.ts`, delete `src/components/*` and `test/{Toolbar.test.tsx,shortcuts.test.ts}` from 4a, `packages/editor/README.md`, `src/runtime/host.ts` (one string) |

Dependencies: 1 → everything. 6 ← {1, 11}; 7 ← {1, 5, 8}; 9 ← {1, 2, 8}; 10 ← {1, 3, 4}; 12 ← {1, 7, 8, 11}; 14 ← all. Every string any task renders is defined in Task 1 (`src/strings.ts` is never edited again). `package.json` is edited by Task 1 only. `vite.config.ts` and `tsconfig.json` by Task 13 only. `src/store/store.ts` by Task 1 only. `src/theme/theme.ts` by Task 1 (wave 1) and then Task 13 only.

## Global Constraints

These are the spec's binding rules and the repository's conventions. They hold in every task; do not weaken them.

- **TypeScript strict** with `tsconfig.base.json`: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (never assign `undefined` to an optional property — omit the key), `verbatimModuleSyntax` (`import type`), `noFallthroughCasesInSwitch`, `isolatedModules`. Imports are extensionless.
- **Dependencies** are exactly those in the Tech Stack line, added by Task 1. No Playwright, no Vitest browser mode, no other UI library.
- **Colors exist only in `src/theme/tokens.css`.** No hex, `rgb(`, `hsl(`, or named color anywhere else — chrome uses Tailwind utilities mapped to tokens (`bg-bg`, `bg-surface`, `bg-surface-raised`, `bg-accent-soft`, `bg-overlay`, `text-fg`, `text-muted`, `text-accent`, `text-error`, `text-warning`, `text-success`, `border-border`, `shadow-panel`, `bg-changed`), dockview and CodeMirror use `var(--sc-…)`. The tokens-only test (Task 1) scans every file under `src/` except `tokens.css`.
- **Sizes from spec §2.** Toolbar 40 px (`h-10`), status bar 24 px (`h-6`), group header 28 px (`h-7`), phone top bar 44 px (`h-11`), symbol bar 40 px, sheet handle 36 px (`h-9`); text 14 px chrome/dialogs (`text-sm`), 13 px panel bodies (`text-[13px]`), 12 px headers/tabs/status (`text-xs`); toolbar buttons 28 px (`h-7 w-7`), dialog buttons 32 px (`h-8`), touch targets ≥ 44 px on the phone.
- **Icons** come from `src/ui/icons.tsx` only (a curated re-export of `lucide-react`, size 16, stroke 1.75); every icon button has `aria-label` and, on pointer devices, a `Tooltip` showing "Label · Shortcut".
- **The store has no React import.** `src/store/*.ts` use `zustand/vanilla`; React enters through `src/store/context.tsx` only.
- **Every string comes from `stringsFor(locale)`.** Components never hold literal UI copy. `es` and `en` have identical key sets (test in Task 1). Diagnostics keep the profile locale; UI copy uses the resolved UI locale (`uiLocaleOf`).
- **Panels take no layout props.** `Editor`, `Console`, `Problems`, `Variables` keep their 4a signatures; both shells mount them unchanged.
- **Biome** (`biome.json`: 2-space indent, single quotes, no semicolons, trailing commas, line width 100, organized imports). Run `pnpm lint:fix` before every commit; `pnpm lint` must exit 0. Every command runs from the repo root.
- **Commands.** One file: `pnpm vitest run --project @stepcode/editor packages/editor/test/<file>`; the package: `pnpm vitest run --project @stepcode/editor`; typecheck: `pnpm --filter @stepcode/editor typecheck`; the codemirror package (Task 11): `pnpm vitest run --project @stepcode/codemirror`; whole repo: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`.
- **Strict TDD**: every step writes the failing test first, runs it to see the expected failure, then writes the minimal implementation, then runs it green. **One commit per task** (or per step group the task names), conventional-commit style (`feat(editor): …`, `test(editor): …`, `docs(editor): …`, `chore(editor): …`), **no attribution trailers**, no pushing.
- **Never use bare `git stash` / `git stash pop`** (the stash is shared with other worktrees). Use a temporary WIP commit to set work aside.
- **English artifacts**: code, comments, test names, README and commit messages are English. UI copy lives in `src/strings.ts` in `es` and `en`. Example programs are Spanish StepCode under the `es` profile.
- **happy-dom is opt-in per file** with `// @vitest-environment happy-dom` as the first line. Every other test runs under Node and touches no DOM. A file that imports `test/render.tsx` must be a happy-dom file.
- **Persistence never throws.** Any read of `localStorage` or IndexedDB is wrapped; a failure logs a `console.warn` and falls back to defaults.

## File Structure

Everything below `packages/editor/` unless a path starts with `packages/codemirror/` or `.changeset/`.

```
package.json                                                    (Task 1)
vite.config.ts, tsconfig.json, index.html                       (Task 13)
public/fonts/JetBrainsMono-{Regular,Bold}.woff2, OFL.txt        (Task 1)
public/popout.html                                              (Task 6)
public/{favicon.ico, pwa-*.png, maskable-icon-512x512.png, apple-touch-icon-180x180.png}  (Task 13)
examples/topics.json, examples/<topic>/<slug>.stepcode          (Task 3)
README.md                                                       (Task 14)
src/
  env.d.ts             declare __APP_VERSION__                  (Task 1)
  version.ts           APP_VERSION                              (Task 1)
  strings.ts           Strings, stringsFor(locale) — complete    (Task 1)
  index.css            tailwind + tokens + @theme inline + fonts (Task 1)
  main.tsx             persistence bootstrap, host, store, mount (Task 14)
  App.tsx              shell selection, DialogHost, Toaster      (Task 14)
  ui/
    icons.tsx          curated lucide re-exports                 (Task 1)
    Tooltip.tsx        Tooltip, IconButton                       (Task 1)
    keys.ts            isMac, keyLabel(shortcut)                 (Task 1)
  theme/
    types.ts           Theme, ThemePreference, THEMES            (Task 1)
    tokens.css         28 tokens                                 (Task 1)
    theme.ts           + resolveTheme, watchSystemTheme          (Task 13)
  store/
    settings.ts        Settings, SettingsSchema, defaults, migrations   (Task 1)
    document.ts        DocumentState, DocumentDraft, isDirty     (Task 1)
    layout.ts          LayoutState, SheetPosition, PanelId       (Task 1)
    store.ts           createEditorStore (all slices), selectors (Task 1)
    persist.ts         PersistedV1, load/save, IndexedDB document adapter, startPersisting (Task 1)
    output.ts, context.tsx                                       (4a, unchanged)
  shell/
    autoExpand.ts      autoExpandTarget(previous, next)          (Task 1)
    StatusBar.tsx                                                (Task 8)
    Toolbar.tsx, Filename.tsx, RunControls.tsx, Menu.tsx, shortcuts.ts  (Task 7)
    DesktopShell.tsx                                             (Task 6)
    dock/theme.ts, dock.css, Tab.tsx, HeaderActions.tsx, collapse.ts, defaultLayout.ts, panels.tsx (Task 6)
    mobile/MobileShell.tsx, MobileTopBar.tsx, BottomSheet.tsx, SymbolBar.tsx, symbols.ts, viewport.ts (Task 12)
    useIsNarrow.ts                                               (Task 14)
  panels/
    Editor.tsx, Console.tsx, Problems.tsx, Variables.tsx (refined), PanelActions.tsx (Task 11)
    values.ts                                                    (4a, unchanged)
  editor/extensions.ts (settings compartment)                    (Task 11)
  profiles/transpose.ts, starter.ts                              (Task 2)
  examples/header.ts, index.ts                                   (Task 3)
  share/base64url.ts, link.ts, onLoad.ts                         (Task 4)
  files/fsa.ts, actions.ts                                       (Task 5)
  dialogs/
    ConfirmSave.tsx                                              (Task 5)
    Settings/Settings.tsx, Rail.tsx, Language.tsx, ProfileBuilder.tsx, EditorSection.tsx, Execution.tsx, Appearance.tsx, LayoutSection.tsx, controls.tsx (Task 9)
    Dialog.tsx, Examples.tsx, Share.tsx, About.tsx, Toaster.tsx  (Task 10)
    DialogHost.tsx                                               (Task 14)
  pwa/register.ts, UpdateToast.tsx                               (Task 13)
test/  (one file per source module; see each task)
```

Facts every task relies on (verified 2026-09-05 against the workspace and the published packages):

- `dockview-react` 8.2.0 (depends on `dockview` 8.2.0): `DockviewReact` props extend `DockviewOptions` and add `components`, `tabComponents`, `defaultTabComponent`, `leftHeaderActionsComponent`, `rightHeaderActionsComponent`, `prefixHeaderActionsComponent`, `watermarkComponent`, `onReady({ api })`. Options used: `theme: DockviewTheme` (`{ name, className, colorScheme?, gap?, dndOverlayMounting?, dndPanelOverlay? }`), `singleTabMode`, `disableFloatingGroups`, `floatingGroupBounds`, `popoutUrl` (defaults to `/popout.html`), `hideBorders`, `scrollbars`. `DockviewApi`: `addPanel({ id, component, title?, tabComponent?, position?: { referencePanel | referenceGroup, direction: 'left'|'right'|'above'|'below'|'within' } | { direction } })`, `getPanel(id)`, `getGroup(id)`, `groups`, `panels`, `toJSON(): SerializedDockview`, `fromJSON(data, { reuseExistingPanels? })`, `clear()`, `addFloatingGroup(item, { x, y, width, height })`, `addPopoutGroup(item, { position?, popoutUrl? }): Promise<boolean>`, `onDidLayoutChange: Event<void>`, `onDidLayoutFromJSON`, `onDidActivePanelChange`. Group: `group.id`, `group.panels`, `group.activePanel`, `group.locked: boolean | 'no-drop-target'`, `group.api.location: { type: 'grid' | 'floating' | 'popout' }`, `group.api.setConstraints({ minimumWidth?, minimumHeight?, maximumWidth?, maximumHeight? })` (numbers or functions), `group.api.setSize({ width?, height? })`, `group.api.width/height`, `group.api.onDidLocationChange`. Panel: `panel.id`, `panel.group`, `panel.api.setActive()`, `panel.api.isActive`. Tab props `IDockviewPanelHeaderProps = { api: DockviewPanelApi; containerApi: DockviewApi; params; tabLocation }`; header action props `IDockviewHeaderActionsProps = { api: DockviewGroupPanelApi; containerApi; panels; activePanel; isGroupActive; group; headerPosition; location? }`; panel props `IDockviewPanelProps = { api; containerApi; params }`. Stylesheet: `dockview-react/dist/styles/dockview.css`. Theme variables (a subset is enough): `--dv-group-view-background-color`, `--dv-tabs-and-actions-container-background-color`, `--dv-tabs-and-actions-container-height`, `--dv-tabs-and-actions-container-font-size`, `--dv-activegroup-visiblepanel-tab-background-color`, `--dv-activegroup-visiblepanel-tab-color`, `--dv-activegroup-hiddenpanel-tab-background-color`, `--dv-activegroup-hiddenpanel-tab-color`, `--dv-inactivegroup-visiblepanel-tab-background-color`, `--dv-inactivegroup-visiblepanel-tab-color`, `--dv-inactivegroup-hiddenpanel-tab-background-color`, `--dv-inactivegroup-hiddenpanel-tab-color`, `--dv-tab-divider-color`, `--dv-separator-border`, `--dv-paneview-header-border-color`, `--dv-drag-over-background-color`, `--dv-drag-over-border-color`, `--dv-floating-box-shadow`, `--dv-floating-border`, `--dv-sash-color`, `--dv-active-sash-color`, `--dv-icon-hover-background-color`, `--dv-scrollbar-background-color`, `--dv-tab-border-radius`, `--dv-border-radius`.
- `@stepcode/profiles`: `ProfileInput` is `{ id, locale, keywords, types, operators, builtins, options? }` or `{ id, extends, locale?, keywords?, types?, operators?, builtins?, options? }`; `ResolvedProfile` adds `lookup`, `operatorLookup`, `maxWords`, `normalize`; sections are `Record<Key, readonly string[]>` (first spelling is primary; some keys may be `[]`, e.g. `case` in `es`); `KEYWORD_KEYS`, `TYPE_KEYS`, `OPERATOR_KEYS`, `BUILTIN_KEYS`, `OPTIONAL_KEYWORD_KEYS`; `resolveProfile(input, registry)` throws `ProfileError` (`code`, `message`, `path`); `ProfileInputSchema` (zod 4); `builtinProfiles: ReadonlyMap<string, ProfileInput>`; `profiles.{es,en,pseint}`; `DEFAULT_OPTIONS`.
- `stepcode`: `tokenize(source, profile): { tokens, diagnostics }`; `Token = { kind, text, span: { start, end }, value? }` with `kind` in `keyword | type | builtin | operator | identifier | integer | real | string | punct | newline | whitespace | comment | error | eof`; for `keyword`/`type`/`builtin`/`operator` tokens `value` is the profile key; `text` is the exact slice. `compile(source, { profile })` → `{ diagnostics, … }`. `LineMap(source).positionAt(offset)` → `{ line, column }` (1-based). `Frame`, `FrameVariable`, `renderValue`, `formatDiagnostic` as in 4a.
- `@stepcode/codemirror`: `stepcode({ profile, locale? })` (Task 11 adds `completion?: boolean`), `stepcodeDiagnostics`, `debug()`, `setCurrentLine`, `breakpointLines`, `breakpointsChanged`.
- Node 25 provides `CompressionStream`/`DecompressionStream` (`deflate-raw`) globally; Vitest under Node and under happy-dom both see them. `indexedDB` is absent under Node: tests use `fake-indexeddb` explicitly through `idb-keyval`'s `createStore` with an injected `IDBFactory`. happy-dom provides `matchMedia`, `localStorage`, `navigator.clipboard` (writeText resolves), `KeyboardEvent`, `ResizeObserver`; it has no layout (all rects are 0) and no `visualViewport` (tests fake it).
- Radix primitives render into a portal; Testing Library's `screen` sees them. Radix `Tooltip` needs `TooltipProvider`; `Toast` needs `ToastProvider` + `ToastViewport`; `DropdownMenu` opens on `pointerdown` (tests use `fireEvent.pointerDown` then `fireEvent.click`, or `userEvent`-free `fireEvent.keyDown(trigger, { key: 'Enter' })`).
- JetBrains Mono 2.304 webfonts (OFL 1.1): `https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/webfonts/JetBrainsMono-Regular.woff2`, `…/JetBrainsMono-Bold.woff2`, licence `https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/OFL.txt` (checked 200, ~92 KB, ~95 KB, 4.4 KB).
- The v1 PWA icons live in `/home/ubuntu/projects/stepcode-editor/public/` (`favicon.ico`, `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`); Task 13 copies them.
- 4a test helpers: `test/render.tsx` (`storeWith(partial, host?)`, `renderWithStore(ui, store)`), `test/fake-host.ts` (`FakeHost` with `calls`, `starts`, `emit(message)`), `test/helpers.ts` (`profileInput(id)`, `corpusPrograms()`), `test/setup.ts` (cleanup + Range polyfills under happy-dom).
- Store selectors from 4a that stay: `profileOf`, `localeOf`, `stringsOf`, `hasErrors`, `canEdit`, `profileInputOf` (signature changes in Task 1 to take the state), `DEFAULT_SOURCE` (replaced by `starterProgram` in Task 2; `DEFAULT_SOURCE` stays as the `es` starter text).

---
### Task 1: foundations — dependencies, tokens, fonts, strings, UI helpers, store slices, persistence

**Files:**
- Modify: `packages/editor/package.json` (dependencies), `pnpm-workspace.yaml` (catalog), `pnpm-lock.yaml`
- Create: `packages/editor/public/fonts/JetBrainsMono-Regular.woff2`, `…/JetBrainsMono-Bold.woff2`, `…/OFL.txt`
- Create: `packages/editor/src/env.d.ts`, `src/version.ts`
- Modify: `src/strings.ts` (whole file), `src/theme/types.ts`, `src/theme/tokens.css`, `src/theme/theme.ts` (`TOKEN_NAMES`, `HEX_TOKENS` only), `src/index.css`
- Create: `src/ui/keys.ts`, `src/ui/icons.tsx`, `src/ui/Tooltip.tsx`
- Create: `src/store/settings.ts`, `src/store/document.ts`, `src/store/layout.ts`, `src/store/persist.ts`, `src/shell/autoExpand.ts`
- Modify: `src/store/store.ts` (whole file)
- Modify: `test/render.tsx`, `test/strings.test.ts`, `test/theme.test.ts`, `test/store.test.ts`
- Test: `test/keys.test.ts`, `test/settings.test.ts`, `test/document.test.ts`, `test/layout.test.ts`, `test/persist.test.ts`, `test/autoExpand.test.ts`, `test/Tooltip.test.tsx`

**Interfaces:**
- Consumes: 4a store, `HostApi`, `Theme`, `@stepcode/profiles` (`ProfileInput`, `ProfileInputSchema`, `resolveProfile`, `builtinProfiles`, `profiles`).
- Produces (every later task relies on these exact names):
  - `src/theme/types.ts`: `type Theme = 'light' | 'dark'`, `type ThemePreference = Theme | 'system'`, `THEMES`, `THEME_PREFERENCES`.
  - `src/theme/theme.ts`: `TOKEN_NAMES` (28 names), `HEX_TOKENS`.
  - `src/ui/keys.ts`: `isMac(platform?: string): boolean`, `keyLabel(shortcut: string, mac: boolean): string` (`'Ctrl+S'` → `'⌘S'` on mac), `type Shortcut`.
  - `src/ui/icons.tsx`: named icon components `Menu, Play, Bug, Pause, Square, StepForward, ArrowDownToDot, ArrowUpFromDot, FilePlus, FolderOpen, Save, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Check, X, CircleX, TriangleAlert, Settings, Share2, Copy, Trash2, Ellipsis, Info, LoaderCircle, CircleCheck, BookOpen, ArrowDownToLine, RotateCcw, Hexagon, GripHorizontal, Sun, Moon, Monitor, Download` (each `(props: IconProps) => JSX`), `ICON_SIZE = 16`.
  - `src/ui/Tooltip.tsx`: `TooltipProvider`, `Tooltip({ label, shortcut?, children })`, `IconButton({ label, shortcut?, onClick, disabled?, active?, size?: 'toolbar' | 'dialog', children })` — renders `<button type="button" aria-label={label}>` wrapped in the tooltip.
  - `src/strings.ts`: the complete `Strings` interface (below), `stringsFor(locale)`.
  - `src/store/settings.ts`: `Settings`, `EditorSettings`, `ExecutionSettings`, `AppearanceSettings`, `LayoutSettings`, `SettingsSchema`, `DEFAULT_SETTINGS`, `type SettingsSection = keyof Settings`, `type UiLocale = 'auto' | 'es' | 'en'`.
  - `src/store/document.ts`: `DocumentDraft { name, source, profileId? }`, `FileHandle { readonly name: string }`, `isDirty(state)`, `DEFAULT_NAME_KEY`.
  - `src/store/layout.ts`: `PanelId`, `PANEL_IDS`, `SheetPosition`, `LayoutState { dockview: Record<string, unknown> | null; collapsed: readonly string[]; sheet: SheetPosition }`, `DEFAULT_LAYOUT`, `PanelRequest { id: PanelId; seq: number }`.
  - `src/store/store.ts`: `StoreState` (below), `createEditorStore(host, options)`, selectors `profileOf`, `profileInputOf(state)`, `localeOf`, `uiLocaleOf`, `stringsOf`, `hasErrors`, `hasWarnings`, `canEdit`, `isDirty`, `profileNameOf(state, id)`, `customProfileOf(state, id)`, `PROFILE_IDS`, `DEFAULT_SOURCE`, `DialogName`, `Toast`.
  - `src/store/persist.ts`: `STORAGE_KEY`, `PersistedV1`, `PersistedSchema`, `migrations`, `readPersisted(storage)`, `writePersisted(storage, value)`, `persistedOf(state)`, `applyPersisted(store, persisted)`, `startPersisting(store, storage, options?)`, `StoredDocument`, `documentOf(state)`, `applyDocument(store, doc)`, `readDocument(idb)`, `writeDocument(idb, doc)`, `startDocumentPersisting(store, idb, options?)`, `openDocumentStore()`.
  - `src/shell/autoExpand.ts`: `ExpandEvent { panel: PanelId; reason: 'run' | 'pause' | 'input' }`, `autoExpandTarget(previous, next, showConsoleOnRun): ExpandEvent | null`.
  - `src/version.ts`: `APP_VERSION`.

**`StoreState` after this task** (the 4a fields keep their names):

```ts
export interface StoreState {
  // document
  readonly source: string
  readonly name: string
  readonly savedSource: string
  readonly handle: FileHandle | null
  readonly pendingReplace: DocumentDraft | null
  readonly profileId: string
  readonly customProfiles: readonly ProfileInput[]
  readonly diagnostics: readonly LintDiagnostic[]
  readonly breakpoints: readonly number[]
  readonly cursor: { readonly line: number; readonly column: number }
  // settings + theme
  readonly settings: Settings
  readonly themePreference: ThemePreference
  readonly systemDark: boolean
  readonly theme: Theme
  // runtime (4a)
  readonly state: WorkerState
  readonly output: OutputBuffer
  readonly currentLine: number | null
  readonly frames: readonly Frame[]
  readonly pendingInput: PendingInput | null
  readonly wait: Wait | null
  readonly error: RuntimeError | null
  readonly runSeq: number
  readonly pausedInRun: boolean
  readonly autoScroll: boolean
  // layout + ui
  readonly layout: LayoutState
  readonly layoutReset: number
  readonly panelRequest: PanelRequest | null
  readonly dialog: DialogName | null
  readonly toasts: readonly Toast[]
  // actions
  setSource(source: string): void
  setName(name: string): void
  markSaved(source: string, handle: FileHandle | null): void
  requestReplace(draft: DocumentDraft): void
  applyReplace(): void
  cancelReplace(): void
  setProfile(id: string): void
  saveCustomProfile(input: ProfileInput): void
  deleteCustomProfile(id: string): void
  setDiagnostics(diagnostics: readonly LintDiagnostic[]): void
  setBreakpoints(lines: readonly number[]): void
  setCursor(line: number, column: number): void
  updateSettings<K extends SettingsSection>(section: K, patch: Partial<Settings[K]>): void
  resetSettings(section: SettingsSection): void
  setThemePreference(preference: ThemePreference): void
  setSystemDark(dark: boolean): void
  run(): void
  confirmRun(): void
  stepInto(): void
  stepOver(): void
  stepOut(): void
  continue(): void
  pause(): void
  stop(): void
  submitInput(text: string): void
  clearOutput(): void
  setAutoScroll(on: boolean): void
  setDockLayout(dockview: Record<string, unknown>, collapsed: readonly string[]): void
  setSheet(position: SheetPosition): void
  resetLayout(): void
  requestPanel(id: PanelId): void
  openDialog(name: DialogName): void
  closeDialog(): void
  notify(message: string): void
  dismissToast(id: number): void
}
```

- [ ] **Step 1: Add the dependencies, the catalog entries and the fonts**

```bash
pnpm --filter @stepcode/editor add dockview-react@8.2.0 @radix-ui/react-dialog@1.1.23 @radix-ui/react-dropdown-menu@2.1.24 @radix-ui/react-popover@1.1.23 @radix-ui/react-tooltip@1.2.16 @radix-ui/react-tabs@1.1.21 @radix-ui/react-toast@1.2.23 lucide-react@1.41.0 idb-keyval@6.3.0
pnpm --filter @stepcode/editor add -D fake-indexeddb@6.2.5 vite-plugin-pwa@1.3.0
```

Then edit `packages/editor/package.json` so `zod` is `"zod": "catalog:"` in `dependencies`, and add to `pnpm-workspace.yaml`'s `catalog:` block:

```yaml
  zod: ^4.5.4
```

(`packages/profiles/package.json` already pins `zod` `^4.5.4` directly; leave it.) Run `pnpm install` so the lockfile picks the catalog entry. If `pnpm add` resolves a different patch because of `minimumReleaseAge`, keep what it resolved and note it in the report.

Fonts:

```bash
mkdir -p packages/editor/public/fonts
curl -sSL -o packages/editor/public/fonts/JetBrainsMono-Regular.woff2 https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/webfonts/JetBrainsMono-Regular.woff2
curl -sSL -o packages/editor/public/fonts/JetBrainsMono-Bold.woff2 https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/webfonts/JetBrainsMono-Bold.woff2
curl -sSL -o packages/editor/public/fonts/OFL.txt https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/OFL.txt
ls -l packages/editor/public/fonts   # Regular ≈ 92 KB, Bold ≈ 95 KB, OFL 4.4 KB
```

- [ ] **Step 2: Write the failing tests for tokens, fonts and the tokens-only scan**

Replace the `describe('tokens.css')` block's first two tests in `test/theme.test.ts` with these (keep the contrast and `applyTheme`/`resolveInitialTheme` tests):

```ts
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { HEX_TOKENS, parseTokens, TOKEN_NAMES } from '../src/theme/theme'
import { THEMES } from '../src/theme/types'

const pkgRoot = fileURLToPath(new NodeURL('..', import.meta.url))
const srcRoot = join(pkgRoot, 'src')
const tokens = parseTokens(readFileSync(join(srcRoot, 'theme', 'tokens.css'), 'utf8'))

const NEW_TOKENS = ['accent-soft', 'overlay', 'shadow', 'changed'] as const

describe('tokens.css (4b)', () => {
  it('defines the four shell tokens in both themes', () => {
    expect(TOKEN_NAMES).toHaveLength(28)
    for (const theme of THEMES) {
      for (const name of NEW_TOKENS) expect(tokens[theme][name], `${theme} ${name}`).toBeDefined()
      expect(Object.keys(tokens[theme]).sort()).toEqual([...TOKEN_NAMES].sort())
    }
  })

  it('spells hex tokens as six-digit hex and overlay tokens as rgba', () => {
    for (const theme of THEMES) {
      for (const name of TOKEN_NAMES) {
        const value = tokens[theme][name] ?? ''
        if (HEX_TOKENS.includes(name)) expect(value, name).toMatch(/^#[0-9a-f]{6}$/)
        else expect(value, name).toMatch(/^rgba\(\d+,\s?\d+,\s?\d+,\s?0\.\d+\)$/)
      }
    }
  })
})

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:white|black|red|blue|gray|grey)\b/

describe('tokens only', () => {
  it('has no color literal outside tokens.css', () => {
    const offenders = walk(srcRoot)
      .filter((file) => /\.(tsx?|css)$/.test(file) && !file.endsWith('tokens.css'))
      .filter((file) => COLOR_LITERAL.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(srcRoot.length + 1))
    expect(offenders).toEqual([])
  })
})

describe('fonts', () => {
  it('ships JetBrains Mono with its licence', () => {
    for (const file of ['JetBrainsMono-Regular.woff2', 'JetBrainsMono-Bold.woff2', 'OFL.txt']) {
      expect(statSync(join(pkgRoot, 'public', 'fonts', file)).size).toBeGreaterThan(1000)
    }
    const css = readFileSync(join(srcRoot, 'index.css'), 'utf8')
    expect(css).toContain('@font-face')
    expect(css).toContain('/fonts/JetBrainsMono-Regular.woff2')
    expect(css).toContain('font-variant-ligatures: none')
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/theme.test.ts`
Expected: FAIL — `TOKEN_NAMES` has 24 entries, no `@font-face`.

- [ ] **Step 3: Add the tokens, the font faces and the utilities**

Append to both blocks of `src/theme/tokens.css` (light values first block, dark second):

```css
  /* 4b shell tokens: accent at ~15 %, dialog backdrop, floating shadow, changed-value flash */
  --sc-accent-soft: rgba(64, 120, 242, 0.15);
  --sc-overlay: rgba(56, 58, 66, 0.4);
  --sc-shadow: rgba(56, 58, 66, 0.2);
  --sc-changed: #fdf3c7;
```

```css
  --sc-accent-soft: rgba(97, 175, 239, 0.15);
  --sc-overlay: rgba(24, 26, 31, 0.6);
  --sc-shadow: rgba(0, 0, 0, 0.45);
  --sc-changed: #4a4321;
```

In `src/theme/theme.ts` append `'accent-soft', 'overlay', 'shadow', 'changed'` to `TOKEN_NAMES` and change `HEX_TOKENS` to:

```ts
const OVERLAY_TOKENS: ReadonlySet<string> = new Set([
  'line',
  'current-line',
  'accent-soft',
  'overlay',
  'shadow',
])

/** Tokens that are opaque hex colors; the others are translucent overlays. */
export const HEX_TOKENS: readonly TokenName[] = TOKEN_NAMES.filter(
  (name) => !OVERLAY_TOKENS.has(name),
)
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
@import "./theme/tokens.css";

@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
}

@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/JetBrainsMono-Bold.woff2") format("woff2");
}

/* Spec §2.3: chrome colors are the tokens, never a literal. */
@theme inline {
  --color-bg: var(--sc-bg);
  --color-surface: var(--sc-surface);
  --color-surface-raised: var(--sc-surface-raised);
  --color-border: var(--sc-border);
  --color-fg: var(--sc-fg);
  --color-muted: var(--sc-fg-muted);
  --color-accent: var(--sc-accent);
  --color-accent-soft: var(--sc-accent-soft);
  --color-selection: var(--sc-selection);
  --color-error: var(--sc-error);
  --color-warning: var(--sc-warning);
  --color-success: var(--sc-success);
  --color-overlay: var(--sc-overlay);
  --color-changed: var(--sc-changed);
  --shadow-panel: 0 8px 24px var(--sc-shadow);
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  --ease-shell: cubic-bezier(0.2, 0, 0, 1);
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
    font-family: var(--font-sans);
  }

  code,
  pre,
  .cm-editor {
    font-family: var(--font-mono);
    font-variant-ligatures: none;
  }

  :focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 1px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition-duration: 0ms !important;
      animation-duration: 0ms !important;
    }
  }
}
```

Also in `src/theme/types.ts`:

```ts
export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

export const THEMES: readonly Theme[] = ['light', 'dark']
export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark']
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/theme.test.ts`
Expected: PASS (the contrast test only iterates `HEX_TOKENS` that exist in the contrast table; `changed` is a background, add it to that test's exempt set alongside comments and muted).

- [ ] **Step 4: Write the failing strings test**

Replace `test/strings.test.ts` with:

```ts
import { describe, expect, it } from 'vitest'
import { stringsFor } from '../src/strings'

function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix === '' ? key : `${prefix}.${key}`),
  )
}

describe('stringsFor', () => {
  it('returns Spanish for es and English for en', () => {
    expect(stringsFor('es').toolbar.run).toBe('Ejecutar')
    expect(stringsFor('en').toolbar.run).toBe('Run')
    expect(stringsFor('es').status.pausedAt(12)).toBe('En pausa en la línea 12')
    expect(stringsFor('en').status.problems(2, 1)).toBe('✖ 2  ▲ 1')
    expect(stringsFor('es').confirmSave.title('a.stepcode')).toBe('¿Guardar los cambios de a.stepcode?')
    expect(stringsFor('es').app.untitled).toBe('sin título.stepcode')
  })

  it('falls back by primary subtag, then to es', () => {
    expect(stringsFor('en-US').toolbar.run).toBe('Run')
    expect(stringsFor('pt-BR')).toBe(stringsFor('es'))
    expect(stringsFor('')).toBe(stringsFor('es'))
  })

  it('has the same key set in both locales', () => {
    expect(keysOf(stringsFor('en')).sort()).toEqual(keysOf(stringsFor('es')).sort())
  })

  it('names every builtin profile, panel, dialog and worker state', () => {
    for (const locale of ['es', 'en']) {
      const s = stringsFor(locale)
      for (const id of ['es', 'en', 'pseint']) expect(s.profiles[id]?.length).toBeGreaterThan(0)
      for (const panel of ['editor', 'console', 'problems', 'variables'] as const) {
        expect(s.panels[panel].length).toBeGreaterThan(0)
      }
      for (const state of ['ready', 'running', 'paused', 'input', 'waiting', 'done', 'error'] as const) {
        expect(s.states[state].length).toBeGreaterThan(0)
      }
    }
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/strings.test.ts`
Expected: FAIL — `status`, `confirmSave`, `profiles`, `panels` missing.

- [ ] **Step 5: Write the complete strings table**

Replace `src/strings.ts` with the following. It keeps every 4a key (the 4a components still compile) and adds every string the spec names. `en` mirrors `es` key for key.

```ts
import type { SymbolKind } from 'stepcode'
import type { WorkerState } from './runtime/protocol'

export type PanelKey = 'editor' | 'console' | 'problems' | 'variables'

/** Every human string the editor renders. Diagnostics come formatted from the language package. */
export interface Strings {
  readonly app: {
    readonly title: string
    readonly editor: string
    readonly untitled: string
    readonly shared: string
    /** Browser tab title: `● name · StepCode` when dirty. */
    readonly windowTitle: (name: string, dirty: boolean) => string
  }
  readonly profiles: Readonly<Record<string, string>>
  readonly panels: Readonly<Record<PanelKey, string>>
  readonly toolbar: {
    readonly menu: string
    readonly run: string
    readonly debug: string
    readonly continue: string
    readonly step: string
    readonly stepOver: string
    readonly stepInto: string
    readonly stepOut: string
    readonly pause: string
    readonly stop: string
    readonly new: string
    readonly open: string
    readonly save: string
    readonly saveAs: string
    readonly more: string
    readonly filename: string
    readonly profile: string
    readonly toLight: string
    readonly toDark: string
    readonly errors: (count: number) => string
    readonly warnings: (count: number) => string
  }
  readonly menu: {
    readonly examples: string
    readonly share: string
    readonly profile: string
    readonly customize: string
    readonly view: string
    readonly resetLayout: string
    readonly settings: string
    readonly about: string
  }
  readonly states: Readonly<Record<WorkerState, string>>
  readonly status: {
    readonly position: (line: number, column: number) => string
    readonly noProblems: string
    readonly problems: (errors: number, warnings: number) => string
    readonly ready: string
    readonly running: string
    readonly pausedAt: (line: number) => string
    readonly waitingInput: string
    readonly waiting: string
    readonly done: string
    readonly errorAt: (line: number) => string
    readonly cursor: string
    readonly state: string
  }
  readonly dock: {
    readonly collapse: string
    readonly expand: string
    readonly float: string
    readonly popout: string
  }
  readonly console: {
    readonly title: string
    readonly clear: string
    readonly autoScroll: string
    readonly read: (name: string, type: string) => string
    readonly pressKey: string
    readonly placeholder: string
    readonly submit: string
    readonly waiting: (millis: number) => string
    readonly errorAt: (line: number, message: string) => string
    readonly dropped: (count: number) => string
    readonly finished: string
    readonly seeLine: (line: number) => string
  }
  readonly variables: {
    readonly title: string
    readonly empty: string
    readonly pauseToSee: string
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
    readonly error: string
    readonly warning: string
    readonly line: (line: number) => string
  }
  readonly kinds: Readonly<Record<SymbolKind, string>>
  readonly dialog: {
    readonly close: string
    readonly cancel: string
    readonly ok: string
  }
  readonly confirmSave: {
    readonly title: (name: string) => string
    readonly body: string
    readonly save: string
    readonly discard: string
  }
  readonly warnings: {
    readonly title: string
    readonly body: string
    readonly runAnyway: string
  }
  readonly examples: {
    readonly title: string
    readonly search: string
    readonly empty: string
    readonly load: string
    readonly topics: Readonly<Record<string, string>>
  }
  readonly share: {
    readonly title: string
    readonly link: string
    readonly copy: string
    readonly copied: string
    readonly open: string
    readonly note: string
    readonly tooLong: string
    readonly unknownProfile: string
  }
  readonly about: {
    readonly title: string
    readonly tagline: string
    readonly version: (version: string) => string
    readonly repository: string
    readonly academy: string
    readonly licence: string
  }
  readonly settings: {
    readonly title: string
    readonly reset: string
    readonly sections: Readonly<Record<'language' | 'editor' | 'execution' | 'appearance' | 'layout', string>>
    readonly language: {
      readonly profile: string
      readonly customize: string
      readonly builder: string
      readonly base: string
      readonly name: string
      readonly nameHint: string
      readonly keywords: string
      readonly types: string
      readonly operators: string
      readonly builtins: string
      readonly options: string
      readonly spellingsHint: string
      readonly preview: string
      readonly save: string
      readonly delete: string
      readonly duplicate: string
      readonly invalid: (message: string) => string
      readonly option: Readonly<
        Record<
          | 'indexBase'
          | 'caseSensitive'
          | 'foldAccents'
          | 'implicitDeclarations'
          | 'requireSemicolons'
          | 'typedParameters'
          | 'assignWithEquals',
          string
        >
      >
    }
    readonly editor: {
      readonly fontSize: string
      readonly lineNumbers: string
      readonly wordWrap: string
      readonly autocomplete: string
      readonly tabSize: string
      readonly highlightLine: string
    }
    readonly execution: {
      readonly warnOnWarnings: string
      readonly clearConsoleOnRun: string
    }
    readonly appearance: {
      readonly theme: string
      readonly system: string
      readonly light: string
      readonly dark: string
      readonly uiLanguage: string
      readonly auto: string
      readonly spanish: string
      readonly english: string
    }
    readonly layout: {
      readonly reset: string
      readonly showConsoleOnRun: string
    }
  }
  readonly files: {
    readonly saved: string
    readonly downloaded: string
    readonly openFailed: string
    readonly saveFailed: string
    readonly accept: string
  }
  readonly pwa: {
    readonly updateAvailable: string
    readonly reload: string
  }
  readonly mobile: {
    readonly sheet: string
    readonly symbols: string
    readonly moreActions: string
  }
  readonly host: {
    readonly workerError: string
  }
}

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

const es: Strings = {
  app: {
    title: 'StepCode',
    editor: 'Editor',
    untitled: 'sin título.stepcode',
    shared: 'compartido.stepcode',
    windowTitle: (name, dirty) => `${dirty ? '● ' : ''}${name} · StepCode`,
  },
  profiles: { es: 'Español', en: 'English', pseint: 'PSeInt' },
  panels: { editor: 'Editor', console: 'Consola', problems: 'Problemas', variables: 'Variables' },
  toolbar: {
    menu: 'Menú',
    run: 'Ejecutar',
    debug: 'Depurar',
    continue: 'Continuar',
    step: 'Paso',
    stepOver: 'Paso',
    stepInto: 'Entrar',
    stepOut: 'Salir',
    pause: 'Pausar',
    stop: 'Detener',
    new: 'Nuevo',
    open: 'Abrir…',
    save: 'Guardar',
    saveAs: 'Guardar como…',
    more: 'Más acciones',
    filename: 'Nombre del archivo',
    profile: 'Perfil',
    toLight: 'Tema claro',
    toDark: 'Tema oscuro',
    errors: (count) => plural(count, 'error', 'errores'),
    warnings: (count) => plural(count, 'advertencia', 'advertencias'),
  },
  menu: {
    examples: 'Ejemplos…',
    share: 'Compartir…',
    profile: 'Perfil',
    customize: 'Personalizar…',
    view: 'Vista',
    resetLayout: 'Restablecer diseño',
    settings: 'Ajustes…',
    about: 'Acerca de',
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
  status: {
    position: (line, column) => `Ln ${line}, Col ${column}`,
    noProblems: '✓ Sin problemas',
    problems: (errors, warnings) => `✖ ${errors}  ▲ ${warnings}`,
    ready: 'Listo',
    running: 'Ejecutando…',
    pausedAt: (line) => `En pausa en la línea ${line}`,
    waitingInput: 'Esperando entrada',
    waiting: 'Esperando…',
    done: 'Terminado',
    errorAt: (line) => `Error en la línea ${line}`,
    cursor: 'Posición del cursor',
    state: 'Estado',
  },
  dock: { collapse: 'Contraer', expand: 'Expandir', float: 'Flotar', popout: 'Abrir en ventana' },
  console: {
    title: 'Consola',
    clear: 'Limpiar',
    autoScroll: 'Desplazamiento automático',
    read: (name, type) => `Leer ${name} (${type})`,
    pressKey: 'Presiona una tecla',
    placeholder: 'Escribe y presiona Enter',
    submit: 'Enviar',
    waiting: (millis) => `Esperando ${millis} ms`,
    errorAt: (line, message) => `Línea ${line}: ${message}`,
    dropped: (count) => `… ${count} fragmentos descartados`,
    finished: '— Programa terminado —',
    seeLine: (line) => `ver línea ${line}`,
  },
  variables: {
    title: 'Variables',
    empty: 'Sin programa en ejecución',
    pauseToSee: 'Pausa el programa para ver las variables',
    name: 'Nombre',
    kind: 'Clase',
    type: 'Tipo',
    value: 'Valor',
    unassigned: '—',
    frameAt: (name, line) => `${name} · línea ${line}`,
    arrayOf: (element, rank) =>
      rank === 1 ? `Arreglo de ${element}` : `Arreglo de ${element} (${rank}D)`,
    more: (count) => `… (+${count})`,
  },
  problems: {
    title: 'Problemas',
    empty: 'Sin problemas',
    summary: (errors, warnings) =>
      `${plural(errors, 'error', 'errores')}, ${plural(warnings, 'advertencia', 'advertencias')}`,
    error: 'error',
    warning: 'advertencia',
    line: (line) => `línea ${line}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
  dialog: { close: 'Cerrar', cancel: 'Cancelar', ok: 'Aceptar' },
  confirmSave: {
    title: (name) => `¿Guardar los cambios de ${name}?`,
    body: 'Si no los guardas, se perderán.',
    save: 'Guardar',
    discard: 'No guardar',
  },
  warnings: {
    title: 'El programa tiene advertencias',
    body: 'Puedes ejecutarlo igualmente o revisarlas primero.',
    runAnyway: 'Ejecutar igualmente',
  },
  examples: {
    title: 'Ejemplos',
    search: 'Buscar ejemplos',
    empty: 'Ningún ejemplo coincide',
    load: 'Abrir ejemplo',
    topics: {
      'primeros-pasos': 'Primeros pasos',
      condicionales: 'Condicionales',
      ciclos: 'Ciclos',
      arreglos: 'Arreglos',
      funciones: 'Funciones',
      'un-poco-mas': 'Un poco más',
    },
  },
  share: {
    title: 'Compartir',
    link: 'Enlace',
    copy: 'Copiar',
    copied: 'Enlace copiado',
    open: 'Abrir en nueva pestaña',
    note: 'El programa viaja dentro del enlace; no se guarda en ningún servidor.',
    tooLong: 'El enlace es muy largo; algunas aplicaciones lo recortan.',
    unknownProfile: 'El enlace usa un perfil que no existe aquí; se abrió con Español.',
  },
  about: {
    title: 'Acerca de',
    tagline: 'Editor de pseudocódigo',
    version: (version) => `Versión ${version}`,
    repository: 'Repositorio',
    academy: 'Academia',
    licence: 'Licencia MIT',
  },
  settings: {
    title: 'Ajustes',
    reset: 'Restablecer',
    sections: {
      language: 'Lenguaje',
      editor: 'Editor',
      execution: 'Ejecución',
      appearance: 'Apariencia',
      layout: 'Diseño',
    },
    language: {
      profile: 'Perfil',
      customize: 'Personalizar…',
      builder: 'Perfil personalizado',
      base: 'Basado en',
      name: 'Nombre',
      nameHint: 'Solo letras, números y guiones',
      keywords: 'Palabras clave',
      types: 'Tipos',
      operators: 'Operadores',
      builtins: 'Funciones',
      options: 'Opciones',
      spellingsHint: 'Separa alternativas con comas; la primera es la principal',
      preview: 'Vista previa',
      save: 'Guardar perfil',
      delete: 'Eliminar perfil',
      duplicate: 'Ya existe un perfil con ese nombre',
      invalid: (message) => `Perfil inválido: ${message}`,
      option: {
        indexBase: 'Arreglos empiezan en 1',
        caseSensitive: 'Distinguir mayúsculas',
        foldAccents: 'Ignorar acentos',
        implicitDeclarations: 'Declaraciones implícitas',
        requireSemicolons: 'Exigir punto y coma',
        typedParameters: 'Parámetros con tipo',
        assignWithEquals: 'Asignar con =',
      },
    },
    editor: {
      fontSize: 'Tamaño de letra',
      lineNumbers: 'Números de línea',
      wordWrap: 'Ajustar líneas',
      autocomplete: 'Autocompletar',
      tabSize: 'Tamaño de tabulación',
      highlightLine: 'Resaltar la línea actual',
    },
    execution: {
      warnOnWarnings: 'Avisar antes de ejecutar con advertencias',
      clearConsoleOnRun: 'Limpiar la consola al ejecutar',
    },
    appearance: {
      theme: 'Tema',
      system: 'Sistema',
      light: 'Claro',
      dark: 'Oscuro',
      uiLanguage: 'Idioma de la interfaz',
      auto: 'Automático',
      spanish: 'Español',
      english: 'English',
    },
    layout: { reset: 'Restablecer diseño', showConsoleOnRun: 'Mostrar la consola al ejecutar' },
  },
  files: {
    saved: 'Guardado',
    downloaded: 'Descargado',
    openFailed: 'No se pudo abrir el archivo',
    saveFailed: 'No se pudo guardar el archivo',
    accept: 'Programas StepCode',
  },
  pwa: { updateAvailable: 'Hay una versión nueva', reload: 'Recargar' },
  mobile: { sheet: 'Paneles', symbols: 'Símbolos', moreActions: 'Más acciones' },
  host: { workerError: 'Error interno del intérprete' },
}

const en: Strings = {
  app: {
    title: 'StepCode',
    editor: 'Editor',
    untitled: 'untitled.stepcode',
    shared: 'shared.stepcode',
    windowTitle: (name, dirty) => `${dirty ? '● ' : ''}${name} · StepCode`,
  },
  profiles: { es: 'Español', en: 'English', pseint: 'PSeInt' },
  panels: { editor: 'Editor', console: 'Console', problems: 'Problems', variables: 'Variables' },
  toolbar: {
    menu: 'Menu',
    run: 'Run',
    debug: 'Debug',
    continue: 'Continue',
    step: 'Step',
    stepOver: 'Step over',
    stepInto: 'Step into',
    stepOut: 'Step out',
    pause: 'Pause',
    stop: 'Stop',
    new: 'New',
    open: 'Open…',
    save: 'Save',
    saveAs: 'Save as…',
    more: 'More actions',
    filename: 'File name',
    profile: 'Profile',
    toLight: 'Light theme',
    toDark: 'Dark theme',
    errors: (count) => plural(count, 'error', 'errors'),
    warnings: (count) => plural(count, 'warning', 'warnings'),
  },
  menu: {
    examples: 'Examples…',
    share: 'Share…',
    profile: 'Profile',
    customize: 'Customize…',
    view: 'View',
    resetLayout: 'Reset layout',
    settings: 'Settings…',
    about: 'About',
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
  status: {
    position: (line, column) => `Ln ${line}, Col ${column}`,
    noProblems: '✓ No problems',
    problems: (errors, warnings) => `✖ ${errors}  ▲ ${warnings}`,
    ready: 'Ready',
    running: 'Running…',
    pausedAt: (line) => `Paused at line ${line}`,
    waitingInput: 'Waiting for input',
    waiting: 'Waiting…',
    done: 'Done',
    errorAt: (line) => `Error at line ${line}`,
    cursor: 'Cursor position',
    state: 'State',
  },
  dock: { collapse: 'Collapse', expand: 'Expand', float: 'Float', popout: 'Open in window' },
  console: {
    title: 'Console',
    clear: 'Clear',
    autoScroll: 'Auto-scroll',
    read: (name, type) => `Read ${name} (${type})`,
    pressKey: 'Press a key',
    placeholder: 'Type and press Enter',
    submit: 'Send',
    waiting: (millis) => `Waiting ${millis} ms`,
    errorAt: (line, message) => `Line ${line}: ${message}`,
    dropped: (count) => `… ${count} chunks dropped`,
    finished: '— Program finished —',
    seeLine: (line) => `see line ${line}`,
  },
  variables: {
    title: 'Variables',
    empty: 'No program running',
    pauseToSee: 'Pause the program to see its variables',
    name: 'Name',
    kind: 'Kind',
    type: 'Type',
    value: 'Value',
    unassigned: '—',
    frameAt: (name, line) => `${name} · line ${line}`,
    arrayOf: (element, rank) =>
      rank === 1 ? `Array of ${element}` : `Array of ${element} (${rank}D)`,
    more: (count) => `… (+${count})`,
  },
  problems: {
    title: 'Problems',
    empty: 'No problems',
    summary: (errors, warnings) =>
      `${plural(errors, 'error', 'errors')}, ${plural(warnings, 'warning', 'warnings')}`,
    error: 'error',
    warning: 'warning',
    line: (line) => `line ${line}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
  dialog: { close: 'Close', cancel: 'Cancel', ok: 'OK' },
  confirmSave: {
    title: (name) => `Save changes to ${name}?`,
    body: 'Unsaved changes will be lost.',
    save: 'Save',
    discard: "Don't save",
  },
  warnings: {
    title: 'The program has warnings',
    body: 'You can run it anyway or review them first.',
    runAnyway: 'Run anyway',
  },
  examples: {
    title: 'Examples',
    search: 'Search examples',
    empty: 'No example matches',
    load: 'Open example',
    topics: {
      'primeros-pasos': 'First steps',
      condicionales: 'Conditionals',
      ciclos: 'Loops',
      arreglos: 'Arrays',
      funciones: 'Functions',
      'un-poco-mas': 'A bit more',
    },
  },
  share: {
    title: 'Share',
    link: 'Link',
    copy: 'Copy',
    copied: 'Link copied',
    open: 'Open in new tab',
    note: 'The program travels inside the link; nothing is stored on a server.',
    tooLong: 'The link is very long; some apps truncate it.',
    unknownProfile: 'The link uses a profile that does not exist here; opened with Español.',
  },
  about: {
    title: 'About',
    tagline: 'Pseudocode editor',
    version: (version) => `Version ${version}`,
    repository: 'Repository',
    academy: 'Academy',
    licence: 'MIT licence',
  },
  settings: {
    title: 'Settings',
    reset: 'Reset',
    sections: {
      language: 'Language',
      editor: 'Editor',
      execution: 'Execution',
      appearance: 'Appearance',
      layout: 'Layout',
    },
    language: {
      profile: 'Profile',
      customize: 'Customize…',
      builder: 'Custom profile',
      base: 'Based on',
      name: 'Name',
      nameHint: 'Letters, digits and hyphens only',
      keywords: 'Keywords',
      types: 'Types',
      operators: 'Operators',
      builtins: 'Functions',
      options: 'Options',
      spellingsHint: 'Separate alternatives with commas; the first is primary',
      preview: 'Preview',
      save: 'Save profile',
      delete: 'Delete profile',
      duplicate: 'A profile with that name already exists',
      invalid: (message) => `Invalid profile: ${message}`,
      option: {
        indexBase: 'Arrays start at 1',
        caseSensitive: 'Case sensitive',
        foldAccents: 'Ignore accents',
        implicitDeclarations: 'Implicit declarations',
        requireSemicolons: 'Require semicolons',
        typedParameters: 'Typed parameters',
        assignWithEquals: 'Assign with =',
      },
    },
    editor: {
      fontSize: 'Font size',
      lineNumbers: 'Line numbers',
      wordWrap: 'Word wrap',
      autocomplete: 'Autocomplete',
      tabSize: 'Tab size',
      highlightLine: 'Highlight current line',
    },
    execution: {
      warnOnWarnings: 'Warn before running with warnings',
      clearConsoleOnRun: 'Clear the console on run',
    },
    appearance: {
      theme: 'Theme',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      uiLanguage: 'Interface language',
      auto: 'Automatic',
      spanish: 'Español',
      english: 'English',
    },
    layout: { reset: 'Reset layout', showConsoleOnRun: 'Show the console on run' },
  },
  files: {
    saved: 'Saved',
    downloaded: 'Downloaded',
    openFailed: 'The file could not be opened',
    saveFailed: 'The file could not be saved',
    accept: 'StepCode programs',
  },
  pwa: { updateAvailable: 'A new version is available', reload: 'Reload' },
  mobile: { sheet: 'Panels', symbols: 'Symbols', moreActions: 'More actions' },
  host: { workerError: 'Internal interpreter error' },
}

const tables: Readonly<Record<string, Strings>> = { es, en }

/** Spec §11: by primary subtag; anything unknown is Spanish, the editor's home locale. */
export function stringsFor(locale: string): Strings {
  const primary = locale.toLowerCase().split('-')[0] ?? ''
  return tables[primary] ?? es
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/strings.test.ts`
Expected: PASS.

- [ ] **Step 6: Write the failing tests for `keys.ts` and `Tooltip.tsx`**

`test/keys.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isMac, keyLabel } from '../src/ui/keys'

describe('keys', () => {
  it('detects macOS from the platform string', () => {
    expect(isMac('MacIntel')).toBe(true)
    expect(isMac('Win32')).toBe(false)
    expect(isMac(undefined)).toBe(false)
  })

  it('renders shortcuts per platform', () => {
    expect(keyLabel('Ctrl+S', false)).toBe('Ctrl+S')
    expect(keyLabel('Ctrl+S', true)).toBe('⌘S')
    expect(keyLabel('Ctrl+Shift+S', true)).toBe('⇧⌘S')
    expect(keyLabel('Shift+F5', true)).toBe('⇧F5')
    expect(keyLabel('F5', true)).toBe('F5')
    expect(keyLabel('Ctrl+,', false)).toBe('Ctrl+,')
  })
})
```

`test/Tooltip.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Play } from '../src/ui/icons'
import { IconButton, TooltipProvider } from '../src/ui/Tooltip'

describe('IconButton', () => {
  it('is a labelled button that fires onClick and honours disabled', () => {
    const onClick = vi.fn()
    render(
      <TooltipProvider>
        <IconButton label="Ejecutar" shortcut="F5" onClick={onClick}>
          <Play />
        </IconButton>
        <IconButton label="Detener" onClick={onClick} disabled>
          <Play />
        </IconButton>
      </TooltipProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Detener' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Ejecutar' }).getAttribute('type')).toBe('button')
  })

  it('shows the label and the shortcut in the tooltip on focus', async () => {
    render(
      <TooltipProvider>
        <IconButton label="Ejecutar" shortcut="F5" onClick={() => {}}>
          <Play />
        </IconButton>
      </TooltipProvider>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(await screen.findByRole('tooltip')).toHaveProperty('textContent', 'Ejecutar · F5')
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/keys.test.ts packages/editor/test/Tooltip.test.tsx`
Expected: FAIL — modules missing.

- [ ] **Step 7: Write `keys.ts`, `icons.tsx`, `Tooltip.tsx`**

`src/ui/keys.ts`:

```ts
/** Spec §2.2: `⌘` on macOS, `Ctrl` elsewhere, decided once from the platform string. */
export function isMac(platform: string | undefined = globalThis.navigator?.platform): boolean {
  return platform !== undefined && /mac/i.test(platform)
}

const MAC_GLYPHS: Readonly<Record<string, string>> = { Ctrl: '⌘', Shift: '⇧', Alt: '⌥' }

/** `'Ctrl+Shift+S'` → `'⇧⌘S'` on mac (modifiers in the platform's order), unchanged elsewhere. */
export function keyLabel(shortcut: string, mac: boolean): string {
  if (!mac) return shortcut
  const parts = shortcut.split('+')
  const key = parts.pop() ?? ''
  const modifiers = parts.map((part) => MAC_GLYPHS[part] ?? part)
  const ordered = ['⌥', '⇧', '⌘'].filter((glyph) => modifiers.includes(glyph))
  return `${ordered.join('')}${key}`
}
```

`src/ui/icons.tsx` (the only file that imports `lucide-react`):

```tsx
import type { LucideProps } from 'lucide-react'
import * as lucide from 'lucide-react'
import type { JSX } from 'react'

export const ICON_SIZE = 16

export type IconProps = Omit<LucideProps, 'size' | 'strokeWidth'> & { readonly size?: number }

// Spec §2.2: 16 px, stroke 1.75, currentColor, decorative by default (the button carries the name).
function icon(Component: (props: LucideProps) => JSX.Element) {
  return ({ size = ICON_SIZE, ...rest }: IconProps) => (
    <Component size={size} strokeWidth={1.75} aria-hidden="true" {...rest} />
  )
}

export const ArrowDownToDot = icon(lucide.ArrowDownToDot)
export const ArrowDownToLine = icon(lucide.ArrowDownToLine)
export const ArrowUpFromDot = icon(lucide.ArrowUpFromDot)
export const BookOpen = icon(lucide.BookOpen)
export const Bug = icon(lucide.Bug)
export const Check = icon(lucide.Check)
export const ChevronDown = icon(lucide.ChevronDown)
export const ChevronLeft = icon(lucide.ChevronLeft)
export const ChevronRight = icon(lucide.ChevronRight)
export const ChevronUp = icon(lucide.ChevronUp)
export const CircleCheck = icon(lucide.CircleCheck)
export const CircleX = icon(lucide.CircleX)
export const Copy = icon(lucide.Copy)
export const Download = icon(lucide.Download)
export const Ellipsis = icon(lucide.Ellipsis)
export const FilePlus = icon(lucide.FilePlus)
export const FolderOpen = icon(lucide.FolderOpen)
export const GripHorizontal = icon(lucide.GripHorizontal)
export const Hexagon = icon(lucide.Hexagon)
export const Info = icon(lucide.Info)
export const LoaderCircle = icon(lucide.LoaderCircle)
export const Menu = icon(lucide.Menu)
export const Monitor = icon(lucide.Monitor)
export const Moon = icon(lucide.Moon)
export const Pause = icon(lucide.Pause)
export const Play = icon(lucide.Play)
export const RotateCcw = icon(lucide.RotateCcw)
export const Save = icon(lucide.Save)
export const Settings = icon(lucide.Settings)
export const Share2 = icon(lucide.Share2)
export const Square = icon(lucide.Square)
export const StepForward = icon(lucide.StepForward)
export const Sun = icon(lucide.Sun)
export const Trash2 = icon(lucide.Trash2)
export const TriangleAlert = icon(lucide.TriangleAlert)
export const X = icon(lucide.X)
```

(Vite tree-shakes the namespace import to the icons used; if the production bundle analysis shows the whole icon set, switch to named imports — the public surface stays the same.)

`src/ui/Tooltip.tsx`:

```tsx
import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'
import { isMac, keyLabel } from './keys'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={400}>{children}</RadixTooltip.Provider>
}

export function tooltipText(label: string, shortcut?: string): string {
  return shortcut === undefined ? label : `${label} · ${keyLabel(shortcut, isMac())}`
}

/** Spec §2.2: "Label · Shortcut", pointer devices only (touch gets the aria-label alone). */
export function Tooltip({
  label,
  shortcut,
  children,
}: {
  label: string
  shortcut?: string
  children: ReactNode
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="bottom"
          sideOffset={6}
          className="pointer-events-none z-50 rounded bg-surface-raised px-2 py-1 text-fg text-xs shadow-panel [@media(hover:none)]:hidden"
        >
          {tooltipText(label, shortcut)}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

const SIZES = { toolbar: 'h-7 w-7', dialog: 'h-8 w-8' } as const

export function IconButton({
  label,
  shortcut,
  onClick,
  disabled = false,
  active = false,
  size = 'toolbar',
  children,
}: {
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  size?: keyof typeof SIZES
  children: ReactNode
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active ? true : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex ${SIZES[size]} items-center justify-center rounded text-fg transition-colors duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-accent-soft text-accent' : ''}`}
    >
      {children}
    </button>
  )
  return shortcut === undefined && label === '' ? (
    button
  ) : (
    <Tooltip label={label} {...(shortcut === undefined ? {} : { shortcut })}>
      {button}
    </Tooltip>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/keys.test.ts packages/editor/test/Tooltip.test.tsx`
Expected: PASS.

- [ ] **Step 8: Write the failing tests for the store slices**

`test/settings.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, SettingsSchema } from '../src/store/settings'

describe('settings', () => {
  it('has the spec defaults', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      editor: {
        fontSize: 14,
        lineNumbers: true,
        wordWrap: false,
        autocomplete: true,
        tabSize: 4,
        highlightLine: true,
      },
      execution: { warnOnWarnings: true, clearConsoleOnRun: true },
      appearance: { theme: 'system', uiLocale: 'auto' },
      layout: { showConsoleOnRun: true },
    })
  })

  it('validates and rejects out-of-range values', () => {
    expect(SettingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true)
    const bad = { ...DEFAULT_SETTINGS, editor: { ...DEFAULT_SETTINGS.editor, fontSize: 40 } }
    expect(SettingsSchema.safeParse(bad).success).toBe(false)
    const tab = { ...DEFAULT_SETTINGS, editor: { ...DEFAULT_SETTINGS.editor, tabSize: 3 } }
    expect(SettingsSchema.safeParse(tab).success).toBe(false)
  })
})
```

`test/document.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isDirty, nameWithExtension } from '../src/store/document'

describe('document', () => {
  it('is dirty when the text differs from the last saved text', () => {
    expect(isDirty({ source: 'a', savedSource: 'a' })).toBe(false)
    expect(isDirty({ source: 'a ', savedSource: 'a' })).toBe(true)
  })

  it('appends .stepcode when a name has no extension', () => {
    expect(nameWithExtension('hola')).toBe('hola.stepcode')
    expect(nameWithExtension('hola.psc')).toBe('hola.psc')
    expect(nameWithExtension('  ')).toBe('')
  })
})
```

`test/layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT, PANEL_IDS } from '../src/store/layout'

describe('layout state', () => {
  it('starts with no dockview JSON, nothing collapsed and the sheet collapsed', () => {
    expect(DEFAULT_LAYOUT).toEqual({ dockview: null, collapsed: [], sheet: 'collapsed' })
    expect(PANEL_IDS).toEqual(['editor', 'console', 'problems', 'variables'])
  })
})
```

`test/autoExpand.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { autoExpandTarget, type ExpandInput } from '../src/shell/autoExpand'

const idle: ExpandInput = { runSeq: 0, pausedInRun: false, pendingInput: null }

describe('autoExpandTarget', () => {
  it('opens the console when a run starts, unless the setting is off', () => {
    const next = { ...idle, runSeq: 1 }
    expect(autoExpandTarget(idle, next, true)).toEqual({ panel: 'console', reason: 'run' })
    expect(autoExpandTarget(idle, next, false)).toBeNull()
  })

  it('opens variables on the first pause of a run only', () => {
    const paused = { ...idle, runSeq: 1, pausedInRun: true }
    expect(autoExpandTarget({ ...idle, runSeq: 1 }, paused, true)).toEqual({
      panel: 'variables',
      reason: 'pause',
    })
    expect(autoExpandTarget(paused, paused, true)).toBeNull()
  })

  it('opens the console when input is requested', () => {
    const input = { ...idle, runSeq: 1, pendingInput: { line: 3, target: null } }
    expect(autoExpandTarget({ ...idle, runSeq: 1 }, input, true)).toEqual({
      panel: 'console',
      reason: 'input',
    })
    expect(autoExpandTarget(input, input, true)).toBeNull()
  })

  it('reports nothing when nothing changed', () => {
    expect(autoExpandTarget(idle, idle, true)).toBeNull()
  })
})
```

Add to `test/store.test.ts` (keep the 4a tests, adjusting `setTheme(...)` calls to `setThemePreference(...)` and the `theme` expectations accordingly):

```ts
describe('store (4b slices)', () => {
  it('starts with the starter document, es profile, defaults and a collapsed layout', () => {
    const { store } = setup()
    const s = store.getState()
    expect(s.name).toBe('sin título.stepcode')
    expect(s.savedSource).toBe(s.source)
    expect(s.handle).toBeNull()
    expect(s.settings).toEqual(DEFAULT_SETTINGS)
    expect(s.themePreference).toBe('system')
    expect(s.layout).toEqual(DEFAULT_LAYOUT)
    expect(s.dialog).toBeNull()
    expect(isDirty(s)).toBe(false)
  })

  it('resolves the theme from the preference and the system', () => {
    const { store, applied } = setup()
    store.getState().setSystemDark(true)
    expect(store.getState().theme).toBe('dark')
    store.getState().setThemePreference('light')
    expect(store.getState().theme).toBe('light')
    store.getState().setThemePreference('system')
    expect(store.getState().theme).toBe('dark')
    expect(applied).toEqual(['dark', 'light', 'dark'])
  })

  it('replaces the document directly when clean and parks it when dirty', () => {
    const { store } = setup()
    store.getState().requestReplace({ name: 'a.stepcode', source: 'Proceso A\nFinProceso\n' })
    expect(store.getState().name).toBe('a.stepcode')
    expect(store.getState().pendingReplace).toBeNull()
    store.getState().setSource('Proceso B\nFinProceso\n')
    expect(isDirty(store.getState())).toBe(true)
    store.getState().requestReplace({ name: 'c.stepcode', source: 'x' })
    expect(store.getState().name).toBe('a.stepcode')
    expect(store.getState().dialog).toBe('confirmSave')
    expect(store.getState().pendingReplace?.name).toBe('c.stepcode')
    store.getState().applyReplace()
    expect(store.getState().name).toBe('c.stepcode')
    expect(store.getState().source).toBe('x')
    expect(store.getState().dialog).toBeNull()
    expect(store.getState().breakpoints).toEqual([])
  })

  it('cancels a parked replacement', () => {
    const { store } = setup()
    store.getState().setSource('changed')
    store.getState().requestReplace({ name: 'c.stepcode', source: 'x' })
    store.getState().cancelReplace()
    expect(store.getState().pendingReplace).toBeNull()
    expect(store.getState().dialog).toBeNull()
    expect(store.getState().source).toBe('changed')
  })

  it('does not ask when the dirty text is blank', () => {
    const { store } = setup()
    store.getState().setSource('   ')
    store.getState().requestReplace({ name: 'c.stepcode', source: 'x' })
    expect(store.getState().source).toBe('x')
  })

  it('marks saved and tracks the handle', () => {
    const { store } = setup()
    store.getState().setSource('a')
    store.getState().markSaved('a', { name: 'a.stepcode' })
    expect(isDirty(store.getState())).toBe(false)
    expect(store.getState().handle?.name).toBe('a.stepcode')
  })

  it('stores and resolves custom profiles', () => {
    const { store } = setup()
    store.getState().saveCustomProfile({ id: 'mio', extends: 'es', keywords: { write: ['Di'] } })
    store.getState().setProfile('mio')
    expect(profileOf(store.getState()).keywords.write).toEqual(['Di'])
    expect(profileInputOf(store.getState()).id).toBe('mio')
    expect(profileNameOf(store.getState(), 'mio')).toBe('mio')
    store.getState().deleteCustomProfile('mio')
    expect(store.getState().profileId).toBe('es')
  })

  it('updates and resets settings per section', () => {
    const { store } = setup()
    store.getState().updateSettings('editor', { fontSize: 16 })
    expect(store.getState().settings.editor.fontSize).toBe(16)
    store.getState().resetSettings('editor')
    expect(store.getState().settings.editor).toEqual(DEFAULT_SETTINGS.editor)
  })

  it('derives the UI locale from the setting or the profile', () => {
    const { store } = setup()
    expect(uiLocaleOf(store.getState())).toBe('es')
    store.getState().setProfile('en')
    expect(uiLocaleOf(store.getState())).toBe('en')
    store.getState().updateSettings('appearance', { uiLocale: 'es' })
    expect(uiLocaleOf(store.getState())).toBe('es')
    expect(localeOf(store.getState())).toBe('en')
    expect(stringsOf(store.getState()).toolbar.run).toBe('Ejecutar')
  })

  it('asks before running with warnings when the setting is on', () => {
    const { store, host } = setup()
    store.getState().setDiagnostics([warningDiagnostic])
    store.getState().run()
    expect(host.calls).toEqual([])
    expect(store.getState().dialog).toBe('warnings')
    store.getState().confirmRun()
    expect(host.calls).toEqual(['start:run'])
    expect(store.getState().dialog).toBeNull()
    store.getState().updateSettings('execution', { warnOnWarnings: false })
    host.emit({ kind: 'state', state: 'done' })
    store.getState().run()
    expect(host.calls).toEqual(['start:run', 'start:run'])
  })

  it('keeps the console when clearConsoleOnRun is off', () => {
    const { store, host } = setup()
    host.emit({ kind: 'output', chunks: ['x'] })
    store.getState().updateSettings('execution', { clearConsoleOnRun: false })
    store.getState().run()
    expect(store.getState().output.chunks).toEqual(['x'])
  })

  it('counts runs and first pauses', () => {
    const { store, host } = setup()
    store.getState().run()
    expect(store.getState().runSeq).toBe(1)
    expect(store.getState().pausedInRun).toBe(false)
    host.emit({ kind: 'state', state: 'paused' })
    host.emit({ kind: 'paused', reason: 'breakpoint', line: 2, frames: [] })
    expect(store.getState().pausedInRun).toBe(true)
    host.emit({ kind: 'state', state: 'ready' })
    store.getState().run()
    expect(store.getState().runSeq).toBe(2)
    expect(store.getState().pausedInRun).toBe(false)
  })

  it('tracks layout intents, dialogs and toasts', () => {
    const { store } = setup()
    store.getState().setDockLayout({ grid: {} }, ['g1'])
    expect(store.getState().layout.dockview).toEqual({ grid: {} })
    expect(store.getState().layout.collapsed).toEqual(['g1'])
    store.getState().setSheet('half')
    expect(store.getState().layout.sheet).toBe('half')
    store.getState().resetLayout()
    expect(store.getState().layout).toEqual(DEFAULT_LAYOUT)
    expect(store.getState().layoutReset).toBe(1)
    store.getState().requestPanel('problems')
    expect(store.getState().panelRequest).toEqual({ id: 'problems', seq: 1 })
    store.getState().openDialog('about')
    expect(store.getState().dialog).toBe('about')
    store.getState().closeDialog()
    expect(store.getState().dialog).toBeNull()
    store.getState().notify('hola')
    expect(store.getState().toasts.map((t) => t.message)).toEqual(['hola'])
    store.getState().dismissToast(store.getState().toasts[0]?.id ?? -1)
    expect(store.getState().toasts).toEqual([])
    store.getState().setCursor(3, 4)
    expect(store.getState().cursor).toEqual({ line: 3, column: 4 })
    store.getState().setAutoScroll(false)
    expect(store.getState().autoScroll).toBe(false)
  })
})
```

with the imports the new tests need: `DEFAULT_SETTINGS` from `../src/store/settings`, `DEFAULT_LAYOUT` from `../src/store/layout`, `isDirty, profileNameOf, stringsOf, uiLocaleOf` from `../src/store/store`.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/settings.test.ts packages/editor/test/document.test.ts packages/editor/test/layout.test.ts packages/editor/test/autoExpand.test.ts packages/editor/test/store.test.ts`
Expected: FAIL — modules and fields missing.

- [ ] **Step 9: Write the slices**

`src/store/settings.ts`:

```ts
import * as z from 'zod'

export type UiLocale = 'auto' | 'es' | 'en'

export const EditorSettingsSchema = z.strictObject({
  fontSize: z.number().int().min(12).max(20),
  lineNumbers: z.boolean(),
  wordWrap: z.boolean(),
  autocomplete: z.boolean(),
  tabSize: z.union([z.literal(2), z.literal(4)]),
  highlightLine: z.boolean(),
})

export const SettingsSchema = z.strictObject({
  editor: EditorSettingsSchema,
  execution: z.strictObject({ warnOnWarnings: z.boolean(), clearConsoleOnRun: z.boolean() }),
  appearance: z.strictObject({
    theme: z.enum(['light', 'dark', 'system']),
    uiLocale: z.enum(['auto', 'es', 'en']),
  }),
  layout: z.strictObject({ showConsoleOnRun: z.boolean() }),
})

export type Settings = z.infer<typeof SettingsSchema>
export type EditorSettings = Settings['editor']
export type ExecutionSettings = Settings['execution']
export type AppearanceSettings = Settings['appearance']
export type LayoutSettings = Settings['layout']
export type SettingsSection = keyof Settings

/** Spec §6: every default, once. */
export const DEFAULT_SETTINGS: Settings = Object.freeze({
  editor: {
    fontSize: 14,
    lineNumbers: true,
    wordWrap: false,
    autocomplete: true,
    tabSize: 4,
    highlightLine: true,
  },
  execution: { warnOnWarnings: true, clearConsoleOnRun: true },
  appearance: { theme: 'system', uiLocale: 'auto' },
  layout: { showConsoleOnRun: true },
})
```

`src/store/document.ts`:

```ts
/** What a file handle is to the store: the files module (Task 5) narrows it to the real one. */
export interface FileHandle {
  readonly name: string
}

/** A whole document about to replace the current one (Nuevo, Abrir, an example, a share link). */
export interface DocumentDraft {
  readonly name: string
  readonly source: string
  readonly profileId?: string
}

export const EXTENSIONS = ['.stepcode', '.psc', '.txt', '.sc'] as const

/** Spec §8.1: dirty means the text differs from the last file save (or the starter program). */
export function isDirty(state: { readonly source: string; readonly savedSource: string }): boolean {
  return state.source !== state.savedSource
}

/** Trims and appends `.stepcode` when the name has no known extension; blank stays blank. */
export function nameWithExtension(raw: string): string {
  const name = raw.trim()
  if (name === '') return ''
  return EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension))
    ? name
    : `${name}.stepcode`
}
```

`src/store/layout.ts`:

```ts
export type PanelId = 'editor' | 'console' | 'problems' | 'variables'

export const PANEL_IDS: readonly PanelId[] = ['editor', 'console', 'problems', 'variables']

export type SheetPosition = 'collapsed' | 'half' | 'full'

export interface LayoutState {
  /** dockview's `toJSON()`; validated only by dockview itself on `fromJSON`. */
  readonly dockview: Record<string, unknown> | null
  /** ids of collapsed groups (spec §3.3). */
  readonly collapsed: readonly string[]
  readonly sheet: SheetPosition
}

export const DEFAULT_LAYOUT: LayoutState = Object.freeze({
  dockview: null,
  collapsed: [],
  sheet: 'collapsed',
})

export interface PanelRequest {
  readonly id: PanelId
  readonly seq: number
}
```

`src/shell/autoExpand.ts`:

```ts
import type { PanelId } from '../store/layout'

export interface ExpandInput {
  readonly runSeq: number
  readonly pausedInRun: boolean
  readonly pendingInput: object | null
}

export interface ExpandEvent {
  readonly panel: PanelId
  readonly reason: 'run' | 'pause' | 'input'
}

/** Spec §3.4: which panel an observed store transition wants expanded, if any. */
export function autoExpandTarget(
  previous: ExpandInput,
  next: ExpandInput,
  showConsoleOnRun: boolean,
): ExpandEvent | null {
  if (next.pendingInput !== null && previous.pendingInput === null) {
    return { panel: 'console', reason: 'input' }
  }
  if (next.pausedInRun && !previous.pausedInRun) return { panel: 'variables', reason: 'pause' }
  if (next.runSeq !== previous.runSeq && showConsoleOnRun) return { panel: 'console', reason: 'run' }
  return null
}
```

`src/store/store.ts` — full replacement. The runtime `receive` switch and the `begin` guard are the 4a code with the additions marked:

```ts
import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import {
  builtinProfiles,
  type ProfileInput,
  type ProfileRegistry,
  profiles,
  type ResolvedProfile,
  resolveProfile,
} from '@stepcode/profiles'
import { type Diagnostic, type Frame, formatDiagnostic, LineMap } from 'stepcode'
import { createStore, type StoreApi } from 'zustand/vanilla'
import type { HostApi } from '../runtime/host-api'
import type { InputTarget, RunMode, WorkerMessage, WorkerState } from '../runtime/protocol'
import { type Strings, stringsFor } from '../strings'
import type { Theme, ThemePreference } from '../theme/types'
import { type DocumentDraft, type FileHandle, isDirty } from './document'
import { DEFAULT_LAYOUT, type LayoutState, type PanelId, type PanelRequest, type SheetPosition } from './layout'
import { appendOutput, emptyOutput, type OutputBuffer } from './output'
import { DEFAULT_SETTINGS, type Settings, type SettingsSection } from './settings'

export type ProfileId = string

export const PROFILE_IDS: readonly string[] = ['es', 'en', 'pseint']

export type DialogName = 'settings' | 'examples' | 'share' | 'about' | 'confirmSave' | 'warnings'

export interface Toast {
  readonly id: number
  readonly message: string
}

export interface PendingInput {
  readonly line: number
  readonly target: InputTarget | null
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

export interface StoreState {
  // … exactly the interface in the task header …
}

export type EditorStore = StoreApi<StoreState>

export interface StoreOptions {
  readonly applyTheme?: (theme: Theme) => void
  readonly initialTheme?: ThemePreference
  readonly systemDark?: boolean
  readonly initialSource?: string
  readonly initialName?: string
}

export const DEFAULT_SOURCE = [
  'Proceso Hola',
  '  // Escribe tu programa aquí',
  "  Escribir 'Hola, mundo';",
  'FinProceso',
  '',
].join('\n')

export { isDirty }

/** Resolved custom profiles, memoized by input identity (inputs are replaced, never mutated). */
const resolvedCache = new WeakMap<ProfileInput, ResolvedProfile>()

function registryWith(customs: readonly ProfileInput[]): ProfileRegistry {
  const registry = new Map(builtinProfiles)
  for (const input of customs) registry.set(input.id, input)
  return registry
}

export function customProfileOf(
  state: Pick<StoreState, 'customProfiles'>,
  id: string,
): ProfileInput | undefined {
  return state.customProfiles.find((input) => input.id === id)
}

export function profileOf(state: Pick<StoreState, 'profileId' | 'customProfiles'>): ResolvedProfile {
  const builtin = (profiles as Record<string, ResolvedProfile | undefined>)[state.profileId]
  if (builtin !== undefined) return builtin
  const input = customProfileOf(state, state.profileId)
  if (input === undefined) return profiles.es
  let resolved = resolvedCache.get(input)
  if (resolved === undefined) {
    resolved = resolveProfile(input, registryWith(state.customProfiles))
    resolvedCache.set(input, resolved)
  }
  return resolved
}

/** The JSON that crosses the worker boundary: a builtin's input or the custom input itself. */
export function profileInputOf(state: Pick<StoreState, 'profileId' | 'customProfiles'>): ProfileInput {
  return (
    builtinProfiles.get(state.profileId) ??
    customProfileOf(state, state.profileId) ??
    (builtinProfiles.get('es') as ProfileInput)
  )
}

export function profileNameOf(state: Pick<StoreState, 'profileId' | 'customProfiles'>, id: string): string {
  return stringsOf(state).profiles[id] ?? id
}

/** Diagnostics and runtime rendering follow the profile. */
export function localeOf(state: Pick<StoreState, 'profileId' | 'customProfiles'>): string {
  return profileOf(state).locale
}

/** UI copy follows the setting, or the profile when `auto`. */
export function uiLocaleOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'> & { readonly settings?: Settings },
): string {
  const setting = state.settings?.appearance.uiLocale ?? 'auto'
  return setting === 'auto' ? localeOf(state) : setting
}

export function stringsOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'> & { readonly settings?: Settings },
): Strings {
  return stringsFor(uiLocaleOf(state))
}

export function hasErrors(state: Pick<StoreState, 'diagnostics'>): boolean {
  return state.diagnostics.some((diagnostic) => diagnostic.severity === 'error')
}

export function hasWarnings(state: Pick<StoreState, 'diagnostics'>): boolean {
  return state.diagnostics.some((diagnostic) => diagnostic.severity === 'warning')
}

export function canEdit(state: WorkerState): boolean {
  return state === 'ready' || state === 'done' || state === 'error'
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): Theme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
}

interface Snapshot {
  readonly source: string
  readonly profile: ResolvedProfile
}

export function createEditorStore(host: HostApi, options: StoreOptions = {}): EditorStore {
  let snapshot: Snapshot | null = null
  let toastSeq = 0
  const initialPreference = options.initialTheme ?? 'system'
  const initialSystemDark = options.systemDark ?? false
  const initialSource = options.initialSource ?? DEFAULT_SOURCE

  const store = createStore<StoreState>((set, get) => {
    const applyTheme = (preference: ThemePreference, systemDark: boolean): void => {
      const theme = resolveTheme(preference, systemDark)
      set({ themePreference: preference, systemDark, theme })
      options.applyTheme?.(theme)
    }
    const begin = (mode: RunMode): void => {
      const s = get()
      if (!canEdit(s.state) || hasErrors(s)) return
      snapshot = { source: s.source, profile: profileOf(s) }
      set({
        output: s.settings.execution.clearConsoleOnRun ? emptyOutput : s.output,
        currentLine: null,
        frames: [],
        pendingInput: null,
        wait: null,
        error: null,
        runSeq: s.runSeq + 1,
        pausedInRun: false,
        dialog: s.dialog === 'warnings' ? null : s.dialog,
      })
      host.start(s.source, profileInputOf(s), s.breakpoints, mode)
    }
    const applyDraft = (draft: DocumentDraft): void => {
      set({
        name: draft.name,
        source: draft.source,
        savedSource: draft.source,
        handle: null,
        breakpoints: [],
        pendingReplace: null,
        dialog: null,
        ...(draft.profileId === undefined ? {} : { profileId: draft.profileId }),
      })
      host.setBreakpoints([])
    }
    return {
      source: initialSource,
      name: options.initialName ?? stringsFor('es').app.untitled,
      savedSource: initialSource,
      handle: null,
      pendingReplace: null,
      profileId: 'es',
      customProfiles: [],
      diagnostics: [],
      breakpoints: [],
      cursor: { line: 1, column: 1 },
      settings: DEFAULT_SETTINGS,
      themePreference: initialPreference,
      systemDark: initialSystemDark,
      theme: resolveTheme(initialPreference, initialSystemDark),
      state: 'ready',
      output: emptyOutput,
      currentLine: null,
      frames: [],
      pendingInput: null,
      wait: null,
      error: null,
      runSeq: 0,
      pausedInRun: false,
      autoScroll: true,
      layout: DEFAULT_LAYOUT,
      layoutReset: 0,
      panelRequest: null,
      dialog: null,
      toasts: [],
      setSource: (source) => set({ source }),
      setName: (name) => set({ name }),
      markSaved: (source, handle) => set({ savedSource: source, handle }),
      requestReplace: (draft) => {
        const s = get()
        if (isDirty(s) && s.source.trim() !== '') set({ pendingReplace: draft, dialog: 'confirmSave' })
        else applyDraft(draft)
      },
      applyReplace: () => {
        const draft = get().pendingReplace
        if (draft !== null) applyDraft(draft)
      },
      cancelReplace: () => set({ pendingReplace: null, dialog: null }),
      setProfile: (profileId) => set({ profileId }),
      saveCustomProfile: (input) =>
        set((s) => ({
          customProfiles: [...s.customProfiles.filter((c) => c.id !== input.id), input],
        })),
      deleteCustomProfile: (id) =>
        set((s) => ({
          customProfiles: s.customProfiles.filter((c) => c.id !== id),
          profileId:
            s.profileId === id
              ? ((customProfileOf(s, id) as { extends?: string } | undefined)?.extends ?? 'es')
              : s.profileId,
        })),
      setDiagnostics: (diagnostics) => set({ diagnostics }),
      setBreakpoints: (breakpoints) => {
        set({ breakpoints })
        host.setBreakpoints(breakpoints)
      },
      setCursor: (line, column) => set({ cursor: { line, column } }),
      updateSettings: (section, patch) =>
        set((s) => ({
          settings: { ...s.settings, [section]: { ...s.settings[section], ...patch } },
        })),
      resetSettings: (section) =>
        set((s) => ({ settings: { ...s.settings, [section]: DEFAULT_SETTINGS[section] } })),
      setThemePreference: (preference) => {
        applyTheme(preference, get().systemDark)
        set((s) => ({
          settings: { ...s.settings, appearance: { ...s.settings.appearance, theme: preference } },
        }))
      },
      setSystemDark: (dark) => applyTheme(get().themePreference, dark),
      run: () => {
        const s = get()
        if (s.settings.execution.warnOnWarnings && hasWarnings(s) && canEdit(s.state) && !hasErrors(s)) {
          set({ dialog: 'warnings' })
          return
        }
        begin('run')
      },
      confirmRun: () => begin('run'),
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
      setAutoScroll: (autoScroll) => set({ autoScroll }),
      setDockLayout: (dockview, collapsed) =>
        set((s) => ({ layout: { ...s.layout, dockview, collapsed } })),
      setSheet: (sheet) => set((s) => ({ layout: { ...s.layout, sheet } })),
      resetLayout: () => set((s) => ({ layout: DEFAULT_LAYOUT, layoutReset: s.layoutReset + 1 })),
      requestPanel: (id) =>
        set((s) => ({ panelRequest: { id, seq: (s.panelRequest?.seq ?? 0) + 1 } })),
      openDialog: (dialog) => set({ dialog }),
      closeDialog: () => set({ dialog: null }),
      notify: (message) =>
        set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, message }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }
  })

  // format / lineOf / receive: identical to 4a, except `paused` also sets `pausedInRun: true`.
  …
  host.subscribe(receive)
  return store
}
```

Write the `format`, `lineOf` and `receive` functions exactly as in the 4a file, adding `pausedInRun: true` to the `paused` case. Export types `PanelId`, `SheetPosition`, `LayoutState`, `PanelRequest`, `Settings`, `SettingsSection`, `DocumentDraft`, `FileHandle` through re-exports at the bottom so consumers can import them from `store/store` or from their slice files.

Update `test/render.tsx` so `storeWith` passes `{ initialTheme: 'light' }` (a `ThemePreference`) and adds an optional third argument `options?: StoreOptions`.

Run: the five test files from Step 8.
Expected: PASS. Then run the whole editor project: `pnpm vitest run --project @stepcode/editor` — the 4a component tests that referenced `setTheme` or `theme` need only the rename; the Toolbar test's `buttons()` filter still applies.

- [ ] **Step 10: Write the failing persistence test**

`test/persist.test.ts`:

```ts
import 'fake-indexeddb/auto'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_LAYOUT } from '../src/store/layout'
import {
  applyDocument,
  applyPersisted,
  documentOf,
  openDocumentStore,
  persistedOf,
  readDocument,
  readPersisted,
  STORAGE_KEY,
  startDocumentPersisting,
  startPersisting,
  writeDocument,
  writePersisted,
} from '../src/store/persist'
import { DEFAULT_SETTINGS } from '../src/store/settings'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

class MemoryStorage {
  readonly map = new Map<string, string>()
  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
}

describe('localStorage persistence', () => {
  it('round-trips settings, profile, custom profiles and layout', () => {
    const store = createEditorStore(new FakeHost())
    store.getState().saveCustomProfile({ id: 'mio', extends: 'es' })
    store.getState().setProfile('mio')
    store.getState().updateSettings('editor', { fontSize: 18 })
    store.getState().setDockLayout({ grid: { root: {} } }, ['g1'])
    store.getState().setSheet('half')
    const storage = new MemoryStorage()
    writePersisted(storage, persistedOf(store.getState()))
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as { version: number }
    expect(parsed.version).toBe(1)

    const again = createEditorStore(new FakeHost())
    const loaded = readPersisted(storage)
    expect(loaded).not.toBeNull()
    if (loaded !== null) applyPersisted(again, loaded)
    const s = again.getState()
    expect(s.profileId).toBe('mio')
    expect(s.customProfiles).toEqual([{ id: 'mio', extends: 'es' }])
    expect(s.settings.editor.fontSize).toBe(18)
    expect(s.layout).toEqual({ dockview: { grid: { root: {} } }, collapsed: ['g1'], sheet: 'half' })
    expect(s.themePreference).toBe('system')
  })

  it('falls back to null on garbage, wrong version or invalid shape, warning once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = new MemoryStorage()
    expect(readPersisted(storage)).toBeNull()
    storage.setItem(STORAGE_KEY, '{not json')
    expect(readPersisted(storage)).toBeNull()
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }))
    expect(readPersisted(storage)).toBeNull()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, settings: { profileId: 3 }, layout: DEFAULT_LAYOUT }),
    )
    expect(readPersisted(storage)).toBeNull()
    expect(warn).toHaveBeenCalledTimes(3)
    warn.mockRestore()
  })

  it('never throws when storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(readPersisted(broken)).toBeNull()
    expect(() =>
      writePersisted(broken, persistedOf(createEditorStore(new FakeHost()).getState())),
    ).not.toThrow()
    warn.mockRestore()
  })

  it('debounces writes while the store changes', () => {
    vi.useFakeTimers()
    const store = createEditorStore(new FakeHost())
    const storage = new MemoryStorage()
    const stop = startPersisting(store, storage, { debounceMs: 250 })
    store.getState().updateSettings('editor', { fontSize: 15 })
    store.getState().updateSettings('editor', { fontSize: 16 })
    expect(storage.map.size).toBe(0)
    vi.advanceTimersByTime(250)
    expect(readPersisted(storage)?.settings.editor.fontSize).toBe(16)
    stop()
    store.getState().updateSettings('editor', { fontSize: 17 })
    vi.advanceTimersByTime(250)
    expect(readPersisted(storage)?.settings.editor.fontSize).toBe(16)
    vi.useRealTimers()
  })

  it('ignores source, cursor and runtime changes', () => {
    vi.useFakeTimers()
    const store = createEditorStore(new FakeHost())
    const storage = new MemoryStorage()
    startPersisting(store, storage, { debounceMs: 10 })
    store.getState().setSource('x')
    store.getState().setCursor(2, 2)
    vi.advanceTimersByTime(10)
    expect(storage.map.size).toBe(0)
    vi.useRealTimers()
  })
})

describe('IndexedDB document', () => {
  it('round-trips the current document', async () => {
    const store = createEditorStore(new FakeHost())
    store.getState().requestReplace({ name: 'a.stepcode', source: 'Proceso A\nFinProceso\n' })
    store.getState().setSource('Proceso A\n  Escribir 1;\nFinProceso\n')
    const idb = openDocumentStore()
    await writeDocument(idb, documentOf(store.getState()))
    const loaded = await readDocument(idb)
    expect(loaded?.name).toBe('a.stepcode')
    expect(loaded?.source).toContain('Escribir 1')
    expect(loaded?.savedSource).toBe('Proceso A\nFinProceso\n')
    const again = createEditorStore(new FakeHost())
    if (loaded !== null) applyDocument(again, loaded)
    expect(again.getState().name).toBe('a.stepcode')
    expect(again.getState().savedSource).toBe('Proceso A\nFinProceso\n')
  })

  it('persists on a debounce and survives a failing store', async () => {
    vi.useFakeTimers()
    const store = createEditorStore(new FakeHost())
    const writes: string[] = []
    const stop = startDocumentPersisting(store, openDocumentStore(), {
      debounceMs: 500,
      write: async (_idb, doc) => {
        writes.push(doc.source)
      },
    })
    store.getState().setSource('1')
    store.getState().setSource('12')
    await vi.advanceTimersByTimeAsync(500)
    expect(writes).toEqual(['12'])
    stop()
    vi.useRealTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const failing = startDocumentPersisting(store, openDocumentStore(), {
      debounceMs: 0,
      write: async () => {
        throw new Error('quota')
      },
    })
    store.getState().setSource('123')
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(warn).toHaveBeenCalled()
    failing()
    warn.mockRestore()
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/persist.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 11: Write `persist.ts`**

```ts
import { ProfileInputSchema } from '@stepcode/profiles'
import { createStore, get, set, type UseStore } from 'idb-keyval'
import * as z from 'zod'
import { DEFAULT_LAYOUT } from './layout'
import { SettingsSchema } from './settings'
import type { EditorStore, StoreState } from './store'

export const STORAGE_KEY = 'stepcode.editor'

export const PersistedSchema = z.strictObject({
  version: z.literal(1),
  settings: z.strictObject({
    profileId: z.string().min(1),
    customProfiles: z.array(ProfileInputSchema),
    ...SettingsSchema.shape,
  }),
  layout: z.strictObject({
    dockview: z.record(z.string(), z.unknown()).nullable(),
    collapsed: z.array(z.string()),
    sheet: z.enum(['collapsed', 'half', 'full']),
  }),
})

export type PersistedV1 = z.infer<typeof PersistedSchema>

export const CURRENT_VERSION = 1

/** `migrations[n]` upgrades a version-`n` document to `n + 1`. Empty for the first release. */
export const migrations: ReadonlyArray<(previous: Record<string, unknown>) => Record<string, unknown>> = []

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function migrate(raw: Record<string, unknown>): Record<string, unknown> | null {
  let current = raw
  let version = typeof current.version === 'number' ? current.version : Number.NaN
  while (version < CURRENT_VERSION) {
    const step = migrations[version - 1]
    if (step === undefined) return null
    current = step(current)
    version = typeof current.version === 'number' ? current.version : Number.NaN
  }
  return version === CURRENT_VERSION ? current : null
}

/** Never throws (global constraint): garbage, unknown versions and storage errors all yield null. */
export function readPersisted(storage: StorageLike): PersistedV1 | null {
  try {
    const text = storage.getItem(STORAGE_KEY)
    if (text === null) return null
    const raw = JSON.parse(text) as unknown
    if (typeof raw !== 'object' || raw === null) throw new Error('not an object')
    const migrated = migrate(raw as Record<string, unknown>)
    if (migrated === null) throw new Error('unknown version')
    const parsed = PersistedSchema.safeParse(migrated)
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'invalid')
    return parsed.data
  } catch (error) {
    console.warn('stepcode: ignoring stored settings', error)
    return null
  }
}

export function writePersisted(storage: StorageLike, value: PersistedV1): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    console.warn('stepcode: could not store settings', error)
  }
}

export function persistedOf(state: StoreState): PersistedV1 {
  return {
    version: 1,
    settings: {
      profileId: state.profileId,
      customProfiles: [...state.customProfiles],
      ...state.settings,
    },
    layout: { dockview: state.layout.dockview, collapsed: [...state.layout.collapsed], sheet: state.layout.sheet },
  }
}

export function applyPersisted(store: EditorStore, persisted: PersistedV1): void {
  const { profileId, customProfiles, ...settings } = persisted.settings
  store.setState({
    customProfiles,
    profileId,
    settings,
    layout: { ...DEFAULT_LAYOUT, ...persisted.layout },
  })
  store.getState().setThemePreference(settings.appearance.theme)
}

function persistedSlice(s: StoreState): readonly unknown[] {
  return [s.profileId, s.customProfiles, s.settings, s.layout]
}

export function startPersisting(
  store: EditorStore,
  storage: StorageLike,
  options: { debounceMs?: number } = {},
): () => void {
  const debounceMs = options.debounceMs ?? 250
  let timer: ReturnType<typeof setTimeout> | null = null
  const unsubscribe = store.subscribe((next, previous) => {
    const a = persistedSlice(next)
    const b = persistedSlice(previous)
    if (a.every((value, i) => value === b[i])) return
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      writePersisted(storage, persistedOf(store.getState()))
    }, debounceMs)
  })
  return () => {
    unsubscribe()
    if (timer !== null) clearTimeout(timer)
  }
}

// ---- IndexedDB document (spec §7.2) ----

export interface StoredDocument {
  readonly id: 'current'
  readonly name: string
  readonly source: string
  readonly profileId: string
  readonly savedSource: string | null
  readonly updatedAt: number
}

export type DocumentStore = UseStore

export function openDocumentStore(): DocumentStore {
  return createStore('stepcode', 'documents')
}

export function documentOf(state: StoreState, now: number = Date.now()): StoredDocument {
  return {
    id: 'current',
    name: state.name,
    source: state.source,
    profileId: state.profileId,
    savedSource: state.savedSource,
    updatedAt: now,
  }
}

export function applyDocument(store: EditorStore, doc: StoredDocument): void {
  store.setState({
    name: doc.name,
    source: doc.source,
    savedSource: doc.savedSource ?? doc.source,
    profileId: doc.profileId,
    handle: null,
  })
}

export async function readDocument(idb: DocumentStore): Promise<StoredDocument | null> {
  try {
    const value = await get<StoredDocument>('current', idb)
    return value ?? null
  } catch (error) {
    console.warn('stepcode: could not read the stored document', error)
    return null
  }
}

export async function writeDocument(idb: DocumentStore, doc: StoredDocument): Promise<void> {
  await set('current', doc, idb)
}

export function startDocumentPersisting(
  store: EditorStore,
  idb: DocumentStore,
  options: {
    debounceMs?: number
    write?: (idb: DocumentStore, doc: StoredDocument) => Promise<void>
  } = {},
): () => void {
  const debounceMs = options.debounceMs ?? 500
  const write = options.write ?? writeDocument
  let timer: ReturnType<typeof setTimeout> | null = null
  const unsubscribe = store.subscribe((next, previous) => {
    if (
      next.source === previous.source &&
      next.name === previous.name &&
      next.profileId === previous.profileId &&
      next.savedSource === previous.savedSource
    ) {
      return
    }
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      write(idb, documentOf(store.getState())).catch((error: unknown) => {
        console.warn('stepcode: could not store the document', error)
      })
    }, debounceMs)
  })
  return () => {
    unsubscribe()
    if (timer !== null) clearTimeout(timer)
  }
}
```

`src/env.d.ts`:

```ts
declare const __APP_VERSION__: string | undefined
```

`src/version.ts`:

```ts
/** Injected by Vite `define` (Task 13); the fallback keeps tests and the dev server honest. */
export const APP_VERSION: string =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0-dev'
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/persist.test.ts`
Expected: PASS.

- [ ] **Step 12: Whole package green, lint, typecheck, commit**

Run: `pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck && pnpm vitest run --project @stepcode/editor`
Expected: all green. If `pnpm build` of the editor complains about the `@font-face` URLs, they are absolute (`/fonts/…`) and served from `public/`; nothing to change.

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml packages/editor/package.json packages/editor/public/fonts packages/editor/src packages/editor/test
git commit -m "feat(editor): shell foundations — tokens, fonts, strings, store slices, persistence"
```

---
### Task 2: transposer and starter program

**Files:**
- Create: `packages/editor/src/profiles/transpose.ts`, `src/profiles/starter.ts`
- Test: `test/transpose.test.ts`, `test/starter.test.ts`

**Interfaces:**
- Consumes: `tokenize`, `Token` from `stepcode`; `ResolvedProfile`, `KEYWORD_KEYS` … from `@stepcode/profiles`; `DEFAULT_SOURCE` from `src/store/store`.
- Produces: `transpose(source: string, from: ResolvedProfile, to: ResolvedProfile): string`; `primarySpelling(profile, kind, key): string | undefined`; `matchCase(template: string, spelling: string): string`; `starterProgram(profile: ResolvedProfile): string` (the `es` starter is `DEFAULT_SOURCE`, transposed).

- [ ] **Step 1: Write the failing transposer test**

`test/transpose.test.ts`:

```ts
import { profiles, resolveProfile } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { matchCase, primarySpelling, transpose } from '../src/profiles/transpose'

const ES = [
  'Proceso Suma',
  '  Definir a, b Como Entero;',
  '  // un comentario con Escribir dentro',
  "  Escribir 'Escribir no es palabra clave aquí';",
  '  Leer a;',
  '  Si a > 1 Y Verdadero Entonces',
  '    b <- a MOD 2;',
  '  FinSi',
  '  Escribir Abs(b);',
  'FinProceso',
  '',
].join('\n')

describe('transpose', () => {
  it('re-spells keywords, types, builtins and operators; leaves comments and strings alone', () => {
    const en = transpose(ES, profiles.es, profiles.en)
    expect(en).toContain('Program Suma')
    expect(en).toContain('Define a, b As Integer;')
    expect(en).toContain('// un comentario con Escribir dentro')
    expect(en).toContain("'Escribir no es palabra clave aquí'")
    expect(en).toContain('Read a;')
    expect(en).toContain('If a > 1 And True Then')
    expect(en).toContain('EndIf')
    expect(compile(en, { profile: profiles.en }).diagnostics).toEqual([])
  })

  it('is the identity for the same profile and round-trips through en', () => {
    expect(transpose(ES, profiles.es, profiles.es)).toBe(ES)
    const back = transpose(transpose(ES, profiles.es, profiles.en), profiles.en, profiles.es)
    expect(compile(back, { profile: profiles.es }).diagnostics).toEqual([])
  })

  it('preserves the casing pattern of the original spelling', () => {
    expect(matchCase('ESCRIBIR', 'Write')).toBe('WRITE')
    expect(matchCase('escribir', 'Write')).toBe('write')
    expect(matchCase('Escribir', 'write')).toBe('Write')
    expect(matchCase('FinSi', 'EndIf')).toBe('EndIf')
    const upper = transpose('PROCESO A\nESCRIBIR 1;\nFINPROCESO\n', profiles.es, profiles.en)
    expect(upper).toContain('PROGRAM A')
    expect(upper).toContain('WRITE 1;')
  })

  it('keeps the original text when the target has no spelling for a key', () => {
    const noWait = resolveProfile({ id: 'nw', extends: 'es', keywords: { wait: [] } }, new Map([['es', { id: 'es', ...profiles.es }]]))
    expect(transpose('Esperar 10;', profiles.es, noWait)).toBe('Esperar 10;')
    expect(primarySpelling(noWait, 'keyword', 'wait')).toBeUndefined()
  })

  it('uses the primary spelling for keys with alternatives', () => {
    expect(primarySpelling(profiles.es, 'keyword', 'write')).toBe('Escribir')
    expect(transpose('Mostrar 1;', profiles.es, profiles.es)).toBe('Mostrar 1;')
    expect(transpose('Show 1;', profiles.en, profiles.es)).toMatch(/^(Escribir|Mostrar) 1;$/)
  })
})
```

(The `resolveProfile` registry argument above must be a `Map<string, ProfileInput>`; use `builtinProfiles` from `@stepcode/profiles` instead of the inline map if the spread does not type-check: `resolveProfile({ id: 'nw', extends: 'es', keywords: { wait: [] } }, builtinProfiles)`.)

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/transpose.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 2: Write `transpose.ts`**

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import { type Token, tokenize } from 'stepcode'

export type SpellingKind = 'keyword' | 'type' | 'builtin' | 'operator'

const SECTION: Readonly<Record<SpellingKind, 'keywords' | 'types' | 'builtins' | 'operators'>> = {
  keyword: 'keywords',
  type: 'types',
  builtin: 'builtins',
  operator: 'operators',
}

/** The first spelling of `key` in `profile`, or undefined when the profile has none. */
export function primarySpelling(
  profile: ResolvedProfile,
  kind: SpellingKind,
  key: string,
): string | undefined {
  const section = profile[SECTION[kind]] as Readonly<Record<string, readonly string[] | undefined>>
  return section[key]?.[0]
}

/** ALL CAPS → ALL CAPS, lower → lower, anything else keeps the target's own casing. */
export function matchCase(template: string, spelling: string): string {
  const letters = template.replace(/[^\p{L}]/gu, '')
  if (letters.length === 0) return spelling
  if (letters === letters.toUpperCase()) return spelling.toUpperCase()
  if (letters === letters.toLowerCase()) return spelling.toLowerCase()
  return spelling
}

function isSpelled(token: Token): token is Token & { kind: SpellingKind; value: string } {
  return (
    (token.kind === 'keyword' ||
      token.kind === 'type' ||
      token.kind === 'builtin' ||
      token.kind === 'operator') &&
    typeof token.value === 'string'
  )
}

/**
 * Spec §8.4: re-spell every keyword, type, builtin and operator token with the target's primary
 * spelling; everything else (identifiers, literals, comments, whitespace) keeps its text.
 * Options are not translated — per-profile example overrides exist for that.
 */
export function transpose(source: string, from: ResolvedProfile, to: ResolvedProfile): string {
  if (from === to) return source
  const { tokens } = tokenize(source, from)
  let out = ''
  for (const token of tokens) {
    if (token.kind === 'eof') break
    if (isSpelled(token)) {
      const spelling = primarySpelling(to, token.kind, token.value)
      out += spelling === undefined ? token.text : matchCase(token.text, spelling)
    } else {
      out += token.text
    }
  }
  return out
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/transpose.test.ts`
Expected: PASS. If an operator token such as `<-` maps through `operators.assign` to the same text, the identity case still holds; if the `es` `write` primary is `Escribir` and the round-trip turns `Mostrar` into `Escribir`, the regex in the last test allows both.

- [ ] **Step 3: Write the failing starter test and `starter.ts`**

`test/starter.test.ts`:

```ts
import { profiles } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { starterProgram } from '../src/profiles/starter'
import { DEFAULT_SOURCE } from '../src/store/store'

describe('starterProgram', () => {
  it('is the es starter for es and a clean program for every builtin profile', () => {
    expect(starterProgram(profiles.es)).toBe(DEFAULT_SOURCE)
    for (const profile of [profiles.es, profiles.en, profiles.pseint]) {
      const source = starterProgram(profile)
      expect(source).toContain('Escribe tu programa aquí')
      expect(compile(source, { profile }).diagnostics).toEqual([])
    }
    expect(starterProgram(profiles.en)).toContain('Program Hola')
  })
})
```

`src/profiles/starter.ts`:

```ts
import { type ResolvedProfile, profiles } from '@stepcode/profiles'
import { DEFAULT_SOURCE } from '../store/store'
import { transpose } from './transpose'

/** Spec §8.2: the four-line starter in the active profile's spelling. */
export function starterProgram(profile: ResolvedProfile): string {
  return transpose(DEFAULT_SOURCE, profiles.es, profile)
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/starter.test.ts`
Expected: PASS. If PSeInt's `requireSemicolons` or comment syntax makes the transposed starter fail to compile, change `DEFAULT_SOURCE` in Task 1's store (it is Task 1's file, but this task may edit the constant's text only) to a form that compiles under all three, and note it in the report.

- [ ] **Step 4: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/profiles packages/editor/test/transpose.test.ts packages/editor/test/starter.test.ts
git commit -m "feat(editor): transpose programs between profiles"
```

---

### Task 3: examples

**Files:**
- Create: `packages/editor/examples/topics.json`, `packages/editor/examples/<topic>/<slug>.stepcode` (twelve programs, listed below)
- Create: `src/examples/header.ts`, `src/examples/index.ts`
- Test: `test/examples-header.test.ts`, `test/examples.test.ts`

**Interfaces:**
- Consumes: `transpose` (Task 2), `compile`, `profiles`.
- Produces: `parseHeader(text): { title: string; description: string; body: string }`; `Example { id: string; topic: string; slug: string; title: string; description: string; source: string; overrides: Readonly<Record<string, string>> }`; `EXAMPLES: readonly Example[]` (topic order from `topics.json`, then title); `TOPICS: readonly string[]`; `exampleSource(example, profile: ResolvedProfile): string` (override or transposition); `findExample(id): Example | undefined`.

- [ ] **Step 1: Write the example files**

`examples/topics.json`:

```json
["primeros-pasos", "condicionales", "ciclos", "arreglos", "funciones", "un-poco-mas"]
```

Twelve programs, two per topic, each starting with the two-line header. Write them in the `es` profile; keep every one under 25 lines; every one must compile clean under `es`, `en` and `pseint` after transposition (Step 4 checks it; add a `<slug>.pseint.stepcode` override only if PSeInt rejects a transposed program). The list (file → title / description / what it does):

| File | título | descripción |
|---|---|---|
| `primeros-pasos/hola-mundo.stepcode` | Hola mundo | Escribe un saludo en la consola |
| `primeros-pasos/leer-y-escribir.stepcode` | Leer y escribir | Pide un nombre y saluda |
| `condicionales/mayor-de-edad.stepcode` | Mayor de edad | Decide con Si … Sino |
| `condicionales/calificacion.stepcode` | Calificación | Varias ramas con Sino Si |
| `ciclos/contar-hasta-diez.stepcode` | Contar hasta diez | Un ciclo Para |
| `ciclos/adivina-el-numero.stepcode` | Adivina el número | Repite hasta acertar con Mientras |
| `arreglos/promedio.stepcode` | Promedio | Guarda notas en un arreglo y promedia |
| `arreglos/mayor-del-arreglo.stepcode` | El mayor del arreglo | Recorre un arreglo buscando el máximo |
| `funciones/doble.stepcode` | Doble | Una función que devuelve un valor |
| `funciones/saludar.stepcode` | Saludar | Un subproceso con parámetro |
| `un-poco-mas/tabla-de-multiplicar.stepcode` | Tabla de multiplicar | Ciclos anidados |
| `un-poco-mas/factorial.stepcode` | Factorial | Una función que se llama a sí misma |

For example `primeros-pasos/hola-mundo.stepcode`:

```
// título: Hola mundo
// descripción: Escribe un saludo en la consola
Proceso HolaMundo
  Escribir 'Hola, mundo';
FinProceso
```

and `arreglos/promedio.stepcode`:

```
// título: Promedio
// descripción: Guarda notas en un arreglo y promedia
Proceso Promedio
  Definir notas Como Real;
  Definir i Como Entero;
  Definir suma Como Real;
  Dimension notas[3];
  suma <- 0;
  Para i <- 1 Hasta 3 Hacer
    Escribir 'Nota ', i, ':';
    Leer notas[i];
    suma <- suma + notas[i];
  FinPara
  Escribir 'Promedio: ', suma / 3;
FinProceso
```

Write the other ten in the same style, using only constructs the corpus README documents (`Definir`, `Dimension`, `Si/Sino Si/Sino/FinSi`, `Para`, `Mientras`, `Funcion … FinFuncion`, `SubProceso … FinSubProceso`, `Leer`, `Escribir`). Confirm each with `compile` in Step 4 before moving on.

- [ ] **Step 2: Write the failing header test**

`test/examples-header.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseHeader } from '../src/examples/header'

describe('parseHeader', () => {
  it('reads título and descripción and strips them from the body', () => {
    const text = ['// título: Hola mundo', '// descripción: Saluda', 'Proceso A', 'FinProceso', ''].join('\n')
    expect(parseHeader(text)).toEqual({
      title: 'Hola mundo',
      description: 'Saluda',
      body: 'Proceso A\nFinProceso\n',
    })
  })

  it('tolerates missing lines and accepts ASCII keys', () => {
    expect(parseHeader('// titulo: X\nProceso A\nFinProceso\n')).toEqual({
      title: 'X',
      description: '',
      body: 'Proceso A\nFinProceso\n',
    })
    expect(parseHeader('Proceso A\nFinProceso\n')).toEqual({
      title: '',
      description: '',
      body: 'Proceso A\nFinProceso\n',
    })
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/examples-header.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write `header.ts`**

```ts
export interface ExampleHeader {
  readonly title: string
  readonly description: string
  readonly body: string
}

const HEADER_LINE = /^\/\/\s*(t[ií]tulo|descripci[oó]n)\s*:\s*(.*)$/i

/** Spec §8.3: two optional `//` header lines at the top; the rest is the program. */
export function parseHeader(text: string): ExampleHeader {
  const lines = text.split('\n')
  let title = ''
  let description = ''
  let index = 0
  while (index < lines.length) {
    const match = HEADER_LINE.exec(lines[index] ?? '')
    if (match === null) break
    const key = (match[1] ?? '').toLowerCase()
    const value = (match[2] ?? '').trim()
    if (key.startsWith('t')) title = value
    else description = value
    index++
  }
  return { title, description, body: lines.slice(index).join('\n') }
}
```

Run: the header test. Expected: PASS.

- [ ] **Step 4: Write the failing index test**

`test/examples.test.ts`:

```ts
import { profiles } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it } from 'vitest'
import { EXAMPLES, exampleSource, findExample, TOPICS } from '../src/examples/index'

describe('examples', () => {
  it('lists every topic in order and at least two examples per topic', () => {
    expect(TOPICS).toEqual([
      'primeros-pasos',
      'condicionales',
      'ciclos',
      'arreglos',
      'funciones',
      'un-poco-mas',
    ])
    for (const topic of TOPICS) {
      expect(EXAMPLES.filter((example) => example.topic === topic).length).toBeGreaterThanOrEqual(2)
    }
    expect(EXAMPLES.map((e) => e.topic)).toEqual(
      [...EXAMPLES].sort((a, b) => TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic)).map((e) => e.topic),
    )
  })

  it('has a title, a description, a unique id and a body without the header', () => {
    const ids = new Set<string>()
    for (const example of EXAMPLES) {
      expect(example.title.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
      expect(example.source.startsWith('//')).toBe(false)
      expect(ids.has(example.id)).toBe(false)
      ids.add(example.id)
    }
    expect(findExample('primeros-pasos/hola-mundo')?.title).toBe('Hola mundo')
    expect(findExample('nope')).toBeUndefined()
  })

  it.each([['es'], ['en'], ['pseint']] as const)(
    'compiles clean under %s (transposed or overridden)',
    (id) => {
      const profile = profiles[id]
      for (const example of EXAMPLES) {
        const source = exampleSource(example, profile)
        const { diagnostics } = compile(source, { profile })
        expect(diagnostics, `${example.id} under ${id}`).toEqual([])
      }
    },
  )
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/examples.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 5: Write `index.ts`**

```ts
import { type ResolvedProfile, profiles } from '@stepcode/profiles'
import { transpose } from '../profiles/transpose'
import { parseHeader } from './header'
import topics from '../../examples/topics.json'

export interface Example {
  readonly id: string
  readonly topic: string
  readonly slug: string
  readonly title: string
  readonly description: string
  /** The `es` body without the header. */
  readonly source: string
  /** `<slug>.<profileId>.stepcode` files, by profile id, already header-stripped. */
  readonly overrides: Readonly<Record<string, string>>
}

export const TOPICS: readonly string[] = topics

// Vite resolves this at build time (and in Vitest); the `?raw` query yields the file text.
const files = import.meta.glob('../../examples/*/*.stepcode', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const FILE = /\/examples\/([^/]+)\/([^/.]+)(?:\.([^/.]+))?\.stepcode$/

function build(): Example[] {
  const byId = new Map<string, { base?: string; overrides: Record<string, string> }>()
  for (const [path, text] of Object.entries(files)) {
    const match = FILE.exec(path)
    if (match === null) continue
    const [, topic, slug, profileId] = match
    const id = `${topic}/${slug}`
    const entry = byId.get(id) ?? { overrides: {} }
    if (profileId === undefined) entry.base = text
    else entry.overrides[profileId] = parseHeader(text).body
    byId.set(id, entry)
  }
  const examples: Example[] = []
  for (const [id, entry] of byId) {
    if (entry.base === undefined) continue
    const [topic = '', slug = ''] = id.split('/')
    const { title, description, body } = parseHeader(entry.base)
    examples.push({ id, topic, slug, title, description, source: body, overrides: entry.overrides })
  }
  return examples.sort(
    (a, b) => TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic) || a.title.localeCompare(b.title, 'es'),
  )
}

export const EXAMPLES: readonly Example[] = build()

export function findExample(id: string): Example | undefined {
  return EXAMPLES.find((example) => example.id === id)
}

/** Spec §8.3: the per-profile override when one exists, otherwise the transposed `es` body. */
export function exampleSource(example: Example, profile: ResolvedProfile): string {
  return example.overrides[profile.id] ?? transpose(example.source, profiles.es, profile)
}
```

`tsconfig.json` already has `"types": ["vite/client", "node"]`, which declares `import.meta.glob` and JSON imports (`resolveJsonModule` is on through `moduleResolution: bundler`; if TS complains, add `"resolveJsonModule": true` to `packages/editor/tsconfig.json` — Task 13 owns that file, so instead import the topics as `import topics from '../../examples/topics.json' with { type: 'json' }` or inline the array in `index.ts` and keep `topics.json` as the source the test compares against by reading it with `node:fs`).

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/examples.test.ts`
Expected: PASS once every program compiles under the three profiles. For a PSeInt failure, write `examples/<topic>/<slug>.pseint.stepcode` with the same header and the adjusted body.

- [ ] **Step 6: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/examples packages/editor/src/examples packages/editor/test/examples-header.test.ts packages/editor/test/examples.test.ts
git commit -m "feat(editor): bundled examples transposed per profile"
```

---

### Task 4: share links

**Files:**
- Create: `src/share/base64url.ts`, `src/share/link.ts`, `src/share/onLoad.ts`
- Test: `test/base64url.test.ts`, `test/share.test.ts`

**Interfaces:**
- Consumes: `EditorStore`, `requestReplace`, `notify`, `stringsOf`.
- Produces: `toBase64Url(bytes: Uint8Array): string`, `fromBase64Url(text: string): Uint8Array`; `encodeShare({ source, profileId }): Promise<string>` (the full hash, `#code=…&profile=…`); `decodeShare(hash: string): Promise<{ source: string; profileId: string } | null>`; `SHARE_WARN_LENGTH = 8000`; `shareUrl(hash, base?: string): string`; `applyShareHash(store, location: { hash: string }, replaceState: (url: string) => void): Promise<boolean>`.

- [ ] **Step 1: Write the failing base64url test**

`test/base64url.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { fromBase64Url, toBase64Url } from '../src/share/base64url'

describe('base64url', () => {
  it('round-trips bytes without padding or url-unsafe characters', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255, 62, 63])
    const text = toBase64Url(bytes)
    expect(text).not.toMatch(/[+/=]/)
    expect(fromBase64Url(text)).toEqual(bytes)
    expect(toBase64Url(new Uint8Array())).toBe('')
    expect(fromBase64Url('')).toEqual(new Uint8Array())
  })

  it('throws on invalid input', () => {
    expect(() => fromBase64Url('***')).toThrow()
  })
})
```

- [ ] **Step 2: Write `base64url.ts`**

```ts
export function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error('invalid base64url')
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/base64url.test.ts` → PASS.

- [ ] **Step 3: Write the failing share test**

`test/share.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { applyShareHash, decodeShare, encodeShare, SHARE_WARN_LENGTH, shareUrl } from '../src/share/link'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const SOURCE = "Proceso A\n  Escribir 'ñandú';\nFinProceso\n"

describe('share links', () => {
  it('round-trips source and profile through #code=', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'es' })
    expect(hash).toMatch(/^#code=[A-Za-z0-9_-]+&profile=es$/)
    expect(await decodeShare(hash)).toEqual({ source: SOURCE, profileId: 'es' })
    expect(shareUrl(hash, 'https://x.test/')).toBe(`https://x.test/${hash}`)
  })

  it('compresses: 200 lines of code fit well under the warning threshold', async () => {
    const big = Array.from({ length: 200 }, (_, i) => `  Escribir 'línea ${i}';`).join('\n')
    const hash = await encodeShare({ source: `Proceso B\n${big}\nFinProceso\n`, profileId: 'es' })
    expect(hash.length).toBeLessThan(SHARE_WARN_LENGTH)
    expect(SHARE_WARN_LENGTH).toBe(8000)
  })

  it('returns null for missing, malformed or undecodable hashes', async () => {
    expect(await decodeShare('')).toBeNull()
    expect(await decodeShare('#foo=bar')).toBeNull()
    expect(await decodeShare('#code=***')).toBeNull()
    expect(await decodeShare('#code=AAAA')).toBeNull()
  })

  it('defaults the profile to es when the hash has none', async () => {
    const hash = await encodeShare({ source: SOURCE, profileId: 'en' })
    const noProfile = hash.replace('&profile=en', '')
    expect((await decodeShare(noProfile))?.profileId).toBe('es')
  })
})

describe('applyShareHash', () => {
  it('replaces the document, names it, strips the hash and reports success', async () => {
    const store = createEditorStore(new FakeHost())
    const hash = await encodeShare({ source: SOURCE, profileId: 'en' })
    const replaced: string[] = []
    const applied = await applyShareHash(store, { hash }, (url) => replaced.push(url))
    expect(applied).toBe(true)
    expect(store.getState().source).toBe(SOURCE)
    expect(store.getState().profileId).toBe('en')
    expect(store.getState().name).toBe('compartido.stepcode')
    expect(replaced).toEqual(['/'])
  })

  it('falls back to es with a toast for an unknown profile', async () => {
    const store = createEditorStore(new FakeHost())
    const hash = await encodeShare({ source: SOURCE, profileId: 'nope' })
    await applyShareHash(store, { hash }, () => {})
    expect(store.getState().profileId).toBe('es')
    expect(store.getState().toasts[0]?.message).toContain('perfil')
  })

  it('does nothing without a code hash', async () => {
    const store = createEditorStore(new FakeHost())
    expect(await applyShareHash(store, { hash: '' }, () => {})).toBe(false)
    expect(await applyShareHash(store, { hash: '#code=***' }, () => {})).toBe(false)
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/share.test.ts` → FAIL.

- [ ] **Step 4: Write `link.ts` and `onLoad.ts`**

`src/share/link.ts`:

```ts
import { builtinProfiles } from '@stepcode/profiles'
import { customProfileOf, type EditorStore, stringsOf } from '../store/store'
import { fromBase64Url, toBase64Url } from './base64url'

export const SHARE_WARN_LENGTH = 8000

export interface SharePayload {
  readonly source: string
  readonly profileId: string
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const response = new Response(new Blob([bytes]).stream().pipeThrough(stream))
  return new Uint8Array(await response.arrayBuffer())
}

/** Spec §8.5: `#code=<base64url(deflate-raw(utf8))>&profile=<id>`. */
export async function encodeShare(payload: SharePayload): Promise<string> {
  const bytes = new TextEncoder().encode(payload.source)
  const deflated = await pipe(bytes, new CompressionStream('deflate-raw'))
  return `#code=${toBase64Url(deflated)}&profile=${encodeURIComponent(payload.profileId)}`
}

export async function decodeShare(hash: string): Promise<SharePayload | null> {
  if (!hash.startsWith('#')) return null
  const params = new URLSearchParams(hash.slice(1))
  const code = params.get('code')
  if (code === null || code === '') return null
  try {
    const inflated = await pipe(fromBase64Url(code), new DecompressionStream('deflate-raw'))
    const source = new TextDecoder('utf-8', { fatal: true }).decode(inflated)
    return { source, profileId: params.get('profile') ?? 'es' }
  } catch {
    return null
  }
}

export function shareUrl(hash: string, base: string = `${location.origin}${location.pathname}`): string {
  return `${base}${hash}`
}

/**
 * Spec §8.5: a `#code=` hash wins over the stored document (through the usual unsaved prompt),
 * the hash is removed from the address bar, and a missing profile falls back to `es`.
 */
export async function applyShareHash(
  store: EditorStore,
  location: { readonly hash: string },
  replaceState: (url: string) => void,
): Promise<boolean> {
  const payload = await decodeShare(location.hash)
  if (payload === null) return false
  const s = store.getState()
  const known = builtinProfiles.has(payload.profileId) || customProfileOf(s, payload.profileId) !== undefined
  if (!known) s.notify(stringsOf(s).share.unknownProfile)
  s.requestReplace({
    name: stringsOf(s).app.shared,
    source: payload.source,
    profileId: known ? payload.profileId : 'es',
  })
  replaceState(globalThis.location?.pathname ?? '/')
  return true
}
```

`src/share/onLoad.ts` (the browser entry Task 14 calls; kept apart so `link.ts` stays testable under Node):

```ts
import type { EditorStore } from '../store/store'
import { applyShareHash } from './link'

export function applyShareFromLocation(store: EditorStore): Promise<boolean> {
  return applyShareHash(store, window.location, (url) => window.history.replaceState(null, '', url))
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/share.test.ts` → PASS. (`Blob`, `Response`, `CompressionStream` are Node globals; `location` is undefined under Node, hence the `globalThis.location?.` guard and the explicit `base` in the URL test.)

- [ ] **Step 5: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/share packages/editor/test/base64url.test.ts packages/editor/test/share.test.ts
git commit -m "feat(editor): share links with #code= encode and decode"
```

---

### Task 5: files — open, save, save as, fallbacks, confirm-save dialog

**Files:**
- Create: `src/files/fsa.ts`, `src/files/actions.ts`, `src/dialogs/ConfirmSave.tsx`
- Test: `test/files.test.ts`, `test/ConfirmSave.test.tsx`

**Interfaces:**
- Consumes: store (`requestReplace`, `markSaved`, `setName`, `notify`, `handle`, `name`, `source`, `pendingReplace`, `applyReplace`, `cancelReplace`), `starterProgram` (Task 2), `nameWithExtension`, `EXTENSIONS`.
- Produces:
  - `src/files/fsa.ts`: `FileSystemFileHandleLike { name; getFile(): Promise<File>; createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }> }`, `FilePickers { open?: (options) => Promise<FileSystemFileHandleLike[]>; save?: (options) => Promise<FileSystemFileHandleLike> }`, `pickersFrom(win: object): FilePickers`, `isAbort(error): boolean`.
  - `src/files/actions.ts`: `FileEnvironment { pickers: FilePickers; download: (name, text) => void; pickFallback: () => Promise<File | null> }`, `browserEnvironment(): FileEnvironment`, `newDocument(store)`, `openFile(store, env)`, `saveFile(store, env)`, `saveFileAs(store, env)` — all return `Promise<void>` and never throw (abort is silent, other failures toast).
  - `src/dialogs/ConfirmSave.tsx`: `ConfirmSave({ open, env })` bound to the store's `pendingReplace`.

- [ ] **Step 1: Write the failing files test**

`test/files.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { newDocument, openFile, saveFile, saveFileAs } from '../src/files/actions'
import { isAbort, pickersFrom } from '../src/files/fsa'
import { createEditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

function fakeHandle(name: string, contents = '') {
  const written: string[] = []
  return {
    written,
    handle: {
      name,
      getFile: async () => ({ text: async () => contents }) as File,
      createWritable: async () => ({
        write: async (data: string) => {
          written.push(data)
        },
        close: async () => {},
      }),
    },
  }
}

function env(overrides: Partial<ReturnType<typeof baseEnv>> = {}) {
  return { ...baseEnv(), ...overrides }
}

function baseEnv() {
  return {
    pickers: {},
    download: vi.fn<(name: string, text: string) => void>(),
    pickFallback: vi.fn(async () => null as File | null),
  }
}

describe('pickersFrom', () => {
  it('finds the File System Access API when present', () => {
    expect(pickersFrom({})).toEqual({})
    const open = async () => []
    const save = async () => fakeHandle('x').handle
    expect(Object.keys(pickersFrom({ showOpenFilePicker: open, showSaveFilePicker: save }))).toEqual(['open', 'save'])
  })

  it('recognises an abort', () => {
    expect(isAbort(new DOMException('x', 'AbortError'))).toBe(true)
    expect(isAbort(new Error('x'))).toBe(false)
  })
})

describe('newDocument', () => {
  it('replaces with the starter in the active profile', () => {
    const store = createEditorStore(new FakeHost())
    store.getState().setProfile('en')
    newDocument(store)
    expect(store.getState().name).toBe('untitled.stepcode')
    expect(store.getState().source).toContain('Program Hola')
  })
})

describe('openFile', () => {
  it('uses the picker, keeps the handle and names the document', async () => {
    const store = createEditorStore(new FakeHost())
    const { handle } = fakeHandle('mi.stepcode', 'Proceso M\nFinProceso\n')
    await openFile(store, env({ pickers: { open: async () => [handle] } }))
    expect(store.getState().name).toBe('mi.stepcode')
    expect(store.getState().source).toBe('Proceso M\nFinProceso\n')
    expect(store.getState().handle).toBe(handle)
  })

  it('falls back to a file input without a picker', async () => {
    const store = createEditorStore(new FakeHost())
    const file = { name: 'otro.psc', text: async () => 'Proceso O\nFinProceso\n' } as File
    await openFile(store, env({ pickFallback: async () => file }))
    expect(store.getState().name).toBe('otro.psc')
    expect(store.getState().handle).toBeNull()
  })

  it('is silent on abort and toasts on failure', async () => {
    const store = createEditorStore(new FakeHost())
    await openFile(store, env({ pickers: { open: async () => { throw new DOMException('x', 'AbortError') } } }))
    expect(store.getState().toasts).toEqual([])
    await openFile(store, env({ pickers: { open: async () => { throw new Error('boom') } } }))
    expect(store.getState().toasts[0]?.message).toBe('No se pudo abrir el archivo')
  })
})

describe('saveFile / saveFileAs', () => {
  it('writes to the held handle and clears the dirty flag', async () => {
    const store = createEditorStore(new FakeHost())
    const { handle, written } = fakeHandle('mi.stepcode')
    store.getState().markSaved(store.getState().source, handle)
    store.getState().setSource('Proceso X\nFinProceso\n')
    await saveFile(store, env())
    expect(written).toEqual(['Proceso X\nFinProceso\n'])
    expect(store.getState().savedSource).toBe('Proceso X\nFinProceso\n')
    expect(store.getState().toasts.at(-1)?.message).toBe('Guardado')
  })

  it('behaves as save-as without a handle, and downloads without a picker', async () => {
    const store = createEditorStore(new FakeHost())
    store.getState().setSource('Proceso Y\nFinProceso\n')
    const { handle, written } = fakeHandle('nuevo.stepcode')
    const e = env({ pickers: { save: async () => handle } })
    await saveFile(store, e)
    expect(written).toEqual(['Proceso Y\nFinProceso\n'])
    expect(store.getState().name).toBe('nuevo.stepcode')
    expect(store.getState().handle).toBe(handle)

    const other = createEditorStore(new FakeHost())
    other.getState().setSource('Proceso Z\nFinProceso\n')
    const fallback = env()
    await saveFileAs(other, fallback)
    expect(fallback.download).toHaveBeenCalledWith('sin título.stepcode', 'Proceso Z\nFinProceso\n')
    expect(other.getState().savedSource).toBe('Proceso Z\nFinProceso\n')
    expect(other.getState().toasts.at(-1)?.message).toBe('Descargado')
  })

  it('is silent on abort and toasts on failure', async () => {
    const store = createEditorStore(new FakeHost())
    await saveFileAs(store, env({ pickers: { save: async () => { throw new DOMException('x', 'AbortError') } } }))
    expect(store.getState().toasts).toEqual([])
    await saveFileAs(store, env({ pickers: { save: async () => { throw new Error('boom') } } }))
    expect(store.getState().toasts[0]?.message).toBe('No se pudo guardar el archivo')
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/files.test.ts` → FAIL.

- [ ] **Step 2: Write `fsa.ts` and `actions.ts`**

`src/files/fsa.ts`:

```ts
import type { FileHandle } from '../store/document'

export interface WritableLike {
  write(data: string): Promise<void>
  close(): Promise<void>
}

/** The subset of `FileSystemFileHandle` the editor uses; typed here because lib.dom lacks the pickers. */
export interface FileSystemFileHandleLike extends FileHandle {
  getFile(): Promise<File>
  createWritable(): Promise<WritableLike>
}

export interface PickerType {
  readonly description: string
  readonly accept: Readonly<Record<string, readonly string[]>>
}

export interface OpenOptions {
  readonly types: readonly PickerType[]
  readonly multiple?: boolean
}

export interface SaveOptions {
  readonly types: readonly PickerType[]
  readonly suggestedName?: string
}

export interface FilePickers {
  readonly open?: (options: OpenOptions) => Promise<FileSystemFileHandleLike[]>
  readonly save?: (options: SaveOptions) => Promise<FileSystemFileHandleLike>
}

/** Reads `showOpenFilePicker`/`showSaveFilePicker` off `window` when the browser has them. */
export function pickersFrom(win: object): FilePickers {
  const w = win as Record<string, unknown>
  const pickers: { open?: FilePickers['open']; save?: FilePickers['save'] } = {}
  if (typeof w.showOpenFilePicker === 'function') {
    pickers.open = (w.showOpenFilePicker as (o: OpenOptions) => Promise<FileSystemFileHandleLike[]>).bind(win)
  }
  if (typeof w.showSaveFilePicker === 'function') {
    pickers.save = (w.showSaveFilePicker as (o: SaveOptions) => Promise<FileSystemFileHandleLike>).bind(win)
  }
  return pickers
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
```

`src/files/actions.ts`:

```ts
import { starterProgram } from '../profiles/starter'
import { EXTENSIONS, nameWithExtension } from '../store/document'
import { type EditorStore, profileOf, stringsOf } from '../store/store'
import { type FilePickers, type FileSystemFileHandleLike, isAbort, pickersFrom } from './fsa'

export interface FileEnvironment {
  readonly pickers: FilePickers
  /** Fallback save: hand the browser a download. */
  readonly download: (name: string, text: string) => void
  /** Fallback open: an `<input type="file">`; null when the user cancels. */
  readonly pickFallback: () => Promise<File | null>
}

function pickerTypes(description: string) {
  return [{ description, accept: { 'text/plain': [...EXTENSIONS] } }]
}

export function browserEnvironment(win: Window = window): FileEnvironment {
  return {
    pickers: pickersFrom(win),
    download: (name, text) => {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
      const anchor = win.document.createElement('a')
      anchor.href = url
      anchor.download = name
      anchor.click()
      URL.revokeObjectURL(url)
    },
    pickFallback: () =>
      new Promise((resolve) => {
        const input = win.document.createElement('input')
        input.type = 'file'
        input.accept = EXTENSIONS.join(',')
        input.onchange = () => resolve(input.files?.[0] ?? null)
        input.oncancel = () => resolve(null)
        input.click()
      }),
  }
}

/** Spec §8.2 Nuevo: the starter program in the active profile, through the unsaved prompt. */
export function newDocument(store: EditorStore): void {
  const s = store.getState()
  s.requestReplace({ name: stringsOf(s).app.untitled, source: starterProgram(profileOf(s)) })
}

export async function openFile(store: EditorStore, env: FileEnvironment): Promise<void> {
  const s = store.getState()
  try {
    if (env.pickers.open !== undefined) {
      const [handle] = await env.pickers.open({ types: pickerTypes(stringsOf(s).files.accept) })
      if (handle === undefined) return
      const text = await (await handle.getFile()).text()
      s.requestReplace({ name: handle.name, source: text })
      // requestReplace may park the draft; the handle is attached when the draft applies.
      attachHandle(store, handle, text)
      return
    }
    const file = await env.pickFallback()
    if (file === null) return
    s.requestReplace({ name: file.name, source: await file.text() })
  } catch (error) {
    if (!isAbort(error)) store.getState().notify(stringsOf(s).files.openFailed)
  }
}

function attachHandle(store: EditorStore, handle: FileSystemFileHandleLike, text: string): void {
  const apply = (): void => store.getState().markSaved(text, handle)
  if (store.getState().pendingReplace === null) {
    apply()
    return
  }
  const unsubscribe = store.subscribe((next, previous) => {
    if (previous.pendingReplace !== null && next.pendingReplace === null) {
      unsubscribe()
      if (next.source === text) apply()
    }
  })
}

async function writeTo(handle: FileSystemFileHandleLike, text: string): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

export async function saveFile(store: EditorStore, env: FileEnvironment): Promise<void> {
  const s = store.getState()
  const handle = s.handle as FileSystemFileHandleLike | null
  if (handle === null || typeof handle.createWritable !== 'function') return saveFileAs(store, env)
  try {
    await writeTo(handle, s.source)
    s.markSaved(s.source, handle)
    s.notify(stringsOf(s).files.saved)
  } catch (error) {
    if (!isAbort(error)) s.notify(stringsOf(s).files.saveFailed)
  }
}

export async function saveFileAs(store: EditorStore, env: FileEnvironment): Promise<void> {
  const s = store.getState()
  const suggested = nameWithExtension(s.name) || stringsOf(s).app.untitled
  try {
    if (env.pickers.save !== undefined) {
      const handle = await env.pickers.save({
        types: pickerTypes(stringsOf(s).files.accept),
        suggestedName: suggested,
      })
      await writeTo(handle, s.source)
      s.setName(handle.name)
      s.markSaved(s.source, handle)
      s.notify(stringsOf(s).files.saved)
      return
    }
    env.download(suggested, s.source)
    s.markSaved(s.source, null)
    s.notify(stringsOf(s).files.downloaded)
  } catch (error) {
    if (!isAbort(error)) s.notify(stringsOf(s).files.saveFailed)
  }
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/files.test.ts` → PASS.

- [ ] **Step 3: Write the failing ConfirmSave test**

`test/ConfirmSave.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmSave } from '../src/dialogs/ConfirmSave'
import { renderWithStore, storeWith } from './render'

function setup() {
  const { store } = storeWith({})
  store.getState().setSource('Proceso Cambiado\nFinProceso\n')
  store.getState().requestReplace({ name: 'otro.stepcode', source: 'x' })
  const download = vi.fn()
  const env = { pickers: {}, download, pickFallback: async () => null }
  renderWithStore(<ConfirmSave env={env} />, store)
  return { store, download }
}

describe('ConfirmSave', () => {
  it('shows the question for the current name with three choices', () => {
    setup()
    expect(screen.getByRole('dialog', { name: '¿Guardar los cambios de sin título.stepcode?' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'No guardar' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDefined()
  })

  it('discards, applying the parked draft', () => {
    const { store } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'No guardar' }))
    expect(store.getState().source).toBe('x')
    expect(store.getState().name).toBe('otro.stepcode')
  })

  it('cancels, keeping the current document', () => {
    const { store } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(store.getState().source).toBe('Proceso Cambiado\nFinProceso\n')
    expect(store.getState().dialog).toBeNull()
  })

  it('saves (download fallback) and then applies the draft', async () => {
    const { store, download } = setup()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    })
    expect(download).toHaveBeenCalledWith('sin título.stepcode', 'Proceso Cambiado\nFinProceso\n')
    expect(store.getState().source).toBe('x')
  })
})
```

- [ ] **Step 4: Write `ConfirmSave.tsx`**

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import type { FileEnvironment } from '../files/actions'
import { saveFile } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { stringsOf } from '../store/store'

const BUTTON = 'h-8 rounded px-3 text-sm transition-colors duration-150'

/** Spec §8.1: Guardar / No guardar / Cancelar before a document is replaced. */
export function ConfirmSave({ env }: { env: FileEnvironment }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const open = useEditorStore((s) => s.dialog === 'confirmSave' && s.pendingReplace !== null)
  const name = useEditorStore((s) => s.name)
  const save = async (): Promise<void> => {
    await saveFile(store, env)
    store.getState().applyReplace()
  }
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && store.getState().cancelReplace()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-4 text-fg shadow-panel">
          <Dialog.Title className="text-base font-semibold">{strings.confirmSave.title(name)}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">{strings.confirmSave.body}</Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={`${BUTTON} hover:bg-surface-raised`} onClick={() => store.getState().cancelReplace()}>
              {strings.dialog.cancel}
            </button>
            <button type="button" className={`${BUTTON} hover:bg-surface-raised`} onClick={() => store.getState().applyReplace()}>
              {strings.confirmSave.discard}
            </button>
            <button type="button" className={`${BUTTON} bg-accent text-bg hover:opacity-90`} onClick={() => void save()}>
              {strings.confirmSave.save}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/ConfirmSave.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/files packages/editor/src/dialogs/ConfirmSave.tsx packages/editor/test/files.test.ts packages/editor/test/ConfirmSave.test.tsx
git commit -m "feat(editor): open, save and save-as with File System Access and fallbacks"
```

---
### Task 8: status bar

**Files:**
- Create: `src/shell/StatusBar.tsx`
- Test: `test/StatusBar.test.tsx`

**Interfaces:**
- Consumes: store (`cursor`, `profileId`, `customProfiles`, `diagnostics`, `state`, `currentLine`, `error`, `requestPanel`, `openDialog`, `setProfile`), `stringsOf`, `profileNameOf`, `PROFILE_IDS`, icons, `@radix-ui/react-popover`.
- Produces: `StatusBar({ onFocusEditor, onFocusConsole }: { onFocusEditor?: () => void; onFocusConsole?: () => void })`; `statusText(strings, state, currentLine, error): string`; `ProfilePopover({ children })` (the same list the menu uses — exported so Task 7's Menu can reuse the item list through `profileItems(state)`); `profileItems(state): { id: string; name: string; custom: boolean }[]`.

- [ ] **Step 1: Write the failing test**

`test/StatusBar.test.tsx`:

```tsx
// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { profileItems, StatusBar, statusText } from '../src/shell/StatusBar'
import { stringsFor } from '../src/strings'
import { renderWithStore, storeWith } from './render'

const err: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warn: Diagnostic = { from: 0, to: 1, severity: 'warning', message: 'w' }

describe('statusText', () => {
  const s = stringsFor('es')
  it('maps every state', () => {
    expect(statusText(s, 'ready', null, null)).toBe('Listo')
    expect(statusText(s, 'running', null, null)).toBe('Ejecutando…')
    expect(statusText(s, 'paused', 12, null)).toBe('En pausa en la línea 12')
    expect(statusText(s, 'input', 3, null)).toBe('Esperando entrada')
    expect(statusText(s, 'waiting', 3, null)).toBe('Esperando…')
    expect(statusText(s, 'done', null, null)).toBe('Terminado')
    expect(statusText(s, 'error', 7, { message: 'm', line: 7 })).toBe('Error en la línea 7')
  })
})

describe('StatusBar', () => {
  it('shows cursor, profile, problems and state as buttons', () => {
    const { store } = storeWith({ diagnostics: [err, err, warn] })
    store.getState().setCursor(12, 4)
    renderWithStore(<StatusBar />, store)
    expect(screen.getByRole('button', { name: /Ln 12, Col 4/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Español/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /✖ 2 {2}▲ 1/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Listo/ })).toBeDefined()
  })

  it('says no problems when clean and requests the Problems panel on click', () => {
    const { store } = storeWith({})
    renderWithStore(<StatusBar />, store)
    fireEvent.click(screen.getByRole('button', { name: /✓ Sin problemas/ }))
    expect(store.getState().panelRequest).toEqual({ id: 'problems', seq: 1 })
  })

  it('focuses the editor and the console through the callbacks', () => {
    const { store } = storeWith({ state: 'running' })
    const onFocusEditor = vi.fn()
    const onFocusConsole = vi.fn()
    renderWithStore(<StatusBar onFocusEditor={onFocusEditor} onFocusConsole={onFocusConsole} />, store)
    fireEvent.click(screen.getByRole('button', { name: /Ln 1, Col 1/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ejecutando/ }))
    expect(onFocusEditor).toHaveBeenCalledOnce()
    expect(onFocusConsole).toHaveBeenCalledOnce()
    expect(store.getState().panelRequest).toEqual({ id: 'console', seq: 1 })
  })

  it('lists profiles in the popover and switches on selection', async () => {
    const { store } = storeWith({})
    store.getState().saveCustomProfile({ id: 'mio', extends: 'es' })
    renderWithStore(<StatusBar />, store)
    expect(profileItems(store.getState()).map((p) => p.id)).toEqual(['es', 'en', 'pseint', 'mio'])
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Español/ }))
    })
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'English' }))
    expect(store.getState().profileId).toBe('en')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /English/ }))
    })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Personalizar…' }))
    expect(store.getState().dialog).toBe('settings')
  })

  it('disables the profile picker while a program is live', () => {
    const { store } = storeWith({ state: 'running' })
    renderWithStore(<StatusBar />, store)
    expect((screen.getByRole('button', { name: /Español/ }) as HTMLButtonElement).disabled).toBe(true)
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/StatusBar.test.tsx` → FAIL.

- [ ] **Step 2: Write `StatusBar.tsx`**

```tsx
import * as Popover from '@radix-ui/react-popover'
import type { ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { WorkerState } from '../runtime/protocol'
import { useEditorStore } from '../store/context'
import {
  canEdit,
  PROFILE_IDS,
  profileNameOf,
  type RuntimeError,
  type StoreState,
  stringsOf,
} from '../store/store'
import type { Strings } from '../strings'
import { Check, ChevronDown, LoaderCircle } from '../ui/icons'

export interface ProfileItem {
  readonly id: string
  readonly name: string
  readonly custom: boolean
}

export function profileItems(state: Pick<StoreState, 'profileId' | 'customProfiles' | 'settings'>): ProfileItem[] {
  return [
    ...PROFILE_IDS.map((id) => ({ id, name: profileNameOf(state, id), custom: false })),
    ...state.customProfiles.map((input) => ({ id: input.id, name: input.id, custom: true })),
  ]
}

/** Spec §5: one text per run state. */
export function statusText(
  strings: Strings,
  state: WorkerState,
  currentLine: number | null,
  error: RuntimeError | null,
): string {
  switch (state) {
    case 'ready':
      return strings.status.ready
    case 'running':
      return strings.status.running
    case 'paused':
      return strings.status.pausedAt(currentLine ?? 1)
    case 'input':
      return strings.status.waitingInput
    case 'waiting':
      return strings.status.waiting
    case 'done':
      return strings.status.done
    case 'error':
      return strings.status.errorAt(error?.line ?? currentLine ?? 1)
  }
}

const ITEM = 'flex h-6 items-center gap-1 rounded px-2 text-xs text-muted transition-colors duration-150 hover:bg-surface-raised hover:text-fg disabled:cursor-default disabled:hover:bg-transparent'

/** The profile list as a popover; `children` is the trigger. Reused by the Menu's Perfil submenu. */
export function ProfilePopover({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
  const strings = useEditorStore(stringsOf)
  const items = useEditorStore(useShallow(profileItems))
  const profileId = useEditorStore((s) => s.profileId)
  const setProfile = useEditorStore((s) => s.setProfile)
  const openDialog = useEditorStore((s) => s.openDialog)
  return (
    <Popover.Root>
      <Popover.Trigger asChild disabled={disabled}>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          role="menu"
          align="start"
          sideOffset={4}
          className="z-50 min-w-44 rounded-md bg-surface p-1 text-sm text-fg shadow-panel"
        >
          {items.map((item) => (
            <Popover.Close asChild key={item.id}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={item.id === profileId}
                onClick={() => setProfile(item.id)}
                className="flex h-8 w-full items-center gap-2 rounded px-2 text-left hover:bg-surface-raised"
              >
                <span className="w-4">{item.id === profileId ? <Check /> : null}</span>
                {item.name}
              </button>
            </Popover.Close>
          ))}
          <div className="my-1 border-t border-border" />
          <Popover.Close asChild>
            <button
              type="button"
              role="menuitem"
              onClick={() => openDialog('settings')}
              className="flex h-8 w-full items-center gap-2 rounded px-2 text-left hover:bg-surface-raised"
            >
              <span className="w-4" />
              {strings.menu.customize}
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function StatusBar({
  onFocusEditor,
  onFocusConsole,
}: {
  onFocusEditor?: () => void
  onFocusConsole?: () => void
}) {
  const strings = useEditorStore(stringsOf)
  const cursor = useEditorStore((s) => s.cursor)
  const profileName = useEditorStore((s) => profileNameOf(s, s.profileId))
  const counts = useEditorStore(
    useShallow((s) => ({
      errors: s.diagnostics.filter((d) => d.severity === 'error').length,
      warnings: s.diagnostics.filter((d) => d.severity === 'warning').length,
    })),
  )
  const state = useEditorStore((s) => s.state)
  const currentLine = useEditorStore((s) => s.currentLine)
  const error = useEditorStore((s) => s.error)
  const requestPanel = useEditorStore((s) => s.requestPanel)
  const clean = counts.errors === 0 && counts.warnings === 0

  return (
    <footer className="flex h-6 items-center gap-1 border-t border-border bg-surface px-2">
      <button type="button" className={ITEM} title={strings.status.cursor} onClick={onFocusEditor}>
        {strings.status.position(cursor.line, cursor.column)}
      </button>
      <ProfilePopover disabled={!canEdit(state)}>
        <button type="button" className={ITEM} title={strings.toolbar.profile}>
          {profileName}
          <ChevronDown size={12} />
        </button>
      </ProfilePopover>
      <button
        type="button"
        className={`${ITEM} ${clean ? '' : counts.errors > 0 ? 'text-error' : 'text-warning'}`}
        title={strings.problems.title}
        onClick={() => requestPanel('problems')}
      >
        {clean ? strings.status.noProblems : strings.status.problems(counts.errors, counts.warnings)}
      </button>
      <button
        type="button"
        className={`${ITEM} ml-auto`}
        title={strings.status.state}
        onClick={() => {
          requestPanel('console')
          onFocusConsole?.()
        }}
      >
        {state === 'running' ? <LoaderCircle size={12} className="animate-spin" /> : null}
        {statusText(strings, state, currentLine, error)}
      </button>
    </footer>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/StatusBar.test.tsx` → PASS. (If Radix Popover under happy-dom does not open on `click`, dispatch `pointerDown` first: `fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })` then `fireEvent.click(trigger)`; keep the assertion the same.)

- [ ] **Step 3: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/shell/StatusBar.tsx packages/editor/test/StatusBar.test.tsx
git commit -m "feat(editor): status bar with cursor, profile, problems and run state"
```

---

### Task 11: panel refinements and the completion flag

**Files:**
- Modify: `src/panels/Console.tsx`, `src/panels/Problems.tsx`, `src/panels/Variables.tsx`, `src/panels/Editor.tsx`, `src/editor/extensions.ts`
- Create: `src/panels/PanelActions.tsx`
- Modify: `packages/codemirror/src/stepcode.ts`; Create: `.changeset/codemirror-completion-flag.md`
- Test: `test/Console.test.tsx`, `test/Problems.test.tsx`, `test/Variables.test.tsx`, `test/Editor.test.tsx`, `test/extensions.test.ts`, `test/PanelActions.test.tsx`, `packages/codemirror/test/stepcode.test.ts`

**Interfaces:**
- Consumes: store fields `autoScroll`, `setAutoScroll`, `clearOutput`, `settings.editor`, `setCursor`, `state`, `frames`, `error`; `EditorHandle`; `Strings`.
- Produces:
  - `PanelActions({ panel }: { panel: PanelId })` — for `console`: Limpiar (icon `Trash2`) and Desplazamiento automático (toggle `ArrowDownToLine`, `aria-pressed`); for `problems`: the summary counts text; others render nothing. Also `PanelEmptyState`.
  - `createExtensions(options: EditorOptions & { settings: EditorSettings })` returns compartments `{ language, readOnly, dark, settings }`; `settingsExtension(settings: EditorSettings): Extension` (font size via `EditorView.theme`, `lineNumbers()`, `EditorView.lineWrapping`, `EditorState.tabSize`, `highlightActiveLine()`, and the language support rebuilt with `completion`).
  - `EditorHandle` gains `focus()` and `revealLine(line)`; the Editor pushes `setCursor` on selection change.
  - `@stepcode/codemirror`: `stepcode({ profile, locale?, completion?: boolean })`.
  - `Console`: appends `strings.console.finished` when `state === 'done'`; the error line gets a `seeLine` button calling `onReveal?.(line)`; no `<header>`. `Console({ onReveal?: (line: number) => void })`.
  - `Problems`: rows are `role="row"` inside `role="grid"`, `tabIndex`, arrow-key navigation, Enter reveals; empty state with `CircleCheck`; no `<header>`.
  - `Variables`: frames as `<details open>` sections; a value cell whose text differs from the previous paused snapshot gets class `bg-changed` for 600 ms (`data-changed="true"` attribute while flashing); empty text `pauseToSee` when a program exists but is not paused; no `<header>`.

- [ ] **Step 1: Add the completion flag to `@stepcode/codemirror`**

Test first, in `packages/codemirror/test/stepcode.test.ts` (append to the existing describe or add one):

```ts
import { EditorState } from '@codemirror/state'
import { autocompletion, completionStatus } from '@codemirror/autocomplete'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { stepcode } from '../src/index'

describe('stepcode({ completion })', () => {
  it('omits autocompletion when completion is false', () => {
    const on = EditorState.create({ doc: 'Proc', extensions: stepcode({ profile: profiles.es }) })
    const off = EditorState.create({
      doc: 'Proc',
      extensions: stepcode({ profile: profiles.es, completion: false }),
    })
    // With the extension present the facet has a config; without it, none.
    expect(completionStatus(on)).toBeNull()
    expect(off.facet(autocompletion.completionConfig ?? ({} as never)) ?? null).toBeNull()
  })
})
```

If `autocompletion.completionConfig` is not exported (it is not public), assert through structure instead: `expect(JSON.stringify(stepcode({ profile: profiles.es, completion: false }).extension)).not.toContain('completion')` is brittle; prefer this observable: create a view-less state, run `startCompletion` from `@codemirror/autocomplete` — it returns `false` when the extension is absent:

```ts
import { startCompletion } from '@codemirror/autocomplete'
import { EditorView } from '@codemirror/view'
// happy-dom file
const view = new EditorView({ state: off })
expect(startCompletion(view)).toBe(false)
view.destroy()
```

Then `packages/codemirror/src/stepcode.ts`:

```ts
export function stepcode(options: {
  profile: ResolvedProfile
  locale?: string
  /** Include the autocompletion extension (default true); the editor's setting turns it off. */
  completion?: boolean
}): LanguageSupport {
  …
  const extensions = [
    …,
    ...(options.completion === false ? [] : [autocompletion()]),
    …
  ]
```

keeping the rest of the function unchanged. `.changeset/codemirror-completion-flag.md`:

```md
---
"@stepcode/codemirror": patch
---

`stepcode()` accepts `completion: false` to omit the autocompletion extension.
```

Run: `pnpm vitest run --project @stepcode/codemirror` → PASS.

- [ ] **Step 2: Write the failing extensions and Editor tests**

Append to `test/extensions.test.ts`:

```ts
import { DEFAULT_SETTINGS } from '../src/store/settings'
import { settingsExtension } from '../src/editor/extensions'

describe('settingsExtension', () => {
  it('applies tab size, wrapping, line numbers and font size', () => {
    const base = { ...DEFAULT_SETTINGS.editor, tabSize: 2 as const, wordWrap: true, fontSize: 18 }
    const state = EditorState.create({ doc: 'x', extensions: settingsExtension(base, profiles.es, 'es') })
    expect(state.tabSize).toBe(2)
    expect(state.facet(EditorView.lineWrapping)).toBeDefined()
    const view = new EditorView({ state })
    expect(view.dom.querySelector('.cm-gutters')).not.toBeNull()
    expect(view.dom.style.getPropertyValue('--sc-editor-font-size')).toBe('18px')
    view.destroy()
    const noNumbers = new EditorView({
      state: EditorState.create({
        doc: 'x',
        extensions: settingsExtension({ ...base, lineNumbers: false }, profiles.es, 'es'),
      }),
    })
    expect(noNumbers.dom.querySelector('.cm-lineNumbers')).toBeNull()
    noNumbers.destroy()
  })
})
```

(`extensions.test.ts` is already a happy-dom file in 4a; keep its header.) In `test/Editor.test.tsx` add:

```tsx
it('reports the cursor position and applies editor settings live', () => {
  const { store, handle, view } = mount(FINE)
  view.dispatch({ selection: { anchor: FINE.indexOf('a <- 1') } })
  expect(store.getState().cursor).toEqual({ line: 3, column: 3 })
  act(() => {
    store.getState().updateSettings('editor', { fontSize: 17, lineNumbers: false })
  })
  expect(view.dom.style.getPropertyValue('--sc-editor-font-size')).toBe('17px')
  expect(view.dom.querySelector('.cm-lineNumbers')).toBeNull()
  handle.focus()
  expect(view.hasFocus || document.activeElement === view.contentDOM).toBe(true)
  handle.revealLine(4)
  expect(view.state.selection.main.head).toBe(view.state.doc.line(4).from)
})
```

(`mount` already returns `store` and `handle`; make it also return `view: handle.view`.)

- [ ] **Step 3: Implement `settingsExtension`, the compartment and the Editor changes**

In `src/editor/extensions.ts`:

```ts
import type { EditorSettings } from '../store/settings'

export interface EditorOptions {
  readonly profile: ResolvedProfile
  readonly locale: string
  readonly readOnly: boolean
  readonly dark: boolean
  readonly settings: EditorSettings
}

export interface EditorCompartments {
  readonly language: Compartment
  readonly readOnly: Compartment
  readonly dark: Compartment
  readonly settings: Compartment
}

export function languageExtension(profile: ResolvedProfile, locale: string, completion = true): Extension {
  return stepcode({ profile, locale, completion })
}

/** Spec §6.2: everything the Editor section of settings changes, as one reconfigurable unit. */
export function settingsExtension(
  settings: EditorSettings,
  profile: ResolvedProfile,
  locale: string,
): Extension {
  return [
    settings.lineNumbers ? lineNumbers() : [],
    settings.wordWrap ? EditorView.lineWrapping : [],
    settings.highlightLine ? highlightActiveLine() : [],
    EditorState.tabSize.of(settings.tabSize),
    EditorView.theme({ '&': { '--sc-editor-font-size': `${settings.fontSize}px`, fontSize: 'var(--sc-editor-font-size)' } }),
    languageExtension(profile, locale, settings.autocomplete),
  ]
}
```

and `createExtensions` drops the unconditional `lineNumbers()`, `highlightActiveLine()` and the `language` compartment content moves into `settings` (keep the `language` compartment for profile changes: reconfigure both when the profile changes — simplest is to make `language` hold `[]` and let `settings` own the language support; keep the export so 4a tests compile, and document it in the report). The theme's `fontSize` rule is the only place the editor's size is set; the tokens-only scan allows `px` values.

In `src/panels/Editor.tsx`:
- `createExtensions({ …, settings: initial.settings.editor })`.
- In the update listener: `if (update.selectionSet || update.docChanged) { const head = update.state.selection.main.head; const line = update.state.doc.lineAt(head); actions.setCursor(line.number, head - line.from + 1) }`.
- In the store subscription: when `next.settings.editor !== previous.settings.editor` or the profile changed, `view.dispatch({ effects: compartments.settings.reconfigure(settingsExtension(next.settings.editor, profileOf(next), localeOf(next))) })`.
- `EditorHandle` gains `focus(): void` → `view.focus()` and `revealLine(line: number): void` → `revealSpan(from, from)` where `from` is that line's start offset (`view.state.doc.line(line).from`, clamped to the document).

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/extensions.test.ts packages/editor/test/Editor.test.tsx` → PASS.

- [ ] **Step 4: Write the failing PanelActions and Console tests**

`test/PanelActions.test.tsx`:

```tsx
// @vitest-environment happy-dom
import type { Diagnostic } from '@codemirror/lint'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PanelActions } from '../src/panels/PanelActions'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const err: Diagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }

describe('PanelActions', () => {
  it('console: clear and auto-scroll toggle', () => {
    const { store, host } = storeWith({})
    host.emit({ kind: 'output', chunks: ['x'] })
    renderWithStore(
      <TooltipProvider>
        <PanelActions panel="console" />
      </TooltipProvider>,
      store,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(store.getState().output.chunks).toEqual([])
    const toggle = screen.getByRole('button', { name: 'Desplazamiento automático' })
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(toggle)
    expect(store.getState().autoScroll).toBe(false)
  })

  it('problems: the counts', () => {
    const { store } = storeWith({ diagnostics: [err] })
    renderWithStore(<PanelActions panel="problems" />, store)
    expect(screen.getByText('1 error, 0 advertencias')).toBeDefined()
  })

  it('editor and variables: nothing', () => {
    const { store } = storeWith({})
    const { container } = renderWithStore(<PanelActions panel="variables" />, store)
    expect(container.textContent).toBe('')
  })
})
```

Update `test/Console.test.tsx`: remove any assertion on the `Limpiar` header button (it moved), add:

```tsx
it('appends the finished line when done and a see-line button on error', () => {
  const { store, host } = storeWith({})
  const reveals: number[] = []
  renderWithStore(<Console onReveal={(line) => reveals.push(line)} />, store)
  act(() => {
    host.emit({ kind: 'state', state: 'done' })
    host.emit({ kind: 'done', frames: [] })
  })
  expect(screen.getByText('— Programa terminado —')).toBeDefined()
  act(() => {
    host.emit({ kind: 'state', state: 'error' })
    host.emit({
      kind: 'error',
      diagnostic: { code: 'E4001', severity: 'error', span: { start: 0, end: 1 }, data: {} },
      frames: [],
    })
  })
  fireEvent.click(screen.getByRole('button', { name: 'ver línea 1' }))
  expect(reveals).toEqual([1])
})

it('stops auto-scrolling when the store says so', () => {
  const { store, host } = storeWith({})
  renderWithStore(<Console />, store)
  const pre = screen.getByTestId('console-output')
  act(() => store.getState().setAutoScroll(false))
  act(() => host.emit({ kind: 'output', chunks: ['a\n'] }))
  expect(pre.scrollTop).toBe(0)
})
```

(Use a diagnostic code that exists in the language catalog; `createDiagnostic` from `stepcode` builds one if the literal shape does not type-check.)

- [ ] **Step 5: Write `PanelActions.tsx` and refine `Console.tsx`**

`src/panels/PanelActions.tsx`:

```tsx
import { useEditorStore } from '../store/context'
import type { PanelId } from '../store/layout'
import { stringsOf } from '../store/store'
import { ArrowDownToLine, Trash2 } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'

/** Spec §3.6: the per-panel header actions, mounted by the dock header and the sheet handle. */
export function PanelActions({ panel }: { panel: PanelId }) {
  const strings = useEditorStore(stringsOf)
  const autoScroll = useEditorStore((s) => s.autoScroll)
  const setAutoScroll = useEditorStore((s) => s.setAutoScroll)
  const clearOutput = useEditorStore((s) => s.clearOutput)
  const errors = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'error').length)
  const warnings = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'warning').length)
  switch (panel) {
    case 'console':
      return (
        <span className="flex items-center gap-1">
          <IconButton label={strings.console.autoScroll} active={autoScroll} onClick={() => setAutoScroll(!autoScroll)}>
            <ArrowDownToLine />
          </IconButton>
          <IconButton label={strings.console.clear} onClick={clearOutput}>
            <Trash2 />
          </IconButton>
        </span>
      )
    case 'problems':
      return <span className="text-xs text-muted">{strings.problems.summary(errors, warnings)}</span>
    default:
      return null
  }
}
```

`Console.tsx` changes: remove the `<header>`; read `autoScroll` from the store and use `stickToBottom.current && autoScroll` in the scroll effect; after the output, render `{state === 'done' && <span className="text-muted">{`\n${strings.console.finished}`}</span>}`; the error line becomes `<span role="alert" className="text-error">{strings.console.errorAt(error.line, error.message)} <button type="button" className="underline" onClick={() => onReveal?.(error.line)}>{strings.console.seeLine(error.line)}</button></span>`; the input field gets a trailing `<kbd className="text-muted text-xs">↵</kbd>`. Output text keeps `font-mono`.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/PanelActions.test.tsx packages/editor/test/Console.test.tsx` → PASS.

- [ ] **Step 6: Problems keyboard rows and empty state**

Add to `test/Problems.test.tsx`:

```tsx
it('navigates rows with the keyboard and reveals on Enter', () => {
  const { store } = storeWith({ source: 'ab\ncd', diagnostics: [d1, d2] })
  const reveals: [number, number][] = []
  renderWithStore(<Problems onReveal={(from, to) => reveals.push([from, to])} />, store)
  const rows = screen.getAllByRole('row')
  expect(rows).toHaveLength(2)
  rows[0]?.focus()
  fireEvent.keyDown(rows[0] as HTMLElement, { key: 'ArrowDown' })
  expect(document.activeElement).toBe(rows[1])
  fireEvent.keyDown(rows[1] as HTMLElement, { key: 'Enter' })
  expect(reveals).toEqual([[d2.from, d2.to]])
})

it('shows the check and text when clean', () => {
  const { store } = storeWith({})
  renderWithStore(<Problems onReveal={() => {}} />, store)
  expect(screen.getByText('Sin problemas')).toBeDefined()
  expect(screen.queryByRole('row')).toBeNull()
})
```

Implement: `<div role="grid">` with `<div role="row" tabIndex={0} onKeyDown={…}>` rows (ArrowUp/ArrowDown move focus to the sibling row, Enter and Space call `onReveal`); the glyph cell, the message, and a `text-muted` cell with `strings.problems.line(position.line)`; the empty state renders `<CircleCheck className="text-success" />` next to `strings.problems.empty`. Remove the `<header>`.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Problems.test.tsx` → PASS.

- [ ] **Step 7: Variables collapsible frames, changed flash, empty text**

Add to `test/Variables.test.tsx`:

```tsx
it('renders frames as open details and flashes changed values', () => {
  vi.useFakeTimers()
  const { store, host } = storeWith({ state: 'paused' })
  renderWithStore(<Variables />, store)
  act(() => host.emit({ kind: 'paused', reason: 'step', line: 2, frames: [frameWith(1)] }))
  expect(screen.getAllByRole('group')).toHaveLength(1)
  act(() => host.emit({ kind: 'paused', reason: 'step', line: 3, frames: [frameWith(2)] }))
  const cell = screen.getByText('2')
  expect(cell.getAttribute('data-changed')).toBe('true')
  act(() => vi.advanceTimersByTime(600))
  expect(cell.getAttribute('data-changed')).toBeNull()
  vi.useRealTimers()
})

it('asks to pause when a program runs without frames', () => {
  const { store } = storeWith({ state: 'running' })
  renderWithStore(<Variables />, store)
  expect(screen.getByText('Pausa el programa para ver las variables')).toBeDefined()
})
```

with `frameWith(value)` building a one-variable frame. Implement with `<details open>`/`<summary>` per frame (`role="group"` comes from `<details>`), a `useRef<Map<string, string>>` of previous rendered values keyed by `frame.name/variable.name`, a `changed` `Set` recomputed on frame change, and a 600 ms timeout that clears it; the cell has `data-changed="true"` and class `bg-changed` while flashing. Empty text: `state === 'ready' ? strings.variables.empty : strings.variables.pauseToSee` when `frames.length === 0`. Remove the `<header>`.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Variables.test.tsx` → PASS.

- [ ] **Step 8: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm vitest run --project @stepcode/editor && pnpm vitest run --project @stepcode/codemirror
git add packages/editor/src/panels packages/editor/src/editor/extensions.ts packages/editor/test packages/codemirror/src/stepcode.ts packages/codemirror/test/stepcode.test.ts .changeset/codemirror-completion-flag.md
git commit -m "feat(editor): panel refinements — header actions, keyboard problems, changed flash, editor settings"
```

---

### Task 13: PWA, theme preference, icons, version

**Files:**
- Modify: `src/theme/theme.ts` (add functions), `packages/editor/vite.config.ts`, `packages/editor/tsconfig.json`, `packages/editor/index.html`
- Create: `src/pwa/register.ts`, `src/pwa/UpdateToast.tsx`, `packages/editor/public/{favicon.ico,pwa-64x64.png,pwa-192x192.png,pwa-512x512.png,maskable-icon-512x512.png,apple-touch-icon-180x180.png}`
- Test: `test/theme-preference.test.ts`, `test/pwa.test.tsx`

**Interfaces:**
- Consumes: `ThemePreference`, store `setSystemDark`, `notify`.
- Produces: `watchSystemTheme(onChange: (dark: boolean) => void, matchMedia?): () => void` (calls `onChange` once immediately, then on every change); `resolveInitialPreference(persisted: ThemePreference | undefined): ThemePreference`; `src/pwa/register.ts`: `useUpdatePrompt(): { needRefresh: boolean; update: () => void }` (wraps `virtual:pwa-register/react`'s `useRegisterSW`); `UpdateToast()` (renders a Radix-free inline toast in the corner: text + Recargar button, uses the store's strings). Vite `define: { __APP_VERSION__ }`.

- [ ] **Step 1: Write the failing theme test**

`test/theme-preference.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveInitialPreference, watchSystemTheme } from '../src/theme/theme'

function fakeMatchMedia(initial: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  const list = {
    matches: initial,
    addEventListener: (_: 'change', fn: (e: { matches: boolean }) => void) => listeners.add(fn),
    removeEventListener: (_: 'change', fn: (e: { matches: boolean }) => void) => listeners.delete(fn),
  }
  return { matchMedia: () => list, fire: (matches: boolean) => listeners.forEach((fn) => fn({ matches })), listeners }
}

describe('watchSystemTheme', () => {
  it('reports the current value and every change until stopped', () => {
    const media = fakeMatchMedia(true)
    const seen: boolean[] = []
    const stop = watchSystemTheme((dark) => seen.push(dark), media.matchMedia)
    media.fire(false)
    stop()
    media.fire(true)
    expect(seen).toEqual([true, false])
    expect(media.listeners.size).toBe(0)
  })

  it('does nothing without matchMedia', () => {
    const seen: boolean[] = []
    watchSystemTheme((dark) => seen.push(dark), undefined)()
    expect(seen).toEqual([false])
  })
})

describe('resolveInitialPreference', () => {
  it('keeps a stored preference and defaults to system', () => {
    expect(resolveInitialPreference('dark')).toBe('dark')
    expect(resolveInitialPreference(undefined)).toBe('system')
  })
})
```

- [ ] **Step 2: Implement in `theme.ts`**

```ts
import type { Theme, ThemePreference } from './types'

interface MediaList {
  readonly matches: boolean
  addEventListener?(type: 'change', listener: (event: { matches: boolean }) => void): void
  removeEventListener?(type: 'change', listener: (event: { matches: boolean }) => void): void
}

type MatchMediaFn = (query: string) => MediaList

/** Spec §2.4: follow `prefers-color-scheme` while the preference is `system`. */
export function watchSystemTheme(
  onChange: (dark: boolean) => void,
  matchMedia: MatchMediaFn | undefined = typeof window === 'undefined' ? undefined : window.matchMedia?.bind(window),
): () => void {
  if (matchMedia === undefined) {
    onChange(false)
    return () => {}
  }
  const list = matchMedia('(prefers-color-scheme: dark)')
  onChange(list.matches)
  const listener = (event: { matches: boolean }): void => onChange(event.matches)
  list.addEventListener?.('change', listener)
  return () => list.removeEventListener?.('change', listener)
}

export function resolveInitialPreference(persisted: ThemePreference | undefined): ThemePreference {
  return persisted ?? 'system'
}
```

Keep `resolveInitialTheme` and `applyTheme` from 4a. Run the test → PASS.

- [ ] **Step 3: Write the failing PWA test**

`test/pwa.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UpdateToast } from '../src/pwa/UpdateToast'
import { renderWithStore, storeWith } from './render'

describe('UpdateToast', () => {
  it('renders nothing until an update is waiting, then offers to reload', () => {
    const { store } = storeWith({})
    const update = vi.fn()
    const { rerender } = renderWithStore(<UpdateToast needRefresh={false} update={update} />, store)
    expect(screen.queryByRole('status')).toBeNull()
    rerender(<UpdateToast needRefresh update={update} />)
    expect(screen.getByRole('status').textContent).toContain('Hay una versión nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }))
    expect(update).toHaveBeenCalledOnce()
  })
})

describe('vite config', () => {
  it('registers the PWA plugin with prompt updates and the version define', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath, URL: NodeURL } = await import('node:url')
    const config = readFileSync(fileURLToPath(new NodeURL('../vite.config.ts', import.meta.url)), 'utf8')
    expect(config).toContain("registerType: 'prompt'")
    expect(config).toContain('__APP_VERSION__')
    expect(config).toContain("display: 'standalone'")
    expect(config).toContain('maskable-icon-512x512.png')
  })
})
```

(`renderWithStore` returns Testing Library's result, which has `rerender`; the rerender must keep the provider — wrap the element the same way `renderWithStore` does, or add a `rerenderWithStore` helper locally in the test.)

- [ ] **Step 4: Implement the PWA pieces**

Copy the icons:

```bash
cp /home/ubuntu/projects/stepcode-editor/public/{favicon.ico,pwa-64x64.png,pwa-192x192.png,pwa-512x512.png,maskable-icon-512x512.png,apple-touch-icon-180x180.png} packages/editor/public/
```

`packages/editor/vite.config.ts`:

```ts
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'fonts/*.woff2'],
      manifest: {
        name: 'StepCode',
        short_name: 'StepCode',
        description: 'Editor de pseudocódigo',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: '#ffffff',
        background_color: '#fafafa',
        icons: [
          { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,woff2,png,ico,svg}'] },
    }),
  ],
  test: {
    name: '@stepcode/editor',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
```

The two manifest colors are the light `--sc-surface` and `--sc-bg` values; the tokens-only scan covers `src/` only, and the manifest cannot read CSS variables — note the duplication in a comment. `theme_color` also goes in `index.html` as `<meta name="theme-color" content="#ffffff">` plus `<link rel="icon" href="/favicon.ico">` and `<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">`. Add `"vite-plugin-pwa/react"` to `tsconfig.json`'s `types` array.

`src/pwa/register.ts`:

```ts
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Spec §10: `prompt` registration — the app decides when to reload. */
export function useUpdatePrompt(): { needRefresh: boolean; update: () => void } {
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  return { needRefresh: needRefresh[0], update: () => void updateServiceWorker(true) }
}
```

`src/pwa/UpdateToast.tsx`:

```tsx
import { useEditorStore } from '../store/context'
import { stringsOf } from '../store/store'

export function UpdateToast({ needRefresh, update }: { needRefresh: boolean; update: () => void }) {
  const strings = useEditorStore(stringsOf)
  if (!needRefresh) return null
  return (
    <output className="fixed right-4 bottom-8 z-50 flex items-center gap-3 rounded-md bg-surface-raised px-3 py-2 text-fg text-sm shadow-panel">
      {strings.pwa.updateAvailable}
      <button type="button" className="rounded bg-accent px-2 py-1 text-bg" onClick={update}>
        {strings.pwa.reload}
      </button>
    </output>
  )
}
```

(`<output>` has the implicit `status` role.) `register.ts` is not imported by any test (the virtual module exists only under the Vite plugin); Task 14's `App` imports it inside `main.tsx`, not `App.tsx`, so tests never touch it.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/pwa.test.tsx packages/editor/test/theme-preference.test.ts` → PASS. Then `pnpm --filter @stepcode/editor build` → the `dist/` contains `sw.js` and `manifest.webmanifest`.

- [ ] **Step 5: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/vite.config.ts packages/editor/tsconfig.json packages/editor/index.html packages/editor/public packages/editor/src/pwa packages/editor/src/theme/theme.ts packages/editor/test/pwa.test.tsx packages/editor/test/theme-preference.test.ts
git commit -m "feat(editor): PWA with prompt updates, system theme watcher, app icons"
```

---
### Task 6: desktop shell on dockview — chrome, collapse, default layout, auto-expand, persistence

**Files:**
- Create: `src/shell/dock/theme.ts`, `src/shell/dock/dock.css`, `src/shell/dock/Tab.tsx`, `src/shell/dock/HeaderActions.tsx`, `src/shell/dock/collapse.ts`, `src/shell/dock/defaultLayout.ts`, `src/shell/dock/panels.tsx`, `src/shell/DesktopShell.tsx`, `packages/editor/public/popout.html`
- Test: `test/collapse.test.ts`, `test/defaultLayout.test.ts`, `test/dock-theme.test.ts`, `test/DesktopShell.test.tsx`

**Interfaces:**
- Consumes: `dockview-react` (facts above), the four panels, `PanelActions` (Task 11), store (`layout`, `setDockLayout`, `layoutReset`, `panelRequest`, `runSeq`, `pausedInRun`, `pendingInput`, `settings.layout.showConsoleOnRun`), `autoExpandTarget`, `stringsOf`, icons, `IconButton`.
- Produces:
  - `src/shell/dock/theme.ts`: `DOCK_THEME: DockviewTheme = { name: 'stepcode', className: 'sc-dock', dndOverlayMounting: 'absolute', dndPanelOverlay: 'group' }`, `HEADER_HEIGHT = 28`.
  - `src/shell/dock/collapse.ts`: `type Edge = 'top' | 'bottom' | 'left' | 'right'`; `edgeOf(group: GroupLike, container: { width: number; height: number }): Edge`; `collapseGroup(group: GroupLike, edge: Edge, headerSize: number): { restore: number }`; `expandGroup(group: GroupLike, edge: Edge, restore: number): void`; `class CollapseController` with `toggle(groupId)`, `collapse(groupId)`, `expand(groupId)`, `isCollapsed(groupId)`, `collapsedIds(): string[]`, `restoreFrom(ids: readonly string[])`, `dispose()` — takes the `DockviewApi` and an `onChange(ids)` callback. `GroupLike` is the structural subset of `DockviewGroupPanel` used (`id`, `api.width`, `api.height`, `api.setConstraints`, `api.setSize`, `api.location`, `element.getBoundingClientRect?`).
  - `src/shell/dock/defaultLayout.ts`: `applyDefaultLayout(api: DockviewApi): { bottomGroupId: string }` — editor panel alone, then `console`, `problems`, `variables` in one group below it (30 %, min 120 px), the editor group `locked = true`; `PANEL_TITLES(strings)`.
  - `src/shell/dock/panels.tsx`: `dockComponents` record (`editor`, `console`, `problems`, `variables`) wrapping the panels; `DockContext` providing `{ editor: RefObject<EditorHandle | null> }` so the console's `onReveal` and the problems' `onReveal` reach the editor.
  - `src/shell/dock/Tab.tsx`: `Tab(props: IDockviewPanelHeaderProps)` — label from `strings.panels[id]`, no close.
  - `src/shell/dock/HeaderActions.tsx`: `HeaderActions(props: IDockviewHeaderActionsProps & { controller: CollapseController })` — `PanelActions` for the active panel + the collapse chevron (not for floating/popout groups, not for the editor group).
  - `src/shell/DesktopShell.tsx`: `DesktopShell({ editorRef })`.

- [ ] **Step 1: Write the failing collapse test**

`test/collapse.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { CollapseController, collapseGroup, edgeOf, expandGroup, type GroupLike } from '../src/shell/dock/collapse'

function group(id: string, box: { x: number; y: number; width: number; height: number }, location: 'grid' | 'floating' = 'grid'): GroupLike & { constraints: unknown[]; sizes: unknown[] } {
  const constraints: unknown[] = []
  const sizes: unknown[] = []
  return {
    id,
    constraints,
    sizes,
    api: {
      width: box.width,
      height: box.height,
      location: { type: location },
      setConstraints: (c) => constraints.push(c),
      setSize: (s) => sizes.push(s),
    },
    element: { getBoundingClientRect: () => ({ ...box, top: box.y, left: box.x, right: box.x + box.width, bottom: box.y + box.height }) },
  }
}

const CONTAINER = { width: 1000, height: 600 }

describe('edgeOf', () => {
  it('names the edge a docked group sits on', () => {
    expect(edgeOf(group('a', { x: 0, y: 420, width: 1000, height: 180 }), CONTAINER)).toBe('bottom')
    expect(edgeOf(group('b', { x: 0, y: 0, width: 1000, height: 180 }), CONTAINER)).toBe('top')
    expect(edgeOf(group('c', { x: 700, y: 0, width: 300, height: 600 }), CONTAINER)).toBe('right')
    expect(edgeOf(group('d', { x: 0, y: 0, width: 300, height: 600 }), CONTAINER)).toBe('left')
  })
})

describe('collapseGroup / expandGroup', () => {
  it('constrains the cross-axis size to the header and restores it', () => {
    const g = group('a', { x: 0, y: 420, width: 1000, height: 180 })
    const { restore } = collapseGroup(g, 'bottom', 28)
    expect(restore).toBe(180)
    expect(g.constraints).toEqual([{ maximumHeight: 28 }])
    expect(g.sizes).toEqual([{ height: 28 }])
    expandGroup(g, 'bottom', restore)
    expect(g.constraints.at(-1)).toEqual({ maximumHeight: Number.POSITIVE_INFINITY })
    expect(g.sizes.at(-1)).toEqual({ height: 180 })
    const side = group('b', { x: 700, y: 0, width: 300, height: 600 })
    collapseGroup(side, 'right', 28)
    expect(side.constraints).toEqual([{ maximumWidth: 28 }])
  })
})

describe('CollapseController', () => {
  function api(groups: GroupLike[]) {
    return { groups, getGroup: (id: string) => groups.find((g) => g.id === id), width: CONTAINER.width, height: CONTAINER.height }
  }

  it('toggles, reports ids and restores from a saved list', () => {
    const bottom = group('bottom', { x: 0, y: 420, width: 1000, height: 180 })
    const changes: string[][] = []
    const controller = new CollapseController(api([bottom]), 28, (ids) => changes.push(ids))
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(true)
    expect(controller.collapsedIds()).toEqual(['bottom'])
    controller.toggle('bottom')
    expect(controller.isCollapsed('bottom')).toBe(false)
    expect(changes).toEqual([['bottom'], []])
    controller.restoreFrom(['bottom', 'missing'])
    expect(controller.collapsedIds()).toEqual(['bottom'])
    expect(bottom.sizes.at(-1)).toEqual({ height: 28 })
  })

  it('refuses floating groups and expands idempotently', () => {
    const floating = group('f', { x: 10, y: 10, width: 300, height: 200 }, 'floating')
    const controller = new CollapseController(api([floating]), 28, () => {})
    controller.collapse('f')
    expect(controller.isCollapsed('f')).toBe(false)
    controller.expand('f')
    expect(floating.constraints).toEqual([])
  })

  it('remembers the restore size at collapse time, defaulting to 30 % when unknown', () => {
    const tiny = group('t', { x: 0, y: 572, width: 1000, height: 28 })
    const controller = new CollapseController(api([tiny]), 28, () => {})
    controller.collapse('t')
    controller.expand('t')
    expect(tiny.sizes.at(-1)).toEqual({ height: 180 })
  })
})
```

- [ ] **Step 2: Write `collapse.ts`**

```ts
export type Edge = 'top' | 'bottom' | 'left' | 'right'

export interface GroupLike {
  readonly id: string
  readonly api: {
    readonly width: number
    readonly height: number
    readonly location: { readonly type: 'grid' | 'floating' | 'popout' }
    setConstraints(value: { minimumWidth?: number; minimumHeight?: number; maximumWidth?: number; maximumHeight?: number }): void
    setSize(value: { width?: number; height?: number }): void
  }
  readonly element?: { getBoundingClientRect(): { top: number; left: number; right: number; bottom: number; width: number; height: number } }
}

export interface ApiLike {
  readonly groups: readonly GroupLike[]
  getGroup(id: string): GroupLike | undefined
  readonly width: number
  readonly height: number
}

const MIN_RESTORE_FRACTION = 0.3

/** Which container edge the group touches; ties go to bottom (the default layout's group). */
export function edgeOf(group: GroupLike, container: { width: number; height: number }): Edge {
  const box = group.element?.getBoundingClientRect() ?? { top: 0, left: 0, right: group.api.width, bottom: group.api.height, width: group.api.width, height: group.api.height }
  const spansWidth = box.width >= container.width - 2
  if (spansWidth) return box.top <= 1 && box.bottom < container.height - 1 ? 'top' : 'bottom'
  return box.left <= 1 ? 'left' : 'right'
}

function vertical(edge: Edge): boolean {
  return edge === 'top' || edge === 'bottom'
}

/** Spec §3.3: shrink the cross-axis to the header height and freeze it there. */
export function collapseGroup(group: GroupLike, edge: Edge, headerSize: number): { restore: number } {
  const restore = vertical(edge) ? group.api.height : group.api.width
  if (vertical(edge)) {
    group.api.setConstraints({ maximumHeight: headerSize })
    group.api.setSize({ height: headerSize })
  } else {
    group.api.setConstraints({ maximumWidth: headerSize })
    group.api.setSize({ width: headerSize })
  }
  return { restore }
}

export function expandGroup(group: GroupLike, edge: Edge, restore: number): void {
  if (vertical(edge)) {
    group.api.setConstraints({ maximumHeight: Number.POSITIVE_INFINITY })
    group.api.setSize({ height: restore })
  } else {
    group.api.setConstraints({ maximumWidth: Number.POSITIVE_INFINITY })
    group.api.setSize({ width: restore })
  }
}

export class CollapseController {
  private readonly collapsed = new Map<string, { edge: Edge; restore: number }>()

  constructor(
    private readonly api: ApiLike,
    private readonly headerSize: number,
    private readonly onChange: (ids: string[]) => void,
  ) {}

  isCollapsed(id: string): boolean {
    return this.collapsed.has(id)
  }

  collapsedIds(): string[] {
    return [...this.collapsed.keys()]
  }

  collapse(id: string): void {
    const group = this.api.getGroup(id)
    if (group === undefined || group.api.location.type !== 'grid' || this.collapsed.has(id)) return
    const edge = edgeOf(group, this.api)
    const { restore } = collapseGroup(group, edge, this.headerSize)
    const fallback = (edge === 'top' || edge === 'bottom' ? this.api.height : this.api.width) * MIN_RESTORE_FRACTION
    this.collapsed.set(id, { edge, restore: restore > this.headerSize ? restore : fallback })
    this.onChange(this.collapsedIds())
  }

  expand(id: string): void {
    const entry = this.collapsed.get(id)
    const group = this.api.getGroup(id)
    if (entry === undefined || group === undefined) return
    expandGroup(group, entry.edge, entry.restore)
    this.collapsed.delete(id)
    this.onChange(this.collapsedIds())
  }

  toggle(id: string): void {
    if (this.collapsed.has(id)) this.expand(id)
    else this.collapse(id)
  }

  /** After `fromJSON`: re-apply the saved collapsed set; unknown ids are dropped silently. */
  restoreFrom(ids: readonly string[]): void {
    for (const id of ids) this.collapse(id)
  }

  dispose(): void {
    this.collapsed.clear()
  }
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/collapse.test.ts` → PASS.

- [ ] **Step 3: Write the failing default-layout and theme tests**

`test/defaultLayout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { applyDefaultLayout, DEFAULT_BOTTOM_FRACTION, DEFAULT_BOTTOM_MIN } from '../src/shell/dock/defaultLayout'

describe('applyDefaultLayout', () => {
  it('adds the editor alone and the three panels in one group below, locked editor', () => {
    const calls: unknown[] = []
    const groups: { id: string; locked: unknown; api: { setConstraints: (c: unknown) => void; setSize: (s: unknown) => void } }[] = []
    const api = {
      height: 600,
      addPanel: (options: { id: string; position?: unknown }) => {
        calls.push(options)
        const group = { id: `g-${groups.length}`, locked: false, api: { setConstraints: (c: unknown) => calls.push(c), setSize: (s: unknown) => calls.push(s) } }
        groups.push(group)
        return { id: options.id, group, api: { setActive: () => calls.push(`active:${options.id}`) } }
      },
    }
    const { bottomGroupId } = applyDefaultLayout(api as never)
    expect(calls[0]).toEqual({ id: 'editor', component: 'editor', tabComponent: 'tab' })
    expect(calls[1]).toMatchObject({ id: 'console', position: { referencePanel: 'editor', direction: 'below' } })
    expect(calls[2]).toMatchObject({ id: 'problems', position: { referencePanel: 'console', direction: 'within' } })
    expect(calls[3]).toMatchObject({ id: 'variables', position: { referencePanel: 'console', direction: 'within' } })
    expect(groups[0]?.locked).toBe(true)
    expect(bottomGroupId).toBe('g-1')
    expect(calls).toContainEqual({ minimumHeight: DEFAULT_BOTTOM_MIN })
    expect(calls).toContainEqual({ height: 600 * DEFAULT_BOTTOM_FRACTION })
    expect(calls.at(-1)).toBe('active:console')
  })
})
```

`test/dock-theme.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DOCK_THEME, HEADER_HEIGHT } from '../src/shell/dock/theme'

describe('dock theme', () => {
  const css = readFileSync(fileURLToPath(new NodeURL('../src/shell/dock/dock.css', import.meta.url)), 'utf8')

  it('names the class the stylesheet defines and maps every dv variable to a token', () => {
    expect(DOCK_THEME.className).toBe('sc-dock')
    expect(css).toContain('.sc-dock {')
    for (const line of css.split('\n').filter((l) => l.trim().startsWith('--dv-'))) {
      expect(line, line).toMatch(/var\(--sc-[a-z-]+\)|\d+px|none|0/)
    }
    expect(css).toContain(`--dv-tabs-and-actions-container-height: ${HEADER_HEIGHT}px`)
  })
})
```

- [ ] **Step 4: Write `theme.ts`, `dock.css`, `defaultLayout.ts`**

`src/shell/dock/theme.ts`:

```ts
import type { DockviewTheme } from 'dockview-react'

export const HEADER_HEIGHT = 28

/** Spec §3.1: our chrome, our colors; dockview only supplies the mechanics. */
export const DOCK_THEME: DockviewTheme = {
  name: 'stepcode',
  className: 'sc-dock',
  dndOverlayMounting: 'absolute',
  dndPanelOverlay: 'group',
}
```

`src/shell/dock/dock.css` (imported by `DesktopShell.tsx` after `dockview-react/dist/styles/dockview.css`):

```css
/* Spec §3.1: every dockview variable resolves to a token; no literal colors here. */
.sc-dock {
  --dv-group-view-background-color: var(--sc-bg);
  --dv-tabs-and-actions-container-background-color: var(--sc-surface);
  --dv-tabs-and-actions-container-height: 28px;
  --dv-tabs-and-actions-container-font-size: 12px;
  --dv-activegroup-visiblepanel-tab-background-color: var(--sc-surface);
  --dv-activegroup-visiblepanel-tab-color: var(--sc-fg);
  --dv-activegroup-hiddenpanel-tab-background-color: var(--sc-surface);
  --dv-activegroup-hiddenpanel-tab-color: var(--sc-fg-muted);
  --dv-inactivegroup-visiblepanel-tab-background-color: var(--sc-surface);
  --dv-inactivegroup-visiblepanel-tab-color: var(--sc-fg-muted);
  --dv-inactivegroup-hiddenpanel-tab-background-color: var(--sc-surface);
  --dv-inactivegroup-hiddenpanel-tab-color: var(--sc-fg-muted);
  --dv-tab-divider-color: var(--sc-border);
  --dv-separator-border: var(--sc-border);
  --dv-paneview-header-border-color: var(--sc-border);
  --dv-drag-over-background-color: var(--sc-accent-soft);
  --dv-drag-over-border-color: var(--sc-accent);
  --dv-floating-box-shadow: 0 8px 24px var(--sc-shadow);
  --dv-floating-border: 1px solid var(--sc-border);
  --dv-sash-color: var(--sc-border);
  --dv-active-sash-color: var(--sc-accent);
  --dv-icon-hover-background-color: var(--sc-surface-raised);
  --dv-scrollbar-background-color: var(--sc-border);
  --dv-tab-border-radius: 0;
  --dv-border-radius: 8px;
}

.sc-dock .dv-tab.sc-tab-active::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 2px;
  background: var(--sc-accent);
}

/* Spec §3.3: a side group collapsed to a strip reads bottom to top. */
.sc-dock .sc-collapsed-vertical .dv-tabs-and-actions-container {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
```

`src/shell/dock/defaultLayout.ts`:

```ts
import type { DockviewApi } from 'dockview-react'

export const DEFAULT_BOTTOM_FRACTION = 0.3
export const DEFAULT_BOTTOM_MIN = 120

/** Spec §3.2: editor alone; Consola, Problemas, Variables as tabs of one group below it. */
export function applyDefaultLayout(api: DockviewApi): { bottomGroupId: string } {
  const editor = api.addPanel({ id: 'editor', component: 'editor', tabComponent: 'tab' })
  editor.group.locked = true
  const console = api.addPanel({
    id: 'console',
    component: 'console',
    tabComponent: 'tab',
    position: { referencePanel: 'editor', direction: 'below' },
  })
  api.addPanel({ id: 'problems', component: 'problems', tabComponent: 'tab', position: { referencePanel: 'console', direction: 'within' } })
  api.addPanel({ id: 'variables', component: 'variables', tabComponent: 'tab', position: { referencePanel: 'console', direction: 'within' } })
  console.group.api.setConstraints({ minimumHeight: DEFAULT_BOTTOM_MIN })
  console.group.api.setSize({ height: api.height * DEFAULT_BOTTOM_FRACTION })
  console.api.setActive()
  return { bottomGroupId: console.group.id }
}
```

Run both tests → PASS.

- [ ] **Step 5: Write the failing DesktopShell test**

`test/DesktopShell.test.tsx` (one real dockview mount; happy-dom has no layout, so sizes are 0 and the assertions are structural):

```tsx
// @vitest-environment happy-dom
import { act, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import type { EditorHandle } from '../src/panels/Editor'
import { DesktopShell } from '../src/shell/DesktopShell'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

function mount(partial = {}) {
  const { store, host } = storeWith(partial)
  const editorRef = createRef<EditorHandle>()
  const rendered = renderWithStore(
    <TooltipProvider>
      <div style={{ width: 1000, height: 600 }}>
        <DesktopShell editorRef={editorRef} />
      </div>
    </TooltipProvider>,
    store,
  )
  return { store, host, editorRef, rendered }
}

describe('DesktopShell', () => {
  it('mounts the four panels in the default layout and saves it', async () => {
    const { store } = mount()
    for (const name of ['Editor', 'Consola', 'Problemas', 'Variables']) {
      expect(await screen.findByRole('region', { name })).toBeDefined()
    }
    await waitFor(() => expect(store.getState().layout.dockview).not.toBeNull())
    const json = store.getState().layout.dockview as { panels: Record<string, unknown> }
    expect(Object.keys(json.panels).sort()).toEqual(['console', 'editor', 'problems', 'variables'])
    expect(store.getState().layout.collapsed).toHaveLength(1)
  })

  it('expands the bottom group and activates the console when a run starts', async () => {
    const { store } = mount()
    await screen.findByRole('region', { name: 'Consola' })
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    act(() => store.getState().run())
    await waitFor(() => expect(store.getState().layout.collapsed).toEqual([]))
    expect(screen.getByRole('tab', { name: 'Consola', selected: true })).toBeDefined()
  })

  it('honours a panel request and a reset', async () => {
    const { store } = mount()
    await screen.findByRole('region', { name: 'Problemas' })
    act(() => store.getState().requestPanel('problems'))
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Problemas', selected: true })).toBeDefined())
    act(() => store.getState().resetLayout())
    await waitFor(() => expect(store.getState().layout.collapsed).toHaveLength(1))
    expect(screen.getByRole('tab', { name: 'Consola', selected: true })).toBeDefined()
  })

  it('restores a saved layout and discards an invalid one', async () => {
    const first = mount()
    await waitFor(() => expect(first.store.getState().layout.dockview).not.toBeNull())
    const saved = first.store.getState().layout
    first.rendered.unmount()
    const second = mount({ layout: { ...saved, collapsed: [] } })
    await screen.findByRole('region', { name: 'Consola' })
    expect(second.store.getState().layout.collapsed).toEqual([])
    second.rendered.unmount()
    const third = mount({ layout: { dockview: { grid: 'garbage' }, collapsed: [], sheet: 'collapsed' } })
    await screen.findByRole('region', { name: 'Consola' })
    await waitFor(() => expect(third.store.getState().layout.collapsed).toHaveLength(1))
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/DesktopShell.test.tsx` → FAIL.

- [ ] **Step 6: Write `panels.tsx`, `Tab.tsx`, `HeaderActions.tsx`, `DesktopShell.tsx`, `popout.html`**

`src/shell/dock/panels.tsx`:

```tsx
import type { IDockviewPanelProps } from 'dockview-react'
import { createContext, type RefObject, useContext } from 'react'
import { Console } from '../../panels/Console'
import { Editor, type EditorHandle } from '../../panels/Editor'
import { Problems } from '../../panels/Problems'
import { Variables } from '../../panels/Variables'

export const DockContext = createContext<{ editor: RefObject<EditorHandle | null> } | null>(null)

function useEditorRef(): RefObject<EditorHandle | null> {
  const context = useContext(DockContext)
  if (context === null) throw new Error('dock panels need a DockContext')
  return context.editor
}

function EditorPanel(_: IDockviewPanelProps) {
  return <Editor handleRef={useEditorRef()} />
}

function ConsolePanel(_: IDockviewPanelProps) {
  const editor = useEditorRef()
  return <Console onReveal={(line) => editor.current?.revealLine(line)} />
}

function ProblemsPanel(_: IDockviewPanelProps) {
  const editor = useEditorRef()
  return <Problems onReveal={(from, to) => editor.current?.revealSpan(from, to)} />
}

function VariablesPanel(_: IDockviewPanelProps) {
  return <Variables />
}

/** The dockview component registry; ids double as `PanelId`s. */
export const dockComponents = {
  editor: EditorPanel,
  console: ConsolePanel,
  problems: ProblemsPanel,
  variables: VariablesPanel,
}
```

(`EditorHandle.revealLine(line)` — add it in Task 11's `Editor.tsx` as `revealSpan(lineStart, lineStart)` of that line; if Task 11 has already landed without it, add it here and note the cross-task edit in the report.)

`src/shell/dock/Tab.tsx`:

```tsx
import type { IDockviewPanelHeaderProps } from 'dockview-react'
import { useEditorStore } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'

/** Spec §3.1: label only, accent underline on the active tab, nothing else. */
export function Tab(props: IDockviewPanelHeaderProps) {
  const strings = useEditorStore(stringsOf)
  const id = props.api.id as PanelId
  const active = props.api.isActive
  return (
    <div
      role="tab"
      aria-selected={active}
      className={`sc-tab relative flex h-7 items-center px-3 text-xs ${active ? 'sc-tab-active text-fg' : 'text-muted'}`}
    >
      {strings.panels[id] ?? props.api.title ?? id}
    </div>
  )
}
```

`src/shell/dock/HeaderActions.tsx`:

```tsx
import type { IDockviewHeaderActionsProps } from 'dockview-react'
import { PanelActions } from '../../panels/PanelActions'
import { useEditorStore } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'
import { ChevronDown, ChevronUp } from '../../ui/icons'
import { IconButton } from '../../ui/Tooltip'
import type { CollapseController } from './collapse'

export function HeaderActions(props: IDockviewHeaderActionsProps & { controller: CollapseController | null; collapsedIds: readonly string[] }) {
  const strings = useEditorStore(stringsOf)
  const panel = props.activePanel?.id as PanelId | undefined
  const collapsible = props.api.location.type === 'grid' && panel !== 'editor' && props.controller !== null
  const collapsed = props.collapsedIds.includes(props.group.id)
  return (
    <div className="flex h-7 items-center gap-1 pr-1">
      {panel !== undefined && !collapsed ? <PanelActions panel={panel} /> : null}
      {collapsible ? (
        <IconButton label={collapsed ? strings.dock.expand : strings.dock.collapse} onClick={() => props.controller?.toggle(props.group.id)}>
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
      ) : null}
    </div>
  )
}
```

`src/shell/DesktopShell.tsx`:

```tsx
import 'dockview-react/dist/styles/dockview.css'
import './dock/dock.css'
import { type DockviewApi, DockviewReact, type DockviewReadyEvent, type IDockviewHeaderActionsProps } from 'dockview-react'
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EditorHandle } from '../panels/Editor'
import { useEditorStoreApi } from '../store/context'
import type { PanelId } from '../store/layout'
import { autoExpandTarget } from './autoExpand'
import { CollapseController } from './dock/collapse'
import { applyDefaultLayout } from './dock/defaultLayout'
import { HeaderActions } from './dock/HeaderActions'
import { DockContext, dockComponents } from './dock/panels'
import { Tab } from './dock/Tab'
import { DOCK_THEME, HEADER_HEIGHT } from './dock/theme'

const tabComponents = { tab: Tab }

export function DesktopShell({ editorRef }: { editorRef: RefObject<EditorHandle | null> }) {
  const store = useEditorStoreApi()
  const apiRef = useRef<DockviewApi | null>(null)
  const controllerRef = useRef<CollapseController | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<readonly string[]>([])
  const manuallyCollapsed = useRef(new Set<string>())
  const context = useMemo(() => ({ editor: editorRef }), [editorRef])

  const save = useCallback(() => {
    const api = apiRef.current
    const controller = controllerRef.current
    if (api === null || controller === null) return
    store.getState().setDockLayout(api.toJSON() as unknown as Record<string, unknown>, controller.collapsedIds())
  }, [store])

  const reset = useCallback(() => {
    const api = apiRef.current
    if (api === null) return
    controllerRef.current?.dispose()
    api.clear()
    const { bottomGroupId } = applyDefaultLayout(api)
    const controller = new CollapseController(api, HEADER_HEIGHT, (ids) => {
      setCollapsedIds(ids)
      save()
    })
    controllerRef.current = controller
    controller.collapse(bottomGroupId)
    manuallyCollapsed.current.clear()
    save()
  }, [save])

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      const api = event.api
      apiRef.current = api
      const saved = store.getState().layout
      let restored = false
      if (saved.dockview !== null) {
        try {
          api.fromJSON(saved.dockview as never)
          restored = api.panels.length === 4 && api.getPanel('editor') !== undefined
          if (!restored) api.clear()
        } catch (error) {
          console.warn('stepcode: discarding the saved layout', error)
          api.clear()
        }
      }
      if (restored) {
        const editorGroup = api.getPanel('editor')?.group
        if (editorGroup !== undefined) editorGroup.locked = true
        const controller = new CollapseController(api, HEADER_HEIGHT, (ids) => {
          setCollapsedIds(ids)
          save()
        })
        controllerRef.current = controller
        controller.restoreFrom(saved.collapsed)
        save()
      } else {
        reset()
      }
      const disposable = api.onDidLayoutChange(() => save())
      return () => disposable.dispose()
    },
    [store, save, reset],
  )

  /** Expand the group holding `panel` and make it the active tab (spec §3.4 / Vista). */
  const reveal = useCallback((panel: PanelId, respectManual: boolean) => {
    const api = apiRef.current
    const controller = controllerRef.current
    const target = api?.getPanel(panel)
    if (api === null || controller === null || target === undefined) return
    const groupId = target.group.id
    if (controller.isCollapsed(groupId)) {
      if (respectManual && manuallyCollapsed.current.has(groupId)) return
      controller.expand(groupId)
    }
    target.api.setActive()
  }, [])

  useEffect(() => {
    let previous = store.getState()
    return store.subscribe((next) => {
      if (next.layoutReset !== previous.layoutReset) reset()
      if (next.panelRequest !== previous.panelRequest && next.panelRequest !== null) reveal(next.panelRequest.id, false)
      if (next.runSeq !== previous.runSeq) manuallyCollapsed.current.clear()
      const event = autoExpandTarget(previous, next, next.settings.layout.showConsoleOnRun)
      if (event !== null) reveal(event.panel, true)
      previous = next
    })
  }, [store, reset, reveal])

  // A collapse the user performs during a run is remembered until the next run (spec §3.4).
  const controllerFor = useCallback((): CollapseController | null => {
    const controller = controllerRef.current
    if (controller === null) return null
    return new Proxy(controller, {
      get(target, key) {
        if (key === 'toggle') {
          return (id: string) => {
            if (!target.isCollapsed(id)) manuallyCollapsed.current.add(id)
            target.toggle(id)
          }
        }
        return Reflect.get(target, key)
      },
    })
  }, [])

  const rightHeaderActionsComponent = useCallback(
    (props: IDockviewHeaderActionsProps) => <HeaderActions {...props} controller={controllerFor()} collapsedIds={collapsedIds} />,
    [controllerFor, collapsedIds],
  )

  return (
    <DockContext.Provider value={context}>
      <DockviewReact
        className="h-full w-full"
        theme={DOCK_THEME}
        components={dockComponents}
        tabComponents={tabComponents}
        rightHeaderActionsComponent={rightHeaderActionsComponent}
        onReady={onReady}
        singleTabMode="fullwidth"
        floatingGroupBounds="boundedWithinViewport"
      />
    </DockContext.Provider>
  )
}
```

`packages/editor/public/popout.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>StepCode</title>
  </head>
  <body></body>
</html>
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/DesktopShell.test.tsx` → PASS. Under happy-dom dockview may need `ResizeObserver` (happy-dom provides one) and non-zero sizes for `setSize` to take effect; the tests only assert the collapsed id set and tab selection, both of which the controller tracks itself. If `aria-selected` is not visible through `getByRole('tab')` because dockview wraps the tab in its own element, query `screen.getByText('Consola').closest('[role=tab]')`.

- [ ] **Step 7: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/shell/dock packages/editor/src/shell/DesktopShell.tsx packages/editor/public/popout.html packages/editor/test/collapse.test.ts packages/editor/test/defaultLayout.test.ts packages/editor/test/dock-theme.test.ts packages/editor/test/DesktopShell.test.tsx
git commit -m "feat(editor): dockview desktop shell with collapse, auto-expand and layout persistence"
```

---

### Task 7: toolbar, filename, run controls, menu, shortcuts

**Files:**
- Create: `src/shell/Toolbar.tsx`, `src/shell/Filename.tsx`, `src/shell/RunControls.tsx`, `src/shell/Menu.tsx`, `src/shell/shortcuts.ts`
- Test: `test/Toolbar.test.tsx` is 4a's (left untouched until Task 14 deletes it); new files `test/ShellToolbar.test.tsx`, `test/Filename.test.tsx`, `test/RunControls.test.tsx`, `test/Menu.test.tsx`, `test/shell-shortcuts.test.ts`

**Interfaces:**
- Consumes: store, `IconButton`, icons, `newDocument/openFile/saveFile/saveFileAs` + `FileEnvironment` (Task 5), `profileItems` (Task 8's `StatusBar.tsx` — import only the pure function), `@radix-ui/react-dropdown-menu`.
- Produces:
  - `RunControls({ compact?: boolean })`: the state table of spec §4.3, using `IconButton` with shortcuts; placeholders for hidden buttons (`<span className="w-0 transition-[width]" aria-hidden />`) so the cluster keeps its slot order.
  - `Filename()`: inline input; commit on Enter/blur, revert on Escape/empty, appends `.stepcode` through `nameWithExtension`; `●` when dirty (`aria-label` `strings.toolbar.filename`).
  - `Menu({ env }: { env: FileEnvironment })`: Radix dropdown with the spec §4.4 tree; `MenuItems` as a plain list for the phone sheet (Task 12 reuses `menuModel(store, env, strings)` → `MenuEntry[]`).
  - `Toolbar({ env, compact? })`: menu button + Filename + file actions (hidden when `compact`) on the left, `RunControls` on the right.
  - `src/shell/shortcuts.ts`: 4a's `shortcutFor`, `isLegal`, `performShortcut`, `installShortcuts(store, env, target?)` extended with `'new' | 'open' | 'save' | 'saveAs' | 'settings'` (Ctrl/⌘+N only while the editor has focus — the handler receives `event.target` and checks `.closest('.cm-editor')`), and `SHORTCUTS: Record<ShortcutAction, string>` for tooltip labels.

- [ ] **Step 1: Write the failing shortcut test**

`test/shell-shortcuts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { shortcutFor, SHORTCUTS } from '../src/shell/shortcuts'

const key = (k: string, mods: Partial<{ ctrl: boolean; shift: boolean; meta: boolean; alt: boolean; inEditor: boolean }> = {}) => ({
  key: k,
  ctrlKey: mods.ctrl ?? false,
  shiftKey: mods.shift ?? false,
  metaKey: mods.meta ?? false,
  altKey: mods.alt ?? false,
  inEditor: mods.inEditor ?? false,
})

describe('shortcutFor (shell)', () => {
  it('keeps the 4a keys', () => {
    expect(shortcutFor(key('F5'))).toBe('runOrContinue')
    expect(shortcutFor(key('F5', { shift: true }))).toBe('stop')
    expect(shortcutFor(key('F11', { shift: true }))).toBe('stepOut')
  })

  it('adds the file and settings keys with Ctrl or ⌘', () => {
    expect(shortcutFor(key('o', { ctrl: true }))).toBe('open')
    expect(shortcutFor(key('s', { meta: true }))).toBe('save')
    expect(shortcutFor(key('S', { ctrl: true, shift: true }))).toBe('saveAs')
    expect(shortcutFor(key(',', { ctrl: true }))).toBe('settings')
    expect(shortcutFor(key('n', { ctrl: true }))).toBeNull()
    expect(shortcutFor(key('n', { ctrl: true, inEditor: true }))).toBe('new')
    expect(shortcutFor(key('s', { ctrl: true, alt: true }))).toBeNull()
  })

  it('labels every action', () => {
    expect(SHORTCUTS.save).toBe('Ctrl+S')
    expect(SHORTCUTS.saveAs).toBe('Ctrl+Shift+S')
    expect(SHORTCUTS.settings).toBe('Ctrl+,')
    expect(SHORTCUTS.runOrContinue).toBe('F5')
  })
})
```

- [ ] **Step 2: Write `shortcuts.ts`**

Copy 4a's `src/components/shortcuts.ts` to `src/shell/shortcuts.ts` and change:

```ts
export type ShortcutAction =
  | 'runOrContinue' | 'stepOver' | 'stepInto' | 'stepOut' | 'pause' | 'stop'
  | 'new' | 'open' | 'save' | 'saveAs' | 'settings'

export interface KeyLike {
  readonly key: string
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  /** Whether the event target is inside the code editor (Ctrl+N is intercepted only there). */
  readonly inEditor?: boolean
}

export const SHORTCUTS: Readonly<Record<ShortcutAction, string>> = {
  runOrContinue: 'F5', stepOver: 'F10', stepInto: 'F11', stepOut: 'Shift+F11', pause: 'F6', stop: 'Shift+F5',
  new: 'Ctrl+N', open: 'Ctrl+O', save: 'Ctrl+S', saveAs: 'Ctrl+Shift+S', settings: 'Ctrl+,',
}

export function shortcutFor(event: KeyLike): ShortcutAction | null {
  const primary = event.ctrlKey || event.metaKey
  if (primary && !event.altKey) {
    switch (event.key.toLowerCase()) {
      case 'n': return event.inEditor === true && !event.shiftKey ? 'new' : null
      case 'o': return event.shiftKey ? null : 'open'
      case 's': return event.shiftKey ? 'saveAs' : 'save'
      case ',': return 'settings'
      default: return null
    }
  }
  if (event.ctrlKey || event.altKey || event.metaKey) return null
  // …the 4a function-key switch unchanged…
}
```

`isLegal` returns `true` for the five new actions; `performShortcut(store, action, env)` dispatches `newDocument`, `openFile`, `saveFile`, `saveFileAs` (fire-and-forget promises) and `openDialog('settings')`; `installShortcuts(store, env, target = window)` computes `inEditor` from `(event.target as Element | null)?.closest?.('.cm-editor') !== null` and keeps the always-swallow rule for function keys and the file keys (Ctrl+N is swallowed only when `inEditor`).

Run the test → PASS.

- [ ] **Step 3: Write the failing RunControls and Filename tests**

`test/RunControls.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { WorkerState } from '../src/runtime/protocol'
import { RunControls } from '../src/shell/RunControls'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

function visible(): string[] {
  return screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? '')
}

describe('RunControls', () => {
  it.each<[WorkerState, string[]]>([
    ['ready', ['Ejecutar', 'Depurar']],
    ['done', ['Ejecutar', 'Depurar']],
    ['error', ['Ejecutar', 'Depurar']],
    ['running', ['Pausar', 'Detener']],
    ['paused', ['Continuar', 'Paso', 'Entrar', 'Salir', 'Detener']],
    ['input', ['Detener']],
    ['waiting', ['Detener']],
  ])('in %s shows %j', (state, expected) => {
    const { store } = storeWith({ state })
    renderWithStore(<TooltipProvider><RunControls /></TooltipProvider>, store)
    expect(visible()).toEqual(expected)
  })

  it('Depurar starts in step mode; Ejecutar in run mode', () => {
    const { store, host } = storeWith({})
    renderWithStore(<TooltipProvider><RunControls /></TooltipProvider>, store)
    fireEvent.click(screen.getByRole('button', { name: 'Depurar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(host.calls).toEqual(['start:step'])
  })

  it('shows Ejecutar enabled with errors but opens Problemas instead of running', () => {
    const { store, host } = storeWith({ diagnostics: [{ from: 0, to: 1, severity: 'error', message: 'x' }] })
    renderWithStore(<TooltipProvider><RunControls /></TooltipProvider>, store)
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(host.calls).toEqual([])
    expect(store.getState().panelRequest?.id).toBe('problems')
  })
})
```

`test/Filename.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Filename } from '../src/shell/Filename'
import { renderWithStore, storeWith } from './render'

describe('Filename', () => {
  it('shows the name, commits on Enter with the extension, reverts on Escape and on empty', () => {
    const { store } = storeWith({})
    renderWithStore(<Filename />, store)
    const input = screen.getByRole('textbox', { name: 'Nombre del archivo' }) as HTMLInputElement
    expect(input.value).toBe('sin título.stepcode')
    fireEvent.change(input, { target: { value: 'hola' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(store.getState().name).toBe('hola.stepcode')
    fireEvent.change(input, { target: { value: 'otro' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('hola.stepcode')
    fireEvent.change(input, { target: { value: '  ' } })
    fireEvent.blur(input)
    expect(store.getState().name).toBe('hola.stepcode')
  })

  it('marks an unsaved document', () => {
    const { store } = storeWith({})
    renderWithStore(<Filename />, store)
    expect(screen.queryByText('●')).toBeNull()
    store.getState().setSource('x')
    expect(screen.getByText('●')).toBeDefined()
  })
})
```

(The dirty-dot assertion may need `act(() => store.getState().setSource('x'))`.)

- [ ] **Step 4: Write `RunControls.tsx` and `Filename.tsx`**

`src/shell/RunControls.tsx`:

```tsx
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../store/context'
import { canEdit, hasErrors, stringsOf } from '../store/store'
import { ArrowDownToDot, ArrowUpFromDot, Bug, Pause, Play, Square, StepForward } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'
import { SHORTCUTS } from './shortcuts'

type Slot = 'run' | 'debug' | 'continue' | 'stepOver' | 'stepInto' | 'stepOut' | 'pause' | 'stop'
const ORDER: readonly Slot[] = ['run', 'continue', 'debug', 'stepOver', 'stepInto', 'stepOut', 'pause', 'stop']

/** Spec §4.3: which slots each run state shows. */
export function slotsFor(state: string): readonly Slot[] {
  switch (state) {
    case 'running': return ['pause', 'stop']
    case 'paused': return ['continue', 'stepOver', 'stepInto', 'stepOut', 'stop']
    case 'input':
    case 'waiting': return ['stop']
    default: return ['run', 'debug']
  }
}

export function RunControls({ compact = false }: { compact?: boolean }) {
  const strings = useEditorStore(stringsOf)
  const state = useEditorStore((s) => s.state)
  const errors = useEditorStore(hasErrors)
  const a = useEditorStore(useShallow((s) => ({ run: s.run, stepInto: s.stepInto, stepOver: s.stepOver, stepOut: s.stepOut, continue: s.continue, pause: s.pause, stop: s.stop, requestPanel: s.requestPanel })))
  const t = strings.toolbar
  const shown = new Set(compact ? slotsFor(state).filter((slot) => slot === 'run' || slot === 'stop' || slot === 'pause' || slot === 'continue') : slotsFor(state))
  const runOrProblems = (): void => (errors ? a.requestPanel('problems') : a.run())
  const buttons: Record<Slot, { label: string; shortcut: string; icon: React.JSX.Element; onClick: () => void }> = {
    run: { label: t.run, shortcut: SHORTCUTS.runOrContinue, icon: <Play />, onClick: runOrProblems },
    debug: { label: t.debug, shortcut: SHORTCUTS.stepInto, icon: <Bug />, onClick: () => (errors ? a.requestPanel('problems') : a.stepInto()) },
    continue: { label: t.continue, shortcut: SHORTCUTS.runOrContinue, icon: <Play />, onClick: a.continue },
    stepOver: { label: t.stepOver, shortcut: SHORTCUTS.stepOver, icon: <StepForward />, onClick: a.stepOver },
    stepInto: { label: t.stepInto, shortcut: SHORTCUTS.stepInto, icon: <ArrowDownToDot />, onClick: a.stepInto },
    stepOut: { label: t.stepOut, shortcut: SHORTCUTS.stepOut, icon: <ArrowUpFromDot />, onClick: a.stepOut },
    pause: { label: t.pause, shortcut: SHORTCUTS.pause, icon: <Pause />, onClick: a.pause },
    stop: { label: t.stop, shortcut: SHORTCUTS.stop, icon: <Square />, onClick: a.stop },
  }
  return (
    <div className="flex items-center gap-1" data-state={state} data-editable={canEdit(state)}>
      {ORDER.map((slot) =>
        shown.has(slot) ? (
          <IconButton key={slot} label={buttons[slot].label} shortcut={buttons[slot].shortcut} onClick={buttons[slot].onClick}>
            {buttons[slot].icon}
          </IconButton>
        ) : (
          <span key={slot} aria-hidden="true" className="inline-block w-0 transition-[width] duration-150" />
        ),
      )}
    </div>
  )
}
```

`src/shell/Filename.tsx`:

```tsx
import { type KeyboardEvent, useEffect, useState } from 'react'
import { useEditorStore } from '../store/context'
import { nameWithExtension } from '../store/document'
import { isDirty, stringsOf } from '../store/store'

/** Spec §4.2: plain text until hovered or focused; Enter/blur commit, Escape reverts. */
export function Filename() {
  const strings = useEditorStore(stringsOf)
  const name = useEditorStore((s) => s.name)
  const dirty = useEditorStore(isDirty)
  const setName = useEditorStore((s) => s.setName)
  const [draft, setDraft] = useState(name)
  useEffect(() => setDraft(name), [name])
  const commit = (): void => {
    const next = nameWithExtension(draft)
    if (next === '') setDraft(name)
    else if (next !== name) setName(next)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') { event.preventDefault(); commit(); event.currentTarget.blur() }
    if (event.key === 'Escape') { setDraft(name); event.currentTarget.blur() }
  }
  return (
    <span className="flex items-center gap-1 text-sm">
      <input
        aria-label={strings.toolbar.filename}
        value={draft}
        size={Math.min(32, Math.max(8, draft.length))}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className="rounded border border-transparent bg-transparent px-1 text-fg outline-none hover:border-border focus:border-accent"
      />
      {dirty ? <span aria-hidden="true" className="text-muted">●</span> : null}
    </span>
  )
}
```

Run both tests → PASS.

- [ ] **Step 5: Write the failing Menu and Toolbar tests**

`test/Menu.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Menu, menuModel } from '../src/shell/Menu'
import { stringsFor } from '../src/strings'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('menuModel', () => {
  it('lists the spec tree in order with separators and submenus', () => {
    const { store } = storeWith({})
    const model = menuModel(store, env, stringsFor('es'))
    expect(model.map((e) => (e.kind === 'separator' ? '—' : e.label))).toEqual([
      'Nuevo', 'Abrir…', 'Guardar', 'Guardar como…', '—', 'Ejemplos…', 'Compartir…', '—', 'Perfil', 'Vista', '—', 'Ajustes…', 'Acerca de',
    ])
    const view = model.find((e) => e.kind === 'submenu' && e.label === 'Vista')
    expect(view?.kind === 'submenu' && view.items.map((i) => (i.kind === 'item' ? i.label : '—'))).toEqual(['Consola', 'Problemas', 'Variables', '—', 'Restablecer diseño'])
  })
})

describe('Menu', () => {
  async function open() {
    const { store } = storeWith({})
    renderWithStore(<TooltipProvider><Menu env={env} /></TooltipProvider>, store)
    const trigger = screen.getByRole('button', { name: 'Menú' })
    await act(async () => {
      fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })
      fireEvent.keyDown(trigger, { key: 'Enter' })
    })
    return store
  }

  it('opens dialogs and dispatches actions', async () => {
    const store = await open()
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ajustes…' }))
    expect(store.getState().dialog).toBe('settings')
    await open()
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Acerca de' }))
  })

  it('Vista items request panels; reset resets the layout', async () => {
    const store = await open()
    fireEvent.pointerMove(await screen.findByRole('menuitem', { name: 'Vista' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Problemas' }))
    expect(store.getState().panelRequest?.id).toBe('problems')
  })
})
```

`test/ShellToolbar.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toolbar } from '../src/shell/Toolbar'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('Toolbar (shell)', () => {
  it('has menu, filename, file actions on the left and the run cluster on the right', () => {
    const { store } = storeWith({})
    renderWithStore(<TooltipProvider><Toolbar env={env} /></TooltipProvider>, store)
    const names = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))
    expect(names).toEqual(['Menú', 'Nuevo', 'Abrir…', 'Guardar', 'Ejecutar', 'Depurar'])
    expect(screen.getByRole('textbox', { name: 'Nombre del archivo' })).toBeDefined()
  })

  it('hides file actions when compact', () => {
    const { store } = storeWith({})
    renderWithStore(<TooltipProvider><Toolbar env={env} compact /></TooltipProvider>, store)
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull()
  })

  it('Nuevo replaces the document with the starter', () => {
    const { store } = storeWith({})
    renderWithStore(<TooltipProvider><Toolbar env={env} /></TooltipProvider>, store)
    store.getState().setSource('')
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo' }))
    expect(store.getState().source).toContain('Proceso Hola')
  })
})
```

- [ ] **Step 6: Write `Menu.tsx` and `Toolbar.tsx`**

`src/shell/Menu.tsx`:

```tsx
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { type FileEnvironment, newDocument, openFile, saveFile, saveFileAs } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { PANEL_IDS } from '../store/layout'
import { type EditorStore, stringsOf } from '../store/store'
import type { Strings } from '../strings'
import { Check, Hexagon } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'
import { profileItems } from './StatusBar'
import { SHORTCUTS } from './shortcuts'

export type MenuEntry =
  | { kind: 'item'; label: string; shortcut?: string; checked?: boolean; onSelect: () => void }
  | { kind: 'separator' }
  | { kind: 'submenu'; label: string; items: MenuEntry[] }

/** Spec §4.4, as data so the desktop dropdown and the phone sheet render the same tree. */
export function menuModel(store: EditorStore, env: FileEnvironment, strings: Strings): MenuEntry[] {
  const s = store.getState()
  const item = (label: string, onSelect: () => void, extra: { shortcut?: string; checked?: boolean } = {}): MenuEntry => ({ kind: 'item', label, onSelect, ...extra })
  return [
    item(strings.toolbar.new, () => newDocument(store), { shortcut: SHORTCUTS.new }),
    item(strings.toolbar.open, () => void openFile(store, env), { shortcut: SHORTCUTS.open }),
    item(strings.toolbar.save, () => void saveFile(store, env), { shortcut: SHORTCUTS.save }),
    item(strings.toolbar.saveAs, () => void saveFileAs(store, env), { shortcut: SHORTCUTS.saveAs }),
    { kind: 'separator' },
    item(strings.menu.examples, () => s.openDialog('examples')),
    item(strings.menu.share, () => s.openDialog('share')),
    { kind: 'separator' },
    {
      kind: 'submenu',
      label: strings.menu.profile,
      items: [
        ...profileItems(s).map((p) => item(p.name, () => s.setProfile(p.id), { checked: p.id === s.profileId })),
        { kind: 'separator' },
        item(strings.menu.customize, () => s.openDialog('settings')),
      ],
    },
    {
      kind: 'submenu',
      label: strings.menu.view,
      items: [
        ...PANEL_IDS.filter((id) => id !== 'editor').map((id) => item(strings.panels[id], () => s.requestPanel(id))),
        { kind: 'separator' },
        item(strings.menu.resetLayout, () => s.resetLayout()),
      ],
    },
    { kind: 'separator' },
    item(strings.menu.settings, () => s.openDialog('settings'), { shortcut: SHORTCUTS.settings }),
    item(strings.menu.about, () => s.openDialog('about')),
  ]
}

const ITEM = 'flex h-8 cursor-default select-none items-center gap-2 rounded px-2 text-sm outline-none data-[highlighted]:bg-surface-raised'

function Entries({ entries }: { entries: MenuEntry[] }) {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.kind === 'separator') return <Dropdown.Separator key={`sep-${index}`} className="my-1 border-t border-border" />
        if (entry.kind === 'submenu') {
          return (
            <Dropdown.Sub key={entry.label}>
              <Dropdown.SubTrigger className={ITEM}>{entry.label}<span className="ml-auto text-muted">▸</span></Dropdown.SubTrigger>
              <Dropdown.Portal>
                <Dropdown.SubContent className="z-50 min-w-48 rounded-md bg-surface p-1 text-fg shadow-panel" sideOffset={4}>
                  <Entries entries={entry.items} />
                </Dropdown.SubContent>
              </Dropdown.Portal>
            </Dropdown.Sub>
          )
        }
        return (
          <Dropdown.Item key={entry.label} className={ITEM} onSelect={entry.onSelect}>
            <span className="w-4">{entry.checked ? <Check /> : null}</span>
            {entry.label}
            {entry.shortcut !== undefined ? <span className="ml-auto pl-4 text-muted text-xs">{entry.shortcut}</span> : null}
          </Dropdown.Item>
        )
      })}
    </>
  )
}

export function Menu({ env }: { env: FileEnvironment }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  // Recomputed per render so profile checkmarks and names stay current.
  const entries = menuModel(store, env, strings)
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <IconButton label={strings.toolbar.menu} onClick={() => {}}>
          <Hexagon size={20} />
        </IconButton>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="start" sideOffset={6} className="z-50 min-w-56 rounded-md bg-surface p-1 text-fg shadow-panel">
          <Entries entries={entries} />
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}
```

Shortcut labels in the menu go through `keyLabel(shortcut, isMac())` (import from `../ui/keys`). `src/shell/Toolbar.tsx`:

```tsx
import { type FileEnvironment, newDocument, openFile, saveFile } from '../files/actions'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { stringsOf } from '../store/store'
import { FilePlus, FolderOpen, Save } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'
import { Filename } from './Filename'
import { Menu } from './Menu'
import { RunControls } from './RunControls'
import { SHORTCUTS } from './shortcuts'

/** Spec §4.1: menu, filename, file actions left; run cluster right; nothing in the middle. */
export function Toolbar({ env, compact = false }: { env: FileEnvironment; compact?: boolean }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  return (
    <header className="flex h-10 items-center gap-2 border-b border-border bg-surface px-2 text-fg">
      <Menu env={env} />
      <Filename />
      {compact ? null : (
        <span className="flex items-center gap-1">
          <IconButton label={strings.toolbar.new} shortcut={SHORTCUTS.new} onClick={() => newDocument(store)}><FilePlus /></IconButton>
          <IconButton label={strings.toolbar.open} shortcut={SHORTCUTS.open} onClick={() => void openFile(store, env)}><FolderOpen /></IconButton>
          <IconButton label={strings.toolbar.save} shortcut={SHORTCUTS.save} onClick={() => void saveFile(store, env)}><Save /></IconButton>
        </span>
      )}
      <span className="ml-auto" />
      <RunControls compact={compact} />
    </header>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Menu.test.tsx packages/editor/test/ShellToolbar.test.tsx` → PASS. If Radix's dropdown does not open under happy-dom with the pointer sequence above, open it with `fireEvent.keyDown(trigger, { key: 'ArrowDown' })` (Radix opens on ArrowDown) and keep the assertions.

- [ ] **Step 7: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/shell/Toolbar.tsx packages/editor/src/shell/Filename.tsx packages/editor/src/shell/RunControls.tsx packages/editor/src/shell/Menu.tsx packages/editor/src/shell/shortcuts.ts packages/editor/test/ShellToolbar.test.tsx packages/editor/test/Filename.test.tsx packages/editor/test/RunControls.test.tsx packages/editor/test/Menu.test.tsx packages/editor/test/shell-shortcuts.test.ts
git commit -m "feat(editor): toolbar, filename, run controls, menu and file shortcuts"
```

---
### Task 9: settings dialog and custom profile builder

**Files:**
- Create: `src/dialogs/Settings/Settings.tsx`, `Rail.tsx`, `Language.tsx`, `ProfileBuilder.tsx`, `EditorSection.tsx`, `Execution.tsx`, `Appearance.tsx`, `LayoutSection.tsx`, `controls.tsx`
- Test: `test/Settings.test.tsx`, `test/ProfileBuilder.test.tsx`

**Interfaces:**
- Consumes: store (`settings`, `updateSettings`, `resetSettings`, `setThemePreference`, `profileId`, `customProfiles`, `setProfile`, `saveCustomProfile`, `deleteCustomProfile`, `resetLayout`, `dialog`, `closeDialog`), `@stepcode/profiles` (`KEYWORD_KEYS`, `TYPE_KEYS`, `OPERATOR_KEYS`, `BUILTIN_KEYS`, `resolveProfile`, `builtinProfiles`, `profiles`, `DEFAULT_OPTIONS`), `starterProgram` (Task 2), `profileItems` (Task 8), `@radix-ui/react-dialog`, `@radix-ui/react-tabs`.
- Produces: `Settings({ initialSection? })` (open when `dialog === 'settings'`); `controls.tsx`: `Toggle({ label, checked, onChange })` (a `<button role="switch">`), `Select({ label, value, options, onChange })`, `NumberField({ label, value, min, max, onChange })`, `RadioCards({ label, value, options: { id, name, preview? }[], onChange })`, `Section({ title, onReset?, resetLabel, children })`; `ProfileBuilder({ base?: string; editing?: ProfileInput; onDone: () => void })`; `buildInput(form: BuilderForm): ProfileInput`, `validateInput(input, customs): { ok: true; profile: ResolvedProfile } | { ok: false; message: string }`, `slugify(name): string`, `spellingsToText(list)`, `textToSpellings(text)`.

- [ ] **Step 1: Write the failing ProfileBuilder unit test**

`test/ProfileBuilder.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildInput, ProfileBuilder, slugify, textToSpellings, validateInput } from '../src/dialogs/Settings/ProfileBuilder'
import { renderWithStore, storeWith } from './render'

describe('builder helpers', () => {
  it('slugifies names and splits spellings', () => {
    expect(slugify('Mi Perfil Ñu')).toBe('mi-perfil-nu')
    expect(textToSpellings(' Escribir , Mostrar ,, ')).toEqual(['Escribir', 'Mostrar'])
    expect(textToSpellings('')).toEqual([])
  })

  it('builds an extending input with only the changed sections', () => {
    const input = buildInput({ id: 'mio', base: 'es', keywords: { write: ['Di'] }, types: {}, operators: {}, builtins: {}, options: { indexBase: 0 } })
    expect(input).toEqual({ id: 'mio', extends: 'es', keywords: { write: ['Di'] }, options: { indexBase: 0 } })
  })

  it('validates through resolveProfile and rejects duplicates', () => {
    expect(validateInput({ id: 'mio', extends: 'es' }, []).ok).toBe(true)
    expect(validateInput({ id: 'mio', extends: 'es', keywords: { write: ['a;b'] } }, []).ok).toBe(false)
    expect(validateInput({ id: 'es', extends: 'en' }, []).ok).toBe(false)
    expect(validateInput({ id: 'mio', extends: 'es' }, [{ id: 'mio', extends: 'en' }]).ok).toBe(false)
  })
})

describe('ProfileBuilder', () => {
  it('previews live, saves a valid profile and activates it', async () => {
    const { store } = storeWith({})
    let done = 0
    renderWithStore(<ProfileBuilder base="es" onDone={() => done++} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Mi Perfil' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'write' }), { target: { value: 'Di, Escribir' } })
    expect(screen.getByRole('region', { name: 'Vista previa' }).textContent).toContain('Di ')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))
    })
    expect(store.getState().customProfiles.map((p) => p.id)).toEqual(['mi-perfil'])
    expect(store.getState().profileId).toBe('mi-perfil')
    expect(done).toBe(1)
  })

  it('shows the resolver error and keeps Guardar disabled', () => {
    const { store } = storeWith({})
    renderWithStore(<ProfileBuilder base="es" onDone={() => {}} />, store)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'x' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'write' }), { target: { value: '1abc' } })
    expect(screen.getByRole('alert').textContent).toContain('Perfil inválido')
    expect((screen.getByRole('button', { name: 'Guardar perfil' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/ProfileBuilder.test.tsx` → FAIL.

- [ ] **Step 2: Write `controls.tsx` and `ProfileBuilder.tsx`**

`src/dialogs/Settings/controls.tsx`:

```tsx
import type { ReactNode } from 'react'

const ROW = 'flex min-h-8 items-center justify-between gap-4 py-1 text-sm'

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <div className={ROW}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-150 ${checked ? 'bg-accent' : 'bg-border'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface transition-transform duration-150 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (next: T) => void }) {
  return (
    <label className={ROW}>
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as T)} className="h-8 rounded border border-border bg-surface px-2 text-fg">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

export function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (next: number) => void }) {
  return (
    <label className={ROW}>
      <span>{label}</span>
      <input
        type="number"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isInteger(next) && next >= min && next <= max) onChange(next)
        }}
        className="h-8 w-20 rounded border border-border bg-surface px-2 text-fg"
      />
    </label>
  )
}

export function RadioCards<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { id: T; name: string; preview?: ReactNode }[]; onChange: (next: T) => void }) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="mb-1 text-sm">{label}</legend>
      {options.map((option) => (
        <label key={option.id} className={`cursor-pointer rounded-md border p-2 ${option.id === value ? 'border-accent bg-accent-soft' : 'border-border'}`}>
          <input type="radio" name={label} value={option.id} checked={option.id === value} onChange={() => onChange(option.id)} className="mr-2" />
          <span className="text-sm">{option.name}</span>
          {option.preview !== undefined ? <pre className="mt-1 overflow-hidden text-muted text-xs">{option.preview}</pre> : null}
        </label>
      ))}
    </fieldset>
  )
}

export function Section({ title, onReset, resetLabel, children }: { title: string; onReset?: () => void; resetLabel: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-1">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-base">{title}</h3>
        {onReset !== undefined ? <button type="button" onClick={onReset} className="text-muted text-xs hover:text-fg">{resetLabel}</button> : null}
      </div>
      {children}
    </section>
  )
}
```

`src/dialogs/Settings/ProfileBuilder.tsx`:

```tsx
import {
  BUILTIN_KEYS,
  builtinProfiles,
  DEFAULT_OPTIONS,
  KEYWORD_KEYS,
  OPERATOR_KEYS,
  type ProfileInput,
  type ProfileOptions,
  profiles,
  type ResolvedProfile,
  resolveProfile,
  TYPE_KEYS,
} from '@stepcode/profiles'
import { useMemo, useState } from 'react'
import { starterProgram } from '../../profiles/starter'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import { PROFILE_IDS, stringsOf } from '../../store/store'
import { Toggle } from './controls'

type SectionKey = 'keywords' | 'types' | 'operators' | 'builtins'
type Spellings = Readonly<Record<string, readonly string[]>>

export interface BuilderForm {
  readonly id: string
  readonly base: string
  readonly keywords: Spellings
  readonly types: Spellings
  readonly operators: Spellings
  readonly builtins: Spellings
  readonly options: Partial<ProfileOptions>
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function textToSpellings(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

export function spellingsToText(list: readonly string[]): string {
  return list.join(', ')
}

/** Only the sections and options that differ from the base survive into the input. */
export function buildInput(form: BuilderForm): ProfileInput {
  const input: Record<string, unknown> = { id: form.id, extends: form.base }
  for (const section of ['keywords', 'types', 'operators', 'builtins'] as const) {
    if (Object.keys(form[section]).length > 0) input[section] = form[section]
  }
  if (Object.keys(form.options).length > 0) input.options = form.options
  return input as ProfileInput
}

export function validateInput(
  input: ProfileInput,
  customs: readonly ProfileInput[],
): { ok: true; profile: ResolvedProfile } | { ok: false; message: string } {
  if (input.id === '') return { ok: false, message: 'id' }
  if (PROFILE_IDS.includes(input.id) || customs.some((c) => c.id === input.id)) {
    return { ok: false, message: 'duplicate' }
  }
  try {
    const registry = new Map(builtinProfiles)
    for (const custom of customs) registry.set(custom.id, custom)
    return { ok: true, profile: resolveProfile(input, registry) }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) }
  }
}

const OPTION_KEYS = Object.keys(DEFAULT_OPTIONS) as (keyof ProfileOptions)[]

function sectionOf(profile: ResolvedProfile, section: SectionKey): Spellings {
  return profile[section] as Spellings
}

export function ProfileBuilder({ base = 'es', editing, onDone }: { base?: string; editing?: ProfileInput; onDone: () => void }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const customs = useEditorStore((s) => s.customProfiles)
  const baseProfile = (profiles as Record<string, ResolvedProfile | undefined>)[base] ?? profiles.es
  const seed = editing as (Partial<Record<SectionKey, Spellings>> & { options?: Partial<ProfileOptions> }) | undefined
  const [name, setName] = useState(editing?.id ?? '')
  const [form, setForm] = useState<BuilderForm>(() => ({
    id: editing?.id ?? '',
    base,
    keywords: seed?.keywords ?? {},
    types: seed?.types ?? {},
    operators: seed?.operators ?? {},
    builtins: seed?.builtins ?? {},
    options: seed?.options ?? {},
  }))
  const id = editing?.id ?? slugify(name)
  const input = useMemo(() => buildInput({ ...form, id }), [form, id])
  const others = editing === undefined ? customs : customs.filter((c) => c.id !== editing.id)
  const result = useMemo(() => validateInput(input, others), [input, others])
  const preview = result.ok ? starterProgram(result.profile) : ''
  const t = strings.settings.language

  const setSpellings = (section: SectionKey, key: string, text: string): void =>
    setForm((f) => {
      const next: Record<string, readonly string[]> = { ...f[section] }
      const list = textToSpellings(text)
      const baseList = sectionOf(baseProfile, section)[key] ?? []
      if (list.join(' ') === baseList.join(' ')) delete next[key]
      else next[key] = list
      return { ...f, [section]: next }
    })

  const table = (section: SectionKey, keys: readonly string[], title: string) => (
    <details className="mt-2" open={section === 'keywords'}>
      <summary className="cursor-pointer text-sm">{title}</summary>
      <div className="mt-1 grid gap-1 sm:grid-cols-2">
        {keys.map((key) => (
          <label key={key} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate font-mono text-muted">{key}</span>
            <input
              aria-label={key}
              defaultValue={spellingsToText(form[section][key] ?? sectionOf(baseProfile, section)[key] ?? [])}
              onChange={(event) => setSpellings(section, key, event.target.value)}
              className="h-7 min-w-0 flex-1 rounded border border-border bg-surface px-2 font-mono text-fg"
            />
          </label>
        ))}
      </div>
    </details>
  )

  const message = result.ok ? null : result.message === 'duplicate' ? t.duplicate : t.invalid(result.message)

  return (
    <div className="mt-3 rounded-md border border-border p-3">
      <h4 className="font-semibold text-sm">{t.builder}</h4>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <span className="w-24">{t.name}</span>
        <input aria-label={t.name} value={name} onChange={(event) => setName(event.target.value)} disabled={editing !== undefined} className="h-8 flex-1 rounded border border-border bg-surface px-2 text-fg" />
      </label>
      <p className="mt-1 text-muted text-xs">{t.nameHint} · {t.spellingsHint}</p>
      <p className="mt-1 text-sm">{t.base}: {strings.profiles[base] ?? base}</p>
      {table('keywords', KEYWORD_KEYS, t.keywords)}
      {table('types', TYPE_KEYS, t.types)}
      {table('operators', OPERATOR_KEYS, t.operators)}
      {table('builtins', BUILTIN_KEYS, t.builtins)}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm">{t.options}</summary>
        {OPTION_KEYS.map((key) => {
          const current = form.options[key] ?? baseProfile.options[key]
          const checked = key === 'indexBase' ? current === 1 : current === true
          return (
            <Toggle
              key={key}
              label={t.option[key]}
              checked={checked}
              onChange={(next) => setForm((f) => ({ ...f, options: { ...f.options, [key]: key === 'indexBase' ? (next ? 1 : 0) : next } }))}
            />
          )
        })}
      </details>
      <section aria-label={t.preview} className="mt-3">
        <h5 className="text-muted text-xs">{t.preview}</h5>
        <pre className="mt-1 rounded bg-bg p-2 font-mono text-xs">{preview}</pre>
      </section>
      {message !== null && name !== '' ? <p role="alert" className="mt-2 text-error text-sm">{message}</p> : null}
      <div className="mt-3 flex justify-end gap-2">
        {editing !== undefined ? (
          <button type="button" className="h-8 rounded px-3 text-error text-sm hover:bg-surface-raised" onClick={() => { store.getState().deleteCustomProfile(editing.id); onDone() }}>
            {t.delete}
          </button>
        ) : null}
        <button
          type="button"
          disabled={!result.ok || id === ''}
          className="h-8 rounded bg-accent px-3 text-bg text-sm disabled:opacity-40"
          onClick={() => { store.getState().saveCustomProfile(input); store.getState().setProfile(input.id); onDone() }}
        >
          {t.save}
        </button>
      </div>
    </div>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/ProfileBuilder.test.tsx` → PASS.

- [ ] **Step 3: Write the failing Settings test**

`test/Settings.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Settings } from '../src/dialogs/Settings/Settings'
import { renderWithStore, storeWith } from './render'

function open(section?: 'language' | 'editor' | 'execution' | 'appearance' | 'layout') {
  const { store } = storeWith({ dialog: 'settings' })
  renderWithStore(<Settings {...(section === undefined ? {} : { initialSection: section })} />, store)
  return store
}

describe('Settings', () => {
  it('opens on the language section with a rail of five sections', () => {
    open()
    expect(screen.getByRole('dialog', { name: 'Ajustes' })).toBeDefined()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Lenguaje', 'Editor', 'Ejecución', 'Apariencia', 'Diseño'])
    expect(screen.getByRole('radio', { name: /Español/ })).toBeDefined()
  })

  it('edits editor, execution, appearance and layout settings immediately', () => {
    const store = open('editor')
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Tamaño de letra' }), { target: { value: '16' } })
    expect(store.getState().settings.editor.fontSize).toBe(16)
    fireEvent.click(screen.getByRole('switch', { name: 'Ajustar líneas' }))
    expect(store.getState().settings.editor.wordWrap).toBe(true)
    fireEvent.click(screen.getByRole('tab', { name: 'Ejecución' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Limpiar la consola al ejecutar' }))
    expect(store.getState().settings.execution.clearConsoleOnRun).toBe(false)
    fireEvent.click(screen.getByRole('tab', { name: 'Apariencia' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Tema' }), { target: { value: 'dark' } })
    expect(store.getState().themePreference).toBe('dark')
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma de la interfaz' }), { target: { value: 'en' } })
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: 'Layout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset layout' }))
    expect(store.getState().layoutReset).toBe(1)
  })

  it('resets a section and closes on Escape', () => {
    const store = open('editor')
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Tamaño de letra' }), { target: { value: '18' } })
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }))
    expect(store.getState().settings.editor.fontSize).toBe(14)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(store.getState().dialog).toBeNull()
  })

  it('switches profile and opens the builder', () => {
    const store = open()
    fireEvent.click(screen.getByRole('radio', { name: /English/ }))
    expect(store.getState().profileId).toBe('en')
    fireEvent.click(screen.getByRole('button', { name: 'Customize…' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDefined()
  })
})
```

(After switching to `en` the UI locale follows the profile, so the button reads `Customize…`.)

- [ ] **Step 4: Write the sections and `Settings.tsx`**

`Rail.tsx` wraps `@radix-ui/react-tabs`: `Tabs.Root value onValueChange orientation="vertical"` with `Tabs.List` (`role="tablist"`, vertical on `sm:` and up, a horizontal strip below) rendering one `Tabs.Trigger` per section labelled from `strings.settings.sections`, and `children` as the body beside it.

`Language.tsx`: `Section` titled `strings.settings.sections.language` (no reset); `RadioCards` over `profileItems(state)` (`preview` = the first four lines of `starterProgram(profileOf({ ...state, profileId: item.id }))`) → `setProfile`; a `Personalizar…` button (`strings.settings.language.customize`) toggling `<ProfileBuilder base={profileId is builtin ? profileId : 'es'} />`; when the active profile is custom, an edit button opens `<ProfileBuilder editing={input} />`.

`EditorSection.tsx`: `Section` with `onReset={() => resetSettings('editor')}`; `NumberField` font size (12–20), `Toggle`s for `lineNumbers`, `wordWrap`, `autocomplete`, `highlightLine`, `Select` tab size (`'2' | '4'` → number). `Execution.tsx`: two `Toggle`s. `Appearance.tsx`: `Select` theme (`system | light | dark` → `setThemePreference`) and `Select` UI language (`auto | es | en` → `updateSettings('appearance', { uiLocale })`). `LayoutSection.tsx`: a `Restablecer diseño` button → `resetLayout()` and the `showConsoleOnRun` toggle. Each section's `Section` gets `resetLabel={strings.settings.reset}`.

`Settings.tsx`:

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import { stringsOf } from '../../store/store'
import { X } from '../../ui/icons'
import { IconButton } from '../../ui/Tooltip'
import { Appearance } from './Appearance'
import { EditorSection } from './EditorSection'
import { Execution } from './Execution'
import { Language } from './Language'
import { LayoutSection } from './LayoutSection'
import { Rail } from './Rail'

export type SettingsPage = 'language' | 'editor' | 'execution' | 'appearance' | 'layout'
const PAGES: readonly SettingsPage[] = ['language', 'editor', 'execution', 'appearance', 'layout']

/** Spec §6: rail + one scrolling body; every control writes to the store immediately. */
export function Settings({ initialSection = 'language' }: { initialSection?: SettingsPage }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const open = useEditorStore((s) => s.dialog === 'settings')
  const [page, setPage] = useState<SettingsPage>(initialSection)
  const body = {
    language: <Language />,
    editor: <EditorSection />,
    execution: <Execution />,
    appearance: <Appearance />,
    layout: <LayoutSection />,
  }[page]
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && store.getState().closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-surface text-fg sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(90vh,520px)] sm:w-[min(95vw,720px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-panel">
          <div className="flex h-10 items-center justify-between border-b border-border px-3">
            <Dialog.Title className="font-semibold text-sm">{strings.settings.title}</Dialog.Title>
            <Dialog.Description className="sr-only">{strings.settings.title}</Dialog.Description>
            <Dialog.Close asChild>
              <IconButton label={strings.dialog.close} onClick={() => {}}>
                <X />
              </IconButton>
            </Dialog.Close>
          </div>
          <Rail pages={PAGES} value={page} onChange={setPage}>
            <div className="min-h-0 flex-1 overflow-auto p-4">{body}</div>
          </Rail>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Settings.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/dialogs/Settings packages/editor/test/Settings.test.tsx packages/editor/test/ProfileBuilder.test.tsx
git commit -m "feat(editor): settings dialog with custom profile builder"
```

---

### Task 10: examples, share, about, warnings dialogs and the toaster

**Files:**
- Create: `src/dialogs/Dialog.tsx`, `src/dialogs/Examples.tsx`, `src/dialogs/Share.tsx`, `src/dialogs/About.tsx`, `src/dialogs/Warnings.tsx`, `src/dialogs/Toaster.tsx`
- Test: `test/Examples.test.tsx`, `test/Share.test.tsx`, `test/About.test.tsx`, `test/Warnings.test.tsx`, `test/Toaster.test.tsx`

**Interfaces:**
- Consumes: `EXAMPLES`, `TOPICS`, `exampleSource` (Task 3); `encodeShare`, `shareUrl`, `SHARE_WARN_LENGTH` (Task 4); store (`dialog`, `closeDialog`, `requestReplace`, `pendingReplace`, `notify`, `toasts`, `dismissToast`, `confirmRun`, `diagnostics`, `source`); `APP_VERSION`; `LineMap`; `@radix-ui/react-dialog`, `@radix-ui/react-toast`.
- Produces: `Dialog({ name, title, description?, wide?, children })` — the shared frame bound to `store.dialog === name`; `Examples()`; `Share({ clipboard?, base? })`; `About({ repository?, academy? })`; `Warnings()`; `Toaster()`.

- [ ] **Step 1: Write the failing tests**

`test/Examples.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Examples } from '../src/dialogs/Examples'
import { EXAMPLES } from '../src/examples/index'
import { renderWithStore, storeWith } from './render'

describe('Examples', () => {
  it('lists every example grouped by topic and filters by title', () => {
    const { store } = storeWith({ dialog: 'examples' })
    renderWithStore(<Examples />, store)
    expect(screen.getAllByRole('button', { name: /Abrir ejemplo/ })).toHaveLength(EXAMPLES.length)
    expect(screen.getByRole('heading', { name: 'Primeros pasos' })).toBeDefined()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar ejemplos' }), { target: { value: 'factorial' } })
    expect(screen.getAllByRole('button', { name: /Abrir ejemplo/ })).toHaveLength(1)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar ejemplos' }), { target: { value: 'zzz' } })
    expect(screen.getByText('Ningún ejemplo coincide')).toBeDefined()
  })

  it('loads an example in the active profile spelling and names the document', () => {
    const { store } = storeWith({ dialog: 'examples' })
    store.getState().setProfile('en')
    renderWithStore(<Examples />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Open example: Hola mundo' }))
    expect(store.getState().name).toBe('hola-mundo.stepcode')
    expect(store.getState().source).toContain('Program')
    expect(store.getState().dialog).toBeNull()
  })
})
```

(Under the `en` profile the UI reads English, hence `Open example`.)

`test/Share.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Share } from '../src/dialogs/Share'
import { decodeShare } from '../src/share/link'
import { renderWithStore, storeWith } from './render'

describe('Share', () => {
  it('shows the link, copies it and confirms', async () => {
    const { store } = storeWith({ dialog: 'share' })
    const copied: string[] = []
    renderWithStore(<Share clipboard={{ writeText: async (t) => { copied.push(t) } }} base="https://x.test/" />, store)
    const field = (await screen.findByRole('textbox', { name: 'Enlace' })) as HTMLInputElement
    await waitFor(() => expect(field.value).toContain('#code='))
    expect((await decodeShare(field.value.slice(field.value.indexOf('#'))))?.source).toBe(store.getState().source)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    })
    expect(copied).toEqual([field.value])
    expect(store.getState().toasts.at(-1)?.message).toBe('Enlace copiado')
    expect(screen.getByRole('link', { name: 'Abrir en nueva pestaña' }).getAttribute('href')).toBe(field.value)
  })

  it('warns when the link is very long', async () => {
    const lines = Array.from({ length: 3000 }, (_, i) => `  Escribir '${(i * 7919) % 100003}';`)
    const { store } = storeWith({ dialog: 'share', source: `Proceso A\n${lines.join('\n')}\nFinProceso\n` })
    renderWithStore(<Share base="https://x.test/" />, store)
    expect(await screen.findByText('El enlace es muy largo; algunas aplicaciones lo recortan.')).toBeDefined()
  })
})
```

`test/About.test.tsx`, `test/Warnings.test.tsx`, `test/Toaster.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { About } from '../src/dialogs/About'
import { Toaster } from '../src/dialogs/Toaster'
import { Warnings } from '../src/dialogs/Warnings'
import { APP_VERSION } from '../src/version'
import { renderWithStore, storeWith } from './render'

describe('About', () => {
  it('shows version and links', () => {
    const { store } = storeWith({ dialog: 'about' })
    renderWithStore(<About repository="https://github.com/RolandoAndrade/stepcode" academy="https://stepcode.online" />, store)
    expect(screen.getByText(`Versión ${APP_VERSION}`)).toBeDefined()
    expect(screen.getByRole('link', { name: 'Repositorio' }).getAttribute('href')).toContain('github')
  })
})

describe('Warnings', () => {
  it('lists warnings and runs anyway', () => {
    const { store, host } = storeWith({ dialog: 'warnings', diagnostics: [{ from: 0, to: 1, severity: 'warning', message: 'cuidado' }] })
    renderWithStore(<Warnings />, store)
    expect(screen.getByText(/cuidado/)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar igualmente' }))
    expect(host.calls).toEqual(['start:run'])
  })
})

describe('Toaster', () => {
  it('shows toasts and dismisses them after four seconds', () => {
    vi.useFakeTimers()
    const { store } = storeWith({})
    renderWithStore(<Toaster />, store)
    act(() => store.getState().notify('Guardado'))
    expect(screen.getByRole('status').textContent).toContain('Guardado')
    act(() => vi.advanceTimersByTime(4000))
    expect(store.getState().toasts).toEqual([])
    vi.useRealTimers()
  })
})
```

Split those three `describe`s into their three files.

- [ ] **Step 2: Write the dialogs**

`src/dialogs/Dialog.tsx`:

```tsx
import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { type DialogName, stringsOf } from '../store/store'
import { X } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'

/** One frame for every store-driven dialog: full screen on phones, centered card otherwise. */
export function Dialog({ name, title, description, wide = false, children }: { name: DialogName; title: string; description?: string; wide?: boolean; children: ReactNode }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const open = useEditorStore((s) => s.dialog === name)
  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => !next && store.getState().closeDialog()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <RadixDialog.Content className={`fixed inset-0 z-50 flex flex-col bg-surface text-fg sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-panel ${wide ? 'sm:w-[min(95vw,760px)]' : 'sm:w-[min(90vw,440px)]'}`}>
          <div className="flex h-10 items-center justify-between border-b border-border px-3">
            <RadixDialog.Title className="font-semibold text-sm">{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <IconButton label={strings.dialog.close} onClick={() => {}}>
                <X />
              </IconButton>
            </RadixDialog.Close>
          </div>
          <RadixDialog.Description className={description === undefined ? 'sr-only' : 'px-4 pt-3 text-muted text-sm'}>
            {description ?? title}
          </RadixDialog.Description>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
```

`Examples.tsx`: `Dialog name="examples" wide`; a search input (`type="search"`, `aria-label={strings.examples.search}`, filters by title, case- and accent-insensitive); per topic in `TOPICS` an `<h3>` with `strings.examples.topics[topic]` and a grid of `<button aria-label={`${strings.examples.load}: ${title}`}>` cards showing title, description and the first three lines of `exampleSource(example, profileOf(state))` in `font-mono text-xs`; click → `requestReplace({ name: `${slug}.stepcode`, source })` and then `closeDialog()` only if `store.getState().pendingReplace === null` (otherwise the confirm dialog has taken over). Empty filter → `strings.examples.empty`.

`Share.tsx`: on open, `encodeShare({ source, profileId })` in an effect, `shareUrl(hash, base)` into a read-only `<input aria-label={strings.share.link}>`; `Copiar` → `(clipboard ?? navigator.clipboard).writeText(url)` then `notify(strings.share.copied)`; `<a target="_blank" rel="noreferrer">` with `strings.share.open`; `strings.share.note`; `strings.share.tooLong` when `url.length > SHARE_WARN_LENGTH`.

`About.tsx`: `<img src="/pwa-192x192.png" alt="" width={48} />`, `strings.app.title`, `strings.about.tagline`, `strings.about.version(APP_VERSION)`, links `repository` and `academy` (defaults `https://github.com/RolandoAndrade/stepcode` and `https://stepcode.online`), `strings.about.licence`.

`Warnings.tsx`: `Dialog name="warnings" description={strings.warnings.body}` listing `diagnostics.filter(severity === 'warning')` as `"línea N: message"` through `LineMap(source)`; buttons Cancelar (`closeDialog`) and Ejecutar igualmente (`confirmRun`).

`Toaster.tsx`:

```tsx
import * as Toast from '@radix-ui/react-toast'
import { useEffect } from 'react'
import { useEditorStore } from '../store/context'

const DURATION = 4000

export function Toaster() {
  const toasts = useEditorStore((s) => s.toasts)
  const dismiss = useEditorStore((s) => s.dismissToast)
  // Dismissal is owned here (not by Radix's timer) so it is deterministic under fake timers.
  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => dismiss(toast.id), DURATION))
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [toasts, dismiss])
  return (
    <Toast.Provider duration={DURATION}>
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} onOpenChange={(open) => !open && dismiss(toast.id)} className="rounded-md bg-surface-raised px-3 py-2 text-fg text-sm shadow-panel">
          <Toast.Description role="status">{toast.message}</Toast.Description>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed right-4 bottom-8 z-50 flex flex-col gap-2" />
    </Toast.Provider>
  )
}
```

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/Examples.test.tsx packages/editor/test/Share.test.tsx packages/editor/test/About.test.tsx packages/editor/test/Warnings.test.tsx packages/editor/test/Toaster.test.tsx` → PASS.

- [ ] **Step 3: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/dialogs packages/editor/test/Examples.test.tsx packages/editor/test/Share.test.tsx packages/editor/test/About.test.tsx packages/editor/test/Warnings.test.tsx packages/editor/test/Toaster.test.tsx
git commit -m "feat(editor): examples, share, about and warnings dialogs with toasts"
```

---

### Task 12: phone shell — top bar, bottom sheet, symbol bar

**Files:**
- Create: `src/shell/mobile/MobileShell.tsx`, `MobileTopBar.tsx`, `BottomSheet.tsx`, `SymbolBar.tsx`, `symbols.ts`, `viewport.ts`
- Test: `test/symbols.test.ts`, `test/viewport.test.ts`, `test/BottomSheet.test.tsx`, `test/SymbolBar.test.tsx`, `test/MobileShell.test.tsx`

**Interfaces:**
- Consumes: panels, `PanelActions` (Task 11), `EditorHandle` (`view`, `focus`, `revealLine`, `revealSpan`), store (`layout.sheet`, `setSheet`, `panelRequest`, `runSeq`, `pausedInRun`, `pendingInput`, `settings.layout.showConsoleOnRun`, `profileOf`), `autoExpandTarget`, `RunControls` (Task 7, `compact`), `menuModel` and `Filename` (Task 7), `StatusBar` (Task 8), `FileEnvironment`.
- Produces:
  - `symbols.ts`: `symbolKeys(profile: ResolvedProfile): { label: string; insert: string }[]`, `insertSymbol(view: EditorView, insert: string): void`.
  - `viewport.ts`: `keyboardVisible(layoutHeight, visualHeight, coarse, editorFocused): boolean`, `useKeyboardVisible(editorFocused, win?): boolean`.
  - `BottomSheet({ position, onPosition, tabs, active, onActive, actions, labels, children })`, `nextPosition(current, gesture)`.
  - `MobileTopBar({ env })`, `MobileShell({ editorRef, env })`.

- [ ] **Step 1: Write the failing symbol and viewport tests**

`test/symbols.test.ts`:

```ts
// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { insertSymbol, symbolKeys } from '../src/shell/mobile/symbols'

describe('symbolKeys', () => {
  it('starts with the assign operator and punctuation, then keywords and types', () => {
    const keys = symbolKeys(profiles.es).map((k) => k.label)
    expect(keys.slice(0, 9)).toEqual(['<-', '(', ')', '[', ']', ',', '"', ':', ';'])
    expect(keys).toContain('Si')
    expect(keys).toContain('FinSi')
    expect(keys).toContain('Entero')
    expect(keys.indexOf('Si')).toBeLessThan(keys.indexOf('Mientras'))
    expect(symbolKeys(profiles.en).map((k) => k.label)).toContain('If')
  })

  it('inserts keywords with a trailing space and punctuation without', () => {
    const view = new EditorView({ state: EditorState.create({ doc: 'a' }) })
    view.dispatch({ selection: { anchor: 1 } })
    const si = symbolKeys(profiles.es).find((k) => k.label === 'Si')
    insertSymbol(view, si?.insert ?? '')
    insertSymbol(view, '(')
    expect(view.state.doc.toString()).toBe('aSi (')
    view.destroy()
  })
})
```

`test/viewport.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { keyboardVisible } from '../src/shell/mobile/viewport'

describe('keyboardVisible', () => {
  it('uses the visual viewport gap when available, focus on coarse pointers otherwise', () => {
    expect(keyboardVisible(800, 450, true, true)).toBe(true)
    expect(keyboardVisible(800, 760, true, true)).toBe(false)
    expect(keyboardVisible(800, 450, true, false)).toBe(false)
    expect(keyboardVisible(800, undefined, true, true)).toBe(true)
    expect(keyboardVisible(800, undefined, true, false)).toBe(false)
    expect(keyboardVisible(800, undefined, false, true)).toBe(false)
  })
})
```

- [ ] **Step 2: Write `symbols.ts` and `viewport.ts`**

`symbols.ts`:

```ts
import type { EditorView } from '@codemirror/view'
import type { KeywordKey, ResolvedProfile, TypeKey } from '@stepcode/profiles'

export interface SymbolKey {
  readonly label: string
  readonly insert: string
}

const PUNCTUATION = ['(', ')', '[', ']', ',', '"', ':', ';'] as const
const KEYWORDS: readonly KeywordKey[] = ['if', 'then', 'else', 'endIf', 'while', 'do', 'endWhile', 'for', 'to', 'endFor', 'write', 'read', 'define', 'as']
const TYPES: readonly TypeKey[] = ['integer', 'real', 'string', 'char', 'boolean']

/** Spec §9: the assign operator, punctuation, then the profile's primary keyword and type spellings. */
export function symbolKeys(profile: ResolvedProfile): SymbolKey[] {
  const assign = profile.operators.assign[0] ?? '<-'
  const keys: SymbolKey[] = [{ label: assign, insert: ` ${assign} ` }, ...PUNCTUATION.map((p) => ({ label: p, insert: p }))]
  for (const key of KEYWORDS) {
    const spelling = profile.keywords[key]?.[0]
    if (spelling !== undefined) keys.push({ label: spelling, insert: `${spelling} ` })
  }
  for (const key of TYPES) {
    const spelling = profile.types[key]?.[0]
    if (spelling !== undefined) keys.push({ label: spelling, insert: `${spelling} ` })
  }
  return keys
}

export function insertSymbol(view: EditorView, insert: string): void {
  view.dispatch(view.state.replaceSelection(insert))
  view.focus()
}
```

`viewport.ts`:

```ts
import { useEffect, useState } from 'react'

const KEYBOARD_GAP = 100

/** Spec §9: VisualViewport shorter than the layout viewport by > 100 px, else focus on coarse pointers. */
export function keyboardVisible(layoutHeight: number, visualHeight: number | undefined, coarse: boolean, editorFocused: boolean): boolean {
  if (!editorFocused) return false
  if (visualHeight !== undefined) return layoutHeight - visualHeight > KEYBOARD_GAP
  return coarse
}

export function useKeyboardVisible(editorFocused: boolean, win: Window | undefined = typeof window === 'undefined' ? undefined : window): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (win === undefined) return
    const coarse = win.matchMedia?.('(pointer: coarse)').matches ?? false
    const compute = (): void => setVisible(keyboardVisible(win.innerHeight, win.visualViewport?.height, coarse, editorFocused))
    compute()
    win.visualViewport?.addEventListener('resize', compute)
    return () => win.visualViewport?.removeEventListener('resize', compute)
  }, [editorFocused, win])
  return visible
}
```

Run both tests → PASS.

- [ ] **Step 3: Write the failing BottomSheet and SymbolBar tests**

`test/BottomSheet.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BottomSheet, nextPosition } from '../src/shell/mobile/BottomSheet'

describe('nextPosition', () => {
  it('cycles on tap and follows drag direction', () => {
    expect(nextPosition('collapsed', 'tap')).toBe('half')
    expect(nextPosition('half', 'tap')).toBe('full')
    expect(nextPosition('full', 'tap')).toBe('collapsed')
    expect(nextPosition('half', 'down')).toBe('collapsed')
    expect(nextPosition('half', 'up')).toBe('full')
    expect(nextPosition('collapsed', 'down')).toBe('collapsed')
  })
})

describe('BottomSheet', () => {
  it('renders tabs, switches pages and reports position changes', () => {
    const onPosition = vi.fn()
    const onActive = vi.fn()
    render(
      <BottomSheet
        position="half"
        onPosition={onPosition}
        tabs={[{ id: 'console', label: 'Consola' }, { id: 'problems', label: 'Problemas' }]}
        active="console"
        onActive={onActive}
        actions={null}
        labels={{ collapse: 'Contraer', expand: 'Expandir', sheet: 'Paneles' }}
      >
        {(id) => <div>page {id}</div>}
      </BottomSheet>,
    )
    expect(screen.getByText('page console')).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: 'Problemas' }))
    expect(onActive).toHaveBeenCalledWith('problems')
    fireEvent.click(screen.getByRole('button', { name: 'Contraer' }))
    expect(onPosition).toHaveBeenCalledWith('collapsed')
    const handle = screen.getByRole('tablist').parentElement as HTMLElement
    fireEvent.pointerDown(handle, { clientY: 500, pointerId: 1 })
    fireEvent.pointerUp(handle, { clientY: 380, pointerId: 1 })
    expect(onPosition).toHaveBeenLastCalledWith('full')
  })
})
```

`test/SymbolBar.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SymbolBar } from '../src/shell/mobile/SymbolBar'
import { renderWithStore, storeWith } from './render'

describe('SymbolBar', () => {
  it('inserts the tapped symbol into the editor', () => {
    const { store } = storeWith({})
    const view = new EditorView({ state: EditorState.create({ doc: '' }) })
    renderWithStore(<SymbolBar view={view} visible />, store)
    fireEvent.click(screen.getByRole('button', { name: 'Si' }))
    fireEvent.click(screen.getByRole('button', { name: '(' }))
    expect(view.state.doc.toString()).toBe('Si (')
    view.destroy()
  })

  it('renders nothing while hidden', () => {
    const { store } = storeWith({})
    const { container } = renderWithStore(<SymbolBar view={null} visible={false} />, store)
    expect(container.textContent).toBe('')
  })
})
```

- [ ] **Step 4: Write `BottomSheet.tsx` and `SymbolBar.tsx`**

`BottomSheet.tsx`:

```tsx
import { type PointerEvent, type ReactNode, useRef } from 'react'
import type { SheetPosition } from '../../store/layout'
import { ChevronDown, ChevronUp } from '../../ui/icons'

const DRAG_THRESHOLD = 40
const ORDER: readonly SheetPosition[] = ['collapsed', 'half', 'full']

export function nextPosition(current: SheetPosition, gesture: 'tap' | 'up' | 'down'): SheetPosition {
  const index = ORDER.indexOf(current)
  if (gesture === 'tap') return ORDER[(index + 1) % ORDER.length] ?? 'collapsed'
  const next = gesture === 'up' ? index + 1 : index - 1
  return ORDER[Math.max(0, Math.min(ORDER.length - 1, next))] ?? current
}

/** Spec §9: collapsed strip, half, full. */
const HEIGHT: Readonly<Record<SheetPosition, string>> = { collapsed: 'h-9', half: 'h-[45%]', full: 'h-[calc(100%-44px)]' }

export function BottomSheet<T extends string>({
  position,
  onPosition,
  tabs,
  active,
  onActive,
  actions,
  labels,
  children,
}: {
  position: SheetPosition
  onPosition: (next: SheetPosition) => void
  tabs: readonly { id: T; label: string }[]
  active: T
  onActive: (id: T) => void
  actions: ReactNode
  labels: { collapse: string; expand: string; sheet: string }
  children: (id: T) => ReactNode
}) {
  const start = useRef<number | null>(null)
  const onPointerDown = (event: PointerEvent): void => {
    start.current = event.clientY
  }
  const onPointerUp = (event: PointerEvent): void => {
    const from = start.current
    start.current = null
    if (from === null) return
    const delta = from - event.clientY
    if (Math.abs(delta) < DRAG_THRESHOLD) return
    onPosition(nextPosition(position, delta > 0 ? 'up' : 'down'))
  }
  return (
    <section aria-label={labels.sheet} className={`flex ${HEIGHT[position]} min-h-9 flex-col border-t border-border bg-surface transition-[height] duration-150`}>
      <div className="flex h-9 shrink-0 touch-none items-center gap-1 px-2" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div role="tablist" className="flex flex-1 items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === active}
              onClick={() => {
                onActive(tab.id)
                if (position === 'collapsed') onPosition('half')
              }}
              className={`h-9 px-3 text-xs ${tab.id === active ? 'border-accent border-b-2 text-fg' : 'text-muted'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {position === 'collapsed' ? null : actions}
        <button
          type="button"
          aria-label={position === 'collapsed' ? labels.expand : labels.collapse}
          onClick={() => onPosition(position === 'collapsed' ? 'half' : 'collapsed')}
          className="flex h-9 w-11 items-center justify-center"
        >
          {position === 'collapsed' ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      {position === 'collapsed' ? null : <div className="min-h-0 flex-1">{children(active)}</div>}
    </section>
  )
}
```

`SymbolBar.tsx`:

```tsx
import type { EditorView } from '@codemirror/view'
import { useEditorStore } from '../../store/context'
import { profileOf, stringsOf } from '../../store/store'
import { insertSymbol, symbolKeys } from './symbols'

/** Spec §9: one scrollable row of profile-derived keys above the on-screen keyboard. */
export function SymbolBar({ view, visible }: { view: EditorView | null; visible: boolean }) {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  if (!visible || view === null) return null
  return (
    <div role="toolbar" aria-label={strings.mobile.symbols} className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-t border-border bg-surface px-2">
      {symbolKeys(profile).map((key) => (
        <button
          key={key.label}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => insertSymbol(view, key.insert)}
          className="h-8 shrink-0 rounded bg-surface-raised px-3 font-mono text-sm"
        >
          {key.label}
        </button>
      ))}
    </div>
  )
}
```

(`preventDefault` on pointer-down keeps the editor focused so the keyboard stays open.) Run both tests → PASS.

- [ ] **Step 5: Write the failing MobileShell test and the shell**

`test/MobileShell.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { EditorHandle } from '../src/panels/Editor'
import { MobileShell } from '../src/shell/mobile/MobileShell'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('MobileShell', () => {
  it('renders top bar, editor, sheet and status; the sheet opens on run and on input', () => {
    const { store, host } = storeWith({})
    const editorRef = createRef<EditorHandle>()
    renderWithStore(
      <TooltipProvider>
        <MobileShell editorRef={editorRef} env={env} />
      </TooltipProvider>,
      store,
    )
    expect(screen.getByRole('region', { name: 'Editor' })).toBeDefined()
    expect(screen.getByRole('region', { name: 'Paneles' })).toBeDefined()
    expect(screen.queryByRole('region', { name: 'Consola' })).toBeNull()
    act(() => store.getState().run())
    expect(store.getState().layout.sheet).toBe('half')
    expect(screen.getByRole('region', { name: 'Consola' })).toBeDefined()
    act(() => {
      host.emit({ kind: 'state', state: 'input' })
      host.emit({ kind: 'input', line: 1, target: null })
    })
    expect(store.getState().layout.sheet).toBe('full')
    act(() => store.getState().requestPanel('variables'))
    expect(screen.getByRole('region', { name: 'Variables' })).toBeDefined()
  })

  it('does not import dockview', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath, URL: NodeURL } = await import('node:url')
    const source = readFileSync(fileURLToPath(new NodeURL('../src/shell/mobile/MobileShell.tsx', import.meta.url)), 'utf8')
    expect(source).not.toContain('dockview')
  })
})
```

`MobileShell.tsx`:

```tsx
import { type RefObject, useEffect, useState } from 'react'
import type { FileEnvironment } from '../../files/actions'
import { Console } from '../../panels/Console'
import { Editor, type EditorHandle } from '../../panels/Editor'
import { PanelActions } from '../../panels/PanelActions'
import { Problems } from '../../panels/Problems'
import { Variables } from '../../panels/Variables'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'
import { autoExpandTarget } from '../autoExpand'
import { StatusBar } from '../StatusBar'
import { BottomSheet } from './BottomSheet'
import { MobileTopBar } from './MobileTopBar'
import { SymbolBar } from './SymbolBar'
import { useKeyboardVisible } from './viewport'

type SheetPanel = Exclude<PanelId, 'editor'>
const SHEET_PANELS: readonly SheetPanel[] = ['console', 'problems', 'variables']

/** Spec §9: column layout — top bar, editor, symbol bar, bottom sheet, status. No dockview here. */
export function MobileShell({ editorRef, env }: { editorRef: RefObject<EditorHandle | null>; env: FileEnvironment }) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const sheet = useEditorStore((s) => s.layout.sheet)
  const setSheet = useEditorStore((s) => s.setSheet)
  const [active, setActive] = useState<SheetPanel>('console')
  const [editorFocused, setEditorFocused] = useState(false)
  const keyboard = useKeyboardVisible(editorFocused)

  useEffect(() => {
    let previous = store.getState()
    return store.subscribe((next) => {
      const request = next.panelRequest
      if (request !== previous.panelRequest && request !== null && request.id !== 'editor') {
        setActive(request.id)
        if (next.layout.sheet === 'collapsed') next.setSheet('half')
      }
      const event = autoExpandTarget(previous, next, next.settings.layout.showConsoleOnRun)
      if (event !== null && event.panel !== 'editor') {
        setActive(event.panel)
        if (event.reason === 'input') next.setSheet('full')
        else if (next.layout.sheet === 'collapsed') next.setSheet('half')
      }
      previous = next
    })
  }, [store])

  const page = (id: SheetPanel) => {
    switch (id) {
      case 'console':
        return <Console onReveal={(line) => editorRef.current?.revealLine(line)} />
      case 'problems':
        return <Problems onReveal={(from, to) => editorRef.current?.revealSpan(from, to)} />
      case 'variables':
        return <Variables />
    }
  }

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <MobileTopBar env={env} />
      <div className="min-h-0 flex-1" onFocus={() => setEditorFocused(true)} onBlur={() => setEditorFocused(false)}>
        <Editor handleRef={editorRef} />
      </div>
      <SymbolBar view={editorRef.current?.view ?? null} visible={keyboard} />
      <BottomSheet
        position={sheet}
        onPosition={setSheet}
        tabs={SHEET_PANELS.map((id) => ({ id, label: strings.panels[id] }))}
        active={active}
        onActive={setActive}
        actions={<PanelActions panel={active} />}
        labels={{ collapse: strings.dock.collapse, expand: strings.dock.expand, sheet: strings.mobile.sheet }}
      >
        {page}
      </BottomSheet>
      <div className="[&>footer>button:first-child]:hidden">
        <StatusBar onFocusEditor={() => editorRef.current?.focus()} />
      </div>
    </div>
  )
}
```

`MobileTopBar.tsx`: a 44 px bar (`h-11`) with the menu trigger (`IconButton` with `Hexagon`) opening a Radix Dialog whose content is a left sheet (`fixed inset-y-0 left-0 w-72`) rendering `menuModel(store, env, strings)` as a flat list — items as full-width buttons that run `onSelect` and close, separators as hairlines, submenus as a muted heading followed by their items; then `Filename`; then `RunControls compact`; then a `⋯` `Popover` (`IconButton` labelled `strings.mobile.moreActions`) holding Depurar and, while `state === 'paused'`, Paso/Entrar/Salir as `IconButton`s with the same labels and shortcuts as `RunControls`.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/MobileShell.test.tsx` → PASS.

- [ ] **Step 6: Commit**

```bash
pnpm lint:fix && pnpm lint && pnpm --filter @stepcode/editor typecheck
git add packages/editor/src/shell/mobile packages/editor/test/symbols.test.ts packages/editor/test/viewport.test.ts packages/editor/test/BottomSheet.test.tsx packages/editor/test/SymbolBar.test.tsx packages/editor/test/MobileShell.test.tsx
git commit -m "feat(editor): phone shell with bottom sheet and symbol bar"
```

---

### Task 14: integration — App, main, dialog host, cleanup, README

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`, `src/runtime/host.ts` (the `'worker error'` literal), `packages/editor/README.md`
- Create: `src/dialogs/DialogHost.tsx`, `src/shell/useIsNarrow.ts`
- Delete: `src/components/Toolbar.tsx`, `src/components/shortcuts.ts`, `test/Toolbar.test.tsx`, `test/shortcuts.test.ts`
- Test: `test/App.test.tsx` (rewrite), `test/DialogHost.test.tsx`, `test/useIsNarrow.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: `App({ env, narrow? })`, `useIsNarrow(matchMedia?): boolean` (`(max-width: 767px)`), `DialogHost({ env })`; `main.tsx` bootstrap order: `readPersisted` → create host and store → `applyPersisted` → `watchSystemTheme` → `readDocument` → `applyDocument` → `applyShareFromLocation` → `startPersisting` + `startDocumentPersisting` → render.

- [ ] **Step 1: Write the failing tests**

`test/useIsNarrow.test.ts`:

```ts
// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useIsNarrow } from '../src/shell/useIsNarrow'

describe('useIsNarrow', () => {
  it('follows the media query', () => {
    let listener: ((e: { matches: boolean }) => void) | null = null
    const list = {
      matches: true,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => {
        listener = fn
      },
      removeEventListener: () => {},
    }
    const { result } = renderHook(() => useIsNarrow(() => list as never))
    expect(result.current).toBe(true)
    act(() => listener?.({ matches: false }))
    expect(result.current).toBe(false)
  })
})
```

`test/DialogHost.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DialogHost } from '../src/dialogs/DialogHost'
import { TooltipProvider } from '../src/ui/Tooltip'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('DialogHost', () => {
  it('renders whichever dialog the store names', () => {
    const { store } = storeWith({})
    renderWithStore(
      <TooltipProvider>
        <DialogHost env={env} />
      </TooltipProvider>,
      store,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    for (const [name, title] of [['settings', 'Ajustes'], ['examples', 'Ejemplos'], ['share', 'Compartir'], ['about', 'Acerca de']] as const) {
      act(() => store.getState().openDialog(name))
      expect(screen.getByRole('dialog', { name: title })).toBeDefined()
      act(() => store.getState().closeDialog())
    }
  })
})
```

`test/App.test.tsx` (rewrite):

```tsx
// @vitest-environment happy-dom
import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../src/App'
import { renderWithStore, storeWith } from './render'

const env = { pickers: {}, download: vi.fn(), pickFallback: async () => null }

describe('App', () => {
  it('renders the desktop shell with toolbar, status bar and the editor', async () => {
    const { store } = storeWith({})
    renderWithStore(<App env={env} narrow={false} />, store)
    expect(screen.getByRole('button', { name: 'Menú' })).toBeDefined()
    expect(await screen.findByRole('region', { name: 'Editor' })).toBeDefined()
    expect(screen.getByRole('button', { name: /Sin problemas/ })).toBeDefined()
    expect(document.title).toBe('sin título.stepcode · StepCode')
  })

  it('renders the phone shell when narrow', () => {
    const { store } = storeWith({})
    renderWithStore(<App env={env} narrow />, store)
    expect(screen.getByRole('region', { name: 'Paneles' })).toBeDefined()
  })

  it('installs shortcuts and updates the title when dirty', () => {
    const { store, host } = storeWith({})
    const rendered = renderWithStore(<App env={env} narrow={false} />, store)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    expect(host.calls).toEqual(['start:run'])
    act(() => {
      host.emit({ kind: 'state', state: 'done' })
      store.getState().setSource('x')
    })
    expect(document.title).toBe('● sin título.stepcode · StepCode')
    rendered.unmount()
  })
})
```

- [ ] **Step 2: Write `useIsNarrow.ts`, `DialogHost.tsx`, `App.tsx`, `main.tsx`; delete the 4a components**

`src/shell/useIsNarrow.ts`:

```ts
import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

interface MediaList {
  readonly matches: boolean
  addEventListener(type: 'change', listener: (event: { matches: boolean }) => void): void
  removeEventListener(type: 'change', listener: (event: { matches: boolean }) => void): void
}

/** Spec §9: the phone shell below 768 px, re-evaluated on every change. */
export function useIsNarrow(
  matchMedia: ((query: string) => MediaList) | undefined = typeof window === 'undefined' ? undefined : window.matchMedia?.bind(window),
): boolean {
  const [narrow, setNarrow] = useState(() => matchMedia?.(QUERY).matches ?? false)
  useEffect(() => {
    if (matchMedia === undefined) return
    const list = matchMedia(QUERY)
    const listener = (event: { matches: boolean }): void => setNarrow(event.matches)
    list.addEventListener('change', listener)
    return () => list.removeEventListener('change', listener)
  }, [matchMedia])
  return narrow
}
```

`src/dialogs/DialogHost.tsx`:

```tsx
import type { FileEnvironment } from '../files/actions'
import { About } from './About'
import { ConfirmSave } from './ConfirmSave'
import { Examples } from './Examples'
import { Settings } from './Settings/Settings'
import { Share } from './Share'
import { Toaster } from './Toaster'
import { Warnings } from './Warnings'

export function DialogHost({ env }: { env: FileEnvironment }) {
  return (
    <>
      <Settings />
      <Examples />
      <Share />
      <About />
      <Warnings />
      <ConfirmSave env={env} />
      <Toaster />
    </>
  )
}
```

`src/App.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { DialogHost } from './dialogs/DialogHost'
import type { FileEnvironment } from './files/actions'
import type { EditorHandle } from './panels/Editor'
import { DesktopShell } from './shell/DesktopShell'
import { MobileShell } from './shell/mobile/MobileShell'
import { installShortcuts } from './shell/shortcuts'
import { StatusBar } from './shell/StatusBar'
import { Toolbar } from './shell/Toolbar'
import { useIsNarrow } from './shell/useIsNarrow'
import { useEditorStore, useEditorStoreApi } from './store/context'
import { isDirty, stringsOf } from './store/store'
import { TooltipProvider } from './ui/Tooltip'

export function App({ env, narrow }: { env: FileEnvironment; narrow?: boolean }) {
  const store = useEditorStoreApi()
  const detected = useIsNarrow()
  const isNarrow = narrow ?? detected
  const editor = useRef<EditorHandle | null>(null)
  const strings = useEditorStore(stringsOf)
  const name = useEditorStore((s) => s.name)
  const dirty = useEditorStore(isDirty)

  useEffect(() => installShortcuts(store, env), [store, env])
  useEffect(() => {
    document.title = strings.app.windowTitle(name, dirty)
  }, [strings, name, dirty])

  return (
    <TooltipProvider>
      {isNarrow ? (
        <MobileShell editorRef={editor} env={env} />
      ) : (
        <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] bg-bg text-fg">
          <Toolbar env={env} />
          <div className="min-h-0">
            <DesktopShell editorRef={editor} />
          </div>
          <StatusBar onFocusEditor={() => editor.current?.focus()} />
        </div>
      )}
      <DialogHost env={env} />
    </TooltipProvider>
  )
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { browserEnvironment } from './files/actions'
import { useUpdatePrompt } from './pwa/register'
import { UpdateToast } from './pwa/UpdateToast'
import { RuntimeHost } from './runtime/host'
import { applyShareFromLocation } from './share/onLoad'
import { StoreProvider } from './store/context'
import {
  applyDocument,
  applyPersisted,
  openDocumentStore,
  readDocument,
  readPersisted,
  startDocumentPersisting,
  startPersisting,
} from './store/persist'
import { createEditorStore, type EditorStore } from './store/store'
import { applyTheme, watchSystemTheme } from './theme/theme'
import './index.css'

function Root({ store }: { store: EditorStore }) {
  const { needRefresh, update } = useUpdatePrompt()
  return (
    <StoreProvider store={store}>
      <App env={browserEnvironment()} />
      <UpdateToast needRefresh={needRefresh} update={update} />
    </StoreProvider>
  )
}

async function boot(): Promise<void> {
  const root = document.getElementById('root')
  if (!root) throw new Error('Missing #root element')
  const persisted = readPersisted(localStorage)
  const store = createEditorStore(new RuntimeHost(), {
    applyTheme,
    initialTheme: persisted?.settings.appearance.theme ?? 'system',
  })
  if (persisted !== null) applyPersisted(store, persisted)
  watchSystemTheme((dark) => store.getState().setSystemDark(dark))
  const idb = openDocumentStore()
  const doc = await readDocument(idb)
  if (doc !== null) applyDocument(store, doc)
  await applyShareFromLocation(store)
  startPersisting(store, localStorage)
  startDocumentPersisting(store, idb)
  createRoot(root).render(
    <StrictMode>
      <Root store={store} />
    </StrictMode>,
  )
}

void boot()
```

Then: `git rm packages/editor/src/components/Toolbar.tsx packages/editor/src/components/shortcuts.ts packages/editor/test/Toolbar.test.tsx packages/editor/test/shortcuts.test.ts`; in `src/runtime/host.ts` replace the `'worker error'` literal with `stringsFor('es').host.workerError` (import `stringsFor` from `../strings`; the host has no store, so the home locale is the honest choice — note it in the README's open items); rewrite `README.md`'s "How it is put together" and "Keyboard" sections to describe the shell (dockview with collapse/float/pop-out, the `stepcode.editor` localStorage key and the `stepcode` IndexedDB database, files with the File System Access fallbacks, examples and the transposer, share links, the phone shell, the PWA), and add `Ctrl+N` (editor focused) · `Ctrl+O` · `Ctrl+S` · `Ctrl+Shift+S` · `Ctrl+,` · `Escape` to the Keyboard line; the Deployment section stays.

Run: `pnpm vitest run --project @stepcode/editor packages/editor/test/App.test.tsx packages/editor/test/DialogHost.test.tsx packages/editor/test/useIsNarrow.test.ts` → PASS.

- [ ] **Step 3: Whole-repo gate and a manual smoke**

```bash
pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm build && pnpm test
pnpm --filter @stepcode/editor exec wrangler deploy --dry-run --config wrangler.jsonc
```

Expected: all green; `packages/editor/dist/` contains `sw.js`, `manifest.webmanifest`, `popout.html`, `fonts/`. Start `pnpm dev`, open the editor, and check by hand: default layout (editor plus a collapsed strip), Ejecutar expands Consola, Depurar expands Variables, drag Problemas to the right edge, float it, Restablecer diseño, refresh restores the layout, Ajustes changes the font size live, Ejemplos loads a program, Compartir opens the link in a new tab with the same program, a window under 768 px shows the sheet. Record what was checked in the report.

- [ ] **Step 4: Commit**

```bash
git add -A packages/editor
git commit -m "feat(editor): assemble the shell — app, bootstrap, dialogs, cleanup"
```

---

## Self-review

**Spec coverage** (spec section → task):

| Spec | Task |
|---|---|
| §1 goal, split, deviations | header; Task 4 (decode in 4b); Tasks 6, 11, 12 (collapse, not close; header actions); Task 7 (file icons); Task 12 (phone in 4b) |
| §2.1 bands and heights | Task 7 (toolbar 40 px), Task 8 (status 24 px), Task 6 (header 28 px), Task 12 (44, 36, 40 px) |
| §2.2 type, spacing, icons, focus, motion | Task 1 (`index.css`, `icons.tsx`, `Tooltip.tsx`, `keys.ts`) |
| §2.3 tokens | Task 1 |
| §2.4 theme preference | Task 1 (store), Task 13 (watcher), Task 9 (Apariencia) |
| §3.1 engine and chrome | Task 6 |
| §3.2 default layout | Task 6 (`defaultLayout.ts`) |
| §3.3 collapse | Task 6 (`collapse.ts`, vertical strip in `dock.css`) |
| §3.4 auto-expand | Task 1 (`autoExpand.ts`, `runSeq`, `pausedInRun`), Tasks 6 and 12 |
| §3.5 pop-out | Task 6 (`popout.html`; real-window smoke deferred to 4c) |
| §3.6 panel refinements | Task 11 |
| §4.1–4.3 toolbar, filename, run cluster | Task 7 |
| §4.4 menu | Task 7 (`menuModel`), Task 12 (phone sheet) |
| §4.5 shortcuts | Task 7 (`shortcuts.ts`), Task 14 (install) |
| §5 status bar | Task 8 |
| §6 settings | Task 9; §6.3 warnings prompt in Task 1 (store) and Task 10 (`Warnings.tsx`) |
| §7.1 localStorage | Task 1 (`persist.ts`), Task 14 (bootstrap) |
| §7.2 IndexedDB | Task 1, Task 14 |
| §8.1 document model | Task 1 (store), Task 5 (`ConfirmSave`) |
| §8.2 file actions | Task 5 |
| §8.3 examples | Task 3 (files, index, cross-profile test), Task 10 (dialog) |
| §8.4 transposer | Task 2 |
| §8.5 share | Task 4, Task 10 (dialog), Task 14 (on load) |
| §9 phone layout | Task 12, Task 14 (`useIsNarrow`) |
| §10 PWA and About | Task 13, Task 10 |
| §11 strings | Task 1 (table and parity test), Task 14 (host literal) |
| §12 package changes | Task 1 (dependencies); file layout across the tasks |
| §13 testing | every task; tokens-only and parity in Task 1; examples × profiles in Task 3 |
| §14 decisions | header deviations and the tasks above |

Not covered on purpose: Playwright gestures, floating drag, a real popout window — 4c.

**Placeholder scan:** no "TBD"/"TODO". Task 1's `store.ts` listing says "… exactly the interface in the task header …" and names the 4a `format`/`lineOf`/`receive` functions the implementer copies with one stated addition; both are precise references, not gaps. Tasks 9, 10 and 12 describe their smaller components (`Rail`, the section files, `Examples`, `Share`, `About`, `Warnings`, `MobileTopBar`) in prose that names every control, string key and store action, and their tests pin the observable behaviour.

**Type consistency:** `PanelId`, `SheetPosition`, `LayoutState`, `PanelRequest`, `DocumentDraft`, `FileHandle`, `Settings`, `SettingsSection`, `DialogName`, `Toast`, `ThemePreference` are defined in Task 1 and imported by name everywhere else. `FileEnvironment` (Task 5) is the `env` prop of `Toolbar`, `Menu`, `ConfirmSave`, `DialogHost`, `MobileTopBar`, `MobileShell`, `App`, and the third argument of `installShortcuts`. `EditorHandle` gains `focus()` and `revealLine(line)` in Task 11 and is consumed by Tasks 6, 12, 14. `profileItems` is defined in Task 8 and imported by Task 7 (`Menu`) and Task 9 (`Language`), so 7 and 9 follow 8 — the wave table satisfies that. `autoExpandTarget`'s `ExpandInput` is a structural subset of `StoreState`, so both shells pass store snapshots directly. `Console`'s new `onReveal?: (line: number) => void` prop (Task 11) is used by Tasks 6 and 12. `RunControls`' `compact` prop (Task 7) is used by Task 12.

## Deviations from the plan, decided while executing

(The executor appends `N. **Title.** What changed and why.` entries here, mirroring the ledger rulings.)
