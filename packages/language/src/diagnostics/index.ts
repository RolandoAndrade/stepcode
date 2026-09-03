import { en } from './catalog/en'
import { es } from './catalog/es'
import { registerCatalog } from './format'

// The two shipped catalogs are registered at module load; `en` is the ultimate fallback.
registerCatalog('es', es)
registerCatalog('en', en)

export { en } from './catalog/en'
export { es } from './catalog/es'
export type { DiagnosticCode, Severity } from './codes'
export { DIAGNOSTIC_CODES, DIAGNOSTIC_SEVERITY } from './codes'
export type { Diagnostic, DiagnosticData, RelatedSpan } from './diagnostic'
export { createDiagnostic } from './diagnostic'
export type { Catalog } from './format'
export { formatDiagnostic, registerCatalog } from './format'
