// Generated from src/StepCode.g4 by ANTLR 4.13.1

import {ParseTreeListener} from "antlr4";


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
import { ExpressionContext } from "./StepCodeParser";
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
import { WithStatementContext } from "./StepCodeParser";
import { RecordVariableListContext } from "./StepCodeParser";
import { WriteStatementContext } from "./StepCodeParser";
import { ReadStatementContext } from "./StepCodeParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `StepCodeParser`.
 */
export default class StepCodeListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `StepCodeParser.program`.
	 * @param ctx the parse tree
	 */
	enterProgram?: (ctx: ProgramContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.program`.
	 * @param ctx the parse tree
	 */
	exitProgram?: (ctx: ProgramContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.programHeading`.
	 * @param ctx the parse tree
	 */
	enterProgramHeading?: (ctx: ProgramHeadingContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.programHeading`.
	 * @param ctx the parse tree
	 */
	exitProgramHeading?: (ctx: ProgramHeadingContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.identifier`.
	 * @param ctx the parse tree
	 */
	enterIdentifier?: (ctx: IdentifierContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.identifier`.
	 * @param ctx the parse tree
	 */
	exitIdentifier?: (ctx: IdentifierContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.block`.
	 * @param ctx the parse tree
	 */
	enterBlock?: (ctx: BlockContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.block`.
	 * @param ctx the parse tree
	 */
	exitBlock?: (ctx: BlockContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.usesUnitsPart`.
	 * @param ctx the parse tree
	 */
	enterUsesUnitsPart?: (ctx: UsesUnitsPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.usesUnitsPart`.
	 * @param ctx the parse tree
	 */
	exitUsesUnitsPart?: (ctx: UsesUnitsPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.labelDeclarationPart`.
	 * @param ctx the parse tree
	 */
	enterLabelDeclarationPart?: (ctx: LabelDeclarationPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.labelDeclarationPart`.
	 * @param ctx the parse tree
	 */
	exitLabelDeclarationPart?: (ctx: LabelDeclarationPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.label`.
	 * @param ctx the parse tree
	 */
	enterLabel?: (ctx: LabelContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.label`.
	 * @param ctx the parse tree
	 */
	exitLabel?: (ctx: LabelContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.constantDefinitionPart`.
	 * @param ctx the parse tree
	 */
	enterConstantDefinitionPart?: (ctx: ConstantDefinitionPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.constantDefinitionPart`.
	 * @param ctx the parse tree
	 */
	exitConstantDefinitionPart?: (ctx: ConstantDefinitionPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.constantDefinition`.
	 * @param ctx the parse tree
	 */
	enterConstantDefinition?: (ctx: ConstantDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.constantDefinition`.
	 * @param ctx the parse tree
	 */
	exitConstantDefinition?: (ctx: ConstantDefinitionContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.constantChr`.
	 * @param ctx the parse tree
	 */
	enterConstantChr?: (ctx: ConstantChrContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.constantChr`.
	 * @param ctx the parse tree
	 */
	exitConstantChr?: (ctx: ConstantChrContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.constant`.
	 * @param ctx the parse tree
	 */
	enterConstant?: (ctx: ConstantContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.constant`.
	 * @param ctx the parse tree
	 */
	exitConstant?: (ctx: ConstantContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.unsignedNumber`.
	 * @param ctx the parse tree
	 */
	enterUnsignedNumber?: (ctx: UnsignedNumberContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.unsignedNumber`.
	 * @param ctx the parse tree
	 */
	exitUnsignedNumber?: (ctx: UnsignedNumberContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.unsignedInteger`.
	 * @param ctx the parse tree
	 */
	enterUnsignedInteger?: (ctx: UnsignedIntegerContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.unsignedInteger`.
	 * @param ctx the parse tree
	 */
	exitUnsignedInteger?: (ctx: UnsignedIntegerContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.unsignedReal`.
	 * @param ctx the parse tree
	 */
	enterUnsignedReal?: (ctx: UnsignedRealContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.unsignedReal`.
	 * @param ctx the parse tree
	 */
	exitUnsignedReal?: (ctx: UnsignedRealContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.sign`.
	 * @param ctx the parse tree
	 */
	enterSign?: (ctx: SignContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.sign`.
	 * @param ctx the parse tree
	 */
	exitSign?: (ctx: SignContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.bool_`.
	 * @param ctx the parse tree
	 */
	enterBool_?: (ctx: Bool_Context) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.bool_`.
	 * @param ctx the parse tree
	 */
	exitBool_?: (ctx: Bool_Context) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.string`.
	 * @param ctx the parse tree
	 */
	enterString?: (ctx: StringContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.string`.
	 * @param ctx the parse tree
	 */
	exitString?: (ctx: StringContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.typeDefinitionPart`.
	 * @param ctx the parse tree
	 */
	enterTypeDefinitionPart?: (ctx: TypeDefinitionPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.typeDefinitionPart`.
	 * @param ctx the parse tree
	 */
	exitTypeDefinitionPart?: (ctx: TypeDefinitionPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.typeDefinition`.
	 * @param ctx the parse tree
	 */
	enterTypeDefinition?: (ctx: TypeDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.typeDefinition`.
	 * @param ctx the parse tree
	 */
	exitTypeDefinition?: (ctx: TypeDefinitionContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.functionType`.
	 * @param ctx the parse tree
	 */
	enterFunctionType?: (ctx: FunctionTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.functionType`.
	 * @param ctx the parse tree
	 */
	exitFunctionType?: (ctx: FunctionTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.procedureType`.
	 * @param ctx the parse tree
	 */
	enterProcedureType?: (ctx: ProcedureTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.procedureType`.
	 * @param ctx the parse tree
	 */
	exitProcedureType?: (ctx: ProcedureTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.type_`.
	 * @param ctx the parse tree
	 */
	enterType_?: (ctx: Type_Context) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.type_`.
	 * @param ctx the parse tree
	 */
	exitType_?: (ctx: Type_Context) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.simpleType`.
	 * @param ctx the parse tree
	 */
	enterSimpleType?: (ctx: SimpleTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.simpleType`.
	 * @param ctx the parse tree
	 */
	exitSimpleType?: (ctx: SimpleTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.scalarType`.
	 * @param ctx the parse tree
	 */
	enterScalarType?: (ctx: ScalarTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.scalarType`.
	 * @param ctx the parse tree
	 */
	exitScalarType?: (ctx: ScalarTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.subrangeType`.
	 * @param ctx the parse tree
	 */
	enterSubrangeType?: (ctx: SubrangeTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.subrangeType`.
	 * @param ctx the parse tree
	 */
	exitSubrangeType?: (ctx: SubrangeTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.typeIdentifier`.
	 * @param ctx the parse tree
	 */
	enterTypeIdentifier?: (ctx: TypeIdentifierContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.typeIdentifier`.
	 * @param ctx the parse tree
	 */
	exitTypeIdentifier?: (ctx: TypeIdentifierContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.structuredType`.
	 * @param ctx the parse tree
	 */
	enterStructuredType?: (ctx: StructuredTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.structuredType`.
	 * @param ctx the parse tree
	 */
	exitStructuredType?: (ctx: StructuredTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.unpackedStructuredType`.
	 * @param ctx the parse tree
	 */
	enterUnpackedStructuredType?: (ctx: UnpackedStructuredTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.unpackedStructuredType`.
	 * @param ctx the parse tree
	 */
	exitUnpackedStructuredType?: (ctx: UnpackedStructuredTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.stringtype`.
	 * @param ctx the parse tree
	 */
	enterStringtype?: (ctx: StringtypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.stringtype`.
	 * @param ctx the parse tree
	 */
	exitStringtype?: (ctx: StringtypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.arrayType`.
	 * @param ctx the parse tree
	 */
	enterArrayType?: (ctx: ArrayTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.arrayType`.
	 * @param ctx the parse tree
	 */
	exitArrayType?: (ctx: ArrayTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.typeList`.
	 * @param ctx the parse tree
	 */
	enterTypeList?: (ctx: TypeListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.typeList`.
	 * @param ctx the parse tree
	 */
	exitTypeList?: (ctx: TypeListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.indexType`.
	 * @param ctx the parse tree
	 */
	enterIndexType?: (ctx: IndexTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.indexType`.
	 * @param ctx the parse tree
	 */
	exitIndexType?: (ctx: IndexTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.componentType`.
	 * @param ctx the parse tree
	 */
	enterComponentType?: (ctx: ComponentTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.componentType`.
	 * @param ctx the parse tree
	 */
	exitComponentType?: (ctx: ComponentTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.recordType`.
	 * @param ctx the parse tree
	 */
	enterRecordType?: (ctx: RecordTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.recordType`.
	 * @param ctx the parse tree
	 */
	exitRecordType?: (ctx: RecordTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.fieldList`.
	 * @param ctx the parse tree
	 */
	enterFieldList?: (ctx: FieldListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.fieldList`.
	 * @param ctx the parse tree
	 */
	exitFieldList?: (ctx: FieldListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.fixedPart`.
	 * @param ctx the parse tree
	 */
	enterFixedPart?: (ctx: FixedPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.fixedPart`.
	 * @param ctx the parse tree
	 */
	exitFixedPart?: (ctx: FixedPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.recordSection`.
	 * @param ctx the parse tree
	 */
	enterRecordSection?: (ctx: RecordSectionContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.recordSection`.
	 * @param ctx the parse tree
	 */
	exitRecordSection?: (ctx: RecordSectionContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.variantPart`.
	 * @param ctx the parse tree
	 */
	enterVariantPart?: (ctx: VariantPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.variantPart`.
	 * @param ctx the parse tree
	 */
	exitVariantPart?: (ctx: VariantPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.tag`.
	 * @param ctx the parse tree
	 */
	enterTag?: (ctx: TagContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.tag`.
	 * @param ctx the parse tree
	 */
	exitTag?: (ctx: TagContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.variant`.
	 * @param ctx the parse tree
	 */
	enterVariant?: (ctx: VariantContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.variant`.
	 * @param ctx the parse tree
	 */
	exitVariant?: (ctx: VariantContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.setType`.
	 * @param ctx the parse tree
	 */
	enterSetType?: (ctx: SetTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.setType`.
	 * @param ctx the parse tree
	 */
	exitSetType?: (ctx: SetTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.baseType`.
	 * @param ctx the parse tree
	 */
	enterBaseType?: (ctx: BaseTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.baseType`.
	 * @param ctx the parse tree
	 */
	exitBaseType?: (ctx: BaseTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.fileType`.
	 * @param ctx the parse tree
	 */
	enterFileType?: (ctx: FileTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.fileType`.
	 * @param ctx the parse tree
	 */
	exitFileType?: (ctx: FileTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.pointerType`.
	 * @param ctx the parse tree
	 */
	enterPointerType?: (ctx: PointerTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.pointerType`.
	 * @param ctx the parse tree
	 */
	exitPointerType?: (ctx: PointerTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.variableDeclarationPart`.
	 * @param ctx the parse tree
	 */
	enterVariableDeclarationPart?: (ctx: VariableDeclarationPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.variableDeclarationPart`.
	 * @param ctx the parse tree
	 */
	exitVariableDeclarationPart?: (ctx: VariableDeclarationPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.variableDeclaration`.
	 * @param ctx the parse tree
	 */
	enterVariableDeclaration?: (ctx: VariableDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.variableDeclaration`.
	 * @param ctx the parse tree
	 */
	exitVariableDeclaration?: (ctx: VariableDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.procedureAndFunctionDeclarationPart`.
	 * @param ctx the parse tree
	 */
	enterProcedureAndFunctionDeclarationPart?: (ctx: ProcedureAndFunctionDeclarationPartContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.procedureAndFunctionDeclarationPart`.
	 * @param ctx the parse tree
	 */
	exitProcedureAndFunctionDeclarationPart?: (ctx: ProcedureAndFunctionDeclarationPartContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.procedureOrFunctionDeclaration`.
	 * @param ctx the parse tree
	 */
	enterProcedureOrFunctionDeclaration?: (ctx: ProcedureOrFunctionDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.procedureOrFunctionDeclaration`.
	 * @param ctx the parse tree
	 */
	exitProcedureOrFunctionDeclaration?: (ctx: ProcedureOrFunctionDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.procedureDeclaration`.
	 * @param ctx the parse tree
	 */
	enterProcedureDeclaration?: (ctx: ProcedureDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.procedureDeclaration`.
	 * @param ctx the parse tree
	 */
	exitProcedureDeclaration?: (ctx: ProcedureDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.formalParameterList`.
	 * @param ctx the parse tree
	 */
	enterFormalParameterList?: (ctx: FormalParameterListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.formalParameterList`.
	 * @param ctx the parse tree
	 */
	exitFormalParameterList?: (ctx: FormalParameterListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.formalParameterSection`.
	 * @param ctx the parse tree
	 */
	enterFormalParameterSection?: (ctx: FormalParameterSectionContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.formalParameterSection`.
	 * @param ctx the parse tree
	 */
	exitFormalParameterSection?: (ctx: FormalParameterSectionContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.parameterGroup`.
	 * @param ctx the parse tree
	 */
	enterParameterGroup?: (ctx: ParameterGroupContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.parameterGroup`.
	 * @param ctx the parse tree
	 */
	exitParameterGroup?: (ctx: ParameterGroupContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.identifierList`.
	 * @param ctx the parse tree
	 */
	enterIdentifierList?: (ctx: IdentifierListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.identifierList`.
	 * @param ctx the parse tree
	 */
	exitIdentifierList?: (ctx: IdentifierListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.constList`.
	 * @param ctx the parse tree
	 */
	enterConstList?: (ctx: ConstListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.constList`.
	 * @param ctx the parse tree
	 */
	exitConstList?: (ctx: ConstListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.functionDeclaration`.
	 * @param ctx the parse tree
	 */
	enterFunctionDeclaration?: (ctx: FunctionDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.functionDeclaration`.
	 * @param ctx the parse tree
	 */
	exitFunctionDeclaration?: (ctx: FunctionDeclarationContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.resultType`.
	 * @param ctx the parse tree
	 */
	enterResultType?: (ctx: ResultTypeContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.resultType`.
	 * @param ctx the parse tree
	 */
	exitResultType?: (ctx: ResultTypeContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.breakStatement`.
	 * @param ctx the parse tree
	 */
	enterBreakStatement?: (ctx: BreakStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.breakStatement`.
	 * @param ctx the parse tree
	 */
	exitBreakStatement?: (ctx: BreakStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.continueStatement`.
	 * @param ctx the parse tree
	 */
	enterContinueStatement?: (ctx: ContinueStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.continueStatement`.
	 * @param ctx the parse tree
	 */
	exitContinueStatement?: (ctx: ContinueStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.unlabelledStatement`.
	 * @param ctx the parse tree
	 */
	enterUnlabelledStatement?: (ctx: UnlabelledStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.unlabelledStatement`.
	 * @param ctx the parse tree
	 */
	exitUnlabelledStatement?: (ctx: UnlabelledStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.simpleStatement`.
	 * @param ctx the parse tree
	 */
	enterSimpleStatement?: (ctx: SimpleStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.simpleStatement`.
	 * @param ctx the parse tree
	 */
	exitSimpleStatement?: (ctx: SimpleStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.assignmentStatement`.
	 * @param ctx the parse tree
	 */
	enterAssignmentStatement?: (ctx: AssignmentStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.assignmentStatement`.
	 * @param ctx the parse tree
	 */
	exitAssignmentStatement?: (ctx: AssignmentStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.variable`.
	 * @param ctx the parse tree
	 */
	enterVariable?: (ctx: VariableContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.variable`.
	 * @param ctx the parse tree
	 */
	exitVariable?: (ctx: VariableContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.relationaloperator`.
	 * @param ctx the parse tree
	 */
	enterRelationaloperator?: (ctx: RelationaloperatorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.relationaloperator`.
	 * @param ctx the parse tree
	 */
	exitRelationaloperator?: (ctx: RelationaloperatorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.simpleExpression`.
	 * @param ctx the parse tree
	 */
	enterSimpleExpression?: (ctx: SimpleExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.simpleExpression`.
	 * @param ctx the parse tree
	 */
	exitSimpleExpression?: (ctx: SimpleExpressionContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.additiveoperator`.
	 * @param ctx the parse tree
	 */
	enterAdditiveoperator?: (ctx: AdditiveoperatorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.additiveoperator`.
	 * @param ctx the parse tree
	 */
	exitAdditiveoperator?: (ctx: AdditiveoperatorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.term`.
	 * @param ctx the parse tree
	 */
	enterTerm?: (ctx: TermContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.term`.
	 * @param ctx the parse tree
	 */
	exitTerm?: (ctx: TermContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.baseTerm`.
	 * @param ctx the parse tree
	 */
	enterBaseTerm?: (ctx: BaseTermContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.baseTerm`.
	 * @param ctx the parse tree
	 */
	exitBaseTerm?: (ctx: BaseTermContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.multiplicativeoperator`.
	 * @param ctx the parse tree
	 */
	enterMultiplicativeoperator?: (ctx: MultiplicativeoperatorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.multiplicativeoperator`.
	 * @param ctx the parse tree
	 */
	exitMultiplicativeoperator?: (ctx: MultiplicativeoperatorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.exponentiationOperator`.
	 * @param ctx the parse tree
	 */
	enterExponentiationOperator?: (ctx: ExponentiationOperatorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.exponentiationOperator`.
	 * @param ctx the parse tree
	 */
	exitExponentiationOperator?: (ctx: ExponentiationOperatorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.signedFactor`.
	 * @param ctx the parse tree
	 */
	enterSignedFactor?: (ctx: SignedFactorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.signedFactor`.
	 * @param ctx the parse tree
	 */
	exitSignedFactor?: (ctx: SignedFactorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.factor`.
	 * @param ctx the parse tree
	 */
	enterFactor?: (ctx: FactorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.factor`.
	 * @param ctx the parse tree
	 */
	exitFactor?: (ctx: FactorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.unsignedConstant`.
	 * @param ctx the parse tree
	 */
	enterUnsignedConstant?: (ctx: UnsignedConstantContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.unsignedConstant`.
	 * @param ctx the parse tree
	 */
	exitUnsignedConstant?: (ctx: UnsignedConstantContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.functionDesignator`.
	 * @param ctx the parse tree
	 */
	enterFunctionDesignator?: (ctx: FunctionDesignatorContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.functionDesignator`.
	 * @param ctx the parse tree
	 */
	exitFunctionDesignator?: (ctx: FunctionDesignatorContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.parameterList`.
	 * @param ctx the parse tree
	 */
	enterParameterList?: (ctx: ParameterListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.parameterList`.
	 * @param ctx the parse tree
	 */
	exitParameterList?: (ctx: ParameterListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.set_`.
	 * @param ctx the parse tree
	 */
	enterSet_?: (ctx: Set_Context) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.set_`.
	 * @param ctx the parse tree
	 */
	exitSet_?: (ctx: Set_Context) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.elementList`.
	 * @param ctx the parse tree
	 */
	enterElementList?: (ctx: ElementListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.elementList`.
	 * @param ctx the parse tree
	 */
	exitElementList?: (ctx: ElementListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.element`.
	 * @param ctx the parse tree
	 */
	enterElement?: (ctx: ElementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.element`.
	 * @param ctx the parse tree
	 */
	exitElement?: (ctx: ElementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.procedureStatement`.
	 * @param ctx the parse tree
	 */
	enterProcedureStatement?: (ctx: ProcedureStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.procedureStatement`.
	 * @param ctx the parse tree
	 */
	exitProcedureStatement?: (ctx: ProcedureStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.actualParameter`.
	 * @param ctx the parse tree
	 */
	enterActualParameter?: (ctx: ActualParameterContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.actualParameter`.
	 * @param ctx the parse tree
	 */
	exitActualParameter?: (ctx: ActualParameterContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.parameterwidth`.
	 * @param ctx the parse tree
	 */
	enterParameterwidth?: (ctx: ParameterwidthContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.parameterwidth`.
	 * @param ctx the parse tree
	 */
	exitParameterwidth?: (ctx: ParameterwidthContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.gotoStatement`.
	 * @param ctx the parse tree
	 */
	enterGotoStatement?: (ctx: GotoStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.gotoStatement`.
	 * @param ctx the parse tree
	 */
	exitGotoStatement?: (ctx: GotoStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.emptyStatement_`.
	 * @param ctx the parse tree
	 */
	enterEmptyStatement_?: (ctx: EmptyStatement_Context) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.emptyStatement_`.
	 * @param ctx the parse tree
	 */
	exitEmptyStatement_?: (ctx: EmptyStatement_Context) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.empty_`.
	 * @param ctx the parse tree
	 */
	enterEmpty_?: (ctx: Empty_Context) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.empty_`.
	 * @param ctx the parse tree
	 */
	exitEmpty_?: (ctx: Empty_Context) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.structuredStatement`.
	 * @param ctx the parse tree
	 */
	enterStructuredStatement?: (ctx: StructuredStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.structuredStatement`.
	 * @param ctx the parse tree
	 */
	exitStructuredStatement?: (ctx: StructuredStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.compoundStatement`.
	 * @param ctx the parse tree
	 */
	enterCompoundStatement?: (ctx: CompoundStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.compoundStatement`.
	 * @param ctx the parse tree
	 */
	exitCompoundStatement?: (ctx: CompoundStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.statements`.
	 * @param ctx the parse tree
	 */
	enterStatements?: (ctx: StatementsContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.statements`.
	 * @param ctx the parse tree
	 */
	exitStatements?: (ctx: StatementsContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.conditionalStatement`.
	 * @param ctx the parse tree
	 */
	enterConditionalStatement?: (ctx: ConditionalStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.conditionalStatement`.
	 * @param ctx the parse tree
	 */
	exitConditionalStatement?: (ctx: ConditionalStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.ifStatement`.
	 * @param ctx the parse tree
	 */
	enterIfStatement?: (ctx: IfStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.ifStatement`.
	 * @param ctx the parse tree
	 */
	exitIfStatement?: (ctx: IfStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.elifStatement`.
	 * @param ctx the parse tree
	 */
	enterElifStatement?: (ctx: ElifStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.elifStatement`.
	 * @param ctx the parse tree
	 */
	exitElifStatement?: (ctx: ElifStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.elseStatement`.
	 * @param ctx the parse tree
	 */
	enterElseStatement?: (ctx: ElseStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.elseStatement`.
	 * @param ctx the parse tree
	 */
	exitElseStatement?: (ctx: ElseStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.caseStatement`.
	 * @param ctx the parse tree
	 */
	enterCaseStatement?: (ctx: CaseStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.caseStatement`.
	 * @param ctx the parse tree
	 */
	exitCaseStatement?: (ctx: CaseStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.caseListElement`.
	 * @param ctx the parse tree
	 */
	enterCaseListElement?: (ctx: CaseListElementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.caseListElement`.
	 * @param ctx the parse tree
	 */
	exitCaseListElement?: (ctx: CaseListElementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.caseOtherWise`.
	 * @param ctx the parse tree
	 */
	enterCaseOtherWise?: (ctx: CaseOtherWiseContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.caseOtherWise`.
	 * @param ctx the parse tree
	 */
	exitCaseOtherWise?: (ctx: CaseOtherWiseContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.repetetiveStatement`.
	 * @param ctx the parse tree
	 */
	enterRepetetiveStatement?: (ctx: RepetetiveStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.repetetiveStatement`.
	 * @param ctx the parse tree
	 */
	exitRepetetiveStatement?: (ctx: RepetetiveStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.whileStatement`.
	 * @param ctx the parse tree
	 */
	enterWhileStatement?: (ctx: WhileStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.whileStatement`.
	 * @param ctx the parse tree
	 */
	exitWhileStatement?: (ctx: WhileStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.repeatStatement`.
	 * @param ctx the parse tree
	 */
	enterRepeatStatement?: (ctx: RepeatStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.repeatStatement`.
	 * @param ctx the parse tree
	 */
	exitRepeatStatement?: (ctx: RepeatStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.forStatement`.
	 * @param ctx the parse tree
	 */
	enterForStatement?: (ctx: ForStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.forStatement`.
	 * @param ctx the parse tree
	 */
	exitForStatement?: (ctx: ForStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.forList`.
	 * @param ctx the parse tree
	 */
	enterForList?: (ctx: ForListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.forList`.
	 * @param ctx the parse tree
	 */
	exitForList?: (ctx: ForListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.initialValue`.
	 * @param ctx the parse tree
	 */
	enterInitialValue?: (ctx: InitialValueContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.initialValue`.
	 * @param ctx the parse tree
	 */
	exitInitialValue?: (ctx: InitialValueContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.finalValue`.
	 * @param ctx the parse tree
	 */
	enterFinalValue?: (ctx: FinalValueContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.finalValue`.
	 * @param ctx the parse tree
	 */
	exitFinalValue?: (ctx: FinalValueContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.withStatement`.
	 * @param ctx the parse tree
	 */
	enterWithStatement?: (ctx: WithStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.withStatement`.
	 * @param ctx the parse tree
	 */
	exitWithStatement?: (ctx: WithStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.recordVariableList`.
	 * @param ctx the parse tree
	 */
	enterRecordVariableList?: (ctx: RecordVariableListContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.recordVariableList`.
	 * @param ctx the parse tree
	 */
	exitRecordVariableList?: (ctx: RecordVariableListContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.writeStatement`.
	 * @param ctx the parse tree
	 */
	enterWriteStatement?: (ctx: WriteStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.writeStatement`.
	 * @param ctx the parse tree
	 */
	exitWriteStatement?: (ctx: WriteStatementContext) => void;
	/**
	 * Enter a parse tree produced by `StepCodeParser.readStatement`.
	 * @param ctx the parse tree
	 */
	enterReadStatement?: (ctx: ReadStatementContext) => void;
	/**
	 * Exit a parse tree produced by `StepCodeParser.readStatement`.
	 * @param ctx the parse tree
	 */
	exitReadStatement?: (ctx: ReadStatementContext) => void;
}

