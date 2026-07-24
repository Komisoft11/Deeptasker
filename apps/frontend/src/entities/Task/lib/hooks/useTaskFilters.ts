import dayjs from 'dayjs'
import { useSearchParams } from 'react-router'
import {
  BooleanFilterKeys,
  DateFilterKeys,
  IFilters,
  UnifiedFilterKeys,
  booleanFilterKeys,
  dateFilterKeys,
  filterMap,
  idFilterKeys
} from '@/entities/Task'
import { FilterKeys } from '@/entities/Task/const/filters'
import { DATE_FORMAT } from '@/shared/const/date_format'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

const isArrayOfNumbersAndNotEmpty = (array: unknown): array is number[] => {
  return (
    Array.isArray(array) &&
    array.length > 0 &&
    array.every((item) => typeof item === 'number')
  )
}

export const useTaskFilters = () => {
  const { taskFilterStore } = useRootStore()
  const [_, setFiltersURL] = useSearchParams()

  const updateFilters = (filters: IFilters) => {
    clearFilters()

    appendFilters(filters)
  }

  const setDateFilter = (key: DateFilterKeys, value: Date) => {
    setFiltersURL((params) => {
      params.delete(key)
      params.append(key, dayjs(value).format(DATE_FORMAT))
      return params
    })

    taskFilterStore.setDateFilter(key, value)
  }

  const setRangeDateFilter = (key: DateFilterKeys, value: [Date, Date]) => {
    setFiltersURL((params) => {
      params.delete(key)
      params.append(
        key,
        dayjs(value[0]).format(DATE_FORMAT) +
          ' ' +
          dayjs(value[1]).format(DATE_FORMAT)
      )
      return params
    })

    taskFilterStore.setRangeDateFilter(key, value)
  }

  const setIdFilter = (key: UnifiedFilterKeys, value: number[]) => {
    setFiltersURL((params) => {
      params.delete(key)
      value.forEach((id) => params.append(key, id.toString()))
      return params
    })

    taskFilterStore.setIdFilter(key, value)
  }

  const setBooleanFilter = (key: BooleanFilterKeys, value: unknown) => {
    if (value === true) {
      setFiltersURL((params) => {
        params.delete(key)
        params.append(key, value.toString())
        return params
      })

      taskFilterStore.setBooleanFilter(key, value)
    }
  }

  const clearFilters = () => {
    taskFilterStore.clear()
    setFiltersURL((params) => {
      params.forEach((_, key) => params.delete(key))
      return params
    })
  }

  const removeFilter = (key: FilterKeys) => {
    const filter = filterMap[key]

    taskFilterStore.removeActiveFiltersByNames([filter])

    setFiltersURL((params) => {
      params.delete(key)

      return params
    })
  }

  const appendFilters = (filters: IFilters) => {
    dateFilterKeys.forEach((key) => {
      const value = filters[key]

      if (value instanceof Array && value[0] && value[1]) {
        setRangeDateFilter(key, value as [Date, Date])
      }

      if (value instanceof Date) {
        setDateFilter(key, value)
      }
    })

    idFilterKeys.forEach((key) => {
      const value = filters[key]
      if (isArrayOfNumbersAndNotEmpty(value)) {
        setIdFilter(key, value)
      }
    })

    booleanFilterKeys.forEach((key) => {
      setBooleanFilter(key, filters[key])
    })
  }

  return {
    updateFilters,
    clearFilters,
    removeFilter,
    appendFilters
  }
}
