# `@stepcode/codemirror` — design

Sub-project 5 of the StepCode v2 rewrite (umbrella: `2026-09-03-stepcode-v2-design.md`, §3.5).
Branch `RolandoAndrade/v2`. Consumes the `stepcode` language package delivered by sub-projects
3a–3c and `@stepcode/profiles`.

## 1. Goal

CodeMirror 6 language support for StepCode that comes from the same parser and checker the
runtime uses, plus the editor-side debugging extensions the web editor needs. The package is
published as `@stepcode/codemirror` and is reusable by any CodeMirror 6 host: the editor, the
academy site, a playground. It never touches a Web Worker or the interpreter.

The audience is a beginner: every feature exists to keep them from getting lost. Blocks close
themselves, names complete with their types, a call shows its parameters while it is typed, a
hover explains what a name is, and a mistake is a squiggle with a message in their language.

## 2. Scope

In: syntax tree, highlighting, lint, folding, indentation, block matching, completion with
block snippets, signature help, hover, go to definition, breakpoint gutter, current-line
marker, base theme with class hooks, `es`/`en` strings, tests under Node and happy-dom.

Out (editor sub-project or later): the worker and `RuntimeHost`, the variables panel, full
themes, incremental parsing, the mobile symbol bar, custom-profile editing, a mouse binding
for go to definition.

## 3. Public API

```ts
import type { ResolvedProfile } from '@stepcode/profiles'
import type { CompileResult, Identifier } from 'stepcode'

// Everything, for one profile. A host that switches profiles wraps this in a Compartment.
export function stepcode(options: { profile: ResolvedProfile; locale?: string }): LanguageSupport

// The pieces, for a host that picks.
export function stepcodeLanguage(profile: ResolvedProfile): Language
export function stepcodeLint(options: StepcodeOptions): Extension
export function stepcodeCompletion(options: StepcodeOptions): Extension
export function stepcodeSignatureHelp(options: StepcodeOptions): Extension
export function stepcodeHover(options: StepcodeOptions): Extension
export function stepcodeBlockMatching(): Extension          // bracketMatching() configured for us
export const goToDefinition: Command                        // bound to F12 by stepcodeKeymap
export const stepcodeKeymap: readonly KeyBinding[]

// What every feature reads. `null` before the first parse finishes.
export function compileResultAt(state: EditorState): CompileResult | null
// The same, with the offset maps the features use (§4.3); for hosts that build their own
// panels on the checker's tables.
export function treeDataAt(state: EditorState): TreeData | null
export type { TreeData }
// The lint mapping without the linter, for a host's Problems panel.
export function stepcodeDiagnostics(state: EditorState, options: StepcodeOptions): readonly Diagnostic[]
export interface StepcodeOptions { profile: ResolvedProfile; locale: string }

// Debugging, independent of the language support and of the runtime.
export function debug(): Extension                          // breakpoints() + currentLine()
export function breakpoints(): Extension
export function currentLine(): Extension
export function breakpointLines(state: EditorState): number[]   // 1-based, ascending
export const toggleBreakpoint: StateEffectType<{ line: number }>
export const setBreakpoints: StateEffectType<readonly number[]>
export const setCurrentLine: StateEffectType<number | null>
export const currentLineOf: (state: EditorState) => number | null
export function breakpointsChanged(update: ViewUpdate): boolean
```

`locale` defaults to `profile.locale`. Strings are resolved with the language package's
`formatDiagnostic(diagnostic, locale, profile)` for diagnostics and with this package's own
table (§9) for everything else; an unknown locale falls back to `en`.

Dependencies, all regular (the CodeMirror convention, so hosts dedupe by semver):
`@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/lint`,
`@codemirror/autocomplete`, `@lezer/common`, `@lezer/highlight`, `stepcode`,
`@stepcode/profiles`. Dev: `happy-dom`. Nothing else.

## 4. The tree

### 4.1 Parser

`StepcodeParser extends Parser` from `@lezer/common`. `createParse` returns a `PartialParse`
whose single `advance()` reads the whole input, calls `compile(text, { profile })`, builds the
tree (§4.2), and returns it; `parsedPos` jumps to the input length; `stopAt` is recorded and
otherwise ignored. Parsing is not incremental: StepCode programs are a few hundred lines, and
CodeMirror already runs parses in idle time with a work budget. Revisit only with a measured
problem.

