# `@stepcode/textmate` — design

Sub-project 6 of the StepCode v2 rewrite (umbrella: `2026-09-03-stepcode-v2-design.md`, §2, §6,
§7). Branch `RolandoAndrade/v2`. Consumes `@stepcode/profiles` only.

## 1. Goal

A TextMate grammar for StepCode generated from a resolved profile, so that Shiki (the academy
site, any docs site, any Markdown renderer built on Shiki) highlights StepCode the way the
editor does. The package is published as `@stepcode/textmate`. The academy today aliases
`stepcode` to Shiki's Pascal grammar as a stand-in; this package replaces that.

The grammar is generated, never hand-written, because keywords are profile data: `es`, `en`,
`pseint` and any user profile get a grammar from the same rules, and a spelling added to a
profile reaches the grammar without anyone editing a regex.

## 2. Scope

In: the generator, ready-made registrations for the three builtin profiles (as objects and as
committed JSON files), a Shiki-verified test suite, a README with the Shiki and Astro snippets,
the academy wiring.

Out: a VS Code extension or its `language-configuration.json`; block begin/end regions and
folding markers; any dependency on Shiki or on the `stepcode` language package at runtime;
publishing to npm (release, sub-project 7).

## 3. Public API

```ts
import type { ResolvedProfile } from '@stepcode/profiles'

/** A TextMate grammar as Shiki and VS Code consume it. Structurally a Shiki LanguageRegistration. */
export interface TextMateGrammar {
  name: string
  scopeName: string
  displayName?: string
  aliases?: string[]
  patterns: TextMateRule[]
  repository: Record<string, TextMateRule>
}

export interface TextMateRule {
  name?: string
  match?: string
  begin?: string
  end?: string
  captures?: Record<string, TextMateRule>
  beginCaptures?: Record<string, TextMateRule>
  endCaptures?: Record<string, TextMateRule>
  patterns?: TextMateRule[]
  include?: string
}

export interface GenerateOptions {
  /** Language id, the fence name in Markdown. */
  name: string
  /** `source.<...>`. */
  scopeName: string
  displayName?: string
  aliases?: string[]
}

export function generateGrammar(profile: ResolvedProfile, options: GenerateOptions): TextMateGrammar

/** `es`: name `stepcode`, scope `source.stepcode`, display name `StepCode`. */
export const stepcode: TextMateGrammar
/** `en`: name `stepcode-en`, scope `source.stepcode.en`, display name `StepCode (English)`. */
export const stepcodeEn: TextMateGrammar
/** `pseint`: name `stepcode-pseint`, scope `source.stepcode.pseint`, display name `StepCode (PSeInt)`. */
export const stepcodePseint: TextMateGrammar
/** The three above, for `langs: grammars`. */
export const grammars: readonly TextMateGrammar[]
```

`TextMateGrammar` is declared locally so the package has no Shiki dependency. A type-level test
with Shiki as a dev dependency asserts that `TextMateGrammar` is assignable to Shiki's
`LanguageRegistration`, so `createHighlighter({ langs: grammars })` type-checks for consumers.

The ready-made objects are built at module load from `profiles.es`, `profiles.en` and
`profiles.pseint`; generation is a few string joins, so there is no build-time cost worth a
cache. The same three grammars are also committed as `grammars/stepcode.json`,
`grammars/stepcode-en.json` and `grammars/stepcode-pseint.json` and exported as
`@stepcode/textmate/grammars/<name>.json` for consumers that read files rather than import
modules (a Shiki CLI config, a VS Code extension later).

Usage, Shiki:

```ts
import { createHighlighter } from 'shiki'
import { grammars } from '@stepcode/textmate'

const highlighter = await createHighlighter({ langs: grammars, themes: ['github-light'] })
highlighter.codeToHtml(source, { lang: 'stepcode', theme: 'github-light' })
```

Usage, Astro (`astro.config.mjs`):

```js
import { grammars } from '@stepcode/textmate'
export default defineConfig({ markdown: { shikiConfig: { langs: [...grammars] } } })
```

A custom profile:

