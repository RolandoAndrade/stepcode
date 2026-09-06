import { syntaxTree } from '@codemirror/language'
import { type EditorState, type Extension, StateField } from '@codemirror/state'
import { showTooltip, type Tooltip } from '@codemirror/view'
import type { SyntaxNode } from '@lezer/common'
import type { SubprogramDecl } from 'stepcode'
import type { StepcodeOptions } from './options'
import { treeDataAt } from './parser'
import { stringsFor } from './strings'
import { builtinSignatureParts, type SignaturePart } from './symbols'

export interface Signature {
  /** Where the tooltip anchors: the opening parenthesis. */
  readonly pos: number
  readonly parts: readonly SignaturePart[]
}

/** The innermost call whose argument list contains `pos` (spec §5.8), with its parenthesis. */
function callAround(
  state: EditorState,
  pos: number,
): { node: SyntaxNode; open: SyntaxNode } | null {
  for (
    let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, -1);
    node !== null;
    node = node.parent
  ) {
    if (node.name !== 'Call' && node.name !== 'BuiltinCall') continue
    const open = node.getChild('OpenParen')
    if (open === null || open.to > pos) continue
    const close = node.getChild('CloseParen')
    if (close !== null && pos > close.from) continue
    return { node, open }
  }
  return null
}

/** The number of argument separators of `call` that end at or before `pos`. */
function activeArgument(state: EditorState, call: SyntaxNode, pos: number): number {
  let count = 0
  for (const punct of call.getChildren('Punct')) {
    if (punct.to <= pos && state.doc.sliceString(punct.from, punct.to) === ',') count++
  }
  return count
}

/**
 * Where a header stops: after its parameter list's closing parenthesis. The search stays on
 * the line the parameters end on, and a declaration written without a parameter list at all
 * ends at its name — otherwise a parenthesis in the body would be taken for the list's.
 */
function headerEnd(decl: SubprogramDecl, source: string): number {
  const last = decl.params[decl.params.length - 1]
  const paramsEnd = last === undefined ? decl.name.span.end : last.span.end
  const newline = source.indexOf('\n', paramsEnd)
  const rest = source.slice(paramsEnd, newline < 0 ? source.length : newline)
  if (last === undefined && !rest.trimStart().startsWith('(')) return paramsEnd
  const closeParen = rest.indexOf(')')
  return closeParen < 0 ? paramsEnd : paramsEnd + closeParen + 1
}

/** The header of a declaration, its parameters split out so one can be marked active. */
function headerParts(decl: SubprogramDecl, source: string, active: number): SignaturePart[] {
  const end = headerEnd(decl, source)
  const parts: SignaturePart[] = []
  let cursor = decl.span.start
  decl.params.forEach((param, index) => {
    if (param.span.start > cursor) {
      parts.push({ text: source.slice(cursor, param.span.start), active: false })
    }
    parts.push({ text: source.slice(param.span.start, param.span.end), active: index === active })
    cursor = param.span.end
  })
  parts.push({ text: source.slice(cursor, end), active: false })
  return parts
}

export function signatureAt(
  state: EditorState,
  pos: number,
  options: StepcodeOptions,
): Signature | null {
  const data = treeDataAt(state)
  const found = callAround(state, pos)
  if (data === null || found === null) return null
  const call = data.calls.get(found.node.from)
  if (call === undefined) return null
  const active = activeArgument(state, found.node, pos)
  if (call.kind === 'BuiltinCall') {
    const parts = builtinSignatureParts(
      call.key,
      options.profile,
      stringsFor(options.locale),
      active,
    )
    return { pos: found.open.from, parts }
  }
  const decl = data.result.calls.get(call)
  if (decl === undefined) return null
  return { pos: found.open.from, parts: headerParts(decl, data.result.source, active) }
}

function tooltipsFor(state: EditorState, options: StepcodeOptions): readonly Tooltip[] {
  const signature = signatureAt(state, state.selection.main.head, options)
  if (signature === null) return []
  return [
    {
      pos: signature.pos,
      above: true,
      create: () => {
        const dom = document.createElement('div')
        dom.className = 'cm-stepcode-signature'
        for (const part of signature.parts) {
          const span = document.createElement('span')
          if (part.active) span.className = 'cm-stepcode-signature-active'
          span.textContent = part.text
          dom.appendChild(span)
        }
        return { dom }
      },
    },
  ]
}

/** Spec §5.8: a tooltip field recomputed on selection, document and tree changes. */
export function stepcodeSignatureHelp(options: StepcodeOptions): Extension {
  return StateField.define<readonly Tooltip[]>({
    create: (state) => tooltipsFor(state, options),
    update: (value, tr) =>
      tr.docChanged ||
      tr.selection !== undefined ||
      syntaxTree(tr.state) !== syntaxTree(tr.startState)
        ? tooltipsFor(tr.state, options)
        : value,
    provide: (field) => showTooltip.computeN([field], (state) => state.field(field)),
  })
}
