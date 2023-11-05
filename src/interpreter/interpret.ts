import { StepCodeInterpreter } from './stepcode-interpreter.ts';
import { parseTree } from './parser.ts';

export function interpret(code: string, interpreter: StepCodeInterpreter) {
  const program = parseTree(code)
  return interpreter.start(program)
}