/** A half-open range of UTF-16 offsets into the source: `start` inclusive, `end` exclusive. */
export interface Span {
  readonly start: number
  readonly end: number
}

/** A 1-based line/column pair, the shape editors and error messages want. */
export interface Position {
  readonly line: number
  readonly column: number
}

const LF = 10
const CR = 13

/**
 * Offset ↔ line/column for one source string. Built once per parse and shared: construction
 * is a single linear scan, `positionAt` is a binary search over the line-start table.
 *
 * A CRLF pair is one break, and so is a lone CR — the lexer's `newline` token uses the same
 * rule, so token spans and positions always agree.
 */
export class LineMap {
  /** Offset of the first character of each line, in order; always starts with 0. */
  private readonly starts: readonly number[]

  constructor(readonly source: string) {
    const starts: number[] = [0]
    for (let i = 0; i < source.length; i++) {
      const code = source.charCodeAt(i)
      if (code === CR) {
        if (source.charCodeAt(i + 1) === LF) i++
        starts.push(i + 1)
      } else if (code === LF) {
        starts.push(i + 1)
      }
    }
    this.starts = starts
  }

  /** Number of lines; a source ending in a break has a final empty line. */
  get lineCount(): number {
    return this.starts.length
  }

  /** Offset of the first character of `line` (1-based), clamped into range. */
  lineStart(line: number): number {
    const index = Math.max(0, Math.min(line - 1, this.starts.length - 1))
    return this.starts[index] ?? 0
  }

  /** Offset just past the last character of `line`, excluding its line terminator. */
  lineEnd(line: number): number {
    const index = Math.max(0, Math.min(line - 1, this.starts.length - 1))
    const next = this.starts[index + 1]
    if (next === undefined) return this.source.length
    let end = next
    if (end > 0 && this.source.charCodeAt(end - 1) === LF) end--
    if (end > 0 && this.source.charCodeAt(end - 1) === CR) end--
    return end
  }

  /** The 1-based position of `offset`; offsets outside the source clamp to its ends. */
  positionAt(offset: number): Position {
    const clamped = Math.max(0, Math.min(offset, this.source.length))
    let low = 0
    let high = this.starts.length - 1
    while (low < high) {
      const mid = (low + high + 1) >> 1
      if ((this.starts[mid] ?? 0) <= clamped) low = mid
      else high = mid - 1
    }
    return { line: low + 1, column: clamped - (this.starts[low] ?? 0) + 1 }
  }

  /** The offset of `position`; a line or column out of range clamps to the nearest valid one. */
  offsetAt(position: Position): number {
    const line = Math.max(1, Math.min(position.line, this.starts.length))
    const start = this.lineStart(line)
    const nextLineStart =
      line < this.starts.length ? (this.starts[line] ?? this.source.length) : this.source.length
    const column = Math.max(1, position.column)
    const maxOffset = line === this.starts.length ? nextLineStart : nextLineStart - 1
    return Math.min(start + column - 1, maxOffset)
  }
}
