import { BUILTIN_KEYS, KEYWORD_KEYS, OPERATOR_KEYS, TYPE_KEYS } from '../src/keys'

const fill = <K extends string>(keys: readonly K[], prefix: string) =>
  Object.fromEntries(keys.map((k, i) => [k, [`${prefix}${i}`]])) as Record<K, string[]>

/** A complete, valid root profile with synthetic spellings (kw0, ty0, op0, fn0, …). */
export const completeInput = () => ({
  id: 'test',
  locale: 'es',
  keywords: { ...fill(KEYWORD_KEYS, 'kw'), case: [] as string[] },
  types: fill(TYPE_KEYS, 'ty'),
  operators: fill(OPERATOR_KEYS, 'op'),
  builtins: fill(BUILTIN_KEYS, 'fn'),
  options: {},
})
