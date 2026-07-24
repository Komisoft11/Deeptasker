import { ReactNode } from 'react'

type Column<T> = {
  id: string | keyof T
  header: () => ReactNode
  cell: (row: T) => ReactNode
  minSize?: number
  size?: number | string
  maxSize?: number
}

export const createColumnHelper = <T extends object>() => {
  return {
    accessor: (options: Column<T>) => ({
      ...options,
      header: options.header,
      cell: options.cell
    })
  }
}
