import type { Diagnostic } from '@codemirror/lint'
import type { KeyboardEvent } from 'react'
import { useMemo } from 'react'
import { LineMap } from 'stepcode'
import { useEditorStore } from '../store/context'
import { stringsOf } from '../store/store'
import { CircleCheck } from '../ui/icons'
import { PanelEmptyState } from './PanelActions'

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

/** Spec §3.6: ArrowUp/ArrowDown move focus between rows; Enter and Space reveal the row. */
function onRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, onReveal: () => void): void {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const row = event.currentTarget
    const sibling =
      event.key === 'ArrowDown'
        ? (row.nextElementSibling as HTMLElement | null)
        : (row.previousElementSibling as HTMLElement | null)
    sibling?.focus()
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onReveal()
  }
}

export function Problems({ onReveal }: { onReveal: (from: number, to: number) => void }) {
  const strings = useEditorStore(stringsOf)
  const source = useEditorStore((s) => s.source)
  const diagnostics = useEditorStore((s) => s.diagnostics)
  const lines = useMemo(() => new LineMap(source), [source])
  const rows = useMemo(() => sorted(diagnostics), [diagnostics])

  return (
    <section
      aria-label={strings.problems.title}
      className="flex h-full min-h-0 flex-col bg-surface text-fg"
    >
      <div className="min-h-0 flex-1 overflow-auto text-sm">
        {rows.length === 0 ? (
          <PanelEmptyState
            icon={<CircleCheck className="text-success" />}
            text={strings.problems.empty}
          />
        ) : (
          <table aria-label={strings.problems.title} className="w-full border-collapse">
            <tbody>
              {rows.map((diagnostic, index) => {
                const position = lines.positionAt(diagnostic.from)
                const isError = diagnostic.severity === 'error'
                const glyph = isError ? '✖' : '▲'
                const label = isError ? strings.problems.error : strings.problems.warning
                const reveal = () => onReveal(diagnostic.from, diagnostic.to)
                return (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: diagnostics can repeat the same offset and code, so the index is needed to keep two rows distinct.
                    key={`${diagnostic.from}-${diagnostic.source ?? ''}-${index}`}
                    tabIndex={0}
                    onClick={reveal}
                    onKeyDown={(event) => onRowKeyDown(event, reveal)}
                    className="cursor-pointer border-t border-border outline-none hover:bg-surface-raised focus:bg-surface-raised"
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