```ts
import { resolveProfile } from '@stepcode/profiles'
import { generateGrammar } from '@stepcode/textmate'

const grammar = generateGrammar(resolveProfile(myProfileJson), {
  name: 'stepcode-mine',
  scopeName: 'source.stepcode.mine',
})
```

## 4. Generator

`generateGrammar` is data-driven: a scope table (§5) maps profile keys to scopes, and a regex
builder turns spellings into patterns. There is no template grammar with placeholders.

### 4.1 Words

The lexer treats a word as `[\p{L}_][\p{L}\p{N}_]*` and matches keywords, types and builtins
by longest match over up to `profile.maxWords` words, comparing normalized text. The grammar
mirrors that:

- **Boundaries.** Every word rule is wrapped in `(?<![\p{L}\p{N}_])` and `(?![\p{L}\p{N}_])`.
  `\b` is not used: its Unicode behaviour differs between the Oniguruma and JavaScript engines,
  and StepCode identifiers may contain `ñ` or accented letters.
- **Case.** When `options.caseSensitive` is `false` (the default), each word rule starts with
  `(?i)`. When `true`, no flag is emitted and spellings match exactly.
- **Accents.** When `options.foldAccents` is `true` (the default), the normalizer strips
  combining marks before lookup, so `Función` and `Funcion` are the same keyword. The builder
  first folds the spelling itself (same fold as the normalizer, `ñ` kept), then expands each
  letter that has accented forms into a character class: `a` → `[aàáâãä]`, `e` → `[eèéêë]`,
  `i` → `[iìíîï]`, `o` → `[oòóôõö]`, `u` → `[uùúûü]`, `c` → `[cç]`, `y` → `[yýÿ]`. Uppercase
  forms follow from `(?i)`; under `caseSensitive: true` the class holds the case of the spelling.
  Letters with rarer marks (macron, caron, ogonek) are accepted by the lexer and not by the
  grammar; this is a documented gap, not a bug to chase.
- **Whitespace.** A multi-word spelling joins its words with `[ \t]+`. The normalizer collapses
  any run of whitespace, so `Escribir   Sin Saltar` is a keyword in both.
- **Escaping.** Every spelling is regex-escaped before expansion. Profiles forbid `; , ( ) [ ]
  " '` in spellings and a leading digit, so escaping is only needed for characters such as `.`,
  `-` or `+` in a symbolic spelling.
- **Ordering.** Inside one alternation, spellings sort by word count descending, then by length
  descending, then alphabetically, so the generated regex is deterministic and the longest
  candidate is tried first.
- **Multi-word first.** All multi-word spellings, across every scope family, go into one rule
  placed ahead of every single-word rule. That rule is a single `match` whose alternation has one
  numbered capture group per scope family (`(?:(control alternation)|(definition
  alternation)|…)`), with `captures` assigning the family's scope to each group. TextMate resolves
  two rules matching at the same position by rule order, so `Sino Si` beats `Sino` and `Escribir
  Sin Saltar` beats `Escribir` regardless of which family each belongs to. Families with no
  multi-word spelling contribute no group.
- **Empty lists.** A key with no spelling (`case` in `es`/`en`) contributes nothing; a family
  whose keys are all empty emits no rule.

### 4.2 Symbols

- **Comment.** `operators.comment` (each spelling escaped, alternated) to end of line, as a
  `match`. Line comments only, matching the lexer.
- **Strings.** Two `match` rules: `"[^"]*(?:"|$)` and `'[^']*(?:'|$)`. Single line, no escapes;
  an unterminated string is highlighted as a string to the end of the line, the same colour the
  editor shows while the checker underlines it.
- **Numbers.** `(?<![\p{L}\p{N}_])\d+\.\d+(?![\p{L}\p{N}_])` as real, then
  `(?<![\p{L}\p{N}_])\d+(?![\p{L}\p{N}_])` as integer. No exponent, no sign, no hex, matching the
  lexer. A digit run glued to a letter (`12abc`) matches nothing, so it falls through
  unscoped, as an error would.
