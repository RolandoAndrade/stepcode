# StepCode v2 — language sub-spec C: interpreter and run controller

Parent: [umbrella design](./2026-09-03-stepcode-v2-design.md) §3.2, §3.3, §3.4, §6, §7 item 3.
Previous: [sub-spec A](./2026-09-03-language-syntax-design.md) lexer, parser, AST;
[sub-spec B](./2026-09-04-language-checker-design.md) checker and diagnostics.
Next: sub-project 4, the editor shell, which drives this controller from a Web Worker.

## 1. Scope

This sub-spec delivers `start(program, options)`, the `Run` controller, and
`runProgram(program, options)` inside `packages/language`: a resumable tree-walking
interpreter in which every statement is one generator step, so breakpoints, stepping,
inspection and input are one mechanism (umbrella §3.2). It fixes the runtime policy sub-spec B
left open: bounds under `indexBase`, division by a non-constant zero, input parsing by target
type, stack depth, unassigned values, text comparison. Runtime errors are the E4xxx codes.

The interpreter trusts the checker. It reads `types`, `symbols` and `calls` from the
`CheckResult`, takes builtin arity and result types from `BUILTIN_SIGNATURES`
(`types/builtins.ts`), and implements only bodies. It checks what statics cannot and nothing
else: a program that `compile` passed with no error is never rejected for a static reason.

Decisions taken during the brainstorm (2026-09-04):

| Topic | Decision |
|---|---|
| `compile` result | Returns the checker's side tables as well; nobody re-runs `check`. |
| Core synchrony | The core is synchronous. Input is a step result, not an `io.read` callback: a refinement of umbrella §3.3, so a Web Worker or a test drives the run with no promise inside the evaluator. |
| Output | Synchronous and immediate through `io.write`. |
| Values | `Entero` and `Real` are JS numbers, text is a JS string, `Logico` a boolean, arrays a flat row-major buffer shared by reference. Unassigned is `undefined`. |
| Environment | One frame per active call, keyed by the checker's `Symbol` objects; no name lookup at runtime. |
| Numbers | `Entero` arithmetic stays in JS doubles; no overflow checking. |
| Determinism | Everything is a function of (source, profile, inputs, random sequence, limits). |
| Worker protocol | Sub-project 4's concern (umbrella §4.6); this spec only guarantees the controller can be driven by it. |

Non-goals: a bytecode VM, integer overflow detection, records, the timing precision of
`Esperar`, the terminal semantics of `Limpiar Pantalla`, and printing of non-finite `Real`
values (an `Infinity` or `NaN` a program computes prints as JS prints it).

## 2. Layout and public surface

```
packages/language/src/
  interpreter/
    value.ts         RuntimeValue, ArrayValue, Slot, cell slots
    frame.ts         Frame stack, slot creation from Scope.order, inspect()
    evaluate.ts      generator evaluator: statements, expressions, completions
    builtins.ts      the 22 builtin bodies
    input.ts         parsing of input text by target type (§5.7)
    render.ts        renderValue(value, type, profile) (§5.6)
    run.ts           start(), the Run controller, StepResult (§3)
    program.ts       runProgram() (§3.6)
    index.ts         re-exports
  compile.ts         CompileResult now carries the side tables (§7.1)
  checker/result.ts  nameOf fix (§7.2)
  diagnostics/       E4001–E4008 in codes, es, en
```

Public API added to `index.ts`:

```ts
interface CompileResult extends CheckResult {
  readonly ast: Program
  readonly source: string           // what was compiled; the controller maps offsets to lines
}

function start(program: CompileResult, options: RunOptions): Run
function runProgram(program: CompileResult, options: RunProgramOptions): Promise<RunOutcome>
function renderValue(value: RuntimeValue, type: Type, profile: ResolvedProfile): string

interface RunOptions {
  readonly profile: ResolvedProfile
  readonly io: { write(text: string): void; clear?(): void }
  readonly random?: () => number        // default Math.random; returns [0, 1)
  readonly limits?: { readonly stackDepth?: number }   // default 1000
}
```

Also exported as types: `Run`, `RunState`, `StepResult`, `InputRequest`, `Frame`,
`FrameVariable`, `RuntimeValue`, `Scalar`, `ArrayValue`, `RunProgramOptions`, `RunOutcome`.
`CompileResult.diagnostics` is the merged, sorted list of parser and checker diagnostics, as
today; `types`, `symbols`, `calls` and `scopes` are the checker's tables unchanged.

## 3. Run controller

### 3.1 `start`

`start(program, options)` throws a plain `Error` (not a diagnostic) when
`program.diagnostics` holds any error-severity diagnostic; warnings are fine. The message
names the first error code. Because every parser error is an error-severity diagnostic, a
started program has exactly one main block, no `extraMains`, no misplaced subprogram, no
`ErrorStmt` and no `ErrorExpr`: the evaluator never meets them and does not handle them.

`start` builds the main frame (§4.2) and returns a `Run` in state `ready`, positioned before
the first statement of main. It executes nothing.

### 3.2 `Run`

```ts
type RunState = 'ready' | 'paused' | 'input' | 'waiting' | 'done' | 'error'

interface Run {
  readonly state: RunState
  step(): StepResult                      // one statement; enters calls
  stepOver(): StepResult                  // one statement; calls run to completion
  stepOut(): StepResult                   // until the current frame returns
  continue(opts?: { budget?: number }): StepResult
  input(text: string): void               // only legal in state 'input'
  setBreakpoints(lines: Iterable<number>): void   // replaces the set
  inspect(): Frame[]                      // innermost first
}
```

States:

