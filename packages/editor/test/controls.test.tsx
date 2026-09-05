// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Toggle } from '../src/dialogs/Settings/controls'

describe('Toggle', () => {
  it('pins the knob to the left edge of the track so translate-x positions it correctly', () => {
    render(<Toggle label="Wrap" checked={false} onChange={() => {}} />)
    const knob = screen.getByRole('switch', { name: 'Wrap' }).firstElementChild
    expect(knob?.className).toContain('left-0')
  })
})
