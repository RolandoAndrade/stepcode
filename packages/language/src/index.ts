export const packageName = 'stepcode'

export type {
  AssignStmt,
  Binary,
  BinaryOp,
  BreakStmt,
  BuiltinCall,
  Call,
  CallStmt,
  ClearStmt,
  ConstantStmt,
  ContinueStmt,
  DefineStmt,
  DimensionItem,
  DimensionStmt,
  ErrorExpr,
  ErrorStmt,
  Expr,
  ForStmt,
  Identifier,
  IfBranch,
  IfStmt,
  Index,
  Literal,
  LiteralType,
  MainBlock,
  Node,
  Param,
  Program,
  ReadStmt,
  RepeatStmt,
  ReturnStmt,
  Stmt,
  SubprogramDecl,
  SwitchCase,
  SwitchStmt,
  TokenRange,
  TypeRef,
  Unary,
  UnaryOp,
  Visitor,
  WaitKeyStmt,
  WaitStmt,
  WhileStmt,
  WriteStmt,
} from './ast/index'
export { childrenOf, walk } from './ast/index'
export type { CheckResult, Scope, Symbol, SymbolKind } from './checker/index'
// The scope mutators and the checker's own state stay inside the package (spec §2): a
// consumer reads the tables `check` hands back, it never builds a scope of its own.
export { check, lookup, suggestName } from './checker/index'
export type { CompileResult } from './compile'
export { compile } from './compile'
export type {
  Catalog,
  Diagnostic,
  DiagnosticCode,
  DiagnosticData,
  RelatedSpan,
  Severity,
} from './diagnostics/index'
export {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  formatDiagnostic,
  registerCatalog,
  sortDiagnostics,
} from './diagnostics/index'
export type {
  ArrayValue,
  Frame,
  FrameVariable,
  InputRequest,
  PauseReason,
  Run,
  RunOptions,
  RunOutcome,
  RunProgramOptions,
  RunState,
  RuntimeValue,
  Scalar,
  StepResult,
} from './interpreter/index'
export {
  DEFAULT_BUDGET,
  DEFAULT_STACK_DEPTH,
  renderValue,
  runProgram,
  start,
} from './interpreter/index'
export type { Token, TokenizeResult, TokenKind } from './lexer/index'
export { isTrivia, tokenize } from './lexer/index'
export type { ParseResult } from './parser/index'
export { parse } from './parser/index'
export type { Position, Span } from './source/index'
export { LineMap } from './source/index'
export type { AssignFailure, AssignHint } from './types/assign'
export { assignable, assignFailure } from './types/assign'
export type { BuiltinSignature } from './types/builtins'
export { BUILTIN_SIGNATURES, builtinResult } from './types/builtins'
export type { ConstantLookup } from './types/fold'
export { fold } from './types/fold'
export type { BinaryRule, OperandError, OperatorCheck } from './types/operators'
export {
  accepts,
  BINARY_TABLE,
  checkBinary,
  checkUnary,
  comparable,
  operatorSpelling,
  UNARY_TABLE,
} from './types/operators'
export type {
  ArrayType,
  ConstValue,
  Expected,
  OperandClass,
  ScalarType,
  Type,
  UnknownType,
} from './types/type'
export {
  arrayOf,
  BOOLEAN,
  CHAR,
  classToString,
  constType,
  expectedToString,
  INTEGER,
  isArray,
  isNumeric,
  isScalar,
  isText,
  isUnknown,
  REAL,
  STRING,
  sameType,
  scalar,
  typeToString,
  UNKNOWN,
} from './types/type'
