import { useEffect, useState } from 'react'

const KEYBOARD_GAP = 100

/** Spec §9: VisualViewport shorter than the layout viewport by > 100 px, else focus on coarse pointers. */
export function keyboardVisible(
  layoutHeight: number,
  visualHeight: number | undefined,
  coarse: boolean,
  editorFocused: boolean,
): boolean {
  if (!editorFocused) return false
  if (visualHeight !== undefined) return layoutHeight - visualHeight > KEYBOARD_GAP
  return coarse
}

export function useKeyboardVisible(
  editorFocused: boolean,
  win: Window | undefined = typeof window === 'undefined' ? undefined : window,
): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (win === undefined) return
    const coarse = win.matchMedia?.('(pointer: coarse)').matches ?? false
    const compute = (): void =>
      setVisible(
        keyboardVisible(win.innerHeight, win.visualViewport?.height, coarse, editorFocused),
      )
    compute()
    win.visualViewport?.addEventListener('resize', compute)
    return () => win.visualViewport?.removeEventListener('resize', compute)
  }, [editorFocused, win])
  return visible
}
