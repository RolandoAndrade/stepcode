import { useEditorStore } from '../../store/context'
import { stringsOf } from '../../store/store'
import { NumberField, Section, Select, Toggle } from './controls'

/** Spec §6: editor preferences, applied immediately. */
export function EditorSection() {
  const strings = useEditorStore(stringsOf)
  const settings = useEditorStore((s) => s.settings.editor)
  const updateSettings = useEditorStore((s) => s.updateSettings)
  const resetSettings = useEditorStore((s) => s.resetSettings)
  const t = strings.settings.editor

  return (
    <Section
      title={strings.settings.sections.editor}
      onReset={() => resetSettings('editor')}
      resetLabel={strings.settings.reset}
    >
      <NumberField
        label={t.fontSize}
        value={settings.fontSize}
        min={12}
        max={20}
        onChange={(fontSize) => updateSettings('editor', { fontSize })}
      />
      <Toggle
        label={t.lineNumbers}
        checked={settings.lineNumbers}
        onChange={(lineNumbers) => updateSettings('editor', { lineNumbers })}
      />
      <Toggle
        label={t.wordWrap}
        checked={settings.wordWrap}
        onChange={(wordWrap) => updateSettings('editor', { wordWrap })}
      />
      <Toggle
        label={t.autocomplete}
        checked={settings.autocomplete}
        onChange={(autocomplete) => updateSettings('editor', { autocomplete })}
      />
      <Toggle
        label={t.highlightLine}
        checked={settings.highlightLine}
        onChange={(highlightLine) => updateSettings('editor', { highlightLine })}
      />
      <Select
        label={t.tabSize}
        value={String(settings.tabSize) as '2' | '4'}
        options={[
          { value: '2', label: '2' },
          { value: '4', label: '4' },
        ]}
        onChange={(next) => updateSettings('editor', { tabSize: Number(next) as 2 | 4 })}
      />
    </Section>
  )
}
