import type { DockviewPanelApi, IDockviewPanelHeaderProps } from 'dockview-react'
import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'
import { useDockContext } from './panels'

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

/**
 * Spec §3.1: label only, accent underline on the active tab, nothing else. The role, the selected
 * state and the accessible name stay on dockview's own `.dv-tab` wrapper, whose `aria-label` is the
 * panel title — `PANEL_TITLES` sets that to the very words rendered here.
 */
export function Tab(props: IDockviewPanelHeaderProps) {
  const strings = useEditorStore(stringsOf)
  const { controller } = useDockContext()
  const id = props.api.id as PanelId
  const active = useActiveInGroup(props.api)
  const label = useRef<HTMLDivElement>(null)

  // Spec §3.3: clicking a label in a collapsed strip expands the group and activates that tab. The
  // listener sits on dockview's wrapper — the element that already carries the tab role and focus.
  useEffect(() => {
    const target = label.current?.closest('.dv-tab') ?? label.current
    if (target === null || target === undefined) return
    const onClick = () => {
      props.api.setActive()
      const groupId = props.api.group.id
      if (controller.current?.isCollapsed(groupId) === true) controller.current.expand(groupId)
    }
    target.addEventListener('click', onClick)
    return () => target.removeEventListener('click', onClick)
  }, [props.api, controller])

  return (
    <div
      ref={label}
      className={`sc-tab relative flex h-7 items-center px-3 text-xs ${active ? 'sc-tab-active text-fg' : 'text-muted'}`}
    >
      {strings.panels[id] ?? props.api.title ?? id}
    </div>
  )
}
