import { autocompletion } from '@codemirror/autocomplete'
import { foldGutter, indentOnInput, LanguageSupport } from '@codemirror/language'
import { keymap } from '@codemirror/view'
import type { ResolvedProfile } from '@stepcode/profiles'
import { stepcodeCompletion } from './completion'
import { stepcodeKeymap } from './definition'
import { stepcodeHover } from './hover'
import { stepcodeLint } from './lint'
import { stepcodeBlockMatching } from './matching'
import type { StepcodeOptions } from './options'
import { stepcodeLanguage } from './parser'
import { stepcodeSignatureHelp } from './signature'
import { stepcodeBaseTheme } from './theme'

/**
 * Spec §7: everything for one profile. Deliberately absent: a highlight style, the lint
 * gutter, line numbers, history and the default keymap — those are the host's.
 */
export function stepcode(options: {
  profile: ResolvedProfile
  locale?: string
  /** Include the autocompletion extension (default true); the editor's setting turns it off. */
  completion?: boolean
}): LanguageSupport {
  const resolved: StepcodeOptions = {
    profile: options.profile,
    locale: options.locale ?? options.profile.locale,
  }
  return new LanguageSupport(stepcodeLanguage(resolved.profile), [
    stepcodeLint(resolved),
    stepcodeCompletion(resolved),
    stepcodeSignatureHelp(resolved),
    stepcodeHover(resolved),
    stepcodeBlockMatching(),
    ...(options.completion === false ? [] : [autocompletion()]),
    indentOnInput(),
    foldGutter(),
    keymap.of(stepcodeKeymap),
    stepcodeBaseTheme,
  ])
}
