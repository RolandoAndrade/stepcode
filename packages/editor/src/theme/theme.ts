import type { Theme, ThemePreference } from './types'

/**
 * Every `--sc-*` color custom property, without the prefix. Both blocks of tokens.css define all.
 * Non-color tokens live under a reserved prefix (`--sc-z-*`) and stay out of this list.
 */
export const TOKEN_NAMES = [
  'bg',
  'surface',
  'surface-raised',
  'border',
  'fg',
  'fg-muted',
  'accent',
  'caret',
  'selection',
  'line',
  'error',
  'warning',
  'success',
  'breakpoint',
  'current-line',
  'syn-keyword',
  'syn-string',
  'syn-number',
  'syn-comment',
  'syn-type',
  'syn-builtin',
  'syn-operator',
  'syn-variable',
  'syn-definition',
  'accent-soft',
  'overlay',
  'shadow',
  'changed',
  'accent-strong',
  'warning-strong',
  'error-strong',
  'on-accent',
  'on-warning',
  'on-error',
] as const

export type TokenName = (typeof TOKEN_NAMES)[number]

const OVERLAY_TOKENS: ReadonlySet<string> = new Set([
  'line',
  'current-line',
  'accent-soft',
  'overlay',
  'shadow',
])

/** Tokens that are opaque hex colors; the others are translucent overlays. */
export const HEX_TOKENS: readonly TokenName[] = TOKEN_NAMES.filter(
  (name) => !OVERLAY_TOKENS.has(name),
)

const BLOCK = /(:root(?:\[data-theme="dark"\])?)\s*\{([^}]*)\}/g
const DECLARATION = /--sc-([a-z-]+)\s*:\s*([^;]+);/g

/** Reads both token blocks out of tokens.css; used by the tests, not by the app. */
export function parseTokens(css: string): Record<Theme, Record<string, string>> {
  const out: Record<Theme, Record<string, string>> = { light: {}, dark: {} }
  for (const block of css.matchAll(BLOCK)) {
    const theme: Theme = block[1]?.includes('dark') ? 'dark' : 'light'
    for (const declaration of (block[2] ?? '').matchAll(DECLARATION)) {
      const name = declaration[1]
      const value = declaration[2]
      // `--sc-z-*` is a stacking level, not a color; the color model would only mis-measure it.
      if (name === undefined || value === undefined || name.startsWith('z-')) continue
      out[theme][name] = value.trim()
    }
  }
  return out
}

function channel(hex: string, offset: number): number {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/** WCAG 2 relative luminance of a `#rrggbb` color. */
export function relativeLuminance(hex: string): number {
  const digits = hex.replace('#', '')
  return 0.2126 * channel(digits, 0) + 0.7152 * channel(digits, 2) + 0.0722 * channel(digits, 4)
}

/** WCAG 2 contrast ratio, 1 to 21, order-independent. Hex colors only. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}

type MatchMedia = (query: string) => { readonly matches: boolean }

/** `prefers-color-scheme`, or light when the platform cannot say. */
export function resolveInitialTheme(
  matchMedia: MatchMedia | undefined = typeof window === 'undefined'
    ? undefined
    : window.matchMedia?.bind(window),
): Theme {
  if (matchMedia === undefined) return 'light'
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Spec §8.2: dark is an attribute on the root; light is its absence. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  if (theme === 'dark') root.dataset.theme = 'dark'
  else delete root.dataset.theme
  root.style.colorScheme = theme
}

interface MediaList {
  readonly matches: boolean
  addEventListener?(type: 'change', listener: (event: { matches: boolean }) => void): void
  removeEventListener?(type: 'change', listener: (event: { matches: boolean }) => void): void
}

type MatchMediaFn = (query: string) => MediaList

/** Spec §2.4: follow `prefers-color-scheme` while the preference is `system`. */
export function watchSystemTheme(
  onChange: (dark: boolean) => void,
  matchMedia: MatchMediaFn | undefined = typeof window === 'undefined'
    ? undefined
    : window.matchMedia?.bind(window),
): () => void {
  if (matchMedia === undefined) {
    onChange(false)
    return () => {}
  }
  const list = matchMedia('(prefers-color-scheme: dark)')
  onChange(list.matches)
  const listener = (event: { matches: boolean }): void => onChange(event.matches)
  list.addEventListener?.('change', listener)
  return () => list.removeEventListener?.('change', listener)
}

export function resolveInitialPreference(persisted: ThemePreference | undefined): ThemePreference {
  return persisted ?? 'system'
}
