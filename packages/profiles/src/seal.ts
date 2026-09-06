/**
 * Returns a `Map` whose `set`/`delete`/`clear` throw `TypeError`. `Object.freeze` does not
 * stop `Map.prototype.set`/`delete`/`clear` (they mutate internal slots, not own properties),
 * so `deepFreeze`-ing a `ResolvedProfile` leaves its lookup tables mutable. The shipped
 * profiles are module-level singletons shared by every caller, so a stray `.set()` anywhere
 * downstream (the language package, an editor extension, …) would corrupt every later compile
 * that reuses that profile.
 *
 * Implemented as a genuine `Map` subclass (not a `Proxy`) so it stays a real `Map` for
 * `instanceof`, `Object.prototype.toString`, and deep-equality checks (test frameworks'
 * Map/Set comparisons rely on the internal `[[MapData]]` slot, which a `Proxy` around a
 * plain `Map` does not reliably expose to those algorithms). `get`, `has`, `size`, iteration,
 * `forEach`, `keys`, `values` and `entries` are unaffected — only the three mutators throw.
 */
// `Map`'s constructor populates the instance by calling `this.set(...)` for each entry, and
// that call happens *inside* `super(entries)`, before a private class field on the subclass
// would be initialized — so "am I sealed yet" can't live on `this`. A module-scoped `WeakSet`
// marks instances sealed only after their constructor returns.
const sealedInstances = new WeakSet<object>()

class SealedMap<K, V> extends Map<K, V> {
  constructor(entries: Iterable<readonly [K, V]>) {
    super(entries)
    sealedInstances.add(this)
  }

  override set(key: K, value: V): this {
    if (sealedInstances.has(this))
      throw new TypeError('ResolvedProfile lookup tables are read-only')
    return super.set(key, value)
  }

  override delete(key: K): boolean {
    if (sealedInstances.has(this))
      throw new TypeError('ResolvedProfile lookup tables are read-only')
    return super.delete(key)
  }

  override clear(): void {
    if (sealedInstances.has(this))
      throw new TypeError('ResolvedProfile lookup tables are read-only')
    super.clear()
  }
}

export function sealMap<K, V>(map: ReadonlyMap<K, V>): ReadonlyMap<K, V> {
  return new SealedMap(map)
}
