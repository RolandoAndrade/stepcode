import { useEditorStore } from '../../store/context'
import type { UiLocale } from '../../store/settings'
import { stringsOf } from '../../store/store'
import type { ThemePreference } from '../../theme/types'
import { Section, Select } from './controls'

/** Spec §6: theme and UI language preferences, applied immediately. */
export function Appearance() {
  const strings = useEditorStore(stringsOf)
  const themePreference = useEditorStore((s) => s.themePreference)
  const uiLocale = useEditorStore((s) => s.settings.appearance.uiLocale)
  const setThemePreference = useEditorStore((s) => s.setThemePreference)
  const updateSettings = useEditorStore((s) => s.updateSettings)
  const t = strings.settings.appearance

  return (
    <Section title={strings.settings.sections.appearance} resetLabel={strings.settings.reset}>
      <Select<ThemePreference>
        label={t.theme}
        value={themePreference}
        options={[
          { value: 'system', label: t.system },
          { value: 'light', label: t.light },
          { value: 'dark', label: t.dark },
        ]}
        onChange={setThemePreference}
      />
      <Select<UiLocale>
        label={t.uiLanguage}
        value={uiLocale}
        options={[
          { value: 'auto', label: t.auto },
          { value: 'es', label: t.spanish },
          { value: 'en', label: t.english },
        ]}
        onChange={(next) => updateSettings('appearance', { uiLocale: next })}
      />
    </Section>
  )
}
