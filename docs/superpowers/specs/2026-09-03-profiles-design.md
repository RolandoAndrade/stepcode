# `@stepcode/profiles` — design

Date: 2026-09-03
Status: approved in conversation. Sub-project 2 of the v2 plan
(`2026-09-03-stepcode-v2-design.md` §2, §3, §7).

## 1. Purpose

A profile is the data that gives the StepCode language its surface: how every construct,
type, operator and builtin is spelled, plus the options that change program meaning. The
language package parses against a resolved profile; the editor's grammar builder edits one;
the TextMate generator renders one. The construct set itself is fixed by the language — a
profile can rename, not reshape.

This package is pure data plus a schema and a resolver. No parsing, no runtime, no I/O.

## 2. Construct inventory

These are the keys. Every profile must spell each key (`case` may be empty).

### keywords

| Key | Meaning | `es` | `en` |
|---|---|---|---|
| program / endProgram | program block | Proceso, Algoritmo / FinProceso, FinAlgoritmo | Program / EndProgram |
| define / as | variable declaration | Definir / Como | Define / As |
| constant | constant declaration (`Constante x <- 5`) | Constante | Constant |
| dimension | array declaration | Dimension | Dimension |
| if / then / elseIf / else / endIf | conditional | Si / Entonces / Sino Si / Sino / FinSi | If / Then / ElseIf / Else / EndIf |
| switch / case / otherwise / endSwitch | multi-branch | Segun / (none) / De Otro Modo / FinSegun | Switch / (none) / Otherwise / EndSwitch |
| while / do / endWhile | pre-test loop (`do` is shared with `switch`) | Mientras, Mientras Que / Hacer / FinMientras | While / Do / EndWhile |
| for / to / step / endFor | counted loop | Para / Hasta / Con Paso / FinPara | For / To / Step / EndFor |
| repeat / until | post-test loop | Repetir / Hasta Que | Repeat / Until |
| break / continue | loop control | Romper / Continuar | Break / Continue |
| procedure / endProcedure | subprogram without result | SubProceso, SubAlgoritmo, Procedimiento / FinSubProceso, FinSubAlgoritmo, FinProcedimiento | Procedure / EndProcedure |
| function / endFunction / return | subprogram with result | Funcion / FinFuncion / Retornar | Function / EndFunction / Return |
| byRef / byValue | parameter passing | Por Referencia / Por Valor | ByRef / ByValue |
| write / writeNoNewline / read | console I/O | Escribir, Mostrar, Imprimir / Escribir Sin Saltar, Mostrar Sin Saltar / Leer | Write, Print / WriteNoNewline / Read |
| clearScreen / wait / waitKey | console control (no-ops outside a console host) | Limpiar Pantalla, Borrar Pantalla / Esperar / Esperar Tecla | ClearScreen / Wait / WaitKey |
| and / or / not / mod / div | logical, modulo and integer-division operators spelled as words | Y, & / O, \| / No, ~ / MOD, % / DIV | And, & / Or, \| / Not, ~ / Mod, % / Div |
| true / false | boolean literals | Verdadero / Falso | True / False |

`case` is empty by default because PSeInt's `Segun` branches are `valor, valor: …` with no
keyword; a profile may set one (`Caso`) to require it.

### types

| Key | `es` | `en` |
|---|---|---|
| integer | Entero | Integer |
| real | Real | Real |
| string | Cadena, Caracteres, Texto | String, Text |
| char | Caracter | Char |
| boolean | Logico | Boolean |

Arrays are syntax (`Dimension`, `Entero[3]`), not a named type.

### operators

| Key | Spellings (same in every shipped profile) |
|---|---|
| assign | `<-`, `←` |
| equal | `=` |
| notEqual | `<>`, `!=`, `≠` |
| lt / le / gt / ge | `<` / `<=`, `≤` / `>` / `>=`, `≥` |
| plus / minus / times / divide / power | `+` / `-` / `*` / `/` / `^`, `**` |
| comment | `//` |

