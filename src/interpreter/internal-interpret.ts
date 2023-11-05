import { StepCodeInterpreter } from './stepcode-interpreter.ts';
import { interpret } from './interpreter.ts';

export function internalInterpret(code: string, interpreter: StepCodeInterpreter) {
  return interpret({ code, interpreter })
}