`stepcodeLanguage(profile)` is `new Language(data, parser, [], 'stepcode')` where `data`
comes from `defineLanguageFacet({ commentTokens: { line: profile.operators.comment[0] } })`, so
the stock toggle-comment command works with the profile's comment spelling.

### 4.2 Node types

One `NodeSet`, built once. Names:

| Source | Lezer node | Notes |
|---|---|---|
| `Program` | `Program` | top node |
| every other AST `kind` | same name | `MainBlock`, `SubprogramDecl`, `Param`, `TypeRef`, all `*Stmt`, `Index`, `Call`, `BuiltinCall`, `Unary`, `Binary` |
| `SwitchCase`, `DimensionItem` | same name | plain records in the AST, nodes here |
| `IfBranch` | none | flattened: its condition and body become children of `IfStmt` (§4.4) |
| `Identifier` node | `Identifier`, `VariableDefinition`, `SubprogramName`, or `CallName` | leaf; name by role (§4.3) |
| `Literal` node | `Number`, `String`, `Boolean` | leaf; the tokens inside are not emitted separately |
| `ErrorStmt`, `ErrorExpr` | same name, `error: true` | |
| keyword token with key `k` | `<PascalCase k>Keyword` | `IfKeyword`, `EndIfKeyword`, `WriteNoNewlineKeyword`, … one type per `KEYWORD_KEYS` entry |
| type token | `TypeName` | |
| builtin token | `BuiltinName` | |
| operator token | `AssignOp`, `CompareOp`, `ArithOp` | by key: assign; equal…ge; plus…power |
| punct token | `OpenParen`, `CloseParen`, `OpenBracket`, `CloseBracket`, `Punct` | |
| comment token | `Comment` | |
| lexer `error` token | `Error`, `error: true` | |
| newline, whitespace, eof | none | |

Props on the types:

- `styleTags` (§5.1).
- `NodeProp.closedBy` / `openedBy` on keyword leaves: `if`↔`endIf`, `switch`↔`endSwitch`,
  `while`↔`endWhile`, `for`↔`endFor`, `repeat`↔`until`, `procedure`↔`endProcedure`,
  `function`↔`endFunction`, `program`↔`endProgram`, and on the punctuation leaves
  `OpenParen`↔`CloseParen`, `OpenBracket`↔`CloseBracket`. The stock bracket matcher scans
  siblings, which is why openers and closers must be direct children of their statement node.
  Parentheses need the props too: the matcher's text fallback only pairs characters whose
  tree nodes share one type, and ours are distinct types by design.
- `foldNodeProp` and `indentNodeProp` on the block nodes (§5.3, §5.4).

### 4.3 Building

The builder walks the AST with `childrenOf` and `ParseResult.tokens`, emitting a postfix
buffer for `Tree.build({ buffer, nodeSet, topID })`. Rules:

1. Every AST node with a kind, plus `SwitchCase` and `DimensionItem`, becomes a node whose
   range is its `span`. `IfBranch` records are skipped; their children attach to the `IfStmt`.
2. `Identifier` and `Literal` nodes become leaves. An `Identifier` is `VariableDefinition` when
   it is a `Param.name`, a `DefineStmt.names` entry, a `ConstantStmt.name`, a
   `DimensionItem.name`, or a `SubprogramDecl.returnName`; `SubprogramName` when it is a
   `MainBlock.name` or `SubprogramDecl.name`; `CallName` when it is a `Call.callee`;
   `Identifier` otherwise. A `missing` identifier (zero width) is not emitted.
3. Every significant token not covered by a leaf from rule 2 becomes a leaf under the innermost
   node whose token range contains its index. Comment tokens attach the same way by span.
   Newline, whitespace, and eof tokens are dropped.
