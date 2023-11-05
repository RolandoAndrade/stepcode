type Props = {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  message: string;
}

export class StepCodeError {
  public readonly startLine: number;
  public readonly startColumn: number;
  public readonly endLine: number;
  public readonly endColumn: number;
  public readonly message: string;

  constructor({ startLine, startColumn, endLine, endColumn, message }: Props) {
    this.startLine = startLine;
    this.startColumn = startColumn;
    this.endLine = endLine;
    this.endColumn = endColumn;
    this.message = message;
  }


}