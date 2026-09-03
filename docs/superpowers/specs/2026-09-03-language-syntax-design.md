# StepCode v2 — language sub-spec A: lexer, parser, AST

Parent: [umbrella design](./2026-09-03-stepcode-v2-design.md) §2, §3.1, §3.4, §7 item 3.
Siblings (later): sub-spec B checker + diagnostics, sub-spec C interpreter + run controller.

## 1. Scope

This sub-spec delivers `source → tokens → AST` inside `packages/language` (npm `stepcode`),
with diagnostics for lexical and syntax errors. It does not include the checker, the
interpreter, or `compile()`; those arrive in sub-specs B and C.

Sources of truth consulted: the umbrella spec, the resolved-profile contract of
`@stepcode/profiles`, and the frozen v1 corpus in `packages/language/test/corpus/v1/`
(surveyed 2026-09-03). Decisions taken during the brainstorm:

| Topic | Decision |
|---|---|
| Semicolons (`requireSemicolons: true`) | Required after every simple statement, never after block openers/closers. `;;` is a warning. |
| Subprogram headers | All five v1/PSeInt forms accepted and normalized to one node. |
| `DIV`, `**`, `ConvertirACadena` | Added to `@stepcode/profiles` before this sub-project (keyword `div`, `**` on `power`, `ConvertirACadena` on `toText`). |
| Array types | Bracket shorthand only: `Entero[]`, `Entero[,]`, `Entero[3,3]`; same in `Definir`, parameters, return types. The umbrella's `Arreglo De` is withdrawn. |
| `$ arrays@stepcode` directive | Dropped. `indexBase` is a profile option; a leading `$` is E1001 with a hint naming the option. |
| Parser output | Typed AST with spans and token index ranges, plus the token array. No CST. |

Out of scope, recorded for later sub-specs: negative indices (`a[-1]`), integers as
conditions (`Si a MOD 2`), near-miss identifier suggestions, `Esperar 2 Segundos` unit words.

## 2. Layout and public surface

```
packages/language/src/
  source/       Span, Position, LineMap (offset ↔ line/column)
  diagnostics/  Diagnostic, codes, severities, catalogs es/en, formatDiagnostic
  lexer/        tokenize(source, profile)
  ast/          node interfaces, kinds, walk()
  parser/       parse(source, options)
  index.ts      public exports
```

```ts
interface Span { start: number; end: number }            // UTF-16 offsets, end exclusive
interface Position { line: number; column: number }      // 1-based
class LineMap { constructor(source); positionAt(offset): Position; offsetAt(pos): number }

type Severity = 'error' | 'warning'
interface Diagnostic {
  code: DiagnosticCode          // 'E1001' … 'W2001'
  severity: Severity            // fixed per code
  span: Span
  data: Record<string, string | number>   // template slots, e.g. { found: 'FinPara', openerLine: 3 }
  related?: { span: Span }[]    // e.g. the opener of an unclosed block
}
formatDiagnostic(d: Diagnostic, locale: string, profile: ResolvedProfile): string

tokenize(source: string, profile: ResolvedProfile): { tokens: Token[]; diagnostics: Diagnostic[] }
parse(source: string, options: { profile: ResolvedProfile }): ParseResult
interface ParseResult { program: Program; tokens: readonly Token[]; diagnostics: readonly Diagnostic[] }
```

Options (`requireSemicolons`, `assignWithEquals`, `typedParameters`, `caseSensitive`) are read
from `profile.options`; the parser takes no separate options object.

Binding rules:

- **Never throws** on any input. `parse` always returns a `Program`; broken regions become
  `ErrorStmt` / `ErrorExpr` nodes with spans.
- **Diagnostics are data.** Text comes only from `formatDiagnostic`, whose catalogs live in
  this package (`es`, `en`; locale fallback `pt-BR → pt → en`, `registerCatalog` for more).
  Templates quote the active profile's first spelling of a construct via `{kw:endIf}` slots.
- **Deterministic**: same `(source, profile)` → identical tokens, AST, diagnostics.
- **Ordered**: `parse` returns diagnostics sorted by `span.start`, stably — at the same offset
  a lexer diagnostic comes before a parser one.
