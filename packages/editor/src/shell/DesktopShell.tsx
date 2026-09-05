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
import { autoExpandTarget } from './autoExpand'
import { CollapseController } from './dock/collapse'
import { applyDefaultLayout } from './dock/defaultLayout'
import { HeaderActions } from './dock/HeaderActions'
import { DockContext, dockComponents } from './dock/panels'
import { Tab } from './dock/Tab'
import { DOCK_THEME, HEADER_HEIGHT } from './dock/theme'

const tabComponents = { tab: Tab }

export function DesktopShell({ editorRef }: { editorRef: RefObject<EditorHandle | null> }) {
  const store = useEditorStoreApi()
  const apiRef = useRef<DockviewApi | null>(null)
  const controllerRef = useRef<CollapseController | null>(null)
  const layoutListenerRef = useRef<{ dispose(): void } | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<readonly string[]>([])
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

  const reset = useCallback(() => {
    const api = apiRef.current
    if (api === null) return
    rebuilding.current = true
    controllerRef.current?.dispose()
    api.clear()
    const { bottomGroupId } = applyDefaultLayout(api)
    const controller = new CollapseController(api, HEADER_HEIGHT, (ids) => {
      setCollapsedIds(ids)
      save()
    })
    controllerRef.current = controller
    controller.collapse(bottomGroupId)
    manuallyCollapsed.current.clear()
    rebuilding.current = false
    save()
  }, [save])

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
        if (editorGroup !== undefined) editorGroup.locked = true
        const controller = new CollapseController(api, HEADER_HEIGHT, (ids) => {
          setCollapsedIds(ids)
          save()
        })
        controllerRef.current = controller
        controller.restoreFrom(saved.collapsed)
        save()
      } else {
        reset()
      }
      layoutListenerRef.current = api.onDidLayoutChange(() => save())
    },
    [store, save, reset],
  )

  useEffect(
    () => () => {
      layoutListenerRef.current?.dispose()
      layoutListenerRef.current = null
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
      const event = autoExpandTarget(before, next, next.settings.layout.showConsoleOnRun)
      if (event !== null) reveal(event.panel, true)
    })
  }, [store, reset, reveal])

  // A collapse the user performs during a run is remembered until the next run (spec §3.4).
  const controllerFor = useCallback((): CollapseController | null => {
    const controller = controllerRef.current
    if (controller === null) return null
    return new Proxy(controller, {
      get(target, key) {
        if (key === 'toggle') {
          return (id: string) => {
            if (!target.isCollapsed(id)) manuallyCollapsed.current.add(id)
            target.toggle(id)
          }
        }
        return Reflect.get(target, key)
      },
    })
  }, [])

  const rightHeaderActionsComponent = useCallback(
    (props: IDockviewHeaderActionsProps) => (
      <HeaderActions {...props} controller={controllerFor()} collapsedIds={collapsedIds} />
    ),
    [controllerFor, collapsedIds],
  )

  return (
    <DockContext.Provider value={context}>
      <DockviewReact
        className="h-full w-full"
        theme={DOCK_THEME}
        components={dockComponents}
        tabComponents={tabComponents}
        rightHeaderActionsComponent={rightHeaderActionsComponent}
        onReady={onReady}
        // Spec §3.1/§3.6: every panel stays mounted, so CodeMirror keeps its view and the console
        // keeps its scroll position while another tab of the group is in front.
        defaultRenderer="always"
        singleTabMode="fullwidth"
        floatingGroupBounds="boundedWithinViewport"
      />
    </DockContext.Provider>
  )
}
