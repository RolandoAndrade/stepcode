import { expect, it } from 'vitest'
import { profileJsonSchema } from '../src/index'

it('profileJsonSchema is stable', () => {
  expect(profileJsonSchema).toMatchSnapshot()
})