- **Lossless**: `tokens.map(t => t.text).join('') === source`; every significant token
  (trivia, `newline` and `eof` aside) lies in the token range of exactly one innermost node.
  A child's range always lies inside its parent's and siblings never overlap. Recovery
  placeholders (`ErrorExpr`, a synthesized `Identifier`, any node that consumed nothing) carry
  the *empty* token range `[first, first - 1]` and a zero-width span just past the last token
  consumed, so they own nothing and take nothing from the node that does. The contract is a
  property of the finished `parse`, which seals the ranges before returning.

## 3. Lexer

### 3.1 Token

```ts
interface Token {
  kind: TokenKind
  text: string        // exact source slice
  span: Span
  value?: KeywordKey | TypeKey | BuiltinKey | OperatorKey | string | number
}
```

| kind | `value` | notes |
|---|---|---|
| `keyword` | `KeywordKey` | multi-word spellings are one token |
| `type` | `TypeKey` | |
| `builtin` | `BuiltinKey` | |
| `operator` | `OperatorKey` | never `comment` (comments are trivia) |
| `identifier` | canonical name | `text` as written; canonical = `toLowerCase()` when `!caseSensitive`, else `text`. Accents are never folded. |
| `integer` | `number` | |
| `real` | `number` | |
| `string` | content without quotes | `"…"` or `'…'`; no escape sequences |
| `punct` | one of `( ) [ ] , : ;` | |
| `newline` | | one per `\n`, `\r\n`, or lone `\r` |
| `whitespace` | | trivia |
| `comment` | | trivia; from the `comment` operator spelling to end of line |
| `error` | | one per unrecognized run; carries a diagnostic |
| `eof` | | always last, empty text |

### 3.2 Scanning

- **Words.** A word is a maximal run of Unicode letters, digits, and `_` starting with a
  letter or `_`. After reading one word, the lexer looks ahead through whitespace (never
  newlines or comments) for up to `profile.maxWords - 1` further words, and tries the joined
  candidates longest first against `profile.lookup` after `profile.normalize`
  (`collapseWhitespace` semantics: inner runs of blanks become one space). The first hit wins
  and emits `keyword` / `type` / `builtin`. No hit: a single-word `identifier`. Hence
  `Escribir Sin Saltar` beats `Escribir`, `Sino Si` beats `Sino`, and a `Si` on the next line
  after `Sino` is never joined. A word that is no construct is matched exactly (no
  `normalize`) against `profile.operatorLookup` before it becomes an identifier, so a profile
  may spell an operator with letters (`elevado`, or `REM` on `comment`).
- **Punctuation.** One table per profile, derived from the `profile.lookup` entries that
  contain no letter (`&`, `|`, `~`, `%`, or anything a custom profile adds) *together with*
  every `profile.operatorLookup` spelling, sorted longest first: the longest match wins
  whichever table it came from, so `&&` on `power` beats the `&` that spells `and`, and `<=`
  beats `<`, `<-` beats `<`, `**` beats `*`. A spelling both tables claim goes to the
  construct. `==` is scanned as a single `error` token with E1006.
- **Comments.** The `comment` spelling starts a `comment` token to end of line. No block
  comments.
- **Numbers.** `digits` → `integer`; `digits.digits` → `real`. No leading dot, no exponent.
  `1.` is `integer 1` then E1001 on the dot. A number immediately followed by a letter or
  `_` (`10abc`) is one `error` token, E1003.
- **Strings.** Opened by `"` or `'`, closed by the same character. A newline or EOF before the
  closing quote ends the token at the line end with E1002; the next line lexes normally.
- **Newlines.** `\r\n` is one `newline` token; lone `\r` and `\n` likewise.
- **Anything else** (including a leading `$`) → `error` token E1001; consecutive stray
  characters merge into one token. `$` gets `data.hint = 'indexBase'` so the message can
  mention the option.

### 3.3 Lexer diagnostics

| code | meaning | data |
|---|---|---|
| E1001 | unexpected character(s) | `{ text, hint? }` |
| E1002 | unterminated string | |
| E1003 | malformed number | `{ text }` |
| E1006 | `==` is not an operator; use `=` | |

## 4. Grammar

