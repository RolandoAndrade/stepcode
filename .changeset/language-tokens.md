---
'stepcode': patch
---

`compile` now returns the parser's `tokens` alongside the AST, so an editor can attach every
token to a syntax-tree node without re-lexing.
