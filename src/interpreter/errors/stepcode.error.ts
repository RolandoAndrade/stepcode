type Props = {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  message: string;
}

export class StepCodeError {
  protected startLine: number;
  protected startColumn: number;
  protected endLine: number;
  protected endColumn: number;
  protected message: string;

  constructor({ startLine, startColumn, endLine, endColumn, message }: Props) {
    this.startLine = startLine;
    this.startColumn = startColumn;
    this.endLine = endLine;
    this.endColumn = endColumn;
    this.message = message;
  }


}