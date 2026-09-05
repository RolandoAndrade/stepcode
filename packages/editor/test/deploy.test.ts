import { readFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new NodeURL(relative, import.meta.url)), 'utf8')

describe('wrangler.jsonc', () => {
  const config = JSON.parse(read('../wrangler.jsonc')) as Record<string, unknown>

  it('describes an assets-only Worker with SPA fallback and preview URLs', () => {
    expect(config.name).toBe('stepcode-editor')
    expect(config.main).toBeUndefined()
    expect(config.assets).toEqual({
      directory: './dist',
      not_found_handling: 'single-page-application',
    })
    expect(config.preview_urls).toBe(true)
    expect(config.workers_dev).toBe(true)
    expect(String(config.compatibility_date)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('pins wrangler so Workers Builds uses the same version', () => {
    const pkg = JSON.parse(read('../package.json')) as { devDependencies: Record<string, string> }
    expect(pkg.devDependencies.wrangler).toMatch(/^\d+\.\d+\.\d+$/)
  })
})

describe('ci.yml', () => {
  it('dry-runs the deploy after the build', () => {
    const ci = read('../../../.github/workflows/ci.yml')
    const build = ci.indexOf('run: pnpm build')
    const dryRun = ci.indexOf('wrangler deploy --dry-run')
    expect(build).toBeGreaterThan(-1)
    expect(dryRun).toBeGreaterThan(build)
  })
})
