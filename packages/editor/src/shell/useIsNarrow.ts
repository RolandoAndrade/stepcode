import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

interface MediaList {
  readonly matches: boolean
  addEventListener(type: 'change', listener: (event: { matches: boolean }) => void): void
  removeEventListener(type: 'change', listener: (event: { matches: boolean }) => void): void
}

/**
 * The default is bound once, at module scope: a fresh bound function per render would be a new
 * effect dependency every time, re-subscribing the listener on each render.
 */
const DEFAULT_MATCH_MEDIA: ((query: string) => MediaList) | undefined =
  typeof window === 'undefined' ? undefined : window.matchMedia?.bind(window)

/** Spec §9: the phone shell below 768 px, re-evaluated on every change. */
export function useIsNarrow(
  matchMedia: ((query: string) => MediaList) | undefined = DEFAULT_MATCH_MEDIA,
): boolean {
  const [narrow, setNarrow] = useState(() => matchMedia?.(QUERY).matches ?? false)
  useEffect(() => {
    if (matchMedia === undefined) return
    const list = matchMedia(QUERY)
    const listener = (event: { matches: boolean }): void => setNarrow(event.matches)
    list.addEventListener('change', listener)
    return () => list.removeEventListener('change', listener)
  }, [matchMedia])
  return narrow
}
