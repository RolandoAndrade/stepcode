import { starterProgram } from '../profiles/starter'
import { EXTENSIONS, nameWithExtension } from '../store/document'
import { type EditorStore, profileOf, stringsOf } from '../store/store'
import { type FilePickers, type FileSystemFileHandleLike, isAbort, pickersFrom } from './fsa'

export interface FileEnvironment {
  readonly pickers: FilePickers
  /** Fallback save: hand the browser a download. */
  readonly download: (name: string, text: string) => void
  /** Fallback open: an `<input type="file">`; null when the user cancels. */
  readonly pickFallback: () => Promise<File | null>
}

function pickerTypes(description: string) {
  return [{ description, accept: { 'text/plain': [...EXTENSIONS] } }]
}

export function browserEnvironment(win: Window = window): FileEnvironment {
  return {
    pickers: pickersFrom(win),
    download: (name, text) => {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
      const anchor = win.document.createElement('a')
      anchor.href = url
      anchor.download = name
      anchor.click()
      URL.revokeObjectURL(url)
    },
    pickFallback: () =>
      new Promise((resolve) => {
        const input = win.document.createElement('input')
        input.type = 'file'
        input.accept = EXTENSIONS.join(',')
        input.onchange = () => resolve(input.files?.[0] ?? null)
        input.oncancel = () => resolve(null)
        input.click()
      }),
  }
}

/** Spec §8.2 Nuevo: the starter program in the active profile, through the unsaved prompt. */
export function newDocument(store: EditorStore): void {
  const s = store.getState()
  s.requestReplace({ name: stringsOf(s).app.untitled, source: starterProgram(profileOf(s)) })
}

export async function openFile(store: EditorStore, env: FileEnvironment): Promise<void> {
  const s = store.getState()
  try {
    if (env.pickers.open !== undefined) {
      const [handle] = await env.pickers.open({ types: pickerTypes(stringsOf(s).files.accept) })
      if (handle === undefined) return
      const text = await (await handle.getFile()).text()
      s.requestReplace({ name: handle.name, source: text })
      // requestReplace may park the draft; the handle is attached when the draft applies.
      attachHandle(store, handle, text)
      return
    }
    const file = await env.pickFallback()
    if (file === null) return
    s.requestReplace({ name: file.name, source: await file.text() })
  } catch (error) {
    if (!isAbort(error)) store.getState().notify(stringsOf(s).files.openFailed)
  }
}

function attachHandle(store: EditorStore, handle: FileSystemFileHandleLike, text: string): void {
  const apply = (): void => store.getState().markSaved(text, handle)
  if (store.getState().pendingReplace === null) {
    apply()
    return
  }
  const unsubscribe = store.subscribe((next, previous) => {
    if (previous.pendingReplace !== null && next.pendingReplace === null) {
      unsubscribe()
      if (next.source === text) apply()
    }
  })
}

async function writeTo(handle: FileSystemFileHandleLike, text: string): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

export async function saveFile(store: EditorStore, env: FileEnvironment): Promise<void> {
  const s = store.getState()
  const handle = s.handle as FileSystemFileHandleLike | null
  if (handle === null || typeof handle.createWritable !== 'function') return saveFileAs(store, env)
  try {
    await writeTo(handle, s.source)
    s.markSaved(s.source, handle)
    s.notify(stringsOf(s).files.saved)
  } catch (error) {
    if (!isAbort(error)) s.notify(stringsOf(s).files.saveFailed)
  }
}

export async function saveFileAs(store: EditorStore, env: FileEnvironment): Promise<void> {
  const s = store.getState()
  const suggested = nameWithExtension(s.name) || stringsOf(s).app.untitled
  try {
    if (env.pickers.save !== undefined) {
      const handle = await env.pickers.save({
        types: pickerTypes(stringsOf(s).files.accept),
        suggestedName: suggested,
      })
      await writeTo(handle, s.source)
      s.setName(handle.name)
      s.markSaved(s.source, handle)
      s.notify(stringsOf(s).files.saved)
      return
    }
    env.download(suggested, s.source)
    s.markSaved(s.source, null)
    s.notify(stringsOf(s).files.downloaded)
  } catch (error) {
    if (!isAbort(error)) s.notify(stringsOf(s).files.saveFailed)
  }
}
