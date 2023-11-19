// Generated from src/StepCode.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { ProgramContext } from "./StepCodeParser.ts";
import { MainContext } from "./StepCodeParser.ts";
import { SubprogramContext } from "./StepCodeParser.ts";
import { ProgramHeadingContext } from "./StepCodeParser.ts";
import { IdentifierContext } from "./StepCodeParser.ts";
import { BlockContext } from "./StepCodeParser.ts";
import { UsesUnitsPartContext } from "./StepCodeParser.ts";
import { LabelDeclarationPartContext } from "./StepCodeParser.ts";
import { LabelContext } from "./StepCodeParser.ts";
import { ConstantDefinitionPartContext } from "./StepCodeParser.ts";
import { ConstantDefinitionContext } from "./StepCodeParser.ts";
import { ConstantChrContext } from "./StepCodeParser.ts";
import { ConstantContext } from "./StepCodeParser.ts";
import { UnsignedNumberContext } from "./StepCodeParser.ts";
import { UnsignedIntegerContext } from "./StepCodeParser.ts";
import { UnsignedRealContext } from "./StepCodeParser.ts";
import { SignContext } from "./StepCodeParser.ts";
import { Bool_Context } from "./StepCodeParser.ts";
import { StringContext } from "./StepCodeParser.ts";
import { TypeDefinitionPartContext } from "./StepCodeParser.ts";
import { TypeDefinitionContext } from "./StepCodeParser.ts";
import { FunctionTypeContext } from "./StepCodeParser.ts";
import { ProcedureTypeContext } from "./StepCodeParser.ts";
import { Type_Context } from "./StepCodeParser.ts";
import { SimpleTypeContext } from "./StepCodeParser.ts";
import { ScalarTypeContext } from "./StepCodeParser.ts";
import { SubrangeTypeContext } from "./StepCodeParser.ts";
import { TypeIdentifierContext } from "./StepCodeParser.ts";
import { StructuredTypeContext } from "./StepCodeParser.ts";
import { UnpackedStructuredTypeContext } from "./StepCodeParser.ts";
import { StringtypeContext } from "./StepCodeParser.ts";
import { ArrayTypeContext } from "./StepCodeParser.ts";
import { DimensionStatementContext } from "./StepCodeParser.ts";
import { DimensionTypeContext } from "./StepCodeParser.ts";
import { TypeListContext } from "./StepCodeParser.ts";
import { IndexTypeContext } from "./StepCodeParser.ts";
import { ComponentTypeContext } from "./StepCodeParser.ts";
import { RecordTypeContext } from "./StepCodeParser.ts";
import { FieldListContext } from "./StepCodeParser.ts";
import { FixedPartContext } from "./StepCodeParser.ts";
import { RecordSectionContext } from "./StepCodeParser.ts";
import { VariantPartContext } from "./StepCodeParser.ts";
import { TagContext } from "./StepCodeParser.ts";
import { VariantContext } from "./StepCodeParser.ts";
import { SetTypeContext } from "./StepCodeParser.ts";
import { BaseTypeContext } from "./StepCodeParser.ts";
import { FileTypeContext } from "./StepCodeParser.ts";
import { PointerTypeContext } from "./StepCodeParser.ts";
import { VariableDeclarationPartContext } from "./StepCodeParser.ts";
import { VariableDeclarationContext } from "./StepCodeParser.ts";
import { ProcedureAndFunctionDeclarationPartContext } from "./StepCodeParser.ts";
import { ProcedureOrFunctionDeclarationContext } from "./StepCodeParser.ts";
import { ProcedureDeclarationContext } from "./StepCodeParser.ts";
import { FormalParameterListContext } from "./StepCodeParser.ts";
import { FormalParameterSectionContext } from "./StepCodeParser.ts";
import { IdentifierListContext } from "./StepCodeParser.ts";
import { ParamIdentifierContext } from "./StepCodeParser.ts";
import { ConstListContext } from "./StepCodeParser.ts";
import { FunctionDeclarationContext } from "./StepCodeParser.ts";
import { AssignationFunctionDeclarationContext } from "./StepCodeParser.ts";
import { ResultTypeContext } from "./StepCodeParser.ts";
import { StatementContext } from "./StepCodeParser.ts";
import { BreakStatementContext } from "./StepCodeParser.ts";
import { ReturnStatementContext } from "./StepCodeParser.ts";
import { ContinueStatementContext } from "./StepCodeParser.ts";
import { UnlabelledStatementContext } from "./StepCodeParser.ts";
import { SimpleStatementContext } from "./StepCodeParser.ts";
import { AssignmentStatementContext } from "./StepCodeParser.ts";
import { VariableContext } from "./StepCodeParser.ts";
import { AccessorContext } from "./StepCodeParser.ts";
import { IndexContext } from "./StepCodeParser.ts";
import { ExpressionContext } from "./StepCodeParser.ts";
import { BooleanMultiplicativeExpressionContext } from "./StepCodeParser.ts";
import { BooleanRelationalExpressionContext } from "./StepCodeParser.ts";
import { RelationaloperatorContext } from "./StepCodeParser.ts";
import { SimpleExpressionContext } from "./StepCodeParser.ts";
import { AdditiveoperatorContext } from "./StepCodeParser.ts";
import { TermContext } from "./StepCodeParser.ts";
import { BaseTermContext } from "./StepCodeParser.ts";
import { MultiplicativeoperatorContext } from "./StepCodeParser.ts";
import { ExponentiationOperatorContext } from "./StepCodeParser.ts";
import { SignedFactorContext } from "./StepCodeParser.ts";
import { FactorContext } from "./StepCodeParser.ts";
import { UnsignedConstantContext } from "./StepCodeParser.ts";
import { FunctionDesignatorContext } from "./StepCodeParser.ts";
import { ParameterListContext } from "./StepCodeParser.ts";
import { Set_Context } from "./StepCodeParser.ts";
import { ElementListContext } from "./StepCodeParser.ts";
import { ElementContext } from "./StepCodeParser.ts";
import { ProcedureStatementContext } from "./StepCodeParser.ts";
import { ActualParameterContext } from "./StepCodeParser.ts";
import { ParameterwidthContext } from "./StepCodeParser.ts";
import { GotoStatementContext } from "./StepCodeParser.ts";
import { EmptyStatement_Context } from "./StepCodeParser.ts";
import { Empty_Context } from "./StepCodeParser.ts";
import { StructuredStatementContext } from "./StepCodeParser.ts";
import { CompoundStatementContext } from "./StepCodeParser.ts";
import { StatementsContext } from "./StepCodeParser.ts";
import { ConditionalStatementContext } from "./StepCodeParser.ts";
import { IfStatementContext } from "./StepCodeParser.ts";
import { ElifStatementContext } from "./StepCodeParser.ts";
import { ElseStatementContext } from "./StepCodeParser.ts";
import { CaseStatementContext } from "./StepCodeParser.ts";
import { CaseListElementContext } from "./StepCodeParser.ts";
import { CaseOtherWiseContext } from "./StepCodeParser.ts";
import { RepetetiveStatementContext } from "./StepCodeParser.ts";
import { WhileStatementContext } from "./StepCodeParser.ts";
import { RepeatStatementContext } from "./StepCodeParser.ts";
import { ForStatementContext } from "./StepCodeParser.ts";
import { ForListContext } from "./StepCodeParser.ts";
import { InitialValueContext } from "./StepCodeParser.ts";
import { FinalValueContext } from "./StepCodeParser.ts";
import { StepValueContext } from "./StepCodeParser.ts";
import { WithStatementContext } from "./StepCodeParser.ts";
import { RecordVariableListContext } from "./StepCodeParser.ts";
import { WriteStatementContext } from "./StepCodeParser.ts";
import { ReadStatementContext } from "./StepCodeParser.ts";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `StepCodeParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class StepCodeVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `StepCodeParser.program`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProgram?: (ctx: ProgramContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.main`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMain?: (ctx: MainContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.subprogram`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubprogram?: (ctx: SubprogramContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.programHeading`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProgramHeading?: (ctx: ProgramHeadingContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifier?: (ctx: IdentifierContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.block`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlock?: (ctx: BlockContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.usesUnitsPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUsesUnitsPart?: (ctx: UsesUnitsPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.labelDeclarationPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLabelDeclarationPart?: (ctx: LabelDeclarationPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.label`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLabel?: (ctx: LabelContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.constantDefinitionPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstantDefinitionPart?: (ctx: ConstantDefinitionPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.constantDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstantDefinition?: (ctx: ConstantDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.constantChr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstantChr?: (ctx: ConstantChrContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.constant`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstant?: (ctx: ConstantContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.unsignedNumber`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnsignedNumber?: (ctx: UnsignedNumberContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.unsignedInteger`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnsignedInteger?: (ctx: UnsignedIntegerContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.unsignedReal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnsignedReal?: (ctx: UnsignedRealContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.sign`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSign?: (ctx: SignContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.bool_`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBool_?: (ctx: Bool_Context) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitString?: (ctx: StringContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.typeDefinitionPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeDefinitionPart?: (ctx: TypeDefinitionPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.typeDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeDefinition?: (ctx: TypeDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.functionType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionType?: (ctx: FunctionTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.procedureType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProcedureType?: (ctx: ProcedureTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.type_`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitType_?: (ctx: Type_Context) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.simpleType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimpleType?: (ctx: SimpleTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.scalarType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScalarType?: (ctx: ScalarTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.subrangeType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubrangeType?: (ctx: SubrangeTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.typeIdentifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeIdentifier?: (ctx: TypeIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.structuredType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStructuredType?: (ctx: StructuredTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.unpackedStructuredType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnpackedStructuredType?: (ctx: UnpackedStructuredTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.stringtype`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringtype?: (ctx: StringtypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.arrayType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayType?: (ctx: ArrayTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.dimensionStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDimensionStatement?: (ctx: DimensionStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.dimensionType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDimensionType?: (ctx: DimensionTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.typeList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeList?: (ctx: TypeListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.indexType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIndexType?: (ctx: IndexTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.componentType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComponentType?: (ctx: ComponentTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.recordType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRecordType?: (ctx: RecordTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.fieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldList?: (ctx: FieldListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.fixedPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFixedPart?: (ctx: FixedPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.recordSection`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRecordSection?: (ctx: RecordSectionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.variantPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariantPart?: (ctx: VariantPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.tag`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTag?: (ctx: TagContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.variant`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariant?: (ctx: VariantContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.setType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetType?: (ctx: SetTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.baseType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBaseType?: (ctx: BaseTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.fileType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFileType?: (ctx: FileTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.pointerType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPointerType?: (ctx: PointerTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.variableDeclarationPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariableDeclarationPart?: (ctx: VariableDeclarationPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.variableDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariableDeclaration?: (ctx: VariableDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.procedureAndFunctionDeclarationPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProcedureAndFunctionDeclarationPart?: (ctx: ProcedureAndFunctionDeclarationPartContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.procedureOrFunctionDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProcedureOrFunctionDeclaration?: (ctx: ProcedureOrFunctionDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.procedureDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProcedureDeclaration?: (ctx: ProcedureDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.formalParameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormalParameterList?: (ctx: FormalParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.formalParameterSection`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormalParameterSection?: (ctx: FormalParameterSectionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.identifierList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierList?: (ctx: IdentifierListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.paramIdentifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParamIdentifier?: (ctx: ParamIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.constList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstList?: (ctx: ConstListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.functionDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionDeclaration?: (ctx: FunctionDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.assignationFunctionDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssignationFunctionDeclaration?: (ctx: AssignationFunctionDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.resultType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitResultType?: (ctx: ResultTypeContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement?: (ctx: StatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.breakStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBreakStatement?: (ctx: BreakStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.returnStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReturnStatement?: (ctx: ReturnStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.continueStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContinueStatement?: (ctx: ContinueStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.unlabelledStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnlabelledStatement?: (ctx: UnlabelledStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.simpleStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimpleStatement?: (ctx: SimpleStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.assignmentStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssignmentStatement?: (ctx: AssignmentStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.variable`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariable?: (ctx: VariableContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.accessor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAccessor?: (ctx: AccessorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.index`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIndex?: (ctx: IndexContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpression?: (ctx: ExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.booleanMultiplicativeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanMultiplicativeExpression?: (ctx: BooleanMultiplicativeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.booleanRelationalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanRelationalExpression?: (ctx: BooleanRelationalExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.relationaloperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRelationaloperator?: (ctx: RelationaloperatorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.simpleExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimpleExpression?: (ctx: SimpleExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.additiveoperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAdditiveoperator?: (ctx: AdditiveoperatorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.term`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTerm?: (ctx: TermContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.baseTerm`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBaseTerm?: (ctx: BaseTermContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.multiplicativeoperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMultiplicativeoperator?: (ctx: MultiplicativeoperatorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.exponentiationOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExponentiationOperator?: (ctx: ExponentiationOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.signedFactor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSignedFactor?: (ctx: SignedFactorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.factor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFactor?: (ctx: FactorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.unsignedConstant`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnsignedConstant?: (ctx: UnsignedConstantContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.functionDesignator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionDesignator?: (ctx: FunctionDesignatorContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.parameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterList?: (ctx: ParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.set_`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSet_?: (ctx: Set_Context) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.elementList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementList?: (ctx: ElementListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.element`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElement?: (ctx: ElementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.procedureStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProcedureStatement?: (ctx: ProcedureStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.actualParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitActualParameter?: (ctx: ActualParameterContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.parameterwidth`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterwidth?: (ctx: ParameterwidthContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.gotoStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGotoStatement?: (ctx: GotoStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.emptyStatement_`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEmptyStatement_?: (ctx: EmptyStatement_Context) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.empty_`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEmpty_?: (ctx: Empty_Context) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.structuredStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStructuredStatement?: (ctx: StructuredStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.compoundStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompoundStatement?: (ctx: CompoundStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.statements`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatements?: (ctx: StatementsContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.conditionalStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConditionalStatement?: (ctx: ConditionalStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.ifStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIfStatement?: (ctx: IfStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.elifStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElifStatement?: (ctx: ElifStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.elseStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElseStatement?: (ctx: ElseStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.caseStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCaseStatement?: (ctx: CaseStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.caseListElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCaseListElement?: (ctx: CaseListElementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.caseOtherWise`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCaseOtherWise?: (ctx: CaseOtherWiseContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.repetetiveStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRepetetiveStatement?: (ctx: RepetetiveStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.whileStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhileStatement?: (ctx: WhileStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.repeatStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRepeatStatement?: (ctx: RepeatStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.forStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForStatement?: (ctx: ForStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.forList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForList?: (ctx: ForListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.initialValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInitialValue?: (ctx: InitialValueContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.finalValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFinalValue?: (ctx: FinalValueContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.stepValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStepValue?: (ctx: StepValueContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.withStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWithStatement?: (ctx: WithStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.recordVariableList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRecordVariableList?: (ctx: RecordVariableListContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.writeStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWriteStatement?: (ctx: WriteStatementContext) => Result;
    /**
     * Visit a parse tree produced by `StepCodeParser.readStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReadStatement?: (ctx: ReadStatementContext) => Result;
}

