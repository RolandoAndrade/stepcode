/** How far apart two names may be and still be offered as "did you mean" (§3.2). */
export const MAX_SUGGESTION_DISTANCE = 2

/**
 * Optimal string alignment distance: insertions, deletions, substitutions and the swap of two
 * adjacent characters, each costing one. `max` is a cutoff — once every cell of a row is past
 * it the answer can only grow, so the walk stops and returns `max + 1`. A near-miss search
 * over a scope of names should not cost a full matrix per name.
 */
export function damerauLevenshtein(left: string, right: string, max: number): number {
  const a = [...left]
  const b = [...right]
  if (Math.abs(a.length - b.length) > max) return max + 1
  let previousPrevious: number[] = []
  let previous: number[] = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    const current: number[] = new Array<number>(b.length + 1)
    current[0] = i
    let best = current[0] as number
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(
        (previous[j] as number) + 1,
        (current[j - 1] as number) + 1,
        (previous[j - 1] as number) + cost,
      )
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (previousPrevious[j - 2] as number) + 1)
      }
      current[j] = value
      if (value < best) best = value
    }
    if (best > max) return max + 1
    previousPrevious = previous
    previous = current
  }
  return previous[b.length] as number
}

/**
 * The nearest candidate within `MAX_SUGGESTION_DISTANCE`, compared after folding case and
 * accents with the profile's own normalizer — `AÑO` finds `año` at distance 0, and `anio`
 * still finds it at distance 2 (folding an accent is not the same as spelling it out, so `ñ`
 * vs `n`+`i` costs a substitution and a deletion). Candidates are visited in the order given
 * (declaration order), so ties resolve to the first one and the answer is deterministic. The
 * candidate is returned exactly as it was written.
 *
 * A candidate up to and including `MAX_SUGGESTION_DISTANCE` edits away is offered (§3.2:
 * "within distance 2"). `MAX_SUGGESTION_DISTANCE` is passed straight through as the
 * `damerauLevenshtein` cutoff, so the walk explores exactly that far before giving up.
 */
export function suggestName(
  name: string,
  candidates: readonly string[],
  normalize: (text: string) => string,
): string | undefined {
  const target = normalize(name)
  let best: string | undefined
  let bestDistance = MAX_SUGGESTION_DISTANCE + 1
  for (const candidate of candidates) {
    const distance = damerauLevenshtein(target, normalize(candidate), MAX_SUGGESTION_DISTANCE)
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return bestDistance <= MAX_SUGGESTION_DISTANCE ? best : undefined
}
