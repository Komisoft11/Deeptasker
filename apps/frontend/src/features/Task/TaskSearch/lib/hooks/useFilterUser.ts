import { FilterName, UserFilterData } from '@/entities/TaskFilter'
import { IUser } from '@/entities/User'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

const ASSIGNERS_FILTER = 'ASSIGNERS_FILTER'
// Тут будут еще другие фильтры

export const useFilterUser = (filterName: FilterName) => {
  const { taskFilterStore } = useRootStore()

  return (users: IUser[]) => {
    const assignerFilter =
      taskFilterStore.getActiveFilterByName<UserFilterData>(filterName)

    if (!assignerFilter) {
      taskFilterStore.addActiveFilter<UserFilterData>({
        data: users.map((u) => u.id),
        filterName: filterName,
        cb: function ({ executor }) {
          if (!this.data) return true

          return !!executor && this.data.includes(executor.id)
        }
      })
      return
    }

    if (users.length == 0) {
      taskFilterStore.removeActiveFilterByProperty(filterName)
      return
    }

    if (assignerFilter.data === undefined) {
      throw new Error('Ошибка фильтров')
    }

    assignerFilter.data = users.map((u) => u.id)
  }
}
