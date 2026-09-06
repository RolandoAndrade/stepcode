import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import worker from '../redirect/index.js'

const read = (relative: string): string => readFileSync(new URL(relative, import.meta.url), 'utf8')

describe('the stepcode.rolandoandrade.me redirect Worker', () => {
  it('redirects permanently to stepcode.online, keeping path and query', () => {
    const response = worker.fetch(
      new Request('https://stepcode.rolandoandrade.me/embed?example=bucles/for&autorun=1'),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://stepcode.online/embed?example=bucles/for&autorun=1',
    )
  })

  it('redirects the root too', () => {
    const response = worker.fetch(new Request('http://stepcode.rolandoandrade.me/'))
    expect(response.headers.get('location')).toBe('https://stepcode.online/')
  })

  it('is deployed under the old hostname as a custom domain', () => {
    const config = JSON.parse(read('../redirect/wrangler.jsonc')) as Record<string, unknown>
    expect(config.name).toBe('stepcode-subdomain')
    expect(config.main).toBe('./index.js')
    expect(config.routes).toEqual([
      {
        pattern: 'stepcode.rolandoandrade.me',
        zone_name: 'rolandoandrade.me',
        custom_domain: true,
      },
    ])
    expect(config.workers_dev).toBe(false)
  })
})
