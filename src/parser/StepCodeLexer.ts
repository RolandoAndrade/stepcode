// Generated from src/StepCode.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class StepCodeLexer extends Lexer {
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
	public static readonly OR = 30;
	public static readonly PACKED = 31;
	public static readonly PROCEDURE = 32;
	public static readonly PROGRAM = 33;
	public static readonly ENDPROGRAM = 34;
	public static readonly REAL = 35;
	public static readonly RECORD = 36;
	public static readonly REPEAT = 37;
	public static readonly SET = 38;
	public static readonly THEN = 39;
	public static readonly TO = 40;
	public static readonly TYPE = 41;
	public static readonly UNTIL = 42;
	public static readonly DEFINE = 43;
	public static readonly WHILE = 44;
	public static readonly WITH = 45;
	public static readonly PLUS = 46;
	public static readonly MINUS = 47;
	public static readonly STAR = 48;
	public static readonly SLASH = 49;
	public static readonly ASSIGN = 50;
	public static readonly COMMA = 51;
	public static readonly SEMI = 52;
	public static readonly COLON = 53;
	public static readonly EQUAL = 54;
	public static readonly NOT_EQUAL = 55;
	public static readonly LT = 56;
	public static readonly LE = 57;
	public static readonly GE = 58;
	public static readonly GT = 59;
	public static readonly LPAREN = 60;
	public static readonly RPAREN = 61;
	public static readonly LBRACK = 62;
	public static readonly LBRACK2 = 63;
	public static readonly RBRACK = 64;
	public static readonly RBRACK2 = 65;
	public static readonly POINTER = 66;
	public static readonly AT = 67;
	public static readonly DOT = 68;
	public static readonly DOTDOT = 69;
	public static readonly LCURLY = 70;
	public static readonly RCURLY = 71;
	public static readonly AS = 72;
	public static readonly UNIT = 73;
	public static readonly INTERFACE = 74;
	public static readonly USES = 75;
	public static readonly STRING = 76;
	public static readonly IMPLEMENTATION = 77;
	public static readonly TRUE = 78;
	public static readonly FALSE = 79;
	public static readonly WRITE = 80;
	public static readonly READ = 81;
	public static readonly WS = 82;
	public static readonly COMMENT_1 = 83;
	public static readonly COMMENT_2 = 84;
	public static readonly IDENT = 85;
	public static readonly STRING_LITERAL = 86;
	public static readonly NUM_INT = 87;
	public static readonly NUM_REAL = 88;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
                                                            null, null, 
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"AND", "ARRAY", "BEGIN", "BOOLEAN", "ENDCASE", "CASE", "CHAR", "CHR", 
		"CONST", "DIV", "DO", "DOWNTO", "ELIF", "ELSE", "OTHERWISE", "END", "FILE", 
		"FOR", "FUNCTION", "GOTO", "ENDIF", "IF", "IN", "INTEGER", "LABEL", "MOD", 
		"NIL", "NOT", "OF", "OR", "PACKED", "PROCEDURE", "PROGRAM", "ENDPROGRAM", 
		"REAL", "RECORD", "REPEAT", "SET", "THEN", "TO", "TYPE", "UNTIL", "DEFINE", 
		"WHILE", "WITH", "PLUS", "MINUS", "STAR", "SLASH", "ASSIGN", "COMMA", 
		"SEMI", "COLON", "EQUAL", "NOT_EQUAL", "LT", "LE", "GE", "GT", "LPAREN", 
		"RPAREN", "LBRACK", "LBRACK2", "RBRACK", "RBRACK2", "POINTER", "AT", "DOT", 
		"DOTDOT", "LCURLY", "RCURLY", "AS", "UNIT", "INTERFACE", "USES", "STRING", 
		"IMPLEMENTATION", "TRUE", "FALSE", "WRITE", "READ", "WS", "COMMENT_1", 
		"COMMENT_2", "IDENT", "STRING_LITERAL", "NUM_INT", "NUM_REAL", "EXPONENT",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, StepCodeLexer._ATN, StepCodeLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "StepCode.g4"; }

	public get literalNames(): (string | null)[] { return StepCodeLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return StepCodeLexer.symbolicNames; }
	public get ruleNames(): string[] { return StepCodeLexer.ruleNames; }

	public get serializedATN(): number[] { return StepCodeLexer._serializedATN; }

	public get channelNames(): string[] { return StepCodeLexer.channelNames; }

	public get modeNames(): string[] { return StepCodeLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,88,855,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,
	7,38,2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,
	45,2,46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,
	2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,
	60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,2,66,7,66,2,67,
	7,67,2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,72,7,72,2,73,7,73,2,74,7,
	74,2,75,7,75,2,76,7,76,2,77,7,77,2,78,7,78,2,79,7,79,2,80,7,80,2,81,7,81,
	2,82,7,82,2,83,7,83,2,84,7,84,2,85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,1,
	0,1,0,1,0,1,0,3,0,184,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,
	2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,
	3,1,3,1,3,3,3,218,8,3,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,
	4,1,4,1,4,3,4,235,8,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,246,8,5,1,
	6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,260,8,6,1,7,1,7,1,7,1,
	7,1,8,1,8,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,10,1,10,1,10,1,11,1,11,1,11,
	1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,
	12,3,12,297,8,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,307,8,13,
	1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,
	14,1,14,1,14,1,14,1,14,1,14,1,14,3,14,330,8,14,1,15,1,15,1,15,1,15,1,16,
	1,16,1,16,1,16,1,16,1,17,1,17,1,17,1,17,1,18,1,18,1,18,1,18,1,18,1,18,1,
	18,1,18,1,18,1,19,1,19,1,19,1,19,1,19,1,20,1,20,1,20,1,20,1,20,1,20,1,20,
	1,20,1,20,1,20,3,20,369,8,20,1,21,1,21,1,21,1,21,3,21,375,8,21,1,22,1,22,
	1,22,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,3,
	23,393,8,23,1,24,1,24,1,24,1,24,1,24,1,24,1,25,1,25,1,25,1,25,1,26,1,26,
	1,26,1,26,1,27,1,27,1,27,1,27,1,27,3,27,414,8,27,1,28,1,28,1,28,1,28,1,
	28,1,28,1,28,3,28,423,8,28,1,29,1,29,1,29,3,29,428,8,29,1,30,1,30,1,30,
	1,30,1,30,1,30,1,30,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,31,1,
	32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,
	1,32,1,32,1,32,1,32,1,32,1,32,1,32,1,32,3,32,470,8,32,1,33,1,33,1,33,1,
	33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,
	1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,3,
	33,504,8,33,1,34,1,34,1,34,1,34,1,34,1,35,1,35,1,35,1,35,1,35,1,35,1,35,
	1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,37,1,37,1,37,1,37,1,38,1,38,1,38,1,
	38,1,38,1,38,1,38,1,38,1,38,1,38,1,38,1,38,3,38,541,8,38,1,39,1,39,1,39,
	1,39,1,39,1,39,1,39,3,39,550,8,39,1,40,1,40,1,40,1,40,1,40,1,41,1,41,1,
	41,1,41,1,41,1,41,1,42,1,42,1,42,1,42,1,42,1,42,1,42,1,42,1,42,1,42,3,42,
	573,8,42,1,43,1,43,1,43,1,43,1,43,1,43,1,44,1,44,1,44,1,44,1,44,1,45,1,
	45,1,46,1,46,1,47,1,47,1,48,1,48,1,49,1,49,1,49,1,49,1,49,3,49,599,8,49,
	1,50,1,50,1,51,1,51,1,52,1,52,1,53,1,53,1,54,1,54,1,54,1,54,1,54,3,54,614,
	8,54,1,55,1,55,1,56,1,56,1,56,3,56,621,8,56,1,57,1,57,1,57,3,57,626,8,57,
	1,58,1,58,1,59,1,59,1,60,1,60,1,61,1,61,1,62,1,62,1,62,1,63,1,63,1,64,1,
	64,1,64,1,65,1,65,1,66,1,66,1,67,1,67,1,68,1,68,1,68,1,69,1,69,1,70,1,70,
	1,71,1,71,1,71,1,71,1,71,1,72,1,72,1,72,1,72,1,72,1,73,1,73,1,73,1,73,1,
	73,1,73,1,73,1,73,1,73,1,73,1,74,1,74,1,74,1,74,1,74,1,75,1,75,1,75,1,75,
	1,75,1,75,1,75,1,75,1,75,1,75,1,75,1,75,3,75,694,8,75,1,76,1,76,1,76,1,
	76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,76,1,77,1,77,1,77,
	1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,3,77,724,8,77,1,78,1,
	78,1,78,1,78,1,78,1,78,1,78,1,78,1,78,1,78,3,78,736,8,78,1,79,1,79,1,79,
	1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,79,1,
	79,1,79,1,79,3,79,758,8,79,1,80,1,80,1,80,1,80,1,80,1,80,1,80,1,80,3,80,
	768,8,80,1,81,1,81,1,81,1,81,1,82,1,82,1,82,1,82,5,82,778,8,82,10,82,12,
	82,781,9,82,1,82,1,82,1,83,1,83,5,83,787,8,83,10,83,12,83,790,9,83,1,83,
	1,83,1,84,1,84,5,84,796,8,84,10,84,12,84,799,9,84,1,85,1,85,1,85,1,85,5,
	85,805,8,85,10,85,12,85,808,9,85,1,85,1,85,1,85,1,85,1,85,5,85,815,8,85,
	10,85,12,85,818,9,85,1,85,3,85,821,8,85,1,86,4,86,824,8,86,11,86,12,86,
	825,1,87,4,87,829,8,87,11,87,12,87,830,1,87,1,87,4,87,835,8,87,11,87,12,
	87,836,1,87,3,87,840,8,87,3,87,842,8,87,1,87,3,87,845,8,87,1,88,1,88,3,
	88,849,8,88,1,88,4,88,852,8,88,11,88,12,88,853,0,0,89,1,1,3,2,5,3,7,4,9,
	5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,33,17,35,
	18,37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,26,53,27,55,28,57,29,59,
	30,61,31,63,32,65,33,67,34,69,35,71,36,73,37,75,38,77,39,79,40,81,41,83,
	42,85,43,87,44,89,45,91,46,93,47,95,48,97,49,99,50,101,51,103,52,105,53,
	107,54,109,55,111,56,113,57,115,58,117,59,119,60,121,61,123,62,125,63,127,
	64,129,65,131,66,133,67,135,68,137,69,139,70,141,71,143,72,145,73,147,74,
	149,75,151,76,153,77,155,78,157,79,159,80,161,81,163,82,165,83,167,84,169,
	85,171,86,173,87,175,88,177,0,1,0,30,2,0,65,65,97,97,2,0,78,78,110,110,
	2,0,68,68,100,100,2,0,89,89,121,121,2,0,82,82,114,114,2,0,66,66,98,98,2,
	0,69,69,101,101,2,0,71,71,103,103,2,0,73,73,105,105,2,0,79,79,111,111,2,
	0,76,76,108,108,2,0,67,67,99,99,2,0,195,195,227,227,2,0,83,83,115,115,2,
	0,70,70,102,102,2,0,85,85,117,117,2,0,84,84,116,116,2,0,72,72,104,104,2,
	0,86,86,118,118,2,0,87,87,119,119,2,0,77,77,109,109,2,0,80,80,112,112,2,
	0,75,75,107,107,3,0,9,10,13,13,32,32,2,0,10,10,13,13,2,0,65,90,97,122,4,
	0,48,57,65,90,95,95,97,122,1,0,39,39,1,0,34,34,2,0,43,43,45,45,903,0,1,
	1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,
	13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,
	0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,
	35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,
	0,0,0,47,1,0,0,0,0,49,1,0,0,0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,0,
	57,1,0,0,0,0,59,1,0,0,0,0,61,1,0,0,0,0,63,1,0,0,0,0,65,1,0,0,0,0,67,1,0,
	0,0,0,69,1,0,0,0,0,71,1,0,0,0,0,73,1,0,0,0,0,75,1,0,0,0,0,77,1,0,0,0,0,
	79,1,0,0,0,0,81,1,0,0,0,0,83,1,0,0,0,0,85,1,0,0,0,0,87,1,0,0,0,0,89,1,0,
	0,0,0,91,1,0,0,0,0,93,1,0,0,0,0,95,1,0,0,0,0,97,1,0,0,0,0,99,1,0,0,0,0,
	101,1,0,0,0,0,103,1,0,0,0,0,105,1,0,0,0,0,107,1,0,0,0,0,109,1,0,0,0,0,111,
	1,0,0,0,0,113,1,0,0,0,0,115,1,0,0,0,0,117,1,0,0,0,0,119,1,0,0,0,0,121,1,
	0,0,0,0,123,1,0,0,0,0,125,1,0,0,0,0,127,1,0,0,0,0,129,1,0,0,0,0,131,1,0,
	0,0,0,133,1,0,0,0,0,135,1,0,0,0,0,137,1,0,0,0,0,139,1,0,0,0,0,141,1,0,0,
	0,0,143,1,0,0,0,0,145,1,0,0,0,0,147,1,0,0,0,0,149,1,0,0,0,0,151,1,0,0,0,
	0,153,1,0,0,0,0,155,1,0,0,0,0,157,1,0,0,0,0,159,1,0,0,0,0,161,1,0,0,0,0,
	163,1,0,0,0,0,165,1,0,0,0,0,167,1,0,0,0,0,169,1,0,0,0,0,171,1,0,0,0,0,173,
	1,0,0,0,0,175,1,0,0,0,1,183,1,0,0,0,3,185,1,0,0,0,5,191,1,0,0,0,7,217,1,
	0,0,0,9,234,1,0,0,0,11,245,1,0,0,0,13,259,1,0,0,0,15,261,1,0,0,0,17,265,
	1,0,0,0,19,271,1,0,0,0,21,275,1,0,0,0,23,278,1,0,0,0,25,296,1,0,0,0,27,
	306,1,0,0,0,29,329,1,0,0,0,31,331,1,0,0,0,33,335,1,0,0,0,35,340,1,0,0,0,
	37,344,1,0,0,0,39,353,1,0,0,0,41,368,1,0,0,0,43,374,1,0,0,0,45,376,1,0,
	0,0,47,392,1,0,0,0,49,394,1,0,0,0,51,400,1,0,0,0,53,404,1,0,0,0,55,413,
	1,0,0,0,57,422,1,0,0,0,59,427,1,0,0,0,61,429,1,0,0,0,63,436,1,0,0,0,65,
	469,1,0,0,0,67,503,1,0,0,0,69,505,1,0,0,0,71,510,1,0,0,0,73,517,1,0,0,0,
	75,524,1,0,0,0,77,540,1,0,0,0,79,549,1,0,0,0,81,551,1,0,0,0,83,556,1,0,
	0,0,85,572,1,0,0,0,87,574,1,0,0,0,89,580,1,0,0,0,91,585,1,0,0,0,93,587,
	1,0,0,0,95,589,1,0,0,0,97,591,1,0,0,0,99,598,1,0,0,0,101,600,1,0,0,0,103,
	602,1,0,0,0,105,604,1,0,0,0,107,606,1,0,0,0,109,613,1,0,0,0,111,615,1,0,
	0,0,113,620,1,0,0,0,115,625,1,0,0,0,117,627,1,0,0,0,119,629,1,0,0,0,121,
	631,1,0,0,0,123,633,1,0,0,0,125,635,1,0,0,0,127,638,1,0,0,0,129,640,1,0,
	0,0,131,643,1,0,0,0,133,645,1,0,0,0,135,647,1,0,0,0,137,649,1,0,0,0,139,
	652,1,0,0,0,141,654,1,0,0,0,143,656,1,0,0,0,145,661,1,0,0,0,147,666,1,0,
	0,0,149,676,1,0,0,0,151,693,1,0,0,0,153,695,1,0,0,0,155,723,1,0,0,0,157,
	735,1,0,0,0,159,757,1,0,0,0,161,767,1,0,0,0,163,769,1,0,0,0,165,773,1,0,
	0,0,167,784,1,0,0,0,169,793,1,0,0,0,171,820,1,0,0,0,173,823,1,0,0,0,175,
	828,1,0,0,0,177,846,1,0,0,0,179,180,7,0,0,0,180,181,7,1,0,0,181,184,7,2,
	0,0,182,184,7,3,0,0,183,179,1,0,0,0,183,182,1,0,0,0,184,2,1,0,0,0,185,186,
	7,0,0,0,186,187,7,4,0,0,187,188,7,4,0,0,188,189,7,0,0,0,189,190,7,3,0,0,
	190,4,1,0,0,0,191,192,7,5,0,0,192,193,7,6,0,0,193,194,7,7,0,0,194,195,7,
	8,0,0,195,196,7,1,0,0,196,6,1,0,0,0,197,198,7,5,0,0,198,199,7,9,0,0,199,
	200,7,9,0,0,200,201,7,10,0,0,201,202,7,6,0,0,202,203,7,0,0,0,203,218,7,
	1,0,0,204,205,7,10,0,0,205,206,7,9,0,0,206,207,7,7,0,0,207,208,7,8,0,0,
	208,209,7,11,0,0,209,218,7,9,0,0,210,211,7,10,0,0,211,212,7,12,0,0,212,
	213,5,8220,0,0,213,214,7,7,0,0,214,215,7,8,0,0,215,216,7,11,0,0,216,218,
	7,9,0,0,217,197,1,0,0,0,217,204,1,0,0,0,217,210,1,0,0,0,218,8,1,0,0,0,219,
	220,7,6,0,0,220,221,7,1,0,0,221,222,7,2,0,0,222,223,7,11,0,0,223,224,7,
	0,0,0,224,225,7,13,0,0,225,235,7,6,0,0,226,227,7,14,0,0,227,228,7,8,0,0,
	228,229,7,1,0,0,229,230,7,13,0,0,230,231,7,6,0,0,231,232,7,7,0,0,232,233,
	7,15,0,0,233,235,7,1,0,0,234,219,1,0,0,0,234,226,1,0,0,0,235,10,1,0,0,0,
	236,237,7,13,0,0,237,238,7,6,0,0,238,239,7,7,0,0,239,240,7,15,0,0,240,246,
	7,1,0,0,241,242,7,11,0,0,242,243,7,0,0,0,243,244,7,13,0,0,244,246,7,6,0,
	0,245,236,1,0,0,0,245,241,1,0,0,0,246,12,1,0,0,0,247,248,7,11,0,0,248,249,
	7,0,0,0,249,250,7,4,0,0,250,251,7,0,0,0,251,252,7,11,0,0,252,253,7,16,0,
	0,253,254,7,6,0,0,254,260,7,4,0,0,255,256,7,11,0,0,256,257,7,17,0,0,257,
	258,7,0,0,0,258,260,7,4,0,0,259,247,1,0,0,0,259,255,1,0,0,0,260,14,1,0,
	0,0,261,262,7,11,0,0,262,263,7,17,0,0,263,264,7,4,0,0,264,16,1,0,0,0,265,
	266,7,11,0,0,266,267,7,9,0,0,267,268,7,1,0,0,268,269,7,13,0,0,269,270,7,
	16,0,0,270,18,1,0,0,0,271,272,7,2,0,0,272,273,7,8,0,0,273,274,7,18,0,0,
	274,20,1,0,0,0,275,276,7,2,0,0,276,277,7,9,0,0,277,22,1,0,0,0,278,279,7,
	2,0,0,279,280,7,9,0,0,280,281,7,19,0,0,281,282,7,1,0,0,282,283,7,16,0,0,
	283,284,7,9,0,0,284,24,1,0,0,0,285,286,7,6,0,0,286,287,7,10,0,0,287,288,
	7,8,0,0,288,297,7,14,0,0,289,290,7,13,0,0,290,291,7,8,0,0,291,292,7,1,0,
	0,292,293,7,9,0,0,293,294,5,32,0,0,294,295,7,13,0,0,295,297,7,8,0,0,296,
	285,1,0,0,0,296,289,1,0,0,0,297,26,1,0,0,0,298,299,7,6,0,0,299,300,7,10,
	0,0,300,301,7,13,0,0,301,307,7,6,0,0,302,303,7,13,0,0,303,304,7,8,0,0,304,
	305,7,1,0,0,305,307,7,9,0,0,306,298,1,0,0,0,306,302,1,0,0,0,307,28,1,0,
	0,0,308,309,7,9,0,0,309,310,7,16,0,0,310,311,7,17,0,0,311,312,7,6,0,0,312,
	313,7,4,0,0,313,314,7,19,0,0,314,315,7,8,0,0,315,316,7,13,0,0,316,330,7,
	6,0,0,317,318,7,2,0,0,318,319,7,6,0,0,319,320,5,32,0,0,320,321,7,9,0,0,
	321,322,7,16,0,0,322,323,7,4,0,0,323,324,7,9,0,0,324,325,5,32,0,0,325,326,
	7,20,0,0,326,327,7,9,0,0,327,328,7,2,0,0,328,330,7,9,0,0,329,308,1,0,0,
	0,329,317,1,0,0,0,330,30,1,0,0,0,331,332,7,6,0,0,332,333,7,1,0,0,333,334,
	7,2,0,0,334,32,1,0,0,0,335,336,7,14,0,0,336,337,7,8,0,0,337,338,7,10,0,
	0,338,339,7,6,0,0,339,34,1,0,0,0,340,341,7,14,0,0,341,342,7,9,0,0,342,343,
	7,4,0,0,343,36,1,0,0,0,344,345,7,14,0,0,345,346,7,15,0,0,346,347,7,1,0,
	0,347,348,7,11,0,0,348,349,7,16,0,0,349,350,7,8,0,0,350,351,7,9,0,0,351,
	352,7,1,0,0,352,38,1,0,0,0,353,354,7,7,0,0,354,355,7,9,0,0,355,356,7,16,
	0,0,356,357,7,9,0,0,357,40,1,0,0,0,358,359,7,6,0,0,359,360,7,1,0,0,360,
	361,7,2,0,0,361,362,7,8,0,0,362,369,7,14,0,0,363,364,7,14,0,0,364,365,7,
	8,0,0,365,366,7,1,0,0,366,367,7,13,0,0,367,369,7,8,0,0,368,358,1,0,0,0,
	368,363,1,0,0,0,369,42,1,0,0,0,370,371,7,13,0,0,371,375,7,8,0,0,372,373,
	7,8,0,0,373,375,7,14,0,0,374,370,1,0,0,0,374,372,1,0,0,0,375,44,1,0,0,0,
	376,377,7,8,0,0,377,378,7,1,0,0,378,46,1,0,0,0,379,380,7,6,0,0,380,381,
	7,1,0,0,381,382,7,16,0,0,382,383,7,6,0,0,383,384,7,4,0,0,384,393,7,9,0,
	0,385,386,7,8,0,0,386,387,7,1,0,0,387,388,7,16,0,0,388,389,7,6,0,0,389,
	390,7,7,0,0,390,391,7,6,0,0,391,393,7,4,0,0,392,379,1,0,0,0,392,385,1,0,
	0,0,393,48,1,0,0,0,394,395,7,10,0,0,395,396,7,0,0,0,396,397,7,5,0,0,397,
	398,7,6,0,0,398,399,7,10,0,0,399,50,1,0,0,0,400,401,7,20,0,0,401,402,7,
	9,0,0,402,403,7,2,0,0,403,52,1,0,0,0,404,405,7,1,0,0,405,406,7,8,0,0,406,
	407,7,10,0,0,407,54,1,0,0,0,408,409,7,1,0,0,409,410,7,9,0,0,410,414,7,16,
	0,0,411,412,7,1,0,0,412,414,7,9,0,0,413,408,1,0,0,0,413,411,1,0,0,0,414,
	56,1,0,0,0,415,416,7,9,0,0,416,423,7,14,0,0,417,418,7,17,0,0,418,419,7,
	0,0,0,419,420,7,11,0,0,420,421,7,6,0,0,421,423,7,4,0,0,422,415,1,0,0,0,
	422,417,1,0,0,0,423,58,1,0,0,0,424,425,7,9,0,0,425,428,7,4,0,0,426,428,
	7,9,0,0,427,424,1,0,0,0,427,426,1,0,0,0,428,60,1,0,0,0,429,430,7,21,0,0,
	430,431,7,0,0,0,431,432,7,11,0,0,432,433,7,22,0,0,433,434,7,6,0,0,434,435,
	7,2,0,0,435,62,1,0,0,0,436,437,7,21,0,0,437,438,7,4,0,0,438,439,7,9,0,0,
	439,440,7,11,0,0,440,441,7,6,0,0,441,442,7,2,0,0,442,443,7,15,0,0,443,444,
	7,4,0,0,444,445,7,6,0,0,445,64,1,0,0,0,446,447,7,21,0,0,447,448,7,4,0,0,
	448,449,7,9,0,0,449,450,7,11,0,0,450,451,7,6,0,0,451,452,7,13,0,0,452,470,
	7,9,0,0,453,454,7,0,0,0,454,455,7,10,0,0,455,456,7,7,0,0,456,457,7,9,0,
	0,457,458,7,4,0,0,458,459,7,8,0,0,459,460,7,16,0,0,460,461,7,20,0,0,461,
	470,7,9,0,0,462,463,7,21,0,0,463,464,7,4,0,0,464,465,7,9,0,0,465,466,7,
	7,0,0,466,467,7,4,0,0,467,468,7,0,0,0,468,470,7,20,0,0,469,446,1,0,0,0,
	469,453,1,0,0,0,469,462,1,0,0,0,470,66,1,0,0,0,471,472,7,14,0,0,472,473,
	7,8,0,0,473,474,7,1,0,0,474,475,7,21,0,0,475,476,7,4,0,0,476,477,7,9,0,
	0,477,478,7,11,0,0,478,479,7,6,0,0,479,480,7,13,0,0,480,504,7,9,0,0,481,
	482,7,14,0,0,482,483,7,8,0,0,483,484,7,1,0,0,484,485,7,0,0,0,485,486,7,
	10,0,0,486,487,7,7,0,0,487,488,7,9,0,0,488,489,7,4,0,0,489,490,7,8,0,0,
	490,491,7,16,0,0,491,492,7,20,0,0,492,504,7,9,0,0,493,494,7,6,0,0,494,495,
	7,1,0,0,495,496,7,2,0,0,496,497,7,21,0,0,497,498,7,4,0,0,498,499,7,9,0,
	0,499,500,7,7,0,0,500,501,7,4,0,0,501,502,7,0,0,0,502,504,7,20,0,0,503,
	471,1,0,0,0,503,481,1,0,0,0,503,493,1,0,0,0,504,68,1,0,0,0,505,506,7,4,
	0,0,506,507,7,6,0,0,507,508,7,0,0,0,508,509,7,10,0,0,509,70,1,0,0,0,510,
	511,7,4,0,0,511,512,7,6,0,0,512,513,7,11,0,0,513,514,7,9,0,0,514,515,7,
	4,0,0,515,516,7,2,0,0,516,72,1,0,0,0,517,518,7,4,0,0,518,519,7,6,0,0,519,
	520,7,21,0,0,520,521,7,6,0,0,521,522,7,0,0,0,522,523,7,16,0,0,523,74,1,
	0,0,0,524,525,7,13,0,0,525,526,7,6,0,0,526,527,7,16,0,0,527,76,1,0,0,0,
	528,529,7,16,0,0,529,530,7,17,0,0,530,531,7,6,0,0,531,541,7,1,0,0,532,533,
	7,6,0,0,533,534,7,1,0,0,534,535,7,16,0,0,535,536,7,9,0,0,536,537,7,1,0,
	0,537,538,7,11,0,0,538,539,7,6,0,0,539,541,7,13,0,0,540,528,1,0,0,0,540,
	532,1,0,0,0,541,78,1,0,0,0,542,543,7,16,0,0,543,550,7,9,0,0,544,545,7,17,
	0,0,545,546,7,0,0,0,546,547,7,13,0,0,547,548,7,16,0,0,548,550,7,0,0,0,549,
	542,1,0,0,0,549,544,1,0,0,0,550,80,1,0,0,0,551,552,7,16,0,0,552,553,7,3,
	0,0,553,554,7,21,0,0,554,555,7,6,0,0,555,82,1,0,0,0,556,557,7,15,0,0,557,
	558,7,1,0,0,558,559,7,16,0,0,559,560,7,8,0,0,560,561,7,10,0,0,561,84,1,
	0,0,0,562,563,7,2,0,0,563,564,7,6,0,0,564,565,7,14,0,0,565,566,7,8,0,0,
	566,567,7,1,0,0,567,568,7,8,0,0,568,573,7,4,0,0,569,570,7,18,0,0,570,571,
	7,0,0,0,571,573,7,4,0,0,572,562,1,0,0,0,572,569,1,0,0,0,573,86,1,0,0,0,
	574,575,7,19,0,0,575,576,7,17,0,0,576,577,7,8,0,0,577,578,7,10,0,0,578,
	579,7,6,0,0,579,88,1,0,0,0,580,581,7,19,0,0,581,582,7,8,0,0,582,583,7,16,
	0,0,583,584,7,17,0,0,584,90,1,0,0,0,585,586,5,43,0,0,586,92,1,0,0,0,587,
	588,5,45,0,0,588,94,1,0,0,0,589,590,5,42,0,0,590,96,1,0,0,0,591,592,5,47,
	0,0,592,98,1,0,0,0,593,594,5,58,0,0,594,599,5,61,0,0,595,596,5,60,0,0,596,
	599,5,45,0,0,597,599,5,8592,0,0,598,593,1,0,0,0,598,595,1,0,0,0,598,597,
	1,0,0,0,599,100,1,0,0,0,600,601,5,44,0,0,601,102,1,0,0,0,602,603,5,59,0,
	0,603,104,1,0,0,0,604,605,5,58,0,0,605,106,1,0,0,0,606,607,5,61,0,0,607,
	108,1,0,0,0,608,609,5,60,0,0,609,614,5,62,0,0,610,611,5,33,0,0,611,614,
	5,61,0,0,612,614,5,8800,0,0,613,608,1,0,0,0,613,610,1,0,0,0,613,612,1,0,
	0,0,614,110,1,0,0,0,615,616,5,60,0,0,616,112,1,0,0,0,617,618,5,60,0,0,618,
	621,5,61,0,0,619,621,5,8804,0,0,620,617,1,0,0,0,620,619,1,0,0,0,621,114,
	1,0,0,0,622,623,5,62,0,0,623,626,5,61,0,0,624,626,5,8805,0,0,625,622,1,
	0,0,0,625,624,1,0,0,0,626,116,1,0,0,0,627,628,5,62,0,0,628,118,1,0,0,0,
	629,630,5,40,0,0,630,120,1,0,0,0,631,632,5,41,0,0,632,122,1,0,0,0,633,634,
	5,91,0,0,634,124,1,0,0,0,635,636,5,40,0,0,636,637,5,46,0,0,637,126,1,0,
	0,0,638,639,5,93,0,0,639,128,1,0,0,0,640,641,5,46,0,0,641,642,5,41,0,0,
	642,130,1,0,0,0,643,644,5,94,0,0,644,132,1,0,0,0,645,646,5,64,0,0,646,134,
	1,0,0,0,647,648,5,46,0,0,648,136,1,0,0,0,649,650,5,46,0,0,650,651,5,46,
	0,0,651,138,1,0,0,0,652,653,5,123,0,0,653,140,1,0,0,0,654,655,5,125,0,0,
	655,142,1,0,0,0,656,657,7,11,0,0,657,658,7,9,0,0,658,659,7,20,0,0,659,660,
	7,9,0,0,660,144,1,0,0,0,661,662,7,15,0,0,662,663,7,1,0,0,663,664,7,8,0,
	0,664,665,7,16,0,0,665,146,1,0,0,0,666,667,7,8,0,0,667,668,7,1,0,0,668,
	669,7,16,0,0,669,670,7,6,0,0,670,671,7,4,0,0,671,672,7,14,0,0,672,673,7,
	0,0,0,673,674,7,11,0,0,674,675,7,6,0,0,675,148,1,0,0,0,676,677,7,15,0,0,
	677,678,7,13,0,0,678,679,7,6,0,0,679,680,7,13,0,0,680,150,1,0,0,0,681,682,
	7,13,0,0,682,683,7,16,0,0,683,684,7,4,0,0,684,685,7,8,0,0,685,686,7,1,0,
	0,686,694,7,7,0,0,687,688,7,11,0,0,688,689,7,0,0,0,689,690,7,2,0,0,690,
	691,7,6,0,0,691,692,7,1,0,0,692,694,7,0,0,0,693,681,1,0,0,0,693,687,1,0,
	0,0,694,152,1,0,0,0,695,696,7,8,0,0,696,697,7,20,0,0,697,698,7,21,0,0,698,
	699,7,10,0,0,699,700,7,6,0,0,700,701,7,20,0,0,701,702,7,6,0,0,702,703,7,
	1,0,0,703,704,7,16,0,0,704,705,7,0,0,0,705,706,7,16,0,0,706,707,7,8,0,0,
	707,708,7,9,0,0,708,709,7,1,0,0,709,154,1,0,0,0,710,711,7,16,0,0,711,712,
	7,4,0,0,712,713,7,15,0,0,713,724,7,6,0,0,714,715,7,18,0,0,715,716,7,6,0,
	0,716,717,7,4,0,0,717,718,7,2,0,0,718,719,7,0,0,0,719,720,7,2,0,0,720,721,
	7,6,0,0,721,722,7,4,0,0,722,724,7,9,0,0,723,710,1,0,0,0,723,714,1,0,0,0,
	724,156,1,0,0,0,725,726,7,14,0,0,726,727,7,0,0,0,727,728,7,10,0,0,728,729,
	7,13,0,0,729,736,7,6,0,0,730,731,7,14,0,0,731,732,7,0,0,0,732,733,7,10,
	0,0,733,734,7,13,0,0,734,736,7,9,0,0,735,725,1,0,0,0,735,730,1,0,0,0,736,
	158,1,0,0,0,737,738,7,19,0,0,738,739,7,4,0,0,739,740,7,8,0,0,740,741,7,
	16,0,0,741,758,7,6,0,0,742,743,7,6,0,0,743,744,7,13,0,0,744,745,7,11,0,
	0,745,746,7,4,0,0,746,747,7,8,0,0,747,748,7,5,0,0,748,749,7,8,0,0,749,758,
	7,4,0,0,750,751,7,20,0,0,751,752,7,9,0,0,752,753,7,13,0,0,753,754,7,16,
	0,0,754,755,7,4,0,0,755,756,7,0,0,0,756,758,7,4,0,0,757,737,1,0,0,0,757,
	742,1,0,0,0,757,750,1,0,0,0,758,160,1,0,0,0,759,760,7,4,0,0,760,761,7,6,
	0,0,761,762,7,0,0,0,762,768,7,2,0,0,763,764,7,10,0,0,764,765,7,6,0,0,765,
	766,7,6,0,0,766,768,7,4,0,0,767,759,1,0,0,0,767,763,1,0,0,0,768,162,1,0,
	0,0,769,770,7,23,0,0,770,771,1,0,0,0,771,772,6,81,0,0,772,164,1,0,0,0,773,
	774,5,47,0,0,774,775,5,47,0,0,775,779,1,0,0,0,776,778,8,24,0,0,777,776,
	1,0,0,0,778,781,1,0,0,0,779,777,1,0,0,0,779,780,1,0,0,0,780,782,1,0,0,0,
	781,779,1,0,0,0,782,783,6,82,0,0,783,166,1,0,0,0,784,788,5,35,0,0,785,787,
	8,24,0,0,786,785,1,0,0,0,787,790,1,0,0,0,788,786,1,0,0,0,788,789,1,0,0,
	0,789,791,1,0,0,0,790,788,1,0,0,0,791,792,6,83,0,0,792,168,1,0,0,0,793,
	797,7,25,0,0,794,796,7,26,0,0,795,794,1,0,0,0,796,799,1,0,0,0,797,795,1,
	0,0,0,797,798,1,0,0,0,798,170,1,0,0,0,799,797,1,0,0,0,800,806,5,39,0,0,
	801,802,5,39,0,0,802,805,5,39,0,0,803,805,8,27,0,0,804,801,1,0,0,0,804,
	803,1,0,0,0,805,808,1,0,0,0,806,804,1,0,0,0,806,807,1,0,0,0,807,809,1,0,
	0,0,808,806,1,0,0,0,809,821,5,39,0,0,810,816,5,34,0,0,811,812,5,34,0,0,
	812,815,5,34,0,0,813,815,8,28,0,0,814,811,1,0,0,0,814,813,1,0,0,0,815,818,
	1,0,0,0,816,814,1,0,0,0,816,817,1,0,0,0,817,819,1,0,0,0,818,816,1,0,0,0,
	819,821,5,34,0,0,820,800,1,0,0,0,820,810,1,0,0,0,821,172,1,0,0,0,822,824,
	2,48,57,0,823,822,1,0,0,0,824,825,1,0,0,0,825,823,1,0,0,0,825,826,1,0,0,
	0,826,174,1,0,0,0,827,829,2,48,57,0,828,827,1,0,0,0,829,830,1,0,0,0,830,
	828,1,0,0,0,830,831,1,0,0,0,831,844,1,0,0,0,832,834,5,46,0,0,833,835,2,
	48,57,0,834,833,1,0,0,0,835,836,1,0,0,0,836,834,1,0,0,0,836,837,1,0,0,0,
	837,839,1,0,0,0,838,840,3,177,88,0,839,838,1,0,0,0,839,840,1,0,0,0,840,
	842,1,0,0,0,841,832,1,0,0,0,841,842,1,0,0,0,842,845,1,0,0,0,843,845,3,177,
	88,0,844,841,1,0,0,0,844,843,1,0,0,0,845,176,1,0,0,0,846,848,7,6,0,0,847,
	849,7,29,0,0,848,847,1,0,0,0,848,849,1,0,0,0,849,851,1,0,0,0,850,852,2,
	48,57,0,851,850,1,0,0,0,852,853,1,0,0,0,853,851,1,0,0,0,853,854,1,0,0,0,
	854,178,1,0,0,0,45,0,183,217,234,245,259,296,306,329,368,374,392,413,422,
	427,469,503,540,549,572,598,613,620,625,693,723,735,757,767,779,788,797,
	804,806,814,816,820,825,830,836,839,841,844,848,853,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!StepCodeLexer.__ATN) {
			StepCodeLexer.__ATN = new ATNDeserializer().deserialize(StepCodeLexer._serializedATN);
		}

		return StepCodeLexer.__ATN;
	}


	static DecisionsToDFA = StepCodeLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}