import { ErrorListener, Recognizer, Token } from 'antlr4';
import { StepCodeError } from './stepcode.error.ts';

type Symbol = {
  _text?: string | null
}
export class CollectorErrorListener extends ErrorListener<Token> {
  private errors: StepCodeError[] = []

  constructor() {
    super()
  }

  syntaxError(_recognizer: Recognizer<Token>, offendingSymbol: Token, line: number, column: number, msg: string, _e: any) {
    let endColumn = column + 1
    if (offendingSymbol.text !== null) {
      endColumn = column + offendingSymbol.text.length
    }
    this.errors.push(new StepCodeError({
      startLine: line,
      startColumn: column,
      endLine: line,
      endColumn: endColumn,
      message: msg
    }))
  }

  getErrors() {
    return this.errors
  }
}