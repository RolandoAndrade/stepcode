# Release 2.0.0 — design

Sub-project 7 of the StepCode v2 rewrite (umbrella: `2026-09-03-stepcode-v2-design.md`, §7
step 7, §8). Branch `RolandoAndrade/v2`. The last sub-project: it ships the packages, merges the
branch, and moves production to v2.

## 1. Goal

`stepcode@2.0.0` and the three `@stepcode/*` packages on npm, `RolandoAndrade/v2` merged into
`master` with its history, `stepcode.online` serving the v2 editor from the `stepcode-editor`
Worker, the v1 Pages project gone, the old `stepcode.rolandoandrade.me` proxy turned into a
redirect, and the academy consuming the published grammar package.

## 2. Scope

In: version and changelog generation, the manual first publish, git tags, the merge, the
Cloudflare domain move, the redirect, the academy dependency swap and build check, the code
and docs changes that make those steps correct, a final handoff.

Out: deploying the academy; registering npm trusted publishers and connecting Workers Builds
(user-owned, dashboard-only; documented in §7); `www.stepcode.online`; deleting the
`RolandoAndrade/v2` branch and this worktree (asked at the end); any feature work.

## 3. State before the release (verified 2026-09-06)

- npm: `stepcode@0.12.0` (2023, published by hand); `@stepcode/profiles`, `@stepcode/codemirror`,
  `@stepcode/textmate` do not exist. The VPS has no valid npm token.
- Cloudflare (account "Indie Hacking"): Pages project `stepcode-editor` (repo
  `RolandoAndrade/stepcode-editor`, archived) serves `stepcode-editor.pages.dev` and the custom
  domain `stepcode.online` (v1 editor, last deployed 2023-12-17). Worker `stepcode-subdomain`
  on the custom domain `stepcode.rolandoandrade.me` proxies every request to
  `stepcode-editor.pages.dev`. Worker `stepcode-editor` (v2, assets only) serves
  `stepcode-editor.rolandoandradefernandez.workers.dev`, deployed by hand; Workers Builds is not
  connected. Zone `stepcode.online` exists on the account.
- Repo: `packages/language` is `2.0.0-dev.0`; profiles, codemirror, textmate are `0.0.0`; the
  editor is `0.0.0`, private and ignored by changesets. Thirteen changesets are pending. No
  `CHANGELOG.md` anywhere. `release.yml` runs the changesets action on push to `master` with
  `id-token: write` and provenance but no npm token. `ci.yml` also triggers on pushes to
  `RolandoAndrade/v2`. `master` has no `.github/`, a lowercase `readme.md`, and v1's `src/`.
- Academy (`~/projects/academy`, local git, no remote): depends on
  `@stepcode/textmate` as `link:../stepcode/packages/textmate`; never installed since.

## 4. Decisions

- **Versions.** All four packages ship as `2.0.0`. profiles, codemirror and textmate are set
  to `2.0.0-dev.0` before versioning so the pending `minor` changesets resolve to `2.0.0`
  (semver `inc('2.0.0-dev.0', 'minor')` is `2.0.0`, the same trick the language package
  used). Versioning stays independent afterwards; no `fixed` or `linked` group.
- **Publish before merge, by hand, from the VPS.** The user logs in (`npm login`); the branch
  runs `changeset version`, commits the bump and changelogs, builds, and `changeset publish`
  with provenance off (provenance needs a CI OIDC token). `changeset tag` creates the four
  `name@2.0.0` tags, pushed to origin. When `master` later receives the merge, `release.yml`
  finds no changesets and versions already on npm, so it publishes nothing and fails nothing.
- **Trusted publishing later, no token in CI.** `release.yml` is unchanged: with npm ≥ 11.5 on
  Node 24 and `id-token: write`, `npm publish` authenticates through OIDC once the user has
  registered `RolandoAndrade/stepcode` / `release.yml` as the trusted publisher of each package
  (possible only after this first publish). Until then the workflow's publish step would fail
  only if a new changeset lands on `master`; §7 lists the registration as the first
  post-release task.
- **Merge commit, not squash.** Umbrella §8 keeps the language's history; PR #1 merges with a
  merge commit. The `readme.md` → `README.md` case rename and the deletion of v1's `src/` are
  ordinary on Linux and on GitHub.