4. A node with an empty token range (a placeholder) is emitted zero width; Lezer allows it.
5. Children are emitted in source order; since the parser guarantees nesting without overlap
   (sub-spec A's tree contract), the buffer is valid by construction. The corpus test (§10)
   is the guard.

The finished tree is rebuilt as `new Tree(top.type, top.children, top.positions, top.length,
[[compileProp, data]])` so the top node carries `data: TreeData`:

```ts
interface TreeData {
  readonly result: CompileResult
  /** offset of an identifier leaf → its AST node, for hover, go to definition, signature help */
  readonly identifiers: ReadonlyMap<number, Identifier>
  /** offset of a Call or BuiltinCall node → its AST node */
  readonly calls: ReadonlyMap<number, Call | BuiltinCall>
}
```

`compileResultAt(state)` returns `syntaxTree(state).prop(compileProp)?.result ?? null`.
Every feature below reads the tree; none compiles on its own, so highlighting, diagnostics,
and completion can never disagree.

### 4.4 Why `IfBranch` is flat and `SwitchCase` is not

`Si`, `Sino Si`, `Sino`, and `FinSi` must be siblings for block matching and for the indent
rule that dedents a `Sino` line. `Caso` and `De Otro Modo` open a case body that is indented
one unit past the case, which is what a `SwitchCase` node's own indent rule gives; `FinSegun`
still sits directly under `SwitchStmt`, so `Segun`↔`FinSegun` matches.

## 5. Language features

### 5.1 Highlighting

`styleTags`:

| Node | Tag |
|---|---|
| `if then elseIf else endIf switch case otherwise endSwitch while do endWhile for to step endFor repeat until break continue return` keywords | `controlKeyword` |
| `program endProgram define as constant dimension procedure endProcedure function endFunction byRef byValue` keywords | `definitionKeyword` |
| `and or not mod div` keywords | `operatorKeyword` |
| `write writeNoNewline read clearScreen wait waitKey` keywords | `keyword` |
| `TypeName` | `typeName` |
| `BuiltinName` | `function(standard(variableName))` |
| `AssignOp` / `CompareOp` / `ArithOp` | `definitionOperator` / `compareOperator` / `arithmeticOperator` |
| `Number` / `String` / `Boolean` | `number` / `string` / `bool` |
| `Comment` | `lineComment` |
| `Identifier` | `variableName` |
| `VariableDefinition` | `definition(variableName)` |
| `SubprogramName` | `function(definition(variableName))` |
| `CallName` | `function(variableName)` |
| `OpenParen CloseParen` / `OpenBracket CloseBracket` / `Punct` | `paren` / `squareBracket` / `separator` |
| `Error`, `ErrorStmt`, `ErrorExpr` | `invalid` |

Styling is the host's: the package ships no highlight style. `stepcode()` does not include
one either; hosts add `syntaxHighlighting(defaultHighlightStyle)` or their theme.

### 5.2 Lint

`stepcodeLint` is `linter(source, { delay: 250, needsRefresh })` where `source` maps every
diagnostic of the tree's `CompileResult`:

- `from`/`to` from the span. A zero-width span is widened one character to the right, or to
  the left when it sits at the end of its line, so the squiggle is visible. A span at the end
  of the document with nothing to widen into becomes a one-character span at the last
  position; an empty document yields no widening.
- `severity`: `error` → `"error"`, `warning` → `"warning"`.
- `source`: the code, e.g. `E3001`.
- `message`: `formatDiagnostic(diagnostic, locale, profile)`.
- `actions`: when `diagnostic.data` carries the checker's suggested replacement name
  (`data.suggestion`, set on E3001 with hint `suggest`), one action labelled
  `replaceWith(name)` from the string table that replaces the span with the name.
- `needsRefresh` returns true when the syntax tree of the update differs from the previous
  one, so a lint pass follows every completed parse and never runs on a stale tree.

Diagnostic hover tooltips and the lint gutter come from `@codemirror/lint` as the host
chooses; `stepcode()` includes `stepcodeLint` only.

### 5.3 Folding

`foldNodeProp` on `IfStmt`, `SwitchStmt`, `SwitchCase`, `WhileStmt`, `RepeatStmt`, `ForStmt`,
`SubprogramDecl`, `MainBlock`: `from` is the end of the line containing the node's start;
`to` is the start of the node's last child when that child is a closer keyword leaf, else the
node's end. Returns `null` when `from >= to` (single-line block, or a `SwitchCase` with an
empty body).

### 5.4 Indentation

