import { StepCodeInterpreter } from './stepcode-interpreter.ts';
import { CharStream, CommonTokenStream } from 'antlr4';
import StepCodeLexer from '../parser/StepCodeLexer.ts';
import StepCodeParser from '../parser/StepCodeParser.ts';

export function interpret(code: string, interpreter: StepCodeInterpreter) {
  const chars = new CharStream(code, true)
  const lexer = new StepCodeLexer(chars)
  const tokens = new CommonTokenStream(lexer)
  const parser = new StepCodeParser(tokens)

  const program = parser.program()
  return interpreter.start(program)
}