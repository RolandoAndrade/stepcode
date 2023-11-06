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
	public static readonly FOR = 18;
	public static readonly FUNCTION = 19;
	public static readonly GOTO = 20;
	public static readonly ENDIF = 21;
	public static readonly IF = 22;
	public static readonly IN = 23;
	public static readonly INTEGER = 24;
	public static readonly LABEL = 25;
	public static readonly MOD = 26;
	public static readonly NIL = 27;
	public static readonly NOT = 28;
	public static readonly OF = 29;
	public static readonly HACER = 30;
	public static readonly OR = 31;
	public static readonly PACKED = 32;
	public static readonly PROCEDURE = 33;
	public static readonly PROGRAM = 34;
	public static readonly ENDPROGRAM = 35;
	public static readonly REAL = 36;
	public static readonly RECORD = 37;
	public static readonly REPEAT = 38;
	public static readonly SET = 39;
	public static readonly THEN = 40;
	public static readonly TO = 41;
	public static readonly TYPE = 42;
	public static readonly UNTIL = 43;
	public static readonly DEFINE = 44;
	public static readonly ENDWHILE = 45;
	public static readonly WHILE = 46;
	public static readonly WITH = 47;
	public static readonly PLUS = 48;
	public static readonly MINUS = 49;
	public static readonly STAR = 50;
	public static readonly SLASH = 51;
	public static readonly ASSIGN = 52;
	public static readonly COMMA = 53;
	public static readonly SEMI = 54;
	public static readonly COLON = 55;
	public static readonly EQUAL = 56;
	public static readonly NOT_EQUAL = 57;
	public static readonly LT = 58;
	public static readonly LE = 59;
	public static readonly GE = 60;
	public static readonly GT = 61;
	public static readonly LPAREN = 62;
	public static readonly RPAREN = 63;
	public static readonly LBRACK = 64;
	public static readonly LBRACK2 = 65;
	public static readonly RBRACK = 66;
	public static readonly RBRACK2 = 67;
	public static readonly POINTER = 68;
	public static readonly AT = 69;
	public static readonly DOT = 70;
	public static readonly DOTDOT = 71;
	public static readonly LCURLY = 72;
	public static readonly RCURLY = 73;
	public static readonly AS = 74;
	public static readonly UNIT = 75;
	public static readonly INTERFACE = 76;
	public static readonly USES = 77;
	public static readonly STRING = 78;
	public static readonly IMPLEMENTATION = 79;
	public static readonly TRUE = 80;
	public static readonly FALSE = 81;
	public static readonly WRITE = 82;
	public static readonly READ = 83;
	public static readonly WS = 84;
	public static readonly COMMENT_1 = 85;
	public static readonly COMMENT_2 = 86;
	public static readonly IDENT = 87;
	public static readonly STRING_LITERAL = 88;
	public static readonly NUM_INT = 89;
	public static readonly NUM_REAL = 90;
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
	public static readonly RULE_caseOtherWise = 90;
	public static readonly RULE_repetetiveStatement = 91;
	public static readonly RULE_whileStatement = 92;
	public static readonly RULE_repeatStatement = 93;
	public static readonly RULE_forStatement = 94;
	public static readonly RULE_forList = 95;
	public static readonly RULE_initialValue = 96;
	public static readonly RULE_finalValue = 97;
	public static readonly RULE_withStatement = 98;
	public static readonly RULE_recordVariableList = 99;
	public static readonly RULE_writeStatement = 100;
	public static readonly RULE_readStatement = 101;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            "'ARRAY'", "'BEGIN'", 
                                                            null, null, 
                                                            null, null, 
                                                            "'CHR'", "'CONST'", 
                                                            "'DIV'", "'DO'", 
                                                            "'DOWNTO'", 
                                                            null, null, 
                                                            null, "'END'", 
                                                            "'FILE'", "'FOR'", 
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
                                                            "'REAL'", "'RECORD'", 
                                                            "'REPEAT'", 
                                                            "'SET'", null, 
                                                            null, "'TYPE'", 
                                                            "'UNTIL'", null, 
                                                            null, null, 
                                                            "'WITH'", "'+'", 
                                                            "'-'", "'*'", 
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
                                                             "FOR", "FUNCTION", 
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
                                                             "REAL", "RECORD", 
                                                             "REPEAT", "SET", 
                                                             "THEN", "TO", 
                                                             "TYPE", "UNTIL", 
                                                             "DEFINE", "ENDWHILE", 
                                                             "WHILE", "WITH", 
                                                             "PLUS", "MINUS", 
                                                             "STAR", "SLASH", 
                                                             "ASSIGN", "COMMA", 
                                                             "SEMI", "COLON", 
                                                             "EQUAL", "NOT_EQUAL", 
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
		"elseStatement", "caseStatement", "caseListElement", "caseOtherWise", 
		"repetetiveStatement", "whileStatement", "repeatStatement", "forStatement", 
		"forList", "initialValue", "finalValue", "withStatement", "recordVariableList", 
		"writeStatement", "readStatement",
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
			this.state = 204;
			this.programHeading();
			this.state = 206;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===76) {
				{
				this.state = 205;
				this.match(StepCodeParser.INTERFACE);
				}
			}

			this.state = 208;
			this.block();
			this.state = 209;
			this.match(StepCodeParser.ENDPROGRAM);
			this.state = 210;
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
			this.state = 222;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 34:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 212;
				this.match(StepCodeParser.PROGRAM);
				this.state = 213;
				this.identifier();
				this.state = 218;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===62) {
					{
					this.state = 214;
					this.match(StepCodeParser.LPAREN);
					this.state = 215;
					this.identifierList();
					this.state = 216;
					this.match(StepCodeParser.RPAREN);
					}
				}

				}
				break;
			case 75:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 220;
				this.match(StepCodeParser.UNIT);
				this.state = 221;
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
			this.state = 224;
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
			this.state = 236;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 39584320) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 27169) !== 0) || ((((_la - 69)) & ~0x1F) === 0 && ((1 << (_la - 69)) & 1336577) !== 0)) {
				{
				this.state = 234;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 25:
					{
					this.state = 226;
					this.labelDeclarationPart();
					}
					break;
				case 9:
					{
					this.state = 227;
					this.constantDefinitionPart();
					}
					break;
				case 42:
					{
					this.state = 228;
					this.typeDefinitionPart();
					}
					break;
				case 44:
					{
					this.state = 229;
					this.variableDeclarationPart();
					}
					break;
				case 19:
				case 33:
					{
					this.state = 230;
					this.procedureAndFunctionDeclarationPart();
					}
					break;
				case 77:
					{
					this.state = 231;
					this.usesUnitsPart();
					}
					break;
				case 79:
					{
					this.state = 232;
					this.match(StepCodeParser.IMPLEMENTATION);
					}
					break;
				case 6:
				case 18:
				case 20:
				case 22:
				case 38:
				case 46:
				case 47:
				case 69:
				case 82:
				case 83:
				case 87:
				case 89:
					{
					this.state = 233;
					this.statements();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 238;
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
			this.state = 239;
			this.match(StepCodeParser.USES);
			this.state = 240;
			this.identifierList();
			this.state = 241;
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
			this.state = 243;
			this.match(StepCodeParser.LABEL);
			this.state = 244;
			this.label();
			this.state = 249;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 245;
				this.match(StepCodeParser.COMMA);
				this.state = 246;
				this.label();
				}
				}
				this.state = 251;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 252;
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
			this.state = 254;
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
			this.state = 256;
			this.match(StepCodeParser.CONST);
			this.state = 260;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 257;
					this.constantDefinition();
					this.state = 258;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 262;
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
			this.state = 264;
			this.identifier();
			this.state = 265;
			this.match(StepCodeParser.EQUAL);
			this.state = 266;
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
			this.state = 268;
			this.match(StepCodeParser.CHR);
			this.state = 269;
			this.match(StepCodeParser.LPAREN);
			this.state = 270;
			this.unsignedInteger();
			this.state = 271;
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
			this.state = 283;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 273;
				this.unsignedNumber();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 274;
				this.sign();
				this.state = 275;
				this.unsignedNumber();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 277;
				this.identifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 278;
				this.sign();
				this.state = 279;
				this.identifier();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 281;
				this.string_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 282;
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
			this.state = 287;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 89:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 285;
				this.unsignedInteger();
				}
				break;
			case 90:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 286;
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
			this.state = 289;
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
			this.state = 291;
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
			this.state = 293;
			_la = this._input.LA(1);
			if(!(_la===48 || _la===49)) {
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
			this.state = 295;
			_la = this._input.LA(1);
			if(!(_la===80 || _la===81)) {
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
			this.state = 297;
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
			this.state = 299;
			this.match(StepCodeParser.TYPE);
			this.state = 303;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 300;
					this.typeDefinition();
					this.state = 301;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 305;
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
			this.state = 307;
			this.identifier();
			this.state = 308;
			this.match(StepCodeParser.EQUAL);
			this.state = 312;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
			case 4:
			case 7:
			case 8:
			case 17:
			case 24:
			case 32:
			case 36:
			case 37:
			case 39:
			case 48:
			case 49:
			case 62:
			case 68:
			case 78:
			case 87:
			case 88:
			case 89:
			case 90:
				{
				this.state = 309;
				this.type_();
				}
				break;
			case 19:
				{
				this.state = 310;
				this.functionType();
				}
				break;
			case 33:
				{
				this.state = 311;
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
			this.state = 314;
			this.match(StepCodeParser.FUNCTION);
			this.state = 316;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===62) {
				{
				this.state = 315;
				this.formalParameterList();
				}
			}

			this.state = 318;
			this.match(StepCodeParser.COLON);
			this.state = 319;
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
			this.state = 321;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 323;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===62) {
				{
				this.state = 322;
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
			this.state = 328;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 7:
			case 8:
			case 24:
			case 36:
			case 48:
			case 49:
			case 62:
			case 78:
			case 87:
			case 88:
			case 89:
			case 90:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 325;
				this.simpleType();
				}
				break;
			case 2:
			case 17:
			case 32:
			case 37:
			case 39:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 326;
				this.structuredType();
				}
				break;
			case 68:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 327;
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
			this.state = 334;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 330;
				this.scalarType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 331;
				this.subrangeType();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 332;
				this.typeIdentifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 333;
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
			this.state = 336;
			this.match(StepCodeParser.LPAREN);
			this.state = 337;
			this.identifierList();
			this.state = 338;
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
			this.state = 340;
			this.constant();
			this.state = 341;
			this.match(StepCodeParser.DOTDOT);
			this.state = 342;
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
			this.state = 346;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 87:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 344;
				this.identifier();
				}
				break;
			case 4:
			case 7:
			case 24:
			case 36:
			case 78:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 345;
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 16777360) !== 0) || _la===36 || _la===78)) {
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
			this.state = 351;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 32:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 348;
				this.match(StepCodeParser.PACKED);
				this.state = 349;
				this.unpackedStructuredType();
				}
				break;
			case 2:
			case 17:
			case 37:
			case 39:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 350;
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
			this.state = 357;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 353;
				this.arrayType();
				}
				break;
			case 37:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 354;
				this.recordType();
				}
				break;
			case 39:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 355;
				this.setType();
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 356;
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
			this.state = 359;
			this.match(StepCodeParser.STRING);
			this.state = 360;
			this.match(StepCodeParser.LBRACK);
			this.state = 363;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 87:
				{
				this.state = 361;
				this.identifier();
				}
				break;
			case 89:
			case 90:
				{
				this.state = 362;
				this.unsignedNumber();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 365;
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
			this.state = 381;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 367;
				this.match(StepCodeParser.ARRAY);
				this.state = 368;
				this.match(StepCodeParser.LBRACK);
				this.state = 369;
				this.typeList();
				this.state = 370;
				this.match(StepCodeParser.RBRACK);
				this.state = 371;
				this.match(StepCodeParser.OF);
				this.state = 372;
				this.componentType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 374;
				this.match(StepCodeParser.ARRAY);
				this.state = 375;
				this.match(StepCodeParser.LBRACK2);
				this.state = 376;
				this.typeList();
				this.state = 377;
				this.match(StepCodeParser.RBRACK2);
				this.state = 378;
				this.match(StepCodeParser.OF);
				this.state = 379;
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
			this.state = 383;
			this.indexType();
			this.state = 388;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 384;
				this.match(StepCodeParser.COMMA);
				this.state = 385;
				this.indexType();
				}
				}
				this.state = 390;
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
			this.state = 391;
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
			this.state = 393;
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
			this.state = 395;
			this.match(StepCodeParser.RECORD);
			this.state = 397;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===6 || _la===87) {
				{
				this.state = 396;
				this.fieldList();
				}
			}

			this.state = 399;
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
			this.state = 407;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 87:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 401;
				this.fixedPart();
				this.state = 404;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===54) {
					{
					this.state = 402;
					this.match(StepCodeParser.SEMI);
					this.state = 403;
					this.variantPart();
					}
				}

				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 406;
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
			this.state = 409;
			this.recordSection();
			this.state = 414;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 410;
					this.match(StepCodeParser.SEMI);
					this.state = 411;
					this.recordSection();
					}
					}
				}
				this.state = 416;
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
			this.state = 417;
			this.identifierList();
			this.state = 418;
			this.match(StepCodeParser.COLON);
			this.state = 419;
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
			this.state = 421;
			this.match(StepCodeParser.CASE);
			this.state = 422;
			this.tag();
			this.state = 423;
			this.match(StepCodeParser.OF);
			this.state = 424;
			this.variant();
			this.state = 429;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===54) {
				{
				{
				this.state = 425;
				this.match(StepCodeParser.SEMI);
				this.state = 426;
				this.variant();
				}
				}
				this.state = 431;
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
			this.state = 437;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 26, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 432;
				this.identifier();
				this.state = 433;
				this.match(StepCodeParser.COLON);
				this.state = 434;
				this.typeIdentifier();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 436;
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
			this.state = 439;
			this.constList();
			this.state = 440;
			this.match(StepCodeParser.COLON);
			this.state = 441;
			this.match(StepCodeParser.LPAREN);
			this.state = 442;
			this.fieldList();
			this.state = 443;
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
			this.state = 445;
			this.match(StepCodeParser.SET);
			this.state = 446;
			this.match(StepCodeParser.OF);
			this.state = 447;
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
			this.state = 449;
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
			this.state = 455;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 451;
				this.match(StepCodeParser.FILE);
				this.state = 452;
				this.match(StepCodeParser.OF);
				this.state = 453;
				this.type_();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 454;
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
			this.state = 457;
			this.match(StepCodeParser.POINTER);
			this.state = 458;
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
			this.state = 460;
			this.match(StepCodeParser.DEFINE);
			this.state = 461;
			this.variableDeclaration();
			this.state = 462;
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
			this.state = 464;
			this.identifierList();
			this.state = 465;
			this.match(StepCodeParser.AS);
			this.state = 466;
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
			this.state = 468;
			this.procedureOrFunctionDeclaration();
			this.state = 469;
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
			this.state = 473;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 33:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 471;
				this.procedureDeclaration();
				}
				break;
			case 19:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 472;
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
			this.state = 475;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 476;
			this.identifier();
			this.state = 478;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===62) {
				{
				this.state = 477;
				this.formalParameterList();
				}
			}

			this.state = 480;
			this.match(StepCodeParser.SEMI);
			this.state = 481;
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
			this.state = 483;
			this.match(StepCodeParser.LPAREN);
			this.state = 484;
			this.formalParameterSection();
			this.state = 489;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===54) {
				{
				{
				this.state = 485;
				this.match(StepCodeParser.SEMI);
				this.state = 486;
				this.formalParameterSection();
				}
				}
				this.state = 491;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 492;
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
			this.state = 501;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 87:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 494;
				this.parameterGroup();
				}
				break;
			case 44:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 495;
				this.match(StepCodeParser.DEFINE);
				this.state = 496;
				this.parameterGroup();
				}
				break;
			case 19:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 497;
				this.match(StepCodeParser.FUNCTION);
				this.state = 498;
				this.parameterGroup();
				}
				break;
			case 33:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 499;
				this.match(StepCodeParser.PROCEDURE);
				this.state = 500;
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
			this.state = 503;
			this.identifierList();
			this.state = 504;
			this.match(StepCodeParser.COLON);
			this.state = 505;
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
			this.state = 507;
			this.identifier();
			this.state = 512;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 508;
				this.match(StepCodeParser.COMMA);
				this.state = 509;
				this.identifier();
				}
				}
				this.state = 514;
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
			this.state = 515;
			this.constant();
			this.state = 520;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 516;
				this.match(StepCodeParser.COMMA);
				this.state = 517;
				this.constant();
				}
				}
				this.state = 522;
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
			this.state = 523;
			this.match(StepCodeParser.FUNCTION);
			this.state = 524;
			this.identifier();
			this.state = 526;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===62) {
				{
				this.state = 525;
				this.formalParameterList();
				}
			}

			this.state = 528;
			this.match(StepCodeParser.COLON);
			this.state = 529;
			this.resultType();
			this.state = 530;
			this.match(StepCodeParser.SEMI);
			this.state = 531;
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
			this.state = 533;
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
			this.state = 542;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 89:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 535;
				this.label();
				this.state = 536;
				this.match(StepCodeParser.COLON);
				this.state = 537;
				this.unlabelledStatement();
				}
				break;
			case 6:
			case 18:
			case 20:
			case 22:
			case 38:
			case 46:
			case 47:
			case 69:
			case 87:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 539;
				this.unlabelledStatement();
				}
				break;
			case 82:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 540;
				this.writeStatement();
				}
				break;
			case 83:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 541;
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
			this.state = 546;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 20:
			case 69:
			case 87:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 544;
				this.simpleStatement();
				}
				break;
			case 6:
			case 18:
			case 22:
			case 38:
			case 46:
			case 47:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 545;
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
			this.state = 551;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 37, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 548;
				this.assignmentStatement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 549;
				this.procedureStatement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 550;
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
			this.state = 553;
			this.variable();
			this.state = 554;
			this.match(StepCodeParser.ASSIGN);
			this.state = 555;
			this.expression();
			this.state = 556;
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
			this.state = 561;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 69:
				{
				this.state = 558;
				this.match(StepCodeParser.AT);
				this.state = 559;
				this.identifier();
				}
				break;
			case 87:
				{
				this.state = 560;
				this.identifier();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 590;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 83) !== 0)) {
				{
				this.state = 588;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 64:
					{
					this.state = 563;
					this.match(StepCodeParser.LBRACK);
					this.state = 564;
					this.expression();
					this.state = 569;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===53) {
						{
						{
						this.state = 565;
						this.match(StepCodeParser.COMMA);
						this.state = 566;
						this.expression();
						}
						}
						this.state = 571;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 572;
					this.match(StepCodeParser.RBRACK);
					}
					break;
				case 65:
					{
					this.state = 574;
					this.match(StepCodeParser.LBRACK2);
					this.state = 575;
					this.expression();
					this.state = 580;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===53) {
						{
						{
						this.state = 576;
						this.match(StepCodeParser.COMMA);
						this.state = 577;
						this.expression();
						}
						}
						this.state = 582;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 583;
					this.match(StepCodeParser.RBRACK2);
					}
					break;
				case 70:
					{
					this.state = 585;
					this.match(StepCodeParser.DOT);
					this.state = 586;
					this.identifier();
					}
					break;
				case 68:
					{
					this.state = 587;
					this.match(StepCodeParser.POINTER);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 592;
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
			this.state = 593;
			this.simpleExpression();
			this.state = 597;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===23 || ((((_la - 56)) & ~0x1F) === 0 && ((1 << (_la - 56)) & 63) !== 0)) {
				{
				this.state = 594;
				this.relationaloperator();
				this.state = 595;
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
			this.state = 599;
			_la = this._input.LA(1);
			if(!(_la===23 || ((((_la - 56)) & ~0x1F) === 0 && ((1 << (_la - 56)) & 63) !== 0))) {
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
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 601;
			this.term();
			this.state = 605;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				{
				this.state = 602;
				this.additiveoperator();
				this.state = 603;
				this.simpleExpression();
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
	public additiveoperator(): AdditiveoperatorContext {
		let localctx: AdditiveoperatorContext = new AdditiveoperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 128, StepCodeParser.RULE_additiveoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 607;
			_la = this._input.LA(1);
			if(!(((((_la - 31)) & ~0x1F) === 0 && ((1 << (_la - 31)) & 393217) !== 0))) {
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
			this.state = 609;
			this.signedFactor();
			this.state = 613;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67109890) !== 0) || _la===50 || _la===51) {
				{
				this.state = 610;
				this.multiplicativeoperator();
				this.state = 611;
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
			this.state = 615;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 67109890) !== 0) || _la===50 || _la===51)) {
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
			this.state = 618;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===48 || _la===49) {
				{
				this.state = 617;
				_la = this._input.LA(1);
				if(!(_la===48 || _la===49)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
			}

			this.state = 620;
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
			this.state = 633;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 47, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 622;
				this.variable();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 623;
				this.match(StepCodeParser.LPAREN);
				this.state = 624;
				this.expression();
				this.state = 625;
				this.match(StepCodeParser.RPAREN);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 627;
				this.functionDesignator();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 628;
				this.unsignedConstant();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 629;
				this.set_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 630;
				this.match(StepCodeParser.NOT);
				this.state = 631;
				this.factor();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 632;
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
			this.state = 639;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 89:
			case 90:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 635;
				this.unsignedNumber();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 636;
				this.constantChr();
				}
				break;
			case 88:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 637;
				this.string_();
				}
				break;
			case 27:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 638;
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
			this.state = 641;
			this.identifier();
			this.state = 642;
			this.match(StepCodeParser.LPAREN);
			this.state = 643;
			this.parameterList();
			this.state = 644;
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
			this.state = 646;
			this.actualParameter();
			this.state = 651;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 647;
				this.match(StepCodeParser.COMMA);
				this.state = 648;
				this.actualParameter();
				}
				}
				this.state = 653;
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
			this.state = 662;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 64:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 654;
				this.match(StepCodeParser.LBRACK);
				this.state = 655;
				this.elementList();
				this.state = 656;
				this.match(StepCodeParser.RBRACK);
				}
				break;
			case 65:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 658;
				this.match(StepCodeParser.LBRACK2);
				this.state = 659;
				this.elementList();
				this.state = 660;
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
			this.state = 673;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 8:
			case 27:
			case 28:
			case 48:
			case 49:
			case 62:
			case 64:
			case 65:
			case 69:
			case 80:
			case 81:
			case 87:
			case 88:
			case 89:
			case 90:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 664;
				this.element();
				this.state = 669;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===53) {
					{
					{
					this.state = 665;
					this.match(StepCodeParser.COMMA);
					this.state = 666;
					this.element();
					}
					}
					this.state = 671;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			case 66:
			case 67:
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
			this.state = 675;
			this.expression();
			this.state = 678;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===71) {
				{
				this.state = 676;
				this.match(StepCodeParser.DOTDOT);
				this.state = 677;
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
			this.state = 680;
			this.identifier();
			this.state = 685;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===62) {
				{
				this.state = 681;
				this.match(StepCodeParser.LPAREN);
				this.state = 682;
				this.parameterList();
				this.state = 683;
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
			this.state = 687;
			this.expression();
			this.state = 691;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===55) {
				{
				{
				this.state = 688;
				this.parameterwidth();
				}
				}
				this.state = 693;
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
			this.state = 694;
			this.match(StepCodeParser.COLON);
			this.state = 695;
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
			this.state = 697;
			this.match(StepCodeParser.GOTO);
			this.state = 698;
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
			this.state = 707;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 6:
			case 22:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 704;
				this.conditionalStatement();
				}
				break;
			case 18:
			case 38:
			case 46:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 705;
				this.repetetiveStatement();
				}
				break;
			case 47:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 706;
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
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 712;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 709;
					this.statements();
					}
					}
				}
				this.state = 714;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
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
			this.state = 715;
			this.statement();
			this.state = 720;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 716;
					this.match(StepCodeParser.SEMI);
					this.state = 717;
					this.statement();
					}
					}
				}
				this.state = 722;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			}
			this.state = 724;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 59, this._ctx) ) {
			case 1:
				{
				this.state = 723;
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
			this.state = 728;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 22:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 726;
				this.ifStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 727;
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
			this.state = 730;
			this.match(StepCodeParser.IF);
			this.state = 731;
			this.expression();
			this.state = 732;
			this.match(StepCodeParser.THEN);
			this.state = 733;
			this.compoundStatement();
			this.state = 738;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 13:
				{
				this.state = 734;
				this.elifStatement();
				}
				break;
			case 14:
			case 21:
				{
				this.state = 736;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 735;
					this.elseStatement();
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 740;
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
			this.state = 742;
			this.match(StepCodeParser.ELIF);
			this.state = 743;
			this.expression();
			this.state = 744;
			this.match(StepCodeParser.THEN);
			this.state = 745;
			this.compoundStatement();
			this.state = 750;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 13:
				{
				this.state = 746;
				this.elifStatement();
				}
				break;
			case 14:
			case 21:
				{
				this.state = 748;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 747;
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
			this.state = 752;
			this.match(StepCodeParser.ELSE);
			this.state = 753;
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
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 755;
			this.match(StepCodeParser.CASE);
			this.state = 756;
			this.expression();
			this.state = 757;
			_la = this._input.LA(1);
			if(!(_la===29 || _la===30)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 761;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8 || _la===48 || _la===49 || ((((_la - 87)) & ~0x1F) === 0 && ((1 << (_la - 87)) & 15) !== 0)) {
				{
				{
				this.state = 758;
				this.caseListElement();
				}
				}
				this.state = 763;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 765;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14 || _la===15) {
				{
				this.state = 764;
				this.caseOtherWise();
				}
			}

			this.state = 767;
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
		this.enterRule(localctx, 178, StepCodeParser.RULE_caseListElement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 769;
			this.constList();
			this.state = 770;
			_la = this._input.LA(1);
			if(!(_la===55 || _la===74)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 771;
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
		this.enterRule(localctx, 180, StepCodeParser.RULE_caseOtherWise);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 776;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				{
				this.state = 773;
				this.match(StepCodeParser.ELSE);
				}
				break;
			case 15:
				{
				{
				this.state = 774;
				this.match(StepCodeParser.OTHERWISE);
				this.state = 775;
				this.match(StepCodeParser.COLON);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 778;
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
		this.enterRule(localctx, 182, StepCodeParser.RULE_repetetiveStatement);
		try {
			this.state = 783;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 46:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 780;
				this.whileStatement();
				}
				break;
			case 38:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 781;
				this.repeatStatement();
				}
				break;
			case 18:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 782;
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
		this.enterRule(localctx, 184, StepCodeParser.RULE_whileStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 785;
			this.match(StepCodeParser.WHILE);
			this.state = 786;
			this.expression();
			this.state = 787;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===30)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 788;
			this.compoundStatement();
			this.state = 789;
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
		this.enterRule(localctx, 186, StepCodeParser.RULE_repeatStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 791;
			this.match(StepCodeParser.REPEAT);
			this.state = 792;
			this.compoundStatement();
			this.state = 793;
			this.match(StepCodeParser.UNTIL);
			this.state = 794;
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
		this.enterRule(localctx, 188, StepCodeParser.RULE_forStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 796;
			this.match(StepCodeParser.FOR);
			this.state = 797;
			this.identifier();
			this.state = 798;
			this.match(StepCodeParser.ASSIGN);
			this.state = 799;
			this.forList();
			this.state = 800;
			this.match(StepCodeParser.DO);
			this.state = 801;
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
	public forList(): ForListContext {
		let localctx: ForListContext = new ForListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 190, StepCodeParser.RULE_forList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 803;
			this.initialValue();
			this.state = 804;
			_la = this._input.LA(1);
			if(!(_la===12 || _la===41)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 805;
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
		this.enterRule(localctx, 192, StepCodeParser.RULE_initialValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 807;
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
		this.enterRule(localctx, 194, StepCodeParser.RULE_finalValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 809;
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
		this.enterRule(localctx, 196, StepCodeParser.RULE_withStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 811;
			this.match(StepCodeParser.WITH);
			this.state = 812;
			this.recordVariableList();
			this.state = 813;
			this.match(StepCodeParser.DO);
			this.state = 814;
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
		this.enterRule(localctx, 198, StepCodeParser.RULE_recordVariableList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 816;
			this.variable();
			this.state = 821;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 817;
				this.match(StepCodeParser.COMMA);
				this.state = 818;
				this.variable();
				}
				}
				this.state = 823;
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
		this.enterRule(localctx, 200, StepCodeParser.RULE_writeStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 824;
			this.match(StepCodeParser.WRITE);
			this.state = 825;
			this.expression();
			this.state = 830;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 826;
				this.match(StepCodeParser.COMMA);
				this.state = 827;
				this.expression();
				}
				}
				this.state = 832;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 833;
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
		this.enterRule(localctx, 202, StepCodeParser.RULE_readStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 835;
			this.match(StepCodeParser.READ);
			this.state = 836;
			this.variable();
			this.state = 841;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===53) {
				{
				{
				this.state = 837;
				this.match(StepCodeParser.COMMA);
				this.state = 838;
				this.variable();
				}
				}
				this.state = 843;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 844;
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

	public static readonly _serializedATN: number[] = [4,1,90,847,2,0,7,0,2,
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
	97,7,97,2,98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,1,0,1,0,3,0,207,8,0,
	1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,3,1,219,8,1,1,1,1,1,3,1,223,8,1,
	1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,5,3,235,8,3,10,3,12,3,238,9,3,1,
	4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,5,5,248,8,5,10,5,12,5,251,9,5,1,5,1,5,1,6,
	1,6,1,7,1,7,1,7,1,7,4,7,261,8,7,11,7,12,7,262,1,8,1,8,1,8,1,8,1,9,1,9,1,
	9,1,9,1,9,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,284,8,
	10,1,11,1,11,3,11,288,8,11,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,16,
	1,16,1,17,1,17,1,17,1,17,4,17,304,8,17,11,17,12,17,305,1,18,1,18,1,18,1,
	18,1,18,3,18,313,8,18,1,19,1,19,3,19,317,8,19,1,19,1,19,1,19,1,20,1,20,
	3,20,324,8,20,1,21,1,21,1,21,3,21,329,8,21,1,22,1,22,1,22,1,22,3,22,335,
	8,22,1,23,1,23,1,23,1,23,1,24,1,24,1,24,1,24,1,25,1,25,3,25,347,8,25,1,
	26,1,26,1,26,3,26,352,8,26,1,27,1,27,1,27,1,27,3,27,358,8,27,1,28,1,28,
	1,28,1,28,3,28,364,8,28,1,28,1,28,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,
	29,1,29,1,29,1,29,1,29,1,29,1,29,3,29,382,8,29,1,30,1,30,1,30,5,30,387,
	8,30,10,30,12,30,390,9,30,1,31,1,31,1,32,1,32,1,33,1,33,3,33,398,8,33,1,
	33,1,33,1,34,1,34,1,34,3,34,405,8,34,1,34,3,34,408,8,34,1,35,1,35,1,35,
	5,35,413,8,35,10,35,12,35,416,9,35,1,36,1,36,1,36,1,36,1,37,1,37,1,37,1,
	37,1,37,1,37,5,37,428,8,37,10,37,12,37,431,9,37,1,38,1,38,1,38,1,38,1,38,
	3,38,438,8,38,1,39,1,39,1,39,1,39,1,39,1,39,1,40,1,40,1,40,1,40,1,41,1,
	41,1,42,1,42,1,42,1,42,3,42,456,8,42,1,43,1,43,1,43,1,44,1,44,1,44,1,44,
	1,45,1,45,1,45,1,45,1,46,1,46,1,46,1,47,1,47,3,47,474,8,47,1,48,1,48,1,
	48,3,48,479,8,48,1,48,1,48,1,48,1,49,1,49,1,49,1,49,5,49,488,8,49,10,49,
	12,49,491,9,49,1,49,1,49,1,50,1,50,1,50,1,50,1,50,1,50,1,50,3,50,502,8,
	50,1,51,1,51,1,51,1,51,1,52,1,52,1,52,5,52,511,8,52,10,52,12,52,514,9,52,
	1,53,1,53,1,53,5,53,519,8,53,10,53,12,53,522,9,53,1,54,1,54,1,54,3,54,527,
	8,54,1,54,1,54,1,54,1,54,1,54,1,55,1,55,1,56,1,56,1,56,1,56,1,56,1,56,1,
	56,3,56,543,8,56,1,57,1,57,3,57,547,8,57,1,58,1,58,1,58,3,58,552,8,58,1,
	59,1,59,1,59,1,59,1,59,1,60,1,60,1,60,3,60,562,8,60,1,60,1,60,1,60,1,60,
	5,60,568,8,60,10,60,12,60,571,9,60,1,60,1,60,1,60,1,60,1,60,1,60,5,60,579,
	8,60,10,60,12,60,582,9,60,1,60,1,60,1,60,1,60,1,60,5,60,589,8,60,10,60,
	12,60,592,9,60,1,61,1,61,1,61,1,61,3,61,598,8,61,1,62,1,62,1,63,1,63,1,
	63,1,63,3,63,606,8,63,1,64,1,64,1,65,1,65,1,65,1,65,3,65,614,8,65,1,66,
	1,66,1,67,3,67,619,8,67,1,67,1,67,1,68,1,68,1,68,1,68,1,68,1,68,1,68,1,
	68,1,68,1,68,1,68,3,68,634,8,68,1,69,1,69,1,69,1,69,3,69,640,8,69,1,70,
	1,70,1,70,1,70,1,70,1,71,1,71,1,71,5,71,650,8,71,10,71,12,71,653,9,71,1,
	72,1,72,1,72,1,72,1,72,1,72,1,72,1,72,3,72,663,8,72,1,73,1,73,1,73,5,73,
	668,8,73,10,73,12,73,671,9,73,1,73,3,73,674,8,73,1,74,1,74,1,74,3,74,679,
	8,74,1,75,1,75,1,75,1,75,1,75,3,75,686,8,75,1,76,1,76,5,76,690,8,76,10,
	76,12,76,693,9,76,1,77,1,77,1,77,1,78,1,78,1,78,1,79,1,79,1,80,1,80,1,81,
	1,81,1,81,3,81,708,8,81,1,82,5,82,711,8,82,10,82,12,82,714,9,82,1,83,1,
	83,1,83,5,83,719,8,83,10,83,12,83,722,9,83,1,83,3,83,725,8,83,1,84,1,84,
	3,84,729,8,84,1,85,1,85,1,85,1,85,1,85,1,85,3,85,737,8,85,3,85,739,8,85,
	1,85,1,85,1,86,1,86,1,86,1,86,1,86,1,86,3,86,749,8,86,3,86,751,8,86,1,87,
	1,87,1,87,1,88,1,88,1,88,1,88,5,88,760,8,88,10,88,12,88,763,9,88,1,88,3,
	88,766,8,88,1,88,1,88,1,89,1,89,1,89,1,89,1,90,1,90,1,90,3,90,777,8,90,
	1,90,1,90,1,91,1,91,1,91,3,91,784,8,91,1,92,1,92,1,92,1,92,1,92,1,92,1,
	93,1,93,1,93,1,93,1,93,1,94,1,94,1,94,1,94,1,94,1,94,1,94,1,95,1,95,1,95,
	1,95,1,96,1,96,1,97,1,97,1,98,1,98,1,98,1,98,1,98,1,99,1,99,1,99,5,99,820,
	8,99,10,99,12,99,823,9,99,1,100,1,100,1,100,1,100,5,100,829,8,100,10,100,
	12,100,832,9,100,1,100,1,100,1,101,1,101,1,101,1,101,5,101,840,8,101,10,
	101,12,101,843,9,101,1,101,1,101,1,101,0,0,102,0,2,4,6,8,10,12,14,16,18,
	20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,
	68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,
	112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,144,146,
	148,150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,
	184,186,188,190,192,194,196,198,200,202,0,10,1,0,48,49,1,0,80,81,5,0,4,
	4,7,7,24,24,36,36,78,78,2,0,23,23,56,61,2,0,31,31,48,49,4,0,1,1,10,10,26,
	26,50,51,1,0,29,30,2,0,55,55,74,74,2,0,11,11,30,30,2,0,12,12,41,41,848,
	0,204,1,0,0,0,2,222,1,0,0,0,4,224,1,0,0,0,6,236,1,0,0,0,8,239,1,0,0,0,10,
	243,1,0,0,0,12,254,1,0,0,0,14,256,1,0,0,0,16,264,1,0,0,0,18,268,1,0,0,0,
	20,283,1,0,0,0,22,287,1,0,0,0,24,289,1,0,0,0,26,291,1,0,0,0,28,293,1,0,
	0,0,30,295,1,0,0,0,32,297,1,0,0,0,34,299,1,0,0,0,36,307,1,0,0,0,38,314,
	1,0,0,0,40,321,1,0,0,0,42,328,1,0,0,0,44,334,1,0,0,0,46,336,1,0,0,0,48,
	340,1,0,0,0,50,346,1,0,0,0,52,351,1,0,0,0,54,357,1,0,0,0,56,359,1,0,0,0,
	58,381,1,0,0,0,60,383,1,0,0,0,62,391,1,0,0,0,64,393,1,0,0,0,66,395,1,0,
	0,0,68,407,1,0,0,0,70,409,1,0,0,0,72,417,1,0,0,0,74,421,1,0,0,0,76,437,
	1,0,0,0,78,439,1,0,0,0,80,445,1,0,0,0,82,449,1,0,0,0,84,455,1,0,0,0,86,
	457,1,0,0,0,88,460,1,0,0,0,90,464,1,0,0,0,92,468,1,0,0,0,94,473,1,0,0,0,
	96,475,1,0,0,0,98,483,1,0,0,0,100,501,1,0,0,0,102,503,1,0,0,0,104,507,1,
	0,0,0,106,515,1,0,0,0,108,523,1,0,0,0,110,533,1,0,0,0,112,542,1,0,0,0,114,
	546,1,0,0,0,116,551,1,0,0,0,118,553,1,0,0,0,120,561,1,0,0,0,122,593,1,0,
	0,0,124,599,1,0,0,0,126,601,1,0,0,0,128,607,1,0,0,0,130,609,1,0,0,0,132,
	615,1,0,0,0,134,618,1,0,0,0,136,633,1,0,0,0,138,639,1,0,0,0,140,641,1,0,
	0,0,142,646,1,0,0,0,144,662,1,0,0,0,146,673,1,0,0,0,148,675,1,0,0,0,150,
	680,1,0,0,0,152,687,1,0,0,0,154,694,1,0,0,0,156,697,1,0,0,0,158,700,1,0,
	0,0,160,702,1,0,0,0,162,707,1,0,0,0,164,712,1,0,0,0,166,715,1,0,0,0,168,
	728,1,0,0,0,170,730,1,0,0,0,172,742,1,0,0,0,174,752,1,0,0,0,176,755,1,0,
	0,0,178,769,1,0,0,0,180,776,1,0,0,0,182,783,1,0,0,0,184,785,1,0,0,0,186,
	791,1,0,0,0,188,796,1,0,0,0,190,803,1,0,0,0,192,807,1,0,0,0,194,809,1,0,
	0,0,196,811,1,0,0,0,198,816,1,0,0,0,200,824,1,0,0,0,202,835,1,0,0,0,204,
	206,3,2,1,0,205,207,5,76,0,0,206,205,1,0,0,0,206,207,1,0,0,0,207,208,1,
	0,0,0,208,209,3,6,3,0,209,210,5,35,0,0,210,211,5,0,0,1,211,1,1,0,0,0,212,
	213,5,34,0,0,213,218,3,4,2,0,214,215,5,62,0,0,215,216,3,104,52,0,216,217,
	5,63,0,0,217,219,1,0,0,0,218,214,1,0,0,0,218,219,1,0,0,0,219,223,1,0,0,
	0,220,221,5,75,0,0,221,223,3,4,2,0,222,212,1,0,0,0,222,220,1,0,0,0,223,
	3,1,0,0,0,224,225,5,87,0,0,225,5,1,0,0,0,226,235,3,10,5,0,227,235,3,14,
	7,0,228,235,3,34,17,0,229,235,3,88,44,0,230,235,3,92,46,0,231,235,3,8,4,
	0,232,235,5,79,0,0,233,235,3,166,83,0,234,226,1,0,0,0,234,227,1,0,0,0,234,
	228,1,0,0,0,234,229,1,0,0,0,234,230,1,0,0,0,234,231,1,0,0,0,234,232,1,0,
	0,0,234,233,1,0,0,0,235,238,1,0,0,0,236,234,1,0,0,0,236,237,1,0,0,0,237,
	7,1,0,0,0,238,236,1,0,0,0,239,240,5,77,0,0,240,241,3,104,52,0,241,242,5,
	54,0,0,242,9,1,0,0,0,243,244,5,25,0,0,244,249,3,12,6,0,245,246,5,53,0,0,
	246,248,3,12,6,0,247,245,1,0,0,0,248,251,1,0,0,0,249,247,1,0,0,0,249,250,
	1,0,0,0,250,252,1,0,0,0,251,249,1,0,0,0,252,253,5,54,0,0,253,11,1,0,0,0,
	254,255,3,24,12,0,255,13,1,0,0,0,256,260,5,9,0,0,257,258,3,16,8,0,258,259,
	5,54,0,0,259,261,1,0,0,0,260,257,1,0,0,0,261,262,1,0,0,0,262,260,1,0,0,
	0,262,263,1,0,0,0,263,15,1,0,0,0,264,265,3,4,2,0,265,266,5,56,0,0,266,267,
	3,20,10,0,267,17,1,0,0,0,268,269,5,8,0,0,269,270,5,62,0,0,270,271,3,24,
	12,0,271,272,5,63,0,0,272,19,1,0,0,0,273,284,3,22,11,0,274,275,3,28,14,
	0,275,276,3,22,11,0,276,284,1,0,0,0,277,284,3,4,2,0,278,279,3,28,14,0,279,
	280,3,4,2,0,280,284,1,0,0,0,281,284,3,32,16,0,282,284,3,18,9,0,283,273,
	1,0,0,0,283,274,1,0,0,0,283,277,1,0,0,0,283,278,1,0,0,0,283,281,1,0,0,0,
	283,282,1,0,0,0,284,21,1,0,0,0,285,288,3,24,12,0,286,288,3,26,13,0,287,
	285,1,0,0,0,287,286,1,0,0,0,288,23,1,0,0,0,289,290,5,89,0,0,290,25,1,0,
	0,0,291,292,5,90,0,0,292,27,1,0,0,0,293,294,7,0,0,0,294,29,1,0,0,0,295,
	296,7,1,0,0,296,31,1,0,0,0,297,298,5,88,0,0,298,33,1,0,0,0,299,303,5,42,
	0,0,300,301,3,36,18,0,301,302,5,54,0,0,302,304,1,0,0,0,303,300,1,0,0,0,
	304,305,1,0,0,0,305,303,1,0,0,0,305,306,1,0,0,0,306,35,1,0,0,0,307,308,
	3,4,2,0,308,312,5,56,0,0,309,313,3,42,21,0,310,313,3,38,19,0,311,313,3,
	40,20,0,312,309,1,0,0,0,312,310,1,0,0,0,312,311,1,0,0,0,313,37,1,0,0,0,
	314,316,5,19,0,0,315,317,3,98,49,0,316,315,1,0,0,0,316,317,1,0,0,0,317,
	318,1,0,0,0,318,319,5,55,0,0,319,320,3,110,55,0,320,39,1,0,0,0,321,323,
	5,33,0,0,322,324,3,98,49,0,323,322,1,0,0,0,323,324,1,0,0,0,324,41,1,0,0,
	0,325,329,3,44,22,0,326,329,3,52,26,0,327,329,3,86,43,0,328,325,1,0,0,0,
	328,326,1,0,0,0,328,327,1,0,0,0,329,43,1,0,0,0,330,335,3,46,23,0,331,335,
	3,48,24,0,332,335,3,50,25,0,333,335,3,56,28,0,334,330,1,0,0,0,334,331,1,
	0,0,0,334,332,1,0,0,0,334,333,1,0,0,0,335,45,1,0,0,0,336,337,5,62,0,0,337,
	338,3,104,52,0,338,339,5,63,0,0,339,47,1,0,0,0,340,341,3,20,10,0,341,342,
	5,71,0,0,342,343,3,20,10,0,343,49,1,0,0,0,344,347,3,4,2,0,345,347,7,2,0,
	0,346,344,1,0,0,0,346,345,1,0,0,0,347,51,1,0,0,0,348,349,5,32,0,0,349,352,
	3,54,27,0,350,352,3,54,27,0,351,348,1,0,0,0,351,350,1,0,0,0,352,53,1,0,
	0,0,353,358,3,58,29,0,354,358,3,66,33,0,355,358,3,80,40,0,356,358,3,84,
	42,0,357,353,1,0,0,0,357,354,1,0,0,0,357,355,1,0,0,0,357,356,1,0,0,0,358,
	55,1,0,0,0,359,360,5,78,0,0,360,363,5,64,0,0,361,364,3,4,2,0,362,364,3,
	22,11,0,363,361,1,0,0,0,363,362,1,0,0,0,364,365,1,0,0,0,365,366,5,66,0,
	0,366,57,1,0,0,0,367,368,5,2,0,0,368,369,5,64,0,0,369,370,3,60,30,0,370,
	371,5,66,0,0,371,372,5,29,0,0,372,373,3,64,32,0,373,382,1,0,0,0,374,375,
	5,2,0,0,375,376,5,65,0,0,376,377,3,60,30,0,377,378,5,67,0,0,378,379,5,29,
	0,0,379,380,3,64,32,0,380,382,1,0,0,0,381,367,1,0,0,0,381,374,1,0,0,0,382,
	59,1,0,0,0,383,388,3,62,31,0,384,385,5,53,0,0,385,387,3,62,31,0,386,384,
	1,0,0,0,387,390,1,0,0,0,388,386,1,0,0,0,388,389,1,0,0,0,389,61,1,0,0,0,
	390,388,1,0,0,0,391,392,3,44,22,0,392,63,1,0,0,0,393,394,3,42,21,0,394,
	65,1,0,0,0,395,397,5,37,0,0,396,398,3,68,34,0,397,396,1,0,0,0,397,398,1,
	0,0,0,398,399,1,0,0,0,399,400,5,16,0,0,400,67,1,0,0,0,401,404,3,70,35,0,
	402,403,5,54,0,0,403,405,3,74,37,0,404,402,1,0,0,0,404,405,1,0,0,0,405,
	408,1,0,0,0,406,408,3,74,37,0,407,401,1,0,0,0,407,406,1,0,0,0,408,69,1,
	0,0,0,409,414,3,72,36,0,410,411,5,54,0,0,411,413,3,72,36,0,412,410,1,0,
	0,0,413,416,1,0,0,0,414,412,1,0,0,0,414,415,1,0,0,0,415,71,1,0,0,0,416,
	414,1,0,0,0,417,418,3,104,52,0,418,419,5,55,0,0,419,420,3,42,21,0,420,73,
	1,0,0,0,421,422,5,6,0,0,422,423,3,76,38,0,423,424,5,29,0,0,424,429,3,78,
	39,0,425,426,5,54,0,0,426,428,3,78,39,0,427,425,1,0,0,0,428,431,1,0,0,0,
	429,427,1,0,0,0,429,430,1,0,0,0,430,75,1,0,0,0,431,429,1,0,0,0,432,433,
	3,4,2,0,433,434,5,55,0,0,434,435,3,50,25,0,435,438,1,0,0,0,436,438,3,50,
	25,0,437,432,1,0,0,0,437,436,1,0,0,0,438,77,1,0,0,0,439,440,3,106,53,0,
	440,441,5,55,0,0,441,442,5,62,0,0,442,443,3,68,34,0,443,444,5,63,0,0,444,
	79,1,0,0,0,445,446,5,39,0,0,446,447,5,29,0,0,447,448,3,82,41,0,448,81,1,
	0,0,0,449,450,3,44,22,0,450,83,1,0,0,0,451,452,5,17,0,0,452,453,5,29,0,
	0,453,456,3,42,21,0,454,456,5,17,0,0,455,451,1,0,0,0,455,454,1,0,0,0,456,
	85,1,0,0,0,457,458,5,68,0,0,458,459,3,50,25,0,459,87,1,0,0,0,460,461,5,
	44,0,0,461,462,3,90,45,0,462,463,5,54,0,0,463,89,1,0,0,0,464,465,3,104,
	52,0,465,466,5,74,0,0,466,467,3,42,21,0,467,91,1,0,0,0,468,469,3,94,47,
	0,469,470,5,54,0,0,470,93,1,0,0,0,471,474,3,96,48,0,472,474,3,108,54,0,
	473,471,1,0,0,0,473,472,1,0,0,0,474,95,1,0,0,0,475,476,5,33,0,0,476,478,
	3,4,2,0,477,479,3,98,49,0,478,477,1,0,0,0,478,479,1,0,0,0,479,480,1,0,0,
	0,480,481,5,54,0,0,481,482,3,6,3,0,482,97,1,0,0,0,483,484,5,62,0,0,484,
	489,3,100,50,0,485,486,5,54,0,0,486,488,3,100,50,0,487,485,1,0,0,0,488,
	491,1,0,0,0,489,487,1,0,0,0,489,490,1,0,0,0,490,492,1,0,0,0,491,489,1,0,
	0,0,492,493,5,63,0,0,493,99,1,0,0,0,494,502,3,102,51,0,495,496,5,44,0,0,
	496,502,3,102,51,0,497,498,5,19,0,0,498,502,3,102,51,0,499,500,5,33,0,0,
	500,502,3,102,51,0,501,494,1,0,0,0,501,495,1,0,0,0,501,497,1,0,0,0,501,
	499,1,0,0,0,502,101,1,0,0,0,503,504,3,104,52,0,504,505,5,55,0,0,505,506,
	3,50,25,0,506,103,1,0,0,0,507,512,3,4,2,0,508,509,5,53,0,0,509,511,3,4,
	2,0,510,508,1,0,0,0,511,514,1,0,0,0,512,510,1,0,0,0,512,513,1,0,0,0,513,
	105,1,0,0,0,514,512,1,0,0,0,515,520,3,20,10,0,516,517,5,53,0,0,517,519,
	3,20,10,0,518,516,1,0,0,0,519,522,1,0,0,0,520,518,1,0,0,0,520,521,1,0,0,
	0,521,107,1,0,0,0,522,520,1,0,0,0,523,524,5,19,0,0,524,526,3,4,2,0,525,
	527,3,98,49,0,526,525,1,0,0,0,526,527,1,0,0,0,527,528,1,0,0,0,528,529,5,
	55,0,0,529,530,3,110,55,0,530,531,5,54,0,0,531,532,3,6,3,0,532,109,1,0,
	0,0,533,534,3,50,25,0,534,111,1,0,0,0,535,536,3,12,6,0,536,537,5,55,0,0,
	537,538,3,114,57,0,538,543,1,0,0,0,539,543,3,114,57,0,540,543,3,200,100,
	0,541,543,3,202,101,0,542,535,1,0,0,0,542,539,1,0,0,0,542,540,1,0,0,0,542,
	541,1,0,0,0,543,113,1,0,0,0,544,547,3,116,58,0,545,547,3,162,81,0,546,544,
	1,0,0,0,546,545,1,0,0,0,547,115,1,0,0,0,548,552,3,118,59,0,549,552,3,150,
	75,0,550,552,3,156,78,0,551,548,1,0,0,0,551,549,1,0,0,0,551,550,1,0,0,0,
	552,117,1,0,0,0,553,554,3,120,60,0,554,555,5,52,0,0,555,556,3,122,61,0,
	556,557,5,54,0,0,557,119,1,0,0,0,558,559,5,69,0,0,559,562,3,4,2,0,560,562,
	3,4,2,0,561,558,1,0,0,0,561,560,1,0,0,0,562,590,1,0,0,0,563,564,5,64,0,
	0,564,569,3,122,61,0,565,566,5,53,0,0,566,568,3,122,61,0,567,565,1,0,0,
	0,568,571,1,0,0,0,569,567,1,0,0,0,569,570,1,0,0,0,570,572,1,0,0,0,571,569,
	1,0,0,0,572,573,5,66,0,0,573,589,1,0,0,0,574,575,5,65,0,0,575,580,3,122,
	61,0,576,577,5,53,0,0,577,579,3,122,61,0,578,576,1,0,0,0,579,582,1,0,0,
	0,580,578,1,0,0,0,580,581,1,0,0,0,581,583,1,0,0,0,582,580,1,0,0,0,583,584,
	5,67,0,0,584,589,1,0,0,0,585,586,5,70,0,0,586,589,3,4,2,0,587,589,5,68,
	0,0,588,563,1,0,0,0,588,574,1,0,0,0,588,585,1,0,0,0,588,587,1,0,0,0,589,
	592,1,0,0,0,590,588,1,0,0,0,590,591,1,0,0,0,591,121,1,0,0,0,592,590,1,0,
	0,0,593,597,3,126,63,0,594,595,3,124,62,0,595,596,3,122,61,0,596,598,1,
	0,0,0,597,594,1,0,0,0,597,598,1,0,0,0,598,123,1,0,0,0,599,600,7,3,0,0,600,
	125,1,0,0,0,601,605,3,130,65,0,602,603,3,128,64,0,603,604,3,126,63,0,604,
	606,1,0,0,0,605,602,1,0,0,0,605,606,1,0,0,0,606,127,1,0,0,0,607,608,7,4,
	0,0,608,129,1,0,0,0,609,613,3,134,67,0,610,611,3,132,66,0,611,612,3,130,
	65,0,612,614,1,0,0,0,613,610,1,0,0,0,613,614,1,0,0,0,614,131,1,0,0,0,615,
	616,7,5,0,0,616,133,1,0,0,0,617,619,7,0,0,0,618,617,1,0,0,0,618,619,1,0,
	0,0,619,620,1,0,0,0,620,621,3,136,68,0,621,135,1,0,0,0,622,634,3,120,60,
	0,623,624,5,62,0,0,624,625,3,122,61,0,625,626,5,63,0,0,626,634,1,0,0,0,
	627,634,3,140,70,0,628,634,3,138,69,0,629,634,3,144,72,0,630,631,5,28,0,
	0,631,634,3,136,68,0,632,634,3,30,15,0,633,622,1,0,0,0,633,623,1,0,0,0,
	633,627,1,0,0,0,633,628,1,0,0,0,633,629,1,0,0,0,633,630,1,0,0,0,633,632,
	1,0,0,0,634,137,1,0,0,0,635,640,3,22,11,0,636,640,3,18,9,0,637,640,3,32,
	16,0,638,640,5,27,0,0,639,635,1,0,0,0,639,636,1,0,0,0,639,637,1,0,0,0,639,
	638,1,0,0,0,640,139,1,0,0,0,641,642,3,4,2,0,642,643,5,62,0,0,643,644,3,
	142,71,0,644,645,5,63,0,0,645,141,1,0,0,0,646,651,3,152,76,0,647,648,5,
	53,0,0,648,650,3,152,76,0,649,647,1,0,0,0,650,653,1,0,0,0,651,649,1,0,0,
	0,651,652,1,0,0,0,652,143,1,0,0,0,653,651,1,0,0,0,654,655,5,64,0,0,655,
	656,3,146,73,0,656,657,5,66,0,0,657,663,1,0,0,0,658,659,5,65,0,0,659,660,
	3,146,73,0,660,661,5,67,0,0,661,663,1,0,0,0,662,654,1,0,0,0,662,658,1,0,
	0,0,663,145,1,0,0,0,664,669,3,148,74,0,665,666,5,53,0,0,666,668,3,148,74,
	0,667,665,1,0,0,0,668,671,1,0,0,0,669,667,1,0,0,0,669,670,1,0,0,0,670,674,
	1,0,0,0,671,669,1,0,0,0,672,674,1,0,0,0,673,664,1,0,0,0,673,672,1,0,0,0,
	674,147,1,0,0,0,675,678,3,122,61,0,676,677,5,71,0,0,677,679,3,122,61,0,
	678,676,1,0,0,0,678,679,1,0,0,0,679,149,1,0,0,0,680,685,3,4,2,0,681,682,
	5,62,0,0,682,683,3,142,71,0,683,684,5,63,0,0,684,686,1,0,0,0,685,681,1,
	0,0,0,685,686,1,0,0,0,686,151,1,0,0,0,687,691,3,122,61,0,688,690,3,154,
	77,0,689,688,1,0,0,0,690,693,1,0,0,0,691,689,1,0,0,0,691,692,1,0,0,0,692,
	153,1,0,0,0,693,691,1,0,0,0,694,695,5,55,0,0,695,696,3,122,61,0,696,155,
	1,0,0,0,697,698,5,20,0,0,698,699,3,12,6,0,699,157,1,0,0,0,700,701,1,0,0,
	0,701,159,1,0,0,0,702,703,1,0,0,0,703,161,1,0,0,0,704,708,3,168,84,0,705,
	708,3,182,91,0,706,708,3,196,98,0,707,704,1,0,0,0,707,705,1,0,0,0,707,706,
	1,0,0,0,708,163,1,0,0,0,709,711,3,166,83,0,710,709,1,0,0,0,711,714,1,0,
	0,0,712,710,1,0,0,0,712,713,1,0,0,0,713,165,1,0,0,0,714,712,1,0,0,0,715,
	720,3,112,56,0,716,717,5,54,0,0,717,719,3,112,56,0,718,716,1,0,0,0,719,
	722,1,0,0,0,720,718,1,0,0,0,720,721,1,0,0,0,721,724,1,0,0,0,722,720,1,0,
	0,0,723,725,5,54,0,0,724,723,1,0,0,0,724,725,1,0,0,0,725,167,1,0,0,0,726,
	729,3,170,85,0,727,729,3,176,88,0,728,726,1,0,0,0,728,727,1,0,0,0,729,169,
	1,0,0,0,730,731,5,22,0,0,731,732,3,122,61,0,732,733,5,40,0,0,733,738,3,
	164,82,0,734,739,3,172,86,0,735,737,3,174,87,0,736,735,1,0,0,0,736,737,
	1,0,0,0,737,739,1,0,0,0,738,734,1,0,0,0,738,736,1,0,0,0,739,740,1,0,0,0,
	740,741,5,21,0,0,741,171,1,0,0,0,742,743,5,13,0,0,743,744,3,122,61,0,744,
	745,5,40,0,0,745,750,3,164,82,0,746,751,3,172,86,0,747,749,3,174,87,0,748,
	747,1,0,0,0,748,749,1,0,0,0,749,751,1,0,0,0,750,746,1,0,0,0,750,748,1,0,
	0,0,751,173,1,0,0,0,752,753,5,14,0,0,753,754,3,164,82,0,754,175,1,0,0,0,
	755,756,5,6,0,0,756,757,3,122,61,0,757,761,7,6,0,0,758,760,3,178,89,0,759,
	758,1,0,0,0,760,763,1,0,0,0,761,759,1,0,0,0,761,762,1,0,0,0,762,765,1,0,
	0,0,763,761,1,0,0,0,764,766,3,180,90,0,765,764,1,0,0,0,765,766,1,0,0,0,
	766,767,1,0,0,0,767,768,5,5,0,0,768,177,1,0,0,0,769,770,3,106,53,0,770,
	771,7,7,0,0,771,772,3,164,82,0,772,179,1,0,0,0,773,777,5,14,0,0,774,775,
	5,15,0,0,775,777,5,55,0,0,776,773,1,0,0,0,776,774,1,0,0,0,777,778,1,0,0,
	0,778,779,3,164,82,0,779,181,1,0,0,0,780,784,3,184,92,0,781,784,3,186,93,
	0,782,784,3,188,94,0,783,780,1,0,0,0,783,781,1,0,0,0,783,782,1,0,0,0,784,
	183,1,0,0,0,785,786,5,46,0,0,786,787,3,122,61,0,787,788,7,8,0,0,788,789,
	3,164,82,0,789,790,5,45,0,0,790,185,1,0,0,0,791,792,5,38,0,0,792,793,3,
	164,82,0,793,794,5,43,0,0,794,795,3,122,61,0,795,187,1,0,0,0,796,797,5,
	18,0,0,797,798,3,4,2,0,798,799,5,52,0,0,799,800,3,190,95,0,800,801,5,11,
	0,0,801,802,3,164,82,0,802,189,1,0,0,0,803,804,3,192,96,0,804,805,7,9,0,
	0,805,806,3,194,97,0,806,191,1,0,0,0,807,808,3,122,61,0,808,193,1,0,0,0,
	809,810,3,122,61,0,810,195,1,0,0,0,811,812,5,47,0,0,812,813,3,198,99,0,
	813,814,5,11,0,0,814,815,3,112,56,0,815,197,1,0,0,0,816,821,3,120,60,0,
	817,818,5,53,0,0,818,820,3,120,60,0,819,817,1,0,0,0,820,823,1,0,0,0,821,
	819,1,0,0,0,821,822,1,0,0,0,822,199,1,0,0,0,823,821,1,0,0,0,824,825,5,82,
	0,0,825,830,3,122,61,0,826,827,5,53,0,0,827,829,3,122,61,0,828,826,1,0,
	0,0,829,832,1,0,0,0,830,828,1,0,0,0,830,831,1,0,0,0,831,833,1,0,0,0,832,
	830,1,0,0,0,833,834,5,54,0,0,834,201,1,0,0,0,835,836,5,83,0,0,836,841,3,
	120,60,0,837,838,5,53,0,0,838,840,3,120,60,0,839,837,1,0,0,0,840,843,1,
	0,0,0,841,839,1,0,0,0,841,842,1,0,0,0,842,844,1,0,0,0,843,841,1,0,0,0,844,
	845,5,54,0,0,845,203,1,0,0,0,72,206,218,222,234,236,249,262,283,287,305,
	312,316,323,328,334,346,351,357,363,381,388,397,404,407,414,429,437,455,
	473,478,489,501,512,520,526,542,546,551,561,569,580,588,590,597,605,613,
	618,633,639,651,662,669,673,678,685,691,707,712,720,724,728,736,738,748,
	750,761,765,776,783,821,830,841];

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
	public compoundStatement(): CompoundStatementContext {
		return this.getTypedRuleContext(CompoundStatementContext, 0) as CompoundStatementContext;
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
