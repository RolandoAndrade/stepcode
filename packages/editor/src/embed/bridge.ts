import { builtinProfiles, ProfileInputSchema } from '@stepcode/profiles'
import { LineMap } from 'stepcode'
import { typeLabel } from '../labels'
import { valueLabel } from '../panels/values'
import { type EditorStore, profileOf, type StoreState, stringsOf } from '../store/store'
import { APP_VERSION } from '../version'

export const PROTOCOL_VERSION = 1

export interface DiagnosticItem {
  readonly severity: string
  readonly code: string
  readonly message: string
  readonly line: number
  readonly column: number
}

export interface VariableItem {
  readonly name: string
  readonly type: string
  readonly value: string
}

export type Outbound =
  | {
      readonly type: 'ready'
      readonly id?: string
      readonly protocol: number
      readonly version: string
    }
  | { readonly type: 'source'; readonly id?: string; readonly source: string }
  | {
      readonly type: 'diagnostics'
      readonly id?: string
      readonly items: readonly DiagnosticItem[]
    }
  | {
      readonly type: 'state'
      readonly id?: string
      readonly state: string
      readonly line: number | null
    }
  | {
      readonly type: 'paused'
      readonly id?: string
      readonly line: number
      readonly variables: readonly VariableItem[]
    }
  | { readonly type: 'inputRequest'; readonly id?: string; readonly prompt: string }
  | { readonly type: 'output'; readonly id?: string; readonly text: string }
  | { readonly type: 'done'; readonly id?: string; readonly state: 'done' | 'error' | 'stopped' }
  | {
      readonly type: 'error'
      readonly id?: string
      readonly message: string
      readonly line?: number | null
    }
  | { readonly type: 'profile'; readonly id?: string; readonly profileId: string }
  | { readonly type: 'options'; readonly id?: string; readonly theme: 'light' | 'dark' | 'system' }

export interface BridgeIo {
  post(message: Outbound): void
  listen(handler: (data: unknown) => void): () => void
}

type Slot = 'run' | 'debug' | 'continue' | 'stepOver' | 'stepInto' | 'stepOut' | 'pause' | 'stop'

/**
 * Spec §4: the same table `slotsFor` renders, kept here so this module never imports a React
 * component. `test/bridge.test.ts` asserts the two agree for every state.
 */
export function BRIDGE_SLOTS(state: string): readonly Slot[] {
  switch (state) {
    case 'running':
      return ['pause', 'stop']
    case 'paused':
      return ['continue', 'stepOver', 'stepInto', 'stepOut', 'stop']
    case 'input':
    case 'waiting':
      return ['stop']
    default:
      return ['run', 'debug']
  }
}

const RUNNING: ReadonlySet<string> = new Set(['running', 'paused', 'input', 'waiting'])

function diagnosticsOf(state: StoreState): DiagnosticItem[] {
  const map = new LineMap(state.source)
  return state.diagnostics.map((diagnostic) => {
    const { line, column } = map.positionAt(diagnostic.from)
    return {
      severity: String(diagnostic.severity),
      code: diagnostic.source ?? '',
      message: diagnostic.message,
      line,
      column,
    }
  })
}

function variablesOf(state: StoreState): VariableItem[] {
  const profile = profileOf(state)
  const strings = stringsOf(state)
  return state.frames.flatMap((frame) =>
    frame.variables.map((variable) => ({
      name: variable.name,
      type: typeLabel(variable.type, profile, strings),
      value: valueLabel(variable, profile, strings),
    })),
  )
}

/**
 * Spec §4: the host page's whole view of the embed. No React, no DOM — `BridgeIo` is the only
 * way in and out, so `main.tsx` decides what `postMessage` means and the tests inject a fake.
 */
