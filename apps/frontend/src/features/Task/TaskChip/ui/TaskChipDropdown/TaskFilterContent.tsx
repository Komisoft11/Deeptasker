import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './TaskChipDropdown.module.scss'

interface IFilterItem {
  uuid: number
  title: string
}

export const TaskFilterContent: FC = observer(() => {
  const { taskFilterStore } = useRootStore()
  const { t } = useTranslation()

  const changeActiveSort = (item: IFilterItem) => {
    const finishedTaskFilter =
      taskFilterStore.getActiveFilterByName('FINISH_DATE_FILTER')

    if (!finishedTaskFilter) {
      taskFilterStore.addActiveFilter({
        data: item.uuid,
        filterName: 'FINISH_DATE_FILTER',
        cb: function (task) {
          return !!task.dateFinished === !!this.data
        }
      })
    } else {
      if (finishedTaskFilter.data === item.uuid) {
        taskFilterStore.removeActiveFilterByProperty('FINISH_DATE_FILTER')
      } else {
        runInAction(() => {
          finishedTaskFilter.data = item.uuid
        })
      }
    }
  }
  const filterItems = useMemo<IFilterItem[]>(
    () => [
      { uuid: 1, title: 'task.taskStatus.completed' },
      { uuid: 0, title: 'task.taskStatus.uncompleted' }
    ],
    []
  )

  return (
    <>
      {filterItems.map((item) => (
        <button
          onClick={() => changeActiveSort(item)}
          key={item.uuid}
          className={styles.item}
        >
          {t(item.title)}
        </button>
      ))}
    </>
  )
})
