import { ParseTree, RuleNode } from 'antlr4';

export class StepCodeRuleNode extends RuleNode {
  children: ParseTree[] | null = []
}