export function createBridge(store: EditorStore, io: BridgeIo, debounceMillis = 300): () => void {
  let disposed = false
  let timer: ReturnType<typeof setTimeout> | null = null

  const post = (message: Outbound): void => {
    if (!disposed) io.post(message)
  }
  const reply = (message: Outbound, id: string | undefined): void => {
    post(id === undefined ? message : { ...message, id })
  }
  const fail = (message: string, id: string | undefined): void => {
    reply({ type: 'error', message }, id)
  }
  const stateMessage = (): Outbound => {
    const s = store.getState()
    return { type: 'state', state: s.state, line: s.currentLine }
  }

  const act = (type: string, slot: Slot, run: () => void, id: string | undefined): void => {
    const current = store.getState().state
    if (!BRIDGE_SLOTS(current).includes(slot)) {
      fail(`${type} is not available while the program is ${current}`, id)
      return
    }
    run()
    reply(stateMessage(), id)
  }

  const handle = (data: unknown): void => {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return
    const message = data as Record<string, unknown>
    if (typeof message.type !== 'string') return
    const id = typeof message.id === 'string' ? message.id : undefined
    const s = store.getState()
    switch (message.type) {
      case 'setSource': {
        // The host owns the frame: `readonly` guards the reader's keyboard, never this
        // protocol, so the source is set whatever the embed's options say.
        if (typeof message.source !== 'string') {
          fail('source must be a string', id)
          return
        }
        s.setSource(message.source)
        reply({ type: 'source', source: message.source }, id)
        return
      }
      case 'getSource':
        reply({ type: 'source', source: store.getState().source }, id)
        return
      case 'run':
        act('run', 'run', () => s.run(), id)
        return
      case 'debug':
        act('debug', 'debug', () => s.stepInto(), id)
        return
      case 'continue':
        act('continue', 'continue', () => s.continue(), id)
        return
      case 'stepOver':
        act('stepOver', 'stepOver', () => s.stepOver(), id)
        return
      case 'stepInto':
        act('stepInto', 'stepInto', () => s.stepInto(), id)
        return
      case 'stepOut':
        act('stepOut', 'stepOut', () => s.stepOut(), id)
        return
      case 'pause':
        act('pause', 'pause', () => s.pause(), id)
        return
      case 'stop':
        act('stop', 'stop', () => s.stop(), id)
        return
      case 'input': {
        if (typeof message.value !== 'string') {
          fail('value must be a string', id)
          return
        }
        if (s.state !== 'input') {
          fail('no input is pending', id)
          return
        }
        s.submitInput(message.value)
        reply(stateMessage(), id)
        return
      }
      case 'setProfile': {
        const wanted = message.profile
        if (wanted === undefined) {
          // `profileId`, not `id`: `id` is the request's own correlation key on every message.
          const builtin = message.profileId
          if (typeof builtin !== 'string') {
            fail('setProfile needs a profileId', id)
            return
          }
          if (!builtinProfiles.has(builtin)) {
            fail(`unknown profile ${builtin}`, id)
            return
          }
          s.setProfile(builtin)
          reply({ type: 'profile', profileId: builtin }, id)
          return
        }
        const parsed = ProfileInputSchema.safeParse(wanted)
        if (!parsed.success) {
          fail('the profile is not valid', id)
          return
        }
        s.saveCustomProfile(parsed.data)
        s.setProfile(parsed.data.id)
        reply({ type: 'profile', profileId: parsed.data.id }, id)
        return
      }
      case 'setTheme': {
        const theme = message.theme
        if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
          fail('theme must be light, dark or system', id)
          return
        }
        s.setThemePreference(theme)
        reply({ type: 'options', theme }, id)
        return
      }
      default:
        return
    }
  }

  post({ type: 'ready', protocol: PROTOCOL_VERSION, version: APP_VERSION })

  const stopListening = io.listen(handle)
  const unsubscribe = store.subscribe((next, previous) => {
    if (next.source !== previous.source) {
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        post({ type: 'source', source: store.getState().source })
      }, debounceMillis)
    }
    if (next.diagnostics !== previous.diagnostics) {
      post({ type: 'diagnostics', items: diagnosticsOf(next) })
    }
    if (next.state !== previous.state) {
      post({ type: 'state', state: next.state, line: next.currentLine })
    }
    if (next.output !== previous.output) {
      // `chunks` stops growing once the buffer hits its cap, so what was appended is counted
      // against `chunks.length + dropped` and taken from the tail. A cleared buffer counts
      // down, not up: nothing was appended, so nothing is posted.
      const appended =
        next.output.chunks.length +
        next.output.dropped -
        (previous.output.chunks.length + previous.output.dropped)
      for (const text of next.output.chunks.slice(
        Math.max(0, next.output.chunks.length - appended),
      )) {
        post({ type: 'output', text })
      }
    }
    if (next.frames !== previous.frames && next.state === 'paused') {
      post({ type: 'paused', line: next.currentLine ?? 0, variables: variablesOf(next) })
    }
    if (next.pendingInput !== previous.pendingInput && next.pendingInput !== null) {
      post({ type: 'inputRequest', prompt: next.pendingInput.target?.name ?? '' })
    }
    if (next.error !== previous.error && next.error !== null) {
      post({ type: 'error', message: next.error.message, line: next.error.line })
    }
    if (next.state !== previous.state) {
      if (next.state === 'done') post({ type: 'done', state: 'done' })
      else if (next.state === 'error') post({ type: 'done', state: 'error' })
      else if (next.state === 'ready' && RUNNING.has(previous.state)) {
        post({ type: 'done', state: 'stopped' })
      }
    }
  })

  return () => {
    disposed = true
    if (timer !== null) clearTimeout(timer)
    unsubscribe()
    stopListening()
  }
}