- **Editor version = language version.** `vite.config.ts` injects `packages/language`'s
  version into `__APP_VERSION__`, so the About dialog shows `2.0.0` and changesets keep it
  current. The editor's own `package.json` version stays `0.0.0` and unpublished.
- **Domains.** `stepcode.online` moves to the `stepcode-editor` Worker as a custom domain
  (`routes: [{ pattern: "stepcode.online", zone_name: "stepcode.online", custom_domain: true }]`
  in `wrangler.jsonc`;
  Cloudflare manages the DNS record). The Pages project is deleted after the Worker answers on
  the domain. The `stepcode-subdomain` Worker is redeployed as a 301 redirect from
  `stepcode.rolandoandrade.me/<path>?<query>` to `https://stepcode.online/<path>?<query>`, so
  links shared under the old name keep working; its source lives in the monorepo under
  `packages/editor/redirect/` (a two-file Worker: `wrangler.jsonc` and `index.js`), deployed by
  hand.
- **About links.** The academy hostname (`academy.rolandoandrade.me`, the Astro `site`) has
  no DNS record until the academy deploys, so the About dialog renders the academy link only
  when a URL is configured, and none is configured at release; the repository link is
  unchanged. Re-enabling it is a one-line default once the academy is live.
- **Academy dependency.** `"@stepcode/textmate": "^2.0.0"`, `pnpm install`, `pnpm build`
  succeeds and the built HTML for a StepCode code block contains Shiki tokens (no
  `language-pascal`); committed locally, not deployed.

## 5. Changes on the branch (before the runbook)