- **Operators.** Spellings come from `profile.operators` (all keys except `comment`) and from
  keyword spellings that contain no letter (`&`, `|`, `~`, `%` in `es`/`en`). A family's
  symbolic spellings (no letter, e.g. `<=`, `**`) are one `match` rule with an alternation
  sorted longest first, so `<=` is tried before `<` and `**` before `*`; symbol rules have no
  word-boundary wrapper. A family's letter-bearing spellings (`elevado`, `REM`) are matched the
  way the lexer matches an operator: as a whole word (`WORD_START`/`WORD_END`), exactly and
  un-normalized — case-exact and accent-exact whatever the profile's `caseSensitive` and
  `foldAccents` options say, never folded like a keyword. When a family has both kinds, its
  repository entry is `{ patterns: [word rule, symbol rule] }` with the word rule first; a
  family with only one kind keeps a single `{ name, match }` rule. Under `assignWithEquals:
  true` the profile spells `=` as both `assign` and `equal`; the grammar scopes it as
  comparison, which is what the lexer reports, and does not try to guess the statement.
- **Punctuation.** `(`, `)` → `punctuation.section.parens`; `[`, `]` →
  `punctuation.section.brackets`; `,` `:` → `punctuation.separator`; `;` →
  `punctuation.terminator`. Fixed set, same as the lexer's.

### 4.3 Light structure

Three heuristics that TextMate can express per line. They run after the keyword rules and
before the identifier fallback, and each one uses the same word regex `IDENT =
[\p{L}_][\p{L}\p{N}_]*` and the same boundaries as §4.1.

- **Subprogram and program names.** A rule per spelling family: `(function|procedure
  spellings)[ \t]+(?:(IDENT)[ \t]*(assign spellings)[ \t]*)?(IDENT)` with captures 1 →
  `storage.type`, 2 → `variable.other.definition`, 3 → `keyword.operator.assignment`, 4 →
  `entity.name.function`. And `(program spellings)[ \t]+(IDENT)` with 1 → `storage.type`, 2 →
  `entity.name.function`. Because these rules precede the plain keyword rules they must be
  listed before them in `patterns`; the keyword capture keeps the keyword's own scope.
- **Calls.** `(IDENT)(?=[ \t]*\()` → `entity.name.function.call`. Keyword, type and builtin
  rules are listed earlier, so `Si (x)` keeps `Si` as a control keyword and `Abs(x)` keeps
  `Abs` as a builtin.
- **Definitions.** `(define spellings)[ \t]+((?:IDENT[ \t]*,[ \t]*)*IDENT)` with capture 1 →
  `storage.type` and capture 2 carrying `patterns: [{ match: IDENT, name:
  variable.other.definition }]`, so every name in `Definir a, b, c Como Entero` is a
  definition. `Dimension` lists carry subscripts and are left to the identifier fallback.

Everything else that matches `IDENT` is `variable.other`.

### 4.4 Pattern order

`patterns` in the grammar body is a list of `include`s into the repository, in this order:
`comment`, `string`, `subprogram`, `program`, `definition`, `multiword`, `keyword-control`,
`keyword-definition`, `keyword-modifier`, `keyword-io`, `keyword-operator`, `boolean`, `type`,
`builtin`, `number`, `call`, `operator-assignment`, `operator-comparison`,
`operator-arithmetic`, `punctuation`, `identifier`. Rules absent for a profile are omitted from
both the repository and the list.

The three structural rules sit ahead of `multiword` because they capture a whole statement
head and scope the keyword inside it themselves; no builtin profile has a multi-word spelling
that starts with a `function`, `procedure`, `program` or `define` spelling. A custom profile
that does would lose the multi-word keyword's own colour on that line instead: the structural
rule matches first and consumes only the first word as its head, so the keyword's later words
fall through to whatever matches them next (typically `variable.other.definition` inside a
`subprogram`/`program` capture, or `entity.name.function` as the captured name), never the
multi-word keyword's scope.

## 5. Scopes

Every scope ends in `.stepcode`. The families mirror `packages/codemirror/src/nodes.ts` (the
`styleTags` table in the codemirror spec §5.1) so the academy and the editor colour the same
token the same way under any theme that styles the standard names.

