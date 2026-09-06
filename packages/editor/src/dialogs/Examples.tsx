import { useMemo, useState } from 'react'
import { EXAMPLES, exampleSource, TOPICS } from '../examples/index'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { profileOf, stringsOf } from '../store/store'
import { Dialog } from './Dialog'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Spec §8.2: the example gallery, grouped by topic, filterable by title. */
export function Examples() {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  const [query, setQuery] = useState('')
  const matches = useMemo(() => {
    const needle = normalize(query.trim())
    return needle === ''
      ? EXAMPLES
      : EXAMPLES.filter((example) => normalize(example.title).includes(needle))
  }, [query])

  const load = (id: string): void => {
    const example = EXAMPLES.find((e) => e.id === id)
    if (example === undefined) return
    store.getState().requestReplace({
      name: `${example.slug}.stepcode`,
      source: exampleSource(example, profileOf(store.getState())),
    })
    if (store.getState().pendingReplace === null) store.getState().closeDialog()
  }

  return (
    <Dialog name="examples" title={strings.examples.title} wide>
      <input
        type="search"
        aria-label={strings.examples.search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mb-4 h-8 w-full rounded border border-border bg-surface-raised px-2 text-sm"
      />
      {matches.length === 0 ? (
        <p className="text-muted text-sm">{strings.examples.empty}</p>
      ) : (
        TOPICS.map((topic) => {
          const inTopic = matches.filter((example) => example.topic === topic)
          if (inTopic.length === 0) return null
          return (
            <section key={topic} className="mb-4">
              <h3 className="mb-2 font-semibold text-sm">{strings.examples.topics[topic]}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {inTopic.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    aria-label={`${strings.examples.load}: ${example.title}`}
                    onClick={() => load(example.id)}
                    className="rounded border border-border p-2 text-left transition-colors duration-150 hover:bg-surface-raised"
                  >
                    <div className="font-semibold text-sm">{example.title}</div>
                    <div className="text-muted text-xs">{example.description}</div>
                    <pre className="mt-1 overflow-hidden font-mono text-xs">
                      {exampleSource(example, profile).split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </button>
                ))}
              </div>
            </section>
          )
        })
      )}
    </Dialog>
  )
}
