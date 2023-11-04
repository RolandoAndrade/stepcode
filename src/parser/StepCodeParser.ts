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
	public static readonly CASE = 5;
	public static readonly CHAR = 6;
	public static readonly CHR = 7;
	public static readonly CONST = 8;
	public static readonly DIV = 9;
	public static readonly DO = 10;
	public static readonly DOWNTO = 11;
	public static readonly ELIF = 12;
	public static readonly ELSE = 13;
	public static readonly END = 14;
	public static readonly FILE = 15;
	public static readonly FOR = 16;
	public static readonly FUNCTION = 17;
	public static readonly GOTO = 18;
	public static readonly ENDIF = 19;
	public static readonly IF = 20;
	public static readonly IN = 21;
	public static readonly INTEGER = 22;
	public static readonly LABEL = 23;
	public static readonly MOD = 24;
	public static readonly NIL = 25;
	public static readonly NOT = 26;
	public static readonly OF = 27;
	public static readonly OR = 28;
	public static readonly PACKED = 29;
	public static readonly PROCEDURE = 30;
	public static readonly PROGRAM = 31;
	public static readonly ENDPROGRAM = 32;
	public static readonly REAL = 33;
	public static readonly RECORD = 34;
	public static readonly REPEAT = 35;
	public static readonly SET = 36;
	public static readonly THEN = 37;
	public static readonly TO = 38;
	public static readonly TYPE = 39;
	public static readonly UNTIL = 40;
	public static readonly DEFINE = 41;
	public static readonly WHILE = 42;
	public static readonly WITH = 43;
	public static readonly PLUS = 44;
	public static readonly MINUS = 45;
	public static readonly STAR = 46;
	public static readonly SLASH = 47;
	public static readonly ASSIGN = 48;
	public static readonly COMMA = 49;
	public static readonly SEMI = 50;
	public static readonly COLON = 51;
	public static readonly EQUAL = 52;
	public static readonly NOT_EQUAL = 53;
	public static readonly LT = 54;
	public static readonly LE = 55;
	public static readonly GE = 56;
	public static readonly GT = 57;
	public static readonly LPAREN = 58;
	public static readonly RPAREN = 59;
	public static readonly LBRACK = 60;
	public static readonly LBRACK2 = 61;
	public static readonly RBRACK = 62;
	public static readonly RBRACK2 = 63;
	public static readonly POINTER = 64;
	public static readonly AT = 65;
	public static readonly DOT = 66;
	public static readonly DOTDOT = 67;
	public static readonly LCURLY = 68;
	public static readonly RCURLY = 69;
	public static readonly AS = 70;
	public static readonly UNIT = 71;
	public static readonly INTERFACE = 72;
	public static readonly USES = 73;
	public static readonly STRING = 74;
	public static readonly IMPLEMENTATION = 75;
	public static readonly TRUE = 76;
	public static readonly FALSE = 77;
	public static readonly WRITE = 78;
	public static readonly READ = 79;
	public static readonly WS = 80;
	public static readonly COMMENT_1 = 81;
	public static readonly COMMENT_2 = 82;
	public static readonly IDENT = 83;
	public static readonly STRING_LITERAL = 84;
	public static readonly NUM_INT = 85;
	public static readonly NUM_REAL = 86;
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
	public static readonly RULE_unlabelledStatement = 57;
	public static readonly RULE_simpleStatement = 58;
	public static readonly RULE_assignmentStatement = 59;
	public static readonly RULE_variable = 60;
	public static readonly RULE_expression = 61;
	public static readonly RULE_relationaloperator = 62;
	public static readonly RULE_simpleExpression = 63;
	public static readonly RULE_additiveoperator = 64;
	public static readonly RULE_term = 65;
	public static readonly RULE_multiplicativeoperator = 66;
	public static readonly RULE_signedFactor = 67;
	public static readonly RULE_factor = 68;
	public static readonly RULE_unsignedConstant = 69;
	public static readonly RULE_functionDesignator = 70;
	public static readonly RULE_parameterList = 71;
	public static readonly RULE_set_ = 72;
	public static readonly RULE_elementList = 73;
	public static readonly RULE_element = 74;
	public static readonly RULE_procedureStatement = 75;
	public static readonly RULE_actualParameter = 76;
	public static readonly RULE_parameterwidth = 77;
	public static readonly RULE_gotoStatement = 78;
	public static readonly RULE_emptyStatement_ = 79;
	public static readonly RULE_empty_ = 80;
	public static readonly RULE_structuredStatement = 81;
	public static readonly RULE_compoundStatement = 82;
	public static readonly RULE_statements = 83;
	public static readonly RULE_conditionalStatement = 84;
	public static readonly RULE_ifStatement = 85;
	public static readonly RULE_elifStatement = 86;
	public static readonly RULE_elseStatement = 87;
	public static readonly RULE_caseStatement = 88;
	public static readonly RULE_caseListElement = 89;
	public static readonly RULE_repetetiveStatement = 90;
	public static readonly RULE_whileStatement = 91;
	public static readonly RULE_repeatStatement = 92;
	public static readonly RULE_forStatement = 93;
	public static readonly RULE_forList = 94;
	public static readonly RULE_initialValue = 95;
	public static readonly RULE_finalValue = 96;
	public static readonly RULE_withStatement = 97;
	public static readonly RULE_recordVariableList = 98;
	public static readonly RULE_writeStatement = 99;
	public static readonly RULE_readStatement = 100;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            "'ARRAY'", "'BEGIN'", 
                                                            null, null, 
                                                            null, "'CHR'", 
                                                            "'CONST'", "'DIV'", 
                                                            "'DO'", "'DOWNTO'", 
                                                            null, null, 
                                                            "'END'", "'FILE'", 
                                                            "'FOR'", "'FUNCTION'", 
                                                            "'GOTO'", null, 
                                                            null, "'IN'", 
                                                            null, "'LABEL'", 
                                                            "'MOD'", "'NIL'", 
                                                            null, "'OF'", 
                                                            null, "'PACKED'", 
                                                            "'PROCEDURE'", 
                                                            null, null, 
                                                            "'REAL'", "'RECORD'", 
                                                            "'REPEAT'", 
                                                            "'SET'", null, 
                                                            null, "'TYPE'", 
                                                            "'UNTIL'", null, 
                                                            "'WHILE'", "'WITH'", 
                                                            "'+'", "'-'", 
                                                            "'*'", "'/'", 
                                                            null, "','", 
                                                            "';'", "':'", 
                                                            "'='", null, 
                                                            "'<'", null, 
                                                            null, "'>'", 
                                                            "'('", "')'", 
                                                            "'['", "'(.'", 
                                                            "']'", "'.)'", 
                                                            "'^'", "'@'", 
                                                            "'.'", "'..'", 
                                                            "'{'", "'}'", 
                                                            "'COMO'", "'UNIT'", 
                                                            "'INTERFACE'", 
                                                            "'USES'", null, 
                                                            "'IMPLEMENTATION'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "AND", 
                                                             "ARRAY", "BEGIN", 
                                                             "BOOLEAN", 
                                                             "CASE", "CHAR", 
                                                             "CHR", "CONST", 
                                                             "DIV", "DO", 
                                                             "DOWNTO", "ELIF", 
                                                             "ELSE", "END", 
                                                             "FILE", "FOR", 
                                                             "FUNCTION", 
                                                             "GOTO", "ENDIF", 
                                                             "IF", "IN", 
                                                             "INTEGER", 
                                                             "LABEL", "MOD", 
                                                             "NIL", "NOT", 
                                                             "OF", "OR", 
                                                             "PACKED", "PROCEDURE", 
                                                             "PROGRAM", 
                                                             "ENDPROGRAM", 
                                                             "REAL", "RECORD", 
                                                             "REPEAT", "SET", 
                                                             "THEN", "TO", 
                                                             "TYPE", "UNTIL", 
                                                             "DEFINE", "WHILE", 
                                                             "WITH", "PLUS", 
                                                             "MINUS", "STAR", 
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
		"resultType", "statement", "unlabelledStatement", "simpleStatement", "assignmentStatement", 
		"variable", "expression", "relationaloperator", "simpleExpression", "additiveoperator", 
		"term", "multiplicativeoperator", "signedFactor", "factor", "unsignedConstant", 
		"functionDesignator", "parameterList", "set_", "elementList", "element", 
		"procedureStatement", "actualParameter", "parameterwidth", "gotoStatement", 
		"emptyStatement_", "empty_", "structuredStatement", "compoundStatement", 
		"statements", "conditionalStatement", "ifStatement", "elifStatement", 
		"elseStatement", "caseStatement", "caseListElement", "repetetiveStatement", 
		"whileStatement", "repeatStatement", "forStatement", "forList", "initialValue", 
		"finalValue", "withStatement", "recordVariableList", "writeStatement", 
		"readStatement",
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
			this.state = 202;
			this.programHeading();
			this.state = 204;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===72) {
				{
				this.state = 203;
				this.match(StepCodeParser.INTERFACE);
				}
			}

			this.state = 206;
			this.block();
			this.state = 207;
			this.match(StepCodeParser.ENDPROGRAM);
			this.state = 208;
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
			this.state = 220;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 31:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 210;
				this.match(StepCodeParser.PROGRAM);
				this.state = 211;
				this.identifier();
				this.state = 216;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===58) {
					{
					this.state = 212;
					this.match(StepCodeParser.LPAREN);
					this.state = 213;
					this.identifierList();
					this.state = 214;
					this.match(StepCodeParser.RPAREN);
					}
				}

				}
				break;
			case 71:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 218;
				this.match(StepCodeParser.UNIT);
				this.state = 219;
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
			this.state = 222;
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
			this.state = 234;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1083638048) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & 1073742289) !== 0) || ((((_la - 73)) & ~0x1F) === 0 && ((1 << (_la - 73)) & 5221) !== 0)) {
				{
				this.state = 232;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 23:
					{
					this.state = 224;
					this.labelDeclarationPart();
					}
					break;
				case 8:
					{
					this.state = 225;
					this.constantDefinitionPart();
					}
					break;
				case 39:
					{
					this.state = 226;
					this.typeDefinitionPart();
					}
					break;
				case 41:
					{
					this.state = 227;
					this.variableDeclarationPart();
					}
					break;
				case 17:
				case 30:
					{
					this.state = 228;
					this.procedureAndFunctionDeclarationPart();
					}
					break;
				case 73:
					{
					this.state = 229;
					this.usesUnitsPart();
					}
					break;
				case 75:
					{
					this.state = 230;
					this.match(StepCodeParser.IMPLEMENTATION);
					}
					break;
				case 5:
				case 16:
				case 18:
				case 20:
				case 35:
				case 42:
				case 43:
				case 65:
				case 78:
				case 79:
				case 83:
				case 85:
					{
					this.state = 231;
					this.statements();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 236;
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
			this.state = 237;
			this.match(StepCodeParser.USES);
			this.state = 238;
			this.identifierList();
			this.state = 239;
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
			this.state = 241;
			this.match(StepCodeParser.LABEL);
			this.state = 242;
			this.label();
			this.state = 247;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 243;
				this.match(StepCodeParser.COMMA);
				this.state = 244;
				this.label();
				}
				}
				this.state = 249;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 250;
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
			this.state = 252;
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
			this.state = 254;
			this.match(StepCodeParser.CONST);
			this.state = 258;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 255;
					this.constantDefinition();
					this.state = 256;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 260;
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
			this.state = 262;
			this.identifier();
			this.state = 263;
			this.match(StepCodeParser.EQUAL);
			this.state = 264;
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
			this.state = 266;
			this.match(StepCodeParser.CHR);
			this.state = 267;
			this.match(StepCodeParser.LPAREN);
			this.state = 268;
			this.unsignedInteger();
			this.state = 269;
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
			this.state = 281;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 271;
				this.unsignedNumber();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 272;
				this.sign();
				this.state = 273;
				this.unsignedNumber();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 275;
				this.identifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 276;
				this.sign();
				this.state = 277;
				this.identifier();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 279;
				this.string_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 280;
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
			this.state = 285;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 85:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 283;
				this.unsignedInteger();
				}
				break;
			case 86:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 284;
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
			this.state = 287;
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
			this.state = 289;
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
			this.state = 291;
			_la = this._input.LA(1);
			if(!(_la===44 || _la===45)) {
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
			this.state = 293;
			_la = this._input.LA(1);
			if(!(_la===76 || _la===77)) {
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
			this.state = 295;
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
			this.state = 297;
			this.match(StepCodeParser.TYPE);
			this.state = 301;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 298;
					this.typeDefinition();
					this.state = 299;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 303;
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
			this.state = 305;
			this.identifier();
			this.state = 306;
			this.match(StepCodeParser.EQUAL);
			this.state = 310;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
			case 4:
			case 6:
			case 7:
			case 15:
			case 22:
			case 29:
			case 33:
			case 34:
			case 36:
			case 44:
			case 45:
			case 58:
			case 64:
			case 74:
			case 83:
			case 84:
			case 85:
			case 86:
				{
				this.state = 307;
				this.type_();
				}
				break;
			case 17:
				{
				this.state = 308;
				this.functionType();
				}
				break;
			case 30:
				{
				this.state = 309;
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
			this.state = 312;
			this.match(StepCodeParser.FUNCTION);
			this.state = 314;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 313;
				this.formalParameterList();
				}
			}

			this.state = 316;
			this.match(StepCodeParser.COLON);
			this.state = 317;
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
			this.state = 319;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 321;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 320;
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
			this.state = 326;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 22:
			case 33:
			case 44:
			case 45:
			case 58:
			case 74:
			case 83:
			case 84:
			case 85:
			case 86:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 323;
				this.simpleType();
				}
				break;
			case 2:
			case 15:
			case 29:
			case 34:
			case 36:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 324;
				this.structuredType();
				}
				break;
			case 64:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 325;
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
			this.state = 332;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 328;
				this.scalarType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 329;
				this.subrangeType();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 330;
				this.typeIdentifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 331;
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
			this.state = 334;
			this.match(StepCodeParser.LPAREN);
			this.state = 335;
			this.identifierList();
			this.state = 336;
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
			this.state = 338;
			this.constant();
			this.state = 339;
			this.match(StepCodeParser.DOTDOT);
			this.state = 340;
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
			this.state = 344;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 83:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 342;
				this.identifier();
				}
				break;
			case 4:
			case 6:
			case 22:
			case 33:
			case 74:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 343;
				_la = this._input.LA(1);
				if(!(((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 537133061) !== 0) || _la===74)) {
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
			this.state = 349;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 29:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 346;
				this.match(StepCodeParser.PACKED);
				this.state = 347;
				this.unpackedStructuredType();
				}
				break;
			case 2:
			case 15:
			case 34:
			case 36:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 348;
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
			this.state = 355;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 351;
				this.arrayType();
				}
				break;
			case 34:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 352;
				this.recordType();
				}
				break;
			case 36:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 353;
				this.setType();
				}
				break;
			case 15:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 354;
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
			this.state = 357;
			this.match(StepCodeParser.STRING);
			this.state = 358;
			this.match(StepCodeParser.LBRACK);
			this.state = 361;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 83:
				{
				this.state = 359;
				this.identifier();
				}
				break;
			case 85:
			case 86:
				{
				this.state = 360;
				this.unsignedNumber();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 363;
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
			this.state = 379;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 365;
				this.match(StepCodeParser.ARRAY);
				this.state = 366;
				this.match(StepCodeParser.LBRACK);
				this.state = 367;
				this.typeList();
				this.state = 368;
				this.match(StepCodeParser.RBRACK);
				this.state = 369;
				this.match(StepCodeParser.OF);
				this.state = 370;
				this.componentType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 372;
				this.match(StepCodeParser.ARRAY);
				this.state = 373;
				this.match(StepCodeParser.LBRACK2);
				this.state = 374;
				this.typeList();
				this.state = 375;
				this.match(StepCodeParser.RBRACK2);
				this.state = 376;
				this.match(StepCodeParser.OF);
				this.state = 377;
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
			this.state = 381;
			this.indexType();
			this.state = 386;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 382;
				this.match(StepCodeParser.COMMA);
				this.state = 383;
				this.indexType();
				}
				}
				this.state = 388;
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
			this.state = 389;
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
			this.state = 391;
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
			this.state = 393;
			this.match(StepCodeParser.RECORD);
			this.state = 395;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5 || _la===83) {
				{
				this.state = 394;
				this.fieldList();
				}
			}

			this.state = 397;
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
			this.state = 405;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 83:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 399;
				this.fixedPart();
				this.state = 402;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===50) {
					{
					this.state = 400;
					this.match(StepCodeParser.SEMI);
					this.state = 401;
					this.variantPart();
					}
				}

				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 404;
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
			this.state = 407;
			this.recordSection();
			this.state = 412;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 408;
					this.match(StepCodeParser.SEMI);
					this.state = 409;
					this.recordSection();
					}
					}
				}
				this.state = 414;
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
			this.state = 415;
			this.identifierList();
			this.state = 416;
			this.match(StepCodeParser.COLON);
			this.state = 417;
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
			this.state = 419;
			this.match(StepCodeParser.CASE);
			this.state = 420;
			this.tag();
			this.state = 421;
			this.match(StepCodeParser.OF);
			this.state = 422;
			this.variant();
			this.state = 427;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===50) {
				{
				{
				this.state = 423;
				this.match(StepCodeParser.SEMI);
				this.state = 424;
				this.variant();
				}
				}
				this.state = 429;
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
			this.state = 435;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 26, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 430;
				this.identifier();
				this.state = 431;
				this.match(StepCodeParser.COLON);
				this.state = 432;
				this.typeIdentifier();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 434;
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
			this.state = 437;
			this.constList();
			this.state = 438;
			this.match(StepCodeParser.COLON);
			this.state = 439;
			this.match(StepCodeParser.LPAREN);
			this.state = 440;
			this.fieldList();
			this.state = 441;
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
			this.state = 443;
			this.match(StepCodeParser.SET);
			this.state = 444;
			this.match(StepCodeParser.OF);
			this.state = 445;
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
			this.state = 447;
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
			this.state = 453;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 449;
				this.match(StepCodeParser.FILE);
				this.state = 450;
				this.match(StepCodeParser.OF);
				this.state = 451;
				this.type_();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 452;
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
			this.state = 455;
			this.match(StepCodeParser.POINTER);
			this.state = 456;
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
			this.state = 458;
			this.match(StepCodeParser.DEFINE);
			this.state = 459;
			this.variableDeclaration();
			this.state = 460;
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
			this.state = 462;
			this.identifierList();
			this.state = 463;
			this.match(StepCodeParser.AS);
			this.state = 464;
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
			this.state = 466;
			this.procedureOrFunctionDeclaration();
			this.state = 467;
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
			this.state = 471;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 30:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 469;
				this.procedureDeclaration();
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 470;
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
			this.state = 473;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 474;
			this.identifier();
			this.state = 476;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 475;
				this.formalParameterList();
				}
			}

			this.state = 478;
			this.match(StepCodeParser.SEMI);
			this.state = 479;
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
			this.state = 481;
			this.match(StepCodeParser.LPAREN);
			this.state = 482;
			this.formalParameterSection();
			this.state = 487;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===50) {
				{
				{
				this.state = 483;
				this.match(StepCodeParser.SEMI);
				this.state = 484;
				this.formalParameterSection();
				}
				}
				this.state = 489;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 490;
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
			this.state = 499;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 83:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 492;
				this.parameterGroup();
				}
				break;
			case 41:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 493;
				this.match(StepCodeParser.DEFINE);
				this.state = 494;
				this.parameterGroup();
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 495;
				this.match(StepCodeParser.FUNCTION);
				this.state = 496;
				this.parameterGroup();
				}
				break;
			case 30:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 497;
				this.match(StepCodeParser.PROCEDURE);
				this.state = 498;
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
			this.state = 501;
			this.identifierList();
			this.state = 502;
			this.match(StepCodeParser.COLON);
			this.state = 503;
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
			this.state = 505;
			this.identifier();
			this.state = 510;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 506;
				this.match(StepCodeParser.COMMA);
				this.state = 507;
				this.identifier();
				}
				}
				this.state = 512;
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
			this.state = 513;
			this.constant();
			this.state = 518;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 514;
				this.match(StepCodeParser.COMMA);
				this.state = 515;
				this.constant();
				}
				}
				this.state = 520;
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
			this.state = 521;
			this.match(StepCodeParser.FUNCTION);
			this.state = 522;
			this.identifier();
			this.state = 524;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 523;
				this.formalParameterList();
				}
			}

			this.state = 526;
			this.match(StepCodeParser.COLON);
			this.state = 527;
			this.resultType();
			this.state = 528;
			this.match(StepCodeParser.SEMI);
			this.state = 529;
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
			this.state = 531;
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
			this.state = 540;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 85:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 533;
				this.label();
				this.state = 534;
				this.match(StepCodeParser.COLON);
				this.state = 535;
				this.unlabelledStatement();
				}
				break;
			case 5:
			case 16:
			case 18:
			case 20:
			case 35:
			case 42:
			case 43:
			case 65:
			case 83:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 537;
				this.unlabelledStatement();
				}
				break;
			case 78:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 538;
				this.writeStatement();
				}
				break;
			case 79:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 539;
				this.readStatement();
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
	public unlabelledStatement(): UnlabelledStatementContext {
		let localctx: UnlabelledStatementContext = new UnlabelledStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 114, StepCodeParser.RULE_unlabelledStatement);
		try {
			this.state = 544;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 18:
			case 65:
			case 83:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 542;
				this.simpleStatement();
				}
				break;
			case 5:
			case 16:
			case 20:
			case 35:
			case 42:
			case 43:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 543;
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
		this.enterRule(localctx, 116, StepCodeParser.RULE_simpleStatement);
		try {
			this.state = 549;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 37, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 546;
				this.assignmentStatement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 547;
				this.procedureStatement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 548;
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
		this.enterRule(localctx, 118, StepCodeParser.RULE_assignmentStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 551;
			this.variable();
			this.state = 552;
			this.match(StepCodeParser.ASSIGN);
			this.state = 553;
			this.expression();
			this.state = 554;
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
		this.enterRule(localctx, 120, StepCodeParser.RULE_variable);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 559;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 65:
				{
				this.state = 556;
				this.match(StepCodeParser.AT);
				this.state = 557;
				this.identifier();
				}
				break;
			case 83:
				{
				this.state = 558;
				this.identifier();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 588;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 60)) & ~0x1F) === 0 && ((1 << (_la - 60)) & 83) !== 0)) {
				{
				this.state = 586;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 60:
					{
					this.state = 561;
					this.match(StepCodeParser.LBRACK);
					this.state = 562;
					this.expression();
					this.state = 567;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===49) {
						{
						{
						this.state = 563;
						this.match(StepCodeParser.COMMA);
						this.state = 564;
						this.expression();
						}
						}
						this.state = 569;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 570;
					this.match(StepCodeParser.RBRACK);
					}
					break;
				case 61:
					{
					this.state = 572;
					this.match(StepCodeParser.LBRACK2);
					this.state = 573;
					this.expression();
					this.state = 578;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===49) {
						{
						{
						this.state = 574;
						this.match(StepCodeParser.COMMA);
						this.state = 575;
						this.expression();
						}
						}
						this.state = 580;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 581;
					this.match(StepCodeParser.RBRACK2);
					}
					break;
				case 66:
					{
					this.state = 583;
					this.match(StepCodeParser.DOT);
					this.state = 584;
					this.identifier();
					}
					break;
				case 64:
					{
					this.state = 585;
					this.match(StepCodeParser.POINTER);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 590;
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
	public expression(): ExpressionContext {
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 122, StepCodeParser.RULE_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 591;
			this.simpleExpression();
			this.state = 595;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===21 || ((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & 63) !== 0)) {
				{
				this.state = 592;
				this.relationaloperator();
				this.state = 593;
				this.expression();
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
	public relationaloperator(): RelationaloperatorContext {
		let localctx: RelationaloperatorContext = new RelationaloperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 124, StepCodeParser.RULE_relationaloperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 597;
			_la = this._input.LA(1);
			if(!(_la===21 || ((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & 63) !== 0))) {
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
	public simpleExpression(): SimpleExpressionContext {
		let localctx: SimpleExpressionContext = new SimpleExpressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 126, StepCodeParser.RULE_simpleExpression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 599;
			this.term();
			this.state = 603;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & 196609) !== 0)) {
				{
				this.state = 600;
				this.additiveoperator();
				this.state = 601;
				this.simpleExpression();
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
	public additiveoperator(): AdditiveoperatorContext {
		let localctx: AdditiveoperatorContext = new AdditiveoperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 128, StepCodeParser.RULE_additiveoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 605;
			_la = this._input.LA(1);
			if(!(((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & 196609) !== 0))) {
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
	public term(): TermContext {
		let localctx: TermContext = new TermContext(this, this._ctx, this.state);
		this.enterRule(localctx, 130, StepCodeParser.RULE_term);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 607;
			this.signedFactor();
			this.state = 611;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 16777730) !== 0) || _la===46 || _la===47) {
				{
				this.state = 608;
				this.multiplicativeoperator();
				this.state = 609;
				this.term();
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
	public multiplicativeoperator(): MultiplicativeoperatorContext {
		let localctx: MultiplicativeoperatorContext = new MultiplicativeoperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 132, StepCodeParser.RULE_multiplicativeoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 613;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 16777730) !== 0) || _la===46 || _la===47)) {
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
	public signedFactor(): SignedFactorContext {
		let localctx: SignedFactorContext = new SignedFactorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 134, StepCodeParser.RULE_signedFactor);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 616;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===44 || _la===45) {
				{
				this.state = 615;
				_la = this._input.LA(1);
				if(!(_la===44 || _la===45)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
			}

			this.state = 618;
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
		this.enterRule(localctx, 136, StepCodeParser.RULE_factor);
		try {
			this.state = 631;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 47, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 620;
				this.variable();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 621;
				this.match(StepCodeParser.LPAREN);
				this.state = 622;
				this.expression();
				this.state = 623;
				this.match(StepCodeParser.RPAREN);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 625;
				this.functionDesignator();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 626;
				this.unsignedConstant();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 627;
				this.set_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 628;
				this.match(StepCodeParser.NOT);
				this.state = 629;
				this.factor();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 630;
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
		this.enterRule(localctx, 138, StepCodeParser.RULE_unsignedConstant);
		try {
			this.state = 637;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 85:
			case 86:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 633;
				this.unsignedNumber();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 634;
				this.constantChr();
				}
				break;
			case 84:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 635;
				this.string_();
				}
				break;
			case 25:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 636;
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
		this.enterRule(localctx, 140, StepCodeParser.RULE_functionDesignator);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 639;
			this.identifier();
			this.state = 640;
			this.match(StepCodeParser.LPAREN);
			this.state = 641;
			this.parameterList();
			this.state = 642;
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
		this.enterRule(localctx, 142, StepCodeParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 644;
			this.actualParameter();
			this.state = 649;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 645;
				this.match(StepCodeParser.COMMA);
				this.state = 646;
				this.actualParameter();
				}
				}
				this.state = 651;
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
		this.enterRule(localctx, 144, StepCodeParser.RULE_set_);
		try {
			this.state = 660;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 60:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 652;
				this.match(StepCodeParser.LBRACK);
				this.state = 653;
				this.elementList();
				this.state = 654;
				this.match(StepCodeParser.RBRACK);
				}
				break;
			case 61:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 656;
				this.match(StepCodeParser.LBRACK2);
				this.state = 657;
				this.elementList();
				this.state = 658;
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
		this.enterRule(localctx, 146, StepCodeParser.RULE_elementList);
		let _la: number;
		try {
			this.state = 671;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 7:
			case 25:
			case 26:
			case 44:
			case 45:
			case 58:
			case 60:
			case 61:
			case 65:
			case 76:
			case 77:
			case 83:
			case 84:
			case 85:
			case 86:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 662;
				this.element();
				this.state = 667;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===49) {
					{
					{
					this.state = 663;
					this.match(StepCodeParser.COMMA);
					this.state = 664;
					this.element();
					}
					}
					this.state = 669;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			case 62:
			case 63:
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
		this.enterRule(localctx, 148, StepCodeParser.RULE_element);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 673;
			this.expression();
			this.state = 676;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===67) {
				{
				this.state = 674;
				this.match(StepCodeParser.DOTDOT);
				this.state = 675;
				this.expression();
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
		this.enterRule(localctx, 150, StepCodeParser.RULE_procedureStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 678;
			this.identifier();
			this.state = 683;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 679;
				this.match(StepCodeParser.LPAREN);
				this.state = 680;
				this.parameterList();
				this.state = 681;
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
		this.enterRule(localctx, 152, StepCodeParser.RULE_actualParameter);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 685;
			this.expression();
			this.state = 689;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===51) {
				{
				{
				this.state = 686;
				this.parameterwidth();
				}
				}
				this.state = 691;
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
		this.enterRule(localctx, 154, StepCodeParser.RULE_parameterwidth);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 692;
			this.match(StepCodeParser.COLON);
			this.state = 693;
			this.expression();
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
		this.enterRule(localctx, 156, StepCodeParser.RULE_gotoStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 695;
			this.match(StepCodeParser.GOTO);
			this.state = 696;
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
		this.enterRule(localctx, 158, StepCodeParser.RULE_emptyStatement_);
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
		this.enterRule(localctx, 160, StepCodeParser.RULE_empty_);
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
		this.enterRule(localctx, 162, StepCodeParser.RULE_structuredStatement);
		try {
			this.state = 705;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 5:
			case 20:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 702;
				this.conditionalStatement();
				}
				break;
			case 16:
			case 35:
			case 42:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 703;
				this.repetetiveStatement();
				}
				break;
			case 43:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 704;
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
		this.enterRule(localctx, 164, StepCodeParser.RULE_compoundStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 710;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1376288) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & 1073742209) !== 0) || ((((_la - 78)) & ~0x1F) === 0 && ((1 << (_la - 78)) & 163) !== 0)) {
				{
				{
				this.state = 707;
				this.statements();
				}
				}
				this.state = 712;
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
	public statements(): StatementsContext {
		let localctx: StatementsContext = new StatementsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 166, StepCodeParser.RULE_statements);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 713;
			this.statement();
			this.state = 718;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 714;
					this.match(StepCodeParser.SEMI);
					this.state = 715;
					this.statement();
					}
					}
				}
				this.state = 720;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			}
			this.state = 722;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 59, this._ctx) ) {
			case 1:
				{
				this.state = 721;
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
		this.enterRule(localctx, 168, StepCodeParser.RULE_conditionalStatement);
		try {
			this.state = 726;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 20:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 724;
				this.ifStatement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 725;
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
		this.enterRule(localctx, 170, StepCodeParser.RULE_ifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 728;
			this.match(StepCodeParser.IF);
			this.state = 729;
			this.expression();
			this.state = 730;
			this.match(StepCodeParser.THEN);
			this.state = 731;
			this.compoundStatement();
			this.state = 736;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				{
				this.state = 732;
				this.elifStatement();
				}
				break;
			case 13:
			case 19:
				{
				this.state = 734;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13) {
					{
					this.state = 733;
					this.elseStatement();
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 738;
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
		this.enterRule(localctx, 172, StepCodeParser.RULE_elifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 740;
			this.match(StepCodeParser.ELIF);
			this.state = 741;
			this.expression();
			this.state = 742;
			this.match(StepCodeParser.THEN);
			this.state = 743;
			this.compoundStatement();
			this.state = 748;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				{
				this.state = 744;
				this.elifStatement();
				}
				break;
			case 13:
			case 19:
				{
				this.state = 746;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===13) {
					{
					this.state = 745;
					this.elseStatement();
					}
				}

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
	public elseStatement(): ElseStatementContext {
		let localctx: ElseStatementContext = new ElseStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 174, StepCodeParser.RULE_elseStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 750;
			this.match(StepCodeParser.ELSE);
			this.state = 751;
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
		this.enterRule(localctx, 176, StepCodeParser.RULE_caseStatement);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 753;
			this.match(StepCodeParser.CASE);
			this.state = 754;
			this.expression();
			this.state = 755;
			this.match(StepCodeParser.OF);
			this.state = 756;
			this.caseListElement();
			this.state = 761;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 757;
					this.match(StepCodeParser.SEMI);
					this.state = 758;
					this.caseListElement();
					}
					}
				}
				this.state = 763;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
			}
			this.state = 767;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===50) {
				{
				this.state = 764;
				this.match(StepCodeParser.SEMI);
				this.state = 765;
				this.match(StepCodeParser.ELSE);
				this.state = 766;
				this.statements();
				}
			}

			this.state = 769;
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
	public caseListElement(): CaseListElementContext {
		let localctx: CaseListElementContext = new CaseListElementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 178, StepCodeParser.RULE_caseListElement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 771;
			this.constList();
			this.state = 772;
			_la = this._input.LA(1);
			if(!(_la===51 || _la===70)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 773;
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
	public repetetiveStatement(): RepetetiveStatementContext {
		let localctx: RepetetiveStatementContext = new RepetetiveStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 180, StepCodeParser.RULE_repetetiveStatement);
		try {
			this.state = 778;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 42:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 775;
				this.whileStatement();
				}
				break;
			case 35:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 776;
				this.repeatStatement();
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 777;
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
		this.enterRule(localctx, 182, StepCodeParser.RULE_whileStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 780;
			this.match(StepCodeParser.WHILE);
			this.state = 781;
			this.expression();
			this.state = 782;
			this.match(StepCodeParser.DO);
			this.state = 783;
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
	public repeatStatement(): RepeatStatementContext {
		let localctx: RepeatStatementContext = new RepeatStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 184, StepCodeParser.RULE_repeatStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 785;
			this.match(StepCodeParser.REPEAT);
			this.state = 786;
			this.statements();
			this.state = 787;
			this.match(StepCodeParser.UNTIL);
			this.state = 788;
			this.expression();
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
		this.enterRule(localctx, 186, StepCodeParser.RULE_forStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 790;
			this.match(StepCodeParser.FOR);
			this.state = 791;
			this.identifier();
			this.state = 792;
			this.match(StepCodeParser.ASSIGN);
			this.state = 793;
			this.forList();
			this.state = 794;
			this.match(StepCodeParser.DO);
			this.state = 795;
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
	public forList(): ForListContext {
		let localctx: ForListContext = new ForListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 188, StepCodeParser.RULE_forList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 797;
			this.initialValue();
			this.state = 798;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===38)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 799;
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
		this.enterRule(localctx, 190, StepCodeParser.RULE_initialValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 801;
			this.expression();
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
		this.enterRule(localctx, 192, StepCodeParser.RULE_finalValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 803;
			this.expression();
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
		this.enterRule(localctx, 194, StepCodeParser.RULE_withStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 805;
			this.match(StepCodeParser.WITH);
			this.state = 806;
			this.recordVariableList();
			this.state = 807;
			this.match(StepCodeParser.DO);
			this.state = 808;
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
		this.enterRule(localctx, 196, StepCodeParser.RULE_recordVariableList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 810;
			this.variable();
			this.state = 815;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 811;
				this.match(StepCodeParser.COMMA);
				this.state = 812;
				this.variable();
				}
				}
				this.state = 817;
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
		this.enterRule(localctx, 198, StepCodeParser.RULE_writeStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 818;
			this.match(StepCodeParser.WRITE);
			this.state = 819;
			this.expression();
			this.state = 824;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 820;
				this.match(StepCodeParser.COMMA);
				this.state = 821;
				this.expression();
				}
				}
				this.state = 826;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 827;
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
		this.enterRule(localctx, 200, StepCodeParser.RULE_readStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 829;
			this.match(StepCodeParser.READ);
			this.state = 830;
			this.variable();
			this.state = 835;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===49) {
				{
				{
				this.state = 831;
				this.match(StepCodeParser.COMMA);
				this.state = 832;
				this.variable();
				}
				}
				this.state = 837;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 838;
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

	public static readonly _serializedATN: number[] = [4,1,86,841,2,0,7,0,2,
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
	97,7,97,2,98,7,98,2,99,7,99,2,100,7,100,1,0,1,0,3,0,205,8,0,1,0,1,0,1,0,
	1,0,1,1,1,1,1,1,1,1,1,1,1,1,3,1,217,8,1,1,1,1,1,3,1,221,8,1,1,2,1,2,1,3,
	1,3,1,3,1,3,1,3,1,3,1,3,1,3,5,3,233,8,3,10,3,12,3,236,9,3,1,4,1,4,1,4,1,
	4,1,5,1,5,1,5,1,5,5,5,246,8,5,10,5,12,5,249,9,5,1,5,1,5,1,6,1,6,1,7,1,7,
	1,7,1,7,4,7,259,8,7,11,7,12,7,260,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,
	10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,282,8,10,1,11,1,11,
	3,11,286,8,11,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,16,1,16,1,17,1,
	17,1,17,1,17,4,17,302,8,17,11,17,12,17,303,1,18,1,18,1,18,1,18,1,18,3,18,
	311,8,18,1,19,1,19,3,19,315,8,19,1,19,1,19,1,19,1,20,1,20,3,20,322,8,20,
	1,21,1,21,1,21,3,21,327,8,21,1,22,1,22,1,22,1,22,3,22,333,8,22,1,23,1,23,
	1,23,1,23,1,24,1,24,1,24,1,24,1,25,1,25,3,25,345,8,25,1,26,1,26,1,26,3,
	26,350,8,26,1,27,1,27,1,27,1,27,3,27,356,8,27,1,28,1,28,1,28,1,28,3,28,
	362,8,28,1,28,1,28,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,
	29,1,29,1,29,1,29,3,29,380,8,29,1,30,1,30,1,30,5,30,385,8,30,10,30,12,30,
	388,9,30,1,31,1,31,1,32,1,32,1,33,1,33,3,33,396,8,33,1,33,1,33,1,34,1,34,
	1,34,3,34,403,8,34,1,34,3,34,406,8,34,1,35,1,35,1,35,5,35,411,8,35,10,35,
	12,35,414,9,35,1,36,1,36,1,36,1,36,1,37,1,37,1,37,1,37,1,37,1,37,5,37,426,
	8,37,10,37,12,37,429,9,37,1,38,1,38,1,38,1,38,1,38,3,38,436,8,38,1,39,1,
	39,1,39,1,39,1,39,1,39,1,40,1,40,1,40,1,40,1,41,1,41,1,42,1,42,1,42,1,42,
	3,42,454,8,42,1,43,1,43,1,43,1,44,1,44,1,44,1,44,1,45,1,45,1,45,1,45,1,
	46,1,46,1,46,1,47,1,47,3,47,472,8,47,1,48,1,48,1,48,3,48,477,8,48,1,48,
	1,48,1,48,1,49,1,49,1,49,1,49,5,49,486,8,49,10,49,12,49,489,9,49,1,49,1,
	49,1,50,1,50,1,50,1,50,1,50,1,50,1,50,3,50,500,8,50,1,51,1,51,1,51,1,51,
	1,52,1,52,1,52,5,52,509,8,52,10,52,12,52,512,9,52,1,53,1,53,1,53,5,53,517,
	8,53,10,53,12,53,520,9,53,1,54,1,54,1,54,3,54,525,8,54,1,54,1,54,1,54,1,
	54,1,54,1,55,1,55,1,56,1,56,1,56,1,56,1,56,1,56,1,56,3,56,541,8,56,1,57,
	1,57,3,57,545,8,57,1,58,1,58,1,58,3,58,550,8,58,1,59,1,59,1,59,1,59,1,59,
	1,60,1,60,1,60,3,60,560,8,60,1,60,1,60,1,60,1,60,5,60,566,8,60,10,60,12,
	60,569,9,60,1,60,1,60,1,60,1,60,1,60,1,60,5,60,577,8,60,10,60,12,60,580,
	9,60,1,60,1,60,1,60,1,60,1,60,5,60,587,8,60,10,60,12,60,590,9,60,1,61,1,
	61,1,61,1,61,3,61,596,8,61,1,62,1,62,1,63,1,63,1,63,1,63,3,63,604,8,63,
	1,64,1,64,1,65,1,65,1,65,1,65,3,65,612,8,65,1,66,1,66,1,67,3,67,617,8,67,
	1,67,1,67,1,68,1,68,1,68,1,68,1,68,1,68,1,68,1,68,1,68,1,68,1,68,3,68,632,
	8,68,1,69,1,69,1,69,1,69,3,69,638,8,69,1,70,1,70,1,70,1,70,1,70,1,71,1,
	71,1,71,5,71,648,8,71,10,71,12,71,651,9,71,1,72,1,72,1,72,1,72,1,72,1,72,
	1,72,1,72,3,72,661,8,72,1,73,1,73,1,73,5,73,666,8,73,10,73,12,73,669,9,
	73,1,73,3,73,672,8,73,1,74,1,74,1,74,3,74,677,8,74,1,75,1,75,1,75,1,75,
	1,75,3,75,684,8,75,1,76,1,76,5,76,688,8,76,10,76,12,76,691,9,76,1,77,1,
	77,1,77,1,78,1,78,1,78,1,79,1,79,1,80,1,80,1,81,1,81,1,81,3,81,706,8,81,
	1,82,5,82,709,8,82,10,82,12,82,712,9,82,1,83,1,83,1,83,5,83,717,8,83,10,
	83,12,83,720,9,83,1,83,3,83,723,8,83,1,84,1,84,3,84,727,8,84,1,85,1,85,
	1,85,1,85,1,85,1,85,3,85,735,8,85,3,85,737,8,85,1,85,1,85,1,86,1,86,1,86,
	1,86,1,86,1,86,3,86,747,8,86,3,86,749,8,86,1,87,1,87,1,87,1,88,1,88,1,88,
	1,88,1,88,1,88,5,88,760,8,88,10,88,12,88,763,9,88,1,88,1,88,1,88,3,88,768,
	8,88,1,88,1,88,1,89,1,89,1,89,1,89,1,90,1,90,1,90,3,90,779,8,90,1,91,1,
	91,1,91,1,91,1,91,1,92,1,92,1,92,1,92,1,92,1,93,1,93,1,93,1,93,1,93,1,93,
	1,93,1,94,1,94,1,94,1,94,1,95,1,95,1,96,1,96,1,97,1,97,1,97,1,97,1,97,1,
	98,1,98,1,98,5,98,814,8,98,10,98,12,98,817,9,98,1,99,1,99,1,99,1,99,5,99,
	823,8,99,10,99,12,99,826,9,99,1,99,1,99,1,100,1,100,1,100,1,100,5,100,834,
	8,100,10,100,12,100,837,9,100,1,100,1,100,1,100,0,0,101,0,2,4,6,8,10,12,
	14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,
	62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,
	108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,
	144,146,148,150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,
	180,182,184,186,188,190,192,194,196,198,200,0,8,1,0,44,45,1,0,76,77,5,0,
	4,4,6,6,22,22,33,33,74,74,2,0,21,21,52,57,2,0,28,28,44,45,4,0,1,1,9,9,24,
	24,46,47,2,0,51,51,70,70,2,0,11,11,38,38,842,0,202,1,0,0,0,2,220,1,0,0,
	0,4,222,1,0,0,0,6,234,1,0,0,0,8,237,1,0,0,0,10,241,1,0,0,0,12,252,1,0,0,
	0,14,254,1,0,0,0,16,262,1,0,0,0,18,266,1,0,0,0,20,281,1,0,0,0,22,285,1,
	0,0,0,24,287,1,0,0,0,26,289,1,0,0,0,28,291,1,0,0,0,30,293,1,0,0,0,32,295,
	1,0,0,0,34,297,1,0,0,0,36,305,1,0,0,0,38,312,1,0,0,0,40,319,1,0,0,0,42,
	326,1,0,0,0,44,332,1,0,0,0,46,334,1,0,0,0,48,338,1,0,0,0,50,344,1,0,0,0,
	52,349,1,0,0,0,54,355,1,0,0,0,56,357,1,0,0,0,58,379,1,0,0,0,60,381,1,0,
	0,0,62,389,1,0,0,0,64,391,1,0,0,0,66,393,1,0,0,0,68,405,1,0,0,0,70,407,
	1,0,0,0,72,415,1,0,0,0,74,419,1,0,0,0,76,435,1,0,0,0,78,437,1,0,0,0,80,
	443,1,0,0,0,82,447,1,0,0,0,84,453,1,0,0,0,86,455,1,0,0,0,88,458,1,0,0,0,
	90,462,1,0,0,0,92,466,1,0,0,0,94,471,1,0,0,0,96,473,1,0,0,0,98,481,1,0,
	0,0,100,499,1,0,0,0,102,501,1,0,0,0,104,505,1,0,0,0,106,513,1,0,0,0,108,
	521,1,0,0,0,110,531,1,0,0,0,112,540,1,0,0,0,114,544,1,0,0,0,116,549,1,0,
	0,0,118,551,1,0,0,0,120,559,1,0,0,0,122,591,1,0,0,0,124,597,1,0,0,0,126,
	599,1,0,0,0,128,605,1,0,0,0,130,607,1,0,0,0,132,613,1,0,0,0,134,616,1,0,
	0,0,136,631,1,0,0,0,138,637,1,0,0,0,140,639,1,0,0,0,142,644,1,0,0,0,144,
	660,1,0,0,0,146,671,1,0,0,0,148,673,1,0,0,0,150,678,1,0,0,0,152,685,1,0,
	0,0,154,692,1,0,0,0,156,695,1,0,0,0,158,698,1,0,0,0,160,700,1,0,0,0,162,
	705,1,0,0,0,164,710,1,0,0,0,166,713,1,0,0,0,168,726,1,0,0,0,170,728,1,0,
	0,0,172,740,1,0,0,0,174,750,1,0,0,0,176,753,1,0,0,0,178,771,1,0,0,0,180,
	778,1,0,0,0,182,780,1,0,0,0,184,785,1,0,0,0,186,790,1,0,0,0,188,797,1,0,
	0,0,190,801,1,0,0,0,192,803,1,0,0,0,194,805,1,0,0,0,196,810,1,0,0,0,198,
	818,1,0,0,0,200,829,1,0,0,0,202,204,3,2,1,0,203,205,5,72,0,0,204,203,1,
	0,0,0,204,205,1,0,0,0,205,206,1,0,0,0,206,207,3,6,3,0,207,208,5,32,0,0,
	208,209,5,0,0,1,209,1,1,0,0,0,210,211,5,31,0,0,211,216,3,4,2,0,212,213,
	5,58,0,0,213,214,3,104,52,0,214,215,5,59,0,0,215,217,1,0,0,0,216,212,1,
	0,0,0,216,217,1,0,0,0,217,221,1,0,0,0,218,219,5,71,0,0,219,221,3,4,2,0,
	220,210,1,0,0,0,220,218,1,0,0,0,221,3,1,0,0,0,222,223,5,83,0,0,223,5,1,
	0,0,0,224,233,3,10,5,0,225,233,3,14,7,0,226,233,3,34,17,0,227,233,3,88,
	44,0,228,233,3,92,46,0,229,233,3,8,4,0,230,233,5,75,0,0,231,233,3,166,83,
	0,232,224,1,0,0,0,232,225,1,0,0,0,232,226,1,0,0,0,232,227,1,0,0,0,232,228,
	1,0,0,0,232,229,1,0,0,0,232,230,1,0,0,0,232,231,1,0,0,0,233,236,1,0,0,0,
	234,232,1,0,0,0,234,235,1,0,0,0,235,7,1,0,0,0,236,234,1,0,0,0,237,238,5,
	73,0,0,238,239,3,104,52,0,239,240,5,50,0,0,240,9,1,0,0,0,241,242,5,23,0,
	0,242,247,3,12,6,0,243,244,5,49,0,0,244,246,3,12,6,0,245,243,1,0,0,0,246,
	249,1,0,0,0,247,245,1,0,0,0,247,248,1,0,0,0,248,250,1,0,0,0,249,247,1,0,
	0,0,250,251,5,50,0,0,251,11,1,0,0,0,252,253,3,24,12,0,253,13,1,0,0,0,254,
	258,5,8,0,0,255,256,3,16,8,0,256,257,5,50,0,0,257,259,1,0,0,0,258,255,1,
	0,0,0,259,260,1,0,0,0,260,258,1,0,0,0,260,261,1,0,0,0,261,15,1,0,0,0,262,
	263,3,4,2,0,263,264,5,52,0,0,264,265,3,20,10,0,265,17,1,0,0,0,266,267,5,
	7,0,0,267,268,5,58,0,0,268,269,3,24,12,0,269,270,5,59,0,0,270,19,1,0,0,
	0,271,282,3,22,11,0,272,273,3,28,14,0,273,274,3,22,11,0,274,282,1,0,0,0,
	275,282,3,4,2,0,276,277,3,28,14,0,277,278,3,4,2,0,278,282,1,0,0,0,279,282,
	3,32,16,0,280,282,3,18,9,0,281,271,1,0,0,0,281,272,1,0,0,0,281,275,1,0,
	0,0,281,276,1,0,0,0,281,279,1,0,0,0,281,280,1,0,0,0,282,21,1,0,0,0,283,
	286,3,24,12,0,284,286,3,26,13,0,285,283,1,0,0,0,285,284,1,0,0,0,286,23,
	1,0,0,0,287,288,5,85,0,0,288,25,1,0,0,0,289,290,5,86,0,0,290,27,1,0,0,0,
	291,292,7,0,0,0,292,29,1,0,0,0,293,294,7,1,0,0,294,31,1,0,0,0,295,296,5,
	84,0,0,296,33,1,0,0,0,297,301,5,39,0,0,298,299,3,36,18,0,299,300,5,50,0,
	0,300,302,1,0,0,0,301,298,1,0,0,0,302,303,1,0,0,0,303,301,1,0,0,0,303,304,
	1,0,0,0,304,35,1,0,0,0,305,306,3,4,2,0,306,310,5,52,0,0,307,311,3,42,21,
	0,308,311,3,38,19,0,309,311,3,40,20,0,310,307,1,0,0,0,310,308,1,0,0,0,310,
	309,1,0,0,0,311,37,1,0,0,0,312,314,5,17,0,0,313,315,3,98,49,0,314,313,1,
	0,0,0,314,315,1,0,0,0,315,316,1,0,0,0,316,317,5,51,0,0,317,318,3,110,55,
	0,318,39,1,0,0,0,319,321,5,30,0,0,320,322,3,98,49,0,321,320,1,0,0,0,321,
	322,1,0,0,0,322,41,1,0,0,0,323,327,3,44,22,0,324,327,3,52,26,0,325,327,
	3,86,43,0,326,323,1,0,0,0,326,324,1,0,0,0,326,325,1,0,0,0,327,43,1,0,0,
	0,328,333,3,46,23,0,329,333,3,48,24,0,330,333,3,50,25,0,331,333,3,56,28,
	0,332,328,1,0,0,0,332,329,1,0,0,0,332,330,1,0,0,0,332,331,1,0,0,0,333,45,
	1,0,0,0,334,335,5,58,0,0,335,336,3,104,52,0,336,337,5,59,0,0,337,47,1,0,
	0,0,338,339,3,20,10,0,339,340,5,67,0,0,340,341,3,20,10,0,341,49,1,0,0,0,
	342,345,3,4,2,0,343,345,7,2,0,0,344,342,1,0,0,0,344,343,1,0,0,0,345,51,
	1,0,0,0,346,347,5,29,0,0,347,350,3,54,27,0,348,350,3,54,27,0,349,346,1,
	0,0,0,349,348,1,0,0,0,350,53,1,0,0,0,351,356,3,58,29,0,352,356,3,66,33,
	0,353,356,3,80,40,0,354,356,3,84,42,0,355,351,1,0,0,0,355,352,1,0,0,0,355,
	353,1,0,0,0,355,354,1,0,0,0,356,55,1,0,0,0,357,358,5,74,0,0,358,361,5,60,
	0,0,359,362,3,4,2,0,360,362,3,22,11,0,361,359,1,0,0,0,361,360,1,0,0,0,362,
	363,1,0,0,0,363,364,5,62,0,0,364,57,1,0,0,0,365,366,5,2,0,0,366,367,5,60,
	0,0,367,368,3,60,30,0,368,369,5,62,0,0,369,370,5,27,0,0,370,371,3,64,32,
	0,371,380,1,0,0,0,372,373,5,2,0,0,373,374,5,61,0,0,374,375,3,60,30,0,375,
	376,5,63,0,0,376,377,5,27,0,0,377,378,3,64,32,0,378,380,1,0,0,0,379,365,
	1,0,0,0,379,372,1,0,0,0,380,59,1,0,0,0,381,386,3,62,31,0,382,383,5,49,0,
	0,383,385,3,62,31,0,384,382,1,0,0,0,385,388,1,0,0,0,386,384,1,0,0,0,386,
	387,1,0,0,0,387,61,1,0,0,0,388,386,1,0,0,0,389,390,3,44,22,0,390,63,1,0,
	0,0,391,392,3,42,21,0,392,65,1,0,0,0,393,395,5,34,0,0,394,396,3,68,34,0,
	395,394,1,0,0,0,395,396,1,0,0,0,396,397,1,0,0,0,397,398,5,14,0,0,398,67,
	1,0,0,0,399,402,3,70,35,0,400,401,5,50,0,0,401,403,3,74,37,0,402,400,1,
	0,0,0,402,403,1,0,0,0,403,406,1,0,0,0,404,406,3,74,37,0,405,399,1,0,0,0,
	405,404,1,0,0,0,406,69,1,0,0,0,407,412,3,72,36,0,408,409,5,50,0,0,409,411,
	3,72,36,0,410,408,1,0,0,0,411,414,1,0,0,0,412,410,1,0,0,0,412,413,1,0,0,
	0,413,71,1,0,0,0,414,412,1,0,0,0,415,416,3,104,52,0,416,417,5,51,0,0,417,
	418,3,42,21,0,418,73,1,0,0,0,419,420,5,5,0,0,420,421,3,76,38,0,421,422,
	5,27,0,0,422,427,3,78,39,0,423,424,5,50,0,0,424,426,3,78,39,0,425,423,1,
	0,0,0,426,429,1,0,0,0,427,425,1,0,0,0,427,428,1,0,0,0,428,75,1,0,0,0,429,
	427,1,0,0,0,430,431,3,4,2,0,431,432,5,51,0,0,432,433,3,50,25,0,433,436,
	1,0,0,0,434,436,3,50,25,0,435,430,1,0,0,0,435,434,1,0,0,0,436,77,1,0,0,
	0,437,438,3,106,53,0,438,439,5,51,0,0,439,440,5,58,0,0,440,441,3,68,34,
	0,441,442,5,59,0,0,442,79,1,0,0,0,443,444,5,36,0,0,444,445,5,27,0,0,445,
	446,3,82,41,0,446,81,1,0,0,0,447,448,3,44,22,0,448,83,1,0,0,0,449,450,5,
	15,0,0,450,451,5,27,0,0,451,454,3,42,21,0,452,454,5,15,0,0,453,449,1,0,
	0,0,453,452,1,0,0,0,454,85,1,0,0,0,455,456,5,64,0,0,456,457,3,50,25,0,457,
	87,1,0,0,0,458,459,5,41,0,0,459,460,3,90,45,0,460,461,5,50,0,0,461,89,1,
	0,0,0,462,463,3,104,52,0,463,464,5,70,0,0,464,465,3,42,21,0,465,91,1,0,
	0,0,466,467,3,94,47,0,467,468,5,50,0,0,468,93,1,0,0,0,469,472,3,96,48,0,
	470,472,3,108,54,0,471,469,1,0,0,0,471,470,1,0,0,0,472,95,1,0,0,0,473,474,
	5,30,0,0,474,476,3,4,2,0,475,477,3,98,49,0,476,475,1,0,0,0,476,477,1,0,
	0,0,477,478,1,0,0,0,478,479,5,50,0,0,479,480,3,6,3,0,480,97,1,0,0,0,481,
	482,5,58,0,0,482,487,3,100,50,0,483,484,5,50,0,0,484,486,3,100,50,0,485,
	483,1,0,0,0,486,489,1,0,0,0,487,485,1,0,0,0,487,488,1,0,0,0,488,490,1,0,
	0,0,489,487,1,0,0,0,490,491,5,59,0,0,491,99,1,0,0,0,492,500,3,102,51,0,
	493,494,5,41,0,0,494,500,3,102,51,0,495,496,5,17,0,0,496,500,3,102,51,0,
	497,498,5,30,0,0,498,500,3,102,51,0,499,492,1,0,0,0,499,493,1,0,0,0,499,
	495,1,0,0,0,499,497,1,0,0,0,500,101,1,0,0,0,501,502,3,104,52,0,502,503,
	5,51,0,0,503,504,3,50,25,0,504,103,1,0,0,0,505,510,3,4,2,0,506,507,5,49,
	0,0,507,509,3,4,2,0,508,506,1,0,0,0,509,512,1,0,0,0,510,508,1,0,0,0,510,
	511,1,0,0,0,511,105,1,0,0,0,512,510,1,0,0,0,513,518,3,20,10,0,514,515,5,
	49,0,0,515,517,3,20,10,0,516,514,1,0,0,0,517,520,1,0,0,0,518,516,1,0,0,
	0,518,519,1,0,0,0,519,107,1,0,0,0,520,518,1,0,0,0,521,522,5,17,0,0,522,
	524,3,4,2,0,523,525,3,98,49,0,524,523,1,0,0,0,524,525,1,0,0,0,525,526,1,
	0,0,0,526,527,5,51,0,0,527,528,3,110,55,0,528,529,5,50,0,0,529,530,3,6,
	3,0,530,109,1,0,0,0,531,532,3,50,25,0,532,111,1,0,0,0,533,534,3,12,6,0,
	534,535,5,51,0,0,535,536,3,114,57,0,536,541,1,0,0,0,537,541,3,114,57,0,
	538,541,3,198,99,0,539,541,3,200,100,0,540,533,1,0,0,0,540,537,1,0,0,0,
	540,538,1,0,0,0,540,539,1,0,0,0,541,113,1,0,0,0,542,545,3,116,58,0,543,
	545,3,162,81,0,544,542,1,0,0,0,544,543,1,0,0,0,545,115,1,0,0,0,546,550,
	3,118,59,0,547,550,3,150,75,0,548,550,3,156,78,0,549,546,1,0,0,0,549,547,
	1,0,0,0,549,548,1,0,0,0,550,117,1,0,0,0,551,552,3,120,60,0,552,553,5,48,
	0,0,553,554,3,122,61,0,554,555,5,50,0,0,555,119,1,0,0,0,556,557,5,65,0,
	0,557,560,3,4,2,0,558,560,3,4,2,0,559,556,1,0,0,0,559,558,1,0,0,0,560,588,
	1,0,0,0,561,562,5,60,0,0,562,567,3,122,61,0,563,564,5,49,0,0,564,566,3,
	122,61,0,565,563,1,0,0,0,566,569,1,0,0,0,567,565,1,0,0,0,567,568,1,0,0,
	0,568,570,1,0,0,0,569,567,1,0,0,0,570,571,5,62,0,0,571,587,1,0,0,0,572,
	573,5,61,0,0,573,578,3,122,61,0,574,575,5,49,0,0,575,577,3,122,61,0,576,
	574,1,0,0,0,577,580,1,0,0,0,578,576,1,0,0,0,578,579,1,0,0,0,579,581,1,0,
	0,0,580,578,1,0,0,0,581,582,5,63,0,0,582,587,1,0,0,0,583,584,5,66,0,0,584,
	587,3,4,2,0,585,587,5,64,0,0,586,561,1,0,0,0,586,572,1,0,0,0,586,583,1,
	0,0,0,586,585,1,0,0,0,587,590,1,0,0,0,588,586,1,0,0,0,588,589,1,0,0,0,589,
	121,1,0,0,0,590,588,1,0,0,0,591,595,3,126,63,0,592,593,3,124,62,0,593,594,
	3,122,61,0,594,596,1,0,0,0,595,592,1,0,0,0,595,596,1,0,0,0,596,123,1,0,
	0,0,597,598,7,3,0,0,598,125,1,0,0,0,599,603,3,130,65,0,600,601,3,128,64,
	0,601,602,3,126,63,0,602,604,1,0,0,0,603,600,1,0,0,0,603,604,1,0,0,0,604,
	127,1,0,0,0,605,606,7,4,0,0,606,129,1,0,0,0,607,611,3,134,67,0,608,609,
	3,132,66,0,609,610,3,130,65,0,610,612,1,0,0,0,611,608,1,0,0,0,611,612,1,
	0,0,0,612,131,1,0,0,0,613,614,7,5,0,0,614,133,1,0,0,0,615,617,7,0,0,0,616,
	615,1,0,0,0,616,617,1,0,0,0,617,618,1,0,0,0,618,619,3,136,68,0,619,135,
	1,0,0,0,620,632,3,120,60,0,621,622,5,58,0,0,622,623,3,122,61,0,623,624,
	5,59,0,0,624,632,1,0,0,0,625,632,3,140,70,0,626,632,3,138,69,0,627,632,
	3,144,72,0,628,629,5,26,0,0,629,632,3,136,68,0,630,632,3,30,15,0,631,620,
	1,0,0,0,631,621,1,0,0,0,631,625,1,0,0,0,631,626,1,0,0,0,631,627,1,0,0,0,
	631,628,1,0,0,0,631,630,1,0,0,0,632,137,1,0,0,0,633,638,3,22,11,0,634,638,
	3,18,9,0,635,638,3,32,16,0,636,638,5,25,0,0,637,633,1,0,0,0,637,634,1,0,
	0,0,637,635,1,0,0,0,637,636,1,0,0,0,638,139,1,0,0,0,639,640,3,4,2,0,640,
	641,5,58,0,0,641,642,3,142,71,0,642,643,5,59,0,0,643,141,1,0,0,0,644,649,
	3,152,76,0,645,646,5,49,0,0,646,648,3,152,76,0,647,645,1,0,0,0,648,651,
	1,0,0,0,649,647,1,0,0,0,649,650,1,0,0,0,650,143,1,0,0,0,651,649,1,0,0,0,
	652,653,5,60,0,0,653,654,3,146,73,0,654,655,5,62,0,0,655,661,1,0,0,0,656,
	657,5,61,0,0,657,658,3,146,73,0,658,659,5,63,0,0,659,661,1,0,0,0,660,652,
	1,0,0,0,660,656,1,0,0,0,661,145,1,0,0,0,662,667,3,148,74,0,663,664,5,49,
	0,0,664,666,3,148,74,0,665,663,1,0,0,0,666,669,1,0,0,0,667,665,1,0,0,0,
	667,668,1,0,0,0,668,672,1,0,0,0,669,667,1,0,0,0,670,672,1,0,0,0,671,662,
	1,0,0,0,671,670,1,0,0,0,672,147,1,0,0,0,673,676,3,122,61,0,674,675,5,67,
	0,0,675,677,3,122,61,0,676,674,1,0,0,0,676,677,1,0,0,0,677,149,1,0,0,0,
	678,683,3,4,2,0,679,680,5,58,0,0,680,681,3,142,71,0,681,682,5,59,0,0,682,
	684,1,0,0,0,683,679,1,0,0,0,683,684,1,0,0,0,684,151,1,0,0,0,685,689,3,122,
	61,0,686,688,3,154,77,0,687,686,1,0,0,0,688,691,1,0,0,0,689,687,1,0,0,0,
	689,690,1,0,0,0,690,153,1,0,0,0,691,689,1,0,0,0,692,693,5,51,0,0,693,694,
	3,122,61,0,694,155,1,0,0,0,695,696,5,18,0,0,696,697,3,12,6,0,697,157,1,
	0,0,0,698,699,1,0,0,0,699,159,1,0,0,0,700,701,1,0,0,0,701,161,1,0,0,0,702,
	706,3,168,84,0,703,706,3,180,90,0,704,706,3,194,97,0,705,702,1,0,0,0,705,
	703,1,0,0,0,705,704,1,0,0,0,706,163,1,0,0,0,707,709,3,166,83,0,708,707,
	1,0,0,0,709,712,1,0,0,0,710,708,1,0,0,0,710,711,1,0,0,0,711,165,1,0,0,0,
	712,710,1,0,0,0,713,718,3,112,56,0,714,715,5,50,0,0,715,717,3,112,56,0,
	716,714,1,0,0,0,717,720,1,0,0,0,718,716,1,0,0,0,718,719,1,0,0,0,719,722,
	1,0,0,0,720,718,1,0,0,0,721,723,5,50,0,0,722,721,1,0,0,0,722,723,1,0,0,
	0,723,167,1,0,0,0,724,727,3,170,85,0,725,727,3,176,88,0,726,724,1,0,0,0,
	726,725,1,0,0,0,727,169,1,0,0,0,728,729,5,20,0,0,729,730,3,122,61,0,730,
	731,5,37,0,0,731,736,3,164,82,0,732,737,3,172,86,0,733,735,3,174,87,0,734,
	733,1,0,0,0,734,735,1,0,0,0,735,737,1,0,0,0,736,732,1,0,0,0,736,734,1,0,
	0,0,737,738,1,0,0,0,738,739,5,19,0,0,739,171,1,0,0,0,740,741,5,12,0,0,741,
	742,3,122,61,0,742,743,5,37,0,0,743,748,3,164,82,0,744,749,3,172,86,0,745,
	747,3,174,87,0,746,745,1,0,0,0,746,747,1,0,0,0,747,749,1,0,0,0,748,744,
	1,0,0,0,748,746,1,0,0,0,749,173,1,0,0,0,750,751,5,13,0,0,751,752,3,164,
	82,0,752,175,1,0,0,0,753,754,5,5,0,0,754,755,3,122,61,0,755,756,5,27,0,
	0,756,761,3,178,89,0,757,758,5,50,0,0,758,760,3,178,89,0,759,757,1,0,0,
	0,760,763,1,0,0,0,761,759,1,0,0,0,761,762,1,0,0,0,762,767,1,0,0,0,763,761,
	1,0,0,0,764,765,5,50,0,0,765,766,5,13,0,0,766,768,3,166,83,0,767,764,1,
	0,0,0,767,768,1,0,0,0,768,769,1,0,0,0,769,770,5,14,0,0,770,177,1,0,0,0,
	771,772,3,106,53,0,772,773,7,6,0,0,773,774,3,112,56,0,774,179,1,0,0,0,775,
	779,3,182,91,0,776,779,3,184,92,0,777,779,3,186,93,0,778,775,1,0,0,0,778,
	776,1,0,0,0,778,777,1,0,0,0,779,181,1,0,0,0,780,781,5,42,0,0,781,782,3,
	122,61,0,782,783,5,10,0,0,783,784,3,112,56,0,784,183,1,0,0,0,785,786,5,
	35,0,0,786,787,3,166,83,0,787,788,5,40,0,0,788,789,3,122,61,0,789,185,1,
	0,0,0,790,791,5,16,0,0,791,792,3,4,2,0,792,793,5,48,0,0,793,794,3,188,94,
	0,794,795,5,10,0,0,795,796,3,112,56,0,796,187,1,0,0,0,797,798,3,190,95,
	0,798,799,7,7,0,0,799,800,3,192,96,0,800,189,1,0,0,0,801,802,3,122,61,0,
	802,191,1,0,0,0,803,804,3,122,61,0,804,193,1,0,0,0,805,806,5,43,0,0,806,
	807,3,196,98,0,807,808,5,10,0,0,808,809,3,112,56,0,809,195,1,0,0,0,810,
	815,3,120,60,0,811,812,5,49,0,0,812,814,3,120,60,0,813,811,1,0,0,0,814,
	817,1,0,0,0,815,813,1,0,0,0,815,816,1,0,0,0,816,197,1,0,0,0,817,815,1,0,
	0,0,818,819,5,78,0,0,819,824,3,122,61,0,820,821,5,49,0,0,821,823,3,122,
	61,0,822,820,1,0,0,0,823,826,1,0,0,0,824,822,1,0,0,0,824,825,1,0,0,0,825,
	827,1,0,0,0,826,824,1,0,0,0,827,828,5,50,0,0,828,199,1,0,0,0,829,830,5,
	79,0,0,830,835,3,120,60,0,831,832,5,49,0,0,832,834,3,120,60,0,833,831,1,
	0,0,0,834,837,1,0,0,0,835,833,1,0,0,0,835,836,1,0,0,0,836,838,1,0,0,0,837,
	835,1,0,0,0,838,839,5,50,0,0,839,201,1,0,0,0,71,204,216,220,232,234,247,
	260,281,285,303,310,314,321,326,332,344,349,355,361,379,386,395,402,405,
	412,427,435,453,471,476,487,499,510,518,524,540,544,549,559,567,578,586,
	588,595,603,611,616,631,637,649,660,667,671,676,683,689,705,710,718,722,
	726,734,736,746,748,761,767,778,815,824,835];

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
	public AT(): TerminalNode {
		return this.getToken(StepCodeParser.AT, 0);
	}
	public identifier_list(): IdentifierContext[] {
		return this.getTypedRuleContexts(IdentifierContext) as IdentifierContext[];
	}
	public identifier(i: number): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, i) as IdentifierContext;
	}
	public LBRACK_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.LBRACK);
	}
	public LBRACK(i: number): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK, i);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public RBRACK_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.RBRACK);
	}
	public RBRACK(i: number): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK, i);
	}
	public LBRACK2_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.LBRACK2);
	}
	public LBRACK2(i: number): TerminalNode {
		return this.getToken(StepCodeParser.LBRACK2, i);
	}
	public RBRACK2_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.RBRACK2);
	}
	public RBRACK2(i: number): TerminalNode {
		return this.getToken(StepCodeParser.RBRACK2, i);
	}
	public DOT_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.DOT);
	}
	public DOT(i: number): TerminalNode {
		return this.getToken(StepCodeParser.DOT, i);
	}
	public POINTER_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.POINTER);
	}
	public POINTER(i: number): TerminalNode {
		return this.getToken(StepCodeParser.POINTER, i);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(StepCodeParser.COMMA, i);
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


export class ExpressionContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simpleExpression(): SimpleExpressionContext {
		return this.getTypedRuleContext(SimpleExpressionContext, 0) as SimpleExpressionContext;
	}
	public relationaloperator(): RelationaloperatorContext {
		return this.getTypedRuleContext(RelationaloperatorContext, 0) as RelationaloperatorContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
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
	public additiveoperator(): AdditiveoperatorContext {
		return this.getTypedRuleContext(AdditiveoperatorContext, 0) as AdditiveoperatorContext;
	}
	public simpleExpression(): SimpleExpressionContext {
		return this.getTypedRuleContext(SimpleExpressionContext, 0) as SimpleExpressionContext;
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
	public OR(): TerminalNode {
		return this.getToken(StepCodeParser.OR, 0);
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
	public signedFactor(): SignedFactorContext {
		return this.getTypedRuleContext(SignedFactorContext, 0) as SignedFactorContext;
	}
	public multiplicativeoperator(): MultiplicativeoperatorContext {
		return this.getTypedRuleContext(MultiplicativeoperatorContext, 0) as MultiplicativeoperatorContext;
	}
	public term(): TermContext {
		return this.getTypedRuleContext(TermContext, 0) as TermContext;
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
	public AND(): TerminalNode {
		return this.getToken(StepCodeParser.AND, 0);
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
	public OF(): TerminalNode {
		return this.getToken(StepCodeParser.OF, 0);
	}
	public caseListElement_list(): CaseListElementContext[] {
		return this.getTypedRuleContexts(CaseListElementContext) as CaseListElementContext[];
	}
	public caseListElement(i: number): CaseListElementContext {
		return this.getTypedRuleContext(CaseListElementContext, i) as CaseListElementContext;
	}
	public END(): TerminalNode {
		return this.getToken(StepCodeParser.END, 0);
	}
	public SEMI_list(): TerminalNode[] {
	    	return this.getTokens(StepCodeParser.SEMI);
	}
	public SEMI(i: number): TerminalNode {
		return this.getToken(StepCodeParser.SEMI, i);
	}
	public ELSE(): TerminalNode {
		return this.getToken(StepCodeParser.ELSE, 0);
	}
	public statements(): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
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
	public statement(): StatementContext {
		return this.getTypedRuleContext(StatementContext, 0) as StatementContext;
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
	public DO(): TerminalNode {
		return this.getToken(StepCodeParser.DO, 0);
	}
	public statement(): StatementContext {
		return this.getTypedRuleContext(StatementContext, 0) as StatementContext;
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
	public statements(): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
	}
	public UNTIL(): TerminalNode {
		return this.getToken(StepCodeParser.UNTIL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
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
	public DO(): TerminalNode {
		return this.getToken(StepCodeParser.DO, 0);
	}
	public statement(): StatementContext {
		return this.getTypedRuleContext(StatementContext, 0) as StatementContext;
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
