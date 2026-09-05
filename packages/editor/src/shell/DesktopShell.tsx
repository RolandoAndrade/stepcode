import 'dockview-react/dist/styles/dockview.css'
import './dock/dock.css'
import {
  type DockviewApi,
  DockviewReact,
  type DockviewReadyEvent,
  type IDockviewHeaderActionsProps,
} from 'dockview-react'
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EditorHandle } from '../panels/Editor'
import { useEditorStoreApi } from '../store/context'
import type { PanelId } from '../store/layout'
import { stringsOf } from '../store/store'
import { autoExpandTarget } from './autoExpand'
import { CollapseController } from './dock/collapse'
import { applyDefaultLayout, hideEditorHeader, PANEL_TITLES } from './dock/defaultLayout'
import { HeaderActions } from './dock/HeaderActions'
import { HIDDEN_PANEL_STATES, panelStatesOf, sidebarActionFor } from './dock/panelStates'
import { DockContext, dockComponents } from './dock/panels'
import { Tab } from './dock/Tab'
import { DOCK_THEME } from './dock/theme'
import { type PanelStates, Sidebar, type Zone } from './Sidebar'

const tabComponents = { tab: Tab }

/** dockview's own mapping, spelled out here because it does not export it. */
function positionToDirection(position: 'top' | 'bottom' | 'right'): 'above' | 'below' | 'right' {
  if (position === 'top') return 'above'
  return position === 'bottom' ? 'below' : 'right'
}

