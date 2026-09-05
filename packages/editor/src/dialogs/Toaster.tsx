import * as Toast from '@radix-ui/react-toast'
import { useEditorStore } from '../store/context'

const DURATION = 4000

/**
 * Spec §8.7: transient confirmations (saved, copied, …), auto-dismissed.
 *
 * `Toast.Provider`'s `duration` is the single source of timing: each `Toast.Root` starts its own
 * close timer from it (also giving pause-on-hover/focus and swipe-to-dismiss for free), and
 * `onOpenChange` removes the toast from the store when that timer — or a swipe — closes it.
 */
export function Toaster() {
  const toasts = useEditorStore((s) => s.toasts)
  const dismiss = useEditorStore((s) => s.dismissToast)
  return (
    <Toast.Provider duration={DURATION}>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          onOpenChange={(open) => !open && dismiss(toast.id)}
          className="rounded-md bg-surface-raised px-3 py-2 text-fg text-sm shadow-panel"
        >
          <Toast.Description>{toast.message}</Toast.Description>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed right-4 bottom-8 z-modal flex flex-col gap-2" />
    </Toast.Provider>
  )
}
