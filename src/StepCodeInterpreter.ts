import StepCodeVisitor from './parser/StepCodeVisitor.ts';
import {
  IdentifierContext,
  ProgramContext,
  ReadStatementContext,
  StringContext,
  Type_Context,
  VariableContext,
  VariableDeclarationContext,
  WriteStatementContext
} from './parser/StepCodeParser.ts';
import { EventBus } from './event-bus.ts';
import { StepCodeRuleNode } from './StepCodeRuleNode.ts';

export class StepCodeInterpreter extends StepCodeVisitor<Promise<string>> {
  protected programState: Map<string, {
    type: string,
    value: any
  }> = new Map();


  constructor(protected eventBus: EventBus) {
    super();
  }

  async visitChildren(node: StepCodeRuleNode): Promise<string> {
    const returnValues = []
    for (const child of node?.children || []) {
      returnValues.push(await this.visit(child))
    }
    return returnValues.join('')
  }

  async start(ctx: ProgramContext) {
    await this.visitChildren(ctx)
  }

  visitVariable = async (ctx: VariableContext) => {
    return `${this.programState.get(ctx.getText())?.value}`
  }

  visitString = async (ctx: StringContext) => {
    return ctx.getText().slice(1, -1)
  }

  visitIdentifier = async (ctx: IdentifierContext) => {
    return ctx.getText()
  }

  visitType_ = async (ctx: Type_Context) => {
    return ctx.getText()
  }

  visitVariableDeclaration = async (ctx: VariableDeclarationContext) => {
    const identifiers = await Promise.all(ctx.identifierList().identifier_list().map(async c => this.visit(c)))
    const type = await this.visit(ctx.type_())
    return `${type} ${identifiers}`
  }

  visitReadStatement = async (ctx: ReadStatementContext) => {
    const variables = await Promise.all(ctx.variable_list().map(async c => c.getText()))
    let readAssignations = []
    for (const variable of variables) {
      const value = await new Promise<string>(resolve => {
        this.eventBus.emit('input-request', (value: string) => {
          resolve(value)
        })
      })
      this.programState.set(variable, {
        type: 'string',
        value
      })
      readAssignations.push(`${variable} = ${value}`)
    }

    return readAssignations.join(',')
  }

  visitWriteStatement = async (ctx: WriteStatementContext) => {
    // console.log('ctx', ctx)
    const expressions = await Promise.all(ctx.expression_list().map(c => this.visit(c)))
    const value = expressions.join('')
    this.eventBus.emit('output-request', value)
    return value
  }

}