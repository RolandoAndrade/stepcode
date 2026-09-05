import * as RadixTooltip from '@radix-ui/react-tooltip'
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from 'react'
import { isMac, keyLabel } from './keys'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={400}>{children}</RadixTooltip.Provider>
}

export function tooltipText(label: string, shortcut?: string): string {
  return shortcut === undefined ? label : `${label} · ${keyLabel(shortcut, isMac())}`
}

/** Spec §2.2: "Label · Shortcut", pointer devices only (touch gets the aria-label alone). */
export function Tooltip({
  label,
  shortcut,
  children,
}: {
  label: string
  shortcut?: string
  children: ReactNode
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="bottom"
          sideOffset={6}
          className="pointer-events-none z-modal rounded bg-surface-raised px-2 py-1 text-fg text-xs shadow-panel [@media(hover:none)]:hidden"
        >
          {tooltipText(label, shortcut)}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

const SIZES = { toolbar: 'h-7 w-7', dialog: 'h-8 w-8' } as const

/** What the action does, in color: go, stop, or nothing in particular. */
const TONES = { neutral: 'text-fg', success: 'text-success', error: 'text-error' } as const

type IconButtonOwnProps = {
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  size?: keyof typeof SIZES
  tone?: keyof typeof TONES
  children: ReactNode
}

export type IconButtonProps = IconButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof IconButtonOwnProps | 'type' | 'className'>

/**
 * Forwards its ref and spreads unknown props onto the inner `<button>` so a Radix `asChild`
 * trigger (which clones its own ref/handlers/aria-* onto its single child) can compose with
 * this component instead of having them silently dropped.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    shortcut,
    onClick,
    disabled = false,
    active = false,
    size = 'toolbar',
    tone = 'neutral',
    children,
    ...rest
  },
  ref,
) {
  const button = (
    <button
      {...rest}
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={active ? true : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex ${SIZES[size]} ${TONES[tone]} items-center justify-center rounded transition-colors duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-accent-soft text-accent' : ''}`}
    >
      {children}
    </button>
  )
  return shortcut === undefined && label === '' ? (
    button
  ) : (
    <Tooltip label={label} {...(shortcut === undefined ? {} : { shortcut })}>
      {button}
    </Tooltip>
  )
})
