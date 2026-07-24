import { useMemo, useReducer } from 'react'


type MapInitialEntries<Key, Value> =
  | Iterable<readonly [Key, Value]>
  | (() => Iterable<readonly [Key, Value]>)

export interface IMapHook<Key, Value> {
  get: (key: Key) => Value | undefined
  set: (key: Key, value: Value) => IMapHook<Key, Value>
  has: (key: Key) => boolean
  delete: (key: Key) => boolean
  clear: () => void
  size: number
  forEach: (cb: (value: Value, key: Key) => void) => void
}

export function useMap<Key, Value>(
  initialEntries?: MapInitialEntries<Key, Value>
): IMapHook<Key, Value> {
  const [version, updateVersion] = useReducer((v) => v + 1, 0)

  const map = useMemo(() => {
    const entries =
      typeof initialEntries === 'function' ? initialEntries() : initialEntries
    return new Map(entries)
  }, [])

  return useMemo<IMapHook<Key, Value>>(() => {
    const actualMap = {
      get(key: Key) {
        return map.get(key)
      },
      set(key: Key, value: Value) {
        updateVersion()
        map.set(key, value)
        return actualMap
      },
      has(key: Key) {
        return map.has(key)
      },
      delete(key: Key) {
        updateVersion()
        return map.delete(key)
      },
      clear() {
        updateVersion()
        return map.clear()
      },
      forEach(cb: (value: Value, key: Key) => void) {
        map.forEach(cb)
      },
      get size() {
        return map.size
      }
    }

    return actualMap
  }, [map, version])
}

export function useSet<Value>(
  initialItems?: Iterable<Value> | (() => Iterable<Value>)
) {
  const [version, updateVersion] = useReducer((v) => v + 1, 0)

  const set = useMemo(() => {
    const entries =
      typeof initialItems === 'function' ? initialItems() : initialItems

    return new Set(entries)
  }, [])

  return useMemo(() => {
    const actualSet = {
      has(value: Value) {
        return set.has(value)
      },
      add(value: Value) {
        set.add(value)
        updateVersion()
        return actualSet
      },
      delete(value: Value) {
        updateVersion()
        return set.delete(value)
      },
      clear() {
        updateVersion()
        set.clear()
      },
      forEach(cb: (item: Value) => void) {
        set.forEach(cb)
      },
      get size() {
        return set.size
      }
    }

    return actualSet
  }, [set, version])
}
