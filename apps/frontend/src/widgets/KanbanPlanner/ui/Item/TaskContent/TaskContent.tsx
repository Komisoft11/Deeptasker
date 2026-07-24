import classNames from 'classnames'
import dayjs from 'dayjs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TaskPriority } from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import { Task, usePermissionTask } from '@/entities/Task'
import { CardSize } from '@/entities/TaskPlanner'
import { FolderIcon } from '@/shared/assets/images/icons'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './TaskContent.module.scss'


interface Props {
  task: Task
}

export const TaskContent = ({ task }: Props) => {
  const {
    folderStore,
    taskPlanerStore: { cardSize },
    sprintStore
  } = useRootStore()
  const { t } = useTranslation([TRANSLATION])

  const isCompletedSprint = task.sprintId
    ? sprintStore.get(task.sprintId).status === SprintStatuses.Completed
    : false

  const isSmallSize = cardSize === CardSize.small

  const isDeadlineHidden = !isSmallSize && !isCompletedSprint

  const { canChangeDeadline } = usePermissionTask(task)

  const folder = task.folderId ? folderStore.get(task.folderId) : null

  return (
    <>
      {folder && (
        <div className='flex bg-hover rounded p-2 items-center gap-1 hover:bg-hoverOnHover body-14-16 w-max'>
          <FolderIcon className='icon w-4 h-4' />
          <p>{folder.title}</p>
        </div>
      )}
      {task.dateFinished && (
        <p className='secondaryText body-12'>
          {`${t('completed', { ns: TRANSLATION })}: ${dayjs(
            task.dateFinished
          ).format('DD.MM.YYYY')}`}
        </p>
      )}
      {!task.dateFinished && (
        <div className={'flex gap-1'}>
          <TaskPriority task={task} disabled={false} mode={'kanban'} />
          {isDeadlineHidden && (
            <DeadlineDate
              task={task}
              rootClassName={'w-max !rounded h-8'}
              classNameWrapper={classNames(
                styles.wrapper,
                !canChangeDeadline &&
                  '!border !border-hover hover:!bg-transparent'
              )}
              valueFormat={'DD.MM'}
              classNameInput={styles.input}
            />
          )}
        </div>
      )}
    </>
  )
}
