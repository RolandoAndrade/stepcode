# StepCode v2 — language sub-spec B: checker and diagnostics

Parent: [umbrella design](./2026-09-03-stepcode-v2-design.md) §2, §3.3, §3.4, §6, §7 item 3.
Previous: [sub-spec A](./2026-09-03-language-syntax-design.md) lexer, parser, AST.
Next: sub-spec C interpreter and run controller.

## 1. Scope

This sub-spec delivers `check(program, { profile })` and `compile(source, { profile })` inside
`packages/language`: scopes, symbols, types, flow checks, the E3xxx/W3xxx diagnostics, and the
side tables the interpreter and the editor read. It does not execute anything: bounds,
division by a non-constant zero, input parsing, and stack depth remain runtime (E4xxx).

Decisions taken during the brainstorm (2026-09-04):

| Topic | Decision |
|---|---|
| Corpus | Every corpus program checks clean under the default profile. Programs that rely on leniency are rewritten, minimally, and each rewrite is listed in the corpus README. |
| Function result variable | Declared by the header, with the header's type. A `Definir` of the same name in the body is E3002 with a hint to remove it. |
| Numbers | `Entero` widens to `Real`, never the reverse. `/` and `^` always yield `Real`; `DIV` and `MOD` take and yield `Entero`. |
| Characters | `Cadena` is a sequence of `Caracter`. Indexing a `Cadena` yields a `Caracter`, read-only. A one-character string literal fits a `Caracter`; a `Cadena` variable never does. `Caracter` widens to `Cadena`. |
| Conditions | Must be `Logico` in both modes. `Si a MOD 2` is an error with a hint. |
| Implicit declarations (`implicitDeclarations: true`) | First assignment or `Para` declares, in the enclosing body scope, type fixed from that expression. Reading or `Leer` of an unknown name is an error. |
| `Para` counters | Strict: must be declared `Entero`. Pseint: implicitly `Entero`. Read-only inside the loop. |
| `Subcadena` | Positions `ini..fin` inclusive, following `indexBase`. Bounds are runtime. |
| `Segun` labels | Constant expressions folded at check time; duplicates are errors; selector `Entero`, `Caracter`, or `Cadena`. |
| Array parameters | Bracket types with rank; sizes are runtime. `Dimension` turns a declared scalar or unsized array into an array of that rank, once. |
| Warnings | Unreachable code, declared but never read, read but never assigned, function result never assigned. |
| Architecture | Two phases: collect signatures, then check bodies on demand from main, memoized, so untyped parameters are fixed at the first checked call. |

Out of scope: bounds and negative indices (runtime policy in sub-spec C), `Esperar` unit
words beyond what the parser accepts, flow-sensitive definite assignment, records or
user-defined types.

## 2. Layout and public surface

```
packages/language/src/
  types/
    type.ts          Type model, typeToString, sameType
    assign.ts        assignability and the hint chooser
    operators.ts     operator table (§4.3)
    builtins.ts      builtin table (§6)
    fold.ts          constant folding (§4.6)
  checker/
    scope.ts         Scope, Symbol, declaration and lookup
    driver.ts        check(): phase one, phase two, memoized bodies
    expressions.ts   typeOf(expr)
    statements.ts    per-statement rules
    flow.ts          warnings W3001–W3004
    suggest.ts       near-miss name suggestion
    result.ts        CheckResult and the side tables
  compile.ts         parse + check
  diagnostics/       codes, es, en gain the new entries
```

Public API added to `index.ts`:

```ts
check(program: Program, options: { profile: ResolvedProfile }): CheckResult
compile(source: string, options: { profile: ResolvedProfile }): CompileResult

interface CheckResult {
  diagnostics: Diagnostic[]                 // sorted (§7)
  types: WeakMap<Expr, Type>                // every expression node
  symbols: WeakMap<Identifier, Symbol>      // every resolved, non-missing identifier
  calls: WeakMap<Call, SubprogramDecl>      // every resolved user call
  scopes: readonly Scope[]                  // program scope first, then one per body
}

interface CompileResult { ast: Program; diagnostics: Diagnostic[] }
```

`compile` parses, then always checks, even when the parser reported errors: the editor wants
both kinds of diagnostic at once. The checker never emits on a node the parser already
flagged: recovery placeholders and `missing` identifiers are typed `unknown` and stay
silent. The interpreter (sub-spec C) and the editor read `types`, `symbols`, and `calls`
instead of re-deriving anything, per the umbrella rule that only the checker knows types.

