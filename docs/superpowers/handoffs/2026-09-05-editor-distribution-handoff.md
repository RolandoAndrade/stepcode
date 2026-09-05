# Handoff: after sub-project 4c (editor distribution)

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
| 4b. Editor shell | done, plus polish batch 2 | `specs/2026-09-05-editor-shell-design.md` |
| **4c. Editor distribution** | **done today** | `specs/2026-09-05-editor-distribution-design.md`, `plans/2026-09-05-editor-distribution.md` |
| 6. `@stepcode/textmate` | any time | — |
| 7. Release 2.0.0 | last | umbrella §7 |

Head: see `git log -1`. Gate `pnpm lint && pnpm typecheck && pnpm build && pnpm test` clean
(148 files, 4 050 tests); `pnpm e2e` 26 passed, 2 `test.fixme`. Preview deployed by hand at
https://stepcode-editor.rolandoandradefernandez.workers.dev (`/embed` included).

## What 4c delivered

- **Programs by URL** on `/` and `/embed` (`src/share/{urlOptions,src,load,onLoad}.ts`): `#code=`
  (now with `name=`), then `?example=<topic/slug>`, then `?src=<url>` limited to GitHub blob/raw and
  Gist URLs rewritten to their raw form, streamed with a 5 MB cap, text only. Flags `profile`
  (builtin ids), `autorun`, `lang`, and on the embed `title`, `readonly`, `showProfile`, `debug`,
  `theme`. Failures fall through and are phrased through `bootFromUrl` (toast on `/`, console line
  on `/embed`).
- **`/embed`** (`embed.html`, `src/embed/*`): second Vite entry, title-first top bar, run cluster
  (`RunControls debug` prop), editor (`Editor readOnly` prop), console at 35 % with a tight mode
  under 252 px, Variables with `debug`; no persistence, dialogs, dockview or service worker
  (`globIgnores` plus `navigateFallbackDenylist`); warnings never block a run; toasts forwarded to
  the console; theme painted at boot.
- **postMessage bridge** (`src/embed/bridge.ts`, protocol 1): in `setSource`, `getSource`, the run
  controls, `input`, `setProfile {profileId | profile}`, `setTheme`; out `ready`, `source`,
  `diagnostics`, `state`, `paused`, `inputRequest`, `output` (cap-aware), `done`, `error`. Any
  origin by design; documented in `packages/editor/README.md`.
- **Compartir**: Enlace and Insertar tabs; Insertar has flag toggles, tema, alto, a live preview
  (never with an empty URL) and the iframe snippet from pure `embedUrl`/`embedSnippet`.
- **Playwright** (`packages/editor/e2e`, `@playwright/test` ^1.62.1, Chromium, desktop + Pixel 7,
  `vite preview`, CI job `e2e`): smoke, desktop dock, phone sheet, URL sources, embed with a host
  fixture that drives the protocol.

## Decisions worth remembering

- Embeds target Canvas LMS first: the URL is the whole API, frames are fixed height, no height
  messages. The academy may drive frames through postMessage (autograding shape).
- `?profile=` takes builtin ids only; custom profiles arrive by `setProfile {profile}`.
- Unknown inbound message types are ignored on purpose (the window receives host traffic).
- `?profile=`/`?lang=` land before `startPersisting`; they persist only if the reader then changes
  a setting (plan deviation 10, README caveat).
- The "muted" console line of spec §3.5 renders as a plain line: the output buffer has no styled
  chunk kind.

## Parked for the user (outside 4c's files)

- The desktop shell no longer renders Flotar / Abrir en ventana header actions (strings exist,
  unused since polish batch 2). Float works only through dockview's Shift-drag; popout is
  unreachable, so `e2e/desktop.spec.ts` keeps the popout test as `test.fixme`.
- The phone sheet's drag has no pointer capture: a pointerup that lands off the 36 px handle is
  lost. Mouse users are affected. `e2e/mobile.spec.ts` covers the positions by tap.
- The SymbolBar only mounts with an on-screen keyboard (fixme in the phone spec).

## Open items (deferred, none blocking)

- Playwright phone project relies on the `Pixel 7` preset for `isMobile`.
- `embedUrl` defaults its base from the global `location`.
- `Editor` transactionFilter comment overstates; run-state read-only stays facet-only.
- `MAX_SRC_BYTES` duplicates the share cap; `srcName` drops any `raw` segment.
- Share tabs keep a controlled `onClick` pair for `fireEvent.click`; tests use `getByLabelText`
  with a selector.
- Bridge fan-out is one full-state listener; the boot-catch fallback path is minimal.
- Console under 240 px is a 72 px band, not a "last line + input" mode.
- happy-dom logs a local "Iframe page loading is disabled" stack in `Share.test.tsx`.
- The `assets/embed-*.js` chunk is still precached (content-hashed, harmless).

## Next

- 6 `@stepcode/textmate`; 7 release 2.0.0 (npm: manual first publish of the three `@stepcode/*`
  packages with 2FA, attach the trusted publisher `RolandoAndrade/stepcode` + `release.yml` to each,
  delete the `NPM_TOKEN` secret; `release.yml` already publishes through OIDC with provenance).
- Consider restoring Flotar / Abrir en ventana and fixing the sheet pointer capture before release.
- Workers Builds for per-commit previews; until then deploy by hand.
