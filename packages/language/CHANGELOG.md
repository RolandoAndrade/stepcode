# stepcode

## 2.0.0

### Minor Changes

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`524ea29`](https://github.com/RolandoAndrade/stepcode/commit/524ea299ba8bdc168f451dfd34e42e3e96045649) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - The checker: scopes and symbols, a type model with assignability and constant folding, the
  operator and builtin tables, per-statement rules, flow warnings, and `compile(source, {
  profile })`, which parses and checks in one call. Diagnostics gain E3001–E3037 and
  W3001–W3004 in Spanish and English, and `check` returns the type, symbol, call and scope
  tables the interpreter and the editor read.
  
  The test corpus grows too: `test/corpus/guides/` adds 52 clean programs written from the
  course guides plus 32 one-mistake error programs, and three v1 corpus programs are withdrawn
  (see `test/corpus/programs/README.md`).

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`79036ee`](https://github.com/RolandoAndrade/stepcode/commit/79036eee29b2779b35fd668c1ddd15424c6c2bee) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - The interpreter: `start(program, options)` returns a resumable `Run` that executes one
  statement per step, with breakpoints, `stepOver` / `stepOut`, a statement budget, frame
  inspection and input as step results; `runProgram(program, options)` drives it to the end
  with async input, sleep and an `AbortSignal`. Runtime errors are E4001–E4008 in Spanish and
  English. `compile` now returns the checker's side tables and the source, and the corpus
  programs gain `.run.json` sidecars pinning their output for given inputs.

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`46a7a81`](https://github.com/RolandoAndrade/stepcode/commit/46a7a81fe4fa8e5d973e70df50783b945bbea9da) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - Lexer, parser and AST: profile-driven tokenizer with multi-word longest match, Pratt
  expression parser, the full statement grammar, error recovery that keeps the tree intact, and
  data-only diagnostics with Spanish and English catalogs.

### Patch Changes

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`e0c656e`](https://github.com/RolandoAndrade/stepcode/commit/e0c656e86398eff5ca2c311dad55abd947942ca3) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - `Run.inspect()` returns main's final frame after `done` instead of an empty list, so hosts can show final variable values.

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`4e9b903`](https://github.com/RolandoAndrade/stepcode/commit/4e9b903dbf7852dc3f5b4c3f0dfb013dd496e52b) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - Add diagnostic code `E4009` (internal runtime failure), for hosts that need to report a
  runtime defect through the same `Diagnostic` shape as any other error.

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`a58b962`](https://github.com/RolandoAndrade/stepcode/commit/a58b9626e6de88380d8056f0c5811078db667a5d) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - `compile` now returns the parser's `tokens` alongside the AST, so an editor can attach every
  token to a syntax-tree node without re-lexing.
- Updated dependencies [[`0c4e77e`](https://github.com/RolandoAndrade/stepcode/commit/0c4e77e8a60f1fdc08c7fd61cfd5caefd2caad35), [`be86d41`](https://github.com/RolandoAndrade/stepcode/commit/be86d41646b3397bb02a6bd25f03f5f5f40580ac)]:
  - @stepcode/profiles@2.0.0
