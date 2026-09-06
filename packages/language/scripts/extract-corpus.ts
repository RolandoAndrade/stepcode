/**
 * One-off: turns the frozen StepCode v1 test corpus into committed `.stepcode` programs.
 *
 * Run once from the repo root, then commit its output:
 *   node packages/language/scripts/extract-corpus.ts
 * (Node >= 22.18 runs TypeScript directly; on an older Node use
 *  `node --experimental-strip-types packages/language/scripts/extract-corpus.ts`.)
 *
 * Four rewrites are applied, all recorded in the language sub-spec §8 and in
 * `test/corpus/programs/README.md`:
 *   - the legacy `$ arrays@stepcode` first line is dropped and its program is listed in
 *     `index-base-0.txt`, so sub-spec C can re-run it with `indexBase: 0`;
 *   - `round(` becomes `Redondear(` and `random(` becomes `Azar(`, the v1-only builtin
 *     spellings no profile defines;
 *   - a whole-word, case-insensitive `longitud` not immediately followed by `(` becomes
 *     `cantidad`: two v1 programs use `longitud` as a variable/parameter name, which
 *     collides with the `Longitud` (`length`) builtin spelling the es/pseint profiles
 *     reserve unconditionally. Real `Longitud(...)` builtin calls are left untouched.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../test/corpus', import.meta.url))
const v1 = join(root, 'v1')
const out = join(root, 'programs')

/** Titles and template literals, in source order. The v1 literals have no `${}` and no nesting. */
const TOKEN = /\b(?:test|it|describe)\(\s*(['"])([\s\S]*?)\1|`([^`]*)`/g

const LOOKS_LIKE_PROGRAM =
  /^\s*(?:\$|Proceso|Algoritmo|SubProceso|SubAlgoritmo|Procedimiento|Funcion)\b/im

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

const indexBaseZero: string[] = []

function emit(title: string, raw: string): void {
  let program = unescapeLiteral(raw)
  const slug = uniqueSlug(title)
  const lines = program.split('\n')
  if (/^\s*\$\s*arrays@stepcode\s*$/.test(lines[0] ?? '')) {
    indexBaseZero.push(slug)
    program = lines.slice(1).join('\n')
  }
  program = program
    .replace(/\bround\s*\(/g, 'Redondear(')
    .replace(/\brandom\s*\(/g, 'Azar(')
    .replace(/\blongitud\b(?!\s*\()/gi, 'cantidad')
  if (!program.endsWith('\n')) program += '\n'
  writeFileSync(join(out, `${slug}.stepcode`), program, 'utf8')
}

mkdirSync(out, { recursive: true })
for (const name of readdirSync(out)) {
  if (name.endsWith('.stepcode') || name === 'index-base-0.txt') {
    rmSync(join(out, name), { force: true })
  }
}

for (const file of readdirSync(v1)
  .filter((name) => name.endsWith('.v1.ts'))
  .sort()) {
  const source = readFileSync(join(v1, file), 'utf8')
  let title = basename(file, '.v1.ts')
  TOKEN.lastIndex = 0
  for (let match = TOKEN.exec(source); match !== null; match = TOKEN.exec(source)) {
    const [, , spokenTitle, literal] = match
    if (spokenTitle !== undefined) {
      title = spokenTitle
      continue
    }
    if (literal === undefined || !LOOKS_LIKE_PROGRAM.test(literal)) continue
    emit(title, literal)
  }
}

const programsDir = join(v1, 'programs')
for (const file of readdirSync(programsDir)
  .filter((name) => name.endsWith('.ts'))
  .sort()) {
  const source = readFileSync(join(programsDir, file), 'utf8')
  const match = /`([^`]*)`/.exec(source)
  if (match?.[1] === undefined || !LOOKS_LIKE_PROGRAM.test(match[1])) continue
  emit(basename(file).replace(/\.(program\.)?ts$/, ''), match[1])
}

writeFileSync(join(out, 'index-base-0.txt'), `${[...indexBaseZero].sort().join('\n')}\n`, 'utf8')

const written = readdirSync(out).filter((name) => name.endsWith('.stepcode'))
console.log(`${written.length} programs, ${indexBaseZero.length} of them index-base 0`)
