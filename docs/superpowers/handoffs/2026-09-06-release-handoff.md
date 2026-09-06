# Handoff: after sub-project 7 (release 2.0.0)

Written 2026-09-06 on `master` (main checkout `~/projects/stepcode`). The v2 rewrite is
complete and shipped; `RolandoAndrade/v2` was merged with a merge commit (74c6a82).

## Where things stand

| Sub-project | Status | Spec / plan |
|---|---|---|
| 1. Monorepo skeleton | done | umbrella `specs/2026-09-03-stepcode-v2-design.md` |
| 2. `@stepcode/profiles` | done | `specs/2026-09-03-profiles-design.md` |
| 3a–3c. Language | done | `specs/2026-09-0{3,4}-language-*-design.md` |
| 5. `@stepcode/codemirror` | done | `specs/2026-09-04-codemirror-design.md` |
| 4a–4c. Editor | done | `specs/2026-09-05-editor-{core,shell,distribution}-design.md` |
| 6. `@stepcode/textmate` | done | `specs/2026-09-06-textmate-design.md` |
| **7. Release 2.0.0** | **done today** | `specs/2026-09-06-release-design.md`, `plans/2026-09-06-release.md` |

Gate on `master`: `pnpm lint && pnpm typecheck && pnpm build && pnpm test` (156 files,
4 259 tests) and `pnpm e2e` (26) clean; CI and Release workflows green on 74c6a82.

## What shipped

- **npm**, all published 2026-09-06 from the VPS with `pnpm pack` + `npm publish` (passkey
  web auth), provenance off, and tagged `name@2.0.0` in git:
  `stepcode@2.0.0`, `@stepcode/profiles@2.0.0`, `@stepcode/codemirror@2.0.0`,
  `@stepcode/textmate@2.0.0`. Internal ranges publish as `^2.0.0`; each tarball carries
  `LICENSE`, `README.md`, `dist/` (and `grammars/` for textmate). CHANGELOGs live in each
  package.
- **Editor** at https://stepcode.online, served by the assets-only Worker `stepcode-editor`
  (custom domain in `packages/editor/wrangler.jsonc`; `workers.dev` kept for previews). The
  About dialog shows the language version (`2.0.0`) and no academy link until the academy is
  live. The `/embed` route and the `postMessage` protocol are unchanged; `ready.version` is
  the language version.
- **Redirect**: `stepcode.rolandoandrade.me` (Worker `stepcode-subdomain`, source in
  `packages/editor/redirect/`) answers 301 to `https://stepcode.online` with path and query
  kept. The v1 Pages project `stepcode-editor` is deleted.
- **Academy** (`~/projects/academy`, local git): depends on `@stepcode/textmate@^2.0.0`
  (commit 13c62bf), builds, StepCode blocks highlight through Shiki. Not deployed.
- **Workers Builds** connected to `RolandoAndrade/stepcode` (settings in
  `packages/editor/README.md`, production branch `master`).

## Decisions worth remembering

- Versions: all four packages start at 2.0.0 (the three new ones were set to `2.0.0-dev.0`
  so the pending minor changesets resolved there); independent semver from now on.
- Publish happened before the merge, so `release.yml` on `master` found nothing to publish.
  pnpm's `changeset publish` cannot do npm's passkey (web) 2FA; the working recipe is
  `pnpm --filter <pkg> exec pnpm pack` (rewrites `workspace:` and `catalog:`) then
  `npm publish <tgz> --access public` in a pseudo-terminal, which prints the auth link.
- `changeset version` needs `GITHUB_TOKEN` (the GitHub changelog generator throws without it).
- Custom domain attach needs the root name free of A/AAAA/CNAME records; the wrangler OAuth
  token cannot edit DNS, so that is a dashboard step.
- `pnpm --filter @stepcode/editor exec wrangler …` is the pinned-wrangler form; `npx wrangler`
  from the root would fetch latest.

## User-owned, still open

- **npm trusted publishing** for the four packages: on npmjs.com, package → Settings →
  Trusted publisher → GitHub Actions, repository `RolandoAndrade/stepcode`, workflow
  `release.yml`, no environment. Until then a new changeset merged to `master` makes the
  Release workflow's publish step fail (versioning PR still works).
- `www.stepcode.online`: no record today; a zone redirect rule to the apex if wanted.
- Delete the `RolandoAndrade/v2` branch and the orca worktree `~/orca/workspaces/stepcode/v2`
  when convenient.
- Academy: deploy it (then set the editor's About academy URL, one line in
  `packages/editor/src/dialogs/About.tsx` callers or a default) and switch the English lessons
  to ` ```stepcode-en ` with English keywords.

## Open items carried from earlier handoffs (none blocking)

- Editor: the desktop shell no longer renders Flotar / Abrir en ventana actions (popout e2e is
  `test.fixme`); the phone sheet's drag has no pointer capture; the SymbolBar mounts only with
  an on-screen keyboard; hard-coded sample line anchors in `packages/textmate/test/shiki.test.ts`.
- `@stepcode/codemirror` ships `@codemirror/*` and `@lezer/*` as `dependencies` rather than
  `peerDependencies`; revisit if duplicate-instance reports appear.
- Both `wrangler.jsonc` files are comment-free because tests `JSON.parse` them.
- Biome reports 51 pre-existing warnings in `packages/language` tests.

## Process notes

- Release ran as four reviewed branch tasks plus a controller-executed runbook with a user GO
  before every publish, merge and Cloudflare change; ledger in
  `.superpowers/sdd/2026-09-06-release/` (deleted at close).
