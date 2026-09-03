import { describe, expect, it } from 'vitest'
import { LineMap } from '../../src/source/index'

describe('LineMap', () => {
  it('maps offsets to 1-based line and column', () => {
    const map = new LineMap('ab\ncd\n')
    expect(map.positionAt(0)).toEqual({ line: 1, column: 1 })
    expect(map.positionAt(1)).toEqual({ line: 1, column: 2 })
    expect(map.positionAt(2)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(3)).toEqual({ line: 2, column: 1 })
    expect(map.positionAt(5)).toEqual({ line: 2, column: 3 })
  })

  it('counts a CRLF pair as one line break', () => {
    const map = new LineMap('a\r\nb')
    expect(map.lineCount).toBe(2)
    expect(map.positionAt(1)).toEqual({ line: 1, column: 2 })
    expect(map.positionAt(2)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(3)).toEqual({ line: 2, column: 1 })
  })

  it('counts a lone CR as a line break', () => {
    const map = new LineMap('a\rb\rc')
    expect(map.lineCount).toBe(3)
    expect(map.positionAt(2)).toEqual({ line: 2, column: 1 })
    expect(map.positionAt(4)).toEqual({ line: 3, column: 1 })
  })

  it('accepts the offset at end of file and clamps beyond it', () => {
    const map = new LineMap('ab')
    expect(map.positionAt(2)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(99)).toEqual({ line: 1, column: 3 })
    expect(map.positionAt(-4)).toEqual({ line: 1, column: 1 })
  })

  it('reports a trailing line break as an extra empty last line', () => {
    const map = new LineMap('a\n')
    expect(map.lineCount).toBe(2)
    expect(map.positionAt(2)).toEqual({ line: 2, column: 1 })
  })

  it('handles the empty source', () => {
    const map = new LineMap('')
    expect(map.lineCount).toBe(1)
    expect(map.positionAt(0)).toEqual({ line: 1, column: 1 })
    expect(map.offsetAt({ line: 1, column: 1 })).toBe(0)
  })

  it('round-trips every offset of a mixed-ending source', () => {
    const source = 'uno\r\ndos\rtres\ncuatro'
    const map = new LineMap(source)
    for (let offset = 0; offset <= source.length; offset++) {
      const position = map.positionAt(offset)
      const back = map.offsetAt(position)
      expect(map.positionAt(back)).toEqual(position)
    }
  })

  it('offsetAt clamps a column past the end of its line to the line end', () => {
    const map = new LineMap('ab\ncdef')
    expect(map.offsetAt({ line: 1, column: 99 })).toBe(2)
    expect(map.offsetAt({ line: 2, column: 3 })).toBe(5)
    expect(map.offsetAt({ line: 99, column: 1 })).toBe(3)
    expect(map.offsetAt({ line: 0, column: 0 })).toBe(0)
  })

  it('exposes line bounds without the terminator', () => {
    const map = new LineMap('ab\r\ncd')
    expect(map.lineStart(1)).toBe(0)
    expect(map.lineEnd(1)).toBe(2)
    expect(map.lineStart(2)).toBe(4)
    expect(map.lineEnd(2)).toBe(6)
  })
})