`indentNodeProp` on the same nodes. For a line being indented inside node `n`:

```
dedent = the line's text after leading space starts with a keyword whose key is in dedentKeys(n)
return column(n.from) + (dedent ? 0 : unit)
```

`dedentKeys`: `IfStmt` → `elseIf else endIf`; `SwitchStmt` → `case otherwise endSwitch`;
`SwitchCase` → `case otherwise endSwitch`; `WhileStmt` → `endWhile`; `RepeatStmt` → `until`;
`ForStmt` → `endFor`; `SubprogramDecl` → `endProcedure endFunction`; `MainBlock` →
`endProgram`. The keyword test normalizes the leading words with `profile.normalize` and
looks them up in `profile.lookup`, longest match first up to `profile.maxWords` words, so
`Sino Si` and `Fin Si` both count. `column(n.from)` is the indentation of the line the
node starts on, so a block that is itself indented keeps its base.

With `indentOnInput` (included in `stepcode()`), typing a closer at the start of a line snaps
it back to the opener's column. The `indentOnInput` trigger regex is built from the profile:
every spelling of every dedent keyword, joined, anchored at line start.

### 5.5 Block matching

`stepcodeBlockMatching()` is `bracketMatching({ brackets: '()[]' })`. Keyword, parenthesis, and
bracket pairs all come from the tree props (§4.2); the `brackets` text config stays as the
fallback for text the tree does not type. `matchingBracket` and
`nonmatchingBracket` classes are the stock ones; the base theme (§8) styles them.

### 5.6 Completion

`stepcodeCompletion` registers a `CompletionSource` through the language's
`autocomplete` data, so a host that already installs `autocompletion()` gets it; `stepcode()`
also includes `autocompletion()` with `defaultKeymap: true`.

The source:

- Activates on `matchBefore(/[\p{L}_][\p{L}\p{N}_]*$/u)` with at least one character, or on
  explicit request. Returns `null` inside a `Comment` or `String` leaf.
- Candidates, in this order of `boost`:
  1. Symbols visible at the cursor: variables, constants, parameters (type `variable`,
     detail = the type spelled with the profile's type names, e.g. `Entero`, `Real[]`,
     `Caracter[,]`) and subprograms (type `function`, detail = `procedure`/`function` string,
     apply inserts `name()` with the cursor between the parentheses when the subprogram has
     parameters, after them otherwise). Visible means: the innermost body scope whose owner
     span contains the cursor, then its parents; only symbols declared before the cursor
     offset, except subprograms, which are visible everywhere. `label` is the declaration's
     `text` (original casing).
  2. Builtins: label is the profile's first spelling, type `function`, detail is the
     signature rendered as `(param, param) : result` with the string table's operand class
     names (`numeric` → `número`/`number`, …) and the profile's type names; apply inserts
     `Name()` with the cursor inside.
  3. Types: first spelling, type `type`.
  4. Keywords: first spelling, type `keyword`. Block openers apply a snippet (§5.7) instead
     of the bare word. `then`, `endIf`, and other non-opener keywords insert the word.
- Multi-word spellings insert the whole phrase.
- `validFor: /^[\p{L}_][\p{L}\p{N}_]*$/u`.

### 5.7 Block snippets

Keyword completions for `if`, `while`, `for`, `repeat`, `switch`, `function`, `procedure`,
and `program` apply `snippetCompletion` templates built from the profile's first spellings.
Fields use `${name}` placeholders and one `${}` final cursor position; body lines carry a
tab, which `snippet` re-indents to the line's indentation. Templates (shown with `es`
spellings):

```
Si ${condicion} Entonces
	${}
FinSi

Mientras ${condicion} Hacer
	${}
FinMientras

Para ${contador} <- ${inicio} Hasta ${limite} Hacer
	${}
FinPara

Repetir
	${}
Hasta Que ${condicion}

Segun ${valor} Hacer
	${caso}:
		${}
	De Otro Modo:
		
FinSegun

Funcion ${resultado} <- ${nombre}(${parametros})
	${}
FinFuncion

SubProceso ${nombre}(${parametros})
	${}
FinSubProceso

Proceso ${nombre}
	${}
FinProceso
```