`==` is deliberately not an equality spelling; the parser reports it with a fix hint.
Punctuation (`,` `;` `:` `(` `)` `[` `]`) is fixed by the language and not in profiles.

### builtins

| Key | `es` | `en` | Note |
|---|---|---|---|
| abs, ln, exp | Abs, Ln, Exp | Abs, Ln, Exp | |
| sqrt | RC, Raiz | Sqrt | |
| sin, cos, tan, asin, acos, atan | Sen, Cos, Tan, ASen, ACos, ATan | Sin, Cos, Tan, ASin, ACos, ATan | |
| trunc, round | Trunc, Truncar / Redon, Redondear | Trunc / Round | |
| random | Azar | Random | `Azar(n)`: 0 ≤ x < n |
| randomBetween | Aleatorio | RandomBetween | `Aleatorio(a, b)`: a ≤ x ≤ b |
| pi | PI | PI | constant |
| length, upper, lower | Longitud, Mayusculas, Minusculas | Length, Upper, Lower | `length` also applies to arrays |
| substring, concat | Subcadena, Concatenar | Substring, Concat | |
| toNumber, toText | ConvertirANumero, ConvertirATexto + ConvertirACadena | ToNumber, ToText | |

Semantics of builtins live in the language package; profiles only spell them.

### options

| Option | Default | Effect |
|---|---|---|
| indexBase | 1 | first array index |
| caseSensitive | false | keyword/identifier matching |
| foldAccents | true | `Función` ≡ `Funcion` when matching keywords, types, builtins (identifiers keep accents) |
| implicitDeclarations | false | PSeInt flexible mode: variables spring into existence at first assignment, type inferred then fixed |
| requireSemicolons | true | statements must end with `;` |
| typedParameters | true | subprogram parameters and results must carry `Como <type>` |
| assignWithEquals | false | `x = expr;` in statement position is an assignment |

### Removed from v1 for good

`writeln`/`Escribirln`, `Var`, `div`, `goto`/`label`, `unit`/`uses`/`interface`/`implementation`,
`packed`/`record`/`set`/`file`/`nil`/`with`, `(.` `.)`, `**`, `:=`, `#` comments, the English
aliases mixed into the Spanish grammar (a profile is one language).

## 3. Schema

```ts
type Spellings = readonly string[]           // ≥ 1 entry, except keywords.case

interface ProfileData {
  id: string                                 // 'es' | 'en' | 'pseint' | user-chosen
  extends?: string                           // id of a registered profile
  locale: string                             // BCP-47 tag; catalog resolution is the language's job
  keywords:  Record<KeywordKey, Spellings>
  types:     Record<TypeKey, Spellings>
  operators: Record<OperatorKey, Spellings>
  builtins:  Record<BuiltinKey, Spellings>
  options:   ProfileOptions                  // table above; all optional in input, all present when resolved
}
```

- Key lists (`KEYWORD_KEYS`, `TYPE_KEYS`, `OPERATOR_KEYS`, `BUILTIN_KEYS`) are `as const`
  tuples; the TypeScript types and the Zod 4 schema derive from them, so adding a construct
  is one edit.
- Input schema (`ProfileInputSchema`) accepts partial profiles when `extends` is set;
  `ResolvedProfileDataSchema` requires everything.
