import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from './ast/index'
import { check } from './checker/index'
import type { Diagnostic } from './diagnostics/index'
import { sortDiagnostics } from './diagnostics/sort'
import { parse } from './parser/index'

export interface CompileResult {
  readonly ast: Program
  readonly diagnostics: readonly Diagnostic[]
}

/**
 * Parse, then check — always both, even when the parser reported errors: an editor wants the
 * two kinds of diagnostic at once, and the checker is silent on the placeholders a broken
 * parse leaves behind (§2). Parser diagnostics are concatenated first, so at the same
 * position, severity and code the parser's is the one that survives deduplication (§7.2).
 */
export function compile(source: string, options: { profile: ResolvedProfile }): CompileResult {
  const parsed = parse(source, { profile: options.profile })
  const checked = check(parsed.program, { profile: options.profile })
  return {
    ast: parsed.program,
    diagnostics: sortDiagnostics([...parsed.diagnostics, ...checked.diagnostics]),
  }
}
