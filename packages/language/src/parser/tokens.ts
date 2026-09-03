import type { KeywordKey, OperatorKey } from '@stepcode/profiles'
import type { Token } from '../lexer/index'

export function keywordKeyOf(token: Token): KeywordKey | null {
  return token.kind === 'keyword' ? (token.value as KeywordKey) : null
}

export function isKeyword(token: Token, key: KeywordKey): boolean {
  return token.kind === 'keyword' && token.value === key
}

export function operatorKeyOf(token: Token): OperatorKey | null {
  return token.kind === 'operator' ? (token.value as OperatorKey) : null
}

export function isOperator(token: Token, key: OperatorKey): boolean {
  return token.kind === 'operator' && token.value === key
}

export function isPunct(token: Token, text: string): boolean {
  return token.kind === 'punct' && token.text === text
}
