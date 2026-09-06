import type { Severity } from './codes'
import type { Diagnostic } from './diagnostic'

const SEVERITY_ORDER: Readonly<Record<Severity, number>> = { error: 0, warning: 1 }

/**
 * Spec §7.2: by `span.start`, then severity (errors first), then code. The sort is stable, so
 * diagnostics that tie on all three keep the order they were given — which is how `compile`
 * lets a parser diagnostic win over a checker one at the same place: it concatenates the
 * parser's first. Two diagnostics with the same code and span collapse to one, the first.
 */
export function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  const sorted = [...diagnostics].sort(
    (left, right) =>
      left.span.start - right.span.start ||
      SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] ||
      (left.code < right.code ? -1 : left.code > right.code ? 1 : 0),
  )
  const seen = new Set<string>()
  const unique: Diagnostic[] = []
  for (const diagnostic of sorted) {
    const key = `${diagnostic.code}@${diagnostic.span.start}-${diagnostic.span.end}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(diagnostic)
  }
  return unique
}
