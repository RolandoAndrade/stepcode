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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"AND", "ARRAY", "BEGIN", "BOOLEAN", "ENDCASE", "CASE", "CHAR", "CHR", 
		"CONST", "DIV", "DO", "DOWNTO", "ELIF", "ELSE", "OTHERWISE", "END", "FILE", 
		"WITHSTEP", "ENDFOR", "FOR", "FUNCTION", "GOTO", "ENDIF", "IF", "IN", 
		"INTEGER", "LABEL", "MOD", "NIL", "NOT", "OF", "HACER", "OR", "PACKED", 
		"PROCEDURE", "PROGRAM", "ENDPROGRAM", "BREAK", "CONTINUE", "RETURN", "REAL", 
		"RECORD", "REPEAT", "SET", "THEN", "UNTIL", "TO", "TYPE", "DEFINE", "ENDWHILE", 
		"MIENTRASQUE", "WHILE", "WITH", "PLUS", "MINUS", "POWER", "STAR", "SLASH", 
		"ASSIGN", "COMMA", "SEMI", "COLON", "EQUAL", "NOT_EQUAL", "LT", "LE", 
		"GE", "GT", "LPAREN", "RPAREN", "LBRACK", "LBRACK2", "RBRACK", "RBRACK2", 
		"POINTER", "AT", "DOT", "DOTDOT", "LCURLY", "RCURLY", "AS", "UNIT", "INTERFACE", 
		"USES", "STRING", "IMPLEMENTATION", "TRUE", "FALSE", "WRITE", "READ", 
		"WS", "COMMENT_1", "COMMENT_2", "IDENT", "STRING_LITERAL", "NUM_INT", 
		"NUM_REAL", "EXPONENT",
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

	public static readonly _serializedATN: number[] = [4,0,97,1026,6,-1,2,0,
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
	2,82,7,82,2,83,7,83,2,84,7,84,2,85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,
	89,7,89,2,90,7,90,2,91,7,91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,
	7,96,2,97,7,97,1,0,1,0,1,0,1,0,3,0,202,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,2,
	1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,
	1,3,1,3,1,3,1,3,1,3,1,3,1,3,3,3,236,8,3,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,
	1,4,1,4,1,4,1,4,1,4,1,4,1,4,3,4,253,8,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,
	1,5,3,5,264,8,5,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,278,
	8,6,1,7,1,7,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,10,1,10,1,
	10,1,11,1,11,1,11,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,12,1,12,
	1,12,1,12,1,12,1,12,3,12,315,8,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,
	13,3,13,325,8,13,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,
	1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,3,14,348,8,14,1,15,1,
	15,1,15,1,15,1,16,1,16,1,16,1,16,1,16,1,17,1,17,1,17,1,17,1,17,1,17,1,17,
	1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,3,17,376,8,17,1,18,1,
	18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,3,18,391,8,18,
	1,19,1,19,1,19,1,19,1,19,1,19,1,19,3,19,400,8,19,1,20,1,20,1,20,1,20,1,
	20,1,20,1,20,1,20,1,20,1,21,1,21,1,21,1,21,1,21,1,22,1,22,1,22,1,22,1,22,
	1,22,1,22,1,22,1,22,1,22,3,22,426,8,22,1,23,1,23,1,23,1,23,3,23,432,8,23,
	1,24,1,24,1,24,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,
	25,1,25,3,25,450,8,25,1,26,1,26,1,26,1,26,1,26,1,26,1,27,1,27,1,27,1,27,
	1,28,1,28,1,28,1,28,1,29,1,29,1,29,1,29,1,29,3,29,471,8,29,1,30,1,30,1,
	30,1,31,1,31,1,31,1,31,1,31,1,31,1,32,1,32,1,32,3,32,485,8,32,1,33,1,33,
	1,33,1,33,1,33,1,33,1,33,1,34,1,34,1,34,1,34,1,34,1,34,1,34,1,34,1,34,1,
	34,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,
	1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,1,35,3,35,527,8,35,1,36,1,36,1,
	36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,
	1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,36,1,
	36,3,36,561,8,36,1,37,1,37,1,37,1,37,1,37,1,37,1,37,1,37,1,37,1,37,1,37,
	3,37,574,8,37,1,38,1,38,1,38,1,38,1,38,1,38,1,38,1,38,1,38,1,38,1,38,1,
	38,1,38,1,38,1,38,1,38,1,38,3,38,593,8,38,1,39,1,39,1,39,1,39,1,39,1,39,
	1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,3,39,609,8,39,1,40,1,40,1,40,1,
	40,1,40,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,42,1,42,1,42,1,42,1,42,1,42,
	1,42,1,42,1,42,1,42,1,42,1,42,1,42,3,42,636,8,42,1,43,1,43,1,43,1,43,1,
	44,1,44,1,44,1,44,1,44,1,44,1,44,1,44,1,44,1,44,1,44,1,44,3,44,654,8,44,
	1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,1,45,3,
	45,670,8,45,1,46,1,46,1,46,1,46,1,46,1,46,1,46,3,46,679,8,46,1,47,1,47,
	1,47,1,47,1,47,1,48,1,48,1,48,1,48,1,48,1,48,1,48,1,48,1,48,1,48,3,48,696,
	8,48,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,49,1,
	49,1,49,1,49,1,49,1,49,1,49,3,49,717,8,49,1,50,1,50,1,50,1,50,1,50,1,50,
	1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,
	51,1,51,1,51,1,51,1,51,1,51,3,51,745,8,51,1,52,1,52,1,52,1,52,1,52,1,53,
	1,53,1,54,1,54,1,55,1,55,1,55,3,55,759,8,55,1,56,1,56,1,57,1,57,1,58,1,
	58,1,58,1,58,1,58,3,58,770,8,58,1,59,1,59,1,60,1,60,1,61,1,61,1,62,1,62,
	1,63,1,63,1,63,1,63,1,63,3,63,785,8,63,1,64,1,64,1,65,1,65,1,65,3,65,792,
	8,65,1,66,1,66,1,66,3,66,797,8,66,1,67,1,67,1,68,1,68,1,69,1,69,1,70,1,
	70,1,71,1,71,1,71,1,72,1,72,1,73,1,73,1,73,1,74,1,74,1,75,1,75,1,76,1,76,
	1,77,1,77,1,77,1,78,1,78,1,79,1,79,1,80,1,80,1,80,1,80,1,80,1,81,1,81,1,
	81,1,81,1,81,1,82,1,82,1,82,1,82,1,82,1,82,1,82,1,82,1,82,1,82,1,83,1,83,
	1,83,1,83,1,83,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,84,1,
	84,3,84,865,8,84,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,1,85,
	1,85,1,85,1,85,1,85,1,86,1,86,1,86,1,86,1,86,1,86,1,86,1,86,1,86,1,86,1,
	86,1,86,1,86,3,86,895,8,86,1,87,1,87,1,87,1,87,1,87,1,87,1,87,1,87,1,87,
	1,87,3,87,907,8,87,1,88,1,88,1,88,1,88,1,88,1,88,1,88,1,88,1,88,1,88,1,
	88,1,88,1,88,1,88,1,88,1,88,1,88,1,88,1,88,1,88,3,88,929,8,88,1,89,1,89,
	1,89,1,89,1,89,1,89,1,89,1,89,3,89,939,8,89,1,90,1,90,1,90,1,90,1,91,1,
	91,1,91,1,91,5,91,949,8,91,10,91,12,91,952,9,91,1,91,1,91,1,92,1,92,5,92,
	958,8,92,10,92,12,92,961,9,92,1,92,1,92,1,93,1,93,5,93,967,8,93,10,93,12,
	93,970,9,93,1,94,1,94,1,94,1,94,5,94,976,8,94,10,94,12,94,979,9,94,1,94,
	1,94,1,94,1,94,1,94,5,94,986,8,94,10,94,12,94,989,9,94,1,94,3,94,992,8,
	94,1,95,4,95,995,8,95,11,95,12,95,996,1,96,4,96,1000,8,96,11,96,12,96,1001,
	1,96,1,96,4,96,1006,8,96,11,96,12,96,1007,1,96,3,96,1011,8,96,3,96,1013,
	8,96,1,96,3,96,1016,8,96,1,97,1,97,3,97,1020,8,97,1,97,4,97,1023,8,97,11,
	97,12,97,1024,0,0,98,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,
	23,12,25,13,27,14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,
	47,24,49,25,51,26,53,27,55,28,57,29,59,30,61,31,63,32,65,33,67,34,69,35,
	71,36,73,37,75,38,77,39,79,40,81,41,83,42,85,43,87,44,89,45,91,46,93,47,
	95,48,97,49,99,50,101,51,103,52,105,53,107,54,109,55,111,56,113,57,115,
	58,117,59,119,60,121,61,123,62,125,63,127,64,129,65,131,66,133,67,135,68,
	137,69,139,70,141,71,143,72,145,73,147,74,149,75,151,76,153,77,155,78,157,
	79,159,80,161,81,163,82,165,83,167,84,169,85,171,86,173,87,175,88,177,89,
	179,90,181,91,183,92,185,93,187,94,189,95,191,96,193,97,195,0,1,0,31,2,
	0,65,65,97,97,2,0,78,78,110,110,2,0,68,68,100,100,2,0,89,89,121,121,2,0,
	82,82,114,114,2,0,66,66,98,98,2,0,69,69,101,101,2,0,71,71,103,103,2,0,73,
	73,105,105,2,0,79,79,111,111,2,0,76,76,108,108,2,0,67,67,99,99,2,0,195,
	195,227,227,2,0,83,83,115,115,2,0,70,70,102,102,2,0,85,85,117,117,2,0,84,
	84,116,116,2,0,72,72,104,104,2,0,86,86,118,118,2,0,87,87,119,119,2,0,77,
	77,109,109,2,0,80,80,112,112,2,0,75,75,107,107,2,0,81,81,113,113,3,0,9,
	10,13,13,32,32,2,0,10,10,13,13,2,0,65,90,97,122,4,0,48,57,65,90,95,95,97,
	122,1,0,39,39,1,0,34,34,2,0,43,43,45,45,1084,0,1,1,0,0,0,0,3,1,0,0,0,0,
	5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,
	0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,
	1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,
	0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,
	1,0,0,0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,1,0,0,
	0,0,61,1,0,0,0,0,63,1,0,0,0,0,65,1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,0,0,71,
	1,0,0,0,0,73,1,0,0,0,0,75,1,0,0,0,0,77,1,0,0,0,0,79,1,0,0,0,0,81,1,0,0,
	0,0,83,1,0,0,0,0,85,1,0,0,0,0,87,1,0,0,0,0,89,1,0,0,0,0,91,1,0,0,0,0,93,
	1,0,0,0,0,95,1,0,0,0,0,97,1,0,0,0,0,99,1,0,0,0,0,101,1,0,0,0,0,103,1,0,
	0,0,0,105,1,0,0,0,0,107,1,0,0,0,0,109,1,0,0,0,0,111,1,0,0,0,0,113,1,0,0,
	0,0,115,1,0,0,0,0,117,1,0,0,0,0,119,1,0,0,0,0,121,1,0,0,0,0,123,1,0,0,0,
	0,125,1,0,0,0,0,127,1,0,0,0,0,129,1,0,0,0,0,131,1,0,0,0,0,133,1,0,0,0,0,
	135,1,0,0,0,0,137,1,0,0,0,0,139,1,0,0,0,0,141,1,0,0,0,0,143,1,0,0,0,0,145,
	1,0,0,0,0,147,1,0,0,0,0,149,1,0,0,0,0,151,1,0,0,0,0,153,1,0,0,0,0,155,1,
	0,0,0,0,157,1,0,0,0,0,159,1,0,0,0,0,161,1,0,0,0,0,163,1,0,0,0,0,165,1,0,
	0,0,0,167,1,0,0,0,0,169,1,0,0,0,0,171,1,0,0,0,0,173,1,0,0,0,0,175,1,0,0,
	0,0,177,1,0,0,0,0,179,1,0,0,0,0,181,1,0,0,0,0,183,1,0,0,0,0,185,1,0,0,0,
	0,187,1,0,0,0,0,189,1,0,0,0,0,191,1,0,0,0,0,193,1,0,0,0,1,201,1,0,0,0,3,
	203,1,0,0,0,5,209,1,0,0,0,7,235,1,0,0,0,9,252,1,0,0,0,11,263,1,0,0,0,13,
	277,1,0,0,0,15,279,1,0,0,0,17,283,1,0,0,0,19,289,1,0,0,0,21,293,1,0,0,0,
	23,296,1,0,0,0,25,314,1,0,0,0,27,324,1,0,0,0,29,347,1,0,0,0,31,349,1,0,
	0,0,33,353,1,0,0,0,35,375,1,0,0,0,37,390,1,0,0,0,39,399,1,0,0,0,41,401,
	1,0,0,0,43,410,1,0,0,0,45,425,1,0,0,0,47,431,1,0,0,0,49,433,1,0,0,0,51,
	449,1,0,0,0,53,451,1,0,0,0,55,457,1,0,0,0,57,461,1,0,0,0,59,470,1,0,0,0,
	61,472,1,0,0,0,63,475,1,0,0,0,65,484,1,0,0,0,67,486,1,0,0,0,69,493,1,0,
	0,0,71,526,1,0,0,0,73,560,1,0,0,0,75,573,1,0,0,0,77,592,1,0,0,0,79,608,
	1,0,0,0,81,610,1,0,0,0,83,615,1,0,0,0,85,635,1,0,0,0,87,637,1,0,0,0,89,
	653,1,0,0,0,91,669,1,0,0,0,93,678,1,0,0,0,95,680,1,0,0,0,97,695,1,0,0,0,
	99,716,1,0,0,0,101,718,1,0,0,0,103,744,1,0,0,0,105,746,1,0,0,0,107,751,
	1,0,0,0,109,753,1,0,0,0,111,758,1,0,0,0,113,760,1,0,0,0,115,762,1,0,0,0,
	117,769,1,0,0,0,119,771,1,0,0,0,121,773,1,0,0,0,123,775,1,0,0,0,125,777,
	1,0,0,0,127,784,1,0,0,0,129,786,1,0,0,0,131,791,1,0,0,0,133,796,1,0,0,0,
	135,798,1,0,0,0,137,800,1,0,0,0,139,802,1,0,0,0,141,804,1,0,0,0,143,806,
	1,0,0,0,145,809,1,0,0,0,147,811,1,0,0,0,149,814,1,0,0,0,151,816,1,0,0,0,
	153,818,1,0,0,0,155,820,1,0,0,0,157,823,1,0,0,0,159,825,1,0,0,0,161,827,
	1,0,0,0,163,832,1,0,0,0,165,837,1,0,0,0,167,847,1,0,0,0,169,864,1,0,0,0,
	171,866,1,0,0,0,173,894,1,0,0,0,175,906,1,0,0,0,177,928,1,0,0,0,179,938,
	1,0,0,0,181,940,1,0,0,0,183,944,1,0,0,0,185,955,1,0,0,0,187,964,1,0,0,0,
	189,991,1,0,0,0,191,994,1,0,0,0,193,999,1,0,0,0,195,1017,1,0,0,0,197,198,
	7,0,0,0,198,199,7,1,0,0,199,202,7,2,0,0,200,202,7,3,0,0,201,197,1,0,0,0,
	201,200,1,0,0,0,202,2,1,0,0,0,203,204,7,0,0,0,204,205,7,4,0,0,205,206,7,
	4,0,0,206,207,7,0,0,0,207,208,7,3,0,0,208,4,1,0,0,0,209,210,7,5,0,0,210,
	211,7,6,0,0,211,212,7,7,0,0,212,213,7,8,0,0,213,214,7,1,0,0,214,6,1,0,0,
	0,215,216,7,5,0,0,216,217,7,9,0,0,217,218,7,9,0,0,218,219,7,10,0,0,219,
	220,7,6,0,0,220,221,7,0,0,0,221,236,7,1,0,0,222,223,7,10,0,0,223,224,7,
	9,0,0,224,225,7,7,0,0,225,226,7,8,0,0,226,227,7,11,0,0,227,236,7,9,0,0,
	228,229,7,10,0,0,229,230,7,12,0,0,230,231,5,8220,0,0,231,232,7,7,0,0,232,
	233,7,8,0,0,233,234,7,11,0,0,234,236,7,9,0,0,235,215,1,0,0,0,235,222,1,
	0,0,0,235,228,1,0,0,0,236,8,1,0,0,0,237,238,7,6,0,0,238,239,7,1,0,0,239,
	240,7,2,0,0,240,241,7,11,0,0,241,242,7,0,0,0,242,243,7,13,0,0,243,253,7,
	6,0,0,244,245,7,14,0,0,245,246,7,8,0,0,246,247,7,1,0,0,247,248,7,13,0,0,
	248,249,7,6,0,0,249,250,7,7,0,0,250,251,7,15,0,0,251,253,7,1,0,0,252,237,
	1,0,0,0,252,244,1,0,0,0,253,10,1,0,0,0,254,255,7,13,0,0,255,256,7,6,0,0,
	256,257,7,7,0,0,257,258,7,15,0,0,258,264,7,1,0,0,259,260,7,11,0,0,260,261,
	7,0,0,0,261,262,7,13,0,0,262,264,7,6,0,0,263,254,1,0,0,0,263,259,1,0,0,
	0,264,12,1,0,0,0,265,266,7,11,0,0,266,267,7,0,0,0,267,268,7,4,0,0,268,269,
	7,0,0,0,269,270,7,11,0,0,270,271,7,16,0,0,271,272,7,6,0,0,272,278,7,4,0,
	0,273,274,7,11,0,0,274,275,7,17,0,0,275,276,7,0,0,0,276,278,7,4,0,0,277,
	265,1,0,0,0,277,273,1,0,0,0,278,14,1,0,0,0,279,280,7,11,0,0,280,281,7,17,
	0,0,281,282,7,4,0,0,282,16,1,0,0,0,283,284,7,11,0,0,284,285,7,9,0,0,285,
	286,7,1,0,0,286,287,7,13,0,0,287,288,7,16,0,0,288,18,1,0,0,0,289,290,7,
	2,0,0,290,291,7,8,0,0,291,292,7,18,0,0,292,20,1,0,0,0,293,294,7,2,0,0,294,
	295,7,9,0,0,295,22,1,0,0,0,296,297,7,2,0,0,297,298,7,9,0,0,298,299,7,19,
	0,0,299,300,7,1,0,0,300,301,7,16,0,0,301,302,7,9,0,0,302,24,1,0,0,0,303,
	304,7,6,0,0,304,305,7,10,0,0,305,306,7,8,0,0,306,315,7,14,0,0,307,308,7,
	13,0,0,308,309,7,8,0,0,309,310,7,1,0,0,310,311,7,9,0,0,311,312,5,32,0,0,
	312,313,7,13,0,0,313,315,7,8,0,0,314,303,1,0,0,0,314,307,1,0,0,0,315,26,
	1,0,0,0,316,317,7,6,0,0,317,318,7,10,0,0,318,319,7,13,0,0,319,325,7,6,0,
	0,320,321,7,13,0,0,321,322,7,8,0,0,322,323,7,1,0,0,323,325,7,9,0,0,324,
	316,1,0,0,0,324,320,1,0,0,0,325,28,1,0,0,0,326,327,7,9,0,0,327,328,7,16,
	0,0,328,329,7,17,0,0,329,330,7,6,0,0,330,331,7,4,0,0,331,332,7,19,0,0,332,
	333,7,8,0,0,333,334,7,13,0,0,334,348,7,6,0,0,335,336,7,2,0,0,336,337,7,
	6,0,0,337,338,5,32,0,0,338,339,7,9,0,0,339,340,7,16,0,0,340,341,7,4,0,0,
	341,342,7,9,0,0,342,343,5,32,0,0,343,344,7,20,0,0,344,345,7,9,0,0,345,346,
	7,2,0,0,346,348,7,9,0,0,347,326,1,0,0,0,347,335,1,0,0,0,348,30,1,0,0,0,
	349,350,7,6,0,0,350,351,7,1,0,0,351,352,7,2,0,0,352,32,1,0,0,0,353,354,
	7,14,0,0,354,355,7,8,0,0,355,356,7,10,0,0,356,357,7,6,0,0,357,34,1,0,0,
	0,358,359,7,19,0,0,359,360,7,8,0,0,360,361,7,16,0,0,361,362,7,17,0,0,362,
	363,5,32,0,0,363,364,7,13,0,0,364,365,7,16,0,0,365,366,7,6,0,0,366,376,
	7,21,0,0,367,368,7,11,0,0,368,369,7,9,0,0,369,370,7,1,0,0,370,371,5,32,
	0,0,371,372,7,21,0,0,372,373,7,0,0,0,373,374,7,13,0,0,374,376,7,9,0,0,375,
	358,1,0,0,0,375,367,1,0,0,0,376,36,1,0,0,0,377,378,7,6,0,0,378,379,7,1,
	0,0,379,380,7,2,0,0,380,381,7,14,0,0,381,382,7,9,0,0,382,391,7,4,0,0,383,
	384,7,14,0,0,384,385,7,8,0,0,385,386,7,1,0,0,386,387,7,21,0,0,387,388,7,
	0,0,0,388,389,7,4,0,0,389,391,7,0,0,0,390,377,1,0,0,0,390,383,1,0,0,0,391,
	38,1,0,0,0,392,393,7,14,0,0,393,394,7,9,0,0,394,400,7,4,0,0,395,396,7,21,
	0,0,396,397,7,0,0,0,397,398,7,4,0,0,398,400,7,0,0,0,399,392,1,0,0,0,399,
	395,1,0,0,0,400,40,1,0,0,0,401,402,7,14,0,0,402,403,7,15,0,0,403,404,7,
	1,0,0,404,405,7,11,0,0,405,406,7,16,0,0,406,407,7,8,0,0,407,408,7,9,0,0,
	408,409,7,1,0,0,409,42,1,0,0,0,410,411,7,7,0,0,411,412,7,9,0,0,412,413,
	7,16,0,0,413,414,7,9,0,0,414,44,1,0,0,0,415,416,7,6,0,0,416,417,7,1,0,0,
	417,418,7,2,0,0,418,419,7,8,0,0,419,426,7,14,0,0,420,421,7,14,0,0,421,422,
	7,8,0,0,422,423,7,1,0,0,423,424,7,13,0,0,424,426,7,8,0,0,425,415,1,0,0,
	0,425,420,1,0,0,0,426,46,1,0,0,0,427,428,7,13,0,0,428,432,7,8,0,0,429,430,
	7,8,0,0,430,432,7,14,0,0,431,427,1,0,0,0,431,429,1,0,0,0,432,48,1,0,0,0,
	433,434,7,8,0,0,434,435,7,1,0,0,435,50,1,0,0,0,436,437,7,6,0,0,437,438,
	7,1,0,0,438,439,7,16,0,0,439,440,7,6,0,0,440,441,7,4,0,0,441,450,7,9,0,
	0,442,443,7,8,0,0,443,444,7,1,0,0,444,445,7,16,0,0,445,446,7,6,0,0,446,
	447,7,7,0,0,447,448,7,6,0,0,448,450,7,4,0,0,449,436,1,0,0,0,449,442,1,0,
	0,0,450,52,1,0,0,0,451,452,7,10,0,0,452,453,7,0,0,0,453,454,7,5,0,0,454,
	455,7,6,0,0,455,456,7,10,0,0,456,54,1,0,0,0,457,458,7,20,0,0,458,459,7,
	9,0,0,459,460,7,2,0,0,460,56,1,0,0,0,461,462,7,1,0,0,462,463,7,8,0,0,463,
	464,7,10,0,0,464,58,1,0,0,0,465,466,7,1,0,0,466,467,7,9,0,0,467,471,7,16,
	0,0,468,469,7,1,0,0,469,471,7,9,0,0,470,465,1,0,0,0,470,468,1,0,0,0,471,
	60,1,0,0,0,472,473,7,9,0,0,473,474,7,14,0,0,474,62,1,0,0,0,475,476,7,17,
	0,0,476,477,7,0,0,0,477,478,7,11,0,0,478,479,7,6,0,0,479,480,7,4,0,0,480,
	64,1,0,0,0,481,482,7,9,0,0,482,485,7,4,0,0,483,485,7,9,0,0,484,481,1,0,
	0,0,484,483,1,0,0,0,485,66,1,0,0,0,486,487,7,21,0,0,487,488,7,0,0,0,488,
	489,7,11,0,0,489,490,7,22,0,0,490,491,7,6,0,0,491,492,7,2,0,0,492,68,1,
	0,0,0,493,494,7,21,0,0,494,495,7,4,0,0,495,496,7,9,0,0,496,497,7,11,0,0,
	497,498,7,6,0,0,498,499,7,2,0,0,499,500,7,15,0,0,500,501,7,4,0,0,501,502,
	7,6,0,0,502,70,1,0,0,0,503,504,7,21,0,0,504,505,7,4,0,0,505,506,7,9,0,0,
	506,507,7,11,0,0,507,508,7,6,0,0,508,509,7,13,0,0,509,527,7,9,0,0,510,511,
	7,0,0,0,511,512,7,10,0,0,512,513,7,7,0,0,513,514,7,9,0,0,514,515,7,4,0,
	0,515,516,7,8,0,0,516,517,7,16,0,0,517,518,7,20,0,0,518,527,7,9,0,0,519,
	520,7,21,0,0,520,521,7,4,0,0,521,522,7,9,0,0,522,523,7,7,0,0,523,524,7,
	4,0,0,524,525,7,0,0,0,525,527,7,20,0,0,526,503,1,0,0,0,526,510,1,0,0,0,
	526,519,1,0,0,0,527,72,1,0,0,0,528,529,7,14,0,0,529,530,7,8,0,0,530,531,
	7,1,0,0,531,532,7,21,0,0,532,533,7,4,0,0,533,534,7,9,0,0,534,535,7,11,0,
	0,535,536,7,6,0,0,536,537,7,13,0,0,537,561,7,9,0,0,538,539,7,14,0,0,539,
	540,7,8,0,0,540,541,7,1,0,0,541,542,7,0,0,0,542,543,7,10,0,0,543,544,7,
	7,0,0,544,545,7,9,0,0,545,546,7,4,0,0,546,547,7,8,0,0,547,548,7,16,0,0,
	548,549,7,20,0,0,549,561,7,9,0,0,550,551,7,6,0,0,551,552,7,1,0,0,552,553,
	7,2,0,0,553,554,7,21,0,0,554,555,7,4,0,0,555,556,7,9,0,0,556,557,7,7,0,
	0,557,558,7,4,0,0,558,559,7,0,0,0,559,561,7,20,0,0,560,528,1,0,0,0,560,
	538,1,0,0,0,560,550,1,0,0,0,561,74,1,0,0,0,562,563,7,5,0,0,563,564,7,4,
	0,0,564,565,7,6,0,0,565,566,7,0,0,0,566,574,7,22,0,0,567,568,7,4,0,0,568,
	569,7,9,0,0,569,570,7,20,0,0,570,571,7,21,0,0,571,572,7,6,0,0,572,574,7,
	4,0,0,573,562,1,0,0,0,573,567,1,0,0,0,574,76,1,0,0,0,575,576,7,11,0,0,576,
	577,7,9,0,0,577,578,7,1,0,0,578,579,7,16,0,0,579,580,7,8,0,0,580,581,7,
	1,0,0,581,582,7,15,0,0,582,593,7,6,0,0,583,584,7,11,0,0,584,585,7,9,0,0,
	585,586,7,1,0,0,586,587,7,16,0,0,587,588,7,8,0,0,588,589,7,1,0,0,589,590,
	7,15,0,0,590,591,7,0,0,0,591,593,7,4,0,0,592,575,1,0,0,0,592,583,1,0,0,
	0,593,78,1,0,0,0,594,595,7,4,0,0,595,596,7,6,0,0,596,597,7,16,0,0,597,598,
	7,15,0,0,598,599,7,4,0,0,599,609,7,1,0,0,600,601,7,4,0,0,601,602,7,6,0,
	0,602,603,7,7,0,0,603,604,7,4,0,0,604,605,7,6,0,0,605,606,7,13,0,0,606,
	607,7,0,0,0,607,609,7,4,0,0,608,594,1,0,0,0,608,600,1,0,0,0,609,80,1,0,
	0,0,610,611,7,4,0,0,611,612,7,6,0,0,612,613,7,0,0,0,613,614,7,10,0,0,614,
	82,1,0,0,0,615,616,7,4,0,0,616,617,7,6,0,0,617,618,7,11,0,0,618,619,7,9,
	0,0,619,620,7,4,0,0,620,621,7,2,0,0,621,84,1,0,0,0,622,623,7,4,0,0,623,
	624,7,6,0,0,624,625,7,21,0,0,625,626,7,6,0,0,626,627,7,0,0,0,627,636,7,
	16,0,0,628,629,7,4,0,0,629,630,7,6,0,0,630,631,7,21,0,0,631,632,7,6,0,0,
	632,633,7,16,0,0,633,634,7,8,0,0,634,636,7,4,0,0,635,622,1,0,0,0,635,628,
	1,0,0,0,636,86,1,0,0,0,637,638,7,13,0,0,638,639,7,6,0,0,639,640,7,16,0,
	0,640,88,1,0,0,0,641,642,7,16,0,0,642,643,7,17,0,0,643,644,7,6,0,0,644,
	654,7,1,0,0,645,646,7,6,0,0,646,647,7,1,0,0,647,648,7,16,0,0,648,649,7,
	9,0,0,649,650,7,1,0,0,650,651,7,11,0,0,651,652,7,6,0,0,652,654,7,13,0,0,
	653,641,1,0,0,0,653,645,1,0,0,0,654,90,1,0,0,0,655,656,7,15,0,0,656,657,
	7,1,0,0,657,658,7,16,0,0,658,659,7,8,0,0,659,670,7,10,0,0,660,661,7,17,
	0,0,661,662,7,0,0,0,662,663,7,13,0,0,663,664,7,16,0,0,664,665,7,0,0,0,665,
	666,5,32,0,0,666,667,7,23,0,0,667,668,7,15,0,0,668,670,7,6,0,0,669,655,
	1,0,0,0,669,660,1,0,0,0,670,92,1,0,0,0,671,672,7,16,0,0,672,679,7,9,0,0,
	673,674,7,17,0,0,674,675,7,0,0,0,675,676,7,13,0,0,676,677,7,16,0,0,677,
	679,7,0,0,0,678,671,1,0,0,0,678,673,1,0,0,0,679,94,1,0,0,0,680,681,7,16,
	0,0,681,682,7,3,0,0,682,683,7,21,0,0,683,684,7,6,0,0,684,96,1,0,0,0,685,
	686,7,2,0,0,686,687,7,6,0,0,687,688,7,14,0,0,688,689,7,8,0,0,689,690,7,
	1,0,0,690,691,7,8,0,0,691,696,7,4,0,0,692,693,7,18,0,0,693,694,7,0,0,0,
	694,696,7,4,0,0,695,685,1,0,0,0,695,692,1,0,0,0,696,98,1,0,0,0,697,698,
	7,6,0,0,698,699,7,1,0,0,699,700,7,2,0,0,700,701,7,19,0,0,701,702,7,17,0,
	0,702,703,7,8,0,0,703,704,7,10,0,0,704,717,7,6,0,0,705,706,7,14,0,0,706,
	707,7,8,0,0,707,708,7,1,0,0,708,709,7,20,0,0,709,710,7,8,0,0,710,711,7,
	6,0,0,711,712,7,1,0,0,712,713,7,16,0,0,713,714,7,4,0,0,714,715,7,0,0,0,
	715,717,7,13,0,0,716,697,1,0,0,0,716,705,1,0,0,0,717,100,1,0,0,0,718,719,
	7,20,0,0,719,720,7,8,0,0,720,721,7,6,0,0,721,722,7,1,0,0,722,723,7,16,0,
	0,723,724,7,4,0,0,724,725,7,0,0,0,725,726,7,13,0,0,726,727,5,32,0,0,727,
	728,7,23,0,0,728,729,7,15,0,0,729,730,7,6,0,0,730,102,1,0,0,0,731,732,7,
	19,0,0,732,733,7,17,0,0,733,734,7,8,0,0,734,735,7,10,0,0,735,745,7,6,0,
	0,736,737,7,20,0,0,737,738,7,8,0,0,738,739,7,6,0,0,739,740,7,1,0,0,740,
	741,7,16,0,0,741,742,7,4,0,0,742,743,7,0,0,0,743,745,7,13,0,0,744,731,1,
	0,0,0,744,736,1,0,0,0,745,104,1,0,0,0,746,747,7,19,0,0,747,748,7,8,0,0,
	748,749,7,16,0,0,749,750,7,17,0,0,750,106,1,0,0,0,751,752,5,43,0,0,752,
	108,1,0,0,0,753,754,5,45,0,0,754,110,1,0,0,0,755,756,5,42,0,0,756,759,5,
	42,0,0,757,759,5,94,0,0,758,755,1,0,0,0,758,757,1,0,0,0,759,112,1,0,0,0,
	760,761,5,42,0,0,761,114,1,0,0,0,762,763,5,47,0,0,763,116,1,0,0,0,764,765,
	5,58,0,0,765,770,5,61,0,0,766,767,5,60,0,0,767,770,5,45,0,0,768,770,5,8592,
	0,0,769,764,1,0,0,0,769,766,1,0,0,0,769,768,1,0,0,0,770,118,1,0,0,0,771,
	772,5,44,0,0,772,120,1,0,0,0,773,774,5,59,0,0,774,122,1,0,0,0,775,776,5,
	58,0,0,776,124,1,0,0,0,777,778,5,61,0,0,778,126,1,0,0,0,779,780,5,60,0,
	0,780,785,5,62,0,0,781,782,5,33,0,0,782,785,5,61,0,0,783,785,5,8800,0,0,
	784,779,1,0,0,0,784,781,1,0,0,0,784,783,1,0,0,0,785,128,1,0,0,0,786,787,
	5,60,0,0,787,130,1,0,0,0,788,789,5,60,0,0,789,792,5,61,0,0,790,792,5,8804,
	0,0,791,788,1,0,0,0,791,790,1,0,0,0,792,132,1,0,0,0,793,794,5,62,0,0,794,
	797,5,61,0,0,795,797,5,8805,0,0,796,793,1,0,0,0,796,795,1,0,0,0,797,134,
	1,0,0,0,798,799,5,62,0,0,799,136,1,0,0,0,800,801,5,40,0,0,801,138,1,0,0,
	0,802,803,5,41,0,0,803,140,1,0,0,0,804,805,5,91,0,0,805,142,1,0,0,0,806,
	807,5,40,0,0,807,808,5,46,0,0,808,144,1,0,0,0,809,810,5,93,0,0,810,146,
	1,0,0,0,811,812,5,46,0,0,812,813,5,41,0,0,813,148,1,0,0,0,814,815,5,94,
	0,0,815,150,1,0,0,0,816,817,5,64,0,0,817,152,1,0,0,0,818,819,5,46,0,0,819,
	154,1,0,0,0,820,821,5,46,0,0,821,822,5,46,0,0,822,156,1,0,0,0,823,824,5,
	123,0,0,824,158,1,0,0,0,825,826,5,125,0,0,826,160,1,0,0,0,827,828,7,11,
	0,0,828,829,7,9,0,0,829,830,7,20,0,0,830,831,7,9,0,0,831,162,1,0,0,0,832,
	833,7,15,0,0,833,834,7,1,0,0,834,835,7,8,0,0,835,836,7,16,0,0,836,164,1,
	0,0,0,837,838,7,8,0,0,838,839,7,1,0,0,839,840,7,16,0,0,840,841,7,6,0,0,
	841,842,7,4,0,0,842,843,7,14,0,0,843,844,7,0,0,0,844,845,7,11,0,0,845,846,
	7,6,0,0,846,166,1,0,0,0,847,848,7,15,0,0,848,849,7,13,0,0,849,850,7,6,0,
	0,850,851,7,13,0,0,851,168,1,0,0,0,852,853,7,13,0,0,853,854,7,16,0,0,854,
	855,7,4,0,0,855,856,7,8,0,0,856,857,7,1,0,0,857,865,7,7,0,0,858,859,7,11,
	0,0,859,860,7,0,0,0,860,861,7,2,0,0,861,862,7,6,0,0,862,863,7,1,0,0,863,
	865,7,0,0,0,864,852,1,0,0,0,864,858,1,0,0,0,865,170,1,0,0,0,866,867,7,8,
	0,0,867,868,7,20,0,0,868,869,7,21,0,0,869,870,7,10,0,0,870,871,7,6,0,0,
	871,872,7,20,0,0,872,873,7,6,0,0,873,874,7,1,0,0,874,875,7,16,0,0,875,876,
	7,0,0,0,876,877,7,16,0,0,877,878,7,8,0,0,878,879,7,9,0,0,879,880,7,1,0,
	0,880,172,1,0,0,0,881,882,7,16,0,0,882,883,7,4,0,0,883,884,7,15,0,0,884,
	895,7,6,0,0,885,886,7,18,0,0,886,887,7,6,0,0,887,888,7,4,0,0,888,889,7,
	2,0,0,889,890,7,0,0,0,890,891,7,2,0,0,891,892,7,6,0,0,892,893,7,4,0,0,893,
	895,7,9,0,0,894,881,1,0,0,0,894,885,1,0,0,0,895,174,1,0,0,0,896,897,7,14,
	0,0,897,898,7,0,0,0,898,899,7,10,0,0,899,900,7,13,0,0,900,907,7,6,0,0,901,
	902,7,14,0,0,902,903,7,0,0,0,903,904,7,10,0,0,904,905,7,13,0,0,905,907,
	7,9,0,0,906,896,1,0,0,0,906,901,1,0,0,0,907,176,1,0,0,0,908,909,7,19,0,
	0,909,910,7,4,0,0,910,911,7,8,0,0,911,912,7,16,0,0,912,929,7,6,0,0,913,
	914,7,6,0,0,914,915,7,13,0,0,915,916,7,11,0,0,916,917,7,4,0,0,917,918,7,
	8,0,0,918,919,7,5,0,0,919,920,7,8,0,0,920,929,7,4,0,0,921,922,7,20,0,0,
	922,923,7,9,0,0,923,924,7,13,0,0,924,925,7,16,0,0,925,926,7,4,0,0,926,927,
	7,0,0,0,927,929,7,4,0,0,928,908,1,0,0,0,928,913,1,0,0,0,928,921,1,0,0,0,
	929,178,1,0,0,0,930,931,7,4,0,0,931,932,7,6,0,0,932,933,7,0,0,0,933,939,
	7,2,0,0,934,935,7,10,0,0,935,936,7,6,0,0,936,937,7,6,0,0,937,939,7,4,0,
	0,938,930,1,0,0,0,938,934,1,0,0,0,939,180,1,0,0,0,940,941,7,24,0,0,941,
	942,1,0,0,0,942,943,6,90,0,0,943,182,1,0,0,0,944,945,5,47,0,0,945,946,5,
	47,0,0,946,950,1,0,0,0,947,949,8,25,0,0,948,947,1,0,0,0,949,952,1,0,0,0,
	950,948,1,0,0,0,950,951,1,0,0,0,951,953,1,0,0,0,952,950,1,0,0,0,953,954,
	6,91,0,0,954,184,1,0,0,0,955,959,5,35,0,0,956,958,8,25,0,0,957,956,1,0,
	0,0,958,961,1,0,0,0,959,957,1,0,0,0,959,960,1,0,0,0,960,962,1,0,0,0,961,
	959,1,0,0,0,962,963,6,92,0,0,963,186,1,0,0,0,964,968,7,26,0,0,965,967,7,
	27,0,0,966,965,1,0,0,0,967,970,1,0,0,0,968,966,1,0,0,0,968,969,1,0,0,0,
	969,188,1,0,0,0,970,968,1,0,0,0,971,977,5,39,0,0,972,973,5,39,0,0,973,976,
	5,39,0,0,974,976,8,28,0,0,975,972,1,0,0,0,975,974,1,0,0,0,976,979,1,0,0,
	0,977,975,1,0,0,0,977,978,1,0,0,0,978,980,1,0,0,0,979,977,1,0,0,0,980,992,
	5,39,0,0,981,987,5,34,0,0,982,983,5,34,0,0,983,986,5,34,0,0,984,986,8,29,
	0,0,985,982,1,0,0,0,985,984,1,0,0,0,986,989,1,0,0,0,987,985,1,0,0,0,987,
	988,1,0,0,0,988,990,1,0,0,0,989,987,1,0,0,0,990,992,5,34,0,0,991,971,1,
	0,0,0,991,981,1,0,0,0,992,190,1,0,0,0,993,995,2,48,57,0,994,993,1,0,0,0,
	995,996,1,0,0,0,996,994,1,0,0,0,996,997,1,0,0,0,997,192,1,0,0,0,998,1000,
	2,48,57,0,999,998,1,0,0,0,1000,1001,1,0,0,0,1001,999,1,0,0,0,1001,1002,
	1,0,0,0,1002,1015,1,0,0,0,1003,1005,5,46,0,0,1004,1006,2,48,57,0,1005,1004,
	1,0,0,0,1006,1007,1,0,0,0,1007,1005,1,0,0,0,1007,1008,1,0,0,0,1008,1010,
	1,0,0,0,1009,1011,3,195,97,0,1010,1009,1,0,0,0,1010,1011,1,0,0,0,1011,1013,
	1,0,0,0,1012,1003,1,0,0,0,1012,1013,1,0,0,0,1013,1016,1,0,0,0,1014,1016,
	3,195,97,0,1015,1012,1,0,0,0,1015,1014,1,0,0,0,1016,194,1,0,0,0,1017,1019,
	7,6,0,0,1018,1020,7,30,0,0,1019,1018,1,0,0,0,1019,1020,1,0,0,0,1020,1022,
	1,0,0,0,1021,1023,2,48,57,0,1022,1021,1,0,0,0,1023,1024,1,0,0,0,1024,1022,
	1,0,0,0,1024,1025,1,0,0,0,1025,196,1,0,0,0,55,0,201,235,252,263,277,314,
	324,347,375,390,399,425,431,449,470,484,526,560,573,592,608,635,653,669,
	678,695,716,744,758,769,784,791,796,864,894,906,928,938,950,959,968,975,
	977,985,987,991,996,1001,1007,1010,1012,1015,1019,1024,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!StepCodeLexer.__ATN) {
			StepCodeLexer.__ATN = new ATNDeserializer().deserialize(StepCodeLexer._serializedATN);
		}

		return StepCodeLexer.__ATN;
	}


	static DecisionsToDFA = StepCodeLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}