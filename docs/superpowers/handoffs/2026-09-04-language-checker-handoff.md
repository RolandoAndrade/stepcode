# Handoff — 2026-09-04 — StepCode v2, after sub-project 3b

## Where things stand

Branch `RolandoAndrade/v2` (worktree `~/orca/workspaces/stepcode/v2`, main checkout
`~/projects/stepcode`). `master` still holds v0.12.0 and the deployed editor; nothing merges
until v2 reaches parity.

| Sub-project | Status | Spec / plan |
|---|---|---|
| 1. Monorepo skeleton | done | `specs/2026-09-03-stepcode-v2-design.md` (umbrella), `plans/2026-09-03-monorepo-skeleton.md` |
| 2. `@stepcode/profiles` | done | `specs/2026-09-03-profiles-design.md`, `plans/2026-09-03-profiles.md` |
| 3a. Language: lexer + parser + AST | done | `specs/2026-09-03-language-syntax-design.md`, `plans/2026-09-03-language-syntax.md` |
| 3b. Language: checker + diagnostics | **done today** | `specs/2026-09-04-language-checker-design.md`, `plans/2026-09-04-language-checker.md` |
| 3c. Language: interpreter + run controller | next | not started |
| 4. Editor shell | can start any time (stub runtime) | umbrella §4 |
| 5. `@stepcode/codemirror` | after 3a | umbrella §3.5 |
| 6. `@stepcode/textmate` | any time | — |
| 7. Release 2.0.0 | last | umbrella §7 |

Head: see the last commit on the branch (`git log -1`); `pnpm lint`, `pnpm typecheck`, `pnpm build`,
`pnpm test` clean (Biome warnings are the pre-existing `!` assertions in tests). Language package:
35 test files.

## What 3b delivered

`packages/language` (npm `stepcode`, changeset `minor` pending):

- `types/` Type model (`scalar | array{element, rank} | unknown`), `assignable`/`assignFailure`
  with hint variants, the operator table, `fold` (constant folding), the builtin table
  (`BUILTIN_SIGNATURES`, 22 rows). `unknown` absorbs: assignable both ways, every operator
  accepts it, nothing is ever reported on it.
- `checker/` scopes and symbols (`Scope.order` for determinism, `recovered` and `counting`
  flags, reads/writes counters), expression typing, per-statement rules, a two-phase driver
  (collect signatures, then check main and bodies on demand, memoized, so untyped parameters
  under `typedParameters: false` are fixed by the first checked call), flow warnings, near-miss
  suggestions (Damerau-Levenshtein ≤ 2 after folding).
- Public API: `check(program, { profile }) → { diagnostics, types, symbols, calls, scopes }`
  and `compile(source, { profile }) → { ast, diagnostics }`. The side tables are `WeakMap`s
  keyed by node; every `Expr` has a type, every non-missing identifier a symbol, every user
  call its declaration. `sortDiagnostics` orders by span, severity, code and dedups by
  code+span.
- Codes E3001–E3037 (E3018/E3019 unused) and W3001–W3004, es and en catalogs with hint
  variants; a new `{builtin:key}` slot; parser E2002 gained a `builtin` variant.
- Tests: one test per table row; by-code suite asserting its case list equals
  `DIAGNOSTIC_CODES`, with clean neighbours; side-table invariant over the corpus; one-mistake
  mutation property (five mutation families, floors per family, warnings included); the v1
  corpus (138 programs) checks clean under `profiles.es` after 49 minimal rewrites documented
  in `test/corpus/programs/README.md`, with 3 v1-only programs withdrawn and their rejection
  pinned by code; a guide-derived corpus `test/corpus/guides/` (52 clean programs, zero
  diagnostics) and `guides/errors/` (32 one-mistake programs with `// expect:` headers).

## Decisions worth remembering

- Corpus contract: every program checks with zero errors under the strict default profile;
  rewrites are minimal and never change what a program prints. Withdrawn: `test-length`
  (Longitud of an array), `test-basic-mod-operation-2` (MOD of Reals),
  `insert-into-array-procedure` (prints unassigned slots).
- One mistake, one diagnostic is enforced end to end: recovery symbols for unknown names,
  pending-declaration map for E3003 (use above its later `Definir`, with `related`), a failed
  use counts as a read, a write above the declaration counts as a write, `Constante` value
  errors suppress E3024.
- `Para` counters: strict mode requires a declared `Entero` variable (constant → E3007,
  subprogram → E3005, parameter or result → E3026 `kind`); the loop counts as a read and a
  write; assignment, `Leer`, or passing `Por Referencia` inside the loop is E3008.
- Type words in messages are pre-rendered with the check-time profile, so an `es`-profile
  diagnostic formatted in `en` still says `Entero`.
- Function result variable is declared by the header; a body `Definir` of it is E3002.
- `/` and `^` always yield Real; `DIV`/`MOD` are Entero-only; a one-character string literal
  fits a `Caracter`, a `Cadena` variable never does; `s[i]` is a read-only `Caracter`.

## Next: sub-spec C (interpreter + run controller)

Inputs for the brainstorm:

- `compile()` currently returns `{ ast, diagnostics }` per spec §2; the interpreter and the
  editor will need the side tables too. Decide whether `compile` returns `CheckResult` as well
  (recommended) instead of re-running `check`.
- Runtime policy left to C: bounds and negative indices under `indexBase`, division by a
  non-constant zero, input parsing by target type, stack depth, printing of unassigned array
  slots, string comparison semantics for `Caracter` vs `Cadena`.
- The interpreter trusts `types`/`symbols`/`calls`; it reads builtin arity and result from
  `BUILTIN_SIGNATURES` and implements only bodies.
- The guide corpus and the v1 corpus need inputs and expected outputs; v1 expectations live
  in `test/corpus/v1/*.v1.ts`.

## Open items

- User-owned: add `NPM_TOKEN` repo secret; confirm ownership of the `stepcode` npm org.
- Known cosmetic edge: `Escribir f()` where `f` is declared with an array return type renders
  E3009 with an empty name on the direct `checkWrite`/`resolveWriteTarget`/`typeOfIndex` paths;
  array-returning functions are not a shape the spec addresses. Fix alongside sub-spec C.
- Deferred minors from the final review (all non-blocking): `fixedBy` related span repeated on
  every failing argument; the E3024 gate suppresses on any diagnostic inside the value;
  side-tables test collects during file load.
- Remove `RolandoAndrade/v2` from `ci.yml` triggers after the merge to master.

## Process notes

- Subagent-driven development with parallel implementers on disjoint files worked; the
  conflicts were all on shared test files, solved by sequencing (tasks 7→8→9) and by giving
  side tasks their own directories. Reviews caught real defects at every level; the final
  whole-branch review on Opus found two Critical ones the per-task reviews had let through.
- Ledger in `.superpowers/sdd/2026-09-04-language-checker/progress.md` (git-ignored), deleted
  after the final review.
