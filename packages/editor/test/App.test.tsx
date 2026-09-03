import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../src/App'

describe('App', () => {
  it('renders the StepCode heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'StepCode' })).toBeDefined()
  })

  it('resolves @stepcode/codemirror through the workspace', () => {
    render(<App />)
    expect(screen.getByText('@stepcode/codemirror')).toBeDefined()
  })
})
