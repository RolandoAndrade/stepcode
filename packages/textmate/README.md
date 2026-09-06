# @stepcode/textmate

TextMate grammars for StepCode, generated from `@stepcode/profiles`. Keywords are profile data,
so the grammar is too: `es`, `en` and `pseint` ship ready-made, and any resolved profile can get
its own.

```ts
import { createHighlighter } from 'shiki'
import { grammars } from '@stepcode/textmate'

const highlighter = await createHighlighter({ langs: [...grammars], themes: ['github-light'] })
highlighter.codeToHtml(source, { lang: 'stepcode', theme: 'github-light' })
```

| Export | Fence / `lang` | Scope |
|---|---|---|
| `stepcode` | `stepcode` | `source.stepcode` (the `es` profile) |
| `stepcodeEn` | `stepcode-en` | `source.stepcode.en` |
| `stepcodePseint` | `stepcode-pseint` | `source.stepcode.pseint` |

The same three are available as JSON: `@stepcode/textmate/grammars/stepcode.json` and so on.

Astro (`astro.config.mjs`):

```js
import { grammars } from '@stepcode/textmate'

export default defineConfig({
  markdown: { shikiConfig: { langs: [...grammars] } },
})
```

A custom profile:

```ts
import { builtinProfiles, resolveProfile } from '@stepcode/profiles'
import { generateGrammar } from '@stepcode/textmate'

const grammar = generateGrammar(
  resolveProfile({ id: 'clase', extends: 'es', keywords: { if: ['Cuando'] } }, builtinProfiles),
  { name: 'stepcode-clase', scopeName: 'source.stepcode.clase' },
)
```

## Scopes

Control keywords `keyword.control`, definition keywords `storage.type`, `Por Referencia` /
`Por Valor` `storage.modifier`, input and output `keyword.other.io`, word operators
`keyword.operator.word`, booleans `constant.language.boolean`, types `support.type.primitive`,
builtins `support.function.builtin`, numbers `constant.numeric.{integer,real}`, strings
`string.quoted.{double,single}`, comments `comment.line`, symbol operators
`keyword.operator.{assignment,comparison,arithmetic}`, punctuation `punctuation.*`, subprogram
and program names `entity.name.function`, call names `entity.name.function.call`, names in a
`Definir` list `variable.other.definition`, other identifiers `variable.other`. Every scope ends
in `.stepcode`.

## Limits

The grammar is line-based: a multi-word keyword split across lines is not matched. Accent
folding covers the Latin-1 marks (`á`, `è`, `ô`, `ü`, `ç`…). Calls and definitions are
heuristics (an identifier before `(`, the names after `Definir`); there are no folding markers.

See `docs/superpowers/specs/2026-09-06-textmate-design.md` for the design.
