/** Spec §2.2: `⌘` on macOS, `Ctrl` elsewhere, decided once from the platform string. */
export function isMac(platform: string | undefined = globalThis.navigator?.platform): boolean {
  return platform !== undefined && /mac/i.test(platform)
}

export type Shortcut = string

const MAC_GLYPHS: Readonly<Record<string, string>> = { Ctrl: '⌘', Shift: '⇧', Alt: '⌥' }

/** `'Ctrl+Shift+S'` → `'⇧⌘S'` on mac (modifiers in the platform's order), unchanged elsewhere. */
export function keyLabel(shortcut: Shortcut, mac: boolean): string {
  if (!mac) return shortcut
  const parts = shortcut.split('+')
  const key = parts.pop() ?? ''
  const modifiers = parts.map((part) => MAC_GLYPHS[part] ?? part)
  const ordered = ['⌥', '⇧', '⌘'].filter((glyph) => modifiers.includes(glyph))
  return `${ordered.join('')}${key}`
}
