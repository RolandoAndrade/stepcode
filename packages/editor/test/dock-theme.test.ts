import { readFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DOCK_THEME, HEADER_HEIGHT } from '../src/shell/dock/theme'

describe('dock theme', () => {
  const css = readFileSync(
    fileURLToPath(new NodeURL('../src/shell/dock/dock.css', import.meta.url)),
    'utf8',
  )

  it('names the class the stylesheet defines and maps every dv variable to a token', () => {
    expect(DOCK_THEME.className).toBe('sc-dock')
    expect(css).toContain('.sc-dock {')
    for (const line of css.split('\n').filter((l) => l.trim().startsWith('--dv-'))) {
      expect(line, line).toMatch(/var\(--sc-[a-z-]+\)|\d+px|none|0/)
    }
    expect(css).toContain(`--dv-tabs-and-actions-container-height: ${HEADER_HEIGHT}px`)
  })

  it("never compounds our classes onto dockview's tab wrapper", () => {
    // The React tab is mounted *inside* `.dv-tab`, so `.dv-tab.sc-…` can never match.
    expect(css).not.toMatch(/\.dv-tab\.sc-/)
    expect(css).toContain('.sc-dock .sc-tab-active::after')
  })
})
