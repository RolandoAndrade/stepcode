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
 * parse leaves behind (§2). Deduplication keys on code and span (§7.2), and no code is both a
 * parser's and a checker's, so the two lists can only ever sort together — never collide.
 */
export function compile(source: string, options: { profile: ResolvedProfile }): CompileResult {
  const parsed = parse(source, { profile: options.profile })
  const checked = check(parsed.program, { profile: options.profile })
  return {
    ast: parsed.program,
    diagnostics: sortDiagnostics([...parsed.diagnostics, ...checked.diagnostics]),
  }
}
