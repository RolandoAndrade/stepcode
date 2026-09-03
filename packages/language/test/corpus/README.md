# Conformance corpus

`v1/` holds the StepCode v1 (0.12.0) test files verbatim, renamed from `*.test.ts` to
`*.v1.ts` so Vitest ignores them. They import v1 modules that no longer exist and are not
meant to run; they are the source material for the v2 conformance corpus, which the language
sub-projects build up here as `(program, inputs, profile) → outputs / diagnostics` cases.

Do not edit `v1/`. Delete it once every program it contains has a v2 equivalent.