Keywords are written with their `es` spelling; every keyword is the profile key beneath it.
`;` denotes a terminator: `;` when `requireSemicolons` is true; `;` or `newline` otherwise.
Block openers and closers never take a terminator.

```
Program      := (Subprogram | MainBlock)*
MainBlock    := program Ident Block endProgram
Subprogram   := procedure Ident [ParamList] Block endProcedure
              | function [Ident [as Type] assign] Ident [ParamList] [":" Type] Block endFunction
ParamList    := "(" [Param ("," Param)*] ")"
Param        := Ident Modifier*                Modifier := as Type | byRef | byValue   (any order, each at most once)
Type         := TypeName [ "[" (Expr | ε) ("," (Expr | ε))* "]" ]
                 -- Entero | Entero[] | Entero[,] | Entero[3,3]; sizes all present or all absent

Block        := Statement*
Statement    := define Ident ("," Ident)* as Type ;
              | dimension Item ("," Item)* ;              Item := Ident "[" Expr ("," Expr)* "]" ("[" Expr "]")*
              | constant Ident [as Type] assign Expr ;
              | Target assign Expr ;                      Target := Ident ("[" Expr ("," Expr)* "]")*
              | Target equal Expr ;                       only when assignWithEquals
              | write Expr ("," Expr)* ;
              | writeNoNewline Expr ("," Expr)* ;
              | read Target ("," Target)* ;
              | if Expr then Block (elseIf Expr then Block)* [else Block] endIf
              | switch Expr do Case* [otherwise ":" Block] endSwitch
              | while Expr do Block endWhile
              | repeat Block (until | while) Expr ;
              | for Ident assign Expr to Expr [step Expr] do Block endFor
              | break ; | continue ; | return [Expr] ;
              | Ident "(" [Expr ("," Expr)*] ")" ;         call statement
              | BuiltinCall ;                              a builtin used as a statement
              | clearScreen ; | wait Expr ; | waitKey ;
Case         := [case] Expr ("," Expr)* ":" Block           `case` keyword only if the profile spells it
```

Notes:

- Top level admits only subprograms and one main block, in any order. Zero main blocks →
  E2010 at EOF; a second one → E2011 at its opener, and the block itself is kept in
  `Program.extraMains`. A statement at top level → E2012 with a hint to wrap it in
  `Proceso … FinProceso`. A subprogram inside a block → E2015, and it is kept in
  `Program.subprograms`.
- Function header forms, all normalized to the same node: `Funcion f()`, `Funcion f(): Entero`,
  `Funcion r <- f()`, `Funcion r Como Real <- f(x Como Real)`, and `SubProceso f` with or
  without parens. A `Funcion` with neither return name nor return type is valid syntax; the
  checker decides its meaning.
- Parameter modifiers may appear in either order (`a Como Entero Por Referencia` or
  `a Por Referencia Como Entero`). A repeated modifier is E2022. A parameter without `Como`
  is E2021 when `typedParameters` is true.
- `Segun` requires `Hacer` after the selector. Labels are expression lists; literal-ness is
  the checker's business. `De Otro Modo` is optional and may appear only once (E2013); a
  second one's statements are appended to the first, so nothing is dropped.
- `Para` has no `Desde`; `Con Paso` takes any expression. `Repetir` closes with `Hasta Que`
  or `Mientras Que`; the node stores `until`.
- `Esperar` takes an expression in milliseconds.
- Assignment target may be indexed. `<-` after a call expression is E2020.
- `;;` and a `;` directly after a block opener/closer produce W2001 (empty statement); nothing
  is emitted to the AST.

## 5. Expressions

Pratt parser. Binding power, lowest to highest:

| level | operators | assoc | notes |
|---|---|---|---|
| 1 | `or` | left | |
| 2 | `and` | left | |
| 3 | `not` (prefix) | | below relational: `No a = b` ≡ `No (a = b)` (departs from Pascal deliberately) |
| 4 | `equal notEqual lt le gt ge` | none | `a < b < c` → E2030, hint `a < b Y b < c` |
| 5 | `plus minus` | left | |
| 6 | `times divide div mod` | left | |
| 7 | `minus plus` (prefix) | | below power: `-2^2` ≡ `-(2^2)` |
| 8 | `power` (`^`, `**`) | right | `2^3^2` ≡ `2^(3^2)`; operand may be unary: `2^-1` |
| 9 | postfix `[…]`, call `(…)` | | `a[i,j]` ≡ `a[i][j]` → one `Index` with two indices |
| 10 | primary | | literal, identifier, `( Expr )` |

