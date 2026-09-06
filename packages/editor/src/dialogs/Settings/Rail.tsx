import * as Tabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { useEditorStore } from '../../store/context'
import { stringsOf } from '../../store/store'
import type { SettingsPage } from './Settings'

/** A vertical rail of sections on `sm:` and up, a horizontal strip below. */
export function Rail({
  pages,
  value,
  onChange,
  children,
}: {
  pages: readonly SettingsPage[]
  value: SettingsPage
  onChange: (page: SettingsPage) => void
  children: ReactNode
}) {
  const strings = useEditorStore(stringsOf)
  return (
    <Tabs.Root
      value={value}
      onValueChange={(next) => onChange(next as SettingsPage)}
      orientation="vertical"
      className="flex min-h-0 flex-1 flex-col sm:flex-row"
    >
      <Tabs.List className="flex shrink-0 flex-row overflow-auto border-border border-b sm:w-40 sm:flex-col sm:border-r sm:border-b-0 sm:p-2">
        {pages.map((page) => (
          <Tabs.Trigger
            key={page}
            value={page}
            onClick={() => onChange(page)}
            className="whitespace-nowrap px-3 py-2 text-left text-sm text-muted data-[state=active]:text-fg data-[state=active]:font-semibold sm:rounded-md sm:data-[state=active]:bg-surface-raised"
          >
            {strings.settings.sections[page]}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  )
}
