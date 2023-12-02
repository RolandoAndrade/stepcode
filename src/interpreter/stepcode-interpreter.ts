import StepCodeVisitor from '../parser/StepCodeVisitor.ts';
import {
  AccessorContext, ActualParameterContext,
  AdditiveoperatorContext, AssignationFunctionDeclarationContext,
  AssignmentStatementContext, BaseTermContext,
  Bool_Context, BooleanMultiplicativeExpressionContext, BooleanRelationalExpressionContext,
  CaseStatementContext, DimensionStatementContext, DimensionTypeContext, DirectivesContext,
  ElifStatementContext,
  ExpressionContext,
  FactorContext, ForStatementContext,
  IdentifierContext,
  IfStatementContext, IndexContext, ProcedureStatementContext,
  ProgramContext,
  ReadStatementContext, RepeatStatementContext, RepetetiveStatementContext, ReturnStatementContext,
  SignedFactorContext,
  SimpleExpressionContext,
  StringContext, SubprogramContext,
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
import { createNDArray, getInterpreterType, isCompatibleType, isStructuredType, parseValue } from './utils.ts';
import { ValidDataType } from './interpreter-types';
import { and, div, eq, gt, gte, integerDivision, lt, lte, mod, mul, neq, or, power, sub, sum } from './operations.ts';
import { getFunctionFromIdentifier } from './internal-functions.ts';
import { StepCodeError } from './errors';

export class StepCodeInterpreter extends StepCodeVisitor<Promise<ReturnTypes>> {
  protected programState: Map<string, {
    type: ValidDataType,
    value: any
  }> = new Map();

  protected availableSubprograms: Map<string, SubprogramContext> = new Map();

  public static ARRAY_START = 1

  protected callStack: {
    identifier: string,
    variables: Map<string, {
      type: ValidDataType,
      value: any
    }>,
  }[] = []


  protected get variables() {
    if (!this.callStack.length) {
      return this.programState
    }
    return this.callStack[this.callStack.length - 1].variables
  }


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
    ctx.subprogram_list().forEach(c => {
      let identifier: string
      if (c.procedureOrFunctionDeclaration().procedureDeclaration()) {
        identifier = c.procedureOrFunctionDeclaration().procedureDeclaration().identifier().getText()
      } else if (c.procedureOrFunctionDeclaration().functionDeclaration()){
        identifier = c.procedureOrFunctionDeclaration().functionDeclaration().identifier().getText()
      } else {
        identifier = c.procedureOrFunctionDeclaration().assignationFunctionDeclaration().identifier(1).getText()
      }
      this.availableSubprograms.set(identifier, c)
    })
    StepCodeInterpreter.ARRAY_START = 1
    for (const directive of ctx.directives_list()) {
      await this.visit(directive)
    }
    await this.visitChildren(ctx.main())
  }

  visitDirectives =  async (ctx: DirectivesContext) => {
    const identifier = ctx.IDENT().getText()
    if (identifier === 'arrays@stepcode') {
      StepCodeInterpreter.ARRAY_START = 0
    }
    return {
      identifier: `${identifier}`,
    }
  }

  async *getIndexes(ctx: AccessorContext) {
    for (const expression of ctx.index().expression_list()) {
      yield this.visit(expression)
    }
  }

  visitVariable = async (ctx: VariableContext) => {
    const identifier = ctx.identifier().getText()
    const definition = this.variables.get(identifier)
    if (!definition) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Variable ${identifier} not defined`
      })
    }
    let value = definition.value
    let type = definition.type
    for (const accessor of ctx.accessor_list()) {
      if (isStructuredType(type)) {
        for await (const a of this.getIndexes(accessor)) {
          let index = a.value
          if (index > 0) {
            index = index - StepCodeInterpreter.ARRAY_START
          }
          value = value.at(index)
          if (type !== 'string') type = type.slice(0, -2)
        }
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
      this.variables.set(identifier, {
        type: correctType,
        value: correctType === 'string' ? '' : 0
      })
    }
    return {
      identifier: identifiers.join(',') + ':' + correctType,
    }
  }

  visitReadStatement = async (ctx: ReadStatementContext) => {
    for (const variable of ctx.variable_list()) {
      const identifier = variable.identifier().getText()
      const definition = this.variables.get(identifier)
      if (!definition) {
        throw new StepCodeError({
          startLine: ctx.start.line,
          startColumn: ctx.start.column,
          endLine: ctx.stop?.line || ctx.start.line,
          endColumn: ctx.stop?.column || ctx.start.column,
          message: `Variable ${identifier} not defined`
        })
      }
      const stringValue = await new Promise<string>(resolve => {
        this.eventBus.emit('input-request', (value: string) => {
          resolve(value)
        })
      })

      let value = definition.value
      let lastValue = value
      let entered = false
      let type = definition.type
      let index = 0
      for (let i = 0; i < variable.accessor_list().length; i++) {
        for await (const newIndex of this.getIndexes(variable.accessor(i))){
          if (!isStructuredType(type)) {
            throw new StepCodeError({
              startLine: ctx.start.line,
              startColumn: ctx.start.column,
              endLine: ctx.stop?.line || ctx.start.line,
              endColumn: ctx.stop?.column || ctx.start.column,
              message: `Variable ${variable} is not an array`
            })
          }
          index = newIndex.value
          if (index > 0) {
            index = index - StepCodeInterpreter.ARRAY_START
          }
          lastValue = value
          value = value.at(index)
          type = type.slice(0, -2)
          entered = true
        }
      }
      const valueToAssign = parseValue(type, stringValue)
      if (entered) {
        lastValue[index] = valueToAssign
      } else {
        definition.value = valueToAssign
      }
    }

    return {
      identifier: `read`,
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
    const variable = ctx.variable().identifier().getText()
    const definition = this.variables.get(variable)
    if (!definition) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Variable ${variable} not defined`
      })
    }
    let value = definition.value
    let lastValue = value
    let entered = false
    let type = definition.type
    let index = 0
    for (let i = 0; i < ctx.variable().accessor_list().length; i++) {
      for await (const newIndex of this.getIndexes(ctx.variable().accessor(i))){
        if (!isStructuredType(type)) {
          throw new StepCodeError({
            startLine: ctx.start.line,
            startColumn: ctx.start.column,
            endLine: ctx.stop?.line || ctx.start.line,
            endColumn: ctx.stop?.column || ctx.start.column,
            message: `Variable ${variable} is not an array`
          })
        }
        index = newIndex.value
        if (index > 0) {
          index = index - StepCodeInterpreter.ARRAY_START
        }
        lastValue = value
        value = value.at(index)
        type = type.slice(0, -2)
        entered = true
      }
    }
    const expression = await this.visit(ctx.expression()) as ExpressionReturnType
    if (entered) {
      lastValue[index] = expression.value
    } else {
      definition.value = expression.value
    }
    return {
      identifier: `${ctx.variable().getText()} = ${expression.value}`,
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
      this.variables.set(identifier.identifier, {
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

  getArgs(ctx: SubprogramContext) {
    let parameterList
    if (ctx.procedureOrFunctionDeclaration().procedureDeclaration()) {
      parameterList = ctx.procedureOrFunctionDeclaration().procedureDeclaration().formalParameterList()?.formalParameterSection()?.paramIdentifier_list() || []
    } else if(ctx.procedureOrFunctionDeclaration().functionDeclaration()) {
      parameterList = ctx.procedureOrFunctionDeclaration().functionDeclaration().formalParameterList()?.formalParameterSection()?.paramIdentifier_list() || []
    } else {
      parameterList = ctx.procedureOrFunctionDeclaration().assignationFunctionDeclaration().formalParameterList()?.formalParameterSection()?.paramIdentifier_list() || []
    }
    return parameterList.map(c => ({
      identifier: c.identifier().getText(),
      type: `inherit`,
      reference: !!c.BYREFERENCE()
    }))
  }

  async getValueOfParameter(ctx: ActualParameterContext, byReference: boolean) {
    if (byReference) {
      try {
        const variable = ctx.expression().booleanMultiplicativeExpression().booleanRelationalExpression().simpleExpression().term().baseTerm().signedFactor().factor().variable()
        const identifier = variable.identifier().getText()
        const definition = this.variables.get(identifier)
        if (!definition) {
          throw new StepCodeError({
            startLine: ctx.start.line,
            startColumn: ctx.start.column,
            endLine: ctx.stop?.line || ctx.start.line,
            endColumn: ctx.stop?.column || ctx.start.column,
            message: `Variable ${identifier} not defined`
          })
        }
        if (!isStructuredType(definition.type)) {
          return definition
        }
        let indexes: number[] = [];
        const expression = await this.visit(ctx.expression()) as ExpressionReturnType;
        for (let i = 0; i < variable.accessor_list().length; i++) {
          for await (const newIndex of this.getIndexes(variable.accessor(i))) {
            indexes.push(newIndex.value - StepCodeInterpreter.ARRAY_START)
          }
        }
        return {
          type: expression.type,
          get value() {
            return expression.value
          },
          set value(v: any) {
            let val = definition.value;
            for (let i = 0; i < indexes.length - 1; i++) {
              val = val.at(indexes[i])
            }
            val[indexes[indexes.length - 1]] = v
          }
        }
      } catch (e) {
        if (e instanceof StepCodeError) throw e
        throw new StepCodeError({
          startLine: ctx.start.line,
          startColumn: ctx.start.column,
          endLine: ctx.stop?.line || ctx.start.line,
          endColumn: ctx.stop?.column || ctx.start.column,
          message: `Invalid parameter. Only variables can be passed by reference`
        })
      }
    }
    const expression = await this.visit(ctx.expression()) as ExpressionReturnType
    return expression
  }

  visitProcedureStatement = async (ctx: ProcedureStatementContext) => {
    const identifier = ctx.identifier().getText()
    const internalFunction = getFunctionFromIdentifier(identifier)
    if (internalFunction) {
      let args: ExpressionReturnType[] = [];
      if (ctx.parameterList()) {
        args = await Promise.all(ctx.parameterList().actualParameter_list().map(async c => this.visit(c))) as ExpressionReturnType[]
      }
      const result = internalFunction(...args.map(e => e.value))
      return {
        identifier: `${identifier}(${args.map(e => e.identifier).join(',')})`,
        value: result.value,
        type: result.type
      } as ReturnTypes
    }
    const subprogram = this.availableSubprograms.get(identifier)
    if (!subprogram) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Subprogram ${identifier} not defined`
      })
    }
    const variables: typeof this.variables= new Map()
    const parameterList = this.getArgs(subprogram)

    const params = ctx.parameterList()?.actualParameter_list() || [];
    if (parameterList.length !== params.length) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Invalid number of parameters for ${identifier}. Expected ${parameterList.length}, got ${params.length}`
      })
    }
    for (const [i, c] of params.entries()) {
      const byReference = parameterList[i].reference
      const param = await this.getValueOfParameter(c, byReference)
      const type = parameterList[i].type === 'inherit' ? param.type : parameterList[i].type
      if (!isCompatibleType(type, param.type)) {
        throw new StepCodeError({
          startLine: ctx.start.line,
          startColumn: ctx.start.column,
          endLine: ctx.stop?.line || ctx.start.line,
          endColumn: ctx.stop?.column || ctx.start.column,
          message: `Invalid type for parameter ${parameterList[i].identifier}. Expected ${parameterList[i].type}, got ${param.type}`
        })
      }
      if (byReference) {
        variables.set(parameterList[i].identifier, param)
      } else {
        variables.set(parameterList[i].identifier, {
          type: type,
          value: param.value
        })
      }
    }
    this.callStack.push({
      identifier: identifier,
      variables: variables
    })
    if (this.callStack.length > 100) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Stack overflow`
      })
    }
    const result = await this.visit(subprogram)
    this.callStack.pop()
    if (subprogram.procedureOrFunctionDeclaration().procedureDeclaration()) {
      return {
        identifier: `call ${identifier}`,
      }
    }
    return result
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
    const definition = this.variables.get(identifier)
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
    this.variables.set(identifier, {
      type: array.type,
      value: array.array
    })
    return {
      identifier: `${identifier}(${dimension.identifier})`,
    }
  }

  visitSubprogram = async (ctx: SubprogramContext) => {
    return this.visitChildren(ctx)
  }

  visitReturnStatement = async (ctx: ReturnStatementContext) => {
    if(ctx.expression()){
      const expression = await this.visit(ctx.expression()) as ExpressionReturnType
      return {
        identifier: `return`,
        value: expression.value,
        type: expression.type
      }
    }
    return {
      identifier: `return`,
    }
  }

  visitAssignationFunctionDeclaration = async (ctx: AssignationFunctionDeclarationContext) => {
    const returnVariable = ctx.identifier(0).getText()
    await this.visitChildren(ctx)
    const returnVariableDefinition = this.variables.get(returnVariable)
    if (!returnVariableDefinition) {
      throw new StepCodeError({
        startLine: ctx.start.line,
        startColumn: ctx.start.column,
        endLine: ctx.stop?.line || ctx.start.line,
        endColumn: ctx.stop?.column || ctx.start.column,
        message: `Variable ${returnVariable} not defined`
      })
    }
    return {
      identifier: returnVariable,
      value: returnVariableDefinition.value,
      type: returnVariableDefinition.type
    }
  }
}