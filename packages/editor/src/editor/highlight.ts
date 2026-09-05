import { HighlightStyle, syntaxHighlighting, type TagStyle } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { tags as t } from '@lezer/highlight'

/**
 * Spec §8.2 over the tags the language emits (codemirror spec §5.1). Colors are tokens, so the
 * style is theme-agnostic; the dark/light switch happens in CSS. More specific tags come after
 * their base tag so they win where both match.
 */
export const HIGHLIGHT_SPECS: readonly TagStyle[] = [
  {
    tag: [t.controlKeyword, t.definitionKeyword, t.operatorKeyword, t.keyword],
    color: 'var(--sc-syn-keyword)',
    fontWeight: 'bold',
  },
  { tag: t.string, color: 'var(--sc-syn-string)' },
  { tag: [t.number, t.bool], color: 'var(--sc-syn-number)' },
  { tag: t.lineComment, color: 'var(--sc-syn-comment)', fontStyle: 'italic' },
  { tag: t.typeName, color: 'var(--sc-syn-type)' },
  {
    tag: [t.definitionOperator, t.compareOperator, t.arithmeticOperator],
    color: 'var(--sc-syn-operator)',
  },
  { tag: [t.paren, t.squareBracket, t.separator], color: 'var(--sc-fg)' },
  { tag: t.variableName, color: 'var(--sc-syn-variable)' },
  {
    tag: [
      t.definition(t.variableName),
      t.function(t.variableName),
      t.function(t.definition(t.variableName)),
    ],
    color: 'var(--sc-syn-definition)',
  },
  { tag: t.function(t.standard(t.variableName)), color: 'var(--sc-syn-builtin)' },
  { tag: t.invalid, textDecoration: 'underline wavy var(--sc-error)' },
]

export const appHighlightStyle = HighlightStyle.define([...HIGHLIGHT_SPECS])

export const appHighlighting: Extension = syntaxHighlighting(appHighlightStyle)
