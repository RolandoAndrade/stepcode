export interface ExampleHeader {
  readonly title: string
  readonly description: string
  readonly body: string
}

const HEADER_LINE = /^\/\/\s*(t[ií]tulo|descripci[oó]n)\s*:\s*(.*)$/i

/** Spec §8.3: two optional `//` header lines at the top; the rest is the program. */
export function parseHeader(text: string): ExampleHeader {
  const lines = text.split('\n')
  let title = ''
  let description = ''
  let index = 0
  while (index < lines.length) {
    const match = HEADER_LINE.exec(lines[index] ?? '')
    if (match === null) break
    const key = (match[1] ?? '').toLowerCase()
    const value = (match[2] ?? '').trim()
    if (key.startsWith('t')) title = value
    else description = value
    index++
  }
  return { title, description, body: lines.slice(index).join('\n') }
}
