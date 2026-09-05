import type { IDockviewPanelProps } from 'dockview-react'
import { createContext, type RefObject, useContext } from 'react'
import { Console } from '../../panels/Console'
import { Editor, type EditorHandle } from '../../panels/Editor'
import { Problems } from '../../panels/Problems'
import { Variables } from '../../panels/Variables'

export interface DockContextValue {
  readonly editor: RefObject<EditorHandle | null>
}

export const DockContext = createContext<DockContextValue | null>(null)

export function useDockContext(): DockContextValue {
  const context = useContext(DockContext)
  if (context === null) throw new Error('dock panels need a DockContext')
  return context
}

function useEditorRef(): RefObject<EditorHandle | null> {
  return useDockContext().editor
}

function EditorPanel(_: IDockviewPanelProps) {
  return <Editor handleRef={useEditorRef()} />
}

function ConsolePanel(_: IDockviewPanelProps) {
  const editor = useEditorRef()
  return <Console onReveal={(line) => editor.current?.revealLine(line)} />
}

function ProblemsPanel(_: IDockviewPanelProps) {
  const editor = useEditorRef()
  return <Problems onReveal={(from, to) => editor.current?.revealSpan(from, to)} />
}

function VariablesPanel(_: IDockviewPanelProps) {
  return <Variables />
}

/** The dockview component registry; ids double as `PanelId`s. */
export const dockComponents = {
  editor: EditorPanel,
  console: ConsolePanel,
  problems: ProblemsPanel,
  variables: VariablesPanel,
}
