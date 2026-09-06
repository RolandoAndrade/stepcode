// @vitest-environment happy-dom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { About } from '../src/dialogs/About'
import { APP_VERSION } from '../src/version'
import { renderWithStore, storeWith } from './render'

describe('About', () => {
  it('shows version and links', () => {
    const { store } = storeWith({ dialog: 'about' })
    renderWithStore(<About repository="https://github.com/RolandoAndrade/stepcode" />, store)
    expect(screen.getByText(`Versión ${APP_VERSION}`)).toBeDefined()
    expect(screen.getByRole('link', { name: 'Repositorio' }).getAttribute('href')).toContain(
      'github',
    )
    expect(screen.queryByRole('link', { name: 'Academia' })).toBeNull()
  })

  it('shows the academy link when a URL is configured', () => {
    const { store } = storeWith({ dialog: 'about' })
    renderWithStore(<About academy="https://example.test" />, store)
    expect(screen.getByRole('link', { name: 'Academia' }).getAttribute('href')).toBe(
      'https://example.test',
    )
  })

  it('shows the StepCode logo', () => {
    const { store } = storeWith({ dialog: 'about' })
    renderWithStore(<About />, store)
    expect(document.body.querySelector('img')?.getAttribute('src')).toBe('/pwa-64x64.png')
  })
})
