/** A TextMate rule as vscode-textmate reads it. Structurally a Shiki `RawRule`. */
export interface TextMateRule {
  name?: string
  match?: string
  begin?: string
  end?: string
  captures?: Record<string, TextMateRule>
  beginCaptures?: Record<string, TextMateRule>
  endCaptures?: Record<string, TextMateRule>
  patterns?: TextMateRule[]
  include?: string
}

/** A TextMate grammar as Shiki and VS Code consume it. Structurally a Shiki `LanguageRegistration`. */
export interface TextMateGrammar {
  name: string
  scopeName: string
  displayName?: string
  aliases?: string[]
  patterns: TextMateRule[]
  repository: Record<string, TextMateRule>
}

export interface GenerateOptions {
  /** Language id: the fence name in Markdown, the `lang` passed to Shiki. */
  name: string
  /** `source.<...>`. */
  scopeName: string
  displayName?: string
  aliases?: string[]
}
