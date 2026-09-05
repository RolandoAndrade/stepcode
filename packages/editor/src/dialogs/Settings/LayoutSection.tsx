import { useEditorStore } from '../../store/context'
import { stringsOf } from '../../store/store'
import { Section, Toggle } from './controls'

/** Spec §6: layout preferences and the reset-layout action. */
export function LayoutSection() {
  const strings = useEditorStore(stringsOf)
  const showConsoleOnRun = useEditorStore((s) => s.settings.layout.showConsoleOnRun)
  const updateSettings = useEditorStore((s) => s.updateSettings)
  const resetLayout = useEditorStore((s) => s.resetLayout)
  const t = strings.settings.layout

  return (
    <Section title={strings.settings.sections.layout} resetLabel={strings.settings.reset}>
      <button
        type="button"
        className="h-8 rounded border border-border px-3 text-sm hover:bg-surface-raised"
        onClick={resetLayout}
      >
        {t.reset}
      </button>
      <Toggle
        label={t.showConsoleOnRun}
        checked={showConsoleOnRun}
        onChange={(next) => updateSettings('layout', { showConsoleOnRun: next })}
      />
    </Section>
  )
}
