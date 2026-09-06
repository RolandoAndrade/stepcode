# @stepcode/codemirror

## 2.0.0

### Minor Changes

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`a58b962`](https://github.com/RolandoAndrade/stepcode/commit/a58b9626e6de88380d8056f0c5811078db667a5d) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - First release: CodeMirror 6 language support built on the `stepcode` parser and checker
  (highlighting, lint, folding, indentation, block matching, completion with block snippets,
  signature help, hover, go to definition) and runtime-free debug extensions (breakpoint gutter,
  current-line marker), with `es`/`en` strings.

### Patch Changes

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`1f43f2f`](https://github.com/RolandoAndrade/stepcode/commit/1f43f2f64f545203322c0678b616c9b7eedd3e18) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - Typing `<-` inserts `←` when the profile accepts it: a new `arrowInput(profile)` extension,
  included by `stepcode()` unless `arrow: false`. It declines inside strings and comments, and
  under a profile that assigns with `=` or that does not spell the arrow.

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`1dc7d5a`](https://github.com/RolandoAndrade/stepcode/commit/1dc7d5a0524e14196c9e852eef2d66d6c61ad717) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - `stepcode()` accepts `completion: false` to omit the autocompletion extension.

- [#1](https://github.com/RolandoAndrade/stepcode/pull/1) [`75c75a7`](https://github.com/RolandoAndrade/stepcode/commit/75c75a7662a88e42a14bd294c2c029e409538188) Thanks [@RolandoAndrade](https://github.com/RolandoAndrade)! - Completion descriptions and statement snippets: every keyword, type and builtin completion now
  carries a one-sentence description as `info`, written for a beginner in the locale's language,
  and the hover tooltip shows the same sentence under the signature. Ten more keywords —
  `define`, `dimension`, `write`, `writeNoNewline`, `read`, `return`, `break`, `continue`, `else`
  and `elseIf` — apply a statement snippet, spelled per profile and terminated only where the
  profile requires semicolons.
- Updated dependencies [[`524ea29`](https://github.com/RolandoAndrade/stepcode/commit/524ea299ba8bdc168f451dfd34e42e3e96045649), [`e0c656e`](https://github.com/RolandoAndrade/stepcode/commit/e0c656e86398eff5ca2c311dad55abd947942ca3), [`4e9b903`](https://github.com/RolandoAndrade/stepcode/commit/4e9b903dbf7852dc3f5b4c3f0dfb013dd496e52b), [`79036ee`](https://github.com/RolandoAndrade/stepcode/commit/79036eee29b2779b35fd668c1ddd15424c6c2bee), [`46a7a81`](https://github.com/RolandoAndrade/stepcode/commit/46a7a81fe4fa8e5d973e70df50783b945bbea9da), [`a58b962`](https://github.com/RolandoAndrade/stepcode/commit/a58b9626e6de88380d8056f0c5811078db667a5d), [`0c4e77e`](https://github.com/RolandoAndrade/stepcode/commit/0c4e77e8a60f1fdc08c7fd61cfd5caefd2caad35), [`be86d41`](https://github.com/RolandoAndrade/stepcode/commit/be86d41646b3397bb02a6bd25f03f5f5f40580ac)]:
  - stepcode@2.0.0
  - @stepcode/profiles@2.0.0
