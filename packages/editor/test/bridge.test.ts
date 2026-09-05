// @vitest-environment happy-dom
import { profiles } from '@stepcode/profiles'
import { compile } from 'stepcode'
import { describe, expect, it, vi } from 'vitest'
import {
  BRIDGE_SLOTS,
  type BridgeIo,
  createBridge,
  type Outbound,
  PROTOCOL_VERSION,
} from '../src/embed/bridge'
import { slotsFor } from '../src/shell/RunControls'
import { OUTPUT_CAP } from '../src/store/output'
import { createEditorStore, type EditorStore } from '../src/store/store'
import { FakeHost } from './fake-host'

const SOURCE = 'Proceso p\n  Escribir 1;\nFinProceso\n'
const BROKEN = ['Proceso Roto', '  Escribir x;', 'FinProceso'].join('\n')

interface Harness {
  readonly store: EditorStore
  readonly host: FakeHost
  readonly posted: Outbound[]
  send(data: unknown): void
  dispose(): void
}

function harness(debounceMillis = 0): Harness {
  const host = new FakeHost()
  const store = createEditorStore(host, { initialSource: SOURCE })
  const posted: Outbound[] = []
  let handler: ((data: unknown) => void) | null = null
  const io: BridgeIo = {
    post: (message) => posted.push(message),
    listen: (next) => {
      handler = next
      return () => {
        handler = null
      }
    },
  }
  const dispose = createBridge(store, io, debounceMillis)
  return {
    store,
    host,
    posted,
    send: (data) => handler?.(data),
    dispose,
  }
}

const types = (posted: readonly Outbound[]): string[] => posted.map((message) => message.type)
const last = (posted: readonly Outbound[], type: string): Outbound | undefined =>
  [...posted].reverse().find((message) => message.type === type)

