import { ChangeEvent, useState } from 'react'
import { FilterHelper } from '@/shared/lib/helpers/filter.helper'
import useDebounce from '@/shared/lib/hooks/useDebounce'

export function useInputSearch<I>(
  items: I[],
  keys: Array<Extract<keyof I, string | number>>,
  initQuery?: string
) {
  const [query, setQuery] = useState<string>(initQuery || '')
  const debounceQuery = useDebounce(query, 300)
  const { genericSearch } = FilterHelper
  const handleChangeInputSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const filterItems = debounceQuery
    ? items.filter((item) => genericSearch<I>(item, keys, debounceQuery))
    : items

  return {
    query,
    handleChangeInputSearch,
    filterItems
  }
}
