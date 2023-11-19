import { StepCodeError } from './stepcode.error.ts';
import { Recognizer, Token, BaseErrorListener } from 'antlr4ng';
import { ATNSimulator } from 'antlr4ng/dist/atn/ATNSimulator';

type Symbol = {
  _text?: string | null
}
export class CollectorErrorListener extends BaseErrorListener {
  private errors: StepCodeError[] = []

  constructor() {
    super()
  }

  syntaxError(_recognizer: Recognizer<ATNSimulator>, offendingSymbol: Token | null, line: number, column: number, msg: string, _e: any) {
    let endColumn = column + 1
    if (offendingSymbol && offendingSymbol.text !== null) {
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