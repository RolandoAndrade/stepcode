import { useEditorStore } from '../../store/context'
import { stringsOf } from '../../store/store'
import { Section, Toggle } from './controls'

/** Spec §6: execution preferences, applied immediately. */
export function Execution() {
  const strings = useEditorStore(stringsOf)
  const settings = useEditorStore((s) => s.settings.execution)
  const updateSettings = useEditorStore((s) => s.updateSettings)
  const resetSettings = useEditorStore((s) => s.resetSettings)
  const t = strings.settings.execution

  return (
    <Section
      title={strings.settings.sections.execution}
      onReset={() => resetSettings('execution')}
      resetLabel={strings.settings.reset}
    >
      <Toggle
        label={t.warnOnWarnings}
        checked={settings.warnOnWarnings}
        onChange={(warnOnWarnings) => updateSettings('execution', { warnOnWarnings })}
      />
      <Toggle
        label={t.clearConsoleOnRun}
        checked={settings.clearConsoleOnRun}
        onChange={(clearConsoleOnRun) => updateSettings('execution', { clearConsoleOnRun })}
      />
    </Section>
  )
}
