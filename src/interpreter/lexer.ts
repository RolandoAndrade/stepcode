import { StepCodeLexer } from '../parser/StepCodeLexer.ts';
import { CharStream, Token } from 'antlr4ng';


export function createLexer(code: string): StepCodeLexer {
  const chars = new CharStream(code, true)
  return new StepCodeLexer(chars)
}

export function createTokens(code: string): Token[] {
  const lexer = createLexer(code)
  return lexer.getAllTokens()
}