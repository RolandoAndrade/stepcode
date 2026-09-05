import type { ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../store/context'
import { canEdit, hasErrors, PROFILE_IDS, stringsOf } from '../store/store'

const ICON = 'h-4 w-4 fill-current'

const icons = {
  run: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M4 2l10 6-10 6z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M3 2h4v12H3zM9 2h4v12H9z" />
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M3 3h10v10H3z" />
    </svg>
  ),
  stepOver: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M2 9a6 6 0 0 1 10-4.5V2l3 3-3 3V6a4 4 0 0 0-8 3zM7 12h2v2H7z" />
    </svg>
  ),
  stepInto: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M7 1h2v7h3l-4 4-4-4h3zM7 13h2v2H7z" />
    </svg>
  ),
  stepOut: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M8 1l4 4H9v7H7V5H4zM7 13h2v2H7z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <circle cx="8" cy="8" r="3.5" />
      <path
        d="M8 0h0v3M8 13v3M0 8h3M13 8h3M2.3 2.3l2.2 2.2M11.5 11.5l2.2 2.2M2.3 13.7l2.2-2.2M11.5 4.5l2.2-2.2"
        stroke="currentColor"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true">
      <path d="M10 1a7 7 0 1 0 5 12A6 6 0 0 1 10 1z" />
    </svg>
  ),
} as const

function Control({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded p-1 text-fg hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function Toolbar() {
  const strings = useEditorStore(stringsOf)
  const state = useEditorStore((s) => s.state)
  const errors = useEditorStore(hasErrors)
  const errorCount = useEditorStore(
    (s) => s.diagnostics.filter((d) => d.severity === 'error').length,
  )
  const warningCount = useEditorStore(
    (s) => s.diagnostics.filter((d) => d.severity === 'warning').length,
  )
  const profileId = useEditorStore((s) => s.profileId)
  const theme = useEditorStore((s) => s.theme)
  // Actions are stable, but the object is new per call: `useShallow` keeps re-renders away.
  const actions = useEditorStore(
    useShallow((s) => ({
      run: s.run,
      stepInto: s.stepInto,
      stepOver: s.stepOver,
      stepOut: s.stepOut,
      continue: s.continue,
      pause: s.pause,
      stop: s.stop,
      setProfile: s.setProfile,
      setThemePreference: s.setThemePreference,
    })),
  )
  const t = strings.toolbar

  const controls = (() => {
    switch (state) {
      case 'ready':
      case 'done':
      case 'error':
        return (
          <>
            <Control label={t.run} onClick={actions.run} disabled={errors}>
              {icons.run}
            </Control>
            <Control label={t.step} onClick={actions.stepInto} disabled={errors}>
              {icons.stepInto}
            </Control>
          </>
        )
      case 'running':
        return (
          <>
            <Control label={t.pause} onClick={actions.pause}>
              {icons.pause}
            </Control>
            <Control label={t.stop} onClick={actions.stop}>
              {icons.stop}
            </Control>
          </>
        )
      case 'paused':
        return (
          <>
            <Control label={t.continue} onClick={actions.continue}>
              {icons.run}
            </Control>
            <Control label={t.stepOver} onClick={actions.stepOver}>
              {icons.stepOver}
            </Control>
            <Control label={t.stepInto} onClick={actions.stepInto}>
              {icons.stepInto}
            </Control>
            <Control label={t.stepOut} onClick={actions.stepOut}>
              {icons.stepOut}
            </Control>
            <Control label={t.stop} onClick={actions.stop}>
              {icons.stop}
            </Control>
          </>
        )
      case 'input':
      case 'waiting':
        return (
          <Control label={t.stop} onClick={actions.stop}>
            {icons.stop}
          </Control>
        )
    }
  })()

  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-1 text-sm text-fg">
      <span className="font-semibold">{strings.app.title}</span>
      <label className="flex items-center gap-1 text-xs text-muted">
        {t.profile}
        <select
          aria-label={t.profile}
          value={profileId}
          disabled={!canEdit(state)}
          onChange={(event) => actions.setProfile(event.target.value)}
          className="rounded border border-border bg-surface px-1 py-0.5 text-fg"
        >
          {PROFILE_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <span className="flex items-center gap-2 text-xs">
        <span className={errorCount > 0 ? 'text-error' : 'text-muted'}>{t.errors(errorCount)}</span>
        <span className={warningCount > 0 ? 'text-warning' : 'text-muted'}>
          {t.warnings(warningCount)}
        </span>
      </span>
      <span className="ml-auto text-xs text-muted">{strings.states[state]}</span>
      <Control
        label={theme === 'dark' ? t.toLight : t.toDark}
        onClick={() => actions.setThemePreference(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? icons.sun : icons.moon}
      </Control>
      <div className="flex items-center gap-1">{controls}</div>
    </header>
  )
}
