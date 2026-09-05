import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import {
  builtinProfiles,
  type ProfileInput,
  type ProfileRegistry,
  profiles,
  type ResolvedProfile,
  resolveProfile,
} from '@stepcode/profiles'
import { type Diagnostic, type Frame, formatDiagnostic, LineMap } from 'stepcode'
import { createStore, type StoreApi } from 'zustand/vanilla'
import type { HostApi } from '../runtime/host-api'
import type { InputTarget, RunMode, WorkerMessage, WorkerState } from '../runtime/protocol'
import { type Strings, stringsFor } from '../strings'
import type { Theme, ThemePreference } from '../theme/types'
import { type DocumentDraft, type FileHandle, isDirty } from './document'
import {
  DEFAULT_LAYOUT,
  type LayoutState,
  type PanelId,
  type PanelRequest,
  type SheetPosition,
} from './layout'
import { appendOutput, emptyOutput, type OutputBuffer } from './output'
import { DEFAULT_SETTINGS, type Settings, type SettingsSection } from './settings'

export type ProfileId = string

export const PROFILE_IDS: readonly string[] = ['es', 'en', 'pseint']

export type DialogName = 'settings' | 'examples' | 'share' | 'about' | 'confirmSave' | 'warnings'

export interface Toast {
  readonly id: number
  readonly message: string
}

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

/** Spec §6: the document, settings, runtime, layout and UI slices, and their actions. */
export interface StoreState {
  // document
  readonly source: string
  readonly name: string
  readonly savedSource: string
  readonly handle: FileHandle | null
  readonly pendingReplace: DocumentDraft | null
  readonly profileId: string
  readonly customProfiles: readonly ProfileInput[]
  readonly diagnostics: readonly LintDiagnostic[]
  readonly breakpoints: readonly number[]
  readonly cursor: { readonly line: number; readonly column: number }
  // settings + theme
  readonly settings: Settings
  readonly themePreference: ThemePreference
  readonly systemDark: boolean
  readonly theme: Theme
  // runtime (4a)
  readonly state: WorkerState
  readonly output: OutputBuffer
  readonly currentLine: number | null
  readonly frames: readonly Frame[]
  readonly pendingInput: PendingInput | null
  readonly wait: Wait | null
  readonly error: RuntimeError | null
  readonly runSeq: number
  readonly pausedInRun: boolean
  // layout + ui
  readonly layout: LayoutState
  readonly layoutReset: number
  readonly panelRequest: PanelRequest | null
  readonly dialog: DialogName | null
  readonly toasts: readonly Toast[]
  // actions
  setSource(source: string): void
  setName(name: string): void
  markSaved(source: string, handle: FileHandle | null): void
  requestReplace(draft: DocumentDraft): void
  applyReplace(): void
  cancelReplace(): void
  setProfile(id: string): void
  saveCustomProfile(input: ProfileInput): void
  deleteCustomProfile(id: string): void
  setDiagnostics(diagnostics: readonly LintDiagnostic[]): void
  setBreakpoints(lines: readonly number[]): void
  setCursor(line: number, column: number): void
  updateSettings<K extends SettingsSection>(section: K, patch: Partial<Settings[K]>): void
  resetSettings(section: SettingsSection): void
  setThemePreference(preference: ThemePreference): void
  setSystemDark(dark: boolean): void
  run(): void
  confirmRun(): void
  /** From ready/done/error: start in step mode. From paused: one `step`. */
  stepInto(): void
  stepOver(): void
  stepOut(): void
  continue(): void
  pause(): void
  stop(): void
  submitInput(text: string): void
  clearOutput(): void
  setDockLayout(dockview: Record<string, unknown>, collapsed: readonly string[]): void
  setSheet(position: SheetPosition): void
  resetLayout(): void
  requestPanel(id: PanelId): void
  openDialog(name: DialogName): void
  closeDialog(): void
  notify(message: string): void
  dismissToast(id: number): void
}

export type EditorStore = StoreApi<StoreState>

export interface StoreOptions {
  readonly applyTheme?: (theme: Theme) => void
  readonly initialTheme?: ThemePreference
  readonly systemDark?: boolean
  readonly initialSource?: string
  readonly initialName?: string
}

export const DEFAULT_SOURCE = [
  'Proceso Hola',
  '  // Escribe tu programa aquí',
  "  Escribir 'Hola, mundo';",
  'FinProceso',
  '',
].join('\n')

export { isDirty }

/**
 * Resolved custom profiles, memoized by input identity (inputs are replaced, never mutated).
 * Dropped whenever the custom-profile set changes: a profile that `extends` another custom
 * profile must re-resolve when that other profile is edited, even though its own input object
 * did not change.
 */