| State | Meaning | Legal commands |
|---|---|---|
| `ready` | started, nothing executed | `step`, `stepOver`, `stepOut`, `continue`, `setBreakpoints`, `inspect` |
| `paused` | stopped before a statement, or between the targets of a `Leer` after an accepted input | same as `ready` |
| `input` | a `Leer` target or `Esperar Tecla` is waiting for text | `input`; also `step`, `stepOver`, `stepOut`, `continue`, which re-report the pending request (§5.7); `setBreakpoints`, `inspect` |
| `waiting` | an `Esperar` was reached; the host sleeps, then resumes | same as `ready` |
| `done` | main ended | `inspect` (returns `[]`), `setBreakpoints` |
| `error` | a runtime diagnostic was raised | `inspect` (returns the frames at the error), `setBreakpoints` |

A command that is not legal in the current state throws a plain `Error`. `setBreakpoints`
and `inspect` are legal in every state.

### 3.3 Step results

```ts
type StepResult =
  | { kind: 'paused'; reason: 'step' | 'breakpoint' | 'budget'; line: number; frames: Frame[] }
  | { kind: 'input'; line: number; target: { name: string; type: Type } | null; rejected?: Diagnostic }
  | { kind: 'wait'; line: number; millis: number }
  | { kind: 'done' }
  | { kind: 'error'; diagnostic: Diagnostic; frames: Frame[] }

type InputRequest = Omit<Extract<StepResult, { kind: 'input' }>, 'kind'>
```

- `paused` is reported **before** the statement at `line` executes; `frames` is `inspect()`
  at that moment. `reason` says why the run stopped: the stepping command finished (`step`),
  a breakpoint was reached (`breakpoint`), or `continue`'s budget ran out (`budget`).
- `input`: `target` names the scalar being read and its static type — for an indexed target
  the element type, with the index expressions already evaluated (§5.7). `target: null` is
  `Esperar Tecla`. `rejected` is present when the previous `input()` did not parse: it is the
  E4004 diagnostic (§6), and the request is for the same target again.
- `wait`: `Esperar millis` was reached; `millis` is the evaluated value, negative clamped to
  0. The host sleeps, then calls `continue` or a step command; the statement is complete, so
  the run resumes at the next statement.
- `done`: main's body ended (or a bare `Retornar` in main was executed).
- `error`: the diagnostic and the frames at the point of failure, innermost first. The run is
  over; `inspect()` keeps returning those frames.

`line` is the 1-based line of the statement's `span.start`, computed with a `LineMap` built
once from `program.source`.

### 3.4 Stepping semantics

The evaluator is a tree of generator functions composed with `yield*` (§5.1). It yields
exactly once **before each statement executes**, with the statement's line: that is the
pause point. It also yields for an input request, a wait, and a user call (§5.5). Nothing
else yields: expressions run to completion between two pause points, except that a user call
inside an expression opens a new frame whose statements are pause points of their own.

Loops yield on their own line before every condition test, `Repetir` included (before the
test that follows each pass of the body): every iteration is at least one step, an empty
body cannot spin without yielding, and a breakpoint on a loop line hits once per iteration.
`Si` and `Segun` yield once, before evaluating the condition or the selector; the statements
of the chosen branch are steps of their own. `Definir`, `Constante`, `Dimension` and every
simple statement are one step each.

Commands, in terms of the frame depth `d` at the moment the command is issued:

| Command | Runs until |
|---|---|
| `step()` | the next pause point at any depth |
| `stepOver()` | the next pause point at depth ≤ `d` |
| `stepOut()` | the next pause point at depth < `d` (in main, that is `done`) |
| `continue(opts)` | a breakpoint, or `budget` statements have executed |

Every command also stops at an input request, a wait, an error, or the end of the program,
whichever comes first. `stepOver`, `stepOut` and `continue` stop at a breakpoint reached in
any frame; `step` stops at the very next pause point, so breakpoints add nothing to it. When
a command is issued from `ready`, the first statement of main executes (`step`) or execution
starts (`continue`); the position before the first statement is visible through
`inspect()`, not as a `paused` result.

A `paused` result's `reason` is `breakpoint` when the stop was at a breakpoint, `budget`
when `continue` ran out of budget exactly at this pause point, and `step` otherwise. When
both a breakpoint and a stepping condition hold at the same pause point, `breakpoint` wins.

### 3.5 Breakpoints and budget

A breakpoint is a line number. It matches a statement whose first line (the line of
`stmt.span.start`) equals it; a breakpoint on a line that holds no statement start never
hits. The run stops before that statement, on every visit — a loop body line hits every
iteration. A run resumed with `continue` from a pause point never stops on the statement it
resumes on: at least one statement executes before breakpoints are consulted again.

`continue({ budget: n })` executes at most `n` statements and returns
`{ kind: 'paused', reason: 'budget' }` at the next pause point once `n` have run. A pause
point is counted when it is passed, so a loop header re-test counts as one. Without `budget`,
`continue` runs until a breakpoint, an input, a wait, `done` or `error`. Hosts use the
budget to yield to the event loop; `runProgram` does exactly that.

### 3.6 `runProgram`

```ts
interface RunProgramOptions extends RunOptions {
  readonly io: {
    write(text: string): void
    clear?(): void
    read(request: InputRequest): Promise<string>
  }
  readonly signal?: AbortSignal
  readonly sleep?: (millis: number) => Promise<void>   // default: setTimeout
  readonly budget?: number                             // default 10_000 statements
}

type RunOutcome =
  | { kind: 'done' }
  | { kind: 'error'; diagnostic: Diagnostic; frames: Frame[] }
  | { kind: 'aborted' }
```

`runProgram` is `start` plus a loop over `continue({ budget })`:

