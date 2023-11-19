import { ParserRuleContext } from 'antlr4ng';
import { StepCodeError } from './stepcode.error.ts';

export function createStepCodeError(ctx: ParserRuleContext, message: string) {
  return new StepCodeError({
      startLine: ctx.start?.line || 0,
      startColumn: ctx.start?.column || 0,
      endLine: ctx.stop?.line || 0,
      endColumn: ctx.stop?.column || 0,
      message: message
    }
  )
}