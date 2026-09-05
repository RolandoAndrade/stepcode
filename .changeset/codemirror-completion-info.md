---
'@stepcode/codemirror': patch
---

Completion descriptions and statement snippets: every keyword, type and builtin completion now
carries a one-sentence description as `info`, written for a beginner in the locale's language,
and the hover tooltip shows the same sentence under the signature. Ten more keywords —
`define`, `dimension`, `write`, `writeNoNewline`, `read`, `return`, `break`, `continue`, `else`
and `elseIf` — apply a statement snippet, spelled per profile and terminated only where the
profile requires semicolons.
