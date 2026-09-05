import { useEditorStore } from '../../store/context'
import { DEFAULT_SETTINGS, type UiLocale } from '../../store/settings'
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
  const resetSettings = useEditorStore((s) => s.resetSettings)
  const t = strings.settings.appearance

  return (
    <Section
      title={strings.settings.sections.appearance}
      onReset={() => {
        // `theme` lives twice: on `settings.appearance` (persisted) and mirrored onto the
        // store's own `themePreference` (what actually drives rendering) — only
        // `setThemePreference` keeps both in sync, so `resetSettings` alone would reset the
        // setting but leave the screen's current theme untouched.
        resetSettings('appearance')
        setThemePreference(DEFAULT_SETTINGS.appearance.theme)
      }}
      resetLabel={strings.settings.reset}
    >
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
