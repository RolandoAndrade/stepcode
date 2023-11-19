import { AbstractParseTreeVisitor } from 'antlr4ng';
import { ScopedSymbol, SymbolTable } from 'antlr4-c3';

export class SymbolTableVisitor extends AbstractParseTreeVisitor<SymbolTable> {
  constructor(
    protected readonly symbolTable: SymbolTable = new SymbolTable("", {}),
    protected scope = symbolTable.addNewSymbolOfType(ScopedSymbol, undefined)) {
    super();
  }

  defaultResult() {
    return this.symbolTable;
  }
}