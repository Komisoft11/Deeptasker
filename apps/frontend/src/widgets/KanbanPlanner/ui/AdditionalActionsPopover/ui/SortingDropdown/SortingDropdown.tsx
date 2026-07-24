import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Direction } from '@/features/Sorting/lib/hooks/useSortView'
import {
  CaretDown,
  CaretUp,
  SortAsc,
  SortDesc
} from '@/shared/assets/images/icons'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './SortingDropdown.module.scss'

interface Props {
  statusId: number
}

export enum KanbanSorterType {
  Default = 'statusDateUpdated',
  Priority = 'priority',
  DateCreated = 'dateCreated',
  DateDeadline = 'deadlineDate',
  User = 'statusOrder'
}

export const SortingDropdown: FC<Props> = observer(({ statusId }) => {
  const { statusFilterStore } = useRootStore()

  const sorter = statusFilterStore.activeSorters[statusId]?.property
  const direction = statusFilterStore.activeSorters[statusId]?.sort

  const [isSorting, setIsSorting] = useState<boolean>()
  const { t } = useTranslation(TRANSLATION)

  const sortOptions = [
    { type: KanbanSorterType.Priority, label: 'orderItems.priority' },
    { type: KanbanSorterType.DateCreated, label: 'orderItems.dateCreated' },
    { type: KanbanSorterType.DateDeadline, label: 'orderItems.dateDeadline' }
  ]

  const toggleDropdown = () => setIsSorting(!isSorting)

  const handleSortChange = (type: KanbanSorterType) => {
    if (type === sorter) {
      return
    }

    statusFilterStore.setSorters(statusId, type)
  }

  const sorterLabel = t(
    sortOptions.find((opt) => opt.type === sorter)?.label || '...'
  )

  return (
    <div
      className={classNames(
        'flex flex-col border-hover rounded-lg',
        isSorting && 'bg-hover'
      )}
    >
      <div
        className={classNames(
          styles.trigger,
          !isSorting && 'hover:bg-hover',
          isSorting && 'border-b border-hover'
        )}
        onClick={toggleDropdown}
      >
        <div className='flex items-center'>
          <div className='p-2'>
            {direction === Direction.Asc ? (
              <SortAsc className='icon w-5 h-5' />
            ) : (
              <SortDesc className='icon w-5 h-5' />
            )}
          </div>
          <p className={'body-14-16 break-all'}>Сортировать по {sorterLabel}</p>
        </div>
        {!isSorting ? (
          <CaretDown className='icon w-5 h-5' />
        ) : (
          <CaretUp className='icon w-5 h-5' />
        )}
      </div>
      {isSorting && (
        <ul className='flex flex-col gap-1 p-1' role='listbox'>
          <li
            role='option'
            className={classNames(
              styles.item,
              'h-11',
              KanbanSorterType.Default === sorter &&
                classNames('bg-hover', styles.active),
              KanbanSorterType.Default !== sorter &&
                classNames('hover:bg-hover', styles.hovered)
            )}
            onClick={() => handleSortChange(KanbanSorterType.Default)}
          >
            <span className='body-14-16'>{t('Пользовательский порядок')}</span>
          </li>
          {sortOptions.map(({ type, label }) => (
            <li
              key={type}
              role='option'
              aria-selected={type === sorter}
              className={classNames(
                styles.item,
                'flex justify-between items-center',
                type === sorter && classNames('bg-hover', styles.active),
                type !== sorter && classNames('hover:bg-hover', styles.hovered)
              )}
              onClick={() => handleSortChange(type)}
            >
              <span className='body-14-16'>{t(label)}</span>
              <div className={styles.icons}>
                <div
                  className={classNames(
                    'iconContainer !px-3',
                    type === sorter && direction === Direction.Asc && 'bg-hover'
                  )}
                  onClick={() => {
                    statusFilterStore.setSorters(statusId, type, Direction.Asc)
                  }}
                >
                  <SortAsc className='icon w-5 h-5' />
                </div>
                <div
                  className={classNames(
                    'iconContainer !px-3',
                    type === sorter &&
                      direction === Direction.Desc &&
                      'bg-hover'
                  )}
                  onClick={() => {
                    statusFilterStore.setSorters(statusId, type, Direction.Desc)
                  }}
                >
                  <SortDesc className='icon w-5 h-5' />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
