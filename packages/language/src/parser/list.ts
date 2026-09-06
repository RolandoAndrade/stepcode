import type { ParserContext } from './context'
import { isPunct } from './tokens'

/**
 * `One ("," One)*` — the shape behind an argument list, an index list, a `Definir` name list,
 * a `Escribir` argument list and a `Dimension` size list. Always returns at least one item,
 * and always consumes the `,` before asking for the next one, so it cannot spin however
 * little `parseOne` consumes.
 */
export function parseCommaSeparated<T>(
  ctx: ParserContext,
  parseOne: (ctx: ParserContext) => T,
): T[] {
  const items: T[] = [parseOne(ctx)]
  while (isPunct(ctx.cursor.peek(), ',')) {
    ctx.cursor.next()
    items.push(parseOne(ctx))
  }
  return items
}
