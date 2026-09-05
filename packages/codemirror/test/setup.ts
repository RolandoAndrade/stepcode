// happy-dom implements neither `Range.getClientRects` nor `getBoundingClientRect` on ranges,
// and CodeMirror measures through both. Under Node (`document` undefined) nothing to patch.
const RECT = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }

if (typeof document !== 'undefined' && typeof Range !== 'undefined') {
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
