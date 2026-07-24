import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Task } from '@/entities/Task'
import { TRANSLATION } from '@/shared/const/translation'
import { SortOrder } from '@/shared/lib/helpers/filter.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


interface ISortingItem {
  title: string
  property: Extract<keyof Task, string | number | Date>
}

interface IOrderItem {
  title: string
  sort: SortOrder
}

const useTaskFilter = () => {
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false)
  const [showOrderDropdown, setShowOrderDropdown] = useState<boolean>(false)
  const [activeSort, setActiveSort] =
    useState<Extract<keyof Task, string | number | Date>>('id')
  const [activeOrder, setActiveOrder] = useState<SortOrder>('desc')
  const { taskFilterStore } = useRootStore()
  const { t } = useTranslation(TRANSLATION)

  const sortingItems: ISortingItem[] = [
    { title: t('orderItems.default'), property: 'order' },
    { title: t('orderItems.priority'), property: 'priority' },
    { title: t('orderItems.dateCompleted'), property: 'dateFinished' },
    { title: t('orderItems.dateCreated'), property: 'dateCreated' }
  ]

  const orderItems: IOrderItem[] = [
    { title: t('orderItems.desc'), sort: 'desc' },
    { title: t('orderItems.asc'), sort: 'asc' }
  ]

  const changeActiveSort = (item: ISortingItem) => {
    setActiveSort(item.property)
    setShowSortDropdown(false)

    if (item.property === 'order') {
      taskFilterStore.activeSorters = [{ property: 'order', sort: 'asc' }]
    } else {
      taskFilterStore.activeSorters = [
        { property: item.property, sort: 'desc' }
      ]
    }
  }

  useEffect(() => {
    setActiveOrder(taskFilterStore.activeSorters[0].sort)
    setActiveSort(taskFilterStore.activeSorters[0].property)
  }, [taskFilterStore.activeSorters])

  const changeActiveOrder = (item: IOrderItem) => {
    setShowOrderDropdown(false)
    setActiveOrder(item.sort)

    // TODO::Надо бы что-то с этим сделать, работаем по ссылкам!
    const activeSorter = taskFilterStore.activeSorters[0]
    activeSorter.sort = item.sort
  }

  const getTitleSort = (
    property: Extract<keyof Task, string | number | Date>
  ): string => {
    const item =
      sortingItems.filter((item) => item.property === property)[0] ?? undefined
    if (!item) throw Error('not found title sort')
    return item.title
  }

  const getTitleOrder = (sort: SortOrder): string => {
    return sort === 'desc' ? t('orderItems.desc') : t('orderItems.asc')
  }

  return {
    sortingItems,
    orderItems,
    changeActiveSort,
    changeActiveOrder,
    getTitleOrder,
    getTitleSort,
    setShowOrderDropdown,
    setShowSortDropdown,
    showOrderDropdown,
    showSortDropdown,
    activeOrder,
    activeSort
  }
}

export default useTaskFilter