Also exported: `Type`, `Symbol`, `Scope`, the operator and builtin tables, `typeToString`.

## 3. Scopes and symbols

### 3.1 Scopes

Two kinds, no block scopes:

- **Program scope**: subprogram names only. Subprograms are hoisted: a call may precede the
  declaration, recursion is allowed. A second subprogram with the same name is E3002 on the
  second, with a `related` span on the first. Builtin names never reach this scope because
  the lexer reserves them.
- **Body scope**: one for main, one per subprogram, one per `Program.extraMains` entry. Holds
  parameters, the function result variable, `Definir`, `Dimension`, `Constante`, `Para`
  counters, and (pseint) implicit variables. A subprogram cannot see main's variables. A
  misplaced nested subprogram (`SubprogramDecl.misplaced`) is checked once, from
  `Program.subprograms`, and skipped when met as a statement.

### 3.2 Symbols

```ts
interface Symbol {
  name: string                // canonical (case-folded unless caseSensitive)
  kind: 'variable' | 'parameter' | 'result' | 'constant' | 'counter' | 'subprogram'
  type: Type                  // 'unknown' until fixed (§5.12)
  declaredAt: Node            // Identifier of the declaration, or the header
  scope: Scope
  byRef?: boolean             // parameters
  constValue?: ConstValue     // constants
  dimensioned?: boolean       // arrays: sized shorthand or Dimension seen
  reads: number; writes: number   // for W3002 / W3003
}
```

Rules:

- A name used textually before its declaration in the same scope is E3003 (used before
  declaration), `related` pointing at the declaration. Source order only; flow is ignored.
- Redeclaration in the same scope is E3002: `Definir` twice, `Definir` of a parameter, of the
  result variable, of a `Para` counter already declared, `Constante` then `Definir`, and so
  on. Second site gets the error, first is `related`. E3002 carries hint variants:
  `result` ("remove this Definir, the header declares it") and `parameter`.
- A variable named like a subprogram is E3004; a subprogram used as a variable is E3005; a
  variable called like a subprogram is E3006.
- Unknown name: E3001 (`not declared`). When a symbol visible from the scope, or a
  subprogram, is within Damerau-Levenshtein distance 2 after accent and case folding, the
  `suggest` variant names it (`data.suggestion`). Recovery: the identifier resolves to a
  fresh `unknown` symbol so later uses of the same name in the scope do not repeat E3001.
- `Constante`: read-only. Assigning (E3007), `Leer` (E3007), or passing `Por Referencia`
  (E3032) is an error. The value must fold (§4.6) or E3024. Its type is the folded value's
  type, or the declared `Como` type when present, which the value must fit.
- `Para` counter: see §5.9. Assigning or `Leer` into it inside its loop is E3008.
- Pseint mode (`implicitDeclarations: true`): an assignment to an unknown scalar name declares
  a `variable` in the current body scope with the value's type (`unknown` value gives an
  `unknown` variable, no further error). A `Para` with an unknown counter declares a
  `counter` of type `Entero`. Reads, `Leer`, index access, and by-reference arguments of an
  unknown name remain E3001 with the hint `declare` naming `{kw:define}`.
- A `missing` identifier is never declared or resolved and produces nothing.

## 4. Types

### 4.1 Type model

```ts
type Type =
  | { kind: 'scalar'; name: TypeKey }                  // integer real string char boolean
  | { kind: 'array'; element: TypeKey; rank: number }  // rank ≥ 1, sizes are runtime
  | { kind: 'unknown' }
```

`unknown` absorbs: it is assignable to and from everything, every operator accepts it and
yields `unknown`, and nothing is ever reported on an `unknown` operand. It comes from
recovery placeholders, unresolved names, untyped parameters of never-called subprograms, and
any expression that already produced a diagnostic. Procedures have no type: a procedure call
in expression position is E3020 and types `unknown`.

Messages render types through `{type:key}` for scalars and `Entero[]` / `Entero[,]` style
for arrays, using the profile's first spelling.

### 4.2 Assignability

`assignable(target, source)`, target on the left:

