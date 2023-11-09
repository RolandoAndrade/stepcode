/*
BSD License

Copyright (c) 2013, Tom Everett
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name of Tom Everett nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
Adapted from pascal.g by  Hakki Dogusan, Piet Schoutteten and Marton Papp
*/

grammar StepCode;

options { caseInsensitive = true; }

program
   : programHeading (INTERFACE)? block ENDPROGRAM EOF
   ;

programHeading
   : PROGRAM identifier (LPAREN identifierList RPAREN)?
   | UNIT identifier
   ;

identifier
   : IDENT
   ;

block
   : (labelDeclarationPart | constantDefinitionPart | typeDefinitionPart | variableDeclarationPart |
   procedureAndFunctionDeclarationPart | usesUnitsPart | IMPLEMENTATION | statements)*
   ;

usesUnitsPart
   : USES identifierList SEMI
   ;

labelDeclarationPart
   : LABEL label (COMMA label)* SEMI
   ;

label
   : unsignedInteger
   ;

constantDefinitionPart
   : CONST (constantDefinition SEMI) +
   ;

constantDefinition
   : identifier EQUAL constant
   ;

constantChr
   : CHR LPAREN unsignedInteger RPAREN
   ;

constant
   : unsignedNumber
   | sign unsignedNumber
   | identifier
   | sign identifier
   | string
   | constantChr
   ;

unsignedNumber
   : unsignedInteger
   | unsignedReal
   ;

unsignedInteger
   : NUM_INT
   ;

unsignedReal
   : NUM_REAL
   ;

sign
   : PLUS
   | MINUS
   ;

bool_
   : TRUE
   | FALSE
   ;

string
   : STRING_LITERAL
   ;

typeDefinitionPart
   : TYPE (typeDefinition SEMI) +
   ;

typeDefinition
   : identifier EQUAL (type_ | functionType | procedureType)
   ;

functionType
   : FUNCTION (formalParameterList)? COLON resultType
   ;

procedureType
   : PROCEDURE (formalParameterList)?
   ;

type_
   : simpleType
   | structuredType
   | pointerType
   ;

simpleType
   : scalarType
   | subrangeType
   | typeIdentifier
   | stringtype
   ;

scalarType
   : LPAREN identifierList RPAREN
   ;

subrangeType
   : constant DOTDOT constant
   ;

typeIdentifier
   : identifier
   | (CHAR | BOOLEAN | INTEGER | REAL | STRING)
   ;

structuredType
   : PACKED unpackedStructuredType
   | unpackedStructuredType
   ;

unpackedStructuredType
   : arrayType
   | recordType
   | setType
   | fileType
   ;

stringtype
   : STRING LBRACK (identifier | unsignedNumber) RBRACK
   ;

arrayType
   : ARRAY LBRACK typeList RBRACK OF componentType
   | ARRAY LBRACK2 typeList RBRACK2 OF componentType
   ;

typeList
   : indexType (COMMA indexType)*
   ;

indexType
   : simpleType
   ;

componentType
   : type_
   ;

recordType
   : RECORD fieldList? END
   ;

fieldList
   : fixedPart (SEMI variantPart)?
   | variantPart
   ;

fixedPart
   : recordSection (SEMI recordSection)*
   ;

recordSection
   : identifierList COLON type_
   ;

variantPart
   : CASE tag OF variant (SEMI variant)*
   ;

tag
   : identifier COLON typeIdentifier
   | typeIdentifier
   ;

variant
   : constList COLON LPAREN fieldList RPAREN
   ;

setType
   : SET OF baseType
   ;

baseType
   : simpleType
   ;

fileType
   : FILE OF type_
   | FILE
   ;

pointerType
   : POINTER typeIdentifier
   ;

variableDeclarationPart
   : DEFINE variableDeclaration SEMI
   ;

variableDeclaration
   : identifierList AS type_
   ;

procedureAndFunctionDeclarationPart
   : procedureOrFunctionDeclaration SEMI
   ;

procedureOrFunctionDeclaration
   : procedureDeclaration
   | functionDeclaration
   ;

procedureDeclaration
   : PROCEDURE identifier (formalParameterList)? SEMI block
   ;

formalParameterList
   : LPAREN formalParameterSection (SEMI formalParameterSection)* RPAREN
   ;

formalParameterSection
   : parameterGroup
   | DEFINE parameterGroup
   | FUNCTION parameterGroup
   | PROCEDURE parameterGroup
   ;

parameterGroup
   : identifierList COLON typeIdentifier
   ;

identifierList
   : identifier (COMMA identifier)*
   ;

constList
   : constant (COMMA constant)*
   ;

functionDeclaration
   : FUNCTION identifier (formalParameterList)? COLON resultType SEMI block
   ;

resultType
   : typeIdentifier
   ;

statement
   : label COLON unlabelledStatement
   | unlabelledStatement
   | writeStatement | readStatement
   | breakStatement | continueStatement
   ;

breakStatement
    : BREAK SEMI
    ;

continueStatement
    : CONTINUE SEMI
    ;

