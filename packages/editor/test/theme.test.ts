// @vitest-environment happy-dom
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyTheme,
  contrastRatio,
  HEX_TOKENS,
  parseTokens,
  resolveInitialTheme,
  TOKEN_NAMES,
} from '../src/theme/theme'
import { THEMES } from '../src/theme/types'

const pkgRoot = fileURLToPath(new NodeURL('..', import.meta.url))
const srcRoot = join(pkgRoot, 'src')
const tokensCss = readFileSync(join(srcRoot, 'theme', 'tokens.css'), 'utf8')
const tokens = parseTokens(tokensCss)

const NEW_TOKENS = ['accent-soft', 'overlay', 'shadow', 'changed'] as const

describe('tokens.css (4b)', () => {
  it('defines the four shell tokens in both themes', () => {
    expect(TOKEN_NAMES).toHaveLength(28)
    for (const theme of THEMES) {
      for (const name of NEW_TOKENS) expect(tokens[theme][name], `${theme} ${name}`).toBeDefined()
      expect(Object.keys(tokens[theme]).sort()).toEqual([...TOKEN_NAMES].sort())
    }
  })

  it('spells hex tokens as six-digit hex and overlay tokens as rgba', () => {
    for (const theme of THEMES) {
      for (const name of TOKEN_NAMES) {
        const value = tokens[theme][name] ?? ''
        if (HEX_TOKENS.includes(name)) expect(value, name).toMatch(/^#[0-9a-f]{6}$/)
        else expect(value, name).toMatch(/^rgba\(\d+,\s?\d+,\s?\d+,\s?0\.\d+\)$/)
      }
    }
  })

  it('uses the canonical One Light and One Dark values', () => {
    expect(tokens.light.bg).toBe('#fafafa')
    expect(tokens.light['syn-keyword']).toBe('#a626a4')
    expect(tokens.light.caret).toBe('#526fff')
    expect(tokens.dark.bg).toBe('#282c34')
    expect(tokens.dark['syn-keyword']).toBe('#c678dd')
    expect(tokens.dark.caret).toBe('#528bff')
  })

  it('keeps text readable: 4.5:1 for fg, 3:1 for syntax and status colors', () => {
    for (const theme of THEMES) {
      const t = tokens[theme]
      const bg = t.bg ?? ''
      const surface = t.surface ?? ''
      expect(contrastRatio(t.fg ?? '', bg), `${theme} fg`).toBeGreaterThanOrEqual(4.5)
      for (const name of TOKEN_NAMES) {
        if (!name.startsWith('syn-') || name === 'syn-comment') continue
        expect(contrastRatio(t[name] ?? '', bg), `${theme} ${name}`).toBeGreaterThanOrEqual(3)
      }
      for (const name of ['error', 'warning', 'success', 'accent'] as const) {
        expect(contrastRatio(t[name] ?? '', surface), `${theme} ${name}`).toBeGreaterThanOrEqual(3)
      }
    }
  })
})

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const COLOR_LITERAL =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:white|black|red|blue|gray|grey)\b/

describe('tokens only', () => {
  it('has no color literal outside tokens.css', () => {
    const offenders = walk(srcRoot)
      .filter((file) => /\.(tsx?|css)$/.test(file) && !file.endsWith('tokens.css'))
      .filter((file) => COLOR_LITERAL.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(srcRoot.length + 1))
    expect(offenders).toEqual([])
  })
})

describe('fonts', () => {
  it('ships JetBrains Mono with its licence', () => {
    for (const file of ['JetBrainsMono-Regular.woff2', 'JetBrainsMono-Bold.woff2', 'OFL.txt']) {
      expect(statSync(join(pkgRoot, 'public', 'fonts', file)).size).toBeGreaterThan(1000)
    }
    const css = readFileSync(join(srcRoot, 'index.css'), 'utf8')
    expect(css).toContain('@font-face')
    expect(css).toContain('/fonts/JetBrainsMono-Regular.woff2')
    expect(css).toContain('font-variant-ligatures: none')
  })
})

describe('contrastRatio', () => {
  it('follows WCAG 2', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0)
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(contrastRatio('#808080', '#808080')).toBe(1)
    expect(contrastRatio('#383a42', '#fafafa')).toBeCloseTo(10.86, 1)
  })
})

describe('resolveInitialTheme', () => {
  it('follows prefers-color-scheme and defaults to light', () => {
    expect(resolveInitialTheme(() => ({ matches: true }))).toBe('dark')
    expect(resolveInitialTheme(() => ({ matches: false }))).toBe('light')
    expect(resolveInitialTheme(undefined)).toBe('light')
  })
})

describe('applyTheme', () => {
  it('stamps the attribute for dark, removes it for light, and sets color-scheme', () => {
    const root = document.createElement('div')
    applyTheme('dark', root)
    expect(root.dataset.theme).toBe('dark')
    expect(root.style.colorScheme).toBe('dark')
    applyTheme('light', root)
    expect(root.dataset.theme).toBeUndefined()
    expect(root.style.colorScheme).toBe('light')
  })

  it('targets the document root by default', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })
})

describe('index.css', () => {
  it('imports the tokens and maps them for Tailwind', () => {
    const css = readFileSync(join(srcRoot, 'index.css'), 'utf8')
    expect(css).toContain('@import "tailwindcss"')
    expect(css).toContain('@import "./theme/tokens.css"')
    for (const [utility, token] of [
      ['bg', 'bg'],
      ['surface', 'surface'],
      ['surface-raised', 'surface-raised'],
      ['border', 'border'],
      ['fg', 'fg'],
      ['muted', 'fg-muted'],
      ['accent', 'accent'],
      ['selection', 'selection'],
      ['error', 'error'],
      ['warning', 'warning'],
      ['success', 'success'],
    ]) {
      expect(css).toContain(`--color-${utility}: var(--sc-${token})`)
    }
  })
})

describe('no raw colors outside tokens.css', () => {
  const files: string[] = []
  const walkForColors = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walkForColors(path)
      else if (/\.(ts|tsx|css)$/.test(name) && !path.endsWith(join('theme', 'tokens.css')))
        files.push(path)
    }
  }
  walkForColors(srcRoot)

  it.each(files)('%s has no hex or rgb color', (file) => {
    const text = readFileSync(file, 'utf8')
    expect(text).not.toMatch(/#[0-9a-fA-F]{6}\b/)
    expect(text).not.toMatch(/#[0-9a-fA-F]{3}\b(?![\w-])/)
    expect(text).not.toMatch(/\brgba?\(/)
  })
})
