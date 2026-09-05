import { isTrivia, type Token } from '../lexer/index'

const EOF_FALLBACK: Token = { kind: 'eof', text: '', span: { start: 0, end: 0 } }

/**
 * A position in the token stream with two views: the significant view, which skips
 * whitespace, comments *and* newlines, and the raw view, which skips only whitespace and
 * comments so the terminator rule can see line breaks.
 */
export class Cursor {
  private position = 0
  private consumed = -1
  private readonly eof: Token

  constructor(readonly tokens: readonly Token[]) {
    this.eof = tokens[tokens.length - 1] ?? EOF_FALLBACK
  }

  /** First index at or after `from` that is not whitespace or a comment. */
  private skipTrivia(from: number): number {
    let index = from
    while (index < this.tokens.length) {
      const token = this.tokens[index]
      if (token === undefined || !isTrivia(token)) break
      index++
    }
    return index
  }

  /** First index at or after `from` that is significant: trivia and newlines skipped. */
  private skipAll(from: number): number {
    let index = this.skipTrivia(from)
    while (index < this.tokens.length && this.tokens[index]?.kind === 'newline') {
      index = this.skipTrivia(index + 1)
    }
    return index
  }

  /** Token index of the next significant token. */
  at(): number {
    return this.skipAll(this.position)
  }

  /** The next significant token. Always defined: the stream ends with `eof`. */
  peek(): Token {
    return this.tokens[this.at()] ?? this.eof
  }

  /** The significant token `count` places after `peek()`. */
  peekAhead(count: number): Token {
    let index = this.at()
    for (let step = 0; step < count; step++) index = this.skipAll(index + 1)
    return this.tokens[index] ?? this.eof
  }

  /** The next token with newlines significant: a `newline` token if one comes first. */
  peekRaw(): Token {
    return this.tokens[this.skipTrivia(this.position)] ?? this.eof
  }

  /** Consumes and returns `peek()`; `eof` is never consumed. */
  next(): Token {
    const index = this.at()
    const token = this.tokens[index] ?? this.eof
    if (token.kind !== 'eof') {
      this.consumed = index
      this.position = index + 1
    }
    return token
  }

  /** Index of the last consumed token, or `-1` before anything is consumed. */
  lastIndex(): number {
    return this.consumed
  }

  /** True when a line break separates the last consumed token from `peek()`. */
  onNewLine(): boolean {
    const end = this.at()
    for (let index = this.consumed + 1; index < end; index++) {
      if (this.tokens[index]?.kind === 'newline') return true
    }
    return false
  }

  atEnd(): boolean {
    return this.peek().kind === 'eof'
  }
}
