import type { BuiltinKey, ResolvedProfile } from '@stepcode/profiles'
import type { Span } from '../source/index'
import { BOOLEAN, REAL, STRING } from '../types/type'
import { renderValue } from './render'
import { checkIndex, fail, parseReal, type Scalar } from './value'

export interface BuiltinContext {
  readonly profile: ResolvedProfile
  /** `options.random`: one value consumed per `random` / `randomBetween` call (§5.8). */
  readonly random: () => number
  readonly indexBase: number
  /** One span per argument: E4007 and `substring`'s E4001 point at the offending argument. */
  readonly spans: readonly Span[]
  /** `nameOf` of each argument, `''` when it has none: `substring`'s E4001 names the text. */
  readonly names: readonly string[]
}

const NO_SPAN: Span = { start: 0, end: 0 }

function spanAt(ctx: BuiltinContext, index: number): Span {
  return ctx.spans[index] ?? NO_SPAN
}

function reject(
  ctx: BuiltinContext,
  key: BuiltinKey,
  index: number,
  hint: 'negative' | 'nonPositive' | 'domain' | 'range' | 'number',
  text?: string,
): never {
  return fail(
    'E4007',
    spanAt(ctx, index),
    text === undefined ? { builtin: key, hint } : { builtin: key, hint, text },
  )
}

const num = (args: readonly Scalar[], index: number): number => Number(args[index] ?? 0)
const str = (args: readonly Scalar[], index: number): string => String(args[index] ?? '')

/**
 * §5.8: the bodies. Arity and result types are the checker's business (`BUILTIN_SIGNATURES`);
 * by the time a call reaches here it has the right number of arguments of the right classes.
 * Nothing here yields, so a builtin is plain synchronous code inside an expression generator.
 */
export function callBuiltin(key: BuiltinKey, args: readonly Scalar[], ctx: BuiltinContext): Scalar {
  switch (key) {
    case 'abs':
      return Math.abs(num(args, 0))
    case 'sqrt': {
      const x = num(args, 0)
      if (x < 0) reject(ctx, key, 0, 'negative')
      return Math.sqrt(x)
    }
    case 'ln': {
      const x = num(args, 0)
      if (x <= 0) reject(ctx, key, 0, 'nonPositive')
      return Math.log(x)
    }
    case 'exp':
      return Math.exp(num(args, 0))
    case 'sin':
      return Math.sin(num(args, 0))
    case 'cos':
      return Math.cos(num(args, 0))
    case 'tan':
      return Math.tan(num(args, 0))
    case 'asin':
    case 'acos': {
      const x = num(args, 0)
      if (Math.abs(x) > 1) reject(ctx, key, 0, 'domain')
      return key === 'asin' ? Math.asin(x) : Math.acos(x)
    }
    case 'atan':
      return Math.atan(num(args, 0))
    case 'trunc':
      return Math.trunc(num(args, 0))
    case 'round': {
      // Half away from zero, not JS's half-up: round(-1.5) is -2 (§5.8, §9).
      const x = num(args, 0)
      return x === 0 ? 0 : Math.sign(x) * Math.round(Math.abs(x))
    }
    case 'random':
      return ctx.random()
    case 'randomBetween': {
      const a = num(args, 0)
      const b = num(args, 1)
      if (a > b) reject(ctx, key, 0, 'range')
      return a + Math.floor(ctx.random() * (b - a + 1))
    }
    case 'pi':
      return Math.PI
    case 'length':
      return [...str(args, 0)].length
    case 'upper':
      return str(args, 0).toUpperCase()
    case 'lower':
      return str(args, 0).toLowerCase()
    case 'substring': {
      const points = [...str(args, 0)]
      const ini = num(args, 1)
      const fin = num(args, 2)
      // The corpus leans on `Subcadena(s, 1, 0)` and `Subcadena(s, n + 1, n)` being "" (§5.8).
      if (ini > fin) return ''
      const name = ctx.names[0] ?? ''
      checkIndex(ini, points.length, ctx.indexBase, spanAt(ctx, 1), name)
      checkIndex(fin, points.length, ctx.indexBase, spanAt(ctx, 2), name)
      return points.slice(ini - ctx.indexBase, fin - ctx.indexBase + 1).join('')
    }
    case 'concat':
      return str(args, 0) + str(args, 1)
    case 'toNumber': {
      const text = str(args, 0).trim()
      const value = parseReal(text)
      if (value === undefined) reject(ctx, key, 0, 'number', text)
      return value
    }
    case 'toText': {
      const value = args[0] ?? ''
      const type = typeof value === 'number' ? REAL : typeof value === 'boolean' ? BOOLEAN : STRING
      return renderValue(value, type, ctx.profile)
    }
  }
}