let resolvedCache = new WeakMap<ProfileInput, ResolvedProfile>()

function clearResolvedCache(): void {
  resolvedCache = new WeakMap<ProfileInput, ResolvedProfile>()
}

function registryWith(customs: readonly ProfileInput[]): ProfileRegistry {
  const registry = new Map(builtinProfiles)
  for (const input of customs) registry.set(input.id, input)
  return registry
}

export function customProfileOf(
  state: Pick<StoreState, 'customProfiles'>,
  id: string,
): ProfileInput | undefined {
  return state.customProfiles.find((input) => input.id === id)
}

export function profileOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'>,
): ResolvedProfile {
  if (builtinProfiles.has(state.profileId)) {
    return (profiles as Record<string, ResolvedProfile>)[state.profileId] as ResolvedProfile
  }
  const input = customProfileOf(state, state.profileId)
  if (input === undefined) return profiles.es
  let resolved = resolvedCache.get(input)
  if (resolved === undefined) {
    try {
      resolved = resolveProfile(input, registryWith(state.customProfiles))
    } catch (error) {
      // A custom profile can stop resolving between sessions (a hand-edited store, a base that
      // is gone). Every caller here is rendering something; none of them can handle a throw.
      console.warn('stepcode: falling back to es, unresolvable profile', state.profileId, error)
      return profiles.es
    }
    resolvedCache.set(input, resolved)
  }
  return resolved
}

/** The JSON that crosses the worker boundary: a builtin's input or the custom input itself. */
export function profileInputOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'>,
): ProfileInput {
  return (
    builtinProfiles.get(state.profileId) ??
    customProfileOf(state, state.profileId) ??
    (builtinProfiles.get('es') as ProfileInput)
  )
}

export function profileNameOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'>,
  id: string,
): string {
  return stringsOf(state).profiles[id] ?? id
}

/** Diagnostics and runtime rendering follow the profile. */
export function localeOf(state: Pick<StoreState, 'profileId' | 'customProfiles'>): string {
  return profileOf(state).locale
}

/** UI copy follows the setting, or the profile when `auto`. */
export function uiLocaleOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'> & { readonly settings?: Settings },
): string {
  const setting = state.settings?.appearance.uiLocale ?? 'auto'
  return setting === 'auto' ? localeOf(state) : setting
}

export function stringsOf(
  state: Pick<StoreState, 'profileId' | 'customProfiles'> & { readonly settings?: Settings },
): Strings {
  return stringsFor(uiLocaleOf(state))
}

export function hasErrors(state: Pick<StoreState, 'diagnostics'>): boolean {
  return state.diagnostics.some((diagnostic) => diagnostic.severity === 'error')
}

export function hasWarnings(state: Pick<StoreState, 'diagnostics'>): boolean {
  return state.diagnostics.some((diagnostic) => diagnostic.severity === 'warning')
}

/** Spec §6: editing, running, and stepping from scratch are allowed in these states only. */
export function canEdit(state: WorkerState): boolean {
  return state === 'ready' || state === 'done' || state === 'error'
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): Theme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
}

interface Snapshot {
  readonly source: string
  readonly profile: ResolvedProfile
}

