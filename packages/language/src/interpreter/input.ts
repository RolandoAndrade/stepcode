import type { ResolvedProfile } from '@stepcode/profiles'
import type { Type } from '../types/type'
import { INTEGER_TEXT, parseReal, type Scalar } from './value'

/** The E4004 hint: every rejectable type has one, and `Cadena` never rejects (§6.1). */
export type InputHint = 'integer' | 'real' | 'boolean' | 'char'

export type InputResult =
  | { readonly ok: true; readonly value: Scalar }
  | { readonly ok: false; readonly hint: InputHint; readonly text: string }

const accepted = (value: Scalar): InputResult => ({ ok: true, value })
const rejected = (hint: InputHint, text: string): InputResult => ({ ok: false, hint, text })

function spelled(spellings: readonly string[], text: string, profile: ResolvedProfile): boolean {
  const wanted = profile.normalize(text)
  return spellings.some((spelling) => profile.normalize(spelling) === wanted)
}

/**
 * §5.7: trim, then parse by the target's static type. The text a rejection carries is the
 * trimmed one, so the message quotes what the reader typed without its surrounding space.
 */
export function parseInput(text: string, type: Type, profile: ResolvedProfile): InputResult {
  if (type.kind !== 'scalar') throw new Error('parseInput: a Leer target is always a scalar')
  const trimmed = text.trim()
  switch (type.name) {
    case 'integer':
      return INTEGER_TEXT.test(trimmed) ? accepted(Number(trimmed)) : rejected('integer', trimmed)
    case 'real': {
      const value = parseReal(trimmed)
      return value === undefined ? rejected('real', trimmed) : accepted(value)
    }
    case 'boolean':
      if (spelled(profile.keywords.true, trimmed, profile)) return accepted(true)
      if (spelled(profile.keywords.false, trimmed, profile)) return accepted(false)
      return rejected('boolean', trimmed)
    case 'char':
      return [...trimmed].length === 1 ? accepted(trimmed) : rejected('char', trimmed)
    case 'string':
      return accepted(trimmed)
  }
}
