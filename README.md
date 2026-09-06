# StepCode

StepCode is a pseudocode language for learning to program, compatible with
[PSeInt](http://pseint.sourceforge.net/) and available in Spanish, English, and any
keyword profile you define. Version 2 is a rewrite as a pnpm monorepo; the editor runs at https://stepcode.online and the packages are on npm.

## Packages

| Package | Path | What it is |
|---|---|---|
| `stepcode` | `packages/language` | Lexer, parser, checker, and steppable interpreter |
| `@stepcode/profiles` | `packages/profiles` | Keyword profiles (`es`, `en`, `pseint`) and their schema |
| `@stepcode/codemirror` | `packages/codemirror` | CodeMirror 6 language support and debug extensions |
| `@stepcode/textmate` | `packages/textmate` | TextMate grammar generator for Shiki / VS Code |
| `@stepcode/editor` | `packages/editor` | The web editor (private, deployed to Cloudflare Workers at stepcode.online) |

Dependencies flow one way: `profiles ← language ← codemirror ← editor`, `profiles ← textmate`.

## Development

Requires Node 24 and pnpm 11 (`corepack enable` picks the pinned version).

```sh
pnpm install
pnpm dev          # editor dev server
pnpm test         # all packages
pnpm typecheck
pnpm lint         # biome; `pnpm lint:fix` to format
pnpm build        # all packages, in dependency order
```

Libraries expose `src/` through a `development` export condition, so tests and the dev server
never need a build. Published packages resolve to `dist/`.

## Releasing

`pnpm changeset` records a change. On `master`, the release workflow opens or updates a
"Version Packages" PR; merging that PR bumps versions and changelogs and publishes the four
packages with npm provenance through trusted publishing (no token in the repository). The
first 2.0.0 publish was done by hand; see `docs/superpowers/specs/2026-09-06-release-design.md`.

## Design

See `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md`.

## License

MIT — see `LICENSE.txt`.
