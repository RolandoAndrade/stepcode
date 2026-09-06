import { profiles, type ResolvedProfile } from '@stepcode/profiles'
import { DEFAULT_SOURCE } from '../store/store'
import { transpose } from './transpose'

/** Spec §8.2: the four-line starter in the active profile's spelling. */
export function starterProgram(profile: ResolvedProfile): string {
  return transpose(DEFAULT_SOURCE, profiles.es, profile)
}
