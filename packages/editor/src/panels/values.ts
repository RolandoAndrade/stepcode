import type { ResolvedProfile } from '@stepcode/profiles'
import { type ArrayValue, type FrameVariable, renderValue, type Scalar } from 'stepcode'
import type { Strings } from '../strings'

export const ARRAY_LIMIT = 100

/**
 * Spec §7.3: `[a, b, c]`, nested per rank, holes as `unassigned`, at most `limit` cells followed
 * by `more(rest)` inside the innermost list that overflowed.
 */
export function renderArray(
  value: ArrayValue,
  renderScalar: (scalar: Scalar) => string,
  unassigned: string,
  more: (count: number) => string,
  limit: number = ARRAY_LIMIT,
): string {
  const { dims, data } = value
  const total = data.length
  let used = 0
  const strides: number[] = []
  let stride = 1
  for (let i = dims.length - 1; i >= 0; i--) {
    strides[i] = stride
    stride *= dims[i] ?? 1
  }
  const render = (dimension: number, offset: number): string | null => {
    if (used >= limit) return null
    const size = dims[dimension] ?? 0
    const step = strides[dimension] ?? 1
    const parts: string[] = []
    for (let i = 0; i < size; i++) {
      if (dimension === dims.length - 1) {
        if (used >= limit) {
          parts.push(more(total - used))
          break
        }
        used++
        const cell = data[offset + i]
        parts.push(cell === undefined ? unassigned : renderScalar(cell))
      } else {
        const inner = render(dimension + 1, offset + i * step)
        if (inner === null) {
          parts.push(`[${more(total - used)}]`)
          break
        }
        parts.push(inner)
      }
    }
    return `[${parts.join(', ')}]`
  }
  return render(0, 0) ?? '[]'
}

/** A frame variable's value column. */
export function valueLabel(
  variable: FrameVariable,
  profile: ResolvedProfile,
  strings: Strings,
): string {
  const { value, type } = variable
  if (value === undefined) return strings.variables.unassigned
  if (typeof value === 'object') {
    const element = { kind: 'scalar', name: value.element } as const
    return renderArray(
      value,
      (scalar) => renderValue(scalar, element, profile),
      strings.variables.unassigned,
      strings.variables.more,
    )
  }
  if (type.kind !== 'scalar') return String(value)
  return renderValue(value, type, profile)
}
