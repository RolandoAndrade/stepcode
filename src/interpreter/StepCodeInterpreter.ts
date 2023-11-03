import StepCodeVisitor from '../parser/StepCodeVisitor.ts';
import {
  AdditiveoperatorContext,
  AssignmentStatementContext,
  IdentifierContext,
  ProgramContext,
  ReadStatementContext, SimpleExpressionContext,
  StringContext, TermContext,
  Type_Context,
  VariableContext,
  VariableDeclarationContext,
  WriteStatementContext
} from '../parser/StepCodeParser.ts';
import { EventBus } from '../event-bus.ts';
import { StepCodeRuleNode } from './StepCodeRuleNode.ts';
import { ExpressionReturnType, ReturnTypes } from './visitor-return-types';
import { getInterpreterType, parseValue } from './utils.ts';
import { ValidDataType } from './interpreter-types';

export class StepCodeInterpreter extends StepCodeVisitor<Promise<ReturnTypes>> {
  protected programState: Map<string, {
    type: ValidDataType,
    value: any
  }> = new Map();


  constructor(protected eventBus: EventBus) {
    super();
  }

  async visitChildren(node: StepCodeRuleNode) {
    const returnValues = []
    for (const child of node?.children || []) {
      returnValues.push(await this.visit(child) as ReturnTypes)
    }
    return returnValues[0]
  }

  async start(ctx: ProgramContext) {
    await this.visitChildren(ctx)
  }

  visitVariable = async (ctx: VariableContext) => {
    const variable = this.programState.get(ctx.getText())
    return {
      identifier: ctx.getText(),
      value: variable?.value,
      type: variable?.type
    }
  }

  visitString = async (ctx: StringContext) => {
    return {
      identifier: ctx.getText(),
      value: ctx.getText().slice(1, -1),
      type: 'string'
    } as const;
  }

  visitIdentifier = async (ctx: IdentifierContext) => {
    return {
      identifier: ctx.getText(),
    }
  }

  visitType_ = async (ctx: Type_Context) => {
    return {
      identifier: ctx.getText(),
    }
  }

  visitVariableDeclaration = async (ctx: VariableDeclarationContext) => {
    const identifiers = await Promise.all(ctx.identifierList().identifier_list().map(async c => c.getText()))
    const type = ctx.type_().getText()
    const correctType = getInterpreterType(type)
    for (const identifier of identifiers) {
      this.programState.set(identifier, {
        type: correctType,
        value: correctType === 'string' ? '' : 0
      })
    }
    return {
      identifier: identifiers.join(',') + ':' + correctType,
    }
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
      const definition = this.programState.get(variable)
      if (!definition) throw new Error(`Variable ${variable} not defined`)
      this.programState.set(variable, {
        type: definition.type,
        value: parseValue(definition.type, value)
      })
      readAssignations.push(`${variable} = ${value}`)
    }

    return {
      identifier: readAssignations.join(','),
    }
  }

  visitWriteStatement = async (ctx: WriteStatementContext) => {
    // console.log('ctx', ctx)
    const expressions = await Promise.all(ctx.expression_list().map(c => this.visit(c))) as ExpressionReturnType[]
    const value = expressions.map(e => e.value).join('')
    this.eventBus.emit('output-request', value)
    return {
      identifier: value,
    }
  }

  visitTerm = async (ctx: TermContext) => {
    const left = await this.visit(ctx.signedFactor())
    if (ctx.multiplicativeoperator()) {
      const operator = await this.visit(ctx.multiplicativeoperator())
      const right = await this.visit(ctx.term())
      return {
        identifier: `${left.identifier} ${operator.identifier} ${right.identifier}`,
        type: left.type,
        // TODO: fix this
        value: left.value * right.value
      }
    }
    return left
  }

  visitSimpleExpression = async (ctx: SimpleExpressionContext) => {
    const left = await this.visit(ctx.term())
    if (ctx.additiveoperator()) {
      const operator = await this.visit(ctx.additiveoperator())
      const right = await this.visit(ctx.simpleExpression())
      return {
        identifier: `${left.identifier} ${operator.identifier} ${right.identifier}`,
        type: left.type,
        // TODO: fix this
        value: left.value + right.value
      }
    }
    return left
  }

  visitAssignmentStatement = async (ctx: AssignmentStatementContext) => {
    const variable = ctx.variable().getText();
    const expression = await this.visit(ctx.expression()) as ExpressionReturnType
    this.programState.set(variable, {
      type: expression.type,
      value: expression.value
    })
    return {
      identifier: `${variable} = ${expression.value}`,
    }
  }

  visitAdditiveoperator = async (ctx: AdditiveoperatorContext) => {
    return {
      identifier: ctx.getText(),
    }
  }

}