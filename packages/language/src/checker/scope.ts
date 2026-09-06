import type { Identifier, MainBlock, Node, Program, SubprogramDecl } from '../ast/index'
import type { ConstValue, Type } from '../types/type'

export type SymbolKind = 'variable' | 'parameter' | 'result' | 'constant' | 'counter' | 'subprogram'

/**
 * One declared name. `type` is mutable because an untyped parameter or an untyped function
 * result is fixed later (§5.12); everything that identifies the symbol is not.
 */
export interface Symbol {
  /** Canonical: `Identifier.name`, already case-folded by the lexer unless `caseSensitive`. */
  readonly name: string
  readonly kind: SymbolKind
  type: Type
  /** The `Identifier` of the declaration, or the header for a result variable. */
  readonly declaredAt: Node
  readonly scope: Scope
  /** Parameters only. */
  readonly byRef?: boolean
  /** Subprogram symbols only: the declaration this name stands for. */
  readonly decl?: SubprogramDecl
  /** Constants only, once the value folded. */
  constValue?: ConstValue
  /** Arrays: set by a sized `Definir` shorthand or by `Dimension`. */
  dimensioned?: boolean
  /** True only while the checker is inside the `Para` body this symbol counts (§5.9). */
  counting?: boolean
  /**
   * Declared by recovery after E3001, so a second use of the same unknown name does not
   * report again (§3.2). Exempt from every later diagnostic, warnings included: the one
   * mistake was already reported.
   */
  readonly recovered?: true
  reads: number
  writes: number
}

/**
 * Two kinds and no block scopes (§3.1). The program scope holds subprogram names; one body
 * scope stands under it per main, per `extraMains` entry and per subprogram. Bodies are
 * siblings, so a subprogram never sees main's variables.
 */
export interface Scope {
  readonly kind: 'program' | 'body'
  readonly owner: Program | MainBlock | SubprogramDecl
  readonly parent: Scope | null
  readonly symbols: Map<string, Symbol>
  /** Declaration order. Every warning pass walks this, never the `Map`, so output is stable. */
  readonly order: Symbol[]
}

export function createScope(
  kind: Scope['kind'],
  owner: Scope['owner'],
  parent: Scope | null,
): Scope {
  return { kind, owner, parent, symbols: new Map(), order: [] }
}

export interface SymbolInit {
  readonly name: string
  readonly kind: SymbolKind
  readonly type: Type
  readonly declaredAt: Node
  readonly scope: Scope
  readonly byRef?: boolean
  readonly decl?: SubprogramDecl
  readonly recovered?: true
}

/**
 * `exactOptionalPropertyTypes` forbids writing `byRef: undefined`, so the optional fields are
 * spread in only when they were given.
 */
export function createSymbol(init: SymbolInit): Symbol {
  return {
    name: init.name,
    kind: init.kind,
    type: init.type,
    declaredAt: init.declaredAt,
    scope: init.scope,
    ...(init.byRef === undefined ? {} : { byRef: init.byRef }),
    ...(init.decl === undefined ? {} : { decl: init.decl }),
    ...(init.recovered === undefined ? {} : { recovered: init.recovered }),
    reads: 0,
    writes: 0,
  }
}

/**
 * Adds the symbol. Clashes are the caller's business: E3002 wants the *first* declaration as
 * its `related` span, so the caller looks the name up before declaring and decides. The one
 * caller that declares over a name this scope already holds is the real declaration
 * replacing the recovery symbol of §3.2 — it takes that symbol's place in `order` instead of
 * standing beside it, so one name is one entry however it came to be declared.
 */
export function declareSymbol(scope: Scope, symbol: Symbol): Symbol {
  const replaced = scope.symbols.get(symbol.name)
  scope.symbols.set(symbol.name, symbol)
  const at = replaced === undefined ? -1 : scope.order.indexOf(replaced)
  if (at < 0) scope.order.push(symbol)
  else scope.order[at] = symbol
  return symbol
}

export function lookupLocal(scope: Scope, name: string): Symbol | undefined {
  return scope.symbols.get(name)
}

/** This scope, then its parents. A body scope's only parent is the program scope. */
export function lookup(scope: Scope, name: string): Symbol | undefined {
  for (let current: Scope | null = scope; current !== null; current = current.parent) {
    const found = current.symbols.get(name)
    if (found !== undefined) return found
  }
  return undefined
}

/** A `missing` identifier is never declared and never resolved (§3.2). */
export function isMissing(id: Identifier): boolean {
  return id.missing === true
}
