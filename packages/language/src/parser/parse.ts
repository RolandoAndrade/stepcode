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
 * Diagnostics come sorted by position; at the same offset the lexer's come first.
 */
export function parse(source: string, options: { profile: ResolvedProfile }): ParseResult {
  const { tokens, diagnostics } = tokenize(source, options.profile)
  const ctx = createContext(source, tokens, options.profile, diagnostics)
  const program = parseProgram(ctx)
  sealRanges(program, tokens)
  // Sorted by position, stably: at the same offset the lexer's diagnostic comes first, because
  // it was pushed first. Readers want the file's order, not the parser's discovery order.
  const sorted = [...ctx.diagnostics].sort((left, right) => left.span.start - right.span.start)
  return { program, tokens, diagnostics: sorted }
}
