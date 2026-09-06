import { describe, expect, it } from 'vitest'
import { appendOutput, emptyOutput, OUTPUT_CAP } from '../src/store/output'

describe('appendOutput', () => {
  it('appends chunks in order without joining them', () => {
    const one = appendOutput(emptyOutput, ['a', 'b\n'])
    const two = appendOutput(one, ['c'])
    expect(two.chunks).toEqual(['a', 'b\n', 'c'])
    expect(two.dropped).toBe(0)
    expect(one.chunks).toEqual(['a', 'b\n'])
  })

  it('leaves the buffer untouched for an empty append', () => {
    const one = appendOutput(emptyOutput, ['a'])
    expect(appendOutput(one, [])).toBe(one)
  })

  it('drops the oldest chunks past the cap and counts them', () => {
    const cap = 3
    const one = appendOutput(emptyOutput, ['1', '2', '3'], cap)
    expect(one.dropped).toBe(0)
    const two = appendOutput(one, ['4', '5'], cap)
    expect(two.chunks).toEqual(['3', '4', '5'])
    expect(two.dropped).toBe(2)
    const three = appendOutput(two, ['6'], cap)
    expect(three.chunks).toEqual(['4', '5', '6'])
    expect(three.dropped).toBe(3)
  })

  it('handles one append larger than the cap', () => {
    const big = appendOutput(emptyOutput, ['1', '2', '3', '4', '5'], 2)
    expect(big.chunks).toEqual(['4', '5'])
    expect(big.dropped).toBe(3)
  })

  it('caps at 10 000 chunks by default', () => {
    expect(OUTPUT_CAP).toBe(10_000)
    const chunks = Array.from({ length: OUTPUT_CAP + 1 }, (_, i) => String(i))
    const out = appendOutput(emptyOutput, chunks)
    expect(out.chunks.length).toBe(OUTPUT_CAP)
    expect(out.chunks[0]).toBe('1')
    expect(out.dropped).toBe(1)
  })
})
