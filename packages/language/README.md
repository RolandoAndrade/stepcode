# stepcode

The StepCode language: a PSeInt-compatible pseudocode that speaks whatever words a profile
gives it. This package covers the front end — source to tokens to AST, with diagnostics.
The checker, the interpreter and `compile()` arrive in later releases.

```ts
import { parse, formatDiagnostic, walk } from 'stepcode'
import { profiles } from '@stepcode/profiles'

const { program, tokens, diagnostics } = parse(
  'Proceso saluda\n  Escribir "hola";\nFinProceso',
  { profile: profiles.es },
)

for (const diagnostic of diagnostics) {
  console.log(diagnostic.code, formatDiagnostic(diagnostic, 'es', profiles.es))
}

walk(program, { enter: (node) => void console.log(node.kind) })
```

## What it guarantees

- **It never throws.** Any input returns a `Program`; broken regions become `ErrorStmt` and
  `ErrorExpr` nodes with real spans, so an editor always has a tree to work with.
- **Diagnostics are data**: `{ code, severity, span, data, related? }`. Message text lives in
  locale catalogs and is produced by `formatDiagnostic(diagnostic, locale, profile)`, which
  fills the active profile's own spellings into the message. Locales fall back
  `pt-BR → pt → en`; `registerCatalog(locale, catalog)` adds or overrides one.
- **The token stream is lossless**: `tokens.map((t) => t.text).join('') === source`, trivia
  and all, so formatters and editors can round-trip it.
- **It is deterministic**: the same `(source, profile)` always gives the same tokens, AST and
  diagnostics.
- **Every option comes from the profile** — `requireSemicolons`, `assignWithEquals`,
  `typedParameters`, `caseSensitive`. `parse` takes no options of its own.

## API

| Export | What it does |
| --- | --- |
| `parse(source, { profile })` | `{ program, tokens, diagnostics }` |
| `tokenize(source, profile)` | `{ tokens, diagnostics }` |
| `walk(node, visitor)` | depth-first traversal; `enter` returning `false` skips children |
| `childrenOf(node)` | one node's children in source order |
| `formatDiagnostic(d, locale, profile)` | the rendered message |
| `registerCatalog(locale, catalog)` | add or override a locale's templates |
| `LineMap` | offset ↔ 1-based line/column |
| `DIAGNOSTIC_CODES`, `DIAGNOSTIC_SEVERITY` | the catalogue and its fixed severities |

Diagnostic ranges: `E1xxx` lexer, `E2001`–`E2019` statements, `E2020`–`E2029` declarations and
headers, `E2030`–`E2039` expressions, `W2xxx` warnings.

See `docs/superpowers/specs/2026-09-03-language-syntax-design.md` for the full grammar,
precedence table and recovery rules.
