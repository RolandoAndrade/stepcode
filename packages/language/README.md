# stepcode

The StepCode language: a PSeInt-compatible pseudocode that speaks whatever words a profile
gives it. This package covers the front end — source to tokens to AST, with diagnostics.
The checker and `compile()` are here too; the interpreter arrives in the next release.

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
| `compile(source, { profile })` | `{ ast, diagnostics }` — parse and check in one call |
| `check(program, { profile })` | `{ diagnostics, types, symbols, calls, scopes }` |
| `typeToString(type, profile)` | `Entero`, `Entero[]`, `Entero[,]` |
| `BINARY_TABLE`, `UNARY_TABLE`, `BUILTIN_SIGNATURES` | the operator and builtin tables |
| `assignable(target, source, node?)` | the assignability rule, on its own |
| `fold(expr, constants)` | constant folding, on its own |

Diagnostic ranges: `E1xxx` lexer, `E2001`–`E2019` statements, `E2020`–`E2029` declarations and
headers, `E2030`–`E2039` expressions, `W2xxx` warnings.

## Checking

`compile(source, { profile })` parses **and** checks, always both, so an editor gets the
parser's and the checker's diagnostics at once, sorted by position:

```ts
import { compile, formatDiagnostic } from 'stepcode'
import { profiles } from '@stepcode/profiles'

const { ast, diagnostics } = compile(
  'Proceso p\n  Definir n Como Entero;\n  n <- 7 / 2;\n  Escribir n;\nFinProceso',
  { profile: profiles.es },
)

for (const diagnostic of diagnostics) {
  console.log(diagnostic.code, formatDiagnostic(diagnostic, 'es', profiles.es))
}
// E3010 No se puede guardar un Real donde se espera un Entero: «DIV» da la división entera.
```

`check(program, { profile })` is the same check over a tree you already have. It returns the
side tables the interpreter and the editor read instead of re-deriving anything — only the
checker knows types:

| Table | Holds |
| --- | --- |
| `types` | `WeakMap<Expr, Type>` — every expression node of every checked body |
| `symbols` | `WeakMap<Identifier, Symbol>` — every resolved, non-missing name |
| `calls` | `WeakMap<Call, SubprogramDecl>` — every resolved user call |
| `scopes` | the program scope, then one body scope per main, extra main and subprogram |

What the checker enforces, in one page:

- **Types.** `Entero` widens to `Real`, never the reverse; `Caracter` widens to `Cadena`, and a
  one-character string literal fits a `Caracter`. `/` and `^` always give `Real`; `DIV` and
  `MOD` take and give `Entero`. Indexing a `Cadena` gives a read-only `Caracter`.
- **Names.** Subprograms are hoisted; variables are not — using one above its `Definir` is an
  error. An unknown name suggests the nearest declared one. With `implicitDeclarations`, the
  first assignment declares; reading or `Leer` of an unknown name is still an error.
- **Conditions** must be `Logico` in every profile: `Si a MOD 2` asks you to compare.
- **Untyped parameters** (`typedParameters: false`) are fixed by the first checked call, and a
  later call that does not fit points back at the call that fixed them.
- **Warnings**: unreachable code, declared but never read, read but never assigned, and a
  function result that never receives a value.

Diagnostic ranges: `E1xxx` lexer, `E2xxx` parser, `E3001`–`E3037` checker, `W3001`–`W3004`
checker warnings. Bounds, division by a non-constant zero, input parsing and stack depth are
runtime (`E4xxx`), not this package's business yet.

See `docs/superpowers/specs/2026-09-03-language-syntax-design.md` for the full grammar,
precedence table and recovery rules, and
`docs/superpowers/specs/2026-09-04-language-checker-design.md` for the checker's rules.
