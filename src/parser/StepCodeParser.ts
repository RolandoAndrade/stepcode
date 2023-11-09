// Generated from src/StepCode.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import StepCodeListener from "./StepCodeListener.js";
import StepCodeVisitor from "./StepCodeVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class StepCodeParser extends Parser {
	public static readonly AND = 1;
	public static readonly ARRAY = 2;
	public static readonly BEGIN = 3;
	public static readonly BOOLEAN = 4;
	public static readonly ENDCASE = 5;
	public static readonly CASE = 6;
	public static readonly CHAR = 7;
	public static readonly CHR = 8;
	public static readonly CONST = 9;
	public static readonly DIV = 10;
	public static readonly DO = 11;
	public static readonly DOWNTO = 12;
	public static readonly ELIF = 13;
	public static readonly ELSE = 14;
	public static readonly OTHERWISE = 15;
	public static readonly END = 16;
	public static readonly FILE = 17;
	public static readonly WITHSTEP = 18;
	public static readonly ENDFOR = 19;
	public static readonly FOR = 20;
	public static readonly FUNCTION = 21;
	public static readonly GOTO = 22;
	public static readonly ENDIF = 23;
	public static readonly IF = 24;
	public static readonly IN = 25;
	public static readonly INTEGER = 26;
	public static readonly LABEL = 27;
	public static readonly MOD = 28;
	public static readonly NIL = 29;
	public static readonly NOT = 30;
	public static readonly OF = 31;
	public static readonly HACER = 32;
	public static readonly OR = 33;
	public static readonly PACKED = 34;
	public static readonly PROCEDURE = 35;
	public static readonly PROGRAM = 36;
	public static readonly ENDPROGRAM = 37;
	public static readonly BREAK = 38;
	public static readonly CONTINUE = 39;
	public static readonly RETURN = 40;
	public static readonly REAL = 41;
	public static readonly RECORD = 42;
	public static readonly REPEAT = 43;
	public static readonly SET = 44;
	public static readonly THEN = 45;
	public static readonly UNTIL = 46;
	public static readonly TO = 47;
	public static readonly TYPE = 48;
	public static readonly DEFINE = 49;
	public static readonly ENDWHILE = 50;
	public static readonly MIENTRASQUE = 51;
	public static readonly WHILE = 52;
	public static readonly WITH = 53;
	public static readonly PLUS = 54;
	public static readonly MINUS = 55;
	public static readonly POWER = 56;
	public static readonly STAR = 57;
	public static readonly SLASH = 58;
	public static readonly ASSIGN = 59;
	public static readonly COMMA = 60;
	public static readonly SEMI = 61;
	public static readonly COLON = 62;
	public static readonly EQUAL = 63;
	public static readonly NOT_EQUAL = 64;
	public static readonly LT = 65;
	public static readonly LE = 66;
	public static readonly GE = 67;
	public static readonly GT = 68;
	public static readonly LPAREN = 69;
	public static readonly RPAREN = 70;
	public static readonly LBRACK = 71;
	public static readonly LBRACK2 = 72;
	public static readonly RBRACK = 73;
	public static readonly RBRACK2 = 74;
	public static readonly POINTER = 75;
	public static readonly AT = 76;
	public static readonly DOT = 77;
	public static readonly DOTDOT = 78;
	public static readonly LCURLY = 79;
	public static readonly RCURLY = 80;
	public static readonly AS = 81;
	public static readonly UNIT = 82;
	public static readonly INTERFACE = 83;
	public static readonly USES = 84;
	public static readonly STRING = 85;
	public static readonly IMPLEMENTATION = 86;
	public static readonly TRUE = 87;
	public static readonly FALSE = 88;
	public static readonly WRITE = 89;
	public static readonly READ = 90;
	public static readonly WS = 91;
	public static readonly COMMENT_1 = 92;
	public static readonly COMMENT_2 = 93;
	public static readonly IDENT = 94;
	public static readonly STRING_LITERAL = 95;
	public static readonly NUM_INT = 96;
	public static readonly NUM_REAL = 97;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_program = 0;
	public static readonly RULE_programHeading = 1;
	public static readonly RULE_identifier = 2;
	public static readonly RULE_block = 3;
	public static readonly RULE_usesUnitsPart = 4;
	public static readonly RULE_labelDeclarationPart = 5;
	public static readonly RULE_label = 6;
	public static readonly RULE_constantDefinitionPart = 7;
	public static readonly RULE_constantDefinition = 8;
	public static readonly RULE_constantChr = 9;
	public static readonly RULE_constant = 10;
	public static readonly RULE_unsignedNumber = 11;
	public static readonly RULE_unsignedInteger = 12;
	public static readonly RULE_unsignedReal = 13;
	public static readonly RULE_sign = 14;
	public static readonly RULE_bool_ = 15;
	public static readonly RULE_string = 16;
	public static readonly RULE_typeDefinitionPart = 17;
	public static readonly RULE_typeDefinition = 18;
	public static readonly RULE_functionType = 19;
	public static readonly RULE_procedureType = 20;
	public static readonly RULE_type_ = 21;
	public static readonly RULE_simpleType = 22;
	public static readonly RULE_scalarType = 23;
	public static readonly RULE_subrangeType = 24;
	public static readonly RULE_typeIdentifier = 25;
	public static readonly RULE_structuredType = 26;
	public static readonly RULE_unpackedStructuredType = 27;
	public static readonly RULE_stringtype = 28;
	public static readonly RULE_arrayType = 29;
	public static readonly RULE_typeList = 30;
	public static readonly RULE_indexType = 31;
	public static readonly RULE_componentType = 32;
	public static readonly RULE_recordType = 33;
	public static readonly RULE_fieldList = 34;
	public static readonly RULE_fixedPart = 35;
	public static readonly RULE_recordSection = 36;
	public static readonly RULE_variantPart = 37;
	public static readonly RULE_tag = 38;
	public static readonly RULE_variant = 39;
	public static readonly RULE_setType = 40;
	public static readonly RULE_baseType = 41;
	public static readonly RULE_fileType = 42;
	public static readonly RULE_pointerType = 43;
	public static readonly RULE_variableDeclarationPart = 44;
	public static readonly RULE_variableDeclaration = 45;
	public static readonly RULE_procedureAndFunctionDeclarationPart = 46;
	public static readonly RULE_procedureOrFunctionDeclaration = 47;
	public static readonly RULE_procedureDeclaration = 48;
	public static readonly RULE_formalParameterList = 49;
	public static readonly RULE_formalParameterSection = 50;
	public static readonly RULE_parameterGroup = 51;
	public static readonly RULE_identifierList = 52;
	public static readonly RULE_constList = 53;
	public static readonly RULE_functionDeclaration = 54;
	public static readonly RULE_resultType = 55;
	public static readonly RULE_statement = 56;
	public static readonly RULE_breakStatement = 57;
	public static readonly RULE_continueStatement = 58;
	public static readonly RULE_unlabelledStatement = 59;
	public static readonly RULE_simpleStatement = 60;
	public static readonly RULE_assignmentStatement = 61;
	public static readonly RULE_variable = 62;
	public static readonly RULE_accessor = 63;
	public static readonly RULE_index = 64;
	public static readonly RULE_expression = 65;
	public static readonly RULE_booleanMultiplicativeExpression = 66;
	public static readonly RULE_booleanRelationalExpression = 67;
	public static readonly RULE_relationaloperator = 68;
	public static readonly RULE_simpleExpression = 69;
	public static readonly RULE_additiveoperator = 70;
	public static readonly RULE_term = 71;
	public static readonly RULE_baseTerm = 72;
	public static readonly RULE_multiplicativeoperator = 73;
	public static readonly RULE_exponentiationOperator = 74;
	public static readonly RULE_signedFactor = 75;
	public static readonly RULE_factor = 76;
	public static readonly RULE_unsignedConstant = 77;
	public static readonly RULE_functionDesignator = 78;
	public static readonly RULE_parameterList = 79;
	public static readonly RULE_set_ = 80;
	public static readonly RULE_elementList = 81;
	public static readonly RULE_element = 82;
	public static readonly RULE_procedureStatement = 83;
	public static readonly RULE_actualParameter = 84;
	public static readonly RULE_parameterwidth = 85;
	public static readonly RULE_gotoStatement = 86;
	public static readonly RULE_emptyStatement_ = 87;
	public static readonly RULE_empty_ = 88;
	public static readonly RULE_structuredStatement = 89;
	public static readonly RULE_compoundStatement = 90;
	public static readonly RULE_statements = 91;
	public static readonly RULE_conditionalStatement = 92;
	public static readonly RULE_ifStatement = 93;
	public static readonly RULE_elifStatement = 94;
	public static readonly RULE_elseStatement = 95;
	public static readonly RULE_caseStatement = 96;
	public static readonly RULE_caseListElement = 97;
	public static readonly RULE_caseOtherWise = 98;
	public static readonly RULE_repetetiveStatement = 99;
	public static readonly RULE_whileStatement = 100;
	public static readonly RULE_repeatStatement = 101;
	public static readonly RULE_forStatement = 102;
	public static readonly RULE_forList = 103;
	public static readonly RULE_initialValue = 104;
	public static readonly RULE_finalValue = 105;
	public static readonly RULE_stepValue = 106;
	public static readonly RULE_withStatement = 107;
	public static readonly RULE_recordVariableList = 108;
	public static readonly RULE_writeStatement = 109;
	public static readonly RULE_readStatement = 110;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            "'ARRAY'", "'BEGIN'", 
                                                            null, null, 
                                                            null, null, 
                                                            "'CHR'", "'CONST'", 
                                                            "'DIV'", "'DO'", 
                                                            "'DOWNTO'", 
                                                            null, null, 
                                                            null, "'END'", 
                                                            "'FILE'", null, 
                                                            null, null, 
                                                            "'FUNCTION'", 
                                                            "'GOTO'", null, 
                                                            null, "'IN'", 
                                                            null, "'LABEL'", 
                                                            "'MOD'", "'NIL'", 
                                                            null, "'OF'", 
                                                            "'HACER'", null, 
                                                            "'PACKED'", 
                                                            "'PROCEDURE'", 
                                                            null, null, 
                                                            null, null, 
                                                            null, "'REAL'", 
                                                            "'RECORD'", 
                                                            null, "'SET'", 
                                                            null, null, 
                                                            null, "'TYPE'", 
                                                            null, null, 
                                                            "'MIENTRAS QUE'", 
                                                            null, "'WITH'", 
                                                            "'+'", "'-'", 
                                                            null, "'*'", 
                                                            "'/'", null, 
                                                            "','", "';'", 
                                                            "':'", "'='", 
                                                            null, "'<'", 
                                                            null, null, 
                                                            "'>'", "'('", 
                                                            "')'", "'['", 
                                                            "'(.'", "']'", 
                                                            "'.)'", "'^'", 
                                                            "'@'", "'.'", 
                                                            "'..'", "'{'", 
                                                            "'}'", "'COMO'", 
                                                            "'UNIT'", "'INTERFACE'", 
                                                            "'USES'", null, 
                                                            "'IMPLEMENTATION'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "AND", 
                                                             "ARRAY", "BEGIN", 
                                                             "BOOLEAN", 
                                                             "ENDCASE", 
                                                             "CASE", "CHAR", 
                                                             "CHR", "CONST", 
                                                             "DIV", "DO", 
                                                             "DOWNTO", "ELIF", 
                                                             "ELSE", "OTHERWISE", 
                                                             "END", "FILE", 
                                                             "WITHSTEP", 
                                                             "ENDFOR", "FOR", 
                                                             "FUNCTION", 
                                                             "GOTO", "ENDIF", 
                                                             "IF", "IN", 
                                                             "INTEGER", 
                                                             "LABEL", "MOD", 
                                                             "NIL", "NOT", 
                                                             "OF", "HACER", 
                                                             "OR", "PACKED", 
                                                             "PROCEDURE", 
                                                             "PROGRAM", 
                                                             "ENDPROGRAM", 
                                                             "BREAK", "CONTINUE", 
                                                             "RETURN", "REAL", 
                                                             "RECORD", "REPEAT", 
                                                             "SET", "THEN", 
                                                             "UNTIL", "TO", 
                                                             "TYPE", "DEFINE", 
                                                             "ENDWHILE", 
                                                             "MIENTRASQUE", 
                                                             "WHILE", "WITH", 
                                                             "PLUS", "MINUS", 
                                                             "POWER", "STAR", 
                                                             "SLASH", "ASSIGN", 
                                                             "COMMA", "SEMI", 
                                                             "COLON", "EQUAL", 
                                                             "NOT_EQUAL", 
                                                             "LT", "LE", 
                                                             "GE", "GT", 
                                                             "LPAREN", "RPAREN", 
                                                             "LBRACK", "LBRACK2", 
                                                             "RBRACK", "RBRACK2", 
                                                             "POINTER", 
                                                             "AT", "DOT", 
                                                             "DOTDOT", "LCURLY", 
                                                             "RCURLY", "AS", 
                                                             "UNIT", "INTERFACE", 
                                                             "USES", "STRING", 
                                                             "IMPLEMENTATION", 
                                                             "TRUE", "FALSE", 
                                                             "WRITE", "READ", 
                                                             "WS", "COMMENT_1", 
                                                             "COMMENT_2", 
                                                             "IDENT", "STRING_LITERAL", 
                                                             "NUM_INT", 
                                                             "NUM_REAL" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"program", "programHeading", "identifier", "block", "usesUnitsPart", "labelDeclarationPart", 
		"label", "constantDefinitionPart", "constantDefinition", "constantChr", 
		"constant", "unsignedNumber", "unsignedInteger", "unsignedReal", "sign", 
		"bool_", "string", "typeDefinitionPart", "typeDefinition", "functionType", 
		"procedureType", "type_", "simpleType", "scalarType", "subrangeType", 
		"typeIdentifier", "structuredType", "unpackedStructuredType", "stringtype", 
		"arrayType", "typeList", "indexType", "componentType", "recordType", "fieldList", 
		"fixedPart", "recordSection", "variantPart", "tag", "variant", "setType", 
		"baseType", "fileType", "pointerType", "variableDeclarationPart", "variableDeclaration", 
		"procedureAndFunctionDeclarationPart", "procedureOrFunctionDeclaration", 
		"procedureDeclaration", "formalParameterList", "formalParameterSection", 
		"parameterGroup", "identifierList", "constList", "functionDeclaration", 
		"resultType", "statement", "breakStatement", "continueStatement", "unlabelledStatement", 
		"simpleStatement", "assignmentStatement", "variable", "accessor", "index", 
		"expression", "booleanMultiplicativeExpression", "booleanRelationalExpression", 
		"relationaloperator", "simpleExpression", "additiveoperator", "term", 
		"baseTerm", "multiplicativeoperator", "exponentiationOperator", "signedFactor", 
		"factor", "unsignedConstant", "functionDesignator", "parameterList", "set_", 
		"elementList", "element", "procedureStatement", "actualParameter", "parameterwidth", 
		"gotoStatement", "emptyStatement_", "empty_", "structuredStatement", "compoundStatement", 
		"statements", "conditionalStatement", "ifStatement", "elifStatement", 
		"elseStatement", "caseStatement", "caseListElement", "caseOtherWise", 
		"repetetiveStatement", "whileStatement", "repeatStatement", "forStatement", 
		"forList", "initialValue", "finalValue", "stepValue", "withStatement", 
		"recordVariableList", "writeStatement", "readStatement",
	];
	public get grammarFileName(): string { return "StepCode.g4"; }
	public get literalNames(): (string | null)[] { return StepCodeParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return StepCodeParser.symbolicNames; }
	public get ruleNames(): string[] { return StepCodeParser.ruleNames; }
	public get serializedATN(): number[] { return StepCodeParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, StepCodeParser._ATN, StepCodeParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public program(): ProgramContext {
		let localctx: ProgramContext = new ProgramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, StepCodeParser.RULE_program);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 222;
			this.programHeading();
			this.state = 224;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===83) {
				{
				this.state = 223;
				this.match(StepCodeParser.INTERFACE);
				}
			}

			this.state = 226;
			this.block();
			this.state = 227;
			this.match(StepCodeParser.ENDPROGRAM);
			this.state = 228;
			this.match(StepCodeParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public programHeading(): ProgramHeadingContext {
		let localctx: ProgramHeadingContext = new ProgramHeadingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, StepCodeParser.RULE_programHeading);
		let _la: number;
		try {
			this.state = 240;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 36:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 230;
				this.match(StepCodeParser.PROGRAM);
				this.state = 231;
				this.identifier();
				this.state = 236;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===69) {
					{
					this.state = 232;
					this.match(StepCodeParser.LPAREN);
					this.state = 233;
					this.identifierList();
					this.state = 234;
					this.match(StepCodeParser.RPAREN);
					}
				}

				}
				break;
			case 82:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 238;
				this.match(StepCodeParser.UNIT);
				this.state = 239;
				this.identifier();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public identifier(): IdentifierContext {
		let localctx: IdentifierContext = new IdentifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, StepCodeParser.RULE_identifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 242;
			this.match(StepCodeParser.IDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, StepCodeParser.RULE_block);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 254;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 158335552) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & 418073) !== 0) || ((((_la - 84)) & ~0x1F) === 0 && ((1 << (_la - 84)) & 5221) !== 0)) {
				{
				this.state = 252;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 27:
					{
					this.state = 244;
					this.labelDeclarationPart();
					}
					break;
				case 9:
					{
					this.state = 245;
					this.constantDefinitionPart();
					}
					break;
				case 48:
					{
					this.state = 246;
					this.typeDefinitionPart();
					}
					break;
				case 49:
					{
					this.state = 247;
					this.variableDeclarationPart();
					}
					break;
				case 21:
				case 35:
					{
					this.state = 248;
					this.procedureAndFunctionDeclarationPart();
					}
					break;
				case 84:
					{
					this.state = 249;
					this.usesUnitsPart();
					}
					break;
				case 86:
					{
					this.state = 250;
					this.match(StepCodeParser.IMPLEMENTATION);
					}
					break;
				case 6:
				case 20:
				case 22:
				case 24:
				case 38:
				case 39:
				case 43:
				case 52:
				case 53:
				case 89:
				case 90:
				case 94:
				case 96:
					{
					this.state = 251;
					this.statements();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 256;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public usesUnitsPart(): UsesUnitsPartContext {
		let localctx: UsesUnitsPartContext = new UsesUnitsPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, StepCodeParser.RULE_usesUnitsPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 257;
			this.match(StepCodeParser.USES);
			this.state = 258;
			this.identifierList();
			this.state = 259;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public labelDeclarationPart(): LabelDeclarationPartContext {
		let localctx: LabelDeclarationPartContext = new LabelDeclarationPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, StepCodeParser.RULE_labelDeclarationPart);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 261;
			this.match(StepCodeParser.LABEL);
			this.state = 262;
			this.label();
			this.state = 267;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 263;
				this.match(StepCodeParser.COMMA);
				this.state = 264;
				this.label();
				}
				}
				this.state = 269;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 270;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public label(): LabelContext {
		let localctx: LabelContext = new LabelContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, StepCodeParser.RULE_label);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 272;
			this.unsignedInteger();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public constantDefinitionPart(): ConstantDefinitionPartContext {
		let localctx: ConstantDefinitionPartContext = new ConstantDefinitionPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, StepCodeParser.RULE_constantDefinitionPart);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 274;
			this.match(StepCodeParser.CONST);
			this.state = 278;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 275;
					this.constantDefinition();
					this.state = 276;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 280;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public constantDefinition(): ConstantDefinitionContext {
		let localctx: ConstantDefinitionContext = new ConstantDefinitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, StepCodeParser.RULE_constantDefinition);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 282;
			this.identifier();
			this.state = 283;
			this.match(StepCodeParser.EQUAL);
			this.state = 284;
			this.constant();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public constantChr(): ConstantChrContext {
		let localctx: ConstantChrContext = new ConstantChrContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, StepCodeParser.RULE_constantChr);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 286;
			this.match(StepCodeParser.CHR);
			this.state = 287;
			this.match(StepCodeParser.LPAREN);
			this.state = 288;
			this.unsignedInteger();
			this.state = 289;
			this.match(StepCodeParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public constant(): ConstantContext {
		let localctx: ConstantContext = new ConstantContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, StepCodeParser.RULE_constant);
		try {
			this.state = 301;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 291;
				this.unsignedNumber();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 292;
				this.sign();
				this.state = 293;
				this.unsignedNumber();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 295;
				this.identifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 296;
				this.sign();
				this.state = 297;
				this.identifier();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 299;
				this.string_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 300;
				this.constantChr();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unsignedNumber(): UnsignedNumberContext {
		let localctx: UnsignedNumberContext = new UnsignedNumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, StepCodeParser.RULE_unsignedNumber);
		try {
			this.state = 305;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 96:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 303;
				this.unsignedInteger();
				}
				break;
			case 97:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 304;
				this.unsignedReal();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unsignedInteger(): UnsignedIntegerContext {
		let localctx: UnsignedIntegerContext = new UnsignedIntegerContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, StepCodeParser.RULE_unsignedInteger);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 307;
			this.match(StepCodeParser.NUM_INT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unsignedReal(): UnsignedRealContext {
		let localctx: UnsignedRealContext = new UnsignedRealContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, StepCodeParser.RULE_unsignedReal);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 309;
			this.match(StepCodeParser.NUM_REAL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public sign(): SignContext {
		let localctx: SignContext = new SignContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, StepCodeParser.RULE_sign);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 311;
			_la = this._input.LA(1);
			if(!(_la===54 || _la===55)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public bool_(): Bool_Context {
		let localctx: Bool_Context = new Bool_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 30, StepCodeParser.RULE_bool_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 313;
			_la = this._input.LA(1);
			if(!(_la===87 || _la===88)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public string_(): StringContext {
		let localctx: StringContext = new StringContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, StepCodeParser.RULE_string);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 315;
			this.match(StepCodeParser.STRING_LITERAL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeDefinitionPart(): TypeDefinitionPartContext {
		let localctx: TypeDefinitionPartContext = new TypeDefinitionPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, StepCodeParser.RULE_typeDefinitionPart);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 317;
			this.match(StepCodeParser.TYPE);
			this.state = 321;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 318;
					this.typeDefinition();
					this.state = 319;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 323;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 9, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeDefinition(): TypeDefinitionContext {
		let localctx: TypeDefinitionContext = new TypeDefinitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, StepCodeParser.RULE_typeDefinition);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 325;
			this.identifier();
			this.state = 326;
			this.match(StepCodeParser.EQUAL);
			this.state = 330;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
			case 4:
			case 7:
			case 8:
			case 17:
			case 26:
			case 34:
			case 41:
			case 42:
			case 44:
			case 54:
			case 55:
			case 69:
			case 75:
			case 85:
			case 94:
			case 95:
			case 96:
			case 97:
				{
				this.state = 327;
				this.type_();
				}
				break;
			case 21:
				{
				this.state = 328;
				this.functionType();
				}
				break;
			case 35:
				{
				this.state = 329;
				this.procedureType();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public functionType(): FunctionTypeContext {
		let localctx: FunctionTypeContext = new FunctionTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, StepCodeParser.RULE_functionType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 332;
			this.match(StepCodeParser.FUNCTION);
			this.state = 334;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===69) {
				{
				this.state = 333;
				this.formalParameterList();
				}
			}

			this.state = 336;
			this.match(StepCodeParser.COLON);
			this.state = 337;
			this.resultType();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public procedureType(): ProcedureTypeContext {
		let localctx: ProcedureTypeContext = new ProcedureTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 40, StepCodeParser.RULE_procedureType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 339;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 341;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===69) {
				{
				this.state = 340;
				this.formalParameterList();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_(): Type_Context {
		let localctx: Type_Context = new Type_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 42, StepCodeParser.RULE_type_);
		try {
			this.state = 346;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 7:
			case 8:
			case 26:
			case 41:
			case 54:
			case 55:
			case 69:
			case 85:
			case 94:
			case 95:
			case 96:
			case 97:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 343;
				this.simpleType();
				}
				break;
			case 2:
			case 17:
			case 34:
			case 42:
			case 44:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 344;
				this.structuredType();
				}
				break;
			case 75:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 345;
				this.pointerType();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simpleType(): SimpleTypeContext {
		let localctx: SimpleTypeContext = new SimpleTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 44, StepCodeParser.RULE_simpleType);
		try {
			this.state = 352;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 348;
				this.scalarType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 349;
				this.subrangeType();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 350;
				this.typeIdentifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 351;
				this.stringtype();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public scalarType(): ScalarTypeContext {
		let localctx: ScalarTypeContext = new ScalarTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 46, StepCodeParser.RULE_scalarType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 354;
			this.match(StepCodeParser.LPAREN);
			this.state = 355;
			this.identifierList();
			this.state = 356;
			this.match(StepCodeParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public subrangeType(): SubrangeTypeContext {
		let localctx: SubrangeTypeContext = new SubrangeTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 48, StepCodeParser.RULE_subrangeType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 358;
			this.constant();
			this.state = 359;
			this.match(StepCodeParser.DOTDOT);
			this.state = 360;
			this.constant();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeIdentifier(): TypeIdentifierContext {
		let localctx: TypeIdentifierContext = new TypeIdentifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, StepCodeParser.RULE_typeIdentifier);
		let _la: number;
		try {
			this.state = 364;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 94:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 362;
				this.identifier();
				}
				break;
			case 4:
			case 7:
			case 26:
			case 41:
			case 85:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 363;
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 67109008) !== 0) || _la===41 || _la===85)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structuredType(): StructuredTypeContext {
		let localctx: StructuredTypeContext = new StructuredTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, StepCodeParser.RULE_structuredType);
		try {
			this.state = 369;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 34:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 366;
				this.match(StepCodeParser.PACKED);
				this.state = 367;
				this.unpackedStructuredType();
				}
				break;
			case 2:
			case 17:
			case 42:
			case 44:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 368;
				this.unpackedStructuredType();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unpackedStructuredType(): UnpackedStructuredTypeContext {
		let localctx: UnpackedStructuredTypeContext = new UnpackedStructuredTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 54, StepCodeParser.RULE_unpackedStructuredType);
		try {
			this.state = 375;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 371;
				this.arrayType();
				}
				break;
			case 42:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 372;
				this.recordType();
				}
				break;
			case 44:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 373;
				this.setType();
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 374;
				this.fileType();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public stringtype(): StringtypeContext {
		let localctx: StringtypeContext = new StringtypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, StepCodeParser.RULE_stringtype);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 377;
			this.match(StepCodeParser.STRING);
			this.state = 378;
			this.match(StepCodeParser.LBRACK);
			this.state = 381;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 94:
				{
				this.state = 379;
				this.identifier();
				}
				break;
			case 96:
			case 97:
				{
				this.state = 380;
				this.unsignedNumber();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 383;
			this.match(StepCodeParser.RBRACK);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public arrayType(): ArrayTypeContext {
		let localctx: ArrayTypeContext = new ArrayTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 58, StepCodeParser.RULE_arrayType);
		try {
			this.state = 399;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 385;
				this.match(StepCodeParser.ARRAY);
				this.state = 386;
				this.match(StepCodeParser.LBRACK);
				this.state = 387;
				this.typeList();
				this.state = 388;
				this.match(StepCodeParser.RBRACK);
				this.state = 389;
				this.match(StepCodeParser.OF);
				this.state = 390;
				this.componentType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 392;
				this.match(StepCodeParser.ARRAY);
				this.state = 393;
				this.match(StepCodeParser.LBRACK2);
				this.state = 394;
				this.typeList();
				this.state = 395;
				this.match(StepCodeParser.RBRACK2);
				this.state = 396;
				this.match(StepCodeParser.OF);
				this.state = 397;
				this.componentType();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeList(): TypeListContext {
		let localctx: TypeListContext = new TypeListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 60, StepCodeParser.RULE_typeList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 401;
			this.indexType();
			this.state = 406;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 402;
				this.match(StepCodeParser.COMMA);
				this.state = 403;
				this.indexType();
				}
				}
				this.state = 408;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public indexType(): IndexTypeContext {
		let localctx: IndexTypeContext = new IndexTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 62, StepCodeParser.RULE_indexType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 409;
			this.simpleType();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public componentType(): ComponentTypeContext {
		let localctx: ComponentTypeContext = new ComponentTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 64, StepCodeParser.RULE_componentType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 411;
			this.type_();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public recordType(): RecordTypeContext {
		let localctx: RecordTypeContext = new RecordTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 66, StepCodeParser.RULE_recordType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 413;
			this.match(StepCodeParser.RECORD);
			this.state = 415;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===6 || _la===94) {
				{
				this.state = 414;
				this.fieldList();
				}
			}

			this.state = 417;
			this.match(StepCodeParser.END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fieldList(): FieldListContext {
		let localctx: FieldListContext = new FieldListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 68, StepCodeParser.RULE_fieldList);
		let _la: number;
		try {
			this.state = 425;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 94:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 419;
				this.fixedPart();
				this.state = 422;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===61) {
					{
					this.state = 420;
					this.match(StepCodeParser.SEMI);
					this.state = 421;
					this.variantPart();
					}
				}

				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 424;
				this.variantPart();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fixedPart(): FixedPartContext {
		let localctx: FixedPartContext = new FixedPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 70, StepCodeParser.RULE_fixedPart);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 427;
			this.recordSection();
			this.state = 432;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 428;
					this.match(StepCodeParser.SEMI);
					this.state = 429;
					this.recordSection();
					}
					}
				}
				this.state = 434;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public recordSection(): RecordSectionContext {
		let localctx: RecordSectionContext = new RecordSectionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 72, StepCodeParser.RULE_recordSection);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 435;
			this.identifierList();
			this.state = 436;
			this.match(StepCodeParser.COLON);
			this.state = 437;
			this.type_();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variantPart(): VariantPartContext {
		let localctx: VariantPartContext = new VariantPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 74, StepCodeParser.RULE_variantPart);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 439;
			this.match(StepCodeParser.CASE);
			this.state = 440;
			this.tag();
			this.state = 441;
			this.match(StepCodeParser.OF);
			this.state = 442;
			this.variant();
			this.state = 447;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===61) {
				{
				{
				this.state = 443;
				this.match(StepCodeParser.SEMI);
				this.state = 444;
				this.variant();
				}
				}
				this.state = 449;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public tag(): TagContext {
		let localctx: TagContext = new TagContext(this, this._ctx, this.state);
		this.enterRule(localctx, 76, StepCodeParser.RULE_tag);
		try {
			this.state = 455;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 26, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 450;
				this.identifier();
				this.state = 451;
				this.match(StepCodeParser.COLON);
				this.state = 452;
				this.typeIdentifier();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 454;
				this.typeIdentifier();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variant(): VariantContext {
		let localctx: VariantContext = new VariantContext(this, this._ctx, this.state);
		this.enterRule(localctx, 78, StepCodeParser.RULE_variant);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 457;
			this.constList();
			this.state = 458;
			this.match(StepCodeParser.COLON);
			this.state = 459;
			this.match(StepCodeParser.LPAREN);
			this.state = 460;
			this.fieldList();
			this.state = 461;
			this.match(StepCodeParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public setType(): SetTypeContext {
		let localctx: SetTypeContext = new SetTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 80, StepCodeParser.RULE_setType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 463;
			this.match(StepCodeParser.SET);
			this.state = 464;
			this.match(StepCodeParser.OF);
			this.state = 465;
			this.baseType();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public baseType(): BaseTypeContext {
		let localctx: BaseTypeContext = new BaseTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 82, StepCodeParser.RULE_baseType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 467;
			this.simpleType();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fileType(): FileTypeContext {
		let localctx: FileTypeContext = new FileTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 84, StepCodeParser.RULE_fileType);
		try {
			this.state = 473;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 469;
				this.match(StepCodeParser.FILE);
				this.state = 470;
				this.match(StepCodeParser.OF);
				this.state = 471;
				this.type_();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 472;
				this.match(StepCodeParser.FILE);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public pointerType(): PointerTypeContext {
		let localctx: PointerTypeContext = new PointerTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 86, StepCodeParser.RULE_pointerType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 475;
			this.match(StepCodeParser.POINTER);
			this.state = 476;
			this.typeIdentifier();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variableDeclarationPart(): VariableDeclarationPartContext {
		let localctx: VariableDeclarationPartContext = new VariableDeclarationPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 88, StepCodeParser.RULE_variableDeclarationPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 478;
			this.match(StepCodeParser.DEFINE);
			this.state = 479;
			this.variableDeclaration();
			this.state = 480;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variableDeclaration(): VariableDeclarationContext {
		let localctx: VariableDeclarationContext = new VariableDeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 90, StepCodeParser.RULE_variableDeclaration);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 482;
			this.identifierList();
			this.state = 483;
			this.match(StepCodeParser.AS);
			this.state = 484;
			this.type_();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public procedureAndFunctionDeclarationPart(): ProcedureAndFunctionDeclarationPartContext {
		let localctx: ProcedureAndFunctionDeclarationPartContext = new ProcedureAndFunctionDeclarationPartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 92, StepCodeParser.RULE_procedureAndFunctionDeclarationPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 486;
			this.procedureOrFunctionDeclaration();
			this.state = 487;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public procedureOrFunctionDeclaration(): ProcedureOrFunctionDeclarationContext {
		let localctx: ProcedureOrFunctionDeclarationContext = new ProcedureOrFunctionDeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 94, StepCodeParser.RULE_procedureOrFunctionDeclaration);
		try {
			this.state = 491;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 35:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 489;
				this.procedureDeclaration();
				}
				break;
			case 21:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 490;
				this.functionDeclaration();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public procedureDeclaration(): ProcedureDeclarationContext {
		let localctx: ProcedureDeclarationContext = new ProcedureDeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 96, StepCodeParser.RULE_procedureDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 493;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 494;
			this.identifier();
			this.state = 496;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===69) {
				{
				this.state = 495;
				this.formalParameterList();
				}
			}

			this.state = 498;
			this.match(StepCodeParser.SEMI);
			this.state = 499;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public formalParameterList(): FormalParameterListContext {
		let localctx: FormalParameterListContext = new FormalParameterListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 98, StepCodeParser.RULE_formalParameterList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 501;
			this.match(StepCodeParser.LPAREN);
			this.state = 502;
			this.formalParameterSection();
			this.state = 507;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===61) {
				{
				{
				this.state = 503;
				this.match(StepCodeParser.SEMI);
				this.state = 504;
				this.formalParameterSection();
				}
				}
				this.state = 509;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 510;
			this.match(StepCodeParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public formalParameterSection(): FormalParameterSectionContext {
		let localctx: FormalParameterSectionContext = new FormalParameterSectionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 100, StepCodeParser.RULE_formalParameterSection);
		try {
			this.state = 519;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 94:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 512;
				this.parameterGroup();
				}
				break;
			case 49:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 513;
				this.match(StepCodeParser.DEFINE);
				this.state = 514;
				this.parameterGroup();
				}
				break;
			case 21:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 515;
				this.match(StepCodeParser.FUNCTION);
				this.state = 516;
				this.parameterGroup();
				}
				break;
			case 35:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 517;
				this.match(StepCodeParser.PROCEDURE);
				this.state = 518;
				this.parameterGroup();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameterGroup(): ParameterGroupContext {
		let localctx: ParameterGroupContext = new ParameterGroupContext(this, this._ctx, this.state);
		this.enterRule(localctx, 102, StepCodeParser.RULE_parameterGroup);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 521;
			this.identifierList();
			this.state = 522;
			this.match(StepCodeParser.COLON);
			this.state = 523;
			this.typeIdentifier();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public identifierList(): IdentifierListContext {
		let localctx: IdentifierListContext = new IdentifierListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 104, StepCodeParser.RULE_identifierList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 525;
			this.identifier();
			this.state = 530;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 526;
				this.match(StepCodeParser.COMMA);
				this.state = 527;
				this.identifier();
				}
				}
				this.state = 532;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public constList(): ConstListContext {
		let localctx: ConstListContext = new ConstListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 106, StepCodeParser.RULE_constList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 533;
			this.constant();
			this.state = 538;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 534;
				this.match(StepCodeParser.COMMA);
				this.state = 535;
				this.constant();
				}
				}
				this.state = 540;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public functionDeclaration(): FunctionDeclarationContext {
		let localctx: FunctionDeclarationContext = new FunctionDeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 108, StepCodeParser.RULE_functionDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 541;
			this.match(StepCodeParser.FUNCTION);
			this.state = 542;
			this.identifier();
			this.state = 544;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===69) {
				{
				this.state = 543;
				this.formalParameterList();
				}
			}

			this.state = 546;
			this.match(StepCodeParser.COLON);
			this.state = 547;
			this.resultType();
			this.state = 548;
			this.match(StepCodeParser.SEMI);
			this.state = 549;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public resultType(): ResultTypeContext {
		let localctx: ResultTypeContext = new ResultTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 110, StepCodeParser.RULE_resultType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 551;
			this.typeIdentifier();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let localctx: StatementContext = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 112, StepCodeParser.RULE_statement);
		try {
			this.state = 562;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 96:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 553;
				this.label();
				this.state = 554;
				this.match(StepCodeParser.COLON);
				this.state = 555;
				this.unlabelledStatement();
				}
				break;
			case 6:
			case 20:
			case 22:
			case 24:
			case 43:
			case 52:
			case 53:
			case 94:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 557;
				this.unlabelledStatement();
				}
				break;
			case 89:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 558;
				this.writeStatement();
				}
				break;
			case 90:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 559;
				this.readStatement();
				}
				break;
			case 38:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 560;
				this.breakStatement();
				}
				break;
			case 39:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 561;
				this.continueStatement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public breakStatement(): BreakStatementContext {
		let localctx: BreakStatementContext = new BreakStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 114, StepCodeParser.RULE_breakStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 564;
			this.match(StepCodeParser.BREAK);
			this.state = 565;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public continueStatement(): ContinueStatementContext {
		let localctx: ContinueStatementContext = new ContinueStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 116, StepCodeParser.RULE_continueStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 567;
			this.match(StepCodeParser.CONTINUE);
			this.state = 568;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unlabelledStatement(): UnlabelledStatementContext {
		let localctx: UnlabelledStatementContext = new UnlabelledStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 118, StepCodeParser.RULE_unlabelledStatement);
		try {
			this.state = 572;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 22:
			case 94:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 570;
				this.simpleStatement();
				}
				break;
			case 6:
			case 20:
			case 24:
			case 43:
			case 52:
			case 53:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 571;
				this.structuredStatement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simpleStatement(): SimpleStatementContext {
		let localctx: SimpleStatementContext = new SimpleStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 120, StepCodeParser.RULE_simpleStatement);
		try {
			this.state = 577;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 37, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 574;
				this.assignmentStatement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 575;
				this.procedureStatement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 576;
				this.gotoStatement();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignmentStatement(): AssignmentStatementContext {
		let localctx: AssignmentStatementContext = new AssignmentStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 122, StepCodeParser.RULE_assignmentStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 579;
			this.variable();
			this.state = 580;
			this.match(StepCodeParser.ASSIGN);
			this.state = 581;
			this.expression(0);
			this.state = 582;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variable(): VariableContext {
		let localctx: VariableContext = new VariableContext(this, this._ctx, this.state);
		this.enterRule(localctx, 124, StepCodeParser.RULE_variable);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 584;
			this.identifier();
			this.state = 588;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 585;
					this.accessor();
					}
					}
				}
				this.state = 590;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public accessor(): AccessorContext {
		let localctx: AccessorContext = new AccessorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 126, StepCodeParser.RULE_accessor);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 591;
			this.index();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public index(): IndexContext {
		let localctx: IndexContext = new IndexContext(this, this._ctx, this.state);
		this.enterRule(localctx, 128, StepCodeParser.RULE_index);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 593;
			this.match(StepCodeParser.LBRACK);
			this.state = 594;
			this.expression(0);
			this.state = 595;
			this.match(StepCodeParser.RBRACK);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, _parentState);
		let _prevctx: ExpressionContext = localctx;
		let _startState: number = 130;
		this.enterRecursionRule(localctx, 130, StepCodeParser.RULE_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 598;
			this.booleanMultiplicativeExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 605;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 39, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new ExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_expression);
					this.state = 600;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 601;
					this.match(StepCodeParser.OR);
					this.state = 602;
					this.expression(2);
					}
					}
				}
				this.state = 607;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 39, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}

	public booleanMultiplicativeExpression(): BooleanMultiplicativeExpressionContext;
	public booleanMultiplicativeExpression(_p: number): BooleanMultiplicativeExpressionContext;
	// @RuleVersion(0)
	public booleanMultiplicativeExpression(_p?: number): BooleanMultiplicativeExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: BooleanMultiplicativeExpressionContext = new BooleanMultiplicativeExpressionContext(this, this._ctx, _parentState);
		let _prevctx: BooleanMultiplicativeExpressionContext = localctx;
		let _startState: number = 132;
		this.enterRecursionRule(localctx, 132, StepCodeParser.RULE_booleanMultiplicativeExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 609;
			this.booleanRelationalExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 616;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 40, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new BooleanMultiplicativeExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_booleanMultiplicativeExpression);
					this.state = 611;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 612;
					this.match(StepCodeParser.AND);
					this.state = 613;
					this.booleanMultiplicativeExpression(2);
					}
					}
				}
				this.state = 618;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 40, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}

	public booleanRelationalExpression(): BooleanRelationalExpressionContext;
	public booleanRelationalExpression(_p: number): BooleanRelationalExpressionContext;
	// @RuleVersion(0)
	public booleanRelationalExpression(_p?: number): BooleanRelationalExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: BooleanRelationalExpressionContext = new BooleanRelationalExpressionContext(this, this._ctx, _parentState);
		let _prevctx: BooleanRelationalExpressionContext = localctx;
		let _startState: number = 134;
		this.enterRecursionRule(localctx, 134, StepCodeParser.RULE_booleanRelationalExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 620;
			this.simpleExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 628;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 41, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new BooleanRelationalExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_booleanRelationalExpression);
					this.state = 622;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 623;
					this.relationaloperator();
					this.state = 624;
					this.booleanRelationalExpression(2);
					}
					}
				}
				this.state = 630;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 41, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public relationaloperator(): RelationaloperatorContext {
		let localctx: RelationaloperatorContext = new RelationaloperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 136, StepCodeParser.RULE_relationaloperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 631;
			_la = this._input.LA(1);
			if(!(_la===25 || ((((_la - 63)) & ~0x1F) === 0 && ((1 << (_la - 63)) & 63) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public simpleExpression(): SimpleExpressionContext;
	public simpleExpression(_p: number): SimpleExpressionContext;
	// @RuleVersion(0)
	public simpleExpression(_p?: number): SimpleExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: SimpleExpressionContext = new SimpleExpressionContext(this, this._ctx, _parentState);
		let _prevctx: SimpleExpressionContext = localctx;
		let _startState: number = 138;
		this.enterRecursionRule(localctx, 138, StepCodeParser.RULE_simpleExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 634;
			this.term(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 642;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new SimpleExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_simpleExpression);
					this.state = 636;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 637;
					this.additiveoperator();
					this.state = 638;
					this.simpleExpression(2);
					}
					}
				}
				this.state = 644;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public additiveoperator(): AdditiveoperatorContext {
		let localctx: AdditiveoperatorContext = new AdditiveoperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 140, StepCodeParser.RULE_additiveoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 645;
			_la = this._input.LA(1);
			if(!(_la===54 || _la===55)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public term(): TermContext;
	public term(_p: number): TermContext;
	// @RuleVersion(0)
	public term(_p?: number): TermContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: TermContext = new TermContext(this, this._ctx, _parentState);
		let _prevctx: TermContext = localctx;
		let _startState: number = 142;
		this.enterRecursionRule(localctx, 142, StepCodeParser.RULE_term, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 648;
			this.baseTerm(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 656;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 43, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new TermContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_term);
					this.state = 650;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 651;
					this.multiplicativeoperator();
					this.state = 652;
					this.term(2);
					}
					}
				}
				this.state = 658;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 43, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}

	public baseTerm(): BaseTermContext;
	public baseTerm(_p: number): BaseTermContext;
	// @RuleVersion(0)
	public baseTerm(_p?: number): BaseTermContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: BaseTermContext = new BaseTermContext(this, this._ctx, _parentState);
		let _prevctx: BaseTermContext = localctx;
		let _startState: number = 144;
		this.enterRecursionRule(localctx, 144, StepCodeParser.RULE_baseTerm, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 660;
			this.signedFactor();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 668;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 44, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new BaseTermContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_baseTerm);
					this.state = 662;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 663;
					this.exponentiationOperator();
					this.state = 664;
					this.baseTerm(2);
					}
					}
				}
				this.state = 670;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 44, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public multiplicativeoperator(): MultiplicativeoperatorContext {
		let localctx: MultiplicativeoperatorContext = new MultiplicativeoperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 146, StepCodeParser.RULE_multiplicativeoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 671;
			_la = this._input.LA(1);
			if(!(_la===10 || _la===28 || _la===57 || _la===58)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public exponentiationOperator(): ExponentiationOperatorContext {
		let localctx: ExponentiationOperatorContext = new ExponentiationOperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 148, StepCodeParser.RULE_exponentiationOperator);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 673;
			this.match(StepCodeParser.POWER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public signedFactor(): SignedFactorContext {
		let localctx: SignedFactorContext = new SignedFactorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 150, StepCodeParser.RULE_signedFactor);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 676;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===54 || _la===55) {
				{
				this.state = 675;
				_la = this._input.LA(1);
				if(!(_la===54 || _la===55)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
			}

			this.state = 678;
			this.factor();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public factor(): FactorContext {
		let localctx: FactorContext = new FactorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 152, StepCodeParser.RULE_factor);
		try {
			this.state = 691;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 46, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 680;
				this.variable();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 681;
				this.match(StepCodeParser.LPAREN);
				this.state = 682;
				this.expression(0);
				this.state = 683;
				this.match(StepCodeParser.RPAREN);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 685;
				this.functionDesignator();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 686;
				this.unsignedConstant();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 687;
				this.set_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 688;
				this.match(StepCodeParser.NOT);
				this.state = 689;
				this.factor();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 690;
				this.bool_();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unsignedConstant(): UnsignedConstantContext {
		let localctx: UnsignedConstantContext = new UnsignedConstantContext(this, this._ctx, this.state);
		this.enterRule(localctx, 154, StepCodeParser.RULE_unsignedConstant);
		try {
			this.state = 697;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 96:
			case 97:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 693;
				this.unsignedNumber();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 694;
				this.constantChr();
				}
				break;
			case 95:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 695;
				this.string_();
				}
				break;
			case 29:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 696;
				this.match(StepCodeParser.NIL);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public functionDesignator(): FunctionDesignatorContext {
		let localctx: FunctionDesignatorContext = new FunctionDesignatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 156, StepCodeParser.RULE_functionDesignator);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 699;
			this.identifier();
			this.state = 700;
			this.match(StepCodeParser.LPAREN);
			this.state = 701;
			this.parameterList();
			this.state = 702;
			this.match(StepCodeParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameterList(): ParameterListContext {
		let localctx: ParameterListContext = new ParameterListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 158, StepCodeParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 704;
			this.actualParameter();
			this.state = 709;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 705;
				this.match(StepCodeParser.COMMA);
				this.state = 706;
				this.actualParameter();
				}
				}
				this.state = 711;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public set_(): Set_Context {
		let localctx: Set_Context = new Set_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 160, StepCodeParser.RULE_set_);
		try {
			this.state = 720;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 71:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 712;
				this.match(StepCodeParser.LBRACK);
				this.state = 713;
				this.elementList();
				this.state = 714;
				this.match(StepCodeParser.RBRACK);
				}
				break;
			case 72:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 716;
				this.match(StepCodeParser.LBRACK2);
				this.state = 717;
				this.elementList();
				this.state = 718;
				this.match(StepCodeParser.RBRACK2);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public elementList(): ElementListContext {
		let localctx: ElementListContext = new ElementListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 162, StepCodeParser.RULE_elementList);
		let _la: number;
		try {
			this.state = 731;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 8:
			case 29:
			case 30:
			case 54:
			case 55:
			case 69:
			case 71:
			case 72:
			case 87:
			case 88:
			case 94:
			case 95:
			case 96:
			case 97:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 722;
				this.element();
				this.state = 727;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===60) {
					{
					{
					this.state = 723;
					this.match(StepCodeParser.COMMA);
					this.state = 724;
					this.element();
					}
					}
					this.state = 729;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			case 73:
			case 74:
				this.enterOuterAlt(localctx, 2);
				// tslint:disable-next-line:no-empty
				{
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public element(): ElementContext {
		let localctx: ElementContext = new ElementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 164, StepCodeParser.RULE_element);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 733;
			this.expression(0);
			this.state = 736;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===78) {
				{
				this.state = 734;
				this.match(StepCodeParser.DOTDOT);
				this.state = 735;
				this.expression(0);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public procedureStatement(): ProcedureStatementContext {
		let localctx: ProcedureStatementContext = new ProcedureStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 166, StepCodeParser.RULE_procedureStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 738;
			this.identifier();
			this.state = 743;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===69) {
				{
				this.state = 739;
				this.match(StepCodeParser.LPAREN);
				this.state = 740;
				this.parameterList();
				this.state = 741;
				this.match(StepCodeParser.RPAREN);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public actualParameter(): ActualParameterContext {
		let localctx: ActualParameterContext = new ActualParameterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 168, StepCodeParser.RULE_actualParameter);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 745;
			this.expression(0);
			this.state = 749;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===62) {
				{
				{
				this.state = 746;
				this.parameterwidth();
				}
				}
				this.state = 751;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameterwidth(): ParameterwidthContext {
		let localctx: ParameterwidthContext = new ParameterwidthContext(this, this._ctx, this.state);
		this.enterRule(localctx, 170, StepCodeParser.RULE_parameterwidth);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 752;
			this.match(StepCodeParser.COLON);
			this.state = 753;
			this.expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public gotoStatement(): GotoStatementContext {
		let localctx: GotoStatementContext = new GotoStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 172, StepCodeParser.RULE_gotoStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 755;
			this.match(StepCodeParser.GOTO);
			this.state = 756;
			this.label();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public emptyStatement_(): EmptyStatement_Context {
		let localctx: EmptyStatement_Context = new EmptyStatement_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 174, StepCodeParser.RULE_emptyStatement_);
		try {
			this.enterOuterAlt(localctx, 1);
			// tslint:disable-next-line:no-empty
			{
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public empty_(): Empty_Context {
		let localctx: Empty_Context = new Empty_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 176, StepCodeParser.RULE_empty_);
		try {
			this.enterOuterAlt(localctx, 1);
			// tslint:disable-next-line:no-empty
			{
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structuredStatement(): StructuredStatementContext {
		let localctx: StructuredStatementContext = new StructuredStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 178, StepCodeParser.RULE_structuredStatement);
		try {
			this.state = 765;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 6:
			case 24:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 762;
				this.conditionalStatement();
				}
				break;
			case 20:
			case 43:
			case 52:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 763;
				this.repetetiveStatement();
				}
				break;
			case 53:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 764;
				this.withStatement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compoundStatement(): CompoundStatementContext {
		let localctx: CompoundStatementContext = new CompoundStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 180, StepCodeParser.RULE_compoundStatement);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 770;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 767;
					this.statements();
					}
					}
				}
				this.state = 772;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statements(): StatementsContext {
		let localctx: StatementsContext = new StatementsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 182, StepCodeParser.RULE_statements);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 773;
			this.statement();
			this.state = 778;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 774;
					this.match(StepCodeParser.SEMI);
					this.state = 775;
					this.statement();
					}
					}
				}
				this.state = 780;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
			}
			this.state = 782;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 58, this._ctx) ) {
			case 1:
				{
				this.state = 781;
				this.match(StepCodeParser.SEMI);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public conditionalStatement(): ConditionalStatementContext {
		let localctx: ConditionalStatementContext = new ConditionalStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 184, StepCodeParser.RULE_conditionalStatement);
		try {
			this.state = 786;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 24:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 784;
				this.ifStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 785;
				this.caseStatement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public ifStatement(): IfStatementContext {
		let localctx: IfStatementContext = new IfStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 186, StepCodeParser.RULE_ifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 788;
			this.match(StepCodeParser.IF);
			this.state = 789;
			this.expression(0);
			this.state = 790;
			this.match(StepCodeParser.THEN);
			this.state = 791;
			this.compoundStatement();
			this.state = 796;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 13:
				{
				this.state = 792;
				this.elifStatement();
				}
				break;
			case 14:
			case 23:
				{
				this.state = 794;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 793;
					this.elseStatement();
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 798;
			this.match(StepCodeParser.ENDIF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public elifStatement(): ElifStatementContext {
		let localctx: ElifStatementContext = new ElifStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 188, StepCodeParser.RULE_elifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 800;
			this.match(StepCodeParser.ELIF);
			this.state = 801;
			this.expression(0);
			this.state = 802;
			this.match(StepCodeParser.THEN);
			this.state = 803;
			this.compoundStatement();
			this.state = 809;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 63, this._ctx) ) {
			case 1:
				{
				this.state = 804;
				this.elifStatement();
				}
				break;
			case 2:
				{
				this.state = 806;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 805;
					this.elseStatement();
					}
				}

				}
				break;
			case 3:
				{
				this.state = 808;
				this.match(StepCodeParser.ENDIF);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public elseStatement(): ElseStatementContext {
		let localctx: ElseStatementContext = new ElseStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 190, StepCodeParser.RULE_elseStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 811;
			this.match(StepCodeParser.ELSE);
			this.state = 812;
			this.compoundStatement();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public caseStatement(): CaseStatementContext {
		let localctx: CaseStatementContext = new CaseStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 192, StepCodeParser.RULE_caseStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 814;
			this.match(StepCodeParser.CASE);
			this.state = 815;
			this.expression(0);
			this.state = 816;
			_la = this._input.LA(1);
			if(!(_la===31 || _la===32)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 820;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8 || _la===54 || _la===55 || ((((_la - 94)) & ~0x1F) === 0 && ((1 << (_la - 94)) & 15) !== 0)) {
				{
				{
				this.state = 817;
				this.caseListElement();
				}
				}
				this.state = 822;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 824;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14 || _la===15) {
				{
				this.state = 823;
				this.caseOtherWise();
				}
			}

			this.state = 826;
			this.match(StepCodeParser.ENDCASE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public caseListElement(): CaseListElementContext {
		let localctx: CaseListElementContext = new CaseListElementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 194, StepCodeParser.RULE_caseListElement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 828;
			this.constList();
			this.state = 829;
			_la = this._input.LA(1);
			if(!(_la===62 || _la===81)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 830;
			this.compoundStatement();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public caseOtherWise(): CaseOtherWiseContext {
		let localctx: CaseOtherWiseContext = new CaseOtherWiseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 196, StepCodeParser.RULE_caseOtherWise);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 835;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				{
				this.state = 832;
				this.match(StepCodeParser.ELSE);
				}
				break;
			case 15:
				{
				{
				this.state = 833;
				this.match(StepCodeParser.OTHERWISE);
				this.state = 834;
				this.match(StepCodeParser.COLON);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 837;
			this.compoundStatement();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public repetetiveStatement(): RepetetiveStatementContext {
		let localctx: RepetetiveStatementContext = new RepetetiveStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 198, StepCodeParser.RULE_repetetiveStatement);
		try {
			this.state = 842;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 52:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 839;
				this.whileStatement();
				}
				break;
			case 43:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 840;
				this.repeatStatement();
				}
				break;
			case 20:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 841;
				this.forStatement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public whileStatement(): WhileStatementContext {
		let localctx: WhileStatementContext = new WhileStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 200, StepCodeParser.RULE_whileStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 844;
			this.match(StepCodeParser.WHILE);
			this.state = 845;
			this.expression(0);
			this.state = 846;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===32)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 847;
			this.compoundStatement();
			this.state = 848;
			this.match(StepCodeParser.ENDWHILE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public repeatStatement(): RepeatStatementContext {
		let localctx: RepeatStatementContext = new RepeatStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 202, StepCodeParser.RULE_repeatStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 850;
			this.match(StepCodeParser.REPEAT);
			this.state = 851;
			this.compoundStatement();
			this.state = 852;
			_la = this._input.LA(1);
			if(!(_la===46 || _la===51)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 853;
			this.expression(0);
			this.state = 854;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public forStatement(): ForStatementContext {
		let localctx: ForStatementContext = new ForStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 204, StepCodeParser.RULE_forStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 856;
			this.match(StepCodeParser.FOR);
			this.state = 857;
			this.identifier();
			this.state = 858;
			this.match(StepCodeParser.ASSIGN);
			this.state = 859;
			this.forList();
			this.state = 862;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===18) {
				{
				this.state = 860;
				this.match(StepCodeParser.WITHSTEP);
				this.state = 861;
				this.stepValue();
				}
			}

			this.state = 864;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===32)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 865;
			this.compoundStatement();
			this.state = 866;
			this.match(StepCodeParser.ENDFOR);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public forList(): ForListContext {
		let localctx: ForListContext = new ForListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 206, StepCodeParser.RULE_forList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 868;
			this.initialValue();
			this.state = 869;
			_la = this._input.LA(1);
			if(!(_la===12 || _la===47)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 870;
			this.finalValue();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public initialValue(): InitialValueContext {
		let localctx: InitialValueContext = new InitialValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 208, StepCodeParser.RULE_initialValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 872;
			this.expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public finalValue(): FinalValueContext {
		let localctx: FinalValueContext = new FinalValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 210, StepCodeParser.RULE_finalValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 874;
			this.expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public stepValue(): StepValueContext {
		let localctx: StepValueContext = new StepValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 212, StepCodeParser.RULE_stepValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 876;
			this.expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public withStatement(): WithStatementContext {
		let localctx: WithStatementContext = new WithStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 214, StepCodeParser.RULE_withStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 878;
			this.match(StepCodeParser.WITH);
			this.state = 879;
			this.recordVariableList();
			this.state = 880;
			this.match(StepCodeParser.DO);
			this.state = 881;
			this.statement();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public recordVariableList(): RecordVariableListContext {
		let localctx: RecordVariableListContext = new RecordVariableListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 216, StepCodeParser.RULE_recordVariableList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 883;
			this.variable();
			this.state = 888;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 884;
				this.match(StepCodeParser.COMMA);
				this.state = 885;
				this.variable();
				}
				}
				this.state = 890;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public writeStatement(): WriteStatementContext {
		let localctx: WriteStatementContext = new WriteStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 218, StepCodeParser.RULE_writeStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 891;
			this.match(StepCodeParser.WRITE);
			this.state = 892;
			this.expression(0);
			this.state = 897;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 893;
				this.match(StepCodeParser.COMMA);
				this.state = 894;
				this.expression(0);
				}
				}
				this.state = 899;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 900;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public readStatement(): ReadStatementContext {
		let localctx: ReadStatementContext = new ReadStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 220, StepCodeParser.RULE_readStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 902;
			this.match(StepCodeParser.READ);
			this.state = 903;
			this.variable();
			this.state = 908;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===60) {
				{
				{
				this.state = 904;
				this.match(StepCodeParser.COMMA);
				this.state = 905;
				this.variable();
				}
				}
				this.state = 910;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 911;
			this.match(StepCodeParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 65:
			return this.expression_sempred(localctx as ExpressionContext, predIndex);
		case 66:
			return this.booleanMultiplicativeExpression_sempred(localctx as BooleanMultiplicativeExpressionContext, predIndex);
		case 67:
			return this.booleanRelationalExpression_sempred(localctx as BooleanRelationalExpressionContext, predIndex);
		case 69:
			return this.simpleExpression_sempred(localctx as SimpleExpressionContext, predIndex);
		case 71:
			return this.term_sempred(localctx as TermContext, predIndex);
		case 72:
			return this.baseTerm_sempred(localctx as BaseTermContext, predIndex);
		}
		return true;
	}
	private expression_sempred(localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private booleanMultiplicativeExpression_sempred(localctx: BooleanMultiplicativeExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private booleanRelationalExpression_sempred(localctx: BooleanRelationalExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private simpleExpression_sempred(localctx: SimpleExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private term_sempred(localctx: TermContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private baseTerm_sempred(localctx: BaseTermContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,97,914,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,
	2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,
	39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,
	7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,2,53,7,
	53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,60,7,60,
	2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,2,66,7,66,2,67,7,67,2,
	68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,72,7,72,2,73,7,73,2,74,7,74,2,75,
	7,75,2,76,7,76,2,77,7,77,2,78,7,78,2,79,7,79,2,80,7,80,2,81,7,81,2,82,7,
	82,2,83,7,83,2,84,7,84,2,85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,89,7,89,
	2,90,7,90,2,91,7,91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,7,96,2,
	97,7,97,2,98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,2,102,7,102,2,103,7,
	103,2,104,7,104,2,105,7,105,2,106,7,106,2,107,7,107,2,108,7,108,2,109,7,
	109,2,110,7,110,1,0,1,0,3,0,225,8,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,
	1,1,3,1,237,8,1,1,1,1,1,3,1,241,8,1,1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,
	1,3,5,3,253,8,3,10,3,12,3,256,9,3,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,5,5,266,
	8,5,10,5,12,5,269,9,5,1,5,1,5,1,6,1,6,1,7,1,7,1,7,1,7,4,7,279,8,7,11,7,
	12,7,280,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,10,1,10,1,10,1,10,1,10,1,
	10,1,10,1,10,1,10,1,10,3,10,302,8,10,1,11,1,11,3,11,306,8,11,1,12,1,12,
	1,13,1,13,1,14,1,14,1,15,1,15,1,16,1,16,1,17,1,17,1,17,1,17,4,17,322,8,
	17,11,17,12,17,323,1,18,1,18,1,18,1,18,1,18,3,18,331,8,18,1,19,1,19,3,19,
	335,8,19,1,19,1,19,1,19,1,20,1,20,3,20,342,8,20,1,21,1,21,1,21,3,21,347,
	8,21,1,22,1,22,1,22,1,22,3,22,353,8,22,1,23,1,23,1,23,1,23,1,24,1,24,1,
	24,1,24,1,25,1,25,3,25,365,8,25,1,26,1,26,1,26,3,26,370,8,26,1,27,1,27,
	1,27,1,27,3,27,376,8,27,1,28,1,28,1,28,1,28,3,28,382,8,28,1,28,1,28,1,29,
	1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,3,29,400,
	8,29,1,30,1,30,1,30,5,30,405,8,30,10,30,12,30,408,9,30,1,31,1,31,1,32,1,
	32,1,33,1,33,3,33,416,8,33,1,33,1,33,1,34,1,34,1,34,3,34,423,8,34,1,34,
	3,34,426,8,34,1,35,1,35,1,35,5,35,431,8,35,10,35,12,35,434,9,35,1,36,1,
	36,1,36,1,36,1,37,1,37,1,37,1,37,1,37,1,37,5,37,446,8,37,10,37,12,37,449,
	9,37,1,38,1,38,1,38,1,38,1,38,3,38,456,8,38,1,39,1,39,1,39,1,39,1,39,1,
	39,1,40,1,40,1,40,1,40,1,41,1,41,1,42,1,42,1,42,1,42,3,42,474,8,42,1,43,
	1,43,1,43,1,44,1,44,1,44,1,44,1,45,1,45,1,45,1,45,1,46,1,46,1,46,1,47,1,
	47,3,47,492,8,47,1,48,1,48,1,48,3,48,497,8,48,1,48,1,48,1,48,1,49,1,49,
	1,49,1,49,5,49,506,8,49,10,49,12,49,509,9,49,1,49,1,49,1,50,1,50,1,50,1,
	50,1,50,1,50,1,50,3,50,520,8,50,1,51,1,51,1,51,1,51,1,52,1,52,1,52,5,52,
	529,8,52,10,52,12,52,532,9,52,1,53,1,53,1,53,5,53,537,8,53,10,53,12,53,
	540,9,53,1,54,1,54,1,54,3,54,545,8,54,1,54,1,54,1,54,1,54,1,54,1,55,1,55,
	1,56,1,56,1,56,1,56,1,56,1,56,1,56,1,56,1,56,3,56,563,8,56,1,57,1,57,1,
	57,1,58,1,58,1,58,1,59,1,59,3,59,573,8,59,1,60,1,60,1,60,3,60,578,8,60,
	1,61,1,61,1,61,1,61,1,61,1,62,1,62,5,62,587,8,62,10,62,12,62,590,9,62,1,
	63,1,63,1,64,1,64,1,64,1,64,1,65,1,65,1,65,1,65,1,65,1,65,5,65,604,8,65,
	10,65,12,65,607,9,65,1,66,1,66,1,66,1,66,1,66,1,66,5,66,615,8,66,10,66,
	12,66,618,9,66,1,67,1,67,1,67,1,67,1,67,1,67,1,67,5,67,627,8,67,10,67,12,
	67,630,9,67,1,68,1,68,1,69,1,69,1,69,1,69,1,69,1,69,1,69,5,69,641,8,69,
	10,69,12,69,644,9,69,1,70,1,70,1,71,1,71,1,71,1,71,1,71,1,71,1,71,5,71,
	655,8,71,10,71,12,71,658,9,71,1,72,1,72,1,72,1,72,1,72,1,72,1,72,5,72,667,
	8,72,10,72,12,72,670,9,72,1,73,1,73,1,74,1,74,1,75,3,75,677,8,75,1,75,1,
	75,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,3,76,692,8,76,
	1,77,1,77,1,77,1,77,3,77,698,8,77,1,78,1,78,1,78,1,78,1,78,1,79,1,79,1,
	79,5,79,708,8,79,10,79,12,79,711,9,79,1,80,1,80,1,80,1,80,1,80,1,80,1,80,
	1,80,3,80,721,8,80,1,81,1,81,1,81,5,81,726,8,81,10,81,12,81,729,9,81,1,
	81,3,81,732,8,81,1,82,1,82,1,82,3,82,737,8,82,1,83,1,83,1,83,1,83,1,83,
	3,83,744,8,83,1,84,1,84,5,84,748,8,84,10,84,12,84,751,9,84,1,85,1,85,1,
	85,1,86,1,86,1,86,1,87,1,87,1,88,1,88,1,89,1,89,1,89,3,89,766,8,89,1,90,
	5,90,769,8,90,10,90,12,90,772,9,90,1,91,1,91,1,91,5,91,777,8,91,10,91,12,
	91,780,9,91,1,91,3,91,783,8,91,1,92,1,92,3,92,787,8,92,1,93,1,93,1,93,1,
	93,1,93,1,93,3,93,795,8,93,3,93,797,8,93,1,93,1,93,1,94,1,94,1,94,1,94,
	1,94,1,94,3,94,807,8,94,1,94,3,94,810,8,94,1,95,1,95,1,95,1,96,1,96,1,96,
	1,96,5,96,819,8,96,10,96,12,96,822,9,96,1,96,3,96,825,8,96,1,96,1,96,1,
	97,1,97,1,97,1,97,1,98,1,98,1,98,3,98,836,8,98,1,98,1,98,1,99,1,99,1,99,
	3,99,843,8,99,1,100,1,100,1,100,1,100,1,100,1,100,1,101,1,101,1,101,1,101,
	1,101,1,101,1,102,1,102,1,102,1,102,1,102,1,102,3,102,863,8,102,1,102,1,
	102,1,102,1,102,1,103,1,103,1,103,1,103,1,104,1,104,1,105,1,105,1,106,1,
	106,1,107,1,107,1,107,1,107,1,107,1,108,1,108,1,108,5,108,887,8,108,10,
	108,12,108,890,9,108,1,109,1,109,1,109,1,109,5,109,896,8,109,10,109,12,
	109,899,9,109,1,109,1,109,1,110,1,110,1,110,1,110,5,110,907,8,110,10,110,
	12,110,910,9,110,1,110,1,110,1,110,0,6,130,132,134,138,142,144,111,0,2,
	4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,
	54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,
	102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,
	138,140,142,144,146,148,150,152,154,156,158,160,162,164,166,168,170,172,
	174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,206,208,
	210,212,214,216,218,220,0,10,1,0,54,55,1,0,87,88,5,0,4,4,7,7,26,26,41,41,
	85,85,2,0,25,25,63,68,3,0,10,10,28,28,57,58,1,0,31,32,2,0,62,62,81,81,2,
	0,11,11,32,32,2,0,46,46,51,51,2,0,12,12,47,47,907,0,222,1,0,0,0,2,240,1,
	0,0,0,4,242,1,0,0,0,6,254,1,0,0,0,8,257,1,0,0,0,10,261,1,0,0,0,12,272,1,
	0,0,0,14,274,1,0,0,0,16,282,1,0,0,0,18,286,1,0,0,0,20,301,1,0,0,0,22,305,
	1,0,0,0,24,307,1,0,0,0,26,309,1,0,0,0,28,311,1,0,0,0,30,313,1,0,0,0,32,
	315,1,0,0,0,34,317,1,0,0,0,36,325,1,0,0,0,38,332,1,0,0,0,40,339,1,0,0,0,
	42,346,1,0,0,0,44,352,1,0,0,0,46,354,1,0,0,0,48,358,1,0,0,0,50,364,1,0,
	0,0,52,369,1,0,0,0,54,375,1,0,0,0,56,377,1,0,0,0,58,399,1,0,0,0,60,401,
	1,0,0,0,62,409,1,0,0,0,64,411,1,0,0,0,66,413,1,0,0,0,68,425,1,0,0,0,70,
	427,1,0,0,0,72,435,1,0,0,0,74,439,1,0,0,0,76,455,1,0,0,0,78,457,1,0,0,0,
	80,463,1,0,0,0,82,467,1,0,0,0,84,473,1,0,0,0,86,475,1,0,0,0,88,478,1,0,
	0,0,90,482,1,0,0,0,92,486,1,0,0,0,94,491,1,0,0,0,96,493,1,0,0,0,98,501,
	1,0,0,0,100,519,1,0,0,0,102,521,1,0,0,0,104,525,1,0,0,0,106,533,1,0,0,0,
	108,541,1,0,0,0,110,551,1,0,0,0,112,562,1,0,0,0,114,564,1,0,0,0,116,567,
	1,0,0,0,118,572,1,0,0,0,120,577,1,0,0,0,122,579,1,0,0,0,124,584,1,0,0,0,
	126,591,1,0,0,0,128,593,1,0,0,0,130,597,1,0,0,0,132,608,1,0,0,0,134,619,
	1,0,0,0,136,631,1,0,0,0,138,633,1,0,0,0,140,645,1,0,0,0,142,647,1,0,0,0,
	144,659,1,0,0,0,146,671,1,0,0,0,148,673,1,0,0,0,150,676,1,0,0,0,152,691,
	1,0,0,0,154,697,1,0,0,0,156,699,1,0,0,0,158,704,1,0,0,0,160,720,1,0,0,0,
	162,731,1,0,0,0,164,733,1,0,0,0,166,738,1,0,0,0,168,745,1,0,0,0,170,752,
	1,0,0,0,172,755,1,0,0,0,174,758,1,0,0,0,176,760,1,0,0,0,178,765,1,0,0,0,
	180,770,1,0,0,0,182,773,1,0,0,0,184,786,1,0,0,0,186,788,1,0,0,0,188,800,
	1,0,0,0,190,811,1,0,0,0,192,814,1,0,0,0,194,828,1,0,0,0,196,835,1,0,0,0,
	198,842,1,0,0,0,200,844,1,0,0,0,202,850,1,0,0,0,204,856,1,0,0,0,206,868,
	1,0,0,0,208,872,1,0,0,0,210,874,1,0,0,0,212,876,1,0,0,0,214,878,1,0,0,0,
	216,883,1,0,0,0,218,891,1,0,0,0,220,902,1,0,0,0,222,224,3,2,1,0,223,225,
	5,83,0,0,224,223,1,0,0,0,224,225,1,0,0,0,225,226,1,0,0,0,226,227,3,6,3,
	0,227,228,5,37,0,0,228,229,5,0,0,1,229,1,1,0,0,0,230,231,5,36,0,0,231,236,
	3,4,2,0,232,233,5,69,0,0,233,234,3,104,52,0,234,235,5,70,0,0,235,237,1,
	0,0,0,236,232,1,0,0,0,236,237,1,0,0,0,237,241,1,0,0,0,238,239,5,82,0,0,
	239,241,3,4,2,0,240,230,1,0,0,0,240,238,1,0,0,0,241,3,1,0,0,0,242,243,5,
	94,0,0,243,5,1,0,0,0,244,253,3,10,5,0,245,253,3,14,7,0,246,253,3,34,17,
	0,247,253,3,88,44,0,248,253,3,92,46,0,249,253,3,8,4,0,250,253,5,86,0,0,
	251,253,3,182,91,0,252,244,1,0,0,0,252,245,1,0,0,0,252,246,1,0,0,0,252,
	247,1,0,0,0,252,248,1,0,0,0,252,249,1,0,0,0,252,250,1,0,0,0,252,251,1,0,
	0,0,253,256,1,0,0,0,254,252,1,0,0,0,254,255,1,0,0,0,255,7,1,0,0,0,256,254,
	1,0,0,0,257,258,5,84,0,0,258,259,3,104,52,0,259,260,5,61,0,0,260,9,1,0,
	0,0,261,262,5,27,0,0,262,267,3,12,6,0,263,264,5,60,0,0,264,266,3,12,6,0,
	265,263,1,0,0,0,266,269,1,0,0,0,267,265,1,0,0,0,267,268,1,0,0,0,268,270,
	1,0,0,0,269,267,1,0,0,0,270,271,5,61,0,0,271,11,1,0,0,0,272,273,3,24,12,
	0,273,13,1,0,0,0,274,278,5,9,0,0,275,276,3,16,8,0,276,277,5,61,0,0,277,
	279,1,0,0,0,278,275,1,0,0,0,279,280,1,0,0,0,280,278,1,0,0,0,280,281,1,0,
	0,0,281,15,1,0,0,0,282,283,3,4,2,0,283,284,5,63,0,0,284,285,3,20,10,0,285,
	17,1,0,0,0,286,287,5,8,0,0,287,288,5,69,0,0,288,289,3,24,12,0,289,290,5,
	70,0,0,290,19,1,0,0,0,291,302,3,22,11,0,292,293,3,28,14,0,293,294,3,22,
	11,0,294,302,1,0,0,0,295,302,3,4,2,0,296,297,3,28,14,0,297,298,3,4,2,0,
	298,302,1,0,0,0,299,302,3,32,16,0,300,302,3,18,9,0,301,291,1,0,0,0,301,
	292,1,0,0,0,301,295,1,0,0,0,301,296,1,0,0,0,301,299,1,0,0,0,301,300,1,0,
	0,0,302,21,1,0,0,0,303,306,3,24,12,0,304,306,3,26,13,0,305,303,1,0,0,0,
	305,304,1,0,0,0,306,23,1,0,0,0,307,308,5,96,0,0,308,25,1,0,0,0,309,310,
	5,97,0,0,310,27,1,0,0,0,311,312,7,0,0,0,312,29,1,0,0,0,313,314,7,1,0,0,
	314,31,1,0,0,0,315,316,5,95,0,0,316,33,1,0,0,0,317,321,5,48,0,0,318,319,
	3,36,18,0,319,320,5,61,0,0,320,322,1,0,0,0,321,318,1,0,0,0,322,323,1,0,
	0,0,323,321,1,0,0,0,323,324,1,0,0,0,324,35,1,0,0,0,325,326,3,4,2,0,326,
	330,5,63,0,0,327,331,3,42,21,0,328,331,3,38,19,0,329,331,3,40,20,0,330,
	327,1,0,0,0,330,328,1,0,0,0,330,329,1,0,0,0,331,37,1,0,0,0,332,334,5,21,
	0,0,333,335,3,98,49,0,334,333,1,0,0,0,334,335,1,0,0,0,335,336,1,0,0,0,336,
	337,5,62,0,0,337,338,3,110,55,0,338,39,1,0,0,0,339,341,5,35,0,0,340,342,
	3,98,49,0,341,340,1,0,0,0,341,342,1,0,0,0,342,41,1,0,0,0,343,347,3,44,22,
	0,344,347,3,52,26,0,345,347,3,86,43,0,346,343,1,0,0,0,346,344,1,0,0,0,346,
	345,1,0,0,0,347,43,1,0,0,0,348,353,3,46,23,0,349,353,3,48,24,0,350,353,
	3,50,25,0,351,353,3,56,28,0,352,348,1,0,0,0,352,349,1,0,0,0,352,350,1,0,
	0,0,352,351,1,0,0,0,353,45,1,0,0,0,354,355,5,69,0,0,355,356,3,104,52,0,
	356,357,5,70,0,0,357,47,1,0,0,0,358,359,3,20,10,0,359,360,5,78,0,0,360,
	361,3,20,10,0,361,49,1,0,0,0,362,365,3,4,2,0,363,365,7,2,0,0,364,362,1,
	0,0,0,364,363,1,0,0,0,365,51,1,0,0,0,366,367,5,34,0,0,367,370,3,54,27,0,
	368,370,3,54,27,0,369,366,1,0,0,0,369,368,1,0,0,0,370,53,1,0,0,0,371,376,
	3,58,29,0,372,376,3,66,33,0,373,376,3,80,40,0,374,376,3,84,42,0,375,371,
	1,0,0,0,375,372,1,0,0,0,375,373,1,0,0,0,375,374,1,0,0,0,376,55,1,0,0,0,
	377,378,5,85,0,0,378,381,5,71,0,0,379,382,3,4,2,0,380,382,3,22,11,0,381,
	379,1,0,0,0,381,380,1,0,0,0,382,383,1,0,0,0,383,384,5,73,0,0,384,57,1,0,
	0,0,385,386,5,2,0,0,386,387,5,71,0,0,387,388,3,60,30,0,388,389,5,73,0,0,
	389,390,5,31,0,0,390,391,3,64,32,0,391,400,1,0,0,0,392,393,5,2,0,0,393,
	394,5,72,0,0,394,395,3,60,30,0,395,396,5,74,0,0,396,397,5,31,0,0,397,398,
	3,64,32,0,398,400,1,0,0,0,399,385,1,0,0,0,399,392,1,0,0,0,400,59,1,0,0,
	0,401,406,3,62,31,0,402,403,5,60,0,0,403,405,3,62,31,0,404,402,1,0,0,0,
	405,408,1,0,0,0,406,404,1,0,0,0,406,407,1,0,0,0,407,61,1,0,0,0,408,406,
	1,0,0,0,409,410,3,44,22,0,410,63,1,0,0,0,411,412,3,42,21,0,412,65,1,0,0,
	0,413,415,5,42,0,0,414,416,3,68,34,0,415,414,1,0,0,0,415,416,1,0,0,0,416,
	417,1,0,0,0,417,418,5,16,0,0,418,67,1,0,0,0,419,422,3,70,35,0,420,421,5,
	61,0,0,421,423,3,74,37,0,422,420,1,0,0,0,422,423,1,0,0,0,423,426,1,0,0,
	0,424,426,3,74,37,0,425,419,1,0,0,0,425,424,1,0,0,0,426,69,1,0,0,0,427,
	432,3,72,36,0,428,429,5,61,0,0,429,431,3,72,36,0,430,428,1,0,0,0,431,434,
	1,0,0,0,432,430,1,0,0,0,432,433,1,0,0,0,433,71,1,0,0,0,434,432,1,0,0,0,
	435,436,3,104,52,0,436,437,5,62,0,0,437,438,3,42,21,0,438,73,1,0,0,0,439,
	440,5,6,0,0,440,441,3,76,38,0,441,442,5,31,0,0,442,447,3,78,39,0,443,444,
	5,61,0,0,444,446,3,78,39,0,445,443,1,0,0,0,446,449,1,0,0,0,447,445,1,0,
	0,0,447,448,1,0,0,0,448,75,1,0,0,0,449,447,1,0,0,0,450,451,3,4,2,0,451,
	452,5,62,0,0,452,453,3,50,25,0,453,456,1,0,0,0,454,456,3,50,25,0,455,450,
	1,0,0,0,455,454,1,0,0,0,456,77,1,0,0,0,457,458,3,106,53,0,458,459,5,62,
	0,0,459,460,5,69,0,0,460,461,3,68,34,0,461,462,5,70,0,0,462,79,1,0,0,0,
	463,464,5,44,0,0,464,465,5,31,0,0,465,466,3,82,41,0,466,81,1,0,0,0,467,
	468,3,44,22,0,468,83,1,0,0,0,469,470,5,17,0,0,470,471,5,31,0,0,471,474,
	3,42,21,0,472,474,5,17,0,0,473,469,1,0,0,0,473,472,1,0,0,0,474,85,1,0,0,
	0,475,476,5,75,0,0,476,477,3,50,25,0,477,87,1,0,0,0,478,479,5,49,0,0,479,
	480,3,90,45,0,480,481,5,61,0,0,481,89,1,0,0,0,482,483,3,104,52,0,483,484,
	5,81,0,0,484,485,3,42,21,0,485,91,1,0,0,0,486,487,3,94,47,0,487,488,5,61,
	0,0,488,93,1,0,0,0,489,492,3,96,48,0,490,492,3,108,54,0,491,489,1,0,0,0,
	491,490,1,0,0,0,492,95,1,0,0,0,493,494,5,35,0,0,494,496,3,4,2,0,495,497,
	3,98,49,0,496,495,1,0,0,0,496,497,1,0,0,0,497,498,1,0,0,0,498,499,5,61,
	0,0,499,500,3,6,3,0,500,97,1,0,0,0,501,502,5,69,0,0,502,507,3,100,50,0,
	503,504,5,61,0,0,504,506,3,100,50,0,505,503,1,0,0,0,506,509,1,0,0,0,507,
	505,1,0,0,0,507,508,1,0,0,0,508,510,1,0,0,0,509,507,1,0,0,0,510,511,5,70,
	0,0,511,99,1,0,0,0,512,520,3,102,51,0,513,514,5,49,0,0,514,520,3,102,51,
	0,515,516,5,21,0,0,516,520,3,102,51,0,517,518,5,35,0,0,518,520,3,102,51,
	0,519,512,1,0,0,0,519,513,1,0,0,0,519,515,1,0,0,0,519,517,1,0,0,0,520,101,
	1,0,0,0,521,522,3,104,52,0,522,523,5,62,0,0,523,524,3,50,25,0,524,103,1,
	0,0,0,525,530,3,4,2,0,526,527,5,60,0,0,527,529,3,4,2,0,528,526,1,0,0,0,
	529,532,1,0,0,0,530,528,1,0,0,0,530,531,1,0,0,0,531,105,1,0,0,0,532,530,
	1,0,0,0,533,538,3,20,10,0,534,535,5,60,0,0,535,537,3,20,10,0,536,534,1,
	0,0,0,537,540,1,0,0,0,538,536,1,0,0,0,538,539,1,0,0,0,539,107,1,0,0,0,540,
	538,1,0,0,0,541,542,5,21,0,0,542,544,3,4,2,0,543,545,3,98,49,0,544,543,
	1,0,0,0,544,545,1,0,0,0,545,546,1,0,0,0,546,547,5,62,0,0,547,548,3,110,
	55,0,548,549,5,61,0,0,549,550,3,6,3,0,550,109,1,0,0,0,551,552,3,50,25,0,
	552,111,1,0,0,0,553,554,3,12,6,0,554,555,5,62,0,0,555,556,3,118,59,0,556,
	563,1,0,0,0,557,563,3,118,59,0,558,563,3,218,109,0,559,563,3,220,110,0,
	560,563,3,114,57,0,561,563,3,116,58,0,562,553,1,0,0,0,562,557,1,0,0,0,562,
	558,1,0,0,0,562,559,1,0,0,0,562,560,1,0,0,0,562,561,1,0,0,0,563,113,1,0,
	0,0,564,565,5,38,0,0,565,566,5,61,0,0,566,115,1,0,0,0,567,568,5,39,0,0,
	568,569,5,61,0,0,569,117,1,0,0,0,570,573,3,120,60,0,571,573,3,178,89,0,
	572,570,1,0,0,0,572,571,1,0,0,0,573,119,1,0,0,0,574,578,3,122,61,0,575,
	578,3,166,83,0,576,578,3,172,86,0,577,574,1,0,0,0,577,575,1,0,0,0,577,576,
	1,0,0,0,578,121,1,0,0,0,579,580,3,124,62,0,580,581,5,59,0,0,581,582,3,130,
	65,0,582,583,5,61,0,0,583,123,1,0,0,0,584,588,3,4,2,0,585,587,3,126,63,
	0,586,585,1,0,0,0,587,590,1,0,0,0,588,586,1,0,0,0,588,589,1,0,0,0,589,125,
	1,0,0,0,590,588,1,0,0,0,591,592,3,128,64,0,592,127,1,0,0,0,593,594,5,71,
	0,0,594,595,3,130,65,0,595,596,5,73,0,0,596,129,1,0,0,0,597,598,6,65,-1,
	0,598,599,3,132,66,0,599,605,1,0,0,0,600,601,10,1,0,0,601,602,5,33,0,0,
	602,604,3,130,65,2,603,600,1,0,0,0,604,607,1,0,0,0,605,603,1,0,0,0,605,
	606,1,0,0,0,606,131,1,0,0,0,607,605,1,0,0,0,608,609,6,66,-1,0,609,610,3,
	134,67,0,610,616,1,0,0,0,611,612,10,1,0,0,612,613,5,1,0,0,613,615,3,132,
	66,2,614,611,1,0,0,0,615,618,1,0,0,0,616,614,1,0,0,0,616,617,1,0,0,0,617,
	133,1,0,0,0,618,616,1,0,0,0,619,620,6,67,-1,0,620,621,3,138,69,0,621,628,
	1,0,0,0,622,623,10,1,0,0,623,624,3,136,68,0,624,625,3,134,67,2,625,627,
	1,0,0,0,626,622,1,0,0,0,627,630,1,0,0,0,628,626,1,0,0,0,628,629,1,0,0,0,
	629,135,1,0,0,0,630,628,1,0,0,0,631,632,7,3,0,0,632,137,1,0,0,0,633,634,
	6,69,-1,0,634,635,3,142,71,0,635,642,1,0,0,0,636,637,10,1,0,0,637,638,3,
	140,70,0,638,639,3,138,69,2,639,641,1,0,0,0,640,636,1,0,0,0,641,644,1,0,
	0,0,642,640,1,0,0,0,642,643,1,0,0,0,643,139,1,0,0,0,644,642,1,0,0,0,645,
	646,7,0,0,0,646,141,1,0,0,0,647,648,6,71,-1,0,648,649,3,144,72,0,649,656,
	1,0,0,0,650,651,10,1,0,0,651,652,3,146,73,0,652,653,3,142,71,2,653,655,
	1,0,0,0,654,650,1,0,0,0,655,658,1,0,0,0,656,654,1,0,0,0,656,657,1,0,0,0,
	657,143,1,0,0,0,658,656,1,0,0,0,659,660,6,72,-1,0,660,661,3,150,75,0,661,
	668,1,0,0,0,662,663,10,1,0,0,663,664,3,148,74,0,664,665,3,144,72,2,665,
	667,1,0,0,0,666,662,1,0,0,0,667,670,1,0,0,0,668,666,1,0,0,0,668,669,1,0,
	0,0,669,145,1,0,0,0,670,668,1,0,0,0,671,672,7,4,0,0,672,147,1,0,0,0,673,
	674,5,56,0,0,674,149,1,0,0,0,675,677,7,0,0,0,676,675,1,0,0,0,676,677,1,
	0,0,0,677,678,1,0,0,0,678,679,3,152,76,0,679,151,1,0,0,0,680,692,3,124,
	62,0,681,682,5,69,0,0,682,683,3,130,65,0,683,684,5,70,0,0,684,692,1,0,0,
	0,685,692,3,156,78,0,686,692,3,154,77,0,687,692,3,160,80,0,688,689,5,30,
	0,0,689,692,3,152,76,0,690,692,3,30,15,0,691,680,1,0,0,0,691,681,1,0,0,
	0,691,685,1,0,0,0,691,686,1,0,0,0,691,687,1,0,0,0,691,688,1,0,0,0,691,690,
	1,0,0,0,692,153,1,0,0,0,693,698,3,22,11,0,694,698,3,18,9,0,695,698,3,32,
	16,0,696,698,5,29,0,0,697,693,1,0,0,0,697,694,1,0,0,0,697,695,1,0,0,0,697,
	696,1,0,0,0,698,155,1,0,0,0,699,700,3,4,2,0,700,701,5,69,0,0,701,702,3,
	158,79,0,702,703,5,70,0,0,703,157,1,0,0,0,704,709,3,168,84,0,705,706,5,
	60,0,0,706,708,3,168,84,0,707,705,1,0,0,0,708,711,1,0,0,0,709,707,1,0,0,
	0,709,710,1,0,0,0,710,159,1,0,0,0,711,709,1,0,0,0,712,713,5,71,0,0,713,
	714,3,162,81,0,714,715,5,73,0,0,715,721,1,0,0,0,716,717,5,72,0,0,717,718,
	3,162,81,0,718,719,5,74,0,0,719,721,1,0,0,0,720,712,1,0,0,0,720,716,1,0,
	0,0,721,161,1,0,0,0,722,727,3,164,82,0,723,724,5,60,0,0,724,726,3,164,82,
	0,725,723,1,0,0,0,726,729,1,0,0,0,727,725,1,0,0,0,727,728,1,0,0,0,728,732,
	1,0,0,0,729,727,1,0,0,0,730,732,1,0,0,0,731,722,1,0,0,0,731,730,1,0,0,0,
	732,163,1,0,0,0,733,736,3,130,65,0,734,735,5,78,0,0,735,737,3,130,65,0,
	736,734,1,0,0,0,736,737,1,0,0,0,737,165,1,0,0,0,738,743,3,4,2,0,739,740,
	5,69,0,0,740,741,3,158,79,0,741,742,5,70,0,0,742,744,1,0,0,0,743,739,1,
	0,0,0,743,744,1,0,0,0,744,167,1,0,0,0,745,749,3,130,65,0,746,748,3,170,
	85,0,747,746,1,0,0,0,748,751,1,0,0,0,749,747,1,0,0,0,749,750,1,0,0,0,750,
	169,1,0,0,0,751,749,1,0,0,0,752,753,5,62,0,0,753,754,3,130,65,0,754,171,
	1,0,0,0,755,756,5,22,0,0,756,757,3,12,6,0,757,173,1,0,0,0,758,759,1,0,0,
	0,759,175,1,0,0,0,760,761,1,0,0,0,761,177,1,0,0,0,762,766,3,184,92,0,763,
	766,3,198,99,0,764,766,3,214,107,0,765,762,1,0,0,0,765,763,1,0,0,0,765,
	764,1,0,0,0,766,179,1,0,0,0,767,769,3,182,91,0,768,767,1,0,0,0,769,772,
	1,0,0,0,770,768,1,0,0,0,770,771,1,0,0,0,771,181,1,0,0,0,772,770,1,0,0,0,
	773,778,3,112,56,0,774,775,5,61,0,0,775,777,3,112,56,0,776,774,1,0,0,0,
	777,780,1,0,0,0,778,776,1,0,0,0,778,779,1,0,0,0,779,782,1,0,0,0,780,778,
	1,0,0,0,781,783,5,61,0,0,782,781,1,0,0,0,782,783,1,0,0,0,783,183,1,0,0,
	0,784,787,3,186,93,0,785,787,3,192,96,0,786,784,1,0,0,0,786,785,1,0,0,0,
	787,185,1,0,0,0,788,789,5,24,0,0,789,790,3,130,65,0,790,791,5,45,0,0,791,
	796,3,180,90,0,792,797,3,188,94,0,793,795,3,190,95,0,794,793,1,0,0,0,794,
	795,1,0,0,0,795,797,1,0,0,0,796,792,1,0,0,0,796,794,1,0,0,0,797,798,1,0,
	0,0,798,799,5,23,0,0,799,187,1,0,0,0,800,801,5,13,0,0,801,802,3,130,65,
	0,802,803,5,45,0,0,803,809,3,180,90,0,804,810,3,188,94,0,805,807,3,190,
	95,0,806,805,1,0,0,0,806,807,1,0,0,0,807,810,1,0,0,0,808,810,5,23,0,0,809,
	804,1,0,0,0,809,806,1,0,0,0,809,808,1,0,0,0,810,189,1,0,0,0,811,812,5,14,
	0,0,812,813,3,180,90,0,813,191,1,0,0,0,814,815,5,6,0,0,815,816,3,130,65,
	0,816,820,7,5,0,0,817,819,3,194,97,0,818,817,1,0,0,0,819,822,1,0,0,0,820,
	818,1,0,0,0,820,821,1,0,0,0,821,824,1,0,0,0,822,820,1,0,0,0,823,825,3,196,
	98,0,824,823,1,0,0,0,824,825,1,0,0,0,825,826,1,0,0,0,826,827,5,5,0,0,827,
	193,1,0,0,0,828,829,3,106,53,0,829,830,7,6,0,0,830,831,3,180,90,0,831,195,
	1,0,0,0,832,836,5,14,0,0,833,834,5,15,0,0,834,836,5,62,0,0,835,832,1,0,
	0,0,835,833,1,0,0,0,836,837,1,0,0,0,837,838,3,180,90,0,838,197,1,0,0,0,
	839,843,3,200,100,0,840,843,3,202,101,0,841,843,3,204,102,0,842,839,1,0,
	0,0,842,840,1,0,0,0,842,841,1,0,0,0,843,199,1,0,0,0,844,845,5,52,0,0,845,
	846,3,130,65,0,846,847,7,7,0,0,847,848,3,180,90,0,848,849,5,50,0,0,849,
	201,1,0,0,0,850,851,5,43,0,0,851,852,3,180,90,0,852,853,7,8,0,0,853,854,
	3,130,65,0,854,855,5,61,0,0,855,203,1,0,0,0,856,857,5,20,0,0,857,858,3,
	4,2,0,858,859,5,59,0,0,859,862,3,206,103,0,860,861,5,18,0,0,861,863,3,212,
	106,0,862,860,1,0,0,0,862,863,1,0,0,0,863,864,1,0,0,0,864,865,7,7,0,0,865,
	866,3,180,90,0,866,867,5,19,0,0,867,205,1,0,0,0,868,869,3,208,104,0,869,
	870,7,9,0,0,870,871,3,210,105,0,871,207,1,0,0,0,872,873,3,130,65,0,873,
	209,1,0,0,0,874,875,3,130,65,0,875,211,1,0,0,0,876,877,3,130,65,0,877,213,
	1,0,0,0,878,879,5,53,0,0,879,880,3,216,108,0,880,881,5,11,0,0,881,882,3,
	112,56,0,882,215,1,0,0,0,883,888,3,124,62,0,884,885,5,60,0,0,885,887,3,
	124,62,0,886,884,1,0,0,0,887,890,1,0,0,0,888,886,1,0,0,0,888,889,1,0,0,
	0,889,217,1,0,0,0,890,888,1,0,0,0,891,892,5,89,0,0,892,897,3,130,65,0,893,
	894,5,60,0,0,894,896,3,130,65,0,895,893,1,0,0,0,896,899,1,0,0,0,897,895,
	1,0,0,0,897,898,1,0,0,0,898,900,1,0,0,0,899,897,1,0,0,0,900,901,5,61,0,
	0,901,219,1,0,0,0,902,903,5,90,0,0,903,908,3,124,62,0,904,905,5,60,0,0,
	905,907,3,124,62,0,906,904,1,0,0,0,907,910,1,0,0,0,908,906,1,0,0,0,908,
	909,1,0,0,0,909,911,1,0,0,0,910,908,1,0,0,0,911,912,5,61,0,0,912,221,1,
	0,0,0,72,224,236,240,252,254,267,280,301,305,323,330,334,341,346,352,364,
	369,375,381,399,406,415,422,425,432,447,455,473,491,496,507,519,530,538,
	544,562,572,577,588,605,616,628,642,656,668,676,691,697,709,720,727,731,
	736,743,749,765,770,778,782,786,794,796,806,809,820,824,835,842,862,888,
	897,908];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!StepCodeParser.__ATN) {
			StepCodeParser.__ATN = new ATNDeserializer().deserialize(StepCodeParser._serializedATN);
		}

		return StepCodeParser.__ATN;
	}


	static DecisionsToDFA = StepCodeParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ProgramContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public programHeading(): ProgramHeadingContext {
		return this.getTypedRuleContext(ProgramHeadingContext, 0) as ProgramHeadingContext;
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public ENDPROGRAM(): TerminalNode {
		return this.getToken(StepCodeParser.ENDPROGRAM, 0);
	}
	public EOF(): TerminalNode {
		return this.getToken(StepCodeParser.EOF, 0);
	}
	public INTERFACE(): TerminalNode {
		return this.getToken(StepCodeParser.INTERFACE, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_program;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProgram) {
	 		listener.enterProgram(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProgram) {
	 		listener.exitProgram(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProgram) {
			return visitor.visitProgram(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProgramHeadingContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PROGRAM(): TerminalNode {
		return this.getToken(StepCodeParser.PROGRAM, 0);
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public identifierList(): IdentifierListContext {
		return this.getTypedRuleContext(IdentifierListContext, 0) as IdentifierListContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
	public UNIT(): TerminalNode {
		return this.getToken(StepCodeParser.UNIT, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_programHeading;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProgramHeading) {
	 		listener.enterProgramHeading(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProgramHeading) {
	 		listener.exitProgramHeading(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProgramHeading) {
			return visitor.visitProgramHeading(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentifierContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENT(): TerminalNode {
		return this.getToken(StepCodeParser.IDENT, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_identifier;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterIdentifier) {
	 		listener.enterIdentifier(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitIdentifier) {
	 		listener.exitIdentifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public labelDeclarationPart_list(): LabelDeclarationPartContext[] {
		return this.getTypedRuleContexts(LabelDeclarationPartContext) as LabelDeclarationPartContext[];
	}
	public labelDeclarationPart(i: number): LabelDeclarationPartContext {
		return this.getTypedRuleContext(LabelDeclarationPartContext, i) as LabelDeclarationPartContext;
	}
	public constantDefinitionPart_list(): ConstantDefinitionPartContext[] {
		return this.getTypedRuleContexts(ConstantDefinitionPartContext) as ConstantDefinitionPartContext[];
	}
	public constantDefinitionPart(i: number): ConstantDefinitionPartContext {
		return this.getTypedRuleContext(ConstantDefinitionPartContext, i) as ConstantDefinitionPartContext;
	}
	public typeDefinitionPart_list(): TypeDefinitionPartContext[] {
		return this.getTypedRuleContexts(TypeDefinitionPartContext) as TypeDefinitionPartContext[];
	}
	public typeDefinitionPart(i: number): TypeDefinitionPartContext {
		return this.getTypedRuleContext(TypeDefinitionPartContext, i) as TypeDefinitionPartContext;
	}
	public variableDeclarationPart_list(): VariableDeclarationPartContext[] {
		return this.getTypedRuleContexts(VariableDeclarationPartContext) as VariableDeclarationPartContext[];
	}
	public variableDeclarationPart(i: number): VariableDeclarationPartContext {
		return this.getTypedRuleContext(VariableDeclarationPartContext, i) as VariableDeclarationPartContext;
	}
	public procedureAndFunctionDeclarationPart_list(): ProcedureAndFunctionDeclarationPartContext[] {
		return this.getTypedRuleContexts(ProcedureAndFunctionDeclarationPartContext) as ProcedureAndFunctionDeclarationPartContext[];
	}
	public procedureAndFunctionDeclarationPart(i: number): ProcedureAndFunctionDeclarationPartContext {
		return this.getTypedRuleContext(ProcedureAndFunctionDeclarationPartContext, i) as ProcedureAndFunctionDeclarationPartContext;
	}
	public usesUnitsPart_list(): UsesUnitsPartContext[] {
		return this.getTypedRuleContexts(UsesUnitsPartContext) as UsesUnitsPartContext[];
	}
	public usesUnitsPart(i: number): UsesUnitsPartContext {
		return this.getTypedRuleContext(UsesUnitsPartContext, i) as UsesUnitsPartContext;
	}
	public IMPLEMENTATION_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.IMPLEMENTATION);
	}
	public IMPLEMENTATION(i: number): TerminalNode {
		return this.getToken(StepCodeParser.IMPLEMENTATION, i);
	}
	public statements_list(): StatementsContext[] {
		return this.getTypedRuleContexts(StatementsContext) as StatementsContext[];
	}
	public statements(i: number): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, i) as StatementsContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_block;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBlock) {
	 		listener.enterBlock(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBlock) {
	 		listener.exitBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBlock) {
			return visitor.visitBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UsesUnitsPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public USES(): TerminalNode {
		return this.getToken(StepCodeParser.USES, 0);
	}
	public identifierList(): IdentifierListContext {
		return this.getTypedRuleContext(IdentifierListContext, 0) as IdentifierListContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_usesUnitsPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUsesUnitsPart) {
	 		listener.enterUsesUnitsPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUsesUnitsPart) {
	 		listener.exitUsesUnitsPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUsesUnitsPart) {
			return visitor.visitUsesUnitsPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LabelDeclarationPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LABEL(): TerminalNode {
		return this.getToken(StepCodeParser.LABEL, 0);
	}
	public label_list(): LabelContext[] {
		return this.getTypedRuleContexts(LabelContext) as LabelContext[];
	}
	public label(i: number): LabelContext {
		return this.getTypedRuleContext(LabelContext, i) as LabelContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_labelDeclarationPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterLabelDeclarationPart) {
	 		listener.enterLabelDeclarationPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitLabelDeclarationPart) {
	 		listener.exitLabelDeclarationPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitLabelDeclarationPart) {
			return visitor.visitLabelDeclarationPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LabelContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public unsignedInteger(): UnsignedIntegerContext {
		return this.getTypedRuleContext(UnsignedIntegerContext, 0) as UnsignedIntegerContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_label;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterLabel) {
	 		listener.enterLabel(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitLabel) {
	 		listener.exitLabel(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitLabel) {
			return visitor.visitLabel(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstantDefinitionPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CONST(): TerminalNode {
		return this.getToken(StepCodeParser.CONST, 0);
	}
	public constantDefinition_list(): ConstantDefinitionContext[] {
		return this.getTypedRuleContexts(ConstantDefinitionContext) as ConstantDefinitionContext[];
	}
	public constantDefinition(i: number): ConstantDefinitionContext {
		return this.getTypedRuleContext(ConstantDefinitionContext, i) as ConstantDefinitionContext;
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_constantDefinitionPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterConstantDefinitionPart) {
	 		listener.enterConstantDefinitionPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitConstantDefinitionPart) {
	 		listener.exitConstantDefinitionPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitConstantDefinitionPart) {
			return visitor.visitConstantDefinitionPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstantDefinitionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(StepCodeParser.EQUAL, 0);
	}
	public constant(): ConstantContext {
		return this.getTypedRuleContext(ConstantContext, 0) as ConstantContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_constantDefinition;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterConstantDefinition) {
	 		listener.enterConstantDefinition(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitConstantDefinition) {
	 		listener.exitConstantDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitConstantDefinition) {
			return visitor.visitConstantDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstantChrContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CHR(): TerminalNode {
		return this.getToken(StepCodeParser.CHR, 0);
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public unsignedInteger(): UnsignedIntegerContext {
		return this.getTypedRuleContext(UnsignedIntegerContext, 0) as UnsignedIntegerContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_constantChr;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterConstantChr) {
	 		listener.enterConstantChr(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitConstantChr) {
	 		listener.exitConstantChr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitConstantChr) {
			return visitor.visitConstantChr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstantContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public unsignedNumber(): UnsignedNumberContext {
		return this.getTypedRuleContext(UnsignedNumberContext, 0) as UnsignedNumberContext;
	}
	public sign(): SignContext {
		return this.getTypedRuleContext(SignContext, 0) as SignContext;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public string_(): StringContext {
		return this.getTypedRuleContext(StringContext, 0) as StringContext;
	}
	public constantChr(): ConstantChrContext {
		return this.getTypedRuleContext(ConstantChrContext, 0) as ConstantChrContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_constant;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterConstant) {
	 		listener.enterConstant(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitConstant) {
	 		listener.exitConstant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitConstant) {
			return visitor.visitConstant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnsignedNumberContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public unsignedInteger(): UnsignedIntegerContext {
		return this.getTypedRuleContext(UnsignedIntegerContext, 0) as UnsignedIntegerContext;
	}
	public unsignedReal(): UnsignedRealContext {
		return this.getTypedRuleContext(UnsignedRealContext, 0) as UnsignedRealContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_unsignedNumber;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUnsignedNumber) {
	 		listener.enterUnsignedNumber(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUnsignedNumber) {
	 		listener.exitUnsignedNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUnsignedNumber) {
			return visitor.visitUnsignedNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnsignedIntegerContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NUM_INT(): TerminalNode {
		return this.getToken(StepCodeParser.NUM_INT, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_unsignedInteger;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUnsignedInteger) {
	 		listener.enterUnsignedInteger(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUnsignedInteger) {
	 		listener.exitUnsignedInteger(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUnsignedInteger) {
			return visitor.visitUnsignedInteger(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnsignedRealContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NUM_REAL(): TerminalNode {
		return this.getToken(StepCodeParser.NUM_REAL, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_unsignedReal;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUnsignedReal) {
	 		listener.enterUnsignedReal(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUnsignedReal) {
	 		listener.exitUnsignedReal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUnsignedReal) {
			return visitor.visitUnsignedReal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SignContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PLUS(): TerminalNode {
		return this.getToken(StepCodeParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(StepCodeParser.MINUS, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_sign;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSign) {
	 		listener.enterSign(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSign) {
	 		listener.exitSign(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSign) {
			return visitor.visitSign(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Bool_Context extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TRUE(): TerminalNode {
		return this.getToken(StepCodeParser.TRUE, 0);
	}
	public FALSE(): TerminalNode {
		return this.getToken(StepCodeParser.FALSE, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_bool_;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBool_) {
	 		listener.enterBool_(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBool_) {
	 		listener.exitBool_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBool_) {
			return visitor.visitBool_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING_LITERAL(): TerminalNode {
		return this.getToken(StepCodeParser.STRING_LITERAL, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_string;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterString) {
	 		listener.enterString(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitString) {
	 		listener.exitString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeDefinitionPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE(): TerminalNode {
		return this.getToken(StepCodeParser.TYPE, 0);
	}
	public typeDefinition_list(): TypeDefinitionContext[] {
		return this.getTypedRuleContexts(TypeDefinitionContext) as TypeDefinitionContext[];
	}
	public typeDefinition(i: number): TypeDefinitionContext {
		return this.getTypedRuleContext(TypeDefinitionContext, i) as TypeDefinitionContext;
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_typeDefinitionPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterTypeDefinitionPart) {
	 		listener.enterTypeDefinitionPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitTypeDefinitionPart) {
	 		listener.exitTypeDefinitionPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitTypeDefinitionPart) {
			return visitor.visitTypeDefinitionPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeDefinitionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(StepCodeParser.EQUAL, 0);
	}
	public type_(): Type_Context {
		return this.getTypedRuleContext(Type_Context, 0) as Type_Context;
	}
	public functionType(): FunctionTypeContext {
		return this.getTypedRuleContext(FunctionTypeContext, 0) as FunctionTypeContext;
	}
	public procedureType(): ProcedureTypeContext {
		return this.getTypedRuleContext(ProcedureTypeContext, 0) as ProcedureTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_typeDefinition;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterTypeDefinition) {
	 		listener.enterTypeDefinition(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitTypeDefinition) {
	 		listener.exitTypeDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitTypeDefinition) {
			return visitor.visitTypeDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FUNCTION(): TerminalNode {
		return this.getToken(StepCodeParser.FUNCTION, 0);
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public resultType(): ResultTypeContext {
		return this.getTypedRuleContext(ResultTypeContext, 0) as ResultTypeContext;
	}
	public formalParameterList(): FormalParameterListContext {
		return this.getTypedRuleContext(FormalParameterListContext, 0) as FormalParameterListContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_functionType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFunctionType) {
	 		listener.enterFunctionType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFunctionType) {
	 		listener.exitFunctionType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFunctionType) {
			return visitor.visitFunctionType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProcedureTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PROCEDURE(): TerminalNode {
		return this.getToken(StepCodeParser.PROCEDURE, 0);
	}
	public formalParameterList(): FormalParameterListContext {
		return this.getTypedRuleContext(FormalParameterListContext, 0) as FormalParameterListContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_procedureType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProcedureType) {
	 		listener.enterProcedureType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProcedureType) {
	 		listener.exitProcedureType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProcedureType) {
			return visitor.visitProcedureType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Type_Context extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simpleType(): SimpleTypeContext {
		return this.getTypedRuleContext(SimpleTypeContext, 0) as SimpleTypeContext;
	}
	public structuredType(): StructuredTypeContext {
		return this.getTypedRuleContext(StructuredTypeContext, 0) as StructuredTypeContext;
	}
	public pointerType(): PointerTypeContext {
		return this.getTypedRuleContext(PointerTypeContext, 0) as PointerTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_type_;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterType_) {
	 		listener.enterType_(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitType_) {
	 		listener.exitType_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitType_) {
			return visitor.visitType_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SimpleTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public scalarType(): ScalarTypeContext {
		return this.getTypedRuleContext(ScalarTypeContext, 0) as ScalarTypeContext;
	}
	public subrangeType(): SubrangeTypeContext {
		return this.getTypedRuleContext(SubrangeTypeContext, 0) as SubrangeTypeContext;
	}
	public typeIdentifier(): TypeIdentifierContext {
		return this.getTypedRuleContext(TypeIdentifierContext, 0) as TypeIdentifierContext;
	}
	public stringtype(): StringtypeContext {
		return this.getTypedRuleContext(StringtypeContext, 0) as StringtypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_simpleType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSimpleType) {
	 		listener.enterSimpleType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSimpleType) {
	 		listener.exitSimpleType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSimpleType) {
			return visitor.visitSimpleType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ScalarTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public identifierList(): IdentifierListContext {
		return this.getTypedRuleContext(IdentifierListContext, 0) as IdentifierListContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_scalarType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterScalarType) {
	 		listener.enterScalarType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitScalarType) {
	 		listener.exitScalarType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitScalarType) {
			return visitor.visitScalarType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubrangeTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public constant_list(): ConstantContext[] {
		return this.getTypedRuleContexts(ConstantContext) as ConstantContext[];
	}
	public constant(i: number): ConstantContext {
		return this.getTypedRuleContext(ConstantContext, i) as ConstantContext;
	}
	public DOTDOT(): TerminalNode {
		return this.getToken(StepCodeParser.DOTDOT, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_subrangeType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSubrangeType) {
	 		listener.enterSubrangeType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSubrangeType) {
	 		listener.exitSubrangeType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSubrangeType) {
			return visitor.visitSubrangeType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeIdentifierContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public CHAR(): TerminalNode {
		return this.getToken(StepCodeParser.CHAR, 0);
	}
	public BOOLEAN(): TerminalNode {
		return this.getToken(StepCodeParser.BOOLEAN, 0);
	}
	public INTEGER(): TerminalNode {
		return this.getToken(StepCodeParser.INTEGER, 0);
	}
	public REAL(): TerminalNode {
		return this.getToken(StepCodeParser.REAL, 0);
	}
	public STRING(): TerminalNode {
		return this.getToken(StepCodeParser.STRING, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_typeIdentifier;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterTypeIdentifier) {
	 		listener.enterTypeIdentifier(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitTypeIdentifier) {
	 		listener.exitTypeIdentifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitTypeIdentifier) {
			return visitor.visitTypeIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructuredTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PACKED(): TerminalNode {
		return this.getToken(StepCodeParser.PACKED, 0);
	}
	public unpackedStructuredType(): UnpackedStructuredTypeContext {
		return this.getTypedRuleContext(UnpackedStructuredTypeContext, 0) as UnpackedStructuredTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_structuredType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterStructuredType) {
	 		listener.enterStructuredType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitStructuredType) {
	 		listener.exitStructuredType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitStructuredType) {
			return visitor.visitStructuredType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnpackedStructuredTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public arrayType(): ArrayTypeContext {
		return this.getTypedRuleContext(ArrayTypeContext, 0) as ArrayTypeContext;
	}
	public recordType(): RecordTypeContext {
		return this.getTypedRuleContext(RecordTypeContext, 0) as RecordTypeContext;
	}
	public setType(): SetTypeContext {
		return this.getTypedRuleContext(SetTypeContext, 0) as SetTypeContext;
	}
	public fileType(): FileTypeContext {
		return this.getTypedRuleContext(FileTypeContext, 0) as FileTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_unpackedStructuredType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUnpackedStructuredType) {
	 		listener.enterUnpackedStructuredType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUnpackedStructuredType) {
	 		listener.exitUnpackedStructuredType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUnpackedStructuredType) {
			return visitor.visitUnpackedStructuredType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringtypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(StepCodeParser.STRING, 0);
	}
	public LBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK, 0);
	}
	public RBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, 0);
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public unsignedNumber(): UnsignedNumberContext {
		return this.getTypedRuleContext(UnsignedNumberContext, 0) as UnsignedNumberContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_stringtype;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterStringtype) {
	 		listener.enterStringtype(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitStringtype) {
	 		listener.exitStringtype(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitStringtype) {
			return visitor.visitStringtype(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArrayTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ARRAY(): TerminalNode {
		return this.getToken(StepCodeParser.ARRAY, 0);
	}
	public LBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK, 0);
	}
	public typeList(): TypeListContext {
		return this.getTypedRuleContext(TypeListContext, 0) as TypeListContext;
	}
	public RBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, 0);
	}
	public OF(): TerminalNode {
		return this.getToken(StepCodeParser.OF, 0);
	}
	public componentType(): ComponentTypeContext {
		return this.getTypedRuleContext(ComponentTypeContext, 0) as ComponentTypeContext;
	}
	public LBRACK2(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK2, 0);
	}
	public RBRACK2(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK2, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_arrayType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterArrayType) {
	 		listener.enterArrayType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitArrayType) {
	 		listener.exitArrayType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitArrayType) {
			return visitor.visitArrayType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public indexType_list(): IndexTypeContext[] {
		return this.getTypedRuleContexts(IndexTypeContext) as IndexTypeContext[];
	}
	public indexType(i: number): IndexTypeContext {
		return this.getTypedRuleContext(IndexTypeContext, i) as IndexTypeContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_typeList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterTypeList) {
	 		listener.enterTypeList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitTypeList) {
	 		listener.exitTypeList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitTypeList) {
			return visitor.visitTypeList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IndexTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simpleType(): SimpleTypeContext {
		return this.getTypedRuleContext(SimpleTypeContext, 0) as SimpleTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_indexType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterIndexType) {
	 		listener.enterIndexType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitIndexType) {
	 		listener.exitIndexType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitIndexType) {
			return visitor.visitIndexType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ComponentTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_(): Type_Context {
		return this.getTypedRuleContext(Type_Context, 0) as Type_Context;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_componentType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterComponentType) {
	 		listener.enterComponentType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitComponentType) {
	 		listener.exitComponentType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitComponentType) {
			return visitor.visitComponentType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RecordTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public RECORD(): TerminalNode {
		return this.getToken(StepCodeParser.RECORD, 0);
	}
	public END(): TerminalNode {
		return this.getToken(StepCodeParser.END, 0);
	}
	public fieldList(): FieldListContext {
		return this.getTypedRuleContext(FieldListContext, 0) as FieldListContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_recordType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterRecordType) {
	 		listener.enterRecordType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitRecordType) {
	 		listener.exitRecordType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitRecordType) {
			return visitor.visitRecordType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public fixedPart(): FixedPartContext {
		return this.getTypedRuleContext(FixedPartContext, 0) as FixedPartContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public variantPart(): VariantPartContext {
		return this.getTypedRuleContext(VariantPartContext, 0) as VariantPartContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_fieldList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFieldList) {
	 		listener.enterFieldList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFieldList) {
	 		listener.exitFieldList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFieldList) {
			return visitor.visitFieldList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FixedPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public recordSection_list(): RecordSectionContext[] {
		return this.getTypedRuleContexts(RecordSectionContext) as RecordSectionContext[];
	}
	public recordSection(i: number): RecordSectionContext {
		return this.getTypedRuleContext(RecordSectionContext, i) as RecordSectionContext;
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_fixedPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFixedPart) {
	 		listener.enterFixedPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFixedPart) {
	 		listener.exitFixedPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFixedPart) {
			return visitor.visitFixedPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RecordSectionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifierList(): IdentifierListContext {
		return this.getTypedRuleContext(IdentifierListContext, 0) as IdentifierListContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public type_(): Type_Context {
		return this.getTypedRuleContext(Type_Context, 0) as Type_Context;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_recordSection;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterRecordSection) {
	 		listener.enterRecordSection(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitRecordSection) {
	 		listener.exitRecordSection(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitRecordSection) {
			return visitor.visitRecordSection(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariantPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CASE(): TerminalNode {
		return this.getToken(StepCodeParser.CASE, 0);
	}
	public tag(): TagContext {
		return this.getTypedRuleContext(TagContext, 0) as TagContext;
	}
	public OF(): TerminalNode {
		return this.getToken(StepCodeParser.OF, 0);
	}
	public variant_list(): VariantContext[] {
		return this.getTypedRuleContexts(VariantContext) as VariantContext[];
	}
	public variant(i: number): VariantContext {
		return this.getTypedRuleContext(VariantContext, i) as VariantContext;
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_variantPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterVariantPart) {
	 		listener.enterVariantPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitVariantPart) {
	 		listener.exitVariantPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitVariantPart) {
			return visitor.visitVariantPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TagContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public typeIdentifier(): TypeIdentifierContext {
		return this.getTypedRuleContext(TypeIdentifierContext, 0) as TypeIdentifierContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_tag;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterTag) {
	 		listener.enterTag(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitTag) {
	 		listener.exitTag(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitTag) {
			return visitor.visitTag(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariantContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public constList(): ConstListContext {
		return this.getTypedRuleContext(ConstListContext, 0) as ConstListContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public fieldList(): FieldListContext {
		return this.getTypedRuleContext(FieldListContext, 0) as FieldListContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_variant;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterVariant) {
	 		listener.enterVariant(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitVariant) {
	 		listener.exitVariant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitVariant) {
			return visitor.visitVariant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SetTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public SET(): TerminalNode {
		return this.getToken(StepCodeParser.SET, 0);
	}
	public OF(): TerminalNode {
		return this.getToken(StepCodeParser.OF, 0);
	}
	public baseType(): BaseTypeContext {
		return this.getTypedRuleContext(BaseTypeContext, 0) as BaseTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_setType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSetType) {
	 		listener.enterSetType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSetType) {
	 		listener.exitSetType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSetType) {
			return visitor.visitSetType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BaseTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simpleType(): SimpleTypeContext {
		return this.getTypedRuleContext(SimpleTypeContext, 0) as SimpleTypeContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_baseType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBaseType) {
	 		listener.enterBaseType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBaseType) {
	 		listener.exitBaseType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBaseType) {
			return visitor.visitBaseType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FileTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FILE(): TerminalNode {
		return this.getToken(StepCodeParser.FILE, 0);
	}
	public OF(): TerminalNode {
		return this.getToken(StepCodeParser.OF, 0);
	}
	public type_(): Type_Context {
		return this.getTypedRuleContext(Type_Context, 0) as Type_Context;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_fileType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFileType) {
	 		listener.enterFileType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFileType) {
	 		listener.exitFileType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFileType) {
			return visitor.visitFileType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PointerTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public POINTER(): TerminalNode {
		return this.getToken(StepCodeParser.POINTER, 0);
	}
	public typeIdentifier(): TypeIdentifierContext {
		return this.getTypedRuleContext(TypeIdentifierContext, 0) as TypeIdentifierContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_pointerType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterPointerType) {
	 		listener.enterPointerType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitPointerType) {
	 		listener.exitPointerType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitPointerType) {
			return visitor.visitPointerType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableDeclarationPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DEFINE(): TerminalNode {
		return this.getToken(StepCodeParser.DEFINE, 0);
	}
	public variableDeclaration(): VariableDeclarationContext {
		return this.getTypedRuleContext(VariableDeclarationContext, 0) as VariableDeclarationContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_variableDeclarationPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterVariableDeclarationPart) {
	 		listener.enterVariableDeclarationPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitVariableDeclarationPart) {
	 		listener.exitVariableDeclarationPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitVariableDeclarationPart) {
			return visitor.visitVariableDeclarationPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableDeclarationContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifierList(): IdentifierListContext {
		return this.getTypedRuleContext(IdentifierListContext, 0) as IdentifierListContext;
	}
	public AS(): TerminalNode {
		return this.getToken(StepCodeParser.AS, 0);
	}
	public type_(): Type_Context {
		return this.getTypedRuleContext(Type_Context, 0) as Type_Context;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_variableDeclaration;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterVariableDeclaration) {
	 		listener.enterVariableDeclaration(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitVariableDeclaration) {
	 		listener.exitVariableDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitVariableDeclaration) {
			return visitor.visitVariableDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProcedureAndFunctionDeclarationPartContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public procedureOrFunctionDeclaration(): ProcedureOrFunctionDeclarationContext {
		return this.getTypedRuleContext(ProcedureOrFunctionDeclarationContext, 0) as ProcedureOrFunctionDeclarationContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_procedureAndFunctionDeclarationPart;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProcedureAndFunctionDeclarationPart) {
	 		listener.enterProcedureAndFunctionDeclarationPart(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProcedureAndFunctionDeclarationPart) {
	 		listener.exitProcedureAndFunctionDeclarationPart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProcedureAndFunctionDeclarationPart) {
			return visitor.visitProcedureAndFunctionDeclarationPart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProcedureOrFunctionDeclarationContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public procedureDeclaration(): ProcedureDeclarationContext {
		return this.getTypedRuleContext(ProcedureDeclarationContext, 0) as ProcedureDeclarationContext;
	}
	public functionDeclaration(): FunctionDeclarationContext {
		return this.getTypedRuleContext(FunctionDeclarationContext, 0) as FunctionDeclarationContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_procedureOrFunctionDeclaration;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProcedureOrFunctionDeclaration) {
	 		listener.enterProcedureOrFunctionDeclaration(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProcedureOrFunctionDeclaration) {
	 		listener.exitProcedureOrFunctionDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProcedureOrFunctionDeclaration) {
			return visitor.visitProcedureOrFunctionDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProcedureDeclarationContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PROCEDURE(): TerminalNode {
		return this.getToken(StepCodeParser.PROCEDURE, 0);
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public formalParameterList(): FormalParameterListContext {
		return this.getTypedRuleContext(FormalParameterListContext, 0) as FormalParameterListContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_procedureDeclaration;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProcedureDeclaration) {
	 		listener.enterProcedureDeclaration(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProcedureDeclaration) {
	 		listener.exitProcedureDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProcedureDeclaration) {
			return visitor.visitProcedureDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FormalParameterListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public formalParameterSection_list(): FormalParameterSectionContext[] {
		return this.getTypedRuleContexts(FormalParameterSectionContext) as FormalParameterSectionContext[];
	}
	public formalParameterSection(i: number): FormalParameterSectionContext {
		return this.getTypedRuleContext(FormalParameterSectionContext, i) as FormalParameterSectionContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_formalParameterList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFormalParameterList) {
	 		listener.enterFormalParameterList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFormalParameterList) {
	 		listener.exitFormalParameterList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFormalParameterList) {
			return visitor.visitFormalParameterList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FormalParameterSectionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public parameterGroup(): ParameterGroupContext {
		return this.getTypedRuleContext(ParameterGroupContext, 0) as ParameterGroupContext;
	}
	public DEFINE(): TerminalNode {
		return this.getToken(StepCodeParser.DEFINE, 0);
	}
	public FUNCTION(): TerminalNode {
		return this.getToken(StepCodeParser.FUNCTION, 0);
	}
	public PROCEDURE(): TerminalNode {
		return this.getToken(StepCodeParser.PROCEDURE, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_formalParameterSection;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFormalParameterSection) {
	 		listener.enterFormalParameterSection(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFormalParameterSection) {
	 		listener.exitFormalParameterSection(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFormalParameterSection) {
			return visitor.visitFormalParameterSection(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterGroupContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifierList(): IdentifierListContext {
		return this.getTypedRuleContext(IdentifierListContext, 0) as IdentifierListContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public typeIdentifier(): TypeIdentifierContext {
		return this.getTypedRuleContext(TypeIdentifierContext, 0) as TypeIdentifierContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_parameterGroup;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterParameterGroup) {
	 		listener.enterParameterGroup(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitParameterGroup) {
	 		listener.exitParameterGroup(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitParameterGroup) {
			return visitor.visitParameterGroup(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentifierListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier_list(): IdentifierContext[] {
		return this.getTypedRuleContexts(IdentifierContext) as IdentifierContext[];
	}
	public identifier(i: number): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, i) as IdentifierContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_identifierList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterIdentifierList) {
	 		listener.enterIdentifierList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitIdentifierList) {
	 		listener.exitIdentifierList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitIdentifierList) {
			return visitor.visitIdentifierList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public constant_list(): ConstantContext[] {
		return this.getTypedRuleContexts(ConstantContext) as ConstantContext[];
	}
	public constant(i: number): ConstantContext {
		return this.getTypedRuleContext(ConstantContext, i) as ConstantContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_constList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterConstList) {
	 		listener.enterConstList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitConstList) {
	 		listener.exitConstList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitConstList) {
			return visitor.visitConstList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionDeclarationContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FUNCTION(): TerminalNode {
		return this.getToken(StepCodeParser.FUNCTION, 0);
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public resultType(): ResultTypeContext {
		return this.getTypedRuleContext(ResultTypeContext, 0) as ResultTypeContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public formalParameterList(): FormalParameterListContext {
		return this.getTypedRuleContext(FormalParameterListContext, 0) as FormalParameterListContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_functionDeclaration;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFunctionDeclaration) {
	 		listener.enterFunctionDeclaration(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFunctionDeclaration) {
	 		listener.exitFunctionDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFunctionDeclaration) {
			return visitor.visitFunctionDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ResultTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public typeIdentifier(): TypeIdentifierContext {
		return this.getTypedRuleContext(TypeIdentifierContext, 0) as TypeIdentifierContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_resultType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterResultType) {
	 		listener.enterResultType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitResultType) {
	 		listener.exitResultType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitResultType) {
			return visitor.visitResultType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public label(): LabelContext {
		return this.getTypedRuleContext(LabelContext, 0) as LabelContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public unlabelledStatement(): UnlabelledStatementContext {
		return this.getTypedRuleContext(UnlabelledStatementContext, 0) as UnlabelledStatementContext;
	}
	public writeStatement(): WriteStatementContext {
		return this.getTypedRuleContext(WriteStatementContext, 0) as WriteStatementContext;
	}
	public readStatement(): ReadStatementContext {
		return this.getTypedRuleContext(ReadStatementContext, 0) as ReadStatementContext;
	}
	public breakStatement(): BreakStatementContext {
		return this.getTypedRuleContext(BreakStatementContext, 0) as BreakStatementContext;
	}
	public continueStatement(): ContinueStatementContext {
		return this.getTypedRuleContext(ContinueStatementContext, 0) as ContinueStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_statement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterStatement) {
	 		listener.enterStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitStatement) {
	 		listener.exitStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BreakStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BREAK(): TerminalNode {
		return this.getToken(StepCodeParser.BREAK, 0);
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_breakStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBreakStatement) {
	 		listener.enterBreakStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBreakStatement) {
	 		listener.exitBreakStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBreakStatement) {
			return visitor.visitBreakStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ContinueStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CONTINUE(): TerminalNode {
		return this.getToken(StepCodeParser.CONTINUE, 0);
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_continueStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterContinueStatement) {
	 		listener.enterContinueStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitContinueStatement) {
	 		listener.exitContinueStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitContinueStatement) {
			return visitor.visitContinueStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnlabelledStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simpleStatement(): SimpleStatementContext {
		return this.getTypedRuleContext(SimpleStatementContext, 0) as SimpleStatementContext;
	}
	public structuredStatement(): StructuredStatementContext {
		return this.getTypedRuleContext(StructuredStatementContext, 0) as StructuredStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_unlabelledStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUnlabelledStatement) {
	 		listener.enterUnlabelledStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUnlabelledStatement) {
	 		listener.exitUnlabelledStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUnlabelledStatement) {
			return visitor.visitUnlabelledStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SimpleStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public assignmentStatement(): AssignmentStatementContext {
		return this.getTypedRuleContext(AssignmentStatementContext, 0) as AssignmentStatementContext;
	}
	public procedureStatement(): ProcedureStatementContext {
		return this.getTypedRuleContext(ProcedureStatementContext, 0) as ProcedureStatementContext;
	}
	public gotoStatement(): GotoStatementContext {
		return this.getTypedRuleContext(GotoStatementContext, 0) as GotoStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_simpleStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSimpleStatement) {
	 		listener.enterSimpleStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSimpleStatement) {
	 		listener.exitSimpleStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSimpleStatement) {
			return visitor.visitSimpleStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AssignmentStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variable(): VariableContext {
		return this.getTypedRuleContext(VariableContext, 0) as VariableContext;
	}
	public ASSIGN(): TerminalNode {
		return this.getToken(StepCodeParser.ASSIGN, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_assignmentStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterAssignmentStatement) {
	 		listener.enterAssignmentStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitAssignmentStatement) {
	 		listener.exitAssignmentStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitAssignmentStatement) {
			return visitor.visitAssignmentStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public accessor_list(): AccessorContext[] {
		return this.getTypedRuleContexts(AccessorContext) as AccessorContext[];
	}
	public accessor(i: number): AccessorContext {
		return this.getTypedRuleContext(AccessorContext, i) as AccessorContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_variable;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterVariable) {
	 		listener.enterVariable(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitVariable) {
	 		listener.exitVariable(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitVariable) {
			return visitor.visitVariable(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AccessorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public index(): IndexContext {
		return this.getTypedRuleContext(IndexContext, 0) as IndexContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_accessor;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterAccessor) {
	 		listener.enterAccessor(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitAccessor) {
	 		listener.exitAccessor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitAccessor) {
			return visitor.visitAccessor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IndexContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public RBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_index;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterIndex) {
	 		listener.enterIndex(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitIndex) {
	 		listener.exitIndex(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitIndex) {
			return visitor.visitIndex(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public booleanMultiplicativeExpression(): BooleanMultiplicativeExpressionContext {
		return this.getTypedRuleContext(BooleanMultiplicativeExpressionContext, 0) as BooleanMultiplicativeExpressionContext;
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public OR(): TerminalNode {
		return this.getToken(StepCodeParser.OR, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_expression;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterExpression) {
	 		listener.enterExpression(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitExpression) {
	 		listener.exitExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BooleanMultiplicativeExpressionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public booleanRelationalExpression(): BooleanRelationalExpressionContext {
		return this.getTypedRuleContext(BooleanRelationalExpressionContext, 0) as BooleanRelationalExpressionContext;
	}
	public booleanMultiplicativeExpression_list(): BooleanMultiplicativeExpressionContext[] {
		return this.getTypedRuleContexts(BooleanMultiplicativeExpressionContext) as BooleanMultiplicativeExpressionContext[];
	}
	public booleanMultiplicativeExpression(i: number): BooleanMultiplicativeExpressionContext {
		return this.getTypedRuleContext(BooleanMultiplicativeExpressionContext, i) as BooleanMultiplicativeExpressionContext;
	}
	public AND(): TerminalNode {
		return this.getToken(StepCodeParser.AND, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_booleanMultiplicativeExpression;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBooleanMultiplicativeExpression) {
	 		listener.enterBooleanMultiplicativeExpression(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBooleanMultiplicativeExpression) {
	 		listener.exitBooleanMultiplicativeExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBooleanMultiplicativeExpression) {
			return visitor.visitBooleanMultiplicativeExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BooleanRelationalExpressionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simpleExpression(): SimpleExpressionContext {
		return this.getTypedRuleContext(SimpleExpressionContext, 0) as SimpleExpressionContext;
	}
	public booleanRelationalExpression_list(): BooleanRelationalExpressionContext[] {
		return this.getTypedRuleContexts(BooleanRelationalExpressionContext) as BooleanRelationalExpressionContext[];
	}
	public booleanRelationalExpression(i: number): BooleanRelationalExpressionContext {
		return this.getTypedRuleContext(BooleanRelationalExpressionContext, i) as BooleanRelationalExpressionContext;
	}
	public relationaloperator(): RelationaloperatorContext {
		return this.getTypedRuleContext(RelationaloperatorContext, 0) as RelationaloperatorContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_booleanRelationalExpression;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBooleanRelationalExpression) {
	 		listener.enterBooleanRelationalExpression(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBooleanRelationalExpression) {
	 		listener.exitBooleanRelationalExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBooleanRelationalExpression) {
			return visitor.visitBooleanRelationalExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RelationaloperatorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(StepCodeParser.EQUAL, 0);
	}
	public NOT_EQUAL(): TerminalNode {
		return this.getToken(StepCodeParser.NOT_EQUAL, 0);
	}
	public LT(): TerminalNode {
		return this.getToken(StepCodeParser.LT, 0);
	}
	public LE(): TerminalNode {
		return this.getToken(StepCodeParser.LE, 0);
	}
	public GE(): TerminalNode {
		return this.getToken(StepCodeParser.GE, 0);
	}
	public GT(): TerminalNode {
		return this.getToken(StepCodeParser.GT, 0);
	}
	public IN(): TerminalNode {
		return this.getToken(StepCodeParser.IN, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_relationaloperator;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterRelationaloperator) {
	 		listener.enterRelationaloperator(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitRelationaloperator) {
	 		listener.exitRelationaloperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitRelationaloperator) {
			return visitor.visitRelationaloperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SimpleExpressionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public term(): TermContext {
		return this.getTypedRuleContext(TermContext, 0) as TermContext;
	}
	public simpleExpression_list(): SimpleExpressionContext[] {
		return this.getTypedRuleContexts(SimpleExpressionContext) as SimpleExpressionContext[];
	}
	public simpleExpression(i: number): SimpleExpressionContext {
		return this.getTypedRuleContext(SimpleExpressionContext, i) as SimpleExpressionContext;
	}
	public additiveoperator(): AdditiveoperatorContext {
		return this.getTypedRuleContext(AdditiveoperatorContext, 0) as AdditiveoperatorContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_simpleExpression;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSimpleExpression) {
	 		listener.enterSimpleExpression(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSimpleExpression) {
	 		listener.exitSimpleExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSimpleExpression) {
			return visitor.visitSimpleExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AdditiveoperatorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PLUS(): TerminalNode {
		return this.getToken(StepCodeParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(StepCodeParser.MINUS, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_additiveoperator;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterAdditiveoperator) {
	 		listener.enterAdditiveoperator(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitAdditiveoperator) {
	 		listener.exitAdditiveoperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitAdditiveoperator) {
			return visitor.visitAdditiveoperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TermContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public baseTerm(): BaseTermContext {
		return this.getTypedRuleContext(BaseTermContext, 0) as BaseTermContext;
	}
	public term_list(): TermContext[] {
		return this.getTypedRuleContexts(TermContext) as TermContext[];
	}
	public term(i: number): TermContext {
		return this.getTypedRuleContext(TermContext, i) as TermContext;
	}
	public multiplicativeoperator(): MultiplicativeoperatorContext {
		return this.getTypedRuleContext(MultiplicativeoperatorContext, 0) as MultiplicativeoperatorContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_term;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterTerm) {
	 		listener.enterTerm(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitTerm) {
	 		listener.exitTerm(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitTerm) {
			return visitor.visitTerm(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BaseTermContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public signedFactor(): SignedFactorContext {
		return this.getTypedRuleContext(SignedFactorContext, 0) as SignedFactorContext;
	}
	public baseTerm_list(): BaseTermContext[] {
		return this.getTypedRuleContexts(BaseTermContext) as BaseTermContext[];
	}
	public baseTerm(i: number): BaseTermContext {
		return this.getTypedRuleContext(BaseTermContext, i) as BaseTermContext;
	}
	public exponentiationOperator(): ExponentiationOperatorContext {
		return this.getTypedRuleContext(ExponentiationOperatorContext, 0) as ExponentiationOperatorContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_baseTerm;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterBaseTerm) {
	 		listener.enterBaseTerm(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitBaseTerm) {
	 		listener.exitBaseTerm(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitBaseTerm) {
			return visitor.visitBaseTerm(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MultiplicativeoperatorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STAR(): TerminalNode {
		return this.getToken(StepCodeParser.STAR, 0);
	}
	public SLASH(): TerminalNode {
		return this.getToken(StepCodeParser.SLASH, 0);
	}
	public DIV(): TerminalNode {
		return this.getToken(StepCodeParser.DIV, 0);
	}
	public MOD(): TerminalNode {
		return this.getToken(StepCodeParser.MOD, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_multiplicativeoperator;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterMultiplicativeoperator) {
	 		listener.enterMultiplicativeoperator(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitMultiplicativeoperator) {
	 		listener.exitMultiplicativeoperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitMultiplicativeoperator) {
			return visitor.visitMultiplicativeoperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExponentiationOperatorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public POWER(): TerminalNode {
		return this.getToken(StepCodeParser.POWER, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_exponentiationOperator;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterExponentiationOperator) {
	 		listener.enterExponentiationOperator(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitExponentiationOperator) {
	 		listener.exitExponentiationOperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitExponentiationOperator) {
			return visitor.visitExponentiationOperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SignedFactorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public factor(): FactorContext {
		return this.getTypedRuleContext(FactorContext, 0) as FactorContext;
	}
	public PLUS(): TerminalNode {
		return this.getToken(StepCodeParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(StepCodeParser.MINUS, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_signedFactor;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSignedFactor) {
	 		listener.enterSignedFactor(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSignedFactor) {
	 		listener.exitSignedFactor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSignedFactor) {
			return visitor.visitSignedFactor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FactorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variable(): VariableContext {
		return this.getTypedRuleContext(VariableContext, 0) as VariableContext;
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
	public functionDesignator(): FunctionDesignatorContext {
		return this.getTypedRuleContext(FunctionDesignatorContext, 0) as FunctionDesignatorContext;
	}
	public unsignedConstant(): UnsignedConstantContext {
		return this.getTypedRuleContext(UnsignedConstantContext, 0) as UnsignedConstantContext;
	}
	public set_(): Set_Context {
		return this.getTypedRuleContext(Set_Context, 0) as Set_Context;
	}
	public NOT(): TerminalNode {
		return this.getToken(StepCodeParser.NOT, 0);
	}
	public factor(): FactorContext {
		return this.getTypedRuleContext(FactorContext, 0) as FactorContext;
	}
	public bool_(): Bool_Context {
		return this.getTypedRuleContext(Bool_Context, 0) as Bool_Context;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_factor;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFactor) {
	 		listener.enterFactor(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFactor) {
	 		listener.exitFactor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFactor) {
			return visitor.visitFactor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnsignedConstantContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public unsignedNumber(): UnsignedNumberContext {
		return this.getTypedRuleContext(UnsignedNumberContext, 0) as UnsignedNumberContext;
	}
	public constantChr(): ConstantChrContext {
		return this.getTypedRuleContext(ConstantChrContext, 0) as ConstantChrContext;
	}
	public string_(): StringContext {
		return this.getTypedRuleContext(StringContext, 0) as StringContext;
	}
	public NIL(): TerminalNode {
		return this.getToken(StepCodeParser.NIL, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_unsignedConstant;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterUnsignedConstant) {
	 		listener.enterUnsignedConstant(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitUnsignedConstant) {
	 		listener.exitUnsignedConstant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitUnsignedConstant) {
			return visitor.visitUnsignedConstant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionDesignatorContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public parameterList(): ParameterListContext {
		return this.getTypedRuleContext(ParameterListContext, 0) as ParameterListContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_functionDesignator;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFunctionDesignator) {
	 		listener.enterFunctionDesignator(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFunctionDesignator) {
	 		listener.exitFunctionDesignator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFunctionDesignator) {
			return visitor.visitFunctionDesignator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public actualParameter_list(): ActualParameterContext[] {
		return this.getTypedRuleContexts(ActualParameterContext) as ActualParameterContext[];
	}
	public actualParameter(i: number): ActualParameterContext {
		return this.getTypedRuleContext(ActualParameterContext, i) as ActualParameterContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_parameterList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterParameterList) {
	 		listener.enterParameterList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitParameterList) {
	 		listener.exitParameterList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitParameterList) {
			return visitor.visitParameterList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Set_Context extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK, 0);
	}
	public elementList(): ElementListContext {
		return this.getTypedRuleContext(ElementListContext, 0) as ElementListContext;
	}
	public RBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, 0);
	}
	public LBRACK2(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK2, 0);
	}
	public RBRACK2(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK2, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_set_;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSet_) {
	 		listener.enterSet_(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSet_) {
	 		listener.exitSet_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSet_) {
			return visitor.visitSet_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ElementListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public element_list(): ElementContext[] {
		return this.getTypedRuleContexts(ElementContext) as ElementContext[];
	}
	public element(i: number): ElementContext {
		return this.getTypedRuleContext(ElementContext, i) as ElementContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_elementList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterElementList) {
	 		listener.enterElementList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitElementList) {
	 		listener.exitElementList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitElementList) {
			return visitor.visitElementList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ElementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public DOTDOT(): TerminalNode {
		return this.getToken(StepCodeParser.DOTDOT, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_element;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterElement) {
	 		listener.enterElement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitElement) {
	 		listener.exitElement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitElement) {
			return visitor.visitElement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProcedureStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public LPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.LPAREN, 0);
	}
	public parameterList(): ParameterListContext {
		return this.getTypedRuleContext(ParameterListContext, 0) as ParameterListContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_procedureStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterProcedureStatement) {
	 		listener.enterProcedureStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitProcedureStatement) {
	 		listener.exitProcedureStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitProcedureStatement) {
			return visitor.visitProcedureStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ActualParameterContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public parameterwidth_list(): ParameterwidthContext[] {
		return this.getTypedRuleContexts(ParameterwidthContext) as ParameterwidthContext[];
	}
	public parameterwidth(i: number): ParameterwidthContext {
		return this.getTypedRuleContext(ParameterwidthContext, i) as ParameterwidthContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_actualParameter;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterActualParameter) {
	 		listener.enterActualParameter(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitActualParameter) {
	 		listener.exitActualParameter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitActualParameter) {
			return visitor.visitActualParameter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterwidthContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_parameterwidth;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterParameterwidth) {
	 		listener.enterParameterwidth(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitParameterwidth) {
	 		listener.exitParameterwidth(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitParameterwidth) {
			return visitor.visitParameterwidth(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class GotoStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public GOTO(): TerminalNode {
		return this.getToken(StepCodeParser.GOTO, 0);
	}
	public label(): LabelContext {
		return this.getTypedRuleContext(LabelContext, 0) as LabelContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_gotoStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterGotoStatement) {
	 		listener.enterGotoStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitGotoStatement) {
	 		listener.exitGotoStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitGotoStatement) {
			return visitor.visitGotoStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EmptyStatement_Context extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_emptyStatement_;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterEmptyStatement_) {
	 		listener.enterEmptyStatement_(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitEmptyStatement_) {
	 		listener.exitEmptyStatement_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitEmptyStatement_) {
			return visitor.visitEmptyStatement_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Empty_Context extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_empty_;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterEmpty_) {
	 		listener.enterEmpty_(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitEmpty_) {
	 		listener.exitEmpty_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitEmpty_) {
			return visitor.visitEmpty_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructuredStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public conditionalStatement(): ConditionalStatementContext {
		return this.getTypedRuleContext(ConditionalStatementContext, 0) as ConditionalStatementContext;
	}
	public repetetiveStatement(): RepetetiveStatementContext {
		return this.getTypedRuleContext(RepetetiveStatementContext, 0) as RepetetiveStatementContext;
	}
	public withStatement(): WithStatementContext {
		return this.getTypedRuleContext(WithStatementContext, 0) as WithStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_structuredStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterStructuredStatement) {
	 		listener.enterStructuredStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitStructuredStatement) {
	 		listener.exitStructuredStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitStructuredStatement) {
			return visitor.visitStructuredStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CompoundStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public statements_list(): StatementsContext[] {
		return this.getTypedRuleContexts(StatementsContext) as StatementsContext[];
	}
	public statements(i: number): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, i) as StatementsContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_compoundStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterCompoundStatement) {
	 		listener.enterCompoundStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitCompoundStatement) {
	 		listener.exitCompoundStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitCompoundStatement) {
			return visitor.visitCompoundStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementsContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public statement_list(): StatementContext[] {
		return this.getTypedRuleContexts(StatementContext) as StatementContext[];
	}
	public statement(i: number): StatementContext {
		return this.getTypedRuleContext(StatementContext, i) as StatementContext;
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_statements;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterStatements) {
	 		listener.enterStatements(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitStatements) {
	 		listener.exitStatements(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitStatements) {
			return visitor.visitStatements(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConditionalStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ifStatement(): IfStatementContext {
		return this.getTypedRuleContext(IfStatementContext, 0) as IfStatementContext;
	}
	public caseStatement(): CaseStatementContext {
		return this.getTypedRuleContext(CaseStatementContext, 0) as CaseStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_conditionalStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterConditionalStatement) {
	 		listener.enterConditionalStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitConditionalStatement) {
	 		listener.exitConditionalStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitConditionalStatement) {
			return visitor.visitConditionalStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IF(): TerminalNode {
		return this.getToken(StepCodeParser.IF, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public THEN(): TerminalNode {
		return this.getToken(StepCodeParser.THEN, 0);
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public ENDIF(): TerminalNode {
		return this.getToken(StepCodeParser.ENDIF, 0);
	}
	public elifStatement(): ElifStatementContext {
		return this.getTypedRuleContext(ElifStatementContext, 0) as ElifStatementContext;
	}
	public elseStatement(): ElseStatementContext {
		return this.getTypedRuleContext(ElseStatementContext, 0) as ElseStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_ifStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterIfStatement) {
	 		listener.enterIfStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitIfStatement) {
	 		listener.exitIfStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitIfStatement) {
			return visitor.visitIfStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ElifStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ELIF(): TerminalNode {
		return this.getToken(StepCodeParser.ELIF, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public THEN(): TerminalNode {
		return this.getToken(StepCodeParser.THEN, 0);
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public elifStatement(): ElifStatementContext {
		return this.getTypedRuleContext(ElifStatementContext, 0) as ElifStatementContext;
	}
	public ENDIF(): TerminalNode {
		return this.getToken(StepCodeParser.ENDIF, 0);
	}
	public elseStatement(): ElseStatementContext {
		return this.getTypedRuleContext(ElseStatementContext, 0) as ElseStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_elifStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterElifStatement) {
	 		listener.enterElifStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitElifStatement) {
	 		listener.exitElifStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitElifStatement) {
			return visitor.visitElifStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ElseStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ELSE(): TerminalNode {
		return this.getToken(StepCodeParser.ELSE, 0);
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_elseStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterElseStatement) {
	 		listener.enterElseStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitElseStatement) {
	 		listener.exitElseStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitElseStatement) {
			return visitor.visitElseStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CaseStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CASE(): TerminalNode {
		return this.getToken(StepCodeParser.CASE, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public ENDCASE(): TerminalNode {
		return this.getToken(StepCodeParser.ENDCASE, 0);
	}
	public OF(): TerminalNode {
		return this.getToken(StepCodeParser.OF, 0);
	}
	public HACER(): TerminalNode {
		return this.getToken(StepCodeParser.HACER, 0);
	}
	public caseListElement_list(): CaseListElementContext[] {
		return this.getTypedRuleContexts(CaseListElementContext) as CaseListElementContext[];
	}
	public caseListElement(i: number): CaseListElementContext {
		return this.getTypedRuleContext(CaseListElementContext, i) as CaseListElementContext;
	}
	public caseOtherWise(): CaseOtherWiseContext {
		return this.getTypedRuleContext(CaseOtherWiseContext, 0) as CaseOtherWiseContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_caseStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterCaseStatement) {
	 		listener.enterCaseStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitCaseStatement) {
	 		listener.exitCaseStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitCaseStatement) {
			return visitor.visitCaseStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CaseListElementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public constList(): ConstListContext {
		return this.getTypedRuleContext(ConstListContext, 0) as ConstListContext;
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public AS(): TerminalNode {
		return this.getToken(StepCodeParser.AS, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_caseListElement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterCaseListElement) {
	 		listener.enterCaseListElement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitCaseListElement) {
	 		listener.exitCaseListElement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitCaseListElement) {
			return visitor.visitCaseListElement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CaseOtherWiseContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public ELSE(): TerminalNode {
		return this.getToken(StepCodeParser.ELSE, 0);
	}
	public OTHERWISE(): TerminalNode {
		return this.getToken(StepCodeParser.OTHERWISE, 0);
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_caseOtherWise;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterCaseOtherWise) {
	 		listener.enterCaseOtherWise(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitCaseOtherWise) {
	 		listener.exitCaseOtherWise(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitCaseOtherWise) {
			return visitor.visitCaseOtherWise(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RepetetiveStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public whileStatement(): WhileStatementContext {
		return this.getTypedRuleContext(WhileStatementContext, 0) as WhileStatementContext;
	}
	public repeatStatement(): RepeatStatementContext {
		return this.getTypedRuleContext(RepeatStatementContext, 0) as RepeatStatementContext;
	}
	public forStatement(): ForStatementContext {
		return this.getTypedRuleContext(ForStatementContext, 0) as ForStatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_repetetiveStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterRepetetiveStatement) {
	 		listener.enterRepetetiveStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitRepetetiveStatement) {
	 		listener.exitRepetetiveStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitRepetetiveStatement) {
			return visitor.visitRepetetiveStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class WhileStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public WHILE(): TerminalNode {
		return this.getToken(StepCodeParser.WHILE, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public ENDWHILE(): TerminalNode {
		return this.getToken(StepCodeParser.ENDWHILE, 0);
	}
	public DO(): TerminalNode {
		return this.getToken(StepCodeParser.DO, 0);
	}
	public HACER(): TerminalNode {
		return this.getToken(StepCodeParser.HACER, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_whileStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterWhileStatement) {
	 		listener.enterWhileStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitWhileStatement) {
	 		listener.exitWhileStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitWhileStatement) {
			return visitor.visitWhileStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RepeatStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public REPEAT(): TerminalNode {
		return this.getToken(StepCodeParser.REPEAT, 0);
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public UNTIL(): TerminalNode {
		return this.getToken(StepCodeParser.UNTIL, 0);
	}
	public MIENTRASQUE(): TerminalNode {
		return this.getToken(StepCodeParser.MIENTRASQUE, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_repeatStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterRepeatStatement) {
	 		listener.enterRepeatStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitRepeatStatement) {
	 		listener.exitRepeatStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitRepeatStatement) {
			return visitor.visitRepeatStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ForStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FOR(): TerminalNode {
		return this.getToken(StepCodeParser.FOR, 0);
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public ASSIGN(): TerminalNode {
		return this.getToken(StepCodeParser.ASSIGN, 0);
	}
	public forList(): ForListContext {
		return this.getTypedRuleContext(ForListContext, 0) as ForListContext;
	}
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
	}
	public ENDFOR(): TerminalNode {
		return this.getToken(StepCodeParser.ENDFOR, 0);
	}
	public DO(): TerminalNode {
		return this.getToken(StepCodeParser.DO, 0);
	}
	public HACER(): TerminalNode {
		return this.getToken(StepCodeParser.HACER, 0);
	}
	public WITHSTEP(): TerminalNode {
		return this.getToken(StepCodeParser.WITHSTEP, 0);
	}
	public stepValue(): StepValueContext {
		return this.getTypedRuleContext(StepValueContext, 0) as StepValueContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_forStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterForStatement) {
	 		listener.enterForStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitForStatement) {
	 		listener.exitForStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitForStatement) {
			return visitor.visitForStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ForListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public initialValue(): InitialValueContext {
		return this.getTypedRuleContext(InitialValueContext, 0) as InitialValueContext;
	}
	public finalValue(): FinalValueContext {
		return this.getTypedRuleContext(FinalValueContext, 0) as FinalValueContext;
	}
	public TO(): TerminalNode {
		return this.getToken(StepCodeParser.TO, 0);
	}
	public DOWNTO(): TerminalNode {
		return this.getToken(StepCodeParser.DOWNTO, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_forList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterForList) {
	 		listener.enterForList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitForList) {
	 		listener.exitForList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitForList) {
			return visitor.visitForList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InitialValueContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_initialValue;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterInitialValue) {
	 		listener.enterInitialValue(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitInitialValue) {
	 		listener.exitInitialValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitInitialValue) {
			return visitor.visitInitialValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FinalValueContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_finalValue;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterFinalValue) {
	 		listener.enterFinalValue(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitFinalValue) {
	 		listener.exitFinalValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitFinalValue) {
			return visitor.visitFinalValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StepValueContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_stepValue;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterStepValue) {
	 		listener.enterStepValue(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitStepValue) {
	 		listener.exitStepValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitStepValue) {
			return visitor.visitStepValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class WithStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public WITH(): TerminalNode {
		return this.getToken(StepCodeParser.WITH, 0);
	}
	public recordVariableList(): RecordVariableListContext {
		return this.getTypedRuleContext(RecordVariableListContext, 0) as RecordVariableListContext;
	}
	public DO(): TerminalNode {
		return this.getToken(StepCodeParser.DO, 0);
	}
	public statement(): StatementContext {
		return this.getTypedRuleContext(StatementContext, 0) as StatementContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_withStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterWithStatement) {
	 		listener.enterWithStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitWithStatement) {
	 		listener.exitWithStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitWithStatement) {
			return visitor.visitWithStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RecordVariableListContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variable_list(): VariableContext[] {
		return this.getTypedRuleContexts(VariableContext) as VariableContext[];
	}
	public variable(i: number): VariableContext {
		return this.getTypedRuleContext(VariableContext, i) as VariableContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_recordVariableList;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterRecordVariableList) {
	 		listener.enterRecordVariableList(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitRecordVariableList) {
	 		listener.exitRecordVariableList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitRecordVariableList) {
			return visitor.visitRecordVariableList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class WriteStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public WRITE(): TerminalNode {
		return this.getToken(StepCodeParser.WRITE, 0);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_writeStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterWriteStatement) {
	 		listener.enterWriteStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitWriteStatement) {
	 		listener.exitWriteStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitWriteStatement) {
			return visitor.visitWriteStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReadStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public READ(): TerminalNode {
		return this.getToken(StepCodeParser.READ, 0);
	}
	public variable_list(): VariableContext[] {
		return this.getTypedRuleContexts(VariableContext) as VariableContext[];
	}
	public variable(i: number): VariableContext {
		return this.getTypedRuleContext(VariableContext, i) as VariableContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_readStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterReadStatement) {
	 		listener.enterReadStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitReadStatement) {
	 		listener.exitReadStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitReadStatement) {
			return visitor.visitReadStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
