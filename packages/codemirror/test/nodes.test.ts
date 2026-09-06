import { NodeProp } from '@lezer/common'
import { KEYWORD_KEYS } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import {
  IDENTIFIER_NAMES,
  keywordNodeName,
  LEAF_NAMES,
  MATCHING_PAIRS,
  NODE_NAMES,
  nodeId,
  nodeSet,
  PUNCT_MATCHING_PAIRS,
  STRUCTURE_NAMES,
} from '../src/nodes'

describe('node names', () => {
  it('PascalCases a keyword key and appends Keyword', () => {
    expect(keywordNodeName('if')).toBe('IfKeyword')
    expect(keywordNodeName('endIf')).toBe('EndIfKeyword')
    expect(keywordNodeName('writeNoNewline')).toBe('WriteNoNewlineKeyword')
  })

  it('has one type per structure name, leaf name and keyword key, all distinct', () => {
    expect(NODE_NAMES.length).toBe(STRUCTURE_NAMES.length + LEAF_NAMES.length + KEYWORD_KEYS.length)
    expect(new Set(NODE_NAMES).size).toBe(NODE_NAMES.length)
    expect(nodeSet.types.length).toBe(NODE_NAMES.length)
  })

  it('ids index the set and Program is the top node', () => {
    for (const name of NODE_NAMES) {
      expect(nodeSet.types[nodeId(name)]?.name).toBe(name)
    }
    expect(nodeSet.types[nodeId('Program')]?.isTop).toBe(true)
    expect(() => nodeId('Nope')).toThrow(/unknown node/)
  })

  it('flags the error types', () => {
    for (const name of ['Error', 'ErrorStmt', 'ErrorExpr']) {
      expect(nodeSet.types[nodeId(name)]?.isError).toBe(true)
    }
    expect(nodeSet.types[nodeId('IfStmt')]?.isError).toBe(false)
  })

  it('lists the four identifier roles as leaves', () => {
    expect([...IDENTIFIER_NAMES]).toEqual([
      'Identifier',
      'VariableDefinition',
      'SubprogramName',
      'CallName',
    ])
    for (const name of IDENTIFIER_NAMES) expect(LEAF_NAMES).toContain(name)
  })

  it('pairs each opener with its closer through closedBy and openedBy', () => {
    expect(MATCHING_PAIRS.length).toBe(8)
    for (const [opener, closer] of MATCHING_PAIRS) {
      const open = nodeSet.types[nodeId(keywordNodeName(opener))]
      const close = nodeSet.types[nodeId(keywordNodeName(closer))]
      expect(open?.prop(NodeProp.closedBy)).toEqual([keywordNodeName(closer)])
      expect(close?.prop(NodeProp.openedBy)).toEqual([keywordNodeName(opener)])
    }
    expect(nodeSet.types[nodeId('ThenKeyword')]?.prop(NodeProp.closedBy)).toBeUndefined()
    expect(nodeSet.types[nodeId('WhileKeyword')]?.prop(NodeProp.openedBy)).toBeUndefined()
  })

  it('pairs parentheses and brackets through closedBy and openedBy too', () => {
    expect(PUNCT_MATCHING_PAIRS.length).toBe(2)
    for (const [opener, closer] of PUNCT_MATCHING_PAIRS) {
      const open = nodeSet.types[nodeId(opener)]
      const close = nodeSet.types[nodeId(closer)]
      expect(open?.prop(NodeProp.closedBy)).toEqual([closer])
      expect(close?.prop(NodeProp.openedBy)).toEqual([opener])
    }
    expect(nodeSet.types[nodeId('OpenParen')]?.prop(NodeProp.closedBy)).toEqual(['CloseParen'])
    expect(nodeSet.types[nodeId('CloseParen')]?.prop(NodeProp.openedBy)).toEqual(['OpenParen'])
    expect(nodeSet.types[nodeId('OpenBracket')]?.prop(NodeProp.closedBy)).toEqual(['CloseBracket'])
    expect(nodeSet.types[nodeId('CloseBracket')]?.prop(NodeProp.openedBy)).toEqual(['OpenBracket'])
  })
})
