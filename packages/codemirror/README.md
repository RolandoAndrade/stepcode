# @stepcode/codemirror

CodeMirror 6 language support for [StepCode](https://github.com/RolandoAndrade/stepcode),
built on the same parser and checker the runtime uses, plus the editor-side debugging
extensions. No worker, no interpreter: a host wires those.

```ts
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { lintGutter } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { breakpointLines, breakpointsChanged, debug, setCurrentLine, stepcode } from '@stepcode/codemirror'
import { profiles } from '@stepcode/profiles'

const view = new EditorView({
  state: EditorState.create({
    doc: 'Proceso hola\n  Escribir "hola";\nFinProceso',
    extensions: [
      stepcode({ profile: profiles.es }),
      debug(),
      // the host's choices:
      syntaxHighlighting(defaultHighlightStyle),
      lintGutter(),
      lineNumbers(),
      EditorView.updateListener.of((update) => {
        if (breakpointsChanged(update)) console.log(breakpointLines(update.state))
      }),
    ],
  }),
  parent: document.body,
})

// from a paused run:
view.dispatch({ effects: setCurrentLine.of(2) })
```

## What `stepcode()` bundles

One `LanguageSupport` per profile: the syntax tree (compiled by `stepcode`'s `compile` inside
a Lezer parser, so highlighting, diagnostics and completion never disagree), lint, folding,
indentation, block matching (`Si` ↔ `FinSi`), completion with block snippets, signature help,
hover, `F12` go to definition, and `←` for a typed `<-`. Switch profiles by wrapping it in a `Compartment`.

Every piece is also exported alone: `stepcodeLanguage`, `stepcodeLint`, `stepcodeCompletion`,
`stepcodeSignatureHelp`, `stepcodeHover`, `stepcodeBlockMatching`, `arrowInput`,
`stepcodeKeymap`.
`compileResultAt(state)` hands back the `CompileResult` the tree was built from, `treeDataAt(state)`
adds the offset maps the features use, and `stepcodeDiagnostics(state, options)` is the lint
mapping without the linter, for a host's own Problems panel.

Not included on purpose: a highlight style, the lint gutter, line numbers, history, the
default keymap.

## Debugging

`debug()` (or `breakpoints()` and `currentLine()` separately) is pure editor state:

- a breakpoint gutter — click to toggle; `breakpointLines(state)` reads the lines,
  `setBreakpoints.of(lines)` / `toggleBreakpoint.of({ line })` change them,
  `breakpointsChanged(update)` tells an update listener when to resend them;
- a current-line marker — `setCurrentLine.of(line | null)` highlights the line, marks the
  gutter and scrolls it into view; `currentLineOf(state)` reads it back.

Markers follow their lines through edits and vanish when the line is deleted.

## Styling

The bundle ships a base theme, so the CSS class hooks are there to override: the breakpoint
gutter (`.cm-stepcode-breakpoints`, `.cm-stepcode-breakpoint`), the current line
(`.cm-stepcode-current-line`, `.cm-stepcode-current-line-marker`), the hover and signature
tooltips (`.cm-stepcode-hover`, `.cm-stepcode-signature`, `.cm-stepcode-signature-active`),
and the matching keyword pair (`.cm-matchingBracket`, `.cm-nonmatchingBracket`).

## Strings

Diagnostics render through `stepcode`'s catalogs; the few strings this package adds (symbol
kinds, "declared on line", snippet placeholders) come from its own table, which covers `es` and
`en` and falls back to `en`. `stepcode({ profile, locale })` defaults `locale` to the profile's.
