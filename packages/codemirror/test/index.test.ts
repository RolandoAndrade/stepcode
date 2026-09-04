import { LanguageSupport } from '@codemirror/language'
import { describe, expect, it } from 'vitest'
import * as api from '../src/index'
import { es } from './helpers'

/** Spec §3, read statically so the barrel is checked name by name. */
const functions = {
  stepcode: api.stepcode,
  stepcodeLanguage: api.stepcodeLanguage,
  stepcodeLint: api.stepcodeLint,
  stepcodeCompletion: api.stepcodeCompletion,
  stepcodeSignatureHelp: api.stepcodeSignatureHelp,
  stepcodeHover: api.stepcodeHover,
  stepcodeBlockMatching: api.stepcodeBlockMatching,
  goToDefinition: api.goToDefinition,
  compileResultAt: api.compileResultAt,
  treeDataAt: api.treeDataAt,
  debug: api.debug,
  breakpoints: api.breakpoints,
  currentLine: api.currentLine,
  breakpointLines: api.breakpointLines,
  breakpointsChanged: api.breakpointsChanged,
  currentLineOf: api.currentLineOf,
  stringsFor: api.stringsFor,
  buildTree: api.buildTree,
}

describe('@stepcode/codemirror', () => {
  it('exposes its package name', () => {
    expect(api.packageName).toBe('@stepcode/codemirror')
  })

  it('exports the surface of spec §3', () => {
    for (const [name, value] of Object.entries(functions)) {
      expect(typeof value, name).toBe('function')
    }
    expect(Array.isArray(api.stepcodeKeymap)).toBe(true)
    expect(api.toggleBreakpoint).toBeDefined()
    expect(api.setBreakpoints).toBeDefined()
    expect(api.setCurrentLine).toBeDefined()
    expect(api.compileProp).toBeDefined()
    expect(api.stepcodeBaseTheme).toBeDefined()
    expect(api.nodeSet).toBeDefined()
  })

  it('bundles a LanguageSupport per profile', () => {
    const support = api.stepcode({ profile: es })
    expect(support).toBeInstanceOf(LanguageSupport)
    expect(support.language.name).toBe('stepcode')
  })
})
