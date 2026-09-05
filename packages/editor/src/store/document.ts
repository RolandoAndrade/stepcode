/** What a file handle is to the store: the files module (Task 5) narrows it to the real one. */
export interface FileHandle {
  readonly name: string
}

/** A whole document about to replace the current one (Nuevo, Abrir, an example, a share link). */
export interface DocumentDraft {
  readonly name: string
  readonly source: string
  readonly profileId?: string
}

export const EXTENSIONS = ['.stepcode', '.psc', '.txt', '.sc'] as const

/** Spec §8.1: dirty means the text differs from the last file save (or the starter program). */
export function isDirty(state: { readonly source: string; readonly savedSource: string }): boolean {
  return state.source !== state.savedSource
}

/** Trims and appends `.stepcode` when the name has no known extension; blank stays blank. */
export function nameWithExtension(raw: string): string {
  const name = raw.trim()
  if (name === '') return ''
  return EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension))
    ? name
    : `${name}.stepcode`
}
