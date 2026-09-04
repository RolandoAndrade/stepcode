# Handoff — 2026-09-04 — StepCode v2, after sub-project 5

## Where things stand

Branch `RolandoAndrade/v2` (worktree `~/orca/workspaces/stepcode/v2`, main checkout
`~/projects/stepcode`). `master` still holds v0.12.0 and the deployed editor; nothing merges
until v2 reaches parity.

| Sub-project | Status | Spec / plan |
|---|---|---|
| 1. Monorepo skeleton | done | `specs/2026-09-03-stepcode-v2-design.md` (umbrella), `plans/2026-09-03-monorepo-skeleton.md` |
| 2. `@stepcode/profiles` | done | `specs/2026-09-03-profiles-design.md`, `plans/2026-09-03-profiles.md` |
| 3a. Language: lexer + parser + AST | done | `specs/2026-09-03-language-syntax-design.md`, `plans/2026-09-03-language-syntax.md` |
| 3b. Language: checker + diagnostics | done | `specs/2026-09-04-language-checker-design.md`, `plans/2026-09-04-language-checker.md` |
| 3c. Language: interpreter + run controller | done | `specs/2026-09-04-language-interpreter-design.md`, `plans/2026-09-04-language-interpreter.md` |
| 5. `@stepcode/codemirror` | **done today** | `specs/2026-09-04-codemirror-design.md`, `plans/2026-09-04-codemirror.md` |
| 4. Editor shell | next (the runtime and the editor language support are both real) | umbrella §4 |
| 6. `@stepcode/textmate` | any time | — |
| 7. Release 2.0.0 | last | umbrella §7 |

Head: see the last commit on the branch (`git log -1`); `pnpm lint`, `pnpm typecheck`,
`pnpm build`, `pnpm test` clean. CodeMirror package: 18 test files,
423 tests; whole repo 75 files, 3501 tests.

## What 5 delivered

`packages/codemirror` (npm `@stepcode/codemirror`, changeset `minor` pending) and one
additive change in `packages/language` (`CompileResult.tokens`, changeset `patch`):

- `stepcode({ profile, locale? })`: a `LanguageSupport` bundling the language, lint,
  completion, signature help, hover, block matching, `autocompletion()`, `indentOnInput()`,
  `foldGutter()`, the F12 keymap, and the base theme. Deliberately absent (spec §7): highlight
  style, lint gutter, line numbers, history, default keymap. A host switches profiles by
  wrapping the support in a `Compartment`.
- The tree: `src/parser.ts` is a custom `@lezer/common` `Parser` that compiles the whole
  document on every parse and hands the `CompileResult` plus identifier/call offset maps to
  the tree's top node as a per-tree prop (`treeDataAt`, `compileResultAt`). `src/tree.ts`
  builds the Lezer buffer from the AST and token stream; `src/nodes.ts` names the node types
  (one per keyword key, identifier leaves by role, punctuation leaves) and carries the
  `closedBy`/`openedBy` pairs and highlight tags. The tree invariant test runs every corpus
  program from the language package's fixtures: leaves cover every significant token exactly
  once, in order, nested inside their parents.
- Features on the tree: lint (`E`/`W` mapping, zero-width widening, an E3001 replace action),
  folding, indentation (block rules plus a `Program` rule for the line typed past an unclosed
  block at the end of the document, and the `valor:` case-line shape for `Segun`), block
  matching (keyword pairs and parentheses/brackets through tree props), completion (visible
  symbols by narrowest scope, builtins with signatures, types, keywords; block openers apply
  snippets with the closer already typed), signature help (active parameter highlighted),
  hover (kind, name, type, declaring line), go to definition (F12 only).
- Debug extensions, no runtime import: `breakpoints()` (gutter, `toggleBreakpoint`,
  `setBreakpoints`, `breakpointLines`, `breakpointsChanged`), `currentLine()`
  (`setCurrentLine`, `currentLineOf`, line decoration, gutter arrow, scroll into view),
  `debug()` for both; each carries the base theme so it renders standalone.
- Public surface pinned to spec §3 by `test/index.test.ts` (exact export set), plus
  `treeDataAt`, `TreeData`, `stepcodeDiagnostics`, `breakpointsChanged` for hosts.
