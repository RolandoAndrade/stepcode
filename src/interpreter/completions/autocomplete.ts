import { createParser } from '../parser.ts';
import { CodeCompletionCore, ScopedSymbol, SymbolTable, VariableSymbol } from 'antlr4-c3';
import { CaretPosition, ComputeTokenPositionFunction, TokenPosition } from './compute-token-index.ts';
import { CharStreams, CommonTokenStream, ParseTree, TerminalNode } from 'antlr4ng';
import { StepCodeParser } from '../../parser/StepCodeParser.ts';
import { StepCodeLexer } from '../../parser/StepCodeLexer.ts';
import { SymbolTableVisitor } from './symbol-table-visitor.ts';

export function getScope(context: ParseTree, symbolTable: SymbolTable) {
  if(!context) {
    return undefined;
  }
  const scope = symbolTable.symbolWithContext(context);
  if(scope) {
    return scope;
  } else {
    return getScope(context.parent!, symbolTable);
  }
}
/*
export function getAllSymbolsOfType<T extends Symbol>(scope: ScopedSymbol, type: new (...args: any[]) => T): T[] {
  let symbols = scope.getSymbolsOfType(type as any);
  let parent = scope.parent;
  while(parent && !(parent instanceof ScopedSymbol)) {
    parent = parent.parent;
  }
  if(parent) {
    symbols.push(...getAllSymbolsOfType(parent as ScopedSymbol, type));
  }
  return symbols;
}

function suggestVariables(symbolTable: SymbolTable, position: TokenPosition) {
  const context = position.context;
  const scope = getScope(context, symbolTable);
  let symbols: Symbol[];
  if(scope instanceof ScopedSymbol) { //Local scope
    symbols = getAllSymbolsOfType(scope, VariableSymbol);
  } else { //Global scope
    symbols = symbolTable.getSymbolsOfType(VariableSymbol);
  }
  let variable = position.context;
  while(!(variable instanceof VariableReadContext) && variable.parent) {
    variable = variable.parent;
  }
  return filterTokens(variable ? position.text : '', symbols.map(s => s.name));
}*/

export function filterTokens_startsWith(text: string, candidates: string[]) {
  if(text.trim().length == 0) {
    return candidates;
  } else {
    return candidates.filter(c => c.toLowerCase().startsWith(text.toLowerCase()));
  }
}
/*
export function filterTokens_fuzzySearch(text: string, candidates: string[]) {
  if(text.trim().length == 0) {
    return candidates;
  } else {
    return fuzzysort.go(text, candidates).map(r => r.target);
  }
}*/

export let filterTokens = filterTokens_startsWith;
export function setTokenMatcher(fn) {
  filterTokens = fn;
}

export function getSuggestionsForParseTree(
  parser: StepCodeParser, parseTree: ParseTree, symbolTableFn: () => SymbolTable, position: TokenPosition) {
  let core = new CodeCompletionCore(parser);
  let ignored: number[] = [];
  //ignored.push(); //We don't handle labels for simplicity
  core.ignoredTokens = new Set(ignored);
  core.preferredRules = new Set([]);
  let candidates = core.collectCandidates(position.index);

  let completions = [];
  /*if (candidates.rules.has(KotlinParser.RULE_variableRead) ||
    candidates.rules.has(KotlinParser.RULE_suggestArgument)) {
    completions.push(...suggestVariables(symbolTableFn(), position));
  }*/
  let tokens = [];
  candidates.tokens.forEach((_, k) => {
    if (k == StepCodeParser.IDENT) {
      //Skip, we’ve already handled it above
    } else {
      const symbolicName = parser.vocabulary.getSymbolicName(k);
      if (symbolicName) {
        tokens.push(symbolicName.toLowerCase());
      }
    }
  });
  const isIgnoredToken =
    position.context instanceof TerminalNode &&
    ignored.indexOf(position.context.symbol.type) >= 0;
  const textToMatch = isIgnoredToken ? '' : position.text;
  completions.push(...filterTokens(textToMatch, tokens));
  return completions;
}

export function getSuggestions(
  code: string, caretPosition: CaretPosition, computeTokenPosition: ComputeTokenPositionFunction) {
  let input = CharStreams.fromString(code);
  let lexer = new StepCodeLexer(input);
  let tokenStream = new CommonTokenStream(lexer);
  let parser = new StepCodeParser(tokenStream);

  let parseTree = parser.program();

  let position = computeTokenPosition(parseTree, tokenStream, caretPosition);
  console.log(position?.text);
  if(!position) {
    return [];
  }
  return getSuggestionsForParseTree(
    parser, parseTree, () => new SymbolTableVisitor().visit(parseTree)!, position);
}