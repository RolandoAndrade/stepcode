import StepCodeVisitor from '../parser/StepCodeVisitor.ts';
import {
  AdditiveoperatorContext,
  AssignmentStatementContext, BaseTermContext,
  Bool_Context, BooleanMultiplicativeExpressionContext, BooleanRelationalExpressionContext,
  CaseStatementContext, DimensionStatementContext, DimensionTypeContext,
  ElifStatementContext,
  ExpressionContext,
  FactorContext, ForStatementContext,
  IdentifierContext,
  IfStatementContext, IndexContext, ProcedureStatementContext,
  ProgramContext,
  ReadStatementContext, RepeatStatementContext, RepetetiveStatementContext,
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
import { DimensionReturnType, ExpressionReturnType, ReturnTypes, VariableReturnType } from './visitor-return-types';
import { createNDArray, getInterpreterType, isStructuredType, parseValue } from './utils.ts';
import { ValidDataType } from './interpreter-types';
import { and, div, eq, gt, gte, integerDivision, lt, lte, mod, mul, neq, or, power, sub, sum } from './operations.ts';
import { getFunctionFromIdentifier } from './internal-functions.ts';
import { StepCodeError } from './errors';

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

  visitIndex = async (ctx: IndexContext) => {
    const result = await this.visit(ctx.expression()) as ExpressionReturnType
    return {
      identifier: result.identifier,
      type: result.type,
      value: result.value
    }
  }

  visitVariable = async (ctx: VariableContext) => {
    const variable = this.programState.get(ctx.identifier().getText())
    let value = variable?.value
    let type = variable?.type
    for (const accessor of ctx.accessor_list()) {
      if (variable && isStructuredType(variable.type)) {
        const a = await this.visit(accessor)
        let index = a.value
        if (index > 0) {
          index = index - 1
        }
        value = variable.value.at(index)
        // TODO: fix type
      }
    }
    return {
      identifier: ctx.getText(),
      value: value,
      type: type
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
      } as ReturnTypes
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
    if (ctx.signedFactor()) return this.visit(ctx.signedFactor())
    const left = await this.visit(ctx.baseTerm(0))
    const right = await this.visit(ctx.baseTerm(1))
    const value = power(left.value, right.value)
    return {
      identifier: `${left.identifier} ^ ${right.identifier}`,
      type: left.type,
      value: value
    } as ReturnTypes
  }

  visitTerm = async (ctx: TermContext) => {
    if (ctx.baseTerm()) return this.visit(ctx.baseTerm())
    const left = await this.visit(ctx.term(0))
    const operator = ctx.multiplicativeoperator().getText()
    const right = await this.visit(ctx.term(1))
    let value
    if (ctx.multiplicativeoperator().STAR()) {
      value = mul(left.value, right.value)
    } else if (ctx.multiplicativeoperator().SLASH()) {
      value = div(left.value, right.value)
    } else if (ctx.multiplicativeoperator().MOD()) {
      value = mod(left.value, right.value)
    } else if (ctx.multiplicativeoperator().DIV()) {
      value = integerDivision(left.value, right.value)
    }
    return {
      identifier: `${left.identifier} ${operator} ${right.identifier}`,
      type: left.type,
      value: value
    } as ReturnTypes
  }

  visitBool_ = async (ctx: Bool_Context) => {
    return {
      identifier: ctx.getText(),
      value: !!ctx.TRUE(),
      type: 'boolean'
    } as const;
  }

  visitSimpleExpression = async (ctx: SimpleExpressionContext) => {
    if (ctx.term()) {
      return this.visit(ctx.term())
    }
    const left = await this.visit(ctx.simpleExpression(0))
    const right = await this.visit(ctx.simpleExpression(1))
    let result
    if (ctx.additiveoperator().PLUS()) {
      result = sum(left.value, right.value)
    } else if (ctx.additiveoperator().MINUS()) {
      result = sub(left.value, right.value)
    }
    return {
      identifier: `${left.identifier} ${ctx.additiveoperator().getText()} ${right.identifier}`,
      type: left.type,
      value: result
    } as ReturnTypes
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

  visitBooleanRelationalExpression = async (ctx: BooleanRelationalExpressionContext) => {
    if (ctx.simpleExpression()) return this.visit(ctx.simpleExpression())
    const left = await this.visit(ctx.booleanRelationalExpression(0))
    const right = await this.visit(ctx.booleanRelationalExpression(1))
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
    } as const;
  }

  visitBooleanMultiplicativeExpression = async (ctx: BooleanMultiplicativeExpressionContext) => {
    if (ctx.booleanRelationalExpression()) return this.visit(ctx.booleanRelationalExpression())
    const left = await this.visit(ctx.booleanMultiplicativeExpression(0))
    const right = await this.visit(ctx.booleanMultiplicativeExpression(1))
    const result = and(left.value, right.value)
    return {
      identifier: `${left.identifier} AND ${right.identifier}`,
      type: 'boolean',
      value: result
    } as const;
  }

  visitExpression = async (ctx: ExpressionContext) => {
    if (ctx.booleanMultiplicativeExpression()) return this.visit(ctx.booleanMultiplicativeExpression())
    const left = await this.visit(ctx.expression(0))
    const right = await this.visit(ctx.expression(1))
    const result = or(left.value, right.value)
    return {
      identifier: `${left.identifier} OR ${right.identifier}`,
      type: 'boolean',
      value: result
    } as const;
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

  visitRepeatStatement = async (ctx: RepeatStatementContext) => {
    let repeat = false
    do {
      this.loopStack.push(ctx.parentCtx as RepetetiveStatementContext)
      const result = await this.visit(ctx.compoundStatement())
      this.loopStack.pop()
      if (result.identifier === 'return') {
        return result
      }
      if (result.identifier === 'break') {
        break
      }
      const expression = await this.visit(ctx.expression()) as ExpressionReturnType;
      if (ctx.UNTIL()) {
        repeat = !expression.value
      } else {
        repeat = expression.value
      }
    } while (repeat)
    return {
      identifier: `repeat`,
    }
  }

  visitProcedureStatement = async (ctx: ProcedureStatementContext) => {
    const identifier = ctx.identifier().getText()
    const internalFunction = getFunctionFromIdentifier(identifier)
    if (internalFunction) {
      const args = await Promise.all(ctx.parameterList().actualParameter_list().map(async c => this.visit(c))) as ExpressionReturnType[]
      const result = internalFunction(...args.map(e => e.value))
      return {
        identifier: `${identifier}(${args.map(e => e.identifier).join(',')})`,
        value: result
      }
    }
    return {
      identifier: `${identifier}`,
    }
  }

  visitFunctionDesignator = async (ctx: ProcedureStatementContext) => {
    return this.visitProcedureStatement(ctx)
  }

  visitDimensionType = async (ctx: DimensionTypeContext) => {
    const list =await Promise.all(ctx.unsignedNumber_list().map(async c => this.visit(c))) as VariableReturnType[]
    return {
      identifier: 'dimension',
      type: 'dimension',
      value: list.map(e => e.value)
    } as ReturnTypes
  }

  visitDimensionStatement = async (ctx: DimensionStatementContext) => {
    const identifier = ctx.identifier().getText()
    const definition = this.programState.get(identifier)
    if (!definition) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Variable ${identifier} not defined`
      })
    }
    const dimension = await this.visit(ctx.dimensionType()) as DimensionReturnType
    const array = createNDArray(dimension.value, definition.type)
    this.programState.set(identifier, {
      type: array.type,
      value: array.array
    })
    return {
      identifier: `${identifier}(${dimension.identifier})`,
    }
  }
}