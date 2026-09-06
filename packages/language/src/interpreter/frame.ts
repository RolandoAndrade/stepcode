import type { MainBlock, Stmt, SubprogramDecl } from '../ast/index'
import type { CheckResult } from '../checker/result'
// biome-ignore lint/suspicious/noShadowRestrictedNames: `Symbol` is the checker's own type, per the checker spec (§3.1); it never appears with the global.
import type { Scope, Symbol, SymbolKind } from '../checker/scope'
import type { Type } from '../types/type'
import type { RuntimeValue, Slot } from './value'

/** One row of the variables panel (§3.7). */
export interface FrameVariable {
  /** As declared: `Symbol.name`, the canonical form. */
  readonly name: string
  readonly kind: SymbolKind
  readonly type: Type
  readonly value: RuntimeValue | undefined
}

/** What `inspect()` returns, one per active call. */
export interface Frame {
  /** The main block's name, or the subprogram's. */
  readonly name: string
  readonly line: number
  readonly variables: readonly FrameVariable[]
}

/**
 * The controller's frame: slots keyed by the checker's `Symbol` objects, so an identifier
 * reaches its storage through `program.symbols.get(id)` and this map — no name is ever looked
 * up at runtime (§4.2). `line` is the statement about to execute (innermost frame) or the
 * call in progress (outer frames); `returnValue` carries `Retornar v` out of a `f(): T`
 * function, which has no result variable.
 */
export interface RuntimeFrame {
  readonly name: string
  readonly scope: Scope
  readonly decl: SubprogramDecl | null
  readonly body: readonly Stmt[]
  readonly slots: Map<Symbol, Slot>
  readonly result: Symbol | null
  line: number
  returnValue: RuntimeValue | undefined
}

/** The body scope the checker built for a block: `CheckResult.scopes` holds one per body. */
export function bodyScopeOf(program: CheckResult, owner: MainBlock | SubprogramDecl): Scope {
  const scope = program.scopes.find((one) => one.kind === 'body' && one.owner === owner)
  if (scope === undefined) throw new Error(`no body scope for ${owner.name.text}`)
  return scope
}

/**
 * §4.2: one slot per symbol of `Scope.order`, all unassigned, except constants, filled from
 * the folded value the checker stored (E3024 guarantees every constant of a started program
 * has one). Parameters are bound afterwards by the caller (`bindSlot` or a plain write).
 */
export function createFrame(scope: Scope, line: number): RuntimeFrame {
  const owner = scope.owner
  if (owner.kind === 'Program') throw new Error('a frame needs a body scope, not the program scope')
  const slots = new Map<Symbol, Slot>()
  let result: Symbol | null = null
  for (const symbol of scope.order) {
    if (symbol.kind === 'subprogram') continue
    const slot: Slot = { value: undefined }
    if (symbol.kind === 'constant' && symbol.constValue !== undefined) {
      slot.value = symbol.constValue.value
    }
    if (symbol.kind === 'result') result = symbol
    slots.set(symbol, slot)
  }
  return {
    name: owner.name.text,
    scope,
    decl: owner.kind === 'SubprogramDecl' ? owner : null,
    body: owner.body,
    slots,
    result,
    line,
    returnValue: undefined,
  }
}

export function slotOf(frame: RuntimeFrame, symbol: Symbol): Slot {
  const slot = frame.slots.get(symbol)
  if (slot === undefined) throw new Error(`no slot for ${symbol.name} in ${frame.name}`)
  return slot
}

/** By-reference binding: the callee's map entry *is* the caller's slot (§4.2). */
export function bindSlot(frame: RuntimeFrame, symbol: Symbol, slot: Slot): void {
  frame.slots.set(symbol, slot)
}

/** §3.7: innermost first; variables in `Scope.order`; an aliased parameter shows the alias. */
export function inspectFrames(frames: readonly RuntimeFrame[]): Frame[] {
  const out: Frame[] = []
  for (let index = frames.length - 1; index >= 0; index--) {
    const frame = frames[index]
    if (frame === undefined) continue
    const variables: FrameVariable[] = []
    for (const symbol of frame.scope.order) {
      if (symbol.kind === 'subprogram') continue
      variables.push({
        name: symbol.name,
        kind: symbol.kind,
        type: symbol.type,
        value: slotOf(frame, symbol).value,
      })
    }
    out.push({ name: frame.name, line: frame.line, variables })
  }
  return out
}
