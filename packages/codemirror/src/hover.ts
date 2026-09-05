import { syntaxTree } from '@codemirror/language'
import type { EditorState, Extension } from '@codemirror/state'
import { type HoverTooltipSource, hoverTooltip } from '@codemirror/view'
import { KEYWORD_KEYS, type KeywordKey } from '@stepcode/profiles'
import {
  arrayOf,
  type CompileResult,
  LineMap,
  type Symbol as StepSymbol,
  type SubprogramDecl,
  scalar,
  type Type,
  typeToString,
  UNKNOWN,
} from 'stepcode'
import { keywordNodeName } from './nodes'
import type { StepcodeOptions } from './options'
import { treeDataAt } from './parser'
import { type Strings, stringsFor } from './strings'
import {
  builtinKeyAt,
  builtinSignatureParts,
  signatureText,
  symbolAt,
  symbolLabel,
} from './symbols'

const KEYWORD_BY_NODE: ReadonlyMap<string, KeywordKey> = new Map(
  KEYWORD_KEYS.map((key) => [keywordNodeName(key), key]),
)

export interface HoverInfo {
  readonly from: number
  readonly to: number
  readonly lines: readonly string[]
}

/**
 * What a function returns. The subprogram symbol itself is never typed — the checker types the
 * result variable the header names, and type inference writes the inferred type there — so read
 * that symbol, falling back to the declared return type of the `f(): T` form.
 */
function resultType(decl: SubprogramDecl, result: CompileResult): Type {
  const named = decl.returnName === undefined ? undefined : result.symbols.get(decl.returnName)
  if (named !== undefined) return named.type
  const ref = decl.returnType
  if (ref === undefined) return UNKNOWN
  return ref.dimensions.length === 0 ? scalar(ref.base) : arrayOf(ref.base, ref.dimensions.length)
}

/** `<kind> <name>: <type> (por referencia)` — the first hover line (spec §5.9). */
function describe(
  symbol: StepSymbol,
  result: CompileResult,
  options: StepcodeOptions,
  strings: Strings,
): string {
  const name = symbolLabel(symbol)
  const decl = symbol.decl
  if (symbol.kind === 'subprogram') {
    if (decl === undefined || decl.form !== 'function') return `${strings.procedure} ${name}`
    return `${strings.function} ${name}: ${typeToString(resultType(decl, result), options.profile)}`
  }
  const byRef = symbol.byRef === true ? ` (${strings.byReference})` : ''
  const type = typeToString(symbol.type, options.profile)
  return `${strings.kinds[symbol.kind]} ${name}: ${type}${byRef}`
}

export function hoverInfoAt(
  state: EditorState,
  pos: number,
  side: -1 | 1,
  options: StepcodeOptions,
): HoverInfo | null {
  const strings = stringsFor(options.locale)
  const found = symbolAt(state, pos, side)
  if (found !== null) {
    const data = treeDataAt(state)
    // A recovery symbol stands for a name nobody declared (language spec §3.2): the mistake is
    // already on screen as a diagnostic, and there is nothing true to say about the name.
    if (data === null || found.symbol.recovered === true) return null
    const line = new LineMap(data.result.source).positionAt(found.symbol.declaredAt.span.start).line
    return {
      from: found.leaf.from,
      to: found.leaf.to,
      lines: [describe(found.symbol, data.result, options, strings), strings.declaredAt(line)],
    }
  }
  const node = syntaxTree(state).resolveInner(pos, side)
  // A keyword has no signature to show, so its own spelling stands in as the first line.
  const keyword = KEYWORD_BY_NODE.get(node.name)
  if (keyword !== undefined) {
    return {
      from: node.from,
      to: node.to,
      lines: [state.doc.sliceString(node.from, node.to), strings.descriptions.keywords[keyword]],
    }
  }
  if (node.name !== 'BuiltinName') return null
  const key = builtinKeyAt(options.profile, state.doc.sliceString(node.from, node.to))
  if (key === null) return null
  const parts = builtinSignatureParts(key, options.profile, strings)
  return {
    from: node.from,
    to: node.to,
    lines: [signatureText(parts), strings.descriptions.builtins[key]],
  }
}

export function hoverSource(options: StepcodeOptions): HoverTooltipSource {
  return (view, pos, side) => {
    const info = hoverInfoAt(view.state, pos, side, options)
    if (info === null) return null
    return {
      pos: info.from,
      end: info.to,
      above: true,
      create: () => {
        const dom = document.createElement('div')
        dom.className = 'cm-stepcode-hover'
        for (const line of info.lines) {
          const row = document.createElement('div')
          row.textContent = line
          dom.appendChild(row)
        }
        return { dom }
      },
    }
  }
}

/** Spec §5.9. */
export function stepcodeHover(options: StepcodeOptions): Extension {
  return hoverTooltip(hoverSource(options))
}
