import type { TypeKey } from '@stepcode/profiles'
import {
  createDiagnostic,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticData,
} from '../diagnostics/index'
import type { Span } from '../source/index'

/** `Entero` and `Real` are numbers, `Cadena` and `Caracter` strings, `Logico` a boolean (§4.1). */
export type Scalar = number | string | boolean

/**
 * One flat row-major buffer, shared by reference: assigning through any alias writes into the
 * same `data`. `dims` holds one size per rank, every size ≥ 1; a hole is `undefined`.
 */
export interface ArrayValue {
  readonly element: TypeKey
  readonly dims: readonly number[]
  readonly data: (Scalar | undefined)[]
}

export type RuntimeValue = Scalar | ArrayValue

/** A variable's storage. A cell slot (`cellSlot`) is one whose accessor reaches into a buffer. */
export interface Slot {
  value: RuntimeValue | undefined
}

export function isArrayValue(value: RuntimeValue | undefined): value is ArrayValue {
  return typeof value === 'object' && value !== null
}

/**
 * The internal exception a runtime diagnostic travels in. Thrown inside the evaluator, caught
 * by the controller, which freezes the frames and turns it into an `error` step result (§5.1).
 * It never escapes the public API.
 */
export class RuntimeError extends Error {
  constructor(readonly diagnostic: Diagnostic) {
    super(diagnostic.code)
    this.name = 'RuntimeError'
  }
}

export function fail(code: DiagnosticCode, span: Span, data: DiagnosticData = {}): never {
  throw new RuntimeError(createDiagnostic(code, span, data))
}

/**
 * A fresh array, every cell unassigned. A size below 1 is E4001 `size` at that size's
 * expression: the checker folds every size (E3023), so no compiled program reaches this, but
 * the allocator guards it anyway (§5.2, §9).
 */
export function allocateArray(
  element: TypeKey,
  dims: readonly number[],
  at: { readonly name: string; readonly spans: readonly Span[] },
): ArrayValue {
  let cells = 1
  dims.forEach((size, index) => {
    if (!Number.isInteger(size) || size < 1) {
      fail('E4001', at.spans[index] ?? { start: 0, end: 0 }, { name: at.name, size, hint: 'size' })
    }
    cells *= size
  })
  return { element, dims: [...dims], data: new Array<Scalar | undefined>(cells).fill(undefined) }
}

/** §5.4: an index must lie in `[indexBase, indexBase + size − 1]`; a negative one is simply out. */
export function checkIndex(
  index: number,
  size: number,
  indexBase: number,
  span: Span,
  name: string,
): void {
  const low = indexBase
  const high = indexBase + size - 1
  if (!Number.isInteger(index) || index < low || index > high) {
    fail('E4001', span, { name, index, low, high })
  }
}

/** §4.1: `offset = Σ (iₖ − b) · Π_{j>k} sⱼ`, for indices that already passed `checkIndex`. */
export function cellOffset(
  dims: readonly number[],
  indices: readonly number[],
  indexBase: number,
): number {
  let offset = 0
  for (let k = 0; k < dims.length; k++) {
    let stride = 1
    for (let j = k + 1; j < dims.length; j++) stride *= dims[j] ?? 1
    offset += ((indices[k] ?? indexBase) - indexBase) * stride
  }
  return offset
}

/** A slot whose value lives in one cell of `array`: what a by-reference `a[i]` binds to (§4.2). */
export function cellSlot(array: ArrayValue, offset: number): Slot {
  return {
    get value(): RuntimeValue | undefined {
      return array.data[offset]
    },
    set value(next: RuntimeValue | undefined) {
      array.data[offset] = isArrayValue(next) ? undefined : next
    },
  }
}

/** §5.7: the `Entero` input grammar. */
export const INTEGER_TEXT = /^[+-]?\d+$/

/** §5.7: the `Real` input grammar — dot only, integers accepted. Shared with `toNumber` (§5.8). */
export const REAL_TEXT = /^[+-]?(\d+\.?\d*|\.\d+)$/

export function parseReal(text: string): number | undefined {
  const trimmed = text.trim()
  return REAL_TEXT.test(trimmed) ? Number(trimmed) : undefined
}