- `Ident ( args )` → `Call`. User-defined zero-argument calls require parens.
- `builtin ( args )` → `BuiltinCall`; a bare `builtin` token → zero-argument `BuiltinCall`
  (`PI`, `Azar`). Arity is checked in sub-spec B.
- A `type` or non-literal `keyword` in expression position → E2031 with the token named.
- Literals: `integer`, `real`, `string`, `true`/`false` keywords →
  `Literal { value, type: 'integer' | 'real' | 'string' | 'boolean' }`. No character literal.
- Parentheses produce no node; their tokens fall inside the parent's token range.

## 6. AST

Every node: `{ kind, span, tokens: [first, last] }` (inclusive token indices into
`ParseResult.tokens`) plus its fields. `[first, first - 1]` is the empty range: it covers no
token, and its zero-width span sits where the missing token would have begun. Placeholders and
nodes that consumed nothing carry it.

```
Program        { subprograms: SubprogramDecl[]; main: MainBlock | null; extraMains: MainBlock[] }
                 // extraMains: every main block after the first (E2011), parsed and kept
MainBlock      { name: Identifier; body: Stmt[] }
SubprogramDecl { form: 'procedure' | 'function'; name: Identifier; params: Param[];
                 returnName?: Identifier; returnType?: TypeRef; body: Stmt[]; misplaced?: true }
                 // `SubprogramDecl` is part of `Stmt`: only a misplaced one (E2015) ever
                 // appears in a block's body, and it carries `misplaced` there.
Param          { name: Identifier; type?: TypeRef; byRef: boolean }
TypeRef        { base: TypeKey; dimensions: (Expr | null)[] }   // [] scalar; [null] T[]; [null,null] T[,]; [e1,e2] sized
Identifier     { name: string /* canonical */; text: string /* as written */; missing?: true }
                 // `missing` marks an identifier the parser synthesized: name === '' and it is
                 // never a real symbol.

DefineStmt     { names: Identifier[]; type: TypeRef }
DimensionStmt  { items: DimensionItem[] }
DimensionItem  { name: Identifier; sizes: Expr[]; span; tokens }      // a record, not a Node
ConstantStmt   { name: Identifier; type?: TypeRef; value: Expr }
AssignStmt     { target: Identifier | Index; value: Expr; viaEquals: boolean }
WriteStmt      { args: Expr[]; newline: boolean }
ReadStmt       { targets: (Identifier | Index)[] }
IfStmt         { branches: IfBranch[]; elseBody?: Stmt[] }
IfBranch       { condition: Expr; body: Stmt[]; span; tokens }        // a record, not a Node
SwitchStmt     { selector: Expr; cases: SwitchCase[]; otherwise?: Stmt[] }
SwitchCase     { values: Expr[]; body: Stmt[]; span; tokens }         // a record, not a Node
WhileStmt      { condition: Expr; body: Stmt[] }
RepeatStmt     { body: Stmt[]; condition: Expr; until: boolean }
ForStmt        { counter: Identifier; from: Expr; to: Expr; step?: Expr; body: Stmt[] }
BreakStmt      { }
ContinueStmt   { }
ReturnStmt     { value?: Expr }
CallStmt       { call: Call | BuiltinCall }
ClearStmt      { }
WaitStmt       { millis: Expr }
WaitKeyStmt    { }
ErrorStmt      { }

Literal        { value: number | string | boolean; type: 'integer' | 'real' | 'string' | 'boolean' }
Index          { target: Expr; indices: Expr[] }
Call           { callee: Identifier; args: Expr[] }
BuiltinCall    { key: BuiltinKey; args: Expr[] }
Unary          { op: 'minus' | 'plus' | 'not'; operand: Expr }
Binary         { op: BinaryOp; left: Expr; right: Expr }
ErrorExpr      { }
BinaryOp = 'plus' | 'minus' | 'times' | 'divide' | 'power' | 'div' | 'mod'
         | 'equal' | 'notEqual' | 'lt' | 'le' | 'gt' | 'ge' | 'and' | 'or'
```

