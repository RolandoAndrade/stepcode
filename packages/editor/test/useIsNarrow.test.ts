// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useIsNarrow } from '../src/shell/useIsNarrow'

describe('useIsNarrow', () => {
  it('follows the media query', () => {
    let listener: ((e: { matches: boolean }) => void) | null = null
    const list = {
      matches: true,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => {
        listener = fn
      },
      removeEventListener: () => {},
    }
    const { result } = renderHook(() => useIsNarrow(() => list as never))
    expect(result.current).toBe(true)
    act(() => listener?.({ matches: false }))
    expect(result.current).toBe(false)
  })
})
