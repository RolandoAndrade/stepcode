import { ParserRuleContext, ParseTree, TerminalNode, Token, TokenStream } from 'antlr4ng';

export type CaretPosition = { line: number, column: number };
export type TokenPosition = { index: number, context: ParseTree, text: string };
export type ComputeTokenPositionFunction =
  (parseTree: ParseTree, tokens: TokenStream, caretPosition: CaretPosition) => TokenPosition;


export function tokenPositionComputer(identifierTokenTypes: number[] = []) {
  return (parseTree: ParseTree, tokens: TokenStream, caretPosition: CaretPosition) =>
    computeTokenPosition(parseTree, tokens, caretPosition, identifierTokenTypes);
}

export function computeTokenPosition(
  parseTree: ParseTree, tokens: TokenStream, caretPosition: CaretPosition, identifierTokenTypes: number[] = []): TokenPosition | undefined {
  if(parseTree instanceof TerminalNode) {
    return computeTokenPositionOfTerminal(parseTree, tokens, caretPosition, identifierTokenTypes);
  } else {
    return computeTokenPositionOfChildNode(parseTree as ParserRuleContext, tokens, caretPosition, identifierTokenTypes);
  }
}

function positionOfToken(token: Token, text: string, caretPosition: CaretPosition, identifierTokenTypes: number[], parseTree: ParseTree) {
  let start = token.start;
  let stop = token.stop;
  if (token.line == caretPosition.line && start <= caretPosition.column && stop >= caretPosition.column) {
    let index = token.tokenIndex;
    if (identifierTokenTypes.includes(token.type)) {
      index--;
    }
    return {
      index: index,
      context: parseTree,
      text: text.substring(0, caretPosition.column - start)
    };
  } else {
    return undefined;
  }
}

function computeTokenPositionOfTerminal(
  parseTree: TerminalNode, tokens: TokenStream, caretPosition: CaretPosition, identifierTokenTypes: number[]) {
  let token = parseTree.symbol;
  let text = parseTree.getText();
  return positionOfToken(token, text, caretPosition, identifierTokenTypes, parseTree);
}

function computeTokenPositionOfChildNode(
  parseTree: ParserRuleContext, tokens: TokenStream, caretPosition: CaretPosition, identifierTokenTypes: number[]) {
  if((parseTree.start && parseTree.start.line > caretPosition.line) ||
    (parseTree.stop && parseTree.stop.line < caretPosition.line)) {
    return undefined;
  }
  for (let i = 0; i < parseTree.getChildCount(); i++) {
    let position = computeTokenPosition(parseTree.getChild(i)!, tokens, caretPosition, identifierTokenTypes);
    if (position !== undefined) {
      return position;
    }
  }
  if(parseTree.start && parseTree.stop) {
    for(let i = parseTree.start.tokenIndex; i <= parseTree.stop.tokenIndex; i++) {
      let pos = positionOfToken(tokens.get(i), tokens.get(i).text!, caretPosition, identifierTokenTypes, parseTree);
      if(pos) {
        return pos;
      }
    }
  }
  return undefined;
}