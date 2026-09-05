import { useEffect, useRef, useState } from 'react'
import { typeLabel } from '../labels'
import { useEditorStore } from '../store/context'
import { profileOf, stringsOf } from '../store/store'
import { PanelEmptyState } from './PanelActions'
import { valueLabel } from './values'

/** How long a changed value stays flashed (spec §3.6). */
const FLASH_MILLIS = 600

export function Variables() {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  const frames = useEditorStore((s) => s.frames)
  const state = useEditorStore((s) => s.state)
  const empty = frames.length === 0

  const previous = useRef<Map<string, string>>(new Map())
  const [changed, setChanged] = useState<ReadonlySet<string>>(new Set())

  // biome-ignore lint/correctness/useExhaustiveDependencies: recomputed exactly when `frames` changes.
  useEffect(() => {
    const next = new Set<string>()
    const values = new Map<string, string>()
    for (const frame of frames) {
      for (const variable of frame.variables) {
        const key = `${frame.name}-${frame.line}-${variable.name}`
        const rendered = valueLabel(variable, profile, strings)
        values.set(key, rendered)
        const before = previous.current.get(key)
        if (before !== undefined && before !== rendered) next.add(key)
      }
    }
    previous.current = values
    if (next.size === 0) return
    setChanged(next)
    const timeout = setTimeout(() => setChanged(new Set()), FLASH_MILLIS)
    return () => clearTimeout(timeout)
  }, [frames])

  return (
    <section
      aria-label={strings.variables.title}
      className="flex h-full min-h-0 flex-col bg-surface text-fg"
    >
      <div className="min-h-0 flex-1 overflow-auto p-2 text-sm">
        {empty ? (
          <PanelEmptyState
            text={state === 'ready' ? strings.variables.empty : strings.variables.pauseToSee}
          />
        ) : (
          frames.map((frame) => (
            <details key={`${frame.name}-${frame.line}`} open className="mb-3">
              <summary className="mb-1 cursor-pointer list-none">
                <h3 className="inline font-semibold">
                  {strings.variables.frameAt(frame.name, frame.line)}
                </h3>
              </summary>
              <table className="w-full border-collapse font-mono text-xs">
                <thead className="text-muted">
                  <tr>
                    <th className="text-left font-normal">{strings.variables.name}</th>
                    <th className="text-left font-normal">{strings.variables.kind}</th>
                    <th className="text-left font-normal">{strings.variables.type}</th>
                    <th className="text-left font-normal">{strings.variables.value}</th>
                  </tr>
                </thead>
                <tbody>
                  {frame.variables.map((variable) => {
                    const key = `${frame.name}-${frame.line}-${variable.name}`
                    const flashing = changed.has(key)
                    return (
                      <tr key={variable.name} className="border-t border-border">
                        <td className="pr-2">{variable.name}</td>
                        <td className="pr-2 text-muted">{strings.kinds[variable.kind]}</td>
                        <td className="pr-2">{typeLabel(variable.type, profile, strings)}</td>
                        <td
                          data-changed={flashing ? 'true' : undefined}
                          className={`whitespace-pre-wrap break-all ${flashing ? 'bg-changed' : ''}`}
                        >
                          {valueLabel(variable, profile, strings)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </details>
          ))
        )}
      </div>
    </section>
  )
}
