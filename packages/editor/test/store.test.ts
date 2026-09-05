import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import { profiles } from '@stepcode/profiles'
import { compile, type Frame } from 'stepcode'
import { describe, expect, it } from 'vitest'
import type { WorkerState } from '../src/runtime/protocol'
import { OUTPUT_CAP } from '../src/store/output'
import {
  canEdit,
  createEditorStore,
  DEFAULT_SOURCE,
  hasErrors,
  localeOf,
  profileInputOf,
  profileOf,
} from '../src/store/store'
import { FakeHost } from './fake-host'

const BROKEN = ['Proceso Roto', '  Escribir x;', 'FinProceso'].join('\n')

const errorDiagnostic: LintDiagnostic = { from: 0, to: 1, severity: 'error', message: 'x' }
const warningDiagnostic: LintDiagnostic = { from: 0, to: 1, severity: 'warning', message: 'w' }

const frame: Frame = {
  name: 'p',
  line: 2,
  variables: [{ name: 'i', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value: 1 }],
}

function setup(): {
  host: FakeHost
  store: ReturnType<typeof createEditorStore>
  applied: string[]
} {
  const host = new FakeHost()
  const applied: string[] = []
  const store = createEditorStore(host, {
    applyTheme: (theme) => {
      applied.push(theme)
    },
  })
  return { host, store, applied }
}

describe('document slice', () => {
  it('starts with a Spanish hello-world, the es profile, and no diagnostics', () => {
    const { store } = setup()
    const s = store.getState()
    expect(s.source).toBe(DEFAULT_SOURCE)
    expect(s.profileId).toBe('es')
    expect(profileOf(s)).toBe(profiles.es)
    expect(localeOf(s)).toBe('es')
    expect(s.diagnostics).toEqual([])
    expect(hasErrors(s)).toBe(false)
    expect(s.state).toBe('ready')
    expect(s.theme).toBe('light')
  })

  it('updates source, profile, diagnostics', () => {
    const { store } = setup()
    store.getState().setSource('x')
    store.getState().setProfile('en')
    store.getState().setDiagnostics([warningDiagnostic, errorDiagnostic])
    const s = store.getState()
    expect(s.source).toBe('x')
    expect(profileOf(s)).toBe(profiles.en)
    expect(localeOf(s)).toBe('en')
    expect(hasErrors(s)).toBe(true)
    expect(profileInputOf('pseint').id).toBe('pseint')
  })

  it('forwards breakpoints to the host at once', () => {
    const { store, host } = setup()
    store.getState().setBreakpoints([3, 5])
    expect(store.getState().breakpoints).toEqual([3, 5])
    expect(host.calls).toEqual(['setBreakpoints:3,5'])
  })

  it('applies the theme through the option', () => {
    const { store, applied } = setup()
    store.getState().setTheme('dark')
    expect(store.getState().theme).toBe('dark')
    expect(applied).toEqual(['dark'])
  })
})

describe('run guards', () => {
  it('run and stepInto start from ready, done, and error only, and never with errors', () => {
    const { store, host } = setup()
    store.getState().setBreakpoints([4])
    store.getState().run()
    expect(host.starts).toEqual([
      { source: DEFAULT_SOURCE, profile: profileInputOf('es'), breakpoints: [4], mode: 'run' },
    ])
    host.emit({ kind: 'state', state: 'running' })
    store.getState().run()
    store.getState().stepInto()
    expect(host.starts.length).toBe(1)
    for (const state of ['done', 'error'] as const) {
      host.emit({ kind: 'state', state })
      store.getState().stepInto()
    }
    expect(host.starts.map((call) => call.mode)).toEqual(['run', 'step', 'step'])
    host.emit({ kind: 'state', state: 'ready' })
    store.getState().setDiagnostics([errorDiagnostic])
    store.getState().run()
    expect(host.starts.length).toBe(3)
  })

  it('stepping and continue need paused; pause needs running; input needs input; stop needs not ready', () => {
    const { store, host } = setup()
    const s = store.getState()
    s.stepOver()
    s.stepOut()
    s.continue()
    s.pause()
    s.submitInput('x')
    s.stop()
    expect(host.calls).toEqual([])
    host.emit({ kind: 'state', state: 'paused' })
    s.stepInto()
    s.stepOver()
    s.stepOut()
    s.continue()
    s.pause()
    expect(host.calls).toEqual(['step', 'stepOver', 'stepOut', 'continue'])
    host.emit({ kind: 'state', state: 'running' })
    s.pause()
    s.stepOver()
    expect(host.calls.at(-1)).toBe('pause')
    host.emit({ kind: 'state', state: 'input' })
    s.submitInput('42')
    expect(host.calls.at(-1)).toBe('input:42')
    s.stop()
    expect(host.calls.at(-1)).toBe('stop')
    expect(store.getState().state).toBe('ready')
  })

  it('canEdit is true only in ready, done, and error', () => {
    const editable = (
      ['ready', 'running', 'paused', 'input', 'waiting', 'done', 'error'] as WorkerState[]
    ).filter(canEdit)
    expect(editable).toEqual(['ready', 'done', 'error'])
  })
})