`IfBranch`, `SwitchCase` and `DimensionItem` stay plain records — no `kind`, not part of
`Node` — but carry `span` and `tokens` running from the first to the last token of the branch,
case or item, so a tool can highlight one without re-deriving it from its children.

`walk(node, { enter?(node, parent), exit?(node, parent) })` is the single traversal utility;
`enter` may return `false` to skip children. `childrenOf` returns children sorted by their
first token, which is not always field order (a `Funcion`'s return name precedes its name; a
main block may follow a subprogram). Both are iterative: no input nests deep enough to
overflow the stack. The checker, interpreter, and codemirror
package all use it. Keyword positions (`FinSi`, `Entonces`) are recovered from the token
range when a diagnostic needs them; nodes carry no extra keyword spans.

## 7. Error recovery

Goal: one mistake, one diagnostic, and an AST that is intact everywhere else. Recovery never
drops code that parsed: an extra main block, an extra `De Otro Modo` and a misplaced
subprogram are all reported *and* kept in the tree.

- **Missing terminator.** If the next token is on a later line and can start a statement,
  emit E2001 at the end of the previous token and continue as if `;` were present. Otherwise
  the statement is garbled: emit E2002 at the offending token and skip to the next terminator,
  newline, or block keyword, producing one `ErrorStmt`.
