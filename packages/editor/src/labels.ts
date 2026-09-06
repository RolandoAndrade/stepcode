import type { ResolvedProfile, TypeKey } from '@stepcode/profiles'
import type { Type } from 'stepcode'
import type { Strings } from './strings'

function spelling(key: TypeKey, profile: ResolvedProfile): string {
  return profile.types[key][0] ?? key
}

/** A type as the user spells it: the profile's first spelling, arrays through the strings. */
export function typeLabel(type: Type, profile: ResolvedProfile, strings: Strings): string {
  switch (type.kind) {
    case 'scalar':
      return spelling(type.name, profile)
    case 'array':
      return strings.variables.arrayOf(spelling(type.element, profile), type.rank)
    case 'unknown':
      return '?'
  }
}
