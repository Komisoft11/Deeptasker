import { useCallback } from 'react'
import { Task } from '@/entities/Task'
import { TaskFilterStore } from '@/entities/TaskFilter'
import { FilterHelper } from '@/shared/lib/helpers/filter.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface IReturn {
  filterTasks: (tasks: Task[]) => Task[]
  filterAndSortTasks: (tasks: Task[]) => Task[]
}

export const useFilterAndSortTaskFn = (): IReturn => {
  const { taskFilterStore } = useRootStore()

  const { activeFilters, activeSorters, queryTask } = taskFilterStore
  const { genericSort, genericSearch, genericFilter, multiPropertySort } =
    FilterHelper

  const filterTasks = useCallback(
    (tasks: Task[]) => {
      let filteredTasks = tasks

      if (queryTask) {
        filteredTasks = filteredTasks.filter((task) =>
          genericSearch<Task>(task, ['title', 'externalId'], queryTask)
        )
      }

      if (activeFilters.length > 0) {
        filteredTasks = filteredTasks.filter((task) =>
          genericFilter<Task>(task, activeFilters)
        )
      }

      return filteredTasks
    },
    [queryTask, activeFilters, genericSearch, genericFilter]
  )

  const sortTasks = useCallback(
    (tasks: Task[]) => {
      if (activeSorters.length === 1) {
        return tasks
          .slice()
          .sort(genericSort<Task>(activeSorters[0]))
          .sort(genericSort<Task>({ property: 'dateFinished', sort: 'asc' }))
      }

      const keys = TaskFilterStore.getKeysForMultiSort<Task>(activeSorters)

      return tasks
        .slice()
        .sort(multiPropertySort<Task>(...keys))
        .sort(genericSort<Task>({ property: 'dateFinished', sort: 'asc' }))
    },
    [activeSorters, genericSort, multiPropertySort]
  )

  return {
    filterTasks: useCallback(
      (tasks: Task[]) => {
        return filterTasks(tasks)
      },
      [filterTasks]
    ),
    filterAndSortTasks: useCallback(
      (tasks: Task[]) => {
        return sortTasks(filterTasks(tasks))
      },
      [filterTasks, sortTasks]
    )
  }
}