export function createEditorStore(host: HostApi, options: StoreOptions = {}): EditorStore {
  /** What the worker is running: errors and rejections are formatted against it. */
  let snapshot: Snapshot | null = null
  let toastSeq = 0
  const initialPreference = options.initialTheme ?? 'system'
  const initialSystemDark = options.systemDark ?? false
  const initialSource = options.initialSource ?? DEFAULT_SOURCE

  const store = createStore<StoreState>((set, get) => {
    const applyTheme = (preference: ThemePreference, systemDark: boolean): void => {
      const theme = resolveTheme(preference, systemDark)
      set({ themePreference: preference, systemDark, theme })
      options.applyTheme?.(theme)
    }
    const begin = (mode: RunMode): void => {
      const s = get()
      if (!canEdit(s.state) || hasErrors(s)) return
      snapshot = { source: s.source, profile: profileOf(s) }
      set({
        output: s.settings.execution.clearConsoleOnRun ? emptyOutput : s.output,
        currentLine: null,
        frames: [],
        pendingInput: null,
        wait: null,
        error: null,
        runSeq: s.runSeq + 1,
        pausedInRun: false,
        dialog: s.dialog === 'warnings' ? null : s.dialog,
      })
      host.start(s.source, profileInputOf(s), s.breakpoints, mode)
    }
    const applyDraft = (draft: DocumentDraft): void => {
      set({
        name: draft.name,
        source: draft.source,
        savedSource: draft.source,
        handle: null,
        breakpoints: [],
        pendingReplace: null,
        dialog: null,
        ...(draft.profileId === undefined ? {} : { profileId: draft.profileId }),
      })
      host.setBreakpoints([])
    }
    return {
      source: initialSource,
      name: options.initialName ?? stringsFor('es').app.untitled,
      savedSource: initialSource,
      handle: null,
      pendingReplace: null,
      profileId: 'es',
      customProfiles: [],
      diagnostics: [],
      breakpoints: [],
      cursor: { line: 1, column: 1 },
      settings: DEFAULT_SETTINGS,
      themePreference: initialPreference,
      systemDark: initialSystemDark,
      theme: resolveTheme(initialPreference, initialSystemDark),
      state: 'ready',
      output: emptyOutput,
      currentLine: null,
      frames: [],
      pendingInput: null,
      wait: null,
      error: null,
      runSeq: 0,
      pausedInRun: false,
      layout: DEFAULT_LAYOUT,
      layoutReset: 0,
      panelRequest: null,
      dialog: null,
      toasts: [],
      setSource: (source) => set({ source }),
      setName: (name) => set({ name }),
      markSaved: (source, handle) => set({ savedSource: source, handle }),
      requestReplace: (draft) => {
        const s = get()
        if (isDirty(s) && s.source.trim() !== '')
          set({ pendingReplace: draft, dialog: 'confirmSave' })
        else applyDraft(draft)
      },
      applyReplace: () => {
        const draft = get().pendingReplace
        if (draft !== null) applyDraft(draft)
      },
      cancelReplace: () => set({ pendingReplace: null, dialog: null }),
      setProfile: (profileId) => set({ profileId }),
      saveCustomProfile: (input) => {
        clearResolvedCache()
        set((s) => ({
          customProfiles: [...s.customProfiles.filter((c) => c.id !== input.id), input],
        }))
      },
      deleteCustomProfile: (id) => {
        clearResolvedCache()
        set((s) => {
          // Whatever the deleted profile itself extended becomes the parent of its children:
          // a dangling `extends` would leave them unresolvable (spec §6.1).
          const parent =
            (customProfileOf(s, id) as { extends?: string } | undefined)?.extends ?? 'es'
          return {
            customProfiles: s.customProfiles
              .filter((c) => c.id !== id)
              .map((c) =>
                (c as { extends?: string }).extends === id ? { ...c, extends: parent } : c,
              ),
            profileId: s.profileId === id ? parent : s.profileId,
          }
        })
      },
      setDiagnostics: (diagnostics) => set({ diagnostics }),
      setBreakpoints: (breakpoints) => {
        set({ breakpoints })
        host.setBreakpoints(breakpoints)
      },
      setCursor: (line, column) => set({ cursor: { line, column } }),
      updateSettings: (section, patch) =>
        set((s) => ({
          settings: { ...s.settings, [section]: { ...s.settings[section], ...patch } },
        })),
      resetSettings: (section) =>
        set((s) => ({ settings: { ...s.settings, [section]: DEFAULT_SETTINGS[section] } })),
      setThemePreference: (preference) => {
        applyTheme(preference, get().systemDark)
        set((s) => ({
          settings: { ...s.settings, appearance: { ...s.settings.appearance, theme: preference } },
        }))
      },
      setSystemDark: (dark) => applyTheme(get().themePreference, dark),
      run: () => {
        const s = get()
        if (
          s.settings.execution.warnOnWarnings &&
          hasWarnings(s) &&
          canEdit(s.state) &&
          !hasErrors(s)
        ) {
          set({ dialog: 'warnings' })
          return
        }
        begin('run')
      },
      confirmRun: () => begin('run'),
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
      setDockLayout: (dockview, collapsed) =>
        set((s) => ({ layout: { ...s.layout, dockview, collapsed } })),
      setSheet: (sheet) => set((s) => ({ layout: { ...s.layout, sheet } })),
      resetLayout: () => set((s) => ({ layout: DEFAULT_LAYOUT, layoutReset: s.layoutReset + 1 })),
      requestPanel: (id) =>
        set((s) => ({ panelRequest: { id, seq: (s.panelRequest?.seq ?? 0) + 1 } })),
      openDialog: (dialog) => set({ dialog }),
      closeDialog: () => set({ dialog: null }),
      notify: (message) => set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, message }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
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
          pausedInRun: true,
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

export type { DocumentDraft, FileHandle } from './document'
export type { LayoutState, PanelId, PanelRequest, SheetPosition } from './layout'
export type { Settings, SettingsSection } from './settings'
