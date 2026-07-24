import { action } from 'mobx'
import { useState } from 'react'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export enum Direction {
  Asc = 'asc',
  Desc = 'desc'
}

interface IReturn {
  sorter: SorterType
  sorterDirection: Direction
  handleSorterChange: (newSorter: SorterType) => void
  handleChangeSortDirection: () => void
  isDefaultSorter: boolean
}

export enum SorterType {
  Default = 'default',
  Priority = 'priority',
  DateCreated = 'dateCreated',
  DateDeadline = 'dateDeadline'
}

export const useSortView = (): IReturn => {
  const { taskFilterStore } = useRootStore()
  const [sorter, setSorter] = useState<SorterType>(SorterType.Default)
  const [sorterDirection, setSorterDirection] = useState<Direction>(
    Direction.Asc
  )

  const handleOrder = action(() => {
    taskFilterStore.activeSorters.forEach((activeSorter) => {
      activeSorter.sort =
        activeSorter.sort === Direction.Asc ? Direction.Desc : Direction.Asc
    })
  })

  const handleSetDefault = action((direction = Direction.Asc) => {
    taskFilterStore.activeSorters = [{ property: 'order', sort: direction }]
  })

  const handleSortByPriority = action((direction: Direction) => {
    taskFilterStore.activeSorters = [{ property: 'priority', sort: direction }]
  })

  const handleSortByCreationDate = action((direction: Direction) => {
    taskFilterStore.activeSorters = [
      { property: 'dateCreated', sort: direction }
    ]
  })

  const handleSortByDeadlineDate = action((direction: Direction) => {
    taskFilterStore.activeSorters = [
      { property: 'deadlineDate', sort: direction }
    ]
  })

  const sorterFunctions = {
    [SorterType.Default]: handleSetDefault,
    [SorterType.Priority]: handleSortByPriority,
    [SorterType.DateCreated]: handleSortByCreationDate,
    [SorterType.DateDeadline]: handleSortByDeadlineDate
  }

  const handleSorterChange = (newSorter: SorterType) => {
    setSorter(newSorter)
    sorterFunctions[newSorter](sorterDirection)
  }

  const handleChangeSortDirection = () => {
    if (sorter === SorterType.Default) return

    const newDirection =
      sorterDirection === Direction.Asc ? Direction.Desc : Direction.Asc
    setSorterDirection(newDirection)
    sorterFunctions[sorter](newDirection)
  }

  const isDefaultSorter = sorter === SorterType.Default

  return {
    sorter,
    sorterDirection,
    handleSorterChange,
    handleChangeSortDirection,
    isDefaultSorter
  }
}
