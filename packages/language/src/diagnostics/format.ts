import type {
  BuiltinKey,
  KeywordKey,
  OperatorKey,
  ResolvedProfile,
  TypeKey,
} from '@stepcode/profiles'
import { en } from './catalog/en'
import { es } from './catalog/es'
import type { DiagnosticCode } from './codes'
import type { Diagnostic } from './diagnostic'

export interface Catalog {
  /** One template per code. */
  readonly templates: Readonly<Record<DiagnosticCode, string>>
  /** Optional `${code}.${hint}` variants, chosen when `data.hint` matches. */
  readonly variants?: Readonly<Record<string, string>>
}

/**
 * Process-global on purpose: a catalog registered anywhere serves every caller, the way a
 * locale is a property of the process and not of one parse.
 */
const catalogs = new Map<string, Catalog>()
let shippedRegistered = false

/**
 * The two shipped catalogs, registered on first use rather than at module load, so importing
 * the package has no side effect (`sideEffects: false` stays true). Registering runs before
 * any caller's own `registerCatalog`, so an override is never clobbered afterwards.
 */
function registerShipped(): void {
  if (shippedRegistered) return
  shippedRegistered = true
  catalogs.set('es', es)
  catalogs.set('en', en)
}

/** Adds or replaces the catalog for `locale`. Locales are matched case-insensitively. */
export function registerCatalog(locale: string, catalog: Catalog): void {
  registerShipped()
  catalogs.set(locale.toLowerCase(), catalog)
}

/**
 * `pt-BR` → `pt` → `en`: drop one subtag at a time, then the ultimate fallback. `en` is
 * always last, so a catalog is always found.
 */
function localeChain(locale: string): string[] {
  const chain: string[] = []
  const parts = locale.toLowerCase().split('-')
  for (let length = parts.length; length > 0; length--) chain.push(parts.slice(0, length).join('-'))
  if (!chain.includes('en')) chain.push('en')
  return chain
}

function templateFor(
  code: DiagnosticCode,
  hint: string | undefined,
  locale: string,
): string | undefined {
  registerShipped()
  for (const candidate of localeChain(locale)) {
    const catalog = catalogs.get(candidate)
    if (catalog === undefined) continue
    if (hint !== undefined) {
      const variant = catalog.variants?.[`${code}.${hint}`]
      if (variant !== undefined) return variant
    }
    const template = catalog.templates[code]
    if (template !== undefined) return template
  }
  return undefined
}

/** The sections a `{kw:…}`-style slot can name. `fn` and `builtin` are the same table. */
type Section = 'kw' | 'type' | 'op' | 'fn' | 'builtin'

const SECTIONS: ReadonlySet<string> = new Set<Section>(['kw', 'type', 'op', 'fn', 'builtin'])

/** The profile's first spelling of a construct, or the key itself when it has none. */
function spellingOf(profile: ResolvedProfile, section: Section, key: string): string {
  const spellings =
    section === 'kw'
      ? profile.keywords[key as KeywordKey]
      : section === 'type'
        ? profile.types[key as TypeKey]
        : section === 'op'
          ? profile.operators[key as OperatorKey]
          : profile.builtins[key as BuiltinKey]
  return spellings?.[0] ?? key
}

const SLOT = /\{(kw|type|op|fn|builtin):(\$?[A-Za-z][A-Za-z0-9]*)\}|\{([A-Za-z][A-Za-z0-9]*)\}/g

/**
 * Renders one diagnostic. Never throws: an unknown code returns the code, a missing data slot
 * is left verbatim so the gap is visible instead of silently blank.
 */
export function formatDiagnostic(
  diagnostic: Diagnostic,
  locale: string,
  profile: ResolvedProfile,
): string {
  const rawHint = diagnostic.data.hint
  const hint = typeof rawHint === 'string' ? rawHint : undefined
  const template = templateFor(diagnostic.code, hint, locale)
  if (template === undefined) return diagnostic.code
  return template.replace(
    SLOT,
    (match, section: string | undefined, key: string | undefined, plain: string | undefined) => {
      if (section !== undefined && key !== undefined && SECTIONS.has(section)) {
        const resolved = key.startsWith('$') ? diagnostic.data[key.slice(1)] : key
        if (resolved === undefined) return match
        return spellingOf(profile, section as Section, String(resolved))
      }
      if (plain === undefined) return match
      const value = diagnostic.data[plain]
      return value === undefined ? match : String(value)
    },
  )
}
