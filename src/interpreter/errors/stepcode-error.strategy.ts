import { DefaultErrorStrategy, Parser, RecognitionException } from 'antlr4';
import StepCodeParser from '../../parser/StepCodeParser.ts';

export class StepCodeErrorStrategy extends DefaultErrorStrategy {
  recover(recognizer: Parser, e: RecognitionException) {
    super.recover(recognizer, e);
  }
}