/**
 * Records one run of a corpus program into its `<slug>.run.json` sidecar (interpreter spec
 * §8.2, §8.3). The interpreter produces the output; a human reads it against the program
 * before committing. From the repo root:
 *
 *   node --experimental-transform-types --conditions=development \
 *     --import ./packages/language/scripts/register.mjs packages/language/scripts/record-run.ts \
 *     <programs|guides> <slug> [--name <text>] [--seed <n>] [--replace] [--input <text>]...
 *
 * (`register.mjs` lets plain Node resolve this codebase's extensionless imports; see its
 * header for why.)
 *
 * `--input` repeats, one per input request in order (`Esperar Tecla` takes one too). `--seed`
 * is required when the program calls `Azar` or `Aleatorio` (default 1 then). `--replace`
 * drops the runs already in the sidecar; otherwise the run is appended. The produced output is
 * printed between `--- output ---` markers for review, and a run that does not end in `done`
 * writes nothing and exits 1.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { corpusIndexBaseZero, profileNamed, type Sidecar, type SidecarRun } from '../test/helpers'
import { runSource, usesRandom } from './run-source'

const root = fileURLToPath(new URL('../test/corpus', import.meta.url))

function usage(message: string): never {
  console.error(message)
  console.error(
    'usage: record-run.ts <programs|guides> <slug> [--name <text>] [--seed <n>] [--replace] [--input <text>]...',
  )
  process.exit(2)
}

const [dirName, slug, ...rest] = process.argv.slice(2)
if ((dirName !== 'programs' && dirName !== 'guides') || slug === undefined)
  usage('missing directory or slug')
const inputs: string[] = []
let name: string | undefined
let seed: number | undefined
let replace = false
for (let index = 0; index < rest.length; index++) {
  const flag = rest[index]
  const value = rest[index + 1]
  if (flag === '--replace') {
    replace = true
    continue
  }
  if (value === undefined) usage(`${flag} needs a value`)
  if (flag === '--input') inputs.push(value)
  else if (flag === '--name') name = value
  else if (flag === '--seed') seed = Number(value)
  else usage(`unknown flag ${flag}`)
  index++
}

const dir = join(root, dirName)
const file = join(dir, `${slug}.stepcode`)
if (!existsSync(file)) usage(`${file} does not exist`)
const source = readFileSync(file, 'utf8')
if (usesRandom(source) && seed === undefined) seed = 1
const profile = profileNamed(
  dirName === 'programs' && corpusIndexBaseZero().includes(slug) ? 'es0' : 'es',
)

const report = await runSource(source, profile, inputs, seed)
console.log('--- output ---')
process.stdout.write(report.output)
console.log('--- end ---')
if (report.outcome.kind !== 'done') {
  console.error(`the run did not end in done: ${JSON.stringify(report.outcome)}`)
  process.exit(1)
}
if (report.requests !== inputs.length) {
  console.error(
    `the program made ${report.requests} input requests but ${inputs.length} inputs were given`,
  )
  process.exit(1)
}

const sidecarFile = join(dir, `${slug}.run.json`)
const existing: Sidecar =
  !replace && existsSync(sidecarFile)
    ? (JSON.parse(readFileSync(sidecarFile, 'utf8')) as Sidecar)
    : { runs: [] }
const run: SidecarRun = {
  ...(name === undefined ? {} : { name }),
  inputs,
  output: report.output,
  ...(seed === undefined ? {} : { seed }),
}
const sidecar: Sidecar = { runs: [...existing.runs, run] }
writeFileSync(sidecarFile, `${JSON.stringify(sidecar, null, 2)}\n`, 'utf8')
console.log(`${sidecarFile}: ${sidecar.runs.length} run(s)`)
