// Under happy-dom, Testing Library needs cleanup between tests and CodeMirror measures through
// two Range methods happy-dom does not implement. Under Node (`document` undefined) nothing runs.
export {}

const RECT = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }

if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  const { afterEach } = await import('vitest')
  afterEach(() => {
    cleanup()
  })
  if (typeof Range !== 'undefined') {
    const proto = Range.prototype as unknown as Record<string, unknown>
    if (typeof proto.getClientRects !== 'function') {
      proto.getClientRects = () => ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: [][Symbol.iterator],
      })
    }
    if (typeof proto.getBoundingClientRect !== 'function') {
      proto.getBoundingClientRect = () => ({ ...RECT, toJSON: () => RECT })
    }
  }
}
