import type { Theme } from './types'

/** Every `--sc-*` custom property, without the prefix. Both blocks of tokens.css define all. */
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
] as const

export type TokenName = (typeof TOKEN_NAMES)[number]

/** Tokens that are opaque hex colors; the other two are translucent overlays. */
export const HEX_TOKENS: readonly TokenName[] = TOKEN_NAMES.filter(
  (name) => name !== 'line' && name !== 'current-line',
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
      if (name !== undefined && value !== undefined) out[theme][name] = value.trim()
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
