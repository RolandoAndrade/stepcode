import { useStore } from 'zustand'
import { encodeShare } from '../share/link'
import { RunControls } from '../shell/RunControls'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { profileNameOf, stringsOf } from '../store/store'
import { ExternalLink, Lock } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'
import type { EmbedOptionsStore } from './options'

/** Spec §3.2: 36 px — title and lock, the run cluster, then profile, problems and the way out. */
export function TopBar({
  options,
  onReveal,
}: {
  options: EmbedOptionsStore
  onReveal: (line: number) => void
}) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const profileName = useEditorStore((s) => profileNameOf(s, s.profileId))
  const diagnostics = useEditorStore((s) => s.diagnostics)
  const readOnly = useStore(options, (s) => s.readOnly)
  const showProfile = useStore(options, (s) => s.showProfile)
  const debug = useStore(options, (s) => s.debug)
  const title = useStore(options, (s) => s.title)

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length
  const clean = errors === 0 && warnings === 0

  const reveal = (): void => {
    const first = diagnostics[0]
    if (first === undefined) return
    const line = store.getState().source.slice(0, first.from).split('\n').length
    onReveal(line)
  }

  const openInStepCode = async (): Promise<void> => {
    const s = store.getState()
    const hash = await encodeShare(
      title === null
        ? { source: s.source, profileId: s.profileId }
        : { source: s.source, profileId: s.profileId, name: `${title}.stepcode` },
    )
    window.open(`${location.origin}/${hash}`, '_blank', 'noopener')
  }

  return (
    <header className="flex h-9 shrink-0 items-center gap-2 border-border border-b bg-surface px-2">
      {title === null && !readOnly ? null : (
        <span className="flex min-w-0 items-center gap-1">
          {title === null ? null : <span className="truncate text-sm">{title}</span>}
          {readOnly ? (
            <span role="img" title={strings.embed.readOnly} aria-label={strings.embed.readOnly}>
              <Lock size={12} />
            </span>
          ) : null}
        </span>
      )}
      <RunControls debug={debug} />
      <span className="ml-auto" />
      {showProfile ? (
        <span className="max-[479px]:hidden text-muted text-xs">{profileName}</span>
      ) : null}
      <button
        type="button"
        aria-label={strings.panels.problems}
        onClick={reveal}
        className={`flex h-6 items-center gap-1 rounded px-2 text-xs ${
          clean ? 'text-muted' : errors > 0 ? 'text-error' : 'text-warning'
        }`}
      >
        <span className="max-[479px]:hidden">
          {clean ? strings.status.noProblems : strings.status.problems(errors, warnings)}
        </span>
        <span className="hidden max-[479px]:inline">{errors + warnings}</span>
      </button>
      <IconButton label={strings.embed.openInStepCode} onClick={() => void openInStepCode()}>
        <ExternalLink />
      </IconButton>
    </header>
  )
}
