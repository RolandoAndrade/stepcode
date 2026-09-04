import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compile'
import { DIAGNOSTIC_CODES } from '../../src/diagnostics/index'
import { start } from '../../src/interpreter/run'
import { collectRun } from '../helpers'

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

const runtimeDir = join(dir, 'runtime')
const runtimeFiles = readdirSync(runtimeDir)
  .filter((name) => name.endsWith('.stepcode'))
  .sort()

/** `// expect: E4001` then zero or more `// input: <text>` lines, the text after the single space verbatim. */
function runtimeHeader(source: string): { expected: string[]; inputs: string[] } {
  const lines = source.split('\n')
  const expected = expectedCodes(source)
  const inputs: string[] = []
  for (const line of lines.slice(1)) {
    if (!line.startsWith('// input:')) break
    inputs.push(line.slice('// input:'.length + 1))
  }
  return { expected, inputs }
}

describe('the course-guide runtime corpus', () => {
  it('holds one program per runtime code', () => {
    const codes = runtimeFiles.map((file) => file.slice(0, 5).toUpperCase()).sort()
    expect(codes).toEqual(DIAGNOSTIC_CODES.filter((code) => code.startsWith('E4')))
  })

  it.each(runtimeFiles)(
    'runtime/%s compiles clean and ends with exactly the code it declares',
    (file) => {
      const source = readFileSync(join(runtimeDir, file), 'utf8')
      const { expected, inputs } = runtimeHeader(source)
      const program = compile(source, { profile: profiles.es })
      expect(program.diagnostics.filter((one) => one.severity === 'error')).toEqual([])
      const run = start(program, { profile: profiles.es, io: { write: () => {} } })
      const result = collectRun(run, inputs)
      const codes =
        result.kind === 'error'
          ? [result.diagnostic.code]
          : result.kind === 'input' && result.rejected !== undefined
            ? [result.rejected.code]
            : []
      expect(codes).toEqual(expected)
    },
  )
})
