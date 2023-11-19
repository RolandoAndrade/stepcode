import StepCodeParser, { ProgramContext } from '../parser/StepCodeParser.ts';
import { createLexer } from './lexer.ts';
import { CommonTokenStream } from 'antlr4';
import StepCodeLexer from '../parser/StepCodeLexer.ts';

export function createParser(code: string): StepCodeParser {
  const lexer = createLexer(code)
  return createParserFromLexer(lexer)
}

export function createParserFromLexer(lexer: StepCodeLexer): StepCodeParser {
  const tokens = new CommonTokenStream(lexer)
  return new StepCodeParser(tokens)
}

export function parseTree(code: string): ProgramContext {
  const parser = createParser(code)
  return parser.program()
}