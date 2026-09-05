import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
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

describe('the embed entry', () => {
  it('is a second Vite page whose service worker never hijacks it', () => {
    const config = read('../vite.config.ts')
    expect(config).toContain('embed.html')
    expect(config).toContain('navigateFallbackDenylist')
    expect(config).toContain("globIgnores: ['**/embed.html']")
    expect(config).toContain('/^\\/embed/')
    expect(read('../embed.html')).toContain('/src/embed/main.tsx')
  })

  const dist = fileURLToPath(new NodeURL('../dist/', import.meta.url))
  const built = existsSync(join(dist, 'index.html'))

  // CI runs `pnpm test` before `pnpm build`, so this only asserts against a build that exists;
  // the repo gate (`… && pnpm build && pnpm test`) always runs it.
  it.skipIf(!built)('stays out of the precache and registers no service worker of its own', () => {
    expect(readFileSync(join(dist, 'sw.js'), 'utf8')).not.toContain('embed.html')
    const html = readFileSync(join(dist, 'embed.html'), 'utf8')
    expect(html).not.toContain('serviceWorker')
    expect(html).not.toContain('registerSW')
  })

  it.skipIf(!built)('emits embed.html without pulling its chunk into index.html', () => {
    expect(existsSync(join(dist, 'embed.html'))).toBe(true)
    expect(readFileSync(join(dist, 'index.html'), 'utf8')).not.toMatch(/assets\/embed-/)
    expect(readFileSync(join(dist, 'embed.html'), 'utf8')).toMatch(/assets\/embed-/)
  })
})
