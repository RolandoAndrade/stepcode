import enJson from './profiles/en.json'
import esJson from './profiles/es.json'
import pseintJson from './profiles/pseint.json'
import { type ProfileRegistry, type ResolvedProfile, resolveProfile } from './resolve'
import type { ProfileInput } from './schema'

const inputs: readonly ProfileInput[] = [
  esJson as unknown as ProfileInput,
  enJson as unknown as ProfileInput,
  pseintJson as unknown as ProfileInput,
]

/** The shipped profiles, by id, usable as the `registry` argument of `resolveProfile`. */
export const builtinProfiles: ProfileRegistry = new Map(inputs.map((p) => [p.id, p]))

export const profiles: {
  readonly es: ResolvedProfile
  readonly en: ResolvedProfile
  readonly pseint: ResolvedProfile
} = Object.freeze({
  es: resolveProfile(esJson, builtinProfiles),
  en: resolveProfile(enJson, builtinProfiles),
  pseint: resolveProfile(pseintJson, builtinProfiles),
})

export const defaultProfile: ResolvedProfile = profiles.es
