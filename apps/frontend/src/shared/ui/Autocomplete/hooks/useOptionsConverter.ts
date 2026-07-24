import { useMemo } from 'react'
import { ObjectTransformerHelper } from '@/shared/lib/helpers/object-transformer.helper'


export function useOptionsConverter<
  Item extends Object = Object,
  R extends Object = Object
>(items: Item[], mapping: Partial<Record<keyof Item, keyof R>>): R[] {
  return useMemo(() => {
    return ObjectTransformerHelper.transformArray<R, Item>(items, mapping)
  }, [items, mapping])
}
