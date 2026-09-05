import { typeLabel } from '../labels'
import { useEditorStore } from '../store/context'
import { profileOf, stringsOf } from '../store/store'
import { valueLabel } from './values'

export function Variables() {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  const frames = useEditorStore((s) => s.frames)
  const state = useEditorStore((s) => s.state)
  const empty = state === 'ready' || frames.length === 0

  return (
    <section
      aria-label={strings.variables.title}
      className="flex h-full min-h-0 flex-col bg-surface text-fg"
    >
      <header className="border-b border-border px-2 py-1 text-xs text-muted">
        {strings.variables.title}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-2 text-sm">
        {empty ? (
          <p className="text-muted">{strings.variables.empty}</p>
        ) : (
          frames.map((frame) => (
            <div key={`${frame.name}-${frame.line}`} className="mb-3">
              <h3 className="mb-1 font-semibold">
                {strings.variables.frameAt(frame.name, frame.line)}
              </h3>
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
                  {frame.variables.map((variable) => (
                    <tr key={variable.name} className="border-t border-border">
                      <td className="pr-2">{variable.name}</td>
                      <td className="pr-2 text-muted">{strings.kinds[variable.kind]}</td>
                      <td className="pr-2">{typeLabel(variable.type, profile, strings)}</td>
                      <td className="whitespace-pre-wrap break-all">
                        {valueLabel(variable, profile, strings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