| Target | Accepts |
|---|---|
| any | same type, `unknown` |
| `Real` | `Entero` |
| `Cadena` | `Caracter` |
| `Caracter` | a string `Literal` node whose value has exactly one character (the literal node itself, never a `Cadena` variable or expression) |
| array | array with same element type and rank |

Everything else is E3010 (`cannot assign`) with a hint chosen by the pair:

| Pair (target ← source) | Hint variant |
|---|---|
| `Entero` ← `Real` | `trunc` (mentions `{builtin:trunc}` and `{builtin:round}`; when the source is a `/` node, `div` instead, mentioning `{kw:div}`) |
| `Caracter` ← `Cadena` | `index` |
| `Caracter` ← longer literal | E3011 (literal has N characters) |
| numeric ← text | `toNumber` |
| `Cadena` ← numeric or `Logico` | `toText` |
| array ← array, rank differs | `rank` (data: expected, found) |
| array ← array, element differs | `element` |
| scalar ← array, array ← scalar | E3009 (`is an array` / `not an array`) |

A whole array is never a value in an expression; it may only be an argument to an array
parameter (§5.11) or an `Escribir` error E3009.

### 4.3 Operators

One row per operator and operand class. `numeric` is `Entero` or `Real`; `text` is
`Cadena` or `Caracter`.

| Operator | Operands | Result |
|---|---|---|
| `+ - *` | numeric, numeric | `Entero` if both `Entero`, else `Real` |
| `+` | text, text | `Cadena` |
| `/` `^` | numeric, numeric | `Real` |
| `DIV` `MOD` | `Entero`, `Entero` | `Entero` |
| unary `-` | numeric | same |
| `NO` | `Logico` | `Logico` |
| `Y` `O` | `Logico`, `Logico` | `Logico` |
| `=` `<>` | comparable (§4.4) | `Logico` |
| `< <= > >=` | numeric with numeric, or text with text | `Logico` |

Operand mismatch is E3012 (`data.op`, expected, found, position `left`/`right`). Hints:
`DIV` with a `Real` operand → `divide` ("use `/`"); `MOD` with `Real` → `trunc`; `+` on text
and number → `toText`. A constant-zero right operand of `/`, `DIV`, `MOD` is E3025.

### 4.4 Comparability

Two scalars are comparable for `=` and `<>` when either is assignable to the other
(§4.2), so `Caracter = 'M'`, `Entero = Real`, `Cadena = Caracter` all pass. Ordering
operators additionally require both numeric or both text. `Logico` is only comparable
with `Logico`. Mismatch is E3012.

### 4.5 Indexing

`Index.target` must type to an array or a `Cadena`:

- Array: the number of indices must equal the rank (E3016: expected, found); each index
  must be `Entero` or `unknown` (E3017: found); the result is the element scalar type.
- `Cadena`: exactly one `Entero` index (E3016 / E3017 as above); the result is `Caracter`
  and the expression is read-only (§5.4, E3013). A `Caracter` target is not indexable.
- Anything else is E3009 variant `scalar` (`not an array`); the result is `unknown`.

Indices are typed and recorded even when the target fails, so one bad target yields one
diagnostic. Negative and out-of-range values are runtime (sub-spec C).

### 4.6 Constant folding

`fold(expr): ConstValue | undefined` over literals, `Constante` symbols, unary minus, `NO`,
and the arithmetic, text, comparison, and logical operators from §4.3 applied to folded
operands. `ConstValue` is `{ type: TypeKey, value: number | string | boolean }`. Folding
follows the same result-type rules (`4 / 2` folds to `Real` 2). Used only for `Segun`
labels (§5.8), array sizes (§5.1, §5.2), `Constante` values (§3.2), the zero checks (E3025,
E3027), and nowhere else. Builtins never fold.

## 5. Statements

### 5.1 Definir

Each name declares a `variable`. `TypeRef.dimensions` `[]` gives a scalar; `[null, …]` an
unsized array of that rank; sized dimensions fold to positive `Entero` constants (else
E3023, or `unknown` silently) and mark the array `dimensioned`. Names are checked for
redeclaration (E3002) and subprogram clash (E3004).

### 5.2 Dimension

Each item names a symbol declared earlier in the same scope, else E3021 (`dimension of
undeclared`; pseint mode does not declare here). The symbol must be a `variable` that is a
scalar or an unsized array of the same rank, else: already dimensioned E3022, parameter,
constant, result, or counter E3022 with variant `kind`, rank mismatch E3022 `rank`. On
success the symbol becomes `array(element = scalar type, rank = sizes.length)`, dimensioned.
Sizes fold as in §5.1.