- `paused/budget`: await one macrotask (`setTimeout(0)`) so the host's event loop runs, then
  continue.
- `paused/breakpoint` cannot occur: `runProgram` sets no breakpoints.
- `input`: `await io.read(request)`, then `run.input(text)`. When the text is rejected, the
  next `continue` returns the same request with `rejected` set, and it is passed to `read`
  again: the host sees why and re-asks. `Esperar Tecla` is a request with `target: null`;
  its answer is ignored.
- `wait`: `await sleep(millis)`, then continue. Tests pass a no-op `sleep`.
- `done` / `error`: return the outcome.

`signal` is checked before every `continue` and after every `await`; when it is aborted,
`runProgram` returns `{ kind: 'aborted' }` without executing further. No exception is
thrown for an abort.

### 3.7 Frames and inspection

```ts
interface FrameVariable {
  readonly name: string             // as declared: Symbol.name
  readonly kind: Symbol['kind']     // variable | parameter | result | constant | counter
  readonly type: Type
  readonly value: RuntimeValue | undefined
}

interface Frame {
  readonly name: string             // main block name, or the subprogram name
  readonly line: number
  readonly variables: readonly FrameVariable[]
}
```

`inspect()` returns one `Frame` per active call, innermost first. `variables` lists the body
scope's `Scope.order` — declaration order, which is how the checker keeps its output stable
— with each symbol's current slot value; the program scope holds only subprogram symbols and
is never listed. An array variable is inspected as its `ArrayValue` (flat data plus dims,
`undefined` holes) or `undefined` when not yet allocated. `line` is, for the innermost frame,
the line of the statement about to execute (or executing, in `input` and `waiting`); for an
outer frame, the line of the call statement in progress. A by-reference parameter shows the
value of the slot it aliases.

## 4. Values and environment

### 4.1 Value model

```ts
type Scalar = number | string | boolean
interface ArrayValue {
  readonly element: TypeKey
  readonly dims: readonly number[]      // one size per rank, all ≥ 1
  readonly data: (Scalar | undefined)[] // row-major, dims.reduce(*) cells
}
type RuntimeValue = Scalar | ArrayValue
```

`Entero` and `Real` are JS numbers; an `Entero` value is always integral because every
operation that produces an `Entero` produces an integer (§5.3, §5.8). `Cadena` and
`Caracter` are JS strings; a `Caracter` value holds exactly one code point. `Logico` is a
boolean. Arrays are one flat buffer, shared by reference: assigning an array element writes
through every alias. Unassigned is `undefined`, both in a scalar slot and in an array cell.

The cell of `a[i₁, …, iₙ]` under dims `[s₁, …, sₙ]` and `indexBase` `b` is
`offset = Σ (iₖ − b) · Π_{j>k} sⱼ`, after every `iₖ` has passed the bounds check of §5.4.

### 4.2 Frames and slots

```ts
interface Slot { value: RuntimeValue | undefined }
```

One frame per active call holds `Map<Symbol, Slot>`, keyed by the checker's `Symbol`
objects. An identifier node reaches its symbol through `program.symbols.get(id)` and its slot
through the frame map; no name is ever looked up at runtime. The slots of a frame are created
at frame entry, one per symbol of the body scope's `Scope.order`, all unassigned, except:

- **Parameters** are bound from the arguments (§5.5): a by-value scalar parameter gets a
  fresh slot holding a copy of the value; a `Por Referencia` scalar parameter's map entry
  **is** the caller's slot object (a variable's slot, or a cell slot); an array parameter's
  slot holds the caller's `ArrayValue` reference, whatever the modifier.
- **Constants** are filled at frame entry with `symbol.constValue.value`. The checker only
  declares a constant whose value folded (E3024 otherwise), so every `Constante` of a
  started program has one; the `ConstantStmt` itself is a no-op step.
- **The result variable** of a function (`symbols.get(decl.returnName)`, kind `result`) is a
  plain slot, unassigned until assigned. A `f(): T` function has no result variable; its
  value travels through `Retornar` only (§5.5).

A **cell slot** is a `Slot` whose `value` accessor reads and writes `array.data[offset]`;
it is what a by-reference argument `a[i]` binds to, so the callee writes into the caller's
cell. Cell slots are created per call and never stored anywhere else.

Frames form a stack. The frame at index 0 is main; its depth is 1. A call that would make
the stack deeper than `limits.stackDepth` (default 1000) fails with E4005 (§5.5).

## 5. Execution semantics

### 5.1 Evaluator shape

Statements and expressions are generator functions. A statement list runs its statements in
order; each statement generator yields the pause event first, then executes. A statement
generator returns a **completion**: `'normal'`, `'break'`, `'continue'` or `'return'`;
statement lists stop at the first non-normal completion and hand it up, loops consume
`break` and `continue`, and the frame consumes `return`.

Expressions are generator functions too, so a user call inside one can hand control to the
controller: a `Call` node yields a call event with the callee declaration and the evaluated
arguments; the controller pushes the frame and the callee's body generator, runs it, and
resumes the caller's generator with the returned value. User calls therefore never nest on
the JS stack — `stackDepth` is a policy limit, not a JS limit — and the controller always
knows the frame depth for `stepOver` and `stepOut`. Builtin calls and operators are plain
synchronous code reached through the expression generators.

The controller owns the event loop: it drives the innermost generator, interprets the events
(pause, input, wait, call, frame return), applies the stepping rule of §3.4, and produces
`StepResult`s. A runtime error is thrown inside the evaluator as an internal exception
carrying the diagnostic; the controller catches it, freezes the frames, and returns `error`.

### 5.2 Statements

