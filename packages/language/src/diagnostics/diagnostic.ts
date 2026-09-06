import type { Span } from '../source/index'
import { DIAGNOSTIC_SEVERITY, type DiagnosticCode, type Severity } from './codes'

/** Template slots. Values are plain data: never a rendered message, never a profile object. */
export interface DiagnosticData {
  readonly [slot: string]: string | number
}

export interface RelatedSpan {
  readonly span: Span
}

/**
 * A diagnostic is data. Human text exists only in `formatDiagnostic`, so the same diagnostic
 * renders in any locale and under any profile's spellings.
 */
export interface Diagnostic {
  readonly code: DiagnosticCode
  readonly severity: Severity
  readonly span: Span
  readonly data: DiagnosticData
  readonly related?: readonly RelatedSpan[]
}

export function createDiagnostic(
  code: DiagnosticCode,
  span: Span,
  data: DiagnosticData = {},
  related?: readonly RelatedSpan[],
): Diagnostic {
  // `exactOptionalPropertyTypes` forbids writing `related: undefined`, so build both shapes.
  return related === undefined
    ? { code, severity: DIAGNOSTIC_SEVERITY[code], span, data }
    : { code, severity: DIAGNOSTIC_SEVERITY[code], span, data, related }
}
