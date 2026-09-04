# v1 conformance corpus

The `.stepcode` files in this directory are the frozen StepCode v1 test corpus
(`test/corpus/v1/*.v1.ts` and `test/corpus/v1/programs/*.program.ts`), extracted into
standalone programs by `packages/language/scripts/extract-corpus.ts`. They are the
conformance seed consumed by `test/corpus/parse.test.ts` and by later sub-specs.

Do not hand-edit these files for cosmetic reasons, and do not edit `test/corpus/v1/`. To
change what the extractor produces, edit the extraction script and re-run it:

```
node packages/language/scripts/extract-corpus.ts
```

Two kinds of edit are made by hand, on purpose, and are listed below: the extraction
rewrites (applied by the script) and the checker rewrites (applied once, by sub-spec B, to
make every program check clean under the default profile).

## Rewrites applied during extraction

1. **`$ arrays@stepcode` directive stripping.** The legacy first line, where present,
   is dropped from the emitted program, and the program's slug is recorded in
   `index-base-0.txt` (one slug per line, sorted) so sub-spec C can re-parse those
   programs with `indexBase: 0`.
2. **`round(` → `Redondear(`, `random(` → `Azar(`.** v1-only builtin spellings that no
   profile defines.
3. **`longitud` → `cantidad`** (whole-word, case-insensitive, only when not
   immediately followed by `(`). Two v1 programs use `longitud` as a variable or
   parameter name, which collides with the `Longitud` (`length`) builtin spelling the
   `es`/`pseint` profiles reserve unconditionally — the lexer's keyword/builtin
   matching has no context-sensitive fallback to identifier. Real `Longitud(...)`
   builtin calls elsewhere in the corpus are left untouched by the `(` lookahead.

## `index-base-0.txt`

Lists the slugs (without the `.stepcode` extension) of programs that carried the
`$ arrays@stepcode` directive before extraction, so callers know which programs need
`indexBase: 0` to match v1's array-indexing behavior.

## Checker rewrites (sub-spec B)

Sub-spec B's rule is that every program here checks clean under the **default** profile
(`profiles.es`), not only under the lenient `pseint` one: a corpus that only passes with the
leniency turned on cannot show that the strict rules are right. Programs that relied on
leniency were rewritten, minimally — no program computes anything different than it did — and
every rewrite is listed here.

The rules, from the plan's Task 11 Step 6, are: 1 add the missing parameter type; 2 add the
missing `;`; 3 declare a `Para` counter the program never declared; 4 compare explicitly
(`Si a MOD 2` → `Si a MOD 2 <> 0`); 5 remove a `Definir` of a result variable the function
header already declares; 6 fix a `/` assigned to an `Entero`. Three more were needed and are
numbered on from there: 7 give a variable the type of the value it is given (rule 6's
"widen it" for a value that is not a `/`); 8 truncate explicitly where an `Entero` variable
is given a `Real` the program means as a whole number; 9 print the array element by element
with `Escribir Sin Saltar`, producing the same comma-joined line v1 printed, because §4.2
does not let the program write the array whole.