The `for` template's step clause is omitted; the assign operator, `to`, and `do` are the
profile's first spellings. Under `assignWithEquals` the `for` and `function` templates use
`=`. Placeholder names come from the string table per locale.

`define`, `dimension`, `write`, `writeNoNewline`, `read`, `return`, `break`, `continue`,
`else`, and `elseIf` apply one-line statement snippets built the same way — `Definir
${variable} Como ${tipo};${}`, `Escribir ${mensaje};${}`, `Sino Si ${condicion}
Entonces\n\t${}` and so on — with the trailing `;` written only when the profile's
`requireSemicolons` is set. Every keyword, type, and builtin completion also carries
`Completion.info`: one plain sentence per key from the string table's `descriptions`, written
for a first-time reader in the locale's language, which the hover tooltip (§5.9) repeats under
the signature.

### 5.8 Signature help

`stepcodeSignatureHelp` is a `StateField<readonly Tooltip[]>` provided to `showTooltip`,
recomputed when the selection or the tree changes:

- Find the innermost `Call` or `BuiltinCall` node whose range contains the main cursor and
  whose `OpenParen` child starts before the cursor. No such node, or a cursor after the
  `CloseParen`, yields no tooltip.
- Active argument index: the number of `Punct` `,` leaves that are direct children of the
  call and end at or before the cursor.
- Content: for a builtin, `Name(p1, p2) : result` from `BUILTIN_SIGNATURES` rendered as in
  §5.6; for a user subprogram (via `calls`, then `SubprogramDecl`), the header text sliced
  from the source between the declaration's first token and the end of its parameter list,
  with each parameter's span known so the active one is wrapped in
  `<span class="cm-stepcode-signature-active">`. An unresolved call yields no tooltip.
- Tooltip `pos` is the `OpenParen` start, `above: true`, class `cm-stepcode-signature`.

### 5.9 Hover

`stepcodeHover` is `hoverTooltip((view, pos, side) => …)`:

- Identifier leaf (any of the four identifier types) at `pos`: look up `identifiers` in the
  tree data, then `result.symbols`. Content: `<kind> <name>: <type>` on the first line (kind
  from the string table: `variable`, `constante`, `parámetro`, `procedimiento`, `función`;
  for a parameter by reference, ` (por referencia)`), and `declaredAt(line)` on the second,
  from `LineMap.positionAt(symbol.declaredAt.span.start)`. No symbol → no tooltip.
- `BuiltinName` leaf: the signature line as in §5.8.
- Anything else → `null`.

Tooltip class `cm-stepcode-hover`. `hoverTime` stays at the default.

### 5.10 Go to definition

`goToDefinition(view)`: the identifier leaf at the main cursor (or touching it) resolves as in
§5.9; on success the selection moves to the declaration's span start, scrolled into view with
`EditorView.scrollIntoView(pos, { y: 'center' })`, and the command returns `true`; otherwise
`false`. `stepcodeKeymap` binds `F12`. A mouse gesture is deliberately not bound: Mod-click
adds a cursor in CodeMirror and Alt-click starts rectangular selection, so the host picks its
own gesture or a context-menu entry.

## 6. Debug extensions

Pure editor state; no import from the interpreter.

### 6.1 Breakpoints

- `breakpoints()`: a `StateField<RangeSet<GutterMarker>>` plus a `gutter` with class
  `cm-stepcode-breakpoints`. Markers render `<div class="cm-stepcode-breakpoint">`; the
  gutter's `lineMarker` also renders the current-line arrow (§6.2) when that field is
  present, so one gutter serves both.
- Clicking the gutter dispatches `toggleBreakpoint.of({ line })`; the effect removes a marker
  on that line or adds one. `setBreakpoints.of(lines)` replaces the set.
- The field maps through document changes with `RangeSet.map`; a marker whose line is deleted
  disappears; two markers that map onto the same line collapse to one.
