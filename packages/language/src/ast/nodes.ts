import type { BuiltinKey, TypeKey } from '@stepcode/profiles'
import type { Span } from '../source/index'

/** Inclusive first/last token indices into `ParseResult.tokens`. */
export type TokenRange = readonly [number, number]

interface NodeBase {
  readonly span: Span
  readonly tokens: TokenRange
}

export type BinaryOp =
  | 'plus'
  | 'minus'
  | 'times'
  | 'divide'
  | 'power'
  | 'div'
  | 'mod'
  | 'equal'
  | 'notEqual'
  | 'lt'
  | 'le'
  | 'gt'
  | 'ge'
  | 'and'
  | 'or'

export type UnaryOp = 'minus' | 'plus' | 'not'

export type LiteralType = 'integer' | 'real' | 'string' | 'boolean'

// --- structure -------------------------------------------------------------

export interface Program extends NodeBase {
  readonly kind: 'Program'
  readonly subprograms: readonly SubprogramDecl[]
  readonly main: MainBlock | null
}

export interface MainBlock extends NodeBase {
  readonly kind: 'MainBlock'
  readonly name: Identifier
  readonly body: readonly Stmt[]
}

export interface SubprogramDecl extends NodeBase {
  readonly kind: 'SubprogramDecl'
  readonly form: 'procedure' | 'function'
  readonly name: Identifier
  readonly params: readonly Param[]
  readonly returnName?: Identifier
  readonly returnType?: TypeRef
  readonly body: readonly Stmt[]
}

export interface Param extends NodeBase {
  readonly kind: 'Param'
  readonly name: Identifier
  readonly type?: TypeRef
  readonly byRef: boolean
}

/** `dimensions`: `[]` scalar; `[null]` is `T[]`; `[null, null]` is `T[,]`; `[e1, e2]` is sized. */
export interface TypeRef extends NodeBase {
  readonly kind: 'TypeRef'
  readonly base: TypeKey
  readonly dimensions: readonly (Expr | null)[]
}

export interface Identifier extends NodeBase {
  readonly kind: 'Identifier'
  /** Canonical name: `text.toLowerCase()` unless the profile is case sensitive. */
  readonly name: string
  /** Exactly as written in the source. */
  readonly text: string
  /**
   * Set on an identifier the parser synthesized because the source had none. A missing
   * identifier always has `name === ''` and `text === ''`, stands on the last token consumed
   * before the gap, and is never a real symbol: the checker must not declare or resolve it.
   */
  readonly missing?: true
}

// --- statements ------------------------------------------------------------

export interface DefineStmt extends NodeBase {
  readonly kind: 'DefineStmt'
  readonly names: readonly Identifier[]
  readonly type: TypeRef
}

/** A plain record, not a `Node`: it carries a range but no `kind`. Same for the two below. */
export interface DimensionItem extends NodeBase {
  readonly name: Identifier
  readonly sizes: readonly Expr[]
}

export interface DimensionStmt extends NodeBase {
  readonly kind: 'DimensionStmt'
  readonly items: readonly DimensionItem[]
}

export interface ConstantStmt extends NodeBase {
  readonly kind: 'ConstantStmt'
  readonly name: Identifier
  readonly type?: TypeRef
  readonly value: Expr
}

export interface AssignStmt extends NodeBase {
  readonly kind: 'AssignStmt'
  readonly target: Identifier | Index
  readonly value: Expr
  readonly viaEquals: boolean
}

export interface WriteStmt extends NodeBase {
  readonly kind: 'WriteStmt'
  readonly args: readonly Expr[]
  /** `false` for the writeNoNewline form. */
  readonly newline: boolean
}

export interface ReadStmt extends NodeBase {
  readonly kind: 'ReadStmt'
  readonly targets: readonly (Identifier | Index)[]
}

export interface IfBranch extends NodeBase {
  readonly condition: Expr
  readonly body: readonly Stmt[]
}