| Statement | Semantics |
|---|---|
| `Definir` | Scalar: no-op (the slot exists since frame entry). Sized shorthand `Definir a Como T[3,3]`: allocates the array at this statement with the folded sizes, every cell unassigned; executing it again allocates a fresh array. Unsized: no-op. |
| `Dimension` | Evaluates each item's sizes, allocates a fresh array with every cell unassigned, stores it in the slot. Sizes are constants (E3023 makes any other size a checker error), so a size below 1 cannot come from a compiled program; the allocator still guards it with E4001 `size` at the size expression, as a defensive check (§6). |
| `Constante` | No-op: the slot was filled at frame entry (§4.2). |
| Assignment | Evaluates the value, then the target's indices (if any), checks bounds, stores. A `Real` target receiving an `Entero` stores the number as is; a `Cadena` target receiving a `Caracter` stores the string. |
| `Escribir` | Evaluates every argument left to right, renders each with §5.6, concatenates with no separator, appends `\n` unless `newline` is `false` (`Escribir Sin Saltar`), and calls `io.write` once with the result. |
| `Leer` | One input request per target, left to right (§5.7). |
| `Si` | Evaluates the branch conditions in order until one is `true` and runs that body; else the `Sino` body if present. |
| `Segun` | Evaluates the selector once, then the case values in source order; the first case one of whose values equals the selector (`===` on the scalar value, so a `Caracter` selector matches a one-character `Cadena` label) runs; else `De Otro Modo` if present. |
| `Mientras` | Yields, tests, runs the body while the condition is `true`. |
| `Repetir … Hasta Que c` | Runs the body, yields, tests: exits when `c` is `true` (`RepeatStmt.until === true`). |
| `Repetir … Mientras Que c` | Runs the body, yields, tests: continues while `c` is `true` (`until === false`, the parser's `while` closer). |
| `Para` | §5.9. |
| `Romper` / `Continuar` | Completion `break` / `continue`, consumed by the innermost enclosing loop of the current frame. `Segun` and `Si` are transparent to both. |
| `Retornar` | Bare: completion `return`; in main, the program is done. With a value, in a function: assigns the result (§5.5) and returns. |
| Call statement | Evaluates the call and discards a function's result. |
| `Limpiar Pantalla` | `io.clear?.()`. |
| `Esperar e` | Evaluates `e`, yields a `wait` event with `max(0, e)`. |
| `Esperar Tecla` | Yields an input request with `target: null`; any text is accepted and ignored. |

### 5.3 Operators

Operators follow `BINARY_TABLE` and `UNARY_TABLE` in `types/operators.ts` exactly; the
checker has already typed both operands, so the interpreter switches on the operator and the
static type from `program.types`, never on the runtime value.

| Operator | Runtime |
|---|---|
| `+ - *` numeric | JS `+ - *`. Both operands `Entero` gives an integral result; any `Real` gives a `Real`. |
| `+` text | Concatenation; `Caracter + Caracter` is a `Cadena`. |
| `/` | JS `/`, always `Real`. Divisor `0` is E4002. |
| `^` | JS `**`, always `Real`. |
| `DIV` | `Math.trunc(a / b)`. Divisor `0` is E4002. |
| `MOD` | `a - b * Math.trunc(a / b)`: the sign of the dividend, as JS `%` and as `fold` compute it. Divisor `0` is E4002. |
| unary `-` `+` | JS negation / identity. |
| `Y` `O` | Short-circuit: the right operand is not evaluated when the left decides. Both sides were typed by the checker, so skipping one changes nothing static. |
| `NO` | JS `!`. |
| `=` `<>` | Numbers numerically (`1 = 1.0` is `true`); text by string equality (`Caracter` against `Cadena` as text); booleans by value. |
| `< <= > >=` | Numbers numerically; text by UTF-16 code unit order (JS `<` on strings), `Caracter` against `Cadena` as text. |

E4002 is reported at the divisor expression's span (`expr.right.span`), the same span the
checker uses for a constant zero (E3025).

### 5.4 Indexing and unassigned reads

Every index of an `Index` node is evaluated left to right and checked against
`[indexBase, indexBase + size − 1]`, where `size` is the array's dim for that position or the
text's length. An index outside the range is E4001 at that index expression, with data
`{ name, index, low, high }`; a negative index is simply out of range. Indexing a text yields
the one-character string at that position. Indexing an array variable whose slot is
unassigned (no `Dimension` executed yet) is E4003 at the identifier, like any other
unassigned read.

Reading an unassigned scalar slot is E4003 at the identifier, data `{ name }`. Reading an
unassigned array cell is E4003 with hint `cell` at the `Index` node, data `{ name, index }`
where `index` is the indices rendered as `3` or `2, 3`. Reads happen when an identifier or
index is evaluated as a value: in expressions, as `Escribir` arguments, as by-value
arguments. Binding a by-reference argument does not read it. Writing an array or an
unassigned value to output is caught here, not in `Escribir`: a whole array never reaches the
runtime because E3009 rejects it statically.

### 5.5 Calls

1. Arguments are evaluated left to right. A by-value scalar argument is read (E4003 applies)
   and copied. A by-reference argument names a slot: a variable's slot, or a cell slot built
   from the array and the evaluated, bounds-checked indices. An array argument is the
   `ArrayValue` reference; an unallocated array is E4003 at the identifier.
2. If the stack already holds `limits.stackDepth` frames, E4005 at the call span, data
   `{ name, depth }` where `depth` is the limit.
3. A frame is pushed (§4.2) and the body runs; its statements are pause points.
4. A procedure returns nothing. A function returns the value of its result slot, or the value
   of the `Retornar v` that ended it. `Retornar v` assigns the result slot when the function
   has a result variable, then completes with `return`. Reaching the end of a function body
   with no result — the result slot unassigned, or a `f(): T` function that never executed
   `Retornar v` — is E4006 at the function's name span, reported in the frame that ended.
5. The frame is popped; the caller's generator resumes with the value.

Recursion is ordinary: each call is a frame.

### 5.6 Rendering

`renderValue(value, type, profile)` is used by `Escribir`, by `ConvertirATexto` and by hosts
for the variables panel:

| Type | Rendering |
|---|---|
| `Entero` | `String(n)`: a decimal integer. |
| `Real` | `String(n)`: JS shortest round-trip. An integral `Real` prints without a decimal point (`4 / 2` prints `2`), and very large or very small magnitudes print with an exponent as JS does (`1e21`). |
| `Logico` | `profile.keywords.true[0]` / `profile.keywords.false[0]` (`Verdadero` / `Falso` under `es`, `True` / `False` under `en`). |
| `Cadena`, `Caracter` | The string as is. |
| Array | Only reachable from `inspect()`: hosts render arrays themselves; `renderValue` throws for one. |

### 5.7 Input parsing

`Leer t₁, …, tₙ` issues one request per target, left to right. For an indexed target the
indices are evaluated and bounds-checked before the request, so a bad index is E4001 before
any text is asked for. The request carries `target.name` (the identifier text) and
`target.type`, the target's static type from `program.types` (the element type for an
`Index` node).

