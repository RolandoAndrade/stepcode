# StepCode

StepCode is a pseudocode language for learning to program, compatible with
[PSeInt](http://pseint.sourceforge.net/) and available in Spanish, English, and any
keyword profile you define. This repository is the v2 monorepo; v1 (0.12.0) lives on `master`
until v2 reaches parity.

## Packages

| Package | Path | What it is |
|---|---|---|
| `stepcode` | `packages/language` | Lexer, parser, checker, and steppable interpreter |
| `@stepcode/profiles` | `packages/profiles` | Keyword profiles (`es`, `en`, `pseint`) and their schema |
| `@stepcode/codemirror` | `packages/codemirror` | CodeMirror 6 language support and debug extensions |
| `@stepcode/textmate` | `packages/textmate` | TextMate grammar generator for Shiki / VS Code |
| `@stepcode/editor` | `packages/editor` | The web editor (private, deployed to Cloudflare Pages) |

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

`pnpm changeset` records a change; merging the generated "Version Packages" PR publishes to npm.
Changesets diffs against `master` and the release workflow runs only on `master`, so versioning
and publishing are not available from `RolandoAndrade/v2` until it merges.

## Design

See `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md`.

## License

MIT — see `LICENSE.txt`.
