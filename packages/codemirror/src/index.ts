export const packageName = '@stepcode/codemirror'

export { BLOCK_NAMES, closerOf, foldBlock, indentOnInputPatterns } from './blocks'
export { completionSourceFor, stepcodeCompletion } from './completion'
export {
  breakpointLines,
  breakpoints,
  breakpointsChanged,
  currentLine,
  currentLineOf,
  debug,
  mapLineStart,
  setBreakpoints,
  setCurrentLine,
  toggleBreakpoint,
} from './debug'
export { definitionAt, goToDefinition, stepcodeKeymap } from './definition'
export type { HoverInfo } from './hover'
export { hoverInfoAt, hoverSource, stepcodeHover } from './hover'
export { stepcodeDiagnostics, stepcodeLint, widen } from './lint'
export { stepcodeBlockMatching } from './matching'
export {
  IDENTIFIER_NAMES,
  keywordNodeName,
  LEAF_NAMES,
  MATCHING_PAIRS,
  NODE_NAMES,
  nodeId,
  nodeSet,
  STRUCTURE_NAMES,
} from './nodes'
export type { StepcodeOptions } from './options'
export { compileResultAt, stepcodeLanguage, treeDataAt } from './parser'
export type { Signature } from './signature'
export { signatureAt, stepcodeSignatureHelp } from './signature'
export type { OpenerKey } from './snippets'
export { blockSnippets, blockTemplates, OPENER_KEYS } from './snippets'
export { stepcode } from './stepcode'
export type { PlaceholderKey, Strings } from './strings'
export { stringsFor } from './strings'
export type { SignaturePart } from './symbols'
export {
  builtinKeyAt,
  builtinSignatureParts,
  identifierLeafAt,
  scopeAt,
  signatureText,
  symbolAt,
  symbolLabel,
  visibleSymbols,
} from './symbols'
export { stepcodeBaseTheme } from './theme'
export type { TreeData } from './tree'
export { buildTree, compileProp } from './tree'
