// @vitest-environment happy-dom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { About } from '../src/dialogs/About'
import { APP_VERSION } from '../src/version'
import { renderWithStore, storeWith } from './render'

describe('About', () => {
  it('shows version and links', () => {
    const { store } = storeWith({ dialog: 'about' })
    renderWithStore(
      <About
        repository="https://github.com/RolandoAndrade/stepcode"
        academy="https://stepcode.online"
      />,
      store,
    )
    expect(screen.getByText(`Versión ${APP_VERSION}`)).toBeDefined()
    expect(screen.getByRole('link', { name: 'Repositorio' }).getAttribute('href')).toContain(
      'github',
    )
  })
})
