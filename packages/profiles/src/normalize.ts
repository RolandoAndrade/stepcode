import type { ProfileOptions } from './schema'

export type Normalizer = (text: string) => string

export function collapseWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/** Strips combining accent marks but keeps ñ/Ñ, which are letters in Spanish. */
function foldAccentMarks(text: string): string {
  return text
    .normalize('NFD')
    .replace(/ñ/g, 'ñ')
    .replace(/Ñ/g, 'Ñ')
    .replace(/[̀-ͯ]/g, '')
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