`input(text)` trims leading and trailing whitespace, then parses by `target.type`:

| Type | Accepted | Value |
|---|---|---|
| `Entero` | `/^[+-]?\d+$/` | `Number(text)` |
| `Real` | `/^[+-]?(\d+\.?\d*|\.\d+)$/` — dot only, integers accepted | `Number(text)` |
| `Logico` | any spelling in `profile.keywords.true` or `.false`, compared after `profile.normalize` on both sides | the boolean |
| `Caracter` | exactly one code point (`[...text].length === 1`) | the string |
| `Cadena` | any text, empty included | the string |

Whitespace is trimmed for every type, `Cadena` included. On success the value is stored in
the target's slot or cell and the state becomes `paused` (between targets, or after the last
one); the next command carries on with the next target's request or with the next statement.
On failure nothing is stored, the state stays `input`, and the next `step()` or
`continue()` returns the same request with `rejected` set to an E4004 diagnostic at the
target's span, data `{ name, type, text }` with `type` pre-rendered through `typeToString`
and the hint variant for the expected type (`integer`, `real`, `boolean`, `char`). Calling
`input()` again directly, without re-reading the request, is also allowed.

`Esperar Tecla` is a request with `target: null`; whatever text arrives is accepted.

### 5.8 Builtins

Arity and result types come from `BUILTIN_SIGNATURES`; the interpreter implements the 22
bodies. Arguments are evaluated left to right; a builtin never yields. `same`-typed builtins
(`abs`, `upper`, `lower`) return the argument's type, so `Abs` of an `Entero` stays integral.

| Key | Body | E4007 hint |
|---|---|---|
| `abs` | `Math.abs(x)` | — |
| `sqrt` | `Math.sqrt(x)` | `negative` when `x < 0` |
| `ln` | `Math.log(x)` | `nonPositive` when `x ≤ 0` |
| `exp` | `Math.exp(x)` | — |
| `sin` `cos` `tan` | `Math.sin/cos/tan(x)` | — |
| `asin` `acos` | `Math.asin/acos(x)` | `domain` when `|x| > 1` |
| `atan` | `Math.atan(x)` | — |
| `trunc` | `Math.trunc(x)` | — |
| `round` | Half away from zero: `Math.sign(x) * Math.round(Math.abs(x))`; `round(-1.5)` is `-2` | — |
| `random` | `options.random()`, a `Real` in `[0, 1)`; takes no argument | — |
| `randomBetween` | `a + Math.floor(options.random() * (b − a + 1))`, an `Entero` in `[a, b]` inclusive | `range` when `a > b` |
| `pi` | `Math.PI` | — |
| `length` | `[...s].length` (code points, as E3011 counts them) | — |
| `upper` `lower` | `toUpperCase()` / `toLowerCase()` | — |
| `substring` | `ini > fin` yields `""` with no bounds check; otherwise both positions must lie in `[indexBase, indexBase + length − 1]`, and the result is the code points from `ini` to `fin` inclusive | (a position out of range is E4001 at that argument, name = the text argument's name) |
| `concat` | `a + b` | — |
| `toNumber` | Trims, then the `Real` grammar of §5.7; yields a `Real` | `number` otherwise, data adds `text` |
| `toText` | `renderValue` (§5.6) | — |

E4007 is reported at the offending argument's span with data `{ builtin }` (the key, rendered
through the `{builtin:$builtin}` slot) plus `text` for the `number` variant. `random` and
`randomBetween` consume one value of `options.random` per call, in evaluation order, which is
what makes a run reproducible from a seeded generator.

The `substring` empty-range rule is what the corpus needs: `Subcadena(s, 1, i − 1)` with
`i = 1` and `Subcadena(s, i + 1, Longitud(s))` with `i = Longitud(s)` both appear in
`upper-lower-case.stepcode` and in the U5 guide programs, and both must yield `""`.

### 5.9 `Para`

`from`, `to` and `step` (default `1`) are evaluated once, in that order, before the first
iteration. A `step` equal to `0` is E4008 at the step expression, data `{ name }` (the
counter); the checker already rejects a constant zero (E3027), so this only triggers for a
computed zero. The counter is assigned `from` before the first test. The loop runs while
`counter ≤ to` for a positive step and `counter ≥ to` for a negative one; after each body
pass the counter is incremented by `step`. The header yields before each test (§3.4). When
the loop ends normally the counter holds the first failing value (`4` after `Para i <- 1
Hasta 3`); when it never runs it holds `from`; after `Romper` it holds the current value. The
counter is an ordinary variable afterwards, as the checker spec says.

