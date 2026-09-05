import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { lintGutter } from '@codemirror/lint'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import { debug, stepcode } from '@stepcode/codemirror'
import type { ResolvedProfile } from '@stepcode/profiles'
import { appHighlighting } from './highlight'
import { appEditorTheme } from './theme'

export interface EditorOptions {
  readonly profile: ResolvedProfile
  readonly locale: string
  readonly readOnly: boolean
  readonly dark: boolean
}

/** Spec §7.1: the three things the panel reconfigures at runtime. */
export interface EditorCompartments {
  readonly language: Compartment
  readonly readOnly: Compartment
  readonly dark: Compartment
}

export function languageExtension(profile: ResolvedProfile, locale: string): Extension {
  return stepcode({ profile, locale })
}

export function readOnlyExtension(readOnly: boolean): Extension {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]
}

export function darkExtension(dark: boolean): Extension {
  return EditorView.darkTheme.of(dark)
}

/** Spec §7.1: the editor's whole extension set, in the order the spec lists. */
export function createExtensions(options: EditorOptions): {
  extensions: Extension
  compartments: EditorCompartments
} {
  const compartments: EditorCompartments = {
    language: new Compartment(),
    readOnly: new Compartment(),
    dark: new Compartment(),
  }
  const extensions: Extension = [
    lineNumbers(),
    history(),
    highlightActiveLine(),
    drawSelection(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    lintGutter(),
    appHighlighting,
    appEditorTheme,
    compartments.language.of(languageExtension(options.profile, options.locale)),
    compartments.readOnly.of(readOnlyExtension(options.readOnly)),
    compartments.dark.of(darkExtension(options.dark)),
    debug(),
  ]
  return { extensions, compartments }
}
