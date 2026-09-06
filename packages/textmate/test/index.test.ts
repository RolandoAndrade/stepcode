import { describe, expect, it } from 'vitest'
import * as api from '../src/index'

describe('@stepcode/textmate', () => {
  it('names itself', () => {
    expect(api.packageName).toBe('@stepcode/textmate')
  })
  it('exports the three builtin grammars with their ids and scopes', () => {
    expect(api.stepcode.name).toBe('stepcode')
    expect(api.stepcode.scopeName).toBe('source.stepcode')
    expect(api.stepcode.displayName).toBe('StepCode')
    expect(api.stepcodeEn.name).toBe('stepcode-en')
    expect(api.stepcodeEn.scopeName).toBe('source.stepcode.en')
    expect(api.stepcodeEn.displayName).toBe('StepCode (English)')
    expect(api.stepcodePseint.name).toBe('stepcode-pseint')
    expect(api.stepcodePseint.scopeName).toBe('source.stepcode.pseint')
    expect(api.stepcodePseint.displayName).toBe('StepCode (PSeInt)')
    expect(api.grammars).toEqual([api.stepcode, api.stepcodeEn, api.stepcodePseint])
  })
  it('pseint differs from es only by its registration fields', () => {
    const { name: _n, scopeName: _s, displayName: _d, ...pseint } = api.stepcodePseint
    const { name: _n2, scopeName: _s2, displayName: _d2, ...es } = api.stepcode
    expect(pseint).toEqual(es)
  })
  it('exports the generator', () => {
    expect(typeof api.generateGrammar).toBe('function')
  })
})
