/**
 * The package's public surface: spec §3 and nothing else. Every other module keeps its own
 * exports for the tests and for this barrel; they are not part of the API.
 */
export const packageName = '@stepcode/codemirror'

export { stepcodeCompletion } from './completion'
export {
  breakpointLines,
  breakpoints,
  breakpointsChanged,
  currentLine,
  currentLineOf,
  debug,
  setBreakpoints,
  setCurrentLine,
  toggleBreakpoint,
} from './debug'
export { goToDefinition, stepcodeKeymap } from './definition'
export { stepcodeHover } from './hover'
export { stepcodeDiagnostics, stepcodeLint } from './lint'
export { stepcodeBlockMatching } from './matching'
export type { StepcodeOptions } from './options'
export { compileResultAt, stepcodeLanguage, treeDataAt } from './parser'
export { stepcodeSignatureHelp } from './signature'
export { stepcode } from './stepcode'
export type { TreeData } from './tree'
