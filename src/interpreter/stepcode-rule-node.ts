import { ParseTree, ParserRuleContext } from 'antlr4ng';


export class StepCodeRuleNode extends ParserRuleContext {
  children: ParseTree[] | null = []
}