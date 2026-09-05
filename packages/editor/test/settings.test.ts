import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, SettingsSchema } from '../src/store/settings'

describe('settings', () => {
  it('has the spec defaults', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      editor: {
        fontSize: 14,
        lineNumbers: true,
        wordWrap: false,
        autocomplete: true,
        tabSize: 4,
        highlightLine: true,
      },
      execution: { warnOnWarnings: true, clearConsoleOnRun: true },
      appearance: { theme: 'system', uiLocale: 'auto' },
      layout: { showConsoleOnRun: true },
    })
  })

  it('validates and rejects out-of-range values', () => {
    expect(SettingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true)
    const bad = { ...DEFAULT_SETTINGS, editor: { ...DEFAULT_SETTINGS.editor, fontSize: 40 } }
    expect(SettingsSchema.safeParse(bad).success).toBe(false)
    const tab = { ...DEFAULT_SETTINGS, editor: { ...DEFAULT_SETTINGS.editor, tabSize: 3 } }
    expect(SettingsSchema.safeParse(tab).success).toBe(false)
  })
})