- **Bad statement start** → E2002, same skip, one `ErrorStmt`.
- **Block closers.** The parser keeps a stack of open blocks. On a closer:
  - matches the innermost block → close normally;
  - matches an outer block → E2003 on the innermost opener ("expected `FinSi` to close the
    `Si` on line N", `related` = closer span), close the inner block virtually, and let the
    outer block consume the closer;
  - matches nothing → E2006 ("`FinSi` closes nothing"), token dropped.
  EOF with open blocks → one E2003 per open block, found innermost first and then sorted by
  position like every other diagnostic.
- **Missing `Entonces`/`Hacer`** → E2004, inserted virtually.
- **Lexer `error` tokens** are already diagnosed (E1001, E1003, E1006), so the parser swallows
  them without a second diagnostic: in expression position one becomes an `ErrorExpr`, in
  operator position it takes an operand with it, and the terminator, the statement dispatcher
  and the keyword expectations step over it.
- **`Sino Si` after `Sino`** → E2014 at the branch, which is parsed and appended to `branches`
  all the same, so nothing of the program is lost.
- **A subprogram inside a block** → E2015 at its opener; it is parsed in full and the block
  resumes after its closer. It stays where the source wrote it — a statement of that block,
  which is what owns its tokens — while `Program.subprograms` holds the same object, so tools
  find it positionally through the block and semantically through the program. It is marked
  `misplaced`, and `childrenOf(Program)` skips it so the traversal reaches it exactly once.
- **Mixed sized and unsized dimensions** (`Entero[3,]`) → E2023 at the empty slot.
- **Expression errors** → `ErrorExpr` with E2031; the enclosing statement still terminates.
- **Unbalanced `)` / `]`** → E2005 at the opener; recovery at the terminator.
- **Nesting limits.** Expressions descend at most `MAX_EXPRESSION_DEPTH` (500) levels and
  block statements at most `MAX_BLOCK_DEPTH` (200); past either, the parser stops descending,
  reports E2032 once per parse, and yields an `ErrorExpr` (expressions) or an empty block. The
  limits keep `parse` total on pathological input instead of overflowing the stack.

### 7.1 Parser diagnostics

| code | severity | meaning |
|---|---|---|
| E2001 | error | expected `;` |
| E2002 | error | unexpected token |
| E2003 | error | expected closer for open block (data: `opener`, `closer`, `openerLine`) |
| E2004 | error | expected a specific keyword (`Entonces`, `Hacer`, `Como`, …); data names it |
| E2005 | error | unbalanced bracket |
| E2006 | error | closer without an open block |
| E2010 | error | no main block |
| E2011 | error | second main block |
| E2012 | error | statement outside a block |
| E2013 | error | second `De Otro Modo` |
| E2014 | error | `Sino Si` after `Sino` |
| E2015 | error | subprogram declared inside a block |
| E2020 | error | assignment to a call |
| E2021 | error | parameter without a type (`typedParameters`) |
| E2022 | error | repeated parameter modifier |
| E2023 | error | mixed sized and unsized dimensions |
| E2030 | error | chained comparison |
| E2031 | error | expected an expression |
| E2032 | error | nesting too deep (data: `limit`) |
| W2001 | warning | empty statement |

Ranges: E1xxx lexer; E2001–E2019 statements; E2020–E2029 declarations and headers;
E2030–E2039 expressions; W2xxx parser warnings. Later sub-specs use E3xxx (checker) and
E4xxx (runtime).

### 7.2 Catalogs

`diagnostics/catalog/es.ts`, `en.ts`: `Record<DiagnosticCode, string>` templates. Slots:
`{name}` from `data`, `{kw:key}` / `{type:key}` / `{op:key}` replaced by the profile's first
spelling, and `{kw:$field}` where the key is read from `data.field` (for codes whose keyword
varies per occurrence, e.g. E2003's closer). A catalog may add `E1001.indexBase`-style
variants; `formatDiagnostic` picks `${code}.${data.hint}` when present. Locale resolves with
fallback `pt-BR → pt → en`.
`registerCatalog(locale, entries)` adds or overrides.

## 8. Testing

- **Lexer** (`test/lexer/`): token streams asserted as `kind:value` strings. Cases: multi-word
  longest match, no joining across newlines, symbolic `& | ~ %`, both quote styles,
  unterminated string, `10abc`, `1.`, `==`, `\r\n`, accented identifiers, case folding on and
  off, the `en` profile, a custom profile with a three-word keyword, losslessness.
- **Parser** (`test/parser/`): one file per statement family; each case `source → AST`
  compared through a compact S-expression printer
  (`(if (binary lt a b) (write (literal 1)) else (write (literal 2)))`). The precedence table
  is verified line by line (`-2^2`, `2^3^2`, `2^-1`, `No a = b`, `x Y y O z`, `a[i,j]` vs
  `a[i][j]`). All five header forms yield the same node. `Segun` with and without `Caso`.
- **Diagnostics** (`test/parser/diagnostics.test.ts`): every code has a case asserting code,
  line/column, and the formatted message in `es` and `en`. Recovery cases inject one mistake
  each (missing `;` on a new line, garbled statement on one line, missing `FinSi`, stray
  `FinSi`, mismatched closer, statement outside `Proceso`) and assert exactly one diagnostic
  and an otherwise intact AST.
- **Options**: `requireSemicolons: false` with newline terminators; `assignWithEquals: true`;
  `typedParameters: false` accepting a bare `arreglo` parameter.
- **Corpus** (`test/corpus/`): a one-off script extracts every program from
  `v1/*.v1.ts` and `v1/programs/*.ts` into committed `test/corpus/programs/*.stepcode`
  files (name = test title, slugified). The script drops the legacy `$ arrays@stepcode`
  first line and records the affected programs in `test/corpus/programs/index-base-0.txt`
  so sub-spec C can run them with `indexBase: 0`; it also rewrites the v1-only builtin
  spellings `round` → `Redondear` and `random` → `Azar`, which no profile defines.
  `parse.test.ts` asserts each program parses with zero diagnostics under `pseint`, satisfies
  losslessness and holds the tree invariants; `shape.test.ts` pins the S-expression of eight
  representative programs in a committed snapshot file, so a silent change of shape shows up. These files seed the conformance
  corpus that sub-specs B and C extend with inputs and expected outputs.
- **Invariants** (`test/parser/invariants.test.ts`): `assertTreeInvariants` — child inside
  parent, one innermost owner per significant token, `childrenOf` sorted, span matching the
  token range — over a table of broken sources (every reproducer of the final review, with and
  without CRLF).
- **Property tests** (`fast-check`, added to the workspace catalog): `parse` never throws on
  random token sequences and random strings, is deterministic, and keeps the tree invariants;
  a mutation property generates a well-formed program, applies one to three single-token edits
  (delete, duplicate, swap) and asserts the parse is fast, total and still invariant.

Coverage is behavioral: every grammar branch and every diagnostic code has a named test.