describe('worker messages', () => {
  it('resets the run slice on start and clears output', () => {
    const { store, host } = setup()
    host.emit({ kind: 'output', chunks: ['old'] })
    host.emit({ kind: 'paused', reason: 'step', line: 2, frames: [frame] })
    host.emit({ kind: 'state', state: 'done' })
    store.getState().run()
    const s = store.getState()
    expect(s.output.chunks).toEqual([])
    expect(s.currentLine).toBeNull()
    expect(s.frames).toEqual([])
    expect(s.pendingInput).toBeNull()
    expect(s.wait).toBeNull()
    expect(s.error).toBeNull()
  })

  it('tracks state, line, frames, input, and wait', () => {
    const { store, host } = setup()
    host.emit({ kind: 'state', state: 'paused' })
    host.emit({ kind: 'paused', reason: 'breakpoint', line: 4, frames: [frame] })
    expect(store.getState()).toMatchObject({ state: 'paused', currentLine: 4, frames: [frame] })
    host.emit({ kind: 'state', state: 'input' })
    host.emit({
      kind: 'input',
      line: 5,
      target: { name: 'n', type: { kind: 'scalar', name: 'integer' } },
    })
    expect(store.getState().pendingInput).toEqual({
      line: 5,
      target: { name: 'n', type: { kind: 'scalar', name: 'integer' } },
    })
    expect(store.getState().currentLine).toBe(5)
    host.emit({ kind: 'state', state: 'waiting' })
    host.emit({ kind: 'wait', line: 6, millis: 500 })
    expect(store.getState().pendingInput).toBeNull()
    expect(store.getState().wait).toEqual({ line: 6, millis: 500 })
    host.emit({ kind: 'state', state: 'running' })
    expect(store.getState().wait).toBeNull()
    host.emit({ kind: 'state', state: 'paused' })
    host.emit({ kind: 'paused', reason: 'step', line: 7, frames: [frame] })
    expect(store.getState().wait).toBeNull()
  })

  it('keeps the final frames after done and clears the line', () => {
    const { store, host } = setup()
    host.emit({ kind: 'paused', reason: 'step', line: 2, frames: [] })
    host.emit({ kind: 'state', state: 'done' })
    host.emit({ kind: 'done', frames: [frame] })
    expect(store.getState().frames).toEqual([frame])
    expect(store.getState().currentLine).toBeNull()
  })

  it('formats a rejected input and a runtime error in the snapshot locale', () => {
    const { store, host } = setup()
    store.getState().setSource(BROKEN)
    const diagnostic = compile(BROKEN, { profile: profiles.es }).diagnostics[0]
    if (diagnostic === undefined) throw new Error('BROKEN should not compile clean')
    store.getState().setDiagnostics([])
    store.getState().run()
    host.emit({ kind: 'state', state: 'input' })
    host.emit({ kind: 'input', line: 2, target: null, rejected: diagnostic })
    expect(store.getState().pendingInput?.rejected).toContain('x')
    host.emit({ kind: 'state', state: 'error' })
    host.emit({ kind: 'error', diagnostic, frames: [frame] })
    const s = store.getState()
    expect(s.error?.line).toBe(2)
    expect(s.error?.message.length).toBeGreaterThan(0)
    expect(s.currentLine).toBe(2)
    expect(s.frames).toEqual([frame])
  })

  it('appends output up to the cap and clears on clear', () => {
    const { store, host } = setup()
    host.emit({ kind: 'output', chunks: ['a', 'b'] })
    expect(store.getState().output.chunks).toEqual(['a', 'b'])
    host.emit({ kind: 'output', chunks: Array.from({ length: OUTPUT_CAP }, () => 'x') })
    expect(store.getState().output.chunks.length).toBe(OUTPUT_CAP)
    expect(store.getState().output.dropped).toBe(2)
    host.emit({ kind: 'clear' })
    expect(store.getState().output.chunks).toEqual([])
    host.emit({ kind: 'output', chunks: ['c'] })
    store.getState().clearOutput()
    expect(store.getState().output.chunks).toEqual([])
  })

  it('clears the transient run fields when the host announces ready', () => {
    const { store, host } = setup()
    host.emit({ kind: 'state', state: 'input' })
    host.emit({ kind: 'input', line: 3, target: null })
    host.emit({ kind: 'state', state: 'ready' })
    const s = store.getState()
    expect(s.state).toBe('ready')
    expect(s.pendingInput).toBeNull()
    expect(s.currentLine).toBeNull()
    expect(s.wait).toBeNull()
  })
})
