# Handoff: after sub-project 6 (`@stepcode/textmate`)

Written 2026-09-06 on branch `RolandoAndrade/v2` (worktree `/home/ubuntu/orca/workspaces/stepcode/v2`,
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
| 4c. Editor distribution | done | `specs/2026-09-05-editor-distribution-design.md` |
| **6. `@stepcode/textmate`** | **done today** | `specs/2026-09-06-textmate-design.md`, `plans/2026-09-06-textmate.md` |
| 7. Release 2.0.0 | next, last | umbrella §7 |

Head: see `git log -1`. Gate `pnpm lint && pnpm typecheck && pnpm build && pnpm test` clean
(154 files, 4 253 tests; the 51 Biome warnings are pre-existing in `packages/language` tests).

## What 6 delivered

`packages/textmate` (16 commits after the plan, 358e87d..HEAD):

- **Generator** (`src/regex.ts`, `src/scopes.ts`, `src/generate.ts`): `generateGrammar(profile,
  { name, scopeName, displayName?, aliases? })` builds a TextMate grammar from any
  `ResolvedProfile`. Word rules use Unicode lookaround boundaries (never `\b`), `(?i)` unless the
  profile is case-sensitive, accent character classes when it folds accents, and one leading
  `multiword` rule with a numbered capture per family so `Sino Si` beats `Sino`. Symbol rules:
  line comment from the profile's comment spelling, single-line strings without escapes,
  real-before-integer numbers, operator families (letter-spelled operators are word-bounded and
  matched exactly, as the lexer does), fixed punctuation, identifier fallback. Structural rules:
  subprogram and program names, `Definir` lists (names and commas), call names before `(`.
  Every scope lives in `scopes.ts` and ends in `.stepcode`; the table mirrors CodeMirror's
  `styleTags` families.
- **Ready-made grammars** (`src/index.ts`): `stepcode` (es, `source.stepcode`), `stepcodeEn`
  (`stepcode-en`), `stepcodePseint` (`stepcode-pseint`), and the readonly `grammars` array; the
  same three committed as `grammars/*.json` (Vitest file snapshots, exported as
  `@stepcode/textmate/grammars/*.json`, regenerated with `pnpm --filter @stepcode/textmate
  generate`, excluded from Biome).
- **Tests** (`test/`): regex and generator units; JSON freshness per profile; Shiki tokenization
  of `samples/{es,en,custom,edge,letterop}.stepcode` on both the JavaScript (`forgiving: false`)
  and Oniguruma engines with a per-token scope table; lexer conformance (every `stepcode` lexer
  token must land on a Shiki scope of the matching family, five profile/sample cases); a
  cast-free assignment to Shiki's `LanguageRegistration`. `shiki` and `stepcode` are dev
  dependencies only; the runtime dependency is `@stepcode/profiles`.
- **Docs**: `packages/textmate/README.md` (Shiki and Astro snippets, scope list, limits), the
  `.changeset/textmate.md` minor.
- **Academy** (`~/projects/academy`, local git, no remote, commit 880efa6): `@stepcode/textmate`
  as `link:../stepcode/packages/textmate`, `shikiConfig.langs: [...grammars]` replacing the
  Pascal `langAlias`, README gap note updated. `pnpm install` was not run there: the link
  resolves once this branch merges into `~/projects/stepcode` and the package is built. Release
  swaps the link for the npm range.

## Decisions worth remembering

- Plan deviations (recorded at the top of the plan): JSON grammars are Vitest file snapshots,
  not a Node script (Node's type stripping cannot follow the workspace's extensionless imports);
  `grammars` is readonly so consumers spread it; `assignWithEquals` needs no grammar code (the
  lexer never reads it); the error samples live in a Shiki-only fixture; Biome ignores the
  generated JSON.
- Rulings during execution: a family whose spellings are all multi-word (es `byRef`/`byValue`)
  emits no family rule, its scope arrives through `multiword`; `escapeRegex` leaves `-`
  unescaped (a bare `-` outside a class is literal on both engines); `resolveProfile` rejects
  empty spelling lists except `case`, so the brief's "empty list" tests became letterless or
  alternative-spelling tests; sort tie-breaks use code-point order, not `localeCompare`, so the
  snapshots are stable across ICU builds.
- The lexer conformance test found a real defect (commas inside `Definir` lists were unscoped)
  and the final review found another (letter-spelled operators matched inside identifiers). Both
  fixed with unit tests; keep that test when the profile schema or the lexer changes.
- Known limits (spec §9, README): line-based multi-word matching; Latin-1 accent folding only;
  heuristic calls and definitions; type and builtin spellings must contain a letter to be
  highlighted.

## Next: 7 (release 2.0.0)

Umbrella §7 step 7: `stepcode@2.0.0`, publish `@stepcode/profiles`, `@stepcode/codemirror`,
`@stepcode/textmate` (changesets are in place), merge `RolandoAndrade/v2` into `master`, repoint
Cloudflare, delete the `stepcode-subdomain` worker, and swap the academy's `link:` dependency for
the published range. Draft PR https://github.com/RolandoAndrade/stepcode/pull/1 tracks the branch.

## Open items (deferred, none blocking)

- `test/shiki.test.ts` anchors a few assertions on sample line numbers (es 3, 4, 7, 19, 36, 37,
  42, 43, 46; en 18, 23); inserting a line above them breaks the anchors with a misleading
  message. Append to samples, or switch to string anchors.
- `SCOPES.subprogramName` also names the program rule's capture (same scope, misleading key);
  `index.ts` imports `./generate` twice (value import plus re-export); `spellingsOf` and
  `symbolSpellingsOf` each flatten the keyword table; `helpers.ts` and `lexer.test.ts` cast the
  language id to Shiki's `BundledLanguage`; `tsconfig.json`'s `types: ["node"]` covers `src/`
  too (the "no Node built-ins in `src/`" rule is convention).
- Three branches in `generate.ts` are unreachable under the current profile schema (empty
  comment, empty operator family, no assignment spelling); they are commented as such and
  untested.
- The English academy lessons still write Spanish keywords under ` ```stepcode `; switching them
  to ` ```stepcode-en ` is content work in the academy.

## Process notes

- Subagent-driven development, eight sequential tasks (one implementer at a time, the package is
  small), per-task review, one pre-review fix on a controller ruling (Task 2), one fix round
  (Task 6), final whole-branch review (opus) with 0 Critical / 3 Important / minors, one fix
  wave of six commits, scoped re-review clean.
- Ledger and briefs lived in `.superpowers/sdd/2026-09-06-textmate/` (deleted at close).
