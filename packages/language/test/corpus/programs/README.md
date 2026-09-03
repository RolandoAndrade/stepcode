# v1 conformance corpus

The `.stepcode` files in this directory are the frozen StepCode v1 test corpus
(`test/corpus/v1/*.v1.ts` and `test/corpus/v1/programs/*.program.ts`), extracted into
standalone programs by `packages/language/scripts/extract-corpus.ts`. They are the
conformance seed consumed by `test/corpus/parse.test.ts` and by later sub-specs.

Do not hand-edit these files or `test/corpus/v1/`. To change the corpus, edit the
extraction script and re-run it:

```
node packages/language/scripts/extract-corpus.ts
```

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
