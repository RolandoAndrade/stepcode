import type { IDockviewHeaderActionsProps } from 'dockview-react'
import { PanelActions } from '../../panels/PanelActions'
import { useEditorStore } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'
import { ChevronDown } from '../../ui/icons'
import { IconButton } from '../../ui/Tooltip'

/**
 * Spec §3.3: the chevron only ever collapses. A collapsed group is hidden outright, header and
 * all, so this component is never on screen for one — the sidebar is what brings it back.
 */
export function HeaderActions(
  props: IDockviewHeaderActionsProps & { onCollapse: (groupId: string) => void },
) {
  const strings = useEditorStore(stringsOf)
  const panel = props.activePanel?.id as PanelId | undefined
  const collapsible = props.api.location.type === 'grid' && panel !== 'editor'
  return (
    <div className="flex h-7 items-center gap-1 pr-1">
      {panel !== undefined ? <PanelActions panel={panel} /> : null}
      {collapsible ? (
        <IconButton label={strings.dock.collapse} onClick={() => props.onCollapse(props.group.id)}>
          <ChevronDown />
        </IconButton>
      ) : null}
    </div>
  )
}