| Family | Profile keys | Scope | CodeMirror tag |
|---|---|---|---|
| control | `if then elseIf else endIf switch case otherwise endSwitch while do endWhile for to step endFor repeat until break continue return` | `keyword.control.stepcode` | `controlKeyword` |
| definition | `program endProgram define as constant dimension procedure endProcedure function endFunction` | `storage.type.stepcode` | `definitionKeyword` |
| modifier | `byRef byValue` | `storage.modifier.stepcode` | `definitionKeyword` |
| io | `write writeNoNewline read clearScreen wait waitKey` | `keyword.other.io.stepcode` | `keyword` |
| word operator | `and or not mod div` (spellings with a letter) | `keyword.operator.word.stepcode` | `operatorKeyword` |
| boolean | `true false` | `constant.language.boolean.stepcode` | `bool` |
| type | `integer real string char boolean` | `support.type.primitive.stepcode` | `typeName` |
| builtin | all `BUILTIN_KEYS` | `support.function.builtin.stepcode` | `function(standard(variableName))` |
| integer | — | `constant.numeric.integer.stepcode` | `number` |
| real | — | `constant.numeric.real.stepcode` | `number` |
| string | — | `string.quoted.double.stepcode`, `string.quoted.single.stepcode` | `string` |
| comment | `comment` | `comment.line.stepcode` | `lineComment` |
| assignment | `assign` | `keyword.operator.assignment.stepcode` | `definitionOperator` |
| comparison | `equal notEqual lt le gt ge` | `keyword.operator.comparison.stepcode` | `compareOperator` |
| arithmetic | `plus minus times divide power`, plus letterless `and or not mod div` spellings | `keyword.operator.arithmetic.stepcode` | `arithmeticOperator` |
| parens, brackets | — | `punctuation.section.parens.stepcode`, `punctuation.section.brackets.stepcode` | `paren`, `squareBracket` |
| separator, terminator | — | `punctuation.separator.stepcode`, `punctuation.terminator.stepcode` | `separator` |
| subprogram name | — | `entity.name.function.stepcode` | `function(definition(variableName))` |
| call name | — | `entity.name.function.call.stepcode` | `function(variableName)` |
| defined variable | — | `variable.other.definition.stepcode` | `definition(variableName)` |
| identifier | — | `variable.other.stepcode` | `variableName` |

Why `storage.type` for definition keywords and `support.type.primitive` for type names: those
are the names the bundled Shiki themes style (`github-light`, `github-dark`, the ones the
academy uses); `keyword.declaration` and `entity.name.type` fall back to defaults in several of
them. A letterless spelling of a word operator (`&`, `%`) is scoped arithmetic rather than
word, because it reads as a symbol, and a theme that distinguishes the two would otherwise
colour `%` like the word `MOD`.

## 6. Package layout

```
packages/textmate/
├─ src/
│  ├─ index.ts        public exports, the three ready-made grammars
│  ├─ generate.ts     generateGrammar: assembles repository + patterns from the scope table
│  ├─ scopes.ts       the family → keys → scope table of §5
│  ├─ regex.ts        escape, accent classes, word/alternation builders
│  └─ types.ts        TextMateGrammar, TextMateRule, GenerateOptions
├─ scripts/generate.ts   writes grammars/*.json (run with `pnpm --filter @stepcode/textmate generate`)
├─ grammars/          stepcode.json, stepcode-en.json, stepcode-pseint.json (committed)
├─ test/              see §7
├─ README.md
└─ package.json       files: dist + grammars; exports "." and "./grammars/*.json"
```

`scripts/generate.ts` runs under Node 24's native type stripping with
`--conditions=development`, so it imports the workspace sources without a build. The script
writes with two-space indentation and a trailing newline; the freshness test compares parsed
JSON, not bytes.

Dev dependencies: `shiki` (tokenization tests, type assertion), `stepcode` (workspace, the lexer
conformance test), plus the catalog `tsdown`, `typescript`, `vitest`. Runtime dependency:
`@stepcode/profiles` only. Changeset: `@stepcode/textmate` minor, "First release".

