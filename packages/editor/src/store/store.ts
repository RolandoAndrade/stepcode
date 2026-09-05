import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import {
  builtinProfiles,
  type ProfileInput,
  profiles,
  type ResolvedProfile,
} from '@stepcode/profiles'
import { type Diagnostic, type Frame, formatDiagnostic, LineMap } from 'stepcode'
import { createStore, type StoreApi } from 'zustand/vanilla'
import type { HostApi } from '../runtime/host-api'
import type { InputTarget, RunMode, WorkerMessage, WorkerState } from '../runtime/protocol'
import { type Strings, stringsFor } from '../strings'
import type { Theme } from '../theme/types'
import { appendOutput, emptyOutput, type OutputBuffer } from './output'

export type ProfileId = 'es' | 'en' | 'pseint'

export const PROFILE_IDS: readonly ProfileId[] = ['es', 'en', 'pseint']

export interface PendingInput {
  readonly line: number
  readonly target: InputTarget | null
  /** The formatted E4004 of the previous answer. */
  readonly rejected?: string
}

export interface RuntimeError {
  readonly message: string
  readonly line: number
}

export interface Wait {
  readonly line: number
  readonly millis: number
}

/** Spec §6: the document slice, the runtime slice, and their actions. */
export interface StoreState {
  readonly source: string
  readonly profileId: ProfileId
  readonly diagnostics: readonly LintDiagnostic[]
  readonly breakpoints: readonly number[]
  readonly theme: Theme
  readonly state: WorkerState
  readonly output: OutputBuffer
  readonly currentLine: number | null
  readonly frames: readonly Frame[]
  readonly pendingInput: PendingInput | null
  readonly wait: Wait | null
  readonly error: RuntimeError | null
  setSource(source: string): void
  setProfile(id: ProfileId): void
  setDiagnostics(diagnostics: readonly LintDiagnostic[]): void
  setBreakpoints(lines: readonly number[]): void
  setTheme(theme: Theme): void
  run(): void
  /** From ready/done/error: start in step mode. From paused: one `step`. */
  stepInto(): void
  stepOver(): void
  stepOut(): void
  continue(): void
  pause(): void
  stop(): void
  submitInput(text: string): void
  clearOutput(): void
}

export type EditorStore = StoreApi<StoreState>

export interface StoreOptions {
  readonly applyTheme?: (theme: Theme) => void
  readonly initialTheme?: Theme
  readonly initialSource?: string
}

export const DEFAULT_SOURCE = ['Proceso Hola', "  Escribir 'Hola, mundo';", 'FinProceso', ''].join(
  '\n',
)

export function profileOf(state: Pick<StoreState, 'profileId'>): ResolvedProfile {
  return profiles[state.profileId]
}

export function localeOf(state: Pick<StoreState, 'profileId'>): string {
  return profileOf(state).locale
}

export function stringsOf(state: Pick<StoreState, 'profileId'>): Strings {
  return stringsFor(localeOf(state))
}

export function hasErrors(state: Pick<StoreState, 'diagnostics'>): boolean {
  return state.diagnostics.some((diagnostic) => diagnostic.severity === 'error')
}

/** Spec §6: editing, running, and stepping from scratch are allowed in these states only. */
export function canEdit(state: WorkerState): boolean {
  return state === 'ready' || state === 'done' || state === 'error'
}

/** The JSON a builtin profile crosses the worker boundary as. */
export function profileInputOf(id: ProfileId): ProfileInput {
  const input = builtinProfiles.get(id)
  if (input === undefined) throw new Error(`no builtin profile ${id}`)
  return input
}

interface Snapshot {
  readonly source: string
  readonly profile: ResolvedProfile
}

export function createEditorStore(host: HostApi, options: StoreOptions = {}): EditorStore {
  /** What the worker is running: errors and rejections are formatted against it. */
  let snapshot: Snapshot | null = null

  const store = createStore<StoreState>((set, get) => {
    const begin = (mode: RunMode): void => {
      const s = get()
      if (!canEdit(s.state) || hasErrors(s)) return
      snapshot = { source: s.source, profile: profileOf(s) }
      set({
        output: emptyOutput,
        currentLine: null,
        frames: [],
        pendingInput: null,
        wait: null,
        error: null,
      })
      host.start(s.source, profileInputOf(s.profileId), s.breakpoints, mode)
    }
    return {
      source: options.initialSource ?? DEFAULT_SOURCE,
      profileId: 'es',
      diagnostics: [],
      breakpoints: [],
      theme: options.initialTheme ?? 'light',
      state: 'ready',
      output: emptyOutput,
      currentLine: null,
      frames: [],
      pendingInput: null,
      wait: null,
      error: null,
      setSource: (source) => set({ source }),
      setProfile: (profileId) => set({ profileId }),
      setDiagnostics: (diagnostics) => set({ diagnostics }),
      setBreakpoints: (breakpoints) => {
        set({ breakpoints })
        host.setBreakpoints(breakpoints)
      },
      setTheme: (theme) => {
        set({ theme })
        options.applyTheme?.(theme)
      },
      run: () => begin('run'),
      stepInto: () => {
        if (get().state === 'paused') host.step()
        else begin('step')
      },
      stepOver: () => {
        if (get().state === 'paused') host.stepOver()
      },
      stepOut: () => {
        if (get().state === 'paused') host.stepOut()
      },
      continue: () => {
        if (get().state === 'paused') host.continue()
      },
      pause: () => {
        if (get().state === 'running') host.pause()
      },
      stop: () => {
        if (get().state !== 'ready') host.stop()
      },
      submitInput: (text) => {
        if (get().state === 'input') host.input(text)
      },
      clearOutput: () => set({ output: emptyOutput }),
    }
  })

  const format = (diagnostic: Diagnostic): string => {
    const profile = snapshot?.profile ?? profileOf(store.getState())
    return formatDiagnostic(diagnostic, profile.locale, profile)
  }

  const lineOf = (diagnostic: Diagnostic): number => {
    const source = snapshot?.source ?? store.getState().source
    return new LineMap(source).positionAt(diagnostic.span.start).line
  }

  const receive = (message: WorkerMessage): void => {
    switch (message.kind) {
      case 'state':
        store.setState(
          message.state === 'ready'
            ? { state: 'ready', currentLine: null, pendingInput: null, wait: null }
            : message.state === 'running'
              ? { state: 'running', pendingInput: null, wait: null }
              : { state: message.state },
        )
        return
      case 'output':
        store.setState((s) => ({ output: appendOutput(s.output, message.chunks) }))
        return
      case 'clear':
        store.setState({ output: emptyOutput })
        return
      case 'paused':
        store.setState({
          currentLine: message.line,
          frames: message.frames,
          pendingInput: null,
          wait: null,
        })
        return
      case 'input': {
        const pending: PendingInput =
          message.rejected === undefined
            ? { line: message.line, target: message.target }
            : { line: message.line, target: message.target, rejected: format(message.rejected) }
        store.setState({ currentLine: message.line, pendingInput: pending, wait: null })
        return
      }
      case 'wait':
        store.setState({
          currentLine: message.line,
          wait: { line: message.line, millis: message.millis },
          pendingInput: null,
        })
        return
      case 'done':
        store.setState({
          frames: message.frames,
          currentLine: null,
          pendingInput: null,
          wait: null,
        })
        return
      case 'error': {
        const line = lineOf(message.diagnostic)
        store.setState({
          error: { message: format(message.diagnostic), line },
          frames: message.frames,
          currentLine: line,
          pendingInput: null,
          wait: null,
        })
        return
      }
    }
  }

  host.subscribe(receive)
  return store
}
