export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

export const THEMES: readonly Theme[] = ['light', 'dark']
export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark']