## 7. Testing

TDD throughout; tests live in `packages/textmate/test/`.

- **`regex.test.ts`.** Escaping; accent classes (with and without `foldAccents`); case flag
  presence; multi-word joining; alternation ordering (longest first, deterministic).
- **`generate.test.ts`.** For a hand-built minimal profile: the repository contains exactly the
  expected rules, families with empty spellings are absent, the multi-word rule carries one
  capture per family that has one, `caseSensitive: true` emits no `(?i)`, `assignWithEquals`
  scopes `=` as comparison, a letterless keyword spelling lands in the arithmetic rule.
- **`grammars.test.ts`.** For each builtin profile, `JSON.parse(grammars/<name>.json)` deep-equals
  the generator's output. These committed files are the "snapshots per profile" of the umbrella
  spec; regenerate with the script and review the diff when the rules change.
- **`shiki.test.ts`.** `createHighlighter({ langs: grammars })` once per engine, JavaScript
  (`createJavaScriptRegexEngine({ forgiving: false })`, so unsupported syntax fails loudly) and
  Oniguruma (what Astro uses). Sample programs per profile (`test/samples/*.stepcode`, one per
  builtin profile plus one for a custom profile) are tokenized with `includeExplanation`, and a
  table of `(line, text) → deepest scope` expectations covers every family of §5, every
  multi-word keyword in the profile, a keyword prefixed by a longer keyword, accented spellings
  under `es`, a call, a subprogram with a return variable, a `Definir` list, an unterminated
  string, a number glued to a letter, and a keyword embedded in an identifier (`SiNoValido` is
  an identifier).
- **`lexer.test.ts`.** For the same samples and profiles, tokenize with the `stepcode` lexer and
  with Shiki; for every lexer token of kind `keyword`, `type`, `builtin`, `operator`,
  `identifier`, `integer`, `real`, `string`, `comment` or `punct`, the Shiki token covering the
  same offset must carry a scope of the matching family (a keyword may be any of the keyword
  families, an identifier any of the `variable.*`/`entity.*` scopes). Whitespace, newline and
  error tokens are skipped. This is the test that keeps the grammar honest as profiles change.
- **`types.test.ts`.** A `satisfies LanguageRegistration` assertion on `stepcode`, compiled by
  `tsc --noEmit` through `test/`.

Coverage target: every rule in §4 has at least one positive and one negative expectation.

## 8. Academy wiring

In `~/projects/academy` (its own git repository, no remote, deployed much later):

- `package.json`: `"@stepcode/textmate": "link:../stepcode/packages/textmate"`. The link
  resolves once `RolandoAndrade/v2` merges into the main checkout at `~/projects/stepcode` and
  the package is built; release (umbrella §7 step 7, "update the academy") replaces it with the
  published range.
- `astro.config.mjs`: import `grammars` from `@stepcode/textmate`, set
  `markdown.shikiConfig.langs: [...grammars]`, delete the `langAlias` and its comment.
- `README.md`: replace the "Known gaps" bullet about the Pascal stand-in with a note on the
  link and when it flips to npm.
- One commit in the academy repository.

The English lessons currently write Spanish keywords under ` ```stepcode `; they keep doing so
and highlight correctly. Switching them to ` ```stepcode-en ` with English keywords is content
work for the academy, not this sub-project.

## 9. Known limits

- Accent folding covers the Latin-1 marks listed in §4.1; other combining marks are accepted by
  the lexer only.
- A multi-word keyword split across lines is a keyword to the lexer only when the normalizer's
  whitespace collapse spans the newline; the grammar is line-based and never matches it.
- Structure is heuristic: a call is "identifier before `(`", a definition list stops at the
  first token that is not a name or comma. No folding, no block matching.
- Bare `generateGrammar` output for a profile whose spellings collide is undefined; profiles
  refuse to resolve such input first, so the generator never sees it.
- A type or builtin spelling with no letter (legal per the profile schema) gets no rule at all:
  symbolic spellings are supported only for operators and for the word-operator keywords (`&`,
  `|`, `~`, `%`), never for a bare-symbol type or builtin.
