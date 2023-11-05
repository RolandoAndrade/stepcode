import { StepCodeInterpreter } from './stepcode-interpreter.ts';
import StepCodeLexer from '../parser/StepCodeLexer.ts';
import StepCodeParser from '../parser/StepCodeParser.ts';
import { createLexer } from './lexer.ts';
import { createParserFromLexer } from './parser.ts';
import { EventBus } from './event-bus.ts';
import { CollectorErrorListener } from './errors';


type InterpretBaseProps = {
  code: string;
  eventBus: EventBus;
}

type InterpretWithLexerProps = InterpretBaseProps & {
  lexer: StepCodeLexer;
  eventBus: EventBus;
}

type InterpretWithInterpreterProps = {
  code: string;
  interpreter: StepCodeInterpreter;
}

type InterpretWithParserProps = InterpretBaseProps & {
  parser: StepCodeParser;
}

export type InterpretProps = InterpretBaseProps | InterpretWithLexerProps | InterpretWithInterpreterProps | InterpretWithParserProps;


type InternalProps = {
  lexer: StepCodeLexer;
  parser: StepCodeParser;
  interpreter: StepCodeInterpreter;
  eventBus: EventBus;
}
export function interpret({ code, ...props}: InterpretProps) {
  let { lexer, parser, interpreter, eventBus } = props as InternalProps
  lexer = lexer || createLexer(code)
  parser = parser || createParserFromLexer(lexer)
  interpreter = interpreter || new StepCodeInterpreter(eventBus)
  return interpreter.start(parser.program())
}

export function validate(code: string) {
  const lexer = createLexer(code)
  const parser = createParserFromLexer(lexer)
  parser.removeErrorListeners();
  const errorCollector = new CollectorErrorListener()
  parser.addErrorListener(errorCollector)
  parser.program()
  return errorCollector.getErrors()
}