### 5.3 Constante

§3.2. The value is folded before the symbol is declared, so `Constante A <- A` is E3001.

### 5.4 Assignment

Target is an `Identifier` or an `Index`. Resolve the target (§3.2, pseint may declare),
type the value, then `assignable(targetType, value)` (§4.2). Errors: E3007 constant,
E3008 counter, E3005 subprogram, E3013 string index write (`s[i] <- …`, hint mentions
`{builtin:substring}` and `{builtin:concat}`), E3009 whole array. `viaEquals` is the parser's business
and ignored here.

### 5.5 Leer

Each target must resolve to a `variable`, `parameter`, `result`, or array element; never a
constant (E3007), counter (E3008), or whole array (E3009). Any scalar type is readable; the
runtime parses by the target's type. Counts as a write for W3003.

### 5.6 Escribir

Every argument must type to a scalar or `unknown`; a whole array is E3009, a procedure call
E3020.

### 5.7 Si, Mientras, Repetir

The condition must be `Logico` or `unknown`, else E3014 (`condition not logical`, data:
found type) with hint `compare` when the condition is numeric ("compare explicitly,
`{expr} <> 0`").

### 5.8 Segun

Selector must type to `Entero`, `Caracter`, or `Cadena`, else E3028 (`Real`, `Logico`,
array). Every label must fold (§4.6) to a value assignable to the selector type, else E3029
(not constant) or E3010. A value equal to an earlier label anywhere in the same `Segun` is
E3030 with `related` on the first occurrence. Comparison of `Caracter` and one-character
`Cadena` labels is by string value.

### 5.9 Para

Strict mode: the counter must resolve to an existing `variable` of type `Entero` in the
current scope, else E3001 (unknown, hint `declare`) or E3026 (counter must be `Entero`,
data: found). Pseint mode: an unknown counter declares a `counter` symbol of type `Entero`
at the loop; a known `Entero` variable is used as is. Inside the loop body the symbol is
flagged as a counter, so assignment, `Leer`, and passing it `Por Referencia` are E3008; after
the loop it is an ordinary
variable again, holding whatever the runtime left. `from`, `to`, `step` must be `Entero`
(E3010 with the usual hint). A `step` folding to zero is E3027.

### 5.10 Romper, Continuar, Retornar

`Romper` and `Continuar` outside a loop of the current body are E3031; loops in a caller do
not count. `Retornar value` in a procedure or in main is E3033. In a function, `Retornar
value` must be assignable to the result type (E3010) and counts as an assignment of the
result variable; bare `Retornar` is allowed anywhere. `Retornar value` in a function that
has no result variable and no result type (parser accepts it) fixes the result type from the
value (§5.12).

### 5.11 Calls

User calls (`Call`, `CallStmt`): the callee must be a subprogram, else E3006 (or E3001 with
suggestion when nothing of that name exists). Arity must match exactly (E3034: expected,
found). Each argument is checked with `assignable(paramType, argType)` (E3035: position,
expected, found; same hint variants as E3010). A `Por Referencia` parameter needs an
argument that is a variable, parameter, result variable, or array element, else E3032
("pass a variable"; constants included). Arrays are only passable to array parameters of
the same element type and rank and are always by reference at runtime; writing to an array
parameter inside the body is allowed regardless of the modifier. Assigning to a by-value
scalar parameter is allowed and local. Calling a function as a statement discards its
result silently. Every resolved call is recorded in `calls`.

Builtin calls: arity and types from the §6 table. Arity mismatch E3036 (builtin spelling,
expected, found); type mismatch E3037 per bad argument (position, expected class, found).
A bare builtin token is a zero-argument call and gets the same check, so `pi` alone is fine
and `longitud` alone is E3036.

### 5.12 Untyped parameters and results (`typedParameters: false`)

Signatures are collected in phase one with `unknown` for every missing type. Bodies are
checked on demand (§8): when a call is checked against a callee with `unknown` parameter
types, each such parameter is fixed to the argument's type (an `unknown` argument leaves it
`unknown`), the fixing call site is remembered, and the callee body is checked right then,
once. A later call with an incompatible argument is an ordinary E3035 with `related` on the
fixing call. A cycle (the callee is already being checked) leaves the parameter `unknown`
and reports E3015 (`cannot infer`, hint: add `{kw:as}`) on the parameter. A subprogram that
is never called is checked last with `unknown` parameters and no diagnostic for them.

