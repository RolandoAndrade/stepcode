// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Play } from '../src/ui/icons'
import { IconButton, TooltipProvider } from '../src/ui/Tooltip'

describe('IconButton', () => {
  it('is a labelled button that fires onClick and honours disabled', () => {
    const onClick = vi.fn()
    render(
      <TooltipProvider>
        <IconButton label="Ejecutar" shortcut="F5" onClick={onClick}>
          <Play />
        </IconButton>
        <IconButton label="Detener" onClick={onClick} disabled>
          <Play />
        </IconButton>
      </TooltipProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Detener' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Ejecutar' }).getAttribute('type')).toBe('button')
  })

  it('shows the label and the shortcut in the tooltip on focus', async () => {
    render(
      <TooltipProvider>
        <IconButton label="Ejecutar" shortcut="F5" onClick={() => {}}>
          <Play />
        </IconButton>
      </TooltipProvider>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Ejecutar' }))
    expect(await screen.findByRole('tooltip')).toHaveProperty('textContent', 'Ejecutar · F5')
  })
})
