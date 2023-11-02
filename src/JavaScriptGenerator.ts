import StepCodeVisitor from './parser/StepCodeVisitor.ts';
import { AssignmentStatementContext } from './parser/StepCodeParser.ts';
import { TerminalNode } from 'antlr4';

export class JavaScriptGenerator extends StepCodeVisitor<string>{

  visitTerminal(node: TerminalNode): string {
    return node.getText()
  }

  visitAssignmentStatement =  (ctx: AssignmentStatementContext) => {
    const key = this.visit(ctx.variable())
    const value = this.visit(ctx.expression())
    return `${key}:${value}`
  };
}