describe('createBridge', () => {
  it('announces itself with the protocol number and the app version', () => {
    const { posted } = harness()
    expect(posted[0]).toEqual({
      type: 'ready',
      protocol: PROTOCOL_VERSION,
      version: expect.any(String),
    })
    expect(PROTOCOL_VERSION).toBe(1)
  })

  it('ignores anything that is not an object with a string type', () => {
    const bridge = harness()
    const before = bridge.posted.length
    for (const junk of [null, 42, 'run', [], {}, { type: 7 }]) bridge.send(junk)
    expect(bridge.posted.length).toBe(before)
  })

  it('sets and reads the source, echoing the id', () => {
    const bridge = harness()
    bridge.send({ type: 'setSource', id: 'a1', source: 'Proceso q\nFinProceso\n' })
    expect(bridge.store.getState().source).toBe('Proceso q\nFinProceso\n')
    expect(last(bridge.posted, 'source')).toEqual({
      type: 'source',
      id: 'a1',
      source: 'Proceso q\nFinProceso\n',
    })
    bridge.send({ type: 'getSource' })
    expect(last(bridge.posted, 'source')).toEqual({
      type: 'source',
      source: 'Proceso q\nFinProceso\n',
    })
  })

  it('answers a bad payload with an error and never throws', () => {
    const bridge = harness()
    bridge.send({ type: 'setSource', id: 'x', source: 42 })
    expect(last(bridge.posted, 'error')).toMatchObject({ type: 'error', id: 'x' })
    expect(bridge.store.getState().source).toBe(SOURCE)
  })

  it('runs, and refuses an action the current state does not offer', () => {
    const bridge = harness()
    bridge.send({ type: 'run', id: 'r' })
    expect(bridge.host.calls).toEqual(['start:run'])
    expect(last(bridge.posted, 'state')).toMatchObject({ type: 'state', id: 'r' })

    bridge.send({ type: 'stepOver', id: 's' })
    expect(last(bridge.posted, 'error')).toMatchObject({ type: 'error', id: 's' })
    expect(bridge.host.calls).toEqual(['start:run'])
  })

  it('maps debug to a fresh step run and the rest to their store actions', () => {
    const bridge = harness()
    bridge.send({ type: 'debug' })
    expect(bridge.host.calls).toEqual(['start:step'])
    bridge.host.emit({ kind: 'state', state: 'paused' })
    bridge.send({ type: 'stepOver' })
    bridge.send({ type: 'stepOut' })
    bridge.send({ type: 'continue' })
    expect(bridge.host.calls).toEqual(['start:step', 'stepOver', 'stepOut', 'continue'])
  })

  it('submits input only while one is pending', () => {
    const bridge = harness()
    bridge.send({ type: 'input', id: 'i', value: '5' })
    expect(last(bridge.posted, 'error')).toMatchObject({ id: 'i' })
    bridge.host.emit({ kind: 'state', state: 'input' })
    bridge.host.emit({
      kind: 'input',
      line: 2,
      target: { name: 'x', type: { kind: 'scalar', name: 'integer' } },
    })
    bridge.send({ type: 'input', value: '5' })
    expect(bridge.host.calls).toContain('input:5')
  })

  it('switches to a builtin profile by id', () => {
    const bridge = harness()
    bridge.send({ type: 'setProfile', profileId: 'en' })
    expect(bridge.store.getState().profileId).toBe('en')
    expect(last(bridge.posted, 'profile')).toEqual({ type: 'profile', profileId: 'en' })
  })

  it('refuses a profile id it does not know, echoing the request id', () => {
    const bridge = harness()
    bridge.send({ type: 'setProfile', id: 'q', profileId: 'klingon' })
    expect(last(bridge.posted, 'error')).toMatchObject({ type: 'error', id: 'q' })
    expect(bridge.store.getState().profileId).toBe('es')
  })

  it('installs and selects a validated custom profile', () => {
    const bridge = harness()
    bridge.send({ type: 'setProfile', profile: { id: 'aula', extends: 'es' } })
    expect(bridge.store.getState().profileId).toBe('aula')
    expect(bridge.store.getState().customProfiles.map((input) => input.id)).toEqual(['aula'])
    expect(last(bridge.posted, 'profile')).toEqual({ type: 'profile', profileId: 'aula' })
  })

  it('refuses a profile object the schema rejects', () => {
    const bridge = harness()
    bridge.send({ type: 'setProfile', id: 'z', profile: { nope: true } })
    expect(last(bridge.posted, 'error')).toMatchObject({ type: 'error', id: 'z' })
    expect(bridge.store.getState().customProfiles).toEqual([])
  })

  it('sets the theme preference and reports it back', () => {
    const bridge = harness()
    bridge.send({ type: 'setTheme', theme: 'dark' })
    expect(bridge.store.getState().themePreference).toBe('dark')
    expect(last(bridge.posted, 'options')).toEqual({ type: 'options', theme: 'dark' })
    bridge.send({ type: 'setTheme', theme: 'neon' })
    expect(last(bridge.posted, 'error')?.type).toBe('error')
  })

  it('pushes state, output, pause, input, error and done', () => {
    const bridge = harness()
    bridge.posted.length = 0
    bridge.host.emit({ kind: 'state', state: 'running' })
    bridge.host.emit({ kind: 'output', chunks: ['uno\n', 'dos\n'] })
    bridge.host.emit({ kind: 'state', state: 'paused' })
    bridge.host.emit({
      kind: 'paused',
      reason: 'step',
      line: 3,
      frames: [
        {
          name: 'p',
          line: 3,
          variables: [
            { name: 'x', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value: 7 },
          ],
        },
      ],
    })
    bridge.host.emit({ kind: 'state', state: 'done' })
    expect(types(bridge.posted)).toEqual([
      'state',
      'output',
      'output',
      'state',
      'paused',
      'state',
      'done',
    ])
    expect(last(bridge.posted, 'output')).toEqual({ type: 'output', text: 'dos\n' })
    expect(last(bridge.posted, 'paused')).toEqual({
      type: 'paused',
      line: 3,
      variables: [{ name: 'x', type: 'Entero', value: '7' }],
    })
    expect(last(bridge.posted, 'done')).toEqual({ type: 'done', state: 'done' })
  })

  it('calls a stop from a running state a stopped run', () => {
    const bridge = harness()
    bridge.host.emit({ kind: 'state', state: 'running' })
    bridge.posted.length = 0
    bridge.host.emit({ kind: 'state', state: 'ready' })
    expect(last(bridge.posted, 'done')).toEqual({ type: 'done', state: 'stopped' })
  })

  it('pushes diagnostics with lines and codes', () => {
    const bridge = harness()
    bridge.posted.length = 0
    bridge.store.setState({
      diagnostics: [
        { from: 12, to: 13, severity: 'error', source: 'E3001', message: 'no existe x' },
      ],
    })
    expect(last(bridge.posted, 'diagnostics')).toEqual({
      type: 'diagnostics',
      items: [{ severity: 'error', code: 'E3001', message: 'no existe x', line: 2, column: 3 }],
    })
  })

  it('debounces the source it pushes on edits', () => {
    vi.useFakeTimers()
    const bridge = harness(300)
    bridge.posted.length = 0
    bridge.store.getState().setSource('a')
    bridge.store.getState().setSource('ab')
    expect(types(bridge.posted)).toEqual([])
    vi.advanceTimersByTime(300)
    expect(last(bridge.posted, 'source')).toEqual({ type: 'source', source: 'ab' })
    vi.useRealTimers()
  })

  it('stops pushing once disposed', () => {
    const bridge = harness()
    bridge.dispose()
    bridge.posted.length = 0
    bridge.host.emit({ kind: 'state', state: 'running' })
    bridge.send({ type: 'getSource' })
    expect(bridge.posted).toEqual([])
  })

  it('offers exactly the slots the run cluster offers', () => {
    for (const state of ['ready', 'running', 'paused', 'input', 'waiting', 'done', 'error']) {
      expect([...BRIDGE_SLOTS(state)].sort(), state).toEqual([...slotsFor(state)].sort())
    }
  })

  it('keeps posting output after the buffer starts dropping lines', () => {
    const bridge = harness()
    bridge.host.emit({
      kind: 'output',
      chunks: Array.from({ length: OUTPUT_CAP }, (_, index) => `${index}\n`),
    })
    bridge.posted.length = 0
    bridge.host.emit({ kind: 'output', chunks: ['tope\n'] })
    bridge.host.emit({ kind: 'output', chunks: ['otra\n', 'una mas\n'] })
    expect(bridge.store.getState().output.dropped).toBe(3)
    expect(bridge.posted).toEqual([
      { type: 'output', text: 'tope\n' },
      { type: 'output', text: 'otra\n' },
      { type: 'output', text: 'una mas\n' },
    ])
  })

  it('announces a pending read once, naming the variable it reads into', () => {
    const bridge = harness()
    bridge.posted.length = 0
    bridge.host.emit({ kind: 'state', state: 'input' })
    bridge.host.emit({
      kind: 'input',
      line: 2,
      target: { name: 'x', type: { kind: 'scalar', name: 'integer' } },
    })
    expect(bridge.posted.filter((message) => message.type === 'inputRequest')).toEqual([
      { type: 'inputRequest', prompt: 'x' },
    ])
  })

  it('pushes a runtime error once, with its line, and then done with error', () => {
    const bridge = harness()
    bridge.store.getState().setSource(BROKEN)
    const diagnostic = compile(BROKEN, { profile: profiles.es }).diagnostics[0]
    if (diagnostic === undefined) throw new Error('BROKEN should not compile clean')
    bridge.store.getState().setDiagnostics([])
    bridge.store.getState().run()
    bridge.posted.length = 0
    bridge.host.emit({ kind: 'state', state: 'error' })
    bridge.host.emit({ kind: 'error', diagnostic, frames: [] })
    const errors = bridge.posted.filter((message) => message.type === 'error')
    expect(errors.length).toBe(1)
    expect(errors[0]).toMatchObject({ type: 'error', line: 2 })
    expect(errors[0]).toHaveProperty('message', expect.any(String))
    expect(bridge.posted.filter((message) => message.type === 'done')).toEqual([
      { type: 'done', state: 'error' },
    ])
  })

  it('posts only structured-cloneable payloads', () => {
    const bridge = harness()
    bridge.store.setState({
      diagnostics: [
        { from: 12, to: 13, severity: 'error', source: 'E3001', message: 'no existe x' },
      ],
    })
    bridge.send({ type: 'getSource' })
    bridge.send({ type: 'setProfile', profileId: 'en' })
    bridge.send({ type: 'setTheme', theme: 'dark' })
    bridge.send({ type: 'setTheme', theme: 'neon' })
    bridge.host.emit({ kind: 'state', state: 'running' })
    bridge.host.emit({ kind: 'output', chunks: ['x\n'] })
    bridge.host.emit({ kind: 'state', state: 'input' })
    bridge.host.emit({
      kind: 'input',
      line: 2,
      target: { name: 'x', type: { kind: 'scalar', name: 'integer' } },
    })
    bridge.host.emit({ kind: 'state', state: 'paused' })
    bridge.host.emit({
      kind: 'paused',
      reason: 'step',
      line: 3,
      frames: [
        {
          name: 'p',
          line: 3,
          variables: [
            { name: 'x', kind: 'variable', type: { kind: 'scalar', name: 'integer' }, value: 7 },
          ],
        },
      ],
    })
    bridge.host.emit({ kind: 'state', state: 'done' })
    expect(new Set(types(bridge.posted))).toEqual(
      new Set([
        'ready',
        'source',
        'diagnostics',
        'profile',
        'options',
        'error',
        'state',
        'output',
        'inputRequest',
        'paused',
        'done',
      ]),
    )
    for (const message of bridge.posted) {
      expect(() => structuredClone(message)).not.toThrow()
    }
  })
})