- `breakpointLines(state)` returns the marker lines ascending, 1-based. A host reads it from
  an `updateListener` whenever `breakpointsChanged(update)` is true (exported helper: the
  field's value changed identity) and pushes it to its runtime.

### 6.2 Current line

- `currentLine()`: a `StateField<number | null>` (a document offset at the line start, or
  `null`), set by `setCurrentLine.of(line | null)` with a 1-based line, mapped through
  changes, and cleared when the mapped line no longer exists.
- Decorations: `Decoration.line({ class: 'cm-stepcode-current-line' })` on that line, and the
  gutter arrow `cm-stepcode-current-line-marker` via §6.1's gutter when both are installed
  (or via its own minimal gutter when only `currentLine()` is).
- The transaction that sets a non-null line also carries
  `EditorView.scrollIntoView(lineStart, { y: 'nearest' })`, which the host gets for free by
  dispatching the effect through `setCurrentLine` on a view: the extension appends the scroll
  effect from a `transactionExtender`.
- `currentLineOf(state)` returns the 1-based line or `null`.

## 7. `stepcode()` bundle

```ts
new LanguageSupport(stepcodeLanguage(profile), [
  stepcodeLint(o), stepcodeCompletion(o), stepcodeSignatureHelp(o), stepcodeHover(o),
  stepcodeBlockMatching(), autocompletion(), indentOnInput(), foldGutter(),
  keymap.of(stepcodeKeymap), stepcodeBaseTheme,
])
```

Not included, on purpose: a highlight style, the lint gutter, line numbers, history, the
default keymap. Those are host choices.

## 8. Base theme

`EditorView.baseTheme` with light and dark variants for: `.cm-stepcode-breakpoints` (gutter
width, cursor pointer), `.cm-stepcode-breakpoint` (a filled circle), `.cm-stepcode-current-line`
(a translucent yellow band), `.cm-stepcode-current-line-marker` (an arrow), `.cm-stepcode-hover`
and `.cm-stepcode-signature` (padding, monospace, `.cm-stepcode-signature-active` bold), and
`.cm-matchingBracket` / `.cm-nonmatchingBracket` inside our editor (outline instead of the
stock background so keyword pairs read as pairs).

## 9. Strings

`src/strings.ts`: `Record<locale, Strings>` for `es` and `en`, `stringsFor(locale)` with
fallback to `en` by primary subtag (`pt-BR` → `en` until someone adds `pt`). Keys: symbol kinds
(one per `SymbolKind` of the checker), `byReference`, `declaredAt`
(takes a line), `replaceWith` (takes a name), operand classes (`numeric`, `text`, `boolean`, `integer`,
`scalar`, matching `OperandClass` in the language package), `same` (for a builtin whose result type is
its argument's), snippet placeholders (`condition`, `value`, `name`, `parameters`, `result`,
`counter`, `start`, `limit`, `case`).

## 10. Testing

Vitest project `@stepcode/codemirror`, Node environment by default; view tests opt into
happy-dom with `// @vitest-environment happy-dom` at the top of the file.

- `tree.test.ts`: every `.stepcode` program under `packages/language/test/corpus/programs`
  and `guides` (read from the sibling package's directory, the same way its own tests do)
  builds a tree under `profileForCorpus`; assert: the tree's length is the document length,
  every significant token of `ParseResult.tokens` is covered by exactly one leaf, leaves
  appear in source order, no node's range escapes its parent, and every keyword leaf's name
  matches its token key. Plus small shape snapshots (`tree.toString()`) for one program per
  statement kind, and the placeholder cases: a missing identifier, an `ErrorStmt`, an empty
  `IfStmt` body.
- `highlight.test.ts`: `highlightTree` over small programs, asserting the ordered list of
  `(text, tag class)` pairs with `classHighlighter`.
- `lint.test.ts`: each guide program with an expected code yields one CodeMirror diagnostic
  with that `source`, a non-empty range, the formatted message; zero-width widening at line
  end and document end; the replace action applies. Runs `stepcodeDiagnostics(state)` for the mapping cases; the
  replace action needs an `EditorView`, so the file runs under happy-dom.
- `fold.test.ts`: `foldable(state, from, to)` ranges for each block kind, single-line block
  returns null, a `SwitchCase` with an empty body returns null.
- `indent.test.ts`: `getIndentation` after `Si x Entonces`, on a `Sino` line, on a `FinSi`
  line, nested blocks, `Caso` bodies, multi-word closers, an `en` profile.
- `matching.test.ts`: `matchBrackets` from `Si` finds `FinSi` and vice versa, skips a nested
  `Si`, reports `matched: false` for an unclosed block, parentheses still match.
- `completion.test.ts`: completions at positions in a program: visible variables with type
  details, a parameter inside its function only, a subprogram from main, builtins with
  signature detail, keywords, nothing inside a string or comment, snippet application text
  for each opener, `en` profile spellings.
- `signature.test.ts`: the field's tooltip for a builtin call at each argument index, for a
  user function, none outside the parentheses, none for an unknown callee.
- `hover.test.ts` (happy-dom): the hover source's returned tooltip DOM for a variable, a
  parameter by reference, a builtin, nothing on a keyword.
- `definition.test.ts`: `goToDefinition` moves the selection to the declaration for a
  variable used in main and for a call to a subprogram; returns false on a keyword.
- `debug.test.ts` (happy-dom): toggle, set, and read breakpoints; a marker follows its line
  through an insertion above and vanishes with a deletion; `setCurrentLine` decorates the
  line, maps through edits, clears on null; the gutter DOM shows the marker classes.
- `bundle.test.ts` (happy-dom): mount an `EditorView` with `stepcode()` and `debug()`,
  type a program, and assert the tree exists, a diagnostic is reported, and no extension throws.

TDD throughout; each task starts with its failing test.

## 11. Decisions log

- The compile result travels on the Lezer tree's top node rather than in a separate
  `StateField`: one compile per document version, scheduled by CodeMirror, and every feature
  reads one source of truth.
- Non-incremental parsing. Programs are small; correctness and simplicity win until a
  measurement says otherwise.
- Keyword leaves are typed per key so block matching and indentation can reason about
  openers and closers without text; identifier leaves are typed per role so highlighting can
  distinguish definitions, calls, and uses without a checker lookup.
- `IfBranch` is flattened, `SwitchCase` is a node (§4.4).
- Testing under Node and happy-dom, not Vitest browser mode, per the user's choice: no
  Playwright download in this package's CI; the editor adds end-to-end coverage later.
- The editor owns the worker; this package exports pure state and view extensions.
- No mouse binding for go to definition (§5.10).
- No highlight style, lint gutter, or line numbers in `stepcode()`: hosts differ.
- Round-trip strings live in this package, not in `stepcode`: the language package's
  catalogs are diagnostics only.

## 12. Amendments from planning and implementation

Decided while writing `plans/2026-09-04-codemirror.md`; the plan's "Deviations" section has
the reasoning.

- `CompileResult` gains `readonly tokens: readonly Token[]` (the tree builder needs the token
  stream; additive, `stepcode` patch changeset).
- `repeat`↔`until` is the only `Repetir` pair. `Repetir … Mientras Que` does not match:
  marking the `while` keyword as opened by `repeat` would make every ordinary `Mientras`
  report "no match", because the matcher answers from the first direction that resolves.
- Switch indentation (§5.4): `es` and `en` spell no `case` keyword, so a case line is
  recognised by the shape `valor:`; a case line sits one unit past `Segun`, its body two
  units, and a line after `De Otro Modo` two units.
- Debug markers map through changes with explicit line-survival logic rather than
  `RangeSet.map`, which would move a marker onto the next line when its own line is deleted.
- `stepcodeLanguage(profile)` is memoized per profile object, and the node set is extended per
  language with the profile-dependent props; names and ids in §4.2 are unchanged.
- The barrel exports the §3 list and nothing else; `treeDataAt`, `TreeData`, `stepcodeDiagnostics`,
  and `breakpointsChanged` were added to §3 because hosts need them. Node-set, block, snippet,
  symbol, hover, and signature helpers stay internal.
- Completion types (§5.6): constants complete with `type: 'constant'`, not `variable`, so a
  host's completion icons can tell them apart. A zero-parameter callable (`Azar`, a
  parameterless subprogram) applies `Name()` with the cursor *after* the parentheses; only a
  callable with parameters leaves the cursor inside.
- `breakpoints()` and `currentLine()` each include the base theme, so `debug()` installed
  without `stepcode()` renders visible markers; the theme is deduplicated when both are present.
- The barrel also exports `packageName` while the editor package is a stub that imports it to
  prove workspace resolution; it goes when the editor consumes the real language support.
