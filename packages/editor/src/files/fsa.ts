import type { FileHandle } from '../store/document'

export interface WritableLike {
  write(data: string): Promise<void>
  close(): Promise<void>
}

/** The subset of `FileSystemFileHandle` the editor uses; typed here because lib.dom lacks the pickers. */
export interface FileSystemFileHandleLike extends FileHandle {
  getFile(): Promise<File>
  createWritable(): Promise<WritableLike>
}

export interface PickerType {
  readonly description: string
  readonly accept: Readonly<Record<string, readonly string[]>>
}

export interface OpenOptions {
  readonly types: readonly PickerType[]
  readonly multiple?: boolean
}

export interface SaveOptions {
  readonly types: readonly PickerType[]
  readonly suggestedName?: string
}

export interface FilePickers {
  readonly open?: (options: OpenOptions) => Promise<FileSystemFileHandleLike[]>
  readonly save?: (options: SaveOptions) => Promise<FileSystemFileHandleLike>
}

/** Reads `showOpenFilePicker`/`showSaveFilePicker` off `window` when the browser has them. */
export function pickersFrom(win: object): FilePickers {
  const w = win as Record<string, unknown>
  const open =
    typeof w.showOpenFilePicker === 'function'
      ? (w.showOpenFilePicker as (o: OpenOptions) => Promise<FileSystemFileHandleLike[]>).bind(win)
      : undefined
  const save =
    typeof w.showSaveFilePicker === 'function'
      ? (w.showSaveFilePicker as (o: SaveOptions) => Promise<FileSystemFileHandleLike>).bind(win)
      : undefined
  return {
    ...(open === undefined ? {} : { open }),
    ...(save === undefined ? {} : { save }),
  }
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
