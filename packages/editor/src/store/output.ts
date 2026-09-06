/** Spec §6.1: the console's bounded, immutable-by-replacement output. */
export interface OutputBuffer {
  readonly chunks: readonly string[]
  /** How many chunks were dropped from the front since the buffer was last cleared. */
  readonly dropped: number
}

export const OUTPUT_CAP = 10_000

export const emptyOutput: OutputBuffer = Object.freeze({ chunks: [], dropped: 0 })

export function appendOutput(
  buffer: OutputBuffer,
  chunks: readonly string[],
  cap: number = OUTPUT_CAP,
): OutputBuffer {
  if (chunks.length === 0) return buffer
  const all = [...buffer.chunks, ...chunks]
  const excess = Math.max(0, all.length - cap)
  return { chunks: excess === 0 ? all : all.slice(excess), dropped: buffer.dropped + excess }
}
