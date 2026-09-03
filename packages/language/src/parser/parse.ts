import type { ResolvedProfile } from '@stepcode/profiles'
import type { Program } from '../ast/index'
import type { Diagnostic } from '../diagnostics/index'
import { type Token, tokenize } from '../lexer/index'
import { createContext } from './context'
import { parseProgram } from './declarations'
import { sealRanges } from './ranges'

export interface ParseResult {
  readonly program: Program
  readonly tokens: readonly Token[]
  readonly diagnostics: readonly Diagnostic[]
}

/**
 * Source to AST. Never throws; every option comes from `options.profile.options`.
 * Lexer diagnostics come first, then parser diagnostics in the order they were found.
 */
export function parse(source: string, options: { profile: ResolvedProfile }): ParseResult {
  const { tokens, diagnostics } = tokenize(source, options.profile)
  const ctx = createContext(source, tokens, options.profile, diagnostics)
  const program = parseProgram(ctx)
  sealRanges(program, tokens)
  return { program, tokens, diagnostics: ctx.diagnostics }
}
