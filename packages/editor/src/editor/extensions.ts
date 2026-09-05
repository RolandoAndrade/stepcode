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
import type { EditorSettings } from '../store/settings'
import { appHighlighting } from './highlight'
import { appEditorTheme } from './theme'

export interface EditorOptions {
  readonly profile: ResolvedProfile
  readonly locale: string
  readonly readOnly: boolean
  readonly dark: boolean
  readonly settings: EditorSettings
}

/** Spec §7.1: the four things the panel reconfigures at runtime. */
export interface EditorCompartments {
  readonly language: Compartment
  readonly readOnly: Compartment
  readonly dark: Compartment
  readonly settings: Compartment
}

export function languageExtension(
  profile: ResolvedProfile,
  locale: string,
  completion = true,
): Extension {
  return stepcode({ profile, locale, completion })
}

export function readOnlyExtension(readOnly: boolean): Extension {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]
}

export function darkExtension(dark: boolean): Extension {
  return EditorView.darkTheme.of(dark)
}

/** Spec §6.2: everything the Editor section of settings changes, as one reconfigurable unit. */
export function settingsExtension(
  settings: EditorSettings,
  profile: ResolvedProfile,
  locale: string,
): Extension {
  return [
    settings.lineNumbers ? lineNumbers() : [],
    settings.wordWrap ? EditorView.lineWrapping : [],
    settings.highlightLine ? highlightActiveLine() : [],
    EditorState.tabSize.of(settings.tabSize),
    EditorView.theme({
      '&': {
        '--sc-editor-font-size': `${settings.fontSize}px`,
        fontSize: 'var(--sc-editor-font-size)',
      },
    }),
    EditorView.editorAttributes.of({ style: `--sc-editor-font-size: ${settings.fontSize}px` }),
    languageExtension(profile, locale, settings.autocomplete),
  ]
}

/**
 * Spec §7.1: the editor's whole extension set, in the order the spec lists. The `language`
 * compartment stays empty by default — the language support now lives inside `settings` (spec
 * §6.2), so its reconfiguration follows the settings section, not the profile, directly. The
 * compartment itself is kept (and exported) only so an owner that needs to reconfigure the raw
 * language extension in isolation — such as this package's own extension tests — still can.
 */
export function createExtensions(options: EditorOptions): {
  extensions: Extension
  compartments: EditorCompartments
} {
  const compartments: EditorCompartments = {
    language: new Compartment(),
    readOnly: new Compartment(),
    dark: new Compartment(),
    settings: new Compartment(),
  }
  const extensions: Extension = [
    history(),
    drawSelection(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    lintGutter(),
    appHighlighting,
    appEditorTheme,
    compartments.language.of([]),
    compartments.readOnly.of(readOnlyExtension(options.readOnly)),
    compartments.dark.of(darkExtension(options.dark)),
    compartments.settings.of(settingsExtension(options.settings, options.profile, options.locale)),
    debug(),
  ]
  return { extensions, compartments }
}