| Area | Change |
|---|---|
| `packages/{profiles,codemirror,textmate}/package.json` | `"version": "2.0.0-dev.0"` |
| `packages/{language,codemirror,textmate}/package.json` | internal `dependencies` from `workspace:*` to `workspace:^`, so pnpm publishes them as `^2.0.0` rather than the exact `2.0.0` (the editor's and the dev dependencies stay `workspace:*`) |
| `packages/editor/vite.config.ts` | read `../language/package.json` for `__APP_VERSION__`; comment says why |
| `packages/editor/src/dialogs/About.tsx`, `test/About.test.tsx` | `academy` becomes an optional prop with no default; the link renders only when given |
| `packages/editor/wrangler.jsonc` | `routes` with the custom domain; `workers_dev` stays on for previews |
| `packages/editor/redirect/{wrangler.jsonc,index.js}` | the redirect Worker (`name: "stepcode-subdomain"`, custom domain `stepcode.rolandoandrade.me`) |
| `packages/editor/test/deploy.test.ts` | asserts the route and that the redirect config names the old hostname |
| `packages/editor/README.md` | deployment section: custom domain, production branch `master`, the redirect Worker |
| `.github/workflows/ci.yml` | push trigger `[master]` only |
| `README.md` | editor row "deployed to Cloudflare Workers at stepcode.online"; intro no longer says v1 lives on master; Releasing section describes the trusted-publishing flow |
| `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` | §5 "publish on tag" → "publish from `master` through changesets"; §7 step 7 marked done with a pointer here |
| `.changeset/` | no new changeset: the version bump is the release itself |

`pnpm lint && pnpm typecheck && pnpm build && pnpm test` and `pnpm e2e` must stay clean; CI
runs `wrangler deploy --dry-run`, which validates the new route syntax.

## 6. Runbook

Every step that publishes, merges, or changes Cloudflare waits for the user's explicit go. Each
step names its verification; a failed verification stops the runbook.

1. **Login.** User: `npm login` on the VPS (`! npm login` in the session). Check: `npm whoami`.
2. **Version.** First `pnpm changeset status --verbose` (the only dry run changesets has):
   four packages predicted at `2.0.0`, the editor absent. Then
   `GITHUB_TOKEN=$(gh auth token) pnpm changeset version`: the GitHub changelog generator
   throws without a token. Inspect the diff: four `package.json` at `2.0.0`, four new
   `CHANGELOG.md`, `.changeset/*.md` consumed, the internal ranges untouched (`workspace:^` in
   language/codemirror/textmate, `workspace:*` in the editor). Commit
   `chore: version packages for 2.0.0`, push.
3. **Publish.** `pnpm build`; then verify the manifest pnpm will publish before the
   irreversible step: `pnpm --filter @stepcode/codemirror exec pnpm pack --out <tmp>/cm.tgz`
   and read `package/package.json` from the tarball: `dependencies` must show
   `"stepcode": "^2.0.0"`, `"@stepcode/profiles": "^2.0.0"` and caret `@codemirror/*` ranges,
   with no `workspace:` or `catalog:` left, and `exports` must have no `development` condition.
   Then `pnpm changeset publish --no-git-tag` with `NPM_CONFIG_PROVENANCE=false`; changesets
   calls `pnpm publish`, which rewrites `workspace:^` to `^2.0.0`. If the npm account enforces
   2FA, pass `--otp <code>` (an expired code midway is the partial-publish case of §8). Check: `npm view <name> version` is `2.0.0` for the four; `npm pack --dry-run`
   is not needed because `files` and `publishConfig.exports` were reviewed in their
   sub-projects. Then `pnpm changeset git-tag` (`changeset tag` is a deprecated alias) and `git push --tags`.
4. **Merge.** `gh pr ready 1`, wait for CI green on the branch head, `gh pr merge 1 --merge`.
   Check: `master` head is the merge commit; `release.yml` on `master` completes without
   publishing; `ci.yml` on `master` is green.
5. **Domain move.** (a) Remove `stepcode.online` from the Pages project's custom domains (API).
   (b) From `master` in the main checkout: `pnpm install --frozen-lockfile`, `pnpm --filter
   @stepcode/editor... build`, `pnpm --filter @stepcode/editor exec wrangler deploy --config
   wrangler.jsonc` in an interactive terminal (attaching a custom domain whose DNS record still
   exists prompts for confirmation; a non-TTY run fails instead); wrangler attaches the custom
   domain and creates the DNS record. Check: `curl -sI
   https://stepcode.online/` is 200 with the SPA `index.html`, `/embed` is 200, the About
   dialog on the site shows `Versión 2.0.0` (check `__APP_VERSION__` in the served bundle).
   (c) Deploy the redirect Worker: `pnpm --filter @stepcode/editor exec wrangler deploy
   --dry-run --config redirect/wrangler.jsonc`, then the same without `--dry-run`. Check: `curl -sI
   https://stepcode.rolandoandrade.me/?example=x` is 301 to
   `https://stepcode.online/?example=x`. (d) Delete the Pages project `stepcode-editor` (API).
   Check: `stepcode-editor.pages.dev` no longer resolves to the v1 editor; `stepcode.online`
   still serves v2.
6. **Academy.** In `~/projects/academy`: dependency `^2.0.0`, `pnpm install`, `pnpm build`;
   check the built HTML of a lesson with a StepCode block for Shiki token spans and no
   `pascal`; commit `Depend on the published @stepcode/textmate`.
7. **Handoff.** `docs/superpowers/handoffs/2026-09-06-release-handoff.md` on `master`
   (through a small PR or a direct commit, user's call), the umbrella table complete, the
   post-release list of §7.

## 7. User-owned after the runbook

- npm: register trusted publishers for `stepcode`, `@stepcode/profiles`, `@stepcode/codemirror`,
  `@stepcode/textmate` (repository `RolandoAndrade/stepcode`, workflow `release.yml`,
  environment none), so `release.yml` can publish future changesets with provenance.
- Cloudflare: connect `RolandoAndrade/stepcode` in Workers Builds with the settings in
  `packages/editor/README.md` (production branch `master`), so pushes deploy the editor and
  PRs get preview URLs.
- Decide `www.stepcode.online` (a redirect rule on the zone) and whether to delete the
  `RolandoAndrade/v2` branch and the orca worktree.
- Academy content: English lessons still use Spanish keywords under ` ```stepcode `.

## 8. Risks

- `changeset publish` publishes packages one by one; a failure midway leaves some published.
  Re-running skips what is on npm already, so the fix is to re-run.
- Provenance is off for this first publish; later CI publishes carry it.
- Removing the Pages custom domain before the Worker deploy causes a short window where
  `stepcode.online` answers with a Cloudflare error; acceptable, the site is not in use.
- The redirect Worker changes behaviour for anyone who embedded the v1 editor at
  `stepcode.rolandoandrade.me`: they now get v2 through the redirect, which is the intent.
