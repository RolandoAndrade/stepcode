import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from './ast/index'
import { type CheckResult, check } from './checker/index'
import { sortDiagnostics } from './diagnostics/sort'
import type { Token } from './lexer/index'
import { parse } from './parser/index'

/**
 * What `compile` hands back: the checker's tables unchanged, the merged diagnostics, the tree,
 * the token stream it was built from and the source. The interpreter reads `types`, `symbols`
 * and `calls` from here and builds its line map from `source` (interpreter spec §7.1); the
 * CodeMirror package attaches every `tokens` entry to a tree node; nobody re-runs `check`.
 */
export interface CompileResult extends CheckResult {
  readonly ast: Program
  readonly tokens: readonly Token[]
  readonly source: string
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
    ...checked,
    diagnostics: sortDiagnostics([...parsed.diagnostics, ...checked.diagnostics]),
    ast: parsed.program,
    tokens: parsed.tokens,
    source,
  }
}
