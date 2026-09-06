import { profiles, type ResolvedProfile } from '@stepcode/profiles'
import { transpose } from '../profiles/transpose'
import { parseHeader } from './header'

export interface Example {
  readonly id: string
  readonly topic: string
  readonly slug: string
  readonly title: string
  readonly description: string
  /** The `es` body without the header. */
  readonly source: string
  /** `<slug>.<profileId>.stepcode` files, by profile id, already header-stripped. */
  readonly overrides: Readonly<Record<string, string>>
}

// Kept in sync with `../../examples/topics.json`, which is the source of truth read by
// tooling that cannot import JSON (this package does not enable `resolveJsonModule`).
export const TOPICS: readonly string[] = [
  'primeros-pasos',
  'condicionales',
  'ciclos',
  'arreglos',
  'funciones',
  'un-poco-mas',
]

// Vite resolves this at build time (and in Vitest); the `?raw` query yields the file text.
const files = import.meta.glob('../../examples/*/*.stepcode', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const FILE = /\/examples\/([^/]+)\/([^/.]+)(?:\.([^/.]+))?\.stepcode$/

function build(): Example[] {
  const byId = new Map<string, { base?: string; overrides: Record<string, string> }>()
  for (const [path, text] of Object.entries(files)) {
    const match = FILE.exec(path)
    if (match === null) continue
    const [, topic, slug, profileId] = match
    const id = `${topic}/${slug}`
    const entry = byId.get(id) ?? { overrides: {} }
    if (profileId === undefined) entry.base = text
    else entry.overrides[profileId] = parseHeader(text).body
    byId.set(id, entry)
  }
  const examples: Example[] = []
  for (const [id, entry] of byId) {
    if (entry.base === undefined) continue
    const [topic = '', slug = ''] = id.split('/')
    const { title, description, body } = parseHeader(entry.base)
    examples.push({ id, topic, slug, title, description, source: body, overrides: entry.overrides })
  }
  return examples.sort(
    (a, b) =>
      TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic) || a.title.localeCompare(b.title, 'es'),
  )
}

export const EXAMPLES: readonly Example[] = build()

export function findExample(id: string): Example | undefined {
  return EXAMPLES.find((example) => example.id === id)
}

/** Spec §8.3: the per-profile override when one exists, otherwise the transposed `es` body. */
export function exampleSource(example: Example, profile: ResolvedProfile): string {
  return example.overrides[profile.id] ?? transpose(example.source, profiles.es, profile)
}