A function without a return type infers it from the first assignment to its result variable
or the first `Retornar value` while its body is checked; calls checked before that see
`unknown`. A function whose result is never assigned types `unknown` and gets W3004.

### 5.13 Esperar, Limpiar, Esperar Tecla, error statements

`WaitStmt.millis` must be `Entero`. The others have nothing to check; `ErrorStmt` is skipped.

## 6. Builtins

Table in `types/builtins.ts`, one row per `BuiltinKey`. `numeric` accepts `Entero` or
`Real`; `text` accepts `Cadena` or `Caracter`; `same` returns the argument's type.

| Key | Params | Result |
|---|---|---|
| abs | numeric | same |
| sqrt ln exp sin cos tan asin acos atan | numeric | `Real` |
| trunc round | numeric | `Entero` |
| random | — | `Real` |
| randomBetween | `Entero`, `Entero` | `Entero` |
| pi | — | `Real` |
| length | text | `Entero` |
| upper lower | text | same |
| substring | text, `Entero`, `Entero` | `Cadena` |
| concat | text, text | `Cadena` |
| toNumber | text | `Real` |
| toText | any scalar | `Cadena` |

`substring` positions are `ini..fin` inclusive under `indexBase`; the interpreter enforces
bounds. `toNumber` yields `Real`, so assigning it to an `Entero` gets the `trunc` hint. The
interpreter reads arity and result type from this table and implements only the bodies.

## 7. Diagnostics

### 7.1 Codes

Errors E3001–E3039, warnings W3001–W3004. Severity is fixed per code.

| Code | Meaning | Data / hints |
|---|---|---|
| E3001 | name not declared | `name`; variants `suggest` (`suggestion`), `declare` |
| E3002 | already declared | `name`, related; variants `result`, `parameter` |
| E3003 | used before its declaration | `name`, related |
| E3004 | variable named like a subprogram | `name`, related |
| E3005 | subprogram used as a variable | `name` |
| E3006 | not a subprogram | `name` |
| E3007 | constant is read-only | `name` |
| E3008 | counter is read-only inside its loop | `name` |
| E3009 | array where a scalar is needed, or scalar indexed | `name`; variants `array`, `scalar` |
| E3010 | cannot assign | `expected`, `found`; variants `trunc`, `div`, `index`, `toNumber`, `toText`, `rank`, `element` |
| E3011 | literal too long for a character | `length` |
| E3012 | operator operand mismatch | `op`, `expected`, `found`, `side`; variants `divide`, `trunc`, `toText` |
| E3013 | cannot assign into a text by index | — |
| E3014 | condition is not logical | `found`; variant `compare` |
| E3015 | cannot infer the type | `name`; variants `parameter`, `result` |
| E3016 | index count mismatch | `expected`, `found` |
| E3017 | index is not an integer | `found` |
| E3020 | procedure used as a value | `name` |
| E3021 | dimension of an undeclared name | `name` |
| E3022 | cannot dimension | `name`; variants `again`, `kind`, `rank` |
| E3023 | array size is not a positive integer constant | — |
| E3024 | constant value is not constant | `name` |
| E3025 | division by zero | `op` |
| E3026 | counter must be an integer | `name`, `found` |
| E3027 | step is zero | — |
| E3028 | selector type cannot be switched on | `found` |
| E3029 | case label is not constant | — |
| E3030 | duplicate case label | `value`, related |
| E3031 | break or continue outside a loop | `kw` (`{kw:$kw}`) |
| E3032 | by-reference argument must be a variable | `param` |
| E3033 | return value outside a function | — |
| E3034 | wrong number of arguments | `name`, `expected`, `found` |
| E3035 | argument type mismatch | `name`, `position`, `expected`, `found`; E3010 variants |
| E3036 | wrong number of arguments to a builtin | `builtin`, `expected`, `found` |
| E3037 | builtin argument type mismatch | `builtin`, `position`, `expected`, `found` |
| W3001 | unreachable code | — |
| W3002 | declared but never read | `name` |
| W3003 | read but never assigned | `name` |
| W3004 | function result never assigned | `name` |