export interface IfStmt extends NodeBase {
  readonly kind: 'IfStmt'
  /** The `if` branch first, then every `elseIf` branch in source order. */
  readonly branches: readonly IfBranch[]
  readonly elseBody?: readonly Stmt[]
}

export interface SwitchCase extends NodeBase {
  readonly values: readonly Expr[]
  readonly body: readonly Stmt[]
}

export interface SwitchStmt extends NodeBase {
  readonly kind: 'SwitchStmt'
  readonly selector: Expr
  readonly cases: readonly SwitchCase[]
  readonly otherwise?: readonly Stmt[]
}

export interface WhileStmt extends NodeBase {
  readonly kind: 'WhileStmt'
  readonly condition: Expr
  readonly body: readonly Stmt[]
}

export interface RepeatStmt extends NodeBase {
  readonly kind: 'RepeatStmt'
  readonly body: readonly Stmt[]
  readonly condition: Expr
  /** `true` when closed with the `until` keyword, `false` for the `while` closer. */
  readonly until: boolean
}

export interface ForStmt extends NodeBase {
  readonly kind: 'ForStmt'
  readonly counter: Identifier
  readonly from: Expr
  readonly to: Expr
  readonly step?: Expr
  readonly body: readonly Stmt[]
}

export interface BreakStmt extends NodeBase {
  readonly kind: 'BreakStmt'
}

export interface ContinueStmt extends NodeBase {
  readonly kind: 'ContinueStmt'
}

export interface ReturnStmt extends NodeBase {
  readonly kind: 'ReturnStmt'
  readonly value?: Expr
}

export interface CallStmt extends NodeBase {
  readonly kind: 'CallStmt'
  readonly call: Call | BuiltinCall
}

export interface ClearStmt extends NodeBase {
  readonly kind: 'ClearStmt'
}

export interface WaitStmt extends NodeBase {
  readonly kind: 'WaitStmt'
  readonly millis: Expr
}

export interface WaitKeyStmt extends NodeBase {
  readonly kind: 'WaitKeyStmt'
}

export interface ErrorStmt extends NodeBase {
  readonly kind: 'ErrorStmt'
}

// --- expressions -----------------------------------------------------------

export interface Literal extends NodeBase {
  readonly kind: 'Literal'
  readonly value: number | string | boolean
  readonly type: LiteralType
}

export interface Index extends NodeBase {
  readonly kind: 'Index'
  readonly target: Expr
  /** `a[i,j]` and `a[i][j]` both produce one node with two indices. */
  readonly indices: readonly Expr[]
}

export interface Call extends NodeBase {
  readonly kind: 'Call'
  readonly callee: Identifier
  readonly args: readonly Expr[]
}

export interface BuiltinCall extends NodeBase {
  readonly kind: 'BuiltinCall'
  readonly key: BuiltinKey
  readonly args: readonly Expr[]
}

export interface Unary extends NodeBase {
  readonly kind: 'Unary'
  readonly op: UnaryOp
  readonly operand: Expr
}

export interface Binary extends NodeBase {
  readonly kind: 'Binary'
  readonly op: BinaryOp
  readonly left: Expr
  readonly right: Expr
}

export interface ErrorExpr extends NodeBase {
  readonly kind: 'ErrorExpr'
}

export type Expr = Literal | Identifier | Index | Call | BuiltinCall | Unary | Binary | ErrorExpr

export type Stmt =
  | DefineStmt
  | DimensionStmt
  | ConstantStmt
  | AssignStmt
  | WriteStmt
  | ReadStmt
  | IfStmt
  | SwitchStmt
  | WhileStmt
  | RepeatStmt
  | ForStmt
  | BreakStmt
  | ContinueStmt
  | ReturnStmt
  | CallStmt
  | ClearStmt
  | WaitStmt
  | WaitKeyStmt
  | ErrorStmt

export type Node = Program | MainBlock | SubprogramDecl | Param | TypeRef | Stmt | Expr
