import type { DockviewPanelApi, IDockviewPanelHeaderProps } from 'dockview-react'
import { useEffect, useState } from 'react'
import { useEditorStore } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'

/**
 * Spec §3.1 wants "the active tab of a group", which is not `api.isActive` (that one is the active
 * panel of the *active* group, so every tab of an unfocused group would read inactive). Dockview
 * renders the tab once and updates it through events, so the flag has to be state.
 */
function useActiveInGroup(api: DockviewPanelApi): boolean {
  const [active, setActive] = useState(() => api.group.activePanel?.id === api.id)
  useEffect(() => {
    const sync = () => setActive(api.group.activePanel?.id === api.id)
    let inGroup = api.group.api.onDidActivePanelChange(sync)
    const moved = api.onDidGroupChange(() => {
      inGroup.dispose()
      inGroup = api.group.api.onDidActivePanelChange(sync)
      sync()
    })
    sync()
    return () => {
      inGroup.dispose()
      moved.dispose()
    }
  }, [api])
  return active
}

/** Spec §3.1: label only, accent underline on the active tab, nothing else. */
export function Tab(props: IDockviewPanelHeaderProps) {
  const strings = useEditorStore(stringsOf)
  const id = props.api.id as PanelId
  const active = useActiveInGroup(props.api)
  return (
    <div
      role="tab"
      aria-selected={active}
      // Dockview owns the tab's focus and keyboard handling on the wrapper it renders around this
      // one; the label carries the role and the selected state so both read the panel's own title.
      tabIndex={-1}
      className={`sc-tab relative flex h-7 items-center px-3 text-xs ${active ? 'sc-tab-active text-fg' : 'text-muted'}`}
    >
      {strings.panels[id] ?? props.api.title ?? id}
    </div>
  )
}
