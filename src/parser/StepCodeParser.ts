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
	public static readonly ENDFUNCTION = 23;
	public static readonly FUNCTION = 24;
	public static readonly GOTO = 25;
	public static readonly ENDIF = 26;
	public static readonly IF = 27;
	public static readonly IN = 28;
	public static readonly VOID = 29;
	public static readonly INTEGER = 30;
	public static readonly LABEL = 31;
	public static readonly DIMENSION = 32;
	public static readonly MOD = 33;
	public static readonly NIL = 34;
	public static readonly NOT = 35;
	public static readonly OF = 36;
	public static readonly HACER = 37;
	public static readonly OR = 38;
	public static readonly PACKED = 39;
	public static readonly ENDPROCEDURE = 40;
	public static readonly PROCEDURE = 41;
	public static readonly PROGRAM = 42;
	public static readonly ENDPROGRAM = 43;
	public static readonly BREAK = 44;
	public static readonly CONTINUE = 45;
	public static readonly RETURN = 46;
	public static readonly REAL = 47;
	public static readonly RECORD = 48;
	public static readonly REPEAT = 49;
	public static readonly SET = 50;
	public static readonly THEN = 51;
	public static readonly UNTIL = 52;
	public static readonly TO = 53;
	public static readonly TYPE = 54;
	public static readonly DEFINE = 55;
	public static readonly ENDWHILE = 56;
	public static readonly MIENTRASQUE = 57;
	public static readonly WHILE = 58;
	public static readonly WITH = 59;
	public static readonly PLUS = 60;
	public static readonly MINUS = 61;
	public static readonly POWER = 62;
	public static readonly STAR = 63;
	public static readonly SLASH = 64;
	public static readonly ASSIGN = 65;
	public static readonly COMMA = 66;
	public static readonly SEMI = 67;
	public static readonly COLON = 68;
	public static readonly EQUAL = 69;
	public static readonly NOT_EQUAL = 70;
	public static readonly LT = 71;
	public static readonly LE = 72;
	public static readonly GE = 73;
	public static readonly GT = 74;
	public static readonly LPAREN = 75;
	public static readonly RPAREN = 76;
	public static readonly LBRACK = 77;
	public static readonly LBRACK2 = 78;
	public static readonly RBRACK = 79;
	public static readonly RBRACK2 = 80;
	public static readonly POINTER = 81;
	public static readonly AT = 82;
	public static readonly DOT = 83;
	public static readonly DOTDOT = 84;
	public static readonly LCURLY = 85;
	public static readonly RCURLY = 86;
	public static readonly AS = 87;
	public static readonly UNIT = 88;
	public static readonly INTERFACE = 89;
	public static readonly USES = 90;
	public static readonly STRING = 91;
	public static readonly IMPLEMENTATION = 92;
	public static readonly TRUE = 93;
	public static readonly FALSE = 94;
	public static readonly WRITE = 95;
	public static readonly READ = 96;
	public static readonly WS = 97;
	public static readonly COMMENT_1 = 98;
	public static readonly COMMENT_2 = 99;
	public static readonly IDENT = 100;
	public static readonly STRING_LITERAL = 101;
	public static readonly NUM_INT = 102;
	public static readonly NUM_REAL = 103;
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
	public static readonly RULE_assignationFunctionDeclaration = 59;
	public static readonly RULE_resultType = 60;
	public static readonly RULE_statement = 61;
	public static readonly RULE_breakStatement = 62;
	public static readonly RULE_returnStatement = 63;
	public static readonly RULE_continueStatement = 64;
	public static readonly RULE_unlabelledStatement = 65;
	public static readonly RULE_simpleStatement = 66;
	public static readonly RULE_assignmentStatement = 67;
	public static readonly RULE_variable = 68;
	public static readonly RULE_accessor = 69;
	public static readonly RULE_index = 70;
	public static readonly RULE_expression = 71;
	public static readonly RULE_booleanMultiplicativeExpression = 72;
	public static readonly RULE_booleanRelationalExpression = 73;
	public static readonly RULE_relationaloperator = 74;
	public static readonly RULE_simpleExpression = 75;
	public static readonly RULE_additiveoperator = 76;
	public static readonly RULE_term = 77;
	public static readonly RULE_baseTerm = 78;
	public static readonly RULE_multiplicativeoperator = 79;
	public static readonly RULE_exponentiationOperator = 80;
	public static readonly RULE_signedFactor = 81;
	public static readonly RULE_factor = 82;
	public static readonly RULE_unsignedConstant = 83;
	public static readonly RULE_functionDesignator = 84;
	public static readonly RULE_parameterList = 85;
	public static readonly RULE_set_ = 86;
	public static readonly RULE_elementList = 87;
	public static readonly RULE_element = 88;
	public static readonly RULE_procedureStatement = 89;
	public static readonly RULE_actualParameter = 90;
	public static readonly RULE_parameterwidth = 91;
	public static readonly RULE_gotoStatement = 92;
	public static readonly RULE_emptyStatement_ = 93;
	public static readonly RULE_empty_ = 94;
	public static readonly RULE_structuredStatement = 95;
	public static readonly RULE_compoundStatement = 96;
	public static readonly RULE_statements = 97;
	public static readonly RULE_conditionalStatement = 98;
	public static readonly RULE_ifStatement = 99;
	public static readonly RULE_elifStatement = 100;
	public static readonly RULE_elseStatement = 101;
	public static readonly RULE_caseStatement = 102;
	public static readonly RULE_caseListElement = 103;
	public static readonly RULE_caseOtherWise = 104;
	public static readonly RULE_repetetiveStatement = 105;
	public static readonly RULE_whileStatement = 106;
	public static readonly RULE_repeatStatement = 107;
	public static readonly RULE_forStatement = 108;
	public static readonly RULE_forList = 109;
	public static readonly RULE_initialValue = 110;
	public static readonly RULE_finalValue = 111;
	public static readonly RULE_stepValue = 112;
	public static readonly RULE_withStatement = 113;
	public static readonly RULE_recordVariableList = 114;
	public static readonly RULE_writeStatement = 115;
	public static readonly RULE_readStatement = 116;
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
                                                            null, null, 
                                                            "'GOTO'", null, 
                                                            null, "'IN'", 
                                                            null, null, 
                                                            "'LABEL'", "'DIMENSION'", 
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
                                                            "'.)'", "'^^'", 
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
                                                             "ENDFUNCTION", 
                                                             "FUNCTION", 
                                                             "GOTO", "ENDIF", 
                                                             "IF", "IN", 
                                                             "VOID", "INTEGER", 
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
		"assignationFunctionDeclaration", "resultType", "statement", "breakStatement", 
		"returnStatement", "continueStatement", "unlabelledStatement", "simpleStatement", 
		"assignmentStatement", "variable", "accessor", "index", "expression", 
		"booleanMultiplicativeExpression", "booleanRelationalExpression", "relationaloperator", 
		"simpleExpression", "additiveoperator", "term", "baseTerm", "multiplicativeoperator", 
		"exponentiationOperator", "signedFactor", "factor", "unsignedConstant", 
		"functionDesignator", "parameterList", "set_", "elementList", "element", 
		"procedureStatement", "actualParameter", "parameterwidth", "gotoStatement", 
		"emptyStatement_", "empty_", "structuredStatement", "compoundStatement", 
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
			this.state = 237;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===24 || _la===41) {
				{
				{
				this.state = 234;
				this.subprogram();
				}
				}
				this.state = 239;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 240;
			this.main();
			this.state = 244;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===24 || _la===41) {
				{
				{
				this.state = 241;
				this.subprogram();
				}
				}
				this.state = 246;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 247;
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
			this.state = 249;
			this.programHeading();
			this.state = 251;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===89) {
				{
				this.state = 250;
				this.match(StepCodeParser.INTERFACE);
				}
			}

			this.state = 253;
			this.block();
			this.state = 254;
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
			this.state = 256;
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
			this.state = 268;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 42:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 258;
				this.match(StepCodeParser.PROGRAM);
				this.state = 259;
				this.identifier();
				this.state = 264;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===75) {
					{
					this.state = 260;
					this.match(StepCodeParser.LPAREN);
					this.state = 261;
					this.identifierList();
					this.state = 262;
					this.match(StepCodeParser.RPAREN);
					}
				}

				}
				break;
			case 88:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 266;
				this.match(StepCodeParser.UNIT);
				this.state = 267;
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
			this.state = 270;
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
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 283;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2333082176) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 214069761) !== 0) || ((((_la - 90)) & ~0x1F) === 0 && ((1 << (_la - 90)) & 5221) !== 0)) {
				{
				this.state = 281;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 31:
					{
					this.state = 272;
					this.labelDeclarationPart();
					}
					break;
				case 9:
					{
					this.state = 273;
					this.constantDefinitionPart();
					}
					break;
				case 54:
					{
					this.state = 274;
					this.typeDefinitionPart();
					}
					break;
				case 55:
					{
					this.state = 275;
					this.variableDeclarationPart();
					}
					break;
				case 32:
					{
					this.state = 276;
					this.dimensionStatement();
					}
					break;
				case 24:
				case 41:
					{
					this.state = 277;
					this.procedureAndFunctionDeclarationPart();
					}
					break;
				case 90:
					{
					this.state = 278;
					this.usesUnitsPart();
					}
					break;
				case 92:
					{
					this.state = 279;
					this.match(StepCodeParser.IMPLEMENTATION);
					}
					break;
				case 6:
				case 20:
				case 25:
				case 27:
				case 44:
				case 45:
				case 46:
				case 49:
				case 58:
				case 59:
				case 95:
				case 96:
				case 100:
				case 102:
					{
					this.state = 280;
					this.statements();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 285;
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
		this.enterRule(localctx, 12, StepCodeParser.RULE_usesUnitsPart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 286;
			this.match(StepCodeParser.USES);
			this.state = 287;
			this.identifierList();
			this.state = 288;
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
			this.state = 290;
			this.match(StepCodeParser.LABEL);
			this.state = 291;
			this.label();
			this.state = 296;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 292;
				this.match(StepCodeParser.COMMA);
				this.state = 293;
				this.label();
				}
				}
				this.state = 298;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 299;
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
			this.state = 301;
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
			this.state = 303;
			this.match(StepCodeParser.CONST);
			this.state = 307;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 304;
					this.constantDefinition();
					this.state = 305;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 309;
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
			this.state = 311;
			this.identifier();
			this.state = 312;
			this.match(StepCodeParser.EQUAL);
			this.state = 313;
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
			this.state = 315;
			this.match(StepCodeParser.CHR);
			this.state = 316;
			this.match(StepCodeParser.LPAREN);
			this.state = 317;
			this.unsignedInteger();
			this.state = 318;
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
			this.state = 330;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 320;
				this.unsignedNumber();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 321;
				this.sign();
				this.state = 322;
				this.unsignedNumber();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 324;
				this.identifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 325;
				this.sign();
				this.state = 326;
				this.identifier();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 328;
				this.string_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 329;
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
			this.state = 334;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 102:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 332;
				this.unsignedInteger();
				}
				break;
			case 103:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 333;
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
			this.state = 336;
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
			this.state = 338;
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
			this.state = 340;
			_la = this._input.LA(1);
			if(!(_la===60 || _la===61)) {
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
			this.state = 342;
			_la = this._input.LA(1);
			if(!(_la===93 || _la===94)) {
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
			this.state = 344;
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
			this.state = 346;
			this.match(StepCodeParser.TYPE);
			this.state = 350;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 347;
					this.typeDefinition();
					this.state = 348;
					this.match(StepCodeParser.SEMI);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 352;
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
			this.state = 354;
			this.identifier();
			this.state = 355;
			this.match(StepCodeParser.EQUAL);
			this.state = 359;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
			case 4:
			case 7:
			case 8:
			case 17:
			case 29:
			case 30:
			case 39:
			case 47:
			case 48:
			case 50:
			case 60:
			case 61:
			case 75:
			case 81:
			case 91:
			case 100:
			case 101:
			case 102:
			case 103:
				{
				this.state = 356;
				this.type_();
				}
				break;
			case 24:
				{
				this.state = 357;
				this.functionType();
				}
				break;
			case 41:
				{
				this.state = 358;
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
			this.state = 361;
			this.match(StepCodeParser.FUNCTION);
			this.state = 363;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===75) {
				{
				this.state = 362;
				this.formalParameterList();
				}
			}

			this.state = 365;
			this.match(StepCodeParser.COLON);
			this.state = 366;
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
			this.state = 368;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 370;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===75) {
				{
				this.state = 369;
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
			this.state = 375;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 7:
			case 8:
			case 29:
			case 30:
			case 47:
			case 60:
			case 61:
			case 75:
			case 91:
			case 100:
			case 101:
			case 102:
			case 103:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 372;
				this.simpleType();
				}
				break;
			case 2:
			case 17:
			case 39:
			case 48:
			case 50:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 373;
				this.structuredType();
				}
				break;
			case 81:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 374;
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
			this.state = 381;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 377;
				this.scalarType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 378;
				this.subrangeType();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 379;
				this.typeIdentifier();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 380;
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
			this.state = 383;
			this.match(StepCodeParser.LPAREN);
			this.state = 384;
			this.identifierList();
			this.state = 385;
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
			this.state = 387;
			this.constant();
			this.state = 388;
			this.match(StepCodeParser.DOTDOT);
			this.state = 389;
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
			this.state = 393;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 100:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 391;
				this.identifier();
				}
				break;
			case 4:
			case 7:
			case 29:
			case 30:
			case 47:
			case 91:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 392;
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1610612880) !== 0) || _la===47 || _la===91)) {
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
			this.state = 398;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 39:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 395;
				this.match(StepCodeParser.PACKED);
				this.state = 396;
				this.unpackedStructuredType();
				}
				break;
			case 2:
			case 17:
			case 48:
			case 50:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 397;
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
			this.state = 404;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 2:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 400;
				this.arrayType();
				}
				break;
			case 48:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 401;
				this.recordType();
				}
				break;
			case 50:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 402;
				this.setType();
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 403;
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
			this.state = 406;
			this.match(StepCodeParser.STRING);
			this.state = 407;
			this.match(StepCodeParser.LBRACK);
			this.state = 410;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 100:
				{
				this.state = 408;
				this.identifier();
				}
				break;
			case 102:
			case 103:
				{
				this.state = 409;
				this.unsignedNumber();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 412;
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
			this.state = 428;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 21, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 414;
				this.match(StepCodeParser.ARRAY);
				this.state = 415;
				this.match(StepCodeParser.LBRACK);
				this.state = 416;
				this.typeList();
				this.state = 417;
				this.match(StepCodeParser.RBRACK);
				this.state = 418;
				this.match(StepCodeParser.OF);
				this.state = 419;
				this.componentType();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 421;
				this.match(StepCodeParser.ARRAY);
				this.state = 422;
				this.match(StepCodeParser.LBRACK2);
				this.state = 423;
				this.typeList();
				this.state = 424;
				this.match(StepCodeParser.RBRACK2);
				this.state = 425;
				this.match(StepCodeParser.OF);
				this.state = 426;
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
			this.state = 430;
			this.match(StepCodeParser.DIMENSION);
			this.state = 431;
			this.identifier();
			this.state = 432;
			this.dimensionType();
			this.state = 433;
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
			this.state = 435;
			this.match(StepCodeParser.LBRACK);
			this.state = 436;
			this.unsignedNumber();
			this.state = 441;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 437;
				this.match(StepCodeParser.COMMA);
				this.state = 438;
				this.unsignedNumber();
				}
				}
				this.state = 443;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 444;
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
			this.state = 446;
			this.indexType();
			this.state = 451;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 447;
				this.match(StepCodeParser.COMMA);
				this.state = 448;
				this.indexType();
				}
				}
				this.state = 453;
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
			this.state = 454;
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
			this.state = 456;
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
			this.state = 458;
			this.match(StepCodeParser.RECORD);
			this.state = 460;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===6 || _la===100) {
				{
				this.state = 459;
				this.fieldList();
				}
			}

			this.state = 462;
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
			this.state = 470;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 100:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 464;
				this.fixedPart();
				this.state = 467;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===67) {
					{
					this.state = 465;
					this.match(StepCodeParser.SEMI);
					this.state = 466;
					this.variantPart();
					}
				}

				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 469;
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
			this.state = 472;
			this.recordSection();
			this.state = 477;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 473;
					this.match(StepCodeParser.SEMI);
					this.state = 474;
					this.recordSection();
					}
					}
				}
				this.state = 479;
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
			this.state = 480;
			this.identifierList();
			this.state = 481;
			this.match(StepCodeParser.COLON);
			this.state = 482;
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
			this.state = 484;
			this.match(StepCodeParser.CASE);
			this.state = 485;
			this.tag();
			this.state = 486;
			this.match(StepCodeParser.OF);
			this.state = 487;
			this.variant();
			this.state = 492;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===67) {
				{
				{
				this.state = 488;
				this.match(StepCodeParser.SEMI);
				this.state = 489;
				this.variant();
				}
				}
				this.state = 494;
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
			this.state = 500;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 495;
				this.identifier();
				this.state = 496;
				this.match(StepCodeParser.COLON);
				this.state = 497;
				this.typeIdentifier();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 499;
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
			this.state = 502;
			this.constList();
			this.state = 503;
			this.match(StepCodeParser.COLON);
			this.state = 504;
			this.match(StepCodeParser.LPAREN);
			this.state = 505;
			this.fieldList();
			this.state = 506;
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
			this.state = 508;
			this.match(StepCodeParser.SET);
			this.state = 509;
			this.match(StepCodeParser.OF);
			this.state = 510;
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
			this.state = 512;
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
			this.state = 518;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 514;
				this.match(StepCodeParser.FILE);
				this.state = 515;
				this.match(StepCodeParser.OF);
				this.state = 516;
				this.type_();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 517;
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
			this.state = 520;
			this.match(StepCodeParser.POINTER);
			this.state = 521;
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
			this.state = 523;
			this.match(StepCodeParser.DEFINE);
			this.state = 524;
			this.variableDeclaration();
			this.state = 525;
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
			this.state = 527;
			this.identifierList();
			this.state = 528;
			this.match(StepCodeParser.AS);
			this.state = 529;
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
			this.state = 531;
			this.procedureOrFunctionDeclaration();
			this.state = 532;
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
			this.state = 537;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 31, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 534;
				this.procedureDeclaration();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 535;
				this.functionDeclaration();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 536;
				this.assignationFunctionDeclaration();
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
	public procedureDeclaration(): ProcedureDeclarationContext {
		let localctx: ProcedureDeclarationContext = new ProcedureDeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 104, StepCodeParser.RULE_procedureDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 539;
			this.match(StepCodeParser.PROCEDURE);
			this.state = 540;
			this.identifier();
			this.state = 542;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===75) {
				{
				this.state = 541;
				this.formalParameterList();
				}
			}

			this.state = 544;
			this.block();
			this.state = 545;
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
			this.state = 547;
			this.match(StepCodeParser.LPAREN);
			this.state = 548;
			this.formalParameterSection();
			this.state = 549;
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
			this.state = 552;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===100) {
				{
				this.state = 551;
				this.paramIdentifier();
				}
			}

			this.state = 558;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 554;
				this.match(StepCodeParser.COMMA);
				this.state = 555;
				this.paramIdentifier();
				}
				}
				this.state = 560;
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
			this.state = 561;
			this.identifier();
			this.state = 566;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 562;
				this.match(StepCodeParser.COMMA);
				this.state = 563;
				this.identifier();
				}
				}
				this.state = 568;
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
			this.state = 569;
			this.identifier();
			this.state = 572;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===68 || _la===87) {
				{
				this.state = 570;
				_la = this._input.LA(1);
				if(!(_la===68 || _la===87)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 571;
				this.typeIdentifier();
				}
			}

			this.state = 575;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===21 || _la===22) {
				{
				this.state = 574;
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
			this.state = 577;
			this.constant();
			this.state = 582;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 578;
				this.match(StepCodeParser.COMMA);
				this.state = 579;
				this.constant();
				}
				}
				this.state = 584;
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
			this.state = 585;
			this.match(StepCodeParser.FUNCTION);
			this.state = 586;
			this.identifier();
			this.state = 588;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===75) {
				{
				this.state = 587;
				this.formalParameterList();
				}
			}

			this.state = 590;
			this.match(StepCodeParser.COLON);
			this.state = 591;
			this.resultType();
			this.state = 592;
			this.block();
			this.state = 593;
			this.match(StepCodeParser.ENDFUNCTION);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignationFunctionDeclaration(): AssignationFunctionDeclarationContext {
		let localctx: AssignationFunctionDeclarationContext = new AssignationFunctionDeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 118, StepCodeParser.RULE_assignationFunctionDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 595;
			this.match(StepCodeParser.FUNCTION);
			this.state = 596;
			this.identifier();
			this.state = 597;
			this.match(StepCodeParser.ASSIGN);
			this.state = 598;
			this.identifier();
			this.state = 600;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===75) {
				{
				this.state = 599;
				this.formalParameterList();
				}
			}

			this.state = 602;
			this.block();
			this.state = 603;
			this.match(StepCodeParser.ENDFUNCTION);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
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
		this.enterRule(localctx, 120, StepCodeParser.RULE_resultType);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 605;
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
		this.enterRule(localctx, 122, StepCodeParser.RULE_statement);
		try {
			this.state = 617;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 102:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 607;
				this.label();
				this.state = 608;
				this.match(StepCodeParser.COLON);
				this.state = 609;
				this.unlabelledStatement();
				}
				break;
			case 6:
			case 20:
			case 25:
			case 27:
			case 49:
			case 58:
			case 59:
			case 100:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 611;
				this.unlabelledStatement();
				}
				break;
			case 95:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 612;
				this.writeStatement();
				}
				break;
			case 96:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 613;
				this.readStatement();
				}
				break;
			case 44:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 614;
				this.breakStatement();
				}
				break;
			case 45:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 615;
				this.continueStatement();
				}
				break;
			case 46:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 616;
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
		this.enterRule(localctx, 124, StepCodeParser.RULE_breakStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 619;
			this.match(StepCodeParser.BREAK);
			this.state = 620;
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
		this.enterRule(localctx, 126, StepCodeParser.RULE_returnStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 622;
			this.match(StepCodeParser.RETURN);
			this.state = 624;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8 || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 201326595) !== 0) || ((((_la - 75)) & ~0x1F) === 0 && ((1 << (_la - 75)) & 504102925) !== 0)) {
				{
				this.state = 623;
				this.expression(0);
				}
			}

			this.state = 626;
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
		this.enterRule(localctx, 128, StepCodeParser.RULE_continueStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 628;
			this.match(StepCodeParser.CONTINUE);
			this.state = 629;
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
		this.enterRule(localctx, 130, StepCodeParser.RULE_unlabelledStatement);
		try {
			this.state = 633;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 25:
			case 100:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 631;
				this.simpleStatement();
				}
				break;
			case 6:
			case 20:
			case 27:
			case 49:
			case 58:
			case 59:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 632;
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
		this.enterRule(localctx, 132, StepCodeParser.RULE_simpleStatement);
		try {
			this.state = 638;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 635;
				this.assignmentStatement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 636;
				this.procedureStatement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 637;
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
		this.enterRule(localctx, 134, StepCodeParser.RULE_assignmentStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 640;
			this.variable();
			this.state = 641;
			this.match(StepCodeParser.ASSIGN);
			this.state = 642;
			this.expression(0);
			this.state = 643;
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
		this.enterRule(localctx, 136, StepCodeParser.RULE_variable);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 645;
			this.identifier();
			this.state = 649;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 646;
					this.accessor();
					}
					}
				}
				this.state = 651;
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
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public accessor(): AccessorContext {
		let localctx: AccessorContext = new AccessorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 138, StepCodeParser.RULE_accessor);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 652;
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
		this.enterRule(localctx, 140, StepCodeParser.RULE_index);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 654;
			this.match(StepCodeParser.LBRACK);
			this.state = 655;
			this.expression(0);
			this.state = 660;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 656;
				this.match(StepCodeParser.COMMA);
				this.state = 657;
				this.expression(0);
				}
				}
				this.state = 662;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 663;
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
		let _startState: number = 142;
		this.enterRecursionRule(localctx, 142, StepCodeParser.RULE_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 666;
			this.booleanMultiplicativeExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 673;
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
					localctx = new ExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_expression);
					this.state = 668;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 669;
					this.match(StepCodeParser.OR);
					this.state = 670;
					this.expression(2);
					}
					}
				}
				this.state = 675;
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
		let _startState: number = 144;
		this.enterRecursionRule(localctx, 144, StepCodeParser.RULE_booleanMultiplicativeExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 677;
			this.booleanRelationalExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 684;
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
					localctx = new BooleanMultiplicativeExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_booleanMultiplicativeExpression);
					this.state = 679;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 680;
					this.match(StepCodeParser.AND);
					this.state = 681;
					this.booleanMultiplicativeExpression(2);
					}
					}
				}
				this.state = 686;
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
		let _startState: number = 146;
		this.enterRecursionRule(localctx, 146, StepCodeParser.RULE_booleanRelationalExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 688;
			this.simpleExpression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 696;
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
					localctx = new BooleanRelationalExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_booleanRelationalExpression);
					this.state = 690;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 691;
					this.relationaloperator();
					this.state = 692;
					this.booleanRelationalExpression(2);
					}
					}
				}
				this.state = 698;
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
	// @RuleVersion(0)
	public relationaloperator(): RelationaloperatorContext {
		let localctx: RelationaloperatorContext = new RelationaloperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 148, StepCodeParser.RULE_relationaloperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 699;
			_la = this._input.LA(1);
			if(!(_la===28 || ((((_la - 69)) & ~0x1F) === 0 && ((1 << (_la - 69)) & 63) !== 0))) {
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
		let _startState: number = 150;
		this.enterRecursionRule(localctx, 150, StepCodeParser.RULE_simpleExpression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 702;
			this.term(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 710;
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
					localctx = new SimpleExpressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, StepCodeParser.RULE_simpleExpression);
					this.state = 704;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 705;
					this.additiveoperator();
					this.state = 706;
					this.simpleExpression(2);
					}
					}
				}
				this.state = 712;
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
	public additiveoperator(): AdditiveoperatorContext {
		let localctx: AdditiveoperatorContext = new AdditiveoperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 152, StepCodeParser.RULE_additiveoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 713;
			_la = this._input.LA(1);
			if(!(_la===60 || _la===61)) {
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
		let _startState: number = 154;
		this.enterRecursionRule(localctx, 154, StepCodeParser.RULE_term, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 716;
			this.baseTerm(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 724;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 51, this._ctx);
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
					this.state = 718;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 719;
					this.multiplicativeoperator();
					this.state = 720;
					this.term(2);
					}
					}
				}
				this.state = 726;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 51, this._ctx);
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
		let _startState: number = 156;
		this.enterRecursionRule(localctx, 156, StepCodeParser.RULE_baseTerm, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 728;
			this.signedFactor();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 736;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 52, this._ctx);
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
					this.state = 730;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 731;
					this.exponentiationOperator();
					this.state = 732;
					this.baseTerm(2);
					}
					}
				}
				this.state = 738;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 52, this._ctx);
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
		this.enterRule(localctx, 158, StepCodeParser.RULE_multiplicativeoperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 739;
			_la = this._input.LA(1);
			if(!(_la===10 || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 3221225473) !== 0))) {
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
		this.enterRule(localctx, 160, StepCodeParser.RULE_exponentiationOperator);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 741;
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
		this.enterRule(localctx, 162, StepCodeParser.RULE_signedFactor);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 744;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===60 || _la===61) {
				{
				this.state = 743;
				_la = this._input.LA(1);
				if(!(_la===60 || _la===61)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
			}

			this.state = 746;
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
		this.enterRule(localctx, 164, StepCodeParser.RULE_factor);
		try {
			this.state = 759;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 54, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 748;
				this.variable();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 749;
				this.match(StepCodeParser.LPAREN);
				this.state = 750;
				this.expression(0);
				this.state = 751;
				this.match(StepCodeParser.RPAREN);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 753;
				this.functionDesignator();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 754;
				this.unsignedConstant();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 755;
				this.set_();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 756;
				this.match(StepCodeParser.NOT);
				this.state = 757;
				this.factor();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 758;
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
		this.enterRule(localctx, 166, StepCodeParser.RULE_unsignedConstant);
		try {
			this.state = 765;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 102:
			case 103:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 761;
				this.unsignedNumber();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 762;
				this.constantChr();
				}
				break;
			case 101:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 763;
				this.string_();
				}
				break;
			case 34:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 764;
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
		this.enterRule(localctx, 168, StepCodeParser.RULE_functionDesignator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 767;
			this.identifier();
			this.state = 768;
			this.match(StepCodeParser.LPAREN);
			this.state = 770;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8 || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 201326595) !== 0) || ((((_la - 75)) & ~0x1F) === 0 && ((1 << (_la - 75)) & 504102925) !== 0)) {
				{
				this.state = 769;
				this.parameterList();
				}
			}

			this.state = 772;
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
		this.enterRule(localctx, 170, StepCodeParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 774;
			this.actualParameter();
			this.state = 779;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 775;
				this.match(StepCodeParser.COMMA);
				this.state = 776;
				this.actualParameter();
				}
				}
				this.state = 781;
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
		this.enterRule(localctx, 172, StepCodeParser.RULE_set_);
		try {
			this.state = 790;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 77:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 782;
				this.match(StepCodeParser.LBRACK);
				this.state = 783;
				this.elementList();
				this.state = 784;
				this.match(StepCodeParser.RBRACK);
				}
				break;
			case 78:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 786;
				this.match(StepCodeParser.LBRACK2);
				this.state = 787;
				this.elementList();
				this.state = 788;
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
		this.enterRule(localctx, 174, StepCodeParser.RULE_elementList);
		let _la: number;
		try {
			this.state = 801;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 8:
			case 34:
			case 35:
			case 60:
			case 61:
			case 75:
			case 77:
			case 78:
			case 93:
			case 94:
			case 100:
			case 101:
			case 102:
			case 103:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 792;
				this.element();
				this.state = 797;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===66) {
					{
					{
					this.state = 793;
					this.match(StepCodeParser.COMMA);
					this.state = 794;
					this.element();
					}
					}
					this.state = 799;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			case 79:
			case 80:
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
		this.enterRule(localctx, 176, StepCodeParser.RULE_element);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 803;
			this.expression(0);
			this.state = 806;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===84) {
				{
				this.state = 804;
				this.match(StepCodeParser.DOTDOT);
				this.state = 805;
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
		this.enterRule(localctx, 178, StepCodeParser.RULE_procedureStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 808;
			this.identifier();
			{
			this.state = 809;
			this.match(StepCodeParser.LPAREN);
			this.state = 811;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8 || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 201326595) !== 0) || ((((_la - 75)) & ~0x1F) === 0 && ((1 << (_la - 75)) & 504102925) !== 0)) {
				{
				this.state = 810;
				this.parameterList();
				}
			}

			this.state = 813;
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
		this.enterRule(localctx, 180, StepCodeParser.RULE_actualParameter);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 815;
			this.expression(0);
			this.state = 819;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===68) {
				{
				{
				this.state = 816;
				this.parameterwidth();
				}
				}
				this.state = 821;
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
		this.enterRule(localctx, 182, StepCodeParser.RULE_parameterwidth);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 822;
			this.match(StepCodeParser.COLON);
			this.state = 823;
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
		this.enterRule(localctx, 184, StepCodeParser.RULE_gotoStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 825;
			this.match(StepCodeParser.GOTO);
			this.state = 826;
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
		this.enterRule(localctx, 186, StepCodeParser.RULE_emptyStatement_);
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
		this.enterRule(localctx, 188, StepCodeParser.RULE_empty_);
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
		this.enterRule(localctx, 190, StepCodeParser.RULE_structuredStatement);
		try {
			this.state = 835;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 6:
			case 27:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 832;
				this.conditionalStatement();
				}
				break;
			case 20:
			case 49:
			case 58:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 833;
				this.repetetiveStatement();
				}
				break;
			case 59:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 834;
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
		this.enterRule(localctx, 192, StepCodeParser.RULE_compoundStatement);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 840;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 837;
					this.statements();
					}
					}
				}
				this.state = 842;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
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
		this.enterRule(localctx, 194, StepCodeParser.RULE_statements);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 843;
			this.statement();
			this.state = 848;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 66, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 844;
					this.match(StepCodeParser.SEMI);
					this.state = 845;
					this.statement();
					}
					}
				}
				this.state = 850;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 66, this._ctx);
			}
			this.state = 852;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===67) {
				{
				this.state = 851;
				this.match(StepCodeParser.SEMI);
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
	public conditionalStatement(): ConditionalStatementContext {
		let localctx: ConditionalStatementContext = new ConditionalStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 196, StepCodeParser.RULE_conditionalStatement);
		try {
			this.state = 856;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 27:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 854;
				this.ifStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 855;
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
		this.enterRule(localctx, 198, StepCodeParser.RULE_ifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 858;
			this.match(StepCodeParser.IF);
			this.state = 859;
			this.expression(0);
			this.state = 860;
			this.match(StepCodeParser.THEN);
			this.state = 861;
			this.compoundStatement();
			this.state = 866;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 13:
				{
				this.state = 862;
				this.elifStatement();
				}
				break;
			case 14:
			case 26:
				{
				this.state = 864;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 863;
					this.elseStatement();
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 868;
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
		this.enterRule(localctx, 200, StepCodeParser.RULE_elifStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 870;
			this.match(StepCodeParser.ELIF);
			this.state = 871;
			this.expression(0);
			this.state = 872;
			this.match(StepCodeParser.THEN);
			this.state = 873;
			this.compoundStatement();
			this.state = 879;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 72, this._ctx) ) {
			case 1:
				{
				this.state = 874;
				this.elifStatement();
				}
				break;
			case 2:
				{
				this.state = 876;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 875;
					this.elseStatement();
					}
				}

				}
				break;
			case 3:
				{
				this.state = 878;
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
		this.enterRule(localctx, 202, StepCodeParser.RULE_elseStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 881;
			this.match(StepCodeParser.ELSE);
			this.state = 882;
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
		this.enterRule(localctx, 204, StepCodeParser.RULE_caseStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 884;
			this.match(StepCodeParser.CASE);
			this.state = 885;
			this.expression(0);
			this.state = 886;
			_la = this._input.LA(1);
			if(!(_la===36 || _la===37)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 890;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8 || _la===60 || _la===61 || ((((_la - 100)) & ~0x1F) === 0 && ((1 << (_la - 100)) & 15) !== 0)) {
				{
				{
				this.state = 887;
				this.caseListElement();
				}
				}
				this.state = 892;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 894;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14 || _la===15) {
				{
				this.state = 893;
				this.caseOtherWise();
				}
			}

			this.state = 896;
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
		this.enterRule(localctx, 206, StepCodeParser.RULE_caseListElement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 898;
			this.constList();
			this.state = 899;
			_la = this._input.LA(1);
			if(!(_la===68 || _la===87)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 900;
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
		this.enterRule(localctx, 208, StepCodeParser.RULE_caseOtherWise);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 905;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				{
				this.state = 902;
				this.match(StepCodeParser.ELSE);
				}
				break;
			case 15:
				{
				{
				this.state = 903;
				this.match(StepCodeParser.OTHERWISE);
				this.state = 904;
				this.match(StepCodeParser.COLON);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 907;
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
		this.enterRule(localctx, 210, StepCodeParser.RULE_repetetiveStatement);
		try {
			this.state = 912;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 58:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 909;
				this.whileStatement();
				}
				break;
			case 49:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 910;
				this.repeatStatement();
				}
				break;
			case 20:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 911;
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
		this.enterRule(localctx, 212, StepCodeParser.RULE_whileStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 914;
			this.match(StepCodeParser.WHILE);
			this.state = 915;
			this.expression(0);
			this.state = 916;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===37)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 917;
			this.compoundStatement();
			this.state = 918;
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
		this.enterRule(localctx, 214, StepCodeParser.RULE_repeatStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 920;
			this.match(StepCodeParser.REPEAT);
			this.state = 921;
			this.compoundStatement();
			this.state = 922;
			_la = this._input.LA(1);
			if(!(_la===52 || _la===57)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 923;
			this.expression(0);
			this.state = 924;
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
		this.enterRule(localctx, 216, StepCodeParser.RULE_forStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 926;
			this.match(StepCodeParser.FOR);
			this.state = 927;
			this.identifier();
			this.state = 928;
			this.match(StepCodeParser.ASSIGN);
			this.state = 929;
			this.forList();
			this.state = 932;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===18) {
				{
				this.state = 930;
				this.match(StepCodeParser.WITHSTEP);
				this.state = 931;
				this.stepValue();
				}
			}

			this.state = 934;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===37)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 935;
			this.compoundStatement();
			this.state = 936;
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
		this.enterRule(localctx, 218, StepCodeParser.RULE_forList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 938;
			this.initialValue();
			this.state = 939;
			_la = this._input.LA(1);
			if(!(_la===12 || _la===53)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 940;
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
		this.enterRule(localctx, 220, StepCodeParser.RULE_initialValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 942;
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
		this.enterRule(localctx, 222, StepCodeParser.RULE_finalValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 944;
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
		this.enterRule(localctx, 224, StepCodeParser.RULE_stepValue);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 946;
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
		this.enterRule(localctx, 226, StepCodeParser.RULE_withStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 948;
			this.match(StepCodeParser.WITH);
			this.state = 949;
			this.recordVariableList();
			this.state = 950;
			this.match(StepCodeParser.DO);
			this.state = 951;
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
		this.enterRule(localctx, 228, StepCodeParser.RULE_recordVariableList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 953;
			this.variable();
			this.state = 958;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 954;
				this.match(StepCodeParser.COMMA);
				this.state = 955;
				this.variable();
				}
				}
				this.state = 960;
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
		this.enterRule(localctx, 230, StepCodeParser.RULE_writeStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 961;
			this.match(StepCodeParser.WRITE);
			this.state = 962;
			this.expression(0);
			this.state = 967;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 963;
				this.match(StepCodeParser.COMMA);
				this.state = 964;
				this.expression(0);
				}
				}
				this.state = 969;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 970;
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
		this.enterRule(localctx, 232, StepCodeParser.RULE_readStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 972;
			this.match(StepCodeParser.READ);
			this.state = 973;
			this.variable();
			this.state = 978;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 974;
				this.match(StepCodeParser.COMMA);
				this.state = 975;
				this.variable();
				}
				}
				this.state = 980;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 981;
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
		case 71:
			return this.expression_sempred(localctx as ExpressionContext, predIndex);
		case 72:
			return this.booleanMultiplicativeExpression_sempred(localctx as BooleanMultiplicativeExpressionContext, predIndex);
		case 73:
			return this.booleanRelationalExpression_sempred(localctx as BooleanRelationalExpressionContext, predIndex);
		case 75:
			return this.simpleExpression_sempred(localctx as SimpleExpressionContext, predIndex);
		case 77:
			return this.term_sempred(localctx as TermContext, predIndex);
		case 78:
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

	public static readonly _serializedATN: number[] = [4,1,103,984,2,0,7,0,
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
	7,115,2,116,7,116,1,0,5,0,236,8,0,10,0,12,0,239,9,0,1,0,1,0,5,0,243,8,0,
	10,0,12,0,246,9,0,1,0,1,0,1,1,1,1,3,1,252,8,1,1,1,1,1,1,1,1,2,1,2,1,3,1,
	3,1,3,1,3,1,3,1,3,3,3,265,8,3,1,3,1,3,3,3,269,8,3,1,4,1,4,1,5,1,5,1,5,1,
	5,1,5,1,5,1,5,1,5,1,5,5,5,282,8,5,10,5,12,5,285,9,5,1,6,1,6,1,6,1,6,1,7,
	1,7,1,7,1,7,5,7,295,8,7,10,7,12,7,298,9,7,1,7,1,7,1,8,1,8,1,9,1,9,1,9,1,
	9,4,9,308,8,9,11,9,12,9,309,1,10,1,10,1,10,1,10,1,11,1,11,1,11,1,11,1,11,
	1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,3,12,331,8,12,1,13,1,
	13,3,13,335,8,13,1,14,1,14,1,15,1,15,1,16,1,16,1,17,1,17,1,18,1,18,1,19,
	1,19,1,19,1,19,4,19,351,8,19,11,19,12,19,352,1,20,1,20,1,20,1,20,1,20,3,
	20,360,8,20,1,21,1,21,3,21,364,8,21,1,21,1,21,1,21,1,22,1,22,3,22,371,8,
	22,1,23,1,23,1,23,3,23,376,8,23,1,24,1,24,1,24,1,24,3,24,382,8,24,1,25,
	1,25,1,25,1,25,1,26,1,26,1,26,1,26,1,27,1,27,3,27,394,8,27,1,28,1,28,1,
	28,3,28,399,8,28,1,29,1,29,1,29,1,29,3,29,405,8,29,1,30,1,30,1,30,1,30,
	3,30,411,8,30,1,30,1,30,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,
	31,1,31,1,31,1,31,1,31,3,31,429,8,31,1,32,1,32,1,32,1,32,1,32,1,33,1,33,
	1,33,1,33,5,33,440,8,33,10,33,12,33,443,9,33,1,33,1,33,1,34,1,34,1,34,5,
	34,450,8,34,10,34,12,34,453,9,34,1,35,1,35,1,36,1,36,1,37,1,37,3,37,461,
	8,37,1,37,1,37,1,38,1,38,1,38,3,38,468,8,38,1,38,3,38,471,8,38,1,39,1,39,
	1,39,5,39,476,8,39,10,39,12,39,479,9,39,1,40,1,40,1,40,1,40,1,41,1,41,1,
	41,1,41,1,41,1,41,5,41,491,8,41,10,41,12,41,494,9,41,1,42,1,42,1,42,1,42,
	1,42,3,42,501,8,42,1,43,1,43,1,43,1,43,1,43,1,43,1,44,1,44,1,44,1,44,1,
	45,1,45,1,46,1,46,1,46,1,46,3,46,519,8,46,1,47,1,47,1,47,1,48,1,48,1,48,
	1,48,1,49,1,49,1,49,1,49,1,50,1,50,1,50,1,51,1,51,1,51,3,51,538,8,51,1,
	52,1,52,1,52,3,52,543,8,52,1,52,1,52,1,52,1,53,1,53,1,53,1,53,1,54,3,54,
	553,8,54,1,54,1,54,5,54,557,8,54,10,54,12,54,560,9,54,1,55,1,55,1,55,5,
	55,565,8,55,10,55,12,55,568,9,55,1,56,1,56,1,56,3,56,573,8,56,1,56,3,56,
	576,8,56,1,57,1,57,1,57,5,57,581,8,57,10,57,12,57,584,9,57,1,58,1,58,1,
	58,3,58,589,8,58,1,58,1,58,1,58,1,58,1,58,1,59,1,59,1,59,1,59,1,59,3,59,
	601,8,59,1,59,1,59,1,59,1,60,1,60,1,61,1,61,1,61,1,61,1,61,1,61,1,61,1,
	61,1,61,1,61,3,61,618,8,61,1,62,1,62,1,62,1,63,1,63,3,63,625,8,63,1,63,
	1,63,1,64,1,64,1,64,1,65,1,65,3,65,634,8,65,1,66,1,66,1,66,3,66,639,8,66,
	1,67,1,67,1,67,1,67,1,67,1,68,1,68,5,68,648,8,68,10,68,12,68,651,9,68,1,
	69,1,69,1,70,1,70,1,70,1,70,5,70,659,8,70,10,70,12,70,662,9,70,1,70,1,70,
	1,71,1,71,1,71,1,71,1,71,1,71,5,71,672,8,71,10,71,12,71,675,9,71,1,72,1,
	72,1,72,1,72,1,72,1,72,5,72,683,8,72,10,72,12,72,686,9,72,1,73,1,73,1,73,
	1,73,1,73,1,73,1,73,5,73,695,8,73,10,73,12,73,698,9,73,1,74,1,74,1,75,1,
	75,1,75,1,75,1,75,1,75,1,75,5,75,709,8,75,10,75,12,75,712,9,75,1,76,1,76,
	1,77,1,77,1,77,1,77,1,77,1,77,1,77,5,77,723,8,77,10,77,12,77,726,9,77,1,
	78,1,78,1,78,1,78,1,78,1,78,1,78,5,78,735,8,78,10,78,12,78,738,9,78,1,79,
	1,79,1,80,1,80,1,81,3,81,745,8,81,1,81,1,81,1,82,1,82,1,82,1,82,1,82,1,
	82,1,82,1,82,1,82,1,82,1,82,3,82,760,8,82,1,83,1,83,1,83,1,83,3,83,766,
	8,83,1,84,1,84,1,84,3,84,771,8,84,1,84,1,84,1,85,1,85,1,85,5,85,778,8,85,
	10,85,12,85,781,9,85,1,86,1,86,1,86,1,86,1,86,1,86,1,86,1,86,3,86,791,8,
	86,1,87,1,87,1,87,5,87,796,8,87,10,87,12,87,799,9,87,1,87,3,87,802,8,87,
	1,88,1,88,1,88,3,88,807,8,88,1,89,1,89,1,89,3,89,812,8,89,1,89,1,89,1,90,
	1,90,5,90,818,8,90,10,90,12,90,821,9,90,1,91,1,91,1,91,1,92,1,92,1,92,1,
	93,1,93,1,94,1,94,1,95,1,95,1,95,3,95,836,8,95,1,96,5,96,839,8,96,10,96,
	12,96,842,9,96,1,97,1,97,1,97,5,97,847,8,97,10,97,12,97,850,9,97,1,97,3,
	97,853,8,97,1,98,1,98,3,98,857,8,98,1,99,1,99,1,99,1,99,1,99,1,99,3,99,
	865,8,99,3,99,867,8,99,1,99,1,99,1,100,1,100,1,100,1,100,1,100,1,100,3,
	100,877,8,100,1,100,3,100,880,8,100,1,101,1,101,1,101,1,102,1,102,1,102,
	1,102,5,102,889,8,102,10,102,12,102,892,9,102,1,102,3,102,895,8,102,1,102,
	1,102,1,103,1,103,1,103,1,103,1,104,1,104,1,104,3,104,906,8,104,1,104,1,
	104,1,105,1,105,1,105,3,105,913,8,105,1,106,1,106,1,106,1,106,1,106,1,106,
	1,107,1,107,1,107,1,107,1,107,1,107,1,108,1,108,1,108,1,108,1,108,1,108,
	3,108,933,8,108,1,108,1,108,1,108,1,108,1,109,1,109,1,109,1,109,1,110,1,
	110,1,111,1,111,1,112,1,112,1,113,1,113,1,113,1,113,1,113,1,114,1,114,1,
	114,5,114,957,8,114,10,114,12,114,960,9,114,1,115,1,115,1,115,1,115,5,115,
	966,8,115,10,115,12,115,969,9,115,1,115,1,115,1,116,1,116,1,116,1,116,5,
	116,977,8,116,10,116,12,116,980,9,116,1,116,1,116,1,116,0,6,142,144,146,
	150,154,156,117,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,
	40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,
	88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,126,
	128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,162,
	164,166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,
	200,202,204,206,208,210,212,214,216,218,220,222,224,226,228,230,232,0,11,
	1,0,60,61,1,0,93,94,5,0,4,4,7,7,29,30,47,47,91,91,2,0,68,68,87,87,1,0,21,
	22,2,0,28,28,69,74,3,0,10,10,33,33,63,64,1,0,36,37,2,0,11,11,37,37,2,0,
	52,52,57,57,2,0,12,12,53,53,981,0,237,1,0,0,0,2,249,1,0,0,0,4,256,1,0,0,
	0,6,268,1,0,0,0,8,270,1,0,0,0,10,283,1,0,0,0,12,286,1,0,0,0,14,290,1,0,
	0,0,16,301,1,0,0,0,18,303,1,0,0,0,20,311,1,0,0,0,22,315,1,0,0,0,24,330,
	1,0,0,0,26,334,1,0,0,0,28,336,1,0,0,0,30,338,1,0,0,0,32,340,1,0,0,0,34,
	342,1,0,0,0,36,344,1,0,0,0,38,346,1,0,0,0,40,354,1,0,0,0,42,361,1,0,0,0,
	44,368,1,0,0,0,46,375,1,0,0,0,48,381,1,0,0,0,50,383,1,0,0,0,52,387,1,0,
	0,0,54,393,1,0,0,0,56,398,1,0,0,0,58,404,1,0,0,0,60,406,1,0,0,0,62,428,
	1,0,0,0,64,430,1,0,0,0,66,435,1,0,0,0,68,446,1,0,0,0,70,454,1,0,0,0,72,
	456,1,0,0,0,74,458,1,0,0,0,76,470,1,0,0,0,78,472,1,0,0,0,80,480,1,0,0,0,
	82,484,1,0,0,0,84,500,1,0,0,0,86,502,1,0,0,0,88,508,1,0,0,0,90,512,1,0,
	0,0,92,518,1,0,0,0,94,520,1,0,0,0,96,523,1,0,0,0,98,527,1,0,0,0,100,531,
	1,0,0,0,102,537,1,0,0,0,104,539,1,0,0,0,106,547,1,0,0,0,108,552,1,0,0,0,
	110,561,1,0,0,0,112,569,1,0,0,0,114,577,1,0,0,0,116,585,1,0,0,0,118,595,
	1,0,0,0,120,605,1,0,0,0,122,617,1,0,0,0,124,619,1,0,0,0,126,622,1,0,0,0,
	128,628,1,0,0,0,130,633,1,0,0,0,132,638,1,0,0,0,134,640,1,0,0,0,136,645,
	1,0,0,0,138,652,1,0,0,0,140,654,1,0,0,0,142,665,1,0,0,0,144,676,1,0,0,0,
	146,687,1,0,0,0,148,699,1,0,0,0,150,701,1,0,0,0,152,713,1,0,0,0,154,715,
	1,0,0,0,156,727,1,0,0,0,158,739,1,0,0,0,160,741,1,0,0,0,162,744,1,0,0,0,
	164,759,1,0,0,0,166,765,1,0,0,0,168,767,1,0,0,0,170,774,1,0,0,0,172,790,
	1,0,0,0,174,801,1,0,0,0,176,803,1,0,0,0,178,808,1,0,0,0,180,815,1,0,0,0,
	182,822,1,0,0,0,184,825,1,0,0,0,186,828,1,0,0,0,188,830,1,0,0,0,190,835,
	1,0,0,0,192,840,1,0,0,0,194,843,1,0,0,0,196,856,1,0,0,0,198,858,1,0,0,0,
	200,870,1,0,0,0,202,881,1,0,0,0,204,884,1,0,0,0,206,898,1,0,0,0,208,905,
	1,0,0,0,210,912,1,0,0,0,212,914,1,0,0,0,214,920,1,0,0,0,216,926,1,0,0,0,
	218,938,1,0,0,0,220,942,1,0,0,0,222,944,1,0,0,0,224,946,1,0,0,0,226,948,
	1,0,0,0,228,953,1,0,0,0,230,961,1,0,0,0,232,972,1,0,0,0,234,236,3,4,2,0,
	235,234,1,0,0,0,236,239,1,0,0,0,237,235,1,0,0,0,237,238,1,0,0,0,238,240,
	1,0,0,0,239,237,1,0,0,0,240,244,3,2,1,0,241,243,3,4,2,0,242,241,1,0,0,0,
	243,246,1,0,0,0,244,242,1,0,0,0,244,245,1,0,0,0,245,247,1,0,0,0,246,244,
	1,0,0,0,247,248,5,0,0,1,248,1,1,0,0,0,249,251,3,6,3,0,250,252,5,89,0,0,
	251,250,1,0,0,0,251,252,1,0,0,0,252,253,1,0,0,0,253,254,3,10,5,0,254,255,
	5,43,0,0,255,3,1,0,0,0,256,257,3,102,51,0,257,5,1,0,0,0,258,259,5,42,0,
	0,259,264,3,8,4,0,260,261,5,75,0,0,261,262,3,110,55,0,262,263,5,76,0,0,
	263,265,1,0,0,0,264,260,1,0,0,0,264,265,1,0,0,0,265,269,1,0,0,0,266,267,
	5,88,0,0,267,269,3,8,4,0,268,258,1,0,0,0,268,266,1,0,0,0,269,7,1,0,0,0,
	270,271,5,100,0,0,271,9,1,0,0,0,272,282,3,14,7,0,273,282,3,18,9,0,274,282,
	3,38,19,0,275,282,3,96,48,0,276,282,3,64,32,0,277,282,3,100,50,0,278,282,
	3,12,6,0,279,282,5,92,0,0,280,282,3,194,97,0,281,272,1,0,0,0,281,273,1,
	0,0,0,281,274,1,0,0,0,281,275,1,0,0,0,281,276,1,0,0,0,281,277,1,0,0,0,281,
	278,1,0,0,0,281,279,1,0,0,0,281,280,1,0,0,0,282,285,1,0,0,0,283,281,1,0,
	0,0,283,284,1,0,0,0,284,11,1,0,0,0,285,283,1,0,0,0,286,287,5,90,0,0,287,
	288,3,110,55,0,288,289,5,67,0,0,289,13,1,0,0,0,290,291,5,31,0,0,291,296,
	3,16,8,0,292,293,5,66,0,0,293,295,3,16,8,0,294,292,1,0,0,0,295,298,1,0,
	0,0,296,294,1,0,0,0,296,297,1,0,0,0,297,299,1,0,0,0,298,296,1,0,0,0,299,
	300,5,67,0,0,300,15,1,0,0,0,301,302,3,28,14,0,302,17,1,0,0,0,303,307,5,
	9,0,0,304,305,3,20,10,0,305,306,5,67,0,0,306,308,1,0,0,0,307,304,1,0,0,
	0,308,309,1,0,0,0,309,307,1,0,0,0,309,310,1,0,0,0,310,19,1,0,0,0,311,312,
	3,8,4,0,312,313,5,69,0,0,313,314,3,24,12,0,314,21,1,0,0,0,315,316,5,8,0,
	0,316,317,5,75,0,0,317,318,3,28,14,0,318,319,5,76,0,0,319,23,1,0,0,0,320,
	331,3,26,13,0,321,322,3,32,16,0,322,323,3,26,13,0,323,331,1,0,0,0,324,331,
	3,8,4,0,325,326,3,32,16,0,326,327,3,8,4,0,327,331,1,0,0,0,328,331,3,36,
	18,0,329,331,3,22,11,0,330,320,1,0,0,0,330,321,1,0,0,0,330,324,1,0,0,0,
	330,325,1,0,0,0,330,328,1,0,0,0,330,329,1,0,0,0,331,25,1,0,0,0,332,335,
	3,28,14,0,333,335,3,30,15,0,334,332,1,0,0,0,334,333,1,0,0,0,335,27,1,0,
	0,0,336,337,5,102,0,0,337,29,1,0,0,0,338,339,5,103,0,0,339,31,1,0,0,0,340,
	341,7,0,0,0,341,33,1,0,0,0,342,343,7,1,0,0,343,35,1,0,0,0,344,345,5,101,
	0,0,345,37,1,0,0,0,346,350,5,54,0,0,347,348,3,40,20,0,348,349,5,67,0,0,
	349,351,1,0,0,0,350,347,1,0,0,0,351,352,1,0,0,0,352,350,1,0,0,0,352,353,
	1,0,0,0,353,39,1,0,0,0,354,355,3,8,4,0,355,359,5,69,0,0,356,360,3,46,23,
	0,357,360,3,42,21,0,358,360,3,44,22,0,359,356,1,0,0,0,359,357,1,0,0,0,359,
	358,1,0,0,0,360,41,1,0,0,0,361,363,5,24,0,0,362,364,3,106,53,0,363,362,
	1,0,0,0,363,364,1,0,0,0,364,365,1,0,0,0,365,366,5,68,0,0,366,367,3,120,
	60,0,367,43,1,0,0,0,368,370,5,41,0,0,369,371,3,106,53,0,370,369,1,0,0,0,
	370,371,1,0,0,0,371,45,1,0,0,0,372,376,3,48,24,0,373,376,3,56,28,0,374,
	376,3,94,47,0,375,372,1,0,0,0,375,373,1,0,0,0,375,374,1,0,0,0,376,47,1,
	0,0,0,377,382,3,50,25,0,378,382,3,52,26,0,379,382,3,54,27,0,380,382,3,60,
	30,0,381,377,1,0,0,0,381,378,1,0,0,0,381,379,1,0,0,0,381,380,1,0,0,0,382,
	49,1,0,0,0,383,384,5,75,0,0,384,385,3,110,55,0,385,386,5,76,0,0,386,51,
	1,0,0,0,387,388,3,24,12,0,388,389,5,84,0,0,389,390,3,24,12,0,390,53,1,0,
	0,0,391,394,3,8,4,0,392,394,7,2,0,0,393,391,1,0,0,0,393,392,1,0,0,0,394,
	55,1,0,0,0,395,396,5,39,0,0,396,399,3,58,29,0,397,399,3,58,29,0,398,395,
	1,0,0,0,398,397,1,0,0,0,399,57,1,0,0,0,400,405,3,62,31,0,401,405,3,74,37,
	0,402,405,3,88,44,0,403,405,3,92,46,0,404,400,1,0,0,0,404,401,1,0,0,0,404,
	402,1,0,0,0,404,403,1,0,0,0,405,59,1,0,0,0,406,407,5,91,0,0,407,410,5,77,
	0,0,408,411,3,8,4,0,409,411,3,26,13,0,410,408,1,0,0,0,410,409,1,0,0,0,411,
	412,1,0,0,0,412,413,5,79,0,0,413,61,1,0,0,0,414,415,5,2,0,0,415,416,5,77,
	0,0,416,417,3,68,34,0,417,418,5,79,0,0,418,419,5,36,0,0,419,420,3,72,36,
	0,420,429,1,0,0,0,421,422,5,2,0,0,422,423,5,78,0,0,423,424,3,68,34,0,424,
	425,5,80,0,0,425,426,5,36,0,0,426,427,3,72,36,0,427,429,1,0,0,0,428,414,
	1,0,0,0,428,421,1,0,0,0,429,63,1,0,0,0,430,431,5,32,0,0,431,432,3,8,4,0,
	432,433,3,66,33,0,433,434,5,67,0,0,434,65,1,0,0,0,435,436,5,77,0,0,436,
	441,3,26,13,0,437,438,5,66,0,0,438,440,3,26,13,0,439,437,1,0,0,0,440,443,
	1,0,0,0,441,439,1,0,0,0,441,442,1,0,0,0,442,444,1,0,0,0,443,441,1,0,0,0,
	444,445,5,79,0,0,445,67,1,0,0,0,446,451,3,70,35,0,447,448,5,66,0,0,448,
	450,3,70,35,0,449,447,1,0,0,0,450,453,1,0,0,0,451,449,1,0,0,0,451,452,1,
	0,0,0,452,69,1,0,0,0,453,451,1,0,0,0,454,455,3,48,24,0,455,71,1,0,0,0,456,
	457,3,46,23,0,457,73,1,0,0,0,458,460,5,48,0,0,459,461,3,76,38,0,460,459,
	1,0,0,0,460,461,1,0,0,0,461,462,1,0,0,0,462,463,5,16,0,0,463,75,1,0,0,0,
	464,467,3,78,39,0,465,466,5,67,0,0,466,468,3,82,41,0,467,465,1,0,0,0,467,
	468,1,0,0,0,468,471,1,0,0,0,469,471,3,82,41,0,470,464,1,0,0,0,470,469,1,
	0,0,0,471,77,1,0,0,0,472,477,3,80,40,0,473,474,5,67,0,0,474,476,3,80,40,
	0,475,473,1,0,0,0,476,479,1,0,0,0,477,475,1,0,0,0,477,478,1,0,0,0,478,79,
	1,0,0,0,479,477,1,0,0,0,480,481,3,110,55,0,481,482,5,68,0,0,482,483,3,46,
	23,0,483,81,1,0,0,0,484,485,5,6,0,0,485,486,3,84,42,0,486,487,5,36,0,0,
	487,492,3,86,43,0,488,489,5,67,0,0,489,491,3,86,43,0,490,488,1,0,0,0,491,
	494,1,0,0,0,492,490,1,0,0,0,492,493,1,0,0,0,493,83,1,0,0,0,494,492,1,0,
	0,0,495,496,3,8,4,0,496,497,5,68,0,0,497,498,3,54,27,0,498,501,1,0,0,0,
	499,501,3,54,27,0,500,495,1,0,0,0,500,499,1,0,0,0,501,85,1,0,0,0,502,503,
	3,114,57,0,503,504,5,68,0,0,504,505,5,75,0,0,505,506,3,76,38,0,506,507,
	5,76,0,0,507,87,1,0,0,0,508,509,5,50,0,0,509,510,5,36,0,0,510,511,3,90,
	45,0,511,89,1,0,0,0,512,513,3,48,24,0,513,91,1,0,0,0,514,515,5,17,0,0,515,
	516,5,36,0,0,516,519,3,46,23,0,517,519,5,17,0,0,518,514,1,0,0,0,518,517,
	1,0,0,0,519,93,1,0,0,0,520,521,5,81,0,0,521,522,3,54,27,0,522,95,1,0,0,
	0,523,524,5,55,0,0,524,525,3,98,49,0,525,526,5,67,0,0,526,97,1,0,0,0,527,
	528,3,110,55,0,528,529,5,87,0,0,529,530,3,46,23,0,530,99,1,0,0,0,531,532,
	3,102,51,0,532,533,5,67,0,0,533,101,1,0,0,0,534,538,3,104,52,0,535,538,
	3,116,58,0,536,538,3,118,59,0,537,534,1,0,0,0,537,535,1,0,0,0,537,536,1,
	0,0,0,538,103,1,0,0,0,539,540,5,41,0,0,540,542,3,8,4,0,541,543,3,106,53,
	0,542,541,1,0,0,0,542,543,1,0,0,0,543,544,1,0,0,0,544,545,3,10,5,0,545,
	546,5,40,0,0,546,105,1,0,0,0,547,548,5,75,0,0,548,549,3,108,54,0,549,550,
	5,76,0,0,550,107,1,0,0,0,551,553,3,112,56,0,552,551,1,0,0,0,552,553,1,0,
	0,0,553,558,1,0,0,0,554,555,5,66,0,0,555,557,3,112,56,0,556,554,1,0,0,0,
	557,560,1,0,0,0,558,556,1,0,0,0,558,559,1,0,0,0,559,109,1,0,0,0,560,558,
	1,0,0,0,561,566,3,8,4,0,562,563,5,66,0,0,563,565,3,8,4,0,564,562,1,0,0,
	0,565,568,1,0,0,0,566,564,1,0,0,0,566,567,1,0,0,0,567,111,1,0,0,0,568,566,
	1,0,0,0,569,572,3,8,4,0,570,571,7,3,0,0,571,573,3,54,27,0,572,570,1,0,0,
	0,572,573,1,0,0,0,573,575,1,0,0,0,574,576,7,4,0,0,575,574,1,0,0,0,575,576,
	1,0,0,0,576,113,1,0,0,0,577,582,3,24,12,0,578,579,5,66,0,0,579,581,3,24,
	12,0,580,578,1,0,0,0,581,584,1,0,0,0,582,580,1,0,0,0,582,583,1,0,0,0,583,
	115,1,0,0,0,584,582,1,0,0,0,585,586,5,24,0,0,586,588,3,8,4,0,587,589,3,
	106,53,0,588,587,1,0,0,0,588,589,1,0,0,0,589,590,1,0,0,0,590,591,5,68,0,
	0,591,592,3,120,60,0,592,593,3,10,5,0,593,594,5,23,0,0,594,117,1,0,0,0,
	595,596,5,24,0,0,596,597,3,8,4,0,597,598,5,65,0,0,598,600,3,8,4,0,599,601,
	3,106,53,0,600,599,1,0,0,0,600,601,1,0,0,0,601,602,1,0,0,0,602,603,3,10,
	5,0,603,604,5,23,0,0,604,119,1,0,0,0,605,606,3,54,27,0,606,121,1,0,0,0,
	607,608,3,16,8,0,608,609,5,68,0,0,609,610,3,130,65,0,610,618,1,0,0,0,611,
	618,3,130,65,0,612,618,3,230,115,0,613,618,3,232,116,0,614,618,3,124,62,
	0,615,618,3,128,64,0,616,618,3,126,63,0,617,607,1,0,0,0,617,611,1,0,0,0,
	617,612,1,0,0,0,617,613,1,0,0,0,617,614,1,0,0,0,617,615,1,0,0,0,617,616,
	1,0,0,0,618,123,1,0,0,0,619,620,5,44,0,0,620,621,5,67,0,0,621,125,1,0,0,
	0,622,624,5,46,0,0,623,625,3,142,71,0,624,623,1,0,0,0,624,625,1,0,0,0,625,
	626,1,0,0,0,626,627,5,67,0,0,627,127,1,0,0,0,628,629,5,45,0,0,629,630,5,
	67,0,0,630,129,1,0,0,0,631,634,3,132,66,0,632,634,3,190,95,0,633,631,1,
	0,0,0,633,632,1,0,0,0,634,131,1,0,0,0,635,639,3,134,67,0,636,639,3,178,
	89,0,637,639,3,184,92,0,638,635,1,0,0,0,638,636,1,0,0,0,638,637,1,0,0,0,
	639,133,1,0,0,0,640,641,3,136,68,0,641,642,5,65,0,0,642,643,3,142,71,0,
	643,644,5,67,0,0,644,135,1,0,0,0,645,649,3,8,4,0,646,648,3,138,69,0,647,
	646,1,0,0,0,648,651,1,0,0,0,649,647,1,0,0,0,649,650,1,0,0,0,650,137,1,0,
	0,0,651,649,1,0,0,0,652,653,3,140,70,0,653,139,1,0,0,0,654,655,5,77,0,0,
	655,660,3,142,71,0,656,657,5,66,0,0,657,659,3,142,71,0,658,656,1,0,0,0,
	659,662,1,0,0,0,660,658,1,0,0,0,660,661,1,0,0,0,661,663,1,0,0,0,662,660,
	1,0,0,0,663,664,5,79,0,0,664,141,1,0,0,0,665,666,6,71,-1,0,666,667,3,144,
	72,0,667,673,1,0,0,0,668,669,10,1,0,0,669,670,5,38,0,0,670,672,3,142,71,
	2,671,668,1,0,0,0,672,675,1,0,0,0,673,671,1,0,0,0,673,674,1,0,0,0,674,143,
	1,0,0,0,675,673,1,0,0,0,676,677,6,72,-1,0,677,678,3,146,73,0,678,684,1,
	0,0,0,679,680,10,1,0,0,680,681,5,1,0,0,681,683,3,144,72,2,682,679,1,0,0,
	0,683,686,1,0,0,0,684,682,1,0,0,0,684,685,1,0,0,0,685,145,1,0,0,0,686,684,
	1,0,0,0,687,688,6,73,-1,0,688,689,3,150,75,0,689,696,1,0,0,0,690,691,10,
	1,0,0,691,692,3,148,74,0,692,693,3,146,73,2,693,695,1,0,0,0,694,690,1,0,
	0,0,695,698,1,0,0,0,696,694,1,0,0,0,696,697,1,0,0,0,697,147,1,0,0,0,698,
	696,1,0,0,0,699,700,7,5,0,0,700,149,1,0,0,0,701,702,6,75,-1,0,702,703,3,
	154,77,0,703,710,1,0,0,0,704,705,10,1,0,0,705,706,3,152,76,0,706,707,3,
	150,75,2,707,709,1,0,0,0,708,704,1,0,0,0,709,712,1,0,0,0,710,708,1,0,0,
	0,710,711,1,0,0,0,711,151,1,0,0,0,712,710,1,0,0,0,713,714,7,0,0,0,714,153,
	1,0,0,0,715,716,6,77,-1,0,716,717,3,156,78,0,717,724,1,0,0,0,718,719,10,
	1,0,0,719,720,3,158,79,0,720,721,3,154,77,2,721,723,1,0,0,0,722,718,1,0,
	0,0,723,726,1,0,0,0,724,722,1,0,0,0,724,725,1,0,0,0,725,155,1,0,0,0,726,
	724,1,0,0,0,727,728,6,78,-1,0,728,729,3,162,81,0,729,736,1,0,0,0,730,731,
	10,1,0,0,731,732,3,160,80,0,732,733,3,156,78,2,733,735,1,0,0,0,734,730,
	1,0,0,0,735,738,1,0,0,0,736,734,1,0,0,0,736,737,1,0,0,0,737,157,1,0,0,0,
	738,736,1,0,0,0,739,740,7,6,0,0,740,159,1,0,0,0,741,742,5,62,0,0,742,161,
	1,0,0,0,743,745,7,0,0,0,744,743,1,0,0,0,744,745,1,0,0,0,745,746,1,0,0,0,
	746,747,3,164,82,0,747,163,1,0,0,0,748,760,3,136,68,0,749,750,5,75,0,0,
	750,751,3,142,71,0,751,752,5,76,0,0,752,760,1,0,0,0,753,760,3,168,84,0,
	754,760,3,166,83,0,755,760,3,172,86,0,756,757,5,35,0,0,757,760,3,164,82,
	0,758,760,3,34,17,0,759,748,1,0,0,0,759,749,1,0,0,0,759,753,1,0,0,0,759,
	754,1,0,0,0,759,755,1,0,0,0,759,756,1,0,0,0,759,758,1,0,0,0,760,165,1,0,
	0,0,761,766,3,26,13,0,762,766,3,22,11,0,763,766,3,36,18,0,764,766,5,34,
	0,0,765,761,1,0,0,0,765,762,1,0,0,0,765,763,1,0,0,0,765,764,1,0,0,0,766,
	167,1,0,0,0,767,768,3,8,4,0,768,770,5,75,0,0,769,771,3,170,85,0,770,769,
	1,0,0,0,770,771,1,0,0,0,771,772,1,0,0,0,772,773,5,76,0,0,773,169,1,0,0,
	0,774,779,3,180,90,0,775,776,5,66,0,0,776,778,3,180,90,0,777,775,1,0,0,
	0,778,781,1,0,0,0,779,777,1,0,0,0,779,780,1,0,0,0,780,171,1,0,0,0,781,779,
	1,0,0,0,782,783,5,77,0,0,783,784,3,174,87,0,784,785,5,79,0,0,785,791,1,
	0,0,0,786,787,5,78,0,0,787,788,3,174,87,0,788,789,5,80,0,0,789,791,1,0,
	0,0,790,782,1,0,0,0,790,786,1,0,0,0,791,173,1,0,0,0,792,797,3,176,88,0,
	793,794,5,66,0,0,794,796,3,176,88,0,795,793,1,0,0,0,796,799,1,0,0,0,797,
	795,1,0,0,0,797,798,1,0,0,0,798,802,1,0,0,0,799,797,1,0,0,0,800,802,1,0,
	0,0,801,792,1,0,0,0,801,800,1,0,0,0,802,175,1,0,0,0,803,806,3,142,71,0,
	804,805,5,84,0,0,805,807,3,142,71,0,806,804,1,0,0,0,806,807,1,0,0,0,807,
	177,1,0,0,0,808,809,3,8,4,0,809,811,5,75,0,0,810,812,3,170,85,0,811,810,
	1,0,0,0,811,812,1,0,0,0,812,813,1,0,0,0,813,814,5,76,0,0,814,179,1,0,0,
	0,815,819,3,142,71,0,816,818,3,182,91,0,817,816,1,0,0,0,818,821,1,0,0,0,
	819,817,1,0,0,0,819,820,1,0,0,0,820,181,1,0,0,0,821,819,1,0,0,0,822,823,
	5,68,0,0,823,824,3,142,71,0,824,183,1,0,0,0,825,826,5,25,0,0,826,827,3,
	16,8,0,827,185,1,0,0,0,828,829,1,0,0,0,829,187,1,0,0,0,830,831,1,0,0,0,
	831,189,1,0,0,0,832,836,3,196,98,0,833,836,3,210,105,0,834,836,3,226,113,
	0,835,832,1,0,0,0,835,833,1,0,0,0,835,834,1,0,0,0,836,191,1,0,0,0,837,839,
	3,194,97,0,838,837,1,0,0,0,839,842,1,0,0,0,840,838,1,0,0,0,840,841,1,0,
	0,0,841,193,1,0,0,0,842,840,1,0,0,0,843,848,3,122,61,0,844,845,5,67,0,0,
	845,847,3,122,61,0,846,844,1,0,0,0,847,850,1,0,0,0,848,846,1,0,0,0,848,
	849,1,0,0,0,849,852,1,0,0,0,850,848,1,0,0,0,851,853,5,67,0,0,852,851,1,
	0,0,0,852,853,1,0,0,0,853,195,1,0,0,0,854,857,3,198,99,0,855,857,3,204,
	102,0,856,854,1,0,0,0,856,855,1,0,0,0,857,197,1,0,0,0,858,859,5,27,0,0,
	859,860,3,142,71,0,860,861,5,51,0,0,861,866,3,192,96,0,862,867,3,200,100,
	0,863,865,3,202,101,0,864,863,1,0,0,0,864,865,1,0,0,0,865,867,1,0,0,0,866,
	862,1,0,0,0,866,864,1,0,0,0,867,868,1,0,0,0,868,869,5,26,0,0,869,199,1,
	0,0,0,870,871,5,13,0,0,871,872,3,142,71,0,872,873,5,51,0,0,873,879,3,192,
	96,0,874,880,3,200,100,0,875,877,3,202,101,0,876,875,1,0,0,0,876,877,1,
	0,0,0,877,880,1,0,0,0,878,880,5,26,0,0,879,874,1,0,0,0,879,876,1,0,0,0,
	879,878,1,0,0,0,880,201,1,0,0,0,881,882,5,14,0,0,882,883,3,192,96,0,883,
	203,1,0,0,0,884,885,5,6,0,0,885,886,3,142,71,0,886,890,7,7,0,0,887,889,
	3,206,103,0,888,887,1,0,0,0,889,892,1,0,0,0,890,888,1,0,0,0,890,891,1,0,
	0,0,891,894,1,0,0,0,892,890,1,0,0,0,893,895,3,208,104,0,894,893,1,0,0,0,
	894,895,1,0,0,0,895,896,1,0,0,0,896,897,5,5,0,0,897,205,1,0,0,0,898,899,
	3,114,57,0,899,900,7,3,0,0,900,901,3,192,96,0,901,207,1,0,0,0,902,906,5,
	14,0,0,903,904,5,15,0,0,904,906,5,68,0,0,905,902,1,0,0,0,905,903,1,0,0,
	0,906,907,1,0,0,0,907,908,3,192,96,0,908,209,1,0,0,0,909,913,3,212,106,
	0,910,913,3,214,107,0,911,913,3,216,108,0,912,909,1,0,0,0,912,910,1,0,0,
	0,912,911,1,0,0,0,913,211,1,0,0,0,914,915,5,58,0,0,915,916,3,142,71,0,916,
	917,7,8,0,0,917,918,3,192,96,0,918,919,5,56,0,0,919,213,1,0,0,0,920,921,
	5,49,0,0,921,922,3,192,96,0,922,923,7,9,0,0,923,924,3,142,71,0,924,925,
	5,67,0,0,925,215,1,0,0,0,926,927,5,20,0,0,927,928,3,8,4,0,928,929,5,65,
	0,0,929,932,3,218,109,0,930,931,5,18,0,0,931,933,3,224,112,0,932,930,1,
	0,0,0,932,933,1,0,0,0,933,934,1,0,0,0,934,935,7,8,0,0,935,936,3,192,96,
	0,936,937,5,19,0,0,937,217,1,0,0,0,938,939,3,220,110,0,939,940,7,10,0,0,
	940,941,3,222,111,0,941,219,1,0,0,0,942,943,3,142,71,0,943,221,1,0,0,0,
	944,945,3,142,71,0,945,223,1,0,0,0,946,947,3,142,71,0,947,225,1,0,0,0,948,
	949,5,59,0,0,949,950,3,228,114,0,950,951,5,11,0,0,951,952,3,122,61,0,952,
	227,1,0,0,0,953,958,3,136,68,0,954,955,5,66,0,0,955,957,3,136,68,0,956,
	954,1,0,0,0,957,960,1,0,0,0,958,956,1,0,0,0,958,959,1,0,0,0,959,229,1,0,
	0,0,960,958,1,0,0,0,961,962,5,95,0,0,962,967,3,142,71,0,963,964,5,66,0,
	0,964,966,3,142,71,0,965,963,1,0,0,0,966,969,1,0,0,0,967,965,1,0,0,0,967,
	968,1,0,0,0,968,970,1,0,0,0,969,967,1,0,0,0,970,971,5,67,0,0,971,231,1,
	0,0,0,972,973,5,96,0,0,973,978,3,136,68,0,974,975,5,66,0,0,975,977,3,136,
	68,0,976,974,1,0,0,0,977,980,1,0,0,0,978,976,1,0,0,0,978,979,1,0,0,0,979,
	981,1,0,0,0,980,978,1,0,0,0,981,982,5,67,0,0,982,233,1,0,0,0,81,237,244,
	251,264,268,281,283,296,309,330,334,352,359,363,370,375,381,393,398,404,
	410,428,441,451,460,467,470,477,492,500,518,537,542,552,558,566,572,575,
	582,588,600,617,624,633,638,649,660,673,684,696,710,724,736,744,759,765,
	770,779,790,797,801,806,811,819,835,840,848,852,856,864,866,876,879,890,
	894,905,912,932,958,967,978];

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
	public VOID(): TerminalNode {
		return this.getToken(StepCodeParser.VOID, 0);
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
	public assignationFunctionDeclaration(): AssignationFunctionDeclarationContext {
		return this.getTypedRuleContext(AssignationFunctionDeclarationContext, 0) as AssignationFunctionDeclarationContext;
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
	public typeIdentifier(): TypeIdentifierContext {
		return this.getTypedRuleContext(TypeIdentifierContext, 0) as TypeIdentifierContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(StepCodeParser.COLON, 0);
	}
	public AS(): TerminalNode {
		return this.getToken(StepCodeParser.AS, 0);
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
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public ENDFUNCTION(): TerminalNode {
		return this.getToken(StepCodeParser.ENDFUNCTION, 0);
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


export class AssignationFunctionDeclarationContext extends ParserRuleContext {
	constructor(parser?: StepCodeParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FUNCTION(): TerminalNode {
		return this.getToken(StepCodeParser.FUNCTION, 0);
	}
	public identifier_list(): IdentifierContext[] {
		return this.getTypedRuleContexts(IdentifierContext) as IdentifierContext[];
	}
	public identifier(i: number): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, i) as IdentifierContext;
	}
	public ASSIGN(): TerminalNode {
		return this.getToken(StepCodeParser.ASSIGN, 0);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public ENDFUNCTION(): TerminalNode {
		return this.getToken(StepCodeParser.ENDFUNCTION, 0);
	}
	public formalParameterList(): FormalParameterListContext {
		return this.getTypedRuleContext(FormalParameterListContext, 0) as FormalParameterListContext;
	}
    public get ruleIndex(): number {
    	return StepCodeParser.RULE_assignationFunctionDeclaration;
	}
	public enterRule(listener: StepCodeListener): void {
	    if(listener.enterAssignationFunctionDeclaration) {
	 		listener.enterAssignationFunctionDeclaration(this);
		}
	}
	public exitRule(listener: StepCodeListener): void {
	    if(listener.exitAssignationFunctionDeclaration) {
	 		listener.exitAssignationFunctionDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: StepCodeVisitor<Result>): Result {
		if (visitor.visitAssignationFunctionDeclaration) {
			return visitor.visitAssignationFunctionDeclaration(this);
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
	public RPAREN(): TerminalNode {
		return this.getToken(StepCodeParser.RPAREN, 0);
	}
	public parameterList(): ParameterListContext {
		return this.getTypedRuleContext(ParameterListContext, 0) as ParameterListContext;
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