unlabelledStatement
   : simpleStatement
   | structuredStatement
   ;

simpleStatement
   : assignmentStatement
   | procedureStatement
   | gotoStatement
   // | emptyStatement_
   ;

assignmentStatement
   : variable ASSIGN expression SEMI
   ;

variable
   : identifier accessor*
   ;

accessor
    : index
    ;

index
    : LBRACK expression RBRACK
    ;

expression
   : booleanMultiplicativeExpression | expression OR expression
   ;

booleanMultiplicativeExpression
    : booleanRelationalExpression | booleanMultiplicativeExpression AND booleanMultiplicativeExpression
    ;

booleanRelationalExpression
    : simpleExpression | booleanRelationalExpression relationaloperator booleanRelationalExpression
    ;

relationaloperator
   : EQUAL
   | NOT_EQUAL
   | LT
   | LE
   | GE
   | GT
   | IN
   ;

simpleExpression
   : term | simpleExpression additiveoperator simpleExpression
   ;

additiveoperator
   : PLUS
   | MINUS
   ;

term
   : baseTerm | term multiplicativeoperator term
   ;

baseTerm
   : signedFactor | baseTerm exponentiationOperator baseTerm
   ;

multiplicativeoperator
   : STAR
   | SLASH
   | DIV
   | MOD
   ;

exponentiationOperator
   : POWER
   ;

signedFactor
   : (PLUS | MINUS)? factor
   ;

factor
   : variable
   | LPAREN expression RPAREN
   | functionDesignator
   | unsignedConstant
   | set_
   | NOT factor
   | bool_
   ;

unsignedConstant
   : unsignedNumber
   | constantChr
   | string
   | NIL
   ;

functionDesignator
   : identifier LPAREN parameterList RPAREN
   ;

parameterList
   : actualParameter (COMMA actualParameter)*
   ;

set_
   : LBRACK elementList RBRACK
   | LBRACK2 elementList RBRACK2
   ;

elementList
   : element (COMMA element)*
   |
   ;

element
   : expression (DOTDOT expression)?
   ;

procedureStatement
   : identifier (LPAREN parameterList RPAREN)?
   ;

actualParameter
   : expression parameterwidth*
   ;

parameterwidth
   : COLON expression
   ;

gotoStatement
   : GOTO label
   ;

emptyStatement_
   :
   ;

empty_
   :
   /* empty */
   ;

structuredStatement
   : conditionalStatement
   | repetetiveStatement
   | withStatement
   ;

compoundStatement
   : (statements)*
   ;

statements
   : statement (SEMI statement)* (SEMI)?
   ;

conditionalStatement
   : ifStatement
   | caseStatement
   ;

ifStatement
   : IF expression THEN compoundStatement (elifStatement | elseStatement?) ENDIF
   ;

elifStatement
   : ELIF expression THEN compoundStatement (elifStatement | elseStatement? | ENDIF)
   ;

elseStatement
   : ELSE compoundStatement
   ;

caseStatement
   : CASE expression (OF | HACER) caseListElement* caseOtherWise? ENDCASE
   ;

caseListElement
   : constList (COLON | AS) compoundStatement
   ;

caseOtherWise
   : ((ELSE | (OTHERWISE COLON)) compoundStatement)
   ;

repetetiveStatement
   : whileStatement
   | repeatStatement
   | forStatement
   ;

whileStatement
   : WHILE expression (DO | HACER) compoundStatement ENDWHILE
   ;

repeatStatement
   : REPEAT compoundStatement (UNTIL | MIENTRASQUE) expression SEMI
   ;

forStatement
   : FOR identifier ASSIGN forList (WITHSTEP stepValue)? (DO | HACER) compoundStatement ENDFOR
   ;

forList
   : initialValue (TO | DOWNTO) finalValue
   ;

initialValue
   : expression
   ;

finalValue
   : expression
   ;

stepValue
   : expression
   ;

withStatement
   : WITH recordVariableList DO statement
   ;

recordVariableList
   : variable (COMMA variable)*
   ;

writeStatement
   : WRITE expression (COMMA expression)* SEMI
   ;

readStatement
   : READ variable (COMMA variable)* SEMI
   ;

AND
   : 'AND' | 'Y'
   ;


ARRAY
   : 'ARRAY'
   ;


BEGIN
   : 'BEGIN'
   ;


BOOLEAN
   : 'BOOLEAN' | 'LOGICO' | 'LÓGICO'
   ;

ENDCASE
    : 'ENDCASE' | 'FINSEGUN'
    ;

CASE
   : 'SEGUN' | 'CASE'
   ;


CHAR
   : 'CARACTER' | 'CHAR'
   ;


CHR
   : 'CHR'
   ;


CONST
   : 'CONST'
   ;


DIV
   : 'DIV'
   ;


DO
   : 'DO'
   ;


DOWNTO
   : 'DOWNTO'
   ;

ELIF
   : 'ELIF' | 'SINO SI'
   ;

ELSE
   : 'ELSE' | 'SINO'
   ;

