import { readFileSync } from 'node:fs'
import {
  type BundledLanguage,
  createHighlighter,
  type Highlighter,
  type LanguageRegistration,
} from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'

export type EngineName = 'javascript' | 'oniguruma'

export interface ScopedToken {
  /** 1-based. */
  line: number
  text: string
  /** The deepest scope of the token. */
  scope: string
}

export function readSample(name: string): string {
  return readFileSync(new URL(`./samples/${name}.stepcode`, import.meta.url), 'utf8')
}

export async function makeHighlighters(
  langs: readonly LanguageRegistration[],
): Promise<Record<EngineName, Highlighter>> {
  const [javascript, oniguruma] = await Promise.all([
    createHighlighter({
      langs: [...langs],
      themes: ['github-light'],
      engine: createJavaScriptRegexEngine({ forgiving: false }),
    }),
    createHighlighter({
      langs: [...langs],
      themes: ['github-light'],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    }),
  ])
  return { javascript, oniguruma }
}

export function scopesOf(highlighter: Highlighter, lang: string, code: string): ScopedToken[] {
  const lines = highlighter.codeToTokensBase(code, {
    lang: lang as BundledLanguage,
    theme: 'github-light',
    includeExplanation: 'scopeName',
  })
  const out: ScopedToken[] = []
  lines.forEach((tokens, index) => {
    for (const token of tokens) {
      for (const part of token.explanation ?? []) {
        const scope = part.scopes.at(-1)?.scopeName ?? ''
        out.push({ line: index + 1, text: part.content, scope })
      }
    }
  })
  return out
}

export function scopeOf(tokens: readonly ScopedToken[], text: string, line?: number): string {
  const found = tokens.find((t) => t.text === text && (line === undefined || t.line === line))
  if (found === undefined)
    throw new Error(`no token ${JSON.stringify(text)}${line ? ` on line ${line}` : ''}`)
  return found.scope
}