- Tests under Node with happy-dom opted in per view test; no Playwright, no browser mode.

## Decisions worth remembering

- One `@codemirror/state` copy: the catalog floor was lowered to what pnpm's minimum release
  age resolves (`^6.7.2`) instead of adding an exclusion; two copies would break facet identity.
- Parentheses and brackets match through `closedBy`/`openedBy` on `OpenParen`/`CloseParen`
  and `OpenBracket`/`CloseBracket`: CodeMirror's text fallback only pairs characters whose
  tree nodes share one type, and ours are distinct by design.
- `Repetir … Mientras Que` folds but is not a matching pair and does not dedent; marking
  `Mientras` as a closer would break every ordinary `Mientras` loop.
- `IfBranch` is flattened into `IfStmt` (openers and closers must be siblings for the
  matcher); `SwitchCase` stays a node for case-body indentation.
- `scopeAt` picks the narrowest containing body scope, not the first in build order, so a
  misplaced subprogram inside another resolves to the inner one.
- Go to definition and hover both ignore recovery symbols (an undeclared name is not a
  definition); F12 returns `false` there so the key is not swallowed.
- Constants complete as `type: 'constant'`; a zero-parameter callable applies `Name()` with
  the cursor after the parentheses. Both recorded in spec §12.
- The bundle test polls microtasks after `forceLinting` rather than waiting on timers.
- `noTemplateCurlyInString` is switched off for the two snippet files in `biome.json`
  (CodeMirror snippet syntax in plain strings).

## Next: sub-project 4 (editor shell)

- The editor embeds `stepcode({ profile })` inside a `Compartment` for profile switching, adds
  its own highlight style, line numbers, history, and the lint gutter, and installs `debug()`.
- The worker owns the run: it dispatches `setCurrentLine.of(line)` from every `paused`
  `StepResult`, reads `breakpointLines(state)` from an `updateListener` gated by
  `breakpointsChanged(update)` and forwards them as `setBreakpoints`, and shows
  `stepcodeDiagnostics(state, options)` in a Problems panel without a second compile.
- `treeDataAt(state)` exposes the checker's scopes and symbols for a Variables panel that
  wants static types alongside the runtime frames.
- Delete `packageName` from the barrel once `packages/editor/src/App.tsx` stops importing it
  as the workspace-resolution stub (spec §12 records the exception).

## Open items

- Deferred minors from the final review (triaged "stays deferred"): a comment as the last
  non-blank line inside an unclosed block still indents to 0; the case-line `indentOnInput`
  trigger can fire inside a string containing `:`; a wrapped parameter list whose `)` sits on
  a later line loses it in the signature header; `activeArgument` reads commas from the
  document while the header comes from the compile source; punctuation names are spelled in
  three lists (`LEAF_NAMES`, `PUNCT_MATCHING_PAIRS`, the `PUNCT` character map); only some
  theme rules have light/dark variants; a zero-width diagnostic on an empty interior line stays
  zero-width; `blockTemplates` falls back to raw key names for a profile missing a spelling;
  a `LineMap` is built per hover; a variable of unknown type shows `?` in completion details.
- Language-package items found while probing, not this package's: W3002 ("never read") fires
  alongside E3001 when a variable's only use is a misspelling; a misplaced subprogram declared
  with a parameter list fails to parse its parameters (E2005/E2002/E2021).
- `pnpm lint` reports pre-existing `noNonNullAssertion` warnings in the language package's
  tests (exit code 0); untouched here.
- User-owned, carried from the previous handoff: add `NPM_TOKEN` repo secret; confirm
  ownership of the `stepcode` npm org; remove `RolandoAndrade/v2` from `ci.yml` triggers
  after the merge to `master`.

## Process notes

- Subagent-driven development, 12 tasks; fix rounds on Tasks 1, 5, 6, 7, 10, 12 and one final
  fix wave. Ledger and briefs lived in `.superpowers/sdd/2026-09-04-codemirror/` (deleted at
  close; git history is the record).
- Parallel implementers on disjoint files worked (Tasks 2+11, 4+5+6, 8+9+10); the one cost was
  commit interleaving, handled by building review packages by path.