OTHERWISE
   : 'OTHERWISE' | 'DE OTRO MODO'
   ;

END
   : 'END'
   ;


FILE
   : 'FILE'
   ;


WITHSTEP
   : 'WITH STEP' | 'CON PASO'
   ;

ENDFOR
   : 'ENDFOR' | 'FINPARA'
   ;

FOR
   : 'FOR' | 'PARA'
   ;


FUNCTION
   : 'FUNCTION'
   ;


GOTO
   : 'GOTO'
   ;

ENDIF
   : 'ENDIF' | 'FINSI'
   ;

IF
   : 'SI' | 'IF'
   ;


IN
   : 'IN'
   ;


INTEGER
   : 'ENTERO' | 'INTEGER'
   ;


LABEL
   : 'LABEL'
   ;


MOD
   : 'MOD'
   ;


NIL
   : 'NIL'
   ;


NOT
   : 'NOT' | 'NO'
   ;


OF
   : 'OF'
   ;

HACER
    : 'HACER'
    ;


OR
   : 'OR' | 'O'
   ;


PACKED
   : 'PACKED'
   ;


PROCEDURE
   : 'PROCEDURE'
   ;


PROGRAM
   : 'PROCESO' | 'ALGORITMO' | 'PROGRAM'
   ;

ENDPROGRAM
   : 'FINPROCESO' | 'FINALGORITMO' | 'ENDPROGRAM'
   ;

BREAK
   : 'BREAK' | 'ROMPER'
   ;

CONTINUE
   : 'CONTINUE' | 'CONTINUAR'
   ;

RETURN
   : 'RETURN' | 'REGRESAR'
   ;


REAL
   : 'REAL'
   ;


RECORD
   : 'RECORD'
   ;


REPEAT
   : 'REPEAT' | 'REPETIR'
   ;


SET
   : 'SET'
   ;


THEN
   : 'THEN' | 'ENTONCES'
   ;


UNTIL
   : 'UNTIL' | 'HASTA QUE'
   ;

TO
   : 'TO' | 'HASTA'
   ;

TYPE
   : 'TYPE'
   ;

DEFINE
   : 'DEFINIR' | 'VAR'
   ;


ENDWHILE
   : 'ENDWHILE' | 'FINMIENTRAS'
   ;

MIENTRASQUE
   : 'MIENTRAS QUE'
   ;

WHILE
   : 'WHILE' | 'MIENTRAS'
   ;


WITH
   : 'WITH'
   ;


PLUS
   : '+'
   ;


MINUS
   : '-'
   ;

POWER
   : '**' | '^'
   ;

STAR
   : '*'
   ;




SLASH
   : '/'
   ;


ASSIGN
   : ':=' | '<-' | '\u2190'
   ;


COMMA
   : ','
   ;


SEMI
   : ';'
   ;


COLON
   : ':'
   ;


EQUAL
   : '='
   ;


NOT_EQUAL
   : '<>' | '!=' | '\u2260'
   ;


LT
   : '<'
   ;


LE
   : '<=' | '\u2264'
   ;


GE
   : '>=' | '\u2265'
   ;


GT
   : '>'
   ;


LPAREN
   : '('
   ;


RPAREN
   : ')'
   ;


LBRACK
   : '['
   ;


LBRACK2
   : '(.'
   ;


RBRACK
   : ']'
   ;


RBRACK2
   : '.)'
   ;


POINTER
   : '^'
   ;


AT
   : '@'
   ;


DOT
   : '.'
   ;


DOTDOT
   : '..'
   ;


LCURLY
   : '{'
   ;


RCURLY
   : '}'
   ;

AS
   : 'COMO'
   ;


UNIT
   : 'UNIT'
   ;


INTERFACE
   : 'INTERFACE'
   ;


USES
   : 'USES'
   ;


STRING
   : 'STRING' | 'CADENA'
   ;


IMPLEMENTATION
   : 'IMPLEMENTATION'
   ;


TRUE
   : 'TRUE' | 'VERDADERO'
   ;


FALSE
   : 'FALSE' | 'FALSO'
   ;

WRITE
    : 'WRITE' | 'ESCRIBIR' | 'MOSTRAR'
    ;

READ
    : 'READ' | 'LEER'
    ;


WS
   : [ \t\r\n] -> skip
   ;


COMMENT_1
   : '//' ~[\r\n]* -> skip
   ;


COMMENT_2
   : '#' ~[\r\n]* -> skip
   ;


IDENT
   : ('A' .. 'Z') ('A' .. 'Z' | '0' .. '9' | '_')*
   ;


STRING_LITERAL
   : '\'' ('\'\'' | ~ ('\''))* '\'' | '"' ('""' | ~ ('"'))* '"'
   ;


NUM_INT
   : ('0' .. '9') +
   ;


NUM_REAL
   : ('0' .. '9') + (('.' ('0' .. '9') + (EXPONENT)?)? | EXPONENT)
   ;


fragment EXPONENT
   : ('E') ('+' | '-')? ('0' .. '9') +
   ;