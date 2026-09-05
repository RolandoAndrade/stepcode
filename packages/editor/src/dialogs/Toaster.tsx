import * as Toast from '@radix-ui/react-toast'
import { useEffect } from 'react'
import { useEditorStore } from '../store/context'

const DURATION = 4000

/**
 * Spec §8.7: transient confirmations (saved, copied, …), auto-dismissed.
 *
 * Plain list items inside the Radix viewport, not `Toast.Root`: Radix's own screen-reader
 * announcer duplicates the toast's accessible text into a second `role="status"` node on a
 * requestAnimationFrame delay, which both collides with our own status role and cannot appear
 * synchronously under fake timers. One status role, populated immediately, is what callers need.
 */
export function Toaster() {
  const toasts = useEditorStore((s) => s.toasts)
  const dismiss = useEditorStore((s) => s.dismissToast)
  // Dismissal is owned here (not by a Radix timer) so it is deterministic under fake timers.
  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => dismiss(toast.id), DURATION))
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [toasts, dismiss])
  return (
    <Toast.Provider duration={DURATION}>
      <Toast.Viewport className="fixed right-4 bottom-8 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <li
            key={toast.id}
            role="status"
            className="list-none rounded-md bg-surface-raised px-3 py-2 text-fg text-sm shadow-panel"
          >
            {toast.message}
          </li>
        ))}
      </Toast.Viewport>
    </Toast.Provider>
  )
}