export function DesktopShell({ editorRef }: { editorRef: RefObject<EditorHandle | null> }) {
  const store = useEditorStoreApi()
  const apiRef = useRef<DockviewApi | null>(null)
  // Dockview owns its root element; the shell reaches it through the box it renders into.
  const dockRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<CollapseController | null>(null)
  const disposablesRef = useRef<{ dispose(): void }[]>([])
  const [panelStates, setPanelStates] = useState<PanelStates>(HIDDEN_PANEL_STATES)
  const manuallyCollapsed = useRef(new Set<string>())
  const context = useMemo(() => ({ editor: editorRef }), [editorRef])

  // `api.clear()` empties the grid one view at a time and fires a layout change per step; asking a
  // half-torn-down dockview for its JSON throws, so rebuilding suspends saving until it is done.
  const rebuilding = useRef(false)

  const save = useCallback(() => {
    const api = apiRef.current
    const controller = controllerRef.current
    if (api === null || controller === null || rebuilding.current) return
    store
      .getState()
      .setDockLayout(api.toJSON() as unknown as Record<string, unknown>, controller.collapsedIds())
  }, [store])

  /**
   * What the collapse animation needs: the dock root to mark, and a forced relayout. The forced
   * one re-fires the size events dockview's render overlays are positioned from, so the panels
   * follow the sliding frames instead of staying at the geometry they had when the slide began.
   */
  const animationFor = useCallback((api: DockviewApi) => {
    const root = dockRef.current?.querySelector<HTMLElement>('.sc-dock') ?? null
    if (root === null) return null
    return { root, relayout: () => api.layout(api.width, api.height, true) }
  }, [])

  /** The sidebar's own view of the dock, recomputed whenever the dock reports a change. */
  const syncPanelStates = useCallback(() => {
    const api = apiRef.current
    const controller = controllerRef.current
    if (api === null || controller === null) return
    setPanelStates(panelStatesOf(api, (groupId) => controller.isCollapsed(groupId)))
  }, [])

  const reset = useCallback(() => {
    const api = apiRef.current
    if (api === null) return
    rebuilding.current = true
    controllerRef.current?.dispose()
    api.clear()
    const { bottomGroupId } = applyDefaultLayout(api, PANEL_TITLES(stringsOf(store.getState())))
    const controller = new CollapseController(
      api,
      () => {
        syncPanelStates()
        save()
      },
      animationFor(api),
    )
    controllerRef.current = controller
    controller.withoutAnimation(() => controller.collapse(bottomGroupId))
    manuallyCollapsed.current.clear()
    rebuilding.current = false
    save()
  }, [save, store, syncPanelStates, animationFor])

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      const api = event.api
      apiRef.current = api
      const saved = store.getState().layout
      let restored = false
      if (saved.dockview !== null) {
        try {
          api.fromJSON(saved.dockview as never)
          restored = api.panels.length === 4 && api.getPanel('editor') !== undefined
          if (!restored) api.clear()
        } catch (error) {
          console.warn('stepcode: discarding the saved layout', error)
          api.clear()
        }
      }
      if (restored) {
        const editorGroup = api.getPanel('editor')?.group
        if (editorGroup !== undefined) {
          editorGroup.locked = true
          hideEditorHeader(editorGroup)
        }
        // The serialized titles are whatever locale saved them; re-apply the current ones.
        const titles = PANEL_TITLES(stringsOf(store.getState()))
        for (const id of Object.keys(titles) as PanelId[]) api.getPanel(id)?.setTitle(titles[id])
        const controller = new CollapseController(
          api,
          () => {
            syncPanelStates()
            save()
          },
          animationFor(api),
        )
        controllerRef.current = controller
        controller.restoreFrom(saved.collapsed)
        save()
      } else {
        reset()
      }
      syncPanelStates()
      disposablesRef.current.push(
        api.onDidLayoutChange(() => {
          syncPanelStates()
          save()
        }),
        // A tab in front of its group is the sidebar's "active"; activating one always makes its
        // group the active group, so the component-level event covers every group.
        api.onDidActivePanelChange(() => syncPanelStates()),
        // Spec §3.1: the editor cannot be dragged out of its group. `locked` only refuses drops,
        // so the drag has to be refused at the source.
        api.onWillDragPanel((event) => {
          if (event.panel.id === 'editor') event.nativeEvent.preventDefault()
        }),
      )
    },
    [store, save, reset, syncPanelStates, animationFor],
  )

  useEffect(
    () => () => {
      for (const disposable of disposablesRef.current) disposable.dispose()
      disposablesRef.current = []
    },
    [],
  )

  /** Expand the group holding `panel` and make it the active tab (spec §3.4 / Vista). */
  const reveal = useCallback((panel: PanelId, respectManual: boolean) => {
    const api = apiRef.current
    const controller = controllerRef.current
    const target = api?.getPanel(panel)
    if (api === null || controller === null || target === undefined) return
    const groupId = target.group.id
    if (controller.isCollapsed(groupId)) {
      if (respectManual && manuallyCollapsed.current.has(groupId)) return
      controller.expand(groupId)
    }
    target.api.setActive()
  }, [])

  // A collapse the user performs during a run is remembered until the next run (spec §3.4).
  const collapseManually = useCallback((groupId: string) => {
    const controller = controllerRef.current
    if (controller === null || controller.isCollapsed(groupId)) return
    controller.collapse(groupId)
    // Only a collapse that happened is remembered: the controller refuses non-grid groups.
    if (controller.isCollapsed(groupId)) manuallyCollapsed.current.add(groupId)
  }, [])

  /**
   * Spec §3.3: the sidebar button shows a hidden group, brings its own tab to the front, or —
   * when its panel is already in front — hides the group again. That last one is a manual
   * collapse, exactly like the header chevron, so auto-expand leaves it alone until the next run.
   */
  const toggleFromSidebar = useCallback(
    (panel: PanelId) => {
      const api = apiRef.current
      const controller = controllerRef.current
      const target = api?.getPanel(panel)
      if (controller === null || target === undefined) return
      const groupId = target.group.id
      const action = sidebarActionFor(target.group, panel, controller.isCollapsed(groupId))
      if (action === 'collapse') {
        collapseManually(groupId)
        return
      }
      if (action === 'expand') controller.expand(groupId)
      target.api.setActive()
    },
    [collapseManually],
  )

  /**
   * Spec §3.3: dropping a sidebar icon on another strip docks the panel on that edge. A group
   * that holds nothing else travels whole (dockview makes the new group itself); otherwise only
   * the dragged panel leaves, into a group created at that edge.
   */
  const movePanel = useCallback(
    (panel: PanelId, zone: Zone) => {
      const api = apiRef.current
      const controller = controllerRef.current
      const target = api?.getPanel(panel)
      if (api === null || controller === null || target === undefined) return
      const group = target.group
      // A hidden group has nothing to show at its new edge, so the move brings it back first.
      if (controller.isCollapsed(group.id)) controller.expand(group.id)
      const position = zone === 'right' ? 'right' : zone === 'left-top' ? 'top' : 'bottom'
      if (group.panels.length === 1) group.api.moveTo({ position })
      else target.api.moveTo({ group: api.addGroup({ direction: positionToDirection(position) }) })
      target.api.setActive()
      syncPanelStates()
    },
    [syncPanelStates],
  )

  useEffect(() => {
    let previous = store.getState()
    return store.subscribe((next) => {
      // Every branch below writes the layout back through `save()`, which re-enters this listener;
      // move the cursor first so the re-entrant call sees no further transition.
      const before = previous
      previous = next
      if (next.layoutReset !== before.layoutReset) reset()
      if (next.panelRequest !== before.panelRequest && next.panelRequest !== null)
        reveal(next.panelRequest.id, false)
      if (next.runSeq !== before.runSeq) manuallyCollapsed.current.clear()
      const event = autoExpandTarget(before, next)
      // Spec §3.4: run and pause respect a manual collapse; an input request never does — a
      // program blocked on a prompt nobody can see is unusable.
      if (event !== null) reveal(event.panel, event.reason !== 'input')
    })
  }, [store, reset, reveal])

  const rightHeaderActionsComponent = useCallback(
    (props: IDockviewHeaderActionsProps) => (
      <HeaderActions {...props} onCollapse={collapseManually} />
    ),
    [collapseManually],
  )

  return (
    <DockContext.Provider value={context}>
      <Sidebar states={panelStates} onToggle={toggleFromSidebar} onMove={movePanel}>
        <div ref={dockRef} className="h-full min-w-0 flex-1">
          <DockviewReact
            className="h-full w-full"
            theme={DOCK_THEME}
            components={dockComponents}
            tabComponents={tabComponents}
            rightHeaderActionsComponent={rightHeaderActionsComponent}
            onReady={onReady}
            // Spec §3.1: no watermark, ever.
            noPanelsOverlay="emptyGroup"
            // Spec §3.1/§3.6: every panel stays mounted, so CodeMirror keeps its view and the console
            // keeps its scroll position while another tab of the group is in front.
            defaultRenderer="always"
            singleTabMode="fullwidth"
            floatingGroupBounds="boundedWithinViewport"
          />
        </div>
      </Sidebar>
    </DockContext.Provider>
  )
}
