import { profiles } from '@stepcode/profiles'
import { generateGrammar } from './generate'
import type { TextMateGrammar } from './types'

export const packageName = '@stepcode/textmate'

export { generateGrammar } from './generate'
export type { GenerateOptions, TextMateGrammar, TextMateRule } from './types'

/** The `es` profile: fence ```stepcode, scope `source.stepcode`. */
export const stepcode: TextMateGrammar = generateGrammar(profiles.es, {
  name: 'stepcode',
  scopeName: 'source.stepcode',
  displayName: 'StepCode',
})

/** The `en` profile: fence ```stepcode-en, scope `source.stepcode.en`. */
export const stepcodeEn: TextMateGrammar = generateGrammar(profiles.en, {
  name: 'stepcode-en',
  scopeName: 'source.stepcode.en',
  displayName: 'StepCode (English)',
})

/** The `pseint` profile: fence ```stepcode-pseint, scope `source.stepcode.pseint`. */
export const stepcodePseint: TextMateGrammar = generateGrammar(profiles.pseint, {
  name: 'stepcode-pseint',
  scopeName: 'source.stepcode.pseint',
  displayName: 'StepCode (PSeInt)',
})

/** All three, for `createHighlighter({ langs: [...grammars] })`. */
export const grammars: readonly TextMateGrammar[] = [stepcode, stepcodeEn, stepcodePseint]