## 6. Runtime diagnostics

### 6.1 Codes

Appended to `DIAGNOSTIC_CODES` in `diagnostics/codes.ts`, severity `error`, using the
existing `Diagnostic` shape (`code`, `severity`, `span`, `data`) and `formatDiagnostic`; the
`error` step result adds `frames` beside the diagnostic.

| Code | Meaning | Span | Data | Hints |
|---|---|---|---|---|
| E4001 | index out of range | the index expression | `name`, `index`, `low`, `high` | `size` (a `Dimension` size below 1: span the size expression, data `name`, `size`) |
| E4002 | division by zero | the divisor | `op` (operator spelling from the profile, as E3025) | — |
| E4003 | unassigned value read | the identifier, or the `Index` node | `name` | `cell` (data adds `index`) |
| E4004 | input rejected | the `Leer` target | `name`, `type` (pre-rendered), `text` | `integer`, `real`, `boolean`, `char` |
| E4005 | stack depth exceeded | the call | `name`, `depth` | — |
| E4006 | function ended without a result | the function's name in its header | `name` | — |
| E4007 | invalid builtin argument | the argument | `builtin`, `text` (number variant) | `negative`, `nonPositive`, `domain`, `range`, `number` |
| E4008 | `Para` step is zero | the step expression | `name` | — |

`name` for E4001 and E4003 is `nameOf` (§7.2) of the indexed expression, so `f()[9]` names
`f`. E4004 always carries a hint, since every rejectable type has one; `Cadena` never
rejects.

### 6.2 Catalog entries

Both catalogs gain every code and variant; `Record<DiagnosticCode, string>` keeps the
templates exhaustive so a missing entry fails typecheck. Drafts, in the style of the existing
entries:

`es`:

```
E4001: 'El índice {index} se sale de «{name}»: sus posiciones van del {low} al {high}.'
E4002: 'Esto divide entre cero: «{op}» recibió un divisor igual a 0.'
E4003: '«{name}» todavía no tiene valor: asígnale uno antes de usarla.'
E4004: 'La entrada «{text}» no sirve para «{name}», que es {type}.'
E4005: 'Demasiadas llamadas anidadas: «{name}» llegó a {depth} llamadas sin terminar. Revisa la condición de parada.'
E4006: 'La función «{name}» terminó sin devolver un valor: asigna el resultado o usa «{kw:return}».'
E4007: '«{builtin:$builtin}» no acepta este valor.'
E4008: 'El paso del bucle de «{name}» es 0: el bucle nunca terminaría.'

'E4001.size': '«{name}» no puede tener tamaño {size}: un arreglo necesita al menos una posición.'
'E4003.cell': '«{name}[{index}]» todavía no tiene valor: asígnale uno antes de usarlo.'
'E4004.integer': 'La entrada «{text}» no es un {type:integer}: escribe solo dígitos, con signo opcional, como «-12».'
'E4004.real': 'La entrada «{text}» no es un {type:real}: escribe un número con punto decimal opcional, como «3.5».'
'E4004.boolean': 'La entrada «{text}» no es un {type:boolean}: escribe «{kw:true}» o «{kw:false}».'
'E4004.char': 'La entrada «{text}» no cabe en un {type:char}: escribe exactamente una letra.'
'E4007.negative': '«{builtin:$builtin}» no acepta un número negativo.'
'E4007.nonPositive': '«{builtin:$builtin}» necesita un número mayor que 0.'
'E4007.domain': '«{builtin:$builtin}» solo acepta valores entre -1 y 1.'
'E4007.range': '«{builtin:$builtin}» necesita que el primer valor no sea mayor que el segundo.'
'E4007.number': '«{builtin:$builtin}» no pudo leer «{text}» como número.'
```

`en`:

```
E4001: 'Index {index} is outside "{name}": its positions run from {low} to {high}.'
E4002: 'This divides by zero: "{op}" received a divisor equal to 0.'
E4003: '"{name}" has no value yet: give it one before using it.'
E4004: 'The input "{text}" does not fit "{name}", which is {type}.'
E4005: 'Too many nested calls: "{name}" reached {depth} calls without returning. Check the stopping condition.'
E4006: 'Function "{name}" ended without a result: assign its result or use "{kw:return}".'
E4007: '"{builtin:$builtin}" does not accept this value.'
E4008: 'The step of the loop over "{name}" is 0: the loop would never end.'

'E4001.size': '"{name}" cannot have size {size}: an array needs at least one position.'
'E4003.cell': '"{name}[{index}]" has no value yet: give it one before using it.'
'E4004.integer': 'The input "{text}" is not an {type:integer}: type digits only, with an optional sign, like "-12".'
'E4004.real': 'The input "{text}" is not a {type:real}: type a number with an optional decimal point, like "3.5".'
'E4004.boolean': 'The input "{text}" is not a {type:boolean}: type "{kw:true}" or "{kw:false}".'
'E4004.char': 'The input "{text}" does not fit a {type:char}: type exactly one character.'
'E4007.negative': '"{builtin:$builtin}" does not accept a negative number.'
'E4007.nonPositive': '"{builtin:$builtin}" needs a number greater than 0.'
'E4007.domain': '"{builtin:$builtin}" only accepts values between -1 and 1.'
'E4007.range': '"{builtin:$builtin}" needs its first value to be no greater than its second.'
'E4007.number': '"{builtin:$builtin}" could not read "{text}" as a number.'
```

