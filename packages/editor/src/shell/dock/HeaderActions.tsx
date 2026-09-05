import type { IDockviewHeaderActionsProps } from 'dockview-react'
import { PanelActions } from '../../panels/PanelActions'
import { useEditorStore } from '../../store/context'
import type { PanelId } from '../../store/layout'
import { stringsOf } from '../../store/store'
import { ChevronDown, ChevronUp } from '../../ui/icons'
import { IconButton } from '../../ui/Tooltip'
import type { CollapseController } from './collapse'

export function HeaderActions(
  props: IDockviewHeaderActionsProps & {
    controller: CollapseController | null
    collapsedIds: readonly string[]
  },
) {
  const strings = useEditorStore(stringsOf)
  const panel = props.activePanel?.id as PanelId | undefined
  const collapsible =
    props.api.location.type === 'grid' && panel !== 'editor' && props.controller !== null
  const collapsed = props.collapsedIds.includes(props.group.id)
  return (
    <div className="flex h-7 items-center gap-1 pr-1">
      {panel !== undefined && !collapsed ? <PanelActions panel={panel} /> : null}
      {collapsible ? (
        <IconButton
          label={collapsed ? strings.dock.expand : strings.dock.collapse}
          onClick={() => props.controller?.toggle(props.group.id)}
        >
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
      ) : null}
    </div>
  )
}
