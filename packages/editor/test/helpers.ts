import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { builtinProfiles, type ProfileInput } from '@stepcode/profiles'
import type { DriverPort, HostMessage, WorkerMessage } from '../src/runtime/protocol'

export type ProfileId = 'es' | 'en' | 'pseint'

/** The JSON input of a shipped profile, as the worker receives it. */
export function profileInput(id: ProfileId): ProfileInput {
  const input = builtinProfiles.get(id)
  if (input === undefined) throw new Error(`no builtin profile ${id}`)
  return input
}

/** `es` with 0-based arrays, for the corpus programs `index-base-0.txt` lists. */
export const ES_INDEX_0: ProfileInput = {
  id: 'es-index-0',
  extends: 'es',
  options: { indexBase: 0 },
}

export interface RecordingPort extends DriverPort {
  /** Every message the driver posted, in order. */
  readonly posted: WorkerMessage[]
  /** Deliver a host message to the driver, as the worker's `onmessage` would. */
  send(message: HostMessage): void
  /** The `kind`s posted so far, for compact assertions. */
  kinds(): string[]
  /** Everything written since the buffer was last cleared, joined. */
  text(): string
}

export function recordingPort(): RecordingPort {
  const posted: WorkerMessage[] = []
  const port: RecordingPort = {
    posted,
    onmessage: null,
    postMessage: (message) => {
      posted.push(message)
    },
    send: (message) => {
      if (port.onmessage === null) throw new Error('the driver has not attached to the port')
      port.onmessage({ data: message })
    },
    kinds: () => posted.map((message) => message.kind),
    text: () => {
      let out = ''
      for (const message of posted) {
        if (message.kind === 'clear') out = ''
        if (message.kind === 'output') out += message.chunks.join('')
      }
      return out
    },
  }
  return port
}

/** Resolves once `predicate` holds; polls with macrotasks so worker messages get delivered. */
export function until(predicate: () => boolean, timeoutMillis = 5000): Promise<void> {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const tick = (): void => {
      if (predicate()) {
        resolve()
      } else if (Date.now() - started > timeoutMillis) {
        reject(new Error('until: timed out'))
      } else {
        setTimeout(tick, 5)
      }
    }
    tick()
  })
}

// Built with `node:url`'s own `URL`: happy-dom replaces the global one with a polyfill that
// `fileURLToPath` does not recognise as a file URL.
const corpusRoot = fileURLToPath(
  new NodeURL('../../language/test/corpus/programs', import.meta.url),
)

export interface SidecarRun {
  readonly name?: string
  readonly inputs: readonly string[]
  readonly output: string
  readonly seed?: number
}

export interface CorpusProgram {
  readonly slug: string
  readonly source: string
  readonly profile: ProfileInput
  readonly runs: readonly SidecarRun[]
}

let corpus: CorpusProgram[] | undefined

/** Every conformance program with a sidecar, read in place. */
export function corpusPrograms(): readonly CorpusProgram[] {
  if (corpus !== undefined) return corpus
  const zero = new Set(
    readFileSync(join(corpusRoot, 'index-base-0.txt'), 'utf8')
      .split('\n')
      .filter((line) => line.length > 0),
  )
  corpus = readdirSync(corpusRoot)
    .filter((name) => name.endsWith('.stepcode'))
    .sort()
    .map((file) => {
      const slug = file.replace('.stepcode', '')
      const sidecar = JSON.parse(readFileSync(join(corpusRoot, `${slug}.run.json`), 'utf8')) as {
        runs: SidecarRun[]
      }
      return {
        slug,
        source: readFileSync(join(corpusRoot, file), 'utf8'),
        profile: zero.has(slug) ? ES_INDEX_0 : profileInput('es'),
        runs: sidecar.runs,
      }
    })
  return corpus
}

/** One corpus program by slug; throws when the corpus does not have it. */
export function corpusProgram(slug: string): CorpusProgram {
  const program = corpusPrograms().find((one) => one.slug === slug)
  if (program === undefined) throw new Error(`no corpus program ${slug}`)
  return program
}
