---
'stepcode': minor
---

The interpreter: `start(program, options)` returns a resumable `Run` that executes one
statement per step, with breakpoints, `stepOver` / `stepOut`, a statement budget, frame
inspection and input as step results; `runProgram(program, options)` drives it to the end
with async input, sleep and an `AbortSignal`. Runtime errors are E4001–E4008 in Spanish and
English. `compile` now returns the checker's side tables and the source, and the corpus
programs gain `.run.json` sidecars pinning their output for given inputs.
