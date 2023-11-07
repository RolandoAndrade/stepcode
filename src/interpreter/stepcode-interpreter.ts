import StepCodeVisitor from '../parser/StepCodeVisitor.ts';
import {
  AdditiveoperatorContext,
  AssignmentStatementContext, BaseTermContext,
  Bool_Context, CaseListElementContext,
  CaseStatementContext,
  ElifStatementContext,
  ExpressionContext,
  FactorContext, ForStatementContext,
  IdentifierContext,
  IfStatementContext,
  ProgramContext,
  ReadStatementContext, RepetetiveStatementContext,
  SignedFactorContext,
  SimpleExpressionContext,
  StringContext,
  TermContext,
  Type_Context,
  UnsignedIntegerContext,
  UnsignedRealContext,
  VariableContext,
  VariableDeclarationContext, WhileStatementContext,
  WriteStatementContext
} from '../parser/StepCodeParser.ts';
import { EventBus } from './event-bus.ts';
import { StepCodeRuleNode } from './stepcode-rule-node.ts';
import { ExpressionReturnType, ReturnTypes, VariableReturnType } from './visitor-return-types';
import { getInterpreterType, parseValue } from './utils.ts';
import { ValidDataType } from './interpreter-types';
import { and, div, eq, gt, gte, integerDivision, lt, lte, mod, mul, neq, power, sub, sum } from './operations.ts';

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
      const rt = await this.visit(child) as ReturnTypes;
      if ((['break', 'continue'].includes(rt?.identifier || '') && this.loopStack.length) || rt?.identifier === 'return') {
        return rt
      }
      returnValues.push(rt)
    }
    return returnValues.find(e => !!e) as ReturnTypes
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

  visitBaseTerm = async (ctx: BaseTermContext) => {
    const left = await this.visit(ctx.signedFactor())
    if (!ctx.exponentiationOperator()) {
      return left
    }
    const right = await this.visit(ctx.baseTerm())
    const value = power(left.value, right.value)
    return {
      identifier: `${left.identifier} ^ ${right.identifier}`,
      type: left.type,
      value: value
    }
  }

  visitTerm = async (ctx: TermContext) => {
    const left = await this.visit(ctx.baseTerm())
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

  visitExpression = async (ctx: ExpressionContext) => {
    const left = await this.visit(ctx.simpleExpression())
    if (!ctx.relationaloperator()) {
      return left
    }
    const right = await this.visit(ctx.expression())
    let result
    if (ctx.relationaloperator().EQUAL()) {
      result = eq(left.value, right.value)
    } else if (ctx.relationaloperator().NOT_EQUAL()) {
      result = neq(left.value, right.value)
    } else if (ctx.relationaloperator().LT()) {
      result = lt(left.value, right.value)
    } else if (ctx.relationaloperator().LE()) {
      result = lte(left.value, right.value)
    } else if (ctx.relationaloperator().GT()) {
      result = gt(left.value, right.value)
    } else if (ctx.relationaloperator().GE()) {
      result = gte(left.value, right.value)
    }
    return {
      identifier: `${left.identifier} ${ctx.relationaloperator().getText()} ${right.identifier}`,
      type: 'boolean',
      value: result
    } as const
  }

  visitElifStatement = async (ctx: ElifStatementContext) => {
    const expression = await this.visit(ctx.expression()) as ExpressionReturnType
    if (expression.value) {
      return await this.visit(ctx.compoundStatement())
    } else {
      if (ctx.elifStatement()) {
        return await this.visit(ctx.elifStatement())
      }
      if (ctx.elseStatement()) {
        return await this.visit(ctx.elseStatement())
      }
    }
    return {
      identifier: `${expression.identifier}`,
    }
  }

  visitIfStatement = async (ctx: IfStatementContext) => {
    const expression = await this.visit(ctx.expression()) as ExpressionReturnType
    if (expression.value) {
      return await this.visit(ctx.compoundStatement())
    } else {
      if (ctx.elifStatement()) {
        return await this.visit(ctx.elifStatement())
      }
      if (ctx.elseStatement()) {
        return await this.visit(ctx.elseStatement())
      }
    }
    return {
      identifier: `${expression.identifier}`,
    }
  }

  visitCaseStatement = async (ctx: CaseStatementContext) => {
    const expression = await this.visit(ctx.expression()) as ExpressionReturnType;
    for (const caseListElement of ctx.caseListElement_list()) {
      for (const caseConstant of caseListElement.constList().constant_list()) {
        const values = await this.visit(caseConstant) as VariableReturnType;
        if (values.value === expression.value) {
          return await this.visit(caseListElement.compoundStatement())
        }
      }
    }
    if (ctx.caseOtherWise()) {
      return await this.visit(ctx.caseOtherWise())
    }
    return {
      identifier: `${expression.identifier}`,
    }
  }

  visitBreakStatement = async () => {
    return {
      identifier: 'break',
    }
  }

  visitContinueStatement = async () => {
    return {
      identifier: 'continue',
    }
  }

  protected loopStack: RepetetiveStatementContext[] = []

  visitWhileStatement = async (ctx: WhileStatementContext) => {
    let expression = await this.visit(ctx.expression()) as ExpressionReturnType;
    while (expression.value) {
      this.loopStack.push(ctx.parentCtx as RepetetiveStatementContext)
      const result = await this.visit(ctx.compoundStatement())
      this.loopStack.pop()
      if (result.identifier === 'break') {
        break;
      }
      if (result.identifier === 'return') {
        return result
      }
      expression = await this.visit(ctx.expression()) as ExpressionReturnType;
    }
    return {
      identifier: `${expression.identifier}`,
    }
  }

  visitForStatement = async (ctx: ForStatementContext) => {
    const identifier = await this.visit(ctx.identifier()) as VariableReturnType;
    const initial = await this.visit(ctx.forList().initialValue());
    const final = await this.visit(ctx.forList().finalValue());
    let step = 1
    if (ctx.stepValue()) {
      const s = await this.visit(ctx.stepValue()) as VariableReturnType;
      step = s.value
    }
    const insideLoop = async (i: number) => {
      this.programState.set(identifier.identifier, {
        type: identifier.type,
        value: i
      })
      this.loopStack.push(ctx.parentCtx as RepetetiveStatementContext)
      const result = await this.visit(ctx.compoundStatement())
      this.loopStack.pop()
      if (['break', 'return'].includes(result.identifier)) {
        return result
      }
    }

    if (step > 0) {
      for (let i = initial.value; i <= final.value; i += step) {
        const result = await insideLoop(i)
        if (result) {
          if (result.identifier === 'return') {
            return result
          }
          if (result.identifier === 'break') {
            break
          }
        }
      }
    } else {
      for (let i = initial.value; i >= final.value; i += step) {
        const result = await insideLoop(i)
        if (result) {
          if (result.identifier === 'return') {
            return result
          }
          if (result.identifier === 'break') {
            break
          }
        }
      }
    }
    return {
      identifier: `${identifier.identifier}`,
    }

  }
}