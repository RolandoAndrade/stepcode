import type { JSX } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../store/context'
import { canEdit, hasErrors, stringsOf } from '../store/store'
import { ArrowDownToDot, ArrowUpFromDot, Bug, Pause, Play, Square, StepForward } from '../ui/icons'
import { IconButton } from '../ui/Tooltip'
import { SHORTCUTS } from './shortcuts'

type Slot = 'run' | 'debug' | 'continue' | 'stepOver' | 'stepInto' | 'stepOut' | 'pause' | 'stop'
const ORDER: readonly Slot[] = [
  'run',
  'continue',
  'debug',
  'stepOver',
  'stepInto',
  'stepOut',
  'pause',
  'stop',
]

/** Spec §4.3: which slots each run state shows. */
export function slotsFor(state: string): readonly Slot[] {
  switch (state) {
    case 'running':
      return ['pause', 'stop']
    case 'paused':
      return ['continue', 'stepOver', 'stepInto', 'stepOut', 'stop']
    case 'input':
    case 'waiting':
      return ['stop']
    default:
      return ['run', 'debug']
  }
}

export function RunControls({ compact = false }: { compact?: boolean }) {
  const strings = useEditorStore(stringsOf)
  const state = useEditorStore((s) => s.state)
  const errors = useEditorStore(hasErrors)
  const a = useEditorStore(
    useShallow((s) => ({
      run: s.run,
      stepInto: s.stepInto,
      stepOver: s.stepOver,
      stepOut: s.stepOut,
      continue: s.continue,
      pause: s.pause,
      stop: s.stop,
      requestPanel: s.requestPanel,
    })),
  )
  const t = strings.toolbar
  const shown = new Set(
    compact
      ? slotsFor(state).filter(
          (slot) => slot === 'run' || slot === 'stop' || slot === 'pause' || slot === 'continue',
        )
      : slotsFor(state),
  )
  const runOrProblems = (): void => (errors ? a.requestPanel('problems') : a.run())
  const buttons: Record<
    Slot,
    { label: string; shortcut: string; icon: JSX.Element; onClick: () => void }
  > = {
    run: {
      label: t.run,
      shortcut: SHORTCUTS.runOrContinue,
      icon: <Play />,
      onClick: runOrProblems,
    },
    debug: {
      label: t.debug,
      shortcut: SHORTCUTS.stepInto,
      icon: <Bug />,
      onClick: () => (errors ? a.requestPanel('problems') : a.stepInto()),
    },
    continue: {
      label: t.continue,
      shortcut: SHORTCUTS.runOrContinue,
      icon: <Play />,
      onClick: a.continue,
    },
    stepOver: {
      label: t.stepOver,
      shortcut: SHORTCUTS.stepOver,
      icon: <StepForward />,
      onClick: a.stepOver,
    },
    stepInto: {
      label: t.stepInto,
      shortcut: SHORTCUTS.stepInto,
      icon: <ArrowDownToDot />,
      onClick: a.stepInto,
    },
    stepOut: {
      label: t.stepOut,
      shortcut: SHORTCUTS.stepOut,
      icon: <ArrowUpFromDot />,
      onClick: a.stepOut,
    },
    pause: { label: t.pause, shortcut: SHORTCUTS.pause, icon: <Pause />, onClick: a.pause },
    stop: { label: t.stop, shortcut: SHORTCUTS.stop, icon: <Square />, onClick: a.stop },
  }
  return (
    <div className="flex items-center gap-1" data-state={state} data-editable={canEdit(state)}>
      {ORDER.map((slot) => {
        if (shown.has(slot))
          return (
            <IconButton
              key={slot}
              label={buttons[slot].label}
              shortcut={buttons[slot].shortcut}
              onClick={buttons[slot].onClick}
            >
              {buttons[slot].icon}
            </IconButton>
          )
        // The desktop toolbar keeps a zero-width placeholder so the buttons stay put across run
        // states; on the phone bar those placeholders would each eat a flex gap, so drop them.
        return compact ? null : (
          <span
            key={slot}
            aria-hidden="true"
            className="inline-block w-0 transition-[width] duration-150"
          />
        )
      })}
    </div>
  )
}
