import type { ResolvedProfile } from '@stepcode/profiles'
import type { Type } from '../types/type'
import { isArrayValue, type RuntimeValue } from './value'

/**
 * §5.6. Used by `Escribir`, by `ConvertirATexto` and by hosts for the variables panel. Numbers
 * print as JS prints them — an integral `Real` has no point, a huge one has an exponent — and a
 * `Logico` prints as the profile's first spelling of `true` / `false`. Arrays never render:
 * E3009 keeps them out of `Escribir`, and a host draws an `ArrayValue` itself.
 */
export function renderValue(value: RuntimeValue, type: Type, profile: ResolvedProfile): string {
  if (isArrayValue(value) || type.kind !== 'scalar') {
    throw new Error('renderValue: an array does not render; hosts render arrays themselves')
  }
  switch (type.name) {
    case 'integer':
    case 'real':
      return String(value)
    case 'boolean':
      return value === true
        ? (profile.keywords.true[0] ?? 'true')
        : (profile.keywords.false[0] ?? 'false')
    case 'string':
    case 'char':
      return String(value)
  }
}