Parser tweak: E2002 gains a `builtin` variant, chosen when the unexpected token is a builtin
in a declaration position, with the hint "rename, `{name}` is a builtin".

Catalog slots: `{name}`, `{expected}`, `{found}`, `{type:key}`, `{kw:key}`, `{kw:$kw}`, and a
new `{builtin:$builtin}` slot resolved through the profile's builtin spellings. Types in
`expected`/`found` are pre-rendered with `typeToString(profile)` before formatting, so the
catalogs receive plain text. Both `es` and `en` gain every code and variant; the catalog
type stays exhaustive so a missing entry fails typecheck.

### 7.2 Ordering and deduplication

`check` returns diagnostics sorted by `span.start`, then severity (`error` first), then
code. `compile` concatenates parser and checker diagnostics and sorts the same way; parser
diagnostics win ties. Two diagnostics with the same code and span are collapsed to one.

## 8. Checking algorithm

1. **Phase one** walks `Program.subprograms` (misplaced ones included) and `main` /
   `extraMains`: declares each subprogram in the program scope, builds its body scope with
   parameters (types from `TypeRef`, `unknown` when absent) and the result symbol (type from
   `returnType`, `unknown` when absent, kind `result`), and records the signature. No bodies.
2. **Phase two** checks main's body, then each `extraMains` body. Statements are checked in
   source order; expressions are typed bottom-up and every node written to `types`.
3. When a call to a subprogram is checked, `ensureChecked(decl)` runs: if the body is
   unchecked and not in progress, fix untyped parameters from the argument types (§5.12) and
   check the body now; if in progress, treat as a cycle. Memoized per declaration.
4. After main, every still-unchecked subprogram is checked in source order with whatever
   types it has.
5. Flow warnings (§9) run per body after its check.
6. Diagnostics are sorted and deduplicated (§7.2).

Depth: bodies nest only through calls, and the memo guarantees each body is checked once,
so recursion depth is bounded by the number of subprograms. Expression typing reuses the
parser's depth guard (E2032 trees are already shallow).

## 9. Flow warnings

All flow-insensitive except W3001; parameters are exempt from W3002 and W3003.

- **W3001 unreachable**: in any statement list, the first statement after a `Retornar`,
  `Romper`, or `Continuar`; one warning spanning from that statement to the end of the list.
- **W3002 declared but never read**: a `variable` symbol with zero reads. Parameters,
  constants, counters (read by their own loop), and result variables (read by the call) are
  exempt. A variable that is only written is still W3002.
- **W3003 read but never assigned**: a `variable` with reads and zero writes, where `Leer`,
  `Para` (as counter), assignment, `Retornar value` (result), and any `Por Referencia`
  argument use count as writes. Arrays are exempt: `Dimension` and sized shorthand count as
  initialization.
- **W3004 result never assigned**: a function whose result symbol has zero writes.

## 10. Testing

Test-driven, behaviour-first, in `packages/language/test/`:

- **`types/`**: one test per row of §4.2, §4.3, §4.4, §6: a snippet, the expected type or
  code. A wrong row fails exactly one test. Folding cases including `4 / 2` → `Real`.
- **`checker/by-code/`**: for every E3xxx and W3xxx, at least one program triggering it
  exactly once at the expected span, and one neighbour that does not trigger it. Codes whose
  outcome depends on `implicitDeclarations` or `typedParameters` are tested under both the
  default and the `pseint` profile.
- **One mistake, one diagnostic**: property test over the corpus with a fixed mutation list
  (delete one `Definir`, rename one use, swap one literal's type, drop one argument, change
  one operator) asserting exactly one checker diagnostic per mutated program.
- **Corpus**: every program in `test/corpus/programs` checks clean under the default
  profile (those listed in `index-base-0.txt` with `indexBase: 0`). Programs that fail are
  rewritten minimally and each rewrite is recorded in the corpus README; expected rewrites:
  undeclared `Para` counters, `Si a MOD 2` conditions, `Definir` of the result variable, and
  `/` results assigned to `Entero` variables.
- **Side tables**: walking every corpus tree, every `Expr` has a type, every non-missing
  `Identifier` has a symbol, every `Call` has a target, and `scopes` lists every declared
  name once.
- **Format**: every new code and variant renders in `es` and `en` with no unfilled slot.
- **compile**: parser errors and checker errors appear together, sorted; a broken tree
  yields no checker diagnostic on its placeholders.
