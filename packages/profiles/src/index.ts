export const packageName = '@stepcode/profiles'

export { builtinProfiles, defaultProfile, profiles } from './builtin'
export type { ProfileErrorCode } from './errors'
export { ProfileError } from './errors'
export type { BuiltinKey, KeywordKey, OperatorKey, TypeKey } from './keys'
export { BUILTIN_KEYS, KEYWORD_KEYS, OPERATOR_KEYS, OPTIONAL_KEYWORD_KEYS, TYPE_KEYS } from './keys'
export type { Normalizer } from './normalize'
export { collapseWhitespace, createNormalizer } from './normalize'
export type { LookupEntry, LookupKind, ProfileRegistry, ResolvedProfile } from './resolve'
export { MAX_EXTENDS_DEPTH, resolveProfile } from './resolve'
export type { ProfileData, ProfileInput, ProfileOptions } from './schema'
export {
  DEFAULT_OPTIONS,
  LOCALE_PATTERN,
  ProfileInputSchema,
  ProfileOptionsSchema,
  profileJsonSchema,
  ResolvedProfileDataSchema,
  SpellingsSchema,
} from './schema'
