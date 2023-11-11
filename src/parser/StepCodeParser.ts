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
	public static readonly BYVALUE = 21;
	public static readonly BYREFERENCE = 22;
	public static readonly FUNCTION = 23;
	public static readonly GOTO = 24;
	public static readonly ENDIF = 25;
	public static readonly IF = 26;
	public static readonly IN = 27;
	public static readonly INTEGER = 28;
	public static readonly LABEL = 29;
	public static readonly DIMENSION = 30;
	public static readonly MOD = 31;
	public static readonly NIL = 32;
	public static readonly NOT = 33;
	public static readonly OF = 34;
	public static readonly HACER = 35;
	public static readonly OR = 36;
	public static readonly PACKED = 37;
	public static readonly ENDPROCEDURE = 38;
	public static readonly PROCEDURE = 39;
	public static readonly PROGRAM = 40;
	public static readonly ENDPROGRAM = 41;
	public static readonly BREAK = 42;
	public static readonly CONTINUE = 43;
	public static readonly RETURN = 44;
	public static readonly REAL = 45;
	public static readonly RECORD = 46;
	public static readonly REPEAT = 47;
	public static readonly SET = 48;
	public static readonly THEN = 49;
	public static readonly UNTIL = 50;
	public static readonly TO = 51;
	public static readonly TYPE = 52;
	public static readonly DEFINE = 53;
	public static readonly ENDWHILE = 54;
	public static readonly MIENTRASQUE = 55;
	public static readonly WHILE = 56;
	public static readonly WITH = 57;
	public static readonly PLUS = 58;
	public static readonly MINUS = 59;
	public static readonly POWER = 60;
	public static readonly STAR = 61;
	public static readonly SLASH = 62;
	public static readonly ASSIGN = 63;
	public static readonly COMMA = 64;
	public static readonly SEMI = 65;
	public static readonly COLON = 66;
	public static readonly EQUAL = 67;
	public static readonly NOT_EQUAL = 68;
	public static readonly LT = 69;
	public static readonly LE = 70;
	public static readonly GE = 71;
	public static readonly GT = 72;
	public static readonly LPAREN = 73;
	public static readonly RPAREN = 74;
	public static readonly LBRACK = 75;
	public static readonly LBRACK2 = 76;
	public static readonly RBRACK = 77;
	public static readonly RBRACK2 = 78;
	public static readonly POINTER = 79;
	public static readonly AT = 80;
	public static readonly DOT = 81;
	public static readonly DOTDOT = 82;
	public static readonly LCURLY = 83;
	public static readonly RCURLY = 84;
	public static readonly AS = 85;
	public static readonly UNIT = 86;
	public static readonly INTERFACE = 87;
	public static readonly USES = 88;
	public static readonly STRING = 89;
	public static readonly IMPLEMENTATION = 90;
	public static readonly TRUE = 91;
	public static readonly FALSE = 92;
	public static readonly WRITE = 93;
	public static readonly READ = 94;
	public static readonly WS = 95;
	public static readonly COMMENT_1 = 96;
	public static readonly COMMENT_2 = 97;
	public static readonly IDENT = 98;
	public static readonly STRING_LITERAL = 99;
	public static readonly NUM_INT = 100;
	public static readonly NUM_REAL = 101;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_program = 0;
	public static readonly RULE_main = 1;
	public static readonly RULE_subprogram = 2;
	public static readonly RULE_programHeading = 3;
	public static readonly RULE_identifier = 4;
	public static readonly RULE_block = 5;
	public static readonly RULE_usesUnitsPart = 6;
	public static readonly RULE_labelDeclarationPart = 7;
	public static readonly RULE_label = 8;
	public static readonly RULE_constantDefinitionPart = 9;
	public static readonly RULE_constantDefinition = 10;
	public static readonly RULE_constantChr = 11;
	public static readonly RULE_constant = 12;
	public static readonly RULE_unsignedNumber = 13;
	public static readonly RULE_unsignedInteger = 14;
	public static readonly RULE_unsignedReal = 15;
	public static readonly RULE_sign = 16;
	public static readonly RULE_bool_ = 17;
	public static readonly RULE_string = 18;
	public static readonly RULE_typeDefinitionPart = 19;
	public static readonly RULE_typeDefinition = 20;
	public static readonly RULE_functionType = 21;
	public static readonly RULE_procedureType = 22;
	public static readonly RULE_type_ = 23;
	public static readonly RULE_simpleType = 24;
	public static readonly RULE_scalarType = 25;
	public static readonly RULE_subrangeType = 26;
	public static readonly RULE_typeIdentifier = 27;
	public static readonly RULE_structuredType = 28;
	public static readonly RULE_unpackedStructuredType = 29;
	public static readonly RULE_stringtype = 30;
	public static readonly RULE_arrayType = 31;
	public static readonly RULE_dimensionStatement = 32;
	public static readonly RULE_dimensionType = 33;
	public static readonly RULE_typeList = 34;
	public static readonly RULE_indexType = 35;
	public static readonly RULE_componentType = 36;
	public static readonly RULE_recordType = 37;
	public static readonly RULE_fieldList = 38;
	public static readonly RULE_fixedPart = 39;
	public static readonly RULE_recordSection = 40;
	public static readonly RULE_variantPart = 41;
	public static readonly RULE_tag = 42;
	public static readonly RULE_variant = 43;
	public static readonly RULE_setType = 44;
	public static readonly RULE_baseType = 45;
	public static readonly RULE_fileType = 46;
	public static readonly RULE_pointerType = 47;
	public static readonly RULE_variableDeclarationPart = 48;
	public static readonly RULE_variableDeclaration = 49;
	public static readonly RULE_procedureAndFunctionDeclarationPart = 50;
	public static readonly RULE_procedureOrFunctionDeclaration = 51;
	public static readonly RULE_procedureDeclaration = 52;
	public static readonly RULE_formalParameterList = 53;
	public static readonly RULE_formalParameterSection = 54;
	public static readonly RULE_identifierList = 55;
	public static readonly RULE_paramIdentifier = 56;
	public static readonly RULE_constList = 57;
	public static readonly RULE_functionDeclaration = 58;
	public static readonly RULE_resultType = 59;
	public static readonly RULE_statement = 60;
	public static readonly RULE_breakStatement = 61;
	public static readonly RULE_returnStatement = 62;
	public static readonly RULE_continueStatement = 63;
	public static readonly RULE_unlabelledStatement = 64;
	public static readonly RULE_simpleStatement = 65;
	public static readonly RULE_assignmentStatement = 66;
	public static readonly RULE_variable = 67;
	public static readonly RULE_accessor = 68;
	public static readonly RULE_index = 69;
	public static readonly RULE_expression = 70;
	public static readonly RULE_booleanMultiplicativeExpression = 71;
	public static readonly RULE_booleanRelationalExpression = 72;
	public static readonly RULE_relationaloperator = 73;
	public static readonly RULE_simpleExpression = 74;
	public static readonly RULE_additiveoperator = 75;
	public static readonly RULE_term = 76;
	public static readonly RULE_baseTerm = 77;
	public static readonly RULE_multiplicativeoperator = 78;
	public static readonly RULE_exponentiationOperator = 79;
	public static readonly RULE_signedFactor = 80;
	public static readonly RULE_factor = 81;
	public static readonly RULE_unsignedConstant = 82;
	public static readonly RULE_functionDesignator = 83;
	public static readonly RULE_parameterList = 84;
	public static readonly RULE_set_ = 85;
	public static readonly RULE_elementList = 86;
	public static readonly RULE_element = 87;
	public static readonly RULE_procedureStatement = 88;
	public static readonly RULE_actualParameter = 89;
	public static readonly RULE_parameterwidth = 90;
	public static readonly RULE_gotoStatement = 91;
	public static readonly RULE_emptyStatement_ = 92;
	public static readonly RULE_empty_ = 93;
	public static readonly RULE_structuredStatement = 94;
	public static readonly RULE_compoundStatement = 95;
	public static readonly RULE_statements = 96;
	public static readonly RULE_conditionalStatement = 97;
	public static readonly RULE_ifStatement = 98;
	public static readonly RULE_elifStatement = 99;
	public static readonly RULE_elseStatement = 100;
	public static readonly RULE_caseStatement = 101;
	public static readonly RULE_caseListElement = 102;
	public static readonly RULE_caseOtherWise = 103;
	public static readonly RULE_repetetiveStatement = 104;
	public static readonly RULE_whileStatement = 105;
	public static readonly RULE_repeatStatement = 106;
	public static readonly RULE_forStatement = 107;
	public static readonly RULE_forList = 108;
	public static readonly RULE_initialValue = 109;
	public static readonly RULE_finalValue = 110;
	public static readonly RULE_stepValue = 111;
	public static readonly RULE_withStatement = 112;
	public static readonly RULE_recordVariableList = 113;
	public static readonly RULE_writeStatement = 114;
	public static readonly RULE_readStatement = 115;
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
                                                            null, null, 
                                                            "'FUNCTION'", 
                                                            "'GOTO'", null, 
                                                            null, "'IN'", 
                                                            null, "'LABEL'", 
                                                            "'DIMENSION'", 
                                                            "'MOD'", "'NIL'", 
                                                            null, "'OF'", 
                                                            "'HACER'", null, 
                                                            "'PACKED'", 
                                                            null, null, 
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
                                                             "BYVALUE", 
                                                             "BYREFERENCE", 
                                                             "FUNCTION", 
                                                             "GOTO", "ENDIF", 
                                                             "IF", "IN", 
                                                             "INTEGER", 
                                                             "LABEL", "DIMENSION", 
                                                             "MOD", "NIL", 
                                                             "NOT", "OF", 
                                                             "HACER", "OR", 
                                                             "PACKED", "ENDPROCEDURE", 
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
		"program", "main", "subprogram", "programHeading", "identifier", "block", 
		"usesUnitsPart", "labelDeclarationPart", "label", "constantDefinitionPart", 
		"constantDefinition", "constantChr", "constant", "unsignedNumber", "unsignedInteger", 
		"unsignedReal", "sign", "bool_", "string", "typeDefinitionPart", "typeDefinition", 
		"functionType", "procedureType", "type_", "simpleType", "scalarType", 
		"subrangeType", "typeIdentifier", "structuredType", "unpackedStructuredType", 
		"stringtype", "arrayType", "dimensionStatement", "dimensionType", "typeList", 
		"indexType", "componentType", "recordType", "fieldList", "fixedPart", 
		"recordSection", "variantPart", "tag", "variant", "setType", "baseType", 
		"fileType", "pointerType", "variableDeclarationPart", "variableDeclaration", 
		"procedureAndFunctionDeclarationPart", "procedureOrFunctionDeclaration", 
		"procedureDeclaration", "formalParameterList", "formalParameterSection", 
		"identifierList", "paramIdentifier", "constList", "functionDeclaration", 
		"resultType", "statement", "breakStatement", "returnStatement", "continueStatement", 
		"unlabelledStatement", "simpleStatement", "assignmentStatement", "variable", 
		"accessor", "index", "expression", "booleanMultiplicativeExpression", 
		"booleanRelationalExpression", "relationaloperator", "simpleExpression", 
		"additiveoperator", "term", "baseTerm", "multiplicativeoperator", "exponentiationOperator", 
		"signedFactor", "factor", "unsignedConstant", "functionDesignator", "parameterList", 
		"set_", "elementList", "element", "procedureStatement", "actualParameter", 
		"parameterwidth", "gotoStatement", "emptyStatement_", "empty_", "structuredStatement", 
		"compoundStatement", "statements", "conditionalStatement", "ifStatement", 
		"elifStatement", "elseStatement", "caseStatement", "caseListElement", 
		"caseOtherWise", "repetetiveStatement", "whileStatement", "repeatStatement", 
		"forStatement", "forList", "initialValue", "finalValue", "stepValue", 
		"withStatement", "recordVariableList", "writeStatement", "readStatement",
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
			this.state = 235;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===23 || _la===39) {
				{
				{
				this.state = 232;
				this.subprogram();
				}
				}
				this.state = 237;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 238;
			this.main();
			this.state = 242;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===23 || _la===39) {
				{
				{
				this.state = 239;
				this.subprogram();
				}
				}
				this.state = 244;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 245;
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
	public main(): MainContext {
		let localctx: MainContext = new MainContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, StepCodeParser.RULE_main);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 247;
			this.programHeading();
			this.state = 249;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===87) {
				{
				this.state = 248;
				this.match(StepCodeParser.INTERFACE);
				}
			}

			this.state = 251;
			this.block();
			this.state = 252;
			this.match(StepCodeParser.ENDPROGRAM);
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
	public subprogram(): SubprogramContext {
		let localctx: SubprogramContext = new SubprogramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, StepCodeParser.RULE_subprogram);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 254;
			this.procedureOrFunctionDeclaration();
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
		this.enterRule(localctx, 6, StepCodeParser.RULE_programHeading);
		let _la: number;
		try {
			this.state = 266;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 40:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 256;
				this.match(StepCodeParser.PROGRAM);
				this.state = 257;
				this.identifier();
				this.state = 262;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===73) {
					{
					this.state = 258;
					this.match(StepCodeParser.LPAREN);
					this.state = 259;
					this.identifierList();
					this.state = 260;
					this.match(StepCodeParser.RPAREN);
					}
				}

				}
				break;
			case 86:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 264;
				this.match(StepCodeParser.UNIT);
				this.state = 265;
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
		this.enterRule(localctx, 8, StepCodeParser.RULE_identifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 268;
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
		this.enterRule(localctx, 10, StepCodeParser.RULE_block);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 281;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					this.state = 279;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case 29:
						{
						this.state = 270;
						this.labelDeclarationPart();
						}
						break;
					case 9:
						{
						this.state = 271;
						this.constantDefinitionPart();
						}
						break;
					case 52:
						{
						this.state = 272;
						this.typeDefinitionPart();
						}
						break;
					case 53:
						{
						this.state = 273;
						this.variableDeclarationPart();
						}
						break;
					case 30:
						{
						this.state = 274;
						this.dimensionStatement();
						}
						break;
					case 23:
					case 39:
						{
						this.state = 275;
						this.procedureAndFunctionDeclarationPart();
						}
						break;
					case 88:
						{
						this.state = 276;
						this.usesUnitsPart();
						}
						break;
					case 90:
						{
						this.state = 277;
						this.match(StepCodeParser.IMPLEMENTATION);
						}
						break;
					case 6:
					case 20:
					case 24:
					case 26:
					case 42:
					case 43:
					case 44:
					case 47:
					case 56:
					case 57:
					case 93:
					case 94:
					case 98:
					case 100:
						{
						this.state = 278;
						this.statements();
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
				}
				this.state = 283;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
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
		this.enterRule(localctx, 12, StepCodeParser.RULE_usesUnitsPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 284;
			this.match(StepCodeParser.USES);
			this.state = 285;
			this.identifierList();
			this.state = 286;
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
		this.enterRule(localctx, 14, StepCodeParser.RULE_labelDeclarationPart);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 288;
			this.match(StepCodeParser.LABEL);
			this.state = 289;
			this.label();
			this.state = 294;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 290;
				this.match(StepCodeParser.COMMA);
				this.state = 291;
				this.label();
				}
				}
				this.state = 296;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 297;
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
		this.enterRule(localctx, 16, StepCodeParser.RULE_label);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 299;
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
		this.enterRule(localctx, 18, StepCodeParser.RULE_constantDefinitionPart);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 301;
			this.match(StepCodeParser.CONST);
			this.state = 305;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 302;
					this.constantDefinition();
					this.state = 303;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 307;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
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
		this.enterRule(localctx, 20, StepCodeParser.RULE_constantDefinition);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 309;
			this.identifier();
			this.state = 310;
			this.match(StepCodeParser.EQUAL);
			this.state = 311;
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
		this.enterRule(localctx, 22, StepCodeParser.RULE_constantChr);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 313;
			this.match(StepCodeParser.CHR);
			this.state = 314;
			this.match(StepCodeParser.LPAREN);
			this.state = 315;
			this.unsignedInteger();
			this.state = 316;
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
		this.enterRule(localctx, 24, StepCodeParser.RULE_constant);
		try {
			this.state = 328;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 318;
				this.unsignedNumber();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 319;
				this.sign();
				this.state = 320;
				this.unsignedNumber();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 322;
				this.identifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 323;
				this.sign();
				this.state = 324;
				this.identifier();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 326;
				this.string_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 327;
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
		this.enterRule(localctx, 26, StepCodeParser.RULE_unsignedNumber);
		try {
			this.state = 332;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 100:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 330;
				this.unsignedInteger();
				}
				break;
			case 101:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 331;
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
		this.enterRule(localctx, 28, StepCodeParser.RULE_unsignedInteger);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 334;
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
		this.enterRule(localctx, 30, StepCodeParser.RULE_unsignedReal);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 336;
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
		this.enterRule(localctx, 32, StepCodeParser.RULE_sign);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 338;
			_la = this._input.LA(1);
			if(!(_la===58 || _la===59)) {
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
		this.enterRule(localctx, 34, StepCodeParser.RULE_bool_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 340;
			_la = this._input.LA(1);
			if(!(_la===91 || _la===92)) {
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
		this.enterRule(localctx, 36, StepCodeParser.RULE_string);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 342;
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
		this.enterRule(localctx, 38, StepCodeParser.RULE_typeDefinitionPart);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 344;
			this.match(StepCodeParser.TYPE);
			this.state = 348;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 345;
					this.typeDefinition();
					this.state = 346;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 350;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
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
		this.enterRule(localctx, 40, StepCodeParser.RULE_typeDefinition);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 352;
			this.identifier();
			this.state = 353;
			this.match(StepCodeParser.EQUAL);
			this.state = 357;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
			case 4:
			case 7:
			case 8:
			case 17:
			case 28:
			case 37:
			case 45:
			case 46:
			case 48:
			case 58:
			case 59:
			case 73:
			case 79:
			case 89:
			case 98:
			case 99:
			case 100:
			case 101:
				{
				this.state = 354;
				this.type_();
				}
				break;
			case 23:
				{
				this.state = 355;
				this.functionType();
				}
				break;
			case 39:
				{
				this.state = 356;
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
		this.enterRule(localctx, 42, StepCodeParser.RULE_functionType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 359;
			this.match(StepCodeParser.FUNCTION);
			this.state = 361;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===73) {
				{
				this.state = 360;
				this.formalParameterList();
				}
			}

			this.state = 363;
			this.match(StepCodeParser.COLON);
			this.state = 364;
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
		this.enterRule(localctx, 44, StepCodeParser.RULE_procedureType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 366;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 368;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===73) {
				{
				this.state = 367;
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
		this.enterRule(localctx, 46, StepCodeParser.RULE_type_);
		try {
			this.state = 373;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 7:
			case 8:
			case 28:
			case 45:
			case 58:
			case 59:
			case 73:
			case 89:
			case 98:
			case 99:
			case 100:
			case 101:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 370;
				this.simpleType();
				}
				break;
			case 2:
			case 17:
			case 37:
			case 46:
			case 48:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 371;
				this.structuredType();
				}
				break;
			case 79:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 372;
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
		this.enterRule(localctx, 48, StepCodeParser.RULE_simpleType);
		try {
			this.state = 379;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 375;
				this.scalarType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 376;
				this.subrangeType();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 377;
				this.typeIdentifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 378;
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
		this.enterRule(localctx, 50, StepCodeParser.RULE_scalarType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 381;
			this.match(StepCodeParser.LPAREN);
			this.state = 382;
			this.identifierList();
			this.state = 383;
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
		this.enterRule(localctx, 52, StepCodeParser.RULE_subrangeType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 385;
			this.constant();
			this.state = 386;
			this.match(StepCodeParser.DOTDOT);
			this.state = 387;
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
		this.enterRule(localctx, 54, StepCodeParser.RULE_typeIdentifier);
		let _la: number;
		try {
			this.state = 391;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 98:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 389;
				this.identifier();
				}
				break;
			case 4:
			case 7:
			case 28:
			case 45:
			case 89:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 390;
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 268435600) !== 0) || _la===45 || _la===89)) {
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
		this.enterRule(localctx, 56, StepCodeParser.RULE_structuredType);
		try {
			this.state = 396;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 37:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 393;
				this.match(StepCodeParser.PACKED);
				this.state = 394;
				this.unpackedStructuredType();
				}
				break;
			case 2:
			case 17:
			case 46:
			case 48:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 395;
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
		this.enterRule(localctx, 58, StepCodeParser.RULE_unpackedStructuredType);
		try {
			this.state = 402;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 398;
				this.arrayType();
				}
				break;
			case 46:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 399;
				this.recordType();
				}
				break;
			case 48:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 400;
				this.setType();
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 401;
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
		this.enterRule(localctx, 60, StepCodeParser.RULE_stringtype);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 404;
			this.match(StepCodeParser.STRING);
			this.state = 405;
			this.match(StepCodeParser.LBRACK);
			this.state = 408;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 98:
				{
				this.state = 406;
				this.identifier();
				}
				break;
			case 100:
			case 101:
				{
				this.state = 407;
				this.unsignedNumber();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 410;
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
		this.enterRule(localctx, 62, StepCodeParser.RULE_arrayType);
		try {
			this.state = 426;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 21, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 412;
				this.match(StepCodeParser.ARRAY);
				this.state = 413;
				this.match(StepCodeParser.LBRACK);
				this.state = 414;
				this.typeList();
				this.state = 415;
				this.match(StepCodeParser.RBRACK);
				this.state = 416;
				this.match(StepCodeParser.OF);
				this.state = 417;
				this.componentType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 419;
				this.match(StepCodeParser.ARRAY);
				this.state = 420;
				this.match(StepCodeParser.LBRACK2);
				this.state = 421;
				this.typeList();
				this.state = 422;
				this.match(StepCodeParser.RBRACK2);
				this.state = 423;
				this.match(StepCodeParser.OF);
				this.state = 424;
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
	public dimensionStatement(): DimensionStatementContext {
		let localctx: DimensionStatementContext = new DimensionStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 64, StepCodeParser.RULE_dimensionStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 428;
			this.match(StepCodeParser.DIMENSION);
			this.state = 429;
			this.identifier();
			this.state = 430;
			this.dimensionType();
			this.state = 431;
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
	public dimensionType(): DimensionTypeContext {
		let localctx: DimensionTypeContext = new DimensionTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 66, StepCodeParser.RULE_dimensionType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 433;
			this.match(StepCodeParser.LBRACK);
			this.state = 434;
			this.unsignedNumber();
			this.state = 439;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 435;
				this.match(StepCodeParser.COMMA);
				this.state = 436;
				this.unsignedNumber();
				}
				}
				this.state = 441;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 442;
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
	public typeList(): TypeListContext {
		let localctx: TypeListContext = new TypeListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 68, StepCodeParser.RULE_typeList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 444;
			this.indexType();
			this.state = 449;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 445;
				this.match(StepCodeParser.COMMA);
				this.state = 446;
				this.indexType();
				}
				}
				this.state = 451;
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
		this.enterRule(localctx, 70, StepCodeParser.RULE_indexType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 452;
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
		this.enterRule(localctx, 72, StepCodeParser.RULE_componentType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 454;
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
		this.enterRule(localctx, 74, StepCodeParser.RULE_recordType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 456;
			this.match(StepCodeParser.RECORD);
			this.state = 458;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===6 || _la===98) {
				{
				this.state = 457;
				this.fieldList();
				}
			}

			this.state = 460;
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
		this.enterRule(localctx, 76, StepCodeParser.RULE_fieldList);
		let _la: number;
		try {
			this.state = 468;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 98:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 462;
				this.fixedPart();
				this.state = 465;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===65) {
					{
					this.state = 463;
					this.match(StepCodeParser.SEMI);
					this.state = 464;
					this.variantPart();
					}
				}

				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 467;
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
		this.enterRule(localctx, 78, StepCodeParser.RULE_fixedPart);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 470;
			this.recordSection();
			this.state = 475;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 471;
					this.match(StepCodeParser.SEMI);
					this.state = 472;
					this.recordSection();
					}
					}
				}
				this.state = 477;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
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
		this.enterRule(localctx, 80, StepCodeParser.RULE_recordSection);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 478;
			this.identifierList();
			this.state = 479;
			this.match(StepCodeParser.COLON);
			this.state = 480;
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
		this.enterRule(localctx, 82, StepCodeParser.RULE_variantPart);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 482;
			this.match(StepCodeParser.CASE);
			this.state = 483;
			this.tag();
			this.state = 484;
			this.match(StepCodeParser.OF);
			this.state = 485;
			this.variant();
			this.state = 490;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===65) {
				{
				{
				this.state = 486;
				this.match(StepCodeParser.SEMI);
				this.state = 487;
				this.variant();
				}
				}
				this.state = 492;
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
		this.enterRule(localctx, 84, StepCodeParser.RULE_tag);
		try {
			this.state = 498;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 493;
				this.identifier();
				this.state = 494;
				this.match(StepCodeParser.COLON);
				this.state = 495;
				this.typeIdentifier();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 497;
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
		this.enterRule(localctx, 86, StepCodeParser.RULE_variant);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 500;
			this.constList();
			this.state = 501;
			this.match(StepCodeParser.COLON);
			this.state = 502;
			this.match(StepCodeParser.LPAREN);
			this.state = 503;
			this.fieldList();
			this.state = 504;
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
		this.enterRule(localctx, 88, StepCodeParser.RULE_setType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 506;
			this.match(StepCodeParser.SET);
			this.state = 507;
			this.match(StepCodeParser.OF);
			this.state = 508;
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
		this.enterRule(localctx, 90, StepCodeParser.RULE_baseType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 510;
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
		this.enterRule(localctx, 92, StepCodeParser.RULE_fileType);
		try {
			this.state = 516;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 512;
				this.match(StepCodeParser.FILE);
				this.state = 513;
				this.match(StepCodeParser.OF);
				this.state = 514;
				this.type_();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 515;
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
		this.enterRule(localctx, 94, StepCodeParser.RULE_pointerType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 518;
			this.match(StepCodeParser.POINTER);
			this.state = 519;
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
		this.enterRule(localctx, 96, StepCodeParser.RULE_variableDeclarationPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 521;
			this.match(StepCodeParser.DEFINE);
			this.state = 522;
			this.variableDeclaration();
			this.state = 523;
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
		this.enterRule(localctx, 98, StepCodeParser.RULE_variableDeclaration);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 525;
			this.identifierList();
			this.state = 526;
			this.match(StepCodeParser.AS);
			this.state = 527;
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
		this.enterRule(localctx, 100, StepCodeParser.RULE_procedureAndFunctionDeclarationPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 529;
			this.procedureOrFunctionDeclaration();
			this.state = 530;
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
		this.enterRule(localctx, 102, StepCodeParser.RULE_procedureOrFunctionDeclaration);
		try {
			this.state = 534;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 39:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 532;
				this.procedureDeclaration();
				}
				break;
			case 23:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 533;
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
		this.enterRule(localctx, 104, StepCodeParser.RULE_procedureDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 536;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 537;
			this.identifier();
			this.state = 539;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===73) {
				{
				this.state = 538;
				this.formalParameterList();
				}
			}

			this.state = 541;
			this.block();
			this.state = 542;
			this.match(StepCodeParser.ENDPROCEDURE);
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
		this.enterRule(localctx, 106, StepCodeParser.RULE_formalParameterList);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 544;
			this.match(StepCodeParser.LPAREN);
			this.state = 545;
			this.formalParameterSection();
			this.state = 546;
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
		this.enterRule(localctx, 108, StepCodeParser.RULE_formalParameterSection);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 548;
			this.paramIdentifier();
			this.state = 553;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 549;
				this.match(StepCodeParser.COMMA);
				this.state = 550;
				this.paramIdentifier();
				}
				}
				this.state = 555;
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
	public identifierList(): IdentifierListContext {
		let localctx: IdentifierListContext = new IdentifierListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 110, StepCodeParser.RULE_identifierList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 556;
			this.identifier();
			this.state = 561;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 557;
				this.match(StepCodeParser.COMMA);
				this.state = 558;
				this.identifier();
				}
				}
				this.state = 563;
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
	public paramIdentifier(): ParamIdentifierContext {
		let localctx: ParamIdentifierContext = new ParamIdentifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 112, StepCodeParser.RULE_paramIdentifier);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 564;
			this.identifier();
			this.state = 567;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===66) {
				{
				this.state = 565;
				this.match(StepCodeParser.COLON);
				this.state = 566;
				this.typeIdentifier();
				}
			}

			this.state = 570;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===21 || _la===22) {
				{
				this.state = 569;
				_la = this._input.LA(1);
				if(!(_la===21 || _la===22)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
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
	public constList(): ConstListContext {
		let localctx: ConstListContext = new ConstListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 114, StepCodeParser.RULE_constList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 572;
			this.constant();
			this.state = 577;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 573;
				this.match(StepCodeParser.COMMA);
				this.state = 574;
				this.constant();
				}
				}
				this.state = 579;
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
		this.enterRule(localctx, 116, StepCodeParser.RULE_functionDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 580;
			this.match(StepCodeParser.FUNCTION);
			this.state = 581;
			this.identifier();
			this.state = 583;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===73) {
				{
				this.state = 582;
				this.formalParameterList();
				}
			}

			this.state = 585;
			this.match(StepCodeParser.COLON);
			this.state = 586;
			this.resultType();
			this.state = 587;
			this.match(StepCodeParser.SEMI);
			this.state = 588;
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
		this.enterRule(localctx, 118, StepCodeParser.RULE_resultType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 590;
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
		this.enterRule(localctx, 120, StepCodeParser.RULE_statement);
		try {
			this.state = 602;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 100:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 592;
				this.label();
				this.state = 593;
				this.match(StepCodeParser.COLON);
				this.state = 594;
				this.unlabelledStatement();
				}
				break;
			case 6:
			case 20:
			case 24:
			case 26:
			case 47:
			case 56:
			case 57:
			case 98:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 596;
				this.unlabelledStatement();
				}
				break;
			case 93:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 597;
				this.writeStatement();
				}
				break;
			case 94:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 598;
				this.readStatement();
				}
				break;
			case 42:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 599;
				this.breakStatement();
				}
				break;
			case 43:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 600;
				this.continueStatement();
				}
				break;
			case 44:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 601;
				this.returnStatement();
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
		this.enterRule(localctx, 122, StepCodeParser.RULE_breakStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 604;
			this.match(StepCodeParser.BREAK);
			this.state = 605;
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
	public returnStatement(): ReturnStatementContext {
		let localctx: ReturnStatementContext = new ReturnStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 124, StepCodeParser.RULE_returnStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 607;
			this.match(StepCodeParser.RETURN);
			this.state = 609;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8 || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 201326595) !== 0) || ((((_la - 73)) & ~0x1F) === 0 && ((1 << (_la - 73)) & 504102925) !== 0)) {
				{
				this.state = 608;
				this.expression(0);
				}
			}

			this.state = 611;
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
		this.enterRule(localctx, 126, StepCodeParser.RULE_continueStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 613;
			this.match(StepCodeParser.CONTINUE);
			this.state = 614;
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
		this.enterRule(localctx, 128, StepCodeParser.RULE_unlabelledStatement);
		try {
			this.state = 618;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 24:
			case 98:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 616;
				this.simpleStatement();
				}
				break;
			case 6:
			case 20:
			case 26:
			case 47:
			case 56:
			case 57:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 617;
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
		this.enterRule(localctx, 130, StepCodeParser.RULE_simpleStatement);
		try {
			this.state = 623;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 620;
				this.assignmentStatement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 621;
				this.procedureStatement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 622;
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
		this.enterRule(localctx, 132, StepCodeParser.RULE_assignmentStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 625;
			this.variable();
			this.state = 626;
			this.match(StepCodeParser.ASSIGN);
			this.state = 627;
			this.expression(0);
			this.state = 628;
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
		this.enterRule(localctx, 134, StepCodeParser.RULE_variable);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 630;
			this.identifier();
			this.state = 634;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 43, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 631;
					this.accessor();
					}
					}
				}
				this.state = 636;
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
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public accessor(): AccessorContext {
		let localctx: AccessorContext = new AccessorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 136, StepCodeParser.RULE_accessor);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 637;
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
		this.enterRule(localctx, 138, StepCodeParser.RULE_index);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 639;
			this.match(StepCodeParser.LBRACK);
			this.state = 640;
			this.expression(0);
			this.state = 645;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 641;
				this.match(StepCodeParser.COMMA);
				this.state = 642;
				this.expression(0);
				}
				}
				this.state = 647;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 648;
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
		let _startState: number = 140;
		this.enterRecursionRule(localctx, 140, StepCodeParser.RULE_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 651;
			this.booleanMultiplicativeExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 658;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
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
					this.state = 653;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 654;
					this.match(StepCodeParser.OR);
					this.state = 655;
					this.expression(2);
					}
					}
				}
				this.state = 660;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
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
		let _startState: number = 142;
		this.enterRecursionRule(localctx, 142, StepCodeParser.RULE_booleanMultiplicativeExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 662;
			this.booleanRelationalExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 669;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 46, this._ctx);
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
					this.state = 664;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 665;
					this.match(StepCodeParser.AND);
					this.state = 666;
					this.booleanMultiplicativeExpression(2);
					}
					}
				}
				this.state = 671;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 46, this._ctx);
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
		let _startState: number = 144;
		this.enterRecursionRule(localctx, 144, StepCodeParser.RULE_booleanRelationalExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 673;
			this.simpleExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 681;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 47, this._ctx);
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
					this.state = 675;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 676;
					this.relationaloperator();
					this.state = 677;
					this.booleanRelationalExpression(2);
					}
					}
				}
				this.state = 683;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 47, this._ctx);
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
		this.enterRule(localctx, 146, StepCodeParser.RULE_relationaloperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 684;
			_la = this._input.LA(1);
			if(!(_la===27 || ((((_la - 67)) & ~0x1F) === 0 && ((1 << (_la - 67)) & 63) !== 0))) {
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
		let _startState: number = 148;
		this.enterRecursionRule(localctx, 148, StepCodeParser.RULE_simpleExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 687;
			this.term(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 695;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 48, this._ctx);
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
					this.state = 689;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 690;
					this.additiveoperator();
					this.state = 691;
					this.simpleExpression(2);
					}
					}
				}
				this.state = 697;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 48, this._ctx);
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
		this.enterRule(localctx, 150, StepCodeParser.RULE_additiveoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 698;
			_la = this._input.LA(1);
			if(!(_la===58 || _la===59)) {
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
		let _startState: number = 152;
		this.enterRecursionRule(localctx, 152, StepCodeParser.RULE_term, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 701;
			this.baseTerm(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 709;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 49, this._ctx);
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
					this.state = 703;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 704;
					this.multiplicativeoperator();
					this.state = 705;
					this.term(2);
					}
					}
				}
				this.state = 711;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 49, this._ctx);
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
		let _startState: number = 154;
		this.enterRecursionRule(localctx, 154, StepCodeParser.RULE_baseTerm, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 713;
			this.signedFactor();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 721;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 50, this._ctx);
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
					this.state = 715;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 716;
					this.exponentiationOperator();
					this.state = 717;
					this.baseTerm(2);
					}
					}
				}
				this.state = 723;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 50, this._ctx);
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
		this.enterRule(localctx, 156, StepCodeParser.RULE_multiplicativeoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 724;
			_la = this._input.LA(1);
			if(!(_la===10 || _la===31 || _la===61 || _la===62)) {
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
		this.enterRule(localctx, 158, StepCodeParser.RULE_exponentiationOperator);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 726;
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
		this.enterRule(localctx, 160, StepCodeParser.RULE_signedFactor);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 729;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58 || _la===59) {
				{
				this.state = 728;
				_la = this._input.LA(1);
				if(!(_la===58 || _la===59)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
			}

			this.state = 731;
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
		this.enterRule(localctx, 162, StepCodeParser.RULE_factor);
		try {
			this.state = 744;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 52, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 733;
				this.variable();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 734;
				this.match(StepCodeParser.LPAREN);
				this.state = 735;
				this.expression(0);
				this.state = 736;
				this.match(StepCodeParser.RPAREN);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 738;
				this.functionDesignator();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 739;
				this.unsignedConstant();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 740;
				this.set_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 741;
				this.match(StepCodeParser.NOT);
				this.state = 742;
				this.factor();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 743;
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
		this.enterRule(localctx, 164, StepCodeParser.RULE_unsignedConstant);
		try {
			this.state = 750;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 100:
			case 101:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 746;
				this.unsignedNumber();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 747;
				this.constantChr();
				}
				break;
			case 99:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 748;
				this.string_();
				}
				break;
			case 32:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 749;
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
		this.enterRule(localctx, 166, StepCodeParser.RULE_functionDesignator);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 752;
			this.identifier();
			this.state = 753;
			this.match(StepCodeParser.LPAREN);
			this.state = 754;
			this.parameterList();
			this.state = 755;
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
		this.enterRule(localctx, 168, StepCodeParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 757;
			this.actualParameter();
			this.state = 762;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 758;
				this.match(StepCodeParser.COMMA);
				this.state = 759;
				this.actualParameter();
				}
				}
				this.state = 764;
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
		this.enterRule(localctx, 170, StepCodeParser.RULE_set_);
		try {
			this.state = 773;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 75:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 765;
				this.match(StepCodeParser.LBRACK);
				this.state = 766;
				this.elementList();
				this.state = 767;
				this.match(StepCodeParser.RBRACK);
				}
				break;
			case 76:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 769;
				this.match(StepCodeParser.LBRACK2);
				this.state = 770;
				this.elementList();
				this.state = 771;
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
		this.enterRule(localctx, 172, StepCodeParser.RULE_elementList);
		let _la: number;
		try {
			this.state = 784;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 8:
			case 32:
			case 33:
			case 58:
			case 59:
			case 73:
			case 75:
			case 76:
			case 91:
			case 92:
			case 98:
			case 99:
			case 100:
			case 101:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 775;
				this.element();
				this.state = 780;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===64) {
					{
					{
					this.state = 776;
					this.match(StepCodeParser.COMMA);
					this.state = 777;
					this.element();
					}
					}
					this.state = 782;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			case 77:
			case 78:
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
		this.enterRule(localctx, 174, StepCodeParser.RULE_element);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 786;
			this.expression(0);
			this.state = 789;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===82) {
				{
				this.state = 787;
				this.match(StepCodeParser.DOTDOT);
				this.state = 788;
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
		this.enterRule(localctx, 176, StepCodeParser.RULE_procedureStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 791;
			this.identifier();
			{
			this.state = 792;
			this.match(StepCodeParser.LPAREN);
			this.state = 794;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8 || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 201326595) !== 0) || ((((_la - 73)) & ~0x1F) === 0 && ((1 << (_la - 73)) & 504102925) !== 0)) {
				{
				this.state = 793;
				this.parameterList();
				}
			}

			this.state = 796;
			this.match(StepCodeParser.RPAREN);
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
		this.enterRule(localctx, 178, StepCodeParser.RULE_actualParameter);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 798;
			this.expression(0);
			this.state = 802;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 799;
				this.parameterwidth();
				}
				}
				this.state = 804;
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
		this.enterRule(localctx, 180, StepCodeParser.RULE_parameterwidth);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 805;
			this.match(StepCodeParser.COLON);
			this.state = 806;
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
		this.enterRule(localctx, 182, StepCodeParser.RULE_gotoStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 808;
			this.match(StepCodeParser.GOTO);
			this.state = 809;
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
		this.enterRule(localctx, 184, StepCodeParser.RULE_emptyStatement_);
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
		this.enterRule(localctx, 186, StepCodeParser.RULE_empty_);
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
		this.enterRule(localctx, 188, StepCodeParser.RULE_structuredStatement);
		try {
			this.state = 818;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 6:
			case 26:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 815;
				this.conditionalStatement();
				}
				break;
			case 20:
			case 47:
			case 56:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 816;
				this.repetetiveStatement();
				}
				break;
			case 57:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 817;
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
		this.enterRule(localctx, 190, StepCodeParser.RULE_compoundStatement);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 823;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 62, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 820;
					this.statements();
					}
					}
				}
				this.state = 825;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 62, this._ctx);
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
		this.enterRule(localctx, 192, StepCodeParser.RULE_statements);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 826;
			this.statement();
			this.state = 831;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 827;
					this.match(StepCodeParser.SEMI);
					this.state = 828;
					this.statement();
					}
					}
				}
				this.state = 833;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
			}
			this.state = 835;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 64, this._ctx) ) {
			case 1:
				{
				this.state = 834;
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
		this.enterRule(localctx, 194, StepCodeParser.RULE_conditionalStatement);
		try {
			this.state = 839;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 26:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 837;
				this.ifStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 838;
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
		this.enterRule(localctx, 196, StepCodeParser.RULE_ifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 841;
			this.match(StepCodeParser.IF);
			this.state = 842;
			this.expression(0);
			this.state = 843;
			this.match(StepCodeParser.THEN);
			this.state = 844;
			this.compoundStatement();
			this.state = 849;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 13:
				{
				this.state = 845;
				this.elifStatement();
				}
				break;
			case 14:
			case 25:
				{
				this.state = 847;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 846;
					this.elseStatement();
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 851;
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
		this.enterRule(localctx, 198, StepCodeParser.RULE_elifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 853;
			this.match(StepCodeParser.ELIF);
			this.state = 854;
			this.expression(0);
			this.state = 855;
			this.match(StepCodeParser.THEN);
			this.state = 856;
			this.compoundStatement();
			this.state = 862;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 69, this._ctx) ) {
			case 1:
				{
				this.state = 857;
				this.elifStatement();
				}
				break;
			case 2:
				{
				this.state = 859;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 858;
					this.elseStatement();
					}
				}

				}
				break;
			case 3:
				{
				this.state = 861;
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
		this.enterRule(localctx, 200, StepCodeParser.RULE_elseStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 864;
			this.match(StepCodeParser.ELSE);
			this.state = 865;
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
		this.enterRule(localctx, 202, StepCodeParser.RULE_caseStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 867;
			this.match(StepCodeParser.CASE);
			this.state = 868;
			this.expression(0);
			this.state = 869;
			_la = this._input.LA(1);
			if(!(_la===34 || _la===35)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 873;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8 || _la===58 || _la===59 || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 15) !== 0)) {
				{
				{
				this.state = 870;
				this.caseListElement();
				}
				}
				this.state = 875;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 877;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14 || _la===15) {
				{
				this.state = 876;
				this.caseOtherWise();
				}
			}

			this.state = 879;
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
		this.enterRule(localctx, 204, StepCodeParser.RULE_caseListElement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 881;
			this.constList();
			this.state = 882;
			_la = this._input.LA(1);
			if(!(_la===66 || _la===85)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 883;
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
		this.enterRule(localctx, 206, StepCodeParser.RULE_caseOtherWise);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 888;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				{
				this.state = 885;
				this.match(StepCodeParser.ELSE);
				}
				break;
			case 15:
				{
				{
				this.state = 886;
				this.match(StepCodeParser.OTHERWISE);
				this.state = 887;
				this.match(StepCodeParser.COLON);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 890;
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
		this.enterRule(localctx, 208, StepCodeParser.RULE_repetetiveStatement);
		try {
			this.state = 895;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 56:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 892;
				this.whileStatement();
				}
				break;
			case 47:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 893;
				this.repeatStatement();
				}
				break;
			case 20:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 894;
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
		this.enterRule(localctx, 210, StepCodeParser.RULE_whileStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 897;
			this.match(StepCodeParser.WHILE);
			this.state = 898;
			this.expression(0);
			this.state = 899;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===35)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 900;
			this.compoundStatement();
			this.state = 901;
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
		this.enterRule(localctx, 212, StepCodeParser.RULE_repeatStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 903;
			this.match(StepCodeParser.REPEAT);
			this.state = 904;
			this.compoundStatement();
			this.state = 905;
			_la = this._input.LA(1);
			if(!(_la===50 || _la===55)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 906;
			this.expression(0);
			this.state = 907;
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
		this.enterRule(localctx, 214, StepCodeParser.RULE_forStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 909;
			this.match(StepCodeParser.FOR);
			this.state = 910;
			this.identifier();
			this.state = 911;
			this.match(StepCodeParser.ASSIGN);
			this.state = 912;
			this.forList();
			this.state = 915;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===18) {
				{
				this.state = 913;
				this.match(StepCodeParser.WITHSTEP);
				this.state = 914;
				this.stepValue();
				}
			}

			this.state = 917;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===35)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 918;
			this.compoundStatement();
			this.state = 919;
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
		this.enterRule(localctx, 216, StepCodeParser.RULE_forList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 921;
			this.initialValue();
			this.state = 922;
			_la = this._input.LA(1);
			if(!(_la===12 || _la===51)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 923;
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
		this.enterRule(localctx, 218, StepCodeParser.RULE_initialValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 925;
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
		this.enterRule(localctx, 220, StepCodeParser.RULE_finalValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 927;
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
		this.enterRule(localctx, 222, StepCodeParser.RULE_stepValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 929;
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
		this.enterRule(localctx, 224, StepCodeParser.RULE_withStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 931;
			this.match(StepCodeParser.WITH);
			this.state = 932;
			this.recordVariableList();
			this.state = 933;
			this.match(StepCodeParser.DO);
			this.state = 934;
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
		this.enterRule(localctx, 226, StepCodeParser.RULE_recordVariableList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 936;
			this.variable();
			this.state = 941;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 937;
				this.match(StepCodeParser.COMMA);
				this.state = 938;
				this.variable();
				}
				}
				this.state = 943;
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
		this.enterRule(localctx, 228, StepCodeParser.RULE_writeStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 944;
			this.match(StepCodeParser.WRITE);
			this.state = 945;
			this.expression(0);
			this.state = 950;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 946;
				this.match(StepCodeParser.COMMA);
				this.state = 947;
				this.expression(0);
				}
				}
				this.state = 952;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 953;
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
		this.enterRule(localctx, 230, StepCodeParser.RULE_readStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 955;
			this.match(StepCodeParser.READ);
			this.state = 956;
			this.variable();
			this.state = 961;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 957;
				this.match(StepCodeParser.COMMA);
				this.state = 958;
				this.variable();
				}
				}
				this.state = 963;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 964;
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
		case 70:
			return this.expression_sempred(localctx as ExpressionContext, predIndex);
		case 71:
			return this.booleanMultiplicativeExpression_sempred(localctx as BooleanMultiplicativeExpressionContext, predIndex);
		case 72:
			return this.booleanRelationalExpression_sempred(localctx as BooleanRelationalExpressionContext, predIndex);
		case 74:
			return this.simpleExpression_sempred(localctx as SimpleExpressionContext, predIndex);
		case 76:
			return this.term_sempred(localctx as TermContext, predIndex);
		case 77:
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

	public static readonly _serializedATN: number[] = [4,1,101,967,2,0,7,0,
	2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,
	2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,
	17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,
	7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,
	31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,
	2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,
	46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,2,53,
	7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,60,7,
	60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,2,66,7,66,2,67,7,67,
	2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,72,7,72,2,73,7,73,2,74,7,74,2,
	75,7,75,2,76,7,76,2,77,7,77,2,78,7,78,2,79,7,79,2,80,7,80,2,81,7,81,2,82,
	7,82,2,83,7,83,2,84,7,84,2,85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,89,7,
	89,2,90,7,90,2,91,7,91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,7,96,
	2,97,7,97,2,98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,2,102,7,102,2,103,
	7,103,2,104,7,104,2,105,7,105,2,106,7,106,2,107,7,107,2,108,7,108,2,109,
	7,109,2,110,7,110,2,111,7,111,2,112,7,112,2,113,7,113,2,114,7,114,2,115,
	7,115,1,0,5,0,234,8,0,10,0,12,0,237,9,0,1,0,1,0,5,0,241,8,0,10,0,12,0,244,
	9,0,1,0,1,0,1,1,1,1,3,1,250,8,1,1,1,1,1,1,1,1,2,1,2,1,3,1,3,1,3,1,3,1,3,
	1,3,3,3,263,8,3,1,3,1,3,3,3,267,8,3,1,4,1,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,
	1,5,1,5,5,5,280,8,5,10,5,12,5,283,9,5,1,6,1,6,1,6,1,6,1,7,1,7,1,7,1,7,5,
	7,293,8,7,10,7,12,7,296,9,7,1,7,1,7,1,8,1,8,1,9,1,9,1,9,1,9,4,9,306,8,9,
	11,9,12,9,307,1,10,1,10,1,10,1,10,1,11,1,11,1,11,1,11,1,11,1,12,1,12,1,
	12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,3,12,329,8,12,1,13,1,13,3,13,333,
	8,13,1,14,1,14,1,15,1,15,1,16,1,16,1,17,1,17,1,18,1,18,1,19,1,19,1,19,1,
	19,4,19,349,8,19,11,19,12,19,350,1,20,1,20,1,20,1,20,1,20,3,20,358,8,20,
	1,21,1,21,3,21,362,8,21,1,21,1,21,1,21,1,22,1,22,3,22,369,8,22,1,23,1,23,
	1,23,3,23,374,8,23,1,24,1,24,1,24,1,24,3,24,380,8,24,1,25,1,25,1,25,1,25,
	1,26,1,26,1,26,1,26,1,27,1,27,3,27,392,8,27,1,28,1,28,1,28,3,28,397,8,28,
	1,29,1,29,1,29,1,29,3,29,403,8,29,1,30,1,30,1,30,1,30,3,30,409,8,30,1,30,
	1,30,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,
	31,3,31,427,8,31,1,32,1,32,1,32,1,32,1,32,1,33,1,33,1,33,1,33,5,33,438,
	8,33,10,33,12,33,441,9,33,1,33,1,33,1,34,1,34,1,34,5,34,448,8,34,10,34,
	12,34,451,9,34,1,35,1,35,1,36,1,36,1,37,1,37,3,37,459,8,37,1,37,1,37,1,
	38,1,38,1,38,3,38,466,8,38,1,38,3,38,469,8,38,1,39,1,39,1,39,5,39,474,8,
	39,10,39,12,39,477,9,39,1,40,1,40,1,40,1,40,1,41,1,41,1,41,1,41,1,41,1,
	41,5,41,489,8,41,10,41,12,41,492,9,41,1,42,1,42,1,42,1,42,1,42,3,42,499,
	8,42,1,43,1,43,1,43,1,43,1,43,1,43,1,44,1,44,1,44,1,44,1,45,1,45,1,46,1,
	46,1,46,1,46,3,46,517,8,46,1,47,1,47,1,47,1,48,1,48,1,48,1,48,1,49,1,49,
	1,49,1,49,1,50,1,50,1,50,1,51,1,51,3,51,535,8,51,1,52,1,52,1,52,3,52,540,
	8,52,1,52,1,52,1,52,1,53,1,53,1,53,1,53,1,54,1,54,1,54,5,54,552,8,54,10,
	54,12,54,555,9,54,1,55,1,55,1,55,5,55,560,8,55,10,55,12,55,563,9,55,1,56,
	1,56,1,56,3,56,568,8,56,1,56,3,56,571,8,56,1,57,1,57,1,57,5,57,576,8,57,
	10,57,12,57,579,9,57,1,58,1,58,1,58,3,58,584,8,58,1,58,1,58,1,58,1,58,1,
	58,1,59,1,59,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,3,60,603,
	8,60,1,61,1,61,1,61,1,62,1,62,3,62,610,8,62,1,62,1,62,1,63,1,63,1,63,1,
	64,1,64,3,64,619,8,64,1,65,1,65,1,65,3,65,624,8,65,1,66,1,66,1,66,1,66,
	1,66,1,67,1,67,5,67,633,8,67,10,67,12,67,636,9,67,1,68,1,68,1,69,1,69,1,
	69,1,69,5,69,644,8,69,10,69,12,69,647,9,69,1,69,1,69,1,70,1,70,1,70,1,70,
	1,70,1,70,5,70,657,8,70,10,70,12,70,660,9,70,1,71,1,71,1,71,1,71,1,71,1,
	71,5,71,668,8,71,10,71,12,71,671,9,71,1,72,1,72,1,72,1,72,1,72,1,72,1,72,
	5,72,680,8,72,10,72,12,72,683,9,72,1,73,1,73,1,74,1,74,1,74,1,74,1,74,1,
	74,1,74,5,74,694,8,74,10,74,12,74,697,9,74,1,75,1,75,1,76,1,76,1,76,1,76,
	1,76,1,76,1,76,5,76,708,8,76,10,76,12,76,711,9,76,1,77,1,77,1,77,1,77,1,
	77,1,77,1,77,5,77,720,8,77,10,77,12,77,723,9,77,1,78,1,78,1,79,1,79,1,80,
	3,80,730,8,80,1,80,1,80,1,81,1,81,1,81,1,81,1,81,1,81,1,81,1,81,1,81,1,
	81,1,81,3,81,745,8,81,1,82,1,82,1,82,1,82,3,82,751,8,82,1,83,1,83,1,83,
	1,83,1,83,1,84,1,84,1,84,5,84,761,8,84,10,84,12,84,764,9,84,1,85,1,85,1,
	85,1,85,1,85,1,85,1,85,1,85,3,85,774,8,85,1,86,1,86,1,86,5,86,779,8,86,
	10,86,12,86,782,9,86,1,86,3,86,785,8,86,1,87,1,87,1,87,3,87,790,8,87,1,
	88,1,88,1,88,3,88,795,8,88,1,88,1,88,1,89,1,89,5,89,801,8,89,10,89,12,89,
	804,9,89,1,90,1,90,1,90,1,91,1,91,1,91,1,92,1,92,1,93,1,93,1,94,1,94,1,
	94,3,94,819,8,94,1,95,5,95,822,8,95,10,95,12,95,825,9,95,1,96,1,96,1,96,
	5,96,830,8,96,10,96,12,96,833,9,96,1,96,3,96,836,8,96,1,97,1,97,3,97,840,
	8,97,1,98,1,98,1,98,1,98,1,98,1,98,3,98,848,8,98,3,98,850,8,98,1,98,1,98,
	1,99,1,99,1,99,1,99,1,99,1,99,3,99,860,8,99,1,99,3,99,863,8,99,1,100,1,
	100,1,100,1,101,1,101,1,101,1,101,5,101,872,8,101,10,101,12,101,875,9,101,
	1,101,3,101,878,8,101,1,101,1,101,1,102,1,102,1,102,1,102,1,103,1,103,1,
	103,3,103,889,8,103,1,103,1,103,1,104,1,104,1,104,3,104,896,8,104,1,105,
	1,105,1,105,1,105,1,105,1,105,1,106,1,106,1,106,1,106,1,106,1,106,1,107,
	1,107,1,107,1,107,1,107,1,107,3,107,916,8,107,1,107,1,107,1,107,1,107,1,
	108,1,108,1,108,1,108,1,109,1,109,1,110,1,110,1,111,1,111,1,112,1,112,1,
	112,1,112,1,112,1,113,1,113,1,113,5,113,940,8,113,10,113,12,113,943,9,113,
	1,114,1,114,1,114,1,114,5,114,949,8,114,10,114,12,114,952,9,114,1,114,1,
	114,1,115,1,115,1,115,1,115,5,115,960,8,115,10,115,12,115,963,9,115,1,115,
	1,115,1,115,0,6,140,142,144,148,152,154,116,0,2,4,6,8,10,12,14,16,18,20,
	22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,
	70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,112,
	114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,144,146,148,
	150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,
	186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,
	222,224,226,228,230,0,11,1,0,58,59,1,0,91,92,5,0,4,4,7,7,28,28,45,45,89,
	89,1,0,21,22,2,0,27,27,67,72,3,0,10,10,31,31,61,62,1,0,34,35,2,0,66,66,
	85,85,2,0,11,11,35,35,2,0,50,50,55,55,2,0,12,12,51,51,961,0,235,1,0,0,0,
	2,247,1,0,0,0,4,254,1,0,0,0,6,266,1,0,0,0,8,268,1,0,0,0,10,281,1,0,0,0,
	12,284,1,0,0,0,14,288,1,0,0,0,16,299,1,0,0,0,18,301,1,0,0,0,20,309,1,0,
	0,0,22,313,1,0,0,0,24,328,1,0,0,0,26,332,1,0,0,0,28,334,1,0,0,0,30,336,
	1,0,0,0,32,338,1,0,0,0,34,340,1,0,0,0,36,342,1,0,0,0,38,344,1,0,0,0,40,
	352,1,0,0,0,42,359,1,0,0,0,44,366,1,0,0,0,46,373,1,0,0,0,48,379,1,0,0,0,
	50,381,1,0,0,0,52,385,1,0,0,0,54,391,1,0,0,0,56,396,1,0,0,0,58,402,1,0,
	0,0,60,404,1,0,0,0,62,426,1,0,0,0,64,428,1,0,0,0,66,433,1,0,0,0,68,444,
	1,0,0,0,70,452,1,0,0,0,72,454,1,0,0,0,74,456,1,0,0,0,76,468,1,0,0,0,78,
	470,1,0,0,0,80,478,1,0,0,0,82,482,1,0,0,0,84,498,1,0,0,0,86,500,1,0,0,0,
	88,506,1,0,0,0,90,510,1,0,0,0,92,516,1,0,0,0,94,518,1,0,0,0,96,521,1,0,
	0,0,98,525,1,0,0,0,100,529,1,0,0,0,102,534,1,0,0,0,104,536,1,0,0,0,106,
	544,1,0,0,0,108,548,1,0,0,0,110,556,1,0,0,0,112,564,1,0,0,0,114,572,1,0,
	0,0,116,580,1,0,0,0,118,590,1,0,0,0,120,602,1,0,0,0,122,604,1,0,0,0,124,
	607,1,0,0,0,126,613,1,0,0,0,128,618,1,0,0,0,130,623,1,0,0,0,132,625,1,0,
	0,0,134,630,1,0,0,0,136,637,1,0,0,0,138,639,1,0,0,0,140,650,1,0,0,0,142,
	661,1,0,0,0,144,672,1,0,0,0,146,684,1,0,0,0,148,686,1,0,0,0,150,698,1,0,
	0,0,152,700,1,0,0,0,154,712,1,0,0,0,156,724,1,0,0,0,158,726,1,0,0,0,160,
	729,1,0,0,0,162,744,1,0,0,0,164,750,1,0,0,0,166,752,1,0,0,0,168,757,1,0,
	0,0,170,773,1,0,0,0,172,784,1,0,0,0,174,786,1,0,0,0,176,791,1,0,0,0,178,
	798,1,0,0,0,180,805,1,0,0,0,182,808,1,0,0,0,184,811,1,0,0,0,186,813,1,0,
	0,0,188,818,1,0,0,0,190,823,1,0,0,0,192,826,1,0,0,0,194,839,1,0,0,0,196,
	841,1,0,0,0,198,853,1,0,0,0,200,864,1,0,0,0,202,867,1,0,0,0,204,881,1,0,
	0,0,206,888,1,0,0,0,208,895,1,0,0,0,210,897,1,0,0,0,212,903,1,0,0,0,214,
	909,1,0,0,0,216,921,1,0,0,0,218,925,1,0,0,0,220,927,1,0,0,0,222,929,1,0,
	0,0,224,931,1,0,0,0,226,936,1,0,0,0,228,944,1,0,0,0,230,955,1,0,0,0,232,
	234,3,4,2,0,233,232,1,0,0,0,234,237,1,0,0,0,235,233,1,0,0,0,235,236,1,0,
	0,0,236,238,1,0,0,0,237,235,1,0,0,0,238,242,3,2,1,0,239,241,3,4,2,0,240,
	239,1,0,0,0,241,244,1,0,0,0,242,240,1,0,0,0,242,243,1,0,0,0,243,245,1,0,
	0,0,244,242,1,0,0,0,245,246,5,0,0,1,246,1,1,0,0,0,247,249,3,6,3,0,248,250,
	5,87,0,0,249,248,1,0,0,0,249,250,1,0,0,0,250,251,1,0,0,0,251,252,3,10,5,
	0,252,253,5,41,0,0,253,3,1,0,0,0,254,255,3,102,51,0,255,5,1,0,0,0,256,257,
	5,40,0,0,257,262,3,8,4,0,258,259,5,73,0,0,259,260,3,110,55,0,260,261,5,
	74,0,0,261,263,1,0,0,0,262,258,1,0,0,0,262,263,1,0,0,0,263,267,1,0,0,0,
	264,265,5,86,0,0,265,267,3,8,4,0,266,256,1,0,0,0,266,264,1,0,0,0,267,7,
	1,0,0,0,268,269,5,98,0,0,269,9,1,0,0,0,270,280,3,14,7,0,271,280,3,18,9,
	0,272,280,3,38,19,0,273,280,3,96,48,0,274,280,3,64,32,0,275,280,3,100,50,
	0,276,280,3,12,6,0,277,280,5,90,0,0,278,280,3,192,96,0,279,270,1,0,0,0,
	279,271,1,0,0,0,279,272,1,0,0,0,279,273,1,0,0,0,279,274,1,0,0,0,279,275,
	1,0,0,0,279,276,1,0,0,0,279,277,1,0,0,0,279,278,1,0,0,0,280,283,1,0,0,0,
	281,279,1,0,0,0,281,282,1,0,0,0,282,11,1,0,0,0,283,281,1,0,0,0,284,285,
	5,88,0,0,285,286,3,110,55,0,286,287,5,65,0,0,287,13,1,0,0,0,288,289,5,29,
	0,0,289,294,3,16,8,0,290,291,5,64,0,0,291,293,3,16,8,0,292,290,1,0,0,0,
	293,296,1,0,0,0,294,292,1,0,0,0,294,295,1,0,0,0,295,297,1,0,0,0,296,294,
	1,0,0,0,297,298,5,65,0,0,298,15,1,0,0,0,299,300,3,28,14,0,300,17,1,0,0,
	0,301,305,5,9,0,0,302,303,3,20,10,0,303,304,5,65,0,0,304,306,1,0,0,0,305,
	302,1,0,0,0,306,307,1,0,0,0,307,305,1,0,0,0,307,308,1,0,0,0,308,19,1,0,
	0,0,309,310,3,8,4,0,310,311,5,67,0,0,311,312,3,24,12,0,312,21,1,0,0,0,313,
	314,5,8,0,0,314,315,5,73,0,0,315,316,3,28,14,0,316,317,5,74,0,0,317,23,
	1,0,0,0,318,329,3,26,13,0,319,320,3,32,16,0,320,321,3,26,13,0,321,329,1,
	0,0,0,322,329,3,8,4,0,323,324,3,32,16,0,324,325,3,8,4,0,325,329,1,0,0,0,
	326,329,3,36,18,0,327,329,3,22,11,0,328,318,1,0,0,0,328,319,1,0,0,0,328,
	322,1,0,0,0,328,323,1,0,0,0,328,326,1,0,0,0,328,327,1,0,0,0,329,25,1,0,
	0,0,330,333,3,28,14,0,331,333,3,30,15,0,332,330,1,0,0,0,332,331,1,0,0,0,
	333,27,1,0,0,0,334,335,5,100,0,0,335,29,1,0,0,0,336,337,5,101,0,0,337,31,
	1,0,0,0,338,339,7,0,0,0,339,33,1,0,0,0,340,341,7,1,0,0,341,35,1,0,0,0,342,
	343,5,99,0,0,343,37,1,0,0,0,344,348,5,52,0,0,345,346,3,40,20,0,346,347,
	5,65,0,0,347,349,1,0,0,0,348,345,1,0,0,0,349,350,1,0,0,0,350,348,1,0,0,
	0,350,351,1,0,0,0,351,39,1,0,0,0,352,353,3,8,4,0,353,357,5,67,0,0,354,358,
	3,46,23,0,355,358,3,42,21,0,356,358,3,44,22,0,357,354,1,0,0,0,357,355,1,
	0,0,0,357,356,1,0,0,0,358,41,1,0,0,0,359,361,5,23,0,0,360,362,3,106,53,
	0,361,360,1,0,0,0,361,362,1,0,0,0,362,363,1,0,0,0,363,364,5,66,0,0,364,
	365,3,118,59,0,365,43,1,0,0,0,366,368,5,39,0,0,367,369,3,106,53,0,368,367,
	1,0,0,0,368,369,1,0,0,0,369,45,1,0,0,0,370,374,3,48,24,0,371,374,3,56,28,
	0,372,374,3,94,47,0,373,370,1,0,0,0,373,371,1,0,0,0,373,372,1,0,0,0,374,
	47,1,0,0,0,375,380,3,50,25,0,376,380,3,52,26,0,377,380,3,54,27,0,378,380,
	3,60,30,0,379,375,1,0,0,0,379,376,1,0,0,0,379,377,1,0,0,0,379,378,1,0,0,
	0,380,49,1,0,0,0,381,382,5,73,0,0,382,383,3,110,55,0,383,384,5,74,0,0,384,
	51,1,0,0,0,385,386,3,24,12,0,386,387,5,82,0,0,387,388,3,24,12,0,388,53,
	1,0,0,0,389,392,3,8,4,0,390,392,7,2,0,0,391,389,1,0,0,0,391,390,1,0,0,0,
	392,55,1,0,0,0,393,394,5,37,0,0,394,397,3,58,29,0,395,397,3,58,29,0,396,
	393,1,0,0,0,396,395,1,0,0,0,397,57,1,0,0,0,398,403,3,62,31,0,399,403,3,
	74,37,0,400,403,3,88,44,0,401,403,3,92,46,0,402,398,1,0,0,0,402,399,1,0,
	0,0,402,400,1,0,0,0,402,401,1,0,0,0,403,59,1,0,0,0,404,405,5,89,0,0,405,
	408,5,75,0,0,406,409,3,8,4,0,407,409,3,26,13,0,408,406,1,0,0,0,408,407,
	1,0,0,0,409,410,1,0,0,0,410,411,5,77,0,0,411,61,1,0,0,0,412,413,5,2,0,0,
	413,414,5,75,0,0,414,415,3,68,34,0,415,416,5,77,0,0,416,417,5,34,0,0,417,
	418,3,72,36,0,418,427,1,0,0,0,419,420,5,2,0,0,420,421,5,76,0,0,421,422,
	3,68,34,0,422,423,5,78,0,0,423,424,5,34,0,0,424,425,3,72,36,0,425,427,1,
	0,0,0,426,412,1,0,0,0,426,419,1,0,0,0,427,63,1,0,0,0,428,429,5,30,0,0,429,
	430,3,8,4,0,430,431,3,66,33,0,431,432,5,65,0,0,432,65,1,0,0,0,433,434,5,
	75,0,0,434,439,3,26,13,0,435,436,5,64,0,0,436,438,3,26,13,0,437,435,1,0,
	0,0,438,441,1,0,0,0,439,437,1,0,0,0,439,440,1,0,0,0,440,442,1,0,0,0,441,
	439,1,0,0,0,442,443,5,77,0,0,443,67,1,0,0,0,444,449,3,70,35,0,445,446,5,
	64,0,0,446,448,3,70,35,0,447,445,1,0,0,0,448,451,1,0,0,0,449,447,1,0,0,
	0,449,450,1,0,0,0,450,69,1,0,0,0,451,449,1,0,0,0,452,453,3,48,24,0,453,
	71,1,0,0,0,454,455,3,46,23,0,455,73,1,0,0,0,456,458,5,46,0,0,457,459,3,
	76,38,0,458,457,1,0,0,0,458,459,1,0,0,0,459,460,1,0,0,0,460,461,5,16,0,
	0,461,75,1,0,0,0,462,465,3,78,39,0,463,464,5,65,0,0,464,466,3,82,41,0,465,
	463,1,0,0,0,465,466,1,0,0,0,466,469,1,0,0,0,467,469,3,82,41,0,468,462,1,
	0,0,0,468,467,1,0,0,0,469,77,1,0,0,0,470,475,3,80,40,0,471,472,5,65,0,0,
	472,474,3,80,40,0,473,471,1,0,0,0,474,477,1,0,0,0,475,473,1,0,0,0,475,476,
	1,0,0,0,476,79,1,0,0,0,477,475,1,0,0,0,478,479,3,110,55,0,479,480,5,66,
	0,0,480,481,3,46,23,0,481,81,1,0,0,0,482,483,5,6,0,0,483,484,3,84,42,0,
	484,485,5,34,0,0,485,490,3,86,43,0,486,487,5,65,0,0,487,489,3,86,43,0,488,
	486,1,0,0,0,489,492,1,0,0,0,490,488,1,0,0,0,490,491,1,0,0,0,491,83,1,0,
	0,0,492,490,1,0,0,0,493,494,3,8,4,0,494,495,5,66,0,0,495,496,3,54,27,0,
	496,499,1,0,0,0,497,499,3,54,27,0,498,493,1,0,0,0,498,497,1,0,0,0,499,85,
	1,0,0,0,500,501,3,114,57,0,501,502,5,66,0,0,502,503,5,73,0,0,503,504,3,
	76,38,0,504,505,5,74,0,0,505,87,1,0,0,0,506,507,5,48,0,0,507,508,5,34,0,
	0,508,509,3,90,45,0,509,89,1,0,0,0,510,511,3,48,24,0,511,91,1,0,0,0,512,
	513,5,17,0,0,513,514,5,34,0,0,514,517,3,46,23,0,515,517,5,17,0,0,516,512,
	1,0,0,0,516,515,1,0,0,0,517,93,1,0,0,0,518,519,5,79,0,0,519,520,3,54,27,
	0,520,95,1,0,0,0,521,522,5,53,0,0,522,523,3,98,49,0,523,524,5,65,0,0,524,
	97,1,0,0,0,525,526,3,110,55,0,526,527,5,85,0,0,527,528,3,46,23,0,528,99,
	1,0,0,0,529,530,3,102,51,0,530,531,5,65,0,0,531,101,1,0,0,0,532,535,3,104,
	52,0,533,535,3,116,58,0,534,532,1,0,0,0,534,533,1,0,0,0,535,103,1,0,0,0,
	536,537,5,39,0,0,537,539,3,8,4,0,538,540,3,106,53,0,539,538,1,0,0,0,539,
	540,1,0,0,0,540,541,1,0,0,0,541,542,3,10,5,0,542,543,5,38,0,0,543,105,1,
	0,0,0,544,545,5,73,0,0,545,546,3,108,54,0,546,547,5,74,0,0,547,107,1,0,
	0,0,548,553,3,112,56,0,549,550,5,64,0,0,550,552,3,112,56,0,551,549,1,0,
	0,0,552,555,1,0,0,0,553,551,1,0,0,0,553,554,1,0,0,0,554,109,1,0,0,0,555,
	553,1,0,0,0,556,561,3,8,4,0,557,558,5,64,0,0,558,560,3,8,4,0,559,557,1,
	0,0,0,560,563,1,0,0,0,561,559,1,0,0,0,561,562,1,0,0,0,562,111,1,0,0,0,563,
	561,1,0,0,0,564,567,3,8,4,0,565,566,5,66,0,0,566,568,3,54,27,0,567,565,
	1,0,0,0,567,568,1,0,0,0,568,570,1,0,0,0,569,571,7,3,0,0,570,569,1,0,0,0,
	570,571,1,0,0,0,571,113,1,0,0,0,572,577,3,24,12,0,573,574,5,64,0,0,574,
	576,3,24,12,0,575,573,1,0,0,0,576,579,1,0,0,0,577,575,1,0,0,0,577,578,1,
	0,0,0,578,115,1,0,0,0,579,577,1,0,0,0,580,581,5,23,0,0,581,583,3,8,4,0,
	582,584,3,106,53,0,583,582,1,0,0,0,583,584,1,0,0,0,584,585,1,0,0,0,585,
	586,5,66,0,0,586,587,3,118,59,0,587,588,5,65,0,0,588,589,3,10,5,0,589,117,
	1,0,0,0,590,591,3,54,27,0,591,119,1,0,0,0,592,593,3,16,8,0,593,594,5,66,
	0,0,594,595,3,128,64,0,595,603,1,0,0,0,596,603,3,128,64,0,597,603,3,228,
	114,0,598,603,3,230,115,0,599,603,3,122,61,0,600,603,3,126,63,0,601,603,
	3,124,62,0,602,592,1,0,0,0,602,596,1,0,0,0,602,597,1,0,0,0,602,598,1,0,
	0,0,602,599,1,0,0,0,602,600,1,0,0,0,602,601,1,0,0,0,603,121,1,0,0,0,604,
	605,5,42,0,0,605,606,5,65,0,0,606,123,1,0,0,0,607,609,5,44,0,0,608,610,
	3,140,70,0,609,608,1,0,0,0,609,610,1,0,0,0,610,611,1,0,0,0,611,612,5,65,
	0,0,612,125,1,0,0,0,613,614,5,43,0,0,614,615,5,65,0,0,615,127,1,0,0,0,616,
	619,3,130,65,0,617,619,3,188,94,0,618,616,1,0,0,0,618,617,1,0,0,0,619,129,
	1,0,0,0,620,624,3,132,66,0,621,624,3,176,88,0,622,624,3,182,91,0,623,620,
	1,0,0,0,623,621,1,0,0,0,623,622,1,0,0,0,624,131,1,0,0,0,625,626,3,134,67,
	0,626,627,5,63,0,0,627,628,3,140,70,0,628,629,5,65,0,0,629,133,1,0,0,0,
	630,634,3,8,4,0,631,633,3,136,68,0,632,631,1,0,0,0,633,636,1,0,0,0,634,
	632,1,0,0,0,634,635,1,0,0,0,635,135,1,0,0,0,636,634,1,0,0,0,637,638,3,138,
	69,0,638,137,1,0,0,0,639,640,5,75,0,0,640,645,3,140,70,0,641,642,5,64,0,
	0,642,644,3,140,70,0,643,641,1,0,0,0,644,647,1,0,0,0,645,643,1,0,0,0,645,
	646,1,0,0,0,646,648,1,0,0,0,647,645,1,0,0,0,648,649,5,77,0,0,649,139,1,
	0,0,0,650,651,6,70,-1,0,651,652,3,142,71,0,652,658,1,0,0,0,653,654,10,1,
	0,0,654,655,5,36,0,0,655,657,3,140,70,2,656,653,1,0,0,0,657,660,1,0,0,0,
	658,656,1,0,0,0,658,659,1,0,0,0,659,141,1,0,0,0,660,658,1,0,0,0,661,662,
	6,71,-1,0,662,663,3,144,72,0,663,669,1,0,0,0,664,665,10,1,0,0,665,666,5,
	1,0,0,666,668,3,142,71,2,667,664,1,0,0,0,668,671,1,0,0,0,669,667,1,0,0,
	0,669,670,1,0,0,0,670,143,1,0,0,0,671,669,1,0,0,0,672,673,6,72,-1,0,673,
	674,3,148,74,0,674,681,1,0,0,0,675,676,10,1,0,0,676,677,3,146,73,0,677,
	678,3,144,72,2,678,680,1,0,0,0,679,675,1,0,0,0,680,683,1,0,0,0,681,679,
	1,0,0,0,681,682,1,0,0,0,682,145,1,0,0,0,683,681,1,0,0,0,684,685,7,4,0,0,
	685,147,1,0,0,0,686,687,6,74,-1,0,687,688,3,152,76,0,688,695,1,0,0,0,689,
	690,10,1,0,0,690,691,3,150,75,0,691,692,3,148,74,2,692,694,1,0,0,0,693,
	689,1,0,0,0,694,697,1,0,0,0,695,693,1,0,0,0,695,696,1,0,0,0,696,149,1,0,
	0,0,697,695,1,0,0,0,698,699,7,0,0,0,699,151,1,0,0,0,700,701,6,76,-1,0,701,
	702,3,154,77,0,702,709,1,0,0,0,703,704,10,1,0,0,704,705,3,156,78,0,705,
	706,3,152,76,2,706,708,1,0,0,0,707,703,1,0,0,0,708,711,1,0,0,0,709,707,
	1,0,0,0,709,710,1,0,0,0,710,153,1,0,0,0,711,709,1,0,0,0,712,713,6,77,-1,
	0,713,714,3,160,80,0,714,721,1,0,0,0,715,716,10,1,0,0,716,717,3,158,79,
	0,717,718,3,154,77,2,718,720,1,0,0,0,719,715,1,0,0,0,720,723,1,0,0,0,721,
	719,1,0,0,0,721,722,1,0,0,0,722,155,1,0,0,0,723,721,1,0,0,0,724,725,7,5,
	0,0,725,157,1,0,0,0,726,727,5,60,0,0,727,159,1,0,0,0,728,730,7,0,0,0,729,
	728,1,0,0,0,729,730,1,0,0,0,730,731,1,0,0,0,731,732,3,162,81,0,732,161,
	1,0,0,0,733,745,3,134,67,0,734,735,5,73,0,0,735,736,3,140,70,0,736,737,
	5,74,0,0,737,745,1,0,0,0,738,745,3,166,83,0,739,745,3,164,82,0,740,745,
	3,170,85,0,741,742,5,33,0,0,742,745,3,162,81,0,743,745,3,34,17,0,744,733,
	1,0,0,0,744,734,1,0,0,0,744,738,1,0,0,0,744,739,1,0,0,0,744,740,1,0,0,0,
	744,741,1,0,0,0,744,743,1,0,0,0,745,163,1,0,0,0,746,751,3,26,13,0,747,751,
	3,22,11,0,748,751,3,36,18,0,749,751,5,32,0,0,750,746,1,0,0,0,750,747,1,
	0,0,0,750,748,1,0,0,0,750,749,1,0,0,0,751,165,1,0,0,0,752,753,3,8,4,0,753,
	754,5,73,0,0,754,755,3,168,84,0,755,756,5,74,0,0,756,167,1,0,0,0,757,762,
	3,178,89,0,758,759,5,64,0,0,759,761,3,178,89,0,760,758,1,0,0,0,761,764,
	1,0,0,0,762,760,1,0,0,0,762,763,1,0,0,0,763,169,1,0,0,0,764,762,1,0,0,0,
	765,766,5,75,0,0,766,767,3,172,86,0,767,768,5,77,0,0,768,774,1,0,0,0,769,
	770,5,76,0,0,770,771,3,172,86,0,771,772,5,78,0,0,772,774,1,0,0,0,773,765,
	1,0,0,0,773,769,1,0,0,0,774,171,1,0,0,0,775,780,3,174,87,0,776,777,5,64,
	0,0,777,779,3,174,87,0,778,776,1,0,0,0,779,782,1,0,0,0,780,778,1,0,0,0,
	780,781,1,0,0,0,781,785,1,0,0,0,782,780,1,0,0,0,783,785,1,0,0,0,784,775,
	1,0,0,0,784,783,1,0,0,0,785,173,1,0,0,0,786,789,3,140,70,0,787,788,5,82,
	0,0,788,790,3,140,70,0,789,787,1,0,0,0,789,790,1,0,0,0,790,175,1,0,0,0,
	791,792,3,8,4,0,792,794,5,73,0,0,793,795,3,168,84,0,794,793,1,0,0,0,794,
	795,1,0,0,0,795,796,1,0,0,0,796,797,5,74,0,0,797,177,1,0,0,0,798,802,3,
	140,70,0,799,801,3,180,90,0,800,799,1,0,0,0,801,804,1,0,0,0,802,800,1,0,
	0,0,802,803,1,0,0,0,803,179,1,0,0,0,804,802,1,0,0,0,805,806,5,66,0,0,806,
	807,3,140,70,0,807,181,1,0,0,0,808,809,5,24,0,0,809,810,3,16,8,0,810,183,
	1,0,0,0,811,812,1,0,0,0,812,185,1,0,0,0,813,814,1,0,0,0,814,187,1,0,0,0,
	815,819,3,194,97,0,816,819,3,208,104,0,817,819,3,224,112,0,818,815,1,0,
	0,0,818,816,1,0,0,0,818,817,1,0,0,0,819,189,1,0,0,0,820,822,3,192,96,0,
	821,820,1,0,0,0,822,825,1,0,0,0,823,821,1,0,0,0,823,824,1,0,0,0,824,191,
	1,0,0,0,825,823,1,0,0,0,826,831,3,120,60,0,827,828,5,65,0,0,828,830,3,120,
	60,0,829,827,1,0,0,0,830,833,1,0,0,0,831,829,1,0,0,0,831,832,1,0,0,0,832,
	835,1,0,0,0,833,831,1,0,0,0,834,836,5,65,0,0,835,834,1,0,0,0,835,836,1,
	0,0,0,836,193,1,0,0,0,837,840,3,196,98,0,838,840,3,202,101,0,839,837,1,
	0,0,0,839,838,1,0,0,0,840,195,1,0,0,0,841,842,5,26,0,0,842,843,3,140,70,
	0,843,844,5,49,0,0,844,849,3,190,95,0,845,850,3,198,99,0,846,848,3,200,
	100,0,847,846,1,0,0,0,847,848,1,0,0,0,848,850,1,0,0,0,849,845,1,0,0,0,849,
	847,1,0,0,0,850,851,1,0,0,0,851,852,5,25,0,0,852,197,1,0,0,0,853,854,5,
	13,0,0,854,855,3,140,70,0,855,856,5,49,0,0,856,862,3,190,95,0,857,863,3,
	198,99,0,858,860,3,200,100,0,859,858,1,0,0,0,859,860,1,0,0,0,860,863,1,
	0,0,0,861,863,5,25,0,0,862,857,1,0,0,0,862,859,1,0,0,0,862,861,1,0,0,0,
	863,199,1,0,0,0,864,865,5,14,0,0,865,866,3,190,95,0,866,201,1,0,0,0,867,
	868,5,6,0,0,868,869,3,140,70,0,869,873,7,6,0,0,870,872,3,204,102,0,871,
	870,1,0,0,0,872,875,1,0,0,0,873,871,1,0,0,0,873,874,1,0,0,0,874,877,1,0,
	0,0,875,873,1,0,0,0,876,878,3,206,103,0,877,876,1,0,0,0,877,878,1,0,0,0,
	878,879,1,0,0,0,879,880,5,5,0,0,880,203,1,0,0,0,881,882,3,114,57,0,882,
	883,7,7,0,0,883,884,3,190,95,0,884,205,1,0,0,0,885,889,5,14,0,0,886,887,
	5,15,0,0,887,889,5,66,0,0,888,885,1,0,0,0,888,886,1,0,0,0,889,890,1,0,0,
	0,890,891,3,190,95,0,891,207,1,0,0,0,892,896,3,210,105,0,893,896,3,212,
	106,0,894,896,3,214,107,0,895,892,1,0,0,0,895,893,1,0,0,0,895,894,1,0,0,
	0,896,209,1,0,0,0,897,898,5,56,0,0,898,899,3,140,70,0,899,900,7,8,0,0,900,
	901,3,190,95,0,901,902,5,54,0,0,902,211,1,0,0,0,903,904,5,47,0,0,904,905,
	3,190,95,0,905,906,7,9,0,0,906,907,3,140,70,0,907,908,5,65,0,0,908,213,
	1,0,0,0,909,910,5,20,0,0,910,911,3,8,4,0,911,912,5,63,0,0,912,915,3,216,
	108,0,913,914,5,18,0,0,914,916,3,222,111,0,915,913,1,0,0,0,915,916,1,0,
	0,0,916,917,1,0,0,0,917,918,7,8,0,0,918,919,3,190,95,0,919,920,5,19,0,0,
	920,215,1,0,0,0,921,922,3,218,109,0,922,923,7,10,0,0,923,924,3,220,110,
	0,924,217,1,0,0,0,925,926,3,140,70,0,926,219,1,0,0,0,927,928,3,140,70,0,
	928,221,1,0,0,0,929,930,3,140,70,0,930,223,1,0,0,0,931,932,5,57,0,0,932,
	933,3,226,113,0,933,934,5,11,0,0,934,935,3,120,60,0,935,225,1,0,0,0,936,
	941,3,134,67,0,937,938,5,64,0,0,938,940,3,134,67,0,939,937,1,0,0,0,940,
	943,1,0,0,0,941,939,1,0,0,0,941,942,1,0,0,0,942,227,1,0,0,0,943,941,1,0,
	0,0,944,945,5,93,0,0,945,950,3,140,70,0,946,947,5,64,0,0,947,949,3,140,
	70,0,948,946,1,0,0,0,949,952,1,0,0,0,950,948,1,0,0,0,950,951,1,0,0,0,951,
	953,1,0,0,0,952,950,1,0,0,0,953,954,5,65,0,0,954,229,1,0,0,0,955,956,5,
	94,0,0,956,961,3,134,67,0,957,958,5,64,0,0,958,960,3,134,67,0,959,957,1,
	0,0,0,960,963,1,0,0,0,961,959,1,0,0,0,961,962,1,0,0,0,962,964,1,0,0,0,963,
	961,1,0,0,0,964,965,5,65,0,0,965,231,1,0,0,0,78,235,242,249,262,266,279,
	281,294,307,328,332,350,357,361,368,373,379,391,396,402,408,426,439,449,
	458,465,468,475,490,498,516,534,539,553,561,567,570,577,583,602,609,618,
	623,634,645,658,669,681,695,709,721,729,744,750,762,773,780,784,789,794,
	802,818,823,831,835,839,847,849,859,862,873,877,888,895,915,941,950,961];

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
	public main(): MainContext {
		return this.getTypedRuleContext(MainContext, 0) as MainContext;
	}
	public EOF(): TerminalNode {
		return this.getToken(StepCodeParser.EOF, 0);
	}
	public subprogram_list(): SubprogramContext[] {
		return this.getTypedRuleContexts(SubprogramContext) as SubprogramContext[];
	}
	public subprogram(i: number): SubprogramContext {
		return this.getTypedRuleContext(SubprogramContext, i) as SubprogramContext;
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


export class MainContext extends ParserRuleContext {
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
	public INTERFACE(): TerminalNode {
		return this.getToken(StepCodeParser.INTERFACE, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_main;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterMain) {
	 		listener.enterMain(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitMain) {
	 		listener.exitMain(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitMain) {
			return visitor.visitMain(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubprogramContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public procedureOrFunctionDeclaration(): ProcedureOrFunctionDeclarationContext {
		return this.getTypedRuleContext(ProcedureOrFunctionDeclarationContext, 0) as ProcedureOrFunctionDeclarationContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_subprogram;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterSubprogram) {
	 		listener.enterSubprogram(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitSubprogram) {
	 		listener.exitSubprogram(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitSubprogram) {
			return visitor.visitSubprogram(this);
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
	public dimensionStatement_list(): DimensionStatementContext[] {
		return this.getTypedRuleContexts(DimensionStatementContext) as DimensionStatementContext[];
	}
	public dimensionStatement(i: number): DimensionStatementContext {
		return this.getTypedRuleContext(DimensionStatementContext, i) as DimensionStatementContext;
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


export class DimensionStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DIMENSION(): TerminalNode {
		return this.getToken(StepCodeParser.DIMENSION, 0);
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public dimensionType(): DimensionTypeContext {
		return this.getTypedRuleContext(DimensionTypeContext, 0) as DimensionTypeContext;
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_dimensionStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterDimensionStatement) {
	 		listener.enterDimensionStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitDimensionStatement) {
	 		listener.exitDimensionStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitDimensionStatement) {
			return visitor.visitDimensionStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DimensionTypeContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK, 0);
	}
	public unsignedNumber_list(): UnsignedNumberContext[] {
		return this.getTypedRuleContexts(UnsignedNumberContext) as UnsignedNumberContext[];
	}
	public unsignedNumber(i: number): UnsignedNumberContext {
		return this.getTypedRuleContext(UnsignedNumberContext, i) as UnsignedNumberContext;
	}
	public RBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_dimensionType;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterDimensionType) {
	 		listener.enterDimensionType(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitDimensionType) {
	 		listener.exitDimensionType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitDimensionType) {
			return visitor.visitDimensionType(this);
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
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public ENDPROCEDURE(): TerminalNode {
		return this.getToken(StepCodeParser.ENDPROCEDURE, 0);
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
	public formalParameterSection(): FormalParameterSectionContext {
		return this.getTypedRuleContext(FormalParameterSectionContext, 0) as FormalParameterSectionContext;
	}
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
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
	public paramIdentifier_list(): ParamIdentifierContext[] {
		return this.getTypedRuleContexts(ParamIdentifierContext) as ParamIdentifierContext[];
	}
	public paramIdentifier(i: number): ParamIdentifierContext {
		return this.getTypedRuleContext(ParamIdentifierContext, i) as ParamIdentifierContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
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


export class ParamIdentifierContext extends ParserRuleContext {
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
	public BYVALUE(): TerminalNode {
		return this.getToken(StepCodeParser.BYVALUE, 0);
	}
	public BYREFERENCE(): TerminalNode {
		return this.getToken(StepCodeParser.BYREFERENCE, 0);
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_paramIdentifier;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterParamIdentifier) {
	 		listener.enterParamIdentifier(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitParamIdentifier) {
	 		listener.exitParamIdentifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitParamIdentifier) {
			return visitor.visitParamIdentifier(this);
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
	public returnStatement(): ReturnStatementContext {
		return this.getTypedRuleContext(ReturnStatementContext, 0) as ReturnStatementContext;
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


export class ReturnStatementContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public RETURN(): TerminalNode {
		return this.getToken(StepCodeParser.RETURN, 0);
	}
	public SEMI(): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_returnStatement;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterReturnStatement) {
	 		listener.enterReturnStatement(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitReturnStatement) {
	 		listener.exitReturnStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitReturnStatement) {
			return visitor.visitReturnStatement(this);
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
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public RBRACK(): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
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
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
	public parameterList(): ParameterListContext {
		return this.getTypedRuleContext(ParameterListContext, 0) as ParameterListContext;
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
