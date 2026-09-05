import type { ReactNode } from 'react'
import { useEditorStore } from '../store/context'
import type { PanelId } from '../store/layout'
import { stringsOf } from '../store/store'
import { ArrowDownToLine, Trash2 } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'

/** Spec §3.6: the per-panel header actions, mounted by the dock header and the sheet handle. */
export function PanelActions({ panel }: { panel: PanelId }) {
  const strings = useEditorStore(stringsOf)
  const autoScroll = useEditorStore((s) => s.autoScroll)
  const setAutoScroll = useEditorStore((s) => s.setAutoScroll)
  const clearOutput = useEditorStore((s) => s.clearOutput)
  const errors = useEditorStore((s) => s.diagnostics.filter((d) => d.severity === 'error').length)
  const warnings = useEditorStore(
    (s) => s.diagnostics.filter((d) => d.severity === 'warning').length,
  )
  switch (panel) {
    case 'console':
      return (
        <span className="flex items-center gap-1">
          <IconButton
            label={strings.console.autoScroll}
            active={autoScroll}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            <ArrowDownToLine />
          </IconButton>
          <IconButton label={strings.console.clear} onClick={clearOutput}>
            <Trash2 />
          </IconButton>
        </span>
      )
    case 'problems':
      return (
        <span className="text-xs text-muted">{strings.problems.summary(errors, warnings)}</span>
      )
    default:
      return null
  }
}

/** Spec §3.6: the shared "nothing to show" state, an optional leading icon plus a message. */
export function PanelEmptyState({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <p className="flex items-center justify-center gap-1 p-2 text-muted">
      {icon}
      {text}
    </p>
  )
}
