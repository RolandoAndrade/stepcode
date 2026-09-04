import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'

const dir = fileURLToPath(new URL('./guides', import.meta.url))
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

const errorDir = join(dir, 'errors')
const errorFiles = readdirSync(errorDir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

/** The `// expect: E3010 W3002` header, in diagnostic order. */
function expectedCodes(source: string): string[] {
  const first = source.split('\n')[0] ?? ''
  return first.replace('//', '').replace('expect:', '').trim().split(/\s+/)
}

describe('the course-guide corpus under the strict default profile', () => {
  it('covers every guide', () => {
    expect(files.length).toBeGreaterThanOrEqual(40)
  })

  it.each(files)('%s compiles with no diagnostic at all', (file) => {
    const source = readFileSync(join(dir, file), 'utf8')
    const { diagnostics } = compile(source, { profile: profiles.es })
    expect(
      diagnostics.map((one) => `${one.code}@${source.slice(one.span.start, one.span.end)}`),
    ).toEqual([])
  })
})

describe('the course-guide error corpus', () => {
  it('covers many distinct mistakes', () => {
    expect(errorFiles.length).toBeGreaterThanOrEqual(20)
  })

  it.each(errorFiles)('errors/%s reports exactly the mistake it declares', (file) => {
    const source = readFileSync(join(errorDir, file), 'utf8')
    const { diagnostics } = compile(source, { profile: profiles.es })
    expect(diagnostics.map((one) => one.code)).toEqual(expectedCodes(source))
  })
})
