import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import worker from '../redirect/index.js'

const read = (relative: string): string => readFileSync(new URL(relative, import.meta.url), 'utf8')

describe('the old-hostname redirect Worker', () => {
  it('redirects permanently to stepcode.letsbuildsolutions.com, keeping path and query', () => {
    const response = worker.fetch(
      new Request('https://stepcode.online/embed?example=bucles/for&autorun=1'),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://stepcode.letsbuildsolutions.com/embed?example=bucles/for&autorun=1',
    )
  })

  it('redirects the root of the v1 hostname too', () => {
    const response = worker.fetch(new Request('http://stepcode.rolandoandrade.me/'))
    expect(response.headers.get('location')).toBe('https://stepcode.letsbuildsolutions.com/')
  })

  it('answers the service-worker update check with a worker that unregisters itself', async () => {
    const response = worker.fetch(new Request('https://stepcode.online/sw.js'))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/javascript')
    expect(await response.text()).toContain('registration')
  })

  it('is deployed under both old hostnames as custom domains', () => {
    const config = JSON.parse(read('../redirect/wrangler.jsonc')) as Record<string, unknown>
    expect(config.name).toBe('stepcode-subdomain')
    expect(config.main).toBe('./index.js')
    expect(config.routes).toEqual([
      { pattern: 'stepcode.online', zone_name: 'stepcode.online', custom_domain: true },
      {
        pattern: 'stepcode.rolandoandrade.me',
        zone_name: 'rolandoandrade.me',
        custom_domain: true,
      },
    ])
    expect(config.workers_dev).toBe(false)
  })
})