The `SLOT_BAG` of `test/diagnostics/format.test.ts` gains `index`, `low`, `high`, `size`,
`depth`, `type`; its literal `DIAGNOSTIC_CODES` list gains the eight codes.

## 7. Changes to existing code

### 7.1 `compile`

`CompileResult` becomes `CheckResult & { ast: Program; source: string }`: `compile` spreads
the `check` result, replaces `diagnostics` with the merged and sorted list exactly as today,
and adds `ast` and `source`. Nothing else changes; the checker spec's `{ ast, diagnostics }`
shape is a subset of the new one, so every existing caller keeps working.

### 7.2 `nameOf`

`nameOf` in `checker/result.ts` gains a `profile` parameter and two cases: a `Call` renders
as its callee's `text`, a `BuiltinCall` as `profile.builtins[key][0]` (the same "first
spelling" rule `typeToString` and `formatDiagnostic` use). Its three callers
(`reportAssignFailure`, `checkWrite` in `statements.ts`, `typeOfIndex` in `expressions.ts`)
pass `state.profile`. `Escribir f(x)` with an array-returning `f` then reports
`"f" is a whole array`, and `Longitud(s)[1]` reports `"Longitud" is not an array`, instead
of an empty name; the `own.length === 0` fallback in `reportAssignFailure` stays for
expressions that still have no name. The interpreter reuses `nameOf` for E4001 and E4003.

### 7.3 `index.ts`

Exports `start`, `runProgram`, `renderValue`, and the types of §2. `test/index.test.ts`
asserts the three functions are exported and runs one program end to end through
`compile` + `runProgram` with a stub `io`.

## 8. Testing and corpus

Test-driven, behaviour-first, in `packages/language/test/interpreter/`:

- **`operators.test.ts`, `builtins.test.ts`, `render.test.ts`, `input.test.ts`**: one test per row of §5.3, §5.6,
  §5.7 and §5.8, including every E4007 variant, `MOD` with a negative dividend, `4 / 2`
  printing `2`, `round(-1.5)` giving `-2`, `Logico` input under both spellings and both
  profiles, `Caracter` input rejecting two characters and accepting one astral code point,
  the `substring` empty-range rule and both of its out-of-range positions.
- **`statements.test.ts`**: one test per row of §5.2 and each rule of §5.9 (`from`/`to`/`step`
  evaluated once, counter after a normal end, after no iteration, after `Romper`), both
  `Repetir` closers, `Romper`/`Continuar` through `Segun`, `Segun` on a `Caracter` selector
  with one-character `Cadena` labels, `Dimension` re-execution, by-reference aliasing of a
  scalar and of a cell, by-value copy, arrays shared through a by-value parameter.
- **`by-code.test.ts`**: for every E4xxx, a program that triggers exactly that code at the
  expected span with clean neighbours, in the shape of `test/checker/by-code.test.ts`; its
  totality check covers the codes starting with `E4`. Every diagnostic renders in `es` and
  `en` with no unfilled slot. The `E4001.size` variant is exercised by calling the allocator
  directly, since no compiled program reaches it (§5.2).
- **`run.test.ts`, `program.test.ts`**: `step` N times asserting `frames` (names, lines, variables in `Scope.order`
  with `undefined` before assignment); a breakpoint inside a loop hitting every iteration and
  not hitting on resume; `stepOver` versus `step` on a call statement, `stepOut` from a
  recursive frame; the input rejection loop (`rejected` carried on the re-reported request,
  state staying `input`); `wait` then resume; `continue({ budget })` returning `budget`
  pauses and finishing when the budget exceeds the program; `runProgram` with an aborted
  `AbortSignal` returning `aborted`; `start` throwing on an error diagnostic and not on a
  warning; illegal commands throwing; determinism: two runs with the same seeded PRNG
  produce the same output, different seeds differ.
- **Property**: for every corpus program with a sidecar, driving the run to the end with
  `step()` (answering inputs from the sidecar) produces the same output as `runProgram`.

### 8.1 Run sidecars

Every `test/corpus/programs/<slug>.stepcode` and `test/corpus/guides/<slug>.stepcode` gets a
`<slug>.run.json`:

```json
{
  "runs": [
    { "name": "equilateral", "inputs": ["3", "3", "3"], "output": "Introduzca a, b y c\nTriangulo equilatero\n3\n", "seed": 1 }
  ]
}
```

`runs` holds one entry per input set (most programs have one; the v1 triangle and marathon
programs have several). `inputs` are the answers to the input requests in order, `Esperar
Tecla` consuming one entry like any other request; `output` is the exact concatenation of
every `io.write`; `seed` is required when the program calls `Azar` or `Aleatorio` and is the
32-bit seed of a mulberry32 generator living in `test/helpers.ts`, passed as `random`.
`name` is optional and only used in test titles. The profile is not in the sidecar: the
corpus harness keeps choosing `es`, or `es0` for the slugs in `index-base-0.txt`, as
`corpusPrograms()` does today; guides always run under `es`. `index-base-0.txt` stays.

`test/corpus/run.test.ts` runs each entry through `runProgram` with a no-op `sleep`, an `io`
that appends to a buffer and answers `read` from `inputs`, and asserts the outcome is `done`
and the buffer equals `output`. A request past the end of `inputs`, or a `rejected` request,
fails the test. A program without a sidecar fails the test too: the corpus is complete or it
is not.

### 8.2 Expected outputs

