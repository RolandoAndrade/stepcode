import * as z from 'zod'

export type UiLocale = 'auto' | 'es' | 'en'

export const EditorSettingsSchema = z.strictObject({
  fontSize: z.number().int().min(12).max(20),
  lineNumbers: z.boolean(),
  wordWrap: z.boolean(),
  autocomplete: z.boolean(),
  tabSize: z.union([z.literal(2), z.literal(4)]),
  highlightLine: z.boolean(),
})

export const SettingsSchema = z.strictObject({
  editor: EditorSettingsSchema,
  execution: z.strictObject({ warnOnWarnings: z.boolean(), clearConsoleOnRun: z.boolean() }),
  appearance: z.strictObject({
    theme: z.enum(['light', 'dark', 'system']),
    uiLocale: z.enum(['auto', 'es', 'en']),
  }),
  layout: z.strictObject({ showConsoleOnRun: z.boolean() }),
})

export type Settings = z.infer<typeof SettingsSchema>
export type EditorSettings = Settings['editor']
export type ExecutionSettings = Settings['execution']
export type AppearanceSettings = Settings['appearance']
export type LayoutSettings = Settings['layout']
export type SettingsSection = keyof Settings

/** Spec §6: every default, once. */
export const DEFAULT_SETTINGS: Settings = Object.freeze({
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
