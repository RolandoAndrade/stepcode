import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'
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
          className="pointer-events-none z-50 rounded bg-surface-raised px-2 py-1 text-fg text-xs shadow-panel [@media(hover:none)]:hidden"
        >
          {tooltipText(label, shortcut)}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

const SIZES = { toolbar: 'h-7 w-7', dialog: 'h-8 w-8' } as const

export function IconButton({
  label,
  shortcut,
  onClick,
  disabled = false,
  active = false,
  size = 'toolbar',
  children,
}: {
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  size?: keyof typeof SIZES
  children: ReactNode
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active ? true : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex ${SIZES[size]} items-center justify-center rounded text-fg transition-colors duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-accent-soft text-accent' : ''}`}
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
}
