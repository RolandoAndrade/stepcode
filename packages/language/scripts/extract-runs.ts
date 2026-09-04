/**
 * One-off: turns the StepCode v1 test expectations into `<slug>.run.json` sidecars beside the
 * corpus programs (interpreter spec §8.2). `extract-corpus.ts` is NOT re-run — the checker
 * rewrites of sub-spec B were applied by hand on top of its output and would be lost — but the
 * slug rule is the same, so each v1 test lands beside the program it exercised.
 *
 * Run once from the repo root, review every sidecar it wrote, then commit:
 *   node --experimental-transform-types --conditions=development packages/language/scripts/extract-runs.ts
 *
 * Per v1 test it collects the input list, every asserted `output-request` string, every negated
 * one and `toBeCalledTimes(n)`; runs the v2 program with those inputs (seed 1 when it uses
 * `Azar` / `Aleatorio`); writes the produced output; and prints every assertion it could not
 * confirm. The v1 → v2 mapping is line-based: v1 emitted one `output-request` per `Escribir`
 * with no newline, v2 emits the same text plus `\n`, so each asserted string must equal one
 * line of the v2 output. v1 printed booleans as `true` / `false`; those two strings are
 * rewritten to `Verdadero` / `Falso` before comparing, and the programs it touched are listed.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { corpusIndexBaseZero, profileNamed, type SidecarRun } from '../test/helpers'
import { runSource, usesRandom } from './run-source'

const root = fileURLToPath(new URL('../test/corpus', import.meta.url))
const v1 = join(root, 'v1')
const out = join(root, 'programs')

const BLOCK = /\b(test|it|describe)\(\s*(['"])([\s\S]*?)\2/g
const PROGRAM = /`([^`]*)`/g
const LOOKS_LIKE_PROGRAM =
  /^\s*(?:\$|Proceso|Algoritmo|SubProceso|SubAlgoritmo|Procedimiento|Funcion)\b/im
const EXPECTATION =
  /(\.not)?\.toHaveBeenCalledWith\(\s*'output-request'\s*,\s*(['"])((?:\\.|(?!\2).)*)\2\s*\)/g
// The value's head, not the whole call: a computed value is whatever text follows this up to
// the end of its line. Matched separately from a plain-literal call (below) because a naive
// single regex with an optional-whitespace lookahead lets the engine backtrack the whitespace
// to zero width and slip past a quoted literal — this two-step form cannot.
const CALL_HEAD = /toHaveBeenCalledWith\(\s*'output-request'\s*,\s*/g
const TIMES = /toBeCalledTimes\((\d+)\)/
const INPUT_LIST = /const\s+inputs?\s*=\s*\[([\s\S]*?)\]/
const INPUT_IMPORTED = /resolve\(\s*([A-Za-z_]\w*)\[i\+\+\]/
const INPUT_LITERAL = /resolve\(\s*(['"])((?:\\.|(?!\1).)*)\1\s*\)/
const PROGRAM_REF = /internalInterpret\(\s*([A-Za-z_]\w*Program)\b/
// `examples.v1.ts` aliases two imported programs through a local `code` before calling
// `internalInterpret(code, ...)`, so `PROGRAM_REF` alone (which looks for the import's own
// name at the call site) never fires for their `test(...)` blocks.
const CODE_ALIAS = /const\s+code\s*=\s*([A-Za-z_]\w*Program)\b/

function unescapeLiteral(text: string): string {
  return text.replace(/\\([\s\S])/g, (_match, char: string) => {
    if (char === 'n') return '\n'
    if (char === 't') return '\t'
    if (char === 'r') return '\r'
    return char
  })
}

function slugify(title: string): string {
  return (
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'program'
  )
}

const used = new Map<string, number>()
function uniqueSlug(title: string): string {
  const base = slugify(title)
  const seen = used.get(base) ?? 0
  used.set(base, seen + 1)
  return seen === 0 ? base : `${base}-${seen + 1}`
}

/** `[1, 2, 'x']` with `//` comments → `['1', '2', 'x']`, stringified as v1's `toString()` did. */
function parseList(text: string): string[] {
  return text
    .replace(/\/\/[^\n]*/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const quoted = /^(['"])(.*)\1$/.exec(item)
      if (quoted?.[2] !== undefined) return unescapeLiteral(quoted[2])
      return Number.isNaN(Number(item)) ? item : String(Number(item))
    })
}

interface Block {
  readonly kind: string
  readonly title: string
  readonly body: string
}

function blocksOf(source: string): Block[] {
  const found: { kind: string; title: string; start: number }[] = []
  BLOCK.lastIndex = 0
  for (let match = BLOCK.exec(source); match !== null; match = BLOCK.exec(source)) {
    found.push({ kind: match[1] ?? 'test', title: match[3] ?? '', start: match.index })
  }
  return found.map((entry, index) => ({
    kind: entry.kind,
    title: entry.title,
    body: source.slice(entry.start, found[index + 1]?.start ?? source.length),
  }))
}

function programLiteralOf(body: string): string | undefined {
  PROGRAM.lastIndex = 0
  for (let match = PROGRAM.exec(body); match !== null; match = PROGRAM.exec(body)) {
    const literal = match[1]
    if (literal !== undefined && LOOKS_LIKE_PROGRAM.test(literal)) return literal
  }
  return undefined
}

interface Expectation {
  readonly name: string
  readonly inputs: string[]
  readonly repeat: boolean
  readonly lines: string[]
  readonly absent: string[]
  readonly times: number | null
  readonly computed: string[]
}

const BOOLEANS: Record<string, string> = { true: 'Verdadero', false: 'Falso' }
const booleanRewrites = new Set<string>()

function expectationOf(
  block: Block,
  slug: string,
  imported: ReadonlyMap<string, string[]>,
): Expectation {
  const body = block.body
  let inputs: string[] = []
  let repeat = false
  const list = INPUT_LIST.exec(body)
  const named = INPUT_IMPORTED.exec(body)
  const literal = INPUT_LITERAL.exec(body)
  if (list?.[1] !== undefined) inputs = parseList(list[1])
  else if (named?.[1] !== undefined && imported.has(named[1])) inputs = imported.get(named[1]) ?? []
  else if (literal?.[2] !== undefined) {
    inputs = [unescapeLiteral(literal[2])]
    repeat = true
  }
  const lines: string[] = []
  const absent: string[] = []
  EXPECTATION.lastIndex = 0
  for (let match = EXPECTATION.exec(body); match !== null; match = EXPECTATION.exec(body)) {
    let text = unescapeLiteral(match[3] ?? '')
    const rewritten = BOOLEANS[text]
    if (rewritten !== undefined) {
      text = rewritten
      booleanRewrites.add(slug)
    }
    if (match[1] === undefined) lines.push(text)
    else absent.push(text)
  }
  const computed: string[] = []
  CALL_HEAD.lastIndex = 0
  for (let match = CALL_HEAD.exec(body); match !== null; match = CALL_HEAD.exec(body)) {
    const rest = body.slice(match.index + match[0].length)
    if (rest.startsWith("'") || rest.startsWith('"')) continue
    computed.push(`${match[0]}${rest.split('\n')[0] ?? ''}`.trim())
  }
  const times = TIMES.exec(body)
  return {
    name: block.title,
    inputs,
    repeat,
    lines,
    absent,
    times: times?.[1] === undefined ? null : Number(times[1]),
    computed,
  }
}

// The two `v1/programs/*.program.ts` files export a program literal and, for one of them, the
// input arrays `examples.v1.ts` imports.
const importedPrograms = new Map<string, string>()
const importedInputs = new Map<string, string[]>()
const programsDir = join(v1, 'programs')
for (const file of readdirSync(programsDir)
  .filter((name) => name.endsWith('.ts'))
  .sort()) {
  const source = readFileSync(join(programsDir, file), 'utf8')
  // Closes on a `]` at the start of its own line: `insertInputs` and friends comment each
  // entry with `// array[1]`-style text, and a bare `[\s\S]*?\]` stops at that inner `]`.
  for (const match of source.matchAll(/export const (\w+)\s*=\s*\[([\s\S]*?)\n\]/g)) {
    if (match[1] !== undefined && match[2] !== undefined)
      importedInputs.set(match[1], parseList(match[2]))
  }
  const literal = /export const (\w+)\s*=\s*`/.exec(source)
  if (literal?.[1] !== undefined) {
    importedPrograms.set(literal[1], basename(file).replace(/\.(program\.)?ts$/, ''))
  }
}

const runsBySlug = new Map<string, Expectation[]>()
function addRun(slug: string, expectation: Expectation): void {
  const runs = runsBySlug.get(slug) ?? []
  runs.push(expectation)
  runsBySlug.set(slug, runs)
}

for (const file of readdirSync(v1)
  .filter((name) => name.endsWith('.v1.ts'))
  .sort()) {
  const source = readFileSync(join(v1, file), 'utf8')
  let current: string | undefined
  for (const block of blocksOf(source)) {
    if (programLiteralOf(block.body) !== undefined) current = uniqueSlug(block.title)
    else {
      const alias = CODE_ALIAS.exec(block.body)
      const aliased = alias?.[1] !== undefined ? importedPrograms.get(alias[1]) : undefined
      if (aliased !== undefined) current = aliased
    }
    if (block.kind === 'describe') continue
    const ref = PROGRAM_REF.exec(block.body)
    const slug = ref?.[1] !== undefined ? importedPrograms.get(ref[1]) : current
    if (slug === undefined) continue
    addRun(slug, expectationOf(block, slug, importedInputs))
  }
}
// Keep the slug numbering aligned with extract-corpus.ts, which emitted these last.
for (const slug of importedPrograms.values()) uniqueSlug(slug)

const zeroBased = new Set(corpusIndexBaseZero())
let written = 0
let mismatches = 0
const unconfirmed: string[] = []
const withoutExpectation: string[] = []

for (const [slug, expectations] of [...runsBySlug].sort(([a], [b]) => (a < b ? -1 : 1))) {
  const file = join(out, `${slug}.stepcode`)
  if (!existsSync(file)) {
    console.log(`withdrawn: ${slug} (no program file)`)
    continue
  }
  const source = readFileSync(file, 'utf8')
  const profile = profileNamed(zeroBased.has(slug) ? 'es0' : 'es')
  const seed = usesRandom(source) ? 1 : undefined
  const runs: SidecarRun[] = []
  for (const expectation of expectations) {
    const report = await runSource(source, profile, expectation.inputs, seed, expectation.repeat)
    if (report.outcome.kind !== 'done') {
      mismatches++
      console.log(`${slug} · ${expectation.name}: ${JSON.stringify(report.outcome)}`)
      continue
    }
    const lines = report.output.split('\n')
    if (lines[lines.length - 1] === '') lines.pop()
    for (const line of expectation.lines) {
      if (!lines.includes(line)) {
        mismatches++
        console.log(
          `${slug} · ${expectation.name}: expected a line ${JSON.stringify(line)}, got ${JSON.stringify(lines)}`,
        )
      }
    }
    for (const line of expectation.absent) {
      if (lines.includes(line)) {
        mismatches++
        console.log(`${slug} · ${expectation.name}: did not expect a line ${JSON.stringify(line)}`)
      }
    }
    if (expectation.times !== null && lines.length !== expectation.times) {
      mismatches++
      console.log(
        `${slug} · ${expectation.name}: expected ${expectation.times} lines, got ${lines.length}`,
      )
    }
    for (const computed of expectation.computed)
      unconfirmed.push(`${slug} · ${expectation.name}: ${computed}`)
    if (expectation.lines.length === 0 && expectation.times === null)
      withoutExpectation.push(`${slug} · ${expectation.name}`)
    const inputs = expectation.repeat
      ? Array.from({ length: report.requests }, () => expectation.inputs[0] ?? '')
      : expectation.inputs
    runs.push({
      name: expectation.name,
      inputs,
      output: report.output,
      ...(seed === undefined ? {} : { seed }),
    })
  }
  if (runs.length === 0) continue
  writeFileSync(join(out, `${slug}.run.json`), `${JSON.stringify({ runs }, null, 2)}\n`, 'utf8')
  written++
}

const programs = readdirSync(out).filter((name) => name.endsWith('.stepcode'))
const missing = programs.filter(
  (name) => !existsSync(join(out, name.replace('.stepcode', '.run.json'))),
)
console.log(`\n${written} sidecars written, ${mismatches} mismatches`)
console.log(
  `boolean rewrite (true/false → Verdadero/Falso) touched: ${[...booleanRewrites].sort().join(', ') || 'none'}`,
)
console.log(`computed expectations to confirm by hand:\n  ${unconfirmed.join('\n  ') || 'none'}`)
console.log(
  `runs recorded with no v1 assertion (review the output):\n  ${withoutExpectation.join('\n  ') || 'none'}`,
)
console.log(
  `programs still without a sidecar (record them with scripts/record-run.ts):\n  ${missing.join('\n  ') || 'none'}`,
)
