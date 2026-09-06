import type { LanguageRegistration } from 'shiki'
import { expect, it } from 'vitest'
import { grammars, stepcode } from '../src/index'

// Compile-time: a generated grammar is a Shiki language registration as-is.
const registration: LanguageRegistration = stepcode
const registrations: LanguageRegistration[] = [...grammars]

it('generated grammars type as Shiki language registrations', () => {
  expect(registration.scopeName).toBe('source.stepcode')
  expect(registrations).toHaveLength(3)
})
