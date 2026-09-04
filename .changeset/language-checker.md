---
'stepcode': minor
---

The checker: scopes and symbols, a type model with assignability and constant folding, the
operator and builtin tables, per-statement rules, flow warnings, and `compile(source, {
profile })`, which parses and checks in one call. Diagnostics gain E3001–E3037 and
W3001–W3004 in Spanish and English, and `check` returns the type, symbol, call and scope
tables the interpreter and the editor read.

The test corpus grows too: `test/corpus/guides/` adds 52 clean programs written from the
course guides plus 32 one-mistake error programs, and two v1 corpus programs are withdrawn
(see `test/corpus/programs/README.md`).
