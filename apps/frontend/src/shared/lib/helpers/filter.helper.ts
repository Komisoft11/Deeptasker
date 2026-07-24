import { toJSON } from 'yaml/util'

export type SortOrder = 'asc' | 'desc'

export interface ISorter<T> {
  property: keyof T
  sort: SortOrder
}

export interface IFilter<T, D extends any = any, FN extends string = string> {
  cb: (object: T) => boolean
  filterName: FN
  data?: D
}

export type StatusSorters<T> = Record<number, ISorter<T>>

export const FilterHelper = {
  genericSearch<T>(
    object: T,
    properties: Array<keyof T>,
    query: string
  ): boolean {
    if (query === '') {
      return true
    }

    return properties.some((property) => {
      const value = object[property]
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().toLowerCase().includes(query.toLowerCase())
      }
      return false
    })
  },
  multiPropertySort<T>(
    ...properties: Array<[keyof T, SortOrder]>
  ): (a: T, b: T) => number {
    return (a: T, b: T) => {
      for (const [property, order] of properties) {
        const result = FilterHelper.compareValues(
          a[property],
          b[property],
          order
        )
        if (result !== 0) {
          return result
        }
      }
      return 0
    }
    //Example: candidates.sort(multiPropertySort(['age', 'asc'], ['name', 'desc']))
  },

  compareValues<T>(a: T, b: T, order: SortOrder): number {
    if (a === null || a === undefined) {
      return b === null || b === undefined ? 0 : 1 // Если а равно null или undefined, а b равно null или undefined, то они равны; в противном случае а больше b.
    }
    if (b === null || b === undefined) {
      return -1 // Если b равно null или undefined, то a больше b.
    }
    if (a < b) {
      return order === 'asc' ? -1 : 1
    }
    if (a > b) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  },
  genericSort<T>(
    sort: [keyof T, SortOrder] | ISorter<T>
  ): (objectA: T, objectB: T) => number {
    return (objectA, objectB) => {
      let _property: keyof T
      let _order: SortOrder

      if (sort instanceof Array) {
        _property = sort[0]
        _order = sort[1]
      } else {
        _property = sort.property
        _order = sort.sort
      }

      const result = (property: keyof T) => {
        if (objectA[property] > objectB[property]) {
          return 1
        } else if (objectA[property] < objectB[property]) {
          return -1
        } else {
          return 0
        }
      }

      return _order === 'desc' ? result(_property) * -1 : result(_property)
    }
  },
  genericFilter<T>(object: T, filters: Array<IFilter<T>>) {
    if (filters.length === 0) {
      return true
    }
    return filters.every((filter) => {
      if (filter.data?.selectedDayFrom && filter.data?.selectedDayTo) {
        const dateCreated = toJSON(object)?.dateCreated
        return (
          filter.data?.selectedDayFrom < dateCreated &&
          dateCreated < filter.data?.selectedDayTo
        )
      } else {
        return filter.cb(object)
      }
    })
  }
}
