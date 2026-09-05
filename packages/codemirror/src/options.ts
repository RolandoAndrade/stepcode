import type { ResolvedProfile } from '@stepcode/profiles'

/** What every language feature needs: the profile the tree was built with and a locale. */
export interface StepcodeOptions {
  readonly profile: ResolvedProfile
  readonly locale: string
}
