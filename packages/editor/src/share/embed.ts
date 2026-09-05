import type { ThemePreference } from '../theme/types'

/** Spec §5: the options the Insertar tab writes into the embed URL. */
export interface EmbedOptions {
  readonly readonly: boolean
  readonly autorun: boolean
  readonly debug: boolean
  readonly showProfile: boolean
  readonly theme: ThemePreference
}

export const DEFAULT_EMBED_OPTIONS: EmbedOptions = {
  readonly: false,
  autorun: false,
  debug: false,
  showProfile: false,
  theme: 'system',
}

export const DEFAULT_EMBED_HEIGHT = 480
export const MIN_EMBED_HEIGHT = 200
/** The dialog's preview is capped; the snippet keeps whatever the teacher typed. */
export const PREVIEW_MAX_HEIGHT = 360

const FLAGS = ['readonly', 'autorun', 'debug', 'showProfile'] as const

/**
 * Spec §5: `<base>embed[?flags]<hash>`. Only what differs from the defaults is written, so the
 * snippet a teacher pastes stays as short as the choices they actually made.
 */
export function embedUrl(
  hash: string,
  options: EmbedOptions,
  base: string = `${location.origin}/`,
): string {
  const parts: string[] = []
  for (const flag of FLAGS) if (options[flag] !== DEFAULT_EMBED_OPTIONS[flag]) parts.push(flag)
  if (options.theme !== DEFAULT_EMBED_OPTIONS.theme) parts.push(`theme=${options.theme}`)
  const query = parts.length === 0 ? '' : `?${parts.join('&')}`
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}embed${query}${hash}`
}

/** HTML attribute text: the URL's own `&` would otherwise start an entity. */
function attribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function embedSnippet(url: string, height: number, title: string): string {
  const pixels = Math.max(Math.round(height), MIN_EMBED_HEIGHT)
  return `<iframe src="${attribute(url)}" width="100%" height="${pixels}" style="border:0" loading="lazy" title="${attribute(title)}"></iframe>`
}