| Program | Rewrite | Why |
|---|---|---|
| `addition.stepcode` | `Ordenar`'s and `InvertirCadena`'s parameters get `Como Cadena`; the `Definir strInvertida` goes; the two sums of `ConvertirANumero` are wrapped in `Truncar` | rules 1, 5 and 8: the bodies already treat all three as text, the function header declares `strInvertida`, and `ConvertirANumero` is `Real` while `suma` counts digits |
| `array-operations.stepcode` | the seven `arreglo` parameters get `como Entero[]`; five bodies declare their `Para` counter; three statements get their `;` | rules 1, 2 and 3 |
| `bubble-sort.stepcode` | `i` and `j` are declared; `Escribir a` becomes a `Para` that writes `Escribir Sin Saltar ','` before every element but the first and `Escribir Sin Saltar a[i]` for each, then `Escribir ''` to end the line | rules 3 and 9: a whole array is never a value (§4.2), and the loop prints the same `1,12,15,16,42` line v1 printed |
| `equality-between-constant-and-variable.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `equality-between-variable-and-constant.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `fibonacci.stepcode` | `i` is declared | rule 3 |
| `greater-than-between-constant-and-variable.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `greater-than-between-variable-and-constant.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `greater-than-or-equal-between-constant-and-variable.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `greater-than-or-equal-between-variable-and-constant.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `inequality-between-constant-and-variable.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `inequality-between-variable-and-constant.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `less-than-between-constant-and-variable.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `less-than-between-variable-and-constant.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `less-than-or-equal-between-constant-and-variable.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `less-than-or-equal-between-variable-and-constant.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `print-characters-of-a-string.stepcode` | `i` is declared | rule 3 |
| `procedure-receives-parameters.stepcode` | `suma`'s parameters get `Como Entero` | rule 1: the only call passes two integers |
| `procedure-test-array-by-parameter.stepcode` | `cambio`'s `a` gets `Como Entero[]`; the main block declares `i`; `Escribir a` becomes the same comma-joined `Para` as in `bubble-sort` | rules 1, 3 and 9: the loop prints the same `10,30,40` line v1 printed |
| `procedure-test-by-reference.stepcode` | `swap`'s parameters get `Como Entero` | rule 1 |
| `procedure-test-by-value-and-reference.stepcode` | `swap`'s parameters get `Como Entero` | rule 1 |
| `test-assignation-function-with-parameters.stepcode` | `prueba`'s parameters get `Como Entero`; the `Definir valor` goes | rules 1 and 5 |
| `test-basic-assignation-function.stepcode` | the `Definir valor` goes | rule 5: the function header names `valor` |
| `test-basic-div-operation.stepcode` | `c` moves to its own `Definir c Como Real` | rule 6: the program means real division — `test-basic-integer-division-operation` is the `DIV` one |
| `test-basic-length.stepcode` | `b` moves out of the `Definir … Como Cadena` into its own `Definir b Como Entero` | rule 7: `b` is only ever given `Longitud(a)`, which is `Entero` |
| `test-left-greater-than-right-integer.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-left-greater-than-right-integer-2.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-left-less-than-right-integer.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-left-less-than-right-integer-2.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-missing-semicolon-at-line-2.stepcode` | the `Definir` on line 2 gets its `;` | rule 2 |
| `test-nested-while-statement-with-continue.stepcode` | `Si b MOD 2` becomes `Si b MOD 2 <> 0` | rule 4 |
| `test-return-value.stepcode` | `max`'s parameters get `Como Entero` | rule 1 |
| `test-right-greater-than-left-integer.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-right-greater-than-left-integer-2.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-right-less-than-left-integer.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-right-less-than-left-integer-2.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-simple-for-statement-with-continue.stepcode` | `Si a MOD 2` becomes `Si a MOD 2 <> 0` | rule 4 |
| `test-simple-repeat-until-statement-with-continue.stepcode` | `Si a MOD 2` becomes `Si a MOD 2 <> 0` | rule 4 |
| `test-two-different-integers.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-different-integers-2.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-equal-integers.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-equal-integers-2.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-equal-integers-3.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-equal-integers-4.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-equal-integers-5.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-two-equal-integers-6.stepcode` | `c` moves out of the `Definir … Como Entero` into its own `Definir c Como Logico` | rule 7: `c` is only ever given the result of a comparison, which is `Logico` |
| `test-while-statement-with-continue.stepcode` | `Si a MOD 2` becomes `Si a MOD 2 <> 0` | rule 4 |
| `upper-lower-case.stepcode` | `i` is declared | rule 3 |

`test-missing-semicolon-at-line-2.stepcode` keeps its name: what it stood for at the parser
level (a missing `;` under `requireSemicolons`) is covered by
`test/parser/diagnostics.test.ts`, which asserts E2001 directly.

### Withdrawn

Three programs were removed from this directory instead of being rewritten: no rewrite keeps
what they compute, because each one leans on v1 behaviour v2 does not have. What the checker
says about each is pinned in `test/checker/by-code.test.ts` instead, and the v1 originals stay
in `test/corpus/v1/` (`arrays.v1.ts`, `arithmetic-operations.v1.ts` and `subprograms.v1.ts`)
and in this repository's history.

| Program | Why it is gone |
|---|---|
| `test-length.stepcode` | Took `Longitud` of an array. v1 answered with the array's size; v2 gives the builtin a text parameter only (§6), so the call is E3037. |
| `test-basic-mod-operation-2.stepcode` | Took `MOD` of two `Real`s. v1 answered `1`; v2 gives `DIV` and `MOD` integer operands only (§4.3), so the operands are E3012. |
| `insert-into-array-procedure.stepcode` | Wrote a ten-slot array with one slot ever assigned. §5.6 makes writing an array whole E3009, and the element-by-element loop the other two programs use cannot reproduce v1's `1,,,,,,,,,`: that output depends on a v1 runtime printing an unassigned slot as empty, which v2 has not decided. E3009 is pinned by `by-code.test.ts`. |
