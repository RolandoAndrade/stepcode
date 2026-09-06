import type { ThemePreference } from '../theme/types'

/** Spec §2.3: one URL contract, parsed once, shared by `/` and `/embed`. */
export interface UrlOptions {
  readonly example: string | null
  readonly src: string | null
  /** A builtin id only; a custom profile arrives by `postMessage`, never by URL. */
  readonly profile: string | null
  readonly title: string | null
  readonly autorun: boolean
  readonly readonly: boolean
  readonly showProfile: boolean
  readonly debug: boolean
  readonly theme: ThemePreference
  readonly lang: 'es' | 'en' | null
}

export const DEFAULT_URL_OPTIONS: UrlOptions = {
  example: null,
  src: null,
  profile: null,
  title: null,
  autorun: false,
  readonly: false,
  showProfile: false,
  debug: false,
  theme: 'system',
  lang: null,
}

const BUILTIN_IDS: readonly string[] = ['es', 'en', 'pseint']

function text(params: URLSearchParams, key: string): string | null {
  const value = params.get(key)
  return value === null || value === '' ? null : value
}

/** Present with no value, `1` or `true` is on; anything else — including junk — is off. */
function flag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key)
  if (value === null) return false
  const normal = value.trim().toLowerCase()
  return normal === '' || normal === '1' || normal === 'true'
}

export function readUrlOptions(url: URL): UrlOptions {
  const params = url.searchParams
  const profile = text(params, 'profile')
  const theme = text(params, 'theme')
  const lang = text(params, 'lang')
  return {
    example: text(params, 'example'),
    src: text(params, 'src'),
    profile: profile !== null && BUILTIN_IDS.includes(profile) ? profile : null,
    title: text(params, 'title'),
    autorun: flag(params, 'autorun'),
    readonly: flag(params, 'readonly'),
    showProfile: flag(params, 'showProfile'),
    debug: flag(params, 'debug'),
    theme: theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system',
    lang: lang === 'es' || lang === 'en' ? lang : null,
  }
}
