export type ProfileErrorCode =
  | 'PROFILE_INVALID'
  | 'PROFILE_UNKNOWN_PARENT'
  | 'PROFILE_DEPTH'
  | 'PROFILE_CYCLE'
  | 'PROFILE_MISSING_SPELLING'
  | 'PROFILE_INVALID_SPELLING'
  | 'PROFILE_COLLISION'

export class ProfileError extends Error {
  override readonly name = 'ProfileError'

  constructor(
    readonly code: ProfileErrorCode,
    message: string,
    readonly path: readonly string[] = [],
  ) {
    super(message)
  }
}
