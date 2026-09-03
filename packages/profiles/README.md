# @stepcode/profiles

Keyword profiles for the StepCode language. A profile is JSON that spells every construct,
type, operator and builtin, plus options such as `indexBase` or `requireSemicolons`. The
construct set is fixed by the language; a profile renames, it does not reshape.

```ts
import { profiles, resolveProfile, builtinProfiles } from '@stepcode/profiles'

profiles.es.keywords.if          // ['Si']
profiles.pseint.options          // es defaults + PSeInt's flexible options

const clase = resolveProfile(
  { id: 'clase', extends: 'es', keywords: { if: ['Cuando'] } },
  builtinProfiles,
)
clase.lookup.get(clase.normalize('cuando'))   // { kind: 'keyword', key: 'if' }
```

`resolveProfile` validates the JSON (`ProfileError` with a `code` and `path`), follows
`extends`, fills option defaults, normalizes spellings, rejects collisions, and returns a
frozen profile with the lookup table the lexer uses. `profileJsonSchema` is the JSON Schema
for editor tooling.

See `docs/superpowers/specs/2026-09-03-profiles-design.md` for the full construct inventory.
