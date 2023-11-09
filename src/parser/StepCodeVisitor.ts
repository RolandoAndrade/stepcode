// Generated from src/StepCode.g4 by ANTLR 4.13.1

import {ParseTreeVisitor} from 'antlr4';


import { ProgramContext } from "./StepCodeParser";
import { ProgramHeadingContext } from "./StepCodeParser";
import { IdentifierContext } from "./StepCodeParser";
import { BlockContext } from "./StepCodeParser";
import { UsesUnitsPartContext } from "./StepCodeParser";
import { LabelDeclarationPartContext } from "./StepCodeParser";
import { LabelContext } from "./StepCodeParser";
import { ConstantDefinitionPartContext } from "./StepCodeParser";
import { ConstantDefinitionContext } from "./StepCodeParser";
import { ConstantChrContext } from "./StepCodeParser";
import { ConstantContext } from "./StepCodeParser";
import { UnsignedNumberContext } from "./StepCodeParser";
import { UnsignedIntegerContext } from "./StepCodeParser";
import { UnsignedRealContext } from "./StepCodeParser";
import { SignContext } from "./StepCodeParser";
import { Bool_Context } from "./StepCodeParser";
import { StringContext } from "./StepCodeParser";
import { TypeDefinitionPartContext } from "./StepCodeParser";
import { TypeDefinitionContext } from "./StepCodeParser";
import { FunctionTypeContext } from "./StepCodeParser";
import { ProcedureTypeContext } from "./StepCodeParser";
import { Type_Context } from "./StepCodeParser";
import { SimpleTypeContext } from "./StepCodeParser";
import { ScalarTypeContext } from "./StepCodeParser";
import { SubrangeTypeContext } from "./StepCodeParser";
import { TypeIdentifierContext } from "./StepCodeParser";
import { StructuredTypeContext } from "./StepCodeParser";
import { UnpackedStructuredTypeContext } from "./StepCodeParser";
import { StringtypeContext } from "./StepCodeParser";
import { ArrayTypeContext } from "./StepCodeParser";
import { DimensionStatementContext } from "./StepCodeParser";
import { DimensionTypeContext } from "./StepCodeParser";
import { TypeListContext } from "./StepCodeParser";
import { IndexTypeContext } from "./StepCodeParser";
import { ComponentTypeContext } from "./StepCodeParser";
import { RecordTypeContext } from "./StepCodeParser";
import { FieldListContext } from "./StepCodeParser";
import { FixedPartContext } from "./StepCodeParser";
import { RecordSectionContext } from "./StepCodeParser";
import { VariantPartContext } from "./StepCodeParser";
import { TagContext } from "./StepCodeParser";
import { VariantContext } from "./StepCodeParser";
import { SetTypeContext } from "./StepCodeParser";
import { BaseTypeContext } from "./StepCodeParser";
import { FileTypeContext } from "./StepCodeParser";
import { PointerTypeContext } from "./StepCodeParser";
import { VariableDeclarationPartContext } from "./StepCodeParser";
import { VariableDeclarationContext } from "./StepCodeParser";
import { ProcedureAndFunctionDeclarationPartContext } from "./StepCodeParser";
import { ProcedureOrFunctionDeclarationContext } from "./StepCodeParser";
import { ProcedureDeclarationContext } from "./StepCodeParser";
import { FormalParameterListContext } from "./StepCodeParser";
import { FormalParameterSectionContext } from "./StepCodeParser";
import { ParameterGroupContext } from "./StepCodeParser";
import { IdentifierListContext } from "./StepCodeParser";
import { ConstListContext } from "./StepCodeParser";
import { FunctionDeclarationContext } from "./StepCodeParser";
import { ResultTypeContext } from "./StepCodeParser";
import { StatementContext } from "./StepCodeParser";
import { BreakStatementContext } from "./StepCodeParser";
import { ContinueStatementContext } from "./StepCodeParser";
import { UnlabelledStatementContext } from "./StepCodeParser";
import { SimpleStatementContext } from "./StepCodeParser";
import { AssignmentStatementContext } from "./StepCodeParser";
import { VariableContext } from "./StepCodeParser";
import { AccessorContext } from "./StepCodeParser";
import { IndexContext } from "./StepCodeParser";
import { ExpressionContext } from "./StepCodeParser";
import { BooleanMultiplicativeExpressionContext } from "./StepCodeParser";
import { BooleanRelationalExpressionContext } from "./StepCodeParser";
import { RelationaloperatorContext } from "./StepCodeParser";
import { SimpleExpressionContext } from "./StepCodeParser";
import { AdditiveoperatorContext } from "./StepCodeParser";
import { TermContext } from "./StepCodeParser";
import { BaseTermContext } from "./StepCodeParser";
import { MultiplicativeoperatorContext } from "./StepCodeParser";
import { ExponentiationOperatorContext } from "./StepCodeParser";
import { SignedFactorContext } from "./StepCodeParser";
import { FactorContext } from "./StepCodeParser";
import { UnsignedConstantContext } from "./StepCodeParser";
import { FunctionDesignatorContext } from "./StepCodeParser";
import { ParameterListContext } from "./StepCodeParser";
import { Set_Context } from "./StepCodeParser";
import { ElementListContext } from "./StepCodeParser";
import { ElementContext } from "./StepCodeParser";
import { ProcedureStatementContext } from "./StepCodeParser";
import { ActualParameterContext } from "./StepCodeParser";
import { ParameterwidthContext } from "./StepCodeParser";
import { GotoStatementContext } from "./StepCodeParser";
import { EmptyStatement_Context } from "./StepCodeParser";
import { Empty_Context } from "./StepCodeParser";
import { StructuredStatementContext } from "./StepCodeParser";
import { CompoundStatementContext } from "./StepCodeParser";
import { StatementsContext } from "./StepCodeParser";
import { ConditionalStatementContext } from "./StepCodeParser";
import { IfStatementContext } from "./StepCodeParser";
import { ElifStatementContext } from "./StepCodeParser";
import { ElseStatementContext } from "./StepCodeParser";
import { CaseStatementContext } from "./StepCodeParser";
import { CaseListElementContext } from "./StepCodeParser";
import { CaseOtherWiseContext } from "./StepCodeParser";
import { RepetetiveStatementContext } from "./StepCodeParser";
import { WhileStatementContext } from "./StepCodeParser";
import { RepeatStatementContext } from "./StepCodeParser";
import { ForStatementContext } from "./StepCodeParser";
import { ForListContext } from "./StepCodeParser";
import { InitialValueContext } from "./StepCodeParser";
import { FinalValueContext } from "./StepCodeParser";
import { StepValueContext } from "./StepCodeParser";
import { WithStatementContext } from "./StepCodeParser";
import { RecordVariableListContext } from "./StepCodeParser";
import { WriteStatementContext } from "./StepCodeParser";
import { ReadStatementContext } from "./StepCodeParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `StepCodeParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class StepCodeVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `StepCodeParser.program`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgram?: (ctx: ProgramContext) => Result;
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
	 * Visit a parse tree produced by `StepCodeParser.parameterGroup`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameterGroup?: (ctx: ParameterGroupContext) => Result;
	/**
	 * Visit a parse tree produced by `StepCodeParser.identifierList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifierList?: (ctx: IdentifierListContext) => Result;
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

