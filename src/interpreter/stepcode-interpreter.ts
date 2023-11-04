import StepCodeVisitor from '../parser/StepCodeVisitor.ts';
import {
  AdditiveoperatorContext,
  AssignmentStatementContext, Bool_Context, FactorContext,
  IdentifierContext,
  ProgramContext,
  ReadStatementContext, SignedFactorContext, SimpleExpressionContext,
  StringContext, TermContext,
  Type_Context, UnsignedIntegerContext, UnsignedRealContext,
  VariableContext,
  VariableDeclarationContext,
  WriteStatementContext
} from '../parser/StepCodeParser.ts';
import { EventBus } from './event-bus.ts';
import { StepCodeRuleNode } from './stepcode-rule-node.ts';
import { ExpressionReturnType, ReturnTypes } from './visitor-return-types';
import { getInterpreterType, parseValue } from './utils.ts';
import { ValidDataType } from './interpreter-types';
import { and, div, integerDivision, mod, mul, sub, sum } from './operations.ts';
import { ParseTree } from 'antlr4';

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

  visitUnsignedInteger = async (ctx: UnsignedIntegerContext) => {
    return {
      identifier: ctx.getText(),
      value: parseValue('integer', ctx.getText()),
      type: 'integer'
    } as const;
  }

  visitUnsignedReal = async (ctx: UnsignedRealContext) => {
    return {
      identifier: ctx.getText(),
      value: parseValue('real', ctx.getText()),
      type: 'real'
    } as const;
  }

  visitSignedFactor = async (ctx: SignedFactorContext) => {
    const factor = await this.visit(ctx.factor())
    if (ctx.MINUS()) {
      return {
        identifier: `-${factor.identifier}`,
        type: factor.type,
        value: -factor.value
      }
    }
    return factor
  }

  visitFactor = async (ctx: FactorContext) => {
    if (ctx.NOT()) {
      const right = await this.visit(ctx.factor())
      right.value = !right.value
      return right
    }
    return this.visitChildren(ctx)
  }

  visitTerm = async (ctx: TermContext) => {
    const left = await this.visit(ctx.signedFactor())
    if (ctx.multiplicativeoperator()) {

      const operator = ctx.multiplicativeoperator().getText()
      const right = await this.visit(ctx.term())
      let value
      if (ctx.multiplicativeoperator().STAR()) {
        value = mul(left.value, right.value)
      } else if (ctx.multiplicativeoperator().SLASH()) {
        value = div(left.value, right.value)
      } else if (ctx.multiplicativeoperator().MOD()) {
        value = mod(left.value, right.value)
      } else if (ctx.multiplicativeoperator().DIV()) {
        value = integerDivision(left.value, right.value)
      } else if (ctx.multiplicativeoperator().AND()) {
        value = and(left.value, right.value)
      }
      return {
        identifier: `${left.identifier} ${operator} ${right.identifier}`,
        type: left.type,
        value: value
      }
    }
    return left
  }

  visitBool_ = async (ctx: Bool_Context) => {
    return {
      identifier: ctx.getText(),
      value: !!ctx.TRUE(),
      type: 'boolean'
    } as const;
  }

  visitSimpleExpression = async (ctx: SimpleExpressionContext) => {
    const left = await this.visit(ctx.term())
    if (ctx.additiveoperator()) {
      const right = await this.visit(ctx.simpleExpression())
      let result
      if (ctx.additiveoperator().PLUS()) {
        result = sum(left.value, right.value)
      } else if (ctx.additiveoperator().MINUS()) {
        result = sub(left.value, right.value)
      } else if (ctx.additiveoperator().OR()) {
        result = left.value || right.value
      }

      return {
        identifier: `${left.identifier} ${ctx.additiveoperator().getText()} ${right.identifier}`,
        type: left.type,
        value: result
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