- `profileJsonSchema` is exported (via Zod's `toJSONSchema`) for `$schema` in user files and
  for the editor's grammar builder.
- `locale` is validated for shape only (`/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/`). Unknown locales
  are the language's concern (fallback chain `pt-BR → pt → en`, with `registerCatalog`).

## 4. Resolution

`resolveProfile(input: unknown, registry = builtinProfiles): ResolvedProfile`

1. Parse `input` with `ProfileInputSchema`.
2. If `extends`, look up the parent in `registry` (built-ins plus anything the caller adds),
   resolve it recursively (unknown parent → `PROFILE_UNKNOWN_PARENT`; max depth 8, exceeded → `PROFILE_DEPTH`; a cycle → `PROFILE_CYCLE`), then merge: the child
   replaces **per key** (`keywords.if` replaces that array only), `options` merge field by
   field, `locale` and `id` come from the child.
3. Fill option defaults.
4. Normalize spellings: trim, collapse internal whitespace to one space, drop duplicates.
5. Validate:
   - every key present with ≥ 1 spelling (`case` exempt) → `PROFILE_MISSING_SPELLING`
   - no spelling empty or containing `;` `,` `(` `)` `[` `]` `"` `'` or a digit-leading token → `PROFILE_INVALID_SPELLING`
   - **no collisions**: after applying `caseSensitive`/`foldAccents` normalization, a
     spelling may belong to exactly one of keywords ∪ types ∪ builtins; operators are checked
     among themselves → `PROFILE_COLLISION` (names both keys)
6. Return a frozen `ResolvedProfile`:
   - the merged data, no `extends`
   - `lookup: ReadonlyMap<string, { kind: 'keyword' | 'type' | 'builtin', key: string }>` keyed by
     normalized spelling — the lexer's single table
   - `operatorLookup: ReadonlyMap<string, OperatorKey>`
   - `maxWords: number` — longest multi-word spelling, for longest-match lexing
   - `normalize(text: string): string` — the same function the resolver used, so the lexer
     and the profile never disagree

Errors are `ProfileError` (`code`, `message`, `path: string[]`), thrown; the editor catches
and renders them inline. Never throws for `extends` on a registered profile with no changes:
`resolveProfile({ id: 'x', extends: 'es' })` is valid and identical to `es` except `id`.

## 5. Shipped profiles

- `es.json` — the table above, all options default.
- `en.json` — the English column, all options default.
- `pseint.json` — `{ "id": "pseint", "extends": "es", "options": { "requireSemicolons": false, "implicitDeclarations": true, "typedParameters": false } }`.

JSON is the authoring format (users write JSON). The package imports the three files at
build time and exports them typed: `profiles.es`, `profiles.en`, `profiles.pseint` (already
resolved) and `builtinProfiles` (the registry). `defaultProfile` is `es`.

## 6. Package API

```ts
export { KEYWORD_KEYS, TYPE_KEYS, OPERATOR_KEYS, BUILTIN_KEYS }
export type { KeywordKey, TypeKey, OperatorKey, BuiltinKey, ProfileData, ProfileInput, ProfileOptions, ResolvedProfile }
export { ProfileInputSchema, ExtendingProfileSchema, RootProfileSchema, ResolvedProfileDataSchema, profileJsonSchema }
export { resolveProfile, ProfileError }
export { profiles, builtinProfiles, defaultProfile }
```

Dependencies: `zod` only. `sideEffects: false`. The JSON files ship inside `dist` (bundled by
tsdown) — nothing is read from disk at runtime.

## 7. Tests

- Schema: accepts each shipped JSON; rejects an unknown key, a missing key, a non-array
  spelling, a bad locale tag.
- Resolution: `extends` chain of depth 2 merges per key; cycle detected; unknown parent is
  `PROFILE_UNKNOWN_PARENT`; option defaults filled; `pseint` resolves to `es` plus its three
  options.
- Normalization: whitespace collapse, dedupe, `foldAccents` (`Función` → `funcion`), case
  folding on/off, identifiers untouched (that is the language's job, but the exported
  `normalize` is tested here).
- Collisions: keyword vs type, keyword vs builtin, two keywords, operator vs operator; a
  collision that only appears after folding (`Si` vs `sí`) is caught when folding is on and
  allowed when it is off.
- Lookup: every spelling of every shipped profile resolves to its key; `maxWords` is 3 for
  `es` (`Escribir Sin Saltar`); `lookup` size equals the number of distinct normalized
  spellings.
- Snapshot of `profileJsonSchema` so schema drift is a visible diff.

TDD throughout, per the repository's testing rule.
