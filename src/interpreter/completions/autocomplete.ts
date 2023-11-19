import { createParser } from '../parser.ts';
import { CodeCompletionCore } from 'antlr4-c3';
import { ErrorListener } from 'antlr4';

export function autocomplete(code: string): string {
  const parser = createParser(code)
  const errorListener = new ErrorListener()
  parser.addErrorListener(errorListener)
  const core = new CodeCompletionCore(parser);

}