import type { Diagnostic } from '@codemirror/lint'
import { useMemo } from 'react'
import { LineMap } from 'stepcode'
import { useEditorStore } from '../store/context'
import { stringsOf } from '../store/store'

const SEVERITY_ORDER: Readonly<Record<Diagnostic['severity'], number>> = {
  error: 0,
  warning: 1,
  info: 2,
  hint: 3,
}

function sorted(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort(
    (a, b) => a.from - b.from || SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  )
}

export function Problems({ onReveal }: { onReveal: (from: number, to: number) => void }) {
  const strings = useEditorStore(stringsOf)
  const source = useEditorStore((s) => s.source)
  const diagnostics = useEditorStore((s) => s.diagnostics)
  const lines = useMemo(() => new LineMap(source), [source])
  const rows = useMemo(() => sorted(diagnostics), [diagnostics])
  const errors = diagnostics.filter((d) => d.severity === 'error').length
  const warnings = diagnostics.filter((d) => d.severity === 'warning').length

  return (
    <section
      aria-label={strings.problems.title}
      className="flex h-full min-h-0 flex-col bg-surface text-fg"
    >
      <header className="flex items-center justify-between border-b border-border px-2 py-1 text-xs text-muted">
        <span>{strings.problems.title}</span>
        <span>{strings.problems.summary(errors, warnings)}</span>
      </header>
      <div className="min-h-0 flex-1 overflow-auto text-sm">
        {rows.length === 0 ? (
          <p className="p-2 text-muted">{strings.problems.empty}</p>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((diagnostic, index) => {
                const position = lines.positionAt(diagnostic.from)
                const isError = diagnostic.severity === 'error'
                const glyph = isError ? '✖' : '▲'
                const label = isError ? strings.problems.error : strings.problems.warning
                return (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: diagnostics can repeat the same offset and code, so the index is needed to keep two rows distinct.
                    key={`${diagnostic.from}-${diagnostic.source ?? ''}-${index}`}
                    onClick={() => onReveal(diagnostic.from, diagnostic.to)}
                    className="cursor-pointer border-t border-border hover:bg-surface-raised"
                  >
                    <td className={`px-2 py-1 ${isError ? 'text-error' : 'text-warning'}`}>
                      <span aria-hidden="true" title={label}>
                        {glyph}
                      </span>
                      <span className="sr-only">{label}</span>
                    </td>
                    <td className="px-2 py-1 font-mono text-xs text-muted">{`${position.line}:${position.column}`}</td>
                    <td className="px-2 py-1">{diagnostic.message}</td>
                    <td className="px-2 py-1 font-mono text-xs text-muted">
                      {diagnostic.source ?? ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
