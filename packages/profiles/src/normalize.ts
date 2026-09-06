import type { ProfileOptions } from './schema'

export type Normalizer = (text: string) => string

export function collapseWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/**
 * Strips combining accent marks but keeps ñ/Ñ, which are letters in Spanish, not
 * accented n. NFD-decomposition turns ñ/Ñ into `n`/`N` plus a combining tilde
 * (U+0303), same as every accented vowel, so a blind "strip combining marks" pass would fold
 * them away too. We recompose ñ/Ñ back to their precomposed form *before* stripping
 * combining marks, then normalize once more to NFC for the rest of the text.
 *
 * The regexes use explicit \uXXXX escapes (not the literal decomposed characters) so the
 * source is legible and immune to an editor silently re-encoding these invisible bytes.
 */
function foldAccentMarks(text: string): string {
  return text
    .normalize('NFD')
    .replace(/n\u0303/g, '\u00f1') // n + combining tilde -> ñ
    .replace(/N\u0303/g, '\u00d1') // N + combining tilde -> Ñ
    .replace(/[\u0300-\u036f]/g, '') // strip remaining combining diacritical marks
    .normalize('NFC')
}

export function createNormalizer(
  options: Pick<ProfileOptions, 'caseSensitive' | 'foldAccents'>,
): Normalizer {
  return (text) => {
    let out = collapseWhitespace(text)
    if (options.foldAccents) out = foldAccentMarks(out)
    if (!options.caseSensitive) out = out.toLowerCase()
    return out
  }
}
