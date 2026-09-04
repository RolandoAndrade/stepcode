# stepcode

The StepCode language: a PSeInt-compatible pseudocode that speaks whatever words a profile
gives it. This package covers the front end — source to tokens to AST, with diagnostics.
The checker, `compile()` and the steppable interpreter are here too.

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
| `start(program, { profile, io, random?, limits? })` | a `Run`: `step`, `stepOver`, `stepOut`, `continue({ budget })`, `input`, `setBreakpoints`, `inspect` |
| `runProgram(program, { profile, io, signal?, sleep?, budget? })` | `Promise<{ kind: 'done' \| 'error' \| 'aborted' }>` — the controller driven to the end |
| `renderValue(value, type, profile)` | `Escribir`'s rendering of one value: `2`, `2.5`, `Verdadero`, `hola` |

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
checker warnings, `E4001`–`E4008` runtime: index out of range, division by zero, a value read
before it was assigned, an input that does not parse, stack depth, a function ending without a
result, a builtin argument outside its domain, and a `Para` step of zero.

## Running

`start(program, options)` turns a clean `CompileResult` into a `Run` that executes one
statement per `step()`. Every statement is a pause point, loops pause on their own line before
every test, and a user call opens a frame the controller drives itself — so breakpoints,
stepping, `inspect()` and input are one mechanism, with no promise inside the evaluator:

```ts
import { compile, start } from 'stepcode'
import { profiles } from '@stepcode/profiles'

const program = compile(source, { profile: profiles.es })
const run = start(program, { profile: profiles.es, io: { write: (text) => process.stdout.write(text) } })
run.setBreakpoints([12])
let result = run.continue()
while (result.kind !== 'done' && result.kind !== 'error') {
  if (result.kind === 'input') run.input(await ask(result.target?.name ?? 'key'))
  else if (result.kind === 'wait') await new Promise((r) => setTimeout(r, result.millis))
  else console.log(result.reason, result.line, result.frames[0]?.variables)
  result = run.continue()
}
```

A `StepResult` is `paused` (before the statement at `line`, with `reason` `step`, `breakpoint`
or `budget` and the frames innermost first), `input` (a `Leer` target with its name and static
type, or `null` for `Esperar Tecla`; `rejected` carries the E4004 of a text that did not parse),
`wait` (an `Esperar`), `done` or `error` (the diagnostic and the frames at the failure, which
`inspect()` keeps returning).

`runProgram(program, options)` drives that loop for you: `io.read(request)` answers input
requests, `sleep` handles `Esperar`, `budget` (default 10 000 statements) is how often it
yields to the event loop, and `signal` — any `{ aborted }` object, an `AbortSignal` included —
returns `{ kind: 'aborted' }`. Pass a seeded `random` and the same inputs and a run is
reproducible to the byte.

Values are what JavaScript gives: `Entero` and `Real` are numbers (`4 / 2` prints `2`,
`7 / 2` prints `3.5`, `Redondear(-1.5)` is `-2`), text is a string, `Logico` a boolean
rendered as the profile's `Verdadero` / `Falso`, arrays one flat buffer shared by reference.
Unassigned is unassigned: reading it is E4003, not `0`.

See `docs/superpowers/specs/2026-09-03-language-syntax-design.md` for the full grammar,
precedence table and recovery rules, and
`docs/superpowers/specs/2026-09-04-language-checker-design.md` for the checker's rules.