Nobody has recorded most expected outputs. The plan generates them by running the interpreter
and a human reviews every sidecar before it is committed; the v1 expectations are the ground
truth where they exist, with one documented exception below. Extraction is a sibling script,
`scripts/extract-runs.ts` — `extract-corpus.ts` is not re-run, since the checker rewrites of
sub-spec B were applied by hand on top of its output and would be lost.

`extract-runs.ts` reads the thirteen `test/corpus/v1/*.v1.ts` files and the two
`v1/programs/*.program.ts` files, pairs each program literal with the `test(` blocks that
follow it (the same slug rule as `extract-corpus.ts`), and collects per test: the input
list (`inputs = [...]`, `input = [...]`, a `resolve('…')` literal, or the imported
`insertInputs`/`deleteInputs`/`searchInputs` arrays, every value stringified as v1's
`toString()` did), every `toHaveBeenCalledWith('output-request', '…')` string, every
`not.toHaveBeenCalledWith` string, and `toBeCalledTimes(n)` when present. Expectations
written as expressions (`(2 * 3 / 5).toString()`, `expect.stringMatching`) are listed for
the reviewer instead of being parsed. The script then runs the v2 program with those inputs
(seed `1` when it uses `Azar` or `Aleatorio`), writes the sidecar with the produced output,
and prints the assertions it could not confirm.

The mapping from v1 to v2 output is line-based. v1's `Escribir` emitted one
`output-request` per statement with its arguments concatenated and no newline; v2 emits the
same text followed by `\n`. So each asserted v1 string must equal one line of the v2 output,
each negated string must equal no line, and when `toBeCalledTimes(n)` is present the v2
output has exactly `n` lines. v1 printed booleans as `true`/`false`; the script rewrites those
two strings to `Verdadero`/`Falso` before comparing, and `programs/README.md` gains a
"Runtime expectations" section listing that rewrite and every program it touched
(`boolean-operations`, `relational-operations` and `mixboolean-expressions` families). The
`bubble-sort` and `procedure-test-array-by-parameter` rewrites of sub-spec B already print
the same line v1 asserted.

The one exception: v1 asserted `round(-1.5)` prints `-1` (JS `Math.round`); §5.8 rounds
half away from zero and `test-round.run.json` records `-2`. The README lists it.

Withdrawn: `strings.v1.ts`'s "test reverse indexing" (`a[-1]`) is not a runnable corpus
program; its E4001 is pinned by `by-code.test.ts`. The three programs sub-spec B withdrew
stay withdrawn.

### 8.3 Guides

`guides/errors/` stays checker-only. A new `guides/runtime/` holds one program per E4xxx,
each with the `// expect: E4xxx` header of `guides/errors/` and, when it needs input, one
`// input: <text>` line per answer below it, in order (the text after the single space,
verbatim). `guides.test.ts` drives each with `start` and `continue`: an `input` request is
answered from the header lines, a `rejected` request or an `error` result ends the run, and
the collected codes must equal the header exactly. E4004 is the one program whose code comes
from `rejected` rather than from `error`.

The 52 guide programs get their sidecars the same way as the v1 corpus: the plan chooses
inputs that exercise each program's purpose (51 of them read input), the interpreter produces
the output, a human reviews it. `u6-menu-interactivo` uses `Esperar` (a no-op with the test
`sleep`) and `Esperar Tecla` (one input entry per press).

## 9. Decisions log

Details the brief left open, and what was chosen:

| Detail | Decision |
|---|---|
| Line numbers | `CompileResult` carries `source`; the controller builds one `LineMap` from it. `ParseResult` has no line map to reuse. |
| Frame boundary | User calls go through the controller (a call event), not through nested `yield*`: no JS recursion per user call, `stackDepth` is purely a policy limit, and the depth is always known. Statements and expressions inside a frame still compose with `yield*`. |
| Loop pause points | Loops yield on their line before every condition test, so every iteration is a step and an empty body cannot spin unobserved. |
| Resume on a breakpoint line | `continue` never stops on the statement it resumes from. |
| `step` from `ready` | Executes the first statement; the position before it is available through `inspect()`. |
| Accepted input | State becomes `paused` mid-statement; the next command carries on with the next target or the next statement. A rejected input leaves the state `input`; `input()` may be called again directly. |
| E4002 span | The divisor expression, the span E3025 uses; `Binary` nodes record no operator span. |
| `E4001.size` | Unreachable from a compiled program (E3023 folds every size); kept as a defensive guard in the allocator and tested by calling it directly. |
| Sized `Definir` and `Dimension` | Allocate when the statement executes; re-execution allocates afresh. Indexing an unallocated array is E4003. |
| `random` | Zero arguments, `Real` in `[0, 1)`, as `BUILTIN_SIGNATURES` declares; the brief's `random(n)` form does not exist in the signature table. |
| `substring` | `ini > fin` yields `""` before any bounds check, because the corpus relies on it; otherwise both positions are checked. |
| `length` | Counts code points, matching E3011's character count and `Caracter` input. |
| E4004 data | Adds `text`, the trimmed rejected input, so the message can quote it. |
| E4007 data | `builtin` plus `text` for the `number` variant; the reason travels as the hint. |
| `Escribir` | One `io.write` per statement, newline included. |
| Sidecar schema | `{ runs: [{ name?, inputs, output, seed? }] }`; no `profile` or `indexBase` field, the harness keeps deriving the profile and `index-base-0.txt` stays. |
| v1 extraction | A sibling script, `extract-runs.ts`; `extract-corpus.ts` is not re-run. |
| `round(-1.5)` | `-2` per §5.8; the v1 expectation `-1` is the one documented divergence. |
| Runtime guide inputs | `// input: <text>` header lines after `// expect:`. |
| Seeded PRNG | mulberry32 in `test/helpers.ts`, 32-bit seed. |
