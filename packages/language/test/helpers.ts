import type { Token } from '../src/lexer/index'

/**
 * A token stream as `kind:value` strings, the compact form the lexer tests assert against.
 * Whitespace and comments are dropped unless `includeTrivia` is set; newlines always show.
 */
export function tokenSummary(tokens: readonly Token[], includeTrivia = false): string[] {
  const out: string[] = []
  for (const token of tokens) {
    switch (token.kind) {
      case 'whitespace':
        if (includeTrivia) out.push('whitespace')
        break
      case 'comment':
        if (includeTrivia) out.push(`comment:${token.text}`)
        break
      case 'newline':
        out.push('newline')
        break
      case 'eof':
        out.push('eof')
        break
      case 'error':
        out.push(`error:${token.text}`)
        break
      default:
        out.push(`${token.kind}:${String(token.value ?? token.text)}`)
        break
    }
  }
  return out
}
