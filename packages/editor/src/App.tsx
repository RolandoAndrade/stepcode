import { useEffect, useRef } from 'react'
import { installShortcuts } from './components/shortcuts'
import { Toolbar } from './components/Toolbar'
import { Console } from './panels/Console'
import { Editor, type EditorHandle } from './panels/Editor'
import { Problems } from './panels/Problems'
import { Variables } from './panels/Variables'
import { useEditorStoreApi } from './store/context'

/** Spec §7.6: toolbar row, editor two thirds left, Variables over Problems right, Console below. */
export function App() {
  const store = useEditorStoreApi()
  const editor = useRef<EditorHandle | null>(null)

  useEffect(() => installShortcuts(store), [store])

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-bg text-fg">
      <Toolbar />
      <div className="grid min-h-0 grid-cols-[2fr_1fr] grid-rows-[2fr_1fr] gap-px bg-border">
        <div className="min-h-0">
          <Editor handleRef={editor} />
        </div>
        <div className="grid min-h-0 grid-rows-[1fr_1fr] gap-px bg-border">
          <div className="min-h-0">
            <Variables />
          </div>
          <div className="min-h-0">
            <Problems onReveal={(from, to) => editor.current?.revealSpan(from, to)} />
          </div>
        </div>
        <div className="col-span-2 min-h-0">
          <Console />
        </div>
      </div>
    </div>
  )
}
