import type { BuiltinKey, KeywordKey, OperatorKey, TypeKey } from '@stepcode/profiles'
import type { Diagnostic } from '../diagnostics/index'
import type { Span } from '../source/index'

export type TokenKind =
  | 'keyword'
  | 'type'
  | 'builtin'
  | 'operator'
  | 'identifier'
  | 'integer'
  | 'real'
  | 'string'
  | 'punct'
  | 'newline'
  | 'whitespace'
  | 'comment'
  | 'error'
  | 'eof'

/**
 * `text` is always the exact source slice, so the stream is lossless. `value` carries the
 * decoded meaning: the profile key for a construct, the canonical name for an identifier,
 * the number for a literal, the quote-free content for a string, the character for punct.
 */
export interface Token {
  readonly kind: TokenKind
  readonly text: string
  readonly span: Span
  readonly value?: KeywordKey | TypeKey | BuiltinKey | OperatorKey | string | number
}

export interface TokenizeResult {
  readonly tokens: Token[]
  readonly diagnostics: Diagnostic[]
}

/** Trivia never reaches the parser's significant-token view. */
export function isTrivia(token: Token): boolean {
  return token.kind === 'whitespace' || token.kind === 'comment'
}
